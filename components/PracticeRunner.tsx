"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";
import AnimatedCamel from "@/components/AnimatedCamel";
import grade4Questions from "@/data/questions/grade4.json";
import grade8Questions from "@/data/questions/grade8.json";
import type { QuestionData } from "@/lib/types";

interface AiQuestion {
  question: string;
  answers: [string, string, string, string];
  correct: number;
  explanation: string;
  arabicNumerals: [string, string, string, string];
}

const TOPICS_BY_GRADE: Record<4 | 8, { id: number; topic: string }[]> = {
  4: [
    { id: 0, topic: "addition" },
    { id: 1, topic: "multiplication" },
    { id: 2, topic: "division" },
    { id: 3, topic: "fractions" },
    { id: 4, topic: "geometry" },
  ],
  8: [
    { id: 0, topic: "algebra" },
    { id: 1, topic: "linear-equations" },
    { id: 2, topic: "geometry" },
    { id: 3, topic: "statistics" },
    { id: 4, topic: "ratios-percentages" },
  ],
};

export default function PracticeRunner({ grade }: { grade: 4 | 8 }) {
  const { t, isRTL, language } = useTranslation();
  const completedLevels = useGameStore((s) => s.completedLevels);
  const setCamelState = useGameStore((s) => s.setCamelState);

  const completedTopics = useMemo(
    () =>
      TOPICS_BY_GRADE[grade].filter((row) =>
        completedLevels.includes(row.id)
      ),
    [grade, completedLevels]
  );

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<AiQuestion[] | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const advanceTimer = useRef<number | null>(null);

  const startPractice = async (topic: string) => {
    playSound(Sounds.buttonClick);
    setSelectedTopic(topic);
    setLoading(true);
    setUsingFallback(false);
    setQuestions(null);
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grade,
          topic,
          difficulty: "medium",
          language,
        }),
      });
      const data = (await res.json()) as {
        questions?: AiQuestion[];
        fallback?: boolean;
      };
      if (data.fallback || !data.questions) {
        // Static fallback: pull existing questions from JSON for this topic
        const all = (
          grade === 4 ? grade4Questions : grade8Questions
        ) as QuestionData[];
        const matching = all
          .filter((q) => q.topic === topic)
          .slice(0, 5)
          .map<AiQuestion>((q) => ({
            question: q[language as "en" | "ar"].question,
            answers: q[language as "en" | "ar"].answers as [
              string,
              string,
              string,
              string,
            ],
            correct: q.correct,
            explanation:
              q.explanation?.[language as "en" | "ar"] ??
              q[language as "en" | "ar"].hint,
            arabicNumerals: q.arabicNumerals as [
              string,
              string,
              string,
              string,
            ],
          }));
        setQuestions(matching);
        setUsingFallback(true);
      } else {
        setQuestions(data.questions);
        setUsingFallback(false);
      }
    } catch {
      setQuestions([]);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (advanceTimer.current !== null)
        window.clearTimeout(advanceTimer.current);
    };
  }, []);

  if (completedTopics.length === 0) {
    return (
      <div
        className="mx-auto max-w-2xl px-4 pt-20 text-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <AnimatedCamel size={120} state="idle" />
        <p
          className="mt-4 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          {isRTL
            ? "أكمل مستوى واحداً على الأقل لفتح وضع التدريب."
            : "Complete at least one level to unlock Practice Mode."}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="grid min-h-[60vh] place-items-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ x: [-40, 40, -40] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <AnimatedCamel size={96} state="walking" />
          </motion.div>
          <p
            className="text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isRTL
              ? "جاري إنشاء تحديك…"
              : "Generating your challenge…"}
          </p>
        </div>
      </div>
    );
  }

  if (!questions || !selectedTopic) {
    return (
      <div
        className="mx-auto max-w-3xl px-4 pt-20"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <h1
          className="mb-2 text-center text-3xl font-extrabold sm:text-4xl"
          style={{
            color: "var(--color-gold)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
          }}
        >
          {isRTL ? "تدريب إضافي" : "Extra Practice"} 🎯
        </h1>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {isRTL
            ? "اختر موضوعاً وسأنشئ لك ٥ أسئلة جديدة."
            : "Pick a topic and I'll generate 5 fresh questions."}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {completedTopics.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => void startPractice(row.topic)}
              className="rounded-2xl px-5 py-4 text-left text-base font-bold transition-shadow hover:shadow-[0_8px_20px_var(--shadow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "2px solid var(--color-gold)",
                boxShadow: "0 4px 14px var(--shadow)",
              }}
            >
              <div
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--color-gold)" }}
              >
                {t(`level.${row.id}`)}
              </div>
              <div className="mt-1 text-base">{row.topic}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Quiz playback
  if (questions.length === 0) {
    return (
      <div
        className="mx-auto max-w-2xl px-4 pt-20 text-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <AnimatedCamel size={96} state="sad" />
        <p
          className="mt-4 text-base"
          style={{ color: "var(--text-primary)" }}
        >
          {isRTL
            ? "لم نتمكن من إنشاء أسئلة. حاول لاحقاً."
            : "Couldn't generate questions. Please try again later."}
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedTopic(null);
            setQuestions(null);
          }}
          className="mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm font-extrabold"
          style={{
            background:
              "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))",
            color: "#1A1208",
          }}
        >
          {isRTL ? "العودة" : "Back"}
        </button>
      </div>
    );
  }

  if (qIndex >= questions.length) {
    return (
      <div
        className="mx-auto max-w-2xl px-4 pt-20 text-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <AnimatedCamel size={120} state="happy" />
        <h2
          className="mt-4 text-3xl font-extrabold"
          style={{
            color: "var(--color-gold)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
          }}
        >
          {isRTL ? `أحرزت ${score}/${questions.length}` : `You got ${score}/${questions.length}`}
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedTopic(null);
              setQuestions(null);
              setQIndex(0);
              setScore(0);
            }}
            className="inline-flex h-11 items-center rounded-full px-6 text-sm font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))",
              color: "#1A1208",
            }}
          >
            {isRTL ? "موضوع آخر" : "Pick another topic"}
          </button>
          <button
            type="button"
            onClick={() => void startPractice(selectedTopic)}
            className="inline-flex h-11 items-center rounded-full px-6 text-sm font-bold"
            style={{
              background: "transparent",
              color: "var(--color-gold)",
              border: "2px solid var(--color-gold)",
            }}
          >
            {isRTL ? "٥ أسئلة جديدة" : "5 fresh questions"}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];

  const handleAnswer = (idx: number) => {
    if (selected !== null || feedback !== null) return;
    const isCorrect = idx === q.correct;
    setSelected(idx);
    setFeedback(isCorrect ? "correct" : "wrong");
    setCamelState(isCorrect ? "happy" : "sad");
    if (isCorrect) {
      playSound(Sounds.correct);
      playSound(Sounds.camelHappy);
      setScore((s) => s + 1);
    } else {
      playSound(Sounds.wrong);
      playSound(Sounds.camelSad);
    }
    advanceTimer.current = window.setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      setCamelState("idle");
      setQIndex((i) => i + 1);
    }, 1500);
  };

  return (
    <div
      className="mx-auto max-w-2xl px-4 pt-20"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--text-secondary)" }}
      >
        <span>
          {qIndex + 1} / {questions.length}
        </span>
        {usingFallback ? (
          <span style={{ color: "var(--text-secondary)" }}>
            {isRTL ? "أسئلة جاهزة" : "Practice set"}
          </span>
        ) : (
          <span
            className="rounded-full px-2 py-0.5"
            style={{
              background:
                "color-mix(in srgb, var(--color-gold) 22%, transparent)",
              color: "var(--color-gold)",
            }}
          >
            ✨ AI
          </span>
        )}
      </div>

      <div
        className="rounded-2xl px-5 py-5"
        style={{
          background: "var(--bg-card)",
          border:
            "2px solid color-mix(in srgb, var(--color-gold) 35%, transparent)",
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
          {q.question}
        </h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.answers.map((label, idx) => {
          const isCorrectIdx = idx === q.correct;
          const isUserPick = selected === idx;
          let bg = "var(--bg-card)";
          let border = "color-mix(in srgb, var(--color-gold) 50%, transparent)";
          let color = "var(--text-primary)";
          if (feedback !== null) {
            if (isCorrectIdx) {
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
              onClick={() => handleAnswer(idx)}
              className="grid min-h-[64px] place-items-center rounded-2xl px-4 py-3 text-base font-bold disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              style={{
                background: bg,
                color,
                border: `2px solid ${border}`,
                boxShadow: "0 4px 14px var(--shadow)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback !== null && q.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-xl p-4 text-sm leading-relaxed"
            style={{
              background:
                "color-mix(in srgb, var(--color-gold) 14%, transparent)",
              color: "var(--text-primary)",
              border: "1px solid var(--color-gold)",
            }}
          >
            💡 {q.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
