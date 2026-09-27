import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import ImageTile from "@/components/home/ImageTile";
import type { HomeService } from "@/components/home/homeData";

// Model A: one bento grid that surfaces products + all 5 service categories.
export default async function ServicesBento({ services }: { services: HomeService[] }) {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tPortfolio = await getTranslations("portfolio");
  const tSite = await getTranslations("site");

  const [s1, s2, s3, s4, s5] = services;

  return (
    <section id="services" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-36">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            badge={t("services_badge")}
            title={t("services_title")}
            description={t("services_desc")}
          />
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[190px] md:auto-rows-[230px] gap-3 md:gap-4">
          <AnimatedSection className="col-span-2 row-span-2">
            <ImageTile
              href="/products"
              imageUrl={tSite("products_image")}
              eyebrow={tNav("products")}
              title={t("products_card_title")}
              description={t("products_card_desc")}
              cta={t("browse_products")}
              sizes="(max-width: 1024px) 100vw, 50vw"
              large
              className="h-full"
            />
          </AnimatedSection>

          {[s1, s2, s3, s4].filter(Boolean).map((s, i) => (
            <AnimatedSection key={s.id} delay={0.05 * (i + 1)}>
              <ImageTile
                href={`/portfolio/${s.id}`}
                imageUrl={s.imageUrl}
                title={s.title}
                description={s.description}
                className="h-full"
              />
            </AnimatedSection>
          ))}

          {s5 && (
            <AnimatedSection className="col-span-2" delay={0.25}>
              <ImageTile
                href={`/portfolio/${s5.id}`}
                imageUrl={s5.imageUrl}
                title={s5.title}
                description={s5.description}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full"
              />
            </AnimatedSection>
          )}

          <AnimatedSection className="col-span-2" delay={0.3}>
            <Link
              href="/portfolio"
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-primary p-6 md:p-8 text-white"
            >
              <div className="absolute -end-16 -top-16 w-56 h-56 rounded-full border border-white/10" />
              <div className="absolute -end-4 -top-4 w-32 h-32 rounded-full border border-white/10" />
              <span className="relative text-sm font-bold text-secondary/80">
                {tPortfolio("categories_subtitle")}
              </span>
              <div className="relative flex items-end justify-between gap-4">
                <h3 className="text-2xl md:text-3xl leading-tight max-w-xs">{t("view_portfolio")}</h3>
                <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-accent transition-transform duration-300 group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                  <ArrowLeft className="w-5 h-5 ltr:rotate-180" />
                </span>
              </div>
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
