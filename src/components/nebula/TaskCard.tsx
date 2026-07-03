"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { StatusPulse } from "@/components/shared/StatusPulse";
import { urgencyToColor, formatRelativeTime } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const urgencyColor = urgencyToColor(task.urgencyLevel);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
      onClick={() => onClick(task)}
      className="cursor-pointer"
    >
      <GlassPanel
        className="w-[280px] p-5 hover:glow-primary transition-shadow duration-500"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-base text-text leading-tight pr-3">
            {task.title}
          </h3>
          <StatusPulse
            color={urgencyColor}
            speed={task.urgencyLevel === "critical" ? "fast" : "normal"}
          />
        </div>

        {/* Description preview */}
        <p className="text-muted text-sm line-clamp-2 mb-4 font-body">
          {task.description || "No description"}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Assigned user avatar */}
          {task.assignedUser && (
            <div className="flex items-center gap-2">
              <img
                src={task.assignedUser.avatarUrl || ""}
                alt={task.assignedUser.name}
                className="w-6 h-6 rounded-full border border-surface-border"
              />
              <span className="text-muted text-xs font-body">
                {task.assignedUser.name}
              </span>
            </div>
          )}

          {/* Timestamp */}
          <span className="text-muted/60 text-xs font-body">
            {formatRelativeTime(task.createdAt)}
          </span>
        </div>

        {/* Status badge */}
        <div className="mt-3">
          <span
            className="inline-flex px-3 py-1 rounded-pill text-xs font-body tracking-wide"
            style={{
              backgroundColor: `color-mix(in srgb, ${urgencyColor} 15%, transparent)`,
              color: urgencyColor,
            }}
          >
            {task.status}
          </span>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
