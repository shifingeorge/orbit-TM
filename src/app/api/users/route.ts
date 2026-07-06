import { db } from "@/db";
import { users, tasks } from "@/db/schema";
import { and, count, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({ user: users, taskCount: count(tasks.id) })
      .from(users)
      .leftJoin(
        tasks,
        and(eq(tasks.assignedUserId, users.id), ne(tasks.status, "completed"))
      )
      .groupBy(users.id)
      .orderBy(users.name);

    const data = rows.map(({ user, taskCount }) => ({
      ...user,
      taskCount: Number(taskCount),
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
