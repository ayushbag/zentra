export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    detail: (id: string) => [...queryKeys.workspaces.all, id] as const,
    members: (id: string) => [...queryKeys.workspaces.all, id, "members"] as const,
    analytics: (id: string) => [...queryKeys.workspaces.all, id, "analytics"] as const,
  },
  projects: {
    all: (workspaceId: string) => ["projects", workspaceId] as const,
    detail: (projectId: string, workspaceId: string) =>
      [...queryKeys.projects.all(workspaceId), projectId] as const,
    analytics: (projectId: string, workspaceId: string) =>
      [...queryKeys.projects.detail(projectId, workspaceId), "analytics"] as const,
  },
  tasks: {
    all: (workspaceId: string) => ["tasks", workspaceId] as const,
    list: (workspaceId: string, projectId?: string) =>
      [...queryKeys.tasks.all(workspaceId), "list", projectId ?? "all"] as const,
    detail: (taskId: string, workspaceId: string) =>
      [...queryKeys.tasks.all(workspaceId), "detail", taskId] as const,
  },
  member: {
    join: (inviteCode: string) => ["member", "join", inviteCode] as const,
  },
};
