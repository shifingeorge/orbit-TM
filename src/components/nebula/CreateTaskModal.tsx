"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { User, UrgencyLevel } from "@/lib/types";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("medium");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((res) => setUsers(res.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          urgencyLevel,
          assignedUserId: assignedUserId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut" }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut" }}
        />

        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
        >
          <GlassPanel variant="intense" className="w-[90vw] max-w-[500px] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-text">Launch New Task</h2>
              <button
                onClick={onClose}
                className="text-muted hover:text-text transition-colors text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-4 py-3 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-muted mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context, requirements, links..."
                  rows={3}
                  className="w-full text-sm text-muted bg-white/5 border border-white/10 rounded-panel px-4 py-3 resize-none focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] placeholder:text-white/20"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Urgency</label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                    className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Assign To</label>
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full text-sm text-text bg-white/5 border border-white/10 rounded-panel px-3 py-2.5 focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-xs text-urgent bg-urgent/10 px-3 py-2 rounded-panel">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="w-full py-3 rounded-pill bg-primary text-background font-display text-sm tracking-wide transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.3)] disabled:opacity-50 cursor-pointer mt-2"
              >
                {saving ? "Launching..." : "Launch Task"}
              </button>
            </form>
          </GlassPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
