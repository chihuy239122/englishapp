# Aki English App Review Gate — Blocked

**Date:** 2026-08-20  
**Source workspace:** `D:\ALEX_LAB`  
**Target workspace:** `D:\ALEXPRO`  
**Packet:** `SPEC-english-app.md` + `docs/superpowers/plans/2026-08-19-english-app-rebuild-plan.md`  
**Packet size:** 27,042 characters  
**Requested mode:** review-only; no file, resource, deploy, push, or deletion mutation

## Dispatch result

The same packet was dispatched independently to the real `claude` and `agy` targets through Aki.

### Claude

- **Status:** blocked
- **Raw result:** `Claude bridge failed: No available Claude accounts ready for delegation.`
- **Accepted review:** no

### AGY

- **Status:** received
- **Verdict:** `REVISE`
- **Mutation report:** no files or resources edited or created

## AGY raw findings

AGY identified the following blockers and risks:

- **P0 — API/UX lifecycle contradiction:** the current single `POST /api/sessions/:id/turns` performs STT, Llama, TTS, and persistence before the UI can let the learner edit the Whisper transcript. Recommended contract: a transcription endpoint first, then a turn endpoint that accepts the finalized transcript.
- **P0 — iOS Safari audio behavior:** `audio/webm` is not a safe default on iOS Safari; use runtime MIME detection with `audio/mp4` fallback. Asynchronous audio playback after a delayed fetch may be rejected by WebKit autoplay policy; unlock audio during an explicit user gesture and provide a manual play fallback.
- **P1 — Latency:** bound Llama output, show explicit transcription/thinking/audio states, and handle mobile network delays.
- **P1 — Free-tier quota:** provide a lower-cost model fallback or quota-safe fallback behavior.
- **P1 — 375px keyboard layout:** use `visualViewport`, scrollable flex layout, no horizontal overflow, and touch targets of at least 44px.
- **P1 — Accessibility:** use semantic controls, visible focus, and `aria-live=polite` for dynamic recording/AI states.

### AGY raw response (verbatim)

```text
# AGY Independent Adversarial Review Report
Project: ALEXPRO English App Rebuild (Cloudflare Stack)
Review Type: UI/UX & Architecture Review Gate (Read-Only Audit)
Verdict: REVISE

Executive Summary: 2 P0 blockers and 4 P1 high-risk areas were found. The P0 blockers are the API/UX sequence contradiction around transcript editing and iOS Safari MediaRecorder/audio playback behavior.

P0-1 — API / UX lifecycle contradiction:
The current single POST /api/sessions/:id/turns performs STT, Llama, TTS, and persistence before the UI can let the learner edit the Whisper transcript. Split the flow into transcription first, learner editing, then a finalized turn request.

P0-2 — iOS Safari audio behavior:
Use runtime MIME detection with audio/mp4 fallback when audio/webm is unsupported. Unlock audio during an explicit user gesture and provide a manual play fallback because delayed asynchronous playback can be rejected by WebKit autoplay policy.

P1-1 — Latency:
Bound Llama output, show explicit transcription/thinking/audio states, and handle mobile network delays.

P1-2 — Free-tier quota:
Provide a lower-cost model fallback or quota-safe fallback behavior.

P1-3 — 375px viewport and keyboard:
Use visualViewport, a scrollable flex layout, no horizontal overflow, and touch targets of at least 44px.

P1-4 — Accessibility:
Use semantic controls, visible focus, and aria-live=polite for dynamic recording and AI states.

Required acceptance gates:
1. Two-stage turn contract: record -> STT transcript -> edit -> finalized transcript -> Llama response.
2. WebKit/iOS verification of MIME fallback and audio playback behavior.
3. 375px viewport verification with the virtual keyboard open and no horizontal scroll.
4. Quota-safe Llama limits, one JSON retry, and static fallback after a second parse failure.
5. Keyboard/VoiceOver operability and announced dynamic states.

No files or resources were edited or created during this review.
Next step: revise the SPEC and plan before backend coding, then rerun the review gate.
```

## Required acceptance gates from AGY

1. Two-stage turn contract: record → STT transcript → edit → finalized transcript → Llama response.
2. WebKit/iOS verification of MIME fallback and audio playback behavior.
3. 375px viewport verification with the virtual keyboard open and no horizontal scroll.
4. Quota-safe Llama limits, one JSON retry, and static fallback after a second parse failure.
5. Keyboard/VoiceOver operability and announced dynamic states.

## Gate verdict

**BLOCKED.** The project must not begin UI, backend, migration, resource creation, deployment, GitHub mutation, or deletion of the retired source until Claude returns an accepted UI/UX review and Aki can produce the required combined consensus packet. The SPEC/plan also require revision for the P0 lifecycle contradiction and Safari audio contract before implementation.

## Next action

1. Make a Claude profile available in Aki and rerun the exact same packet.
2. Revise the SPEC/plan after user approval to adopt the two-stage transcript flow and Safari-specific audio gates.
3. Dispatch the revised packet to both Claude and AGY again, then save the raw findings and consensus before implementation.

---

## Retry review — concise non-secret packet

**Transport:** Claude smoke and AGY dispatch both reached their targets.  
**Packet:** identical 1,436-character review brief sent independently to both targets.  
**Mutation report:** no files or resources edited or created.

### Claude raw result

**Verdict:** `REVISE`

