/** Pure JSON-LD helpers (no JSX) so they're unit-testable. */

/** Serialise JSON-LD with `<` escaped to prevent `</script>` breakout (XSS-safe). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function softwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Feedlark",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Free customer feedback boards, public roadmap and changelog. Unlimited end-users — no per-user growth tax.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
      { "@type": "Offer", price: "19", priceCurrency: "USD", name: "Pro (per seat / mo)" },
    ],
  };
}
