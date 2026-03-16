import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AnimatedSection from "@/components/AnimatedSection";
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

export default async function BookingPage() {
  const t = await getTranslations("booking");

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-48 h-48 border border-white/10 rounded-full" />
          <div className="absolute bottom-10 left-10 w-32 h-32 border border-accent/20 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="text-accent font-bold text-sm tracking-wider">
              {t("hero_label")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mt-3">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
              {t("description")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0F172A] bg-geometric">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <BookingForm />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
