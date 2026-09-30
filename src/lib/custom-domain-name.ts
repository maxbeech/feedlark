// A customer's board lives on a name under their own domain, so it takes a
// CNAME. A registration's bare domain cannot (DNS forbids a CNAME there) and
// Helm7 would also attach its www name, which is not what anyone asked for. The
// second-level rule mirrors the hosting platform's: it is not a full public
// suffix list, only right for the registrations customers actually bring.
const SECOND_LEVEL = new Set(["co", "com", "org", "net", "ac", "gov", "ltd", "plc", "me", "or", "ne"]);

// Names that would shadow Feedlark itself or the hosting it runs on.
const RESERVED = /(^|\.)(feedlark\.com|helm7\.app|helm7\.com)$/;

export type CustomDomainName = { ok: true; hostname: string } | { ok: false; error: string };

export function normaliseCustomDomain(input: string): CustomDomainName {
  const hostname = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/?#].*$/, "").replace(/\.$/, "");
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(hostname) || hostname.length > 253) {
    return { ok: false, error: "Enter a valid domain like feedback.yourcompany.com" };
  }
  const labels = hostname.split(".");
  const bare = labels.length === 2 || (labels.length === 3 && SECOND_LEVEL.has(labels[1]) && labels[2].length === 2);
  if (bare) return { ok: false, error: "Use a name under your domain, like feedback.yourcompany.com, not the bare domain." };
  if (RESERVED.test(hostname)) return { ok: false, error: "That domain cannot be used for a board." };
  return { ok: true, hostname };
}
