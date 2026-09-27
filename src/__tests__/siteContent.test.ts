import { describe, it, expect } from "vitest";
import ar from "@/messages/ar.json";
import { applyOverrides, telHref } from "@/lib/siteContent";

describe("applyOverrides (texts & contact from the internal app)", () => {
  it("returns the bundled messages when the API is unreachable", () => {
    expect(applyOverrides(ar, null, "ar")).toBe(ar);
  });

  it("replaces existing text keys for the right locale only", () => {
    const out = applyOverrides(
      ar,
      { texts: { ar: { "home.hero_subtitle": "عنوان جديد" }, en: { "home.hero_subtitle": "New" } }, site: {} },
      "ar",
    );
    expect(out.home.hero_subtitle).toBe("عنوان جديد");
    expect(ar.home.hero_subtitle).not.toBe("عنوان جديد"); // bundled file untouched
  });

  it("applies site fields (contact, images) to every locale", () => {
    const out = applyOverrides(ar, { texts: {}, site: { whatsapp: "9647700000000" } }, "ar");
    expect(out.site.whatsapp).toBe("9647700000000");
  });

  it("ignores unknown keys, empty strings and non-strings", () => {
    const out = applyOverrides(
      ar,
      {
        texts: { ar: { "home.not_a_key": "x", "home.hero_badge": "  ", "nope": "y", "stats.products_count": 5 as unknown as string } },
        site: { unknown: "z" },
      },
      "ar",
    );
    expect(out.home.hero_badge).toBe(ar.home.hero_badge);
    expect(out.stats.products_count).toBe(ar.stats.products_count);
    expect((out.home as Record<string, string>).not_a_key).toBeUndefined();
    expect((out.site as Record<string, string>).unknown).toBeUndefined();
  });
});

describe("telHref", () => {
  it("converts Iraqi local numbers to international tel links", () => {
    expect(telHref("0773 768 5000")).toBe("tel:+9647737685000");
    expect(telHref("+964 773 768 5000")).toBe("tel:+9647737685000");
  });
});
