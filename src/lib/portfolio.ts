import { cache } from "react";
import { SITE_CONTENT_TAG } from "@/lib/cacheTags";
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
}

export function getCategories(): PortfolioCategory[] {
  return data.categories;
}

export function getCategory(categoryId: string): PortfolioCategory | undefined {
  return data.categories.find((c) => c.id === categoryId);
}

// ── Projects: managed in the internal app («الموقع» → مشاريع المعرض) ──────────
// Served by /api/public/website/portfolio in the same shape as projects.json.
// projects.json is only a fallback for when the API can't be reached — an
// empty list from a healthy API is respected (all projects deleted).

const API = process.env.NEXT_PUBLIC_API_URL;
export { SITE_CONTENT_TAG };

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
  };
}

async function loadProjects(): Promise<PortfolioProject[]> {
  try {
    const res = await fetch(`${API}/api/public/website/portfolio`, {
      next: { revalidate: 3600, tags: [SITE_CONTENT_TAG] },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const body = await res.json();
      if (Array.isArray(body?.projects)) {
        return body.projects.map(toProject).filter((p: PortfolioProject | null): p is PortfolioProject => p !== null);
      }
    }
  } catch {
    // API unreachable — fall through to the bundled copy
  }
  return data.projects as PortfolioProject[];
}

/** All projects, deduplicated per request. */
export const getAllProjects = cache(loadProjects);

export async function getProjects(categoryId?: string): Promise<PortfolioProject[]> {
  const projects = await getAllProjects();
  return categoryId ? projects.filter((p) => p.category === categoryId) : projects;
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
