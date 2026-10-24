"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import MasonryGrid from "@/components/MasonryGrid";
import MasonryProjectCard from "@/components/MasonryProjectCard";
import { buttonClasses } from "@/components/ui/Button";
import type { PortfolioProject } from "@/lib/portfolio";
import { areaRangeIndex, filterProjects, type ProjectFilter } from "@/lib/portfolioFilters";
import { cn } from "@/lib/utils";

interface ProjectsBrowserProps {
  projects: PortfolioProject[];
  /** This category's types, names already localized */
  types: { id: string; name: string }[];
  areaBounds: number[];
}

// The filter lives in the URL (?type=cafe&area=200): "back" from a project keeps
// it and a filtered view can be shared. It is read from `window.location`, not
// `useSearchParams` — that hook would drop the grid from this static page's HTML.
const FILTER_EVENT = "portfolio-filter";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTER_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTER_EVENT, onChange);
  };
}

function setParams(values: Record<string, string | undefined>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  // `null` state: Next.js keeps its own history state and syncs the router to the new URL
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(FILTER_EVENT));
}

// Category grid with its filters (type, built/design, area) behind one "Filter" button. A chip
// exists only if a project carries it, and a row only if it offers a choice — so
// a category with no types or areas entered in the internal app shows the plain grid.
export default function ProjectsBrowser({ projects, types, areaBounds }: ProjectsBrowserProps) {
  const t = useTranslations("portfolio");
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");

  // `?area=` carries the range's upper bound, so links survive the ranges being edited
  const rangeParam = (range: number) => (range < areaBounds.length ? String(areaBounds[range]) : "more");
  const rangeLabel = (range: number) =>
    range === 0
      ? t("area_up_to", { max: String(areaBounds[0]) })
      : range < areaBounds.length
        ? t("area_between", { min: String(areaBounds[range - 1] + 1), max: String(areaBounds[range]) })
        : t("area_over", { min: String(areaBounds[range - 1]) });

  const typeOptions = types.filter((type) => projects.some((p) => p.type === type.id));
  const rangeOptions = [
    ...new Set(projects.flatMap((p) => (p.area ? [areaRangeIndex(p.area, areaBounds)] : []))),
  ].sort((a, b) => a - b);
  const kindOptions = (["built", "design"] as const).filter((k) => projects.some((p) => p.kind === k));
  const showKinds = kindOptions.length > 1;
  const showTypes = typeOptions.length > 1;
  const showRanges = rangeOptions.length > 1;

  const params = new URLSearchParams(search);
  const filter: ProjectFilter = {
    type: showTypes ? typeOptions.find((type) => type.id === params.get("type"))?.id : undefined,
    kind: showKinds ? kindOptions.find((k) => k === params.get("kind")) : undefined,
    range: showRanges ? rangeOptions.find((range) => rangeParam(range) === params.get("area")) : undefined,
  };
  const activeCount = (filter.type ? 1 : 0) + (filter.kind ? 1 : 0) + (filter.range === undefined ? 0 : 1);
  const count = (f: ProjectFilter) => filterProjects(projects, f, areaBounds).length;
  const filtered = filterProjects(projects, filter, areaBounds);
  const clear = () => setParams({ type: undefined, kind: undefined, area: undefined });

  return (
    <div>
      {(showTypes || showKinds || showRanges) && (
        // Native <details>: one button opens the filters, no state to keep
        <details className="group mb-10">
          <summary
            className={cn(
              buttonClasses(activeCount ? "primary" : "outline"),
              "w-fit list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("filter_button")}
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-primary">
                {activeCount}
              </span>
            )}
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4 flex flex-col gap-5 rounded-3xl border border-secondary-dark/40 bg-white p-5 md:p-6">
            {showTypes && (
              <ChipGroup label={t("spec_type")}>
                <Chip active={!filter.type} onClick={() => setParams({ type: undefined })}>
                  {t("filter_all")}
                </Chip>
                {typeOptions.map((type) => (
                  <Chip
                    key={type.id}
                    active={filter.type === type.id}
                    // Nothing of this type in the chosen area range — dimmed rather than a dead end
                    disabled={count({ ...filter, type: type.id }) === 0}
                    onClick={() => setParams({ type: type.id })}
                  >
                    {type.name}
                  </Chip>
                ))}
              </ChipGroup>
            )}
            {showKinds && (
              <ChipGroup label={t("filter_kind")}>
                <Chip active={!filter.kind} onClick={() => setParams({ kind: undefined })}>
                  {t("filter_all")}
                </Chip>
                {kindOptions.map((k) => (
                  <Chip
                    key={k}
                    active={filter.kind === k}
                    disabled={count({ ...filter, kind: k }) === 0}
                    onClick={() => setParams({ kind: k })}
                  >
                    {t(k === "built" ? "kind_built" : "kind_design")}
                  </Chip>
                ))}
              </ChipGroup>
            )}
            {showRanges && (
              <ChipGroup label={t("spec_area")}>
                <Chip active={filter.range === undefined} onClick={() => setParams({ area: undefined })}>
                  {t("filter_all")}
                </Chip>
                {rangeOptions.map((range) => (
                  <Chip
                    key={range}
                    active={filter.range === range}
                    disabled={count({ ...filter, range }) === 0}
                    onClick={() => setParams({ area: rangeParam(range) })}
                  >
                    {rangeLabel(range)}
                  </Chip>
                ))}
              </ChipGroup>
            )}
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-t border-secondary-dark/30 pt-4">
              <p aria-live="polite" className="text-sm font-medium text-text-secondary">
                {t("projects_count", { count: filtered.length })}
              </p>
              {activeCount > 0 && (
                <button type="button" onClick={clear} className={buttonClasses("ghost")}>
                  {t("clear_filters")}
                </button>
              )}
            </div>
          </div>
        </details>
      )}

      {filtered.length > 0 ? (
        <MasonryGrid>
          {filtered.map((project) => (
            <MasonryProjectCard key={project.id} project={project} />
          ))}
        </MasonryGrid>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg mb-6">{t("no_matches")}</p>
          <button type="button" onClick={clear} className={buttonClasses("outline")}>
            {t("clear_filters")}
          </button>
        </div>
      )}
    </div>
  );
}

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5 text-sm font-bold text-text-primary">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      // The active chip stays enabled so the selection is never stuck
      disabled={disabled && !active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-primary text-white"
          : "bg-surface border border-secondary-dark/50 text-text-secondary enabled:hover:border-primary/30 enabled:hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
