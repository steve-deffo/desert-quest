"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import Scoreboard from "@/components/Scoreboard";
import BackButton from "@/components/ui/BackButton";

export default function ScoreboardPage() {
  const router = useRouter();
  const grade = useGameStore((s) => s.grade);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && grade === null) {
      router.replace("/");
    }
  }, [mounted, grade, router]);

  if (!mounted || grade === null) return null;

  return (
    <>
      <BackButton href="/map" />
      <Scoreboard />
    </>
  );
}
