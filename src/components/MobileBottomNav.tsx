"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Home,
  Package,
  LayoutGrid,
  Phone,
  Menu,
  X,
  Calculator,
  Ruler,
  Palette,
  CalendarCheck,
  Info,
  MessageSquareQuote,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// App-style bottom tab bar for phones/tablets (hidden on lg+, where the
// header carries the full nav). Solid background — no backdrop-blur on a
// fixed element over scrolling content (iOS perf rule in CLAUDE.md).
export default function MobileBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  // Sheet is open only for the path it was opened on, so navigating closes it
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const moreOpen = openedOn === pathname;
  const setMoreOpen = (open: boolean) => setOpenedOn(open ? pathname : null);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const tabs: { href: "/" | "/products" | "/portfolio" | "/contact"; label: string; icon: LucideIcon }[] = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/products", label: t("products"), icon: Package },
    { href: "/portfolio", label: t("portfolio"), icon: LayoutGrid },
    { href: "/contact", label: t("contact"), icon: Phone },
  ];

  const moreLinks = [
    { href: "/booking" as const, label: t("booking"), icon: CalendarCheck, highlight: true },
    { href: "/calculator" as const, label: t("calculator"), icon: Calculator },
    { href: "/area-calculator" as const, label: t("area_calculator"), icon: Ruler },
    { href: "/color-picker" as const, label: t("color_picker"), icon: Palette },
    { href: "/about" as const, label: t("about"), icon: Info },
    { href: "/testimonials" as const, label: t("testimonials"), icon: MessageSquareQuote },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const moreActive = moreLinks.some((l) => pathname.startsWith(l.href));

  const tabClass = (active: boolean) =>
    cn(
      "flex-1 flex flex-col items-center justify-center gap-1 h-full text-[11px] font-medium transition-colors",
      active ? "text-primary" : "text-text-secondary",
    );

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[55] bg-primary-dark/50 lg:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={t("more_title")}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[56] lg:hidden bg-white rounded-t-3xl shadow-2xl pb-[calc(env(safe-area-inset-bottom)+5rem)]"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="w-10" />
                <span className="w-10 h-1 rounded-full bg-secondary-dark" />
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label={t("close")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-secondary-light"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="px-6 pb-3 text-sm font-bold text-primary">{t("more_title")}</p>
              <div className="grid grid-cols-3 gap-3 px-5">
                {moreLinks.map(({ href, label, icon: Icon, highlight }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl p-3 aspect-square text-center text-xs font-medium transition-colors",
                      highlight
                        ? "bg-accent text-white"
                        : pathname.startsWith(href)
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary-light text-text-primary",
                    )}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                    <span className="leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label={t("menu")}
        className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-[57] bg-white border-t border-secondary-dark/50 shadow-[0_-4px_20px_rgba(21,60,56,0.06)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-stretch h-16 max-w-xl mx-auto">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href) && !moreOpen;
            return (
              <Link key={href} href={href} className={tabClass(active)}>
                <span
                  className={cn(
                    "flex items-center justify-center w-12 h-7 rounded-full transition-colors",
                    active && "bg-primary/10",
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
                </span>
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            className={cn(tabClass(moreOpen || moreActive), "cursor-pointer")}
          >
            <span
              className={cn(
                "flex items-center justify-center w-12 h-7 rounded-full transition-colors",
                (moreOpen || moreActive) && "bg-primary/10",
              )}
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </span>
            {t("more")}
          </button>
        </div>
      </nav>
    </>
  );
}
