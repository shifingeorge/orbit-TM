import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
