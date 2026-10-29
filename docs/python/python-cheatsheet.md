# Python Cheatsheet — Tra cứu nhanh hằng ngày

> Cú pháp, stdlib, lệnh tooling và recipe thường dùng. Baseline Python 3.12+; ghi chú khi
> cần 3.11/3.13/3.14. Dùng kèm [`python-basics.md`](./python-basics.md) và
> [`python-advanced.md`](./python-advanced.md).

---

## 1. Môi trường và lệnh

```bash
python3 --version
uv init --package myapp && cd myapp
uv add fastapi sqlalchemy
uv add --dev pytest ruff mypy httpx
uv sync --frozen
uv run python -m myapp
uv run pytest -q
uv run ruff check . --fix
uv run ruff format .
uv run mypy src
uv build && uv publish
```

```bash
python3 -m venv .venv && source .venv/bin/activate
python3 -m pip install -e ".[dev]"
python3 -c "import sys; print(sys.executable)"
```

| Lệnh | Tác dụng |
|---|---|
| `python -m module` | Chạy module, import đúng package |
| `python -i script.py` | Vào REPL sau khi chạy |
| `python -m pdb app.py` | Debugger |
| `python -X importtime -c "import x"` | Đo import |
| `python -m cProfile -o p.out app.py` | Profile |
| `PYTHONASYNCIODEBUG=1` | Bật debug asyncio |

---

## 2. Cú pháp nhanh

```python
# Biến, kiểu
x: int = 1
name: str | None = None
is_ok = True
values: list[int] = [1, 2, 3]
mapping: dict[str, int] = {"a": 1}
pair: tuple[str, int] = ("a", 1)

# Điều kiện
label = "yes" if ok else "no"
if x > 0 and name is not None:
    ...

# Vòng lặp
for i, value in enumerate(values, start=1):
    ...
for a, b in zip(xs, ys, strict=True):
    ...
while x > 0:
    x -= 1

# match (3.10+)
match command.split():
    case ["add", name]:
        ...
    case ["remove", *rest] if rest:
        ...
    case _:
        ...

# Walrus
if (n := len(values)) > 2:
    print(n)

# Unpack
first, *rest = values
a, b = b, a
```

---

## 3. String

```python
s = "  Nguyễn An  "
s.strip()                  # 'Nguyễn An'
s.casefold()               # '  nguyễn an  '
s.replace("An", "Bình")
"a,b,c".split(",")         # ['a','b','c']
",".join(["a", "b"])       # 'a,b'
s.startswith("  Ng")
"abc".find("b")            # 1, không thấy = -1
"abc".index("b")           # 1, không thấy = ValueError
"banana".count("a")        # 3

name, age = "An", 30
f"{name} ({age})"          # An (30)
f"{3.14159:.2f}"           # 3.14
f"{42:>6}"                 # '    42'
f"{42:06d}"                # '000042'
f"{name!r}"                # "'An'"
f"{value=}"                # value=...

r"C:\path"                 # raw
b"abc".decode("utf-8")
"xin chào".encode("utf-8")
```

---

## 4. Collection

```python
xs = [3, 1, 2]
xs.append(4); xs.extend([5]); xs.insert(0, 0)
xs.pop(); xs.pop(0); xs.remove(3)
xs.sort(); xs.sort(key=lambda v: -v)
sorted(xs, reverse=True)
xs[1:3]; xs[::-1]; xs[::2]
len(xs); 2 in xs; xs.count(2)

t = (1, 2); x, y = t
empty = (); single = (1,)

d = {"a": 1}
d.get("b", 0); d.setdefault("c", 2); d.update({"d": 4})
d.pop("a", None); d | {"e": 5}; {**d, "f": 6}
list(d.items()); list(d.keys()); list(d.values())
{k: v for k, v in d.items() if v > 1}

s = {1, 2}; s.add(3); s.discard(1)
s | {3}; s & {2}; s - {1}; s ^ {2, 3}

# Comprehension
[n * n for n in range(5)]
[n for n in range(10) if n % 2 == 0]
{n: n * n for n in range(3)}
{n % 3 for n in range(10)}
[(i, j) for i in range(2) for j in range(2)]

# Khử trùng giữ thứ tự
list(dict.fromkeys(["b", "a", "b"]))

# Copy
import copy
shallow = xs.copy()
deep = copy.deepcopy(nested)
```

