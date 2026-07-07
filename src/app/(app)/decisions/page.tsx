"use client";

import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/components/auth/AuthProvider";
import { isManagerRole } from "@/lib/utils";
import type { DecisionOrb } from "@/lib/types";

export default function DecisionsPage() {
  const { user } = useAuth();
  const isManager = isManagerRole(user?.role);
  const decisions = useApi<DecisionOrb[]>("/api/decisions");
  const [actingId, setActingId] = useState<string | null>(null);

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

  const pending = (decisions.data || []).filter((d) => d.status === "pending");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-[15px] font-semibold py-4">
        Decisions <span className="text-muted font-normal">{pending.length}</span>
      </h1>

      {pending.length === 0 ? (
        <p className="text-[13px] text-muted py-16 text-center">
          No pending decisions.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((orb) => (
            <div key={orb.id} className="border border-border rounded-md p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[13px] font-medium">
                  {orb.task?.title || "Untitled task"}
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
    </div>
  );
}
