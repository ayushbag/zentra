import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceContext } from "@/context/workspace-context";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({
  onRequestCreate,
}: {
  onRequestCreate: () => void;
}) {
  const { workspace } = useWorkspaceContext();
  const { data: workspaces, isLoading } = useWorkspaces();
  const navigate = useNavigate();

  return (
    <DropdownMenu
      width="w-full"
      align="left"
      className="block"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-sidebar-border hover:bg-sidebar-accent",
            open && "border-sidebar-border bg-sidebar-accent"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {workspace.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-sidebar-foreground">
              {workspace.name}
            </span>
            <span className="block text-[11px] text-sidebar-foreground/60">Workspace</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <p className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
            Workspaces
          </p>
          {isLoading ? (
            <div className="space-y-1.5 p-1.5">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto p-1">
              {workspaces?.map((ws) => {
                const active = ws._id === workspace._id;
                return (
                  <button
                    key={ws._id}
                    type="button"
                    onClick={() => {
                      close();
                      navigate(`/workspace/${ws._id}/projects`);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                      active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                      {ws.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {ws.name}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
              {!isLoading && workspaces?.length === 0 && (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  No workspaces yet
                </p>
              )}
            </div>
          )}
          <div className="mt-1 border-t border-border p-1">
            <DropdownItem
              onClick={() => {
                close();
                onRequestCreate();
              }}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-primary">Create workspace</span>
            </DropdownItem>
          </div>
        </div>
      )}
    </DropdownMenu>
  );
}
