import { describe, expect, it } from "vitest";
import { withoutPriceLines } from "@/lib/api";

describe("withoutPriceLines", () => {
  it("drops the lines that quote a price and keeps the rest", () => {
    const details = "290x15\r\nسلاب \r\nسمك ٢ سم \r\nالاسعار للمتر المربع الواحد بدون قص \r\nمواد وعمل للمتر المربع هي 160$ مرمر";
    expect(withoutPriceLines(details)).toBe("290x15\nسلاب \nسمك ٢ سم");
  });

  it("leaves a description without prices as it is", () => {
    expect(withoutPriceLines("بورسلين 60×60\nلون رمادي")).toBe("بورسلين 60×60\nلون رمادي");
  });
});
