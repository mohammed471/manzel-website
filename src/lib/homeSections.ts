import type { PortfolioProject } from "@/lib/portfolio";

// Pure helpers behind the home page sections (no data imports — tested in homeSections.test.ts).

/** The featured projects with a cover; none marked → the newest (by year) with a cover. At most `n`. */
export function pickFeatured(projects: PortfolioProject[], n = 3): PortfolioProject[] {
  const withCover = projects.filter((p) => p.images.length > 0);
  const featured = withCover.filter((p) => p.featured);
  if (featured.length > 0) return featured.slice(0, n);
  return [...withCover].sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)).slice(0, n);
}

/** Design-vs-build pairs across projects (in project order), each with its project. At most `n`. */
export function pickPairs(projects: PortfolioProject[], n = 4) {
  return projects
    .flatMap((p) => (p.beforeAfter ?? []).filter((x) => x.before && x.after).map((pair) => ({ ...pair, project: p })))
    .slice(0, n);
}

/** "21.5" spends → each month's share of the running total, in whole %; unreadable spends count as 0. */
export function cumulativePct(spent: string[]): number[] {
  const values = spent.map((s) => Math.max(0, Number(s) || 0));
  const total = values.reduce((a, b) => a + b, 0);
  let sum = 0;
  return values.map((v) => {
    sum += v;
    return total > 0 ? Math.round((sum / total) * 100) : 0;
  });
}
