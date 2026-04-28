"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { isLoggedIn } from "@/lib/auth";
import { useGameStore } from "@/store/useGameStore";

export default function LoginPage() {
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
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [mounted, grade, router]);

  if (!mounted || grade === null || isLoggedIn()) return null;

  return <LoginForm />;
}
