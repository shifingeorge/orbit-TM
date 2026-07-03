# Orbit System — Task CRUD Design Addendum

> **Extends:** `docs/superpowers/specs/2026-07-02-orbit-system-design.md`

## Purpose

The original spec covers display-only screens. This addendum adds **create, edit, and delete** capabilities so Orbit becomes a usable task management tool.

---

## Task Creation Modal

**Trigger:** Floating `+` button (pill shape, cyan glow) pinned to the bottom-right of the Overview Nebula page.

**Form Fields:**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| Title | `varchar(255)` text input | Yes | — |
| Description | `text` textarea | No | — |
| Urgency Level | Dropdown (`low` / `medium` / `high` / `critical`) | Yes | `medium` |
| Assign To | Dropdown of users (fetched from `/api/users`) | No | Unassigned |

**Style:** Uses `glass-intense` modal overlay matching Task Detail modal. Form inputs use transparent backgrounds with `rgba(255,255,255,0.05)` fills and `rgba(255,255,255,0.1)` borders. Focus state adds cyan `box-shadow`.

**Behavior:**
1. Click `+` → modal slides up from bottom with `translateY(20px)` → `translateY(0)` + opacity fade
2. Fill form → click "Launch Task" (cyan pill button)
3. POST `/api/tasks` — creates task + timeline event "Task created"
4. On success: modal closes, new TaskCard appears in Nebula with entrance animation
5. On error: red glow border on the form, error message below

---

## Task Editing (in Task Detail Modal)

**Trigger:** "Edit" icon button in the Task Detail modal header.

**Behavior:**
1. Click edit → title and description become editable input/textarea, urgency becomes dropdown, assigned user becomes dropdown
2. Status transitions use dedicated action buttons: "Start" (→ active), "Block" (→ blocked), "Complete" (→ completed)
3. Click "Save" → PATCH `/api/tasks/[id]` — creates timeline events for each changed field
4. Click "Cancel" → reverts to read-only view

---

## Task Deletion

**Trigger:** Muted red "Delete" button at the bottom of Task Detail modal (only visible in edit mode).

**Behavior:**
1. Click delete → confirmation prompt: "This action cannot be undone. Delete this task?"
2. Confirm → DELETE `/api/tasks/[id]`
3. Task card dissolves from Nebula (scale 0.95 + opacity 0 + translateY 10px)
4. Related decision orbs and timeline events are cascade-deleted

---

## API Endpoints (Full CRUD)

### Tasks
| Method | Path | Body | Returns |
|--------|------|------|---------|
| `GET` | `/api/tasks` | — | All tasks with assigned user |
| `GET` | `/api/tasks/[id]` | — | Single task + timeline + collaborators |
| `POST` | `/api/tasks` | `{ title, description?, urgencyLevel?, assignedUserId? }` | Created task |
| `PATCH` | `/api/tasks/[id]` | Partial task fields | Updated task |
| `DELETE` | `/api/tasks/[id]` | — | `{ success: true }` |

### Decisions
| Method | Path | Body | Returns |
|--------|------|------|---------|
| `GET` | `/api/decisions` | — | Pending orbs with task + requester |
| `PATCH` | `/api/decisions/[id]` | `{ status: "granted" \| "denied" }` | Updated decision |

### Users
| Method | Path | Body | Returns |
|--------|------|------|---------|
| `GET` | `/api/users` | — | All users with task counts |

### Stats
| Method | Path | Body | Returns |
|--------|------|------|---------|
| `GET` | `/api/stats` | — | System vitals (active tasks, blocked, pending decisions, team size) |
