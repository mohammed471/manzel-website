import { SITE_URL } from "@/lib/siteUrl";
import { telHref } from "@/lib/siteContent";

// Structured data (schema.org). Values come from the site texts / app data —
// pass them in, nothing is hardcoded here except the opening hours and area.

export function businessLd(o: {
  name: string;
  legalName: string;
  phones: string[];
  email: string;
  address: string;
  sameAs: string[];
  mapUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: o.name,
    legalName: o.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-dark.png`,
    image: `${SITE_URL}/og-default.jpg`,
    telephone: o.phones.filter(Boolean).map((p) => telHref(p).slice(4)),
    email: o.email,
    address: { "@type": "PostalAddress", streetAddress: o.address, addressLocality: "Kirkuk", addressCountry: "IQ" },
    // TODO(owner): add `geo` (latitude/longitude of the showroom) once confirmed — not guessed from the map link
    hasMap: o.mapUrl,
    areaServed: "Kirkuk",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: o.sameAs.filter(Boolean),
  };
}

/** FAQPage of the questions that have a real answer; none → null. */
export function faqLd(all: { question: string; answer: string }[]) {
  const items = all.filter((i) => i.question.trim() && i.answer.trim());
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function projectLd(p: { name: string; url: string; images: string[]; location: string; year: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    url: p.url,
    image: p.images,
    ...(p.location && { locationCreated: { "@type": "Place", name: p.location } }),
    ...(p.year && { dateCreated: p.year }),
  };
}
