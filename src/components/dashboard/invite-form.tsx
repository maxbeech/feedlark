"use client";

import { useActionState, useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { inviteMemberAction, type TeamResult } from "@/lib/actions/team";

export function InviteForm({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState<TeamResult, FormData>(inviteMemberAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-2 sm:flex-row">
      <Input name="email" type="email" required placeholder="teammate@company.com" disabled={disabled} className="flex-1" />
      <Button type="submit" disabled={pending || disabled}>
        <UserPlus className="h-4 w-4" /> {pending ? "Sending…" : "Send invite"}
      </Button>
      {state.error && <p role="alert" className="w-full text-sm text-red-700 sm:order-last">{state.error}</p>}
      {state.ok && <p className="w-full text-sm font-medium text-spruce-700 sm:order-last">Invite sent.</p>}
    </form>
  );
}
