# ALEX PRO — Project Current State

**Updated:** 2026-08-13
**Release status:** v8.0.0 Curriculum Sync — 34 lessons fully expanded A1→C1. Admin Panel UI upgraded to Premium Dark Mode (Glassmorphism).

## 2026-08-13 — Admin Panel & Voice App UI/UX Pro Max Redesign (PRODUCTION ✅)
- **Voice App Redesign**: Upgraded `d:\ALEXPRO\alex-pro-voice\index.html` and `styles.css` with a **Premium Bento Grid Learning Hub** architecture. "Luyện Phát Âm" is prioritized as the hero card, with "Học Từ Vựng" and "Hội Thoại" parallel below. Replaced generic emojis with clean SVG icons.
- **Admin Panel Redesign**: Upgraded `d:\ALEXPRO\alex-pro-admin\index.html` with a premium dark mode palette (Midnight Blue and Electric Purple) and glassmorphism styling. Applied smooth transitions and elevated hover states.
- **No Logic Changes**: All functionality (API fetching, keys, etc.) remains fully intact.
- **Pages Deployment**: Deployed successfully to Cloudflare Pages via manual direct upload on the correct account.
  - Admin: `https://alex-pro-admin.pages.dev`
  - Voice: `https://alex-pro-voice.pages.dev`

## v8.0.0 — Full curriculum sync (LOCAL + R2 + D1 ✅; GPT Builder FILE_2 pending re-upload)

- **34 lesson files** now fully expanded with 10-section standard: objectives, lesson plan table, vocabulary groups with IPA, grammar, pronunciation drills, model dialogue, role play, 5-axis scoring, homework, progress tracking.
- **LES-0007–0020** (14 files): expanded from ~1.7 KB skeletons to 7–9 KB full lessons. Typo fixed: `LES-0010_Home_and_Choes.md` → `LES-0010_Home_and_Chores.md`.
- **LES-0021–0027** (7 files): standardised from ~3 KB partial format to full 10-section with IPA, scoring, and progress sections. Source: Giao_Trinh_Chi_Tiet_Tuan_1_60Phut_V3.pdf.
- **LES-0028–0034** (7 new files): Week 2 curriculum created — Mealtime & Food, Making Phone Calls, Weekend Plans, Describing People, Weather & Seasons, Banking & Money, Week 2 Review.
- **D1 migration `0008_curriculum_week2.sql`**: added LES-0028–0034 to `lesson_catalog`; D1 now contains 27 published lessons. Readback confirmed all 27 rows.
- **R2 upload**: all 28 updated/new lesson files uploaded to `alex-pro-content` bucket under `lessons/` prefix. 28/28 succeeded, 0 failed.
- **FILE_2_KNOWLEDGE_CORE.md**: updated to v8.0.0 with full 34-lesson catalog table.
- No Worker code change, no D1 schema migration (only data), no new secrets required.
- Next: re-upload `FILE_2_KNOWLEDGE_CORE.md` to GPT Builder Knowledge to reflect 34 lessons.



## v7.2.0 — Core-synchronised English voice curriculum (API + ALEX Voice PRODUCTION; Custom GPT processing pending)

- ALEX Voice now reads the same published lesson catalogue and learner checkpoint as the GPT/Worker; it has no static lesson source.
- A signed learner chooses only an allowed lesson. The selection safely updates that learner's current lesson through the Worker, so the next GPT turn and Voice session begin from the same lesson.
- Each lesson is delivered as: choose lesson → one group of 2–3 words/phrases with Vietnamese meaning and English example → listen to the model → record/replay locally → short English dialogue prompt.
- English model speech has learner-controlled slow, normal and fast modes. GPT uses clear pacing instructions while ALEX Voice changes only English sample playback; Vietnamese explanations remain natural and brief.
- ALEX now waits for a full learner sentence before reacting. It cannot praise, correct, paraphrase or guess a partial/uncertain utterance; it asks the learner to finish instead.
- A topic is completed only after its relevant vocabulary has been practised in groups of 2–3. Only then does ALEX offer up to three remaining lesson themes for the learner to choose from.
- The parser returns only structured objective, vocabulary, examples and dialogue prompt; it never returns the raw lesson document to the browser.
- Verified locally: 58/58 Worker tests and updated Voice syntax checks pass. A pre-release D1/source/manifest handoff was created and integrity-checked. Worker `alex-pro-hub-api` version `d117a806-541c-40c0-b603-494be26608de` is live; `/v1/health` returned HTTP 200 and Voice curriculum CORS preflight returned HTTP 204 for the canonical Voice origin. ALEX Voice production deployment `264029e8` is live and the canonical URL returns the speech-speed control with a cache-busting request.

