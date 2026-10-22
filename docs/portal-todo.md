# Client portal — changes for the internal app (T26)

The client portal («صفحة المشروع») lives in the internal app (`manzel_split`, served from `manzel.onrender.com/c/<token>`), not in this repository. Nothing here was changed; these are the requested changes, to be made there under that repo's own rules.

1. **Own address:** serve the portal from `portal.manzel360.com` (Render custom domain on the app + DNS CNAME). Then update `PORTAL_DEMO_URL` in `src/data/showcase.ts` (the website's «شاهد مشروعاً كما يراه زبوننا» button).
2. **A separate demo copy, clearly marked «مشروع نموذجي».** The sample page linked from the website currently has the footer «هذه الصفحة خاصة بكم — لا تشاركوا رابطها», which contradicts publishing the link. Give the sample its own flag/template: a «مشروع نموذجي» banner, no private-page footer, no client name.
3. **Photos per month** in «سير العمل» (upload several images per month entry; show them as a small gallery).
4. **Graphic summary at the top:** estimate vs actual (two bars, the same idea as the website's open-books section) and percentage complete.
5. **Keep `noindex`** (`<meta name="robots" content="noindex">` + `X-Robots-Tag`) on every real client page; the demo page may be indexable or not — owner's choice.
