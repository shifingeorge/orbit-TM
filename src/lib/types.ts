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

/**
 * Shape actually returned by GET /api/decisions (used by both the Overview
 * Nebula's DecisionDock and the Decision Nexus's OrbList/ContextGlass). The
 * `task`/`requester` picks are kept honest to exactly what the route's join
 * selects — not the full `Task`/`User` records, which the route never
 * fetches (no `description`, `assignedUserId`, `capacityLimit`, etc).
 */
export interface DecisionOrb {
  id: string;
  taskId: string;
  requestedBy: string;
  contextReason: string;
  status: DecisionStatus;
  createdAt: string;
  resolvedAt: string | null;
  task?: Pick<Task, "id" | "title" | "status" | "urgencyLevel">;
  requester?: Pick<User, "id" | "name" | "avatarUrl">;
}

/**
 * @deprecated Alias kept for the Overview Nebula call site (`page.tsx`,
 * `DecisionDock`) which predates the fuller `DecisionOrb` shape. The API
 * route now always returns the fuller shape described by `DecisionOrb`;
 * this alias exists only so those consumers' prior type imports keep
 * resolving without change. New code should import `DecisionOrb` directly.
 */
export type DecisionOrbSummary = DecisionOrb;

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
