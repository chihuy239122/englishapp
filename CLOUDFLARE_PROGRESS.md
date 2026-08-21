# ALEX PRO — Cloudflare Progress Tracker
**Cập nhật**: 2026-08-13 | v8.0.0 Curriculum Sync ✅ & UI/UX Pro Max Admin Panel ✅

---

## 2026-08-13 — Voice App & Admin Panel UI/UX Pro Max Redesign ✅ PRODUCTION

### Thay đổi
- Áp dụng chuẩn thiết kế `ui-ux-pro-max` (Bento Grid) cho trang Học Trực Tuyến (`alex-pro-voice/index.html`).
- Phân tách cấu trúc thành 3 khối rõ ràng: Luyện Phát Âm (Hero card lớn bên trên), Học Từ Vựng và Hội Thoại (song song bên dưới).
- Thay thế các biểu tượng emoji bằng bộ SVG icons chuyên nghiệp.
- Nâng cấp giao diện Admin lên phong cách Glassmorphism và Premium Dark Mode (Midnight Blue `#0b0f19` & Electric Purple `#8b5cf6`).
- Không thay đổi bất kỳ logic JavaScript nào; đảm bảo an toàn tuyệt đối.

### Deploy Pages
- **Dự án Admin:** `alex-pro-admin`
  - URL Canonical: `https://alex-pro-admin.pages.dev`
  - Tình trạng: Deploy thành công.
- **Dự án Voice:** `alex-pro-voice`
  - URL Canonical: `https://alex-pro-voice.pages.dev`
  - Tình trạng: Deploy thành công.

---

## 2026-08-13 — v8.0.0 Curriculum Sync ✅ LOCAL

### Thay đổi
- **LES-0007 đến LES-0020** (14 files): mở rộng từ skeleton ~1.7 KB → full 7–9 KB đúng chuẩn 10 phần
  - Thêm: IPA column, kế hoạch buổi học, mục tiêu cụ thể, pronunciation drills, correction & scoring 5 trục, cập nhật progress
  - Sửa typo: `LES-0010_Home_and_Choes.md` → `LES-0010_Home_and_Chores.md`
- **LES-0021 đến LES-0027** (7 files): chuẩn hoá từ ~3 KB → 6–7 KB theo đúng 10 phần
  - Giữ nguyên nội dung từ PDF Tuần 1, bổ sung IPA, scoring, progress sections
- **LES-0028 đến LES-0034** (7 files MỚI): Tuần 2 hoàn toàn mới
  - Mealtime & Food, Making Phone Calls, Weekend Plans, Describing People, Weather, Banking & Money, Week 2 Review

### Trạng thái lesson catalog
| Dải | CEFR | Số lesson | Kích thước |
|-----|------|-----------|-----------|
| LES-0001–0006 | A1 | 6 | 5–9 KB ✅ |
| LES-0007–0012 | A2 | 6 | 7–8 KB ✅ |
| LES-0013–0016 | B1 | 4 | 8–9 KB ✅ |
| LES-0017–0018 | B2 | 2 | 8–9 KB ✅ |
| LES-0019–0020 | C1 | 2 | 9 KB ✅ |
| LES-0021–0027 | A1–B1 | 7 (Tuần 1 PDF) | 6–7 KB ✅ |
| LES-0028–0034 | A1–B1 | 7 (Tuần 2 mới) | 5–7 KB ✅ |
| **TỔNG** | **A1→C1** | **34** | — |

### Việc còn lại
- [x] Upload 28 lesson files mới/cập nhật lên R2 `alex-pro-content` — **28/28 ✅**
- [x] Cập nhật D1 `lesson_catalog` thêm LES-0028 đến LES-0034 — **27 lessons live ✅**
- [x] Cập nhật FILE_2_KNOWLEDGE_CORE.md với lesson catalog mới — **v8.0.0 ✅**
- [x] Handoff snapshot — **alex-pro-handoff-20260813T035025Z.zip ✅**
- [ ] Re-upload FILE_2_KNOWLEDGE_CORE.md lên GPT Builder Knowledge ← việc còn lại duy nhất


---



---

## 2026-08-08 — v7.1.1 curriculum-grounded English-first GPT 🟡 STAGED, not published

