"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { catalogHref } from "@/components/products/catalogHref";

// Search field for the catalogue. A plain GET form (works before hydration),
// upgraded with a debounced URL update while typing. Keeps the active
// category/subcategory and resets pagination.
export default function CatalogSearch({ initial }: { initial?: string }) {
  const t = useTranslations("products");
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initial ?? "");
  const lastPushed = useRef(initial ?? "");

  const push = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === lastPushed.current) return;
    lastPushed.current = trimmed;
    router.replace(
      catalogHref({
        category: params.get("category") ?? undefined,
        subcategory: params.get("subcategory") ?? undefined,
        search: trimmed || undefined,
      }),
      { scroll: false },
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => push(value), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      action=""
      method="get"
      onSubmit={(e) => {
        // Enter / the keyboard's "search" key: apply now and dismiss the keyboard
        e.preventDefault();
        push(value);
        (document.activeElement as HTMLElement | null)?.blur();
      }}
      className="relative"
    >
      {params.get("category") && (
        <input type="hidden" name="category" value={params.get("category")!} />
      )}
      {params.get("subcategory") && (
        <input
          type="hidden"
          name="subcategory"
          value={params.get("subcategory")!}
        />
      )}
      <label htmlFor="catalog-search" className="sr-only">
        {t("search_label")}
      </label>
      <Search className="pointer-events-none absolute top-1/2 start-4 -translate-y-1/2 w-5 h-5 text-text-secondary" />
      <input
        id="catalog-search"
        name="search"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search_placeholder")}
        className="w-full h-13 rounded-full bg-white border border-secondary-dark/60 ps-12 pe-12 text-base text-text-primary placeholder:text-text-secondary/70 transition-colors focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label={t("clear_search")}
          className="absolute top-1/2 end-2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-secondary-light hover:text-primary cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
