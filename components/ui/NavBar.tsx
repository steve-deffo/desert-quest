"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import SoundToggle from "./SoundToggle";
import ChangeGradeModal from "@/components/ChangeGradeModal";

export default function NavBar() {
  const pathname = usePathname();
  const { t, isRTL } = useTranslation();
  const grade = useGameStore((s) => s.grade);
  const totalDirhams = useGameStore((s) => s.totalDirhams);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [modalOpen, setModalOpen] = useState(false);

  // Hidden on the grade-select onboarding screen and before client hydration
  const hidden = !mounted || pathname === "/" || grade === null;

  return (
    <>
      {!hidden && (
        <motion.header
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-40 h-14 border-b backdrop-blur-md"
          style={{
            background:
              "color-mix(in srgb, var(--bg-card) 75%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--color-gold) 35%, transparent)",
            color: "var(--text-primary)",
          }}
        >
          <div
            className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3 px-4"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Logo / title */}
            <Link
              href="/map"
              onClick={() => playSound(Sounds.buttonClick)}
              className="flex items-center gap-2 text-base font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="text-xl" aria-hidden>
                🐪
              </span>
              <span
                style={{
                  fontFamily: isRTL
                    ? "var(--font-amiri), serif"
                    : "var(--font-reem-kufi), sans-serif",
                  color: "var(--color-gold)",
                }}
                className="hidden sm:inline"
              >
                {t("home.title")}
              </span>
            </Link>

            {/* Grade badge — opens change-grade modal */}
            <button
              type="button"
              onClick={() => {
                playSound(Sounds.buttonClick);
                setModalOpen(true);
              }}
              title={t("grade.change")}
              aria-label={t("grade.change")}
              className="inline-flex h-11 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                color: "#1A1208",
                boxShadow: "0 2px 8px var(--shadow)",
              }}
            >
              {grade === 4 ? "G4" : "G8"}
            </button>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SoundToggle />
              <LanguageToggle />
              <DirhamCount value={totalDirhams} isRTL={isRTL} />
            </div>
          </div>
        </motion.header>
      )}

      {/* Change-grade modal lives outside the header so it stays visible
          when the modal is opened from elsewhere too */}
      <ChangeGradeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function DirhamCount({ value, isRTL }: { value: number; isRTL: boolean }) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <div
      className="hidden items-center gap-1 rounded-full px-3 py-1 text-sm font-bold sm:flex"
      style={{
        background: "color-mix(in srgb, var(--color-gold) 18%, transparent)",
        color: "var(--text-primary)",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
      }}
      aria-label="Dirhams"
    >
      <span aria-hidden>⭐</span>
      <motion.span>{rounded}</motion.span>
      <span
        className="text-xs opacity-80"
        style={{
          fontFamily: isRTL ? "var(--font-amiri), serif" : "inherit",
        }}
      >
        {isRTL ? "د.إ" : "AED"}
      </span>
      {isRTL && <span className="sr-only">{toArabicNumerals(value)}</span>}
    </div>
  );
}
