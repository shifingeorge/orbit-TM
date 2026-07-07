// Standalone, additive seed script for demo `decisionOrbs` rows.
//
// A "decision" in Orbit is a request attached to a task that needs a
// manager's yes/no before work can proceed (e.g. spend budget, approve a
// maintenance window, greenlight a content idea). This script inserts a
// small, varied set of decisions — pending, granted, and denied — against
// EXISTING tasks/users so the Decisions page has realistic demo data to
// show what the feature is for. It never deletes or updates existing rows;
// it only inserts new ones, so it's safe to run against a live dev DB.
//
// Usage: npm run seed:decisions

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

async function seedDecisions() {
  const url = new URL(process.env.DATABASE_URL!);
  url.hostname = url.hostname.replace("-pooler.", ".");
  neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;

  const sql = neon(url.toString());
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding demo decisions...");

  const allTasks = await db.select().from(schema.tasks);
  const allUsers = await db.select().from(schema.users);

  if (allTasks.length === 0 || allUsers.length === 0) {
    console.error("❌ No tasks or users found — run `npx tsx src/db/seed.ts` first.");
    process.exit(1);
  }

  const findTask = (title: string) => allTasks.find((t) => t.title === title) ?? allTasks[0];
  const findUser = (name: string) => allUsers.find((u) => u.name === name) ?? allUsers[0];

  const pushTask = findTask("Mobile Push Notification System");
  const onboardingTask = findTask("User Onboarding Flow v2");
  const indexTask = findTask("Database Index Audit");
  const testTask = findTask("CRUD Test Task");

  const luna = findUser("Luna Park");
  const zara = findUser("Zara Mitchell");
  const aria = findUser("Aria Chen");
  const ravi = findUser("Ravi Patel");

  const now = Date.now();

  const inserted = await db
    .insert(schema.decisionOrbs)
    .values([
      // 1. Pending infra approval
      {
        taskId: pushTask.id,
        requestedBy: luna.id,
        contextReason:
          "Mobile push notifications need a Firebase Cloud Messaging + APNs project provisioned under the company billing account (~$40/mo at expected volume). Need approval before infra can be stood up.",
        status: "pending" as const,
      },
      // 2. Content-idea style request
      {
        taskId: onboardingTask.id,
        requestedBy: zara.id,
        contextReason:
          "Reels series on delivery-time insights — need approval to spend 2 days filming a short-form video series around the new onboarding flow, showcasing the delivery-time improvements to prospective customers.",
        status: "pending" as const,
      },
      // 3. Granted example
      {
        taskId: indexTask.id,
        requestedBy: aria.id,
        contextReason:
          "Index audit found 3 large tables need a maintenance-window rebuild (CONCURRENTLY, ~20 min each). Requesting approval to run during tonight's low-traffic window.",
        status: "granted" as const,
        resolvedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      },
      // 4. Denied example
      {
        taskId: testTask.id,
        requestedBy: ravi.id,
        contextReason:
          "Requesting approval to keep the CRUD test task and its seeded data permanently in production as a smoke-test fixture instead of removing it after QA.",
        status: "denied" as const,
        resolvedAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      },
    ])
    .returning();

  console.log(`✅ Inserted ${inserted.length} decision orbs`);

  // Sanity check: confirm they're readable back via a scoped query.
  const check = await db
    .select({ id: schema.decisionOrbs.id, status: schema.decisionOrbs.status })
    .from(schema.decisionOrbs)
    .where(eq(schema.decisionOrbs.taskId, pushTask.id));
  console.log(`🔎 Verification query on task "${pushTask.title}" found ${check.length} decision(s)`);

  console.log("\n🎉 Demo decisions seeded!");
}

seedDecisions().catch((err) => {
  console.error(err);
  process.exit(1);
});
