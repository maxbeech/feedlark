import { ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/ui";

// A representative product illustration for the hero (UI preview, not metrics).
const SAMPLE = [
  { title: "Dark mode for the dashboard", votes: 128, status: "in_progress" },
  { title: "Slack notifications for new feedback", votes: 96, status: "planned" },
  { title: "CSV export of all requests", votes: 64, status: "complete" },
  { title: "Single sign-on (SSO)", votes: 41, status: "under_review" },
];

export function BoardPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-ink-muted">acme.feedlark.app</span>
      </div>
      <div className="space-y-2 p-4">
        <p className="px-1 pb-1 text-sm font-semibold text-ink">Feature Requests</p>
        {SAMPLE.map((s) => (
          <div key={s.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <div className="flex w-11 flex-col items-center rounded-lg bg-brand-50 py-1.5 text-brand-700">
              <ChevronUp className="h-4 w-4" />
              <span className="text-sm font-semibold">{s.votes}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{s.title}</p>
              <div className="mt-1"><StatusBadge status={s.status} label={s.status === "complete" ? "Shipped" : s.status === "in_progress" ? "In Progress" : s.status === "planned" ? "Planned" : "Under Review"} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
