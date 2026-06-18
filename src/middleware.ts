import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@libsql/client/web";

// Run on page requests only (skip _next, api, files with an extension).
export const config = {
  matcher: ["/((?!_next/|api/|.*\\.).*)"],
};

const CANONICAL = new Set(["feedlark.vercel.app", "localhost", "127.0.0.1"]);

/**
 * Custom-domain routing: when a request arrives on a workspace's mapped domain,
 * transparently serve that workspace's public board. Uses the edge-safe libSQL
 * web client + a raw lookup (no drizzle in the edge bundle). Fail-open.
 */
export async function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (!host || host.endsWith(".vercel.app") || CANONICAL.has(host)) return NextResponse.next();

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return NextResponse.next();

  try {
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    const res = await client.execute({ sql: "select slug from workspaces where custom_domain = ? limit 1", args: [host] });
    const slug = res.rows[0]?.slug as string | undefined;
    if (slug) {
      const next = req.nextUrl.clone();
      if (!next.pathname.startsWith("/b/")) {
        next.pathname = `/b/${slug}${next.pathname === "/" ? "" : next.pathname}`;
      }
      return NextResponse.rewrite(next);
    }
  } catch {
    /* fail-open */
  }
  return NextResponse.next();
}
