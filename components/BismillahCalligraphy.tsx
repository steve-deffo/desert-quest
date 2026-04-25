"use client";

import { motion } from "framer-motion";

export default function BismillahCalligraphy({
  width = 280,
  height = 64,
  delay = 0,
}: {
  width?: number;
  height?: number;
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 480 110"
      width={width}
      height={height}
      role="img"
      aria-label="بسم الله"
      className="overflow-visible"
    >
      <motion.text
        x="240"
        y="74"
        textAnchor="middle"
        fontFamily="var(--font-amiri), serif"
        fontSize="72"
        fontWeight={700}
        fill="var(--color-gold)"
        stroke="var(--color-gold)"
        strokeWidth={1.2}
        pathLength={1}
        initial={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          fillOpacity: 0,
        }}
        animate={{
          strokeDashoffset: 0,
          fillOpacity: 1,
        }}
        transition={{
          strokeDashoffset: { duration: 2, ease: "easeInOut", delay },
          fillOpacity: {
            duration: 0.8,
            ease: "easeIn",
            delay: delay + 1.6,
          },
        }}
        style={{
          filter:
            "drop-shadow(0 0 6px color-mix(in srgb, var(--color-gold) 60%, transparent))",
        }}
      >
        بسم الله
      </motion.text>
    </svg>
  );
}
