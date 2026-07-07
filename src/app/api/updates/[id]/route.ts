import { db } from "@/db";
import { taskUpdates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { body } = await request.json();

    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json({ error: "Update body is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(taskUpdates)
      .set({ body: body.trim() })
      .where(eq(taskUpdates.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db.delete(taskUpdates).where(eq(taskUpdates.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete update" }, { status: 500 });
  }
}
