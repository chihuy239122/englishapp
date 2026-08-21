import { ApiError } from "../lib/errors";
import { nowSeconds, randomToken } from "../lib/ids";

const TOKEN_TTL_SECONDS = 15 * 60;
const RETRY_WINDOW_SECONDS = 60;

export async function hashToken(token: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(token));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function issueTurnToken(
  db: D1Database,
  sessionId: string,
  userId: string,
  userAudioKey: string | null,
  secret: string,
): Promise<string> {
  const token = randomToken();
  const createdAt = nowSeconds();
  await db.prepare(
    "INSERT INTO turn_tokens (token_hash, session_id, user_id, user_audio_key, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).bind(await hashToken(token, secret), sessionId, userId, userAudioKey, createdAt, createdAt + TOKEN_TTL_SECONDS).run();
  return token;
}

export async function claimTurnAttempt(db: D1Database, tokenHash: string, sessionId: string, userId: string): Promise<Record<string, unknown>> {
  const now = nowSeconds();
  const current = await db.prepare("SELECT * FROM turn_tokens WHERE token_hash = ? AND session_id = ? AND user_id = ?").bind(tokenHash, sessionId, userId).first<Record<string, unknown>>();
  if (!current) throw new ApiError("TURN_TOKEN_EXPIRED", "Turn token không hợp lệ.", false, "PERSISTENCE");
  if (Number(current.expires_at) < now) throw new ApiError("TURN_TOKEN_EXPIRED", "Turn token đã hết hạn.", false, "PERSISTENCE");
  if (current.used_at !== null && current.used_at !== undefined) throw new ApiError("TURN_TOKEN_USED", "Turn token đã được sử dụng.", false, "PERSISTENCE");
  const firstAttemptAt = current.first_attempt_at ? Number(current.first_attempt_at) : now;
  const attempts = Number(current.attempt_count || 0);
  if (firstAttemptAt + RETRY_WINDOW_SECONDS < now) {
    await db.prepare("UPDATE turn_tokens SET attempt_count = 1, first_attempt_at = ? WHERE token_hash = ? AND used_at IS NULL").bind(now, tokenHash).run();
  } else if (attempts >= 2) {
    throw new ApiError("TURN_RETRY_LIMIT", "Lượt này đã vượt quá số lần thử trong 60 giây.", true, "PERSISTENCE");
  } else {
    await db.prepare("UPDATE turn_tokens SET attempt_count = attempt_count + 1 WHERE token_hash = ? AND used_at IS NULL").bind(tokenHash).run();
  }
  return current;
}

export { RETRY_WINDOW_SECONDS, TOKEN_TTL_SECONDS };
