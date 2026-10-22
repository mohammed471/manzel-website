import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  SCRUB_FRAME_COUNT,
  SCRUB_FRAME_SIZES,
  SCRUB_POSTER_URL,
  scrubFrameSize,
  frameForProgress,
  frameLoadOrder,
  nearestLoadedFrame,
  scrubFrameUrl,
  scrubMode,
} from "@/lib/scrubFrames";

const publicFile = (url: string) => path.join(process.cwd(), "public", url);

describe("frameForProgress (scroll position → frame index)", () => {
  it("maps the start and end of the section to the first and last frames", () => {
    expect(frameForProgress(0, 59)).toBe(0);
    expect(frameForProgress(1, 59)).toBe(58);
  });

  it("maps the middle of the section to the middle frame", () => {
    expect(frameForProgress(0.5, 59)).toBe(29);
  });

  it("clamps overscroll and bad values instead of returning a missing frame", () => {
    expect(frameForProgress(-0.2, 59)).toBe(0);
    expect(frameForProgress(1.3, 59)).toBe(58);
    expect(frameForProgress(Number.NaN, 59)).toBe(0);
  });
});

describe("frameLoadOrder", () => {
  it("fetches a coarse pass first so scrubbing works before every frame arrives", () => {
    expect(frameLoadOrder(59, 8).slice(0, 9)).toEqual([0, 8, 16, 24, 32, 40, 48, 56, 58]);
  });

  it("lists every frame exactly once", () => {
    const order = frameLoadOrder(59, 8);
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 59 }, (_, i) => i));
  });
});

describe("nearestLoadedFrame", () => {
  it("returns the target when it has loaded", () => {
    const loaded = [true, true, true];
    expect(nearestLoadedFrame(1, loaded)).toBe(1);
  });

  it("falls back to the closest loaded frame while the target is still downloading", () => {
    const loaded = [true, false, false, false, false, false, false, false, true];
    expect(nearestLoadedFrame(6, loaded)).toBe(8);
    expect(nearestLoadedFrame(3, loaded)).toBe(0);
  });

  it("returns -1 when nothing has loaded, so the poster stays visible", () => {
    expect(nearestLoadedFrame(4, [false, false, false])).toBe(-1);
  });
});

describe("scrubMode (which experience each device gets)", () => {
  it("waits for the client before choosing, so the server HTML is the same for everyone", () => {
    expect(scrubMode(null)).toBe("pending");
  });

  it("scrubs frames on desktop too, even a low-memory one", () => {
    expect(scrubMode({ kind: "desktop", isTouch: false, constrained: false })).toBe("frames");
    expect(scrubMode({ kind: "desktop", isTouch: true, constrained: true })).toBe("frames");
  });

  // The 960px desktop video and 640px phone frames both looked blurry
  it("gives desktop the full-size 1440 frames and phones/tablets 1080", () => {
    expect(scrubFrameSize({ kind: "desktop", isTouch: false, constrained: false })).toBe(1440);
    expect(scrubFrameSize({ kind: "ios", isTouch: true, constrained: false })).toBe(1080);
    expect(scrubFrameSize({ kind: "android", isTouch: true, constrained: false })).toBe(1080);
    expect(scrubFrameSize({ kind: "mobile", isTouch: true, constrained: false })).toBe(1080);
  });

  it("scrubs image frames on phones and tablets instead of seeking a video", () => {
    expect(scrubMode({ kind: "ios", isTouch: true, constrained: false })).toBe("frames");
    expect(scrubMode({ kind: "android", isTouch: true, constrained: false })).toBe("frames");
    expect(scrubMode({ kind: "mobile", isTouch: true, constrained: false })).toBe("frames");
  });

  it("gives Save-Data / low-end phones the poster only", () => {
    expect(scrubMode({ kind: "android", isTouch: true, constrained: true })).toBe("poster");
  });
});

describe("scrub assets in public/", () => {
  it.each(SCRUB_FRAME_SIZES)("ships exactly SCRUB_FRAME_COUNT %i frames at the URLs the component requests", (size) => {
    for (let i = 0; i < SCRUB_FRAME_COUNT; i++) {
      expect(fs.existsSync(publicFile(scrubFrameUrl(i, size))), scrubFrameUrl(i, size)).toBe(true);
    }
    const dir = path.dirname(publicFile(scrubFrameUrl(0, size)));
    expect(fs.readdirSync(dir).filter((f) => f.endsWith(".webp"))).toHaveLength(SCRUB_FRAME_COUNT);
  });

  // Blurry frames were the bug; every frame must match the canvas size it is drawn at
  it.each(SCRUB_FRAME_SIZES)("ships every %i frame at exactly that size", async (size) => {
    for (let i = 0; i < SCRUB_FRAME_COUNT; i++) {
      const { width, height } = await sharp(publicFile(scrubFrameUrl(i, size))).metadata();
      expect([width, height], scrubFrameUrl(i, size)).toEqual([size, size]);
    }
  });

  // Phones: 1.5 MB (the site's video budget). Desktop: 2 MB — still half a 1440 all-intra video.
  it.each([
    [1080, 1.5],
    [1440, 2],
  ] as const)("keeps the %i frame set within %s MB", (size, mb) => {
    let total = 0;
    for (let i = 0; i < SCRUB_FRAME_COUNT; i++) total += fs.statSync(publicFile(scrubFrameUrl(i, size))).size;
    expect(total).toBeLessThanOrEqual(mb * 1024 * 1024);
  });

  it("no longer ships the desktop scrub video (desktop scrubs frames)", () => {
    expect(fs.existsSync(publicFile("/furniture-scrub.mp4"))).toBe(false);
  });

  // The reported bug: the fallback image was the video's first frame — plain white on a
  // white section, so phones that couldn't play the video showed an empty box.
  it("uses a poster that shows the finished room, not a blank white frame", async () => {
    const { channels } = await sharp(publicFile(SCRUB_POSTER_URL)).stats();
    expect(channels[0].min).toBeLessThan(100);
  });

  it("starts the frame sequence on furniture, not on the blank opening frames", async () => {
    const { channels } = await sharp(publicFile(scrubFrameUrl(0, 1080))).stats();
    expect(channels[0].min).toBeLessThan(100);
  });
});
