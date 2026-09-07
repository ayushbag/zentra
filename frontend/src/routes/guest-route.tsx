import { Navigate, Outlet } from "react-router-dom";
import { PageLoader } from "@/components/ui/feedback";
import { useAuth } from "@/hooks/use-auth";
import { currentWorkspaceId } from "@/lib/utils";

export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader label="Checking session…" />;
  }

  if (user) {
    const id = currentWorkspaceId(user);
    return <Navigate to={id ? `/workspace/${id}/projects` : "/"} replace />;
  }

  return <Outlet />;
}
