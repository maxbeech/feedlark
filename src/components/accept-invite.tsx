"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { acceptInviteAction, type TeamResult } from "@/lib/actions/team";

export function AcceptInvite({ token, workspaceName }: { token: string; workspaceName: string }) {
  const [state, action, pending] = useActionState<TeamResult, FormData>(acceptInviteAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Joining…" : `Join ${workspaceName}`}
      </Button>
    </form>
  );
}
