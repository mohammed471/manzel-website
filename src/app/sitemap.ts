import type { MetadataRoute } from "next";
import { getCategories, getProjects } from "@/lib/portfolio";

const BASE_URL = "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
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
    { path: "/testimonials", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/about", changeFrequency: "yearly" as const, priority: 0.6 },
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
  const categories = getCategories();
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
  const projects = getProjects();
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
