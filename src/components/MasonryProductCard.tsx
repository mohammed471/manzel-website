"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import BlurImage from "@/components/BlurImage";
import type { Product } from "@/lib/api";
import { getProductImageUrl } from "@/lib/api";

interface MasonryProductCardProps {
  product: Product;
}

export default function MasonryProductCard({
  product,
}: MasonryProductCardProps) {
  const t = useTranslations("products");

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative rounded-xl overflow-hidden bg-secondary-light">
        {product.image ? (
          <BlurImage
            src={getProductImageUrl(product.image)}
            alt={product.name}
            width={800}
            height={1000}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="aspect-[3/4] w-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-text-secondary/20"
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

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-display text-white text-lg font-bold leading-tight mt-1">
            {product.name}
          </h3>
          <span className="text-white/80 text-sm mt-1">
            {t("view_details")}
          </span>
        </div>
      </div>
    </Link>
  );
}
