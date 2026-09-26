import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/api";
import { coverImage } from "@/lib/catalog";
import ColorDots from "@/components/products/ColorDots";
import ProductImage from "@/components/products/ProductImage";

// Uniform catalogue card: square media area (photo on white, or a branded
// category placeholder), then category, name, one line of details, swatches.
// Server component; only the image (for its load-error fallback) is client-side.
export default async function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = await getTranslations("products");
  const image = coverImage(product);
  const eyebrow = product.subcategory || product.category || t("uncategorized");

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white border border-secondary-dark/40 transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-[0_16px_36px_-20px_rgba(21,60,56,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <ProductImage
          image={image}
          alt={product.name}
          category={product.category}
          categoryLabel={product.category || t("uncategorized")}
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-secondary-dark/30 p-3.5 md:p-4">
        <span className="text-[11px] md:text-xs font-medium text-accent line-clamp-1">{eyebrow}</span>
        <h3
          dir="auto"
          className="text-sm md:text-base font-bold leading-snug text-text-primary line-clamp-2"
          style={{ fontFamily: "var(--font-arabic-body), var(--font-english), sans-serif" }}
        >
          {product.name}
        </h3>
        {product.details && (
          <p dir="auto" className="text-xs text-text-secondary leading-relaxed line-clamp-1">
            {product.details}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 min-h-6">
          <ColorDots colors={product.colors} unavailableLabel={t("unavailable")} />
        </div>
      </div>
    </Link>
  );
}
