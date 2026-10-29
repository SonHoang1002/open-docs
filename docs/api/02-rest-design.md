# Thiết kế REST API — Thực hành chuẩn từ contract đến vận hành

> Quy trình 10 bước, naming, method/status, PATCH, header, query, pagination, error catalog,
> validation, idempotency, locking, upload, cache, rate limit, versioning, webhook và case
> study guestbook.
>
> 📌 Nền tảng: [`01-fundamentals.md`](./01-fundamentals.md). Bảo mật:
> [`../api-security.md`](../api-security.md). Realtime: [`../websocket.md`](../websocket.md).

---

## Mục lục

1. [Quy trình 10 bước thiết kế API](#1-quy-trình-10-bước-thiết-kế-api)
2. [Quy tắc đặt tên URL và resource](#2-quy-tắc-đặt-tên-url-và-resource)
3. [Method, hành vi và status code](#3-method-hành-vi-và-status-code)
4. [PATCH và các kiểu cập nhật một phần](#4-patch-và-các-kiểu-cập-nhật-một-phần)
5. [Status code catalog](#5-status-code-catalog)
6. [Request và response header](#6-request-và-response-header)
7. [Chuẩn hóa query params](#7-chuẩn-hóa-query-params)
8. [Pagination](#8-pagination)
9. [Error response và error catalog](#9-error-response-và-error-catalog)
10. [Validation input](#10-validation-input)
11. [Idempotency-Key](#11-idempotency-key)
12. [Concurrency và optimistic locking](#12-concurrency-và-optimistic-locking)
13. [File upload](#13-file-upload)
14. [Authentication và authorization ở mức endpoint](#14-authentication-và-authorization-ở-mức-endpoint)
15. [Caching](#15-caching)
16. [Rate limiting](#16-rate-limiting)
17. [Versioning và deprecation](#17-versioning-và-deprecation)
18. [Webhook design](#18-webhook-design)
19. [Thiết kế API guestbook hoàn chỉnh](#19-thiết-kế-api-guestbook-hoàn-chỉnh)
20. [Test case matrix](#20-test-case-matrix)
21. [Anti-patterns REST](#21-anti-patterns-rest)
22. [Bài tập và checklist review](#22-bài-tập-và-checklist-review)
23. [Tài liệu tham khảo](#23-tài-liệu-tham-khảo)

---

## 1. Quy trình 10 bước thiết kế API

| # | Bước | Câu hỏi | Output |
|---|---|---|---|
| 1 | Use case & actor | Ai làm gì, vì sao? | 3–5 câu user story |
| 2 | Resource model | Danh từ nào, quan hệ nào? | Bảng resource + quan hệ |
| 3 | Endpoint & method | Thao tác nào, thành công trả gì? | Bảng method/path/status |
| 4 | Contract | Request/response chính xác ra sao? | JSON mẫu + schema |
| 5 | Error catalog | Những lỗi nào có thể xảy ra? | Bảng code/status/message |
| 6 | Collection | Lọc, sort, phân trang thế nào? | Query contract |
| 7 | Security | Ai được gọi, abuse thế nào? | Actor/scope/rate limit |
| 8 | Reliability | Retry, trùng lặp, ghi đồng thời? | Idempotency + locking |
| 9 | Observability & docs | Debug và bàn giao thế nào? | request_id, log, README |
| 10 | Review & test | Có phá vỡ client cũ không? | Test matrix + checklist |

Viết use case bằng ngôn ngữ người dùng trước: "Khách gửi lời chúc kèm xác nhận tham dự; chủ
tiệc ẩn lời chúc phản cảm." Nếu câu này mơ hồ, mọi bước sau đều mơ hồ.

Thứ tự cố tình đặt **contract trước code**. Viết code trước rồi "suy ra" contract thường cho
ra API phản ánh cấu trúc database thay vì nhu cầu client. Bước 10 phải review với một consumer
thật, không chỉ người viết.

💡 Mỗi bước có output kiểm tra được. Nếu output không viết thành 1 trang, bạn chưa sẵn sàng
sang bước tiếp theo.

---

## 2. Quy tắc đặt tên URL và resource

| Quy tắc | Nên | Không nên | Vì sao |
|---|---|---|---|
| Danh từ số nhiều | `/messages` | `/message`, `/getMessages` | Collection là tập hợp |
| kebab-case | `/guest-groups` | `/guestGroups`, `/guest_groups` | URL ổn định, dễ đọc |
| Không verb | `DELETE /messages/1` | `/messages/1/delete` | Method đã là động từ |
| Lồng tối đa 2 cấp | `/messages/1/photos` | `/weddings/1/messages/1/photos/1` | Dễ đọc, dễ phân quyền |
| ID là path segment | `/messages/1234` | `/messages?id=1234` | Định danh, không phải filter |
| Không trailing slash | `/messages` | `/messages/` | Tránh trùng URL, redirect |
| Không đuôi file | `/messages` | `/messages.json` | Dùng `Accept` |
| Chữ thường | `/api/v1/messages` | `/API/V1/Messages` | Nhất quán |

- **Version** đặt ngay sau `/api`: `/api/v1/messages`, không `/api/messages/v1`.
- **Path** định danh resource; **query** thay đổi cách xem:
  `/api/v1/messages/1234` vs `/api/v1/messages?guest_of=...`.
- **Sub-resource** khi con không tồn tại độc lập: `/messages/{id}/photos`. Nếu ảnh có album
  riêng: `/photos?message_id=...`.
- **Singleton** dùng `/wedding/settings`, không `/settings/1`.
- **Action endpoint** chỉ khi không mô hình hóa được bằng state + `PATCH`:
  `POST /messages/{id}/approve`, ghi rõ đây là action.

⚠️ Đổi tên URL là breaking change. Trước khi public, dành 15 phút kiểm tra lại bảng trên.

---

## 3. Method, hành vi và status code

| Thao tác | Method + path | Success | Idempotent | Ghi chú |
|---|---|---|---|---|
| Liệt kê | `GET /messages` | `200` | ✅ | Có phân trang |
| Xem một | `GET /messages/{id}` | `200` | ✅ | `404` nếu không có |
| Tạo | `POST /messages` | `201` + `Location` | ❌ | Có thể dùng idempotency key |
| Thay thế | `PUT /messages/{id}` | `200`/`204` | ✅ | Body đầy đủ |
| Sửa một phần | `PATCH /messages/{id}` | `200`/`204` | ❌ | Tuỳ định nghĩa patch |
| Xóa | `DELETE /messages/{id}` | `204` | ✅ | Lần 2 có thể `404` |
| Xóa collection | `DELETE /messages` | `204` | ✅ | Admin + audit |
| Tạo hàng loạt | `POST /messages/bulk` | `200`/`207` | ❌ | Xem bên dưới |

### 3.1 PUT vs PATCH vs POST

| Tiêu chí | `POST` | `PUT` | `PATCH` |
|---|---|---|---|
| Mục đích | Tạo mới / xử lý | Thay thế toàn bộ | Sửa một phần |
| Client gửi | Resource mới | Toàn bộ representation | Tập thay đổi |
| Field thiếu | Không áp dụng | Bị xóa/reset | Giữ nguyên |
| Idempotent | Không | Có | Không đảm bảo |
| Rủi ro chính | Tạo trùng | Ghi đè dữ liệu không gửi | Hành vi mơ hồ |

Không dùng `PUT` như "PATCH tiện lợi". Nếu handler merge field thiếu, đó là `PATCH` đội lốt
`PUT` và sẽ gây mất dữ liệu khi client gửi thiếu.

### 3.2 Bulk operations

| Cách | Endpoint | Ưu | Nhược |
|---|---|---|---|
| Nhiều request | Lặp `POST /messages` | Đơn giản, chuẩn | N round-trip |
| Bulk endpoint | `POST /messages/bulk` | Một round-trip | Cần định nghĩa partial success |
| Batch HTTP | `multipart/batch` | Tái dùng endpoint | Phức tạp, ít tooling |

Bulk trả kết quả từng item: `succeeded` (kèm `index`, `id`) và `failed` (kèm `index`, `code`,
`errors`). Có cả thành công và thất bại → `207`; tất cả thành công → `200`; tất cả lỗi
validation → `422`. Giới hạn số item (ví dụ 100) và tổng body size. Bulk không idempotent:
retry phải có `Idempotency-Key` cho cả batch.

---

## 4. PATCH và các kiểu cập nhật một phần

### 4.1 JSON Merge Patch (RFC 7396)

`application/merge-patch+json`. Field có mặt được ghi, `null` xóa, field vắng giữ nguyên.

```http
PATCH /api/v1/messages/1234
Content-Type: application/merge-patch+json
If-Match: "msg-1234-v3"

{ "content": "Chúc hai bạn hạnh phúc!", "number_attend": null }
```

Kết quả: `content` đổi, `number_attend` thành `NULL`, field khác giữ nguyên.

| Ưu | Nhược |
|---|---|
| Đơn giản, dễ hiểu | Không phân biệt "xóa" và "không gửi" với `null` |
| Hầu hết client làm được | Không có toán tử (increment, append) |
| Body nhỏ | Array bị thay toàn bộ |

### 4.2 JSON Patch (RFC 6902)

`application/json-patch+json`, body là danh sách toán tử `add`, `remove`, `replace`, `move`,
`copy`, `test`.

```http
PATCH /api/v1/messages/1234
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/content", "value": "Nội dung mới" },
  { "op": "remove", "path": "/number_attend" },
  { "op": "test", "path": "/will_attend", "value": true }
]
```

| Tiêu chí | Merge Patch | JSON Patch |
|---|---|---|
| Độ phức tạp | Thấp | Cao |
| Client hỗ trợ | Rộng | Ít hơn |
| Toán tử | Không | Có |
| Atomic | Toàn bộ body | Có `test`, fail cả patch |
| Rủi ro | Ghi đè array | Path sai, khó debug |

**Khuyến nghị:** dùng Merge Patch cho guestbook vì client chỉ sửa vài field văn bản. Ghi rõ:
"field vắng = giữ nguyên; `null` = xóa giá trị". Cần "tăng số khách" an toàn → action endpoint.

💡 Luôn validate body theo schema và kiểm tra quyền trên **từng field** (khách không được sửa
`status`). Field-level authorization là OWASP API3.

---

## 5. Status code catalog

| Code | Tên | Dùng khi | Ghi chú |
|---|---|---|---|
| `200` | OK | GET/PATCH/PUT thành công có body | Không dùng cho lỗi |
| `201` | Created | POST tạo resource | Bắt buộc `Location` |
| `202` | Accepted | Đã nhận, xử lý async | Trả job URL + `Retry-After` |
| `204` | No Content | Thành công, không body | DELETE, PUT không cần trả |
| `206` | Partial Content | Range request | File lớn, resume download |
| `301` | Moved Permanently | Đổi URL vĩnh viễn | Cân nhắc `308` cho method |
| `304` | Not Modified | `If-None-Match` khớp | Không body, có cache header |
| `400` | Bad Request | Request sai cú pháp, cursor hỏng | Không dùng cho validation field |
| `401` | Unauthorized | Thiếu/sai xác thực | Kèm `WWW-Authenticate` |
| `403` | Forbidden | Đã xác thực, không đủ quyền | Khác `401` rõ ràng |
| `404` | Not Found | Resource không tồn tại | Hoặc che resource riêng tư |
| `405` | Method Not Allowed | Method không hỗ trợ | Kèm `Allow` |
| `409` | Conflict | Trùng khóa, state xung đột | Ví dụ idempotency |
| `410` | Gone | Từng tồn tại, đã xóa vĩnh viễn | Khác `404` về ngữ nghĩa |
| `412` | Precondition Failed | `If-Match` không khớp | Optimistic locking |
| `415` | Unsupported Media Type | `Content-Type` không hỗ trợ | Kiểm tra trước khi parse |
| `422` | Unprocessable Content | Cú pháp đúng, sai nghiệp vụ | Validation chi tiết |
| `423` | Locked | Resource đang bị khóa | Hiếm; moderation |
| `428` | Precondition Required | Bắt buộc gửi `If-Match` | Chống lost update |
| `429` | Too Many Requests | Vượt rate limit | Kèm `Retry-After` |
| `500` | Internal Server Error | Lỗi không lường trước | Không lộ chi tiết |
| `502` | Bad Gateway | Upstream trả lỗi | Hạ tầng |
| `503` | Service Unavailable | Quá tải/bảo trì | Kèm `Retry-After` |
| `504` | Gateway Timeout | Upstream không kịp trả | Hạ tầng |

**`400` vs `422`:** `400` khi không parse được (JSON hỏng, thiếu cấu trúc); `422` khi parse
được nhưng vi phạm nghiệp vụ. Dùng `400` cho cả hai vẫn được nếu **nhất quán** và có `code`.

**`401` vs `403`:** `401` = chưa chứng minh danh tính; `403` = biết bạn là ai nhưng không được
phép. **`409` vs `412`:** `409` do state xung đột; `412` do precondition header không khớp.

⚠️ Không trả `404` cho validation, `500` cho input sai, hay `200` cho mọi thứ.

---

## 6. Request và response header

| Header | Loại | Khi dùng | Ví dụ |
|---|---|---|---|
| `Content-Type` | Cả hai | Luôn với body | `application/json; charset=utf-8` |
| `Accept` | Request | Chọn representation | `application/json` |
| `Authorization` | Request | Xác thực | `Bearer <token>` |
| `Location` | Response | Sau `201`/`202` | `/api/v1/messages/1234` |
| `ETag` | Response | Resource có version | `"msg-1234-v3"` |
| `If-Match` | Request | Ghi có điều kiện | `"msg-1234-v3"` |
| `If-None-Match` | Request | Cache validation | `"msg-1234-v3"` |
| `Cache-Control` | Response | Chính sách cache | `public, max-age=30` |
| `Retry-After` | Response | `429`, `503`, `202` | `30` |
| `X-Request-Id` | Cả hai | Truy vết | `req_01J9Z3K7` |
| `RateLimit-*` | Response | Giới hạn | `RateLimit-Remaining: 42` |
| `Allow` | Response | Sau `405` | `GET, POST` |
| `Vary` | Response | Cache key phụ | `Accept, Accept-Encoding` |

`X-Request-Id`: dùng lại ID client gửi sau khi validate format, hoặc sinh mới; luôn trả trong
response và log. Không dùng header này cho mục đích bảo mật. Mỗi header tùy biến mới là một
phần contract phải bảo trì — chỉ thêm khi thật cần.

---

## 7. Chuẩn hóa query params

```http
GET /api/v1/messages
  ?filter[guest_of]=Cô%20dâu
  &filter[will_attend]=true
  &sort=-created_at
  &fields=id,sender_name,content
  &include=photos
  &q=hạnh%20phúc
  &limit=20
  &before=eyJ...
```

| Nhu cầu | Cú pháp | Ghi chú |
|---|---|---|
| Lọc bằng bằng | `filter[field]=value` | Whitelist field |
| Lọc khoảng | `filter[created_at][gte]=...` | Hoặc `created_at_from` |
| Sort | `sort=-created_at,sender_name` | `-` = giảm dần |
| Chọn field | `fields=id,content` | Giảm payload |
| Quan hệ | `include=photos` | Tránh N+1 phía client |
| Search | `q=...` | Khác filter, có xếp hạng |
| Phân trang | `limit`, `before` | Xem mục 8 |

| Cú pháp | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| Bracket | `filter[guest_of]=...` | Rõ ràng, phổ biến | Cần encode `[` `]` |
| Dot | `filter.guest_of=...` | Không cần encode | Framework parse khác |
| Flat | `guest_of=...` | Đơn giản nhất | Dễ xung đột tên |

Khuyến nghị **bracket** vì tách filter khỏi tham số điều khiển. Không cho client truyền tên
cột trực tiếp vào `order()`/`filter()` của Supabase:

```ts
const SORTABLE = new Set(["created_at", "sender_name", "id"])
const column = (c.req.query("sort") ?? "-created_at").replace(/^-/, "")
if (!SORTABLE.has(column)) return problem(c, 400, "invalid_sort", "Field sort không hợp lệ.")
```

`fields`/`include` làm cache phức tạp và dễ tạo N+1. Guestbook **không cần** ở giai đoạn đầu;
thêm sau là non-breaking, bỏ đi mới breaking.

---

## 8. Pagination

| Bối cảnh | Chọn | Lý do |
|---|---|---|
| Infinite scroll, feed | Cursor | Ổn định, nhanh |
| Bảng admin có số trang | Offset | Nhảy trang được |
| Dữ liệu ít thay đổi | Offset | Đơn giản |
| Export toàn bộ | Cursor + batch | Tránh mất dữ liệu |

### 8.1 Cursor `before` — nâng cấp từ repo hiện tại

Repo dùng `before` trên `created_at`, limit 20, `data.reverse()`. Thiếu tiebreaker và chưa
validate cursor. Thiết kế dưới đây giữ tham số `before` nhưng đóng gói `(created_at, id)`:

```ts
type Cursor = { created_at: string; id: number }

const encodeCursor = (c: Cursor) =>
  Buffer.from(JSON.stringify(c)).toString("base64url")

function decodeCursor(raw: string): Cursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
    const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/
    if (typeof parsed.created_at !== "string" || !iso.test(parsed.created_at)) return null
    if (!Number.isSafeInteger(parsed.id)) return null
    return { created_at: parsed.created_at, id: parsed.id }
  } catch {
    return null
  }
}
```

```ts
app.get("/api/v1/messages", async (c) => {
  const rawLimit = Number(c.req.query("limit") ?? 20)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 20
  const rawCursor = c.req.query("before")
  const cursor = rawCursor ? decodeCursor(rawCursor) : null
  if (rawCursor && !cursor) {
    return problem(c, 400, "invalid_cursor", "Cursor không hợp lệ.")
  }

  let query = supabase.from("messages").select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1) // lấy dư 1 để biết has_more

  if (cursor) {
    // Giá trị đã validate chặt, không nội suy input thô.
    query = query.or(
      `created_at.lt.${cursor.created_at},` +
      `and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  }

  const { data, error } = await query
  if (error) return problem(c, 500, "internal_error", "Không đọc được dữ liệu.")

  const rows = data ?? []
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const oldest = items.at(-1)

  return c.json({
    data: items.reverse(), // hiển thị theo thời gian tăng dần
    meta: {
      limit,
      has_more: hasMore,
      next_cursor: hasMore && oldest
        ? encodeCursor({ created_at: oldest.created_at, id: oldest.id })
        : null,
    },
  })
})
```

**Vì sao `(created_at, id)`:** `created_at` không unique. Nếu 5 lời chúc cùng timestamp và
trang cắt ngang nhóm đó, cursor chỉ có timestamp sẽ bỏ qua hoặc lặp bản ghi.

```sql
CREATE INDEX idx_messages_created_id ON messages (created_at DESC, id DESC);
```

Luôn trả `has_more`; đừng bắt client đoán bằng `data.length < limit` (sai khi chia hết).
Offset chỉ dùng khi cần nhảy trang: `?offset=40&limit=20`, kèm `meta.total` nếu thật cần.

**Common bugs:**

| Bug | Triệu chứng | Cách tránh |
|---|---|---|
| Thiếu tiebreaker | Mất/trùng cùng timestamp | Sort `(created_at, id)` |
| Cursor từ item đầu | Trang sau lặp trang trước | Lấy từ item cuối |
| `has_more` theo `length` | Sai khi đúng bằng limit | Lấy `limit + 1` |
| Cursor chứa offset | Dữ liệu đổi → lệch | Cursor theo giá trị sort |
| Không giới hạn limit | Client xin 1 triệu row | Max 50–100 |
| Cursor không validate | Injection vào filter | Regex + kiểu |
| Timezone lệch | Bỏ sót bản ghi | Lưu và so sánh UTC |

⚠️ Cursor là dữ liệu công khai, không phải bảo mật. Đừng nhét thông tin nhạy cảm vào đó; nếu
cần chống sửa, ký bằng HMAC.

---

## 9. Error response và error catalog

```json
{
  "type": "https://wedding.example/errors/validation-failed",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Trường 'content' vượt quá 1000 ký tự.",
  "instance": "/api/v1/messages",
  "code": "validation_failed",
  "request_id": "req_01J9Z3K7",
  "errors": [
    { "field": "content", "code": "too_big", "message": "Tối đa 1000 ký tự" }
  ]
}
```

`type` là URI ổn định trỏ tới docs (client không fetch lúc runtime); `title` giống nhau cho
cùng loại lỗi; `code` là enum ổn định; `errors[]` chỉ có với validation.

| `code` | HTTP | Khi nào | Client xử lý |
|---|---|---|---|
| `validation_failed` | `422` | Field sai | Hiện lỗi theo field |
| `invalid_cursor` | `400` | Cursor hỏng | Tải lại từ đầu |
| `unsupported_media_type` | `415` | Không phải JSON | Sửa header |
| `payload_too_large` | `413` | Body quá lớn | Giảm nội dung |
| `message_not_found` | `404` | ID không tồn tại | Ẩn item |
| `precondition_failed` | `412` | ETag cũ | Tải lại rồi sửa |
| `idempotency_conflict` | `409` | Key dùng với payload khác | Sinh key mới |
| `rate_limited` | `429` | Vượt giới hạn | Đợi `Retry-After` |
| `forbidden` | `403` | Không đủ quyền | Ẩn thao tác |
| `internal_error` | `500` | Lỗi server | Báo lỗi, thử lại sau |

**Chuyển từ format hiện tại:** thêm `code`, `request_id`, `errors`, **giữ** `error`; sửa
status; sau khi frontend đọc `code`, bỏ `success`. Không đưa stack trace, SQL, tên bảng hay
message thô của Supabase ra ngoài.

```ts
function problem(c: Context, status: number, code: string, detail: string, extra = {}) {
  return c.json(
    { type: `https://wedding.example/errors/${code}`, title: code, status, detail, code, ...extra },
    status as ContentfulStatusCode
  )
}
```

---

## 10. Validation input

Zod không có sẵn trong repo; cài khi dùng: `bun add zod`.

```ts
const CreateMessage = z.object({
  sender_name: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(1000),
  will_attend: z.boolean(),
  guest_of: z.enum(["Cô dâu", "Chú rể", "Bạn thân", "Đồng nghiệp", "Họ hàng"]).optional(),
  number_attend: z.number().int().min(0).max(10).optional(),
}).strict() // từ chối field lạ

app.post("/api/v1/messages", async (c) => {
  const body = await c.req.json().catch(() => null)
  if (body === null) return problem(c, 400, "invalid_json", "Body không phải JSON hợp lệ.")

  const parsed = CreateMessage.safeParse(body)
  if (!parsed.success) {
    return problem(c, 422, "validation_failed", "Dữ liệu không hợp lệ.", {
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."), code: i.code, message: i.message,
      })),
    })
  }
  // parsed.data đã sạch và đúng kiểu
})
```

| Nguyên tắc | Lý do | Ví dụ |
|---|---|---|
| Whitelist field | Chặn mass assignment | `.strict()` |
| Trim string | `"   "` không lọt `min(1)` | `.trim()` trước `.min()` |
| Giới hạn độ dài | Chống payload/DB bloat | `.max(1000)` |
| Kiểm tra kiểu chặt | Tránh `"2"` thành `2` ngoài ý muốn | Hạn chế `z.coerce` |
| Validate enum | Tránh giá trị lạ | `z.enum([...])` |
| Giới hạn body | Chống DoS | `bodyLimit` |

```ts
import { bodyLimit } from "hono/body-limit"

app.use("/api/v1/messages", bodyLimit({
  maxSize: 16 * 1024,
  onError: (c) => problem(c, 413, "payload_too_large", "Body tối đa 16KB."),
}))
```

⚠️ `bodyLimit` đặt **trước** handler parse JSON; kiểm tra `Content-Type` trước khi parse để trả
`415` thay vì lỗi parse khó hiểu.

---

## 11. Idempotency-Key

| Thành phần | Giá trị |
|---|---|
| Header | `Idempotency-Key: <UUID>` |
| Scope | Actor (IP + token) và endpoint |
| Lưu | Bảng `idempotency_keys` hoặc Redis |
| TTL | 24 giờ |
| Khóa | `UNIQUE (scope, key)` |
| Dữ liệu | request hash, status, response, state |
| Payload khác cùng key | `409 idempotency_conflict` |
| Request đang chạy | `409` + `Retry-After` ngắn |

```sql
CREATE TABLE idempotency_keys (
  scope        text NOT NULL,
  key          uuid NOT NULL,
  request_hash text NOT NULL,
  status       integer,
  response     jsonb,
  state        text NOT NULL DEFAULT 'processing',
  expires_at   timestamptz NOT NULL,
  PRIMARY KEY (scope, key)
);
```

```text
1. Client gửi POST kèm key.
2. Server hash body, thử INSERT key (state=processing).
3. Key mới → xử lý, lưu response, state=done.
4. Key đã có:
   - hash khác → 409 idempotency_conflict
   - state=done → trả lại status + response cũ
   - state=processing → 409 request_in_progress
5. Client retry sau timeout → nhận đúng response cũ.
```

```ts
const key = c.req.header("idempotency-key")
if (!key || !/^[0-9a-f-]{36}$/i.test(key)) {
  return problem(c, 400, "invalid_idempotency_key", "Thiếu hoặc sai định dạng key.")
}
const scope = `${clientIp(c)}:${c.req.path}`
const hash = new Bun.CryptoHasher("sha256").update(JSON.stringify(body)).digest("hex")

const { data: existing } = await supabase.from("idempotency_keys")
  .select("*").eq("scope", scope).eq("key", key).maybeSingle()

if (existing) {
  if (existing.request_hash !== hash) {
    return problem(c, 409, "idempotency_conflict", "Key đã dùng với payload khác.")
  }
  if (existing.state === "processing") {
    return problem(c, 409, "request_in_progress", "Đang xử lý, thử lại sau.")
  }
  return c.json(existing.response, existing.status)
}

await supabase.from("idempotency_keys").insert({
  scope, key, request_hash: hash, state: "processing",
  expires_at: new Date(Date.now() + 86_400_000).toISOString(),
})
// ... chạy handler, sau đó update state=done, status, response
```

- Chỉ áp dụng cho thao tác không idempotent (`POST`, một số `PATCH`).
- Key do client sinh (UUID v4), không dùng nội dung body làm key.
- TTL hết hạn thì xóa; retry sau TTL tạo bản ghi mới — chấp nhận được.
- Scope phải gắn actor; không trả key/response của người khác.
- Dọn bảng định kỳ để tránh phình.

⚠️ Đoạn code trên minh hoạ luồng; giữa `SELECT` và `INSERT` vẫn có race. Production nên dùng
`INSERT ... ON CONFLICT DO NOTHING` rồi kiểm tra kết quả, hoặc khóa theo `(scope, key)`. Hai
request đồng thời phải có đúng một request thắng, request còn lại nhận `409 request_in_progress`.

💡 Guestbook có thể dùng `guest_token` + unique index thay cả bảng, tuỳ business rule là "một
khách một lời chúc" hay "một lần bấm một lời chúc".

---

## 12. Concurrency và optimistic locking

```text
A: GET /messages/1 → v3     B: GET /messages/1 → v3
A: PATCH → 200, v4          B: PATCH → 200, v5   ← mất thay đổi của A
```

```http
GET /api/v1/messages/1234

HTTP/1.1 200 OK
ETag: "msg-1234-v3"
```

```http
PATCH /api/v1/messages/1234
If-Match: "msg-1234-v3"
Content-Type: application/merge-patch+json

{ "content": "Nội dung mới" }
```

Version hiện tại khác `v3` → `412`; client GET lại, merge, gửi lại.

```sql
ALTER TABLE messages ADD COLUMN version integer NOT NULL DEFAULT 1;
```

```ts
const { data, error } = await supabase.from("messages")
  .update({ ...patch, version: currentVersion + 1 })
  .eq("id", id)
  .eq("version", currentVersion) // điều kiện then chốt
  .select()
  .maybeSingle()

if (error) return problem(c, 500, "internal_error", "Không cập nhật được.")
if (!data) return problem(c, 412, "precondition_failed", "Dữ liệu đã thay đổi, tải lại.")
```

| Chiến lược | Cách | Phù hợp |
|---|---|---|
| Optimistic | `version`/ETag + `If-Match` | Đọc nhiều, ghi ít |
| Pessimistic | `SELECT ... FOR UPDATE` | Xung đột cao |
| Last-write-wins | Không kiểm tra | Log, dữ liệu ít quan trọng |

Guestbook: optimistic là đủ; `412` + thông báo tốt hơn khóa DB. ⚠️ `If-Match` không thay thế
phân quyền — luôn kiểm tra owner/admin **trước** khi update.

---

## 13. File upload

| Tiêu chí | Multipart qua API | Presigned URL |
|---|---|---|
| Server xử lý file | Có | Không (client → storage) |
| Tải lớn | Tốn RAM/CPU | Tốt |
| Kiểm soát nội dung | Dễ, scan ngay | Scan sau upload |
| Độ phức tạp | Thấp | Trung bình (2 bước) |
| Phù hợp | Ảnh nhỏ (< 5MB) | Video, file lớn |

**Multipart:** client gửi `multipart/form-data`, server đọc stream, giới hạn size ngay từ đầu.
**Presigned URL (ví dụ mở rộng):**

```text
1. POST /api/v1/uploads { filename, content_type, size } → { upload_url, photo_id }
2. Client PUT file lên upload_url
3. POST /api/v1/photos/{photo_id}/complete
4. Server kiểm tra object, scan, đánh dấu ready
```

| Kiểm soát | Cách |
|---|---|
| Kích thước | `bodyLimit`, giới hạn theo content-length |
| Số file | Tối đa 1–5 mỗi request |
| MIME | Magic bytes, không tin `Content-Type` |
| Tên file | Sinh tên mới, không dùng tên client |
| Virus scan | ClamAV/dịch vụ scan trước khi public |
| Metadata | Strip EXIF (GPS) nếu public |
| Quyền | Chỉ owner/admin upload/xóa |

⚠️ Không trả URL storage có quyền ghi. Presigned URL phải ngắn hạn và đúng object. Chi tiết
ở `api-security.md` mục 6, 8.

---

## 14. Authentication và authorization ở mức endpoint

| Endpoint | Actor | Kiểm tra | Ghi chú |
|---|---|---|---|
| `GET /messages` | Public | Không | Chỉ field công khai |
| `GET /messages/{id}` | Public | Không | Có thể ẩn message bị report |
| `POST /messages` | Public | Rate limit + validate | Không cần login |
| `PATCH /messages/{id}` | Owner/admin | Object-level | So `guest_token`/`user_id` |
| `DELETE /messages/{id}` | Admin | Role | Audit log |
| `DELETE /messages` | Admin | Role + confirmation | Cực kỳ nguy hiểm |
| `GET /stats` | Admin | Role | Có thể public bản rút gọn |

| Scope | Quyền |
|---|---|
| `messages:read` | Đọc public |
| `messages:write` | Tạo/sửa message của mình |
| `messages:moderate` | Sửa/xóa mọi message |
| `stats:read` | Xem thống kê |

```ts
const requireAdmin = async (c: Context, next: NextFunction) => {
  const user = c.get("user")
  if (!user) return problem(c, 401, "unauthorized", "Cần đăng nhập.")
  if (user.role !== "admin") return problem(c, 403, "forbidden", "Cần quyền admin.")
  await next()
}
```

Kiểm tra ở **server**, trên **object cụ thể**, không dựa vào UI ẩn nút. Đây là BOLA/IDOR —
lỗi phổ biến nhất của API. Xem `api-security.md` mục 4 và 14.

---

## 15. Caching

Cache key gồm path, query đã chuẩn hóa, `Accept` và `Authorization` nếu response theo user.
Header thay đổi response phải khai báo trong `Vary`.

```http
Cache-Control: public, max-age=30, stale-while-revalidate=60
Vary: Accept-Encoding
```

| Resource | TTL | Lý do |
|---|---|---|
| Danh sách message public | 30s | Chấp nhận hơi cũ |
| Chi tiết message | 60s | Ít đổi |
| Stats | 60s | Tính toán đắt |
| Response theo user | `private, no-store` | Không cache chung |
| Token/auth | `no-store` | Nhạy cảm |

Khi `POST/PATCH/DELETE` thành công, purge/expire collection liên quan (`GET /messages*`,
`GET /stats`) hoặc để TTL ngắn tự hết. Với CDN, dùng purge theo tag/URL nếu có.

⚠️ Không cache response có `Authorization` bằng cache công khai — lỗi rò rỉ dữ liệu nghiêm
trọng. Cấu hình `Vary: Authorization` hoặc bỏ qua cache cho request có auth.

---

## 16. Rate limiting

| Thuật toán | Phù hợp | Ghi chú |
|---|---|---|
| Fixed window | Ít traffic | Burst ở biên |
| Sliding log | Cần chính xác | Tốn bộ nhớ |
| Sliding counter | Cân bằng | Xấp xỉ |
| Token bucket | Cho phép burst | Cấu hình phức tạp |
| Leaky bucket | Làm mượt | Thêm latency |

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 60
RateLimit-Remaining: 0
RateLimit-Reset: 30
```

- Giới hạn theo **actor**: IP cho public, token/user cho authenticated.
- `POST /messages` chặt hơn `GET /messages`.
- Trả `429` + `Retry-After`; không im lặng bỏ request.
- Nhiều instance → Redis/shared store, nếu không giới hạn thực tế = limit × số instance.
- Có ngoại lệ cho admin/health check, nhưng đừng mở toang.

Chi tiết thuật toán và chống bypass: `api-security.md` mục 7.

---

## 17. Versioning và deprecation

| Cách | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| URL | `/api/v1/messages` | Rõ, dễ route/log | URL dài |
| Header | `Accept: application/vnd.wedding.v2+json` | URL sạch | Khó test, dễ quên |
| Query | `?version=2` | Dễ thêm | Cache phức tạp |
| Không version | Chỉ additive | Ít bảo trì | Không xử lý breaking |

Khuyến nghị URL versioning. Chỉ tạo version mới khi có breaking change thật sự; thêm field
optional không cần version.

```http
Deprecation: Sun, 01 Mar 2027 00:00:00 GMT
Sunset: Sun, 01 Jun 2027 00:00:00 GMT
Link: <https://docs.example/migrate-v2>; rel="deprecation"; type="text/html"
```

| Header | Ý nghĩa | Chuẩn |
|---|---|---|
| `Deprecation` | Ngày bắt đầu deprecated | RFC 9745 |
| `Sunset` | Ngày ngừng hoạt động | RFC 8594 |
| `Link` | Tài liệu migration | RFC 8288 |

**Migration:** thông báo ngày cụ thể → đo usage → cung cấp mapping cũ/mới → chạy song song ít
nhất 1 chu kỳ release → hỗ trợ → tắt đúng hạn, trả `410 Gone`. Đừng deprecate endpoint chưa
ai dùng; cũng đừng giữ mãi vì "sợ" — chi phí bảo trì là thật.

---

## 18. Webhook design

```json
{
  "id": "evt_01J9Z4",
  "type": "message.created",
  "created_at": "2026-10-25T09:30:00Z",
  "data": { "id": 1234, "sender_name": "Nguyễn An", "content": "Chúc hạnh phúc!" }
}
```

`id` dùng cho idempotency; `type` versioned; `data` là snapshot tối thiểu, không phải DB row.
Event gợi ý: `message.created`, `message.updated`, `message.deleted`, `rsvp.created`.

```http
POST /partner/webhook HTTP/1.1
X-Webhook-Signature: t=1730367000,v1=5f2c...
X-Webhook-Id: evt_01J9Z4
```

```ts
import { createHmac, timingSafeEqual } from "node:crypto"

function verify(rawBody: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")))
  const timestamp = Number(parts.t)
  if (!Number.isFinite(timestamp)) return false
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false // chống replay

  const expected = createHmac("sha256", secret)
    .update(`${parts.t}.${rawBody}`).digest("hex")
  const a = Buffer.from(expected)
  const b = Buffer.from(parts.v1 ?? "")
  return a.length === b.length && timingSafeEqual(a, b)
}
```

Retry tối đa 5–6 lần với exponential + jitter (ví dụ 30s, 5 phút, 30 phút, 2 giờ, 6 giờ);
timeout mỗi lần 5–10s. `2xx` là thành công, `4xx` (trừ `429`) thường không retry. Receiver
phải idempotent theo `X-Webhook-Id`. Cho đối tác xem log delivery và replay thủ công.

⚠️ URL webhook do đối tác cung cấp → nguy cơ SSRF nếu người dùng nhập. Validate scheme/host,
chặn IP nội bộ, không follow redirect (`api-security.md` mục 5).

---

## 19. Thiết kế API guestbook hoàn chỉnh

### 19.1 Hiện trạng và mục tiêu

| Khía cạnh | Hiện tại (`index.ts`) | Mục tiêu |
|---|---|---|
| Version | `/api/messages` | `/api/v1/messages` |
| Envelope | `{ success, data }` | `{ data, meta }` |
| Lỗi | `{ success:false, error }` | RFC 9457 + `code` |
| Phân trang | `before` + `created_at` | Cursor base64 + tiebreaker |
| Update | `PUT` toàn bộ | `PATCH` merge + `If-Match` |
| Idempotency | Không | `Idempotency-Key` |
| Auth | Không | Admin cho xóa/moderate |
| Realtime | Broadcast mọi event | Event có `id`, `type`, version |

Đây là lộ trình, không phải mô tả code đang chạy. Triển khai từng bước, giữ endpoint cũ.

### 19.2 Endpoint

| Method | Path | Quyền | Success | Mô tả |
|---|---|---|---|---|
| `GET` | `/api/v1/messages` | Public | `200` | Danh sách + cursor |
| `POST` | `/api/v1/messages` | Public + rate limit | `201` | Tạo lời chúc |
| `GET` | `/api/v1/messages/{id}` | Public | `200` | Chi tiết |
| `PATCH` | `/api/v1/messages/{id}` | Owner/admin | `200` | Sửa một phần |
| `DELETE` | `/api/v1/messages/{id}` | Admin | `204` | Xóa một |
| `DELETE` | `/api/v1/messages` | Admin | `204` | Xóa tất cả |
| `GET` | `/api/v1/stats` | Public (rút gọn) | `200` | Thống kê |

### 19.3 Request/response

```http
GET /api/v1/messages?limit=2
```

```json
{
  "data": [
    { "id": 1234, "sender_name": "Nguyễn An", "content": "Chúc hạnh phúc!", "will_attend": true, "created_at": "2026-10-25T09:30:00Z" },
    { "id": 1235, "sender_name": "Trần Bình", "content": "Trăm năm viên mãn!", "will_attend": false, "created_at": "2026-10-25T09:31:00Z" }
  ],
  "meta": { "limit": 2, "has_more": true, "next_cursor": "eyJjcmVhdGVkX2F0IjoiLi4uIiwiaWQiOjEyMzV9" }
}
```

```http
POST /api/v1/messages
Content-Type: application/json
Idempotency-Key: 8f14e45f-ea3b-4c1a-9b2c-1d2e3f4a5b6c

{
  "sender_name": "Nguyễn An",
  "content": "Chúc hai bạn trăm năm hạnh phúc!",
  "will_attend": true,
  "guest_of": "Cô dâu",
  "number_attend": 2
}
```

```http
HTTP/1.1 201 Created
Location: /api/v1/messages/1234
ETag: "msg-1234-v1"
```

```json
{
  "data": {
    "id": 1234, "sender_name": "Nguyễn An", "content": "Chúc hai bạn trăm năm hạnh phúc!",
    "will_attend": true, "guest_of": "Cô dâu", "number_attend": 2,
    "created_at": "2026-10-25T09:30:00Z", "version": 1
  }
}
```

```http
PATCH /api/v1/messages/1234
Content-Type: application/merge-patch+json
If-Match: "msg-1234-v1"

{ "content": "Chúc hai bạn thật hạnh phúc!" }
```

ETag cũ → `412`; không tồn tại → `404`; field sai → `422`. Xóa thành công trả `204` không body.

```json
{
  "type": "https://wedding.example/errors/message-not-found",
  "title": "Không tìm thấy lời chúc",
  "status": 404,
  "detail": "Message 9999 không tồn tại.",
  "instance": "/api/v1/messages/9999",
  "code": "message_not_found",
  "request_id": "req_01J9Z3K7"
}
```

### 19.4 Realtime event

```json
{
  "id": "evt_01J9Z4",
  "type": "message.created",
  "created_at": "2026-10-25T09:30:00Z",
  "data": { "id": 1234, "sender_name": "Nguyễn An", "content": "Chúc hạnh phúc!" }
}
```

| Event | Sau khi | Client làm gì |
|---|---|---|
| `message.created` | `POST` | Chèn vào danh sách |
| `message.updated` | `PATCH` | Thay item theo `id` |
| `message.deleted` | `DELETE` | Xóa item theo `id` |
| `resync.required` | Client bỏ lỡ event | Gọi lại `GET /messages` |

⚠️ WebSocket không đảm bảo thứ tự khi reconnect. Client so `id`/`created_at` và có khả năng
resync; không dùng event làm nguồn sự thật duy nhất. Xem `websocket.md` mục 11, 14, 18.

---

## 20. Test case matrix

| # | Endpoint | Case | Kỳ vọng |
|---|---|---|---|
| 1 | `GET /messages` | Happy path | `200`, ≤20 item, có `meta` |
| 2 | `GET /messages` | `?limit=5` | 5 item |
| 3 | `GET /messages` | `?limit=9999` | Tối đa 50 |
| 4 | `GET /messages` | `?limit=-1` | `400` hoặc clamp về 1 |
| 5 | `GET /messages` | `?before=abc` | `400 invalid_cursor` |
| 6 | `GET /messages` | Trang cuối | `has_more:false` |
| 7 | `GET /messages` | Timestamp trùng | Không mất/trùng item |
| 8 | `POST /messages` | Body hợp lệ | `201`, `Location` |
| 9 | `POST /messages` | Thiếu `sender_name` | `422`, `errors[]` |
| 10 | `POST /messages` | `content: "   "` | `422` |
| 11 | `POST /messages` | Content 1001 ký tự | `422` |
| 12 | `POST /messages` | Field lạ | `422` (schema strict) |
| 13 | `POST /messages` | `text/plain` | `415` |
| 14 | `POST /messages` | Body > 16KB | `413` |
| 15 | `POST /messages` | 2 request cùng key | Chỉ 1 bản ghi |
| 16 | `POST /messages` | Cùng key, body khác | `409` |
| 17 | `POST /messages` | Spam 100/phút | `429` + `Retry-After` |
| 18 | `GET /messages/{id}` | Tồn tại / không tồn tại | `200` / `404` |
| 19 | `PATCH /messages/{id}` | Chỉ gửi `content` | Field khác giữ nguyên |
| 20 | `PATCH /messages/{id}` | `If-Match` sai | `412` |
| 21 | `PATCH /messages/{id}` | Thiếu `If-Match` | `428` (nếu bắt buộc) |
| 22 | `PATCH /messages/{id}` | Không phải owner | `403` |
| 23 | `DELETE /messages/{id}` | Admin / user | `204` / `403` |
| 24 | `DELETE /messages` | Admin | `204`, collection rỗng |
| 25 | Mọi endpoint | Method sai | `405` + `Allow` |
| 26 | Mọi endpoint | Supabase fail | `500`, không lộ chi tiết |

💡 Test matrix là tài liệu sống: thêm endpoint thì thêm dòng; sửa contract thì sửa kỳ vọng.

---

## 21. Anti-patterns REST

| ❌ Anti-pattern | ✅ Nên làm |
|---|---|
| `/getMessages`, `/deleteMessage` | `GET /messages`, `DELETE /messages/{id}` |
| `POST /messages/{id}/delete` | `DELETE /messages/{id}` |
| `200` + `success:false` | Status code đúng |
| `404` cho lỗi validation | `400`/`422` |
| `500` cho input sai | `4xx` tương ứng |
| `PUT` nhưng merge field | `PATCH` + Merge Patch |
| `PATCH` không định nghĩa null | Ghi rõ semantics |
| `DELETE /messages` không auth | Admin + audit |
| Offset cho feed lớn | Cursor + tiebreaker |
| `limit` không giới hạn | Max 50–100 |
| Filter theo cột tuỳ ý | Whitelist |
| Trả toàn bộ DB row | DTO/field selection |
| Mỗi endpoint một error format | Error catalog |
| Không có `request_id` | Sinh + trả + log |
| Version bằng cách fork code | Compatibility + deprecation |
| Không kiểm tra `Content-Type` | `415` trước khi parse |
| Tin `X-Forwarded-For` | Cấu hình proxy tin cậy |
| Cache response có auth | `private`/`no-store` |

---

## 22. Bài tập và checklist review

### Bài 1 — Duyệt lời chúc

Cần chủ tiệc ẩn lời chúc phản cảm nhưng vẫn giữ dữ liệu. Thiết kế endpoint.

<details>
<summary>Đáp án gợi ý</summary>

Thêm `status: visible | hidden` trên message; dùng `PATCH /api/v1/messages/{id}` với
`{ "status": "hidden" }`, quyền admin, trả `200`. Không cần `/hide` vì đây là đổi state đơn
giản. Nếu cần lý do và người thực hiện, thêm bảng `moderation_actions` (audit).

</details>

### Bài 2 — Sửa phân trang

Đoạn code sau thỉnh thoảng mất item. Tìm lỗi:

```ts
let q = supabase.from("messages").select("*")
  .order("created_at", { ascending: false }).limit(20)
if (before) q = q.lt("created_at", before)
```

<details>
<summary>Đáp án gợi ý</summary>

Thiếu tiebreaker `id` nên các item cùng `created_at` bị bỏ/lặp; `before` lấy trực tiếp, không
validate. Sửa: sort `(created_at desc, id desc)`, cursor base64 chứa cả hai, filter
`created_at < ts OR (created_at = ts AND id < id)`, validate trước khi nội suy.

</details>

### Checklist review nhanh

- [ ] URL danh từ số nhiều, không verb, không trailing slash.
- [ ] Method đúng; `GET` không đổi state.
- [ ] `201` có `Location`; `204` không body.
- [ ] Mọi lỗi có `code`, status đúng, không lộ chi tiết nội bộ.
- [ ] Schema whitelist + giới hạn độ dài.
- [ ] `limit` có max; cursor có tiebreaker và validate.
- [ ] `POST` quan trọng có idempotency hoặc unique constraint.
- [ ] Update có optimistic locking nếu cần.
- [ ] Phân quyền object-level, không chỉ role.
- [ ] Rate limit cho endpoint public ghi dữ liệu.
- [ ] Có `request_id` trong log/response lỗi.
- [ ] Test: happy, validation, not found, conflict, unauthorized, rate limit.
- [ ] Docs cập nhật cùng PR; không N+1; query chính có index.
- [ ] Thay đổi additive, không phá client cũ.

---

## 23. Tài liệu tham khảo

- **RFC 9110** — HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- **RFC 9111** — HTTP Caching: https://www.rfc-editor.org/rfc/rfc9111
- **RFC 9457** — Problem Details: https://www.rfc-editor.org/rfc/rfc9457
- **RFC 7396** — JSON Merge Patch: https://www.rfc-editor.org/rfc/rfc7396
- **RFC 6902** — JSON Patch: https://www.rfc-editor.org/rfc/rfc6902
- **RFC 8594 / RFC 9745** — Sunset và Deprecation header
- **RFC 6585** — `428`, `429`: https://www.rfc-editor.org/rfc/rfc6585
- **OWASP API Security Top 10**: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- **Microsoft REST API Guidelines**: https://github.com/microsoft/api-guidelines
- **Google API Design Guide**: https://cloud.google.com/apis/design
- **Zalando RESTful API Guidelines**: https://opensource.zalando.com/restful-api-guidelines/
- **Stripe — Idempotent requests**: https://docs.stripe.com/api/idempotent_requests
- **PostgREST — Filters**: https://postgrest.org/en/stable/references/api/tables_views.html

---

*Quay lại hub: [`README.md`](./README.md). Nền tảng: [`01-fundamentals.md`](./01-fundamentals.md).*
