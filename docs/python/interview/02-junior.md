# Python Interview — Junior

> ~85 câu cho ứng viên 1–3 năm: ngôn ngữ sâu hơn, module/dependency, FastAPI/Django, SQL/ORM,
> testing, async/concurrency nhập môn, Docker/CI/security và tình huống thực tế.

---

## Mục lục

1. [Ngôn ngữ và data model](#1-ngôn-ngữ-và-data-model)
2. [Module, package, dependency](#2-module-package-dependency)
3. [Web API và framework](#3-web-api-và-framework)
4. [Database và ORM](#4-database-và-orm)
5. [Testing và debug](#5-testing-và-debug)
6. [Async và concurrency nhập môn](#6-async-và-concurrency-nhập-môn)
7. [Production cơ bản](#7-production-cơ-bản)
8. [Coding và tình huống](#8-coding-và-tình-huống)
9. [Tài liệu tham khảo](#9-tài-liệu-tham-khảo)

---

## 1. Ngôn ngữ và data model

### Q01. List và generator khác nhau? Khi nào chọn? [J]

**Trả lời:** List chứa toàn bộ phần tử trong bộ nhớ, lặp lại được, có `len`/index. Generator
sinh phần tử lười, bộ nhớ O(1), chỉ lặp một lần.

```python
xs = [x * x for x in range(10**6)]      # ~8MB+ cho int object
gen = (x * x for x in range(10**6))     # gần như O(1)
```

Chọn generator khi dữ liệu lớn/streaming/chỉ duyệt một lần; list khi cần random access,
đếm nhiều lần, hoặc dữ liệu nhỏ.

**Bẫy:** generator đã tiêu thụ thì rỗng; không `len()` được.

---

### Q02. Shallow copy và deep copy, khi nào dùng? [J]

**Trả lời:** Shallow copy tạo container mới nhưng phần tử con chia sẻ; deep copy đệ quy.
Dùng shallow khi phần tử immutable hoặc muốn chia sẻ có chủ đích; deep khi cần độc lập hoàn
toàn.

```python
import copy
a = [[1], [2]]
b = a.copy()          # shallow
c = copy.deepcopy(a)  # deep
```

**Bẫy:** deepcopy object có connection/socket/lock thường lỗi hoặc rất chậm; định nghĩa
`__deepcopy__` nếu cần.

---

### Q03. Keyword-only và positional-only là gì? [J]

**Trả lời:** Dùng `*` để buộc keyword-only, `/` để buộc positional-only (3.8+).

```python
def create(name: str, /, side: str, *, table: int | None = None):
    ...

create("Hoa", "bride", table=3)
create("Hoa", side="bride", table=3)
# create(name="Hoa", ...) -> TypeError
```

Dùng khi API cần rõ nghĩa hoặc tránh nhầm thứ tự tham số.

---

### Q04. Decorator là gì? Viết decorator đo thời gian. [J]

**Trả lời:** Hàm nhận hàm, trả hàm mới, dùng để bọc hành vi mà không sửa hàm gốc.

```python
import functools
import time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(func.__name__, time.perf_counter() - start)
    return wrapper

@timed
def work():
    ...
```

**Bẫy:** quên `functools.wraps` làm mất tên/doc/signature; decorator có tham số cần thêm một
lớp hàm.

---

### Q05. Context manager là gì? Viết một cái. [J]

**Trả lời:** Object dùng với `with`, đảm bảo cleanup. Cài `__enter__`/`__exit__` hoặc dùng
`@contextmanager`.

```python
from contextlib import contextmanager

@contextmanager
def transaction(session):
    try:
        yield session
        session.commit()
    except BaseException:
        session.rollback()
        raise
```

**Điểm cộng:** `__exit__` trả `True` sẽ nuốt exception — thường không nên; bắt
`BaseException` để rollback cả khi bị hủy.

---

### Q06. Closure là gì? Bẫy late binding? [J]

**Trả lời:** Hàm con giữ biến scope ngoài. Trong vòng lặp, closure bind **biến**, không bind
giá trị tại thời điểm tạo.

```python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])       # [2, 2, 2]

funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])       # [0, 1, 2]
```

**Điểm cộng:** dùng `functools.partial` hoặc factory function để tránh bẫy.

---

### Q07. Comprehension có luôn nhanh hơn vòng lặp không? [J]

**Trả lời:** Thường nhanh hơn một chút vì tối ưu ở C và không gọi `append` mỗi vòng, nhưng
không phải lúc nào cũng đáng. Comprehension lồng phức tạp hoặc có side effect nên viết vòng
lặp cho dễ đọc.

```python
squares = [x * x for x in range(1000)]        # rõ, nhanh
result = []
for x in range(1000):
    if x % 2:
        result.append(transform(x))           # logic nhiều bước
```

**Bẫy:** tối ưu readability lấy vài % không ai đo.

---

### Q08. `__eq__` và `__hash__` liên quan thế nào? [J]

**Trả lời:** Object bằng nhau phải có cùng hash. Định nghĩa `__eq__` mà không `__hash__` làm
object unhashable. Object dùng làm dict key phải immutable trong thời gian sống.

```python
class Guest:
    def __init__(self, name): self.name = name
    def __eq__(self, other):
        if not isinstance(other, Guest):
            return NotImplemented
        return self.name == other.name
    def __hash__(self):
        return hash(self.name)
```

**Bẫy:** dùng object mutable làm key rồi sửa field → mất key trong dict/set.

---

### Q09. MRO là gì? `super()` hoạt động ra sao? [J]

**Trả lời:** MRO (Method Resolution Order) là thứ tự tìm method theo C3 linearization. `super()`
gọi method kế tiếp trong MRO, không nhất thiết là cha trực tiếp.

```python
class A: ...
class B(A): ...
class C(A): ...
class D(B, C): ...

print(D.__mro__)   # D, B, C, A, object
```

**Bẫy:** đa kế thừa phức tạp gây khó hiểu; dùng mixin nhỏ hoặc composition.

---

### Q10. Dataclass, namedtuple và Pydantic khác nhau? [J]

**Trả lời:**

| Công cụ | Đặc điểm | Dùng khi |
|---|---|---|
| `namedtuple` | Tuple có tên field, immutable, nhẹ | Bản ghi nhỏ, cần tuple-like |
| `dataclass` | Sinh init/repr/eq, không validate runtime | Domain/DTO nội bộ |
| Pydantic | Validate/coerce/serialize runtime, JSON Schema | Input API/config |

```python
from dataclasses import dataclass
from pydantic import BaseModel, Field

@dataclass(frozen=True)
class Guest:
    name: str

class GuestIn(BaseModel):
    name: str = Field(min_length=1)
```

**Bẫy:** dùng dataclass cho input HTTP rồi tưởng nó validate — không.

---

### Q11. `__slots__` dùng để làm gì? [J]

**Trả lời:** Khai báo danh sách attribute cố định, bỏ `__dict__`, giảm memory và chặn thêm
attribute động. Hữu ích khi tạo nhiều object.

```python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y
```

**Bẫy:** không tương thích với `cached_property`/một số thư viện cần `__dict__`; dataclass
dùng `@dataclass(slots=True)`.

---

### Q12. `isinstance` và `type` khác nhau? [J]

**Trả lời:** `isinstance(x, T)` tôn trọng kế thừa/ABC; `type(x) is T` so khớp chính xác.
Dùng `isinstance` cho hầu hết trường hợp.

```python
class Animal: ...
class Dog(Animal): ...

isinstance(Dog(), Animal)     # True
type(Dog()) is Animal         # False
```

**Bẫy:** `bool` là subclass `int`; `isinstance(True, int)` là `True`.

---

### Q13. Exception chaining là gì? [J]

**Trả lời:** `raise NewError(...) from exc` giữ nguyên nhân gốc; Python cũng tự set
`__context__` khi raise trong except. Traceback hiển thị "direct cause" hoặc "during handling".

```python
try:
    json.loads(text)
except json.JSONDecodeError as exc:
    raise ValueError("payload hỏng") from exc
```

**Điểm cộng:** dùng `from None` khi muốn ẩn chi tiết nội bộ khỏi client, nhưng vẫn log ở server.

---

### Q14. Tự viết context manager: class hay generator? [J]

**Trả lời:** Class khi cần state/phương thức/async; `@contextmanager` khi logic đơn giản, ngắn.

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, *exc):
        self.elapsed = time.perf_counter() - self.start
        return False
```

**Bẫy:** `__exit__` phải idempotent, không che exception gốc.

---

### Q15. Iterable và iterator khác nhau? [J]

**Trả lời:** Iterable có `__iter__` trả iterator; iterator có `__next__` và `__iter__` trả
chính nó. `for` gọi `iter()` rồi `next()` đến `StopIteration`.

```python
class Countdown:
    def __init__(self, n): self.n = n
    def __iter__(self): return self
    def __next__(self):
        if self.n <= 0: raise StopIteration
        self.n -= 1
        return self.n + 1
```

**Bẫy:** iterator dùng một lần; list là iterable nhưng không phải iterator.

---

### Q16. Generator `yield` hoạt động thế nào? [J]

**Trả lời:** Hàm có `yield` trả generator, thân hàm chạy dần mỗi lần `next`, giữ state giữa
các lần.

```python
def read_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")
```

**Điểm cộng:** generator giữ file mở đến khi đóng/tiêu thụ hết; dùng context manager bao
ngoài nếu có thể.

---

### Q17. `lru_cache` có bẫy gì? [J]

**Trả lời:** Yêu cầu argument hashable; cache giữ reference tới argument/kết quả; không tự
invalidate; không dùng cho hàm có side effect hoặc phụ thuộc thời gian/DB.

```python
from functools import lru_cache

@lru_cache(maxsize=1024)
def plan_features(plan: str) -> frozenset[str]:
    return load_from_db(plan)
```

**Bẫy:** cache vô hạn trên input unique → OOM; cache kết quả lỗi/permission.

---

### Q18. `pathlib` và `os.path` khác gì? [J]

**Trả lời:** `pathlib.Path` hướng object, dễ đọc, đa nền tảng; `os.path` là hàm chuỗi. Code
mới nên dùng `pathlib`.

```python
from pathlib import Path
p = Path(__file__).resolve().parent / "data" / "x.json"
p.parent.mkdir(parents=True, exist_ok=True)
text = p.read_text(encoding="utf-8")
```

**Điểm cộng:** `Path.is_relative_to` để chống path traversal.

---

### Q19. Protocol là gì? Khác ABC thế nào? [J]

**Trả lời:** `Protocol` là structural typing: object chỉ cần đúng method/attribute, không cần
kế thừa. ABC yêu cầu kế thừa tường minh và kiểm tra lúc tạo instance.

```python
from typing import Protocol

class Notifier(Protocol):
    def send(self, to: str, msg: str) -> None: ...

class Fake:
    def send(self, to, msg): ...
```

**Điểm cộng:** Protocol giúp test bằng fake dễ, giảm coupling; `runtime_checkable` chỉ check
tên method, không check signature.

---

### Q20. Truyền list/dict vào hàm có thể gây lỗi gì? [J]

**Trả lời:** Hàm có thể mutate object của caller. Nếu không muốn, copy trước hoặc thiết kế
hàm thuần túy. Default argument mutable còn nguy hiểm hơn.

```python
def add_bad(item, xs=[]):
    xs.append(item)
    return xs

def add(item, xs=None):
    xs = [] if xs is None else xs
    xs.append(item)
    return xs
```

**Điểm cộng:** document rõ hàm có mutate hay không; ưu tiên trả object mới.

---

## 2. Module, package, dependency

### Q21. Import trong package hoạt động thế nào? [J]

**Trả lời:** Python tìm trong `sys.path`, ưu tiên thư mục script/`PYTHONPATH`/site-packages;
module import một lần và cache trong `sys.modules`. Trong package nên dùng absolute import.

```python
from guestbook.models import Guest     # absolute
from .models import Guest              # relative
```

**Bẫy:** chạy file trực tiếp trong package gây relative import error; dùng `python -m package.module`.

---

### Q22. `__all__` dùng để làm gì? [J]

**Trả lời:** Khai báo API public cho `from module import *` và tài liệu; không chặn truy cập
trực tiếp. Hữu ích cho package/library.

```python
__all__ = ["Guest", "GuestService"]
```

**Điểm cộng:** giữ `__init__.py` nhẹ, chỉ re-export API chính; tránh import nặng/circular.

---

### Q23. Circular import xử lý thế nào? [J]

**Trả lời:** Tốt nhất tách phần dùng chung ra module thứ ba; hoặc import trong hàm (lazy),
hoặc chỉ import cho type bằng `TYPE_CHECKING`.

```python
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .repository import GuestRepository
```

**Bẫy:** thêm `sys.path.append` hoặc đổi thứ tự import chỉ che triệu chứng.

---

### Q24. Virtualenv, uv và lockfile? [J]

**Trả lời:** Venv cô lập package; uv quản lý Python/dependency/lock nhanh; lockfile ghi
resolution chính xác để CI và máy khác tái lập.

```bash
uv sync --frozen
uv run pytest
```

**Bẫy:** commit lock nhưng CI chạy `uv sync` không `--frozen` → lock bị đổi ngoài ý.

---

### Q25. `pyproject.toml` gồm những gì? [J]

**Trả lời:** `[build-system]` (backend), `[project]` (name/version/deps/requires-python),
`[project.optional-dependencies]` (extras), `[project.scripts]` (CLI), và config tool
(ruff/mypy/pytest). Là chuẩn thay `setup.py`.

```toml
[project]
name = "guestbook"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["fastapi>=0.115,<1"]
```

---

### Q26. Semantic versioning là gì? [J]

**Trả lời:** `MAJOR.MINOR.PATCH`: MAJOR khi breaking, MINOR khi thêm feature tương thích,
PATCH khi fix. Với Python, breaking gồm đổi signature, bỏ version Python, đổi behavior public.

**Điểm cộng:** dependency range `>=1.2,<2` cho library; app dùng lockfile.

---

### Q27. `pip install -e .` làm gì? [J]

**Trả lời:** Cài package ở chế độ editable: import trực tiếp từ source, sửa code không cần
cài lại. Hữu ích khi phát triển; CI/production dùng cài thường (`uv sync`).

**Bẫy:** editable cài vào venv hiện tại; kiểm tra `sys.executable` nếu import sai bản.

---

### Q28. Pin dependency thế nào cho hợp lý? [J]

**Trả lời:** App: lockfile đầy đủ + CI `--frozen`; library: range rộng (`>=x,<next-major`) để
consumer linh hoạt. Cập nhật định kỳ, chạy test và scan CVE.

**Bẫy:** pin chặt mọi thứ trong library gây xung đột; không pin gì trong app gây build không
tái lập.

---

## 3. Web API và framework

### Q29. Thiết kế URL REST cho resource `guest`? [J]

**Trả lời:** Dùng danh từ số nhiều, không động từ:

```text
GET    /guests          # list
POST   /guests          # create
GET    /guests/{id}     # detail
PATCH  /guests/{id}     # partial update
DELETE /guests/{id}     # delete
GET    /guests/{id}/rsvps
```

**Bẫy:** `/getGuests`, `/guests/delete/1`; trả 200 cho lỗi.

---

### Q30. Idempotency là gì? Method nào idempotent? [J]

**Trả lời:** Gọi nhiều lần cho cùng kết quả. `GET`, `HEAD`, `PUT`, `DELETE` idempotent;
`POST` không. Với POST tạo đơn hàng, dùng `Idempotency-Key` + lưu kết quả.

**Điểm cộng:** idempotent không có nghĩa "không có side effect" mà là lặp lại không đổi kết
quả quan sát được.

---

### Q31. FastAPI xử lý request thế nào? [J]

**Trả lời:** ASGI server → middleware → router → dependency injection → validate input
(Pydantic) → handler → serialize response theo `response_model`. `lifespan` quản lý
startup/shutdown (DB pool, Redis).

```python
@router.post("", response_model=GuestOut, status_code=201)
async def create(payload: GuestCreate, session: SessionDep): ...
```

**Điểm cộng:** dependency có thể lồng, cache theo request; đừng mở connection trong handler
nếu có thể dùng dependency/lifespan.

---

### Q32. Pydantic validate gì và không validate gì? [J]

**Trả lời:** Validate/coerce kiểu, giới hạn, format, nested model; sinh JSON Schema. Không
validate business rule phức tạp (unique email, quyền) — phải kiểm tra ở service/DB.

```python
class GuestIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr | None = None
```

**Bẫy:** tin `model_validate` là đủ; vẫn cần kiểm tra uniqueness/authorization.

---

### Q33. FastAPI và Django khác nhau? [J]

**Trả lời:** FastAPI nhẹ, async-first, Pydantic/OpenAPI, không có admin/ORM sẵn. Django
full-stack: ORM, admin, auth, form, migration tích hợp; async hỗ trợ một phần.

| Tiêu chí | FastAPI | Django |
|---|---|---|
| Async | Native | Có, ORM async hạn chế |
| Admin | Không | Có sẵn |
| Validation | Pydantic | Form/DRF |
| Phù hợp | API/service | Sản phẩm full-stack, CRUD lớn |

---

### Q34. JWT và session khác nhau? [J]

**Trả lời:** Session lưu state server (hoặc Redis), client giữ session id; dễ revoke. JWT
self-contained, client giữ token; verify signature/claim, khó revoke trước hạn (cần blacklist/
short expiry).

| Tiêu chí | Session | JWT |
|---|---|---|
| State | Server | Client |
| Revoke | Dễ | Khó |
| Scale | Cần shared store | Stateless |
| Phù hợp | Web app | API/mobile/service |

**Bẫy:** JWT không mã hóa payload; không đặt PII/secret trong đó.

---

### Q35. Phân trang offset và cursor khác gì? [J]

**Trả lời:** Offset (`LIMIT/OFFSET`) đơn giản nhưng chậm và lệch khi dữ liệu thay đổi. Cursor
dùng `(created_at, id)` làm mốc, ổn định và nhanh hơn với bảng lớn.

```sql
-- cursor
SELECT * FROM guests
WHERE (created_at, id) < (:last_created, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

**Điểm cộng:** cursor không nhảy trang tùy ý; trả `next_cursor` opaque.

---

### Q36. Error response nên trông thế nào? [J]

**Trả lời:** Thống nhất, có mã lỗi máy đọc được, message người đọc được, không lộ stack/SQL.
Theo RFC 9457:

```json
{
  "type": "https://api.example.com/problems/duplicate-guest",
  "title": "Khách đã tồn tại",
  "status": 409,
  "detail": "Tên 'Hoa' đã có",
  "instance": "/api/v1/guests"
}
```

**Bẫy:** trả 200 với `{"success": false}`; message khác nhau cho từng trường hợp auth (dò tài khoản).

---

### Q37. CORS là gì? Khi nào gặp lỗi? [J]

**Trả lời:** Cơ chế browser cho phép origin khác gọi API. Server trả `Access-Control-Allow-Origin`
và xử lý preflight `OPTIONS`. Lỗi thường do origin không khớp, thiếu header, hoặc `credentials`
với `*`.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
)
```

**Bẫy:** CORS không bảo vệ API khỏi client không phải browser; auth vẫn phải đúng.

---

### Q38. Middleware dùng để làm gì? Thứ tự thế nào? [J]

**Trả lời:** Xử lý cross-cutting: request id, logging, auth, CORS, rate limit, timing. Thứ tự
quan trọng: middleware thêm sau chạy ngoài (bao quanh) tùy framework; cần kiểm tra docs.

**Bẫy:** middleware nặng (gọi DB/HTTP) làm chậm mọi request; ưu tiên dependency/service.

---

### Q39. API versioning chọn cách nào? [J]

**Trả lời:** URL (`/api/v1`) phổ biến, dễ thấy; header (`Accept: application/vnd.api+json;v=2`)
sạch hơn nhưng khó debug; query (`?version=2`) ít khuyến nghị. Chọn một cách, document,
deprecate có lộ trình.

**Điểm cộng:** additive change không cần version mới; breaking mới tăng version.

---

### Q40. OpenAPI dùng để làm gì? [J]

**Trả lời:** Hợp đồng máy đọc được cho API: endpoint, schema, status, auth. FastAPI tự sinh;
dùng cho docs, SDK generation, contract test, gateway.

**Bẫy:** schema lệch thực tế do response không theo `response_model`; kiểm tra trong CI.

---

## 4. Database và ORM

### Q41. INNER JOIN, LEFT JOIN, RIGHT JOIN khác gì? [J]

**Trả lời:** INNER chỉ dòng khớp cả hai; LEFT giữ mọi dòng trái, cột phải NULL nếu không khớp;
RIGHT ngược lại; FULL giữ cả hai.

```sql
SELECT g.name, r.status
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id;
```

**Bẫy:** đặt điều kiện bảng phải trong `WHERE` biến LEFT JOIN thành INNER.

---

### Q42. Composite index và leftmost prefix? [J]

**Trả lời:** Index nhiều cột `(tenant_id, created_at)` phục vụ query lọc theo `tenant_id`,
hoặc `tenant_id + created_at`; không phục vụ query chỉ lọc `created_at` (trừ covering index
đặc biệt). Thứ tự cột quan trọng.

```sql
CREATE INDEX idx_guests_tenant_created
ON guests (tenant_id, created_at DESC);
```

**Điểm cộng:** kiểm tra bằng `EXPLAIN`; index thừa làm chậm ghi.

---

### Q43. Isolation level và hiện tượng? [J]

**Trả lời:** READ UNCOMMITTED (dirty read), READ COMMITTED (non-repeatable read), REPEATABLE
READ (phantom có thể), SERIALIZABLE (không phantom, chậm/retry). PostgreSQL mặc định READ
COMMITTED.

**Bẫy:** tưởng REPEATABLE READ không có phantom; tùy DB. Hiểu workload trước khi tăng mức.

---

### Q44. N+1 query là gì? Cách phát hiện/sửa? [J]

**Trả lời:** Lấy N bản ghi rồi query thêm cho từng bản ghi → N+1 round-trip. Phát hiện qua log
SQL/`EXPLAIN`/APM. Sửa bằng eager load (`selectinload`/`joinedload`), batch `IN`, hoặc join.

```python
stmt = select(Guest).options(selectinload(Guest.rsvps))
```

**Bẫy:** `joinedload` với quan hệ nhiều có thể nhân dòng; chọn chiến lược theo cardinality.

---

### Q45. ORM và raw SQL, chọn cái nào? [J]

**Trả lời:** ORM cho CRUD, quan hệ, transaction, an toàn injection, dễ refactor. Raw SQL cho
báo cáo, window function, bulk, query tối ưu mà ORM sinh kém. Có thể kết hợp.

**Điểm cộng:** luôn bind parameter; đừng viết raw SQL nếu ORM đọc được và đủ nhanh.

---

### Q46. Session SQLAlchemy nên quản lý thế nào? [J]

**Trả lời:** Một session mỗi request/job, đóng sau khi dùng; transaction bao quanh use case.
Async dùng `async_sessionmaker`, `expire_on_commit=False`, không chia sẻ session giữa task.

```python
async with SessionFactory() as session:
    async with session.begin():
        ...
```

**Bẫy:** session global → state rò rỉ, race; session sống quá lâu → connection/lock.

---

### Q47. Migration cần lưu ý gì? [J]

**Trả lời:** Review file autogenerate; migration phải chạy được trên dữ liệu thật, có rollback
hoặc forward-fix; với bảng lớn dùng expand/contract, index `CONCURRENTLY`, backfill batch.
Không chạy migration tự động trong mỗi pod.

**Bẫy:** `ADD COLUMN NOT NULL` không default trên bảng lớn → lock/rewrite.

---

### Q48. Connection pool size nên đặt bao nhiêu? [J]

**Trả lời:** Phụ thuộc số worker/process, `max_connections` DB, thời gian giữ connection.
Tổng connection = (pool_size + max_overflow) × số process. Bắt đầu nhỏ, đo, tăng có kiểm soát.

**Bẫy:** mỗi pod 20 connection × 20 pod = 400, vượt DB; dùng PgBouncer nếu cần.

---

### Q49. Vì sao offset lớn chậm? [J]

**Trả lời:** DB vẫn phải đọc/bỏ qua `offset` dòng trước khi trả kết quả, O(offset). Cursor
dùng điều kiện trên index để nhảy trực tiếp.

```sql
-- chậm dần
SELECT * FROM guests ORDER BY id LIMIT 20 OFFSET 100000;
-- cursor
SELECT * FROM guests WHERE id > 100000 ORDER BY id LIMIT 20;
```

---

### Q50. Chống SQL injection thế nào? [J]

**Trả lời:** Dùng query parameter/bind variable, không nối chuỗi; ORM cũng dùng parameter.
Validate/allowlist tên cột/order nếu phải nội suy.

```python
# đúng
await session.execute(text("SELECT * FROM guests WHERE name = :name"), {"name": name})
# sai
await session.execute(text(f"SELECT * FROM guests WHERE name = '{name}'"))
```

**Bẫy:** `%`/f-string trong raw SQL; `ORDER BY {column}` cũng inject được.

---

## 5. Testing và debug

### Q51. Test pyramid là gì? [J]

**Trả lời:** Nhiều unit test nhanh, vừa integration test (DB/API), ít E2E. Unit test logic; integration
kiểm tra ranh giới; E2E kiểm tra luồng chính. Đừng dựng 100% E2E.

**Điểm cộng:** contract test giữa service; load test theo đợt.

---

### Q52. Fixture scope trong pytest? [J]

**Trả lời:** `function` (mặc định, cách ly tốt), `class`, `module`, `package`, `session` (dùng
chung, cần cleanup). Setup đắt (DB container) dùng session; state mutable nên function.

```python
@pytest.fixture(scope="session")
def engine():
    e = create_engine(...)
    yield e
    e.dispose()
```

**Bẫy:** fixture session bị mutate giữa test → phụ thuộc thứ tự.

---

### Q53. Mock `patch` sai chỗ là sao? [J]

**Trả lời:** Patch phải nhắm nơi tên được **tra cứu**, không phải nơi định nghĩa.

```python
# app/service.py: from app.email import send
# phải patch app.service.send, không phải app.email.send
monkeypatch.setattr("app.service.send", fake)
```

**Điểm cộng:** ưu tiên inject dependency/fake thay patch chuỗi.

---

### Q54. Cô lập DB trong integration test thế nào? [J]

**Trả lời:** Transaction rollback mỗi test (nhanh), truncate bảng, schema riêng, hoặc
testcontainers PostgreSQL. Không dùng SQLite thay PostgreSQL nếu production khác biệt.

**Bẫy:** test chạy song song dùng chung DB → race; cần schema/database riêng mỗi worker.

---

### Q55. Coverage cao có đảm bảo test tốt? [J]

**Trả lời:** Không. Coverage đo dòng được chạy, không đo assert/edge case/chất lượng. Có thể
100% mà không kiểm tra gì. Dùng làm tín hiệu tìm vùng chưa test; ưu tiên hành vi quan trọng.

**Điểm cộng:** mutation testing (mutmut) kiểm tra test có bắt lỗi thật.

---

### Q56. Test flaky xử lý thế nào? [J]

**Trả lời:** Tìm nguyên nhân: thời gian thật, thứ tự/state, network, race async, port cố định.
Cô lập fixture, inject clock, timeout, retry chỉ tầng hạ tầng. Không rerun mù.

**Bẫy:** tăng timeout che vấn đề hiệu năng/thuật toán.

---

### Q57. Production lỗi, bạn xem gì? [J]

**Trả lời:** Log có request id/traceback, metric error/latency, trace, deploy gần nhất,
dependency (DB/Redis/third-party), queue lag. Tái hiện bằng input tối thiểu. Giảm thiểu trước
(rollback/flag) rồi tìm root cause.

---

### Q58. Profile code thế nào? [J]

**Trả lời:** Đo bằng `time.perf_counter`/`timeit`; `cProfile` tìm hàm tốn; `py-spy` production;
`scalene` line-level. Tối ưu theo complexity/IO trước, vi tối ưu sau.

```bash
python -m cProfile -s cumtime app.py
py-spy top --pid 1234
```

---

### Q59. Git flow/PR bạn dùng? [J]

**Trả lời:** Nhánh ngắn từ main, commit nhỏ, rebase nhánh cá nhân trước PR, PR có mô tả/test,
review, squash/merge theo quy ước. Không commit trực tiếp main; không force push nhánh chung.

---

### Q60. Review code bạn tìm gì? [J]

**Trả lời:** Đúng yêu cầu/edge case, test, error handling, security (secret/injection/authz),
hiệu năng (N+1), naming/structure, backward compatibility, migration/rollback. Comment cụ thể,
phân biệt blocking/nit.

---

## 6. Async và concurrency nhập môn

### Q61. `async def` và `await` hoạt động thế nào? [J]

**Trả lời:** `async def` tạo coroutine; `await` nhường quyền cho event loop khi chờ I/O, cho
task khác chạy. Coroutine không tự chạy nếu không await/create_task.

```python
async def fetch(client, url):
    r = await client.get(url)
    return r.json()
```

**Bẫy:** quên `await` → coroutine không chạy, warning; gọi sync I/O trong async → block loop.

---

### Q62. Event loop là gì? [J]

**Trả lời:** Vòng lặp chạy các task/callback, quản lý I/O không blocking. Mỗi thread có thể có
một loop; `asyncio.run` tạo loop cho chương trình chính.

**Bẫy:** tự tạo loop trong thread/async context; dùng `get_running_loop` khi đang trong async.

---

### Q63. Async, thread và process khác nhau? [J]

**Trả lời:**

| Mô hình | Phù hợp | Chi phí |
|---|---|---|
| Async | Nhiều I/O đồng thời | Thấp, single thread |
| Thread | I/O blocking có thư viện sync | Trung bình, GIL |
| Process | CPU-bound | Cao, memory riêng |

Async không nhanh hơn nếu không có I/O chờ; process cần pickle.

---

### Q64. GIL là gì? Ảnh hưởng gì? [J]

**Trả lời:** CPython chỉ cho một thread chạy bytecode tại một thời điểm. Thread vẫn hữu ích
cho I/O (nhả GIL khi chờ) và C extension nhả GIL; CPU-bound thuần Python dùng process/vectorize.
Từ 3.13 có free-threaded build thử nghiệm, 3.14 chính thức nhưng chưa phổ biến.

**Bẫy:** nói "thread Python vô dụng" — sai; nói "GIL bảo vệ mọi race" — cũng sai.

---

### Q65. Race condition và lock? [J]

**Trả lời:** Nhiều thread đọc-sửa-ghi cùng state không đồng bộ → kết quả sai. Dùng `Lock`,
`RLock`, `queue.Queue`, hoặc tránh shared mutable state.

```python
lock = threading.Lock()
with lock:
    counter += 1
```

**Bẫy:** deadlock khi lock lồng không thứ tự; giữ lock khi gọi I/O làm giảm concurrency.

---

### Q66. ThreadPoolExecutor dùng khi nào? [J]

**Trả lời:** Khi có nhiều tác vụ I/O blocking và thư viện không async (requests, boto3 sync,
file). Giới hạn `max_workers` để không quá tải downstream.

```python
with ThreadPoolExecutor(max_workers=20) as pool:
    results = list(pool.map(fetch, urls))
```

**Bẫy:** dùng cho CPU-bound → không nhanh hơn, còn tranh GIL.

---

### Q67. ProcessPoolExecutor bẫy gì? [J]

**Trả lời:** Argument/return phải pickle; macOS/Windows dùng spawn nên cần
`if __name__ == "__main__"`; worker có memory riêng, không chia sẻ state; khởi động chậm.

```python
if __name__ == "__main__":
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(cpu_task, data))
```

---

### Q68. Khi nào KHÔNG nên dùng async? [J]

**Trả lời:** Khi toàn bộ thư viện là sync và không có async driver; khi tác vụ CPU-bound; khi
tải thấp, code sync đơn giản hơn; khi team chưa quen debug async. Async là công cụ cho I/O
concurrency, không phải mặc định cho mọi thứ.

---

### Q69. Blocking event loop biểu hiện thế nào? [J]

**Trả lời:** Một request chậm làm mọi request khác chờ; latency tăng đều, CPU có thể thấp.
Nguyên nhân: `time.sleep`, `requests`, sync DB, đọc file lớn, hash cost cao, `bcrypt`.

**Cách sửa:** async client/driver, `asyncio.to_thread`, hoặc đẩy job sang worker.

---

### Q70. Timeout và cancellation trong async? [J]

**Trả lời:** Dùng `asyncio.timeout` (3.11+) hoặc `wait_for`; task bị hủy nhận `CancelledError`,
phải re-raise sau cleanup. `shield` bảo vệ task con nhưng caller vẫn bị hủy.

```python
async with asyncio.timeout(5):
    await call()

task.cancel()
with contextlib.suppress(asyncio.CancelledError):
    await task
```

---

## 7. Production cơ bản

### Q71. Structured logging là gì? [J]

**Trả lời:** Log dạng JSON/key-value với field cố định (timestamp, level, request_id, user,
message), dễ parse/index. Không log secret/PII; dùng level đúng; log kèm context.

```python
logger.info("guest_created", extra={"guest_id": guest.id, "request_id": rid})
```

**Bẫy:** log cả payload lớn/PII; log trong vòng lặp nóng.

---

### Q72. Config và secret nên quản lý thế nào? [J]

**Trả lời:** Config qua env, validate bằng Pydantic Settings, fail fast; secret từ secret
manager/CI, không commit. `.env` chỉ local, có `.env.example`.

```python
class Settings(BaseSettings):
    database_url: PostgresDsn
    jwt_public_key: str
```

**Bẫy:** secret trong git history vẫn lộ dù đã xóa file; phải rotate.

---

### Q73. Dockerfile Python tốt gồm gì? [J]

**Trả lời:** Base image slim, multi-stage, chỉ copy cần thiết, `PYTHONUNBUFFERED=1`,
`PYTHONDONTWRITEBYTECODE=1`, non-root user, healthcheck, `.dockerignore`, pin dependency.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
USER app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]
```

**Bẫy:** chạy root, image chứa compiler/test, copy `.env`, dùng `latest`.

---

### Q74. CI pipeline tối thiểu cho Python? [J]

**Trả lời:** checkout → setup Python/uv → cài lock → lint/format → type check → test (với
service DB) → security scan → build image. Cache dependency để nhanh; chặn merge nếu fail.

```yaml
- run: uv sync --frozen
- run: uv run ruff check .
- run: uv run mypy src
- run: uv run pytest --cov=src
```

---

### Q75. OWASP Top 10 liên quan Python? [J]

**Trả lời:** Injection (SQL/command), broken auth, sensitive data, XXE/deserialization, broken
access control (IDOR), misconfig, XSS, SSRF, vulnerable dependencies, logging thiếu. Phòng:
parameterized query, `yaml.safe_load`, không `pickle` input ngoài, check ownership, scan CVE.

---

### Q76. SQL injection, XSS, CSRF khác nhau? [J]

**Trả lời:** SQL injection chèn SQL qua input → parameterized query. XSS chèn script vào trang
→ escape output/CSP. CSRF lợi dụng cookie session của user → CSRF token/SameSite. Ba lỗi khác
tầng, cần phòng riêng.

---

### Q77. Secret bị lộ trong git, xử lý thế nào? [J]

**Trả lời:** Rotate ngay (coi như đã lộ), xóa khỏi working tree, cân nhắc rewrite history
(`git filter-repo`) và thông báo; thêm secret scanning. Không chỉ xóa commit gần nhất.

**Bẫy:** chỉ `git rm` rồi commit tiếp — secret vẫn trong history.

---

### Q78. Cache-aside là gì? [J]

**Trả lời:** Đọc cache trước; miss thì đọc DB, ghi cache với TTL; cập nhật DB thì xóa cache.
Chống stampede bằng lock/jitter; cache negative ngắn cho dữ liệu không tồn tại.

```python
cached = await redis.get(key)
if cached is None:
    data = await repo.get(id)
    await redis.set(key, json.dumps(data), ex=300)
```

**Bẫy:** cache là nguồn sự thật; quên invalidate sau update.

---

### Q79. Background job cần đảm bảo gì? [J]

**Trả lời:** Idempotency (retry/redelivery không gây trùng), retry có backoff cho lỗi transient,
DLQ, timeout, observability (queue depth, failure rate), và không giữ transaction DB khi gọi
external.

**Điểm cộng:** outbox pattern để không mất event khi broker down.

---

### Q80. Deploy và rollback cơ bản? [J]

**Trả lời:** Build artifact bất biến, deploy staging, smoke test, deploy production theo
canary/rolling, monitor, rollback image cũ nếu lỗi. Migration phải tương thích ngược; feature
flag tách deploy/release.

**Bẫy:** rollback code nhưng migration đã xóa cột → app cũ gãy.

---

## 8. Coding và tình huống

### C01. Nhóm list dict theo một key [J]

```python
from collections import defaultdict

def group_by(items: list[dict], key: str) -> dict[str, list[dict]]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        groups[item[key]].append(item)
    return dict(groups)
```

**Điểm cộng:** O(n), giữ thứ tự; nêu case thiếu key (`item.get(key, "unknown")`).

---

### C02. Đếm top N phần tử [J]

```python
from collections import Counter

def top_n(items: list[str], n: int) -> list[tuple[str, int]]:
    return Counter(items).most_common(n)
```

**Điểm cộng:** `heapq.nlargest` nếu N nhỏ và dữ liệu lớn; ổn định khi trùng count tùy nhu cầu.

---

### C03. Retry có backoff [J]

```python
import random
import time
from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")

def retry(func: Callable[[], T], attempts: int = 3) -> T:
    last: Exception | None = None
    for i in range(attempts):
        try:
            return func()
        except (TimeoutError, ConnectionError) as exc:
            last = exc
            if i < attempts - 1:
                delay = min(30, 0.5 * 2 ** i)
                time.sleep(delay * (0.5 + random.random()))
    raise RuntimeError("retry exhausted") from last
```

**Điểm cộng:** chỉ retry transient/idempotent; jitter tránh đồng loạt.

---

### C04. Đọc log và đếm status code [J]

```python
import re
from collections import Counter

def count_status(lines: list[str]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    pattern = re.compile(r'"\s+(\d{3})\s')
    for line in lines:
        if match := pattern.search(line):
            counter[match.group(1)] += 1
    return dict(counter)
```

**Điểm cộng:** regex phụ thuộc format log; production nên log JSON để parse ổn định.

---

### C05. Cache đơn giản có TTL [J]

```python
import time
from typing import Any

class TTLCache:
    def __init__(self, ttl: float) -> None:
        self.ttl = ttl
        self._data: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        item = self._data.get(key)
        if item is None:
            return None
        expires, value = item
        if time.monotonic() > expires:
            self._data.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._data[key] = (time.monotonic() + self.ttl, value)
```

**Điểm cộng:** dùng `time.monotonic` tránh lệch giờ; nêu giới hạn memory/thread safety.

---

### J1. API trả chậm khi list 10.000 khách. Bạn kiểm tra gì?

**Trả lời:** Đo p50/p95, xem query log/EXPLAIN, có N+1 không, có trả field thừa không, có
phân trang chưa, index theo filter/sort chưa, payload size. Sửa: pagination, select cột cần,
eager load, index, cache nếu phù hợp. Đo lại sau mỗi thay đổi.

---

### J2. Migration thêm cột `NOT NULL` làm deploy lỗi. Vì sao?

**Trả lời:** Bảng lớn có thể bị lock/rewrite; code cũ ghi thiếu cột. Dùng expand/contract:
thêm cột nullable/default, deploy code ghi giá trị, backfill, rồi mới đặt NOT NULL. Luôn thử
trên bản sao dữ liệu production.

---

### J3. Vì sao test pass local nhưng fail CI?

**Trả lời:** Khác Python/dependency (lock không dùng `--frozen`), thiếu service (DB/Redis),
timezone/locale, thứ tự test, quyền file, biến môi trường, test phụ thuộc network. Chạy CI
local bằng Docker, log môi trường, cố định seed/timezone.

---

### J4. Background job chạy trùng, gửi 2 email. Xử lý?

**Trả lời:** Job phải idempotent: kiểm tra trạng thái/unique key trước khi gửi, lưu
`invitation_sent_at` trong transaction, dùng outbox. Retry/at-least-once là bình thường, nên
consumer phải chịu được duplicate.

---

### J5. User A đọc được dữ liệu của user B. Lỗi gì?

**Trả lời:** Broken access control/IDOR: chỉ kiểm tra đăng nhập mà không kiểm tra ownership/
tenant. Mọi query phải scope `tenant_id`/`owner_id`; trả 404 thay vì 403 nếu không muốn lộ tồn
tại. Viết test tự động cho từng resource.

---

### J6. Redis down, API có nên down theo?

**Trả lời:** Tùy vai trò cache. Nếu chỉ cache, fallback DB và log/metric, chấp nhận chậm hơn.
Nếu Redis là store chính (session/queue), cần degraded mode hoặc fail rõ ràng. Thiết kế timeout
ngắn, circuit breaker, không retry vô hạn.

---

### J7. Bạn được giao feature mà không rõ acceptance criteria. Làm gì?

**Trả lời:** Viết lại hiểu biết của mình, hỏi stakeholder về mục tiêu/phạm vi/edge case, đề
xuất MVP, xác nhận bằng văn bản. Không code khi còn mơ hồ lớn; có thể làm spike nhỏ để làm rõ.

---

### J8. Code review bị yêu cầu sửa 20 chỗ. Bạn xử lý?

**Trả lời:** Phân loại blocking/nit, sửa blocking trước, hỏi chỗ chưa hiểu, không tranh luận
cảm tính. Nếu PR quá lớn, tách nhỏ lần sau. Ghi lại pattern để tránh lặp.

---

## 9. Tài liệu tham khảo

- [`../python-basics.md`](../python-basics.md)
- [`../python-advanced.md`](../python-advanced.md)
- [`../python-production.md`](../python-production.md)
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/en/20/
- pytest: https://docs.pytest.org/
- asyncio: https://docs.python.org/3/library/asyncio.html
- OWASP: https://owasp.org/www-project-top-ten/

---

*Tiếp theo: [`03-middle.md`](./03-middle.md) cho thiết kế module/service, async sâu, DB,
security và system design nhỏ.*
