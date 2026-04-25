"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
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
import AnimatedCamel from "./AnimatedCamel";
import landmarks from "@/data/landmarks.json";
import type { Lang, Landmark } from "@/lib/types";

const UAE_FLAG_COLORS = [
  "#00732F",
  "#FF0000",
  "#FFFFFF",
  "#000000",
  "#C9A84C",
];

export default function RewardScreen({
  level,
  grade,
}: {
  level: number;
  grade: 4 | 8;
}) {
  const router = useRouter();
  const { t, isRTL, language } = useTranslation();
  const lang = language as Lang;

  const levelStars = useGameStore((s) => s.levelStars);
  const levelDirhams = useGameStore((s) => s.levelDirhams);
  const stars = levelStars[level] ?? 0;
  const dirhamsEarned = levelDirhams[level] ?? 0;

  const landmark = useMemo<Landmark | undefined>(
    () => (landmarks as Landmark[]).find((l) => l.level === level),
    [level]
  );

  // ── Confetti + level-complete sound on mount ────────────────
  useEffect(() => {
    let active = true;
    playSound(Sounds.levelComplete);
    import("canvas-confetti").then(({ default: confetti }) => {
      if (!active) return;
      const opts = {
        particleCount: 120,
        spread: 80,
        colors: UAE_FLAG_COLORS,
        ticks: 200,
      } as const;
      confetti({ ...opts, origin: { x: 0.2, y: 0.5 } });
      confetti({ ...opts, origin: { x: 0.8, y: 0.5 } });
    });
    return () => {
      active = false;
    };
  }, []);

  // ── Dirham counter (springs from 0 → earned) ─────────────────
  const dirhamMV = useMotionValue(0);
  const dirhamSpring = useSpring(dirhamMV, {
    stiffness: 60,
    damping: 16,
    mass: 0.8,
  });
  const dirhamRounded = useTransform(dirhamSpring, (v) =>
    Math.max(0, Math.round(v))
  );
  const dirhamText = useTransform(dirhamRounded, (n) =>
    isRTL ? toArabicNumerals(n) : String(n)
  );
  const [counterReached, setCounterReached] = useState(dirhamsEarned === 0);

  useEffect(() => {
    setCounterReached(dirhamsEarned === 0);
    const timeout = window.setTimeout(() => {
      dirhamMV.set(dirhamsEarned);
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [dirhamsEarned, dirhamMV]);

  useEffect(() => {
    if (counterReached) return;
    const unsubscribe = dirhamSpring.on("change", (v) => {
      if (Math.abs(v - dirhamsEarned) < 0.4) {
        setCounterReached(true);
        if (dirhamsEarned > 0) playSound(Sounds.dirhamsEarned);
      }
    });
    return unsubscribe;
  }, [dirhamsEarned, dirhamSpring, counterReached]);

  if (!landmark) {
    return null;
  }

  const handleNext = () => {
    playSound(Sounds.buttonClick);
    router.push("/map");
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden px-4 pb-32 pt-8"
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Aurora glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--color-gold) 30%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* Top banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center"
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("reward.complete")}
        </p>
        <p
          className="mt-1 text-sm font-bold"
          style={{ color: "var(--color-gold)" }}
        >
          {t("reward.unlocked")}
        </p>
      </motion.div>

      {/* Landmark reveal */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        className="relative z-10 mt-4 flex flex-col items-center gap-2 text-center"
      >
        <motion.span
          aria-hidden
          className="text-[80px] leading-none"
          initial={{ scale: 0.4, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 14,
            delay: 0.55,
          }}
          style={{
            filter:
              "drop-shadow(0 6px 16px color-mix(in srgb, var(--color-gold) 60%, transparent))",
          }}
        >
          {landmark.emoji}
        </motion.span>
        <h1
          className="text-3xl font-extrabold sm:text-4xl"
          style={{
            color: "var(--color-gold)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
            textShadow: "0 2px 6px var(--shadow)",
          }}
        >
          {landmark[lang].name}
        </h1>
        <p
          className="mx-auto max-w-xl px-2 text-sm leading-relaxed sm:text-base"
          style={{
            color: "var(--text-secondary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {grade === 4 ? landmark[lang].fact4 : landmark[lang].fact8}
        </p>
      </motion.section>

      {/* Dirham counter */}
      <motion.section
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.85 }}
        className="relative z-10 mt-6 flex flex-col items-center"
      >
        <motion.div
          animate={
            counterReached
              ? { scale: [1, 1.18, 0.96, 1.06, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-baseline gap-2 rounded-2xl px-6 py-3"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 25%, transparent), color-mix(in srgb, var(--color-gold-light) 25%, transparent))",
            boxShadow:
              "inset 0 0 0 2px var(--color-gold), 0 8px 24px var(--shadow)",
          }}
        >
          <span aria-hidden className="text-2xl">⭐</span>
          <motion.span
            className="text-5xl font-extrabold tabular-nums sm:text-6xl"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-reem-kufi), sans-serif",
            }}
          >
            {dirhamText}
          </motion.span>
          <span
            className="text-xl font-bold"
            style={{
              color: "var(--color-gold)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "inherit",
            }}
          >
            {isRTL ? "د.إ" : "AED"}
          </span>
        </motion.div>
        <p
          className="mt-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("reward.earned")}
        </p>
      </motion.section>

      {/* Stars */}
      <div className="relative z-10 mt-6">
        <StarRow stars={stars} grade={grade} baseDelay={1.0} />
      </div>

      {/* Badge */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.0 }}
        className="relative z-10 mt-8 flex flex-col items-center"
      >
        <p
          className="mb-2 text-xs font-bold uppercase tracking-[0.25em]"
          style={{ color: "var(--color-gold)" }}
        >
          ✨ {t("reward.newBadge")}
        </p>
        <Badge
          grade={grade}
          name={landmark[lang].name}
          emoji={landmark.emoji}
          isRTL={isRTL}
        />
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 1.5 }}
        className="relative z-10 mt-8"
      >
        <SandSweepButton
          onClick={handleNext}
          label={t("reward.next")}
          isRTL={isRTL}
        />
      </motion.div>

      {/* Happy camel in corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 z-10 select-none"
        style={isRTL ? { right: 12 } : { left: 12 }}
      >
        <AnimatedCamel size={92} state="happy" grade={grade} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Stars row                                                      */
/* ────────────────────────────────────────────────────────────── */

function StarRow({
  stars,
  grade,
  baseDelay,
}: {
  stars: number;
  grade: 4 | 8;
  baseDelay: number;
}) {
  return (
    <div className="flex items-center gap-3">
      {[0, 1, 2].map((i) => (
        <StarSlot
          key={i}
          filled={i < stars}
          grade={grade}
          delay={baseDelay + i * 0.3}
        />
      ))}
    </div>
  );
}

const filledVariants: Variants = {
  hidden: { scale: 0, rotate: -45, opacity: 0 },
  show: {
    scale: [0, 1.4, 0.9, 1.05, 1],
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.4, 0.65, 0.85, 1] },
  },
};

