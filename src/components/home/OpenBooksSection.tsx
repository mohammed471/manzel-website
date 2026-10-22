import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { surfaceClasses } from "@/components/ui/Surface";
import { buttonClasses } from "@/components/ui/Button";
import { PORTAL_DEMO_URL, SHOWCASE, diffPct } from "@/data/showcase";
import { cn } from "@/lib/utils";

// "Open-books contract": cost + 10%, shown with the sample house's estimate vs
// actual. Used on the home page (after the services) and on the portfolio page.
export default async function OpenBooksSection() {
  const t = await getTranslations("home");
  const iqd = (n: number) => t("openbooks_amount", { amount: n.toLocaleString("en-US") });
  const diff = diffPct(SHOWCASE);
  const max = Math.max(SHOWCASE.estimateIqd, SHOWCASE.actualIqd);
  const bars = [
    { label: t("openbooks_estimate"), value: SHOWCASE.estimateIqd, color: "bg-primary/30" },
    { label: t("openbooks_actual"), value: SHOWCASE.actualIqd, color: "bg-primary" },
  ];

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <AnimatedSection>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs md:text-sm font-bold text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {t("openbooks_badge")}
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl leading-tight text-primary">{t("openbooks_title")}</h2>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-text-secondary max-w-xl">{t("openbooks_text")}</p>
          <a
            href={PORTAL_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonClasses("primary", "lg"), "mt-8 gap-2")}
          >
            {t("openbooks_button")}
            <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
          </a>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className={cn(surfaceClasses("white"), "p-6 md:p-8")}>
            <p className="text-sm font-bold text-text-secondary">
              {t("openbooks_case", { area: String(SHOWCASE.plotM2), floors: SHOWCASE.floors, n: String(SHOWCASE.floors) })}
            </p>

            <div className="mt-6 space-y-5">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm md:text-base text-text-primary">{b.label}</span>
                    <span className="text-base md:text-lg font-bold text-primary tabular-nums">{iqd(b.value)}</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full", b.color)} style={{ width: `${(b.value / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary-light p-4">
                <dt className="text-xs md:text-sm text-text-secondary">{t("openbooks_diff")}</dt>
                <dd className="mt-1 text-2xl font-bold text-accent tabular-nums" dir="ltr">
                  {diff > 0 ? "+" : ""}
                  {diff}%
                </dd>
              </div>
              <div className="rounded-2xl bg-secondary-light p-4">
                <dt className="text-xs md:text-sm text-text-secondary">{t("openbooks_duration")}</dt>
                <dd className="mt-1 text-2xl font-bold text-primary">{t("openbooks_months", { n: String(SHOWCASE.months) })}</dd>
              </div>
            </dl>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
