import { requireWorkspaceContext } from "@/lib/auth/guard";
import { NewBoardForm } from "@/components/dashboard/new-board-form";
import { limitsFor } from "@/lib/plans";

export default async function NewBoardPage() {
  const { workspace } = await requireWorkspaceContext();
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">New board</h1>
      <p className="mt-1 text-sm text-ink-muted">Boards are unlimited on every plan.</p>
      <div className="mt-6">
        <NewBoardForm workspaceId={workspace.id} canPrivate={limitsFor(workspace.plan).canPrivateBoards} />
      </div>
    </div>
  );
}
