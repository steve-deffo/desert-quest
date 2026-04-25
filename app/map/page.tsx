"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import DesertMap from "@/components/DesertMap";
import Starfield from "@/components/Starfield";
import BackButton from "@/components/ui/BackButton";
import { toArabicNumerals } from "@/lib/utils";

const TOTAL_LEVELS = 5;
const STARS_PER_LEVEL = 3;

export default function MapPage() {
  const router = useRouter();
  const { t, isRTL, language } = useTranslation();
  const grade = useGameStore((s) => s.grade);
  const totalDirhams = useGameStore((s) => s.totalDirhams);
  const completedLevels = useGameStore((s) => s.completedLevels);
  const levelStars = useGameStore((s) => s.levelStars);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && grade === null) {
      router.replace("/");
    }
  }, [mounted, grade, router]);

  if (!mounted || grade === null) return null;

  const totalStars = Object.values(levelStars).reduce<number>(
    (sum, s) => sum + (s ?? 0),
    0
  );
  const maxStars = TOTAL_LEVELS * STARS_PER_LEVEL;
  const progressN = completedLevels.length;

  const fmt = (n: number) =>
    isRTL ? `${toArabicNumerals(n)}` : String(n);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Starfield count={60} topRange={70} />
      <BackButton href="/home" />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-4 pt-6 text-center text-3xl font-extrabold tracking-tight sm:text-4xl"
        style={{
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-reem-kufi), serif",
          color: "var(--color-gold)",
          textShadow: "0 2px 6px var(--shadow)",
        }}
      >
        {t("map.title")}
      </motion.h1>

      {/* Map */}
      <div className="flex-1 px-3 pt-4 pb-6 sm:px-6">
        <DesertMap />
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        className="sticky bottom-0 z-20 border-t backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--bg-card) 85%, transparent)",
          borderColor:
            "color-mix(in srgb, var(--color-gold) 40%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          {/* Dirhams */}
          <StatPill
            icon="⭐"
            label={t("dirhams")}
            value={
              <>
                <span>{fmt(totalDirhams)}</span>
                <span
                  className="ms-1 text-xs"
                  style={{
                    fontFamily: isRTL
                      ? "var(--font-amiri), serif"
                      : "inherit",
                  }}
                >
                  {isRTL ? "د.إ" : "AED"}
                </span>
              </>
            }
          />

          {/* Stars */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("stars")}
            </span>
            <div className="flex items-center gap-1">
              <StarsRow filled={totalStars} max={maxStars} />
              <span className="ms-2 font-bold tabular-nums">
                {fmt(totalStars)}
                <span style={{ color: "var(--text-secondary)" }}>
                  {" / "}
                  {fmt(maxStars)}
                </span>
              </span>
            </div>
          </div>

          {/* Progress */}
          <StatPill
            icon="🧭"
            label={t("map.yourProgress")}
            value={
              <span className="tabular-nums">
                {fmt(progressN)} / {fmt(TOTAL_LEVELS)}
              </span>
            }
          />
        </div>
      </motion.div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-xs uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold"
        style={{
          background:
            "color-mix(in srgb, var(--color-gold) 18%, transparent)",
          color: "var(--text-primary)",
          boxShadow: "inset 0 0 0 1px var(--color-gold)",
        }}
      >
        <span aria-hidden>{icon}</span>
        {value}
      </span>
    </div>
  );
}

function StarsRow({ filled, max }: { filled: number; max: number }) {
  // Render up to 15 small stars; on tight screens condense to a 5×3 grid.
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="text-base leading-none"
          style={{
            color:
              i < filled
                ? "var(--color-gold)"
                : "color-mix(in srgb, var(--text-secondary) 50%, transparent)",
          }}
        >
          {i < filled ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
