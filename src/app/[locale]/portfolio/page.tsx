import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import PortfolioFilter from "@/components/PortfolioFilter";
import PageHero from "@/components/ui/PageHero";
import SectionHeader from "@/components/ui/SectionHeader";
import ImageTile from "@/components/home/ImageTile";
import TrustSection from "@/components/home/TrustSection";
import ClosingCTA from "@/components/home/ClosingCTA";
import { buttonClasses } from "@/components/ui/Button";
import { getCategories, getProjects, getProjectImageUrl } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

// The app's sample house page (manzel_split core/sample_house SAMPLE_TOKEN) — a public page shaped like a client link.
const SAMPLE_HOUSE_PATH = "/c/3an1E_I9cNAwko5Rhayf6cTI5FAQ8VJozoZKkvnx8Lk";

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
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const categories = getCategories();
  const allProjects = await getProjects();

  const categoryCards = categories.map((c) => {
    const key = c.id.replace(/-/g, "_");
    const projects = allProjects.filter((p) => p.category === c.id);
    const first = projects[0];
    return {
      id: c.id,
      title: t(`cat_${key}`),
      description: t(`cat_${key}_desc`),
      count: t("projects_count", { count: projects.length }),
      imageUrl: first ? getProjectImageUrl(c.id, first.id, first.images[0] || "cover.jpg") : null,
    };
  });

  // Prepare data for client components
  const categoryData = categoryCards.map((c) => ({ id: c.id, translatedName: c.title }));

  const projectData = allProjects.map((p) => ({
    id: p.id,
    category: p.category,
    name: p.name,
    location: p.location,
    year: p.year,
    coverUrl: getProjectImageUrl(p.category, p.id, p.images[0] || "cover.jpg"),
  }));

  const stats = [
    { numberText: "10+", label: t("stats_years") },
    { numberText: String(categories.length), label: t("stats_categories") },
    { numberText: "100+", label: t("stats_projects") },
    { numberText: "150+", label: t("stats_clients") },
  ];

  return (
    <>
      <PageHero badge={t("title")} title={t("hero_title")} description={t("hero_description")} />

      {/* Categories */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <SectionHeader badge={t("categories_subtitle")} title={t("stats_title")} description={t("stats_subtitle")} />
          </AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-6 auto-rows-[200px] md:auto-rows-[260px] gap-3 md:gap-4">
            {categoryCards.map((c, i) => (
              <AnimatedSection
                key={c.id}
                delay={i * 0.06}
                className={cn(i < 2 ? "lg:col-span-3" : "lg:col-span-2", i === 0 && "col-span-2")}
              >
                <ImageTile
                  href={`/portfolio/${c.id}`}
                  imageUrl={c.imageUrl}
                  eyebrow={c.count}
                  title={c.title}
                  description={c.description}
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="h-full"
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <TrustSection stats={stats} testimonials={[]} />

      {/* All projects with filters */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <SectionHeader title={t("projects_section_title")} />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <PortfolioFilter categories={categoryData} projects={projectData} />
          </AnimatedSection>
        </div>
      </section>

      {/* Sample project, as a client sees it — opens the app's public page */}
      <section className="pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl leading-tight">{t("sample_title")}</h2>
          <p className="mt-4 text-text-secondary text-base md:text-lg leading-relaxed">{t("sample_description")}</p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}${SAMPLE_HOUSE_PATH}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonClasses("primary", "lg"), "mt-8")}
          >
            {t("sample_button")}
          </a>
        </AnimatedSection>
      </section>

      <ClosingCTA title={t("cta_title")} />
    </>
  );
}
