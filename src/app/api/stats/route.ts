import { db } from "@/db";
import { tasks, users, decisionOrbs } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;
  try {
    const [taskStats] = await db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${tasks.status} = 'active' THEN 1 END`),
        blocked: count(sql`CASE WHEN ${tasks.status} = 'blocked' THEN 1 END`),
        completed: count(sql`CASE WHEN ${tasks.status} = 'completed' THEN 1 END`),
      })
      .from(tasks);

    const [userStats] = await db.select({ total: count() }).from(users);

    const [decisionStats] = await db
      .select({
        pending: count(sql`CASE WHEN ${decisionOrbs.status} = 'pending' THEN 1 END`),
      })
      .from(decisionOrbs);

    const total = Number(taskStats.total) || 1;
    const completed = Number(taskStats.completed) || 0;
    const efficiency = ((completed / total) * 100).toFixed(1);

    return NextResponse.json({
      data: [
        { label: "Efficiency", value: `${efficiency}%`, trend: "stable" as const },
        { label: "Active", value: String(taskStats.active), trend: "up" as const },
        {
          label: "Blocked",
          value: String(taskStats.blocked),
          trend: taskStats.blocked > 0 ? ("down" as const) : ("stable" as const),
        },
        { label: "Team", value: String(userStats.total), trend: "stable" as const },
        {
          label: "Pending decisions",
          value: String(decisionStats.pending),
          trend: decisionStats.pending > 0 ? ("down" as const) : ("stable" as const),
        },
      ],
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
