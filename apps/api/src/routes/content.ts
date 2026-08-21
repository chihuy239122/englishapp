import { Hono } from "hono";
import type { ApiEnv } from "../index";
import { errorResponse } from "../lib/errors";
import { listLearningTopics } from "../services/content";

export const contentRoutes = new Hono<ApiEnv>();

contentRoutes.get("/api/content/topics", async (c) => {
  try {
    const level = c.req.query("level");
    const topics = await listLearningTopics(c.env.DB, level || undefined);
    return c.json({ topics });
  } catch (error) {
    return errorResponse(error);
  }
});
