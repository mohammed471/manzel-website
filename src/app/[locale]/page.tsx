import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/api";
import { getFeaturedProjects } from "@/lib/portfolio";
import AnimatedSection from "@/components/AnimatedSection";
import CategoryCard from "@/components/CategoryCard";
import ProjectCard from "@/components/ProjectCard";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tStats = await getTranslations("stats");

  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
  } catch {
    // API unavailable during build or runtime
  }

  categories = Array.isArray(categories) ? categories : [];
  const featuredProjects = getFeaturedProjects().slice(0, 4);

  const stats = [
    { number: tStats("products_count"), label: tStats("products_label") },
    { number: tStats("projects_count"), label: tStats("projects_label") },
    { number: tStats("years_count"), label: tStats("years_label") },
    { number: tStats("clients_count"), label: tStats("clients_label") },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary to-primary-dark" />

        {/* Minimal radial glow decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-primary-light/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-primary-light/10 rounded-full blur-[100px]" />
        </div>

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          {/* Pill badge */}
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8">
              <span className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-white/80 text-sm font-medium">
                {t("hero_badge")}
              </span>
            </div>
          </AnimatedSection>

          {/* Large bold heading */}
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight">
              {t("hero_title")}
              <span className="block text-secondary mt-3">
                {t("hero_subtitle")}
              </span>
            </h1>
          </AnimatedSection>

          {/* Description */}
          <AnimatedSection delay={0.2}>
            <p className="mt-8 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {t("hero_description")}
            </p>
          </AnimatedSection>

          {/* CTA buttons */}
          <AnimatedSection delay={0.3}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-primary-dark font-bold px-8 py-4 rounded-xl transition-colors text-lg hover:bg-secondary-light"
              >
                {t("browse_products")}
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
              <Link
                href="/portfolio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg hover:bg-white/10"
              >
                {t("view_portfolio")}
              </Link>
            </div>
          </AnimatedSection>
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
                <AnimatedSection key={category.id} delay={i * 0.1}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-extrabold text-secondary">
                    {stat.number}
                  </p>
                  <p className="text-white/80 mt-2 font-medium">
                    {stat.label}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
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
                  <ProjectCard project={project} locale={locale} />
                </AnimatedSection>
              ))}
            </div>
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
              className="mt-10 inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
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
