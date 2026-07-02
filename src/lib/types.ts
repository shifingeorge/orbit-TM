export type UserStatus = "active" | "available" | "blocked";
export type TaskStatus = "pending" | "active" | "blocked" | "completed";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type DecisionStatus = "pending" | "granted" | "denied";

export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: UserStatus;
  capacityLimit: number;
  createdAt: string;
  taskCount?: number;
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
}

export interface DecisionOrb {
  id: string;
  taskId: string;
  requestedBy: string;
  contextReason: string;
  status: DecisionStatus;
  createdAt: string;
  resolvedAt: string | null;
  task?: Task;
  requester?: User;
}

/**
 * Shape actually returned by GET /api/decisions today — a partial `task`
 * (id + title only). Distinct from `DecisionOrb`, whose `task?: Task` is the
 * full contract intended for a future dedicated decisions API.
 */
export interface DecisionOrbSummary {
  id: string;
  taskId: string;
  requestedBy: string;
  contextReason: string;
  status: DecisionStatus;
  createdAt: string;
  resolvedAt: string | null;
  task?: Pick<Task, "id" | "title">;
  requester?: User;
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
