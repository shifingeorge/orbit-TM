"use client";

import { motion } from "framer-motion";

interface LoadRingProps {
  taskCount: number;
  capacity: number;
  size?: number;
}

export function LoadRing({ taskCount, capacity, size = 100 }: LoadRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(taskCount / capacity, 1);
  const dashLength = circumference * ratio;
  const isOverloaded = taskCount >= capacity;
  const color = isOverloaded ? "var(--color-urgent)" : "var(--color-primary)";

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-surface-border)"
        strokeWidth={strokeWidth}
      />
      {/* Load ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={{ strokeDasharray: `${dashLength} ${circumference - dashLength}` }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </svg>
  );
}
