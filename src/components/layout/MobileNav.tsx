"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { href: "/", label: "Tasks", icon: TasksIcon },
  { href: "/decisions", label: "Decisions", icon: DecisionsIcon },
  { href: "/team", label: "Team", icon: TeamIcon },
];

// Mobile-only chrome (<md): a fixed top bar with the app name + logout and a
// fixed bottom nav replacing the desktop Sidebar (which is hidden on <md).
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-4 border-b border-border bg-surface">
        <span className="text-[15px] font-semibold">Orbit</span>
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="text-[13px] text-muted hover:text-text transition-colors cursor-pointer"
          >
            Logout
          </button>
        )}
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex border-t border-border bg-surface">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                isActive ? "text-text font-medium" : "text-muted hover:text-text"
              )}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function iconProps() {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function TasksIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function DecisionsIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 3v18" />
      <path d="M6 8l-3 5h6l-3-5zM18 8l-3 5h6l-3-5z" />
      <path d="M5 21h14" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