- The reported production behavior was invalid: ALEX gave generic Vietnamese conversation, implied an unsupported learner history, and did not visibly ground the next turn in the assigned lesson.
- Local GPT source now requires `getLearnerProgress` followed by `getAssignedLesson` before any teaching. It uses only the Action-returned level/checkpoint, lesson, 2–3 target chunks and resume evidence; absent evidence must never become a fabricated past topic or learner answer.
- Teaching is English-led bilingual: target 80–90% English; Vietnamese is a brief meaning/repair bridge, followed immediately by English practice. Unclear speech triggers a short repair prompt; a learner who cannot yet speak is scaffolded with Starter Zero rather than a free Vietnamese conversation.
- `FILE_1_INSTRUCTIONS.md`, `FILE_2_KNOWLEDGE_CORE.md`, `FILE_3_PROGRESS_AND_SETUP.md`, both OpenAPI files and release-sync checks carry v7.2.0. No Worker/D1 schema migration was required. The Custom GPT Builder contains one Knowledge Core file and the v7.2.0 Instructions; its publish submission is visibly marked “Cập nhật đang chờ xử lý”, so its new turn-discipline behavior must be re-checked after provider processing completes.
- Browser delivery proof: the public ALEX PRO card shows v7.2.0; the protected signed-learner/Fish sample path still requires a human to complete Turnstile with an authorized learner session. Do not claim that protected audio or a full signed lesson was verified until that step is completed.

## Source of truth

- Worker/API/Admin source: `D:\ALEXPRO`.
- GPT source: `D:\ALEXPRO\FILE_1_INSTRUCTIONS.md` and `D:\ALEXPRO\alex-pro-openapi-v3.yaml`.
- Cloudflare production: Worker `alex-pro-hub-api`, D1 `alex-pro-hub-db`, R2 `alex-pro-content`, Admin Pages `alex-pro-admin.pages.dev`, public registration Pages `alex-pro-start.pages.dev`, and voice companion Pages `alex-pro-voice.pages.dev`.
- **Canonical Cloudflare account:** `0af62f8ed73f84c95453102139345d6f` only. Do not infer authorization from the email printed by `wrangler whoami`; the preflight must prove the resource account and a harmless remote D1 `SELECT 1`. The release preflight passed on 2026-08-07 before the v7 Worker deploy; it made no D1 changes.
- Current GPT Builder: ALEX PRO v7.2.0 Instructions and one `FILE_2_KNOWLEDGE_CORE.md` Knowledge file are submitted for publication; wait for the provider’s pending-update indicator to clear before treating the instruction change as fully live.
- Release handoff: `HANDOFF.md` is the quick, human-readable deployment identity for an authorized AI/operator. `scripts\create-alex-handoff.ps1` refreshes it and exports D1 plus an integrity manifest and source ZIP before release and after live verification; `backups\LATEST.md` points to the latest snapshot.

## Production v7.0.0 — prepared lessons, conversation-only delivery

- Learner-facing mode is conversation-first: prepared lessons remain the private content bank, while the learner experiences one continuous Voice Mode conversation. ALEX never asks the learner to type, does not expose Mục/Pha/score/CEFR, and does not finish a topic or lesson until the learner explicitly asks to stop.
- No Worker or D1 migration is needed for this delivery change. v7.0.0 uses the already valid checkpoint contract `mode=lesson`, the assigned `lesson_id`, internal `lesson_phase_n`, and a compact `conversation-v1` value in `taught_items`; it never calls the unsupported `mode=conversation`.
- Each small topic requires three meaningful exchanges, a changed context and one learner question back to ALEX before continuing. New vocabulary is read aloud by ALEX in Voice Mode, practised in the conversation, then corrected with recast or one short retry when meaning is affected.
- ChatGPT cannot activate Voice Mode itself; the learner taps the Voice/microphone control once, then can learn by speaking only. ALEX saves only when the learner says stop/save/end, never after each turn.
- v7.0.0 supersedes the pending Builder content of v6.9.0. The Fish sample/replay website remains a separately staged optional prototype and is not required for the conversation-only GPT release.
- Worker `alex-pro-hub-api` version `a20271ee-fc08-426a-ad5f-4ca7c04989f9` was deployed after local 52/52 tests, JavaScript syntax and OpenAPI validation passed. `/v1/health` returned `status: ok` after deploy. No Worker schema or D1 migration was needed for this instruction-delivery release.
- Browser verification opened the published GPT URL, confirmed v7.0.0 description, the Voice-first starter, one Knowledge Core file, and the new Action schema. A safe starter test returned: press Voice/microphone, then read the learner code aloud or use the 30-day registration page; it did not request typing.

