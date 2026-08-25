"use client";

import { useState } from "react";

export function useApiAction(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(url: string, options: RequestInit = {}) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        ...options,
        headers: options.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${res.status})`);
        return null;
      }
      onSuccess?.();
      return await res.json().catch(() => ({}));
    } catch {
      setError("Network error. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { run, loading, error, setError };
}
