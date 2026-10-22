// The sample project shown in the "open-books contract" sections (home + portfolio):
// a two-floor house on a 250 m² plot, figures from its page in the internal app.
// Change them here only — both sections read this file.
export const SHOWCASE = {
  plotM2: 250,
  floors: 2,
  estimateIqd: 169_024_000,
  actualIqd: 171_553_000,
  months: 7,
};

// The app's public sample-house page (manzel_split core/sample_house SAMPLE_TOKEN).
// It moves to its own portal address later (docs/portal-todo.md).
export const PORTAL_DEMO_URL = `${process.env.NEXT_PUBLIC_API_URL}/c/3an1E_I9cNAwko5Rhayf6cTI5FAQ8VJozoZKkvnx8Lk`;

/** Actual vs estimate in %, one decimal: 169,024,000 → 171,553,000 = 1.5. */
export function diffPct(s: { estimateIqd: number; actualIqd: number }): number {
  return Math.round(((s.actualIqd - s.estimateIqd) / s.estimateIqd) * 1000) / 10;
}
