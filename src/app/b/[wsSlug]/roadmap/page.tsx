import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { roadmapPosts } from "@/lib/data/posts";
import { Card } from "@/components/ui";
import { ROADMAP_COLUMNS } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ wsSlug: string }> }): Promise<Metadata> {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return {};
  return pageMetadata({
    title: `${ws.name} roadmap`,
    description: `What ${ws.name} is planning, building and has shipped. Follow the public product roadmap.`,
    path: `/b/${ws.slug}/roadmap`,
  });
}

export default async function RoadmapPage({ params }: { params: Promise<{ wsSlug: string }> }) {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) notFound();
  const grouped = await roadmapPosts(ws.id);
  const cols = { planned: grouped.planned, in_progress: grouped.in_progress, complete: grouped.complete };

  // GEO: machine-readable roadmap so AI assistants can answer "what's on X's roadmap?"
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${ws.name} roadmap`,
    itemListElement: ROADMAP_COLUMNS.flatMap((c) =>
      cols[c.status as keyof typeof cols].map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        description: `${c.label}: ${p.voteCount} votes`,
      })),
    ),
  };

  return (
    <div>
      <JsonLd data={itemList} />
      <h1 className="font-display text-3xl font-semibold tracking-tightest text-ink">Roadmap</h1>
      <p className="mt-1 text-ink-muted">What we&apos;re planning, building and have already shipped.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {ROADMAP_COLUMNS.map((c) => {
          const items = cols[c.status as keyof typeof cols];
          return (
            <div key={c.status} className="rounded-2xl bg-cream/50 p-3">
              <h2 className="mb-3 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {c.label} <span className="rounded-full bg-white px-2 text-xs text-ink-muted ring-1 ring-sand-200 tabular">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.map((p) => (
                  <Link key={p.id} href={`/b/${ws.slug}/p/${p.id}`} className="block">
                    <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <p className="font-medium text-ink">{p.title}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted"><ChevronUp className="h-3.5 w-3.5 text-brand-500" /> <span className="tabular">{p.voteCount}</span></p>
                    </Card>
                  </Link>
                ))}
                {items.length === 0 && <p className="rounded-xl border border-dashed border-sand-300 p-4 text-center text-sm text-ink-muted">Nothing here yet</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
