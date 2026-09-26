"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";

// Redesigned header: simple links + prominent booking CTA. On mobile the
// section links live in MobileBottomNav, so the header only carries logo,
// search and language.
export default function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [solid, setSolid] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/products" as const, label: t("products") },
    { href: "/portfolio" as const, label: t("portfolio") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  const toolsLinks = [
    { href: "/calculator" as const, label: t("calculator") },
    { href: "/area-calculator" as const, label: t("area_calculator") },
    { href: "/color-picker" as const, label: t("color_picker") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const isToolsActive = toolsLinks.some((l) => pathname.startsWith(l.href));

  // Transparent only while at the top of a page whose first section is dark
  // and marked `data-header-overlay` (HomeHero, PageHero); solid everywhere
  // else. rAF-throttled — iOS fires scroll continuously (CLAUDE.md perf rules).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setSolid(window.scrollY > 40 || !document.querySelector("[data-header-overlay]")),
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
    };
  }, [pathname]);

  const linkTone = (active: boolean) =>
    active
      ? solid
        ? "text-primary bg-primary/[0.07]"
        : "text-white bg-white/15"
      : solid
        ? "text-text-secondary hover:text-primary hover:bg-primary/5"
        : "text-white/80 hover:text-white hover:bg-white/10";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow] duration-300",
        solid ? "bg-white shadow-[0_1px_0_rgba(21,60,56,0.08)]" : "bg-transparent",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20 gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Logo
            variant={solid ? "dark" : "light"}
            width={72}
            height={45}
            className="md:w-[84px] md:h-[52px]"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 4).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  linkTone(isActive(link.href)),
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
              className={cn(
                "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer",
                linkTone(isToolsActive),
              )}
            >
              {t("tools")}
              <ChevronDown
                className={cn("w-3.5 h-3.5 transition-transform", toolsOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full start-0 pt-2"
                >
                  <div className="w-52 bg-white rounded-2xl shadow-xl border border-secondary-dark/40 p-1.5">
                    {toolsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          pathname.startsWith(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-secondary-light hover:text-primary",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li>
            <Link
              href={navLinks[4].href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                linkTone(isActive(navLinks[4].href)),
              )}
            >
              {navLinks[4].label}
            </Link>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
            aria-label={t("search")}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer",
              solid
                ? "text-primary hover:bg-primary/5"
                : "text-white hover:bg-white/10",
            )}
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          <div className={cn("transition-colors", solid ? "text-text-secondary" : "text-white")}>
            <LanguageToggle />
          </div>
          <Link
            href="/booking"
            className="hidden md:inline-flex items-center gap-2 h-11 px-5 rounded-full bg-accent hover:bg-accent-light text-white text-sm font-bold transition-colors ms-1"
          >
            <CalendarCheck className="w-4 h-4" />
            {t("booking")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