- Đã sửa nguồn local để chặn hội thoại tự do bằng tiếng Việt, nội dung/lịch sử bịa và dạy không bám bài. Mọi phiên có mã phải gọi `getLearnerProgress` rồi `getAssignedLesson`; chỉ dùng trình độ, checkpoint, lesson và 2–3 cụm từ do Action vừa trả về.
- Luồng dạy là English-led bilingual: mục tiêu 80–90% tiếng Anh, tiếng Việt chỉ giải nghĩa/cầu nối thật ngắn rồi quay lại câu mời nói tiếng Anh. Nếu học viên chưa nói được hoặc hệ thống nghe không rõ, ALEX hạ về Starter Zero thay vì nói chuyện chung chung.
- Đồng bộ local: FILE_1, FILE_2, FILE_3, Custom GPT OpenAPI, Voice API OpenAPI và release-sync test đều là v7.1.1. Không có Worker/D1 migration, deploy Cloudflare hoặc publish GPT nào ở mục này.
- Local verification đã pass: Worker suite 52/52, `node --check worker.js` và hai OpenAPI lint. Chờ: handoff trước phát hành, xác nhận action-time để publish GPT Builder, rồi smoke test Voice thật theo Daily Route.

---

## 2026-08-07 — v7.1.0 ALEX Voice companion ✅ PRODUCTION

- **Cloudflare account chuẩn:** `0af62f8ed73f84c95453102139345d6f`. `wrangler whoami` và harmless remote D1 `SELECT 1` đã pass trước mutation.
- Đã tạo project Pages `alex-pro-voice` và publish `https://alex-pro-voice.pages.dev/` (deployment đầu tiên: `https://90678f09.alex-pro-voice.pages.dev`). Canonical URL trả HTTP 200.
- Đã apply remote `worker/migrations/0006_voice_learning_v690.sql`; readback xác nhận hai table `voice_assessments` và `voice_request_rate_limits` tồn tại trong `alex-pro-hub-db`.
- Đã cấu hình Worker secrets `VOICE_APP_ORIGIN`, `VOICE_SESSION_SECRET`, `VOICE_RATE_LIMIT_SALT`, `FISH_API_KEY` (không ghi giá trị vào source/docs) và cập nhật Turnstile allow-list gồm `alex-pro-start.pages.dev`, `alex-pro-voice.pages.dev`.
- Worker source sync mang nhãn `Publish ALEX Voice v7.1.0 release sync`, version `69ada49b-0b02-40aa-853e-2817c481806f`. `OPTIONS /v1/voice/session` từ origin website trả 204 và CORS chỉ cho canonical website origin.
- GPT Builder đã publish FILE_1, FILE_2 và Action schema v7.1.0. Browser test public GPT với câu “Alex, mở ALEX Voice để nghe mẫu và tự luyện.” trả đúng URL và nêu đúng nguyên tắc không gửi/lưu audio, không transcript, không chấm điểm tự động.
- Website là khu nghe mẫu Fish + ghi âm/nghe lại cục bộ bằng mã học viên chung. `pronunciationAssessmentEnabled=false`: không gửi raw audio, không transcript, không điểm tự động và không bật Azure.
- Kiểm production: 52/52 test local pass, `node --check` pass, 2 OpenAPI lint pass; web đã mở thật và không tràn ngang ở mobile 375×812, tablet 768×1024, desktop 1440×1000. Luồng đăng nhập/Fish TTS thật chờ học viên hoàn thành Turnstile bằng tay với mã hợp lệ; không giả nhận đã kiểm audio có bảo vệ.

---

## 2026-08-07 — v7.0.0 hội thoại bằng giọng nói theo bài có sẵn ✅ PRODUCTION

- Học viên chỉ trải nghiệm một cuộc hội thoại liên tục: lesson là ngân hàng nội dung nội bộ, không hiển thị Mục/Pha, bài viết, quiz hay điểm số. Mỗi chủ đề cần ba lượt trao đổi có ý nghĩa, đổi một bối cảnh và một câu hỏi học viên hỏi lại ALEX trước khi chuyển tiếp.
- Voice-first: học viên tự bấm Voice/microphone của ChatGPT một lần rồi nói cho đến khi nói dừng/lưu/kết thúc. ALEX không yêu cầu gõ, không tự kết thúc lesson, đọc mẫu từ/cụm mới, sửa phát âm ngắn theo thực hành rồi mời nói lại. Không có điểm phát âm tự động.
- Không đổi Worker/D1 contract: v7.0.0 chỉ dùng `saveLearningCheckpoint` hợp lệ với `mode=lesson`, lesson đang được giao, `lesson_phase_n` nội bộ và `taught_items=conversation-v1; ...`. Checkpoint chỉ gọi khi học viên yêu cầu dừng/lưu; không có `mode=conversation` chưa hỗ trợ.
- Cloudflare preflight đã xác minh đúng account `0af62f8ed73f84c95453102139345d6f` và remote D1 `SELECT 1` thành công, không ghi dữ liệu. Worker `alex-pro-hub-api` đã deploy version `a20271ee-fc08-426a-ad5f-4ca7c04989f9`; health production trả `status: ok`. Không cần migration D1 hoặc Pages deploy cho release Instructions/Knowledge này.
- GPT Builder đã publish v7.0.0: mô tả, Instructions, OpenAPI Action và năm starter cùng nguồn local. Chỉ còn một Knowledge `FILE_2_KNOWLEDGE_CORE.md`; đã gỡ `LES-0004_Family.md`, `LES-0005_Numbers_and_Time.md`, `LES-0006_Places.md` và bản Core cũ trước khi tải lại.
- Browser test trên GPT public xác nhận starter Voice-first hiển thị và phản hồi yêu cầu bấm Voice/microphone, đọc mã học viên bằng giọng nói hoặc đăng ký trial; không yêu cầu học viên gõ. Prototype website Fish/replay vẫn ở local, không nằm trong scope release này.

