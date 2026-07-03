"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { Timeline } from "@/components/shared/Timeline";
import { urgencyToColor } from "@/lib/utils";
import type { Task, TimelineEvent, DecisionOrb, User, TaskStatus, UrgencyLevel } from "@/lib/types";

interface TaskNodeDetailProps {
  task: Task;
  onClose: () => void;
  onGrant?: (orbId: string) => void;
  onDeny?: (orbId: string) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

interface TaskDetail extends Task {
  timeline: TimelineEvent[];
  decisionOrbs: DecisionOrb[];
}

export function TaskNodeDetail({ task, onClose, onGrant, onDeny, onUpdate, onDelete }: TaskNodeDetailProps) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>("medium");
  const [editAssignee, setEditAssignee] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`);
      const data = await res.json();
      setDetail(data.data);
      setEditTitle(data.data.title);
      setEditDescription(data.data.description || "");
      setEditUrgency(data.data.urgencyLevel);
      setEditAssignee(data.data.assignedUserId);
    } catch (err) {
      console.error("Failed to fetch task detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [taskRes, usersRes] = await Promise.all([
          fetch(`/api/tasks/${task.id}`),
          fetch("/api/users"),
        ]);
        const taskData = await taskRes.json();
        const usersData = await usersRes.json();
        setDetail(taskData.data);
        setEditTitle(taskData.data.title);
        setEditDescription(taskData.data.description || "");
        setEditUrgency(taskData.data.urgencyLevel);
        setEditAssignee(taskData.data.assignedUserId);
        setUsers(usersData.data || []);
      } catch (err) {
        console.error("Failed to fetch task detail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [task.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          urgencyLevel: editUrgency,
          assignedUserId: editAssignee,
        }),
      });
      setEditing(false);
      await fetchDetail();
      onUpdate?.();
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchDetail();
      onUpdate?.();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      onDelete?.();
      onClose();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setSaving(false);
    }
  };

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
        transition={{ ease: "easeInOut" }}
        onClick={onClose}
      >
        {/* Blurred background overlay */}
        <motion.div
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut" }}
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
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div className="flex items-start gap-3">
                    <StatusPulse
                      color={urgencyColor}
                      speed={task.urgencyLevel === "critical" ? "fast" : "normal"}
                    />
                    <div>
                      {editing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="font-display text-2xl text-text bg-white/5 border border-white/10 rounded-panel px-3 py-1 focus:outline-none focus:border-primary/50"
                        />
                      ) : (
                        <h2 className="font-display text-2xl text-text">{detail.title}</h2>
                      )}
                      <span
                        className="inline-flex px-3 py-0.5 rounded-pill text-xs font-body mt-2"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${urgencyColor} 15%, transparent)`,
                          color: urgencyColor,
                        }}
                      >
                        {detail.status} · {detail.urgencyLevel}
                      </span>
                    </div>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-xs text-muted hover:text-primary transition-colors px-3 py-1 rounded-pill hover:bg-white/5 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Description */}
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                    className="w-full text-sm text-muted bg-white/5 border border-white/10 rounded-panel px-4 py-3 mb-4 resize-none focus:outline-none focus:border-primary/50"
                  />
                ) : (
                  <p className="text-muted text-sm font-body mb-6 leading-relaxed">
                    {detail.description || "No description provided."}
                  </p>
                )}

                {/* Edit fields: Urgency + Assignee */}
                {editing && (
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-xs text-muted mb-1 block">Urgency</label>
                      <select
                        value={editUrgency}
                        onChange={(e) => setEditUrgency(e.target.value as UrgencyLevel)}
                        className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted mb-1 block">Assigned To</label>
                      <select
                        value={editAssignee || ""}
                        onChange={(e) => setEditAssignee(e.target.value || null)}
                        className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Assigned user (read mode) */}
                {!editing && detail.assignedUser && (
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

                {/* Status transition buttons */}
                {!editing && (
                  <div className="flex gap-2 mb-6">
                    {detail.status !== "active" && (
                      <button
                        onClick={() => handleStatusChange("active")}
                        disabled={saving}
                        className="text-xs px-4 py-1.5 rounded-pill bg-primary text-background font-body tracking-wide transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                    {detail.status !== "blocked" && (
                      <button
                        onClick={() => handleStatusChange("blocked")}
                        disabled={saving}
                        className="text-xs px-4 py-1.5 rounded-pill bg-decision text-background font-body tracking-wide transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                      >
                        Block
                      </button>
                    )}
                    {detail.status !== "completed" && (
                      <button
                        onClick={() => handleStatusChange("completed")}
                        disabled={saving}
                        className="text-xs px-4 py-1.5 rounded-pill bg-primary text-background font-body tracking-wide transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                )}

                {/* Edit action buttons */}
                {editing && (
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      onClick={handleSave}
                      disabled={saving || !editTitle.trim()}
                      className="text-xs px-5 py-1.5 rounded-pill bg-primary text-background font-body tracking-wide transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
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
                      className="text-xs px-4 py-1.5 rounded-pill text-muted hover:text-text transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <div className="ml-auto">
                      {confirmDelete ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-urgent">This action cannot be undone. Delete this task?</span>
                          <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="text-xs px-3 py-1 rounded-pill bg-urgent text-background cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-xs text-muted cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="text-xs text-urgent/60 hover:text-urgent transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
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
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ ease: "easeInOut" }}
                            onClick={() => handleGrant(orb.id)}
                            disabled={actionLoading === orb.id}
                          >
                            {actionLoading === orb.id ? "..." : "Grant Access"}
                          </motion.button>
                          <motion.button
                            className="px-8 py-3 rounded-pill border border-urgent/30 text-urgent font-display font-medium text-sm min-w-[120px]"
                            whileHover={{ scale: 1.02, backgroundColor: "color-mix(in srgb, var(--color-urgent) 10%, transparent)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ ease: "easeInOut" }}
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
