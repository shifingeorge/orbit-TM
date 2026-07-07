import { db } from "@/db";
import { decisionOrbs, tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;
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
        taskStatus: tasks.status,
        taskUrgency: tasks.urgencyLevel,
        requesterName: users.name,
        requesterAvatar: users.avatarUrl,
      })
      .from(decisionOrbs)
      .leftJoin(tasks, eq(decisionOrbs.taskId, tasks.id))
      .leftJoin(users, eq(decisionOrbs.requestedBy, users.id));

    const formatted = allDecisions.map((d) => ({
      id: d.id,
      taskId: d.taskId,
      requestedBy: d.requestedBy,
      contextReason: d.contextReason,
      status: d.status,
      createdAt: d.createdAt,
      resolvedAt: d.resolvedAt,
      task: d.taskTitle
        ? { id: d.taskId, title: d.taskTitle, status: d.taskStatus, urgencyLevel: d.taskUrgency }
        : undefined,
      requester: d.requesterName
        ? { id: d.requestedBy, name: d.requesterName, avatarUrl: d.requesterAvatar }
        : undefined,
    }));

    return NextResponse.json({ data: formatted });
  } catch {
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}
