import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const COLS: { label: string; tone: string; items: { title: string; votes: number }[] }[] = [
  { label: "Planned", tone: "text-sky-700", items: [{ title: "Slack alerts", votes: 168 }, { title: "CSV export", votes: 96 }] },
  { label: "In progress", tone: "text-brand-700", items: [{ title: "Dark mode", votes: 213 }] },
  { label: "Shipped", tone: "text-spruce-700", items: [{ title: "Public API", votes: 142 }, { title: "Mobile board", votes: 88 }] },
];

/** A compact public-roadmap illustration (three columns, real card shape). */
export function RoadmapMockup({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 rounded-2xl border border-sand-200 bg-white p-4 shadow-soft sm:grid-cols-3", className)}>
      {COLS.map((c) => (
        <div key={c.label} className="rounded-xl bg-cream/50 p-3">
          <p className={cn("mb-2 text-[11px] font-semibold uppercase tracking-wide", c.tone)}>{c.label}</p>
          <div className="space-y-2">
            {c.items.map((i) => (
              <div key={i.title} className="rounded-lg border border-sand-200 bg-white p-2.5">
                <p className="text-sm font-medium text-ink">{i.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                  <ChevronUp className="h-3 w-3 text-brand-500" /> {i.votes}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
