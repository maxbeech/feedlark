import "server-only";
import { createHash } from "node:crypto";
import { analyticsPlanFor, type AnalyticsIdentity } from "@/lib/analytics-events";

/**
 * Server side of the OpenHelm journey contract: the pseudonymous reference and
 * plan the browser sets as the GA user properties `oh_user_ref` and `oh_plan`.
 *
 * The ref is the first 16 hex characters of SHA-256 over the user id, computed
 * here so the raw id never reaches the browser or GA. Never pass an email.
 */
export function analyticsUserRef(userId: string): string {
  return createHash("sha256").update(userId, "utf8").digest("hex").slice(0, 16);
}

export function buildAnalyticsIdentity(userId: string, workspacePlan: string | null | undefined): AnalyticsIdentity {
  return { userRef: analyticsUserRef(userId), plan: analyticsPlanFor(workspacePlan) };
}
