"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return <p className="text-muted text-sm">No history yet</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

      <div className="flex flex-col gap-5">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            className="relative flex items-start gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, ease: "easeInOut" }}
          >
            {/* Dot */}
            <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-primary/60 border-2 border-background" />

            <div className="flex-1">
              <p className="text-text text-sm font-body">{event.event}</p>
              <div className="flex items-center gap-2 mt-1">
                {event.actor && (
                  <>
                    <img
                      src={event.actor.avatarUrl || ""}
                      alt={event.actor.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-muted text-xs">{event.actor.name}</span>
                    <span className="text-muted/40 text-xs">·</span>
                  </>
                )}
                <span className="text-muted/60 text-xs">
                  {formatRelativeTime(event.createdAt)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