---

## 2026-08-07 — v6.9.0 nghe mẫu Fish + ghi âm cục bộ 📚 HISTORICAL STAGING

- v6.9.0 là nhánh chuẩn bị kỹ thuật đã được supersede bởi v7.0.0 Voice-first và phát hành đầy đủ ở v7.1.0. Không chạy lại các mutation lịch sử hoặc publish Builder v6.9.0.
- Contract web riêng tiếp tục là `docs/voice-api-openapi-v1.yaml`; Custom GPT chỉ dùng `alex-pro-openapi-v3.yaml` v7.1.0.

---

## 2026-08-07 — v6.8.0 tài khoản dễ nhớ, 20 bài và 8 Mục ✅ PRODUCTION

- Worker production `7d845794-c316-4c4a-9428-d13297d65369` healthy; migration `0004_learner_code_vault.sql` và `0005_curriculum_v680.sql` đã chạy remote. Catalog hiện có 20 bài A0–C1.
- Đăng ký trial/Admin dùng Tên ALEX gọi + số điện thoại 9–15 chữ số. Mã cố định có dạng tên viết liền + 6 số cuối; chỉ thêm số thứ tự khi trùng. Mã và số điện thoại được mã hóa cho Admin xác thực, không xuất hiện trong log/tài liệu.
- R2 đã publish/readback 14 bài mở rộng theo đúng key `lessons/...`. Nội dung live có `Mục 2/8: Từ vựng`, `Mục 5/8: Shadowing & phát âm`, `Mục 6/8: Đối thoại`.
- Builder ALEX PRO đã publish v6.8.0: Instructions/Knowledge Core/OpenAPI cùng nguồn local; demo public trả `Daily Route — Mục 1/8: Mục tiêu & check-in`.
- Browser kiểm thực tế: đăng ký có Tên + Số điện thoại; Admin đếm 20 lessons và danh sách có Mã học viên + Số điện thoại. API probe an toàn đã kiểm 30-day trial boundary, gia hạn 365 ngày, lesson nâng cao, lookup chữ thường và cleanup account thử.
- Local tests 31/31 pass; OpenAPI lint pass. Tạo handoff snapshot cuối sau phần xác nhận này; `backups\LATEST.md` là điểm bàn giao chuẩn.

---

## Thông tin tài khoản ĐÚNG
| Thông tin | Giá trị |
|-----------|---------|
| Account deployment chuẩn | `0af62f8ed73f84c95453102139345d6f` |
| Cách xác minh | Resource ID + remote `SELECT 1`; không dựa vào email `wrangler whoami` |
| API token triển khai | local-only trong `alex-pro-cloudflare.env` → `CLOUDFLARE_API_TOKEN`; cần Workers Scripts/D1/Pages write |
| Worker URL | https://alex-pro-hub-api.chihuy239122.workers.dev |
| Admin Key | local secret `ALEX_ADMIN_KEY` trong `alex-pro-cloudflare.env` |
| Service Key | local secret `ALEX_SERVICE_API_KEY` trong `alex-pro-cloudflare.env` |

> ⚠️ Chỉ account ID chuẩn ở bảng trên được dùng. Email/OAuth hiển thị bởi CLI có thể khác hoặc cũ; không được deploy nếu resource preflight hay remote `SELECT 1` trả lỗi quyền.

---

## Bindings Worker `alex-pro-hub-api`
| Binding | Loại | Tên |
|---------|------|-----|
| `env.DB` | D1 Database | `alex-pro-hub-db` |
| `env.CONTENT` | R2 Bucket | `alex-pro-content` |
| D1 UUID | — | `7b5809a6-fdfc-4405-8f6a-5d1e64ce9e54` |

