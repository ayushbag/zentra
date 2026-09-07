import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@/api/task.api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateTaskPayload,
  Task,
  TaskQueryFilters,
  UpdateTaskPayload,
} from "@/types";

export function useTasks(workspaceId?: string, filters: TaskQueryFilters = {}) {
  const projectId = filters.projectId;
  return useQuery({
    queryKey: [
      ...queryKeys.tasks.list(workspaceId ?? "", projectId),
      {
        status: filters.status,
        priority: filters.priority,
        assignedTo: filters.assignedTo,
        keyword: filters.keyword,
        dueDate: filters.dueDate,
      },
    ],
    queryFn: () => taskApi.getAll(workspaceId as string, filters),
    enabled: Boolean(workspaceId),
  });
}

export function useTask(taskId?: string, projectId?: string, workspaceId?: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId ?? "", workspaceId ?? ""),
    queryFn: () => taskApi.getById(taskId as string, projectId as string, workspaceId as string),
    enabled: Boolean(taskId && projectId && workspaceId),
  });
}

export function useCreateTask(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateTaskPayload;
    }) => taskApi.create(projectId, workspaceId as string, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(workspaceId ?? "", vars.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(workspaceId ?? ""),
      });
    },
  });
}

export function useUpdateTask(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      projectId,
      payload,
    }: {
      taskId: string;
      projectId: string;
      payload: UpdateTaskPayload;
    }) => taskApi.update(taskId, projectId, workspaceId as string, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(workspaceId ?? "", vars.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(workspaceId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(vars.taskId, workspaceId ?? ""),
      });
    },
  });
}

export function useDeleteTask(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskApi.remove(taskId, workspaceId as string),
    onSuccess: (_data, taskId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.tasks.detail(taskId, workspaceId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(workspaceId ?? ""),
      });
    },
  });
}

/** Small helper to build an update payload straight from an existing task. */
export function taskPayloadFrom(task: Task): UpdateTaskPayload {
  return {
    title: task.title,
    description: task.description ?? undefined,
    status: task.status,
    priority: task.priority,
    assignedTo:
      typeof task.assignedTo === "string" ? task.assignedTo : task.assignedTo?._id ?? null,
    dueDate: task.dueDate ?? null,
  };
}
