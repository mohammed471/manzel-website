import { cache } from "react";
import { SITE_CONTENT_TAG } from "@/lib/cacheTags";
import { DEFAULT_AREA_BOUNDS } from "@/lib/portfolioFilters";
import type { SectionItem } from "@/lib/siteContent";
import data from "@/data/projects.json";

export interface PortfolioCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ProjectVideo {
  type: "youtube" | "local";
  url: string;
}

export interface BeforeAfterPair {
  before: string;
  after: string;
  caption?: string;
}

export interface PortfolioProject {
  id: string;
  category: string;
  name: string;
  description: string;
  location: string;
  year: string;
  images: string[];
  videos: ProjectVideo[];
  featured: boolean;
  beforeAfter?: BeforeAfterPair[];
  // Filter fields and specs from the internal app — absent when not set there
  /** Id of one of its category's types (`getPortfolioFilters().types`) */
  type?: string;
  /** m² — the plot area for floor plans */
  area?: number;
  /** Plot frontage × depth, m */
  frontage?: number;
  depth?: number;
  /** 1.5 = a floor and a half */
  floors?: number;
  bedrooms?: number;
  // Case study (internal app, «دراسة الحالة») — absent when not set there
  nameEn?: string;
  locationEn?: string;
  /** Badge: real photos ("built") or renders ("design") */
  kind?: "built" | "design";
  /** Months */
  duration?: number;
  /** Million IQD */
  cost?: number;
  challengeAr?: string;
  challengeEn?: string;
  solutionAr?: string;
  solutionEn?: string;
  /** Product ids used in the project */
  materials?: number[];
}

export interface PortfolioFilters {
  /** Project types of every category: `{ id, category, name_ar, name_en }` */
  types: SectionItem[];
  /** Ascending upper bounds of the area ranges, m² */
  areaBounds: number[];
}

export function getCategories(): PortfolioCategory[] {
  return data.categories;
}

export function getCategory(categoryId: string): PortfolioCategory | undefined {
  return data.categories.find((c) => c.id === categoryId);
}

// ── Projects: managed in the internal app («الموقع» → مشاريع المعرض) ──────────
// Served by /api/public/website/portfolio in the same shape as projects.json,
// plus `filters` (project types per category and the area ranges — «الأنواع
// ونطاقات المساحة» in the app). projects.json is only a fallback for when the
// API can't be reached — an empty list from a healthy API is respected (all
// projects deleted).

const API = process.env.NEXT_PUBLIC_API_URL;
export { SITE_CONTENT_TAG };

const positive = (v: unknown) => (typeof v === "number" && v > 0 ? v : undefined);
const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(raw: any): PortfolioProject | null {
  if (!raw || typeof raw.id !== "string" || typeof raw.category !== "string") return null;
  return {
    id: raw.id,
    category: raw.category,
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    location: String(raw.location ?? ""),
    year: String(raw.year ?? ""),
    images: Array.isArray(raw.images) ? raw.images.filter((u: unknown) => typeof u === "string") : [],
    videos: Array.isArray(raw.videos) ? raw.videos : [],
    featured: Boolean(raw.featured),
    beforeAfter: Array.isArray(raw.beforeAfter) ? raw.beforeAfter : [],
    type: typeof raw.type === "string" && raw.type ? raw.type : undefined,
    area: positive(raw.area),
    frontage: positive(raw.frontage),
    depth: positive(raw.depth),
    floors: positive(raw.floors),
    bedrooms: positive(raw.bedrooms),
    nameEn: text(raw.name_en),
    locationEn: text(raw.location_en),
    kind: raw.kind === "built" || raw.kind === "design" ? raw.kind : undefined,
    duration: positive(raw.duration),
    cost: positive(raw.cost),
    challengeAr: text(raw.challenge_ar),
    challengeEn: text(raw.challenge_en),
    solutionAr: text(raw.solution_ar),
    solutionEn: text(raw.solution_en),
    materials: Array.isArray(raw.materials) && raw.materials.length
      ? raw.materials.filter((n: unknown) => Number.isInteger(n))
      : undefined,
  };
}

// No types and the default ranges: an API that predates filters, or the bundled fallback
const NO_FILTERS: PortfolioFilters = { types: [], areaBounds: DEFAULT_AREA_BOUNDS };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFilters(raw: any): PortfolioFilters {
  if (!raw || typeof raw !== "object") return NO_FILTERS;
  const bounds: number[] = Array.isArray(raw.area_bounds)
    ? raw.area_bounds.filter((n: unknown) => Number.isInteger(n) && (n as number) > 0)
    : [];
  return {
    types: Array.isArray(raw.types)
      ? raw.types.filter((t: SectionItem | null) => typeof t?.id === "string" && typeof t.category === "string")
      : [],
    areaBounds: bounds.length ? [...new Set(bounds)].sort((a, b) => a - b) : DEFAULT_AREA_BOUNDS,
  };
}

async function loadPortfolio(): Promise<{ projects: PortfolioProject[]; filters: PortfolioFilters }> {
  try {
    const res = await fetch(`${API}/api/public/website/portfolio`, {
      next: { revalidate: 3600, tags: [SITE_CONTENT_TAG] },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const body = await res.json();
      if (Array.isArray(body?.projects)) {
        return {
          projects: body.projects.map(toProject).filter((p: PortfolioProject | null): p is PortfolioProject => p !== null),
          filters: toFilters(body.filters),
        };
      }
    }
  } catch {
    // API unreachable — no projects (projects.json keeps only the categories): empty
    // categories hide themselves; never show sample projects as real work
  }
  return { projects: data.projects as PortfolioProject[], filters: NO_FILTERS };
}

// Projects and filters come from one response, deduplicated per request
const getPortfolio = cache(loadPortfolio);

export async function getAllProjects(): Promise<PortfolioProject[]> {
  return (await getPortfolio()).projects;
}

/** Project types and area ranges the category pages filter by. */
export async function getPortfolioFilters(): Promise<PortfolioFilters> {
  return (await getPortfolio()).filters;
}

export async function getProjects(categoryId?: string): Promise<PortfolioProject[]> {
  const projects = await getAllProjects();
  return categoryId ? projects.filter((p) => p.category === categoryId) : projects;
}

/** Categories with at least one project — empty ones are hidden everywhere until they get one. */
export async function getActiveCategories(): Promise<PortfolioCategory[]> {
  const used = new Set((await getAllProjects()).map((p) => p.category));
  return getCategories().filter((c) => used.has(c.id));
}

export async function getProject(projectId: string): Promise<PortfolioProject | undefined> {
  return (await getAllProjects()).find((p) => p.id === projectId);
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  return (await getAllProjects()).filter((p) => p.featured);
}

/**
 * Image URL for a project file. Images managed in the internal app are full
 * URLs (ImgBB / API media) or site paths (`/portfolio/...`); bare filenames
 * are the legacy projects.json format.
 */
export function getProjectImageUrl(categoryId: string, projectId: string, filename: string): string {
  if (/^https?:\/\//.test(filename) || filename.startsWith("/")) return filename;
  return `/portfolio/${categoryId}/${projectId}/${filename}`;
}

export async function getProjectsByCategory(): Promise<
  {
    category: PortfolioCategory;
    projects: PortfolioProject[];
  }[]
> {
  const projects = await getAllProjects();
  return data.categories.map((category) => ({
    category,
    projects: projects.filter((p) => p.category === category.id),
  }));
}
