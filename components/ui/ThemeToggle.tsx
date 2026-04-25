"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";

const Sun = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const Moon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const theme = useGameStore((s) => s.theme);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const { t } = useTranslation();
  const isNight = theme === "night";

  return (
    <button
      type="button"
      onClick={() => {
        playSound(Sounds.buttonClick);
        toggleTheme();
      }}
      title={t("nav.theme")}
      aria-label={t("nav.theme")}
      className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-[var(--text-primary)] transition-shadow hover:shadow-[0_0_18px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-card), var(--bg-secondary))",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isNight ? "sun" : "moon"}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 grid place-items-center"
          style={{ color: isNight ? "#FDD835" : "#1A1208" }}
        >
          {isNight ? <Sun /> : <Moon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
