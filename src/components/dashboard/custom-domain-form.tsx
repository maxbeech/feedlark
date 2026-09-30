"use client";

import { useActionState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { updateCustomDomainAction, type CustomDomainState } from "@/lib/actions/admin";
import type { DnsRecord } from "@/lib/custom-domains";

function RecordHint({ record, certificate }: { record: DnsRecord | null; certificate?: string | null }) {
  if (!record) {
    return <p className="text-xs text-ink-muted">Saved. We could not read the DNS record just now. Reload this page in a minute to see it.</p>;
  }
  return (
    <div className="rounded-lg bg-cream px-3 py-2 text-xs text-ink-muted">
      <p>Add this record at your DNS provider:</p>
      <p className="mt-1 font-mono text-ink">{record.type} {record.name} {record.value}</p>
      <p className="mt-1">
        {certificate === "issued" || certificate === "active"
          ? "Your domain is live."
          : "Your board serves on the domain once the record resolves, usually within a minute or two."}
      </p>
    </div>
  );
}

export function CustomDomainForm({
  workspaceId,
  current,
  isPro,
  record,
  certificate,
}: {
  workspaceId: string;
  current: string | null;
  isPro: boolean;
  record: DnsRecord | null;
  certificate: string | null;
}) {
  const [state, action, pending] = useActionState(updateCustomDomainAction, {} as CustomDomainState);
  const shown = state.ok && !state.removed ? state.record ?? null : record;

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
            Use a name under your own domain. Save it, then add the DNS record shown here. Leave the field empty to disconnect.
          </p>
          {(current || (state.ok && !state.removed)) && !state.removed && <RecordHint record={shown} certificate={state.ok ? null : certificate} />}
          {state.error && <p className="text-sm text-red-700">{state.error}</p>}
          {state.ok && <p className="text-sm text-spruce-700">{state.removed ? "Domain disconnected." : "Saved."}</p>}
          <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save domain"}</Button>
        </form>
      )}
    </Card>
  );
}
