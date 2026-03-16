import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/api";
import { getFeaturedProjects } from "@/lib/portfolio";
import { getTestimonials, getTestimonialImageUrl } from "@/lib/testimonials";
import AnimatedSection from "@/components/AnimatedSection";
import CategoryCard from "@/components/CategoryCard";
import ProjectCard from "@/components/ProjectCard";
import HeroVideo from "@/components/HeroVideo";
import HeroText from "@/components/HeroText";
import CountUpStats from "@/components/CountUpStats";
import Card3D from "@/components/Card3D";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tStats = await getTranslations("stats");
  const tTestimonials = await getTranslations("testimonials");

  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
  } catch {
    // API unavailable during build or runtime
  }

  categories = Array.isArray(categories) ? categories : [];
  const featuredProjects = getFeaturedProjects().slice(0, 4);

  const testimonials = getTestimonials();
  const testimonialData = testimonials.map((item) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    location: item.location,
    rating: item.rating,
    text: item.text,
    imageUrl: item.image ? getTestimonialImageUrl(item.image) : null,
  }));

  const stats = [
    { numberText: tStats("products_count"), label: tStats("products_label") },
    { numberText: tStats("projects_count"), label: tStats("projects_label") },
    { numberText: tStats("years_count"), label: tStats("years_label") },
    { numberText: tStats("clients_count"), label: tStats("clients_label") },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background with fallback */}
        <div className="absolute inset-0 overflow-hidden">
          <HeroVideo />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <HeroText
            badge={t("hero_badge")}
            title={t("hero_title")}
            subtitle={t("hero_subtitle")}
            description={t("hero_description")}
            browseProductsLabel={t("browse_products")}
            viewPortfolioLabel={t("view_portfolio")}
          />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="py-20 md:py-28 bg-white bg-geometric">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center mb-14">
                <span className="text-accent font-bold text-sm tracking-wider uppercase">
                  {t("shop_by_category")}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                  {t("browse_collections")}
                </h2>
                <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, i) => (
                <AnimatedSection key={category.id} delay={i * 0.1} variant="scaleIn">
                  <CategoryCard category={category} index={i} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="relative py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 accent-shimmer" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountUpStats stats={stats} />
        </div>
      </section>

      {/* Recent Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-20 md:py-28 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-14 gap-4">
                <div>
                  <span className="text-accent font-bold text-sm tracking-wider uppercase">
                    {t("latest_work")}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                    {t("featured_projects")}
                  </h2>
                </div>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-light transition-colors"
                >
                  {t("view_more")}
                  <svg
                    className="w-5 h-5 rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project, i) => (
                <AnimatedSection key={project.id} delay={i * 0.1}>
                  <Card3D>
                    <ProjectCard project={project} locale={locale} />
                  </Card3D>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialData.length > 0 && (
        <section className="py-20 md:py-28 bg-white bg-geometric">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-14 gap-4">
                <div>
                  <span className="text-accent font-bold text-sm tracking-wider uppercase">
                    {tTestimonials("subtitle")}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                    {tTestimonials("title")}
                  </h2>
                </div>
                <Link
                  href="/testimonials"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-light transition-colors"
                >
                  {tTestimonials("view_all")}
                  <svg
                    className="w-5 h-5 rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <TestimonialsCarousel testimonials={testimonialData} />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              {t("have_project")}
            </h2>
            <p className="mt-6 text-white/70 text-lg max-w-lg mx-auto leading-relaxed">
              {t("cta_description")}
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg btn-glow-accent"
            >
              {t("contact_us")}
              <svg
                className="w-5 h-5 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
