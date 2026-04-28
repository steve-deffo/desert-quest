"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";
import type { QuestionData } from "@/lib/types";

type DropState = "empty" | "hover" | "filled";

export default function DragDropQuestion({
  question,
  disabled,
  onSubmit,
}: {
  question: QuestionData;
  disabled: boolean;
  onSubmit: (selectedIndex: number) => void;
}) {
  const { t, language, isRTL } = useTranslation();
  const lang = language as "en" | "ar";

  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [zoneState, setZoneState] = useState<DropState>("empty");
  const [filledIndex, setFilledIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  // Reset whenever the question changes
  useEffect(() => {
    setZoneState("empty");
    setFilledIndex(null);
    setDragging(null);
  }, [question.id]);

  const handleDrop = (idx: number, point: { x: number; y: number }) => {
    setDragging(null);
    const zone = zoneRef.current;
    if (!zone) return;
    const r = zone.getBoundingClientRect();
    const inside =
      point.x >= r.left &&
      point.x <= r.right &&
      point.y >= r.top &&
      point.y <= r.bottom;
    if (inside) {
      setFilledIndex(idx);
      setZoneState("filled");
      playSound(Sounds.dropClick);
    } else {
      setZoneState("empty");
    }
  };

  const handleHover = (idx: number, point: { x: number; y: number }) => {
    if (dragging !== idx) return;
    const zone = zoneRef.current;
    if (!zone) return;
    const r = zone.getBoundingClientRect();
    const inside =
      point.x >= r.left &&
      point.x <= r.right &&
      point.y >= r.top &&
      point.y <= r.bottom;
    setZoneState((prev) => {
      if (inside && prev !== "filled") return "hover";
      if (!inside && prev === "hover") return "empty";
      return prev;
    });
  };

  const zoneBorder =
    zoneState === "filled"
      ? "var(--color-gold)"
      : zoneState === "hover"
        ? "var(--color-gold-light)"
        : "color-mix(in srgb, var(--color-gold) 50%, transparent)";

  const zoneBg =
    zoneState === "hover"
      ? "color-mix(in srgb, var(--color-gold) 22%, transparent)"
      : "color-mix(in srgb, var(--bg-card) 75%, transparent)";

  const zoneBoxShadow =
    zoneState === "hover" ? "0 0 24px var(--color-gold)" : "0 4px 14px var(--shadow)";

  return (
    <div
      className="flex flex-col gap-5 rounded-2xl px-5 py-5"
      style={{
        background: "var(--bg-card)",
        border: `2px solid color-mix(in srgb, var(--color-gold) 35%, transparent)`,
        boxShadow: "0 6px 18px var(--shadow)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h2
        className="text-xl font-bold leading-snug sm:text-2xl"
        style={{
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-nunito), sans-serif",
          color: "var(--text-primary)",
        }}
      >
        {question[lang].question}
      </h2>

      {/* Drop zone */}
      <div className="flex justify-center">
        <motion.div
          ref={zoneRef}
          animate={
            zoneState === "hover" ? { scale: [1, 1.05, 1] } : { scale: 1 }
          }
          transition={{ duration: 0.5, ease: "easeOut", repeat: zoneState === "hover" ? Infinity : 0 }}
          className="grid h-20 min-w-[160px] place-items-center rounded-2xl px-6 text-lg font-bold"
          style={{
            border: `${zoneState === "empty" ? "2px dashed" : "2px solid"} ${zoneBorder}`,
            background: zoneBg,
            color: "var(--text-primary)",
            boxShadow: zoneBoxShadow,
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          {filledIndex !== null ? (
            <span>{question[lang].answers[filledIndex]}</span>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>
              {t("quiz.dragHere")}
            </span>
          )}
        </motion.div>
      </div>

      {/* Draggable chips */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {question[lang].answers.map((label, idx) => (
          <Draggable
            key={`${question.id}-${idx}`}
            label={label}
            isActive={filledIndex === idx}
            disabled={disabled || filledIndex === idx}
            onStart={() => {
              setDragging(idx);
              setZoneState((prev) => (prev === "filled" ? prev : "empty"));
              playSound(Sounds.dragStart);
            }}
            onMove={(point) => handleHover(idx, point)}
            onEnd={(point) => handleDrop(idx, point)}
          />
        ))}
      </div>

      {/* Reset & Check */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {filledIndex !== null && !disabled && (
          <button
            type="button"
            onClick={() => {
              playSound(Sounds.buttonClick);
              setFilledIndex(null);
              setZoneState("empty");
            }}
            className="inline-flex h-11 items-center rounded-full px-5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border:
                "2px solid color-mix(in srgb, var(--text-secondary) 40%, transparent)",
            }}
          >
            {t("quiz.reset")}
          </button>
        )}
        <button
          type="button"
          disabled={filledIndex === null || disabled}
          onClick={() => {
            if (filledIndex === null) return;
            playSound(Sounds.buttonClick);
            onSubmit(filledIndex);
          }}
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-extrabold transition-shadow disabled:opacity-50 hover:shadow-[0_0_18px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
            color: "#1A1208",
          }}
        >
          {t("quiz.check")}
        </button>
      </div>
    </div>
  );
}

function Draggable({
  label,
  isActive,
  disabled,
  onStart,
  onMove,
  onEnd,
}: {
  label: string;
  isActive: boolean;
  disabled: boolean;
  onStart: () => void;
  onMove: (point: { x: number; y: number }) => void;
  onEnd: (point: { x: number; y: number }) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.div
      drag={!disabled}
      dragSnapToOrigin={true}
      dragConstraints={{ left: -260, right: 260, top: -260, bottom: 260 }}
      dragElastic={0.18}
      whileDrag={{
        scale: 1.12,
        zIndex: 50,
        boxShadow: "0 14px 36px var(--shadow), 0 0 0 3px var(--color-gold)",
      }}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      onDragStart={onStart}
      onDrag={(_, info) =>
        onMove({ x: info.point.x, y: info.point.y })
      }
      onDragEnd={(_, info) =>
        onEnd({ x: info.point.x, y: info.point.y })
      }
      style={{
        x,
        y,
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: `2px solid ${
          isActive
            ? "var(--color-gold)"
            : "color-mix(in srgb, var(--color-gold) 50%, transparent)"
        }`,
        boxShadow: "0 4px 14px var(--shadow)",
        opacity: disabled && !isActive ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      className="grid h-12 min-w-[64px] place-items-center rounded-full px-4 text-lg font-bold"
    >
      {label}
    </motion.div>
  );
}
