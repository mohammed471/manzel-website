import { getSiteSections, localized } from "@/lib/siteContent";
import { getProject } from "@/lib/portfolio";

// Testimonials are edited in the internal app («الموقع» → آراء العملاء) and
// arrive with the site content. Only those marked `verified` are shown — real
// clients who agreed to be quoted. There is no bundled fallback: when the API is
// unreachable the section is hidden rather than filled with template quotes.

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number;
  imageUrl: string | null;
  /** The project page this client's work is shown on, if any. */
  projectHref: string | null;
}

/** Site paths (/testimonials/…) and full URLs pass through; bare filenames live in /testimonials/. */
export function getTestimonialImageUrl(image: string): string {
  return /^(https?:)?\//.test(image) ? image : `/testimonials/${image}`;
}

const isVerified = (v: unknown) => v === true || v === 1 || v === "1" || v === "true";

export async function getTestimonials(locale: string): Promise<Testimonial[]> {
  const sections = await getSiteSections();
  if (!sections) return [];
  const verified = sections.testimonials.filter((item) => isVerified(item.verified));
  return Promise.all(
    verified.map(async (item, i) => {
      const image = typeof item.image === "string" ? item.image : "";
      const rating = Number(item.rating);
      const project = typeof item.project === "string" && item.project ? await getProject(item.project) : undefined;
      return {
        id: String(item.id ?? i),
        name: localized(item, "name", locale),
        role: localized(item, "role", locale),
        location: localized(item, "location", locale),
        text: localized(item, "text", locale),
        rating: rating >= 1 && rating <= 5 ? Math.round(rating) : 5,
        imageUrl: image ? getTestimonialImageUrl(image) : null,
        projectHref: project ? `/portfolio/${project.category}/${project.id}` : null,
      };
    }),
  );
}
