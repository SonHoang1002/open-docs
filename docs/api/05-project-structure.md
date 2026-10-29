# Cấu trúc dự án API — Bun + Hono + TypeScript

> Hướng dẫn tổ chức code cho API Bun/Hono/TypeScript: so sánh kiến trúc, cây thư mục,
> trách nhiệm từng layer, DTO/schema/entity, validation, error handling, config, DI,
> middleware, repository, test và lộ trình refactor `index.ts` hiện tại thành module.
> Mục tiêu không phải "đúng mô hình" mà là **dễ đọc, dễ test, dễ thay đổi**.

---

## Mục lục

1. [Mục tiêu và nguyên tắc](#1-mục-tiêu-và-nguyên-tắc)
2. [So sánh các kiến trúc phân lớp](#2-so-sánh-các-kiến-trúc-phân-lớp)
3. [Cấu trúc thư mục chuẩn](#3-cấu-trúc-thư-mục-chuẩn)
4. [Trách nhiệm từng layer và luồng request](#4-trách-nhiệm-từng-layer-và-luồng-request)
5. [DTO, schema, domain entity và DB row](#5-dto-schema-domain-entity-và-db-row)
6. [Validation với Zod](#6-validation-với-zod)
7. [Error handling tập trung](#7-error-handling-tập-trung)
8. [Config và secrets](#8-config-và-secrets)
9. [Dependency injection và composition root](#9-dependency-injection-và-composition-root)
10. [Middleware](#10-middleware)
11. [Database access và repository](#11-database-access-và-repository)
12. [Background jobs, webhooks và outbox](#12-background-jobs-webhooks-và-outbox)
13. [OpenAPI và docs trong repo](#13-openapi-và-docs-trong-repo)
14. [Cấu trúc test](#14-cấu-trúc-test)
15. [Refactor repo hiện tại](#15-refactor-repo-hiện-tại)
16. [Cấu trúc tham khảo: NestJS, Go, Laravel](#16-cấu-trúc-tham-khảo-nestjs-go-laravel)
17. [Checklist cấu trúc dự án](#17-checklist-cấu-trúc-dự-án)
18. [Anti-patterns](#18-anti-patterns)
19. [Tài liệu tham khảo](#19-tài-liệu-tham-khảo)

---

## 1. Mục tiêu và nguyên tắc

Một cấu trúc tốt tối ưu cho **thay đổi**, không phải cho vẻ đẹp của sơ đồ:

| Mục tiêu | Biểu hiện thực tế |
|---|---|
| Dễ đọc | Mở module là biết nó làm gì; tên file nói lên vai trò |
| Dễ test | Business rule test được không cần HTTP/DB thật |
| Dễ thay đổi | Đổi Supabase → Postgres khác chỉ sửa repository |
| Ranh giới rõ | Module không đọc trộm bảng của module khác |
| Ít bất ngờ | Không có singleton ẩn, không side effect khi import |
| Onboard nhanh | Dev mới thêm endpoint theo đúng khuôn trong 1 ngày |

**Nguyên tắc thực dụng:**

1. **Bắt đầu đơn giản, tách khi đau.** Repo 3 endpoint không cần 40 thư mục. Nhưng khi
   `index.ts` đã trộn route + SQL + validation + WebSocket, việc tách là cần thiết.
2. **Phụ thuộc một chiều.** Route biết service; service biết repository interface;
   repository biết DB. Domain không biết Hono/Supabase.
3. **Boundary theo feature, không theo layer toàn cục.** `modules/messages` chứa đủ
   route/service/repo của nó; tránh `controllers/`, `services/`, `repositories/` khổng lồ.
4. **Contract ở biên.** Dữ liệu vào/ra được validate và map rõ ràng; không trả raw DB row.
5. **Composition root duy nhất.** Mọi dependency được nối ở `index.ts`/`container.ts`,
   không gọi `createClient()` rải rác.
6. **Không tối ưu cho tương lai xa.** Interface chỉ tạo khi có nhu cầu thay thế/test thật.

> ⚠️ "Clean architecture" không có nghĩa là nhiều folder hơn. Nếu một lớp chỉ chuyển
> tiếp 1-1 mà không có logic, nó đang làm code khó đọc hơn.

---

## 2. So sánh các kiến trúc phân lớp

| Kiến trúc | Ý tưởng | Ưu điểm | Nhược điểm | Khi nào dùng |
|---|---|---|---|---|
| **MVC** | Model – View – Controller | Quen thuộc, nhanh cho CRUD | API không có "View"; logic dễ dồn vào controller/model | Prototype, ứng dụng nhỏ |
| **Layered** | Controller → Service → Repository | Đơn giản, dễ hiểu | Dễ thành anemic service/transaction script; layer ngang cồng kềnh | Mặc định cho API nhỏ/vừa |
| **Hexagonal (ports & adapters)** | Domain core + port + adapter | Thay infra dễ, test domain thuần | Nhiều interface/mapping; overkill nếu ít infra | Nhiều nguồn dữ liệu, tích hợp phức tạp |
| **Clean architecture** | Entity → use case → adapter → framework | Ranh giới mạnh, độc lập framework | Nhiều ceremony, khó onboard | Hệ thống lớn, sống lâu, nhiều team |
| **Modular monolith** | Module theo feature, layer bên trong | Ranh giới rõ, deploy đơn giản | Cần kỷ luật để không import chéo | **Mặc định tốt cho repo này** |

**Khuyến nghị cho wedding-server:** modular monolith + layered trong từng module, với
domain type thuần ở giữa. Mỗi module chỉ cần `routes`, `schema`, `service`, `repository`,
`mapper`, `types`; không cần full hexagonal/clean.

Khi nào nâng cấp:

- Có ≥ 2 adapter cho cùng port (Supabase + Postgres thuần, hoặc memory cho test) → tách
  interface rõ (hexagonal nhẹ).
- Business rule phức tạp, nhiều use case/transaction → tách `application/` + `domain/`.
- Nhiều team cùng sửa một module → tách module vật lý/package.

Không nâng cấp chỉ vì "nghe chuyên nghiệp hơn".

---

## 3. Cấu trúc thư mục chuẩn

```text
wedding-server/
├── src/
│   ├── index.ts                  # Bun.serve + WebSocket upgrade
│   ├── app.ts                    # createApp(deps)
│   ├── container.ts              # composition root
│   ├── config/env.ts             # parse + validate env
│   ├── core/{errors,types}.ts    # AppError, shared types
│   ├── infra/{supabase,realtime,logger}.ts
│   ├── middleware/               # request-id, logger, error-handler,
│   │                             # auth, rate-limit, body-limit, cors
│   ├── lib/{cursor,pagination}.ts
│   ├── modules/
│   │   ├── messages/             # index, routes, service, repository,
│   │   │                         # schema, mapper, types, errors
│   │   ├── health/routes.ts
│   │   └── realtime/{routes,hub}.ts
│   └── types/api.d.ts            # generated từ OpenAPI
├── tests/
│   ├── unit/modules/messages/service.test.ts
│   ├── integration/messages.routes.test.ts
│   ├── e2e/guestbook.test.ts
│   ├── contract/messages.contract.test.ts
│   └── fixtures/messages.ts
├── docs/
│   ├── api/                      # bộ tài liệu API
│   └── openapi/{openapi.yaml,dist/}
├── supabase/migrations/          # 20261025000000_create_messages.sql
├── scripts/{seed,check-db}.ts
├── .env.example
├── package.json
└── tsconfig.json
```

Quy ước:

- `index.ts` **chỉ** khởi động server và nối WebSocket; không chứa business logic.
- `app.ts` nhận dependency, không import singleton; test có thể gọi `createApp(fakes)`.
- `modules/<feature>/index.ts` export route + service public; module khác không import
  file nội bộ.
- `lib/` chỉ chứa hàm thuần, không phụ thuộc module cụ thể.
- `types/api.d.ts` là generated; thêm vào `.gitignore` hoặc commit có kiểm soát.

---

## 4. Trách nhiệm từng layer và luồng request

| Layer | Làm gì | Không làm gì |
|---|---|---|
| `routes` | Binding HTTP: method/path, validate input, gọi controller/service, set status/header | Business rule, SQL |
| `controller` (tùy chọn) | Orchestration: lấy actor, gọi service, map domain → response | Query DB trực tiếp |
| `service` | Business rule, authorization, transaction boundary, phát event | Biết `Request`/`Response` của Hono |
| `repository` | Query DB, map row, xử lý lỗi DB | Quyết định HTTP status |
| `schema` | Zod schema cho input/output | Logic nghiệp vụ |
| `mapper` | Chuyển row ↔ domain ↔ DTO | Gọi DB/HTTP |
| `types` | Domain type, interface port | Import Hono/Supabase |
| `errors` | Lỗi đặc thù module | Format response |

**Luồng request:**

```text
HTTP request
  → requestId → logger → cors → bodyLimit → rateLimit → auth
  → route match → validate (Zod)
  → controller (actor, params)
  → service (business rule, authz, event)
  → repository (Supabase query)
  → mapper (row → domain → DTO)
  → response (status, headers)
  ↘ error → error-handler → problem+json
```

**Quy tắc dependency:**

```text
routes → controller → service → repository (interface)
                         ↘ realtime/logger (interface)
repository → infra/supabase (implementation)
domain/types → không import gì từ Hono, Supabase, module khác
```

- Không import `supabase` trong `service`; inject qua repository.
- Không import `repository` của module khác; gọi service/public API của module đó.
- `lib` không import `modules`.
- Có thể enforce bằng `eslint-plugin-boundaries`, `dependency-cruiser`, hoặc script
  kiểm tra import trong CI.

> 💡 Nếu một hàm cần cả `c.req` và query DB, nó đang trộn route với repository. Tách ra.

---

## 5. DTO, schema, domain entity và DB row

Bốn khái niệm dễ bị gộp, dẫn tới leak dữ liệu hoặc khó thay đổi:

| Loại | Hình dạng | Ví dụ | Ai dùng |
|---|---|---|---|
| **DB row** | Đúng cột DB, `snake_case` | `{ id, sender_name, ip_hash, deleted_at }` | Repository |
| **Domain entity** | Bất biến nghiệp vụ, `camelCase` | `{ id, senderName, content, ... }` | Service |
| **Request DTO** | Field client được gửi | `{ sender_name, content, will_attend }` | Route/validation |
| **Response DTO** | Field client được nhận | `{ id, sender_name, ..., created_at }` | Route/serializer |

Mapping tường minh, không spread:

```ts
// types.ts — domain dùng camelCase, row giữ snake_case
export type Message = {
  id: number; senderName: string; content: string; willAttend: boolean;
  guestOf: string | null; numberAttend: number; createdAt: Date;
};
export type MessageRow = {
  id: number; sender_name: string; content: string; will_attend: boolean;
  guest_of: string | null; number_attend: number; created_at: string;
  ip_hash?: string | null; deleted_at?: string | null;
};
export type MessageResponse = {
  id: number; sender_name: string; content: string; will_attend: boolean;
  guest_of: string | null; number_attend: number; created_at: string;
};
export type MessagePage = { items: Message[]; nextCursor: string | null };
export type ListParams = {
  cursor?: string; limit: number; will_attend?: boolean; guest_of?: string; q?: string;
};

// mapper.ts — map tường minh, không spread row
export const toDomain = (row: MessageRow): Message => ({
  id: row.id, senderName: row.sender_name, content: row.content,
  willAttend: row.will_attend, guestOf: row.guest_of,
  numberAttend: row.number_attend, createdAt: new Date(row.created_at),
});

export const toResponse = (m: Message): MessageResponse => ({
  id: m.id, sender_name: m.senderName, content: m.content,
  will_attend: m.willAttend, guest_of: m.guestOf,
  number_attend: m.numberAttend, created_at: m.createdAt.toISOString(),
});
```

Quy tắc:

- **Không** `return { ...row }` từ repository ra response: sẽ leak `ip_hash`,
  `deleted_at`, hoặc field thêm trong tương lai.
- Field chỉ dùng nội bộ (audit, moderation) không xuất hiện trong response DTO.
- `Date` trong domain, ISO string ở biên HTTP; đừng để `Date` rò vào JSON tùy tiện.
- `snake_case` ở API nếu contract đã chốt như vậy; không đổi giữa chừng.
- Mapping là nơi để thêm computed field (ví dụ `display_name`) mà không đổi DB.

---

## 6. Validation với Zod

Schema là **contract runtime**; type TypeScript chỉ là compile-time. Validate ở biên,
không tin bất kỳ input nào.

```ts
// modules/messages/schema.ts
import { z } from "zod";

export const listMessagesQuery = z.object({
  cursor: z.string().max(256).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  will_attend: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  guest_of: z.string().max(80).optional(),
  q: z.string().min(2).max(100).optional(),
}).strict();

export const createMessageBody = z.object({
  sender_name: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(1000),
  will_attend: z.boolean(),
  guest_of: z.string().max(80).nullable().optional(),
  number_attend: z.number().int().min(0).max(20).default(1),
}).strict().refine((v) => !v.will_attend || v.number_attend >= 1, {
  path: ["number_attend"],
  message: "Phải >= 1 khi will_attend = true",
});

export const patchMessageBody = createMessageBody
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Body không được rỗng" });

export type ListMessagesQuery = z.infer<typeof listMessagesQuery>;
export type CreateMessageInput = z.infer<typeof createMessageBody>;
export type PatchMessageInput = z.infer<typeof patchMessageBody>;
```

Dùng với Hono:

```ts
import { zValidator } from "@hono/zod-validator";

app.get("/", zValidator("query", listMessagesQuery), async (c) => {
  const query = c.req.valid("query"); // typed
  const { items, nextCursor } = await service.list(query);
  return c.json({
    success: true,
    data: items.map(toResponse), // DTO snake_case, không trả domain/row
    page: { next_cursor: nextCursor, has_more: nextCursor !== null },
  });
});
```

Lưu ý:

- `.strict()` từ chối field lạ, khớp `additionalProperties: false` trong OpenAPI. Nếu
  muốn bỏ qua field lạ, dùng `.strip()` (mặc định) và ghi rõ trong docs.
- `z.coerce` hữu ích cho query string nhưng có thể biến `"abc"` thành `NaN`; luôn kèm
  `.int()`, `.min()`, `.max()`.
- `z.infer` là nguồn type cho input; response DTO nên khai báo riêng để kiểm soát.
- Custom error map để trả `path`/`code` thống nhất (xem mục 7).
- Với `PATCH`, dùng `.partial()` nhưng nhớ refine "không rỗng".
- Không validate lại cùng schema ở service; service nhận type đã validate và kiểm tra
  invariant nghiệp vụ (ví dụ quyền sửa).

---

## 7. Error handling tập trung

### 7.1 AppError

```ts
// core/errors.ts
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  notFound: (what = "Resource") => new AppError("NOT_FOUND", `${what} không tồn tại`, 404),
  forbidden: (msg = "Không đủ quyền") => new AppError("FORBIDDEN", msg, 403),
  validation: (msg: string, details?: unknown) =>
    new AppError("VALIDATION_ERROR", msg, 422, details),
  conflict: (msg: string) => new AppError("CONFLICT", msg, 409),
};
```

### 7.2 Error handler

```ts
// middleware/error-handler.ts
import type { ErrorHandler } from "hono";
import { AppError } from "../core/errors";
import { logger } from "../infra/logger";

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get("requestId") ?? crypto.randomUUID();

  if (err instanceof AppError) {
    return c.json({
      type: `https://api.wedding.example.com/problems/${err.code.toLowerCase()}`,
      title: err.message, status: err.status, code: err.code, request_id: requestId,
      ...(err.details ? { errors: err.details } : {}),
    }, err.status as 400);
  }

  logger.error({ err, requestId, path: c.req.path }, "unhandled error");
  return c.json({
    type: "https://api.wedding.example.com/problems/internal-error",
    title: "Lỗi hệ thống", status: 500,
    code: "INTERNAL_ERROR", request_id: requestId,
  }, 500);
};
```

### 7.3 Map lỗi DB → HTTP

| Supabase/Postgres | HTTP | Ghi chú |
|---|---|---|
| `PGRST116` (0 rows khi `.single()`) | 404 | Không tìm thấy |
| `23505` unique violation | 409 | Trùng dữ liệu |
| `23503` FK violation | 409/422 | Tham chiếu không hợp lệ |
| `22P02` invalid text representation | 400 | ID sai định dạng |
| `42501` insufficient privilege | 403 | RLS/chính sách |
| Timeout/network | 503 | Retry có kiểm soát |
| Còn lại | 500 | Log kèm request id |

```ts
// core/errors.ts (đoạn map lỗi DB)
export function mapDbError(error: { code?: string; message: string }): never {
  switch (error.code) {
    case "PGRST116":
      throw Errors.notFound();
    case "23505":
      throw Errors.conflict("Lời chúc đã tồn tại");
    case "22P02":
      throw new AppError("VALIDATION_ERROR", "ID không hợp lệ", 400);
    default:
      throw new Error(`Supabase error: ${error.message}`);
  }
}
```

Nguyên tắc:

- Không trả `error.message` của DB ra client (có thể lộ schema/bảng).
- Không `catch` rồi trả `200`.
- Log lỗi 5xx với stack + request id; log 4xx ở mức `warn` không stack.
- `AppError` là lỗi "dự kiến"; lỗi còn lại là bug → 500.
- Error handler đặt ở `app.onError`, không lặp try/catch trong từng route.

---

## 8. Config và secrets

Parse env một lần, fail-fast, export type:

```ts
// config/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(20),
  ADMIN_JWT_SECRET: z.string().min(32).optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Env không hợp lệ:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
```

Quy tắc:

- `.env` không commit; commit `.env.example` với placeholder.
- Secret production lấy từ secret manager/CI, không hard-code.
- Không đọc `process.env.X` rải rác; import `env`.
- Phân biệt config theo môi trường bằng giá trị, không bằng nhánh `if` khắp code.
- `SUPABASE_KEY` dùng service role chỉ ở server; không bao giờ gửi xuống client.
- Validate ngay khi start: fail sớm tốt hơn lỗi 500 lúc 2h sáng.
- Với test, inject config giả thay vì sửa `process.env` toàn cục.

Tên bảng (`messages`) nên cố định trong repository, không đưa vào env: env đổi schema
runtime là nguồn lỗi khó tái hiện.

---

## 9. Dependency injection và composition root

Không cần DI container phức tạp. Dùng factory + interface:

```ts
// modules/messages/types.ts
export interface MessageRepository {
  list(params: ListParams): Promise<MessagePage>;
  findById(id: number): Promise<Message | null>;
  create(input: CreateMessageInput): Promise<Message>;
  update(id: number, patch: PatchMessageInput): Promise<Message | null>;
  remove(id: number): Promise<boolean>;
}

export interface RealtimePublisher {
  publish(event: { type: string; data: unknown }): void;
}
```

```ts
// modules/messages/service.ts
import { Errors } from "../../core/errors";
import { toResponse } from "./mapper";
import type { Message, MessageRepository, RealtimePublisher, ListParams } from "./types";
import type { CreateMessageInput, PatchMessageInput } from "./schema";

export class MessageService {
  constructor(
    private readonly repo: MessageRepository,
    private readonly realtime: RealtimePublisher,
  ) {}

  list(params: ListParams) {
    return this.repo.list(params);
  }

  async create(input: CreateMessageInput): Promise<Message> {
    const message = await this.repo.create(input);
    this.realtime.publish({ type: "message.created", data: toResponse(message) });
    return message;
  }

  async update(id: number, patch: PatchMessageInput): Promise<Message> {
    if (patch.will_attend === false && (patch.number_attend ?? 0) > 0) {
      throw Errors.validation("Không thể vừa không tham dự vừa có người đi cùng");
    }
    const updated = await this.repo.update(id, patch);
    if (!updated) throw Errors.notFound("Lời chúc");
    this.realtime.publish({ type: "message.updated", data: toResponse(updated) });
    return updated;
  }

  async remove(id: number) {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw Errors.notFound("Lời chúc");
    this.realtime.publish({ type: "message.deleted", data: { id } });
  }
}
```

```ts
// container.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "./config/env";
import { SupabaseMessageRepository } from "./modules/messages/repository";
import { MessageService } from "./modules/messages/service";
import { createRealtimeHub } from "./infra/realtime";

export function createContainer() {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  const realtime = createRealtimeHub();
  const messages = new MessageService(
    new SupabaseMessageRepository(supabase),
    realtime,
  );
  return { supabase, realtime, messages };
}

export type Container = ReturnType<typeof createContainer>;
```

```ts
// app.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "./middleware/request-id";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/error-handler";
import { messagesRoutes } from "./modules/messages/routes";
import type { Container } from "./container";

export function createApp(deps: Container) {
  const app = new Hono();
  app.use("*", requestId());
  app.use("*", requestLogger());
  app.use("*", cors({ origin: ["https://wedding.example.com"] }));
  app.onError(errorHandler);
  app.route("/api/messages", messagesRoutes(deps));
  return app;
}
```

Lợi ích: test service với fake repository và fake realtime — không cần DB, không cần
chờ thời gian thật. `createApp` cũng test được bằng `app.request()`.

> 💡 Tránh singleton `export const supabase = createClient(...)` ở module-level: import
> file là kết nối DB, khó test và dễ đọc env sai thời điểm.

---

## 10. Middleware

Thứ tự gợi ý: `requestId` → `requestLogger` → `cors` → `bodyLimit` → `rateLimit` →
`auth` → routes; `onError` bắt lỗi từ mọi tầng. Đặt `cors` sớm để trả preflight, và
`bodyLimit`/`rateLimit` trước khi parse body hoặc chạm DB.

```ts
// middleware/request-id.ts
import type { MiddlewareHandler } from "hono";

export const requestId = (): MiddlewareHandler => async (c, next) => {
  const id = c.req.header("x-request-id") ?? crypto.randomUUID();
  c.set("requestId", id);
  await next();
  c.header("x-request-id", id);
};
```

`rateLimit` nên là middleware riêng, đọc config và trả `429` kèm `Retry-After`. Với
nhiều instance, dùng Redis hoặc rate limit ở gateway.

Lưu ý:

- In-memory rate limit **không** hoạt động đúng khi có nhiều instance; dùng Redis hoặc
  gateway. Ghi rõ giới hạn này trong code/docs.
- `auth` chỉ xác thực; authorization (owner/admin) nằm ở service/route.
- Body limit nên áp dụng trước `c.req.json()`.
- CORS không phải auth; không dùng `origin: "*"` cho endpoint có credential.
- Logger không log body chứa token/PII; log method, path, status, duration, request id.
- Error handler đặt bằng `app.onError`, không tự viết `try/catch` lặp lại.
- Với TypeScript, khai báo `type AppEnv = { Variables: { requestId: string } }` và dùng
  `new Hono<AppEnv>()` để `c.get("requestId")`/`c.set` có type thay vì `unknown`.

---

## 11. Database access và repository

### 11.1 Supabase client

- Tạo một client trong `container.ts` với `persistSession: false`.
- Service role key chỉ ở server; nếu dùng anon key, phải có RLS đúng.
- Repository nhận client qua constructor, không import singleton.

### 11.2 Repository

```ts
// modules/messages/repository.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { toDomain } from "./mapper";
import type { MessageRepository, ListParams, MessagePage } from "./types";
import type { CreateMessageInput, PatchMessageInput } from "./schema";
import { Errors, mapDbError } from "../../core/errors";
import { decodeCursor, encodeCursor } from "../../lib/cursor";

export class SupabaseMessageRepository implements MessageRepository {
  constructor(private readonly db: SupabaseClient, private readonly table = "messages") {}

  async list({ cursor, limit, will_attend, guest_of, q }: ListParams): Promise<MessagePage> {
    const c = cursor ? decodeCursor(cursor) : null;
    const { data, error } = await this.db.rpc("list_messages", {
      p_created_at: c?.createdAt ?? null, p_id: c?.id ?? null, p_limit: limit + 1,
      p_will_attend: will_attend ?? null, p_guest_of: guest_of ?? null, p_q: q ?? null,
    });
    if (error) mapDbError(error);
    const rows = data ?? [];
    const items = rows.slice(0, limit).map(toDomain);
    const last = items.at(-1);
    return { items, nextCursor: rows.length > limit && last ? encodeCursor(last) : null };
  }

  async findById(id: number) {
    const { data, error } = await this.db.from(this.table)
      .select("*").eq("id", id).maybeSingle();
    if (error) mapDbError(error);
    return data ? toDomain(data) : null;
  }

  async create(input: CreateMessageInput) {
    const { data, error } = await this.db.from(this.table)
      .insert(input).select().single();
    if (error) mapDbError(error);
    return toDomain(data);
  }

  async update(id: number, patch: PatchMessageInput) {
    if (Object.keys(patch).length === 0) throw Errors.validation("Body rỗng");
    const { data, error } = await this.db.from(this.table)
      .update(patch).eq("id", id).select().maybeSingle();
    if (error) mapDbError(error);
    return data ? toDomain(data) : null;
  }

  async remove(id: number) {
    const { error, count } = await this.db.from(this.table)
      .delete({ count: "exact" }).eq("id", id);
    if (error) mapDbError(error);
    return (count ?? 0) > 0;
  }
}
```

List dùng RPC để cursor `(created_at, id)` so sánh đúng thứ tự và filter chạy trong DB:

```sql
create or replace function list_messages(
  p_created_at timestamptz, p_id bigint, p_limit int,
  p_will_attend boolean, p_guest_of text, p_q text
) returns setof messages language sql stable as $$
  select * from messages
  where (p_created_at is null or (created_at, id) < (p_created_at, p_id))
    and (p_will_attend is null or will_attend = p_will_attend)
    and (p_guest_of is null or guest_of = p_guest_of)
    and (p_q is null or sender_name ilike '%' || p_q || '%' or content ilike '%' || p_q || '%')
  order by created_at desc, id desc
  limit p_limit;
$$;
```

Lưu ý:

- `.single()` trả lỗi khi 0 row; dùng `.maybeSingle()` nếu muốn `null`.
- RPC dùng tham số, không nối chuỗi SQL từ input người dùng.
- Không gọi DB trong vòng lặp (N+1).
- Index cho `(created_at desc, id desc)`, `will_attend`, `guest_of`.

### 11.3 Transaction boundary

Supabase JS không mở transaction nhiều câu lệnh. Các lựa chọn:

| Nhu cầu | Cách làm |
|---|---|
| Một insert/update đơn | Atomic sẵn |
| Nhiều bước phải atomic | Viết Postgres function/RPC, gọi một lần |
| Outbox + insert | Insert cả message và outbox trong cùng RPC/transaction |
| Đọc rồi ghi có kiểm tra | `UPDATE ... WHERE version = ?` hoặc RPC khóa row |

Không giả vờ có transaction bằng nhiều lời gọi Supabase liên tiếp.

### 11.4 Migration và seed

- Migration SQL đặt trong `supabase/migrations/<timestamp>_<name>.sql`; không sửa
  migration đã chạy production.
- `scripts/seed.ts` idempotent (kiểm tra tồn tại hoặc dùng `on conflict`), không chạy
  mặc định trong production.
- Test DB dùng schema/migration giống production; reset trước mỗi suite.

---

## 12. Background jobs, webhooks và outbox

Khi API phải làm việc ngoài request (gửi email, đồng bộ Sheet, gọi webhook):

| Thành phần | Vai trò |
|---|---|
| Job queue | Nhận job, retry, delay, DLQ |
| Worker | Xử lý job idempotent |
| Outbox | Ghi event cùng transaction với dữ liệu |
| Webhook dispatcher | Ký HMAC, timeout, retry backoff |
| Dead-letter | Lưu job fail để xử lý tay |

**Outbox pattern** (khi cần đảm bảo không mất event): trong cùng transaction, insert
message và một dòng `outbox (status='pending')`; worker poll `FOR UPDATE SKIP LOCKED`,
publish event, rồi đánh dấu `sent`. Không có bước nào nằm ngoài transaction gốc.

Với repo hiện tại, broadcast WebSocket sau insert là **best-effort**. Nếu cần đảm bảo
client không bỏ lỡ event, dùng outbox + idempotency key ở consumer.

Quy tắc:

- Job phải idempotent (cùng job chạy 2 lần không tạo 2 email).
- Retry có backoff + giới hạn; fail mãi → DLQ + alert.
- Webhook ký payload (`X-Signature: sha256=...`) và có timestamp chống replay.
- Không gọi dịch vụ ngoài trong transaction DB.
- Job/worker tách entrypoint khỏi HTTP server (`src/worker.ts`).

---

## 13. OpenAPI và docs trong repo

- Spec ở `docs/openapi/openapi.yaml`; bundle ra `docs/openapi/dist/`.
- Route dùng schema khớp spec; nếu dùng `@hono/zod-openapi`, mount `app.doc()`.
- Generated type ở `src/types/api.d.ts`; không sửa tay.
- CI chạy `redocly lint`, `oasdiff breaking`, contract test.
- Docs render (Scalar/Redoc) publish từ CI; link trong README.

Xem [03-openapi.md](./03-openapi.md) cho chi tiết spec, tooling và ví dụ đầy đủ.

---

## 14. Cấu trúc test

Vị trí test đã có trong cây thư mục ở mục 3. Điểm cần nhớ là mỗi loại test có thư mục
riêng, không trộn unit với integration:

| Loại | Phụ thuộc | Tốc độ | Kiểm tra |
|---|---|---|---|
| Unit | Không | ms | Business rule, mapper, validation |
| Integration | DB/queue test | 100ms–vài giây | Route + repository + transaction |
| E2E | Server thật | Vài giây | Luồng người dùng, WebSocket |
| Contract | Server/spec | Vài giây | Shape response, breaking change |

Ví dụ unit test service:

```ts
import { describe, expect, it } from "bun:test";
import { MessageService } from "../../../src/modules/messages/service";

const noopRealtime = { publish: () => {} };

describe("MessageService.update", () => {
  it("từ chối will_attend=false nhưng number_attend > 0", async () => {
    const service = new MessageService(
      { update: async () => { throw new Error("không được gọi"); } } as never,
      noopRealtime,
    );
    await expect(service.update(1, { will_attend: false, number_attend: 2 }))
      .rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
```

Quy tắc test:

- Test tên theo hành vi, không theo implementation (`từ chối...`, không `test update 2`).
- Fixture dùng factory, không copy object 20 field.
- Test DB dùng dữ liệu unique + cleanup; không phụ thuộc thứ tự.
- Không mock DB trong integration test; mock ở unit.
- Contract test chạy trong CI, không chỉ local.

Xem [06-testing-observability.md](./06-testing-observability.md).

---

## 15. Refactor repo hiện tại

### 15.1 Hiện trạng

`index.ts` (~5KB) đang chứa:

- Khởi tạo Supabase + đọc env.
- 6 route: `GET /`, `GET/POST /api/messages`, `PUT/DELETE /api/messages/:id`, `DELETE /api/messages`.
- Validate thủ công (`sender_name.isEmpty` — không đúng API của string).
- Broadcast WebSocket trực tiếp trong handler.
- `Bun.serve` + WebSocket upgrade.
- Không có test, không có error format thống nhất, `DELETE /messages` không auth.

### 15.2 Cây mục tiêu

Đích đến là cây thư mục ở mục 3. Trong PR đầu tiên chỉ cần tạo `src/` với `index.ts`,
`app.ts`, `container.ts`, `config/env.ts` và `modules/messages/{routes,service,repository,schema,mapper,types}.ts`;
các thư mục còn lại thêm dần khi có nhu cầu thật.

### 15.3 Lộ trình 7 bước (giữ behavior parity)

1. **Tách config**: tạo `config/env.ts`, bỏ `process.env` trong `index.ts`.
2. **Tách Supabase**: `infra/supabase.ts`, truyền client vào repository.
3. **Tạo schema**: Zod cho create/update/query; sửa `isEmpty` thành `trim().min(1)`.
4. **Tách repository**: chuyển query Supabase, map row → domain.
5. **Tách service**: business rule RSVP, phát event; route chỉ HTTP.
6. **Tách realtime**: `RealtimePublisher` + hub; route không tự vòng lặp client.
7. **Thêm test + spec**: unit service, integration route, contract; `app.doc()`.

Mỗi bước là một PR nhỏ, giữ endpoint hoạt động. Không "big bang rewrite".

### 15.4 Code module `messages`

Schema, service và repository đã có ở mục 6, 9 và 11. Dưới đây là HTTP adapter và
entrypoint — hai phần chưa xuất hiện ở trên.

```ts
// modules/messages/routes.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createMessageBody, patchMessageBody, listMessagesQuery } from "./schema";
import { AppError } from "../../core/errors";
import { toResponse } from "./mapper";
import type { MessageService } from "./service";

export function messagesRoutes(deps: { messages: MessageService }) {
  const app = new Hono();

  app.get("/", zValidator("query", listMessagesQuery), async (c) => {
    const { items, nextCursor } = await deps.messages.list(c.req.valid("query"));
    return c.json({
      success: true,
      data: items.map(toResponse),
      page: { next_cursor: nextCursor, has_more: nextCursor !== null },
    });
  });

  app.post("/", zValidator("json", createMessageBody), async (c) => {
    const message = await deps.messages.create(c.req.valid("json"));
    return c.json({ success: true, data: toResponse(message) }, 201);
  });

  app.patch("/:id", zValidator("json", patchMessageBody), async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("VALIDATION_ERROR", "ID không hợp lệ", 400);
    }
    const message = await deps.messages.update(id, c.req.valid("json"));
    return c.json({ success: true, data: toResponse(message) });
  });

  app.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("VALIDATION_ERROR", "ID không hợp lệ", 400);
    }
    await deps.messages.remove(id);
    return c.body(null, 204);
  });

  return app;
}
```

```ts
// index.ts
import { createApp } from "./app";
import { createContainer } from "./container";
import { env } from "./config/env";

const container = createContainer();
const app = createApp(container);

const server = Bun.serve({
  port: env.PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      return server.upgrade(req) ? undefined : new Response("Upgrade failed", { status: 400 });
    }
    return app.fetch(req);
  },
  websocket: container.realtime.handler,
});

console.log(`🚀 http://localhost:${server.port}`);
export default server;
```

Điểm cần giữ khi refactor:

- Response shape tương thích trong giai đoạn chuyển tiếp (`success`, `data`).
- `DELETE /messages` phải được bảo vệ hoặc tắt trước khi public.
- Broadcast WebSocket vẫn hoạt động sau khi tách realtime.
- Không đổi `created_at` format (ISO UTC) đột ngột.
- Đổi `PUT` → `PATCH` là breaking change: giữ `PUT` trong PR refactor, chỉ chuyển khi
  đã có versioning/deprecation (xem [04-lifecycle-process.md](./04-lifecycle-process.md)).

---

## 16. Cấu trúc tham khảo: NestJS, Go, Laravel

| Khái niệm | NestJS | Go (standard layout) | Laravel |
|---|---|---|---|
| Entrypoint | `main.ts` | `cmd/api/main.go` | `public/index.php` |
| Module | `@Module` | `internal/<domain>` | `app/Modules/<Domain>` (tùy) |
| HTTP adapter | Controller | `handler/` | `Http/Controllers` |
| Business | Service/Provider | `service/` | `Services/Actions` |
| Data | Repository/TypeORM | `repository/` | Eloquent/Repository |
| DTO/validation | DTO + class-validator | struct + validator | FormRequest |
| DI | Built-in container | `wire`/constructor | Service container |
| Config | `ConfigModule` | `config/` + env | `config/*.php` + `.env` |
| Migration | TypeORM/Prisma | `migrations/` | `database/migrations` |

Bài học áp dụng cho Hono:

- NestJS: module boundary + DI rõ — áp dụng bằng `modules/` + constructor injection.
- Go: `internal/` ngăn import ngoài; handler mỏng, service rõ — áp dụng bằng dependency
  rule và route mỏng.
- Laravel: FormRequest validate ở biên, Service/Action cho nghiệp vụ — áp dụng bằng
  Zod + service.

Không copy nguyên folder; giữ tinh thần "biên rõ, phụ thuộc một chiều".

---

## 17. Checklist cấu trúc dự án

- [ ] `index.ts` chỉ khởi động server/WebSocket, không chứa business logic.
- [ ] Có `app.ts` nhận dependency, test được bằng `app.request()`.
- [ ] Env được parse/validate một lần, fail-fast, có `.env.example`.
- [ ] Supabase client tạo một lần trong composition root.
- [ ] Mỗi feature có `routes`, `service`, `repository`, `schema`, `types`.
- [ ] Route mỏng: validate + gọi service + set status.
- [ ] Service không import Hono/Supabase trực tiếp.
- [ ] Repository là nơi duy nhất biết tên bảng/cột.
- [ ] Response map tường minh; không spread DB row.
- [ ] Lỗi tập trung qua `AppError` + `onError`; không leak stack/SQL.
- [ ] Middleware có request id, logger, cors, body limit, rate limit, auth.
- [ ] Rate limit multi-instance dùng Redis/gateway, không chỉ Map.
- [ ] Cursor pagination có index DB và tie-breaker `id`.
- [ ] Transaction nhiều bước dùng RPC/Postgres function.
- [ ] Job/webhook idempotent, có retry/DLQ và ký HMAC.
- [ ] OpenAPI nằm trong repo; type/client sinh tự động.
- [ ] Test unit/integration/e2e/contract có vị trí rõ.
- [ ] CI chạy typecheck, lint, test, contract, breaking-change check.
- [ ] Module khác chỉ import qua `index.ts` public, không đọc file nội bộ.
- [ ] Không có circular dependency; kiểm tra bằng tool nếu cần.

---

## 18. Anti-patterns

| Anti-pattern | Hệ quả | Cách sửa |
|---|---|---|
| Fat controller | Khó test, logic phân tán | Chuyển business rule vào service |
| Anemic domain | Service chỉ get/set, invariant rải rác | Đặt invariant vào entity/service method |
| Repository trả `any`/raw row | Leak DB, mất type | Map sang domain type |
| Service import Supabase | Không test được, khóa infra | Inject repository interface |
| Circular dependency | Import lỗi, build chậm | Tách shared type/lib, đảo chiều dependency |
| `utils/` quá lớn | Không ai biết hàm thuộc đâu | Tách theo domain/lib nhỏ |
| Singleton ẩn | Test khó, side effect | Composition root + inject |
| Config rải rác | Sai môi trường, khó audit | `config/env.ts` tập trung |
| `try/catch` mọi route | Trùng lặp, che lỗi | `app.onError` + AppError |
| Trả `error.message` DB | Lộ schema, bảo mật | Map lỗi, log nội bộ |
| Không validate output | Leak field nội bộ | Response DTO + serializer |
| Migration sửa đã chạy | DB drift | Migration mới, không sửa cái cũ |
| Test mock quá nhiều | Test xanh, production lỗi | Ưu tiên integration cho luồng chính |
| `any` lan rộng | Mất lợi ích TypeScript | `unknown` + parse ở biên |
| Folder theo layer toàn cục | Khó tìm feature, conflict | Module theo feature |
| Copy code giữa module | Sửa một nơi, quên nơi khác | Shared lib thật sự hoặc service chung |
| Background job không idempotent | Gửi trùng email/webhook | Idempotency key + unique constraint |
| Không có contract test | Spec/code lệch | Validate response trong CI |

---

## 19. Tài liệu tham khảo

- [Hono Documentation](https://hono.dev/)
- [Bun Documentation](https://bun.sh/docs)
- [Zod Documentation](https://zod.dev/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Comparison](https://www.postgresql.org/docs/current/functions-comparisons.html)
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [Go Standard Project Layout](https://github.com/golang-standards/project-layout)
- [Laravel Directory Structure](https://laravel.com/docs/structure)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/)

Xem thêm: [01-fundamentals.md](./01-fundamentals.md) · [02-rest-design.md](./02-rest-design.md) ·
[03-openapi.md](./03-openapi.md) · [04-lifecycle-process.md](./04-lifecycle-process.md) ·
[06-testing-observability.md](./06-testing-observability.md) · [07-checklists-templates.md](./07-checklists-templates.md) ·
[../api-security.md](../api-security.md) · [../websocket.md](../websocket.md).
