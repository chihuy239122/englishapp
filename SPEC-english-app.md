# SPEC: App luyện giao tiếp tiếng Anh trên Cloudflare — dùng cho Codex triển khai

Đây là bản đặc tả để đưa nguyên văn cho Codex làm prompt xây dựng project từ đầu đến khi chạy được. Thực hiện đúng thứ tự Phase 0 → Phase 5, mỗi phase xong phải build/deploy thử trước khi sang phase kế.

## 0. Ràng buộc bắt buộc
- 100% miễn phí, chỉ dùng Cloudflare Free plan (Workers, Pages, D1, R2, Workers AI).
- Thiết bị test chính: iPhone Safari — không dùng `SpeechRecognition` (Web Speech API), chỉ dùng `MediaRecorder`.
- Ngôn ngữ: TypeScript toàn bộ. Framework: Hono.
- Không dùng WebSocket/Durable Objects ở bản MVP — chỉ HTTP POST theo lượt.
- Không gọi Workers AI trực tiếp từ client — mọi lời gọi AI đi qua Worker API.
- Luồng mỗi lượt bắt buộc tách hai bước: STT trả transcript để người học sửa, sau đó mới gửi transcript đã chốt cho Llama/MeloTTS và lưu D1.
- Mọi AI call phải có timeout, giới hạn output và fallback có cấu trúc; không làm mất transcript đã sửa khi AI quota/transport lỗi.
- Error response dùng một taxonomy chung `{ error: { code, message, retryable, stage } }` cho STT, LLM, TTS và D1; UI mapping phải được test.

## 1. Cấu trúc thư mục
```
english-app/
  apps/
    web/              # Lớp 2 UI, React + Vite hoặc HTML/JS thuần, build ra static assets cho Worker phục vụ
    api/               # Hono Worker: routes, AI orchestration, D1, R2
  packages/
    shared/            # types dùng chung giữa web và api (Turn, Session, Persona, Level...)
  migrations/          # D1 SQL migrations
  wrangler.jsonc
  package.json
  README.md
```
(Nếu Codex thấy monorepo phức tạp, cho phép gộp `web` và `api` vào một Worker duy nhất phục vụ cả static assets lẫn API — miễn giữ tách file rõ ràng theo chức năng.)

## 2. Thiết lập hạ tầng Cloudflare (chạy 1 lần, thứ tự bắt buộc)
1. `wrangler d1 create english_app_db` → lấy `database_id`, điền vào `wrangler.jsonc`.
2. `wrangler r2 bucket create english-app-audio` → điền tên bucket vào `wrangler.jsonc`.
3. Bật Workers AI binding trong `wrangler.jsonc` (không cần tạo resource riêng, chỉ cần binding `AI`).
4. Chạy migration: `wrangler d1 execute english_app_db --file=migrations/0001_init.sql`.
5. Set R2 lifecycle rule tự xoá object sau 45 ngày trong thư mục `audio/` (qua dashboard Cloudflare hoặc `wrangler r2 bucket lifecycle` nếu CLI hỗ trợ ở thời điểm build — nếu chưa hỗ trợ CLI, ghi TODO nhắc làm thủ công qua dashboard).

### `wrangler.jsonc` mẫu
```jsonc
{
  "name": "english-app-api",
  "main": "apps/api/src/index.ts",
  "compatibility_date": "2026-08-01",
  "assets": { "directory": "apps/web/dist", "binding": "ASSETS" },
  "d1_databases": [
    { "binding": "DB", "database_name": "english_app_db", "database_id": "<điền_sau_khi_tạo>" }
  ],
  "r2_buckets": [
    { "binding": "AUDIO_BUCKET", "bucket_name": "english-app-audio" }
  ],
  "ai": { "binding": "AI" }
}
```

## 3. D1 schema — `migrations/0001_init.sql`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  persona TEXT NOT NULL,
  level TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER
);

CREATE TABLE turns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  client_turn_id TEXT NOT NULL UNIQUE,
  turn_index INTEGER NOT NULL,
  transcript TEXT,
  ai_reply TEXT,
  corrections TEXT,          -- JSON string
  audio_base64 TEXT,         -- nullable; capped inline MeloTTS replay payload
  audio_available INTEGER NOT NULL DEFAULT 0,
  user_audio_key TEXT,       -- nullable, key trong R2
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_turns_session ON turns(session_id);
CREATE INDEX idx_sessions_user ON sessions(user_id, started_at);

