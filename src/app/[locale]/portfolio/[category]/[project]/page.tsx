import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "@/components/SiteImage";
import ImageTile from "@/components/home/ImageTile";
import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/lib/api";
import { getTestimonials } from "@/lib/testimonials";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/pageMeta";
import { getTranslations } from "next-intl/server";
import ClosingCTA from "@/components/home/ClosingCTA";
import ProjectGallery from "@/components/ProjectGallery";
import { projectLd } from "@/lib/jsonLd";
import VideoSection from "@/components/VideoSection";
import {
  getCategory,
  getPortfolioFilters,
  getProject,
  getProjects,
  getProjectImageUrl,
  projectLocation,
  projectName,
} from "@/lib/portfolio";
import { projectSpecs } from "@/lib/portfolioFilters";
import { localized } from "@/lib/siteContent";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShareButtons from "@/components/ShareButtons";
import SaveButton from "@/components/board/SaveButton";
import { SITE_URL } from "@/lib/siteUrl";

interface PageProps {
  params: Promise<{ locale: string; category: string; project: string }>;
}

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({
    category: p.category,
    project: p.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, project: projectId } = await params;
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const project = await getProject(projectId);

  if (!project) {
    return { title: tMeta("project_not_found") };
  }

  return pageMeta({
    locale,
    path: `/portfolio/${project.category}/${project.id}`,
    title: `${projectName(project, locale).text} | ${tMeta("portfolio_title").split(" | ").pop()}`,
    description: project.description?.slice(0, 160) || tMeta("portfolio_description"),
    image: project.images[0] ? getProjectImageUrl(project.category, project.id, project.images[0]) : undefined,
    type: "article",
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, category: categoryId, project: projectId } = await params;
  const project = await getProject(projectId);
  const category = getCategory(categoryId);

  if (!project || !category || project.category !== categoryId) {
    notFound();
  }

  const t = await getTranslations("portfolio");

  const tSite = await getTranslations("site");
  const tCommon = await getTranslations("common");
  const translatedCatName = t(`cat_${categoryId.replace(/-/g, "_")}`);

  // Type and specs entered in the internal app — only the ones this project has
  const specs = projectSpecs(project, t);
  const projectType = (await getPortfolioFilters()).types.find(
    (type) => type.id === project.type && type.category === project.category,
  );
  const specRows = [
    [t("spec_type"), projectType ? localized(projectType, "name", locale) : undefined],
    [t(categoryId === "floor-plan" ? "spec_area_plot" : "spec_area"), specs.area],
    [t("spec_dims"), specs.dims],
    [t("spec_floors"), specs.floors],
    [t("spec_bedrooms"), project.bedrooms ? String(project.bedrooms) : undefined],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  // The first image is the cover (same rule as the portfolio cards); the gallery shows them all.
  // Alt: "{name} — صورة {n}", with the space type when the project has one.
  const typeName = projectType ? localized(projectType, "name", locale) : "";
  const allImages = project.images.map((img, i) => ({
    src: getProjectImageUrl(project.category, project.id, img),
    alt: t(typeName ? "image_alt_type" : "image_alt", { name: project.name, type: typeName, n: String(i + 1) }),
  }));
  const coverUrl = allImages[0]?.src ?? null;

  const whatsappMessage = encodeURIComponent(
    t("whatsapp_message", { name: project.name }),
  );

  const tHome = await getTranslations("home");
  const name = projectName(project, locale);
  const place = projectLocation(project, locale);
  const pageHref = `/portfolio/${project.category}/${project.id}`;

  // Info bar: what was entered in the app, in this order; blanks are left out
  const facts = [
    [t("category_label"), translatedCatName],
    [t("location"), place.text, place.lang],
    [t("year"), project.year],
    ...specRows,
    [t("duration_label"), project.duration ? t("duration_value", { count: project.duration, n: String(project.duration) }) : ""],
    [t("cost_label"), project.cost ? t("cost_value", { value: project.cost.toLocaleString("en-US") }) : ""],
  ].filter((f): f is [string, string, ...("ar" | undefined)[]] => Boolean(f[1]));

  const brief = locale === "ar" ? project.challengeAr : project.challengeEn || project.challengeAr;
  const solution = locale === "ar" ? project.solutionAr : project.solutionEn || project.solutionAr;
  const briefLang = locale !== "ar" && !project.challengeEn ? "ar" : undefined;
  const solutionLang = locale !== "ar" && !project.solutionEn ? "ar" : undefined;

  const [products, testimonials, sameCategory] = await Promise.all([
    project.materials?.length ? getProducts() : Promise.resolve([]),
    getTestimonials(locale),
    getProjects(categoryId),
  ]);
  const materials = (project.materials ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const testimonial = testimonials.find((x) => x.projectHref === pageHref);
  const similar = sameCategory.filter((p) => p.id !== project.id && p.images.length > 0).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            projectLd({
              name: project.name,
              url: `${SITE_URL}/${locale}${pageHref}`,
              images: allImages.map((img) => (img.src.startsWith("/") ? `${SITE_URL}${img.src}` : img.src)),
              location: project.location,
              year: project.year,
            }),
          ),
        }}
      />

      {/* 1. Full-width cover with the title over it */}
      <section data-header-overlay className="relative min-h-[70svh] md:min-h-[80vh] flex items-end overflow-hidden bg-primary-dark">
        {coverUrl && (
          <Image src={coverUrl} alt={allImages[0].alt} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/40 to-primary-dark/30" />
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 md:pb-16 text-white">
          <nav className="flex items-center gap-2 text-sm text-white/75 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white">{tCommon("home")}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/portfolio" className="hover:text-white">{t("title")}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/portfolio/${categoryId}`} className="hover:text-white">{translatedCatName}</Link>
          </nav>
          {project.kind && (
            <span className="inline-block mb-3 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-bold">
              {t(project.kind === "built" ? "kind_built" : "kind_design")}
            </span>
          )}
          <h1 lang={name.lang} className="text-4xl sm:text-5xl md:text-6xl leading-tight text-balance">{name.text}</h1>
          {place.text && <p lang={place.lang} className="mt-3 text-white/80 md:text-lg">{place.text}</p>}
        </div>
      </section>

      <section className="pt-10 md:pt-14 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 2. Info bar */}
          <dl className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-px overflow-hidden rounded-3xl bg-secondary-dark/40 border border-secondary-dark/40 mb-14">
            {facts.map(([label, value, lang]) => (
              <div key={label} className="bg-white p-4 md:p-5">
                <dt className="text-xs text-text-secondary">{label}</dt>
                <dd lang={lang} className="mt-1 font-bold text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>

          {/* 3. About / the brief / the solution — beside the enquiry box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            <div className="lg:col-span-2 space-y-10">
              {project.description && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">{t("about_project")}</h2>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">{project.description}</p>
                </div>
              )}
              {brief && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">{t("challenge")}</h2>
                  <p lang={briefLang} className="text-text-secondary leading-relaxed whitespace-pre-line">{brief}</p>
                </div>
              )}
              {solution && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">{t("solution")}</h2>
                  <p lang={solutionLang} className="text-text-secondary leading-relaxed whitespace-pre-line">{solution}</p>
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-surface rounded-3xl p-6 lg:sticky lg:top-28">
                <p className="text-sm text-text-secondary">{t("images_count", { count: allImages.length })}</p>
                <a
                  href={`https://wa.me/${tSite("whatsapp")}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t("whatsapp_inquiry")}
                </a>
                {/* «لوحتي» */}
                <SaveButton variant="inline" entry={`j${project.id}`} className="mt-3 flex w-full gap-2 rounded-xl px-5 py-3 text-sm" />
                <ShareButtons url={`${SITE_URL}/${locale}${pageHref}`} title={name.text} description={project.description?.slice(0, 100)} />
              </div>
            </aside>
          </div>

          {/* 4. Design vs build */}
          {project.beforeAfter && project.beforeAfter.length > 0 && (
            <div className="mb-16 space-y-8">
              <h2 className="text-xl font-bold text-text-primary">{tHome("r2r_title")}</h2>
              {project.beforeAfter.map((pair, idx) => (
                <BeforeAfterSlider
                  key={idx}
                  beforeSrc={getProjectImageUrl(project.category, project.id, pair.before)}
                  afterSrc={getProjectImageUrl(project.category, project.id, pair.after)}
                  beforeAlt={`${name.text} — ${tHome("r2r_design")}`}
                  afterAlt={`${name.text} — ${tHome("r2r_built")}`}
                  beforeLabel={tHome("r2r_design")}
                  afterLabel={tHome("r2r_built")}
                  caption={pair.caption}
                  hint={idx === 0}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                />
              ))}
            </div>
          )}

          {/* 5. Gallery — wide, two, wide…; full-screen viewer on tap. The cover is in it too: the owner
              re-uploaded it when it was only the header photo (2026-10-26). */}
          {allImages.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-text-primary mb-6">{t("photo_gallery")}</h2>
              <ProjectGallery images={allImages} />
            </div>
          )}

          {project.videos && project.videos.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-text-primary mb-6">{t("video_section")}</h2>
              <VideoSection videos={project.videos} />
            </div>
          )}

          {/* 6. Materials from the showroom used here */}
          {materials.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-text-primary mb-6">{t("materials_used")}</h2>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {materials.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7. This client's verified testimonial */}
          {testimonial && (
            <figure className="mb-16 rounded-3xl bg-primary text-white p-8 md:p-12">
              <figcaption className="text-sm text-white/70 mb-4">{t("client_says")}</figcaption>
              <blockquote className="text-xl md:text-2xl leading-relaxed">«{testimonial.text}»</blockquote>
              <p className="mt-6 font-bold">
                {testimonial.name}
                {testimonial.role && <span className="font-normal text-white/70"> — {testimonial.role}</span>}
              </p>
            </figure>
          )}

          {/* 8. Similar projects */}
          {similar.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-text-primary mb-6">{t("similar_projects")}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similar.map((p) => (
                  <li key={p.id}>
                    <ImageTile
                      href={`/portfolio/${p.category}/${p.id}`}
                      imageUrl={getProjectImageUrl(p.category, p.id, p.images[0])}
                      title={projectName(p, locale).text}
                      eyebrow={p.kind ? t(p.kind === "built" ? "kind_built" : "kind_design") : undefined}
                      className="aspect-[4/3]"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href={`/portfolio/${categoryId}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium transition-colors"
          >
            <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("back_to_category", { name: translatedCatName })}
          </Link>
        </div>
      </section>

      <ClosingCTA title={t("cta_title")} />
    </>
  );
}
