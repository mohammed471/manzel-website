import type { Category, Product } from "@/lib/api";

// Server-side catalog helpers. The products page fetches the full list once
// (one ISR-cached request, ~200 KB) and filters/searches/paginates here — so
// switching category or searching never waits on the Flask API's cold start.

export const PAGE_SIZE = 24;

/** Categories worth showing: at least one product. */
export function visibleCategories(categories: Category[]): Category[] {
  return categories
    .filter((c) => c.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count);
}

// Arabic-aware normalisation: strip diacritics/tatweel and unify letter
// variants so "مرايه" finds "مراية" and "اضاءة" finds "إضاءة".
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesSearch(product: Product, query: string): boolean {
  const haystack = normalize(
    [
      product.name,
      product.details,
      product.category,
      product.subcategory ?? "",
      ...product.colors.map((c) => c.name),
    ].join(" "),
  );
  // Every word must appear (in any order)
  return normalize(query)
    .split(" ")
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export interface CatalogQuery {
  category?: Category;
  subcategory?: { id: number; name: string };
  search?: string;
  page: number;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
}

export function queryCatalog(products: Product[], q: CatalogQuery): CatalogResult {
  let list = products;
  if (q.category) list = list.filter((p) => p.category === q.category!.name);
  if (q.subcategory) list = list.filter((p) => p.subcategory === q.subcategory!.name);
  if (q.search?.trim()) list = list.filter((p) => matchesSearch(p, q.search!));

  // Photographed products first (74% of the catalogue has no photo yet), then
  // products with colours, then by name — stable and predictable.
  list = [...list].sort((a, b) => {
    const img = Number(hasImage(b)) - Number(hasImage(a));
    if (img) return img;
    const col = Number(b.colors.length > 0) - Number(a.colors.length > 0);
    if (col) return col;
    return a.name.localeCompare(b.name, "ar");
  });

  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, q.page), pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);
  return { items, total, page, pageCount, from: total ? start + 1 : 0, to: start + items.length };
}

/** A product "has an image" if it or any of its colours has one. */
export function hasImage(p: Product): boolean {
  return Boolean(p.image || p.colors.some((c) => c.image));
}

/** The image to show on a card: product image, else the first colour image. */
export function coverImage(p: Product): string | null {
  return p.image || p.colors.find((c) => c.image)?.image || null;
}

/** Same subcategory first, then same category; photographed ones first. */
export function relatedProducts(products: Product[], product: Product, limit = 4): Product[] {
  const score = (p: Product) =>
    (product.subcategory && p.subcategory === product.subcategory ? 2 : 0) +
    (p.category === product.category ? 1 : 0);
  return products
    .filter((p) => p.id !== product.id && score(p) > 0)
    .sort((a, b) => score(b) - score(a) || Number(hasImage(b)) - Number(hasImage(a)))
    .slice(0, limit);
}
