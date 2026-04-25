"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";

/*
  Hourglass geometry (viewBox 0 0 100 142):
    Top trapezoid:    (10,4) (90,4) (55,65) (45,65)
    Bottom trapezoid: (45,75) (55,75) (90,138) (10,138)
*/

export default function HourglassTimer({
  seconds,
  paused = false,
  runKey,
  onComplete,
}: {
  seconds: number;
  paused?: boolean;
  runKey: string | number;
  onComplete: () => void;
}) {
  const { isRTL } = useTranslation();
  const progress = useMotionValue(1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset to full whenever the question changes
  const warnedRef = useRef(false);
  useEffect(() => {
    progress.set(1);
    warnedRef.current = false;
  }, [runKey, progress]);

  // Fire timerWarning sound exactly once when crossing the 10-seconds mark
  useMotionValueEvent(progress, "change", (f) => {
    const remaining = Math.ceil(f * seconds);
    if (!warnedRef.current && remaining > 0 && remaining <= 10) {
      warnedRef.current = true;
      playSound(Sounds.timerWarning);
    }
  });

  // Run / pause / resume
  useEffect(() => {
    if (paused) return;
    const startValue = progress.get();
    if (startValue <= 0) return;
    const remainingDuration = seconds * startValue;
    const controls: AnimationPlaybackControls = animate(progress, 0, {
      duration: remainingDuration,
      ease: "linear",
      onComplete: () => onCompleteRef.current(),
    });
    return () => controls.stop();
  }, [paused, runKey, seconds, progress]);

  const sandColor = useTransform(progress, (f) => {
    if (f > 0.5) return "var(--color-correct)";
    if (f > 0.25) return "#FF9800";
    return "var(--color-wrong)";
  });

  // Top sand: surface y descends from 4 (full) → 65 (empty)
  const topPathD = useTransform(progress, (f) => {
    const y = 4 + (1 - f) * 61;
    const t = (y - 4) / 61; // 0 (full) → 1 (empty)
    const leftX = 10 + 35 * t;
    const rightX = 90 - 35 * t;
    return `M ${leftX.toFixed(2)} ${y.toFixed(2)} L ${rightX.toFixed(2)} ${y.toFixed(2)} L 55 65 L 45 65 Z`;
  });

  // Bottom pile: surface rises from 138 (empty) → 75 (full)
  const bottomPathD = useTransform(progress, (f) => {
    const y = 138 - (1 - f) * 63;
    const t = (138 - y) / 63; // 0 (empty) → 1 (full)
    const leftX = 45 - 35 * t;
    const rightX = 55 + 35 * t;
    return `M ${leftX.toFixed(2)} ${y.toFixed(2)} L ${rightX.toFixed(2)} ${y.toFixed(2)} L 90 138 L 10 138 Z`;
  });

  const remaining = useTransform(progress, (f) => {
    const n = Math.ceil(f * seconds);
    return isRTL ? toArabicNumerals(n) : String(n);
  });

  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 142"
        width={48}
        height={68}
        aria-hidden
        style={{ overflow: "visible" }}
      >
        {/* Glass shell */}
        <g
          stroke="var(--color-gold)"
          strokeWidth={3}
          strokeLinejoin="round"
          fill="color-mix(in srgb, var(--bg-card) 75%, transparent)"
        >
          <path d="M 10 4 L 90 4 L 55 65 L 45 65 Z" />
          <path d="M 45 75 L 55 75 L 90 138 L 10 138 Z" />
        </g>

        {/* Top & bottom caps */}
        <g
          stroke="var(--color-gold)"
          strokeWidth={5}
          strokeLinecap="round"
        >
          <line x1="6" y1="4" x2="94" y2="4" />
          <line x1="6" y1="138" x2="94" y2="138" />
        </g>

        {/* Sand */}
        <motion.path d={topPathD} fill={sandColor} />
        <motion.path d={bottomPathD} fill={sandColor} />

        {/* Falling stream — hidden when nearly empty */}
        <motion.rect
          x="49"
          y="63"
          width="2"
          height="14"
          fill={sandColor}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      <div className="flex flex-col items-center leading-tight">
        <motion.span
          className="text-lg font-extrabold tabular-nums"
          style={{ color: sandColor }}
        >
          {remaining}
        </motion.span>
        <span
          className="text-[10px] uppercase tracking-wider"
          style={{ color: "var(--text-secondary)" }}
        >
          s
        </span>
      </div>
    </div>
  );
}
