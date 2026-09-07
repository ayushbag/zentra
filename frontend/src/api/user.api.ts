import api from "./axios-instance";
import type { User } from "@/types";

export const userApi = {
  async getCurrentUser() {
    const { data } = await api.get<{ message: string; user: User }>("/user/current");
    return data.user;
  },
};
