"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "heavy" | "intense";
  glow?: "primary" | "decision" | "urgent" | "none";
  children: React.ReactNode;
}

export function GlassPanel({
  variant = "default",
  glow = "none",
  children,
  className,
  ...props
}: GlassPanelProps) {
  const variantClass = {
    default: "glass",
    heavy: "glass-heavy",
    intense: "glass-intense",
  }[variant];

  const glowClass = {
    primary: "glow-primary",
    decision: "glow-decision",
    urgent: "glow-urgent",
    none: "",
  }[glow];

  return (
    <motion.div
      className={cn(variantClass, glowClass, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
