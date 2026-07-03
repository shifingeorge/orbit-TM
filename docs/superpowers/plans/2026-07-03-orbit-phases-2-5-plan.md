# Orbit System — Phases 2-5 + Task CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Orbit System dashboard — Overview Nebula, Task Detail Modal, Decision Nexus, Team Orbit pages — plus full task CRUD (create/edit/delete), all wired to a live Neon PostgreSQL database.

**Architecture:** Next.js 16 App Router with server components for data-fetching pages and client components for interactive UI. API route handlers provide a REST-like interface to the Drizzle ORM + Neon DB backend. Client-side state management uses React `useState`/`useEffect` with `fetch` calls — no external state library.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4 (with `@theme` block), Framer Motion, Drizzle ORM, Neon Serverless Postgres

## Global Constraints

- **Next.js 16 breaking changes:** `params` in pages and route handlers is a `Promise` — must `await params` before use. Route handlers use standard Web `Request`/`Response` APIs.
- **Tailwind v4:** Uses `@theme` block in `globals.css` instead of `tailwind.config.ts`. Custom colors like `primary`, `muted`, `urgent`, `decision` are already defined as `--color-*` tokens.
- **Existing components to reuse:** `GlassPanel`, `StatusPulse`, `Sidebar`, `SystemVitals` from Phase 1. Follow their patterns (client components with `"use client"`, Framer Motion for animations, `cn()` utility for class merging).
- **Design tokens:** All colors via `var(--color-*)`, fonts via `font-display`/`font-body`/`font-mono` Tailwind classes, border radius via `rounded-panel`/`rounded-pill`.
- **Database:** Neon Serverless Postgres via `@neondatabase/serverless`. Drizzle ORM for queries. Import `db` from `@/db` and schema from `@/db/schema`.
- **No authentication:** This is a single-user operational dashboard — no auth layer.
- **Avatars:** DiceBear Notionists API (`https://api.dicebear.com/9.x/notionists/svg?seed=NAME`).

---

## File Structure

### Files to Create
```
src/app/api/tasks/route.ts              — GET all tasks, POST new task
src/app/api/tasks/[id]/route.ts         — GET/PATCH/DELETE single task
src/app/api/decisions/route.ts          — GET pending decisions
src/app/api/decisions/[id]/route.ts     — PATCH decision (grant/deny)
src/app/api/users/route.ts              — GET all users with task counts
src/app/api/stats/route.ts              — GET system vitals
src/app/decisions/page.tsx              — Decision Nexus page
src/app/team/page.tsx                   — Team Orbit page
src/components/nebula/TaskCard.tsx      — Floating task card
src/components/nebula/DecisionDock.tsx   — Right-side decision orb panel
src/components/nebula/DecisionOrb.tsx    — Single pulsing amber orb
src/components/nebula/CreateTaskModal.tsx — Task creation form modal
src/components/decisions/OrbList.tsx     — Left pane orb list
src/components/decisions/ContextGlass.tsx — Right pane detail + actions
src/components/team/UserPlanet.tsx      — Avatar with load ring
src/components/team/LoadRing.tsx        — SVG orbital ring
src/components/team/FilterBar.tsx       — Glass pill filter toggles
src/components/shared/TaskNodeDetail.tsx — Task detail/edit modal overlay
src/components/shared/Timeline.tsx       — Vertical history line
```

### Files to Modify
```
src/app/page.tsx                        — Replace placeholder with Overview Nebula
src/app/globals.css                     — Add new animation keyframes and utilities
src/lib/types.ts                        — Add CreateTaskInput and UpdateTaskInput types
```

---

## Task 1: Push Database Schema & Seed Data

**Files:**
- Uses: `src/db/schema.ts` (existing, no changes)
- Uses: `src/db/seed.ts` (existing, no changes)
- Uses: `drizzle.config.ts` (existing, no changes)

**Interfaces:**
- Produces: A populated Neon database with `users`, `tasks`, `decision_orbs`, and `task_timeline` tables containing demo data

- [ ] **Step 1: Push schema to Neon DB**

```bash
cd /home/shiftd/code/orbittm
npx drizzle-kit push
```

Expected: Schema pushed successfully. Tables `users`, `tasks`, `decision_orbs`, `task_timeline` created in Neon.

- [ ] **Step 2: Run seed script to populate demo data**

```bash
cd /home/shiftd/code/orbittm
npx tsx src/db/seed.ts
```

Expected output:
```
🌱 Seeding database...
✅ Seeded 6 users
✅ Seeded 8 tasks
✅ Seeded 3 decision orbs
✅ Seeded N timeline events
🎉 Seeding complete!
```

If there's a `tsx` not found error, install it first: `npx tsx src/db/seed.ts` (npx will auto-install).

- [ ] **Step 3: Verify database by starting dev server**

```bash
cd /home/shiftd/code/orbittm
npm run dev
```

