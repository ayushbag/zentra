import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Member, RoleName, RoleOption, Workspace } from "@/types";
import { memberUserId, roleName } from "@/lib/utils";

interface WorkspaceContextValue {
  workspace: Workspace;
  workspaceId: string;
  members: Member[];
  roles: RoleOption[];
  currentMember: Member | null;
  /** Role name of the signed-in user inside this workspace. */
  myRole: RoleName | undefined;
  membersLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  workspace,
  members,
  roles,
  membersLoading,
  currentUserId,
  children,
}: {
  workspace: Workspace;
  members: Member[];
  roles: RoleOption[];
  membersLoading: boolean;
  currentUserId: string | undefined;
  children: ReactNode;
}) {
  const currentMember = useMemo(
    () => members.find((m) => memberUserId(m) === currentUserId) ?? null,
    [members, currentUserId]
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      workspaceId: workspace._id,
      members,
      roles,
      currentMember,
      myRole: currentMember ? roleName(currentMember.role) : undefined,
      membersLoading,
    }),
    [workspace, members, roles, currentMember, membersLoading]
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return ctx;
}
