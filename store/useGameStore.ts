import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Language = "en" | "ar";
type Theme = "day" | "night";
type Grade = 4 | 8 | null;
type CamelState = "idle" | "happy" | "sad" | "walking";

const TOP_LEVEL = 4;

interface GameState {
  // Global preferences (persisted)
  language: Language;
  theme: Theme;
  grade: Grade;
  soundEnabled: boolean;

  // Progress (persisted)
  currentLevel: number;
  unlockedLevels: number[];
  completedLevels: number[];

  // Score (persisted)
  totalDirhams: number;
  levelStars: Record<number, number>;
  levelDirhams: Record<number, number>;

  // Session (not persisted)
  currentQuestionIndex: number;
  currentScore: number;
  camelState: CamelState;

  // Actions
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setGrade: (grade: Grade) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  answerQuestion: (correct: boolean) => void;
  /** Pass the number of correctly answered questions (0–5). */
  completeLevel: (level: number, correct: number) => void;
  unlockLevel: (level: number) => void;
  setCamelState: (state: CamelState) => void;
  resetSession: () => void;
  resetAll: () => void;
}

const sessionDefaults = {
  currentQuestionIndex: 0,
  currentScore: 0,
  camelState: "idle" as CamelState,
};

const persistedDefaults = {
  language: "en" as Language,
  theme: "day" as Theme,
  grade: null as Grade,
  soundEnabled: true,
  currentLevel: 0,
  unlockedLevels: [0],
  completedLevels: [] as number[],
  totalDirhams: 0,
  levelStars: {} as Record<number, number>,
  levelDirhams: {} as Record<number, number>,
};

function starsFor(correct: number): number {
  if (correct <= 0) return 0;
  if (correct >= 5) return 3;
  if (correct >= 3) return 2;
  return 1;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...persistedDefaults,
      ...sessionDefaults,

      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),
      setGrade: (grade) => set({ grade }),

      toggleLanguage: () =>
        set((s) => ({ language: s.language === "en" ? "ar" : "en" })),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "day" ? "night" : "day" })),

      toggleSound: () =>
        set((s) => ({ soundEnabled: !s.soundEnabled })),

      answerQuestion: (correct) =>
        set((s) => ({
          currentScore: correct ? s.currentScore + 1 : s.currentScore,
          currentQuestionIndex: s.currentQuestionIndex + 1,
          camelState: correct ? "happy" : "sad",
        })),

      completeLevel: (level, correct) =>
        set((s) => {
          const stars = starsFor(correct);
          const dirhamsEarned = correct * 10;
          const prevStars = s.levelStars[level] ?? 0;
          const prevDirhams = s.levelDirhams[level] ?? 0;
          const newStars = Math.max(prevStars, stars);
          const newDirhams = Math.max(prevDirhams, dirhamsEarned);
          const dirhamsDelta = newDirhams - prevDirhams;
          const nextLevel = Math.min(TOP_LEVEL, level + 1);
          const isAdvance = level < TOP_LEVEL;

          return {
            completedLevels: s.completedLevels.includes(level)
              ? s.completedLevels
              : [...s.completedLevels, level],
            levelStars: { ...s.levelStars, [level]: newStars },
            levelDirhams: { ...s.levelDirhams, [level]: newDirhams },
            totalDirhams: s.totalDirhams + dirhamsDelta,
            currentLevel: Math.max(s.currentLevel, nextLevel),
            unlockedLevels:
              isAdvance && !s.unlockedLevels.includes(nextLevel)
                ? [...s.unlockedLevels, nextLevel]
                : s.unlockedLevels,
          };
        }),

      unlockLevel: (level) =>
        set((s) => ({
          unlockedLevels: s.unlockedLevels.includes(level)
            ? s.unlockedLevels
            : [...s.unlockedLevels, level],
        })),

      setCamelState: (camelState) => set({ camelState }),

      resetSession: () => set(sessionDefaults),

      resetAll: () =>
        set({ ...persistedDefaults, ...sessionDefaults, grade: null }),
    }),
    {
      name: "desert-quest-store",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (s) => ({
        language: s.language,
        theme: s.theme,
        grade: s.grade,
        soundEnabled: s.soundEnabled,
        currentLevel: s.currentLevel,
        unlockedLevels: s.unlockedLevels,
        completedLevels: s.completedLevels,
        totalDirhams: s.totalDirhams,
        levelStars: s.levelStars,
        levelDirhams: s.levelDirhams,
      }),
    }
  )
);
