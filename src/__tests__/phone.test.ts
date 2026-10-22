import { describe, it, expect } from "vitest";
import { normalizeIraqiPhone } from "@/lib/phone";

describe("normalizeIraqiPhone", () => {
  it("accepts the local and international mobile forms", () => {
    for (const raw of ["07701234567", "+9647701234567", "9647701234567", "009647701234567", "0770 123 4567", "+964-770-123-4567"]) {
      expect(normalizeIraqiPhone(raw)).toBe("+9647701234567");
    }
  });

  it("reads Arabic-Indic digits", () => {
    expect(normalizeIraqiPhone("٠٧٧٠١٢٣٤٥٦٧")).toBe("+9647701234567");
  });

  it("rejects wrong lengths and non-mobile numbers", () => {
    expect(normalizeIraqiPhone("0770123456")).toBeNull();
    expect(normalizeIraqiPhone("077012345678")).toBeNull();
    expect(normalizeIraqiPhone("0217701234")).toBeNull();
    expect(normalizeIraqiPhone("")).toBeNull();
  });
});
