"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import landmarks from "@/data/landmarks.json";
import AnimatedCamel from "./AnimatedCamel";
import type { Lang, Landmark } from "@/lib/types";

const VIEWBOX_W = 800;
const VIEWBOX_H = 600;

// Positions are stored as percentages of the container (0–100) so
// HTML overlays (nodes, camel) and the SVG content stay aligned
// regardless of element size.
const NODE_POSITIONS: { level: number; x: number; y: number }[] = [
  { level: 0, x: 78, y: 78 }, // Dubai — bottom right
  { level: 1, x: 50, y: 86 }, // Abu Dhabi — center bottom
  { level: 2, x: 76, y: 54 }, // Al Ain — center right
  { level: 3, x: 30, y: 56 }, // Liwa — center left
  { level: 4, x: 50, y: 22 }, // Rub' al Khali — top center
];

function pctToSvg(p: { x: number; y: number }) {
  return { x: (p.x / 100) * VIEWBOX_W, y: (p.y / 100) * VIEWBOX_H };
}

function buildPathD() {
  const pts = NODE_POSITIONS.map(pctToSvg);
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

export default function DesertMap() {
  const router = useRouter();
  const { language } = useTranslation();
  const lang = language as Lang;
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const completedLevels = useGameStore((s) => s.completedLevels);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const setCamelState = useGameStore((s) => s.setCamelState);
  const camelState = useGameStore((s) => s.camelState);

  const fullPathD = useMemo(buildPathD, []);

  // Highest unlocked level controls how far the trail draws.
  const highestUnlocked = Math.max(0, ...unlockedLevels);
  const progress = highestUnlocked / (NODE_POSITIONS.length - 1);

  // Camel sits at the current level's node (clamped to unlocked range)
  const camelLevel = Math.min(currentLevel, highestUnlocked);
  const camelPos =
    NODE_POSITIONS.find((n) => n.level === camelLevel) ?? NODE_POSITIONS[0];

  // When the current level changes, briefly switch camel to "walking"
  const prevLevelRef = useRef(camelLevel);
  useEffect(() => {
    if (prevLevelRef.current !== camelLevel) {
      prevLevelRef.current = camelLevel;
      setCamelState("walking");
      const tid = window.setTimeout(() => setCamelState("idle"), 1400);
      return () => window.clearTimeout(tid);
    }
  }, [camelLevel, setCamelState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-4xl"
      style={{ aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}
    >
      {/* Map SVG (water + land + trails) */}
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="dq-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sky-top)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--sky-bottom)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="dq-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bg-secondary)" />
            <stop offset="100%" stopColor="var(--dune-color)" />
          </linearGradient>
          <radialGradient id="dq-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Water/gulf base */}
        <rect
          x="0"
          y="0"
          width={VIEWBOX_W}
          height={VIEWBOX_H}
          fill="url(#dq-water)"
        />
        {/* Decorative water ripples */}
        <g
          stroke="var(--sky-top)"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M40 70 q12 -6 24 0 t24 0" />
          <path d="M120 110 q12 -6 24 0 t24 0" />
          <path d="M620 50 q12 -6 24 0 t24 0" />
          <path d="M740 540 q12 -6 24 0 t24 0" />
        </g>

        {/* Land silhouette — stylized UAE-ish blob */}
        <path
          d="
            M 60 230
            C 90 150, 220 110, 360 150
            C 440 130, 560 150, 660 200
            C 730 230, 760 320, 740 420
            C 720 510, 600 560, 460 555
            C 320 560, 180 540, 110 470
            C 60 410, 40 320, 60 230 Z
          "
          fill="url(#dq-land)"
          stroke="var(--color-gold)"
          strokeWidth="3"
          strokeLinejoin="round"
          opacity="0.96"
          style={{ filter: "drop-shadow(0 6px 14px var(--shadow))" }}
        />

        {/* Inner decorative dunes */}
        <g opacity="0.45">
          <path
            d="M 130 380 q 60 -30 120 0 t 120 0"
            stroke="var(--dune-color)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 380 240 q 60 -22 120 0 t 120 0"
            stroke="var(--dune-color)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 200 470 q 60 -22 120 0 t 120 0"
            stroke="var(--dune-color)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Compass rose (top-left corner) */}
        <g
          transform="translate(72,82)"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          fill="none"
        >
          <circle cx="0" cy="0" r="22" opacity="0.55" />
          <path d="M 0 -22 L 4 -4 L 22 0 L 4 4 L 0 22 L -4 4 L -22 0 L -4 -4 Z" fill="var(--color-gold)" fillOpacity="0.25" />
          <text
            x="0"
            y="-26"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="var(--color-gold)"
            stroke="none"
          >
            N
          </text>
        </g>

        {/* Background dotted trail (full path, low opacity) */}
        <path
          d={fullPathD}
          fill="none"
          stroke="var(--color-gold)"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeDasharray="2 12"
          strokeLinecap="round"
        />

        {/* Foreground animated trail — solid up to highestUnlocked */}
        <motion.path
          d={fullPathD}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          style={{
            filter: "drop-shadow(0 0 6px var(--color-gold))",
          }}
        />

        {/* Soft glow at the current level node */}
        <circle
          cx={pctToSvg(camelPos).x}
          cy={pctToSvg(camelPos).y}
          r="60"
          fill="url(#dq-glow)"
        />
      </svg>

      {/* Node buttons (HTML overlay) */}
      {NODE_POSITIONS.map((node, i) => {
        const landmark = (landmarks as Landmark[]).find(
          (l) => l.level === node.level
        );
        const unlocked = unlockedLevels.includes(node.level);
        const completed = completedLevels.includes(node.level);
        const isCurrent = node.level === camelLevel;

        return (
          <NodeButton
            key={node.level}
            x={node.x}
            y={node.y}
            level={node.level}
            landmark={landmark}
            lang={lang}
            unlocked={unlocked}
            completed={completed}
            current={isCurrent}
            popDelay={0.3 + i * 0.12}
            onClick={() => unlocked && router.push(`/lesson/${node.level}`)}
          />
        );
      })}

      {/* Walking camel — animates between node positions */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 70,
          height: 70,
          marginLeft: -35,
          marginTop: -64, // sit slightly above the node
        }}
        initial={false}
        animate={{ left: `${camelPos.x}%`, top: `${camelPos.y}%` }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      >
        <AnimatedCamel
          size={70}
          state={camelState === "walking" ? "walking" : "idle"}
        />
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Node button                                                    */
/* ────────────────────────────────────────────────────────────── */

function NodeButton({
  x,
  y,
  level,
  landmark,
  lang,
  unlocked,
  completed,
  current,
  popDelay,
  onClick,
}: {
  x: number;
  y: number;
  level: number;
  landmark?: Landmark;
  lang: Lang;
  unlocked: boolean;
  completed: boolean;
  current: boolean;
  popDelay: number;
  onClick: () => void;
}) {
  const name = landmark?.[lang]?.name ?? `Level ${level}`;
  const emoji = landmark?.emoji ?? "📍";

  const ringColor = unlocked ? "var(--color-gold)" : "var(--text-secondary)";
  const tint = unlocked
    ? "var(--bg-card)"
    : "color-mix(in srgb, var(--bg-secondary) 60%, transparent)";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!unlocked}
      aria-label={`${name}${unlocked ? "" : " — locked"}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: unlocked ? 1 : 0.55 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 16,
        delay: popDelay,
      }}
      whileHover={unlocked ? { scale: 1.08 } : undefined}
      whileTap={unlocked ? { scale: 0.94 } : undefined}
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-none disabled:cursor-not-allowed"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="relative grid place-items-center">
        {/* Pulse ring for unlocked & not-yet-completed nodes */}
        {unlocked && !completed && (
          <motion.span
            aria-hidden
            className="absolute h-full w-full rounded-full"
            style={{ boxShadow: `0 0 0 3px ${ringColor}` }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <span
          className="grid place-items-center rounded-full text-2xl font-bold transition-shadow"
          style={{
            width: current ? 64 : 52,
            height: current ? 64 : 52,
            background: tint,
            border: `3px solid ${ringColor}`,
            color: "var(--text-primary)",
            boxShadow: current
              ? `0 0 24px var(--color-gold), 0 6px 16px var(--shadow)`
              : `0 4px 12px var(--shadow)`,
          }}
        >
          <span aria-hidden style={{ filter: unlocked ? "none" : "grayscale(0.8)" }}>
            {emoji}
          </span>
        </span>

        {!unlocked && (
          <span
            aria-hidden
            className="absolute -bottom-1 grid h-6 w-6 place-items-center rounded-full border bg-[var(--bg-card)] text-xs"
            style={{ borderColor: "var(--text-secondary)" }}
          >
            🔒
          </span>
        )}

        {completed && (
          <span
            aria-hidden
            className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full text-xs font-bold"
            style={{
              background: "var(--color-correct)",
              color: "white",
              boxShadow: "0 2px 6px var(--shadow)",
            }}
          >
            ✓
          </span>
        )}
      </span>

      <span
        className="whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-bold sm:text-sm"
        style={{
          background: "color-mix(in srgb, var(--bg-card) 85%, transparent)",
          color: "var(--text-primary)",
          fontFamily:
            lang === "ar"
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), sans-serif",
        }}
      >
        {name}
      </span>
    </motion.button>
  );
}
