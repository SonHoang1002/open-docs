# Python Interview — Fresher

> ~100 câu nền tảng cho ứng viên 0–1 năm: cú pháp, kiểu dữ liệu, collection, hàm, OOP,
> exception, file, stdlib, test, debug, Git, SQL, HTTP và coding. Đáp án viết theo hướng
> "nói được trong 60–90 giây", kèm bẫy thường gặp.

---

## Mục lục

1. [Python cơ bản](#1-python-cơ-bản)
2. [Hàm và OOP](#2-hàm-và-oop)
3. [Module, package, công cụ](#3-module-package-công-cụ)
4. [File, stdlib, exception](#4-file-stdlib-exception)
5. [Test, debug, Git, SQL](#5-test-debug-git-sql)
6. [Web và API cơ bản](#6-web-và-api-cơ-bản)
7. [Coding](#7-coding)
8. [Coding bổ sung](#8-coding-bổ-sung)
9. [Tình huống ngắn](#9-tình-huống-ngắn)
10. [Rapid-fire](#10-rapid-fire)
11. [Tài liệu tham khảo](#11-tài-liệu-tham-khảo)

---

## 1. Python cơ bản

### Q01. Python là ngôn ngữ gì? Biên dịch hay thông dịch? [F]

**Trả lời:** Python là ngôn ngữ bậc cao, đa mục đích, kiểu động, cú pháp hướng đọc. CPython
biên dịch source sang **bytecode** rồi chạy trên máy ảo, nên thường gọi là "thông dịch" —
không tạo file thực thi native trực tiếp. Có implementation khác như PyPy (JIT), GraalPy.

**Điểm cộng:** phân biệt bytecode cache `.pyc` (tăng tốc khởi động) với native code; Python
vẫn có bước compile, chỉ không compile ra máy.

**Bẫy:** nói "Python chạy từng dòng, không bao giờ compile" — sai bản chất.

---

### Q02. Python 2 và Python 3 khác gì? [F]

**Trả lời:** Python 3 là chuẩn hiện tại; Python 2 đã hết hỗ trợ từ 2020. Khác biệt lớn:
`print` là hàm, `/` trả float, `str` là Unicode (bytes tách riêng), `range` trả iterator,
dict `.keys()` trả view, exception `as`, thư viện chuẩn đổi tên.

**Điểm cộng:** không còn lý do dùng Python 2 cho dự án mới; code cũ cần kiểm tra dependency
và dùng `2to3`/`six` khi migrate.

---

### Q03. Python có kiểu động nghĩa là gì? [F]

**Trả lời:** Kiểu gắn với **object**, không gắn với tên biến. Cùng một biến có thể trỏ tới
int rồi str. Tuy vậy Python **strong typing**: không tự ép `"1" + 1`, sẽ `TypeError`.

```python
x = 1
x = "một"        # hợp lệ
"1" + 1          # TypeError
```

**Điểm cộng:** type hint giúp phát hiện lỗi tĩnh nhưng không thay đổi runtime; muốn kiểm
tra runtime phải validate (Pydantic) hoặc dùng thư viện như beartype.

---

### Q04. List và tuple khác nhau thế nào? [F]

**Trả lời:** List mutable, có method `append/remove/sort`, dùng cho dữ liệu thay đổi. Tuple
immutable, hashable nếu phần tử hashable, nhẹ hơn, dùng cho bản ghi cố định, key dict, trả
nhiều giá trị.

```python
xs = [1, 2]; xs.append(3)
t = (1, 2); x, y = t
{(1, 2): "point"}       # tuple làm key được
{[1, 2]: "point"}       # TypeError: list unhashable
```

**Bẫy:** tuple chứa list vẫn unhashable; "immutable" chỉ ở mức tham chiếu, không deep.

---

### Q05. Dict hoạt động thế nào và dùng khi nào? [F]

**Trả lời:** Dict là bảng băm ánh xạ key hashable → value, truy cập trung bình O(1), giữ thứ
tự chèn từ Python 3.7. Dùng khi cần tra cứu theo khóa, đếm, nhóm, cấu hình.

```python
orders = {"A001": "paid"}
orders["A002"] = "pending"
orders.get("A003", "unknown")     # không KeyError
for order_id, status in orders.items():
    print(order_id, status)
```

**Bẫy:** key phải hashable; không sửa kích thước dict khi đang duyệt.

---

### Q06. Set là gì? Khác list ở đâu? [F]

**Trả lời:** Set là tập hợp không trùng, không index, phần tử hashable; membership trung
bình O(1). Dùng khử trùng, kiểm tra tồn tại, phép giao/hợp/hiệu. Không giữ thứ tự.

```python
a = {1, 2}; b = {2, 3}
a | b        # {1, 2, 3}
a & b        # {2}
a - b        # {1}
list(dict.fromkeys([1, 2, 1]))   # giữ thứ tự: [1, 2]
```

**Bẫy:** `set()` rỗng, không dùng `{}` (đó là dict); phần tử phải hashable.

---

### Q07. `None` là gì? Khác `0`, `""`, `[]` thế nào? [F]

**Trả lời:** `None` là singleton đại diện "không có giá trị". Nó falsy nhưng khác `0`, `""`,
`[]` về ý nghĩa. So sánh bằng `is None`, không `== None`.

```python
def find(name):
    return None if name not in customers else name

if result is None:
    print("không thấy")
```

**Bẫy:** dùng `if not value` khi `0`/`""` là giá trị hợp lệ sẽ xử lý sai. Dùng `is None` khi
cần phân biệt.

---

### Q08. `is` và `==` khác nhau thế nào? [F]

**Trả lời:** `==` so **giá trị** (gọi `__eq__`), `is` so **identity** (cùng object). Dùng
`is` cho `None`, `True`, `False`, sentinel; dùng `==` cho dữ liệu.

```python
a = [1, 2]; b = [1, 2]
a == b       # True
a is b       # False
a is None    # False
```

**Bẫy:** CPython cache số nhỏ và intern chuỗi, nên `257 is 257` có thể khác nhau tùy ngữ
cảnh. Đừng dựa vào đó.

---

### Q09. Mutable và immutable là gì? Vì sao quan trọng? [F]

**Trả lời:** Immutable không đổi giá trị sau khi tạo: `int`, `float`, `str`, `tuple`,
`frozenset`. Mutable đổi được: `list`, `dict`, `set`, object tự định nghĩa.

Quan trọng vì:

- Truyền vào hàm: mutable có thể bị sửa ngoài ý muốn.
- Làm dict key/set member: phải hashable/immutable.
- Chia sẻ giữa thread: mutable cần đồng bộ.
- Default argument: mutable default bị dùng lại.

```python
def add(xs=[]): ...       # bẫy
def add(xs=None): ...     # đúng
```

---

### Q10. `int`, `float`, `Decimal` khác nhau? [F]

**Trả lời:** `int` chính xác vô hạn, `float` là IEEE 754 nhị phân (có sai số), `Decimal` là
số thập phân chính xác theo ngữ cảnh. Tiền/kế toán dùng `Decimal` hoặc integer đơn vị nhỏ
nhất; khoa học/đo lường dùng float.

```python
from decimal import Decimal
Decimal("0.1") + Decimal("0.2") == Decimal("0.3")   # True
0.1 + 0.2 == 0.3                                    # False
```

**Bẫy:** `Decimal(0.1)` nhận sai số từ float; phải `Decimal("0.1")`.

---

### Q11. Vì sao `0.1 + 0.2 != 0.3`? [F]

**Trả lời:** Float biểu diễn nhị phân; 0.1 và 0.2 không có biểu diễn chính xác, tổng là
`0.30000000000000004`. So sánh bằng `math.isclose`, hoặc dùng `Decimal` cho tiền.

```python
import math
math.isclose(0.1 + 0.2, 0.3)     # True
```

**Điểm cộng:** biết `round(2.675, 2)` có thể ra `2.67` vì biểu diễn nhị phân.

---

### Q12. String trong Python có mutable không? [F]

**Trả lời:** Không. Mọi phép "sửa" tạo string mới. Vì vậy nối chuỗi trong vòng lặp lớn bằng
`+=` là O(n²); dùng `"".join(parts)`.

```python
s = "abc"
s.upper()          # trả 'ABC', s vẫn 'abc'
s = s + "d"        # tạo object mới
",".join(["a", "b"])   # 'a,b'
```

---

### Q13. f-string là gì? Nêu vài format spec. [F]

**Trả lời:** f-string (3.6+) nhúng biểu thức vào chuỗi, nhanh và dễ đọc.

```python
name, price = "Hoa", 19.9
f"Chào {name}"          # Chào Hoa
f"{price:.2f}"          # 19.90
f"{42:>6}"              # '    42'
f"{42:06d}"             # '000042'
f"{name!r}"             # "'Hoa'"
f"{price=}"             # price=19.9
```

**Bẫy:** f-string evaluate ngay; không dùng cho log lazy (`logger.info("%s", x)` tốt hơn).

---

### Q14. Slicing hoạt động thế nào? [F]

**Trả lời:** Cú pháp `seq[start:stop:step]`, `stop` không bao gồm, index âm tính từ cuối,
bỏ trống nghĩa là đầu/cuối. Slicing tạo bản sao nông.

```python
xs = [0, 1, 2, 3, 4]
xs[1:4]      # [1, 2, 3]
xs[::2]      # [0, 2, 4]
xs[::-1]     # [4, 3, 2, 1, 0]
xs[10:]      # []
xs[10]       # IndexError
```

**Bẫy:** `xs[1:4]` trên list tạo list mới; sửa bản sao không ảnh hưởng list gốc (nhưng phần
tử con vẫn chia sẻ).

---

### Q15. Shallow copy và deep copy khác nhau? [F]

**Trả lời:** Shallow copy tạo container mới nhưng phần tử con vẫn chia sẻ; deep copy đệ quy
copy toàn bộ. Dùng `copy.copy`/`list.copy()` và `copy.deepcopy`.

```python
import copy
a = [[1], [2]]
b = a.copy()
b[0].append(9)
print(a)             # [[1, 9], [2]]
c = copy.deepcopy(a) # độc lập hoàn toàn
```

**Bẫy:** `a[:]`, `dict(a)`, `list(a)` đều shallow; deepcopy object lớn/connection rất chậm
hoặc không hợp lệ.

---

### Q16. Những giá trị nào là falsy? [F]

**Trả lời:** `None`, `False`, `0`, `0.0`, `0j`, `Decimal("0")`, `""`, `b""`, `[]`, `()`,
`{}`, `set()`, `range(0)`. Còn lại truthy, kể cả `"False"`, `[0]`, `-1`.

```python
if not items:
    print("rỗng")
```

**Bẫy:** `if value:` không phân biệt `0` với "không có"; dùng `is None` khi cần.

---

### Q17. `str` và `bytes` khác nhau? [F]

**Trả lời:** `str` là chuỗi Unicode (text), `bytes` là dãy byte (dữ liệu nhị phân). Chuyển
đổi bằng `.encode("utf-8")` và `.decode("utf-8")`. File/network thường là bytes; xử lý text
cần decode đúng encoding.

```python
text = "xin chào"
raw = text.encode("utf-8")
back = raw.decode("utf-8")
```

**Bẫy:** `len("ế")` là 1 nhưng `len("ế".encode())` là 3 (UTF-8); cắt chuỗi theo byte có thể
làm hỏng ký tự.

---

### Q18. Ép kiểu trong Python? [F]

**Trả lời:** Dùng constructor: `int("42")`, `float("3.5")`, `str(42)`, `list("abc")`,
`bool(x)`. Có thể ném `ValueError`/`TypeError`.

```python
int("42")          # 42
int("4.2")         # ValueError
float("3.5")       # 3.5
str(3.5)           # '3.5'
bool("")           # False
```

**Điểm cộng:** validate input trước khi ép; không dùng `eval` để parse số.

---

### Q19. PEP 8 quy ước đặt tên thế nào? [F]

**Trả lời:**

| Thành phần | Quy ước | Ví dụ |
|---|---|---|
| Biến/hàm | `snake_case` | `guest_count` |
| Class | `PascalCase` | `GuestList` |
| Hằng số | `UPPER_SNAKE_CASE` | `MAX_GUESTS` |
| Module/package | `snake_case`, ngắn | `guest_service` |
| "Private" | tiền tố `_` | `_cache` |
| Tránh trùng built-in | thêm hậu tố | `list_`, `type_` |

Dòng tối đa 79 (PEP 8) hoặc 88 (black/ruff). Import theo nhóm stdlib → third-party → local.

---

### Q20. Comment và docstring khác nhau? [F]

**Trả lời:** Comment `#` giải thích cho người đọc code, không được lưu vào `__doc__`.
Docstring là string đầu tiên trong module/class/hàm, mô tả API, truy cập qua `__doc__`,
dùng bởi `help()`/tài liệu.

```python
def total(xs: list[int]) -> int:
    """Trả tổng các số trong xs."""
    return sum(xs)
```

**Điểm cộng:** docstring nên nói **làm gì**, ** tham số/trả về/raise** nếu public; comment
nên nói **vì sao**, không lặp lại code.

---

### Q21. Vì sao Python bắt buộc indentation? [F]

**Trả lời:** Python dùng indentation để xác định block, thay vì `{}`. Thường 4 space mỗi
cấp; trộn tab/space gây `TabError`/`IndentationError`. Cấu hình editor chuyển tab thành 4
space và dùng formatter.

**Bẫy:** copy code từ web có tab ẩn; chạy `ruff format` để chuẩn hóa.

---

### Q22. `input()` và `print()` hoạt động thế nào? [F]

**Trả lời:** `input(prompt)` đọc một dòng, luôn trả `str`; cần ép kiểu. `print(*objects,
sep=" ", end="\n")` ghi ra stdout.

```python
name = input("Tên: ")
age = int(input("Tuổi: "))
print("Chào", name, sep=", ", end="!\n")
```

**Bẫy:** `input()` có thể `EOFError` khi không có dữ liệu (pipe/CI); CLI thật nên dùng
`argparse`/Typer.

---

### Q23. `//`, `%`, `**` khác gì? [F]

**Trả lời:** `//` chia lấy phần nguyên (floor), `%` lấy dư, `**` lũy thừa. Với số âm, `//`
làm tròn xuống, `%` theo dấu số chia.

```python
7 // 2      # 3
7 % 2       # 1
-7 // 2     # -4
-7 % 2      # 1
2 ** 10     # 1024
```

**Bẫy:** `-7 // 2` không phải `-3`; nếu cần truncate về 0, dùng `int(-7 / 2)`.

---

### Q24. Biểu thức điều kiện (ternary) viết thế nào? [F]

**Trả lời:** `value_if_true if condition else value_if_false`.

```python
label = "yes" if status == "yes" else "no"
```

Không lạm dụng lồng nhiều tầng; dùng `if/elif` hoặc dict lookup cho dễ đọc.

---

### Q25. `pass` và `...` khác gì? [F]

**Trả lời:** `pass` là lệnh no-op, dùng khi cú pháp cần block. `...` (Ellipsis) là object,
thường dùng làm placeholder trong stub/protocol hoặc `numpy` slicing.

```python
def todo() -> None:
    pass

class Repo(Protocol):
    def get(self, id: int) -> Guest: ...
```

**Bẫy:** để `pass` trong `except` là nuốt lỗi; placeholder nên có TODO/ticket.

---

## 2. Hàm và OOP

### Q26. Hàm trong Python trả về gì nếu không có `return`? [F]

**Trả lời:** Trả `None`. Hàm có thể `return` sớm, trả một giá trị, tuple, hoặc không trả gì.

```python
def log(msg: str) -> None:
    print(msg)
```

**Điểm cộng:** phân biệt hàm có side effect (in, ghi file) với hàm thuần túy; annotate `-> None`
giúp mypy bắt lỗi dùng nhầm kết quả.

---

### Q27. `*args` và `**kwargs` là gì? [F]

**Trả lời:** `*args` gom tham số positional vào tuple; `**kwargs` gom keyword vào dict. Dùng
khi wrapper/decorator hoặc API nhận số tham số linh hoạt.

```python
def log(*args, **kwargs):
    print(args, kwargs)

log(1, 2, level="info")   # (1, 2) {'level': 'info'}

def call(f, *args, **kwargs):
    return f(*args, **kwargs)
```

**Bẫy:** lạm dụng làm mất signature/autocomplete; ưu tiên tham số tường minh.

---

### Q28. Vì sao `def f(x=[])` là bẫy? [F]

**Trả lời:** Giá trị default được đánh giá **một lần** khi định nghĩa hàm, nên list/dict
được chia sẻ giữa các lần gọi.

```python
def add_bad(name, items=[]):
    items.append(name)
    return items

add_bad("Hoa")     # ['Hoa']
add_bad("Minh")    # ['Hoa', 'Minh']

def add(name, items=None):
    items = [] if items is None else items
    items.append(name)
    return items
```

**Điểm cộng:** áp dụng tương tự cho `dict`, `set`, object; dùng sentinel nếu cần phân biệt
"không truyền" với `None`.

---

### Q29. Scope trong Python hoạt động thế nào? [F]

**Trả lời:** Quy tắc **LEGB**: Local → Enclosing → Global → Built-in. Gán trong hàm tạo biến
local; muốn sửa biến ngoài dùng `nonlocal` (enclosing) hoặc `global` (module).

```python
count = 0

def inc():
    global count
    count += 1

def outer():
    x = 0
    def inner():
        nonlocal x
        x += 1
    inner()
    return x
```

**Bẫy:** đọc biến global OK, nhưng gán mà không khai báo sẽ tạo local/`UnboundLocalError`.

---

### Q30. Lambda là gì? Khi nào dùng? [F]

**Trả lời:** Hàm ẩn danh một biểu thức, trả giá trị biểu thức đó. Dùng cho callback ngắn,
`key=` khi sắp xếp; không dùng cho logic nhiều bước.

```python
sorted(customers, key=lambda c: c["name"])
pairs = [(1, "a"), (2, "b")]
pairs.sort(key=lambda p: p[1])
```

**Bẫy:** lambda không có statement/docstring/annotation; đặt tên bằng `def` thường rõ hơn.

---

### Q31. Closure là gì? [F]

**Trả lời:** Hàm con giữ được biến của scope ngoài sau khi scope đó kết thúc.

```python
def make_counter():
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner

counter = make_counter()
counter()   # 1
counter()   # 2
```

**Bẫy:** closure trong vòng lặp bind biến, không bind giá trị:
`[lambda: i for i in range(3)]` trả `[2, 2, 2]`; dùng `lambda i=i: i`.

---

### Q32. Đệ quy là gì? Cần lưu ý gì? [F]

**Trả lời:** Hàm gọi chính nó, cần **base case** để dừng. Python không tối ưu tail call;
giới hạn ~1000 frame, sâu quá gây `RecursionError`. Dữ liệu lớn nên dùng vòng lặp/stack.

```python
def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("n >= 0")
    return 1 if n < 2 else n * factorial(n - 1)
```

---

### Q33. Type hint có bắt buộc không? Có kiểm tra runtime không? [F]

**Trả lời:** Không bắt buộc, không kiểm tra runtime (trừ khi dùng Pydantic/beartype). Type
hint giúp IDE, mypy/pyright, tài liệu và refactor.

```python
def greet(name: str) -> str:
    return f"Chào {name}"

greet(123)      # vẫn chạy, trả 'Chào 123'
```

**Điểm cộng:** input từ HTTP/env/CSV vẫn phải validate; type hint không thay validation.

---

### Q34. Class và object khác nhau? [F]

**Trả lời:** Class là bản thiết kế (blueprint) định nghĩa thuộc tính/hành vi; object
(instance) là thực thể tạo từ class, có state riêng.

```python
class Guest:
    def __init__(self, name: str) -> None:
        self.name = name

hoa = Guest("Hoa")      # object
minh = Guest("Minh")    # object khác
```

---

### Q35. `self` là gì? Vì sao phải khai báo? [F]

**Trả lời:** `self` là tham chiếu tới instance hiện tại, được truyền tự động khi gọi method.
Python yêu cầu tường minh để phân biệt instance attribute với biến local.

```python
class Guest:
    def __init__(self, name: str) -> None:
        self.name = name

    def greet(self) -> str:
        return f"Chào {self.name}"
```

**Bẫy:** quên `self` trong signature → `TypeError` khi gọi; đặt tên khác `self` được nhưng
không nên.

---

### Q36. `__init__` dùng để làm gì? [F]

**Trả lời:** Khởi tạo instance sau khi `__new__` tạo object; gán attribute, validate, thiết
lập state. Không trả giá trị (phải trả `None`).

```python
class Guest:
    def __init__(self, name: str) -> None:
        if not name.strip():
            raise ValueError("Tên rỗng")
        self.name = name.strip()
```

**Điểm cộng:** phân biệt `__new__` (tạo object) với `__init__` (khởi tạo); hiếm khi cần
`__new__` trừ immutable/singleton.

---

### Q37. Instance attribute và class attribute khác nhau? [F]

**Trả lời:** Class attribute chia sẻ cho mọi instance; instance attribute riêng từng object.
Gán `self.x` tạo instance attribute che class attribute.

```python
class Guest:
    venue = "Hall"          # class attribute

    def __init__(self, name):
        self.name = name    # instance attribute

a, b = Guest("Hoa"), Guest("Minh")
Guest.venue = "Garden"      # đổi cho tất cả
a.venue = "Room"            # chỉ a
```

**Bẫy:** class attribute mutable (`tags = []`) bị chia sẻ; dùng instance attribute hoặc
`field(default_factory=list)`.

---

### Q38. `@classmethod` và `@staticmethod` khác gì? [F]

**Trả lời:** `@classmethod` nhận `cls`, dùng cho factory/thay thế constructor, tôn trọng
subclass. `@staticmethod` không nhận `self`/`cls`, chỉ là hàm tiện ích đặt trong class.

```python
class Guest:
    @classmethod
    def from_csv(cls, line: str) -> "Guest":
        return cls(line.split(",")[0])

    @staticmethod
    def valid(name: str) -> bool:
        return bool(name.strip())
```

**Bẫy:** dùng staticmethod cho hàm không liên quan class — có thể để ngoài module.

---

### Q39. Kế thừa và `super()` hoạt động thế nào? [F]

**Trả lời:** Class con kế thừa attribute/method của cha, có thể override. `super()` gọi
method tiếp theo trong **MRO** (Method Resolution Order), không chỉ cha trực tiếp.

```python
class Person:
    def __init__(self, name: str) -> None:
        self.name = name

class Guest(Person):
    def __init__(self, name: str, side: str) -> None:
        super().__init__(name)
        self.side = side
```

**Điểm cộng:** MRO theo C3; đa kế thừa nên dùng mixin nhỏ; ưu tiên composition khi quan hệ
không phải "is-a".

---

### Q40. `_name` và `__name` khác gì? [F]

**Trả lời:** `_name` là quy ước "nội bộ", không bị chặn truy cập. `__name` bị **name
mangling** thành `_Class__name`, tránh trùng khi kế thừa nhưng **không phải bảo mật**.

```python
class Guest:
    def __init__(self):
        self._cache = {}
        self.__secret = "x"

g = Guest()
g._cache          # vẫn truy cập được
g.__secret        # AttributeError
g._Guest__secret  # vẫn xem được
```

---

### Q41. `__str__` và `__repr__` khác nhau? [F]

**Trả lời:** `__repr__` dành cho developer/debug, nên rõ ràng và có thể tái tạo object;
`__str__` dành cho người dùng cuối. Nếu không có `__str__`, Python fallback `__repr__`.

```python
class Guest:
    def __init__(self, name): self.name = name
    def __repr__(self): return f"Guest({self.name!r})"
    def __str__(self): return f"Khách: {self.name}"
```

**Bẫy:** chỉ viết `__str__`; debugger/list vẫn dùng `repr`, khó đọc.

---

### Q42. Dataclass là gì? Lợi ích? [F]

**Trả lời:** Decorator sinh `__init__`, `__repr__`, `__eq__` từ annotation, giảm boilerplate
cho class chứa dữ liệu.

```python
from dataclasses import dataclass, field

@dataclass
class Guest:
    name: str
    side: str = "bride"
    tags: list[str] = field(default_factory=list)
```

Tùy chọn: `frozen=True` (immutable/hashable), `slots=True` (nhẹ), `order=True`, `kw_only=True`.

**Bẫy:** default mutable phải dùng `field(default_factory=...)`.

---

### Q43. Composition và inheritance, chọn cái nào? [F]

**Trả lời:** Inheritance khi quan hệ thật là "is-a" và hành vi chung ổn định. Composition khi
"has-a"/"uses-a", linh hoạt hơn, ít coupling. Python ưu tiên composition + Protocol/duck typing.

```python
class GuestService:
    def __init__(self, repo, notifier):
        self.repo = repo
        self.notifier = notifier
```

**Bẫy:** kế thừa sâu 4–5 tầng để tái sử dụng vài dòng code; khó hiểu, khó test.

---

### Q44. Property dùng để làm gì? [F]

**Trả lời:** Biến method thành attribute, cho phép validate/tính toán/lazy load mà giữ cú
pháp `obj.x`.

```python
class Guest:
    def __init__(self, name):
        self._name = ""

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not value.strip():
            raise ValueError("Tên rỗng")
        self._name = value.strip()
```

**Bẫy:** setter có side effect nặng (gọi API/DB) — nên dùng method có tên rõ.

---

### Q45. Abstract class là gì? Python có interface không? [F]

**Trả lời:** Dùng `abc.ABC` + `@abstractmethod` để buộc subclass implement. Python không có
`interface` riêng; dùng ABC hoặc `typing.Protocol` (structural typing).

```python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, to: str, msg: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, to: str, msg: str) -> None:
        print(to, msg)
```

**Điểm cộng:** Protocol không cần kế thừa, phù hợp test/fake; ABC kiểm tra lúc tạo instance.

---

## 3. Module, package, công cụ

### Q46. `import` hoạt động thế nào? [F]

**Trả lời:** Python tìm module trong `sys.path` (thư mục script, `PYTHONPATH`, site-packages),
chạy code top-level một lần, cache trong `sys.modules`.

```python
import json
from pathlib import Path
from orders.models import Order
```

**Bẫy:** import chạy side effect; đừng mở DB/gọi API ở top-level. Tránh đặt tên module trùng
stdlib (`json.py`, `random.py`) làm shadow.

---

### Q47. Module và package khác nhau? [F]

**Trả lời:** Module là một file `.py`; package là thư mục chứa module (truyền thống có
`__init__.py`). Package lồng nhau tạo namespace.

```text
orders/
├── __init__.py
├── models.py        # module
└── api/
    ├── __init__.py
    └── orders.py    # module trong package con
```

---

### Q48. `if __name__ == "__main__":` để làm gì? [F]

**Trả lời:** Chỉ chạy block khi file được chạy trực tiếp, không chạy khi import. Cho phép
cùng file vừa là module vừa là script.

```python
def main() -> None:
    ...

if __name__ == "__main__":
    main()
```

**Điểm cộng:** đặt `main()` riêng để test được; dùng `raise SystemExit(main())` cho CLI.

---

### Q49. Virtual environment là gì? Vì sao cần? [F]

**Trả lời:** Môi trường Python cô lập, có interpreter/packages riêng cho từng dự án. Tránh
xung đột version và không làm bẩn Python hệ thống.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# hoặc
uv sync && uv run pytest
```

**Bẫy:** quên activate/kích hoạt sai → cài package vào interpreter khác; kiểm tra
`sys.executable`.

---

### Q50. pip và uv khác nhau? [F]

**Trả lời:** `pip` là installer chuẩn; `uv` là tool viết bằng Rust, nhanh hơn, quản lý
Python version, dependency resolution, lockfile, venv, chạy script. Cả hai đều cài từ PyPI.

```bash
uv add requests
uv sync --frozen
uv run python app.py
```

**Điểm cộng:** uv.lock tái lập môi trường; CI dùng `--frozen` để không cập nhật lock ngoài ý.

---

### Q51. `requirements.txt` và `pyproject.toml` khác gì? [F]

**Trả lời:** `requirements.txt` là danh sách package (có thể pin) cho pip. `pyproject.toml`
là metadata chuẩn của project: build system, dependency, entry point, tool config. Lockfile
(`uv.lock`, `poetry.lock`) ghi resolution đầy đủ để tái lập.

| File | Vai trò |
|---|---|
| `pyproject.toml` | Khai báo project + dependency range |
| `requirements.txt` | Cài nhanh, thường pin |
| `uv.lock` | Resolution chính xác, commit cho app |
| `setup.py` | Legacy, tránh cho dự án mới |

---

### Q52. `__init__.py` có tác dụng gì? [F]

**Trả lời:** Đánh dấu thư mục là package (truyền thống), chạy khi package được import, có
thể re-export API, đặt `__all__`, `__version__`. Từ 3.3 có namespace package không cần file
này, nhưng app thường vẫn dùng để rõ ràng.

```python
# orders/__init__.py
from .models import Order

__all__ = ["Order"]
__version__ = "0.1.0"
```

**Bẫy:** import nặng trong `__init__.py` làm chậm khởi động, dễ circular import.

---

### Q53. Kể vài module thư viện chuẩn hay dùng. [F]

**Trả lời:**

| Module | Dùng cho |
|---|---|
| `pathlib` | Đường dẫn file |
| `json`, `csv` | Dữ liệu |
| `datetime`, `zoneinfo` | Thời gian, múi giờ |
| `collections` | Counter, defaultdict, deque |
| `itertools`, `functools` | Iterator, cache, partial |
| `re` | Regex |
| `logging` | Log |
| `argparse` | CLI |
| `subprocess` | Gọi lệnh |
| `unittest.mock` | Test |
| `typing` | Type hint |

Không cần cài; có sẵn trong distribution Python.

---

### Q54. Làm sao cài và quản lý thư viện bên thứ ba? [F]

**Trả lời:** Khai báo dependency trong `pyproject.toml`/requirements, cài bằng `uv add`/`pip
install`, commit lockfile. Kiểm tra license, maintenance, bảo mật trước khi thêm.

```bash
uv add httpx
uv add --dev pytest
```

**Bẫy:** `pip install` toàn cục vào hệ thống (PEP 668 chặn); không pin version làm build
không tái lập.

---

### Q55. Vì sao không nên cài package vào Python hệ thống? [F]

**Trả lời:** Có thể phá tool hệ điều hành dùng Python đó, xung đột version giữa dự án, khó
tái lập, không rollback. Luôn dùng venv/uv/Docker. Trên macOS/Linux hiện đại, pip còn chặn
bằng `externally-managed-environment`.

---

## 4. File, stdlib, exception

### Q56. `with open(...)` để làm gì? [F]

**Trả lời:** Context manager đảm bảo file được đóng kể cả khi exception. Nên dùng thay
`open()`/`close()` thủ công.

```python
with open("customers.txt", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip("\n"))
```

| Mode | Ý nghĩa |
|---|---|
| `r` | Đọc (mặc định) |
| `w` | Ghi mới, xóa cũ |
| `a` | Ghi nối |
| `x` | Ghi mới, lỗi nếu tồn tại |
| `b` | Binary |

---

### Q57. Vì sao phải chỉ định encoding? [F]

**Trả lời:** Mặc định encoding phụ thuộc locale/hệ điều hành, có thể là cp1252/ascii, gây
`UnicodeDecodeError` hoặc đọc sai tiếng Việt. Luôn `encoding="utf-8"` cho text.

```python
with open("data.csv", encoding="utf-8") as f:
    ...
```

**Bẫy:** Excel trên Windows thường cần `utf-8-sig` khi xuất CSV để hiển thị đúng.

---

### Q58. Đọc/ghi JSON trong Python? [F]

**Trả lời:** `json.load`/`json.dump` cho file object; `json.loads`/`json.dumps` cho string.

```python
import json

with open("guest.json", encoding="utf-8") as f:
    data = json.load(f)

with open("guest.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

**Bẫy:** JSON không có datetime/Decimal/set; serialize tường minh. `json.loads` có thể ném
`JSONDecodeError`.

---

### Q59. Đọc/ghi CSV thế nào? [F]

**Trả lời:** Dùng module `csv`, `DictReader`/`DictWriter`; mở với `newline=""`.

```python
import csv

with open("customers.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row["name"])

with open("out.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "email"])
    writer.writeheader()
    writer.writerow({"name": "Hoa", "email": "hoa@example.com"})
```

**Bẫy:** không xử lý dấu phẩy/quote bằng `split(",")`; dùng csv module hoặc pandas.

---

### Q60. `pathlib` có gì hay? [F]

**Trả lời:** API hướng object cho đường dẫn, thay `os.path`, chạy đa nền tảng.

```python
from pathlib import Path

p = Path("data") / "orders.json"
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("[]", encoding="utf-8")
print(p.stem, p.suffix, p.name)
print(p.exists(), p.is_file())
for f in Path(".").glob("*.py"):
    print(f)
```

**Điểm cộng:** `Path(__file__).resolve().parent` để lấy thư mục script ổn định.

---

### Q61. Exception là gì? [F]

**Trả lời:** Sự kiện bất thường làm gián đoạn luồng bình thường, được biểu diễn bằng object
kế thừa `BaseException`. Code nên bắt `Exception` con cụ thể, xử lý hoặc để lan truyền.

```python
try:
    value = int("abc")
except ValueError as exc:
    print("Sai số:", exc)
```

---

### Q62. `try/except/else/finally` chạy khi nào? [F]

**Trả lời:**

| Khối | Khi chạy |
|---|---|
| `try` | Luôn |
| `except` | Khi exception khớp |
| `else` | Khi `try` không lỗi |
| `finally` | Luôn, kể cả return/raise |

```python
try:
    data = load()
except FileNotFoundError:
    data = []
else:
    print("loaded")
finally:
    print("done")
```

**Bẫy:** `return` trong `finally` nuốt exception; tránh.

---

### Q63. Custom exception viết thế nào? [F]

**Trả lời:** Kế thừa `Exception` (hoặc base của domain), thêm thông tin ngữ cảnh.

```python
class OrderError(Exception):
    """Base lỗi nghiệp vụ."""

class DuplicateOrder(OrderError):
    def __init__(self, order_id: str) -> None:
        self.order_id = order_id
        super().__init__(f"Đơn hàng đã tồn tại: {order_id}")
```

**Điểm cộng:** tầng API map domain error → HTTP status; không lộ traceback ra client.

---

### Q64. `raise` và `raise ... from ...` khác gì? [F]

**Trả lời:** `raise` ném exception mới; `raise NewError(...) from exc` giữ nguyên nhân gốc
(`__cause__`) trong traceback, giúp debug.

```python
try:
    json.loads(text)
except json.JSONDecodeError as exc:
    raise ValueError("JSON hỏng") from exc
```

**Điểm cộng:** `raise` không tham số trong `except` tái ném, giữ traceback gốc.

---

### Q65. EAFP và LBYL là gì? [F]

**Trả lời:** EAFP = "thử rồi bắt lỗi" (`try/except`), Pythonic khi lỗi hiếm. LBYL = "kiểm
tra trước rồi làm" (`if key in dict`). EAFP tránh race và thường nhanh hơn; LBYL rõ với case
đơn giản.

```python
try:
    value = config["timeout"]
except KeyError:
    value = 30

value = config.get("timeout", 30)   # gọn nhất cho dict
```

---

### Q66. `OSError` và các subclass? [F]

**Trả lời:** `OSError` là lỗi hệ điều hành/I/O; subclass phổ biến: `FileNotFoundError`,
`PermissionError`, `IsADirectoryError`, `TimeoutError`, `ConnectionError`. Bắt cụ thể để xử
lý đúng.

```python
try:
    Path("x").read_text()
except FileNotFoundError:
    ...
except PermissionError:
    ...
```

---

### Q67. `datetime` và múi giờ? [F]

**Trả lời:** Dùng `datetime.now(timezone.utc)` cho aware datetime; `zoneinfo` để đổi múi
giờ; lưu DB bằng UTC. Tránh `utcnow()` vì trả naive.

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

now = datetime.now(timezone.utc)
vn = now.astimezone(ZoneInfo("Asia/Ho_Chi_Minh"))
print(vn.isoformat())
```

**Bẫy:** so sánh naive với aware → `TypeError`; parse thiếu timezone gây lệch giờ.

---

### Q68. `random` và `secrets` khác gì? [F]

**Trả lời:** `random` dùng PRNG, không an toàn mật mã; dùng cho game/sample/test. `secrets`
dùng nguồn ngẫu nhiên an toàn cho token, mật khẩu, OTP.

```python
import secrets
token = secrets.token_urlsafe(32)
otp = secrets.randbelow(1_000_000)
```

**Bẫy:** dùng `random` cho reset password/token — có thể đoán được.

---

### Q69. Vì sao dùng `logging` thay `print`? [F]

**Trả lời:** Logging có level, timestamp, tên module, định dạng, đích (file/stdout/JSON),
có thể tắt/bật theo môi trường, tích hợp monitoring. `print` không có ngữ cảnh, khó lọc.

```python
import logging
logger = logging.getLogger(__name__)
logger.info("loaded %d orders", len(orders))
logger.exception("failed")
```

---

### Q70. Gọi lệnh hệ thống bằng Python? [F]

**Trả lời:** Dùng `subprocess.run` với list argument, `check=True`, `capture_output=True`,
`text=True`, và timeout.

```python
import subprocess

result = subprocess.run(
    ["git", "status", "--short"],
    capture_output=True, text=True, check=True, timeout=10,
)
print(result.stdout)
```

**Bẫy:** `shell=True` với input người dùng → command injection; `os.system` cũng không nên.

---

## 5. Test, debug, Git, SQL

### Q71. pytest là gì? Test được discover thế nào? [F]

**Trả lời:** Framework test phổ biến: viết hàm `test_*` trong file `test_*.py`, dùng `assert`,
fixture, parametrize. pytest tự tìm test, chạy độc lập, báo diff rõ.

```python
def test_total():
    assert total([1, 2, 3]) == 6
```

```bash
pytest -q
pytest -k guest
```

---

### Q72. `assert` dùng thế nào? Có nên dùng trong production? [F]

**Trả lời:** `assert condition, message` kiểm tra trong test/debug. Không dùng để validate
input production vì bị tắt khi chạy `python -O`; dùng `if ...: raise ValueError`.

```python
assert add(1, 2) == 3

def withdraw(amount):
    if amount <= 0:
        raise ValueError("amount phải dương")
```

---

### Q73. Fixture trong pytest là gì? [F]

**Trả lời:** Hàm setup/teardown dùng chung, được inject qua tên tham số. Scope mặc định theo
test; có thể `module`/`session`. Dùng `yield` để cleanup.

```python
import pytest

@pytest.fixture
def repo(tmp_path):
    r = Repo(tmp_path / "orders.json")
    yield r
    r.close()
```

---

### Q74. Parametrize để làm gì? [F]

**Trả lời:** Chạy cùng test với nhiều bộ input, mỗi bộ là test riêng, báo lỗi rõ case nào.

```python
import pytest

@pytest.mark.parametrize(("raw", "expected"), [
    ("  Hoa ", "Hoa"),
    ("Minh", "Minh"),
    ("", ""),
])
def test_normalize(raw, expected):
    assert normalize(raw) == expected
```

---

### Q75. Mock dùng khi nào? [F]

**Trả lời:** Thay dependency bên ngoài (HTTP, email, clock) để test nhanh, tất định. Không
mock chính logic đang test hoặc mọi thứ.

```python
def test_send(monkeypatch):
    sent = []
    monkeypatch.setattr("app.email.send", lambda to, msg: sent.append(to))
    notify("a@example.com", "hi")
    assert sent == ["a@example.com"]
```

**Bẫy:** patch sai vị trí (nơi định nghĩa thay vì nơi tra cứu).

---

### Q76. Coverage là gì? Có phải càng cao càng tốt? [F]

**Trả lời:** Tỉ lệ dòng/nhánh được test chạy qua. Là chỉ số phát hiện vùng chưa test, không
đảm bảo chất lượng. 100% coverage vẫn có thể bỏ sót logic. Ưu tiên hành vi quan trọng,
boundary và error path.

```bash
pytest --cov=src --cov-report=term-missing
```

---

### Q77. Đọc traceback thế nào? [F]

**Trả lời:** Đọc **từ dưới lên**: tên exception + message, sau đó frame gần nhất trong code
của bạn. Các frame phía trên là chuỗi gọi hàm.

```text
Traceback (most recent call last):
  File "app.py", line 8, in main
    print(orders[3])
IndexError: list index out of range
```

**Điểm cộng:** chỉ đọc phần cuối nếu traceback dài; tìm dòng code mình kiểm soát.

---

### Q78. Debug bằng breakpoint thế nào? [F]

**Trả lời:** Chèn `breakpoint()` (3.7+) hoặc `import pdb; pdb.set_trace()`, chạy code, dùng
`n` (next), `s` (step), `c` (continue), `p expr` (print), `l` (list), `q` (quit). IDE cũng
có debugger tích hợp.

**Bẫy:** quên xóa `breakpoint()` trước khi commit; dùng debugger IDE hoặc `PYTHONBREAKPOINT=0`.

---

### Q79. Kể vài lỗi runtime thường gặp và cách sửa. [F]

| Lỗi | Nguyên nhân | Sửa |
|---|---|---|
| `IndexError` | Truy cập quá độ dài | Kiểm tra `len`, slice |
| `KeyError` | Key không có | `.get`, `in`, `defaultdict` |
| `TypeError` | Sai kiểu/thiếu arg | Đọc message, signature |
| `ValueError` | Đúng kiểu sai giá trị | Validate trước |
| `AttributeError` | Object/None không có attr | Kiểm tra `None` |
| `NameError` | Chưa định nghĩa/typo | Import/khai báo |
| `UnboundLocalError` | Đọc local trước khi gán | Khởi tạo/`nonlocal` |
| `JSONDecodeError` | JSON hỏng | Log input, validate |

---

### Q80. Làm sao debug một hàm trả sai kết quả? [F]

**Trả lời:** Tái hiện với input nhỏ nhất, kiểm tra input thực tế (in/log), chia nhỏ hàm, so
sánh kết quả từng bước với kỳ vọng, viết test tái hiện, sửa nguyên nhân gốc. Không sửa mò.

**Điểm cộng:** dùng `assert`/test nhỏ, kiểm tra edge case (rỗng, None, 0, Unicode).

---

### Q81. Git workflow cơ bản? [F]

**Trả lời:**

```bash
git status
git add file.py
git commit -m "feat: add guest endpoint"
git pull --rebase origin main
git push origin feature/guest
```

Tạo PR, review, merge. Không commit secret/build artifact; commit nhỏ, message rõ.

---

### Q82. Merge và rebase khác gì? [F]

**Trả lời:** Merge tạo merge commit, giữ lịch sử phân nhánh. Rebase đặt lại commit lên đầu
nhánh khác, lịch sử tuyến tính nhưng **viết lại hash**. Không rebase nhánh đã push chung;
dùng rebase cho nhánh cá nhân trước PR.

**Bẫy:** force push đè nhánh người khác; conflict resolve cẩu thả làm mất code.

---

### Q83. `.gitignore` dùng để làm gì? [F]

**Trả lời:** Chỉ định file/thư mục Git bỏ qua: `.venv/`, `__pycache__/`, `.env`, `*.pyc`,
`dist/`, `.idea/`, file DB local. Không ignore file cần cho build/test.

**Bẫy:** đã commit `.env` rồi thêm ignore vẫn còn trong history; phải xóa và rotate secret.

---

### Q84. Khi review code của đồng nghiệp, bạn chú ý gì? [F]

**Trả lời:** Logic đúng yêu cầu, edge case, tên rõ, test, exception handling, bảo mật (secret/
SQL injection), hiệu năng cơ bản (N+1), style nhất quán. Comment cụ thể, phân biệt blocking
và suggestion, tôn trọng.

**Điểm cộng:** hỏi "vì sao" trước khi khẳng định sai; đề xuất giải pháp.

---

### Q85. SQL cơ bản: SELECT, JOIN, GROUP BY? [F]

**Trả lời:**

```sql
SELECT status, count(*) AS total
FROM orders
WHERE created_at >= '2026-01-01'
GROUP BY status
HAVING count(*) > 10
ORDER BY total DESC
LIMIT 10;

SELECT c.name, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
```

`WHERE` lọc trước group; `HAVING` lọc sau group; `LEFT JOIN` giữ mọi dòng bên trái.

---

## 6. Web và API cơ bản

### Q86. HTTP methods phổ biến? [F]

**Trả lời:** `GET` đọc, `POST` tạo, `PUT` thay thế toàn bộ, `PATCH` sửa một phần, `DELETE`
xóa. `GET/HEAD/OPTIONS` idempotent; `PUT/DELETE` idempotent; `POST` không.

**Điểm cộng:** idempotent nghĩa gọi nhiều lần cùng kết quả; `PATCH` không nhất thiết
idempotent tùy thiết kế.

---

### Q87. Các nhóm HTTP status code? [F]

**Trả lời:** 1xx thông tin, 2xx thành công, 3xx chuyển hướng, 4xx lỗi client, 5xx lỗi server.
Hay dùng: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503.

| Code | Nghĩa |
|---|---|
| 201 | Tạo thành công |
| 204 | Thành công, không body |
| 400 | Request sai |
| 401 | Chưa xác thực |
| 403 | Không có quyền |
| 404 | Không thấy |
| 409 | Xung đột |
| 422 | Dữ liệu không hợp lệ |
| 500 | Lỗi server |

---

### Q88. REST là gì? Nêu nguyên tắc chính. [F]

**Trả lời:** Phong cách kiến trúc API dựa trên resource + HTTP. Nguyên tắc: URL danh từ
(`/orders/1`), dùng method/status đúng, stateless, response cacheable, uniform interface,
HATEOAS tùy mức.

**Bẫy:** đặt động từ trong URL (`/getOrders`) hoặc trả 200 cho mọi lỗi.

---

### Q89. JSON là gì? Vì sao dùng trong API? [F]

**Trả lời:** Định dạng text trao đổi dữ liệu, gồm object/array/string/number/bool/null. Nhẹ,
dễ đọc, hỗ trợ rộng. Không có datetime/comment/trailing comma; number là float chung.

---

### Q90. GET và POST khác nhau? [F]

**Trả lời:** GET lấy dữ liệu, tham số trên URL, có thể cache/bookmark, không nên có side
effect. POST gửi dữ liệu trong body, không cache mặc định, dùng tạo/cập nhật/hành động.

**Bẫy:** đặt token/mật khẩu trong query string GET (lộ log/history).

---

### Q91. Xác thực API cơ bản bằng gì? [F]

**Trả lời:** Session cookie (web), API key (service), JWT/OAuth2 (mobile/SPA/bên thứ ba).
Luôn dùng HTTPS, kiểm tra token hết hạn/quyền, không lưu secret trong client code.

**Điểm cộng:** JWT cần verify signature + `exp` + `aud` + `iss`; không nhận `alg` tùy ý.

---

### Q92. SQL và NoSQL khác gì? [F]

**Trả lời:** SQL (quan hệ) có schema, transaction mạnh, join, phù hợp dữ liệu có cấu trúc và
quan hệ. NoSQL (document/key-value/wide-column/graph) linh hoạt schema, scale ngang, phù hợp
dữ liệu phi cấu trúc/cache/log. Chọn theo access pattern, không theo trend.

---

### Q93. Primary key và foreign key? [F]

**Trả lời:** Primary key định danh duy nhất mỗi dòng, không NULL. Foreign key tham chiếu PK
bảng khác, đảm bảo toàn vẹn quan hệ; có thể có `ON DELETE`/`ON UPDATE`.

```sql
CREATE TABLE payments (
  id bigserial PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL
);
```

---

### Q94. Index là gì? Khi nào nên tạo? [F]

**Trả lời:** Cấu trúc phụ giúp tìm/lọc/sort nhanh hơn, đổi lại tốn dung lượng và làm chậm
ghi. Tạo cho cột dùng trong `WHERE`, `JOIN`, `ORDER BY` thường xuyên; tránh index thừa.

**Bẫy:** index không được dùng nếu query bọc hàm (`WHERE lower(name) = ...`) trừ khi tạo
functional index.

---

### Q95. Transaction và ACID? [F]

**Trả lời:** Transaction là đơn vị công việc all-or-nothing. ACID: Atomicity (tất cả hoặc
không), Consistency (ràng buộc đúng), Isolation (không thấy dở dang), Durability (commit
bền).

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

---

## 7. Coding

### Q96. FizzBuzz [F]

**Trả lời:**

```python
def fizzbuzz(n: int) -> list[str]:
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("FizzBuzz")
        elif i % 3 == 0:
            out.append("Fizz")
        elif i % 5 == 0:
            out.append("Buzz")
        else:
            out.append(str(i))
    return out
```

**Điểm cộng:** kiểm tra `n <= 0` trả list rỗng; có thể viết comprehension nhưng ưu tiên rõ.

---

### Q97. Kiểm tra palindrome [F]

**Trả lời:**

```python
def is_palindrome(text: str) -> bool:
    cleaned = "".join(ch.casefold() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]
```

**Điểm cộng:** bỏ khoảng trắng/dấu câu, xử lý Unicode; hỏi có phân biệt hoa/thường không.

---

### Q98. Đếm tần suất từ [F]

**Trả lời:**

```python
import re
from collections import Counter

def word_count(text: str) -> dict[str, int]:
    words = re.findall(r"\b\w+\b", text.casefold())
    return dict(Counter(words))
```

**Điểm cộng:** nêu giới hạn regex với tiếng Việt/Unicode; có thể dùng `split()` nếu chỉ cần
đơn giản.

---

### Q99. Two Sum [F]

**Trả lời:** Dùng dict lưu giá trị đã thấy, O(n).

```python
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, value in enumerate(nums):
        need = target - value
        if need in seen:
            return seen[need], i
        seen[value] = i
    return None
```

**Điểm cộng:** nêu brute force O(n²) trước, rồi tối ưu; hỏi về trùng số/không có đáp án.

---

### Q100. Khử trùng và flatten list [F]

**Trả lời:**

```python
def unique(items: list[str]) -> list[str]:
    return list(dict.fromkeys(items))

def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

print(list(flatten([1, [2, [3]], 4])))   # [1, 2, 3, 4]
```

**Điểm cộng:** `dict.fromkeys` giữ thứ tự; flatten đệ quy có thể chạm giới hạn recursion
với dữ liệu sâu — nêu phương án stack.

---

## 8. Coding bổ sung

### C01. Đảo ngược chuỗi không dùng `[::-1]` [F]

```python
def reverse(text: str) -> str:
    chars = list(text)
    left, right = 0, len(chars) - 1
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return "".join(chars)
```

**Điểm cộng:** nêu O(n) time, O(n) space; với Unicode combining mark cần cẩn thận grapheme.

---

### C02. Tìm phần tử trùng đầu tiên [F]

```python
def first_duplicate(items: list[int]) -> int | None:
    seen: set[int] = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    return None
```

**Điểm cộng:** O(n) thay vì O(n²); nêu biến thể "phần tử chỉ xuất hiện một lần".

---

### C03. Đếm ký tự trong chuỗi [F]

```python
from collections import Counter

def char_count(text: str) -> dict[str, int]:
    return dict(Counter(text))
```

**Điểm cộng:** có thể bỏ khoảng trắng/chuẩn hóa case; nêu Unicode.

---

### C04. Kiểm tra hai chuỗi anagram [F]

```python
from collections import Counter

def is_anagram(a: str, b: str) -> bool:
    clean = lambda s: "".join(ch.casefold() for ch in s if ch.isalnum())
    return Counter(clean(a)) == Counter(clean(b))
```

**Điểm cộng:** so sánh độ dài trước; sort cũng được nhưng O(n log n), Counter O(n).

---

### C05. Fibonacci có cache [F]

```python
from functools import cache

@cache
def fib(n: int) -> int:
    if n < 0:
        raise ValueError("n >= 0")
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

**Điểm cộng:** nêu vòng lặp O(n) nếu không muốn recursion; cache giữ kết quả giữa các lần gọi.

---

### C06. Tổng chữ số [F]

```python
def digit_sum(n: int) -> int:
    n = abs(n)
    total = 0
    while n:
        total += n % 10
        n //= 10
    return total
```

---

### C07. Kiểm tra số nguyên tố [F]

```python
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    for d in range(3, int(n ** 0.5) + 1, 2):
        if n % d == 0:
            return False
    return True
```

**Điểm cộng:** O(√n); xử lý 0/1/2; với số rất lớn cần thuật toán khác.

---

### C08. Gộp hai list đã sort [F]

```python
def merge_sorted(a: list[int], b: list[int]) -> list[int]:
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result
```

**Điểm cộng:** O(n+m), stable; có thể dùng `heapq.merge` cho nhiều list.

---

## 9. Tình huống ngắn

### F1. Chạy `python app.py` báo `ModuleNotFoundError: No module named 'requests'`. Bạn kiểm tra gì?

**Trả lời:** Kiểm tra interpreter đang dùng (`sys.executable`), đã activate venv chưa, package
đã cài đúng môi trường chưa. Chạy `python -m pip show requests`, `uv run python app.py`. Nếu
dùng IDE, kiểm tra interpreter setting. Không cài bừa vào Python hệ thống.

---

### F2. Code chạy local nhưng CI fail vì không import được package. Vì sao?

**Trả lời:** Thường do layout `src/` chưa cài package hoặc `sys.path` khác. Kiểm tra CI có
`uv sync`/`pip install -e .` không, `pythonpath` trong pytest, và có file `__init__.py` đúng.
Không thêm `sys.path.append` bừa để che lỗi.

---

### F3. API trả 500, bạn xem gì đầu tiên?

**Trả lời:** Log server theo request id (traceback, input, thời điểm), status/metric, và tái
hiện bằng request tối thiểu. Không đoán; kiểm tra deploy gần nhất, migration, dependency.
Nếu chưa có log, thêm log an toàn rồi deploy bản vá.

---

### F4. Yêu cầu từ PM mơ hồ: "làm tính năng tìm kiếm". Bạn làm gì?

**Trả lời:** Hỏi lại mục tiêu, người dùng, phạm vi (tên/email/số điện thoại?), hành vi khi
không có kết quả, phân trang, quyền truy cập, hiệu năng. Viết acceptance criteria ngắn và
xác nhận trước khi code. Đề xuất MVP nhỏ nhất.

---

### F5. Vì sao test này fail?

```python
def add(name, items=[]):
    items.append(name)
    return items

assert add("a") == ["a"]
assert add("b") == ["b"]      # fail
```

**Trả lời:** Default list được tạo một lần và dùng lại, nên lần hai trả `["a", "b"]`. Sửa
bằng `items=None` + khởi tạo trong hàm. Viết regression test.

---

### F6. Sắp xếp list dict theo `side` tăng, `age` giảm.

**Trả lời:**

```python
sorted(orders, key=lambda o: (o["status"], -o["amount"]))
```

Nêu ổn định (stable), O(n log n), không mutate list gốc; `list.sort` nếu muốn tại chỗ.

---

### F7. Đọc CSV báo `UnicodeDecodeError`. Xử lý thế nào?

**Trả lời:** Xác định encoding thật (UTF-8, UTF-8 BOM, cp1258, latin-1). Thử mở với
`encoding="utf-8-sig"` nếu có BOM; dùng `chardet`/`charset-normalizer` để dò. Không dùng
`errors="ignore"` che dữ liệu hỏng; log và báo nguồn.

---

### F8. Đồng nghiệp review code của bạn và bảo "đừng dùng `except Exception`". Bạn phản hồi?

**Trả lời:** Đồng ý nếu chỉ để nuốt lỗi. Hỏi ngữ cảnh: nếu cần bắt rộng ở biên (worker/
middleware) để log rồi re-raise, có thể chấp nhận. Sửa thành exception cụ thể, thêm log và
test. Không bảo vệ quan điểm bằng cảm tính.

---

## 10. Rapid-fire

| Câu | Đáp án ngắn |
|---|---|
| List có hashable không? | Không; tuple/frozenset có (nếu phần tử hashable) |
| `{}` là gì? | Dict rỗng, không phải set |
| Set rỗng viết sao? | `set()` |
| `range(5)` trả gì? | Iterator các số 0..4 |
| `len(range(0, 10, 2))`? | 5 |
| `bool([])`? | `False` |
| `type(True)`? | `bool` (subclass của `int`) |
| `1 / 2`? | `0.5` |
| `1 // 2`? | `0` |
| `2 ** 3 ** 2`? | 512 (phải kết hợp) |
| `"a" * 3`? | `"aaa"` |
| `[1, 2] * 2`? | `[1, 2, 1, 2]` |
| `sort()` trả gì? | `None` (tại chỗ) |
| `sorted()` trả gì? | List mới |
| `dict.get` khác `dict[]`? | Không ném KeyError, có default |
| `is` so gì? | Identity |
| `==` so gì? | Giá trị |
| `None` có hashable? | Có |
| `str` có mutable? | Không |
| f-string có trong 3.6+? | Có |
| `match` cần version nào? | 3.10+ |
| `TaskGroup` cần version nào? | 3.11+ |
| `type` alias cần version nào? | 3.12+ |
| `except*` cần version nào? | 3.11+ |
| `datetime.utcnow()` nên dùng? | Không, dùng `now(timezone.utc)` |
| Float so sánh bằng gì? | `math.isclose` |
| Tiền dùng kiểu gì? | `Decimal`/int |
| Random token dùng module nào? | `secrets` |
| Log exception dùng gì? | `logger.exception` |
| Test file tên gì? | `test_*.py` |
| Fixture cleanup bằng gì? | `yield` |
| `requirements.txt` thay gì? | `pyproject.toml` + lock |
| `__init__.py` bắt buộc? | Không từ 3.3 (namespace package), nhưng nên có |
| `if __name__` để làm gì? | Chỉ chạy khi là script |
| `self` là gì? | Instance hiện tại |
| `@staticmethod` nhận gì? | Không nhận self/cls |
| `@classmethod` nhận gì? | `cls` |
| `super()` làm gì? | Gọi theo MRO |
| `_x` là private thật? | Không, chỉ quy ước |
| `__x` bị gì? | Name mangling |
| `__repr__` cho ai? | Developer/debug |
| `dataclass` sinh gì? | `__init__`, `__repr__`, `__eq__` |
| `field(default_factory=...)` để làm gì? | Default mutable an toàn |
| `try/finally` đảm bảo gì? | Cleanup luôn chạy |
| `raise ... from` để làm gì? | Giữ nguyên nhân |
| `assert` production? | Không nên |
| `pass` là gì? | No-op |
| `...` là gì? | Ellipsis |
| `pip` vào hệ thống? | Không nên |
| `uv sync --frozen`? | Cài đúng lock, không đổi |
| `ruff` làm gì? | Lint + format |
| `mypy` làm gì? | Type check tĩnh |
| `pytest -x`? | Dừng ở fail đầu |
| `pytest --lf`? | Chạy lại test fail lần trước |
| HTTP 201? | Created |
| HTTP 204? | No Content |
| HTTP 401 vs 403? | Chưa auth vs không có quyền |
| HTTP 409? | Conflict |
| Idempotent method? | GET, PUT, DELETE |
| REST URL đúng? | `/orders/1` |
| Transaction là gì? | All-or-nothing |
| Index đánh đổi gì? | Nhanh đọc, chậm ghi, tốn disk |
| `LEFT JOIN` giữ gì? | Mọi dòng bảng trái |
| `GROUP BY` trước hay `WHERE`? | `WHERE` trước |
| `HAVING` lọc gì? | Sau group |
| JSON có comment? | Không |
| JSON number kiểu gì? | Một loại số (float-ish) |

---

## 11. Tài liệu tham khảo

- Python Tutorial: https://docs.python.org/3/tutorial/
- PEP 8: https://peps.python.org/pep-0008/
- pytest: https://docs.pytest.org/
- Git handbook: https://guides.github.com/introduction/git-handbook/
- MDN HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP
- PostgreSQL Tutorial: https://www.postgresql.org/docs/current/tutorial.html
- [`../python-basics.md`](../python-basics.md)
- [`../python-cheatsheet.md`](../python-cheatsheet.md)

---

*Tiếp theo: [`02-junior.md`](./02-junior.md) nếu đã vững nền tảng và đi làm 1–3 năm.*
