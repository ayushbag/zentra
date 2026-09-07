import api from "./axios-instance";
import type { RoleName } from "@/types";

export const memberApi = {
  /** Joins a workspace by invite code; returns the joined workspace id + role. */
  async joinByInviteCode(inviteCode: string) {
    const { data } = await api.get<{
      message: string;
      workspaceId: string;
      role: RoleName;
    }>(`/member/workspace/${encodeURIComponent(inviteCode)}/join`);
    return data;
  },
};
