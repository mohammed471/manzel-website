"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RotateCcw, Check, Link2, Palette } from "lucide-react";

// Types
type ZoneId = "left_wall" | "right_wall" | "back_wall" | "floor" | "ceiling";

interface ColorOption {
  id: string;
  hex: string;
  nameKey: string;
  code: string;
}

interface ColorFamily {
  id: string;
  nameKey: string;
  colors: ColorOption[];
}

interface PresetTheme {
  id: string;
  nameKey: string;
  colors: Record<ZoneId, string>;
}

// Zone label keys
const ZONE_KEYS: Record<ZoneId, string> = {
  left_wall: "zone_left_wall",
  right_wall: "zone_right_wall",
  back_wall: "zone_back_wall",
  floor: "zone_floor",
  ceiling: "zone_ceiling",
};

// URL param keys
const PARAM_KEYS: Record<ZoneId, string> = {
  left_wall: "lw",
  right_wall: "rw",
  back_wall: "bw",
  floor: "fl",
  ceiling: "cl",
};

// Default colors (Jotun Classic White + Soothing Beige floor)
const DEFAULT_COLORS: Record<ZoneId, string> = {
  left_wall: "#f0efe9",
  right_wall: "#f0efe9",
  back_wall: "#efede2",
  floor: "#cac0af",
  ceiling: "#f0efe9",
};

