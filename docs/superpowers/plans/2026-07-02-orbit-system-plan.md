# Orbit System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **CRITICAL:** After completing every task, update `TRACKER.md` at the project root. This is non-negotiable. Future models resuming this project depend on it.

**Goal:** Build a sensory operational dashboard with ambient glassmorphic UI, powered by Neon DB, featuring four interconnected screens: Overview Nebula, Task Node Detail, Decision Nexus, and Team Orbit.

**Architecture:** Next.js App Router with React Server Components for data fetching, Client Components for interactive/animated elements, Drizzle ORM connecting to Neon DB serverless Postgres. Framer Motion handles all organic animations.

**Tech Stack:** Next.js 14+, React 18+, TypeScript, Tailwind CSS v3, Framer Motion, Drizzle ORM, @neondatabase/serverless, Cabinet Grotesk + Satoshi + Space Grotesk fonts

## Global Constraints

- All animations use ease-in-out sine curves — never linear
- All glass surfaces: `backdrop-filter: blur(24px)`, border `rgba(255,255,255,0.08)`
- Border radius: `24px` panels, `999px` pills
- No harsh drop shadows — only diffused colored glows
- Color tokens must use CSS custom properties from the design system
- TypeScript strict mode enabled
- All API routes return JSON with consistent `{ data, error }` shape

---

### Task 0: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/db/index.ts`, `src/db/schema.ts`, `src/db/seed.ts`
- Create: `.env.local`

**Interfaces:**
- Produces: Configured Next.js project with Tailwind, Drizzle client at `src/db/index.ts`, schema types exported from `src/db/schema.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit
```

- [ ] **Step 3: Create `.env.local` with Neon DB connection**

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/orbittm?sslmode=require
```

> User must provide their Neon DB connection string here.

- [ ] **Step 4: Configure Tailwind with design tokens**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00E5FF",
        background: "#0B0E14",
        surface: "rgba(255, 255, 255, 0.03)",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        text: "#F8FAFC",
        muted: "#94A3B8",
        urgent: "#FF3366",
        decision: "#FFB800",
      },
      fontFamily: {
        display: ["'Cabinet Grotesk'", "sans-serif"],
        body: ["'Satoshi'", "sans-serif"],
        mono: ["'Space Grotesk'", "monospace"],
      },
      borderRadius: {
        panel: "24px",
        pill: "999px",
      },
      backdropBlur: {
        glass: "24px",
        "glass-heavy": "40px",
        "glass-intense": "60px",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
        },
        "status-ripple": {
          "0%": { boxShadow: "0 0 0 0 currentColor" },
          "100%": { boxShadow: "0 0 0 12px transparent" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "pulse-glow-fast": "pulse-glow 2s ease-in-out infinite",
        "status-ripple": "status-ripple 2s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Set up global CSS with fonts and design tokens**

Replace `src/app/globals.css`:

```css
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&f[]=satoshi@400,500,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #00E5FF;
  --color-background: #0B0E14;
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text: #F8FAFC;
  --color-muted: #94A3B8;
  --color-urgent: #FF3366;
  --color-decision: #FFB800;
  --font-display: 'Cabinet Grotesk', sans-serif;
  --font-body: 'Satoshi', sans-serif;
  --font-mono: 'Space Grotesk', monospace;
  --radius-panel: 24px;
  --radius-pill: 999px;
  --blur-glass: blur(24px);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  overflow-x: hidden;
}

/* Glass surface utility */
.glass {
  background: var(--color-surface);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
}

.glass-heavy {
  background: var(--color-surface);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
}

.glass-intense {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-panel);
}

/* Glow utilities */
.glow-primary {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.1);
}

.glow-decision {
  box-shadow: 0 0 40px rgba(255, 184, 0, 0.2);
}

