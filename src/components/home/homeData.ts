import { getLocale, getTranslations } from "next-intl/server";
import {
  getActiveCategories,
  getProjects,
  getProjectImageUrl,
  projectName,
} from "@/lib/portfolio";
import { getSiteSections, localized } from "@/lib/siteContent";
import { cumulativePct, pickFeatured, pickPairs } from "@/lib/homeSections";
import { getTestimonials } from "@/lib/testimonials";
import { getProducts } from "@/lib/api";
import { visibleStats, type Stat } from "@/lib/stats";

// Data loader for the homepage sections.
// Projects, testimonials and the home sections (hero photos, steps, the house month by month,
// materials) come from the internal app; anything empty there hides its section.
export async function getHomeData() {
  const locale = await getLocale();
  const allProjects = await getProjects();
  const tFaq = await getTranslations("faq");
  const sections = await getSiteSections();
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const image = (v: unknown) => str(v) || null;
  const projectHref = (slug: string) => {
    const p = allProjects.find((x) => x.id === slug);
    return p ? `/portfolio/${p.category}/${p.id}` : null;
  };

  const heroSlides = (sections?.hero_slides ?? [])
    .filter((s) => str(s.image))
    .map((s) => ({
      image: str(s.image),
      caption: localized(s, "caption", locale),
      kind: s.kind === "built" ? ("built" as const) : ("design" as const),
      href: projectHref(str(s.project)),
    }));

  const steps = (sections?.process_steps ?? []).map((s, i) => ({
    id: String(s.id ?? i),
    title: localized(s, "title", locale),
    text: localized(s, "text", locale),
    image: image(s.image),
  }));

  const storyRaw = sections?.build_story ?? [];
  const progress = cumulativePct(storyRaw.map((m) => str(m.spent)));
  const story = storyRaw.map((m, i) => ({
    id: String(m.id ?? i),
    month: localized(m, "month", locale),
    stage: localized(m, "stage", locale),
    text: localized(m, "text", locale),
    spent: str(m.spent),
    pct: progress[i],
    image: image(m.image),
  }));

  const materials = (sections?.materials ?? [])
    .filter((m) => str(m.image))
    .slice(0, 6)
    .map((m, i) => ({
      id: String(m.id ?? i),
      image: str(m.image),
      name: localized(m, "name", locale),
      group: localized(m, "group", locale),
      productId: /^\d+$/.test(str(m.product_id)) ? str(m.product_id) : null,
    }));

  const featuredProjects = pickFeatured(allProjects, 8); // every «مميّز» project; none marked → the newest 8
  const pairs = pickPairs(allProjects).map((p) => ({
    before: getProjectImageUrl(p.project.category, p.project.id, p.before),
    after: getProjectImageUrl(p.project.category, p.project.id, p.after),
    caption: p.caption || projectName(p.project, locale).text,
    href: `/portfolio/${p.project.category}/${p.project.id}`,
  }));

  const testimonialData = await getTestimonials(locale);
  const stats = await getStats("home");

  // A question shows only with its answer (both edited in the internal app)
  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: tFaq(`q${i + 1}`).trim(),
    answer: tFaq(`a${i + 1}`).trim(),
  })).filter((f) => f.question && f.answer);

  return { heroSlides, steps, story, materials, featuredProjects, pairs, testimonialData, stats, faqItems };
}

/**
 * The one source of the counters (home, About, portfolio). Products and sections are
 * counted from the data; years / projects / clients are the `stats.*_count` texts the
 * owner fills in from the internal app (empty until then). Empty or zero → hidden.
 */
export async function getStats(page: "home" | "about" | "portfolio"): Promise<Stat[]> {
  const t = await getTranslations("stats");
  const tPortfolio = await getTranslations("portfolio");
  if (page === "portfolio") {
    return visibleStats([
      { numberText: t("years_count"), label: tPortfolio("stats_years") },
      { numberText: String((await getActiveCategories()).length), label: tPortfolio("stats_categories") },
      { numberText: t("projects_count"), label: tPortfolio("stats_projects") },
      { numberText: t("clients_count"), label: tPortfolio("stats_clients") },
    ]);
  }
  return visibleStats([
    { numberText: String((await getProducts()).length), label: t("products_label") },
    { numberText: t("projects_count"), label: t("projects_label") },
    { numberText: t("years_count"), label: t("years_label") },
    { numberText: t("clients_count"), label: t("clients_label") },
  ]);
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
