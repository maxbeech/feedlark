"use client";

import { useState } from "react";
import { MessageSquarePlus, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_POSTS } from "./sample-data";

/**
 * The embeddable "feedback" widget — a floating button that opens a board panel
 * on any site. Click to open/close. Illustrative of the real /widget.js embed.
 */
export function WidgetMockup({ className }: { className?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={cn("relative h-full min-h-[300px] w-full overflow-hidden rounded-2xl bg-cream/60 p-4", className)}>
      {/* faux host-site content */}
      <div className="space-y-2" aria-hidden="true">
        <div className="h-3 w-1/3 rounded bg-sand-200" />
        <div className="h-2 w-3/4 rounded bg-sand-200/70" />
        <div className="h-2 w-2/3 rounded bg-sand-200/70" />
      </div>

      {open && (
        <div className="absolute bottom-20 right-4 w-64 origin-bottom-right rounded-xl border border-sand-200 bg-white p-3 shadow-lift animate-rise-in">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Share feedback</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close widget" className="text-ink-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="mt-2 space-y-1.5">
            {MOCK_POSTS.slice(0, 3).map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-lg border border-sand-200 p-2">
                <span className="flex w-9 flex-col items-center rounded-md bg-cream/60 py-0.5 text-brand-700">
                  <ChevronUp className="h-3 w-3" />
                  <span className="text-[11px] font-semibold tabular">{p.votes}</span>
                </span>
                <span className="truncate text-[12px] font-medium text-ink">{p.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-glow"
      >
        <MessageSquarePlus className="h-4 w-4" /> Feedback
      </button>
    </div>
  );
}
