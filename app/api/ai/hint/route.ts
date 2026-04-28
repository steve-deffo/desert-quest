import { callClaude } from "@/lib/anthropic";

export const runtime = "nodejs";

interface HintRequest {
  question: string;
  correctAnswer: string;
  studentAnswer?: string;
  grade: 4 | 8;
  topic: string;
  language: "en" | "ar";
}

export async function POST(req: Request) {
  let body: HintRequest;
  try {
    body = (await req.json()) as HintRequest;
  } catch {
    return Response.json({ error: "bad request", fallback: true });
  }

  const { question, correctAnswer, studentAnswer, grade, topic, language } =
    body;

  const systemPrompt = `You are a wise and kind desert sage helping Grade ${grade} students learn math in the UAE.
Language: ${language === "ar" ? "Arabic" : "English"}.
Rules:
- Max 2 sentences
- Never reveal the answer directly
- Use UAE context (dates, camels, souks, dirhams)
- Be encouraging, not discouraging
- For Grade 4: very simple language
- For Grade 8: slightly more technical`;

  const userPrompt = `Question: ${question}
Correct answer: ${correctAnswer}
Student answered: ${studentAnswer ?? "(no answer)"}
Topic: ${topic}
Give a helpful hint that guides toward the correct answer.`;

  const result = await callClaude({
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 150,
  });

  if (!result.ok) {
    return Response.json({ error: result.reason, fallback: true });
  }

  return Response.json({ hint: result.text });
}
