import { describe, it, expect } from "vitest";
import { stripTatweel } from "@/lib/utils";

describe("stripTatweel", () => {
  it("removes stretching inside a word", () => {
    expect(stripTatweel("شريـــكك في البناء والتصميم")).toBe("شريكك في البناء والتصميم");
  });

  it("keeps the tatweel that joins a one-letter prefix to a quote or digit", () => {
    expect(stripTatweel("ابدأ بـ«متوسط»")).toBe("ابدأ بـ«متوسط»");
    expect(stripTatweel("لـ 5 سنوات")).toBe("لـ 5 سنوات");
  });
});
