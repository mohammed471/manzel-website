import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCategories, getProduct, getProductImageUrl, getProducts } from "@/lib/api";
import { coverImage, relatedProducts } from "@/lib/catalog";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductDetailView from "@/components/products/ProductDetailView";
import ProductCard from "@/components/products/ProductCard";
import { catalogHref } from "@/components/products/catalogHref";

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });
  const product = await getProduct(Number(id));

  if (!product) {
    return { title: tMeta("product_not_found") };
  }

  const title = `${product.name} | ${tBrand("name")}`;
  const description = product.details || tMeta("products_description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(coverImage(product) ? { images: [getProductImageUrl(coverImage(product)!)] } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, products, categories] = await Promise.all([
    getProduct(Number(id)),
    getProducts(),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  const category = categories.find((c) => c.name === product.category);
  const related = relatedProducts(products, product, 4);

  return (
    <>
      {/* Breadcrumb — no dark hero here, so SiteHeader stays solid */}
      <div className="pt-24 md:pt-28 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">
            {tCommon("home")}
          </Link>
          <ChevronLeft className="w-4 h-4 ltr:rotate-180 text-secondary-dark" />
          <Link href="/products" className="hover:text-primary transition-colors">
            {tNav("products")}
          </Link>
          {category && (
            <>
              <ChevronLeft className="w-4 h-4 ltr:rotate-180 text-secondary-dark" />
              <Link href={catalogHref({ category: String(category.id) }, { anchor: true })} className="hover:text-primary transition-colors">
                {category.name}
              </Link>
            </>
          )}
          <ChevronLeft className="w-4 h-4 ltr:rotate-180 text-secondary-dark" />
          <span dir="auto" className="text-text-primary font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="max-w-7xl mx-auto">
          <ProductDetailView product={product} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 pt-6">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <SectionHeader
                title={t("related")}
                action={
                  <Link
                    href={catalogHref(category ? { category: String(category.id) } : {}, { anchor: true })}
                    className="inline-flex h-11 items-center rounded-full border border-primary/25 px-6 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {category ? t("all_in", { name: category.name }) : t("all_products")}
                  </Link>
                }
                className="md:mb-8"
              />
            </AnimatedSection>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
