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

export interface QuestionData {
  id: string;
  grade: Grade;
  level: number;
  topic: string;
  en: QuestionLocalized;
  ar: QuestionLocalized;
  correct: number;
  arabicNumerals: string[];
}

export interface Landmark {
  id: string;
  level: number;
  emoji: string;
  en: { name: string; location: string; fact4: string; fact8: string };
  ar: { name: string; location: string; fact4: string; fact8: string };
}
