import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("initial D1 schema", () => {
  it("contains the core tables and idempotency columns", () => {
    const migration = readFileSync(resolve(process.cwd(), "../../migrations/0001_init.sql"), "utf8");

    expect(migration).toContain("CREATE TABLE users");
    expect(migration).toContain("CREATE TABLE sessions");
    expect(migration).toContain("CREATE TABLE turns");
    expect(migration).toContain("client_turn_id TEXT NOT NULL UNIQUE");
    expect(migration).toContain("CREATE TABLE turn_tokens");
    expect(migration).toContain("attempt_count INTEGER NOT NULL DEFAULT 0");
    expect(migration).toContain("first_attempt_at INTEGER");
  });

  it("contains the centralized learning content tables", () => {
    const migration = readFileSync(resolve(process.cwd(), "../../migrations/0002_learning_content.sql"), "utf8");

    expect(migration).toContain("CREATE TABLE content_sources");
    expect(migration).toContain("CREATE TABLE content_topics");
    expect(migration).toContain("CREATE TABLE content_phrases");
    expect(migration).toContain("Openjam");
    expect(migration).toContain("CC0");
  });
});