// Color palette — Jotun Fenomastic interior paint colors
const COLOR_FAMILIES: ColorFamily[] = [
  {
    id: "whites",
    nameKey: "family_whites",
    colors: [
      { id: "clear_1442", hex: "#f4eedf", nameKey: "c_clear", code: "1442" },
      { id: "classic_white_9918", hex: "#f0efe9", nameKey: "c_classic_white", code: "9918" },
      { id: "cotton_ball_1453", hex: "#f0efe2", nameKey: "c_cotton_ball", code: "1453" },
      { id: "egg_white_1001", hex: "#efede2", nameKey: "c_egg_white", code: "1001" },
      { id: "reflection_1622", hex: "#ebe9e1", nameKey: "c_reflection", code: "1622" },
      { id: "white_comfort_8395", hex: "#ebe9de", nameKey: "c_white_comfort", code: "8395" },
      { id: "soul_1625", hex: "#ece8d7", nameKey: "c_soul", code: "1625" },
      { id: "early_rain_0486", hex: "#eae7db", nameKey: "c_early_rain", code: "0486" },
    ],
  },
  {
    id: "greys",
    nameKey: "family_greys",
    colors: [
      { id: "summer_snow_1928", hex: "#e4e2d7", nameKey: "c_summer_snow", code: "1928" },
      { id: "mist_1376", hex: "#e4e0d3", nameKey: "c_mist", code: "1376" },
      { id: "breeze_0552", hex: "#e1dcd1", nameKey: "c_breeze", code: "0552" },
      { id: "timeless_1024", hex: "#e0ddd2", nameKey: "c_timeless", code: "1024" },
      { id: "oxford_river_9915", hex: "#d4d4cf", nameKey: "c_oxford_river", code: "9915" },
      { id: "gentle_whisper_12182", hex: "#d2cbbf", nameKey: "c_gentle_whisper", code: "12182" },
      { id: "smooth_white_8470", hex: "#cecbc0", nameKey: "c_smooth_white", code: "8470" },
      { id: "sheer_grey_12077", hex: "#ccc7bd", nameKey: "c_sheer_grey", code: "12077" },
      { id: "comfort_grey_12078", hex: "#beb9af", nameKey: "c_comfort_grey", code: "12078" },
      { id: "soft_grey_0394", hex: "#afa99c", nameKey: "c_soft_grey", code: "0394" },
      { id: "slate_lavender_3377", hex: "#8e8687", nameKey: "c_slate_lavender", code: "3377" },
    ],
  },
  {
    id: "beige",
    nameKey: "family_beige",
    colors: [
      { id: "sense_1875", hex: "#e6dfce", nameKey: "c_sense", code: "1875" },
      { id: "mild_1275", hex: "#e6e0d0", nameKey: "c_mild", code: "1275" },
      { id: "milky_way_1832", hex: "#e7dfcd", nameKey: "c_milky_way", code: "1832" },
      { id: "vanilla_latte_1519", hex: "#e5dac8", nameKey: "c_vanilla_latte", code: "1519" },
      { id: "space_10678", hex: "#d6cfbf", nameKey: "c_space", code: "10678" },
      { id: "sand_1140", hex: "#cfc5b4", nameKey: "c_sand", code: "1140" },
      { id: "macchiato_1359", hex: "#cec1b1", nameKey: "c_macchiato", code: "1359" },
      { id: "washed_linen_10679", hex: "#c9c3b6", nameKey: "c_washed_linen", code: "10679" },
      { id: "antique_white_1016", hex: "#cdc5b5", nameKey: "c_antique_white", code: "1016" },
      { id: "soothing_beige_12075", hex: "#cac0af", nameKey: "c_soothing_beige", code: "12075" },
      { id: "soft_skin_10580", hex: "#cbbbac", nameKey: "c_soft_skin", code: "10580" },
      { id: "modern_beige_12076", hex: "#bfb3a3", nameKey: "c_modern_beige", code: "12076" },
    ],
  },
  {
    id: "yellow",
    nameKey: "family_yellow",
    colors: [
      { id: "fresh_pasta_1775", hex: "#e9dab1", nameKey: "c_fresh_pasta", code: "1775" },
      { id: "spring_air_8087", hex: "#d6cba4", nameKey: "c_spring_air", code: "8087" },
      { id: "velvet_10246", hex: "#d6bd90", nameKey: "c_velvet", code: "10246" },
      { id: "antique_yellow_1392", hex: "#d4b58b", nameKey: "c_antique_yellow", code: "1392" },
      { id: "masala_10428", hex: "#c79f6e", nameKey: "c_masala", code: "10428" },
      { id: "refined_yellow_12082", hex: "#c2b08d", nameKey: "c_refined_yellow", code: "12082" },
      { id: "mexico_0288", hex: "#b99e6b", nameKey: "c_mexico", code: "0288" },
      { id: "april_green_8109", hex: "#a4a178", nameKey: "c_april_green", code: "8109" },
    ],
  },
  {
    id: "peach",
    nameKey: "family_peach",
    colors: [
      { id: "bella_2489", hex: "#d9926d", nameKey: "c_bella", code: "2489" },
      { id: "desert_pink_12120", hex: "#bf9f86", nameKey: "c_desert_pink", code: "12120" },
      { id: "savanna_sunset_20046", hex: "#af8a76", nameKey: "c_savanna_sunset", code: "20046" },
      { id: "lively_red_20143", hex: "#a87362", nameKey: "c_lively_red", code: "20143" },
      { id: "rusty_1259", hex: "#a47251", nameKey: "c_rusty", code: "1259" },
      { id: "welcoming_red_20167", hex: "#a06c5e", nameKey: "c_welcoming_red", code: "20167" },
      { id: "amber_red_20118", hex: "#9b6c5c", nameKey: "c_amber_red", code: "20118" },
      { id: "organic_red_20120", hex: "#987a6a", nameKey: "c_organic_red", code: "20120" },
      { id: "grounded_red_20144", hex: "#92695a", nameKey: "c_grounded_red", code: "20144" },
    ],
  },
  {
    id: "reds",
    nameKey: "family_reds",
    colors: [
      { id: "muted_coral_20217", hex: "#bb7d69", nameKey: "c_muted_coral", code: "20217" },
      { id: "statement_red_20207", hex: "#a6544a", nameKey: "c_statement_red", code: "20207" },
      { id: "heat_2994", hex: "#995f4d", nameKey: "c_heat", code: "2994" },
      { id: "whispering_red_2859", hex: "#985f56", nameKey: "c_whispering_red", code: "2859" },
      { id: "hibiscus_2731", hex: "#9c5353", nameKey: "c_hibiscus", code: "2731" },
      { id: "norwegian_wood_10981", hex: "#7f5c47", nameKey: "c_norwegian_wood", code: "10981" },
      { id: "sophisticated_red_2951", hex: "#7b5953", nameKey: "c_sophisticated_red", code: "2951" },
      { id: "red_maple_2727", hex: "#795956", nameKey: "c_red_maple", code: "2727" },
      { id: "bordeaux_2846", hex: "#755352", nameKey: "c_bordeaux", code: "2846" },
      { id: "kilim_2993", hex: "#714f44", nameKey: "c_kilim", code: "2993" },
    ],
  },
  {
    id: "blues",
    nameKey: "family_blues",
    colors: [
      { id: "svalbard_sea_5262", hex: "#d0dddc", nameKey: "c_svalbard_sea", code: "5262" },
      { id: "rain_sky_4627", hex: "#d3dbe0", nameKey: "c_rain_sky", code: "4627" },
      { id: "alladin_4468", hex: "#c1cdd4", nameKey: "c_alladin", code: "4468" },
      { id: "nordic_breeze_5452", hex: "#bbc6c8", nameKey: "c_nordic_breeze", code: "5452" },
      { id: "classic_blue_4062", hex: "#b8c0ca", nameKey: "c_classic_blue", code: "4062" },
      { id: "imagine_6383", hex: "#adc0b7", nameKey: "c_imagine", code: "6383" },
      { id: "teal_zen_4423", hex: "#a5bcc3", nameKey: "c_teal_zen", code: "4423" },
      { id: "gustavian_blue_4109", hex: "#9da9b2", nameKey: "c_gustavian_blue", code: "4109" },
      { id: "arctic_grey_5249", hex: "#919da0", nameKey: "c_arctic_grey", code: "5249" },
      { id: "natural_blue_5503", hex: "#88959a", nameKey: "c_natural_blue", code: "5503" },
      { id: "icy_blue_5044", hex: "#808d92", nameKey: "c_icy_blue", code: "5044" },
      { id: "serene_blue_5490", hex: "#798484", nameKey: "c_serene_blue", code: "5490" },
      { id: "evening_light_4618", hex: "#77838c", nameKey: "c_evening_light", code: "4618" },
      { id: "st_pauls_blue_5030", hex: "#697477", nameKey: "c_st_pauls_blue", code: "5030" },
      { id: "elegant_blue_4638", hex: "#667078", nameKey: "c_elegant_blue", code: "4638" },
      { id: "coastal_blue_5504", hex: "#6d7d83", nameKey: "c_coastal_blue", code: "5504" },
    ],
  },
  {
    id: "greens",
    nameKey: "family_greens",
    colors: [
      { id: "pistachio_7386", hex: "#c8cdaf", nameKey: "c_pistachio", code: "7386" },
      { id: "soft_mint_7555", hex: "#c9d0c5", nameKey: "c_soft_mint", code: "7555" },
      { id: "pale_linden_8281", hex: "#c6c6b6", nameKey: "c_pale_linden", code: "8281" },
      { id: "tender_green_6351", hex: "#b7c1bd", nameKey: "c_tender_green", code: "6351" },
      { id: "exhale_7637", hex: "#b7bdb3", nameKey: "c_exhale", code: "7637" },
      { id: "pale_green_8478", hex: "#babaa5", nameKey: "c_pale_green", code: "8478" },
      { id: "laurel_8302", hex: "#b0ae96", nameKey: "c_laurel", code: "8302" },
      { id: "subtle_green_7685", hex: "#abaf9b", nameKey: "c_subtle_green", code: "7685" },
      { id: "treasure_7628", hex: "#a3a798", nameKey: "c_treasure", code: "7628" },
      { id: "green_tea_8493", hex: "#9f9b7c", nameKey: "c_green_tea", code: "8493" },
      { id: "green_harmony_8252", hex: "#9e9b86", nameKey: "c_green_harmony", code: "8252" },
      { id: "soft_teal_6350", hex: "#9aa49e", nameKey: "c_soft_teal", code: "6350" },
      { id: "antique_green_7629", hex: "#8a8f81", nameKey: "c_antique_green", code: "7629" },
      { id: "green_leaf_8469", hex: "#8a8774", nameKey: "c_green_leaf", code: "8469" },
      { id: "evening_green_6352", hex: "#808985", nameKey: "c_evening_green", code: "6352" },
      { id: "mindful_green_7686", hex: "#7c877c", nameKey: "c_mindful_green", code: "7686" },
      { id: "northern_mystic_7613", hex: "#696d61", nameKey: "c_northern_mystic", code: "7613" },
      { id: "organic_green_8494", hex: "#646556", nameKey: "c_organic_green", code: "8494" },
      { id: "green_marble_8422", hex: "#68665c", nameKey: "c_green_marble", code: "8422" },
    ],
  },
  {
    id: "deep",
    nameKey: "family_deep",
    colors: [
      { id: "dark_teal_5454", hex: "#506364", nameKey: "c_dark_teal", code: "5454" },
      { id: "oslo_5180", hex: "#526064", nameKey: "c_oslo", code: "5180" },
      { id: "industrial_blue_5455", hex: "#4e616c", nameKey: "c_industrial_blue", code: "5455" },
      { id: "statement_blue_4863", hex: "#395068", nameKey: "c_statement_blue", code: "4863" },
    ],
  },
];

