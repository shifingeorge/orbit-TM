"use client";

import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn, formatRelativeTime, isManagerRole } from "@/lib/utils";
import type { DecisionOrb, Task } from "@/lib/types";

const inputClass =
  "w-full text-[13px] border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent placeholder:text-neutral";

export default function DecisionsPage() {
  const { user } = useAuth();
  const isManager = isManagerRole(user?.role);
  const decisions = useApi<DecisionOrb[]>("/api/decisions");
  const { data: tasks } = useApi<Task[]>("/api/tasks");
  const [actingId, setActingId] = useState<string | null>(null);

  const [contextReason, setContextReason] = useState("");
  const [taskId, setTaskId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const resolve = async (id: string, status: "granted" | "denied") => {
    setActingId(id);
    try {
      const res = await fetch(`/api/decisions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await decisions.refetch();
    } catch (err) {
      console.error("Failed to resolve decision:", err);
    } finally {
      setActingId(null);
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextReason.trim()) {
      setSubmitError("Describe what you need approved");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextReason: contextReason.trim(),
          taskId: taskId || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to submit request");
      }
      setContextReason("");
      setTaskId("");
      await decisions.refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (decisions.loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full mb-3" />
        ))}
      </div>
    );
  }

  if (decisions.error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[15px] font-medium mb-1">Failed to load</p>
        <p className="text-[13px] text-muted mb-4">
          Check your connection and try again.
        </p>
        <button
          onClick={decisions.refetch}
          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-surface transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const all = decisions.data || [];
  const pending = all.filter((d) => d.status === "pending");
  const resolved = all.filter((d) => d.status !== "pending");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-[15px] font-semibold py-4">
        Decisions <span className="text-muted font-normal">{pending.length}</span>
      </h1>

      <form
        onSubmit={submitRequest}
        className="border border-border rounded-md p-4 mb-6 flex flex-col gap-3"
      >
        <h2 className="text-[13px] font-medium">New request</h2>
        <textarea
          value={contextReason}
          onChange={(e) => setContextReason(e.target.value)}
          placeholder="What do you need approved? e.g. a content idea, a scope change..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Related task (optional)</label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">None — standalone request</option>
              {(tasks || []).map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !contextReason.trim()}
            className="px-3 py-2 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        {submitError && <p className="text-xs text-danger">{submitError}</p>}
      </form>

      {pending.length === 0 ? (
        <p className="text-[13px] text-muted py-8 text-center">
          No pending decisions.
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {pending.map((orb) => (
            <div key={orb.id} className="border border-border rounded-md p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[13px] font-medium">
                  {orb.task?.title || "Standalone request"}
                </p>
                <span className="text-xs text-muted shrink-0">
                  {orb.requester?.name || "Unknown"}
                </span>
              </div>
              <p className="text-[13px] text-muted mb-3">{orb.contextReason}</p>
              {isManager ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolve(orb.id, "granted")}
                    disabled={actingId === orb.id}
                    className="px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actingId === orb.id ? "..." : "Grant"}
                  </button>
                  <button
                    onClick={() => resolve(orb.id, "denied")}
                    disabled={actingId === orb.id}
                    className="px-3 py-1 rounded-md border border-border text-xs text-danger hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Deny
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted">Awaiting a manager decision.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Resolved
          </h2>
          <div className="flex flex-col gap-2">
            {resolved.map((orb) => (
              <div key={orb.id} className="border border-border rounded-md p-3">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-[13px] font-medium">
                    {orb.task?.title || "Standalone request"}
                  </p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-pill shrink-0",
                      orb.status === "granted"
                        ? "bg-accent/10 text-accent"
                        : "bg-danger/10 text-danger"
                    )}
                  >
                    {orb.status === "granted" ? "Granted" : "Denied"}
                  </span>
                </div>
                <p className="text-[13px] text-muted mb-1">{orb.contextReason}</p>
                <p className="text-xs text-muted">
                  {orb.requester?.name || "Unknown"} ·{" "}
                  {orb.resolvedAt ? formatRelativeTime(orb.resolvedAt) : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
