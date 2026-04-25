"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import AnimatedCamel from "./AnimatedCamel";
import VideoPlayer from "./VideoPlayer";
import lessons from "@/data/lessons.json";
import type { Lang, LessonData } from "@/lib/types";

const keyPointVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LessonCard({
  level,
  grade,
}: {
  level: number;
  grade: 4 | 8;
}) {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const lang = language as Lang;
  const setCamelState = useGameStore((s) => s.setCamelState);

  const lesson = useMemo<LessonData | undefined>(
    () =>
      (lessons as LessonData[]).find(
        (l) => l.grade === grade && l.level === level
      ),
    [grade, level]
  );

  const [stepsRevealed, setStepsRevealed] = useState(1);

  if (!lesson) {
    return (
      <div
        className="flex h-[60vh] items-center justify-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Lesson not found.
      </div>
    );
  }

  const content = lesson[lang];
  const totalSteps = content.workedExample.steps.length;
  const allRevealed = stepsRevealed >= totalSteps;

  const fmt = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const handleNext = () => {
    if (allRevealed) return;
    playSound(Sounds.buttonClick);
    const next = stepsRevealed + 1;
    setStepsRevealed(next);
    if (next === totalSteps) {
      // Final step revealed → camel celebrates briefly
      setCamelState("happy");
      window.setTimeout(() => setCamelState("idle"), 1200);
      playSound(Sounds.camelHappy);
    }
  };

  const handleStart = () => {
    playSound(Sounds.buttonClick);
    router.push(`/quiz/${level}`);
  };

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-20 pb-32 sm:pt-16"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header / progress pill */}
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
          style={{
            background:
              "color-mix(in srgb, var(--color-gold) 18%, transparent)",
            color: "var(--text-primary)",
            boxShadow: "inset 0 0 0 1px var(--color-gold)",
          }}
        >
          <span style={{ color: "var(--color-gold)" }}>
            {t(`level.${level}`)}
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>
            {grade === 4 ? "G4" : "G8"}
          </span>
        </span>

        <h1
          className="text-3xl font-extrabold leading-tight sm:text-4xl"
          style={{
            color: "var(--color-gold)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
            textShadow: "0 2px 6px var(--shadow)",
          }}
        >
          {content.title}
        </h1>

        <FlowPill
          lessonLabel={t("lesson.flowLesson")}
          quizLabel={t("lesson.flowQuiz")}
          isRTL={isRTL}
        />
      </header>

      {/* Objective card */}
      <section
        className="rounded-2xl p-5"
        style={{
          background: "var(--bg-card)",
          border: "2px solid color-mix(in srgb, var(--color-gold) 35%, transparent)",
          boxShadow: "0 6px 18px var(--shadow)",
        }}
      >
        <div
          className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-gold)" }}
        >
          <span aria-hidden>🎯</span>
          {t("lesson.objective")}
        </div>
        <p
          className="text-base leading-relaxed sm:text-lg"
          style={{
            color: "var(--text-primary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {content.objective}
        </p>
      </section>

      {/* Video */}
      <section>
        <div
          className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-gold)" }}
        >
          <span aria-hidden>📹</span>
          {t("lesson.watchAndLearn")}
        </div>
        <VideoPlayer videoUrl={lesson.videoUrl ?? null} title={content.title} />
      </section>

      {/* Explanation + key points + camel */}
      <section
        className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-start"
        style={{
          background: "var(--bg-card)",
          border: "2px solid color-mix(in srgb, var(--color-gold) 25%, transparent)",
          boxShadow: "0 6px 18px var(--shadow)",
        }}
      >
        <div className="flex-1">
          <p
            className="text-base leading-relaxed sm:text-lg"
            style={{
              color: "var(--text-primary)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-nunito), sans-serif",
            }}
          >
            {content.explanation}
          </p>

          <div className="mt-4">
            <div
              className="mb-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-gold)" }}
            >
              {t("lesson.keyPoints")}
            </div>
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: 0.15 }}
              className="space-y-2"
            >
              {content.keyPoints.map((point, i) => (
                <motion.li
                  key={i}
                  variants={keyPointVariants}
                  className="flex items-start gap-2 text-sm sm:text-base"
                  style={{
                    fontFamily: isRTL
                      ? "var(--font-amiri), serif"
                      : "var(--font-nunito), sans-serif",
                  }}
                >
                  <motion.span
                    aria-hidden
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                      delay: 0.15 + i * 0.15,
                      type: "spring",
                      stiffness: 280,
                      damping: 14,
                    }}
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold"
                    style={{
                      background: "var(--color-correct)",
                      color: "white",
                    }}
                  >
                    ✓
                  </motion.span>
                  <span style={{ color: "var(--text-primary)" }}>{point}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
        <div className="hidden self-start sm:block">
          <AnimatedCamel size={88} state="idle" />
        </div>
      </section>

      {/* Worked example */}
      <section
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 65%, transparent), var(--bg-card))",
          border: "2px solid color-mix(in srgb, var(--color-gold) 50%, transparent)",
          boxShadow: "0 6px 18px var(--shadow)",
        }}
      >
        <div
          className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-gold)" }}
        >
          <span aria-hidden>📝</span>
          {t("lesson.workedExample")}
        </div>

        <p
          className="text-base font-bold leading-relaxed sm:text-lg"
          style={{
            color: "var(--text-primary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {content.workedExample.problem}
        </p>

        <ol className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {content.workedExample.steps
              .slice(0, stepsRevealed)
              .map((step, i) => {
                const isFinal = i === totalSteps - 1;
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-start gap-3 overflow-hidden"
                  >
                    <span
                      aria-hidden
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold"
                      style={{
                        background: isFinal
                          ? "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))"
                          : "color-mix(in srgb, var(--color-gold) 22%, transparent)",
                        color: isFinal
                          ? "#1A1208"
                          : "var(--color-gold)",
                        boxShadow: "inset 0 0 0 1px var(--color-gold)",
                      }}
                    >
                      {fmt(i + 1)}
                    </span>
                    <div
                      className={`flex-1 rounded-lg px-3 py-2 text-sm sm:text-base`}
                      style={{
                        background: isFinal
                          ? "color-mix(in srgb, var(--color-gold) 18%, transparent)"
                          : "transparent",
                        color: "var(--text-primary)",
                        border: isFinal
                          ? "1px solid var(--color-gold)"
                          : undefined,
                        fontFamily: isRTL
                          ? "var(--font-amiri), serif"
                          : "var(--font-nunito), sans-serif",
                      }}
                    >
                      {isFinal && (
                        <span
                          className="me-2 text-xs font-bold uppercase tracking-widest"
                          style={{ color: "var(--color-gold)" }}
                        >
                          {t("lesson.answer")}:
                        </span>
                      )}
                      {step}
                    </div>
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </ol>

        {!allRevealed && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-shadow hover:shadow-[0_0_18px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))",
                color: "#1A1208",
              }}
            >
              <span>{t("lesson.nextStep")}</span>
              <span aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : undefined, display: "inline-block" }}>
                →
              </span>
            </button>
          </div>
        )}
      </section>

      {/* Tip */}
      <section
        className="relative rounded-2xl p-5"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 2,
            background:
              "conic-gradient(from 0deg, var(--color-gold), var(--color-gold-light), var(--color-gold), color-mix(in srgb, var(--color-gold) 30%, transparent), var(--color-gold))",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            animation: "dq-tip-spin 6s linear infinite",
          }}
        />
        <div className="relative flex items-start gap-3">
          <span aria-hidden className="text-2xl">
            💡
          </span>
          <div>
            <div
              className="mb-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-gold)" }}
            >
              {t("lesson.tip")}
            </div>
            <p
              className="text-sm leading-relaxed sm:text-base"
              style={{
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-nunito), sans-serif",
              }}
            >
              {content.tip}
            </p>
          </div>
        </div>
        <style>{`
          @keyframes dq-tip-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </section>

      {/* Sticky CTA */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            key="lesson-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky inset-x-0 bottom-3 z-30 mt-2 px-4"
          >
            <button
              type="button"
              onClick={handleStart}
              className="block w-full rounded-full px-6 py-4 text-lg font-extrabold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                color: "#1A1208",
                boxShadow:
                  "0 12px 32px var(--shadow), 0 0 24px color-mix(in srgb, var(--color-gold) 50%, transparent)",
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-reem-kufi), serif",
              }}
            >
              {t("lesson.startChallenge")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlowPill({
  lessonLabel,
  quizLabel,
  isRTL,
}: {
  lessonLabel: string;
  quizLabel: string;
  isRTL: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
      style={{
        background: "color-mix(in srgb, var(--bg-card) 85%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 30%, transparent)",
      }}
    >
      <span style={{ color: "var(--color-gold)" }}>● {lessonLabel}</span>
      <span aria-hidden style={{ color: "var(--text-secondary)", transform: isRTL ? "scaleX(-1)" : undefined, display: "inline-block" }}>
        →
      </span>
      <span style={{ color: "var(--text-secondary)" }}>○ {quizLabel}</span>
    </div>
  );
}
