"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import HourglassTimer from "./HourglassTimer";
import AnimatedCamel from "./AnimatedCamel";
import grade4Questions from "@/data/questions/grade4.json";
import grade8Questions from "@/data/questions/grade8.json";
import type { Lang, QuestionData } from "@/lib/types";

const TOTAL_QUESTIONS = 5;

type Feedback = "correct" | "wrong" | null;

export default function QuizCard({
  level,
  grade,
}: {
  level: number;
  grade: 4 | 8;
}) {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();
  const lang = language as Lang;
  const seconds = grade === 4 ? 40 : 30;

  const setCamelState = useGameStore((s) => s.setCamelState);
  const answerQuestion = useGameStore((s) => s.answerQuestion);
  const completeLevel = useGameStore((s) => s.completeLevel);
  const resetSession = useGameStore((s) => s.resetSession);
  const currentQuestionIndex = useGameStore((s) => s.currentQuestionIndex);
  const currentScore = useGameStore((s) => s.currentScore);

  const questions = useMemo<QuestionData[]>(() => {
    const all = (
      grade === 4 ? grade4Questions : grade8Questions
    ) as QuestionData[];
    return all.filter((q) => q.level === level).slice(0, TOTAL_QUESTIONS);
  }, [grade, level]);

  // Local UI state
  const [hintUsed, setHintUsed] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [floatId, setFloatId] = useState(0);
  const finishingRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);

  // Reset whenever the level changes (i.e., on mount or navigation)
  useEffect(() => {
    resetSession();
    setHintUsed(false);
    setHintOpen(false);
    setSelectedAnswer(null);
    setFeedback(null);
    finishingRef.current = false;
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, [level, resetSession]);

  // Detect end of quiz once the index has moved past the last question
  useEffect(() => {
    const totalForLevel = Math.min(TOTAL_QUESTIONS, questions.length);
    if (currentQuestionIndex >= totalForLevel && !finishingRef.current) {
      finishingRef.current = true;
      completeLevel(level, currentScore);
      setCamelState("idle");
      router.push(`/reward/${level}`);
    }
  }, [
    currentQuestionIndex,
    currentScore,
    level,
    questions.length,
    completeLevel,
    setCamelState,
    router,
  ]);

  if (!questions.length) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>No questions for this level.</p>
      </div>
    );
  }

  const safeIndex = Math.min(currentQuestionIndex, questions.length - 1);
  const question = questions[safeIndex];
  const fmtNum = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const finishAnswer = (correct: boolean) => {
    advanceTimerRef.current = window.setTimeout(() => {
      answerQuestion(correct);
      setSelectedAnswer(null);
      setFeedback(null);
      // answerQuestion sets camelState; reset to idle for the next question
      setCamelState("idle");
      advanceTimerRef.current = null;
    }, 1100);
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || feedback !== null || finishingRef.current) return;
    const correct = idx === question.correct;
    setSelectedAnswer(idx);
    setFeedback(correct ? "correct" : "wrong");
    setCamelState(correct ? "happy" : "sad");
    if (correct) {
      setFloatId((id) => id + 1);
      playSound(Sounds.correct);
      playSound(Sounds.camelHappy);
    } else {
      playSound(Sounds.wrong);
      playSound(Sounds.camelSad);
    }
    finishAnswer(correct);
  };

  const handleTimeout = () => {
    if (selectedAnswer !== null || feedback !== null || finishingRef.current) return;
    setSelectedAnswer(-1);
    setFeedback("wrong");
    setCamelState("sad");
    playSound(Sounds.wrong);
    playSound(Sounds.camelSad);
    finishAnswer(false);
  };

  const playful = grade === 4;

  return (
    <motion.div
      animate={feedback === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pt-6 pb-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Progress bar */}
      <ProgressDots
        total={Math.min(TOTAL_QUESTIONS, questions.length)}
        current={Math.min(currentQuestionIndex, questions.length)}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-sm font-bold sm:text-base"
          style={{
            color: "var(--text-secondary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), sans-serif",
          }}
        >
          {t("quiz.question")} {fmtNum(safeIndex + 1)}
          <span style={{ opacity: 0.5 }}> / </span>
          {fmtNum(Math.min(TOTAL_QUESTIONS, questions.length))}
        </span>

        <HourglassTimer
          seconds={seconds}
          runKey={`${level}-${safeIndex}`}
          paused={feedback !== null || finishingRef.current}
          onComplete={handleTimeout}
        />
      </div>

      {/* Camel + Question */}
      <div className="flex items-start gap-3 sm:gap-5">
        <div className="shrink-0">
          <AnimatedCamel size={playful ? 92 : 84} />
        </div>
        <div
          className="flex-1 rounded-2xl px-5 py-5 shadow-md"
          style={{
            background: "var(--bg-card)",
            border: `2px solid color-mix(in srgb, var(--color-gold) 35%, transparent)`,
            boxShadow: "0 6px 18px var(--shadow)",
          }}
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
        </div>
      </div>

      {/* Answers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question[lang].answers.map((ans, idx) => (
          <AnswerButton
            key={`${question.id}-${idx}`}
            label={ans}
            index={idx}
            playful={playful}
            isRTL={isRTL}
            disabled={feedback !== null}
            highlight={
              feedback === null
                ? "neutral"
                : idx === question.correct
                  ? "correct"
                  : idx === selectedAnswer
                    ? "wrong"
                    : "muted"
            }
            onSelect={() => handleAnswer(idx)}
          />
        ))}
      </div>

      {/* Hint */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (hintUsed) return;
            playSound(Sounds.buttonClick);
            setHintUsed(true);
            setHintOpen(true);
          }}
          disabled={hintUsed}
          className="inline-flex h-11 items-center rounded-full px-5 text-sm font-bold transition-opacity disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          style={{
            background:
              "color-mix(in srgb, var(--color-gold) 18%, transparent)",
            color: "var(--text-primary)",
            boxShadow: "inset 0 0 0 1px var(--color-gold)",
          }}
        >
          {hintUsed ? t("quiz.hintUsed") : t("quiz.hint")}
        </button>
      </div>

      {/* Hint modal */}
      <AnimatePresence>
        {hintOpen && (
          <motion.div
            key="hint-backdrop"
            className="fixed inset-0 z-40 grid place-items-center px-4"
            style={{ background: "var(--overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setHintOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
              style={{
                background: "var(--bg-card)",
                border: "2px solid var(--color-gold)",
                color: "var(--text-primary)",
              }}
              initial={{ scale: 0.85, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="mb-2 text-sm font-bold uppercase tracking-wider"
                style={{ color: "var(--color-gold)" }}
              >
                🧙 {t("quiz.hint")}
              </div>
              <p
                className="text-base leading-relaxed"
                style={{
                  fontFamily: isRTL
                    ? "var(--font-amiri), serif"
                    : "var(--font-nunito), sans-serif",
                }}
              >
                {question[lang].hint}
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHintOpen(false)}
                  className="rounded-full px-4 py-1.5 text-sm font-bold"
                  style={{
                    background: "var(--color-gold)",
                    color: "#1A1208",
                  }}
                >
                  {t("quiz.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* +10 Dirhams float */}
      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div
            key={`reward-${floatId}`}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 text-2xl font-extrabold"
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -120, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              color: "var(--color-correct)",
              textShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            +{fmtNum(10)} {isRTL ? "د.إ" : "AED"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Green flash overlay */}
      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div
            key="flash"
            aria-hidden
            className="pointer-events-none fixed inset-0 z-30"
            style={{ background: "var(--color-correct)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Subcomponents                                                  */
/* ────────────────────────────────────────────────────────────── */

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        const active = i === current;
        return (
          <span
            key={i}
            className="h-2 flex-1 rounded-full transition-colors"
            style={{
              background: filled
                ? "var(--color-gold)"
                : active
                  ? "color-mix(in srgb, var(--color-gold) 50%, transparent)"
                  : "color-mix(in srgb, var(--text-secondary) 25%, transparent)",
              boxShadow: active ? "0 0 8px var(--color-gold)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

type Highlight = "neutral" | "correct" | "wrong" | "muted";

function AnswerButton({
  label,
  index,
  playful,
  isRTL,
  disabled,
  highlight,
  onSelect,
}: {
  label: string;
  index: number;
  playful: boolean;
  isRTL: boolean;
  disabled: boolean;
  highlight: Highlight;
  onSelect: () => void;
}) {
  const colors: Record<Highlight, { bg: string; fg: string; border: string }> =
    {
      neutral: {
        bg: "var(--bg-card)",
        fg: "var(--text-primary)",
        border: "color-mix(in srgb, var(--color-gold) 50%, transparent)",
      },
      correct: {
        bg: "var(--color-correct)",
        fg: "white",
        border: "var(--color-correct)",
      },
      wrong: {
        bg: "var(--color-wrong)",
        fg: "white",
        border: "var(--color-wrong)",
      },
      muted: {
        bg: "color-mix(in srgb, var(--bg-card) 60%, transparent)",
        fg: "color-mix(in srgb, var(--text-primary) 50%, transparent)",
        border: "color-mix(in srgb, var(--text-secondary) 30%, transparent)",
      },
    };
  const c = colors[highlight];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.03,
              boxShadow:
                "0 8px 24px var(--shadow), 0 0 0 2px var(--color-gold) inset",
            }
      }
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className="relative flex min-h-[56px] items-center justify-between gap-3 rounded-2xl px-5 py-3 text-lg font-bold transition-colors"
      style={{
        background: c.bg,
        color: c.fg,
        border: `2px solid ${c.border}`,
        fontFamily: isRTL
          ? "var(--font-amiri), serif"
          : playful
            ? "var(--font-reem-kufi), sans-serif"
            : "var(--font-nunito), sans-serif",
        boxShadow: "0 4px 14px var(--shadow)",
      }}
    >
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold"
        style={{
          background:
            highlight === "neutral"
              ? "color-mix(in srgb, var(--color-gold) 20%, transparent)"
              : "rgba(255,255,255,0.25)",
          color:
            highlight === "neutral" ? "var(--color-gold)" : "currentColor",
        }}
      >
        {String.fromCharCode(65 + index)}
      </span>
      <span className="flex-1 text-center">{label}</span>
      <span aria-hidden className="w-7 text-center text-xl leading-none">
        {highlight === "correct" ? "✓" : highlight === "wrong" ? "✗" : ""}
      </span>
    </motion.button>
  );
}
