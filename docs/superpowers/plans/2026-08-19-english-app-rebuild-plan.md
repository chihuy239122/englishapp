# English App Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the retired ALEX PRO production resources and local source while preserving the Cloudflare account credentials, then build and verify the new TypeScript/Hono English practice app described in `SPEC-english-app.md`.

**Architecture:** A single Hono Worker serves the API and the built web assets. The API owns Workers AI orchestration, D1 persistence, optional R2 audio storage, validation, and error handling; `packages/shared` owns the cross-layer contracts. Phase 5 adds the separate `ispeakerreact` Pages site and links it from the main app.

**Tech Stack:** TypeScript, Hono, Cloudflare Workers, Workers AI, D1, R2, Vite/React static assets, MediaRecorder, Vitest or Node test runner, Wrangler.

**Spec:** `D:\ALEXPRO\SPEC-english-app.md`

## Global Constraints

- 100% free Cloudflare plan: Workers, Pages, D1, R2, Workers AI.
- TypeScript throughout; Hono for the Worker API.
- iPhone Safari is the primary device; use `MediaRecorder`, never `SpeechRecognition`.
- No WebSocket or Durable Objects in the MVP; use HTTP POST per turn.
- The browser never calls Workers AI directly; all AI calls go through the Worker.
- The turn lifecycle is two-stage: `POST /api/sessions/:id/transcribe` returns editable STT, then `POST /api/sessions/:id/turns` accepts the finalized transcript and runs Llama/TTS/persistence.
- MediaRecorder MIME selection is feature-detected for iOS Safari; TTS playback is user-gesture-safe with a manual replay fallback.
- Worker AI calls have bounded output, timeout/error codes, quota fallback, and metadata-only diagnostics.
- `/transcribe` issues an opaque 15-minute `turnToken`; `/turns` validates its session/user binding and consumes it atomically only after successful persistence, allowing legitimate retries without replay. D1 stores `attempt_count` and `first_attempt_at` so the two-attempt/60-second limit is enforceable.
- `/turns` also requires a UUID `clientTurnId`; it is unique in D1 and makes post-commit/network-drop retries idempotent. A consumed token with the same client ID returns the stored turn and regenerates TTS only when prior audio was unavailable; a fresh token with an already-used client ID is rejected.
- Turn-token validation uses HMAC-SHA256 with the local-only `TURN_TOKEN_SECRET`; audio MIME validation uses mandatory magic-byte checks for WebM EBML, MP4 `ftyp`, WAV `RIFF/WAVE`, and AAC ADTS.
- The complete-turn flow has an 18-second global deadline with each LLM attempt capped at 5 seconds and TTS capped at 4 seconds. Only one repair or fallback branch may run, each requires its full budget, and TTS is skipped when less than 4 seconds remain; the response carries MeloTTS bytes inline as base64, capped at 256 KB and persisted in D1 for idempotent replay, never in R2.
- The shared error taxonomy includes fixed stage, code, message, and retryability mappings; fallback priority is primary Llama -> lower-cost Llama only on quota/transport/limit -> static response, with one prompt-repair retry only for malformed JSON.
- The UI state machine includes `EDITING_TRANSCRIPT -> RECORDING` and `EDITING_TRANSCRIPT -> IDLE` branches and preserves edited transcript/audio when TTS playback is blocked.
- Keep the Worker and every source module below the repository's 30 KB file limit; split by responsibility before a file grows beyond it.
- Preserve `learner_code` rules only if inherited code is referenced; the new MVP uses the SPEC's `userId` contract and must not copy ALEX learner data.
- Never print or place API tokens, service keys, admin keys, raw audio, or raw learner data in logs, documentation, tests, backups, or handoff files.
- Keep `D:\ALEXPRO\alex-pro-cloudflare.env` local-only and ignored; preserve its Cloudflare token without echoing its value.
- Preserve GitHub CLI authentication in the OS keyring; do not duplicate the GitHub token into project documentation or a new plaintext file.
- Before every external mutation, verify account `0af62f8ed73f84c95453102139345d6f` and run a harmless remote D1 `SELECT 1` where a D1 resource exists.
- Each phase must pass local tests and `wrangler deploy --dry-run` before the next phase.
- Before any implementation, Aki at `D:\ALEX_LAB` must delegate the same non-secret review packet to the real `claude` and `agy` targets and return both raw reviews plus a consensus report; a failed bridge or permission check blocks implementation.
- Claude owns and writes the complete UI/UX artifact; Codex must not author or redesign UI. Codex may consume the approved artifact, implement backend/API/shared contracts, and perform only minimal integration wiring.
- AGY independently adversarially reviews the Claude UI artifact and the backend/UI contract for Safari, accessibility, responsive layout, error states, and maintainability.
- Canonical GitHub remote is `https://github.com/chihuy239122/englishapp.git`; the public repository is currently empty, so no existing UI/source is accepted from it.
- GitHub CLI currently reports a different login identity from the repository owner; verify write permission before any push and never copy the keyring token into plaintext project files.

