"use client";

import { useState } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/api";
import { loaderFor } from "@/lib/imageLoader";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/products/categoryIcon";

// Product photo with a branded fallback. Some products reference an image file
// that no longer exists on the API server — show the category placeholder
// instead of a broken-image icon.
export default function ProductImage({
  image,
  alt,
  category,
  categoryLabel,
  sizes,
  priority = false,
  large = false,
  className,
}: {
  image: string | null;
  alt: string;
  category: string | null;
  categoryLabel: string;
  sizes: string;
  priority?: boolean;
  large?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // An R2 image whose thumb failed is retried full-size before giving up on it
  const [fullOnlySrc, setFullOnlySrc] = useState<string | null>(null);

  if (!image || failedSrc === image) {
    return (
      <div
        className={cn(
          "absolute flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondary-light text-primary/25",
          large ? "inset-3" : "inset-2",
        )}
      >
        <CategoryIcon name={category ?? undefined} className={large ? "w-20 h-20" : "w-12 h-12 md:w-14 md:h-14"} strokeWidth={large ? 1 : 1.25} />
        <span className={cn("px-3 text-center font-medium text-primary/65 line-clamp-1", large ? "text-sm" : "text-[11px]")}>
          {categoryLabel}
        </span>
      </div>
    );
  }

  const src = getProductImageUrl(image);
  const loader = loaderFor(src);
  const fullOnly = fullOnlySrc === image;

  return (
    <Image
      key={fullOnly ? `${image}#full` : image}
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      loader={fullOnly ? undefined : loader}
      unoptimized={fullOnly}
      onError={() => (loader && !fullOnly ? setFullOnlySrc(image) : setFailedSrc(image))}
      className={className}
    />
  );
}
