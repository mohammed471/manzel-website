import { getTranslations } from "next-intl/server";
import { CalendarCheck } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { ButtonLink } from "@/components/ui/Button";

// Accent CTA band (booking + contact). Title/description default to the
// homepage copy; inner pages can pass their own.
export default async function ClosingCTA({
  title,
  description,
}: {
  title?: string;
  description?: string;
} = {}) {
  const t = await getTranslations("home");

  return (
    <section className="px-3 sm:px-4 lg:px-6 pb-6">
      <AnimatedSection>
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-accent px-6 py-16 md:py-20 text-center">
          <div className="pointer-events-none absolute -top-24 -start-24 w-72 h-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -end-20 w-96 h-96 rounded-full border border-white/10" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl text-white leading-tight whitespace-pre-line">{title ?? t("have_project")}</h2>
            <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">{description ?? t("cta_description")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/booking" variant="light" size="lg">
                <CalendarCheck className="w-5 h-5" />
                {t("book_consultation")}
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline-light" size="lg">
                {t("contact_us")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
