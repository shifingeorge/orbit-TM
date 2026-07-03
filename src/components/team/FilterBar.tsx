"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/GlassPanel";
import type { UserStatus } from "@/lib/types";

type FilterOption = UserStatus | "all";

interface FilterBarProps {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
}

const options: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
  { value: "available", label: "Available" },
];

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <GlassPanel className="inline-flex p-1 gap-1 !rounded-pill mx-auto">
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative px-5 py-2 rounded-pill text-sm font-body transition-colors ${
            active === opt.value ? "text-background" : "text-muted hover:text-text"
          }`}
          whileTap={{ scale: 0.95 }}
          transition={{ ease: "easeInOut" }}
        >
          {active === opt.value && (
            <motion.div
              className="absolute inset-0 bg-primary rounded-pill"
              layoutId="filterActive"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </motion.button>
      ))}
    </GlassPanel>
  );
}
