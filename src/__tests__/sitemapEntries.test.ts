import { describe, it, expect } from "vitest";
import { localizedEntries } from "@/lib/sitemapEntries";
import { SITE_URL } from "@/lib/siteUrl";

describe("sitemap entries", () => {
  it("lists the page once per locale with the full hreflang set", () => {
    const entries = localizedEntries("/about", "yearly", 0.6);
    expect(entries.map((e) => e.url)).toEqual([`${SITE_URL}/ar/about`, `${SITE_URL}/en/about`]);
    for (const e of entries) {
      expect(e.alternates?.languages).toEqual({
        ar: `${SITE_URL}/ar/about`,
        en: `${SITE_URL}/en/about`,
        "x-default": `${SITE_URL}/ar/about`,
      });
      expect(e.priority).toBe(0.6);
      expect(e.lastModified).toBeUndefined();
    }
  });

  it("uses the bare locale for the home page", () => {
    expect(localizedEntries("", "weekly", 1)[1].url).toBe(`${SITE_URL}/en`);
  });
});