| Cần | Dùng |
|---|---|
| Tra cứu nhanh | `dict`/`set` |
| Giữ thứ tự + index | `list` |
| Bất biến/hash | `tuple`/`frozenset` |
| Queue hai đầu | `collections.deque` |
| Đếm | `collections.Counter` |
| Nhóm | `collections.defaultdict(list)` |

---

## 5. Hàm

```python
def f(a: int, b: int = 0, *args, c: str = "x", **kwargs) -> int:
    return a + b

def g(a, /, b, *, c):       # positional-only / keyword-only
    ...

def safe(x, items: list[int] | None = None) -> list[int]:
    items = [] if items is None else items
    items.append(x)
    return items

double = lambda x: x * 2
sorted(items, key=lambda item: (item.side, item.name))

from functools import partial, lru_cache, cache, reduce, wraps

@lru_cache(maxsize=128)
def fib(n: int) -> int: ...

square = partial(pow, exp=2) if False else (lambda x: x ** 2)

def deco(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

Scope: **LEGB** (Local → Enclosing → Global → Built-in). Dùng `nonlocal`/`global` hạn chế.

---

## 6. OOP, dataclass, enum

```python
class Guest:
    venue = "Hall"

    def __init__(self, name: str) -> None:
        self.name = name

    @property
    def label(self) -> str:
        return self.name.strip().title()

    @classmethod
    def from_csv(cls, line: str) -> "Guest":
        return cls(line.split(",")[0].strip())

    @staticmethod
    def valid(name: str) -> bool:
        return bool(name.strip())

    def __repr__(self) -> str:
        return f"Guest({self.name!r})"
```

```python
from dataclasses import dataclass, field, replace, asdict

@dataclass(frozen=True, slots=True)
class Guest:
    name: str
    side: str = "bride"
    tags: tuple[str, ...] = ()

@dataclass
class Rsvp:
    guest: Guest
    status: str = "pending"
    notes: list[str] = field(default_factory=list)

new = replace(rsvp, status="yes")
payload = asdict(new)
```

```python
from enum import StrEnum, Enum, IntEnum

class Status(StrEnum):
    PENDING = "pending"
    YES = "yes"
    NO = "no"
```

| Dunder | Dùng cho |
|---|---|
| `__repr__` | Debug, tái tạo object |
| `__str__` | Hiển thị người đọc |
| `__eq__` + `__hash__` | So sánh, dict key |
| `__len__`, `__iter__`, `__getitem__` | Như collection |
| `__call__` | Object gọi như hàm |
| `__enter__/__exit__` | Context manager |
| `__lt__` | Sắp xếp |

---

## 7. Exception

```python
try:
    risky()
except (ValueError, KeyError) as exc:
    logger.warning("bad input: %s", exc)
except OSError:
    logger.exception("io error")
    raise
else:
    logger.info("ok")
finally:
    cleanup()

raise ValueError("message")
raise RuntimeError("wrap") from exc

class AppError(Exception): ...
class NotFound(AppError): ...

try:
    ...
except ExceptionGroup as eg:      # 3.11+
    ...
```

| Quy tắc | |
|---|---|
| Bắt cụ thể | `except ValueError`, không `except:` |
| Không nuốt | `pass` che bug |
| Giữ nguyên nhân | `raise ... from exc` |
| Không dùng assert validate | Bị tắt với `-O` |
| Log + re-raise | `logger.exception(...)` |

---

## 8. File, path, JSON, CSV

```python
from pathlib import Path

p = Path("data/guests.json")
p.parent.mkdir(parents=True, exist_ok=True)
text = p.read_text(encoding="utf-8")
p.write_text('{"ok": true}', encoding="utf-8")

with p.open("r", encoding="utf-8") as f:
    for line in f:
        ...

with p.open("a", encoding="utf-8") as f:
    f.write("line\n")

for file in Path(".").glob("**/*.py"):
    print(file)

import json
data = json.loads(text)
text = json.dumps(data, ensure_ascii=False, indent=2)

import csv
with open("in.csv", encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))

with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "side"])
    writer.writeheader()
    writer.writerows(rows)
```

```python
# Ghi atomic
import os, tempfile
fd, tmp = tempfile.mkstemp(dir=p.parent)
with os.fdopen(fd, "w", encoding="utf-8") as f:
    f.write(text)
os.replace(tmp, p)
```

---

## 9. Datetime

```python
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

