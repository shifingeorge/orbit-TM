"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import type { UserRole } from "@/lib/types";

interface AddMemberDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

const inputClass =
  "w-full text-[13px] border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent placeholder:text-neutral";

export function AddMemberDialog({ onClose, onCreated }: AddMemberDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Name, email, and a 6+ char password are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add member");
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold">Add member</h2>
        <button
          onClick={onClose}
          className="text-muted hover:text-text transition-colors text-lg leading-none cursor-pointer"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-muted mb-1 block">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoFocus
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@orbittm.dev"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="founder">Founder</option>
          </select>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 py-2 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Adding..." : "Add member"}
        </button>
      </form>
    </Dialog>
  );
}