Open `http://localhost:3000` — should render without DB connection errors. Stop the dev server after confirming.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: push schema and seed data to Neon DB"
```

---

## Task 2: API Route Handlers — Tasks CRUD

**Files:**
- Create: `src/app/api/tasks/route.ts`
- Create: `src/app/api/tasks/[id]/route.ts`
- Modify: `src/lib/types.ts` (add input types)

**Interfaces:**
- Consumes: `db` from `@/db`, schema tables from `@/db/schema`
- Produces:
  - `GET /api/tasks` → `Task[]` (with assigned user joined)
  - `POST /api/tasks` → created `Task`
  - `GET /api/tasks/[id]` → `Task` with timeline events and assigned user
  - `PATCH /api/tasks/[id]` → updated `Task`
  - `DELETE /api/tasks/[id]` → `{ success: true }`

- [ ] **Step 1: Add input types to `src/lib/types.ts`**

Add these types at the end of the file:

```typescript
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
```

- [ ] **Step 2: Create `src/app/api/tasks/route.ts`**

```typescript
import { db } from "@/db";
import { tasks, users, taskTimeline } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const allTasks = await db
    .select()
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedUserId, users.id))
    .orderBy(desc(tasks.createdAt));

  const formatted = allTasks.map((row) => ({
    ...row.tasks,
    assignedUser: row.users,
  }));

  return Response.json(formatted);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, urgencyLevel, assignedUserId } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(tasks)
    .values({
      title: title.trim(),
      description: description || null,
      urgencyLevel: urgencyLevel || "medium",
      assignedUserId: assignedUserId || null,
    })
    .returning();

  // Create timeline event
  await db.insert(taskTimeline).values({
    taskId: created.id,
    event: "Task created",
    actorId: assignedUserId || null,
  });

  return Response.json(created, { status: 201 });
}
```

- [ ] **Step 3: Create `src/app/api/tasks/[id]/route.ts`**

```typescript
import { db } from "@/db";
import { tasks, users, taskTimeline, decisionOrbs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const taskRows = await db
    .select()
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedUserId, users.id))
    .where(eq(tasks.id, id));

  if (taskRows.length === 0) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const task = { ...taskRows[0].tasks, assignedUser: taskRows[0].users };

  const timeline = await db
    .select()
    .from(taskTimeline)
    .leftJoin(users, eq(taskTimeline.actorId, users.id))
    .where(eq(taskTimeline.taskId, id))
    .orderBy(desc(taskTimeline.createdAt));

  const formattedTimeline = timeline.map((row) => ({
    ...row.task_timeline,
    actor: row.users,
  }));

  return Response.json({ ...task, timeline: formattedTimeline });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Build update object — only include fields that were sent
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const timelineEvents: string[] = [];

  if (body.title !== undefined) {
    updateData.title = body.title;
    timelineEvents.push("Title updated");
  }
  if (body.description !== undefined) {
    updateData.description = body.description;
    timelineEvents.push("Description updated");
  }
  if (body.status !== undefined) {
    updateData.status = body.status;
    timelineEvents.push(`Status changed to ${body.status}`);
  }
  if (body.urgencyLevel !== undefined) {
    updateData.urgencyLevel = body.urgencyLevel;
    timelineEvents.push(`Urgency changed to ${body.urgencyLevel}`);
  }
  if (body.assignedUserId !== undefined) {
    updateData.assignedUserId = body.assignedUserId;
    timelineEvents.push(
      body.assignedUserId ? "Reassigned to team member" : "Unassigned"
    );
  }

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  // Create timeline events for each change
  for (const event of timelineEvents) {
    await db.insert(taskTimeline).values({
      taskId: id,
      event,
      actorId: body.assignedUserId || null,
    });
  }

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Delete related records first (timeline, decisions)
  await db.delete(taskTimeline).where(eq(taskTimeline.taskId, id));
  await db.delete(decisionOrbs).where(eq(decisionOrbs.taskId, id));

  const [deleted] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();

  if (!deleted) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
```

- [ ] **Step 4: Verify API routes**

Start the dev server and test with curl:

```bash
npm run dev &
sleep 3
# Test GET all tasks
curl http://localhost:3000/api/tasks | head -c 200
# Test POST new task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","urgencyLevel":"low"}'
```

Expected: GET returns JSON array of tasks, POST returns created task with 201 status. Kill the dev server after testing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add tasks CRUD API routes (GET/POST/PATCH/DELETE)"
```

---

## Task 3: API Route Handlers — Decisions, Users, Stats

**Files:**
- Create: `src/app/api/decisions/route.ts`
- Create: `src/app/api/decisions/[id]/route.ts`
- Create: `src/app/api/users/route.ts`
- Create: `src/app/api/stats/route.ts`

**Interfaces:**
- Consumes: `db` from `@/db`, schema tables from `@/db/schema`
- Produces:
  - `GET /api/decisions` → `DecisionOrb[]` (with task + requester joined)
  - `PATCH /api/decisions/[id]` → updated decision (also updates task status)
  - `GET /api/users` → `User[]` with `taskCount` field
  - `GET /api/stats` → `{ stats: SystemStat[] }`

- [ ] **Step 1: Create `src/app/api/decisions/route.ts`**

```typescript
import { db } from "@/db";
import { decisionOrbs, tasks, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const decisions = await db
    .select()
    .from(decisionOrbs)
    .leftJoin(tasks, eq(decisionOrbs.taskId, tasks.id))
    .leftJoin(users, eq(decisionOrbs.requestedBy, users.id))
    .where(eq(decisionOrbs.status, "pending"))
    .orderBy(desc(decisionOrbs.createdAt));

  const formatted = decisions.map((row) => ({
    ...row.decision_orbs,
    task: row.tasks,
    requester: row.users,
  }));

  return Response.json(formatted);
}
```

- [ ] **Step 2: Create `src/app/api/decisions/[id]/route.ts`**

```typescript
import { db } from "@/db";
import { decisionOrbs, tasks, taskTimeline } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.status || !["granted", "denied"].includes(body.status)) {
    return Response.json(
      { error: "Status must be 'granted' or 'denied'" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(decisionOrbs)
    .set({
      status: body.status,
      resolvedAt: new Date(),
    })
    .where(eq(decisionOrbs.id, id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Decision not found" }, { status: 404 });
  }

  // If granted, unblock the associated task
  if (body.status === "granted") {
    await db
      .update(tasks)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(tasks.id, updated.taskId));

    await db.insert(taskTimeline).values({
      taskId: updated.taskId,
      event: "Decision granted — task unblocked",
      actorId: null,
    });
  } else {
    await db.insert(taskTimeline).values({
      taskId: updated.taskId,
      event: "Decision denied",
      actorId: null,
    });
  }

  return Response.json(updated);
}
```

