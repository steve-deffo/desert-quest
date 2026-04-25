"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import RewardScreen from "@/components/RewardScreen";

export default function RewardPage() {
  const { level: levelStr } = useParams<{ level: string }>();
  const level = Number.parseInt(levelStr, 10);
  const router = useRouter();
  const grade = useGameStore((s) => s.grade);
  const completedLevels = useGameStore((s) => s.completedLevels);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const validLevel = Number.isFinite(level) && level >= 0 && level <= 4;
  const completed = validLevel && completedLevels.includes(level);

  useEffect(() => {
    if (!mounted) return;
    if (grade === null) {
      router.replace("/");
      return;
    }
    if (!validLevel || !completed) {
      router.replace("/map");
    }
  }, [mounted, grade, validLevel, completed, router]);

  if (!mounted || grade === null || !validLevel || !completed) return null;

  return <RewardScreen level={level} grade={grade} />;
}
