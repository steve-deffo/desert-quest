"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import ChangeGradeModal from "@/components/ChangeGradeModal";
import landmarks from "@/data/landmarks.json";

type Lang = "en" | "ar";
type Landmark = (typeof landmarks)[number];

const TOTAL_LEVELS = 5;
const STARS_PER_LEVEL = 3;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Scoreboard() {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const lang = language as Lang;

  const grade = useGameStore((s) => s.grade);
  const theme = useGameStore((s) => s.theme);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const levelStars = useGameStore((s) => s.levelStars);
  const levelDirhams = useGameStore((s) => s.levelDirhams);
  const totalDirhams = useGameStore((s) => s.totalDirhams);
  const resetSession = useGameStore((s) => s.resetSession);
  const [switchOpen, setSwitchOpen] = useState(false);

  const isNight = theme === "night";

  const totalStars = useMemo(
    () =>
      Object.values(levelStars).reduce<number>(
        (sum, n) => sum + (n ?? 0),
        0
      ),
    [levelStars]
  );

  const fmt = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const handleReplay = (level: number) => {
    playSound(Sounds.buttonClick);
    resetSession();
    router.push(`/lesson/${level}`);
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col px-4 pt-6 pb-32"
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Souk sign header ──────────────────────────────────── */}
      <SoukSignHeader title={t("scoreboard.title")} isRTL={isRTL} />

      {/* ── Landmark grid ────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        }}
        className="mx-auto mt-6 grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3"
      >
        {Array.from({ length: TOTAL_LEVELS }).map((_, level) => {
          const landmark = landmarks.find((l) => l.level === level);
          const unlocked = unlockedLevels.includes(level);
          const earnedStars = levelStars[level] ?? 0;
          const earnedDirhams = levelDirhams[level] ?? 0;
          return (
            <LandmarkCard
              key={level}
              level={level}
              landmark={landmark}
              lang={lang}
              isRTL={isRTL}
              isNight={isNight}
              unlocked={unlocked}
              stars={earnedStars}
              dirhams={earnedDirhams}
              replayLabel={t("scoreboard.replay")}
              lockedLabel={t("map.locked")}
              onReplay={() => handleReplay(level)}
            />
          );
        })}
      </motion.div>

      {/* ── Back to Map + Switch Grade ────────────────────────── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <BackToMapButton label={t("scoreboard.backToMap")} isRTL={isRTL} />
        <button
          type="button"
          onClick={() => {
            playSound(Sounds.buttonClick);
            setSwitchOpen(true);
          }}
          className="inline-flex h-11 items-center px-3 text-xs font-bold uppercase tracking-widest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("scoreboard.switchGrade")}
        </button>

        <Link
          href="/report"
          onClick={() => playSound(Sounds.buttonClick)}
          className="inline-flex h-11 items-center px-3 text-xs font-bold uppercase tracking-widest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          style={{ color: "var(--text-secondary)" }}
        >
          Parent View / عرض ولي الأمر
        </Link>
      </div>

      <ChangeGradeModal
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
      />

      {/* ── Total stats sticky bar ───────────────────────────── */}
      <TotalsBar
        totalDirhams={totalDirhams}
        totalStars={totalStars}
        grade={grade ?? 4}
        fmt={fmt}
        labels={{
          stars: t("stars"),
          totalEarned: t("scoreboard.totalEarned"),
        }}
        isRTL={isRTL}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Souk Sign Header                                               */
/* ────────────────────────────────────────────────────────────── */

function SoukSignHeader({
  title,
  isRTL,
}: {
  title: string;
  isRTL: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl"
      style={{
        background: [
          // Subtle highlight
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%)",
          // Wood-grain stripes
          "repeating-linear-gradient(90deg, #2A1F12 0px, #3A2C1A 2px, #2A1F12 4px, #2A1F12 14px)",
          // Base wood gradient
          "linear-gradient(135deg, #4A3520 0%, #2A1F12 100%)",
        ].join(", "),
        boxShadow:
          "0 14px 32px rgba(0,0,0,0.45), inset 0 0 0 2px var(--color-gold), inset 0 0 0 5px rgba(0,0,0,0.5)",
        padding: "8px",
      }}
    >
      <GeometricBorder />
      <div className="px-6 py-5 text-center">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.4em]"
          style={{ color: "color-mix(in srgb, var(--color-gold) 75%, transparent)" }}
        >
          ◆◆◆
        </p>
        <h1
          className="mt-2 text-3xl font-extrabold sm:text-5xl"
          style={{
            color: "var(--color-gold)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
            textShadow:
              "0 2px 0 #1A1208, 0 4px 14px rgba(201,168,76,0.55)",
          }}
        >
          {title}
        </h1>
        <p
          className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em]"
          style={{ color: "color-mix(in srgb, var(--color-gold) 75%, transparent)" }}
        >
          ◆◆◆
        </p>
      </div>
      <GeometricBorder />
    </motion.div>
  );
}

