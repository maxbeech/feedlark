import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // Allow building even if a stray lint/type warning appears in CI; we run
  // `tsc --noEmit` + vitest separately and gate on those.
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    // Dogfood: our own public board lives at /b/feedlark; expose it under /feedback.
    return [
      { source: "/feedback", destination: "/b/feedlark", permanent: false },
      { source: "/feedback/roadmap", destination: "/b/feedlark/roadmap", permanent: false },
      { source: "/feedback/changelog", destination: "/b/feedlark/changelog", permanent: false },
      // Consolidated blog posts (SEO content audit 2026-10-07): 301 to the surviving guide.
      { source: "/blog/best-free-roadmap-tools", destination: "/blog/free-roadmap-creator-tools", permanent: true },
      { source: "/blog/feedback-widget-for-website", destination: "/blog/website-feedback-widgets-compared", permanent: true },
      { source: "/blog/feature-request-board-guide", destination: "/blog/feature-request-software-guide", permanent: true },
      { source: "/blog/product-changelog-explained", destination: "/blog/changelog-tool-guide", permanent: true },
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

// Sentry wraps the build to upload source maps (skipped without an auth token).
// tunnelRoute: true picks a random path per build so ad blockers do not drop reports.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "maxed-labs",
  project: process.env.SENTRY_PROJECT || "feedlark_web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});