---

## Cấu trúc thư mục

```
d:\ALEXPRO\
├── FILE_1_INSTRUCTIONS.md        — Instructions cho Custom GPT
├── FILE_2_KNOWLEDGE_CORE.md      — Knowledge content cho GPT
├── FILE_3_PROGRESS_AND_SETUP.md  — Hướng dẫn setup GPT
├── alex-pro-cloudflare.env       — TẤT CẢ credentials
├── CLOUDFLARE_PROGRESS.md        — File này (progress tracking)
├── worker\                        — Worker source (local)
│   ├── wrangler.toml             — Config deploy
│   └── worker.js                 — Source đã cập nhật CORS + listLearners
└── alex-pro-admin\               — Admin Panel
    └── index.html                — Toàn bộ UI (dark theme, sidebar, 5 sections)
```

---

## Lịch sử deploy

### 2026-08-07 — v6.7.0 four-skill Placement ✅ PRODUCTION

- Worker `alex-pro-hub-api` đã deploy version `5aff2a94-ec9c-4ff7-8be3-433bfb6c08d5`. Contract CEFR 4 kỹ năng dùng các route canonical `/v1/progress/placement`, `/v1/progress/checkpoint`, `/v1/progress/read`; không tạo `/resume` trùng lặp và không có migration mới.
- Trial 30 ngày không có quota buổi học, ôn tập hoặc checkpoint; cho phép placement + Daily Route, chặn lesson sau cho đến khi paid. Kiểm production với account cô lập đã pass health, Daily Route, chặn lesson sau, placement save/readback, invalid-band 422 và cleanup.
- `FILE_1_INSTRUCTIONS.md`, `FILE_2_KNOWLEDGE_CORE.md`, `FILE_3_PROGRESS_AND_SETUP.md` và OpenAPI đã publish đồng bộ v6.7.0. GPT public hiển thị mô tả v6.7.0 và bốn starter ưu tiên đăng ký/mã/placement; starter Placement trả về đúng bước kiểm tra mã hoặc đăng ký trial.
- 21 test local pass với 93.03% line coverage; OpenAPI lint pass. Đã tạo handoff snapshot local trước release; snapshot cuối sau mọi ghi nhận ở `backups\LATEST.md`, gồm D1 SQL, manifest SHA-256 và source ZIP, không chứa credentials.

### 2026-08-07 — Release account cố định + học thử 30 ngày ✅ PRODUCTION

- **Nguồn chuẩn**: `D:\ALEXPRO` là source of truth; đã có `AGENTS.md`, `docs\PROJECT_CURRENT_STATE.md` và Skill `alex-pro-release-sync`. Release được làm local trước rồi đồng bộ Worker/D1, Pages và GPT Builder.
- **D1 + Worker**: remote migration `0003_resume_and_entitlements.sql` đã chạy 6 queries. Worker `alex-pro-hub-api` đang ở version `7880ea41-ef4a-4b34-b428-be74ce34ee0c`; health production trả `status: ok`.
- **Entitlement + resume**: tài khoản dùng một `learner_code` cố định. Trial 30 ngày, paid/expired/legacy, gia hạn cộng dồn theo cùng `learner_id`, event lịch sử và checkpoint placement/lesson đã live.
- **Bảo vệ đăng ký**: Turnstile Managed widget cho `alex-pro-start.pages.dev`, `TURNSTILE_SECRET_KEY` và `REGISTRATION_RATE_LIMIT_SALT` chỉ lưu trong Worker secrets. Public route fail-closed nếu thiếu secret, mã phát ngẫu nhiên và rate limit không lưu IP thô.
- **Pages**: Admin đã deploy `https://alex-pro-admin.pages.dev/` (preview `d8ed471a.alex-pro-admin.pages.dev`); trang self-sign-up đã deploy `https://alex-pro-start.pages.dev/` (preview cuối `2667d5fa.alex-pro-start.pages.dev`). Sửa runtime thật: không dùng `id="turnstile"` ghi đè global và đọc token từ hidden response chuẩn của Turnstile.
- **GPT**: đã publish ALEX PRO v6.6.0 với Instructions 4.498 ký tự, mô tả/starter mới và Action OpenAPI v1.3.0 gồm `getAssignedLesson` + `saveLearningCheckpoint`; Builder không còn warning bỏ qua endpoint.
- **Kiểm production**: Admin UI tạo mã ngẫu nhiên + trial; public form đi qua Turnstile, tạo mã + hạn 30 ngày; API gia hạn 365 ngày giữ đúng learner ID, chuyển `paid`/`annual_50k`; các learner kiểm thử đã xóa và Admin còn 1 học viên thật. UI trang đăng ký không tràn ngang ở mobile 390px, tablet 768px và desktop 1440px.
- **Tài khoản hiện tại**: một tài khoản học viên thật đã đọc progress thành công, trạng thái `paid`, active và giữ bài `LES-0001`; trang Admin hiện Gia hạn thay vì Cấp mã.