function GeometricBorder() {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className="block h-3 w-full"
      aria-hidden
    >
      <defs>
        <pattern
          id="souk-pattern"
          x="0"
          y="0"
          width="20"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <g
            transform="translate(10, 6)"
            stroke="var(--color-gold)"
            strokeWidth="0.7"
            fill="none"
          >
            <rect x="-3.5" y="-3.5" width="7" height="7" />
            <rect
              x="-3.5"
              y="-3.5"
              width="7"
              height="7"
              transform="rotate(45)"
            />
          </g>
          <line
            x1="0"
            y1="6"
            x2="20"
            y2="6"
            stroke="var(--color-gold)"
            strokeWidth="0.4"
            strokeOpacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#souk-pattern)" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Landmark Card                                                  */
/* ────────────────────────────────────────────────────────────── */

function LandmarkCard({
  level,
  landmark,
  lang,
  isRTL,
  isNight,
  unlocked,
  stars,
  dirhams,
  replayLabel,
  lockedLabel,
  onReplay,
}: {
  level: number;
  landmark?: Landmark;
  lang: Lang;
  isRTL: boolean;
  isNight: boolean;
  unlocked: boolean;
  stars: number;
  dirhams: number;
  replayLabel: string;
  lockedLabel: string;
  onReplay: () => void;
}) {
  const fmt = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));
  const name = landmark?.[lang]?.name ?? `Level ${level}`;
  const emoji = landmark?.emoji ?? "📍";

  const cardShadow = isNight
    ? "0 6px 18px rgba(0,0,0,0.55), inset 0 0 16px color-mix(in srgb, var(--color-gold) 35%, transparent)"
    : "0 8px 22px color-mix(in srgb, var(--dune-color) 55%, transparent)";

  return (
    <motion.div
      variants={cardVariants}
      className="relative flex flex-col items-center gap-3 rounded-2xl p-5 text-center"
      style={{
        background: "var(--bg-card)",
        border: `2px solid ${unlocked ? "var(--color-gold)" : "color-mix(in srgb, var(--text-secondary) 35%, transparent)"}`,
        boxShadow: cardShadow,
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      {/* Level number ribbon */}
      <span
        className="absolute -top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{
          [isRTL ? "right" : "left"]: 12,
          background: unlocked ? "var(--color-gold)" : "var(--text-secondary)",
          color: "#1A1208",
          boxShadow: "0 2px 6px var(--shadow)",
        }}
      >
        {fmt(level + 1)}
      </span>

      <span
        aria-hidden
        className="text-5xl leading-none"
        style={{
          filter: unlocked
            ? "drop-shadow(0 4px 10px var(--shadow))"
            : "grayscale(0.85)",
        }}
      >
        {unlocked ? emoji : "❓"}
      </span>

      <h3
        className="text-base font-extrabold leading-tight"
        style={{
          color: unlocked
            ? "var(--text-primary)"
            : "var(--text-secondary)",
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-reem-kufi), serif",
        }}
      >
        {unlocked ? name : lockedLabel}
      </h3>

      {unlocked ? (
        <>
          {/* Stars */}
          <div className="flex items-center gap-1" aria-label={`${stars}/${STARS_PER_LEVEL}`}>
            {Array.from({ length: STARS_PER_LEVEL }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="text-lg leading-none"
                style={{
                  color:
                    i < stars
                      ? "var(--color-gold)"
                      : "color-mix(in srgb, var(--text-secondary) 50%, transparent)",
                  textShadow:
                    i < stars ? "0 0 6px var(--color-gold)" : undefined,
                }}
              >
                {i < stars ? "★" : "☆"}
              </span>
            ))}
          </div>

          {/* Dirhams pill */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background:
                "color-mix(in srgb, var(--color-gold) 18%, transparent)",
              color: "var(--text-primary)",
              boxShadow: "inset 0 0 0 1px var(--color-gold)",
            }}
          >
            <span aria-hidden>⭐</span>
            <span className="tabular-nums">{fmt(dirhams)}</span>
            <span
              className="opacity-80"
              style={{
                fontFamily: isRTL ? "var(--font-amiri), serif" : "inherit",
              }}
            >
              {isRTL ? "د.إ" : "AED"}
            </span>
          </span>

          {/* Replay button (ghost) */}
          <motion.button
            type="button"
            onClick={onReplay}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 18px var(--color-gold)",
            }}
            whileTap={{ scale: 0.96 }}
            className="mt-1 inline-flex h-11 items-center gap-1 rounded-full px-5 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            style={{
              background: "transparent",
              color: "var(--color-gold)",
              border: "2px solid var(--color-gold)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-reem-kufi), sans-serif",
            }}
          >
            <span aria-hidden>↻</span>
            {replayLabel}
          </motion.button>
        </>
      ) : (
        <>
          <span
            className="grid h-10 w-10 place-items-center rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--text-secondary) 25%, transparent)",
              color: "var(--text-secondary)",
            }}
            aria-hidden
          >
            🔒
          </span>
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            {lockedLabel}
          </span>
        </>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Back to Map                                                    */
