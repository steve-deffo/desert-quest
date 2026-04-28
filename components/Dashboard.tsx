"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import lessons from "@/data/lessons.json";
import landmarks from "@/data/landmarks.json";
import badges from "@/data/badges.json";
import { getProfile, type Profile } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import type { Lang, Landmark, LessonData } from "@/lib/types";
import { toArabicNumerals } from "@/lib/utils";
import { useGameStore } from "@/store/useGameStore";
import BadgeCard from "@/components/BadgeCard";

const TOTAL_LEVELS = 5;

export default function Dashboard() {
  const { t, isRTL, language } = useTranslation();
  const lang = language as Lang;
  const profile = getProfile();
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const completedLevels = useGameStore((s) => s.completedLevels);
  const totalDirhams = useGameStore((s) => s.totalDirhams);
  const levelStars = useGameStore((s) => s.levelStars);
  const streak = useGameStore((s) => s.streak);
  const bestStreak = useGameStore((s) => s.bestStreak);
  const weekActivity = useGameStore((s) => s.weekActivity);
  const unlockedBadges = useGameStore((s) => s.unlockedBadges);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const performanceHistory = useGameStore((s) => s.performanceHistory);
  const getWeakTopics = useGameStore((s) => s.getWeakTopics);
  const getStrongTopics = useGameStore((s) => s.getStrongTopics);
  const updateStreak = useGameStore((s) => s.updateStreak);

  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  if (!profile) return null;

  const firstName = profile.name.trim().split(/\s+/)[0] ?? profile.name;
  const greeting = getGreetingKey(t, new Date().getHours());

  const totalStars = useMemo(
    () => Object.values(levelStars).reduce((sum, value) => sum + (value ?? 0), 0),
    [levelStars]
  );

  const weakTopics = useMemo(() => getWeakTopics(), [getWeakTopics, performanceHistory]);
  const strongTopics = useMemo(() => getStrongTopics(), [getStrongTopics, performanceHistory]);

  const nextLevel = unlockedLevels.find((level) => !completedLevels.includes(level));
  const nextLesson = (lessons as LessonData[]).find(
    (lesson) => lesson.level === nextLevel && lesson.grade === profile.grade
  );
  const nextLandmark = (landmarks as Landmark[]).find(
    (landmark) => landmark.level === nextLevel
  );
  const completedCount = completedLevels.length;
  const currentTopic = topicForLevel(profile.grade, currentLevel);

  const recommendation = useMemo(() => {
    const weakTopic = weakTopics[0];
    if (weakTopic) {
      const targetLevel = clampLevel(topicToLevel(profile.grade, weakTopic) ?? currentLevel);
      const topicLabel = formatTopicLabel(weakTopic, language as Lang);
      return {
        title: language === "ar" ? "خطة ذكية" : "Adaptive Plan",
        body:
          language === "ar"
            ? `لنقوّي ${topicLabel}. دقتك فيه أقل من 60٪، فمراجعة سريعة سترفع نتيجتك.`
            : `Let's strengthen ${topicLabel}. Your accuracy is below 60%, so a quick review will boost your score.`,
        cta: language === "ar" ? "تدرّب الآن" : "Practice now",
        href: `/lesson/${targetLevel}`,
      };
    }

    const isStrongInCurrentTopic =
      !!currentTopic && strongTopics.some((topic) => topicsMatch(topic, currentTopic));
    if (isStrongInCurrentTopic) {
      const suggestedLevel =
        nextLevel !== undefined ? clampLevel(nextLevel) : clampLevel(currentLevel + 1);
      return {
        title: language === "ar" ? "مستوى أعلى" : "Level Up",
        body:
          language === "ar"
            ? "أداءك قوي جدًا في موضوع هذا المستوى (أكثر من 80٪). جاهز للتحدي التالي."
            : "You're scoring above 80% in this level topic. You're ready for the next challenge.",
        cta: language === "ar" ? "انتقل للمستوى التالي" : "Go to next level",
        href: `/lesson/${suggestedLevel}`,
      };
    }

    return {
      title: language === "ar" ? "استمرار التعلّم" : "Keep Learning",
      body:
        language === "ar"
          ? "استمر في المسار الحالي. المراجعة المنتظمة ستثبّت المهارات خطوة بخطوة."
          : "Stay on your current track. Consistent practice will steadily improve your mastery.",
      cta: language === "ar" ? "تابع درسك" : "Continue lesson",
      href: `/lesson/${clampLevel(currentLevel)}`,
    };
  }, [
    weakTopics,
    strongTopics,
    currentTopic,
    profile.grade,
    currentLevel,
    nextLevel,
    language,
  ]);

  const selectedBadge = badges.find((badge) => badge.id === selectedBadgeId);

  return (
    <div
      className="min-h-screen px-4 pb-12 pt-6 sm:px-6"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <GreetingCard
          profile={profile}
          greeting={`${greeting} ${firstName}!`}
          hero={t("dashboard.hero")}
          subtext={t("dashboard.subtext")}
          isRTL={isRTL}
        />

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <StreakCard
            streak={streak}
            bestStreak={bestStreak}
            weekActivity={weekActivity}
            label={t("dashboard.streak")}
            isRTL={isRTL}
          />
          <ProgressCard
            completedCount={completedCount}
            totalDirhams={totalDirhams}
            totalStars={totalStars}
            progressLabel={t("dashboard.progressTitle")}
            completedLabel={t("dashboard.completed")}
            dirhamsLabel={t("dashboard.totalDirhams")}
            starsLabel={t("dashboard.totalStars")}
            isRTL={isRTL}
          />
        </div>

        <ContinueCard
          title={t("dashboard.continueTitle")}
          cta={t("dashboard.continue")}
          allComplete={t("dashboard.allComplete")}
          levelLabel={t("dashboard.level")}
          lessonLabel={t("dashboard.lesson")}
          nextStopLabel={t("dashboard.nextStop")}
          nextLevel={nextLevel}
          nextLesson={nextLesson}
          nextLandmark={nextLandmark}
          lang={lang}
          isRTL={isRTL}
        />

        <BadgesSection
          unlockedCount={unlockedBadges.length}
          isRTL={isRTL}
          onOpenBadge={(badgeId) => setSelectedBadgeId(badgeId)}
        />

        <RecommendationCard
          title={recommendation.title}
          body={recommendation.body}
          cta={recommendation.cta}
          href={recommendation.href}
          isRTL={isRTL}
        />

        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href="/map"
            className="inline-flex h-14 w-full max-w-md items-center justify-center rounded-full px-6 text-base font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
              boxShadow: "0 16px 34px var(--shadow)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-reem-kufi), serif",
            }}
          >
            {t("dashboard.goToMap")}
          </Link>

          <Link
            href="/leaderboard"
            className="inline-flex h-12 w-full max-w-md items-center justify-center rounded-full px-5 text-sm font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, #f59e0b 55%, var(--color-gold)) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
              boxShadow: "0 10px 22px var(--shadow)",
            }}
          >
            🏆 Leaderboard / المتصدرون
          </Link>

          <Link
            href="/practice"
            className="inline-flex h-12 w-full max-w-md items-center justify-center rounded-full px-5 text-sm font-extrabold"
            style={{
              background: "transparent",
              color: "var(--color-gold)",
              border: "2px solid var(--color-gold)",
            }}
          >
            🎯 {isRTL ? "وضع التدريب" : "Practice Mode"}
          </Link>

          <Link
            href="/history"
            className="text-sm font-bold underline underline-offset-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("dashboard.viewHistory")}
          </Link>
        </div>
      </div>

      <BadgeBottomSheet
        badgeId={selectedBadge?.id ?? null}
        onClose={() => setSelectedBadgeId(null)}
      />
    </div>
  );
}

