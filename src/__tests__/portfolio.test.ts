import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  getCategories,
  getCategory,
  getProjectImageUrl,
} from "@/lib/portfolio";

// ─── Categories ─────────────────────────────────────────

describe("getCategories", () => {
  it("returns exactly 5 categories", async () => {
    const categories = getCategories();
    expect(categories).toHaveLength(5);
  });

  it("returns the expected category IDs", async () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toEqual([
      "interior-design",
      "exterior-design",
      "execution",
      "floor-plan",
      "finishing",
    ]);
  });

  it("each category has required fields", async () => {
    for (const cat of getCategories()) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });
});

describe("getCategory", () => {
  it("returns a category by ID", async () => {
    const cat = getCategory("interior-design");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("التصميم الداخلي");
  });

  it("returns undefined for non-existent category", async () => {
    expect(getCategory("non-existent")).toBeUndefined();
  });
});

// ─── Projects (from the internal app) ───────────────────

const fixture = [
  { id: "cafe-kirkuk", category: "interior-design", name: "كافيه كركوك", featured: true, images: ["https://i.ibb.co/a.jpg"] },
  { id: "villa-kirkuk", category: "exterior-design", name: "فيلا كركوك", featured: false, images: ["https://i.ibb.co/b.jpg"] },
  { id: "flat-kirkuk", category: "interior-design", name: "شقة كركوك", featured: true, images: ["https://i.ibb.co/c.jpg"] },
];
const withApp = () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: fixture })))));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });
  return () => import("@/lib/portfolio");
};

describe("getProjects", () => {
  const load = withApp();

  it("returns every project when no filter", async () => {
    expect(await (await load()).getProjects()).toHaveLength(3);
  });

  it("filters by category", async () => {
    const ids = (await (await load()).getProjects("interior-design")).map((p) => p.id);
    expect(ids).toEqual(["cafe-kirkuk", "flat-kirkuk"]);
  });

  it("returns empty array for category with no projects", async () => {
    expect(await (await load()).getProjects("non-existent-category")).toEqual([]);
  });
});

describe("getProject / getFeaturedProjects / getProjectsByCategory", () => {
  const load = withApp();

  it("finds a project by ID, undefined otherwise", async () => {
    const mod = await load();
    expect((await mod.getProject("villa-kirkuk"))?.category).toBe("exterior-design");
    expect(await mod.getProject("does-not-exist")).toBeUndefined();
  });

  it("returns only featured projects", async () => {
    expect((await (await load()).getFeaturedProjects()).map((p) => p.id)).toEqual(["cafe-kirkuk", "flat-kirkuk"]);
  });

  it("groups projects under their category, one group per category", async () => {
    const grouped = await (await load()).getProjectsByCategory();
    expect(grouped).toHaveLength(5);
    for (const group of grouped) for (const p of group.projects) expect(p.category).toBe(group.category.id);
  });
});