### 2026-08-06 — Học thử, mã học tiếp và sửa dữ liệu hiển thị ✅

- **Worker production**: version `edb6bfaa-7b9d-402e-baca-7222bf7bcbb4`.
- **Admin Key**: đã đổi bằng secret `ALEX_ADMIN_KEY` trong Worker và file local `alex-pro-cloudflare.env`; không ghi giá trị khóa vào tài liệu hay source.
- **Quyền học**: học viên chưa được giáo viên cấp mã chỉ đọc được `Daily Route`. API chặn bài sau bằng `403 teacher_access_code_required`; mã hợp lệ của giáo viên mới mở bài sau.
- **Admin API mới**: `PUT /v1/admin/learners/{learner_id}/access-code` nhận mã học tiếp, chỉ lưu SHA-256 hash. Không có hash hoặc mã thô trong API trả về.
- **Đã kiểm production**: tạo học viên thử `201`; đọc `Daily Route` `200`; đọc bài sau không mã `403`; cấp mã `200`; đọc bài sau với mã `200`; bản ghi thử đã xóa sau kiểm tra.
- **Dữ liệu giao diện**: đã sửa alias bị lỗi thành `Chí Huy` và xóa bản ghi thử `Temporary runtime trace`; hiện còn đúng một học viên thật trong danh sách.
- **Admin Panel production**: đã deploy lại nhánh `main` (deployment `839bfe0e.alex-pro-admin.pages.dev`). Bản public `https://alex-pro-admin.pages.dev/` đã kiểm trực tiếp: font Noto Sans tải được, tên `Chí Huy` hiển thị đúng, bài hiện tại là `Daily Route`, trạng thái `Học thử · Daily Route` và nút `Cấp mã` có mặt.
- **GPT Editor**: Đã xuất bản `ALEX PRO v6.3.0`, model `Thinking 5.6`, bốn starter, tắt `Tạo ảnh`, Instructions v6.3.0 (xếp lớp thích ứng, hội thoại tự nhiên, Starter Zero) và OpenAPI có `teacher_access_code`; Action health trả `status: ok`. Knowledge đang gồm `FILE_2_KNOWLEDGE_CORE.md` v6.2 và ba source lesson `LES-0004_Family.md`, `LES-0005_Numbers_and_Time.md`, `LES-0006_Places.md`.

### 2026-08-06 — Khôi phục Action API và đổi tên bài học ✅

- **Worker production**: version `c8ca369f-d467-462f-b0aa-9f362de78add`.
- **Đã sửa**: mã học viên theo OpenAPI (chỉ chữ/số, 8–30 ký tự); tạo học viên để D1 tự cấp `INTEGER learner_id`; lỗi D1 không còn trả chi tiết nội bộ cho client.
- **Đã kiểm production**: health `200`; đọc tiến độ `200`; đọc bài `200`; lưu xếp lớp `201`; lưu lượt học `201`; hồ sơ thử đã xóa sau kiểm tra.
- **Catalog/R2**: đã publish sáu bài theo tên (`Daily Route`, `Shopping`, `Restaurant`, `Family`, `Numbers and Time`, `Places`); mã nội bộ không hiển thị cho học viên. Lesson 4–6 đã upload R2, D1 catalog có `is_published=1`, và SHA-256 readback từ R2 khớp nguồn local.
- **Hồ sơ dùng trong GPT Editor**: một mã học viên thật đã được tạo, nên action đọc tiến độ/bài có dữ liệu hợp lệ để kiểm tra.
- **GPT Editor**: đã thay khóa Authentication của Action bằng local secret `ALEX_SERVICE_API_KEY`, nạp schema mới có `teacher_access_code`, thay Instructions và xuất bản cấu hình. Kiểm tra trực tiếp Action health đã trả `status: ok`; các kiểm tra đọc tiến độ/bài trước đó không còn `403` hoặc `ClientResponseError`, bài trả về là `Daily Route`. Knowledge v6.2 và source Lesson 4–6 đã được nạp/xuất bản thành công.
- **Admin Pages**: token `alex-pro-full-operational-deploy` chỉ lưu local trong `alex-pro-cloudflare.env`. Đã deploy production/main; URL public hiển thị `Daily Route`, `Shopping`, `Restaurant`; mã bài chỉ còn nội bộ.

