# 🛰️ Orbit System — Project Tracker

> **PURPOSE:** This file is the single source of truth for project progress. Any AI model picking up this project mid-session MUST read this file first to understand what has been completed and what remains.
>
> **RULE:** After completing any task or step, update this file immediately before moving on.

---

## Quick Status

| Metric           | Value                    |
|------------------|--------------------------|
| **Overall**      | 🟡 In Progress           |
| **Current Phase**| Phase 3 — Task Node Detail |
| **Current Task** | Task 3                   |
| **Last Updated** | 2026-07-02T05:30:00Z     |
| **Spec**         | `docs/superpowers/specs/2026-07-02-orbit-system-design.md` |
| **Plan**         | `docs/superpowers/plans/2026-07-02-orbit-system-plan.md` |

---

## Tech Stack

- Next.js 14+ (App Router), React, TypeScript
- Tailwind CSS v3 (custom design tokens)
- Framer Motion (animations)
- Neon DB (Serverless Postgres)
- Drizzle ORM

---

## Phase 0: Project Scaffolding
| # | Task | Status | Notes |
|---|------|--------|-------|
| 0.1 | Initialize Next.js project | ✅ Complete | Next.js 16 + TW4 (adapted from TW3) |
| 0.2 | Install dependencies (Tailwind, Framer Motion, Drizzle, Neon) | ✅ Complete | |
| 0.3 | Configure Tailwind with design tokens | ✅ Complete | Uses TW4 @theme block instead of tailwind.config.ts |
| 0.4 | Set up global CSS (fonts, tokens, animations) | ✅ Complete | |
| 0.5 | Set up Drizzle + Neon DB connection | ✅ Complete | |
| 0.6 | Define database schema | ✅ Complete | |
| 0.7 | Create seed data script | ✅ Complete | |
| 0.8 | Push schema to Neon DB | ⬜ Not Started | Needs user's DATABASE_URL |

## Phase 1: Layout Shell & Shared Components
| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Root layout (fonts, deep void background, sidebar structure) | ✅ Complete | |
| 1.2 | Sidebar navigation component | ✅ Complete | |
| 1.3 | GlassPanel reusable component | ✅ Complete | |
| 1.4 | StatusPulse animated indicator | ✅ Complete | |
| 1.5 | SystemVitals top bar | ✅ Complete | |

## Phase 2: Overview Nebula (Main Dashboard)
| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Overview Nebula page layout | ✅ Complete | |
| 2.2 | TaskCard component | ✅ Complete | |
| 2.3 | DecisionOrb component (pulsing animation) | ✅ Complete | |
| 2.4 | DecisionDock right panel | ✅ Complete | |
| 2.5 | API: GET /api/tasks | ✅ Complete | |
| 2.6 | API: GET /api/stats (system vitals) | ✅ Complete | |
| 2.7 | Wire data to Nebula page | ✅ Complete | |

## Phase 3: Task Node Detail (Modal)
| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | TaskNodeDetail modal overlay | ⬜ Not Started | |
| 3.2 | Timeline component (vertical history line) | ⬜ Not Started | |
| 3.3 | Collaborators stacked avatars | ⬜ Not Started | |
| 3.4 | API: GET /api/tasks/[id] with timeline + collaborators | ⬜ Not Started | |
| 3.5 | Wire modal open from TaskCard and DecisionOrb clicks | ⬜ Not Started | |

## Phase 4: Decision Nexus
| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Decision Nexus page layout (30/70 split) | ⬜ Not Started | |
| 4.2 | OrbList component (left pane) | ⬜ Not Started | |
| 4.3 | ContextGlass component (right pane + Grant/Deny actions) | ⬜ Not Started | |
| 4.4 | API: GET /api/decisions (pending orbs) | ⬜ Not Started | |
| 4.5 | API: PATCH /api/decisions/[id] (grant/deny) | ⬜ Not Started | |
| 4.6 | Optimistic UI: orb flash + dissolve on grant | ⬜ Not Started | |

## Phase 5: Team Orbit
| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Team Orbit page layout (staggered grid) | ⬜ Not Started | |
| 5.2 | LoadRing SVG component | ⬜ Not Started | |
| 5.3 | UserPlanet component (avatar + ring + name) | ⬜ Not Started | |
| 5.4 | FilterBar component (Active/Blocked/Available) | ⬜ Not Started | |
| 5.5 | API: GET /api/users with task counts | ⬜ Not Started | |
| 5.6 | Wire data + filter logic | ⬜ Not Started | |

## Phase 6: Polish & Integration
| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Empty states for all screens | ⬜ Not Started | |
| 6.2 | Loading skeleton shimmer states | ⬜ Not Started | |
| 6.3 | Error state (background glow shift) | ⬜ Not Started | |
| 6.4 | Cross-screen navigation flow testing | ⬜ Not Started | |
| 6.5 | Key flow: Unblocking a Decision Orb end-to-end | ⬜ Not Started | |
| 6.6 | Final animation tuning (sine curves, timing) | ⬜ Not Started | |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ⬜ | Not Started |
| 🔄 | In Progress |
| ✅ | Complete |
| ⚠️ | Blocked |
| ❌ | Skipped/Removed |

---

## Change Log

| Date | Task | Change | Model |
|------|------|--------|-------|
| 2026-07-02 | — | Project tracker created | Claude Opus 4.6 |
| 2026-07-02 | Task 0 | Scaffolding complete — Next.js 16, TW4, Drizzle, Neon | Claude Opus 4.6 |
| 2026-07-02 | Task 1 | Layout shell complete — Sidebar, GlassPanel, StatusPulse, SystemVitals | Antigravity |
| 2026-07-02 | Task 2 | Overview Nebula complete — page layout, TaskCard, DecisionOrb, DecisionDock, /api/tasks, /api/stats, wired to Nebula page | Claude Sonnet 5 |
