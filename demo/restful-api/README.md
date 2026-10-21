# RESTful API Demo — Node 24 + Express + Zod

Demo chạy được minh hoạ **mọi quy ước** trong [`../../docs/api/restful-api.md`](../../docs/api/restful-api.md):
status codes đúng, cursor pagination, filter/sort whitelist, validation, RFC 7807 errors,
ETag/If-Match (optimistic concurrency), Idempotency-Key, method not allowed, rate limit.

> TypeScript **erasable-only** chạy trực tiếp bằng Node native type stripping —
> **không cần build step**.

## Chạy

```bash
npm install
npm start                 # watch mode
# hoặc
npm run start:once
```

Mở:

- Swagger UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/v1/openapi.json
- Health: http://localhost:3000/health

## Cấu trúc

```
src/
  server.ts              # entry, listen
  app.ts                 # express app, mounting /v1, /docs, error handler cuối
  store.ts               # in-memory store + seed data
  errors.ts              # ApiError + helpers (notFound, conflict, etagOf, matchEtag…)
  openapi.ts             # load openapi.yaml
  middleware/
    common.ts            # requestId (X-Request-Id), rateLimit, cors
    validate.ts          # validateBody / validateQuery (Zod → 400 kèm errors[])
    idempotency.ts       # Idempotency-Key store (24h TTL, fingerprint)
    errorHandler.ts      # map ApiError / parse error / 404 → RFC 7807
  routes/products.ts     # CRUD + pagination + ETag/If-Match
schemas/product.ts       # Zod schemas (create/replace/patch/list)
openapi.yaml             # OpenAPI 3.1 spec (nguồn sự thật của contract)
```

## Quy ước được minh hoạ

| Quy ước | Nơi thể hiện |
|---|---|
| Noun số nhiều, kebab-case | `/v1/products` |
| POST → 201 + `Location` | `routes/products.ts` |
| GET 1 item → 200 + `ETag` | `routes/products.ts` |
| DELETE → 204 | `routes/products.ts` |
| `405` + `Allow` header | `.all("/:id")` fallback |
| `400` validation + `errors[]` | `middleware/validate.ts` |
| RFC 7807 `application/problem+json` | `middleware/errorHandler.ts` |
| Cursor pagination opaque | `listProducts()` encodeCursor/decodeCursor |
| Sort whitelist + tie-breaker `id` | `listQuery` + `listProducts()` |
| Limit clamp (max 100) | `schemas/product.ts` |
| Conditional GET (`If-None-Match` → 304) | `GET /:id` |
| Optimistic concurrency (`If-Match` → 412) | `PUT`/`PATCH` |
| Idempotency-Key (replay, reuse → 422) | `middleware/idempotency.ts` |
| `X-Request-Id` mọi response | `middleware/common.ts` |
| Rate limit headers + 429 + `Retry-After` | `middleware/common.ts` |
| OpenAPI contract-first + Swagger UI | `openapi.yaml`, `/docs` |

## Smoke test nhanh

```bash
# List (cursor)
curl -s "http://localhost:3000/v1/products?limit=2&sort=created_at"

# Conditional GET: lấy ETag rồi gửi If-None-Match → 304
curl -sD - -o /dev/null http://localhost:3000/v1/products/prd_seed001

# Tạo với Idempotency-Key (gọi lại cùng key+payload → trả response đã lưu, header Idempotent-Replayed: true)
curl -sD - -X POST http://localhost:3000/v1/products \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: demo-key-12345' \
  -d '{"name":"Test","price":1000}'

# Validation error (400 problem+json)
curl -s -X POST http://localhost:3000/v1/products \
  -H 'Content-Type: application/json' -d '{"name":"","price":-5}'

# Optimistic lock: PATCH không kèm If-Match → 412
curl -s -o /dev/null -w '%{http_code}\n' -X PATCH http://localhost:3000/v1/products/prd_seed001 \
  -H 'Content-Type: application/merge-patch+json' -d '{"status":"active"}'
```

## Ghi chú

- Store **in-memory** — restart sẽ reset dữ liệu seed. Đủ để học quy ước, không phải production.
- Để ý thứ tự middleware trong `app.ts`: `requestId → cors → json → routes → notFound → errorHandler`.
  `errorHandler` **phải đăng ký cuối cùng**.
