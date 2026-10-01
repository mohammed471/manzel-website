// Cost calculator — pricing comes from the internal app
// (/api/public/calculator-pricing, edited at /admin/calculator-pricing).
// DEFAULT_PRICING mirrors core/db/calculator_pricing.py and is only used when
// the API is unreachable, so the calculator never breaks.

export type Level = "economy" | "mid" | "luxury";
export type BuildService = "turnkey" | "structure" | "finishing";
export type DesignService = "plans" | "interior_design" | "exterior_design";
export type Surcharge = "renovation" | "outside_kirkuk" | "commercial";

export interface Band {
  low: number;
  high: number;
}

export interface CalculatorPricing {
  coverage: number; // % of plot area that is built
  turnkey: Record<Level, Band>; // IQD per built m² — all-inclusive (kitchens, bathrooms, rooms)
  structure_share: number; // % of turnkey
  finishing_share: number; // % of turnkey
  plans: { base_usd: number; base_area: number; extra_usd_per_m2: number }; // on plot area
  interior_design_usd_per_m2: number; // per built m²
  facade_iqd_per_m: number; // per linear metre of facade
  company_fee: number; // % of execution cost (turnkey/structure/finishing), shown as its own line
  surcharges: Record<Surcharge, number>; // % added to the total
  duration: DurationFactors; // rough build time shown with the estimate
  area: AreaFactors; // area & quantities calculator
  usd_rate: number; // IQD per USD — the internal app's exchange-rate setting
}

/** Build-time factors — edited in the internal app. Months = base + built m² ÷ pace. */
export interface DurationFactors {
  structure: { base_months: number; m2_per_month: number };
  finishing: { base_months: number; m2_per_month: number };
  spread_pct: number; // widens the result into a range: 7 months + 25% → "7 – 9"
}

export const TILE_SIZES = ["60x60", "60x120", "80x80", "120x120", "30x60", "25x40"] as const;
export type TileSize = (typeof TILE_SIZES)[number];

/** Quantity factors for the area calculator — edited in the internal app. */
export interface AreaFactors {
  waste_pct: number;
  tile_pieces_per_box: Record<TileSize, number>;
  adhesive_kg_per_m2: number;
  adhesive_bag_kg: number;
  grout_kg_per_m2: number;
  grout_bag_kg: number;
  silicone_tubes_per_wet_room: number;
  paint_m2_per_gallon: number;
  paint_coats: number;
  door_m2: number;
  window_m2: number;
  bathroom_tile_height: number;
  kitchen_tile_height: number;
}

export const LEVELS: Level[] = ["economy", "mid", "luxury"];
export const DESIGN_SERVICES: DesignService[] = ["plans", "interior_design", "exterior_design"];

const band = (low: number, high: number): Band => ({ low, high });

export const DEFAULT_PRICING: CalculatorPricing = {
  coverage: 80,
  turnkey: { economy: band(250_000, 300_000), mid: band(300_000, 350_000), luxury: band(350_000, 425_000) },
  structure_share: 45,
  finishing_share: 55,
  plans: { base_usd: 100, base_area: 200, extra_usd_per_m2: 1 },
  interior_design_usd_per_m2: 5,
  facade_iqd_per_m: 25_000,
  company_fee: 10,
  surcharges: { renovation: 15, outside_kirkuk: 10, commercial: 15 },
  // Owner's reference: 200 m² plot, two floors (320 m² built), turnkey = 7 – 9 months.
  duration: {
    structure: { base_months: 1.5, m2_per_month: 160 },
    finishing: { base_months: 1.5, m2_per_month: 160 },
    spread_pct: 25,
  },
  area: {
    waste_pct: 10,
    tile_pieces_per_box: { "60x60": 4, "60x120": 2, "80x80": 2, "120x120": 1, "30x60": 8, "25x40": 15 },
    adhesive_kg_per_m2: 5,
    adhesive_bag_kg: 25,
    grout_kg_per_m2: 0.5,
    grout_bag_kg: 5,
    silicone_tubes_per_wet_room: 2,
    paint_m2_per_gallon: 12,
    paint_coats: 2,
    door_m2: 2,
    window_m2: 1.8,
    bathroom_tile_height: 2.4,
    kitchen_tile_height: 1.2,
  },
  usd_rate: 1500,
};

export interface EstimateInputs {
  build: BuildService | null;
  designServices: DesignService[];
  plotArea: number; // m²
  facadeLength: number; // linear metres, used by exterior design
  floors: number;
  level: Level;
  commercial: boolean;
  renovation: boolean;
  outsideKirkuk: boolean;
}

export type LineKey = BuildService | DesignService | "company_fee";

export interface EstimateLine {
  key: LineKey;
  low: number;
  high: number;
}

export interface Estimate {
  builtArea: number;
  lines: EstimateLine[];
  surchargePct: number; // combined, e.g. 26.5 for +15% then +10%
  low: number;
  high: number;
}

// Big lines round to 100,000 IQD; small ones (plans, facade) to 5,000 so they
// don't collapse to 0 or jump by 100k.
const round = (n: number) => {
  const step = n >= 5_000_000 ? 100_000 : 5_000;
  return Math.round(n / step) * step;
};

