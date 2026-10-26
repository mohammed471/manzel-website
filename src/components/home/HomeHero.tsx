import { getTranslations } from "next-intl/server";
import { ArrowLeft, ChevronDown } from "lucide-react";
import HeroVideo from "@/components/HeroVideo";
import HeroSlides from "@/components/home/HeroSlides";
import HeroCaption, { type HeroSlide } from "@/components/home/HeroCaption";
import { ButtonLink } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { stripTatweel } from "@/lib/utils";

// Full-screen hero. Background, from the internal app («واجهة الموقع»):
//   a hero video → the video, its poster = the first photo (or the main image)
//   photos only  → HeroSlides (one still, or a slow cross-fade)
//   nothing      → the main image (site.hero_image)
// Bottom padding leaves room for the QuickAccessBar, which overlaps the hero's bottom edge.
export default async function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const t = await getTranslations("home");
  const tSite = await getTranslations("site");
  const hasVideo = !!tSite("hero_video");
  const title = t("hero_subtitle");
  const plainTitle = stripTatweel(title);

  return (
    <section data-header-overlay className="relative min-h-[100svh] md:min-h-[92vh] flex overflow-hidden bg-primary-dark">
      {slides.length > 0 && !hasVideo ? (
        <HeroSlides slides={slides} />
      ) : (
        <>
          <HeroVideo poster={slides[0]?.image} />
          {slides[0] && <HeroCaption slide={slides[0]} />}
        </>
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center pt-24 pb-40 md:pb-44">
        <div className="max-w-3xl mx-auto">
          <span className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs md:text-sm font-medium text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            {t("hero_badge")}
          </span>
          <h1
            className="hero-rise mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-white text-balance"
            style={{ animationDelay: "80ms" }}
          >
            {title === plainTitle ? (
              title
            ) : (
              // Stretched (tatweel) for looks only — search engines and screen readers get the plain word
              <>
                <span aria-hidden="true">{title}</span>
                <span className="sr-only">{plainTitle}</span>
              </>
            )}
          </h1>
          <p
            className="hero-rise mt-6 mx-auto text-base md:text-xl leading-relaxed text-white/80 max-w-xl"
            style={{ animationDelay: "160ms" }}
          >
            {t("hero_description")}
          </p>
          <div className="hero-rise mt-9 flex flex-col items-center gap-4" style={{ animationDelay: "240ms" }}>
            {/* Portfolio and products stay one tap away in the QuickAccessBar below */}
            <ButtonLink href="/calculator" variant="accent" size="lg">
              {t("hero_cta_calculator")}
              <ArrowLeft className="arrow-nudge w-4 h-4 ltr:rotate-180" />
            </ButtonLink>
            <Link
              href="/booking"
              className="text-sm md:text-base text-white/85 underline underline-offset-4 decoration-white/40 hover:text-white hover:decoration-white"
            >
              {t("hero_cta_booking_link")}
            </Link>
          </div>
        </div>
      </div>
      <a
        href="#home-content"
        aria-label={t("hero_scroll")}
        className="absolute z-20 bottom-36 md:bottom-40 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-white/30 text-white/80 hover:text-white motion-safe:animate-bounce"
      >
        <ChevronDown className="w-4 h-4" />
      </a>
    </section>
  );
}
