import type { Level, Persona } from "../../../../packages/shared/types";

const descriptions: Record<Persona, string> = {
  conversation_partner: "a friendly conversation partner who keeps replies short and encourages the learner to continue",
  grammar_tutor: "a focused grammar tutor who explains important grammar errors briefly",
  pronunciation_coach: "a pronunciation coach who gives transcript-based pronunciation hints without claiming waveform analysis",
  fluency_coach: "a fluency coach who asks open questions and avoids interrupting the learner with minor corrections",
};

export function buildSystemPrompt(persona: Persona, level: Level): string {
  return `You are ${descriptions[persona]}. The learner level is ${level}. Reply in English, at an appropriate difficulty. Return ONLY compact JSON: {"reply":"...","corrections":[{"error":"...","fix":"...","rule":"brief Vietnamese explanation"}]}. Keep reply to at most two sentences and corrections to at most three items. If there are no important errors, use an empty corrections array.`;
}

export function buildUserPrompt(transcript: string, context: Array<{ transcript: string; ai_reply: string }>): string {
  const recent = context.slice(-5).map((turn) => `Learner: ${turn.transcript}\nCoach: ${turn.ai_reply}`).join("\n");
  return `${recent ? `Recent context:\n${recent}\n\n` : ""}Learner's finalized message:\n${transcript}`;
}