## Production v7.1.0 — ALEX Voice companion; Azure scoring deferred

- `https://alex-pro-voice.pages.dev/` is a published public companion site. Its first deployment URL is `https://90678f09.alex-pro-voice.pages.dev`; canonical Pages returned HTTP 200 after publish.
- Worker `alex-pro-hub-api` release version `69ada49b-0b02-40aa-853e-2817c481806f` is the named v7.1.0 source sync. Remote migration `0006_voice_learning_v690.sql` is applied and `voice_assessments` plus `voice_request_rate_limits` were read back from the production D1 database.
- The Worker has `VOICE_APP_ORIGIN`, `VOICE_SESSION_SECRET`, `VOICE_RATE_LIMIT_SALT`, and `FISH_API_KEY` configured as secrets. Values are never stored in source, backups, D1, or handoff text. Turnstile now allows both `alex-pro-start.pages.dev` and `alex-pro-voice.pages.dev`.
- A learner signs in once with the permanent learner code and Turnstile. The short-lived token is only in `sessionStorage`, is origin scoped, and is never put in a URL or Custom GPT Action.
- The non-Azure website plays Fish sample audio and records/replays locally. `pronunciationAssessmentEnabled` remains `false`, so it does not post a learner recording to `/assess`, write an automatic score, or claim a transcript. GPT Voice Mode remains the qualitative coach for `Mục Shadowing & phát âm`.
- `docs/voice-api-openapi-v1.yaml` is the browser contract; `alex-pro-openapi-v3.yaml` is the Custom GPT Action contract. FILE_1 and Knowledge send an active learner to the published voice URL while accurately describing the no-score, local-replay mode.
- Verification: Worker suite 52/52, syntax checks and both OpenAPI lints pass. Browser checks passed at 375×812, 768×1024 and 1440×1000 with no horizontal overflow. Production CORS preflight returned 204 and allowed only `https://alex-pro-voice.pages.dev`; the public GPT v7.1 response returned the website link and did not promise audio upload or a numeric score.
- The protected full sign-in/Fish audio flow still needs a final real-learner acceptance check after a learner manually completes Turnstile. Azure Speech key/region must not be added until automatic scoring is separately approved.

## Production v6.8.0 — verified learner account, curriculum and named sections

