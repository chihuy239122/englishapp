import { Hono } from "hono";
import type { ApiEnv } from "../index";
import type { Level, Persona, TurnResponse } from "../../../../packages/shared/types";
import { generateFallbackLlama, generateLlama, staticFallback } from "../ai/llama";
import { generateSpeech } from "../ai/melotts";
import { isQuotaOrTransportError, withTimeout } from "../services/ai";
import { nextTurnIndex, requireSession, rowToTurn } from "../services/db";
import { claimTurnAttempt, hashToken } from "../services/tokens";
import { ApiError, errorResponse } from "../lib/errors";
import { isNonEmptyString, isUuid, readJson } from "../lib/validation";
import { newId, nowSeconds } from "../lib/ids";

export const turnRoutes = new Hono<ApiEnv>();

turnRoutes.post("/api/sessions/:id/turns", async (c) => {
  try {
    const session = await requireSession(c.env.DB, c.req.param("id"));
    const body = await readJson(c.req.raw);
    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    const token = typeof body.turnToken === "string" ? body.turnToken : "";
    const clientTurnId = body.clientTurnId;
    if (!isUuid(clientTurnId)) throw new ApiError("TURN_CLIENT_ID_INVALID", "clientTurnId phải là UUID hợp lệ.", false, "PERSISTENCE");
    if (transcript.length < 2 || transcript.length > 4000) throw new ApiError("TRANSCRIPT_INVALID", "Transcript cần có từ 2 đến 4000 ký tự.", false, "LLM_GEN");
    if (!token) throw new ApiError("TURN_TOKEN_EXPIRED", "Thiếu turn token.", false, "PERSISTENCE");
    const tokenHash = await hashToken(token, requireSecret(c.env.TURN_TOKEN_SECRET));
    const existingClient = await c.env.DB.prepare("SELECT * FROM turns WHERE client_turn_id = ?").bind(clientTurnId).first<Record<string, unknown>>();
    const tokenRow = await c.env.DB.prepare("SELECT * FROM turn_tokens WHERE token_hash = ?").bind(tokenHash).first<Record<string, unknown>>();
    if (existingClient && tokenRow?.used_at !== null && tokenRow?.used_at !== undefined && tokenRow.turn_id === existingClient.id) {
      return c.json(await replayTurn(c.env, existingClient));
    }
    if (existingClient) throw new ApiError("TURN_CLIENT_ID_INVALID", "clientTurnId đã được dùng cho một lượt khác.", false, "PERSISTENCE");
    const tokenData = await claimTurnAttempt(c.env.DB, tokenHash, session.id, session.user_id);

    const startedAt = Date.now();
    const context = await c.env.DB.prepare("SELECT transcript, ai_reply FROM turns WHERE session_id = ? ORDER BY turn_index DESC LIMIT 5").bind(session.id).all<{ transcript: string; ai_reply: string }>();
    const persona = session.persona as Persona;
    const level = session.level as Level;
    const deadline = Number(c.env.TURN_DEADLINE_MS || 18_000);
    let aiResult = staticFallback();
    try {
      aiResult = await withTimeout(c.env.AI ? generateLlama(c.env.AI, persona, level, transcript, context.results.reverse(), new AbortController().signal) : Promise.reject(new Error("AI unavailable")), Math.min(5_000, deadline));
    } catch (error) {
      if (isQuotaOrTransportError(error) && Date.now() - startedAt + 5_000 <= deadline) {
        try {
          aiResult = await withTimeout(c.env.AI ? generateFallbackLlama(c.env.AI, persona, level, transcript, new AbortController().signal) : Promise.reject(new Error("AI unavailable")), 5_000);
        } catch {
          aiResult = staticFallback();
        }
      }
    }

    let audioBase64 = "";
    let audioAvailable = false;
    const remaining = deadline - (Date.now() - startedAt);
    if (remaining >= 4_000 && c.env.AI) {
      try {
        audioBase64 = await withTimeout(generateSpeech(c.env.AI, aiResult.reply), 4_000);
        audioAvailable = true;
      } catch {
        audioBase64 = "";
      }
    }

    const turnId = newId();
    const turnIndex = await nextTurnIndex(c.env.DB, session.id);
    const createdAt = nowSeconds();
    const insert = c.env.DB.prepare("INSERT INTO turns (id, session_id, client_turn_id, turn_index, transcript, ai_reply, corrections, audio_base64, audio_available, user_audio_key, phrase_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(
      turnId, session.id, clientTurnId, turnIndex, transcript, aiResult.reply, JSON.stringify(aiResult.corrections), audioBase64, audioAvailable ? 1 : 0, tokenData.user_audio_key || null, session.phrase_id || null, createdAt,
    );
    const consume = c.env.DB.prepare("UPDATE turn_tokens SET used_at = ?, turn_id = ? WHERE token_hash = ? AND used_at IS NULL").bind(createdAt, turnId, tokenHash);
    const progress = session.phrase_id
      ? c.env.DB.prepare("INSERT INTO user_progress (user_id, phrase_id, times_practiced, last_practiced_at, mastered) VALUES (?, ?, 1, ?, 0) ON CONFLICT(user_id, phrase_id) DO UPDATE SET times_practiced = user_progress.times_practiced + 1, last_practiced_at = excluded.last_practiced_at, mastered = CASE WHEN user_progress.times_practiced + 1 >= 3 THEN 1 ELSE user_progress.mastered END").bind(session.user_id, session.phrase_id, createdAt)
      : null;
    const results = await c.env.DB.batch(progress ? [insert, consume, progress] : [insert, consume]);
    if (Number(results[1]?.meta?.changes || 0) !== 1) throw new ApiError("DB_PERSIST_ERROR", "Không thể xác nhận lượt luyện.", true, "PERSISTENCE");
    const response: TurnResponse = { turnId, transcript, aiReply: aiResult.reply, corrections: aiResult.corrections, audioBase64, audioAvailable, ...(session.phrase_id ? { phraseId: session.phrase_id } : {}) };
    return c.json(response);
  } catch (error) {
    return errorResponse(error);
  }
});

async function replayTurn(env: ApiEnv["Bindings"], row: Record<string, unknown>): Promise<TurnResponse> {
  let response = rowToTurn(row);
  if (response.audioAvailable) return response;
  if (env.AI) {
    try {
      const audioBase64 = await withTimeout(generateSpeech(env.AI, response.aiReply), 4_000);
      await env.DB.prepare("UPDATE turns SET audio_base64 = ?, audio_available = 1 WHERE id = ?").bind(audioBase64, response.turnId).run();
      response = { ...response, audioBase64, audioAvailable: true };
    } catch {
      // The persisted turn remains valid without audio.
    }
  }
  return response;
}

function requireSecret(value: string | undefined): string {
  if (!value) throw new ApiError("TURN_TOKEN_EXPIRED", "Server chưa cấu hình turn token secret.", false, "PERSISTENCE");
  return value;
}
