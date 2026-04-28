"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import HistoryView from "@/components/HistoryView";
import BackButton from "@/components/ui/BackButton";
import { useGameStore } from "@/store/useGameStore";

export default function HistoryPage() {
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
      <BackButton href="/dashboard" />
      <HistoryView />
    </>
  );
}
