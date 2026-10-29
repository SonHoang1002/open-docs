# Checklists & Templates cho API — bộ công cụ review và vận hành

> Bộ checklist và template có thể copy-paste cho `wedding-server` (Bun + Hono + Supabase):
> review thiết kế, endpoint, schema, OpenAPI, bảo mật, production readiness, PR, RFC,
> deprecation, changelog, error catalog, test plan, runbook, postmortem và scorecard.
>
> **Liên quan:** [README](./README.md) · [01 — Fundamentals](./01-fundamentals.md) ·
> [02 — REST design](./02-rest-design.md) · [03 — OpenAPI](./03-openapi.md) ·
> [04 — Lifecycle](./04-lifecycle-process.md) · [05 — Project structure](./05-project-structure.md) ·
> [06 — Testing & Observability](./06-testing-observability.md) ·
> [Bảo mật API](../api-security.md) · [WebSocket](../websocket.md) ·
> [PostgreSQL cơ bản](../postgresql-basics.md) · [PostgreSQL nâng cao](../postgresql-advanced.md)

## Mục lục

1. [Cách dùng bộ checklist & template](#1-cách-dùng-bộ-checklist--template)
2. [Design review checklist](#2-design-review-checklist)
3. [REST endpoint checklist](#3-rest-endpoint-checklist)
4. [Database schema checklist](#4-database-schema-checklist)
5. [OpenAPI checklist](#5-openapi-checklist)
6. [Security checklist](#6-security-checklist)
7. [Production readiness checklist](#7-production-readiness-checklist)
8. [PR checklist](#8-pr-checklist)
9. [Definition of Done](#9-definition-of-done)
10. [RFC template](#10-rfc-template)
11. [Design review meeting template](#11-design-review-meeting-template)
12. [Deprecation notice template](#12-deprecation-notice-template)
13. [Changelog template](#13-changelog-template)
14. [Error catalog template](#14-error-catalog-template)
15. [OpenAPI skeleton](#15-openapi-skeleton)
16. [Test plan template](#16-test-plan-template)
17. [Runbook template](#17-runbook-template)
18. [Postmortem template](#18-postmortem-template)
19. [API scorecard](#19-api-scorecard)
20. [PR/CI & cách dùng template](#20-prci--cách-dùng-template)
21. [Anti-patterns & bài tập](#21-anti-patterns--bài-tập)
22. [Tài liệu tham khảo](#22-tài-liệu-tham-khảo)

## 1. Cách dùng bộ checklist & template

Mỗi artifact có thời điểm và người chịu trách nhiệm rõ ràng. Checklist không thay thế phán
đoán kỹ thuật; nó bảo đảm các câu hỏi quan trọng **không bị bỏ quên**.

| Artifact | Dùng khi | Owner | Đầu ra |
|---|---|---|---|
| Design review checklist | Trước khi viết code endpoint mới | API owner + reviewer | Quyết định approve/revise |
| REST endpoint checklist | Trong PR hoặc trước merge | Tác giả + reviewer | PR evidence |
| Database schema checklist | Có migration/schema change | Backend + DBA | Migration an toàn |
| OpenAPI checklist | Spec thay đổi | API owner | Spec lint + diff |
| Security checklist | Mọi endpoint/sự kiện release | Security reviewer | Risk sign-off |
| Production readiness | Trước lần deploy đầu tiên | Tech lead + on-call | Go/no-go |
| PR checklist | Mỗi pull request | Tác giả | PR sẵn sàng review |
| Definition of Done | Cuối mỗi story | Team | Done thật, không chỉ merged |
| RFC | Thay đổi lớn/khó đảo ngược | Tác giả RFC | Quyết định ghi lại |
| Runbook | Trước khi bật alert | On-call owner | Quy trình xử lý sự cố |

**Mức độ bắt buộc** dùng thống nhất trong mọi checklist:

| Mức | Ý nghĩa | Hành động |
|---|---|---|
| `[blocker]` | Có thể mất dữ liệu, lộ dữ liệu hoặc sập dịch vụ | Không merge/deploy |
| `[should]` | Rủi ro vận hành hoặc trải nghiệm | Có owner + ngày xử lý |
| `[nice]` | Cải thiện nhỏ | Backlog, không chặn release |

> 💡 Mỗi mục nên trả lời được "làm sao biết mục này đã xong?" Ví dụ thay vì
> "đã test validation", ghi "có test cho empty/max/sai kiểu, link CI job".

## 2. Design review checklist

Review tập trung vào contract, dữ liệu, bảo mật và vận hành — không sa vào style code.

| Vai trò | Trách nhiệm |
|---|---|
| Tác giả | Problem, proposal, trade-off |
| API reviewer | Contract, naming, versioning |
| DB/security | Schema, migration, authz, PII |
| On-call | Observability, rollback, capacity |

### 2.1. Problem & contract

- [ ] `[blocker]` Problem phát biểu theo hành vi người dùng; có goal/non-goal.
- [ ] `[blocker]` Method/path/status/schema khớp [REST design](./02-rest-design.md).
- [ ] `[blocker]` Lỗi có mã ổn định + message; có ví dụ request/response.
- [ ] `[should]` Pagination, idempotency, ảnh hưởng WebSocket được nêu.
- [ ] `[should]` Có phương án thay thế và lý do loại bỏ.

### 2.2. Dữ liệu & vận hành

- [ ] `[blocker]` Schema/index/ràng buộc đã review; có migration + rollback.
- [ ] `[blocker]` PII được phân loại; có chính sách lưu/xoá.
- [ ] `[should]` SLO, metric, log, trace, alert đi kèm.
- [ ] `[should]` Có feature flag/tắt nhanh; ước lượng volume ngày cưới.

**Kết thúc:** ghi `Approve` / `Approve with conditions` / `Reject` + owner và hạn chót.

> ⚠️ Không review bằng cách đọc code đã xong; sửa contract sau khi client tích hợp rất đắt.

## 3. REST endpoint checklist

### 3.1. Contract

- [ ] `[blocker]` Path danh từ số nhiều; method đúng semantics (`GET/POST/PUT/PATCH/DELETE`).
- [ ] `[blocker]` Status code đúng: `200/201/204` thành công; `400/401/403/404/409/413/422/429` lỗi client.
- [ ] `[blocker]` Envelope nhất quán: `{ success, data }` hoặc `{ success, error, issues }`.
- [ ] `[blocker]` Không trả `200` kèm `success: false` cho lỗi nghiệp vụ.
- [ ] `[should]` `Location` khi tạo mới; `Content-Type` UTF-8 đúng.
- [ ] `[should]` Có `ETag`/`If-None-Match` nếu endpoint đọc nhiều.

### 3.2. Input & output

- [ ] `[blocker]` Validate ở boundary; trim, giới hạn độ dài, kiểm tra kiểu/miền giá trị.
- [ ] `[blocker]` Từ chối field ngoài schema (mass assignment).
- [ ] `[blocker]` `limit` kẹp khoảng an toàn (ví dụ 1..50).
- [ ] `[should]` Pagination ổn định, không trùng/thiếu; thời gian ISO 8601 UTC.
- [ ] `[should]` Response chỉ chứa field cần thiết; không lộ cột nội bộ.

### 3.3. Vận hành

- [ ] `[blocker]` Authn/authz trước khi đọc/ghi; rate limit + body size limit.
- [ ] `[blocker]` Lỗi DB không trả raw message/stack.
- [ ] `[should]` Có `request_id`, metric latency/error theo route.
- [ ] `[should]` Idempotent hoặc chống tạo trùng khi client retry.

| Thao tác | Thành công | Lỗi thường gặp |
|---|---|---|
| `GET /api/messages` | `200` + danh sách | `400`, `429` |
| `POST /api/messages` | `201` + resource | `400`, `413`, `429` |
| `PUT /api/messages/:id` | `200` + resource | `400`, `404`, `409` |
| `DELETE /api/messages/:id` | `204` | `401`, `403`, `404` |

> 💡 `DELETE` nên trả `204` không body; nếu cần audit, trả `200` + `{ deleted_count }` và ghi rõ trong OpenAPI.

## 4. Database schema checklist

Tham khảo [PostgreSQL cơ bản](../postgresql-basics.md) và [nâng cao](../postgresql-advanced.md).

### 4.1. Thiết kế

- [ ] `[blocker]` Tên bảng số nhiều, `snake_case`; cột mô tả đúng đơn vị.
- [ ] `[blocker]` PK ổn định (`uuid`/`bigint`); `NOT NULL`, `CHECK`, `UNIQUE`, FK đặt ở DB.
- [ ] `[blocker]` `timestamptz` lưu UTC; có `created_at`, `updated_at`.
- [ ] `[should]` Soft delete nếu cần audit/khôi phục; nếu không, nói rõ.
- [ ] `[should]` Không lưu PII không cần; có chính sách xoá/ẩn danh.

### 4.2. Hiệu năng & migration

- [ ] `[blocker]` Index cho cột filter/sort/join thực tế (`created_at`, `guest_of`).
- [ ] `[blocker]` Migration chạy lại an toàn, có rollback; không sửa migration đã deploy.
- [ ] `[should]` Backfill theo batch, có theo dõi thời gian/khoá.
- [ ] `[should]` `EXPLAIN (ANALYZE, BUFFERS)` cho query chính trước release.
- [ ] `[should]` RLS bật nếu Supabase client truy cập trực tiếp; backup/restore đã test.

```sql
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(sender_name) between 2 and 80),
  content text not null check (char_length(content) between 1 and 500),
  will_attend boolean not null default true,
  guest_of text not null check (char_length(guest_of) between 1 and 50),
  number_attend integer not null default 1 check (number_attend between 0 and 10),
  created_at timestamptz not null default now()
);
create index if not exists messages_created_at_idx on messages (created_at desc);
```

> ⚠️ Index `created_at desc` chỉ hữu ích khi query thật sự sort theo cột này. Mỗi index làm chậm ghi.

## 5. OpenAPI checklist

[OpenAPI](./03-openapi.md) là contract thực thi, không phải tài liệu trang trí.

- [ ] `[blocker]` Mỗi operation có `operationId`, `summary`, `tags`; schema dùng `components`.
- [ ] `[blocker]` Mọi response có schema, kể cả `4xx/5xx`.
- [ ] `[blocker]` `required`, `nullable`, `format`, `minLength`, `maximum` khớp validation thật.
- [ ] `[blocker]` `security` đúng từng operation; public ghi `security: []`.
- [ ] `[blocker]` Input nhạy cảm không dùng `additionalProperties: true`.
- [ ] `[should]` Có example happy path + một lỗi validation.
- [ ] `[should]` Pagination mô tả `limit`, `before`, `next_cursor`.
- [ ] `[should]` `deprecated: true` + `Sunset` cho endpoint sắp bỏ; `servers` đúng môi trường.

```bash
bunx @redocly/cli lint openapi.yaml
bunx @stoplight/spectral-cli lint openapi.yaml --ruleset spectral.yaml
bunx openapi-diff openapi.before.yaml openapi.yaml
```

| Drift | Hậu quả | Cách chặn |
|---|---|---|
| Thiếu schema `400` | Client không xử lý lỗi | Bắt buộc schema lỗi |
| `required` khác validation | Client gửi thiếu field | Contract test |
| Đổi kiểu `created_at` | Client parse lỗi | `openapi-diff` CI |

> 💡 Nếu có thể, sinh OpenAPI từ zod/validation để tránh lệch; nếu viết tay, phải có contract test.

## 6. Security checklist

Đọc đầy đủ [Bảo mật API](../api-security.md); đây là bản rút gọn cho PR.

### 6.1. Danh tính & quyền

- [ ] `[blocker]` Mọi endpoint ghi/xoá yêu cầu auth, trừ public có chủ đích.
- [ ] `[blocker]` Authz theo resource, không chỉ theo role; token verify chữ ký/issuer/aud/expiry.
- [ ] `[blocker]` Không tin `role`, `is_admin`, `user_id` từ body/query.
- [ ] `[should]` Test BOLA: user A không sửa/xoá resource của B.
- [ ] `[should]` Audit log cho hành động admin và xoá dữ liệu.

### 6.2. Input & hạ tầng

- [ ] `[blocker]` Validate toàn bộ input; từ chối field lạ; giới hạn body/mảng/chuỗi.
- [ ] `[blocker]` Rate limit theo IP/user/route; trả `429` + `Retry-After`.
- [ ] `[blocker]` Không trả stack trace, SQL error, tên bảng hoặc internal id.
- [ ] `[blocker]` CORS không dùng `*` với credentials; secret không nằm trong repo/log.
- [ ] `[blocker]` WebSocket kiểm tra `Origin`, token và giới hạn message size.
- [ ] `[should]` Security headers (`HSTS`, `X-Content-Type-Options`, `Referrer-Policy`).
- [ ] `[should]` `bun audit`/Trivy + secret scan trong CI; log đã redaction.

| OWASP API | Câu hỏi nhanh |
|---|---|
| API1 BOLA | Resource id có kiểm tra quyền sở hữu? |
| API2 Broken Auth | Token hết hạn/sai chữ ký có bị từ chối? |
| API3 Property-level | Field nhạy cảm có bị bỏ qua? |
| API4 Resource consumption | Body/limit/rate có bị giới hạn? |
| API5 Function-level | Guest có gọi được endpoint admin? |
| API6 Business flow | Spam/RSVP hàng loạt có bị chặn? |

> ⚠️ Hiện `DELETE /api/messages` xoá toàn bộ bảng mà không có auth. Đây là **blocker** trước production.

## 7. Production readiness checklist

Chỉ deploy khi tech lead và on-call review xong.

### 7.1. Quan sát & độ tin cậy

- [ ] `[blocker]` Dashboard RED/USE + business metric; log JSON có `request_id`.
- [ ] `[blocker]` Trace cho luồng chính (HTTP → DB → broadcast); alert theo SLO có runbook.
- [ ] `[blocker]` SLO/SLI/error budget đã thống nhất; có deploy marker.
- [ ] `[blocker]` Timeout, retry/backoff, circuit breaker, rate limit đã cấu hình.
- [ ] `[should]` Log retention + chính sách PII; on-call biết endpoint mới.

### 7.2. Dữ liệu & rollback

- [ ] `[blocker]` Rollback ≤ 10 phút và đã diễn tập.
- [ ] `[blocker]` Migration chạy được trên bản sao production; backup restore thành công.
- [ ] `[blocker]` Capacity đủ 2× lưu lượng ngày cưới.
- [ ] `[should]` Feature flag có owner, ngày hết hạn, cách tắt; status page sẵn sàng.

| Kết luận | Điều kiện |
|---|---|
| **Go** | Không còn blocker; should có owner + ngày |
| **Go có điều kiện** | Blocker có mitigation tạm, rủi ro được chấp nhận bằng văn bản |
| **No-go** | Còn blocker về auth, dữ liệu, rollback hoặc alert |

> 💡 Lần deploy đầu nên dark launch 24–48h, theo dõi rồi mới công bố.

## 8. PR checklist

Dán vào PR description; reviewer không approve nếu thiếu blocker.

- [ ] `[blocker]` PR nhỏ, một mục đích; không trộn refactor với feature.
- [ ] `[blocker]` Mô tả problem, cách giải, ảnh hưởng API/migration.
- [ ] `[blocker]` Test happy path + lỗi + boundary; CI xanh.
- [ ] `[blocker]` OpenAPI/README/changelog cập nhật nếu contract đổi.
- [ ] `[blocker]` Không commit secret, file build, log hoặc dữ liệu thật.
- [ ] `[blocker]` Migration có rollback và đã chạy thử; thay đổi bảo mật đã review.
- [ ] `[should]` Có metric/log/trace; có hướng dẫn test thủ công.
- [ ] `[should]` Không làm tăng đáng kể bundle size/thời gian CI.
- [ ] `[should]` Commit message rõ ràng, không `fix`/`update`/`wip`.

Giữ PR < 200 dòng nếu có thể; PR > 1.000 dòng phải tách hoặc có tech lead duyệt.

```bash
bun run typecheck && bun test && bunx @redocly/cli lint openapi.yaml
```

## 9. Definition of Done

**Done** nghĩa là đã chạy thật, được quan sát và có thể rollback — không chỉ merged.

- [ ] `[blocker]` Acceptance criteria được kiểm chứng bằng test/demo.
- [ ] `[blocker]` OpenAPI khớp implementation; breaking change có kế hoạch.
- [ ] `[blocker]` Error catalog/message cập nhật; client biết thay đổi.
- [ ] `[blocker]` Unit/integration critical path pass; security checklist đã ký.
- [ ] `[blocker]` Dashboard/alert/runbook có link; rollback đã mô tả và thử.
- [ ] `[blocker]` Migration/backfill xong hoặc có kế hoạch theo dõi.
- [ ] `[should]` Coverage diff không giảm; mutation score đạt ngưỡng.
- [ ] `[should]` Đã test staging với dữ liệu giống production.
- [ ] `[should]` README/changelog/ADR cập nhật; feature flag tắt sau ổn định.
- [ ] `[should]` Không còn TODO; issue còn lại có owner.

| Bằng chứng | Ví dụ |
|---|---|
| Test | Link CI + tên test |
| Contract | `openapi-diff` không breaking |
| Bảo mật | Security review comment |
| Vận hành | Dashboard + alert + runbook link |
| Rollback | Lệnh/PR revert đã thử |

## 10. RFC template

Copy vào issue/PR có label `rfc`; điền ngắn gọn nhưng không bỏ mục quan trọng.

```markdown
# RFC: <tên thay đổi>
- **Tác giả:** <tên> · **Ngày:** <YYYY-MM-DD> · **Trạng thái:** Draft | Review | Accepted | Rejected
- **Reviewer:** <tên> · **Deadline:** <YYYY-MM-DD> · **Liên quan:** <issue/PR>
## 1. Tóm tắt
<!-- 3–5 câu: thay đổi gì, cho ai, vì sao bây giờ. -->
## 2. Vấn đề & mục tiêu
<!-- Hành vi hiện tại, metric chứng minh, goal/non-goal. -->
## 3. Giải pháp & API
<!-- Luồng chính, method/path/status, schema, sequence diagram nếu cần. -->
| Method | Path | Thay đổi | Breaking? |
|---|---|---|---|
| <!-- GET --> | <!-- /api/... --> | <!-- ... --> | <!-- Có/Không --> |
## 4. Dữ liệu, bảo mật, rollout
<!-- Migration/backfill/rollback; authn/authz/PII; feature flag/thứ tự deploy. -->
## 5. Phương án thay thế
<!-- Ít nhất một phương án + lý do không chọn. -->
## 6. Rủi ro
| Rủi ro | Xác suất | Ảnh hưởng | Mitigation |
|---|---|---|---|
| <!-- ... --> | <!-- ... --> | <!-- ... --> | <!-- ... --> |
## 7. Câu hỏi mở & quyết định
- [ ] <!-- Câu hỏi cần trả lời. -->
<!-- Approved/Rejected, ngày, người quyết định, điều kiện. -->
```

> ⚠️ RFC không nêu trade-off và rollback thì chưa sẵn sàng review.

## 11. Design review meeting template

| Thời lượng | Nội dung | Người phụ trách |
|---:|---|---|
| 3 phút | Mục tiêu, agenda, ground rules | Facilitator |
| 7 phút | Problem + proposal | Tác giả |
| 15 phút | Contract, dữ liệu, bảo mật | Reviewers |
| 10 phút | Trade-off, phương án thay thế | Cả nhóm |
| 5 phút | Quyết định + action items | Facilitator |

```markdown
# Biên bản design review — <tên>
- **Ngày:** <YYYY-MM-DD> · **Chủ trì:** <tên> · **Thư ký:** <tên>
- **Tham dự:** <danh sách> · **Vắng:** <danh sách> · **Tài liệu:** <link RFC/PR>
## Bối cảnh
<!-- 2–3 câu tóm tắt vấn đề và phạm vi. -->
## Quyết định
- **Kết luận:** Approve | Approve with conditions | Reject
- **Lý do:** <!-- ... -->
## Action items
| # | Hành động | Owner | Deadline | Trạng thái |
|---:|---|---|---|---|
| 1 | <!-- ... --> | <!-- ... --> | <!-- ... --> | Open |
## Câu hỏi mở
- <!-- ... -->
## Ảnh hưởng đã thống nhất
- API/Dữ liệu/Bảo mật/Vận hành: <!-- ... -->
```

> 💡 Gửi agenda + RFC trước 24h; ghi **ai làm gì, khi nào**, không ghi lại toàn bộ cuộc họp.

## 12. Deprecation notice template

| Mốc | Thời gian tối thiểu | Việc phải làm |
|---|---|---|
| Thông báo | T-90 ngày | Email, changelog, header, docs |
| Cảnh báo | T-30 ngày | Log cảnh báo cho client còn gọi |
| Chặn mềm | T-7 ngày | Trả `410`/redirect nếu có |
| Tắt | T-0 | Xoá route/schema, cập nhật OpenAPI |

```http
Deprecation: Sun, 25 Oct 2026 00:00:00 GMT
Sunset: Sun, 24 Jan 2027 00:00:00 GMT
Link: <https://docs.example.com/deprecations/messages-v1>; rel="deprecation"
```

```markdown
# Deprecation: <tên endpoint/tính năng>
- **Endpoint bị bỏ:** `<METHOD> <path>` · **Ngày tắt:** <YYYY-MM-DD>
- **Thay thế:** `<METHOD> <path mới>` — <link docs>
- **Lý do:** <!-- ... -->
## Ảnh hưởng
<!-- Ai bị ảnh hưởng, client nào, ước lượng request/ngày. -->
## Việc cần làm
- [ ] Đổi sang endpoint mới trước <YYYY-MM-DD>.
- [ ] Kiểm tra header `Deprecation`/`Sunset`; liên hệ <email> nếu cần hỗ trợ.
## Timeline
| Ngày | Sự kiện |
|---|---|
| <YYYY-MM-DD> | Bắt đầu trả header cảnh báo |
| <YYYY-MM-DD> | Log cảnh báo cho request còn dùng |
| <YYYY-MM-DD> | Tắt endpoint, trả `410 Gone` |
<!-- Ghi chú nội bộ: owner, ticket, kế hoạch liên hệ client. -->
```

> ⚠️ Không tắt khi chưa có dữ liệu chứng minh không còn traffic; kiểm tra log theo `client_id`/`User-Agent`.

## 13. Changelog template

Theo [Keep a Changelog](https://keepachangelog.com/), viết cho người dùng API, không phải nhật ký commit.

```markdown
# Changelog
## [Unreleased]
### Added
- <!-- Tính năng/endpoint mới. -->
### Changed
- <!-- Thay đổi hành vi, hiệu năng, giới hạn. -->
### Deprecated
- <!-- Sắp bỏ, kèm mốc thời gian và thay thế. -->
### Removed
- <!-- Đã bỏ. -->
### Fixed
- <!-- Sửa lỗi ảnh hưởng client. -->
### Security
- <!-- Vá bảo mật; không tiết lộ chi tiết khai thác. -->
## [1.2.0] - 2026-10-25
### Added
- `POST /api/messages` trả `201` kèm `Location`.
- Hỗ trợ `limit` tối đa 50 cho `GET /api/messages`.
### Changed
- `GET /api/messages` mặc định trả 20 bản ghi thay vì 50.
### Fixed
- `before` sai định dạng trả `400` thay vì `500`.
### Security
- Bắt buộc admin auth cho `DELETE /api/messages`.
```

| Quy tắc | Lý do |
|---|---|
| Nêu hành vi client thấy được | Người đọc không cần đọc code |
| Breaking ghi rõ `BREAKING` + migration | Tránh client vỡ im lặng |
| Link PR/issue khi cần | Truy vết nhanh |
| Không đưa chi tiết khai thác bảo mật | Tránh tiếp tay kẻ tấn công |

## 14. Error catalog template

Error catalog là nguồn chung cho backend, client, docs và test. Mã lỗi phải **ổn định**;
message có thể đổi, mã thì không.

- Mã dạng `DOMAIN_REASON` (`MESSAGE_NOT_FOUND`, `VALIDATION_FAILED`); không dùng `ERROR`/`FAILED`.
- HTTP status biểu diễn loại lỗi; `retryable` và `action` nói client nên làm gì.
- Client switch theo `error.code`, không theo `error.message`.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ",
    "request_id": "7f9c2d1e",
    "issues": [{ "path": "content", "message": "Không được để trống" }]
  }
}
```

| Code | HTTP | Khi nào | Retryable | Client action |
|---|---:|---|:---:|---|
| `VALIDATION_FAILED` | 400 | Input sai schema/miền giá trị | Không | Sửa request |
| `INVALID_CURSOR` | 400 | `before` sai định dạng | Không | Bỏ cursor, tải lại |
| `UNAUTHORIZED` | 401 | Thiếu/sai/hết hạn token | Không | Đăng nhập lại |
| `FORBIDDEN` | 403 | Không đủ quyền | Không | Liên hệ admin |
| `MESSAGE_NOT_FOUND` | 404 | Id không tồn tại | Không | Kiểm tra id |
| `MESSAGE_CONFLICT` | 409 | Xung đột dữ liệu/idempotency | Có thể | Tải lại resource |
| `PAYLOAD_TOO_LARGE` | 413 | Body vượt giới hạn | Không | Giảm kích thước |
| `RATE_LIMITED` | 429 | Vượt quota | Có | Backoff theo `Retry-After` |
| `INTERNAL_ERROR` | 500 | Lỗi không lường trước | Có | Retry có giới hạn |
| `SERVICE_UNAVAILABLE` | 503 | Bảo trì/quá tải | Có | Backoff + thông báo |

```markdown
### <ERROR_CODE>
- **HTTP:** <status> · **Retryable:** Có/Không · **Retry-After:** <nếu có>
- **Khi nào:** <điều kiện chính xác> · **Client action:** <làm gì tiếp>
- **Message:** <tiếng Việt, không lộ chi tiết nội bộ>
- **Test:** <link test case> · **request_id mẫu:** <id/log link>
```

## 15. OpenAPI skeleton

Khung dưới đây đủ để bắt đầu; thay example/schema theo implementation thật.

```yaml
openapi: 3.1.0
info: { title: Wedding Guestbook API, version: 1.2.0 }
servers:
  - { url: https://api.example.com, description: Production }
  - { url: https://staging-api.example.com, description: Staging }
tags: [{ name: Messages, description: Guestbook messages }]
paths:
  /api/messages:
    get:
      operationId: listMessages
      tags: [Messages]
      summary: Lấy danh sách lời chúc
      parameters:
        - { name: before, in: query, schema: { type: string, format: date-time } }
        - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 50, default: 20 } }
      responses:
        "200": { description: Thành công, content: { application/json: { schema: { $ref: "#/components/schemas/MessageList" } } } }
        "400": { $ref: "#/components/responses/Error" }
        "429": { $ref: "#/components/responses/Error" }
    post:
      operationId: createMessage
      tags: [Messages]
      summary: Gửi lời chúc mới
      security: []
      requestBody: { required: true, content: { application/json: { schema: { $ref: "#/components/schemas/CreateMessage" } } } }
      responses:
        "201": { description: Đã tạo, content: { application/json: { schema: { $ref: "#/components/schemas/Message" } } } }
        "400": { $ref: "#/components/responses/Error" }
        "413": { $ref: "#/components/responses/Error" }
        "429": { $ref: "#/components/responses/Error" }
  # Thêm /api/messages/{id} với PUT/DELETE; DELETE cần bearerAuth và trả 204.
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    CreateMessage:
      type: object
      additionalProperties: false
      required: [sender_name, content, will_attend, guest_of, number_attend]
      properties:
        sender_name: { type: string, minLength: 2, maxLength: 80 }
        content: { type: string, minLength: 1, maxLength: 500 }
        will_attend: { type: boolean }
        guest_of: { type: string, minLength: 1, maxLength: 50 }
        number_attend: { type: integer, minimum: 0, maximum: 10 }
    Message:
      allOf:
        - { $ref: "#/components/schemas/CreateMessage" }
        - { type: object, required: [id, created_at], properties: { id: { type: string, format: uuid }, created_at: { type: string, format: date-time } } }
    MessageList:
      type: object
      required: [success, data]
      properties:
        success: { type: boolean, const: true }
        data: { type: array, items: { $ref: "#/components/schemas/Message" } }
        next_cursor: { type: [string, "null"], format: date-time }
    Error:
      type: object
      required: [success, error]
      properties:
        success: { type: boolean, const: false }
        error:
          type: object
          required: [code, message, request_id]
          properties:
            code: { type: string }
            message: { type: string }
            request_id: { type: string }
            issues: { type: array, items: { type: object, properties: { path: { type: string }, message: { type: string } } } }
  responses:
    Error:
      description: Lỗi
      content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } }
```

> ⚠️ Skeleton cố ý không có `DELETE /api/messages` (xoá toàn bộ). Nếu cần, phải thêm `security`, audit và mô tả rủi ro.

## 16. Test plan template

```markdown
# Test plan — <feature/release>
- **Owner:** <tên> · **Release:** <version/commit> · **Môi trường:** staging
- **Liên quan:** <RFC/PR> · **Trong phạm vi:** <!-- endpoint/luồng --> · **Ngoài phạm vi:** <!-- ... -->
## 1. Rủi ro & chiến lược
| Rủi ro | I | L | Điểm | Tầng test |
|---|---:|---:|---:|---|
| <!-- ... --> | <!-- 1-5 --> | <!-- 1-5 --> | <!-- --> | <!-- unit/integration/e2e --> |
| Tầng | Công cụ | Phạm vi | Khi chạy |
|---|---|---|---|
| Unit | `bun:test` | Domain/validation | Mỗi PR |
| Integration | `bun:test` + Supabase local | Route + DB | Mỗi PR |
| Contract | Ajv/Schemathesis | OpenAPI ↔ response | Mỗi PR |
| E2E | Playwright/Bun | Luồng người dùng | Trước release |
| Load/security | k6, ZAP | Capacity, authz/input | Trước release lớn |
## 2. Test case chính
| # | Given | When | Then | Ưu tiên |
|---:|---|---|---|---|
| 1 | <!-- ... --> | <!-- ... --> | <!-- ... --> | P1 |
## 3. Dữ liệu & môi trường
- Seed: <!-- số row/script --> · Tài khoản: <!-- role/token -->
- Biến môi trường: <!-- ... -->
## 4. Điều kiện dừng
- [ ] Tất cả P1 pass; không còn blocker; không có 5xx ngoài dự kiến.
- [ ] p95/error rate đạt ngưỡng; security checklist được ký; rollback đã thử.
```

> 💡 Test plan chứng minh **rủi ro nào được kiểm soát bằng tầng nào**; chi tiết thực thi nằm trong code.

## 17. Runbook template

```markdown
# Runbook — <service/endpoint>
- **Owner:** <team> · **On-call:** <kênh/number> · **Cập nhật:** <YYYY-MM-DD>
- **Dashboard:** <link> · **Logs:** <link> · **Traces:** <link> · **Repo:** <link>
- **SLO:** <!-- 99.9% availability / 30 ngày --> · **Traffic:** <!-- RPS -->
## 1. Tổng quan & dependency
<!-- Service làm gì, dependency chính (Supabase, WebSocket), lỗi thường gặp. -->
## 2. Alert & triệu chứng
| Alert | Triệu chứng | Severity | Hành động đầu tiên |
|---|---|---|---|
| <!-- HighErrorRate --> | <!-- 5xx > 1% --> | P1 | <!-- kiểm tra deploy --> |
| <!-- HighLatency --> | <!-- p95 > 1s --> | P2 | <!-- kiểm tra DB --> |
## 3. Triage
1. Xác định phạm vi: tất cả user hay một route?
2. Kiểm tra deploy gần nhất; xem RPS, error rate, p95, saturation.
3. Lấy `request_id` từ log, mở trace; kiểm tra Supabase/pool/rate limit.
## 4. Mitigation & xác minh
- Rollback: `<!-- lệnh/PR -->` · Tắt flag: `<!-- tên flag -->` · Chặn endpoint: `<!-- ... -->`
- [ ] Error rate về baseline trong 10 phút; p95 về ngưỡng SLO.
- [ ] Không còn alert mới; log/trace không còn lỗi bất thường.
## 5. Escalation & sau sự cố
| Mức | Liên hệ | Khi nào |
|---|---|---|
| L1 | On-call | Mọi alert |
| L2 | Tech lead | Quá 15 phút chưa giảm |
| L3 | Vendor/DB owner | Nghi ngờ hạ tầng |
- [ ] Postmortem nếu ảnh hưởng > 5 phút hoặc mất dữ liệu.
- [ ] Cập nhật runbook/alert; thêm test tái hiện.
```

> ⚠️ Runbook phải được diễn tập; runbook chưa từng chạy thường chứa lệnh sai hoặc thiếu quyền.

## 18. Postmortem template

```markdown
# Postmortem — <sự cố>
- **Ngày xảy ra:** <YYYY-MM-DD HH:mm> · **Thời lượng:** <phút>
- **Severity:** P1/P2/P3 · **Author:** <tên> · **Trạng thái:** Draft | Reviewed | Closed
## 1. Tóm tắt & ảnh hưởng
<!-- 3–5 câu: chuyện gì xảy ra, ai bị ảnh hưởng, đã xử lý thế nào. -->
- Người dùng/chức năng: <!-- số user/endpoint --> · Dữ liệu: <!-- mất/sai/không -->
- SLO: <!-- budget đã dùng -->
## 2. Timeline (UTC)
| Thời điểm | Sự kiện |
|---|---|
| HH:mm | <!-- deploy/alert --> |
| HH:mm | <!-- phát hiện --> |
| HH:mm | <!-- mitigation --> |
| HH:mm | <!-- resolved --> |
## 3. Nguyên nhân gốc & bài học
<!-- Chuỗi nguyên nhân, không chỉ "lỗi code"; dùng 5 Whys nếu hữu ích. -->
## 4. Action items
| # | Hành động | Owner | Deadline | Loại |
|---:|---|---|---|---|
| 1 | <!-- ... --> | <!-- ... --> | <!-- ... --> | Prevent/Detect/Mitigate |
**Blameless:** mô tả hệ thống và quyết định, không quy kết cá nhân. Action item phải có owner,
deadline và được theo dõi trong backlog.
```

## 19. API scorecard

Chấm mỗi chiều 1–5, nhân trọng số, cộng lại. Dùng hàng quý hoặc trước release lớn.

| Chiều | Trọng số | 1 điểm | 3 điểm | 5 điểm |
|---|---:|---|---|---|
| Contract & OpenAPI | 15% | Không có spec | Spec lệch | Spec là nguồn sự thật + contract test |
| Nhất quán REST | 10% | Tuỳ ý | Có quy ước nhưng lệch | Quy ước + lint tự động |
| Validation & lỗi | 15% | 500/raw error | Validate cơ bản | Catalog lỗi + test boundary |
| Bảo mật | 20% | Thiếu auth/rate limit | Auth cơ bản | Authz resource + audit + test |
| Test | 15% | Chỉ happy path | Unit/integration | Pyramid + contract + e2e critical |
| Observability | 10% | Log rời rạc | Có metric/log | RED/USE + trace + SLO alert |
| Hiệu năng | 5% | Chưa đo | Có benchmark | Load test + index review |
| Tài liệu & lifecycle | 10% | Không có | README cơ bản | Runbook + changelog + deprecation |

```text
Điểm = Σ (điểm chiều × trọng số)
≥ 4.5: Exemplary  3.5–4.4: Healthy  2.5–3.4: At risk  < 2.5: Critical
```

> 💡 Scorecard dùng để **ưu tiên cải thiện**, không xếp hạng cá nhân. Điểm thấp phải có hành động + ngày.

## 20. PR/CI & cách dùng template

| Artifact | Nơi lưu | Ai kiểm tra | Khi nào |
|---|---|---|---|
| PR checklist | `.github/pull_request_template.md` | Tác giả + reviewer | Mỗi PR |
| Design review | Issue template `design-review.md` | Facilitator | Trước khi code |
| RFC | `docs/rfcs/NNNN-title.md` | Reviewer | Thay đổi lớn |
| Runbook | `docs/runbooks/<service>.md` | On-call | Trước khi bật alert |
| Postmortem | `docs/postmortems/YYYY-MM-DD.md` | Tech lead | Sau sự cố |

```markdown
## Problem
<!-- Vấn đề và phạm vi. -->
## Solution
<!-- Cách giải, trade-off. -->
## API & dữ liệu
- [ ] OpenAPI đã cập nhật (nếu contract đổi)
- [ ] Migration có rollback (nếu schema đổi)
- [ ] Breaking change? Có/Không — nếu Có, link deprecation notice
## Kiểm chứng
- [ ] `bun run typecheck && bun test`
- [ ] Contract lint/diff; đã test staging
- [ ] Có metric/log/trace cho hành vi mới
## Rủi ro & rollback
<!-- Rủi ro chính, cách rollback, người theo dõi sau deploy. -->
```

| Check | Required | Fail thì |
|---|:---:|---|
| Typecheck + unit | Có | Không merge |
| Integration/contract | Có | Không merge |
| OpenAPI lint/diff | Có | Không merge nếu breaking chưa duyệt |
| Security scan | Có | Không merge nếu HIGH/CRITICAL |
| Load smoke | Không | Ticket nếu vượt ngưỡng |

**Quy trình 6 bước:** chọn artifact đúng → điền trước khi họp/code → review blocker trước →
ghi bằng chứng (CI/dashboard/test) → action item `[should]` có owner + ngày → rà soát định kỳ.

> ⚠️ Đừng biến checklist thành "click cho xanh". Reviewer phải kiểm tra bằng chứng, nếu không
> checklist chỉ tạo cảm giác an toàn giả. CI/CD chi tiết xem [06](./06-testing-observability.md#10-cicd-pipeline).

## 21. Anti-patterns & bài tập

| Anti-pattern | Vì sao xấu | Thay bằng |
|---|---|---|
| Checklist 100 mục | Không ai đọc, bỏ qua blocker | 10–20 mục, có mức độ |
| Tick mà không có evidence | An toàn giả | Link test/log/dashboard |
| Copy template nguyên xi | Mục không liên quan gây nhiễu | Xoá mục không áp dụng, ghi lý do |
| Review sau khi code xong | Sửa contract đắt | Design review trước |
| Không có owner cho action item | Không bao giờ xong | Owner + deadline |
| Runbook viết một lần | Lỗi thời, lệnh sai | Review mỗi quý + diễn tập |
| Postmortem quy kết cá nhân | Giấu lỗi, không học được | Blameless + hệ thống |
| Deprecation không đo traffic | Tắt nhầm client còn dùng | Log + dashboard theo client |
| Error code thay đổi liên tục | Client switch-case vỡ | Mã ổn định, thêm mã mới |

### Bài tập

1. **Design review**: viết checklist 12 mục cho `POST /api/messages`, gắn mức độ + evidence.
2. **REST audit**: chấm 5 endpoint theo mục 3; tìm 3 vi phạm và đề xuất sửa.
3. **Schema**: thêm `CHECK`/index cho `messages`; viết migration + rollback, chạy `EXPLAIN`.
4. **OpenAPI**: bổ sung `400/413/429`, chạy Redocly lint và sửa cảnh báo.
5. **Security**: lập authz matrix cho `DELETE /api/messages`; viết test anonymous/guest/admin.
6. **Runbook & postmortem**: diễn tập alert `HighErrorRate`, ghi timeline + 3 action item.
7. **Scorecard**: chấm API hiện tại, chọn 2 chiều thấp nhất, lập kế hoạch 30 ngày.

## 22. Tài liệu tham khảo

- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0) · [OpenAPI Guide](https://swagger.io/docs/specification/about/)
- [Redocly CLI](https://redocly.com/docs/cli/) · [Spectral](https://stoplight.io/open-source/spectral) · [openapi-diff](https://github.com/OpenAPITools/openapi-diff)
- [Keep a Changelog](https://keepachangelog.com/) · [Semantic Versioning](https://semver.org/)
- [RFC 8594 — Sunset HTTP Header](https://www.rfc-editor.org/rfc/rfc8594) · [RFC 2119 — Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119)
- [Google SRE Workbook — Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) · [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x00-header/)
- [Bun test runner](https://bun.sh/docs/cli/test) · [Hono testing](https://hono.dev/docs/guides/testing)
- [Supabase local development](https://supabase.com/docs/guides/local-development) · [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Architecture Decision Records](https://adr.github.io/) · [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Bảo mật API](../api-security.md) · [Testing & Observability](./06-testing-observability.md) · [WebSocket](../websocket.md)
