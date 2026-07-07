import { db } from "@/db";
import { tasks, users, taskTimeline, decisionOrbs, taskUpdates, subtasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { UpdateTaskInput } from "@/lib/types";
import { requireSession, requireManager, isManager, forbidIfNotOwner } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  try {
    const { id } = await params;

    // Fetch task with assigned user
    const [task] = await db
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
      .where(eq(tasks.id, id));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const ownershipError = forbidIfNotOwner(auth.session, task.assignedUserId);
    if (ownershipError) return ownershipError;

    // Fetch timeline
    const timeline = await db
      .select({
        id: taskTimeline.id,
        taskId: taskTimeline.taskId,
        event: taskTimeline.event,
        actorId: taskTimeline.actorId,
        createdAt: taskTimeline.createdAt,
        actorName: users.name,
        actorAvatar: users.avatarUrl,
      })
      .from(taskTimeline)
      .leftJoin(users, eq(taskTimeline.actorId, users.id))
      .where(eq(taskTimeline.taskId, id))
      .orderBy(taskTimeline.createdAt);

    // Fetch decision orbs for this task
    const orbs = await db
      .select()
      .from(decisionOrbs)
      .where(eq(decisionOrbs.taskId, id));

    const updates = await db
      .select({
        id: taskUpdates.id,
        taskId: taskUpdates.taskId,
        authorId: taskUpdates.authorId,
        body: taskUpdates.body,
        createdAt: taskUpdates.createdAt,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
      })
      .from(taskUpdates)
      .leftJoin(users, eq(taskUpdates.authorId, users.id))
      .where(eq(taskUpdates.taskId, id))
      .orderBy(desc(taskUpdates.createdAt));

    const subtaskRows = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, id))
      .orderBy(subtasks.createdAt);

    return NextResponse.json({
      data: {
        ...task,
        assignedUser: task.assignedUserId
          ? { id: task.assignedUserId, name: task.assignedUserName, avatarUrl: task.assignedUserAvatar }
          : null,
        timeline: timeline.map((e) => ({
          ...e,
          actor: e.actorId ? { id: e.actorId, name: e.actorName, avatarUrl: e.actorAvatar } : null,
        })),
        decisionOrbs: orbs,
        updates: updates.map((u) => ({
          id: u.id,
          taskId: u.taskId,
          authorId: u.authorId,
          body: u.body,
          createdAt: u.createdAt,
          author: { id: u.authorId, name: u.authorName, avatarUrl: u.authorAvatar },
        })),
        subtasks: subtaskRows,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  const { session } = auth;
  try {
    const { id } = await params;
    const body: UpdateTaskInput = await request.json();

    const [existing] = await db
      .select({ assignedUserId: tasks.assignedUserId })
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const ownershipError = forbidIfNotOwner(session, existing.assignedUserId);
    if (ownershipError) return ownershipError;

    // Staff may only change status on their own task; managers may edit anything.
    if (
      !isManager(session.role) &&
      (body.title !== undefined ||
        body.description !== undefined ||
        body.urgencyLevel !== undefined ||
        body.assignedUserId !== undefined)
    ) {
      return NextResponse.json(
        { error: "Staff may only change task status" },
        { status: 403 }
      );
    }

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
      timelineEvents.push(body.assignedUserId ? "Reassigned to team member" : "Unassigned");
    }

    const [updated] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    for (const event of timelineEvents) {
      await db.insert(taskTimeline).values({
        taskId: id,
        event,
        actorId: session.userId,
      });
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireManager();
  if (auth.error) return auth.error;
  try {
    const { id } = await params;

    await db.delete(taskTimeline).where(eq(taskTimeline.taskId, id));
    await db.delete(decisionOrbs).where(eq(decisionOrbs.taskId, id));

    const [deleted] = await db.delete(tasks).where(eq(tasks.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
