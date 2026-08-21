# ALEX PRO — Agent Rules

## Bắt buộc dùng Aki + Claude + AGY cho dự án mới

- Aki là bộ điều phối review ở `D:\ALEX_LAB`; mọi plan và thay đổi kiến trúc của dự án mới phải đi qua Aki trước khi viết code.
- Aki phải gửi cùng một review packet, độc lập, cho hai target thật là `claude` và `agy` qua `aki_dispatch`. Trong luật này, target `claude` nghĩa là **Claude.ai** (tài khoản/agent trên Claude.ai được Aki điều phối), không phải Claude Code/CLI hay Claude API.
- Không dùng sub-agent Codex, bản tóm tắt cũ, hoặc kết quả tự suy diễn để giả làm review của Claude/AGY.
- Claude là owner UI/UX: Claude phải viết trọn bộ giao diện, layout, CSS, interaction, responsive behavior, accessibility copy và UI test artifact theo SPEC.
- Codex không tự thiết kế, viết lại hoặc chỉnh UI/UX. Codex chỉ nhận artifact UI đã được Claude bàn giao, sau đó viết Worker/API/backend, shared contract, persistence, AI orchestration và integration tối thiểu cần thiết.
- AGY phải phản biện độc lập artifact/UI plan của Claude, tập trung vào mobile-first, iPhone Safari, MediaRecorder, accessibility, responsive ở 375/768/1440px, lỗi tràn ngang, loading/error/empty và khả năng vận hành.
- Chỉ được bắt đầu implementation khi Aki trả về raw review của Claude, raw review của AGY, bản phản biện tổng hợp, blocker P0/P1, acceptance gates và trạng thái transport/auth thành công của cả hai agent.
- Nếu Claude bridge lỗi, AGY bị từ chối quyền đọc, `aki_dispatch` lỗi, hoặc thiếu artifact/UI review: trạng thái là `blocked`; không được viết code, deploy, hoặc tạo/xoá resource để lách cổng.
- Khi agent không đọc được workspace chéo, Aki phải dùng review packet chứa nội dung non-secret cần review hoặc artifact được cấp quyền rõ ràng; không gửi token, env, cookie, learner data hay raw audio.
- Lưu bằng chứng review vào `docs/reviews/` với timestamp, target, status, files reviewed, raw findings và verdict; không lưu secret.
- Sau khi Codex hoàn tất backend, gửi lại đúng diff/API contract cho Claude và AGY review hậu kiểm; chỉ báo pass khi cả hai review hậu kiểm và test thật đều pass.

Read `docs/PROJECT_CURRENT_STATE.md`, `CLOUDFLARE_PROGRESS.md`, and the `alex-pro-release-sync` skill before changing ALEX PRO.

- `D:\ALEXPRO` is the local source of truth. Do not patch Cloudflare or GPT Builder first.
- One functional release updates local Worker/API/migrations/tests, GPT source instructions/OpenAPI, and Cloudflare deployment together.
- Update the GPT Builder only after the matching live Worker route is verified.
- `learner_code` is a permanent learner-account identifier. Trials, expiry, payment and renewal change entitlement only; never replace the code or erase progress.
- Never store or print service keys, admin keys, tokens, raw payment data, or raw learner codes in logs or documentation.
- Before an external deploy, migration, Pages publish, or GPT publish, show what will change and obtain the required action-time confirmation.
- After each change, update `docs/PROJECT_CURRENT_STATE.md` and `CLOUDFLARE_PROGRESS.md` with verified facts only.
- Canonical GitHub remote for the new project is `https://github.com/chihuy239122/englishapp.git`; it was read-only verified as an empty repository on 2026-08-19.
- Preserve GitHub authentication in the OS keyring; never copy or print the GitHub token into `AGENTS.md`, `HANDOFF.md`, docs, logs, or a new plaintext env file.
- Do not push, create branches, or change repository settings until the authenticated GitHub identity is verified to have write access to `chihuy239122/englishapp` and the Aki/Claude/AGY review gate has passed.
- Before a production release and after its live verification, run `scripts\create-alex-handoff.ps1`; keep `HANDOFF.md`, its local D1 export and source manifest available for authorized handoff. `HANDOFF.md` is the quick, human-readable deployment-identity file; `backups\LATEST.md` points to the latest full snapshot.

## Canonical Cloudflare deployment profile

- English App deploys **only** to Cloudflare account `0af62f8ed73f84c95453102139345d6f`: Worker `english-app-api`, D1 `english_app_db`, R2 `english-app-audio`, and Pages `ispeakerreact`. The local `wrangler.jsonc` must keep this account ID. The retired ALEX PRO resource names are historical and must not be reused.
- Load the project-only `CLOUDFLARE_API_TOKEN` from local `alex-pro-cloudflare.env`. `wrangler whoami` email text is not sufficient proof of the target account or write access. Before any mutation, verify the resource account and run a harmless remote D1 `SELECT 1`; stop on `7403` or any authorization failure.
- The deploy token must have only the required project-account permissions: account read, Workers Scripts write, D1 write, and Pages write. Do not use a Global API Key, an OAuth account from another project, or an unverified broad token.

## Synchronization Rule (mandatory)

Any change that affects system behavior must update the matching local surfaces before the task can finish: Worker/API, OpenAPI, `FILE_1_INSTRUCTIONS.md`, `FILE_2_KNOWLEDGE_CORE.md`, tests, `docs/PROJECT_CURRENT_STATE.md`, and `CLOUDFLARE_PROGRESS.md` when a deploy or release state changes. Update `alex-pro-release-sync` when the release workflow itself changes. Do not publish one surface ahead of its matching source.

## Definition of Done

A task is complete only when the local code is fixed; relevant tests pass; OpenAPI matches Worker; FILE_1 matches the Action contract; FILE_2 matches FILE_1; project state is updated; Cloudflare progress is updated when applicable; and every changed release source declares the same release version. Production verification is additionally required for any deploy.
