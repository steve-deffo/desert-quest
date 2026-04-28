"use client";

import { motion } from "framer-motion";
import badges from "@/data/badges.json";
import { useGameStore } from "@/store/useGameStore";

interface BadgeCardProps {
  badgeId: string;
  onClick?: () => void;
}

export default function BadgeCard({ badgeId, onClick }: BadgeCardProps) {
  const language = useGameStore((s) => s.language);
  const grade = useGameStore((s) => s.grade);
  const unlockedBadges = useGameStore((s) => s.unlockedBadges);

  const badge = badges.find((item) => item.id === badgeId);
  if (!badge) return null;

  const unlocked = unlockedBadges.includes(badge.id);
  const localized = language === "ar" ? badge.ar : badge.en;
  const conditionText =
    badge.condition ??
    (language === "ar"
      ? "أكمل التحدي المرتبط بهذه الشارة"
      : "Complete the challenge tied to this badge");

  const isGrade8 = grade === 8;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group relative min-w-56 overflow-hidden p-4 text-left"
      style={{
        borderRadius: isGrade8 ? "1.25rem" : "1.5rem",
        clipPath: isGrade8
          ? "polygon(12% 0%, 88% 0%, 100% 26%, 100% 74%, 88% 100%, 12% 100%, 0% 74%, 0% 26%)"
          : "none",
        background: unlocked
          ? "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 18%, var(--bg-card)) 0%, var(--bg-card) 100%)"
          : "color-mix(in srgb, var(--bg-card) 75%, #6b7280 25%)",
        border: `1px solid ${unlocked ? "var(--color-gold)" : "color-mix(in srgb, var(--text-secondary) 40%, transparent)"}`,
        boxShadow: unlocked
          ? "0 12px 24px var(--shadow)"
          : "0 8px 16px color-mix(in srgb, #000 16%, transparent)",
      }}
      title={conditionText}
      aria-label={localized.name}
    >
      {!unlocked && (
        <span
          className="absolute right-3 top-3 text-lg"
          aria-hidden
        >
          🔒
        </span>
      )}

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="leading-none"
          style={{
            fontSize: unlocked ? 48 : 40,
            filter: unlocked ? "none" : "blur(4px) grayscale(1)",
          }}
        >
          {badge.emoji}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-base font-extrabold"
            style={{ color: unlocked ? "var(--text-primary)" : "var(--text-secondary)" }}
          >
            {unlocked ? localized.name : "???"}
          </p>
          <p
            className="mt-1 line-clamp-2 text-sm"
            style={{ color: unlocked ? "var(--text-secondary)" : "color-mix(in srgb, var(--text-secondary) 60%, transparent)" }}
          >
            {unlocked ? localized.desc : language === "ar" ? "تابع اللعب لفتحها" : "Keep playing to unlock"}
          </p>
        </div>
      </div>

      <span
        className="pointer-events-none absolute bottom-2 left-2 rounded-full px-2 py-1 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--bg-primary) 88%, transparent)",
          color: "var(--text-primary)",
          boxShadow: "0 4px 12px var(--shadow)",
        }}
      >
        {conditionText}
      </span>
    </motion.button>
  );
}
