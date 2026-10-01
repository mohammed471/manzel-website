"use client";

import { useMemo, useState } from "react";
import { Explain, OfferForm, OptionCard, Section, Segmented } from "@/components/calc/CalcUI";
import { useTranslations } from "next-intl";
import {
  Building2,
  HardHat,
  KeyRound,
  PaintRoller,
  PencilRuler,
  Ruler,
  Sofa,
  Trees,
  Check,
  Clock,
  X,
  MessageCircle,
  CalendarCheck,
  Send,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  DESIGN_SERVICES,
  LEVELS,
  budgetFit,
  computeEstimate,
  estimateDuration,
  formatNumber,
  maxPlotAreaForBudget,
  splitAmount,
  toMillions,
  type BudgetFit,
  type BuildService,
  type CalculatorPricing,
  type EstimateInputs,
  type DesignService,
  type Level,
} from "@/lib/calculator";
import { cn } from "@/lib/utils";


const BUILD_OPTIONS: { key: BuildService; icon: LucideIcon }[] = [
  { key: "turnkey", icon: Building2 },
  { key: "structure", icon: HardHat },
  { key: "finishing", icon: PaintRoller },
];
const DESIGN_ICONS: Record<DesignService, LucideIcon> = { plans: Ruler, interior_design: Sofa, exterior_design: Trees };
const LINE_LABEL: Record<string, string> = {
  turnkey: "build_turnkey",
  structure: "build_structure",
  finishing: "build_finishing",
  plans: "svc_plans",
  interior_design: "svc_interior_design",
  exterior_design: "svc_exterior_design",
  company_fee: "company_fee",
};

// "Where are you starting from?" — one tap sets the services for visitors who
// don't know which ones they need. They can still change every option below.
const PRESETS: { key: string; icon: LucideIcon; build: BuildService | null; design: DesignService[] }[] = [
  { key: "new", icon: KeyRound, build: "turnkey", design: ["plans"] },
  { key: "finish", icon: PaintRoller, build: "finishing", design: [] },
  { key: "design", icon: PencilRuler, build: null, design: ["plans", "interior_design", "exterior_design"] },
];

const MIN_AREA = 50;
const MAX_AREA = 2000;
const COMMON_AREAS = [100, 150, 200, 250, 300];
const FLOOR_OPTIONS = [1, 1.5, 2, 3, 4];
const NEXT_STEPS = [1, 2, 3];
const FIT_STYLE: Record<BudgetFit, string> = {
  within: "bg-success/10 text-success",
  close: "bg-secondary text-text-primary",
  over: "bg-accent/10 text-accent",
};

// Lists and help texts are one string with an item per line, editable in the
// internal app — a blank line or a stray \r must not become an empty bullet.
const textLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

