# T27 — phone check (2026-10-22, production build, local)

Widths 360 / 375 / 390 / 768 × pages `/ar`, `/ar/products`, `/ar/portfolio`, a project page, `/ar/calculator`, `/ar/booking`, `/en` (+ `/en/portfolio`, `/en/products`, `/en/calculator`, `/en/booking` for overflow).

| Check | Result |
|---|---|
| Horizontal scroll | 0 px everywhere — after fixing the open-books button (it was 18 px wider than the 360 screen in English) |
| Hero title clipped | No, at any width |
| Touch targets < 44 px in the first screen | Only the breadcrumb text links on the project page (inline links — WCAG 2.5.8 exception) |
| Calculator result bar vs. bottom nav | At the end of the page nothing is covered (bar sits above the nav; page has bottom padding) |

Screenshots: `<width>_<page>.png`. No "before" set: the pre-change build was not kept, and the site is not public yet.
