"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { cn } from "@/lib/utils";
import type { SystemStat } from "@/lib/types";

interface SystemVitalsProps {
  stats: SystemStat[];
}

export function SystemVitals({ stats }: SystemVitalsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, ease: "easeOut" }}
        >
          <GlassPanel className="px-5 py-3 flex items-center gap-3 !rounded-pill">
            <span className="text-muted text-sm font-body tracking-wide">
              {stat.label}
            </span>
            <span className="font-mono text-2xl text-text">
              {stat.value}
            </span>
            {stat.trend && (
              <span
                className={cn(
                  "text-xs",
                  stat.trend === "up" ? "text-primary" : stat.trend === "down" ? "text-urgent" : "text-muted"
                )}
              >
                {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"}
              </span>
            )}
          </GlassPanel>
        </motion.div>
      ))}
    </div>
  );
}
