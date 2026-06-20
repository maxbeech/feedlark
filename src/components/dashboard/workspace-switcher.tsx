"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { switchWorkspaceAction } from "@/lib/actions/team";

type WS = { id: string; name: string };

/** Switch the active workspace. Only rendered when the user is in more than one. */
export function WorkspaceSwitcher({ current, workspaces }: { current: WS; workspaces: WS[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-ink-muted hover:bg-cream hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        / {current.name} <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-lift" role="menu">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Your workspaces</p>
            {workspaces.map((w) => (
              <form action={switchWorkspaceAction} key={w.id}>
                <input type="hidden" name="workspaceId" value={w.id} />
                <button type="submit" className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-cream">
                  <span className="truncate">{w.name}</span>
                  {w.id === current.id && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              </form>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
