import { LogOut, Menu, Moon, Sun, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { toggleTheme } from "@/hooks/use-theme";
import { useWorkspaceContext } from "@/context/workspace-context";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/utils";

export function Header({
  onOpenSidebar,
  onRequestInvite,
}: {
  onOpenSidebar: () => void;
  onRequestInvite: () => void;
}) {
  const { user, logout } = useAuth();
  const { myRole } = useWorkspaceContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Toggle dark mode"
      >
        <Sun className="hidden h-5 w-5 dark:block" />
        <Moon className="h-5 w-5 dark:hidden" />
      </button>

      {hasPermission(myRole, "ADD_MEMBER") && (
        <Button
          variant="subtle"
          size="sm"
          onClick={onRequestInvite}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          <span className="hidden sm:inline">Invite</span>
        </Button>
      )}

      <DropdownMenu
        trigger={({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80"
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
                onClick={() => {
                  close();
                  navigate("/");
                }}
              >
                My workspaces
              </DropdownItem>
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
    </header>
  );
}
