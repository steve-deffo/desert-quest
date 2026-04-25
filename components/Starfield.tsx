"use client";

import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

type Star = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

export default function Starfield({
  count = 60,
  topRange = 70,
  nightOnly = true,
  className,
}: {
  count?: number;
  topRange?: number;
  nightOnly?: boolean;
  className?: string;
}) {
  const theme = useGameStore((s) => s.theme);
  const isNight = theme === "night";

  // Generate once, on the client only — avoids SSR/CSR random mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * topRange,
        size: 1 + Math.random() * 2.2,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    [count, topRange]
  );

  if (!mounted) return null;
  if (nightOnly && !isNight) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            boxShadow: "0 0 6px rgba(255,255,255,0.85)",
            animation: `dq-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dq-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
