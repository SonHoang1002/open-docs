# API Fundamentals — Kiến thức nền tảng trước khi thiết kế

> Tài liệu nền tảng về API: contract, kiến trúc phân tán, phân loại API, HTTP, idempotency,
> resource modeling, REST constraints, versioning, lỗi, caching và async operation.
> Đọc xong, bạn có đủ từ vựng và tiêu chí để bước sang [`02-rest-design.md`](./02-rest-design.md).
>
> 📌 Bảo mật (authN/authZ, OWASP, secret) không nằm trong tài liệu này —
> xem [`../api-security.md`](../api-security.md).

---

## Mục lục

1. [API là gì?](#1-api-là-gì)
2. [Kiến trúc phân tán và vị trí của API](#2-kiến-trúc-phân-tán-và-vị-trí-của-api)
3. [Phân loại API](#3-phân-loại-api)
4. [HTTP deep dive](#4-http-deep-dive)
5. [Idempotency, safety và retry](#5-idempotency-safety-và-retry)
6. [URL, resource, representation và JSON](#6-url-resource-representation-và-json)
7. [REST constraints và Richardson Maturity Model](#7-rest-constraints-và-richardson-maturity-model)
8. [Resource modeling](#8-resource-modeling)
9. [Request/response envelope và naming convention](#9-requestresponse-envelope-và-naming-convention)
10. [Pagination, filter, sort, search](#10-pagination-filter-sort-search)
11. [Versioning và compatibility](#11-versioning-và-compatibility)
12. [Error handling](#12-error-handling)
13. [AuthN và AuthZ ở mức overview](#13-authn-và-authz-ở-mức-overview)
14. [Caching, conditional request, rate limiting](#14-caching-conditional-request-rate-limiting)
15. [Async và long-running operations](#15-async-và-long-running-operations)
16. [API cho mobile và BFF](#16-api-cho-mobile-và-bff)
17. [Case study thiết kế API guestbook](#17-case-study-thiết-kế-api-guestbook)
18. [Anti-patterns nền tảng](#18-anti-patterns-nền-tảng)
19. [Bài tập và đáp án gợi ý](#19-bài-tập-và-đáp-án-gợi-ý)
20. [Tài liệu tham khảo](#20-tài-liệu-tham-khảo)

---

## 1. API là gì?

**API** là **hợp đồng (contract)** cho phép hai chương trình nói chuyện mà không cần biết
implementation của nhau. Contract nói: có thao tác nào, input/output ra sao, lỗi thế nào,
điều kiện nào phải đúng. Nó **không** nói database gì, ngôn ngữ gì, chạy ở đâu — nhờ vậy có
thể thay backend mà không sửa client.

| Vai trò | Trong `wedding-server` | Quan tâm |
|---|---|---|
| **Producer** | Hono app trong `index.ts` | Chi phí, ổn định, mở rộng, bảo trì |
| **Consumer** | Thiệp cưới web, mobile, admin panel | Dễ dùng, ổn định, lỗi rõ, ít breaking change |
| **Consumer realtime** | WebSocket client ở `/ws` | Event schema, thứ tự, reconnect |

API tốt tối ưu cho **consumer**, không phải cho người viết server. Vì vậy không trả nguyên
row database nếu client chỉ cần 3 field.

Contract tối thiểu gồm: operation, input schema, output schema, error catalog, semantics,
auth, và SLA. Ví dụ ở mức type (chưa phải code đang chạy):

```ts
type CreateMessageInput = { sender_name: string; content: string; will_attend: boolean }
type Message = CreateMessageInput & { id: number; created_at: string } // RFC 3339 UTC
```

⚠️ Type chỉ kiểm tra lúc compile; contract thật phải **validate ở runtime** vì client gửi
được bất cứ thứ gì.

**API economy:** API là sản phẩm, không chỉ là kỹ thuật. Người tiêu dùng đầu tiên của API này
chính là frontend của bạn 3 tháng sau. Tối ưu cho họ là tối ưu cho chính bạn.

---

## 2. Kiến trúc phân tán và vị trí của API

```text
┌────────┐   ┌─────────┐   ┌────────────┐   ┌──────────────┐
│ Client │──▶│ Gateway │──▶│ Service A  │──▶│ PostgreSQL   │
└────────┘   │ + cache │   ├────────────┤   └──────────────┘
             └─────────┘   │ Service B  │
                           └────────────┘
```

Mỗi "hop" thêm latency, thêm điểm lỗi, thêm thứ phải quan sát. Phân tán **không** tự tốt hơn
monolith; chỉ đáng khi cần scale độc lập, isolate lỗi, hoặc nhiều team deploy riêng.

### 2.1 Client-server và stateless

**Stateless** nghĩa là mỗi request mang đủ thông tin; server không dựa vào việc request trước
đã "nhớ" client. Hệ quả: thêm instance là scale ngang được, không cần sticky session.

| Có state | Stateless |
|---|---|
| Session trong RAM server | Token/session do client gửi lại |
| Request 2 phụ thuộc request 1 | Request nào cũng độc lập |
| Scale ngang cần sticky session | Thêm instance tự do |

Repo có một chỗ **stateful có chủ đích**: `activeClients` giữ WebSocket connection trong RAM.
Một instance thì ổn; hai instance thì client nối A không nhận event phát từ B. Đây là lý do
`websocket.md` dành một mục cho pub/sub Redis. Bài học: stateful không sai, nhưng phải **biết
mình stateful ở đâu**.

💡 Stateless không có nghĩa "không lưu gì". Database vẫn lưu; ý là request không phụ thuộc bộ
nhớ tạm của một instance cụ thể.

### 2.2 Cache, gateway, service mesh

**Cache** là bản sao dữ liệu đặt gần người dùng hơn: browser, CDN, gateway, application
(in-memory/Redis), database (materialized view). Mỗi tầng có bài toán invalidation riêng.

**API Gateway** đứng trước các service để routing, auth, rate limit, logging, transform. Cẩn
thận: đừng biến gateway thành nơi chứa business logic, và đừng tin header nội bộ một cách mù
quáng.

**Service mesh** (Istio, Linkerd) đặt proxy cạnh mỗi service để lo mTLS, retry, timeout,
tracing. Rất mạnh cho hàng chục service, **overkill** cho một Hono server + Supabase. Biết để
tránh "hype-driven development".

---

## 3. Phân loại API

| Kiểu | Mô hình | Ưu | Nhược | Nên dùng khi |
|---|---|---|---|---|
| **REST** | Resource + HTTP method | Đơn giản, cache tốt, tooling rộng | Over/under-fetching, nhiều round-trip | CRUD, public API, web/mobile thông thường |
| **RPC** (JSON-RPC) | Gọi hàm từ xa | Dễ hiểu, action rõ | Ít chuẩn chung, khó cache | Action phức tạp, internal API |
| **GraphQL** | Query graph, client chọn field | Lấy đúng dữ liệu, một endpoint | Cache khó, N+1, complexity attack | Nhiều client, graph quan hệ phức tạp |
| **gRPC** | Protobuf + HTTP/2 | Nhanh, type-safe, streaming | Browser không gọi trực tiếp, khó debug | Service-to-service, mobile native |
| **WebSocket** | Full-duplex qua TCP | Push hai chiều, overhead thấp | Stateful, scale khó, cần reconnect | Chat, collaborative, realtime guestbook |
| **Webhook** | Server gọi server | Event-driven, không polling | At-least-once, cần signature | Thông báo đối tác, thanh toán |
| **SOAP** | XML + WSDL | Chuẩn chặt, transaction | Nặng, verbose | Hệ thống cũ, ngân hàng |
| **Message queue** | Produce/consume bất đồng bộ | Decouple, chịu tải, retry | Không phản hồi tức thời | Background job, event fan-out |

**Bảng quyết định nhanh:** nhìn cột "Nên dùng khi" ở bảng trên; nếu vẫn mơ hồ, hỏi ba câu:
(1) client có cần phản hồi ngay không? (2) có cần push event không? (3) bên thứ ba có cần
được thông báo không? Câu trả lời "có" lần lượt dẫn tới REST, WebSocket/SSE, webhook.

**Vì sao dự án này chọn REST + WebSocket:** guestbook có hai nhu cầu tách biệt — CRUD lời
chúc (REST: cache được, debug bằng `curl`) và cập nhật realtime (WebSocket: server chủ động
push). Không cần GraphQL vì chỉ một resource đơn giản; không cần gRPC vì không có
service-to-service.

⚠️ Đừng dùng WebSocket cho CRUD: không có status code, không cache, khó retry. REST cho ghi,
WebSocket cho thông báo.

---

## 4. HTTP deep dive

### 4.1 Cấu trúc message

```http
POST /api/v1/messages HTTP/1.1
Host: wedding.example
Content-Type: application/json
Idempotency-Key: 8f14e45f-ea3b-4c1a-9b2c-1d2e3f4a5b6c

{ "sender_name": "Nguyễn An", "content": "Chúc hai bạn trăm năm hạnh phúc!", "will_attend": true }
```

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/v1/messages/1234

{ "data": { "id": 1234, "created_at": "2026-10-25T09:30:00Z" } }
```

Request line (method, target, version) + header + body. Response thay request line bằng status
line. Đây là toàn bộ "giao thức" mà mọi client hiểu.

### 4.2 Method

| Method | Ý nghĩa | Safe | Idempotent | Body |
|---|---|---|---|---|
| `GET` | Đọc representation | ✅ | ✅ | Không nên |
| `HEAD` | Như GET, không body | ✅ | ✅ | Không |
| `POST` | Tạo mới / xử lý | ❌ | ❌* | Có |
| `PUT` | Thay thế toàn bộ resource | ❌ | ✅ | Có |
| `PATCH` | Sửa một phần | ❌ | ❌ | Có |
| `DELETE` | Xóa | ❌ | ✅ | Không bắt buộc |
| `OPTIONS` | Hỏi khả năng resource | ✅ | ✅ | Không |

\* `POST` idempotent nếu có `Idempotency-Key` hoặc khóa tự nhiên.

### 4.3 Status code

| Nhóm | Ý nghĩa | Ví dụ |
|---|---|---|
| `1xx` | Thông tin | `100 Continue`, `101 Switching Protocols` |
| `2xx` | Thành công | `200`, `201`, `204` |
| `3xx` | Chuyển hướng / cache | `301`, `304` |
| `4xx` | Lỗi client sửa được | `400`, `401`, `403`, `404`, `409`, `422`, `429` |
| `5xx` | Lỗi server, client không sửa được | `500`, `502`, `503`, `504` |

Trả `200` kèm `success:false` là anti-pattern: làm hỏng cache, metric, retry logic và SDK.

### 4.4 Header

| Header | Vai trò | Ví dụ |
|---|---|---|
| `Content-Type` | Định dạng body | `application/json; charset=utf-8` |
| `Accept` | Định dạng client nhận | `application/json` |
| `Authorization` | Xác thực | `Bearer <token>` |
| `Location` | URL resource vừa tạo | `/api/v1/messages/1234` |
| `ETag` | Phiên bản representation | `"msg-1234-v1"` |
| `If-None-Match` | Chỉ trả nếu ETag khác | `"msg-1234-v1"` |
| `If-Match` | Chỉ ghi nếu ETag khớp | `"msg-1234-v1"` |
| `Cache-Control` | Chính sách cache | `public, max-age=30` |
| `Retry-After` | Khi nào được thử lại | `30` |
| `X-Request-Id` | Truy vết | `req_01J9Z3K7` |
| `Vary` | Cache key phụ thuộc header | `Accept, Accept-Encoding` |

**Content negotiation:** `Accept` (client muốn gì), `Content-Type` (server trả gì). Sai định
dạng body → `415`; không hỗ trợ định dạng client xin → `406` (hiếm dùng với API JSON).

**Compression:** `Accept-Encoding: gzip, br` → `Content-Encoding: br`. Không nén response
< 1KB; thêm `Vary: Accept-Encoding` để cache không trả nhầm bản nén.

**Connection:** HTTP/1.1 mặc định keep-alive, một TCP connection cho nhiều request tuần tự.
Pipelining gần như không dùng vì head-of-line blocking.

### 4.5 HTTP/1.1 vs HTTP/2 vs HTTP/3

| Tiêu chí | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC (UDP) |
| Đa request | Nhiều connection | Multiplexing 1 connection | Multiplexing, không HOL ở transport |
| Header | Text, lặp | HPACK nén | QPACK nén |
| HOL blocking | HTTP level | TCP level | Giảm mạnh |
| Debug | Rất dễ | Khó hơn | Khó nhất |
| Phù hợp | Tool nội bộ, legacy | Web hiện đại | Mobile, mạng yếu |

Với Hono + Bun, version thường do reverse proxy/CDN quyết định. Ở tầng thiết kế, **response
nhỏ, ít round-trip, cache đúng** mang lại lợi ích lớn hơn việc chọn version giao thức.

**HTTPS bắt buộc** cho API public. Tên khách, lời chúc, token đều là dữ liệu cá nhân. HSTS
và cấu hình TLS thuộc `api-security.md` mục 8–9.

---

## 5. Idempotency, safety và retry

- **Safe:** không đổi state (`GET`, `HEAD`, `OPTIONS`).
- **Idempotent:** gửi N lần có cùng hiệu ứng cuối như 1 lần (`GET`, `PUT`, `DELETE`).
- **Không idempotent:** `POST` thường, `PATCH` dạng "increment".

Idempotent không có nghĩa response giống hệt. `DELETE /messages/1` lần đầu `204`, lần hai có
thể `404` — state cuối vẫn là "đã xóa".

**Vì sao quan trọng:** khi `POST` timeout, client không biết server đã tạo chưa:

```text
Client ──POST──▶ Server ──INSERT──▶ DB
   │  timeout       │
   │                │  response mất trên đường về
Client retry ──POST──▶ Server ──INSERT──▶ DB   ← bản ghi thứ 2!
```

Ba cách xử lý:

| Cách | Mô tả | Phù hợp |
|---|---|---|
| **Idempotency key** | Client gửi key, server lưu và trả response cũ | API public, POST tạo resource |
| **Natural key / unique index** | DB chặn trùng theo khóa tự nhiên | Dữ liệu có khóa tự nhiên |
| **Client-generated ID** | Client tạo UUID, server upsert | Mobile offline-first |

```ts
// Ví dụ natural key: mỗi khách một lời chúc cho mỗi thiệp
// Cần unique index (wedding_id, guest_token)
await supabase
  .from("messages")
  .upsert(
    { wedding_id, guest_token, sender_name, content },
    { onConflict: "wedding_id,guest_token" }
  )
  .select()
  .single()
```

**Retry đúng cách:** chỉ retry lỗi tạm thời (`timeout`, `502`, `503`, `504`, `429`), chỉ khi
thao tác idempotent hoặc có key, và luôn có backoff + jitter.

```ts
async function withRetry<T>(fn: () => Promise<T>, attempts = 4, baseMs = 200): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try { return await fn() } catch (err) {
      lastError = err
      if (i === attempts - 1) break
      await Bun.sleep(Math.random() * baseMs * 2 ** i) // full jitter
    }
  }
  throw lastError
}
```

⚠️ Không retry `400`, `401`, `403`, `404`, `422`: retry không làm dữ liệu đúng lên, chỉ tăng
tải và làm nhiễu log. Thiết kế `Idempotency-Key` đầy đủ ở `02` mục 11.

---

## 6. URL, resource, representation và JSON

```text
https://wedding.example/api/v1/messages/1234?include=photos#top
└─┬─┘   └──────┬──────┘└──┬──┘└──────┬──────┘└──┬───┘└──┬──┘
scheme       authority   path       resource    query  fragment
```

| Phần | Vai trò | Ghi chú |
|---|---|---|
| Scheme | `https` | Bắt buộc cho API public |
| Host | Domain API | Không đổi host theo version |
| Path | Định danh resource | Danh từ, số nhiều, không đuôi file |
| Query | Lọc, sort, phân trang | Không dùng để định danh resource |
| Fragment | Phía client | **Không bao giờ** gửi lên server |

**Resource** là khái niệm (một lời chúc), **representation** là dạng dữ liệu trả về (JSON hôm
nay, CSV khi export). Cùng resource có thể có nhiều representation:

```http
GET /api/v1/messages/1234
GET /api/v1/messages/1234?fields=id,content
```

**Media type thường gặp:**

| Media type | Dùng khi |
|---|---|
| `application/json` | Mặc định |
| `application/problem+json` | Lỗi RFC 9457 |
| `application/merge-patch+json` | JSON Merge Patch |
| `application/json-patch+json` | JSON Patch |
| `multipart/form-data` | Upload file |
| `text/csv` | Export |

**Quy tắc JSON:**

| Quy tắc | Lý do |
|---|---|
| UTF-8, không BOM | Tránh lỗi parse |
| Không comment | JSON không hỗ trợ |
| Không `NaN`/`Infinity` | Không hợp lệ; dùng `null` |
| Số thực có thể mất chính xác | IEEE 754; tiền nên là integer cents |
| ID > 2^53 nên là string | JavaScript mất chính xác số nguyên lớn |
| Thời gian RFC 3339 UTC | So sánh, sort, hiển thị nhất quán |
| `null` khác "không có field" | "Chưa đặt" khác "không trả về" |

```json
{ "id": "1234", "will_attend": true, "guest_of": null, "amount_cents": 500000 }
```

---

## 7. REST constraints và Richardson Maturity Model

REST do Roy Fielding mô tả năm 2000 với 6 ràng buộc:

| Ràng buộc | Nội dung | Vi phạm thường gặp |
|---|---|---|
| **Client-server** | Tách UI và data | Trộn render HTML trong API JSON |
| **Stateless** | Request tự chứa context | Session RAM, sticky session |
| **Cacheable** | Response khai báo cache | Luôn `no-store` dù dữ liệu công khai |
| **Uniform interface** | Resource + method + representation | `/getMessages`, `/deleteMessage` |
| **Layered system** | Client không cần biết proxy | Hard-code IP backend |
| **Code on demand** (tuỳ chọn) | Server gửi code chạy được | Hiếm dùng |

**Richardson Maturity Model:**

| Level | Tên | Đặc điểm | Ví dụ |
|---|---|---|---|
| 0 | Swamp of POX | Một endpoint, một method | `POST /api` với `{action:"getMessages"}` |
| 1 | Resources | Nhiều URL | `POST /messages`, `POST /messages/1` |
| 2 | HTTP Verbs | Đúng method + status | `DELETE /messages/1` → `204` |
| 3 | Hypermedia | Response chứa link hành động | `_links: { next: ... }` |

Phần lớn API "REST" thực tế đạt **level 2**; thế là đủ. Level 3 (HATEOAS) đẹp về lý thuyết
nhưng ít dùng vì client vẫn hard-code URL. Khuyến nghị: dùng link ở mức **pagination**
(`next`, `prev`) là đủ; không cần hypermedia đầy đủ.

---

## 8. Resource modeling

| Yêu cầu | Resource | Collection |
|---|---|---|
| Khách gửi lời chúc | `message` | `/messages` |
| Khách xác nhận tham dự | `rsvp` (hoặc field trên message) | `/rsvps` |
| Chủ tiệc xem thống kê | `stats` (read-only) | `/stats` |
| Ảnh kỷ niệm | `photo` | `/photos` |
| Bàn tiệc | `table` | `/tables` |

**Quy tắc đặt tên:**

| Quy tắc | Đúng | Sai |
|---|---|---|
| Danh từ số nhiều | `/messages` | `/message`, `/getMessages` |
| kebab-case | `/guest-groups` | `/guestGroups`, `/guest_groups` |
| Không verb trong path | `DELETE /messages/1` | `/messages/1/delete` |
| Lồng tối đa 2 cấp | `/messages/1/photos` | `/weddings/1/messages/1/photos/1/comments` |
| ID là path segment | `/messages/1234` | `/messages?id=1234` |
| Không trailing slash | `/messages` | `/messages/` |

**Collection, item, sub-resource:**

```text
/api/v1/messages                 ← collection
/api/v1/messages/1234            ← item
/api/v1/messages/1234/photos     ← sub-resource collection
/api/v1/photos/99                ← item độc lập
```

Dùng sub-resource khi con **không tồn tại độc lập** hoặc luôn truy cập trong ngữ cảnh cha.
Ảnh của một lời chúc → `/messages/{id}/photos`. Nếu ảnh có album và quyền riêng →
`/photos?message_id=...`.

**Action endpoint — escape hatch:** REST không diễn đạt tốt mọi hành động.

```http
POST /api/v1/messages/1234/approve
POST /api/v1/messages/1234/report
```

Quy ước: động từ ở cuối, dùng `POST`, trả resource sau khi đổi trạng thái hoặc `204`. Chỉ dùng
khi không mô hình hóa được bằng field + `PATCH`. Duyệt lời chúc nên là
`PATCH { "status": "approved" }`; "gửi lại email xác nhận" thì `/resend-confirmation` hợp lý
vì nó không chỉ đổi state.

**Quan hệ n–n:** dùng resource trung gian. Một bàn có nhiều khách → `/tables/{id}/guests`.
Cần lịch sử chuyển bàn → resource `seat_assignments`.

---

## 9. Request/response envelope và naming convention

| Kiểu | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| **Bare** | `{ "id": 1, ... }` | Đơn giản, ít lồng | Thêm metadata phải phá shape |
| **Envelope** | `{ "data": {...} }` | Metadata, lỗi, phân trang thống nhất | Client phải `.data` mọi lúc |
| **Envelope collection** | `{ "data": [...], "meta": {...} }` | Rõ, mở rộng được | Không đồng nhất với item |

Khuyến nghị: envelope cho collection, bare cho item — nhưng phải **nhất quán**. Repo dùng
`{ success, data }` cho cả hai; chấp nhận được giai đoạn đầu, nhưng `success` dư thừa khi đã
có HTTP status.

```json
{
  "data": [
    { "id": 1234, "sender_name": "Nguyễn An", "content": "Chúc hạnh phúc!", "created_at": "2026-10-25T09:30:00Z" }
  ],
  "meta": { "limit": 20, "next_cursor": "eyJjcmVhdGVkX2F0IjoiLi4uIiwiaWQiOjEyMzR9", "has_more": true }
}
```

| Metadata | Ý nghĩa | Bắt buộc |
|---|---|---|
| `data` | Payload chính | Có |
| `meta.limit` | Kích thước trang | Nên |
| `meta.next_cursor` | Con trỏ trang sau | Nếu cursor |
| `meta.has_more` | Còn dữ liệu? | Nên |
| `meta.total` | Tổng bản ghi | Tuỳ, có thể đắt |
| `request_id` | Truy vết | Nên, ít nhất trong lỗi |

**Naming convention:**

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| JSON field | `snake_case` (khớp DB) | `sender_name`, `created_at` |
| URL path | kebab-case, số nhiều | `/guest-groups` |
| Query param | `snake_case` | `?guest_of=Cô%20dâu` |
| Boolean | Không prefix `is_` nếu đã rõ | `will_attend` |
| Thời gian | Hậu tố `_at` | `created_at`, `updated_at` |
| ID | `id`; tham chiếu `<resource>_id` | `id`, `message_id` |
| Enum | snake_case string | `pending`, `approved` |

⚠️ Chọn một quy ước và giữ đến hết đời API. Đổi `snake_case` sang `camelCase` là breaking
change với mọi client, dù nghe "đẹp hơn".

---

## 10. Pagination, filter, sort, search

Với 5000+ lời chúc (xem `seed.ts`), trả hết gây payload lớn, tốn RAM, khó cache và dễ bị lợi
dụng DoS.

| Tiêu chí | Offset/limit | Cursor/keyset |
|---|---|---|
| Cú pháp | `?offset=40&limit=20` | `?before=<cursor>&limit=20` |
| Nhảy trang tuỳ ý | ✅ | ❌ (tuần tự) |
| Hiện "trang 3/10" | ✅ | ❌ |
| Offset lớn | ❌ chậm (DB quét bỏ) | ✅ ổn định |
| Insert/delete đồng thời | ❌ trùng/sót | ✅ tốt hơn |
| Infinite scroll | Được nhưng dễ lỗi | ✅ rất phù hợp |
| Sort ổn định | Không bắt buộc | ✅ bắt buộc tiebreaker |

Guestbook dùng infinite scroll → **cursor**. Repo đã dùng `before` trên `created_at` nhưng
thiếu tiebreaker khi nhiều bản ghi cùng timestamp; cách sửa ở `02` mục 8.

| Nhu cầu | Cách biểu diễn | Ghi chú |
|---|---|---|
| Lọc bằng bằng | `?guest_of=Cô%20dâu` | Đơn giản nhất |
| Lọc khoảng | `?created_at_from=...&created_at_to=...` | Tránh `>` trong query |
| Sắp xếp | `?sort=-created_at,sender_name` | `-` = giảm dần |
| Chọn field | `?fields=id,content` | Giảm payload |
| Tìm kiếm | `?q=hạnh phúc` | Cần index full-text |
| Quan hệ | `?include=photos` | Tránh N+1 phía client |

Nguyên tắc: **whitelist** mọi field được filter/sort; không cho client truyền tên cột tuỳ ý
vào query builder. Search khác filter: search xếp hạng độ liên quan. Đừng thêm `?q=` nếu chưa
có index — `ILIKE '%...%'` chạy được với 5000 dòng, nhưng là thảm họa với 100.000 dòng.

---

## 11. Versioning và compatibility

| Thay đổi | Phân loại | Ghi chú |
|---|---|---|
| Thêm field optional vào response | Non-breaking | Client cũ bỏ qua |
| Thêm endpoint | Non-breaking | |
| Thêm enum value | **Có thể breaking** | Client `switch` thiếu default sẽ lỗi |
| Đổi tên field | Breaking | |
| Đổi kiểu field | Breaking | |
| Bỏ field / đổi status code | Breaking | |
| Thêm validation chặt hơn | Breaking trên thực tế | Request cũ bị từ chối |
| Đổi ý nghĩa field | Breaking ngầm | Nguy hiểm nhất |

| Cách version | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| URL | `/api/v1/messages` | Rõ, dễ route/log | URL dài |
| Header | `Accept: application/vnd.wedding.v2+json` | URL sạch | Khó test bằng browser |
| Query | `?version=2` | Dễ thêm | Dễ quên, cache phức tạp |
| Không version | Chỉ additive | Ít bảo trì | Không xử lý breaking |

Dự án nhỏ: **URL versioning** thực dụng nhất. Chỉ tăng version khi thật sự breaking; đừng tạo
`/v2` cho một field mới.

**Deprecation:**

```http
Deprecation: Sun, 01 Mar 2027 00:00:00 GMT
Sunset: Sun, 01 Jun 2027 00:00:00 GMT
Link: <https://docs.example/migrate-v2>; rel="deprecation"; type="text/html"
```

Quy trình: thông báo → đo usage → hỗ trợ migrate → tắt. Không tắt đột ngột. Chi tiết ở `02`
mục 17. API có thể giữ contract trong khi schema đổi (expand → migrate → contract) — xem
`postgresql-advanced.md` mục 15.

---

## 12. Error handling

Một lỗi tốt có bốn tầng: HTTP status (hạ tầng/cache/SDK), `code` machine-readable (code
client), message (người dùng/dev), details (form validation).

```json
{
  "type": "https://wedding.example/errors/validation-failed",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Có 2 trường không hợp lệ.",
  "instance": "/api/v1/messages",
  "code": "validation_failed",
  "request_id": "req_01J9Z3K7",
  "errors": [
    { "field": "sender_name", "code": "too_small", "message": "Tối thiểu 1 ký tự" },
    { "field": "number_attend", "code": "too_big", "message": "Tối đa 10" }
  ]
}
```

| Field | Bắt buộc | Ý nghĩa |
|---|---|---|
| `type` | Nên | URI định danh loại lỗi (trang docs) |
| `title` | Có | Mô tả ngắn, ổn định theo loại lỗi |
| `status` | Có | Trùng HTTP status |
| `detail` | Nên | Chi tiết cho lần lỗi này |
| `instance` | Nên | Đường dẫn request |
| `code` | Khuyến nghị | Enum ổn định cho client |
| `request_id` | Khuyến nghị | Truy vết log |
| `errors[]` | Tuỳ | Lỗi theo field |

**Hiện trạng repo:** `{ "success": false, "error": "..." }` — không có `code`, không phân biệt
validation với lỗi DB, có nhánh update thiếu status nên mặc định `200`.

Hướng chuyển đổi không phá client: (1) thêm `code`, `request_id`, `errors`, **giữ** `error` và
`success`; (2) sửa status code; (3) sau khi frontend cập nhật, bỏ `success` ở version mới.

**Nguyên tắc:** không trả stack trace/SQL/tên bảng/message thô của Supabase; log đầy đủ ở
server với `request_id`, trả tối thiểu cho client; `4xx` có thể hướng dẫn sửa, `5xx` phải
trung tính; cùng loại lỗi phải cùng `code` ở mọi endpoint. Bảo mật của error (không lộ thông
tin, log injection) ở `api-security.md` mục 6 và 12.

---

## 13. AuthN và AuthZ ở mức overview

> Chỉ đủ để thiết kế endpoint. Triển khai, threat model, OWASP: xem
> [`../api-security.md`](../api-security.md) mục 3–4.

- **Authentication (AuthN):** bạn là ai → `401` nếu thiếu/sai, kèm `WWW-Authenticate`.
- **Authorization (AuthZ):** bạn được làm gì → `403` nếu không đủ quyền.

`404` đôi khi được dùng thay `403` để không lộ sự tồn tại của resource — quyết định thuộc
chính sách bảo mật.

| Cơ chế | Phù hợp | Lưu ý |
|---|---|---|
| Session cookie | Web có login | Cần CSRF protection |
| JWT Bearer | SPA, mobile, service | Không lưu secret trong JWT; có expiry |
| API key | Server-to-server | Không nhúng vào client public |
| OAuth 2.0 / OIDC | Login bên thứ ba | Dùng PKCE cho SPA/mobile |
| mTLS | Service-to-service | Vận hành phức tạp |

| Endpoint | Actor | Quy tắc |
|---|---|---|
| `GET /messages` | Public | Chỉ trả field công khai |
| `POST /messages` | Public | Rate limit, validate, chống spam |
| `PATCH /messages/{id}` | Owner hoặc admin | Owner chỉ sửa message của mình |
| `DELETE /messages/{id}` | Admin | Kiểm tra role ở server |
| `DELETE /messages` | Admin | Rất nguy hiểm, cần audit |

Nguyên tắc: **object-level authorization** — không chỉ kiểm tra "đã đăng nhập" mà kiểm tra
"người này có quyền trên object này không". Đây là lỗi BOLA/IDOR phổ biến nhất trong OWASP
API Top 10.

---

## 14. Caching, conditional request, rate limiting

| Directive | Ý nghĩa | Dùng khi |
|---|---|---|
| `public` | Cache dùng chung được | Dữ liệu công khai |
| `private` | Chỉ cache của client | Dữ liệu theo user |
| `no-store` | Không lưu ở đâu | Token, dữ liệu nhạy cảm |
| `no-cache` | Lưu nhưng phải revalidate | Dữ liệu cần tươi |
| `max-age=N` | Tươi N giây | TTL đơn giản |
| `s-maxage=N` | TTL cho CDN/shared cache | API public |
| `stale-while-revalidate=N` | Trả bản cũ, cập nhật nền | Chấp nhận hơi cũ |
| `must-revalidate` | Không dùng bản cũ khi hết hạn | Dữ liệu quan trọng |

Guestbook public có thể dùng `Cache-Control: public, max-age=30, stale-while-revalidate=60`.
Danh sách lời chúc không cần tươi từng giây, nhưng **đừng cache** response chứa dữ liệu cá
nhân hoặc token.

**ETag và conditional request:**

```text
1. Client: GET /api/v1/messages/1234
2. Server: 200 OK, ETag: "msg-1234-v3"
3. Client: GET /api/v1/messages/1234
           If-None-Match: "msg-1234-v3"
4. Server: 304 Not Modified (không body)
```

`304` tiết kiệm băng thông, giảm tải. `If-Match` dùng cho ghi: nếu ETag hiện tại khác →
`412 Precondition Failed` (optimistic locking, `02` mục 12).

**Rate limiting — khái niệm:**

| Thuật toán | Cách hoạt động | Ưu / Nhược |
|---|---|---|
| Fixed window | Đếm trong khoảng cố định | Đơn giản / burst ở biên |
| Sliding log | Lưu timestamp từng request | Chính xác / tốn bộ nhớ |
| Sliding counter | Nội suy giữa 2 window | Cân bằng / xấp xỉ |
| Token bucket | Nạp token, tiêu khi gọi | Cho burst / cần cấu hình |
| Leaky bucket | Hàng đợi chảy đều | Làm mượt / thêm latency |

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 60
RateLimit-Remaining: 0
RateLimit-Reset: 30
```

⚠️ Rate limit phải **chia sẻ state** khi nhiều instance (Redis). Nếu không, mỗi instance đếm
riêng và giới hạn thực tế nhân theo số instance. Triển khai ở `api-security.md` mục 7.

---

## 15. Async và long-running operations

Request không nên giữ kết nối quá lâu (gateway thường timeout 30–60s). Export CSV, gửi email
hàng loạt, xử lý ảnh có thể mất phút.

```http
POST /api/v1/exports
{ "format": "csv", "filter": { "will_attend": true } }
```

```http
HTTP/1.1 202 Accepted
Location: /api/v1/exports/export_01J9Z4
Retry-After: 2

{ "data": { "id": "export_01J9Z4", "status": "queued" } }
```

Client poll `GET /api/v1/exports/export_01J9Z4`:

```json
{
  "data": {
    "id": "export_01J9Z4",
    "status": "completed",
    "download_url": "https://storage.example/signed/...",
    "expires_at": "2026-10-25T10:30:00Z"
  }
}
```

| Status job | Ý nghĩa | HTTP khi GET |
|---|---|---|
| `queued` | Đã nhận, chưa chạy | `200` |
| `running` | Đang xử lý | `200`, kèm `progress` |
| `completed` | Xong, có kết quả | `200` |
| `failed` | Lỗi, có `error` | `200` |
| `cancelled` | Đã hủy | `200` |

⚠️ Lỗi của **job** không phải lỗi của **request GET**. GET vẫn `200` nếu job tồn tại; trạng
thái `failed` nằm trong body. Chỉ `404` khi job không tồn tại.

Nếu bên gọi là server đối tác, dùng webhook/callback thay vì polling (signature, retry,
idempotency — `02` mục 18). Nếu tác vụ < 1–2 giây, làm đồng bộ đơn giản hơn: async thêm
resource, thêm trạng thái, thêm chỗ hỏng.

---

## 16. API cho mobile và BFF

| Ràng buộc mobile | Ảnh hưởng thiết kế |
|---|---|
| Mạng chập chờn | Retry an toàn, idempotency, timeout hợp lý |
| Băng thông hạn chế | Payload nhỏ, nén, field selection |
| Pin | Ít request, ít polling, dùng push/WebSocket hợp lý |
| Version skew | Client cũ còn chạy khi server đã update |
| Latency cao | Ít round-trip, cache, prefetch |
| Background bị giới hạn | Không phụ thuộc job chạy nền trên client |

**BFF (Backend for Frontend)** là lớp backend riêng cho một loại client, gộp nhiều service
thành response phù hợp UI. Lợi: client không phải gọi 5 endpoint. Giá: thêm service phải
deploy, dễ lặp business logic.

Với `wedding-server`, BFF là **không cần** ở giai đoạn hiện tại. Nếu sau này có admin panel
riêng, thêm endpoint tổng hợp (`/api/v1/admin/dashboard`) thay vì dựng BFF đầy đủ.

💡 Phần tích hợp client cụ thể (auth, retry, offline, WebSocket) nằm trong
[`../mobile-integration.md`](../mobile-integration.md) — nối tiếp mục này thay vì lặp lại.

---

## 17. Case study thiết kế API guestbook

### 17.1 Yêu cầu

**Functional:** khách xem danh sách và cuộn vô hạn; gửi lời chúc kèm xác nhận tham dự; chủ
tiệc sửa/xóa lời chúc phản cảm; lời chúc mới hiện realtime.

**Non-functional:** 5000+ lời chúc, đọc nhiều hơn ghi; điện thoại 3G vẫn dùng được; không mất
lời chúc khi mạng chập chờn; chủ tiệc không rành kỹ thuật.

### 17.2 Resource

| Resource | Thuộc tính | Ghi chú |
|---|---|---|
| `message` | `id`, `sender_name`, `content`, `will_attend`, `guest_of`, `number_attend`, `created_at`, `updated_at` | Resource chính |
| `photo` (ví dụ mở rộng) | `id`, `message_id`, `url`, `status` | Gắn với message |
| `stats` | `total_messages`, `attending_guests` | Read-only, cache ngắn |

Quan hệ: `message` 1–n `photo`. Khách không có account → rate limit theo IP + `guest_token`
do client tạo để chống trùng.

### 17.3 Endpoint mục tiêu

| # | Method + path | Mục đích | Success |
|---|---|---|---|
| 1 | `GET /api/v1/messages?limit=20&before=...` | Danh sách, cursor | `200` |
| 2 | `POST /api/v1/messages` | Tạo lời chúc | `201` + `Location` |
| 3 | `GET /api/v1/messages/{id}` | Chi tiết | `200` |
| 4 | `PATCH /api/v1/messages/{id}` | Sửa một phần | `200` |
| 5 | `DELETE /api/v1/messages/{id}` | Xóa | `204` |
| 6 | `DELETE /api/v1/messages` | Xóa toàn bộ (admin) | `204` |
| 7 | `GET /api/v1/stats` | Thống kê | `200` |

So với repo: hiện có `GET/POST /api/messages`, `PUT/DELETE /api/messages/:id`,
`DELETE /api/messages`; chưa có `/v1`, `GET /messages/:id`, `PATCH`, `stats`. Bảng trên là
**thiết kế mục tiêu**, không phải mô tả code hiện tại.

### 17.4 Trade-off

| Quyết định | Vì sao | Cái giá |
|---|---|---|
| REST thay GraphQL | Resource đơn giản, cache tốt | Không linh hoạt field selection |
| Cursor pagination | Infinite scroll, dữ liệu tăng | Không nhảy trang |
| WebSocket cho realtime | Đẩy event ngay, UX tốt | Stateful, cần reconnect |
| Không login cho khách | Giảm ma sát | Phải chống spam bằng rate limit |
| `PATCH` thay `PUT` | Tránh ghi đè field không gửi | Cần định nghĩa merge rõ ràng |
| Soft delete (đề xuất) | Cứu dữ liệu xóa nhầm | Query phải lọc `deleted_at` |

**Khi scale:** 1 → 2 instance, WebSocket cần pub/sub vì `activeClients` là RAM cục bộ.
5000 → 500.000 lời chúc, cursor vẫn ổn nếu có index `(created_at, id)`. Nhiều region cần CDN
cho GET, POST phải về origin. Spam tăng cần rate limit + CAPTCHA.

---

## 18. Anti-patterns nền tảng

| ❌ Anti-pattern | Vì sao sai | ✅ Nên làm |
|---|---|---|
| `GET /getMessages` | Verb trong URL | `GET /messages` |
| `POST /messages/delete` | Lạm dụng POST | `DELETE /messages/{id}` |
| `200` + `{success:false}` | Hỏng cache/metric/retry | Status code đúng |
| Trả toàn bộ row DB | Lộ field, payload lớn | Chọn field, dùng DTO |
| `offset` cho feed | Chậm và trùng lặp | Cursor + tiebreaker |
| Không giới hạn `limit` | Client xin 1 triệu row | Max limit, mặc định nhỏ |
| `POST` không idempotent | Retry tạo trùng | Idempotency key |
| Không timeout dependency | Request treo, cạn connection | Timeout + circuit breaker |
| WebSocket cho CRUD | Mất status code, khó retry | REST ghi, WS event |
| Version mới fork code | Bảo trì gấp đôi | Compatibility có kiểm soát |
| Log nguyên body request | Lộ PII/secret | Log field đã lọc |
| Không kiểm tra `Content-Type` | Parse nhầm | `415` khi sai |
| `PATCH` không định nghĩa | Hành vi mơ hồ | Merge Patch hoặc JSON Patch |
| Dựa vào thứ tự field JSON | Không được đảm bảo | Dùng tên field |
| Lỗi khác nhau cho cùng case | Client không xử lý được | Error catalog thống nhất |

---

## 19. Bài tập và đáp án gợi ý

### Bài 1 — Phân loại thao tác

Xác định safe/idempotent: (a) xem danh sách, (b) gửi lời chúc, (c) sửa toàn bộ lời chúc,
(d) xóa lời chúc, (e) tăng `number_attend` thêm 1.

<details>
<summary>Đáp án gợi ý</summary>

| Thao tác | Safe | Idempotent | Ghi chú |
|---|---|---|---|
| (a) | ✅ | ✅ | Không đổi state |
| (b) | ❌ | ❌ | Cần idempotency key |
| (c) | ❌ | ✅ | PUT body đầy đủ |
| (d) | ❌ | ✅ | Lần 2 có thể `404`, state vẫn "đã xóa" |
| (e) | ❌ | ❌ | Là phép cộng, không phải "set" |

(e) là ví dụ kinh điển: `PATCH { "$inc": 1 }` không idempotent. Muốn idempotent, dùng giá trị
tuyệt đối hoặc version/If-Match.

</details>

### Bài 2 — Chọn status code

1. Tạo lời chúc thành công. 2. `sender_name` rỗng. 3. Chưa đăng nhập, gọi endpoint admin.
4. Đã đăng nhập nhưng không phải admin. 5. Xóa thành công, không body. 6. `If-Match` cũ.
7. Quá nhiều request.

<details>
<summary>Đáp án gợi ý</summary>

1. `201` + `Location`. 2. `422` (hoặc `400`, miễn nhất quán). 3. `401` + `WWW-Authenticate`.
4. `403`. 5. `204`. 6. `412`. 7. `429` + `Retry-After`.

</details>

### Bài 3 — Chống trùng

Khách bấm "Gửi" 3 lần vì mạng lag. Đảm bảo chỉ có 1 lời chúc.

<details>
<summary>Đáp án gợi ý</summary>

1. **Idempotency-Key**: UUID cho lần gửi; server lưu key + response, request sau trả response cũ.
2. **guest_token + unique index**: chặn trùng theo phiên, nhưng chặn cả trường hợp khách muốn
   gửi 2 lời chúc.
3. **Disable nút + retry**: cải thiện UX nhưng **không đủ**, network vẫn có thể gửi 2 request.

Production: (1) + (3). (2) chỉ dùng khi business rule là "một khách một lời chúc".

</details>

### Bài 4 — Phân trang

Vì sao `ORDER BY created_at DESC LIMIT 20` có thể làm mất bản ghi khi dùng cursor?

<details>
<summary>Đáp án gợi ý</summary>

`created_at` không unique. Nếu 5 bản ghi cùng timestamp và trang 1 cắt ngang nhóm đó, cursor
chỉ mang `created_at` sẽ bỏ qua phần còn lại (hoặc lặp). Cần tiebreaker:

```sql
ORDER BY created_at DESC, id DESC
WHERE (created_at, id) < (:cursor_created_at, :cursor_id)
```

Cursor phải mang cả hai giá trị. Đây là lỗi phổ biến khi seed hàng loạt với timestamp giống nhau.

</details>

---

## 20. Tài liệu tham khảo

- **Roy Fielding — Architectural Styles and the Design of Network-based Software Architectures**
  (chương 5): https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm
- **RFC 9110** — HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- **RFC 9111** — HTTP Caching: https://www.rfc-editor.org/rfc/rfc9111
- **RFC 9112 / 9113 / 9114** — HTTP/1.1, HTTP/2, HTTP/3
- **RFC 9457** — Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- **RFC 8594 / RFC 9745** — Sunset và Deprecation header
- **Richardson Maturity Model**:
  https://martinfowler.com/articles/richardsonMaturityModel.html
- **Microsoft REST API Guidelines**: https://github.com/microsoft/api-guidelines
- **Google API Design Guide**: https://cloud.google.com/apis/design
- **Zalando RESTful API Guidelines**: https://opensource.zalando.com/restful-api-guidelines/
- **MDN — HTTP**: https://developer.mozilla.org/en-US/docs/Web/HTTP
- **OWASP API Security Top 10**: https://owasp.org/API-Security/editions/2023/en/0x11-t10/

---

*Tiếp theo: [`02-rest-design.md`](./02-rest-design.md) — áp dụng vào thiết kế REST cụ thể, có
checklist review và case study guestbook hoàn chỉnh.*
