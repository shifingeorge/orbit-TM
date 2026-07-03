"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { formatRelativeTime } from "@/lib/utils";
import type { DecisionOrb } from "@/lib/types";

interface OrbListProps {
  orbs: DecisionOrb[];
  selectedId: string | null;
  onSelect: (orb: DecisionOrb) => void;
}

export function OrbList({ orbs, selectedId, onSelect }: OrbListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-lg text-decision mb-2 tracking-wide">
        Pending Decisions
      </h2>
      <AnimatePresence>
        {orbs.map((orb, i) => {
          const isSelected = orb.id === selectedId;
          return (
            <motion.div
              key={orb.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.08, ease: "easeInOut" }}
            >
              <GlassPanel
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "!border-decision/40 glow-decision"
                    : "hover:!border-decision/20"
                }`}
                onClick={() => onSelect(orb)}
                whileHover={{ x: 4 }}
                transition={{ ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <StatusPulse color="var(--color-decision)" speed="normal" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text text-sm font-body truncate">
                      {orb.task?.title || "Unknown task"}
                    </p>
                    <p className="text-muted text-xs mt-1">
                      by {orb.requester?.name || "Unknown"} · {formatRelativeTime(orb.createdAt)}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