function GreetingCard({
  profile,
  greeting,
  hero,
  subtext,
  isRTL,
}: {
  profile: Profile;
  greeting: string;
  hero: string;
  subtext: string;
  isRTL: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--sky-top) 10%, var(--bg-card)) 0%, color-mix(in srgb, var(--color-gold) 12%, var(--bg-card)) 100%)",
        border: "1px solid color-mix(in srgb, var(--color-gold) 35%, transparent)",
        boxShadow: "0 24px 60px var(--shadow)",
      }}
    >
      <div
        aria-hidden
        className="absolute right-5 top-5 text-6xl sm:text-7xl"
        style={{ filter: "drop-shadow(0 10px 20px var(--shadow))" }}
      >
        {profile.avatar}
      </div>
      <div className="relative max-w-2xl">
        <p
          className="text-sm font-bold uppercase tracking-[0.32em]"
          style={{ color: "var(--color-gold)" }}
        >
          {greeting}
        </p>
        <h1
          className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl"
          style={{
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-reem-kufi), serif",
          }}
        >
          {hero}
        </h1>
        <p
          className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtext}
        </p>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 900 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-24 w-full opacity-70"
      >
        <path
          d="M0 110 Q140 75 280 110 T560 108 T900 95 L900 220 L0 220 Z"
          fill="color-mix(in srgb, var(--dune-color) 55%, transparent)"
        />
        <path
          d="M0 150 Q160 112 320 146 T620 150 T900 128 L900 220 L0 220 Z"
          fill="color-mix(in srgb, var(--bg-secondary) 65%, transparent)"
        />
      </svg>
    </motion.section>
  );
}

