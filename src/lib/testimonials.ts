import data from "@/data/testimonials.json";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number;
  project: string | null;
  image: string | null;
}

export function getTestimonials(): Testimonial[] {
  return data as Testimonial[];
}

export function getTestimonial(id: string): Testimonial | undefined {
  return (data as Testimonial[]).find((t) => t.id === id);
}

export function getTestimonialImageUrl(filename: string): string {
  return `/testimonials/${filename}`;
}
