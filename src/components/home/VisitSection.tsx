import { getTranslations } from "next-intl/server";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import FAQ from "@/components/FAQ";
import { buttonClasses } from "@/components/ui/Button";
import { telHref } from "@/lib/siteContent";


async function MapCard() {
  const t = await getTranslations("home");
  const tContact = await getTranslations("contact");
  const tSite = await getTranslations("site");

  const rows = [
    { icon: MapPin, label: tContact("address"), value: tContact("address_value") },
    { icon: Clock, label: tContact("working_hours"), value: tContact("working_hours_value") },
  ];

  return (
    <div className="overflow-hidden rounded-3xl bg-white border border-secondary-dark/40">
      <div className="relative h-64 md:h-72 bg-secondary">
        <iframe
          src={tSite("map_embed")}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={tContact("map_title")}
        />
      </div>
      <div className="p-6 md:p-7">
        <ul className="space-y-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex gap-3">
              <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/[0.07] text-primary">
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <div>
                <p className="text-xs text-text-secondary">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{value}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={tSite("map_url")} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "md")}>
            <Navigation className="w-4 h-4" />
            {t("directions")}
          </a>
          <a href={telHref(tSite("phone_1"))} className={buttonClasses("outline", "md")}>
            <Phone className="w-4 h-4" />
            {t("call_us")}
          </a>
        </div>
      </div>
    </div>
  );
}

// FAQ and map/contact card side by side.
export default async function VisitSection({
  faqItems,
}: {
  faqItems: { question: string; answer: string }[];
}) {
  const t = await getTranslations("home");

  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-36">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        <div className="lg:col-span-7">
          <AnimatedSection>
            <SectionHeader badge={t("faq_subtitle")} title={t("faq_title")} />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <FAQ items={faqItems} />
          </AnimatedSection>
        </div>
        <div id="visit" className="lg:col-span-5 scroll-mt-36">
          <AnimatedSection>
            <SectionHeader badge={t("visit_badge")} title={t("visit_title")} />
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <MapCard />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
