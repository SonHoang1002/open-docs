# Python nâng cao — Data model, async, hiệu năng và đóng gói

> Dành cho người đã viết Python thành thạo: hiểu CPython thực thi code thế nào, dùng
> generator/decorator/descriptor/metaclass đúng chỗ, type hint ở quy mô lớn, async và
> concurrency, đo hiệu năng, đóng gói và thiết kế package. Baseline Python 3.12+.

---

## Mục lục

1. [Data model và object internals](#1-data-model-và-object-internals)
2. [Iterator và generator](#2-iterator-và-generator)
3. [Decorator](#3-decorator)
4. [Context manager](#4-context-manager)
5. [Descriptor và property](#5-descriptor-và-property)
6. [Metaprogramming](#6-metaprogramming)
7. [Type hint nâng cao](#7-type-hint-nâng-cao)
8. [Async I/O](#8-async-io)
9. [Concurrency và parallelism](#9-concurrency-và-parallelism)
10. [Bộ nhớ và garbage collection](#10-bộ-nhớ-và-garbage-collection)
11. [Hiệu năng và profiling](#11-hiệu-năng-và-profiling)
12. [Đóng gói và phân phối](#12-đóng-gói-và-phân-phối)
13. [Pattern và kiến trúc Pythonic](#13-pattern-và-kiến-trúc-pythonic)
14. [Import system và thời gian khởi động](#14-import-system-và-thời-gian-khởi-động)
15. [Anti-patterns nâng cao](#15-anti-patterns-nâng-cao)
16. [Tài liệu tham khảo](#16-tài-liệu-tham-khảo)

---

## 1. Data model và object internals

### 1.1 Mọi thứ là object

Trong Python, số, hàm, class, module, exception đều là object. Mỗi object có **identity**
(`id`), **type** và **value**. Tên biến chỉ là tham chiếu trong namespace.

```python
x = 42
print(id(x), type(x), x)      # id, <class 'int'>, 42
print(isinstance(True, int))  # True — bool là subclass của int
```

Ở CPython, mỗi object là `PyObject*` gồm refcount + pointer tới type object. Đây là lý do
`sys.getrefcount`, `gc`, `weakref` hoạt động như hiện tại.

| Khái niệm | Ý nghĩa | Kiểm tra |
|---|---|---|
| Identity | Cùng object hay không | `a is b`, `id(a)` |
| Type | Class thực tế | `type(a)`, `isinstance` |
| Value | Dữ liệu | `==`, `hash` |
| Namespace | Ánh xạ tên → object | `vars(obj)`, `globals()` |

### 1.2 Class, instance và `__dict__`

```python
class Guest:
    venue = "Hall"              # class attribute

    def __init__(self, name: str) -> None:
        self.name = name        # instance attribute

g = Guest("Hoa")
print(g.__dict__)               # {'name': 'Hoa'}
print(Guest.__dict__.keys())    # venue, __init__, __dict__, __weakref__, ...
```

Tra cứu attribute `g.name` thực hiện (đơn giản hóa):

1. Tìm **data descriptor** trong MRO của type (`property`, slot descriptor).
2. Tìm trong `g.__dict__`.
3. Tìm **non-data descriptor** hoặc class attribute trong MRO (hàm là non-data descriptor).
4. Nếu không thấy, gọi `__getattr__`.
5. Nếu vẫn không, ném `AttributeError`.

`__getattr__` chỉ gọi khi lookup thất bại; `__getattribute__` gọi cho **mọi** truy cập và
rất dễ gây đệ quy nếu viết sai. Ưu tiên `__getattr__`/property.

### 1.3 `__new__` và `__init__`

`__new__` tạo object, `__init__` khởi tạo object đã tạo. Hầu hết code chỉ cần `__init__`;
`__new__` dùng khi:

- Subclass immutable type (`int`, `str`, `tuple`).
- Singleton / flyweight / registry (cân nhắc kỹ).
- Kiểm soát allocation.

```python
class Temperature(float):
    def __new__(cls, celsius: float):
        if celsius < -273.15:
            raise ValueError("Dưới độ không tuyệt đối")
        return super().__new__(cls, celsius)

t = Temperature(25.5)
print(t, t + 1)     # 25.5 26.5
```

### 1.4 Equality, hash và contract

Quy tắc: `a == b` thì `hash(a) == hash(b)`. Ngược lại không bắt buộc (hash collision hợp lệ).
Object dùng làm dict key/set member phải **immutable trong suốt thời gian tồn tại**.

```python
class Guest:
    def __init__(self, name: str) -> None:
        self.name = name

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Guest):
            return NotImplemented
        return self.name == other.name

    def __hash__(self) -> int:
        return hash(self.name)
```

| Tình huống | Hệ quả |
|---|---|
| Định nghĩa `__eq__`, không `__hash__` | `__hash__` thành `None`, object unhashable |
| `frozen=True` dataclass | Sinh `__eq__` + `__hash__` nếu mọi field hashable |
| `eq=False` dataclass | Giữ identity equality/hash |
| Kế thừa `__eq__` | Có thể vi phạm symmetry nếu không cẩn thận |

Trả `NotImplemented` để Python thử `other.__eq__(self)`; đừng trả `False` ngay, sẽ sai với
subclass/kiểu khác.

### 1.5 Copy: shallow, deep và protocol

```python
import copy

a = [[1, 2], [3, 4]]
shallow = copy.copy(a)       # list mới, phần tử con chia sẻ
deep = copy.deepcopy(a)      # đệ quy copy toàn bộ

shallow[0].append(9)
print(a)                     # [[1, 2, 9], [3, 4]]
```

`copy` dùng `__copy__`/`__deepcopy__` nếu có, sau đó `__reduce_ex__`/pickle protocol. Với
object có resource (file, socket, lock), deepcopy thường không hợp lệ — định nghĩa
`__deepcopy__` trả `self` hoặc raise.

**Bẫy phổ biến:** `copy.copy` trên object lồng sâu không đủ; ngược lại `deepcopy` trên
object lớn rất chậm và có thể copy cả connection. Biết rõ mình cần mức nào.

### 1.6 Immutability thực sự

`frozen=True` chỉ chặn gán attribute, không làm object bên trong immutable:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    hosts: list[str]

cfg = Config(["a"])
cfg.hosts.append("b")     # vẫn được!
```

Muốn immutable sâu, dùng tuple/frozenset/MappingProxyType hoặc copy defensive. Đừng hứa
"immutable" nếu field vẫn mutable.

---

## 2. Iterator và generator

### 2.1 Protocol

**Iterable** có `__iter__` trả iterator. **Iterator** có `__next__` và `__iter__` trả chính
nó. Hết phần tử → `StopIteration`.

```python
class Countdown:
    def __init__(self, start: int) -> None:
        self.current = start

    def __iter__(self):
        return self

    def __next__(self) -> int:
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

for n in Countdown(3):
    print(n)          # 3 2 1
```

Iterator **dùng một lần**. Nếu cần lặp lại, tạo iterator mới hoặc lưu list.

### 2.2 Generator function

Hàm có `yield` trả generator; thân hàm chưa chạy cho tới lần `next()` đầu tiên.

```python
def read_guests(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            name, _, side = line.partition(",")
            if name.strip():
                yield {"name": name.strip(), "side": side.strip() or "bride"}

for guest in read_guests("guests.txt"):
    process(guest)
```

Ưu điểm: lazy, memory thấp, pipeline tự nhiên. Nhược điểm: khó debug hơn list, không
serialize/pickle trực tiếp, không biết độ dài nếu không tiêu thụ.

### 2.3 `send`, `throw`, `close`

Generator là coroutine đơn giản: có thể gửi giá trị vào `yield`, ném exception vào, đóng.

```python
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value

gen = accumulator()
next(gen)          # khởi động, trả 0
print(gen.send(10))  # 10
print(gen.send(5))   # 15
gen.close()
```

`yield` vừa nhận vừa trả. `close()` ném `GeneratorExit` tại điểm dừng; generator phải dọn
dẹp trong `finally` và không `yield` tiếp.

### 2.4 `yield from`

Ủy quyền cho iterable con, tự động chuyển `send`/`throw` và trả giá trị `return` của
generator con qua `StopIteration.value`.

```python
def inner():
    yield 1
    yield 2
    return "done"

def outer():
    result = yield from inner()
    yield result

print(list(outer()))     # [1, 2, 'done']
```

Dùng để nối pipeline, flatten, hoặc viết generator đệ quy có kiểm soát.

### 2.5 Generator expression và pipeline

```python
lines = (line.strip() for line in open("guests.txt", encoding="utf-8"))
names = (line.split(",")[0] for line in lines if line)
unique = dict.fromkeys(names)
print(len(unique))
```

Mỗi tầng là lazy; chỉ tải dần khi tiêu thụ. Cẩn thận: file có thể chưa đóng nếu pipeline
bị bỏ dở — dùng context manager bao ngoài hoặc generator function có `with`.

### 2.6 Generator vs list

| Tiêu chí | Generator | List |
|---|---|---|
| Bộ nhớ | O(1) | O(n) |
| Lặp lại | Không | Có |
| `len`/index | Không | Có |
| Tốc độ tạo | Nhanh | Chậm hơn |
| Debug | Khó hơn | Dễ hơn |
| Serialize | Không trực tiếp | Có |

Chọn generator khi dữ liệu lớn, chỉ duyệt một lần, hoặc pipeline I/O. Chọn list khi cần
truy cập ngẫu nhiên, đếm nhiều lần, hoặc dữ liệu nhỏ.

### 2.7 `itertools` nâng cao

```python
from itertools import (
    accumulate, chain, combinations, compress, count, cycle, dropwhile,
    groupby, islice, pairwise, permutations, product, takewhile, tee,
)

list(accumulate([1, 2, 3]))              # [1, 3, 6]
list(pairwise([1, 2, 3]))                 # [(1,2), (2,3)] — 3.10+
list(compress("ABCD", [1, 0, 1, 0]))      # ['A', 'C']
list(takewhile(lambda x: x < 3, count())) # [0, 1, 2]
a, b = tee(iter([1, 2, 3]), 2)            # nhân bản iterator
```

`groupby` yêu cầu dữ liệu đã sort theo key. `tee` tốn bộ nhớ đệm nếu hai nhánh lệch tốc độ.

---

## 3. Decorator

### 3.1 Bản chất

Decorator là hàm nhận callable, trả callable mới. `@deco` tương đương `f = deco(f)`.

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
            elapsed = time.perf_counter() - start
            print(f"{func.__name__} took {elapsed:.3f}s")
    return wrapper

@timed
def load(n: int) -> list[int]:
    return list(range(n))
```

`functools.wraps` giữ `__name__`, `__doc__`, `__wrapped__`, signature — quan trọng cho
debug, introspection, FastAPI, pytest.

### 3.2 Decorator có tham số

Cần thêm một lớp hàm:

```python
def retry(attempts: int = 3, exceptions: tuple[type[Exception], ...] = (Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions:
                    if attempt == attempts:
                        raise
                    time.sleep(0.2 * 2 ** (attempt - 1))
            raise AssertionError("unreachable")
        return wrapper
    return decorator

@retry(attempts=3, exceptions=(TimeoutError, ConnectionError))
def fetch(url: str) -> bytes: ...
```

Thứ tự: `@retry(...)` chạy trước để tạo decorator, rồi áp lên hàm.

### 3.3 Stacking và thứ tự

```python
@logged
@timed
def work(): ...

# tương đương work = logged(timed(work))
```

Decorator gần hàm chạy trước. Với auth/cache/retry, thứ tự ảnh hưởng semantics: cache
ngoài auth có thể trả dữ liệu trước khi kiểm tra quyền — sai.

### 3.4 Class decorator và decorator trên method

```python
def singleton(cls):
    instances = {}
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance
```

Decorator trên method nhận `self` như args bình thường; `functools.wraps` giữ binding đúng.
Với `@staticmethod`/`@classmethod`, đặt decorator của bạn **bên dưới** hoặc **bên trên**
cẩn thận — thứ tự quyết định nhận hàm thô hay descriptor.

### 3.5 Ứng dụng thực tế

| Decorator | Mục đích | Lưu ý |
|---|---|---|
| `@lru_cache` | Cache kết quả | Args phải hashable, không side effect |
| `@retry` | Retry lỗi transient | Chỉ idempotent, có backoff + jitter |
| `@timed` | Đo hiệu năng | Dùng metric, không `print` production |
| `@transactional` | Bao transaction | Rollback đúng exception |
| `@requires_role` | Authorization | Không cache trước khi check |
| `@deprecated` | Cảnh báo API cũ | `warnings.warn(..., DeprecationWarning)` |
| `@app.get` | Đăng ký route | FastAPI/Flask dùng metadata |

### 3.6 Bẫy

- Quên `functools.wraps` → mất signature, docs, FastAPI không parse đúng.
- Decorator giữ reference tới `self`/request → memory leak.
- Cache vô hạn trên hàm nhận argument lớn → OOM.
- Retry cả `ValueError`/lỗi logic → lặp vô ích, che bug.
- Decorator che exception type → khó debug; luôn `raise` nguyên hoặc `from`.

---

## 4. Context manager

### 4.1 Protocol

`with` gọi `__enter__`, chạy block, rồi `__exit__(exc_type, exc, tb)`. Trả `True` từ
`__exit__` để **nuốt** exception (hiếm khi đúng).

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        self.elapsed = time.perf_counter() - self.start
        return False        # không nuốt exception

with Timer() as timer:
    do_work()
print(timer.elapsed)
```

### 4.2 `@contextmanager`

Viết context manager bằng generator, gọn hơn class:

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

with transaction(session) as tx:
    tx.add(guest)
```

Code trước `yield` là enter, sau `yield` là exit. Bắt `BaseException` để rollback cả
`KeyboardInterrupt`/`CancelledError`, rồi re-raise.

### 4.3 `contextlib` hữu ích

```python
from contextlib import ExitStack, closing, nullcontext, suppress

with suppress(FileNotFoundError):
    Path("optional.json").unlink()

with closing(open("data.txt", encoding="utf-8")) as f:
    ...

with ExitStack() as stack:
    files = [stack.enter_context(open(p, encoding="utf-8")) for p in paths]
    # tất cả được đóng khi ra khỏi with, kể cả khi lỗi giữa chừng
```

`ExitStack` cực hữu ích khi số resource động. `nullcontext` cho phép bật/tắt context
theo config mà không cần if lặp.

### 4.4 Async context manager

```python
class AsyncSession:
    async def __aenter__(self):
        self.conn = await connect()
        return self.conn

    async def __aexit__(self, exc_type, exc, tb):
        await self.conn.close()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    await startup()
    try:
        yield
    finally:
        await shutdown()
```

FastAPI dùng `lifespan` để quản lý startup/shutdown; không mở connection ở top-level module.

### 4.5 Quy tắc

1. Mọi resource (file, socket, lock, transaction, temp dir) nên có context manager.
2. Không nuốt exception bằng `return True` trừ khi có lý do rất rõ.
3. `__exit__` phải idempotent và không raise che exception gốc.
4. Với async, dùng `async with`; trộn sync context manager trong async có thể block loop.

---

## 5. Descriptor và property

### 5.1 Descriptor protocol

Descriptor là object định nghĩa `__get__`, tùy chọn `__set__`/`__delete__`. Nó là cơ chế
đằng sau `property`, `classmethod`, `staticmethod`, function binding, slot.

| Loại | Có `__set__`/`__delete__` | Ưu tiên |
|---|---|---|
| Data descriptor | Có | Trước `instance.__dict__` |
| Non-data descriptor | Không | Sau `instance.__dict__` |

```python
class Positive:
    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name, 0)

    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} phải dương")
        obj.__dict__[self.name] = value

class Order:
    quantity = Positive()
    price = Positive()
```

`__set_name__` được gọi tự động khi class được tạo, cho descriptor biết tên attribute.
Đây là cách ORM/SQLAlchemy map column.

### 5.2 Property

`property` là data descriptor tiện dụng:

```python
class Guest:
    def __init__(self, name: str) -> None:
        self._name = ""

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str) -> None:
        if not value.strip():
            raise ValueError("Tên rỗng")
        self._name = value.strip()
```

Không viết getter/setter vô nghĩa cho mọi field. Chỉ dùng property khi cần validate, tính
toán, lazy load, hoặc giữ API tương thích.

### 5.3 `cached_property`

```python
from functools import cached_property

class Report:
    def __init__(self, rows: list[dict]) -> None:
        self.rows = rows

    @cached_property
    def total(self) -> int:
        return sum(row["amount"] for row in self.rows)
```

Lần đầu tính, sau đó lưu vào `__dict__`. Không dùng với `__slots__` (không có `__dict__`)
và cẩn thận với object mutable — cache không tự invalidate.

### 5.4 Function binding

Hàm là non-data descriptor: `guest.greet` trả bound method, `Guest.greet` trả function.
Đây là lý do `self` được truyền tự động.

```python
class Guest:
    def greet(self) -> str:
        return "hi"

g = Guest()
print(g.greet)          # bound method
print(Guest.greet(g))   # gọi tường minh
```

Hiểu điều này giúp debug decorator, monkeypatch, và các lỗi "takes 0 positional arguments
but 1 was given".

### 5.5 Descriptor trong thực tế

- SQLAlchemy `Column`/`mapped_column` map attribute ↔ cột.
- Django `Field` mô tả column.
- `attrs`/`dataclasses` slot.
- Validation framework (Pydantic dùng metaclass + `__getattr__`/`__setattr__`).
- Lazy loading, computed field, cached value.

> ⚠️ Đừng tự viết descriptor nếu property/`cached_property` đủ. Descriptor mạnh nhưng khó
> debug, đặc biệt khi tương tác với `__slots__`, kế thừa và dataclass.

---

## 6. Metaprogramming

### 6.1 `__getattr__` và `__setattr__`

```python
class Config:
    def __init__(self, data: dict) -> None:
        object.__setattr__(self, "_data", data)

    def __getattr__(self, name: str):
        try:
            return self._data[name]
        except KeyError as exc:
            raise AttributeError(name) from exc
```

`__getattr__` chỉ chạy khi lookup thường thất bại. Không dùng nó để che lỗi typo — hãy
raise `AttributeError` đúng cách.

`__setattr__` can thiệp mọi phép gán, rất dễ gây vòng lặp; dùng `object.__setattr__` hoặc
property thay thế.

### 6.2 `__init_subclass__`

Hook chạy khi subclass được định nghĩa; thay thế metaclass cho nhu cầu đơn giản như đăng
ký plugin, validate cấu hình class.

```python
class Plugin:
    registry: dict[str, type["Plugin"]] = {}

    def __init_subclass__(cls, *, name: str | None = None, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[name or cls.__name__.lower()] = cls

class CsvPlugin(Plugin, name="csv"):
    pass

print(Plugin.registry["csv"])   # <class 'CsvPlugin'>
```

### 6.3 Metaclass

Metaclass là "class của class", kiểm soát việc tạo class. Chỉ dùng khi cần can thiệp
**namespace/class creation** mà `__init_subclass__`/decorator không làm được.

```python
class SingletonMeta(type):
    _instances: dict[type, object] = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    pass
```

`type(name, bases, namespace)` tạo class động. `__prepare__` trả mapping dùng trong thân
class (ví dụ giữ thứ tự hoặc chặn tên). Metaclass conflict xảy ra khi đa kế thừa nhiều
metaclass không tương thích.

> 💡 Thứ tự ưu tiên: decorator → `__init_subclass__` → metaclass. Chọn cái đơn giản nhất
> giải quyết vấn đề.

### 6.4 Dataclass internals

`@dataclass` đọc `__annotations__`, sinh `__init__`, `__repr__`, `__eq__`, tùy chọn
`__hash__`, `__lt__`. Field có default phải đứng sau field không default (trừ `kw_only`).
`__post_init__` chạy cuối `__init__` để validate/derive.

```python
@dataclass(slots=True, kw_only=True)
class Money:
    amount: Decimal
    currency: str = "VND"

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("amount >= 0")
```

Với `frozen=True`, muốn set trong `__post_init__` phải dùng
`object.__setattr__(self, "field", value)`. Đây là chi tiết hay gặp khi derive field.

### 6.5 Dynamic code: `eval`, `exec`, `ast`

`eval`/`exec` chạy code tùy ý → RCE nếu input không tin cậy. Hầu như luôn có cách an toàn hơn:

| Nhu cầu | Cách an toàn |
|---|---|
| Parse literal | `ast.literal_eval` |
| Cấu hình | JSON/TOML/YAML safe load |
| Biểu thức số học | Parser riêng hoặc `ast` + whitelist |
| Plugin | Entry points/importlib, không exec string |
| Template | Jinja2 sandbox (vẫn cẩn thận) |

Nếu buộc dùng `ast`, whitelist node type và giới hạn độ sâu/kích thước.

### 6.6 Monkeypatch có kỷ luật

Monkeypatch hữu ích trong test hoặc vá khẩn cấp, nhưng trong production:

- Ghi rõ lý do, phạm vi, version.
- Ưu tiên adapter/wrapper hơn sửa global.
- Tránh patch thư viện bên thứ ba nếu có thể nâng version/fork.
- Luôn có test bảo vệ hành vi sau patch.

---

## 7. Type hint nâng cao

### 7.1 Mục tiêu

Type hint không làm Python nhanh hơn và không bắt buộc runtime. Nó giúp:

- Phát hiện lỗi sớm bằng mypy/pyright.
- IDE autocomplete/refactor.
- Tài liệu hợp đồng giữa module/team.
- Sinh schema (Pydantic/FastAPI) từ annotation.

### 7.2 Cú pháp hiện đại

```python
from collections.abc import Callable, Iterable, Mapping, Sequence
from typing import Any, Final, Literal, Never, Self, TypedDict

type UserId = int                          # 3.12+
type Handler = Callable[[str], bool]

class User(TypedDict):
    id: UserId
    name: str
    role: Literal["admin", "member"]

def find(users: Iterable[User], user_id: UserId) -> User | None:
    return next((u for u in users if u["id"] == user_id), None)

def clone(self: Self) -> Self: ...         # 3.11+

def fail(msg: str) -> Never:
    raise RuntimeError(msg)

MAX_RETRIES: Final = 3
```

| Kiểu | Dùng khi |
|---|---|
| `Any` | Biên chưa biết, dần thay bằng kiểu cụ thể |
| `object` | Mọi giá trị, buộc thu hẹp trước khi dùng |
| `Never` | Hàm không return (raise/loop vô hạn) |
| `Literal` | Tập hằng cố định |
| `Final` | Không gán lại |
| `ClassVar` | Attribute của class, không phải instance |
| `Self` | Trả về cùng kiểu class (factory/fluent API) |

### 7.3 Generic và variance

```python
from typing import TypeVar

T = TypeVar("T")
Number = TypeVar("Number", int, float)          # constrained
Comparable = TypeVar("Comparable", bound="SupportsRichComparison")

def first(items: Sequence[T]) -> T:
    if not items:
        raise ValueError("empty")
    return items[0]
```

Python 3.12:

```python
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

def pair[T](a: T, b: T) -> tuple[T, T]:
    return a, b
```

Variance: `TypeVar` mặc định invariant. `Sequence`/`Iterable` covariant; `list` invariant
(vì mutable). Nếu tự viết Protocol, đặt `covariant=True`/`contravariant=True` đúng chỗ.

### 7.4 Protocol và structural typing

```python
from typing import Protocol, runtime_checkable

class Notifier(Protocol):
    def send(self, to: str, message: str) -> None: ...

@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

def shutdown(resource: Closeable) -> None:
    resource.close()
```

`@runtime_checkable` chỉ kiểm tra **sự tồn tại** method, không kiểm tra signature/kiểu.
Tránh `isinstance` với Protocol phức tạp; ưu tiên static check.

### 7.5 `ParamSpec` cho decorator

```python
from typing import ParamSpec, TypeVar
from collections.abc import Callable

P = ParamSpec("P")
R = TypeVar("R")

def logged(func: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"call {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
```

`ParamSpec` giữ nguyên signature của hàm được decorate; `Concatenate` thêm tham số cố
định (ví dụ `self`).

### 7.6 `overload`, `TypeGuard`, `TypeIs`

```python
from typing import overload, TypeGuard

@overload
def parse(value: str) -> str: ...
@overload
def parse(value: bytes) -> bytes: ...
def parse(value: str | bytes) -> str | bytes:
    return value.strip()

def is_str_list(values: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(v, str) for v in values)

from typing import TypeIs   # 3.13+
def is_int(value: object) -> TypeIs[int]:
    return isinstance(value, int)
```

`overload` chỉ có tác dụng tĩnh; implementation cuối cùng là cái chạy. `TypeGuard` thu hẹp
nhánh true; `TypeIs` thu hẹp cả true và false, chính xác hơn.

### 7.7 TypedDict, Unpack

```python
from typing import NotRequired, TypedDict, Unpack

class Pagination(TypedDict):
    limit: int
    offset: NotRequired[int]

def list_guests(**kwargs: Unpack[Pagination]) -> list[str]:
    return []
```

3.11+ có `NotRequired`/`Required`, `Unpack` cho `**kwargs` có schema. Hữu ích cho wrapper
API/CLI nhưng đừng lạm dụng thay dataclass.

### 7.8 mypy/pyright ở quy mô lớn

| Cấu hình | Tác dụng |
|---|---|
| `strict = true` (mypy) | Bật toàn bộ check nghiêm |
| `disallow_untyped_defs` | Buộc annotate |
| `warn_return_any` | Không trả `Any` ngầm |
| `no_implicit_optional` | `x: int = None` bị báo lỗi |
| `exclude` | Bỏ qua legacy có kế hoạch |
| `py.typed` | Đánh dấu package có type cho consumer |
| `.pyi` stub | Type cho package không có annotation |

Chiến lược migration:

1. Bật check ở module mới trước.
2. Thêm annotation cho public API/domain.
3. Dùng `Any` có kiểm soát ở biên, dần thu hẹp.
4. `# type: ignore[mã]` kèm ticket, không ignore cả file.
5. CI chặn regression, không chặn toàn bộ legacy ngay.

### 7.9 Runtime validation

Type hint không validate JSON/HTTP input. Dùng Pydantic v2 hoặc schema:

```python
from pydantic import BaseModel, Field, EmailStr

class GuestIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr | None = None
    side: Literal["bride", "groom"] = "bride"
```

Pydantic parse/coerce/validate và sinh JSON Schema. Đừng tự viết `if not isinstance(...)`
cho mọi field.

---

## 8. Async I/O

### 8.1 Khi nào dùng

Async hiệu quả khi có **nhiều I/O chờ song song**: HTTP, DB, Redis, file/network. Không
giúp CPU-bound; CPU-bound dùng process hoặc đẩy sang service khác.

| Tải | Công cụ |
|---|---|
| Nhiều kết nối I/O đồng thời | `asyncio` + async client |
| CPU-bound | `ProcessPoolExecutor`, C/Rust extension |
| I/O blocking không có async lib | `asyncio.to_thread`/executor |
| Job nền | Celery/RQ/arq + worker riêng |

### 8.2 Coroutine và event loop

```python
import asyncio

async def fetch_one(client, url: str) -> dict:
    response = await client.get(url)
    response.raise_for_status()
    return response.json()

async def main() -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        results = await asyncio.gather(
            *(fetch_one(client, url) for url in urls)
        )
    print(len(results))

if __name__ == "__main__":
    asyncio.run(main())
```

`async def` tạo coroutine object; **không chạy** cho tới khi `await` hoặc bọc thành task.
`asyncio.run` tạo loop, chạy đến hết, đóng loop. Không gọi trong loop đang chạy.

### 8.3 Task, gather, TaskGroup

```python
async def worker(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return name

async def gather_demo():
    results = await asyncio.gather(
        worker("a", 0.2),
        worker("b", 0.1),
        return_exceptions=True,
    )
    print(results)      # ['a', 'b'] hoặc exception objects

async def group_demo():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(worker("a", 0.2))
        t2 = tg.create_task(worker("b", 0.1))
    print(t1.result(), t2.result())
```

| Cách | Hành vi lỗi |
|---|---|
| `gather(..., return_exceptions=False)` | Raise lỗi đầu tiên; task khác **không** bị hủy |
| `gather(..., return_exceptions=True)` | Trả exception như value |
| `TaskGroup` (3.11+) | Hủy các task còn lại, gom lỗi thành `ExceptionGroup` |

Với nghiệp vụ "tất cả hoặc không", `TaskGroup` an toàn hơn. Với "cái nào xong trước cũng
được", dùng `asyncio.wait(..., return_when=FIRST_COMPLETED)` và hủy phần còn lại.

### 8.4 Timeout và cancellation

```python
async def with_timeout():
    try:
        async with asyncio.timeout(5):       # 3.11+
            await slow_operation()
    except TimeoutError:
        print("quá 5s")

async def cancellable():
    task = asyncio.create_task(slow_operation())
    try:
        await asyncio.wait_for(task, timeout=5)
    except TimeoutError:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task
```

`CancelledError` kế thừa `BaseException` (từ 3.8), **phải re-raise** sau khi dọn dẹp. Nuốt
nó làm task không hủy được, gây treo shutdown/leak.

`asyncio.shield(task)` bảo vệ task con khỏi bị hủy khi caller bị hủy, nhưng caller vẫn
nhận `CancelledError`; task con tiếp tục chạy — phải quản lý vòng đời.

### 8.5 Không block event loop

```python
import time
import asyncio
import httpx

async def bad():
    time.sleep(1)                  # chặn toàn bộ loop!
    requests.get("https://x")      # sync HTTP, chặn loop

async def good():
    await asyncio.sleep(1)
    async with httpx.AsyncClient() as client:
        await client.get("https://x")

async def cpu_bound():
    return await asyncio.to_thread(compute_heavy)   # 3.9+
```

Sync DB driver (psycopg2), ORM sync, đọc file lớn, `bcrypt` cost cao — đều có thể block.
Chọn async driver (asyncpg, psycopg 3 async, aiosqlite) hoặc đẩy sang thread/process.

### 8.6 Async iterator, context manager, queue

```python
async def consume(queue: asyncio.Queue[int]) -> None:
    while True:
        item = await queue.get()
        try:
            await handle(item)
        finally:
            queue.task_done()

async def producer(queue: asyncio.Queue[int]) -> None:
    for i in range(100):
        await queue.put(i)          # chờ nếu queue đầy (backpressure)
    await queue.join()
```

`asyncio.Queue(maxsize=N)` tạo backpressure; không đặt maxsize có thể OOM khi producer
nhanh hơn consumer. `Semaphore` giới hạn concurrency:

```python
sem = asyncio.Semaphore(20)

async def fetch(url: str) -> dict:
    async with sem:
        return await client.get(url)
```

### 8.7 Lỗi async thường gặp

| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Quên `await` | Coroutine không chạy, warning | Bật warning, review kỹ |
| Gọi sync I/O trong async | Block toàn bộ service | Dùng async lib/`to_thread` |
| Fire-and-forget task | Task bị GC hoặc lỗi không ai biết | Giữ reference, `TaskGroup`, callback |
| `gather` không xử lý lỗi | Task khác chạy tiếp, resource leak | `TaskGroup`/`return_exceptions` |
| Nuốt `CancelledError` | Shutdown treo | Re-raise sau cleanup |
| Tạo loop mới trong thread/async | `RuntimeError` | Một loop mỗi thread, `asyncio.run` ở entry |
| Không giới hạn concurrency | Quá tải DB/API | Semaphore/queue maxsize |
| Timeout không đặt | Treo vô hạn | Timeout ở mọi I/O biên |

### 8.8 Debug async

```bash
PYTHONASYNCIODEBUG=1 python app.py
```

```python
import asyncio

async def main():
    loop = asyncio.get_running_loop()
    loop.slow_callback_duration = 0.1
    ...
```

- `asyncio.all_tasks()` xem task còn sống.
- `task.get_stack()`/`print_stack()` khi treo.
- Đặt tên task: `asyncio.create_task(coro, name="fetch-guests")`.
- Dùng `anyio`/`trio` nếu cần structured concurrency chặt hơn; FastAPI dùng anyio.

---

## 9. Concurrency và parallelism

### 9.1 GIL là gì

CPython dùng **Global Interpreter Lock**: tại một thời điểm chỉ một thread chạy bytecode
Python. Hệ quả:

- Thread hữu ích cho **I/O-bound** (network, file, DB) vì thời gian chờ nhả GIL.
- Thread **không** tăng tốc CPU-bound thuần Python.
- C extension có thể nhả GIL (NumPy, hashlib, zlib) → đa luồng vẫn hiệu quả.
- Không bảo vệ logic phức tạp: `counter += 1` vẫn có thể race.

Từ 3.13 có build **free-threaded** (PEP 703) thử nghiệm; 3.14 chính thức hỗ trợ nhưng
hiệu năng single-thread thấp hơn, extension phải opt-in. Chưa mặc định cho production
phổ thông.

### 9.2 Thread

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch(url: str) -> bytes:
    ...

with ThreadPoolExecutor(max_workers=20) as pool:
    futures = {pool.submit(fetch, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            data = future.result()
        except Exception:
            logger.exception("fetch failed: %s", url)
```

| Công cụ | Dùng khi |
|---|---|
| `ThreadPoolExecutor` | I/O-bound, thư viện sync |
| `threading.Thread` | Vòng lặp nền dài hạn, cần kiểm soát |
| `queue.Queue` | Producer/consumer thread-safe |
| `threading.Lock/RLock` | Bảo vệ state chia sẻ |
| `Event/Condition/Semaphore` | Đồng bộ nâng cao |

Race condition:

```python
counter = 0
def increment():
    global counter
    for _ in range(100_000):
        counter += 1        # read-modify-write không atomic

threads = [threading.Thread(target=increment) for _ in range(4)]
...
# Kết quả thường < 400_000
```

Sửa bằng `Lock`, hoặc tránh shared mutable state (tốt hơn). Deadlock xảy ra khi nhiều lock
không có thứ tự cố định; quy ước lock ordering và timeout.

### 9.3 Process

```python
from concurrent.futures import ProcessPoolExecutor

def cpu_task(n: int) -> int:
    return sum(i * i for i in range(n))

if __name__ == "__main__":          # bắt buộc trên macOS/Windows (spawn)
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(cpu_task, range(8)))
```

Process có memory riêng, tránh GIL, nhưng:

- Argument/return phải **pickle được**.
- Khởi động tốn kém; dùng cho task đủ lớn.
- Không chia sẻ state dễ dàng; dùng `multiprocessing.Queue`/`Manager`/shared memory.
- Trên macOS/Windows dùng `spawn`, phải có `if __name__ == "__main__"`.
- Log/exception cần cấu hình lại trong worker.

`ProcessPoolExecutor` phù hợp batch CPU (resize ảnh, tính toán, parse lớn). Với tính toán
nặng thật, cân nhắc vectorized NumPy, Cython, Rust/PyO3 hoặc service riêng.

### 9.4 Chọn mô hình

| Tải | Mô hình | Lý do |
|---|---|---|
| 10k kết nối HTTP/WebSocket | asyncio | Chi phí thấp, chờ I/O |
| Gọi API/DB sync có sẵn | ThreadPool | Tận dụng thư viện sync |
| CPU-bound batch | ProcessPool | Bỏ GIL, dùng nhiều core |
| CPU-bound trong web request | Queue + worker | Không block request |
| Job dài, cần retry | Celery/RQ/arq | Bền vững, quan sát được |
| Data lớn | Spark/Polars/DuckDB | Scale ngoài Python |

> 💡 Đừng dùng cả ba mô hình trong một service nhỏ. Chọn mô hình chính (thường async cho
> API), đẩy phần khác sang worker.

### 9.5 Thread safety của built-in

Một số thao tác CPython "atomic" do GIL (list.append, dict set/get) nhưng **không** đảm bảo
trong free-threaded build và không bảo vệ logic nhiều bước. Quy tắc: nếu có read-modify-write
hoặc nhiều cấu trúc liên quan, dùng lock hoặc thiết kế immutable.

### 9.6 Subinterpreter

Python 3.12 có per-interpreter GIL (PEP 684), 3.14 có `concurrent.interpreters` (PEP 734).
Mỗi interpreter có GIL/namespace riêng, chia sẻ ít state. Đây là hướng song song mới nhưng
hệ sinh thái extension chưa phổ cập; đánh giá kỹ trước khi dùng production.

---

## 10. Bộ nhớ và garbage collection

### 10.1 Reference counting

CPython giải phóng object ngay khi refcount về 0. Đây là cơ chế chính, nhanh và tất định.
`sys.getrefcount(obj)` trả refcount + 1 (do argument tạm).

```python
import sys
x = []
print(sys.getrefcount(x))   # 2 (x + argument)
y = x
print(sys.getrefcount(x))   # 3
```

### 10.2 Cycle và generational GC

Reference cycle không được refcount xử lý; GC chu kỳ quét định kỳ theo 3 thế hệ. Có thể
tắt (`gc.disable()`) nhưng thường không nên; điều chỉnh threshold chỉ khi hiểu rõ.

```python
import gc
gc.collect()
gc.get_count()
gc.get_threshold()      # (700, 10, 10)
```

`gc.freeze()` chuyển object hiện có sang permanent generation, giảm chi phí GC khi fork
(pre-fork server) — dùng cẩn thận.

### 10.3 Leak thường gặp

| Nguồn leak | Dấu hiệu | Cách xử lý |
|---|---|---|
| Global cache không giới hạn | RAM tăng theo traffic | LRU/TTL, maxsize |
| `lru_cache` giữ object lớn | RAM tăng theo unique args | Giới hạn/bỏ cache |
| Closure giữ `self`/request | Object không được giải phóng | Weakref, tránh closure dài hạn |
| Exception traceback giữ frame | Leak theo lỗi | Không lưu exception lâu, `exc.clear()`? |
| Listener/callback không remove | Tăng dần | `weakref`, unsubscribe |
| Thread/task không kết thúc | Thread/task tăng | Timeout, cancellation, join |
| C extension | Khó thấy | `tracemalloc`, valgrind, `py-spy` |

> ⚠️ Exception object giữ traceback → giữ frame → giữ mọi biến local. Đừng cache exception
> trong list global để "xem sau"; log rồi bỏ.

### 10.4 `weakref`

Tham chiếu không làm tăng refcount; object bị GC thì weakref trả `None`.

```python
import weakref

class Listener:
    pass

_listeners: weakref.WeakSet[Listener] = weakref.WeakSet()
listener = Listener()
_listeners.add(listener)
del listener
print(len(_listeners))      # 0
```

| Công cụ | Dùng cho |
|---|---|
| `weakref.ref` | Tham chiếu đơn |
| `WeakSet` | Tập listener |
| `WeakKeyDictionary` | Metadata gắn object, không giữ object sống |
| `WeakValueDictionary` | Cache object có thể bị giải phóng |
| `weakref.finalize` | Cleanup thay `__del__` |

### 10.5 `__del__` và finalizer

`__del__` không được đảm bảo gọi lúc shutdown, có thể gây cycle không thu gom được (trước
3.4), và chạy trong ngữ cảnh không rõ. Dùng context manager hoặc `weakref.finalize`:

```python
import weakref

class Connection:
    def close(self) -> None: ...

conn = Connection()
weakref.finalize(conn, conn.close)
```

### 10.6 Đo memory

```python
import tracemalloc

tracemalloc.start()
# ... chạy workload ...
snapshot = tracemalloc.take_snapshot()
for stat in snapshot.statistics("lineno")[:10]:
    print(stat)
```

| Công cụ | Mục đích |
|---|---|
| `tracemalloc` | Allocation theo file/dòng, so sánh snapshot |
| `sys.getsizeof` | Kích thước nông của một object |
| `pympler.asizeof` | Kích thước sâu (kèm dependency) |
| `objgraph` | Đồ thị tham chiếu, tìm leak |
| `memory_profiler` | Memory theo dòng (overhead cao) |
| `py-spy`/`memray` | Profiling production/native |

`sys.getsizeof([])` chỉ tính list object, không tính phần tử; đừng dùng để ước lượng
payload thật.

---

## 11. Hiệu năng và profiling

### 11.1 Nguyên tắc

1. **Đo trước, tối ưu sau.** Cảm giác "chỗ này chậm" thường sai.
2. **Tối ưu theo complexity trước** (O(n²) → O(n log n)), hằng số sau.
3. **Đo trên workload thật**, không microbenchmark vô nghĩa.
4. **Đặt mục tiêu** (p95 < 200ms) và đo lại sau thay đổi.
5. **Giữ code dễ đọc**; chỉ hy sinh clarity khi lợi ích đo được.

### 11.2 Công cụ

```bash
python -m cProfile -o profile.out app.py
python -c "import pstats; pstats.Stats('profile.out').sort_stats('cumtime').print_stats(20)"
```

| Công cụ | Loại | Khi dùng |
|---|---|---|
| `time.perf_counter` | Đo thủ công | Đo một block |
| `timeit` | Microbenchmark | So sánh implementation nhỏ |
| `cProfile` | Deterministic profiler | Tìm hàm tốn thời gian |
| `pstats` | Đọc profile | Sort cumulative/tottime |
| `py-spy` | Sampling, không sửa code | Production, process đang chạy |
| `scalene` | CPU + memory + GPU | Tìm hotspot chi tiết |
| `line_profiler` | Theo dòng | Tối ưu hàm cụ thể |
| `hyperfine` | Benchmark CLI | So sánh lệnh/cấu hình |
| `asv` | Benchmark suite | Theo dõi regression |

```python
import timeit
print(timeit.timeit("'-'.join(str(i) for i in range(100))", number=10_000))
```

`cProfile` thêm overhead; số tương đối hữu ích, số tuyệt đối không dùng làm SLA. `tottime`
= thời gian trong hàm, `cumtime` = gồm hàm con.

### 11.3 Đòn tối ưu theo thứ tự

| Thứ tự | Đòn | Ví dụ |
|---|---|---|
| 1 | Bỏ việc không cần làm | Cache, early return, query đúng |
| 2 | Thuật toán/data structure | dict/set thay list scan, heapq |
| 3 | Giảm I/O/round-trip | Batch query, connection pool, async |
| 4 | Vector hóa | NumPy/Polars thay vòng lặp Python |
| 5 | Giảm allocation | Generator, slots, tái sử dụng buffer |
| 6 | C extension/native | NumPy, Cython, Rust/PyO3, Numba |
| 7 | JIT/implementation | PyPy (CPU-bound thuần), 3.13 JIT thử nghiệm |

### 11.4 Tối ưu Python thuần

```python
# Chậm: attribute lookup + append + format lặp
result = []
for item in items:
    result.append(str(item.value))

# Nhanh hơn: list comprehension, biến local
values = [item.value for item in items]
strings = [str(v) for v in values]

# Tìm kiếm: list O(n) → set O(1)
allowed = {"yes", "no", "maybe"}
if status in allowed: ...

# Nối chuỗi
text = "".join(parts)          # không dùng += trong vòng lớn

# Đếm
from collections import Counter
counts = Counter(words)
```

Các vi tối ưu chỉ đáng khi nằm trong hot path đã đo. Đừng làm code khó đọc vì tiết kiệm
vài % không ai thấy.

### 11.5 Tối ưu ở tầng hệ thống

- **DB:** index đúng, tránh N+1, `EXPLAIN`, connection pool, batch insert, pagination.
- **Serialization:** hoặc JSON đơn giản, hoặc orjson/msgspec; tránh serialize lặp.
- **Network:** keep-alive, HTTP/2, gzip, timeout, retry có backoff.
- **Cache:** Redis/local, TTL, chống stampede.
- **Async:** giới hạn concurrency, tránh block loop.
- **Frontend:** phân trang, trả field cần thiết, ETag.

> 💡 Phần lớn "Python chậm" trong production thực chất là N+1 query, gọi API tuần tự, thiếu
> index, payload quá lớn hoặc GC pressure — không phải tốc độ ngôn ngữ.

### 11.6 Đo latency đúng

- Phân biệt p50/p95/p99; trung bình che outlier.
- Đo end-to-end và từng tầng (API, DB, external).
- Loại trừ warmup/JIT/cache lần đầu.
- Ghi lại môi trường, version, dữ liệu đầu vào.
- So sánh cùng điều kiện; đừng so laptop với CI yếu.

---

## 12. Đóng gói và phân phối

### 12.1 `pyproject.toml` chuẩn

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "guestbook"
version = "0.3.0"
description = "Quản lý khách mời"
readme = "README.md"
requires-python = ">=3.12"
license = {text = "MIT"}
authors = [{name = "An", email = "an@example.com"}]
dependencies = [
    "fastapi>=0.115,<1",
    "pydantic>=2.8,<3",
    "sqlalchemy>=2.0,<3",
]

[project.optional-dependencies]
dev = ["pytest>=8", "pytest-cov", "ruff", "mypy", "httpx"]

[project.scripts]
guestbook = "guestbook.cli:main"

[tool.hatch.build.targets.wheel]
packages = ["src/guestbook"]
```

`requires-python` là hợp đồng với người dùng; đặt đúng phiên bản tối thiểu thực sự hỗ trợ.
Dependencies nên có bound hợp lý; app dùng lockfile, library để range rộng hơn.

### 12.2 uv workflow

```bash
uv init --package guestbook
uv add fastapi sqlalchemy
uv add --dev pytest ruff mypy
uv lock
uv sync --frozen
uv run pytest
uv build
uv publish
```

| Lệnh | Tác dụng |
|---|---|
| `uv add` | Thêm dependency + lock |
| `uv sync --frozen` | Cài đúng lock, CI |
| `uv lock --upgrade` | Nâng dependency có kiểm soát |
| `uv build` | Tạo wheel + sdist |
| `uv publish` | Upload PyPI/private index |
| `uv tree` | Xem cây dependency |

Commit `uv.lock` cho application; với library, cân nhắc (nhiều team vẫn commit để CI tái lập).

### 12.3 Layout và đóng gói

```text
guestbook/
├── src/guestbook/
│   ├── __init__.py
│   └── py.typed          # đánh dấu package có type
├── tests/
├── pyproject.toml
└── README.md
```

- `src/` tránh import nhầm source chưa cài.
- `py.typed` để mypy/pyright dùng annotation khi consumer import.
- Không commit `build/`, `dist/`, `*.egg-info`, `.venv/`.
- Wheel là artifact cài đặt; sdist là source. Library nên phát hành cả hai.
- Native extension cần manylinux/macOS/Windows wheel; cân nhắc `cibuildwheel`.

### 12.4 Versioning

Semantic Versioning: `MAJOR.MINOR.PATCH`.

| Thay đổi | Tăng |
|---|---|
| Breaking API | MAJOR |
| Feature tương thích | MINOR |
| Bug fix | PATCH |

Với Python, "breaking" gồm đổi signature, bỏ Python version, đổi behavior mặc định, đổi
exception type public. Ghi changelog theo người dùng, không theo commit.

### 12.5 Dependency hygiene

- Ghim/lock để tái lập; định kỳ `uv lock --upgrade`.
- Kiểm tra license (MIT/Apache/BSD/GPL) trước khi dùng thương mại.
- Chạy `pip-audit`/`osv-scanner` trong CI.
- Ít dependency hơn = ít rủi ro; đừng thêm thư viện cho một hàm 10 dòng.
- Kiểm tra maintenance: commit gần nhất, issue mở, release, security policy.
- Tránh dependency chỉ hỗ trợ platform không dùng.

### 12.6 Docker cho Python

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY --from=builder /app/.venv /app/.venv
COPY src ./src
ENV PATH="/app/.venv/bin:$PATH"
RUN useradd --create-home app && chown -R app:app /app
USER app
CMD ["uvicorn", "guestbook.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

| Thực hành | Lý do |
|---|---|
| Multi-stage | Image nhỏ, không chứa compiler |
| Non-root | Giảm thiệt hại nếu bị xâm nhập |
| `PYTHONUNBUFFERED=1` | Log ra ngay |
| Pin base image digest | Tái lập |
| `.dockerignore` | Không copy `.venv`, test, secret |
| Healthcheck | Orchestrator biết trạng thái |
| Graceful shutdown | Không cắt request giữa chừng |

---

## 13. Pattern và kiến trúc Pythonic

### 13.1 Nguyên tắc

Python không cần nhồi pattern Java. Hàm là first-class, duck typing và Protocol giảm
ceremony. Chỉ trừu tượng khi có **biến thể thật** hoặc **ranh giới cần test**.

### 13.2 Strategy

```python
from typing import Protocol

class Discount(Protocol):
    def apply(self, amount: int) -> int: ...

def no_discount(amount: int) -> int:
    return amount

def ten_percent(amount: int) -> int:
    return amount * 9 // 10

def total(amount: int, discount=no_discount) -> int:
    return discount(amount)
```

Với một hàm, truyền callable là đủ — không cần class `DiscountStrategyFactory`.

### 13.3 Factory

```python
class Notifier:
    _registry: dict[str, type["Notifier"]] = {}

    def __init_subclass__(cls, *, channel: str, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._registry[channel] = cls

    @classmethod
    def create(cls, channel: str) -> "Notifier":
        try:
            return cls._registry[channel]()
        except KeyError:
            raise ValueError(f"Kênh không hỗ trợ: {channel}") from None

class EmailNotifier(Notifier, channel="email"):
    pass
```

Registry + `__init_subclass__` gọn hơn if/elif dài và hỗ trợ plugin.

### 13.4 Adapter

Bọc thư viện bên thứ ba để domain không phụ thuộc trực tiếp:

```python
class PaymentGateway(Protocol):
    def charge(self, token: str, amount: int) -> str: ...

class StripeAdapter:
    def __init__(self, client) -> None:
        self.client = client

    def charge(self, token: str, amount: int) -> str:
        result = self.client.charges.create(amount=amount, source=token)
        return result["id"]
```

Đổi provider chỉ sửa adapter; test dùng fake.

### 13.5 Repository + Unit of Work

```python
class GuestRepository(Protocol):
    def add(self, guest: Guest) -> None: ...
    def get(self, guest_id: int) -> Guest | None: ...
    def all(self) -> list[Guest]: ...

class SqlGuestRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, guest: Guest) -> None:
        self.session.add(GuestModel.from_domain(guest))
```

Repository che ORM; Unit of Work (session/transaction) quyết định commit boundary. Đừng
trả ORM entity ra ngoài domain nếu muốn tách tầng.

### 13.6 Dependency Injection

Không cần framework:

```python
class GuestService:
    def __init__(self, repo: GuestRepository, notifier: Notifier) -> None:
        self.repo = repo
        self.notifier = notifier

# production
service = GuestService(SqlGuestRepository(session), EmailNotifier())
# test
service = GuestService(InMemoryGuestRepository(), FakeNotifier())
```

Constructor injection rõ ràng, dễ test. FastAPI `Depends` làm điều tương tự ở tầng HTTP.

### 13.7 Singleton

Module-level instance là singleton tự nhiên:

```python
# settings.py
from functools import lru_cache

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

`@lru_cache` tạo singleton lazy, test có thể `get_settings.cache_clear()`. Tránh singleton
giữ state mutable/request-specific.

### 13.8 Observer

```python
from weakref import WeakSet

class EventBus:
    def __init__(self) -> None:
        self._subscribers: WeakSet = WeakSet()

    def subscribe(self, handler) -> None:
        self._subscribers.add(handler)

    def publish(self, event) -> None:
        for handler in list(self._subscribers):
            handler(event)
```

WeakSet tránh leak khi subscriber bị bỏ. Với async, publish phải await hoặc đẩy queue.

### 13.9 Kiến trúc phân tầng

```text
API/HTTP → Service (use case) → Domain → Repository → DB
```

| Tầng | Trách nhiệm | Không nên |
|---|---|---|
| API | Parse/validate, auth, status code | Business logic |
| Service | Use case, transaction boundary | SQL/HTTP chi tiết |
| Domain | Entity, rule, invariant | Import FastAPI/SQLAlchemy |
| Repository | Persistence | Business rule |
| Infrastructure | DB, queue, external API | Domain model |

Với service nhỏ, có thể gộp API + service; đừng tạo 10 tầng cho CRUD 3 bảng. Tách khi
logic phức tạp, nhiều nguồn dữ liệu, hoặc cần test độc lập.

### 13.10 Khi nào không dùng pattern

- Chỉ có một implementation và không có kế hoạch thay đổi → gọi trực tiếp.
- CRUD đơn giản → ORM + router là đủ.
- Trừu tượng làm test khó hơn → bỏ.
- Pattern chỉ để "cho giống enterprise" → nợ kỹ thuật.

---

## 14. Import system và thời gian khởi động

### 14.1 Cách import hoạt động

`import x`:

1. Kiểm tra `sys.modules` — đã import thì trả luôn.
2. Tìm spec qua `sys.meta_path` (finder), dựa trên `sys.path`.
3. Loader tạo module object, chạy code top-level.
4. Gắn vào `sys.modules`.

`sys.path` thường gồm: thư mục script (hoặc `''`), `PYTHONPATH`, site-packages. Đây là lý
do chạy script trong repo có thể che package đã cài.

```python
import sys
print(sys.path)

import importlib.util
print(importlib.util.find_spec("guestbook"))
```

### 14.2 Lazy import

```python
# module-level __getattr__ (PEP 562)
def __getattr__(name: str):
    if name == "heavy":
        from . import heavy
        return heavy
    raise AttributeError(name)
```

Hoặc import trong hàm khi chỉ dùng ở một nhánh. Giảm startup, tránh circular, nhưng đừng
giấu dependency toàn cục — có thể gây lỗi runtime khó phát hiện.

### 14.3 Đo startup

```bash
python -X importtime -c "import guestbook" 2> importtime.log
```

Các nguyên nhân chậm thường gặp:

- Import pandas/numpy/sqlalchemy ở top-level không cần thiết.
- Kết nối DB/API khi import.
- Load model ML lớn.
- Circular import phức tạp.
- Quá nhiều plugin tự đăng ký.

Serverless/Lambda đặc biệt nhạy với cold start; lazy import + provisioned concurrency.

### 14.4 Namespace package

PEP 420 cho phép package không có `__init__.py`, hữu ích khi nhiều distribution chia sẻ
namespace (`company.service.a`, `company.service.b`). Với app thông thường, dùng
`__init__.py` để rõ ràng và kiểm soát export.

### 14.5 `__all__` và API public

```python
# guestbook/__init__.py
from .models import Guest
from .service import GuestService

__all__ = ["Guest", "GuestService"]
```

Đánh dấu API public; thay đổi bên trong không phá consumer nếu không nằm trong `__all__`.
Với library, cân nhắc `_internal` cho module không public.

---

## 15. Anti-patterns nâng cao

| Anti-pattern | Vì sao nguy hiểm | Cách đúng |
|---|---|---|
| Metaclass cho mọi thứ | Khó hiểu, khó debug, conflict | `__init_subclass__`, decorator |
| `__getattr__` che typo | Lỗi thành công âm thầm | Chỉ dùng cho proxy rõ ràng |
| `eval`/`exec` input | RCE | Parser/AST whitelist |
| `pickle` từ network | RCE | JSON/Protobuf + validate |
| Async gọi sync DB | Block loop, timeout dây chuyền | Async driver/thread |
| `gather` không xử lý lỗi | Task mồ côi, leak | `TaskGroup`, giữ reference |
| Thread cho CPU-bound | Không nhanh hơn, còn chậm | ProcessPool/vectorize |
| `deepcopy` object lớn/connection | Chậm, lỗi | Copy chọn lọc, `__deepcopy__` |
| Cache không bound | OOM | LRU/TTL |
| Global mutable config | Race, test khó | Settings immutable, DI |
| Retry mọi exception | Che bug, khuếch đại tải | Chỉ transient + idempotent |
| Log f-string trong hot path | Tốn format | `logger.info("%s", x)` |
| Tối ưu chưa đo | Code khó đọc vô ích | Profile trước |
| Bắt `BaseException` | Nuốt shutdown | Bắt `Exception` cụ thể |
| `datetime.utcnow()` | Naive, sai múi giờ | `now(timezone.utc)` |
| Float cho tiền | Sai số | Decimal/int |
| `assert` cho validation | Bị tắt `-O` | Raise exception |
| Broad `except` rồi `return None` | Mất ngữ cảnh lỗi | Log + raise/trả Result |
| Dependency không pin | Build không tái lập | Lockfile |
| `sys.path.append` bừa | Import shadowing | Package chuẩn, cài editable |

---

## 16. Tài liệu tham khảo

- Python Data Model: https://docs.python.org/3/reference/datamodel.html
- Descriptor HowTo: https://docs.python.org/3/howto/descriptor.html
- Functional Programming HOWTO: https://docs.python.org/3/howto/functional.html
- asyncio: https://docs.python.org/3/library/asyncio.html
- `concurrent.futures`: https://docs.python.org/3/library/concurrent.futures.html
- `gc`: https://docs.python.org/3/library/gc.html
- `tracemalloc`: https://docs.python.org/3/library/tracemalloc.html
- typing spec: https://typing.readthedocs.io/
- mypy: https://mypy.readthedocs.io/
- Pyright: https://microsoft.github.io/pyright/
- Packaging guide: https://packaging.python.org/
- uv: https://docs.astral.sh/uv/
- PEP 703 — free-threaded CPython: https://peps.python.org/pep-0703/
- PEP 684 — per-interpreter GIL: https://peps.python.org/pep-0684/
- PEP 695 — type parameter syntax: https://peps.python.org/pep-0695/
- Fluent Python, 2nd edition — Ramalho
- CPython Internals — Shaw

---

*Tiếp theo: [`python-production.md`](./python-production.md) để áp dụng vào service thật:
FastAPI, SQLAlchemy, test, CI/CD, observability, security và vận hành.*
