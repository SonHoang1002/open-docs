# RESTful API — Quy chuẩn thiết kế API chuẩn từ cơ bản đến nâng cao

> Tài liệu tổng hợp quy chuẩn tạo RESTful API chuẩn, rút gọn từ các nguồn权威:
> **Microsoft REST API Guidelines / Azure API Design Best Practices**,
> **Google API Improvement Proposals (AIP-121…193)**, **JSON:API v1.1**,
> **OpenAPI Specification 3.2**, **RFC 9110 (HTTP Semantics)**,
> **RFC 5789/7396/6902 (PATCH)**, **RFC 7807/9457 (Problem Details)**,
> **RFC 8288 (Web Links)**, **RFC 7234 (HTTP Caching)**.
> Kèm demo code chạy được: [`demo/restful-api`](../../demo/restful-api/README.md).

---

## Mục lục

1. [REST & Richardson Maturity Model](#1-rest--richardson-maturity-model)
2. [Nguyên tắc thiết kế cốt lõi](#2-nguyên-tắc-thiết-kế-cốt-lõi)
3. [Quy tắc đặt URI / Resource Naming](#3-quy-tắc-đặt-uri--resource-naming)
4. [HTTP Methods & semantics](#4-http-methods--semantics)
5. [HTTP Status Codes — bảng ánh xạ chuẩn](#5-http-status-codes--bảng-ánh-xạ-chuẩn)
6. [Pagination (phân trang)](#6-pagination-phân-trang)
7. [Filtering, Sorting, Field Selection](#7-filtering-sorting-field-selection)
8. [Cấu trúc Response & Envelope](#8-cấu-trúc-response--envelope)
9. [Error Handling — RFC 7807 & Google ErrorInfo](#9-error-handling--rfc-7807--google-errorinfo)
10. [Partial Update — PATCH (RFC 7396 / RFC 6902)](#10-partial-update--patch-rfc-7396--rfc-6902)
11. [Idempotency & Idempotency-Key](#11-idempotency--idempotency-key)
12. [Async Operations & Long-Running Operations](#12-async-operations--long-running-operations)
13. [Bulk / Batch Operations](#13-bulk--batch-operations)
14. [Versioning (định phiên bản API)](#14-versioning-định-phiên-bản-api)
15. [Content Negotiation & Media Types](#15-content-negotiation--media-types)
16. [Caching & Conditional Requests (ETag)](#16-caching--conditional-requests-etag)
17. [HATEOAS & Hypermedia](#17-hateoas--hypermedia)
18. [Rate Limiting Headers](#18-rate-limiting-headers)
19. [OpenAPI — Contract-first](#19-openapi--contract-first)
20. [So sánh các trường phái quy ước](#20-so-sánh-các-trường-phái-quy-ước)
21. [Anti-patterns thường gặp](#21-anti-patterns-thường-gặp)
22. [Checklist review API](#22-checklist-review-api)
23. [Demo code chạy được](#23-demo-code-chạy-được)
24. [Tài liệu tham khảo](#24-tài-liệu-tham-khảo)

---

## 1. REST & Richardson Maturity Model

**REST** (Representational State Transfer — Roy Fielding, 2000) là kiến trúc dựa trên:

| Đặc trưng | Ý nghĩa trong API |
|---|---|
| **Client–Server** | Tách biệt giao diện & dữ liệu; server không lưu session của client |
| **Stateless** | Mỗi request tự chứa đủ thông tin (token, header…); server không nhớ request trước |
| **Uniform Interface** | URI định danh tài nguyên, HTTP method thao tác, JSON/XML là representation |
| **Cacheability** | Response phải nói được cache được hay không (`Cache-Control`, `ETag`) |
| **Code on Demand** (tuỳ chọn) | Server có thể trả script/DSL cho client |
| **Layered System** | Client không biết server thật nằm sau bao nhiêu lớp (gateway, proxy…) |

### Richardson Maturity Model (RMM) — thang đo mức độ RESTful

```
Level 0 — "The Swamp"      : 1 URI, mọi thứ POST SOAP-style
Level 1 — Resources        : Nhiều URI (tài nguyên), vẫn POST mọi thứ
Level 2 — HTTP Verbs       : Dùng GET/POST/PUT/PATCH/DELETE đúng semantics  ← Đa số API tốt đạt Level 2
Level 3 — Hypermedia       : Response chứa links HATEOAS, client "khám phá" được API ← RESTful "thực sự"
```

> **Mục tiêu thực tế cho hầu hết dự án: đạt vững Level 2, hỗ trợ thêm ETag/links
> để gần Level 3.** Level 3 (HATEOAS đầy đủ) rất hiếm sản phẩm công khai đạt
> (GitHub API chỉ đạt khoảng 2+).

---

## 2. Nguyên tắc thiết kế cốt lõi

### 2.1 Design quanh Resource, không quanh CRUD/DB

- API mô hình hoá **thực thể nghiệp vụ** (order, customer, invoice…), **KHÔNG** mô
  phỏng bảng DB (`/tables/users`, `/db/orders`).
- **Noun, không verb**: `/orders` chứ không `/createOrder`, `/get-orders`.
- Hành động do **HTTP method** thể hiện, không nhét vào URI.

### 2.2 Platform independence & Loose coupling (Microsoft)

- **Platform independence**: client gọi được bất kể server viết bằng gì — dùng HTTP
  chuẩn + JSON + tài liệu rõ (OpenAPI).
- **Loose coupling**: client và server tiến hoá độc lập — chỉ dựa vào hợp đồng
  (contract), không đoán cấu trúc nội bộ.

### 2.3 Stateless request model

- Không lưu "giỏ hàng của session abc" ở RAM server giữa các request.
- Mọi ngữ cảnh nằm trong: **URI**, **headers** (Authorization, Idempotency-Key),
  **body**, hoặc **resource** đã lưu.
- Trạng thái phân trang giữ qua **cursor token** mã hoá trong token (không lưu server).

### 2.4 Least surprise — quán tính cộng đồng

Ưu tiên quy ước mà hầu hết developer đã biết:

- snake_case cho field JSON (Stripe, AWS) hoặc camelCase (Google, Microsoft) — **chọn 1 và thống nhất**.
- URL plural nouns: `/users`, `/orders`.
- Timestamp ISO 8601 UTC: `2026-10-21T11:00:00Z`.
- Id UUID/ULID ở public API (không sequential để tránh đoán/IDOR — xem [api-security.md](./api-security.md)).

### 2.5 API là tài sản dài hạn — thiết kế cho backward compatibility

- Thêm field vào response = thường không breaking (client bỏ unknown field).
- **Xoá/đổi tên field, đổi kiểu, đổi ý nghĩa = breaking** → cần version mới.
- Enum: chỉ **thêm** giá trị mới (client phải tolerate giá trị lạ), không xoá.

---

## 3. Quy tắc đặt URI / Resource Naming

### 3.1 Quy tắc tổng quát

| Quy tắc | ✅ Đúng | ❌ Sai |
|---|---|---|
| Noun số nhiều cho collection | `/orders`, `/customers` | `/order`, `/getOrders` |
| Verb nằm ở HTTP method | `DELETE /orders/123` | `/orders/delete/123` |
| Lowercase, tránh uppercase | `/user-profiles` | `/UserProfiles` |
| Phân tách bằng `-` (kebab-case) | `/order-items` | `/order_items` hoặc `/orderItems` (URL) |
| Item nằm dưới collection | `/orders/123` | `/orders?id=123` cho GET item |
| Collection/item/collection là tối đa | `/customers/5/orders` | `/customers/5/orders/99/products/3` (quá sâu) |
| Không trùng lặp khái niệm | 1 resource 1 URI | `/users/123` và `/user/123` cùng trả về user |

### 3.2 Hierarchical relationships (quan hệ cha–con)

```http
GET /customers/5/orders          # mọi order của customer 5   ✅ collection con
GET /orders/99/customer          # customer của order 99       ✅ (1 chiều)
GET /customers/5/orders/99       # 1 order của customer 5      ✅ item trong collection con
```

> **Microsoft khuyến nghị**: giữ URI đơn giản, đừng lồng quá 3 tầng.
> Sau khi có reference tới resource, dùng **link trong body** (HATEOAS) để điều
> hướng thay vì xây URI sâu.

### 3.3 Resource naming theo Google AIP-122

Google chuẩn hoá tên resource thành **resource name** dạng path:

```
publishers/123/books/les-miserables
users/vhugo1802
projects/my-project/topics/my-topic
```

Quy tắc AIP-122 rút gọn:

- Collection identifier: **số nhiều**, American English, `lowerCamelCase`
  (`userEvents` — nhưng HTTP path có thể viết `user-events`).
- Resource ID do user định dạng theo **RFC 1034**: `^[a-z]([a-z0-9-]{0,61}[a-z0-9])?$`.
- Field `name` trong body chứa **resource name đầy đủ** (`publishers/123/books/les-miserables`).
- Alias phổ biến được phép: `GET /users/me` = user đang đăng nhập.
- Full resource name (khi cần tham chiếu liên service):
  `//library.googleapis.com/publishers/123/books/les-miserables`.

### 3.4 Sub-resource vs Query parameter

| Muốn | Dùng |
|---|---|
| Tài nguyên con thực sự (có identity riêng) | Path: `/orders/99/items` |
| Lọc collection theo quan hệ | Query: `/orders?customer_id=5` |
| Thao tác trên quan hệ (không cần load item) | `/orders/99/items/5` hoặc custom: `/orders/99/items/5/cancel` |

### 3.5 Custom (non-CRUD) actions — dùng khi thật sự cần

Khi thao tác không map được vào CRUD chuẩn (approve, cancel, publish…):

```
# Cách 1 — verb trên item (Stripe-style): CHỈ dùng cho state transition thật
POST /invoices/in_123/send        ✅ chấp nhận được (Stripe làm vậy)
POST /invoices/in_123             { "status": "sent" }   ✅ REST-est (update state field)

# Cách 2 — Google AIP-136 custom method: colon + verb
POST /v1/publishers/123/books/les-miserables:archive
POST /projects/my-project:export

# ❌ Tránh: verb thay thế resource
POST /send-invoice
```

**Nguyên tắc chọn thứ tự (Google AIP-130):**

1. Standard methods (GET/CREATE/UPDATE/LIST/DELETE)
2. Standard batch/aggregate
3. Custom methods (`:verb` hoặc `POST /resource/action`)
4. Streaming — cuối cùng

---

## 4. HTTP Methods & semantics

### 4.1 Bảng method × collection/item (Microsoft)

| Resource | POST | GET | PUT | PATCH | DELETE |
|---|---|---|---|---|---|
| `/customers` | Tạo customer mới | List all | Bulk update (hiếm) | Bulk patch (hiếm) | Xoá all (cần guard) |
| `/customers/1` | Error/Action | Lấy 1 | Replace toàn bộ | Partial update | Xoá 1 |

### 4.2 Tính chất bắt buộc của từng method

| Method | Safe (không đổi state) | Idempotent (gọi N lần = 1 lần) | Response thành công |
|---|---|---|---|
| GET | ✅ | ✅ | 200 (+ body) |
| HEAD | ✅ | ✅ | 200 (chỉ headers) |
| OPTIONS | ✅ | ✅ | 204 (Allow header) |
| POST | ❌ | ❌ | 201 (+ Location) hoặc 200/202/204 |
| PUT | ❌ | ✅ | 200/201/204 |
| PATCH | ❌ | ❌* | 200/204 |
| DELETE | ❌ | ✅ | 204 (hoặc 200 nếu trả body xác nhận) |

\* PATCH mặc định không idempotent — nhưng **JSON Merge Patch với cùng payload thì thực tế idempotent**; có thể tuyên bố idempotent nếu thao tác là set-field.

### 4.3 GET — quy tắc

- **GET PHẢI an toàn** (safe): không side effect, không tạo resource, không ghi log nghiệp vụ kiểu "đã xem".
- GET KHÔNG có body theo quy ước phổ biến (RFC 9110 không cấm nhưng mọi
  proxy/client đều coi GET body là undefined) — truyền tham số qua **query string**.
- Response cache được nếu có thể: kèm `ETag`, `Cache-Control`.

```http
GET /v1/orders?status=open&limit=25&cursor=eyJpZCI6MTAwfQ== HTTP/1.1
Accept: application/json
```

### 4.4 POST — quy tắc

- POST **tạo resource trong collection** do URI chỉ định.
- **Server assign URI** cho resource mới; client không tự chọn URI (nếu client
  muốn assign → dùng `PUT /customers/{id}` và server tạo nếu chưa có).
- POST thành công tạo resource → **201 Created + header `Location: /v1/orders/123`**.
- POST không tạo resource (action, compute) → 200 với kết quả.

```http
POST /v1/orders HTTP/1.1
Content-Type: application/json
Idempotency-Key: 8f14e45f-ceea-467f-a1d5-93a1de20c3c1

{ "customer_id": "cus_5Kd9", "amount": 199000 }
```

```http
HTTP/1.1 201 Created
Location: /v1/orders/ord_9xQ2
Content-Type: application/json

{ "id": "ord_9xQ2", "status": "open", ... }
```

### 4.5 PUT vs PATCH

| | PUT | PATCH |
|---|---|---|
| Ý nghĩa | **Replace** toàn bộ resource bằng representation gửi lên | **Partial update** — chỉ field trong patch doc |
| Payload | Đủ field (field bắt buộc phải có) | Subset field |
| Idempotent | Bắt buộc | Tuỳ format (merge-patch thì "gần như") |
| Field không gửi | Bị xoá (null/reset) hoặc 400 (nếu required) | **Giữ nguyên** |
| Phù hợp | Resource nhỏ, client giữ bản full | Resource lớn, nhiều field, mobile |

### 4.6 DELETE — quy tắc

- Thành công → **204 No Content** (không cần body).
- Resource không tồn tại: **404** hoặc **204 idempotent** (cả hai chấp nhận — chọn 1 và document; khuyến nghị 404 để client biết).
- Resource lớn / cần audit → **soft delete** (flag `deleted_at`) hoặc async → **202 Accepted**.
- Bulk: `DELETE /v1/orders?ids=1,2,3` (cần validate chặt) hoặc batch endpoint.

### 4.7 HEAD, OPTIONS

```http
HEAD /v1/orders/123        # check tồn tại + headers (ETag, Content-Length) không tải body
OPTIONS /v1/orders         # CORS preflight; trả Allow: GET, POST
```

---

## 5. HTTP Status Codes — bảng ánh xạ chuẩn

### 5.1 2xx — Thành công

| Code | Khi nào dùng |
|---|---|
| **200 OK** | GET/PUT/PATCH/DELETE thành công, có body |
| **201 Created** | POST tạo resource — kèm `Location` |
| **202 Accepted** | Đã nhận, xử lý **asynchronous** — kèm link status (mục 12) |
| **204 No Content** | Thành công, **không có body** (DELETE, POST không trả gì) |
| **206 Partial Content** | Trả partial theo `Range` header |

### 5.2 3xx — Redirect / Conditional

| Code | Khi nào dùng |
|---|---|
| **301/308** | Redirect vĩnh viễn (308 giữ method) — dùng khi đổi URL |
| **302/307** | Redirect tạm (307 giữ method) |
| **304 Not Modified** | Conditional GET: `If-None-Match` khớp ETag → không trả body |
| **303 See Other** | Sau async hoàn tất → chỉ tới resource mới |

### 5.3 4xx — Lỗi phía Client (request sai)

| Code | Ý nghĩa | Ví dụ |
|---|---|---|
| **400 Bad Request** | Body/query sai cú pháp, validate fail | JSON hỏng, trường thiếu |
| **401 Unauthorized** | **Chưa xác thực** (sai/thiếu credential) | Thiếu `Authorization` |
| **403 Forbidden** | **Đã xác thực nhưng không có quyền** | User thường gọi admin endpoint |
| **404 Not Found** | Resource không tồn tại (hoặc không được phép biết → trả 404 thay 403) | `/orders/khong-ton-tai` |
| **405 Method Not Allowed** | Resource tồn tại nhưng không hỗ trợ method đó — kèm `Allow` | `DELETE /v1/products/1` khi chỉ cho GET |
| **406 Not Acceptable** | Không đáp ứng được `Accept` | Client đòi `application/xml` |
| **409 Conflict** | Conflict với trạng thái hiện tại | Tạo email trùng, version ETag lệch |
| **412 Precondition Failed** | `If-Match` không khớp (optimistic concurrency) | PATCH với ETag cũ |
| **413 Payload Too Large** | Body vượt giới hạn | Upload > 16MB |
| **415 Unsupported Media Type** | `Content-Type` không hỗ trợ | Gửi `text/xml` vào API JSON-only |
| **422 Unprocessable Entity** | Cú pháp OK nhưng **nghĩa nghiệp vụ không hợp lệ** (WebDAV/RFC 4918, Stripe/JSON:API ưa dùng) | Số dư không đủ, email sai định dạng |
| **428 Precondition Required** | Bắt buộc gửi `If-Match` để tránh lost update | |
| **429 Too Many Requests** | Vượt rate limit — kèm `Retry-After` | |

> **400 vs 422**: 400 = request **malformed** (JSON hỏng, sai kiểu);
> 422 = request hiểu được nhưng **dữ liệu không qua validate nghiệp vụ**.
> Nhiều API gộp cả hai vào 400 — cũng ổn, chỉ cần nhất quán.

### 5.4 5xx — Lỗi phía Server

| Code | Ý nghĩa |
|---|---|
| **500 Internal Server Error** | Exception không lường trước — **không lộ stack trace** |
| **501 Not Implemented** | Method chưa hỗ trợ |
| **503 Service Unavailable** | Maintenance/overload — kèm `Retry-After` |
| **504 Gateway Timeout** | Gateway hết thời gian chờ upstream |

### 5.5 Phân biệt 401 / 403 / 404 (rất hay nhầm)

```
401 Unauthorized  = "Tôi không biết bạn là ai"      → thiếu/sai token
403 Forbidden     = "Tôi biết bạn là ai, nhưng bạn không được phép"
404 Not Found     = "Không có gì ở đây"  (kể cả khi đúng ra là 403,
                   nhưng trả 403 sẽ tiết lộ resource của người khác tồn tại — IDOR,
                   xem [api-security.md](./api-security.md))
```

---

## 6. Pagination (phân trang)

> **Google AIP-158**: collection methods **PHẢI** pagination ngay từ đầu — thêm
> pagination sau là **breaking change** (code client cũ đang lấy hết sẽ đứt).

### 6.1 Các chiến lược

| Chiến lược | Cú pháp | Ưu | Nhược |
|---|---|---|---|
| **Offset/limit** | `?limit=25&offset=50` | Đơn giản, jump tới trang N | Skew khi data đổi giữa chừng; offset lớn chậm (DB scan) |
| **Cursor / keyset** | `?limit=25&cursor=xyz` | Ổn định, nhanh với data lớn | Không jump tự do; token opaque |
| **Page number** | `?page=3&per_page=25` | UI phân trang truyền thống | Giống offset, các vấn đề của offset |
| **Link-based (JSON:API)** | `links.next` trong response | Client chỉ cần follow link | Server generate link |

### 6.2 Cursor pagination (khuyến nghị cho API production)

```http
GET /v1/orders?limit=25 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: req_7f3a

{
  "data": [ "...25 items..." ],
  "pagination": {
    "limit": 25,
    "next_cursor": "eyJpZCI6Im9yZF85eFEyIiwibm9uY2UiOjF9",
    "has_more": true
  }
}
```

```http
GET /v1/orders?limit=25&cursor=eyJpZCI6Im9yZF85eFEyIiwibm9uY2UiOjF9
```

**Quy tắc cursor (Google AIP-158):**

- Token **opaque** — client KHÔNG parse được (base64 thuần chưa đủ; nên mã hoá/đóng gói state).
- `page_size`/`limit`: optional, server set default + max (vd 50, max 1000).
  Vượt max → **giảm xuống max** hoặc 400 — phải document.
- Hết collection → `next_page_token` rỗng / `has_more: false`.
- Cursor **không dùng để authorize** — vẫn check quyền trên request.

### 6.3 Offset pagination (chấp nhận được cho admin/UI nhỏ)

```http
GET /v1/orders?limit=25&offset=50
```

```json
{
  "data": [],
  "pagination": { "limit": 25, "offset": 50, "total": 1287 }
}
```

- Luôn kèm `total` (hoặc `total_estimate`) nếu dùng offset — client cần render số trang.
- **Giới hạn cứng `limit`** (vd max 100) chống DoS: `?limit=999999` → clamp hoặc 400.

### 6.4 Sorting khi paginated

```http
GET /v1/orders?sort=-created_at,id&limit=25
```

- Prefix `-` = descending (quy ước phổ biến, Google/Stripe).
- **LUÔN append `id` làm tie-breaker** — nếu sort theo field có giá trị trùng, cursor sẽ không ổn định.
- Cho phép sort whitelisted fields: `created_at`, `total`, `status` — không cho sort field nội bộ.

---

## 7. Filtering, Sorting, Field Selection

### 7.1 Filtering — query parameters

```http
GET /v1/orders?status=open&customer_id=cus_5Kd9&min_total=100000&created_after=2026-01-01
```

Quy ước:

| Loại filter | Ví dụ | Ghi chú |
|---|---|---|
| Equality | `?status=open` | |
| Multiple values | `?status_in=open,paid` | Document delimiter |
| Comparison | `?min_total=100000&max_total=500000` | |
| Range time | `?created_after=2026-01-01&created_before=2026-02-01` | ISO 8601 |
| Search | `?q=nguyen` | full-text, cần limit chặt |
| Nested field | `?customer.country=VN` (hoặc `filter[customer][country]=VN`) | |

- **Whitelist** các field được filter — reject field lạ với 400.
- Filter phức tạp → dùng DSL chuẩn: **RSQL/FIQL** (`?filter=status==open;total>10000`)
  hoặc **JSON:API** `?filter[status]=open`.

### 7.2 Sparse fieldsets / field selection (Google AIP-157)

```http
GET /v1/orders?fields=id,status,total
```

- Response chỉ chứa field được yêu cầu → giảm payload (đặc biệt hữu ích mobile).
- **Validate allowlist** `fields` — không cho client lấy field ẩn (password_hash…).
- JSON:API: `?fields[orders]=id,status`.

### 7.3 Partial responses với embeds (JSON:API `include`)

```http
GET /v1/orders/99?include=customer,items.product
```

```json
{
  "data": {
    "type": "orders", "id": "99",
    "attributes": {},
    "relationships": { "customer": { "data": { "type": "customers", "id": "5" } } }
  },
  "included": [
    { "type": "customers", "id": "5", "attributes": { "name": "Nguyen Van A" } }
  ]
}
```

---

## 8. Cấu trúc Response & Envelope

### 8.1 Resource đơn — trả thẳng object (Google/REST thuần)

```http
GET /v1/orders/ord_9xQ2 → 200
```

```json
{
  "id": "ord_9xQ2",
  "customer_id": "cus_5Kd9",
  "status": "open",
  "total": 199000,
  "created_at": "2026-10-21T10:15:00Z",
  "updated_at": "2026-10-21T10:15:00Z"
}
```

### 8.2 Collection — envelope với meta (phổ biến thực tế)

```http
GET /v1/orders → 200
```

```json
{
  "data": [],
  "pagination": { "limit": 25, "next_cursor": "...", "has_more": true },
  "meta": { "total_estimate": 1287 }
}
```

**Khi nào envelope?**

| Style | Ví dụ | Phù hợp |
|---|---|---|
| Trả thẳng | Google Cloud APIs | Đơn giản, mỗi endpoint 1 resource |
| Envelope `data` | JSON:API, Shopify | Cần meta/links thống nhất |
| Envelope + error chung | Stripe (`data` hoặc `error`) | |

### 8.3 Timestamp & ID chuẩn

```json
{
  "id": "ord_9xQ2",
  "created_at": "2026-10-21T10:15:00Z",
  "updated_at": "2026-10-21T10:15:00Z"
}
```

### 8.4 Metadata hữu ích trong headers

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-Id: req_7f3a9c2e
RateLimit-Limit: 120
RateLimit-Remaining: 117
ETag: "6a1b2c3d4e"
Last-Modified: Wed, 21 Oct 2026 10:15:00 GMT
```

---

## 9. Error Handling — RFC 7807 & Google ErrorInfo

### 9.1 RFC 7807 / RFC 9457 — Problem Details (chuẩn IETF)

Media type: `application/problem+json`

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json
```

```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Trường email không hợp lệ.",
  "instance": "/v1/orders",
  "errors": [
    { "field": "email", "code": "invalid_format", "message": "Phải là email hợp lệ" }
  ]
}
```

| Field | Ý nghĩa |
|---|---|
| `type` | URI định danh loại lỗi (stable — client code theo đây) |
| `title` | Tên ngắn, ít đổi |
| `status` | HTTP status (trùng với status line) |
| `detail` | Mô tả cụ thể của request này (không parse bằng code!) |
| `instance` | URI của request/instance lỗi |
| `errors` (extension) | Chi tiết từng field (tùy chọn, rất hữu ích) |

### 9.2 Google AIP-193 — ErrorInfo máy-đọc-được

```json
{
  "error": {
    "code": 429,
    "status": "RESOURCE_EXHAUSTED",
    "message": "Vượt quá rate limit 120 req/phút cho API key này.",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "RATE_LIMIT_EXCEEDED",
        "domain": "wedding-api.example.com",
        "metadata": { "retry_after_seconds": "30", "limit": "120", "window": "60s" }
      },
      {
        "@type": "type.googleapis.com/google.rpc.Help",
        "links": [
          { "description": "Tài liệu về rate limit", "url": "https://docs.example.com/rate-limits" }
        ]
      }
    ]
  }
}
```

Quy tắc quan trọng (AIP-193):

- **`reason` + `domain`** là identifier máy đọc được — client code xử lý theo `(reason, domain)`.
- Message phải **ngắn gọn, actionable**, không assume client biết nội bộ service.
- **Không bao giờ parse message bằng code** — dùng `reason`.
- Permission check **TRƯỚC** existence check (403 trước 404).

### 9.3 Quy tắc vàng khi trả lỗi

1. Luôn trả JSON (dù lỗi), content-type đúng (`application/problem+json` hoặc `application/json`).
2. **Không lộ stack trace / SQL / internal hostname** — 500 chung chung, log server-side.
3. `message` cho developer, có thể thêm `message_user` / `LocalizedMessage` cho end-user.
4. 429/503 kèm **`Retry-After`**.
5. Validation fail → list **tất cả** lỗi 1 lần (không fail-on-first) để client sửa nhanh.
6. Mọi response (kể cả lỗi) kèm **`X-Request-Id`** để support trace.

---

## 10. Partial Update — PATCH (RFC 7396 / RFC 6902)

### 10.1 JSON Merge Patch — RFC 7396 (đơn giản, phổ biến)

Media type: `application/merge-patch+json`

```http
PATCH /v1/orders/ord_9xQ2 HTTP/1.1
Content-Type: application/merge-patch+json

{ "status": "paid", "note": "Khách chuyển khoản" }
```

- Field có trong patch → **set** giá trị mới.
- Field không có → **giữ nguyên**.
- `"field": null` → **xoá field** (hoặc reset về default) — ⚠️ không dùng được nếu resource cần giá trị null hợp lệ.
- Merge patch **không xác định thứ tự** áp dụng.

### 10.2 JSON Patch — RFC 6902 (nhiều thao tác có thứ tự)

Media type: `application/json-patch+json`

```http
PATCH /v1/orders/ord_9xQ2 HTTP/1.1
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/status", "value": "paid" },
  { "op": "add", "path": "/tags/-", "value": "priority" },
  { "op": "test", "path": "/total", "value": 199000 },
  { "op": "remove", "path": "/note" }
]
```

| | Merge Patch (7396) | JSON Patch (6902) |
|---|---|---|
| Độ phức tạp | Thấp | Cao (ops có thứ tự) |
| `null` nghĩa | Xoá | Giá trị null hợp lệ? tuỳ |
| Atomic multi-op | Không đảm bảo thứ tự | ✅ có thứ tự, có `test` |
| Phù hợp | 90% trường hợp | Patch tinh vi, conflict check |

### 10.3 Response PATCH

```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "7f8e9d0a"

{ "id": "ord_9xQ2", "status": "paid" }
```

Hoặc 204 No Content nếu client không cần body lại.

---

## 11. Idempotency & Idempotency-Key

POST không idempotent theo chuẩn — nhưng **quy ước Idempotency-Key** (Stripe)
biến POST thành idempotent thực tế, chống double-charge khi retry:

```http
POST /v1/charges HTTP/1.1
Idempotency-Key: 2f4c9a81-10b7-4b1a-9c3d-5e6f7a8b9c0d

{ "amount": 199000, "currency": "vnd" }
```

**Cách server xử lý:**

1. Nhận key → tra cache/DB: key đã dùng chưa?
2. Chưa dùng → xử lý bình thường, **lưu response** (ít nhất status + body) kèm key, TTL 24h.
3. Đã dùng → trả lại **response đã lưu** (cùng status/body), không xử lý lại.
4. Đang xử lý (in-flight) → **409 Conflict** với key đang pending.

```
# Response lưu cache (Stripe-style)
{
  "id": "ch_1",
  "idempotent": true,          // hoặc header Idempotent-Replayed: true
  ...
}
```

**Quy tắc:**

- Key do **client sinh** (UUID), unique cho 1 nghiệp vụ (1 lần thanh toán).
- Nếu request **khác nhau** nhưng trùng key → **422 Unprocessable Entity**
  (`IDEMPOTENCY_KEY_REUSED`) — không được默默 trả response cũ.
- Kết hợp với retry policy: client retry cùng key là an toàn.

---

## 12. Async Operations & Long-Running Operations

### 12.1 Asynchronous Request-Reply (202 Accepted)

```http
POST /v1/exports HTTP/1.1

{ "type": "orders", "format": "csv" }
```

```http
HTTP/1.1 202 Accepted
Location: /v1/operations/op_12345
Retry-After: 5

{ "operation_id": "op_12345", "status": "pending" }
```

```http
GET /v1/operations/op_12345
```

```http
HTTP/1.1 200 OK

{
  "id": "op_12345",
  "status": "running",          // pending | running | succeeded | failed | cancelled
  "progress_percent": 40,
  "link": { "rel": "cancel", "method": "DELETE", "href": "/v1/operations/op_12345" }
}
```

Hoàn tất tạo resource → **303 See Other** với `Location` tới resource mới:

```http
HTTP/1.1 303 See Other
Location: /v1/exports/exp_9xQ2
```

### 12.2 Google AIP-151 — Long-Running Operations (LRO)

```
# Resource operation chung
GET /v1/operations/abc-123
DELETE /v1/operations/abc-123     # cancel

# Response chứa:
{
  "name": "operations/abc-123",
  "done": false,
  "metadata": { "@type": "...ExportMetadata", "progress_percent": 40 },
  "response": null,               // khi done=true
  "error": null                   // khi done=true và fail
}
```

### 12.3 Webhook push (thay polling)

Server có thể push kết quả qua webhook đã đăng ký (cần verify chữ ký — xem [api-security.md](./api-security.md) §13.3):

```json
POST https://client.example.com/webhooks
X-Signature: sha256=...

{ "id": "evt_1", "type": "export.completed", "data": { "export_id": "exp_9xQ2" } }
```

---

## 13. Bulk / Batch Operations

### 13.1 Bulk create

```http
POST /v1/orders/bulk HTTP/1.1
Content-Type: application/json

{ "requests": [ {...}, {...}, {...} ] }
```

```json
{
  "results": [
    { "status": 201, "body": { "id": "ord_1" } },
    { "status": 422, "body": { "error": { "code": "VALIDATION", "detail": "..." } } },
    { "status": 201, "body": { "id": "ord_3" } }
  ]
}
```

### 13.2 Batch GET (Google AIP-231)

```http
POST /v1/orders:batchGet HTTP/1.1
{ "names": ["orders/1", "orders/2", "orders/3"] }
```

### 13.3 Bulk update theo IDs trong collection

```http
PATCH /v1/orders HTTP/1.1
{ "ids": ["ord_1", "ord_2"], "patch": { "status": "cancelled" } }
```

**Lưu ý:**

- Bulk endpoints dễ bị **partial failure** — luôn trả kết quả **per-item**, không fail-all hay im lặng skip.
- Giới hạn độ lớn batch (vd ≤ 100 items) — trả 413 nếu vượt.
- Bulk DELETE cực kỳ nguy hiểm — bắt buộc confirm bằng explicit IDs, không wildcard.

---

## 14. Versioning (định phiên bản API)

### 14.1 Các chiến lược (Microsoft / Google AIP-184-185)

| Chiến lược | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| **URI path** | `/v1/orders`, `/v2/orders` | Rõ ràng, dễ cache, dễ gateway route | Phức tạp HATEOAS (link phải kèm version); nhiều version = nhiều route |
| **Query param** | `/orders?api-version=2026-01-01` | Cùng URI, dễ migrate | Cache key phức tạp; dễ quên truyền |
| **Header** | `X-Api-Version: 2` hoặc `Accept: application/vnd.app.v2+json` | Sạch URL | Khó thử bằng browser; cache cần vary header |
| **Media type** | `Accept: application/vnd.contoso.v1+json` | REST-est, hợp HATEOAS | Phức tạp nhất, ít tool support |
| **Date-based** (Azure/Google IBV) | `?api-version=2026-04-01` | Không breaking từng tháng; preview `YYYY-MM-DD-preview` | Client phải set pin date |

### 14.2 Khuyến nghị thực tế

```
Public API     : URI path versioning  /v1, /v2     → phổ biến nhất (Stripe, Google, GitHub)
Azure-style    : query ?api-version=YYYY-MM-DD      → phù hợp API lớn cần preview lane
Internal micro : không version, additive changes    → tin vào backward compat discipline
```

**Google (AIP-185):**

- Chỉ dùng **major version**: `v1`, `v1beta`, `v1alpha` — không `v1.0`, `v1.1`.
- Channel-based: `v1alpha` ⊇ `v1beta` ⊇ `v1` (stable).
- Breaking change → major version mới; **major cũ vẫn chạy song song** một thời gian chuyển đổi hợp lý.
- Deprecated functionality không được "graduate" lên channel cao hơn.

### 14.3 Sunset / Deprecation headers

```http
HTTP/1.1 200 OK
Deprecation: Sat, 01 Jan 2027 00:00:00 GMT
Sunset: Sat, 01 Jul 2027 00:00:00 GMT
Link: <https://docs.example.com/migrate-v2>; rel="successor-version"
```

---

## 15. Content Negotiation & Media Types

### 15.1 Accept / Content-Type

```http
GET /v1/orders/1 HTTP/1.1
Accept: application/json
```

```http
POST /v1/orders HTTP/1.1
Content-Type: application/json; charset=utf-8
```

- Không match `Accept` → **406 Not Acceptable**.
- Không hiểu `Content-Type` → **415 Unsupported Media Type**.
- API JSON-only: nên set middleware **chặn Content-Type lạ** ngay từ đầu.

### 15.2 Media types tùy biến (vendor)

```
application/vnd.myapp.order+json          # representation chung
application/vnd.myapp.order.v2+json       # kèm version
application/merge-patch+json              # RFC 7396
application/json-patch+json               # RFC 6902
application/problem+json                  # RFC 7807
application/vnd.api+json                  # JSON:API
```

---

## 16. Caching & Conditional Requests (ETag)

### 16.1 ETag workflow

```http
GET /v1/orders/ord_9xQ2

HTTP/1.1 200 OK
ETag: "6a1b2c3d4e"
Cache-Control: private, max-age=60
```

```http
GET /v1/orders/ord_9xQ2
If-None-Match: "6a1b2c3d4e"

HTTP/1.1 304 Not Modified
ETag: "6a1b2c3d4e"
```

### 16.2 Optimistic concurrency với If-Match

```http
PATCH /v1/orders/ord_9xQ2
If-Match: "6a1b2c3d4e"
Content-Type: application/merge-patch+json

{ "status": "paid" }
```

```http
# ETag đã đổi (người khác sửa trước) → lost update bị chặn
HTTP/1.1 412 Precondition Failed
```

- ETag nên là **hash của content hoặc version counter** — không dùng timestamp thuần (độ phân giải thấp).
- Strong ETag (`"abc"`) = byte-identical; Weak ETag (`W/"abc"`) = semantic equivalent.

### 16.3 Cache-Control cho API

```
Cache-Control: no-store              # response chứa dữ liệu cá nhân — không cache
Cache-Control: private, max-age=60   # cache ở client, TTL 60s
Cache-Control: public, max-age=3600  # data public (danh mục, danh mục sp)
Vary: Accept, Authorization          # cache key phụ thuộc header này
```

---

## 17. HATEOAS & Hypermedia

Response chứa links để client **khám phá** capability mà không hardcode URI:

```json
GET /v1/orders/ord_9xQ2 → 200

{
  "id": "ord_9xQ2",
  "status": "open",
  "total": 199000,
  "links": [
    { "rel": "self",     "href": "/v1/orders/ord_9xQ2", "method": "GET" },
    { "rel": "customer", "href": "/v1/customers/cus_5Kd9", "method": "GET" },
    { "rel": "items",    "href": "/v1/orders/ord_9xQ2/items", "method": "GET" },
    { "rel": "pay",      "href": "/v1/orders/ord_9xQ2/pay", "method": "POST" },
    { "rel": "cancel",   "href": "/v1/orders/ord_9xQ2/cancel", "method": "POST" }
  ]
}
```

- Links đổi theo **state** của resource (order đã paid thì không còn link `pay`).
- JSON:API chuẩn hoá qua `links` + `relationships`.
- **RMM Level 3** yêu cầu client không biết trước endpoint nào tồn tại — rất hiếm làm đủ; practical: thêm links như trên mà không bắt client dùng.

---

## 18. Rate Limiting Headers

Draft IETF RateLimit Headers (đang phổ biến thực tế, Stripe/GitHub dùng):

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 120
RateLimit-Remaining: 0
RateLimit-Reset: 1730000030          # epoch khi window reset
```

```http
HTTP/1.1 200 OK
RateLimit-Limit: 120
RateLimit-Remaining: 117
RateLimit-Reset: 1730000030
```

Chi tiết chiến lược rate limit (token bucket, sliding window…): xem [api-security.md](./api-security.md) §7.

---

## 19. OpenAPI — Contract-first

### 19.1 Nguyên tắc Contract-first

```
1. Thiết kế OpenAPI spec TRƯỚC (paths, schemas, status codes)
2. Review spec với consumer (frontend, mobile, đối tác)
3. Generate: mock server, client SDK, docs
4. Implement server theo spec
5. CI: contract testing (schemathesis, Dredd, Pact)
```

### 19.2 Cấu trúc OpenAPI 3.x tối thiểu

```yaml
openapi: 3.1.0
info:
  title: Wedding Guestbook API
  version: 1.0.0
servers:
  - url: http://localhost:3000/v1
paths:
  /orders:
    get:
      operationId: listOrders
      summary: Liệt kê orders
      parameters:
        - name: limit
          in: query
          schema: { type: integer, default: 25, maximum: 100 }
        - name: cursor
          in: query
          schema: { type: string }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema: { $ref: "#/components/schemas/OrderList" }
        "400": { $ref: "#/components/responses/BadRequest" }
components:
  schemas:
    Order:
      type: object
      required: [id, status, total]
      properties:
        id: { type: string }
        status: { type: string, enum: [open, paid, cancelled] }
        total: { type: integer }
```

### 19.3 Công cụ

| Công cụ | Dùng cho |
|---|---|
| **Swagger UI / Redoc** | Render docs từ OpenAPI |
| **openapi-generator** | Generate client SDK (TS, Swift, Kotlin…) |
| **schemathesis** | Fuzz test theo spec |
| **prism** | Mock server từ spec |
| **zod-to-openapi / zodios** | Sync schema code ↔ spec (TypeScript) |

---

## 20. So sánh các trường phái quy ước

| Khía cạnh | Microsoft | Google (AIP) | Stripe | JSON:API |
|---|---|---|---|---|
| Field naming | camelCase | snake_case | snake_case | camelCase hoặc snake |
| ID | int/uuid | resource name path | prefixed (`ord_`, `cus_`) | string |
| Version | URI `/v1` hoặc date query | `/v1`, `/v1beta` | Header `Stripe-Version` | — |
| List response | array hoặc envelope | `{ books: [], next_page_token }` | `{ data: [], has_more }` | `{ data: [], links: {} }` |
| Error | RFC 7807 | `{ error: { code, status, details[] } }` | `{ error: { type, message, param } }` | `{ errors: [] }` |
| Pagination | limit/offset | **cursor** (`page_token`) | cursor (`starting_after`) | link-based |
| Custom action | POST verb | `:verb` colon | POST `resource/action` | — |
| PATCH | merge/patch | updateMask | merge-patch | atomic ops extension |

> **Quan trọng nhất không phải chọn trường phái nào — mà là NHẤT QUÁN trong toàn bộ API.**

---

## 21. Anti-patterns thường gặp

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| `/getOrders`, `/create-order`, `/orders/delete/1` | `GET /orders`, `POST /orders`, `DELETE /orders/{id}` |
| Trả `200` cho mọi thứ kể cả lỗi | Đúng status: 201/204/400/404/409/422 |
| GET `/orders?id=123` để lấy 1 item | `GET /orders/123` |
| Lồng path 5+ tầng `/a/1/b/2/c/3/d/4/e/5` | Tối đa collection/item/collection + link |
| Trả `403` khi resource của người khác tồn tại | Trả `404` (chống IDOR) |
| Trả raw exception message / stack trace | 500 chung chung + log server + X-Request-Id |
| Collection không pagination | Cursor/offset ngay từ API v1 (thêm sau = breaking) |
| POST không Idempotency-Key cho payment | Idempotency-Key header |
| Đổi response schema mid-version | Additive only; breaking → version mới |
| `limit=999999` được chấp nhận | Clamp max hoặc 400 |
| PUT body thiếu field → server null hoá | Validate required; hoặc dùng PATCH |
| 401 vs 403 xáo trộn | 401 = chưa đăng nhập; 403 = thiếu quyền |
| `/v1.4.2/orders` patch version trong URI | Chỉ major: `/v1` (hoặc date query) |
| Trả ETag nhưng không implement If-None-Match | Hoặc bỏ ETag, hoặc làm conditional GET đầy đủ |
| Bulk endpoint fail-all im lặng | Per-item result, giới hạn size |
| Filter/sort field tùy ý client → SQL injection / full scan | Whitelist + validate |

---

## 22. Checklist review API

```markdown
### URI & Naming
- [ ] Noun số nhiều, kebab-case, không verb trong URI
- [ ] Không lồng quá collection/item/collection
- [ ] ID không sequential đoán được (UUID/ULID/prefixed)

### Methods & Status codes
- [ ] GET safe + idempotent, không side effect
- [ ] POST tạo → 201 + Location
- [ ] DELETE → 204 (hoặc 404 nếu không tồn tại)
- [ ] 401/403/404 dùng đúng ngữ nghĩa
- [ ] 405 kèm Allow header
- [ ] 415/406 cho Content-Type/Accept không hỗ trợ

### Data & Validation
- [ ] Validate body/query/params (Zod/JSON Schema) — reject 400/422 kèm field errors
- [ ] Whitelist field cho filter/sort/fields (chống over-fetch & injection)
- [ ] Giới hạn limit (max) chống DoS
- [ ] Timestamp ISO 8601 UTC

### Pagination & Filtering
- [ ] List methods có pagination từ đầu
- [ ] Cursor token opaque
- [ ] Sort có tie-breaker (id)

### Errors
- [ ] Format thống nhất (RFC 7807 hoặc Google ErrorInfo)
- [ ] reason/machine-readable code ổn định
- [ ] Không lộ internal (stack, SQL)
- [ ] 429/503 có Retry-After
- [ ] Mọi response có X-Request-Id

### Concurrency & Caching
- [ ] ETag + If-None-Match cho resource đọc nhiều
- [ ] If-Match cho update nhạy cảm (optimistic lock)
- [ ] Cache-Control đúng cho data private/public

### Versioning & Lifecycle
- [ ] Version strategy thống nhất
- [ ] Additive changes trong major version
- [ ] Deprecation plan + headers

### Contract & Docs
- [ ] OpenAPI spec đầy đủ, là nguồn sự thật
- [ ] Contract test trong CI
- [ ] Idempotency-Key cho payment/create quan trọng

### Security (chi tiết → api-security.md)
- [ ] Authn/Authz per route × method
- [ ] Rate limit
- [ ] Input validation, size limits
- [ ] CORS allowlist
```

---

## 23. Demo code chạy được

Xem [`demo/restful-api`](../../demo/restful-api/README.md) — API Express + TypeScript
minh hoạ đầy đủ quy ước trên:

- CRUD `/v1/products` với status codes đúng (201+Location, 204, 404, 409…)
- Cursor pagination + filter + sort whitelist
- Validation Zod → 400 kèm `errors[]`
- RFC 7807 `application/problem+json`
- ETag + If-None-Match + If-Match (optimistic concurrency)
- Idempotency-Key cho POST create
- OpenAPI served tại `/v1/openapi.json` + Swagger UI tại `/docs`

```bash
cd demo/restful-api
npm install
npm start
# mở http://localhost:3000/docs
```

---

## 24. Tài liệu tham khảo

**Chính quyên / chuẩn:**

- **Microsoft Azure — Web API Design Best Practices**: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
- **Microsoft REST API Guidelines (GitHub)**: https://github.com/microsoft/api-guidelines
- **Google API Improvement Proposals**: https://google.aip.dev (đặc biệt AIP-121, 122, 130-136, 157, 158, 185, 193)
- **JSON:API v1.1 Specification**: https://jsonapi.org/format/
- **OpenAPI Specification 3.2**: https://spec.openapis.org/oas/latest.html
- **RFC 9110 — HTTP Semantics**: https://www.rfc-editor.org/rfc/rfc9110
- **RFC 7807 / 9457 — Problem Details**: https://www.rfc-editor.org/rfc/rfc9457
- **RFC 7396 — JSON Merge Patch**: https://www.rfc-editor.org/rfc/rfc7396
- **RFC 6902 — JSON Patch**: https://www.rfc-editor.org/rfc/rfc6902
- **RFC 5789 — PATCH Method for HTTP**: https://www.rfc-editor.org/rfc/rfc5789
- **RFC 8288 — Web Linking (HATEOAS)**: https://www.rfc-editor.org/rfc/rfc8288
- **RFC 6582 — The Safe and Fast Method**: https://www.rfc-editor.org/rfc/rfc6582 (idempotency key history)

**Tham khảo thực tế:**

- **Stripe API Reference**: https://docs.stripe.com/api
- **GitHub REST API docs**: https://docs.github.com/en/rest
- **Shopify REST Admin API**: https://shopify.dev/docs/api/admin-rest
- **Heroku API Design Guide** (lịch sử): https://github.com/heroku/api-guidelines

**Liên quan trong repo:**

- [api-security.md](./api-security.md) — bảo mật API (OWASP Top 10, auth, rate limit)
- [websocket.md](../realtime/websocket.md) — realtime song song với REST
- [ffmpeg.md](../media/ffmpeg.md) — xử lý media qua API upload

---

*Tài liệu tạo 21/10/2026 — tổng hợp từ Microsoft API Guidelines, Google AIPs, JSON:API, OpenAPI Spec, các RFC của IETF. Demo: [`demo/restful-api`](../../demo/restful-api/README.md).*
