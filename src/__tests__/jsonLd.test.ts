import { describe, it, expect } from "vitest";
import { businessLd, faqLd, projectLd } from "@/lib/jsonLd";

describe("businessLd", () => {
  const ld = businessLd({
    name: "منزل",
    legalName: "شركة منزل للتصميم والبناء",
    phones: ["0773 768 5000", "0773 768 6000"],
    email: "contact.manzel@gmail.com",
    address: "كركوك - حي روناكي - قرب جسر الولادة",
    sameAs: ["https://facebook.com/x", ""],
    mapUrl: "https://maps.app.goo.gl/x",
  });

  it("is one HomeAndConstructionBusiness with both phones in international form", () => {
    expect(ld["@type"]).toBe("HomeAndConstructionBusiness");
    expect(ld.telephone).toEqual(["+9647737685000", "+9647737686000"]);
    expect(ld.email).toBe("contact.manzel@gmail.com");
    expect(ld.areaServed).toBe("Kirkuk");
    expect(ld.sameAs).toEqual(["https://facebook.com/x"]);
  });

  it("opens Saturday to Thursday 09:00–18:00 and has no made-up coordinates", () => {
    expect(ld.openingHoursSpecification).toMatchObject({ opens: "09:00", closes: "18:00" });
    expect(ld.openingHoursSpecification.dayOfWeek).not.toContain("Friday");
    expect(ld).not.toHaveProperty("geo");
  });
});

describe("faqLd", () => {
  it("lists every question with its answer", () => {
    const ld = faqLd([{ question: "س؟", answer: "ج." }])!;
    expect(ld.mainEntity).toEqual([{ "@type": "Question", name: "س؟", acceptedAnswer: { "@type": "Answer", text: "ج." } }]);
  });

  it("leaves out unanswered questions, and is null when none is answered", () => {
    expect(faqLd([{ question: "س؟", answer: " " }, { question: "س2؟", answer: "ج2." }])!.mainEntity.map((q) => q.name)).toEqual(["س2؟"]);
    expect(faqLd([{ question: "س؟", answer: " " }])).toBeNull();
    expect(faqLd([])).toBeNull();
  });
});

describe("projectLd", () => {
  it("describes a project as a CreativeWork with its images, place and year", () => {
    const ld = projectLd({ name: "شقة", url: "https://x/ar/p", images: ["https://img/1.jpg"], location: "كركوك", year: "2025" });
    expect(ld).toMatchObject({ "@type": "CreativeWork", name: "شقة", image: ["https://img/1.jpg"], locationCreated: { "@type": "Place", name: "كركوك" }, dateCreated: "2025" });
  });

  it("leaves out place and year when unknown", () => {
    const ld = projectLd({ name: "شقة", url: "u", images: [], location: "", year: "" });
    expect(ld).not.toHaveProperty("locationCreated");
    expect(ld).not.toHaveProperty("dateCreated");
  });
});
