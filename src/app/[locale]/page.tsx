import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHomeData } from "@/components/home/homeData";
import { businessLd, faqLd } from "@/lib/jsonLd";
import ScrollVideoSection from "@/components/ScrollVideoSection";
import HomeHero from "@/components/home/HomeHero";
import QuickAccessBar from "@/components/home/QuickAccessBar";
import ServicesBento from "@/components/home/ServicesBento";
import OpenBooksSection from "@/components/home/OpenBooksSection";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import TrustSection from "@/components/home/TrustSection";
import ToolsGrid from "@/components/home/ToolsGrid";
import VisitSection from "@/components/home/VisitSection";
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
  const { services, featuredProjects, testimonialData, stats, faqItems } = await getHomeData();
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

      <HomeHero />
      <QuickAccessBar />
      <ServicesBento services={services} />
      <OpenBooksSection />
      {/* On/off from the internal app («لوحة الموقع»); off by default */}
      {tSite("scroll_section") === "1" && <ScrollVideoSection />}
      <ProjectsShowcase projects={featuredProjects.slice(0, 4)} />
      <TrustSection stats={stats} testimonials={testimonialData} />
      <ToolsGrid tone="cream" />
      <VisitSection faqItems={faqItems} />
      <ClosingCTA />
    </div>
  );
}
