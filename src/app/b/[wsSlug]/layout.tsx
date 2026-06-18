import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { LarkMark } from "@/components/logo";

export default async function PublicWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ wsSlug: string }>;
}) {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) notFound();
  const base = `/b/${ws.slug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href={base} className="text-lg font-bold text-ink" style={{ color: ws.accentColor }}>
              {ws.name}
            </Link>
          </div>
          <nav className="flex gap-1">
            {[
              { href: base, label: "Feedback" },
              { href: `${base}/roadmap`, label: "Roadmap" },
              { href: `${base}/changelog`, label: "Changelog" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-ink-soft hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

      {!ws.brandingRemoved && (
        <footer className="py-8 text-center">
          <a href="https://feedlark.vercel.app?ref=badge" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink">
            <LarkMark className="h-4 w-4" /> Powered by Feedlark
          </a>
        </footer>
      )}
    </div>
  );
}
