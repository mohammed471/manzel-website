"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Category } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProductsFilterProps {
  categories: Category[];
  currentCategory?: string;
  currentSubcategory?: string;
  currentSearch?: string;
}

export default function ProductsFilter({
  categories,
  currentCategory,
  currentSubcategory,
  currentSearch,
}: ProductsFilterProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(currentSearch ?? "");

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Find the active category object to display its subcategories
  const activeCategory = safeCategories.find(
    (c) => String(c.id) === currentCategory
  );

  // Build URL with updated params
  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = searchValue.trim();
      const url = buildUrl({
        search: trimmed || undefined,
      });
      router.replace(url, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue, buildUrl, router]);

  const handleCategoryChange = (categoryId?: string) => {
    const url = buildUrl({
      category: categoryId,
      subcategory: undefined, // reset subcategory when changing category
    });
    router.replace(url, { scroll: false });
  };

  const handleSubcategoryChange = (subcategoryId?: string) => {
    const url = buildUrl({
      subcategory: subcategoryId,
    });
    router.replace(url, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="max-w-md mx-auto relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("search_placeholder")}
          className="w-full bg-transparent border-b-2 border-secondary-dark px-4 py-3 pe-12 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors duration-300"
        />
        <svg
          className="absolute top-1/2 end-4 -translate-y-1/2 w-5 h-5 text-text-secondary/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Pills */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex flex-wrap justify-center gap-3 pb-2">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
              !currentCategory
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-text-secondary border-secondary-dark hover:border-primary hover:text-primary"
            )}
          >
            {t("all")}
          </button>
          {safeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(String(category.id))}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                currentCategory === String(category.id)
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-text-secondary border-secondary-dark hover:border-primary hover:text-primary"
              )}
            >
              {category.name}
              <span
                className={cn(
                  "ms-1.5 text-xs",
                  currentCategory === String(category.id)
                    ? "text-white/70"
                    : "text-text-secondary/50"
                )}
              >
                ({category.product_count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Pills */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex flex-wrap justify-center gap-2 pb-2">
            <button
              onClick={() => handleSubcategoryChange(undefined)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border",
                !currentSubcategory
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-text-secondary border-secondary-dark hover:border-primary hover:text-primary"
              )}
            >
              {t("all_in", { name: activeCategory.name })}
            </button>
            {activeCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubcategoryChange(String(sub.id))}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border",
                  currentSubcategory === String(sub.id)
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-text-secondary border-secondary-dark hover:border-primary hover:text-primary"
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
