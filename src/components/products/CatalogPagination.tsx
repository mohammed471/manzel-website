import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { catalogHref, type CatalogParams } from "@/components/products/catalogHref";

// Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 25
function pageList(page: number, count: number): (number | "gap")[] {
  const pages = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export default async function CatalogPagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  params: Omit<CatalogParams, "page">;
}) {
  if (pageCount <= 1) return null;
  const t = await getTranslations("products");
  const base = "inline-flex items-center justify-center h-11 min-w-11 rounded-full px-3 text-sm font-medium transition-colors";

  return (
    <nav aria-label={t("pagination")} className="mt-12 flex items-center justify-center gap-1.5 flex-wrap">
      {page > 1 ? (
        <Link href={catalogHref({ ...params, page: page - 1 }, { anchor: true })} className={cn(base, "gap-1 bg-white border border-secondary-dark/60 text-text-primary hover:border-primary/40")}>
          <ChevronRight className="w-4 h-4 ltr:rotate-180" />
          <span className="hidden sm:inline">{t("page_prev")}</span>
        </Link>
      ) : null}

      {pageList(page, pageCount).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-text-secondary" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={catalogHref({ ...params, page: p }, { anchor: true })}
            aria-label={t("page_label", { page: p })}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, "tabular-nums", p === page ? "bg-primary text-white" : "text-text-primary hover:bg-white")}
          >
            {p}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={catalogHref({ ...params, page: page + 1 }, { anchor: true })} className={cn(base, "gap-1 bg-white border border-secondary-dark/60 text-text-primary hover:border-primary/40")}>
          <span className="hidden sm:inline">{t("page_next")}</span>
          <ChevronLeft className="w-4 h-4 ltr:rotate-180" />
        </Link>
      ) : null}
    </nav>
  );
}
