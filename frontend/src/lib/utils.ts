import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Member, Permission, Role, RoleName, Task, User, UserLite, Workspace } from "@/types";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns true when the current user has a permission for a given role name. */
export function hasPermission(role: RoleName | undefined, permission: Permission) {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Extracts a role name from a role object or raw string. */
export function roleName(role: Role | string | undefined): RoleName | undefined {
  if (!role) return undefined;
  return typeof role === "string" ? (role as RoleName) : role.name;
}

/** Whether a task's due date has passed and it isn't done yet. */
export function isOverdue(task: Pick<Task, "dueDate" | "status">): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function isDone(task: Pick<Task, "status">): boolean {
  return task.status === "DONE";
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(value?: string | Date | null): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/** Resolves the current workspace id stored on a user (workspace may be populated). */
export function currentWorkspaceId(user: User | null | undefined): string | null {
  if (!user?.currentWorkspace) return null;
  return typeof user.currentWorkspace === "string"
    ? user.currentWorkspace
    : user.currentWorkspace._id;
}

/** Resolves the workspace id out of a populated object or a plain string. */
export function workspaceIdOf(workspace: Workspace | string | undefined | null): string | null {
  if (!workspace) return null;
  return typeof workspace === "string" ? workspace : workspace._id;
}

/** Normalizes a member's user ref (populated or raw id) into a UserLite. */
export function memberUser(member: Member): UserLite | null {
  if (typeof member.userId === "string") return null;
  return member.userId;
}

/** Extracts the raw user id out of a member. */
export function memberUserId(member: Member): string {
  return typeof member.userId === "string" ? member.userId : member.userId._id;
}

/** Extracts an assignee (populated user or plain id) into a UserLite. */
export function assigneeOf(assignedTo: Task["assignedTo"]): UserLite | null {
  if (!assignedTo) return null;
  return typeof assignedTo === "string"
    ? { _id: assignedTo, name: "Unassigned", profilePicture: null }
    : assignedTo;
}

export function unassignedId(): string {
  return "__unassigned__";
}

/** Returns a reasonably unique id for lists (client-generated keys only). */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "object" && error !== null) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message ?? err.message ?? fallback;
  }
  return fallback;
}
