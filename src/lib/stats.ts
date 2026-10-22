// Counters ("+500 منتج متوفر"). Pure — shared by the server loader (getStats in
// home/homeData.ts) and the client CountUp animation.

export interface Stat {
  numberText: string;
  label: string;
}

export interface ParsedStat {
  prefix: string;
  target: number;
  suffix: string;
  grouped: boolean;
}

/** "+1,200" → { prefix: "+", target: 1200, suffix: "", grouped: true }; no number → null. */
export function parseStat(text: string): ParsedStat | null {
  const m = text.match(/^([^\d]*)(\d[\d,]*)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], target: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3], grouped: m[2].includes(",") };
}

export function formatStat(p: ParsedStat, value: number): string {
  return `${p.prefix}${p.grouped ? value.toLocaleString("en-US") : value}${p.suffix}`;
}

/** Counters with no value (or zero) are hidden — never "+0". */
export function visibleStats<T extends Stat>(items: T[]): T[] {
  return items.filter((s) => (parseStat(s.numberText.trim())?.target ?? 0) > 0);
}
