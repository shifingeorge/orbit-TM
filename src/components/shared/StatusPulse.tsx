"use client";

import { motion } from "framer-motion";

interface StatusPulseProps {
  color: string;
  speed?: "normal" | "fast";
  size?: number;
}

export function StatusPulse({ color, speed = "normal", size = 12 }: StatusPulseProps) {
  const duration = speed === "fast" ? 1.5 : 2.5;

  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color, opacity: 0.4 }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
    </span>
  );
}
