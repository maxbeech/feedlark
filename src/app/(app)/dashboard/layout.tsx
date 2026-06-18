import Link from "next/link";
import { ExternalLink, LayoutGrid, Map, Megaphone, Settings } from "lucide-react";
import { Logo } from "@/components/logo";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/actions/auth";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const links = [
  { href: "/dashboard", label: "Boards", icon: LayoutGrid },
  { href: "/dashboard/changelog", label: "Changelog", icon: Megaphone },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { workspace } = await requireWorkspaceContext();
  const publicUrl = absoluteUrl(`/b/${workspace.slug}`);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hidden text-sm text-ink-muted sm:inline">/ {workspace.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View live board <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <form action={logoutAction}>
              <button className="text-sm text-ink-muted hover:text-ink">Log out</button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-ink-soft hover:text-ink">
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
