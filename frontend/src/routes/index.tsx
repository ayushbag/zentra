import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/routes/protected-route";
import { GuestRoute } from "@/routes/guest-route";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { GoogleCallbackPage } from "@/pages/auth/google-callback";
import { RootRedirect } from "@/pages/home/root-redirect";
import { JoinWorkspacePage } from "@/pages/join-workspace";
import { NotFoundPage } from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";
import { WorkspaceDashboardPage } from "@/pages/workspace/workspace-dashboard";
import { WorkspaceMembersPage } from "@/pages/workspace/workspace-members";
import { ProjectsPage } from "@/pages/projects/projects-page";
import { ProjectDetailPage } from "@/pages/projects/project-detail-page";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/join/:inviteCode" element={<JoinWorkspacePage />} />

        <Route path="/workspace/:workspaceId" element={<AppLayout />}>
          <Route index element={<WorkspaceDashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="members" element={<WorkspaceMembersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
