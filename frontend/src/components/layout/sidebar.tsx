import { LayoutDashboard, FolderKanban, Settings, Trash2, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { cn, hasPermission } from "@/lib/utils";
import { useWorkspaceContext } from "@/context/workspace-context";

export function Sidebar({
  open,
  onClose,
  onRequestCreate,
  onRequestInvite,
  onRequestSettings,
  onRequestDelete,
}: {
  open: boolean;
  onClose: () => void;
  onRequestCreate: () => void;
  onRequestInvite: () => void;
  onRequestSettings: () => void;
  onRequestDelete: () => void;
}) {
  const { workspaceId, myRole } = useWorkspaceContext();

  const navItems = [
    {
      to: `/workspace/${workspaceId}`,
      label: "Overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: `/workspace/${workspaceId}/projects`,
      label: "Projects",
      icon: FolderKanban,
      end: false,
    },
    {
      to: `/workspace/${workspaceId}/members`,
      label: "Members",
      icon: Users,
      end: false,
    },
  ];


  const content = (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-4 pb-2">
        <WorkspaceSwitcher onRequestCreate={onRequestCreate} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-3 py-3">
        {hasPermission(myRole, "ADD_MEMBER") && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestInvite();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Users className="h-4 w-4 shrink-0" />
            Invite people
          </button>
        )}
        {hasPermission(myRole, "MANAGE_WORKSPACE_SETTINGS") && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestSettings();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Workspace settings
          </button>
        )}
        {hasPermission(myRole, "DELETE_WORKSPACE") && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestDelete();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Delete workspace
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
