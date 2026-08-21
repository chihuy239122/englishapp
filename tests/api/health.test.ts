import { describe, expect, it } from "vitest";
import { app } from "../../apps/api/src/index";

describe("GET /health", () => {
  it("returns a stable health response", async () => {
    const response = await app.request("http://localhost/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
