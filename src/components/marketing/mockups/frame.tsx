import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A lightweight "app window" chrome used to frame product mockups so they read
 * as real screens. Shared by every mockup for a consistent look.
 */
export function BrowserFrame({
  url = "acme.feedlark.app",
  className,
  children,
}: {
  url?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lift", className)}>
      <div className="flex items-center gap-2 border-b border-sand-200/80 bg-cream/60 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex h-6 flex-1 items-center rounded-md bg-white/80 px-3 text-[11px] font-medium text-ink-muted ring-1 ring-sand-200">
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}
