import { db } from "@/db";
import { subtasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { done } = await request.json();

    if (typeof done !== "boolean") {
      return NextResponse.json({ error: "done must be a boolean" }, { status: 400 });
    }

    const [updated] = await db
      .update(subtasks)
      .set({ done })
      .where(eq(subtasks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db.delete(subtasks).where(eq(subtasks.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}
