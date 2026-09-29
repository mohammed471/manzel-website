// The booking calendar runs in the visitor's browser — in Iraq, UTC+3. A local
// midnight passed through toISOString() lands on the previous UTC day, so every
// booking was stored one day early. Pin the zone so the test sees what they see.
process.env.TZ = "Asia/Baghdad";

import { describe, expect, it } from "vitest";
import { toDateKey } from "@/lib/dateKey";

describe("toDateKey", () => {
  it("keeps the day the visitor clicked, not the UTC day", () => {
    expect(toDateKey(new Date(2026, 9, 5))).toBe("2026-10-05");
  });

  it("pads month and day and survives month/year boundaries", () => {
    expect(toDateKey(new Date(2026, 0, 1))).toBe("2026-01-01");
    expect(toDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});
