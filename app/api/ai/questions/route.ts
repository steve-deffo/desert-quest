import { callClaude } from "@/lib/anthropic";

export const runtime = "nodejs";

interface QuestionsRequest {
  grade: 4 | 8;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  language: "en" | "ar";
}

interface GeneratedQuestion {
  question: string;
  answers: [string, string, string, string];
  correct: number;
  explanation: string;
  arabicNumerals: [string, string, string, string];
}

export async function POST(req: Request) {
  let body: QuestionsRequest;
  try {
    body = (await req.json()) as QuestionsRequest;
  } catch {
    return Response.json({ error: "bad request", fallback: true });
  }

  const { grade, topic, difficulty, language } = body;

  const systemPrompt = `You are a math question generator for UAE students.
Grade: ${grade}, Topic: ${topic}, Difficulty: ${difficulty}.
Language for question text: ${language === "ar" ? "Arabic" : "English"}.
Generate questions set in UAE contexts: souks, camels, dates, Burj Khalifa, gold, dirhams, falconry, pearl diving, Formula 1 Abu Dhabi, etc.
Return ONLY valid JSON, no other text.`;

  const userPrompt = `Generate 5 multiple choice math questions.
Each question: UAE real-world context.
Return as JSON array (no markdown fences, no commentary):
[{
  "question": "string",
  "answers": ["string", "string", "string", "string"],
  "correct": 0,
  "explanation": "string",
  "arabicNumerals": ["string", "string", "string", "string"]
}]`;

  const result = await callClaude({
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 1500,
    timeoutMs: 12000,
  });

  if (!result.ok) {
    return Response.json({ error: result.reason, fallback: true });
  }

  // Parse the model's JSON response. Strip any accidental ``` fences.
  const cleaned = result.text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let questions: GeneratedQuestion[];
  try {
    questions = JSON.parse(cleaned);
    if (!Array.isArray(questions) || questions.length === 0) {
      return Response.json({ error: "empty list", fallback: true });
    }
    // Validate shape
    for (const q of questions) {
      if (
        typeof q.question !== "string" ||
        !Array.isArray(q.answers) ||
        q.answers.length !== 4 ||
        typeof q.correct !== "number"
      ) {
        return Response.json({ error: "invalid shape", fallback: true });
      }
    }
  } catch {
    return Response.json({ error: "json parse failed", fallback: true });
  }

  return Response.json({ questions });
}
