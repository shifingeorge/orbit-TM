import { db } from "@/db";
import { tasks, users, taskTimeline, taskUpdates, subtasks } from "@/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { CreateTaskInput } from "@/lib/types";
import { requireSession, requireManager, isManager } from "@/lib/auth";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  const { session } = auth;
  try {
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        urgencyLevel: tasks.urgencyLevel,
        assignedUserId: tasks.assignedUserId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignedUserName: users.name,
        assignedUserAvatar: users.avatarUrl,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedUserId, users.id))
      .where(isManager(session.role) ? undefined : eq(tasks.assignedUserId, session.userId));

    // Latest update per task: rows come back newest-first, first hit per task wins.
    const updateRows = await db
      .select({
        taskId: taskUpdates.taskId,
        body: taskUpdates.body,
        createdAt: taskUpdates.createdAt,
        authorName: users.name,
      })
      .from(taskUpdates)
      .leftJoin(users, eq(taskUpdates.authorId, users.id))
      .orderBy(desc(taskUpdates.createdAt));

    const latestByTask = new Map<string, { body: string; authorName: string | null; createdAt: Date }>();
    for (const u of updateRows) {
      if (!latestByTask.has(u.taskId)) {
        latestByTask.set(u.taskId, { body: u.body, authorName: u.authorName, createdAt: u.createdAt });
      }
    }

    const subtaskCounts = await db
      .select({
        taskId: subtasks.taskId,
        total: count(),
        done: count(sql`CASE WHEN ${subtasks.done} THEN 1 END`),
      })
      .from(subtasks)
      .groupBy(subtasks.taskId);

    const countsByTask = new Map(subtaskCounts.map((c) => [c.taskId, c]));

    const formatted = allTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      urgencyLevel: t.urgencyLevel,
      assignedUserId: t.assignedUserId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      assignedUser:
        t.assignedUserId && t.assignedUserName
          ? { id: t.assignedUserId, name: t.assignedUserName, avatarUrl: t.assignedUserAvatar }
          : undefined,
      latestUpdate: latestByTask.get(t.id) ?? null,
      subtaskCount: Number(countsByTask.get(t.id)?.total ?? 0),
      subtaskDoneCount: Number(countsByTask.get(t.id)?.done ?? 0),
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireManager();
  if (auth.error) return auth.error;
  try {
    const body: CreateTaskInput = await request.json();
    const { title, description, urgencyLevel, assignedUserId } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(tasks)
      .values({
        title: title.trim(),
        description: description?.trim() || null,
        urgencyLevel: urgencyLevel || "medium",
        assignedUserId: assignedUserId || null,
      })
      .returning();

    await db.insert(taskTimeline).values({
      taskId: created.id,
      event: "Task created",
      actorId: assignedUserId || null,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
