import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { CARD_HEIGHT, CARD_WIDTH, cardSlots, renderBoardCard } from "@/lib/boardCard";

const logo = fs.readFileSync(path.join(process.cwd(), "public/images/logo-light.png"));

const solid = (background: string) =>
  sharp({ create: { width: 320, height: 240, channels: 3, background } }).jpeg().toBuffer();

async function pixel(card: Buffer, left: number, top: number): Promise<number[]> {
  const data = await sharp(card).extract({ left, top, width: 1, height: 1 }).raw().toBuffer();
  return [...data];
}

describe("cardSlots (where each photo sits on the share card)", () => {
  it.each([1, 2, 3, 4, 5])("places %i photos inside the card without overlap", (count) => {
    const slots = cardSlots(count);
    expect(slots).toHaveLength(count);
    for (const slot of slots) {
      expect(Object.values(slot).every(Number.isInteger)).toBe(true);
      expect(slot.left).toBeGreaterThanOrEqual(0);
      expect(slot.top).toBeGreaterThanOrEqual(0);
      expect(slot.left + slot.width).toBeLessThanOrEqual(CARD_WIDTH);
      expect(slot.top + slot.height).toBeLessThanOrEqual(CARD_HEIGHT);
      expect(Math.min(slot.width, slot.height)).toBeGreaterThanOrEqual(150);
    }
    for (const [i, a] of slots.entries()) {
      for (const b of slots.slice(i + 1)) {
        const apart =
          a.left + a.width <= b.left ||
          b.left + b.width <= a.left ||
          a.top + a.height <= b.top ||
          b.top + b.height <= a.top;
        expect(apart, `${JSON.stringify(a)} overlaps ${JSON.stringify(b)}`).toBe(true);
      }
    }
  });

  it("gives the first saved photo the biggest slot", () => {
    for (const count of [2, 3, 4, 5]) {
      const [first, ...rest] = cardSlots(count).map((s) => s.width * s.height);
      expect(Math.max(...rest)).toBeLessThanOrEqual(first);
    }
  });

  it("shows no more than five photos, and none for an empty board", () => {
    expect(cardSlots(9)).toHaveLength(5);
    expect(cardSlots(0)).toEqual([]);
  });
});

describe("renderBoardCard", () => {
  it("renders the 1200×630 JPEG link previews expect, under 300 KB", async () => {
    const card = await renderBoardCard(
      [{ data: await solid("#aa3322") }, { data: await solid("#2255aa"), contain: true }, { data: await solid("#33aa55") }],
      logo,
    );
    const { format, width, height } = await sharp(card).metadata();
    expect([format, width, height]).toEqual(["jpeg", 1200, 630]);
    expect(card.length).toBeLessThan(300 * 1024);
  });

  it("draws each photo in its slot, with rounded corners", async () => {
    const card = await renderBoardCard([{ data: await solid("#ff0000") }, { data: await solid("#0000ff") }], logo);
    const [first, second] = cardSlots(2);
    const centre = (s: typeof first) => [s.left + Math.floor(s.width / 2), s.top + Math.floor(s.height / 2)] as const;

    const [r1, g1, b1] = await pixel(card, ...centre(first));
    expect(r1).toBeGreaterThan(200);
    expect(Math.max(g1, b1)).toBeLessThan(60);

    const [r2, g2, b2] = await pixel(card, ...centre(second));
    expect(b2).toBeGreaterThan(200);
    expect(Math.max(r2, g2)).toBeLessThan(60);

    // The very corner of a slot is the cream card, not the photo
    const [rc, gc, bc] = await pixel(card, first.left + 1, first.top + 1);
    expect(Math.min(rc, gc, bc)).toBeGreaterThan(200);
  });

  it("still renders a branded card for a board with no photos", async () => {
    const card = await renderBoardCard([], logo);
    const { format, width, height } = await sharp(card).metadata();
    expect([format, width, height]).toEqual(["jpeg", 1200, 630]);
    // Brand green (#153C38) fills it, edge to edge
    const [r, g, b] = await pixel(card, 20, 20);
    expect([r, g, b].every((v, i) => Math.abs(v - [0x15, 0x3c, 0x38][i]) < 12)).toBe(true);
  });

  it("skips a file it cannot decode instead of failing the whole card", async () => {
    const card = await renderBoardCard([{ data: Buffer.from("not an image") }, { data: await solid("#00ff00") }], logo);
    const [only] = cardSlots(1);
    const [r, g, b] = await pixel(card, only.left + Math.floor(only.width / 2), only.top + Math.floor(only.height / 2));
    expect(g).toBeGreaterThan(200);
    expect(Math.max(r, b)).toBeLessThan(60);
  });
});
