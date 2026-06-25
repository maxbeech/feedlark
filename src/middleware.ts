import { NextResponse, type NextRequest } from "next/server";

// Run on page requests only (skip _next, api, files with an extension).
export const config = {
  matcher: ["/((?!_next/|api/|.*\\.).*)"],
};

const CANONICAL = new Set(["feedlark.com", "www.feedlark.com", "feedlark.vercel.app", "localhost", "127.0.0.1"]);

/**
 * Custom-domain routing: when a request arrives on a workspace's mapped domain,
 * transparently serve that workspace's public board. Uses Supabase's REST API
 * (edge-safe fetch) with the service-role key (server-only env, bypasses RLS) so
 * no DB driver is bundled into the edge runtime. Fail-open on any error.
 */
export async function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (!host || host.endsWith(".vercel.app") || CANONICAL.has(host)) return NextResponse.next();

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.next();

  try {
    const endpoint = `${supabaseUrl}/rest/v1/workspaces?custom_domain=eq.${encodeURIComponent(host)}&select=slug&limit=1`;
    const res = await fetch(endpoint, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!res.ok) return NextResponse.next();
    const rows = (await res.json()) as { slug?: string }[];
    const slug = rows[0]?.slug;
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
