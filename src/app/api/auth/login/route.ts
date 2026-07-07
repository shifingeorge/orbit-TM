import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()));

    // Uniform failure for unknown email OR bad password — no user enumeration.
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user.id, user.role);

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
