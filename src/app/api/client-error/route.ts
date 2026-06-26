import { NextResponse } from "next/server";
import { logErrorEvent } from "@/lib/error-log";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

/** Receives client-side error reports from the error boundaries. */
export async function POST(req: Request) {
  if (!(await checkRateLimit("clientError", await clientIp()))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  let body: { message?: string; stack?: string; digest?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await logErrorEvent({
    source: "client",
    message: String(body?.message ?? "client error"),
    stack: body?.stack ?? null,
    digest: body?.digest ?? null,
    url: body?.url ?? null,
  });
  return NextResponse.json({ ok: true });
}
