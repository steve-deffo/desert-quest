import { useGameStore } from "@/store/useGameStore";
import en from "./en.json";
import ar from "./ar.json";

const translations = { en, ar };

export function useTranslation() {
  const language = useGameStore((s) => s.language);
  const t = (key: string): string =>
    (translations[language] as Record<string, string>)[key] ?? key;
  const isRTL = language === "ar";
  return { t, isRTL, language };
}
