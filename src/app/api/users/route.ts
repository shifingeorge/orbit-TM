import { db } from "@/db";
import { users, tasks } from "@/db/schema";
import { and, count, eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireManager } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const VALID_ROLES: UserRole[] = ["founder", "manager", "staff"];

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;
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

export async function POST(request: NextRequest) {
  const auth = await requireManager();
  if (auth.error) return auth.error;

  try {
    const { name, email, password, role } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail));
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
          normalizedEmail
        )}`,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        status: users.status,
        capacityLimit: users.capacityLimit,
        createdAt: users.createdAt,
      });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
