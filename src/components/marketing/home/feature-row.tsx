import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * An alternating feature row: a short editorial pitch beside a live product
 * mockup. Reused for each pillar so the page reads as one designed system.
 */
export function FeatureRow({
  eyebrow,
  title,
  body,
  points,
  visual,
  flip = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  points: string[];
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={cn(flip && "lg:order-2")}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
        <h3 className="mt-3 font-display text-3xl font-semibold tracking-tightest text-ink md:text-[2.5rem] md:leading-[1.08]">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">{body}</p>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-spruce-100 text-spruce-700">
                <Check className="h-3 w-3" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn("relative", flip && "lg:order-1")}>
        <div className="pointer-events-none absolute -inset-6 -z-10 glow-brand opacity-70 blur-2xl" />
        {visual}
      </div>
    </div>
  );
}
