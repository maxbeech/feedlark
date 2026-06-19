"use client";

import { useState } from "react";
import { Rocket, ChevronUp, Megaphone, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "shipped";

/**
 * The signature interactive demo: ship a roadmap item and watch the loop close —
 * the card moves to Shipped, the changelog writes itself, and voters are notified.
 * One click shows the whole "You asked → We shipped" mechanic. Illustrative data.
 */
export function LoopDemo({ className }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const shipped = phase === "shipped";

  const columns: { key: string; label: string; items: { title: string; votes: number; here: boolean }[] }[] = [
    { key: "planned", label: "Planned", items: [{ title: "Slack alerts", votes: 168, here: true }] },
    { key: "in_progress", label: "In progress", items: [{ title: "Dark mode", votes: 213, here: !shipped }] },
    { key: "complete", label: "Shipped", items: [{ title: "Dark mode", votes: 213, here: shipped }] },
  ];

  return (
    <div className={cn("rounded-2xl border border-sand-200 bg-white p-4 shadow-soft sm:p-6", className)}>
      <div className="grid gap-3 sm:grid-cols-3">
        {columns.map((c) => (
          <div key={c.key} className="rounded-xl bg-cream/50 p-3">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {c.label}
              {c.key === "complete" && shipped && <Check className="h-3 w-3 text-spruce-600" />}
            </p>
            <div className="space-y-2">
              {c.items.filter((i) => i.here).map((i) => (
                <div
                  key={c.key + i.title}
                  className={cn(
                    "rounded-lg border bg-white p-2.5 animate-rise-in",
                    c.key === "complete" ? "border-spruce-100 ring-1 ring-spruce-100" : "border-sand-200",
                  )}
                >
                  <p className="text-sm font-medium text-ink">{i.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                    <ChevronUp className="h-3 w-3 text-brand-500" /> {i.votes}
                  </p>
                </div>
              ))}
              {c.key === "complete" && !shipped && (
                <p className="rounded-lg border border-dashed border-sand-200 p-2.5 text-center text-[11px] text-ink-muted">Nothing yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* The action + what it triggers */}
      <div className="mt-4 rounded-xl border border-sand-200 bg-paper p-3">
        {!shipped ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              <span className="font-medium text-ink">Dark mode</span> is done. Ship it to close the loop.
            </p>
            <button
              type="button"
              onClick={() => setPhase("shipped")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-shadow hover:shadow-glow"
            >
              <Rocket className="h-4 w-4" /> Ship it
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-rise-in">
            <div className="flex items-start gap-2 rounded-lg bg-white p-3 ring-1 ring-sand-200">
              <span className="mt-0.5 rounded-md bg-spruce-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-spruce-700">Changelog</span>
              <p className="text-sm text-ink-soft">
                <span className="font-medium text-ink">Dark mode is here.</span> The entry wrote itself, published to your public changelog.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-spruce-700">
                <Megaphone className="h-4 w-4" /> 213 voters notified automatically
              </p>
              <button
                type="button"
                onClick={() => setPhase("idle")}
                className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Replay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
