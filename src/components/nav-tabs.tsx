"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = { href: string; label: string; icon?: LucideIcon };

/**
 * Underlined tab navigation with an active indicator, shared by the dashboard
 * and public board headers so both feel like the same product.
 */
export function NavTabs({ tabs, exactFirst = true }: { tabs: NavTab[]; exactFirst?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {tabs.map((t, i) => {
        const active = i === 0 && exactFirst ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "border-brand-500 text-ink"
                : "border-transparent text-ink-soft hover:border-sand-300 hover:text-ink",
            )}
          >
            {t.icon && <t.icon className="h-4 w-4" />} {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
