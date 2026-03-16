import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import BlurImage from "@/components/BlurImage";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import ProjectGallery from "@/components/ProjectGallery";
import VideoSection from "@/components/VideoSection";
import {
  getCategories,
  getCategory,
  getProject,
  getProjects,
  getProjectImageUrl,
} from "@/lib/portfolio";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShareButtons from "@/components/ShareButtons";

interface PageProps {
  params: Promise<{ locale: string; category: string; project: string }>;
}

export async function generateStaticParams() {
  return getProjects().map((p) => ({
    category: p.category,
    project: p.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, project: projectId } = await params;
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const project = getProject(projectId);

  if (!project) {
    return { title: tMeta("project_not_found") };
  }

  return {
    title: `${project.name} | ${tMeta("portfolio_title").split(" | ").pop()}`,
    description: project.description?.slice(0, 160),
    openGraph: {
      title: project.name,
      description: project.description?.slice(0, 160),
      type: "article",
      images: [`/portfolio/${project.category}/${project.id}/cover.jpg`],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, category: categoryId, project: projectId } = await params;
  const project = getProject(projectId);
  const category = getCategory(categoryId);

  if (!project || !category || project.category !== categoryId) {
    notFound();
  }

  const t = await getTranslations("portfolio");
  const tCommon = await getTranslations("common");
  const translatedCatName = t(`cat_${categoryId.replace(/-/g, "_")}`);

  const coverUrl = getProjectImageUrl(
    project.category,
    project.id,
    "cover.jpg",
  );

  // Build image data for gallery (exclude cover)
  const galleryImages = project.images
    .filter((img) => img !== "cover.jpg")
    .map((img) => ({
      src: getProjectImageUrl(project.category, project.id, img),
      alt: `${project.name} - ${img}`,
    }));

  // All images including cover
  const allImages = [
    { src: coverUrl, alt: project.name },
    ...galleryImages,
  ];

  const whatsappMessage = encodeURIComponent(
    t("whatsapp_message", { name: project.name }),
  );

  return (
    <>
      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <AnimatedSection>
            <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8 flex-wrap">
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
              <Link
                href={`/portfolio/${categoryId}`}
                className="hover:text-primary transition-colors"
              >
                {translatedCatName}
              </Link>
              <span className="text-secondary-dark">/</span>
              <span className="text-text-primary font-medium">
                {project.name}
              </span>
            </nav>
          </AnimatedSection>

          {/* Hero Image */}
          <AnimatedSection delay={0.1} variant="fadeIn">
            <div className="relative aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden bg-secondary mb-10">
              <BlurImage
                src={coverUrl}
                alt={project.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              {/* Fallback */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/30 flex items-center justify-center -z-10">
                <svg
                  className="w-20 h-20 text-primary/20"
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
              </div>
            </div>
          </AnimatedSection>

          {/* Project Title */}
          <AnimatedSection delay={0.15}>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
              {project.name}
            </h1>
          </AnimatedSection>

          {/* Info Badges */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-wrap gap-3 mb-10">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-medium text-sm px-4 py-2 rounded-full">
                {translatedCatName}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-secondary text-text-secondary text-sm px-4 py-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {project.location}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-secondary text-text-secondary text-sm px-4 py-2 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                {project.year}
              </span>
            </div>
          </AnimatedSection>

          {/* Two-Column: Description + Info Sidebar */}
          <AnimatedSection delay={0.25}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
              {/* Description — Left (2/3) */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  {t("about_project")}
                </h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line text-base">
                  {project.description}
                </p>
              </div>

              {/* Info Sidebar — Right (1/3) */}
              <div className="lg:col-span-1">
                <div className="bg-surface rounded-2xl p-6 lg:sticky lg:top-28">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-5">
                    {t("project_info")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-secondary-dark/30 pb-3">
                      <span className="text-text-secondary text-sm">
                        {t("category_label")}
                      </span>
                      <span className="text-text-primary font-medium text-sm">
                        {translatedCatName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-secondary-dark/30 pb-3">
                      <span className="text-text-secondary text-sm">
                        {t("location")}
                      </span>
                      <span className="text-text-primary font-medium text-sm">
                        {project.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-secondary-dark/30 pb-3">
                      <span className="text-text-secondary text-sm">
                        {t("year")}
                      </span>
                      <span className="text-text-primary font-medium text-sm">
                        {project.year}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary text-sm">
                        {t("photo_gallery")}
                      </span>
                      <span className="text-text-primary font-medium text-sm">
                        {t("images_count", { count: allImages.length })}
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/9647700000000?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full mt-6 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t("whatsapp_inquiry")}
                  </a>

                  <ShareButtons
                    url={`https://example.com/${locale}/portfolio/${categoryId}/${projectId}`}
                    title={project.name}
                    description={project.description?.slice(0, 100)}
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Before & After */}
          {project.beforeAfter && project.beforeAfter.length > 0 && (
            <AnimatedSection delay={0.28}>
              <div className="mb-16">
                <h2 className="text-xl font-bold text-text-primary mb-6">
                  {t("before_after")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.beforeAfter.map((pair, idx) => (
                    <BeforeAfterSlider
                      key={idx}
                      beforeSrc={getProjectImageUrl(project.category, project.id, pair.before)}
                      afterSrc={getProjectImageUrl(project.category, project.id, pair.after)}
                      beforeAlt={`${project.name} - ${t("before_label")}`}
                      afterAlt={`${project.name} - ${t("after_label")}`}
                      caption={pair.caption}
                    />
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Gallery */}
          {allImages.length > 0 && (
            <AnimatedSection delay={0.3}>
              <div className="mb-16">
                <h2 className="text-xl font-bold text-text-primary mb-6">
                  {t("photo_gallery")}
                </h2>
                <ProjectGallery images={allImages} />
              </div>
            </AnimatedSection>
          )}

          {/* Videos */}
          {project.videos && project.videos.length > 0 && (
            <AnimatedSection delay={0.35}>
              <div className="mb-16">
                <h2 className="text-xl font-bold text-text-primary mb-6">
                  {t("video_section")}
                </h2>
                <VideoSection videos={project.videos} />
              </div>
            </AnimatedSection>
          )}

          {/* Back Link */}
          <AnimatedSection delay={0.4}>
            <Link
              href={`/portfolio/${categoryId}`}
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
              {t("back_to_category", { name: translatedCatName })}
            </Link>
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
