import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "@/api/workspace.api";
import { memberApi } from "@/api/member.api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/use-auth";
import type { CreateWorkspacePayload, UpdateWorkspacePayload } from "@/types";

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: () => workspaceApi.getAll(),
  });
}

export function useWorkspace(id?: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id ?? ""),
    queryFn: () => workspaceApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useWorkspaceMembers(id?: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.members(id ?? ""),
    queryFn: () => workspaceApi.getMembers(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useWorkspaceAnalytics(id?: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.analytics(id ?? ""),
    queryFn: () => workspaceApi.getAnalytics(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) => workspaceApi.create(payload),
    onSuccess: async (workspace) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        refreshUser(),
      ]);
      queryClient.setQueryData(queryKeys.workspaces.detail(workspace._id), workspace);
    },
  });
}

export function useUpdateWorkspace(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspacePayload) =>
      workspaceApi.update(workspaceId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(workspaceId ?? "") });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceApi.remove(workspaceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        refreshUser(),
      ]);
    },
  });
}

export function useChangeMemberRole(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: string; roleId: string }) =>
      workspaceApi.changeMemberRole(workspaceId as string, memberId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId ?? "") });
    },
  });
}

export function useJoinWorkspace() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (inviteCode: string) => memberApi.joinByInviteCode(inviteCode),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        refreshUser(),
      ]);
    },
  });
}
