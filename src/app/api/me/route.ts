import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, auth.session.userId));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: user });
}
