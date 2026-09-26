import { setRequestLocale } from "next-intl/server";
import { getHomeData } from "@/components/home/homeData";
import ScrollVideoSection from "@/components/ScrollVideoSection";
import HomeHero from "@/components/home/HomeHero";
import QuickAccessBar from "@/components/home/QuickAccessBar";
import ServicesBento from "@/components/home/ServicesBento";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import TrustSection from "@/components/home/TrustSection";
import ToolsGrid from "@/components/home/ToolsGrid";
import VisitSection from "@/components/home/VisitSection";
import ClosingCTA from "@/components/home/ClosingCTA";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { services, featuredProjects, testimonialData, stats, faqItems } = await getHomeData();

  return (
    <div className="bg-surface">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: locale === "ar" ? "منزل" : "Manzel",
              url: "https://example.com",
              logo: "https://example.com/images/logo-dark.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+964-773-768-5000",
                contactType: "customer service",
              },
              sameAs: [
                "https://www.facebook.com/Manzel.Design.House/",
                "https://www.instagram.com/manzel.design.house/",
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "HomeAndConstructionBusiness",
              name: locale === "ar" ? "منزل" : "Manzel",
              image: "https://example.com/images/logo-dark.png",
              address: {
                "@type": "PostalAddress",
                addressLocality: locale === "ar" ? "كركوك" : "Kirkuk",
                addressCountry: "IQ",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 35.4502682,
                longitude: 44.3956904,
              },
              hasMap: "https://maps.app.goo.gl/qajNmbhiGRAPTasa7",
              telephone: "+964-773-768-5000",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Saturday",
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                ],
                opens: "09:00",
                closes: "18:00",
              },
              inLanguage: locale === "ar" ? "ar" : "en",
            },
          ]),
        }}
      />

      <HomeHero />
      <QuickAccessBar />
      <ServicesBento services={services} />
      <ScrollVideoSection />
      <ProjectsShowcase projects={featuredProjects.slice(0, 4)} />
      <TrustSection stats={stats} testimonials={testimonialData} />
      <ToolsGrid tone="cream" />
      <VisitSection faqItems={faqItems} />
      <ClosingCTA />
    </div>
  );
}
