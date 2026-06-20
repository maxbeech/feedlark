import { ExternalLink, LayoutGrid, Megaphone, Settings, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { NavTabs } from "@/components/nav-tabs";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { requireWorkspaceContext } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/actions/auth";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const links = [
  { href: "/dashboard", label: "Boards", icon: LayoutGrid },
  { href: "/dashboard/changelog", label: "Changelog", icon: Megaphone },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { workspace, workspaces } = await requireWorkspaceContext();
  const publicUrl = absoluteUrl(`/b/${workspace.slug}`);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-sand-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo />
            {workspaces.length > 1 ? (
              <div className="hidden sm:block"><WorkspaceSwitcher current={{ id: workspace.id, name: workspace.name }} workspaces={workspaces.map((m) => ({ id: m.ws.id, name: m.ws.name }))} /></div>
            ) : (
              <span className="hidden text-sm text-ink-muted sm:inline">/ {workspace.name}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800">
              View live board <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <form action={logoutAction}>
              <button className="text-sm text-ink-muted hover:text-ink">Log out</button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-2">
          <NavTabs tabs={links} />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
