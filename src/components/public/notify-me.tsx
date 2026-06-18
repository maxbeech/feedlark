"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button, Input } from "@/components/ui";

/**
 * Optional email capture so a voter is notified when this request ships.
 * Posting an email to the vote endpoint also registers their vote.
 */
export function NotifyMe({ postId }: { postId: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setPending(true);
    try {
      await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } finally {
      setPending(false);
    }
  }

  if (done) return <p className="mt-4 text-sm font-medium text-emerald-700">✓ We&apos;ll email you when this ships.</p>;

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row">
      <div className="flex flex-1 items-center gap-2">
        <Bell className="h-4 w-4 shrink-0 text-ink-muted" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email me when this ships" className="bg-white" />
      </div>
      <Button type="submit" size="md" variant="outline" disabled={pending}>{pending ? "…" : "Notify me"}</Button>
    </form>
  );
}
