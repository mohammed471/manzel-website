import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import Card3D from "@/components/Card3D";
import BlurImage from "@/components/BlurImage";
import StatsCounter from "@/components/StatsCounter";
import PortfolioFilter from "@/components/PortfolioFilter";
import {
  getCategories,
  getFeaturedProjects,
  getProjects,
  getProjectImageUrl,
} from "@/lib/portfolio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("portfolio_title"),
    description: t("portfolio_description"),
    openGraph: {
      title: t("portfolio_title"),
      description: t("portfolio_description"),
      type: "website",
    },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("portfolio");
  const categories = getCategories();
  const featured = getFeaturedProjects();
  const allProjects = getProjects();

  // Prepare data for client components
  const categoryData = categories.map((c) => ({
    id: c.id,
    translatedName: t(`cat_${c.id.replace(/-/g, "_")}`),
  }));

  const projectData = allProjects.map((p) => ({
    id: p.id,
    category: p.category,
    name: p.name,
    location: p.location,
    year: p.year,
    coverUrl: getProjectImageUrl(
      p.category,
      p.id,
      p.images[0] || "cover.jpg",
    ),
  }));

  const stats = [
    { value: 10, suffix: "+", label: t("stats_years") },
    { value: 5, suffix: "", label: t("stats_categories") },
    { value: 100, suffix: "+", label: t("stats_projects") },
    { value: 150, suffix: "+", label: t("stats_clients") },
  ];

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-column header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-16">
            <AnimatedSection>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.1] whitespace-pre-line">
                {t("hero_title")}
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <p className="text-text-secondary text-lg leading-relaxed max-w-xl">
                {t("hero_description")}
              </p>
            </AnimatedSection>
          </div>

          {/* Featured Projects Row */}
          {featured.length > 0 && (
            <AnimatedSection delay={0.25}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featured.slice(0, 4).map((project) => {
                  const coverUrl = getProjectImageUrl(
                    project.category,
                    project.id,
                    project.images[0] || "cover.jpg",
                  );
                  return (
                    <Card3D key={project.id}>
                      <Link
                        href={`/portfolio/${project.category}/${project.id}`}
                        className="group"
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
                          <BlurImage
                            src={coverUrl}
                            alt={project.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                        <p className="mt-2.5 text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                          {project.name}
                        </p>
                      </Link>
                    </Card3D>
                  );
                })}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ── Thin Divider ── */}
      <div className="border-t border-secondary-dark/30" />

      {/* ── Stats Section ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-sm font-medium text-accent tracking-wider uppercase">
                {t("categories_subtitle")}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mt-3">
                {t("stats_title")}
              </h2>
              <p className="text-text-secondary mt-3 max-w-lg mx-auto">
                {t("stats_subtitle")}
              </p>
            </div>
          </AnimatedSection>
          <StatsCounter stats={stats} />
        </div>
      </section>

      {/* ── Thin Divider ── */}
      <div className="border-t border-secondary-dark/30" />

      {/* ── Projects Grid with Filters ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-10">
              {t("projects_section_title")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <PortfolioFilter
              categories={categoryData}
              projects={projectData}
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="relative py-24 md:py-32 bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-geometric opacity-30" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight whitespace-pre-line">
              {t("cta_title")}
            </h2>
            <Link
              href="/contact"
              className="inline-block mt-8 px-8 py-3.5 bg-white text-primary font-semibold rounded-full hover:bg-secondary transition-colors duration-300"
            >
              {t("cta_button")}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