- [ ] **Step 3: Create `src/app/api/users/route.ts`**

```typescript
import { db } from "@/db";
import { users, tasks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      status: users.status,
      capacityLimit: users.capacityLimit,
      createdAt: users.createdAt,
      taskCount: sql<number>`count(${tasks.id})::int`,
    })
    .from(users)
    .leftJoin(tasks, eq(users.id, tasks.assignedUserId))
    .groupBy(users.id)
    .orderBy(users.name);

  return Response.json(allUsers);
}
```

- [ ] **Step 4: Create `src/app/api/stats/route.ts`**

```typescript
import { db } from "@/db";
import { tasks, decisionOrbs, users } from "@/db/schema";
import { sql, count } from "drizzle-orm";

export async function GET() {
  const [taskStats] = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where ${tasks.status} = 'active')`,
      blocked: sql<number>`count(*) filter (where ${tasks.status} = 'blocked')`,
      pending: sql<number>`count(*) filter (where ${tasks.status} = 'pending')`,
      completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')`,
    })
    .from(tasks);

  const [decisionStats] = await db
    .select({
      pendingDecisions: sql<number>`count(*) filter (where ${decisionOrbs.status} = 'pending')`,
    })
    .from(decisionOrbs);

  const [userStats] = await db
    .select({ teamSize: count() })
    .from(users);

  return Response.json({
    stats: [
      { label: "Active", value: String(taskStats.active), trend: "up" as const },
      { label: "Blocked", value: String(taskStats.blocked), trend: taskStats.blocked > 0 ? "down" as const : "stable" as const },
      { label: "Pending", value: String(taskStats.pending), trend: "stable" as const },
      { label: "Decisions", value: String(decisionStats.pendingDecisions), trend: decisionStats.pendingDecisions > 0 ? "down" as const : "stable" as const },
      { label: "Team", value: String(userStats.teamSize), trend: "stable" as const },
    ],
  });
}
```

- [ ] **Step 5: Verify all API routes**

```bash
npm run dev &
sleep 3
curl http://localhost:3000/api/decisions | head -c 200
curl http://localhost:3000/api/users | head -c 200
curl http://localhost:3000/api/stats
```

Expected: Each endpoint returns properly formatted JSON. Kill dev server after testing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add API routes for decisions, users, and stats"
```

---

## Task 4: Overview Nebula Page — TaskCard, DecisionDock, DecisionOrb

**Files:**
- Create: `src/components/nebula/TaskCard.tsx`
- Create: `src/components/nebula/DecisionOrb.tsx`
- Create: `src/components/nebula/DecisionDock.tsx`
- Modify: `src/app/page.tsx` (replace placeholder with full Nebula layout)
- Modify: `src/app/globals.css` (add card hover animation)

**Interfaces:**
- Consumes: `GlassPanel` from `@/components/shared/GlassPanel`, `StatusPulse` from `@/components/shared/StatusPulse`, `SystemVitals` from `@/components/layout/SystemVitals`, `urgencyToColor` and `formatRelativeTime` from `@/lib/utils`, types from `@/lib/types`
- Produces: `TaskCard` component (props: `task: Task`, `onClick: () => void`, `index: number`), `DecisionOrb` component (props: `decision: DecisionOrb`, `onClick: () => void`), `DecisionDock` component (props: `decisions: DecisionOrb[]`, `onOrbClick: (d) => void`)

- [ ] **Step 1: Add hover animation to `src/app/globals.css`**

Add after the existing `.glow-urgent` block (around line 99):

```css
/* Card hover lift */
.card-hover-lift {
  transition: transform 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.card-hover-lift:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.1);
}

/* Floating action button */
.fab-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
}
.fab-glow:hover {
  box-shadow: 0 0 50px rgba(0, 229, 255, 0.5);
  transform: scale(1.05);
}
```

- [ ] **Step 2: Create `src/components/nebula/TaskCard.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { urgencyToColor, formatRelativeTime } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  index: number;
}

export function TaskCard({ task, onClick, index }: TaskCardProps) {
  const statusColor = urgencyToColor(task.urgencyLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
    >
      <GlassPanel
        className="w-[280px] p-5 cursor-pointer card-hover-lift"
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header: Status + Urgency */}
        <div className="flex items-center justify-between mb-3">
          <StatusPulse color={statusColor} speed={task.urgencyLevel === "critical" ? "fast" : "normal"} />
          <span className="text-xs font-body text-muted uppercase tracking-widest">
            {task.urgencyLevel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-base text-text mb-2 leading-tight">
          {task.title}
        </h3>

        {/* Description preview */}
        {task.description && (
          <p className="text-sm text-muted line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Footer: Assignee + Time */}
        <div className="flex items-center justify-between mt-auto">
          {task.assignedUser ? (
            <div className="flex items-center gap-2">
              <img
                src={task.assignedUser.avatarUrl || ""}
                alt={task.assignedUser.name}
                className="w-6 h-6 rounded-full bg-white/10"
              />
              <span className="text-xs text-muted">{task.assignedUser.name}</span>
            </div>
          ) : (
            <span className="text-xs text-muted italic">Unassigned</span>
          )}
          <span className="text-xs text-muted font-mono">
            {formatRelativeTime(task.createdAt)}
          </span>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create `src/components/nebula/DecisionOrb.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { DecisionOrb as DecisionOrbType } from "@/lib/types";