## Retained bootstrap files

- `AGENTS.md`: concise project rules, safety, release gates, and secret handling.
- `SPEC-english-app.md`: user-approved product specification.
- `alex-pro-cloudflare.env`: existing local Cloudflare credentials and non-public configuration; values stay out of logs and docs.
- `HANDOFF.md`: non-secret deployment identity and recovery instructions.
- `CLOUDFLARE_PROGRESS.md`: verified resource and phase ledger for the new project.
- `docs/PROJECT_CURRENT_STATE.md`: current local implementation state.
- `docs/superpowers/plans/2026-08-19-english-app-rebuild-plan.md`: this plan.

### Task 1: Capture a temporary recovery snapshot and remove old Cloudflare resources

**Files:**
- Create temporarily outside the new source tree: `D:\ALEXPRO-OLD-BACKUP-20260819\`
- Preserve: `D:\ALEXPRO\alex-pro-cloudflare.env`
- Delete after verified remote cleanup: old local source, old docs, old lessons, old Wrangler caches, old backups, and old generated archives.

**Interfaces:**
- Consumes: account ID and token from `alex-pro-cloudflare.env`; exact resource names verified by Cloudflare API.
- Produces: an empty Cloudflare project surface with account `0af62f8e…` still usable and no ALEX production resources left.

- [ ] Step 1: Copy the existing non-secret source and the encrypted/local recovery artifacts to the temporary recovery directory without printing file contents or secrets.
- [ ] Step 2: Record SHA-256 hashes and a file manifest for the temporary snapshot; exclude `.wrangler` caches, `node_modules`, terminal logs, and any file that contains a raw token unless the file is the explicitly retained local env file.
- [ ] Step 3: Re-query account `0af62f8ed73f84c95453102139345d6f` and verify the exact old resources: Worker `alex-pro-hub-api`, D1 `alex-pro-hub-db`, R2 `alex-pro-content`, Pages `alex-pro-admin`, `alex-pro-start`, and `alex-pro-voice`.
- [ ] Step 4: Run remote `SELECT 1 AS ok` on `alex-pro-hub-db` and verify `changes=0` before deletion.
- [ ] Step 5: Delete the three Pages projects, then the Worker, then the D1 database, then the R2 bucket. If R2 requires emptying, list and delete only objects in `alex-pro-content`, verify the bucket is empty, and retry the exact bucket deletion.
- [ ] Step 6: Re-list all four resource classes and assert none of the old names remain. Do not delete the Cloudflare account, API token, or GitHub login.
- [ ] Step 7: Remove the temporary old-project snapshot only after the post-delete resource assertions pass; retain the user-requested env file and the new handoff/state files.

### Task 2: Recreate the clean repository shell and secret-safe project identity

**Files:**
- Create: `AGENTS.md`
- Create: `HANDOFF.md`
- Create: `CLOUDFLARE_PROGRESS.md`
- Create: `docs/PROJECT_CURRENT_STATE.md`
- Create: `.gitignore`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `wrangler.jsonc`
- Create: `README.md`
- Preserve: `SPEC-english-app.md`, `alex-pro-cloudflare.env`

**Interfaces:**
- Consumes: the SPEC and the retained Cloudflare account credential file.
- Produces: a clean, secret-safe project shell with explicit resource names and release gates.

- [ ] Step 1: Write `.gitignore` entries for `.env*`, `alex-pro-cloudflare.env`, `.wrangler`, `node_modules`, `dist`, recordings, and local logs.
- [ ] Step 2: Write `AGENTS.md` under 30 KB with the source-of-truth rule, account ID, resource naming, secret rules, phase gates, and the requirement to update state/handoff after verified changes; do not include token values.
- [ ] Step 3: Write `HANDOFF.md` with project name `english-app`, account ID, intended resources `english-app-api`, `english_app_db`, `english-app-audio`, Pages `ispeakerreact`, local env path, and recovery commands that never echo secrets.
- [ ] Step 4: Write the initial state/progress docs with status `clean shell created; Phase 0 pending`; include only verified facts.
- [ ] Step 5: Write the workspace scripts for typecheck, test, build, and dry-run validation.
- [ ] Step 6: Run a secret-pattern scan over tracked candidate files and assert no token-like value appears in `AGENTS.md`, `HANDOFF.md`, README, or docs.

### Task 3: Phase 0 — Scaffold TypeScript, Hono, shared types, and D1 migration

**Files:**
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/env.ts`
- Create: `apps/api/src/lib/ids.ts`
- Create: `apps/api/src/lib/validation.ts`
- Create: `apps/api/src/routes/health.ts`
- Create: `packages/shared/types.ts`
- Create: `migrations/0001_init.sql`
- Create: `tests/phase0/health.test.ts`
- Modify: `package.json`, `tsconfig.json`, `wrangler.jsonc`, state/progress docs

