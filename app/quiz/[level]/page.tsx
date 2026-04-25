"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import QuizCard from "@/components/QuizCard";
import Starfield from "@/components/Starfield";
import BackButton from "@/components/ui/BackButton";

export default function QuizPage() {
  const { level: levelStr } = useParams<{ level: string }>();
  const level = Number.parseInt(levelStr, 10);
  const router = useRouter();
  const { t, isRTL } = useTranslation();

  const grade = useGameStore((s) => s.grade);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const validLevel =
    Number.isFinite(level) && level >= 0 && level <= 4;
  const allowed = validLevel && unlockedLevels.includes(level);

  useEffect(() => {
    if (!mounted) return;
    if (grade === null) {
      router.replace("/");
      return;
    }
    if (!allowed) {
      router.replace("/map");
    }
  }, [mounted, grade, allowed, router]);

  if (!mounted || grade === null || !allowed) return null;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Starfield count={60} topRange={70} />
      <BackButton href={`/lesson/${level}`} />
      <div className="relative mx-auto max-w-3xl px-3 pt-4">
        <p
          className="text-center text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          {t(`level.${level}`)}
        </p>
      </div>
      <QuizCard level={level} grade={grade} />
    </div>
  );
}
