"use client";

import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { cn } from "@/lib/utils";
import { track } from "@/lib/openhelm-analytics";
import { EVENTS, voteCastParams } from "@/lib/analytics-events";

export function VoteButton({
  postId,
  initialCount,
  initialVoted,
  size = "md",
}: {
  postId: string;
  initialCount: number;
  initialVoted: boolean;
  size?: "sm" | "md";
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pop, setPop] = useState(false);
  const [pending, start] = useTransition();

  function toggle() {
    // optimistic
    const next = !voted;
    setVoted(next);
    setCount((c) => c + (next ? 1 : -1));
    if (next) {
      setPop(true);
      window.setTimeout(() => setPop(false), 350);
      // Track the upvote conversion itself, not the (reversible) un-vote —
      // this is the engagement moment the "engagement_retention" journey
      // measures. Fired optimistically so a slow/failed network response
      // never silently drops the signal for a click the user did make.
      track(EVENTS.VOTE_CAST, voteCastParams(postId));
    }
    start(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/vote`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
          setVoted(data.voted);
        } else {
          throw new Error(`vote request failed: HTTP ${res.status}`);
        }
      } catch (err) {
        // Was silent before: the UI reverted but nothing recorded *why* the
        // vote didn't stick, which is exactly the class of "user is stranded
        // with no exception thrown" async failure this pass is meant to close.
        Sentry.captureException(err, { tags: { flow: "vote_cast" }, extra: { postId } });
        // revert on network failure
        setVoted(!next);
        setCount((c) => c + (next ? -1 : 1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? "Remove your vote" : "Upvote"}
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-xl border font-semibold transition-colors",
        size === "sm" ? "h-12 w-11 text-sm" : "h-14 w-12",
        voted ? "border-brand-400 bg-brand-50 text-brand-700 shadow-sm" : "border-sand-200 bg-white text-ink hover:border-brand-300 hover:bg-brand-50/40",
      )}
    >
      <ChevronUp className={cn("h-4 w-4 transition-transform", voted ? "-translate-y-0.5 text-brand-600" : "text-ink-muted")} />
      <span className={cn("tabular", pop && "animate-vote-pop")}>{count}</span>
    </button>
  );
}
