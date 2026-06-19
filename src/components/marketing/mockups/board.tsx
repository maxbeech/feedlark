"use client";

import { useState } from "react";
import { ChevronUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_POSTS, MOCK_STATUS_LABEL, type MockStatus } from "./sample-data";

const statusChip: Record<MockStatus, string> = {
  open: "bg-cream text-ink-soft ring-1 ring-inset ring-sand-200",
  under_review: "bg-amber-100 text-amber-800",
  planned: "bg-sky-100 text-sky-800",
  in_progress: "bg-brand-100 text-brand-800",
  complete: "bg-spruce-100 text-spruce-700",
};

/**
 * The hero board — a real, clickable feedback board. Visitors can upvote and
 * feel the core interaction (count animates, "voted" state sticks). Illustrative.
 */
export function BoardMockup({ className }: { className?: string }) {
  const [votes, setVotes] = useState<Record<string, number>>(() => Object.fromEntries(MOCK_POSTS.map((p) => [p.id, p.votes])));
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [pop, setPop] = useState<string | null>(null);

  function toggle(id: string) {
    const isVoted = voted[id];
    setVoted((v) => ({ ...v, [id]: !isVoted }));
    setVotes((v) => ({ ...v, [id]: v[id] + (isVoted ? -1 : 1) }));
    setPop(id);
    window.setTimeout(() => setPop((cur) => (cur === id ? null : cur)), 350);
  }

  return (
    <div className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between px-1 pb-3">
        <p className="font-display text-base font-semibold text-ink">Feature requests</p>
        <span className="rounded-md bg-cream px-2 py-1 text-[11px] font-medium text-ink-muted">Sorted by votes</span>
      </div>
      <ul className="space-y-2">
        {MOCK_POSTS.map((p) => {
          const isVoted = !!voted[p.id];
          return (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white p-3 transition-colors hover:border-sand-300"
            >
              <button
                type="button"
                onClick={() => toggle(p.id)}
                aria-pressed={isVoted}
                aria-label={`Upvote ${p.title}`}
                className={cn(
                  "flex w-12 shrink-0 flex-col items-center rounded-lg border py-1.5 transition-colors",
                  isVoted
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-sand-200 bg-cream/50 text-ink-soft hover:border-brand-200 hover:text-brand-600",
                )}
              >
                <ChevronUp className={cn("h-4 w-4 transition-transform", isVoted && "-translate-y-0.5")} />
                <span className={cn("text-sm font-semibold tabular", pop === p.id && "animate-vote-pop")}>{votes[p.id]}</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", statusChip[p.status])}>
                    {MOCK_STATUS_LABEL[p.status]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                    <MessageSquare className="h-3 w-3" /> {p.comments}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
