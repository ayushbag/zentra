import api from "./axios-instance";
import type { LoginPayload, RegisterPayload, User } from "@/types";

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await api.post<{ message: string }>("/auth/register", payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<{ message: string; user: User }>(
      "/auth/login",
      payload
    );
    return data;
  },

  async logout() {
    const { data } = await api.post<{ message: string }>("/auth/logout");
    return data;
  },
};

/** Kick off Google OAuth by navigating the browser (redirect flow). */
export function loginWithGoogle() {
  window.location.href = "/api/auth/google";
}
