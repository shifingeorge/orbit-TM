"use client";

import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { cn, initials } from "@/lib/utils";
import type { User, UserStatus } from "@/lib/types";

type FilterOption = UserStatus | "all";

const filters: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "available", label: "Available" },
  { value: "blocked", label: "Blocked" },
];

const statusDot: Record<UserStatus, string> = {
  active: "bg-success",
  available: "bg-neutral",
  blocked: "bg-danger",
};

export default function TeamPage() {
  const users = useApi<(User & { taskCount: number })[]>("/api/users");
  const [filter, setFilter] = useState<FilterOption>("all");

  if (users.loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-full mb-2" />
        ))}
      </div>
    );
  }

  if (users.error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[15px] font-medium mb-1">Failed to load</p>
        <p className="text-[13px] text-muted mb-4">
          Check your connection and try again.
        </p>
        <button
          onClick={users.refetch}
          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-surface transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? users.data || []
      : (users.data || []).filter((u) => u.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-[15px] font-semibold">
          Team <span className="text-muted font-normal">{filtered.length}</span>
        </h1>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer",
                filter === f.value
                  ? "bg-border/50 text-text font-medium"
                  : "text-muted hover:text-text"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[13px] text-muted py-16 text-center">No members.</p>
      ) : (
        <table className="w-full border-t border-b border-border">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="font-normal py-2 px-2">Member</th>
              <th className="font-normal py-2 px-2">Status</th>
              <th className="font-normal py-2 px-2 text-right">Tasks</th>
              <th className="font-normal py-2 px-2 text-right">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border border-t border-border">
            {filtered.map((user) => (
              <tr key={user.id} className="text-[13px]">
                <td className="py-2.5 px-2">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex w-6 h-6 rounded-full bg-surface border border-border items-center justify-center text-[10px] text-muted">
                      {initials(user.name)}
                    </span>
                    {user.name}
                  </span>
                </td>
                <td className="py-2.5 px-2">
                  <span className="flex items-center gap-1.5 capitalize">
                    <span className={cn("w-2 h-2 rounded-full", statusDot[user.status])} />
                    {user.status}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right">{user.taskCount}</td>
                <td className="py-2.5 px-2 text-right text-muted">
                  {user.capacityLimit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
