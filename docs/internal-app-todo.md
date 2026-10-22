# Proposals for the internal app (manzel_split) — from the pre-launch fixes

The website already reads every field below when the app sends it; nothing breaks while it is missing.
Each change follows the app's own CLAUDE.md (new migration name, full test suite, changelog).

| # | Where in the app | Change | Website side (already done) | Task |
|---|---|---|---|---|
| 1 | «الموقع» → آراء العملاء | Add a «موثّق» checkbox (`verified`, default off) and a project picker (`project` = project slug) to each testimonial | Only `verified` testimonials show; `project` adds a «شاهد المشروع» link | T04 |
| 2 | «الموقع» → النصوص والعناوين (catalogue `core/db/website_texts_catalog.py`) | Add `site.hero_video` (video path/URL) next to the hero image | `HeroVideo` reads `site.hero_video` | T08 |