- Self-registration and Admin creation require **Tên ALEX gọi** plus a 9–15 digit phone. New code is simple uppercase name plus the final six phone digits (example format `HUY128999`); only a real collision appends `2`, then `3`, and so on. New-code lookup is case-insensitive; legacy codes remain unchanged.
- The Worker stores the hash for lookup plus AES-GCM encrypted admin-only copies of the learner code and registered phone. Existing learners are never changed; Admin can link a known legacy code and optionally add the missing phone for display.
- Admin list will show every registered account field: name, learner code, phone, level, lesson, access and creation date. The overview now reads its lesson count from the live published catalog instead of a hard-coded number.
- Curriculum source expands from 6 to 20 published lessons: A0 support, A1 LES-0001…0006, A2 LES-0007…0012, B1 LES-0013…0016, B2 LES-0017…0018 and C1 LES-0019…0020. Every new lesson has 8 named learner-facing sections, grouped vocabulary, questions, dialogue, role play and homework. Daily Route now contains 16 routine phrases taught in groups of 2–3.
- Learner-facing text says **Mục 1/8 … Mục 8/8** (for example “Mục 5/8: Shadowing & phát âm”); `lesson_phase_n` remains internal checkpoint compatibility only. Public GPT demo visibly starts with `Daily Route — Mục 1/8: Mục tiêu & check-in`.
- Cloudflare Worker version `7d845794-c316-4c4a-9428-d13297d65369` is healthy. Remote D1 migrations `0004_learner_code_vault.sql` and `0005_curriculum_v680.sql` are applied; the published catalog reports 20 lessons. R2 lesson delivery was read back through the live Worker with the named vocabulary, shadowing and dialogue sections.
- Safe live probe created and deleted an isolated account. It verified health/vault readiness, 30-day trial access to Daily Route, 403 for a later lesson while trial, 365-day extension, subsequent access to an advanced lesson, case-insensitive new-code lookup, and authenticated Admin display of the registered code and phone. No test learner remains.
- Public Admin browser check shows the live 20-lesson count and learner list columns: Tên ALEX gọi, Mã học viên, Số điện thoại, level, lesson, access and creation date. Public registration browser check shows both required fields and the simple name-plus-last-six-digits explanation.
- Builder now publishes local `FILE_1_INSTRUCTIONS.md`, `FILE_2_KNOWLEDGE_CORE.md` and OpenAPI v6.8.0. The public GPT demo was tested after publishing and uses the learner-facing “Mục” naming rather than “Pha”.

## Production v6.7.0 — historical four-skill Placement baseline

- `worker/resume.js` validates CEFR A1–C1, four required skill scores for `placement_complete`, `next_step` and a bounded `suggested_path`. Structured placement is stored in the existing resume state; no migration or second progress source was added.
- The existing routes remain canonical: `POST /v1/progress/placement` atomically saves a completed placement; `POST /v1/progress/checkpoint` saves placement/lesson progress in between; `POST /v1/progress/read` returns the parsed placement result when it is the current resume state. No duplicate `/resume` route exists.
- Trial is entitlement-only and unlimited in-session during its 30 days. It permits placement plus Daily Route (`LES-0001`) and blocks later lessons; paid accounts may use the full published path.
- `FILE_1_INSTRUCTIONS.md`, `FILE_2_KNOWLEDGE_CORE.md`, `FILE_3_PROGRESS_AND_SETUP.md` and `alex-pro-openapi-v3.yaml` declare v6.7.0. They specify the same four-skill CEFR contract, question bank, learning-path map and six conversation starters.
- Local verification: 21 tests pass with 93.03% line coverage, including placement completion/readback/invalid-band/in-progress/no-resume/missing-code, the trial access boundary and a release-source synchronization test. OpenAPI lint passes with no warnings.
- Production verification: Worker v6.7.0 passed health; an isolated trial could read Daily Route, was denied the following lesson, saved and read back a rich placement result, rejected an invalid CEFR band, then was deleted. The public GPT displays v6.7.0, the four visible starters prioritize placement, and the English placement starter asks for the learner account or trial registration before beginning.

## Verified production baseline

- Production Worker version: `5aff2a94-ec9c-4ff7-8be3-433bfb6c08d5` (2026-08-07); `/v1/health` returns `status: ok`.
- Remote D1 migration `0003_resume_and_entitlements.sql` ran successfully (six statements) and added entitlement, event, resume and public rate-limit tables.
- Learner account #1 reads as `paid`, active, on `LES-0001`, with access through 2027-08-07. No resume checkpoint has yet been saved for the earlier chat session.

## Release shipped

- Permanent learner code/account; no replacement code at renewal.
- Public self-registration at `https://alex-pro-start.pages.dev/` with a random account code and fixed 30-day trial.
- Admin extension in days; standard paid renewal is 365 days / 50,000 VND.
- Resume checkpoint persistence so the GPT returns to the correct placement/lesson step.
- GPT access wording, conversation starters and Action contract match the live API.

## Verified implementation and release evidence

