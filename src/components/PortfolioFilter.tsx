"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Project {
  id: string;
  category: string;
  name: string;
  location: string;
  year: string;
  coverUrl: string;
}

interface Category {
  id: string;
  translatedName: string;
}

interface PortfolioFilterProps {
  categories: Category[];
  projects: Project[];
}

export default function PortfolioFilter({
  categories,
  projects,
}: PortfolioFilterProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const t = useTranslations("portfolio");

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            activeFilter === "all"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-secondary text-text-secondary hover:bg-secondary-dark hover:text-text-primary"
          }`}
        >
          {t("filter_all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === cat.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-secondary text-text-secondary hover:bg-secondary-dark hover:text-text-primary"
            }`}
          >
            {cat.translatedName}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
            >
              <Link
                href={`/portfolio/${project.category}/${project.id}`}
                className="group block"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary mb-3">
                  <Image
                    src={project.coverUrl}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Fallback */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/30 flex items-center justify-center -z-10">
                    <svg
                      className="w-12 h-12 text-primary/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors text-[15px]">
                  {project.name}
                </h3>
                <p className="text-text-secondary text-sm mt-0.5">
                  {project.location}
                </p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">{t("no_projects")}</p>
        </div>
      )}
    </div>
  );
}
