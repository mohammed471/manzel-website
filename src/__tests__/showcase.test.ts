import { describe, it, expect } from "vitest";
import { SHOWCASE, diffPct } from "@/data/showcase";

describe("open-books showcase", () => {
  it("carries the sample house's estimate and actual cost", () => {
    expect(SHOWCASE.estimateIqd).toBe(169_024_000);
    expect(SHOWCASE.actualIqd).toBe(171_553_000);
    expect(SHOWCASE.months).toBe(7);
  });

  it("gives the difference to one decimal", () => {
    expect(diffPct(SHOWCASE)).toBe(1.5);
    expect(diffPct({ estimateIqd: 100, actualIqd: 95 })).toBe(-5);
  });
});
