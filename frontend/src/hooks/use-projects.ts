import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "@/api/project.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateProjectPayload, UpdateProjectPayload } from "@/types";

export function useProjects(workspaceId?: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...queryKeys.projects.all(workspaceId ?? ""), { page, pageSize }],
    queryFn: () => projectApi.getAll(workspaceId as string, pageSize, page),
    enabled: Boolean(workspaceId),
    placeholderData: (prev) => prev,
  });
}

export function useProject(projectId?: string, workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? "", workspaceId ?? ""),
    queryFn: () => projectApi.getById(projectId as string, workspaceId as string),
    enabled: Boolean(projectId && workspaceId),
  });
}

export function useProjectAnalytics(projectId?: string, workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.projects.analytics(projectId ?? "", workspaceId ?? ""),
    queryFn: () => projectApi.getAnalytics(projectId as string, workspaceId as string),
    enabled: Boolean(projectId && workspaceId),
  });
}

export function useCreateProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectApi.create(workspaceId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(workspaceId ?? ""),
      });
    },
  });
}

export function useUpdateProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: UpdateProjectPayload }) =>
      projectApi.update(projectId, workspaceId as string, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(vars.projectId, workspaceId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(workspaceId ?? ""),
      });
    },
  });
}

export function useDeleteProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      projectApi.remove(projectId, workspaceId as string),
    onSuccess: (_data, projectId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(projectId, workspaceId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(workspaceId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all(workspaceId ?? ""),
      });
    },
  });
}
