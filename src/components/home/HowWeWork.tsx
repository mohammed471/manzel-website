import { getTranslations } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { surfaceClasses } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";

const STEPS = [1, 2, 3] as const;

// "How we work": three steps, text on solid cards (replaced the scroll-scrubbed furniture section).
export default async function HowWeWork() {
  const t = await getTranslations("howWeWork");

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader badge={t("badge")} title={t("title")} />
        </AnimatedSection>
        <AnimatedSection delay={0.08}>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((n) => (
              <li key={n} className={cn(surfaceClasses("white"), "h-full p-6 md:p-8")}>
                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white text-xl font-bold">
                  {n}
                </span>
                <h3 className="mt-5 text-xl md:text-2xl text-primary">{t(`step${n}_title`)}</h3>
                <p className="mt-3 text-text-secondary leading-relaxed">{t(`step${n}_desc`)}</p>
              </li>
          ))}
        </ol>
        </AnimatedSection>
      </div>
    </section>
  );
}
