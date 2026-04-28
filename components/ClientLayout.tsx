"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import NavBar from "@/components/ui/NavBar";
import SandTransition from "@/components/SandTransition";
import SageChatbot from "@/components/SageChatbot";

const TITLES: Record<"en" | "ar", string> = {
  en: "Desert Quest — La Caravane des Nombres",
  ar: "رحلة الصحراء — قافلة الأرقام",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useGameStore((s) => s.language);
  const theme = useGameStore((s) => s.theme);
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === "ar" ? "rtl" : "ltr";
    document.title = TITLES[language];
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <SandTransition />
      <NavBar />
      <main className="flex min-h-screen flex-col pt-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-1 flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <SageChatbot />
    </>
  );
}
