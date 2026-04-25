"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";

export default function BackButton({
  href,
  label,
}: {
  href: string;
  label?: string;
}) {
  const { t, isRTL } = useTranslation();
  const text = label ?? t("nav.back");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="absolute z-30"
      style={{
        top: 68,
        [isRTL ? "right" : "left"]: 12,
      }}
    >
      <Link
        href={href}
        onClick={() => playSound(Sounds.buttonClick)}
        aria-label={text}
        className="inline-flex h-11 items-center gap-2 rounded-full px-3 font-bold transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] hover:shadow-[0_0_18px_var(--color-gold)]"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "2px solid var(--color-gold)",
          boxShadow: "0 4px 12px var(--shadow)",
        }}
      >
        <motion.span
          aria-hidden
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="grid h-7 w-7 place-items-center"
          style={{
            color: "var(--color-gold)",
            transform: isRTL ? "scaleX(-1)" : undefined,
            display: "inline-grid",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </motion.span>
        <span className="hidden text-sm sm:inline">{text}</span>
      </Link>
    </motion.div>
  );
}
