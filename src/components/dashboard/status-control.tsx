"use client";

import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { POST_STATUSES } from "@/lib/db/schema";
import { statusLabel } from "@/lib/utils";
import { setPostStatusAction } from "@/lib/actions/admin";

// "complete" is owned by the ship-loop ("Ship it"), never set by hand.
const MANUAL_STATUSES = POST_STATUSES.filter((s) => s !== "complete");

export function StatusControl({ postId, status }: { postId: string; status: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  // A shipped post is locked to its changelog; offer "Reopen" to unlink + edit again.
  if (status === "complete") {
    return (
      <form action={setPostStatusAction} className="inline-flex items-center gap-2">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="status" value="in_progress" />
        <span className="inline-flex items-center rounded-full bg-spruce-100 px-3 py-1 text-sm font-medium text-spruce-700">Shipped</span>
        <button type="submit" className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Reopen
        </button>
      </form>
    );
  }

  return (
    <form ref={formRef} action={setPostStatusAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="postId" value={postId} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-9 rounded-xl border border-sand-200 bg-white px-2.5 text-sm font-medium text-ink shadow-sm focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
      >
        {MANUAL_STATUSES.map((s) => (
          <option key={s} value={s}>{statusLabel(s)}</option>
        ))}
      </select>
    </form>
  );
}
