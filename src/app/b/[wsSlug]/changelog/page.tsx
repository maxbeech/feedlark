import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { Rss } from "lucide-react";
import { db, schema } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/data/workspace";
import { Card, CategoryBadge } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/date";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ wsSlug: string }> }): Promise<Metadata> {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) return {};
  return pageMetadata({
    title: `${ws.name} changelog`,
    description: `The latest updates, improvements and fixes shipped by ${ws.name}.`,
    path: `/b/${ws.slug}/changelog`,
  });
}

export default async function ChangelogPage({ params }: { params: Promise<{ wsSlug: string }> }) {
  const { wsSlug } = await params;
  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) notFound();
  const entries = await db
    .select()
    .from(schema.changelogEntries)
    .where(and(eq(schema.changelogEntries.workspaceId, ws.id), isNotNull(schema.changelogEntries.publishedAt)))
    .orderBy(desc(schema.changelogEntries.publishedAt));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Changelog</h1>
        <a href={`/b/${ws.slug}/changelog/rss`} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><Rss className="h-4 w-4" /> RSS</a>
      </div>

      <div className="mt-6 space-y-6">
        {entries.map((e) => (
          <Card key={e.id} id={e.slug} className="scroll-mt-24 p-6">
            <div className="flex items-center gap-2">
              <CategoryBadge category={e.category} />
              {e.linkedPostId && (
                <Link href={`/b/${ws.slug}/p/${e.linkedPostId}`} className="text-xs font-medium text-brand-600">You asked → We shipped</Link>
              )}
              <span className="ml-auto text-xs text-ink-muted">{e.publishedAt ? formatDate(e.publishedAt) : ""}</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-ink">{e.title}</h2>
            {e.body && <Markdown text={e.body} className="mt-2 text-sm leading-6 text-ink-soft" />}
          </Card>
        ))}
        {entries.length === 0 && <Card className="p-10 text-center text-ink-muted">No updates published yet.</Card>}
      </div>
    </div>
  );
}
