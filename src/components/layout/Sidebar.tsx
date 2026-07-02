"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Nebula", icon: "◉" },
  { href: "/decisions", label: "Decisions", icon: "◈" },
  { href: "/team", label: "Team", icon: "⬡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] glass flex flex-col items-center py-8 gap-2 z-50 rounded-none border-l-0 border-t-0 border-b-0">
      {/* Logo */}
      <div className="mb-8">
        <motion.div
          className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ boxShadow: ["0 0 20px rgba(0,229,255,0.2)", "0 0 40px rgba(0,229,255,0.4)", "0 0 20px rgba(0,229,255,0.2)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-primary text-lg font-bold font-display">O</span>
        </motion.div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-panel flex items-center justify-center cursor-pointer transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-text hover:bg-white/5"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
