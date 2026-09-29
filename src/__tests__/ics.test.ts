// The visitor's phone is on Baghdad time. The appointment is 10:00 Baghdad
// = 07:00 UTC — whatever zone the browser happens to be in.
process.env.TZ = "Asia/Baghdad";

import { describe, expect, it } from "vitest";
import { generateICS } from "@/lib/ics";

function field(ics: string, name: string): string | undefined {
  return ics.split(/\r?\n/).find((l) => l.startsWith(`${name}:`))?.slice(name.length + 1);
}

describe("generateICS", () => {
  const ics = generateICS({
    title: "t", date: "2026-10-05", time: "10:00", location: "l", description: "d",
  });

  it("puts a 10:00 Baghdad appointment at 07:00 UTC on the same day", () => {
    expect(field(ics, "DTSTART")).toBe("20261005T070000Z");
    expect(field(ics, "DTEND")).toBe("20261005T080000Z");
  });

  it("does not depend on the browser's own zone", () => {
    process.env.TZ = "UTC";
    const utc = generateICS({
      title: "t", date: "2026-10-05", time: "10:00", location: "l", description: "d",
    });
    process.env.TZ = "Asia/Baghdad";
    expect(field(utc, "DTSTART")).toBe("20261005T070000Z");
  });
});
