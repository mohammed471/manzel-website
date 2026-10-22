import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRICING,
  budgetFit,
  computeEstimate,
  estimateDuration,
  maxPlotAreaForBudget,
  normalizePricing,
  type EstimateInputs,
} from "@/lib/calculator";

const base: EstimateInputs = {
  build: "turnkey",
  designServices: [],
  plotArea: 200,
  facadeLength: 12,
  floors: 1,
  level: "mid",
  commercial: false,
  renovation: false,
  outsideKirkuk: false,
};
const estimate = (floors: number) => computeEstimate({ ...base, floors }, DEFAULT_PRICING);

describe("computeEstimate — floors", () => {
  it("one floor builds coverage% of the plot", () => {
    expect(estimate(1).builtArea).toBe(160);
  });

  it("a floor and a half builds 1.5 × the ground floor", () => {
    expect(estimate(1.5).builtArea).toBe(240);
  });

  it("a floor and a half costs more than one floor and less than two", () => {
    const [one, half, two] = [estimate(1), estimate(1.5), estimate(2)];
    expect(half.low).toBeGreaterThan(one.low);
    expect(half.low).toBeLessThan(two.low);
    expect(half.high).toBeGreaterThan(one.high);
    expect(half.high).toBeLessThan(two.high);
  });

  it("prices a floor and a half at the level's rate per built m²", () => {
    const line = estimate(1.5).lines.find((l) => l.key === "turnkey");
    expect(line).toMatchObject({ low: 240 * 300_000, high: 240 * 350_000 });
  });
});

describe("estimateDuration", () => {
  it("has no build time without construction or area", () => {
    expect(estimateDuration(null, 160, DEFAULT_PRICING.duration)).toBeNull();
    expect(estimateDuration("turnkey", 0, DEFAULT_PRICING.duration)).toBeNull();
  });

  it("matches the owner's reference: 200 m² plot, two floors, turnkey = 7 – 9 months", () => {
    const { builtArea } = estimate(2);
    expect(builtArea).toBe(320);
    expect(estimateDuration("turnkey", builtArea, DEFAULT_PRICING.duration)).toEqual({ low: 7, high: 9 });
  });

  it("turnkey takes structure + finishing, as a range", () => {
    expect(estimateDuration("turnkey", 160, DEFAULT_PRICING.duration)).toEqual({ low: 5, high: 7 });
    expect(estimateDuration("structure", 160, DEFAULT_PRICING.duration)).toEqual({ low: 3, high: 4 });
    expect(estimateDuration("finishing", 160, DEFAULT_PRICING.duration)).toEqual({ low: 3, high: 4 });
  });

  it("uses the internal app's factors", () => {
    const d = { ...DEFAULT_PRICING.duration, spread_pct: 20 };
    expect(estimateDuration("turnkey", 160, d)).toEqual({ low: 5, high: 6 });
    const slow = { ...d, structure: { base_months: 3, m2_per_month: 80 } };
    expect(estimateDuration("structure", 160, slow)).toEqual({ low: 5, high: 6 });
  });

  it("a zero pace from a bad save falls back to the default instead of infinity", () => {
    const broken = { ...DEFAULT_PRICING.duration, structure: { base_months: 1.5, m2_per_month: 0 } };
    expect(estimateDuration("structure", 160, broken)).toEqual({ low: 3, high: 4 });
  });

  it("grows with the built area", () => {
    expect(estimateDuration("turnkey", 320, DEFAULT_PRICING.duration)!.low).toBeGreaterThan(estimateDuration("turnkey", 160, DEFAULT_PRICING.duration)!.low);
  });
});

describe("budget", () => {
  it("classifies a range against the budget", () => {
    expect(budgetFit(50, 60, 60)).toBe("within");
    expect(budgetFit(50, 60, 55)).toBe("close");
    expect(budgetFit(50, 60, 49)).toBe("over");
  });

  it("finds the largest plot whose top estimate fits", () => {
    const budget = 100_000_000;
    const area = maxPlotAreaForBudget(base, DEFAULT_PRICING, budget, 50, 2000);
    expect(area).toBeGreaterThan(50);
    expect(computeEstimate({ ...base, plotArea: area }, DEFAULT_PRICING).high).toBeLessThanOrEqual(budget);
    expect(computeEstimate({ ...base, plotArea: area + 10 }, DEFAULT_PRICING).high).toBeGreaterThan(budget);
  });

  it("returns 0 when even the smallest plot is over budget, and the max when everything fits", () => {
    expect(maxPlotAreaForBudget(base, DEFAULT_PRICING, 1_000_000, 50, 2000)).toBe(0);
    expect(maxPlotAreaForBudget(base, DEFAULT_PRICING, 10_000_000_000, 50, 2000)).toBe(2000);
  });
});

describe("computeEstimate — kitchen", () => {
  const pricing = { ...DEFAULT_PRICING, kitchen: { economy: 3_000_000, mid: 5_000_000, luxury: 9_000_000 } };
  const line = (kitchen: boolean | undefined, build: EstimateInputs["build"] = "turnkey") =>
    computeEstimate({ ...base, build, kitchen }, pricing).lines.find((l) => l.key === build)!;

  it("includes the kitchen unless told otherwise", () => {
    expect(line(undefined)).toEqual(line(true));
  });

  it("takes the level's kitchen price off the turnkey and finishing lines", () => {
    expect(line(true).low - line(false).low).toBe(5_000_000);
    expect(line(true, "finishing").high - line(false, "finishing").high).toBe(5_000_000);
  });

  it("leaves the structure line alone", () => {
    expect(line(false, "structure")).toEqual(line(true, "structure"));
  });

  it("changes nothing while no kitchen price is set", () => {
    const off = computeEstimate({ ...base, kitchen: false }, DEFAULT_PRICING);
    expect(off.low).toBe(computeEstimate(base, DEFAULT_PRICING).low);
  });
});

describe("normalizePricing — calibration fields", () => {
  it("reads the number of projects the prices are based on, 0 when missing", () => {
    expect(normalizePricing({}).based_on_projects).toBe(0);
    expect(normalizePricing({ based_on_projects: 4 }).based_on_projects).toBe(4);
  });
});

// TODO(owner): recalibrate the prices from the executed projects' cost sheets, then un-skip.
// Portal sample house: 250 m² plot, 2 floors (400 m² built), mid, turnkey, in Kirkuk, no kitchen.
it.skip("matches the portal case: 188.7M with the fee, 7 months", () => {
  const i: EstimateInputs = { ...base, plotArea: 250, floors: 2, kitchen: false };
  const e = computeEstimate(i, DEFAULT_PRICING);
  expect(e.builtArea).toBe(400);
  expect(e.high).toBeGreaterThanOrEqual(188_700_000);
  expect(e.low).toBeLessThanOrEqual(188_700_000);
  expect(estimateDuration("turnkey", e.builtArea, DEFAULT_PRICING.duration)).toMatchObject({ low: 7 });
});
