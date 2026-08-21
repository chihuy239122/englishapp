import type { Level, Persona } from "../../../../packages/shared/types";

const PERSONAS: readonly Persona[] = [
  "conversation_partner",
  "grammar_tutor",
  "pronunciation_coach",
  "fluency_coach",
];
const LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced"];

export function isPersona(value: unknown): value is Persona {
  return typeof value === "string" && PERSONAS.includes(value as Persona);
}

export function isLevel(value: unknown): value is Level {
  return typeof value === "string" && LEVELS.includes(value as Level);
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isNonEmptyString(value: unknown, maxLength = 4000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
}
