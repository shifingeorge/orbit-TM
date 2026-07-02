import { db } from "@/db";
import { decisionOrbs, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allDecisions = await db
      .select({
        id: decisionOrbs.id,
        taskId: decisionOrbs.taskId,
        requestedBy: decisionOrbs.requestedBy,
        contextReason: decisionOrbs.contextReason,
        status: decisionOrbs.status,
        createdAt: decisionOrbs.createdAt,
        resolvedAt: decisionOrbs.resolvedAt,
        taskTitle: tasks.title,
      })
      .from(decisionOrbs)
      .leftJoin(tasks, eq(decisionOrbs.taskId, tasks.id));

    const formatted = allDecisions.map((d) => ({
      id: d.id,
      taskId: d.taskId,
      requestedBy: d.requestedBy,
      contextReason: d.contextReason,
      status: d.status,
      createdAt: d.createdAt,
      resolvedAt: d.resolvedAt,
      task: d.taskTitle ? { id: d.taskId, title: d.taskTitle } : undefined,
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}
