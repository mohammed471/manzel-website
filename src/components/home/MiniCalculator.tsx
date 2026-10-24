"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { SITE_URL } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";
import {
  FLOOR_OPTIONS,
  LEVELS,
  computeEstimate,
  estimateToQuery,
  toMillions,
  type CalculatorPricing,
  type EstimateInputs,
  type Level,
} from "@/lib/calculator";

const PLOTS = [100, 150, 200, 250, 300];

/** Eases the shown number to the new value (~0.4 s); jumps straight there under reduced motion. */
function useEased(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = duration ? Math.min((now - start) / duration, 1) : 1;
      const v = origin + (target - origin) * (1 - Math.pow(1 - p, 3));
      from.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

// Home «احسب كلفة بيتك»: three choices, the turnkey range at once. Same `computeEstimate` and the
// same prices as /calculator — "See the full breakdown" opens it with these choices.
export default function MiniCalculator({ pricing, whatsapp }: { pricing: CalculatorPricing; whatsapp: string }) {
  const t = useTranslations("home");
  const tCalc = useTranslations("calculator");
  const locale = useLocale();
  const [plotArea, setPlotArea] = useState(200);
  const [floors, setFloors] = useState(2);
  const [level, setLevel] = useState<Level>("mid");

  const inputs: EstimateInputs = {
    build: "turnkey", designServices: [], plotArea, facadeLength: 0, floors, level,
    commercial: false, renovation: false, outsideKirkuk: false, kitchen: true,
  };
  const estimate = computeEstimate(inputs, pricing);
  const low = useEased(estimate.low);
  const high = useEased(estimate.high);
  const range = tCalc("range_text", { low: toMillions(estimate.low), high: toMillions(estimate.high) });
  const query = estimateToQuery(inputs);
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `${t("mini_whatsapp_msg", { plot: String(plotArea), floors: String(floors), level: tCalc(`level_${level}`), range })}\n${SITE_URL}/${locale}/calculator?${query}`,
  )}`;

  const chip = (active: boolean) =>
    cn(
      "h-11 min-w-14 px-4 rounded-full border text-sm font-bold tabular-nums transition-colors",
      active ? "bg-primary border-primary text-white" : "bg-white border-secondary-dark text-text-primary hover:border-primary",
    );

  return (
    <section className="py-[72px] md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center [&>*]:min-w-0">
        <div>
          <h2 className="reveal reveal-fadeIn text-3xl md:text-4xl text-primary leading-tight">{t("mini_title")}</h2>

          <fieldset className="mt-8">
            <legend className="text-sm font-bold text-text-secondary">{t("mini_plot")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLOTS.map((a) => (
                <button key={a} type="button" aria-pressed={plotArea === a} onClick={() => setPlotArea(a)} className={chip(plotArea === a)}>
                  {a}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-text-secondary">{t("mini_floors")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {FLOOR_OPTIONS.map((f) => (
                <button key={f} type="button" aria-pressed={floors === f} onClick={() => setFloors(f)} className={chip(floors === f)}>
                  {f}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-text-secondary">{t("mini_level")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={chip(level === l)}>
                  {tCalc(`level_${l}`)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="rounded-3xl bg-white p-6 md:p-10 shadow-sm">
          <p className="text-sm font-bold text-text-secondary">{t("mini_result")}</p>
          <p className="mt-3 text-primary" aria-live="polite">
            <span className="sr-only">{range}</span>
            <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-4xl md:text-6xl font-bold tabular-nums">{`${toMillions(low)} – ${toMillions(high)}`}</span>
              <span className="text-base md:text-lg font-bold">{t("story_unit")}</span>
            </span>
          </p>
          <p className="mt-4 text-sm text-text-secondary">{t("mini_note")}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <ButtonLink href={`/calculator?${query}`} variant="accent" size="lg">
              {t("mini_details")}
              <ArrowLeft className="arrow-nudge w-4 h-4 ltr:rotate-180" />
            </ButtonLink>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "lg")}>
              <MessageCircle className="w-5 h-5" />
              {t("mini_whatsapp")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
