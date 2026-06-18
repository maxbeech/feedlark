"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { addCommentAction, type PublicResult } from "@/lib/actions/public";

export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState<PublicResult, FormData>(addCommentAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <Card className="p-4">
      <form ref={ref} action={action} className="space-y-3">
        <input type="hidden" name="postId" value={postId} />
        <Textarea name="body" rows={3} required placeholder="Add a comment…" maxLength={4000} />
        <div className="grid grid-cols-2 gap-3">
          <Input name="authorName" placeholder="Name (optional)" maxLength={80} />
          <Input name="authorEmail" type="email" placeholder="Email (optional)" />
        </div>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-700">Comment added.</p>}
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Posting…" : "Comment"}</Button>
      </form>
    </Card>
  );
}
