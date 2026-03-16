import { Link } from "@/i18n/navigation";
import BlurImage from "@/components/BlurImage";
import type { Product } from "@/lib/api";
import { getProductImageUrl } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-secondary-light overflow-hidden">
        {product.image ? (
          <BlurImage
            src={getProductImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
      </div>

      {/* Content */}
      <div className="pt-4">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {product.category}
        </span>
        <h3 className="text-base font-bold text-text-primary mt-1 group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {product.name}
        </h3>
      </div>
    </Link>
  );
}
