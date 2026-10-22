import type { MetadataRoute } from "next";
import { getActiveCategories, getProjects } from "@/lib/portfolio";
import { SITE_URL } from "@/lib/siteUrl";
import { getTestimonials } from "@/lib/testimonials";

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["ar", "en"];

  // Static routes
  const staticRoutes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/products", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/portfolio", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/calculator", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/area-calculator", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/booking", changeFrequency: "yearly" as const, priority: 0.5 },
    // noindex while there are no verified testimonials
    ...((await getTestimonials("ar")).length > 0
      ? [{ path: "/testimonials", changeFrequency: "monthly" as const, priority: 0.5 }]
      : []),
    { path: "/about", changeFrequency: "yearly" as const, priority: 0.6 },
    { path: "/color-picker", changeFrequency: "yearly" as const, priority: 0.5 },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}/ar${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${BASE_URL}/${locale}${route.path}`])
      ),
    },
  }));

  // Portfolio category routes
  // Empty categories are noindex ("coming soon") — left out until they have work
  const categories = await getActiveCategories();
  for (const category of categories) {
    entries.push({
      url: `${BASE_URL}/ar/portfolio/${category.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            `${BASE_URL}/${locale}/portfolio/${category.id}`,
          ])
        ),
      },
    });
  }

  // Portfolio project routes
  const projects = await getProjects();
  for (const project of projects) {
    entries.push({
      url: `${BASE_URL}/ar/portfolio/${project.category}/${project.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            `${BASE_URL}/${locale}/portfolio/${project.category}/${project.id}`,
          ])
        ),
      },
    });
  }

  return entries;
}
