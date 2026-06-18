"use client";

import { useActionState, useEffect, useState } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { editPostAction, editBoardAction } from "@/lib/actions/moderation";

export function EditPostForm({ postId, title, body }: { postId: string; title: string; body: string }) {
  const [state, action, pending] = useActionState(editPostAction, {} as { error?: string; ok?: boolean });
  const [open, setOpen] = useState(false);
  useEffect(() => { if (state.ok) setOpen(false); }, [state.ok]);

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Edit</Button>;
  return (
    <form action={action} className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4">
      <input type="hidden" name="postId" value={postId} />
      <div><Label htmlFor="ep-title">Title</Label><Input id="ep-title" name="title" defaultValue={title} required maxLength={140} /></div>
      <div><Label htmlFor="ep-body">Details</Label><Textarea id="ep-body" name="body" defaultValue={body} rows={3} maxLength={4000} /></div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}

export function EditBoardForm({ boardId, name, description }: { boardId: string; name: string; description: string }) {
  const [state, action, pending] = useActionState(editBoardAction, {} as { error?: string; ok?: boolean });
  const [open, setOpen] = useState(false);
  useEffect(() => { if (state.ok) setOpen(false); }, [state.ok]);

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Edit board</Button>;
  return (
    <form action={action} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <input type="hidden" name="boardId" value={boardId} />
      <div><Label htmlFor="eb-name">Board name</Label><Input id="eb-name" name="name" defaultValue={name} required maxLength={60} /></div>
      <div><Label htmlFor="eb-desc">Description</Label><Textarea id="eb-desc" name="description" defaultValue={description} rows={2} maxLength={280} /></div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
