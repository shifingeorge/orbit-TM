"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import type { DecisionOrb } from "@/lib/types";

interface ContextGlassProps {
  orb: DecisionOrb | null;
  onGrant: (id: string) => void;
  onDeny: (id: string) => void;
}

export function ContextGlass({ orb, onGrant, onDeny }: ContextGlassProps) {
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: "granted" | "denied") => {
    if (!orb) return;
    setActionLoading(true);
    try {
      await fetch(`/api/decisions/${orb.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (action === "granted") {
        onGrant(orb.id);
      } else {
        onDeny(orb.id);
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!orb) {
    return (
      <GlassPanel
        variant="heavy"
        className="h-full flex items-center justify-center !border-primary/10"
      >
        <motion.div
          className="text-center"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-primary/20 text-8xl">✓</span>
          <p className="text-muted/40 font-body mt-4">Select a decision orb</p>
        </motion.div>
      </GlassPanel>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={orb.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
      >
        <GlassPanel
          variant="heavy"
          className="p-8 h-full !border-decision/20"
          glow="decision"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <StatusPulse color="var(--color-decision)" speed="normal" size={14} />
            <div>
              <h2 className="font-display text-2xl text-text">
                {orb.task?.title || "Decision Required"}
              </h2>
              <p className="text-muted text-sm mt-1">
                Requested by {orb.requester?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Context */}
          <div className="mb-8">
            <h3 className="font-display text-sm text-decision/80 mb-3 tracking-wide uppercase">
              Context
            </h3>
            <p className="text-text/90 text-sm font-body leading-relaxed">
              {orb.contextReason}
            </p>
          </div>

          {/* Task info */}
          <div className="mb-8 p-4 rounded-panel bg-white/[0.02] border border-surface-border">
            <p className="text-muted text-xs tracking-wide uppercase mb-1">Affected Task</p>
            <p className="text-text font-display">{orb.task?.title}</p>
            <span
              className="inline-flex px-3 py-0.5 rounded-pill text-xs font-body mt-2"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-decision) 10%, transparent)",
                color: "var(--color-decision)",
              }}
            >
              {orb.task?.status} · {orb.task?.urgencyLevel}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <motion.button
              className="flex-1 py-4 rounded-pill bg-primary text-background font-display font-medium text-base"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 40px color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ ease: "easeInOut" }}
              onClick={() => handleAction("granted")}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Grant Access"}
            </motion.button>
            <motion.button
              className="flex-1 py-4 rounded-pill border border-urgent/30 text-urgent font-display font-medium text-base"
              whileHover={{
                scale: 1.02,
                backgroundColor: "color-mix(in srgb, var(--color-urgent) 10%, transparent)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ ease: "easeInOut" }}
              onClick={() => handleAction("denied")}
              disabled={actionLoading}
            >
              Deny
            </motion.button>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}
