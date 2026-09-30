import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Feedlark runs on Helm7, not Vercel. Anything that names Vercel either does
// nothing there or silently changes behaviour: `VERCEL_*` checks are always
// unset so a branch guarded by one is dead, `x-vercel-*` headers never arrive,
// and a `maxDuration` export is ignored. Keep them out.
//
// Files marked GENERATED are copies of the shared service clients; their
// canonical source is edited elsewhere, so they are not policed here.

const TOP_LEVEL = ["next.config.mjs", "sentry.server.config.ts", "sentry.edge.config.ts", "instrumentation.ts", "instrumentation-client.ts"];

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) sourceFiles(p, found);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry)) found.push(p);
  }
  return found;
}

describe("nothing in the app depends on Vercel", () => {
  const files = [...sourceFiles("src"), ...TOP_LEVEL.filter(existsSync)].filter(
    (f) => !/GENERATED/.test(readFileSync(f, "utf8").slice(0, 400)),
  );

  it("finds the source to police", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("names Vercel nowhere in application code", () => {
    const offenders = files.filter((f) => /vercel/i.test(readFileSync(f, "utf8")));
    expect(offenders, `These mention Vercel: ${offenders.join(", ")}`).toEqual([]);
  });

  it("exports no maxDuration", () => {
    const durations = files.filter((f) => /export const maxDuration/.test(readFileSync(f, "utf8")));
    expect(durations, `maxDuration is a Vercel-only setting: ${durations.join(", ")}`).toEqual([]);
  });

  it("has no Vercel package, CLI script or vercel.json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const packages = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((n) => n === "vercel" || n.startsWith("@vercel/"));
    expect(packages).toEqual([]);
    const scripts = Object.entries(pkg.scripts ?? {}).filter(([, cmd]) => /\bvercel\b/.test(cmd));
    expect(scripts).toEqual([]);
    expect(existsSync("vercel.json")).toBe(false);
  });

  it("starts on the port Helm7 assigns", () => {
    // Helm7 runs `npm start` with PORT set; a hard-coded port leaves the health
    // check probing one nothing listens on.
    const start = JSON.parse(readFileSync("package.json", "utf8")).scripts.start as string;
    expect(start).toContain("${PORT");
  });

  it("guards every cron route with the fail-closed check", () => {
    const crons = sourceFiles(join("src", "app", "api", "cron")).filter((f) => f.endsWith("route.ts"));
    expect(crons.length).toBeGreaterThan(0);
    for (const f of crons) expect(readFileSync(f, "utf8"), f).toContain("checkCronAuth(");
  });
});
