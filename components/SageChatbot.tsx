"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore, type ChatMessage } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";
import AnimatedCamel from "./AnimatedCamel";

const HIDDEN_PATHS = [/^\/$/, /^\/login$/, /^\/reward\//];

function pathTopic(pathname: string | null): string {
  if (!pathname) return "general math";
  const m = pathname.match(/\/(?:lesson|quiz|reward)\/(\d+)/);
  if (!m) return "general math";
  const lvl = Number(m[1]);
  return ["addition & subtraction", "multiplication", "division", "fractions", "geometry"][lvl] ?? "general math";
}

export default function SageChatbot() {
  const pathname = usePathname();
  const { t, isRTL, language } = useTranslation();
  const grade = useGameStore((s) => s.grade);
  const chatHistory = useGameStore((s) => s.chatHistory);
  const appendChatMessage = useGameStore((s) => s.appendChatMessage);
  const clearChat = useGameStore((s) => s.clearChat);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Reset chat whenever the user navigates to a new lesson level
  const lessonMatch = pathname?.match(/^\/lesson\/(\d+)/);
  const lessonKey = lessonMatch ? lessonMatch[1] : null;
  useEffect(() => {
    if (lessonKey !== null) clearChat();
  }, [lessonKey, clearChat]);

  // Auto-scroll to newest
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [open, chatHistory.length, sending]);

  const isHidden = useMemo(
    () => HIDDEN_PATHS.some((re) => re.test(pathname ?? "")) || grade === null,
    [pathname, grade]
  );
  if (isHidden) return null;

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    playSound(Sounds.buttonClick);
    setDraft("");
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: text },
    ];
    appendChatMessage({ role: "user", content: text });
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          grade: grade ?? 4,
          currentTopic: pathTopic(pathname),
          language,
        }),
      });
      const data = (await res.json()) as { reply?: string; fallback?: boolean };
      const reply =
        data.fallback || !data.reply
          ? isRTL
            ? "زايد يستريح 🌙 حاول مجدداً بعد قليل"
            : "Zayed is resting 🌙 Try again in a moment"
          : data.reply;
      appendChatMessage({ role: "assistant", content: reply });
    } catch {
      appendChatMessage({
        role: "assistant",
        content: isRTL
          ? "زايد يستريح 🌙 حاول مجدداً بعد قليل"
          : "Zayed is resting 🌙 Try again in a moment",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          playSound(Sounds.buttonClick);
          setOpen(true);
        }}
        aria-label={isRTL ? "اسأل زايد" : "Ask Zayed"}
        className="fixed z-40 grid h-14 w-14 place-items-center rounded-full text-3xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        style={{
          [isRTL ? "left" : "right"]: 16,
          bottom: 88,
          background:
            "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
          color: "#1A1208",
        }}
      >
        🐪
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sage-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50"
            style={{ background: "var(--overlay)" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={isRTL ? "اسأل زايد" : "Ask Zayed"}
              className="absolute inset-y-0 flex w-full max-w-md flex-col"
              style={{
                [isRTL ? "left" : "right"]: 0,
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                borderInlineStart: "2px solid var(--color-gold)",
                boxShadow: "0 0 40px rgba(0,0,0,0.45)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-gold) 30%, transparent)",
                }}
              >
                <div className="flex items-center gap-2">
                  <AnimatedCamel size={40} state="idle" />
                  <span
                    className="text-base font-extrabold"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: isRTL
                        ? "var(--font-amiri), serif"
                        : "var(--font-reem-kufi), serif",
                    }}
                  >
                    {isRTL ? "اسأل زايد 🧙" : "Ask Zayed 🧙"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound(Sounds.buttonClick);
                    setOpen(false);
                  }}
                  aria-label={t("quiz.close")}
                  className="grid h-9 w-9 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  style={{
                    color: "var(--text-secondary)",
                    background:
                      "color-mix(in srgb, var(--bg-secondary) 50%, transparent)",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                {chatHistory.length === 0 && (
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: isRTL
                        ? "var(--font-amiri), serif"
                        : "var(--font-nunito), sans-serif",
                    }}
                  >
                    {isRTL
                      ? "مرحباً! أنا زايد. اسألني أي سؤال عن الرياضيات."
                      : "Hi there! I'm Zayed. Ask me anything about math."}
                  </p>
                )}
                {chatHistory.map((m, i) => (
                  <Bubble key={i} role={m.role} text={m.content} isRTL={isRTL} />
                ))}
                {sending && <TypingIndicator />}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex items-center gap-2 border-t px-3 py-3"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-gold) 30%, transparent)",
                }}
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    isRTL ? "اكتب سؤالك…" : "Type your question…"
                  }
                  disabled={sending}
                  className="flex-1 rounded-full px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
                    color: "var(--text-primary)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-gold) 30%, transparent)",
                    fontFamily: isRTL
                      ? "var(--font-amiri), serif"
                      : "var(--font-nunito), sans-serif",
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  aria-label={isRTL ? "إرسال" : "Send"}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
                    color: "#1A1208",
                  }}
                >
                  <span aria-hidden style={{ transform: isRTL ? "scaleX(-1)" : undefined, display: "inline-block" }}>
                    ➤
                  </span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({
  role,
  text,
  isRTL,
}: {
  role: "user" | "assistant";
  text: string;
  isRTL: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}
    >
      {!isUser && (
        <span aria-hidden className="shrink-0 self-end">
          <AnimatedCamel size={32} state="idle" />
        </span>
      )}
      <div
        className="max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
        style={{
          background: isUser
            ? "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))"
            : "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
          color: isUser ? "#1A1208" : "var(--text-primary)",
          fontFamily: isRTL
            ? "var(--font-amiri), serif"
            : "var(--font-nunito), sans-serif",
          boxShadow: "0 2px 8px var(--shadow)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <AnimatedCamel size={32} state="idle" />
      <span aria-hidden className="inline-flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--color-gold)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  );
}
