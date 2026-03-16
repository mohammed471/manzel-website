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
}

export function getCategories(): PortfolioCategory[] {
  return data.categories;
}

export function getCategory(categoryId: string): PortfolioCategory | undefined {
  return data.categories.find((c) => c.id === categoryId);
}

export function getProjects(categoryId?: string): PortfolioProject[] {
  const projects = data.projects as PortfolioProject[];
  if (categoryId) {
    return projects.filter((p) => p.category === categoryId);
  }
  return projects;
}

export function getProject(projectId: string): PortfolioProject | undefined {
  return (data.projects as PortfolioProject[]).find((p) => p.id === projectId);
}

export function getFeaturedProjects(): PortfolioProject[] {
  return (data.projects as PortfolioProject[]).filter((p) => p.featured);
}

export function getProjectImageUrl(
  categoryId: string,
  projectId: string,
  filename: string,
): string {
  return `/portfolio/${categoryId}/${projectId}/${filename}`;
}

export function getProjectsByCategory(): {
  category: PortfolioCategory;
  projects: PortfolioProject[];
}[] {
  return data.categories.map((category) => ({
    category,
    projects: (data.projects as PortfolioProject[]).filter(
      (p) => p.category === category.id,
    ),
  }));
}
