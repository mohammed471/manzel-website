/**
 * The calendar day of a local Date as "YYYY-MM-DD".
 *
 * Never use toISOString() for this: it converts to UTC first, so in Iraq
 * (UTC+3) a local midnight becomes 21:00 of the previous day.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