function StreakCard({
  streak,
  bestStreak,
  weekActivity,
  label,
  isRTL,
}: {
  streak: number;
  bestStreak: number;
  weekActivity: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  label: string;
  isRTL: boolean;
}) {
  const flameHeight = streak >= 7 ? 80 : streak >= 3 ? 60 : 40;
  const todayIndex = (new Date().getDay() + 6) % 7;

  const weekLabels = isRTL
    ? ["ن", "ث", "ر", "خ", "ج", "س", "ح"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <CardShell delay={0.08}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-end gap-4">
          <motion.svg
            viewBox="0 0 80 120"
            className="w-12"
            animate={{ height: flameHeight }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{ overflow: "visible" }}
            aria-hidden
          >
            <defs>
              <linearGradient id="flameGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <motion.path
              d="M40 8 C58 28, 68 44, 62 68 C57 89, 44 108, 28 108 C14 108, 6 95, 9 77 C12 59, 25 45, 30 30 C34 19, 36 12, 40 8 Z"
              fill="url(#flameGrad)"
              animate={{ scaleX: [1, 1.04, 0.98, 1.02, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "40px 90px" }}
            />
          </motion.svg>

          <div>
            <p className="text-3xl font-extrabold">{fmtNumber(streak, isRTL)}</p>
            <p style={{ color: "var(--text-secondary)" }}>
              {fmtNumber(streak, isRTL)} {label}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl px-3 py-2 text-right"
          style={{
            background: "color-mix(in srgb, var(--color-gold) 16%, transparent)",
          }}
        >
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-secondary)" }}>
            Best
          </p>
          <p className="text-lg font-extrabold">{fmtNumber(bestStreak, isRTL)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {weekActivity.map((active, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <motion.span
              className="h-3.5 w-3.5 rounded-full border"
              style={{
                background: active ? "#F5B301" : "transparent",
                borderColor: active
                  ? "#F5B301"
                  : "color-mix(in srgb, var(--text-secondary) 42%, transparent)",
                boxShadow:
                  idx === todayIndex
                    ? "0 0 0 4px color-mix(in srgb, #F5B301 22%, transparent)"
                    : "none",
              }}
              animate={
                idx === todayIndex
                  ? { scale: [1, 1.18, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-bold" style={{ color: "var(--text-secondary)" }}>
              {weekLabels[idx]}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function ProgressCard({
  completedCount,
  totalDirhams,
  totalStars,
  progressLabel,
  completedLabel,
  dirhamsLabel,
  starsLabel,
  isRTL,
}: {
  completedCount: number;
  totalDirhams: number;
  totalStars: number;
  progressLabel: string;
  completedLabel: string;
  dirhamsLabel: string;
  starsLabel: string;
  isRTL: boolean;
}) {
  const size = 142;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = completedCount / TOTAL_LEVELS;

  return (
    <CardShell delay={0.15}>
      <div className="flex flex-col items-center gap-4 text-center">
        <p
          className="text-xs font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--color-gold)" }}
        >
          {progressLabel}
        </p>
        <div className="relative grid place-items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="color-mix(in srgb, var(--text-secondary) 18%, transparent)"
              strokeWidth="12"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="12"
              strokeLinecap="round"
              style={{ rotate: -90, transformOrigin: "50% 50%" }}
              initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
              animate={{
                strokeDasharray: circumference,
                strokeDashoffset: circumference - circumference * progress,
              }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-extrabold">
              {fmtNumber(completedCount, isRTL)}/{fmtNumber(TOTAL_LEVELS, isRTL)}
            </p>
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: "var(--text-secondary)" }}
            >
              {completedLabel}
            </p>
          </div>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <MetricPill
            label={dirhamsLabel}
            value={fmtNumber(totalDirhams, isRTL)}
            icon="⭐"
          />
          <MetricPill
            label={starsLabel}
            value={fmtNumber(totalStars, isRTL)}
            icon="✦"
          />
        </div>
      </div>
    </CardShell>
  );
}

function ContinueCard({
  title,
  cta,
  allComplete,
  levelLabel,
  lessonLabel,
  nextStopLabel,
  nextLevel,
  nextLesson,
  nextLandmark,
  lang,
  isRTL,
}: {
  title: string;
  cta: string;
  allComplete: string;
  levelLabel: string;
  lessonLabel: string;
  nextStopLabel: string;
  nextLevel: number | undefined;
  nextLesson: LessonData | undefined;
  nextLandmark: Landmark | undefined;
  lang: Lang;
  isRTL: boolean;
}) {
  const done = nextLevel === undefined || !nextLesson;
  const titleText = done ? allComplete : nextLesson[lang].title;
  const href = done ? "/history" : `/lesson/${nextLevel}`;

  return (
    <CardShell delay={0.24}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="grid h-16 w-16 place-items-center rounded-3xl text-3xl"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 18%, transparent), color-mix(in srgb, var(--sky-top) 12%, transparent))",
            }}
          >
            {done ? "🏆" : nextLandmark?.emoji ?? "📍"}
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.28em]"
              style={{ color: "var(--color-gold)" }}
            >
              {title}
            </p>
            <h2
              className="mt-2 text-2xl font-extrabold"
              style={{
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-reem-kufi), serif",
              }}
            >
              {titleText}
            </h2>
            {!done && (
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {nextStopLabel} · {lessonLabel} · {levelLabel}{" "}
                {fmtNumber((nextLevel ?? 0) + 1, isRTL)}
              </p>
            )}
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-extrabold"
          style={{
            background:
              "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
            color: "#1A1208",
            boxShadow: "0 12px 26px var(--shadow)",
          }}
        >
          {done ? allComplete : `${cta} ${isRTL ? "←" : "→"}`}
        </Link>
      </div>
    </CardShell>
  );
}

