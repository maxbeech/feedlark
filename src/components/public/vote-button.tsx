"use client";

import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
    }
    start(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/vote`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
          setVoted(data.voted);
        }
      } catch {
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
