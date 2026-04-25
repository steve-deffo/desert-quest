"use client";

import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { useGameStore } from "@/store/useGameStore";

export type CamelVariant = "noura" | "zayed";
export type CamelStateName = "idle" | "happy" | "sad" | "walking";

/* ────────────────────────────────────────────────────────────── */
/*  Geometry — viewBox 0 0 120 120                                 */
/*  Side profile facing right; head on the right.                  */
/* ────────────────────────────────────────────────────────────── */

type Geom = {
  bodyColor: string;
  bodyDark: string;
  legColor: string;
  body: { cx: number; cy: number; rx: number; ry: number };
  hump: string;
  leg: { topY: number; bottomY: number; width: number };
  legX: { fNear: number; fFar: number; bNear: number; bFar: number };
  neckPivot: { x: number; y: number };
  neckPath: string;
  head: { cx: number; cy: number; rx: number; ry: number };
  snout: { cx: number; cy: number; rx: number; ry: number };
  earOrigin: { x: number; y: number };
  earPath: string;
  eye: { cx: number; cy: number; r: number };
  nostril: { cx: number; cy: number; r: number };
  mouthPath: string;
  eyebrowOrigin: { x: number; y: number };
  tailOrigin: { x: number; y: number };
  tailPath: string;
};

const GEOMETRY: Record<CamelVariant, Geom> = {
  noura: {
    bodyColor: "#E8C97A",
    bodyDark: "#C4A05A",
    legColor: "#9C7E45",
    body: { cx: 60, cy: 76, rx: 26, ry: 13 },
    hump: "M 38 73 Q 60 48 82 73 Z",
    leg: { topY: 86, bottomY: 105, width: 5 },
    legX: { fNear: 53, fFar: 49, bNear: 74, bFar: 78 },
    neckPivot: { x: 78, y: 70 },
    neckPath: "M 78 70 Q 90 56 96 44",
    head: { cx: 100, cy: 42, rx: 9, ry: 7 },
    snout: { cx: 107, cy: 46, rx: 5, ry: 4 },
    earOrigin: { x: 96, y: 36 },
    earPath: "M 96 36 L 92 28 L 100 31 Z",
    eye: { cx: 102, cy: 40, r: 1.6 },
    nostril: { cx: 109, cy: 45, r: 0.7 },
    mouthPath: "M 105 47 Q 108 49 111 46",
    eyebrowOrigin: { x: 102, y: 36 },
    tailOrigin: { x: 33, y: 70 },
    tailPath: "M 33 70 Q 26 74 24 84",
  },
  zayed: {
    bodyColor: "#D9B26A",
    bodyDark: "#A07F47",
    legColor: "#7E6537",
    body: { cx: 60, cy: 70, rx: 28, ry: 11 },
    hump: "M 36 67 Q 60 38 84 67 Z",
    leg: { topY: 80, bottomY: 110, width: 4.5 },
    legX: { fNear: 53, fFar: 49, bNear: 73, bFar: 77 },
    neckPivot: { x: 78, y: 64 },
    neckPath: "M 78 64 Q 90 42 96 24",
    head: { cx: 100, cy: 22, rx: 9, ry: 7 },
    snout: { cx: 107, cy: 26, rx: 5, ry: 4 },
    earOrigin: { x: 96, y: 16 },
    earPath: "M 96 16 L 92 8 L 100 11 Z",
    eye: { cx: 102, cy: 20, r: 1.6 },
    nostril: { cx: 109, cy: 25, r: 0.7 },
    mouthPath: "M 105 27 Q 108 29 111 26",
    eyebrowOrigin: { x: 102, y: 16 },
    tailOrigin: { x: 32, y: 64 },
    tailPath: "M 32 64 Q 24 68 22 80",
  },
};

/* ────────────────────────────────────────────────────────────── */
/*  Animations per part per state                                  */
/* ────────────────────────────────────────────────────────────── */

