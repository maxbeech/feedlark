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

/** Longest string we will run a regex over; anything beyond is cut first. */
export const MAX_SCRUB_CHARS = 10_000;

// Every pattern is linear-time: repetition is bounded and no quantified group
// can match the same characters as its neighbour (SENTRY_STANDARD section 2).
const JWT_RE = /\beyJ[\w-]{5,2000}\.[\w-]{5,2000}\.[\w-]{0,2000}/g;
const BEARER_RE = /\b(Bearer|Basic)\s{1,4}[\w\-.~+/=]{8,2000}/gi;
const API_KEY_RE = /\b(?:sk|pk|rk|whsec|hlm_sk|sntrys|sntryu|re|xox[abpr])_[\w-]{6,300}/g;
const SK_DASH_RE = /\bsk-[\w-]{10,300}/g;
const SECRET_KV_RE =
  /(["']?\b[\w-]{0,20}(?:password|passwd|secret|token|api[_-]?key|authorization|cookie|signature|credential)[\w-]{0,20}["']?\s{0,3}[:=]\s{0,3})(?:"[^"]{0,500}"|'[^']{0,500}'|[^\s,;&}\]]{1,500})/gi;
const EMAIL_RE = /[A-Z0-9._%+-]{1,64}@[A-Z0-9-]{1,63}(?:\.[A-Z0-9-]{1,63}){1,8}/gi;
const PHONE_RE = /(?<![\w.])\+?\d[\d\s().-]{7,18}\d(?![\w.])/g;
const URL_QUERY_RE = /(https?:\/\/[^\s"'<>?#]{1,2000})[?#][^\s"'<>]{0,2000}/gi;

/** Cut a string to the matching budget. */
export function truncateForScrub(s: string): string {
  return s.length > MAX_SCRUB_CHARS ? `${s.slice(0, MAX_SCRUB_CHARS)}...[truncated]` : s;
}

/** Mask secrets, emails, phone numbers and URL query strings inside free text. */
export function scrubString(input: string): string {
  return truncateForScrub(input)
    .replace(URL_QUERY_RE, "$1")
    .replace(JWT_RE, REDACTED)
    .replace(BEARER_RE, `$1 ${REDACTED}`)
    .replace(API_KEY_RE, REDACTED)
    .replace(SK_DASH_RE, REDACTED)
    .replace(SECRET_KV_RE, `$1"${REDACTED}"`)
    .replace(EMAIL_RE, REDACTED)
    .replace(PHONE_RE, REDACTED);
}

/** Drop the query string and fragment from a URL or path (tokens live there). */
export function stripQuery(url: string): string {
  const i = url.search(/[?#]/);
  return i === -1 ? url : url.slice(0, i);
}

const URL_KEYS = new Set(["url", "to", "from", "href", "http.url", "http.target", "url.full", "referrer"]);
const QUERY_KEYS = new Set(["http.query", "url.query", "url.fragment", "query", "query_string", "http.fragment"]);

/** Recursively redact sensitive keys and mask sensitive-looking string content. */
export function scrubValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (depth > 6) return typeof value === "object" ? "[truncated]" : value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const lk = k.toLowerCase();
    if (isSensitiveKey(k) || QUERY_KEYS.has(lk)) out[k] = REDACTED;
    else if (URL_KEYS.has(lk) && typeof v === "string") out[k] = scrubString(stripQuery(v));
    else out[k] = scrubValue(v, depth + 1);
  }
  return out;
}

/** Sentry `beforeSendLog`. Fails closed: a log that cannot be scrubbed is dropped. */
export function scrubLog(log: Log): Log | null {
  try {
    return {
      ...log,
      message: typeof log.message === "string" ? scrubString(log.message) : log.message,
      attributes: log.attributes ? (scrubValue(log.attributes) as Log["attributes"]) : log.attributes,
    };
  } catch {
    return null;
  }
}

/** Sentry `beforeBreadcrumb`: message and data, query strings stripped. Fails closed. */
export function scrubBreadcrumb(b: Breadcrumb, _hint?: unknown): Breadcrumb | null {
  try {
    return {
      ...b,
      message: typeof b.message === "string" ? scrubString(b.message) : b.message,
      data: b.data ? (scrubValue(b.data) as Record<string, unknown>) : b.data,
    };
  } catch {
    return null;
  }
}

type Scrubbable = ErrorEvent | TransactionEvent;

function isFeedback(event: Scrubbable): boolean {
  return (event as { type?: string }).type === "feedback" || Boolean(event.contexts?.feedback);
}

/** Request, extras, tags, contexts, user and breadcrumbs: shared by errors, transactions and feedback. */
function scrubCommon(event: Scrubbable): void {
  const feedback = isFeedback(event);
  if (event.request) {
    if (event.request.url) event.request.url = scrubString(stripQuery(event.request.url));
    delete event.request.cookies;
    event.request.query_string = undefined;
    if (event.request.headers) event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
    if (event.request.data) event.request.data = scrubValue(event.request.data);
  }
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.tags) event.tags = scrubValue(event.tags) as typeof event.tags;
  if (event.contexts) {
    // Feedback keeps ONLY the reporter's own form (contexts.feedback); everything else is scrubbed.
    const fb = feedback ? event.contexts.feedback : undefined;
    event.contexts = scrubValue(event.contexts) as typeof event.contexts;
    if (fb) event.contexts.feedback = fb;
  }
  if (event.user) {
    if (feedback) {
      // The reporter typed their name and email in on purpose; drop everything else.
      const { id, name, email, username } = event.user;
      event.user = { id, name, email, username };
    } else {
      delete event.user.email;
      delete event.user.ip_address;
    }
  }
  if (event.message) event.message = scrubString(event.message);
  if (event.logentry?.message) event.logentry.message = scrubString(event.logentry.message);
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => scrubBreadcrumb(b)).filter((b): b is Breadcrumb => b !== null);
  }
}

/** Sentry `beforeSend` for error and feedback events. Fails closed: dropped if scrubbing throws. */
export function scrubEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent | null {
  try {
    scrubCommon(event);
    for (const ex of event.exception?.values ?? []) {
      if (typeof ex.value === "string") ex.value = scrubString(ex.value);
      for (const f of ex.stacktrace?.frames ?? []) {
        if (f.vars) f.vars = scrubValue(f.vars) as typeof f.vars;
      }
    }
    return event;
  } catch {
    return null;
  }
}

/** Sentry `beforeSendTransaction`: request url, spans and their http/url data. Fails closed. */
export function scrubTransaction(event: TransactionEvent, _hint?: EventHint): TransactionEvent | null {
  try {
    scrubCommon(event);
    if (event.transaction) event.transaction = scrubString(stripQuery(event.transaction));
    event.spans = event.spans?.map((s) => ({
      ...s,
      description: s.description ? scrubString(s.description) : s.description,
      data: s.data ? (scrubValue(s.data) as typeof s.data) : s.data,
    }));
    return event;
  } catch {
    return null;
  }
}
