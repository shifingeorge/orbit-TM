import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import * as schema from "./schema";
import type { UserRole } from "@/lib/types";

/**
 * One-time backfill for the auth columns added in Phase 4. Existing users
 * predate email/password/role, so we assign:
 *   - email:   <first-name-lowercased>@orbittm.dev
 *   - password: shared demo password "orbittm123" (bcrypt hashed)
 *   - role:    Aria = founder, Marcus = manager, everyone else = staff
 * Idempotent: only fills rows whose email is still null.
 */
async function backfill() {
  const passwordHash = await bcrypt.hash("orbittm123", 10);

  const roleFor = (name: string): UserRole => {
    const first = name.split(" ")[0].toLowerCase();
    if (first === "aria") return "founder";
    if (first === "marcus") return "manager";
    return "staff";
  };

  const all = await db.select().from(schema.users);
  let updated = 0;

  const seen = new Set<string>();
  for (const user of all) {
    if (user.email) {
      seen.add(user.email.toLowerCase());
      continue;
    }
    const first = user.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    let email = `${first}@orbittm.dev`;
    // Guard against duplicate first names producing duplicate emails.
    let n = 2;
    while (seen.has(email)) {
      email = `${first}${n}@orbittm.dev`;
      n += 1;
    }
    seen.add(email);

    await db
      .update(schema.users)
      .set({ email, passwordHash, role: roleFor(user.name) })
      .where(eq(schema.users.id, user.id));
    updated += 1;
    console.log(`  ${user.name} -> ${email} (${roleFor(user.name)})`);
  }

  console.log(`\n✅ Backfilled ${updated} user(s). Shared demo password: orbittm123`);
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
