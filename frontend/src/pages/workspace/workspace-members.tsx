import { useState } from "react";
import { Link2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge, Avatar } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/feedback";
import { InviteMemberModal } from "@/components/workspace/invite-member-modal";
import { useWorkspaceContext } from "@/context/workspace-context";
import { useAuth } from "@/hooks/use-auth";
import { useChangeMemberRole } from "@/hooks/use-workspaces";
import { ROLE_LABELS } from "@/lib/constants";
import {
  cn,
  formatDate,
  getApiErrorMessage,
  hasPermission,
  memberUser,
  memberUserId,
  roleName,
} from "@/lib/utils";
import type { Member } from "@/types";

const roleBadgeClass: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  ADMIN: "bg-primary/15 text-primary",
  MEMBER: "bg-muted text-muted-foreground",
};

export function WorkspaceMembersPage() {
  const { workspace, workspaceId, members, roles, membersLoading, myRole } =
    useWorkspaceContext();
  const { user } = useAuth();
  const changeRole = useChangeMemberRole(workspaceId);

  const [inviteOpen, setInviteOpen] = useState(false);

  const canInvite = hasPermission(myRole, "ADD_MEMBER");
  const canChangeRole = hasPermission(myRole, "CHANGE_MEMBER_ROLE");

  const handleRoleChange = async (member: Member, roleId: string) => {
    if (!roleId) return;
    try {
      await changeRole.mutateAsync({ memberId: memberUserId(member), roleId });
      toast.success("Member role updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not change the role"));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members.length} member{members.length === 1 ? "" : "s"} in this
            workspace
          </p>
        </div>
        {canInvite && (
          <Button
            onClick={() => setInviteOpen(true)}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Invite people
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {membersLoading ? (
          <div className="space-y-3 p-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : members.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => {
              const role = roleName(member.role);
              const info = memberUser(member);
              const isMe = memberUserId(member) === user?._id;
              const selectedRoleId =
                typeof member.role === "string" ? member.role : member.role._id;

              return (
                <li
                  key={member._id}
                  className="flex flex-wrap items-center gap-3 px-5 py-4"
                >
                  <Avatar
                    name={info?.name}
                    src={info?.profilePicture}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="truncate">{info?.name ?? "Unknown user"}</span>
                      {isMe && (
                        <Badge className="bg-muted text-muted-foreground">You</Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {info?.email ?? "—"} · joined {formatDate(member.joinedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={cn(role && roleBadgeClass[role])}>
                      {role ? ROLE_LABELS[role] : "—"}
                    </Badge>

                    {canChangeRole && role && role !== "OWNER" ? (
                      <Select
                        className="w-32"
                        value={selectedRoleId}
                        onChange={(e) => void handleRoleChange(member, e.target.value)}
                        disabled={changeRole.isPending}
                        aria-label={`Change role for ${info?.name ?? "member"}`}
                      >
                        {roles
                          .filter((r) => r.name !== "OWNER")
                          .map((r) => (
                            <option key={r._id} value={r._id}>
                              {ROLE_LABELS[r.name]}
                            </option>
                          ))}
                      </Select>
                    ) : (
                      !isMe &&
                      role === "OWNER" && (
                        <span className="text-xs text-muted-foreground/80">workspace owner</span>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Link2 className="h-4 w-4 text-primary" />
          Sharing
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          People who join through your invite link become{" "}
          <span className="font-medium text-foreground">MEMBER</span>s of{" "}
          <span className="font-medium text-foreground">{workspace.name}</span>.
        </p>
        {canInvite ? (
          <Button
            variant="subtle"
            size="sm"
            className="mt-3"
            onClick={() => setInviteOpen(true)}
          >
            Copy invite link
          </Button>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground/80">
            Ask an owner or admin to invite new members.
          </p>
        )}
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
