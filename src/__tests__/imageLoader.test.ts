import { describe, it, expect } from "vitest";
import { isR2Image, loaderFor, r2Loader, r2ThumbUrl } from "@/lib/imageLoader";

const R2 = "https://img.manzel360.com/products/03314d5a76064c2ba7387e3a3df431e2";
const load = (src: string, width: number) => r2Loader({ src, width, quality: 75 });

describe("r2Loader (R2 images straight from Cloudflare, not through /_next/image)", () => {
  it("serves the 640px thumb for grid and card sizes", () => {
    expect(load(`${R2}.jpg`, 384)).toBe(`${R2}.thumb.webp`);
    expect(load(`${R2}.jpg`, 640)).toBe(`${R2}.thumb.webp`);
  });

  it("serves the full image for large views", () => {
    expect(load(`${R2}.jpg`, 828)).toBe(`${R2}.jpg`);
    expect(load(`${R2}.jpg`, 1920)).toBe(`${R2}.jpg`);
  });

  it("derives the thumb for every extension the app uploads", () => {
    for (const ext of ["jpg", "jpeg", "png", "webp", "gif", "JPG"]) {
      expect(r2ThumbUrl(`${R2}.${ext}`), ext).toBe(`${R2}.thumb.webp`);
    }
  });

  it("never derives a thumb of a thumb, or of a file with no image extension", () => {
    expect(r2ThumbUrl(`${R2}.thumb.webp`)).toBe(`${R2}.thumb.webp`);
    expect(r2ThumbUrl(`${R2}.pdf`)).toBe(`${R2}.pdf`);
  });
});

describe("loaderFor", () => {
  it("uses the R2 loader only for img.manzel360.com", () => {
    expect(loaderFor(`${R2}.jpg`)).toBe(r2Loader);
    expect(isR2Image(`${R2}.jpg`)).toBe(true);
  });

  it("leaves local, ImgBB and API-server images on the built-in optimizer", () => {
    expect(loaderFor("/images/hero-poster.jpg")).toBeUndefined();
    expect(loaderFor("https://i.ibb.co/abc/photo.jpg")).toBeUndefined();
    expect(loaderFor("https://manzel.onrender.com/api/public/products/images/a.jpg")).toBeUndefined();
    // A look-alike host must not match
    expect(loaderFor("https://img.manzel360.com.evil.test/a.jpg")).toBeUndefined();
    expect(loaderFor({ src: "/x.png", width: 1, height: 1 })).toBeUndefined();
  });
});
