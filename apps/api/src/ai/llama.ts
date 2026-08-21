import type { Correction } from "../../../../packages/shared/types";
import { buildSystemPrompt, buildUserPrompt } from "./personas";

export interface LlamaResult {
  reply: string;
  corrections: Correction[];
}

const STATIC_REPLY: LlamaResult = {
  reply: "That was a good try. Could you tell me a little more?",
  corrections: [],
};

export function parseLlamaResponse(raw: string): LlamaResult {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned) as { reply?: unknown; corrections?: unknown };
  if (typeof parsed.reply !== "string" || parsed.reply.trim().length === 0) throw new Error("LLM_JSON_MALFORMED");
  const corrections = Array.isArray(parsed.corrections) ? parsed.corrections.slice(0, 3).map((item) => {
    const correction = item as Record<string, unknown>;
    if ([correction.error, correction.fix, correction.rule].some((value) => typeof value !== "string")) throw new Error("LLM_JSON_MALFORMED");
    return { error: correction.error as string, fix: correction.fix as string, rule: correction.rule as string };
  }) : [];
  return { reply: parsed.reply.slice(0, 600), corrections };
}

function extractText(result: unknown): string {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const value = result as Record<string, unknown>;
    if (typeof value.response === "string") return value.response;
    if (typeof value.result === "string") return value.result;
  }
  return "";
}

export function staticFallback(): LlamaResult {
  return { reply: STATIC_REPLY.reply, corrections: [] };
}

export async function generateLlama(
  ai: { run(model: string, input: unknown): Promise<unknown> },
  persona: Parameters<typeof buildSystemPrompt>[0],
  level: Parameters<typeof buildSystemPrompt>[1],
  transcript: string,
  context: Array<{ transcript: string; ai_reply: string }>,
  signal: AbortSignal,
): Promise<LlamaResult> {
  const input = {
    messages: [
      { role: "system", content: buildSystemPrompt(persona, level) },
      { role: "user", content: buildUserPrompt(transcript, context) },
    ],
    max_tokens: 350,
  };
  const response = await ai.run("@cf/meta/llama-3.3-70b-instruct", input);
  try {
    return parseLlamaResponse(extractText(response));
  } catch {
    if (signal.aborted) throw new Error("LLM_TIMEOUT");
    const repair = await ai.run("@cf/meta/llama-3.3-70b-instruct", {
      ...input,
      messages: [...input.messages, { role: "user", content: "Repair the previous response. Return only valid JSON under 150 words." }],
      max_tokens: 350,
    });
    try {
      return parseLlamaResponse(extractText(repair));
    } catch {
      return staticFallback();
    }
  }
}

export async function generateFallbackLlama(
  ai: { run(model: string, input: unknown): Promise<unknown> },
  persona: Parameters<typeof buildSystemPrompt>[0],
  level: Parameters<typeof buildSystemPrompt>[1],
  transcript: string,
  signal: AbortSignal,
): Promise<LlamaResult> {
  const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [
      { role: "system", content: buildSystemPrompt(persona, level) },
      { role: "user", content: transcript },
    ],
    max_tokens: 350,
  });
  if (signal.aborted) throw new Error("LLM_TIMEOUT");
  return parseLlamaResponse(extractText(response));
}
