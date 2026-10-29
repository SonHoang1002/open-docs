# Vòng đời API — Quản lý API như một sản phẩm

> API không kết thúc ở lúc deploy. Tài liệu này mô tả vòng đời đầy đủ từ **discovery**
> đến **retire**, vai trò và RACI, quy trình review, test gates, release, deprecation,
> vận hành, metrics và governance — kèm template và checklist áp dụng được cho repo
> nhỏ lẫn team lớn.

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

Đây không phải waterfall. Mỗi vòng lặp có thể chỉ vài ngày với một endpoint nhỏ, hoặc
vài tháng với API public. Điểm quan trọng: **mỗi giai đoạn có đầu vào, đầu ra và tiêu chí
thoát rõ ràng**, để không có "API ma" được deploy mà không ai sở hữu.

| Giai đoạn | Mục tiêu | Artifact | Tiêu chí thoát |
|---|---|---|---|
| Discovery | Hiểu người dùng và vấn đề | Use case, API canvas, success metrics | Vấn đề và phạm vi được duyệt |
| Design | Chốt contract trước code | OpenAPI, RFC, design review | Spec + security được approve |
| Build | Implement đúng contract | Code, migration, mock, feature flag | CI xanh, contract test pass |
| Test | Chứng minh đúng và đủ bền | Test report, load/security result | Quality gate pass |
| Release | Đưa ra người dùng an toàn | Release note, SDK, docs | Canary ổn định, rollback sẵn sàng |
| Operate | Giữ SLO và cải tiến | Dashboard, SLO, incident log | SLO trong ngưỡng, feedback được xử lý |
| Deprecate | Giảm dần sử dụng | Deprecation notice, migration guide | Không còn traffic hoặc hết sunset |
| Retire | Gỡ bỏ an toàn | Post-mortem, archive | Endpoint/tài nguyên bị xóa |

**API là sản phẩm**, không phải hợp đồng kỹ thuật đơn thuần. Người dùng API (frontend,
mobile, đối tác, chính team data) có nhu cầu, kỳ vọng và "giá" chuyển đổi. Mọi thay đổi
có chi phí; chi phí tăng theo thời gian:

| Thời điểm phát hiện vấn đề | Chi phí sửa tương đối |
|---|---|
| Discovery/Design | 1× |
| Build | 5× |
| Test/Release | 20× |
| Production | 100× (client đã tích hợp) |

Với dự án wedding guestbook, vòng đời thực tế có thể là: khách cần gửi lời chúc → thiết
kế `POST /messages` + cursor list → build với Supabase → test rate limit → release trước
đám cưới 2 tuần → theo dõi traffic trong lễ → sau lễ, chuyển API sang read-only rồi
retire. Ngay cả dự án nhỏ cũng nên có mốc deprecation, thay vì để server chạy mãi.

---

## 2. Vai trò và RACI

| Vai trò | Trách nhiệm chính |
|---|---|
| **API owner** | Chịu trách nhiệm cuối cùng về contract, versioning, deprecation |
| **Product** | Ưu tiên use case, success metrics, đánh đổi phạm vi |
| **Backend** | Thiết kế chi tiết, implement, migration, vận hành |
| **Frontend/Mobile** | Consumer đầu tiên; phản biện ergonomics, phát hiện thiếu field |
| **QA** | Test plan, contract/e2e/load test, release verification |
| **Security** | Threat model, authn/authz, review dữ liệu nhạy cảm |
| **SRE/Platform** | SLO, CI/CD, observability, on-call, capacity |
| **Tech writer** | Reference, quickstart, changelog, migration guide |

RACI (R = Responsible, A = Accountable, C = Consulted, I = Informed):

| Hoạt động | API owner | Product | Backend | FE/Mobile | QA | Security | SRE | Writer |
|---|---|---|---|---|---|---|---|---|
| Discovery | A | R | C | C | I | I | I | I |
| API design | A | C | R | C | C | C | I | C |
| Security review | A | I | R | C | C | R | C | I |
| Implementation | A | I | R | C | I | C | C | I |
| Test | A | I | R | C | R | C | C | I |
| Documentation | A | C | C | C | C | C | I | R |
| Release | A | I | R | I | R | C | R | I |
| On-call/incident | A | I | R | I | C | C | R | I |
| Deprecation | A | C | R | C | I | C | I | R |

Lưu ý:

- Một người có thể giữ nhiều vai trò trong repo 1–3 người, nhưng **không nên vừa là A vừa
  là R cho mọi việc** — mất tính phản biện.
