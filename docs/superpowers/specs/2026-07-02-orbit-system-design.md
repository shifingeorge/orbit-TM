# Orbit System — Design Specification

## Product Overview

**The Pitch:** A sensory operational dashboard that transforms rigid task lists into a living, breathing ecosystem. Ambient visual rhythms and glassmorphic elements reduce cognitive load while surfacing critical blockers and urgent tasks.

**For:** Operational managers and team leads monitoring complex, high-velocity workflows.

**Device:** Desktop-first (responsive down to tablet/mobile).

**Design Direction:** Organic, ambient space — fluid glassmorphic panels, soft neon gradients over deep voids, pulsing indicators that communicate urgency through rhythm.

**Inspired by:** Apple Vision Pro UI, Linear (Dark Mode).

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with React
- **Styling:** Tailwind CSS v3 (custom design tokens)
- **Animations:** Framer Motion (organic sine-curve micro-interactions)
- **Database:** Neon DB (Serverless Postgres)
- **ORM:** Drizzle ORM (lightweight, typesafe)
- **Fonts:** Cabinet Grotesk (headings), Satoshi (body), Space Grotesk (metrics)

---

## Database Schema

### `users` (Team Orbit — "Planets")
| Column           | Type        | Notes                               |
|------------------|-------------|-------------------------------------|
| `id`             | `uuid` PK   | Auto-generated                      |
| `name`           | `varchar`   | Display name                        |
| `avatar_url`     | `varchar`   | URL to avatar image                 |
| `status`         | `enum`      | `active`, `available`, `blocked`    |
| `capacity_limit` | `integer`   | Max concurrent tasks (load rings)   |
| `created_at`     | `timestamp` | Default now()                       |

### `tasks` (Task Nodes)
| Column           | Type        | Notes                               |
|------------------|-------------|-------------------------------------|
| `id`             | `uuid` PK   | Auto-generated                      |
| `title`          | `varchar`   | Task display name                   |
| `description`    | `text`      | Full context body                   |
| `status`         | `enum`      | `pending`, `active`, `blocked`, `completed` |
| `urgency_level`  | `enum`      | `low`, `medium`, `high`, `critical` |
| `assigned_user_id` | `uuid` FK | References `users.id`              |
| `created_at`     | `timestamp` | Default now()                       |
| `updated_at`     | `timestamp` | Auto-updated                        |

### `decision_orbs` (Blockers/Permission Requests)
| Column           | Type        | Notes                               |
|------------------|-------------|-------------------------------------|
| `id`             | `uuid` PK   | Auto-generated                      |
| `task_id`        | `uuid` FK   | References `tasks.id`              |
| `requested_by`   | `uuid` FK   | References `users.id`              |
| `context_reason` | `text`      | "Why" behind the permission request |
| `status`         | `enum`      | `pending`, `granted`, `denied`     |
| `created_at`     | `timestamp` | Default now()                       |
| `resolved_at`    | `timestamp` | Null until resolved                 |

### `task_timeline` (Task History for Detail Modal)
| Column           | Type        | Notes                               |
|------------------|-------------|-------------------------------------|
| `id`             | `uuid` PK   | Auto-generated                      |
| `task_id`        | `uuid` FK   | References `tasks.id`              |
| `event`          | `varchar`   | e.g., "Created", "Assigned", "Blocked" |
| `actor_id`       | `uuid` FK   | References `users.id`              |
| `created_at`     | `timestamp` | When the event occurred             |

---

## Design System

### Color Palette
```
Primary:         #00E5FF   — Cyan glow, active states
Background:      #0B0E14   — Deep void canvas
Surface:         rgba(255,255,255,0.03) — Glass panels (requires blur)
Surface Border:  rgba(255,255,255,0.08) — Subtle structural edges
Text:            #F8FAFC   — Primary readability
Muted:           #94A3B8   — Secondary metrics, timestamps
Urgent:          #FF3366   — High-priority pulses, blockers
Decision:        #FFB800   — Amber glow for permission requests
```

### Typography
- **Headings:** Cabinet Grotesk, 500, 24–40px
- **Body:** Satoshi, 400, 15px
- **Small text:** Satoshi, 500, 13px, tracking 0.05em
- **Numbers/Metrics:** Space Grotesk, 400, 32px

### Style Rules
- **Glassmorphism:** `backdrop-filter: blur(24px)` with 1px inner border `rgba(255,255,255,0.08)`
- **Shadows:** Diffused colored glows only (e.g., `box-shadow: 0 0 40px rgba(0,229,255,0.1)`)
- **Border Radius:** `24px` for panels, `999px` (pill) for buttons/tags
- **Animations:** Ease-in-out sine curves, never linear snaps

### Design Tokens (CSS Custom Properties)
```css
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
```

---

## Screens

### 1. Overview Nebula (Main Dashboard)
**Purpose:** Central command center mapping the operation's heartbeat.

**Layout:**
- Left sidebar — navigation icons
- Top edge — ambient system vitals (glass pills with Space Grotesk metrics)
- Center — non-rigid flex area for floating Task Cards
- Right sticky panel — Decision Dock with pulsing amber orbs

**Components:**
- **Task Card:** 280px wide, glass surface, 24px radius, avatar cluster, pulsing status dot
- **Decision Orb:** 48px circle, `#FFB800` base, radial glow, scale animation 1.0→1.1

