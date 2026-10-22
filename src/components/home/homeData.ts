import { getLocale, getTranslations } from "next-intl/server";
import {
  getActiveCategories,
  getProjects,
  getProjectImageUrl,
} from "@/lib/portfolio";
import { getTestimonials } from "@/lib/testimonials";
import { getProducts } from "@/lib/api";
import { visibleStats, type Stat } from "@/lib/stats";

// Data loader for the homepage sections.
// Projects and testimonials come from the internal app (with bundled fallbacks).
export async function getHomeData() {
  const allProjects = await getProjects();
  const tPortfolio = await getTranslations("portfolio");
  const tFaq = await getTranslations("faq");

  // Service cards = portfolio categories with work, each with the cover of its first project
  const services = (await getActiveCategories()).map((category) => {
    const inCategory = allProjects.filter((p) => p.category === category.id);
    const first = inCategory[0];
    const key = category.id.replace(/-/g, "_");
    return {
      id: category.id,
      title: tPortfolio(`cat_${key}`),
      description: tPortfolio(`cat_${key}_desc`),
      imageUrl: first
        ? getProjectImageUrl(category.id, first.id, first.images[0] || "cover.jpg")
        : null,
      count: inCategory.length,
    };
  });

  const featuredProjects = allProjects.filter((p) => p.featured);

  const testimonialData = await getTestimonials(await getLocale());

  const stats = await getStats("home");

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: tFaq(`q${i + 1}`),
    answer: tFaq(`a${i + 1}`),
  }));

  return { services, featuredProjects, testimonialData, stats, faqItems };
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

export type HomeService = Awaited<ReturnType<typeof getHomeData>>["services"][number];
