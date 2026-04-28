import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import badges from "@/data/badges.json";
import type { AdaptiveDifficulty, QuizAttempt } from "@/lib/types";

type Language = "en" | "ar";
type Theme = "day" | "night";
type Grade = 4 | 8 | null;
type CamelState = "idle" | "happy" | "sad" | "walking";

const TOP_LEVEL = 4;

export interface GameState {
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
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  weekActivity: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  unlockedBadges: string[];
  pendingBadge: string | null;
  completedQuizInNight: boolean;
  completedQuizInArabic: boolean;
  hasComebackCorrect: boolean;
  performanceHistory: PerformanceEntry[];
  quizHistory: QuizAttempt[];
  camelAnimatedToLevel: number;

  // Hydration flag (not persisted) — flipped to true once persist
  // middleware has rehydrated from localStorage on the client
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Sage chatbot session
  chatHistory: ChatMessage[];
  appendChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Session (not persisted)
  currentQuestionIndex: number;
  currentScore: number;
  camelState: CamelState;
  currentReview: ReviewEntry[];
  quizAttempts: number;

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
  addQuizAttempt: (attempt: QuizAttempt) => void;
  unlockLevel: (level: number) => void;
  setCamelState: (state: CamelState) => void;
  setCamelAnimatedToLevel: (level: number) => void;
  recordReview: (entry: ReviewEntry) => void;
  markReviewCorrected: (questionIndex: number) => void;
  updatePerformance: (
    topic: string,
    correct: boolean,
    difficulty: AdaptiveDifficulty
  ) => void;
  getTopicAccuracy: (topic: string) => number;
  getWeakTopics: () => string[];
  getStrongTopics: () => string[];
  updateStreak: () => void;
  checkAndUnlockBadges: () => void;
  clearPendingBadge: () => void;
  resetSession: () => void;
  resetAll: () => void;
}

interface ReviewEntry {
  questionIndex: number;
  userAnswerIndex: number;
  isCorrect: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PerformanceEntry {
  topic: string;
  correct: boolean;
  date: string;
  difficulty: AdaptiveDifficulty;
}

const sessionDefaults = {
  currentQuestionIndex: 0,
  currentScore: 0,
  camelState: "idle" as CamelState,
  currentReview: [] as ReviewEntry[],
  quizAttempts: 0,
  chatHistory: [] as ChatMessage[],
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
  streak: 0,
  bestStreak: 0,
  lastActiveDate: "",
  weekActivity: [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ] as [boolean, boolean, boolean, boolean, boolean, boolean, boolean],
  unlockedBadges: [] as string[],
  pendingBadge: null as string | null,
  completedQuizInNight: false,
  completedQuizInArabic: false,
  hasComebackCorrect: false,
  performanceHistory: [] as PerformanceEntry[],
  quizHistory: [] as QuizAttempt[],
  camelAnimatedToLevel: -1,
};

type BadgeDef = (typeof badges)[number];

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYmd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(fromYmd: string, toYmd: string): number | null {
  const from = parseYmd(fromYmd);
  const to = parseYmd(toYmd);
  if (!from || !to) return null;
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / 86400000);
}

function mondayBasedIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function meetsCondition(state: GameState, badge: BadgeDef): boolean {
  switch (badge.id) {
    case "first_step":
      return state.completedLevels.length >= 1;
    case "halfway":
      return state.completedLevels.length >= 3;
    case "desert_master":
      return state.completedLevels.length >= 5;
    case "perfect_quiz":
      return Object.values(state.levelStars).some((stars) => stars >= 3);
    case "gold_collector":
      return state.totalDirhams >= 200;
    case "streak_3":
      return state.streak >= 3;
    case "streak_7":
      return state.streak >= 7;
    case "math_adder":
      return state.completedLevels.includes(0);
    case "multiplier":
      return state.completedLevels.includes(1);
    case "divider":
      return state.completedLevels.includes(2);
    case "fraction_hero":
      return state.completedLevels.includes(3);
    case "geometry_pro":
      return state.completedLevels.includes(4);
    case "night_owl":
      return state.completedQuizInNight;
    case "bilingual":
      return state.completedQuizInArabic;
    case "comeback_kid":
      return state.hasComebackCorrect;
    default:
      return false;
  }
}

