/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow building even if a stray lint/type warning appears in CI; we run
  // `tsc --noEmit` + vitest separately and gate on those.
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    // Dogfood: our own public board lives at /b/feedlark; expose it under /feedback.
    return [
      { source: "/feedback", destination: "/b/feedlark", permanent: false },
      { source: "/feedback/roadmap", destination: "/b/feedlark/roadmap", permanent: false },
      { source: "/feedback/changelog", destination: "/b/feedlark/changelog", permanent: false },
    ];
  },
  async headers() {
    // Baseline hardening applied to every response.
    const baseSecurity = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
    ];
    // Clickjacking protection for surfaces that must NOT be framed. Public board
    // routes (/b/*) are deliberately excluded — the embeddable widget iframes them.
    const noFrame = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    ];
    return [
      { source: "/:path*", headers: baseSecurity },
      { source: "/dashboard/:path*", headers: noFrame },
      { source: "/login", headers: noFrame },
      { source: "/signup", headers: noFrame },
      { source: "/reset", headers: noFrame },
      { source: "/forgot", headers: noFrame },
      { source: "/check-email", headers: noFrame },
      {
        // The embeddable widget script must be loadable cross-origin.
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
        ],
      },
      {
        source: "/api/widget/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
