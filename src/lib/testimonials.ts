import data from "@/data/testimonials.json";
import { getSiteSections, localized } from "@/lib/siteContent";

// Testimonials are edited in the internal app («الموقع» → آراء العملاء) and
// arrive with the site content. testimonials.json is only the fallback for
// when the API is unreachable — an empty list from the app is respected.

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number;
  imageUrl: string | null;
}

/** Site paths (/testimonials/…) and full URLs pass through; bare filenames live in /testimonials/. */
export function getTestimonialImageUrl(image: string): string {
  return /^(https?:)?\//.test(image) ? image : `/testimonials/${image}`;
}

export async function getTestimonials(locale: string): Promise<Testimonial[]> {
  const sections = await getSiteSections();
  if (sections) {
    return sections.testimonials.map((item, i) => {
      const image = typeof item.image === "string" ? item.image : "";
      const rating = Number(item.rating);
      return {
        id: String(item.id ?? i),
        name: localized(item, "name", locale),
        role: localized(item, "role", locale),
        location: localized(item, "location", locale),
        text: localized(item, "text", locale),
        rating: rating >= 1 && rating <= 5 ? Math.round(rating) : 5,
        imageUrl: image ? getTestimonialImageUrl(image) : null,
      };
    });
  }
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    location: item.location,
    text: item.text,
    rating: item.rating,
    imageUrl: item.image ? getTestimonialImageUrl(item.image) : null,
  }));
}
