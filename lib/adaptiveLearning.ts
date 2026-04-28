import grade4Questions from "@/data/questions/grade4.json";
import grade8Questions from "@/data/questions/grade8.json";
import type { AdaptiveDifficulty, QuestionData } from "@/lib/types";
import type { GameState } from "@/store/useGameStore";

type Grade = 4 | 8;

const LEVEL_TOPIC_MAP: Record<Grade, string[]> = {
  4: ["addition", "multiplication", "fractions", "geometry", "measurement"],
  8: ["linearEquations", "ratios", "exponents", "geometry", "dataAnalysis"],
};

const TOPIC_ALIASES: Record<string, string> = {
  linearequations: "linear-equations",
  ratios: "ratios-percentages",
  exponents: "algebra",
  dataanalysis: "statistics",
};

function normalizeTopic(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveTopicAlias(topic: string): string {
  const key = normalizeTopic(topic);
  return TOPIC_ALIASES[key] ?? topic;
}

function getDifficulty(accuracy: number): AdaptiveDifficulty {
  if (accuracy < 50) return "easy";
  if (accuracy > 80) return "hard";
  return "medium";
}

export function getAdaptedQuestions(
  grade: Grade,
  level: number,
  store: GameState
): QuestionData[] {
  const bank = grade === 4 ? grade4Questions : grade8Questions;
  const baseQuestions = bank.filter((q) => q.level === level) as QuestionData[];

  if (!baseQuestions.length) return [];

  const mappedTopic = LEVEL_TOPIC_MAP[grade]?.[level];
  const fallbackTopic = baseQuestions[0].topic;
  const topicForAccuracy = resolveTopicAlias(mappedTopic ?? fallbackTopic);
  const accuracy = store.getTopicAccuracy(topicForAccuracy);
  const difficulty = getDifficulty(accuracy);

  return baseQuestions.map((question) => {
    const variant =
      difficulty === "easy"
        ? question.variants?.easy
        : difficulty === "hard"
          ? question.variants?.hard
          : undefined;

    if (!variant) {
      return { ...question, difficulty };
    }

    return {
      ...question,
      en: variant.en,
      ar: variant.ar,
      difficulty,
    };
  });
}
