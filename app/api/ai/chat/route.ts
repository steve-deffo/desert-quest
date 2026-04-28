import { callClaude, type AnthropicMessage } from "@/lib/anthropic";

export const runtime = "nodejs";

interface ChatRequest {
  messages: AnthropicMessage[];
  grade: 4 | 8;
  currentTopic: string;
  language: "en" | "ar";
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "bad request", fallback: true });
  }

  const { messages, grade, currentTopic, language } = body;

  const systemPrompt = `You are Zayed the Desert Sage, a wise camel who helps Grade ${grade} UAE students understand math.
Current topic: ${currentTopic || "general math"}.
Language: ${language === "ar" ? "Arabic" : "English"}.
Rules:
- Stay focused on the current math topic
- Use UAE examples (dirhams, camels, dates, souks)
- Keep answers under 3 sentences
- Be warm and encouraging
- If asked about something off-topic, gently redirect to the math lesson`;

  const safeMessages = (messages ?? []).filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (safeMessages.length === 0) {
    return Response.json({ error: "no messages", fallback: true });
  }

  const result = await callClaude({
    system: systemPrompt,
    messages: safeMessages,
    maxTokens: 200,
    timeoutMs: 8000,
  });

  if (!result.ok) {
    return Response.json({ error: result.reason, fallback: true });
  }

  return Response.json({ reply: result.text });
}
