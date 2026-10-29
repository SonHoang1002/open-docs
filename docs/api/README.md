# Bộ tài liệu thiết kế API — Lộ trình từ nền tảng đến thực chiến

> Hub của bộ tài liệu về thiết kế API cho dự án `wedding-server` (Bun + Hono + Supabase).
> Mục tiêu: biến việc "viết cho chạy được" thành "thiết kế để người khác dùng được, mở rộng
> được và không phải viết lại sau 6 tháng". Bảo mật có tài liệu riêng ở
> [`../api-security.md`](../api-security.md) — bộ này **không lặp lại** nội dung OWASP.

---

## Mục lục

1. [Bộ tài liệu này giải quyết vấn đề gì](#1-bộ-tài-liệu-này-giải-quyết-vấn-đề-gì)
2. [Đối tượng độc giả](#2-đối-tượng-độc-giả)
3. [Cách dùng bộ tài liệu](#3-cách-dùng-bộ-tài-liệu)
4. [Bản đồ tài liệu](#4-bản-đồ-tài-liệu)
5. [Lộ trình 4 tuần](#5-lộ-trình-4-tuần)
6. [Lộ trình cho team đang làm dự án](#6-lộ-trình-cho-team-đang-làm-dự-án)
7. [Quy ước trong bộ tài liệu](#7-quy-ước-trong-bộ-tài-liệu)
8. [Quick start — 5 bước thiết kế một API mới](#8-quick-start--5-bước-thiết-kế-một-api-mới)
9. [Definition of Done cho một API](#9-definition-of-done-cho-một-api)
10. [Bảng tra cứu tình huống](#10-bảng-tra-cứu-tình-huống)
11. [Đóng góp và cập nhật tài liệu](#11-đóng-góp-và-cập-nhật-tài-liệu)
12. [Tài liệu tham khảo](#12-tài-liệu-tham-khảo)

---

## 1. Bộ tài liệu này giải quyết vấn đề gì?

Hầu hết API "chạy được" đều mắc cùng một nhóm lỗi:

| Triệu chứng | Nguyên nhân gốc | Hậu quả |
|---|---|---|
| Frontend phải đoán field nào optional | Không có contract rõ ràng | Sửa backend làm vỡ client |
| `POST` tạo trùng khi mạng chập chờn | Không có idempotency | Dữ liệu rác, khó đối soát |
| `PUT` ghi đè thay đổi của người khác | Không có optimistic locking | Mất dữ liệu âm thầm |
| Phân trang `offset` ngày càng chậm | Không hiểu keyset pagination | UX tệ khi dữ liệu lớn |
| Mỗi endpoint trả lỗi một kiểu | Không có error catalog | Client không xử lý được |
| `v2` ra đời bằng cách fork code | Không có chiến lược compatibility | Bảo trì hai bản mãi mãi |

Bộ tài liệu cung cấp **quy trình và tiêu chí quyết định** để tránh các lỗi trên, dùng chính
`wedding-server` làm ví dụ xuyên suốt: `messages`, RSVP, WebSocket `/ws`. Tài liệu **không**
hứa repo đã làm đúng mọi thứ; chỗ còn thiếu được ghi rõ là "thiết kế mục tiêu" hoặc
"ví dụ mở rộng", kèm đường nâng cấp.

---

## 2. Đối tượng độc giả

| Vai trò | Đọc trước | Mục tiêu |
|---|---|---|
| Người mới học backend | `01-fundamentals.md` | Hiểu API là contract, không phải "hàm từ xa" |
| Backend engineer vào dự án | `01` → `02` → `../api-security.md` | Thiết kế endpoint đúng từ đầu |
| Frontend / mobile engineer | `01` mục 9, 10, 12; `02` mục 3–9, 17 | Đọc contract, xử lý lỗi, phân trang đúng |
| Tech lead / reviewer | `02` mục 1, 21, 22; README mục 9 | Checklist review thống nhất |
| Người viết tài liệu API | README mục 7, 11; `02` mục 18 | Spec không mâu thuẫn với code |

Không yêu cầu biết trước GraphQL/gRPC. Kiến thức SQL cơ bản là đủ; phần Supabase trong `02`
chỉ dùng query builder cơ bản.

---

## 3. Cách dùng bộ tài liệu

1. **Học từ đầu** → theo lộ trình mục 5.
2. **Đang làm việc** → tra bảng mục 10.
3. **Review PR thêm endpoint** → mục 9 + `02` mục 22.
4. **Tranh luận "REST hay GraphQL"** → `01` mục 3.
5. Không cần đọc tuần tự: mỗi mục đứng độc lập, có link chéo thay vì lặp lại.

💡 Mỗi khi tài liệu nói "nên", hãy hỏi **"nên trong bối cảnh nào?"**. Thiết kế API là bài
toán đánh đổi, không phải bảng luật.

---

## 4. Bản đồ tài liệu

### 4.1 Chuỗi chính

| # | Tài liệu | Nội dung cốt lõi | Trạng thái |
|---|---|---|---|
| 01 | [`01-fundamentals.md`](./01-fundamentals.md) | Contract, kiến trúc phân tán, phân loại API, HTTP, idempotency, REST, resource modeling, versioning, lỗi, caching | ✅ Có sẵn |
| 02 | [`02-rest-design.md`](./02-rest-design.md) | 10 bước thiết kế, naming, method/status, PATCH, header, query, pagination, error catalog, validation, idempotency, locking, upload, cache, rate limit, webhook, case study | ✅ Có sẵn |
| 03 | [`03-openapi.md`](./03-openapi.md) | OpenAPI 3.1, contract-first, JSON Schema, security scheme, codegen, contract testing | ✅ Có sẵn |
| 04 | [`04-lifecycle-process.md`](./04-lifecycle-process.md) | Vòng đời API: đề xuất, review, release, versioning, deprecation, vận hành | ✅ Có sẵn |
| 05 | [`05-project-structure.md`](./05-project-structure.md) | Cấu trúc dự án, layer, module, cấu hình, error handling, testing | ✅ Có sẵn |
| 06 | [`06-testing-observability.md`](./06-testing-observability.md) | Test theo rủi ro, integration/e2e, đo tải, logging, metrics, tracing | ✅ Có sẵn |
| 07 | [`07-checklists-templates.md`](./07-checklists-templates.md) | Checklist review, template spec/PR/runbook, quy trình bàn giao | ✅ Có sẵn |

> 📄 Spec mẫu trong `03` cũng được trích thành file dùng ngay:
> [`openapi.yaml`](./openapi.yaml). Có thể mở bằng Swagger UI/Redoc hoặc dùng để sinh client.

### 4.2 Tài liệu chuyên đề đã có

| Tài liệu | Khi nào đọc | Ghi chú |
|---|---|---|
| [`../api-security.md`](../api-security.md) | Trước khi đưa endpoint ra public | Nguồn duy nhất về authN/authZ, OWASP, rate limit, secret |
| [`../websocket.md`](../websocket.md) | Khi thiết kế realtime `/ws` | Handshake, frame, pub/sub, reconnect |
| [`../postgresql-basics.md`](../postgresql-basics.md) | Khi viết query cho endpoint | Index, NULL, transaction |
| [`../postgresql-advanced.md`](../postgresql-advanced.md) | Khi query chậm hoặc cần khóa | Execution plan, MVCC, RLS, partition |

Phân tách trách nhiệm: `01` trả lời **"vì sao"**, `02` trả lời **"làm thế nào"**,
`api-security.md` trả lời **"chống ai"**. Khi chồng lấn, `02` chỉ nêu quyết định và link.

---

## 5. Lộ trình 4 tuần

Giả định 6–8 giờ/tuần. Mục tiêu cuối tuần 4: tự thiết kế và bảo vệ được API CRUD có phân
trang, lỗi chuẩn, versioning và realtime event.

| Tuần | Nội dung | Sản phẩm |
|---|---|---|
| **1 — Nền tảng** | `01` mục 1–4 (contract, kiến trúc, phân loại, HTTP); mục 5–8 (idempotency, URI, REST, resource); mục 9–12 (envelope, pagination, versioning, lỗi) | Một trang mô tả resource + endpoint dự kiến, chưa code |
| **2 — REST thực hành** | `02` mục 1–5 (quy trình, naming, method, PATCH, status); mục 6–10 (header, query, pagination, lỗi, validation); mục 11–12 (idempotency, locking) | Spec endpoint có request/response/error/pagination |
| **3 — Bảo mật & vận hành** | `api-security.md` mục 1–12; `02` mục 13–18 (upload, quyền, cache, rate limit, versioning, webhook); `websocket.md` mục 8–15 | Danh sách rủi ro đã giảm thiểu + test case bảo mật |
| **4 — Hoàn chỉnh** | `02` mục 19–22 (case study, test matrix, anti-pattern, checklist); `postgresql-basics.md` mục 9; `postgresql-advanced.md` mục 2, 5 | Spec guestbook + test matrix + ghi chú trade-off |

Mẹo: cuối mỗi tuần, viết lại 5 điều học được bằng lời của bạn. Nếu không viết được, bạn chưa
thực sự hiểu — đọc lại mục tương ứng.

---

## 6. Lộ trình cho team đang làm dự án

Team không có 4 tuần? Vá dần theo mức độ rủi ro. Thứ tự ưu tiên thay đổi **rẻ nhưng giảm đau
nhiều**:

| Sprint | Việc làm | Tài liệu | Tiêu chí xong |
|---|---|---|---|
| 0 | Chốt naming, error format, envelope | `02` mục 2, 9; README mục 7 | Có style guide 1 trang trong repo |
| 1 | Chuẩn hóa status code + error catalog | `02` mục 3, 5, 9 | Không còn `200` kèm `success:false` |
| 2 | Sửa cursor `before` có tiebreaker | `02` mục 8 | Không mất/trùng bản ghi cùng timestamp |
| 3 | Thêm validation schema, giới hạn body | `02` mục 10 | Mọi input qua schema, có test case xấu |
| 4 | `Idempotency-Key` cho `POST` | `02` mục 11 | Gửi lại 3 lần chỉ tạo 1 bản ghi |
| 5 | `ETag`/`If-Match` cho update | `02` mục 12 | Sửa đồng thời → một client nhận `412` |
| 6 | Versioning + deprecation policy | `02` mục 17 | Có `/api/v1`, có header `Sunset` |
| 7 | Realtime contract + reconnect | `websocket.md` mục 11, 14 | Client không mất event khi reconnect ngắn |
| 8 | Rate limit + quan sát | `api-security.md` mục 7; `02` mục 16 | Có `429`, `Retry-After`, log có request id |

**Nguyên tắc:** không "đập đi xây lại" API đang chạy. Mỗi sprint chỉ đổi một chiều contract,
giữ tương thích ngược, ghi CHANGELOG.

⚠️ Đừng bắt đầu bằng versioning khi error format còn hỗn loạn. Version mới sẽ lặp lại lỗi cũ,
chỉ nhân đôi chi phí bảo trì.

---

## 7. Quy ước trong bộ tài liệu

### 7.1 REST và JSON

- Endpoint mô tả **resource** (danh từ số nhiều); hành vi do HTTP method quyết định.
- Request/response dùng `application/json; charset=utf-8`.
- Field dùng `snake_case` để khớp schema `messages` (`sender_name`, `will_attend`,
  `number_attend`, `created_at`). Không trộn `camelCase` trong cùng API.
- Thời gian RFC 3339 UTC: `2026-10-25T09:30:00Z`.
- ID trong ví dụ là số nguyên (khớp `messages.id`); chuyển sang UUID không đổi hình dạng contract.

### 7.2 Error format

Chuẩn đích là **RFC 9457 Problem Details**:

```json
{
  "type": "https://wedding.example/errors/validation-failed",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Trường 'sender_name' không được để trống.",
  "instance": "/api/v1/messages",
  "code": "validation_failed",
  "request_id": "req_01J9Z3K7"
}
```

Repo hiện tại trả `{ "success": false, "error": "..." }`. Đó là **hiện trạng**, không phải
chuẩn của bộ tài liệu. Lộ trình: thêm `type/title/status/code` trong minor release, giữ
`error` cho client cũ, sau đó bỏ dần `success`. Chi tiết ở `02` mục 9.

### 7.3 Versioning

- URL: `/api/v1/...` — dễ debug, dễ route, phù hợp dự án nhỏ.
- Không version khi chưa có consumer bên ngoài; thay đổi additive là đủ.
- Breaking change tăng version lớn + header `Sunset`.

### 7.4 Ngôn ngữ và trình bày

- Tiếng Việt, giữ thuật ngữ kỹ thuật tiếng Anh khi tự nhiên (idempotency, cursor, payload).
- Code block luôn có language: `ts`, `json`, `http`, `sql`, `bash`, `text`.
- `⚠️` cho cảnh báo mất dữ liệu/bảo mật, `💡` cho mẹo và trade-off.
- Ví dụ mở rộng (chưa có trong repo) được ghi rõ **"ví dụ"** ngay trong câu dẫn.

### 7.5 Tính chính xác

- Không bịa endpoint đang tồn tại. Bảng "hiện trạng" và "thiết kế mục tiêu" luôn tách riêng.
- Số liệu hiệu năng chỉ nêu khi có nguồn hoặc ghi rõ là giả định.
- Code TypeScript dùng API của Hono 4 / Bun 1.4 / Supabase JS 2.

---

## 8. Quick start — 5 bước thiết kế một API mới

Áp dụng cho một tính năng cụ thể, ví dụ "lưu ảnh kỷ niệm của khách".

**Bước 1 — Viết use case bằng ngôn ngữ người dùng.**

```text
Khách mở thiệp → chụp ảnh → gửi kèm lời chúc → ảnh hiện trong album realtime.
Chủ tiệc có thể xóa ảnh phản cảm.
```

Chưa nhắc bảng, endpoint hay framework. Bước này mơ hồ thì mọi bước sau đều sai.

**Bước 2 — Xác định resource và quan hệ.**

| Resource | Thuộc tính chính | Quan hệ |
|---|---|---|
| `messages` | `id`, `sender_name`, `content`, `created_at` | 1–n với `photos` |
| `photos` | `id`, `message_id`, `url`, `status` | n–1 với `messages` |

Ảnh luôn gắn với một lời chúc → sub-resource `/messages/{id}/photos`. Nếu ảnh có album và
quyền riêng → collection `/photos?message_id=...`.

**Bước 3 — Gán method, status code, quyền.**

| Nhu cầu | Endpoint | Method | Success | Quyền |
|---|---|---|---|---|
| Gửi ảnh | `/api/v1/messages/{id}/photos` | `POST` | `201` + `Location` | public + rate limit |
| Xem album | `/api/v1/messages/{id}/photos` | `GET` | `200` | public |
| Xóa ảnh | `/api/v1/photos/{id}` | `DELETE` | `204` | admin |

**Bước 4 — Viết contract trước handler.** Tối thiểu: request schema, response thành công,
danh sách lỗi, phân trang nếu là collection, event realtime phát ra. Chưa viết được response
mẫu nghĩa là chưa hiểu yêu cầu.

**Bước 5 — Review bằng checklist và test case.** Dùng mục 9 và test matrix `02` mục 20. Phải
trả lời được: "Gửi 2 lần thì sao?", "Dữ liệu tăng 1000 lần thì sao?", "Client cũ gọi endpoint
mới thì sao?".

---

## 9. Definition of Done cho một API

Endpoint chỉ "xong" khi **tất cả** mục dưới đây đạt. Không đạt mục nào thì ghi rõ lý do và
người chấp nhận rủi ro.

### 9.1 Contract

- [ ] Có use case và actor (public / user / admin / service).
- [ ] URL danh từ số nhiều, không verb, không trailing slash, lồng tối đa 2 cấp.
- [ ] Method đúng ngữ nghĩa; `GET` không đổi state.
- [ ] Request schema có ràng buộc kiểu, độ dài, miền giá trị.
- [ ] Response mẫu cho **mọi** status code có thể trả.
- [ ] Field mới là additive, không đổi kiểu field cũ.
- [ ] Có `request_id` trong log và (khuyến nghị) trong response lỗi.

### 9.2 Hành vi

- [ ] Status code đúng catalog, không lạm dụng `200` cho lỗi.
- [ ] Lỗi có `code` machine-readable + thông điệp cho người đọc.
- [ ] Tạo có thể retry an toàn (idempotency key hoặc natural key).
- [ ] Update kiểm soát lost update (`If-Match` hoặc version).
- [ ] Collection phân trang ổn định, có `limit` tối đa.
- [ ] Không N+1; đã xem `EXPLAIN` cho query chính.

### 9.3 Vận hành

- [ ] Có rate limit hoặc lý do không cần.
- [ ] Có timeout và xử lý lỗi dependency (Supabase, storage).
- [ ] Log không chứa PII/secret; có metric lỗi và latency.
- [ ] Test: happy path, validation, not found, conflict, unauthorized, rate limit.
- [ ] Có ghi chú migration/rollback nếu đổi schema.
- [ ] Tài liệu API cập nhật cùng PR, không "làm sau".

### 9.4 Bảo mật (chi tiết ở `api-security.md`)

- [ ] Xác thực đúng actor; kiểm tra quyền ở server, không dựa vào UI.
- [ ] Không trả field nhạy cảm (`guest_of` chi tiết, số điện thoại) cho public.
- [ ] Giới hạn kích thước body và kiểm tra `Content-Type`.
- [ ] Có biện pháp chống abuse cho endpoint ghi dữ liệu công khai.

💡 Checklist cố tình ngắn. Mục nào không áp dụng được thì xóa khỏi checklist thay vì tick cho có.

---

## 10. Bảng tra cứu tình huống

| Tình huống | Đọc mục nào |
|---|---|
| "API là gì, khác gì gọi hàm?" | `01` mục 1 |
| "Chọn REST, GraphQL hay gRPC?" | `01` mục 3 |
| "PUT hay PATCH?" | `02` mục 3, 4 |
| "Trả status code nào?" | `02` mục 5 |
| "Client cần header gì?" | `02` mục 6 |
| "Thiết kế filter/sort thế nào?" | `02` mục 7 |
| "Phân trang offset hay cursor?" | `01` mục 10; `02` mục 8 |
| "Làm sao để lỗi dễ xử lý?" | `01` mục 12; `02` mục 9 |
| "Validate input bằng gì?" | `02` mục 10 |
| "POST bị gửi trùng thì sao?" | `01` mục 5; `02` mục 11 |
| "Hai người sửa cùng lúc?" | `02` mục 12 |
| "Upload ảnh cho guestbook?" | `02` mục 13 |
| "Endpoint này public hay cần auth?" | `02` mục 14; `api-security.md` mục 3–4 |
| "Cache response thế nào?" | `01` mục 14; `02` mục 15 |
| "Chống spam gửi lời chúc?" | `02` mục 16; `api-security.md` mục 7 |
| "Đổi API mà không làm vỡ app cũ?" | `01` mục 11; `02` mục 17 |
| "Thiết kế webhook cho đối tác?" | `02` mục 18 |
| "Thiết kế lại API guestbook từ đầu?" | `01` mục 17; `02` mục 19 |
| "Review PR thêm endpoint" | `02` mục 20, 22; README mục 9 |
| "Realtime event qua WebSocket" | `websocket.md` mục 14, 18 |
| "Query chậm, cần index" | `postgresql-basics.md` mục 9; `postgresql-advanced.md` mục 2 |

---

## 11. Đóng góp và cập nhật tài liệu

### 11.1 Nguyên tắc

1. **Code là nguồn sự thật cuối cùng.** Tài liệu và `index.ts` mâu thuẫn → sửa một trong hai
   trong cùng PR.
2. **Một thay đổi contract = một thay đổi tài liệu.** PR đổi response phải kèm ví dụ mới.
3. **Không thêm mục "sẽ làm".** Ghi "hiện trạng" hoặc "đề xuất", kèm ngày/người quyết định.
4. **Ví dụ phải chạy được** hoặc được đánh dấu rõ là pseudo-code.
5. **Không nhân bản nội dung bảo mật.** Link tới `api-security.md`, chỉ nêu quyết định thiết kế.

### 11.2 Quy trình

```text
1. Mở issue: mục nào sai/thiếu, ảnh hưởng ai?
2. Nhánh docs/<slug>, sửa tối thiểu, giữ style hiện có.
3. Kiểm tra heading, anchor trong Mục lục, link tương đối.
4. Review: 1 người hiểu code + 1 consumer của API.
5. Merge; nếu đổi contract, cập nhật CHANGELOG.
```

```bash
# Kiểm tra nhanh trước khi merge
wc -l docs/api/*.md
grep -n '^## ' docs/api/*.md
grep -oE '\]\(\.\.?/[^)]+\)' docs/api/*.md   # link tương đối
```

⚠️ Anchor GitHub = lowercase, bỏ dấu câu, space → `-`. Đổi tiêu đề H2 mà quên anchor trong
Mục lục là lỗi thường gặp nhất.

### 11.3 Ai duyệt nội dung gì

| Nội dung | Người duyệt |
|---|---|
| Contract, status code, error format | Backend reviewer |
| Trải nghiệm consumer, phân trang, realtime | Frontend/mobile reviewer |
| Auth, rate limit, upload | Security reviewer |
| Query, index, migration | Người phụ trách database |

---

## 12. Tài liệu tham khảo

- **RFC 9110** — HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- **RFC 9111** — HTTP Caching: https://www.rfc-editor.org/rfc/rfc9111
- **RFC 9457** — Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- **RFC 8594** — Sunset HTTP Header: https://www.rfc-editor.org/rfc/rfc8594
- **RFC 9745** — Deprecation HTTP Header: https://www.rfc-editor.org/rfc/rfc9745
- **Microsoft REST API Guidelines**: https://github.com/microsoft/api-guidelines
- **Google API Design Guide**: https://cloud.google.com/apis/design
- **Zalando RESTful API Guidelines**: https://opensource.zalando.com/restful-api-guidelines/
- **OWASP API Security Top 10**: https://owasp.org/API-Security/editions/2023/en/0x11-t10/

---

*Bắt đầu đọc: [`01-fundamentals.md`](./01-fundamentals.md) →*
