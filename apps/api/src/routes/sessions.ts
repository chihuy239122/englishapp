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
    const sessionId = newId();
    const now = nowSeconds();
    await c.env.DB.prepare("INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)").bind(userId, now).run();
    await c.env.DB.prepare("INSERT INTO sessions (id, user_id, persona, level, started_at) VALUES (?, ?, ?, ?, ?)").bind(sessionId, userId, body.persona, body.level, now).run();
    return c.json({ sessionId });
  } catch (error) {
    return errorResponse(error);
  }
});
