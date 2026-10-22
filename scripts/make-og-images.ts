// T20 — share images (og:image, 1200×630) drawn once and committed to public/:
// og-default.jpg, og-calculator.jpg, og-booking.jpg. Run: node scripts/make-og-images.ts
// Text is drawn here with sharp (Pango shapes Arabic correctly), not at request time —
// the request-time renderer doesn't join Arabic letters. Rerun after changing the texts.
import fs from "node:fs";
import sharp from "sharp";

const ar = JSON.parse(fs.readFileSync("src/messages/ar.json", "utf8"));
const W = 1200;
const H = 630;
const GREEN = "#153C38";
const CREAM = "#F1E9E8";
const FONT_DIR = "src/fonts/thmanyah";

const text = (s: string, font: string, color: string, file: string) =>
  sharp({
    text: {
      text: `<span foreground="${color}">${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`,
      font, // Pango description — the family must be the font's real name
      fontfile: `${FONT_DIR}/${file}`,
      rgba: true,
      width: W - 160,
      align: "centre",
      dpi: 72,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });

async function card(out: string, title: string, line: string) {
  const logo = await sharp("public/images/logo-light.png").resize({ height: 120 }).png().toBuffer({ resolveWithObject: true });
  const t = await text(title, "Thmanyah Serif Display Bold 84", CREAM, "thmanyahserifdisplay-Bold.woff2");
  const l = await text(line, "Thmanyah Serif Text Medium 38", "#C9D6D3", "thmanyahseriftext-Medium.woff2");
  const top = Math.round((H - (logo.info.height + 60 + t.info.height + 28 + l.info.height)) / 2);
  await sharp({ create: { width: W, height: H, channels: 3, background: GREEN } })
    .composite([
      { input: logo.data, top, left: Math.round((W - logo.info.width) / 2) },
      { input: t.data, top: top + logo.info.height + 60, left: Math.round((W - t.info.width) / 2) },
      { input: l.data, top: top + logo.info.height + 60 + t.info.height + 28, left: Math.round((W - l.info.width) / 2) },
    ])
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(out);
  console.log(out, (fs.statSync(out).size / 1024).toFixed(0), "KB");
}

await card("public/og-default.jpg", ar.home.hero_subtitle, ar.home.hero_badge);
await card("public/og-calculator.jpg", ar.home.hero_cta_calculator, ar.metadata.calculator_description);
await card("public/og-booking.jpg", ar.home.hero_cta_booking, ar.home.hero_badge);
