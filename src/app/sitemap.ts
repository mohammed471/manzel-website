import type { MetadataRoute } from "next";
import { getActiveCategories, getProjects } from "@/lib/portfolio";
import { getTestimonials } from "@/lib/testimonials";
import { getProducts } from "@/lib/api";
import { localizedEntries, type Freq } from "@/lib/sitemapEntries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: { path: string; changeFrequency: Freq; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/products", changeFrequency: "weekly", priority: 0.9 },
    { path: "/portfolio", changeFrequency: "monthly", priority: 0.9 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
    { path: "/calculator", changeFrequency: "yearly", priority: 0.5 },
    { path: "/area-calculator", changeFrequency: "yearly", priority: 0.5 },
    { path: "/booking", changeFrequency: "yearly", priority: 0.5 },
    // noindex while there are no verified testimonials
    ...((await getTestimonials("ar")).length > 0
      ? [{ path: "/testimonials", changeFrequency: "monthly" as const, priority: 0.5 }]
      : []),
    { path: "/about", changeFrequency: "yearly", priority: 0.6 },
    { path: "/color-picker", changeFrequency: "yearly", priority: 0.5 },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.flatMap((r) =>
    localizedEntries(r.path, r.changeFrequency, r.priority, now),
  );

  // Portfolio category routes
  // Empty categories are noindex ("coming soon") — left out until they have work
  for (const category of await getActiveCategories()) {
    entries.push(...localizedEntries(`/portfolio/${category.id}`, "monthly", 0.7, now));
  }

  // Portfolio project routes
  for (const project of await getProjects()) {
    entries.push(...localizedEntries(`/portfolio/${project.category}/${project.id}`, "monthly", 0.7, now));
  }

  // Product pages — getProducts() already leaves hidden products out
  for (const product of await getProducts()) {
    entries.push(...localizedEntries(`/products/${product.id}`, "monthly", 0.6));
  }

  return entries;
}
