/** Pure board filter/sort/search — unit-tested, shared by the client list. */

export type SortKey = "top" | "new";

export interface FilterablePost {
  id: string;
  title: string;
  body: string;
  status: string;
  voteCount: number;
  pinned: boolean;
  createdAt: number;
}

export function filterSortPosts<T extends FilterablePost>(
  posts: T[],
  opts: { status?: string; sort?: SortKey; query?: string },
): T[] {
  const status = opts.status ?? "all";
  const sort = opts.sort ?? "top";
  const q = (opts.query ?? "").trim().toLowerCase();

  let out = posts.filter((p) => p.status !== "closed");
  if (status !== "all") out = out.filter((p) => p.status === status);
  if (q) out = out.filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q));

  out = [...out].sort((a, b) => {
    // Pinned always first.
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === "new") return b.createdAt - a.createdAt;
    return b.voteCount - a.voteCount || b.createdAt - a.createdAt;
  });
  return out;
}

/** Status filter chips shown on a public board (count-aware). */
export const BOARD_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "under_review", label: "Under Review" },
  { key: "planned", label: "Planned" },
  { key: "in_progress", label: "In Progress" },
  { key: "complete", label: "Shipped" },
];
