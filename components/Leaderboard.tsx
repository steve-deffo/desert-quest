"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import mockLeaderboard from "@/data/mockLeaderboard.json";
import { getProfile } from "@/lib/auth";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { toArabicNumerals } from "@/lib/utils";

type GradeTab = 4 | 8;

type BoardRow = {
  rank: number;
  name: string;
  avatar: string;
  dirhams: number;
  streak: number;
  grade: 4 | 8;
  isUser?: boolean;
};

export default function Leaderboard() {
  const { isRTL } = useTranslation();
  const totalDirhams = useGameStore((s) => s.totalDirhams);
  const streak = useGameStore((s) => s.streak);
  const grade = useGameStore((s) => s.grade);
  const profile = getProfile();

  const [activeTab, setActiveTab] = useState<GradeTab>(grade ?? 4);

  const rows = useMemo(() => {
    const filtered = (mockLeaderboard as BoardRow[]).filter(
      (row) => row.grade === activeTab
    );

    const withUser = [...filtered];
    if (profile) {
      withUser.push({
        rank: 0,
        name: profile.name,
        avatar: profile.avatar,
        dirhams: totalDirhams,
        streak,
        grade: profile.grade,
        isUser: true,
      });
    }

    const ranked = withUser
      .sort((a, b) => b.dirhams - a.dirhams)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return ranked;
  }, [activeTab, profile, totalDirhams, streak]);

  const podium = rows.slice(0, 3);
  const listRows = rows.filter((row) => row.rank > 3);

  return (
    <div
      className="min-h-screen px-4 pb-12 pt-6 sm:px-6"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-gold)" }}
          >
            Leaderboard / المتصدرون
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">🏆</h1>
        </header>

        <div className="mt-6 flex items-center justify-center gap-3">
          <FilterTab
            active={activeTab === 4}
            onClick={() => setActiveTab(4)}
            label="Grade 4 / الصف الرابع"
          />
          <FilterTab
            active={activeTab === 8}
            onClick={() => setActiveTab(8)}
            label="Grade 8 / الصف الثامن"
          />
        </div>

        <section className="mt-8 grid grid-cols-3 items-end gap-3">
          {[podium[1], podium[0], podium[2]].map((entry, index) => {
            if (!entry) {
              return <div key={index} className="h-40" />;
            }
            return (
              <PodiumCard
                key={entry.name + entry.rank}
                row={entry}
                order={index}
                place={entry.rank}
              />
            );
          })}
        </section>

        <section className="mt-8 space-y-2">
          {listRows.map((row, index) => (
            <motion.div
              key={`${row.name}-${row.rank}`}
              initial={{ opacity: 0, x: 42 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
              className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: row.isUser
                  ? "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 28%, var(--bg-card)) 0%, var(--bg-card) 100%)"
                  : "var(--bg-card)",
                border: row.isUser
                  ? "1px solid var(--color-gold)"
                  : "1px solid color-mix(in srgb, var(--text-secondary) 20%, transparent)",
              }}
            >
              <span className="text-sm font-extrabold">#{fmt(row.rank, isRTL)}</span>
              <span className="text-2xl" aria-hidden>{row.avatar}</span>
              <div>
                <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {row.name}
                </p>
                {row.isUser && (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      background: "var(--color-gold)",
                      color: "#1A1208",
                    }}
                  >
                    You / أنت
                  </span>
                )}
              </div>
              <span className="text-sm font-bold">🔥 {fmt(row.streak, isRTL)}</span>
              <span className="text-sm font-extrabold">💰 {fmt(row.dirhams, isRTL)}</span>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-bold"
      style={{
        background: active
          ? "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)"
          : "var(--bg-card)",
        color: active ? "#1A1208" : "var(--text-primary)",
        border: active
          ? "1px solid var(--color-gold)"
          : "1px solid color-mix(in srgb, var(--text-secondary) 28%, transparent)",
      }}
    >
      {label}
    </button>
  );
}

function PodiumCard({
  row,
  order,
  place,
}: {
  row: BoardRow;
  order: number;
  place: number;
}) {
  const heights: Record<number, string> = {
    1: "h-52",
    2: "h-44",
    3: "h-40",
  };

  const colors: Record<number, string> = {
    1: "linear-gradient(180deg, #F5D66A 0%, #D9A520 100%)",
    2: "linear-gradient(180deg, #ECEEF4 0%, #AAB2BF 100%)",
    3: "linear-gradient(180deg, #DFA26E 0%, #A5662F 100%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: order * 0.14, ease: "easeOut" }}
      className={`flex flex-col items-center justify-end rounded-t-3xl px-3 pb-3 ${heights[place] ?? "h-40"}`}
      style={{
        background: colors[place] ?? "var(--bg-card)",
        boxShadow: "0 16px 30px var(--shadow)",
      }}
    >
      <span className="text-5xl" aria-hidden>{row.avatar}</span>
      <p className="mt-2 text-sm font-extrabold" style={{ color: "#1A1208" }}>
        {row.name}
      </p>
      <p className="text-xs font-bold" style={{ color: "#1A1208" }}>
        💰 {row.dirhams}
      </p>
      {place === 1 && <span className="mt-1 text-xl">👑</span>}
    </motion.div>
  );
}

function fmt(value: number, isRTL: boolean): string {
  return isRTL ? toArabicNumerals(value) : String(value);
}
