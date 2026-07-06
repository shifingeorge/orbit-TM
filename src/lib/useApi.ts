"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Shared data-fetching hook for the app's JSON API routes, which all
 * respond with `{ data: T }` on success.
 */
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data ?? null);
      setError(false);
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    async function load() {
      await refetch();
    }
    load();
  }, [refetch]);

  return { data, loading, error, refetch };
}
