# Proposals for the internal app (manzel_split) — from the pre-launch fixes

The website already reads every field below when the app sends it; nothing breaks while it is missing.
Each change follows the app's own CLAUDE.md (new migration name, full test suite, changelog).

| # | Where in the app | Change | Website side (already done) | Task |
|---|---|---|---|---|
| 1 | «الموقع» → آراء العملاء | Add a «موثّق» checkbox (`verified`, default off) and a project picker (`project` = project slug) to each testimonial | Only `verified` testimonials show; `project` adds a «شاهد المشروع» link | T04 |
| 2 | «الموقع» → النصوص والعناوين (catalogue `core/db/website_texts_catalog.py`) | Add `site.hero_video` (video path/URL) next to the hero image | `HeroVideo` reads `site.hero_video` | T08 |
| 3 | `/admin/calculator-pricing` (`core/db/calculator_pricing.py`) | Add `kitchen` (IQD per level that the turnkey/finishing rate includes for the kitchen) and `based_on_projects` (number of executed projects the prices come from) | «بدون مطبخ» takes `kitchen[level]` off; «مبنية على كلفة {N} مشروع» shows when > 0 | T14 |
| 4 | Catalogue `calculator.includes_turnkey` | The kitchen line moved to its own keys (`includes_kitchen`, `includes_bathrooms`, `excludes_kitchen`); update the catalogue default so a saved override doesn't bring «المطبخ والحمامات» back into the list | Website files already split | T14 |
| 5 | Products (`/api/public/products`) | Add a `hidden` flag (admin checkbox) and send it in the public API — or simply leave hidden products out of the response | `hidden: true/1` products are left out of the list and their page is a 404 | T17 |
| 6 | Products | Add an Arabic display name field (`name_ar`). Today the site guesses it from the first line of `details` when the name is a supplier code — a real field would be exact | `productTitle()` in `src/lib/catalog.ts` | T17 |
| 7 | Projects | `materials: productId[]` on each portfolio project («المواد المستخدمة من معرضنا»), sent in `/website/portfolio` | Not built yet (optional, after launch) | T19 |
