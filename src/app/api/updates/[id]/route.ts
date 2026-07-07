import { db } from "@/db";
import { taskUpdates, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireSession, forbidIfNotOwner } from "@/lib/auth";

/** Loads an update plus its parent task's assignee, for the ownership check. */
async function loadOwnership(id: string) {
  const [row] = await db
    .select({ updateId: taskUpdates.id, assignedUserId: tasks.assignedUserId })
    .from(taskUpdates)
    .leftJoin(tasks, eq(taskUpdates.taskId, tasks.id))
    .where(eq(taskUpdates.id, id));
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
    const { body } = await request.json();

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json({ error: "Update body is required" }, { status: 400 });
    }

    const row = await loadOwnership(id);
    if (!row) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }
    const ownershipError = forbidIfNotOwner(auth.session, row.assignedUserId);
    if (ownershipError) return ownershipError;

    const [updated] = await db
      .update(taskUpdates)
      .set({ body: body.trim() })
      .where(eq(taskUpdates.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }
    const ownershipError = forbidIfNotOwner(auth.session, row.assignedUserId);
    if (ownershipError) return ownershipError;

    await db.delete(taskUpdates).where(eq(taskUpdates.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete update" }, { status: 500 });
  }
}