/* ────────────────────────────────────────────────────────────── */

function BackToMapButton({
  label,
  isRTL,
}: {
  label: string;
  isRTL: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Link
        href="/map"
        onClick={() => playSound(Sounds.buttonClick)}
        className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-base font-extrabold transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        style={{
          background: "transparent",
          color: "var(--color-gold)",
          border: "2px solid var(--color-gold)",
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-reem-kufi), serif",
          boxShadow: "inset 0 0 0 0 var(--color-gold)",
        }}
      >
        <span aria-hidden>{isRTL ? "→" : "←"}</span>
        {label}
      </Link>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Totals bar (sticky bottom)                                     */
/* ────────────────────────────────────────────────────────────── */

function TotalsBar({
  totalDirhams,
  totalStars,
  grade,
  fmt,
  labels,
  isRTL,
}: {
  totalDirhams: number;
  totalStars: number;
  grade: 4 | 8;
  fmt: (n: number) => string;
  labels: { stars: string; totalEarned: string };
  isRTL: boolean;
}) {
  const dirhamMV = useMotionValue(0);
  const dirhamSpring = useSpring(dirhamMV, {
    stiffness: 70,
    damping: 18,
    mass: 0.7,
  });
  const dirhamRounded = useTransform(dirhamSpring, (v) =>
    Math.max(0, Math.round(v))
  );
  const dirhamText = useTransform(dirhamRounded, (n) => fmt(n));

  useEffect(() => {
    const timeout = window.setTimeout(() => dirhamMV.set(totalDirhams), 400);
    return () => window.clearTimeout(timeout);
  }, [totalDirhams, dirhamMV]);

  const maxStars = TOTAL_LEVELS * STARS_PER_LEVEL;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      className="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur-md"
      style={{
        background:
          "color-mix(in srgb, var(--bg-card) 85%, transparent)",
        borderColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Stat icon="⭐" label={labels.totalEarned}>
          <motion.span className="font-extrabold tabular-nums">
            {dirhamText}
          </motion.span>
          <span
            className="ms-1 text-xs opacity-80"
            style={{
              fontFamily: isRTL ? "var(--font-amiri), serif" : "inherit",
            }}
          >
            {isRTL ? "د.إ" : "AED"}
          </span>
        </Stat>

        <Stat icon="🌟" label={labels.stars}>
          <span className="font-extrabold tabular-nums">
            {fmt(totalStars)}
            <span style={{ color: "var(--text-secondary)" }}>
              {" / "}
              {fmt(maxStars)}
            </span>
          </span>
        </Stat>

        <span
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{
            background:
              "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
            color: "#1A1208",
            boxShadow: "0 2px 8px var(--shadow)",
          }}
        >
          G{grade}
        </span>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
        style={{
          background: "color-mix(in srgb, var(--color-gold) 18%, transparent)",
          color: "var(--text-primary)",
          boxShadow: "inset 0 0 0 1px var(--color-gold)",
        }}
      >
        <span aria-hidden>{icon}</span>
        {children}
      </span>
    </div>
  );
}
