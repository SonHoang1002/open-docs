# Python cơ bản — Từ cú pháp đến chương trình chạy được

> Nền tảng Python 3.12+: cách interpreter chạy code, kiểu dữ liệu, collection, hàm, OOP,
> exception, file, stdlib, type hint, pytest và debug. Ví dụ xuyên suốt là bài toán
> **quản lý khách mời wedding** — đủ nhỏ để hiểu, đủ thật để dùng lại.

---

## Mục lục

1. [Chạy Python và cấu trúc chương trình](#1-chạy-python-và-cấu-trúc-chương-trình)
2. [Biến, kiểu dữ liệu và toán tử](#2-biến-kiểu-dữ-liệu-và-toán-tử)
3. [Collection](#3-collection)
4. [Điều khiển luồng](#4-điều-khiển-luồng)
5. [Hàm](#5-hàm)
6. [Lập trình hướng đối tượng](#6-lập-trình-hướng-đối-tượng)
7. [Exception](#7-exception)
8. [Module và package](#8-module-và-package)
9. [File và dữ liệu](#9-file-và-dữ-liệu)
10. [Thư viện chuẩn](#10-thư-viện-chuẩn)
11. [Type hint cơ bản](#11-type-hint-cơ-bản)
12. [Test với pytest](#12-test-với-pytest)
13. [Debug và lỗi thường gặp](#13-debug-và-lỗi-thường-gặp)
14. [Ví dụ tổng hợp: guestbook CLI](#14-ví-dụ-tổng-hợp-guestbook-cli)
15. [Bài tập có đáp án](#15-bài-tập-có-đáp-án)
16. [Anti-patterns cơ bản](#16-anti-patterns-cơ-bản)
17. [Tài liệu tham khảo](#17-tài-liệu-tham-khảo)

---

## 1. Chạy Python và cấu trúc chương trình

### 1.1 Từ source đến bytecode

CPython thực hiện: **lex → parse → compile sang bytecode → chạy trên virtual machine**.
Bytecode được cache trong `__pycache__/*.pyc` (chỉ để tăng tốc khởi động, không phải
native code). Không có bước biên dịch thủ công bắt buộc; `python file.py` là đủ.

```bash
python3 --version                 # 3.12.x
python3 -c "print(2 ** 100)"      # chạy một biểu thức
python3 -m http.server 8000       # chạy module như script
python3 -i app.py                 # vào REPL sau khi chạy, giữ biến
python3 -m pdb app.py             # debugger
```

| Cách chạy | Khi dùng |
|---|---|
| `python script.py` | Script độc lập |
| `python -m package.module` | Module trong package, import đúng |
| `python -c "..."` | Một dòng kiểm tra nhanh |
| `uv run ...` | Chạy trong môi trường dự án, không cần activate |
| `console_scripts` | CLI cài qua `pip install`, gọi bằng tên lệnh |

### 1.2 `__name__ == "__main__"`

Khi chạy trực tiếp, `__name__` là `"__main__"`. Khi import, nó là tên module. Guard này
cho phép cùng một file vừa import được vừa chạy được:

```python
# src/guestbook/cli.py
def main() -> None:
    print("Chạy guestbook")


if __name__ == "__main__":
    main()
```

`python -m guestbook.cli` chạy `main()`, còn `import guestbook.cli` không chạy gì.

### 1.3 Script, module, package

| Khái niệm | Định nghĩa | Ví dụ |
|---|---|---|
| Script | File `.py` chạy trực tiếp | `manage.py` |
| Module | Một file `.py` import được | `guestbook/models.py` |
| Package | Thư mục có `__init__.py` (hoặc namespace package) | `guestbook/` |
| Distribution | Gói cài được qua pip | `guestbook==1.2.0` |

Một file có thể là cả script và module; package là cách tổ chức nhiều module.

### 1.4 Cấu trúc tối thiểu

```text
guestbook/
├── pyproject.toml
├── README.md
├── src/guestbook/
│   ├── __init__.py
│   ├── models.py
│   └── cli.py
└── tests/test_models.py
```

> 💡 Dùng layout `src/` để tránh import nhầm thư mục hiện tại thay vì package đã cài.
> Đây là nguyên nhân rất phổ biến của lỗi "chạy được trên máy tôi nhưng CI fail".

---

## 2. Biến, kiểu dữ liệu và toán tử

### 2.1 Biến là tên gắn với object

Python **dynamic nhưng strong typing**: biến không có kiểu cố định, object có kiểu;
không tự ép `"1" + 1`. Gán là **bind tên vào object**, không copy giá trị.

```python
x = 10
y = x
y += 1          # int immutable → tạo object mới, x vẫn 10
print(x, y)     # 10 11

a = [1, 2]
b = a           # cùng object
b.append(3)
print(a)        # [1, 2, 3]
print(a is b)   # True
```

| Hàm | Ý nghĩa |
|---|---|
| `id(obj)` | Định danh object trong bộ nhớ (CPython: địa chỉ) |
| `type(obj)` | Kiểu thực tế |
| `isinstance(obj, T)` | Kiểm tra kiểu, tôn trọng kế thừa |
| `type(obj) is T` | So khớp chính xác, ít dùng |

`is` so **identity**, `==` so **giá trị**. Không dùng `is` để so số/chuỗi, trừ `is None`,
`is True`, `is False` (và sentinel tự tạo).

```python
a = [1, 2]
b = [1, 2]
a == b          # True
a is b          # False
a is None       # False
```

> ⚠️ CPython cache số nhỏ `-5..256` và intern một số chuỗi, nên `a is b` đôi khi `True`
> ngoài ý muốn. Đó là chi tiết implementation, đừng dựa vào.

### 2.2 Số

```python
count = 42                  # int, chính xác vô hạn
ratio = 0.1 + 0.2           # 0.30000000000000004 (IEEE 754)
price = Decimal("0.1") + Decimal("0.2")   # Decimal("0.3")
z = 3 + 4j                  # complex
big = 10 ** 100             # int tự mở rộng
```

| Kiểu | Dùng cho | Lưu ý |
|---|---|---|
| `int` | Đếm, id, tiền (đơn vị nhỏ nhất) | Không tràn như C |
| `float` | Đo lường, khoa học | Sai số nhị phân; so sánh bằng `math.isclose` |
| `Decimal` | Tiền, kế toán | Khởi tạo từ **string**, không từ float |
| `Fraction` | Tỉ lệ chính xác | Chậm hơn |

```python
from decimal import Decimal, ROUND_HALF_UP
from math import isclose

assert isclose(0.1 + 0.2, 0.3, rel_tol=1e-9)
money = Decimal("19.99") * 3
money.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)   # Decimal('59.97')
```

Toán tử: `+ - * / // % **`, `//` là floor division, `%` theo dấu số chia. Python không
có `++`/`--`; dùng `x += 1`.

### 2.3 Chuỗi

Chuỗi là **immutable sequence of Unicode code points**. `len("ế")` là 1, nhưng một số
ký tự có thể gồm nhiều code point (combining marks) — cẩn thận khi đếm grapheme.

```python
name = "Nguyễn An"
greeting = f"Chào {name.upper()}!"      # f-string
raw = r"C:\Users\an"                    # raw string, không xử lý escape
multi = """Dòng 1
Dòng 2"""
b = "xin chào".encode("utf-8")          # bytes
s = b.decode("utf-8")                    # str
```

| Thao tác | Ví dụ | Kết quả |
|---|---|---|
| Cắt | `"guestbook"[0:5]` | `"guest"` |
| Tách | `"a,b,c".split(",")` | `["a", "b", "c"]` |
| Nối | `",".join(["a", "b"])` | `"a,b"` |
| Thay | `"a-b".replace("-", "_")` | `"a_b"` |
| Strip | `"  x \n".strip()` | `"x"` |
| Tìm | `"abc".find("b")` | `1` (không thấy: `-1`) |
| Đếm | `"banana".count("a")` | `3` |
| Kiểm tra | `"123".isdigit()` | `True` |
| Format | `f"{price:.2f}"` | `"19.99"` |
| Căn lề | `f"{name:>10}"` | padding trái |

f-string (3.6+) là cách format mặc định; 3.12 cho phép biểu thức/quote linh hoạt hơn:

```python
value = 3.14159
print(f"{value=}, {value:.2f}, {value:>8}")   # value=3.14159, 3.14,    3.14
```

**Nối chuỗi trong vòng lặp:** tránh `s += part` với hàng nghìn phần tử vì tạo object
mới liên tục; dùng `"".join(parts)`. Với vài chục phần tử, khác biệt không đáng kể.

**So sánh chuỗi:** phân biệt hoa/thường, Unicode normalization. Tìm kiếm người dùng nên
`casefold()`:

```python
"Nguyễn".casefold() == "nguyễn".casefold()   # True
```

### 2.4 `None` và truthiness

`None` là singleton, nghĩa "không có giá trị". Không dùng `0`, `""`, `[]` thay `None` nếu
ý nghĩa khác nhau.

| Giá trị falsy | Ghi chú |
|---|---|
| `None`, `False` | |
| `0`, `0.0`, `0j`, `Decimal("0")` | |
| `""`, `b""` | Chuỗi rỗng |
| `[]`, `()`, `{}`, `set()` | Collection rỗng |
| `range(0)` | |

Mọi thứ khác truthy, kể cả `"False"`, `[0]`, `-1`.

```python
items = []
if not items:
    print("rỗng")

name = None
display = name or "Khách"        # fallback, nhưng "" cũng thành "Khách"
display = "Khách" if name is None else name   # rõ nghĩa hơn
```

### 2.5 Ép kiểu

```python
int("42"), float("3.5"), str(42), bool("")     # 42, 3.5, "42", False
list("abc")                                     # ['a', 'b', 'c']
tuple([1, 2])                                   # (1, 2)
set([1, 1, 2])                                  # {1, 2}
```

Ép kiểu có thể ném `ValueError`/`TypeError`; validate dữ liệu đầu vào trước khi ép.

---

## 3. Collection

### 3.1 List

Mảng động, có thứ tự, index từ 0, cho phép trùng và phần tử khác kiểu (nhưng nên đồng
nhất). Truy cập index là O(1); chèn/xóa đầu list là O(n).

```python
guests = ["Hoa", "Minh", "Lan"]
guests.append("Hùng")          # cuối
guests.insert(1, "Mai")        # O(n)
last = guests.pop()            # lấy và xóa cuối
first = guests.pop(0)          # O(n)
guests.remove("Minh")          # xóa theo giá trị, lỗi nếu không có
guests[0] = "Chị Hoa"
len(guests), "Lan" in guests

nums = [3, 1, 2]
nums.sort()                    # tại chỗ, trả None
ordered = sorted(nums, reverse=True)  # tạo list mới
```

**Slicing** tạo bản sao nông:

```python
xs = [0, 1, 2, 3, 4]
xs[1:4]      # [1, 2, 3]
xs[:2]       # [0, 1]
xs[::2]      # [0, 2, 4]
xs[::-1]     # đảo ngược
xs[10:]      # [] — không lỗi
xs[10]       # IndexError
```

**Copy:** `b = a[:]` hoặc `b = list(a)` là shallow copy. Với list lồng nhau, phần tử con
vẫn chia sẻ:

```python
import copy
a = [[1], [2]]
b = a.copy()
b[0].append(9)
print(a)             # [[1, 9], [2]]
c = copy.deepcopy(a) # copy toàn bộ
```

### 3.2 Tuple và namedtuple

Tuple immutable, hashable nếu mọi phần tử hashable; dùng cho bản ghi nhỏ, trả nhiều giá
trị, key của dict.

```python
point = (10.5, 20.0)
x, y = point
single = (42,)          # phẩy bắt buộc
empty = ()

from collections import namedtuple
Guest = namedtuple("Guest", ["name", "side"])
g = Guest("Hoa", "bride")
print(g.name, g.side)
```

Với cấu trúc có method, dùng `@dataclass(frozen=True)` thay namedtuple (xem §6.5).

### 3.3 Dict

Ánh xạ key → value, key phải hashable, giữ thứ tự chèn từ 3.7. Truy cập/insert trung
bình O(1).

```python
rsvp = {"Hoa": "yes", "Minh": "no"}
rsvp["Lan"] = "maybe"
rsvp.get("Hùng", "chưa trả lời")     # không ném lỗi
rsvp.setdefault("Mai", "pending")    # chỉ set nếu chưa có
"Lan" in rsvp
rsvp.pop("Minh", None)
rsvp.update({"Hùng": "yes"})
merged = {**rsvp, "An": "yes"}
merged = rsvp | {"An": "yes"}        # 3.9+
```

**Bẫy `fromkeys`:**

```python
bad = dict.fromkeys(["a", "b"], [])   # cùng một list cho mọi key!
bad["a"].append(1)                    # {'a': [1], 'b': [1]}
good = {key: [] for key in ["a", "b"]}
```

**Duyệt dict:**

```python
for name, status in rsvp.items():
    print(name, status)

for index, (name, status) in enumerate(rsvp.items(), start=1):
    print(index, name, status)
```

Không sửa dict về kích thước trong lúc duyệt; duyệt `list(rsvp)` nếu cần xóa.

### 3.4 Set

Tập hợp không trùng, không index, kiểm tra membership trung bình O(1). Phần tử phải
hashable.

```python
bride = {"Hoa", "Minh", "Lan"}
groom = {"Minh", "Hùng"}
bride | groom        # hợp
bride & groom        # giao
bride - groom        # hiệu
bride ^ groom        # đối xứng
bride <= {"Hoa", "Minh", "Lan", "Mai"}   # subset
```

Dùng set để khử trùng nhưng **không giữ thứ tự**; nếu cần giữ thứ tự, dùng `dict.fromkeys`:

```python
unique_ordered = list(dict.fromkeys(["b", "a", "b", "c"]))   # ['b', 'a', 'c']
```

### 3.5 Comprehension

Cú pháp tạo collection từ iterable, ngắn và nhanh hơn vòng lặp + append.

```python
numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]
evens = [n for n in numbers if n % 2 == 0]
pairs = [(n, n * n) for n in numbers]
lookup = {n: n * n for n in numbers}
unique = {n % 3 for n in numbers}

matrix = [[1, 2], [3, 4]]
flat = [x for row in matrix for x in row]      # thứ tự: for trái → phải
```

Tương đương vòng lặp:

```python
squares = []
for n in numbers:
    squares.append(n * n)
```

**Khi nào không dùng:** comprehension lồng 3 cấp, có side effect, logic nhiều bước, hoặc
dài quá ~2 dòng — viết vòng lặp dễ đọc hơn. Generator expression `(n*n for n in numbers)`
không tạo list, dùng khi chỉ lặp một lần.

### 3.6 Unpacking

```python
first, *rest = [1, 2, 3, 4]        # first=1, rest=[2,3,4]
head, *middle, tail = "abcdef"     # head='a', tail='f'
a, b = b, a                         # hoán đổi
point = (1, 2)
x, y = point
print(*[1, 2, 3])                   # 1 2 3
merged = [*[1, 2], *[3, 4]]         # [1, 2, 3, 4]
```

### 3.7 Sắp xếp

`sort`/`sorted` ổn định (stable), dùng Timsort O(n log n). Key function chạy một lần cho
mỗi phần tử.

```python
guests = [
    {"name": "Hoa", "side": "bride", "age": 30},
    {"name": "Minh", "side": "groom", "age": 28},
    {"name": "Lan", "side": "bride", "age": 25},
]
by_age = sorted(guests, key=lambda g: g["age"])
by_side_then_age = sorted(guests, key=lambda g: (g["side"], g["age"]))
by_age_desc = sorted(guests, key=lambda g: g["age"], reverse=True)
```

So sánh tuple theo từng phần tử từ trái sang phải. Không trộn kiểu không so sánh được
(ví dụ `str` với `int`) — sẽ `TypeError`.

### 3.8 Độ phức tạp cần nhớ

| Thao tác | list | dict/set |
|---|---|---|
| Truy cập index/key | O(1) | O(1) trung bình |
| Tìm theo giá trị | O(n) | O(1) trung bình |
| Append/add | O(1) amortized | O(1) amortized |
| Insert/delete đầu | O(n) | — |
| Duyệt | O(n) | O(n) |
| Sắp xếp | O(n log n) | — |

> 💡 Chọn collection theo **truy vấn chính**, không theo thói quen: cần tra cứu nhanh →
> dict/set; cần thứ tự + index → list; cần bất biến/hash → tuple/frozenset.

---

## 4. Điều khiển luồng

### 4.1 `if` và biểu thức điều kiện

```python
status = "yes"
if status == "yes":
    label = "Tham dự"
elif status == "no":
    label = "Không tham dự"
else:
    label = "Chờ phản hồi"

label = "Tham dự" if status == "yes" else "Khác"
```

Python không có `switch` truyền thống trước 3.10; `match/case` thay thế hiện đại. Với
ánh xạ đơn giản, dict lookup rõ hơn chuỗi if:

```python
labels = {"yes": "Tham dự", "no": "Không tham dự"}
label = labels.get(status, "Chờ phản hồi")
```

### 4.2 `for`, `while`, `else`

`for` lặp qua iterable (không phải chỉ số). `for/else` chạy `else` nếu vòng lặp kết thúc
**không** qua `break`.

```python
for guest in guests:
    if guest.name == "Minh":
        print("Tìm thấy")
        break
else:
    print("Không có Minh")

count = 0
while count < 3:
    count += 1
else:
    print("while kết thúc bình thường")
```

`range(start, stop, step)` không tạo list; `range(5)` = 0..4. `enumerate` lấy index;
`zip` ghép nhiều iterable, dừng ở cái ngắn nhất (3.10+ `strict=True` để báo lệch độ dài).

```python
for i, guest in enumerate(guests, start=1):
    print(i, guest)

for name, status in zip(names, statuses, strict=True):
    print(name, status)
```

`reversed(seq)` trả iterator; `sorted(seq)` trả list mới.

### 4.3 `match/case` (3.10+)

Structural pattern matching: so khớp **cấu trúc**, không chỉ giá trị. Không có fallthrough;
`case _` là mặc định.

```python
def handle(command: str) -> str:
    match command.split():
        case ["add", name]:
            return f"Thêm {name}"
        case ["remove", name]:
            return f"Xóa {name}"
        case ["list"] | ["ls"]:
            return "Danh sách"
        case ["add", *rest] if rest:
            return f"Thêm nhiều: {', '.join(rest)}"
        case _:
            return "Không hiểu lệnh"


match payload:
    case {"type": "rsvp", "status": status}:
        return f"RSVP: {status}"
    case {"type": "message", "text": text} if text:
        return text[:100]
    case [first, *rest]:
        return f"{first} + {len(rest)}"
```

Với class, pattern dùng thuộc tính hoặc `__match_args__` (dataclass tự sinh):

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

def origin(p: Point) -> bool:
    match p:
        case Point(x=0, y=0):
            return True
        case Point(x=0) | Point(y=0):
            return False
        case _:
            return False
```

**Bẫy:** `case "yes" | "no"` là OR pattern, không phải so sánh; biến trong pattern luôn
bind, không so với biến ngoài (trừ dotted name/constant). Đừng lạm dụng match cho logic
đơn giản.

### 4.4 Walrus `:=` (3.8+)

Gán trong biểu thức, hữu ích khi vừa kiểm tra vừa dùng:

```python
line = "  Hoa,bride  "
if (cleaned := line.strip()):
    print(cleaned)

while (chunk := file.read(8192)):
    process(chunk)

values = [y for x in data if (y := transform(x)) is not None]
```

Không dùng để "tiết kiệm dòng" làm giảm readability.

### 4.5 `break`, `continue`, `pass`

- `break`: thoát vòng lặp gần nhất.
- `continue`: bỏ phần còn lại của iteration.
- `pass`: no-op, dùng cho placeholder (nhưng thường là dấu hiệu code chưa xong).
- Không có goto; có thể dùng hàm + `return` để thoát sớm.

---

## 5. Hàm

### 5.1 Định nghĩa và tham số

```python
def greet(name: str, prefix: str = "Chào") -> str:
    """Trả lời chào cho một khách mời."""
    return f"{prefix} {name}"


def create_guest(name: str, /, side: str, *, table: int | None = None) -> dict:
    """name positional-only, side positional-or-keyword, table keyword-only."""
    return {"name": name, "side": side, "table": table}
```

| Cú pháp | Ý nghĩa |
|---|---|
| `def f(a, b=1)` | Tham số mặc định |
| `def f(*args)` | Gom positional vào tuple |
| `def f(**kwargs)` | Gom keyword vào dict |
| `def f(a, /, b)` | `a` chỉ truyền positional (3.8+) |
| `def f(*, b)` | `b` chỉ truyền keyword |
| `f(*xs, **opts)` | Mở gói khi gọi |

**Mutable default — bẫy kinh điển:** giá trị mặc định được đánh giá **một lần** khi định
nghĩa hàm.

```python
def add_guest_bad(name: str, guests: list[str] = []) -> list[str]:
    guests.append(name)
    return guests

add_guest_bad("Hoa")     # ['Hoa']
add_guest_bad("Minh")    # ['Hoa', 'Minh'] — không phải ['Minh']!

def add_guest(name: str, guests: list[str] | None = None) -> list[str]:
    guests = [] if guests is None else guests
    guests.append(name)
    return guests
```

Tương tự với `dict`, `set`, `datetime.now()` (nếu muốn thời điểm gọi) và object khác.
Dùng sentinel `object()` nếu cần phân biệt "không truyền" với `None`.

### 5.2 Trả về nhiều giá trị

Python trả một tuple; có thể unpack:

```python
def split_name(full: str) -> tuple[str, str]:
    first, *_, last = full.split()
    return first, last

first, last = split_name("Nguyễn Văn An")
```

Không trả dict mơ hồ; nếu kết quả phức tạp, dùng dataclass/NamedTuple có tên field.

### 5.3 Scope: LEGB

Thứ tự tìm tên: **Local → Enclosing → Global → Built-in**. Gán trong hàm tạo biến local
trừ khi khai báo `global`/`nonlocal`.

```python
counter = 0

def increment() -> None:
    global counter
    counter += 1

def make_counter():
    count = 0
    def inner() -> int:
        nonlocal count
        count += 1
        return count
    return inner
```

`global` thường là mùi thiết kế xấu; ưu tiên truyền tham số/trả giá trị hoặc dùng class.

### 5.4 Closure và late binding

Closure giữ biến của scope ngoài. Bẫy: closure trong vòng lặp bind **biến**, không bind
giá trị tại thời điểm tạo.

```python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])        # [2, 2, 2]

funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])        # [0, 1, 2]
```

### 5.5 Lambda, higher-order, functools

```python
double = lambda x: x * 2          # chỉ nên dùng cho key/callback cực ngắn
names = sorted(guests, key=lambda g: g["name"])

def apply(func, value):
    return func(value)

apply(str.upper, "hoa")           # 'HOA'

from functools import partial, reduce
def power(base: int, exponent: int) -> int:
    return base ** exponent

square = partial(power, exponent=2)
square(5)                         # 25
reduce(lambda acc, x: acc + x, [1, 2, 3], 0)   # 6
```

List comprehension thường rõ hơn `map`/`filter` + lambda:

```python
squares = [x * x for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]
```

`map`/`filter` trả iterator, tiết kiệm bộ nhớ khi chuỗi lớn và không cần list ngay.

### 5.6 Hàm thuần túy và side effect

Hàm thuần túy: cùng input → cùng output, không sửa state ngoài. Dễ test, dễ cache, dễ
song song. Tách phần tính toán khỏi I/O:

```python
# Khó test: vừa đọc file, vừa tính, vừa ghi
def total_bad() -> None:
    with open("guests.json") as f:
        data = json.load(f)
    with open("total.txt", "w") as f:
        f.write(str(len(data)))

# Dễ test
def count_guests(guests: list[dict]) -> int:
    return len(guests)

def total() -> None:
    guests = load_guests()
    save_total(count_guests(guests))
```

### 5.7 Đệ quy

Python không tối ưu tail call; giới hạn mặc định 1000 frame (`sys.getrecursionlimit()`).
Với dữ liệu sâu, dùng vòng lặp hoặc tăng giới hạn cẩn thận (có thể crash).

```python
def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("n phải >= 0")
    return 1 if n < 2 else n * factorial(n - 1)
```

---

## 6. Lập trình hướng đối tượng

### 6.1 Class cơ bản

```python
class Guest:
    """Một khách mời."""

    venue = "Wedding Hall"          # class attribute, chia sẻ

    def __init__(self, name: str, side: str = "bride") -> None:
        self.name = name            # instance attribute
        self.side = side
        self._table: int | None = None   # quy ước private

    def assign_table(self, number: int) -> None:
        if number <= 0:
            raise ValueError("Số bàn phải dương")
        self._table = number

    @property
    def table(self) -> int | None:
        return self._table

    def __repr__(self) -> str:
        return f"Guest(name={self.name!r}, side={self.side!r})"


hoa = Guest("Hoa")
hoa.assign_table(3)
print(hoa.table)          # 3
```

`self` là instance hiện tại, tường minh (không ngầm như Java). `_name` là quy ước nội bộ,
không phải private thật; `__name` bị name-mangling thành `_Class__name` — tránh lạm dụng.

### 6.2 Instance, class, static method

```python
class Guest:
    count = 0

    def __init__(self, name: str) -> None:
        self.name = name
        Guest.count += 1

    @classmethod
    def from_csv(cls, line: str) -> "Guest":
        name, *_ = line.split(",")
        return cls(name.strip())

    @staticmethod
    def valid_name(name: str) -> bool:
        return bool(name.strip())

    def greeting(self) -> str:
        return f"Chào {self.name}"
```

| Loại | Nhận gì | Dùng khi |
|---|---|---|
| Instance method | `self` | Thao tác trên instance |
| `@classmethod` | `cls` | Factory, thay thế constructor, polymorphism |
| `@staticmethod` | Không | Hàm tiện ích không cần state |

`@classmethod` + `cls(...)` hỗ trợ subclass trả đúng kiểu; là pattern factory phổ biến.

### 6.3 Kế thừa, MRO, mixin

```python
class Person:
    def __init__(self, name: str) -> None:
        self.name = name

    def describe(self) -> str:
        return f"Person({self.name})"


class Guest(Person):
    def __init__(self, name: str, side: str) -> None:
        super().__init__(name)
        self.side = side

    def describe(self) -> str:
        return f"Guest({self.name}, {self.side})"
```

`super()` theo MRO (Method Resolution Order, C3 linearization), không đơn giản là "class
cha trực tiếp". Đa kế thừa nên dùng **mixin** nhỏ, không dùng để mô phỏng đa hình phức tạp.

```python
class TimestampMixin:
    created_at: datetime

    def touch(self) -> None:
        self.created_at = datetime.now(timezone.utc)

class AuditableMixin:
    def audit(self) -> str:
        return f"{type(self).__name__}@{self.created_at.isoformat()}"

class Invitation(TimestampMixin, AuditableMixin):
    pass
```

Kiểm tra MRO: `Invitation.__mro__`. Quy tắc: class con trước, class cha sau, mixin trái
trước phải, không vi phạm thứ tự nhất quán.

### 6.4 Dunder method

Dunder (`__x__`) cho phép object tích hợp với cú pháp ngôn ngữ.

| Dunder | Kích hoạt bởi | Ghi chú |
|---|---|---|
| `__init__` | `Guest(...)` | Khởi tạo instance |
| `__repr__` | `repr(obj)`, debugger | Nên tái tạo được object |
| `__str__` | `str(obj)`, `print` | Thân thiện người đọc |
| `__eq__` | `==` | Định nghĩa equality |
| `__hash__` | `hash(obj)`, dict/set key | Equality và hash phải nhất quán |
| `__len__` | `len(obj)` | |
| `__iter__` | `for x in obj` | Trả iterator |
| `__getitem__` | `obj[key]` | |
| `__call__` | `obj()` | Object gọi như hàm |
| `__enter__/__exit__` | `with obj` | Context manager |
| `__lt__` | `<` | Sắp xếp |

```python
class Money:
    def __init__(self, amount: int, currency: str = "VND") -> None:
        self.amount = amount
        self.currency = currency

    def __repr__(self) -> str:
        return f"Money({self.amount}, {self.currency!r})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return (self.amount, self.currency) == (other.amount, other.currency)

    def __hash__(self) -> int:
        return hash((self.amount, self.currency))

    def __add__(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Khác tiền tệ")
        return Money(self.amount + other.amount, self.currency)
```

Trả `NotImplemented` (không phải `NotImplementedError`) từ `__eq__` để Python thử phía
còn lại. Định nghĩa `__eq__` mà không định nghĩa `__hash__` làm object unhashable.

### 6.5 Dataclass

Tự sinh `__init__`, `__repr__`, `__eq__`; phù hợp DTO/domain model đơn giản.

```python
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class Guest:
    name: str
    side: str = "bride"
    tags: tuple[str, ...] = ()

@dataclass
class Rsvp:
    guest: Guest
    status: str = "pending"
    notes: list[str] = field(default_factory=list)   # không dùng [] trực tiếp
```

| Tham số | Tác dụng |
|---|---|
| `frozen=True` | Immutable, sinh `__hash__` (nếu field hashable) |
| `slots=True` (3.10+) | Giảm memory, nhanh hơn, không thêm attribute động |
| `kw_only=True` (3.10+) | Bắt buộc truyền keyword |
| `order=True` | Sinh so sánh `<`, `<=`... |
| `field(default_factory=...)` | Default mutable an toàn |
| `field(repr=False)` | Ẩn field khỏi repr (ví dụ password) |

`dataclasses.asdict`, `replace` hữu ích:

```python
from dataclasses import replace
new_rsvp = replace(rsvp, status="yes")
```

### 6.6 Enum

```python
from enum import Enum, StrEnum, IntEnum

class Status(StrEnum):
    PENDING = "pending"
    YES = "yes"
    NO = "no"

Status("yes") is Status.YES       # True
Status.YES.value                  # 'yes'
```

Dùng `StrEnum` (3.11+) khi serialize JSON; `IntEnum` khi cần so sánh số. Enum tránh
"magic string" rải rác.

### 6.7 ABC và Protocol

- **ABC** (`abc.ABC`): kế thừa tường minh, kiểm tra lúc tạo instance.
- **Protocol** (`typing.Protocol`): structural typing — chỉ cần đúng method, không cần
  kế thừa. Phù hợp Pythonic, dễ test bằng fake.

```python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, to: str, message: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, to: str, message: str) -> None:
        print(f"Email {to}: {message}")
```

```python
from typing import Protocol

class Notifier(Protocol):
    def send(self, to: str, message: str) -> None: ...

class FakeNotifier:
    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def send(self, to: str, message: str) -> None:
        self.sent.append((to, message))
```

`FakeNotifier` không kế thừa nhưng thỏa `Notifier` về mặt tĩnh. Protocol là nền tảng của
dependency injection nhẹ trong Python.

### 6.8 Composition và property

Ưu tiên composition hơn kế thừa sâu. Property cho phép validate/derive mà giữ API như
attribute.

```python
class GuestList:
    def __init__(self, repository: "GuestRepository") -> None:
        self._repo = repository

    def attending(self) -> list[Guest]:
        return [g for g in self._repo.all() if g.status == "yes"]


class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        if value < -273.15:
            raise ValueError("Dưới độ không tuyệt đối")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32
```

> ⚠️ Property setter không nên có side effect nặng (gọi API, ghi DB). Nếu cần, dùng method
> có tên rõ nghĩa.

### 6.9 `__slots__`

Giảm memory và chặn thêm attribute ngoài danh sách. Hữu ích khi tạo hàng triệu object.

```python
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y
```

Với dataclass dùng `@dataclass(slots=True)` thay vì tự viết. `__slots__` không tương
thích với đa kế thừa phức tạp và một số thư viện dùng `__dict__`.

---

## 7. Exception

### 7.1 Cây exception

```text
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── ArithmeticError (ZeroDivisionError, OverflowError)
    ├── LookupError (IndexError, KeyError)
    ├── ValueError
    ├── TypeError
    ├── AttributeError
    ├── NameError
    ├── OSError (FileNotFoundError, PermissionError, TimeoutError)
    ├── RuntimeError (RecursionError)
    └── StopIteration
```

Chỉ bắt `Exception` (hoặc class con), **không bắt `BaseException`**, vì sẽ nuốt
`KeyboardInterrupt`/`SystemExit`.

### 7.2 Cú pháp đầy đủ

```python
import logging

logger = logging.getLogger(__name__)

def load_guests(path: str) -> list[dict]:
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning("Chưa có file %s, bắt đầu danh sách rỗng", path)
        return []
    except json.JSONDecodeError as exc:
        logger.exception("File JSON hỏng: %s", path)
        raise ValueError(f"Dữ liệu khách mời không hợp lệ: {path}") from exc
    except OSError:
        logger.exception("Không đọc được file %s", path)
        raise
    else:
        # chỉ chạy khi try không lỗi
        ...
    finally:
        # luôn chạy, kể cả return/raise
        ...
```

| Khối | Khi chạy |
|---|---|
| `try` | Luôn |
| `except` | Khi exception khớp |
| `else` | Khi `try` không exception |
| `finally` | Luôn, kể cả có `return`/`raise` |

**Không đặt `return` trong `finally`** — nó nuốt exception và return trước đó.

### 7.3 `raise` và `raise ... from ...`

```python
def withdraw(balance: int, amount: int) -> int:
    if amount <= 0:
        raise ValueError("Số tiền phải dương")
    if amount > balance:
        raise InsufficientFunds(balance, amount)
    return balance - amount

class InsufficientFunds(Exception):
    def __init__(self, balance: int, amount: int) -> None:
        self.balance = balance
        self.amount = amount
        super().__init__(f"Thiếu {amount - balance}đ")
```

`raise NewError(...) from exc` giữ nguyên nhân (`__cause__`) trong traceback. `raise`
không tham số tái ném exception hiện tại, giữ traceback gốc.

**Custom exception hierarchy** nên có base riêng của domain:

```python
class GuestbookError(Exception):
    """Base cho lỗi nghiệp vụ guestbook."""

class GuestNotFound(GuestbookError):
    pass

class DuplicateGuest(GuestbookError):
    pass
```

Tầng API map `GuestNotFound` → 404, `DuplicateGuest` → 409; không để lộ traceback ra client.

### 7.4 EAFP và LBYL

Python ưu tiên **EAFP** (Easier to Ask Forgiveness than Permission): thử rồi bắt lỗi, thay
vì kiểm tra trước (LBYL). EAFP tránh race condition và thường nhanh hơn khi lỗi hiếm.

```python
# EAFP
try:
    value = config["timeout"]
except KeyError:
    value = 30

# LBYL
if "timeout" in config:
    value = config["timeout"]
else:
    value = 30
```

Với dict đơn giản, `config.get("timeout", 30)` còn gọn hơn cả hai.

### 7.5 ExceptionGroup (3.11+)

Nhóm nhiều lỗi, dùng với `except*` để xử lý song song theo loại:

```python
try:
    raise ExceptionGroup("import lỗi", [
        ValueError("dòng 2"),
        OSError("file hỏng"),
    ])
except* ValueError as group:
    print("ValueError:", len(group.exceptions))
except* OSError:
    print("OSError")
```

`asyncio.TaskGroup` ném `ExceptionGroup` khi nhiều task fail — xem advanced.

### 7.6 Best practice

1. Bắt lỗi cụ thể, xử lý được thì xử lý, không thì để lên trên.
2. Không `except Exception: pass`; nếu bắt rộng, log + re-raise hoặc trả lỗi có kiểm soát.
3. Không dùng exception cho luồng bình thường (ví dụ `StopIteration` thủ công).
4. Không dùng `assert` để validate input người dùng — assert bị tắt với `-O`.
5. Thông điệp lỗi phải có ngữ cảnh: cái gì, ở đâu, giá trị nào.
6. Không log cả stack trace rồi trả về None âm thầm.
7. Retry chỉ khi lỗi **transient** và thao tác **idempotent**.

---

## 8. Module và package

### 8.1 Import

```python
import json
import numpy as np
from pathlib import Path
from collections import Counter, defaultdict
from .models import Guest          # relative import trong package
from guestbook.models import Guest  # absolute import (khuyến nghị)
```

Thứ tự: stdlib → third-party → local, mỗi nhóm cách một dòng (ruff `I` tự sắp xếp).

**Import chạy code ở top-level** của module, một lần duy nhất; module được cache trong
`sys.modules`. Đặt side effect nặng (kết nối DB, gọi API) vào hàm/lifespan, không ở
top-level.

### 8.2 `__init__.py`, `__all__`

`__init__.py` đánh dấu package (truyền thống), có thể re-export API công khai:

```python
# src/guestbook/__init__.py
from .models import Guest
from .service import GuestService

__all__ = ["Guest", "GuestService"]
__version__ = "0.1.0"
```

`__all__` ảnh hưởng `from package import *` và tài liệu; không bắt buộc nhưng nên có cho
thư viện public. Giữ `__init__.py` nhẹ — import nặng làm chậm khởi động và dễ circular.

### 8.3 Circular import

A import B, B import A → lỗi. Cách xử lý:

| Cách | Khi dùng |
|---|---|
| Tách phần dùng chung ra module thứ ba | Tốt nhất, giảm coupling |
| Import trong hàm (lazy) | Phá vòng lặp, chấp nhận được |
| `from __future__ import annotations` + `TYPE_CHECKING` | Chỉ cần type hint |
| Dùng Protocol/interface | Giảm phụ thuộc cụ thể |

```python
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from guestbook.repository import GuestRepository

def build(repo: GuestRepository) -> None: ...
```

### 8.4 Chạy module và entry point

```bash
python -m guestbook.cli
```

`pyproject.toml`:

```toml
[project.scripts]
guestbook = "guestbook.cli:main"
```

Sau `uv sync`, lệnh `guestbook` gọi `main()`. Đây là cách đóng gói CLI chuẩn.

### 8.5 Môi trường ảo

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
pip install -e ".[dev]"
```

Hoặc với uv:

```bash
uv sync
uv run pytest
```

Không commit `.venv/`; commit lockfile để tái lập môi trường. `pip freeze` chỉ là snapshot,
không thay thế lockfile có resolution đầy đủ.

---

## 9. File và dữ liệu

### 9.1 `open` và context manager

```python
from pathlib import Path

path = Path("data/guests.txt")
with path.open("r", encoding="utf-8") as f:
    for line in f:                 # streaming, không load cả file
        print(line.rstrip("\n"))
```

| Mode | Ý nghĩa |
|---|---|
| `"r"` | Đọc text (mặc định) |
| `"w"` | Ghi mới, **xóa nội dung cũ** |
| `"a"` | Ghi nối |
| `"x"` | Ghi mới, lỗi nếu tồn tại |
| `"b"` | Binary |
| `"+"` | Đọc + ghi |

Luôn chỉ định `encoding="utf-8"` khi làm việc với text. Không dựa vào locale hệ điều hành.

### 9.2 pathlib

```python
from pathlib import Path

base = Path(__file__).resolve().parent
data = base / "data" / "guests.json"
data.parent.mkdir(parents=True, exist_ok=True)

text = data.read_text(encoding="utf-8")
data.write_text('{"guests": []}', encoding="utf-8")

for p in base.glob("*.py"):
    print(p.name, p.stat().st_size)
```

`Path` thay cho `os.path` trong code mới: `/` để nối, `.parent`, `.stem`, `.suffix`,
`.name`, `.exists()`, `.is_file()`, `.resolve()`. Kiểm tra path traversal:

```python
def safe_join(root: Path, user_path: str) -> Path:
    candidate = (root / user_path).resolve()
    if not candidate.is_relative_to(root.resolve()):
        raise ValueError("Đường dẫn không hợp lệ")
    return candidate
```

### 9.3 JSON

```python
import json
from datetime import datetime, timezone

payload = {
    "name": "Hoa",
    "created_at": datetime.now(timezone.utc).isoformat(),
    "tags": ["bride", "vip"],
}
text = json.dumps(payload, ensure_ascii=False, indent=2)
restored = json.loads(text)
```

| Tham số | Tác dụng |
|---|---|
| `ensure_ascii=False` | Giữ tiếng Việt, không escape `\uXXXX` |
| `indent=2` | Dễ đọc (không dùng cho production payload lớn) |
| `default=str` | Fallback serialize (cẩn thận mất kiểu) |
| `sort_keys=True` | Ổn định output để diff/test |

JSON không có datetime/Decimal/set. Serialize tường minh bằng ISO string/số; validate lại
khi đọc. Với API, dùng Pydantic thay parse thủ công.

### 9.4 CSV

```python
import csv

with open("guests.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["side"])

with open("out.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "side"])
    writer.writeheader()
    writer.writerows([{"name": "Hoa", "side": "bride"}])
```

`newline=""` tránh dòng trống trên Windows. Với dữ liệu lớn/nhiều kiểu, dùng pandas hoặc
Polars; với file Excel, dùng `openpyxl`/`pandas.read_excel`.

### 9.5 Ghi file an toàn

Ghi thẳng vào file quan trọng có thể để lại file dở nếu crash. Dùng temp + `os.replace`
(atomic trên cùng filesystem):

```python
import os
import tempfile
from pathlib import Path

def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise
```

### 9.6 File lớn

- Đọc theo dòng hoặc chunk, không `read()` toàn bộ.
- Dùng generator để pipeline.
- Nén bằng `gzip`/`bz2`/`lzma` (3.14 có `compression.zstd`) nếu I/O là bottleneck.
- Với CSV/JSON lớn, cân nhắc DuckDB/Polars/Spark thay vì pandas thuần.

```python
def read_lines(path: Path):
    with path.open(encoding="utf-8") as f:
        yield from (line.rstrip("\n") for line in f)
```

---

## 10. Thư viện chuẩn

### 10.1 `datetime` và múi giờ

```python
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

now_utc = datetime.now(timezone.utc)          # aware
vn = now_utc.astimezone(ZoneInfo("Asia/Ho_Chi_Minh"))
print(vn.isoformat())                          # 2026-10-29T21:00:00+07:00

naive = datetime(2026, 10, 29, 21, 0)          # không múi giờ — tránh
deadline = now_utc + timedelta(days=7)
epoch = now_utc.timestamp()
```

| Quy tắc | Lý do |
|---|---|
| Lưu DB bằng UTC, kiểu `timestamptz` | Tránh lệch khi đổi múi giờ |
| Dùng aware datetime | So sánh naive/aware sẽ `TypeError` |
| Không dùng `datetime.utcnow()` | Trả naive, dễ sai; dùng `now(timezone.utc)` |
| Format ISO 8601 khi API | Chuẩn, sort được |
| `zoneinfo` thay `pytz` | Chuẩn từ 3.9 |

`strftime`/`strptime` cho format; nhớ `%Y-%m-%d` và locale.

### 10.2 `collections`

```python
from collections import Counter, defaultdict, deque, namedtuple

Counter(["yes", "no", "yes"]).most_common(1)    # [('yes', 2)]

by_side = defaultdict(list)
for guest in guests:
    by_side[guest["side"]].append(guest["name"])

queue = deque([1, 2, 3], maxlen=3)
queue.append(4)          # bỏ 1 ở đầu
queue.appendleft(0)      # bỏ 3 ở cuối
queue.popleft()
```

| Kiểu | Dùng cho |
|---|---|
| `Counter` | Đếm tần suất |
| `defaultdict` | Nhóm, tránh `KeyError` |
| `deque` | Queue/stack hai đầu O(1) |
| `namedtuple` | Bản ghi nhỏ, immutable, có tên field |
| `ChainMap` | Ghép nhiều dict (config layers) |

### 10.3 `itertools`

```python
from itertools import chain, islice, groupby, product, combinations, batched

list(chain([1, 2], [3, 4]))                 # [1, 2, 3, 4]
list(islice(range(100), 5))                  # [0, 1, 2, 3, 4]
list(product("AB", repeat=2))                # AA, AB, BA, BB
list(combinations([1, 2, 3], 2))             # (1,2), (1,3), (2,3)
list(batched(range(7), 3))                   # 3.12+: (0,1,2), (3,4,5), (6,)
```

`groupby` chỉ nhóm **liền kề**; phải sort theo key trước:

```python
from itertools import groupby
data = sorted(guests, key=lambda g: g["side"])
for side, items in groupby(data, key=lambda g: g["side"]):
    print(side, len(list(items)))
```

### 10.4 `functools`

```python
from functools import lru_cache, cache, wraps, partial

@lru_cache(maxsize=128)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

@cache                      # 3.9+, không giới hạn
def expensive(x: int) -> int:
    return x * x
```

Cache yêu cầu tham số hashable; không cache hàm có side effect hoặc kết quả phụ thuộc
thời gian/DB. `lru_cache` giữ reference tới argument → có thể leak nếu argument lớn.

### 10.5 `re`

```python
import re

PHONE = re.compile(r"^(?:\+84|0)(\d{9})$")
match = PHONE.match("0912345678")
if match:
    print(match.group(1))

text = "Hoa: yes; Minh: no"
pairs = re.findall(r"(\w+): (\w+)", text)         # [('Hoa','yes'), ('Minh','no')]
cleaned = re.sub(r"\s+", " ", text).strip()
```

| Quy tắc | Lý do |
|---|---|
| Dùng raw string `r"..."` | Tránh escape `\d`, `\b` |
| Compile pattern dùng nhiều lần | Tốc độ, rõ ràng |
| Đặt tên group `(?P<name>...)` | Dễ đọc |
| Tránh backtracking catastrophic | `(a+)+$` với input dài có thể treo |
| Validate độ dài input trước regex | Giảm rủi ro DoS |

### 10.6 `random` và `secrets`

`random` **không an toàn mật mã**. Token, mật khẩu, OTP dùng `secrets`.

```python
import random
from secrets import token_urlsafe, choice

random.seed(42)                    # tái lập test, không dùng production
random.randint(1, 6)
random.shuffle(items)
token = token_urlsafe(32)
```

### 10.7 `subprocess`

```python
import subprocess

result = subprocess.run(
    ["git", "status", "--short"],
    capture_output=True,
    text=True,
    check=True,                     # ném CalledProcessError nếu exit != 0
    timeout=10,
)
print(result.stdout)
```

Không dùng `shell=True` với input người dùng (command injection). Nếu buộc phải dùng
shell, truyền list và `shlex.quote`, hoặc tốt nhất là bỏ.

### 10.8 `logging`

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

logger.info("Đã load %d khách", len(guests))
logger.warning("Thiếu email cho %s", guest["name"])
try:
    1 / 0
except ZeroDivisionError:
    logger.exception("Tính toán lỗi")     # tự kèm traceback
```

Không dùng `print` trong library/service; dùng logger có tên module. Log theo tham số
(`logger.info("x=%s", x)`) thay vì f-string để tránh format khi level bị tắt.

### 10.9 `argparse`

```python
import argparse

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Quản lý khách mời")
    sub = parser.add_subparsers(dest="command", required=True)

    add = sub.add_parser("add", help="Thêm khách")
    add.add_argument("name")
    add.add_argument("--side", choices=["bride", "groom"], default="bride")

    sub.add_parser("list", help="Liệt kê")
    return parser

def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.command == "add":
        print(f"Thêm {args.name} ({args.side})")
    elif args.command == "list":
        print("Danh sách")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

Với CLI phức tạp, dùng Typer/Click; `argparse` đủ cho script nội bộ.

### 10.10 Các module khác

| Module | Dùng cho |
|---|---|
| `decimal`, `fractions` | Tính toán chính xác |
| `statistics` | mean, median, stdev |
| `uuid` | ID duy nhất (`uuid4`) |
| `hashlib`, `hmac` | Hash, chữ ký, so sánh an toàn |
| `tempfile`, `shutil` | File tạm, copy/move |
| `os`, `sys` | Biến môi trường, argv, exit |
| `contextlib` | Context manager tiện ích |
| `dataclasses` | Model nhẹ |
| `enum` | Tập giá trị cố định |
| `typing` | Type hint |
| `tomllib` (3.11+) | Đọc TOML |
| `importlib` | Import động, plugin |
| `concurrent.futures` | Thread/process pool |
| `asyncio` | Async I/O (xem advanced) |
| `unittest.mock` | Mock trong test |

---

## 11. Type hint cơ bản

Python **không kiểm tra kiểu lúc runtime** (trừ khi dùng thư viện như Pydantic/beartype).
Type hint phục vụ con người, IDE, mypy/pyright và tài liệu.

```python
from collections.abc import Iterable, Sequence
from typing import Literal, TypedDict

def total_guests(guests: Iterable[dict[str, str]]) -> int:
    return sum(1 for _ in guests)

def find_guest(name: str, guests: list[str]) -> str | None:
    return name if name in guests else None

Side = Literal["bride", "groom"]

class GuestDict(TypedDict):
    name: str
    side: Side
    table: int | None
```

| Cú pháp | Ý nghĩa |
|---|---|
| `list[int]`, `dict[str, int]` | Generic built-in (3.9+) |
| `str \| None` | Union (3.10+), tương đương `Optional[str]` |
| `Literal["a", "b"]` | Tập giá trị cố định |
| `TypedDict` | Dict có schema cố định |
| `Callable[[int], str]` | Hàm nhận int trả str |
| `Iterable[T]`, `Sequence[T]` | Trừu tượng hóa collection |
| `Any` | Tắt kiểm tra — hạn chế |
| `object` | Mọi giá trị, phải thu hẹp trước khi dùng |

Với Python 3.12, có thể viết generic gọn:

```python
def first[T](items: Sequence[T]) -> T:
    if not items:
        raise ValueError("empty")
    return items[0]

type GuestMap = dict[str, list[str]]
```

Chạy mypy:

```bash
mypy --strict src/
```

Bắt đầu bằng `--strict` cho module mới, để legacy dần. `# type: ignore[code]` phải kèm mã
lỗi cụ thể và lý do; đừng ignore cả file.

> 💡 Type hint không thay thế validation dữ liệu từ bên ngoài. Input từ HTTP/CSV/env vẫn
> phải validate (Pydantic, schema) vì runtime có thể nhận bất cứ thứ gì.

---

## 12. Test với pytest

### 12.1 Cấu trúc

```text
tests/
├── conftest.py
├── unit/
│   └── test_guest.py
└── integration/
    └── test_api.py
```

Tên file `test_*.py`, hàm `test_*`. pytest tự discover; không cần `unittest.TestCase`.

```python
# tests/unit/test_guest.py
from guestbook.models import Guest

def test_guest_defaults() -> None:
    guest = Guest("Hoa")
    assert guest.side == "bride"
    assert guest.table is None

def test_assign_table_rejects_zero() -> None:
    guest = Guest("Hoa")
    with pytest.raises(ValueError, match="dương"):
        guest.assign_table(0)
```

### 12.2 Parametrize

```python
import pytest

@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("  Hoa ", "Hoa"),
        ("Minh", "Minh"),
        ("", ""),
    ],
)
def test_normalize_name(raw: str, expected: str) -> None:
    assert normalize_name(raw) == expected
```

Mỗi case là một test riêng, báo lỗi rõ case nào.

### 12.3 Fixture

```python
# conftest.py
import pytest
from guestbook.repository import InMemoryGuestRepository

@pytest.fixture
def repo() -> InMemoryGuestRepository:
    return InMemoryGuestRepository()

@pytest.fixture
def sample_guests() -> list[dict[str, str]]:
    return [
        {"name": "Hoa", "side": "bride"},
        {"name": "Minh", "side": "groom"},
    ]
```

| Scope | Khi dùng |
|---|---|
| `function` (mặc định) | Cách ly tốt nhất, chạy mỗi test |
| `module` | Setup đắt, không mutate |
| `session` | Container/DB dùng chung, cần dọn dẹp cẩn thận |

Fixture lồng nhau, `yield` để teardown:

```python
@pytest.fixture
def db(tmp_path):
    connection = create_db(tmp_path / "test.db")
    yield connection
    connection.close()
```

### 12.4 Mock và monkeypatch

```python
from unittest.mock import patch

def test_send_email(monkeypatch: pytest.MonkeyPatch) -> None:
    sent = []
    monkeypatch.setattr("guestbook.notify.send", lambda to, msg: sent.append((to, msg)))
    notify_guests(["hoa@example.com"], "Chúc mừng")
    assert sent == [("hoa@example.com", "Chúc mừng")]
```

`patch("guestbook.service.send")` — patch nơi tên được **tra cứu**, không phải nơi định
nghĩa. Ưu tiên dependency injection + fake object hơn patch chuỗi dài.

### 12.5 `tmp_path`, `capsys`, `caplog`

```python
def test_save_and_load(tmp_path, capsys, caplog):
    path = tmp_path / "guests.json"
    save_guests(path, [{"name": "Hoa"}])
    assert load_guests(path) == [{"name": "Hoa"}]

    print("hello")
    assert capsys.readouterr().out == "hello\n"

    caplog.set_level("WARNING")
    logger.warning("careful")
    assert "careful" in caplog.text
```

### 12.6 Coverage và chất lượng test

```bash
pytest --cov=src --cov-report=term-missing --cov-fail-under=85
```

Coverage là chỉ số **phát hiện vùng chưa test**, không phải mục tiêu tối thượng. 100%
coverage vẫn có thể bỏ sót logic. Ưu tiên:

1. Happy path quan trọng.
2. Boundary (rỗng, 0, max, Unicode, múi giờ).
3. Error path (DB lỗi, timeout, input sai).
4. Regression test cho mỗi bug production.

### 12.7 Test tốt

| Đặc điểm | Nghĩa |
|---|---|
| Nhanh | Unit test chạy mili giây |
| Độc lập | Không phụ thuộc thứ tự, không dùng state toàn cục |
| Tất định | Không phụ thuộc thời gian/network thật |
| Rõ ý định | Tên test mô tả hành vi, không mô tả implementation |
| Một lý do fail | Assert cụ thể, dễ debug |

> ⚠️ Test flaky tệ hơn không có test: team mất niềm tin và bỏ qua CI. Khi gặp flaky, fix
> hoặc xóa ngay, không "rerun cho xanh".

---

## 13. Debug và lỗi thường gặp

### 13.1 Đọc traceback

```text
Traceback (most recent call last):
  File "app.py", line 12, in <module>
    main()
  File "app.py", line 8, in main
    print(guests[3])
          ~~~~~~^^^
IndexError: list index out of range
```

Đọc **từ dưới lên**: exception type + message trước, rồi frame gần nhất trong code của bạn.
Caret `^^^` chỉ đúng biểu thức gây lỗi (3.11+).

### 13.2 Debugger

```python
def calculate(a: int, b: int) -> float:
    breakpoint()          # dừng ở đây khi chạy
    return a / b
```

| Lệnh pdb | Tác dụng |
|---|---|
| `n` / `s` | Next / step into |
| `c` | Continue |
| `r` | Return khỏi hàm |
| `l` | List source quanh dòng hiện tại |
| `p expr` / `pp expr` | Print / pretty print |
| `w` | Where (stack) |
| `u` / `d` | Up/down frame |
| `b file:line` | Đặt breakpoint |
| `q` | Quit |

Trong môi trường hiện đại, dùng debugger của VS Code/PyCharm; `breakpoint()` vẫn hữu ích
trên server/container.

### 13.3 Bảng lỗi thường gặp

| Lỗi | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| `IndexError` | Truy cập quá độ dài | Kiểm tra `len`, dùng slice/`get` |
| `KeyError` | Key không tồn tại | `.get`, `in`, `defaultdict` |
| `TypeError` | Sai kiểu/thiếu tham số | Đọc message, kiểm tra signature |
| `ValueError` | Đúng kiểu, sai giá trị | Validate trước, bắt và báo lỗi rõ |
| `AttributeError` | Object không có attr / `None` | Kiểm tra `None`, `hasattr` |
| `NameError` | Chưa định nghĩa/biến sai scope | Kiểm tra import/typo |
| `UnboundLocalError` | Gán local nhưng đọc trước | Khởi tạo hoặc `nonlocal` |
| `IndentationError` | Trộn tab/space | Cấu hình editor, ruff format |
| `RecursionError` | Đệ quy quá sâu | Chuyển vòng lặp, tăng limit cẩn thận |
| `StopIteration` | Gọi `next()` hết iterator | Dùng `next(it, default)` |
| `ModuleNotFoundError` | Sai môi trường/đường dẫn | Kiểm tra `sys.path`, cài dependency |
| `PermissionError` | Thiếu quyền file/port | Kiểm tra user, port < 1024 |
| `UnicodeDecodeError` | Sai encoding | Chỉ định `utf-8`, kiểm tra nguồn |
| `JSONDecodeError` | JSON hỏng/rỗng | Log nội dung, validate trước parse |

### 13.4 Quy trình debug

1. **Tái lập** với input nhỏ nhất, ghi lại lệnh/env.
2. **Thu hẹp** bằng log, bisect commit, disable thành phần.
3. **Kiểm tra giả thuyết** — đừng sửa mò.
4. **Viết test** tái hiện bug trước khi fix.
5. **Fix nguyên nhân gốc**, không che symptom.
6. **Thêm log/metric** để lần sau thấy sớm hơn.

```python
import logging
logger = logging.getLogger(__name__)
logger.debug("payload=%r", payload)     # dùng %r để thấy kiểu
```

> 💡 Rubber duck debugging: giải thích thành tiếng cho một người/đồ vật. Rất nhiều bug lộ
> ra ngay khi phải diễn đạt lại logic.

---

## 14. Ví dụ tổng hợp: guestbook CLI

Một chương trình nhỏ nhưng đủ các khái niệm: dataclass, exception, file JSON, CLI, test.

```python
# src/guestbook/models.py
from __future__ import annotations

from dataclasses import dataclass, replace


@dataclass(frozen=True, slots=True)
class Guest:
    name: str
    side: str = "bride"
    table: int | None = None
    tags: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Tên không được rỗng")
        if self.side not in {"bride", "groom"}:
            raise ValueError(f"Bên không hợp lệ: {self.side}")
        if self.table is not None and self.table <= 0:
            raise ValueError("Số bàn phải dương")

    def with_table(self, table: int) -> Guest:
        return replace(self, table=table)
```

```python
# src/guestbook/storage.py
from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from .models import Guest


class GuestRepository:
    def __init__(self, path: Path) -> None:
        self.path = path

    def load(self) -> list[Guest]:
        if not self.path.exists():
            return []
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"File hỏng: {self.path}") from exc
        return [
            Guest(
                name=item["name"],
                side=item.get("side", "bride"),
                table=item.get("table"),
                tags=tuple(item.get("tags", ())),
            )
            for item in raw
        ]

    def save(self, guests: list[Guest]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = [asdict(guest) for guest in guests]
        self.path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def add(self, guest: Guest) -> None:
        guests = self.load()
        if any(item.name.casefold() == guest.name.casefold() for item in guests):
            raise ValueError(f"Khách đã tồn tại: {guest.name}")
        guests.append(guest)
        self.save(guests)
```

> ✅ Với `slots=True`, dùng `dataclasses.asdict(guest)` thay vì `guest.__dict__` (không
> tồn tại). Đây là lỗi rất dễ mắc khi thêm slots vào dataclass cũ.

```python
# src/guestbook/cli.py
from __future__ import annotations

import argparse
from pathlib import Path

from .models import Guest
from .storage import GuestRepository


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Guestbook CLI")
    parser.add_argument("--data", type=Path, default=Path("guests.json"))
    sub = parser.add_subparsers(dest="command", required=True)

    add = sub.add_parser("add")
    add.add_argument("name")
    add.add_argument("--side", choices=["bride", "groom"], default="bride")

    sub.add_parser("list")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    repo = GuestRepository(args.data)

    if args.command == "add":
        repo.add(Guest(args.name, args.side))
        print(f"Đã thêm {args.name}")
    elif args.command == "list":
        for index, guest in enumerate(repo.load(), start=1):
            table = f"bàn {guest.table}" if guest.table else "chưa xếp bàn"
            print(f"{index:>3}. {guest.name} — {guest.side} — {table}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

```python
# tests/unit/test_storage.py
import pytest

from guestbook.models import Guest
from guestbook.storage import GuestRepository


def test_add_and_load(tmp_path):
    repo = GuestRepository(tmp_path / "guests.json")
    repo.add(Guest("Hoa", "bride"))
    assert [g.name for g in repo.load()] == ["Hoa"]


def test_duplicate_name_rejected(tmp_path):
    repo = GuestRepository(tmp_path / "guests.json")
    repo.add(Guest("Hoa"))
    with pytest.raises(ValueError, match="đã tồn tại"):
        repo.add(Guest("hoa"))
```

Chạy:

```bash
uv run guestbook --data /tmp/guests.json add "Chị Hoa"
uv run guestbook --data /tmp/guests.json list
uv run pytest -q
```

---

## 15. Bài tập có đáp án

### Bài 1. FizzBuzz

In 1..n: chia hết 3 → Fizz, 5 → Buzz, cả hai → FizzBuzz.

```python
def fizzbuzz(n: int) -> list[str]:
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result
```

### Bài 2. Đếm từ

```python
from collections import Counter
import re

def word_count(text: str) -> dict[str, int]:
    words = re.findall(r"\b\w+\b", text.casefold())
    return dict(Counter(words))
```

### Bài 3. Khử trùng giữ thứ tự

```python
def unique(items: list[str]) -> list[str]:
    return list(dict.fromkeys(items))
```

### Bài 4. Palindrome

```python
def is_palindrome(text: str) -> bool:
    cleaned = "".join(ch.casefold() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]
```

### Bài 5. Two Sum (O(n))

```python
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, value in enumerate(nums):
        if (need := target - value) in seen:
            return seen[need], i
        seen[value] = i
    return None
```

### Bài 6. Flatten list lồng (không đệ quy)

```python
def flatten(items):
    stack = [iter(items)]
    while stack:
        try:
            item = next(stack[-1])
        except StopIteration:
            stack.pop()
            continue
        if isinstance(item, list):
            stack.append(iter(item))
        else:
            yield item
```

### Bài 7. Nhóm theo khóa

```python
from collections import defaultdict

def group_by(items: list[dict], key: str) -> dict[str, list[dict]]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        groups[item[key]].append(item)
    return dict(groups)
```

### Bài 8. Đọc CSV và tính tổng

```python
import csv
from pathlib import Path

def total_amount(path: Path) -> int:
    with path.open(encoding="utf-8", newline="") as f:
        return sum(int(row["amount"]) for row in csv.DictReader(f))
```

### Bài 9. Cache Fibonacci

```python
from functools import cache

@cache
def fib(n: int) -> int:
    if n < 0:
        raise ValueError("n >= 0")
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

### Bài 10. Retry có backoff

```python
import time
from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")

def retry(func: Callable[[], T], attempts: int = 3, base_delay: float = 0.5) -> T:
    last: Exception | None = None
    for attempt in range(attempts):
        try:
            return func()
        except (TimeoutError, ConnectionError) as exc:
            last = exc
            if attempt < attempts - 1:
                time.sleep(base_delay * (2 ** attempt))
    raise RuntimeError(f"Thất bại sau {attempts} lần") from last
```

> 💡 Chỉ retry lỗi transient. Với HTTP, tôn trọng `Retry-After`; thêm jitter để tránh
> thundering herd.

---

## 16. Anti-patterns cơ bản

| Anti-pattern | Vì sao xấu | Cách đúng |
|---|---|---|
| `def f(x=[])` | Default dùng lại giữa các lần gọi | `None` + khởi tạo trong hàm |
| `except Exception: pass` | Nuốt lỗi, khó debug | Bắt cụ thể, log, re-raise |
| `from module import *` | Ô nhiễm namespace, khó trace | Import tường minh |
| Dùng `is` so sánh giá trị | Phụ thuộc interning | Dùng `==` |
| Nối chuỗi bằng `+=` trong vòng lớn | O(n²) | `"".join(parts)` |
| `list.remove` trong lúc duyệt | Bỏ sót phần tử | Duyệt bản copy hoặc comprehension |
| `dict.fromkeys(keys, [])` | Chia sẻ cùng list | `{k: [] for k in keys}` |
| Kiểm tra `type(x) == T` | Bỏ qua kế thừa, không hỗ trợ ABC | `isinstance(x, T)` |
| Dùng `eval`/`exec` với input | RCE | Parse an toàn (`ast.literal_eval`, JSON) |
| `pickle` dữ liệu không tin cậy | RCE khi unpickle | JSON/Protobuf + validation |
| Lưu tiền bằng float | Sai số | `Decimal` hoặc integer đơn vị nhỏ |
| `datetime.utcnow()` | Naive, dễ sai múi giờ | `datetime.now(timezone.utc)` |
| So sánh float bằng `==` | Sai số nhị phân | `math.isclose` |
| `assert` validate input | Bị tắt với `-O` | Raise `ValueError` |
| Log bằng f-string | Format cả khi level tắt | `logger.info("%s", x)` |
| Global mutable state | Khó test, race condition | Truyền dependency, class |
| God class/Module khổng lồ | Khó hiểu, khó test | Tách theo trách nhiệm |
| Copy-paste code | Lệch logic, khó bảo trì | Hàm dùng chung, trừu tượng hóa |
| Không ghim dependency | Build không tái lập | Lockfile + CI `--frozen` |

---

## 17. Tài liệu tham khảo

- Python Tutorial: https://docs.python.org/3/tutorial/
- Python Language Reference: https://docs.python.org/3/reference/
- Python Standard Library: https://docs.python.org/3/library/
- PEP 8 — Style Guide: https://peps.python.org/pep-0008/
- PEP 484/523 — Type hints: https://peps.python.org/pep-0484/
- pytest: https://docs.pytest.org/
- Ruff: https://docs.astral.sh/ruff/
- Real Python: https://realpython.com/
- Python Morsels: https://www.pythonmorsels.com/
- Fluent Python (Ramalho) — đọc sau basics
- Effective Python (Slatkin) — 90 cách viết Pythonic

---

*Tiếp theo: [`python-advanced.md`](./python-advanced.md) để hiểu data model, async, GIL,
profiling và packaging.*
