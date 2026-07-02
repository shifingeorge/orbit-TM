"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { DecisionOrb } from "./DecisionOrb";
import type { DecisionOrb as DecisionOrbType } from "@/lib/types";

interface DecisionDockProps {
  orbs: DecisionOrbType[];
  onOrbClick: (orb: DecisionOrbType) => void;
}

export function DecisionDock({ orbs, onOrbClick }: DecisionDockProps) {
  const pendingOrbs = orbs.filter((o) => o.status === "pending");

  if (pendingOrbs.length === 0) return null;

  return (
    <GlassPanel
      glow="decision"
      className="p-4 flex flex-col items-center gap-4 min-w-[80px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: "easeInOut" }}
    >
      <span className="text-decision text-xs font-body tracking-widest uppercase">
        Decisions
      </span>
      <span className="font-mono text-2xl text-decision">
        {pendingOrbs.length}
      </span>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {pendingOrbs.map((orb) => (
            <motion.div
              key={orb.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ ease: "easeInOut" }}
            >
              <DecisionOrb orb={orb} onClick={onOrbClick} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
