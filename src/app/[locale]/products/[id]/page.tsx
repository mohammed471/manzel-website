import type { Metadata } from "next";
import BlurImage from "@/components/BlurImage";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProduct, getProductImageUrl } from "@/lib/api";
import AnimatedSection from "@/components/AnimatedSection";

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
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(Number(id));

  if (!product) {
    notFound();
  }

  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  const whatsappMessage = encodeURIComponent(
    t("whatsapp_message", { name: product.name })
  );
  const whatsappUrl = `https://wa.me/9647700000000?text=${whatsappMessage}`;

  return (
    <>
      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 pt-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-48 h-48 border border-white/10 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 noise-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            {/* Back Link */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {t("back_to_products")}
            </Link>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/50">
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                {tCommon("home")}
              </Link>
              <svg
                className="w-4 h-4 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <Link
                href="/products"
                className="hover:text-white transition-colors"
              >
                {tNav("products")}
              </Link>
              <svg
                className="w-4 h-4 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-white/80 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </nav>
          </AnimatedSection>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-12 md:py-16 bg-white bg-geometric">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Product Image */}
            <AnimatedSection variant="fadeIn">
              <div className="relative bg-surface rounded-2xl overflow-hidden aspect-square shadow-sm border border-gray-100">
                {product.image ? (
                  <BlurImage
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-text-secondary/20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Product Info */}
            <AnimatedSection delay={0.15} variant="slideRight">
              <div className="flex flex-col h-full">
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="inline-flex items-center bg-accent/10 text-accent-light text-sm font-medium px-4 py-1.5 rounded-full">
                      {product.subcategory}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary leading-tight">
                  {product.name}
                </h1>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 mt-6 mb-6" />

                {/* Details */}
                {product.details && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-3">
                      {t("details")}
                    </h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                      {product.details}
                    </p>
                  </div>
                )}

                {/* Spacer to push button to bottom on desktop */}
                <div className="flex-grow" />

                {/* WhatsApp Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg w-full shadow-lg shadow-[#25D366]/20"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t("whatsapp_inquiry")}
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
