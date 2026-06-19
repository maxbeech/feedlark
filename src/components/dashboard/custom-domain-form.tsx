"use client";

import { useActionState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { updateCustomDomainAction } from "@/lib/actions/admin";

export function CustomDomainForm({ workspaceId, current, isPro }: { workspaceId: string; current: string | null; isPro: boolean }) {
  const [state, action, pending] = useActionState(updateCustomDomainAction, {} as { error?: string; ok?: boolean });

  return (
    <Card className="p-6">
      <h2 className="font-semibold text-ink">Custom domain</h2>
      {!isPro ? (
        <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm text-ink-muted">
          Host your board on your own domain (e.g. <span className="font-mono">feedback.yourcompany.com</span>) on the Pro plan.
        </p>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div>
            <Label htmlFor="customDomain">Domain</Label>
            <Input id="customDomain" name="customDomain" defaultValue={current ?? ""} placeholder="feedback.yourcompany.com" />
          </div>
          <p className="text-xs text-ink-muted">
            Add a CNAME from your domain to <span className="font-mono">cname.vercel-dns.com</span>, then save it here. Once the domain is connected, your board serves on it automatically.
          </p>
          {state.error && <p className="text-sm text-red-700">{state.error}</p>}
          {state.ok && <p className="text-sm text-spruce-700">Saved.</p>}
          <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save domain"}</Button>
        </form>
      )}
    </Card>
  );
}
