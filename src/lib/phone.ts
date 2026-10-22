/**
 * Iraqi mobile number in any common form → "+9647XXXXXXXXX", or null.
 * Accepts 07XXXXXXXXX, +9647…, 9647…, 009647…, with spaces/dashes and Arabic-Indic digits.
 */
export function normalizeIraqiPhone(raw: string): string | null {
  const digits = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\s\-().]/g, "")
    .replace(/^(\+|00)/, "");
  const m = digits.match(/^(?:964|0)(7\d{9})$/);
  return m ? `+964${m[1]}` : null;
}
