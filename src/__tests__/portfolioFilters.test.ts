import { describe, it, expect } from "vitest";
import {
  DEFAULT_AREA_BOUNDS,
  areaRangeIndex,
  filterProjects,
  projectSpecs,
} from "@/lib/portfolioFilters";

const bounds = DEFAULT_AREA_BOUNDS; // 100, 150, 200, 300

describe("areaRangeIndex", () => {
  it("puts an area in the first range whose upper bound it does not exceed", () => {
    expect([1, 100, 101, 150, 200, 201, 300].map((a) => areaRangeIndex(a, bounds))).toEqual([
      0, 0, 1, 1, 2, 3, 3,
    ]);
  });

  it("puts anything above the last bound in the open-ended range", () => {
    expect(areaRangeIndex(301, bounds)).toBe(4);
    expect(areaRangeIndex(5000, bounds)).toBe(bounds.length);
  });
});

describe("filterProjects", () => {
  const projects = [
    { id: "a", type: "house", area: 200 },
    { id: "b", type: "house", area: 120 },
    { id: "c", type: "commercial", area: 200 },
    { id: "d" }, // no type, no area — an older project
  ];
  const ids = (filter: Parameters<typeof filterProjects>[1]) =>
    filterProjects(projects, filter, bounds).map((p) => p.id);

  it("returns everything when no filter is set", () => {
    expect(ids({})).toEqual(["a", "b", "c", "d"]);
  });

  it("filters by type", () => {
    expect(ids({ type: "house" })).toEqual(["a", "b"]);
  });

  it("filters by area range", () => {
    expect(ids({ range: 2 })).toEqual(["a", "c"]);
    expect(ids({ range: 0 })).toEqual([]);
  });

  it("combines type and area range", () => {
    expect(ids({ type: "house", range: 2 })).toEqual(["a"]);
    expect(ids({ type: "commercial", range: 1 })).toEqual([]);
  });

  it("shows a project without specs only when that filter is off", () => {
    expect(ids({ type: "house" })).not.toContain("d");
    expect(ids({ range: 2 })).not.toContain("d");
  });
});

describe("projectSpecs", () => {
  const t = (key: string, values?: Record<string, string | number>) =>
    `${key}${values ? JSON.stringify(values) : ""}`;

  it("formats the specs a project carries, digits passed as text", () => {
    expect(projectSpecs({ area: 200, frontage: 10, depth: 20, floors: 1.5, bedrooms: 4 }, t)).toEqual({
      area: 'area_value{"area":"200"}',
      dims: 'dims_value{"frontage":"10","depth":"20"}',
      floors: "floors_1_5",
      bedrooms: 'bedrooms_value{"count":4,"n":"4"}',
    });
  });

  it("names one, one and a half and two floors, counts the rest", () => {
    const floors = (n: number) => projectSpecs({ floors: n }, t).floors;
    expect([1, 1.5, 2, 3, 2.5].map(floors)).toEqual([
      "floors_1",
      "floors_1_5",
      "floors_2",
      'floors_n{"count":"3"}',
      'floors_n{"count":"2.5"}',
    ]);
  });

  it("leaves out what is not set, and dimensions need both sides", () => {
    expect(projectSpecs({}, t)).toEqual({});
    expect(projectSpecs({ frontage: 10 }, t)).toEqual({});
  });
});