type StateAnim = { animate: TargetAndTransition; transition: Transition };
type PartName =
  | "body"
  | "head"
  | "ear"
  | "tail"
  | "fNear"
  | "fFar"
  | "bNear"
  | "bFar"
  | "eye"
  | "eyebrow";

const ANIM: Record<PartName, Record<CamelStateName, StateAnim>> = {
  body: {
    idle: {
      animate: { y: [-4, 0, -4] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    walking: {
      animate: { y: [-2, 0, -2] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { y: [0, -40, -8, -2, 0] },
      transition: {
        duration: 1.0,
        ease: "easeOut",
        times: [0, 0.2, 0.55, 0.8, 1],
      },
    },
    sad: {
      animate: { y: 10 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  head: {
    idle: {
      animate: { rotate: [-1.5, 1.5, -1.5] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    walking: {
      animate: { rotate: [-3, 3, -3] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, -10, 0] },
      transition: { duration: 0.4, ease: "easeOut" },
    },
    sad: {
      animate: { rotate: -15 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  ear: {
    idle: {
      animate: { rotate: [-3, 3, -3] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    walking: {
      animate: { rotate: [-6, 6, -6] },
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, -25, 25, -15, 15, 0] },
      transition: { duration: 0.6, ease: "easeOut" },
    },
    sad: {
      animate: { rotate: 30 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  tail: {
    idle: {
      animate: { rotate: [-6, 6, -6] },
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
    walking: {
      animate: { rotate: [-15, 15, -15] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, -20, 20, -10, 0] },
      transition: { duration: 0.6, ease: "easeOut" },
    },
    sad: {
      animate: { rotate: -8 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  fNear: {
    idle: {
      animate: { rotate: 0 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    walking: {
      animate: { rotate: [-20, 20, -20] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, -8, 0] },
      transition: { duration: 0.4 },
    },
    sad: {
      animate: { rotate: 4 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  fFar: {
    idle: {
      animate: { rotate: 0 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    walking: {
      animate: { rotate: [20, -20, 20] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, 6, 0] },
      transition: { duration: 0.4 },
    },
    sad: {
      animate: { rotate: 4 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  bNear: {
    idle: {
      animate: { rotate: 0 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    walking: {
      animate: { rotate: [20, -20, 20] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, 6, 0] },
      transition: { duration: 0.4 },
    },
    sad: {
      animate: { rotate: -4 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  bFar: {
    idle: {
      animate: { rotate: 0 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    walking: {
      animate: { rotate: [-20, 20, -20] },
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      animate: { rotate: [0, -6, 0] },
      transition: { duration: 0.4 },
    },
    sad: {
      animate: { rotate: -4 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  eye: {
    idle: {
      animate: { scaleY: 1 },
      transition: { duration: 0.3 },
    },
    walking: {
      animate: { scaleY: 1 },
      transition: { duration: 0.3 },
    },
    happy: {
      animate: { scaleY: [1, 0.18, 1] },
      transition: { duration: 0.5, ease: "easeOut" },
    },
    sad: {
      animate: { scaleY: 0.55 },
      transition: { duration: 0.4 },
    },
  },
  eyebrow: {
    idle: {
      animate: { y: 0, rotate: 0, opacity: 0.55 },
      transition: { duration: 0.3 },
    },
    walking: {
      animate: { y: 0, rotate: 0, opacity: 0.55 },
      transition: { duration: 0.3 },
    },
    happy: {
      animate: { y: -2, rotate: -10, opacity: 1 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
    sad: {
      animate: { y: 1, rotate: 18, opacity: 1 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
};

/* ────────────────────────────────────────────────────────────── */
/*  AnimatedCamel — articulated, state-driven                      */
/* ────────────────────────────────────────────────────────────── */

export default function AnimatedCamel({
  size = 80,
  state,
  grade,
  variant,
}: {
  size?: number;
  state?: CamelStateName;
  grade?: 4 | 8;
  variant?: CamelVariant;
}) {
  const storeGrade = useGameStore((s) => s.grade);
  const storeState = useGameStore((s) => s.camelState);
  const theme = useGameStore((s) => s.theme);
  const isNight = theme === "night";

  const effectiveGrade = grade ?? storeGrade ?? 4;
  const effectiveVariant: CamelVariant =
    variant ?? (effectiveGrade === 8 ? "zayed" : "noura");
  const effectiveState: CamelStateName = state ?? storeState;
  const G = GEOMETRY[effectiveVariant];

  const eyeFilter = isNight ? "drop-shadow(0 0 4px #C9A84C)" : undefined;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-block",
      }}
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`dq-camel-body-${effectiveVariant}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={G.bodyColor} />
            <stop offset="100%" stopColor={G.bodyDark} />
          </linearGradient>
        </defs>

        {/* Whole-body bob wrapper */}
        <motion.g {...ANIM.body[effectiveState]}>
          {/* Far-side legs (drawn behind body, slightly muted) */}
          <Leg
            x={G.legX.bFar}
            top={G.leg.topY}
            bottom={G.leg.bottomY}
            width={G.leg.width}
            color={G.legColor}
            opacity={0.65}
            anim={ANIM.bFar[effectiveState]}
          />
          <Leg
            x={G.legX.fFar}
            top={G.leg.topY}
            bottom={G.leg.bottomY}
            width={G.leg.width}
            color={G.legColor}
            opacity={0.65}
            anim={ANIM.fFar[effectiveState]}
          />

          {/* Body + hump */}
          <ellipse
            cx={G.body.cx}
            cy={G.body.cy}
            rx={G.body.rx}
            ry={G.body.ry}
            fill={`url(#dq-camel-body-${effectiveVariant})`}
          />
          <path
            d={G.hump}
            fill={`url(#dq-camel-body-${effectiveVariant})`}
          />

          {/* Tail */}
          <motion.path
            d={G.tailPath}
            stroke={G.legColor}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            {...ANIM.tail[effectiveState]}
            style={{
              transformOrigin: `${G.tailOrigin.x}px ${G.tailOrigin.y}px`,
              transformBox: "view-box",
            }}
          />

          {/* Accessory */}
          {effectiveVariant === "noura" ? (
            <g>
              {/* Backpack */}
              <rect
                x={50}
                y={56}
                width={16}
                height={16}
                rx={3}
                fill="#D9534F"
                stroke="#8B2E2A"
                strokeWidth={1}
              />
              <rect x={54} y={60} width={8} height={3} fill="#FBE7B0" />
              <line
                x1={50}
                y1={58}
                x2={47}
                y2={64}
                stroke="#8B2E2A"
                strokeWidth={1}
              />
              <line
                x1={66}
                y1={58}
                x2={69}
                y2={64}
                stroke="#8B2E2A"
                strokeWidth={1}
              />
            </g>
          ) : (
            <g>
              {/* Explorer scarf draped over the neck/shoulder */}
              <path
                d="M 56 48 Q 66 52 76 48 L 78 60 Q 66 64 54 60 Z"
                fill="#3F6F8E"
                stroke="#244B65"
                strokeWidth={0.8}
              />
              <path
                d="M 73 60 L 70 70"
                stroke="#3F6F8E"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Near-side legs (drawn over body) */}
          <Leg
            x={G.legX.bNear}
            top={G.leg.topY}
            bottom={G.leg.bottomY}
            width={G.leg.width + 0.5}
            color={G.legColor}
            anim={ANIM.bNear[effectiveState]}
          />
          <Leg
            x={G.legX.fNear}
            top={G.leg.topY}
            bottom={G.leg.bottomY}
            width={G.leg.width + 0.5}
            color={G.legColor}
            anim={ANIM.fNear[effectiveState]}
          />

          {/* Head + neck (rotates around neckPivot) */}
          <motion.g
            {...ANIM.head[effectiveState]}
            style={{
              transformOrigin: `${G.neckPivot.x}px ${G.neckPivot.y}px`,
              transformBox: "view-box",
            }}
          >
            <path
              d={G.neckPath}
              stroke={G.bodyColor}
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
            />
            <ellipse
              cx={G.head.cx}
              cy={G.head.cy}
              rx={G.head.rx}
              ry={G.head.ry}
              fill={G.bodyColor}
            />
            <ellipse
              cx={G.snout.cx}
              cy={G.snout.cy}
              rx={G.snout.rx}
              ry={G.snout.ry}
              fill={G.bodyDark}
            />
            <path
              d={G.mouthPath}
              stroke={G.legColor}
              strokeWidth={0.8}
              fill="none"
              strokeLinecap="round"
            />
            <circle
              cx={G.nostril.cx}
              cy={G.nostril.cy}
              r={G.nostril.r}
              fill="#1A1208"
            />

            {/* Eye (squints on happy) */}
            <motion.ellipse
              cx={G.eye.cx}
              cy={G.eye.cy}
              rx={G.eye.r}
              ry={G.eye.r}
              fill="#1A1208"
              {...ANIM.eye[effectiveState]}
              style={{
                transformOrigin: `${G.eye.cx}px ${G.eye.cy}px`,
                transformBox: "view-box",
                filter: eyeFilter,
              }}
            />

            {/* Eyebrow (raises happy / drops sad) */}
            <motion.path
              d={`M ${G.eyebrowOrigin.x - 3} ${G.eyebrowOrigin.y} L ${G.eyebrowOrigin.x + 3} ${G.eyebrowOrigin.y - 1}`}
              stroke="#1A1208"
              strokeWidth={0.9}
              strokeLinecap="round"
              fill="none"
              initial={{ y: 0, rotate: 0, opacity: 0.55 }}
              {...ANIM.eyebrow[effectiveState]}
              style={{
                transformOrigin: `${G.eyebrowOrigin.x}px ${G.eyebrowOrigin.y}px`,
                transformBox: "view-box",
              }}
            />

            {/* Ear */}
            <motion.path
              d={G.earPath}
              fill={G.bodyDark}
              {...ANIM.ear[effectiveState]}
              style={{
                transformOrigin: `${G.earOrigin.x}px ${G.earOrigin.y}px`,
                transformBox: "view-box",
              }}
            />
          </motion.g>
        </motion.g>

        {/* Stars burst (happy) */}
        {effectiveState === "happy" && <HappyStars />}

        {/* Dust cloud (sad) */}
        {effectiveState === "sad" && <DustCloud feetY={G.leg.bottomY} />}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Helper: a leg that rotates around its top                      */
/* ────────────────────────────────────────────────────────────── */

function Leg({
  x,
  top,
  bottom,
  width,
  color,
  opacity = 1,
  anim,
}: {
  x: number;
  top: number;
  bottom: number;
  width: number;
  color: string;
  opacity?: number;
  anim: StateAnim;
}) {
  return (
    <motion.line
      x1={x}
      y1={top}
      x2={x}
      y2={bottom}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
      {...anim}
      style={{
        transformOrigin: `${x}px ${top}px`,
        transformBox: "view-box",
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  HappyStars — 6 sparkles bursting outward                       */
/* ────────────────────────────────────────────────────────────── */

const STAR_PATH =
  "M 0 -3 L 0.9 -0.9 L 3 0 L 0.9 0.9 L 0 3 L -0.9 0.9 L -3 0 L -0.9 -0.9 Z";

function HappyStars() {
  const cx = 60;
  const cy = 50;
  const positions = [
    { dx: 0, dy: -36 },
    { dx: 32, dy: -22 },
    { dx: 38, dy: 6 },
    { dx: 0, dy: 30 },
    { dx: -38, dy: 6 },
    { dx: -32, dy: -22 },
  ];
  return (
    <g aria-hidden>
      {positions.map((p, i) => (
        <motion.path
          key={i}
          d={STAR_PATH}
          fill="#FFD93B"
          stroke="#E8A93B"
          strokeWidth={0.4}
          initial={{
            x: cx,
            y: cy,
            scale: 0,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: cx + p.dx,
            y: cy + p.dy,
            scale: [0, 1.4, 1.0],
            opacity: [0, 1, 0],
            rotate: i % 2 ? 90 : -90,
          }}
          transition={{
            duration: 0.65,
            ease: "easeOut",
            delay: i * 0.04,
            times: [0, 0.4, 1],
          }}
          style={{ filter: "drop-shadow(0 0 3px #FFE08A)" }}
        />
      ))}
    </g>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  DustCloud — 3 grey puffs at the feet                           */
/* ────────────────────────────────────────────────────────────── */

function DustCloud({ feetY }: { feetY: number }) {
  const puffs = [
    { dx: -16, r: 4 },
    { dx: 0, r: 5 },
    { dx: 16, r: 4 },
  ];
  return (
    <g aria-hidden>
      {puffs.map((p, i) => (
        <motion.circle
          key={i}
          cx={60}
          cy={feetY}
          r={p.r}
          fill="#9C9A8C"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: p.dx,
            y: -2,
            scale: [0, 1.5],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
            delay: i * 0.08,
            times: [0, 0.35, 1],
          }}
        />
      ))}
    </g>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Static (non-animated) SVG exports — used by GradeSelect cards  */
/*  which already animate their parent container.                  */
/* ────────────────────────────────────────────────────────────── */

export function NouraCamelSVG({ size = 84 }: { size?: number }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="noura-static-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="100%" stopColor="#C4A05A" />
        </linearGradient>
      </defs>
      <ellipse cx="48" cy="62" rx="26" ry="18" fill="url(#noura-static-body)" />
      <path d="M28 50 Q40 32 52 50 Z" fill="url(#noura-static-body)" />
      <rect x="32" y="74" width="6" height="14" rx="2" fill="#9C7E45" />
      <rect x="58" y="74" width="6" height="14" rx="2" fill="#9C7E45" />
      <path
        d="M62 60 Q72 46 76 30 Q80 28 82 32 Q80 50 70 62 Z"
        fill="url(#noura-static-body)"
      />
      <circle cx="78" cy="30" r="6" fill="#E8C97A" />
      <circle cx="79" cy="29" r="1.4" fill="#1A1208" />
      <path
        d="M74 33 Q77 35 80 33"
        stroke="#1A1208"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="34"
        y="42"
        width="16"
        height="18"
        rx="4"
        fill="#D9534F"
        stroke="#8B2E2A"
        strokeWidth="1"
      />
      <rect x="40" y="46" width="4" height="3" fill="#FBE7B0" />
      <path
        d="M22 60 Q14 64 16 70"
        stroke="#9C7E45"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ZayedCamelSVG({ size = 86 }: { size?: number }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="zayed-static-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9B26A" />
          <stop offset="100%" stopColor="#A07F47" />
        </linearGradient>
      </defs>
      <rect x="30" y="70" width="6" height="20" rx="2" fill="#7E6537" />
      <rect x="58" y="70" width="6" height="20" rx="2" fill="#7E6537" />
      <ellipse cx="48" cy="58" rx="24" ry="14" fill="url(#zayed-static-body)" />
      <path d="M30 48 Q42 24 56 48 Z" fill="url(#zayed-static-body)" />
      <path
        d="M62 56 Q76 38 78 18 Q84 16 86 22 Q82 48 70 60 Z"
        fill="url(#zayed-static-body)"
      />
      <circle cx="80" cy="20" r="6.5" fill="#D9B26A" />
      <circle cx="79" cy="18.5" r="2.5" fill="#1A1208" />
      <circle cx="79" cy="18.5" r="1" fill="#7BB7E0" />
      <path
        d="M74 18 H84"
        stroke="#1A1208"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M74 24 Q78 26 82 24"
        stroke="#1A1208"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M58 48 Q66 52 72 48 L74 56 Q66 60 56 56 Z"
        fill="#3F6F8E"
        stroke="#244B65"
        strokeWidth="0.8"
      />
      <path
        d="M70 56 L66 66"
        stroke="#3F6F8E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 56 Q14 60 18 66"
        stroke="#7E6537"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
