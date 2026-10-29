# Python Interview — Senior

> ~70 câu cho ứng viên 5–8 năm: CPython internals, memory/GC, typing quy mô lớn, distributed
> system, consistency, scale, bảo mật kiến trúc, migration, observability, incident và chiến
> lược kỹ thuật. Kỳ vọng: ra quyết định dưới mơ hồ, có số liệu, có bài học vận hành thật.

---

## Mục lục

1. [Build, release và dependency ở quy mô lớn](#1-build-release-và-dependency-ở-quy-mô-lớn)
2. [Testing và debug cấp hệ thống](#2-testing-và-debug-cấp-hệ-thống)
3. [API platform và tích hợp](#3-api-platform-và-tích-hợp)
4. [Async, concurrency và runtime](#4-async-concurrency-và-runtime)
5. [CPython internals](#5-cpython-internals)
6. [Typing ở quy mô lớn](#6-typing-ở-quy-mô-lớn)
7. [Distributed system và dữ liệu](#7-distributed-system-và-dữ-liệu)
8. [Kiến trúc và khả năng phục hồi](#8-kiến-trúc-và-khả-năng-phục-hồi)
9. [Security và observability](#9-security-và-observability)
10. [System design](#10-system-design)
11. [Chiến lược kỹ thuật và ảnh hưởng](#11-chiến-lược-kỹ-thuật-và-ảnh-hưởng)
12. [Coding](#12-coding)
13. [Tình huống](#13-tình-huống)
14. [Tài liệu tham khảo](#14-tài-liệu-tham-khảo)

---

## 1. Build, release và dependency ở quy mô lớn

### Q01. Làm sao đảm bảo build Python reproducible? [S]

**Trả lời:** Cố định bốn thứ: **Python version**, **dependency graph + hash**, **build tool/
backend version**, và **môi trường hệ điều hành** (base image, compiler, native libs). Dùng
lockfile có hash, image digest thay vì tag `latest`, và cache key theo lockfile.

```dockerfile
FROM python:3.12.7-slim@sha256:...
COPY pyproject.toml uv.lock ./
RUN pip install uv==0.5.11 && uv sync --frozen --no-dev
COPY . .
```

Với wheel nội bộ, build trong CI từ commit đã biết, lưu artifact theo digest; không build lại
trên máy production. Kiểm tra bằng cách build hai lần và so sánh file hash; một số package chứa
timestamp nên cần chuẩn hóa (`SOURCE_DATE_EPOCH`) nếu yêu cầu nghiêm ngặt. Ghi lại SBOM để truy
vết.

**Điểm cộng:** phân biệt reproducible build với deterministic runtime; nêu chi phí và mức độ
cần thiết theo ngành (fintech/healthcare cao hơn).

---

### Q02. Chiến lược nâng Python version cho nhiều service? [S]

**Trả lời:** Coi đó là chương trình có owner, không phải việc tranh thủ. Bước: (1) inventory
service + dependency + C-extension; (2) chọn target (ví dụ 3.12 → 3.13/3.14) theo lịch hỗ trợ
bảo mật; (3) chạy CI ma trận đa version; (4) xử lý deprecation warning trước; (5) rollout theo
thứ tự service ít rủi ro; (6) có rollback image cũ.

```toml
[tool.pyright]
pythonVersion = "3.13"
```

Rủi ro chính: C-extension chưa có wheel, thay đổi hành vi (ví dụ `distutils` bị bỏ), performance
regression, typing/parser thay đổi. Pin version trong CI và production; không dùng `3.12` floating
tag. Đặt deadline trước khi version hết security support (PEP 693 cho 3.12: 2028-10).

---

### Q03. Build vs buy cho hạ tầng Python (queue, auth, search)? [S]

**Trả lời:** Build khi là **khác biệt cốt lõi** hoặc yêu cầu đặc thù; buy/dùng managed khi là
commodity. Đánh giá theo TCO: thời gian build + vận hành + on-call + nâng cấp + bảo mật, không
chỉ license.

| Yếu tố | Build | Managed |
|---|---|---|
| Kiểm soát | Cao | Giới hạn |
| Chi phí ban đầu | Thấp (trông vậy) | Cao hơn |
| Chi phí dài hạn | Người, on-call | Theo usage |
| Lock-in | Thấp | Cao |
| Time-to-market | Chậm | Nhanh |

Ví dụ: dùng managed Postgres/Redis/Kafka cho đến khi chi phí hoặc giới hạn thực sự đau; tự build
auth nếu là sản phẩm auth, nhưng thường dùng OIDC provider. Luôn có phương án thoát (dữ liệu
export được, interface trừu tượng) và ước lượng chi phí 3 năm.

---

## 2. Testing và debug cấp hệ thống

### Q04. Thiết kế chiến lược test cho hệ nhiều service? [S]

**Trả lời:** Kết hợp nhiều lớp, tối ưu theo **rủi ro** chứ không theo % coverage:

- Unit/domain: nhanh, chạy mọi PR.
- Integration: DB/broker thật qua container, chạy PR hoặc nightly tùy thời gian.
- Contract: OpenAPI/Pact giữa consumer–provider, chặn breaking change.
- E2E: chỉ luồng doanh thu/tiền, chạy trên staging.
- Non-functional: load test, chaos, security scan, migration rehearsal.

Định nghĩa **test ownership** theo service, **flaky budget**, thời gian phản hồi CI (mục tiêu
<10 phút cho PR). Test production bằng canary, synthetic monitoring, shadow traffic. Với dữ liệu,
test cả migration forward/backward và backfill idempotent.

---

### Q05. Debug một sự cố liên service có triệu chứng mơ hồ? [S]

**Trả lời:** Bắt đầu từ **triệu chứng người dùng** và SLO, không từ nghi phạm. Dùng trace để
tìm span bất thường, so sánh baseline, xác định thời điểm bắt đầu và thay đổi gần nhất (deploy,
config, data, traffic). Kiểm tra dependency theo thứ tự: DNS/TLS → gateway → service → DB/cache/
queue → external.

Kỹ thuật: cắt lát theo chiều (theo tenant, region, version, endpoint), tìm mẫu chung; dùng
`request_id` xuyên hệ thống; replay request; so sánh instance tốt/xấu. Ưu tiên mitigation trước
(rollback, tắt flag, tăng capacity, shed load), root cause sau. Ghi timeline và quyết định để
postmortem.

**Điểm cộng:** nêu giả thuyết và cách bác bỏ từng giả thuyết, tránh "sửa mò" và tránh thay đổi
nhiều thứ cùng lúc.

---

### Q06. Chaos engineering và game day dùng thế nào cho hợp lý? [S]

**Trả lời:** Bắt đầu nhỏ, có giả thuyết, blast radius giới hạn, có nút dừng. Ví dụ: kill một
instance, tăng latency Redis 100ms, chặn một AZ, làm DB failover trên staging. Đo hành vi
(timeout, retry, circuit breaker, alert) và cải thiện runbook.

```text
Giả thuyết: mất 1/3 Redis node không làm tăng error rate > 0.1%.
Thực nghiệm: tắt node trong 10 phút, theo dõi SLO, log, alert.
Kết luận: cache client chưa handle MOVED -> sửa, lặp lại.
```

Không chạy chaos production khi chưa có observability và rollback. Game day nên có người quan
sát, timeline, và action item có owner. Mục tiêu là học, không phải "chứng minh hệ thống khỏe".

---

## 3. API platform và tích hợp

### Q07. Thiết kế API platform cho nhiều team dùng chung? [S]

**Trả lời:** Cung cấp **hợp đồng và công cụ**, không chỉ endpoint:

- Chuẩn API (REST/gRPC), naming, error format, pagination, idempotency.
- API gateway: auth, rate limit, routing, observability, versioning.
- Developer portal + OpenAPI + SDK generated.
- Lifecycle: deprecation policy, changelog, sandbox, quota.
- Governance nhẹ: review breaking change, lint API spec, không làm chậm team.

Đo adoption, thời gian tích hợp, số ticket hỗ trợ, error rate theo consumer. API là sản phẩm:
cần owner, SLA, feedback loop. Tránh "platform" biến thành gatekeeper cứng nhắc.

---

### Q08. Gateway nên xử lý gì, không nên xử lý gì? [S]

**Trả lời:** Nên: TLS termination, authN cơ bản (token validation), rate limit, routing,
request size limit, WAF, access log, trace propagation, retries an toàn (hạn chế), response
compression.

Không nên: business authorization phức tạp, transaction DB, orchestration nhiều bước, transform
dữ liệu lớn, logic phụ thuộc domain. Gateway là **shared bottleneck** — giữ mỏng, version hóa
config, tránh deploy gateway cho mọi thay đổi nhỏ. Với BFF, tách theo client (web/mobile) để
aggregate phù hợp.

---

### Q09. OAuth2/OIDC cho hệ nhiều service: thiết kế thế nào? [S]

**Trả lời:** Dùng authorization server chuẩn (Keycloak, Auth0, Cognito, hoặc IdP nội bộ). Flow:
user login → authorization code + PKCE → token; service nhận access token, verify chữ ký qua
JWKS, kiểm tra `iss/aud/exp/scopes`. Service-to-service dùng client credentials hoặc mTLS, không
dùng token user cho background job.

```text
Browser -> IdP (OIDC) -> code -> app -> access token (short) + refresh (rotating)
App -> API: Authorization: Bearer <jwt>
API -> downstream: token exchange hoặc service identity (mTLS)
```

Không tự phát minh token format; hỗ trợ revoke/rotation; không đặt authorization data nhạy cảm
trong JWT nếu không cần. Với multi-tenant, `tenant_id` phải được kiểm tra ở server và khớp token.

---

### Q10. Thiết kế idempotency và retry ở cấp platform? [S]

**Trả lời:** Chuẩn hóa `Idempotency-Key` cho POST có side effect; lưu key + request hash +
response/trạng thái trong store phân tán (DB/Redis) với TTL; trả lại response cũ cho request lặp.
Với event, dùng `event_id` unique và consumer idempotent.

Retry chỉ ở một tầng có ngữ nghĩa; phân loại lỗi; backoff + jitter; deadline tổng; circuit
breaker cho dependency. Platform cung cấp middleware/client chung để team không tự viết sai.
Có test giả lập duplicate, timeout sau khi đã ghi, và retry đồng thời cùng key.

**Điểm cộng:** nêu khó khăn khi side effect ra bên thứ ba (gateway không hỗ trợ idempotency) →
dùng trạng thái `unknown` + reconciliation, không retry mù.

---

## 4. Async, concurrency và runtime

### Q11. Vì sao event loop Python không scale theo số CPU? Kiến trúc nào bù? [S]

**Trả lời:** Một event loop chạy một thread; tăng CPU không giúp vì GIL và vì loop là single
thread. Scale bằng nhiều process (Gunicorn/Uvicorn workers) hoặc nhiều pod, mỗi process một loop.
Cần đảm bảo tác vụ CPU-bound đẩy sang process pool/worker.

```bash
gunicorn app:app -k uvicorn.workers.UvicornWorker -w 4
```

Chọn số worker theo CPU và loại tải: I/O-heavy có thể nhiều worker hơn CPU; CPU-heavy gần bằng
số core. Theo dõi event loop lag, CPU throttling, memory per worker. Với free-threaded Python
tương lai, mô hình có thể thay đổi nhưng chưa phổ biến cho production.

---

### Q12. Event loop lag: nguyên nhân và cách đo? [S]

**Trả lời:** Lag là thời gian loop bị chặn so với lịch dự kiến. Đo bằng task định kỳ ghi
`monotonic` rồi so sánh, hoặc `asyncio` debug mode (chậm, chỉ dùng điều tra).

```python
async def monitor_lag(interval: float = 0.1) -> None:
    while True:
        t0 = time.monotonic()
        await asyncio.sleep(interval)
        lag = time.monotonic() - t0 - interval
        HISTOGRAM.observe(max(0.0, lag))
```

Nguyên nhân: call sync (DB, HTTP, file, CPU), GC pause lớn, logging nặng, JSON serialize lớn,
lock contention, quá nhiều task. Xử lý: `to_thread`, process pool, giảm payload, tối ưu GC, tăng
worker. Alert khi p99 lag vượt ngưỡng ảnh hưởng SLO.

---

### Q13. So sánh asyncio, threads, processes, và free-threaded Python cho workload thật? [S]

**Trả lời:**

| Mô hình | Song song CPU | Chi phí | Rủi ro chính |
|---|---|---|---|
| asyncio | Không | Thấp | Blocking call, cancellation |
| Threads | Không (GIL) | Trung bình | Race, lock, context switch |
| Processes | Có | Cao (memory, IPC) | Pickling, khởi động, phức tạp |
| Free-threaded 3.13/3.14 | Có (thử nghiệm/đang hoàn thiện) | Trung bình | Tương thích C-extension, perf single-thread |

Quyết định theo **bottleneck**: chờ I/O → async; I/O sync không sửa được → thread; CPU → process
hoặc native extension; free-threaded chỉ khi benchmark và dependency đã sẵn sàng. Không chọn
theo "trend"; đo throughput/latency/memory thực tế.

---

### Q14. Backpressure trong hệ phân tán: thiết kế thế nào? [S]

**Trả lời:** Giới hạn công việc ở **mọi tầng**: connection pool, concurrency limit, queue bound,
rate limit, request timeout. Khi vượt ngưỡng, trả 429/503 nhanh thay vì xếp hàng vô hạn.

```python
sem = asyncio.Semaphore(50)

async def call(x):
    async with sem:                  # giới hạn concurrency
        async with asyncio.timeout(3):
            return await downstream(x)
```

Với queue, dùng lag time làm tín hiệu autoscale và alert; consumer chậm phải làm producer chậm
hoặc drop có chủ đích (theo priority). Load shedding theo tenant/endpoint để bảo vệ hệ thống.
Đo saturation, không chỉ CPU.

---

### Q15. Cancellation và timeout lan truyền thế nào? [S]

**Trả lời:** Coi deadline là **context xuyên suốt** (gRPC deadline, `contextvars`, header). Khi
client hủy, server nên dừng công việc không còn cần, giải phóng tài nguyên; nhưng không hủy giữa
chừng một giao dịch đã commit.

```python
async with asyncio.timeout(5):
    result = await service.call()

# lan truyền deadline còn lại
remaining = deadline - time.monotonic()
async with asyncio.timeout(remaining):
    ...
```

`CancelledError` phải cleanup rồi re-raise; tránh nuốt. Với background job, hủy phải idempotent
hoặc có checkpoint. Phân biệt timeout của từng bước với deadline tổng để tránh retry vượt ngân
sách.

---

### Q16. Làm sao tránh "retry amplification" và cascading failure? [S]

**Trả lời:** Retry chỉ ở một tầng (thường client của dependency hoặc worker), có budget và
jitter; downstream phải có circuit breaker/bulkhead. Khi dependency suy giảm, retry đồng loạt
làm tăng tải gấp bội → sập hoàn toàn.

Chiến lược: exponential backoff + jitter, giới hạn tổng thời gian, retry budget (tỉ lệ retry/
request), fail fast khi breaker mở, fallback/cache, load shedding. Với queue, retry qua topic
riêng thay vì block partition. Theo dõi tỉ lệ retry và tác động lên dependency.

---

### Q17. Khi nào dùng actor model / worker pool / event loop? [S]

**Trả lời:** Event loop cho I/O đồng thời cao, ít state chia sẻ. Worker pool cho tác vụ độc lập,
cần scale ngang, retry, cô lập lỗi. Actor model (Ray, Thespian, hoặc tự xây) khi cần state cục bộ
+ message passing, tránh lock; nhưng tăng phức tạp vận hành.

Với Python, phần lớn hệ thống dùng **queue + worker** (Celery/RQ/Dramatiq/Arq) là đủ. Actor phù
hợp tính toán phân tán/ML, ít phổ biến cho CRUD. Chọn theo mô hình lỗi và cách scale, không theo
sở thích.

---

### Q18. Đo và tối ưu throughput của service async? [S]

**Trả lời:** Xác định **giới hạn**: CPU, event loop lag, DB pool, downstream latency, bandwidth,
GC, serialization. Load test với profile traffic thật (mix endpoint, payload, think time), đo
p50/p95/p99, error rate, saturation.

Tối ưu theo thứ tự: giảm round-trip (batch, cache), giảm payload (select field, nén), tăng
concurrency có kiểm soát, tối ưu query/index, dùng connection pool đúng, tránh serialize thừa.
Đo lại và tìm điểm gãy tiếp theo (thường DB). Đặt SLO và test regression hiệu năng trong CI cho
luồng chính.

---

## 5. CPython internals

### Q19. Mô tả object model của CPython? [S]

**Trả lời:** Mọi giá trị là `PyObject*` gồm `ob_refcnt` và `ob_type`; kiểu cụ thể mở rộng struct
(`PyLongObject`, `PyListObject`...). Type object chứa slot function (`tp_...`) cho arithmetic,
getattr, dealloc. Attribute lookup đi qua type (MRO) và descriptor; method call tạo bound method.

```c
typedef struct {
    Py_ssize_t ob_refcnt;
    PyTypeObject *ob_type;
} PyObject;
```

Hệ quả thực tế: mọi thứ là object → chi phí boxing (int nhỏ được cache -5..256), `is` so identity,
`==` gọi `__eq__`. Hiểu object model giúp giải thích memory, copy, hash, và vì sao `__slots__`
tiết kiệm.

---

### Q20. Memory allocator của CPython: pymalloc, arena, fragmentation? [S]

**Trả lời:** CPython dùng pymalloc cho object nhỏ (≤512 byte): pool 4KB trong arena 256KB; object
lớn dùng `malloc` hệ thống. Giải phóng object nhỏ trả về pool, nhưng arena có thể không trả OS
ngay → RSS cao dù `tracemalloc` thấp.

```python
import tracemalloc
tracemalloc.start()
snap = tracemalloc.take_snapshot()
for stat in snap.statistics("lineno")[:10]:
    print(stat)
```

Phân biệt **allocated** (Python objects) vs **resident** (RSS). Fragmentation do phân bổ/hủy
không đều, object sống lâu xen object ngắn. Giảm bằng `__slots__`, batch, pool tái sử dụng,
tránh giữ reference dài hạn. Với container, đặt memory limit và hiểu OOM kill.

---

### Q21. GC generational: tune thế nào và khi nào? [S]

**Trả lời:** CPython có 3 thế hệ; object mới ở gen0, sống sót được thăng gen. Ngưỡng mặc định
(700, 10, 10) nghĩa là gen0 collect sau ~700 allocation trừ refcount. Collection gen2 đắt hơn.

```python
import gc
gc.set_threshold(50_000, 20, 20)
gc.freeze()          # đưa object hiện có ra khỏi GC (3.7+), giảm quét
gc.get_stats()
```

Tune khi latency nhạy cảm và có nhiều object sống lâu: tăng ngưỡng gen0, `gc.freeze()` sau
startup, hoặc tạm `gc.disable()` trong đoạn ngắn. Không tắt vĩnh viễn nếu có cycle. Đo pause bằng
`gc.callbacks` hoặc profiler; thay đổi phải benchmark vì có thể tăng memory.

---

### Q22. Bytecode và adaptive specialization (3.11+) ảnh hưởng gì? [S]

**Trả lời:** Python compile sang bytecode cho interpreter ảo. Từ 3.11, interpreter **adaptive**:
sau vài lần chạy, nó thay instruction generic bằng phiên bản chuyên biệt cho type thường gặp
(inline cache), tăng tốc đáng kể. 3.12/3.13 mở rộng; 3.13 có JIT thử nghiệm (copy-and-patch).

```python
import dis
dis.dis(lambda x, y: x + y)
```

Hệ quả: micro-benchmark phải warm up; hành vi hiệu năng phụ thuộc tính đa hình của code. Tránh
tối ưu mù bằng `dis`; đo bằng benchmark thật. Viết code rõ ràng, ổn định kiểu, thường nhanh hơn
mẹo bytecode.

---

### Q23. Descriptor và metaclass: dùng thực tế khi nào? [S]

**Trả lời:** Descriptor cho thuộc tính có logic (validate, lazy, ORM column). Metaclass cho
**tạo class** (đăng ký, kiểm tra invariant, sinh method), nhưng thường có thể thay bằng
`__init_subclass__`, decorator, hoặc `dataclass`.

```python
class Registry(type):
    registry: dict[str, type] = {}
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        if name != "Base":
            mcls.registry[name] = cls
        return cls

class Handler(metaclass=Registry):
    pass
```

Dùng metaclass khi framework cần can thiệp sâu (ORM, plugin registry). Trong code ứng dụng, ưu
tiên rõ ràng, dễ debug; metaclass làm stack trace/IDE khó hiểu. Tránh metaclass conflict khi đa
kế thừa.

---

### Q24. Import system: circular import, `sys.modules`, startup time? [S]

**Trả lời:** Import chạy module top-level một lần, lưu trong `sys.modules`; import lại trả cache.
Circular import xảy ra khi A import B trong lúc B đang import A, dẫn tới module nửa khởi tạo.

Cách xử lý: tách module lá (types/constants), import trong hàm (lazy), dùng `TYPE_CHECKING` cho
type-only import, hoặc đảo chiều dependency. Không vá bằng `sys.path`/import động trừ khi có lý
do.

```python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models import Order

def handle(order: "Order") -> None: ...
```

Startup chậm do import nặng (pandas, ML libs, SDK). Đo `python -X importtime`, lazy import cho
CLI/serverless, tránh import ở `__init__.py`. Với CLI, dùng entry point rõ và `argparse`/Typer
lazy.

---

### Q25. Subinterpreters và free-threading: cơ hội và rủi ro? [S]

**Trả lời:** Python 3.12 có per-interpreter GIL (PEP 684), cho phép subinterpreter song song
trong cùng process, nhưng API còn hạn chế và nhiều extension chưa hỗ trợ. Free-threaded build
(PEP 703) từ 3.13 thử nghiệm, 3.14 được hỗ trợ chính thức hơn (PEP 779) nhưng hệ sinh thái
C-extension và hiệu năng single-thread vẫn là yếu tố cần đánh giá.

Cơ hội: CPU-bound song song không cần process, giảm memory so với multiprocessing. Rủi ro: race
trong code C, thư viện chưa thread-safe, throughput đơn luồng giảm, tooling/profiler chưa hoàn
thiện. Chiến lược: benchmark trên workload thật, chạy test đa luồng, giữ fallback GIL build.

---

### Q26. Khi nào nên viết C extension/Rust thay vì tối ưu Python? [S]

**Trả lời:** Khi profiler chứng minh **CPU-bound trong vòng lặp nóng** và đã thử thuật toán/tối
ưu cấu trúc dữ liệu. Ưu tiên thư viện có sẵn (NumPy, Polars, orjson, regex) trước khi tự viết.
C extension/Rust (PyO3) hợp lý khi cần hiệu năng, kiểm soát memory, hoặc binding thư viện.

```python
# đẩy vòng lặp sang C/NumPy thay vì Python loop
out = (arr * 2 + 1).sum()
```

Chi phí: build matrix, wheel cho nhiều platform, ABI (abi3), debug khó, an toàn memory. Với
Rust/PyO3, cần benchmark cả overhead chuyển đổi dữ liệu. Giữ phần Python làm orchestration, phần
nóng làm native; test kỹ boundary.

---

## 6. Typing ở quy mô lớn

### Q27. Áp dụng typing cho monorepo nhiều team? [S]

**Trả lời:** Xem type như **hợp đồng API nội bộ**. Bước: chọn một checker (mypy hoặc pyright,
không cả hai cho cùng package), cấu hình strict theo package, đặt ngưỡng trong CI, công bố
`py.typed` cho package nội bộ, và có owner cho stub.

```toml
[tool.pyright]
include = ["src"]
typeCheckingMode = "strict"
reportMissingTypeStubs = true
```

Chiến lược legacy: `# type: ignore` có mã lỗi + ticket, baseline giảm dần, ưu tiên boundary
(public API, repository, event schema). Đo số lỗi theo package, không chase 100%. Type không thay
runtime validation ở boundary không tin cậy.

---

### Q28. Static type và runtime validation: phân chia thế nào? [S]

**Trả lời:** Type checker bảo vệ **code của bạn**; runtime validation bảo vệ **dữ liệu từ bên
ngoài** (HTTP, queue, env, file). Không dùng `cast` để bỏ qua validation ở boundary.

```python
class OrderIn(BaseModel):
    ...
    model_config = ConfigDict(extra="forbid")

def handle(raw: dict[str, Any]) -> None:
    order = OrderIn.model_validate(raw)   # runtime
    process(order)                        # typed
```

Pydantic chậm hơn dataclass; với throughput cao dùng `msgspec`/`attrs` + validator hoặc schema
compile. Validate sớm, một lần, ở boundary; bên trong tin type. Ghi rõ schema version cho event
để tiến hóa an toàn.

---

### Q29. Variance và generic protocol trong thiết kế thư viện? [S]

**Trả lời:** Container **chỉ đọc** nên covariant (`Sequence[T]`, `Mapping[K, V]`); **chỉ ghi**
contravariant (`Callable[[T], None]`); đọc-ghi invariant (`list[T]`, `MutableMapping`). Nếu API
nhận `Sequence[T]`, caller truyền `list[Sub]` an toàn; nếu nhận `list[T]`, không.

```python
from typing import Protocol, TypeVar

T_co = TypeVar("T_co", covariant=True)

class Reader(Protocol[T_co]):
    def read(self) -> T_co: ...
```

Đặt Protocol ở consumer, chia interface nhỏ. Tránh generic quá trừu tượng làm khó đọc; ưu tiên
tên miền thay vì `T`, `U`. Với thư viện public, test type bằng mypy/pyright trên ví dụ sử dụng.

---

### Q30. `TypeGuard`, `Never`, `Self`, overload dùng đúng chỗ? [S]

**Trả lời:** `TypeGuard`/`TypeIs` (3.13) thu hẹp kiểu qua hàm kiểm tra; `Never` cho hàm không
bao giờ trả (raise/loop); `Self` cho method trả cùng kiểu (builder, immutable update); `overload`
khi kết quả phụ thuộc tham số.

```python
from typing import TypeGuard, Self, overload

def is_str_list(xs: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in xs)

class Query:
    def where(self, clause: str) -> Self:
        ...
        return self

@overload
def parse(x: str) -> str: ...
@overload
def parse(x: bytes) -> bytes: ...
def parse(x: str | bytes) -> str | bytes:
    return x
```

Không lạm dụng overload (khó bảo trì); runtime vẫn cần kiểm tra nếu input không tin cậy.
`TypeGuard` không kiểm tra runtime — chỉ là hợp đồng cho checker.

---

## 7. Distributed system và dữ liệu

### Q31. CAP và PACELC áp dụng thực tế thế nào? [S]

**Trả lời:** CAP nói khi có partition, hệ thống chọn consistency hoặc availability; PACELC thêm:
khi không partition, vẫn đánh đổi latency và consistency. Thực tế hầu hết hệ thống chọn
**eventual consistency** cho availability/latency, nhưng cần định nghĩa rõ với nghiệp vụ.

Ví dụ: số dư ví cần đọc nhất quán (strong/serializable) cho giao dịch; feed/like có thể eventual.
Không chọn "CP" hay "AP" cho toàn hệ thống — chọn theo **từng luồng dữ liệu**. Ghi rõ hành vi khi
partition: từ chối ghi, ghi local rồi reconcile, hay trả dữ liệu cũ. Test failure mode, không chỉ
happy path.

---

### Q32. Các mô hình consistency cần phân biệt? [S]

**Trả lời:**

| Mô hình | Đảm bảo | Ví dụ |
|---|---|---|
| Linearizable | Như một bản sao, real-time | Khóa phân tán, leader election |
| Serializable | Tương đương tuần tự | Giao dịch tài chính |
| Read-your-writes | Đọc thấy ghi của mình | Update profile |
| Monotonic reads | Không tua ngược thời gian | Feed |
| Eventual | Hội tụ cuối | Đếm like, cache |

Chọn theo **hậu quả sai**: mất tiền → mạnh; đếm view → eventual. Cài đặt: đọc từ primary sau
ghi, sticky session, version vector, session token mang `min_version`. Ghi rõ SLA độ trễ hội tụ
và cách người dùng thấy trạng thái trung gian.

---

### Q33. Replication lag gây lỗi "đọc không thấy vừa ghi" — xử lý? [S]

**Trả lời:** Nguyên nhân: ghi primary, đọc replica bị trễ. Giải pháp tùy ngữ cảnh: đọc primary
cho dữ liệu vừa ghi (trong một khoảng), session stickiness, trả về version/token và yêu cầu
replica đạt version đó, hoặc UI optimistic + retry.

```python
# sau commit, đọc primary trong N giây cho user đó
if time.monotonic() - user.last_write < 5:
    session = primary_session
```

Đo lag (bytes/giây), alert khi vượt ngưỡng; với read replica dùng cho analytics, chấp nhận trễ.
Không che giấu bằng retry vô hạn. Với multi-region, cân nhắc write forwarding và conflict
resolution.

---

### Q34. Sharding: chọn key thế nào, và reshard ra sao? [S]

**Trả lời:** Key phải phân bố đều, hỗ trợ truy vấn phổ biến, tránh hotspot. `tenant_id` tốt cho
multi-tenant (cùng tenant một shard), nhưng tenant lớn gây hotspot → có thể shard theo
`(tenant_id, hash(id))` hoặc tách tenant lớn.

Reshard: dùng consistent hashing/virtual nodes hoặc range + split; di chuyển dữ liệu theo batch,
dual-write/backfill, chuyển đọc dần, giữ khả năng rollback. Tránh `hash(key) % N` vì đổi N phải
di chuyển gần hết. Có catalog mapping key → shard, cache mapping, và giới hạn cross-shard query.
Test tải và thời gian backfill trước khi cắt.

---

### Q35. Distributed transaction: 2PC, saga, outbox — chọn gì? [S]

**Trả lời:** 2PC đảm bảo atomic nhưng blocking, coordinator là SPOF, hiệu năng kém; chỉ dùng khi
thật cần và hạ tầng hỗ trợ (XA). Saga phù hợp nghiệp vụ dài, chấp nhận eventual, cần compensation
và idempotency. Outbox giải quyết dual-write trong một service, không giải quyết xuyên service.

```text
2PC:      prepare -> commit/abort (blocking)
Saga:     T1..Tn + C1..Cn (eventual, compensation)
Outbox:   local TX + relay publish (at-least-once)
```

Thực tế: tránh giao dịch phân tán bằng cách thiết kế boundary dữ liệu (một service sở hữu một
aggregate), dùng event + reconciliation. Ghi rõ trạng thái cuối và cách xử lý khi compensation
fail.

---

### Q36. Exactly-once có thật không? Cách đạt hiệu ứng mong muốn? [S]

**Trả lời:** Trong hệ phân tán, exactly-once end-to-end rất khó; thường là **at-least-once +
idempotent**. Kafka transactions cho exactly-once trong phạm vi Kafka → Kafka/consumer với
read-process-write, nhưng side effect ra ngoài (email, payment) vẫn cần idempotency.

Thiết kế: `event_id` unique, upsert theo khóa nghiệp vụ, lưu `processed_events`, dùng conditional
update, và đảm bảo external API hỗ trợ idempotency key. Kiểm tra duplicate trong cửa sổ đủ lớn;
có reconciliation định kỳ cho trường hợp message mất/không rõ trạng thái.

---

### Q37. Event-driven: ordering và partition key? [S]

**Trả lời:** Broker chỉ đảm bảo order **trong một partition**. Chọn partition key theo thực thể
cần order (ví dụ `order_id`), không theo `user_id` nếu một user có nhiều order độc lập. Đổi key
làm mất order cũ → cần version/sequence và consumer chịu được out-of-order.

```text
key = order_id  -> mọi event của order vào cùng partition
consumer: if event.seq <= last_seq: skip; else apply
```

Với event toàn cục, dùng logical clock/version và idempotent state machine. Tránh giả định
"Kafka luôn order"; ghi rõ semantics trong tài liệu. Khi reprocess, reset offset có kiểm soát và
đảm bảo idempotent.

---

### Q38. Event sourcing/CQRS: khi nào đáng? [S]

**Trả lời:** Event sourcing lưu chuỗi event làm nguồn sự thật, state dựng lại bằng replay; CQRS
tách model ghi/đọc. Đáng khi cần **audit đầy đủ, temporal query, nhiều view khác nhau**, hoặc
domain phức tạp có workflow.

Chi phí: schema evolution, replay lâu, eventual consistency, versioning event, storage tăng,
debug khó. Với CRUD đơn giản, dùng audit log + outbox là đủ. Nếu chọn, cần snapshot, projector
idempotent, cách rebuild view, và chiến lược xóa dữ liệu (GDPR) — event sourcing không tự xóa
theo yêu cầu.

---

### Q39. Cache phân tán: hot key, cluster, consistency? [S]

**Trả lời:** Redis Cluster chia slot theo key; multi-key operation phải cùng slot (hash tag).
Hot key làm lệch tải một node → local cache, replicate key, hoặc shard key có suffix. Tránh
`KEYS *`/`FLUSHALL` production; dùng scan có giới hạn.

Consistency: cache-aside + invalidate sau commit; chấp nhận stale ngắn; version key khi schema
đổi. Với dữ liệu quan trọng, DB là nguồn sự thật, cache chỉ tăng tốc. Đo hit rate, eviction,
memory, latency theo node; đặt TTL và maxmemory policy phù hợp (`allkeys-lru` vs `volatile-*`).
Có fallback khi cache down.

---

### Q40. Data pipeline: late data, duplicate, backfill? [S]

**Trả lời:** Pipeline batch/stream cần xử lý: event đến trễ (watermark/window), duplicate
(idempotent sink/upsert), out-of-order (event time + allowed lateness), và schema evolution.

```text
raw events -> validate -> dedupe (event_id) -> aggregate window -> sink
                                      \-> dead-letter (invalid)
```

Backfill phải **cùng logic** với stream (dùng chung code/version), chạy idempotent, có giới hạn
tải nguồn. Đo freshness, completeness, lag; alert khi lệch. Với báo cáo tài chính, cần
reconciliation và khả năng audit từng bản ghi.

---

## 8. Kiến trúc và khả năng phục hồi

### Q41. Tách microservice: dấu hiệu nên và không nên? [S]

**Trả lời:** Nên tách khi: team ownership khác nhau, scaling/lifecycle khác, fault isolation
cần thiết, hoặc domain boundary rõ và ổn định. Không nên tách chỉ vì "microservices là chuẩn",
vì codebase lớn, hoặc để "clean".

Dấu hiệu boundary tốt: ít giao dịch chung, thay đổi độc lập, hợp đồng event/API rõ. Dấu hiệu xấu:
liên tục phải gọi nhau để hoàn thành một request, chia sẻ DB, deploy phải đồng thời. Bắt đầu
modular monolith; tách khi có **pain point đo được** và chi phí vận hành được chấp nhận.

---

### Q42. API gateway, BFF và service mesh khác nhau? [S]

**Trả lời:** Gateway xử lý ingress chung (auth, rate limit, routing). BFF là lớp riêng cho từng
client, aggregate/gọt dữ liệu. Service mesh xử lý giao tiếp **service-to-service** (mTLS, retry,
telemetry, traffic shifting) qua sidecar/eBPF.

| Thành phần | Phạm vi | Chức năng chính |
|---|---|---|
| Gateway | North-south | Ingress, auth, quota |
| BFF | Client-specific | Aggregate, shape response |
| Mesh | East-west | mTLS, retry, observability, canary |

Không dùng BFF để chứa business logic; không dùng mesh thay cho thiết kế retry đúng. Mesh tăng
độ phức tạp vận hành — chỉ đáng khi nhiều service/team.

---

### Q43. Resilience patterns nào thực sự cần? [S]

**Trả lời:** Timeout, retry có giới hạn + jitter, circuit breaker, bulkhead (giới hạn tài
nguyên theo dependency/tenant), load shedding, fallback/degraded mode, health check đúng nghĩa.

```python
breaker = CircuitBreaker(fail_threshold=0.5, window=30, recovery=10)
if not breaker.allow():
    return fallback()
```

Không dùng tất cả một cách máy móc: retry khi không idempotent là nguy hiểm; fallback trả dữ
liệu cũ phải được nghiệp vụ chấp nhận. Test failure injection. Ghi rõ hành vi khi dependency
down trong runbook và UI (thông báo, trạng thái chờ).

---

### Q44. Multi-region/DR: RTO/RPO và mô hình? [S]

**Trả lời:** Xác định RTO (thời gian phục hồi) và RPO (mất dữ liệu tối đa) theo nghiệp vụ, rồi
chọn mô hình:

| Mô hình | RTO | RPO | Chi phí |
|---|---|---|---|
| Backup/restore | Giờ | Giờ | Thấp |
| Pilot light | Phút–giờ | Phút | Trung bình |
| Warm standby | Phút | Giây–phút | Cao |
| Active-active | Gần 0 | Gần 0 | Rất cao |

Active-active cần giải quyết conflict (last-write-wins có thể mất dữ liệu), routing, và
consistency. Phải **diễn tập failover** định kỳ, đo thời gian thật, kiểm tra DNS/TTL, secret,
dependency region. Backup phải được test restore, không chỉ tồn tại.

---

### Q45. Migrate legacy system không downtime? [S]

**Trả lời:** Dùng strangler fig: đặt facade/router trước hệ cũ, chuyển từng capability sang hệ
mới, chạy song song và so sánh kết quả (shadow/dark launch), cắt traffic theo tỉ lệ/tenant.

Các bước: inventory + dependency; định nghĩa contract; đồng bộ dữ liệu (CDC/dual-write có kiểm
soát); backfill; verify; cutover theo feature flag; giữ đường lui. Tránh big-bang. Đo lệch dữ
liệu, latency, error rate giữa hai hệ. Có kế hoạch rollback và người trực trong cutover.

---

### Q46. Scale stateless và stateful khác nhau thế nào? [S]

**Trả lời:** Stateless (API) scale ngang dễ: thêm instance, LB, session ngoài. Stateful (DB,
cache, queue, WebSocket) cần partition/replication, sticky routing, hoặc sharding; scale dọc có
giới hạn và đắt.

```text
API:  LB -> N pods (autoscale theo CPU/RPS/latency)
DB:   primary + replicas, read/write split, sharding khi cần
WS:   sticky session + pub/sub, hoặc connection server có registry
```

Autoscale phải dựa trên tín hiệu đúng (queue lag, concurrency, latency), có warm-up, và tránh
scale loop. Với stateful, thay đổi membership cần rebalance an toàn, tránh mất dữ liệu/connection.

---

### Q47. Capacity planning và cost optimization? [S]

**Trả lời:** Dự báo từ dữ liệu: traffic growth, peak/seasonality, hiệu quả mỗi instance, chi phí
theo request/tenant. Đặt headroom 30–50% cho failover/burst; tính cả dependency (DB connection,
IP, disk IOPS, egress).

Tối ưu: right-size instance, autoscale, spot cho batch, cache, nén, giảm log/metric cardinality,
TTL storage, tier dữ liệu cũ. Theo dõi unit cost (USD/1k request) và cost per tenant. Cảnh báo
khi chi phí tăng bất thường. Không tối ưu chi phí bằng cách cắt observability/backup — rủi ro
lớn hơn tiết kiệm.

---

### Q48. Xử lý nợ kỹ thuật ở cấp kiến trúc? [S]

**Trả lời:** Inventory theo **rủi ro × chi phí**, không theo "cảm giác xấu". Phân loại: chặn
delivery, rủi ro bảo mật/sự cố, chi phí vận hành, khó tuyển dụng. Gắn nợ với mục tiêu kinh doanh
và số liệu (incident, lead time, cost).

Chiến lược: trả nợ liên tục 10–20% capacity, gộp vào feature khi hợp lý, đặt deadline cho phần
rủi ro cao, và có "no new debt" rule (review, lint, ADR). Tránh dự án "rewrite tất cả" không có
lối thoát; ưu tiên strangler và cải thiện từng phần có đo lường.

---

## 9. Security và observability

### Q49. Threat modeling cho service mới? [S]

**Trả lời:** Dùng STRIDE hoặc attack tree, bắt đầu từ luồng dữ liệu và trust boundary. Câu hỏi:
ai truy cập, dữ liệu nhạy cảm nào, đường vào nào, ai có quyền gì, nếu bị chiếm thì sao.

```text
Client -> WAF -> Gateway -> API -> DB
                    |-> S3 (presigned)
                    |-> third-party payment
```

Liệt kê mối đe dọa: spoofing (auth), tampering (integrity), repudiation (audit), information
disclosure (PII), DoS (rate limit), elevation (authz). Với mỗi mối: mitigation, owner, test.
Review lại khi thay đổi kiến trúc. Ghi vào ADR/security checklist, không chỉ làm một lần lúc
đầu dự án.

---

### Q50. Supply chain security cho Python? [S]

**Trả lời:** Pin + hash dependency, lockfile, private index có kiểm soát, scan CVE (`pip-audit`,
Trivy), SBOM (CycloneDX), ký artifact (Sigstore/cosign), và giới hạn quyền CI. Review package
mới, tránh typosquatting, kiểm tra maintainer/nguồn.

```bash
uv export --format requirements-txt --no-emit-project > req.txt
pip-audit -r req.txt
syft packages dir:. -o cyclonedx-json > sbom.json
```

CI dùng token ngắn hạn, không cho PR từ fork chạy secret; build trong môi trường sạch; verify
artifact trước deploy. Có quy trình phản ứng khi CVE mới: đánh giá phạm vi, patch khẩn cấp, thông
báo. Không chỉ dựa vào "đã pin" — pin vẫn có thể dính CVE.

---

### Q51. Zero trust và mTLS trong nội bộ? [S]

**Trả lời:** Không tin mạng nội bộ mặc định; mọi request phải authenticated/authorized, kể cả
service-to-service. mTLS xác thực danh tính service; policy (OPA/Istio) quyết định service nào
được gọi service nào, method/path nào.

```text
Service A --mTLS--> Service B
   identity: spiffe://cluster/ns/payments/sa/api
   policy: allow A -> B:/charge, deny others
```

Kết hợp token ngắn hạn (SPIFFE/JWT), secret manager, audit. Zero trust không chỉ là mTLS: còn
least privilege, segmentation, logging, và giả định breach. Chi phí vận hành cao — ưu tiên hệ
thống nhạy cảm trước.

---

### Q52. Envelope encryption và quản lý khóa? [S]

**Trả lời:** Mã hóa dữ liệu bằng **data key** (DEK), mã hóa DEK bằng **key encryption key**
(KEK) trong KMS. Lưu ciphertext + encrypted DEK + key id/version. Rotate KEK định kỳ, DEK theo
tenant/object để giới hạn phạm vi.

```text
plaintext -> AES-GCM(DEK) -> ciphertext
DEK -> KMS.encrypt(KEK) -> wrapped_dek
store: ciphertext, wrapped_dek, key_id, iv, tag
```

Không tự chế crypto; dùng thư viện chuẩn (cryptography, AES-GCM). Quản lý IV/nonce đúng, không
tái sử dụng. Có audit truy cập khóa, tách quyền encrypt/decrypt, và kế hoạch khi mất khóa. Tuân
thủ quy định lưu trữ/xóa (crypto-shredding bằng cách xóa DEK).

---

### Q53. Multi-tenant isolation và compliance? [S]

**Trả lời:** Chọn mô hình theo yêu cầu: DB riêng cho tenant lớn/nhạy cảm, schema riêng, hoặc
shared + `tenant_id` + row-level security. Mọi truy vấn phải scope tenant; test tự động cố gắng
truy cập chéo tenant.

Bổ sung: mã hóa theo tenant, audit log bất biến, data retention/xóa theo yêu cầu, backup tách
biệt nếu cần, hạn chế nhân viên truy cập. Với compliance (SOC2, ISO, GDPR), cần chứng minh kiểm
soát bằng log/quy trình, không chỉ tuyên bố. Có runbook xử lý yêu cầu xóa dữ liệu lan truyền qua
cache/backup/warehouse.

---

### Q54. Observability ở scale: chi phí và cardinality? [S]

**Trả lời:** Metric có nhãn (label) tăng theo tích các giá trị → cardinality nổ. Không đưa
`user_id`, `request_id`, `raw_path` vào label; dùng log/trace cho chi tiết, metric cho tổng hợp.

```text
Tốt:  http_requests_total{route="/orders/{id}", status="500"}
Xấu:  http_requests_total{path="/orders/123", user_id="u-9"}
```

Trace sampling: head sampling rẻ nhưng bỏ lỡ lỗi hiếm; tail sampling giữ trace lỗi/chậm nhưng
cần collector mạnh. Log: structured, retention theo loại, downsampling. Đo chi phí observability
theo service và đặt budget; ưu tiên tín hiệu SLO. Tránh "log mọi thứ" rồi không ai đọc.

---

### Q55. SLI/SLO/error budget và chính sách vận hành? [S]

**Trả lời:** SLI là chỉ số đo (tỉ lệ request thành công, latency < ngưỡng). SLO là mục tiêu
(99.9% trong 30 ngày). Error budget = 100% − SLO; dùng để cân bằng release và ổn định.

```text
SLI: good_requests / valid_requests
SLO: >= 99.9% / 30d
Budget: 0.1% ~ 43 phút downtime/tháng
```

Chính sách: budget còn → đẩy feature; cạn → ưu tiên reliability, hạn chế release rủi ro. Alert
theo burn rate (ví dụ 2% budget trong 1h) thay vì ngưỡng tĩnh. Review SLO hàng tháng; SLO phải
gắn hành vi, không chỉ dashboard đẹp.

---

### Q56. Điều hành incident lớn: vai trò và quy trình? [S]

**Trả lời:** Tách vai trò: Incident Commander (điều phối, quyết định), Ops/Subject Matter Expert
(điều tra), Communications Lead (cập nhật stakeholder), Scribe (timeline). Mục tiêu: giảm tác
động trước, root cause sau.

Quy trình: declare → assess severity → mitigate (rollback/flag/scale) → communicate theo nhịp →
resolve → monitor → postmortem. Có kênh riêng, tránh nhiều người sửa cùng lúc. Cập nhật stakeholder
bằng ngôn ngữ tác động, có ETA gần đúng và lần cập nhật kế tiếp. Ghi mọi thay đổi/thời điểm.

**Điểm cộng:** nêu ví dụ đã chạy incident, cách tránh "hero culture", và cách bảo vệ người trực.

---

### Q57. Postmortem blameless: làm sao có action item thực chất? [S]

**Trả lời:** Tập trung vào **hệ thống và quyết định**, không vào cá nhân. Timeline sự kiện, tác
động (người dùng, tiền, SLO), điều gì đã tốt, điều gì gây khó, root cause (có thể nhiều tầng),
và action item có owner/deadline/độ ưu tiên.

Action item tốt là thay đổi cụ thể: thêm test, sửa timeout, cải thiện alert, cập nhật runbook,
thay đổi quy trình review. Tránh "cẩn thận hơn" hoặc "training". Theo dõi completion, review lại
sau 30 ngày; nếu action item không được làm, đó là vấn đề ưu tiên của lãnh đạo.

---

### Q58. On-call health và alert fatigue? [S]

**Trả lời:** Đo số alert/người/tuần, tỉ lệ actionable, số trang ban đêm, thời gian ack, và
rotation. Alert chỉ dành cho việc cần con người hành động ngay; còn lại là ticket/dashboard.

Giảm nhiễu: alert theo triệu chứng + SLO burn rate, gộp cảnh báo cùng nguyên nhân, tự động hóa
mitigation (restart, scale, failover), loại bỏ alert "biết rồi". Có runbook cho từng alert, link
dashboard, escalation rõ. Bảo vệ thời gian nghỉ sau incident, tránh on-call dài hạn. Văn hóa:
on-call là trách nhiệm tập thể, không đổ lỗi.

---

## 10. System design

### Q59. Thiết kế hệ thống thanh toán? [S]

**Trả lời:** Yêu cầu: đúng, không mất tiền, idempotent, audit, reconciliation, tuân thủ (PCI).

- **API**: tạo payment với idempotency key; trạng thái `pending/authorized/captured/failed/refunded`.
- **Ledger**: bút toán kép (double-entry), append-only; số dư là tổng hợp, không update đè.
- **Provider**: adapter cho gateway, lưu request/response, retry có idempotency; xử lý callback
  trùng/đến trễ.
- **Nhất quán**: DB transaction cho ledger + outbox event; không gọi provider trong transaction
  dài; state machine rõ ràng.
- **Reconciliation**: job so sánh ledger với provider/settlement hằng ngày, báo lệch.
- **Bảo mật**: không log PAN/CVV, tokenization, mã hóa, phân quyền, audit.
- **Vận hành**: alert lệch, payment stuck, tỉ lệ fail theo provider; runbook refund/chargeback.

Nêu trade-off: authorize/capture tách hay gộp; xử lý timeout "unknown" (không retry mù, dùng
query/status); multi-currency và làm tròn.

---

### Q60. Thiết kế SaaS multi-tenant? [S]

**Trả lời:** Tenant là thực thể hạng nhất: `tenant_id` trong token, dữ liệu, log, metric, queue.
Chọn isolation (DB/schema/shared) theo phân khúc khách hàng và compliance. Onboarding tự động:
tạo tenant, schema, quota, admin, cấu hình.

- **Auth**: user thuộc tenant, role/scope; SSO cho enterprise.
- **Data**: row-level security hoặc query scope bắt buộc; test cross-tenant.
- **Noisy neighbor**: quota, rate limit, worker riêng cho tenant lớn, giới hạn concurrency.
- **Customization**: cấu hình/feature flag theo tenant, tránh fork code.
- **Billing**: đo usage (seat, API call, storage), đối soát.
- **Vận hành**: migration theo tenant, backfill có thể chạy nền, xóa dữ liệu theo yêu cầu.

Nêu bài học: tenant ID không được lấy từ client; cache key phải có tenant; backup/restore theo
tenant nếu khách yêu cầu.

---

### Q61. Thiết kế chat/real-time notification? [S]

**Trả lời:** Kênh real-time (WebSocket/SSE) + lưu trữ message + push khi offline.

- **Write path**: client gửi message → API xác thực quyền → lưu DB (partition theo conversation)
  → publish event → fan-out tới subscriber.
- **Delivery**: mỗi connection server giữ registry `user_id -> connections`; dùng pub/sub
  (Redis/NATS) để fan-out giữa các node; sticky không bắt buộc nếu có pub/sub.
- **Offline**: push notification, unread count, sync theo cursor khi reconnect.
- **Ordering**: sequence theo conversation; client xử lý gap/replay.
- **Scale**: partition theo conversation, giới hạn message size/rate, backpressure.
- **Bảo mật**: kiểm tra membership từng message, mã hóa transport, chống spam.

Nêu trade-off: at-least-once + dedupe client; lưu toàn bộ vs TTL; read receipt là eventual.

---

### Q62. Thiết kế search/autocomplete? [S]

**Trả lời:** Autocomplete cần độ trễ thấp (<100ms), search cần relevance + filter.

- **Index**: OpenSearch/Elasticsearch hoặc Postgres full-text cho quy mô nhỏ; denormalize document.
- **Autocomplete**: prefix index/trie, edge n-gram, hoặc Redis sorted set; cache kết quả theo prefix
  phổ biến, giới hạn top K.
- **Ingest**: CDC/outbox từ DB → index, đảm bảo idempotent, theo dõi lag.
- **Ranking**: popularity, recency, cá nhân hóa nhẹ; A/B test.
- **Query**: chuẩn hóa Unicode/tiếng Việt, typo tolerance, filter theo tenant/quyền.
- **Vận hành**: index size, refresh interval, shard/replica, reindex không downtime (alias).

Nêu trade-off: freshness vs chi phí; exact vs fuzzy; cache prefix hot; bảo mật document-level.

---

### Q63. Thiết kế pipeline analytics event? [S]

**Trả lời:** Thu thập → buffer → xử lý → lưu → query.

```text
SDK/API -> Kafka (partition theo user_id) -> validate/enrich -> warehouse/lake
                                            \-> dead-letter
                                    stream aggregation -> dashboard
```

- **Schema**: versioned, registry, backward compatible; event_id để dedupe.
- **Delivery**: at-least-once, sink idempotent (merge/upsert), cửa sổ thời gian + watermark.
- **Storage**: partition theo ngày, nén (Parquet), lifecycle tier.
- **Query**: warehouse cho ad-hoc, OLAP cho dashboard; pre-aggregate để giảm chi phí.
- **Governance**: PII tối thiểu, consent, retention, lineage.

Nêu trade-off: real-time vs batch, chi phí lưu trữ, độ chính xác của đếm unique (HLL).

---

### Q64. Thiết kế upload/media processing? [S]

**Trả lời:** Không proxy file lớn qua API. Dùng presigned URL upload trực tiếp S3, API chỉ cấp
quyền và ghi metadata.

```text
Client -> API: request upload (filename, size, type) -> presigned URL
Client -> S3: PUT file
S3 -> event -> queue -> worker: virus scan, validate, resize/transcode
Worker -> update status -> CDN URL
```

- **Bảo mật**: giới hạn size/type, kiểm tra magic bytes, quét malware, bucket private, signed
  download.
- **Idempotency**: `upload_id`/checksum, worker xử lý lại an toàn.
- **Scale**: worker theo queue, GPU pool cho transcode, CDN cho phân phối.
- **Lỗi**: file hỏng → trạng thái `failed` + thông báo; retry có giới hạn.

Nêu trade-off: xử lý đồng bộ cho ảnh nhỏ vs async; chi phí egress/CDN; đa vùng.

---

### Q65. Thiết kế rate limiting toàn cầu? [S]

**Trả lời:** Nhiều tầng: edge/gateway (IP, token), service (user/tenant), dependency (provider).
Dùng Redis cluster + Lua atomic theo key, hoặc gateway managed. Cửa sổ trượt/token bucket tùy
traffic.

Vấn đề: nhiều region → cần đồng bộ hoặc chấp nhận giới hạn cục bộ nhân lên; dùng global counter
với latency cao hoặc "local bucket + periodic sync" (xấp xỉ). Key phải ổn định (API key, user),
không chỉ IP. Trả `429` + `Retry-After` + header quota. Có ngoại lệ cho internal/health check.

Đo tỉ lệ chặn, false positive, ảnh hưởng SLO; điều chỉnh theo dữ liệu. Có cơ chế kill switch khi
limiter sai.

---

### Q66. Thiết kế job scheduler phân tán? [S]

**Trả lời:** Yêu cầu: chạy đúng giờ, không trùng, retry, scale, quan sát.

- **Storage**: bảng `jobs(id, type, run_at, status, attempts, locked_by, locked_until, payload)`;
  index `(status, run_at)`.
- **Claim**: `SELECT ... FOR UPDATE SKIP LOCKED` hoặc update có điều kiện để nhiều worker không
  lấy cùng job.
- **Lease**: worker giữ lease, heartbeat; hết lease thì job được nhận lại (at-least-once).
- **Idempotency**: job handler idempotent; unique key theo nghiệp vụ.
- **Retry**: backoff, max attempts, DLQ.
- **Schedule**: cron parser, timezone, catch-up policy; tránh drift.
- **Scale**: partition theo queue/tenant, worker pool riêng cho job nặng.

Nêu trade-off: DB queue đơn giản nhưng tải cao; Kafka không phù hợp delay chính xác; dùng
Temporal/Celery/Cloud Scheduler nếu cần.

---

### Q67. Thiết kế feature flag service? [S]

**Trả lời:** Flag có key, môi trường, trạng thái, rule (user/tenant/percentage), fallback, owner,
expiry. SDK đánh giá local với cache, cập nhật qua streaming/poll; độ trễ thấp, không phụ thuộc
service flag cho mọi request.

- **Consistency**: eventual, có version; client cache an toàn khi mất kết nối (giữ flag cũ).
- **Targeting**: hash(user_id + flag) để chia % ổn định; không random mỗi lần.
- **Audit**: ai đổi gì, khi nào; rollback nhanh.
- **Vận hành**: kill switch, giá trị mặc định an toàn, cảnh báo flag quá hạn.
- **Bảo mật**: quyền theo môi trường/team, không lộ rule nhạy cảm.

Nêu trade-off: remote eval vs local; flag lâu dài gây nợ — cần lifecycle.

---

### Q68. Thiết kế audit log? [S]

**Trả lời:** Audit log là **append-only**, bất biến, đủ chi tiết để trả lời ai làm gì, khi nào,
từ đâu, kết quả. Không dùng chung bảng với dữ liệu nghiệp vụ có thể sửa.

```json
{"ts":"2026-10-29T12:00:00Z","actor":"u-1","tenant":"t-9",
 "action":"order.refund","target":"order/123","result":"ok",
 "ip":"...","request_id":"...","before":{...},"after":{...}}
```

- **Ghi**: qua outbox/queue để không chặn request; đảm bảo không mất.
- **Lưu**: storage append-only/WORM, retention theo quy định, mã hóa.
- **Truy vấn**: index theo actor/target/thời gian; phân quyền chặt.
- **Toàn vẹn**: hash chain/ký để phát hiện sửa; backup.
- **PII**: tối thiểu, mask; audit log cũng phải tuân thủ quyền riêng tư.

Nêu trade-off: log đồng bộ (chắc chắn) vs async (hiệu năng); chi phí lưu trữ; thời hạn.

---

## 11. Chiến lược kỹ thuật và ảnh hưởng

### Q69. Viết ADR và định hướng kỹ thuật cho team? [S]

**Trả lời:** ADR ghi **bối cảnh, quyết định, phương án đã cân nhắc, hậu quả**. Ngắn gọn, có
ngày, trạng thái (`proposed/accepted/superseded`), người quyết định. Lưu trong repo cạnh code.

```markdown
# ADR-012: Dùng outbox thay vì publish trực tiếp
## Context
...
## Decision
...
## Consequences
+ Không mất event khi broker lỗi
- Tăng độ trễ và cần dọn bảng
```

Định hướng kỹ thuật không phải "danh sách công nghệ", mà là **nguyên tắc + ưu tiên + trade-off**
gắn mục tiêu kinh doanh. Truyền đạt qua ví dụ, review, và làm mẫu. Đo kết quả (lead time, incident,
cost), điều chỉnh. Tránh áp đặt mọi thứ từ trên xuống; tạo không gian cho team đề xuất.

---

### Q70. Ảnh hưởng kỹ thuật không cần chức danh? [S]

**Trả lời:** Bắt đầu từ vấn đề của người khác, không từ giải pháp yêu thích. Viết proposal ngắn,
làm prototype/spike, đo bằng số liệu, và chỉ ra chi phí nếu không làm. Review code có lý do, dạy
pattern thay vì sửa hộ.

Xây dựng uy tín bằng: tài liệu rõ, giúp debug, nhận việc khó, và giữ lời hứa. Khi bất đồng, dùng
thử nghiệm nhỏ để so sánh; tôn trọng quyết định tập thể sau khi đã nêu ý kiến. Mentor 1–2 người,
tạo "nhân bản" ảnh hưởng. Đo impact bằng thay đổi hệ thống/team, không bằng số PR.

---

## 12. Coding

### C01. Consistent hashing ring [S]

```python
import bisect
import hashlib

class Ring:
    def __init__(self, nodes: list[str], replicas: int = 100) -> None:
        self.replicas = replicas
        self._keys: list[int] = []
        self._owners: dict[int, str] = {}
        for node in nodes:
            self.add(node)

    def _hash(self, value: str) -> int:
        return int.from_bytes(hashlib.sha1(value.encode()).digest()[:8], "big")

    def add(self, node: str) -> None:
        for i in range(self.replicas):
            key = self._hash(f"{node}#{i}")
            bisect.insort(self._keys, key)
            self._owners[key] = node

    def get(self, key: str) -> str:
        if not self._keys:
            raise LookupError("empty ring")
        pos = bisect.bisect_left(self._keys, self._hash(key))
        if pos == len(self._keys):
            pos = 0
        return self._owners[self._keys[pos]]
```

**Điểm cộng:** virtual nodes giảm lệch tải; nêu remove node, replication (lấy N node kế), và
consistent hashing có giới hạn (vẫn cần rebalance).

---

### C02. Sliding window rate limiter (log + counter) [S]

```python
import time
from collections import deque

class SlidingWindowLog:
    def __init__(self, limit: int, window: float) -> None:
        self.limit = limit
        self.window = window
        self._events: deque[float] = deque()

    def allow(self, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        cutoff = now - self.window
        while self._events and self._events[0] <= cutoff:
            self._events.popleft()
        if len(self._events) >= self.limit:
            return False
        self._events.append(now)
        return True

class SlidingWindowCounter:
    def __init__(self, limit: int, window: float) -> None:
        self.limit, self.window = limit, window
        self.prev = 0
        self.curr = 0
        self.start = time.monotonic()

    def allow(self, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        elapsed = now - self.start
        if elapsed >= self.window:
            self.prev = self.curr if elapsed < 2 * self.window else 0
            self.curr = 0
            self.start = now
            elapsed = 0
        weight = 1 - elapsed / self.window
        if self.prev * weight + self.curr >= self.limit:
            return False
        self.curr += 1
        return True
```

**Điểm cộng:** log chính xác nhưng memory O(limit); counter xấp xỉ, rẻ; distributed cần Redis/
Lua; nêu clock skew.

---

### C03. Circuit breaker [S]

```python
import time
from enum import Enum

class State(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_after: float = 30) -> None:
        self.failure_threshold = failure_threshold
        self.reset_after = reset_after
        self.state = State.CLOSED
        self.failures = 0
        self.opened_at = 0.0

    def allow(self) -> bool:
        if self.state is State.OPEN:
            if time.monotonic() - self.opened_at >= self.reset_after:
                self.state = State.HALF_OPEN
                return True
            return False
        return True

    def record(self, ok: bool) -> None:
        if self.state is State.HALF_OPEN:
            self.state = State.CLOSED if ok else State.OPEN
            self.failures = 0 if ok else self.failure_threshold
            self.opened_at = time.monotonic()
            return
        if ok:
            self.failures = 0
            return
        self.failures += 1
        if self.failures >= self.failure_threshold:
            self.state = State.OPEN
            self.opened_at = time.monotonic()
```

**Điểm cộng:** half-open chỉ cho một request thử (cần lock/flag); nêu metric state, fallback,
và không dùng breaker cho lỗi validation.

---

### C04. Top-K phần tử trong stream [S]

```python
import heapq
from collections import Counter
from collections.abc import Iterable

def top_k(items: Iterable[str], k: int) -> list[tuple[str, int]]:
    if k <= 0:
        return []
    counts: Counter[str] = Counter()
    for item in items:
        counts[item] += 1
    return heapq.nlargest(k, counts.items(), key=lambda kv: (kv[1], kv[0]))
```

**Điểm cộng:** exact cần O(distinct) memory; với stream lớn dùng Count-Min Sketch/Space-Saving
(xấp xỉ), hoặc heap K nếu chỉ cần giữ K; nêu tie-break ổn định.

---

### C05. Retry + timeout + semaphore cho async client [S]

```python
import asyncio
import random

class AsyncClient:
    def __init__(self, concurrency: int = 20) -> None:
        self._sem = asyncio.Semaphore(concurrency)

    async def get(self, url: str, *, attempts: int = 3, timeout: float = 3.0) -> str:
        last: Exception | None = None
        for i in range(attempts):
            try:
                async with self._sem:
                    async with asyncio.timeout(timeout):
                        return await self._do_get(url)
            except (TimeoutError, ConnectionError) as exc:
                last = exc
                if i == attempts - 1:
                    break
                delay = min(2.0, 0.2 * 2 ** i)
                await asyncio.sleep(delay * random.uniform(0.5, 1.5))
        raise RuntimeError(f"failed: {url}") from last

    async def _do_get(self, url: str) -> str:
        ...
```

**Điểm cộng:** semaphore giới hạn tải; timeout từng attempt; deadline tổng nếu cần; chỉ retry
idempotent; cancellation vẫn lan truyền.

---

## 13. Tình huống

### S1. DB primary failover gây lỗi 15 phút. Bạn cải thiện gì?

**Trả lời:** Trước hết xác nhận failover có tự động không, thời gian app phát hiện, connection
pool có `pre_ping`, retry đúng, DNS TTL, và read replica có được promote đúng. Cải thiện: timeout
ngắn hơn, retry có jitter cho lỗi connection, circuit breaker, health check, và test failover
định kỳ. Với ghi, cần chống mất dữ liệu: sync replication hoặc chấp nhận RPO rõ ràng. Viết
runbook và diễn tập.

---

### S2. Phát hiện dữ liệu bị ghi sai do bug logic. Xử lý?

**Trả lời:** Khoanh vùng thời gian/điều kiện, dừng nguồn ghi sai (flag/rollback), bảo toàn bằng
chứng (snapshot/log), rồi sửa code trước khi backfill. Backfill idempotent, batch nhỏ, có kiểm
tra trước/sau, chạy trên bản sao nếu được. Thông báo stakeholder về phạm vi và thời gian khắc
phục. Thêm invariant/test để phát hiện sớm; cân nhắc audit/ledger cho dữ liệu quan trọng.

---

### S3. Sự cố bảo mật: token bị lộ trong log. Làm gì?

**Trả lời:** Coi như bị xâm nhập: thu hồi/rotate token ngay, vô hiệu session, kiểm tra access log
bất thường, xác định phạm vi dữ liệu bị ảnh hưởng. Xóa/che log cũ, sửa logger để redact, thêm
test. Thông báo theo quy định (pháp lý/khách hàng) nếu cần. Postmortem blameless, cải thiện
secret handling, quyền đọc log, và cảnh báo. Không chỉ xóa commit — secret vẫn nằm trong lịch
sử.

---

### S4. Team muốn rewrite service 5 năm tuổi. Bạn quyết định thế nào?

**Trả lời:** Hỏi "vì sao bây giờ" và pain point đo được: incident, lead time, chi phí, tuyển
dụng, hay không thể thêm feature. So sánh rewrite với incremental refactor (strangler) về rủi
ro, thời gian, cơ hội mất. Nếu rewrite, chia lát cắt, chạy song song, có tiêu chí thành công và
điểm dừng. Nếu refactor, đặt mục tiêu cụ thể theo quý. Quyết định ghi thành ADR, có stakeholder
đồng thuận.

---

### S5. 10x traffic trong 3 tháng. Kiến trúc cần thay gì?

**Trả lời:** Dự báo theo endpoint/tenant, tìm bottleneck hiện tại bằng load test. Thường: DB
(connection, index, read replica/sharding), cache, queue/worker, external provider quota, và
chi phí. Ưu tiên thay đổi có impact lớn/rủi ro thấp: cache, batch, async, scale stateless, tối
ưu query. Đặt SLO, autoscale, load shedding, và kế hoạch capacity theo tuần. Không tối ưu sớm
mọi thứ; đo và lặp.

---

### S6. Hai team tranh cãi chọn Kafka hay SQS. Bạn xử lý?

**Trả lời:** Đưa về yêu cầu: throughput, ordering, replay, retention, delivery semantics, chi
phí vận hành, kỹ năng team. Nếu cần replay/ordering theo key/nhiều consumer → Kafka; nếu đơn
giản, ít vận hành → SQS. Làm POC nhỏ với workload thật, đo. Ghi ADR với tiêu chí và người quyết
định. Tránh chọn theo cảm tính hoặc "ai to tiếng hơn"; thống nhất tiêu chí trước khi tranh luận.

---

## 14. Tài liệu tham khảo

- [`../python-advanced.md`](../python-advanced.md)
- [`../python-production.md`](../python-production.md)
- [`./03-middle.md`](./03-middle.md) — nền tảng trước Senior
- [`./05-lead-manager.md`](./05-lead-manager.md) — tiếp theo
- CPython internals: https://github.com/python/cpython/tree/main/InternalDocs
- Designing Data-Intensive Applications: https://dataintensive.net/
- Google SRE: https://sre.google/books/
- PostgreSQL: https://www.postgresql.org/docs/
- Kafka: https://kafka.apache.org/documentation/
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OpenTelemetry: https://opentelemetry.io/docs/
- Python typing spec: https://typing.readthedocs.io/

---

*Tiếp theo: [`05-lead-manager.md`](./05-lead-manager.md) cho Tech Lead, Engineering Manager và
Senior Manager: con người, tuyển dụng, delivery, stakeholder, org, ngân sách và văn hóa.*
