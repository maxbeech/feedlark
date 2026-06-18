import Link from "next/link";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui";
import { MobileNav } from "@/components/marketing/mobile-nav";

const nav = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/alternatives/canny", label: "vs Canny" },
  { href: "/blog", label: "Blog" },
  { href: "/feedback", label: "Roadmap" },
];

export function SiteHeader({ isAuthed }: { isAuthed?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-ink-soft hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <LinkButton href="/dashboard" size="sm">Dashboard</LinkButton>
          ) : (
            <>
              <div className="hidden sm:block"><LinkButton href="/login" variant="ghost" size="sm">Log in</LinkButton></div>
              <div className="hidden sm:block"><LinkButton href="/signup" size="sm">Start free</LinkButton></div>
            </>
          )}
          <MobileNav links={nav} />
        </div>
      </div>
    </header>
  );
}
