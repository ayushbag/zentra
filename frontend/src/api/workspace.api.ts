import api from "./axios-instance";
import type {
  CreateWorkspacePayload,
  Member,
  RoleOption,
  UpdateWorkspacePayload,
  Workspace,
  WorkspaceAnalytics,
} from "@/types";

export const workspaceApi = {
  async create(payload: CreateWorkspacePayload) {
    const { data } = await api.post<{ message: string; workspace: Workspace }>(
      "/workspace/create/new",
      payload
    );
    return data.workspace;
  },

  async getAll() {
    const { data } = await api.get<{ message: string; workspaces: Workspace[] }>(
      "/workspace/all"
    );
    return data.workspaces;
  },

  async getById(id: string) {
    const { data } = await api.get<{ message: string; workspace: Workspace }>(
      `/workspace/${id}`
    );
    return data.workspace;
  },

  async update(id: string, payload: UpdateWorkspacePayload) {
    const { data } = await api.put<{ message: string; workspace: Workspace }>(
      `/workspace/update/${id}`,
      payload
    );
    return data.workspace;
  },

  async remove(id: string) {
    const { data } = await api.delete<{ message: string; currentWorkspace: string | null }>(
      `/workspace/delete/${id}`
    );
    return data;
  },

  async getMembers(id: string) {
    const { data } = await api.get<{
      message: string;
      members: Member[];
      roles: RoleOption[];
    }>(`/workspace/members/${id}`);
    return data;
  },

  async getAnalytics(id: string) {
    const { data } = await api.get<{ message: string; analytics: WorkspaceAnalytics }>(
      `/workspace/analytics/${id}`
    );
    return data.analytics;
  },

  async changeMemberRole(workspaceId: string, memberId: string, roleId: string) {
    const { data } = await api.put<{ message: string; member: Member }>(
      `/workspace/change/member/role/${workspaceId}`,
      { memberId, roleId }
    );
    return data.member;
  },
};
