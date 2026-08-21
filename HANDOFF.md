# ALEX PRO handoff snapshot

Release source: v7.2.0
Created UTC: 2026-08-13T06:06:29.8727395Z

This package contains source, deployment state and a complete D1 SQL export. It excludes credentials, browser sessions, node_modules and Wrangler cache.

Read AGENTS.md, docs/PROJECT_CURRENT_STATE.md, CLOUDFLARE_PROGRESS.md, then manifest.json before making changes. The D1 export includes learner aliases and hashed learner codes; share it only with an authorized AI or operator. Never restore it to production without an explicit approved recovery plan.

Canonical Cloudflare deployment account: **0af62f8ed73f84c95453102139345d6f**. Target Worker/D1: **alex-pro-hub-api** / **alex-pro-hub-db**. Load only the project token from local alex-pro-cloudflare.env; an email shown by wrangler whoami is not enough. Before any mutation, prove the target resource account and run remote SELECT 1; stop on 7403 or any authorization error.

## English App rebuild handoff

The new source tree is the TypeScript/Hono English App described in `SPEC-english-app.md`.

- Planned Worker: `english-app-api`
- D1: `english_app_db` (ID `4ea5ccaa-c901-496c-ac0c-5854733c1428`)
- R2: `english-app-audio`
- Pages app: `ispeakerreact` (`https://ispeakerreact-5u6.pages.dev`)
- Cloudflare account: `0af62f8ed73f84c95453102139345d6f`
- Canonical GitHub remote: `https://github.com/chihuy239122/englishapp.git`
- Cloudflare project env remains local-only at `D:\ALEXPRO\alex-pro-cloudflare.env`; values are never copied into this file.
- GitHub authentication remains in the OS keyring; no GitHub token is stored in this file.
- Production deployment verified 2026-08-21: Worker `english-app-api` version `d4212dde-9880-40e6-b876-a6e2250ff50f`, live URL `https://english-app-api.chihuy239122.workers.dev`; D1 `english_app_db` ID `4ea5ccaa-c901-496c-ac0c-5854733c1428`; R2 `english-app-audio`; Pages `ispeakerreact` live URL `https://ispeakerreact-5u6.pages.dev`.
- `TURN_TOKEN_SECRET` exists in the Worker secret store; its value is not stored here or in source.
- Local verification: UI `25/25`, API `9/9`, TypeScript builds, `npm audit --omit=optional` for root and Pages, Wrangler dry-run. Live verification: Worker health/root, session creation, history, stats, invalid transcript handling, and synthetic-data cleanup; Pages HTTP 200.
- Retired production resources were deleted after snapshot and remote D1 `SELECT 1`: old Worker, D1, R2 (63 objects emptied), and three Pages projects. A recoverable local snapshot remains outside the project at `D:\ALEXPRO-OLD-BACKUP-20260820`.
- Current curriculum handoff: D1 migrations `0003_curriculum_expansion.sql` and `0004_curriculum_levels.sql` are applied; source includes 4 practice modules/16 lessons, CEFR A1–C1 levels/15 units, and progress APIs. Latest source commit is `7528163`.
- R2 lifecycle verified: enabled rule `audio-retention` expires objects under `audio/` after 45 days; default multipart-abort rule also remains enabled.
