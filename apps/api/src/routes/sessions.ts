import { Hono } from "hono";
import type { ApiEnv } from "../index";
import { ApiError, errorResponse } from "../lib/errors";
import { newId, nowSeconds } from "../lib/ids";
import { isLevel, isNonEmptyString, isPersona, readJson } from "../lib/validation";

export const sessionRoutes = new Hono<ApiEnv>();

sessionRoutes.post("/api/sessions", async (c) => {
  try {
    const body = await readJson(c.req.raw);
    if (!isNonEmptyString(body.userId, 120) || !isPersona(body.persona) || !isLevel(body.level)) {
      throw new ApiError("SESSION_INVALID", "Thông tin session chưa hợp lệ.", false, "PERSISTENCE");
    }
    const userId = body.userId.trim();
    const moduleId = optionalId(body.moduleId);
    const lessonId = optionalId(body.lessonId);
    const phraseId = optionalId(body.phraseId);
    if (body.moduleId !== undefined && !moduleId || body.lessonId !== undefined && !lessonId || body.phraseId !== undefined && !phraseId) {
      throw new ApiError("SESSION_CONTEXT_INVALID", "Ngữ cảnh bài học chưa hợp lệ.", false, "PERSISTENCE");
    }
    if (lessonId && !(await c.env.DB.prepare("SELECT 1 FROM content_lessons WHERE id = ? AND (? IS NULL OR module_id = ?) LIMIT 1").bind(lessonId, moduleId ?? null, moduleId ?? null).first())) {
      throw new ApiError("SESSION_CONTEXT_INVALID", "Bài học không thuộc lộ trình đã chọn.", false, "PERSISTENCE");
    }
    if (phraseId && !(await c.env.DB.prepare("SELECT 1 FROM lesson_phrases lp LEFT JOIN content_lessons l ON l.id = lp.lesson_id WHERE lp.phrase_id = ? AND (? IS NULL OR lp.lesson_id = ?) LIMIT 1").bind(phraseId, lessonId ?? null, lessonId ?? null).first())) {
      throw new ApiError("SESSION_CONTEXT_INVALID", "Câu luyện tập không thuộc bài học đã chọn.", false, "PERSISTENCE");
    }
    const sessionId = newId();
    const now = nowSeconds();
    await c.env.DB.prepare("INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)").bind(userId, now).run();
    await c.env.DB.prepare("INSERT INTO sessions (id, user_id, persona, level, module_id, lesson_id, phrase_id, started_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(sessionId, userId, body.persona, body.level, moduleId ?? null, lessonId ?? null, phraseId ?? null, now).run();
    return c.json({ sessionId, moduleId: moduleId ?? null, lessonId: lessonId ?? null, phraseId: phraseId ?? null });
  } catch (error) {
    return errorResponse(error);
  }
});

function optionalId(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 120 ? value.trim() : null;
}
