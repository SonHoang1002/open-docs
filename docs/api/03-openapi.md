# OpenAPI 3.1 — Đặc tả API từ cơ bản đến nâng cao

> Tài liệu thực hành **contract-first API design** với OpenAPI 3.1: cấu trúc tài liệu,
> parameters, request/response, JSON Schema 2020-12, security, tooling, code generation,
> contract testing và đặc tả hoàn chỉnh cho **Wedding Messages API**. Đọc cùng
> [02-rest-design.md](./02-rest-design.md) để nắm quy ước REST trước khi viết spec.

---

## Mục lục

1. [Contract-first và OpenAPI là gì?](#1-contract-first-và-openapi-là-gì)
2. [Cấu trúc tài liệu OpenAPI](#2-cấu-trúc-tài-liệu-openapi)
3. [Paths và Operations](#3-paths-và-operations)
4. [Parameters và serialization](#4-parameters-và-serialization)
5. [Request body và media types](#5-request-body-và-media-types)
6. [Responses, headers và links](#6-responses-headers-và-links)
7. [Schema Object](#7-schema-object)
8. [Security schemes](#8-security-schemes)
9. [Components và tái sử dụng](#9-components-và-tái-sử-dụng)
10. [Tooling và code generation](#10-tooling-và-code-generation)
11. [Quy trình viết spec](#11-quy-trình-viết-spec)
12. [Contract testing và CI](#12-contract-testing-và-ci)
13. [Ví dụ hoàn chỉnh: Wedding Messages API](#13-ví-dụ-hoàn-chỉnh-wedding-messages-api)
14. [Từ spec đến code Hono + Zod](#14-từ-spec-đến-code-hono--zod)
15. [Anti-patterns](#15-anti-patterns)
16. [Bài tập và checklist](#16-bài-tập-và-checklist)
17. [Tài liệu tham khảo](#17-tài-liệu-tham-khảo)

---

## 1. Contract-first và OpenAPI là gì?

**Code-first**: viết handler trước, tài liệu viết sau. Frontend phải đọc source để biết
field nào nullable; docs lệch dần; review thiết kế diễn ra muộn; không có nguồn sự thật
để sinh type, mock hay test. **Contract-first** đảo ngược: mô tả API bằng OpenAPI, review
tài liệu, rồi implement. Contract là nguồn sự thật cho backend, frontend, QA và docs.

| Tiêu chí | Code-first | Contract-first |
|---|---|---|
| Nguồn sự thật | Source code | OpenAPI document |
| Review thiết kế | Muộn, gắn với PR code | Sớm, độc lập implementation |
| Song song FE/BE | Phải chờ | Mock ngay từ spec |
| Sinh type/client | Tự viết/suy luận | Tự động, tái lập được |
| Phát hiện breaking change | Muộn | Trong CI, trước merge |
| Chi phí ban đầu / dài hạn | Thấp / tăng nhanh | Cao hơn / thấp hơn |

Contract-first không bắt buộc viết cả spec trước mọi thứ. Với repo nhỏ, viết spec cho
một endpoint, implement, rồi mở rộng — miễn spec được merge cùng PR code và CI chặn drift.

**OpenAPI Specification (OAS)** là chuẩn mở, language-agnostic mô tả HTTP API: endpoint,
method, parameter, body, response, schema, auth, metadata. Nó không phải framework hay
giao thức; nó là **hợp đồng dạng dữ liệu** để tooling sinh docs, client, mock, test, lint.
Spec mô tả hành vi quan sát được, không mô tả bảng/cột DB hay chi tiết ORM.

**Lịch sử:**

| Mốc | Phiên bản | Ghi chú |
|---|---|---|
| 2011 | Swagger 1.x | Tony Tam (Wordnik), mô tả REST bằng JSON |
| 2014 | Swagger 2.0 | Phổ biến, nhiều tool legacy vẫn dùng |
| 2015 | OpenAPI Initiative | Swagger được hiến tặng cho Linux Foundation |
| 2017 | OpenAPI 3.0.0 | `components`, `requestBody`, `callbacks` |
| 2021 | OpenAPI 3.1.0 | JSON Schema 2020-12, `webhooks` |
| 2024 | OpenAPI 3.1.1 | Sửa lỗi/làm rõ, không đổi cấu trúc lớn |

"Swagger" nay là tên bộ tool của SmartBear, không còn là tên chuẩn. OpenAPI 3.2 đã ra
sau 3.1, nhưng phần lớn pipeline production ổn định nhất với **3.1.x**; chỉ nâng khi
lint, codegen và gateway đều hỗ trợ.

**OpenAPI 3.1 khác 3.0:**

| Khía cạnh | 3.0.x | 3.1.x |
|---|---|---|
| Nền schema | Subset JSON Schema draft-04 | JSON Schema 2020-12 |
| Null | `nullable: true` | `type: [string, "null"]` |
| `$ref` + sibling | Bị bỏ qua | Được phép, merge |
| `exclusiveMinimum` | Boolean | Số |
| `const`, `if/then`, `dependentRequired` | Không | Có |
| `webhooks`, `jsonSchemaDialect`, `pathItems` | Không | Có |
| `examples` trong Schema | Chỉ `example` | Mảng `examples` |
| `mutualTLS` | Không | Có |

Điểm gây lỗi nhiều nhất khi migrate là **`nullable` biến mất**:

```yaml
# 3.0
guest_of: { type: string, nullable: true }
# 3.1
guest_of: { type: [string, "null"] }
```

**JSON Schema 2020-12** cung cấp `$defs`, `if`/`then`/`else`, `dependentRequired`,
`unevaluatedProperties`, `contentMediaType`. OAS thêm vocabulary riêng
(`discriminator`, `xml`, `externalDocs`, `example`). Tooling hỗ trợ `if/then` không đồng
đều — luôn enforce lại business rule ở service layer.

---

## 2. Cấu trúc tài liệu OpenAPI

| Field gốc | Bắt buộc | Mô tả |
|---|---|---|
| `openapi` | ✅ | Phiên bản spec, ví dụ `3.1.0` |
| `info` | ✅ | `title`, `version`, `summary`, `description`, `contact`, `license` |
| `jsonSchemaDialect` | ❌ | URI dialect, mặc định 2020-12 |
| `servers` | ❌ | Danh sách server; mặc định `[{url: "/"}]` |
| `paths` | ✅ | Path và operation (có thể rỗng) |
| `webhooks` | ❌ | Webhook API chủ động gọi (3.1) |
| `components` | ❌ | Kho định nghĩa tái sử dụng |
| `security` | ❌ | Yêu cầu bảo mật mặc định |
| `tags` | ❌ | Metadata nhóm operation |
| `externalDocs` | ❌ | Link tài liệu ngoài |

```yaml
openapi: 3.1.0
info:
  title: Wedding Guestbook API
  version: 1.0.0
  summary: API lời chúc và RSVP cho wedding guestbook
  description: |
    API công khai cho khách gửi lời chúc và xem danh sách.
    Quản trị viên dùng Bearer JWT để sửa/xóa nội dung.
  contact: { name: Wedding Server Team, email: api@wedding.example.com }
  license: { name: MIT, identifier: MIT }
servers:
  - { url: "http://localhost:3000", description: Local }
  - { url: "https://api.wedding.example.com", description: Production }
tags:
  - { name: Messages, description: Lời chúc và RSVP }
paths: {}
```

`info.version` là phiên bản **API**, không phải phiên bản tài liệu. API có `/v2` thì
`info.version` nên là `2.x.y`.

`servers` hỗ trợ biến:

```yaml
servers:
  - url: https://{region}.api.wedding.example.com
    variables:
      region: { default: ap-southeast-1, enum: [ap-southeast-1, us-east-1] }
```

Không đặt secret trong `servers`.

**Quy tắc `$ref`:**

```yaml
schema: { $ref: "#/components/schemas/Message" }
parameters:
  - { $ref: "./components/parameters.yaml#/Cursor" }
```

1. `$ref` là tham chiếu, không phải inheritance; muốn mở rộng dùng `allOf`.
2. 3.0 bỏ qua sibling của `$ref`; 3.1 merge. Hạn chế sibling nếu tool cũ.
3. Circular reference hợp lệ nhưng phải có điểm dừng; codegen có thể lỗi nếu đệ quy vô hạn.
4. Không trỏ `$ref` tới URL remote trong CI — build phụ thuộc mạng, dễ fail ngẫu nhiên.
5. `$id` đổi base URI; không cần thì đừng đặt trong component.
6. **Bundle trước khi publish**: `redocly bundle openapi.yaml -o dist/openapi.yaml`.

> 💡 Đặt tên file/component theo domain (`message.yaml`, `problem.yaml`), không theo
> layer (`schema1.yaml`, `common2.yaml`).

---

## 3. Paths và Operations

**Path Item** chứa `$ref`, `summary`, `description`, các method (`get`, `post`, `put`,
`patch`, `delete`, `options`, `head`, `trace`), `servers` và `parameters` dùng chung.

```yaml
paths:
  /messages/{messageId}:
    parameters:
      - $ref: "#/components/parameters/MessageId"
    get:
      operationId: getMessage
```

**Operation Object:**

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `responses` | ✅ | Map status code → Response Object |
| `operationId` | ❌ (nên có) | ID duy nhất toàn spec, dùng cho codegen |
| `tags` | ❌ | Nhóm trên UI |
| `summary` / `description` | ❌ | Tiêu đề ngắn / mô tả Markdown |
| `parameters` | ❌ | Parameter riêng operation |
| `requestBody` | ❌ | Body (không dùng cho GET/HEAD) |
| `callbacks` | ❌ | API gọi ngược client |
| `deprecated` | ❌ | Đánh dấu sắp bỏ |
| `security` | ❌ | Override security cấp root |
| `servers` | ❌ | Override server |

`operationId` phải duy nhất, ổn định, theo `verbNoun` camelCase: `listMessages`,
`createMessage`, `replaceMessage`, `updateMessage`, `deleteMessage`. Đổi tên là breaking
change với SDK. Không nhét version vào tên (`getMessagesV2`).

Path dùng danh từ số nhiều, kebab-case, tối đa 2 cấp lồng; path parameter luôn
`{name}` + `in: path` + `required: true`. Tránh `/messages/` và `/messages` cùng lúc.

**`deprecated`** chỉ là tín hiệu tooling, không tự trả header. Muốn client biết, trả thêm
`Deprecation`/`Sunset` (xem [04-lifecycle-process.md](./04-lifecycle-process.md)).

**Callback** gắn với operation; **webhook** (3.1) độc lập, client đăng ký trước:

```yaml
webhooks:
  messageCreated:
    post:
      operationId: onMessageCreated
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/MessageEvent" }
      responses:
        "204": { description: Đã nhận sự kiện }
```

WebSocket `/ws` không mô tả bằng OpenAPI; xem [../websocket.md](../websocket.md).

---

## 4. Parameters và serialization

| Field | Mô tả |
|---|---|
| `name`, `in` | `path`, `query`, `header`, `cookie` |
| `required` | Bắt buộc; **luôn `true` với `in: path`** |
| `deprecated` | Sắp bỏ |
| `style`, `explode` | Cách serialize |
| `allowReserved` | Cho ký tự reserved trong query |
| `schema` | Schema giá trị |
| `example` / `examples` | Ví dụ |

| `in` | Style mặc định | Explode | Ví dụ |
|---|---|---|---|
| `path` | `simple` | `false` | `/users/3` |
| `query` | `form` | `true` | `?tags=a&tags=b` |
| `header` | `simple` | `false` | `X-Ids: 3,4` |
| `cookie` | `form` | `true` | `session=abc` |

Query còn hỗ trợ `spaceDelimited` (`?tags=a%20b`), `pipeDelimited` (`?tags=a|b`),
`deepObject` (`?filter[will_attend]=true`). Path hỗ trợ `label` (`.3`) và `matrix`
(`;id=3`). `explode: false` với form cho `?tags=a,b`.

**Cursor pagination** (phù hợp infinite scroll; offset chậm và trả trùng/thiếu khi dữ
liệu đổi):

```yaml
parameters:
  - name: cursor
    in: query
    required: false
    description: Con trỏ opaque từ `page.next_cursor`; không tự parse.
    schema: { type: string, maxLength: 256, pattern: "^[A-Za-z0-9_-]+$" }
    example: eyJjcmVhdGVkX2F0IjoiMjAyNi0xMC0yNVQxMDowMDowMFoiLCJpZCI6MTIzfQ
  - name: limit
    in: query
    schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
  - name: will_attend
    in: query
    schema: { type: boolean }
  - name: guest_of
    in: query
    schema: { type: string, maxLength: 80 }
  - name: q
    in: query
    description: Tìm trong tên và nội dung, không phân biệt hoa thường.
    schema: { type: string, minLength: 2, maxLength: 100 }
```

Quy ước cursor: sắp xếp `(created_at DESC, id DESC)`, cursor mã hóa cả hai để tránh trùng
timestamp, `next_cursor: null` khi hết, giới hạn `limit` để không kéo cả bảng.

Không đặt token nhạy cảm trong query (bị log ở proxy, browser history, Referer). Lỗi
thường gặp: path thiếu `required: true` (spec invalid), dùng `nullable` (bị bỏ qua),
`limit` không có `maximum`, `example` cạnh `$ref` trong 3.0 (bị bỏ qua).

---

## 5. Request body và media types

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema: { $ref: "#/components/schemas/MessageCreate" }
      examples:
        attending:
          summary: Khách tham dự
          value:
            sender_name: Nguyễn Minh Anh
            content: Chúc hai bạn trăm năm hạnh phúc!
            will_attend: true
            guest_of: Bạn thân cô dâu
            number_attend: 2
```

`content` là map `media type → Media Type Object` (`schema`, `example(s)`, `encoding`).
`example` cho một ví dụ; `examples` cho nhiều tình huống có `summary`. Dùng `$ref` tới
`components/examples` nếu tái sử dụng.

- POST/PUT: `application/json`. PATCH có thể dùng `application/merge-patch+json`
  (RFC 7396) nếu server thực sự hỗ trợ; nếu không, đừng khai báo.
- Server trả `415` khi `Content-Type` không hỗ trợ, `406` khi không thỏa `Accept`.
- `multipart/form-data` cho upload; mỗi part có thể có `contentType`, `headers`,
  `style`, `explode` trong `encoding`. 3.1 ưu tiên `contentMediaType`; `format: binary`
  vẫn phổ biến vì generator chỉ hiểu cách này. Không tự đặt `Content-Type` (boundary do
  runtime sinh); mô tả và enforce giới hạn file ở server.
- `application/x-www-form-urlencoded` chỉ dùng khi cần submit từ `<form>` không JS.

---

## 6. Responses, headers và links

- Phải có ít nhất một response. Key là `"200"`, dải `"2XX"`/`"4XX"`/`"5XX"` hoặc
  `default`; luôn quote trong YAML.
- `default` không thay thế việc mô tả lỗi phổ biến.
- Response Object: `description` (bắt buộc), `headers`, `content`, `links`.
- `204` không có body — đừng khai báo `content`.

```yaml
responses:
  "200":
    description: Danh sách lời chúc
    headers:
      X-Request-Id: { $ref: "#/components/headers/XRequestId" }
    content:
      application/json:
        schema: { $ref: "#/components/schemas/MessagePage" }
  "429": { $ref: "#/components/responses/TooManyRequests" }
```

Header hữu ích: `X-Request-Id` (trace), `RateLimit-*` (minh bạch), `Retry-After`
(backoff), `Location` (201), `ETag`/`If-None-Match` (cache/optimistic lock),
`Deprecation`/`Sunset` (migration), `WWW-Authenticate` (401).

**Links** nối response với operation khác bằng runtime expression:

```yaml
links:
  GetCreatedMessage:
    operationId: getMessage
    parameters: { messageId: "$response.body#/data/id" }
```

**Lỗi RFC 9457** (`application/problem+json`, thay RFC 7807):

```json
{
  "type": "https://api.wedding.example.com/problems/validation-error",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Trường 'content' không được để trống.",
  "instance": "/messages",
  "code": "VALIDATION_ERROR",
  "request_id": "3f1c2a9e-7b6d-4f2a-9c1e-2d8b7a6f5e4d",
  "errors": [{ "path": "content", "message": "Không được để trống" }]
}
```

| Status | Khi dùng |
|---|---|
| `400` | JSON sai cú pháp, thiếu field bắt buộc |
| `401` / `403` | Thiếu/sai credential / không đủ quyền |
| `404` | Không tồn tại (hoặc không được phép thấy) |
| `409` / `412` | Xung đột trạng thái / `If-Match` sai |
| `415` / `422` | Media type sai / đúng cú pháp nhưng sai business rule |
| `429` / `500` / `503` | Rate limit / lỗi không lường trước / tạm không sẵn sàng |

> ⚠️ Đừng trả `200` kèm `{ success: false }` cho lỗi. Nó phá cache, monitoring, retry và
> semantic HTTP. Envelope `success` chỉ là thông tin bổ sung.

Với POST dễ retry, hỗ trợ `Idempotency-Key` (UUID): cùng key + cùng body trong 24h trả
lại response đầu tiên; khác body trả `409`.

---

## 7. Schema Object

| Nhóm | Keyword | Ghi chú |
|---|---|---|
| Kiểu | `type`, `format` | `format` thường là annotation |
| Cố định | `enum`, `const` | `const` chỉ có ở 3.1 |
| Null | `type: [T, "null"]` | Không dùng `nullable` |
| Object | `properties`, `required`, `additionalProperties` | `required` là mảng tên field |
| Object nâng cao | `patternProperties`, `dependentRequired`, `unevaluatedProperties` | 3.1 |
| Array | `items`, `minItems`, `maxItems`, `uniqueItems` | `prefixItems` cho tuple |
| Số | `minimum`, `maximum`, `exclusiveMinimum`, `multipleOf` | Exclusive là số ở 3.1 |
| Chuỗi | `minLength`, `maxLength`, `pattern` | `pattern` theo ECMA-262 |
| Composition | `allOf`, `anyOf`, `oneOf`, `not`, `discriminator` | |
| Metadata | `title`, `description`, `default`, `examples`, `deprecated` | `default` không tự điền |

`required` chỉ có nghĩa khi property tồn tại; nó không ép kiểu và không cấm `null` nếu
type cho phép. `default` chỉ là gợi ý — server vẫn phải áp dụng khi field vắng mặt.

**`readOnly` / `writeOnly`**: `readOnly` chỉ có trong response (`id`, `created_at`);
`writeOnly` chỉ gửi trong request (password, token). Field vừa `readOnly` vừa `required`
thì bắt buộc trong response nhưng không bắt buộc trong request — một số generator xử lý
chưa đúng, cần kiểm tra output.

**Composition**:

- `allOf` = AND, dùng mở rộng schema. Cẩn thận `additionalProperties: false` ở nhánh con
  (chặn field nhánh khác); dùng `unevaluatedProperties: false` ở schema ngoài.
- `anyOf` = ít nhất một; `oneOf` = đúng một (dễ lỗi nếu schema overlap); `not` = phủ định.
- `discriminator` giúp codegen/docs chọn nhánh; field discriminator nên `required` và
  `const` trong từng nhánh.

```yaml
Notification:
  oneOf:
    - $ref: "#/components/schemas/EmailNotification"
    - $ref: "#/components/schemas/SmsNotification"
  discriminator:
    propertyName: channel
    mapping:
      email: "#/components/schemas/EmailNotification"
      sms: "#/components/schemas/SmsNotification"
```

**`enum`**: thêm giá trị nghe như non-breaking nhưng client `switch` không có default sẽ
lỗi. Với dữ liệu mở, dùng `string` + docs hoặc yêu cầu client xử lý fallback.

**`additionalProperties`**: mặc định `true`; `false` chặn field lạ (bắt typo nhưng khó
mở rộng); schema bắt field lạ khớp schema.

**Validation có điều kiện cho RSVP** (`will_attend = true` ⇒ `number_attend >= 1`):

```yaml
MessageCreate:
  type: object
  required: [sender_name, content, will_attend]
  properties:
    will_attend: { type: boolean }
    number_attend: { type: integer, minimum: 0, maximum: 20 }
  if:
    properties: { will_attend: { const: true } }
    required: [will_attend]
  then:
    properties: { number_attend: { minimum: 1 } }
```

**Tái sử dụng**: tách `MessageCreate`/`MessageReplace`/`MessagePatch`/`Message`; envelope
riêng (`MessagePage`, `PageInfo`); lỗi chung (`Problem`, `ValidationProblem`). Không lạm
dụng `allOf` nhiều tầng — docs khó đọc và generator sinh type lồng nhau.

---

## 8. Security schemes

| `type` | Dùng cho | Field chính |
|---|---|---|
| `http` | Basic/Bearer | `scheme`, `bearerFormat` |
| `apiKey` | Key trong header/query/cookie | `name`, `in` |
| `oauth2` | OAuth 2.0 | `flows` |
| `openIdConnect` | OIDC discovery | `openIdConnectUrl` |
| `mutualTLS` | mTLS (3.1) | — |

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.wedding.example.com/oauth/authorize
          tokenUrl: https://auth.wedding.example.com/oauth/token
          refreshUrl: https://auth.wedding.example.com/oauth/token
          scopes:
            messages:read: Đọc lời chúc
            messages:write: Tạo/sửa lời chúc
            messages:admin: Xóa bất kỳ lời chúc nào
```

`bearerFormat: JWT` chỉ là gợi ý docs; server vẫn phải verify chữ ký, `exp`, `aud`,
`iss`. OAuth2 flows: `authorizationCode` (khuyến nghị, PKCE cho public client),
`clientCredentials` (service-to-service), `password`/`implicit` (legacy, tránh).

**Root vs operation:**

```yaml
security: [{ bearerAuth: [] }]
paths:
  /messages:
    get: { security: [] }                 # public
    post: { security: [] }                # public + rate limit
  /messages/{messageId}:
    delete:
      security: [{ oauth2: [messages:admin] }]
```

- Operation `security` **thay thế** hoàn toàn root, không merge; `security: []` tắt auth.
- Mảng là OR; object là AND. Với OAuth2/OIDC, mảng scope là scope bắt buộc.
- `401` kèm `WWW-Authenticate`; `403` khi đã xác thực nhưng thiếu quyền.
- Spec chỉ mô tả cách gửi credential; authorization (owner/admin) vẫn phải kiểm tra ở
  service. Không đặt API key trong query nếu có thể.

---

## 9. Components và tái sử dụng

`components` chứa: `schemas`, `responses`, `parameters`, `examples`, `requestBodies`,
`headers`, `securitySchemes`, `links`, `callbacks`, `pathItems` (3.1).

```yaml
components:
  parameters:
    MessageId:
      name: messageId
      in: path
      required: true
      schema: { type: integer, format: int64, minimum: 1 }
  responses:
    NotFound:
      description: Không tìm thấy lời chúc
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
  schemas:
    Problem:
      type: object
      required: [type, title, status]
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer, minimum: 400, maximum: 599 }
      additionalProperties: true
```

Đặt tên `PascalCase` cho schema/parameter/response (`Message`, `MessagePage`, `Problem`);
file `kebab-case` hoặc `snake_case` nhất quán. Không prefix tên API nếu chỉ có một API;
không dùng tên implementation (`MessageRow`, `MessageDto`) trong spec công khai. Chỉ tạo
component khi dùng ≥ 2 nơi hoặc là contract công khai cần ổn định.

---

## 10. Tooling và code generation

| Docs UI | Điểm mạnh | Hạn chế |
|---|---|---|
| **Swagger UI** | Phổ biến, try-it-out | UI cũ, khó tùy biến sâu |
| **Redoc** | 3 cột đẹp, search, static build | Community không có try-it |
| **Scalar** | UI hiện đại, API client, theme | Ecosystem trẻ hơn |
| **Stoplight Elements** | Web component, tích hợp studio | Gắn hệ sinh thái Stoplight |
| **RapiDoc** | Nhẹ, tùy biến | Ít phổ biến |

| Codegen | Output | Khi nào dùng |
|---|---|---|
| `openapi-generator` | Client/server đa ngôn ngữ | SDK public, đa ngôn ngữ |
| `openapi-typescript` | TS types | Chỉ cần type frontend |
| `orval` | TS client + react-query/SWR/Zod | React/Vue app |
| `hey-api/openapi-ts` | TS SDK + plugins | SDK TypeScript hiện đại |
| `speakeasy` | SDK idiomatic đa ngôn ngữ | API/SDK thương mại |
| `kiota` | Client .NET/Java/Go/TS | Hệ sinh thái Microsoft |

| Lint/diff | Mục đích |
|---|---|
| **Spectral** | Rule-based lint, custom ruleset, CI |
| **Redocly CLI** | Validate, lint, bundle, preview, build docs |
| **vacuum** | Lint nhanh, rule OWASP |
| **oasdiff** | So sánh spec, phát hiện breaking change |
| **swagger-parser** | Validate/resolve `$ref` trong Node |

Mock/test: **Prism** (mock + validation proxy), **MSW** (mock network trong test FE),
**Mockoon**, **WireMock**, **Schemathesis** (property-based), **Dredd** (contract test),
**Pact** (consumer-driven, không trực tiếp từ OpenAPI).

Chọn bộ tool: 1–3 người dùng `redocly lint` + Scalar/Redoc + `openapi-typescript`/`orval`
+ Prism; team 5–15 thêm Spectral, `oasdiff`, generated-client check, Schemathesis; tổ chức
lớn thêm API catalog/gateway/SDK pipeline. Chọn tool dựa trên workflow thật, không dựa
trên screenshot.

---

## 11. Quy trình viết spec

| Cách | Khi nào | Ưu/nhược |
|---|---|---|
| Một file `openapi.yaml` | < 10 endpoint, team nhỏ | Đơn giản; file dài, conflict |
| Nhiều file + `$ref` | Nhiều module/team | Dễ review; cần bundle |
| Sinh từ code | Legacy, gấp | Gần code; khó review thiết kế trước |

```text
docs/openapi/
├── openapi.yaml            # info, servers, tags, paths
├── paths/messages.yaml
├── components/schemas/{message,page,problem}.yaml
├── components/{parameters,responses,examples,security}.yaml
└── dist/openapi.bundled.yaml
```

JSON Pointer escape `~1` = `/`; path `/messages/{messageId}` thành
`~1messages~1{messageId}` — dễ sai, nên nhiều team giữ `paths` ở file root và chỉ tách
`components`.

**Quy trình 6 bước**: use case + consumer → phác thảo resource/operation → spec nháp
1–2 endpoint kèm example thật → design review (FE/QA/security) → freeze + implement +
mock song song → contract test, merge cùng code, publish docs.

**Review checklist**: `operationId` duy nhất/ổn định; mọi response có description và
schema lỗi; có example thành công + lỗi; path parameter `required`; không `nullable`;
`limit` có giới hạn; cursor opaque; không leak field nội bộ; security đúng; không lộ
tên bảng/cột DB; breaking change có kế hoạch version.

**Versioning**: `info.version` theo semver của contract (breaking → major, thêm endpoint/
field optional → minor, docs/example → patch). Giữ spec cũ ở `docs/openapi/v1/`, publish
docs theo version, lưu `CHANGELOG.md` với ngày và migration note.

---

## 12. Contract testing và CI

Pipeline: `lint → validate → bundle → diff breaking → generate → test → publish`.

```yaml
name: api-contract
on:
  pull_request:
    paths: ["docs/openapi/**", "src/**"]
jobs:
  contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx @redocly/cli lint docs/openapi/openapi.yaml
      - run: bunx @redocly/cli bundle docs/openapi/openapi.yaml -o dist/openapi.yaml
      - name: Breaking change check
        run: |
          git show origin/main:docs/openapi/openapi.yaml > /tmp/main.yaml || true
          bunx oasdiff breaking /tmp/main.yaml dist/openapi.yaml
      - run: bunx openapi-typescript dist/openapi.yaml -o src/types/api.d.ts
      - run: git diff --exit-code src/types/api.d.ts
      - run: bun test
```

| Thay đổi | Loại |
|---|---|
| Thêm endpoint/field optional | Minor |
| Thêm field **bắt buộc** vào request | **Major** |
| Xóa field/endpoint, đổi type/status thành công | **Major** |
| Thắt chặt validation (`maxLength` giảm) | **Major** |
| Nới lỏng validation, sửa docs/example | Minor/Patch |
| Thêm giá trị enum | **Major** với client cứng |
| Đổi auth/scope | **Major** |

**Ba tầng contract test**: (1) response thật validate với schema; (2) example trong spec
khớp schema (lint bắt phần lớn); (3) property-based (Schemathesis sinh request, gọi
server thật). Contract test kiểm tra shape, không thay integration test business rule.

```ts
// tests/contract/messages.contract.test.ts
import { describe, expect, it } from "bun:test";
import { MessagePageSchema } from "../../src/modules/messages/schema";

describe("GET /messages", () => {
  it("trả đúng envelope phân trang", async () => {
    const res = await fetch("http://localhost:3000/api/messages?limit=5");
    expect(res.status).toBe(200);
    expect(() => MessagePageSchema.parse(await res.json())).not.toThrow();
  });
});
```

Publish docs: build static HTML trong CI, deploy GitHub Pages/S3/Netlify, version theo
`info.version`, giữ URL cũ, thêm nút download spec và link changelog.

---

## 13. Ví dụ hoàn chỉnh: Wedding Messages API

Đặc tả mục tiêu cho API hiện có, bổ sung cursor pagination, envelope thống nhất, lỗi RFC
9457 và Bearer JWT cho thao tác admin. Code hiện tại cần refactor để khớp (xem mục 14 và
[05-project-structure.md](./05-project-structure.md)).

```yaml
openapi: 3.1.0
info:
  title: Wedding Guestbook API
  version: 1.0.0
  summary: API lời chúc và RSVP cho wedding guestbook
  description: |
    API công khai cho khách gửi lời chúc, xem danh sách và RSVP.
    Quản trị viên dùng Bearer JWT để sửa/xóa lời chúc không phù hợp.
    Lỗi dùng application/problem+json (RFC 9457); thời gian là ISO 8601 UTC.
  contact: { name: Wedding Server Team, email: api@wedding.example.com }
  license: { name: MIT, identifier: MIT }
servers:
  - { url: "http://localhost:3000", description: Local }
  - { url: "https://api.wedding.example.com", description: Production }
tags:
  - { name: Messages, description: Lời chúc và RSVP }
security: [{ bearerAuth: [] }]
servers:
  - { url: "http://localhost:3000/api", description: Local }
  - { url: "https://api.wedding.example.com/api", description: Production }
paths:
  /messages:
    get:
      tags: [Messages]
      operationId: listMessages
      summary: Lấy danh sách lời chúc
      description: Mới nhất trước, dùng cursor để load thêm (infinite scroll).
      security: []
      parameters:
        - $ref: "#/components/parameters/Cursor"
        - $ref: "#/components/parameters/Limit"
        - name: will_attend
          in: query
          schema: { type: boolean }
        - name: guest_of
          in: query
          schema: { type: string, maxLength: 80 }
        - name: q
          in: query
          schema: { type: string, minLength: 2, maxLength: 100 }
      responses:
        "200":
          description: Danh sách lời chúc (có thể rỗng).
          headers:
            X-Request-Id: { $ref: "#/components/headers/XRequestId" }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/MessagePage" }
              examples:
                firstPage: { $ref: "#/components/examples/MessagePageExample" }
        "400": { $ref: "#/components/responses/BadRequest" }
        "429": { $ref: "#/components/responses/TooManyRequests" }
        "500": { $ref: "#/components/responses/ServerError" }
    post:
      tags: [Messages]
      operationId: createMessage
      summary: Gửi lời chúc mới
      description: Tạo lời chúc và broadcast `message.created` qua WebSocket.
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/MessageCreate" }
            examples:
              attending:
                summary: Khách tham dự
                value:
                  sender_name: Nguyễn Minh Anh
                  content: Chúc hai bạn trăm năm hạnh phúc!
                  will_attend: true
                  guest_of: Bạn thân cô dâu
                  number_attend: 2
      responses:
        "201":
          description: Đã tạo lời chúc.
          headers:
            Location:
              description: URL của lời chúc vừa tạo.
              required: true
              schema: { type: string, format: uri-reference }
            X-Request-Id: { $ref: "#/components/headers/XRequestId" }
          content:
            application/json:
              schema:
                type: object
                required: [success, data]
                properties:
                  success: { const: true }
                  data: { $ref: "#/components/schemas/Message" }
                additionalProperties: false
              examples:
                created: { $ref: "#/components/examples/MessageExample" }
        "400": { $ref: "#/components/responses/BadRequest" }
        "409": { $ref: "#/components/responses/Conflict" }
        "422": { $ref: "#/components/responses/UnprocessableEntity" }
        "429": { $ref: "#/components/responses/TooManyRequests" }
        "500": { $ref: "#/components/responses/ServerError" }
  /messages/{messageId}:
    parameters:
      - $ref: "#/components/parameters/MessageId"
    put:
      tags: [Messages]
      operationId: replaceMessage
      summary: Thay thế toàn bộ lời chúc
      description: Field thiếu bị đặt về null/default; dùng PATCH để sửa một phần.
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/MessageReplace" }
      responses:
        "200":
          description: Đã cập nhật.
          headers:
            X-Request-Id: { $ref: "#/components/headers/XRequestId" }
          content:
            application/json:
              schema:
                type: object
                required: [success, data]
                properties:
                  success: { const: true }
                  data: { $ref: "#/components/schemas/Message" }
                additionalProperties: false
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "403": { $ref: "#/components/responses/Forbidden" }
        "404": { $ref: "#/components/responses/NotFound" }
        "422": { $ref: "#/components/responses/UnprocessableEntity" }
        "500": { $ref: "#/components/responses/ServerError" }
    patch:
      tags: [Messages]
      operationId: updateMessage
      summary: Cập nhật một phần lời chúc
      description: Chỉ cập nhật field được gửi; body rỗng bị từ chối.
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/MessagePatch" }
          application/merge-patch+json:
            schema: { $ref: "#/components/schemas/MessagePatch" }
      responses:
        "200":
          description: Đã cập nhật một phần.
          content:
            application/json:
              schema:
                type: object
                required: [success, data]
                properties:
                  success: { const: true }
                  data: { $ref: "#/components/schemas/Message" }
                additionalProperties: false
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "403": { $ref: "#/components/responses/Forbidden" }
        "404": { $ref: "#/components/responses/NotFound" }
        "422": { $ref: "#/components/responses/UnprocessableEntity" }
        "500": { $ref: "#/components/responses/ServerError" }
    delete:
      tags: [Messages]
      operationId: deleteMessage
      summary: Xóa một lời chúc
      description: Xóa vĩnh viễn; broadcast `message.deleted` qua WebSocket.
      responses:
        "204":
          description: Đã xóa.
          headers:
            X-Request-Id: { $ref: "#/components/headers/XRequestId" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "403": { $ref: "#/components/responses/Forbidden" }
        "404": { $ref: "#/components/responses/NotFound" }
        "500": { $ref: "#/components/responses/ServerError" }
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "JWT admin; gửi `Authorization: Bearer <token>`."
  parameters:
    Cursor:
      name: cursor
      in: query
      required: false
      description: Con trỏ opaque từ `page.next_cursor`; không tự parse.
      schema: { type: string, maxLength: 256, pattern: "^[A-Za-z0-9_-]+$" }
      example: eyJjcmVhdGVkX2F0IjoiMjAyNi0xMC0yNVQxMDowMDowMFoiLCJpZCI6MTIzfQ
    Limit:
      name: limit
      in: query
      schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
    MessageId:
      name: messageId
      in: path
      required: true
      schema: { type: integer, format: int64, minimum: 1 }
      example: 42
  headers:
    XRequestId:
      description: ID trace của request.
      required: true
      schema: { type: string, format: uuid }
      example: 3f1c2a9e-7b6d-4f2a-9c1e-2d8b7a6f5e4d
  schemas:
    Message:
      type: object
      required: [id, sender_name, content, will_attend, guest_of, number_attend, created_at]
      properties:
        id: { type: integer, format: int64, minimum: 1, readOnly: true }
        sender_name: { type: string, minLength: 1, maxLength: 80 }
        content: { type: string, minLength: 1, maxLength: 1000 }
        will_attend: { type: boolean }
        guest_of: { type: [string, "null"], maxLength: 80 }
        number_attend: { type: integer, minimum: 0, maximum: 20 }
        created_at: { type: string, format: date-time, readOnly: true }
      additionalProperties: false
    MessageCreate:
      type: object
      required: [sender_name, content, will_attend]
      properties:
        sender_name: { type: string, minLength: 1, maxLength: 80 }
        content: { type: string, minLength: 1, maxLength: 1000 }
        will_attend: { type: boolean }
        guest_of: { type: [string, "null"], maxLength: 80 }
        number_attend: { type: integer, minimum: 0, maximum: 20, default: 1 }
      additionalProperties: false
      if:
        properties: { will_attend: { const: true } }
        required: [will_attend]
      then:
        properties: { number_attend: { minimum: 1 } }
      examples:
        - sender_name: Nguyễn Minh Anh
          content: Chúc hai bạn trăm năm hạnh phúc!
          will_attend: true
          guest_of: Bạn thân cô dâu
          number_attend: 2
    MessageReplace:
      type: object
      required: [sender_name, content, will_attend, number_attend]
      properties:
        sender_name: { type: string, minLength: 1, maxLength: 80 }
        content: { type: string, minLength: 1, maxLength: 1000 }
        will_attend: { type: boolean }
        guest_of: { type: [string, "null"], maxLength: 80 }
        number_attend: { type: integer, minimum: 0, maximum: 20 }
      additionalProperties: false
    MessagePatch:
      type: object
      minProperties: 1
      properties:
        sender_name: { type: string, minLength: 1, maxLength: 80 }
        content: { type: string, minLength: 1, maxLength: 1000 }
        will_attend: { type: boolean }
        guest_of: { type: [string, "null"], maxLength: 80 }
        number_attend: { type: integer, minimum: 0, maximum: 20 }
      additionalProperties: false
    MessagePage:
      type: object
      required: [success, data, page]
      properties:
        success: { const: true }
        data: { type: array, items: { $ref: "#/components/schemas/Message" } }
        page: { $ref: "#/components/schemas/PageInfo" }
      additionalProperties: false
    PageInfo:
      type: object
      required: [next_cursor, has_more]
      properties:
        next_cursor: { type: [string, "null"], maxLength: 256 }
        has_more: { type: boolean }
      additionalProperties: false
    Problem:
      type: object
      description: Lỗi theo RFC 9457.
      required: [type, title, status]
      properties:
        type: { type: string, format: uri, default: "about:blank" }
        title: { type: string }
        status: { type: integer, minimum: 400, maximum: 599 }
        detail: { type: string }
        instance: { type: string, format: uri-reference }
        code: { type: string, pattern: "^[A-Z][A-Z0-9_]*$" }
        request_id: { type: string, format: uuid }
      additionalProperties: true
    ValidationProblem:
      allOf:
        - $ref: "#/components/schemas/Problem"
        - type: object
          required: [errors]
          properties:
            errors:
              type: array
              minItems: 1
              items:
                type: object
                required: [path, message]
                properties:
                  path: { type: string }
                  message: { type: string }
                  code: { type: string }
                additionalProperties: false
          additionalProperties: true
  responses:
    BadRequest:
      description: Request sai cú pháp hoặc thiếu dữ liệu bắt buộc.
      headers:
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    Unauthorized:
      description: Thiếu hoặc sai Bearer token.
      headers:
        WWW-Authenticate:
          schema: { type: string, example: 'Bearer realm="wedding-api"' }
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    Forbidden:
      description: Đã xác thực nhưng không đủ quyền.
      headers:
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    NotFound:
      description: Không tìm thấy lời chúc.
      headers:
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    Conflict:
      description: Xung đột trạng thái hoặc Idempotency-Key.
      headers:
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    UnprocessableEntity:
      description: Đúng cú pháp nhưng vi phạm business rule.
      headers:
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/ValidationProblem" }
          examples:
            rsvp:
              value:
                type: https://api.wedding.example.com/problems/validation-error
                title: Dữ liệu không hợp lệ
                status: 422
                detail: number_attend phải >= 1 khi will_attend = true.
                code: VALIDATION_ERROR
                errors:
                  - { path: number_attend, message: Phải lớn hơn hoặc bằng 1, code: too_small }
    TooManyRequests:
      description: Vượt giới hạn tần suất.
      headers:
        Retry-After:
          schema: { type: integer, minimum: 1 }
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    ServerError:
      description: Lỗi không lường trước ở server.
      headers:
        X-Request-Id: { $ref: "#/components/headers/XRequestId" }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
  examples:
    MessageExample:
      summary: Một lời chúc đã lưu
      value:
        success: true
        data:
          id: 42
          sender_name: Nguyễn Minh Anh
          content: Chúc hai bạn trăm năm hạnh phúc!
          will_attend: true
          guest_of: Bạn thân cô dâu
          number_attend: 2
          created_at: "2026-10-25T10:00:00.000Z"
    MessagePageExample:
      summary: Trang đầu tiên
      value:
        success: true
        data:
          - id: 42
            sender_name: Nguyễn Minh Anh
            content: Chúc hai bạn trăm năm hạnh phúc!
            will_attend: true
            guest_of: Bạn thân cô dâu
            number_attend: 2
            created_at: "2026-10-25T10:00:00.000Z"
        page:
          next_cursor: eyJjcmVhdGVkX2F0IjoiMjAyNi0xMC0yNVQwOTo1ODowMFoiLCJpZCI6NDF9
          has_more: true
externalDocs:
  description: Hướng dẫn tích hợp và changelog
  url: https://docs.wedding.example.com/api
```

Danh sách trên **không** gồm `DELETE /messages` (xóa toàn bộ) vì đây là thao tác phá hủy
nguy hiểm; nếu buộc phải giữ, thêm `operationId: deleteAllMessages`, security
`messages:admin`, audit log và cân nhắc tắt ở production.

---

## 14. Từ spec đến code Hono + Zod

| Hướng | Cách làm | Khi nào |
|---|---|---|
| Spec-first | YAML → sinh type/client | Contract là nguồn sự thật, team đông |
| Code-first có spec | Zod → sinh OpenAPI | Team nhỏ, muốn một nguồn TypeScript |

Với Hono, `@hono/zod-openapi` mô tả route bằng Zod và sinh spec. Dù chọn hướng nào, chỉ
nên có **một nguồn sự thật**; nếu vừa viết YAML vừa viết Zod tay, phải có contract test.

```bash
bun add zod @hono/zod-openapi
```

```ts
// src/modules/messages/schema.ts
import { z } from "@hono/zod-openapi";

export const MessageSchema = z.object({
  id: z.number().int().positive(),
  sender_name: z.string().min(1).max(80),
  content: z.string().min(1).max(1000),
  will_attend: z.boolean(),
  guest_of: z.string().max(80).nullable(),
  number_attend: z.number().int().min(0).max(20),
  created_at: z.string().datetime(),
}).openapi("Message");

export const MessageCreateSchema = MessageSchema.omit({ id: true, created_at: true })
  .extend({
    guest_of: z.string().max(80).nullable().optional(),
    number_attend: z.number().int().min(0).max(20).default(1),
  })
  .refine((v) => v.will_attend !== true || v.number_attend >= 1, {
    path: ["number_attend"],
    message: "Phải >= 1 khi will_attend = true",
  })
  .openapi("MessageCreate");

export type Message = z.infer<typeof MessageSchema>;
```

`refine` xử lý điều kiện RSVP rõ hơn `if/then`; spec vẫn mô tả điều kiện để client biết.

```ts
// src/modules/messages/routes.ts
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { MessageSchema, MessageCreateSchema } from "./schema";
import { toResponse } from "./mapper";

const PageSchema = z.object({
  success: z.literal(true),
  data: z.array(MessageSchema),
  page: z.object({ next_cursor: z.string().nullable(), has_more: z.boolean() }),
});

export const messagesRoutes = new OpenAPIHono();

messagesRoutes.openapi(createRoute({
  method: "get", path: "/messages", operationId: "listMessages", tags: ["Messages"],
  request: { query: z.object({
    cursor: z.string().max(256).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })},
  responses: { 200: { description: "Danh sách lời chúc",
    content: { "application/json": { schema: PageSchema } } } },
}), async (c) => {
  const { cursor, limit } = c.req.valid("query");
  const { items, nextCursor } = await messageService.list({ cursor, limit });
  return c.json({
    success: true as const,
    data: items.map(toResponse),
    page: { next_cursor: nextCursor, has_more: nextCursor !== null },
  }, 200);
});

messagesRoutes.openapi(createRoute({
  method: "post", path: "/messages", operationId: "createMessage", tags: ["Messages"],
  request: { body: { required: true, content: { "application/json": { schema: MessageCreateSchema } } } },
  responses: { 201: { description: "Đã tạo",
    content: { "application/json": { schema: z.object({ success: z.literal(true), data: MessageSchema }) } } } },
}), async (c) => {
  const message = await messageService.create(c.req.valid("json"));
  return c.json({ success: true as const, data: toResponse(message) }, 201);
});
```

```ts
// src/app.ts
app.route("/api", messagesRoutes);
app.doc("/openapi.json", { openapi: "3.1.0", info: { title: "Wedding API", version: "1.0.0" } });
```

Nếu YAML là nguồn sự thật: `bunx openapi-typescript docs/openapi/openapi.yaml -o
src/types/api.d.ts`, dùng type sinh ra cho handler, Zod chỉ validate runtime. Thêm test
so sánh schema Zod với spec (hoặc generate Zod bằng `orval`). Không sửa tay file generated.

---

## 15. Anti-patterns

| Anti-pattern | Vì sao xấu | Cách sửa |
|---|---|---|
| Spec viết sau, không cập nhật | Docs lệch, mất niềm tin | Bắt buộc spec trong PR, CI diff |
| `nullable: true` trong 3.1 | Bị bỏ qua, client sai type | `type: [T, "null"]` |
| Không có `operationId` | Codegen sinh tên khó đoán | `verbNoun` duy nhất |
| Path chứa động từ (`/getMessages`) | Phá REST, khó mở rộng | Method + noun |
| Trả `200` + `success: false` | Phá HTTP semantics, monitoring sai | 4xx/5xx + problem+json |
| Mọi lỗi trả `500` | Không phân biệt client/server | Map status đúng |
| `limit` không giới hạn | Một request kéo cả bảng | `maximum: 50` |
| Cursor base64 không ký | Client tự chế cursor, lộ dữ liệu | Opaque + HMAC nếu cần |
| Dùng chung schema request/response | Lộ `id`, `created_at` | Tách Create/Replace/Patch/Read |
| `additionalProperties: false` khắp nơi | Chặn metadata mở rộng | Chỉ đặt khi thật sự đóng |
| Enum đóng cho dữ liệu mở | Thêm giá trị là breaking | String + docs hoặc version |
| API key trong query | Lộ trong log/Referer | `Authorization` header |
| Example không khớp schema | Docs gây hiểu nhầm, test fail | Lint example, dùng `$ref` |
| Copy-paste schema | Sửa một nơi, quên nơi khác | Component khi dùng ≥ 2 |
| `$ref` remote trong CI | Build phụ thuộc mạng | Bundle trước |
| Spec 1000 dòng một file | Conflict, khó review | Tách components/paths |
| Không mô tả lỗi | Client không biết xử lý | 400/401/404/422/429/500 |
| Version trong `operationId` | SDK đổi tên mỗi version | Version ở server/path |
| Dùng OpenAPI cho WebSocket | Không mô tả được frame | Tài liệu riêng |

---

## 16. Bài tập và checklist

**Bài tập**

1. Viết spec `GET /messages/{messageId}` đủ 200/404/500, `ETag`, example; chạy
   `redocly lint`.
2. Thiết kế cursor pagination và test không trùng/thiếu khi chèn bản ghi giữa hai trang.
3. Migration một spec 3.0 có `nullable` sang 3.1, thêm webhook, chạy `oasdiff`.
4. Bảo vệ PUT/PATCH/DELETE bằng Bearer JWT, giữ POST public; viết 401/403 với
   `WWW-Authenticate`.
5. Dùng `openapi-typescript` hoặc `orval` sinh client, viết hàm gọi API có type.
6. Dựng Prism mock từ spec, cho frontend gọi thử; sau đó chạy Schemathesis với server thật.
7. Review chéo spec với đồng nghiệp, tìm ít nhất 3 vấn đề thiết kế trước khi code.

**Checklist trước khi merge spec**

- [ ] `openapi: 3.1.x`, `info.title`, `info.version` đầy đủ.
- [ ] `servers` có local + production, không chứa secret.
- [ ] Mỗi operation có `operationId` duy nhất và `tags`.
- [ ] Path parameter có `required: true`.
- [ ] Request body có schema + ít nhất một example.
- [ ] Response thành công có schema + example.
- [ ] Có lỗi 400/401/403/404/422/429/500 phù hợp.
- [ ] Lỗi dùng `application/problem+json` (RFC 9457).
- [ ] Không dùng `nullable`; null dùng `type: [T, "null"]`.
- [ ] `required`, `minLength`, `maxLength`, `minimum`, `maximum` hợp lý.
- [ ] `readOnly`/`writeOnly` đúng; không leak field nội bộ.
- [ ] Security đúng root/operation; scope rõ ràng.
- [ ] Pagination có cursor opaque + giới hạn `limit`.
- [ ] Example khớp schema (lint không báo).
- [ ] Không có `$ref` remote chưa bundle.
- [ ] `redocly lint` pass; `oasdiff breaking` không có thay đổi ngoài dự kiến.
- [ ] Docs render được trên mobile.
- [ ] Changelog/migration note nếu có breaking change.

---

## 17. Tài liệu tham khảo

- [OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- [OpenAPI Specification 3.1.1](https://spec.openapis.org/oas/v3.1.1.html)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 8594 — The Sunset HTTP Header Field](https://www.rfc-editor.org/rfc/rfc8594)
- [RFC 9745 — The Deprecation HTTP Response Header Field](https://www.rfc-editor.org/rfc/rfc9745)
- [RFC 6749 — OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [Spectral](https://stoplight.io/open-source/spectral) · [Redocly CLI](https://redocly.com/docs/cli)
- [OpenAPI Generator](https://openapi-generator.tech/) · [orval](https://orval.dev/) ·
  [hey-api](https://heyapi.dev/) · [Scalar](https://scalar.com/)
- [Schemathesis](https://schemathesis.readthedocs.io/) · [Prism](https://stoplight.io/open-source/prism) ·
  [oasdiff](https://github.com/oasdiff/oasdiff)

Xem thêm: [01-fundamentals.md](./01-fundamentals.md) · [02-rest-design.md](./02-rest-design.md) ·
[04-lifecycle-process.md](./04-lifecycle-process.md) · [05-project-structure.md](./05-project-structure.md) ·
[06-testing-observability.md](./06-testing-observability.md) · [07-checklists-templates.md](./07-checklists-templates.md) ·
[../api-security.md](../api-security.md) · [../websocket.md](../websocket.md).
