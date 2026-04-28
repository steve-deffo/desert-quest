"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

/**
 * Returns true once Zustand's persist middleware has rehydrated
 * from localStorage on the client. Use this in place of an ad-hoc
 * `mounted` flag so persisted-state-driven UI never flashes
 * incorrect defaults.
 */
export function useHydration(): boolean {
  const hasHydrated = useGameStore((s) => s._hasHydrated);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (hasHydrated) setReady(true);
  }, [hasHydrated]);
  return ready;
}
