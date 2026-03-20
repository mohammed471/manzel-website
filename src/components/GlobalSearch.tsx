"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, Briefcase, FileText, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchProductsClient } from "@/lib/api";
import type { Product } from "@/lib/api";
import projectsData from "@/data/projects.json";
import type { PortfolioProject } from "@/lib/portfolio";

interface PageResult {
  href: string;
  labelKey: string;
}

const PAGES: PageResult[] = [
  { href: "/", labelKey: "home" },
  { href: "/products", labelKey: "products" },
  { href: "/portfolio", labelKey: "portfolio" },
  { href: "/about", labelKey: "about" },
  { href: "/calculator", labelKey: "calculator" },
  { href: "/area-calculator", labelKey: "area_calculator" },
  { href: "/contact", labelKey: "contact" },
  { href: "/color-picker", labelKey: "color_picker" },
  { href: "/booking", labelKey: "booking" },
  { href: "/testimonials", labelKey: "testimonials" },
];

const STORAGE_KEY = "manzel-recent-searches";
const MAX_RECENT = 5;
const MAX_RESULTS_PER_GROUP = 3;
const DEBOUNCE_MS = 300;

interface FlatResult {
  type: "product" | "project" | "page" | "show-all-products" | "show-all-projects";
  href: string;
  label: string;
  sublabel?: string;
}

