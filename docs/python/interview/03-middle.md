# Python Interview — Middle

> ~80 câu cho ứng viên 3–5 năm: thiết kế module, typing, async/concurrency, database,
> testing, kiến trúc, cache/queue, bảo mật, CI/CD và system design nhỏ. Kỳ vọng không chỉ
> "làm được" mà còn giải thích **vì sao**, **đánh đổi gì** và **đo bằng cách nào**.

---

## Mục lục

1. [OOP, protocol và thiết kế hàm](#1-oop-protocol-và-thiết-kế-hàm)
2. [Module, package, tooling](#2-module-package-tooling)
3. [Database và dữ liệu](#3-database-và-dữ-liệu)
4. [Testing, debug, performance](#4-testing-debug-performance)
5. [Web API và bảo mật ứng dụng](#5-web-api-và-bảo-mật-ứng-dụng)
6. [Async và concurrency](#6-async-và-concurrency)
7. [Internals và typing nâng cao](#7-internals-và-typing-nâng-cao)
8. [Kiến trúc, cache, queue](#8-kiến-trúc-cache-queue)
9. [Security và observability](#9-security-và-observability)
10. [System design nhỏ](#10-system-design-nhỏ)
11. [Coding](#11-coding)
12. [Tình huống](#12-tình-huống)
13. [Tài liệu tham khảo](#13-tài-liệu-tham-khảo)

---

## 1. OOP, protocol và thiết kế hàm

### Q01. Khi nào dùng ABC, khi nào dùng `Protocol`? [M]

**Trả lời:** `ABC` ràng buộc **kế thừa danh nghĩa** (nominal): class phải kế thừa và implement
`@abstractmethod`. `Protocol` là **structural typing**: chỉ cần đúng method/attribute là đủ,
không cần kế thừa, phù hợp để mô tả interface của dependency bên ngoài.

```python
from typing import Protocol

class Clock(Protocol):
    def now(self) -> float: ...

class FakeClock:
    def now(self) -> float:      # không cần kế thừa Clock
        return 0.0

def is_expired(clock: Clock, deadline: float) -> bool:
    return clock.now() > deadline
```

Chọn `ABC` khi muốn chia sẻ implementation hoặc kiểm soát vòng đời class; chọn `Protocol` khi
chỉ cần hợp đồng hành vi, đặc biệt ở boundary (HTTP client, storage, clock) để test dễ.

**Bẫy:** `Protocol` chỉ kiểm tra lúc type-check, không có runtime enforcement. Muốn runtime
check dùng `@runtime_checkable` nhưng nó chỉ kiểm tra tên method, không kiểm tra signature.

---

### Q02. MRO là gì? `super()` hoạt động thế nào trong đa kế thừa? [M]

**Trả lời:** Python dùng C3 linearization để tạo thứ tự tìm attribute tuyến tính, đảm bảo class
con trước class cha và giữ thứ tự khai báo tương đối. `super()` không phải "gọi class cha" mà
là "gọi class kế tiếp trong MRO của instance".

```python
class Base:
    def save(self) -> str:
        return "base"

class Audit:
    def save(self) -> str:
        return "audit+" + super().save()

class Repo(Audit, Base):
    pass

print(Repo().save())        # audit+base
print(Repo.__mro__)         # Repo, Audit, Base, object
```

Muốn multiple inheritance an toàn: mọi class trong chuỗi phải gọi `super()` và chấp nhận
`**kwargs`, tránh class có state xung đột. Trong code ứng dụng, ưu tiên composition/mixin nhỏ
thay vì cây đa kế thừa sâu.

---

### Q03. Composition vs inheritance: tiêu chí chọn? [M]

**Trả lời:** Dùng inheritance khi quan hệ **is-a** thật và hành vi cha ổn định; dùng
composition khi quan hệ **has-a/uses-a** hoặc khi muốn thay implementation lúc runtime.

| Tiêu chí | Inheritance | Composition |
|---|---|---|
| Quan hệ | is-a | has-a / uses-a |
| Coupling | Chặt, phụ thuộc implementation cha | Lỏng, phụ thuộc interface |
| Thay đổi runtime | Khó | Dễ (inject dependency) |
| Test | Cần subclass/fake | Inject fake |
| Multiple behavior | Dễ diamond | Rõ ràng, không xung đột |

```python
class OrderService:
    def __init__(self, repo: OrderRepo, payments: PaymentGateway) -> None:
        self.repo = repo
        self.payments = payments
```

**Điểm cộng:** nêu dấu hiệu lạm dụng inheritance — subclass chỉ để tái sử dụng vài hàm, phải
override gần hết, hoặc tên class không đọc được thành "X is a Y".

---

### Q04. Thiết kế exception hierarchy cho một service? [M]

**Trả lời:** Phân biệt ba tầng: lỗi **domain** (business rule), lỗi **hạ tầng** (DB, network),
lỗi **lập trình** (bug). Chỉ bắt exception ở nơi có thể xử lý; bọc lỗi hạ tầng thành lỗi
domain có ngữ nghĩa tại boundary; giữ nguyên cause bằng `raise ... from exc`.

```python
class DomainError(Exception):
    """Lỗi nghiệp vụ, có thể trả 4xx."""

class SeatTaken(DomainError):
    def __init__(self, seat: str) -> None:
        super().__init__(f"Seat {seat} already taken")
        self.seat = seat

class PaymentDeclined(DomainError):
    pass

try:
    gateway.charge(card)
except TimeoutError as exc:
    raise PaymentUnavailable("gateway timeout") from exc
```

Quy tắc: không `except Exception: pass`; không dùng exception cho control flow thường; log một
lần ở boundary (middleware), không log lặp ở mọi tầng; map domain error → HTTP status ở API
layer. Lỗi retryable (timeout, 429, 503) khác lỗi permanent (400, validation).

---

### Q05. Value object, immutability và `__hash__` liên quan gì? [M]

**Trả lời:** Value object so sánh theo giá trị, nên bất biến để tránh bị sửa sau khi dùng làm
dict key/set member. `@dataclass(frozen=True)` sinh `__eq__` và `__hash__` nhất quán.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Money:
    amount: int          # cents
    currency: str

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("amount must be >= 0")
        if len(self.currency) != 3:
            raise ValueError("currency must be ISO-4217")

price = Money(1999, "USD")
lookup = {price: "basic"}   # hash ổn định vì bất biến
```

**Bẫy:** class mutable tự định nghĩa `__eq__` mà không set `__hash__ = None` sẽ vô tình dùng
hash identity, gây sai khi làm key. Object chứa list/dict bên trong vẫn "frozen" nông — cần
tuple/frozenset hoặc tự đảm bảo.

---

## 2. Module, package, tooling

### Q06. `pyproject.toml`, lockfile và `requirements.txt` khác nhau thế nào? [M]

**Trả lời:** `pyproject.toml` khai báo **metadata + dependency trực tiếp + cấu hình tool**
(theo PEP 621). Lockfile ghi **toàn bộ cây phụ thuộc** với version/hash chính xác để build lặp lại
được. `requirements.txt` là định dạng cũ, vẫn phổ biến nhưng dễ trôi nếu không pin.

```toml
[project]
name = "orders"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.115,<1",
  "sqlalchemy>=2.0,<3",
]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.6", "mypy>=1.10"]

[tool.ruff]
line-length = 100
```

Ứng dụng nên commit lockfile (`uv.lock`, `poetry.lock`, `pdm.lock`); CI cài bằng chế độ frozen
(`uv sync --frozen`, `poetry install --sync`). Thư viện public thường **không** commit lockfile
mà khai báo khoảng version rộng, hợp lý.

**Điểm cộng:** phân biệt dependency trực tiếp vs transitive, và vì sao upper bound chỉ nên đặt
ở major version.

---

### Q07. Xử lý dependency xung đột và rủi ro supply chain? [M]

**Trả lời:** Trước hết đọc resolver output để tìm package chung gây xung đột; nâng cấp package
trung gian hoặc nới constraint hợp lý; tránh pin tuyệt đối mọi thứ trong thư viện. Kiểm tra
`pip-audit`/`uv audit`, theo dõi CVE, ưu tiên package maintained, hạn chế dependency không cần.

```bash
uv tree --invert requests
uv lock --upgrade-package urllib3
pip-audit -r requirements.txt
```

Với monorepo, dùng một lockfile chung hoặc workspace để tránh mỗi service một version khác
nhau. Pin hash cho môi trường production nếu cần reproducibility nghiêm ngặt; review diff của
lockfile trong PR vì đó là thay đổi runtime thật.

**Bẫy:** "dependency confusion" — cấu hình index nội bộ và scope package; không cài package
theo tên mơ hồ từ public index trong CI có quyền cao.

---

### Q08. Vì sao dùng `src/` layout cho package? [M]

**Trả lời:** `src/` buộc import package đã cài thay vì vô tình import thư mục hiện tại, giúp
phát hiện lỗi packaging (thiếu file, sai `packages`) trước khi release.

```
orders/
├── pyproject.toml
├── src/orders/
│   ├── __init__.py
│   ├── api/
│   └── domain/
└── tests/
```

Cấu hình build (setuptools/hatchling) trỏ `package-dir = {"" = "src"}`. Test chạy trên package
đã cài (`pip install -e .`) nên phản ánh đúng trải nghiệm người dùng. Với app nội bộ, lợi ích
chính là tránh "works on my machine" do Python path.

---

### Q09. Monorepo hay multi-repo cho nhiều service Python? [M]

**Trả lời:** Không có lựa chọn đúng tuyệt đối; chọn theo **coupling và quy mô team**.

| Tiêu chí | Monorepo | Multi-repo |
|---|---|---|
| Chia sẻ code | Dễ, refactor xuyên service | Cần package versioning |
| CI | Cần build/test chọn lọc | Đơn giản hơn mỗi repo |
| Ownership | Cần CODEOWNERS rõ | Tự nhiên theo repo |
| Release | Có thể atomic | Độc lập, dễ lệch version |
| Tooling | Phức tạp (workspace, cache) | Đơn giản |

Với monorepo, dùng workspace (uv/poetry), CI path filter, shared internal package có version
hoặc editable install. Với multi-repo, đầu tư vào semantic versioning, changelog và contract
test giữa service.

---

### Q10. Đưa lint/format/type-check vào CI mà không làm team tắc? [M]

**Trả lời:** Chia giai đoạn: (1) format toàn repo một lần bằng `ruff format`; (2) bật lint
rule mặc định, chỉ fail trên file thay đổi; (3) thêm type-check từng package, nâng dần
strictness; (4) pre-commit chạy nhanh, CI chạy đầy đủ.

```toml
[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM", "ASYNC"]
ignore = ["E501"]  # đã có formatter

[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true
disallow_untyped_defs = true
```

Nguyên tắc: một tool một việc, config trong `pyproject.toml`, không tranh luận style trong
review. Với legacy, dùng baseline (`--baseline`) hoặc ignore theo module, kèm ticket trả nợ.

---

## 3. Database và dữ liệu

### Q11. Transaction boundary nên đặt ở đâu trong code service? [M]

**Trả lời:** Đặt ở **use-case/application layer**, bao trọn các thao tác phải nguyên tử; không
đặt trong repository (quá nhỏ) hay trong HTTP handler (lẫn với parse/serialize).

```python
def book_seat(cmd: BookSeat, uow: UnitOfWork) -> Booking:
    with uow:                                  # begin
        seat = uow.seats.get_for_update(cmd.seat_id)
        if seat.taken:
            raise SeatTaken(cmd.seat_id)
        booking = Booking.create(cmd, seat)
        uow.bookings.add(booking)
        uow.commit()                           # commit/rollback tự động
    return booking
```

Không giữ transaction trong lúc gọi network/email/HTTP — làm lock lâu và dễ timeout. Với
nhiều aggregate, dùng outbox/event thay vì transaction xuyên service.

---

### Q12. Isolation level và lost update — xử lý thế nào? [M]

**Trả lời:** PostgreSQL mặc định `READ COMMITTED`: mỗi statement thấy dữ liệu đã commit mới
nhất, nhưng **read-modify-write** vẫn có thể mất update nếu hai transaction cùng đọc rồi ghi.

```sql
-- sai: hai request cùng đọc 100, cùng ghi 110
UPDATE accounts SET balance = 110 WHERE id = 1;

-- đúng: atomic trong một statement
UPDATE accounts SET balance = balance - 100
WHERE id = 1 AND balance >= 100;
```

Hoặc `SELECT ... FOR UPDATE` (khóa row), optimistic locking với cột `version`, hoặc
`SERIALIZABLE` nếu nghiệp vụ cần và chấp nhận retry. Chọn theo contention: ít conflict →
optimistic; conflict cao → pessimistic/atomic update.

**Bẫy:** `SERIALIZABLE` không miễn retry — phải bắt serialization failure và thử lại.

---

### Q13. Thiết kế index cho query thực tế? [M]

**Trả lời:** Index phục vụ **WHERE, JOIN, ORDER BY** theo thứ tự selectivity. Với composite
index, thứ tự cột quan trọng: `(tenant_id, created_at DESC)` phục vụ filter tenant + sort mới
nhất; index `(created_at)` không giúp khi filter tenant.

```sql
CREATE INDEX CONCURRENTLY idx_orders_tenant_created
ON orders (tenant_id, created_at DESC)
WHERE deleted_at IS NULL;          -- partial index
```

Kiểm tra bằng `EXPLAIN (ANALYZE, BUFFERS)`. Index có chi phí: chậm INSERT/UPDATE, tốn disk,
bloat. Tránh hàm lên cột trong WHERE (`WHERE lower(email) = ...`) trừ khi có expression index.
Covering index (`INCLUDE`) giúp index-only scan nhưng tăng kích thước.

**Bẫy:** `CREATE INDEX CONCURRENTLY` không chạy được trong transaction — migration tool phải
cấu hình autocommit cho bước này, nếu không sẽ treo hoặc lỗi.

---

### Q14. N+1 query là gì, phát hiện và sửa? [M]

**Trả lời:** Load N bản ghi cha rồi query thêm cho từng bản ghi con → N+1 round-trip, p95 tăng
theo dữ liệu.

```python
# N+1
orders = session.scalars(select(Order).limit(100)).all()
for o in orders:
    print(o.customer.name)       # mỗi lần một query

# sửa: eager load có chủ đích
from sqlalchemy.orm import selectinload
orders = session.scalars(
    select(Order).options(selectinload(Order.customer)).limit(100)
).all()
```

`selectinload` phát 2 query (IN), phù hợp collection; `joinedload` một query nhưng có thể nhân
dòng dữ liệu, dùng cho many-to-one. Phát hiện bằng SQL log, `echo=True`, APM query count, hoặc
test assert số query. Không eager load mọi thứ — payload và memory có hạn.

---

### Q15. Offset pagination vs keyset pagination? [M]

**Trả lời:** Offset (`LIMIT/OFFSET`) đơn giản, cho phép nhảy trang, nhưng chậm dần và có thể
bỏ/sót bản ghi khi dữ liệu thay đổi. Keyset (cursor) dùng điều kiện trên khóa sort, ổn định và
nhanh ở trang sâu.

```sql
-- keyset theo (created_at, id)
SELECT id, created_at, total
FROM orders
WHERE tenant_id = :tid
  AND (created_at, id) < (:last_created, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT :size;
```

API trả `next_cursor` (encode base64 có chữ ký nếu cần chống sửa). Dùng keyset cho feed/log/
danh sách lớn; offset chấp nhận được cho admin ít dữ liệu hoặc cần nhảy trang tùy ý.

**Bẫy:** cursor phải bao gồm tie-breaker (`id`) nếu `created_at` không unique.

---

### Q16. Migration zero-downtime: nguyên tắc và ví dụ? [M]

**Trả lời:** Dùng expand/contract, tách schema change và code deploy, đảm bảo **version cũ và
mới cùng chạy được** trong lúc rolling deploy.

Ví dụ đổi tên `name` → `full_name`:

1. Thêm cột `full_name` nullable.
2. Deploy code ghi cả hai, đọc `full_name` fallback `name`.
3. Backfill theo batch nhỏ, có throttle.
4. Chuyển read sang `full_name`, kiểm tra.
5. Ngừng ghi `name`, sau đó drop cột.

Tránh trong giờ cao điểm: `ALTER TABLE ... SET NOT NULL` trên bảng lớn, thêm index không
`CONCURRENTLY`, `ADD COLUMN` có default volatile (tùy version DB), backfill một transaction
khổng lồ. Luôn có rollback plan và test trên bản sao dữ liệu thật.

---

### Q17. Connection pool: chọn size thế nào? [M]

**Trả lời:** Pool size không phải "càng lớn càng tốt". Công thức khởi điểm: `connections ≈
core_count * 2 + effective_spindle_count` (Postgres), rồi đo. Nhiều app instance × pool size
phải nhỏ hơn `max_connections` của DB, trừ khi có PgBouncer.

```python
engine = create_engine(
    url,
    pool_size=10,
    max_overflow=5,
    pool_timeout=5,          # chờ connection tối đa
    pool_pre_ping=True,      # loại connection chết
    pool_recycle=1800,
)
```

Đặt `statement_timeout` và `lock_timeout` ở DB/session để tránh query treo giữ pool. Với
serverless, dùng external pooler vì mỗi instance tạo pool riêng. Theo dõi pool checkout wait,
active/idle, connection error.

---

### Q18. Lưu thời gian thế nào cho đúng? [M]

**Trả lời:** Lưu **UTC**, dùng kiểu có timezone (`TIMESTAMPTZ` ở Postgres, `DateTime(timezone=True)`
ở SQLAlchemy), chuyển sang timezone người dùng ở presentation layer. Không lưu naive datetime
trừ khi là "local wall time" có chủ đích (ví dụ giờ mở cửa).

```python
from datetime import datetime, timezone

now = datetime.now(timezone.utc)          # aware
# Python 3.11+: datetime.now(timezone.utc)
```

Dùng `date` cho ngày sinh/ngày giao dịch không gắn múi giờ; `timedelta` cho khoảng thời gian.
Với DST, cẩn thận khi cộng ngày lịch (dùng `zoneinfo` + logic ngày, không cộng 86400 giây).
API nên trả ISO-8601 có offset, ví dụ `2026-10-29T12:00:00Z`.

---

## 4. Testing, debug, performance

### Q19. Test pyramid trong service Python thực tế? [M]

**Trả lời:** Nhiều unit test nhanh cho domain logic; integration test cho repository/API/DB;
một ít end-to-end cho luồng quan trọng. Tỷ lệ không quan trọng bằng **test đúng tầng** và thời
gian chạy.

| Tầng | Test gì | Công cụ | Tốc độ |
|---|---|---|---|
| Unit | Rule, tính toán, state machine | pytest, fake | ms |
| Integration | SQL, transaction, serialization, HTTP client | testcontainers, httpx | 100ms–s |
| Contract | Schema/API giữa service | schemathesis, pact | s |
| E2E | Luồng người dùng chính | Playwright, compose | phút |

Không mock DB trong hầu hết test nghiệp vụ — mock DB dễ pass nhưng production lỗi SQL/
transaction. Dùng DB thật qua container, mỗi test rollback hoặc schema riêng.

---

### Q20. Thiết kế fixture pytest cho DB và dependency? [M]

**Trả lời:** Fixture theo scope hợp lý: session cho engine/container, function cho transaction/
client; dùng factory để tạo dữ liệu rõ ràng, tránh fixture khổng lồ chia sẻ state.

```python
import pytest
from sqlalchemy.orm import Session

@pytest.fixture(scope="session")
def engine():
    ...

@pytest.fixture
def session(engine):
    conn = engine.connect()
    tx = conn.begin()
    s = Session(bind=conn, join_transaction_mode="create_savepoint")
    try:
        yield s
    finally:
        s.close()
        tx.rollback()
        conn.close()
```

`conftest.py` đặt fixture dùng chung; factory (`order_factory`) nhận override thay vì nhiều
fixture biến thể. Tránh autouse fixture nặng; đặt tên rõ (`db_session`, `api_client`). Test
phải độc lập thứ tự và chạy song song được (`pytest-xdist`).

---

### Q21. Mock ở đâu là hợp lý? [M]

**Trả lời:** Mock **boundary không kiểm soát được**: HTTP bên thứ ba, email/SMS, clock, random,
payment gateway. Không mock domain logic của chính mình, không mock ORM/DB (trừ unit test thuần
tính toán).

```python
def test_send_reminder(monkeypatch, mailer):
    sent = []
    monkeypatch.setattr(mailer, "send", lambda msg: sent.append(msg))
    remind(booking_id=1, mailer=mailer)
    assert len(sent) == 1
```

Ưu tiên dependency injection + fake implementation hơn `monkeypatch`/`unittest.mock.patch` đường
dẫn sâu (dễ vỡ khi refactor). Với HTTP, dùng `respx`/`responses` để test cả status, timeout,
retry. Ghi lại contract của third-party bằng contract test nếu có thể.

**Bẫy:** mock quá nhiều khiến test chỉ kiểm tra "đã gọi hàm", không kiểm tra kết quả.

---

### Q22. Test flaky: nguyên nhân và cách xử lý? [M]

**Trả lời:** Nguyên nhân thường gặp: thời gian (`datetime.now`, sleep), thứ tự test/state dùng
chung, dữ liệu không unique, race trong async, network, timezone/locale, random không seed, test
phụ thuộc tốc độ máy.

Xử lý: freeze time (`freezegun`, `time-machine`), inject clock, tạo dữ liệu unique, cô lập DB,
tránh `sleep` (dùng event/condition), seed random, đặt `TZ=UTC`. Chạy lặp để tái hiện:
`pytest --count=100` hoặc `pytest -p no:randomly`. Khi đã xác định, **quarantine** test đó khỏi
blocking CI nhưng phải có owner và deadline sửa; không xóa im lặng.

**Điểm cộng:** phân biệt flaky do test với flaky do hệ thống thật (race trong code) — loại thứ
hai là bug production.

---

### Q23. Coverage bao nhiêu là đủ? Đo thế nào cho có nghĩa? [M]

**Trả lời:** Coverage là chỉ số **phát hiện vùng chưa test**, không phải chất lượng. 80% dòng
có thể che giấu logic sai; 100% dòng vẫn có thể thiếu case. Đặt ngưỡng để chống giảm (ratchet)
trên module quan trọng, không đặt một con số toàn repo.

Đo **branch coverage**, không chỉ line. Kiểm tra coverage của diff trong PR. Với logic phức
tạp, dùng mutation testing (`mutmut`, `cosmic-ray`) để xem test có thực sự bắt lỗi. Ưu tiên
test theo **hành vi và edge case**: empty, boundary, lỗi dependency, concurrent.

---

### Q24. Property-based testing dùng khi nào? [M]

**Trả lời:** Khi tính chất đúng phải đúng với **mọi input** hợp lệ: serialize/deserialize
round-trip, sort ổn định, parser, tính tiền, phân trang không trùng/sót.

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_is_ordered(xs: list[int]) -> None:
    out = sorted(xs)
    assert out == sorted(out)
    assert len(out) == len(xs)
```

Hypothesis tự shrink về ví dụ nhỏ nhất khi fail, rất hiệu quả để tìm edge case. Không thay thế
example-based test cho luồng nghiệp vụ; dùng bổ sung. Cẩn thận với test chậm/không deterministic.

---

### Q25. Production có bug không tái hiện được local, bạn làm gì? [M]

**Trả lời:** Quy trình: (1) xác định phạm vi ảnh hưởng và mốc thời gian; (2) xem log/trace/
metric theo `request_id`/`user_id`; (3) so sánh môi trường (version, config, data, timezone);
(4) tái hiện bằng dữ liệu thật đã ẩn danh hoặc replay request; (5) thêm logging tạm nếu thiếu;
(6) khoanh vùng bằng bisect deploy/commit; (7) sửa, viết regression test, và thêm signal để lần
sau thấy sớm.

Không "đoán rồi sửa mò". Nếu ảnh hưởng người dùng, ưu tiên mitigation (rollback, disable flag,
fallback) trước khi tìm root cause sâu. Ghi timeline vào incident doc.

---

### Q26. Profiling một endpoint chậm: công cụ và thứ tự? [M]

**Trả lời:** Đo trước khi tối ưu. (1) APM/trace để biết thời gian ở DB, external, CPU; (2)
`EXPLAIN ANALYZE` cho query; (3) `py-spy` cho process đang chạy (không cần sửa code); (4)
`cProfile`/`pytest-benchmark` cho hàm nghi vấn; (5) memory profiler nếu tăng RAM.

```bash
py-spy top --pid 1234
py-spy record -o profile.svg --pid 1234 --duration 30
python -m cProfile -s cumtime app.py
```

Tối ưu theo impact: query/index, N+1, payload, serialization, lock contention, DNS/TLS, thread
pool. Đo lại sau mỗi thay đổi, dùng p95/p99 thay vì average. Đặt ngân sách hiệu năng trong CI
cho luồng quan trọng.

---

### Q27. Làm sao test hợp đồng API giữa consumer và provider? [M]

**Trả lời:** Chọn một trong hai: **consumer-driven contract** (Pact) khi nhiều consumer, hoặc
**schema-first** (OpenAPI/JSON Schema) khi API public. Provider test đảm bảo response đúng
schema; consumer test chạy với stub từ contract.

```python
# kiểm tra response với OpenAPI schema
schema = app.openapi()
validate_response(schema, path="/orders", method="get", response=resp.json())
```

Với FastAPI, sinh client từ OpenAPI để phát hiện breaking change sớm. Breaking change gồm:
xóa field, đổi type, đổi status code, thêm required request field. CI nên diff OpenAPI giữa
base và PR.

---

### Q28. Test data và quyền riêng tư? [M]

**Trả lời:** Không copy dữ liệu production thật vào môi trường dev/test. Dùng dữ liệu sinh
(faker) hoặc ẩn danh hóa (mask email/phone, hash định danh) trước khi dump. Giới hạn quyền
truy cập dump, mã hóa at rest, có thời hạn xóa.

Seed dữ liệu theo factory, không dùng fixture SQL khổng lồ dễ lệch schema. Với test tốc độ,
chỉ tạo dữ liệu cần cho case. Tuân thủ GDPR/nghị định bảo vệ dữ liệu cá nhân: mục đích, tối
thiểu, thời hạn lưu, quyền xóa.

---

## 5. Web API và bảo mật ứng dụng

### Q29. Dependency injection trong FastAPI: dùng thế nào cho đúng? [M]

**Trả lời:** `Depends` phù hợp cho **cross-cutting**: auth, DB session, config, pagination
params. Không lạm dụng để che giấu logic nghiệp vụ; service nên nhận dependency qua constructor
để test độc lập.

```python
from typing import Annotated
from fastapi import Depends, HTTPException

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)],
                     users: Annotated[UserRepo, Depends(get_user_repo)]) -> User:
    user = users.by_token(token)
    if user is None:
        raise HTTPException(status_code=401, detail="invalid token")
    return user

@router.get("/me")
def me(user: Annotated[User, Depends(get_current_user)]) -> UserOut:
    return UserOut.model_validate(user)
```

Dùng `lifespan` cho resource sống theo app (HTTP client, engine), không tạo mới mỗi request.
Dependency có `yield` để cleanup. Cache dependency (`use_cache=True`) chỉ khi an toàn.

---

### Q30. Pydantic model có nên dùng làm domain model? [M]

**Trả lời:** Không nên dùng chung hoàn toàn. Pydantic phù hợp **boundary**: validate request,
serialize response, parse config/env. Domain model nên là dataclass/class thuần, không phụ
thuộc framework, để test nhanh và tránh ràng buộc validation HTTP len vào nghiệp vụ.

```python
class CreateOrderIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    customer_id: UUID
    items: list[ItemIn] = Field(min_length=1)

class Order:                     # domain
    def __init__(self, customer_id: UUID, items: list[Item]) -> None:
        if not items:
            raise ValueError("empty order")
        ...
```

Map rõ ràng giữa các tầng. Pydantic v2 dùng `model_validate`/`model_dump`, phân biệt
`model_config` (validate) và `field_serializer` (output). Không trả ORM object trực tiếp nếu
có field nhạy cảm.

---

### Q31. Thiết kế error contract cho API? [M]

**Trả lời:** Một format nhất quán, có mã lỗi máy đọc được, message người đọc được, và chi tiết
theo field. Dùng HTTP status đúng nghĩa; không trả 200 kèm `success: false` cho lỗi.

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "ORDER_ITEM_INVALID",
  "detail": "items[0].quantity must be >= 1",
  "request_id": "01J..."
}
```

Theo RFC 9457 (problem details) nếu muốn chuẩn. Không lộ stack trace/SQL. Map domain error →
status ở middleware: `NotFound` → 404, `Conflict` → 409, `PermissionDenied` → 403, `DomainError`
→ 422/400. Tài liệu hóa mã lỗi để client xử lý ổn định.

---

### Q32. Versioning API: chọn cách nào? [M]

**Trả lời:** Ưu tiên **backward-compatible evolution** trước: thêm field optional, không đổi
kiểu, không xóa field, giữ semantics. Khi buộc phải breaking, chọn một chiến lược và nhất quán:

| Cách | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| URL | `/v1/orders` | Rõ ràng, dễ route | URL dài, cache key |
| Header | `Accept: application/vnd.api+json;v=2` | URL sạch | Khó debug, proxy |
| Query | `?version=2` | Dễ thử | Không RESTful, dễ quên |
| Field/date | `2026-10-29` | Chuẩn vendor | Phức tạp |

Duy trì tối đa 1–2 version song song, có deprecation header (`Sunset`, `Deprecation`), thông báo
consumer, đo traffic version cũ trước khi tắt. Không version từng field tùy tiện.

---

### Q33. Idempotency cho API POST thanh toán? [M]

**Trả lời:** Client gửi `Idempotency-Key` (UUID) cùng request. Server lưu key + trạng thái +
response trong bảng có unique constraint, trong cùng transaction với side effect hoặc qua
outbox.

```python
def create_payment(key: str, body: PaymentIn, uow: UnitOfWork) -> PaymentOut:
    existing = uow.idempotency.get(key)
    if existing:
        if existing.request_hash != hash_body(body):
            raise Conflict("key reused with different payload")
        return existing.response
    payment = process(body)
    uow.idempotency.add(key, hash_body(body), payment)
    return payment
```

Xử lý concurrent: insert key trước với trạng thái `in_progress`, request sau nhận 409/202 hoặc
chờ; TTL key theo nghiệp vụ (24h–7 ngày). Đảm bảo operation bên trong cũng idempotent (gọi
gateway với idempotency key riêng).

---

### Q34. Authentication và authorization khác nhau? JWT hay session? [M]

**Trả lời:** AuthN xác định **bạn là ai**; AuthZ xác định **bạn được làm gì**. Luôn kiểm tra
AuthZ ở server cho từng resource, không dựa vào việc UI ẩn nút.

| Tiêu chí | Session (cookie) | JWT |
|---|---|---|
| Revoke | Tức thì (server-side) | Khó, cần blacklist/version |
| State | Stateful | Stateless |
| Phù hợp | Web app cùng domain | Service-to-service, mobile/API |
| Rủi ro | CSRF | XSS nếu lưu localStorage, token lộ |

Cookie session nên `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, có CSRF token cho state-changing
request. JWT cần kiểm tra `iss`, `aud`, `exp`, thuật toán (không nhận `alg=none`), key rotation
(`kid`). Access token ngắn hạn + refresh token xoay vòng. Phân quyền theo role/scope và kiểm tra
ownership/tenant ở query.

---

### Q35. Thiết kế pagination, filter, sort cho API public? [M]

**Trả lời:** Chuẩn hóa tham số, giới hạn để chống lạm dụng:

```
GET /orders?status=paid&created_from=...&sort=-created_at&limit=50&cursor=...
```

- `limit` mặc định 20, tối đa 100.
- Cursor opaque (base64 + chữ ký) thay vì offset cho dữ liệu lớn.
- Whitelist field sort/filter; không nhận tên cột tùy ý (SQL injection/DoS).
- Trả metadata: `next_cursor`, `has_more`; tổng count chỉ khi cần (count trên bảng lớn rất tốn).
- Filter theo tenant/permission luôn áp ở server.

Tài liệu hóa semantics: sort ổn định, tie-breaker, filter null. Rate limit theo user/IP và trả
`429` + `Retry-After`.

---

## 6. Async và concurrency

### Q36. Event loop hoạt động thế nào? Vì sao một hàm blocking làm sập cả app? [M]

**Trả lời:** Event loop chạy một thread, lần lượt chạy coroutine đến `await` rồi chuyển sang
task khác. Nếu một coroutine gọi hàm blocking (sleep, DB sync, đọc file lớn, CPU nặng), loop
không thể chạy task khác → mọi request bị treo.

```python
# sai trong async endpoint
@app.get("/report")
async def report():
    return requests.get("https://slow.example.com").json()   # block loop

# đúng
@app.get("/report")
async def report():
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get("https://slow.example.com")
        return r.json()
```

Với thư viện sync không có bản async, dùng `await asyncio.to_thread(...)` hoặc thread pool có
giới hạn; với CPU nặng, dùng process pool/queue. Đo event loop lag để phát hiện.

---

### Q37. Khi nào dùng async, thread, process? [M]

**Trả lời:** Chọn theo loại công việc:

| Loại | Công cụ | Ví dụ |
|---|---|---|
| I/O chờ nhiều, đồng thời cao | `asyncio` | HTTP, DB async, WebSocket |
| I/O blocking, thư viện sync | ThreadPool | SDK cũ, file, DNS |
| CPU-bound | ProcessPool / job worker | resize ảnh, parse lớn, ML |
| Tác vụ dài, cần retry/scale riêng | Queue + worker | email, export, webhook |

Async không nhanh hơn cho CPU; GIL khiến thread không song song CPU. Đừng trộn async và thread
tùy tiện — biết rõ chỗ nào chặn. Với throughput I/O vừa phải, sync + thread pool đôi khi đơn
giản và ổn định hơn async toàn phần.

---

### Q38. Structured concurrency và cancellation trong asyncio? [M]

**Trả lời:** Dùng `asyncio.TaskGroup` (3.11+) để đảm bảo task con được chờ và hủy đúng khi một
task lỗi; tránh `create_task` rồi bỏ quên (task "mồ côi").

```python
async def fetch_all(ids: list[int]) -> list[str]:
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch(i)) for i in ids]
    return [t.result() for t in tasks]
```

`CancelledError` phải được re-raise (hoặc cleanup rồi raise), không nuốt. Dùng `try/finally` để
đóng connection/file. Đặt timeout bằng `asyncio.timeout()` (3.11+) bao quanh nhóm thao tác. Khi
service shutdown, hủy task và chờ chúng kết thúc có giới hạn.

---

### Q39. Timeout nên đặt ở những đâu? [M]

**Trả lời:** Mọi I/O ra ngoài đều cần timeout: HTTP client, DB statement, Redis, queue, DNS.
Timeout phải **nhỏ hơn** timeout của caller để lỗi lan có ngữ nghĩa.

```python
async with httpx.AsyncClient(timeout=httpx.Timeout(3.0, connect=1.0)) as c:
    r = await c.get(url)

async with asyncio.timeout(5):
    data = await service.call()
```

Đặt `statement_timeout`/`lock_timeout` ở Postgres, `socket_timeout` ở Redis. Phân biệt connect
vs read timeout. Không retry timeout vô hạn; kèm deadline tổng (`context deadline`) để tránh
"retry storm". Log timeout với dependency, operation, duration.

---

### Q40. Race condition trong Python service — ví dụ và cách tránh? [M]

**Trả lời:** Race xảy ra khi nhiều thread/process/task cùng đọc-sửa trạng thái chia sẻ. Trong
một process, `+=` trên biến không nguyên tử; trong nhiều instance, cần lock/atomic ở store.

```python
# sai: mất update khi 2 thread cùng chạy
counter += 1

# đúng trong process
with lock:
    counter += 1

# đúng giữa nhiều instance: dùng DB/Redis atomic
redis.incr("counter")
```

Với nghiệp vụ "kiểm tra rồi ghi" (check-then-act), dùng unique constraint, conditional update
(`UPDATE ... WHERE status='pending'`), row lock, hoặc distributed lock có TTL/fencing token.
Distributed lock không thay thế được transaction — luôn thiết kế idempotent.

---

### Q41. Backpressure là gì? Áp dụng với `asyncio.Queue` thế nào? [M]

**Trả lời:** Backpressure là cơ chế buộc producer chậm lại khi consumer không theo kịp, thay vì
tích lũy vô hạn gây OOM/latency. Queue có `maxsize` sẽ block `put` khi đầy.

```python
queue: asyncio.Queue[Item] = asyncio.Queue(maxsize=100)

async def producer(items):
    for item in items:
        await queue.put(item)      # chờ khi đầy

async def worker():
    while True:
        item = await queue.get()
        try:
            await handle(item)
        finally:
            queue.task_done()
```

Chọn `maxsize` theo memory và throughput; đo độ sâu queue, thời gian chờ. Với hệ phân tán,
backpressure thể hiện qua consumer lag, rate limit, giới hạn concurrency, và trả 429/503 thay vì
nhận hết. Không dùng queue không giới hạn cho luồng không kiểm soát.

---

### Q42. GIL ảnh hưởng gì, và Python 3.13 free-threaded có thay đổi gì? [M]

**Trả lời:** Trong CPython chuẩn, GIL cho phép một thread chạy bytecode tại một thời điểm, nên
thread không tăng tốc CPU-bound; vẫn hữu ích cho I/O vì GIL được nhả khi chờ. NumPy/C-extension
có thể nhả GIL.

Python 3.13 có bản **free-threaded** (PEP 703, `python3.13t`) thử nghiệm, bỏ GIL nhưng có thể
chậm hơn cho single-thread và chưa tương thích mọi extension. Không mặc định cho production
ngay; đánh giá dependency, benchmark workload. Với CPU-bound hiện tại, process pool/worker vẫn
là lựa chọn ổn định.

**Bẫy:** nói "GIL làm Python không đa luồng" là sai — I/O vẫn song song; chỉ CPU bị giới hạn.

---

### Q43. Multiprocessing: pitfall thường gặp? [M]

**Trả lời:** Chọn start method (`fork` trên Linux, `spawn` trên macOS/Windows). `spawn` không
kế thừa state toàn cục, nên hàm/đối tượng phải **picklable** và import được ở top-level. Không
chia sẻ connection DB/socket/lock qua process một cách ngây thơ.

```python
from concurrent.futures import ProcessPoolExecutor

def resize(path: str) -> str:      # top-level, picklable
    ...

if __name__ == "__main__":         # bắt buộc với spawn
    with ProcessPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(resize, paths))
```

Mỗi process có memory riêng → copy dữ liệu lớn rất tốn; dùng chunk, shared memory hoặc worker
đọc từ storage. Tránh tạo pool lồng nhau. Theo dõi memory/CPU vì pool giữ process sống.

---

### Q44. Dùng SQLAlchemy sync trong app FastAPI async — được không? [M]

**Trả lời:** Được nhưng phải hiểu hệ quả. Nếu endpoint `async def` mà gọi ORM sync, nó chặn
event loop. Ba lựa chọn:

1. Endpoint `def` (FastAPI chạy trong threadpool) + ORM sync — đơn giản, hiệu năng ổn với tải
   vừa.
2. Dùng async engine/driver (`asyncpg`, `psycopg` async) + `AsyncSession` trong endpoint async.
3. Bọc lời gọi sync bằng `asyncio.to_thread`, nhưng cẩn thận session/transaction không thread-safe
   và pool thread có giới hạn.

Không trộn session sync giữa nhiều thread. Với async session, mọi thao tác phải `await`, không
lazy-load ngoài context (dùng eager load). Chọn một mô hình nhất quán cho cả app.

---

### Q45. Graceful shutdown cho worker/API? [M]

**Trả lời:** Khi nhận SIGTERM: ngừng nhận request/job mới, hoàn thành việc đang chạy trong
thời gian cho phép, đóng resource, thoát. Kubernetes gửi SIGTERM rồi SIGKILL sau
`terminationGracePeriodSeconds`.

```python
async def lifespan(app):
    stop = asyncio.Event()
    loop.add_signal_handler(signal.SIGTERM, stop.set)
    yield
    await shutdown(stop)          # dừng nhận, chờ task, đóng pool
```

Với consumer: ngừng poll, `await` message hiện tại, commit/ack, rồi đóng. Đặt timeout cho bước
chờ để không treo quá grace period. API cần readiness probe fail trước khi tắt để load balancer
ngừng route. Test shutdown bằng cách gửi signal trong integration test.

---

### Q46. Retry, backoff, jitter và circuit breaker? [M]

**Trả lời:** Chỉ retry lỗi **transient** (timeout, 429, 502/503/504, connection reset) và chỉ
khi operation **idempotent**. Backoff exponential có jitter để tránh đồng loạt; giới hạn số lần
và tổng thời gian.

```python
for attempt in range(5):
    try:
        return call()
    except RETRYABLE as exc:
        if attempt == 4:
            raise
        delay = min(10, 0.2 * 2 ** attempt)
        time.sleep(delay * random.uniform(0.5, 1.5))
```

Circuit breaker mở khi tỉ lệ lỗi vượt ngưỡng, fail fast một thời gian rồi half-open thử lại.
Kết hợp timeout, bulkhead (giới hạn concurrency) và fallback. Không retry ở nhiều tầng cùng lúc
(retry amplification); đặt retry ở một nơi có ngữ nghĩa nghiệp vụ.

---

### Q47. Các thuật toán rate limiting và chọn cái nào? [M]

**Trả lời:**

| Thuật toán | Đặc điểm | Phù hợp |
|---|---|---|
| Fixed window | Đơn giản, burst ở biên | Giới hạn thô |
| Sliding window log | Chính xác, tốn memory | Giới hạn nghiêm ngặt |
| Sliding window counter | Gần đúng, rẻ | API phổ biến |
| Token bucket | Cho burst có kiểm soát | API, traffic tự nhiên |
| Leaky bucket | Làm phẳng output | Bảo vệ downstream |

Với một instance, token bucket trong memory đủ; nhiều instance cần Redis (Lua script để atomic)
hoặc gateway. Trả `429` + `Retry-After`, kèm header `X-RateLimit-*`. Rate limit theo API key/
user, không chỉ IP (NAT). Có giới hạn riêng cho endpoint nặng.

**Bẫy:** fixed window cho phép gấp đôi request ở ranh giới hai window.

---

### Q48. Trace context lan truyền qua async và queue thế nào? [M]

**Trả lời:** Dùng `contextvars` để giữ request id/trace id; chúng tự theo task async nhưng
**không** tự theo thread/process. Khi submit sang thread/process hoặc publish message, phải
truyền context tường minh.

```python
import contextvars

request_id: contextvars.ContextVar[str] = contextvars.ContextVar("request_id")

# thread
ctx = contextvars.copy_context()
await asyncio.to_thread(ctx.run, handle, payload)

# message
publish({..., "traceparent": get_traceparent()})
```

Tuân theo W3C Trace Context (`traceparent`) để đi qua HTTP/queue. Ở consumer, extract và tạo
span con. Log JSON kèm `trace_id`, `request_id`, `user_id` (đã ẩn danh). Không dựa vào global
biến cho correlation id.

---

## 7. Internals và typing nâng cao

### Q49. Reference counting và cyclic GC hoạt động ra sao? [M]

**Trả lời:** CPython dùng reference counting làm cơ chế chính: mỗi object có `ob_refcnt`, về 0
thì giải phóng ngay. Chu trình tham chiếu (A→B→A) không về 0, nên generational GC quét định kỳ
để phá vòng.

```python
import gc, sys

a = []
a.append(a)                 # cycle
sys.getrefcount(a)          # >1
del a
gc.collect()                # mới giải phóng
```

Có thể tạm tắt GC cho workload ngắn (`gc.disable()`) để giảm pause, nhưng phải hiểu memory.
`__del__` trong cycle có thể làm object không được thu gom đúng ở version cũ; tránh `__del__`
cho cleanup, dùng context manager/`weakref.finalize`. Theo dõi `gc.get_stats()` nếu latency
nhạy cảm.

---

### Q50. `__slots__` và attribute lookup? [M]

**Trả lời:** Mặc định instance có `__dict__` (hash table) lưu attribute, tốn memory và cho phép
thêm attribute tùy ý. `__slots__` khai báo cố định, lưu trong array, giảm memory và tăng tốc
truy cập nhẹ.

```python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

p = Point(1, 2)
# p.z = 3  -> AttributeError
```

Dùng cho object số lượng lớn (hàng triệu record), không cần `__dict__`. Không kế thừa `__slots__`
một cách cẩu thả (subclass vẫn có `__dict__` nếu không khai báo). Dataclass có `slots=True`.
Không lạm dụng khi cần linh hoạt/serialize.

---

### Q51. Descriptor là gì? `property` liên quan thế nào? [M]

**Trả lời:** Descriptor là object định nghĩa `__get__`/`__set__`/`__delete__`, được gọi tự động
khi attribute được truy cập trên class. `property` là một descriptor chuẩn; ORM cũng dùng
descriptor để theo dõi thay đổi.

```python
class Positive:
    def __set_name__(self, owner, name):
        self.name = "_" + name

    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return getattr(obj, self.name)

    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError("must be positive")
        setattr(obj, self.name, value)

class Product:
    price = Positive()
```

Data descriptor (`__set__`) ưu tiên hơn `__dict__`; non-data descriptor (`__get__` only) không.
Hiểu điều này để debug ORM, `functools.cached_property` (non-data) và class attribute.

---

### Q52. TypeVar, bound và variance? [M]

**Trả lời:** `TypeVar` biểu diễn quan hệ giữa các kiểu. `bound` giới hạn kiểu; `constraints`
liệt kê tập hữu hạn; variance quyết định generic con có thay thế được generic cha không.

```python
from typing import TypeVar, Protocol

class Comparable(Protocol):
    def __lt__(self, other: "Comparable") -> bool: ...

T = TypeVar("T", bound=Comparable)

def max_of(items: list[T]) -> T:
    return max(items)
```

Với container chỉ đọc, dùng covariant (`Sequence[T]`); chỉ ghi, contravariant (`Callable[[T], None]`);
vừa đọc vừa ghi, invariant (`list[T]`). Python 3.12 dùng cú pháp `class Box[T]:` và `type Alias = ...`
(3.12) — hữu ích nhưng cân nhắc tương thích công cụ.

---

### Q53. Protocol và structural typing trong codebase lớn? [M]

**Trả lời:** Protocol cho phép định nghĩa hợp đồng theo hành vi, giảm phụ thuộc giữa package và
dễ fake trong test. Đặt Protocol ở **nơi tiêu thụ** (consumer) thay vì nơi implement để tránh
import vòng.

```python
from typing import Protocol

class BlobStore(Protocol):
    def put(self, key: str, data: bytes) -> None: ...
    def get(self, key: str) -> bytes: ...

class S3Store:                     # implement độc lập
    def put(self, key: str, data: bytes) -> None: ...
    def get(self, key: str) -> bytes: ...

class InMemoryStore:
    ...
```

Chỉ định nghĩa method thực sự dùng (interface segregation). Với class có sẵn không sửa được,
Protocol là lựa chọn tốt hơn adapter/wrapper. Cẩn thận: structural typing có thể vô tình khớp
class không liên quan — đặt tên rõ và dùng test.

---

### Q54. TypedDict, dataclass hay Pydantic? [M]

**Trả lời:** Chọn theo mục đích:

| Công cụ | Dùng cho | Runtime validation |
|---|---|---|
| `TypedDict` | Shape của dict JSON, config đơn giản | Không |
| `dataclass` | Domain/value object nội bộ | Không (trừ `__post_init__`) |
| Pydantic | Boundary request/response/env | Có |
| `NamedTuple` | Record nhỏ, immutable, tuple-like | Không |

```python
from typing import TypedDict

class UserJson(TypedDict):
    id: int
    email: str
```

Không dùng `TypedDict` cho dữ liệu không tin cậy mà không validate; type checker không bảo vệ
runtime. Không dùng Pydantic cho object domain nếu muốn domain không phụ thuộc framework.

---

### Q55. Làm sao áp dụng mypy/pyright mà không bị "Any lan tràn"? [M]

**Trả lời:** Bật dần strictness, ưu tiên boundary trước: public function, API schema, repository.
Cấm `Any` ngầm bằng `disallow_untyped_defs`, `disallow_any_generics`, `warn_return_any`. Khi gặp
`Any`, thay bằng Protocol/generic hoặc `cast` có kiểm chứng runtime.

```toml
[tool.mypy]
strict = true
warn_unused_ignores = true
warn_redundant_casts = true
```

Cho legacy: per-module override, `# type: ignore[code]` có lý do và ticket. Type check không
thay test; nó bắt lỗi cấu trúc, không bắt logic. Với thư viện thiếu stubs, tạo `.pyi` tối thiểu
hoặc dùng `types-*` package.

---

### Q56. `ParamSpec` và `Concatenate` giải quyết vấn đề gì? [M]

**Trả lời:** Giữ nguyên signature khi viết decorator/wrapper, thay vì dùng `*args, **kwargs` mất
type.

```python
from typing import ParamSpec, TypeVar, Callable
from functools import wraps

P = ParamSpec("P")
R = TypeVar("R")

def logged(fn: Callable[P, R]) -> Callable[P, R]:
    @wraps(fn)
    def inner(*args: P.args, **kwargs: P.kwargs) -> R:
        print("call", fn.__name__)
        return fn(*args, **kwargs)
    return inner
```

`Concatenate[Request, P]` dùng khi wrapper thêm tham số đầu (ví dụ inject `request`), phổ biến
với framework. Đây là kiến thức đánh dấu ứng viên đọc kỹ typing, nhưng chỉ nên dùng khi thật sự
cần — đừng làm API nội bộ phức tạp quá mức.

---

### Q57. Dataclass: các option quan trọng và bẫy? [M]

**Trả lời:** `frozen` (immutable + hash), `slots` (memory), `kw_only` (tránh nhầm thứ tự),
`order` (so sánh), `eq`, `repr`, `match_args`. `field(default_factory=...)` cho mutable default.

```python
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True, kw_only=True)
class Config:
    retries: int = 3
    hosts: tuple[str, ...] = field(default_factory=tuple)
```

Bẫy: default mutable (`[]`) bị Python chặn; `frozen` chỉ nông; `slots=True` không tương thích
với một số thư viện dùng `__dict__`; kế thừa dataclass có default/non-default cần `kw_only` để
tránh lỗi thứ tự. `__post_init__` dùng để validate/derive, nhưng với `frozen` phải
`object.__setattr__`.

---

### Q58. Enum, `StrEnum`, `Literal` và sentinel? [M]

**Trả lời:** `Enum` cho tập hằng có tên, tránh "magic string". `StrEnum` (3.11+) kế thừa `str`,
tiện serialize JSON và so sánh. `Literal` cho type checker giới hạn giá trị, không validate
runtime.

```python
from enum import StrEnum
from typing import Literal

class Status(StrEnum):
    PENDING = "pending"
    PAID = "paid"

Mode = Literal["read", "write"]

def set_status(s: Status) -> None:
    ...
```

Với giá trị "không có", dùng `None` nếu ngữ nghĩa rõ; sentinel object (`MISSING = object()`)
khi cần phân biệt "không truyền" với `None`. Lưu enum vào DB dưới dạng string ổn định, không
lưu thứ tự ordinal. Thêm giá trị mới phải backward-compatible với consumer cũ.

---

## 8. Kiến trúc, cache, queue

### Q59. Modular monolith hay microservices? [M]

**Trả lời:** Mặc định **modular monolith** cho team nhỏ/vừa: boundary module rõ, deploy đơn
giản, transaction dễ, debug dễ. Chỉ tách service khi có lý do cụ thể: scaling độc lập, team
ownership, vòng đời release khác, công nghệ khác, hoặc isolation lỗi.

| Yếu tố | Monolith | Microservices |
|---|---|---|
| Giao dịch | Dễ, ACID | Saga/eventual |
| Deploy | Một artifact | Nhiều pipeline |
| Scale | Scale cả app | Scale từng service |
| Debug | Một process | Distributed tracing |
| Team | Phối hợp trong repo | Autonomy cao |

Tách theo **business capability**, không theo tầng kỹ thuật. Bắt đầu modular, đo pain point
thật (deploy chậm, coupling, scale) rồi mới tách. Microservices là đánh đổi vận hành, không phải
mục tiêu.

---

### Q60. Layered, hexagonal hay clean architecture — khác gì thực tế? [M]

**Trả lời:** Cả ba đều nhằm tách domain khỏi hạ tầng; khác ở cách diễn đạt và mức nghi thức.

- **Layered**: controller → service → repository. Dễ hiểu, dễ lạm dụng thành service "god".
- **Hexagonal (ports & adapters)**: domain định nghĩa port (Protocol), adapter cài đặt (DB,
  HTTP, queue). Domain không import framework.
- **Clean**: thêm use-case/interactor, dependency rule hướng vào trong.

```python
class OrderRepo(Protocol):
    def save(self, order: Order) -> None: ...

class PlaceOrder:
    def __init__(self, repo: OrderRepo, clock: Clock) -> None: ...
    def execute(self, cmd: PlaceOrderCmd) -> Order: ...
```

Thực tế: đừng tạo 5 lớp cho CRUD đơn giản. Dùng boundary rõ cho phần nghiệp vụ phức tạp, giữ
CRUD đơn giản. Dependency rule quan trọng hơn tên pattern.

---

### Q61. Giao dịch xuyên module/service nên xử lý thế nào? [M]

**Trả lời:** Trong một service/DB, dùng transaction và boundary rõ. Xuyên service, tránh
distributed transaction (2PC) trừ khi bắt buộc; dùng **eventual consistency** với outbox +
idempotent consumer, hoặc saga có bước bù.

```text
TX: insert order + insert outbox(order_created)  -> commit
Relay: publish outbox -> broker (at-least-once)
Consumer: upsert theo event_id (idempotent)
```

Chấp nhận dữ liệu trễ; thiết kế UI/flow chịu được trạng thái trung gian (`pending`, `processing`).
Định nghĩa rõ thứ tự event (partition key), chống mất/trùng, và cách reconciliation khi lệch.
Không gọi trực tiếp 3 service trong một request nếu có thể dùng orchestration bền vững.

---

### Q62. Các chiến lược cache phổ biến? [M]

**Trả lời:**

| Chiến lược | Cách làm | Ghi chú |
|---|---|---|
| Cache-aside | App đọc cache, miss thì DB rồi set | Phổ biến, dễ kiểm soát |
| Read-through | Cache tự load qua loader | Cần cache hỗ trợ |
| Write-through | Ghi cache + DB cùng lúc | Nhất quán hơn, chậm ghi |
| Write-behind | Ghi cache, async flush DB | Rủi ro mất dữ liệu |
| Refresh-ahead | Làm mới trước khi hết hạn | Tránh miss, tốn tài nguyên |

Với cache-aside, TTL hợp lý + invalidate khi ghi. Key phải bao gồm tenant/version. Đo hit rate,
latency, memory, eviction. Không cache dữ liệu nhạy cảm chưa mã hóa; không cache kết quả phụ
thuộc quyền người dùng nếu key không chứa user/role.

---

### Q63. Cache invalidation và stampede? [M]

**Trả lời:** Invalidate khi dữ liệu nguồn thay đổi: xóa key sau commit (không phải trước), hoặc
dùng version trong key. Chấp nhận một khoảng stale ngắn tùy nghiệp vụ.

Stampede xảy ra khi key hot hết hạn và hàng loạt request cùng load DB. Giảm bằng:

- Lock/`singleflight` theo key để chỉ một request load.
- TTL có jitter để không hết hạn đồng loạt.
- Stale-while-revalidate: trả dữ liệu cũ, refresh nền.
- Prewarm cho dữ liệu quan trọng.

```python
value = cache.get(key)
if value is None:
    with redis.lock(f"lock:{key}", timeout=5):
        value = cache.get(key) or load_and_set(key)
```

Cẩn thận lock hết hạn khi load lâu (dùng fencing hoặc timeout load). Với Redis cluster, lock
phải cùng slot.

---

### Q64. Làm sao giữ cache và DB nhất quán? [M]

**Trả lời:** Không có nhất quán tuyệt đối nếu cache tách rời; chọn **eventual** và giới hạn cửa
sổ stale. Thứ tự an toàn: commit DB → invalidate cache (xóa, không set giá trị cũ). Nếu set
trước khi commit, request khác có thể đọc giá trị mới rồi bị rollback.

Với yêu cầu cao, dùng CDC (Debezium) phát thay đổi từ WAL để invalidate/rebuild, hoặc outbox
event. Định kỳ reconciliation để phát hiện lệch. Tránh "double delete" phức tạp nếu TTL ngắn đã
đủ. Ghi rõ semantics: cache có thể trả dữ liệu cũ tối đa bao lâu.

---

### Q65. At-most-once, at-least-once, exactly-once? [M]

**Trả lời:** Broker thường đảm bảo at-least-once; exactly-once thật rất khó và thường chỉ trong
phạm vi một system (Kafka transactions). Cách thực dụng: **at-least-once + idempotent consumer**
= hiệu ứng exactly-once về mặt nghiệp vụ.

```python
def handle(msg: Message, uow: UnitOfWork) -> None:
    if uow.processed.exists(msg.id):
        return
    apply(msg)
    uow.processed.add(msg.id)
    uow.commit()
```

Unique constraint trên `event_id` là chốt chặn cuối. At-most-once (ack trước khi xử lý) có thể
mất message — chỉ dùng khi mất mát chấp nhận được (metric, log). Nêu rõ semantics trong tài liệu
và test case duplicate/out-of-order.

---

### Q66. Outbox pattern giải quyết gì? [M]

**Trả lời:** Tránh "dual write": ghi DB thành công nhưng publish message thất bại (hoặc ngược
lại). Ghi event vào bảng outbox **cùng transaction** với thay đổi nghiệp vụ; một relay đọc và
publish, đánh dấu đã gửi.

```sql
CREATE TABLE outbox (
  id BIGSERIAL PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
```

Relay có thể là worker poll (`FOR UPDATE SKIP LOCKED`) hoặc CDC. Đảm bảo publish at-least-once
và consumer idempotent. Dọn outbox cũ theo retention. Theo dõi lag (tuổi event chưa publish) và
dead-letter khi publish lỗi mãi.

---

### Q67. Retry, DLQ và poison message trong queue? [M]

**Trả lời:** Retry có backoff cho lỗi transient; giới hạn số lần; sau đó đưa vào **dead-letter
queue** để không chặn partition. Poison message (luôn fail do dữ liệu xấu) phải được cô lập,
alert, và có công cụ replay sau khi sửa.

```python
try:
    handle(msg)
except TransientError:
    raise                      # để broker redeliver
except PermanentError as exc:
    dlq.publish(msg, reason=str(exc))
    ack(msg)
```

Phân loại lỗi rõ ràng; không retry lỗi validation. Ghi metadata: số lần thử, lỗi cuối, trace id.
Có dashboard DLQ size và runbook xử lý. Với Kafka, cân nhắc retry topic thay vì block partition.

---

### Q68. Saga và compensation? [M]

**Trả lời:** Saga chia giao dịch phân tán thành chuỗi bước local transaction; mỗi bước có hành
động bù (compensation) khi bước sau fail. Có hai kiểu: **orchestration** (một coordinator gọi
từng bước) và **choreography** (service phản ứng event).

```text
ReserveStock -> ChargePayment -> CreateShipment
     | fail            | fail             | fail
ReleaseStock     RefundPayment      CancelShipment
```

Compensation không phải rollback hoàn hảo: có thể fail, có thể đã có side effect bên ngoài
(email đã gửi). Thiết kế bước bù idempotent, có retry, và trạng thái cuối cùng rõ (`cancelled`,
`needs_manual_review`). Ghi log/audit đầy đủ. Với ít service, 2PC hoặc một DB chung đơn giản hơn.

---

### Q69. Giao tiếp sync (REST/gRPC) hay async (queue)? [M]

**Trả lời:** Sync khi caller cần kết quả ngay để tiếp tục và coupling chấp nhận được (đọc dữ
liệu, validate, thao tác người dùng chờ). Async khi tác vụ dài, cần retry/scale độc lập, hoặc
nhiều consumer quan tâm.

| Tiêu chí | Sync | Async |
|---|---|---|
| Latency | Thấp, trực tiếp | Trễ, eventual |
| Coupling | Thời gian (caller chờ) | Lỏng hơn |
| Lỗi | Lan ngay, cần timeout/retry | Cô lập, DLQ |
| Debug | Dễ trace request | Cần trace qua message |
| Scale | Theo request | Theo backlog |

REST cho API public/đơn giản; gRPC cho nội bộ hiệu năng cao, schema chặt; queue cho workflow,
email, export, đồng bộ. Có thể kết hợp: API trả `202 Accepted` + `job_id`, client poll/WS.

---

### Q70. Multi-tenancy: chọn mô hình dữ liệu nào? [M]

**Trả lời:** Ba mô hình: database riêng, schema riêng, shared table + `tenant_id`.

| Mô hình | Cô lập | Chi phí | Phù hợp |
|---|---|---|---|
| DB riêng | Cao | Cao | Enterprise, compliance |
| Schema riêng | Trung bình | Trung bình | Vài chục tenant lớn |
| Shared + `tenant_id` | Thấp hơn | Thấp | SaaS nhiều tenant nhỏ |

Với shared table, mọi query **bắt buộc** có `tenant_id`; dùng row-level security nếu DB hỗ trợ,
middleware set tenant từ token, và test tự động chống rò rỉ. Index bắt đầu bằng `tenant_id`.
Không tin `tenant_id` từ client. Có cơ chế migrate/backfill theo tenant và xóa dữ liệu tenant
đúng quy định.

---

### Q71. Feature flag và backward-compatible schema? [M]

**Trả lời:** Feature flag tách deploy khỏi release, cho phép bật/tắt theo user/tenant/tỉ lệ.
Flag phải có owner, ngày hết hạn, và được dọn sau khi rollout xong — nếu không sẽ thành "flag
nghĩa địa".

```python
if flags.enabled("new_checkout", tenant=tenant_id, default=False):
    return new_checkout(cmd)
return old_checkout(cmd)
```

Schema change theo expand/contract; code cũ và mới cùng chạy trong rollout. Không đổi semantics
của field cũ; thêm field mới optional. Với flag ảnh hưởng dữ liệu, đảm bảo cả hai nhánh ghi
được dữ liệu tương thích. Theo dõi metric riêng cho nhánh flag để rollback dựa trên số liệu.

---

### Q72. Back-of-envelope capacity estimate cho service Python? [M]

**Trả lời:** Ước lượng thô: số request/ngày → QPS trung bình → peak (×3–5). Mỗi request chiếm
bao lâu CPU, bao nhiêu query, payload bao nhiêu. Từ đó tính số worker, DB connection, memory,
bandwidth.

Ví dụ: 5 triệu request/ngày ≈ 58 QPS trung bình, peak 300 QPS. Nếu mỗi request 20ms CPU + 30ms
DB, cần ~6–9 worker cho CPU (300×0.02/1) và DB pool đủ cho concurrency thực tế. Đừng quên
headroom 30–50%, connection limit, và chi phí egress.

Trình bày giả định rõ, đơn vị rõ, và nói cần đo lại bằng load test. Con số tuyệt đối ít quan
trọng hơn cách lập luận và kiểm chứng.

---

## 9. Security và observability

### Q73. OWASP Top 10 trong bối cảnh Python? [M]

**Trả lời:** Các nhóm thường gặp:

- **Broken access control**: thiếu kiểm tra ownership/tenant → IDOR.
- **Injection**: SQL nối chuỗi, command injection (`shell=True`), template injection.
- **Insecure design**: thiếu rate limit, reset password yếu, tin client.
- **Cryptographic failures**: lưu password plain/MD5, hardcode key.
- **Auth failures**: session fixation, token không hết hạn, thiếu MFA cho admin.
- **Vulnerable components**: dependency cũ, CVE.
- **Logging/monitoring failures**: không phát hiện tấn công, log lộ PII.

Phòng thủ: parameterized query/ORM đúng cách, allowlist input, escape output, least privilege,
secret manager, dependency scan, test authorization cho từng endpoint. Không tự viết crypto;
dùng `hashlib.scrypt`/Argon2 qua thư viện chuẩn.

---

### Q74. Quản lý secret và xoay khóa? [M]

**Trả lời:** Không commit secret, không đặt trong image, không log. Dùng secret manager (AWS
Secrets Manager, Vault, KMS) hoặc biến môi trường được inject bởi platform. App đọc lúc khởi
động, cache trong memory, không ghi ra file.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env")
    database_url: str
    jwt_key: str
```

Xoay khóa: hỗ trợ nhiều key (`kid`), key mới để sign, key cũ chỉ verify trong thời gian chuyển
tiếp; rotate DB password theo quy trình có rollback. Phân quyền đọc secret theo service identity.
Scan repo bằng `gitleaks`; nếu lộ, revoke ngay, không chỉ xóa commit.

---

### Q75. Log thế nào để vừa debug được vừa không lộ dữ liệu? [M]

**Trả lời:** Log **structured JSON**, có level, timestamp UTC, service, environment, `request_id`,
`trace_id`, `user_id` (pseudonymous), event name, duration. Không log password, token, số thẻ,
CVV, full PII; mask/redact trước khi log.

```python
logger.info("order.created", extra={
    "order_id": str(order.id),
    "tenant_id": str(order.tenant_id),
    "amount_cents": order.amount,
})
```

Không nối chuỗi thủ công; dùng logger adapter/filter để thêm context và redact. Tránh log trong
vòng lặp lớn (nhiễu, chậm). Log lỗi kèm stack trace nhưng không trả ra client. Có retention và
quyền truy cập log; audit log tách khỏi application log cho hành động nhạy cảm.

---

### Q76. Metrics, tracing, SLO và alert? [M]

**Trả lời:** Ba trụ cột: logs (sự kiện), metrics (xu hướng), traces (luồng request). Dùng RED
(Rate, Errors, Duration) cho service và USE (Utilization, Saturation, Errors) cho resource.

```text
http_requests_total{route,status}
http_request_duration_seconds{route}     # histogram -> p95/p99
db_pool_in_use / db_pool_size
queue_lag_seconds
```

SLO ví dụ: 99.9% request `/checkout` < 500ms trong 30 ngày; error budget 0.1%. Alert trên
**triệu chứng người dùng** (SLO burn rate, error rate, latency) thay vì chỉ CPU. Mỗi alert phải
có runbook, owner, severity. Trace sampling hợp lý (head/tail) để giữ chi phí trong kiểm soát.

---

## 10. System design nhỏ

### Q77. Thiết kế URL shortener? [M]

**Trả lời:** Yêu cầu: tạo short link, redirect nhanh, thống kê click, chống lạm dụng. Ước lượng
đọc >> ghi.

- **API**: `POST /links` (auth, rate limit) → `{code, short_url}`; `GET /{code}` → 302/301.
- **Code**: base62 từ ID tăng dần (khó đoán nếu cần) hoặc random 7 ký tự + unique constraint;
  tránh đoán được link riêng tư.
- **Storage**: bảng `links(code PK, target_url, owner_id, expires_at, created_at)`; cache
  Redis `code -> url` TTL.
- **Redirect**: 302 để còn đo click; 301 cache mạnh hơn nhưng khó thay đổi.
- **Analytics**: ghi event async (queue) `code, ts, referrer, country`, aggregate sau; không
  làm chậm redirect.
- **Abuse**: rate limit, kiểm tra malware/allowlist, chặn open redirect, quota theo user.
- **Scale**: cache hit cao, DB chỉ đọc khi miss; partition theo code nếu cần.

Nêu trade-off: ID tuần tự dễ đoán, random tốn kiểm tra trùng; 301 vs 302; analytics chính xác
vs hiệu năng.

---

### Q78. Thiết kế notification service (email/SMS/push)? [M]

**Trả lời:** Yêu cầu: gửi đa kênh, không mất, không trùng quá mức, retry, ưu tiên, opt-out.

- **API**: `POST /notifications` nhận template + recipient + data + kênh; trả `202` + id.
- **Pipeline**: validate → render template → enqueue theo kênh → provider adapter → callback
  trạng thái.
- **Idempotency**: `notification_id`/dedupe key; consumer idempotent.
- **Retry**: backoff theo lỗi provider; DLQ; phân loại permanent (invalid number) vs transient.
- **Rate limit**: theo provider và theo user (tránh spam), ưu tiên OTP/transactional.
- **Preference/opt-out**: kiểm tra trước khi gửi; lưu consent.
- **Observability**: tỉ lệ gửi thành công theo kênh/provider, latency, bounce, DLQ.
- **Compliance**: PII tối thiểu, retention, unsubscribe.

Nêu provider fallback (SMS provider A fail → B), template versioning, và test với provider giả.

---

### Q79. Thiết kế rate limiter phân tán? [M]

**Trả lời:** Dùng Redis + Lua để atomic token bucket/sliding window theo key (`user:{id}`,
`ip:{ip}`, `route`). Trả quyết định + remaining + reset.

```lua
-- token bucket rút gọn: lấy bucket, refill theo thời gian, trừ nếu đủ
local tokens = tonumber(redis.call('HGET', KEYS[1], 'tokens')) or capacity
local ts = tonumber(redis.call('HGET', KEYS[1], 'ts')) or now
local delta = math.max(0, now - ts)
tokens = math.min(capacity, tokens + delta * rate)
if tokens < cost then return 0 end
redis.call('HSET', KEYS[1], 'tokens', tokens - cost, 'ts', now)
redis.call('EXPIRE', KEYS[1], ttl)
return 1
```

Cân nhắc: clock source (dùng thời gian Redis), key theo tenant/user, giới hạn khác nhau theo
endpoint, fallback khi Redis down (fail-open hay fail-closed tùy rủi ro). Ở gateway có thể dùng
plugin sẵn. Đo tỉ lệ 429 và điều chỉnh ngưỡng theo dữ liệu thật.

---

### Q80. Thiết kế pipeline import CSV lớn? [M]

**Trả lời:** Yêu cầu: file vài GB, validate, chống trùng, báo lỗi theo dòng, không chặn API.

- **Upload**: presigned URL lên object storage; API tạo `import_job` (`pending`) trả `202`.
- **Worker**: stream file theo chunk (không đọc cả file), parse CSV, validate schema.
- **Idempotency**: `job_id` + checksum file; unique key nghiệp vụ (ví dụ `external_id`).
- **Ghi DB**: batch insert (`COPY` hoặc `executemany` theo chunk), transaction theo batch; lỗi
  một dòng ghi vào bảng `import_errors` kèm số dòng/lý do, không abort cả file nếu nghiệp vụ cho
  phép.
- **Progress**: cập nhật `processed_rows/total_rows`, cho client poll/WS.
- **Retry**: worker crash → resume từ checkpoint hoặc chạy lại idempotent.
- **Bảo mật**: giới hạn loại file/kích thước, quét malware, escape CSV injection khi export.
- **Kết thúc**: trạng thái `completed/partial/failed`, thông báo, link tải error report.

Nêu trade-off: validate all-or-nothing vs partial import; throughput vs transaction size; chi
phí lưu file và retention.

---

## 11. Coding

### C01. LRU cache không dùng `functools.lru_cache` [M]

```python
from collections import OrderedDict
from threading import Lock
from typing import Generic, TypeVar

K = TypeVar("K")
V = TypeVar("V")

class LRUCache(Generic[K, V]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self._data: OrderedDict[K, V] = OrderedDict()
        self._lock = Lock()

    def get(self, key: K) -> V | None:
        with self._lock:
            if key not in self._data:
                return None
            self._data.move_to_end(key)
            return self._data[key]

    def put(self, key: K, value: V) -> None:
        with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
            self._data[key] = value
            if len(self._data) > self.capacity:
                self._data.popitem(last=False)
```

**Điểm cộng:** `OrderedDict` cho O(1); nêu giới hạn (một process, không distributed), thread
safety, và khi nào dùng Redis/`cachetools`.

---

### C02. Decorator retry có backoff, jitter, filter exception [M]

```python
import random
import time
from functools import wraps
from typing import Callable, TypeVar, ParamSpec

P = ParamSpec("P")
R = TypeVar("R")

def retry(
    attempts: int = 4,
    base: float = 0.2,
    cap: float = 5.0,
    retry_on: tuple[type[Exception], ...] = (TimeoutError, ConnectionError),
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    def decorator(fn: Callable[P, R]) -> Callable[P, R]:
        @wraps(fn)
        def inner(*args: P.args, **kwargs: P.kwargs) -> R:
            for i in range(attempts):
                try:
                    return fn(*args, **kwargs)
                except retry_on:
                    if i == attempts - 1:
                        raise
                    delay = min(cap, base * 2 ** i)
                    time.sleep(delay * random.uniform(0.5, 1.5))
            raise AssertionError("unreachable")
        return inner
    return decorator
```

**Điểm cộng:** chỉ retry idempotent; không nuốt exception cuối; có thể nhận `retry_on` và
deadline tổng; logging/metric cho lần retry.

---

### C03. Async worker pool có giới hạn và shutdown sạch [M]

```python
import asyncio
from collections.abc import Awaitable, Callable

async def run_pool(
    items: list[int],
    handler: Callable[[int], Awaitable[None]],
    concurrency: int = 10,
) -> None:
    queue: asyncio.Queue[int | None] = asyncio.Queue(maxsize=concurrency * 2)

    async def worker() -> None:
        while True:
            item = await queue.get()
            try:
                if item is None:
                    return
                await handler(item)
            finally:
                queue.task_done()

    workers = [asyncio.create_task(worker()) for _ in range(concurrency)]
    try:
        for item in items:
            await queue.put(item)          # backpressure
        for _ in workers:
            await queue.put(None)          # sentinel
        await asyncio.gather(*workers)
    except BaseException:
        for w in workers:
            w.cancel()
        await asyncio.gather(*workers, return_exceptions=True)
        raise
```

**Điểm cộng:** queue có `maxsize`; sentinel đúng số worker; hủy task khi lỗi; không nuốt
`CancelledError`; có thể dùng `TaskGroup` để gọn hơn.

---

### C04. Keyset pagination với SQLAlchemy [M]

```python
from sqlalchemy import select, tuple_
from sqlalchemy.orm import Session
from app.models import Order

def page_orders(
    session: Session,
    tenant_id: int,
    cursor: tuple[str, int] | None = None,
    limit: int = 50,
) -> list[Order]:
    stmt = (
        select(Order)
        .where(Order.tenant_id == tenant_id)
        .order_by(Order.created_at.desc(), Order.id.desc())
        .limit(limit)
    )
    if cursor is not None:
        created_at, order_id = cursor
        stmt = stmt.where(
            tuple_(Order.created_at, Order.id) < (created_at, order_id)
        )
    return list(session.scalars(stmt))
```

**Điểm cộng:** index `(tenant_id, created_at DESC, id DESC)`; cursor ký/opaque; xử lý tie-breaker;
không dùng offset cho trang sâu.

---

### C05. Merge intervals [M]

```python
def merge(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    if not intervals:
        return []
    ordered = sorted(intervals)
    merged = [ordered[0]]
    for start, end in ordered[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged

assert merge([(1, 3), (2, 6), (8, 10), (15, 18)]) == [(1, 6), (8, 10), (15, 18)]
```

**Điểm cộng:** hỏi rõ interval đóng/mở, input rỗng, interval lồng nhau; độ phức tạp O(n log n)
do sort; nêu ứng dụng (lịch họp, range request, IP range).

---

### C06. Token bucket thread-safe [M]

```python
import threading
import time

class TokenBucket:
    def __init__(self, rate: float, capacity: float) -> None:
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.updated = time.monotonic()
        self.lock = threading.Lock()

    def allow(self, cost: float = 1.0) -> bool:
        with self.lock:
            now = time.monotonic()
            self.tokens = min(
                self.capacity,
                self.tokens + (now - self.updated) * self.rate,
            )
            self.updated = now
            if self.tokens >= cost:
                self.tokens -= cost
                return True
            return False
```

**Điểm cộng:** dùng `monotonic`; atomic trong lock; với distributed cần Redis/Lua; nêu burst
capacity và cách chọn `rate`/`capacity` theo traffic thật.

---

## 12. Tình huống

### M1. Sau deploy, p95 tăng gấp 3 nhưng CPU thấp. Bạn điều tra thế nào?

**Trả lời:** Kiểm tra dependency/DB trước vì CPU thấp gợi ý chờ I/O hoặc lock. So sánh trace
trước/sau deploy, query latency, pool wait, external call, N+1, cache hit. Xem thay đổi config/
migration/index. Nếu có flag, tắt để khoanh vùng. Mitigation: rollback nếu ảnh hưởng lớn; sau đó
xác định root cause, thêm regression test/benchmark và alert theo p95.

---

### M2. Postgres deadlock xuất hiện lẻ tẻ. Xử lý?

**Trả lời:** Đọc log deadlock (câu query, thứ tự lock). Nguyên nhân thường do hai transaction
khóa cùng bảng/row theo thứ tự khác nhau. Sửa bằng cách chuẩn hóa thứ tự update (ví dụ luôn theo
`id` tăng dần), giữ transaction ngắn, tránh khóa row rồi gọi network, dùng `SELECT ... FOR UPDATE`
có thứ tự. Thêm retry cho serialization/deadlock với backoff. Viết test concurrent nếu luồng
quan trọng.

---

### M3. Worker tăng RAM dần đến OOM. Bạn làm gì?

**Trả lời:** Xác nhận leak hay workload tăng: biểu đồ RSS theo thời gian, số job, kích thước
payload. Dùng `tracemalloc`, `memray`, `objgraph` để tìm object giữ lại. Kiểm tra cache/global
không giới hạn, queue không bound, session/connection không đóng, exception giữ traceback,
closure giữ reference. Sửa bằng bound cache/TTL, context manager, `weakref`, chunk xử lý. Đặt
memory limit và restart định kỳ chỉ là biện pháp tạm, không thay root cause.

---

### M4. Endpoint async đôi khi treo 5–10 giây. Nghi vấn gì?

**Trả lời:** Có call blocking trong event loop: ORM sync, `requests`, đọc file lớn, CPU, lock
thread, DNS. Đo event loop lag và trace; tìm span dài. Kiểm tra thư viện "async" nhưng thực chất
sync. Sửa: dùng client async, `to_thread` cho SDK sync, process pool cho CPU, timeout. Thêm
cảnh báo khi loop lag vượt ngưỡng. Test tải đồng thời để tái hiện.

---

### M5. Queue backlog tăng liên tục, consumer không theo kịp. Làm gì?

**Trả lời:** Đo arrival rate vs processing rate, thời gian xử lý mỗi message, lỗi/retry. Tăng
consumer có kiểm soát nếu downstream chịu được; tối ưu handler (batch, bỏ query thừa, cache);
tách topic theo độ ưu tiên; giảm producer nếu có thể. Kiểm tra poison message gây retry vô hạn.
Đặt alert theo **tuổi message** (lag time) thay vì chỉ số lượng. Nếu quá tải kéo dài, báo
stakeholder và áp dụng backpressure/429.

---

### M6. Cache stampede làm DB quá tải mỗi khi cache hết hạn. Giải pháp?

**Trả lời:** TTL jitter, lock/singleflight theo key, stale-while-revalidate, prewarm. Với key hot,
có thể giữ bản cũ thêm một khoảng và refresh nền. Đảm bảo lock có timeout và không chặn toàn bộ
key khác. Đo cache hit/miss, DB QPS theo thời điểm hết hạn. Tránh "cache tất cả" — cache dữ liệu
ổn định, không cache dữ liệu thay đổi liên tục.

---

### M7. Migration drop cột làm rollback app thất bại. Bài học?

**Trả lời:** Schema và code phải backward-compatible trong cửa sổ deploy. Quy trình đúng:
expand → deploy code mới → backfill/verify → contract (drop) sau khi chắc chắn không còn code cũ.
Không drop cột cùng release với code ngừng dùng. Luôn test rollback trên staging với dữ liệu
thật; có backup/PITR. Ghi rõ migration là one-way hay reversible.

---

### M8. Bạn phải review code của một senior khác và thấy thiết kế sai hướng. Xử lý?

**Trả lời:** Hỏi mục tiêu/giả định trước, trình bày vấn đề bằng dữ kiện và trade-off, không công
kích cá nhân. Đề xuất thử nghiệm/spike nhỏ để so sánh nếu bất đồng quan điểm. Nếu vẫn khác, escalate
theo tiêu chí kỹ thuật (rủi ro, chi phí, thời gian) chứ không theo chức danh. Ghi lại quyết định
(ADR) để team hiểu. Mục tiêu là quyết định tốt nhất, không phải "thắng" trong review.

---

## 13. Tài liệu tham khảo

- [`../python-advanced.md`](../python-advanced.md)
- [`../python-production.md`](../python-production.md)
- [`../python-cheatsheet.md`](../python-cheatsheet.md)
- [`./02-junior.md`](./02-junior.md) — nền tảng trước Middle
- [`./04-senior.md`](./04-senior.md) — tiếp theo
- CPython internals: https://docs.python.org/3/c-api/index.html
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/
- PostgreSQL docs: https://www.postgresql.org/docs/
- FastAPI: https://fastapi.tiangolo.com/
- pytest: https://docs.pytest.org/
- Hypothesis: https://hypothesis.readthedocs.io/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Google SRE Book: https://sre.google/sre-book/table-of-contents/

---

*Tiếp theo: [`04-senior.md`](./04-senior.md) cho internals sâu, distributed system, scale, bảo
mật kiến trúc, migration và chiến lược kỹ thuật.*
