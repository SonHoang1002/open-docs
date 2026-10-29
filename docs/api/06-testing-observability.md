# Testing & Observability cho API — từ chiến lược đến vận hành

> Thực hành cho `wedding-server` (Bun + Hono + Supabase): test theo rủi ro, unit/integration/
> contract/e2e, đo tải, kiểm thử bảo mật và observability đủ tốt để biết hệ thống hỏng ở đâu
> **trước khi** khách báo.
>
> **Liên quan:** [README](./README.md) · [01 — Fundamentals](./01-fundamentals.md) ·
> [02 — REST design](./02-rest-design.md) · [03 — OpenAPI](./03-openapi.md) ·
> [04 — Lifecycle](./04-lifecycle-process.md) · [05 — Project structure](./05-project-structure.md) ·
> [07 — Checklists & templates](./07-checklists-templates.md) ·
> [Bảo mật API](../api-security.md) · [WebSocket](../websocket.md) · [PostgreSQL](../postgresql-basics.md)

## Mục lục

1. [Vì sao phải test API](#1-vì-sao-phải-test-api)
2. [Test strategy theo rủi ro](#2-test-strategy-theo-rủi-ro)
3. [Unit test](#3-unit-test)
4. [Integration test](#4-integration-test)
5. [Contract testing](#5-contract-testing)
6. [E2E test](#6-e2e-test)
7. [Load & performance test](#7-load--performance-test)
8. [Security testing](#8-security-testing)
9. [Test data & môi trường](#9-test-data--môi-trường)
10. [CI/CD pipeline](#10-cicd-pipeline)
11. [Observability là gì?](#11-observability-là-gì)
12. [Structured logging](#12-structured-logging)
13. [Metrics](#13-metrics)
14. [Tracing](#14-tracing)
15. [Error tracking & alerting](#15-error-tracking--alerting)
16. [SLO/SLI/error budget](#16-sloslierror-budget)
17. [Debugging production](#17-debugging-production)
18. [Ví dụ đầy đủ: test `POST /api/messages`](#18-ví-dụ-đầy-đủ-test-post-apimessages)
19. [Anti-patterns](#19-anti-patterns)
20. [Bài tập](#20-bài-tập)
21. [Tài liệu tham khảo](#21-tài-liệu-tham-khảo)

## 1. Vì sao phải test API

| Nơi phát hiện | Chi phí | Ví dụ |
|---|---:|---|
| Lúc viết code | 1× | Tự thấy `sender_name` rỗng khi viết validation |
| Unit test | 2× | Bắt trim/sai kiểu trước khi chạy server |
| Integration test | 5× | Supabase trả `error` nhưng route vẫn trả `200` |
| Staging/E2E | 15× | WebSocket không broadcast khi tạo thiệp |
| Production | 100× | Mất lời chúc trong ngày cưới, không backup |

```text
                 ▲ ít, chậm, đắt
                ╱ ╲
               ╱E2E╲            HTTP + WebSocket + DB thật
              ╱─────╲
             ╱Contract╲         response khớp OpenAPI
            ╱──────────╲
           ╱ Integration ╲      Hono app + Supabase local
          ╱───────────────╲
         ╱    Unit test     ╲   domain/service thuần, không I/O
        ╱────────────────────╲
       ▼ nhiều, nhanh, rẻ
```

| Loại | Trả lời | Phạm vi | Công cụ |
|---|---|---|---|
| Unit | Hàm đúng với mọi input? | 1 hàm, không I/O | `bun:test` |
| Integration | Route + middleware + DB phối hợp đúng? | `app.request()` + DB | `bun:test`, Supabase local |
| Contract | Response đúng schema công bố? | HTTP ↔ OpenAPI | Ajv, Schemathesis, Pact |
| E2E | Người dùng hoàn thành được việc? | Client → API → DB → WS | Playwright, Bun |
| Load | Chịu được bao nhiêu? | Toàn hệ thống | k6, autocannon, wrk |
| Security | Có bị lạm dụng/vượt quyền? | Authz, input, rate limit | ZAP, Schemathesis |
| Chaos | Chịu được thành phần lỗi? | DB/network/WS | Toxiproxy, fault injection |

Test là **hợp đồng hành vi được thực thi tự động**, không phải cuộc thi coverage. Viết ở tầng thấp nhất vẫn bắt được lỗi; E2E chỉ để chứng minh **tích hợp thật**. Test hành vi (status, body, side effect qua boundary), không test private field hay số lần gọi nội bộ.

### Checklist tối thiểu trước khi merge

- [ ] `[blocker]` Có test cho happy path + validation + lỗi DB.
- [ ] `[blocker]` Không dùng production DB; test data ephemeral và dọn dẹp.
- [ ] `[blocker]` Contract test khớp OpenAPI cho response mới.
- [ ] `[should]` Có test authz cho endpoint ghi/xoá.
- [ ] `[should]` CI chạy unit + integration trong < 5 phút.
- [ ] `[should]` Log/metric/trace cho hành vi mới.
- [ ] `[nice]` Mutation test cho domain validation.

## 2. Test strategy theo rủi ro

Chấm `Impact` (1–5) × `Likelihood` (1–5), ưu tiên theo điểm.

| Rủi ro | I | L | Điểm | Test bắt buộc |
|---|---:|---:|---:|---|
| `DELETE /api/messages` public → xoá sạch guestbook | 5 | 4 | **20** | Authz matrix, integration, alert |
| Thiếu validation → dữ liệu rỗng/độc hại | 4 | 5 | **20** | Unit + integration + contract |
| Broadcast WS lỗi nhưng client tưởng đã gửi | 3 | 4 | **12** | Integration WS, metric |
| Supabase timeout/outage | 4 | 3 | **12** | Timeout test, chaos, SLO alert |
| Spam tin nhắn / pagination trùng-thiếu | 3 | 4 | **12** | Rate limit, cursor test |
| PII (tên khách) lọt vào log | 5 | 2 | **10** | Unit redaction + log review |
| Schema drift docs ↔ response | 3 | 3 | **9** | Contract test CI |

> ⚠️ Hiện `DELETE /api/messages` **không có auth** và xoá toàn bộ bảng — rủi ro số 1.
> Test phải khẳng định anonymous nhận `401/403` sau khi bật auth; production cần rate
> limit, audit log và xác nhận hai bước.

| Endpoint | Happy | Validation | 401 | 403 | 404 | DB error | Rate limit | Realtime |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /api/messages` | ✅ | ✅ `before` sai | ✅ | — | — | ✅ | ✅ | — |
| `POST /api/messages` | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| `PUT /api/messages/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/messages/:id` | ✅ | ✅ id sai | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/messages` | ✅ | — | ✅ | ✅ admin | — | ✅ | ✅ | — |
| `GET /ws` | ✅ handshake | ✅ origin | ✅ token | — | — | — | ✅ | ✅ |

Given-When-Then: `Given` 25 lời chúc sort giảm dần; `When` gọi `GET /api/messages?before=<created_at thứ 20>`; `Then` 200, ≤ 20 bản ghi, tất cả `created_at < before`, không trùng id.

```ts
it("trả trang cũ hơn khi before hợp lệ", async () => {
  await seedMessages(25);                                                            // Given
  const before = await getNthCreatedAt(20);
  const res = await app.request(`/api/messages?before=${encodeURIComponent(before)}`); // When
  expect(res.status).toBe(200);                                                      // Then
  const body = await res.json();
  expect(body.data.every((m: Message) => m.created_at < before)).toBe(true);
});
```

Tên test theo hành vi + điều kiện: `trả 400 khi content chỉ có khoảng trắng` ✅; `test validate 2` ❌.

## 3. Unit test

Tách domain khỏi HTTP để test không cần server.

```ts
// src/domain/message.ts
import { z } from "zod";
export const CreateMessageSchema = z.object({
  sender_name: z.string().trim().min(2).max(80), content: z.string().trim().min(1).max(500),
  will_attend: z.boolean(), guest_of: z.string().trim().min(1).max(50),
  number_attend: z.number().int().min(0).max(10),
});
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export function parseBefore(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
```

```ts
const valid = { sender_name: "Nguyễn An", content: "Chúc mừng!", will_attend: true, guest_of: "Bạn", number_attend: 2 };
it("trim input hợp lệ", () => expect(CreateMessageSchema.parse({ ...valid, sender_name: "  An  " }).sender_name).toBe("An"));
it("từ chối content toàn khoảng trắng", () => expect(CreateMessageSchema.safeParse({ ...valid, content: "   " }).success).toBe(false));
it("không coerce number_attend dạng chuỗi", () => expect(CreateMessageSchema.safeParse({ ...valid, number_attend: "2" }).success).toBe(false));
it("chuẩn hoá before về UTC", () => expect(parseBefore("2026-10-25T10:00:00+07:00")).toBe("2026-10-25T03:00:00.000Z"));
```

**Ưu tiên fake hơn mock sâu** — fake cài cùng interface; mock chỉ trả lời "có gọi hay không" và làm test gãy mỗi lần refactor.

```ts
export interface MessageRepository { create(input: CreateMessageInput): Promise<{ id: string } & CreateMessageInput>; }
export class MessageService {
  constructor(private readonly repo: MessageRepository) {}
  async create(raw: unknown) {
    const parsed = CreateMessageSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, issues: parsed.error.issues };
    return { ok: true as const, data: await this.repo.create(parsed.data) };
  }
}
const repo: MessageRepository = { create: mock(async (input) => ({ id: "m_1", ...input })) };
it("không gọi repository khi validation lỗi", async () => {
  expect((await new MessageService(repo).create({})).ok).toBe(false);
  expect(repo.create).not.toHaveBeenCalled();
});
```

| Chỉ số | Dùng để | Ngưỡng gợi ý |
|---|---|---|
| Line coverage | Code chưa từng chạy | 70–85% |
| Branch coverage | Nhánh `if`/`catch` chưa test | ≥ 80% domain |
| Critical-path | Validation, authz, xoá dữ liệu | **100%** |
| Mutation score | Test có bắt lỗi thật? | ≥ 60% |

```bash
bun test --coverage   # cấu hình coverageThreshold trong bunfig.toml
```

> ⚠️ Coverage chỉ nói "dòng đã chạy", không nói "assert đúng". Test **quyết định** và
> **ranh giới**: empty, max, null, sai kiểu, lỗi dependency.

## 4. Integration test

`app.request()` gọi thẳng Hono, chạy đủ middleware/routing/serialization, không cần TCP.

```ts
const app = createApp({ db: fakeDb, table: "messages", broadcast: () => {} });
it("GET /api/messages trả envelope", async () => {
  const res = await app.request("/api/messages");
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ success: true, data: expect.any(Array) });
});
```

Cần network thật (proxy, body limit, WebSocket) thì dùng ephemeral port `port: 0`:

```ts
let server: ReturnType<typeof Bun.serve>;
beforeAll(() => {
  server = Bun.serve({
    port: 0, fetch: (req, s) => new URL(req.url).pathname === "/ws" ? (s.upgrade(req), undefined) : app.fetch(req),
    websocket: { open() {}, message() {}, close() {} },
  });
});
afterAll(() => server.stop(true));
```

Supabase local: `supabase start` (API `:54321`, DB `:54322`), `supabase db reset` (migrations + seed), `supabase status` (lấy key). Dùng `.env.test` với `TEST_SUPABASE_URL`, `TEST_SUPABASE_KEY`, `TEST_DATABASE_URL`; guard cứng để không chạy nhầm production.

| Cô lập dữ liệu | Ưu | Nhược |
|---|---|---|
| Cleanup theo id (`afterEach`) | Đơn giản, song song được | Sót nếu test crash |
| Transaction rollback (`BEGIN`/`ROLLBACK` cùng connection) | Sạch tuyệt đối | Không dùng với Supabase REST (mỗi request 1 transaction) |
| Schema riêng (`db: { schema }`) / database riêng | Cô lập worker | Phải expose schema, tốn tài nguyên |

Factory mặc định hợp lệ, override đúng field cần test, không gọi DB:

```ts
let seq = 0;
export const messageFactory = (o: Partial<CreateMessageInput> = {}): CreateMessageInput => ({
  sender_name: `Khách ${++seq}`, content: `Lời chúc ${seq} — ${crypto.randomUUID()}`,
  will_attend: true, guest_of: "Bạn thân", number_attend: 1, ...o,
});
```

```ts
const url = process.env.TEST_SUPABASE_URL, key = process.env.TEST_SUPABASE_KEY;
const describeDb = url && key ? describe : describe.skip;
describeDb("POST + Supabase local", () => {
  const db = createClient(url!, key!);
  const app = createApp({ db, table: "messages", broadcast: () => {} });
  const ids: string[] = [];
  afterEach(async () => { if (ids.length) await db.from("messages").delete().in("id", ids); ids.length = 0; });
  it("lưu và đọc lại", async () => {
    const res = await app.request("/api/messages", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(messageFactory()),
    });
    expect(res.status).toBe(201);
    const body = await res.json(); ids.push(body.data.id);
    const { data, error } = await db.from("messages").select("*").eq("id", body.data.id).single();
    expect(error).toBeNull(); expect(data.content).toBe(body.data.content);
  });
});
```

Transaction rollback chỉ hiệu quả với repository dùng `pg` trực tiếp: `beforeEach(BEGIN)` + `afterEach(ROLLBACK)` trên cùng connection. WebSocket integration dùng server ephemeral + `new WebSocket(...)`, chờ `new_message`, rồi `ws.close()` và `server.stop(true)` trong `finally` để Bun test không treo.

## 5. Contract testing

[OpenAPI](./03-openapi.md) là **nguồn sự thật** cho client, gateway, test và diff breaking change. Code lệch spec thì client sẽ là người phát hiện.

```ts
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
const spec = JSON.parse(readFileSync(new URL("../../openapi.json", import.meta.url), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv); ajv.addSchema(spec, "openapi");
// JSON Pointer: "/" → "~1"
const validate201 = ajv.compile({ $ref: "openapi#/paths/~1api~1messages/post/responses/201/content/application~1json/schema" });
const body = await res.json();
if (!validate201(body)) throw new Error(JSON.stringify(validate201.errors, null, 2));
```

OpenAPI 3.1 dùng JSON Schema 2020-12 → `Ajv2020`; 3.0 dùng draft-07 → `Ajv`. Không trộn draft.

| Công cụ | Cách chạy | Phù hợp |
|---|---|---|
| **Schemathesis** | Sinh request + property-based từ OpenAPI | Fuzz mạnh, tìm 500 |
| **Dredd** | Chạy example trong spec, so response thật | Spec có example đầy đủ |
| **Pact** | Consumer ghi kỳ vọng, provider verify | Nhiều client độc lập |

```bash
schemathesis run ./openapi.yaml --url http://localhost:3000 --checks all \
  --hypothesis-max-examples=200 --header "Authorization: Bearer $TOKEN"
```

> ⚠️ Schemathesis tạo `DELETE`/`PUT` thật. Chỉ chạy trên DB test đã seed; bật rate limit
> hợp lý để nó không tự bắn 429 hoặc xoá dữ liệu test.

Pact chỉ đáng dùng khi có ≥ 2 consumer deploy độc lập; provider verify bằng `new Verifier({ providerBaseUrl, pactBrokerUrl, provider, providerVersion }).verifyProvider()`.

| Thay đổi | Phân loại |
|---|---|
| Thêm field optional vào response | Non-breaking |
| Thêm enum value | **Breaking** với client switch-case |
| Đổi tên/kiểu field, thêm field bắt buộc vào request | Breaking |
| Nới validation, đổi 200 → 201 | Non-breaking / breaking với client hard-code |
| Xoá endpoint | Breaking — sunset theo [04](./04-lifecycle-process.md) |

## 6. E2E test

Chỉ giữ hành trình quan trọng: gửi → đọc → nhận realtime; pagination; admin xoá; auth; happy path mobile. Chạy trên staging giống production.

```ts
it("gửi → đọc → nhận realtime", async () => {
  const base = process.env.E2E_BASE_URL!;
  const ws = new WebSocket(base.replace("http", "ws") + "/ws");
  await new Promise<void>((r) => ws.addEventListener("open", () => r(), { once: true }));
  const eventPromise = new Promise<any>((r) => ws.addEventListener("message", (e) => r(JSON.parse(String(e.data))), { once: true }));
  const content = `E2E ${crypto.randomUUID()}`;
  const res = await fetch(`${base}/api/messages`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...messageFactory(), content }),
  });
  expect(res.status).toBe(201);
  expect(await eventPromise).toMatchObject({ type: "new_message", data: { content } });
  const list = await (await fetch(`${base}/api/messages`)).json();
  expect(list.data.some((m: any) => m.content === content)).toBe(true);
  ws.close();
});
it("anonymous không xoá được toàn bộ", async () => {
  expect((await fetch(`${E2E_BASE_URL}/api/messages`, { method: "DELETE" })).status).toBe(401);
});
```

```ts
// Playwright — e2e/guestbook.spec.ts
test("khách gửi lời chúc và thấy ngay", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Tên của bạn").fill("Nguyễn An");
  await page.getByLabel("Lời chúc").fill("Chúc mừng hạnh phúc!");
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByText("Chúc mừng hạnh phúc!")).toBeVisible();
});
```

Chống flaky: `expect.poll`/`toPass` thay `sleep`; dữ liệu unique; không assert timestamp/số lượng toàn cục; đóng WS/server; retry chỉ che lỗi hạ tầng, fail 2 lần liên tiếp phải điều tra.

## 7. Load & performance test

| Chỉ số | Ý nghĩa | Lưu ý |
|---|---|---|
| Throughput (RPS) | Request/giây xử lý được | Đo ở mức chấp nhận, không phải max |
| p50/p95/p99 | Phân vị latency | **Không dùng average** |
| Error rate | % 4xx/5xx | 4xx do test sai ≠ lỗi hệ thống |
| Saturation | CPU, RAM, connection pool | Dấu hiệu gần giới hạn |
| Queue depth | Request đang chờ | Tăng dần = quá tải |

Little's law `L = λ × W`: 100 RPS × 0.2s = 20 request đồng thời; p99 = 2s thì cần chuẩn bị 200 kết nối ở đuôi. **Load** = xác nhận capacity; **stress** = tìm điểm gãy; **soak** = rò rỉ memory/connection 2–8h; **spike** = burst vài giây (wedding day).

```js
// load/messages.js
import http from "k6/http";
import { check, sleep } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
export const options = {
  scenarios: {
    doc: { executor: "ramping-vus", startVUs: 0, gracefulRampDown: "30s",
      stages: [{ duration: "1m", target: 20 }, { duration: "3m", target: 50 }, { duration: "2m", target: 50 }, { duration: "1m", target: 0 }] },
    ghi: { executor: "constant-arrival-rate", rate: 5, timeUnit: "1s", duration: "5m", preAllocatedVUs: 10, maxVUs: 50, exec: "postMessage" },
  },
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<300", "p(99)<800"], checks: ["rate>0.99"] },
};
export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/messages`);
  check(res, { "200": (r) => r.status === 200, "data array": (r) => Array.isArray(r.json("data")) });
  sleep(1);
}
export function postMessage() {
  const body = JSON.stringify({ ...messageFactory(), content: `Load ${randomString(12)}` });
  check(http.post(`${__ENV.BASE_URL}/api/messages`, body, { headers: { "Content-Type": "application/json" } }), { "201": (r) => r.status === 201 });
}
```

```bash
k6 run -e BASE_URL=http://localhost:3000 load/messages.js
autocannon -c 50 -d 30 http://localhost:3000/api/messages
autocannon -c 30 -d 30 -m POST -H "content-type=application/json" -b '{"sender_name":"Load","content":"hello","will_attend":true,"guest_of":"Bạn","number_attend":1}' http://localhost:3000/api/messages
wrk -t4 -c100 -d30s -s wrk/post.lua http://localhost:3000/api/messages
```

**Không load test production** khi chưa phê duyệt + cửa sổ + kill switch; seed dữ liệu giống thật (5.000 row như `seed.ts`); warm-up 30–60s; ghi commit SHA/cấu hình; abort nếu error > 5% hoặc DB CPU > 90% trong 1 phút; đo cả WebSocket fan-out.

Bottleneck đặc thù: Supabase connection pool, broadcast O(n), query `ORDER BY created_at` thiếu index, JSON body lớn, cold start, rate-limit store fail.

### Chaos testing

Chaos = chủ động làm hỏng dependency để chứng minh hệ thống chịu được. Thử tối thiểu: DB latency 2s, 20% packet loss, WebSocket đóng đột ngột, rate-limit store restart.

```bash
toxiproxy-cli create supabase -l 127.0.0.1:54323 -u 127.0.0.1:54321
toxiproxy-cli toxic add supabase -t latency -a latency=2000
toxiproxy-cli toxic add supabase -t loss -a loss=20
```

Kỳ vọng: request trả lỗi có kiểm soát (`503`/`504`) trong timeout, không treo; retry có backoff; circuit breaker mở; metric/log ghi đúng dependency; client không mất dữ liệu đã gửi. Chạy trên staging, có kill switch.

## 8. Security testing

Đọc [Bảo mật API](../api-security.md); đây là cách biến checklist thành test.

```ts
const ACTORS = { anonymous: null, guest: process.env.TOKEN_GUEST, admin: process.env.TOKEN_ADMIN };
for (const [actor, token] of Object.entries(ACTORS)) {
  it(`${actor} DELETE /api/messages`, async () => {
    const res = await fetch(`${BASE}/api/messages`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
    expect(res.status).toBe(EXPECTED[actor]); // anonymous 401, guest 403, admin 204
  });
}
```

| Endpoint | anonymous | guest | admin |
|---|---|---|---|
| `GET /api/messages` | 200 | 200 | 200 |
| `POST /api/messages` | 201 (nếu public) | 201 | 201 |
| `PUT /api/messages/:id` | 401 | 403 (không phải chủ) | 200 |
| `DELETE /api/messages/:id` | 401 | 403 | 204 |
| `DELETE /api/messages` | 401 | 403 | 204 |

Payload fuzz tối thiểu — kỳ vọng **400/413**, không 500, không ghi DB:

```ts
const payloads = [
  { content: "<script>alert(1)</script>" }, { content: "'; DROP TABLE messages; --" },
  { content: "🙂".repeat(501) }, { sender_name: "A".repeat(10_000) }, { content: "   " },
  { number_attend: -1 }, { number_attend: 1.5 }, { content: { $ne: null } }, { sender_name: null },
];
```

Rate limit: gửi 12 request, request cuối `429` + `Retry-After`; inject store in-memory + clock giả để không flaky.

| OWASP API | Test tối thiểu |
|---|---|
| API1 BOLA | User A sửa/xoá id của B → 403/404 |
| API2 Broken Auth | Token hết hạn/sai chữ ký → 401, không lộ chi tiết |
| API3 Property-level | Body có `role`/`is_admin` → bị bỏ qua |
| API4 Resource consumption | Body 1MB → 413; `limit=10000` → kẹp 50 |
| API5 Function-level | Guest gọi endpoint admin → 403 |
| API6 Business flow | Spam 100 RSVP → 429/409 |
| API7 SSRF | Endpoint nhận URL → chặn IP private |
| API8 Misconfiguration | CORS không wildcard + credentials |
| API9 Inventory | Không còn route debug trên production |
| API10 Unsafe consumption | Validate response từ Supabase/partner |

CI: `bun audit`, `gitleaks detect`, `trivy fs --severity HIGH,CRITICAL --exit-code 1`, ZAP baseline trên staging.

## 9. Test data & môi trường

**Ephemeral** (tạo/xoá được), **deterministic** (cùng input → cùng output), **isolated** (song song không giẫm nhau), **reproducible** (một lệnh tái hiện).

```ts
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
let pg: StartedPostgreSqlContainer;
beforeAll(async () => {
  pg = await new PostgreSqlContainer("postgres:16-alpine").withDatabase("wedding_test").start();
  process.env.TEST_DATABASE_URL = pg.getConnectionUri();
}, 60_000);
afterAll(async () => { await pg.stop(); });
```

> ⚠️ Testcontainers cần Docker. CI không có Docker → service container hoặc Supabase CLI.
> Đừng để test skip im lặng: log rõ lý do.

Migration: `supabase db reset` (local), `supabase migration up` (CI); không sửa migration đã deploy; dùng expand/contract để code cũ vẫn chạy trong lúc deploy; test trên bản sao dữ liệu đã ẩn danh trước release.

Determinism: inject `clock` thay `new Date()`; seed random hoặc factory cố định; inject `idGenerator` nếu cần id cố định; luôn lưu UTC, test cả `TZ=Asia/Ho_Chi_Minh` và `TZ=UTC`.

```ts
export type Clock = { now(): Date };
export const makeClock = (iso: string): Clock => { let t = new Date(iso).getTime(); return { now: () => new Date((t += 1000)) }; };
```

| Biến | Mục đích |
|---|---|
| `TEST_SUPABASE_URL` / `TEST_SUPABASE_KEY` | Supabase local/CI |
| `TEST_DATABASE_URL` | Postgres trực tiếp (migration/transaction) |
| `LOG_LEVEL=silent`, `TZ=UTC` | Không spam log, loại bỏ khác biệt timezone |

```toml
[test]
preload = ["./test/setup.ts"]
```

## 10. CI/CD pipeline

```text
lint → typecheck → unit → integration → contract → build → e2e → security scan → deploy
        └─ nhanh, fail sớm ─┘        └─ cần DB/artifact ─┘
```

Mục tiêu: lint/typecheck < 90s, unit < 60s, integration < 5 phút, contract < 3 phút, build < 3 phút, E2E < 10 phút, security < 5 phút. Fail sớm ở stage rẻ.

```yaml
name: api-quality
on: [pull_request, push]
concurrency: { group: "api-${{ github.ref }}", cancel-in-progress: true }
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: "1.4.x" }
      - run: bun install --frozen-lockfile && bun run lint && bun run typecheck
      - uses: supabase/setup-cli@v1
        with: { version: latest }
      - run: supabase start && eval "$(supabase status -o env)" >> "$GITHUB_ENV"
      - run: bun test --coverage && bun test test/integration
        env: { TEST_SUPABASE_URL: "http://127.0.0.1:54321", TEST_SUPABASE_KEY: "${{ env.SUPABASE_SERVICE_ROLE_KEY }}" }
```

CI thật lấy key bằng `eval "$(supabase status -o env)"`, đừng hard-code. Cache `~/.bun/install/cache` theo `bun.lock`; không cache `node_modules` giữa runtime khác nhau; shard `bun test --shard=1/4` nếu > 5 phút.

Flaky: không tăng retry để "xanh"; gắn `@flaky` + owner + SLA 1 tuần; quarantine khỏi required check nhưng chạy nightly; xoá test đã skip vĩnh viễn.

Quality gate: coverage **diff** không giảm; OpenAPI breaking change cần label + approver; p95 không tăng > 20% so baseline; không CVE HIGH/CRITICAL, không secret trong diff.

## 11. Observability là gì?

| | Monitoring | Observability |
|---|---|---|
| Câu hỏi | "Hệ thống có chạy không?" | "Vì sao request này chậm/lỗi?" |
| Cách làm | Alert theo ngưỡng đã biết | Khám phá nguyên nhân chưa lường trước |
| Ví dụ | CPU > 90% | Trace `request_id=abc` chỉ ra 1.8s ở Supabase |

| Trụ cột | Trả lời | Chi phí | Retention |
|---|---|---|---|
| Logs | Chuyện gì xảy ra với request này? | Cao | 7–30 ngày, lỗi 90 ngày |
| Metrics | Xu hướng/tốc độ tổng hợp | Thấp | 13 tháng |
| Traces | Thời gian đi đâu? | Trung bình | 7–14 ngày, sample |

Không đưa `user_id`, `request_id`, `message_id`, raw path vào **label metric** — mỗi giá trị là một time series. Chi tiết để log/trace; metric chỉ dùng chiều hữu hạn (`method`, `route`, `status`).

## 12. Structured logging

```json
{"ts":"2026-10-25T03:00:00.123Z","level":"error","service":"wedding-api","env":"production","version":"a1b2c3d","event":"http.request","request_id":"7f9c","trace_id":"4bf9","method":"POST","route":"/api/messages","status":500,"duration_ms":1840}
```

Schema: `ts` (ISO UTC), `level`, `service`, `env`, `version`, `event`, `request_id`, `trace_id`, `route` (template, không raw path), `status`, `duration_ms`, `error.code/message`. Không log `Authorization`, cookie, token, mật khẩu, email, số điện thoại, toàn bộ body.

```ts
// src/observability/logger.ts
type Level = "debug" | "info" | "warn" | "error";
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[(process.env.LOG_LEVEL as Level) ?? "info"] ?? 20; // LOG_LEVEL sai → info
export function log(level: Level, event: string, fields: Record<string, unknown> = {}) {
  if (LEVELS[level] < threshold) return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, service: "wedding-api", event,
    env: process.env.NODE_ENV ?? "development", version: process.env.RELEASE ?? "dev", ...fields });
  (level === "error" ? console.error : console.log)(line); // stdout JSON, không pretty-print ở production
}
```

```ts
// src/observability/request-context.ts
import { randomUUID } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { log } from "./logger";
const SAFE_ID = /^[A-Za-z0-9._-]{8,128}$/;
export const requestContext: MiddlewareHandler = async (c, next) => {
  const incoming = c.req.header("x-request-id");
  const requestId = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
  c.set("requestId", requestId); c.header("x-request-id", requestId);
  const start = performance.now();
  try { await next(); } finally {
    const status = c.res?.status ?? 500;
    log(status >= 500 ? "error" : status >= 400 ? "warn" : "info", "http.request", {
      request_id: requestId, trace_id: c.req.header("traceparent")?.split("-")[1] ?? null,
      method: c.req.method, route: c.req.routePath || "unmatched", status,
      duration_ms: Math.round((performance.now() - start) * 10) / 10 }); // một dòng JSON / request
  }
};
app.use("*", requestContext);
```

`request_id` định danh request; `correlation_id` định danh cả luồng (gửi → broadcast → nhận); `trace_id` nối span. Chỉ nhận `x-request-id` từ client khi khớp regex (chống log injection), trả lại trong response và body lỗi, gắn vào Sentry tag.

```ts
const SENSITIVE = /^(authorization|cookie|password|token|api_key|secret|email|sender_phone)$/i;
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 5 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) =>
    [k, SENSITIVE.test(k) ? "[REDACTED]" : k === "sender_name" && typeof v === "string"
      ? `${v[0]}***${v.at(-1)}` : redact(v, depth + 1)]));
}
```

Sampling: 100% error/warn, 1–10% info thành công nếu volume cao; luôn giữ request `status >= 400` hoặc `duration > p99`. Retention hot 7–14 ngày, cold 90 ngày. Query Loki: `{service="wedding-api"} | json | request_id="7f9c..."`.

## 13. Metrics

**RED** (service): Rate (RPS), Errors (5xx/total, 4xx riêng), Duration (p50/p95/p99). **USE** (tài nguyên): Utilization, Saturation (queue, DB lock), Errors (OOM, refused).

Business metrics: `wedding_messages_created_total{will_attend}`, `wedding_messages_deleted_total{scope}`, `wedding_ws_clients_connected`, `wedding_ws_broadcast_duration_seconds`, `wedding_messages_stored`. Cảnh báo: message tạo giảm đột ngột trong ngày cưới, WS client về 0, `will_attend=false` tăng bất thường. Naming `<namespace>_<subsystem>_<name>_<unit>`; counter `_total`; histogram `_seconds`/`_bytes`; label hữu hạn, không label `user_id`, `message_id`, `ip`, `request_id`.

```ts
import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";
const registry = new Registry(); collectDefaultMetrics({ register: registry });
const httpRequests = new Counter({ name: "wedding_http_requests_total", help: "HTTP requests", labelNames: ["method", "route", "status"] as const, registers: [registry] });
const httpDuration = new Histogram({ name: "wedding_http_request_duration_seconds", help: "HTTP duration",
  labelNames: ["method", "route", "status"] as const, registers: [registry],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] });
app.use("*", async (c, next) => {
  const start = performance.now();
  try { await next(); } finally {
    const labels = { method: c.req.method, route: c.req.routePath || "unmatched", status: String(c.res?.status ?? 500) };
    httpRequests.inc(labels); httpDuration.observe(labels, (performance.now() - start) / 1000);
  }
});
app.get("/metrics", async (c) => {
  if (c.req.header("authorization") !== `Bearer ${process.env.METRICS_TOKEN}`) return c.text("Forbidden", 403);
  c.header("Content-Type", registry.contentType); return c.body(await registry.metrics());
});
```

Bucket phải bao quanh SLO (300ms → có 0.25 và 0.5); mỗi bucket là một time series. Không dùng average để báo cáo latency.

```promql
sum by (route) (rate(wedding_http_requests_total[5m]))
sum(rate(wedding_http_requests_total{status=~"5.."}[5m])) / sum(rate(wedding_http_requests_total[5m]))
histogram_quantile(0.95, sum by (le, route) (rate(wedding_http_request_duration_seconds_bucket[5m])))
```

Dashboard: golden signals; top route chậm/lỗi; DB duration/pool/slow query; WS client/broadcast/disconnect; business message/RSVP theo giờ; deploy marker.

## 14. Tracing

Trace = toàn bộ hành trình request; span = một đơn vị công việc (HTTP, DB query, broadcast); context = `trace_id` + `span_id` truyền qua header/service; sampling = chỉ lưu một phần.

```ts
// instrumentation.ts — preload TRƯỚC app
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
const sdk = new NodeSDK({
  resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: "wedding-api" }),
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations({ "@opentelemetry/instrumentation-fs": { enabled: false } })],
});
sdk.start();
process.on("SIGTERM", async () => { await sdk.shutdown(); process.exit(0); });
```

```bash
bun --preload ./instrumentation.ts run index.ts
```

Span thủ công cho Hono khi auto-instrumentation không phủ:

```ts
const tracer = trace.getTracer("wedding-api");
app.use("*", async (c, next) => {
  await tracer.startActiveSpan(`${c.req.method} ${c.req.path}`, async (span) => {
    try { await next(); span.setAttribute("http.response.status_code", c.res.status); }
    catch (err) { span.recordException(err as Error); throw err; }
    finally { span.end(); }
  });
});
```

Propagation: nhận `traceparent` từ gateway; inject khi gọi service khác; bọc `fetch` nếu Supabase JS không tự instrument; WS truyền `traceparent` lúc handshake, mỗi message tạo span con. Log `trace_id` trong mọi dòng log. Sampling: head 10% + tail giữ 100% trace lỗi/chậm (`duration > 1s`); staging 100%. Bun tương thích phần lớn OTel Node SDK nhưng không 100% — nếu lỗi, dùng `@hono/otel` hoặc span thủ công, đừng để tracing làm hỏng app.

## 15. Error tracking & alerting

```ts
import * as Sentry from "@sentry/bun";
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV, release: process.env.RELEASE,
  tracesSampleRate: 0.1, sendDefaultPii: false,
  beforeSend(event) {
    if (event.request?.headers) { delete event.request.headers.authorization; delete event.request.headers.cookie; }
    return event;
  } });
app.onError((err, c) => {
  Sentry.captureException(err, { tags: { request_id: c.get("requestId") ?? "unknown", route: c.req.routePath } });
  return c.json({ success: false, error: "Lỗi máy chủ", request_id: c.get("requestId") }, 500);
});
```

Gắn `release`/`environment`; fingerprint theo `error.code` + route; breadcrumb chỉ request id/route/status; alert khi lỗi mới hoặc tăng đột biến, không alert từng occurrence; có owner và review hàng tuần.

| Alert (symptom) | Điều kiện | Severity |
|---|---|---|
| Availability | 5xx > 1% trong 5 phút | P1 |
| Latency | p95 > 1s trong 10 phút | P2 |
| Burn rate | > 14.4 (1h) | P1 |
| WS clients drop / broadcast failures | giảm > 50% / lỗi > 1% trong 5 phút | P1/P2 |
| DB connections | > 80% pool trong 10 phút | P2 |
| Backup fail / certificate | bất kỳ / hết hạn < 14 ngày | P2/P3 |

Alert phải **actionable**, có runbook + owner; gộp theo service; dùng inhibition; page chỉ khi ảnh hưởng người dùng, còn lại ticket. Review hàng tháng: alert không dẫn tới hành động → xoá/sửa. Runbook theo [07](./07-checklists-templates.md#17-runbook-template).

## 16. SLO/SLI/error budget

| Thuật ngữ | Định nghĩa | Ví dụ |
|---|---|---|
| SLI | Chỉ số đo chất lượng | % request không 5xx |
| SLO | Mục tiêu cho SLI theo thời gian | 99.9% / 30 ngày |
| SLA | Cam kết với khách (có bồi thường) | 99.5% |
| Error budget | 100% − SLO | 0.1% request được lỗi |

```text
Availability : 99.9% / 30 ngày  (budget ~43 phút 12 giây)
Latency      : 95% < 300ms, 99% < 1s
Realtime     : 99% broadcast < 2s
Freshness    : 99% message hiển thị trong 5s
Budget request = 1.000.000 × 0.1% = 1.000 request lỗi / 30 ngày
Budget thời gian = 30 × 24 × 60 × 0.1% = 43,2 phút
burn_rate = error_rate_thực_tế / 0.001
```

Ngày cưới có thể nâng 99.95% (budget ~21 phút 36 giây) và freeze deploy 48h trước/sau.

| Burn rate | Cửa sổ | % budget | Hành động |
|---:|---|---:|---|
| 14.4 | 1 giờ | 2% | Page ngay |
| 6 | 6 giờ | 5% | Page/ticket khẩn |
| 1 | 3 ngày | 10% | Ticket |
| 0.5 | 6 ngày | 10% | Theo dõi |

Alert multi-window: `burn_rate_1h > 14.4 AND burn_rate_5m > 14.4`. Chính sách: budget > 50% deploy bình thường; 20–50% hạn chế thay đổi rủi ro; < 20% chỉ fix bug; cạn budget → freeze + postmortem.

## 17. Debugging production

```text
1. Phạm vi: tất cả user hay một số? một route hay toàn bộ?
2. Deploy gần nhất trong 30 phút? Có release mới?
3. Dashboard: RPS, error rate, p95, saturation, WS clients.
4. Lấy request_id → query log → mở trace.
5. Dependency: Supabase status, DB connections, rate limit.
6. Mitigation: rollback > feature flag off > tăng timeout > chặn endpoint.
7. Thông báo stakeholder nếu ảnh hưởng > 5 phút. 8. Ghi timeline trong lúc xử lý.
```

```text
{service="wedding-api"} | json | request_id="7f9c..."
{service="wedding-api"} | json | status >= 500 | line_format "{{.route}} {{.error.code}}"
{service="wedding-api"} | json | event="ws.broadcast_failed"
```

Trace: waterfall Hono → Supabase → broadcast. DB chiếm 90% → tối ưu query/index/pool; thời gian giữa span → network/DNS/TLS; không có trace → kiểm tra sampling/propagation.

```sql
SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM messages WHERE created_at < '2026-10-25T03:00:00Z' ORDER BY created_at DESC LIMIT 20;
```

Reproduce trên staging với cùng payload/header; nếu không, dùng trace/log tái tạo điều kiện (data size, concurrency, timezone). Không thêm log chứa PII để debug. Sau khi ổn định: viết test tái hiện + postmortem. Feature flag/kill switch: bọc tính năng mới, kill switch trả 503 có kiểm soát cho endpoint tốn kém; flag có owner + ngày hết hạn; test cả on/off nếu ảnh hưởng contract.

## 18. Ví dụ đầy đủ: test `POST /api/messages`

```ts
// src/domain/message.ts
import { z } from "zod";
export const CreateMessageSchema = z.object({
  sender_name: z.string().trim().min(2).max(80), content: z.string().trim().min(1).max(500),
  will_attend: z.boolean(), guest_of: z.string().trim().min(1).max(50), number_attend: z.number().int().min(0).max(10),
});
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export const validationError = (issues: z.ZodIssue[]) => ({ success: false as const, error: "Dữ liệu không hợp lệ",
  issues: issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
```

```ts
// src/app.ts — app factory + dependency injection
import type { SupabaseClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { CreateMessageSchema, validationError } from "./domain/message";
export type AppDeps = { db: SupabaseClient; table: string; broadcast: (event: unknown) => void };
export function createApp({ db, table, broadcast }: AppDeps) {
  const app = new Hono(); app.use("/*", cors());
  app.post("/api/messages", async (c) => {
    let raw: unknown;
    try { raw = await c.req.json(); } catch { return c.json({ success: false, error: "JSON không hợp lệ" }, 400); }
    const parsed = CreateMessageSchema.safeParse(raw);
    if (!parsed.success) return c.json(validationError(parsed.error.issues), 400);
    const { data, error } = await db.from(table).insert([parsed.data]).select().single();
    if (error) return c.json({ success: false, error: "Không thể lưu tin nhắn" }, 500); // không lộ error.message
    try { broadcast({ type: "new_message", data }); } catch (err) {
      // Đã lưu; broadcast lỗi không được biến thành 500 cho client
      console.error(JSON.stringify({ event: "ws.broadcast_failed", error: String(err) }));
    }
    return c.json({ success: true, data }, 201);
  });
  return app;
}
```

```ts
// test/messages.post.test.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, mock, spyOn } from "bun:test";
import { createApp } from "../src/app";
type DbResult = { data: unknown; error: { message: string } | null };
function createSupabaseStub(result: DbResult) {
  const insert = mock((_rows: unknown[]) => ({ select: () => ({ single: async () => result }) }));
  const from = mock((_table: string) => ({ insert }));
  return { client: { from } as unknown as SupabaseClient, from, insert };
}
const validBody = { sender_name: "  Nguyễn An  ", content: "  Chúc mừng hạnh phúc!  ", will_attend: true, guest_of: "Bạn thân", number_attend: 2 };
const savedRow = { id: "00000000-0000-4000-8000-000000000001", sender_name: "Nguyễn An", content: "Chúc mừng hạnh phúc!", will_attend: true, guest_of: "Bạn thân", number_attend: 2, created_at: "2026-10-25T03:00:00.000Z" };
function setup(result: DbResult = { data: savedRow, error: null }) {
  const db = createSupabaseStub(result), events: unknown[] = [];
  return { app: createApp({ db: db.client, table: "messages", broadcast: (e) => events.push(e) }), db, events };
}
const post = (app: ReturnType<typeof createApp>, body: unknown) => app.request("/api/messages", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
describe("POST /api/messages", () => {
  it("trả 201, trim dữ liệu và broadcast", async () => {
    const { app, db, events } = setup();
    const res = await post(app, validBody);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, data: savedRow });
    expect(db.from).toHaveBeenCalledWith("messages");
    expect(db.insert).toHaveBeenCalledWith([{ sender_name: "Nguyễn An", content: "Chúc mừng hạnh phúc!", will_attend: true, guest_of: "Bạn thân", number_attend: 2 }]);
    expect(events).toEqual([{ type: "new_message", data: savedRow }]);
  });
  it("trả 400 khi thiếu content, không gọi DB/broadcast", async () => {
    const { app, db, events } = setup();
    const { content: _content, ...withoutContent } = validBody;
    const res = await post(app, withoutContent);
    expect(res.status).toBe(400);
    expect((await res.json()).issues).toContainEqual(expect.objectContaining({ path: "content" }));
    expect(db.insert).not.toHaveBeenCalled(); expect(events).toEqual([]);
  });
  it("trả 400 với content toàn khoảng trắng, number_attend chuỗi, JSON hỏng", async () => {
    const { app } = setup();
    expect((await post(app, { ...validBody, content: "   " })).status).toBe(400);
    expect((await post(app, { ...validBody, number_attend: "2" })).status).toBe(400);
    expect((await post(app, "{")).status).toBe(400);
  });
  it("trả 500 chung chung khi DB lỗi, không broadcast", async () => {
    const { app, events } = setup({ data: null, error: { message: 'duplicate key value violates "messages_pkey"' } });
    const res = await post(app, validBody);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: "Không thể lưu tin nhắn" });
    expect(JSON.stringify(body)).not.toContain("duplicate key"); expect(events).toEqual([]);
  });
  it("vẫn 201 khi broadcast lỗi (dữ liệu đã lưu)", async () => {
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});
    const app = createApp({ db: createSupabaseStub({ data: savedRow, error: null }).client, table: "messages", broadcast: () => { throw new Error("socket closed"); } });
    expect((await post(app, validBody)).status).toBe(201);
    expect(errorSpy).toHaveBeenCalled(); errorSpy.mockRestore();
  });
});
```

```bash
bun test test/messages.post.test.ts   # 5 pass
bun test --watch && bun test --coverage
```

Mở rộng: `PUT` id không tồn tại → 404; `GET` `before` sai → 400; rate limit với store in-memory + clock giả; contract test `savedRow`; integration test cùng bộ case.

## 19. Anti-patterns

| Anti-pattern | Vì sao xấu | Thay bằng |
|---|---|---|
| Chỉ test happy path | Bỏ sót phần lớn bug | Bảng empty/max/sai kiểu/DB lỗi |
| Mock mọi thứ | Test xanh nhưng tích hợp hỏng | Fake + integration |
| Snapshot toàn response | Đổi field vô hại cũng đỏ | Assert field + schema |
| `sleep` chờ WS/DB | Flaky, chậm | Poll/await event với timeout |
| Dùng chung DB/production | Mất dữ liệu, không deterministic | Ephemeral DB, cleanup theo id |
| Phụ thuộc thứ tự test | Chạy shard là đỏ | Mỗi test tự setup/cleanup |
| Chase 100% coverage | Tốn thời gian, test vô nghĩa | Coverage theo rủi ro + mutation |
| Test private method | Gãy khi refactor | Test qua public API |
| Load test production | Ảnh hưởng khách thật | Staging cùng cấu hình |
| Log cả request body | Lộ PII/token | Redaction + allowlist |
| Label metric `user_id` | Cardinality nổ, tốn tiền | Log/trace cho chi tiết |
| Alert mọi 5xx | Fatigue, bỏ qua alert thật | SLO burn rate multi-window |
| Chỉ dashboard, không trace | Không biết chậm ở đâu | Trace + log correlation |
| Trace 100% production | Tốn chi phí | Head 10% + tail giữ lỗi |
| Không có runbook / retry vô hạn | On-call chậm / khuếch đại sự cố | Runbook + backoff, jitter, giới hạn |

## 20. Bài tập

1. **Validation matrix**: 12 case (rỗng, max, Unicode, emoji, sai kiểu, object injection, `NaN`, `Infinity`, `null`, mảng, số âm, toàn khoảng trắng). Không case nào trả 500.
2. **Pagination**: seed 45 message cách nhau 1 phút; test 3 trang `before`, không trùng/thiếu, `limit` kẹp 1..50.
3. **WebSocket**: 2 client; A gửi → cả A và B nhận `new_message`; đóng B, A vẫn nhận; broadcast lỗi không làm request fail.
4. **Contract**: viết OpenAPI cho `POST`, test Ajv cho 201/400; cố tình đổi `created_at` thành number để thấy test đỏ.
5. **Load**: k6 50 VU đọc + 5 RPS ghi trong 5 phút, p95 < 300ms, error < 1%; ghi lại bottleneck đầu tiên.
6. **Observability**: thêm `request_id`, log JSON, metric RED, span Supabase; tìm đúng request trong log và trace.
7. **SLO**: tính budget 99.9%/30 ngày; viết 2 alert burn-rate (1h/5m, 6h/30m) + hành động on-call.

## 21. Tài liệu tham khảo

- [Bun — Test runner](https://bun.sh/docs/cli/test) · [Mocks & coverage](https://bun.sh/docs/test/mocks)
- [Hono — Testing](https://hono.dev/docs/guides/testing)
- [Supabase — Local development](https://supabase.com/docs/guides/local-development) · [CLI](https://supabase.com/docs/reference/cli/introduction)
- [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) · [Schemathesis](https://schemathesis.readthedocs.io/) · [Dredd](https://dredd.org/) · [Pact](https://docs.pact.io/)
- [k6](https://k6.io/docs/) · [autocannon](https://github.com/mcollina/autocannon) · [Playwright API testing](https://playwright.dev/docs/api-testing)
- [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js/) · [Prometheus histograms](https://prometheus.io/docs/practices/histograms/)
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x00-header/)
- [Testcontainers Node.js](https://node.testcontainers.org/) · [Sentry Bun](https://docs.sentry.io/platforms/javascript/guides/bun/)
