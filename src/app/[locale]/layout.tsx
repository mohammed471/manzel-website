import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import localFont from "next/font/local";
import { Playfair_Display, Poppins, Tajawal } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageTransition from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import SplashScreen from "@/components/SplashScreen";
import Analytics from "@/components/Analytics";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

const messagesMap: Record<string, typeof ar> = { ar, en };

const khalidArt = localFont({
  src: "../../fonts/khalid-art-bold.ttf",
  variable: "--font-arabic",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-english",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-arabic-body",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-english-display",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const isAR = locale === "ar";
  return {
    metadataBase: new URL("https://example.com"),
    title: t("home_title"),
    description: t("home_description"),
    keywords: t("home_keywords"),
    openGraph: {
      title: t("home_title"),
      description: t("home_description"),
      type: "website",
      locale: isAR ? "ar_IQ" : "en_US",
      siteName: t("site_name"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  const messages = messagesMap[locale] ?? ar;
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <Analytics />
      <body
        className={`${khalidArt.variable} ${poppins.variable} ${tajawal.variable} ${playfairDisplay.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SplashScreen />
          <Navbar />
          <main className="min-h-screen"><PageTransition>{children}</PageTransition></main>
          <Footer />
          <WhatsAppButton />
          <ScrollToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
