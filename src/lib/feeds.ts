/** Pure RSS 2.0 builder (no IO) so feed generation is unit-testable. */

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface RssItem {
  title: string;
  link: string;
  description: string;
  guid: string;
  pubDate: Date;
}

export function buildRssFeed(opts: {
  title: string;
  link: string;
  description: string;
  items: RssItem[];
}): string {
  const items = opts.items
    .map(
      (it) => `    <item>
      <title>${xmlEscape(it.title)}</title>
      <link>${xmlEscape(it.link)}</link>
      <guid isPermaLink="false">${xmlEscape(it.guid)}</guid>
      <pubDate>${it.pubDate.toUTCString()}</pubDate>
      <description>${xmlEscape(it.description)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(opts.title)}</title>
    <link>${xmlEscape(opts.link)}</link>
    <description>${xmlEscape(opts.description)}</description>
${items}
  </channel>
</rss>`;
}
