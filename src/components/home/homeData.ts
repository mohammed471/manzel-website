import { getTranslations } from "next-intl/server";
import {
  getCategories as getPortfolioCategories,
  getProjects,
  getProjectImageUrl,
} from "@/lib/portfolio";
import { getTestimonials, getTestimonialImageUrl } from "@/lib/testimonials";

// Data loader for the homepage sections.
// Portfolio data is file-based, so nothing here depends on the Flask API.
export async function getHomeData() {
  const allProjects = await getProjects();
  const tStats = await getTranslations("stats");
  const tPortfolio = await getTranslations("portfolio");
  const tFaq = await getTranslations("faq");

  // Service cards = portfolio categories, each with the cover of its first project
  const services = getPortfolioCategories().map((category) => {
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

  const testimonialData = getTestimonials().map((item) => ({
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

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: tFaq(`q${i + 1}`),
    answer: tFaq(`a${i + 1}`),
  }));

  return { services, featuredProjects, testimonialData, stats, faqItems };
}

export type HomeService = Awaited<ReturnType<typeof getHomeData>>["services"][number];
