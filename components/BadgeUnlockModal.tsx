"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import badges from "@/data/badges.json";
import { useGameStore } from "@/store/useGameStore";
import { Sounds, playSound } from "@/lib/sounds";

export default function BadgeUnlockModal() {
  const language = useGameStore((s) => s.language);
  const pendingBadge = useGameStore((s) => s.pendingBadge);
  const clearPendingBadge = useGameStore((s) => s.clearPendingBadge);

  const badge = useMemo(
    () => badges.find((item) => item.id === pendingBadge),
    [pendingBadge]
  );

  useEffect(() => {
    if (!badge) return;

    playSound(Sounds.levelComplete);

    let active = true;
    void (async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (!active) return;
      const colors = ["#00732F", "#FFFFFF", "#111111", "#FF0000"];
      confetti({
        particleCount: 140,
        spread: 90,
        startVelocity: 42,
        ticks: 280,
        gravity: 0.9,
        origin: { x: 0.5, y: 0.65 },
        colors,
      });
    })();
    return () => {
      active = false;
    };
  }, [badge]);

  if (!badge) return null;

  const localized = language === "ar" ? badge.ar : badge.en;

  return (
    <AnimatePresence>
      <motion.div
        key={badge.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120]"
        style={{ background: "#000" }}
      />

      <motion.div
        key={`${badge.id}-card`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[121] grid place-items-center px-4"
      >
        <motion.div
          initial={{ rotateY: 360, scale: 0 }}
          animate={{ rotateY: 0, scale: [0, 1.2, 1] }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="w-full max-w-md rounded-3xl p-6 text-center"
          style={{
            background: "var(--bg-card)",
            border: "2px solid var(--color-gold)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-gold)" }}
          >
            New Badge! / شارة جديدة!
          </p>

          <p className="mt-4 text-8xl leading-none" aria-hidden>
            {badge.emoji}
          </p>

          <h2
            className="mt-4 text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            {localized.name}
          </h2>

          <p
            className="mt-2 text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            {localized.desc}
          </p>

          <button
            type="button"
            onClick={clearPendingBadge}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
              boxShadow: "0 8px 20px var(--shadow)",
            }}
          >
            Awesome! / رائع!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
