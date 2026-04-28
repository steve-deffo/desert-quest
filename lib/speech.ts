"use client";

export const Speech = {
  isSupported(): boolean {
    return (
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  },

  speak(text: string, lang: "en" | "ar") {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
      utterance.rate = lang === "ar" ? 0.8 : 0.85;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  },

  stop() {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  },
};
