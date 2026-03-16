import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/api";
import AnimatedSection from "@/components/AnimatedSection";
import ProductCard from "@/components/ProductCard";
import ProductsFilter from "@/components/ProductsFilter";
import Card3D from "@/components/Card3D";

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
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations("products");
  const { category, subcategory, search } = await searchParams;

  const [categoriesData, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      category_id: category ? Number(category) : undefined,
      subcategory_id: subcategory ? Number(subcategory) : undefined,
      search: search || undefined,
    }),
  ]);

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const products = Array.isArray(productsData) ? productsData : [];

  return (
    <>
      {/* Editorial Hero */}
      <section className="relative min-h-[50vh] sm:min-h-[55vh] lg:min-h-[60vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/products-hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/70 via-primary/50 to-primary-dark/80" />
        <div className="absolute inset-0 noise-overlay" />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            <AnimatedSection>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight whitespace-pre-line">
                {t("hero_heading")}
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-xl leading-relaxed">
                {t("hero_tagline")}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-24 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
                {t("our_products")}
              </h2>
              <div className="w-16 h-0.5 bg-accent mx-auto mt-4 rounded-full" />
            </div>
          </AnimatedSection>

          {/* Filter — no wrapper card */}
          <AnimatedSection>
            <div className="mb-12">
              <Suspense fallback={null}>
                <ProductsFilter
                  categories={categories}
                  currentCategory={category}
                  currentSubcategory={subcategory}
                  currentSearch={search}
                />
              </Suspense>
            </div>
          </AnimatedSection>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product, i) => (
                <AnimatedSection key={product.id} delay={i < 8 ? i * 0.06 : 0} variant="scaleIn">
                  <Card3D>
                    <ProductCard product={product} />
                  </Card3D>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <AnimatedSection>
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-light rounded-full mb-6">
                  <svg
                    className="w-10 h-10 text-text-secondary/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {t("no_products")}
                </h3>
                <p className="text-text-secondary max-w-sm mx-auto">
                  {t("no_products_desc")}
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
