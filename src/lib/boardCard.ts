import sharp from "sharp";

// The picture a shared «لوحتي» link shows in WhatsApp / Facebook: the first saved
// photos on the cream card, beside the Manzel logo on a green panel. No text at
// all — nothing to shape or translate, and no font needed on the server.

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
export const CARD_MAX_PHOTOS = 5;

// `surface` and `primary` from globals.css — an image can't read the theme
const CREAM = "#F7F2F1";
const GREEN = "#153C38";

const PANEL = 300;
const PAD = 24;
const GAP = 16;
const RADIUS = 28;
const AREA = { left: PAD, top: PAD, width: CARD_WIDTH - PANEL - 2 * PAD, height: CARD_HEIGHT - 2 * PAD };

export interface CardSlot {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CardPhoto {
  data: Buffer;
  /** Fit the whole picture on white instead of cropping it (product shots) */
  contain?: boolean;
}

/** Where each photo goes: the first one tall on the left, the rest in one or two rows beside it. */
export function cardSlots(count: number): CardSlot[] {
  const photos = Math.min(count, CARD_MAX_PHOTOS);
  if (photos <= 0) return [];
  if (photos === 1) return [AREA];

  const half = Math.floor((AREA.width - GAP) / 2);
  const beside = photos - 1;
  const rows = beside === 1 ? [1] : [Math.ceil(beside / 2), Math.floor(beside / 2)];
  const rowHeight = Math.floor((AREA.height - GAP * (rows.length - 1)) / rows.length);
  const left = AREA.left + half + GAP;
  const width = AREA.width - half - GAP;

  const slots: CardSlot[] = [{ left: AREA.left, top: AREA.top, width: half, height: AREA.height }];
  rows.forEach((columns, row) => {
    const columnWidth = Math.floor((width - GAP * (columns - 1)) / columns);
    for (let column = 0; column < columns; column++) {
      slots.push({
        left: left + column * (columnWidth + GAP),
        top: AREA.top + row * (rowHeight + GAP),
        width: columnWidth,
        height: rowHeight,
      });
    }
  });
  return slots;
}

async function tile(photo: CardPhoto, { width, height }: CardSlot): Promise<Buffer> {
  const fitted = await sharp(photo.data, { failOn: "none" })
    .rotate()
    .resize(width, height, photo.contain ? { fit: "contain", background: "#fff" } : { fit: "cover" })
    .flatten({ background: "#fff" })
    .png()
    .toBuffer();
  const corners = Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${RADIUS}"/></svg>`,
  );
  return sharp(fitted).ensureAlpha().composite([{ input: corners, blend: "dest-in" }]).png().toBuffer();
}

/** JPEG card of up to five photos; a file sharp can't read is skipped, none at all gives the logo alone. */
export async function renderBoardCard(photos: CardPhoto[], logo: Buffer): Promise<Buffer> {
  const readable = (
    await Promise.all(
      photos.map((photo) =>
        sharp(photo.data)
          .metadata()
          .then(
            () => photo,
            () => null,
          ),
      ),
    )
  ).filter((photo): photo is CardPhoto => photo !== null);
  const slots = cardSlots(readable.length);
  const tiles = await Promise.all(slots.map((slot, i) => tile(readable[i], slot)));

  const panel = slots.length ? PANEL : CARD_WIDTH;
  const mark = await sharp(logo)
    .resize({ width: slots.length ? 200 : 400 })
    .toBuffer({ resolveWithObject: true });

  return sharp({ create: { width: CARD_WIDTH, height: CARD_HEIGHT, channels: 3, background: CREAM } })
    .composite([
      {
        input: { create: { width: panel, height: CARD_HEIGHT, channels: 3, background: GREEN } },
        left: CARD_WIDTH - panel,
        top: 0,
      },
      {
        input: mark.data,
        left: CARD_WIDTH - panel + Math.round((panel - mark.info.width) / 2),
        top: Math.round((CARD_HEIGHT - mark.info.height) / 2),
      },
      ...tiles.map((input, i) => ({ input, left: slots[i].left, top: slots[i].top })),
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
