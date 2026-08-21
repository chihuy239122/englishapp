import { Hono } from "hono";
import type { ApiEnv } from "../index";
import { withTimeout } from "../services/ai";
import { requireSession } from "../services/db";
import { issueTurnToken } from "../services/tokens";
import { ApiError, errorResponse } from "../lib/errors";
import { validateAudio } from "../lib/audio";

export const transcribeRoutes = new Hono<ApiEnv>();

transcribeRoutes.post("/api/sessions/:id/transcribe", async (c) => {
  try {
    const session = await requireSession(c.env.DB, c.req.param("id"));
    const form = await c.req.raw.formData();
    const value = form.get("audio");
    if (!(value instanceof File)) throw new ApiError("AUDIO_EMPTY", "Chưa nhận được file ghi âm.", false, "AUDIO_UPLOAD");
    const bytes = new Uint8Array(await value.arrayBuffer());
    let contentType;
    try {
      contentType = validateAudio(bytes, value.type, Number(form.get("durationMs") || NaN));
    } catch (error) {
      const code = error instanceof Error ? error.message : "AUDIO_MIME_INVALID";
      throw new ApiError(code, messageForAudio(code), false, "AUDIO_UPLOAD");
    }

    let userAudioKey: string | null = null;
    if (c.env.SAVE_USER_AUDIO === "true" && c.env.AUDIO_BUCKET) {
      const extension = contentType === "audio/webm" ? "webm" : contentType === "audio/wav" ? "wav" : contentType === "audio/aac" ? "aac" : "mp4";
      userAudioKey = `audio/${session.user_id}/${session.id}/${crypto.randomUUID()}.${extension}`;
      await c.env.AUDIO_BUCKET.put(userAudioKey, bytes, { httpMetadata: { contentType } });
    }

    if (!c.env.AI) throw new ApiError("STT_FAILURE", "Dịch vụ nhận diện giọng nói chưa sẵn sàng.", true, "STT");
    const result = await withTimeout(c.env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio: [...bytes] }), 5_000);
    const transcript = extractTranscript(result).trim();
    const turnToken = await issueTurnToken(c.env.DB, session.id, session.user_id, userAudioKey, requireSecret(c.env.TURN_TOKEN_SECRET));
    if (transcript.length < 2) {
      throw new ApiError("STT_EMPTY", "Chưa nghe rõ câu nói. Bạn có thể nhập tối thiểu 2 ký tự hoặc ghi âm lại.", true, "STT", { transcript: "", turnToken, audioContentType: contentType });
    }
    return c.json({ transcript, turnToken, audioContentType: contentType });
  } catch (error) {
    return errorResponse(error);
  }
});

function extractTranscript(result: unknown): string {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const object = result as Record<string, unknown>;
    if (typeof object.text === "string") return object.text;
    if (typeof object.transcript === "string") return object.transcript;
  }
  return "";
}

function requireSecret(value: string | undefined): string {
  if (!value) throw new ApiError("STT_FAILURE", "Server chưa cấu hình turn token secret.", false, "STT");
  return value;
}

function messageForAudio(code: string): string {
  if (code === "AUDIO_SIZE_EXCEEDED") return "File ghi âm vượt quá 8 MB.";
  if (code === "DURATION_EXCEEDED") return "Mỗi lượt ghi âm tối đa 60 giây.";
  if (code === "AUDIO_EMPTY") return "File ghi âm đang rỗng.";
  return "Định dạng âm thanh không khớp với nội dung file.";
}
