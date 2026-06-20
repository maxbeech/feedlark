import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { LarkMark } from "@/components/logo";
import { NavTabs } from "@/components/nav-tabs";

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
    <div className="min-h-screen bg-paper">
      <header className="border-b border-sand-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href={base} className="font-display text-xl font-semibold tracking-tightest" style={{ color: ws.accentColor }}>
              {ws.name}
            </Link>
            <span className="text-xs font-medium text-ink-muted">Feedback &amp; roadmap</span>
          </div>
          <NavTabs
            tabs={[
              { href: base, label: "Feedback" },
              { href: `${base}/roadmap`, label: "Roadmap" },
              { href: `${base}/changelog`, label: "Changelog" },
            ]}
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>

      {!ws.brandingRemoved && (
        <footer className="py-10 text-center">
          <a href="https://feedlark.com?ref=badge" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-muted shadow-sm transition-colors hover:text-ink">
            <LarkMark className="h-4 w-4" /> Powered by Feedlark
          </a>
        </footer>
      )}
    </div>
  );
}
