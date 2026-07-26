import { describe, it, expect } from "vitest";
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
  it("returns exactly 5 categories", () => {
    const categories = getCategories();
    expect(categories).toHaveLength(5);
  });

  it("returns the expected category IDs", () => {
    const ids = getCategories().map((c) => c.id);
    expect(ids).toEqual([
      "interior-design",
      "exterior-design",
      "execution",
      "floor-plan",
      "finishing",
    ]);
  });

  it("each category has required fields", () => {
    for (const cat of getCategories()) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });
});

describe("getCategory", () => {
  it("returns a category by ID", () => {
    const cat = getCategory("interior-design");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("التصميم الداخلي");
  });

  it("returns undefined for non-existent category", () => {
    expect(getCategory("non-existent")).toBeUndefined();
  });
});

// ─── Projects ───────────────────────────────────────────

describe("getProjects", () => {
  it("returns all 5 projects when no filter", () => {
    const projects = getProjects();
    expect(projects).toHaveLength(5);
  });

  it("filters by category", () => {
    const interiorProjects = getProjects("interior-design");
    expect(interiorProjects.length).toBeGreaterThan(0);
    for (const p of interiorProjects) {
      expect(p.category).toBe("interior-design");
    }
  });

  it("returns empty array for category with no projects", () => {
    const projects = getProjects("non-existent-category");
    expect(projects).toEqual([]);
  });
});

describe("getProject", () => {
  it("returns a project by ID", () => {
    const project = getProject("cafeteria-karbala");
    expect(project).toBeDefined();
    expect(project!.name).toBe("كافتيريا كربلاء");
    expect(project!.category).toBe("interior-design");
  });

  it("returns undefined for non-existent project", () => {
    expect(getProject("does-not-exist")).toBeUndefined();
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured projects", () => {
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });

  it("returns 5 featured projects from sample data", () => {
    // cafeteria-karbala, villa-baghdad, house-najaf, map-residential, finishing-apartment
    const featured = getFeaturedProjects();
    expect(featured).toHaveLength(5);
  });
});

// ─── Image URL ──────────────────────────────────────────

describe("getProjectImageUrl", () => {
  it("builds correct path", () => {
    const url = getProjectImageUrl("interior-design", "cafeteria-karbala", "cover.jpg");
    expect(url).toBe("/portfolio/interior-design/cafeteria-karbala/cover.jpg");
  });

  it("works with numbered images", () => {
    const url = getProjectImageUrl("execution", "house-najaf", "1.jpg");
    expect(url).toBe("/portfolio/execution/house-najaf/1.jpg");
  });
});

// ─── Grouped by Category ────────────────────────────────

describe("getProjectsByCategory", () => {
  it("returns one group per category", () => {
    const grouped = getProjectsByCategory();
    expect(grouped).toHaveLength(5);
  });

  it("each group has a category object and projects array", () => {
    for (const group of getProjectsByCategory()) {
      expect(group.category).toBeDefined();
      expect(group.category.id).toBeTruthy();
      expect(Array.isArray(group.projects)).toBe(true);
    }
  });

  it("projects match their group category", () => {
    for (const group of getProjectsByCategory()) {
      for (const p of group.projects) {
        expect(p.category).toBe(group.category.id);
      }
    }
  });
});

// ─── Data Integrity ─────────────────────────────────────

describe("data integrity", () => {
  it("every project references a valid category", () => {
    const categoryIds = new Set(getCategories().map((c) => c.id));
    for (const project of getProjects()) {
      expect(categoryIds.has(project.category)).toBe(true);
    }
  });

  it("every project has at least one image", () => {
    for (const project of getProjects()) {
      expect(project.images.length).toBeGreaterThan(0);
    }
  });

  it("project IDs are unique", () => {
    const ids = getProjects().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("category IDs are unique", () => {
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