**Interfaces:**
- `GET /health` returns `{ "status": "ok" }`.
- `Persona`, `Level`, `Correction`, and `TurnResponse` match the SPEC.
- D1 creates `users`, `sessions`, `turns`, indexes `idx_turns_session` and `idx_sessions_user`.

- [ ] Step 1: Write the failing health and schema tests.
- [ ] Step 2: Run the Phase 0 tests and confirm failure before implementation.
- [ ] Step 3: Implement the Hono app, strict environment bindings, shared types, request ID helper, and health route.
- [ ] Step 4: Add the exact D1 migration from the SPEC with foreign keys and indexes.
- [ ] Step 5: Run typecheck, unit tests, migration syntax checks, and `wrangler deploy --dry-run` against `english-app-api` configuration.
- [ ] Step 6: Update state/progress with test results and the next gate; do not create remote D1 until action-time confirmation is recorded.

### Task 4: Phase 1 — Fixed five-sentence Safari MediaRecorder pipeline

**Files:**
- Create: `apps/api/src/routes/phase1.ts`
- Create: `apps/api/src/services/audio-input.ts`
- Create: `apps/api/src/services/whisper.ts`
- Receive from Claude: `ui/claude-artifact/phase1/` containing the complete UI source, assets, responsive behavior, and UI test evidence.
- Create: `apps/web/ui-contract.ts` only if needed to expose backend-owned typed contracts; do not place visual/UI decisions here.
- Create: `tests/phase1/recorder.test.ts`
- Create: `tests/phase1/whisper-route.test.ts`

**Interfaces:**
- Client feature-detects `audio/mp4`, `audio/aac`, `audio/webm;codecs=opus`, and only uses `audio/wav` when the blob remains under 8 MB.
- Recording is capped at 60 seconds.
- API accepts a multipart `audio` field, calls Whisper, and returns a transcript or a clear retryable 422 for empty/short speech.
- `POST /api/sessions/:id/transcribe` is the only Phase 1 AI route; it never calls Llama or MeloTTS.
- The Claude artifact must expose the explicit `IDLE → RECORDING → UPLOADING_STT → EDITING_TRANSCRIPT → ERROR/COMPLETE` state flow and iOS-safe MIME fallback.
- The Claude artifact must expose re-record and cancel branches from transcript editing, user-gesture audio unlock/manual replay, and 375/768/1440 plus keyboard/VoiceOver evidence.
- The API defines the shared stage/code/retryability error taxonomy, including `AUDIO_MIME_INVALID`, `AUDIO_SIZE_EXCEEDED`, `DURATION_EXCEEDED`, `STT_EMPTY`, `STT_FAILURE`, `TURN_TOKEN_EXPIRED`, `TURN_TOKEN_USED`, `TURN_CLIENT_ID_INVALID`, `TURN_RETRY_LIMIT`, `TRANSCRIPT_INVALID`, `LLM_TIMEOUT`, `LLM_QUOTA_EXCEEDED`, `LLM_JSON_MALFORMED`, `TTS_FAILURE`, and `DB_PERSIST_ERROR`.
- Audio validation is strict: the server checks WebM EBML, MP4 `ftyp`, WAV `RIFF/WAVE`, or AAC ADTS magic bytes in addition to the declared MIME and 8 MB limit.

- [ ] Step 1: Write tests for MIME fallback, 60-second stop, multipart validation, and the short-transcript 422 response.
- [ ] Step 2: Run tests and verify they fail.
- [ ] Step 3: Wait for Claude's complete Phase 1 UI artifact and Aki's recorded AGY review; reject the artifact if either review or required viewport evidence is missing.
- [ ] Step 4: Implement only the Worker Whisper route and temporary neuron-usage diagnostic logging with no audio or token logging.
- [ ] Step 5: Run tests, typecheck, build, and `wrangler deploy --dry-run`; document the required iPhone Safari acceptance check.
- [ ] Step 6: After explicit deploy confirmation, create the new remote D1/R2 resources only as required by the current phase and verify `/health` live.