describe("bundled data", () => {
  it("keeps the five categories but no sample projects", async () => {
    const data = (await import("@/data/projects.json")).default;
    expect(data.categories).toHaveLength(5);
    expect(data.projects).toEqual([]);
  });

  it("category IDs are unique", async () => {
    const ids = getCategories().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Image URL ──────────────────────────────────────────

describe("getProjectImageUrl", () => {
  it("builds correct path", async () => {
    const url = getProjectImageUrl("interior-design", "cafeteria-karbala", "cover.jpg");
    expect(url).toBe("/portfolio/interior-design/cafeteria-karbala/cover.jpg");
  });

  it("works with numbered images", async () => {
    const url = getProjectImageUrl("execution", "house-najaf", "1.jpg");
    expect(url).toBe("/portfolio/execution/house-najaf/1.jpg");
  });
});

// ─── API cleanup verification ───────────────────────────

describe("api.ts cleanup", () => {
  it("api.ts does NOT export project-related functions", async () => {
    const api = await import("@/lib/api");
    const exports = Object.keys(api);

    // These should NOT exist anymore
    expect(exports).not.toContain("getProjects");
    expect(exports).not.toContain("getProjectFileUrl");

    // These SHOULD still exist
    expect(exports).toContain("getProducts");
    expect(exports).toContain("getProduct");
    expect(exports).toContain("getCategories");
    expect(exports).toContain("submitContact");
    expect(exports).toContain("getProductImageUrl");
  });
});

// ─── Internal-app source (/api/public/website/portfolio) ─

describe("projects from the internal app", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const apiProject = {
    id: "villa-kirkuk",
    category: "exterior-design",
    name: "فيلا كركوك",
    description: "",
    location: "كركوك",
    year: "2026",
    featured: true,
    images: ["https://i.ibb.co/x/cover.jpg"],
    videos: [],
    beforeAfter: [],
  };

  it("uses the API list when the API answers", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [apiProject] }))));
    const mod = await import("@/lib/portfolio");
    expect((await mod.getProjects()).map((p) => p.id)).toEqual(["villa-kirkuk"]);
  });

  it("respects an empty list from a healthy API (all projects deleted)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [] }))));
    const mod = await import("@/lib/portfolio");
    expect(await mod.getProjects()).toEqual([]);
  });

  it("shows no projects when the API is unreachable — never the old sample projects", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const mod = await import("@/lib/portfolio");
    expect(await mod.getProjects()).toEqual([]);
    expect(await mod.getActiveCategories()).toEqual([]);
  });

  it("reads the filter fields of a project and leaves unset ones out", async () => {
    const plan = { ...apiProject, id: "plan-200", category: "floor-plan", type: "house", area: 200,
      frontage: 10, depth: 20, floors: 1.5, bedrooms: 4 };
    const bare = { ...apiProject, type: "", area: 0, frontage: 0, depth: 0, floors: 0, bedrooms: 0 };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [plan, bare] }))));
    const mod = await import("@/lib/portfolio");
    expect(await mod.getProject("plan-200")).toMatchObject({
      type: "house", area: 200, frontage: 10, depth: 20, floors: 1.5, bedrooms: 4 });
    const old = await mod.getProject("villa-kirkuk");
    expect([old!.type, old!.area, old!.floors, old!.bedrooms]).toEqual([undefined, undefined, undefined, undefined]);
  });

  it("reads the case-study fields and leaves blank ones out", async () => {
    const study = { ...apiProject, id: "house-250", name_en: "250 m² house", location_en: " ", kind: "built",
      duration: 7, cost: 171.6, challenge_ar: "بيت لعائلة", solution_en: "", materials: [12, 45] };
    const blank = { ...apiProject, name_en: "", kind: "render", duration: 0, cost: 0, materials: [] };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [study, blank] }))));
    const mod = await import("@/lib/portfolio");
    expect(await mod.getProject("house-250")).toMatchObject({
      nameEn: "250 m² house", locationEn: undefined, kind: "built", duration: 7, cost: 171.6,
      challengeAr: "بيت لعائلة", solutionEn: undefined, materials: [12, 45] });
    const old = await mod.getProject("villa-kirkuk");
    expect([old!.nameEn, old!.kind, old!.duration, old!.materials]).toEqual([undefined, undefined, undefined, undefined]);
  });

  it("reads the types and area ranges the app publishes", async () => {
    const filters = {
      types: [{ id: "cafe", category: "interior-design", name_ar: "كافيهات", name_en: "Cafés" }, { name_ar: "بلا معرّف" }],
      area_bounds: [200, 100, 100, "x", -5],
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [apiProject], filters }))));
    const mod = await import("@/lib/portfolio");
    const result = await mod.getPortfolioFilters();
    expect(result.types.map((t) => t.id)).toEqual(["cafe"]);
    expect(result.areaBounds).toEqual([100, 200]);
  });

  it("has no types and the default ranges when the API predates filters or is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [apiProject] }))));
    let mod = await import("@/lib/portfolio");
    expect(await mod.getPortfolioFilters()).toEqual({ types: [], areaBounds: [100, 150, 200, 300] });

    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    mod = await import("@/lib/portfolio");
    expect(await mod.getPortfolioFilters()).toEqual({ types: [], areaBounds: [100, 150, 200, 300] });
  });

  it("passes absolute and site-path image URLs through", async () => {
    const { getProjectImageUrl: url } = await import("@/lib/portfolio");
    expect(url("x", "y", "https://i.ibb.co/a.jpg")).toBe("https://i.ibb.co/a.jpg");
    expect(url("x", "y", "/portfolio/x/y/cover.jpg")).toBe("/portfolio/x/y/cover.jpg");
    expect(url("x", "y", "cover.jpg")).toBe("/portfolio/x/y/cover.jpg");
  });
});

// ─── Categories with projects (empty ones are hidden) ───

describe("getActiveCategories", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const project = (id: string, category: string) => ({
    id, category, name: id, description: "", location: "", year: "", featured: false,
    images: ["https://i.ibb.co/x/cover.jpg"], videos: [], beforeAfter: [],
  });

  it("keeps only categories that have projects, in category order", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects: [project("a", "interior-design")] }))));
    const mod = await import("@/lib/portfolio");
    expect((await mod.getActiveCategories()).map((c) => c.id)).toEqual(["interior-design"]);
  });

  it("shows a category as soon as it gets a project", async () => {
    const projects = [project("b", "execution"), project("a", "interior-design")];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ projects }))));
    const mod = await import("@/lib/portfolio");
    expect((await mod.getActiveCategories()).map((c) => c.id)).toEqual(["interior-design", "execution"]);
  });
});
