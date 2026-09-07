import { Navigate } from "react-router-dom";
import { PageLoader } from "@/components/ui/feedback";
import { WorkspacesHomePage } from "@/pages/home/workspaces-home";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { currentWorkspaceId } from "@/lib/utils";

export function RootRedirect() {
  const { user, isLoading: authLoading } = useAuth();
  const workspacesQuery = useWorkspaces();

  if (authLoading) {
    return <PageLoader label="Checking session…" />;
  }

  const currentId = currentWorkspaceId(user);
  if (currentId) {
    return <Navigate to={`/workspace/${currentId}/projects`} replace />;
  }

  if (workspacesQuery.isPending) {
    return <PageLoader label="Loading your workspaces…" />;
  }

  const workspaces = workspacesQuery.data ?? [];
  if (workspaces.length > 0) {
    return <Navigate to={`/workspace/${workspaces[0]!._id}/projects`} replace />;
  }

  return <WorkspacesHomePage />;
}
