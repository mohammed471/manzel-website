import { describe, it, expect, vi, afterEach } from "vitest";

const quote = (id: string, extra: Record<string, unknown> = {}) => ({
  id, name_ar: `عميل ${id}`, role_ar: "", location_ar: "كركوك", text_ar: "نص", rating: 5, ...extra,
});

function stubApi(testimonials: unknown[], projects: unknown[] = []) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (String(url).includes("/website/portfolio")) return new Response(JSON.stringify({ projects }));
    const sections = { testimonials, team: [], timeline: [], values: [] };
    return new Response(JSON.stringify({ texts: {}, site: {}, sections }));
  }));
}

describe("getTestimonials", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("hides testimonials that are not marked verified", async () => {
    stubApi([quote("1"), quote("2", { verified: false }), quote("3", { verified: 0 })]);
    const { getTestimonials } = await import("@/lib/testimonials");
    expect(await getTestimonials("ar")).toEqual([]);
  });

  it("shows the verified ones, whatever form the flag arrives in", async () => {
    stubApi([quote("1", { verified: true }), quote("2", { verified: 1 }), quote("3", { verified: "true" }), quote("4", { verified: "1" })]);
    const { getTestimonials } = await import("@/lib/testimonials");
    expect((await getTestimonials("ar")).map((t) => t.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("links a testimonial to its project page", async () => {
    const project = { id: "villa-kirkuk", category: "execution", name: "فيلا", images: ["https://i.ibb.co/x.jpg"] };
    stubApi([quote("1", { verified: 1, project: "villa-kirkuk" }), quote("2", { verified: 1, project: "gone" })], [project]);
    const { getTestimonials } = await import("@/lib/testimonials");
    expect((await getTestimonials("ar")).map((t) => t.projectHref)).toEqual(["/portfolio/execution/villa-kirkuk", null]);
  });

  it("shows nothing when the API is unreachable (no template quotes)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const { getTestimonials } = await import("@/lib/testimonials");
    expect(await getTestimonials("ar")).toEqual([]);
  });
});
