"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { VoteButton } from "@/components/public/vote-button";
import { statusLabel, cn } from "@/lib/utils";
import { filterSortPosts, BOARD_FILTERS, type FilterablePost, type SortKey } from "@/lib/board-filter";

type Post = FilterablePost & { shippedChangelogId?: string | null };

export function BoardPostList({
  posts,
  votedIds,
  wsSlug,
  commentCounts,
}: {
  posts: Post[];
  votedIds: string[];
  wsSlug: string;
  commentCounts: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortKey>("top");
  const voted = useMemo(() => new Set(votedIds), [votedIds]);
  const shown = useMemo(() => filterSortPosts(posts, { status, sort, query }), [posts, status, sort, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: posts.filter((p) => p.status !== "closed").length };
    for (const p of posts) if (p.status !== "closed") c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [posts]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas…"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="inline-flex shrink-0 rounded-xl border border-slate-300 p-0.5">
          {(["top", "new"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-medium capitalize", sort === s ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {BOARD_FILTERS.filter((f) => f.key === "all" || counts[f.key]).map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              status === f.key ? "bg-ink text-white" : "bg-slate-100 text-ink-soft hover:bg-slate-200",
            )}
          >
            {f.label} <span className="opacity-60">{counts[f.key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {shown.map((p) => (
          <Card key={p.id} className="flex items-start gap-4 p-4">
            <VoteButton postId={p.id} initialCount={p.voteCount} initialVoted={voted.has(p.id)} />
            <div className="min-w-0 flex-1">
              <Link href={`/b/${wsSlug}/p/${p.id}`} className="font-medium text-ink hover:text-brand-700">{p.title}</Link>
              {p.body && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{p.body}</p>}
              <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
                <StatusBadge status={p.status} label={statusLabel(p.status)} />
                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {commentCounts[p.id] ?? 0}</span>
                {p.shippedChangelogId && <span className="font-medium text-emerald-700">✓ Shipped</span>}
              </div>
            </div>
          </Card>
        ))}
        {shown.length === 0 && (
          <Card className="p-10 text-center text-ink-muted">
            {query || status !== "all" ? "No ideas match your filters." : "No ideas yet — be the first to suggest one!"}
          </Card>
        )}
      </div>
    </div>
  );
}
