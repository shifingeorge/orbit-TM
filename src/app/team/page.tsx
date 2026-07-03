"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlanet } from "@/components/team/UserPlanet";
import { FilterBar } from "@/components/team/FilterBar";
import type { User, UserStatus } from "@/lib/types";

type FilterOption = UserStatus | "all";

export default function TeamOrbit() {
  const [users, setUsers] = useState<(User & { taskCount: number })[]>([]);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = filter === "all"
    ? users
    : users.filter((u) => u.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="skeleton h-9 w-56 mb-8" />
        <div className="flex justify-center mb-12">
          <div className="skeleton h-12 w-72 !rounded-pill" />
        </div>
        <div className="flex flex-wrap justify-center gap-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton w-20 h-20 !rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="font-display text-2xl text-urgent mb-2">
            Failed to load
          </p>
          <p className="font-body text-sm text-muted">
            Check your connection and try again.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none ml-[72px]">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-urgent/[0.02] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-3xl text-text mb-8">Team Orbit</h1>

        {/* Filter Bar */}
        <div className="flex justify-center mb-12">
          <FilterBar active={filter} onChange={setFilter} />
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh]">
            <motion.p
              className="font-display text-xl text-muted"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              No active orbits
            </motion.p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-12">
            <AnimatePresence>
              {filteredUsers.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: i % 2 === 0 ? 0 : 20, // Staggered layout
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                >
                  <UserPlanet user={user} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
