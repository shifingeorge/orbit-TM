"use client";

import { motion } from "framer-motion";
import type { DecisionOrbSummary } from "@/lib/types";

interface DecisionOrbProps {
  orb: DecisionOrbSummary;
  onClick: (orb: DecisionOrbSummary) => void;
}

export function DecisionOrb({ orb, onClick }: DecisionOrbProps) {
  return (
    <motion.button
      onClick={() => onClick(orb)}
      className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer group bg-decision"
      animate={{
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 20px color-mix(in srgb, var(--color-decision) 30%, transparent)",
          "0 0 40px color-mix(in srgb, var(--color-decision) 60%, transparent)",
          "0 0 20px color-mix(in srgb, var(--color-decision) 30%, transparent)",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.15,
        transition: { duration: 0.2, ease: "easeInOut" },
      }}
      title={orb.task?.title || "Decision required"}
    >
      <span className="text-background font-display font-bold text-sm">!</span>

      {/* Outer ring glow */}
      <motion.div
        className="absolute inset-[-4px] rounded-full border-2 border-decision/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
}
