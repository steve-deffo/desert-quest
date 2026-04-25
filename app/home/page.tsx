"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import BismillahCalligraphy from "@/components/BismillahCalligraphy";
import Starfield from "@/components/Starfield";
import BackButton from "@/components/ui/BackButton";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HomePage() {
  const router = useRouter();
  const { t, isRTL, language } = useTranslation();
  const grade = useGameStore((s) => s.grade);
  const theme = useGameStore((s) => s.theme);
  const totalDirhams = useGameStore((s) => s.totalDirhams);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && grade === null) {
      router.replace("/");
    }
  }, [mounted, grade, router]);

  if (!mounted || grade === null) return null;

  const isNight = theme === "night";

  return (
    <div
      className="relative -mt-14 flex min-h-screen w-full flex-col overflow-hidden"
      style={{ color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SkyBackdrop isNight={isNight} />
      <CelestialBody isNight={isNight} />
      <ParallaxDunes isNight={isNight} />
      <BackButton href="/" />

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 pt-24 pb-12 text-center"
      >
        <motion.div variants={itemVariants}>
          <BismillahCalligraphy width={220} height={50} />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="bg-clip-text text-5xl font-extrabold leading-tight text-transparent sm:text-6xl"
          style={{
            backgroundImage:
              "linear-gradient(110deg, var(--color-gold) 0%, var(--color-gold-light) 35%, #FFF6CC 50%, var(--color-gold-light) 65%, var(--color-gold) 100%)",
            backgroundSize: "300% 100%",
            animation: "dq-home-shimmer 3.6s ease-in-out infinite",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
            filter:
              "drop-shadow(0 4px 12px color-mix(in srgb, var(--color-gold) 35%, transparent))",
          }}
        >
          {t("home.title")}
          <style>{`
            @keyframes dq-home-shimmer {
              0%   { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
          `}</style>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl"
          style={{
            color: "var(--text-secondary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {t("home.subtitle")}
        </motion.p>

        {totalDirhams > 0 && (
          <motion.div
            variants={itemVariants}
            className="mt-2 flex flex-wrap items-center justify-center gap-2"
          >
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("home.welcomeBack")}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                color: "#1A1208",
                boxShadow: "0 2px 10px var(--shadow)",
              }}
            >
              <span aria-hidden>⭐</span>
              <span>
                {totalDirhams}
                {isRTL && (
                  <span className="ms-1 opacity-70">
                    ({toArabicNumerals(totalDirhams)})
                  </span>
                )}
              </span>
              <span className="text-xs opacity-90">
                {isRTL ? "د.إ" : "AED"}
              </span>
            </span>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <GradeBadge grade={grade} label={t(`grade.${grade}`)} />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.8 }}
        >
          <CTAButton
            label={t("home.cta")}
            isRTL={isRTL}
            onClick={() => {
              playSound(Sounds.buttonClick);
              router.push("/map");
            }}
          />
        </motion.div>
      </motion.section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Sky backdrop (gradient + stars at night)                       */
/* ────────────────────────────────────────────────────────────── */

function SkyBackdrop({ isNight }: { isNight: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: isNight
          ? "linear-gradient(to bottom, #0A0F1E 0%, #131B3D 55%, #1A237E 100%)"
          : "linear-gradient(to bottom, #87CEEB 0%, #FFE08A 70%, #FDD835 100%)",
      }}
    >
      {isNight && <Starfield count={70} topRange={65} nightOnly={false} />}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Rising sun / moon                                              */
/* ────────────────────────────────────────────────────────────── */

function CelestialBody({ isNight }: { isNight: boolean }) {
  return (
    <motion.div
      key={isNight ? "moon" : "sun"}
      aria-hidden
      className="pointer-events-none absolute z-0"
      style={{
        top: "14%",
        right: "12%",
      }}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {isNight ? <MoonSVG /> : <SunSVG />}
    </motion.div>
  );
}

function SunSVG() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden>
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6CC" stopOpacity="1" />
          <stop offset="50%" stopColor="#FDD835" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FDD835" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-core" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFF6CC" />
          <stop offset="60%" stopColor="#FFD93B" />
          <stop offset="100%" stopColor="#E8A93B" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="78" fill="url(#sun-glow)" />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "80px 80px" }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x1 = 80 + Math.cos(angle) * 50;
          const y1 = 80 + Math.sin(angle) * 50;
          const x2 = 80 + Math.cos(angle) * 64;
          const y2 = 80 + Math.sin(angle) * 64;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFE08A"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}
      </motion.g>
      <circle cx="80" cy="80" r="40" fill="url(#sun-core)" />
    </svg>
  );
}

