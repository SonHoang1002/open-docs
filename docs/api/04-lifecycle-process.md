# Vòng đời API — Quản lý API như một sản phẩm

> API không kết thúc ở lúc triển khai. Tài liệu này mô tả vòng đời đầy đủ từ **discovery** đến **retire**, vai trò và RACI, quy trình review, test gates, release, deprecation, vận hành, metrics và governance — áp dụng độc lập với ngôn ngữ, framework hay hạ tầng cụ thể.

---

## Mục lục

1. [Tổng quan vòng đời API](#1-tổng-quan-vòng-đời-api)
2. [Vai trò và RACI](#2-vai-trò-và-raci)
3. [Discovery](#3-discovery)
4. [Design-first và API review](#4-design-first-và-api-review)
5. [Build và implementation](#5-build-và-implementation)
6. [Test gates](#6-test-gates)
7. [Documentation và developer experience](#7-documentation-và-developer-experience)
8. [Release](#8-release)
9. [Deprecation và Sunset](#9-deprecation-và-sunset)
10. [Operate](#10-operate)
11. [Metrics](#11-metrics)
12. [Governance](#12-governance)
13. [Quy trình cho repo nhỏ và team lớn](#13-quy-trình-cho-repo-nhỏ-và-team-lớn)
14. [Templates](#14-templates)
15. [Checklist theo giai đoạn](#15-checklist-theo-giai-đoạn)
16. [Anti-patterns](#16-anti-patterns)
17. [Tài liệu tham khảo](#17-tài-liệu-tham-khảo)

---

## 1. Tổng quan vòng đời API

```text
Discover → Design → Build → Test → Release → Operate → Deprecate → Retire
              ↑                                    │
              └──────── feedback / metrics ────────┘
```

Đây không phải waterfall. Mỗi vòng lặp có thể chỉ vài ngày với một endpoint nhỏ, hoặc vài tháng với API public. Điểm quan trọng: **mỗi giai đoạn có đầu vào, đầu ra và tiêu chí thoát rõ ràng**, để không có "API ma" được triển khai mà không ai sở hữu.

| Giai đoạn | Mục tiêu | Artifact | Tiêu chí thoát |
|---|---|---|---|
| Discovery | Hiểu người dùng và vấn đề cần giải quyết | Use case, API canvas, success metrics | Vấn đề, phạm vi, thành công được đo bằng gì đã được duyệt |
| Design | Chốt contract trước code | OpenAPI, RFC, design review record | Spec, mô hình dữ liệu, security/privacy đã được approve |
| Build | Implement đúng contract, an toàn và dễ kiểm thử | Code, migration, mock, feature flag | CI xanh, contract test pass, observability đã thêm |
| Test | Chứng minh đúng, bền và an toàn | Test report, contract/load/security result | Quality gate pass theo rủi ro |
| Release | Đưa ra người dùng một cách an toàn và có thể rollback | Release note, migration guide, dashboard/alert | Canary ổn định, rollback < thời gian chấp nhận, docs đã cập nhật |
| Operate | Giữ SLO, xử lý sự cố, cải tiến | Dashboard, SLO, incident log, on-call | SLO trong ngưỡng, feedback được xử lý có ưu tiên |
| Deprecate | Giảm dần sử dụng có kiểm soát | Deprecation notice, migration guide, usage dashboard | Không còn traffic hoặc đã hết thời gian sunset với chấp thuận |
| Retire | Gỡ bỏ an toàn, bảo toàn ngữ cảnh | Post-mortem, archive, catalog cập nhật | Endpoint/tài nguyên bị xóa, log/archive còn truy vết |

**API là sản phẩm**, không chỉ là hợp đồng kỹ thuật. Người tiêu thụ API (frontend, mobile, đối tác, hệ thống nội bộ) đều có nhu cầu và chi phí chuyển đổi. Chi phí sửa chữa tăng mạnh theo thời gian:

| Thời điểm phát hiện vấn đề | Chi phí sửa tương đối |
|---|---|
| Discovery/Design | 1× |
| Build | 5× |
| Test/Release | 20× |
| Production | 100× (đã tích hợp, có khách thực tế) |

**Ví dụ trung lập (thương mại điện tử):** Khách hàng cần theo dõi đơn hàng. Discovery xác định `orders` cần trạng thái rõ ràng; thiết kế `GET /orders/{id}`, `GET /orders` (phân trang theo con trỏ), `POST /orders` — build với mô hình dữ liệu `customers`, `products`, `orders`, `order_items`, `payments`, `shipments`; test giới hạn tỷ lệ, idempotency; release an toàn; sau khi chuyển sang hệ thống mới, deprecate endpoint cũ có thông báo trước, migrate người dùng, rồi retire.

---

## 2. Vai trò và RACI

| Vai trò | Trách nhiệm chính |
|---|---|
| **API owner** | Chịu trách nhiệm cuối cùng về contract, versioning, deprecation, lifecycle |
| **Product** | Ưu tiên use case, success metrics, đánh đổi phạm vi |
| **Backend** | Thiết kế chi tiết, implement, migration, vận hành |
| **Frontend/Mobile** | Consumer; phản biện ergonomics, phát hiện thiếu field, hợp nhất nhu cầu |
| **QA** | Test plan, contract/e2e/load test, release verification |
| **Security** | Threat model, authn/authz, review dữ liệu nhạy cảm/PII |
| **SRE/Platform** | SLO, CI/CD, observability, on-call, capacity, rollback |
| **Tech writer** | Reference, quickstart, changelog, migration guide, deprecation notice |

RACI (R = Responsible, A = Accountable, C = Consulted, I = Informed):

| Hoạt động | API owner | Product | Backend | FE/Mobile | QA | Security | SRE | Writer |
|---|---|---|---|---|---|---|---|---|
| Discovery | A | R | C | C | I | I | I | I |
| API design/RFC | A | C | R | C | C | C | I | C |
| Security review | A | I | R | C | C | R | C | I |
| Implementation | A | I | R | C | I | C | C | I |
| Test gates | A | I | R | C | R | C | C | I |
| Documentation | A | C | C | C | C | C | I | R |
| Release (canary/rollback) | A | I | R | I | R | C | R | I |
| On-call/incident | A | I | R | I | C | C | R | I |
| Deprecation/Sunset/Retire | A | C | R | C | I | C | I | R |

Lưu ý:
- Một người có thể giữ nhiều vai trò trong repo nhỏ, nhưng **không nên vừa A vừa R** cho mọi việc.
- Mỗi hoạt động chỉ có **một A**. Nếu không xác định, không ai bảo vệ khi cần deprecate.
- Security và SRE nên được consult sớm, không chỉ ở cuối.

---

## 3. Discovery

Mục tiêu: trả lời "có nên làm API này không, cho ai, đo thành công bằng gì" trước khi tranh cãi tên field.

### 3.1 Use case và consumer research
- **Ai gọi API?** Web, mobile, đối tác, hệ thống nội bộ, batch jobs. Mỗi consumer có ràng buộc khác (latency, auth, offline).
- **Họ cần làm gì?** Tạo đơn hàng, tra cứu trạng thái, cập nhật địa chỉ giao hàng, yêu cầu hoàn tiền... 
- **Tần suất/khối lượng?** Cao điểm (flash sale) khác hẳn nhu cầu thường ngày.
- **Vấn đề đang gặp?** Thủ công, sai lệch dữ liệu, chậm trễ, thiếu minh bạch.
- **Giải pháp hiện tại?** Chi phí chuyển đổi ra sao?

Nguồn: phỏng vấn, ticket hỗ trợ, log truy vấn, quan sát quy trình thực tế. Tránh giả định.

### 3.2 Domain modeling (trung lập)
Xác định entity, quan hệ, ranh giới. Ví dụ thương mại điện tử:

```text
Customer 1──< Order >──1 Customer (billing/shipping)
            │
            ├──< OrderItem >──1 Product
            ├──< Payment >──1 Order
            └──< Shipment >──1 Order
```

Câu hỏi cần chốt:
- Ranh giới aggregate: `Order` chứa `OrderItem` hay tham chiếu `Product`?
- Trạng thái: `Order.status` là enum có chuyển đổi hợp lệ (state machine)?
- ID: dùng UUID v4 hay ULID, định dạng trong contract?
- Tiền: integer minor units (cents) hay decimal? Luôn ghi rõ đơn vị.
- Thời gian: RFC 3339 UTC (`2026-10-30T10:00:00Z`).
- Xóa mềm/xóa cứng? Ai được xóa? Có audit trail không?
- Dữ liệu nhạy cảm (thông tin liên hệ) có cần ẩn/giảm thiểu không?

### 3.3 API Canvas
```text
┌─ API Canvas: Orders ──────────────────────────────────────┐
│ Purpose      : Tạo, theo dõi, quản lý đơn hàng             │
│ Consumers    : Web, mobile, admin, logistics partner       │
│ Success      : Tỷ lệ tạo đơn thành công > 99.5%, p95 < 250ms│
│ Resources    : Order, OrderItem, Payment, Shipment         │
│ Operations   : list/get/create/cancel + trạng thái          │
│ Auth         : customer token cho đơn của mình; admin JWT   │
│ Constraints  : 10k orders/ngày, flash sale spike, idempotent │
│ Errors       : RFC 9457 problem+json                        │
│ Non-goals    : Pricing engine, inventory reservation core  │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Success metrics
| Metric | Ví dụ | Đo bằng |
|---|---|---|
| Adoption | % đơn tạo qua API mới | So sánh trước/sau |
| Time-to-first-call | < 15 phút cho dev mới | Quickstart test |
| Reliability | 99.95% không lỗi 5xx | APM/log |
| Performance | p95 < 250ms, p99 < 600ms | Histogram |
| Correctness | < 0.01% response sai schema | Contract monitor |
| Support | Giảm ticket liên quan | Helpdesk |

---

## 4. Design-first và API review

### 4.1 RFC ngắn
Với thay đổi vừa/lớn, viết RFC (1–2 trang) trước OpenAPI chi tiết:
- Bối cảnh và vấn đề
- Đề xuất (resources/operations/auth/pagination)
- Phương án thay thế và lý do loại
- Ảnh hưởng tương thích, migration
- Security/privacy, rate limit, idempotency
- Rollout, metrics, rollback
- Open questions + quyết định cần có

### 4.2 Design review vs code review
| Tiêu chí | Design review | Code review |
|---|---|---|
| Đối tượng | Contract, use case, ergonomics | Implementation, style, bug, test |
| Thời điểm | Trước/đồng thời code, trước merge lớn | Trong PR |
| Người review | FE/Mobile, QA, Security, API owner, SRE | Backend peers |
| Câu hỏi chính | "API này dễ dùng, đúng, bền chưa?" | "Code đúng, rõ, an toàn, test đủ chưa?" |
| Output | Quyết định + spec sửa | Approve/request changes |

### 4.3 Design review checklist
- [ ] Use case và consumer rõ ràng, không thêm "phòng hờ"
- [ ] Resource/verb đúng REST, tránh RPC tùy tiện
- [ ] Tên field nhất quán, có ý nghĩa với consumer
- [ ] Request/response tách biệt, không leak trường nội bộ
- [ ] Pagination/filter/sort rõ ràng, có giới hạn
- [ ] Lỗi dùng RFC 9457, mã lỗi ổn định
- [ ] Authn/authz rõ, server-side enforcement
- [ ] Idempotency cho POST/PUT quan trọng (tạo đơn, thanh toán)
- [ ] Backward compatibility/versioning được đánh giá
- [ ] Ví dụ thực tế (không `foo/bar`), có đủ happy path + lỗi
- [ ] Dữ liệu nhạy cảm được giảm thiểu/ẩn
- [ ] Rate limit, abuse case, quota nêu rõ
- [ ] Migration/rollback được xem xét

### 4.4 Style guide và governance
Style guide tối thiểu: kebab-case path, danh từ số nhiều, quy ước field case thống nhất, ISO 8601 UTC, RFC 9457 errors, pagination, enum, versioning, deprecation. Governance là **luật nhỏ + tự động hóa** (lint trong CI, CODEOWNERS, review chỉ cho breaking/public).

---

## 5. Build và implementation

### 5.1 Contract là nguồn sự thật
- Spec merge trước hoặc cùng PR code
- Type/client sinh từ spec (không viết tay)
- Mock server từ spec cho consumer làm song song
- Không sửa spec để "khớp" code sai; thống nhất và cập nhật test

### 5.2 Quy trình build
```text
Freeze spec → generate types/client/mock → implement handler/service/repo
→ unit/integration/contract test → feature flag → deploy staging
→ consumer integration → canary → release
```
- **Codegen**: công cụ sinh type/client theo OpenAPI
- **Mock**: dùng để phát triển song song
- **Feature flag**: bật dần, kill switch sẵn sàng
- **Migration**: có rollback, test trên dữ liệu gần production
- **Observability**: log/metric/trace thêm trước khi mở traffic

### 5.3 Implementation checklist
- [ ] Validation ở biên, không tin client
- [ ] Business rule ở service/domain, không nhét controller
- [ ] Query có index phù hợp, tránh N+1
- [ ] Lỗi map tập trung, không leak stack/SQL
- [ ] Response không chứa trường nội bộ/secret
- [ ] Request id, structured log
- [ ] Rate limit/body limit/CORS đúng
- [ ] Feature flag/kill switch nếu cần
- [ ] Idempotency key cho thao tác quan trọng
- [ ] Transaction boundary rõ ràng

---

## 6. Test gates

### 6.1 Các tầng test
| Tầng | Kiểm tra gì | Ví dụ | Chạy khi |
|---|---|---|---|
| Unit | Logic thuần, validation, mapping, state machine | Chuyển `Order.status` không hợp lệ bị từ chối | Mỗi commit |
| Integration | Handler + DB/queue, middleware | `POST /orders` tạo `Order` + `OrderItem` | Mỗi PR |
| Contract | Response khớp OpenAPI | Schema validate theo spec | Mỗi PR |
| E2E | Luồng người dùng thực tế | Tạo đơn → thanh toán → trạng thái cập nhật | Trước release |
| Load | Throughput, p95/p99, tài nguyên | Spike 500 req/s | Trước release lớn |
| Security | Authz, injection, rate limit, IDOR | Khách truy cập đơn người khác bị chặn | Mỗi PR/định kỳ |
| Chaos | Mất dependency, latency, timeout | DB chậm/timeout | Định kỳ/staging |

### 6.2 Quality gate trong CI
```yaml
stages:
  - lint
  - typecheck
  - unit
  - integration
  - contract
  - security-scan
  - build
  - deploy-staging
  - smoke
```

| Gate | Ngưỡng gợi ý |
|---|---|
| Lint/typecheck | 0 error |
| Unit (module quan trọng) | ≥ 70% (không bắt buộc toàn repo) |
| Contract validation | 100% response mẫu quan trọng pass |
| Breaking change | 0 nếu không được phê duyệt (`openapi-diff`) |
| Security high/critical | 0 |
| p95 load test | < SLO cam kết |
| Smoke test | 100% pass |

> 💡 Coverage là chỉ số phụ. Ưu tiên test contract và E2E cho luồng quan trọng hơn coverage cao cho code ít rủi ro.

---

## 7. Documentation và developer experience

### 7.1 Bộ tài liệu tối thiểu
| Loại | Trả lời | Ví dụ |
|---|---|---|
| Reference | "Endpoint này có gì?" | OpenAPI render (Scalar/Redoc) |
| Quickstart | "Gọi trong 5 phút thế nào?" | curl + auth + response mẫu |
| Tutorial | "Làm luồng X?" | Tạo đơn hàng + theo dõi trạng thái |
| Changelog | "Có gì mới/breaking?" | Added/Changed/Deprecated/Removed/Security |
| Migration guide | "Phải sửa gì khi đổi version?" | Mapping cũ→mới, ví dụ trước/sau |
| SDK | "Dùng thư viện?" | Client sinh từ spec |
| Sandbox/Staging | "Thử an toàn?" | Môi trường sandbox |

### 7.2 Docs-as-code
- Spec và docs nằm trong repo, review như code
- CI kiểm tra link, example hợp lệ
- Mỗi release có version docs
- Có kênh feedback

### 7.3 Developer experience
Đo **time-to-first-call**. Yếu tố quan trọng: token dễ lấy, ví dụ copy-paste được, lỗi nói rõ cách sửa, pagination rõ ràng, không cần đọc source để hiểu contract.

---

## 8. Release

### 8.1 Semantic versioning cho API contract
`info.version` theo MAJOR.MINOR.PATCH của **contract**:
| Thay đổi | Version | Ví dụ |
|---|---|---|
| Breaking: xóa field/endpoint, đổi type, thêm required | MAJOR | `1.4.2 → 2.0.0` |
| Thêm endpoint/field optional, nới validation | MINOR | `1.4.2 → 1.5.0` |
| Sửa docs/example, fix bug không đổi contract | PATCH | `1.4.2 → 1.4.3` |

### 8.2 Backward compatibility
| Thay đổi | Tương thích? | Ghi chú |
|---|---|---|
| Thêm field optional vào response | ✅ | Client bỏ qua |
| Thêm endpoint | ✅ | |
| Thêm field optional vào request | ✅ | |
| Nới giới hạn (max) | ⚠️ | Cần kiểm tra client |
| Thêm enum value | ⚠️ | Client switch-case có thể lỗi |
| Thêm required vào request | ❌ | Gãy client cũ |
| Xóa/đổi tên field, đổi type | ❌ | Breaking |
| Đổi status code thành công | ❌ | Breaking |
| Thắt validation | ❌ | Breaking |
| Đổi auth/scope | ❌ | Breaking |

### 8.3 Rollout
```text
staging → canary (theo % traffic/key) → tăng dần → 100% → quan sát 24–48h
```
- So sánh error rate/latency canary vs baseline
- Rollback < 5 phút
- Với thay đổi DB: expand/contract (thêm cột → dual write → backfill → đọc cột mới → bỏ cột cũ)

### 8.4 Communication
Changelog, migration guide, thông báo cho consumer trước release breaking. Public API cần thông báo tối thiểu 6 tháng trừ trường hợp bảo mật khẩn cấp.

---

## 9. Deprecation và Sunset

### 9.1 Headers chuẩn
- `Deprecation` (RFC 9745): thời điểm bắt đầu deprecate (`@<unix-seconds>`)
- `Sunset` (RFC 8594): thời điểm ngừng hoạt động
- `Link` với `rel="deprecation"`: migration guide
- `Warning: 299 - "..."` (tùy chọn)

```http
HTTP/1.1 200 OK
Deprecation: @1767225600
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
Link: <https://docs.example.com/migrate/orders-v2>; rel="deprecation"; type="text/html"
Warning: 299 - "Endpoint này sẽ ngừng hoạt động; xem Link để migrate"
```

### 9.2 Timeline gợi ý
| Mốc | Hành động | Kênh |
|---|---|---|
| T-180/T-90 | Công bố, gắn header, viết migration guide | Changelog, docs, email |
| T-30 | Nhắc lại theo usage/consumer | Dashboard, email/call |
| T-7 | Thông báo cuối | Kênh chính thức |
| T-0 | Trả `410 Gone` (hoặc `404`), log | Release note |
| T+30 | Xóa code/schema, archive docs, cập nhật catalog | Repo |

| Loại API | Thời gian tối thiểu |
|---|---|
| Public/đối tác | 6–12 tháng |
| Nội bộ nhiều team | 90 ngày |
| Nội bộ một team | 30 ngày |
| Bảo mật khẩn cấp | 24–72 giờ (có thông báo đặc biệt) |

### 9.3 Migration guide
Phải có: lý do, timeline, mapping cũ→mới, ví dụ trước/sau, lỗi thường gặp, cách xác minh đã migrate, liên hệ hỗ trợ. Theo dõi usage theo operationId/consumer/key trước khi tắt.

---

## 10. Operate

### 10.1 SLI, SLO, error budget
| SLI | SLO ví dụ | Đo |
|---|---|---|
| Availability | 99.95% không lỗi 5xx | `(total - 5xx)/total` |
| Latency | p95 < 250ms, p99 < 600ms | Histogram |
| Correctness | < 0.01% sai schema | Contract monitor/synthetic |
| Freshness | Cập nhật trạng thái đơn < 5s | Synthetic/E2E probe |
| Saturation | CPU/connection pool < 70–80% | Metrics |

Error budget = 1−SLO. Khi cạn budget ưu tiên reliability hơn feature.

### 10.2 On-call và incident
| Severity | Ví dụ | Phản hồi | Cập nhật |
|---|---|---|---|
| SEV1 | Sập hoàn toàn/mất dữ liệu | Ngay lập tức | Mỗi 15 phút |
| SEV2 | Ảnh hưởng lớn/latency cao | < 15 phút | Mỗi 30 phút |
| SEV3 | Ảnh hưởng nhỏ/có workaround | < 1 giờ | Hàng ngày |
| SEV4 | Cosmetic | Trong sprint | — |

Runbook cần: health check, rollback, kill switch, liên hệ dependency, tìm request id trong log. Sau incident: blameless post-mortem với action item có owner/ngày.

### 10.3 Capacity và cost
Ước lượng peak, test load, cache hợp lý (ETag/CDN), theo dõi cost per request/tenant, tránh log thừa. Có kế hoạch scale.

---

## 11. Metrics

| Nhóm | Metric | Mục đích |
|---|---|---|
| Adoption | Requests/ngày, consumer active | Tăng trưởng |
| Reliability | Availability, 5xx rate, error budget | Sức khỏe |
| Performance | p50/p95/p99, throughput | Trải nghiệm |
| DevEx | Time-to-first-call, integration tickets | Ma sát |
| Compatibility | Breaking changes/quý, version distribution | Rủi ro |
| Deprecation | % traffic còn lại, tuổi endpoint deprecated | Nợ kỹ thuật |
| Support/Cost | Tickets/1k req, cost/1M req | Hiệu quả |

Phân biệt leading/lagging, tránh áp KPI cá nhân.

---

## 12. Governance

| Thành phần | Mục đích | Mức tối thiểu |
|---|---|---|
| Style guide | Nhất quán | 1 trang |
| API lint (Spectral/Redocly) | Tự động enforce | Trong CI |
| Catalog | Biết API/owner/lifecycle | Bảng hoặc công cụ |
| Ownership (CODEOWNERS) | Rõ trách nhiệm | Có owner |
| Review board | Quyết định lớn | Chỉ public/breaking/auth |
| Exception process | Lệch có lý do, có hạn | Ghi lại rõ ràng |

---

## 13. Quy trình cho repo nhỏ và team lớn

| Hoạt động | Repo 1–3 người | Team lớn |
|---|---|---|
| Discovery | Ghi ngắn + canvas | Workshop, research, PRD |
| Design | Peer review + spec PR | RFC + review board |
| Test | Unit+integration+contract cơ bản | Đầy đủ + load/chaos/security |
| Release | Deploy + smoke test | Canary, feature flag, CAB/change process |
| Docs | README + OpenAPI | Portal versioned, SDK |
| Deprecation | Thông báo nội bộ 30 ngày | 6–12 tháng, migration plan |
| On-call | Chủ động | Rotation + SLO |

**Tối thiểu cho repo nhỏ:** spec trước, >=1 integration + 1 contract, lint+typecheck, changelog, ghi owner/ngày deprecation.

---

## 14. Templates

### 14.1 RFC
```markdown
# RFC: <tên thay đổi>
- Status: Draft | Review | Accepted | Rejected
- Owner: <tên>
- Ngày: YYYY-MM-DD
- Ảnh hưởng API version: <x.y>

## Bối cảnh
## Đề xuất
## Phương án thay thế
## Ảnh hưởng (compatibility/migration/security)
## Rollout & metrics
## Câu hỏi mở
```

### 14.2 Design review record
```markdown
# Design review: <endpoint>
- Người review: ...
- Spec: <link>
- Kết luận: Approved | Approved with changes | Rejected

## Đã chốt
## Cần sửa (action + owner + deadline)
## Rủi ro còn lại
```

### 14.3 Deprecation notice
```markdown
# Deprecation: <endpoint/field>
- Ngày công bố: YYYY-MM-DD
- Ngày sunset: YYYY-MM-DD
- Thay thế bởi: <endpoint mới>
- Lý do: ...

## Cần làm
## Mapping cũ → mới
## Hỗ trợ
```

### 14.4 Release note
```markdown
# API release <version> — YYYY-MM-DD
## Added
## Changed
## Deprecated
## Removed
## Fixed
## Security
## Migration
```

### 14.5 Incident template (tóm tắt)
```markdown
# Incident: <tóm tắt>
- Severity: SEV1/2/3/4
- Thời gian: start/end
- Ảnh hưởng:
- Timeline (UTC):
- Root cause summary:
- Mitigation/rollback:
- Action items (owner+deadline):
```

---

## 15. Checklist theo giai đoạn

### Discovery
- [ ] Use case, consumer, success metric rõ
- [ ] Domain model, ranh giới, non-goals
- [ ] Rủi ro ban đầu (bảo mật/dữ liệu)

### Design
- [ ] OpenAPI hợp lệ + lint pass
- [ ] RFC/review record
- [ ] Authz, errors, pagination, compatibility

### Build
- [ ] Khớp spec, validation, service/repo phân tách
- [ ] Migration có rollback
- [ ] Observability thêm

### Test
- [ ] Unit/integration/contract
- [ ] E2E cho luồng chính
- [ ] Security/load nếu rủi ro cao

### Release
- [ ] Changelog/docs
- [ ] Canary/rollback
- [ ] Dashboard/alert, smoke test

### Operate/Deprecate/Retire
- [ ] SLO theo dõi, runbook
- [ ] Deprecation headers/notice
- [ ] Usage = 0 trước retire, archive

---

## 16. Anti-patterns

| Anti-pattern | Hệ quả | Cách tránh |
|---|---|---|
| Viết docs sau | Lệch spec | Spec-first/docs-as-code |
| Không rõ API owner | Không ai quyết định | Gán owner + CODEOWNERS |
| Version sớm không cần thiết | Nợ version | Chỉ version khi breaking |
| Breaking "nhỏ" không thông báo | Client gãy | Checklist tương thích + CI diff |
| Deprecation vô thời hạn | Tồn tại mãi | Sunset date bắt buộc |
| Chỉ đo uptime | Không thấy trải nghiệm | SLI đa chiều + SLO |
| Review board duyệt mọi thứ | Bottleneck | Chỉ review lớn/breaking/public |
| Sao chép quy trình enterprise | Giấy tờ thừa | Quy trình tối thiểu phù hợp quy mô |

---

## 17. Tài liệu tham khảo

- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.1.html)
- [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [RFC 8594 - The Sunset HTTP Header](https://www.rfc-editor.org/rfc/rfc8594)
- [RFC 9745 - The Deprecation HTTP Header Field](https://www.rfc-editor.org/rfc/rfc9745)
- [Semantic Versioning](https://semver.org/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
- [Google SRE - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)

Xem thêm: [01-fundamentals.md](./01-fundamentals.md) · [02-rest-design.md](./02-rest-design.md) · [03-openapi.md](./03-openapi.md) · [05-project-structure.md](./05-project-structure.md) · [06-testing-observability.md](./06-testing-observability.md) · [07-checklists-templates.md](./07-checklists-templates.md)