### 2026-08-06 — Worker cập nhật ✅

**Thay đổi đã áp dụng vào `worker.js`:**
1. ✅ `JSON_HEADERS` thêm CORS headers (`Access-Control-Allow-Origin: *`, Allow-Headers, Allow-Methods)
2. ✅ OPTIONS handler: thay vì trả 405 → trả `204` với đầy đủ CORS headers (đặt TRƯỚC mọi route)
3. ✅ Thêm function `listLearners()` — `GET /v1/admin/learners` (có pagination: limit/offset)

**Deploy thành công:**
- Version ID: `92e9d76f-b0e1-4d37-9784-36d15a0e0564`
- URL: https://alex-pro-hub-api.chihuy239122.workers.dev

### 2026-08-06 — Admin Panel tạo ✅ / Deploy ⏳

**File tạo:** `d:\ALEXPRO\alex-pro-admin\index.html`

**Tính năng:**
- Dark theme: bg `#0f1117`, sidebar `#1a1d27`, card `#242736`
- Font Inter (Google Fonts)
- Sidebar 240px cố định, 5 navigation items
- Màn hình login: nhập Admin Key → verify qua `/v1/health`
- Section Tổng quan: 3 stat cards + API status bar
- Section Tạo học viên: form + generate code `ALEX-XXXXXXXX-XXXX-XXXX`
- Section Danh sách: table với skeleton loading
- Section Tra cứu tiến độ: search + timeline 5 attempts
- Section Cài đặt: API info + test connection
- Auto-login nếu key đã lưu trong localStorage

**Deploy Pages:** ✅ Đã deploy thành công qua /browser subagent
- Project name: `alex-pro-admin`
- **Live URL: https://alex-pro-admin.pages.dev/**
- File: `index.html` (41 KB, all-in-one)
- Region: Earth 🌍

---

## Endpoints API đầy đủ

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/v1/health` | Public | Health check |
| GET | `/privacy` | Public | Privacy notice |
| POST | `/v1/admin/learners` | Admin Key | Tạo học viên mới |
| **GET** | **`/v1/admin/learners`** | **Admin Key** | **Danh sách học viên** ← MỚI |
| **PUT** | **`/v1/admin/learners/{learner_id}/access-code`** | **Admin Key** | **Cấp hoặc thay mã học tiếp (chỉ lưu hash)** |
| GET | `/v1/progress` | Service/Admin | Lấy tiến độ (query param) |
| POST | `/v1/progress/read` | Service/Admin | Lấy tiến độ (body JSON) |
| GET | `/v1/lessons/{id}` | Service/Admin | Nội dung lesson (query param) |
| POST | `/v1/lessons/read` | Service/Admin | Nội dung lesson (body JSON) |
| POST | `/v1/progress/placement` | Service/Admin | Lưu xếp lớp |
| POST | `/v1/progress/attempt` | Service/Admin | Lưu attempt |

---

## Lưu ý kỹ thuật quan trọng

- **Learner code**: Được hash SHA-256 trước khi lưu vào DB — KHÔNG lưu raw code
- **Danh sách học viên**: Trả về `learner_id` (không phải raw code vì đã hash)
- **Wrangler deploy**: Luôn set `$env:CLOUDFLARE_API_TOKEN` trước khi chạy
- **OAuth conflict**: Có OAuth session cũ của `zacha030596@gmail.com` — luôn dùng token env var
- **Lệnh deploy Worker**: `wrangler deploy` trong `d:\ALEXPRO\worker\`

---

## Lệnh deploy nhanh (copy & paste)

```powershell
# Nạp token từ file local — không dán token vào terminal, tài liệu hoặc commit
$env:CLOUDFLARE_API_TOKEN = ((Get-Content 'D:\ALEXPRO\alex-pro-cloudflare.env' |
  Where-Object { $_ -match '^CLOUDFLARE_API_TOKEN=' }) -replace '^CLOUDFLARE_API_TOKEN=', '').Trim()

# Deploy Worker
cd d:\ALEXPRO\worker
wrangler deploy

