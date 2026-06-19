"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { submitPostAction, type PublicResult } from "@/lib/actions/public";

export function SubmitPostForm({ boardId }: { boardId: string }) {
  const [state, action, pending] = useActionState<PublicResult, FormData>(submitPostAction, {});
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      const t = setTimeout(() => setOpen(false), 1800);
      return () => clearTimeout(t);
    }
  }, [state.ok]);

  if (!open) {
    return (
      <Card className="p-4">
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-left text-sm text-ink-muted transition-colors hover:bg-sand-100">
          <Lightbulb className="h-4 w-4 text-brand-500" /> Suggest a feature or report an issue
        </button>
        {state.ok && <p className="mt-2 text-center text-sm font-medium text-spruce-700">Thanks. Your idea is posted.</p>}
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <form ref={formRef} action={action} className="space-y-3">
        <input type="hidden" name="boardId" value={boardId} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <div>
          <Label htmlFor="title">Your idea</Label>
          <Input id="title" name="title" required minLength={3} maxLength={140} placeholder="Add dark mode" autoFocus />
        </div>
        <div>
          <Label htmlFor="body">Details (optional)</Label>
          <Textarea id="body" name="body" rows={3} maxLength={4000} placeholder="Why would this help you?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input name="authorName" placeholder="Name (optional)" maxLength={80} />
          <Input name="authorEmail" type="email" placeholder="Email to hear when it ships" />
        </div>
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{pending ? "Posting…" : "Post idea"}</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
