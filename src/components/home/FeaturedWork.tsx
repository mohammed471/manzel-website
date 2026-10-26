import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Image from "@/components/SiteImage";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import FeaturedSlider from "@/components/home/FeaturedSlider";
import { getProjectImageUrl, projectLocation, projectName, type PortfolioProject } from "@/lib/portfolio";

// Featured projects as a moving horizontal slider (owner's request 2026-10-26; it was a 3-photo
// magazine grid). Projects marked «مميّز» in the app, else the newest with a cover.
export default async function FeaturedWork({ projects }: { projects: PortfolioProject[] }) {
  if (projects.length === 0) return null;
  const locale = await getLocale();
  const t = await getTranslations("home");
  const tPortfolio = await getTranslations("portfolio");

  return (
    <section className="py-[72px] md:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="reveal reveal-fadeIn text-3xl md:text-4xl text-primary leading-tight">{t("featured_title")}</h2>
        <div className="mt-8 md:mt-10">
          <FeaturedSlider>
            {projects.map((p, i) => {
              const name = projectName(p, locale);
              const place = projectLocation(p, locale);
              const meta = [place.text, p.area ? tPortfolio("area_value", { area: String(p.area) }) : ""].filter(Boolean);
              return (
                <li key={p.id} className="snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[32%] aspect-[4/5]">
                  <Link
                    href={`/portfolio/${p.category}/${p.id}`}
                    className="group relative flex h-full overflow-hidden rounded-3xl bg-primary-dark isolate"
                  >
                    <Image
                      src={getProjectImageUrl(p.category, p.id, p.images[0])}
                      alt={name.text}
                      fill
                      loading={i < 3 ? "eager" : "lazy"}
                      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 85vw"
                      className="object-cover -z-10 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-dark/85 via-primary-dark/20 to-transparent" />
                    <div className="mt-auto p-5 md:p-6 text-white">
                      {p.kind && (
                        <span className="inline-block mb-2 rounded-full bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-bold">
                          {tPortfolio(p.kind === "built" ? "kind_built" : "kind_design")}
                        </span>
                      )}
                      <h3 lang={name.lang} className="text-xl md:text-2xl leading-tight">{name.text}</h3>
                      {meta.length > 0 && <p lang={place.lang} className="mt-1 text-sm text-white/75">{meta.join(" · ")}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </FeaturedSlider>
        </div>
        <div className="mt-8">
          <ButtonLink href="/portfolio" variant="outline" size="lg">
            {t("all_work")}
            <ArrowLeft className="arrow-nudge w-4 h-4 ltr:rotate-180" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
