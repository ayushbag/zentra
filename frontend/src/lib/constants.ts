import type { Permission, RoleName, TaskPriority, TaskStatus } from "@/types";

// ---------------------------------------------------------------------------
// Roles & permissions (mirror of backend/src/utils/rules-permission.ts)
// ---------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  OWNER: [
    "CREATE_WORKSPACE",
    "DELETE_WORKSPACE",
    "MANAGE_WORKSPACE_SETTINGS",
    "ADD_MEMBER",
    "CHANGE_MEMBER_ROLE",
    "REMOVE_MEMBER",
    "CREATE_PROJECT",
    "EDIT_PROJECT",
    "DELETE_PROJECT",
    "CREATE_TASK",
    "EDIT_TASK",
    "DELETE_TASK",
    "VIEW_ONLY",
  ],
  ADMIN: [
    "ADD_MEMBER",
    "CREATE_PROJECT",
    "EDIT_PROJECT",
    "DELETE_PROJECT",
    "CREATE_TASK",
    "EDIT_TASK",
    "DELETE_TASK",
    "MANAGE_WORKSPACE_SETTINGS",
    "VIEW_ONLY",
  ],
  MEMBER: ["VIEW_ONLY", "CREATE_TASK", "EDIT_TASK"],
};

export const ROLE_LABELS: Record<RoleName, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

// ---------------------------------------------------------------------------
// Task statuses
// ---------------------------------------------------------------------------

export const TASK_STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; badge: string; column: string; dot: string }
> = {
  BACKLOG: {
    label: "Backlog",
    badge: "bg-muted text-muted-foreground",
    column: "bg-muted/70 dark:bg-muted/30",
    dot: "bg-slate-400 dark:bg-slate-500",
  },
  TODO: {
    label: "To Do",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    column: "bg-blue-50/80 dark:bg-blue-950/30",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    column: "bg-amber-50/80 dark:bg-amber-950/30",
    dot: "bg-amber-500",
  },
  IN_REVIEW: {
    label: "In Review",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    column: "bg-violet-50/80 dark:bg-violet-950/30",
    dot: "bg-violet-500",
  },
  DONE: {
    label: "Done",
    badge: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
    column: "bg-green-50/80 dark:bg-green-950/30",
    dot: "bg-green-500",
  },
};

// ---------------------------------------------------------------------------
// Task priorities
// ---------------------------------------------------------------------------

export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; badge: string; rank: number }
> = {
  LOW: { label: "Low", badge: "bg-muted text-muted-foreground", rank: 0 },
  MEDIUM: {
    label: "Medium",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    rank: 1,
  },
  HIGH: {
    label: "High",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    rank: 2,
  },
};

// ---------------------------------------------------------------------------
// Project emoji picker
// ---------------------------------------------------------------------------

export const PROJECT_EMOJIS = [
  "📊",
  "🚀",
  "🎯",
  "💡",
  "🛠️",
  "🎨",
  "📱",
  "🌐",
  "🧠",
  "📈",
  "🧪",
  "🔒",
  "🛒",
  "🏗️",
  "🎮",
  "📚",
];
