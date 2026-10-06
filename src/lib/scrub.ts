import type { Breadcrumb, ErrorEvent, EventHint, Log } from "@sentry/nextjs";

type TransactionEvent = Parameters<NonNullable<import("@sentry/nextjs").NodeOptions["beforeSendTransaction"]>>[0];

/**
 * The one scrubber for everything Feedlark sends to Sentry: events, logs,
 * breadcrumbs, transactions and spans. Voters' and customers' email addresses
 * and credentials are not ours to ship to a third party.
 */

const REDACTED = "[redacted]";

// Keys whose values never leave the process (case-insensitive substring match).
const SECRET_KEYS = [
  "key", "token", "secret", "password", "passwd", "authorization", "cookie", "session",
  "signature", "credential", "dsn", "bearer", "jwt",
];
const PII_KEYS = ["email", "phone", "mobile", "address"];

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SECRET_KEYS.some((s) => k.includes(s)) || PII_KEYS.some((s) => k.includes(s));
}

const STRING_PATTERNS: [RegExp, string][] = [
  // JWTs (three base64url segments)
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]*/g, REDACTED],
  // Bearer / Basic credentials
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, `$1 ${REDACTED}`],
  // Vendor API keys and secrets
  [/\b(?:sk|pk|rk|whsec|hlm_sk|sntrys|sntryu|re|xox[abpr])_[A-Za-z0-9_-]{6,}/g, REDACTED],
  [/\bsk-[A-Za-z0-9_-]{10,}/g, REDACTED],
  // key=value / "key":"value" pairs for sensitive names inside serialised text
  [
    /(["']?\b[\w-]*(?:password|passwd|secret|token|api[_-]?key|authorization|cookie|signature|credential)[\w-]*["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&}\]]+)/gi,
    `$1"${REDACTED}"`,
  ],
  // Emails
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED],
  // Phone numbers: optional +, 9 to 15 digits with common separators
  [/(?<![\w.])\+?\d[\d\s().-]{7,}\d(?![\w.])/g, REDACTED],
];

/** Mask secrets, emails and phone numbers inside free text. */
export function scrubString(input: string): string {
  let out = input;
  for (const [re, rep] of STRING_PATTERNS) out = out.replace(re, rep);
  return out;
}

/** Drop the query string and fragment from a URL or path (tokens live there). */
export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

const URL_KEYS = new Set(["url", "to", "from", "http.url", "http.target", "url.full", "http.query", "url.query", "url.fragment"]);

/** Recursively redact sensitive keys and mask sensitive-looking string content. */
export function scrubValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (depth > 8 || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(k)) out[k] = REDACTED;
    else if (k === "http.query" || k === "url.query" || k === "url.fragment") out[k] = REDACTED;
    else if (URL_KEYS.has(k) && typeof v === "string") out[k] = scrubString(stripQuery(v));
    else out[k] = scrubValue(v, depth + 1);
  }
  return out;
}

/** Sentry `beforeSendLog`: message and attributes. */
export function scrubLog(log: Log): Log {
  return {
    ...log,
    message: typeof log.message === "string" ? scrubString(log.message) : log.message,
    attributes: log.attributes ? (scrubValue(log.attributes) as Log["attributes"]) : log.attributes,
  };
}

/** Sentry `beforeBreadcrumb`: message and data, query strings stripped from url/to/from. */
export function scrubBreadcrumb(b: Breadcrumb): Breadcrumb {
  return {
    ...b,
    message: typeof b.message === "string" ? scrubString(b.message) : b.message,
    data: b.data ? (scrubValue(b.data) as Record<string, unknown>) : b.data,
  };
}

/** Sentry `beforeSend` for error events. */
export function scrubEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent {
  if (event.message) event.message = scrubString(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (typeof ex.value === "string") ex.value = scrubString(ex.value);
  }
  if (event.request) {
    if (event.request.url) event.request.url = scrubString(stripQuery(event.request.url));
    delete event.request.cookies;
    event.request.query_string = undefined;
    if (event.request.headers) event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
    if (event.request.data) event.request.data = scrubValue(event.request.data);
  }
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
  }
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  return event;
}

/** Sentry `beforeSendTransaction`: request url, spans and their http/url data. */
export function scrubTransaction(event: TransactionEvent): TransactionEvent {
  if (event.transaction) event.transaction = scrubString(stripQuery(event.transaction));
  if (event.request) {
    if (event.request.url) event.request.url = scrubString(stripQuery(event.request.url));
    event.request.query_string = undefined;
    delete event.request.cookies;
    if (event.request.headers) event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
  }
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  event.spans = event.spans?.map((s) => ({
    ...s,
    description: s.description ? scrubString(stripQuery(s.description)) : s.description,
    data: s.data ? (scrubValue(s.data) as typeof s.data) : s.data,
  }));
  return event;
}
