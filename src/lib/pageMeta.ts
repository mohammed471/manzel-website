import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const DEFAULT_OG_IMAGE = "/og-default.jpg"; // drawn by scripts/make-og-images.ts

/**
 * Every page's metadata in one shape: canonical + hreflang (Arabic is x-default),
 * Open Graph with a share image (the page's own, or the default 1200×630 card)
 * and a large Twitter card. A page's `openGraph` replaces the layout's whole
 * object, so each page builds it here rather than relying on inheritance.
 */
export async function pageMeta({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
}: {
  locale: string;
  path: string; // "" for home, "/calculator", …
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const url = `/${locale}${path}`;
  const img = image ?? DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `/ar${path}`, en: `/en${path}`, "x-default": `/ar${path}` },
    },
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: t("site_name"),
      locale: locale === "ar" ? "ar_IQ" : "en_US",
      images: [image ? { url: img } : { url: img, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}