function StarSlot({
  filled,
  grade,
  delay,
}: {
  filled: boolean;
  grade: 4 | 8;
  delay: number;
}) {
  if (!filled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
      >
        {grade === 4 ? <EmptyStar /> : <EmptyHexBadge />}
      </motion.div>
    );
  }
  return (
    <motion.div
      variants={filledVariants}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
    >
      {grade === 4 ? <FilledStar /> : <FilledHexBadge />}
    </motion.div>
  );
}

function FilledStar() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="dq-star-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="100%" stopColor="#E8A93B" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L19.5 12 L29 12.6 L21.5 18.8 L24 28 L16 22.5 L8 28 L10.5 18.8 L3 12.6 L12.5 12 Z"
        fill="url(#dq-star-fill)"
        stroke="#A07F47"
        strokeWidth="1"
        strokeLinejoin="round"
        style={{
          filter:
            "drop-shadow(0 0 8px color-mix(in srgb, var(--color-gold) 70%, transparent))",
        }}
      />
    </svg>
  );
}

function EmptyStar() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden>
      <path
        d="M16 3 L19.5 12 L29 12.6 L21.5 18.8 L24 28 L16 22.5 L8 28 L10.5 18.8 L3 12.6 L12.5 12 Z"
        fill="none"
        stroke="color-mix(in srgb, var(--text-secondary) 60%, transparent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilledHexBadge() {
  // Geometric Islamic-style 8-point star inside a hex
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="dq-hex-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1A1208" />
          <stop offset="100%" stopColor="#2C220C" />
        </linearGradient>
      </defs>
      <path
        d="M16 1 L29 8.5 L29 23.5 L16 31 L3 23.5 L3 8.5 Z"
        fill="url(#dq-hex-fill)"
        stroke="var(--color-gold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <g stroke="var(--color-gold)" strokeWidth="1" fill="none">
        <rect x="9" y="9" width="14" height="14" />
        <rect
          x="9"
          y="9"
          width="14"
          height="14"
          transform="rotate(45 16 16)"
        />
      </g>
      <circle cx="16" cy="16" r="2.4" fill="var(--color-gold)" />
    </svg>
  );
}

