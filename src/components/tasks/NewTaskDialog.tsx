"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { useApi } from "@/lib/useApi";
import type { User, UrgencyLevel } from "@/lib/types";

interface NewTaskDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

const inputClass =
  "w-full text-[13px] border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent placeholder:text-neutral";

export function NewTaskDialog({ onClose, onCreated }: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("medium");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { data: users } = useApi<User[]>("/api/users");

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
    <Dialog onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold">New task</h2>
        <button
          onClick={onClose}
          className="text-muted hover:text-text transition-colors text-lg leading-none cursor-pointer"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-muted mb-1 block">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs text-muted mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, requirements, links..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Priority</label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
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
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Unassigned</option>
              {(users || []).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="mt-1 py-2 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Creating..." : "Create task"}
        </button>
      </form>
    </Dialog>
  );
}
