"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-ink hover:bg-slate-100">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white shadow-sm">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium text-ink-soft hover:text-ink">
                {n.label}
              </Link>
            ))}
            <div className="my-2 flex gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-slate-300 py-2 text-center text-sm font-medium">Log in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-xl bg-brand-600 py-2 text-center text-sm font-medium text-white">Start free</Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