# Deploy Admin Panel
cd d:\ALEXPRO\alex-pro-admin
wrangler pages deploy . --project-name alex-pro-admin
```
## v7.2.0 — Core-synchronised English voice curriculum (API + ALEX Voice ✅ PRODUCTION; Custom GPT processing pending)

- Voice API read/select routes are live on Worker `alex-pro-hub-api` version `d117a806-541c-40c0-b603-494be26608de`. They read the shared published lesson catalogue and update only the signed learner's current lesson; no D1 schema migration was required.
- ALEX Voice production deployment is `https://264029e8.alex-pro-voice.pages.dev`; the canonical `https://alex-pro-voice.pages.dev/?release=7.2.0` now serves the slow/normal/fast English playback control and the shared lesson flow: 2–3 vocabulary items, Vietnamese meaning, English model/example, listen, local record/replay, and short dialogue practice.
- Release preflight proved canonical Cloudflare account access and a harmless remote D1 `SELECT 1`. Live verification: Worker health HTTP 200; Voice curriculum CORS preflight HTTP 204 with the canonical Voice origin; deployment-specific and canonical Pages HTML contain the new speech-speed control.
- Local verification: 58/58 tests passed; JavaScript syntax checks for the Voice app, curriculum parser and Voice API passed. A pre-release D1 SQL/source/manifest archive was created and integrity-checked.
- GPT Builder has one v7.2.0 Knowledge Core file and the v7.2.0 Instructions, including full-turn correction, complete vocabulary groups and up to three next topics. The update was submitted, but the Builder currently says “Cập nhật đang chờ xử lý”; re-test the public Voice teaching behavior once ChatGPT finishes provider processing.
- Signed learner, Fish sample and responsive mobile/tablet/desktop interaction remain an authorized human verification step because Turnstile must be completed manually. No audio, transcript or automated pronunciation score is claimed.

## English App rebuild — not deployed (2026-08-20)

- Target resources from the SPEC are not created or mutated: `english-app-api`, `english_app_db`, `english-app-audio`, and `ispeakerreact`.
- The contract and plan were revised after Aki review to add enforceable token retry accounting, explicit inline MeloTTS delivery, idempotency edge cases, and strict deadline/magic-byte gates.
- Deployment remains blocked: AGY returned `REVISE`, and Aki's Claude bridge currently reports no eligible Claude account. No old ALEX PRO resource has been deleted and no new resource has been created.
- Review evidence: `docs/reviews/2026-08-20-aki-english-app-review-blocked.md`. Next action is a successful Aki Claude + AGY gate followed by action-time confirmation for resource changes.

## English App implementation started after user waiver (2026-08-20)

- AGY wrote the UI artifact under `apps/web`; Codex wrote the Hono/D1/Workers AI/R2 integration foundation under `apps/api`, `packages/shared`, and `migrations`.
- Local verification passed: UI 17/17, API 9/9, TypeScript builds, npm audit with 0 vulnerabilities, Wrangler dry-run, local Worker health and static asset serving.
- This line records the pre-authorization state. The user subsequently confirmed production changes; the current resource ledger is recorded in the production release section below.

## English App production release (2026-08-20)

- Deleted old resources after account/D1 preflight: Worker `alex-pro-hub-api`, D1 `alex-pro-hub-db`, R2 `alex-pro-content` after deleting 63 objects, and Pages `alex-pro-admin`, `alex-pro-start`, `alex-pro-voice`.
- Created and deployed new resources: Worker `english-app-api` version `8a4a9f19-eadd-4e7f-888f-23ede7e3402b`, D1 `english_app_db` (`4ea5ccaa-c901-496c-ac0c-5854733c1428`), R2 `english-app-audio`, and Pages `ispeakerreact` (`https://ispeakerreact-5u6.pages.dev`).
- Migration `0001_init.sql` was applied and table readback passed. `TURN_TOKEN_SECRET` is set as a Worker secret. Live Worker/Pages smoke checks passed.
- R2 lifecycle verified: enabled `audio-retention` expires `audio/` objects after 45 days; the default multipart-abort rule remains enabled. GitHub push remains blocked because the authenticated keyring identity has `pull=true`, `push=false` for `chihuy239122/englishapp`.

## English App content integration release (2026-08-20)

- Local source now includes `migrations/0002_learning_content.sql` and `docs/CONTENT_SOURCES.md`.
- The migration adds four D1-backed topics and twelve bilingual phrases with source/license provenance. Worker route: `GET /api/content/topics`.
- iSpeaker Pages no longer owns the topic catalog; production builds call `https://english-app-api.chihuy239122.workers.dev/api/content/topics`.
- Local checks passed: API `11/11`, UI `26/26`, TypeScript builds and iSpeaker Pages build.
- Remote migration applied and ledger readback is clean: 3 sources, 4 topics, 12 phrases; `wrangler d1 migrations list` reports no pending migrations. Existing `0001` schema was baselined rather than rerun.
- Worker version `6be29295-79ab-4cbc-a9b9-952c13adaf4c` is live. Pages deployment `https://bcf95400.ispeakerreact-5u6.pages.dev` is live and canonical `https://ispeakerreact-5u6.pages.dev` returns 200.
- Live checks passed: Worker health 200; content API 200; CORS preflight 204 for the Pages origin; content counts and production bundle route readback match.
- Final post-deploy handoff snapshot is pointed to by `backups/LATEST.md`; the latest snapshot has 101 manifest entries and passed secret exclusion.
- Open items: real iPhone Safari microphone/audio acceptance and GitHub write permission. No real AI audio turn was run without a human recording.