- "A" chỉ có một người cho mỗi hoạt động. Nếu không xác định được A, API sẽ không ai bảo
  vệ khi cần deprecate.
- Security và SRE nên là **C** sớm, không phải người phát hiện vấn đề ở cuối.

---

## 3. Discovery

Mục tiêu: trả lời "có nên làm API này không, cho ai, thành công đo bằng gì" trước khi
tranh luận về field name.

### 3.1 Use case và consumer research

- **Ai gọi API?** Web guestbook, màn hình LED tại lễ, app mobile, đối tác chụp ảnh, hệ
  thống email. Mỗi consumer có ràng buộc khác nhau (latency, auth, offline).
- **Họ làm gì?** Gửi lời chúc, xem danh sách, RSVP, kiểm duyệt, export.
- **Tần suất và khối lượng?** 50 khách hay 5.000 khách? Cao điểm ngay giờ lễ.
- **Điều gì đang đau?** Support ticket, thời gian chờ, lỗi nhập liệu, dữ liệu trùng.
- **Họ đang dùng giải pháp nào?** Google Form, giấy, app khác — chi phí chuyển đổi?

Nguồn dữ liệu: phỏng vấn 3–5 người dùng thật, đọc ticket, xem analytics (nếu có), và
quan sát luồng hiện tại. Tránh "tôi nghĩ người dùng cần".

### 3.2 Domain modeling

Xác định entity, quan hệ và **ranh giới** trước khi thiết kế endpoint:

```text
Guest 1 ──< Message >── 1 Event (wedding)
                 │
                 └──< ModerationAction (admin)
```

Câu hỏi cần chốt:

- `Message` có thuộc về `Guest` hay chỉ có `sender_name` tự do?
- Một khách có thể gửi nhiều lời chúc không? Nếu có, giới hạn bao nhiêu?
- `will_attend` và `number_attend` có phải trạng thái của `Guest` hay của `Message`?
- Xóa mềm hay xóa cứng? Ai được xóa? Có audit log không?
- Dữ liệu nào nhạy cảm (số điện thoại, địa chỉ) và có thực sự cần trả về?

Sai lầm phổ biến: biến mọi thứ thành CRUD `messages`, để UI tự suy ra RSVP, rồi phải
thêm field `status`, `deleted_at`, `updated_by` một cách vá víu.

### 3.3 API Canvas

Một trang giấy đủ để thống nhất trước khi viết spec:

