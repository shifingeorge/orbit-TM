import { db } from "@/db";
import { decisionOrbs, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireManager } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireManager();
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["granted", "denied"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the decision orb
    const [updatedOrb] = await db
      .update(decisionOrbs)
      .set({ status, resolvedAt: new Date() })
      .where(eq(decisionOrbs.id, id))
      .returning();

    if (!updatedOrb) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    // If granted, unblock the associated task (standalone requests have none)
    if (status === "granted" && updatedOrb.taskId) {
      await db
        .update(tasks)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(tasks.id, updatedOrb.taskId));
    }

    return NextResponse.json({ data: updatedOrb });
  } catch {
    return NextResponse.json({ error: "Failed to update decision" }, { status: 500 });
  }
}
