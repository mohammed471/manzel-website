# T29 — final check (2026-10-22)

- `npm run build` ✓ · `npm run lint` ✓ (0 problems) · `npx tsc --noEmit` ✓ · `npm test` ✓ (156 passed, 1 skipped on purpose — the calculator calibration case waiting for the owner's prices).
- Internal links: 80 links crawled from `/ar` and `/en` (header, footer, pages) — 0 broken. Sitemap: 1236 URLs — all respond.

## Forbidden strings in the built HTML (`.next/server/app/**/*.html`, 40 pages)

| Text | Found | Where it comes from |
|---|---|---|
| `0 مشروع`, `+0`, `0+` | 0 | — |
| `أحمد محمد`, `سارة علي` | 0 | — (testimonials need `verified`) |
| `1_View01` | 0 | — (no longer in the public API) |
| `بأعلى مواد الجودة` | 0 | — |
| `اسم المؤسس`, `اسم المصمم`, `اسم المهندس` | 1 page (`/ar/about`) | **The app's database** («صفحة من نحن»). Delete the three rows in the app. |
| `أستقبال` | 6 pages | **The app's database** — project `livingroom-white` is named «غرفة أستقبال بيضاء». Rename it in the app. |
| `شريـــكك` | 19 pages | **The app's database** («النصوص والعناوين» → «العنوان الكبير»). Already hidden from Google/screen readers (`aria-hidden` + plain `sr-only` H1); still in the page's message data until fixed in the app. |
