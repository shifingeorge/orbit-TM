import { db } from "@/db";
import { users, tasks } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        status: users.status,
        capacityLimit: users.capacityLimit,
        createdAt: users.createdAt,
        taskCount: count(tasks.id),
      })
      .from(users)
      .leftJoin(tasks, eq(users.id, tasks.assignedUserId))
      .groupBy(users.id);

    return NextResponse.json({ data: allUsers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