```text
┌─ API Canvas: Wedding Messages ─────────────────────────────┐
│ Purpose      : Khách gửi lời chúc + RSVP; admin kiểm duyệt │
│ Consumers    : Web guestbook, LED display, admin dashboard  │
│ Success      : 80% khách gửi trong 24h; p95 < 300ms         │
│ Resources    : Message, Event, ModerationAction             │
│ Operations   : list/create/update/delete + realtime stream  │
│ Auth         : public create/list; admin JWT cho write      │
│ Constraints  : 5k messages, cao điểm 100 req/s, mobile 3G   │
│ Errors       : 400/422/429/500; problem+json                │
│ Non-goals    : chat, upload ảnh, thanh toán, multi-tenant    │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Success metrics

Chọn 2–3 metric dẫn dắt, không phải 20:

| Metric | Ví dụ | Đo bằng |
|---|---|---|
| Adoption | 80% khách mời gửi lời chúc | Số message / số thiệp |
| Time-to-first-call | < 10 phút cho dev mới | Đo trong quickstart test |
| Reliability | 99.9% request thành công | Log/APM |
| Performance | p95 < 300ms | APM |
| Support load | < 5 ticket/tuần | Helpdesk |

Nếu không định nghĩa được success metric, rất có thể API chưa cần tồn tại.

---

## 4. Design-first và API review

### 4.1 RFC và design review

Với thay đổi vừa/lớn, viết **RFC ngắn** (1–2 trang) trước spec chi tiết:

- Bối cảnh và vấn đề.
- Đề xuất (endpoint, resource, auth, pagination).
- Phương án thay thế và lý do loại.
- Ảnh hưởng tương thích (backward compatibility), migration.
- Security/privacy, rate limit, dữ liệu nhạy cảm.
- Rollout, metrics, open questions.

RFC giúp phát hiện "chúng ta đang giải sai bài toán" trước khi tốn công viết OpenAPI.

### 4.2 Design review vs code review

| Tiêu chí | Design review | Code review |
|---|---|---|
| Đối tượng | Contract, use case, ergonomics | Implementation, style, bug |
| Thời điểm | Trước/song song code | Trong PR |
| Người review | FE, QA, security, API owner | Backend peers |
| Câu hỏi chính | "API này có dễ dùng, đúng và bền?" | "Code này có đúng, rõ, an toàn?" |
| Output | Quyết định + spec đã sửa | Approval/comment trên PR |
| Không thay thế | Code review | Design review |

Một PR code có thể pass dù thiết kế API tệ. Vì vậy design review phải là **gate riêng**,
với checklist và người có quyền quyết định.

### 4.3 Design review checklist

- [ ] Use case và consumer rõ; không thêm endpoint "để sau này dùng".
- [ ] Resource/verb đúng REST; không RPC hóa tùy tiện.
- [ ] Tên field nhất quán (`snake_case` hoặc `camelCase`) và có nghĩa với client.
- [ ] Request/response tách biệt; không leak field nội bộ.
- [ ] Pagination/filter/sort rõ; có giới hạn.
- [ ] Lỗi và status code nhất quán; có mã lỗi ổn định.
- [ ] Authn/authz rõ; không dựa vào client để kiểm tra quyền.
- [ ] Idempotency/retry được xem xét cho thao tác ghi.
- [ ] Backward compatibility và versioning được đánh giá.
- [ ] Có example thực tế, không phải `foo`/`bar`.
- [ ] Dữ liệu nhạy cảm không bị trả về hoặc ghi log.
- [ ] Rate limit, quota, abuse case được nêu.

### 4.4 Style guide và governance

Style guide tối thiểu nên chốt:

- Danh từ số nhiều, kebab-case cho path; `snake_case`/`camelCase` thống nhất cho field.
- `operationId` quy ước; status code; format ngày giờ ISO 8601 UTC.
- Envelope và error format; pagination; cách đặt tên enum.
- Quy tắc versioning và deprecation.

Governance không phải "hội đồng phê duyệt mọi thứ". Nó là **bộ luật nhỏ + tự động hóa**:
lint trong CI, template PR, owner trong `CODEOWNERS`, review board chỉ cho API public
hoặc breaking change.

---

## 5. Build và implementation

### 5.1 Contract là nguồn sự thật

- Spec được merge **trước hoặc cùng** PR code.
- Type/client sinh từ spec, không viết tay.
- Mock server dựng từ spec để FE làm song song.
- Không sửa spec "cho khớp code" sau khi code sai; sửa một trong hai và cập nhật test.

### 5.2 Quy trình build

```text
Freeze spec → generate types/client + mock → implement handler/service/repo
→ integration test → contract test → feature flag → deploy staging
→ FE integration → canary → release
```

- **Codegen**: `openapi-typescript`, `orval`, `openapi-generator`. Commit generated
  artifact nếu team muốn review diff; nếu không, generate trong CI và cache.
- **Mock**: Prism/MSW từ spec; FE không chờ backend.
- **Feature flag**: bật endpoint mới cho nội bộ trước, sau đó cho % user.
- **Migration**: viết migration có rollback; test trên dữ liệu giống production.
- **Observability**: thêm log/metric/trace **trước** khi bật traffic.

### 5.3 Implementation checklist

- [ ] Handler validate input bằng schema (Zod/JSON Schema), không tin client.
- [ ] Business rule nằm ở service, không nhét vào controller.
- [ ] DB query có index cho filter/sort/cursor.
- [ ] Error được map tập trung; không leak stack/SQL.
- [ ] Response không chứa field nội bộ hoặc secret.
- [ ] Có request id và log có cấu trúc.
- [ ] Rate limit/body limit được áp dụng.
- [ ] Feature flag và kill switch nếu cần.

Xem [05-project-structure.md](./05-project-structure.md) để tổ chức code theo module.

---

## 6. Test gates

### 6.1 Các tầng test

| Tầng | Kiểm tra gì | Ví dụ | Chạy khi |
|---|---|---|---|
| Unit | Logic thuần, validation, mapping | `number_attend` rule | Mỗi commit |
| Integration | Handler + DB/queue thật (hoặc container) | POST tạo row + broadcast | Mỗi PR |
| Contract | Response khớp OpenAPI | Validate `MessagePage` | Mỗi PR |
| E2E | Luồng người dùng | Gửi lời chúc → thấy trên LED | Trước release |
| Load | Throughput, p95, tài nguyên | 100 req/s trong 10 phút | Trước release lớn |
| Security | Authz, injection, rate limit | Guest sửa message người khác | Mỗi PR/tuần |
| Chaos | Mất DB/redis, timeout | Supabase chậm 5s | Định kỳ |

### 6.2 Quality gate trong CI

```yaml
# Thứ tự gợi ý; fail sớm để tiết kiệm thời gian
stages:
  - lint:        # eslint, tsc, redocly lint
  - unit:        # bun test --coverage
  - integration: # test với DB test
  - contract:    # schema validation + oasdiff
  - security:    # dependency scan, secret scan
  - build:       # build artifact
  - deploy:      # staging, smoke test
