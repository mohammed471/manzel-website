import { describe, it, expect, vi } from "vitest";
import { pageMeta } from "@/lib/pageMeta";

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale }: { locale: string }) => () => (locale === "ar" ? "منزل" : "MANZEL"),
}));

describe("pageMeta", () => {
  it("gives canonical and hreflang alternates, Arabic as x-default", async () => {
    const m = await pageMeta({ locale: "en", path: "/calculator", title: "T", description: "D" });
    expect(m.alternates).toEqual({
      canonical: "/en/calculator",
      languages: { ar: "/ar/calculator", en: "/en/calculator", "x-default": "/ar/calculator" },
    });
  });

  it("always carries a 1200×630 share image and a large twitter card", async () => {
    const m = await pageMeta({ locale: "ar", path: "", title: "T", description: "D" });
    expect(m.openGraph).toMatchObject({ title: "T", url: "/ar", siteName: "منزل", locale: "ar_IQ", images: [{ url: "/og-default.jpg", width: 1200, height: 630 }] });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: ["/og-default.jpg"] });
  });

  it("uses a page's own image when it has one", async () => {
    const m = await pageMeta({ locale: "ar", path: "/products/5", title: "T", description: "D", image: "https://img/x.jpg" });
    expect(m.openGraph).toMatchObject({ images: [{ url: "https://img/x.jpg" }] });
    expect(m.twitter).toMatchObject({ images: ["https://img/x.jpg"] });
  });
});
