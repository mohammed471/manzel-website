import { describe, it, expect, vi, afterEach } from "vitest";
import { initials } from "@/lib/utils";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("محمد علي")).toBe("مع");
    expect(initials("  Sara  Ali Hassan ")).toBe("SA");
    expect(initials("فاطمة")).toBe("ف");
  });

  it("is empty for an empty name", () => {
    expect(initials("")).toBe("");
    expect(initials("   ")).toBe("");
  });
});

describe("getAboutContent fallback (API unreachable)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("brings back no placeholder team", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const { getAboutContent } = await import("@/lib/about");
    const about = await getAboutContent("ar");
    expect(about.team).toEqual([]);
  });

  it("keeps the team the app sends", async () => {
    const sections = { team: [{ id: "1", name_ar: "علي حسن", role_ar: "مهندس" }], testimonials: [], timeline: [], values: [] };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ texts: {}, site: {}, sections }))));
    const { getAboutContent } = await import("@/lib/about");
    const about = await getAboutContent("ar");
    expect(about.team.map((m) => m.name)).toEqual(["علي حسن"]);
  });
});
