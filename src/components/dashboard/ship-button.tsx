"use client";

import { Rocket } from "lucide-react";
import { Button } from "@/components/ui";
import { track } from "@/lib/openhelm-analytics";
import { EVENTS, postShippedParams } from "@/lib/analytics-events";
import { shipPostAction } from "@/lib/actions/changelog";

/**
 * The "Ship it" button — starts the You-asked-we-shipped loop (see
 * src/lib/actions/changelog.ts::shipPostAction). A bare `action={form}` POST
 * has no client-side "success" to observe (server action redirects/revalidates
 * without resolving to the caller), so this tracks the admin's intent at
 * click time, same pattern as UpgradeForm.
 */
export function ShipButton({ postId, voteCount }: { postId: string; voteCount: number }) {
  return (
    <form
      action={shipPostAction}
      onSubmit={() => track(EVENTS.POST_SHIPPED, postShippedParams(postId, voteCount))}
    >
      <input type="hidden" name="postId" value={postId} />
      <Button type="submit" size="sm">
        <Rocket className="h-3.5 w-3.5" /> Ship it
      </Button>
    </form>
  );
}
