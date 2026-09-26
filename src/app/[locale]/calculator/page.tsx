import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHero from "@/components/ui/PageHero";
import Calculator from "@/components/Calculator";

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
  const t = await getTranslations("calculator");

  return (
    <>
      <PageHero badge={t("hero_label")} title={t("title")} description={t("description")} />

      {/* Calculator */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Calculator />
        </div>
      </section>
    </>
  );
}
