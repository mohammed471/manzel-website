"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/products" as const, label: t("products") },
    { href: "/portfolio" as const, label: t("portfolio") },
    { href: "/calculator" as const, label: t("calculator") },
    { href: "/contact" as const, label: t("contact") },
  ];

  // Scroll detection at 50px threshold
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on pathname change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body overflow when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo
              variant={scrolled ? "dark" : "light"}
              width={100}
              height={40}
            />
          </Link>

          {/* Desktop Links + LanguageToggle */}
          <div className="hidden md:flex items-center gap-1">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? scrolled
                            ? "text-primary"
                            : "text-white"
                          : scrolled
                            ? "text-text-secondary hover:text-primary"
                            : "text-white/80 hover:text-white"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 inset-x-2 h-0.5 bg-accent rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div
              className={cn(
                "ms-4 transition-colors",
                scrolled ? "text-text-secondary" : "text-white"
              )}
            >
              <LanguageToggle />
            </div>
            <Link
              href="/booking"
              className={cn(
                "ms-3 font-bold px-4 py-2 rounded-lg text-sm transition-colors",
                scrolled
                  ? "bg-accent hover:bg-accent-light text-white"
                  : "bg-accent hover:bg-accent-light text-white"
              )}
            >
              {t("booking")}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg"
            aria-label={t("menu")}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={cn(
                  "h-0.5 rounded-full transition-all duration-300 origin-right",
                  scrolled ? "bg-primary" : "bg-white",
                  mobileOpen && "rotate-[-45deg] w-[26px]"
                )}
              />
              <span
                className={cn(
                  "h-0.5 rounded-full transition-all duration-300",
                  scrolled ? "bg-primary" : "bg-white",
                  mobileOpen && "opacity-0 translate-x-4"
                )}
              />
              <span
                className={cn(
                  "h-0.5 rounded-full transition-all duration-300 origin-right",
                  scrolled ? "bg-primary" : "bg-white",
                  mobileOpen && "rotate-[45deg] w-[26px]"
                )}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl"
            >
              <div className="p-6 pt-20">
                {/* LanguageToggle at top of mobile drawer */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface">
                  <Logo variant="dark" width={100} height={40} />
                  <LanguageToggle />
                </div>

                {/* Nav links */}
                <ul className="space-y-2">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-text-primary hover:bg-surface"
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 pt-4 border-t border-surface">
                  <Link
                    href="/booking"
                    className="block w-full text-center bg-accent hover:bg-accent-light text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    {t("booking")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
