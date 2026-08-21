import { Hono } from "hono";
import type { ApiEnv } from "../index";
import { errorResponse } from "../lib/errors";
import { getDueReviewCount, getUserProgress } from "../services/curriculum";
import { nowSeconds } from "../lib/ids";

export const statsRoutes = new Hono<ApiEnv>();

statsRoutes.get("/api/users/:id/stats", async (c) => {
  try {
    const userId = c.req.param("id");
    const totals = await c.env.DB.prepare("SELECT COUNT(t.id) AS turns, COALESCE(SUM(CASE WHEN s.ended_at IS NULL THEN 0 ELSE (s.ended_at - s.started_at) / 60.0 END), 0) AS minutes FROM sessions s LEFT JOIN turns t ON t.session_id = s.id WHERE s.user_id = ?").bind(userId).first<{ turns: number; minutes: number }>();
    const daily = await c.env.DB.prepare("SELECT strftime('%Y-%m-%d', datetime(s.started_at, 'unixepoch')) AS date, COUNT(t.id) AS turns, COALESCE(SUM(CASE WHEN s.ended_at IS NULL THEN 0 ELSE (s.ended_at - s.started_at) / 60.0 END), 0) AS minutes FROM sessions s LEFT JOIN turns t ON t.session_id = s.id WHERE s.user_id = ? GROUP BY date ORDER BY date ASC").bind(userId).all();
    return c.json({ userId, totalMinutes: Number(totals?.minutes || 0), totalTurns: Number(totals?.turns || 0), dailyStats: daily.results });
  } catch (error) {
    return errorResponse(error);
  }
});

statsRoutes.get("/api/users/:id/progress", async (c) => {
  try {
    const userId = c.req.param("id");
    return c.json({ userId, modules: await getUserProgress(c.env.DB, userId), dueReviewCount: await getDueReviewCount(c.env.DB, userId, nowSeconds()) });
  } catch (error) {
    return errorResponse(error);
  }
});
