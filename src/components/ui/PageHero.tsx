import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Shared top-of-page header for inner pages: an inset, rounded green panel
// (same language as the homepage's green bands). Marked data-header-overlay so
// SiteHeader renders transparent with light text over it.
// CSS-only entrance (.hero-rise) — no JS animation on first paint.
export default function PageHero({
  badge,
  title,
  description,
  imageUrl,
  breadcrumb,
  children,
  align = "start",
  compact = false,
}: {
  badge?: string;
  title: string;
  description?: string;
  /** Optional background photo (dimmed with a brand scrim) */
  imageUrl?: string | null;
  breadcrumb?: ReactNode;
  /** Actions / extra content under the description */
  children?: ReactNode;
  align?: "start" | "center";
  compact?: boolean;
}) {
  const centered = align === "center";

  return (
    <section data-header-overlay className="px-3 sm:px-4 lg:px-6 pt-3">
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-primary px-5 sm:px-8",
          compact ? "pt-28 md:pt-32 pb-10 md:pb-14" : "pt-32 md:pt-40 pb-14 md:pb-20",
        )}
      >
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover -z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-dark/95 via-primary-dark/70 to-primary-dark/50" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute -top-40 -end-40 w-[30rem] h-[30rem] rounded-full border border-white/[0.07]" />
            <div className="pointer-events-none absolute -top-16 -end-16 w-72 h-72 rounded-full border border-white/[0.07]" />
            <div className="pointer-events-none absolute -bottom-48 -start-32 w-[26rem] h-[26rem] rounded-full border border-white/[0.05]" />
          </>
        )}

        <div className={cn("relative max-w-7xl mx-auto", centered && "text-center")}>
          {breadcrumb && <div className="hero-rise mb-6 text-sm text-white/60">{breadcrumb}</div>}
          <div className={cn("max-w-3xl", centered && "mx-auto")}>
            {badge && (
              <span className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs md:text-sm font-medium text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
                {badge}
              </span>
            )}
            <h1
              className="hero-rise mt-5 text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-white text-balance whitespace-pre-line"
              style={{ animationDelay: "60ms" }}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "hero-rise mt-5 text-base md:text-lg leading-relaxed text-white/75 max-w-2xl",
                  centered && "mx-auto",
                )}
                style={{ animationDelay: "120ms" }}
              >
                {description}
              </p>
            )}
            {children && (
              <div className="hero-rise mt-8" style={{ animationDelay: "180ms" }}>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