- `worker/migrations/0003_resume_and_entitlements.sql` creates resume and entitlement tables without modifying existing learner columns.
- `worker/tests/access.test.mjs` and `worker/tests/release-sync.test.mjs` have 21 local passing tests covering cumulative renewal, random-code trial creation, public fail-closed registration, checkpoint recovery, expired access, Admin lifecycle, four-skill placement, trial boundaries, published lesson read, attempts, bounded errors and release-source synchronization. Line coverage is 93.03%.
- `worker/migrations/0003_resume_and_entitlements.sql` executed successfully against local and remote D1 states (six statements each).
- `worker/worker.js`, `access.js`, `registration.js`, and `resume.js` implement the matching local API; all JavaScript files are below 30 KB.
- `alex-pro-admin/index.html` creates random-code trials and extends the existing account; `alex-pro-start/index.html` is the live public registration source, protected by Turnstile. The response reader uses the standard hidden Turnstile token so it works even when the global JavaScript API is unavailable.
- `FILE_1_INSTRUCTIONS.md`, `FILE_2_KNOWLEDGE_CORE.md`, `FILE_3_PROGRESS_AND_SETUP.md` and `alex-pro-openapi-v3.yaml` v6.7.0 are synchronized with the live Worker and published GPT. Builder lists six actions and no skipped-function warning.
- Real production checks: Admin-created trial, public Turnstile registration, 365-day same-account renewal, Worker progress read and test-account cleanup all passed. Public UI passed 390px, 768px and 1440px no-horizontal-overflow checks.

## Open follow-up

1. Observe first real learner registrations and expiry/renewal events; do not change the permanent-code contract.
2. Add an explicit checkpoint from a real learner chat after a placement skill and a lesson phase to confirm conversational resume end-to-end.
3. For every future release, run the handoff script before deploy and after live verification; supply its local `LATEST.md`, manifest and ZIP only to an authorized AI/operator.

## English App rebuild — review gate status before user waiver (2026-08-20)

- `SPEC-english-app.md` and `docs/superpowers/plans/2026-08-19-english-app-rebuild-plan.md` now define the two-stage STT/edit/turn contract, HMAC-bound turn tokens, atomic retry limit, UUID client idempotency, strict audio magic-byte validation, bounded AI orchestration, inline TTS base64 delivery, iOS audio priming, and responsive/accessibility gates.
- Aki dispatched the same final non-secret packet to the real `claude` and `agy` targets. AGY returned `REVISE` with findings incorporated into the contract. Claude currently returns `No eligible account from Pool Scheduler`, so the required Claude raw review and consensus are still missing.
- This section records the pre-waiver blocked state. The user later waived the review gate and authorized production mutations; the current release status is recorded below.
- Evidence: `docs/reviews/2026-08-20-aki-english-app-review-blocked.md`.
- Next gate: retry Aki Claude dispatch when an eligible Claude account is available, then obtain a fresh identical-packet AGY review and record a no-P0 consensus before implementation.

## English App implementation started after user waiver (2026-08-20)

- AGY created the complete UI artifact under `apps/web`, including the typed API client, MediaRecorder flow, transcript editor, state machine, audio priming/manual replay, stats view, responsive CSS, and UI tests.
- Codex created the Phase 0–3 backend foundation under `apps/api`, `packages/shared`, and `migrations/0001_init.sql`: Hono health/static serving, session/transcribe/turn/history/stats routes, strict audio container checks, token HMAC/idempotency services, bounded Llama/MeloTTS orchestration, and D1 persistence contracts.
- Verified locally: UI `17/17` tests pass; API `9/9` tests pass; web and API TypeScript builds pass; `npm audit --omit=optional` reports 0 vulnerabilities; `wrangler deploy --dry-run` passes and lists DB/R2/AI/Assets bindings; local Worker `/health` returns `{ "status": "ok" }` and serves the built web app.
- Remaining at the pre-waiver checkpoint: real iPhone Safari/browser viewport verification and production work; see the production release section below for the current state.

## English App production release (2026-08-20)

- Retired Cloudflare resources were deleted after a verified snapshot and remote `SELECT 1`: `alex-pro-hub-api`, `alex-pro-hub-db`, `alex-pro-content` (63 objects emptied), `alex-pro-admin`, `alex-pro-start`, and `alex-pro-voice`.
- New resources are live: Worker `english-app-api` version `8a4a9f19-eadd-4e7f-888f-23ede7e3402b`, D1 `english_app_db` ID `4ea5ccaa-c901-496c-ac0c-5854733c1428`, R2 `english-app-audio`, Pages `ispeakerreact` at `https://ispeakerreact-5u6.pages.dev`.
- Live checks passed: Worker `/health` 200, root static app 200 with the iSpeaker link in the shipped JS asset, session creation, empty history, stats aggregation, invalid transcript taxonomy, synthetic-data cleanup, and Pages 200.
- Handoff snapshot: `backups/LATEST.md`; secret/env files excluded. Retired source snapshot remains at `D:\ALEXPRO-OLD-BACKUP-20260820` for recovery and has not been reintroduced into the project tree.
- Open items: real iPhone Safari viewport/audio acceptance, GitHub write permission, and a real AI audio turn (not run to avoid unnecessary Workers AI spend without a human recording). R2 `audio/` lifecycle is verified at 45 days.

