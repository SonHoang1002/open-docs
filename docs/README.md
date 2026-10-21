# Tài liệu kỹ thuật — Open Docs

Tổng hợp tài liệu kỹ thuật tiếng Việt theo chủ đề. Mỗi tài liệu gồm lý thuyết chuẩn,
bảng quy ước, code mẫu, anti-patterns, checklist và tài liệu tham khảo chính quyên.

## Mục lục theo chủ đề

### API

| Tài liệu | Nội dung |
|---|---|
| [RESTful API](./api/restful-api.md) | Quy chuẩn thiết kế REST API: RMM, URI naming, HTTP methods/status codes, pagination, error handling (RFC 7807 / Google ErrorInfo), PATCH, Idempotency-Key, async ops, versioning, caching/ETag, HATEOAS, OpenAPI contract-first, anti-patterns, checklist |
| [API Security](./api/api-security.md) | Bảo mật API theo OWASP Top 10 for APIs: authn/authz (JWT, OAuth2, API key), input validation, rate limiting, CORS, secrets, SSRF, audit logging, webhook signature |

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
