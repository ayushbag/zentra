import { useState } from "react";
import { Check, Copy, Link2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/context/workspace-context";

export function InviteMemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { workspace } = useWorkspaceContext();
  const [copied, setCopied] = useState<string | null>(null);

  const inviteLink = `${window.location.origin}/join/${workspace.inviteCode}`;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy — copy it manually");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite people"
      description="Anyone with the invite link can join this workspace as a member."
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Link2 className="h-3.5 w-3.5" />
            Invite link
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-card px-3 py-2 text-xs text-foreground ring-1 ring-border">
              {inviteLink}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(inviteLink, "link")}
              leftIcon={
                copied === "link" ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <Ticket className="h-3.5 w-3.5" />
            Invite code
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-card px-3 py-2 text-xs font-semibold tracking-wider text-foreground ring-1 ring-border">
              {workspace.inviteCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(workspace.inviteCode, "code")}
              leftIcon={
                copied === "code" ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
