# منزل — Manzel website

Public bilingual website (Arabic RTL at `/ar`, English LTR at `/en`) of Manzel, an
engineering design, construction, finishing and building-materials company in Kirkuk, Iraq.

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · next-intl. Products, portfolio
projects, texts and lists come from Manzel's internal app (Flask API); when it can't be
reached the pages still render and empty sections hide themselves.

**Architecture, conventions and pitfalls: see [`CLAUDE.md`](CLAUDE.md).** Owner guides are in
[`docs/`](docs/) (for example `docs/how-to-add-photos.md`).

## Commands

```bash
npm ci           # install exactly what package-lock.json pins
npm run dev      # dev server on http://localhost:3000
npm run build    # production build — must pass with 0 errors
npm run start    # serve the production build
npm run lint     # ESLint
npm test         # unit tests (vitest)
```

## Environment variables

Set them in `.env.local` for local work (git-ignored) and in the hosting dashboard for
production. Never commit values.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the internal app's API (products, portfolio, texts) |
| `REVALIDATE_SECRET` | Shared key the app's «انشر الآن» sends to `POST /api/revalidate` |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_FB_PIXEL_ID` | Analytics (optional) |
| `NEXT_PUBLIC_SHOW_PRICES` | `true` shows product prices (off by default) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` on staging: robots.txt closed, every page noindex |

## Deployment

Hosted on Render; pushing `master` deploys. See `docs/pre-launch-map.md`.
