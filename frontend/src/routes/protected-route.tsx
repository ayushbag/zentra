import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/ui/feedback";
import { useAuth } from "@/hooks/use-auth";

/** Wraps routes that require an authenticated session. */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader label="Checking session…" />;
  }

  if (!user) {
    // Remember where the user was heading so we can return after login.
    sessionStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