```

Ngưỡng gợi ý (điều chỉnh theo dự án):

| Gate | Ngưỡng |
|---|---|
| Typecheck/lint | 0 error |
| Unit coverage | ≥ 70% cho module mới (không ép toàn repo) |
| Contract | 100% response mẫu validate |
| Breaking change | 0 ngoài dự kiến (`oasdiff`) |
| Security high/critical | 0 |
| p95 load test | < SLO cam kết |
| Smoke test | 100% pass |

> 💡 Coverage là chỉ số phụ. Một test contract/e2e tốt cho luồng chính có giá trị hơn
> 90% unit test chỉ chạy qua getter.

Xem [06-testing-observability.md](./06-testing-observability.md) để biết công cụ và ví dụ.

---

## 7. Documentation và developer experience

### 7.1 Bộ tài liệu tối thiểu

| Loại | Câu hỏi trả lời | Ví dụ |
|---|---|---|
| Reference | "Endpoint này có field gì?" | OpenAPI render (Scalar/Redoc) |
| Quickstart | "Làm sao gọi được trong 5 phút?" | curl + token + response mẫu |
| Tutorial | "Làm sao làm luồng X?" | Gửi lời chúc + upload ảnh |
| Changelog | "Có gì mới, có breaking không?" | Added/Changed/Deprecated |
| Migration guide | "Tôi phải sửa gì?" | Trước/sau, codemod |
| SDK | "Dùng thư viện nào?" | TS/Python client |
| Sandbox | "Thử mà không sợ bẩn dữ liệu?" | Mock server/staging |

### 7.2 Docs-as-code

- Spec và docs nằm trong repo, review như code.
- CI build docs, kiểm tra link chết và example hợp lệ.
- Mỗi release tạo version docs mới; URL cũ vẫn hoạt động.
- Có nút "Edit on GitHub" và kênh feedback (issue template).

### 7.3 Developer experience (DevEx)

Đo **time-to-first-call**: thời gian từ lúc dev mới mở docs đến khi nhận response 200.

Các yếu tố ảnh hưởng:

- Có token sandbox lấy ngay, không qua 3 lớp phê duyệt.
- curl copy-paste được, không placeholder `YOUR_TOKEN`.
- Error message nói rõ field nào sai và sửa thế nào.
- SDK có type, retry, timeout mặc định hợp lý.
- Không cần đọc source để hiểu pagination.

Với API nội bộ, DevEx tốt giảm thời gian tích hợp từ ngày xuống giờ.

---

## 8. Release

### 8.1 Semantic versioning cho API

`info.version` (và tag release) theo `MAJOR.MINOR.PATCH` của **contract**:

| Thay đổi | Version | Ví dụ |
|---|---|---|
| Breaking: xóa field/endpoint, đổi type, thêm required request field | MAJOR | `1.4.2 → 2.0.0` |
| Thêm endpoint/field optional, nới validation | MINOR | `1.4.2 → 1.5.0` |
| Sửa docs/example, fix bug không đổi contract | PATCH | `1.4.2 → 1.4.3` |

Không nhầm với version của **deployment** (git SHA, image tag). Một API version có thể
được deploy nhiều lần.

### 8.2 Backward compatibility

| Thay đổi | Compatible? | Ghi chú |
|---|---|---|
| Thêm field optional vào response | ✅ | Client cũ bỏ qua |
| Thêm endpoint | ✅ | |
| Thêm field optional vào request | ✅ | |
| Nới `maxLength`/thêm enum value | ⚠️ | Enum value có thể breaking với client cứng |
| Thêm field **required** vào request | ❌ | Client cũ gãy |
| Xóa/rename field, đổi type | ❌ | |
| Đổi status code thành công | ❌ | Client check `200` |
| Thắt chặt validation | ❌ | Dữ liệu cũ có thể fail |
| Đổi auth/scope | ❌ | |

Quy tắc: **consumer chỉ phụ thuộc vào những gì được cam kết**. Ghi rõ trong docs field
nào ổn định, field nào có thể xuất hiện thêm.

### 8.3 Rollout

```text
staging (nội bộ) → canary 5% → 25% → 100% → ổn định 24–48h → đóng feature flag
```

- Canary theo % traffic hoặc theo API key/consumer.
- So sánh error rate/latency giữa canary và baseline.
- Rollback phải mất < 5 phút; nếu không, chưa sẵn sàng release.
- Với thay đổi DB, dùng expand/contract: thêm cột → dual write → backfill → đọc cột mới
  → bỏ cột cũ.

### 8.4 Communication

Trước release: changelog + email/Slack cho consumer + cập nhật docs.
Sau release: thông báo version, link migration, kênh hỗ trợ.

Với API public, release breaking change cần thông báo trước tối thiểu 6 tháng (trừ bảo
mật khẩn cấp).

---

## 9. Deprecation và Sunset

### 9.1 Header chuẩn

- `Sunset` (RFC 8594): thời điểm endpoint/resource ngừng hoạt động.
- `Deprecation` (RFC 9745, trước là draft): thời điểm bắt đầu deprecate, dạng
  Structured Fields date (`@<unix-seconds>`).
- `Link` với `rel="deprecation"`: tài liệu migration.

```http
HTTP/1.1 200 OK
Deprecation: @1767225600
Sunset: Thu, 31 Dec 2026 23:59:59 GMT
Link: <https://docs.wedding.example.com/migrate/v2>; rel="deprecation"; type="text/html"
Warning: 299 - "Endpoint này sẽ bị gỡ vào 2026-12-31; xem Link để migrate"
```

> ⚠️ Nhiều tài liệu ghi `Deprecation` thuộc RFC 8594 — không đúng. RFC 8594 chỉ định
> nghĩa `Sunset`; `Deprecation` nay là RFC 9745. Dùng đúng để tooling/proxy hiểu.

### 9.2 Timeline

| Mốc | Hành động | Kênh |
|---|---|---|
| T-180 ngày | Công bố deprecation, gắn header, mở migration guide | Email, changelog, docs |
| T-90 ngày | Nhắc lại, theo dõi usage theo client/key | Dashboard, email |
| T-30 ngày | Cảnh báo mạnh, liên hệ trực tiếp consumer còn traffic | Email, call |
| T-7 ngày | Thông báo cuối, chuẩn bị kill switch | Slack/email |
| T-0 | Trả 410/404, log, giữ redirect nếu có | Release note |
| T+30 | Xóa code/schema, archive docs, post-mortem | Repo |

Thời lượng thực tế:

| Loại API | Thời gian tối thiểu |
|---|---|
| Public/đối tác | 6–12 tháng |
| Nội bộ nhiều team | 90 ngày |
| Nội bộ một team | 30 ngày |
| Bảo mật khẩn cấp | 24–72 giờ (kèm thông báo đặc biệt) |

### 9.3 Theo dõi usage

- Đếm request theo `operationId`, API key, client version, consumer.
- Dashboard deprecation: % traffic còn gọi endpoint cũ.
- Cảnh báo khi có consumer mới vẫn dùng endpoint cũ (nghĩa là docs/changelog chưa đủ).
- Không tắt khi chưa xác nhận traffic = 0, trừ khi đã hết sunset và có chấp thuận.

### 9.4 Migration guide

Cấu trúc tối thiểu:

1. Vì sao thay đổi, lợi ích.
2. Timeline và header sẽ thấy.
3. Mapping cũ → mới (bảng field/endpoint).
4. Ví dụ trước/sau (curl + code).
5. Các lỗi thường gặp khi migrate.
6. Cách kiểm tra đã migrate xong.
7. Liên hệ hỗ trợ.

---

## 10. Operate

### 10.1 SLI, SLO, error budget

| SLI | SLO ví dụ | Đo |
|---|---|---|
| Availability | 99.9% request không lỗi 5xx | `1 - 5xx/total` |
| Latency | p95 < 300ms, p99 < 800ms | Histogram |
| Correctness | < 0.1% response sai schema | Contract monitor |
| Freshness | Message mới hiện trên LED < 2s | End-to-end probe |
| Saturation | CPU < 70%, connection pool < 80% | Metrics |

**Error budget** = 1 − SLO. Với 99.9%/30 ngày, budget ≈ 43 phút downtime. Khi budget
cạn: ưu tiên reliability hơn feature mới; khi còn nhiều: có thể release nhanh hơn.

### 10.2 On-call và incident

| Severity | Ví dụ | Phản hồi | Cập nhật |
|---|---|---|---|
| SEV1 | API sập, mất dữ liệu | Ngay lập tức | Mỗi 15 phút |
| SEV2 | Lỗi một phần, latency cao | < 15 phút | Mỗi 30 phút |
| SEV3 | Ảnh hưởng nhỏ, có workaround | < 1 giờ | Hàng ngày |
| SEV4 | Cosmetic, không ảnh hưởng | Trong sprint | — |

Runbook cần có: kiểm tra health, rollback, kill switch, liên hệ DB/provider, cách tìm
request id trong log. Sau incident: blameless post-mortem, action item có owner/ngày.

### 10.3 Capacity và cost

- Ước lượng cao điểm (lễ cưới: 100–500 req/s trong vài phút) và test load.
- Biết giới hạn của Supabase (connection pool, row limit, egress) và của runtime.
- Cache response công khai (ETag/CDN) để giảm tải DB.
- Theo dõi cost theo request/tenant; log quá nhiều cũng là chi phí.
- Có kế hoạch scale ngang cho WebSocket nếu nhiều màn hình cùng kết nối.

---

## 11. Metrics

| Nhóm | Metric | Cách đọc |
|---|---|---|
| Adoption | Số consumer active, request/ngày, API key mới | Tăng trưởng và độ phủ |
| Reliability | Availability, 5xx rate, error budget còn lại | Sức khỏe |
| Performance | p50/p95/p99, throughput | Trải nghiệm |
| DevEx | Time-to-first-call, ticket tích hợp | Ma sát |
| Compatibility | Số breaking change/quý, client version phân bố | Rủi ro |
| Deprecation | Số endpoint deprecated, % traffic còn lại, tuổi deprecation | Nợ kỹ thuật |
| Support | Ticket/1k request, thời gian phản hồi | Chi phí hỗ trợ |
| Cost | Cost/1M request, egress | Hiệu quả |

Phân biệt **leading** (deployment frequency, test flake, thời gian review) và **lagging**
(incident, SLO burn, ticket). Dashboard nên có cả hai, nhưng đừng biến mọi thứ thành KPI
áp lực lên cá nhân.

---

## 12. Governance

### 12.1 Thành phần

| Thành phần | Mục đích | Mức tối thiểu |
|---|---|---|
| Style guide | Nhất quán tên/format/error | 1 trang |
| Lint | Tự động enforce | Spectral/Redocly trong CI |
| Catalog | Biết API nào tồn tại, ai sở hữu | Spreadsheet/Backstage |
| Ownership | Ai chịu trách nhiệm | `CODEOWNERS`, owner field |
| Review board | Quyết định thay đổi lớn | Chỉ public/breaking |
| Exception process | Cho phép lệch có lý do | Ghi lại, có hạn |

### 12.2 API linting trong CI

Rule tối thiểu:

- Có `operationId`, `tags`, `summary`.
- Mọi operation có ít nhất một lỗi 4xx và 5xx.
- Không dùng `nullable` (3.1), không path parameter thiếu `required`.
- Có example cho request/response thành công.
- Không có `http://` trong `servers` production.
- Security scheme được khai báo cho operation không public.

