"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadRing } from "./LoadRing";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { User } from "@/lib/types";

interface UserPlanetProps {
  user: User & { taskCount: number };
  onClick?: (user: User) => void;
}

export function UserPlanet({ user, onClick }: UserPlanetProps) {
  const [hovered, setHovered] = useState(false);
  const ringSize = 100;

  const statusColorVar =
    user.status === "active"
      ? "--color-primary"
      : user.status === "blocked"
        ? "--color-urgent"
        : "--color-muted";

  return (
    <motion.div
      className="flex flex-col items-center gap-3 relative cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick?.(user)}
      whileHover={{ scale: 1.05 }}
      transition={{ ease: "easeInOut" }}
    >
      {/* Avatar with Load Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: ringSize, height: ringSize }}
      >
        <LoadRing
          taskCount={user.taskCount}
          capacity={user.capacityLimit}
          size={ringSize}
        />
        <img
          src={user.avatarUrl || ""}
          alt={user.name}
          className="w-16 h-16 rounded-full border-2 border-surface-border z-10"
        />

        {/* Spin effect on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-0"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <LoadRing
                taskCount={user.taskCount}
                capacity={user.capacityLimit}
                size={ringSize}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name */}
      <span className="font-display text-sm text-text text-center">
        {user.name}
      </span>

      {/* Status indicator */}
      <span
        className="inline-flex px-2 py-0.5 rounded-pill text-[11px] font-body tracking-wide"
        style={{
          backgroundColor: `color-mix(in srgb, var(${statusColorVar}) 10%, transparent)`,
          color: `var(${statusColorVar})`,
        }}
      >
        {user.status}
      </span>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ ease: "easeInOut" }}
            className="absolute top-full mt-2 z-20"
          >
            <GlassPanel className="px-4 py-2 whitespace-nowrap">
              <p className="text-text text-xs font-body">
                {user.taskCount} / {user.capacityLimit} tasks
              </p>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
