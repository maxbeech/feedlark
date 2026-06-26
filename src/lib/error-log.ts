import "server-only";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";

/**
 * Persist an error to our own Postgres error log (a lightweight, zero-cost
 * alternative to a third-party monitor). Query it via the Supabase MCP/dashboard.
 * Never throws — the error logger must not become a new failure source.
 */
export async function logErrorEvent(e: {
  source: "server" | "client";
  message: string;
  stack?: string | null;
  digest?: string | null;
  url?: string | null;
}): Promise<void> {
  try {
    await db.insert(schema.errorEvents).values({
      id: newId("err"),
      source: e.source,
      message: (e.message || "unknown error").slice(0, 4000),
      stack: e.stack ? e.stack.slice(0, 8000) : null,
      digest: e.digest ?? null,
      url: e.url ? e.url.slice(0, 1000) : null,
    });
  } catch {
    /* swallow — logging must never break the request */
  }
}
