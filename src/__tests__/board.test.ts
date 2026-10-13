import { describe, it, expect } from "vitest";
import type { Product } from "@/lib/api";
import type { PortfolioProject } from "@/lib/portfolio";
import {
  BOARD_MAX,
  boardHref,
  boardMessage,
  isSaved,
  itemLabel,
  parseBoard,
  resolveBoard,
  toggleEntry,
} from "@/lib/board";

const tile: Product = {
  id: 12,
  name: "بلاط رخامي",
  category: "بورسلان",
  subcategory: "60*60",
  details: "",
  image: "tile.jpg",
  colors: [
    { id: 3, name: "أبيض", hex: "#ffffff", image: "white.jpg", available: true },
    { id: 5, name: "أسود", hex: "#000000", image: null, available: true },
  ],
};
const paint: Product = {
  id: 45,
  name: "دهان",
  category: "دهانات",
  subcategory: null,
  details: "",
  image: null,
  colors: [],
};
const cafe: PortfolioProject = {
  id: "cafeteria-karbala",
  category: "interior-design",
  name: "كافتيريا كربلاء",
  description: "",
  location: "",
  year: "2024",
  images: ["cover.jpg"],
  videos: [],
  featured: false,
};

describe("parseBoard (the ?i= parameter and the stored board)", () => {
  it("reads products, a product's colour and projects in order", () => {
    expect(parseBoard("p12.3~jcafeteria-karbala~p45")).toEqual(["p12.3", "jcafeteria-karbala", "p45"]);
  });

  it("drops anything that is not a product or project id", () => {
    expect(parseBoard("p12~x9~p~j~jBad_Slug~p1.2.3~<script>~j-a~p7")).toEqual(["p12", "p7"]);
  });

  it("keeps one entry per product or project — the first one", () => {
    expect(parseBoard("p12.3~p12~ja~p12.5~ja")).toEqual(["p12.3", "ja"]);
  });

  it("is empty for a missing or blank parameter", () => {
    expect(parseBoard(undefined)).toEqual([]);
    expect(parseBoard(null)).toEqual([]);
    expect(parseBoard("")).toEqual([]);
  });

  it("stops at the board's size limit", () => {
    const tooMany = Array.from({ length: BOARD_MAX + 5 }, (_, i) => `p${i + 1}`).join("~");
    const parsed = parseBoard(tooMany);
    expect(parsed).toHaveLength(BOARD_MAX);
    expect(parsed.at(-1)).toBe(`p${BOARD_MAX}`);
  });
});

describe("boardHref", () => {
  it("links to the bare page for an empty board and carries the entries otherwise", () => {
    expect(boardHref([])).toBe("/board");
    expect(boardHref(["p12.3", "ja-b"])).toBe("/board?i=p12.3~ja-b");
  });
});

describe("isSaved", () => {
  it("finds a product whatever colour it was saved in", () => {
    expect(isSaved(["p12.3"], "p12")).toBe(true);
    expect(isSaved(["p12"], "p12.7")).toBe(true);
  });

  it("does not confuse ids that merely start alike", () => {
    expect(isSaved(["p123"], "p12")).toBe(false);
    expect(isSaved(["jvilla-2"], "jvilla")).toBe(false);
  });
});

describe("toggleEntry", () => {
  it("puts a newly saved item first", () => {
    expect(toggleEntry(["ja", "p1"], "p9.2")).toEqual(["p9.2", "ja", "p1"]);
  });

  it("removes a saved product even when asked without its colour", () => {
    expect(toggleEntry(["ja", "p9.2"], "p9")).toEqual(["ja"]);
  });

  it("drops the oldest item when the board is full", () => {
    const full = Array.from({ length: BOARD_MAX }, (_, i) => `p${i + 1}`);
    const next = toggleEntry(full, "jnew");
    expect(next).toHaveLength(BOARD_MAX);
    expect(next[0]).toBe("jnew");
    expect(next).not.toContain(`p${BOARD_MAX}`);
  });
});

describe("resolveBoard (entries → what the page shows)", () => {
  it("returns the saved things in the saved order", () => {
    const items = resolveBoard(["jcafeteria-karbala", "p45", "p12"], [tile, paint], [cafe]);
    expect(items.map((i) => i.entry)).toEqual(["jcafeteria-karbala", "p45", "p12"]);
    expect(items.map((i) => i.kind)).toEqual(["project", "product", "product"]);
  });

  it("leaves out products and projects that no longer exist", () => {
    const items = resolveBoard(["p999", "jgone", "p45"], [tile, paint], [cafe]);
    expect(items.map((i) => i.entry)).toEqual(["p45"]);
  });

  it("shows a product in the colour it was saved in", () => {
    const [item] = resolveBoard(["p12.3"], [tile], []);
    expect(item).toMatchObject({
      kind: "product",
      color: { name: "أبيض" },
      product: { image: "white.jpg", colors: [{ id: 3 }] },
    });
    expect(item.kind === "product" && item.product.colors).toHaveLength(1);
  });

  it("keeps the product photo for a colour that has none of its own", () => {
    const [item] = resolveBoard(["p12.5"], [tile], []);
    expect(item).toMatchObject({ color: { name: "أسود" }, product: { image: "tile.jpg" } });
  });

  it("shows the plain product when the saved colour was removed", () => {
    const [item] = resolveBoard(["p12.99"], [tile], []);
    expect(item).toMatchObject({ color: null, product: { image: "tile.jpg" } });
    expect(item.kind === "product" && item.product.colors).toHaveLength(2);
  });
});

describe("itemLabel (a line of the WhatsApp message)", () => {
  it("names a product with its saved colour, and a project by its name", () => {
    const items = resolveBoard(["p12.3", "p45", "jcafeteria-karbala"], [tile, paint], [cafe]);
    expect(items.map(itemLabel)).toEqual(["بلاط رخامي — أبيض", "دهان", "كافتيريا كربلاء"]);
  });
});

describe("boardMessage (the text sent to WhatsApp)", () => {
  const more = (count: number) => `+ ${count} more`;

  it("lists every item and ends with the link when it all fits", () => {
    expect(
      boardMessage({ intro: "Hello:", labels: ["A", "B"], more, url: "https://x.test/board?i=p1~p2" }),
    ).toBe("Hello:\n• A\n• B\n\nhttps://x.test/board?i=p1~p2");
  });

  // Arabic costs 6 characters a letter once it is in a wa.me link
  it("cuts the names short of the link length, and says how many are left", () => {
    const labels = Array.from({ length: 40 }, (_, i) => `بلاط بورسلان فاخر رقم ${i + 1}`);
    const url = "https://x.test/board?i=p1";
    const message = boardMessage({ intro: "مرحباً:", labels, more, url, budget: 600 });

    expect(encodeURIComponent(message).length).toBeLessThanOrEqual(600);
    expect(message.endsWith(`\n\n${url}`)).toBe(true);
    const listed = message.split("\n").filter((line) => line.startsWith("• ")).length;
    expect(listed).toBe(3);
    expect(message).toContain("+ 37 more");
  });

  it("still sends the link when not even one name fits", () => {
    const message = boardMessage({
      intro: "Hi:",
      labels: ["x".repeat(500)],
      more,
      url: "https://x.test/b",
      budget: 100,
    });
    expect(message).toBe("Hi:\n+ 1 more\n\nhttps://x.test/b");
  });
});