**Interactions:**
- Hover Task Card → border `rgba(0,229,255,0.4)`, lift `translateY(-2px)`
- Hover Decision Orb → glow intensifies, pulse speeds 1.5x
- Click Decision Orb → opens Task Node Detail modal

**States:** Empty ("All systems nominal" pulsing text), Loading (organic fade-in), Error (background shifts to deep red)

### 2. Decision Nexus
**Purpose:** Focused zone for clearing blockages and granting permissions.

**Layout:** 30/70 split-pane (desktop). Left: pending orb list. Right: Context Glass detail pane.

**Components:**
- **Context Glass:** `backdrop-filter: blur(40px)`, amber-tinted border
- **Action Nodes:** Two pill buttons — Grant (cyan `#00E5FF`, dark text) and Deny (muted red)

**Interactions:**
- Click Grant/Deny → ripple effect, Context Glass dissolves `translateY(10px)` + fade
- Hover Orb List Item → amber glow gradient line connects to Context Glass

### 3. Team Orbit
**Purpose:** Visualizing team capacity and active rhythm.

**Layout:** Staggered floating grid of User Planets (no rigid rows).

**Components:**
- **User Planet:** 80px circular avatar, Cabinet Grotesk name below
- **Load Ring:** 100px SVG circle, 4px stroke, `stroke-dasharray` driven by task count (cyan = healthy, red = overloaded)
- **Filter Bar:** Glass pill — Active / Blocked / Available toggles

**Interactions:**
- Hover User Planet → load rings spin slowly, tooltip glass reveals task names
- Click Filter → non-matching planets fade to `opacity: 0.1`, matching scale `1.05`

### 4. Task Node Detail (Modal)
**Purpose:** Deep-dive into a single task without losing context.

**Layout:** Centered modal overlay, blurred background (`backdrop-filter: blur(60px)`).

**Components:**
- **Modal Surface:** max-width 600px, glass surface, 1px border `rgba(255,255,255,0.1)`
- **Status Pulse:** 12px circle, animated `box-shadow` ripple emitting outward infinitely
- **Timeline:** Vertical organic line with dots for task history events
- **Collaborators:** Stacked avatars of involved team members

**Interactions:**
- Click outside → modal scales to `0.95`, fades out
- Hover collaborator → avatar scales `1.1`, name tooltip appears

---

## Key User Flow: Unblocking a Decision Orb

1. User is on **Overview Nebula** → sees amber pulsing Decision Orb in Decision Dock
2. User clicks **Decision Orb** → **Task Node Detail** modal opens with context + Grant/Deny buttons
3. User clicks **Grant Access** → orb flashes teal, dissolves, task moves to active stream
4. Database: `decision_orbs.status` → `granted`, `decision_orbs.resolved_at` → now(), `tasks.status` → `active`

---

## File Structure

```
orbittm/
├── src/
│   ├── app/
│   │   ├── layout.tsx              — Root layout (fonts, global styles, sidebar)
│   │   ├── page.tsx                — Overview Nebula
│   │   ├── globals.css             — Design tokens, Tailwind overrides, animations
│   │   ├── decisions/
│   │   │   └── page.tsx            — Decision Nexus
│   │   ├── team/
│   │   │   └── page.tsx            — Team Orbit
│   │   └── api/
│   │       ├── tasks/
│   │       │   └── route.ts        — Tasks CRUD
│   │       ├── users/
│   │       │   └── route.ts        — Users CRUD
│   │       ├── decisions/
│   │       │   └── route.ts        — Decision Orbs CRUD + Grant/Deny
│   │       └── stats/
│   │           └── route.ts        — System vitals aggregation
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         — Left navigation sidebar
│   │   │   └── SystemVitals.tsx    — Top metrics bar
│   │   ├── nebula/
│   │   │   ├── TaskCard.tsx        — Floating task card
│   │   │   ├── DecisionDock.tsx    — Right-side decision orb panel
│   │   │   └── DecisionOrb.tsx     — Single pulsing orb
│   │   ├── decisions/
│   │   │   ├── OrbList.tsx         — Left pane orb list
│   │   │   └── ContextGlass.tsx    — Right pane detail + actions
│   │   ├── team/
│   │   │   ├── UserPlanet.tsx      — Avatar with load ring
│   │   │   ├── LoadRing.tsx        — SVG orbital ring
│   │   │   └── FilterBar.tsx       — Glass pill filter
│   │   └── shared/
│   │       ├── TaskNodeDetail.tsx   — Modal overlay
│   │       ├── StatusPulse.tsx      — Animated status indicator
│   │       ├── Timeline.tsx         — Vertical history line
│   │       └── GlassPanel.tsx       — Reusable glass surface
│   ├── db/
│   │   ├── index.ts                — Drizzle client + Neon connection
│   │   ├── schema.ts               — All table definitions
│   │   └── seed.ts                  — Demo data seeder
│   └── lib/
│       ├── utils.ts                 — Shared helpers
│       └── types.ts                 — Shared TypeScript types
├── drizzle.config.ts                — Drizzle Kit config
├── tailwind.config.ts               — Tailwind with custom design tokens
├── TRACKER.md                       — Project progress tracker
└── docs/superpowers/
    ├── specs/
    │   └── 2026-07-02-orbit-system-design.md
    └── plans/
        └── 2026-07-02-orbit-system-plan.md
```
