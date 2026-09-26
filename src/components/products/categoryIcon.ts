import { createElement } from "react";
import {
  Bath,
  Grid3x3,
  Lightbulb,
  Gem,
  CookingPot,
  BedDouble,
  Trees,
  Ruler,
  HardHat,
  Package,
  type LucideIcon,
} from "lucide-react";

// Category names come from the internal app (Arabic, free text), so match on
// keywords rather than ids. Unknown categories fall back to a generic box.
const RULES: [RegExp, LucideIcon][] = [
  [/صحي|حمام|sanitary|bath/i, Bath],
  [/بورسلين|سيراميك|بلاط|porcelain|tile/i, Grid3x3],
  [/كهرب|انار|إنار|electric|light/i, Lightbulb],
  [/مرمر|رخام|marble/i, Gem],
  [/مطبخ|مطابخ|kitchen/i, CookingPot],
  [/نوم|bed/i, BedDouble],
  [/خارجي|outdoor|exterior/i, Trees],
  [/تصميم|تصاميم|هندس|design/i, Ruler],
  [/انشائ|إنشائ|نقل|construct/i, HardHat],
];

export function categoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Package;
  return RULES.find(([re]) => re.test(name))?.[1] ?? Package;
}

/** Renders the icon for a category name (stable component for render-time use). */
export function CategoryIcon({
  name,
  ...props
}: { name?: string | null } & Omit<React.ComponentProps<LucideIcon>, "name">) {
  return createElement(categoryIcon(name), props);
}
