import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "available", "blocked"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "active", "blocked", "completed"]);
export const urgencyEnum = pgEnum("urgency_level", ["low", "medium", "high", "critical"]);
export const decisionStatusEnum = pgEnum("decision_status", ["pending", "granted", "denied"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  status: userStatusEnum("status").default("active").notNull(),
  capacityLimit: integer("capacity_limit").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  urgencyLevel: urgencyEnum("urgency_level").default("medium").notNull(),
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const decisionOrbs = pgTable("decision_orbs", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  requestedBy: uuid("requested_by").references(() => users.id).notNull(),
  contextReason: text("context_reason").notNull(),
  status: decisionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const taskTimeline = pgTable("task_timeline", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  event: varchar("event", { length: 255 }).notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
