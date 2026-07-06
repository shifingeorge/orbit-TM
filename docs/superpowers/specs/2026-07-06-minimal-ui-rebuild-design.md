# Minimal UI Rebuild — Design

Date: 2026-07-06. Approved scope: full rebuild (drop space metaphor), light theme, list-row task layout.

## Visual system

- Light theme. Background `#FFFFFF`, text `#18181B`, borders `#E4E4E7`, muted `#71717A`, accent blue `#2563EB`.
- Status dots: green (active), amber (pending), red (blocked), gray (completed).
- Single font: Inter via `next/font/google` (self-hosted; removes 3 external font imports).
- No glass, glows, or gradients. 1px borders, 8px radius, `shadow-sm` on dialogs only.
- Drop framer-motion entirely; CSS transitions only.
- Plain language: "New task", "Active", "No tasks". No "Launch", "Nebula", "Orbs", "Nodes".

## Layout & routes

- Sidebar: 200px fixed left, text nav links (Tasks, Decisions, Team), app name header.
- `/` Tasks: stat row (plain numbers from /api/stats) + header with count and "New task" button + list rows (status dot, title, urgency, assignee initials, updated time). Row click opens task detail dialog.
- `/decisions`: plain list of pending decisions — task title, requester, reason, inline Grant/Deny.
- `/team`: simple table — member, status, task count, capacity; status filter tabs.

## Logic cleanup

- Shared `useApi<T>(url)` hook (data/loading/error/refetch) replaces duplicated fetch blocks in every page.
- After grant/deny/create/update/delete: `refetch()` tasks + stats + decisions. Removes the 40-line manual stat-patching in `page.tsx` that string-matched stat labels.
- API routes unchanged except stat label text ("Active Nodes" → "Active" etc) — safe now that no client string-matches labels.
- Components: delete `nebula/`, `decisions/`, `team/`, `shared/` component sets (14 files). New: `Sidebar`, `ui/Dialog`, `tasks/StatBar`, `tasks/TaskRow`, `tasks/TaskDetail`, `tasks/NewTaskDialog`. Decision rows and team table inline in their pages.

## Testing

`npm run build` + lint clean; browser-verify all 3 routes plus create/edit/status/grant/deny/delete flows on dev server. Neon cold-start flakiness is a known separate issue.
