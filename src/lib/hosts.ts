// Hosts that serve Feedlark itself. Anything else is a request on a customer's
// custom domain and gets looked up in the workspaces table.
const OWN_HOSTS = new Set(["feedlark.com", "www.feedlark.com", "localhost", "127.0.0.1"]);

// Helm7 serves every product on <slug>.helm7.app and <slug>.edge.helm7.app, and
// its health probe calls the container on 127.0.0.1. None of those may reach the
// custom-domain lookup: it would cost a Supabase round trip per request, and
// redirecting the probe would fail the first deploy's health check.
export function isOwnHost(host: string): boolean {
  return OWN_HOSTS.has(host) || host.endsWith(".helm7.app");
}