now = datetime.now(timezone.utc)
vn = now.astimezone(ZoneInfo("Asia/Ho_Chi_Minh"))
print(vn.isoformat())
print(now + timedelta(days=7))
print(now.timestamp())

dt = datetime.fromisoformat("2026-10-29T21:00:00+07:00")
print(dt.strftime("%Y-%m-%d %H:%M"))
```

| Quy tắc | |
|---|---|
| Lưu UTC, dùng aware datetime | Tránh lệch múi giờ |
| Không `utcnow()` | Trả naive |
| API dùng ISO 8601 | Chuẩn, sort được |
| `zoneinfo` thay `pytz` | Chuẩn 3.9+ |

---

## 10. Stdlib hay dùng

```python
from collections import Counter, defaultdict, deque, namedtuple, ChainMap

Counter(words).most_common(5)
groups = defaultdict(list)
dq = deque(maxlen=100)
dq.appendleft(1); dq.pop()

from itertools import chain, islice, groupby, product, combinations, pairwise
list(chain(xs, ys))
list(islice(gen, 10))
list(pairwise(xs))                 # 3.10+

import re
PHONE = re.compile(r"^(?:\+84|0)(\d{9})$")
m = PHONE.match("0912345678")
if m:
    print(m.group(1))
re.findall(r"(\w+)=(\w+)", "a=1 b=2")
re.sub(r"\s+", " ", text)

import secrets
secrets.token_urlsafe(32)
secrets.choice(["a", "b"])

import hashlib, hmac
hashlib.sha256(b"data").hexdigest()
hmac.compare_digest(a, b)

import subprocess
subprocess.run(["git", "status"], check=True, capture_output=True, text=True)

import uuid
str(uuid.uuid4())

from decimal import Decimal
Decimal("0.1") + Decimal("0.2")
```

---

## 11. Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

logger.debug("x=%s", x)
logger.info("loaded %d guests", len(guests))
logger.warning("missing email for %s", name)
try:
    ...
except Exception:
    logger.exception("failed")
```

| Level | Dùng cho |
|---|---|
| DEBUG | Chi tiết dev |
| INFO | Sự kiện nghiệp vụ |
| WARNING | Bất thường có thể xử lý |
| ERROR | Thao tác thất bại |
| CRITICAL | Hệ thống không dùng được |

---

## 12. Type hint

```python
from collections.abc import Callable, Iterable, Mapping, Sequence
from typing import Any, Final, Literal, Never, Protocol, Self, TypedDict, TypeVar

def f(x: int | None, items: Sequence[str]) -> dict[str, int]: ...
def g(cb: Callable[[int], str]) -> None: ...
def h() -> Never: raise RuntimeError

T = TypeVar("T")
def first(xs: Sequence[T]) -> T: ...

class Notifier(Protocol):
    def send(self, to: str, msg: str) -> None: ...

class GuestDict(TypedDict):
    name: str
    side: Literal["bride", "groom"]

MAX: Final = 100

class Stack[T]:                       # 3.12+
    def push(self, item: T) -> None: ...

type UserId = int                     # 3.12+
```

---

## 13. Async

```python
import asyncio
import httpx

async def fetch(client, url: str) -> dict:
    r = await client.get(url)
    r.raise_for_status()
    return r.json()

async def main() -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        results = await asyncio.gather(
            *(fetch(client, u) for u in urls),
            return_exceptions=True,
        )
    print(results)

asyncio.run(main())
```

```python
async with asyncio.timeout(5):       # 3.11+
    await work()

async with asyncio.TaskGroup() as tg:  # 3.11+
    t1 = tg.create_task(work())
    t2 = tg.create_task(work())

await asyncio.to_thread(blocking_fn)   # 3.9+

sem = asyncio.Semaphore(20)
async with sem:
    await call()
```

| Không làm | Làm |
|---|---|
| `time.sleep` trong async | `await asyncio.sleep` |
| `requests` trong async | `httpx.AsyncClient` |
| Sync DB trong async | Async driver/`to_thread` |
| Fire-and-forget task | Giữ ref/TaskGroup |
| Nuốt `CancelledError` | Re-raise sau cleanup |

---

## 14. Concurrency

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

with ThreadPoolExecutor(max_workers=20) as pool:
    results = list(pool.map(fetch, urls))       # I/O-bound

