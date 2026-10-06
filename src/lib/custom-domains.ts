import "server-only";
import { normaliseCustomDomain } from "@/lib/custom-domain-name";
import { captureServerError } from "@/lib/capture";

/**
 * Customer custom domains, attached to Feedlark's own Helm7 product.
 *
 * Helm7 issues the certificate and routes the host to this app; the middleware
 * then finds the workspace by host. Nothing here is retried or faked: if Helm7
 * is not configured or refuses, the caller gets the reason and the workspace is
 * left as it was, because a saved domain that serves nothing is worse than an
 * error the customer can read.
 *
 * Needs HELM7_API_KEY and HELM7_PRODUCT_ID. The key must be confined to this
 * one product with domain read/write only; an organisation-wide key here would
 * let a bug in a form reach every other product in the account.
 */

export type DnsRecord = { type: string; name: string; value: string };
export type DomainState = { record: DnsRecord | null; verification: string | null; certificate: string | null };
export type DomainResult<T = DomainState> = ({ ok: true } & T) | { ok: false; error: string };

type HelmDomain = {
  id: string;
  hostname: string;
  verification?: string | null;
  certificate?: string | null;
  expected_record?: DnsRecord | null;
};

const NOT_CONFIGURED = "Custom domains are not available right now. Please contact support.";

function config() {
  const key = process.env.HELM7_API_KEY;
  const productId = process.env.HELM7_PRODUCT_ID;
  if (!key || !productId) return null;
  const base = (process.env.HELM7_API_URL ?? "https://www.helm7.com/api").replace(/\/+$/, "");
  return { key, url: `${base}/v1/products/${encodeURIComponent(productId)}/domains` };
}

async function call(cfg: NonNullable<ReturnType<typeof config>>, path: string, init: RequestInit = {}) {
  const res = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${cfg.key}`, "content-type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as
    | { data?: HelmDomain[]; error?: { code?: string; message?: string } }
    | null;
  return { res, body };
}

async function list(cfg: NonNullable<ReturnType<typeof config>>): Promise<HelmDomain[]> {
  const { res, body } = await call(cfg, "");
  if (!res.ok) throw new Error(body?.error?.message ?? `Helm7 answered ${res.status}`);
  return body?.data ?? [];
}

const stateOf = (d: HelmDomain): DomainState => ({
  record: d.expected_record ?? null,
  verification: d.verification ?? null,
  certificate: d.certificate ?? null,
});

/** Attach a customer's host, or return the existing attachment (a retried save must not fail on its own first attempt). */
export async function attachCustomDomain(input: string): Promise<DomainResult<DomainState & { hostname: string }>> {
  const name = normaliseCustomDomain(input);
  if (!name.ok) return name;
  const cfg = config();
  if (!cfg) return { ok: false, error: NOT_CONFIGURED };
  try {
    let found = (await list(cfg)).find((d) => d.hostname === name.hostname);
    if (!found) {
      const { res, body } = await call(cfg, "", {
        method: "POST",
        body: JSON.stringify({ hostname: name.hostname, environment: "production" }),
      });
      if (!res.ok) {
        console.error("[custom-domain] attach refused", res.status, body?.error?.code);
        return {
          ok: false,
          error: res.status === 409
            ? "That domain is already connected to another Feedlark workspace."
            : "We could not connect that domain. Check the name and try again.",
        };
      }
      found = (await list(cfg)).find((d) => d.hostname === name.hostname);
    }
    return { ok: true, hostname: name.hostname, ...(found ? stateOf(found) : { record: null, verification: null, certificate: null }) };
  } catch (error) {
    console.error("[custom-domain] attach failed", error);
    captureServerError(error, { scope: "custom-domain-attach" });
    return { ok: false, error: "We could not reach our hosting to connect that domain. Try again in a minute." };
  }
}

/** Detach a host. A host Helm7 does not know is already gone, which is the outcome asked for. */
export async function removeCustomDomain(hostname: string): Promise<DomainResult<Record<never, never>>> {
  const cfg = config();
  if (!cfg) return { ok: false, error: NOT_CONFIGURED };
  try {
    const found = (await list(cfg)).find((d) => d.hostname === hostname.toLowerCase());
    if (!found) return { ok: true };
    const { res, body } = await call(cfg, `/${encodeURIComponent(found.id)}?confirm=true`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) {
      console.error("[custom-domain] remove refused", res.status, body?.error?.code);
      return { ok: false, error: "We could not disconnect that domain. Try again in a minute." };
    }
    return { ok: true };
  } catch (error) {
    console.error("[custom-domain] remove failed", error);
    captureServerError(error, { scope: "custom-domain-remove" });
    return { ok: false, error: "We could not reach our hosting to disconnect that domain. Try again in a minute." };
  }
}

/** Current DNS record and certificate state for a host, or null when Helm7 cannot say. */
export async function customDomainState(hostname: string): Promise<DomainState | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const found = (await list(cfg)).find((d) => d.hostname === hostname.toLowerCase());
    return found ? stateOf(found) : null;
  } catch (error) {
    console.error("[custom-domain] status failed", error);
    captureServerError(error, { scope: "custom-domain-status" });
    return null;
  }
}