### Task 5: Phase 2 — Llama conversation partner for beginner level

**Files:**
- Create: `apps/api/src/ai/personas.ts`
- Create: `apps/api/src/ai/prompts.ts`
- Create: `apps/api/src/ai/llama.ts`
- Create: `apps/api/src/routes/turns.ts`
- Create: `tests/phase2/llama-json.test.ts`
- Modify: `apps/api/src/index.ts`, shared types, phase 1 UI, state/progress docs

**Interfaces:**
- `POST /api/sessions/:id/turns` accepts JSON `{ transcript, turnToken, clientTurnId }`; it never accepts raw audio and must process the learner-edited transcript.
- `/transcribe` issues an opaque 15-minute `turnToken`; D1 stores only its HMAC hash plus session/user binding, attempt counter/window, and optional R2 key, and a transaction consumes it only after successful turn persistence so legitimate retries work.
- `clientTurnId` must be a UUID and is unique in D1. If the same client ID is retried after a committed turn, the API returns the stored turn and regenerates TTS only when the prior turn has no audio; a different ID cannot reuse the consumed token. A client ID already attached to another turn with a fresh token returns `TURN_CLIENT_ID_INVALID`. Processing retries are capped at two within 60 seconds.
- Token validation uses HMAC-SHA256 with `TURN_TOKEN_SECRET`; complete-turn orchestration uses an 18-second global deadline, with LLM attempts capped at 5 seconds and TTS at 4 seconds.
- If a client ID already exists on a different turn while the presented token is still unused, return `TURN_CLIENT_ID_INVALID`; if less than 4 seconds remain after AI, persist without TTS and return `audioAvailable=false`. TTS bytes are returned inline in `audioBase64`, not written to R2.
- Llama uses `max_tokens: 350` with a compact schema, one prompt-repair JSON retry, then the fixed fallback chain: lower-cost model only for transport/quota/limit, then static fallback.
- The route returns structured stage-specific errors and preserves a valid turn when TTS is unavailable (`audioAvailable=false`).
- Llama receives only the latest 3–5 turns and a strict JSON schema.
- One JSON parse retry is allowed; failure returns a static safe fallback and an empty correction array.

- [ ] Step 1: Write tests for prompt persona text, 3–5-turn context trimming, valid JSON parsing, retry, and static fallback.
- [ ] Step 2: Run tests and verify failure.
- [ ] Step 3: Implement the beginner `conversation_partner` path after the approved Claude UI artifact exposes the transcript-edit state; route orchestration through Worker-only AI bindings.
- [ ] Step 4: Run tests, typecheck, build, and dry-run deploy.
- [ ] Step 5: Verify a safe live turn after action-time deployment confirmation and record only status/latency/neuron metadata.

### Task 6: Phase 3 — MeloTTS and complete D1 persistence

**Files:**
- Create: `apps/api/src/ai/melotts.ts`
- Create: `apps/api/src/services/sessions.ts`
- Create: `apps/api/src/services/turns.ts`
- Create: `apps/api/src/routes/sessions.ts`
- Create: `apps/api/src/routes/history.ts`
- Create: `tests/phase3/persistence.test.ts`
- Modify: migration/config/shared types and phase 2 routes

**Interfaces:**
- `POST /api/sessions` accepts `{ userId, persona, level }` and returns `{ sessionId }`.
- `GET /api/sessions/:id/turns` returns session history.
- `TurnResponse.audioBase64` contains MeloTTS bytes encoded as base64; the capped value and `audioAvailable` flag are persisted in D1 for idempotent replay, and no AI response audio is stored in R2.

- [ ] Step 1: Write tests for session creation, turn persistence, correction JSON serialization, history ordering, and base64 response shape.
- [ ] Step 2: Run tests and verify failure.
- [ ] Step 3: Implement D1 repositories and MeloTTS encoding.
- [ ] Step 4: Run unit/integration tests, migration checks, typecheck, build, and dry-run.
- [ ] Step 5: Deploy only after confirmation, run remote readback for a safe session, and update handoff/state/progress.

### Task 7: Phase 4 — Persona/level UI, optional R2 user audio, and stats

