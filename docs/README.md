# Tài liệu kỹ thuật — Open Docs

Tổng hợp tài liệu kỹ thuật tiếng Việt theo chủ đề. Mỗi tài liệu gồm lý thuyết chuẩn,
bảng quy ước, code mẫu, anti-patterns, checklist và tài liệu tham khảo chính quyên.

## Mục lục theo chủ đề

### API

| Tài liệu | Nội dung |
|---|---|
| [RESTful API](./api/restful-api.md) | Quy chuẩn thiết kế REST API: RMM, URI naming, HTTP methods/status codes, pagination, error handling (RFC 7807 / Google ErrorInfo), PATCH, Idempotency-Key, async ops, versioning, caching/ETag, HATEOAS, OpenAPI contract-first, anti-patterns, checklist |
| [API Security](./api/api-security.md) | Bảo mật API theo OWASP Top 10 for APIs: authn/authz (JWT, OAuth2, API key), input validation, rate limiting, CORS, secrets, SSRF, audit logging, webhook signature |

### Python

| Tài liệu | Nội dung |
|---|---|
| [Python — Tổng quan](./python/README.md) | Bộ tài liệu Python 3.12+: lộ trình học, setup với uv, cấu trúc project, quy ước chất lượng |
| [Python cơ bản](./python/python-basics.md) | Cú pháp, kiểu dữ liệu, collection, hàm, OOP, exception, module, file, stdlib, typing, pytest, debug |
| [Python nâng cao](./python/python-advanced.md) | Data model, iterator/generator, decorator, descriptor, metaclass, typing nâng cao, async, concurrency/GIL, memory/GC, profiling, packaging |
| [Python production](./python/python-production.md) | Kiến trúc repo, config/secrets, FastAPI, SQLAlchemy/Alembic, background job/outbox, cache, testing, CI/CD, observability, security, Docker/K8s, review, incident |
| [Python cheat sheet](./python/python-cheatsheet.md) | Tra cứu nhanh cú pháp, thư viện, lệnh, recipe và lỗi thường gặp |
| [Python interview](./python/interview/README.md) | Ngân hàng câu hỏi phỏng vấn từ Fresher đến Senior Manager: ma trận câu hỏi, thang điểm, lộ trình ôn và 25 tình huống thực chiến |

### Realtime

| Tài liệu | Nội dung |
|---|---|
| [WebSocket](./realtime/websocket.md) | Realtime bidirectional: handshake, frame protocol, server design (broadcast, pub/sub, Redis), Socket.IO, reconnect/heartbeat, backpressure, scaling, security |

### Media

| Tài liệu | Nội dung |
|---|---|
| [FFmpeg](./media/ffmpeg.md) | Xử lý media: transcode, filter graph, HLS/DASH, hardware acceleration, pipeline Node.js, thumbnail, loudness, CLI reference |

## Demo code

| Demo | Mô tả |
|---|---|
| [demo/restful-api](../demo/restful-api/README.md) | API Express + TypeScript minh hoạ quy chuẩn RESTful: CRUD + status codes đúng, cursor pagination, Zod validation, RFC 7807 errors, ETag/If-Match, Idempotency-Key, OpenAPI + Swagger UI |

## Chuẩn & nguồn tham khảo chính

- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) / [Azure API Design Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [Google API Improvement Proposals (AIP)](https://google.aip.dev)
- [JSON:API](https://jsonapi.org/format/) · [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [RFC 9110 (HTTP Semantics)](https://www.rfc-editor.org/rfc/rfc9110) · [RFC 9457 (Problem Details)](https://www.rfc-editor.org/rfc/rfc9457)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