export function computeEstimate(i: EstimateInputs, p: CalculatorPricing): Estimate {
  const builtArea = Math.max(0, Math.round(i.plotArea * (p.coverage / 100) * Math.max(1, i.floors)));
  const lines: EstimateLine[] = [];

  if (i.build) {
    const share = i.build === "turnkey" ? 1 : (i.build === "structure" ? p.structure_share : p.finishing_share) / 100;
    const rate = p.turnkey[i.level];
    lines.push({ key: i.build, low: builtArea * rate.low * share, high: builtArea * rate.high * share });
  }
  for (const s of i.designServices) {
    let cost = 0;
    if (s === "plans") {
      const extra = Math.max(0, i.plotArea - p.plans.base_area) * p.plans.extra_usd_per_m2;
      cost = (p.plans.base_usd + extra) * p.usd_rate;
    } else if (s === "interior_design") {
      cost = builtArea * p.interior_design_usd_per_m2 * p.usd_rate;
    } else {
      cost = Math.max(0, i.facadeLength) * p.facade_iqd_per_m;
    }
    lines.push({ key: s, low: cost, high: cost });
  }

  const factor =
    (i.renovation ? 1 + p.surcharges.renovation / 100 : 1) *
    (i.outsideKirkuk ? 1 + p.surcharges.outside_kirkuk / 100 : 1) *
    (i.commercial ? 1 + p.surcharges.commercial / 100 : 1);

  // Surcharges apply to every line so the breakdown adds up to the total.
  const adjusted = lines.map((l) => ({ ...l, low: round(l.low * factor), high: round(l.high * factor) }));

  // Company / supervision fee: a share of the execution cost only (not plans/design).
  const execution = adjusted.find((l) => l.key === "turnkey" || l.key === "structure" || l.key === "finishing");
  if (execution && p.company_fee > 0) {
    adjusted.push({
      key: "company_fee",
      low: round(execution.low * (p.company_fee / 100)),
      high: round(execution.high * (p.company_fee / 100)),
    });
  }
  return {
    builtArea,
    lines: adjusted,
    surchargePct: Math.round((factor - 1) * 1000) / 10,
    low: adjusted.reduce((s, l) => s + l.low, 0),
    high: adjusted.reduce((s, l) => s + l.high, 0),
  };
}

// Rough build time, from the internal app's `duration` factors. Months = fixed
// start-up time + built area ÷ pace; turnkey is structure then finishing.
export function estimateDuration(
  build: BuildService | null,
  builtArea: number,
  d: DurationFactors,
): { low: number; high: number } | null {
  if (!build || builtArea <= 0) return null;
  const months = (stage: "structure" | "finishing") => {
    // A zero pace would give an infinite build time — fall back to the default.
    const pace = d[stage].m2_per_month > 0 ? d[stage].m2_per_month : DEFAULT_PRICING.duration[stage].m2_per_month;
    return d[stage].base_months + builtArea / pace;
  };
  const total = build === "turnkey" ? months("structure") + months("finishing") : months(build);
  const low = Math.max(1, Math.round(total));
  // (100 + pct) / 100 last, so 5 months + 20% is exactly 6, not 6.000000000000001 → 7.
  return { low, high: Math.ceil((low * (100 + d.spread_pct)) / 100) };
}

export type BudgetFit = "within" | "close" | "over";

/** Within = even the top of the range fits; close = only the bottom does. */
export function budgetFit(low: number, high: number, budget: number): BudgetFit {
  return high <= budget ? "within" : low <= budget ? "close" : "over";
}

/**
 * Largest plot area (in `step` m² increments between min and max) whose
 * estimate stays within the budget even at the top of its range. 0 = even the
 * smallest plot is over budget.
 */
export function maxPlotAreaForBudget(
  i: EstimateInputs,
  p: CalculatorPricing,
  budget: number,
  min: number,
  max: number,
  step = 10,
): number {
  const fits = (plotArea: number) => computeEstimate({ ...i, plotArea }, p).high <= budget;
  if (!fits(min)) return 0;
  let lo = 0;
  let hi = Math.floor((max - min) / step);
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(min + mid * step)) lo = mid;
    else hi = mid - 1;
  }
  return min + lo * step;
}

// Western digits in both locales — matches the rest of the site (stats, prices).
const millionsFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const numberFmt = new Intl.NumberFormat("en-US");

/** 45,500,000 → "45.5" (millions, max one decimal). */
export function toMillions(value: number): string {
  return millionsFmt.format(value / 1_000_000);
}

/** Line amounts: ≥ 1M in millions, smaller ones in thousands (155,000 → "155"). */
export function splitAmount(value: number): { unit: "m" | "k"; text: string } {
  return value >= 1_000_000
    ? { unit: "m", text: toMillions(value) }
    : { unit: "k", text: numberFmt.format(Math.round(value / 1000)) };
}

/** 350000 → "350,000" */
export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

/** Shallow-validates API data; anything off falls back to the defaults. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePricing(raw: any): CalculatorPricing {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merge = (def: any, val: any): any => {
    if (typeof def === "object" && def !== null) {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(def)) out[k] = merge(def[k], val?.[k]);
      return out;
    }
    return typeof val === "number" && Number.isFinite(val) && val >= 0 ? val : def;
  };
  return merge(DEFAULT_PRICING, raw);
}
