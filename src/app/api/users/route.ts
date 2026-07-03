import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);

    return NextResponse.json({ data: allUsers });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
