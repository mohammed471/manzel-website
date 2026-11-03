import { notFound } from "next/navigation";

// Unknown paths under a locale (/ar/anything/else) render the translated
// [locale]/not-found.tsx inside the site layout, instead of Next's bare
// English 404 page without lang/dir.
export default function CatchAllNotFound() {
  notFound();
}
