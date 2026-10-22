import { describe, it, expect } from "vitest";
import { parseStat, formatStat, visibleStats } from "@/lib/stats";

describe("parseStat", () => {
  it("keeps prefix and suffix around the number", () => {
    expect(parseStat("10+")).toEqual({ prefix: "", target: 10, suffix: "+", grouped: false });
    expect(parseStat("+500")).toEqual({ prefix: "+", target: 500, suffix: "", grouped: false });
  });

  it("reads grouped thousands", () => {
    expect(parseStat("+1,200")).toEqual({ prefix: "+", target: 1200, suffix: "", grouped: true });
    expect(formatStat(parseStat("+1,200")!, 1200)).toBe("+1,200");
    expect(formatStat(parseStat("+1,200")!, 37)).toBe("+37");
  });

  it("is null for text without a number", () => {
    expect(parseStat("")).toBeNull();
    expect(parseStat("كثير")).toBeNull();
  });
});

describe("visibleStats", () => {
  it("drops counters with no value", () => {
    const items = [
      { numberText: "604", label: "منتج متوفر" },
      { numberText: "", label: "مشروع منجز" },
      { numberText: "  ", label: "سنوات خبرة" },
    ];
    expect(visibleStats(items).map((s) => s.label)).toEqual(["منتج متوفر"]);
  });

  it("drops a zero count — never shows +0", () => {
    expect(visibleStats([{ numberText: "0", label: "x" }, { numberText: "+0", label: "y" }])).toEqual([]);
  });
});
