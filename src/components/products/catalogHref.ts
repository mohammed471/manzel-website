// Builds /products URLs from filter state. Filters live in the URL (shareable,
// back-button friendly, works without JS); changing a filter resets the page.
export interface CatalogParams {
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
}

/** `anchor` jumps to the product grid (used by category/page links, not live search). */
export function catalogHref(params: CatalogParams, { anchor = false }: { anchor?: boolean } = {}) {
  const query: Record<string, string> = {};
  if (params.category) query.category = params.category;
  if (params.subcategory) query.subcategory = params.subcategory;
  if (params.search) query.search = params.search;
  if (params.page && params.page > 1) query.page = String(params.page);
  return { pathname: "/products" as const, query, ...(anchor ? { hash: "catalog" } : {}) };
}
