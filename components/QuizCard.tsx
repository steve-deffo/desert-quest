"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import { getAdaptedQuestions } from "@/lib/adaptiveLearning";
import { Speech } from "@/lib/speech";
import HourglassTimer from "./HourglassTimer";
import AnimatedCamel from "./AnimatedCamel";
import DragDropQuestion from "./DragDropQuestion";
import type {
  AdaptiveDifficulty,
  Lang,
  QuestionData,
  QuizAttempt,
} from "@/lib/types";

const TOTAL_QUESTIONS = 5;
const FEEDBACK_PAUSE_MS = 1500;
const REWARD_SOUND_FLAG = "desert-quest-reward-pending";
const QUIZ_METRICS_KEY = "desert-quest-quiz-metrics";
const PENDING_PERFECT_ATTEMPT_KEY = "desert-quest-pending-perfect-attempt";

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
  const recordReview = useGameStore((s) => s.recordReview);
  const updatePerformance = useGameStore((s) => s.updatePerformance);
  const resetSession = useGameStore((s) => s.resetSession);
  const currentQuestionIndex = useGameStore((s) => s.currentQuestionIndex);
  const currentScore = useGameStore((s) => s.currentScore);

  const questions = useMemo<QuestionData[]>(() => {
    return getAdaptedQuestions(grade, level, useGameStore.getState()).slice(
      0,
      TOTAL_QUESTIONS
    );
  }, [grade, level]);

  // Local UI state
  const [hintUsed, setHintUsed] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const [aiHintIsAi, setAiHintIsAi] = useState(false);
  const aiHintCacheRef = useRef<Map<string, string>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [floatId, setFloatId] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const finishingRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const quizStartedAtRef = useRef<number>(Date.now());

  // Reset whenever the level changes (i.e., on mount or navigation)
  useEffect(() => {
    resetSession();
    quizStartedAtRef.current = Date.now();
    setHintUsed(false);
    setHintOpen(false);
    setAiHint(null);
    setAiHintIsAi(false);
    aiHintCacheRef.current.clear();
    setSelectedAnswer(null);
    setFeedback(null);
    finishingRef.current = false;
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      Speech.stop();
    };
  }, [level, resetSession]);

  // Auto-read question on mount for Grade 4
  useEffect(() => {
    if (grade !== 4) return;
    if (!Speech.isSupported()) return;
    // currentQuestionIndex changes per question; read each new question
    const q = questions[Math.min(currentQuestionIndex, questions.length - 1)];
    if (!q) return;
    Speech.speak(q[lang].question, lang);
    return () => Speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, grade, lang, level]);

  // Detect end of quiz once the index has moved past the last question.
  // If perfect score: skip review and go straight to reward.
  // Otherwise: route through the review screen which finalises the score.
  useEffect(() => {
    const totalForLevel = Math.min(TOTAL_QUESTIONS, questions.length);
    if (currentQuestionIndex >= totalForLevel && !finishingRef.current) {
      finishingRef.current = true;
      setCamelState("idle");
      const timeSpentSeconds = Math.max(
        1,
        Math.round((Date.now() - quizStartedAtRef.current) / 1000)
      );
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          QUIZ_METRICS_KEY,
          JSON.stringify({ level, grade, timeSpentSeconds })
        );
      }
      if (currentScore >= totalForLevel) {
        // Perfect — finalise + go to reward
        completeLevel(level, currentScore);
        if (typeof window !== "undefined") {
          const pendingAttempt: QuizAttempt = {
            id: Date.now().toString(),
            level,
            grade,
            date: new Date().toISOString(),
            score: currentScore,
            stars: starsFor(currentScore),
            dirhamsEarned: currentScore * 10,
            timeSpentSeconds,
            wrongQuestionIds: [],
            topicId: questions[0]?.topic ?? "",
            difficulty: questions[0]?.difficulty ?? "medium",
          };
          window.sessionStorage.setItem(
            PENDING_PERFECT_ATTEMPT_KEY,
            JSON.stringify(pendingAttempt)
          );
          window.sessionStorage.setItem(REWARD_SOUND_FLAG, String(level));
        }
        router.push(`/reward/${level}`);
      } else {
        // Got at least one wrong — show the review screen first
        router.push(`/quiz/${level}/review`);
      }
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
      updatePerformance(
        question.topic,
        correct,
        (question.difficulty ?? "medium") as AdaptiveDifficulty
      );
      setSelectedAnswer(null);
      setFeedback(null);
      // answerQuestion sets camelState; reset to idle for the next question
      setCamelState("idle");
      advanceTimerRef.current = null;
    }, FEEDBACK_PAUSE_MS);
  };

  const recordAndAnswer = (idx: number, correct: boolean) => {
    recordReview({
      questionIndex: safeIndex,
      userAnswerIndex: idx,
      isCorrect: correct,
    });
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

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || feedback !== null || finishingRef.current) return;
    recordAndAnswer(idx, idx === question.correct);
  };

  const handleTimeout = () => {
    if (selectedAnswer !== null || feedback !== null || finishingRef.current) return;
    recordAndAnswer(-1, false);
  };

  const requestAiHint = async () => {
    if (!question) return;
    const cacheKey = `${question.id}:${selectedAnswer ?? -1}`;
    const cached = aiHintCacheRef.current.get(cacheKey);
    if (cached) {
      setAiHint(cached);
      setAiHintIsAi(true);
      setAiHintLoading(false);
      return;
    }
    setAiHintLoading(true);
    setAiHint(null);
    setAiHintIsAi(false);
    try {
      const correctAnswer = question[lang].answers[question.correct];
      const studentAnswer =
        selectedAnswer != null && selectedAnswer >= 0
          ? question[lang].answers[selectedAnswer]
          : "";
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: question[lang].question,
          correctAnswer,
          studentAnswer,
          grade,
          topic: question.topic,
          language: lang,
        }),
      });
      const data = (await res.json()) as { hint?: string; fallback?: boolean };
      if (data.fallback || !data.hint) {
        setAiHint(question[lang].hint);
        setAiHintIsAi(false);
      } else {
        aiHintCacheRef.current.set(cacheKey, data.hint);
        setAiHint(data.hint);
        setAiHintIsAi(true);
      }
    } catch {
      setAiHint(question[lang].hint);
      setAiHintIsAi(false);
    } finally {
      setAiHintLoading(false);
    }
  };

  const playful = grade === 4;
  const difficultyLabel =
    question.difficulty === "easy"
      ? isRTL
        ? "سهل"
        : "Easy"
      : question.difficulty === "hard"
        ? isRTL
          ? "صعب"
          : "Hard"
        : isRTL
          ? "متوسط"
          : "Medium";

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

      {/* Camel + Question (MCQ only — dragdrop renders its own question) */}
      {question.type !== "dragdrop" && (
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="shrink-0">
            <AnimatedCamel size={playful ? 92 : 84} />
          </div>
          <div
            className="relative flex-1 rounded-2xl px-5 py-5 shadow-md"
            style={{
              background: "var(--bg-card)",
              border: `2px solid color-mix(in srgb, var(--color-gold) 35%, transparent)`,
              boxShadow: "0 6px 18px var(--shadow)",
            }}
          >
            <DifficultyPill label={difficultyLabel} />
            <div className="flex items-start gap-2">
              <h2
                className="flex-1 text-xl font-bold leading-snug sm:text-2xl"
                style={{
                  fontFamily: isRTL
                    ? "var(--font-amiri), serif"
                    : "var(--font-nunito), sans-serif",
                  color: "var(--text-primary)",
                }}
              >
                {question[lang].question}
              </h2>
              <SpeakButton
                text={question[lang].question}
                lang={lang}
                speaking={speaking}
                setSpeaking={setSpeaking}
              />
            </div>
          </div>
        </div>
      )}

      {question.type === "dragdrop" ? (
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="hidden shrink-0 sm:block">
            <AnimatedCamel size={playful ? 92 : 84} />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex justify-end">
              <DifficultyPill label={difficultyLabel} />
            </div>
            <DragDropQuestion
              question={question}
              disabled={feedback !== null}
              onSubmit={handleAnswer}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
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
      )}

      {/* Hint */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (hintUsed) return;
            playSound(Sounds.buttonClick);
            setHintUsed(true);
            setHintOpen(true);
            void requestAiHint();
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
                className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                style={{ color: "var(--color-gold)" }}
              >
                <span>🧙 {t("quiz.hint")}</span>
                {aiHintIsAi && !aiHintLoading && (
                  <span
                    aria-label="AI-powered"
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-gold) 25%, transparent)",
                      color: "var(--color-gold)",
                    }}
                  >
                    ✨ AI
                  </span>
                )}
              </div>
              {aiHintLoading ? (
                <div className="flex items-center gap-3">
                  <AnimatedCamel size={48} state="idle" />
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {isRTL ? "الحكيم يفكر…" : "Sage is thinking…"}
                    </span>
                    <span className="mt-1 inline-flex gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "var(--color-gold)" }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              ) : (
                <p
                  className="text-base leading-relaxed"
                  style={{
                    fontFamily: isRTL
                      ? "var(--font-amiri), serif"
                      : "var(--font-nunito), sans-serif",
                  }}
                >
                  {aiHint ?? question[lang].hint}
                </p>
              )}
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

