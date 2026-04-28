export type Grade = 4 | 8;
export type Lang = "en" | "ar";

export interface LessonContent {
  title: string;
  objective: string;
  explanation: string;
  keyPoints: string[];
  workedExample: {
    problem: string;
    steps: string[];
  };
  tip: string;
}

export interface LessonData {
  id: string;
  grade: Grade;
  level: number;
  en: LessonContent;
  ar: LessonContent;
  videoUrl: string | null;
}

export interface QuestionLocalized {
  question: string;
  answers: string[];
  hint: string;
}

export type QuestionType = "mcq" | "dragdrop";

export interface VariantBundle {
  en: QuestionLocalized;
  ar: QuestionLocalized;
}

export type AdaptiveDifficulty = "easy" | "medium" | "hard";

export interface QuizAttempt {
  id: string;
  level: number;
  grade: 4 | 8;
  date: string;
  score: number;
  stars: number;
  dirhamsEarned: number;
  timeSpentSeconds: number;
  wrongQuestionIds: string[];
  topicId: string;
  difficulty: AdaptiveDifficulty;
}

export interface QuestionData {
  id: string;
  grade: Grade;
  level: number;
  topic: string;
  en: QuestionLocalized;
  ar: QuestionLocalized;
  correct: number;
  arabicNumerals: string[];
  type?: QuestionType;
  explanation?: { en: string; ar: string };
  variants?: { easy: VariantBundle; hard: VariantBundle };
  difficulty?: AdaptiveDifficulty;
}

export interface ReviewEntry {
  questionIndex: number;
  userAnswerIndex: number; // -1 = no answer / timeout
  isCorrect: boolean;
}

export interface Landmark {
  id: string;
  level: number;
  emoji: string;
  en: { name: string; location: string; fact4: string; fact8: string };
  ar: { name: string; location: string; fact4: string; fact8: string };
}
