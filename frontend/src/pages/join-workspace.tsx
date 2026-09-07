import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/feedback";
import { useJoinWorkspace } from "@/hooks/use-workspaces";
import { getApiErrorMessage } from "@/lib/utils";

export function JoinWorkspacePage() {
  const { inviteCode = "" } = useParams();
  const navigate = useNavigate();
  const joinMutation = useJoinWorkspace();

  useEffect(() => {
    let cancelled = false;

    joinMutation.mutateAsync(inviteCode).then(
      ({ workspaceId }) => {
        if (cancelled) return;
        toast.success("You joined the workspace");
        navigate(`/workspace/${workspaceId}/projects`, { replace: true });
      },
      (error) => {
        if (cancelled) return;
        toast.error(getApiErrorMessage(error, "Could not join the workspace"));
        navigate("/", { replace: true });
      }
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode]);

  return <PageLoader label="Joining workspace…" />;
}
