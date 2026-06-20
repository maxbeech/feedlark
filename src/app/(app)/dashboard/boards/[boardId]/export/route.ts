import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { listBoardPosts } from "@/lib/data/posts";
import { statusLabel } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { toCsv } from "@/lib/csv";

/** Pro: download a board's feedback as CSV. */
export async function GET(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const { workspace } = await requireWorkspaceContext();
  if (workspace.plan !== "pro") return NextResponse.json({ error: "pro_required" }, { status: 403 });

  const board = (await db.select().from(schema.boards).where(eq(schema.boards.id, boardId)).limit(1))[0];
  if (!board || board.workspaceId !== workspace.id) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const posts = await listBoardPosts(boardId, { includeClosed: true });
  const rows: (string | number)[][] = [["Title", "Status", "Votes", "Author", "Created", "Details"]];
  for (const p of posts) {
    rows.push([p.title, statusLabel(p.status), p.voteCount, p.authorName, formatDate(p.createdAt), p.body]);
  }
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${board.slug}-feedback.csv"`,
    },
  });
}
