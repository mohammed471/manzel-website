"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
}

type MaterialTab = "tiles" | "paint" | "flooring";

// ─── Constants ───────────────────────────────────────────────────────────────

const TILE_SIZES = [30, 40, 50, 60, 80] as const;

const TILES_PER_BOX: Record<number, number> = {
  30: 12,
  40: 9,
  50: 6,
  60: 4,
  80: 2,
};

const MATERIAL_TABS: MaterialTab[] = ["tiles", "paint", "flooring"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(n: number, locale: string): string {
  return n.toLocaleString(locale === "ar" ? "ar-IQ" : "en-US");
}

function formatPrice(n: number, locale: string, currency: string): string {
  return `${n.toLocaleString(locale === "ar" ? "ar-IQ" : "en-US")} ${currency}`;
}

// ─── Calculation Functions ───────────────────────────────────────────────────

function getRoomArea(room: Room): number {
  return room.length > 0 && room.width > 0 ? room.length * room.width : 0;
}

function getTotalArea(rooms: Room[]): number {
  return rooms.reduce((sum, r) => sum + getRoomArea(r), 0);
}

function calculateTiles(totalArea: number, tileSize: number) {
  const tileAreaSqm = (tileSize / 100) ** 2;
  const tilesNeeded = Math.ceil((totalArea / tileAreaSqm) * 1.1);
  const tilesPerBox = TILES_PER_BOX[tileSize];
  const boxesNeeded = Math.ceil(tilesNeeded / tilesPerBox);
  return { tilesNeeded, boxesNeeded, tilesPerBox };
}

function calculatePaint(rooms: Room[], wallHeight: number) {
  const totalWallArea = rooms.reduce((sum, room) => {
    if (room.length <= 0 || room.width <= 0) return sum;
    const perimeter = 2 * (room.length + room.width);
    return sum + perimeter * wallHeight;
  }, 0);
  const totalGallons = Math.ceil((totalWallArea / 12) * 2);
  return { totalWallArea: Math.round(totalWallArea * 100) / 100, totalGallons };
}

function calculateFlooring(totalArea: number, pricePerSqm: number) {
  return Math.round(totalArea * pricePerSqm);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AreaCalculator() {
  const t = useTranslations("area_calculator");
  const locale = useLocale();

  // Room state
  const [rooms, setRooms] = useState<Room[]>([
    { id: generateId(), name: t("default_room", { n: 1 }), length: 0, width: 0 },
  ]);

  // Material state
  const [activeMaterial, setActiveMaterial] = useState<MaterialTab>("tiles");
  const [tileSize, setTileSize] = useState<number>(40);
  const [wallHeight, setWallHeight] = useState<number>(3);
  const [pricePerSqm, setPricePerSqm] = useState<number>(0);

  // Animated counter values
  const [animValues, setAnimValues] = useState<Record<string, number>>({});
  const animRef = useRef<number>(0);
  const prevTotalRef = useRef<number>(0);

  // ─── Room management ────────────────────────────────────────────────────

  const addRoom = useCallback(() => {
    if (rooms.length >= 20) return;
    setRooms((prev) => [
      ...prev,
      {
        id: generateId(),
        name: t("default_room", { n: prev.length + 1 }),
        length: 0,
        width: 0,
      },
    ]);
  }, [rooms.length, t]);

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const updateRoom = useCallback((id: string, field: keyof Room, value: string | number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }, []);

  // ─── Computed values ────────────────────────────────────────────────────

  const totalArea = getTotalArea(rooms);
  const hasResults = totalArea > 0;

  const tileResults = calculateTiles(totalArea, tileSize);
  const paintResults = calculatePaint(rooms, wallHeight);
  const flooringCost = calculateFlooring(totalArea, pricePerSqm);

  const maxRoomArea = Math.max(...rooms.map(getRoomArea), 1);

  // ─── Animated counter ───────────────────────────────────────────────────

  useEffect(() => {
    if (!hasResults) {
      setAnimValues({});
      prevTotalRef.current = 0;
      return;
    }

    const targets: Record<string, number> = {
      totalArea: Math.round(totalArea * 100) / 100,
      tilesNeeded: tileResults.tilesNeeded,
      boxesNeeded: tileResults.boxesNeeded,
      totalWallArea: paintResults.totalWallArea,
      totalGallons: paintResults.totalGallons,
      flooringCost,
    };

    // Only animate on significant changes
    if (Math.abs(totalArea - prevTotalRef.current) < 0.01) {
      setAnimValues(targets);
      return;
    }
    prevTotalRef.current = totalArea;

    const duration = 1200;
    const startTime = performance.now();
    const startValues = { ...animValues };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const newVals: Record<string, number> = {};
      for (const [key, target] of Object.entries(targets)) {
        const start = startValues[key] || 0;
        newVals[key] = start + (target - start) * eased;
      }
      setAnimValues(newVals);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalArea, tileSize, wallHeight, pricePerSqm, hasResults]);

  // ─── WhatsApp ───────────────────────────────────────────────────────────

  const buildWhatsAppUrl = () => {
    const roomDetails = rooms
      .filter((r) => r.length > 0 && r.width > 0)
      .map((r) => `${r.name}: ${getRoomArea(r).toFixed(1)} ${t("sqm")}`)
      .join("\n");

    let materialDetails = "";
    if (activeMaterial === "tiles") {
      materialDetails = `${t("tab_tiles")}: ${tileResults.tilesNeeded} ${t("piece")} (${tileSize}x${tileSize} cm)`;
    } else if (activeMaterial === "paint") {
      materialDetails = `${t("tab_paint")}: ${paintResults.totalGallons} ${t("gallon")}`;
    } else if (activeMaterial === "flooring" && pricePerSqm > 0) {
      materialDetails = `${t("tab_flooring")}: ${formatPrice(flooringCost, locale, t("currency"))}`;
    }

    const message = t("whatsapp_message", {
      totalArea: formatNumber(Math.round(totalArea * 100) / 100, locale),
      roomDetails,
      materialDetails,
    });

    return `https://wa.me/9647737685000?text=${encodeURIComponent(message)}`;
  };

  // ─── Print ──────────────────────────────────────────────────────────────

  const handlePrint = () => {
    window.print();
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ═══ Room Input Card ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">{t("rooms_title")}</h2>
          <span className="text-sm text-gray-400">
            {rooms.length}/20
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-xl">
                  {/* Room name */}
                  <div className="sm:flex-1">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {t("room_name")}
                    </label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
                      placeholder={t("default_room", { n: index + 1 })}
                    />
                  </div>

                  {/* Length */}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {t("length")}
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={room.length || ""}
                      onChange={(e) =>
                        updateRoom(room.id, "length", Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  {/* Width */}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {t("width")}
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={room.width || ""}
                      onChange={(e) =>
                        updateRoom(room.id, "width", Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  {/* Room area display */}
                  <div className="flex items-end gap-2">
                    <div className="text-center min-w-[80px]">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        {t("room_area")}
                      </label>
                      <div className="py-3 px-3 bg-primary/5 rounded-xl text-sm font-bold text-primary" dir="ltr">
                        {getRoomArea(room) > 0
                          ? `${getRoomArea(room).toFixed(1)} ${t("sqm")}`
                          : `— ${t("sqm")}`}
                      </div>
                    </div>

                    {/* Delete button */}
                    {rooms.length > 1 && (
                      <button
                        onClick={() => removeRoom(room.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors print:hidden"
                        aria-label={t("remove_room")}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add room button */}
        {rooms.length < 20 ? (
          <button
            onClick={addRoom}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 hover:border-primary text-gray-500 hover:text-primary rounded-xl transition-colors font-medium text-sm print:hidden"
          >
            + {t("add_room")}
          </button>
        ) : (
          <p className="mt-4 text-center text-sm text-gray-400">{t("max_rooms")}</p>
        )}
      </div>

      {/* ═══ Area Summary Card ═══ */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-primary mb-6">{t("area_summary")}</h2>

              {/* Total area */}
              <div className="text-center mb-8 p-6 bg-primary/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">{t("total_area")}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-extrabold text-primary" dir="ltr">
                    {formatNumber(
                      Math.round((animValues.totalArea ?? totalArea) * 100) / 100,
                      locale
                    )}
                  </span>
                  <span className="text-lg font-semibold text-primary/70">{t("sqm")}</span>
                </div>
              </div>

              {/* Room proportion bars */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-500 mb-3">{t("room_proportions")}</p>
                {rooms
                  .filter((r) => getRoomArea(r) > 0)
                  .map((room, index) => {
                    const area = getRoomArea(room);
                    const widthPercent = Math.max((area / maxRoomArea) * 100, 8);
                    return (
                      <motion.div
                        key={room.id}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          ease: "easeOut",
                          delay: index * 0.08,
                        }}
                        style={{
                          width: `${widthPercent}%`,
                          transformOrigin: locale === "ar" ? "right" : "left",
                        }}
                        className="h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center px-3 min-w-fit"
                      >
                        <span className="text-xs font-medium text-primary truncate">
                          {room.name}
                        </span>
                        <span className="text-xs text-primary/60 ms-auto ps-2 whitespace-nowrap" dir="ltr">
                          {area.toFixed(1)} {t("sqm")}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Material Estimation Card ═══ */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-primary mb-6">{t("materials_title")}</h2>

              {/* Tab selector */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 print:hidden">
                {MATERIAL_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMaterial(tab)}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all",
                      activeMaterial === tab
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-500 hover:text-primary"
                    )}
                  >
                    {t(`tab_${tab}`)}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMaterial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeMaterial === "tiles" && (
                    <TilesTab
                      t={t}
                      locale={locale}
                      tileSize={tileSize}
                      setTileSize={setTileSize}
                      tilesNeeded={Math.round(animValues.tilesNeeded ?? tileResults.tilesNeeded)}
                      boxesNeeded={Math.round(animValues.boxesNeeded ?? tileResults.boxesNeeded)}
                      tilesPerBox={tileResults.tilesPerBox}
                    />
                  )}
                  {activeMaterial === "paint" && (
                    <PaintTab
                      t={t}
                      locale={locale}
                      wallHeight={wallHeight}
                      setWallHeight={setWallHeight}
                      totalWallArea={Math.round((animValues.totalWallArea ?? paintResults.totalWallArea) * 100) / 100}
                      totalGallons={Math.round(animValues.totalGallons ?? paintResults.totalGallons)}
                    />
                  )}
                  {activeMaterial === "flooring" && (
                    <FlooringTab
                      t={t}
                      locale={locale}
                      pricePerSqm={pricePerSqm}
                      setPricePerSqm={setPricePerSqm}
                      totalArea={totalArea}
                      totalCost={Math.round(animValues.flooringCost ?? flooringCost)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Action Buttons ═══ */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 print:hidden"
          >
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3.5 px-6 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("whatsapp_cta")}
            </a>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold py-3.5 px-6 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t("print_cta")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Empty state ═══ */}
      {!hasResults && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-400 text-sm">{t("enter_dimensions")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TilesTab({
  t,
  locale,
  tileSize,
  setTileSize,
  tilesNeeded,
  boxesNeeded,
  tilesPerBox,
}: {
  t: ReturnType<typeof useTranslations>;
  locale: string;
  tileSize: number;
  setTileSize: (s: number) => void;
  tilesNeeded: number;
  boxesNeeded: number;
  tilesPerBox: number;
}) {
  return (
    <div className="space-y-6">
      {/* Tile size selector */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-3 block">{t("tile_size")}</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {TILE_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setTileSize(size)}
              className={cn(
                "py-3 px-2 rounded-xl text-sm font-semibold transition-all border",
                tileSize === size
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-primary/30"
              )}
            >
              {size}×{size}
              <span className="block text-xs font-normal mt-0.5 opacity-60">cm</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          label={t("tiles_needed")}
          value={formatNumber(tilesNeeded, locale)}
          unit={t("piece")}
          accent
        />
        <ResultCard
          label={t("boxes_needed")}
          value={formatNumber(boxesNeeded, locale)}
          unit={t("box")}
          subtitle={t("tiles_per_box", { count: tilesPerBox })}
        />
      </div>
      <p className="text-xs text-gray-400 text-center">{t("waste_included")}</p>
    </div>
  );
}

function PaintTab({
  t,
  locale,
  wallHeight,
  setWallHeight,
  totalWallArea,
  totalGallons,
}: {
  t: ReturnType<typeof useTranslations>;
  locale: string;
  wallHeight: number;
  setWallHeight: (h: number) => void;
  totalWallArea: number;
  totalGallons: number;
}) {
  return (
    <div className="space-y-6">
      {/* Wall height input */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">{t("wall_height")}</label>
        <input
          type="number"
          dir="ltr"
          value={wallHeight}
          onChange={(e) => setWallHeight(Math.max(1, Math.min(10, parseFloat(e.target.value) || 3)))}
          className="w-full sm:w-48 rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
          min="1"
          max="10"
          step="0.1"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          label={t("total_wall_area")}
          value={formatNumber(totalWallArea, locale)}
          unit={t("sqm")}
        />
        <ResultCard
          label={t("gallons_needed")}
          value={formatNumber(totalGallons, locale)}
          unit={t("gallon")}
          accent
        />
      </div>
      <p className="text-xs text-gray-400 text-center">{t("coats_note")}</p>
    </div>
  );
}

function FlooringTab({
  t,
  locale,
  pricePerSqm,
  setPricePerSqm,
  totalArea,
  totalCost,
}: {
  t: ReturnType<typeof useTranslations>;
  locale: string;
  pricePerSqm: number;
  setPricePerSqm: (p: number) => void;
  totalArea: number;
  totalCost: number;
}) {
  const currency = t("currency");
  return (
    <div className="space-y-6">
      {/* Price input */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          {t("price_per_sqm")} ({currency})
        </label>
        <input
          type="number"
          dir="ltr"
          value={pricePerSqm || ""}
          onChange={(e) => setPricePerSqm(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full sm:w-48 rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
          placeholder="0"
          min="0"
          step="1000"
        />
      </div>

      {/* Results */}
      {pricePerSqm > 0 && (
        <div className="grid grid-cols-1 gap-4">
          <ResultCard
            label={t("total_cost")}
            value={formatPrice(totalCost, locale, currency)}
            accent
            large
          />
          <p className="text-xs text-gray-400 text-center">
            {formatNumber(Math.round(totalArea * 100) / 100, locale)} {t("sqm")} × {formatNumber(pricePerSqm, locale)} {currency}
          </p>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  unit,
  subtitle,
  accent,
  large,
}: {
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 text-center",
        accent ? "bg-primary/5 border border-primary/10" : "bg-gray-50 border border-gray-100"
      )}
    >
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <div className="flex items-baseline justify-center gap-1.5" dir="ltr">
        <span
          className={cn(
            "font-extrabold",
            large ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
            accent ? "text-primary" : "text-gray-800"
          )}
        >
          {value}
        </span>
        {unit && (
          <span className={cn("text-sm font-semibold", accent ? "text-primary/60" : "text-gray-400")}>
            {unit}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
