"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const inputClass =
  "w-full text-[13px] border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent placeholder:text-neutral";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        setError("Invalid credentials");
        return;
      }
      await refresh();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Invalid credentials");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        <div className="mb-6 text-center">
          <span className="text-[17px] font-semibold">Orbit</span>
          <p className="text-[13px] text-muted mt-1">Sign in to your workspace</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@orbittm.dev"
              autoFocus
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            type="submit"
            disabled={saving || !email.trim() || !password}
            className="mt-1 py-2 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