// Preset themes using real Jotun colors
const PRESET_THEMES: PresetTheme[] = [
  {
    id: "modern_neutral",
    nameKey: "theme_modern_neutral",
    colors: {
      left_wall: "#e0ddd2", // Timeless
      right_wall: "#e0ddd2",
      back_wall: "#f0efe9", // Classic White
      floor: "#ccc7bd",     // Sheer Grey
      ceiling: "#f0efe9",
    },
  },
  {
    id: "warm_classic",
    nameKey: "theme_warm_classic",
    colors: {
      left_wall: "#e5dac8", // Vanilla Latte
      right_wall: "#e5dac8",
      back_wall: "#e9dab1", // Fresh Pasta
      floor: "#cfc5b4",     // Sand
      ceiling: "#efede2",   // Egg White
    },
  },
  {
    id: "cool_serene",
    nameKey: "theme_cool_serene",
    colors: {
      left_wall: "#d3dbe0", // Rain Sky
      right_wall: "#d3dbe0",
      back_wall: "#bbc6c8", // Nordic Breeze
      floor: "#697477",     // St. Paul's Blue
      ceiling: "#f0efe9",   // Classic White
    },
  },
  {
    id: "bold_elegant",
    nameKey: "theme_bold_elegant",
    colors: {
      left_wall: "#506364", // Dark Teal
      right_wall: "#506364",
      back_wall: "#395068", // Statement Blue
      floor: "#646556",     // Organic Green
      ceiling: "#ebe9e1",   // Reflection
    },
  },
  {
    id: "earthy_natural",
    nameKey: "theme_earthy_natural",
    colors: {
      left_wall: "#cac0af", // Soothing Beige
      right_wall: "#abaf9b", // Subtle Green
      back_wall: "#bf9f86", // Desert Pink
      floor: "#a3a798",     // Treasure
      ceiling: "#e1dcd1",   // Breeze
    },
  },
];

