"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrbList } from "@/components/decisions/OrbList";
import { ContextGlass } from "@/components/decisions/ContextGlass";
import type { DecisionOrb } from "@/lib/types";

export default function DecisionNexus() {
  const [orbs, setOrbs] = useState<DecisionOrb[]>([]);
  const [selectedOrb, setSelectedOrb] = useState<DecisionOrb | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecisions() {
      try {
        const res = await fetch("/api/decisions");
        const data = await res.json();
        const pendingOrbs = (data.data || []).filter(
          (o: DecisionOrb) => o.status === "pending"
        );
        setOrbs(pendingOrbs);
        setSelectedOrb((prev) => prev ?? (pendingOrbs.length > 0 ? pendingOrbs[0] : null));
      } catch (err) {
        console.error("Failed to fetch decisions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDecisions();
  }, []);

  const handleResolved = (orbId: string) => {
    setOrbs((prev) => {
      const remaining = prev.filter((o) => o.id !== orbId);
      setSelectedOrb(remaining.length > 0 ? remaining[0] : null);
      return remaining;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          className="font-display text-2xl text-decision/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading decision nexus...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none ml-[72px]">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-decision/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-3xl text-text mb-8">Decision Nexus</h1>

        {orbs.length === 0 ? (
          <div className="flex items-center justify-center h-[60vh]">
            <motion.div
              className="text-center"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-primary/20 text-9xl block mb-4">✓</span>
              <p className="font-display text-xl text-muted">All decisions cleared</p>
            </motion.div>
          </div>
        ) : (
          <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* Left pane — 30% */}
            <div className="w-[30%] overflow-y-auto pr-2">
              <OrbList
                orbs={orbs}
                selectedId={selectedOrb?.id || null}
                onSelect={setSelectedOrb}
              />
            </div>

            {/* Right pane — 70% */}
            <div className="w-[70%]">
              <ContextGlass
                orb={selectedOrb}
                onGrant={handleResolved}
                onDeny={handleResolved}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