export default function GlobalSearch() {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [portfolioResults, setPortfolioResults] = useState<PortfolioProject[]>([]);
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      /* graceful degradation */
    }
  }, []);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for custom event from Navbar search trigger
  useEffect(() => {
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener("open-global-search", handleOpenSearch);
    return () => window.removeEventListener("open-global-search", handleOpenSearch);
  }, []);

  // Body scroll lock + focus input on open, reset on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSelectedIndex(-1);
      setProductResults([]);
      setPortfolioResults([]);
      setPageResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setProductResults([]);
      setPortfolioResults([]);
      setPageResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSelectedIndex(-1);

    const timeout = setTimeout(async () => {
      const q = query.trim().toLowerCase();

      // Products: async API call
      const products = await searchProductsClient(q);
      setProductResults(products.slice(0, MAX_RESULTS_PER_GROUP));

      // Portfolio: local filter
      const allProjects = projectsData.projects as unknown as PortfolioProject[];
      const filtered = allProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
      setPortfolioResults(filtered.slice(0, MAX_RESULTS_PER_GROUP));

      // Pages: filter by translated label
      const matchedPages = PAGES.filter((p) => {
        const label = tNav(p.labelKey);
        return label.toLowerCase().includes(q);
      });
      setPageResults(matchedPages);

      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, tNav]);

  // Flatten all results for keyboard navigation
  const allResults = useMemo(() => {
    const items: FlatResult[] = [];

    productResults.forEach((p) =>
      items.push({
        type: "product",
        href: `/products/${p.id}`,
        label: p.name,
        sublabel: p.category,
      })
    );
    if (query.trim() && productResults.length > 0) {
      items.push({
        type: "show-all-products",
        href: `/products?search=${encodeURIComponent(query)}`,
        label: t("show_all_products"),
      });
    }

    portfolioResults.forEach((p) =>
      items.push({
        type: "project",
        href: `/portfolio/${p.category}/${p.id}`,
        label: p.name,
        sublabel: `${p.location} · ${p.year}`,
      })
    );
    if (query.trim() && portfolioResults.length > 0) {
      items.push({
        type: "show-all-projects",
        href: "/portfolio",
        label: t("show_all_projects"),
      });
    }

    pageResults.forEach((p) =>
      items.push({
        type: "page",
        href: p.href,
        label: tNav(p.labelKey),
      })
    );

    return items;
  }, [productResults, portfolioResults, pageResults, query, t, tNav]);

  // Navigate to result and save recent search
  const navigateToResult = useCallback(
    (href: string) => {
      if (query.trim()) {
        const updated = [
          query.trim(),
          ...recentSearches.filter((s) => s !== query.trim()),
        ].slice(0, MAX_RECENT);
        setRecentSearches(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(href as any);
      setIsOpen(false);
    },
    [query, recentSearches, router]
  );

  // Keyboard navigation on input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        allResults.length === 0 ? -1 : (prev + 1) % allResults.length
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        allResults.length === 0
          ? -1
          : (prev - 1 + allResults.length) % allResults.length
      );
    } else if (e.key === "Enter" && selectedIndex >= 0 && allResults[selectedIndex]) {
      e.preventDefault();
      navigateToResult(allResults[selectedIndex].href);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
  };

  // Track current flat index for highlighting
  let flatIndex = -1;

  const hasResults =
    productResults.length > 0 || portfolioResults.length > 0 || pageResults.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 top-0 z-[61] flex justify-center pt-[12vh] md:pt-[15vh] px-4"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-secondary-dark/30">
                <Search className="w-5 h-5 text-primary/40 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("placeholder")}
                  className="flex-1 bg-transparent outline-none text-primary text-base placeholder:text-primary/30"
                  autoComplete="off"
                  spellCheck={false}
                />
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary/60 rounded-full animate-spin shrink-0" />
                )}
                <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-primary/40 bg-secondary rounded border border-secondary-dark/30">
                  Esc
                </kbd>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors"
                  aria-label={t("close")}
                >
                  <X className="w-4 h-4 text-primary/40" />
                </button>
              </div>

              {/* Results area */}
              <div className="overflow-y-auto flex-1 py-2">
                {/* Recent searches (when no query) */}
                {!hasQuery && recentSearches.length > 0 && (
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-primary/50 uppercase tracking-wider">
                        {t("recent_searches")}
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t("clear_recent")}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleRecentClick(search)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-start hover:bg-secondary transition-colors group"
                        >
                          <Clock className="w-4 h-4 text-primary/30 group-hover:text-primary/50 shrink-0" />
                          <span className="text-sm text-primary/70 group-hover:text-primary truncate">
                            {search}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no query and no recent */}
                {!hasQuery && recentSearches.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <Search className="w-10 h-10 text-primary/15 mx-auto mb-3" />
                    <p className="text-sm text-primary/40">{t("placeholder")}</p>
                  </div>
                )}

                {/* No results */}
                {hasQuery && !isLoading && !hasResults && (
                  <div className="px-5 py-12 text-center">
                    <Search className="w-10 h-10 text-primary/15 mx-auto mb-3" />
                    <p className="text-sm text-primary/60">
                      {t("no_results_query", { query })}
                    </p>
                  </div>
                )}

                {/* Product results */}
                {productResults.length > 0 && (
                  <ResultGroup
                    icon={<Package className="w-4 h-4" />}
                    title={t("products_group")}
                  >
                    {productResults.map((product) => {
                      flatIndex++;
                      const idx = flatIndex;
                      return (
                        <ResultItem
                          key={`product-${product.id}`}
                          label={product.name}
                          sublabel={product.category}
                          isSelected={selectedIndex === idx}
                          index={idx}
                          onClick={() =>
                            navigateToResult(`/products/${product.id}`)
                          }
                        />
                      );
                    })}
                    {(() => {
                      flatIndex++;
                      const idx = flatIndex;
                      return (
                        <ResultItem
                          key="show-all-products"
                          label={t("show_all_products")}
                          isShowAll
                          isSelected={selectedIndex === idx}
                          index={idx}
                          onClick={() =>
                            navigateToResult(
                              `/products?search=${encodeURIComponent(query)}`
                            )
                          }
                        />
                      );
                    })()}
                  </ResultGroup>
                )}

                {/* Portfolio results */}
                {portfolioResults.length > 0 && (
                  <ResultGroup
                    icon={<Briefcase className="w-4 h-4" />}
                    title={t("projects_group")}
                  >
                    {portfolioResults.map((project) => {
                      flatIndex++;
                      const idx = flatIndex;
                      return (
                        <ResultItem
                          key={`project-${project.id}`}
                          label={project.name}
                          sublabel={`${project.location} · ${project.year}`}
                          isSelected={selectedIndex === idx}
                          index={idx}
                          onClick={() =>
                            navigateToResult(
                              `/portfolio/${project.category}/${project.id}`
                            )
                          }
                        />
                      );
                    })}
                    {(() => {
                      flatIndex++;
                      const idx = flatIndex;
                      return (
                        <ResultItem
                          key="show-all-projects"
                          label={t("show_all_projects")}
                          isShowAll
                          isSelected={selectedIndex === idx}
                          index={idx}
                          onClick={() => navigateToResult("/portfolio")}
                        />
                      );
                    })()}
                  </ResultGroup>
                )}

                {/* Page results */}
                {pageResults.length > 0 && (
                  <ResultGroup
                    icon={<FileText className="w-4 h-4" />}
                    title={t("pages_group")}
                  >
                    {pageResults.map((page) => {
                      flatIndex++;
                      const idx = flatIndex;
                      return (
                        <ResultItem
                          key={`page-${page.href}`}
                          label={tNav(page.labelKey)}
                          isSelected={selectedIndex === idx}
                          index={idx}
                          onClick={() => navigateToResult(page.href)}
                        />
                      );
                    })}
                  </ResultGroup>
                )}
              </div>

              {/* Footer hint */}
              <div className="hidden md:flex items-center gap-4 px-5 py-2.5 border-t border-secondary-dark/20 text-[11px] text-primary/35">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-secondary border border-secondary-dark/30 font-mono">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 rounded bg-secondary border border-secondary-dark/30 font-mono">
                    ↓
                  </kbd>
                  <span className="ms-1">navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-secondary-dark/30 font-mono">
                    ↵
                  </kbd>
                  <span className="ms-1">select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-secondary-dark/30 font-mono">
                    esc
                  </kbd>
                  <span className="ms-1">close</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Sub-components ---

function ResultGroup({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-1">
      <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-primary/45 uppercase tracking-wider">
        {icon}
        {title}
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ResultItem({
  label,
  sublabel,
  isSelected,
  isShowAll,
  onClick,
  index,
}: {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  isShowAll?: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      data-index={index}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-start transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-secondary text-primary/70 hover:text-primary",
        isShowAll && "text-accent hover:text-accent-light text-sm font-medium"
      )}
    >
      {isShowAll ? (
        <span className="text-sm">{label} →</span>
      ) : (
        <>
          <span className="text-sm font-medium truncate">{label}</span>
          {sublabel && (
            <span className="text-xs text-primary/35 truncate ms-auto shrink-0">
              {sublabel}
            </span>
          )}
        </>
      )}
    </motion.button>
  );
}