function normalizeTopic(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function starsFor(correct: number): number {
  if (correct <= 0) return 0;
  if (correct >= 5) return 3;
  if (correct >= 3) return 2;
  return 1;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...persistedDefaults,
      ...sessionDefaults,
      // Hydration flag is intentionally OUTSIDE both default groups so that
      // resetSession() and resetAll() can't accidentally flip it back to
      // false — flipping it false would freeze every page that gates on
      // useHydration() behind a permanent PageLoader.
      _hasHydrated: false,

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

      completeLevel: (level, correct) => {
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
            completedQuizInNight: s.completedQuizInNight || s.theme === "night",
            completedQuizInArabic:
              s.completedQuizInArabic || s.language === "ar",
          };
        });
        get().checkAndUnlockBadges();
      },

      addQuizAttempt: (attempt) => {
        set((s) => ({
          quizHistory: [attempt, ...s.quizHistory].slice(0, 100),
        }));
        get().updateStreak();
      },

      unlockLevel: (level) =>
        set((s) => ({
          unlockedLevels: s.unlockedLevels.includes(level)
            ? s.unlockedLevels
            : [...s.unlockedLevels, level],
        })),

      setCamelState: (camelState) => set({ camelState }),

      setCamelAnimatedToLevel: (camelAnimatedToLevel) =>
        set({ camelAnimatedToLevel }),

      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

      appendChatMessage: (msg) =>
        set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),

      recordReview: (entry) =>
        set((s) => {
          const existingIdx = s.currentReview.findIndex(
            (r) => r.questionIndex === entry.questionIndex
          );
          if (existingIdx === -1) {
            return { currentReview: [...s.currentReview, entry] };
          }
          const next = [...s.currentReview];
          next[existingIdx] = entry;
          return { currentReview: next };
        }),

      markReviewCorrected: (questionIndex) => {
        set((s) => {
          const entry = s.currentReview.find(
            (r) => r.questionIndex === questionIndex
          );
          if (!entry || entry.isCorrect) return s;
          return {
            currentReview: s.currentReview.map((r) =>
              r.questionIndex === questionIndex
                ? { ...r, isCorrect: true }
                : r
            ),
            currentScore: s.currentScore + 1,
            hasComebackCorrect: true,
          };
        });
        get().checkAndUnlockBadges();
      },

      updatePerformance: (topic, correct, difficulty) =>
        set((s) => {
          const next = [
            ...s.performanceHistory,
            {
              topic,
              correct,
              difficulty,
              date: new Date().toISOString(),
            },
          ];
          return {
            performanceHistory: next.slice(-50),
          };
        }),

      getTopicAccuracy: (topic) => {
        const key = normalizeTopic(topic);
        const entries = get().performanceHistory.filter(
          (entry) => normalizeTopic(entry.topic) === key
        );
        if (!entries.length) return 50;
        const correctCount = entries.filter((entry) => entry.correct).length;
        return Math.round((correctCount / entries.length) * 100);
      },

      getWeakTopics: () => {
        const byTopic = new Map<string, { topic: string; correct: number; total: number }>();
        for (const entry of get().performanceHistory) {
          const key = normalizeTopic(entry.topic);
          const current = byTopic.get(key) ?? {
            topic: entry.topic,
            correct: 0,
            total: 0,
          };
          current.total += 1;
          if (entry.correct) current.correct += 1;
          current.topic = entry.topic;
          byTopic.set(key, current);
        }
        return Array.from(byTopic.values())
          .filter((group) => Math.round((group.correct / group.total) * 100) < 60)
          .map((group) => group.topic);
      },

      getStrongTopics: () => {
        const byTopic = new Map<string, { topic: string; correct: number; total: number }>();
        for (const entry of get().performanceHistory) {
          const key = normalizeTopic(entry.topic);
          const current = byTopic.get(key) ?? {
            topic: entry.topic,
            correct: 0,
            total: 0,
          };
          current.total += 1;
          if (entry.correct) current.correct += 1;
          current.topic = entry.topic;
          byTopic.set(key, current);
        }
        return Array.from(byTopic.values())
          .filter((group) => Math.round((group.correct / group.total) * 100) > 80)
          .map((group) => group.topic);
      },

      updateStreak: () => {
        const today = new Date();
        const todayYmd = toYmd(today);
        set((s) => {
          if (s.lastActiveDate === todayYmd) {
            return s;
          }

          const diff = s.lastActiveDate
            ? dayDiff(s.lastActiveDate, todayYmd)
            : null;

          const nextStreak = diff === 1 ? s.streak + 1 : 1;
          const nextBest = Math.max(s.bestStreak, nextStreak);
          const todayIndex = mondayBasedIndex(today);
          const nextWeek =
            diff === 1
              ? ([...s.weekActivity] as [
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                ])
              : ([false, false, false, false, false, false, false] as [
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                  boolean,
                ]);
          nextWeek[todayIndex] = true;

          return {
            streak: nextStreak,
            bestStreak: nextBest,
            lastActiveDate: todayYmd,
            weekActivity: nextWeek,
          };
        });
        get().checkAndUnlockBadges();
      },

      checkAndUnlockBadges: () => {
        const state = get();
        const unlockedSet = new Set(state.unlockedBadges);
        const newlyUnlocked: string[] = [];

        for (const badge of badges) {
          if (unlockedSet.has(badge.id)) continue;
          if (meetsCondition(state, badge)) {
            unlockedSet.add(badge.id);
            newlyUnlocked.push(badge.id);
          }
        }

        if (!newlyUnlocked.length) return;

        set((s) => ({
          unlockedBadges: Array.from(unlockedSet),
          pendingBadge: s.pendingBadge ?? newlyUnlocked[0],
        }));
      },

      clearPendingBadge: () => set({ pendingBadge: null }),

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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
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
        streak: s.streak,
        bestStreak: s.bestStreak,
        lastActiveDate: s.lastActiveDate,
        weekActivity: s.weekActivity,
        unlockedBadges: s.unlockedBadges,
        completedQuizInNight: s.completedQuizInNight,
        completedQuizInArabic: s.completedQuizInArabic,
        hasComebackCorrect: s.hasComebackCorrect,
        performanceHistory: s.performanceHistory,
        quizHistory: s.quizHistory,
        camelAnimatedToLevel: s.camelAnimatedToLevel,
      }),
    }
  )
);
