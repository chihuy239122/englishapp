import { Hono } from "hono";
import type { ApiEnv } from "../index";
import { requireSession, rowToTurn } from "../services/db";
import { errorResponse } from "../lib/errors";

export const historyRoutes = new Hono<ApiEnv>();

historyRoutes.get("/api/sessions/:id/turns", async (c) => {
  try {
    await requireSession(c.env.DB, c.req.param("id"));
    const rows = await c.env.DB.prepare("SELECT * FROM turns WHERE session_id = ? ORDER BY turn_index ASC").bind(c.req.param("id")).all<Record<string, unknown>>();
    return c.json(rows.results.map(rowToTurn));
  } catch (error) {
    return errorResponse(error);
  }
});
