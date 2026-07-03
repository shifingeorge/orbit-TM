import { db } from "@/db";
import { tasks, users, taskTimeline } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { CreateTaskInput } from "@/lib/types";

export async function GET() {
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
      .leftJoin(users, eq(tasks.assignedUserId, users.id));

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
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
