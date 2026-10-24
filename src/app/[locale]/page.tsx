import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHomeData } from "@/components/home/homeData";
import { businessLd, faqLd } from "@/lib/jsonLd";
import ScrollVideoSection from "@/components/ScrollVideoSection";
import HomeHero from "@/components/home/HomeHero";
import QuickAccessBar from "@/components/home/QuickAccessBar";
import OpenBooksSection from "@/components/home/OpenBooksSection";
import TrustSection from "@/components/home/TrustSection";
import RenderToReality from "@/components/home/RenderToReality";
import FeaturedWork from "@/components/home/FeaturedWork";
import ProcessSteps from "@/components/home/ProcessSteps";
import MaterialsSection from "@/components/home/MaterialsSection";
import MiniCalculator from "@/components/home/MiniCalculator";
import { getCalculatorPricing, getProducts } from "@/lib/api";
import VisitSection from "@/components/home/VisitSection";
import TeamSection from "@/components/home/TeamSection";
import ClosingCTA from "@/components/home/ClosingCTA";
import { pageMeta } from "@/lib/pageMeta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMeta({ locale, path: "", title: t("home_title"), description: t("home_description") });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { heroSlides, steps, story, materials, featuredProjects, pairs, testimonialData, stats, faqItems } =
    await getHomeData();
  const [pricing, products] = await Promise.all([getCalculatorPricing(), getProducts()]);
  const tSite = await getTranslations("site");
  const tBrand = await getTranslations("brand");
  const tContact = await getTranslations("contact");

  return (
    <div className="bg-surface">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [
              businessLd({
                name: tBrand("name"),
                legalName: tBrand("legal"),
                phones: [tSite("phone_1"), tSite("phone_2")],
                email: tSite("email"),
                address: tContact("address_value"),
                sameAs: [tSite("facebook"), tSite("instagram")],
                mapUrl: tSite("map_url"),
              }),
              faqLd(faqItems),
            ].filter(Boolean),
          ),
        }}
      />

      {/* Section order and backgrounds: manzel-redesign-tasks.md §2. Empty data → the section is skipped. */}
      <HomeHero slides={heroSlides} />
      <QuickAccessBar />
      <div id="home-content" className="scroll-mt-24" />
      <TrustSection stats={stats} testimonials={testimonialData} />
      {pairs.length > 0 && <RenderToReality pairs={pairs} />}
      <FeaturedWork projects={featuredProjects} />
      <ProcessSteps steps={steps} />
      {/* On/off from the internal app («أقسام الرئيسية» → العرض); off by default */}
      {tSite("scroll_section") === "1" && <ScrollVideoSection />}
      <OpenBooksSection story={story} />
      <MaterialsSection materials={materials} productCount={products.length} />
      <MiniCalculator pricing={pricing} whatsapp={tSite("whatsapp")} />
      <TeamSection />
      <VisitSection faqItems={faqItems} />
      <ClosingCTA />
    </div>
  );
}
