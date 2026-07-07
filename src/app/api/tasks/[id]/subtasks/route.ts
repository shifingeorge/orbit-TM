import { db } from "@/db";
import { tasks, subtasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireSession, forbidIfNotOwner } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [task] = await db
      .select({ id: tasks.id, assignedUserId: tasks.assignedUserId })
      .from(tasks)
      .where(eq(tasks.id, id));
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const ownershipError = forbidIfNotOwner(auth.session, task.assignedUserId);
    if (ownershipError) return ownershipError;

    const [created] = await db
      .insert(subtasks)
      .values({ taskId: id, title: title.trim() })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}
