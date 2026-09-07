import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/feedback";

/**
 * Backend OAuth redirects the browser here after Google auth:
 *   success -> no params (or already forwarded to /workspace/...)
 *   failure -> ?status=failure
 */
export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const status = params.get("status");
    if (status === "failure") {
      toast.error("Google sign-in failed. Please try again.");
    } else {
      toast.success("Signed in with Google");
    }
    navigate("/", { replace: true });
  }, [params, navigate]);

  return <PageLoader label="Finishing Google sign-in…" />;
}
