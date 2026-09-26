import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/ui/PageHero";
import ClosingCTA from "@/components/home/ClosingCTA";
import MasonryGrid from "@/components/MasonryGrid";
import MasonryProjectCard from "@/components/MasonryProjectCard";
import { getCategories, getCategory, getProjects, getProjectImageUrl } from "@/lib/portfolio";

interface PageProps {
  params: Promise<{ locale: string; category: string }>;
}

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, category: categoryId } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const category = getCategory(categoryId);

  if (!category) {
    return { title: tMeta("project_not_found") };
  }

  const translatedName = t(`cat_${categoryId.replace(/-/g, "_")}`);
  const categoryDesc = t(`cat_${categoryId.replace(/-/g, "_")}_desc`);
  return {
    title: `${translatedName} | ${tMeta("portfolio_title").split(" | ").pop()}`,
    description: categoryDesc,
    openGraph: {
      title: `${translatedName} | ${tMeta("portfolio_title")}`,
      description: categoryDesc,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, category: categoryId } = await params;
  setRequestLocale(locale);
  const category = getCategory(categoryId);

  if (!category) {
    notFound();
  }

  const t = await getTranslations("portfolio");
  const tCommon = await getTranslations("common");
  const projects = getProjects(categoryId);
  const translatedName = t(`cat_${categoryId.replace(/-/g, "_")}`);
  const translatedDesc = t(`cat_${categoryId.replace(/-/g, "_")}_desc`);
  const first = projects[0];
  const coverUrl = first ? getProjectImageUrl(categoryId, first.id, first.images[0] || "cover.jpg") : null;

  return (
    <>
      <PageHero
        imageUrl={coverUrl}
        badge={t("projects_count", { count: projects.length })}
        title={translatedName}
        description={translatedDesc}
        breadcrumb={
          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">
              {tCommon("home")}
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/portfolio" className="hover:text-white transition-colors">
              {t("title")}
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/90">{translatedName}</span>
          </nav>
        }
      />

      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Projects Grid */}
          {projects.length > 0 ? (
            <MasonryGrid>
              {projects.map((project) => (
                <MasonryProjectCard key={project.id} project={project} />
              ))}
            </MasonryGrid>
          ) : (
            <AnimatedSection delay={0.2}>
              <div className="text-center py-20">
                <svg
                  className="w-16 h-16 text-secondary-dark mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>
                <p className="text-text-secondary text-lg">
                  {t("no_projects")}
                </p>
              </div>
            </AnimatedSection>
          )}

          {/* Back Link */}
          <AnimatedSection delay={0.3}>
            <div className="mt-14">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5 rtl:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                {t("back_to_portfolio")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ClosingCTA title={t("cta_title")} />
    </>
  );
}
