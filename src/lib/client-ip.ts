// The address rate limits are keyed on. Helm7's edge sets X-Helm7-Client-Ip
// itself, overwriting anything the caller sent, so it is the one header a
// visitor cannot forge. X-Forwarded-For is only trusted from its LAST hop (the
// one our proxy appended): taking the first entry, as this used to, lets anyone
// send their own value and get a fresh rate-limit bucket on every request.
export function clientIpFrom(h: Pick<Headers, "get">): string {
  const own = h.get("x-helm7-client-ip")?.trim();
  if (own) return own;
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return hops[hops.length - 1] ?? "0.0.0.0";
}
