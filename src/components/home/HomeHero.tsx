import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import HeroVideo from "@/components/HeroVideo";
import { ButtonLink } from "@/components/ui/Button";

// Full-screen video hero. Bottom padding leaves room for the QuickAccessBar,
// which overlaps the hero's bottom edge.
export default async function HomeHero() {
  const t = await getTranslations("home");

  return (
    <section data-header-overlay className="relative min-h-[100svh] flex overflow-hidden bg-primary-dark">
      <HeroVideo />

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
            {t("hero_subtitle")}
          </h1>
          <p
            className="hero-rise mt-6 mx-auto text-base md:text-xl leading-relaxed text-white/80 max-w-xl"
            style={{ animationDelay: "160ms" }}
          >
            {t("hero_description")}
          </p>
          <div className="hero-rise mt-9 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
            <ButtonLink href="/portfolio" variant="accent" size="lg">
              {t("view_portfolio")}
              <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
            </ButtonLink>
            <ButtonLink href="/products" variant="outline-light" size="lg">
              {t("browse_products")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
