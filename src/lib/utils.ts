export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** "محمد علي" → "مع": first letter of the first two words, for avatars without a photo. */
export function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w.charAt(0)).join("");
}

/** "شريـــكك" → "شريكك": drops tatweel (U+0640) used to stretch a word; keeps "بـ«…»". */
export function stripTatweel(text: string): string {
  return text.replace(/(?<=\p{L})\u0640+(?=\p{L})/gu, "");
}
