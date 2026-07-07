export type UserStatus = "active" | "available" | "blocked";
export type TaskStatus = "pending" | "active" | "blocked" | "completed";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type DecisionStatus = "pending" | "granted" | "denied";
export type UserRole = "founder" | "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email?: string;
  role?: UserRole;
  avatarUrl: string | null;
  status: UserStatus;
  capacityLimit: number;
  createdAt: string;
  taskCount?: number;
}

/** The current authenticated user, as returned by GET /api/me. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  urgencyLevel: UrgencyLevel;
  assignedUserId: string | null;
  assignedUser?: User;
  createdAt: string;
  updatedAt: string;
  /** List endpoint only: latest progress note, null when none. */
  latestUpdate?: { body: string; authorName: string | null; createdAt: string } | null;
  subtaskCount?: number;
  subtaskDoneCount?: number;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author?: Pick<User, "id" | "name" | "avatarUrl">;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  createdAt: string;
}

/**
 * Shape returned by GET /api/decisions. The `task`/`requester` picks are
 * kept honest to exactly what the route's join selects — not the full
 * `Task`/`User` records, which the route never fetches (no `description`,
 * `assignedUserId`, `capacityLimit`, etc).
 */
export interface DecisionOrb {
  id: string;
  taskId: string | null;
  requestedBy: string;
  contextReason: string;
  status: DecisionStatus;
  createdAt: string;
  resolvedAt: string | null;
  task?: Pick<Task, "id" | "title" | "status" | "urgencyLevel">;
  requester?: Pick<User, "id" | "name" | "avatarUrl">;
}

export interface TimelineEvent {
  id: string;
  taskId: string;
  event: string;
  actorId: string | null;
  actor?: User;
  createdAt: string;
}

export interface SystemStat {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  urgencyLevel?: UrgencyLevel;
  assignedUserId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  urgencyLevel?: UrgencyLevel;
  assignedUserId?: string | null;
}

export interface CreateDecisionInput {
  contextReason: string;
  taskId?: string;
}