### 12.3 Catalog và ownership

Mỗi API/endpoint cần:

- Tên, mô tả, owner (team + người).
- Lifecycle stage (experimental/beta/stable/deprecated).
- Consumer đã biết.
- Link spec, docs, dashboard, runbook.
- Ngày review gần nhất.

Catalog có thể bắt đầu bằng `docs/api/catalog.yaml`; chỉ cần khi số API > 5–10.

### 12.4 Review board — có mức độ

- Repo nhỏ: API owner + một peer review là đủ.
- Team vừa: thêm security review cho endpoint mới; design review cho breaking change.
- Tổ chức lớn: review board cho API public, thay đổi auth, hoặc cross-team. Không dùng
  board để duyệt mọi field name — sẽ thành bottleneck.

---

## 13. Quy trình cho repo nhỏ và team lớn

| Hoạt động | Repo 1–3 người | Team lớn |
|---|---|---|
| Discovery | Ghi 1 trang use case + canvas | Workshop, research, PRD |
| Design review | Peer review + spec PR | RFC + review board |
| Spec | 1 file OpenAPI | Nhiều file, catalog |
| Test | Unit + integration + contract cơ bản | Đầy đủ + load/chaos |
| Release | Deploy + smoke test | Canary, feature flag, change advisory |
| Docs | README + OpenAPI render | Portal, versioned docs, SDK |
| Deprecation | Thông báo nội bộ, 30 ngày | 6–12 tháng, migration team |
| On-call | Owner trực tiếp | Rotation, SLO, incident process |

