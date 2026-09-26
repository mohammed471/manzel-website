import { getTranslations } from "next-intl/server";
import { LayoutGrid } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/api";
import { cn } from "@/lib/utils";
import { categoryIcon } from "@/components/products/categoryIcon";
import { catalogHref } from "@/components/products/catalogHref";

// Category + subcategory navigation as plain links (server component, no JS).
// Desktop: sticky sidebar with nested subcategories.
// Mobile/tablet: horizontally scrollable category chips + subcategory chips.
export default async function CategoryNav({
  categories,
  total,
  activeCategory,
  activeSubcategory,
  search,
}: {
  categories: Category[];
  total: number;
  activeCategory?: Category;
  activeSubcategory?: { id: number; name: string };
  search?: string;
}) {
  const t = await getTranslations("products");
  const subs = activeCategory?.subcategories ?? [];

  return (
    <>
      {/* ── Mobile / tablet ── */}
      <nav aria-label={t("categories")} className="lg:hidden space-y-3">
        <ul className="-mx-4 px-4 sm:-mx-6 sm:px-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="shrink-0">
            <Chip href={catalogHref({ search }, { anchor: true })} active={!activeCategory} icon={LayoutGrid} label={t("all_products")} count={total} />
          </li>
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <Chip
                href={catalogHref({ category: String(c.id), search }, { anchor: true })}
                active={activeCategory?.id === c.id}
                icon={categoryIcon(c.name)}
                label={c.name}
                count={c.product_count}
              />
            </li>
          ))}
        </ul>
        {subs.length > 0 && activeCategory && (
          <ul className="-mx-4 px-4 sm:-mx-6 sm:px-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li className="shrink-0">
              <SubChip href={catalogHref({ category: String(activeCategory.id), search }, { anchor: true })} active={!activeSubcategory} label={t("all_in", { name: activeCategory.name })} />
            </li>
            {subs.map((s) => (
              <li key={s.id} className="shrink-0">
                <SubChip
                  href={catalogHref({ category: String(activeCategory.id), subcategory: String(s.id), search }, { anchor: true })}
                  active={activeSubcategory?.id === s.id}
                  label={s.name}
                />
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* ── Desktop sidebar ── */}
      <nav aria-label={t("categories")} className="hidden lg:block sticky top-28">
        <p className="px-3 pb-3 text-xs font-bold text-text-secondary">{t("categories")}</p>
        <ul className="space-y-1">
          <li>
            <SideLink href={catalogHref({ search }, { anchor: true })} active={!activeCategory} icon={LayoutGrid} label={t("all_products")} count={total} />
          </li>
          {categories.map((c) => {
            const active = activeCategory?.id === c.id;
            return (
              <li key={c.id}>
                <SideLink
                  href={catalogHref({ category: String(c.id), search }, { anchor: true })}
                  active={active && !activeSubcategory}
                  open={active}
                  icon={categoryIcon(c.name)}
                  label={c.name}
                  count={c.product_count}
                />
                {active && c.subcategories.length > 0 && (
                  <ul className="mt-1 mb-2 ms-7 border-s border-secondary-dark/60 ps-3 space-y-0.5">
                    {c.subcategories.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={catalogHref({ category: String(c.id), subcategory: String(s.id), search }, { anchor: true })}
                          aria-current={activeSubcategory?.id === s.id ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            activeSubcategory?.id === s.id
                              ? "bg-primary/[0.07] font-bold text-primary"
                              : "text-text-secondary hover:text-primary",
                          )}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

type Href = ReturnType<typeof catalogHref>;

function Chip({ href, active, icon: Icon, label, count }: { href: Href; active: boolean; icon: React.ElementType; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border ps-3 pe-4 text-sm font-medium whitespace-nowrap transition-colors",
        active ? "border-primary bg-primary text-white" : "border-secondary-dark/60 bg-white text-text-primary hover:border-primary/40",
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {label}
      <span className={cn("text-xs tabular-nums", active ? "text-white/70" : "text-text-secondary")}>{count}</span>
    </Link>
  );
}

function SubChip({ href, active, label }: { href: Href; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-full px-4 text-xs font-medium whitespace-nowrap transition-colors",
        active ? "bg-accent text-white" : "bg-secondary text-text-primary hover:bg-secondary-dark",
      )}
    >
      {label}
    </Link>
  );
}

function SideLink({
  href,
  active,
  open = false,
  icon: Icon,
  label,
  count,
}: {
  href: Href;
  active: boolean;
  open?: boolean;
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-primary text-white"
          : open
            ? "bg-primary/[0.07] font-bold text-primary"
            : "text-text-primary hover:bg-white",
      )}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
      <span className="flex-1 truncate">{label}</span>
      <span className={cn("text-xs tabular-nums", active ? "text-white/70" : "text-text-secondary")}>{count}</span>
    </Link>
  );
}
