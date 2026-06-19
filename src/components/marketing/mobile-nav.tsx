"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-ink hover:bg-cream">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-sand-200 bg-paper shadow-soft">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-cream hover:text-ink">
                {n.label}
              </Link>
            ))}
            <div className="my-2 flex gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-sand-300 bg-white py-2 text-center text-sm font-medium">Log in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 py-2 text-center text-sm font-medium text-white shadow-soft">Start free</Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