**Quy trình tối thiểu cho repo nhỏ** (vẫn giữ được lợi ích):

1. Viết spec trước endpoint mới, merge cùng PR.
2. Có ít nhất 1 test integration + 1 contract test.
3. `redocly lint` + typecheck trong CI.
4. Changelog ngắn mỗi release.
5. Ghi owner và ngày deprecation ngay từ đầu.

Không nên copy nguyên quy trình enterprise vào repo 2 người: sẽ tạo giấy tờ thay vì
chất lượng. Ngược lại, team lớn không thể chỉ dựa vào "mọi người tự giác".

---

## 14. Templates

### 14.1 RFC

```markdown
# RFC: <tên thay đổi>

- Status: Draft | Review | Accepted | Rejected
- Owner: <tên>
- Ngày: YYYY-MM-DD
- API version ảnh hưởng: <1.x>

## Bối cảnh
<Vấn đề, consumer, dữ liệu/support ticket>

## Đề xuất
<Endpoint, resource, auth, pagination, error>

## Phương án thay thế
<Đã cân nhắc gì, vì sao loại>

## Ảnh hưởng
<Backward compatibility, migration, dữ liệu, security>

## Rollout & metrics
<Canary, feature flag, success metric>

## Câu hỏi mở
<Cần quyết định gì, ai quyết>
```

