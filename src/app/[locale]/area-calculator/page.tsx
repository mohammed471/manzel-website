import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHero from "@/components/ui/PageHero";
import AreaCalculator from "@/components/AreaCalculator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("area_calculator_title"),
    description: t("area_calculator_description"),
    openGraph: {
      title: t("area_calculator_title"),
      description: t("area_calculator_description"),
      type: "website",
    },
  };
}

export default async function AreaCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("area_calculator");

  return (
    <>
      <PageHero badge={t("hero_label")} title={t("title")} description={t("description")} />

      {/* Calculator */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AreaCalculator />
        </div>
      </section>
    </>
  );
}