// Helpers
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#333333" : "#FFFFFF";
}

function findColorInfo(
  hex: string,
  t: (key: string) => string
): string {
  for (const family of COLOR_FAMILIES) {
    for (const color of family.colors) {
      if (color.hex.toLowerCase() === hex.toLowerCase()) {
        return `${t(color.nameKey)} (${color.code}) ${color.hex}`;
      }
    }
  }
  return hex;
}

function isValidHex(val: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(val);
}

// CSS clip-path polygons for photo overlay zones (percentages)
// Floor & ceiling excluded — stay natural
const ZONE_CLIPS: Partial<Record<ZoneId, string>> = {
  back_wall: "polygon(11% 20%, 88% 20%, 88% 80%, 11% 80%)",
  left_wall: "polygon(0% 7%, 11% 20%, 11% 80%, 0% 89%)",
  right_wall: "polygon(88% 20%, 100% 7%, 100% 89%, 88% 80%)",
};

// Interactive zone IDs (floor excluded)
const INTERACTIVE_ZONES = Object.keys(ZONE_CLIPS) as ZoneId[];

// Mini room polygons for theme preview (scaled to 120x90)
const MINI_POLYGONS: Record<ZoneId, string> = {
  ceiling: "15,9 105,9 84,30 36,30",
  back_wall: "36,30 84,30 84,64.5 36,64.5",
  left_wall: "3,3 36,30 36,64.5 3,84",
  right_wall: "84,30 117,3 117,84 84,64.5",
  floor: "36,64.5 84,64.5 117,84 3,84",
};