**Files:**
- Receive from Claude: `ui/claude-artifact/phase4/` containing the complete persona/level UI, transcript editor, corrections list, audio player, stats chart, responsive behavior, and UI tests.
- Create: `apps/web/ui-contract.ts` only for backend-owned typed API responses; do not author UI layout or styling.
- Create: `apps/api/src/routes/stats.ts`
- Create: `apps/api/src/services/user-audio.ts`
- Create: `tests/phase4/stats.test.ts`
- Modify: `wrangler.jsonc`, API routes, web styles, shared types

**Interfaces:**
- UI supports all four personas and all three levels.
- `GET /api/users/:id/stats` returns aggregate minutes, turn count, and per-day values from `sessions`/`turns` only.
- `SAVE_USER_AUDIO=true` conditionally writes `audio/{userId}/{sessionId}/{turnId}.webm` to R2; false never writes audio.

- [ ] Step 1: Write tests for persona/level validation, stats aggregation, save flag behavior, and R2 key format.
- [ ] Step 2: Run tests and verify failure.
- [ ] Step 3: Verify Claude delivered the complete UI artifact and Aki recorded AGY's independent acceptance for all required states and viewports.
- [ ] Step 4: Implement the API, D1 aggregation, optional R2 upload, and typed integration contract; keep all R2 operations behind the Worker.
- [ ] Step 5: Run Claude's UI tests plus backend tests, responsive browser checks, typecheck/build/dry-run; Codex may test but must not redesign UI.
- [ ] Step 6: After confirmation, deploy and verify the real flow with safe data; set the 45-day `audio/` lifecycle rule through supported Cloudflare configuration and record whether dashboard action is required.

### Task 8: Phase 5 — Separate `ispeakerreact` Pages app and final integration

**Files:**
- Receive from Claude: `ui/claude-artifact/phase5-ispeakerreact/` source and build configuration
- Create: `pages/ispeakerreact/README.md`
- Modify: main web navigation, `HANDOFF.md`, state/progress docs

**Interfaces:**
- The main app links to the independently deployed `ispeakerreact` Pages URL.
- The Pages app does not call Workers AI directly and does not duplicate the API's session/turn data.

- [ ] Step 1: Write a smoke test for the link and Pages build output.
- [ ] Step 2: Verify Claude's separate Pages artifact and Aki/AGY review before accepting it; Codex only supplies backend/API contract integration.
- [ ] Step 3: Run the Pages build, link smoke test, responsive checks, and dry-run.
- [ ] Step 4: After explicit publish confirmation, deploy Pages and verify the canonical URL from the main app.

### Task 9: Release verification and handoff

**Files:**
- Modify: `AGENTS.md`, `HANDOFF.md`, `CLOUDFLARE_PROGRESS.md`, `docs/PROJECT_CURRENT_STATE.md`, `README.md`
- Create: `scripts/create-english-app-handoff.ps1`
- Create: `scripts/test-english-app-handoff.ps1`
- Create: `docs/reviews/` review receipts for Aki, Claude, and AGY

**Interfaces:**
- Handoff records only verified account/resource identifiers, deployment versions, migrations, checks, and open blockers.
- The handoff script exports source metadata and D1 schema without secrets, then writes a SHA-256 manifest.

- [ ] Step 1: Write handoff validation tests that fail if docs contain token-like values or disagree on resource names.
- [ ] Step 2: Implement the handoff script with explicit secret exclusions.
- [ ] Step 3: Run all unit, integration, build, syntax, responsive, dry-run, and handoff checks.
- [ ] Step 4: Run the final ECC hook phases `after-edit` and `before-final`.
- [ ] Step 5: Verify live health, session creation, fixed pipeline, conversation turn, TTS, stats, optional R2 behavior, and `ispeakerreact` link after the final authorized deployments.
- [ ] Step 6: Update the state/progress ledger with verified facts only and report endpoint/resource status, permissions, deployment environments, device checks, remaining gaps, and next step.
- [ ] Step 7: Run Aki's post-implementation review packet through real Claude and AGY; if either target is unavailable or cannot read the approved artifact/diff, mark the release blocked.

## Verification gates

- No production resource deletion happens until exact-name revalidation and remote `SELECT 1` pass.
- No new resource creation, D1 migration, Worker deployment, or Pages publish happens without action-time confirmation for that mutation.
- No GitHub push or repository mutation happens until write permission and the real Claude/AGY review gate are verified.
- A phase is not complete from local tests alone; the relevant live route and user flow must be checked after authorized deployment.
- A final report must distinguish: deleted old resources, retained credential files, newly created resources, verified endpoints, permission blockers, device checks, and remaining manual dashboard actions.
