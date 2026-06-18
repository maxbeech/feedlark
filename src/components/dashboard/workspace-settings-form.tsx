"use client";

import { useActionState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { updateWorkspaceAction } from "@/lib/actions/admin";

export function WorkspaceSettingsForm({
  workspaceId,
  name,
  accentColor,
}: {
  workspaceId: string;
  name: string;
  accentColor: string;
}) {
  const [state, action, pending] = useActionState(updateWorkspaceAction, {} as { error?: string; ok?: boolean });
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-ink">Workspace</h2>
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={name} required maxLength={80} />
        </div>
        <div>
          <Label htmlFor="accentColor">Accent colour</Label>
          <input id="accentColor" name="accentColor" type="color" defaultValue={accentColor} className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300" />
        </div>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-700">Saved.</p>}
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
      </form>
    </Card>
  );
}
