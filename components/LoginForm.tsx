"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { saveProfile } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";

const AVATARS = ["🧒", "👦", "👧", "🧑", "👲", "👳", "🧕", "🤴"] as const;

export default function LoginForm() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const grade = useGameStore((s) => s.grade);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [nameFocused, setNameFocused] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && avatar.length > 0 && grade !== null,
    [avatar, grade, name]
  );

  if (grade === null) return null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    saveProfile(name.trim(), avatar, grade);
    playSound(Sounds.gradeSelect);
    router.push("/dashboard");
  };

  return (
    <div
      className="relative -mt-14 flex min-h-screen items-center justify-center overflow-hidden px-5 py-10"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <DuneBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl rounded-[2rem] p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, transparent), color-mix(in srgb, var(--bg-secondary) 8%, transparent))",
          border: "1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)",
          boxShadow: "0 24px 70px var(--shadow)",
        }}
      >
        <div className="text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.35em]"
            style={{ color: "var(--color-gold)" }}
          >
            DESERT QUEST
          </p>
          <h1
            className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl"
            style={{
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-reem-kufi), serif",
            }}
          >
            {t("login.title")}
            <span
              className="mt-2 block"
              style={{ color: "var(--color-gold)" }}
            >
              {t("login.titleAr")}
            </span>
          </h1>
          <p
            className="mt-4 text-sm sm:text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("login.helper")}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <label className="block">
            <span
              className="mb-2 block text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "var(--color-gold)" }}
            >
              {t("profile.student")}
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder={t("login.namePlaceholder")}
              className="h-14 w-full rounded-2xl border px-4 text-base outline-none"
              style={{
                background: "color-mix(in srgb, var(--bg-card) 88%, transparent)",
                color: "var(--text-primary)",
                borderColor: nameFocused
                  ? "var(--color-gold)"
                  : "color-mix(in srgb, var(--color-gold) 35%, transparent)",
                boxShadow: nameFocused
                  ? "0 0 0 4px color-mix(in srgb, var(--color-gold) 18%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            />
          </label>

          <div>
            <p
              className="mb-3 text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "var(--color-gold)" }}
            >
              {t("login.avatarTitle")}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((emoji) => {
                const selected = avatar === emoji;
                return (
                  <motion.button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      selected
                        ? { scale: 1.15, rotate: [0, -4, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{
                      type: "tween",
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="relative grid aspect-square place-items-center rounded-2xl text-3xl"
                    style={{
                      background: selected
                        ? "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 28%, transparent), color-mix(in srgb, var(--color-gold-light) 22%, transparent))"
                        : "color-mix(in srgb, var(--bg-card) 88%, transparent)",
                      border: selected
                        ? "2px solid var(--color-gold)"
                        : "1px solid color-mix(in srgb, var(--text-secondary) 28%, transparent)",
                      boxShadow: selected
                        ? "0 0 0 4px color-mix(in srgb, var(--color-gold) 22%, transparent), 0 18px 35px var(--shadow)"
                        : "0 10px 20px color-mix(in srgb, var(--shadow) 80%, transparent)",
                    }}
                  >
                    <span aria-hidden>{emoji}</span>
                    <AnimatePresence>
                      {selected && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full text-xs"
                          style={{
                            background: "var(--color-gold)",
                            color: "#1A1208",
                          }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-4"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 24%, transparent), color-mix(in srgb, var(--bg-card) 90%, transparent))",
              border:
                "1px solid color-mix(in srgb, var(--color-gold) 30%, transparent)",
            }}
          >
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.25em]"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("login.grade")}
              </p>
              <div
                className="mt-2 inline-flex rounded-full px-3 py-1 text-sm font-extrabold"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))",
                  color: "#1A1208",
                }}
              >
                {grade === 4 ? t("grade.4") : t("grade.8")}
              </div>
            </div>

            <Link
              href="/"
              className="text-sm font-bold underline underline-offset-4"
              style={{ color: "var(--color-gold)" }}
            >
              {t("login.change")}
            </Link>
          </div>

          <motion.button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            whileHover={canSubmit ? { scale: 1.01 } : undefined}
            whileTap={canSubmit ? { scale: 0.98 } : undefined}
            className="h-14 w-full rounded-full text-base font-extrabold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              color: "#1A1208",
              boxShadow: "0 18px 38px var(--shadow)",
              fontFamily: isRTL
                ? "var(--font-amiri), serif"
                : "var(--font-reem-kufi), serif",
            }}
          >
            {t("login.enter")} {isRTL ? "←" : "→"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function DuneBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--color-gold) 16%, transparent) 0%, transparent 28%), radial-gradient(circle at 85% 10%, color-mix(in srgb, var(--sky-top) 18%, transparent) 0%, transparent 22%), linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-secondary) 18%, transparent) 100%)",
        }}
      />
      <svg
        aria-hidden
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[42vh] w-full"
      >
        <path
          d="M0 320 Q180 260 330 310 T690 300 T1040 315 T1200 290 L1200 600 L0 600 Z"
          fill="color-mix(in srgb, var(--dune-color) 68%, transparent)"
        />
        <path
          d="M0 390 Q150 330 330 390 T700 365 T1040 398 T1200 372 L1200 600 L0 600 Z"
          fill="color-mix(in srgb, var(--bg-secondary) 78%, transparent)"
        />
      </svg>
    </>
  );
}
