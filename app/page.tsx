"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import BismillahCalligraphy from "@/components/BismillahCalligraphy";
import { NouraCamelSVG, ZayedCamelSVG } from "@/components/AnimatedCamel";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Sounds, playSound } from "@/lib/sounds";

type SelectableGrade = 4 | 8;

export default function GradeSelectPage() {
  return (
    <Suspense fallback={null}>
      <GradeSelectContent />
    </Suspense>
  );
}

function GradeSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReturning = searchParams?.get("returning") === "1";
  const grade = useGameStore((s) => s.grade);
  const setGrade = useGameStore((s) => s.setGrade);
  const { t, isRTL } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [selecting, setSelecting] = useState<SelectableGrade | null>(null);

  useEffect(() => setMounted(true), []);

  // Once hydrated, redirect away if grade was already chosen
  useEffect(() => {
    if (mounted && grade !== null) {
      router.replace("/home");
    }
  }, [mounted, grade, router]);

  // Avoid SSR/CSR mismatch from persisted store; nothing else to render before hydration
  if (!mounted || grade !== null) return null;

  const handleSelect = (g: SelectableGrade) => {
    if (selecting !== null) return;
    setSelecting(g);
    playSound(Sounds.gradeSelect);
    window.setTimeout(() => {
      setGrade(g);
      router.push("/home");
    }, 500);
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden px-6 py-10"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <DuneBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isReturning ? 0.4 : 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full flex-col items-center gap-3"
      >
        {!isReturning && <BismillahCalligraphy />}
        <ShimmerTitle isRTL={isRTL} text={t("home.title")} />
        <p
          className="mt-1 text-center text-base sm:text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          {isReturning ? t("grade.welcomeBack") : t("grade.select")}
        </p>
      </motion.div>

      <div className="relative z-10 mt-6 flex w-full max-w-3xl flex-col items-stretch justify-center gap-5 sm:flex-row">
        <GradeCard
          grade={4}
          delay={0.2}
          title={t("grade.4")}
          subtitle={t("grade.4.desc")}
          camelLabel={t("camel.noura")}
          icons="➕  ✖️  ½"
          accent="warm"
          isSelected={selecting === 4}
          onSelect={() => handleSelect(4)}
          disabled={selecting !== null && selecting !== 4}
          camel={<NouraCamelSVG />}
        />
        <GradeCard
          grade={8}
          delay={0.4}
          title={t("grade.8")}
          subtitle={t("grade.8.desc")}
          camelLabel={t("camel.zayed")}
          icons="x²  📐  %"
          accent="cool"
          isSelected={selecting === 8}
          onSelect={() => handleSelect(8)}
          disabled={selecting !== null && selecting !== 8}
          camel={<ZayedCamelSVG />}
        />
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Cards                                                          */
/* ────────────────────────────────────────────────────────────── */

function GradeCard({
  grade,
  delay,
  title,
  subtitle,
  camelLabel,
  icons,
  accent,
  isSelected,
  disabled,
  onSelect,
  camel,
}: {
  grade: SelectableGrade;
  delay: number;
  title: string;
  subtitle: string;
  camelLabel: string;
  icons: string;
  accent: "warm" | "cool";
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
  camel: React.ReactNode;
}) {
  const accentBorder =
    accent === "warm" ? "var(--color-gold)" : "#7BB7E0";
  const accentTint =
    accent === "warm"
      ? "color-mix(in srgb, var(--color-gold) 18%, transparent)"
      : "color-mix(in srgb, #7BB7E0 18%, transparent)";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled || isSelected}
      aria-label={`${title} — ${subtitle}`}
      initial={{ opacity: 0, y: 60 }}
      animate={
        isSelected
          ? {
              opacity: 1,
              y: 0,
              scale: [1.0, 1.08, 1.04],
              transition: { duration: 0.45, ease: "easeOut" },
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      whileHover={
        disabled || isSelected
          ? undefined
          : {
              y: -8,
              scale: 1.02,
              boxShadow: "0 18px 40px var(--shadow), 0 0 24px var(--color-gold)",
            }
      }
      whileTap={disabled || isSelected ? undefined : { scale: 0.97 }}
      className="group relative flex flex-1 flex-col items-center gap-3 rounded-3xl p-6 text-center transition-colors disabled:cursor-default"
      style={{
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: `2px solid ${accentBorder}`,
        boxShadow: "0 8px 24px var(--shadow)",
      }}
    >
      {/* Selection ring pulse */}
      <AnimatePresence>
        {isSelected && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{
              opacity: [0.7, 0, 0.7, 0],
              scale: [1, 1.15, 1, 1.2],
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              boxShadow: `0 0 0 6px ${accentBorder}, 0 0 36px ${accentBorder}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Sand particle burst */}
      <AnimatePresence>
        {isSelected && <SandBurst />}
      </AnimatePresence>

      <div
        className="grid h-28 w-28 place-items-center rounded-full"
        style={{ background: accentTint }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {camel}
        </motion.div>
      </div>

      <div
        className="text-2xl font-bold"
        style={{
          fontFamily: "var(--font-reem-kufi), serif",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </div>
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: accent === "warm" ? "var(--color-gold)" : "#7BB7E0" }}
      >
        🐪 {camelLabel}
      </div>
      <div
        className="px-2 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {subtitle}
      </div>
      <div className="mt-2 text-2xl tracking-wider" aria-hidden>
        {icons}
      </div>
    </motion.button>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Sand burst                                                     */
/* ────────────────────────────────────────────────────────────── */

function SandBurst() {
  const particles = Array.from({ length: 14 });
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 90 + Math.random() * 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{
              background:
                i % 2 === 0
                  ? "var(--color-gold-light)"
                  : "var(--color-gold)",
              boxShadow: "0 0 6px var(--color-gold)",
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Title                                                          */
/* ────────────────────────────────────────────────────────────── */

function ShimmerTitle({ text, isRTL }: { text: string; isRTL: boolean }) {
  return (
    <h1
      className="bg-clip-text text-center text-4xl font-extrabold leading-tight text-transparent sm:text-5xl"
      style={{
        backgroundImage:
          "linear-gradient(110deg, var(--color-gold) 0%, var(--color-gold-light) 35%, #FFF6CC 50%, var(--color-gold-light) 65%, var(--color-gold) 100%)",
        backgroundSize: "300% 100%",
        animation: "dq-shimmer 3.6s ease-in-out infinite",
        fontFamily: isRTL
          ? "var(--font-amiri), serif"
          : "var(--font-reem-kufi), serif",
      }}
    >
      {text}
      <style>{`
        @keyframes dq-shimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </h1>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Animated dunes background                                      */
/* ────────────────────────────────────────────────────────────── */

function DuneBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%] overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <motion.path
          d="M0,260 C240,180 480,320 720,240 C960,160 1200,300 1440,220 L1440,400 L0,400 Z"
          fill="var(--dune-color)"
          opacity={0.55}
          animate={{
            d: [
              "M0,260 C240,180 480,320 720,240 C960,160 1200,300 1440,220 L1440,400 L0,400 Z",
              "M0,250 C240,200 480,300 720,250 C960,180 1200,290 1440,230 L1440,400 L0,400 Z",
              "M0,260 C240,180 480,320 720,240 C960,160 1200,300 1440,220 L1440,400 L0,400 Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,320 C200,260 420,360 720,300 C1020,240 1240,360 1440,300 L1440,400 L0,400 Z"
          fill="var(--dune-color)"
          opacity={0.85}
          animate={{
            d: [
              "M0,320 C200,260 420,360 720,300 C1020,240 1240,360 1440,300 L1440,400 L0,400 Z",
              "M0,310 C200,280 420,350 720,310 C1020,260 1240,350 1440,310 L1440,400 L0,400 Z",
              "M0,320 C200,260 420,360 720,300 C1020,240 1240,360 1440,300 L1440,400 L0,400 Z",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
