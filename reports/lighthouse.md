# T28 — Lighthouse, mobile (2026-10-22)

`npx lighthouse@12` (default simulated mobile throttling) against the production build served locally (`next start`), data from the live API.

| Page | Performance | Accessibility | Best practices | SEO | LCP |
|---|---|---|---|---|---|
| `/ar` | 75 | 100 | 100 | 92* | 6.4 s |
| `/ar/products` | 74 | 100 | 100 | 92* | 6.8 s |
| `/ar/portfolio/interior-design/apartment-120m2` | 75 | 96** | 100 | 92* | 7.8 s |
| `/ar/calculator` | 78 | 100 | 100 | 92* | 6.1 s |

Targets: performance ≥ 85, accessibility ≥ 95, SEO ≥ 95.

\* **SEO 92 is a localhost artifact.** The only failing audit is `canonical`: the page was served from `localhost:3100` while its canonical correctly points to `https://www.manzel360.com/…`. On the real domain this audit passes (→ 100).

\** **Accessibility 96 is an animation artifact.** The two flagged spans have `#7d8187` — exactly the text colour `#5F666D` at 80 % opacity, i.e. captured mid scroll-reveal. Finished, the colour is 5.4:1 on the cream surface (AA).

**Performance is below the 85 target.** Simulated throttling over-weights JS (CLAUDE.md notes 76–87 for Sept 2026, and recommends `--throttling-method=devtools` as well). These changes didn't add client JS to the home page — they removed the scroll-scrub section and its frames (≈1.4–1.9 MB) — but LCP on a throttled phone is still 6+ s; the home LCP element is the header logo, not content. Worth a separate performance pass after launch content is in; not changed here.
