"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.data ?? null);
      } else {
        setUser(null);
        // A present-but-invalid cookie slips past the proxy; bounce to login.
        if (res.status === 401 && pathname !== "/login") {
          router.replace("/login");
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    async function load() {
      await refresh();
    }
    load();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
