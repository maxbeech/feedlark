"use client";

import { useActionState } from "react";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { createBoardAction } from "@/lib/actions/admin";

export function NewBoardForm({ workspaceId, canPrivate }: { workspaceId: string; canPrivate: boolean }) {
  const [state, action, pending] = useActionState(createBoardAction, {} as { error?: string });
  return (
    <Card className="p-6">
      <form action={action} className="space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <div>
          <Label htmlFor="name">Board name</Label>
          <Input id="name" name="name" required placeholder="Feature Requests" maxLength={60} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} placeholder="What kind of feedback goes here?" maxLength={280} />
        </div>
        <label className={`flex items-center gap-2 text-sm ${canPrivate ? "text-ink" : "text-ink-muted"}`}>
          <input type="checkbox" name="isPrivate" disabled={!canPrivate} className="h-4 w-4 rounded border-sand-300" />
          Private board {canPrivate ? "" : "(Pro)"}
        </label>
        {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create board"}</Button>
      </form>
    </Card>
  );
}