## English App content integration release (2026-08-20)

- Added the D1-backed learning content contract in `migrations/0002_learning_content.sql`: source attribution, four topics and twelve bilingual practice phrases.
- The content pack combines MIT Openjam vocabulary/level reference, CC0 Common Voice pronunciation prompts and original English App examples. Google Web Trillion-derived data and Oxford-derived lesson text are excluded from redistribution.
- Added Worker route `GET /api/content/topics`, CORS allowlisting for the iSpeaker Pages origin, and Pages production API configuration. Removed the iSpeaker UI's hard-coded topic catalog; it now reads the Worker content API.
- Local verification after the change: API `11/11`, UI `26/26`, web/API typecheck and iSpeaker Pages build pass.
- Release evidence: remote D1 `0001_init.sql` was safely baselined because its tables already existed without ledger rows; `0002_learning_content.sql` was applied and recorded. Readback shows 3 sources, 4 topics and 12 phrases; Wrangler reports no migrations pending.
- Worker deployed at version `6be29295-79ab-4cbc-a9b9-952c13adaf4c`. Pages deployment URL: `https://bcf95400.ispeakerreact-5u6.pages.dev`; canonical `https://ispeakerreact-5u6.pages.dev` returns HTTP 200.
- Live verification: `/health` 200, `/api/content/topics` 200 with 4 topics/12 phrases, CORS preflight 204 for the Pages origin, D1 topic/phrase counts match, and the production JS bundle contains the Worker API content route.
- Final post-deploy handoff snapshot is pointed to by `backups/LATEST.md`; the latest snapshot has 101 manifest entries, with env/secret files excluded.
- Open items remain: real iPhone Safari microphone/audio acceptance and GitHub write permission. No real AI audio turn was run to avoid unnecessary Workers AI spend without a human recording.

## English App follow-up verification (2026-08-21)

- Aki read-only recheck succeeded for both Claude and AGY when AGY was called with `workspace_write` and absolute `D:\ALEXPRO` paths; no files or resources were changed by either review.
- A targeted Claude UI-fix dispatch was attempted for the observed topic/level label mismatch and iPhone Safari MediaRecorder upload handling, but Aki returned `No eligible account from Pool Scheduler`; no patch was applied.
- GitHub API readback confirms authenticated `skymax2309` has `pull=true`, `push=false` on the empty `chihuy239122/englishapp` repository.
- Real iPhone Safari microphone/audio acceptance remains pending and cannot be claimed from desktop viewport emulation.

## English App UI/audio hardening release (2026-08-21)

- Claude.ai applied the Pages UI patch: initial topic/persona/level synchronization, iPhone Safari MediaRecorder MIME-aware upload filename, `durationMs`, stream/timer cleanup, microphone error mapping, client 8MB guard, and `m4a`/`x-m4a` mapping.
- AGY final read-only audit passed the three requested fixes and iOS hardening; real iPhone Safari remains a manual acceptance gate.
- Local verification: UI `37/37`, API `11/11`, Worker/Pages TypeScript builds pass, `npm audit --omit=optional` reports 0 vulnerabilities.
- Cloudflare preflight passed account `0af62f8ed73f84c95453102139345d6f` and remote D1 `SELECT 1`.
- Worker deployed as version `52af7107-6743-4d8e-bd07-ff5c30bd3943`. Pages deployed at `https://44a85bd7.ispeakerreact-5u6.pages.dev`; canonical `https://ispeakerreact-5u6.pages.dev` returns HTTP 200.
- Live UI readback confirms the initial selected topic displays `Phản xạ Phỏng vấn` with `Nâng cao` and the phrase section shows `(advanced)`. No D1/R2/GitHub mutation occurred.
- GitHub remains pending: authenticated `skymax2309` has `push=false` for `chihuy239122/englishapp`.

