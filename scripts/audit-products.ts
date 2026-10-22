// T16 — read-only audit of the live product catalogue (and project names).
// Run: node scripts/audit-products.ts   → reports/products-audit.csv + reports/products-audit-summary.md
// It never writes to the API: fix what it finds in the internal app.
import fs from "node:fs";
import { auditProducts, type AuditProduct } from "../src/lib/productAudit.ts";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://manzel.onrender.com";

async function getJson(path: string) {
  const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
}

type ApiProduct = AuditProduct & { price_retail?: number | null; currency?: string | null };

const { products } = (await getJson("/api/public/products")) as { products: ApiProduct[] };
const { projects } = (await getJson("/api/public/website/portfolio")) as { projects: { id: string; name: string }[] };

const rows = auditProducts(products);
const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
const csv = ["id,name,category,issue", ...rows.map((r) => [r.id, r.name, r.category, r.issue].map(csvCell).join(","))];

const counts = new Map<string, number>();
for (const r of rows) counts.set(r.issue, (counts.get(r.issue) ?? 0) + 1);
const withPrice = products.filter((p) => typeof p.price_retail === "number" && p.price_retail > 0);
const currencies = [...new Set(withPrice.map((p) => p.currency ?? "?"))].join(", ");
const pairs = new Map<string, number>();
for (const p of products) {
  const key = `${p.cat_name ?? "—"} › ${p.subcat_name ?? "—"}`;
  pairs.set(key, (pairs.get(key) ?? 0) + 1);
}
// «أستقبال»-style hamza errors: hamzat al-wasl words written with «أ»
const projectTypos = projects.filter((p) => /(^|\s)أست/.test(p.name));

const summary = [
  `# Products audit — ${new Date().toISOString().slice(0, 10)}`,
  "",
  `Products checked: ${products.length}. Rows in products-audit.csv: ${rows.length} (a product can have several issues).`,
  "",
  "| Issue | Products |",
  "|---|---|",
  ...[...counts].sort((a, b) => b[1] - a[1]).map(([issue, n]) => `| ${issue} | ${n} |`),
  "",
  "## Prices (T18 — decision pending)",
  "",
  `The API already sends \`price_retail\` for ${withPrice.length} of ${products.length} products (currency: ${currencies || "—"}).`,
  "The website does not show them. Prices written inside descriptions are the `price_in_details` rows above.",
  "",
  "## Category › subcategory pairs (check the naming)",
  "",
  ...[...pairs].sort().map(([pair, n]) => `- ${pair} (${n})`),
  "",
  "## Project names",
  "",
  ...(projectTypos.length ? projectTypos.map((p) => `- \`${p.id}\`: «${p.name}» — hamza on «است…» (should be «است»)`) : ["- nothing found"]),
  "",
];

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/products-audit.csv", "\uFEFF" + csv.join("\n") + "\n");
fs.writeFileSync("reports/products-audit-summary.md", summary.join("\n"));
console.log(summary.slice(0, 14).join("\n"));
