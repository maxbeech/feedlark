import type { BlogPost } from "./blog-types";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function collectText(post: BlogPost): string[] {
  const text: string[] = [];
  for (const b of post.blocks) {
    if (b.p) text.push(b.p);
    if (b.ul) text.push(...b.ul);
    if (b.quote) text.push(b.quote.text);
    if (b.table) text.push(...b.table.rows.flat(), ...b.table.head);
  }
  for (const f of post.faqs ?? []) text.push(f.a);
  return text;
}

/** Pulls every markdown-style link out of a post's body copy, split into internal (site-relative) and external. */
export function extractLinks(post: BlogPost): { internal: string[]; external: string[] } {
  const internal: string[] = [];
  const external: string[] = [];
  for (const chunk of collectText(post)) {
    let match: RegExpExecArray | null;
    LINK_RE.lastIndex = 0;
    while ((match = LINK_RE.exec(chunk))) {
      const href = match[2];
      if (href.startsWith("/")) internal.push(href);
      else external.push(href);
    }
  }
  return { internal, external };
}
