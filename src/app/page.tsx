"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SystemVitals } from "@/components/layout/SystemVitals";
import { TaskCard } from "@/components/nebula/TaskCard";
import { DecisionDock } from "@/components/nebula/DecisionDock";
import { TaskNodeDetail } from "@/components/shared/TaskNodeDetail";
import type { Task, DecisionOrbSummary, SystemStat } from "@/lib/types";

export default function OverviewNebula() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<DecisionOrbSummary[]>([]);
  const [stats, setStats] = useState<SystemStat[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, statsRes, decisionsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/stats"),
          fetch("/api/decisions"),
        ]);
        const tasksData = await tasksRes.json();
        const statsData = await statsRes.json();
        const decisionsData = await decisionsRes.json();

        setTasks(tasksData.data || []);
        setStats(statsData.data || []);
        setDecisions(decisionsData.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleOrbClick = (orb: DecisionOrbSummary) => {
    // Find associated task and open detail modal
    const task = tasks.find((t) => t.id === orb.taskId);
    if (task) setSelectedTask(task);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex gap-3 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-40 !rounded-pill" />
          ))}
        </div>
        <div className="flex flex-wrap gap-5 justify-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton w-[280px] h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="font-display text-2xl text-urgent mb-2">
            Failed to load
          </p>
          <p className="font-body text-sm text-muted">
            Check your connection and try again.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none ml-[72px]">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-decision/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* System Vitals */}
      <div className="relative z-10 mb-8">
        <SystemVitals stats={stats} />
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex gap-6">
        {/* Task Cluster — center area */}
        <div className="flex-1">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-[60vh]">
              <motion.p
                className="font-display text-2xl text-muted"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                All systems nominal
              </motion.p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 justify-center">
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, ease: "easeInOut" }}
                  >
                    <TaskCard task={task} onClick={handleTaskClick} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Decision Dock — right sticky */}
        <div className="sticky top-6 self-start">
          <DecisionDock orbs={decisions} onOrbClick={handleOrbClick} />
        </div>
      </div>

      {/* Task Node Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskNodeDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onGrant={(orbId) => {
              const orb = decisions.find((d) => d.id === orbId);
              setDecisions((prev) => prev.filter((d) => d.id !== orbId));
              if (orb) {
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === orb.taskId ? { ...t, status: "active" } : t
                  )
                );
                const wasBlocked = orb.task?.status === "blocked";
                setStats((prev) =>
                  prev.map((s) => {
                    if (s.label === "Pending Decisions") {
                      return { ...s, value: String(Math.max(0, Number(s.value) - 1)) };
                    }
                    if (s.label === "Active Nodes") {
                      return { ...s, value: String(Number(s.value) + 1) };
                    }
                    if (s.label === "Blocked" && wasBlocked) {
                      return { ...s, value: String(Math.max(0, Number(s.value) - 1)) };
                    }
                    return s;
                  })
                );
              }
            }}
            onDeny={(orbId) => {
              setDecisions((prev) => prev.filter((d) => d.id !== orbId));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