### 14.2 Design review record

```markdown
# Design review: <endpoint>

- Người review: <FE, QA, security, owner>
- Spec: <link>
- Kết luận: Approved | Approved with changes | Rejected

## Đã chốt
- <quyết định>

## Cần sửa
- [ ] <action> — owner, deadline

## Rủi ro còn lại
- <rủi ro + cách giảm>
```

### 14.3 Deprecation notice

```markdown
# Deprecation: <endpoint/field>

- Ngày công bố: YYYY-MM-DD
- Ngày sunset: YYYY-MM-DD
- Lý do: <thay thế bởi gì>
- Ảnh hưởng: <consumer nào>

## Bạn cần làm
1. Chuyển sang `<endpoint mới>` trước `<ngày>`.
2. Kiểm tra header `Deprecation`/`Sunset` trong response.
3. Theo dõi migration guide: <link>.

## Mapping
| Cũ | Mới |
|---|---|
| `GET /v1/messages?page=2` | `GET /v2/messages?cursor=...` |

## Hỗ trợ
<kênh liên hệ, office hours>
```

### 14.4 Release note

```markdown
# API release <version> — YYYY-MM-DD

## Added
- `GET /messages/{id}` trả `ETag`.

## Changed
- `limit` mặc định 20, tối đa 50 (trước không giới hạn).

## Deprecated
- `GET /v1/messages?page=` sẽ sunset 2027-04-01; dùng cursor.

## Fixed
- 422 trả đúng `errors[].path` cho `number_attend`.

## Security
- Bắt buộc Bearer JWT cho PUT/PATCH/DELETE.

## Migration
<Link tới guide + codemod nếu có>
```

---

## 15. Checklist theo giai đoạn

### Discovery

- [ ] Có use case và danh sách consumer cụ thể.
- [ ] Đã phỏng vấn/đọc phản hồi người dùng thật.
- [ ] Domain entity và quan hệ rõ; biết cái gì không thuộc phạm vi.
- [ ] Success metrics có baseline và mục tiêu.
- [ ] Đã cân nhắc build vs buy, giải pháp không-API.
- [ ] Rủi ro bảo mật/privacy ban đầu được nêu.

### Design

- [ ] OpenAPI hợp lệ, lint pass.
- [ ] Resource/verb, tên field, error format nhất quán style guide.
- [ ] Có pagination/filter/sort và giới hạn.
- [ ] Authn/authz và scope rõ; có 401/403.
- [ ] Có example thành công + lỗi.
- [ ] Backward compatibility được đánh giá.
- [ ] Design review có người ngoài backend.
- [ ] RFC/decision record được lưu.

