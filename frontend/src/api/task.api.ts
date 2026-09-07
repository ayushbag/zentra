import api from "./axios-instance";
import type {
  CreateTaskPayload,
  Pagination,
  Task,
  TaskQueryFilters,
  UpdateTaskPayload,
} from "@/types";

export const taskApi = {
  async create(projectId: string, workspaceId: string, payload: CreateTaskPayload) {
    const { data } = await api.post<{ message: string; task: Task }>(
      `/task/projects/${projectId}/workspace/${workspaceId}/create`,
      payload
    );
    return data.task;
  },

  async getAll(workspaceId: string, filters: TaskQueryFilters = {}) {
    const params: Record<string, string | number | undefined> = {
      pageSize: filters.pageSize ?? 100,
      pageNumber: filters.pageNumber ?? 1,
      projectId: filters.projectId,
      keyword: filters.keyword || undefined,
      dueDate: filters.dueDate || undefined,
      status: filters.status?.length ? filters.status.join(",") : undefined,
      priority: filters.priority?.length ? filters.priority.join(",") : undefined,
      assignedTo: filters.assignedTo?.length ? filters.assignedTo.join(",") : undefined,
    };

    const { data } = await api.get<{ message: string; tasks: Task[]; pagination: Pagination }>(
      `/task/workspace/${workspaceId}/all`,
      { params }
    );
    return data;
  },

  async getById(taskId: string, projectId: string, workspaceId: string) {
    const { data } = await api.get<{ message: string; task: Task }>(
      `/task/${taskId}/project/${projectId}/workspace/${workspaceId}`
    );
    return data.task;
  },

  async update(
    taskId: string,
    projectId: string,
    workspaceId: string,
    payload: UpdateTaskPayload
  ) {
    const { data } = await api.put<{ message: string; task: Task }>(
      `/task/${taskId}/projects/${projectId}/workspace/${workspaceId}/update`,
      payload
    );
    return data.task;
  },

  async remove(taskId: string, workspaceId: string) {
    const { data } = await api.delete<{ message: string; deletedTaskId: string }>(
      `/task/${taskId}/workspace/${workspaceId}/delete`
    );
    return data.deletedTaskId;
  },
};
