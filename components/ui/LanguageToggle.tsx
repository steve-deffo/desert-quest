"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { Sounds, playSound } from "@/lib/sounds";

export default function LanguageToggle() {
  const language = useGameStore((s) => s.language);
  const toggleLanguage = useGameStore((s) => s.toggleLanguage);
  const isAr = language === "ar";
  const label = isAr ? "عر" : "EN";

  return (
    <button
      type="button"
      onClick={() => {
        playSound(Sounds.buttonClick);
        toggleLanguage();
      }}
      title="EN / عر"
      aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
      className="relative grid h-11 min-w-[64px] place-items-center rounded-full px-3 text-sm font-bold text-[var(--text-primary)] transition-shadow hover:shadow-[0_0_18px_var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-card), var(--bg-secondary))",
        boxShadow: "inset 0 0 0 1px var(--color-gold)",
        perspective: 600,
      }}
    >
      <span className="grid grid-cols-[auto_1fr_auto] items-center gap-1">
        <span aria-hidden className="text-[var(--color-gold)]">
          🌐
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={language}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="inline-block"
            style={{
              fontFamily: isAr
                ? "var(--font-amiri), serif"
                : "var(--font-nunito), sans-serif",
              transformStyle: "preserve-3d",
            }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
