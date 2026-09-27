import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getCategories,
  getCategory,
  getProjects,
  getProject,
  getFeaturedProjects,
  getProjectImageUrl,
  getProjectsByCategory,
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

// ─── Projects ───────────────────────────────────────────

describe("getProjects", () => {
  it("returns all 5 projects when no filter", async () => {
    const projects = await getProjects();
    expect(projects).toHaveLength(5);
  });

  it("filters by category", async () => {
    const interiorProjects = await getProjects("interior-design");
    expect(interiorProjects.length).toBeGreaterThan(0);
    for (const p of interiorProjects) {
      expect(p.category).toBe("interior-design");
    }
  });

  it("returns empty array for category with no projects", async () => {
    const projects = await getProjects("non-existent-category");
    expect(projects).toEqual([]);
  });
});

describe("getProject", () => {
  it("returns a project by ID", async () => {
    const project = await getProject("cafeteria-karbala");
    expect(project).toBeDefined();
    expect(project!.name).toBe("كافتيريا كربلاء");
    expect(project!.category).toBe("interior-design");
  });

  it("returns undefined for non-existent project", async () => {
    expect(await getProject("does-not-exist")).toBeUndefined();
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured projects", async () => {
    const featured = await getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });

  it("returns 5 featured projects from sample data", async () => {
    // cafeteria-karbala, villa-baghdad, house-najaf, map-residential, finishing-apartment
    const featured = await getFeaturedProjects();
    expect(featured).toHaveLength(5);
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

// ─── Grouped by Category ────────────────────────────────

describe("getProjectsByCategory", () => {
  it("returns one group per category", async () => {
    const grouped = await getProjectsByCategory();
    expect(grouped).toHaveLength(5);
  });

  it("each group has a category object and projects array", async () => {
    for (const group of await getProjectsByCategory()) {
      expect(group.category).toBeDefined();
      expect(group.category.id).toBeTruthy();
      expect(Array.isArray(group.projects)).toBe(true);
    }
  });

  it("projects match their group category", async () => {
    for (const group of await getProjectsByCategory()) {
      for (const p of group.projects) {
        expect(p.category).toBe(group.category.id);
      }
    }
  });
});

// ─── Data Integrity ─────────────────────────────────────

describe("data integrity", () => {
  it("every project references a valid category", async () => {
    const categoryIds = new Set(getCategories().map((c) => c.id));
    for (const project of await getProjects()) {
      expect(categoryIds.has(project.category)).toBe(true);
    }
  });

  it("every project has at least one image", async () => {
    for (const project of await getProjects()) {
      expect(project.images.length).toBeGreaterThan(0);
    }
  });

  it("project IDs are unique", async () => {
    const ids = (await getProjects()).map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("category IDs are unique", async () => {
    const ids = getCategories().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
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

  it("falls back to projects.json when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const mod = await import("@/lib/portfolio");
    expect(await mod.getProjects()).toHaveLength(5);
  });

  it("passes absolute and site-path image URLs through", async () => {
    const { getProjectImageUrl: url } = await import("@/lib/portfolio");
    expect(url("x", "y", "https://i.ibb.co/a.jpg")).toBe("https://i.ibb.co/a.jpg");
    expect(url("x", "y", "/portfolio/x/y/cover.jpg")).toBe("/portfolio/x/y/cover.jpg");
    expect(url("x", "y", "cover.jpg")).toBe("/portfolio/x/y/cover.jpg");
  });
});