function BadgesSection({
  unlockedCount,
  isRTL,
  onOpenBadge,
}: {
  unlockedCount: number;
  isRTL: boolean;
  onOpenBadge: (badgeId: string) => void;
}) {
  return (
    <CardShell delay={0.28}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-gold)" }}
          >
            Badges / الشارات
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {fmtNumber(unlockedCount, isRTL)}/15
          </p>
        </div>
      </div>

      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {badges.map((badge) => (
          <div key={badge.id} className="snap-start">
            <BadgeCard badgeId={badge.id} onClick={() => onOpenBadge(badge.id)} />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function BadgeBottomSheet({
  badgeId,
  onClose,
}: {
  badgeId: string | null;
  onClose: () => void;
}) {
  const language = useGameStore((s) => s.language);
  const unlockedBadges = useGameStore((s) => s.unlockedBadges);
  const badge = badges.find((item) => item.id === badgeId);
  if (!badge) return null;

  const localized = language === "ar" ? badge.ar : badge.en;
  const unlocked = unlockedBadges.includes(badge.id);

  return (
    <AnimatePresence>
      <motion.div
        key={`${badge.id}-overlay`}
        className="fixed inset-0 z-[105]"
        style={{ background: "rgba(0,0,0,0.45)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        key={`${badge.id}-sheet`}
        className="fixed inset-x-0 bottom-0 z-[106] mx-auto w-full max-w-3xl rounded-t-[2rem] px-5 pb-8 pt-5"
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)",
          boxShadow: "0 -18px 46px rgba(0,0,0,0.35)",
        }}
        initial={{ y: 320 }}
        animate={{ y: 0 }}
        exit={{ y: 320 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mx-auto h-1.5 w-14 rounded-full bg-[color:var(--text-secondary)] opacity-50" />

        <div className="mt-4 flex items-start gap-4">
          <span className="text-6xl leading-none" aria-hidden>
            {badge.emoji}
          </span>
          <div>
            <h3 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {localized.name}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {localized.desc}
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              {badge.condition ?? "Complete the required challenge / أكمل التحدي المطلوب"}
            </p>
            <p className="mt-2 text-xs font-bold" style={{ color: unlocked ? "#16A34A" : "#64748B" }}>
              {unlocked ? "Unlocked / مفتوحة" : "Locked / مقفلة"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-bold"
          style={{
            background: "color-mix(in srgb, var(--color-gold) 22%, transparent)",
            color: "var(--text-primary)",
            border: "1px solid var(--color-gold)",
          }}
        >
          Close / إغلاق
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function RecommendationCard({
  title,
  body,
  cta,
  href,
  isRTL,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  isRTL: boolean;
}) {
  return (
    <CardShell delay={0.32}>
      <div className="flex items-start gap-4">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
          style={{
            background:
              "color-mix(in srgb, var(--color-gold) 18%, transparent)",
          }}
        >
          💡
        </div>
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.28em]"
            style={{ color: "var(--color-gold)" }}
          >
            {title}
          </p>
          <p
            className="mt-2 text-base"
            style={{
              color: "var(--text-primary)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-nunito), sans-serif",
            }}
          >
            {body}
          </p>
          <Link
            href={href}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
            }}
          >
            {cta} {isRTL ? "←" : "→"}
          </Link>
        </div>
      </div>
    </CardShell>
  );
}

function normalizeTopic(topic: string) {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function topicsMatch(left: string, right: string) {
  return normalizeTopic(left) === normalizeTopic(right);
}

function topicToLevel(grade: 4 | 8, topic: string): number | undefined {
  const key = normalizeTopic(topic);
  const grade4Map: Record<string, number> = {
    addition: 0,
    multiplication: 1,
    fractions: 2,
    geometry: 3,
    measurement: 4,
    subtraction: 0,
    division: 1,
  };
  const grade8Map: Record<string, number> = {
    linearequations: 0,
    ratios: 1,
    ratiospercentages: 1,
    exponents: 2,
    algebra: 2,
    geometry: 3,
    dataanalysis: 4,
    statistics: 4,
  };
  return grade === 4 ? grade4Map[key] : grade8Map[key];
}

function topicForLevel(grade: 4 | 8, level: number): string | undefined {
  const grade4Topics = ["addition", "multiplication", "fractions", "geometry", "measurement"];
  const grade8Topics = ["linear-equations", "ratios", "exponents", "geometry", "data-analysis"];
  return (grade === 4 ? grade4Topics : grade8Topics)[level];
}

function formatTopicLabel(topic: string, lang: Lang): string {
  const key = normalizeTopic(topic);
  const labels: Record<string, { en: string; ar: string }> = {
    addition: { en: "Addition", ar: "الجمع" },
    multiplication: { en: "Multiplication", ar: "الضرب" },
    fractions: { en: "Fractions", ar: "الكسور" },
    geometry: { en: "Geometry", ar: "الهندسة" },
    measurement: { en: "Measurement", ar: "القياس" },
    subtraction: { en: "Subtraction", ar: "الطرح" },
    division: { en: "Division", ar: "القسمة" },
    linearequations: { en: "Linear Equations", ar: "المعادلات الخطية" },
    ratios: { en: "Ratios", ar: "النِّسَب" },
    ratiospercentages: { en: "Ratios", ar: "النِّسَب" },
    exponents: { en: "Exponents", ar: "الأسس" },
    algebra: { en: "Exponents", ar: "الأسس" },
    dataanalysis: { en: "Data Analysis", ar: "تحليل البيانات" },
    statistics: { en: "Data Analysis", ar: "تحليل البيانات" },
  };
  const label = labels[key];
  if (!label) return topic;
  return lang === "ar" ? label.ar : label.en;
}

function clampLevel(level: number): number {
  return Math.max(0, Math.min(TOTAL_LEVELS - 1, level));
}

function CardShell({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut", delay }}
      className="rounded-[1.75rem] p-5 sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, transparent), color-mix(in srgb, var(--bg-secondary) 10%, transparent))",
        border: "1px solid color-mix(in srgb, var(--color-gold) 25%, transparent)",
        boxShadow: "0 18px 42px var(--shadow)",
      }}
    >
      {children}
    </motion.section>
  );
}

function MetricPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3 text-left"
      style={{
        background: "color-mix(in srgb, var(--bg-secondary) 14%, transparent)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p className="mt-2 text-xl font-extrabold">
        <span aria-hidden>{icon} </span>
        {value}
      </p>
    </div>
  );
}

function fmtNumber(value: number, isRTL: boolean) {
  return isRTL ? toArabicNumerals(value) : String(value);
}

function getGreetingKey(t: (key: string) => string, hour: number) {
  if (hour >= 6 && hour < 12) return t("dashboard.morning");
  if (hour >= 12 && hour < 17) return t("dashboard.afternoon");
  return t("dashboard.evening");
}
