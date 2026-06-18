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
    return [
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
