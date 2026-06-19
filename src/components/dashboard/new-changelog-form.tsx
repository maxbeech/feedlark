"use client";

import { useActionState } from "react";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { createChangelogAction } from "@/lib/actions/changelog";

export function NewChangelogForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(createChangelogAction, {} as { error?: string });
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-ink">New changelog entry</h2>
      <form action={action} className="space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Dark mode is here" maxLength={120} />
        </div>
        <div>
          <Label htmlFor="category">Type</Label>
          <select id="category" name="category" className="h-11 w-full rounded-xl border border-sand-300 bg-white px-3 text-sm text-ink shadow-sm focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100">
            <option value="new">New</option>
            <option value="improved">Improved</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="body">Details (Markdown supported)</Label>
          <Textarea id="body" name="body" rows={5} placeholder="What changed and why it matters…" maxLength={8000} />
        </div>
        {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Publishing…" : "Publish entry"}</Button>
      </form>
    </Card>
  );
}
