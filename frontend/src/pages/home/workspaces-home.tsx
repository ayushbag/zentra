import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LayoutGrid, LogOut, Moon, Plus, Sun } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/hooks/use-theme";
import { EmptyState, PageLoader } from "@/components/ui/feedback";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/badge";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspaces } from "@/hooks/use-workspaces";

export function WorkspacesHomePage() {
  const { user, logout } = useAuth();
  const { data: workspaces, isLoading } = useWorkspaces();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight text-foreground">
            Zentra
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={toggleTheme}
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Toggle dark mode"
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New workspace
          </Button>
          <DropdownMenu
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="rounded-full p-0.5 transition-opacity hover:opacity-80"
                aria-label="Account menu"
              >
                <Avatar name={user?.name} src={user?.profilePicture} size="md" />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-1">
                  <DropdownItem
                    danger
                    onClick={() => {
                      close();
                      void handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownItem>
                </div>
              </div>
            )}
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <h1 className="text-2xl font-bold text-foreground">Your workspaces</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a workspace to jump in, or create a new one.
        </p>

        <div className="mt-8">
          {isLoading ? (
            <PageLoader label="Loading workspaces…" />
          ) : workspaces && workspaces.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  type="button"
                  onClick={() => navigate(`/workspace/${ws._id}/projects`)}
                  className="group rounded-xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                      {ws.name.charAt(0).toUpperCase()}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                  </div>
                  <h3 className="mt-4 truncate text-base font-semibold text-foreground">
                    {ws.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {ws.description || "No description"}
                  </p>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-ring hover:text-primary"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Plus className="h-4 w-4" />
                  Create workspace
                </span>
              </button>
            </div>
          ) : (
            <EmptyState
              icon={<LayoutGrid className="h-6 w-6" />}
              title="No workspaces yet"
              description="Create a workspace to organize projects, tasks and your team."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create your first workspace
                </Button>
              }
            />
          )}
        </div>
      </main>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
