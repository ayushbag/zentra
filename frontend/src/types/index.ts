// ---------------------------------------------------------------------------
// Shared types mirroring the backend API responses
// ---------------------------------------------------------------------------

export type RoleName = "OWNER" | "ADMIN" | "MEMBER";

export type Permission =
  | "CREATE_WORKSPACE"
  | "DELETE_WORKSPACE"
  | "EDIT_WORKSPACE"
  | "MANAGE_WORKSPACE_SETTINGS"
  | "ADD_MEMBER"
  | "CHANGE_MEMBER_ROLE"
  | "REMOVE_MEMBER"
  | "CREATE_PROJECT"
  | "EDIT_PROJECT"
  | "DELETE_PROJECT"
  | "CREATE_TASK"
  | "EDIT_TASK"
  | "DELETE_TASK"
  | "VIEW_ONLY";

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// ---------------------------------------------------------------------------
// Generic API envelopes
// ---------------------------------------------------------------------------

export interface ApiMessage {
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errorCode?: string;
  errors?: { field: string; message: string }[];
}

export interface Pagination {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  skip: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/** Slim user object returned when refs are populated (e.g. task assignee). */
export interface UserLite {
  _id: string;
  name: string;
  email?: string;
  profilePicture: string | null;
}

export interface User extends UserLite {
  currentWorkspace: Workspace | string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceAnalytics {
  totalTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

// ---------------------------------------------------------------------------
// Roles & members
// ---------------------------------------------------------------------------

export interface Role {
  _id: string;
  name: RoleName;
  permission: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleOption {
  _id: string;
  name: RoleName;
}

export interface Member {
  _id: string;
  userId: UserLite | string;
  workspaceId: string;
  role: Role | string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface Project {
  _id: string;
  name: string;
  description: string | null;
  emoji: string;
  workspace: string;
  createdBy: UserLite | string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectAnalytics = WorkspaceAnalytics;

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export interface Task {
  _id: string;
  taskCode: string;
  title: string;
  description: string | null;
  project: Project | string;
  workspace: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: UserLite | string | null;
  createdBy: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export type UpdateWorkspacePayload = CreateWorkspacePayload;

export interface CreateProjectPayload {
  name: string;
  description?: string;
  emoji?: string;
}

export type UpdateProjectPayload = CreateProjectPayload;

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null;
  dueDate?: string | null;
}

export type UpdateTaskPayload = CreateTaskPayload;

export interface TaskQueryFilters {
  projectId?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  keyword?: string;
  dueDate?: string;
  pageSize?: number;
  pageNumber?: number;
}
