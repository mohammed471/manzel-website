import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Rounded image card with title/description over a bottom scrim.
// Falls back to a brand gradient when there is no image.
export default function ImageTile({
  href,
  imageUrl,
  title,
  description,
  eyebrow,
  cta,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  large = false,
}: {
  href: string;
  imageUrl: string | null;
  title: string;
  description?: string;
  eyebrow?: string;
  cta?: string;
  className?: string;
  sizes?: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark isolate",
        className,
      )}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes={sizes}
          className="object-cover -z-10 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-dark/90 via-primary-dark/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <span className="inline-block mb-2 rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold text-white/90">
              {eyebrow}
            </span>
          )}
          <h3 className={cn("text-white leading-tight", large ? "text-2xl md:text-4xl" : "text-lg md:text-xl")}>
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "mt-2 text-white/75 leading-relaxed",
                large ? "text-sm md:text-base max-w-md" : "text-xs md:text-sm line-clamp-2",
              )}
            >
              {description}
            </p>
          )}
          {cta && (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-primary px-5 h-10 text-sm font-bold">
              {cta}
              <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
            </span>
          )}
        </div>
        {!cta && (
          <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-primary">
            <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
          </span>
        )}
      </div>
    </Link>
  );
}
