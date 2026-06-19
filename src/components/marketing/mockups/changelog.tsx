import { cn } from "@/lib/utils";
import { MOCK_CHANGELOG } from "./sample-data";

const catChip: Record<string, string> = {
  new: "bg-spruce-100 text-spruce-700",
  improved: "bg-sky-100 text-sky-800",
  fixed: "bg-amber-100 text-amber-800",
};

/** A changelog feed illustration matching the in-app + public changelog. */
export function ChangelogMockup({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-sand-200 bg-white p-4 shadow-soft sm:p-5", className)}>
      <p className="font-display text-base font-semibold text-ink">What&apos;s new</p>
      <ul className="mt-3 space-y-3">
        {MOCK_CHANGELOG.map((e) => (
          <li key={e.title} className="border-l-2 border-sand-200 pl-4">
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", catChip[e.category])}>{e.category}</span>
              <span className="text-[11px] text-ink-muted">{e.when}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-ink">{e.title}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{e.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
