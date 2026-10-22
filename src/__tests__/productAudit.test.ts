import { describe, it, expect } from "vitest";
import { auditProducts, type AuditProduct } from "@/lib/productAudit";

const p = (id: number, name: string, extra: Partial<AuditProduct> = {}): AuditProduct => ({
  id, name, cat_name: "قسم", subcat_name: null, details: "", image_path: `https://img/${id}.jpg`, ...extra,
});
const issuesOf = (rows: ReturnType<typeof auditProducts>, id: number) => rows.filter((r) => r.id === id).map((r) => r.issue);

describe("auditProducts", () => {
  it("flags code-like names", () => {
    const rows = auditProducts([p(1, ".SWITCHES.HDMI.NIVA.NV5-020"), p(2, "11QA"), p(3, "10828-MW"), p(4, "مقعد معلق غربي ريفا")]);
    expect(issuesOf(rows, 1)).toContain("code_like_name");
    expect(issuesOf(rows, 2)).toContain("code_like_name");
    expect(issuesOf(rows, 3)).toContain("code_like_name");
    expect(issuesOf(rows, 4)).not.toContain("code_like_name");
  });

  it("flags obviously wrong items", () => {
    expect(issuesOf(auditProducts([p(683, "1_View01", { cat_name: "أخرى" })]), 683)).toContain("obviously_wrong");
  });

  it("flags prices and internal notes in descriptions", () => {
    const rows = auditProducts([
      p(1, "بلاط", { details: "السعر 12$ للمتر" }),
      p(2, "بلاط", { details: "بـ 20 دولار" }),
      p(3, "بلاط", { details: "بدون اي شي" }),
      p(4, "بلاط", { details: String.raw`وا\ا تطلب` }),
    ]);
    expect(issuesOf(rows, 1)).toContain("price_in_details");
    expect(issuesOf(rows, 2)).toContain("price_in_details");
    expect(issuesOf(rows, 3)).toContain("internal_note");
    expect(issuesOf(rows, 4)).toContain("internal_note");
  });

  it("flags missing and shared images", () => {
    const rows = auditProducts([p(1, "أ", { image_path: null }), p(2, "ب", { image_path: "x.jpg" }), p(3, "ج", { image_path: "x.jpg" })]);
    expect(issuesOf(rows, 1)).toContain("no_image");
    expect(issuesOf(rows, 2)).toContain("duplicate_image");
    expect(issuesOf(rows, 3)).toContain("duplicate_image");
  });

  it("flags identical names, ignoring case and spaces", () => {
    const rows = auditProducts([p(1, "Riva  Chair"), p(2, "riva chair"), p(3, "كرسي")]);
    expect(issuesOf(rows, 1)).toContain("duplicate_name");
    expect(issuesOf(rows, 2)).toContain("duplicate_name");
    expect(issuesOf(rows, 3)).not.toContain("duplicate_name");
  });
});
