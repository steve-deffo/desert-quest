"use client";

import { motion } from "framer-motion";
import landmarks from "@/data/landmarks.json";
import AnimatedCamel from "@/components/AnimatedCamel";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import type { AdaptiveDifficulty, Lang, Landmark } from "@/lib/types";

const MAX_STARS = 3;

export default function HistoryView() {
  const { isRTL, language, t } = useTranslation();
  const lang = language as Lang;
  const quizHistory = useGameStore((s) => s.quizHistory);
  const bestStreak = useGameStore((s) => s.bestStreak);

  const totalQuizzes = quizHistory.length;
  const averagePercent =
    totalQuizzes === 0
      ? 0
      : Math.round(
          quizHistory.reduce((sum, q) => sum + (q.score / 5) * 100, 0) /
            totalQuizzes
        );
  const totalTimeSeconds = quizHistory.reduce(
    (sum, q) => sum + q.timeSpentSeconds,
    0
  );

  const fmtNum = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  return (
    <div
      className="min-h-screen px-4 pb-12 pt-20 sm:px-6 sm:pt-16"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-6xl">
        <h1
          className="text-center text-3xl font-extrabold sm:text-4xl"
          style={{
            color: "var(--color-gold)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
          }}
        >
          {t("dashboard.viewHistory")}
        </h1>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label={isRTL ? "إجمالي الاختبارات" : "Total quizzes"}
            value={fmtNum(totalQuizzes)}
          />
          <StatCard
            label={isRTL ? "متوسط النتيجة" : "Average score"}
            value={`${fmtNum(averagePercent)}%`}
          />
          <StatCard
            label={isRTL ? "أفضل سلسلة" : "Best streak"}
            value={`${fmtNum(bestStreak)} ${isRTL ? "يوم" : "days"}`}
          />
          <StatCard
            label={isRTL ? "إجمالي الوقت" : "Total time"}
            value={formatDuration(totalTimeSeconds, isRTL)}
          />
        </section>

        {quizHistory.length === 0 ? (
          <section className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
            <AnimatedCamel size={112} />
            <p
              className="text-base sm:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              {isRTL
                ? "لا يوجد سجل بعد. ابدأ مغامرتك!"
                : "No history yet. Start your adventure!"}
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-3">
            {quizHistory.map((attempt, index) => {
              const landmark = (landmarks as Landmark[]).find(
                (entry) => entry.level === attempt.level
              );
              const difficultyLabel = getDifficultyLabel(attempt.difficulty, isRTL);
              return (
                <motion.article
                  key={attempt.id}
                  initial={{ opacity: 0, x: 44 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.36, delay: index * 0.06, ease: "easeOut" }}
                  whileHover={{ y: -3 }}
                  className="group relative overflow-hidden rounded-2xl px-4 py-4"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid color-mix(in srgb, var(--color-gold) 24%, transparent)",
                    boxShadow: "0 10px 24px var(--shadow)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 transition-colors"
                    style={{ background: "transparent" }}
                  />
                  <style>{`.group:hover > span { background: var(--color-gold); }`}</style>

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <div className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                      {formatHistoryDate(attempt.date, language)}
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-sm font-extrabold sm:text-base">
                        <span aria-hidden>{landmark?.emoji ?? "📍"}</span>
                        <span>{t(`level.${attempt.level}`)}</span>
                      </p>
                      <span
                        className="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-gold) 18%, transparent)",
                          color: "var(--text-primary)",
                          border:
                            "1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)",
                        }}
                      >
                        {difficultyLabel}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold">
                        {fmtNum(attempt.score)}/{fmtNum(5)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {renderStars(attempt.stars)} · +{fmtNum(attempt.dirhamsEarned)} {isRTL ? "د.إ" : "AED"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {isRTL ? "الوقت: " : "Time: "}
                    {formatDuration(attempt.timeSpentSeconds, isRTL)}
                  </p>
                </motion.article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{
        background: "var(--bg-card)",
        border: "1px solid color-mix(in srgb, var(--color-gold) 24%, transparent)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p className="mt-2 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function formatHistoryDate(dateIso: string, language: string): string {
  const locale = language === "ar" ? "ar-AE" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateIso));
}

function formatDuration(totalSeconds: number, isRTL: boolean): string {
  if (totalSeconds < 60) {
    return isRTL ? "< ١ دقيقة" : "< 1m";
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    return isRTL ? `${toArabicNumerals(totalMinutes)}د` : `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (isRTL) {
    return `${toArabicNumerals(hours)}س ${toArabicNumerals(minutes)}د`;
  }
  return `${hours}h ${minutes}m`;
}

function getDifficultyLabel(difficulty: AdaptiveDifficulty, isRTL: boolean): string {
  if (difficulty === "easy") return isRTL ? "سهل" : "Easy";
  if (difficulty === "hard") return isRTL ? "صعب" : "Hard";
  return isRTL ? "متوسط" : "Medium";
}

function renderStars(stars: number): string {
  return Array.from({ length: MAX_STARS })
    .map((_, idx) => (idx < stars ? "★" : "☆"))
    .join("");
}
