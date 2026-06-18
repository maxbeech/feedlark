/**
 * Deterministic "similar requests" detection. Pure (no IO) so it is fully
 * unit-testable and never fabricates results. Groups posts whose titles share
 * enough significant words (Jaccard similarity over normalised tokens).
 */

const STOP = new Set([
  "the", "a", "an", "to", "for", "of", "and", "or", "in", "on", "with", "add",
  "support", "please", "would", "like", "be", "able", "is", "it", "we", "i",
  "can", "could", "should", "make", "feature", "request", "option", "ability",
]);

export function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

export function similarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface DupeItem {
  id: string;
  title: string;
}

/** Returns clusters (size >= 2) of likely-duplicate posts. */
export function clusterDuplicates(items: DupeItem[], threshold = 0.5): DupeItem[][] {
  const clusters: DupeItem[][] = [];
  const used = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    if (used.has(items[i].id)) continue;
    const group = [items[i]];
    for (let j = i + 1; j < items.length; j++) {
      if (used.has(items[j].id)) continue;
      if (similarity(items[i].title, items[j].title) >= threshold) {
        group.push(items[j]);
        used.add(items[j].id);
      }
    }
    if (group.length >= 2) {
      used.add(items[i].id);
      clusters.push(group);
    }
  }
  return clusters;
}
