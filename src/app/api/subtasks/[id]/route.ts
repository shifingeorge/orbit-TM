import { db } from "@/db";
import { subtasks, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireSession, forbidIfNotOwner } from "@/lib/auth";

/** Loads a subtask plus its parent task's assignee, for the ownership check. */
async function loadOwnership(id: string) {
  const [row] = await db
    .select({ subtaskId: subtasks.id, assignedUserId: tasks.assignedUserId })
    .from(subtasks)
    .leftJoin(tasks, eq(subtasks.taskId, tasks.id))
    .where(eq(subtasks.id, id));
  return row;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const { done } = await request.json();

    if (typeof done !== "boolean") {
      return NextResponse.json({ error: "done must be a boolean" }, { status: 400 });
    }

    const row = await loadOwnership(id);
    if (!row) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }
    const ownershipError = forbidIfNotOwner(auth.session, row.assignedUserId);
    if (ownershipError) return ownershipError;

    const [updated] = await db
      .update(subtasks)
      .set({ done })
      .where(eq(subtasks.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  try {
    const { id } = await params;

    const row = await loadOwnership(id);
    if (!row) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }
    const ownershipError = forbidIfNotOwner(auth.session, row.assignedUserId);
    if (ownershipError) return ownershipError;

    await db.delete(subtasks).where(eq(subtasks.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}
