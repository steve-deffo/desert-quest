"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { getProfile, type Profile } from "@/lib/auth";
import { toArabicNumerals } from "@/lib/utils";
import { Sounds, playSound } from "@/lib/sounds";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import SoundToggle from "./SoundToggle";
import ChangeGradeModal from "@/components/ChangeGradeModal";

export default function NavBar() {
  const pathname = usePathname();
  const { t, isRTL } = useTranslation();
  const grade = useGameStore((s) => s.grade);
  const totalDirhams = useGameStore((s) => s.totalDirhams);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Hidden on the grade-select onboarding screen and before client hydration
  const hidden =
    !mounted || pathname === "/" || pathname === "/login" || grade === null;

  useEffect(() => {
    if (!mounted) return;
    setProfile(getProfile());
  }, [mounted, pathname]);

  useEffect(() => {
    if (!profileOpen && !menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [profileOpen, menuOpen]);

  return (
    <>
      {!hidden && (
        <motion.header
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-40 h-14 border-b backdrop-blur-md"
          style={{
            background:
              "color-mix(in srgb, var(--bg-card) 75%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--color-gold) 35%, transparent)",
            color: "var(--text-primary)",
          }}
        >
          <div
            className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3 px-4"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Logo / title */}
            <Link
              href="/dashboard"
              onClick={() => playSound(Sounds.buttonClick)}
              className="flex items-center gap-2 text-base font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="text-xl" aria-hidden>
                🐪
              </span>
              <span
                style={{
                  fontFamily: isRTL
                    ? "var(--font-amiri), serif"
                    : "var(--font-reem-kufi), sans-serif",
                  color: "var(--color-gold)",
                }}
                className="hidden sm:inline"
              >
                {t("home.title")}
              </span>
            </Link>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  playSound(Sounds.buttonClick);
                  setProfileOpen((open) => !open);
                }}
                title={profile?.name ?? t("grade.change")}
                aria-label={profile?.name ?? t("grade.change")}
                className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-bold transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                  color: "#1A1208",
                  boxShadow: "0 2px 8px var(--shadow)",
                }}
              >
                <span className="text-lg" aria-hidden>
                  {profile?.avatar ?? "🐪"}
                </span>
                <span className="max-w-24 truncate">
                  {firstName(profile?.name) ?? (grade === 4 ? "G4" : "G8")}
                </span>
              </button>

              {profileOpen && profile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-14 z-50 w-64 rounded-3xl p-4 shadow-2xl"
                  style={{
                    [isRTL ? "right" : "left"]: 0,
                    background: "var(--bg-card)",
                    border: "1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)",
                    boxShadow: "0 18px 40px var(--shadow)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-gold) 18%, transparent)",
                      }}
                    >
                      {profile.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-base font-extrabold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {profile.name}
                      </p>
                      <p
                        className="mt-1 text-xs uppercase tracking-[0.22em]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {t("profile.student")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <ProfileMeta
                      label={t("profile.grade")}
                      value={profile.grade === 4 ? t("grade.4") : t("grade.8")}
                    />
                    <ProfileMeta
                      label={t("profile.joined")}
                      value={formatJoinedDate(profile.createdAt, isRTL)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSound(Sounds.buttonClick);
                      setProfileOpen(false);
                      setModalOpen(true);
                    }}
                    className="mt-4 inline-flex h-10 items-center rounded-full px-4 text-xs font-bold uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-gold) 18%, transparent)",
                      color: "var(--text-primary)",
                      boxShadow: "inset 0 0 0 1px var(--color-gold)",
                    }}
                  >
                    {t("profile.changeGrade")}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <div className="relative sm:hidden" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-gold) 16%, transparent)",
                    color: "var(--text-primary)",
                    border: "1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)",
                  }}
                  aria-label="Mobile menu"
                >
                  ☰
                </button>

                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-12 z-50 w-56 rounded-2xl p-3"
                    style={{
                      [isRTL ? "left" : "right"]: 0,
                      background: "var(--bg-card)",
                      border: "1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)",
                      boxShadow: "0 16px 32px var(--shadow)",
                    }}
                  >
                    <MobileLink href="/dashboard" label="Dashboard / الرئيسية" onPick={() => setMenuOpen(false)} />
                    <MobileLink href="/map" label="Map / الخريطة" onPick={() => setMenuOpen(false)} />
                    <MobileLink href="/history" label="History / السجل" onPick={() => setMenuOpen(false)} />
                    <MobileLink href="/leaderboard" label="Leaderboard / المتصدرون" onPick={() => setMenuOpen(false)} />
                  </motion.div>
                )}
              </div>

              <ThemeToggle />
              <SoundToggle />
              <LanguageToggle />
              <DirhamCount value={totalDirhams} isRTL={isRTL} />
            </div>
          </div>
        </motion.header>
      )}

      {/* Change-grade modal lives outside the header so it stays visible
          when the modal is opened from elsewhere too */}
      <ChangeGradeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function MobileLink({
  href,
  label,
  onPick,
}: {
  href: string;
  label: string;
  onPick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        playSound(Sounds.buttonClick);
        onPick();
      }}
      className="block rounded-xl px-3 py-2 text-sm font-bold"
      style={{ color: "var(--text-primary)" }}
    >
      {label}
    </Link>
  );
}

function DirhamCount({ value, isRTL }: { value: number; isRTL: boolean }) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <div
      className="hidden items-center gap-1 rounded-full px-3 py-1 text-sm font-bold sm:flex"
      style={{
        background: "color-mix(in srgb, var(--color-gold) 18%, transparent)",
        color: "var(--text-primary)",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
      }}
      aria-label="Dirhams"
    >
      <span aria-hidden>⭐</span>
      <motion.span>{rounded}</motion.span>
      <span
        className="text-xs opacity-80"
        style={{
          fontFamily: isRTL ? "var(--font-amiri), serif" : "inherit",
        }}
      >
        {isRTL ? "د.إ" : "AED"}
      </span>
      {isRTL && <span className="sr-only">{toArabicNumerals(value)}</span>}
    </div>
  );
}

function firstName(name?: string) {
  if (!name) return null;
  return name.trim().split(/\s+/)[0] ?? null;
}

function formatJoinedDate(value: string, isRTL: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(isRTL ? "ar-AE" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProfileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2"
      style={{
        background: "color-mix(in srgb, var(--bg-secondary) 18%, transparent)",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="text-right font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}