```text
P0 — The monolithic POST /api/sessions/:id/turns conflicts with the requirement that the learner edit the Whisper transcript before Llama/TTS. Split into a transcription phase and a completion phase that accepts the edited transcript.

P0 — iOS Safari MediaRecorder needs an explicit MIME fallback. Use MediaRecorder.isTypeSupported() with audio/mp4 and other documented fallbacks; otherwise recording can fail on the primary platform.

P0 — The browser-to-Workers-AI boundary must be explicit in the shared contract so the client cannot call AI bindings directly.

P1 — Specify iOS autoplay/user-gesture handling for TTS playback.
P1 — Bound the sequential STT/Llama/TTS request and define timeout/degrade behavior.
P1 — Decide audio storage and lifecycle policy for the free tier.
P1 — Claude must deliver responsive, keyboard, accessibility, loading/error/empty UI artifacts and tests for 375/768/1440 before Codex touches backend work.
P1 — Enforce the 60-second recording limit on both client and server with a clear error state.

Acceptance gates: two-phase API contract; real iOS MIME/playback verification; client-only Worker AI boundary; gesture-gated TTS playback; Claude responsive/a11y artifact; 60-second validation; documented R2 lifecycle.
```

### AGY raw result

**Verdict:** `REVISE`

```text
P0-1 — The monolithic turn endpoint prevents transcript editing before Llama evaluation. Required fix: POST /api/sessions/:id/transcribe returns transcript and transient audio identity; POST /api/sessions/:id/turns accepts editedTranscript and completes Llama, MeloTTS, and D1 persistence.

P0-2 — iOS Safari MediaRecorder MIME/container behavior is not safe with audio/webm. Required fallback order must be specified and the Worker must accept variable MIME types.

P0-3 — Asynchronous MeloTTS playback can be blocked by iOS Safari autoplay rules. Initialize/resume AudioContext or an audio element during the initial user gesture.

P1-1 — Add strict Workers AI timeout/rate-limit/quota recovery with structured errors that preserve the edited transcript.
P1-2 — Handle the 375px virtual keyboard with dvh/safe-area layout, sticky actions, and scroll-into-view.
P1-3 — Keep the browser from calling Workers AI directly or storing Cloudflare tokens.

Required state machine: IDLE -> RECORDING -> UPLOADING_STT -> EDITING_TRANSCRIPT -> GENERATING_RESPONSE -> PLAYBACK -> COMPLETE.

Acceptance gates: decoupled STT/turn contract; iOS audio/autoplay specification; complete Claude-owned UI artifact at 375/768/1440 with accessibility; structured error handling for AI/upload/offline failures.
```

### Retry gate verdict

**BLOCKED / REVISE.** Transport and authentication are now working, but both independent reviewers reject the current SPEC/plan until the P0 contract and iOS audio behavior are revised. No implementation, resource creation, deployment, GitHub mutation, or legacy deletion is authorized yet.

---

## Final contract gate — 2026-08-20

The revised contract was sent as the same non-secret packet to Claude and AGY through Aki. No files or resources were edited by either reviewer.

### Claude transport result

`REVISE / BLOCKED`: `Claude bridge failed: No eligible account from Pool Scheduler.`

Because the Aki rule requires a raw Claude review from a real Claude target, this is not treated as approval.

### AGY raw result

`VERDICT: REVISE`

- **P0:** the retry limit was not enforceable without `attempt_count` and `first_attempt_at` in `turn_tokens`.
- **P0:** the TTS transport/storage contract was not explicit.
- **P1:** deadline arithmetic and minimum remaining budgets needed to be explicit.
- **P1:** behavior for a duplicate `clientTurnId` with a fresh token needed definition.
- **P1:** TTS regeneration needed to be limited to turns whose prior audio was unavailable.

### Contract revisions made after this result

- Added `attempt_count` and `first_attempt_at` to `turn_tokens` and defined the atomic two-attempt/60-second guard.
- Defined inline `TurnResponse.audioBase64`; response audio is never stored in R2, and `audioAvailable` is persisted.
- Added the capped `audio_base64` and `audio_available` fields to `turns` so an idempotent replay can return already-generated audio without invoking TTS again.
- Defined one repair **or** one fallback branch, exact 5-second LLM and 4-second TTS minimum budgets under the 18-second deadline.
- Defined fresh-token duplicate `clientTurnId` as `TURN_CLIENT_ID_INVALID` and restricted TTS regeneration to `audioAvailable=false`.
- Added `TURN_RETRY_LIMIT` to the taxonomy and acceptance requirements.

### Current gate verdict

**BLOCKED.** The contract has been revised, but implementation cannot start until Aki successfully returns a raw Claude review and a fresh identical-packet AGY review with no P0 findings. No scaffold, UI artifact, backend code, migration, resource creation, deployment, GitHub mutation, or legacy deletion has been performed.

## User waiver and production execution — 2026-08-20

The user explicitly instructed: skip the pending review and build/deploy according to the SPEC; the user then confirmed the production action list. Implementation proceeded with AGY writing the UI and Codex writing the backend. This section supersedes the operational hold above for this authorized release, while preserving the raw review evidence.

- Local tests/builds passed before deployment: UI 25/25, API 9/9, TypeScript builds, root and Pages npm audit 0 vulnerabilities, Wrangler dry-run.
- Old resources were deleted after snapshot and preflight: old Worker, D1, R2 after 63-object cleanup, and three old Pages projects.
- New production resources were created and deployed: Worker `english-app-api`, D1 `english_app_db`, R2 `english-app-audio`, and Pages `ispeakerreact`.
- Live smoke tests passed for health, static app, session creation, history, stats, invalid transcript handling, Pages HTTP 200, and synthetic data cleanup.
- Remaining gates are real iPhone Safari/audio acceptance, R2 45-day lifecycle configuration, and GitHub push permission; GitHub is read-only for the authenticated identity.
