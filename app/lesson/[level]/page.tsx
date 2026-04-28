"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useScroll } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { useHydration } from "@/lib/useHydration";
import LessonCard from "@/components/LessonCard";
import BackButton from "@/components/ui/BackButton";
import PageLoader from "@/components/ui/PageLoader";
import Starfield from "@/components/Starfield";
import { isLoggedIn } from "@/lib/auth";

export default function LessonPage() {
  const { level: levelStr } = useParams<{ level: string }>();
  const level = Number.parseInt(levelStr, 10);
  const router = useRouter();
  const { isRTL } = useTranslation();
  const { scrollYProgress } = useScroll();

  const grade = useGameStore((s) => s.grade);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);
  const ready = useHydration();

  const validLevel = Number.isFinite(level) && level >= 0 && level <= 4;
  const allowed = validLevel && unlockedLevels.includes(level);

  useEffect(() => {
    if (!ready) return;
    if (grade === null) {
      router.replace("/");
      return;
    }
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (!allowed) {
      router.replace("/map");
    }
  }, [ready, grade, allowed, router]);

  if (!ready) return <PageLoader />;
  if (grade === null || !isLoggedIn() || !allowed) return null;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Lesson reading-progress bar — sits above NavBar */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left"
        style={{
          scaleX: scrollYProgress,
          background:
            "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
          boxShadow: "0 0 8px var(--color-gold)",
        }}
      />
      <Starfield count={60} topRange={70} />
      <BackButton href="/map" />
      <LessonCard level={level} grade={grade} />
    </div>
  );
}
