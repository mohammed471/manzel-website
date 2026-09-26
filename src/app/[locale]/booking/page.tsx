import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/ui/PageHero";
import BookingForm from "@/components/BookingForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("booking_title"),
    description: t("booking_description"),
    openGraph: {
      title: t("booking_title"),
      description: t("booking_description"),
      type: "website",
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");

  return (
    <>
      <PageHero badge={t("hero_label")} title={t("title")} description={t("description")} />

      {/* Booking Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-white rounded-3xl shadow-sm border border-secondary-dark/40 p-8 md:p-10">
              <BookingForm />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
