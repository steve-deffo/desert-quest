"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { isLoggedIn } from "@/lib/auth";
import { useGameStore } from "@/store/useGameStore";
import { useHydration } from "@/lib/useHydration";
import BackButton from "@/components/ui/BackButton";
import PageLoader from "@/components/ui/PageLoader";

const ProgressReport = dynamic(() => import("@/components/ProgressReport"), {
  loading: () => <PageLoader />,
  ssr: false,
});

export default function ReportPage() {
  const router = useRouter();
  const grade = useGameStore((s) => s.grade);
  const ready = useHydration();

  useEffect(() => {
    if (!ready) return;
    if (grade === null) {
      router.replace("/");
      return;
    }
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [ready, grade, router]);

  if (!ready) return <PageLoader />;
  if (grade === null || !isLoggedIn()) return null;

  return (
    <>
      <BackButton href="/scoreboard" />
      <ProgressReport />
    </>
  );
}
