import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PackageSearch, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCategories, getProducts } from "@/lib/api";
import { queryCatalog, visibleCategories } from "@/lib/catalog";
import PageHero from "@/components/ui/PageHero";
import ClosingCTA from "@/components/home/ClosingCTA";
import CatalogSearch from "@/components/products/CatalogSearch";
import CategoryNav from "@/components/products/CategoryNav";
import ProductCard from "@/components/products/ProductCard";
import CatalogPagination from "@/components/products/CatalogPagination";
import { catalogHref } from "@/components/products/catalogHref";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("products_title"),
    description: t("products_description"),
    openGraph: {
      title: t("products_title"),
      description: t("products_description"),
      type: "website",
    },
  };
}

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations("products");
  const sp = await searchParams;

  // One cached request each; filtering/search/pagination happen in lib/catalog.
  const [allCategories, products] = await Promise.all([getCategories(), getProducts()]);

  // Hide empty categories and subcategories (counts computed from real products).
  const subKeys = new Set(products.filter((p) => p.subcategory).map((p) => `${p.category}|${p.subcategory}`));
  const categories = visibleCategories(allCategories).map((c) => ({
    ...c,
    subcategories: c.subcategories.filter((s) => subKeys.has(`${c.name}|${s.name}`)),
  }));

  const activeCategory = categories.find((c) => String(c.id) === sp.category);
  const activeSubcategory = activeCategory?.subcategories.find((s) => String(s.id) === sp.subcategory);
  const search = sp.search?.trim() || undefined;

  const result = queryCatalog(products, {
    category: activeCategory,
    subcategory: activeSubcategory,
    search,
    page: Number(sp.page) || 1,
  });

  const heading = search
    ? t("search_results_for", { query: search })
    : (activeSubcategory?.name ?? activeCategory?.name ?? t("all_products"));
  const hasFilters = Boolean(activeCategory || search);
  const filterParams = {
    category: activeCategory ? String(activeCategory.id) : undefined,
    subcategory: activeSubcategory ? String(activeSubcategory.id) : undefined,
    search,
  };

  return (
    <>
      <PageHero imageUrl="/images/products-hero.webp" title={t("hero_heading")} description={t("hero_tagline")} compact>
        <div className="max-w-xl">
          <Suspense fallback={<div className="h-13 rounded-full bg-white/90" />}>
            <CatalogSearch key={search ?? ""} initial={search} />
          </Suspense>
        </div>
      </PageHero>

      <section id="catalog" className="scroll-mt-20 md:scroll-mt-24 px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-10">
          <aside className="min-w-0">
            <CategoryNav
              categories={categories}
              total={products.length}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              search={search}
            />
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-5 md:mb-6 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl text-primary leading-tight truncate">{heading}</h2>
                {result.total > 0 && (
                  <p className="mt-1 text-sm text-text-secondary tabular-nums">
                    {t("showing", { from: result.from, to: result.to, total: result.total })}
                  </p>
                )}
              </div>
              {hasFilters && (
                <Link
                  href={catalogHref({}, { anchor: true })}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-secondary-dark/60 bg-white px-4 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <X className="w-4 h-4" />
                  {t("clear_filters")}
                </Link>
              )}
            </div>

            {result.items.length > 0 ? (
              <>
                <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {result.items.map((product, i) => (
                    <li key={product.id}>
                      <ProductCard product={product} priority={i < 4} />
                    </li>
                  ))}
                </ul>
                <CatalogPagination page={result.page} pageCount={result.pageCount} params={filterParams} />
              </>
            ) : (
              <div className="rounded-3xl bg-white border border-secondary-dark/40 px-6 py-16 text-center">
                <span className="mx-auto flex w-16 h-16 items-center justify-center rounded-2xl bg-secondary-light text-primary/40">
                  <PackageSearch className="w-8 h-8" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 text-xl text-primary">{t("no_products")}</h3>
                <p className="mt-2 text-text-secondary max-w-sm mx-auto leading-relaxed">{t("no_products_desc")}</p>
                {hasFilters && (
                  <Link
                    href={catalogHref({}, { anchor: true })}
                    className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-light"
                  >
                    {t("clear_filters")}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <ClosingCTA title={t("inquiry_hint")} />
    </>
  );
}