## GitHub source sync (2026-08-21)

- Verified `D:\ALEXPRO\.env` contains the project GitHub credential configuration; the token value was used only in the current process and was never printed.
- Authenticated API readback for `chihuy239122/englishapp` returned `push=true`.
- Initialized local Git on `main`, verified `.env` and Cloudflare env files are not tracked, and pushed the source to `https://github.com/chihuy239122/englishapp.git`.
- Published commit: `3914a1de9ca03bc87e8bc3d8cb5a06f7277b574a`.
- GitHub source sync is no longer blocked. Real iPhone Safari microphone/audio acceptance remains pending.

## English App curriculum and progress release (2026-08-21)

- Added `migrations/0003_curriculum_expansion.sql`: 4 learning modules, 16 ordered lessons, 80 original phrase prompts, 48 IPA vocabulary records, backward links for the original 12 topic phrases, session/turn phrase context columns, and `user_progress` persistence.
- Worker routes now expose `GET /api/content/curriculum` and `GET /api/users/:id/progress`. Successful completed turns upsert phrase practice and mark a phrase mastered after 3 successful practices.
- Main Practice UI now loads the Worker curriculum, lets the learner select module → lesson → target phrase, shows the target phrase/phonetic hint while recording, and renders module/lesson progress in Statistics. iSpeaker passes selected context into the main app URL and creates context-aware sessions.
- Local verification: UI `38/38`, API `16/16`, web/API TypeScript builds, local D1 migration apply, and remote D1 migration apply all pass.
- Cloudflare preflight: account `0af62f8ed73f84c95453102139345d6f` and harmless remote `SELECT 1` pass. Remote D1 readback: 4 modules, 16 lessons, 92 linked phrases, 48 vocabulary entries, 0 progress rows; no migrations pending.
- Production: Worker `english-app-api` version `3d31a5d6-bbd6-4cd5-a906-665ebfc09e84`; Pages deployment `https://312da61a.ispeakerreact-5u6.pages.dev`; canonical URLs return HTTP 200.
- Live browser verification passed at 375, 768 and 1440 CSS widths with no horizontal overflow; curriculum loaded, iSpeaker phrase → bridge → main app context preserved, target phrase displayed, and Statistics progress route rendered. Real iPhone Safari microphone/audio acceptance remains open.

## English App CEFR content bank release (2026-08-21)

- Preserved and applied the pre-existing `migrations/0004_curriculum_levels.sql` after isolating its vocabulary table as `content_level_vocabulary` to avoid collision with the 0003 lesson vocabulary table.
- Added `GET /api/content/levels`; live D1 readback confirms 5 CEFR levels, 15 units, 120 level vocabulary records and 90 sentence examples. The main UI now shows the A1 → C1 track summary (15 unit · 120 từ vựng) while practice/progress remains on the validated lesson phrase contract.
- Worker version `d4212dde-9880-40e6-b876-a6e2250ff50f` and Pages deployment `https://d484e9ed.ispeakerreact-5u6.pages.dev` are live. Canonical Pages returns HTTP 200.
- Live browser verification after the CEFR deploy: A1–C1 cards render, 5 cards are present, and no horizontal overflow at 375/768/1440 CSS widths.
- GitHub `main` is synchronized at feature commit `0a20fd1`; API readback confirms `push=true` and no secret env file is tracked.

## English App transcript matching and review release (2026-08-21)

- Added `migrations/0005_progress_matching.sql`: `turns.phrase_match_score`, `user_progress.matched_practices`, `next_review_at`, and a review index. Progress now counts only transcript matches at F1 threshold `0.55`; no waveform pronunciation score is claimed.
- The Worker schedules lightweight review intervals of 1/3/7/14 days and returns `dueReviewCount` from `/api/users/:id/progress`. A production synthetic learner test returned the expected `1/8` phrase progress, `13%` lesson completion and one due review, then was fully deleted and read back as zero.
- Local verification: UI `38/38`, API `20/20`, web/API builds, local and remote migration apply pass. Worker `daeb7d5c-2157-4223-97d3-5c2b57484d60` is live; health, curriculum, levels and progress endpoints return 200.
- Real iPhone Safari microphone/audio acceptance remains the only manual device gate; all desktop responsive checks remain green.