CREATE TABLE turn_tokens (
  token_hash TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  user_audio_key TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  turn_id TEXT UNIQUE,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  first_attempt_at INTEGER
);

CREATE INDEX idx_turn_tokens_session ON turn_tokens(session_id, expires_at);
```

## 4. Types dùng chung — `packages/shared/types.ts`
```ts
export type Persona = "conversation_partner" | "grammar_tutor" | "pronunciation_coach" | "fluency_coach";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Correction {
  error: string;
  fix: string;
  rule: string;
}

export interface TurnResponse {
  turnId: string;
  transcript: string;
  aiReply: string;
  corrections: Correction[];
  audioBase64: string; // MeloTTS output, không lưu R2
  audioAvailable: boolean;
}

export interface TranscribeResponse {
  transcript: string;
  turnToken: string;
  audioContentType: string;
}

export interface CompleteTurnRequest {
  transcript: string;
  turnToken: string;
  clientTurnId: string;
}

export type ErrorStage = "AUDIO_UPLOAD" | "STT" | "LLM_GEN" | "TTS_GEN" | "PERSISTENCE";

export interface ApiErrorEnvelope {
  error: { code: string; message: string; retryable: boolean; stage: ErrorStage };
}
```

## 5. API routes (Hono) — `apps/api/src/index.ts`

### `POST /api/sessions` — tạo session mới
Body: `{ userId: string, persona: Persona, level: Level }`
→ insert `sessions`, trả `{ sessionId }`.

### `POST /api/sessions/:id/transcribe` — nhận audio và trả transcript có thể sửa
Body `multipart/form-data`, field `audio`.

Luồng xử lý bắt buộc:
1. Đọc audio blob từ form-data.
2. Chỉ chấp nhận MIME do recorder hỗ trợ (`audio/webm`, `audio/mp4`, `audio/aac`, `audio/wav`) và giới hạn kích thước server-side là 8 MB. Server bắt buộc kiểm tra magic bytes: WebM EBML, MP4 `ftyp`, WAV `RIFF/WAVE`, AAC ADTS sync; mismatch/không nhận dạng trả `AUDIO_MIME_INVALID`.
3. (Optional, theo cờ `SAVE_USER_AUDIO=true/false` trong env) upload blob lên R2 tại key `audio/{userId}/{sessionId}/{turnId}.{ext}`.
4. Gọi `env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: [...bytes] })` → `transcript`.
5. Nếu `transcript` rỗng hoặc quá ngắn (<2 ký tự) → trả `STT_EMPTY` kèm message rõ ràng; client vào editor rỗng để người học nhập tối thiểu 2 ký tự hoặc ghi âm lại, KHÔNG gọi Llama.
6. Tạo `turnToken` ngẫu nhiên, chỉ lưu hash vào `turn_tokens` cùng session/user, optional R2 key, thời điểm tạo và `expires_at = created_at + 15 phút`. Token chưa được dùng cho tới khi `/turns` ghi thành công.
7. Trả `{ transcript, turnToken, audioContentType }`. Không trả object key cho client và không gọi Llama/MeloTTS ở endpoint này.
8. Nếu audio rỗng/im lặng, quá 60 giây, vượt giới hạn bytes, MIME không hỗ trợ hoặc Whisper timeout, trả error code chuẩn; không tạo turn.

### `POST /api/sessions/:id/turns` — hoàn tất lượt bằng transcript đã chốt
Body JSON: `{ transcript: string, turnToken: string, clientTurnId: string }`.

Luồng xử lý bắt buộc:
1. Xác thực session và transcript đã chốt; không nhận audio trực tiếp ở endpoint này.
2. Hash `turnToken` bằng HMAC-SHA256 với `TURN_TOKEN_SECRET`, kiểm tra đúng `session_id`/`user_id`, chưa hết hạn và `used_at IS NULL`. Trong transaction/guard atomically, tăng `attempt_count` và ghi `first_attempt_at` ở lần thử đầu; chỉ cho phép tối đa 2 lần xử lý trong cửa sổ 60 giây, sau đó trả lỗi retryable `TURN_RETRY_LIMIT` và không gọi AI. Chỉ đánh dấu used trong cùng transaction với row `turns` sau khi persistence thành công. Concurrent requests phải chỉ có một request commit được.
3. Kiểm tra `clientTurnId` là UUID hợp lệ và dùng làm idempotency key. Nếu `clientTurnId` đã tồn tại trong `turns` nhưng token hiện tại chưa consumed, trả `TURN_CLIENT_ID_INVALID`. Nếu token đã consumed nhưng `clientTurnId` trùng, trả dữ liệu turn đã lưu; chỉ tái tạo TTS từ `ai_reply` khi turn cũ có `audioAvailable=false`, còn nếu đã có audio thì trả lại audio đã lưu trong row/response trước đó. Nếu khác, trả `TURN_TOKEN_USED`.
4. Nếu `transcript.trim().length < 2`, trả `TRANSCRIPT_INVALID`; không gọi Llama.
5. Build system prompt theo `persona` + `level` (mục 6) + lấy 3–5 turn gần nhất (không lấy toàn bộ lịch sử).
6. Dùng global deadline `TURN_DEADLINE_MS=18000`: mỗi Llama attempt ≤5 giây, repair/fallback chỉ chạy khi còn ít nhất 5 giây trọn vẹn cho bước đó, MeloTTS chỉ chạy khi còn ít nhất 4 giây; không bắt đầu bước mới nếu không đủ budget. Vì chỉ có một nhánh repair hoặc một nhánh fallback, AI tối đa 10 giây + TTS tối đa 4 giây, còn tối thiểu 4 giây cho overhead/persistence; nếu budget cạn, bỏ qua TTS và vẫn persist turn hợp lệ với `audioAvailable=false`.
7. Gọi model chính `@cf/meta/llama-3.3-70b-instruct` với `max_tokens: 350`, reply tối đa 2 câu, corrections tối đa 3 mục và schema JSON compact. Khi primary bị timeout/429/quota/limit, thử đúng một lần model fallback `@cf/meta/llama-3.1-8b-instruct` với cùng schema nếu còn budget.
8. Fallback priority cố định: (a) primary model; (b) lower-cost model chỉ khi lỗi transport/quota/limit; (c) static reply nếu model fallback lỗi. JSON malformed/truncated thì retry đúng một lần với prompt repair yêu cầu JSON hợp lệ dưới 150 từ; nếu vẫn malformed, dùng static reply, không loop thêm.
9. Gọi `env.AI.run('@cf/myshell-ai/melotts', { text: aiReply })`. Audio phản hồi không lưu R2: Worker chuyển bytes sang base64, chỉ nhận payload tối đa 256 KB, lưu `audio_base64` và `audio_available` trong row `turns`, rồi trả field `TurnResponse.audioBase64`. Nếu TTS lỗi/deadline/quá lớn, vẫn lưu/trả turn hợp lệ với `audioBase64: ""`, `audioAvailable: false` và nút nghe lại thủ công; idempotent retry chỉ tái tạo khi cờ cũ là false, còn audio đã lưu được trả lại khi cờ là true.
10. Insert 1 row vào `turns` và mark `turn_tokens.used_at/turn_id` trong cùng transaction; lỗi D1 trả `DB_PERSIST_ERROR`, token vẫn retryable nếu transaction rollback.
11. Trả `TurnResponse` JSON.

Error stages: `AUDIO_UPLOAD`, `STT`, `LLM_GEN`, `TTS_GEN`, `PERSISTENCE`. Error codes tối thiểu: `AUDIO_MIME_INVALID`, `AUDIO_SIZE_EXCEEDED`, `DURATION_EXCEEDED`, `STT_EMPTY`, `STT_FAILURE`, `SESSION_INVALID`, `TRANSCRIPT_INVALID`, `TURN_TOKEN_EXPIRED`, `TURN_TOKEN_USED`, `TURN_CLIENT_ID_INVALID`, `TURN_RETRY_LIMIT`, `LLM_TIMEOUT`, `LLM_QUOTA_EXCEEDED`, `LLM_JSON_MALFORMED`, `TTS_FAILURE`, `DB_PERSIST_ERROR`. Mỗi code có `stage` và `retryable` cố định; session/token ownership errors là non-retryable, transport/quota errors và `TURN_RETRY_LIMIT` là retryable nhưng bị giới hạn theo cửa sổ.

### `GET /api/sessions/:id/turns` — lấy lịch sử 1 session (hiển thị lại trong UI).

### `GET /api/users/:id/stats` — tính tổng phút luyện, số lượt, theo ngày (query aggregate trên `sessions`/`turns`, KHÔNG cần bảng riêng).

### Curriculum và tiến trình học tập
- `GET /api/content/curriculum` trả cây `modules → lessons → phrases/vocabulary`; mỗi bài có tối thiểu 5 câu và 3 từ vựng kèm IPA, meaning, example.
- `POST /api/sessions` nhận thêm `moduleId`, `lessonId`, `phraseId` tùy chọn. Worker kiểm tra quan hệ lesson/phrase trước khi lưu context vào D1.
- `turns.phrase_id` giữ câu mục tiêu của session. Sau khi lượt nói được persistence thành công, Worker upsert `user_progress`; sau 3 lượt luyện cùng câu, `mastered=1`.
- `GET /api/users/:id/progress` trả tiến trình theo module/bài, số câu đã luyện, số câu mastered, phần trăm hoàn thành và trạng thái mở khóa tuần tự.
- Màn hình chính truyền context từ iSpeaker/lesson vào session, hiển thị câu mục tiêu khi ghi âm và chỉ đọc dữ liệu lộ trình từ Worker; không tạo bản sao nội dung trong UI.
- `GET /api/content/levels` trả ngân hàng CEFR A1–C1 bổ sung gồm level, unit, vocabulary IPA và sentence examples; dữ liệu dùng namespace riêng để không xung đột với progress phrase MVP.

## 6. Prompt templates theo persona/level

Hệ thống prompt LUÔN yêu cầu Llama trả về đúng JSON theo schema, ví dụ:
```
Bạn là gia sư tiếng Anh, persona: {persona_description}, trình độ học viên: {level}.
Học viên vừa nói: "{transcript}"
Trả lời DUY NHẤT một JSON object theo đúng schema sau, không thêm text nào khác:
{
  "reply": "câu trả lời tự nhiên bằng tiếng Anh, độ khó phù hợp {level}",
  "corrections": [{"error": "...", "fix": "...", "rule": "giải thích ngắn bằng tiếng Việt"}]
}
Nếu học viên không có lỗi, corrections là mảng rỗng.
```
Persona description (điền vào `{persona_description}`):
- `conversation_partner`: "bạn trò chuyện thân thiện, phản hồi ngắn gọn, khuyến khích học viên nói tiếp, ít sửa lỗi giữa chừng"
- `grammar_tutor`: "tập trung phát hiện và giải thích lỗi ngữ pháp rõ ràng, phản hồi ngắn"
- `pronunciation_coach`: "chú ý các từ có khả năng bị phát âm sai dựa trên transcript, gợi ý cách đọc đúng bằng chữ cái Việt hóa dễ hiểu"
- `fluency_coach`: "khuyến khích nói dài hơn, đặt câu hỏi mở, ít sửa lỗi nhỏ để không cắt mạch nói"

Level điều chỉnh độ phức tạp câu trả lời: `beginner` = câu ngắn, từ vựng cơ bản, nói chậm rãi trong text; `intermediate`/`advanced` = câu dài hơn, từ vựng phong phú hơn.

## 7. Client (`apps/web`)
- Màn hình chọn persona + level trước khi bắt đầu session (gọi `POST /api/sessions`).
- Nút ghi âm dùng `MediaRecorder`:
  - Kiểm tra `MediaRecorder.isTypeSupported()` theo thứ tự `audio/mp4`, `audio/aac`, `audio/webm;codecs=opus`; chỉ dùng `audio/wav` khi blob vẫn dưới 8 MB, nếu không thì báo lỗi.
  - Giới hạn thời lượng ghi tối đa 60 giây/lượt (UX, tránh timeout Worker).
- Sau khi dừng ghi: gọi `/transcribe`, hiện transcript và **cho phép người dùng sửa tay trước khi gọi `/turns`**.
- State machine UI bắt buộc: `IDLE → RECORDING → UPLOADING_STT → EDITING_TRANSCRIPT → GENERATING_RESPONSE → PLAYBACK → COMPLETE`, kèm `ERROR` có thể quay lại bước phù hợp.
- State transitions phải đầy đủ: `RECORDING → CANCEL → IDLE`, `UPLOADING_STT → CANCEL → IDLE`, `EDITING_TRANSCRIPT → RECORD_AGAIN → RECORDING`, `EDITING_TRANSCRIPT → CANCEL → IDLE`, `GENERATING_RESPONSE → ERROR`, `ERROR → EDITING_TRANSCRIPT` nếu còn transcript/token hoặc `ERROR → IDLE` nếu không còn dữ liệu. Record again/cancel phải xóa client turnToken; server token hết hạn sau 15 phút và tối đa 2 retry/60 giây.
- Nếu Whisper trả rỗng, UI vào `EDITING_TRANSCRIPT` với ô trống, `aria-live` báo rõ, cho phép re-record hoặc nhập tối thiểu 2 ký tự trước khi submit.
- Khi `PLAYBACK` bị Safari chặn, UI giữ `audioBase64`, báo trạng thái dễ hiểu và yêu cầu bấm “Nghe lại”; không mất turn.
- Client dừng ở 60 giây và chặn blob >8 MB trước upload; server đồng thời chặn `audioDurationMs > 60000` nếu metadata hợp lệ, chặn payload >8 MB và trả `DURATION_EXCEEDED`/`AUDIO_SIZE_EXCEEDED`.
- Hiển thị `corrections` dạng danh sách, phát `audioBase64` tự động qua thẻ `<audio>`.
- iOS autoplay chỉ là best-effort: AudioContext/audio element phải được unlock bằng silent buffer 100ms trong chính user gesture; luôn có nút “Nghe lại” rõ ràng nếu Safari từ chối.
- Nút “Gửi transcript” phải prime/reuse audio element trong chính user gesture trước khi gọi network; không chờ response mới unlock. Khi `audioAvailable=true` mà autoplay bị từ chối, giữ audio và chuyển sang manual replay, không gọi lại AI.
- Màn hình thống kê: gọi `GET /api/users/:id/stats`, hiển thị số phút/số lượt theo ngày dạng biểu đồ đơn giản.

## 8. Thứ tự triển khai (bắt buộc theo đúng phase, không nhảy cóc)
- **Phase 0**: Setup hạ tầng (mục 2), migration D1 chạy được, `wrangler dev` chạy route `GET /health` trả 200.
- **Phase 1**: MVP KHÔNG hội thoại tự do — chỉ 1 bài luyện cố định: đưa 5 câu mẫu tiếng Anh cho học viên đọc theo, ghi âm, Whisper transcript, so sánh đơn giản (không cần AI chấm điểm phức tạp) để xác nhận pipeline STT hoạt động đúng trên Safari iOS thực tế trước khi làm gì phức tạp hơn.
- **Phase 2**: Thêm Llama vào luồng — persona `conversation_partner`, level `beginner` duy nhất, chưa có UI chọn persona/level.
- **Phase 3**: Thêm MeloTTS, thêm lưu D1 đầy đủ theo schema mục 3.
- **Phase 4**: Thêm UI chọn persona/level, thêm R2 lưu audio người dùng (có cờ bật/tắt), thêm màn thống kê.
- **Phase 5**: Deploy Lớp 1 (`ispeakerreact`) lên Cloudflare Pages riêng, nối liên kết giữa 2 lớp trong UI.
- **Phase 6**: Mở rộng curriculum: module/lesson/vocabulary/progress, nối context vào session/turn và kiểm live API/UI.

Sau mỗi phase: chạy `wrangler deploy --dry-run` để bắt lỗi cấu hình sớm, và ghi metadata số neuron/latency/status mỗi request (không log transcript, audio hay token) để tự kiểm tra ngân sách free tier thực tế.

Mọi UI artifact của Claude phải có test/evidence ở 375×812, 768×1024 và 1440×1000; khi bàn phím iOS mở, transcript editor và action chính vẫn nhìn thấy/bấm được, không có `scrollWidth > clientWidth`, touch target tối thiểu 44×44px, keyboard/VoiceOver và `aria-live` cho trạng thái động.

## 9. Việc KHÔNG được làm ở bản MVP (đã thống nhất qua phản biện)
- Không dùng Durable Objects/WebSocket.
- Không lưu audio phản hồi AI vào R2 (tái tạo lại từ text khi cần).
- Không gửi toàn bộ lịch sử hội thoại vào mỗi lời gọi Llama — chỉ 3-5 turn gần nhất.
- Không tự ý cam kết độ chính xác chấm phát âm — pronunciation_coach chỉ gợi ý dựa trên transcript, không phân tích waveform.
