import type { MetadataRoute } from "next";
import { SITE_URL, allowIndexing } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: allowIndexing() ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