// Single-page cost calculator: every choice updates the estimate instantly.
// Prices come from the internal app (see lib/calculator.ts).
export default function Calculator({ pricing }: { pricing: CalculatorPricing }) {
  const t = useTranslations("calculator");
  const tSite = useTranslations("site");

  const [build, setBuild] = useState<BuildService | null>("turnkey");
  const [designServices, setDesignServices] = useState<DesignService[]>([]);
  const [plotArea, setPlotArea] = useState(200);
  const [facadeLength, setFacadeLength] = useState(12);
  const [floors, setFloors] = useState(1);
  const [level, setLevel] = useState<Level>("mid");
  const [commercial, setCommercial] = useState(false);
  const [renovation, setRenovation] = useState(false);
  const [outsideKirkuk, setOutsideKirkuk] = useState(false);
  const [dimsOpen, setDimsOpen] = useState(false);
  const [plotLength, setPlotLength] = useState(0);
  const [plotWidth, setPlotWidth] = useState(0);
  const [budgetM, setBudgetM] = useState(0); // millions of IQD, 0 = not set

  const inputs: EstimateInputs = { build, designServices, plotArea, facadeLength, floors, level, commercial, renovation, outsideKirkuk };
  const estimate = useMemo(
    () => computeEstimate(inputs, pricing),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [build, designServices, plotArea, facadeLength, floors, level, commercial, renovation, outsideKirkuk, pricing],
  );
  const hasResult = estimate.lines.length > 0;
  // Design-only estimates have no range (low === high): show one number, in
  // thousands when it is under a million, instead of "2.3 – 2.3".
  const single = estimate.low === estimate.high ? splitAmount(estimate.high) : null;
  const rangeText = single
    ? t(single.unit === "m" ? "total_m" : "total_k", { value: single.text })
    : t("range_text", { low: toMillions(estimate.low), high: toMillions(estimate.high) });
  const duration = estimateDuration(build, estimate.builtArea, pricing.duration);

  // Same project at each finish level — only construction depends on the level.
  const levelTotals = build ? LEVELS.map((l) => ({ level: l, ...computeEstimate({ ...inputs, level: l }, pricing) })) : [];
  const maxLevelHigh = Math.max(1, ...levelTotals.map((x) => x.high));

  const budget = budgetM * 1_000_000;
  const showBudget = budget > 0 && hasResult;
  const budgetArea = showBudget ? maxPlotAreaForBudget(inputs, pricing, budget, MIN_AREA, MAX_AREA) : 0;
  const budgetBuilt = computeEstimate({ ...inputs, plotArea: budgetArea }, pricing).builtArea;

  const lineLabel = (key: string) => t(LINE_LABEL[key], { pct: pricing.company_fee });
  const hasFacade = designServices.includes("exterior_design");
  const summary = [
    t("sum_services", { list: estimate.lines.map((l) => lineLabel(l.key)).join("، ") }),
    t("sum_size", { plot: formatNumber(plotArea), floors, built: formatNumber(estimate.builtArea) }),
    ...(hasFacade ? [t("sum_facade", { length: formatNumber(facadeLength) })] : []),
    t("sum_level", { level: t(`level_${level}`) }),
    [commercial ? t("commercial") : t("residential"), renovation ? t("renovation") : t("new_build"), outsideKirkuk ? t("outside_kirkuk") : t("in_kirkuk")].join(" — "),
  ].join("\n");
  const whatsappUrl = `https://wa.me/${tSite("whatsapp")}?text=${encodeURIComponent(t("whatsapp_message", { summary, range: rangeText }))}`;

  const toggleDesign = (s: DesignService) =>
    setDesignServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const clampArea = (v: number) => Math.min(MAX_AREA, Math.max(0, Math.round(v || 0)));
  const isPreset = (p: (typeof PRESETS)[number]) =>
    build === p.build && designServices.length === p.design.length && p.design.every((s) => designServices.includes(s));
  const setDims = (length: number, width: number) => {
    setPlotLength(length);
    setPlotWidth(width);
    if (length > 0 && width > 0) setPlotArea(clampArea(length * width));
  };
  const dimInput =
    "w-24 h-11 rounded-xl border border-secondary-dark/60 bg-white px-3 text-base font-bold text-primary tabular-nums focus:outline-none focus:border-primary";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-10 items-start">
      {/* ── Options ── */}
      <div className="space-y-5 md:space-y-6">
        <Section title={t("s_start")} hint={t("s_start_hint")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label={t("s_start")}>
            {PRESETS.map((p) => (
              <OptionCard
                key={p.key}
                role="radio"
                selected={isPreset(p)}
                onClick={() => {
                  setBuild(p.build);
                  setDesignServices(p.design);
                }}
                icon={p.icon}
                title={t(`start_${p.key}`)}
                desc={t(`start_${p.key}_desc`)}
              />
            ))}
          </div>
        </Section>

        <Section title={t("s_services")} hint={t("s_services_hint")}>
          <p className="mb-3 text-xs font-bold text-text-secondary">{t("build_label")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label={t("build_label")}>
            {BUILD_OPTIONS.map(({ key, icon }) => (
              <OptionCard
                key={key}
                role="radio"
                selected={build === key}
                onClick={() => setBuild(build === key ? null : key)}
                icon={icon}
                title={t(`build_${key}`)}
                desc={t(`build_${key}_desc`)}
              />
            ))}
          </div>
          <p className="mt-6 mb-3 text-xs font-bold text-text-secondary">{t("design_label")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DESIGN_SERVICES.map((s) => (
              <OptionCard
                key={s}
                role="checkbox"
                selected={designServices.includes(s)}
                onClick={() => toggleDesign(s)}
                icon={DESIGN_ICONS[s]}
                title={t(`svc_${s}`)}
                desc={t(`svc_${s}_desc`)}
              />
            ))}
          </div>
          {hasFacade && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-secondary-light px-4 py-3">
              <label htmlFor="facade-length" className="text-sm font-bold text-text-primary">
                {t("facade_length")}
              </label>
              <input
                id="facade-length"
                type="number"
                inputMode="decimal"
                min={1}
                max={200}
                value={facadeLength || ""}
                onChange={(e) => setFacadeLength(Math.min(200, Math.max(0, Number(e.target.value) || 0)))}
                className="w-24 h-11 rounded-xl border border-secondary-dark/60 bg-white px-3 text-base font-bold text-primary tabular-nums focus:outline-none focus:border-primary"
              />
              <span className="text-sm text-text-secondary">{t("facade_unit")}</span>
              <span className="basis-full text-xs text-text-secondary">{t("facade_hint")}</span>
            </div>
          )}
          <Explain className="mt-5" label={t("explain")} lines={textLines(t("help_services"))} />
        </Section>

        <Section title={t("s_size")}>
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:gap-8">
            <div>
              <label htmlFor="plot-area" className="text-sm font-bold text-text-primary">
                {t("plot_area")}
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="plot-area"
                  type="number"
                  inputMode="numeric"
                  min={MIN_AREA}
                  max={MAX_AREA}
                  value={plotArea || ""}
                  onChange={(e) => setPlotArea(clampArea(Number(e.target.value)))}
                  className="w-32 h-12 rounded-xl border border-secondary-dark/60 bg-white px-3 text-lg font-bold text-primary tabular-nums focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <span className="text-sm text-text-secondary">{t("area_unit")}</span>
              </div>
              <input
                type="range"
                min={MIN_AREA}
                max={MAX_AREA}
                step={10}
                value={Math.max(MIN_AREA, plotArea)}
                onChange={(e) => setPlotArea(Number(e.target.value))}
                aria-label={t("plot_area")}
                className="mt-4 w-full accent-primary cursor-pointer"
              />
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("area_presets")}>
                {COMMON_AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={plotArea === a}
                    onClick={() => setPlotArea(a)}
                    className={cn(
                      "h-10 rounded-full border px-4 text-sm font-bold tabular-nums transition-colors cursor-pointer",
                      plotArea === a
                        ? "border-primary bg-primary text-white"
                        : "border-secondary-dark/60 bg-white text-text-secondary hover:border-primary/40 hover:text-primary",
                    )}
                  >
                    {a} {t("area_unit")}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-expanded={dimsOpen}
                onClick={() => setDimsOpen(!dimsOpen)}
                className="mt-3 text-sm font-bold text-accent underline underline-offset-4 cursor-pointer"
              >
                {t("area_unknown")}
              </button>
              {dimsOpen && (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl bg-secondary-light px-4 py-3">
                  <label className="block">
                    <span className="text-xs font-bold text-text-primary">
                      {t("plot_length")} ({t("length_unit")})
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={plotLength || ""}
                      onChange={(e) => setDims(Math.max(0, Number(e.target.value) || 0), plotWidth)}
                      className={cn(dimInput, "mt-1 block")}
                    />
                  </label>
                  <span className="pb-2.5 text-lg font-bold text-text-secondary" aria-hidden="true">
                    ×
                  </span>
                  <label className="block">
                    <span className="text-xs font-bold text-text-primary">
                      {t("plot_width")} ({t("length_unit")})
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      value={plotWidth || ""}
                      onChange={(e) => setDims(plotLength, Math.max(0, Number(e.target.value) || 0))}
                      className={cn(dimInput, "mt-1 block")}
                    />
                  </label>
                  <span className="basis-full text-xs text-text-secondary">{t("area_dims_hint")}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{t("floors")}</p>
              <Segmented
                className="mt-2"
                value={floors}
                onChange={setFloors}
                options={FLOOR_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
                ariaLabel={t("floors")}
              />
            </div>
          </div>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 rounded-2xl bg-secondary-light px-4 py-3 text-sm">
            <span className="font-bold text-primary">
              {t("built_area")}: {formatNumber(estimate.builtArea)} {t("area_unit")}
            </span>
            <span className="text-text-secondary">({t("built_area_hint", { coverage: pricing.coverage, floors })})</span>
            {floors === 1.5 && <span className="basis-full text-xs text-text-secondary">{t("floors_half_hint")}</span>}
          </p>
          <Explain className="mt-3" label={t("explain")} lines={textLines(t("help_size", { coverage: pricing.coverage }))} />
        </Section>

        <Section title={t("s_level")}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label={t("s_level")}>
            {LEVELS.map((l) => {
              const selected = level === l;
              return (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-4 text-start transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    selected ? "border-primary bg-primary text-white" : "border-secondary-dark/60 bg-white hover:border-primary/40",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold">{t(`level_${l}`)}</span>
                    {selected && <Check className="w-4 h-4" strokeWidth={3} />}
                  </span>
                  <span className={cn("mt-2 text-xs leading-relaxed", selected ? "text-white/75" : "text-text-secondary")}>
                    {t(`level_${l}_desc`)}
                  </span>
                </button>
              );
            })}
          </div>
          {levelTotals.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-text-primary">{t("compare_title")}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{t("compare_hint")}</p>
              <ul className="mt-3 space-y-2">
                {levelTotals.map((x) => (
                  <li
                    key={x.level}
                    className={cn(
                      "rounded-2xl border px-4 py-3",
                      x.level === level ? "border-primary bg-primary/[0.05]" : "border-secondary-dark/40",
                    )}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm font-bold text-text-primary">{t(`level_${x.level}`)}</span>
                      <span className="text-sm font-bold text-primary tabular-nums">
                        {t("amount_m", { value: `${toMillions(x.low)} – ${toMillions(x.high)}` })}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-secondary-dark/40" aria-hidden="true">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(x.high / maxLevelHigh) * 100}%` }} />
                    </div>
                    {showBudget && (
                      <span
                        className={cn(
                          "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
                          FIT_STYLE[budgetFit(x.low, x.high, budget)],
                        )}
                      >
                        {t(`fit_${budgetFit(x.low, x.high, budget)}`)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Explain className="mt-5" label={t("explain")} lines={textLines(t("help_level"))} />
        </Section>

        <Section title={t("s_details")}>
          <div className="flex flex-wrap gap-3">
            <Segmented
              value={commercial}
              onChange={setCommercial}
              options={[{ value: false, label: t("residential") }, { value: true, label: t("commercial") }]}
              ariaLabel={`${t("residential")} / ${t("commercial")}`}
            />
            <Segmented
              value={renovation}
              onChange={setRenovation}
              options={[{ value: false, label: t("new_build") }, { value: true, label: t("renovation") }]}
              ariaLabel={`${t("new_build")} / ${t("renovation")}`}
            />
            <Segmented
              value={outsideKirkuk}
              onChange={setOutsideKirkuk}
              options={[{ value: false, label: t("in_kirkuk") }, { value: true, label: t("outside_kirkuk") }]}
              ariaLabel={`${t("in_kirkuk")} / ${t("outside_kirkuk")}`}
            />
          </div>
        </Section>

        <Section title={t("s_budget")} hint={t("s_budget_hint")}>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="budget" className="text-sm font-bold text-text-primary">
              {t("budget_label")}
            </label>
            <input
              id="budget"
              type="number"
              inputMode="decimal"
              min={0}
              value={budgetM || ""}
              onChange={(e) => setBudgetM(Math.max(0, Number(e.target.value) || 0))}
              className="w-28 h-12 rounded-xl border border-secondary-dark/60 bg-white px-3 text-lg font-bold text-primary tabular-nums focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <span className="text-sm text-text-secondary">{t("millions")}</span>
          </div>
          {showBudget && (
            <div className="mt-4 space-y-2 rounded-2xl bg-secondary-light px-4 py-3 text-sm" role="status">
              <p>
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
                    FIT_STYLE[budgetFit(estimate.low, estimate.high, budget)],
                  )}
                >
                  {t(`fit_${budgetFit(estimate.low, estimate.high, budget)}`)}
                </span>{" "}
                <span className="text-text-primary">{t(`budget_${budgetFit(estimate.low, estimate.high, budget)}`)}</span>
              </p>
              {budgetArea > 0 ? (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-text-secondary">
                  {t("budget_max_area", { area: formatNumber(budgetArea), built: formatNumber(budgetBuilt) })}
                  {budgetArea !== plotArea && (
                    <button
                      type="button"
                      onClick={() => setPlotArea(budgetArea)}
                      className="h-9 rounded-full border border-primary/25 px-4 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                    >
                      {t("budget_apply")}
                    </button>
                  )}
                </p>
              ) : (
                <p className="text-text-secondary">{t("budget_too_low")}</p>
              )}
            </div>
          )}
        </Section>

        {build && (
          <Section title={t("s_includes")} hint={t(`build_${build}`)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm font-bold text-primary">{t("includes_title")}</p>
                <ul className="mt-2 space-y-2 text-sm text-text-primary">
                  {textLines(t(`includes_${build}`)).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 w-4 h-4 shrink-0 text-success" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-accent">{t("excludes_title")}</p>
                <ul className="mt-2 space-y-2 text-sm text-text-secondary">
                  {textLines(t("excludes")).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="mt-0.5 w-4 h-4 shrink-0 text-accent" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">{t("includes_note")}</p>
          </Section>
        )}

        <Section title={t("s_next")}>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NEXT_STEPS.map((n) => (
              <li key={n} className="flex items-start gap-3 sm:block">
                <span className="flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white tabular-nums">
                  {n}
                </span>
                <span className="min-w-0 sm:mt-3 sm:block">
                  <span className="block text-sm font-bold text-text-primary">{t(`next_${n}_title`)}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">{t(`next_${n}_desc`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* ── Result ── */}
      <aside id="estimate" className="lg:sticky lg:top-28 scroll-mt-24">
        <ResultCard
          hasResult={hasResult}
          estimate={estimate}
          duration={duration}
          lineLabel={lineLabel}
          whatsappUrl={whatsappUrl}
          leadMessage={t("lead_message", { summary, range: rangeText })}
        />
      </aside>

      {/* ── Mobile price bar (sits above MobileBottomNav) ── */}
      <a
        href="#estimate"
        className="calc-mobile-bar lg:hidden fixed inset-x-3 z-40 flex items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-white shadow-[0_10px_30px_-10px_rgba(14,42,39,0.6)]"
        style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
      >
        <span className="min-w-0">
          <span className="block text-[11px] text-white/70">{t("result_title")}</span>
          <span className="block truncate text-base font-bold tabular-nums">
            {hasResult ? rangeText : "—"}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
          {t("view_breakdown")}
          <ChevronUp className="w-3.5 h-3.5" />
        </span>
      </a>
    </div>
  );
}

function ResultCard({
  hasResult,
  estimate,
  duration,
  lineLabel,
  whatsappUrl,
  leadMessage,
}: {
  hasResult: boolean;
  estimate: ReturnType<typeof computeEstimate>;
  duration: ReturnType<typeof estimateDuration>;
  lineLabel: (key: string) => string;
  whatsappUrl: string;
  leadMessage: string;
}) {
  const t = useTranslations("calculator");
  const [offerOpen, setOfferOpen] = useState(false);
  const single = estimate.low === estimate.high ? splitAmount(estimate.high) : null;

  // "96 – 112 مليون" / "155 ألف" — one unit per line, the smaller value's unit
  // follows the larger so a range never mixes units.
  const formatLine = (low: number, high: number) => {
    const hi = splitAmount(high);
    const lo = hi.unit === "m" ? toMillions(low) : splitAmount(low).text;
    const text = low === high ? hi.text : `${lo} – ${hi.text}`;
    return t(hi.unit === "m" ? "amount_m" : "amount_k", { value: text });
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white border border-secondary-dark/40">
      <div className="bg-primary px-6 py-6 text-white">
        <p className="text-sm text-white/70">{t("result_title")}</p>
        {hasResult ? (
          <>
            <p className="mt-2 text-3xl md:text-4xl font-bold tabular-nums leading-tight">
              {single ? single.text : `${toMillions(estimate.low)} – ${toMillions(estimate.high)}`}
            </p>
            <p className="mt-1 text-sm text-white/80">{t(single?.unit === "k" ? "thousands" : "millions")}</p>
          </>
        ) : (
          <p className="mt-3 text-sm text-white/80">{t("result_empty")}</p>
        )}
      </div>

      {hasResult && (
        <div className="px-6 pt-5">
          <p className="text-xs font-bold text-text-secondary">{t("breakdown")}</p>
          <ul className="mt-3 divide-y divide-secondary-dark/40">
            {estimate.lines.map((l) => (
              <li key={l.key} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <span className="text-text-primary">{lineLabel(l.key)}</span>
                <span className="shrink-0 font-bold text-primary tabular-nums">{formatLine(l.low, l.high)}</span>
              </li>
            ))}
          </ul>
          {duration && (
            <p className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-secondary-light px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-text-primary">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                {t("duration")}
              </span>
              <span className="shrink-0 font-bold text-primary tabular-nums">{t("duration_months", duration)}</span>
            </p>
          )}
        </div>
      )}

      <div className="p-6 space-y-3">
        <p className="text-xs leading-relaxed text-text-secondary">{t("disclaimer")}</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!hasResult}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white transition-colors hover:bg-[#20BD5A]",
            !hasResult && "pointer-events-none opacity-50",
          )}
        >
          <MessageCircle className="w-4 h-4" />
          {t("whatsapp_cta")}
        </a>
        {offerOpen ? (
          <OfferForm message={leadMessage} onClose={() => setOfferOpen(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setOfferOpen(true)}
            disabled={!hasResult}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-full border border-primary/25 px-5 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {t("offer_cta")}
          </button>
        )}
        <Link
          href="/booking"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-light"
        >
          <CalendarCheck className="w-4 h-4" />
          {t("booking_cta")}
        </Link>
      </div>
    </div>
  );
}
