# Cấu trúc dự án API — Hướng dẫn trung lập, đa stack

> Hướng dẫn tổ chức code API độc lập với framework/cơ sở dữ liệu cụ thể. So sánh kiến trúc, cây thư mục generic, ranh giới layer/module, DTO/entity, validation, error handling, config, DI, middleware, repository, background job/outbox, testing. Áp dụng cho Express/Fastify/NestJS, FastAPI/Django, Spring, Go hoặc các stack khác.

---

## Mục lục

1. [Mục tiêu và nguyên tắc](#1-mục-tiêu-và-nguyên-tắc)
2. [So sánh các kiến trúc phân lớp](#2-so-sánh-các-kiến-trúc-phân-lớp)
3. [Nguyên tắc thiết kế ranh giới](#3-nguyên-tắc-thiết-kế-ranh-giới)
4. [Cấu trúc thư mục chuẩn (trung lập)](#4-cấu-trúc-thư-mục-chuẩn-trung-lập)
5. [Trách nhiệm từng layer và luồng request](#5-trách-nhiệm-từng-layer-và-luồng-request)
6. [DTO, schema, domain entity và DB row](#6-dto-schema-domain-entity-và-db-row)
7. [Validation ở biên](#7-validation-ở-biên)
8. [Error handling tập trung (RFC 9457)](#8-error-handling-tập-trung-rfc-9457)
9. [Config và secrets](#9-config-và-secrets)
10. [Dependency injection và composition root](#10-dependency-injection-và-composition-root)
11. [Middleware](#11-middleware)
12. [Database access, repository và transaction](#12-database-access-repository-và-transaction)
13. [Background jobs, webhooks và outbox](#13-background-jobs-webhooks-và-outbox)
14. [API versioning, authn/authz](#14-api-versioning-authnauthz)
15. [Logging, tracing, health/readiness](#15-logging-tracing-healthreadiness)
16. [OpenAPI và docs trong repo](#16-openapi-và-docs-trong-repo)
17. [Cấu trúc test](#17-cấu-trúc-test)
18. [Lộ trình refactor từ monolith lớn](#18-lộ-trình-refactor-từ-monolith-lớn)
19. [So sánh theo stack (tham khảo)](#19-so-sánh-theo-stack-tham-khảo)
20. [Checklist cấu trúc dự án](#20-checklist-cấu-trúc-dự-án)
21. [Anti-patterns](#21-anti-patterns)
22. [Tài liệu tham khảo](#22-tài-liệu-tham-khảo)

---

## 1. Mục tiêu và nguyên tắc

Mục tiêu: **dễ đọc, dễ test, dễ thay đổi**. Cấu trúc phải tối ưu cho thay đổi, không phải cho biểu đồ lý thuyết.

| Mục tiêu | Biểu hiện thực tế |
|---|---|
| Dễ đọc | Mở module là hiểu ngay phạm vi; tên file nói rõ vai trò |
| Dễ test | Business rule test được mà không cần HTTP/DB thật |
| Dễ thay đổi | Thay đổi DB/transport chỉ ảnh hưởng vài lớp |
| Ranh giới rõ | Module không đọc trộm dữ liệu/module khác |
| Ít bất ngờ | Không side-effect khi import, không singleton ẩn |
| Onboard nhanh | Dev mới thêm endpoint theo khuôn mẫu |

**Nguyên tắc:**
1. **Bắt đầu đơn giản, tách khi đau** — không over-engineer.
2. **Phụ thuộc một chiều** — domain/core không phụ thuộc framework/infra.
3. **Theo feature (module), không chỉ theo layer** — gom route/service/repo của cùng feature.
4. **Contract ở biên** — validate input/output, map rõ ràng.
5. **Composition root duy nhất** — nối dependency ở một nơi.
6. **Chỉ tạo abstraction khi cần** — interface chỉ khi có >=2 implementation hoặc cần fake test.

> ⚠️ Nhiều lớp không đồng nghĩa với kiến trúc tốt. Nếu lớp chỉ forward, hãy bỏ.

---

## 2. So sánh các kiến trúc phân lớp

| Kiến trúc | Ý tưởng | Ưu điểm | Nhược điểm | Khi dùng |
|---|---|---|---|---|
| MVC | Model-View-Controller | Quen thuộc, nhanh | Logic dễ dồn controller/model | Prototype |
| Layered (N-tier) | Controller/Handler → Service → Repository | Đơn giản, dễ hiểu | Dễ thành anemic service | API nhỏ/vừa (phổ biến) |
| Ports & Adapters (Hexagonal) | Domain core + ports + adapters | Thay infra dễ, test domain thuần | Nhiều interface/mapping | Nhiều adapter, tích hợp phức tạp |
| Clean Architecture | Entities → Use Cases → Interface Adapters → Frameworks | Ranh giới mạnh, độc lập framework | Ceremony nhiều, khó onboard | Hệ thống lớn, lâu dài, nhiều team |
| Modular Monolith | Module theo feature, layer bên trong | Ranh giới rõ, deploy đơn giản, dễ chuyển microservice sau này | Cần kỷ luật import | **Khuyến nghị mặc định** |

**Khuyến nghị:** Modular monolith + layered trong module. Chỉ dùng hexagonal/clean khi thực sự có lý do (nhiều adapter, domain phức tạp).

---

## 3. Nguyên tắc thiết kế ranh giới

- **Dependency rule:** phụ thuộc chỉ theo hướng vào trong (infra → interface adapter → application/use case → domain).
- **Domain thuần:** entity/value object không import framework/DB/HTTP.
- **Application/Service:** orchestrate use case, transaction boundary, authorization.
- **Interface Adapters:** HTTP handlers/routes, presenters/mappers, repository implementations.
- **Infrastructure:** DB client, HTTP client, queue, logger, config.
- **Module boundary:** module A không import file nội bộ module B, chỉ qua public API (`index.ts`).
- **Shared kernel:** chỉ thứ thực sự dùng chung bởi nhiều module và không thuộc domain cụ thể.
- **Anti-corruption layer:** khi tích hợp hệ thống bên ngoài.

---

## 4. Cấu trúc thư mục chuẩn (trung lập)

```text
project-root/
├── src/
│   ├── app/                    # Khởi tạo app, router, middleware global
│   │   ├── app.ts
│   │   ├── router.ts
│   │   └── server.ts
│   ├── config/                 # Config/env validation
│   │   └── env.ts
│   ├── core/                   # Cross-cutting: errors, types, constants
│   │   ├── errors.ts           # AppError + problem+json helpers
│   │   └── types.ts
│   ├── shared/                 # Thuần, dùng chung
│   │   ├── lib/                # utils thuần (pagination, cursor, date)
│   │   ├── validators/         # schema dùng chung
│   │   └── dto/                # base DTO
│   ├── modules/                # Feature modules
│   │   ├── customers/
│   │   │   ├── api/            # routes/handlers/controllers
│   │   │   ├── application/    # services/use-cases
│   │   │   ├── domain/         # entities/value-objects/rules
│   │   │   ├── infrastructure/ # repository impl, mappers
│   │   │   ├── schemas/        # validation schema (DTO/schema)
│   │   │   ├── types.ts
│   │   │   └── index.ts        # public API
│   │   ├── products/
│   │   ├── orders/
│   │   └── payments/
│   ├── infra/                  # Infrastructure adapters toàn cục
│   │   ├── db/
│   │   ├── logger/
│   │   ├── queue/
│   │   └── http-client/
│   ├── middleware/             # Global middleware
│   └── main.ts                 # Entry point (composition root wiring)
├── docs/
│   ├── api/                    # Tài liệu API
│   └── openapi/                # openapi.yaml + dist
├── migrations/                 # DB migrations
├── scripts/                    # Seed/migrate/dev tools
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── e2e/
├── .env.example
└── README.md
```

**Quy ước:**
- `main.ts`/`server.ts` chỉ khởi động, không business logic
- `app/` cấu hình framework
- `modules/*/index.ts` chỉ export public
- `infra/` biết về công cụ cụ thể (driver/SDK)
- `core/` không import module/framework

---

## 5. Trách nhiệm từng layer và luồng request

| Layer | Làm gì | Không làm gì |
|---|---|---|
| `api/handlers/routes` | Bind HTTP, parse params/query/body, validate, gọi use case/service, map response, set status/header | Business rule, SQL/raw query |
| `application/use-cases/services` | Orchestrate, enforce business rule, authorization, transaction, publish events | Biết Request/Response framework, chi tiết driver DB |
| `domain/entities/value-objects` | Invariant, state machine, pure logic | I/O, framework |
| `infrastructure/repositories` | Truy cập dữ liệu, map row↔entity/DTO, xử lý lỗi DB | Quyết định HTTP status, business rule phức tạp |
| `schemas/` | Validation schema, type inference | Logic nghiệp vụ |
| `mappers/` | Chuyển đổi entity↔DTO | Gọi DB/HTTP |

**Luồng request chuẩn:**
```text
HTTP → middleware (request-id, logger, authn, rate-limit, body-limit)
→ route match → validate schema
→ handler → application service/use case
→ domain (nếu cần) → repository interface
→ infrastructure repo impl → DB/externals
→ mapper → response (DTO) → error handler nếu lỗi
```

**Quy tắc dependency:** routes → application → domain (core), application → repository interface, infrastructure implements interface.

---

## 6. DTO, schema, domain entity và DB row

| Loại | Mục đích | Case | Vị trí |
|---|---|---|---|
| DB row | Khớp schema bảng, snake_case | Từ persistence | `infrastructure` |
| Domain entity | Invariant nghiệp vụ, bất biến khi có thể | Core logic | `domain` |
| Application DTO/Command | Input cho use case (đã validate) | Orchestration | `application` hoặc `types` |
| Request schema/DTO | Contract HTTP input | Validation | `schemas`/`api` |
| Response DTO | Contract HTTP output (chỉ field cần thiết) | Presenter | `api`/`shared/dto` |

**Nguyên tắc:**
- Không trả raw DB row ra HTTP
- Map tường minh (tránh spread toàn bộ)
- Ẩn trường nội bộ (audit, soft delete flag không cần expose)
- Dùng `camelCase`/`snake_case` nhất quán với contract
- Thời gian UTC ISO 8601, tiền integer minor units

---

## 7. Validation ở biên

Validate **tất cả** input từ bên ngoài: path, query, headers, body. Chọn schema validator (Zod, Yup, class-validator, Pydantic...) phù hợp stack.

**Yêu cầu:**
- Strict: từ chối field không mong đợi hoặc strip có chủ đích
- Trim, normalize
- Ràng buộc độ dài/miền giá trị
- Cross-field validation (refine/conditional)
- Coerce cẩn thận cho query
- Trả lỗi validation theo format nhất quán (RFC 9457 + `errors[]` nếu cần)

**Quy tắc:** validate ở HTTP layer, use case nhận dữ liệu đã validate + typed.

---

## 8. Error handling tập trung (RFC 9457)

Dùng `ApplicationError`/`AppError` với `code`, `status`, `details`. Error handler toàn cục map mọi lỗi.

**Cấu trúc problem+json gợi ý:**
```json
{
  "type": "https://api.example.com/problems/validation-failed",
  "title": "Dữ liệu không hợp lệ",
  "status": 422,
  "detail": "Một hoặc nhiều trường không hợp lệ",
  "instance": "/orders",
  "requestId": "req_9f3a...",
  "errors": [
    { "field": "items", "issue": "Phải có ít nhất một sản phẩm" }
  ]
}
```

**Quy tắc:**
- Không leak stack trace/message DB ra client (log nội bộ)
- Phân biệt lỗi dự kiến (`AppError`) vs không dự kiến (→ 500)
- Map lỗi DB/common sang `AppError` tại repository/adapter
- Thêm `requestId`/correlation id
- 4xx có ý nghĩa client fix, 5xx server issue

---

## 9. Config và secrets

**Yêu cầu:**
- Parse và validate env một lần khi khởi động (fail-fast)
- Có `.env.example` đầy đủ
- Không đọc `process.env` rải rác
- Secret chỉ từ secret manager/CI
- Phân biệt config theo môi trường
- Không commit secret
- Type-safe config export

**Gợi ý schema env:** `NODE_ENV`, `PORT`, `DATABASE_URL`, `LOG_LEVEL`, `AUTH_ISSUER`, `AUTH_AUDIENCE`, `RATE_LIMIT_*`, v.v.

---

## 10. Dependency injection và composition root

Mục tiêu: dễ test, dễ hoán đổi implementation.

**Cách đơn giản (khuyến nghị):** Constructor injection + factory trong `main.ts`/`container`.

```text
main.ts (composition root)
  → create infra clients
  → create repo impls
  → create services/use cases
  → create handlers/routes
  → create app
  → start server
```

**Quy tắc:**
- Tránh singleton module-level cho dependency có state/external
- Dùng interface cho dependency cần fake/mock
- `app` nhận deps, không tự tạo
- Test truyền fakes vào app/factory

Không cần DI container nặng nếu không thực sự cần. Constructor injection đủ cho đa số trường hợp.

---

## 11. Middleware

Thứ tự gợi ý:
```text
requestId → accessLog → cors → bodyLimit → rateLimit → compression → authn → authz → routes → errorHandler
```

| Middleware | Mục đích | Ghi chú |
|---|---|---|
| `request-id` | Gắn/copy `X-Request-Id`, trả về response | Dùng để correlate log/trace |
| `access-log` | Structured log request/response | Không log body nhạy cảm |
| `cors` | Cross-origin policy | Không dùng `*` với credentials |
| `body-limit` | Giới hạn kích thước body | Chống payload lớn |
| `rate-limit` | Chống abuse | Nên dùng Redis cho multi-instance |
| `authn` | Xác thực token/session | Verify chữ ký/exp/iss/aud |
| `authz` | Phân quyền theo resource/role/scope | Enforce server-side |
| `error-handler` | Chuẩn hóa lỗi RFC 9457 | Bắt mọi exception |

---

## 12. Database access, repository và transaction

### 12.1 Repository pattern
- Interface định nghĩa trong `application` hoặc `domain` (tuỳ hướng)
- Implementation trong `infrastructure/repositories`
- Chỉ repo biết query/ORM/SQL chi tiết
- Map row → entity/DTO

### 12.2 Transaction
| Tình huống | Giải pháp |
|---|---|
| Một thao tác đơn | Atomic sẵn |
| Nhiều thao tác phải atomic | Transaction unit of work (UoW) |
| Nhiều bước phức tạp | Application service quản lý transaction boundary |
| Outbox + business write | Cùng transaction |

Tránh mở transaction dài, tránh gọi external API trong transaction.

### 12.3 Migration
- Migrations versioned, không sửa migration đã chạy production
- Có rollback plan
- Expand/contract cho breaking schema change
- Backfill theo batch
- Index cho query thực tế
- Xem xét lock/thời gian chạy

---

## 13. Background jobs, webhooks và outbox

Khi cần xử lý bất đồng bộ (gửi email, cập nhật bên ngoài, báo cáo):

| Thành phần | Vai trò |
|---|---|
| Queue/Worker | Xử lý job, retry, concurrency |
| Job handler | Idempotent, có timeout |
| Outbox table | Đảm bảo event không mất khi commit DB |
| Dead Letter Queue (DLQ) | Lưu job fail vĩnh viễn để xử lý tay |
| Webhook dispatcher | Ký HMAC, timeout, retry backoff, idempotency |

**Outbox pattern:**
1. Trong cùng transaction: ghi business data + row `outbox` (pending)
2. Worker poll `FOR UPDATE SKIP LOCKED` → publish → mark sent/failed
3. Retry với exponential backoff + jitter

**Quy tắc:** job phải idempotent, không gọi external trong DB transaction, có retry giới hạn, log traceable.

---

## 14. API versioning, authn/authz

### 14.1 Versioning
Chỉ version khi breaking. Cách phổ biến:
- URI: `/v1/orders` (rõ ràng, dễ cache)
- Header: `Accept: application/vnd.example.v1+json`
- Content negotiation

Ưu tiên đơn giản, nhất quán với catalog/docs.

### 14.2 AuthN/AuthZ
- **AuthN:** JWT (access+refresh), OAuth2/OIDC, API key tùy use case
- **AuthZ:** RBAC/ABAC, check server-side, theo resource (owner check)
- **Principle:** least privilege, deny by default
- **Tokens:** short-lived access, rotation, revoke
- **API key:** rate limit, scope, rotation

---

## 15. Logging, tracing, health/readiness

| Endpoint | Mục đích | Kiểm tra |
|---|---|---|
| `GET /health/live` | Liveness | Process sống, không cần dependency |
| `GET /health/ready` | Readiness | DB/queue/critical dependency sẵn sàng |
| `GET /metrics` | Metrics (Prometheus) | Bảo vệ hoặc internal |

**Logging:** structured JSON, `requestId`, `traceId`, không log PII/secret, log level hợp lý.
**Tracing:** OpenTelemetry, propagate context, sample phù hợp.
**Metrics:** RED/USE, business metrics quan trọng.

---

## 16. OpenAPI và docs trong repo

- Lưu `docs/openapi/openapi.yaml` trong repo
- Lint trong CI (Redocly/Spectral)
- `openapi-diff` phát hiện breaking change
- Sinh type/client nếu cần
- Render docs tự động
- Contract test đối chiếu response

Xem [03-openapi.md](./03-openapi.md).

---

## 17. Cấu trúc test

| Loại | Phạm vi | Tốc độ | Mục đích |
|---|---|---|---|
| Unit | Domain/service thuần | Nhanh | Logic, rule, mapping |
| Integration | Handler + repo + DB test | Trung bình | Tích hợp layer |
| Contract | HTTP ↔ OpenAPI | Trung bình | Khớp contract |
| E2E | Toàn hệ thống | Chậm | Luồng quan trọng |

**Quy tắc:** test theo hành vi, dùng factory/fixture, cô lập dữ liệu, không phụ thuộc thứ tự, fake cho unit, test DB thật cho integration quan trọng.

Xem [06-testing-observability.md](./06-testing-observability.md).

---

## 18. Lộ trình refactor từ monolith lớn

Thực hiện **từng bước, giữ parity**:

1. **Khảo sát** — map routes, dependency, dữ liệu, rủi ro
2. **Tách config/env** — fail-fast, type-safe
3. **Xây composition root** — nối dependency rõ ràng
4. **Tách module đầu tiên** (ít phụ thuộc nhất) — routes/service/repo
5. **Đưa lỗi chuẩn hóa** — AppError + error handler
6. **Thêm validation/contract test** — bảo vệ behavior
7. **Lặp lại** — module theo module, không big bang

**Nguyên tắc:** mỗi PR nhỏ, CI xanh, rollback dễ.

---

## 19. So sánh theo stack (tham khảo)

| Khái niệm | Node/TS (Express/Fastify) | Python (FastAPI) | Java (Spring) | Go |
|---|---|---|---|---|
| Entry | `main.ts`/`server.ts` | `main.py`/`app.py` | `Application.java` | `cmd/api/main.go` |
| Router/Controller | routes/handlers | APIRouter/controllers | @RestController | router/handler |
| Service/Use case | services/use-cases | services/use_cases | @Service | service/ |
| Repository | repositories | repositories/dao | @Repository/JPA | repository/ |
| DI | constructor/factory | Depends() | IoC container | constructor/wire |
| Validation | Zod/Yup/class-validator | Pydantic | Bean Validation | validator |
| Config | env + schema | pydantic-settings | @ConfigurationProperties | env/config |

Tinh thần giống nhau: **biên rõ, phụ thuộc một chiều, domain độc lập framework**.

---

## 20. Checklist cấu trúc dự án

- [ ] `main`/`server` chỉ khởi động
- [ ] Composition root nối tất cả dependency
- [ ] Modules theo feature, có public API
- [ ] Domain không phụ thuộc infra/framework
- [ ] Repository interface + implementation tách biệt
- [ ] Validation ở biên
- [ ] AppError + error handler toàn cục (RFC 9457)
- [ ] Config/env validate fail-fast
- [ ] Middleware đúng thứ tự
- [ ] Transaction boundary rõ ràng
- [ ] Logging/trace/request-id
- [ ] Health/ready/metrics
- [ ] OpenAPI trong repo + lint
- [ ] Test theo pyramid
- [ ] Không circular dependency

---

## 21. Anti-patterns

| Anti-pattern | Hệ quả | Cách sửa |
|---|---|---|
| Fat controller/handler | Khó test, logic phân tán | Chuyển sang service/use case |
| Anemic domain | Invariant không được bảo vệ | Đưa rule vào entity/value object |
| Repository trả raw row | Leak DB, khó đổi persistence | Map sang entity/DTO |
| Service import framework/driver | Khó test/hoán đổi | Inject interface |
| Singleton ẩn | Khó test, side effect | Composition root + DI |
| `utils/` khổng lồ | Không rõ ownership | `shared/lib` nhỏ hoặc theo domain |
| Try/catch lặp khắp nơi | Trùng lặp | Error handler toàn cục |
| Business logic trong migration/route | Rối rắm | Đặt đúng layer |
| Gọi external trong transaction dài | Lock kéo dài, fail cascade | Tách ra ngoài hoặc dùng outbox |

---

## 22. Tài liệu tham khảo

- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Modular Monoliths](https://www.kamilgrzybek.com/blog/posts/modular-monolith-architecture)
- [RFC 9457 - Problem Details](https://www.rfc-editor.org/rfc/rfc9457)
- [12-Factor App](https://12factor.net/)
- [Transaction Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)

Xem thêm: [01-fundamentals.md](./01-fundamentals.md) · [02-rest-design.md](./02-rest-design.md) · [03-openapi.md](./03-openapi.md) · [04-lifecycle-process.md](./04-lifecycle-process.md) · [06-testing-observability.md](./06-testing-observability.md) · [07-checklists-templates.md](./07-checklists-templates.md)
