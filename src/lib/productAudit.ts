// Product data checks for scripts/audit-products.ts (T16). Pure and read-only:
// it reports, the owner fixes the data in the internal app.

export interface AuditProduct {
  id: number;
  name: string;
  cat_name: string | null;
  subcat_name: string | null;
  details: string | null;
  image_path: string | null;
}

export type Issue =
  | "code_like_name"
  | "obviously_wrong"
  | "price_in_details"
  | "internal_note"
  | "no_image"
  | "duplicate_image"
  | "duplicate_name";

export interface AuditRow {
  id: number;
  name: string;
  category: string;
  issue: Issue;
}

const ARABIC = /[؀-ۿ]/;
const INTERNAL_NOTES = ["بدون اي شي", "وا\\ا تطلب"];

const codeLike = (name: string) => !ARABIC.test(name) || name.startsWith(".") || /^[A-Z0-9 .\-_]+$/.test(name);
const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

function countBy<T>(items: T[], key: (item: T) => string | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export function auditProducts(products: AuditProduct[]): AuditRow[] {
  const images = countBy(products, (p) => p.image_path);
  const names = countBy(products, (p) => normalizeName(p.name));
  const rows: AuditRow[] = [];

  for (const p of products) {
    const details = p.details ?? "";
    const issues: Issue[] = [];
    if (codeLike(p.name)) issues.push("code_like_name");
    if (/(^|_)view\d*$/i.test(p.name)) issues.push("obviously_wrong");
    if (/\$|دولار/.test(details)) issues.push("price_in_details");
    if (INTERNAL_NOTES.some((note) => details.includes(note))) issues.push("internal_note");
    if (!p.image_path) issues.push("no_image");
    else if ((images.get(p.image_path) ?? 0) > 1) issues.push("duplicate_image");
    if ((names.get(normalizeName(p.name)) ?? 0) > 1) issues.push("duplicate_name");
    for (const issue of issues) rows.push({ id: p.id, name: p.name, category: p.cat_name ?? "", issue });
  }
  return rows;
}
