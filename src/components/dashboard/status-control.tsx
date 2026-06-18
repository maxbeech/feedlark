"use client";

import { useRef } from "react";
import { POST_STATUSES } from "@/lib/db/schema";
import { statusLabel } from "@/lib/utils";
import { setPostStatusAction } from "@/lib/actions/admin";

export function StatusControl({ postId, status }: { postId: string; status: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={setPostStatusAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="postId" value={postId} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-9 rounded-xl border border-slate-300 bg-white px-2 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
      >
        {POST_STATUSES.map((s) => (
          <option key={s} value={s}>{statusLabel(s)}</option>
        ))}
      </select>
    </form>
  );
}
