import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...");

  // Shared demo password for all seeded accounts: "orbittm123".
  const passwordHash = await bcrypt.hash("orbittm123", 10);

  // Seed users. Aria = founder, Marcus = manager, everyone else = staff.
  const insertedUsers = await db
    .insert(schema.users)
    .values([
      { name: "Aria Chen", email: "aria@orbittm.dev", passwordHash, role: "founder" as const, avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=aria", status: "active" as const, capacityLimit: 5 },
      { name: "Marcus Webb", email: "marcus@orbittm.dev", passwordHash, role: "manager" as const, avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=marcus", status: "active" as const, capacityLimit: 4 },
      { name: "Luna Park", email: "luna@orbittm.dev", passwordHash, role: "staff" as const, avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=luna", status: "available" as const, capacityLimit: 6 },
      { name: "Kai Nakamura", email: "kai@orbittm.dev", passwordHash, role: "staff" as const, avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=kai", status: "blocked" as const, capacityLimit: 4 },
      { name: "Zara Mitchell", email: "zara@orbittm.dev", passwordHash, role: "staff" as const, avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=zara", status: "active" as const, capacityLimit: 5 },
      { name: "Ravi Patel", email: "ravi@orbittm.dev", passwordHash, role: "staff" as const, avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=ravi", status: "active" as const, capacityLimit: 3 },
    ])
    .returning();

  console.log(`✅ Seeded ${insertedUsers.length} users`);

  // Seed tasks
  const insertedTasks = await db
    .insert(schema.tasks)
    .values([
      { title: "API Gateway Migration", description: "Migrate the legacy REST gateway to the new GraphQL mesh architecture. Requires coordination with Platform team.", status: "active" as const, urgencyLevel: "high" as const, assignedUserId: insertedUsers[0].id },
      { title: "Auth Token Rotation", description: "Implement automated token rotation for service-to-service authentication. Current tokens expire in 72 hours.", status: "active" as const, urgencyLevel: "critical" as const, assignedUserId: insertedUsers[1].id },
      { title: "Dashboard Analytics Pipeline", description: "Set up real-time event streaming for the new analytics dashboard. Uses Kafka + ClickHouse.", status: "pending" as const, urgencyLevel: "medium" as const, assignedUserId: insertedUsers[2].id },
      { title: "CI/CD Pipeline Optimization", description: "Reduce build times from 18 min to under 5 min. Investigate caching, parallelization, and image layer optimization.", status: "blocked" as const, urgencyLevel: "high" as const, assignedUserId: insertedUsers[3].id },
      { title: "User Onboarding Flow v2", description: "Redesign the onboarding experience with progressive disclosure and contextual tooltips.", status: "active" as const, urgencyLevel: "low" as const, assignedUserId: insertedUsers[4].id },
      { title: "Database Index Audit", description: "Audit and optimize PostgreSQL indexes. Several queries are hitting sequential scans on tables > 10M rows.", status: "active" as const, urgencyLevel: "medium" as const, assignedUserId: insertedUsers[0].id },
      { title: "SSO Integration - Okta", description: "Integrate Okta SSO for enterprise customers. Requires SAML 2.0 and SCIM provisioning.", status: "blocked" as const, urgencyLevel: "critical" as const, assignedUserId: insertedUsers[5].id },
      { title: "Mobile Push Notification System", description: "Build push notification infrastructure using FCM and APNs. Needs batching and rate limiting.", status: "pending" as const, urgencyLevel: "medium" as const, assignedUserId: insertedUsers[2].id },
    ])
    .returning();

  console.log(`✅ Seeded ${insertedTasks.length} tasks`);

  // Seed decision orbs (for blocked tasks)
  const blockedTasks = insertedTasks.filter((t) => t.status === "blocked");
  const insertedDecisions = await db
    .insert(schema.decisionOrbs)
    .values([
      {
        taskId: blockedTasks[0].id,
        requestedBy: insertedUsers[3].id,
        contextReason: "CI/CD pipeline requires approval to upgrade the base Docker image from Node 18 to Node 22. This is a breaking change that affects 12 downstream services. Need management sign-off before proceeding.",
        status: "pending" as const,
      },
      {
        taskId: blockedTasks[1].id,
        requestedBy: insertedUsers[5].id,
        contextReason: "Okta SSO integration requires purchasing an enterprise license ($24,000/year). Legal has reviewed the contract. Awaiting budget approval from VP Engineering.",
        status: "pending" as const,
      },
      {
        taskId: insertedTasks[1].id,
        requestedBy: insertedUsers[1].id,
        contextReason: "Auth token rotation will cause a 30-second service disruption during the first rotation. Need approval for a maintenance window this Saturday 2:00-2:05 AM UTC.",
        status: "pending" as const,
      },
    ])
    .returning();

  console.log(`✅ Seeded ${insertedDecisions.length} decision orbs`);

  // Seed timeline events
  const timelineEvents = [];
  for (const task of insertedTasks) {
    timelineEvents.push({
      taskId: task.id,
      event: "Task created",
      actorId: task.assignedUserId,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
    if (task.assignedUserId) {
      timelineEvents.push({
        taskId: task.id,
        event: "Assigned to team member",
        actorId: task.assignedUserId,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      });
    }
    if (task.status === "active") {
      timelineEvents.push({
        taskId: task.id,
        event: "Work started",
        actorId: task.assignedUserId,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    }
    if (task.status === "blocked") {
      timelineEvents.push({
        taskId: task.id,
        event: "Blocked — awaiting decision",
        actorId: task.assignedUserId,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
    }
  }

  await db.insert(schema.taskTimeline).values(timelineEvents);
  console.log(`✅ Seeded ${timelineEvents.length} timeline events`);

  console.log("\n🎉 Seeding complete!");
}

seed().catch(console.error);
