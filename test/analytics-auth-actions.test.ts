// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const state = vi.hoisted(() => ({
  allowed: true,
  user: null as { id: string; passwordHash: string; emailVerified: boolean } | null,
  passwordOk: true,
}));

class Redirect extends Error {
  constructor(public url: string) {
    super("NEXT_REDIRECT");
  }
}

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }) }));
vi.mock("@/lib/db", () => ({
  schema: { users: { id: "id", email: "email" } },
  db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => (state.user ? [state.user] : []) }) }) }) },
}));
vi.mock("@/lib/ratelimit", () => ({ checkRateLimit: async () => state.allowed, clientIp: async () => "1.2.3.4" }));
vi.mock("@/lib/auth/password", () => ({ hashPassword: async () => "hash", verifyAgainst: async () => state.passwordOk }));
vi.mock("@/lib/auth/session", () => ({
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
  authSecret: () => new TextEncoder().encode("test-secret-test-secret-test-secret"),
}));
vi.mock("@/lib/data/workspace", () => ({ createWorkspaceForUser: vi.fn() }));
vi.mock("@/lib/data/team", () => ({ ACTIVE_WS_COOKIE: "fl_ws", seatUsage: vi.fn() }));
vi.mock("@/lib/stripe-seats", () => ({ syncSeatQuantity: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(), emailConfigured: false }));

import { loginAction, signupAction } from "@/lib/actions/auth";

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

beforeEach(() => {
  state.allowed = true;
  state.user = null;
  state.passwordOk = true;
});

describe("loginAction failure reasons", () => {
  it("names a malformed form", async () => {
    expect(await loginAction({}, form({ email: "nope", password: "x" }))).toMatchObject({ reason: "invalid_input" });
  });

  it("names a rate limit", async () => {
    state.allowed = false;
    expect(await loginAction({}, form({ email: "a@example.com", password: "x" }))).toMatchObject({ reason: "rate_limited" });
  });

  it("names wrong credentials the same whether or not the account exists", async () => {
    const unknown = await loginAction({}, form({ email: "a@example.com", password: "x" }));
    state.user = { id: "usr_1", passwordHash: "h", emailVerified: true };
    state.passwordOk = false;
    const wrong = await loginAction({}, form({ email: "a@example.com", password: "x" }));
    expect(unknown.reason).toBe("invalid_credentials");
    expect(wrong.reason).toBe("invalid_credentials");
  });
});

describe("loginAction success", () => {
  it("redirects to the dashboard with a marker so the page can report `login`", async () => {
    state.user = { id: "usr_1", passwordHash: "h", emailVerified: true };
    await expect(loginAction({}, form({ email: "a@example.com", password: "x" }))).rejects.toMatchObject({
      url: expect.stringMatching(/^\/dashboard\?signed_in=[0-9a-z]+$/),
    });
  });

  it("keeps a safe `next` path and its query", async () => {
    state.user = { id: "usr_1", passwordHash: "h", emailVerified: true };
    await expect(
      loginAction({}, form({ email: "a@example.com", password: "x", next: "/dashboard/settings?a=1" })),
    ).rejects.toMatchObject({ url: expect.stringMatching(/^\/dashboard\/settings\?a=1&signed_in=[0-9a-z]+$/) });
  });
});

describe("signupAction failure reasons", () => {
  it("names a malformed form", async () => {
    expect(await signupAction({}, form({ email: "nope", password: "longenough" }))).toMatchObject({ reason: "invalid_input" });
  });

  it("names a rate limit", async () => {
    state.allowed = false;
    expect(await signupAction({}, form({ email: "a@example.com", password: "longenough" }))).toMatchObject({ reason: "rate_limited" });
  });

  it("names an email that already has an account", async () => {
    state.user = { id: "usr_1", passwordHash: "h", emailVerified: true };
    expect(await signupAction({}, form({ email: "a@example.com", password: "longenough" }))).toMatchObject({ reason: "email_taken" });
  });
});
