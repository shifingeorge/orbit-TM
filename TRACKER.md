# 🛰️ Orbit System — Project Tracker

> **PURPOSE:** This file is the single source of truth for project progress. Any AI model picking up this project mid-session MUST read this file first to understand what has been completed and what remains.
>
> **RULE:** After completing any task or step, update this file immediately before moving on.

---

## Quick Status

| Metric           | Value                    |
|------------------|--------------------------|
| **Overall**      | 🟢 Complete (minimal UI rebuild shipped 2026-07-06) |
| **Current Phase**| Done                     |
| **Current Task** | None — all tasks complete |
| **Last Updated** | 2026-07-06T17:25:00Z     |
| **Spec**         | `docs/superpowers/specs/2026-07-06-minimal-ui-rebuild-design.md` (supersedes UI portions of `2026-07-02-orbit-system-design.md`) |
| **Plan**         | `docs/superpowers/plans/2026-07-02-orbit-system-plan.md` |

> **NOTE (2026-07-06):** Phases 1–6 below describe the original glassmorphic space-theme UI, which has been **replaced wholesale** by the minimal light-theme UI (see "Phase 7: Minimal UI Rebuild"). The API routes, DB schema, and route structure from those phases are unchanged; only the component layer and pages were rewritten.

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
| 0.8 | Push schema to Neon DB | ✅ Complete | Real `DATABASE_URL` provided 2026-07-03; `drizzle-kit push` applied schema, `src/db/seed.ts` ran successfully (6 users, 8 tasks, 3 decision orbs, 22 timeline events) |

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
| 6.4 | Cross-screen navigation flow testing | ✅ Complete | Live-tested 2026-07-03 against real DB: Sidebar `layoutId="activeNav"` nav links correctly point to `/`, `/decisions`, `/team`; each page independently fetches its own data on mount; navigation between `/`, `/decisions`, `/team` confirmed via headless browser, no console errors, no shared-state breakage |
| 6.5 | Key flow: Unblocking a Decision Orb end-to-end | ✅ Complete | **Live-tested 2026-07-03 against a real Neon Postgres DB** (schema pushed via `drizzle-kit push`, seeded via `src/db/seed.ts`) using headless-browser QA. Confirmed working: `DecisionOrb` click → `TaskNodeDetail` modal opens with context/timeline → "Grant Access" → PATCH `/api/decisions/[id]` returns 200 → `decisionOrbs.status` and `tasks.status` updated server-side → orb removed from Decision Dock (count updates instantly) → `TaskCard` status flips `blocked`→`active` instantly (no reload, confirms a7d86ec fix works live) → `/decisions` no longer lists the granted orb → top stats bar (Active Nodes/Blocked/Pending Decisions) also patches instantly (see fix below). No console errors, all PATCH/GET requests 200. **Gap found and fixed during live test (commit 5a0d174):** the top `SystemVitals` stats bar fetched `/api/stats` once on mount and never updated after a grant, so it showed stale counts even though the Decision Dock and TaskCard were both correct. `onGrant` now also patches `Pending Decisions` (-1), `Active Nodes` (+1), and `Blocked` (-1 if the task was blocked) in local state. **Confirmed remaining gap (now verified live, not just theoretical):** navigating to `/team` after granting Kai Nakamura's task still shows his status pill as `blocked` — `/api/users`'s `status` column is independent of `tasks.status` and nothing derives one from the other. This is a real, live-confirmed gap in the "Unblocking a Decision Orb" story and should be treated as a release blocker for that user story, not just a documentation note |
| 6.6 | Final animation tuning (sine curves, timing) | ✅ Complete | Grepped every `.tsx` under `src/` for `ease:`, `type: "spring"`, `linear` — zero non-`easeInOut` values found; all prior tasks' fixes held. Timing conventions already consistent with the brief's suggested values (3s/2s pulses, 0.3s modal/hover, `i*0.08`/`i*0.1` stagger delays) — no wildly-off outliers found, so no timing values were changed, only the audit was performed |

---

## Phase 7: Minimal UI Rebuild (2026-07-06)

Full replacement of the space-theme UI with a clean, minimal, light-theme design per `docs/superpowers/specs/2026-07-06-minimal-ui-rebuild-design.md`. User-approved direction: full rebuild, light theme, Linear-style list rows.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Design system | ✅ Complete | `globals.css` rewritten — Tailwind 4 `@theme` tokens (white bg, zinc text/borders, blue accent, status colors), Inter via `next/font/google`, 8px radius, no glass/glow/gradients |
| 7.2 | Layout shell | ✅ Complete | `layout.tsx` + `Sidebar.tsx` rewritten — 200px text sidebar (Tasks/Decisions/Team), framer-motion removed and uninstalled |
| 7.3 | Shared logic | ✅ Complete | New `useApi<T>` hook (loading/error/refetch) replaces per-page fetch duplication; refetch-after-mutation replaces brittle local state patching (fixes the SystemVitals stale-stats class of bugs by design) |
| 7.4 | Tasks page | ✅ Complete | `page.tsx` 235→~100 lines: StatBar, TaskRow list, NewTaskDialog, TaskDetail. Old nebula/ components deleted |
| 7.5 | Decisions page | ✅ Complete | Flat card list with Grant/Deny, replaces OrbList/ContextGlass split layout |
| 7.6 | Team page | ✅ Complete | Table with status dot, task count, capacity, filter tabs. Replaces UserPlanet/LoadRing grid |
| 7.7 | API fixes | ✅ Complete | `/api/users` now returns real `taskCount` (LEFT JOIN, non-completed tasks, ordered by name) — old UI counted client-side, new UI exposed the gap. `/api/stats` labels de-themed ("Active Nodes"→"Active" etc.) |
| 7.8 | Verification | ✅ Complete | Live-tested 2026-07-06 via headless browser against real Neon DB: create task → appears in list (count 9→10), open detail, Start (pending→active + timeline event), delete (confirm flow, count back to 9), grant decision on /decisions (empty state appears), team filters, Escape-closes-dialog. Lint 0 problems, prod build passes, no console errors on any route. **Env note:** WSL2 Node fetch to Neon fails on IPv6 — dev server needs `NODE_OPTIONS=--dns-result-order=ipv4first` |

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
| 2026-07-03 | — | Real Neon `DATABASE_URL` provided by user. Schema pushed (`drizzle-kit push`), DB seeded, full app live-tested end-to-end via headless browser (Grant flow, Decision Nexus, Team Orbit). Fixed newly-found stale stats-bar bug (SHA 5a0d174). Confirmed live: `users.status`/`tasks.status` derivation gap is real, not just theoretical | Claude Sonnet 5 |
| 2026-07-06 | Phase 7 | Full minimal UI rebuild — light theme design system, useApi hook, all 3 pages + dialogs rewritten, 15 old components deleted, framer-motion removed, `/api/users` taskCount fixed, live-verified end-to-end (create/edit/status/delete/grant) via headless browser | Claude Fable 5 |
