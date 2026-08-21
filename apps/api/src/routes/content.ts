import { Hono } from "hono";
import type { ApiEnv } from "../index";
import { errorResponse } from "../lib/errors";
import { listLearningTopics } from "../services/content";
import { getCurriculum } from "../services/curriculum";
import { getLearningLevels } from "../services/levels";

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

contentRoutes.get("/api/content/curriculum", async (c) => {
  try {
    return c.json({ modules: await getCurriculum(c.env.DB) });
  } catch (error) {
    return errorResponse(error);
  }
});

contentRoutes.get("/api/content/levels", async (c) => {
  try {
    return c.json({ levels: await getLearningLevels(c.env.DB) });
  } catch (error) {
    return errorResponse(error);
  }
});
