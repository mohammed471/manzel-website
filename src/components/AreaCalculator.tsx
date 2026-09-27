"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Send,
  CalendarCheck,
  ChevronUp,
  ArrowLeft,
  Grid3x3,
  LayoutPanelTop,
  Package,
  Droplets,
  PaintRoller,
  SquareDashed,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { OfferForm, Section, Segmented } from "@/components/calc/CalcUI";
import { computeArea, type Room, type RoomType } from "@/lib/areaCalculator";
import { TILE_SIZES, formatNumber, type AreaFactors, type TileSize } from "@/lib/calculator";
import type { catalogHref } from "@/components/products/catalogHref";
import { cn } from "@/lib/utils";

type Href = ReturnType<typeof catalogHref>;
export interface MaterialLinks {
  tiles: Record<TileSize, Href>;
  adhesive: Href;
  paint: Href;
}

const WHATSAPP = "9647737685000";
const MAX_ROOMS = 20;
const ROOM_TYPES: RoomType[] = ["room", "bathroom", "kitchen"];

const num = (v: string, max: number) => Math.min(max, Math.max(0, Number(v.replace(",", ".")) || 0));
const fmt = (n: number) => formatNumber(Math.round(n * 100) / 100);

// Area & quantities calculator: rooms in, material quantities out (live).
// Factors come from the internal app; each material links to its products.
export default function AreaCalculator({ factors, links }: { factors: AreaFactors; links: MaterialLinks }) {
  const t = useTranslations("area_calculator");
  const nextId = useRef(4);
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", type: "room", length: 4, width: 4, doors: 1, windows: 1 },
    { id: "2", type: "bathroom", length: 2.5, width: 2, doors: 1, windows: 0 },
    { id: "3", type: "kitchen", length: 3.5, width: 3, doors: 1, windows: 1 },
  ]);
  const [wallHeight, setWallHeight] = useState(3);
  const [floorTile, setFloorTile] = useState<TileSize>("60x60");
  const [wallTile, setWallTile] = useState<TileSize>("30x60");
  const [includePaint, setIncludePaint] = useState(true);

  const result = useMemo(
    () => computeArea({ rooms, wallHeight, floorTile, wallTile, includePaint }, factors),
    [rooms, wallHeight, floorTile, wallTile, includePaint, factors],
  );
  const hasResult = result.floorArea > 0;

  // "غرفة 1", "حمام 1", "غرفة 2"… numbered per type
  const roomName = (index: number) => {
    const r = rooms[index];
    const n = rooms.slice(0, index + 1).filter((x) => x.type === r.type).length;
    return t(`default_name_${r.type}`, { n });
  };
  const update = (id: string, patch: Partial<Room>) =>
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRoom = () =>
    setRooms((prev) =>
      prev.length >= MAX_ROOMS
        ? prev
        : [...prev, { id: String(nextId.current++), type: "room", length: 0, width: 0, doors: 1, windows: 1 }],
    );

  const sizeLabel = (s: TileSize) => {
    const [a, b] = s.split("x");
    return t("tile_size", { a, b });
  };

  const materials = [
    result.floorTiles.boxes > 0 && {
      key: "floor",
      icon: Grid3x3,
      label: t("m_floor_tiles"),
      value: t("boxes", { count: result.floorTiles.boxes }),
      detail: t("tiles_detail", { size: sizeLabel(floorTile), area: fmt(result.floorTiles.areaWithWaste), pieces: result.floorTiles.pieces, waste: factors.waste_pct }),
      href: links.tiles[floorTile],
    },
    result.wallTiles.boxes > 0 && {
      key: "wall",
      icon: LayoutPanelTop,
      label: t("m_wall_tiles"),
      value: t("boxes", { count: result.wallTiles.boxes }),
      detail: t("tiles_detail", { size: sizeLabel(wallTile), area: fmt(result.wallTiles.areaWithWaste), pieces: result.wallTiles.pieces, waste: factors.waste_pct }),
      href: links.tiles[wallTile],
    },
    result.adhesiveBags > 0 && {
      key: "adhesive",
      icon: Package,
      label: t("m_adhesive"),
      value: t("bags", { count: result.adhesiveBags }),
      detail: t("bag_detail", { kg: factors.adhesive_bag_kg }),
      href: links.adhesive,
    },
    result.groutBags > 0 && {
      key: "grout",
      icon: SquareDashed,
      label: t("m_grout"),
      value: t("bags", { count: result.groutBags }),
      detail: t("bag_detail", { kg: factors.grout_bag_kg }),
      href: links.adhesive,
    },
    result.siliconeTubes > 0 && {
      key: "silicone",
      icon: Droplets,
      label: t("m_silicone"),
      value: t("tubes", { count: result.siliconeTubes }),
      detail: "",
      href: links.adhesive,
    },
    result.paintGallons > 0 && {
      key: "paint",
      icon: PaintRoller,
      label: t("m_paint"),
      value: t("gallons", { count: result.paintGallons }),
      detail: t("paint_detail", { area: fmt(result.paintArea), coats: factors.paint_coats }),
      href: links.paint,
    },
  ].filter(Boolean) as { key: string; icon: LucideIcon; label: string; value: string; detail: string; href: Href }[];

  const summary = [
    ...rooms
      .map((r, i) => (r.length > 0 && r.width > 0 ? t("sum_room", { name: roomName(i), length: fmt(r.length), width: fmt(r.width) }) : null))
      .filter(Boolean),
    t("sum_floor", { area: fmt(result.floorArea) }),
    ...materials.map((m) => t("sum_line", { label: m.label, value: m.value })),
  ].join("\n");
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("whatsapp_message", { summary }))}`;
  const [offerOpen, setOfferOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-10 items-start">
      {/* ── Inputs ── */}
      <div className="space-y-5 md:space-y-6">
        <Section title={t("s_rooms")} hint={t("s_rooms_hint")}>
          <ul className="space-y-3">
            {rooms.map((r, i) => {
              const name = roomName(i);
              const area = Math.max(0, r.length) * Math.max(0, r.width);
              return (
                <li key={r.id} className="rounded-2xl border border-secondary-dark/60 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Segmented
                      value={r.type}
                      onChange={(type) => update(r.id, { type, windows: type === "bathroom" ? 0 : r.windows })}
                      options={ROOM_TYPES.map((key) => ({ value: key, label: t(`room_type_${key}`) }))}
                      ariaLabel={name}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary tabular-nums">{t("room_area", { area: fmt(area) })}</span>
                      <button
                        type="button"
                        onClick={() => setRooms((prev) => prev.filter((x) => x.id !== r.id))}
                        disabled={rooms.length === 1}
                        aria-label={t("remove_room", { name })}
                        className="flex w-10 h-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-30 cursor-pointer disabled:cursor-default"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-bold text-text-primary">{name}</p>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <NumberField label={t("length")} unit={t("meters")} value={r.length} onChange={(v) => update(r.id, { length: num(v, 100) })} />
                    <NumberField label={t("width")} unit={t("meters")} value={r.width} onChange={(v) => update(r.id, { width: num(v, 100) })} />
                    <Stepper label={t("doors")} value={r.doors} onChange={(doors) => update(r.id, { doors })} t={t} />
                    <Stepper label={t("windows")} value={r.windows} onChange={(windows) => update(r.id, { windows })} t={t} />
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={addRoom}
            disabled={rooms.length >= MAX_ROOMS}
            className="mt-3 flex w-full h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-secondary-dark text-sm font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary/[0.03] disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {rooms.length >= MAX_ROOMS ? t("max_rooms") : t("add_room")}
          </button>
        </Section>

        <Section title={t("s_tiles")}>
          <p className="text-sm font-bold text-text-primary">{t("floor_tile")}</p>
          <SizeChips value={floorTile} onChange={setFloorTile} label={sizeLabel} ariaLabel={t("floor_tile")} />
          {result.wetRooms > 0 && (
            <>
              <p className="mt-5 text-sm font-bold text-text-primary">{t("wall_tile")}</p>
              <SizeChips value={wallTile} onChange={setWallTile} label={sizeLabel} ariaLabel={t("wall_tile")} />
            </>
          )}
        </Section>

        <Section title={t("s_walls")}>
          <div className="flex flex-wrap items-end gap-5">
            <div className="w-40">
              <NumberField label={t("wall_height")} unit={t("meters")} value={wallHeight} onChange={(v) => setWallHeight(num(v, 10))} />
            </div>
            <label className="flex h-12 items-center gap-3 rounded-2xl bg-secondary-light px-4 text-sm font-bold text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={includePaint}
                onChange={(e) => setIncludePaint(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
              {t("include_paint")}
            </label>
          </div>
        </Section>
      </div>

      {/* ── Result ── */}
      <aside id="estimate" className="lg:sticky lg:top-28 scroll-mt-24">
        <div className="overflow-hidden rounded-3xl bg-white border border-secondary-dark/40">
          <div className="bg-primary px-6 py-6 text-white">
            <p className="text-sm text-white/70">{t("total_floor")}</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold tabular-nums leading-tight">
              {fmt(result.floorArea)} <span className="text-lg font-medium text-white/80">{t("sqm")}</span>
            </p>
          </div>

          {hasResult ? (
            <div className="px-6 pt-5">
              <p className="text-xs font-bold text-text-secondary">{t("result_title")}</p>
              <ul className="mt-2 divide-y divide-secondary-dark/40">
                {materials.map(({ key, icon: Icon, label, value, detail, href }) => (
                  <li key={key} className="flex items-center gap-3 py-3">
                    <span className="flex w-9 h-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm text-text-primary">{label}</span>
                        <span className="shrink-0 text-sm font-bold text-primary tabular-nums">{value}</span>
                      </span>
                      {detail && <span className="mt-0.5 block text-[11px] text-text-secondary tabular-nums">{detail}</span>}
                    </span>
                    <Link
                      href={href}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 px-2.5 h-8 text-[11px] font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      {t("browse")}
                      <ArrowLeft className="w-3 h-3 ltr:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="px-6 pt-5 text-sm text-text-secondary">{t("empty")}</p>
          )}

          <div className="p-6 space-y-3">
            <p className="text-xs leading-relaxed text-text-secondary">{t("disclaimer", { waste: factors.waste_pct })}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!hasResult}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white transition-colors hover:bg-[#20BD5A]",
                !hasResult && "pointer-events-none opacity-50",
              )}
            >
              <MessageCircle className="w-4 h-4" />
              {t("whatsapp_cta")}
            </a>
            {offerOpen ? (
              <OfferForm message={t("lead_message", { summary })} onClose={() => setOfferOpen(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setOfferOpen(true)}
                disabled={!hasResult}
                className="flex w-full h-12 items-center justify-center gap-2 rounded-full border border-primary/25 px-5 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {t("offer_cta")}
              </button>
            )}
            <Link
              href="/booking"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-light"
            >
              <CalendarCheck className="w-4 h-4" />
              {t("booking_cta")}
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Mobile summary bar (above MobileBottomNav) ── */}
      <a
        href="#estimate"
        className="calc-mobile-bar lg:hidden fixed inset-x-3 z-40 flex items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-white shadow-[0_10px_30px_-10px_rgba(14,42,39,0.6)]"
        style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
      >
        <span className="min-w-0">
          <span className="block text-[11px] text-white/70">{t("total_floor")}</span>
          <span className="block truncate text-base font-bold tabular-nums">
            {fmt(result.floorArea)} {t("sqm")}
            {result.floorTiles.boxes > 0 && ` · ${t("boxes", { count: result.floorTiles.boxes })}`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
          {t("view_breakdown")}
          <ChevronUp className="w-3.5 h-3.5" />
        </span>
      </a>
    </div>
  );
}

function NumberField({ label, unit, value, onChange }: { label: string; unit: string; value: number; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-text-secondary">{label}</span>
      <span className="mt-1 flex h-11 items-center rounded-xl border border-secondary-dark/60 bg-white pe-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent px-3 text-base font-bold text-primary tabular-nums focus:outline-none"
        />
        <span className="text-xs text-text-secondary">{unit}</span>
      </span>
    </label>
  );
}

function Stepper({
  label,
  value,
  onChange,
  t,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const btn =
    "flex w-9 h-9 items-center justify-center rounded-full border border-secondary-dark/60 bg-white text-primary transition-colors hover:border-primary disabled:opacity-40 cursor-pointer disabled:cursor-default";
  return (
    <div>
      <span className="text-xs font-bold text-text-secondary">{label}</span>
      <div className="mt-1 flex h-11 items-center justify-between rounded-xl bg-secondary-light px-1">
        <button type="button" className={btn} aria-label={t("decrease", { name: label })} disabled={value === 0} onClick={() => onChange(value - 1)}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-base font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" className={btn} aria-label={t("increase", { name: label })} disabled={value === 10} onClick={() => onChange(value + 1)}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function SizeChips({
  value,
  onChange,
  label,
  ariaLabel,
}: {
  value: TileSize;
  onChange: (v: TileSize) => void;
  label: (s: TileSize) => string;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="mt-2 flex flex-wrap gap-2">
      {TILE_SIZES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          dir="ltr"
          className={cn(
            "h-10 rounded-full px-4 text-sm font-bold tabular-nums transition-colors cursor-pointer",
            value === s ? "bg-primary text-white" : "bg-white border border-secondary-dark/60 text-text-primary hover:border-primary/40",
          )}
        >
          {label(s)}
        </button>
      ))}
    </div>
  );
}
