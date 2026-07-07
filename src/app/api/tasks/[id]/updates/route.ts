import { db } from "@/db";
import { tasks, taskUpdates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { body, authorId } = await request.json();

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json({ error: "Update body is required" }, { status: 400 });
    }
    if (!authorId || typeof authorId !== "string") {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }

    const [task] = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, id));
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const [created] = await db
      .insert(taskUpdates)
      .values({ taskId: id, authorId, body: body.trim() })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 });
  }
}
