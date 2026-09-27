import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { Playfair_Display, Poppins, Tajawal } from "next/font/google";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "../globals.css";
import SiteHeader from "@/components/SiteHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageTransition from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalSearchLazy from "@/components/GlobalSearchLazy";
import SplashScreen from "@/components/SplashScreen";
import Analytics from "@/components/Analytics";
import { DEVICE_BOOT_SCRIPT } from "@/lib/deviceScript";
import { getSiteMessages } from "@/lib/siteContent";


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

// Pre-render both locales statically — without this every request renders
// dynamically and can block on the Flask API's cold start
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  setRequestLocale(locale);

  const messages = await getSiteMessages(locale);
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        {/* Sets html[data-device] (ios | android | mobile | desktop) before first paint */}
        <script dangerouslySetInnerHTML={{ __html: DEVICE_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${khalidArt.variable} ${poppins.variable} ${tajawal.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Analytics />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SplashScreen />
          <SiteHeader />
          <main className="min-h-screen"><PageTransition>{children}</PageTransition></main>
          <Footer />
          <WhatsAppButton />
          <ScrollToTop />
          <GlobalSearchLazy />
          <MobileBottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
