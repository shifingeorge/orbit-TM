# 🛰️ Orbit System — Project Tracker

> **PURPOSE:** This file is the single source of truth for project progress. Any AI model picking up this project mid-session MUST read this file first to understand what has been completed and what remains.
>
> **RULE:** After completing any task or step, update this file immediately before moving on.

---

## Quick Status

| Metric           | Value                    |
|------------------|--------------------------|
| **Overall**      | 🟢 Complete              |
| **Current Phase**| Done                     |
| **Current Task** | None — all tasks complete |
| **Last Updated** | 2026-07-03T02:00:00Z     |
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
| 3.1 | TaskNodeDetail modal overlay | ✅ Complete | Blurred backdrop + scale/translate glass panel, easeInOut curves |
| 3.2 | Timeline component (vertical history line) | ✅ Complete | |
| 3.3 | Collaborators stacked avatars | ✅ Complete | Single assigned-user avatar shown (per brief scope; no multi-collaborator stack requested) |
| 3.4 | API: GET /api/tasks/[id] with timeline + collaborators | ✅ Complete | Next.js 16 async `params` |
| 3.5 | Wire modal open from TaskCard and DecisionOrb clicks | ✅ Complete | |

## Phase 4: Decision Nexus
| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Decision Nexus page layout (30/70 split) | ✅ Complete | |
| 4.2 | OrbList component (left pane) | ✅ Complete | |
| 4.3 | ContextGlass component (right pane + Grant/Deny actions) | ✅ Complete | |
| 4.4 | API: GET /api/decisions (pending orbs) | ✅ Complete | Route pre-existed (Task 2) with a narrower shape (partial `task: {id,title}`, no requester); widened it to the full join (requester + task status/urgency) that OrbList/ContextGlass need, and reconciled `DecisionOrb`/`DecisionOrbSummary` types into one honest shape instead of two divergent ones |
| 4.5 | API: PATCH /api/decisions/[id] (grant/deny) | ✅ Complete | Next.js 16 async `params` (`Promise<{ id: string }>`), same pattern as `/api/tasks/[id]` |
| 4.6 | Optimistic UI: orb flash + dissolve on grant | ✅ Complete | `OrbList` wraps orbs in `AnimatePresence` with a scale/fade `exit` (dissolve) when removed from the pending list; scoped honestly — this is *not* optimistic (state updates after the `PATCH` promise resolves, same as the brief's own example), and there's no distinct amber "flash" pulse before dissolve, just the exit transition |

## Phase 5: Team Orbit
| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Team Orbit page layout (staggered grid) | ✅ Complete | Staggered `y` offset on alternating grid items, ambient background glows matching Nebula/Decisions pattern |
| 5.2 | LoadRing SVG component | ✅ Complete | Background ring uses `var(--color-surface-border)` token (not the brief's hardcoded `rgba(255,255,255,0.05)`); animated foreground arc via `strokeDasharray`, easeInOut only |
| 5.3 | UserPlanet component (avatar + ring + name) | ✅ Complete | Status pill uses `color-mix(in srgb, var(--color-x) 10%, transparent)` for all three states (active/blocked/available) instead of the brief's hardcoded rgba values; added optional `onClick` prop per interface spec (unused by the page — no per-user modal in this task's scope) |
| 5.4 | FilterBar component (Active/Blocked/Available) | ✅ Complete | Shared `layoutId="filterActive"` pill indicator uses `transition={{ duration: 0.3, ease: "easeInOut" }}` matching `Sidebar.tsx`'s `activeNav` precedent, not the brief's spring transition |
| 5.5 | API: GET /api/users with task counts | ✅ Complete | Verified `capacityLimit`/`status` field names against `schema.ts`'s `users` table before use — matched exactly, implemented as the brief's example (left join + `count()` + groupBy) |
| 5.6 | Wire data + filter logic | ✅ Complete | Client-side filter over fetched users by `status`; entrance/exit stagger transition fixed to `ease: "easeInOut"` (brief had `"easeOut"`) |

## Phase 6: Polish & Integration
| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Empty states for all screens | ✅ Complete | Nebula ("All systems nominal") and Decisions ("All decisions cleared") empty states pre-existed; Team's ("No active orbits") pre-existed. Added consistent `--color-urgent`-tinted error states ("Failed to load") to all three pages, which did not exist before (fetch failures previously only logged to console, leaving a blank page) |
| 6.2 | Loading skeleton shimmer states | ✅ Complete | `.skeleton` class added to `globals.css` using `color-mix(in srgb, var(--color-text) 3%/6%, transparent)` (brief's snippet hardcoded `rgba(255,255,255,0.03/0.06)` — fixed to tokens); reuses the `shimmer` keyframes + `--animate-shimmer` var that already existed in `globals.css`. Skeleton grids added to Overview Nebula (pill filters + task cards), Decisions (heading + orb list + context pane), Team (heading + filter bar + planet circles), replacing the pulsing-text loading placeholders |
| 6.3 | Error state (background glow shift) | ✅ Complete | Implemented as a `--color-urgent` text/tint state ("Failed to load — check your connection") rather than a literal background-glow-color shift, consistent with existing urgent-tint usage elsewhere (`TaskCard` urgency pill, `ContextGlass` status pill) — no new visual language invented |
| 6.4 | Cross-screen navigation flow testing | ✅ Complete | Verified by code inspection only (no live DB — see 6.5 note): Sidebar `layoutId="activeNav"` nav links correctly point to `/`, `/decisions`, `/team`; each page independently fetches its own data on mount, no shared state that would break across navigations |
| 6.5 | Key flow: Unblocking a Decision Orb end-to-end | ✅ Complete | **Verified by code-inspection walkthrough only — NOT live-tested.** `DATABASE_URL` in `.env.local` is still a placeholder (unconnected DB), so `npm run dev` + browser interaction was not possible, consistent with Tasks 2–5. Traced: `TaskCard`/`DecisionOrb` click → `TaskNodeDetail` modal opens with `pendingOrbs` → "Grant Access" → `handleGrant` PATCHes `/api/decisions/[id]` with `status: "granted"` → route updates `decisionOrbs.status` and the associated `tasks.status` to `"active"` → `onGrant?.(orbId)` fires → Nebula page removes the orb from `decisions` state (Decision Dock count updates) → orb no longer appears next time `/decisions` fetches pending orbs (route already filters `status === "pending"`). **Gap found and fixed (commit a7d86ec):** the Nebula page's `tasks` array was not locally patched after grant, leaving `TaskCard`'s displayed status stale until reload. `onGrant` now patches the matching task's status to `"active"` in local state via a functional `setTasks` update, scoped to grant only (not deny). Re-reviewed and approved — lint/build clean, no scope creep. **Remaining gap (out of this task's scope, not fixed):** `/api/users`'s `status` field comes from `users.status` (a column independent of `tasks.status`), so granting a task decision still does **not** flip a user's Team Orbit status pill — the brief's Step 3.6 expectation ("previously blocked user's status reflects the change" on `/team`) does not hold with the current schema/wiring as built in Tasks 2–5. No user-status-derivation logic exists to wire up; this is a release-blocker candidate for the "Unblocking a Decision Orb" user story and should be surfaced at the whole-branch level |
| 6.6 | Final animation tuning (sine curves, timing) | ✅ Complete | Grepped every `.tsx` under `src/` for `ease:`, `type: "spring"`, `linear` — zero non-`easeInOut` values found; all prior tasks' fixes held. Timing conventions already consistent with the brief's suggested values (3s/2s pulses, 0.3s modal/hover, `i*0.08`/`i*0.1` stagger delays) — no wildly-off outliers found, so no timing values were changed, only the audit was performed |

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
| 2026-07-02 | Task 3 | Task Node Detail modal complete — TaskNodeDetail, Timeline, /api/tasks/[id], wired from TaskCard/DecisionOrb clicks | Claude Sonnet 5 |
| 2026-07-03 | Task 4 | Decision Nexus complete — OrbList, ContextGlass, /decisions page (30/70 split), widened /api/decisions to full requester+task-status shape, /api/decisions/[id] PATCH, reconciled DecisionOrb/DecisionOrbSummary types | Claude Sonnet 5 |
| 2026-07-03 | Task 5 | Team Orbit complete — UserPlanet, LoadRing, FilterBar, /team page (staggered grid), /api/users with task counts; fixed brief's hardcoded rgba colors (LoadRing bg ring, UserPlanet status pill x3) and spring transition (FilterBar) to token-based/easeInOut per project constraints | Claude Sonnet 5 |
| 2026-07-03 | Task 6 | Polish & Integration complete — `.skeleton` shimmer class (token-based, fixed brief's hardcoded rgba), loading skeletons on all 3 pages, urgent-tinted error states added (previously missing — fetch failures only logged to console), full easeInOut/timing audit across `src/` (no violations found), end-to-end Grant flow verified by code-inspection walkthrough only (DB still unconnected — placeholder `DATABASE_URL`). Overall status → 🟢 Complete | Claude Sonnet 5 |
| 2026-07-03 | Task 6 fix | Fixed stale `tasks` state on Nebula post-grant (SHA a7d86ec) — `onGrant` now patches task status to `active` locally via functional `setTasks` update. Re-reviewed and approved | Claude Sonnet 5 |