with ProcessPoolExecutor() as pool:              # CPU-bound
    results = list(pool.map(cpu_task, items))

import threading
lock = threading.Lock()
with lock:
    counter += 1
```

| Tải | Chọn |
|---|---|
| I/O nhiều | asyncio/thread |
| CPU nhiều | process/vectorize |
| Job dài | queue worker |
| 10k connection | asyncio |

---

## 15. pytest

```python
import pytest

def test_add():
    assert add(1, 2) == 3

@pytest.mark.parametrize("a,b,expected", [(1, 2, 3), (0, 0, 0)])
def test_add_cases(a, b, expected):
    assert add(a, b) == expected

def test_raises():
    with pytest.raises(ValueError, match="dương"):
        withdraw(0)

@pytest.fixture
def repo(tmp_path):
    return Repo(tmp_path / "db.json")

def test_repo(repo):
    repo.add("Hoa")
    assert repo.all() == ["Hoa"]
```

```bash
pytest -q
pytest -k guest -x
pytest --lf
pytest --cov=src --cov-report=term-missing
pytest -n auto          # pytest-xdist
```

---

## 16. FastAPI tối giản

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI()

class GuestIn(BaseModel):
    name: str = Field(min_length=1)
    side: str = "bride"

class GuestOut(GuestIn):
    id: int

@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/guests", response_model=GuestOut, status_code=status.HTTP_201_CREATED)
def create_guest(payload: GuestIn) -> GuestOut:
    if payload.name == "bad":
        raise HTTPException(status_code=400, detail="Tên không hợp lệ")
    return GuestOut(id=1, **payload.model_dump())
```

```bash
uv run uvicorn app:app --reload
```

---

## 17. SQLAlchemy 2.0

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

stmt = select(Guest).where(Guest.side == "bride").limit(20)
guests = (await session.scalars(stmt)).all()

guest = await session.get(Guest, guest_id)
session.add(Guest(name="Hoa"))
await session.commit()

from sqlalchemy.orm import selectinload
stmt = select(Guest).options(selectinload(Guest.rsvps))
```

---

## 18. Debug nhanh

```python
breakpoint()                 # pdb
import traceback; traceback.print_exc()
```

| Lệnh pdb | |
|---|---|
| `n`, `s`, `c`, `r` | next/step/continue/return |
| `l` | source |
| `p expr`, `pp expr` | print |
| `w` | stack |
| `b file:line` | breakpoint |
| `q` | quit |

```bash
py-spy top --pid 1234
py-spy dump --pid 1234
python -m cProfile -s cumtime app.py | head -30
```

---

## 19. Recipe

```python
# Đọc file lớn theo dòng
def lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")

# Nhóm theo key
from collections import defaultdict
groups = defaultdict(list)
for item in items:
    groups[item["side"]].append(item)

# Sắp xếp nhiều khóa
sorted(items, key=lambda x: (x["side"], -x["age"]))

# Top N
import heapq
heapq.nlargest(5, items, key=lambda x: x["score"])

# Đếm
from collections import Counter
Counter(statuses)

# Chunk list
def chunks(xs, size):
    for i in range(0, len(xs), size):
        yield xs[i:i + size]

# Retry đơn giản
import time
for attempt in range(3):
    try:
        result = call()
        break
    except (TimeoutError, ConnectionError):
        if attempt == 2:
            raise
        time.sleep(0.5 * 2 ** attempt)

# So sánh float
import math
math.isclose(0.1 + 0.2, 0.3)

# Chuyển CSV → JSON
import csv, json
with open("in.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
with open("out.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
```

---

## 20. Bẫy nhanh

| Bẫy | Đúng |
|---|---|
| `def f(x=[])` | `None` + khởi tạo |
| `a is b` so giá trị | `==` |
| `dict.fromkeys(keys, [])` | comprehension |
| `s += part` vòng lớn | `"".join(parts)` |
| `list.remove` khi duyệt | duyệt copy |
| Float cho tiền | `Decimal`/int |
| `datetime.utcnow()` | `now(timezone.utc)` |
| `except: pass` | bắt cụ thể + log |
| `eval(input)` | parser/JSON |
| `pickle` input ngoài | JSON/Protobuf |
| `assert` validate | raise `ValueError` |
| Nối SQL f-string | bind parameter |
| `shell=True` | list args |
| Cache không giới hạn | LRU/TTL |
| Retry mọi lỗi | chỉ transient |
