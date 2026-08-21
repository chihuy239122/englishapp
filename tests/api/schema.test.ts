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

  it("contains the curriculum, vocabulary and learner progress contract", () => {
    const migration = readFileSync(resolve(process.cwd(), "../../migrations/0003_curriculum_expansion.sql"), "utf8");

    expect(migration).toContain("CREATE TABLE content_modules");
    expect(migration).toContain("CREATE TABLE content_lessons");
    expect(migration).toContain("CREATE TABLE content_vocabulary");
    expect(migration).toContain("CREATE TABLE lesson_phrases");
    expect(migration).toContain("CREATE TABLE user_progress");
    expect(migration).toContain("ALTER TABLE sessions ADD COLUMN lesson_id TEXT");
    expect(migration).toContain("ALTER TABLE turns ADD COLUMN phrase_id TEXT");
    expect(migration).toContain("ipa TEXT");
  });

  it("keeps the extended CEFR bank isolated from the lesson vocabulary table", () => {
    const migration = readFileSync(resolve(process.cwd(), "../../migrations/0004_curriculum_levels.sql"), "utf8");

    expect(migration).toContain("CREATE TABLE content_levels");
    expect(migration).toContain("CREATE TABLE content_units");
    expect(migration).toContain("CREATE TABLE content_level_vocabulary");
    expect(migration).toContain("CREATE TABLE content_unit_sentences");
    expect(migration).toContain("A1");
    expect(migration).toContain("C1");
  });

  it("contains transcript matching and spaced-review progress fields", () => {
    const migration = readFileSync(resolve(process.cwd(), "../../migrations/0005_progress_matching.sql"), "utf8");

    expect(migration).toContain("ALTER TABLE user_progress ADD COLUMN matched_practices");
    expect(migration).toContain("ALTER TABLE user_progress ADD COLUMN next_review_at");
    expect(migration).toContain("ALTER TABLE turns ADD COLUMN phrase_match_score");
  });
});
