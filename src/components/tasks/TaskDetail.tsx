"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { useApi } from "@/lib/useApi";
import { cn, formatRelativeTime, initials } from "@/lib/utils";
import type {
  Task,
  TaskStatus,
  TimelineEvent,
  DecisionOrb,
  User,
  UrgencyLevel,
  TaskUpdate,
  Subtask,
} from "@/lib/types";

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
  /** Called after any successful mutation (edit, status, grant/deny, delete). */
  onChanged: () => void;
}

interface TaskDetailData extends Task {
  timeline: TimelineEvent[];
  decisionOrbs: DecisionOrb[];
  updates: TaskUpdate[];
  subtasks: Subtask[];
}

const inputClass =
  "w-full text-[13px] border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent placeholder:text-neutral";

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pending",
  active: "Active",
  blocked: "Blocked",
  completed: "Completed",
};

export function TaskDetail({ taskId, onClose, onChanged }: TaskDetailProps) {
  const [detail, setDetail] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>("medium");
  const [editAssignee, setEditAssignee] = useState<string | null>(null);

  const [newSubtask, setNewSubtask] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [postingAs, setPostingAs] = useState<string>("");

  const { data: users } = useApi<User[]>("/api/users");

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data: TaskDetailData = json.data;
      setDetail(data);
      setEditTitle(data.title);
      setEditDescription(data.description || "");
      setEditUrgency(data.urgencyLevel);
      setEditAssignee(data.assignedUserId);
      setPostingAs((prev) => prev || data.assignedUserId || "");
    } catch (err) {
      console.error("Failed to fetch task detail:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    async function load() {
      await fetchDetail();
    }
    load();
  }, [fetchDetail]);

  const patchTask = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditing(false);
      await fetchDetail();
      onChanged();
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onChanged();
      onClose();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setSaving(false);
    }
  };

  const resolveDecision = async (orbId: string, status: "granted" | "denied") => {
    setSaving(true);
    try {
      const res = await fetch(`/api/decisions/${orbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchDetail();
      onChanged();
    } catch (err) {
      console.error("Failed to resolve decision:", err);
    } finally {
      setSaving(false);
    }
  };

  /** Runs a mutation request, then refreshes the dialog and notifies the list. */
  const mutate = async (input: RequestInfo, init: RequestInit, label: string) => {
    setSaving(true);
    try {
      const res = await fetch(input, init);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchDetail();
      onChanged();
      return true;
    } catch (err) {
      console.error(`Failed to ${label}:`, err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addSubtask = async () => {
    const title = newSubtask.trim();
    if (!title) return;
    const ok = await mutate(
      `/api/tasks/${taskId}/subtasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      },
      "add subtask"
    );
    if (ok) setNewSubtask("");
  };

  const toggleSubtask = (subtask: Subtask) =>
    mutate(
      `/api/subtasks/${subtask.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !subtask.done }),
      },
      "toggle subtask"
    );

  const deleteSubtask = (subtaskId: string) =>
    mutate(`/api/subtasks/${subtaskId}`, { method: "DELETE" }, "delete subtask");

  const postUpdate = async () => {
    const body = updateBody.trim();
    const authorId = postingAs || users?.[0]?.id;
    if (!body || !authorId) return;
    const ok = await mutate(
      `/api/tasks/${taskId}/updates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, authorId }),
      },
      "post update"
    );
    if (ok) setUpdateBody("");
  };

  const pendingDecisions =
    detail?.decisionOrbs?.filter((o) => o.status === "pending") || [];

  return (
    <Dialog onClose={onClose}>
      {loading ? (
        <p className="text-muted text-[13px] py-8 text-center">Loading...</p>
      ) : !detail ? (
        <p className="text-danger text-[13px] py-8 text-center">
          Failed to load task.
        </p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3 mb-4">
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={cn(inputClass, "text-[15px] font-semibold")}
              />
            ) : (
              <h2 className="text-[15px] font-semibold">{detail.title}</h2>
            )}
            <div className="flex items-center gap-2 shrink-0">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-muted hover:text-text transition-colors cursor-pointer"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="text-muted hover:text-text transition-colors text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>

          <p className="text-xs text-muted mb-4">
            {statusLabel[detail.status]} · {detail.urgencyLevel}
          </p>

          {editing ? (
            <div className="flex flex-col gap-3 mb-4">
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Priority</label>
                  <select
                    value={editUrgency}
                    onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Assignee</label>
                  <select
                    value={editAssignee || ""}
                    onChange={(e) => setEditAssignee(e.target.value || null)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Unassigned</option>
                    {(users || []).map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    patchTask({
                      title: editTitle,
                      description: editDescription || null,
                      urgencyLevel: editUrgency,
                      assignedUserId: editAssignee,
                    })
                  }
                  disabled={saving || !editTitle.trim()}
                  className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setConfirmDelete(false);
                    setEditTitle(detail.title);
                    setEditDescription(detail.description || "");
                    setEditUrgency(detail.urgencyLevel);
                    setEditAssignee(detail.assignedUserId);
                  }}
                  className="text-xs text-muted hover:text-text transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div className="ml-auto">
                  {confirmDelete ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="text-danger">Delete this task?</span>
                      <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-2 py-1 rounded-md bg-danger text-white cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-muted cursor-pointer"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-xs text-danger/70 hover:text-danger transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-muted mb-4">
                {detail.description || "No description."}
              </p>

              {detail.assignedUser && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex w-6 h-6 rounded-full bg-surface border border-border items-center justify-center text-[10px] text-muted">
                    {initials(detail.assignedUser.name)}
                  </span>
                  <span className="text-[13px]">{detail.assignedUser.name}</span>
                </div>
              )}

              <div className="flex gap-2 mb-5">
                {(["active", "blocked", "completed"] as TaskStatus[])
                  .filter((s) => s !== detail.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => patchTask({ status: s })}
                      disabled={saving}
                      className="px-3 py-1 rounded-md border border-border text-xs hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {s === "active" ? "Start" : s === "blocked" ? "Block" : "Complete"}
                    </button>
                  ))}
              </div>
            </>
          )}

          <div className="mb-5">
            <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
              Subtasks
              {detail.subtasks.length > 0 && (
                <span className="normal-case tracking-normal font-normal">
                  {" "}
                  · {detail.subtasks.filter((s) => s.done).length}/{detail.subtasks.length}
                </span>
              )}
            </h3>
            {detail.subtasks.map((subtask) => (
              <div key={subtask.id} className="group flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={subtask.done}
                  onChange={() => toggleSubtask(subtask)}
                  disabled={saving}
                  className="cursor-pointer accent-accent"
                />
                <span
                  className={cn(
                    "text-[13px] flex-1",
                    subtask.done && "line-through text-muted"
                  )}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => deleteSubtask(subtask.id)}
                  disabled={saving}
                  className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-1.5">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubtask();
                }}
                placeholder="Add a subtask..."
                className={inputClass}
              />
              <button
                onClick={addSubtask}
                disabled={saving || !newSubtask.trim()}
                className="px-3 py-1 rounded-md border border-border text-xs hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {pendingDecisions.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                Pending decisions
              </h3>
              {pendingDecisions.map((orb) => (
                <div
                  key={orb.id}
                  className="border border-border rounded-md p-3 mb-2"
                >
                  <p className="text-[13px] mb-3">{orb.contextReason}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveDecision(orb.id, "granted")}
                      disabled={saving}
                      className="px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Grant
                    </button>
                    <button
                      onClick={() => resolveDecision(orb.id, "denied")}
                      disabled={saving}
                      className="px-3 py-1 rounded-md border border-border text-xs text-danger hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
              Updates
            </h3>
            <div className="flex flex-col gap-2 mb-3">
              <textarea
                value={updateBody}
                onChange={(e) => setUpdateBody(e.target.value)}
                placeholder="Post a progress update..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted shrink-0">Posting as</span>
                <select
                  value={postingAs || users?.[0]?.id || ""}
                  onChange={(e) => setPostingAs(e.target.value)}
                  className="text-xs border border-border rounded-md px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
                >
                  {(users || []).map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button
                  onClick={postUpdate}
                  disabled={saving || !updateBody.trim()}
                  className="ml-auto px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Post
                </button>
              </div>
            </div>
            {detail.updates?.length ? (
              <ul className="flex flex-col gap-2.5">
                {detail.updates.map((update) => (
                  <li key={update.id} className="text-[13px]">
                    <p className="whitespace-pre-wrap">{update.body}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {update.author?.name || "Unknown"} ·{" "}
                      {formatRelativeTime(update.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">No updates yet.</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
              History
            </h3>
            {detail.timeline?.length ? (
              <ul className="flex flex-col gap-1.5">
                {detail.timeline.map((event) => (
                  <li key={event.id} className="flex justify-between gap-3 text-xs">
                    <span className="text-text">{event.event}</span>
                    <span className="text-muted shrink-0">
                      {formatRelativeTime(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">No history.</p>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
