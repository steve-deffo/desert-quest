"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { clearProfile } from "@/lib/auth";
import AnimatedCamel from "./AnimatedCamel";
import { Sounds, playSound } from "@/lib/sounds";

export default function ChangeGradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const resetAll = useGameStore((s) => s.resetAll);
  const { t, isRTL } = useTranslation();

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleConfirm = () => {
    playSound(Sounds.buttonClick);
    clearProfile();
    resetAll();
    onClose();
    router.push("/?returning=1");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cg-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          style={{ background: "var(--overlay)" }}
          onClick={onClose}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <motion.div
            key="cg-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cg-title"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-t-3xl rounded-b-3xl p-6 shadow-2xl sm:rounded-3xl"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "2px solid var(--color-gold)",
            }}
          >
            <div className="mb-2 flex justify-center">
              <AnimatedCamel state="sad" size={84} />
            </div>
            <h2
              id="cg-title"
              className="text-center text-xl font-extrabold sm:text-2xl"
              style={{
                color: "var(--color-gold)",
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-reem-kufi), serif",
              }}
            >
              {t("modal.changeGrade.title")}
            </h2>
            <p
              className="mt-3 text-center text-sm leading-relaxed"
              style={{
                color: "var(--text-secondary)",
                fontFamily: isRTL
                  ? "var(--font-amiri), serif"
                  : "var(--font-nunito), sans-serif",
              }}
            >
              {t("modal.changeGrade.warning")}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  playSound(Sounds.buttonClick);
                  onClose();
                }}
                className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "2px solid color-mix(in srgb, var(--text-secondary) 40%, transparent)",
                }}
              >
                {t("modal.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-wrong)]"
                style={{
                  background: "var(--color-wrong)",
                  color: "white",
                  boxShadow: "0 4px 14px rgba(244, 67, 54, 0.45)",
                }}
              >
                {t("modal.changeGrade.confirm")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