function MoonSVG() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden>
      <defs>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5E6C8" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#E8D08A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E8D08A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-body" cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FFF6E0" />
          <stop offset="100%" stopColor="#D4C189" />
        </radialGradient>
        <mask id="crescent-mask">
          <rect width="140" height="140" fill="white" />
          <circle cx="84" cy="62" r="38" fill="black" />
        </mask>
      </defs>
      <circle cx="70" cy="70" r="68" fill="url(#moon-glow)" />
      <circle
        cx="70"
        cy="70"
        r="42"
        fill="url(#moon-body)"
        mask="url(#crescent-mask)"
        style={{
          filter: "drop-shadow(0 0 18px rgba(245,230,200,0.45))",
        }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Parallax dunes (3 layers)                                      */
/* ────────────────────────────────────────────────────────────── */

function ParallaxDunes({ isNight }: { isNight: boolean }) {
  const { scrollY } = useScroll();
  const yBack = useTransform(scrollY, [0, 600], [0, -25]);
  const yMid = useTransform(scrollY, [0, 600], [0, -55]);
  const yFront = useTransform(scrollY, [0, 600], [0, -90]);

  const back = isNight ? "#1B2A3B" : "#E8C97A";
  const mid = isNight ? "#162032" : "#C4A05A";
  const front = isNight ? "#0D1B2A" : "#A07F47";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%]"
    >
      <motion.svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[80%] w-full"
        style={{ y: yBack }}
      >
        <path
          d="M0,200 C240,140 480,260 720,180 C960,100 1200,240 1440,160 L1440,320 L0,320 Z"
          fill={back}
          opacity={0.85}
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[65%] w-full"
        style={{ y: yMid }}
      >
        <path
          d="M0,240 C200,180 420,280 720,220 C1020,160 1240,280 1440,220 L1440,320 L0,320 Z"
          fill={mid}
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[42%] w-full"
        style={{ y: yFront }}
      >
        <path
          d="M0,260 C240,200 520,300 800,240 C1080,180 1280,300 1440,240 L1440,320 L0,320 Z"
          fill={front}
        />
      </motion.svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Grade badge + CTA                                              */
/* ────────────────────────────────────────────────────────────── */

function GradeBadge({ grade, label }: { grade: 4 | 8; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider"
      style={{
        background:
          "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
        color: "#1A1208",
        boxShadow: "0 2px 10px var(--shadow)",
      }}
    >
      <span aria-hidden>{grade === 4 ? "🌟" : "🧭"}</span>
      <span>{label}</span>
    </span>
  );
}

function CTAButton({
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
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0 0 0 4px color-mix(in srgb, var(--color-gold) 35%, transparent), 0 0 48px var(--color-gold-light)",
      }}
      whileTap={{ scale: 0.96 }}
      animate={{
        boxShadow: [
          "0 0 0 0 color-mix(in srgb, var(--color-gold) 0%, transparent), 0 0 22px color-mix(in srgb, var(--color-gold-light) 35%, transparent)",
          "0 0 0 6px color-mix(in srgb, var(--color-gold) 25%, transparent), 0 0 42px var(--color-gold-light)",
          "0 0 0 0 color-mix(in srgb, var(--color-gold) 0%, transparent), 0 0 22px color-mix(in srgb, var(--color-gold-light) 35%, transparent)",
        ],
      }}
      transition={{
        boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
      }}
      className="rounded-full px-8 py-4 text-lg font-extrabold tracking-wide"
      style={{
        background:
          "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
        color: "#1A1208",
        fontFamily: isRTL
          ? "var(--font-amiri), serif"
          : "var(--font-reem-kufi), serif",
      }}
    >
      {label}
    </motion.button>
  );
}
