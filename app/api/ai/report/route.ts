import { callClaude } from "@/lib/anthropic";

export const runtime = "nodejs";

interface ReportRequest {
  name: string;
  grade: 4 | 8;
  language: "en" | "ar";
  completedLevels: number;
  totalLevels: number;
  avgScorePct: number;
  strongTopics: string[];
  weakTopics: string[];
  streak: number;
  unlockedBadges: number;
  totalBadges: number;
  totalTime: string;
}

export async function POST(req: Request) {
  let body: ReportRequest;
  try {
    body = (await req.json()) as ReportRequest;
  } catch {
    return Response.json({ error: "bad request", fallback: true });
  }

  const {
    name,
    grade,
    language,
    completedLevels,
    totalLevels,
    avgScorePct,
    strongTopics,
    weakTopics,
    streak,
    unlockedBadges,
    totalBadges,
    totalTime,
  } = body;

  const systemPrompt = `You are an encouraging educational advisor writing a progress report for parents of a Grade ${grade} student in UAE.
Write in ${language === "ar" ? "Arabic" : "English"}.
Tone: warm, professional, specific, constructive.
Length: exactly 3 short paragraphs.
Paragraph 1: overall progress celebration.
Paragraph 2: specific strengths with data.
Paragraph 3: one area to improve + actionable tip for parent.
Output plain prose only — no headings, no bullets, no markdown.`;

  const userPrompt = `Student: ${name}, Grade ${grade}
Completed levels: ${completedLevels}/${totalLevels}
Average score: ${avgScorePct}%
Strong topics: ${strongTopics.length ? strongTopics.join(", ") : "(none yet)"}
Weak topics: ${weakTopics.length ? weakTopics.join(", ") : "(none yet)"}
Current streak: ${streak} days
Badges earned: ${unlockedBadges}/${totalBadges}
Total study time: ${totalTime}`;

  const result = await callClaude({
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 500,
    timeoutMs: 10000,
  });

  if (!result.ok) {
    return Response.json({ error: result.reason, fallback: true });
  }

  return Response.json({ report: result.text });
}