function EmptyHexBadge() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden>
      <path
        d="M16 1 L29 8.5 L29 23.5 L16 31 L3 23.5 L3 8.5 Z"
        fill="none"
        stroke="color-mix(in srgb, var(--text-secondary) 60%, transparent)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Badge — flips in 3D                                            */
/* ────────────────────────────────────────────────────────────── */

function Badge({
  grade,
  name,
  emoji,
  isRTL,
}: {
  grade: 4 | 8;
  name: string;
  emoji: string;
  isRTL: boolean;
}) {
  const isGr8 = grade === 8;

  return (
    <div
      style={{ perspective: 800 }}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 1.1 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {isGr8 ? (
          <Grade8Badge name={name} emoji={emoji} isRTL={isRTL} />
        ) : (
          <Grade4Badge name={name} emoji={emoji} isRTL={isRTL} />
        )}
      </motion.div>
    </div>
  );
}

function Grade4Badge({
  name,
  emoji,
  isRTL,
}: {
  name: string;
  emoji: string;
  isRTL: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center gap-1 rounded-3xl px-6 py-4 text-center"
      style={{
        background:
          "linear-gradient(135deg, #FFE08A 0%, #FFB870 60%, #FF8A65 100%)",
        boxShadow:
          "0 12px 32px rgba(232,169,59,0.45), inset 0 0 0 3px var(--color-gold)",
        color: "#3A2A0E",
        minWidth: 220,
      }}
    >
      <span
        aria-hidden
        className="absolute -top-3 grid h-7 w-7 place-items-center rounded-full text-xs font-bold"
        style={{
          background: "var(--color-uae-red)",
          color: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }}
      >
        ★
      </span>
      <span aria-hidden className="text-3xl">
        {emoji}
      </span>
      <span
        className="text-base font-extrabold leading-tight"
        style={{
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-reem-kufi), serif",
        }}
      >
        {name}
      </span>
      {/* Confetti dots */}
      <span aria-hidden className="absolute -bottom-1 left-2 text-base">🎉</span>
      <span aria-hidden className="absolute -bottom-1 right-2 text-base">✨</span>
    </div>
  );
}

function Grade8Badge({
  name,
  emoji,
  isRTL,
}: {
  name: string;
  emoji: string;
  isRTL: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center gap-2 rounded-3xl px-7 py-5 text-center"
      style={{
        background:
          "linear-gradient(135deg, #0D1B2A 0%, #1B2A3B 60%, #0D1B2A 100%)",
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.45), inset 0 0 0 2px var(--color-gold)",
        color: "var(--color-gold-light)",
        minWidth: 240,
      }}
    >
      {/* Geometric pattern background */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full opacity-30"
        preserveAspectRatio="none"
      >
        <g stroke="var(--color-gold)" strokeWidth="0.6" fill="none">
          <rect x="20" y="20" width="60" height="60" />
          <rect
            x="20"
            y="20"
            width="60"
            height="60"
            transform="rotate(45 50 50)"
          />
          <circle cx="50" cy="50" r="22" />
          <circle cx="50" cy="50" r="32" />
        </g>
      </svg>
      <span
        aria-hidden
        className="relative text-3xl"
        style={{
          filter: "drop-shadow(0 0 6px var(--color-gold))",
        }}
      >
        {emoji}
      </span>
      <span
        className="relative text-base font-extrabold tracking-wide"
        style={{
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-reem-kufi), serif",
          color: "var(--color-gold-light)",
        }}
      >
        {name}
      </span>
      <span
        className="relative text-[10px] uppercase tracking-[0.3em]"
        style={{ color: "var(--color-gold)" }}
      >
        Explorer
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  CTA button with sand sweep on hover                            */
/* ────────────────────────────────────────────────────────────── */

function SandSweepButton({
  label,
  isRTL,
  onClick,
}: {
  label: string;
  isRTL: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      initial="rest"
      animate="rest"
      className="relative overflow-hidden rounded-full px-8 py-4 text-lg font-extrabold shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
        color: "#1A1208",
        fontFamily: isRTL
          ? "var(--font-amiri), serif"
          : "var(--font-reem-kufi), serif",
        boxShadow: "0 8px 24px var(--shadow)",
      }}
    >
      <motion.span
        aria-hidden
        variants={{
          rest: { x: "-110%" },
          hover: { x: "110%" },
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
        }}
      />
      <span className="relative">{label}</span>
    </motion.button>
  );
}
