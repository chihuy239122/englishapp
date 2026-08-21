import { Hono } from "hono";
import { sessionRoutes } from "./routes/sessions";
import { transcribeRoutes } from "./routes/transcribe";
import { turnRoutes } from "./routes/turns";
import { historyRoutes } from "./routes/history";
import { statsRoutes } from "./routes/stats";
import { contentRoutes } from "./routes/content";
import { cors } from "hono/cors";

export interface ApiBindings {
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  DB: D1Database;
  AUDIO_BUCKET?: R2Bucket;
  AI?: { run(model: string, input: unknown): Promise<unknown> };
  TURN_TOKEN_SECRET?: string;
  TURN_DEADLINE_MS?: string;
  SAVE_USER_AUDIO?: string;
}

export type ApiEnv = { Bindings: ApiBindings };

export const app = new Hono<ApiEnv>();

app.use("/api/*", cors({
  origin: (origin) => [
    "https://ispeakerreact-5u6.pages.dev",
    "http://localhost:3000",
    "http://localhost:3001",
  ].includes(origin) ? origin : undefined,
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"],
}));

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/", sessionRoutes);
app.route("/", transcribeRoutes);
app.route("/", turnRoutes);
app.route("/", historyRoutes);
app.route("/", statsRoutes);
app.route("/", contentRoutes);

app.all("*", async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }

  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }

  return c.json({ error: "Not found" }, 404);
});

export default {
  fetch: app.fetch,
};
