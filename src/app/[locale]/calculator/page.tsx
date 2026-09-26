import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHero from "@/components/ui/PageHero";
import Calculator from "@/components/Calculator";
import ClosingCTA from "@/components/home/ClosingCTA";
import { getCalculatorPricing } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("calculator_title"),
    description: t("calculator_description"),
    openGraph: {
      title: t("calculator_title"),
      description: t("calculator_description"),
      type: "website",
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, pricing] = await Promise.all([getTranslations("calculator"), getCalculatorPricing()]);

  return (
    <>
      <PageHero badge={t("hero_label")} title={t("title")} description={t("description")} />

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Calculator pricing={pricing} />
        </div>
      </section>

      <ClosingCTA />
    </>
  );
}
