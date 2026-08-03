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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Feedlark",
    url: "https://feedlark.com",
    logo: "https://feedlark.com/icon.svg",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Feedlark",
    url: "https://feedlark.com",
  };
}

/** items are ordered root-first; `path` is site-relative (e.g. "/blog/some-post"). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://feedlark.com${item.path}`,
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
      "Free customer feedback boards, public roadmap and changelog. Unlimited end-users, no per-user growth tax.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
      { "@type": "Offer", price: "19", priceCurrency: "USD", name: "Pro (per seat / mo)" },
    ],
  };
}
