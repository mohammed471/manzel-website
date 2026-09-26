import { getTranslations } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import CountUp from "@/components/home/CountUp";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

type Testimonial = React.ComponentProps<typeof TestimonialsCarousel>["testimonials"][number];

// Green band: stats + client testimonials.
export default async function TrustSection({
  stats,
  testimonials,
}: {
  stats: { numberText: string; label: string }[];
  testimonials: Testimonial[];
}) {
  const t = await getTranslations("home");
  const tTestimonials = await getTranslations("testimonials");

  return (
    <section className="px-3 sm:px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-primary py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-40 -start-40 w-[28rem] h-[28rem] rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-52 -end-32 w-[34rem] h-[34rem] rounded-full border border-white/[0.06]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 0.08}>
                <div className="h-full rounded-3xl bg-white/[0.06] border border-white/10 p-5 md:p-7">
                  <CountUp
                    text={s.numberText}
                    delay={i * 120}
                    className="block text-4xl md:text-5xl font-bold text-white tabular-nums"
                  />
                  <span className="mt-2 block text-sm md:text-base text-white/65">{s.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {testimonials.length > 0 && (
            <div className="mt-16 md:mt-20">
              <AnimatedSection>
                <SectionHeader
                  tone="dark"
                  badge={t("trust_badge")}
                  title={tTestimonials("title")}
                  action={
                    <ButtonLink href="/testimonials" variant="outline-light" size="sm">
                      {tTestimonials("view_all")}
                    </ButtonLink>
                  }
                />
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <TestimonialsCarousel testimonials={testimonials} />
              </AnimatedSection>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
