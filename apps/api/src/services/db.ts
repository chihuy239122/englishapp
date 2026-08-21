import type { Correction, TurnResponse } from "../../../../packages/shared/types";
import { ApiError } from "../lib/errors";

export async function requireSession(db: D1Database, sessionId: string): Promise<{ id: string; user_id: string; persona: string; level: string; module_id: string | null; lesson_id: string | null; phrase_id: string | null }> {
  const session = await db.prepare("SELECT id, user_id, persona, level, module_id, lesson_id, phrase_id FROM sessions WHERE id = ?").bind(sessionId).first<{ id: string; user_id: string; persona: string; level: string; module_id: string | null; lesson_id: string | null; phrase_id: string | null }>();
  if (!session) throw new ApiError("SESSION_INVALID", "Session không tồn tại.", false, "PERSISTENCE");
  return session;
}

export function rowToTurn(row: Record<string, unknown>): TurnResponse {
  return {
    turnId: String(row.id),
    transcript: String(row.transcript || ""),
    aiReply: String(row.ai_reply || ""),
    corrections: parseCorrections(row.corrections),
    audioBase64: row.audio_available ? String(row.audio_base64 || "") : "",
    audioAvailable: Boolean(row.audio_available),
    ...(row.phrase_id ? { phraseId: String(row.phrase_id) } : {}),
  };
}

function parseCorrections(value: unknown): Correction[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function nextTurnIndex(db: D1Database, sessionId: string): Promise<number> {
  const row = await db.prepare("SELECT COALESCE(MAX(turn_index), 0) + 1 AS next_index FROM turns WHERE session_id = ?").bind(sessionId).first<{ next_index: number }>();
  return Number(row?.next_index || 1);
}
