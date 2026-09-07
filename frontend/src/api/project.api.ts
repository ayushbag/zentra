import api from "./axios-instance";
import type {
  CreateProjectPayload,
  Pagination,
  Project,
  ProjectAnalytics,
  UpdateProjectPayload,
} from "@/types";

export const projectApi = {
  async create(workspaceId: string, payload: CreateProjectPayload) {
    const { data } = await api.post<{ message: string; project: Project }>(
      `/project/workspace/${workspaceId}/create`,
      payload
    );
    return data.project;
  },

  async getAll(workspaceId: string, pageSize = 20, pageNumber = 1) {
    const { data } = await api.get<{
      message: string;
      projects: Project[];
      pagination: Pagination;
    }>(`/project/workspace/${workspaceId}/all`, {
      params: { pageSize, pageNumber },
    });
    return data;
  },

  async getById(projectId: string, workspaceId: string) {
    const { data } = await api.get<{ message: string; project: Project }>(
      `/project/${projectId}/workspace/${workspaceId}`
    );
    return data.project;
  },

  async getAnalytics(projectId: string, workspaceId: string) {
    const { data } = await api.get<{ message: string; analytics: ProjectAnalytics }>(
      `/project/${projectId}/workspace/${workspaceId}/analytics`
    );
    return data.analytics;
  },

  async update(projectId: string, workspaceId: string, payload: UpdateProjectPayload) {
    const { data } = await api.put<{ message: string; project: Project }>(
      `/project/${projectId}/workspace/${workspaceId}/update`,
      payload
    );
    return data.project;
  },

  async remove(projectId: string, workspaceId: string) {
    const { data } = await api.delete<{
      message: string;
      deletedProjectId: string;
    }>(`/project/${projectId}/workspace/${workspaceId}/delete`);
    return data.deletedProjectId;
  },
};
