"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";

const SoundOnIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SoundOffIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

export default function SoundToggle() {
  const enabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const { t } = useTranslation();

  const handleClick = () => {
    // Play tick on enable; never on disable (since we're about to mute)
    if (!enabled) {
      // We're about to enable; flip first, then play
      toggleSound();
      // Play after the store update so playSound reads the new value
      requestAnimationFrame(() => playSound(Sounds.buttonClick));
    } else {
      toggleSound();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t("nav.sound")}
      aria-label={`${t("nav.sound")}: ${enabled ? "on" : "off"}`}
      aria-pressed={enabled}
      className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-[var(--text-primary)] transition-shadow hover:shadow-[0_0_18px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-card), var(--bg-secondary))",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={enabled ? "on" : "off"}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.2, 1], opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="absolute inset-0 grid place-items-center"
          style={{
            color: enabled ? "var(--color-gold)" : "var(--text-secondary)",
          }}
        >
          {enabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