.glow-urgent {
  box-shadow: 0 0 40px rgba(255, 51, 102, 0.15);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
```

- [ ] **Step 6: Set up Drizzle config**

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 7: Define database schema**

Create `src/db/schema.ts`:

```typescript
import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "available", "blocked"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "active", "blocked", "completed"]);
export const urgencyEnum = pgEnum("urgency_level", ["low", "medium", "high", "critical"]);
export const decisionStatusEnum = pgEnum("decision_status", ["pending", "granted", "denied"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  status: userStatusEnum("status").default("active").notNull(),
  capacityLimit: integer("capacity_limit").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  urgencyLevel: urgencyEnum("urgency_level").default("medium").notNull(),
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const decisionOrbs = pgTable("decision_orbs", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  requestedBy: uuid("requested_by").references(() => users.id).notNull(),
  contextReason: text("context_reason").notNull(),
  status: decisionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const taskTimeline = pgTable("task_timeline", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  event: varchar("event", { length: 255 }).notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 8: Create Drizzle client with Neon connection**

Create `src/db/index.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 9: Create seed data script**

Create `src/db/seed.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...");

  // Seed users
  const insertedUsers = await db
    .insert(schema.users)
    .values([
      { name: "Aria Chen", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=aria", status: "active", capacityLimit: 5 },
      { name: "Marcus Webb", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=marcus", status: "active", capacityLimit: 4 },
      { name: "Luna Park", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=luna", status: "available", capacityLimit: 6 },
      { name: "Kai Nakamura", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=kai", status: "blocked", capacityLimit: 4 },
      { name: "Zara Mitchell", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=zara", status: "active", capacityLimit: 5 },
      { name: "Ravi Patel", avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=ravi", status: "active", capacityLimit: 3 },
    ])
    .returning();

  console.log(`✅ Seeded ${insertedUsers.length} users`);

  // Seed tasks
  const insertedTasks = await db
    .insert(schema.tasks)
    .values([
      { title: "API Gateway Migration", description: "Migrate the legacy REST gateway to the new GraphQL mesh architecture. Requires coordination with Platform team.", status: "active", urgencyLevel: "high", assignedUserId: insertedUsers[0].id },
      { title: "Auth Token Rotation", description: "Implement automated token rotation for service-to-service authentication. Current tokens expire in 72 hours.", status: "active", urgencyLevel: "critical", assignedUserId: insertedUsers[1].id },
      { title: "Dashboard Analytics Pipeline", description: "Set up real-time event streaming for the new analytics dashboard. Uses Kafka + ClickHouse.", status: "pending", urgencyLevel: "medium", assignedUserId: insertedUsers[2].id },
      { title: "CI/CD Pipeline Optimization", description: "Reduce build times from 18 min to under 5 min. Investigate caching, parallelization, and image layer optimization.", status: "blocked", urgencyLevel: "high", assignedUserId: insertedUsers[3].id },
      { title: "User Onboarding Flow v2", description: "Redesign the onboarding experience with progressive disclosure and contextual tooltips.", status: "active", urgencyLevel: "low", assignedUserId: insertedUsers[4].id },
      { title: "Database Index Audit", description: "Audit and optimize PostgreSQL indexes. Several queries are hitting sequential scans on tables > 10M rows.", status: "active", urgencyLevel: "medium", assignedUserId: insertedUsers[0].id },
      { title: "SSO Integration - Okta", description: "Integrate Okta SSO for enterprise customers. Requires SAML 2.0 and SCIM provisioning.", status: "blocked", urgencyLevel: "critical", assignedUserId: insertedUsers[5].id },
      { title: "Mobile Push Notification System", description: "Build push notification infrastructure using FCM and APNs. Needs batching and rate limiting.", status: "pending", urgencyLevel: "medium", assignedUserId: insertedUsers[2].id },
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
        status: "pending",
      },
      {
        taskId: blockedTasks[1].id,
        requestedBy: insertedUsers[5].id,
        contextReason: "Okta SSO integration requires purchasing an enterprise license ($24,000/year). Legal has reviewed the contract. Awaiting budget approval from VP Engineering.",
        status: "pending",
      },
      {
        taskId: insertedTasks[1].id,
        requestedBy: insertedUsers[1].id,
        contextReason: "Auth token rotation will cause a 30-second service disruption during the first rotation. Need approval for a maintenance window this Saturday 2:00-2:05 AM UTC.",
        status: "pending",
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
```

- [ ] **Step 10: Push schema to Neon DB and run seed**

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

- [ ] **Step 11: Create placeholder root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit System",
  description: "Sensory operational dashboard — a living, breathing ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 12: Create placeholder home page**

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="font-display text-4xl text-primary animate-pulse-glow">
        Orbit System
      </h1>
    </main>
  );
}
```

- [ ] **Step 13: Verify project runs**

```bash
npm run dev
```

Expected: Dev server starts on `http://localhost:3000`, shows "Orbit System" text with pulsing cyan glow.

- [ ] **Step 14: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Orbit System — Next.js, Tailwind, Drizzle, Neon DB"
```

- [ ] **Step 15: Update TRACKER.md**

Set Phase 0 tasks 0.1–0.8 to ✅, update "Current Phase" to "Phase 1", update "Last Updated" timestamp.

---

### Task 1: Layout Shell & Shared Components

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/SystemVitals.tsx`
- Create: `src/components/shared/GlassPanel.tsx`
- Create: `src/components/shared/StatusPulse.tsx`
- Create: `src/lib/types.ts`
- Create: `src/lib/utils.ts`

**Interfaces:**
- Consumes: Tailwind config, globals.css, design tokens
- Produces: `<Sidebar />` (nav items array prop), `<SystemVitals />` (stats array prop), `<GlassPanel />` (children + className prop), `<StatusPulse color={string} speed={"normal"|"fast"} />`, shared types for User, Task, DecisionOrb, TimelineEvent

- [ ] **Step 1: Create shared TypeScript types**

Create `src/lib/types.ts`:

```typescript
export type UserStatus = "active" | "available" | "blocked";
export type TaskStatus = "pending" | "active" | "blocked" | "completed";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type DecisionStatus = "pending" | "granted" | "denied";

export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: UserStatus;
  capacityLimit: number;
  createdAt: string;
  taskCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  urgencyLevel: UrgencyLevel;
  assignedUserId: string | null;
  assignedUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionOrb {
  id: string;
  taskId: string;
  requestedBy: string;
  contextReason: string;
  status: DecisionStatus;
  createdAt: string;
  resolvedAt: string | null;
  task?: Task;
  requester?: User;
}

export interface TimelineEvent {
  id: string;
  taskId: string;
  event: string;
  actorId: string | null;
  actor?: User;
  createdAt: string;
}

export interface SystemStat {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
}
```

- [ ] **Step 2: Create utility helpers**

Create `src/lib/utils.ts`:

```typescript
import { UrgencyLevel } from "./types";

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function urgencyToColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "critical": return "var(--color-urgent)";
    case "high": return "var(--color-decision)";
    case "medium": return "var(--color-primary)";
    case "low": return "var(--color-muted)";
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
```

- [ ] **Step 3: Create GlassPanel component**

Create `src/components/shared/GlassPanel.tsx`:

```tsx
"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "heavy" | "intense";
  glow?: "primary" | "decision" | "urgent" | "none";
  children: React.ReactNode;
}

export function GlassPanel({
  variant = "default",
  glow = "none",
  children,
  className,
  ...props
}: GlassPanelProps) {
  const variantClass = {
    default: "glass",
    heavy: "glass-heavy",
    intense: "glass-intense",
  }[variant];

  const glowClass = {
    primary: "glow-primary",
    decision: "glow-decision",
    urgent: "glow-urgent",
    none: "",
  }[glow];

  return (
    <motion.div
      className={cn(variantClass, glowClass, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Create StatusPulse component**

Create `src/components/shared/StatusPulse.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface StatusPulseProps {
  color: string;
  speed?: "normal" | "fast";
  size?: number;
}

export function StatusPulse({ color, speed = "normal", size = 12 }: StatusPulseProps) {
  const duration = speed === "fast" ? 1.5 : 2.5;

  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color, opacity: 0.4 }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
    </span>
  );
}
```

- [ ] **Step 5: Create Sidebar component**

Create `src/components/layout/Sidebar.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Nebula", icon: "◉" },
  { href: "/decisions", label: "Decisions", icon: "◈" },
  { href: "/team", label: "Team", icon: "⬡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] glass flex flex-col items-center py-8 gap-2 z-50 rounded-none border-l-0 border-t-0 border-b-0">
      {/* Logo */}
      <div className="mb-8">
        <motion.div
          className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ boxShadow: ["0 0 20px rgba(0,229,255,0.2)", "0 0 40px rgba(0,229,255,0.4)", "0 0 20px rgba(0,229,255,0.2)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-primary text-lg font-bold font-display">O</span>
        </motion.div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-panel flex items-center justify-center cursor-pointer transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-text hover:bg-white/5"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 6: Create SystemVitals component**

Create `src/components/layout/SystemVitals.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { SystemStat } from "@/lib/types";

interface SystemVitalsProps {
  stats: SystemStat[];
}

export function SystemVitals({ stats }: SystemVitalsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, ease: "easeOut" }}
        >
          <GlassPanel className="px-5 py-3 flex items-center gap-3 !rounded-pill">
            <span className="text-muted text-sm font-body tracking-wide">
              {stat.label}
            </span>
            <span className="font-mono text-2xl text-text">
              {stat.value}
            </span>
            {stat.trend && (
              <span
                className={cn(
                  "text-xs",
                  stat.trend === "up" ? "text-primary" : stat.trend === "down" ? "text-urgent" : "text-muted"
                )}
              >
                {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"}
              </span>
            )}
          </GlassPanel>
        </motion.div>
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 7: Update root layout with Sidebar**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit System",
  description: "Sensory operational dashboard — a living, breathing ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <main className="ml-[72px] min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Verify layout renders**

```bash
npm run dev
```

Expected: Deep void background, left sidebar with "O" logo and three nav icons (Nebula, Decisions, Team). Active indicator on Nebula.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: layout shell — sidebar, glass panels, status pulse, system vitals"
```

- [ ] **Step 10: Update TRACKER.md**

Set Phase 1 tasks 1.1–1.5 to ✅, update "Current Phase" to "Phase 2", update "Last Updated".

---

### Task 2: Overview Nebula (Main Dashboard)

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/nebula/TaskCard.tsx`
- Create: `src/components/nebula/DecisionOrb.tsx`
- Create: `src/components/nebula/DecisionDock.tsx`
- Create: `src/app/api/tasks/route.ts`
- Create: `src/app/api/stats/route.ts`

**Interfaces:**
- Consumes: `<GlassPanel />`, `<StatusPulse />`, `<SystemVitals />`, `Task`, `DecisionOrb` types, `db` from `src/db/index.ts`, schema from `src/db/schema.ts`
- Produces: `<TaskCard task={Task} onClick={(task: Task) => void} />`, `<DecisionOrb orb={DecisionOrb} onClick={(orb: DecisionOrb) => void} />`, `<DecisionDock orbs={DecisionOrb[]} onOrbClick={(orb: DecisionOrb) => void} />`

- [ ] **Step 1: Create tasks API route**

Create `src/app/api/tasks/route.ts`:

```typescript
import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        urgencyLevel: tasks.urgencyLevel,
        assignedUserId: tasks.assignedUserId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignedUserName: users.name,
        assignedUserAvatar: users.avatarUrl,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedUserId, users.id));

    const formatted = allTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      urgencyLevel: t.urgencyLevel,
      assignedUserId: t.assignedUserId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      assignedUser: t.assignedUserId
        ? { id: t.assignedUserId, name: t.assignedUserName, avatarUrl: t.assignedUserAvatar }
        : null,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create stats API route**

Create `src/app/api/stats/route.ts`:

```typescript
import { db } from "@/db";
import { tasks, users, decisionOrbs } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [taskStats] = await db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${tasks.status} = 'active' THEN 1 END`),
        blocked: count(sql`CASE WHEN ${tasks.status} = 'blocked' THEN 1 END`),
        completed: count(sql`CASE WHEN ${tasks.status} = 'completed' THEN 1 END`),
      })
      .from(tasks);

    const [userStats] = await db
      .select({ total: count() })
      .from(users);

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
        { label: "Active Nodes", value: String(taskStats.active), trend: "up" as const },
        { label: "Blocked", value: String(taskStats.blocked), trend: taskStats.blocked > 0 ? "down" as const : "stable" as const },
        { label: "Team Online", value: String(userStats.total), trend: "stable" as const },
        { label: "Pending Decisions", value: String(decisionStats.pending), trend: decisionStats.pending > 0 ? "down" as const : "stable" as const },
      ],
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create TaskCard component**

Create `src/components/nebula/TaskCard.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { urgencyToColor, formatRelativeTime } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const urgencyColor = urgencyToColor(task.urgencyLevel);

  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "rgba(0, 229, 255, 0.4)" }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
      onClick={() => onClick(task)}
      className="cursor-pointer"
    >
      <GlassPanel
        className="w-[280px] p-5 hover:glow-primary transition-shadow duration-500"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-base text-text leading-tight pr-3">
            {task.title}
          </h3>
          <StatusPulse
            color={urgencyColor}
            speed={task.urgencyLevel === "critical" ? "fast" : "normal"}
          />
        </div>

        {/* Description preview */}
        <p className="text-muted text-sm line-clamp-2 mb-4 font-body">
          {task.description || "No description"}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Assigned user avatar */}
          {task.assignedUser && (
            <div className="flex items-center gap-2">
              <img
                src={task.assignedUser.avatarUrl || ""}
                alt={task.assignedUser.name}
                className="w-6 h-6 rounded-full border border-surface-border"
              />
              <span className="text-muted text-xs font-body">
                {task.assignedUser.name}
              </span>
            </div>
          )}

          {/* Timestamp */}
          <span className="text-muted/60 text-xs font-body">
            {formatRelativeTime(task.createdAt)}
          </span>
        </div>

        {/* Status badge */}
        <div className="mt-3">
          <span
            className="inline-flex px-3 py-1 rounded-pill text-xs font-body tracking-wide"
            style={{
              backgroundColor: `${urgencyColor}15`,
              color: urgencyColor,
            }}
          >
            {task.status}
          </span>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create DecisionOrb component**

Create `src/components/nebula/DecisionOrb.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { DecisionOrb as DecisionOrbType } from "@/lib/types";

interface DecisionOrbProps {
  orb: DecisionOrbType;
  onClick: (orb: DecisionOrbType) => void;
}

export function DecisionOrb({ orb, onClick }: DecisionOrbProps) {
  return (
    <motion.button
      onClick={() => onClick(orb)}
      className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer group"
      style={{ backgroundColor: "var(--color-decision)" }}
      animate={{
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 20px rgba(255, 184, 0, 0.3)",
          "0 0 40px rgba(255, 184, 0, 0.6)",
          "0 0 20px rgba(255, 184, 0, 0.3)",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.15,
        transition: { duration: 0.2 },
      }}
      title={orb.task?.title || "Decision required"}
    >
      <span className="text-background font-display font-bold text-sm">!</span>

      {/* Outer ring glow */}
      <motion.div
        className="absolute inset-[-4px] rounded-full border-2 border-decision/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
}
```

- [ ] **Step 5: Create DecisionDock component**

Create `src/components/nebula/DecisionDock.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { DecisionOrb } from "./DecisionOrb";
import type { DecisionOrb as DecisionOrbType } from "@/lib/types";

interface DecisionDockProps {
  orbs: DecisionOrbType[];
  onOrbClick: (orb: DecisionOrbType) => void;
}

export function DecisionDock({ orbs, onOrbClick }: DecisionDockProps) {
  const pendingOrbs = orbs.filter((o) => o.status === "pending");

  if (pendingOrbs.length === 0) return null;

  return (
    <GlassPanel
      glow="decision"
      className="p-4 flex flex-col items-center gap-4 min-w-[80px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: "easeOut" }}
    >
      <span className="text-decision text-xs font-body tracking-widest uppercase">
        Decisions
      </span>
      <span className="font-mono text-2xl text-decision">
        {pendingOrbs.length}
      </span>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {pendingOrbs.map((orb) => (
            <motion.div
              key={orb.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0, filter: "hue-rotate(120deg)" }}
              transition={{ ease: "easeInOut" }}
            >
              <DecisionOrb orb={orb} onClick={onOrbClick} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
```

- [ ] **Step 6: Build the Overview Nebula page**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SystemVitals } from "@/components/layout/SystemVitals";
import { TaskCard } from "@/components/nebula/TaskCard";
import { DecisionDock } from "@/components/nebula/DecisionDock";
import type { Task, DecisionOrb as DecisionOrbType, SystemStat } from "@/lib/types";

export default function OverviewNebula() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<DecisionOrbType[]>([]);
  const [stats, setStats] = useState<SystemStat[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, statsRes, decisionsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/stats"),
          fetch("/api/decisions"),
        ]);
        const tasksData = await tasksRes.json();
        const statsData = await statsRes.json();
        const decisionsData = await decisionsRes.json();

        setTasks(tasksData.data || []);
        setStats(statsData.data || []);
        setDecisions(decisionsData.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // TaskNodeDetail modal will be wired in Task 3
  };

  const handleOrbClick = (orb: DecisionOrbType) => {
    // Find associated task and open detail modal
    const task = tasks.find((t) => t.id === orb.taskId);
    if (task) setSelectedTask(task);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          className="font-display text-2xl text-primary/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Initializing orbit...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none ml-[72px]">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-decision/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* System Vitals */}
      <div className="relative z-10 mb-8">
        <SystemVitals stats={stats} />
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex gap-6">
        {/* Task Cluster — center area */}
        <div className="flex-1">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-[60vh]">
              <motion.p
                className="font-display text-2xl text-muted"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                All systems nominal
              </motion.p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 justify-center">
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, ease: "easeOut" }}
                  >
                    <TaskCard task={task} onClick={handleTaskClick} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Decision Dock — right sticky */}
        <div className="sticky top-6 self-start">
          <DecisionDock orbs={decisions} onOrbClick={handleOrbClick} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify Overview Nebula renders with data**

```bash
npm run dev
```

Expected: Ambient background gradients, system vitals pills at top, floating task cards in center with pulsing status dots, Decision Dock on right with amber pulsing orbs.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Overview Nebula — task cards, decision dock, system vitals"
```

- [ ] **Step 9: Update TRACKER.md**

Set Phase 2 tasks 2.1–2.7 to ✅, update "Current Phase" to "Phase 3", update "Last Updated".

---

### Task 3: Task Node Detail (Modal)

**Files:**
- Create: `src/components/shared/TaskNodeDetail.tsx`
- Create: `src/components/shared/Timeline.tsx`
- Create: `src/app/api/tasks/[id]/route.ts`
- Modify: `src/app/page.tsx` (wire modal)

**Interfaces:**
- Consumes: `<GlassPanel variant="intense" />`, `<StatusPulse />`, `Task`, `TimelineEvent`, `User` types, `db`, `tasks`, `taskTimeline`, `users` schema
- Produces: `<TaskNodeDetail task={Task} onClose={() => void} onGrant={(orbId: string) => void} onDeny={(orbId: string) => void} />`, `<Timeline events={TimelineEvent[]} />`

- [ ] **Step 1: Create task detail API route**

Create `src/app/api/tasks/[id]/route.ts`:

```typescript
import { db } from "@/db";
import { tasks, users, taskTimeline, decisionOrbs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch task with assigned user
    const [task] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        urgencyLevel: tasks.urgencyLevel,
        assignedUserId: tasks.assignedUserId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignedUserName: users.name,
        assignedUserAvatar: users.avatarUrl,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedUserId, users.id))
      .where(eq(tasks.id, id));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Fetch timeline
    const timeline = await db
      .select({
        id: taskTimeline.id,
        taskId: taskTimeline.taskId,
        event: taskTimeline.event,
        actorId: taskTimeline.actorId,
        createdAt: taskTimeline.createdAt,
        actorName: users.name,
        actorAvatar: users.avatarUrl,
      })
      .from(taskTimeline)
      .leftJoin(users, eq(taskTimeline.actorId, users.id))
      .where(eq(taskTimeline.taskId, id))
      .orderBy(taskTimeline.createdAt);

    // Fetch decision orbs for this task
    const orbs = await db
      .select()
      .from(decisionOrbs)
      .where(eq(decisionOrbs.taskId, id));

    return NextResponse.json({
      data: {
        ...task,
        assignedUser: task.assignedUserId
          ? { id: task.assignedUserId, name: task.assignedUserName, avatarUrl: task.assignedUserAvatar }
          : null,
        timeline: timeline.map((e) => ({
          ...e,
          actor: e.actorId ? { id: e.actorId, name: e.actorName, avatarUrl: e.actorAvatar } : null,
        })),
        decisionOrbs: orbs,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create Timeline component**

Create `src/components/shared/Timeline.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <p className="text-muted text-sm">No history yet</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

      <div className="flex flex-col gap-5">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            className="relative flex items-start gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, ease: "easeOut" }}
          >
            {/* Dot */}
            <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-primary/60 border-2 border-background" />

            <div className="flex-1">
              <p className="text-text text-sm font-body">{event.event}</p>
              <div className="flex items-center gap-2 mt-1">
                {event.actor && (
                  <>
                    <img
                      src={event.actor.avatarUrl || ""}
                      alt={event.actor.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-muted text-xs">{event.actor.name}</span>
                    <span className="text-muted/40 text-xs">·</span>
                  </>
                )}
                <span className="text-muted/60 text-xs">
                  {formatRelativeTime(event.createdAt)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create TaskNodeDetail modal**

Create `src/components/shared/TaskNodeDetail.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { Timeline } from "@/components/shared/Timeline";
import { urgencyToColor } from "@/lib/utils";
import type { Task, TimelineEvent, DecisionOrb } from "@/lib/types";

interface TaskNodeDetailProps {
  task: Task;
  onClose: () => void;
  onGrant?: (orbId: string) => void;
  onDeny?: (orbId: string) => void;
}

interface TaskDetail extends Task {
  timeline: TimelineEvent[];
  decisionOrbs: DecisionOrb[];
}

export function TaskNodeDetail({ task, onClose, onGrant, onDeny }: TaskNodeDetailProps) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/tasks/${task.id}`);
        const data = await res.json();
        setDetail(data.data);
      } catch (err) {
        console.error("Failed to fetch task detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [task.id]);

  const handleGrant = async (orbId: string) => {
    setActionLoading(orbId);
    try {
      await fetch(`/api/decisions/${orbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "granted" }),
      });
      onGrant?.(orbId);
      onClose();
    } catch (err) {
      console.error("Failed to grant:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (orbId: string) => {
    setActionLoading(orbId);
    try {
      await fetch(`/api/decisions/${orbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "denied" }),
      });
      onDeny?.(orbId);
      onClose();
    } catch (err) {
      console.error("Failed to deny:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrbs = detail?.decisionOrbs?.filter((o) => o.status === "pending") || [];
  const urgencyColor = urgencyToColor(task.urgencyLevel);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Blurred background overlay */}
        <motion.div
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
        >
          <GlassPanel
            variant="intense"
            className="w-[90vw] max-w-[600px] max-h-[80vh] overflow-y-auto p-8"
          >
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <motion.p
                  className="text-muted font-body"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  Loading node data...
                </motion.p>
              </div>
            ) : detail ? (
              <>
                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                  <StatusPulse
                    color={urgencyColor}
                    speed={task.urgencyLevel === "critical" ? "fast" : "normal"}
                  />
                  <div>
                    <h2 className="font-display text-2xl text-text">{detail.title}</h2>
                    <span
                      className="inline-flex px-3 py-0.5 rounded-pill text-xs font-body mt-2"
                      style={{
                        backgroundColor: `${urgencyColor}15`,
                        color: urgencyColor,
                      }}
                    >
                      {detail.status} · {detail.urgencyLevel}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted text-sm font-body mb-6 leading-relaxed">
                  {detail.description || "No description provided."}
                </p>

                {/* Assigned user */}
                {detail.assignedUser && (
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-panel bg-white/[0.02]">
                    <img
                      src={detail.assignedUser.avatarUrl || ""}
                      alt={detail.assignedUser.name}
                      className="w-8 h-8 rounded-full border border-surface-border"
                    />
                    <div>
                      <p className="text-text text-sm font-body">{detail.assignedUser.name}</p>
                      <p className="text-muted text-xs">Assigned</p>
                    </div>
                  </div>
                )}

                {/* Decision Orbs — Grant/Deny actions */}
                {pendingOrbs.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-display text-sm text-decision mb-3 tracking-wide uppercase">
                      Pending Decisions
                    </h3>
                    {pendingOrbs.map((orb) => (
                      <div
                        key={orb.id}
                        className="p-4 rounded-panel border border-decision/20 bg-decision/[0.03] mb-3"
                      >
                        <p className="text-text text-sm font-body mb-4">
                          {orb.contextReason}
                        </p>
                        <div className="flex gap-3">
                          <motion.button
                            className="px-8 py-3 rounded-pill bg-primary text-background font-display font-medium text-sm min-w-[120px]"
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,229,255,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleGrant(orb.id)}
                            disabled={actionLoading === orb.id}
                          >
                            {actionLoading === orb.id ? "..." : "Grant Access"}
                          </motion.button>
                          <motion.button
                            className="px-8 py-3 rounded-pill border border-urgent/30 text-urgent font-display font-medium text-sm min-w-[120px]"
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,51,102,0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDeny(orb.id)}
                            disabled={actionLoading === orb.id}
                          >
                            Deny
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="font-display text-sm text-muted mb-4 tracking-wide uppercase">
                    History
                  </h3>
                  <Timeline events={detail.timeline} />
                </div>
              </>
            ) : (
              <p className="text-urgent text-sm">Failed to load task data.</p>
            )}
          </GlassPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Wire TaskNodeDetail modal into Overview Nebula**

Modify `src/app/page.tsx` — add import and render the modal:

Add after the existing imports:
```tsx
import { TaskNodeDetail } from "@/components/shared/TaskNodeDetail";
```

Add inside the return, after the closing `</div>` of the main content area (before the final `</div>`):
```tsx
      {/* Task Node Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskNodeDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onGrant={(orbId) => {
              setDecisions((prev) => prev.filter((d) => d.id !== orbId));
            }}
            onDeny={(orbId) => {
              setDecisions((prev) => prev.filter((d) => d.id !== orbId));
            }}
          />
        )}
      </AnimatePresence>
```

- [ ] **Step 5: Verify modal opens on TaskCard and DecisionOrb click**

```bash
npm run dev
```

Expected: Clicking a task card opens the glass modal with title, status pulse, description, timeline, and collaborator. Clicking outside closes with scale-down animation. If the task has a pending decision orb, Grant/Deny buttons appear.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Task Node Detail modal — timeline, grant/deny actions, blur overlay"
```

- [ ] **Step 7: Update TRACKER.md**

Set Phase 3 tasks 3.1–3.5 to ✅, update "Current Phase" to "Phase 4", update "Last Updated".

---

### Task 4: Decision Nexus

**Files:**
- Create: `src/app/decisions/page.tsx`
- Create: `src/components/decisions/OrbList.tsx`
- Create: `src/components/decisions/ContextGlass.tsx`
- Create: `src/app/api/decisions/route.ts`
- Create: `src/app/api/decisions/[id]/route.ts`

**Interfaces:**
- Consumes: `<GlassPanel />`, `<StatusPulse />`, `DecisionOrb`, `Task`, `User` types, `db`, `decisionOrbs`, `tasks`, `users` schema
- Produces: `<OrbList orbs={DecisionOrb[]} selectedId={string|null} onSelect={(orb: DecisionOrb) => void} />`, `<ContextGlass orb={DecisionOrb} onGrant={(id: string) => void} onDeny={(id: string) => void} />`

- [ ] **Step 1: Create decisions API route**

Create `src/app/api/decisions/route.ts`:

```typescript
import { db } from "@/db";
import { decisionOrbs, tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orbs = await db
      .select({
        id: decisionOrbs.id,
        taskId: decisionOrbs.taskId,
        requestedBy: decisionOrbs.requestedBy,
        contextReason: decisionOrbs.contextReason,
        status: decisionOrbs.status,
        createdAt: decisionOrbs.createdAt,
        resolvedAt: decisionOrbs.resolvedAt,
        taskTitle: tasks.title,
        taskStatus: tasks.status,
        taskUrgency: tasks.urgencyLevel,
        requesterName: users.name,
        requesterAvatar: users.avatarUrl,
      })
      .from(decisionOrbs)
      .leftJoin(tasks, eq(decisionOrbs.taskId, tasks.id))
      .leftJoin(users, eq(decisionOrbs.requestedBy, users.id));

    const formatted = orbs.map((o) => ({
      id: o.id,
      taskId: o.taskId,
      requestedBy: o.requestedBy,
      contextReason: o.contextReason,
      status: o.status,
      createdAt: o.createdAt,
      resolvedAt: o.resolvedAt,
      task: { id: o.taskId, title: o.taskTitle, status: o.taskStatus, urgencyLevel: o.taskUrgency },
      requester: { id: o.requestedBy, name: o.requesterName, avatarUrl: o.requesterAvatar },
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create decision action API route**

Create `src/app/api/decisions/[id]/route.ts`:

```typescript
import { db } from "@/db";
import { decisionOrbs, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!["granted", "denied"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the decision orb
    const [updatedOrb] = await db
      .update(decisionOrbs)
      .set({ status, resolvedAt: new Date() })
      .where(eq(decisionOrbs.id, id))
      .returning();

    if (!updatedOrb) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    // If granted, unblock the associated task
    if (status === "granted") {
      await db
        .update(tasks)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(tasks.id, updatedOrb.taskId));
    }

    return NextResponse.json({ data: updatedOrb });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update decision" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create OrbList component**

Create `src/components/decisions/OrbList.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { formatRelativeTime } from "@/lib/utils";
import type { DecisionOrb } from "@/lib/types";

interface OrbListProps {
  orbs: DecisionOrb[];
  selectedId: string | null;
  onSelect: (orb: DecisionOrb) => void;
}

export function OrbList({ orbs, selectedId, onSelect }: OrbListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-lg text-decision mb-2 tracking-wide">
        Pending Decisions
      </h2>
      {orbs.map((orb, i) => {
        const isSelected = orb.id === selectedId;
        return (
          <motion.div
            key={orb.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, ease: "easeOut" }}
          >
            <GlassPanel
              className={`p-4 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "!border-decision/40 glow-decision"
                  : "hover:!border-decision/20"
              }`}
              onClick={() => onSelect(orb)}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-3">
                <StatusPulse color="var(--color-decision)" speed="normal" />
                <div className="flex-1 min-w-0">
                  <p className="text-text text-sm font-body truncate">
                    {orb.task?.title || "Unknown task"}
                  </p>
                  <p className="text-muted text-xs mt-1">
                    by {orb.requester?.name || "Unknown"} · {formatRelativeTime(orb.createdAt)}
                  </p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create ContextGlass component**

Create `src/components/decisions/ContextGlass.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import type { DecisionOrb } from "@/lib/types";

interface ContextGlassProps {
  orb: DecisionOrb | null;
  onGrant: (id: string) => void;
  onDeny: (id: string) => void;
}

export function ContextGlass({ orb, onGrant, onDeny }: ContextGlassProps) {
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: "granted" | "denied") => {
    if (!orb) return;
    setActionLoading(true);
    try {
      await fetch(`/api/decisions/${orb.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (action === "granted") {
        onGrant(orb.id);
      } else {
        onDeny(orb.id);
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!orb) {
    return (
      <GlassPanel
        variant="heavy"
        className="h-full flex items-center justify-center !border-primary/10"
      >
        <motion.div
          className="text-center"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-primary/20 text-8xl">✓</span>
          <p className="text-muted/40 font-body mt-4">Select a decision orb</p>
        </motion.div>
      </GlassPanel>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={orb.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
      >
        <GlassPanel
          variant="heavy"
          className="p-8 h-full !border-decision/20"
          glow="decision"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <StatusPulse color="var(--color-decision)" speed="normal" size={14} />
            <div>
              <h2 className="font-display text-2xl text-text">
                {orb.task?.title || "Decision Required"}
              </h2>
              <p className="text-muted text-sm mt-1">
                Requested by {orb.requester?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Context */}
          <div className="mb-8">
            <h3 className="font-display text-sm text-decision/80 mb-3 tracking-wide uppercase">
              Context
            </h3>
            <p className="text-text/90 text-sm font-body leading-relaxed">
              {orb.contextReason}
            </p>
          </div>

          {/* Task info */}
          <div className="mb-8 p-4 rounded-panel bg-white/[0.02] border border-surface-border">
            <p className="text-muted text-xs tracking-wide uppercase mb-1">Affected Task</p>
            <p className="text-text font-display">{orb.task?.title}</p>
            <span
              className="inline-flex px-3 py-0.5 rounded-pill text-xs font-body mt-2"
              style={{
                backgroundColor: "rgba(255,184,0,0.1)",
                color: "var(--color-decision)",
              }}
            >
              {orb.task?.status} · {orb.task?.urgencyLevel}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <motion.button
              className="flex-1 py-4 rounded-pill bg-primary text-background font-display font-medium text-base"
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,229,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction("granted")}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Grant Access"}
            </motion.button>
            <motion.button
              className="flex-1 py-4 rounded-pill border border-urgent/30 text-urgent font-display font-medium text-base"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,51,102,0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction("denied")}
              disabled={actionLoading}
            >
              Deny
            </motion.button>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Build Decision Nexus page**

Create `src/app/decisions/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrbList } from "@/components/decisions/OrbList";
import { ContextGlass } from "@/components/decisions/ContextGlass";
import type { DecisionOrb } from "@/lib/types";

export default function DecisionNexus() {
  const [orbs, setOrbs] = useState<DecisionOrb[]>([]);
  const [selectedOrb, setSelectedOrb] = useState<DecisionOrb | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecisions() {
      try {
        const res = await fetch("/api/decisions");
        const data = await res.json();
        const pendingOrbs = (data.data || []).filter(
          (o: DecisionOrb) => o.status === "pending"
        );
        setOrbs(pendingOrbs);
        if (pendingOrbs.length > 0 && !selectedOrb) {
          setSelectedOrb(pendingOrbs[0]);
        }
      } catch (err) {
        console.error("Failed to fetch decisions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDecisions();
  }, []);

  const handleResolved = (orbId: string) => {
    const remaining = orbs.filter((o) => o.id !== orbId);
    setOrbs(remaining);
    setSelectedOrb(remaining.length > 0 ? remaining[0] : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          className="font-display text-2xl text-decision/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading decision nexus...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none ml-[72px]">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-decision/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-3xl text-text mb-8">Decision Nexus</h1>

        {orbs.length === 0 ? (
          <div className="flex items-center justify-center h-[60vh]">
            <motion.div
              className="text-center"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-primary/20 text-9xl block mb-4">✓</span>
              <p className="font-display text-xl text-muted">All decisions cleared</p>
            </motion.div>
          </div>
        ) : (
          <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* Left pane — 30% */}
            <div className="w-[30%] overflow-y-auto pr-2">
              <OrbList
                orbs={orbs}
                selectedId={selectedOrb?.id || null}
                onSelect={setSelectedOrb}
              />
            </div>

            {/* Right pane — 70% */}
            <div className="w-[70%]">
              <ContextGlass
                orb={selectedOrb}
                onGrant={handleResolved}
                onDeny={handleResolved}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify Decision Nexus page**

```bash
npm run dev
```

Navigate to `http://localhost:3000/decisions`.

Expected: 30/70 split layout. Left pane shows pending amber orbs. Clicking an orb shows its context in the right pane with Grant/Deny buttons. Granting an orb dissolves it and selects the next one.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Decision Nexus — split pane, context glass, grant/deny actions"
```

- [ ] **Step 8: Update TRACKER.md**

Set Phase 4 tasks 4.1–4.6 to ✅, update "Current Phase" to "Phase 5", update "Last Updated".

---

### Task 5: Team Orbit

**Files:**
- Create: `src/app/team/page.tsx`
- Create: `src/components/team/UserPlanet.tsx`
- Create: `src/components/team/LoadRing.tsx`
- Create: `src/components/team/FilterBar.tsx`
- Create: `src/app/api/users/route.ts`

**Interfaces:**
- Consumes: `<GlassPanel />`, `User` type, `db`, `users`, `tasks` schema
- Produces: `<UserPlanet user={User & { taskCount: number }} onClick={(user: User) => void} />`, `<LoadRing taskCount={number} capacity={number} size={number} />`, `<FilterBar active={UserStatus} onChange={(status: UserStatus | "all") => void} />`

- [ ] **Step 1: Create users API route**

Create `src/app/api/users/route.ts`:

```typescript
import { db } from "@/db";
import { users, tasks } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create LoadRing SVG component**

Create `src/components/team/LoadRing.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface LoadRingProps {
  taskCount: number;
  capacity: number;
  size?: number;
}

export function LoadRing({ taskCount, capacity, size = 100 }: LoadRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(taskCount / capacity, 1);
  const dashLength = circumference * ratio;
  const isOverloaded = taskCount >= capacity;
  const color = isOverloaded ? "var(--color-urgent)" : "var(--color-primary)";

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />
      {/* Load ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={{ strokeDasharray: `${dashLength} ${circumference - dashLength}` }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </svg>
  );
}
```

- [ ] **Step 3: Create UserPlanet component**

Create `src/components/team/UserPlanet.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadRing } from "./LoadRing";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { User } from "@/lib/types";

interface UserPlanetProps {
  user: User & { taskCount: number };
}

export function UserPlanet({ user }: UserPlanetProps) {
  const [hovered, setHovered] = useState(false);
  const ringSize = 100;

  return (
    <motion.div
      className="flex flex-col items-center gap-3 relative"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ ease: "easeInOut" }}
    >
      {/* Avatar with Load Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: ringSize, height: ringSize }}
      >
        <LoadRing
          taskCount={user.taskCount}
          capacity={user.capacityLimit}
          size={ringSize}
        />
        <img
          src={user.avatarUrl || ""}
          alt={user.name}
          className="w-16 h-16 rounded-full border-2 border-surface-border z-10"
        />

        {/* Spin effect on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-0"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <LoadRing
                taskCount={user.taskCount}
                capacity={user.capacityLimit}
                size={ringSize}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name */}
      <span className="font-display text-sm text-text text-center">
        {user.name}
      </span>

      {/* Status indicator */}
      <span
        className="inline-flex px-2 py-0.5 rounded-pill text-[11px] font-body tracking-wide"
        style={{
          backgroundColor:
            user.status === "active"
              ? "rgba(0,229,255,0.1)"
              : user.status === "blocked"
                ? "rgba(255,51,102,0.1)"
                : "rgba(148,163,184,0.1)",
          color:
            user.status === "active"
              ? "var(--color-primary)"
              : user.status === "blocked"
                ? "var(--color-urgent)"
                : "var(--color-muted)",
        }}
      >
        {user.status}
      </span>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-2 z-20"
          >
            <GlassPanel className="px-4 py-2 whitespace-nowrap">
              <p className="text-text text-xs font-body">
                {user.taskCount} / {user.capacityLimit} tasks
              </p>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create FilterBar component**

Create `src/components/team/FilterBar.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";

type FilterOption = "all" | "active" | "blocked" | "available";

interface FilterBarProps {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
}

const options: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
  { value: "available", label: "Available" },
];

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <GlassPanel className="inline-flex p-1 gap-1 !rounded-pill mx-auto">
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative px-5 py-2 rounded-pill text-sm font-body transition-colors ${
            active === opt.value ? "text-background" : "text-muted hover:text-text"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {active === opt.value && (
            <motion.div
              className="absolute inset-0 bg-primary rounded-pill"
              layoutId="filterActive"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </motion.button>
      ))}
    </GlassPanel>
  );
}
```

- [ ] **Step 5: Build Team Orbit page**

Create `src/app/team/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlanet } from "@/components/team/UserPlanet";
import { FilterBar } from "@/components/team/FilterBar";
import type { User } from "@/lib/types";

type FilterOption = "all" | "active" | "blocked" | "available";

export default function TeamOrbit() {
  const [users, setUsers] = useState<(User & { taskCount: number })[]>([]);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = filter === "all"
    ? users
    : users.filter((u) => u.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          className="font-display text-2xl text-primary/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Mapping orbits...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none ml-[72px]">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-urgent/[0.02] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-3xl text-text mb-8">Team Orbit</h1>

        {/* Filter Bar */}
        <div className="flex justify-center mb-12">
          <FilterBar active={filter} onChange={setFilter} />
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh]">
            <motion.p
              className="font-display text-xl text-muted"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              No active orbits
            </motion.p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-12">
            <AnimatePresence>
              {filteredUsers.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: i % 2 === 0 ? 0 : 20, // Staggered layout
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <UserPlanet user={user} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify Team Orbit page**

```bash
npm run dev
```

Navigate to `http://localhost:3000/team`.

Expected: Staggered grid of user avatars with animated SVG load rings. Filter bar at top with sliding cyan indicator. Hovering a planet shows task count tooltip and spins the load ring.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Team Orbit — user planets, SVG load rings, filter bar"
```

- [ ] **Step 8: Update TRACKER.md**

Set Phase 5 tasks 5.1–5.6 to ✅, update "Current Phase" to "Phase 6", update "Last Updated".

---

### Task 6: Polish & Integration

**Files:**
- Modify: `src/app/page.tsx` (empty/error states)
- Modify: `src/app/decisions/page.tsx` (loading skeletons)
- Modify: `src/app/team/page.tsx` (loading skeletons)
- Modify: `src/app/globals.css` (shimmer animation class)

**Interfaces:**
- Consumes: All previously built components and pages
- Produces: Production-ready polished application

- [ ] **Step 1: Add shimmer skeleton CSS class**

Add to `src/app/globals.css`:

```css
/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  border-radius: var(--radius-panel);
}
```

- [ ] **Step 2: Add loading skeletons to Overview Nebula**

In `src/app/page.tsx`, replace the loading state block with:

```tsx
  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex gap-3 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-40 rounded-pill" />
          ))}
        </div>
        <div className="flex flex-wrap gap-5 justify-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton w-[280px] h-[200px]" />
          ))}
        </div>
      </div>
    );
  }
```

- [ ] **Step 3: Test the complete key flow — Unblocking a Decision Orb**

1. Navigate to `http://localhost:3000`
2. Confirm: Amber pulsing Decision Orbs visible in the Decision Dock on the right
3. Click a Decision Orb → Task Node Detail modal opens with context and Grant/Deny buttons
4. Click "Grant Access" → orb dissolves, modal closes, orb count updates in Decision Dock
5. Navigate to `/decisions` → confirm the granted orb is no longer in the pending list
6. Navigate to `/team` → confirm the previously blocked user's status reflects the change

- [ ] **Step 4: Tune animation timings**

Review all Framer Motion transitions across the application. Ensure:
- All `transition.ease` values are `"easeInOut"` (sine curve), not `"linear"`
- Pulse animations use `duration: 3` for normal speed, `duration: 2` for fast
- Modal enter/exit uses `duration: 0.3`
- Card hover lift uses `duration: 0.3`
- Page-level fade-ins use staggered `delay: i * 0.08`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: polish — loading skeletons, animation tuning, end-to-end flow"
```

- [ ] **Step 6: Update TRACKER.md**

Set Phase 6 tasks 6.1–6.6 to ✅, update "Overall" to "🟢 Complete", update "Current Phase" to "Done", update "Last Updated".

---
