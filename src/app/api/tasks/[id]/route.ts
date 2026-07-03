import { db } from "@/db";
import { tasks, users, taskTimeline, decisionOrbs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}
