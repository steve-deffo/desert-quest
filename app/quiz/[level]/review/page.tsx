"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import AnimatedCamel from "@/components/AnimatedCamel";
import { isLoggedIn } from "@/lib/auth";
import grade4Questions from "@/data/questions/grade4.json";
import grade8Questions from "@/data/questions/grade8.json";
import type { Lang, QuestionData, QuizAttempt } from "@/lib/types";

const TOTAL_QUESTIONS = 5;
const REWARD_SOUND_FLAG = "desert-quest-reward-pending";
const QUIZ_METRICS_KEY = "desert-quest-quiz-metrics";

export default function ReviewPage() {
  const router = useRouter();
  const { level: levelStr } = useParams<{ level: string }>();
  const level = Number.parseInt(levelStr, 10);
  const { t, language, isRTL } = useTranslation();
  const lang = language as Lang;

  const grade = useGameStore((s) => s.grade);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const currentReview = useGameStore((s) => s.currentReview);
  const currentScore = useGameStore((s) => s.currentScore);
  const completeLevel = useGameStore((s) => s.completeLevel);
  const addQuizAttempt = useGameStore((s) => s.addQuizAttempt);
  const markReviewCorrected = useGameStore((s) => s.markReviewCorrected);
  const setCamelState = useGameStore((s) => s.setCamelState);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Validate access
  const validLevel = Number.isFinite(level) && level >= 0 && level <= 4;

  useEffect(() => {
    if (!mounted) return;
    if (grade === null) {
      router.replace("/");
      return;
    }
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (!validLevel || !unlockedLevels.includes(level)) {
      router.replace("/map");
      return;
    }
    // No review data → nothing to review (e.g. direct URL hit). Send to map.
    if (currentReview.length === 0) {
      router.replace("/map");
    }
  }, [
    mounted,
    grade,
    validLevel,
    level,
    unlockedLevels,
    currentReview.length,
    router,
  ]);

  const questions = useMemo<QuestionData[]>(() => {
    if (grade === null) return [];
    const all = (
      grade === 4 ? grade4Questions : grade8Questions
    ) as QuestionData[];
    return all.filter((q) => q.level === level).slice(0, TOTAL_QUESTIONS);
  }, [grade, level]);

  // Perfect score guard — should not normally land here, but if so, forward
  useEffect(() => {
    if (!mounted || grade === null) return;
    const totalForLevel = Math.min(TOTAL_QUESTIONS, questions.length);
    if (currentReview.length === totalForLevel && currentScore >= totalForLevel) {
      completeLevel(level, currentScore);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(REWARD_SOUND_FLAG, String(level));
      }
      router.replace(`/reward/${level}`);
    }
  }, [
    mounted,
    grade,
    questions.length,
    currentReview.length,
    currentScore,
    completeLevel,
    level,
    router,
  ]);

  // Modal for "Try this question again"
  const [retryIndex, setRetryIndex] = useState<number | null>(null);
  const [retrySelected, setRetrySelected] = useState<number | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<
    "correct" | "wrong" | null
  >(null);

  if (
    !mounted ||
    grade === null ||
    !isLoggedIn() ||
    !validLevel ||
    !unlockedLevels.includes(level) ||
    currentReview.length === 0
  ) {
    return null;
  }

  const totalForLevel = Math.min(TOTAL_QUESTIONS, questions.length);
  const wrongEntries = currentReview.filter((r) => !r.isCorrect);
  const fmt = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const handleContinue = () => {
    playSound(Sounds.buttonClick);
    const wrongQuestionIds = currentReview
      .filter((entry) => !entry.isCorrect)
      .map((entry) => questions[entry.questionIndex]?.id)
      .filter((id): id is string => Boolean(id));

    let timeSpentSeconds = 1;
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem(QUIZ_METRICS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            level: number;
            grade: 4 | 8;
            timeSpentSeconds: number;
          };
          if (parsed.level === level && parsed.grade === grade) {
            timeSpentSeconds = Math.max(1, parsed.timeSpentSeconds || 1);
          }
        } catch {
          timeSpentSeconds = 1;
        }
      }
      window.sessionStorage.removeItem(QUIZ_METRICS_KEY);
    }

    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      level,
      grade,
      date: new Date().toISOString(),
      score: currentScore,
      stars: starsFor(currentScore),
      dirhamsEarned: currentScore * 10,
      timeSpentSeconds,
      wrongQuestionIds,
      topicId: questions[0]?.topic ?? "",
      difficulty: questions[0]?.difficulty ?? "medium",
    };
    addQuizAttempt(attempt);

    completeLevel(level, currentScore);
    setCamelState("idle");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(REWARD_SOUND_FLAG, String(level));
    }
    router.push(`/reward/${level}`);
  };

  const openRetry = (qIndex: number) => {
    playSound(Sounds.buttonClick);
    setRetryIndex(qIndex);
    setRetrySelected(null);
    setRetryFeedback(null);
  };

  const closeRetry = () => {
    playSound(Sounds.buttonClick);
    setRetryIndex(null);
    setRetrySelected(null);
    setRetryFeedback(null);
  };

  const handleRetryChoice = (idx: number) => {
    if (retryIndex === null || retryFeedback !== null) return;
    const q = questions[retryIndex];
    const correct = idx === q.correct;
    setRetrySelected(idx);
    setRetryFeedback(correct ? "correct" : "wrong");
    if (correct) {
      playSound(Sounds.correct);
      playSound(Sounds.camelHappy);
      markReviewCorrected(retryIndex);
      setCamelState("happy");
      window.setTimeout(() => {
        setCamelState("idle");
        closeRetry();
      }, 1200);
    } else {
      playSound(Sounds.wrong);
      playSound(Sounds.camelSad);
      setCamelState("sad");
      window.setTimeout(() => {
        setCamelState("idle");
        setRetrySelected(null);
        setRetryFeedback(null);
      }, 1100);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full pb-32 pt-20 sm:pt-16"
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4">
        {/* Header */}
        <header className="flex flex-col items-center gap-2 text-center">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            {t(`level.${level}`)}
          </span>
          <h1
            className="text-3xl font-extrabold sm:text-4xl"
            style={{
              color: "var(--color-gold)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-reem-kufi), serif",
              textShadow: "0 2px 6px var(--shadow)",
            }}
          >
            {t("review.title")}
          </h1>
          <ScoreSummary correct={currentScore} total={totalForLevel} fmt={fmt} />
        </header>

        {/* Cards */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
          className="flex flex-col gap-4"
        >
          {wrongEntries.map((entry) => {
            const q = questions[entry.questionIndex];
            if (!q) return null;
            return (
              <ReviewCard
                key={q.id}
                question={q}
                lang={lang}
                isRTL={isRTL}
                userAnswerIndex={entry.userAnswerIndex}
                onTryAgain={() => openRetry(entry.questionIndex)}
                tryAgainLabel={t("review.tryAgain")}
                yourAnswerLabel={t("review.yourAnswer")}
                correctAnswerLabel={t("review.correctAnswer")}
                fmt={fmt}
              />
            );
          })}
        </motion.ul>

        {/* Earnings preview */}
        <DirhamPreview correct={currentScore} fmt={fmt} isRTL={isRTL} />
      </div>

      {/* Sticky continue */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4"
      >
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={handleContinue}
            className="block w-full rounded-full px-6 py-4 text-lg font-extrabold transition-shadow hover:shadow-[0_0_24px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
              boxShadow: "0 12px 32px var(--shadow)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-reem-kufi), serif",
            }}
          >
            {t("review.continue")}
          </button>
        </div>
      </motion.div>

      {/* Try-again modal */}
      <AnimatePresence>
        {retryIndex !== null && (
          <RetryModal
            question={questions[retryIndex]}
            lang={lang}
            isRTL={isRTL}
            selectedIndex={retrySelected}
            feedback={retryFeedback}
            onSelect={handleRetryChoice}
            onClose={closeRetry}
            closeLabel={t("quiz.close")}
            yourAnswerLabel={t("review.yourAnswer")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function starsFor(correct: number): number {
  if (correct <= 0) return 0;
  if (correct >= 5) return 3;
  if (correct >= 3) return 2;
  return 1;
}

/* ────────────────────────────────────────────────────────────── */
/*  Score summary                                                  */
/* ────────────────────────────────────────────────────────────── */

function ScoreSummary({
  correct,
  total,
  fmt,
}: {
  correct: number;
  total: number;
  fmt: (n: number) => string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
      style={{
        background: "color-mix(in srgb, var(--color-gold) 18%, transparent)",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
      }}
    >
      <span aria-hidden style={{ color: "var(--color-correct)" }}>✓</span>
      <span className="tabular-nums">
        {fmt(correct)} / {fmt(total)}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  ReviewCard — one per wrong question                            */
/* ────────────────────────────────────────────────────────────── */

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function ReviewCard({
  question,
  lang,
  isRTL,
  userAnswerIndex,
  onTryAgain,
  tryAgainLabel,
  yourAnswerLabel,
  correctAnswerLabel,
  fmt,
}: {
  question: QuestionData;
  lang: Lang;
  isRTL: boolean;
  userAnswerIndex: number;
  onTryAgain: () => void;
  tryAgainLabel: string;
  yourAnswerLabel: string;
  correctAnswerLabel: string;
  fmt: (n: number) => string;
}) {
  const userAnswer =
    userAnswerIndex >= 0 ? question[lang].answers[userAnswerIndex] : "—";
  const correctAnswer = question[lang].answers[question.correct];
  const explanation =
    question.explanation?.[lang] ?? question[lang].hint;

  return (
    <motion.li
      variants={cardVariants}
      className="relative flex gap-3 rounded-2xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "2px solid color-mix(in srgb, var(--color-wrong) 50%, transparent)",
        boxShadow: "0 8px 22px var(--shadow)",
      }}
    >
      <div className="hidden shrink-0 sm:block">
        <AnimatedCamel size={64} state="sad" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full text-sm font-bold"
            style={{ background: "var(--color-wrong)", color: "white" }}
          >
            ✗
          </span>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--text-secondary)" }}
          >
            Q {fmt(question.level + 1)}
            <span style={{ opacity: 0.4 }}> · </span>
            {question.topic}
          </span>
        </div>

        <p
          className="text-base font-bold leading-relaxed"
          style={{
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {question[lang].question}
        </p>

        <div className="mt-1 grid gap-1.5 text-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className="font-bold"
              style={{ color: "var(--text-secondary)" }}
            >
              {yourAnswerLabel}:
            </span>
            <span
              className="font-bold"
              style={{
                color: "var(--color-wrong)",
                textDecoration: "line-through",
                textDecorationColor: "var(--color-wrong)",
              }}
            >
              {userAnswer}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className="font-bold"
              style={{ color: "var(--text-secondary)" }}
            >
              {correctAnswerLabel}:
            </span>
            <span
              className="font-bold"
              style={{ color: "var(--color-correct)" }}
            >
              {correctAnswer} ✓
            </span>
          </div>
        </div>

        <div
          className="mt-1 flex items-start gap-2 rounded-xl p-3"
          style={{
            background:
              "color-mix(in srgb, var(--color-gold) 14%, transparent)",
            color: "var(--text-primary)",
          }}
        >
          <span aria-hidden className="text-lg leading-none">💡</span>
          <p
            className="text-sm leading-relaxed"
            style={{
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-nunito), sans-serif",
            }}
          >
            {explanation}
          </p>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-shadow hover:shadow-[0_0_18px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            style={{
              background: "transparent",
              color: "var(--color-gold)",
              border: "2px solid var(--color-gold)",
            }}
          >
            <span>{tryAgainLabel}</span>
            <span
              aria-hidden
              style={{
                transform: isRTL ? "scaleX(-1)" : undefined,
                display: "inline-block",
              }}
            >
              →
            </span>
          </button>
        </div>
      </div>
    </motion.li>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Dirham preview                                                 */
/* ────────────────────────────────────────────────────────────── */

function DirhamPreview({
  correct,
  fmt,
  isRTL,
}: {
  correct: number;
  fmt: (n: number) => string;
  isRTL: boolean;
}) {
  const target = correct * 10;
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 18, mass: 0.7 });
  const rounded = useTransform(spring, (v) => Math.max(0, Math.round(v)));
  const text = useTransform(rounded, (n) => fmt(n));

  useEffect(() => {
    const timeout = window.setTimeout(() => mv.set(target), 400);
    return () => window.clearTimeout(timeout);
  }, [target, mv]);

  return (
    <div className="mt-4 flex justify-center">
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 25%, transparent), color-mix(in srgb, var(--color-gold-light) 25%, transparent))",
          boxShadow: "inset 0 0 0 2px var(--color-gold)",
          color: "var(--color-gold)",
        }}
      >
        <span aria-hidden>⭐</span>
        <motion.span className="tabular-nums">{text}</motion.span>
        <span
          className="text-xs"
          style={{ fontFamily: isRTL ? "var(--font-amiri), serif" : "inherit" }}
        >
          {isRTL ? "د.إ" : "AED"}
        </span>
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  RetryModal                                                     */
/* ────────────────────────────────────────────────────────────── */

function RetryModal({
  question,
  lang,
  isRTL,
  selectedIndex,
  feedback,
  onSelect,
  onClose,
  closeLabel,
  yourAnswerLabel,
}: {
  question: QuestionData;
  lang: Lang;
  isRTL: boolean;
  selectedIndex: number | null;
  feedback: "correct" | "wrong" | null;
  onSelect: (idx: number) => void;
  onClose: () => void;
  closeLabel: string;
  yourAnswerLabel: string;
}) {
  return (
    <motion.div
      key="retry-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[55] grid place-items-end px-4 pb-4 sm:place-items-center sm:pb-0"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "2px solid var(--color-gold)",
        }}
      >
        <p
          className="text-base font-bold leading-relaxed"
          style={{
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {question[lang].question}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {question[lang].answers.map((a, idx) => {
            const isUserPick = selectedIndex === idx;
            const isCorrect = idx === question.correct;
            let bg = "var(--bg-card)";
            let border = "color-mix(in srgb, var(--color-gold) 50%, transparent)";
            let color = "var(--text-primary)";
            if (feedback !== null) {
              if (isCorrect) {
                bg = "var(--color-correct)";
                border = "var(--color-correct)";
                color = "white";
              } else if (isUserPick) {
                bg = "var(--color-wrong)";
                border = "var(--color-wrong)";
                color = "white";
              }
            }
            return (
              <button
                key={idx}
                type="button"
                disabled={feedback !== null}
                onClick={() => onSelect(idx)}
                className="grid min-h-[60px] place-items-center rounded-2xl px-3 py-3 text-base font-bold transition-colors disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                style={{
                  background: bg,
                  color,
                  border: `2px solid ${border}`,
                  boxShadow: "0 4px 14px var(--shadow)",
                  fontFamily: isRTL
                    ? "var(--font-amiri), serif"
                    : "var(--font-nunito), sans-serif",
                }}
              >
                {a}
              </button>
            );
          })}
        </div>

        <p
          className="mt-3 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {yourAnswerLabel}: <span style={{ opacity: 0.7 }}>—</span>
        </p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-full px-5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border:
                "2px solid color-mix(in srgb, var(--text-secondary) 40%, transparent)",
            }}
          >
            {closeLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