## English App follow-up verification (2026-08-21)

- Claude and AGY read-only access to `D:\ALEXPRO` was rechecked successfully through Aki; no deployment or resource mutation occurred.
- Claude UI-fix dispatch was blocked by `No eligible account from Pool Scheduler`; the topic/level mismatch and iPhone Safari upload hardening were not changed.
- GitHub API confirms `skymax2309` remains read-only (`push=false`) for `chihuy239122/englishapp`.
- Real iPhone Safari microphone/audio verification is still required before marking the acceptance gate complete.

## English App UI/audio hardening release (2026-08-21)

- Claude.ai applied the UI/audio hardening patch and AGY final read-only audit passed the requested fixes.
- Local verification passed: UI `37/37`, API `11/11`, Worker/Pages builds, and `npm audit --omit=optional` with 0 vulnerabilities.
- Preflight verified account `0af62f8ed73f84c95453102139345d6f` and remote D1 `SELECT 1`; no migration, D1, R2, or GitHub mutation was performed.
- Worker `english-app-api` deployed version `52af7107-6743-4d8e-bd07-ff5c30bd3943`.
- Pages `ispeakerreact` deployed at `https://44a85bd7.ispeakerreact-5u6.pages.dev`; canonical URL returned HTTP 200 and live DOM showed the selected advanced topic with the matching `advanced` phrase label.
- Remaining acceptance gates: real iPhone Safari microphone/audio test and GitHub write permission (`skymax2309` remains `push=false`).

## GitHub source sync (2026-08-21)

- Verified the project `.env` GitHub configuration without printing its token value.
- API readback returned `push=true` for `chihuy239122/englishapp`.
- Initialized local `main`, confirmed secret env files are not tracked, and pushed commit `3914a1de9ca03bc87e8bc3d8cb5a06f7277b574a` to the canonical GitHub remote.
- GitHub write access is resolved; only real iPhone Safari microphone/audio acceptance remains open.

## English App curriculum and progress release (2026-08-21)

- Applied remote D1 migration `0003_curriculum_expansion.sql` after local validation. Readback: 4 modules, 16 lessons, 92 linked phrases (80 new + 12 legacy), 48 IPA vocabulary records, 0 progress rows; Wrangler reports no pending migration.
- Added Worker routes `/api/content/curriculum` and `/api/users/:id/progress`. Session context now carries module/lesson/phrase IDs, turns persist `phrase_id`, and successful turns upsert learner progress.
- Worker `english-app-api` version `3d31a5d6-bbd6-4cd5-a906-665ebfc09e84` is live. Pages deployment `https://312da61a.ispeakerreact-5u6.pages.dev` is live; canonical `https://ispeakerreact-5u6.pages.dev` returns HTTP 200.
- Local verification: UI `38/38`, API `14/14`, web/API builds, local and remote migration apply pass. Live verification: health 200, curriculum/progress API 200, target phrase context preserved from iSpeaker bridge, Statistics renders, and no horizontal overflow at 375/768/1440 CSS widths.
- No secret/token values were added to source or documentation. Real iPhone Safari microphone/audio acceptance remains the only open acceptance gate.

## English App CEFR content bank release (2026-08-21)

- Applied the retained `0004_curriculum_levels.sql` after renaming only its colliding vocabulary table to `content_level_vocabulary`; no existing lesson/progress table was deleted or overwritten.
- Added and deployed `GET /api/content/levels`. Remote readback: 5 levels, 15 units, 120 level vocabulary records and 90 sentence examples; migration ledger has no pending entries.
- Worker `english-app-api` version `d4212dde-9880-40e6-b876-a6e2250ff50f` and Pages deployment `https://d484e9ed.ispeakerreact-5u6.pages.dev` are live. The canonical Pages URL returns HTTP 200.
- Live browser check confirms the A1 → C1 track is visible and the UI has no horizontal overflow at 375, 768 or 1440 CSS px. No secret/token values were added to source or docs.
- GitHub `main` readback is synchronized at `7528163`; repository API confirms `push=true`.
