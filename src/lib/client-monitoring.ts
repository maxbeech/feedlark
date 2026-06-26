/**
 * Report a client-side error to our own error log via a tiny POST — no SDK in
 * the bundle, no third-party service. Best-effort and silent on failure.
 */
export async function captureClientError(error: unknown): Promise<void> {
  try {
    const e = error as { message?: string; stack?: string; digest?: string };
    await fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: e?.message ?? String(error),
        stack: e?.stack,
        digest: e?.digest,
        url: typeof location !== "undefined" ? location.href : undefined,
      }),
      keepalive: true,
    });
  } catch {
    /* monitoring must never break the error UI */
  }
}
