import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Next compiles JSX with the automatic runtime; match it so components render in tests.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Next resolves this itself; outside Next the package does not exist.
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Importing the real Sentry SDK is slow on a cold, loaded machine.
    testTimeout: 20_000,
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
