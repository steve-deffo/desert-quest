"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import Scoreboard from "@/components/Scoreboard";
import BackButton from "@/components/ui/BackButton";
import { isLoggedIn } from "@/lib/auth";

export default function ScoreboardPage() {
  const router = useRouter();
  const grade = useGameStore((s) => s.grade);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (grade === null) {
      router.replace("/");
      return;
    }
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [mounted, grade, router]);

  if (!mounted || grade === null || !isLoggedIn()) return null;

  return (
    <>
      <BackButton href="/map" />
      <Scoreboard />
    </>
  );
}
