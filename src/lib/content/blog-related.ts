import type { BlogPost } from "./blog-types";
import { extractLinks } from "./blog-links";

const STOP = new Set(["the", "a", "an", "and", "or", "of", "for", "to", "in", "on", "with", "how", "what", "is", "your", "vs", "best", "guide", "tools", "tool"]);

function tokens(post: BlogPost): Set<string> {
  const text = [post.keyword, post.title, ...(post.supportingKeywords ?? [])].join(" ").toLowerCase();
  return new Set(text.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t)));
}

/** How many other posts link to each post from their body copy. */
function inboundCounts(posts: BlogPost[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const href of new Set(extractLinks(p).internal)) {
      const m = /^\/blog\/([^#?/]+)/.exec(href);
      if (m && m[1] !== p.slug) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Picks posts on a nearby topic (shared keyword terms). Posts with few inbound
 * links get a boost so every guide is reachable from other indexed pages.
 */
export function relatedPosts(post: BlogPost, posts: BlogPost[], limit = 4): BlogPost[] {
  const mine = tokens(post);
  const inbound = inboundCounts(posts);
  return posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let overlap = 0;
      for (const t of tokens(p)) if (mine.has(t)) overlap++;
      const boost = Math.max(0, 3 - (inbound.get(p.slug) ?? 0)) * 0.75;
      return { p, score: overlap > 0 ? overlap + boost : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.slug < b.p.slug ? -1 : 1))
    .slice(0, limit)
    .map((x) => x.p);
}
