import { NextResponse } from "next/server";
import { getProjects } from "@/lib/portfolio";

// Compact project list for the client-side GlobalSearch. Cached like the
// portfolio pages (ISR 1h, refreshed by the internal app's «انشر الآن»).
export const revalidate = 3600;

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({
    projects: projects.map(({ id, category, name, description, location, year, images }) => ({
      id,
      category,
      name,
      description,
      location,
      year,
      images: images.slice(0, 1),
      videos: [],
      featured: false,
    })),
  });
}
