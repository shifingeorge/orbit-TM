"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { Timeline } from "@/components/shared/Timeline";
import { urgencyToColor } from "@/lib/utils";
import type { Task, TimelineEvent, DecisionOrb } from "@/lib/types";

interface TaskNodeDetailProps {
  task: Task;
  onClose: () => void;
  onGrant?: (orbId: string) => void;
  onDeny?: (orbId: string) => void;
}

interface TaskDetail extends Task {
  timeline: TimelineEvent[];
  decisionOrbs: DecisionOrb[];
}

export function TaskNodeDetail({ task, onClose, onGrant, onDeny }: TaskNodeDetailProps) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/tasks/${task.id}`);
        const data = await res.json();
        setDetail(data.data);
      } catch (err) {
        console.error("Failed to fetch task detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [task.id]);

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
                <div className="flex items-start gap-3 mb-6">
                  <StatusPulse
                    color={urgencyColor}
                    speed={task.urgencyLevel === "critical" ? "fast" : "normal"}
                  />
                  <div>
                    <h2 className="font-display text-2xl text-text">{detail.title}</h2>
                    <span
                      className="inline-flex px-3 py-0.5 rounded-pill text-xs font-body mt-2"
                      style={{
                        backgroundColor: `${urgencyColor}15`,
                        color: urgencyColor,
                      }}
                    >
                      {detail.status} · {detail.urgencyLevel}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted text-sm font-body mb-6 leading-relaxed">
                  {detail.description || "No description provided."}
                </p>

                {/* Assigned user */}
                {detail.assignedUser && (
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
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,229,255,0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ ease: "easeInOut" }}
                            onClick={() => handleGrant(orb.id)}
                            disabled={actionLoading === orb.id}
                          >
                            {actionLoading === orb.id ? "..." : "Grant Access"}
                          </motion.button>
                          <motion.button
                            className="px-8 py-3 rounded-pill border border-urgent/30 text-urgent font-display font-medium text-sm min-w-[120px]"
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,51,102,0.1)" }}
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
