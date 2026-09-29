import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "@/components/SiteImage";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/ui/PageHero";
import { getTestimonials } from "@/lib/testimonials";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("testimonials_title"),
    description: t("testimonials_description"),
    openGraph: {
      title: t("testimonials_title"),
      description: t("testimonials_description"),
      type: "website",
    },
  };
}

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("testimonials");
  const testimonials = await getTestimonials(locale);

  return (
    <>
      <PageHero badge={t("subtitle")} title={t("page_title")} description={t("page_description")} />

      {/* Testimonials Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials.length === 0 ? (
            <p className="text-center text-text-secondary text-lg">
              {t("no_testimonials")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <AnimatedSection key={testimonial.id} delay={i * 0.1}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-dark/30 h-full flex flex-col">
                    {/* Decorative quote */}
                    <div className="text-accent/10 text-6xl font-serif leading-none mb-2 select-none">
                      &#10077;
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <svg
                          key={starIdx}
                          className={`w-4 h-4 ${starIdx < testimonial.rating ? "text-amber-400" : "text-gray-200"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote text */}
                    <p className="text-text-secondary leading-relaxed mb-4 flex-1 italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 mt-auto">
                      {testimonial.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={testimonial.imageUrl}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-lg">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-text-primary text-sm">
                          {testimonial.name}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {[testimonial.role, testimonial.location].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
