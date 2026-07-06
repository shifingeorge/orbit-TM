"use client";

import { useState } from "react";
import { StatBar } from "@/components/tasks/StatBar";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { NewTaskDialog } from "@/components/tasks/NewTaskDialog";
import { useApi } from "@/lib/useApi";
import type { Task, SystemStat } from "@/lib/types";

export default function TasksPage() {
  const tasks = useApi<Task[]>("/api/tasks");
  const stats = useApi<SystemStat[]>("/api/stats");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const refetchAll = () => {
    tasks.refetch();
    stats.refetch();
  };

  if (tasks.loading || stats.loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="skeleton h-12 w-full mb-6" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-9 w-full mb-2" />
        ))}
      </div>
    );
  }

  if (tasks.error || stats.error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[15px] font-medium mb-1">Failed to load</p>
        <p className="text-[13px] text-muted mb-4">
          Check your connection and try again.
        </p>
        <button
          onClick={refetchAll}
          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-surface transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const taskList = tasks.data || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <StatBar stats={stats.data || []} />

      <div className="flex items-center justify-between py-4">
        <h1 className="text-[15px] font-semibold">
          Tasks <span className="text-muted font-normal">{taskList.length}</span>
        </h1>
        <button
          onClick={() => setCreating(true)}
          className="px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors cursor-pointer"
        >
          New task
        </button>
      </div>

      {taskList.length === 0 ? (
        <p className="text-[13px] text-muted py-16 text-center">No tasks.</p>
      ) : (
        <div className="divide-y divide-border border-t border-b border-border">
          {taskList.map((task) => (
            <TaskRow key={task.id} task={task} onClick={(t) => setSelectedTaskId(t.id)} />
          ))}
        </div>
      )}

      {creating && (
        <NewTaskDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            refetchAll();
          }}
        />
      )}

      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onChanged={refetchAll}
        />
      )}
    </div>
  );
}
