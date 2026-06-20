/**
 * Plan gating. The whole point of Feedlark vs Canny: the FREE plan is
 * genuinely generous, with unlimited end-users, posts, votes, comments, boards,
 * roadmap, changelog and widget. We only ever gate "team/brand" niceties,
 * never the core product or the number of voters ("no growth tax").
 */
export type Plan = "free" | "pro";

export interface PlanLimits {
  /** Boards allowed. null = unlimited. */
  maxBoards: number | null;
  /** Admin seats included. */
  seats: number;
  /** Can hide the "Powered by Feedlark" badge. */
  canRemoveBranding: boolean;
  /** Can mark a board private. */
  canPrivateBoards: boolean;
  /** Can map a custom domain. */
  canCustomDomain: boolean;
  /** Smart (similarity-based) duplicate detection of incoming feedback. */
  canUseAI: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxBoards: null, // unlimited, deliberately, unlike Canny
    seats: 1,
    canRemoveBranding: false,
    canPrivateBoards: false,
    canCustomDomain: false,
    canUseAI: false,
  },
  pro: {
    maxBoards: null,
    seats: 10,
    canRemoveBranding: true,
    canPrivateBoards: true,
    canCustomDomain: true,
    canUseAI: true,
  },
};

export const PRO_PRICE_MONTHLY = 19; // USD per admin seat / mo, never per voter

export function limitsFor(plan: string): PlanLimits {
  return PLAN_LIMITS[(plan as Plan)] ?? PLAN_LIMITS.free;
}

/** Seats a plan has left given how many are already used (members + invites). */
export function seatsRemaining(plan: string, used: number): number {
  return Math.max(0, limitsFor(plan).seats - used);
}

/** Things that are ALWAYS free (used in marketing copy + as a guard list). */
export const ALWAYS_FREE = [
  "Unlimited end-users (voters)",
  "Unlimited posts, votes & comments",
  "Unlimited boards",
  "Public roadmap",
  "Changelog + 'what's new' widget",
  "Embeddable feedback widget",
] as const;

/** What Pro adds on top. Single source of truth for billing + pricing UI. */
export const PRO_FEATURES = [
  "Invite your team (up to 10 admin seats)",
  "Private boards",
  "Custom domain",
  "Remove Feedlark branding",
  "Smart duplicate detection & one-click merge",
  "Internal team notes on any post",
  "CSV export of all feedback",
] as const;
