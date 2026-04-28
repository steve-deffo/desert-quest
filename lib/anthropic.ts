/**
 * Server-side helper for calling the Anthropic Messages API.
 * - Wraps fetch with a 5-second timeout (AbortController).
 * - Returns { ok: true, text } on success, { ok: false, reason } on failure.
 * - Never throws — callers can decide on a graceful fallback.
 */

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AnthropicCallResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_TIMEOUT_MS = 5000;

export async function callClaude(opts: {
  system: string;
  messages: AnthropicMessage[];
  maxTokens?: number;
  model?: string;
  timeoutMs?: number;
}): Promise<AnthropicCallResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, reason: "missing ANTHROPIC_API_KEY" };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? 200,
        system: opts.system,
        messages: opts.messages,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, reason: `status ${res.status}` };
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.[0]?.text?.trim();
    if (!text) return { ok: false, reason: "empty response" };
    return { ok: true, text };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
