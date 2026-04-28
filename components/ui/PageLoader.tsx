"use client";

import { motion } from "framer-motion";
import AnimatedCamel from "@/components/AnimatedCamel";
import { useTranslation } from "@/lib/i18n";

export default function PageLoader() {
  const { t, isRTL } = useTranslation();
  return (
    <motion.div
      role="status"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="grid min-h-screen w-full place-items-center"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-col items-center gap-4">
        <AnimatedCamel size={80} state="idle" />
        <div className="flex items-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--color-gold)" }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <p
          className="text-sm font-bold"
          style={{
            color: "var(--text-secondary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {t("general.loading")}
        </p>
      </div>
    </motion.div>
  );
}