interface DecisionOrbProps {
  decision: DecisionOrbType;
  onClick: () => void;
}

export function DecisionOrb({ decision, onClick }: DecisionOrbProps) {
  return (
    <motion.button
      className="relative flex items-center gap-3 w-full px-3 py-2 rounded-panel hover:bg-white/5 transition-colors cursor-pointer text-left"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pulsing Orb */}
      <span className="relative inline-flex shrink-0" style={{ width: 48, height: 48 }}>
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "var(--color-decision)", opacity: 0.3 }}
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span
          className="relative inline-flex rounded-full items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: "radial-gradient(circle, var(--color-decision), rgba(255,184,0,0.6))",
            boxShadow: "0 0 20px rgba(255,184,0,0.3)",
          }}
        >
          <span className="text-lg">◈</span>
        </span>
      </span>

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text truncate">{decision.task?.title || "Unknown Task"}</p>
        <p className="text-xs text-muted truncate">{decision.requester?.name || "Unknown"}</p>
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 4: Create `src/components/nebula/DecisionDock.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { DecisionOrb } from "./DecisionOrb";
import type { DecisionOrb as DecisionOrbType } from "@/lib/types";

interface DecisionDockProps {
  decisions: DecisionOrbType[];
  onOrbClick: (decision: DecisionOrbType) => void;
}

export function DecisionDock({ decisions, onOrbClick }: DecisionDockProps) {
  return (
    <GlassPanel
      className="w-[300px] p-4 flex flex-col gap-1 max-h-[calc(100vh-120px)] overflow-y-auto"
      glow="decision"
    >
      <div className="flex items-center gap-2 mb-3 px-2">
        <span className="text-decision text-sm">◈</span>
        <h2 className="font-display text-sm text-muted uppercase tracking-widest">
          Decision Dock
        </h2>
        {decisions.length > 0 && (
          <span className="ml-auto bg-decision/20 text-decision text-xs font-mono px-2 py-0.5 rounded-pill">
            {decisions.length}
          </span>
        )}
      </div>

      {decisions.length === 0 ? (
        <motion.p
          className="text-sm text-muted text-center py-8 italic"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          All systems nominal
        </motion.p>
      ) : (
        decisions.map((decision, i) => (
          <motion.div
            key={decision.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, ease: "easeOut" }}
          >
            <DecisionOrb
              decision={decision}
              onClick={() => onOrbClick(decision)}
            />
          </motion.div>
        ))
      )}
    </GlassPanel>
  );
}
```

- [ ] **Step 5: Replace `src/app/page.tsx` with Overview Nebula page**

Replace the entire file content with:

```tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SystemVitals } from "@/components/layout/SystemVitals";
import { TaskCard } from "@/components/nebula/TaskCard";
import { DecisionDock } from "@/components/nebula/DecisionDock";
import { TaskNodeDetail } from "@/components/shared/TaskNodeDetail";
import { CreateTaskModal } from "@/components/nebula/CreateTaskModal";
import type { Task, DecisionOrb, SystemStat } from "@/lib/types";

export default function OverviewNebula() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<DecisionOrb[]>([]);
  const [stats, setStats] = useState<SystemStat[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tasksRes, decisionsRes, statsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/decisions"),
        fetch("/api/stats"),
      ]);
      const tasksData = await tasksRes.json();
      const decisionsData = await decisionsRes.json();
      const statsData = await statsRes.json();
      setTasks(tasksData);
      setDecisions(decisionsData);
      setStats(statsData.stats);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    fetchData();
  };

  const handleTaskUpdated = () => {
    setSelectedTaskId(null);
    fetchData();
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* System Vitals - Top Bar */}
      <header className="flex items-center justify-between">
        <SystemVitals stats={stats} />
      </header>

      {/* Main Content Area */}
      <div className="flex gap-6 flex-1">
        {/* Task Grid - Center */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-wrap gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-[280px] h-[180px] glass rounded-panel animate-shimmer"
                  style={{
                    background: "linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <motion.div
              className="flex items-center justify-center h-64"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-muted text-lg font-display">No tasks in orbit</p>
            </motion.div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    onClick={() => setSelectedTaskId(task.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Decision Dock - Right */}
        <aside className="shrink-0">
          <DecisionDock
            decisions={decisions}
            onOrbClick={(d) => setSelectedTaskId(d.taskId)}
          />
        </aside>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-background font-display text-2xl flex items-center justify-center fab-glow z-40 cursor-pointer"
        title="Create new task"
      >
        +
      </button>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTaskId && (
          <TaskNodeDetail
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onUpdate={handleTaskUpdated}
          />
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleTaskCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 6: Verify the page compiles**

Start dev server, navigate to `http://localhost:3000`. The page will show compile errors until Task 5 (TaskNodeDetail) and Task 6 (CreateTaskModal) are built. That's expected — verify there are no import path errors by checking the terminal output. The page will fully work after Tasks 5 and 6.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build Overview Nebula page with TaskCard, DecisionDock, DecisionOrb"
```

---

## Task 5: Task Node Detail Modal (View + Edit + Delete)

**Files:**
- Create: `src/components/shared/TaskNodeDetail.tsx`
- Create: `src/components/shared/Timeline.tsx`

**Interfaces:**
- Consumes: `GlassPanel` from `@/components/shared/GlassPanel`, `StatusPulse` from `@/components/shared/StatusPulse`, `urgencyToColor` and `formatRelativeTime` from `@/lib/utils`, types from `@/lib/types`
- Produces: `TaskNodeDetail` component (props: `taskId: string`, `onClose: () => void`, `onUpdate: () => void`), `Timeline` component (props: `events: TimelineEvent[]`)

- [ ] **Step 1: Create `src/components/shared/Timeline.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

      {events.map((event, i) => (
        <motion.div
          key={event.id}
          className="relative flex items-start gap-3 pb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, ease: "easeOut" }}
        >
          {/* Dot */}
          <div className="absolute left-[-20px] top-1.5 w-[10px] h-[10px] rounded-full bg-primary/60 border-2 border-background" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text">{event.event}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {event.actor && (
                <span className="text-xs text-muted">{event.actor.name}</span>
              )}
              <span className="text-xs text-muted font-mono">
                {formatRelativeTime(event.createdAt)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/shared/TaskNodeDetail.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { Timeline } from "@/components/shared/Timeline";
import { urgencyToColor } from "@/lib/utils";
import type { Task, TimelineEvent, User, TaskStatus, UrgencyLevel } from "@/lib/types";

interface TaskNodeDetailProps {
  taskId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface TaskDetail extends Task {
  timeline: TimelineEvent[];
}

export function TaskNodeDetail({ taskId, onClose, onUpdate }: TaskNodeDetailProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>("medium");
  const [editAssignee, setEditAssignee] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTask() {
      try {
        const [taskRes, usersRes] = await Promise.all([
          fetch(`/api/tasks/${taskId}`),
          fetch("/api/users"),
        ]);
        const taskData = await taskRes.json();
        const usersData = await usersRes.json();
        setTask(taskData);
        setUsers(usersData);
        setEditTitle(taskData.title);
        setEditDescription(taskData.description || "");
        setEditUrgency(taskData.urgencyLevel);
        setEditAssignee(taskData.assignedUserId);
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          urgencyLevel: editUrgency,
          assignedUserId: editAssignee,
        }),
      });
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    setSaving(true);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setSaving(false);
    }
  };

  const statusActions: { label: string; status: TaskStatus; color: string }[] = task
    ? [
        ...(task.status !== "active" ? [{ label: "Start", status: "active" as TaskStatus, color: "bg-primary" }] : []),
        ...(task.status !== "blocked" ? [{ label: "Block", status: "blocked" as TaskStatus, color: "bg-decision" }] : []),
        ...(task.status !== "completed" ? [{ label: "Complete", status: "completed" as TaskStatus, color: "bg-green-500" }] : []),
      ]
    : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/60 backdrop-blur-[60px]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <GlassPanel
        variant="intense"
        className="relative z-10 w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-8"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : task ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <StatusPulse
                  color={urgencyToColor(task.urgencyLevel)}
                  speed={task.urgencyLevel === "critical" ? "fast" : "normal"}
                  size={16}
                />
                <span className="text-xs font-mono text-muted uppercase tracking-widest">
                  {task.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-muted hover:text-primary transition-colors px-3 py-1 rounded-pill hover:bg-white/5 cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-muted hover:text-text transition-colors text-xl leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Title */}
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full font-display text-2xl text-text bg-white/5 border border-white/10 rounded-panel px-4 py-2 mb-4 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)]"
              />
            ) : (
              <h2 className="font-display text-2xl text-text mb-4">{task.title}</h2>
            )}

            {/* Description */}
            {editing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full text-sm text-muted bg-white/5 border border-white/10 rounded-panel px-4 py-3 mb-4 resize-none focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)]"
              />
            ) : (
              task.description && (
                <p className="text-sm text-muted mb-6 leading-relaxed">{task.description}</p>
              )
            )}

            {/* Edit fields: Urgency + Assignee */}
            {editing && (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Urgency</label>
                  <select
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                    className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Assigned To</label>
                  <select
                    value={editAssignee || ""}
                    onChange={(e) => setEditAssignee(e.target.value || null)}
                    className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Assignee display (read mode) */}
            {!editing && task.assignedUser && (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-panel bg-white/3">
                <img
                  src={task.assignedUser.avatarUrl || ""}
                  alt={task.assignedUser.name}
                  className="w-8 h-8 rounded-full bg-white/10"
                />
                <div>
                  <p className="text-sm text-text">{task.assignedUser.name}</p>
                  <p className="text-xs text-muted">Assignee</p>
                </div>
              </div>
            )}

            {/* Status transition buttons */}
            {!editing && (
              <div className="flex gap-2 mb-6">
                {statusActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    disabled={saving}
                    className={`text-xs px-4 py-1.5 rounded-pill ${action.color} text-background font-body tracking-wide transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Edit action buttons */}
            {editing && (
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                  className="text-xs px-5 py-1.5 rounded-pill bg-primary text-background font-body tracking-wide transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setConfirmDelete(false);
                    setEditTitle(task.title);
                    setEditDescription(task.description || "");
                    setEditUrgency(task.urgencyLevel);
                    setEditAssignee(task.assignedUserId);
                  }}
                  className="text-xs px-4 py-1.5 rounded-pill text-muted hover:text-text transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div className="ml-auto">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-urgent">Delete?</span>
                      <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="text-xs px-3 py-1 rounded-pill bg-urgent text-background cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs text-muted cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-xs text-urgent/60 hover:text-urgent transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {task.timeline && task.timeline.length > 0 && (
              <div>
                <h3 className="font-display text-sm text-muted uppercase tracking-widest mb-4">
                  Timeline
                </h3>
                <Timeline events={task.timeline} />
              </div>
            )}
          </>
        ) : (
          <p className="text-muted text-center py-8">Task not found</p>
        )}
      </GlassPanel>
    </motion.div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build TaskNodeDetail modal with edit/delete and Timeline component"
```

---

## Task 6: Create Task Modal

**Files:**
- Create: `src/components/nebula/CreateTaskModal.tsx`

**Interfaces:**
- Consumes: `GlassPanel` from `@/components/shared/GlassPanel`, types from `@/lib/types`
- Produces: `CreateTaskModal` component (props: `onClose: () => void`, `onCreated: () => void`)

- [ ] **Step 1: Create `src/components/nebula/CreateTaskModal.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { User, UrgencyLevel } from "@/lib/types";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("medium");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          urgencyLevel,
          assignedUserId: assignedUserId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/60 backdrop-blur-[60px]"
        onClick={onClose}
      />

      {/* Modal */}
      <GlassPanel
        variant="intense"
        className="relative z-10 w-full max-w-[500px] p-8"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-text">Launch New Task</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-xs text-muted mb-1 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-4 py-3 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] placeholder:text-white/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, requirements, links..."
              rows={3}
              className="w-full text-sm text-muted bg-white/5 border border-white/10 rounded-panel px-4 py-3 resize-none focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] placeholder:text-white/20"
            />
          </div>

          {/* Urgency + Assignee row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted mb-1 block">Urgency</label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted mb-1 block">Assign To</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-urgent bg-urgent/10 px-3 py-2 rounded-panel">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full py-3 rounded-pill bg-primary text-background font-display text-sm tracking-wide transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.3)] disabled:opacity-50 cursor-pointer mt-2"
          >
            {saving ? "Launching..." : "Launch Task"}
          </button>
        </form>
      </GlassPanel>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify Overview Nebula fully renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000`. Expected:
- System vitals pills at top showing real counts from DB
- Task cards in a flex-wrap grid in the center
- Decision dock on the right with amber pulsing orbs
- Floating cyan `+` button bottom-right
- Clicking a task card opens the detail modal
- Clicking `+` opens the create task form
- Creating a task adds it to the grid

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add CreateTaskModal — full task CRUD complete"
```

---

## Task 7: Decision Nexus Page

**Files:**
- Create: `src/app/decisions/page.tsx`
- Create: `src/components/decisions/OrbList.tsx`
- Create: `src/components/decisions/ContextGlass.tsx`

**Interfaces:**
- Consumes: `GlassPanel` from `@/components/shared/GlassPanel`, `StatusPulse` from `@/components/shared/StatusPulse`, types from `@/lib/types`, `formatRelativeTime` from `@/lib/utils`
- Produces: Decision Nexus page at `/decisions` route, `OrbList` component (props: `decisions: DecisionOrb[]`, `selectedId: string | null`, `onSelect: (d) => void`), `ContextGlass` component (props: `decision: DecisionOrb | null`, `onGrant: () => void`, `onDeny: () => void`, `loading: boolean`)

- [ ] **Step 1: Create `src/components/decisions/OrbList.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { formatRelativeTime } from "@/lib/utils";
import type { DecisionOrb } from "@/lib/types";

interface OrbListProps {
  decisions: DecisionOrb[];
  selectedId: string | null;
  onSelect: (decision: DecisionOrb) => void;
}

export function OrbList({ decisions, selectedId, onSelect }: OrbListProps) {
  return (
    <GlassPanel className="h-full p-4 overflow-y-auto">
      <h2 className="font-display text-sm text-muted uppercase tracking-widest mb-4 px-2">
        Pending Orbs
        <span className="ml-2 text-decision font-mono">{decisions.length}</span>
      </h2>

      {decisions.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl mb-3">◈</span>
          <p className="text-sm text-muted">No pending decisions</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-1">
          {decisions.map((decision, i) => (
            <motion.button
              key={decision.id}
              className={`w-full text-left px-4 py-3 rounded-panel transition-all cursor-pointer ${
                selectedId === decision.id
                  ? "bg-decision/10 border border-decision/30"
                  : "hover:bg-white/5 border border-transparent"
              }`}
              onClick={() => onSelect(decision)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3">
                {/* Mini orb */}
                <motion.span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--color-decision)" }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255,184,0,0.4)",
                      "0 0 0 6px rgba(255,184,0,0)",
                      "0 0 0 0 rgba(255,184,0,0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text truncate">{decision.task?.title}</p>
                  <p className="text-xs text-muted">
                    {decision.requester?.name} · {formatRelativeTime(decision.createdAt)}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
```

- [ ] **Step 2: Create `src/components/decisions/ContextGlass.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { formatRelativeTime } from "@/lib/utils";
import type { DecisionOrb } from "@/lib/types";

interface ContextGlassProps {
  decision: DecisionOrb | null;
  onGrant: () => void;
  onDeny: () => void;
  loading: boolean;
}

export function ContextGlass({ decision, onGrant, onDeny, loading }: ContextGlassProps) {
  if (!decision) {
    return (
      <GlassPanel
        variant="heavy"
        className="h-full flex items-center justify-center"
      >
        <motion.div
          className="text-center"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-5xl block mb-4">◈</span>
          <p className="text-muted text-sm">Select an orb to view details</p>
        </motion.div>
      </GlassPanel>
    );
  }

  return (
    <motion.div
      key={decision.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <GlassPanel
        variant="heavy"
        glow="decision"
        className="h-full p-8 flex flex-col"
        style={{ borderColor: "rgba(255,184,0,0.15)" }}
      >
        {/* Task Info */}
        <div className="mb-6">
          <p className="text-xs text-decision uppercase tracking-widest mb-2">
            Blocked Task
          </p>
          <h2 className="font-display text-2xl text-text mb-2">
            {decision.task?.title}
          </h2>
          {decision.task?.description && (
            <p className="text-sm text-muted leading-relaxed">
              {decision.task.description}
            </p>
          )}
        </div>

        {/* Requester */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-panel bg-white/3">
          {decision.requester && (
            <img
              src={decision.requester.avatarUrl || ""}
              alt={decision.requester.name}
              className="w-10 h-10 rounded-full bg-white/10"
            />
          )}
          <div>
            <p className="text-sm text-text">{decision.requester?.name}</p>
            <p className="text-xs text-muted">
              Requested {formatRelativeTime(decision.createdAt)}
            </p>
          </div>
        </div>

        {/* Context Reason */}
        <div className="flex-1 mb-8">
          <h3 className="font-display text-sm text-muted uppercase tracking-widest mb-3">
            Context
          </h3>
          <p className="text-sm text-text/90 leading-relaxed bg-white/3 p-4 rounded-panel border border-white/5">
            {decision.contextReason}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onGrant}
            disabled={loading}
            className="flex-1 py-3 rounded-pill bg-primary text-background font-display text-sm tracking-wide transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing..." : "Grant Access"}
          </button>
          <button
            onClick={onDeny}
            disabled={loading}
            className="flex-1 py-3 rounded-pill bg-urgent/20 text-urgent font-display text-sm tracking-wide transition-all hover:bg-urgent/30 hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            Deny
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create `src/app/decisions/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { OrbList } from "@/components/decisions/OrbList";
import { ContextGlass } from "@/components/decisions/ContextGlass";
import type { DecisionOrb } from "@/lib/types";

export default function DecisionNexus() {
  const [decisions, setDecisions] = useState<DecisionOrb[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDecisions = async () => {
    try {
      const res = await fetch("/api/decisions");
      const data = await res.json();
      setDecisions(data);
    } catch (error) {
      console.error("Failed to fetch decisions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const selectedDecision = decisions.find((d) => d.id === selectedId) || null;

  const handleAction = async (status: "granted" | "denied") => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await fetch(`/api/decisions/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSelectedId(null);
      await fetchDecisions();
    } catch (error) {
      console.error("Failed to update decision:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="font-display text-2xl text-text mb-6">Decision Nexus</h1>
      <div className="flex gap-6 h-[calc(100vh-130px)]">
        {/* Left: Orb List (30%) */}
        <div className="w-[30%] shrink-0">
          <OrbList
            decisions={decisions}
            selectedId={selectedId}
            onSelect={(d) => setSelectedId(d.id)}
          />
        </div>

        {/* Right: Context Glass (70%) */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <ContextGlass
              key={selectedId || "empty"}
              decision={selectedDecision}
              onGrant={() => handleAction("granted")}
              onDeny={() => handleAction("denied")}
              loading={actionLoading}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify Decision Nexus**

Navigate to `http://localhost:3000/decisions`. Expected:
- Left panel shows pending decision orbs with amber pulsing dots
- Clicking an orb shows full context in the right panel
- Grant/Deny buttons work — orb disappears from list after action

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build Decision Nexus page with OrbList and ContextGlass"
```

---

## Task 8: Team Orbit Page

**Files:**
- Create: `src/app/team/page.tsx`
- Create: `src/components/team/UserPlanet.tsx`
- Create: `src/components/team/LoadRing.tsx`
- Create: `src/components/team/FilterBar.tsx`

**Interfaces:**
- Consumes: `GlassPanel` from `@/components/shared/GlassPanel`, types from `@/lib/types`
- Produces: Team Orbit page at `/team` route, `UserPlanet` component (props: `user: User`, `index: number`), `LoadRing` component (props: `taskCount: number`, `capacity: number`, `size?: number`), `FilterBar` component (props: `activeFilter: FilterOption`, `onFilterChange: (f) => void`)

- [ ] **Step 1: Create `src/components/team/LoadRing.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";

interface LoadRingProps {
  taskCount: number;
  capacity: number;
  size?: number;
}

export function LoadRing({ taskCount, capacity, size = 100 }: LoadRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(taskCount / capacity, 1);
  const dashOffset = circumference * (1 - progress);
  const isOverloaded = taskCount >= capacity;

  const strokeColor = isOverloaded
    ? "var(--color-urgent)"
    : "var(--color-primary)";

  return (
    <svg width={size} height={size} className="absolute inset-0">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={4}
      />
      {/* Progress ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          filter: isOverloaded
            ? "drop-shadow(0 0 8px rgba(255,51,102,0.4))"
            : "drop-shadow(0 0 8px rgba(0,229,255,0.3))",
        }}
      />
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/components/team/UserPlanet.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { LoadRing } from "./LoadRing";
import type { User } from "@/lib/types";

interface UserPlanetProps {
  user: User;
  index: number;
}

export function UserPlanet({ user, index }: UserPlanetProps) {
  const taskCount = user.taskCount || 0;

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Avatar with Load Ring */}
      <div className="relative" style={{ width: 100, height: 100 }}>
        <LoadRing
          taskCount={taskCount}
          capacity={user.capacityLimit}
          size={100}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={user.avatarUrl || ""}
            alt={user.name}
            className="w-[70px] h-[70px] rounded-full bg-white/10"
          />
        </div>
      </div>

      {/* Name */}
      <p className="font-display text-sm text-text text-center">{user.name}</p>

      {/* Status + Load */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            user.status === "active"
              ? "bg-primary"
              : user.status === "blocked"
              ? "bg-urgent"
              : "bg-muted"
          }`}
        />
        <span className="text-xs text-muted font-mono">
          {taskCount}/{user.capacityLimit}
        </span>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create `src/components/team/FilterBar.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { UserStatus } from "@/lib/types";

type FilterOption = "all" | UserStatus;

interface FilterBarProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const filters: { label: string; value: FilterOption }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
  { label: "Available", value: "available" },
];

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <GlassPanel className="inline-flex gap-1 p-1 !rounded-pill">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`relative px-4 py-1.5 text-xs font-body tracking-wide rounded-pill transition-colors cursor-pointer ${
            activeFilter === filter.value
              ? "text-background"
              : "text-muted hover:text-text"
          }`}
        >
          {activeFilter === filter.value && (
            <motion.div
              className="absolute inset-0 bg-primary rounded-pill"
              layoutId="filterActive"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          )}
          <span className="relative z-10">{filter.label}</span>
        </button>
      ))}
    </GlassPanel>
  );
}
```

- [ ] **Step 4: Create `src/app/team/page.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlanet } from "@/components/team/UserPlanet";
import { FilterBar } from "@/components/team/FilterBar";
import type { User, UserStatus } from "@/lib/types";

type FilterOption = "all" | UserStatus;

export default function TeamOrbit() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredUsers = filter === "all"
    ? users
    : users.filter((u) => u.status === filter);

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-text">Team Orbit</h1>
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-12 justify-center py-16">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-[100px] h-[140px] rounded-full animate-shimmer"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-12 justify-center py-8">
          {filteredUsers.map((user, i) => (
            <motion.div
              key={user.id}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0.1,
                scale: 0.95,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <UserPlanet user={user} index={i} />
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <motion.p
              className="text-muted text-sm py-16"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              No team members match this filter
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify Team Orbit page**

Navigate to `http://localhost:3000/team`. Expected:
- Filter bar at top with All / Active / Blocked / Available toggles
- User avatars displayed with SVG load rings showing capacity
- Filtering changes which users are visible
- Hover on a user planet scales it slightly

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build Team Orbit page with UserPlanet, LoadRing, FilterBar"
```

---

## Task 9: Polish & Integration

**Files:**
- Modify: `src/app/globals.css` (add select styling for dark dropdowns)
- Modify: `TRACKER.md` (update all phases to complete)

**Interfaces:**
- Consumes: All components and pages from Tasks 1-8
- Produces: Final polished, navigable application

- [ ] **Step 1: Add dark-mode form styling to `src/app/globals.css`**

Add at the end of the file:

```css
/* Dark mode form elements */
select option {
  background-color: #1a1d24;
  color: var(--color-text);
}

input::placeholder,
textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 2: Full navigation flow test**

Start the dev server and verify:

1. **Overview Nebula (`/`)**: Task cards load, decision dock shows orbs, system vitals show counts
2. **Create Task**: Click `+` → fill form → "Launch Task" → new card appears in grid
3. **Task Detail**: Click a task card → modal opens with title, description, status, timeline
4. **Edit Task**: Click "Edit" in modal → change fields → "Save" → modal closes, card updates
5. **Delete Task**: Edit mode → "Delete" → "Confirm" → card disappears
6. **Status Change**: Click "Start"/"Block"/"Complete" buttons in task detail → status updates
7. **Decision Nexus (`/decisions`)**: Left panel shows orbs, clicking shows context, Grant/Deny works
8. **Team Orbit (`/team`)**: User planets with load rings, filter bar works
9. **Sidebar Navigation**: All three nav links work and highlight active state

- [ ] **Step 3: Run build check**

```bash
cd /home/shiftd/code/orbittm
npm run build
```

Expected: Build completes without errors. Fix any TypeScript or lint issues.

- [ ] **Step 4: Commit polish changes**

```bash
git add -A
git commit -m "feat: polish and integration — Orbit System phases 2-5 complete"
```

- [ ] **Step 5: Update TRACKER.md**

Update the `TRACKER.md` file to reflect all completed phases:
- Phase 2: All tasks ✅
- Phase 3: All tasks ✅
- Phase 4: All tasks ✅
- Phase 5: All tasks ✅
- Phase 6: Loading states ✅, Empty states ✅, Navigation flow ✅
- Quick Status: Current Phase → Phase 6, Overall → 🟢 Complete

```bash
git add TRACKER.md
git commit -m "docs: update TRACKER.md — all phases complete"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ Phase 2 — Overview Nebula: page layout, TaskCard, DecisionOrb, DecisionDock, API GET /tasks, API GET /stats, wired to page
- ✅ Phase 3 — Task Node Detail: modal overlay, Timeline component, collaborators (via assigned user), API GET /tasks/[id]
- ✅ Phase 4 — Decision Nexus: page layout, OrbList, ContextGlass, API GET /decisions, API PATCH /decisions/[id], optimistic UI
- ✅ Phase 5 — Team Orbit: page layout, UserPlanet, LoadRing, FilterBar, API GET /users
- ✅ Task CRUD addendum: CreateTaskModal, edit in TaskNodeDetail, delete with confirmation
- ✅ Phase 6 partial: Empty states, loading skeletons, navigation flow

**2. Placeholder scan:** No TBD, TODO, or incomplete sections found.

**3. Type consistency:** All types use the same interfaces from `@/lib/types`. `CreateTaskInput` and `UpdateTaskInput` added in Task 2. API responses match the `Task`, `DecisionOrb`, `User`, `TimelineEvent`, `SystemStat` types. Component prop types are consistent across usage sites.
