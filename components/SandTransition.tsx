"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sounds, playSound } from "@/lib/sounds";

export default function SandTransition() {
  const pathname = usePathname();
  const [sweepKey, setSweepKey] = useState<string | null>(null);
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    setSweepKey(`${pathname}-${Date.now()}`);
    playSound(Sounds.pageTransition);
    const timeout = setTimeout(() => setSweepKey(null), 550);
    return () => clearTimeout(timeout);
  }, [pathname, firstRender]);

  return (
    <AnimatePresence>
      {sweepKey && (
        <motion.div
          key={sweepKey}
          className="pointer-events-none fixed inset-0 z-50"
          aria-hidden
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--dune-color) 30%, var(--color-gold-light) 50%, var(--dune-color) 70%, transparent 100%)",
              boxShadow: "0 0 80px var(--color-gold)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
