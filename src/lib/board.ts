import type { Product, ProductColor } from "@/lib/api";
import type { PortfolioProject } from "@/lib/portfolio";
import { coverImage } from "@/lib/catalog";

// «لوحتي» — the visitor's saved products and projects. A board is a list of
// entries, newest first, and the same text is its link and its stored form:
//   /board?i=p12.3~jcafeteria-karbala~p45
// p<id> = product, p<id>.<colour id> = product in that colour, j<slug> = project
// (floor plans are projects). Only URL-safe characters, so nothing is encoded.
// Pure — no data imports — so the heart button on every card stays small.

export type BoardEntry = string;

export type BoardItem =
  | { kind: "product"; entry: BoardEntry; product: Product; color: ProductColor | null }
  | { kind: "project"; entry: BoardEntry; project: PortfolioProject };

// ponytail: keeps the link short enough to paste anywhere; past it the oldest item drops.
export const BOARD_MAX = 60;

// The slug shape is the internal app's (_SLUG_RE in core/db/website_portfolio.py)
const VALID_ENTRY = /^(?:p\d+(?:\.\d+)?|j[a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** What an entry points at, whatever colour it was saved in: "p12.3" → "p12" */
const entryId = (entry: BoardEntry) => entry.replace(/\..*$/, "");

/** Entries from a link or from storage: invalid ones dropped, one per product / project. */
export function parseBoard(param: string | null | undefined): BoardEntry[] {
  const seen = new Set<string>();
  const entries: BoardEntry[] = [];
  for (const entry of (param ?? "").split("~")) {
    if (!VALID_ENTRY.test(entry) || seen.has(entryId(entry))) continue;
    seen.add(entryId(entry));
    entries.push(entry);
    if (entries.length === BOARD_MAX) break;
  }
  return entries;
}

export const boardParam = (entries: BoardEntry[]) => entries.join("~");

export function boardHref(entries: BoardEntry[]): string {
  return entries.length ? `/board?i=${boardParam(entries)}` : "/board";
}

export function isSaved(entries: BoardEntry[], entry: BoardEntry): boolean {
  return entries.some((saved) => entryId(saved) === entryId(entry));
}

/** Save (newest first) or, if it is already saved in any colour, remove. */
export function toggleEntry(entries: BoardEntry[], entry: BoardEntry): BoardEntry[] {
  return isSaved(entries, entry)
    ? entries.filter((saved) => entryId(saved) !== entryId(entry))
    : [entry, ...entries].slice(0, BOARD_MAX);
}

/** The products and projects behind the entries, in order; ones that no longer exist are left out. */
export function resolveBoard(
  entries: BoardEntry[],
  products: Product[],
  projects: PortfolioProject[],
): BoardItem[] {
  return entries.flatMap((entry): BoardItem[] => {
    if (entry.startsWith("j")) {
      const project = projects.find((p) => p.id === entry.slice(1));
      return project ? [{ kind: "project", entry, project }] : [];
    }
    const [id, colorId] = entry.slice(1).split(".").map(Number);
    const product = products.find((p) => p.id === id);
    if (!product) return [];
    const color = product.colors.find((c) => c.id === colorId) ?? null;
    // Shown as that colour: its photo (the product's if it has none) and its swatch alone
    const shown = color ? { ...product, image: color.image ?? coverImage(product), colors: [color] } : product;
    return [{ kind: "product", entry, product: shown, color }];
  });
}

export function itemLabel(item: BoardItem): string {
  if (item.kind === "project") return item.project.name;
  return item.color ? `${item.product.name} — ${item.color.name}` : item.product.name;
}

/**
 * The WhatsApp text: intro, one line per item, then the board's link. `budget` caps
 * the text as it travels in the wa.me link (Arabic is 6 characters a letter there):
 * names that don't fit become "+ N more" — the link, always last, shows them all.
 */
export function boardMessage({
  intro,
  labels,
  more,
  url,
  budget = 2500,
}: {
  intro: string;
  labels: string[];
  more: (count: number) => string;
  url: string;
  budget?: number;
}): string {
  const compose = (listed: string[]) => {
    const left = labels.length - listed.length;
    return [intro, ...listed.map((label) => `• ${label}`), ...(left ? [more(left)] : []), "", url].join("\n");
  };
  let listed: string[] = [];
  for (const label of labels) {
    if (encodeURIComponent(compose([...listed, label])).length > budget) break;
    listed = [...listed, label];
  }
  return compose(listed);
}