function starsFor(correct: number): number {
  if (correct <= 0) return 0;
  if (correct >= 5) return 3;
  if (correct >= 3) return 2;
  return 1;
}

function DifficultyPill({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.5, ease: "easeOut" }}
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
      style={{
        background: "color-mix(in srgb, var(--color-gold) 16%, var(--bg-card))",
        border: "1px solid color-mix(in srgb, var(--color-gold) 60%, transparent)",
        color: "var(--text-primary)",
      }}
      title="Adapted to your level / مُكيَّف لمستواك"
    >
      {label}
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

  // State-driven feedback animations:
  //  - correct: bouncy reveal + radial green flood
  //  - wrong: rapid shake (only on the user's wrong pick)
  //  - muted: fade to 40% opacity
  //  - "ghost-correct" (the right answer when the user picked wrong): gold pulse 3×
  let animateProp: TargetAndTransition = { scale: 1, opacity: 1, x: 0 };
  let transitionProp: Transition = { duration: 0.3, ease: "easeOut" };
  if (highlight === "correct") {
    animateProp = { scale: [1, 1.08, 1], opacity: 1, x: 0 };
    transitionProp = { duration: 0.5, ease: "easeOut" };
  } else if (highlight === "wrong") {
    animateProp = { x: [0, -10, 10, -8, 8, 0], opacity: 1, scale: 1 };
    transitionProp = { duration: 0.45, ease: "easeOut" };
  } else if (highlight === "muted") {
    animateProp = { opacity: 0.4, scale: 1, x: 0 };
    transitionProp = { duration: 0.3, ease: "easeOut" };
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      animate={animateProp}
      transition={transitionProp}
      whileHover={
        disabled
          ? undefined
          : {
              y: -4,
              scale: 1.02,
              boxShadow:
                "0 14px 28px var(--shadow), 0 0 0 3px var(--color-gold) inset",
            }
      }
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className="relative flex min-h-[88px] flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl px-4 py-4 text-lg font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      style={{
        background: c.bg,
        color: c.fg,
        border: `2px solid ${c.border}`,
        fontFamily: isRTL
          ? "var(--font-amiri), serif"
          : playful
            ? "var(--font-reem-kufi), sans-serif"
            : "var(--font-nunito), sans-serif",
        boxShadow: "0 6px 18px var(--shadow)",
      }}
    >
      {/* Letter badge (top-start corner) */}
      <span
        aria-hidden
        className="absolute top-2 grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold"
        style={{
          insetInlineStart: 8,
          background:
            highlight === "neutral"
              ? "color-mix(in srgb, var(--color-gold) 20%, transparent)"
              : "rgba(255,255,255,0.28)",
          color:
            highlight === "neutral" ? "var(--color-gold)" : "currentColor",
        }}
      >
        {String.fromCharCode(65 + index)}
      </span>

      {/* Radial green flood when correct */}
      <AnimatePresence>
        {highlight === "correct" && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.85, 0.65], scale: [0, 1.4, 1.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.55) 0%, var(--color-correct) 60%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Ghost-correct gold pulse — when this is the right answer but user picked wrong */}
      <AnimatePresence>
        {highlight === "correct" && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ boxShadow: "0 0 0 0 var(--color-gold)" }}
            animate={{
              boxShadow: [
                "0 0 0 0 var(--color-gold)",
                "0 0 0 6px color-mix(in srgb, var(--color-gold) 60%, transparent)",
                "0 0 0 0 var(--color-gold)",
                "0 0 0 6px color-mix(in srgb, var(--color-gold) 60%, transparent)",
                "0 0 0 0 var(--color-gold)",
                "0 0 0 6px color-mix(in srgb, var(--color-gold) 60%, transparent)",
                "0 0 0 0 transparent",
              ],
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Label */}
      <span className="relative leading-tight">
        <span className="block">{label}</span>
      </span>

      {/* Drawn checkmark (correct) or X (wrong) */}
      {highlight === "correct" && (
        <DrawnCheck stroke="white" />
      )}
      {highlight === "wrong" && (
        <span aria-hidden className="relative text-xl leading-none">
          ✗
        </span>
      )}
    </motion.button>
  );
}

