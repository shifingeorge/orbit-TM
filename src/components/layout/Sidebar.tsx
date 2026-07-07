"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { href: "/", label: "Tasks" },
  { href: "/decisions", label: "Decisions" },
  { href: "/team", label: "Team" },
];

const STORAGE_KEY = "sidebar-collapsed";

// Tiny external store over localStorage so the collapsed flag can be read
// with useSyncExternalStore (server snapshot = false, avoiding a hydration
// mismatch) while still updating synchronously on toggle.
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot() {
  return false;
}

function setCollapsedStore(value: boolean) {
  window.localStorage.setItem(STORAGE_KEY, String(value));
  listeners.forEach((listener) => listener());
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  // Mirror the collapsed flag onto <html data-collapsed> so the
  // server-rendered layout (which has no knowledge of localStorage) can
  // adjust main's margin via CSS.
  useEffect(() => {
    document.documentElement.setAttribute("data-collapsed", String(collapsed));
  }, [collapsed]);

  function toggleCollapsed() {
    setCollapsedStore(!collapsed);
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen border-r border-border bg-surface flex flex-col py-5 z-50 transition-[width] duration-150 ease-in-out overflow-hidden",
        collapsed ? "w-[56px] px-2" : "w-[200px] px-3"
      )}
    >
      <div className="px-1 mb-6 whitespace-nowrap">
        <span className="text-[15px] font-semibold">
          {collapsed ? "O" : "Orbit"}
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "py-1.5 rounded-md text-[13px] transition-colors whitespace-nowrap overflow-hidden",
                collapsed ? "px-1 text-center" : "px-3",
                isActive
                  ? "bg-border/50 text-text font-medium"
                  : "text-muted hover:text-text hover:bg-border/30"
              )}
            >
              {collapsed ? item.label.charAt(0) : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5">
        {user && (
          <>
            <div
              title={collapsed ? `${user.name} · ${user.role}` : undefined}
              className={cn(
                "flex items-center gap-2 py-1.5 whitespace-nowrap overflow-hidden",
                collapsed ? "px-1 justify-center" : "px-1"
              )}
            >
              <span className="inline-flex shrink-0 w-6 h-6 rounded-full bg-surface border border-border items-center justify-center text-[10px] text-muted">
                {initials(user.name)}
              </span>
              {!collapsed && (
                <span className="flex flex-col min-w-0">
                  <span className="text-[13px] truncate">{user.name}</span>
                  <span className="text-[11px] text-muted capitalize">{user.role}</span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={cn(
                "py-1.5 rounded-md text-[13px] text-muted hover:text-text hover:bg-border/30 transition-colors whitespace-nowrap overflow-hidden",
                collapsed ? "px-1 text-center" : "px-3 text-left"
              )}
            >
              {collapsed ? "↵" : "Logout"}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={toggleCollapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mt-2 flex items-center justify-center rounded-md px-1 py-1.5 text-muted hover:text-text hover:bg-border/30 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "transition-transform duration-150",
            collapsed && "rotate-180"
          )}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </aside>
  );
}
