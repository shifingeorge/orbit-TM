import { db } from "@/db";
import { tasks, subtasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [task] = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, id));
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const [created] = await db
      .insert(subtasks)
      .values({ taskId: id, title: title.trim() })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}
