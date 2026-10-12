// Filtering and spec labels for the portfolio category pages. Pure, and free of
// data imports — the client filter component uses it without bundling projects.json.

/** Area ranges until the internal app says otherwise: ≤100, 101–150, 151–200, 201–300, >300 m². */
export const DEFAULT_AREA_BOUNDS = [100, 150, 200, 300];

export interface ProjectFilter {
  type?: string;
  /** Index from `areaRangeIndex` */
  range?: number;
}

interface FilterableProject {
  type?: string;
  area?: number;
}

/** The range an area falls in: 0 = up to `bounds[0]` … `bounds.length` = above the last bound. */
export function areaRangeIndex(area: number, bounds: number[]): number {
  const index = bounds.findIndex((max) => area <= max);
  return index === -1 ? bounds.length : index;
}

/** A project with no type / no area matches only while that filter is off. */
export function filterProjects<T extends FilterableProject>(
  projects: T[],
  filter: ProjectFilter,
  bounds: number[],
): T[] {
  return projects.filter(
    (p) =>
      (!filter.type || p.type === filter.type) &&
      (filter.range === undefined || (!!p.area && areaRangeIndex(p.area, bounds) === filter.range)),
  );
}

interface SpecProject extends FilterableProject {
  frontage?: number;
  depth?: number;
  floors?: number;
  bedrooms?: number;
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

/**
 * Labels for the specs a project carries ("200 م²", "10×20 م", "طابق ونصف", "4 غرف نوم");
 * `t` is the `portfolio` translator. Numbers go in as text so they stay Western digits.
 */
export function projectSpecs(
  p: SpecProject,
  t: Translate,
): { area?: string; dims?: string; floors?: string; bedrooms?: string } {
  const floorsKey: Record<number, string> = { 1: "floors_1", 1.5: "floors_1_5", 2: "floors_2" };
  return {
    area: p.area ? t("area_value", { area: String(p.area) }) : undefined,
    dims:
      p.frontage && p.depth
        ? t("dims_value", { frontage: String(p.frontage), depth: String(p.depth) })
        : undefined,
    floors: p.floors
      ? floorsKey[p.floors]
        ? t(floorsKey[p.floors])
        : t("floors_n", { count: String(p.floors) })
      : undefined,
    bedrooms: p.bedrooms ? t("bedrooms_value", { count: p.bedrooms, n: String(p.bedrooms) }) : undefined,
  };
}
