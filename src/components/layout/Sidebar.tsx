"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Tasks" },
  { href: "/decisions", label: "Decisions" },
  { href: "/team", label: "Team" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] border-r border-border bg-surface flex flex-col px-3 py-5 z-50">
      <div className="px-3 mb-6">
        <span className="text-[15px] font-semibold">Orbit</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-[13px] transition-colors",
                isActive
                  ? "bg-border/50 text-text font-medium"
                  : "text-muted hover:text-text hover:bg-border/30"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
