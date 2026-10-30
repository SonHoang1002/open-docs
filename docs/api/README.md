# Bộ tài liệu thiết kế API — Hub trung lập từ nền tảng đến thực chiến

> Hub của bộ tài liệu thiết kế API trung lập, tập trung vào **contract**, **REST**, **OpenAPI** và **vận hành**. 
> Mục tiêu: giúp bạn thiết kế API để người khác dùng được, dễ mở rộng, dễ bảo trì và ít phá vỡ client sau này.
> Bảo mật được tách riêng tại [`../api-security.md`](../api-security.md).

---

## Mục lục

- [1. Bộ tài liệu này giải quyết vấn đề gì?](#1-bộ-tài-liệu-này-giải-quyết-vấn-đề-gì)
- [2. Đối tượng độc giả](#2-đối-tượng-độc-giả)
- [3. Cách dùng bộ tài liệu](#3-cách-dùng-bộ-tài-liệu)
- [4. Bản đồ tài liệu](#4-bản-đồ-tài-liệu)
- [5. Lộ trình học 4 tuần](#5-lộ-trình-học-4-tuần)
- [6. Lộ trình áp dụng cho team đang vận hành](#6-lộ-trình-áp-dụng-cho-team-đang-vận-hành)
- [7. Quy ước chung trong bộ tài liệu](#7-quy-ước-chung-trong-bộ-tài-liệu)
- [8. Quick start — 5 bước thiết kế một API mới](#8-quick-start--5-bước-thiết-kế-một-api-mới)
- [9. Definition of Done (DoD) cho một API](#9-definition-of-done-dod-cho-một-api)
- [10. Bảng tra cứu nhanh theo tình huống](#10-bảng-tra-cứu-nhanh-theo-tình-huống)
- [11. Bảng tra cứu chủ đề cốt lõi](#11-bảng-tra-cứu-chủ-đề-cốt-lõi)
- [12. Mẹo review nhanh](#12-mẹo-review-nhanh)
- [13. Đóng góp và cập nhật tài liệu](#13-đóng-góp-và-cập-nhật-tài-liệu)
- [14. Tài liệu tham khảo](#14-tài-liệu-tham-khảo)

---

## 1. Bộ tài liệu này giải quyết vấn đề gì?

Hầu hết API "chạy được" đều mắc một nhóm lỗi lặp đi lặp lại. Bộ tài liệu này cung cấp **quy trình, tiêu chí quyết định và checklist** để tránh chúng.

| Triệu chứng | Nguyên nhân gốc | Hậu quả | Cách khắc phục trong bộ tài liệu |
|---|---|---|---|
| Frontend phải đoán field nào bắt buộc/tùy chọn | Không có contract rõ ràng | Sửa backend làm vỡ client, mất thời gian sync | [`01-fundamentals.md`](./01-fundamentals.md) (Contract), [`03-openapi.md`](./03-openapi.md) (Spec) |
| `POST` tạo trùng khi mạng chập chờn/timeout | Không có cơ chế idempotency | Dữ liệu trùng, khó đối soát, khó khôi phục | [`01-fundamentals.md`](./01-fundamentals.md) §5, [`02-rest-design.md`](./02-rest-design.md) §11 |
| Hai người sửa cùng lúc ghi đè lẫn nhau | Không có optimistic/pessimistic locking | Mất dữ liệu âm thầm, không báo lỗi | [`01-fundamentals.md`](./01-fundamentals.md) §11, [`02-rest-design.md`](./02-rest-design.md) §12 |
| Phân trang `offset` ngày càng chậm, mất/trùng item | Dùng offset không có tiebreaker, sort không ổn định | UX kém, dữ liệu sai khi có insert/delete | [`01-fundamentals.md`](./01-fundamentals.md) §10, [`02-rest-design.md`](./02-rest-design.md) §8 |
| Mỗi endpoint trả lỗi một kiểu | Thiếu error catalog và chuẩn hóa | Client phải viết nhiều nhánh xử lý, khó debug | [`01-fundamentals.md`](./01-fundamentals.md) §12, [`02-rest-design.md`](./02-rest-design.md) §9 |
| Thay đổi nhỏ làm vỡ hàng loạt client cũ | Thiếu chiến lược compatibility/versioning | Phải hỗ trợ nhiều phiên bản, chi phí bảo trì tăng gấp đôi | [`01-fundamentals.md`](./01-fundamentals.md) §11, [`02-rest-design.md`](./02-rest-design.md) §17 |
| Cache sai gây rò rỉ dữ liệu hoặc trả dữ liệu cũ nhầm | Không hiểu conditional request/Vary | Bảo mật kém hoặc UX tồi | [`01-fundamentals.md`](./01-fundamentals.md) §14, [`02-rest-design.md`](./02-rest-design.md) §15 |
| API khó mở rộng nhưng không biết bắt đầu từ đâu | Thiếu quy trình thiết kế có hệ thống | Thiết kế ngẫu hứng, tranh cãi không có tiêu chí | [`02-rest-design.md`](./02-rest-design.md) §1 |

> **Lưu ý:** Các ví dụ trong bộ tài liệu dùng domain thương mại điện tử trung lập: `customers`, `products`, `orders`, `order_items`, `payments`, `shipments`. ID có thể là số nguyên, UUID hoặc ULID. Tiền dùng integer minor units (ví dụ cents). Thời gian theo RFC 3339 UTC.

---

## 2. Đối tượng độc giả

| Vai trò | Đọc trước | Mục tiêu |
|---|---|---|
| **Người mới học backend** | [`01-fundamentals.md`](./01-fundamentals.md) | Hiểu API là contract, không phải "gọi hàm từ xa". Nắm HTTP, resource, idempotency, lỗi cơ bản. |
| **Backend engineer** | `01` → `02` → `03` → [`../api-security.md`](../api-security.md) | Thiết kế endpoint đúng từ đầu, có pagination/idempotency/locking, viết spec OpenAPI, chuẩn bị vận hành. |
| **Frontend/Mobile engineer** | `01` §§9–12,14; `02` §§3–12; `03` §§3–6 | Đọc contract nhanh, xử lý lỗi đúng, dùng phân trang/cursor, gửi header đúng, xử lý retry an toàn. |
| **Tech Lead/Reviewer** | `02` §§1,9,20–22; README §§9,12; `03` §§11–12 | Dùng checklist review thống nhất, phát hiện breaking change sớm, đánh giá trade-off. |
| **Người viết tài liệu API/SDK** | README §§7,13; `03` toàn bộ | Viết spec nhất quán, dễ sinh client, tránh drift giữa code và docs. |
| **QA/Automation** | `02` §20; `03` §§12,16 | Xây dựng test matrix, contract testing, property-based testing từ OpenAPI. |

Không yêu cầu kiến thức GraphQL/gRPC. Kiến thức SQL cơ bản là đủ cho các ví dụ.

---

## 3. Cách dùng bộ tài liệu

1. **Học tuần tự** – Theo [lộ trình 4 tuần](#5-lộ-trình-học-4-tuần) nếu học từ đầu.
2. **Giải quyết vấn đề cụ thể** – Dùng [bảng tra cứu nhanh](#10-bảng-tra-cứu-nhanh-theo-tình-huống) để đến đúng mục ngay.
3. **Review PR** – Dùng [Definition of Done](#9-definition-of-done-dod-cho-một-api) + checklist trong [`02-rest-design.md`](./02-rest-design.md) §22.
4. **Viết spec API** – Đọc [`02-rest-design.md`](./02-rest-design.md) §§1–10 trước, rồi đến [`03-openapi.md`](./03-openapi.md).
5. **Đánh giá thiết kế** – Luôn hỏi: *"Nên trong bối cảnh nào?"*. Mọi quy tắc đều là đánh đổi, không phải luật bất di bất dịch.

> 💡 **Mẹo:** Mỗi mục trong tài liệu đều có thể đọc độc lập và có link chéo để tránh lặp lại nội dung.

---

## 4. Bản đồ tài liệu

### 4.1 Chuỗi chính

| # | Tài liệu | Nội dung cốt lõi | Trạng thái |
|---|---|---|---|
| 01 | [`01-fundamentals.md`](./01-fundamentals.md) | Contract, kiến trúc phân tán, phân loại API (REST/RPC/GraphQL/gRPC/WebSocket/Webhook), HTTP deep dive, idempotency/safety, resource modeling, Richardson Maturity Model, pagination/filter/sort, versioning/compatibility, error handling, caching, async/long-running, BFF, case study thiết kế API trung lập, anti-patterns nền tảng. | Có sẵn |
| 02 | [`02-rest-design.md`](./02-rest-design.md) | Quy trình 10 bước thiết kế, naming, method/status, PATCH (Merge Patch vs JSON Patch), header/query, pagination (offset vs cursor + tiebreaker), error catalog RFC 9457, validation, idempotency-key, optimistic locking, file upload, authN/authZ ở endpoint, caching, rate limiting, versioning/deprecation, webhook, case study hoàn chỉnh, test matrix, anti-patterns, checklist review. | Có sẵn |
| 03 | [`03-openapi.md`](./03-openapi.md) | Contract-first, OpenAPI 3.1 vs 3.0, cấu trúc, paths/operations, parameters/serialization, request/response, JSON Schema 2020-12, security schemes, components, tooling/codegen, quy trình viết spec, contract testing & CI, ví dụ hoàn chỉnh, từ spec đến code, anti-patterns, checklist. | Có sẵn |
| 04 | [`04-lifecycle-process.md`](./04-lifecycle-process.md) | Vòng đời API: đề xuất → review → release → deprecation → ngừng hỗ trợ. Quy trình change management, breaking/non-breaking, changelog, rollout. | Có sẵn |
| 05 | [`05-project-structure.md`](./05-project-structure.md) | Cấu trúc dự án API, layering (route/controller/service/repo), module hoá, error handling, config, validation, testing. | Có sẵn |
| 06 | [`06-testing-observability.md`](./06-testing-observability.md) | Test theo rủi ro, unit/integration/contract/e2e, property-based, đo tải, logging có request-id, metrics, tracing, health/readiness/liveness. | Có sẵn |
| 07 | [`07-checklists-templates.md`](./07-checklists-templates.md) | Checklist review PR, template API spec, template PR description, template runbook, template deprecation notice. | Có sẵn |

> **Spec mẫu:** [`openapi.yaml`](./openapi.yaml) — có thể mở bằng Swagger UI/Redoc/Scalar hoặc dùng để sinh client/types.

### 4.2 Tài liệu chuyên đề liên quan

| Tài liệu | Khi nào đọc | Ghi chú |
|---|---|---|
| [`../api-security.md`](../api-security.md) | Trước khi đưa endpoint ra public hoặc khi thêm auth/rate limit/upload | Nguồn duy nhất về authN/authZ, OWASP API Top 10, headers bảo mật, secrets, SSRF, file upload an toàn. |
| [`../websocket.md`](../websocket.md) | Khi thiết kế realtime (event push hai chiều) | Handshake, frame, reconnect/backoff, pub/sub, scale nhiều instance, authentication/authorization. |
| [`../postgresql-basics.md`](../postgresql-basics.md) | Khi viết query cho endpoint CRUD | Kiểu dữ liệu, index cơ bản, NULL, transaction, query an toàn. |
| [`../postgresql-advanced.md`](../postgresql-advanced.md) | Khi query chậm, cần khóa, migration phức tạp | Execution plan, MVCC, locking, index nâng cao, partition, RLS, zero-downtime migration. |
| [`../mobile-integration.md`](../mobile-integration.md) | Khi tích hợp API với mobile app | Retry/idempotency, offline, auth, network chập chờn, deep link, push. |

**Phân tách trách nhiệm:** `01` trả lời *"vì sao"*, `02` trả lời *"làm thế nào"*, `03` trả lời *"mô tả contract thế nào"*, `api-security.md` trả lời *"chống gì"*. Khi có chồng lấn, chỉ nêu quyết định ngắn và link đến tài liệu có trách nhiệm chính.

---

## 5. Lộ trình học 4 tuần

Giả định **6–8 giờ/tuần**. Mục tiêu cuối tuần 4: tự thiết kế và bảo vệ được API CRUD có phân trang, validation, lỗi chuẩn, idempotency, optimistic locking, versioning và có spec OpenAPI hoàn chỉnh.

| Tuần | Nội dung học | Thực hành | Sản phẩm đầu ra |
|---|---|---|---|
| **Tuần 1 — Nền tảng** | [`01-fundamentals.md`](./01-fundamentals.md) §§1–8: Contract, phân tán, phân loại API, HTTP, idempotency, resource/URI, REST constraints, RMM, resource modeling. | Chọn 1 domain (ví dụ `orders`), xác định resources/quan hệ, vẽ bảng endpoint dự kiến. | Tài liệu ngắn: use case + resource model + danh sách endpoint (chưa code). |
| **Tuần 2 — REST thực hành** | [`01-fundamentals.md`](./01-fundamentals.md) §§9–14; [`02-rest-design.md`](./02-rest-design.md) §§1–12: Envelope/naming, pagination/filter/sort, lỗi, caching, quy trình 10 bước, method/status, PATCH, query, cursor+ tiebreaker, error catalog, validation, idempotency, locking. | Thiết kế đầy đủ `customers`/`orders`/`order_items`: request/response mẫu, error catalog, cursor pagination, `Idempotency-Key`, `If-Match`. | Spec chi tiết cho 4–6 endpoint với ví dụ request/response/lỗi đầy đủ. |
| **Tuần 3 — OpenAPI & Contract-first** | [`03-openapi.md`](./03-openapi.md) §§1–12: Contract-first, cấu trúc, params/body/response, JSON Schema 2020-12, security, components, tooling, quy trình, contract testing/CI. [`../api-security.md`](../api-security.md) §§1–7 (overview). | Viết `openapi.yaml` cho API tuần 2. Dùng Redocly/Spectral lint, sinh types bằng `openapi-typescript`. | File `openapi.yaml` hoàn chỉnh, pass lint, có lỗi mẫu RFC 9457, security scheme, components tái sử dụng. |
| **Tuần 4 — Vận hành & Review** | [`02-rest-design.md`](./02-rest-design.md) §§13–22; [`03-openapi.md`](./03-openapi.md) §§13–16; [`04-lifecycle-process.md`](./04-lifecycle-process.md) (đọc), [`06-testing-observability.md`](./06-testing-observability.md) §§1–4 (overview). | Thêm upload (nếu cần), rate limit, versioning/deprecation plan, test matrix, chạy review bằng checklist DoD. Viết ngắn trade-off. | API spec sẵn sàng review: DoD đầy đủ, test matrix, kế hoạch deprecation/versioning, ghi chú trade-off rõ ràng. |

**Sau mỗi tuần:** Viết lại 5 điều học được bằng lời của chính bạn. Nếu không viết được rõ ràng, đọc lại mục tương ứng — đó là dấu hiệu chưa hiểu đủ để áp dụng.

---

## 6. Lộ trình áp dụng cho team đang vận hành

Không cần "đập đi xây lại". Ưu tiên những thay đổi **rẻ, ít phá vỡ, giảm đau nhiều nhất** theo thứ tự rủi ro.

| Sprint | Việc làm | Tài liệu tham khảo | Tiêu chí hoàn thành |
|---|---|---|---|
| **0** | Chốt quy ước: naming, error format (hướng tới RFC 9457), envelope, field naming (`snake_case`). Ghi vào style guide ngắn. | [`02-rest-design.md`](./02-rest-design.md) §§2,7,9; README §7 | Có `docs/api-style-guide.md` (hoặc mục trong README), team đồng ý áp dụng. |
| **1** | Chuẩn hóa status code. Loại bỏ `200` + `success:false`. Thêm error catalog cơ bản. | [`02-rest-design.md`](./02-rest-design.md) §§3,5,9 | Không còn pattern `200` kèm `success:false`. Tất cả lỗi dùng status code đúng. |
| **2** | Sửa phân trang cursor: thêm tiebreaker `(sort_key, id)`, validate cursor, trả `has_more` đúng. | [`01-fundamentals.md`](./01-fundamentals.md) §10; [`02-rest-design.md`](./02-rest-design.md) §8 | Test: timestamp trùng không mất/trùng item. Cursor không parse được → `400 invalid_cursor`. |
| **3** | Thêm validation schema (whitelist field, trim, giới hạn độ dài), body limit, kiểm tra `Content-Type`. | [`02-rest-design.md`](./02-rest-design.md) §10 | Mọi input ghi đều qua schema. `413`/`415`/`422` rõ ràng. Có test case dữ liệu xấu. |
| **4** | Thêm `Idempotency-Key` cho `POST` quan trọng (tạo order/payment). Lưu key+response, xử lý conflict/replay. | [`01-fundamentals.md`](./01-fundamentals.md) §5; [`02-rest-design.md`](./02-rest-design.md) §11 | Gửi lại 3 lần cùng key+body → chỉ tạo 1 resource, nhận cùng response. Cùng key khác body → `409`. |
| **5** | Thêm optimistic locking cho update nhạy cảm: `version` + `If-Match`/`ETag`, trả `412`. | [`02-rest-design.md`](./02-rest-design.md) §12 | Sửa đồng thời → một client nhận `412 precondition_failed`, hướng dẫn tải lại. |
| **6** | Thêm OpenAPI cho endpoint quan trọng (contract-first dần). Bắt đầu với `GET`/`POST` dùng nhiều nhất. | [`03-openapi.md`](./03-openapi.md) §§1,11,12 | Có `openapi.yaml` cho module, lint pass, types sinh ra dùng trong code/test. |
| **7** | Chuẩn hóa authZ object-level. Audit các endpoint sửa/xóa. Thêm rate limit cho public ghi. | [`02-rest-design.md`](./02-rest-design.md) §14; [`../api-security.md`](../api-security.md) §§3,4,7 | Không chỉ kiểm tra role, còn kiểm tra quyền trên resource cụ thể. Có `429` + `Retry-After`. |
| **8** | Versioning + deprecation policy. Thêm header `Deprecation`/`Sunset` khi chuẩn bị ngừng. Quan sát usage trước khi tắt. | [`02-rest-design.md`](./02-rest-design.md) §17; [`04-lifecycle-process.md`](./04-lifecycle-process.md) | Có chính sách bằng văn bản, chỉ version khi breaking, không tắt đột ngột. |

> ⚠️ **Nguyên tắc quan trọng:** Đừng bắt đầu bằng versioning khi error format còn hỗn loạn. Version mới chỉ nhân đôi chi phí bảo trì nếu không sửa gốc. Luôn giữ tương thích ngược khi có thể, ghi changelog cho mọi thay đổi contract.

---

## 7. Quy ước chung trong bộ tài liệu

### 7.1 REST, URL, JSON

- **Resource là danh từ số nhiều:** `/customers`, `/orders`, `/products`. Không dùng động từ trong path.
- **Method thể hiện hành vi:** `GET` đọc, `POST` tạo/xử lý, `PUT` thay thế toàn bộ, `PATCH` sửa một phần, `DELETE` xóa.
- **Tránh nesting sâu:** Tối đa 2 cấp lồng (`/orders/{id}/order_items`). Nếu quan hệ phức tạp hơn, dùng collection độc lập với filter (`/order_items?order_id=...`).
- **Query dùng cho view/filter/sort/pagination:** Không dùng query để định danh resource.
- **JSON:** `application/json; charset=utf-8`. Field dùng `snake_case`. Không trộn `camelCase`/`PascalCase`.
- **Thời gian:** RFC 3339 UTC, ví dụ `2026-10-30T09:30:00Z`. Luôn lưu UTC, hiển thị theo timezone người dùng.
- **Tiền tệ:** Dùng integer minor units (`amount_cents`), tránh float/double.
- **ID:** Có thể `int`/`uuid`/`ulid`. ID lớn hơn `2^53` trong JavaScript nên truyền dạng string nếu cần, nhưng giữ nguyên quy ước trong toàn API.

### 7.2 Error format

Hướng tới **RFC 9457 Problem Details**:

```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Trường 'email' không đúng định dạng.",
  "instance": "/api/v1/customers",
  "code": "validation_failed",
  "request_id": "req_01J9Z3K7X8Y9Z0",
  "errors": [
    { "field": "email", "code": "invalid_format", "message": "Email không hợp lệ" }
  ]
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `type` | Khuyến nghị | URI định danh loại lỗi (có thể trỏ tới docs). Dùng `about:blank` nếu chưa có trang. |
| `title` | Có | Mô tả ngắn, ổn định theo loại lỗi. |
| `status` | Có | Trùng HTTP status. |
| `detail` | Khuyến nghị | Giải thích cụ thể cho request này. |
| `instance` | Khuyến nghị | Path của request gây lỗi. |
| `code` | Khuyến nghị | Machine-readable, enum ổn định cho client xử lý. |
| `request_id` | Khuyến nghị | Dùng để trace log server. |
| `errors[]` | Chỉ khi validation | Chi tiết lỗi theo field/path. |

**Quy tắc:** Không trả stack trace, SQL, tên bảng/cột, message thô từ ORM/DB. `4xx` giúp client sửa, `5xx` phải trung tính và được log đầy đủ.

### 7.3 Versioning, compatibility, deprecation

- **URL versioning** là thực dụng nhất: `/api/v1/...`, `/api/v2/...`. Giữ host không đổi.
- **Chỉ version khi breaking:** Thay đổi kiểu field, xóa field bắt buộc, đổi status code thành công, đổi ngữ nghĩa, thắt chặt validation làm request cũ bị từ chối.
- **Additive là non-breaking:** Thêm field optional vào response, thêm endpoint mới, thêm query param optional.
- **Deprecation:** Thêm header `Deprecation: <RFC1123 date>`, `Sunset: <RFC1123 date>`, `Link: <migration-doc>; rel="deprecation"`. Thông báo trước, đo usage, hỗ trợ migrate, chỉ tắt sau khi không còn consumer quan trọng.
- **Tách rõ "hiện trạng" vs "thiết kế mục tiêu":** Nếu code chưa làm, phải ghi rõ là đề xuất.

### 7.4 Ngôn ngữ, trình bày, code

- **Ngôn ngữ:** Tiếng Việt, giữ thuật ngữ kỹ thuật tiếng Anh khi tự nhiên (`idempotency`, `cursor`, `etag`, `payload`).
- **Code block:** Luôn có language tag (`ts`, `json`, `http`, `sql`, `bash`, `yaml`, `text`).
- **Ký hiệu:** `⚠️` cảnh báo mất dữ liệu/bảo mật, `💡` mẹo/trade-off.
- **Code mẫu:** Có thể chạy được hoặc ghi rõ `// pseudocode`. Với ví dụ stack cụ thể, ưu tiên dạng trung lập hoặc nêu nhiều lựa chọn.
- **Chính xác:** Không bịa endpoint/schema đang tồn tại. Chỉ nói dựa trên tài liệu/codebase. Số liệu hiệu năng chỉ nêu khi có căn cứ hoặc rõ là giả định.

---

## 8. Quick start — 5 bước thiết kế một API mới

Áp dụng cho tính năng cụ thể, ví dụ: *"Tạo đơn hàng từ giỏ hàng"* với domain `orders/order_items/payments`.

### Bước 1: Viết use case bằng ngôn ngữ người dùng
```text
Khách hàng thêm sản phẩm vào giỏ → chuyển sang thanh toán → tạo đơn hàng (pending)
→ thanh toán → đơn hàng chuyển trạng thái (paid) → gửi thông báo.
Chỉ chủ đơn hàng hoặc admin mới xem được chi tiết đơn hàng.
```

### Bước 2: Xác định resource và quan hệ
| Resource | Thuộc tính chính | Quan hệ | Ghi chú |
|---|---|---|---|
| `customers` | `id`, `email`, `name`, `created_at` | 1–n `orders` | Thông tin khách hàng |
| `products` | `id`, `name`, `price_cents`, `stock`, `status` | n–n (qua `order_items`) | Danh mục sản phẩm |
| `orders` | `id`, `customer_id`, `status`, `total_cents`, `created_at`, `updated_at` | 1–n `order_items`, 1–1 `payments` | Đơn hàng (aggregate root) |
| `order_items` | `id`, `order_id`, `product_id`, `quantity`, `unit_price_cents`, `line_total_cents` | n–1 `orders`, n–1 `products` | Chi tiết đơn hàng |
| `payments` | `id`, `order_id`, `amount_cents`, `status`, `provider`, `created_at` | n–1 `orders` | Thanh toán |

### Bước 3: Gán method, status, quyền
| Nhu cầu | Endpoint | Method | Success | Quyền | Ghi chú |
|---|---|---|---|---|---|
| Tạo đơn hàng từ giỏ | `/api/v1/orders` | `POST` | `201` + `Location` | Authenticated (customer) | Idempotent với `Idempotency-Key`. Validate tồn tại/kho sản phẩm. |
| Xem danh sách đơn của tôi | `/api/v1/customers/me/orders` | `GET` | `200` | Authenticated (owner) | Cursor pagination, filter theo `status`. |
| Xem chi tiết đơn hàng | `/api/v1/orders/{id}` | `GET` | `200` | Owner hoặc admin | Trả đầy đủ items, payments. Kiểm tra object-level. |
| Cập nhật trạng thái đơn | `/api/v1/orders/{id}/status` | `PATCH` | `200` | Admin hoặc service | Chỉ cho phép chuyển trạng thái hợp lệ (state machine). Có thể dùng `If-Match`. |
| Hủy đơn hàng | `/api/v1/orders/{id}` | `DELETE` | `204` | Owner (chỉ pending) hoặc admin | Chỉ hủy được nếu chưa thanh toán/đã xử lý. Audit log. |

### Bước 4: Viết contract trước handler
Tối thiểu cần có:
- **Request schema:** `POST /orders` cần `items: [{product_id, quantity}]` + validation (quantity > 0, stock đủ).
- **Response mẫu:** `201` có `data` với `id`, `status`, `total_cents`, `items`, `created_at`. `Location: /api/v1/orders/{id}`.
- **Error catalog:** `422` (stock không đủ), `409` (idempotency conflict), `403` (không phải chủ đơn), `404` (không tìm thấy).
- **Pagination:** `GET /customers/me/orders` dùng cursor `(created_at, id)`.
- **Security:** AuthN bắt buộc, authZ object-level, rate limit cho `POST`.

Nếu chưa viết được response mẫu cho thành công và ít nhất 2 lỗi quan trọng, chưa hiểu đủ yêu cầu.

### Bước 5: Review bằng checklist + test case
Dùng [DoD §9](#9-definition-of-done-dod-cho-một-api) và [test matrix `02` §20](./02-rest-design.md#20-test-case-matrix). Phải trả lời được:
- *"Gửi `POST` 2 lần với cùng `Idempotency-Key` thì sao?"* → Chỉ tạo 1 đơn, trả cùng response.
- *"Hai admin cập nhật trạng thái cùng lúc thì sao?"* → Một bên nhận `412` hoặc conflict được xử lý đúng.
- *"Tăng trang nhiều lần, có đơn mới được tạo thì sao?"* → Cursor không trùng/mất nhờ tiebreaker.
- *"Client cũ không gửi field mới thì sao?"* → Vẫn hoạt động (additive).
- *"Stock hết giữa lúc validate và tạo thì sao?"* → Transaction + kiểm tra lại, trả `409`/`422` rõ ràng.

---

## 9. Definition of Done (DoD) cho một API

Một endpoint/API chỉ được coi là "xong" khi **tất cả** mục dưới đây đạt. Nếu không áp dụng, ghi rõ lý do và người chấp nhận rủi ro.

### 9.1 Contract & Design
- [ ] **Use case rõ ràng:** Có actor, mục đích, business rule quan trọng.
- [ ] **Resource chuẩn:** URL danh từ số nhiều, không verb, không trailing slash, nesting ≤ 2 cấp.
- [ ] **Method đúng ngữ nghĩa:** `GET` không đổi state. `PUT` thay thế toàn bộ, `PATCH` sửa một phần.
- [ ] **Schema rõ ràng:** Request/response có schema, field required/optional xác định. Field mới là additive.
- [ ] **Status code đúng:** Không lạm dụng `200` cho lỗi. `201` kèm `Location`. `204` không body.
- [ ] **Error đầy đủ:** Có error catalog với `code` machine-readable. Dùng RFC 9457 khi có thể.
- [ ] **OpenAPI cập nhật:** Spec có example thành công + lỗi, `operationId`, components tái sử dụng.

### 9.2 Hành vi & Dữ liệu
- [ ] **Validation:** Whitelist field, trim string, giới hạn độ dài/giá trị, kiểm tra enum. Chặn mass assignment.
- [ ] **Idempotency:** `POST` tạo resource có idempotency key hoặc unique constraint tự nhiên.
- [ ] **Concurrency:** Update nhạy cảm dùng optimistic locking (`version` + `If-Match`) hoặc pessimistic lock có lý do.
- [ ] **Pagination ổn định:** Collection dùng cursor + tiebreaker khi dữ liệu thay đổi thường xuyên. Có `limit` max và mặc định hợp lý.
- [ ] **Transaction:** Thao tác nhiều bảng dùng transaction. Kiểm tra lại điều kiện quan trọng (stock, balance) trong transaction.
- [ ] **Không N+1:** Đã xem xét query, dùng join/select cần thiết hoặc batch load.
- [ ] **Index phù hợp:** Query chính có index hỗ trợ filter/sort/pagination.

### 9.3 Bảo mật & Rate limiting
- [ ] **AuthN/AuthZ:** Kiểm tra xác thực đúng actor. **Object-level authorization** bắt buộc (không chỉ role).
- [ ] **Least privilege:** Chỉ trả field cần thiết, ẩn field nhạy cảm.
- [ ] **Input safety:** Giới hạn body size, kiểm tra `Content-Type`. Chống mass assignment.
- [ ] **Abuse prevention:** Rate limit cho endpoint public/ghi dữ liệu. Có lý do nếu không áp dụng.
- [ ] **Secrets:** Không log token/secret/PII nhạy cảm. Tham khảo [`../api-security.md`](../api-security.md).

### 9.4 Vận hành, quan sát & tài liệu
- [ ] **Logging:** Có `request_id`, log lỗi với context đủ debug (không chứa PII/secret).
- [ ] **Metrics/Health:** Ý thức về latency/error rate. Có health/readiness nếu quan trọng.
- [ ] **Timeouts:** Có timeout cho dependency (DB/external API). Xử lý lỗi gracefully.
- [ ] **Retry an toàn:** Chỉ retry idempotent hoặc có idempotency key. Có backoff + jitter.
- [ ] **Test:** Happy path, validation, not found, unauthorized/forbidden, conflict, rate limit, concurrency case quan trọng.
- [ ] **Migration/rollback:** Có ghi chú nếu đổi schema/contract. Xem xét zero-downtime.
- [ ] **Docs đồng bộ:** API docs/spec/README cập nhật cùng PR. Thêm changelog nếu thay đổi contract.
- [ ] **Review:** Đã review với ít nhất 1 consumer (FE/mobile) nếu ảnh hưởng client.

> 💡 Checklist này có chủ đích ngắn. **Đừng tick cho có.** Nếu mục không áp dụng, xóa hoặc ghi lý do rõ ràng.

---

## 10. Bảng tra cứu nhanh theo tình huống

| Tình huống | Đọc mục nào | Ghi chú |
|---|---|---|
| "API là gì, khác gì gọi hàm?" | [`01-fundamentals.md`](./01-fundamentals.md) §1 | Contract, producer/consumer. |
| "Chọn REST, GraphQL, gRPC, WebSocket?" | [`01-fundamentals.md`](./01-fundamentals.md) §3 | Bảng so sánh + câu hỏi quyết định. |
| "PUT hay PATCH?" | [`01-fundamentals.md`](./01-fundamentals.md) §4, [`02-rest-design.md`](./02-rest-design.md) §§3–4 | Thay thế toàn bộ vs sửa một phần. Merge Patch vs JSON Patch. |
| "Trả status code nào?" | [`01-fundamentals.md`](./01-fundamentals.md) §4, [`02-rest-design.md`](./02-rest-design.md) §5 | Catalog đầy đủ + quy tắc `400` vs `422`, `401` vs `403`. |
| "Thiết kế filter/sort/search thế nào?" | [`01-fundamentals.md`](./01-fundamentals.md) §10, [`02-rest-design.md`](./02-rest-design.md) §7 | Whitelist field, tránh SQL injection, search khác filter. |
| "Offset hay cursor pagination?" | [`01-fundamentals.md`](./01-fundamentals.md) §10, [`02-rest-design.md`](./02-rest-design.md) §8 | Ưu điểm/nhược, tiebreaker bắt buộc, cursor opaque. |
| "Lỗi nên trả thế nào để client dễ xử lý?" | [`01-fundamentals.md`](./01-fundamentals.md) §12, [`02-rest-design.md`](./02-rest-design.md) §9 | RFC 9457, `code`, `request_id`, `errors[]`, error catalog. |
| "Validate input như thế nào?" | [`02-rest-design.md`](./02-rest-design.md) §10 | Schema, trim, whitelist, body limit, `Content-Type`. |
| "POST gửi trùng khi timeout/retry?" | [`01-fundamentals.md`](./01-fundamentals.md) §5, [`02-rest-design.md`](./02-rest-design.md) §11 | `Idempotency-Key`, unique constraint, xử lý replay/conflict. |
| "Hai người sửa cùng lúc?" | [`01-fundamentals.md`](./01-fundamentals.md) §11, [`02-rest-design.md`](./02-rest-design.md) §12 | Optimistic locking (`ETag`/`If-Match`/`version`), `412`. |
| "Upload file an toàn?" | [`02-rest-design.md`](./02-rest-design.md) §13, [`../api-security.md`](../api-security.md) | Multipart vs presigned URL, magic bytes, hạn chế size/type, EXIF. |
| "AuthN/AuthZ cho endpoint?" | [`02-rest-design.md`](./02-rest-design.md) §14, [`../api-security.md`](../api-security.md) §§3–4 | Object-level, scope/role, `401` vs `403`. |
| "Cache response thế nào?" | [`01-fundamentals.md`](./01-fundamentals.md) §14, [`02-rest-design.md`](./02-rest-design.md) §15 | `Cache-Control`, `ETag`, `If-None-Match`, `Vary`, không cache auth response. |
| "Chống spam/abuse?" | [`02-rest-design.md`](./02-rest-design.md) §16, [`../api-security.md`](../api-security.md) §7 | Rate limiting thuật toán, shared store, `429` + `Retry-After`. |
| "Đổi API không làm vỡ client cũ?" | [`01-fundamentals.md`](./01-fundamentals.md) §11, [`02-rest-design.md`](./02-rest-design.md) §17, [`04-lifecycle-process.md`](./04-lifecycle-process.md) | Additive vs breaking, versioning, deprecation (`Deprecation`/`Sunset`). |
| "Thiết kế webhook?" | [`02-rest-design.md`](./02-rest-design.md) §18 | Signature (HMAC), timestamp + replay window, retry + idempotency, SSRF protection. |
| "Viết OpenAPI contract-first?" | [`03-openapi.md`](./03-openapi.md) toàn bộ | Quy trình, components, security, lint, codegen, contract testing. |
| "Thiết kế từ đầu cho use case thực tế?" | [`01-fundamentals.md`](./01-fundamentals.md) §17 (thay bằng domain orders), [`02-rest-design.md`](./02-rest-design.md) §19 | Áp dụng quy trình 10 bước với domain trung lập. |
| "Review PR thêm endpoint?" | [`02-rest-design.md`](./02-rest-design.md) §§20–22, README §9 | Test matrix + checklist DoD. |

---

## 11. Bảng tra cứu chủ đề cốt lõi

| Chủ đề | Nơi học | Nơi áp dụng nhanh |
|---|---|---|
| **Contract-first** | [`03-openapi.md`](./03-openapi.md) §§1,11 | [`03-openapi.md`](./03-openapi.md) §16 checklist |
| **Richardson Maturity Model** | [`01-fundamentals.md`](./01-fundamentals.md) §7 | Đánh giá mức độ "RESTful" thực tế |
| **Idempotency** | [`01-fundamentals.md`](./01-fundamentals.md) §5, [`02-rest-design.md`](./02-rest-design.md) §11 | `Idempotency-Key` header + bảng/Redis |
| **Cursor pagination + tiebreaker** | [`02-rest-design.md`](./02-rest-design.md) §8 | Code mẫu encode/decode cursor, SQL `(key, id)` |
| **PATCH vs JSON Patch/Merge Patch** | [`02-rest-design.md`](./02-rest-design.md) §4 | Chọn đúng theo độ phức tạp |
| **RFC 9457 Error** | [`01-fundamentals.md`](./01-fundamentals.md) §12, [`02-rest-design.md`](./02-rest-design.md) §9 | `problem()` helper, error catalog |
| **Optimistic locking** | [`02-rest-design.md`](./02-rest-design.md) §12 | `version` + `If-Match` → `412` |
| **Rate limiting** | [`02-rest-design.md`](./02-rest-design.md) §16, [`../api-security.md`](../api-security.md) §7 | Thuật toán + `Retry-After` + shared store |
| **Caching & conditional request** | [`01-fundamentals.md`](./01-fundamentals.md) §14, [`02-rest-design.md`](./02-rest-design.md) §15 | `ETag`/`If-None-Match`/`304`, `Vary` |
| **Versioning & deprecation** | [`02-rest-design.md`](./02-rest-design.md) §17, [`04-lifecycle-process.md`](./04-lifecycle-process.md) | URL versioning, `Deprecation`/`Sunset` headers |
| **OpenAPI 3.1** | [`03-openapi.md`](./03-openapi.md) toàn bộ | `type: [T,"null"]` thay `nullable`, JSON Schema 2020-12 |
| **Contract testing** | [`03-openapi.md`](./03-openapi.md) §12 | `oasdiff breaking`, Schemathesis, validate response theo schema |

---

## 12. Mẹo review nhanh

Khi review PR thêm/sửa endpoint, hỏi nhanh các câu sau:

| Câu hỏi | Nếu trả lời "không"/"chưa" | Hành động |
|---|---|---|
| **Contract đã rõ chưa?** | Chưa có example request/response/lỗi | Yêu cầu bổ sung vào spec/docs. |
| **Method/status đúng chưa?** | Dùng `GET` đổi state, `200` cho lỗi | Sửa theo [`02-rest-design.md`](./02-rest-design.md) §§3,5. |
| **Có validation chưa?** | Chấp nhận body thô, không whitelist | Thêm schema + `422`. |
| **Trùng request xử lý thế nào?** | `POST` không idempotent | Thêm `Idempotency-Key` hoặc unique constraint. |
| **Sửa đồng thời thế nào?** | PUT/PATCH ghi đè không kiểm tra | Thêm optimistic locking hoặc giải thích tại sao không cần. |
| **Phân trang có ổn định không?** | Chỉ `offset` cho feed lớn | Chuyển cursor + tiebreaker hoặc chứng minh an toàn. |
| **Phân quyền đúng chưa?** | Chỉ check role, không check owner | Thêm object-level authorization. |
| **Lỗi có thể debug được không?** | Thiếu `request_id`, lộ chi tiết nội bộ | Chuẩn hóa error + logging. |
| **Có phá vỡ client cũ không?** | Đổi tên/xóa/đổi kiểu field bắt buộc | Breaking → versioning hoặc rollback plan. |
| **Có test chưa?** | Chỉ happy path | Bổ sung validation/conflict/not found. |

---

## 13. Đóng góp và cập nhật tài liệu

### 13.1 Nguyên tắc
1. **Code là nguồn sự thật cuối cùng.** Nếu tài liệu mâu thuẫn với implementation đang chạy, phải làm rõ "hiện trạng" vs "đề xuất" và sửa một trong hai trong cùng PR.
2. **Một thay đổi contract = một thay đổi tài liệu.** Thay đổi request/response/status/error phải cập nhật docs + OpenAPI.
3. **Không thêm mục "sẽ làm" mơ hồ.** Ghi rõ trạng thái, ưu tiên, hoặc link issue có ngữ cảnh.
4. **Ví dụ phải hữu ích:** Chạy được hoặc đánh dấu rõ `// pseudocode`. Ưu tiên ví dụ trung lập theo domain `customers/orders/products`.
5. **Không nhân bản bảo mật:** Link tới [`../api-security.md`](../api-security.md), chỉ mô tả quyết định thiết kế cần thiết.
6. **Giữ nhất quán:** Tuân theo quy ước §7, giữ style hiện có (bảng, code block, `⚠️`/`💡`).
7. **Trung lập:** Tránh phụ thuộc stack cụ thể trừ khi minh họa rõ ràng là ví dụ hoặc ghi đa stack.

### 13.2 Quy trình đóng góp
```text
1. Mở issue: Nêu rõ vấn đề/thiếu gì, ảnh hưởng đến ai, đề xuất ngắn.
2. Tạo nhánh: docs/<slug-ngắn>
3. Sửa tài liệu: Chỉ sửa file liên quan, cập nhật TOC/anchor nếu đổi heading.
4. Kiểm tra: Link tương đối, heading anchor GitHub, code block có language.
5. Review: Ít nhất 1 người am hiểu + 1 consumer nếu ảnh hưởng contract.
6. Merge: Cập nhật changelog nếu thay đổi contract quan trọng.
```

### 13.3 Lệnh kiểm tra nhanh trước khi merge
```bash
# Đếm dòng
wc -l docs/api/*.md

# Liệt kê heading
grep -n '^## ' docs/api/*.md

# Kiểm tra link tương đối
grep -oE '\]\(\.\.?/[^)]+\)' docs/api/*.md

# Kiểm tra từ khóa cần tránh (nếu áp dụng cho file được chỉ định)
grep -n -E '\b(wedding|supabase|hono|bun )\b' docs/api/README.md docs/api/01-fundamentals.md docs/api/02-rest-design.md docs/api/03-openapi.md
```

> ⚠️ **Lưu ý anchor GitHub:** Tiêu đề lowercase, bỏ dấu câu, khoảng trắng → `-`. Thay đổi H2/H3 mà quên cập nhật TOC là lỗi rất phổ biến.

### 13.4 Phân công review
| Nội dung | Người duyệt đề xuất | Tiêu chí |
|---|---|---|
| **Contract, status, error format** | Backend Reviewer | Nhất quán, đúng HTTP semantics. |
| **Consumer UX, pagination, realtime** | Frontend/Mobile Reviewer | Dễ dùng, xử lý lỗi rõ ràng. |
| **Auth, rate limit, upload, headers bảo mật** | Security Reviewer | Theo [`../api-security.md`](../api-security.md). |
| **Query, index, migration, locking** | DB Reviewer | Hiệu năng, tránh deadlock, zero-downtime. |
| **OpenAPI/spec, codegen, contract testing** | API Spec Reviewer | Schema đúng, components tái sử dụng, lint pass. |

---

## 14. Tài liệu tham khảo

### Chuẩn HTTP & Web API
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [RFC 8594 — Sunset HTTP Header](https://www.rfc-editor.org/rfc/rfc8594)
- [RFC 9745 — Deprecation HTTP Response Header](https://www.rfc-editor.org/rfc/rfc9745)
- [RFC 6585 — Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585)

### API Design Guidelines
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
- [Richardson Maturity Model — Martin Fowler](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [Roy Fielding's Dissertation (Chapter 5)](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)

### OpenAPI & Tooling
- [OpenAPI Specification 3.1.1](https://spec.openapis.org/oas/v3.1.1.html)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core)
- [Redocly CLI](https://redocly.com/docs/cli)
- [Spectral](https://stoplight.io/open-source/spectral)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [orval](https://orval.dev/)
- [oasdiff](https://github.com/oasdiff/oasdiff)
- [Schemathesis](https://schemathesis.readthedocs.io/)

### Bảo mật & Thực tiễn
- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [Stripe — Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)
- [MDN Web Docs — HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)

---

*Bắt đầu đọc:* [`01-fundamentals.md`](./01-fundamentals.md) → [`02-rest-design.md`](./02-rest-design.md) → [`03-openapi.md`](./03-openapi.md)