### Build

- [ ] Code khớp spec; type sinh từ spec hoặc contract test.
- [ ] Validation ở server; business rule ở service.
- [ ] Migration có rollback và đã test.
- [ ] Log/metric/trace có request id.
- [ ] Rate limit/body limit/CORS được cấu hình.
- [ ] Feature flag/kill switch nếu cần.

### Test

- [ ] Unit + integration cho luồng chính và lỗi.
- [ ] Contract test validate response.
- [ ] E2E luồng người dùng.
- [ ] Load test ở mức cao điểm dự kiến.
- [ ] Security test: authz, injection, rate limit, dữ liệu nhạy cảm.
- [ ] Không có breaking change ngoài dự kiến.

### Release

- [ ] Changelog và docs đã cập nhật.
- [ ] Canary/rollback đã chuẩn bị.
- [ ] Dashboard và alert hoạt động.
- [ ] Smoke test staging pass.
- [ ] Có người theo dõi trong 24h đầu.

### Operate

- [ ] SLO/SLI và alert có owner.
- [ ] Runbook on-call cập nhật.
- [ ] Error budget được theo dõi.
- [ ] Capacity/cost trong ngưỡng.
- [ ] Feedback consumer được ghi nhận.

### Deprecate/Retire

- [ ] Có ngày sunset và header `Deprecation`/`Sunset`.
- [ ] Migration guide + mapping field.
- [ ] Dashboard usage theo consumer.
- [ ] Đã liên hệ consumer còn traffic.
- [ ] Có kế hoạch trả 410/404 và xóa code.
- [ ] Docs cũ được archive, catalog cập nhật.
---

## 16. Anti-patterns

| Anti-pattern | Hệ quả | Cách tránh |
|---|---|---|
| "Viết docs sau" | Docs lệch, không ai tin | Spec trong PR, CI diff |
| API owner không rõ | Không ai quyết định deprecate | Gán owner trong catalog/CODEOWNERS |
| Version mọi thứ (`/v1`, `/v2` ngay từ đầu) | Nợ version, client phân mảnh | Chỉ version khi breaking thật sự |
| Breaking change "nhỏ" không thông báo | Client production gãy | Compatibility checklist + CI |
| Deprecation không ngày | Tồn tại vĩnh viễn | Sunset date ngay khi announce |
| Chỉ đo uptime | Không thấy latency/lỗi chức năng | SLI đa chiều + SLO |
| Review board duyệt mọi field | Bottleneck, chậm release | Chỉ review thay đổi lớn |
| Copy quy trình enterprise cho repo nhỏ | Giấy tờ nhiều, chất lượng không tăng | Quy trình tối thiểu |
| Không có consumer research | Xây API không ai dùng | Phỏng vấn, analytics |
| Docs và spec là hai nguồn | Lệch nhau | Generate docs từ spec |
| Không theo dõi usage khi deprecate | Tắt sớm hoặc không bao giờ tắt | Dashboard theo consumer |
| On-call không có runbook | Xử lý chậm, hoảng loạn | Runbook + drill |
| Feature flag không dọn | Code rối, hành vi khó đoán | Ngày hết hạn cho flag |

---

## 17. Tài liệu tham khảo

- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.1.html)
- [RFC 8594 — Sunset](https://www.rfc-editor.org/rfc/rfc8594) ·
  [RFC 9745 — Deprecation](https://www.rfc-editor.org/rfc/rfc9745) ·
  [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457)
- [Semantic Versioning](https://semver.org/) · [Stripe API versioning](https://stripe.com/docs/api/versioning)
- [Google API Design Guide](https://cloud.google.com/apis/design) ·
  [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) ·
  [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
- [Google SRE — SLO](https://sre.google/sre-book/service-level-objectives/) ·
  [Backstage Catalog](https://backstage.io/docs/features/software-catalog/) ·
  [AsyncAPI](https://www.asyncapi.com/)

Xem thêm: [01-fundamentals.md](./01-fundamentals.md) · [02-rest-design.md](./02-rest-design.md) ·
[03-openapi.md](./03-openapi.md) · [05-project-structure.md](./05-project-structure.md) ·
[06-testing-observability.md](./06-testing-observability.md) · [07-checklists-templates.md](./07-checklists-templates.md) ·
[../api-security.md](../api-security.md) · [../websocket.md](../websocket.md).
