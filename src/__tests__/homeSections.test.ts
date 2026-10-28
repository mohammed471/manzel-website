import { describe, expect, it } from "vitest";
import { cumulativePct, pickFeatured, pickPairs } from "@/lib/homeSections";
import type { PortfolioProject } from "@/lib/portfolio";

const project = (id: string, extra: Partial<PortfolioProject> = {}): PortfolioProject => ({
  id, category: "interior-design", name: id, description: "", location: "", year: "",
  images: ["https://img/x.jpg"], videos: [], featured: false, ...extra,
});

describe("pickFeatured", () => {
  it("takes the featured projects that have a cover", () => {
    const list = [project("a", { featured: true }), project("b"), project("c", { featured: true, images: [] })];
    expect(pickFeatured(list).map((p) => p.id)).toEqual(["a"]);
  });

  it("has no limit on featured projects", () => {
    const list = Array.from({ length: 12 }, (_, i) => project(`p${i}`, { featured: true }));
    expect(pickFeatured(list, 8)).toHaveLength(12);
  });

  it("falls back to the newest three with a cover when none is featured", () => {
    const list = [project("old", { year: "2022" }), project("new", { year: "2026" }), project("none", { images: [] }),
      project("mid", { year: "2024" }), project("blank")];
    expect(pickFeatured(list).map((p) => p.id)).toEqual(["new", "mid", "old"]);
  });
});

describe("pickPairs", () => {
  it("collects up to four complete pairs, each with its project", () => {
    const a = project("a", { beforeAfter: [{ before: "1", after: "2" }, { before: "3", after: "" }] });
    const b = project("b", { beforeAfter: [1, 2, 3, 4].map((i) => ({ before: `b${i}`, after: `a${i}` })) });
    const pairs = pickPairs([a, b]);
    expect(pairs.map((p) => [p.project.id, p.before])).toEqual([["a", "1"], ["b", "b1"], ["b", "b2"], ["b", "b3"]]);
  });
});

describe("cumulativePct", () => {
  it("gives the running share of the total", () => {
    expect(cumulativePct(["21.5", "22.6", "22.9", "24.4", "38.3", "31.1", "10.7"])).toEqual([13, 26, 39, 53, 76, 94, 100]);
  });

  it("is zero everywhere when nothing was spent", () => {
    expect(cumulativePct(["", "x"])).toEqual([0, 0]);
  });
});
