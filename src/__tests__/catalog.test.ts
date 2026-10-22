import { describe, it, expect, vi, afterEach } from "vitest";
import { productTitle, queryCatalog } from "@/lib/catalog";
import type { Product } from "@/lib/api";

const p = (id: number, name: string, extra: Partial<Product> = {}): Product => ({
  id, name, category: "قسم", subcategory: null, details: "", image: "x.jpg", colors: [], price: null, priceUnit: null, currency: null, ...extra,
});

describe("productTitle", () => {
  it("uses a short Arabic description as the title when the name is a code", () => {
    expect(productTitle(p(1, "10828-MW", { details: "مقعد معلق غربي ريفا\nالمقاس 50 سم" }))).toEqual({
      title: "مقعد معلق غربي ريفا",
      code: "10828-MW",
    });
  });

  it("keeps the code when the description is only colours, English, long or empty", () => {
    for (const details of ["اسود ابيض ذهبي رصاصي ", "Material: Stainless steel", "و".repeat(60), ""]) {
      expect(productTitle(p(1, "RV-11A", { details }))).toEqual({ title: "RV-11A", code: null });
    }
  });

  it("keeps an Arabic name as it is", () => {
    expect(productTitle(p(1, "كرسي حديقة", { details: "مقعد" }))).toEqual({ title: "كرسي حديقة", code: null });
  });
});

describe("queryCatalog — sort", () => {
  const list = [p(3, "B", { category: "أ" }), p(10, "C", { category: "ب" }), p(7, "A", { category: "ب" }), p(20, "Z", { image: null })];
  const ids = (sort?: "newest" | "name" | "category") => queryCatalog(list, { page: 1, sort }).items.map((i) => i.id);

  it("defaults to newest, photographed products first", () => {
    expect(ids()).toEqual([10, 7, 3, 20]);
  });

  it("sorts by name or by category on request", () => {
    expect(ids("name")).toEqual([7, 3, 10, 20]);
    expect(ids("category")).toEqual([3, 7, 10, 20]);
  });
});

describe("hidden products (flag from the internal app)", () => {
  afterEach(() => vi.unstubAllGlobals());
  const raw = (id: number, hidden?: unknown) => ({ id, name: `P${id}`, cat_name: "قسم", hidden });

  it("leaves hidden products out of the list", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ products: [raw(1), raw(2, true), raw(3, 1), raw(4, false)] }))));
    const { getProducts } = await import("@/lib/api");
    expect((await getProducts()).map((p) => p.id)).toEqual([1, 4]);
  });

  it("gives no page for a hidden product", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(raw(2, true)))));
    const { getProduct } = await import("@/lib/api");
    expect(await getProduct(2)).toBeNull();
  });
});

describe("product price fields (T18)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads price, unit and currency when the API sends them", async () => {
    const products = [
      { id: 1, name: "بلاط", price_retail: 16, currency: "USD", price_unit: "m2" },
      { id: 2, name: "كرسي", price_retail: 0, currency: "IQD" },
      { id: 3, name: "باب" },
    ];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ products }))));
    const { getProducts } = await import("@/lib/api");
    expect((await getProducts()).map(({ price, priceUnit, currency }) => ({ price, priceUnit, currency }))).toEqual([
      { price: 16, priceUnit: "m2", currency: "USD" },
      { price: null, priceUnit: null, currency: null },
      { price: null, priceUnit: null, currency: null },
    ]);
  });
});
