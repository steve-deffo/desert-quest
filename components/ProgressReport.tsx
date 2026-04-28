"use client";

import { useEffect, useMemo, useState } from "react";
import badges from "@/data/badges.json";
import { getProfile } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";
import { useGameStore } from "@/store/useGameStore";

export default function ProgressReport() {
  const { isRTL, language, t } = useTranslation();
  const profile = getProfile();
  const completedLevels = useGameStore((s) => s.completedLevels);
  const levelStars = useGameStore((s) => s.levelStars);
  const totalDirhams = useGameStore((s) => s.totalDirhams);
  const streak = useGameStore((s) => s.streak);
  const unlockedBadges = useGameStore((s) => s.unlockedBadges);
  const quizHistory = useGameStore((s) => s.quizHistory);
  const getWeakTopics = useGameStore((s) => s.getWeakTopics);
  const getStrongTopics = useGameStore((s) => s.getStrongTopics);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiReportIsAi, setAiReportIsAi] = useState(false);
  const [aiReportLoading, setAiReportLoading] = useState(true);

  const grade = profile?.grade ?? 4;
  const starsTotal = Object.values(levelStars).reduce((sum, n) => sum + (n ?? 0), 0);
  const completedCount = completedLevels.length;
  const progressPercent = Math.round((completedCount / 5) * 100);
  const totalTimeSpent = quizHistory.reduce((sum, q) => sum + q.timeSpentSeconds, 0);
  const weakTopics = getWeakTopics();

  const topicCatalog = useMemo(() => {
    if (grade === 4) {
      return [
        { id: "addition", en: "Addition", ar: "الجمع" },
        { id: "multiplication", en: "Multiplication", ar: "الضرب" },
        { id: "fractions", en: "Fractions", ar: "الكسور" },
        { id: "geometry", en: "Geometry", ar: "الهندسة" },
        { id: "measurement", en: "Measurement", ar: "القياس" },
      ];
    }
    return [
      { id: "linear-equations", en: "Linear Equations", ar: "المعادلات الخطية" },
      { id: "ratios-percentages", en: "Ratios", ar: "النِّسَب" },
      { id: "algebra", en: "Exponents", ar: "الأسس" },
      { id: "geometry", en: "Geometry", ar: "الهندسة" },
      { id: "statistics", en: "Data Analysis", ar: "تحليل البيانات" },
    ];
  }, [grade]);

  const topicPerformance = useMemo(() => {
    return topicCatalog.map((topic) => {
      const entries = quizHistory.filter((attempt) =>
        normalizeTopic(attempt.topicId) === normalizeTopic(topic.id)
      );
      if (!entries.length) {
        return {
          ...topic,
          attempted: false,
          accuracy: 0,
          status: "none" as const,
        };
      }
      const accuracy = Math.round(
        entries.reduce((sum, e) => sum + (e.score / 5) * 100, 0) / entries.length
      );
      const status = accuracy > 75 ? "good" : accuracy >= 50 ? "warn" : "bad";
      return {
        ...topic,
        attempted: true,
        accuracy,
        status,
      };
    });
  }, [quizHistory, topicCatalog]);

  const recent = quizHistory.slice(0, 5);
  const earnedBadgeRows = badges.filter((badge) => unlockedBadges.includes(badge.id));
  const strongTopics = getStrongTopics();
  const avgScorePct = quizHistory.length
    ? Math.round(
        quizHistory.reduce((sum, e) => sum + (e.score / 5) * 100, 0) /
          quizHistory.length
      )
    : 0;

  useEffect(() => {
    let active = true;
    setAiReportLoading(true);
    setAiReportIsAi(false);
    (async () => {
      try {
        const totalTime = formatDuration(totalTimeSpent, isRTL);
        const res = await fetch("/api/ai/report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: profile?.name ?? (isRTL ? "الطالب" : "Student"),
            grade,
            language,
            completedLevels: completedCount,
            totalLevels: 5,
            avgScorePct,
            strongTopics,
            weakTopics,
            streak,
            unlockedBadges: unlockedBadges.length,
            totalBadges: badges.length,
            totalTime,
          }),
        });
        const data = (await res.json()) as {
          report?: string;
          fallback?: boolean;
        };
        if (!active) return;
        if (data.fallback || !data.report) {
          setAiReport(null);
          setAiReportIsAi(false);
        } else {
          setAiReport(data.report);
          setAiReportIsAi(true);
        }
      } catch {
        if (!active) return;
        setAiReport(null);
        setAiReportIsAi(false);
      } finally {
        if (active) setAiReportLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // Re-fetch only if the data that goes into the report changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    grade,
    language,
    profile?.name,
    completedCount,
    avgScorePct,
    streak,
    unlockedBadges.length,
  ]);

  const monthYear = new Intl.DateTimeFormat(language === "ar" ? "ar-AE" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const fmt = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  return (
    <div
      className="min-h-screen px-4 pb-12 pt-20 sm:px-6 sm:pt-16"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{`
        @media print {
          html, body {
            background: #fff !important;
            color: #111 !important;
            font-size: 12pt !important;
          }
          header.fixed,
          a[href="/scoreboard"],
          .no-print {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
          }
          .report-root {
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
          }
          .print-section {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>

      <div
        className="report-root mx-auto w-full max-w-5xl rounded-3xl border px-5 py-6 sm:px-8"
        style={{
          background: "var(--bg-card)",
          borderColor: "color-mix(in srgb, var(--color-gold) 30%, transparent)",
          boxShadow: "0 20px 40px var(--shadow)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-extrabold sm:text-3xl"
              style={{
                color: "var(--color-gold)",
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-reem-kufi), serif",
              }}
            >
              🐪 Desert Quest — {isRTL ? "تقرير التقدم" : "Progress Report"}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {isRTL ? "الطالب" : "Student"}: {profile?.name ?? "-"} {profile?.avatar ?? "🐪"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("login.grade")} {grade} · {monthYear}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print rounded-full px-4 py-2 text-sm font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
            }}
          >
            {isRTL ? "تصدير كـ PDF" : "Export as PDF"}
          </button>
        </div>

        <section className="mt-6 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--color-gold) 20%, transparent)" }}>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            {isRTL ? "التقدم العام" : "OVERALL PROGRESS"}
          </h2>

          <div className="mt-3">
            <div className="mb-2 flex justify-between text-sm">
              <span>{fmt(completedCount)}/{fmt(5)} {isRTL ? "مستويات" : "levels"}</span>
              <span>{fmt(progressPercent)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--text-secondary) 20%, transparent)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
                }}
              />
            </div>
          </div>

          <p className="mt-4 text-sm">
            ⭐ {fmt(starsTotal)}/{fmt(15)} &nbsp; 💰 {fmt(totalDirhams)} {isRTL ? "د.إ" : "AED"} &nbsp; 🔥 {fmt(streak)} {isRTL ? "يوم" : "days"}
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            ⏱ {isRTL ? "إجمالي الوقت" : "Total time spent"}: {formatDuration(totalTimeSpent, isRTL)}
          </p>
        </section>

        <section className="print-section mt-6 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--color-gold) 20%, transparent)" }}>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            {isRTL ? "أداء الموضوعات" : "TOPIC PERFORMANCE"}
          </h2>

          <div className="mt-4 space-y-3">
            {topicPerformance.map((topic) => {
              const label = isRTL ? topic.ar : topic.en;
              const icon =
                topic.status === "good" ? "✓" : topic.status === "warn" ? "△" : topic.status === "bad" ? "✗" : "•";
              return (
                <div key={topic.id} className="rounded-xl px-3 py-2" style={{ background: topic.attempted ? "color-mix(in srgb, var(--bg-secondary) 12%, transparent)" : "color-mix(in srgb, var(--text-secondary) 10%, transparent)" }}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span style={{ color: topic.attempted ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</span>
                    <span className="font-bold" style={{ color: topic.attempted ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      {topic.attempted ? `${fmt(topic.accuracy)}%` : (isRTL ? "غير مُجرّب" : "Not attempted")} {icon}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--text-secondary) 20%, transparent)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${topic.attempted ? topic.accuracy : 0}%`,
                        background:
                          topic.status === "good"
                            ? "#16A34A"
                            : topic.status === "warn"
                              ? "#F59E0B"
                              : "#DC2626",
                        opacity: topic.attempted ? 1 : 0.35,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="print-section mt-6 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--color-gold) 20%, transparent)" }}>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            {isRTL ? "الشارات المكتسبة" : "BADGES EARNED"} ({fmt(earnedBadgeRows.length)}/15)
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 text-3xl">
            {earnedBadgeRows.length ? (
              earnedBadgeRows.map((badge) => (
                <span key={badge.id} title={(language === "ar" ? badge.ar.name : badge.en.name) ?? badge.id}>
                  {badge.emoji}
                </span>
              ))
            ) : (
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {isRTL ? "لا توجد شارات بعد" : "No badges yet"}
              </span>
            )}
          </div>
        </section>

        <section className="print-section mt-6 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--color-gold) 20%, transparent)" }}>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            {isRTL ? "النشاط الأخير" : "RECENT ACTIVITY"}
          </h2>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ color: "var(--text-secondary)" }}>
                  <th className="px-2 py-1 text-left">{isRTL ? "التاريخ" : "Date"}</th>
                  <th className="px-2 py-1 text-left">{isRTL ? "المستوى" : "Level"}</th>
                  <th className="px-2 py-1 text-left">{isRTL ? "النتيجة" : "Score"}</th>
                  <th className="px-2 py-1 text-left">{isRTL ? "النجوم" : "Stars"}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-2 py-1">{formatDate(attempt.date, language)}</td>
                    <td className="px-2 py-1">{t(`level.${attempt.level}`)}</td>
                    <td className="px-2 py-1">{fmt(attempt.score)}/{fmt(5)}</td>
                    <td className="px-2 py-1">{fmt(attempt.stars)}/{fmt(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="print-section mt-6 rounded-2xl border p-4"
          style={{
            borderColor: "color-mix(in srgb, var(--color-gold) 20%, transparent)",
          }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--color-gold)" }}
            >
              {isRTL ? "التوصية" : "RECOMMENDATION"}
            </h2>
            {aiReportIsAi && !aiReportLoading && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold no-print"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-gold) 22%, transparent)",
                  color: "var(--color-gold)",
                }}
              >
                ✨ AI-Generated Analysis
              </span>
            )}
          </div>
          {aiReportLoading ? (
            <div className="mt-3 space-y-2">
              <div className="dq-skeleton h-3 w-full rounded" />
              <div className="dq-skeleton h-3 w-11/12 rounded" />
              <div className="dq-skeleton h-3 w-9/12 rounded" />
            </div>
          ) : aiReport ? (
            <p
              className="mt-3 whitespace-pre-line text-sm leading-relaxed"
              style={{
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-nunito), sans-serif",
              }}
            >
              {aiReport}
            </p>
          ) : (
            <p className="mt-3 text-sm">
              {weakTopics.length
                ? isRTL
                  ? `يحتاج الطالب إلى مراجعة: ${weakTopics.join("، ")}`
                  : `Needs reinforcement in: ${weakTopics.join(", ")}`
                : isRTL
                  ? "تقدم رائع بشكل عام! 🌟"
                  : "Great progress overall! 🌟"}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function normalizeTopic(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, "");
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

function formatDate(dateIso: string, language: string): string {
  return new Intl.DateTimeFormat(language === "ar" ? "ar-AE" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateIso));
}
