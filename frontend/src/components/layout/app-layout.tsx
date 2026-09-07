import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";
import { InviteMemberModal } from "@/components/workspace/invite-member-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageLoader } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { WorkspaceProvider } from "@/context/workspace-context";
import { useAuth } from "@/hooks/use-auth";
import {
  useDeleteWorkspace,
  useWorkspace,
  useWorkspaceMembers,
} from "@/hooks/use-workspaces";
import { getApiErrorMessage, hasPermission, roleName } from "@/lib/utils";

export function AppLayout() {
  const { workspaceId = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const workspaceQuery = useWorkspace(workspaceId);
  const membersQuery = useWorkspaceMembers(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (workspaceQuery.isPending) {
    return <PageLoader label="Loading workspace…" />;
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Workspace unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {workspaceQuery.error
              ? getApiErrorMessage(
                  workspaceQuery.error,
                  "You may not have access to this workspace."
                )
              : "This workspace does not exist."}
          </p>
          <Button className="mt-5" onClick={() => navigate("/")}>
            Go to my workspaces
          </Button>
        </div>
      </div>
    );
  }

  const workspace = workspaceQuery.data;
  const members = membersQuery.data?.members ?? [];
  const roles = membersQuery.data?.roles ?? [];

  const currentMember = members.find((m) =>
    typeof m.userId === "string" ? m.userId === user?._id : m.userId._id === user?._id
  );
  const myRole = currentMember ? roleName(currentMember.role) : undefined;
  const canDelete = hasPermission(myRole, "DELETE_WORKSPACE");

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspace.mutateAsync(workspace._id);
      toast.success("Workspace deleted");
      setDeleteOpen(false);
      navigate("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete workspace"));
    }
  };

  return (
    <WorkspaceProvider
      workspace={workspace}
      members={members}
      roles={roles}
      membersLoading={membersQuery.isPending}
      currentUserId={user?._id}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onRequestCreate={() => setCreateOpen(true)}
          onRequestInvite={() => setInviteOpen(true)}
          onRequestSettings={() => setSettingsOpen(true)}
          onRequestDelete={() => setDeleteOpen(true)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onOpenSidebar={() => setSidebarOpen(true)}
            onRequestInvite={() => setInviteOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <CreateWorkspaceModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        workspace={workspace}
      />
      {canDelete && (
        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Delete this workspace?"
          description={`"${workspace.name}" and all of its projects and tasks will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete workspace"
          loading={deleteWorkspace.isPending}
          onConfirm={() => void handleDeleteWorkspace()}
        />
      )}
    </WorkspaceProvider>
  );
}
