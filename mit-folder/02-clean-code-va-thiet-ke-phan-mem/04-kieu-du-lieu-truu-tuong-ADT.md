# Kiểu dữ liệu trừu tượng (Abstract Data Types — ADT)

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering*, Fall 2005 — ba bài:

- **Bài 7: Introduction to ADTs** (đặc trưng hóa bằng hoạt động, sự độc lập biểu diễn)
- **Bài 8: Representation Invariants** (bất biến biểu diễn, lộ biểu diễn)
- **Bài 9: Abstraction Functions** (hàm trừu tượng hóa, trường đặc tả)

Đọc kèm: *Program Development in Java* — Barbara Liskov.

---

## Mục lục

**Phần I — Nền tảng (Bài 7)**

1. [Kiểu do người dùng định nghĩa](#1-kiểu-do-người-dùng-định-nghĩa)
2. [Đặc trưng hóa một kiểu bằng các hoạt động](#2-đặc-trưng-hóa-một-kiểu-bằng-các-hoạt-động)
3. [Phân loại kiểu: bất biến và có thể thay đổi](#3-phân-loại-kiểu-bất-biến-và-có-thể-thay-đổi)
4. [Phân loại hoạt động: creators, producers, mutators, observers](#4-phân-loại-hoạt-động-creators-producers-mutators-observers)
5. [Ví dụ: kiểu List và trường đặc tả](#5-ví-dụ-kiểu-list-và-trường-đặc-tả)
6. [Thiết kế một kiểu trừu tượng](#6-thiết-kế-một-kiểu-trừu-tượng)
7. [Chọn biểu diễn](#7-chọn-biểu-diễn)
8. [Sự độc lập biểu diễn](#8-sự-độc-lập-biểu-diễn)
9. [Cơ chế ngôn ngữ hỗ trợ](#9-cơ-chế-ngôn-ngữ-hỗ-trợ)

**Phần II — Bất biến biểu diễn (Bài 8)**

10. [Hai không gian: rep và abstract](#10-hai-không-gian-rep-và-abstract)
11. [Bất biến biểu diễn và hàm trừu tượng hóa](#11-bất-biến-biểu-diễn-và-hàm-trừu-tượng-hóa)
12. [Ví dụ bất biến biểu diễn: cây nhị phân](#12-ví-dụ-bất-biến-biểu-diễn-cây-nhị-phân)
13. [Bất biến biểu diễn cho suy luận mô-đun](#13-bất-biến-biểu-diễn-cho-suy-luận-mô-đun)
14. [Lộ biểu diễn (representation exposure)](#14-lộ-biểu-diễn-representation-exposure)

**Phần III — Hàm trừu tượng hóa (Bài 9)**

15. [Đối tượng trừu tượng và đối tượng cụ thể](#15-đối-tượng-trừu-tượng-và-đối-tượng-cụ-thể)
16. [Một hàm trừu tượng hóa tinh tế: hàng đợi bất biến](#16-một-hàm-trừu-tượng-hóa-tinh-tế-hàng-đợi-bất-biến)
17. [Trường đặc tả (specification fields)](#17-trường-đặc-tả-specification-fields)
18. [Hiệu ứng phụ thiện chí (benevolent side effects)](#18-hiệu-ứng-phụ-thiện-chí-benevolent-side-effects)
19. [Tóm tắt và bài tập](#19-tóm-tắt-và-bài-tập)

---

# Phần I — Nền tảng (Bài 7)

Bài giảng này là bài đầu tiên trong chuỗi về **trừu tượng hóa dữ liệu**. Nó giải thích động cơ của trừu tượng hóa dữ liệu, và hai ý tưởng then chốt: **đặc trưng hóa bằng hoạt động** (characterization by operations) và **sự độc lập biểu diễn** (representation dependence).

## 1. Kiểu do người dùng định nghĩa

### Lịch sử

Thời đầu của điện toán, ngôn ngữ lập trình đi kèm kiểu có sẵn (số nguyên, boolean, chuỗi...) và thủ tục có sẵn (nhập/xuất). Người dùng chỉ có thể định nghĩa thủ tục riêng — đó là cách các chương trình lớn được dựng.

Một bước tiến lớn trong phát triển phần mềm là ý tưởng về **kiểu trừu tượng**: thiết kế ngôn ngữ lập trình để **cho phép người dùng định nghĩa kiểu riêng**. Ý tưởng này xuất phát từ công trình của nhiều nhà nghiên cứu, đáng chú ý nhất:

| Nhà nghiên cứu | Đóng góp |
|---|---|
| **Dahl** | Người phát minh ngôn ngữ Simula |
| **Hoare** | Phát triển nhiều kỹ thuật suy luận về kiểu trừu tượng |
| **Parnas** | Đặt thuật ngữ "information hiding" (ẩn thông tin); lần đầu diễn đạt ý tưởng tổ chức các mô-đun quanh bí mật chúng bọc kín |
| **Liskov và Guttag** (tại MIT) | Công trình then chốt về đặc tả kiểu trừu tượng và hỗ trợ của ngôn ngữ cho chúng (và phát triển 6.170!) |

### Ý tưởng cốt lõi

> **Một kiểu được đặc trưng hóa bởi các hoạt động bạn có thể làm trên nó.**

- Số là thứ bạn có thể **cộng và nhân**.
- Chuỗi là thứ bạn có thể **nối và lấy chuỗi con**.
- Boolean là thứ bạn có thể **phủ định**.

Trước đây người dùng vốn đã có thể định nghĩa kiểu riêng theo một nghĩa nào đó: tạo kiểu bản ghi `date` với các trường số nguyên cho ngày, tháng, năm. Nhưng điều làm nên kiểu trừu tượng mới mẻ là **sự tập trung vào hoạt động**: người dùng của kiểu không cần lo cách các giá trị đó thực sự được lưu, cũng như lập trình viên có thể bỏ qua cách trình biên dịch lưu số nguyên. **Chỉ có hoạt động là quan trọng.**

### Trong Java

Trong Java, ranh giới giữa kiểu có sẵn và kiểu người dùng hơi mờ:

- Lớp trong `java.lang` (như `String`, `Integer`) được coi là có sẵn — đặc biệt `String` vì có cú pháp literal riêng.
- Không rõ các bộ sưu tập `java.util` có phải có sẵn không (và điều đó cũng không quan trọng).
- Java phức tạp thêm bằng **kiểu nguyên thủy** (primitive) không phải đối tượng: tập `int`, `boolean`... **không thể mở rộng** bởi người dùng.

---

## 2. Đặc trưng hóa một kiểu bằng các hoạt động

Một kiểu, dù có sẵn hay do người dùng định nghĩa, được mô tả bằng **tập các hoạt động hợp lệ** trên nó, kèm đặc tả của từng hoạt động. Đây là cơ sở của **trừu tượng hóa dữ liệu**:

- Khách hàng (người dùng kiểu) chỉ biết **hoạt động**.
- Người hiện thực hóa chịu trách nhiệm khiến mọi hoạt động hoạt động đúng trên **biểu diễn** đã chọn.
- Thay biểu diễn mà **không đổi** bất kỳ hoạt động nào → khách hàng không bị ảnh hưởng.

---

## 3. Phân loại kiểu: bất biến và có thể thay đổi

| Kiểu | Định nghĩa | Ví dụ Java | Đặc điểm |
|---|---|---|---|
| **Có thể thay đổi** (mutable) | Đối tượng có thể bị đổi: có hoạt động khiến các hoạt động khác trên cùng đối tượng trả kết quả khác | `Vector` (`addElement` rồi `size` đổi) | Aliasing quan trọng; thay đổi cục bộ hiệu quả |
| **Bất biến** (immutable) | Hoạt động tạo đối tượng mới thay vì đổi đối tượng cũ | `String` (`toUpperCase` tạo chuỗi mới) | Dễ suy luận; chia sẻ không thể quan sát được |

Một kiểu đôi khi được cung cấp ở **hai dạng**: `StringBuffer` là phiên bản có thể thay đổi của `String` (dù hai kiểu Java này không phải một, không hoán đổi được cho nhau).

### Bất biến và có thể thay đổi: lợi ích và đánh đổi

| | Bất biến | Có thể thay đổi |
|---|---|---|
| Lý luận | Dễ hơn — **aliasing không phải vấn đề** vì chia sẻ không quan sát được | Phức tạp hơn |
| Hiệu năng | Đôi khi hiệu quả hơn vì **chia sẻ được nhiều hơn** | Hiệu quả khi cần thay đổi cục bộ cấu trúc lớn |
| Mô hình hóa | Không phải mọi vấn đề đều mô hình hóa tự nhiên | Nhiều vấn đề mô hình hóa tự nhiên hơn (giao dịch ngân hàng) |
| Khuyến nghị | **Nên thiên về bất biến** | Người mới dùng **quá nhiều** kiểu có thể thay đổi (và trả giá bằng sự phức tạp + hiệu năng kém) |

> Khi thiết kế một kiểu trừu tượng, thường **không rõ ngay** kiểu nên bất biến hay không. Hãy thiên về bất biến.

---

## 4. Phân loại hoạt động: creators, producers, mutators, observers

Các hoạt động của một kiểu trừu tượng được phân loại:

| Loại | Định nghĩa | Ví dụ |
|---|---|---|
| **Creators** | Tạo đối tượng mới của kiểu. Có thể nhận đối tượng làm đối số, nhưng **không** nhận đối tượng của chính kiểu đang tạo | `new Vector()` |
| **Producers** | Tạo đối tượng mới **từ** đối tượng cũ | `String.concat` — nhận hai chuỗi, trả chuỗi mới |
| **Mutators** | **Đổi** đối tượng | `Vector.addElement` — đổi vector |
| **Observers** | Nhận đối tượng của kiểu trừu tượng, trả đối tượng **của kiểu khác** | `Vector.size` — trả `int` |

### Hình dạng chữ ký (ký hiệu)

```
creator:   t    -> T
producer:  T, t -> T
mutator:   T, t -> void
observer:  T, t -> t
```

- `T` là chính kiểu trừu tượng; `t` là kiểu khác.
- Một `t` ở vế trái là lối viết tắt cho **zero hoặc nhiều** lần xuất hiện của các kiểu khác (có thể khác nhau).
- Một `T` ở vế trái là lối viết tắt cho **một hoặc nhiều** lần xuất hiện của kiểu trừu tượng.

### Ví dụ đối chiếu chữ ký

| Phương thức | Chữ ký | Hình dạng | Loại |
|---|---|---|---|
| `String.concat` | `String, String -> String` | `T, T -> T` | **producer** |
| `String.size` | `String -> int` | `T -> t` | **observer** |
| `List.add` | `List, int, Object -> void` | `T, t, t -> void` | **mutator** |
| `new List()` | `-> List` | `-> T` | **creator** |

**Nhớ:** khi xem xét một phương thức, phải kể cả **tham số receiver**. `concat` xuất hiện trong Java với chữ ký một đối số và một kết quả vì receiver là **ngầm định**.

### Hạn chế của phân loại

- Trong nhiều lớp sưu tập Java (`java.util`), mutators thường trả về tham chiếu tới đối tượng trừu tượng hoặc giá trị cũ bên trong nó, và do đó cũng có thể phân loại là producer/observer.
- Một số người dùng từ "producer" để ngụ ý **không có biến đổi nào xảy ra**.
- Thuật ngữ Java không khớp gọn: **constructor ≠ creator** — copy constructor không phải creator (nhận giá trị của kiểu trừu tượng), factory method là creator nhưng không phải constructor.
- **Lưu đục thuật ngữ về iteration:** một số ngôn ngữ (như CLU) có thủ tục đặc biệt trả phần tử từng cái một, giữ bộ đếm chương trình giữa các lời gọi. Trong Java, iterator là **đối tượng** cung cấp phương thức duyệt bộ sưu tập. Từ "generator" từng đồng nghĩa với producer, nhưng giáo trình dùng nó chỉ **phương thức trả về iterator**.

---

## 5. Ví dụ: kiểu List và trường đặc tả

### 5.1 Định nghĩa lớp

List trong Java giống mảng nhưng cho phép chèn/xóa. Giả sử nó đơn giản như một lớp:

```java
public class List {
    public List();
    public void add(int i, Object e);
    public void set(int i, Object e);
    public void remove(int i);
    public int size();
    public Object get(int i);
}
```

- `add`, `set`, `remove` là **mutators**.
- `size`, `get` là **observers**.
- Thường một kiểu có thể thay đổi **không có producer nào** (và kiểu bất biến chắc chắn **không thể có** mutator).

### 5.2 Trường đặc tả (specification fields)

Để đặc tả các phương thức, cần một cách nói về **một list trông như thế nào**. Dùng khái niệm **trường đặc tả** (specification field / abstract field):

> Bạn có thể **cứ nghĩ** đối tượng của kiểu như thể nó có các trường này, nhưng nhớ rằng chúng **không cần phải là trường trong hiện thực hóa**, và **không có yêu cầu** nào rằng giá trị của trường đặc tả có thể thu được bằng một phương thức.

Với list:

```
seq [Object] elems;
```

Với list `l`, biểu thức `l.elems` biểu diễn dãy các đối tượng lưu trong list, đánh chỉ số từ 0.

### 5.3 Đặc tả các phương thức

```java
public Object get(int i);
// throws
//   IndexOutOfBoundsException if i < 0 or i > length(this.elems)
// returns
//   this.elems[i]

public void add(int i, Object e);
// modifies this
// effects
//   throws
//     IndexOutOfBoundsException if i < 0 or i > length(this.elems)
//     NullPointerException if e is null
//   else this.elems = this_pre.elems[0..i-1] ^ <e> ^ this_pre.elems[i..]

public void set(int i, Object e);
// modifies this
// effects
//   throws
//     IndexOutOfBoundsException if i < 0 or i >= length(this.elems)
//     NullPointerException if e is null
//   else this.elems[i] = e and this.elems unchanged elsewhere
```

**Chú giải ký hiệu** trong hậu điều kiện của `add`:

| Ký hiệu | Nghĩa |
|---|---|
| `s[i..j]` | dãy con của `s` từ chỉ số `i` đến `j` |
| `s[i..]` | hậu tố của `s` kể từ `i` |
| `^` | toán tử **nối dãy** (concatenation) |
| `<e>` | dãy một phần tử `e` |
| `this_pre` | trạng thái **trước** khi thực hiện |

Nghĩa là, khi chỉ số nằm trong biên (hoặc vượt một đơn vị ở cuối), phần tử mới được **chèn vào** tại chỉ số cho.

Lưu ý sự khác biệt tinh tế: `add` cho phép `i == length` (chèn vào cuối) trong khi `set` thì không (`i >= length` là lỗi).

### 5.4 Giao diện và hiện thực hóa

```java
public interface List {
    void add(int i, Object e);
    void set(int i, Object e);
    void remove(int i);
    int size();
    Object get(int i);
}

public class LinkedList implements List {
    private Entry header;
    ...
}

public class ArrayList implements List {
    private Object[] eltData;
    ...
}
```

---

## 6. Thiết kế một kiểu trừu tượng

Thiết kế kiểu trừu tượng có **hai khía cạnh**:

| Khía cạnh | Nội dung | Đánh giá |
|---|---|---|
| **Spec** (đặc tả) | Chọn hoạt động và xác định cách chúng hành xử | **Gần như luôn là phần thách thức và quan trọng hơn**, vì khó thay đổi sau này hơn |
| **Impl** (hiện thực hóa) | Chọn biểu diễn | Tương đối dễ thay đổi — nếu có sự độc lập biểu diễn |

### 6.1 Quy tắc thực hành cho phần đặc tả

1. **Ít hoạt động đơn giản ghép lại mạnh mẽ** tốt hơn **nhiều hoạt động phức tạp**.
2. Mỗi hoạt động nên có **mục đích rõ ràng** và hành vi **nhất quán** (coherent), không phải một loạt trường hợp đặc biệt.
3. **Tập hoạt động phải đầy đủ (adequate)** — đủ để làm các phép tính khách hàng có lẽ muốn làm. Một bài kiểm tra tốt: mọi thuộc tính của đối tượng kiểu đó phải **trích xuất được**.
   - Nếu không có `get`, ta không biết phần tử của list là gì.
   - `size` **không strictly cần** (có thể `get` với chỉ số tăng dần), nhưng cách đó **không hiệu quả và bất tiện**.
4. Kiểu có thể **tổng quát** (list, tập, đồ thị) hoặc **chuyên miền** (bản đồ đường phố, cơ sở dữ liệu nhân viên, sổ điện thoại) — nhưng **không được trộn** hai loại tính năng.
5. Mặc dù chức năng là mối quan tâm đầu tiên, **hiệu năng cũng quan trọng**: chọn hoạt động đúng để khách hàng không phải làm việc rắc rối, và thiết kế chúng để **hiện thực hóa hiệu quả**.

### 6.2 Phản ví dụ: hoạt động không nhất quán

Giống tiêu chí "nhất quán" ở mục 9.2 tài liệu 02, một thủ tục làm hai việc không liên quan là thiết kế kém. Áp dụng cho ADT: mỗi hoạt động của list chỉ nên làm **một việc** (chèn **hoặc** thay thế **hoặc** xóa).

---

## 7. Chọn biểu diễn

Trong mã, lớp hiện thực hóa kiểu trừu tượng cung cấp một **biểu diễn** (representation): cấu trúc dữ liệu thật hỗ trợ các hoạt động. Biểu diễn là một tập hợp trường, mỗi trường có kiểu Java khác nhau; trong hiện thực hóa đệ quy, một trường có thể có chính kiểu trừu tượng — nhưng **hiếm khi** làm vậy trong Java.

### 7.1 Hai biểu diễn của list

**Biểu diễn danh sách liên kết** (giống nhưng không giống hệt `LinkedList` chuẩn):

```
List ──header──> Entry(dummy)
                   next ──> Entry ──next──> ...
                   prev <── Entry <──prev──
                   element --> đối tượng phần tử
```

- `List` có trường `header` tham chiếu một `Entry`.
- `Entry` là bản ghi 3 trường: `next`, `prev` (trỏ tới `Entry` khác hoặc null), `element`.
- Giả định: list không lưu tham chiếu null làm phần tử; luôn có một Entry **giả** (dummy) ở đầu, `element` là null nhưng không được coi là phần tử.
- Entry cuối trỏ về header — đó là vì sao `next`/`prev` được đánh dấu quan hệ một-một trong mô hình đối tượng.

**Biểu diễn mảng** (như `ArrayList` chuẩn): trường `eltData` là mảng các tham chiếu phần tử.

### 7.2 So sánh hai biểu diễn

| Tiêu chí | Danh sách liên kết | Mảng |
|---|---|---|
| Chèn/xóa ở **đầu** | **Tốt** — chỉ đổi vài con trỏ | Kém — phải dịch chuyển mọi phần tử lên; có thể phải cấp mảng mới và sao chép |
| `get`/`set` theo chỉ số | Kém — tìm tuần tự | **Tốt** — truy cập ngẫu nhiên, hằng số |
| Dễ hiện thực hóa | Kém hơn — nhiều đối tượng, nhiều bất biến | **Tốt hơn** — ít đối tượng, ít bất biến, dễ đúng hơn |
| Bất biến biểu diễn | Phức tạp hơn nhiều | Đơn giản hơn |

### 7.3 Câu hỏi then chốt

Khi viết mã dùng list, ta **không biết** thao tác nào sẽ chiếm ưu thế. Vậy:

> Làm sao đảm bảo **dễ thay đổi biểu diễn về sau**?

Đó chính là động cơ của **sự độc lập biểu diễn** (mục 8).

---

## 8. Sự độc lập biểu diễn

> **Sự độc lập biểu diễn** (representation independence) nghĩa là việc dùng một kiểu trừu tượng **không phụ thuộc vào biểu diễn của nó**, nên thay đổi biểu diễn **không ảnh hưởng mã bên ngoài** kiểu đó.

### 8.1 Chuyện gì sai khi thiếu sự độc lập — hack mảng

Giả sử ta biết list được hiện thực hóa bằng mảng. Ta cần dùng đoạn mã tạo dãy đối tượng, nhưng nó tạo `Vector` chứ không phải `List`. `List` không có producer chuyển đổi từ `Vector`. Nhưng `Vector` có `copyInto` sao chép phần tử vào mảng. Dựa vào kiến thức `List` dùng trường `elementData`, ta viết:

```java
List l = new List();
v.copyInto(l.elementData);       // "hack thông minh"
```

Giống nhiều hack, nó **chạy được một lúc**. Rồi người hiện thực hóa đổi sang danh sách liên kết → `l` không còn trường `elementData` → **biên dịch thất bại**.

**Thất bại biên dịch không phải thảm họa.** Thảm họa hơn nhiều là biên dịch **thành công** mà chương trình vẫn hỏng:

1. Kích thước mảng phải **lớn hơn** số phần tử ( nếu không phải cấp mảng mới mỗi lần thêm/bớt) → cần cách đánh dấu kết thúc đoạn chứa phần tử.
2. Giả sử người hiện thực hóa chọn quy ước: đoạn chạy đến tham chiếu null đầu tiên hoặc hết mảng. **Hack của ta hoạt động trong trường hợp này.**
3. Rồi người nhận ra đó là quyết định sai (tìm kích thước list đòi hỏi tìm tuần tự) → thêm trường `size` cập nhật khi mọi thao tác đổi list. Tốt hơn: tìm kích thước hằng số, và tự xử lý phần tử null.
4. Giờ hack "thông minh" sinh ra hành vi kỳ lạ: list tạo ra có trường `size` **sai** (luôn 0 vì ta chỉ sửa mảng), `get`/`set` thất bại, `size()` trả sai.

### 8.2 Hack thứ hai: trả về `Entry`

Giả sử dùng biểu diễn danh sách liên kết, có hoạt động trả `Entry` ứng với chỉ số:

```java
public Entry getEntry(int i)
```

Lý do: nếu nhiều lời gọi `set` cùng chỉ số, tiết kiệm tìm tuần tự. Thay vì:

```java
l.set(i, x);
...
l.set(i, y);
```

ta viết:

```java
Entry e = l.getEntry(i);
e.element = x;
...
e.element = y;
```

Điều này **vi phạm sự độc lập biểu diễn** — khi chuyển sang mảng, không còn đối tượng `Entry` nào. Nhưng còn vấn đề **tinh tế hơn**: gán `null` cho `element` của một entry. Đặc tả `add` **từ chối** chèn phần tử null; người hiện thực hóa có thể **dựa vào điều đó** để tìm header entry khi duyệt vòng tròn (kiểm tra `element` null). Gán này khiến entry không phải header có `element` null → mã **có khả năng hỏng**.

### 8.3 Trực quan hóa bằng MDD

```
   Client ─────────> List ────────> (phần hiện thực hóa)
       \               ^
        \              |
         +-----> Entry <-----(các liên kết nội bộ)
```

Nên chỉ có phụ thuộc của `Client` vào `List` (và vào kiểu phần tử, ở đây `Object`). **Phụ thuộc của `Client` vào `Entry` là nguồn gốc vấn đề.** Ta muốn `Entry` và các quan hệ của nó là **nội bộ** của `List` — chỉ ra bằng cách "đóng màu" phần không được phép truy cập (Entry và mọi cung vào/ra của nó) và thêm trường đặc tả `elems` che biểu diễn.

### 8.4 Tại sao độc lập biểu diễn quan trọng

- Cho phép **đổi biểu diễn mà không sửa mã khách hàng**.
- Biểu diễn là **chi tiết hiện thực hóa** — thuộc về người hiện thực hóa.
- Sự độc lập biểu diễn là điều kiện để suy luận mô-đun hoạt động (phần II).

---

## 9. Cơ chế ngôn ngữ hỗ trợ

### 9.1 Trường `private`

Chặn hack mảng:

```java
v.copyInto(l.elementData);   // bị biên dịch từ chối: truy cập trường private từ ngoài
```

### 9.2 Lộ biểu diễn không ngăn được bằng ngôn ngữ

Vấn đề `Entry` **không dễ giải quyết bằng `private`**. Ở đây không có truy cập trực tiếp — `List` **trả về** một `Entry` thuộc biểu diễn. Đây gọi là **lộ biểu diễn** (representation exposure) và **không thể ngăn chỉ bằng cơ chế ngôn ngữ**. Cần:

- Kiểm tra rằng tham chiếu tới các thành phần **có thể thay đổi** của biểu diễn **không bị truyền ra** cho khách hàng.
- Kiểm tra biểu diễn **không được dựng** từ các đối tượng có thể thay đổi bị truyền vào.

Ví dụ với biểu diễn mảng: **không được** có hàm khởi tạo nhận một mảng và gán thẳng vào trường nội bộ.

### 9.3 Giao diện (interface)

```java
List l = new LinkedList();
...
l.add(i, e);
```

- Giao diện chỉ khai báo **hoạt động**, không cho biểu diễn hay mã.
- Cả `ArrayList` và `LinkedList` đều `implements List`.
- **Khách hàng tham chiếu chỉ tới giao diện `List`** → các lớp chứa biểu diễn không truy cập được.
- Giao diện **không dùng để tạo đối tượng** (không có hàm khởi tạo) — tại điểm tạo ta phải chỉ rõ hiện thực hóa.
- Nhưng kết quả lời gọi hàm khởi tạo được khai báo là `List` chứ **không** phải `LinkedList` → tham chiếu `l.header` **bất hợp pháp**, kể cả khi trường đó public.

### 9.4 Phụ thuộc vào hàm khởi tạo và Factory

Phụ thuộc vào các lớp cụ thể do lời gọi hàm khởi tạo được **cố địa phương hóa**尽可能, nhưng đôi khi muốn giảm thêm. **Mẫu Factory** (tài liệu 07) giải quyết chính vấn đề này.

---

# Phần II — Bất biến biểu diễn (Bài 8)

> **Bạn sẽ học:** cách tìm bất biến biểu diễn và tránh lộ biểu diễn.
> **Vì sao cần học:** hiểu lý thuyết về kiểu trừu tượng giúp bạn tránh **cả một họ lỗi** tinh vi, khó phát hiện — hoặc tối thiểu là cảnh báo về sự tồn tại của chúng.

Hai công cụ hiểu ADT:

| Công cụ | Câu hỏi trả lời |
|---|---|
| **Bất biến biểu diễn** (rep invariant — RI) | Một instance của kiểu có **lành lặn** (well-formed) không? |
| **Hàm trừu tượng hóa** (abstraction function — AF) | **Diễn giải** instance đó như thế nào? |

## 10. Hai không gian: rep và abstract

Khi nghĩ về một kiểu trừu tượng, hữu ích cân nhắc mối quan hệ giữa **hai không gian giá trị**:

| Không gian | Bản chất | Ví dụ |
|---|---|---|
| **Rep** (biểu diễn) | Giá trị của các thực thể hiện thực hóa thật. Thường là **mạng nhỏ các đối tượng** — khá phức tạp | Mảng `Object[]`, chuỗi `StringBuffer`, cây nút |
| **Abstract** (trừu tượng) | Các giá trị mà kiểu được thiết kế để hỗ trợ — **hình dung của chúng ta**, thực thể Platon không tồn tại như mô tả | Tập ký tự, số nguyên vô hạn, dãy |

Ví dụ: kiểu trừu tượng cho số nguyên vô hạn có thể có không gian số nguyên toán học làm không gian giá trị trừu tượng; việc nó có thể được hiện thực hóa bằng mảng số nguyên (bị chặn) **không liên quan** tới người dùng kiểu. Nhưng **người hiện thực hóa** phải quan tâm giá trị rep — vì nhiệm vụ của họ là **tạo ra ảo ảnh** về không gian trừu tượng bằng không gian rep.

### 10.1 Ví dụ CharSet

Đặc tả:

```
CharSet represents a set of characters

class CharSet
spec (set char) cs;

CharSet()
    returns new result such that no result.cs

void add(char ch)
    modifies this.cs
    effects cs = \old(cs) + ch

void remove(char ch)
    modifies this.cs
    effects cs = \old(cs) - ch

boolean member(char ch)
    returns ch in cs
```

**Hiện thực hóa 1:**

```java
public class CharSet {
    private StringBuffer s;
    public CharSet() { s = new StringBuffer(); }
    public void add(char ch) {
        if (!member(ch)) s.append(ch);       // CHỐNG trùng lặp
    }
    public void remove(char ch) {
        int index = s.indexOf(String.valueOf(ch));
        if (index >= 0) { s.deleteCharAt(index); }   // dừng ở phần tử đầu
    }
    public boolean member(char ch) {
        return s.indexOf(String.valueOf(ch)) != -1;
    }
}
```

**Hiện thực hóa 2** (khác chỉ hai hàm `add`/`remove`):

```java
public void add(char ch) { s.append(ch); }    // KHÔNG chống trùng lặp
public void remove(char ch) {
    int index = s.indexOf(String.valueOf(ch));
    while (index >= 0) {                      // xóa MỌI lần xuất hiện
        s.deleteCharAt(index);
        index = s.indexOf(String.valueOf(ch));
    }
}
```

### 10.2 So sánh hai không gian qua sơ đồ

```
Hiện thực hóa 1                      Hiện thực hóa 2
  R        A                           R        A
 s=""     {}                          s=""     {}
 s="abc"  {a,b,c}                     s="abc"  {a,b,c}
 s="cba"  {a,b,c}                     s="cba"  {a,b,c}
 s="cbba"  (không được map)           s="cbba" {a,b,c}   <-- bản sao được cho phép
```

Ba điều cần chú ý:

1. **Mọi giá trị trừu tượng đều bị ánh xạ tới** — purpose của việc hiện thực hóa là hỗ trợ thao tác trên giá trị trừu tượng, nên phải tạo và thao tác được mọi giá trị trừu tượng quan tâm.
2. **Một số giá trị trừu tượng bị ánh xạ từ nhiều giá trị rep** — vì biểu diễn không phải mã hóa chặt. Có nhiều cách biểu diễn tập ký tự không thứ tự dưới dạng chuỗi.
3. **Không mọi giá trị rep đều được ánh xạ** — `"cbba"` không được map ở hiện thực hóa 1.
   - Nếu kiểu trường rep không tầm thường, **sẽ vô nghĩa** khi cho diễn giải mọi giá trị rep (danh sách liên kết hai chiều có thể vặn thành各种 hình dạng không tương ứng dãy đơn giản).
   - Đôi khi ta **chủ động đặt tính chất** lên rep để mã hiệu quả/dễ hơn: hiện thực hóa 1 quyết định `s` **không chứa trùng lặp** → `remove` có thể **dừng ở lần gặp đầu tiên** (biết mỗi ký tự tối đa một lần). Tối ưu này không khả thi ở hiện thực hóa 2.

---

## 11. Bất biến biểu diễn và hàm trừu tượng hóa

Vì đồ thị là vô hạn, ta mô tả nó bằng **hai thứ**:

### Hàm trừu tượng hóa (AF)

```
AF: R -> A
```

Các cung trong sơ đồ trên biểu thị hàm trừu tượng hóa. Theo thuật ngữ hàm số, ba tính chất ở trên nói rằng hàm này là:

| Tính chất | Ý nghĩa |
|---|---|
| **Onto** (surjective) | Mọi giá trị trừu tượng đều có ít nhất một biểu diễn |
| **Không nhất thiết one-to-one** | Nhiều rep có thể ánh xạ cùng một giá trị trừu tượng |
| **Thường là partial** | Không mọi rep đều được ánh xạ |

### Bất biến biểu diễn (RI)

```
RI: R -> boolean
```

Với giá trị rep `r`, `RI(r)` đúng **khi và chỉ khi** `r` bị `AF` ánh xạ. Nói cách khác: RI cho biết giá trị rep đó có **lành lặn** không. Hoặc nghĩ RI như một **tập con** các giá trị rep mà `AF` được định nghĩa trên đó.

### RI của hai hiện thực hóa CharSet

```java
// Hiện thực hóa 1
RI(r) = r.s != null &&
        r.s contains no duplicates

// Hiện thực hóa 2
RI(r) = r.s != null
```

RI có thể viết với nhiều mức (không) hình thức khác nhau: `r.s contains no duplicates` có thể viết thành `i!=j => r.s[i]!=r.s[j]`, nhưng **rõ hơn khi để nguyên** dạng văn bản.

> RI hoạt động như một **quy ước sử dụng không gian rep**. Một khi quyết định không cho trùng lặp, ta có thể viết `add` và `remove` **độc lập với nhau hơn**.

### 11.1 Ví dụ: cây nhị phân

Mô hình đối tượng (đối tượng nút `BTree` chứa `root` tham chiếu `BTreeNode`; mỗi nút có `element`, `left`, `right`, `parent`; quan hệ `left`/`right` `{0,1,2}`):

```
BTree ──root──> BTreeNode
                   element
                   left? ──> BTreeNode
                   right? ──> BTreeNode
                   parent ──> BTreeNode | null
```

RI đệ quy:

```
RI(tree) = (tree.root != null) =>
           (tree.root.parent = null && RI(tree, tree.root))

RI(tree, node) = ((node.left != null) => (node.left != node.right)) &&
                 ((node.left != null) =>
                    (node.left.parent = node && RI(tree, node.left))) &&
                 ((node.right != null) =>
                    (node.right.parent = node && RI(tree, node.right)))
```

Điều này đảm bảo các trường `parent`, `left`, `right` **nhất quán trên toàn cây**. Viết theo cách này, dễ hình dung việc **chuyển RI thành mã kiểm tra**.

Cách khác (không cần đệ quy), với ký hiệu tập hợp:

```
RI(tree) = all n: tree.root.*(left+right) | tree.root in n.*parent
// ... các điều kiện khác, chưa đầy đủ ...
```

Giới hạn tương tự ví dụ hệ thống tệp ở bài trước: mọi nút phải truy về được root qua trường `parent`.

---

## 12. Bất biến biểu diễn cho suy luận mô-đun

RI làm cho **suy luận mô-đun trở nên khả thi**. Để kiểm tra một hoạt động có được hiện thực hóa nhất quán với RI hay không, ta **không cần nhìn hoạt động nào khác**. Thay vào đó, ta mượn **nguyên lý quy nạp**:

1. **Mọi hàm khởi tạo** tạo đối tượng **thỏa** bất biến.
2. **Mọi mutator và producer** **giữ** bất biến: từ đối tượng thỏa, tạo ra đối tượng cũng thỏa.
3. Biểu diễn **không bao giờ bị lộ**.

→ **Mọi** đối tượng của kiểu thỏa bất biến, vì nó phải được tạo bởi một hàm khởi tạo và một chuỗi các lần áp mutator/producer.

### 12.1 Kiểm tra RI tại runtime

RI thường **chuyển được thành mã** và dùng để kiểm tra định kỳ đối tượng có ở trạng thái hợp lệ không:

| Trạng thái | Nghĩa |
|---|---|
| RI **sai** | Chắc chắn có gì đó đã sai — đối tượng **không thể** biểu diễn giá trị trừu tượng nào |
| RI **đúng** | Đối tượng **có** biểu diễn một giá trị trừu tượng (nhưng **không nhất thiết đúng** — đây không phải thuốc tiên chữa mọi lỗi) |

**Thực hiện:**

1. Tạo một phương thức `checkRep()` kiểm tra RI giữ (và **dừng ngay** nếu không).
2. Gọi `checkRep()` ở **cuối mỗi hàm khởi tạo** — xác nhận RI đúng khi đối tượng được tạo.
3. Gọi `checkRep()` ở **đầu và cuối mỗi công khai**: mutator, producer, **và cả observer** (chúng có thể sửa rep qua hiệu ứng phụ "thiện chí", và dù sao, bạn có thật sự tin chúng không?).

### 12.2 Phát biểu quy nạp cấu trúc

> Nếu một bất biến của ADT được (1) **thiết lập** bởi các creator; (2) **giữ** bởi producer, mutator và observer; và (3) biểu diễn của kiểu **không bao giờ bị lộ**, thì bất biến đó **đúng với mọi instance** của ADT.

Lưu ý điều kiện (3) — đó chính là **lộ biểu diễn**. Xem mục 14.

---

## 13. Lộ biểu diễn (representation exposure)

### 13.1 Vì sao nó nguy hiểm

Phương pháp RI đề xuất **không phải lúc nào cũng hợp lệ** — nó có điều kiện: biểu diễn **không được bị lộ**. Lộ biểu diễn là vấn đề xấu xí vì nó có thể **xảy ra bất ngờ** và gây hậu quả **khó quy được về**.

Dạng đơn giản nhất — cho phép mã khách hàng thao tác trực tiếp biểu diễn — bị loại bằng trường `private`, nên thường không coi là lộ. Dễ bị bỏ sót là:

| Dạng | Cách xảy ra |
|---|---|
| **Vào** (in) | Tham chiếu tới đối tượng có thể thay đổi bị **truyền vào** và trở thành một phần của biểu diễn, dù vẫn truy cập được từ bên ngoài qua đường khác |
| **Ra** (out) | Tham chiếu tới đối tượng có thể thay đổi **nằm trong** biểu diễn bị **trả về** như kết quả của một hoạt động |

### 13.2 Ví dụ `Interval` — lộ khi truyền vào

```java
public class Interval {
    private final Date start, stop;
    private final long duration;
    public Interval(Date start, Date stop) {
        this.start = start;
        this.stop = stop;
        duration = stop.getTime() - start.getTime();
    }
    public Date getStart() { return start; }
    public Date getStop() { return stop; }
    public long getDuration() { return duration; }
}
```

RI phải nắm bắt nhu cầu **nhất quán** giữa `duration`, `start`, `stop`. Nhưng hiện thực này **rò rỉ như một cái rổ** vì `Date` của Java **có thể thay đổi** — khách hàng dễ dàng có tham chiếu tới các `Date` nằm trong `start`/`stop`, và tự do đổi chúng **không cập nhật `duration`**.

**Sửa — bản sao phòng thủ (defensive copy):**

```java
public class Interval {
    private final Date start, stop;
    private final long duration;
    public Interval(Date start, Date stop) {
        this.start = new Date(start.getTime());   // sao chép khi nhận vào
        this.stop  = new Date(stop.getTime());
        duration = stop.getTime() - start.getTime();
    }
    public Date getStart() { return new Date(start.getTime()); }  // sao chép khi trả ra
    public Date getStop()  { return new Date(stop.getTime()); }
    public long getDuration() { return duration; }
}
```

Dùng copy constructor, `clone`, hoặc bất cứ thứ gì sẵn có.

### 13.3 Ví dụ `toArray()` — lộ khi trả ra

Một lớp `VeryExclusiveList` chỉ nhận đối tượng `HighSociety`, hiện thực hóa bằng mảng, "cám dỗ" trả thẳng mảng trong `toArray()`:

```java
List posh = new VeryExclusiveList();
posh.add(new HighSociety("Lord Vandersnoot"));
posh.add(new HighSociety("Lady Bassington-Bassington"));

Object[] whosWho = posh.toArray();
whosWho[0] = new Ruffian();    // ouch! ai để cửa mở thế...
```

Khách hàng **chèn đối tượng trái phép** vào danh sách độc quyền — phá vỡ bất biến của kiểu.

### 13.4 Ví dụ iterator — dạng tinh tế hơn

Nhiều lớp Java có phương thức trả iterator. Thường **thiết kế tốt** là trả iterator thay vì cả bộ sưu tập (tiết kiệm chi phí bản sao phòng thủ). Nhưng viết iterator tốn công, nên "cám dỗ" dùng iterator sẵn có:

```java
private ArrayList list;          // biểu diễn

public Iterator elements() {
    return list.iterator();      // dường như vô hại
}
```

Nhưng đây cũng là **lộ biểu diễn**! Giao diện `Iterator` của Java bao gồm thao tác `remove` **tùy chọn** cho phép khách hàng xóa phần tử khỏi bộ sưu tập nền. `ArrayList` hiện thực hóa nó → kết quả là đối tượng iterator **có thể thực sự ảnh hưởng** tới danh sách, **ngoài** kiểu trừu tượng.

**Sửa:**

```java
public Iterator elements() {
    return Collections.unmodifiableList(list).iterator();
}
```

`unmodifiableList` tạo một **wrapper** quanh danh sách, **cấm mọi biến đổi** qua wrapper đó.

### 13.5 Bảng tổng hợp chống lộ biểu diễn

| Khe hở | Dấu hiệu | Cách bịt |
|---|---|---|
| Truyền vào的对象 có thể thay đổi | Gán đối số vào trường | **Bản sao phòng thủ** khi nhận |
| Trả ra đối tượng có thể thay đổi | `return` trường nội bộ | **Bản sao phòng thủ** khi trả |
| Trả collection nền | `return this.list` | Trả bản sao / wrapper bất biến |
| Trả iterator nền | `return list.iterator()` | `Collections.unmodifiableList(...).iterator()` |
| Trả Entry/nút nội bộ | `return getEntry(i)` | Trả giá trị, không trả nút |

### 13.6 Tổng kết phần II — vì sao dùng RI

Ghi lại bất biến thực sự **tiết kiệm công sức**:

1. **Làm suy luận mô-đun khả thi** — không có RI được ghi, bạn có thể phải đọc **tất cả** phương thức để hiểu chuyện gì đang xảy ra trước khi tự tin thêm phương thức mới.
2. **Giúp bắt lỗi** — bằng cách hiện thực hóa bất biến thành assertion runtime, bạn tìm được lỗi khó truy tìm bằng cách khác.

---

# Phần III — Hàm trừu tượng hóa (Bài 9)

> Hàm trừu tượng hóa chỉ định cách **biểu diễn** của ADT được **diễn giải** thành giá trị trừu tượng. Cùng với bất biến biểu diễn, nó cho phép suy luận **theo mô-đun** về tính đúng đắn của một hoạt động.

## 14. Đối tượng trừu tượng và đối tượng cụ thể

Hãy tưởng tượng đối tượng trong **hai realm** (vùng):

| Realm | Bản chất |
|---|---|
| **Cụ thể** (concrete) | Các đối tượng thật của hiện thực hóa |
| **Trừu tượng** (abstract) | Các đối tượng toán học khớp với cách đặc tả mô tả giá trị |

### Ví dụ `SeasonSet`

Một chương trình đăng ký khóa học cần chỉ ra khóa học được cung cấp trong những quý nào (F, W, S, U). Kiểu `SeasonSet` có giá trị là **tập hợp các mùa**.

Cách lười biếng: dùng `java.util.ArrayList`, hầu hết phương thức là wrapper đơn giản:

```
Realm trừu tượng:    {F,W,S}        {F,W}
                        ^              ^
                        |   AF (A)     |
Realm cụ thể:  [F,W,S] [W,F,S] [W,W,F,S] [W,F]
```

- `[F,W,S]` — đối tượng cụ thể chứa ArrayList phần tử F, W, S.
- `{F,W,S}` — tập hợp trừu tượng 3 phần tử.
- **Nhiều biểu diễn cùng một tập**: `{F,W,S}` cũng có thể là `[W,F,S]` (thứ tự không quan trọng) hoặc `[W,W,F,S]` (nếu RI cho phép trùng).

Mối quan hệ giữa hai realm là **một hàm** vì mỗi đối tượng cụ thể được diễn giải thành **tối đa một** giá trị trừu tượng. Hàm có thể **bán phần** — các đối tượng cụ thể vi phạm RI không có diễn giải. Hàm đó chính là **hàm trừu tượng hóa**.

### 14.1 Hai hiện thực hóa với AF khác nhau

**Biểu diễn ArrayList:**

```
A(s) = { s.eltlist.elts[i] | 0 <= i <= size(s.eltlist) }
```

Tập gồm mọi phần tử của danh sách.

**Biểu diễn mảng 4 boolean** (thứ tự F, W, S, U):

```
[true, false, true, false]  ->  {F, S}

A(s) = (if s.boolarr[0] then {F} else {}) U
       (if s.boolarr[1] then {W} else {}) U
       (if s.boolarr[2] then {S} else {}) U
       (if s.boolarr[3] then {U} else {})
```

Hoàn toàn có thể chọn **thứ tự mùa khác**:

```
A(s) = (if s.boolarr[0] then {S} else {}) U
       (if s.boolarr[1] then {U} else {}) U
       (if s.boolarr[2] then {F} else {}) U
       (if s.boolarr[3] then {W} else {})
```

> **Bài học quan trọng:** "chọn biểu diễn" có nghĩa **hơn là** đặt tên vài trường và chọn kiểu của chúng. **Cùng một mảng boolean** có thể được diễn giải theo nhiều cách; **hàm trừu tượng hóa nói cách nào**.

Tương tự, với danh sách liên kết ở Bài 7, AF nói thứ tự các entry tương ứng thế nào với thứ tự phần tử. **Lỗi phổ biến của người mới** là tưởng AF **hiển nhiên** — vì luôn có thể đoán từ khai báo trong mã. Thực tế thường **không phải vậy**: phải **đọc kỹ mã** danh sách liên kết mới phát hiện entry đầu là entry giả.

## 15. Một hàm trừu tượng hóa tinh tế

Có thể bạn nghĩ AF chỉ nói điều hiển nhiên — nhìn rep là đoán được cách diễn giải. **Phần lớn thời gian đúng**, và vì thế AF **ít quan trọng hơn RI** (giả định có con người diễn giải rep; nếu muốn xây công cụ phân tích mã tự động, bạn **cần** cung cấp AF).

Nhưng đôi khi biểu diễn **thông minh** có diễn giải **không hề hiển nhiên** — khi đó AF là tài liệu rất hữu ích.

### 15.1 Vấn đề: hàng đợi bất biến

Muốn xây kiểu `Queue` mà đối tượng là **bất biến**. Không hiển nhiên cách hiện thực hóa hiệu quả:

- Biết cách làm `List` bất biến: `cons` tạo danh sách mới với đuôi là danh sách cũ; `car`/`cdr` làm ngược lại.
- Vấn đề: hàng đợi **thêm một đầu, lấy đầu kia** — về cơ bản đó là **ngăn xếp** (stack).

### 15.2 Giải pháp: cặp danh sách bất biến

Ý tưởng nổi trong cộng đồng lập trình hàm:

```java
class ImmutableQueue {
    ImmutableList back;
    ImmutableList front;
    ...
}
```

Hàng đợi bị **đứt làm hai**:

- Phần tử ở **đầu hàng đợi** nằm trong `front` theo thứ tự tự nhiên.
- Phần tử ở **cuối hàng đợi** nằm trong `back` theo thứ tự **ngược**.

Đó chính là mô tả hàm trừu tượng hóa:

```
A(q) = A(q.front) ^ rev(A(q.back))
```

(AF trên danh sách; giả định danh sách biểu diễn dãy toán học; `rev` đảo dãy; `^` nối; phần tử đầu tiên bị lấy ra nằm **đầu** dãy kết quả.)

### 15.3 Thao tác trên biểu diễn

| Thao tác | Cách làm |
|---|---|
| **Enqueue** | `cons` phần tử vào danh sách `back` |
| **Dequeue** | Lấy phần tử đầu `front` bằng `car`, phần còn lại bằng `cdr` |

Ví dụ minh họa:

| Trạng thái | `back` | `front` | Hàng đợi trừu tượng |
|---|---|---|---|
| Ban đầu | `(đầu tiên)` | `(đầu tiên)` | `()` |
| Enqueue A, B, C | `CBA` | `(đầu tiên)` | `ABC` |
| Dequeue (đảo `back`→`front`) | `(đầu tiên)` | `ABC` → lấy `A` | `BC` |
| Enqueue D, E | `ED` | `BC` | `BCDE` |

Sau bước dequeue: đảo `back` (`CBA` → `ABC`) làm `front`, `back` thành rỗng, dequeue `A` bằng `car`. Rồi enqueue D, E → `back = ED`, `front = BC`. AF diễn giải cấu trúc cụ thể này thành hàng đợi `BCDE`.

### 15.4 Phân tích chi phí trung bình (amortized analysis)

Đảo danh sách mất thời gian **tỷ lệ với độ dài**. Nếu nhiều enqueue liên tiếp mà không dequeue, một dequeue **đơn lẻ** có thể mất thời gian.

Nhưng: **mỗi phần tử chỉ tham gia đúng một lần đảo**. Tổng chi phí các lần đảo theo vòng đời hàng đợi tỷ lệ với **số phần tử được dequeue**. → Chi phí **mỗi** hoạt động, **trung bình trên mọi hoạt động**, là **hằng số**.

Đây gọi là **phân tích trung bình** (amortized analysis): chi phí một hoạt động đơn lẻ được "chia đều" (amortized) trên tất cả hoạt động.

| Hoạt động | Chi phí cực đại | Chi phí trung bình |
|---|---|---|
| Dequeue sau nhiều enqueue | O(n) (đảo dãy) | O(1) |

---

## 16. Trường đặc tả (specification fields)

### 16.1 Động cơ

Giá trị trừu tượng của nhiều ADT có cấu trúc **tuple ở cấp trên**:

- Đường thẳng là một **cặp** điểm.
- Địa chỉ bưu kiện là số, đường, thành phố, mã bưu chính.
- URL là giao thức, tên máy chủ, tên tài nguyên.

Ta có thể chỉ định **một** hàm duy nhất ánh xạ đối tượng biểu diễn sang tuple (cách giáo trình làm). Nhưng tiện hơn và tự nhiên hơn là **phân rã hàm thành nhiều hàm con**, mỗi hàm coi như định nghĩa một **trường đặc tả**.

### 16.2 Ví dụ `Card`

Đại diện `Card` bằng một số nguyên duy nhất trong trường `index`. RI yêu cầu `index ∈ [0, 51]`. Hai trường đặc tả:

```
c.suit = S(c.index div 13)
c.val  = V(c.index mod 13)

where
  S(0) = Hearts,   S(1) = Spades,
  S(2) = Clubs,    S(3) = Diamonds
  V(1) = Ace, V(2) = 2, ..., V(11) = Jack,
  V(12) = Queen,   V(0) = King
```

- `index = 3` → Ba tép (Three of Hearts).
- `index = 14` → Át bích (Ace of Spades).

AF ánh xạ mỗi đối tượng biểu diễn `c` sang cặp `(c.suit, c.val)`, nhưng thay vì viết một hàm, ta chỉ định **hai hàm riêng**, mỗi hàm cho một trường đặc tả.

### 16.3 Dùng kể cả khi chỉ có một trường

Khi nói phần tử thứ `i` của vector `v` là `v.elts[i]`, ta dùng **trường đặc tả `elts`** có giá trị là dãy toán học. Nó cho phép nói về phần tử của vector **không nhắc biểu diễn**. Không có nó, ta phải viết `A(v)` để phân biệt giá trị trừu tượng của vector — với tham chiếu đối tượng Java `v` chính nó.

### 16.4 Hàng đợi bất biến viết lại bằng trường đặc tả

```
q.elts = q.front.elts ^ rev(q.back.elts)
```

Lưu ý có **hai trường `elts` khác nhau**: vế trái là AF của hàng đợi; hai lần xuất hiện ở vế phải là AF của **danh sách**.

Dưới dạng ghi chú trong lớp `Queue` (bỏ `this` theo quy ước):

```
abstraction function
elts: sequence of elements in queue,
      in order from first to last out
elts = front.elts ^ rev(back.elts)
```

---

## 17. Hiệu ứng phụ thiện chí (benevolent side effects)

### 17.1 Observer là gì — định nghĩa mở rộng

Trong bài giới thiệu, observer là hoạt động **không mutate** đối tượng. Giờ có thể đưa định nghĩa **rộng hơn**:

> Một hoạt động **có thể mutate** đối tượng của kiểu (các trường biểu diễn đổi) trong khi **giữ nguyên** giá trị trừu tượng mà nó biểu diễn.

```
    r1  ───op───>  r2
     \             /
      \     A     /
       \   |     /
            a
```

Thực hiện `op` đổi biểu diễn đối tượng từ `r1` sang `r2`. Nhưng `r1` và `r2` được `A` ánh xạ tới **cùng một** giá trị trừu tượng `a` → khách hàng **không quan sát được** thay đổi nào.

### 17.2 Vì sao muốn mutate như vậy?

Gần như luôn vì **cải thiện hiệu năng**.

Ví dụ: khách hàng kiểu bảng hay tra cùng khóa nhiều lần → **cache** khóa và giá trị làm gợi ý khi `get` chạy. Ở lần `get` sau, kiểm tra ngay xem có phải khóa vừa tra; nếu có, trả giá trị không cần tra đầy đủ.

Điểm mấu chốt: khách hàng **không thấy** giá trị vừa lấy đã được cache (trừ khi nhận ra hiệu năng tốt hơn); thứ họ quan tâm là `get` vẫn là observer theo nghĩa: **một `get` không ảnh hưởng kết quả của `get` sau**.

### 17.3 Điều kiện

- **Giữ RI không bị phá** — nếu đã hiện thực RI thành `checkRep`, hãy chèn `checkRep` ở **đầu và cuối** của observer.
- Abstract value phải được bảo toàn.

---

## 18. Tóm tắt và bài tập

### Tóm tắt ba bài

| Bài | Công cụ/Ý tưởng | Câu hỏi trả lời |
|---|---|---|
| 7 | Đặc trưng hóa bằng hoạt động; độc lập biểu diễn | Kiểu **là gì** xét với khách hàng? |
| 8 | Bất biến biểu diễn (RI) | Instance có **lành lặn** không? |
| 9 | Hàm trừu tượng hóa (AF); trường đặc tả | Diễn giải instance **như thế nào**? |

- Kiểu trừu tượng được đặc trưng bằng **hoạt động**; người dùng không cần biết biểu diễn.
- **Độc lập biểu diễn** cho phép đổi biểu diễn không ảnh hưởng khách hàng; `private` + giao diện giúp, nhưng **lộ biểu diễn** đòi hỏi kỷ luật lập trình viên.
- **RI**: `R -> boolean`; suy luận mô-đun bằng quy nạp (creator thiết lập, mutator/producer giữ, không lộ); kiểm tra runtime bằng `checkRep()`.
- **AF**: `R -> A`; onto, không nhất thiết one-to-one, thường partial.
- **Bản sao phòng thủ** ở cả chiều vào và chiều ra; wrapper bất biến cho iterator.
- **AF có thể không hiển nhiên** — biểu diễn thông minh (hàng đợi 2 danh sách) bắt buộc phải ghi AF; phân tích trung bình giải thích tại sao hàng đợi bất biến vẫn hiệu quả.
- **Observer được phép mutate** rep nếu giữ nguyên giá trị trừu tượng (hiệu ứng phụ thiện chí).
- **RI nên viết luôn**; **AF thường nên viết** (đặc biệt khi khó), dùng xét đoán khi miền trừu tượng khó mô tả.

### Bảng thuật ngữ

| Tiếng Anh | Tiếng Việt |
|---|---|
| abstract data type (ADT) | kiểu dữ liệu trừu tượng |
| representation (rep) | biểu diễn |
| representation invariant (RI) | bất biến biểu diễn |
| abstraction function (AF) | hàm trừu tượng hóa |
| specification field | trường đặc tả |
| representation exposure / exposure | lộ biểu diễn |
| representation independence | sự độc lập biểu diễn |
| mutable / immutable | có thể thay đổi / bất biến |
| creator / producer / mutator / observer | người tạo / nhà sản xuất / người thay đổi / người quan sát |
| defensive copy | bản sao phòng thủ |
| modular reasoning | suy luận mô-đun |
| well-formed | lành lặn |
| amortized analysis | phân tích trung bình |
| benevolent side effect | hiệu ứng phụ thiện chí |
| dummy (header) entry | nút giả (đầu danh sách) |
| onto / one-to-one / partial | tất nhiên / một-một / bán phần |

### Bài tập suy nghĩ

1. Với `CharSet`, tại sao RI của hiện thực hóa 1 "mạnh hơn" lại cho phép `remove` đơn giản hơn? Đây có phải đánh đổi điển hình không?
2. Viết RI cho một ngăn xếp (stack) biểu diễn bằng mảng `Object[]` + trường `top`.
3. Viết AF cho ngăn xếp đó (giả định `top` = số phần tử).
4. Lộ biểu diễn qua **chiều vào** khác chiều ra như thế nào? Cho thêm một ví dụ ngoài `Interval`.
5. Hàng đợi 2 danh sách: chứng minh chi phí trung bình của enqueue là hằng số.
6. Vì sao `Collections.unmodifiableList(...).iterator()` vẫn cho phép duyệt nhưng vô hại? Iterator trả về có phải là bản sao không?

---

*Nguồn: MIT 6.170 Lecture 7 (Introduction to ADTs), Lecture 8 (Representation Invariants), Lecture 9 (Abstraction Functions), Fall 2005.*
