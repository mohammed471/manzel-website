import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/siteUrl";

export type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * One <url> per locale (Arabic and English pages are both listed, not only as
 * alternates of the Arabic one), each with the full hreflang set — ar, en and
 * x-default = Arabic, the same set `pageMeta()` puts in the page head.
 */
export function localizedEntries(
  path: string,
  changeFrequency: Freq,
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
    "x-default": `${SITE_URL}/${routing.defaultLocale}${path}`,
  };
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    ...(lastModified && { lastModified }),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}
