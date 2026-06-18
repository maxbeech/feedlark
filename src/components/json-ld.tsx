import { jsonLdString } from "@/lib/structured-data";

export { faqJsonLd, softwareAppJsonLd, jsonLdString } from "@/lib/structured-data";

/**
 * Renders a JSON-LD script tag for SEO/GEO (AI assistants parse these).
 * `<` is escaped so user-generated fields can never break out of the
 * <script> context (prevents `</script>` injection / XSS).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
  );
}