export default function ColorVisualizer() {
  const t = useTranslations("color_picker");
  const searchParams = useSearchParams();

  // Parse initial colors from URL params
  const getInitialColors = useCallback((): Record<ZoneId, string> => {
    const colors = { ...DEFAULT_COLORS };
    for (const [zone, param] of Object.entries(PARAM_KEYS)) {
      const val = searchParams.get(param);
      if (val && isValidHex(val)) {
        colors[zone as ZoneId] = `#${val.toUpperCase()}`;
      }
    }
    return colors;
  }, [searchParams]);

  const [zoneColors, setZoneColors] = useState<Record<ZoneId, string>>(getInitialColors);
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [activeFamily, setActiveFamily] = useState("whites");
  const [copied, setCopied] = useState(false);

  // Reset copied state after 2s
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleZoneClick = useCallback((zoneId: ZoneId) => {
    setActiveZone((prev) => (prev === zoneId ? null : zoneId));
  }, []);

  const handleColorSelect = useCallback(
    (hex: string) => {
      if (!activeZone) return;
      setZoneColors((prev) => ({ ...prev, [activeZone]: hex }));
    },
    [activeZone]
  );

  const handleThemeSelect = useCallback((theme: PresetTheme) => {
    setZoneColors({ ...theme.colors });
    setActiveZone(null);
  }, []);

  const handleReset = useCallback(() => {
    setZoneColors({ ...DEFAULT_COLORS });
    setActiveZone(null);
  }, []);

  const handleCopyLink = useCallback(() => {
    const params = new URLSearchParams();
    for (const [zone, param] of Object.entries(PARAM_KEYS)) {
      const hex = zoneColors[zone as ZoneId].replace("#", "");
      params.set(param, hex);
    }
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => setCopied(true));
  }, [zoneColors]);

  const buildWhatsAppUrl = useCallback(() => {
    const message = t("whatsapp_message", {
      leftWall: findColorInfo(zoneColors.left_wall, t),
      rightWall: findColorInfo(zoneColors.right_wall, t),
      backWall: findColorInfo(zoneColors.back_wall, t),
    });
    return `https://wa.me/9647737685000?text=${encodeURIComponent(message)}`;
  }, [zoneColors, t]);

  const currentFamily = COLOR_FAMILIES.find((f) => f.id === activeFamily)!;

  // Check if a theme matches current colors
  const activeThemeId = PRESET_THEMES.find((theme) =>
    (Object.keys(theme.colors) as ZoneId[]).every(
      (z) => theme.colors[z].toLowerCase() === zoneColors[z].toLowerCase()
    )
  )?.id;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Room Photo */}
      <div className="w-full lg:w-[60%]">
        <div className="rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="relative" style={{ aspectRatio: "1000/666" }}>
            {/* Base room photo */}
            <img
              src="/images/room-base.jpg"
              alt={t("title")}
              className="absolute inset-0 w-full h-full object-fill"
              draggable={false}
            />

            {/* Color overlay zones */}
            {INTERACTIVE_ZONES.map((zoneId) => (
              <div
                key={zoneId}
                className={cn(
                  "absolute inset-0 cursor-pointer transition-all duration-300",
                  activeZone === zoneId && "ring-2 ring-accent ring-inset"
                )}
                style={{
                  clipPath: ZONE_CLIPS[zoneId],
                  backgroundColor: zoneColors[zoneId],
                  mixBlendMode: "multiply" as React.CSSProperties["mixBlendMode"],
                  opacity: zoneColors[zoneId] === DEFAULT_COLORS[zoneId] ? 0 : 1,
                }}
                onClick={() => handleZoneClick(zoneId)}
                role="button"
                tabIndex={0}
                aria-label={t(ZONE_KEYS[zoneId])}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleZoneClick(zoneId);
                  }
                }}
              />
            ))}

            {/* Active zone highlight overlay */}
            {activeZone && ZONE_CLIPS[activeZone] && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: ZONE_CLIPS[activeZone],
                  boxShadow: "inset 0 0 0 3px #933928",
                }}
              />
            )}

            {/* Zone labels (walls + ceiling only, no floor) */}
            <div className="absolute inset-0 pointer-events-none hidden sm:block">
              {INTERACTIVE_ZONES.map((zoneId) => {
                const positions: Record<string, { top: string; left: string }> = {
                  back_wall: { top: "48%", left: "50%" },
                  left_wall: { top: "50%", left: "6%" },
                  right_wall: { top: "50%", left: "94%" },
                };
                const pos = positions[zoneId];
                if (!pos) return null;
                return (
                  <span
                    key={`label-${zoneId}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded bg-black/30 text-white backdrop-blur-sm"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    {t(ZONE_KEYS[zoneId])}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>


      {/* Color Panel */}
      <div className="w-full lg:w-[40%]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 lg:sticky lg:top-24 space-y-5">
          {/* Active zone indicator */}
          <div className="text-center pb-3 border-b border-gray-100">
            {activeZone ? (
              <p className="text-sm font-semibold text-primary">
                {t("active_zone", { zone: t(ZONE_KEYS[activeZone]) })}
              </p>
            ) : (
              <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                <Palette className="w-4 h-4" />
                {t("instruction")}
              </p>
            )}
          </div>

          {/* Color family tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COLOR_FAMILIES.map((family) => (
              <button
                key={family.id}
                onClick={() => setActiveFamily(family.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeFamily === family.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                )}
              >
                {t(family.nameKey)}
              </button>
            ))}
          </div>

          {/* Color swatches grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-x-2 gap-y-3 justify-items-center">
            {currentFamily.colors.map((color) => {
              const isSelected =
                activeZone !== null &&
                zoneColors[activeZone].toLowerCase() ===
                  color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.hex)}
                  disabled={!activeZone}
                  className={cn(
                    "flex flex-col items-center gap-1 group transition-all",
                    !activeZone && "opacity-50 cursor-not-allowed",
                  )}
                  title={t(color.nameKey)}
                  aria-label={t(color.nameKey)}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      "relative w-11 h-11 rounded-full border-2 transition-all shadow-sm",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 scale-110"
                        : "border-gray-200 group-hover:scale-105 group-hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        className="absolute inset-0 m-auto w-5 h-5"
                        style={{ color: getContrastColor(color.hex) }}
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono leading-tight",
                    isSelected ? "text-primary font-bold" : "text-text-secondary"
                  )}>
                    {color.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preset themes */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {t("themes_title")}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {PRESET_THEMES.map((theme) => {
                const isActive = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={cn(
                      "flex-shrink-0 rounded-xl border-2 p-2 transition-all",
                      isActive
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-primary/40"
                    )}
                  >
                    <svg
                      viewBox="0 0 120 87"
                      className="w-20 h-[58px] rounded-lg overflow-hidden"
                    >
                      <rect width="120" height="87" fill="#f5f5f5" />
                      {(Object.keys(MINI_POLYGONS) as ZoneId[]).map((z) => (
                        <polygon
                          key={z}
                          points={MINI_POLYGONS[z]}
                          fill={theme.colors[z]}
                          stroke="#aaa"
                          strokeWidth="0.5"
                        />
                      ))}
                    </svg>
                    <span className="text-xs font-medium mt-1.5 block text-center text-text-secondary">
                      {t(theme.nameKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 border border-gray-200 text-text-secondary py-2.5 px-6 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              {t("reset")}
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl transition-colors text-sm font-medium",
                copied
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-text-primary hover:bg-gray-200"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t("link_copied")}
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  {t("copy_link")}
                </>
              )}
            </button>

            {/* WhatsApp CTA */}
            <motion.a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("whatsapp_cta")}
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}