function DrawnCheck({ stroke }: { stroke: string }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className="relative"
    >
      <motion.path
        d="M 4 12 L 10 18 L 20 6"
        fill="none"
        stroke={stroke}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
      />
    </svg>
  );
}

function SpeakButton({
  text,
  lang,
  speaking,
  setSpeaking,
}: {
  text: string;
  lang: "en" | "ar";
  speaking: boolean;
  setSpeaking: (v: boolean) => void;
}) {
  if (!Speech.isSupported()) return null;
  return (
    <button
      type="button"
      aria-label={speaking ? "Pause speech" : "Read aloud"}
      onClick={() => {
        if (speaking) {
          Speech.stop();
          setSpeaking(false);
          return;
        }
        Speech.speak(text, lang);
        setSpeaking(true);
        // best-effort reset after expected duration (~ word count × 0.4s)
        const wordCount = text.split(/\s+/).length;
        const ms = Math.max(1500, wordCount * 400);
        window.setTimeout(() => setSpeaking(false), ms);
      }}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-shadow hover:shadow-[0_0_14px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      style={{
        background: "color-mix(in srgb, var(--color-gold) 18%, transparent)",
        color: "var(--color-gold)",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
      }}
    >
      <span aria-hidden className="text-base leading-none">
        {speaking ? "⏸" : "🔊"}
      </span>
    </button>
  );
}
