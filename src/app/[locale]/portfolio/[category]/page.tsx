import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import Card3D from "@/components/Card3D";
import ProjectCard from "@/components/ProjectCard";
import { getCategories, getCategory, getProjects } from "@/lib/portfolio";

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
  const category = getCategory(categoryId);

  if (!category) {
    notFound();
  }

  const t = await getTranslations("portfolio");
  const tCommon = await getTranslations("common");
  const projects = getProjects(categoryId);
  const translatedName = t(`cat_${categoryId.replace(/-/g, "_")}`);
  const translatedDesc = t(`cat_${categoryId.replace(/-/g, "_")}_desc`);

  return (
    <>
      <section className="pt-28 pb-20 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <AnimatedSection>
            <nav className="flex items-center gap-2 text-sm text-text-secondary mb-12">
              <Link
                href="/"
                className="hover:text-primary transition-colors"
              >
                {tCommon("home")}
              </Link>
              <span className="text-secondary-dark">/</span>
              <Link
                href="/portfolio"
                className="hover:text-primary transition-colors"
              >
                {t("title")}
              </Link>
              <span className="text-secondary-dark">/</span>
              <span className="text-text-primary font-medium">
                {translatedName}
              </span>
            </nav>
          </AnimatedSection>

          {/* Category Header */}
          <AnimatedSection delay={0.1}>
            <div className="mb-14">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4">
                {translatedName}
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                {translatedDesc}
              </p>
              <div className="w-16 h-0.5 bg-accent mt-6" />
            </div>
          </AnimatedSection>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project, i) => (
                <AnimatedSection key={project.id} delay={i * 0.08} variant="scaleIn">
                  <Card3D>
                    <ProjectCard project={project} locale={locale} />
                  </Card3D>
                </AnimatedSection>
              ))}
            </div>
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
