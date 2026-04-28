"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { isLoggedIn } from "@/lib/auth";
import { useGameStore } from "@/store/useGameStore";

export default function DashboardPage() {
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

  return <Dashboard />;
}
