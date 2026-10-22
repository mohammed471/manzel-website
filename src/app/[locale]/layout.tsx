import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { Playfair_Display, Poppins } from "next/font/google";
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
import { getTestimonials } from "@/lib/testimonials";
import { pageMeta } from "@/lib/pageMeta";
import SplashScreen from "@/components/SplashScreen";
import Analytics from "@/components/Analytics";
import { DEVICE_BOOT_SCRIPT, SPLASH_BOOT_SCRIPT } from "@/lib/deviceScript";
import { getSiteMessages } from "@/lib/siteContent";
import { SITE_URL, allowIndexing } from "@/lib/siteUrl";


// Thmanyah Serif — Display for Arabic headings, Text for Arabic body (same pair as the Manzel app).
// Its license allows web use only as part of a bundled product: localFont bundles the files
// under hashed /_next/static/media names — never copy them into public/.
const thmanyahDisplay = localFont({
  src: [
    { path: "../../fonts/thmanyah/thmanyahserifdisplay-Bold.woff2", weight: "700" },
    { path: "../../fonts/thmanyah/thmanyahserifdisplay-Black.woff2", weight: "900" },
  ],
  variable: "--font-arabic",
  display: "swap",
});

// Thmanyah covers Latin letters and digits too (+500, phone numbers), so no second font is needed.
const thmanyahText = localFont({
  src: [
    { path: "../../fonts/thmanyah/thmanyahseriftext-Regular.woff2", weight: "400" },
    { path: "../../fonts/thmanyah/thmanyahseriftext-Medium.woff2", weight: "500" },
    { path: "../../fonts/thmanyah/thmanyahseriftext-Bold.woff2", weight: "700" },
    { path: "../../fonts/thmanyah/thmanyahseriftext-Black.woff2", weight: "900" },
  ],
  variable: "--font-arabic-body",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-english",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-english-display",
  display: "swap",
  // Only English `.font-display` headings use it — don't preload it on every page
  preload: false,
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

  // Defaults for pages without their own metadata — share image and twitter card,
  // but no canonical (that would point every such page at the home page).
  const defaults = await pageMeta({ locale, path: "", title: t("home_title"), description: t("home_description") });
  return {
    metadataBase: new URL(SITE_URL),
    ...defaults,
    alternates: undefined,
    ...(!allowIndexing() && { robots: { index: false, follow: false } }),
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
  // No verified testimonials → the page is noindex and its links are hidden
  const hasTestimonials = (await getTestimonials(locale)).length > 0;
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        {/* The site has one (light) theme — stops phone browsers auto-darkening it */}
        <meta name="color-scheme" content="only light" />
        {/* Sets html[data-device] (ios | android | mobile | desktop) before first paint */}
        <script dangerouslySetInnerHTML={{ __html: DEVICE_BOOT_SCRIPT }} />
        {/* Once-per-session CSS splash: html.no-splash on repeat visits */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${thmanyahDisplay.variable} ${poppins.variable} ${thmanyahText.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Analytics />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SplashScreen />
          <SiteHeader />
          <main className="min-h-screen"><PageTransition>{children}</PageTransition></main>
          <Footer hasTestimonials={hasTestimonials} />
          <WhatsAppButton />
          <ScrollToTop />
          <GlobalSearchLazy hasTestimonials={hasTestimonials} />
          <MobileBottomNav hasTestimonials={hasTestimonials} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
