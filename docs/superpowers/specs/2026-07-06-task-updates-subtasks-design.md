# Task Updates + Subtasks — Design Spec

**Date:** 2026-07-06
**Status:** Approved
**Motivating story:** Assignee analyzing Swiggy orders has 4/5 datasets, needs one more from the Swiggy POC (ETA 1 day). They post that as an update on the task so the founder/team head sees status at a glance without asking.

## Scope

Two additions to the existing minimal UI:

1. **Updates** — freeform progress notes on a task, attributed to a chosen user, timestamped.
2. **Subtasks** — flat checklist (title + done) under a task.

Explicitly NOT building: nesting, subtask assignees, update editing/deletion, mentions, notifications.

## Data model (Drizzle, Neon Postgres)

```
task_updates
  id         uuid pk default random
  task_id    uuid -> tasks.id, cascade delete, not null
  author_id  uuid -> users.id, not null
  body       text not null
  created_at timestamp default now

subtasks
  id         uuid pk default random
  task_id    uuid -> tasks.id, cascade delete, not null
  title      text not null
  done       boolean default false not null
  created_at timestamp default now
```

`task_timeline` stays system-events-only. Updates are a separate human channel.

## API (all `{ data }` / `{ error }` shape)

- `GET /api/tasks/[id]` — response gains `updates` (with author join, newest first) and `subtasks` (oldest first).
- `POST /api/tasks/[id]/updates` — `{ body, authorId }`, both required. 404 if task missing.
- `POST /api/tasks/[id]/subtasks` — `{ title }` required. 404 if task missing.
- `PATCH /api/subtasks/[id]` — `{ done }` toggle.
- `DELETE /api/subtasks/[id]`.
- `GET /api/tasks` — each task gains `latestUpdate` (`{ body, authorName, createdAt } | null`) and `subtaskCount` / `subtaskDoneCount` numbers.

## UI

**TaskDetail dialog** (existing section order: header → status → decisions → history):
- **Subtasks** section above Pending decisions: checkbox list (line-through when done), delete button on hover, inline add input (Enter or button). Optimistic-free: mutate then refetch detail, matching existing pattern.
- **Updates** section above History: textarea + "Posting as" user select (defaults to task assignee, else first user) + Post button. List newest first: body, author name, relative time.

**TaskRow:** muted truncated line under title with latest update body when present. Small "2/5" muted counter next to urgency when subtasks exist. Nothing rendered when empty.

## Error handling

Same conventions as existing code: mutations `console.error` + keep dialog open; list fetch failures already covered by useApi error state. API routes try/catch → 500 `{ error }`.

## Verification

Live browser flow: add subtask → toggle → row shows 1/1; post update → appears newest-first + row snippet; delete subtask; delete task cascades (DB-level).
