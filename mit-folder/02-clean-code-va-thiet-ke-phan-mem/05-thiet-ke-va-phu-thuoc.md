# Thiết kế và phụ thuộc — Sơ đồ phụ thuộc mô-đun, Kiểu con, Lớp và giao diện

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering*, Fall 2005 — ba bài:

- **Bài 10: Module Dependence Diagrams** (sơ đồ phụ thuộc mô-đun, coupling, các cơ chế giải phóng phụ thuộc)
- **Bài 14: Subtypes and Subclasses** (kiểu con và lớp con, nguyên tắc thay thế)
- **Bài 15: Classes and Interfaces** (hướng dẫn thiết kế lớp/giao diện — theo *Effective Java* của Joshua Bloch, Ch. 4)

Đọc kèm: *Program Development in Java* — Barbara Liskov, Ch. 7; *Effective Java* — Joshua Bloch, Ch. 4.

---

## Mục lục

**Phần I — Phụ thuộc mô-đun (Bài 10)**

1. [Vấn đề trung tâm: phân rã chương trình](#1-vấn-đề-trung-tâm-phân-rã-chương-trình)
2. [Sơ đồ phụ thuộc mô-đun (MDD)](#2-sơ-đồ-phụ-thuộc-mô-đun-mdd)
3. [MDD của một trình duyệt web](#3-mdd-của-một-trình-duyệt-web)
4. [Bài toán: instrumenting chương trình](#4-bài-toán-instrumenting-chương-trình)
5. [Cơ chế 1: Trừu tượng hóa bằng tham số hóa](#5-cơ-chế-1-trừu-tượng-hóa-bằng-tham-số-hóa)
6. [Cơ chế 2: Giải phóng phụ thuộc bằng giao diện](#6-cơ-chế-2-giải-phóng-phụ-thuộc-bằng-giao-diện)
7. [Cơ chế 3: Trường static và Singleton](#7-cơ-chế-3-trường-static-và-singleton)

**Phần II — Kiểu con và lớp con (Bài 14)**

8. [Kiểu con (subtypes)](#8-kiểu-con-subtypes)
9. [Ví dụ: xe đạp](#9-ví-dụ-xe-đạp)
10. [Nguyên tắc thay thế (substitution principle)](#10-nguyên-tắc-thay-để-substitution-principle)
11. [Kiểu con của Java — weaker notion](#11-kiểu-con-của-java--weaker-notion)
12. [Ví dụ kinh điển: hình vuông và hình chữ nhật](#12-ví-dụ-kinh-điển-hình-vuông-và-hình-chữ-nhật)
13. [Lợi ích và đánh đổi của kế thừa](#13-lợi-ích-và-đánh-đổi-của-kế-thừa)

**Phần III — Lớp và giao diện (Bài 15)**

14. [Truy cập (accessibility) và ẩn thông tin](#14-truy-cập-accessibility-và-ẩn-thông-tin)
15. [Nguy hiểm của kế thừa (dangers of inheritance)](#15-nguy-hiểm-của-kế-thừa-dangers-of-inheritance)
16. [Composition và forwarding (wrapper)](#16-composition-và-forwarding-wrapper)
17. [Kế thừa hay composition?](#17-kế-thừa-hay-composition)
18. [Giao diện hay lớp trừu tượng?](#18-giao-diện-hay-lớp-trừu-tượng)
19. [Lớp xương sống (skeletal implementations)](#19-lớp-xương-sống-skeletal-implementations)
20. [Bảng thuật ngữ và bài tập](#20-bảng-thuật-ngữ-và-bài-tập)

---

# Phần I — Phụ thuộc mô-đun (Bài 10)

## 1. Vấn đề trung tâm: phân rã chương trình

Một vấn đề trung tâm trong thiết kế phần mềm là **phân rã một chương trình thành các phần**. Bài giảng đưa ra các khái niệm nền tảng để nói về các phần đó và quan hệ giữa chúng, tập trung vào:

- Xác định vấn đề **coupling** (sự gắn kết / phụ thuộc lẫn nhau) giữa các phần.
- Cách **giảm coupling**.

> Ngôn ngữ lập trình tốt cho phép bạn **biểu đạt** phụ thuộc giữa các phần và **điều khiển** chúng — ngăn phụ thuộc không mong muốn xuất hiện.

Các tính năng của Java có thể dùng để biểu đạt và thuần hóa phụ thuộc, minh họa qua một bài tập nhỏ, đặc biệt thể hiện **vai trò của giao diện** (interfaces).

---

## 2. Sơ đồ phụ thuộc mô-đun (MDD)

**MDD** (module dependency diagram) là công cụ hình ảnh hóa cấu trúc phụ thuộc. Nó hiển thị hai loại phần của chương trình:

| Loại phần | Ký hiệu trong MDD | Java |
|---|---|---|
| **Phần hiện thực hóa** (implementation part) | Hộp có **một** dải kẻ ở đầu hộp | Lớp (class) |
| **Phần đặc tả** (specification part) | Hộp có dải kẻ ở **cả** đầu và đáy | Giao diện (interface) |

Tổ chức các phần thành nhóm (như package trong Java) thể hiện bằng **đường viền bao** (contour) theo phong cách sơ đồ Venn.

### Hai loại mũi tên

| Mũi tên | Cách đọc | Ý nghĩa |
|---|---|---|
| Mũi tên **rỗng** (open head): `A ──▶ S` | A **depends on** (phụ thuộc) S | **Nghĩa của A phụ thuộc vào nghĩa của S** |
| Mũi tên **đóng** (closed head): `A ──▶ S` (đầu đặc) | A **meets** (đáp ứng) S | **Nghĩa của A phù hợp với nghĩa của S** |

Tính chất quan trọng: *specification S không thể tự thân có nghĩa phụ thuộc vào phần khác* → đảm bảo **nghĩa của một phần xác định được từ chính phần đó và các đặc tả nó phụ thuộc, không gì khác**.

```
   depends              meets
 A ───────▶ S          B ──────▶ S
```

Đọc thành chuỗi depends–meets quanh một **đặc tả** ở giữa. Diagram bên phải (trong nguồn) là chuỗi depends–meets **quanh một phần hiện thực hóa**: `A depends T`, `B meets T`.

### Nghĩa của từng cung (obligation)

Mỗi cung **gánh một nghĩa vụ**:

- Người viết A phải **kiểm tra** A sẽ hoạt động đúng nếu được lắp ghép với phần thỏa đặc tả S. "Hoạt động đúng" giờ được định nghĩa tường minh bằng việc **đáp ứng đặc tả**: B dùng được trong A nếu B hoạt động theo S; A được coi là hoạt động đúng nếu đáp ứng mọi đặc tả được chỉ định cho các mục đích sử dụng của nó — gọi là T.

### Quy ước mặc định

- Vì đặc tả **rất thiết yếu**, luôn giả định chúng tồn tại.
- **Thường không vẽ** phần đặc tả tường minh: cung phụ thuộc giữa hai phần hiện thực hóa A và B nên hiểu là **viết tắt** cho: A phụ thuộc vào **đặc tả của B**, và B **đáp ứng** đặc tả của chính nó.
- **Giao diện Java được vẽ tường minh** như phần đặc tả.

### Cung nét đứt: phụ thuộc yếu (weak dependence)

```
A - - - ▷ B
```

A chỉ phụ thuộc vào **sự tồn tại** của một phần thỏa đặc tả của B, **không phụ thuộc chi tiết nào** của B:

- A **biết tên** của B (tham chiếu tên lớp/giao diện, biến có kiểu đó).
- A **không gọi** phương thức nào của B, **không truy cập** trường nào của B.

---

## 3. MDD của một trình duyệt web

```
        Parser ────▶ AST
          │          ▲
          ▼          │
        Page ◀── Protocol ──▶ Network
          ▲          ▲
          │          │
        Display ─────┘
          ▲
          │
         Main
```

Giải thích:

| Phần | Vai trò |
|---|---|
| **Main** | Điều phối: dùng **Protocol** để tham gia giao thức HTTP, **Parse** để phân tích cú pháp HTML nhận được, **Display** để hiển thị lên màn hình |
| **Protocol** | Dùng **Network** để mở kết nối mạng & xử lý giao tiếp tầng thấp, dùng **Page** để lưu HTML nhận được |
| **Parser** | Dùng **AST** để tạo cây cú pháp trừu tượng (cấu trúc logic của trang, thay vì dãy ký tự); dùng **Page** vì phải truy cập dãy ký tự HTML thô |

### AST và tên toàn cục — vì sao nên tránh

Trong trình duyệt, AST có thể truy cập qua **tên toàn cục** (Singleton pattern — xem tài liệu 07). Nhưng vì nhiều lý do — ví dụ sau này quyết định cần **hai** cây cú pháp — dùng tên toàn cục như vậy **khôn ngoan**.

**Cách thay thế:** Main truyền phần AST từ Parse sang Display. Cách này tạo **phụ thuộc yếu** của Main vào AST. Cùng lập luận cho phụ thuộc yếu của Main vào Page (không vẽ trong hình).

---

## 4. Bài toán: instrumenting chương trình

Phần còn lại của bài giảng nghiên cứu các cơ chế giải phóng phụ thuộc (decoupling mechanisms) qua một ví dụ **nhỏ nhưng đại diện** cho một lớp vấn đề quan trọng.

### Nhu cầu

Muốn báo cáo các bước tiến triển của chương trình khi nó chạy, hiển thị tiến độ **theo dòng**. Ví dụ:

- Trong **trình biên dịch** nhiều pha: hiển thị thông báo khi mỗi pha **bắt đầu** và **kết thúc**.
- Trong **khách hàng email**: hiển thị từng bước tải email từ server.

Cơ sở báo cáo này hữu ích khi các bước riêng lẻ có thể **mất nhiều thời gian** hoặc **dễ thất bại** (người dùng có thể muốn hủy lệnh). Thanh tiến độ (progress bar) thường dùng trong ngữ cảnh này nhưng引入 thêm biến chứng (đánh dấu bắt đầu/kết thúc hoạt động, tính tiến độ tỷ lệ) — bài này **không lo** phần đó.

### Bối cảnh cụ thể

Khách hàng email có package **core** chứa:

| Lớp | Nội dung |
|---|---|
| `Session` | Mã thiết lập phiên giao tiếp với server và tải thông điệp |
| `Folder` | Mô hình hóa các folder và nội dung chúng |
| `Compactor` | Mã nén (compact) biểu diễn của folder trên đĩa |

Giả định: có lời gọi từ `Session` → `Folder` và `Folder` → `Compactor` (tương tác lẫn nhau), nhưng các hoạt động **tốn tài nguyên** cần instrument chỉ xảy ra trong `Session` và `Compactor`, **không** trong `Folder`.

```
Session ──▶ Folder ◀──▶ Compactor
         (Core package)
```

### Cách làm ngây thơ nhất

Rải rác các câu lệnh như:

```java
System.out.println("Starting download");
```

trong toàn bộ mã.

---

## 5. Cơ chế 1: Trừu tượng hóa bằng tham số hóa

### Vấn đề của cách ngây thơ

Khi chạy chương trình ở chế độ batch, ta redirect standard out ra file. Rồi nhận ra nên **ghép timestamp** vào mọi thông điệp để sau này đọc file biết mỗi bước mất bao lâu. Muốn đổi thành:

```java
System.out.println("Starting download at: " + new Date());
```

Việc này **nên dễ** nhưng **không dễ**: phải tìm **mọi** câu lệnh như vậy trong mã (và phân biệt với các lời gọi `System.out.println` khác với mục đích khác), đổi từng cái một.

### Giải pháp: đóng gói thành thủ tục

```java
public class StandardOutReporter {
    public static void report(String msg) {
        System.out.println(msg);
    }
}
```

Giờ đổi tại **một điểm duy nhất**:

```java
public class StandardOutReporter {
    public static void report(String msg) {
        System.out.println(msg + " at: " + new Date());
    }
}
```

Cơ chế này chính là thứ 6001 gọi là **trừu tượng hóa bằng tham số hóa** (abstraction by parameterization): mỗi lời gọi thủ tục là một **khoảnh khắc cụ thể hóa** (instantiation) của mô tả tổng quát, với tham số `msg` được gắn với một giá trị riêng:

```java
StandardOutReporter.report("Starting download");
```

### MDD với điểm kiểm soát duy nhất

```
Session ──┐
          ├──▶ StandardOutReporter
Compactor ┘
  (Core)

  Folder  (KHÔNG phụ thuộc — không gọi nó)
```

Lưu ý: **không có** phụ thuộc từ `Folder` vào `StandardOutReporter` vì mã của `Folder` không gọi nó.

### Đánh giá

| Ưu điểm | Nhược điểm |
|---|---|
| Thay đổi tại một điểm | Mã vẫn **phụ thuộc khái niệm** ghi ra standard out |

Muốn tạo phiên bản **GUI**: phải thay lớp này bằng lớp chứa mã GUI → đổi **mọi** tham chiếu trong package core sang lớp khác, **hoặc** sửa mã lớp đó và giờ phải xử lý **hai phiên bản không tương thích** cùng tên. Không lựa chọn nào hấp dẫn.

Vấn đề **còn tệ hơn**: với GUI, ta ghi bằng cách gọi phương thức trên đối tượng đại diện một phần của GUI (text pane, message field). Trong Swing, các lớp con của `JTextComponent` có `setText`:

```java
outputArea.setText(msg);
```

Làm sao **truyền tham chiếu** tới component xuống điểm gọi? Và làm sao **không** giới thiệu mã riêng của Swing vào lớp reporter?

---

## 6. Cơ chế 2: Giải phóng phụ thuộc bằng giao diện

### Thiết kế

Tạo giao diện có một phương thức `report`:

```java
public interface Reporter {
    void report(String msg);
}
```

Thêm tham số kiểu này vào mỗi phương thức cần instrument. `Session` ví dụ:

```java
void download(Reporter r, ...) {
    r.report("Starting download");
    ...
}
```

Định nghĩa lớp hiện thực hóa hành vi:

```java
public class StandardOutReporter implements Reporter {
    public void report(String msg) {
        System.out.println(msg + " at: " + new Date());
    }
}
```

Lớp này **không phải** lớp trước đó cùng tên: phương thức không còn `static` (tạo được đối tượng, gọi trên nó), và lớp khai báo `implements Reporter`. Với standard out thì có vẻ "lame", việc tạo đối tượng có vẻ thừa — nhưng với GUI, ta làm cầu kỳ hơn, tạo đối tượng **trói với widget cụ thể**:

```java
public class JTextComponentReporter implements Reporter {
    JTextComponent comp;
    public JTextComponentReporter(JTextComponent c) { comp = c; }
    public void report(String msg) {
        comp.setText(msg + " at: " + new Date());
    }
}
```

Ở đỉnh chương trình, tạo đối tượng `port` và truyền vào `download`:

```java
Reporter port = new StandardOutReporter();   // trong Main
session.download(port, ...);                 // trong Session
```

### Kết quả

Lời gọi `report` khi chạy **thực thi mã liên quan tới `System.out`**, nhưng các phương thức như `download` chỉ **phụ thuộc giao diện `Reporter`** — không nhắc cơ chế xuất cụ thể nào.

> Ta đã **giải phóng cơ chế xuất khỏi chương trình**, cắt phụ thuộc của lõi chương trình vào I/O của nó.

### MDD

```
              Main
               │ (tạo reporter)
               ▼
         ┌── Reporter ◀──(meets)── StandardOutReporter
         │      ▲                    JTextComponentReporter
         │      │                      (ui)
Core: Session ──┘
        Folder        (phụ thuộc YẾU tới Reporter — xem dưới)
        Compactor
```

Mũi tên đóng từ `StandardOutReporter` → `Reporter`: lớp đáp ứng giao diện (`implements`). Tương tự `JTextComponentReporter`; có phụ thuộc của Main vào `JTextComponentReporter` (không vẽ).

**Tính chất then chốt:** không còn phụ thuộc của lớp nào trong package **core** vào lớp nào trong package **ui**. Mọi phụ thuộc **hướng xuống** (ít nhất về mặt logic) từ ui về core. Đổi xuất stdout → widget GUI: chỉ thay lớp:

```java
Reporter port = new JTextComponentReporter(outputArea);  // trong Main
```

> Thần thức (idiom) này có lẽ là **cách dùng giao diện phổ biến nhất**, rất đáng để thành thạo.

### Phụ thuộc yếu — chỗ còn vấn đề

- Phụ thuộc yếu của **Main** vào `Reporter`: chỉ báo Main có thể chứa mã xử lý reporter tổng quát — **không phải vấn đề**.
- Phụ thuộc yếu của **Folder** vào `Reporter`: **có vấn đề**. Nó xuất hiện vì đối tượng Reporter phải được **đi qua** các phương thức của Folder để tới Compactor. **Mọi** phương thức trong chuỗi lời gọi chạm tới phương thức được instrument phải nhận `Reporter` làm đối số. **Phiền toái** — làm retrofitscheme này đau khổ.

---

## 7. Cơ chế 3: Trường static và Singleton

### Thiết kế

Nhược điểm rõ ràng của scheme trước: đối tượng reporter phải **luồn qua toàn bộ** chương trình core. Nếu mọi xuất hiển thị trong **một** text component, việc phải truyền tham chiếu quanh thật bực bội. Về mặt phụ thuộc: mỗi mô-đun có ít nhất phụ thuộc yếu vào giao diện `Reporter`.

**Biến toàn cục** (trong Java là trường static) giải quyết vấn đề này:

```java
public class StaticReporter {
    static Reporter r;
    static void setReporter(Reporter r) {
        StaticReporter.r = r;
    }
    static void report(String msg) {
        r.report(msg);
    }
}
```

Thiết lập đầu chương trình:

```java
StaticReporter.setReporter(new StandardOutReporter());
```

Gọi mà không cần tham chiếu đối tượng:

```java
void download(...) {
    StaticReporter.report("Starting download");
    ...
}
```

### MDD

Giờ **chỉ các lớp thật sự dùng reporter** mới phụ thuộc nó. Phụ thuộc yếu của **Folder biến mất**. Scheme này **kết hợp** khía cạnh static (cơ chế 1) với giải phóng phụ thuộc bằng giao diện (cơ chế 2).

```
Session ──▶ StaticReporter ──▶ Reporter ◀──(meets)── StandardOutReporter
Compactor       │                                  (ui)
                └── StandardOutReporter
  Folder  (không còn phụ thuộc)
```

### Hai vấn đề của biến toàn cục

**1. Khó hiểu mã.**
Tham chiếu toàn cục tiện (đổi hành vi phương thức ở đáy chuỗi lời gọi mà không sửa người gọi) nhưng **nguy hiểm**. Để xác định hiệu quả của lời gọi `StaticReporter.report`, bạn cần biết trường static `r` được gán gì. Có thể có lời gọi `setReporter` **bất cứ đâu** trong mã; xem hiệu quả của nó đòi hỏi **truy vết thực thi** để hiểu khi nào nó chạy tương đối với đoạn mã quan tâm.

**2. Chỉ hoạt động tốt khi thật sự có một đối tượng có ý nghĩa bền vững.**

| Ngữ cảnh | Một đối tượng? |
|---|---|
| Standard out | **Đúng** — thật sự là một |
| Text component trong GUI | **Không** — có thể muốn các phần khác nhau báo cáo vào **pane khác nhau** |
| Tải đồng thời nhiều server | **Không** — không muốn thông điệp tiến độ từ mọi phiên bị **xen kẽ** trong một xuất duy nhất |

Với scheme truyền đối tượng: tạo nhiều đối tượng khác nhau, truyền cho các phần mã khác nhau. Với scheme static: phải tạo nhiều **phương thức** khác nhau — nhanh chóng trở nên xấu xí.

> **Quy tắc thực hành:** hãy **dè chừng biến toàn cục**. Tự hỏi có thật sự "đi sống được" với **một** đối tượng không. Thường bạn sẽ tìm đủ lý do để cần nhiều hơn một đối tượng.

Scheme này đi theo tên **Singleton** trong tài liệu mẫu thiết kế, vì lớp chỉ chứa **một** đối tượng duy nhất (xem tài liệu 07).

### Bảng so sánh ba cơ chế

| Cơ chế | Điểm kiểm soát | Giải phóng I/O? | Đa đối tượng? | Khó hiểu? |
|---|---|---|---|---|
| 1. Thủ tục static (`StandardOutReporter`) | Một điểm | Không — vẫn phụ thuộc khái niệm stdout | Không | Thấp |
| 2. Truyền `Reporter` qua tham số | Lớp riêng cho từng cơ chế | **Có** — chỉ phụ thuộc giao diện | **Có** — mỗi phần truyền đối tượng khác | Thấp |
| 3. Trường static (`StaticReporter`) | Một điểm + giao diện | **Có** | **Không** (kém) | **Cao** — phải truy vết gán `r` |
| 0. Rải `System.out.println` | Không | Không | — | Rất cao khi đổi |

---

# Phần II — Kiểu con và lớp con (Bài 14)

## 8. Kiểu con (subtypes)

### Mũi tên đóng trong MDD và mô hình đối tượng

| Ngữ cảnh | Ý nghĩa mũi tên đóng `A ──▶ B` |
|---|---|
| **MDD**: `ArrayList ──▶ List` | `ArrayList` **đáp ứng** (meets) đặc tả của `List` |
| **Mô hình đối tượng** | Quan hệ **tập con** (subset) giữa hai tập |

Cũng có thể vẽ mũi tên đóng giữa **hai phần hiện thực hóa** A và B trong MDD (đặc tả của A, B không vẽ nhưng ngụ ý — chúng là mô-đun có đối tượng và phương thức liên quan):

> **A là một B** nếu **mọi đối tượng A cũng là đối tượng B**.

Ví dụ: mọi ô tô là phương tiện; mọi xe đạp là phương tiện; mọi pogo stick là phương tiện. Mọi phương tiện là phương tiện di chuyển, cũng như mọi động vật thồ.

### Tập con là điều kiện cần nhưng chưa đủ

> **Kiểu A là kiểu con (subtype) của kiểu B khi đặc tả của A *ngụ ý* đặc tả của B.**

Tức là: bất kỳ đối tượng (hoặc lớp) nào **thỏa đặc tả A** cũng **thỏa đặc tả B**, vì **đặc tả B yếu hơn**.

### Định nghĩa 6.170: "true subtyping"

Trong 6.170, true subtyping nghĩa là: **ở bất kỳ đâu trong mã**, khi bạn mong đợi đối tượng B, đối tượng A **có thể chấp nhận được**.

- Mã viết để làm việc với đối tượng B (và phụ thuộc tính chất của B) **được đảm bảo tiếp tục hoạt động** nếu được cung cấp đối tượng A thay thế.
- Hơn nữa, **hành vi sẽ như nhau**, nếu chỉ xét các khía cạnh hành vi của A **cũng có** trong hành vi của B.
- A **có thể giới thiệu hành vi mới** mà B không có, nhưng chỉ **được phép đổi** các hành vi B hiện có theo những cách nhất định (xem mục 10).

> *(Chú thích gốc — "without hubris whatsoever": gọi khái niệm 6.170 là "true subtyping" để phân biệt với kiểu con của Java, vốn ứng với khái niệm **yếu hơn**.)*

---

## 9. Ví dụ: xe đạp

### Hai lớp độc lập — sao chép là mệt mỏi

```java
class Bicycle {
    private int framesize;
    private int chainringGears;
    private int freewheelGears;
    ...
    // returns the number of gears on this bicycle
    public int gears() { return chainringGears * freewheelGears; }
    // returns the cost of this bicycle
    public float cost() { ... }
    // returns the sales tax owed on this bicycle
    public float salesTax() { return cost() * .0825; }
    // effects: transports the rider from work to home
    public void goHome() { ... }
    ...
}
```

Lớp mới cho xe đạp có đèn (muộn đêm/đi sớm):

```java
class LightedBicycle {
    private int framesize;
    private int chainringGears;
    private int freewheelGears;
    private BatteryType battery;
    ...
    public int gears() { return chainringGears * freewheelGears; }
    float cost() { ... }
    public float salesTax() { return cost() * .0825; }
    public void goHome() { ... }
    // effects: replaces the existing battery with the argument b
    public void changeBattery(BatteryType b);
    ...
}
```

**Sao chép toàn bộ mã thì mệt mỏi và dễ sai** (sai là sao chép không đúng, hoặc quên sửa chỗ cần sửa). Thêm nữa:

- Khi tìm bug ở một phiên bản, **dễ quên** lan truyền bản vá sang mọi phiên bản.
- Rất **khó nắm bắt** điểm khác biệt giữa hai lớp bằng cách **tìm khác biệt giữa một biển tương đồng**.

### Lớp con — tái sử dụng hiện thực hóa

```java
class LightedBicycle extends Bicycle {
    private BatteryType battery;
    ...
    // returns the cost of this bicycle
    float cost() { return super.cost() + battery.cost(); }
    public void goHome() { ... }
    public void changeBattery(BatteryType b);
    ...
}
```

`LightedBicycle` **không cần** hiện thực hóa trường/phương thức có ở lớp cha — Java tự dùng bản của `Bicycle` khi lớp con không override.

### Subclassing và subtype — vẫn phải kiểm tra đặc tả

Xét các hiện thực hóa `goHome` (kèm đặc tả đầy đủ hơn). Nếu đây là **thay đổi duy nhất**, `LightedBicycle` và `RacingBicycle` có phải kiểu con của `Bicycle` không?

```java
class Bicycle {
    ...
    // requires: windspeed < 20mph && daylight
    // effects: transports the rider from work to home
    void goHome() { ... }
}

class LightedBicycle {
    ...
    // requires: windspeed < 20mph
    // effects: transports the rider from work to home
    void goHome() { ... }
}

class RacingBicycle {
    ...
    // requires: windspeed < 20mph && daylight
    // effects: transports the rider from work to home
    //          in an elapsed time of < 10 minutes
    //          && gets the rider sweaty
    void goHome() { ... }
}
```

Để trả lời, nhớ định nghĩa kiểu con: đối tượng của kiểu con có thể thay thế **bất kỳ đâu** mã mong đợi đối tượng của kiểu trên? Nếu có, quan hệ kiểu con hợp lệ.

**Cả hai đều là kiểu con của `Bicycle`:**

| Lớp | Lý do |
|---|---|
| `LightedBicycle` | **Yêu cầu bị nới lỏng** (bớt `daylight`) — tiền điều kiện yếu hơn |
| `RacingBicycle` | **Hậu điều kiện được tăng cường** theo cách **vẫn thỏa** hậu điều kiện của lớp cha (thêm hiệu quả, không bớt) |

### Override và tính đa hình (dynamic dispatch)

`cost` của `LightedBicycle` cho thấy khả năng khác của subclassing: override để cung cấp hiện thực hóa mới → tái sử dụng thêm mã. Cụ thể `LightedBicycle` **tái sử dụng** `salesTax` của `Bicycle`:

1. Gọi `salesTax` trên `LightedBicycle` → dùng bản của `Bicycle`.
2. Bên trong, lời gọi `cost` **gọi phiên bản theo kiểu lúc chạy** (runtime type = `LightedBicycle`).

> **Bất kể kiểu khai báo** của đối tượng, bản hiện thực hóa của phương thức (nhiều bản cùng chữ ký) **luôn được chọn theo kiểu lúc chạy**.

Thực tế, **khách hàng bên ngoài không có cách nào** gọi phiên bản phương thức được chỉ định bởi kiểu khai báo hay kiểu nào đó không phải kiểu lúc chạy. Đây là tính chất **quan trọng và rất đáng mong muốn** của Java (và ngôn ngữ hướng đối tượng khác):

Giả sử lớp con duy trì vài trường **duy trì đồng bộ** với trường của lớp cha. Nếu gọi được trực tiếp phương thức lớp cha — có thể sửa trường lớp cha **mà không cập nhật** trường lớp con — **bất biến biểu diễn của lớp con sẽ bị phá**.

Một lớp con **có thể** gọi phương thức cha qua `super` — hữu ích khi phương thức lớp con chỉ cần làm **chút việc nữa**:

```java
class LightedBicycle extends Bicycle {
    float cost() { return super.cost() + battery.cost(); }
}
```

### MDD: phụ thuộc được giảm

**Không có** subclassing/subtype, `Rider` phụ thuộc vào **mỗi** lớp xe, và mã `Rider` còn phải **kiểm tra** đối tượng nhận được thuộc kiểu nào — xấu xí, dài dòng, dễ sai:

```
Rider ──▶ Bicycle
       ──▶ LightedBicycle
       ──▶ RacingBicycle
       ──▶ PennyFarthing
       ──▶ ...
```

**Với** kiểu con, phụ thuộc gộp thành **một**:

```
Rider ──▶ Bicycle
           ▲    ▲    ▲
           │    │    │
LightedBicycle RacingBicycle PennyFarthing ...
```

Thêm mũi tên kiểu con vào, diagram phức tạp hơn đôi chút — nhưng vẫn **đơn giản hơn nhiều**:

> Các cung **phụ thuộc** (dependence edges) làm phức tạp thiết kế và hiện thực hóa **nhiều hơn** các loại cung khác.

---

## 10. Nguyên tắc thay thế (substitution principle)

### Định nghĩa

Nguyên tắc thay thế là **nền tảng lý thuyết** của kiểu con; nó cung cấp định nghĩa **chính xác** khi nào hai kiểu là kiểu con. Không chính thức:

> **Kiểu con phải thay thế được kiểu trên.**

Điều này đảm bảo: nếu mã phụ thuộc (bất kỳ khía cạnh nào của) kiểu trên, nhưng đối tượng kiểu con bị thay thế vào, **hành vi hệ thống không bị ảnh hưởng**. (Trình biên dịch Java cũng yêu cầu mệnh đề `extends`/`implements` nêu đích danh lớp cha để cho phép dùng kiểu con thay kiểu trên.)

Phương thức của kiểu con phải giữ **mối quan hệ nhất định** với phương thức của kiểu trên, và kiểu con phải **đảm bảo** mọi tính chất của kiểu trên (như bất biến biểu diễn hoặc ràng buộc đặc tả) **không bị vi phạm**.

### Hai tính chất cần của phương thức

**1. Với mỗi phương thức ở kiểu trên, kiểu con phải có phương thức tương ứng.**

*(Kiểu con **được phép** giới thiệu phương thức mới hoàn toàn không có ở kiểu trên.)*

**2. Mỗi phương thức kiểu con tương ứng với phương thức kiểu trên phải:**

| Điều kiện | Chi tiết |
|---|---|
| **Yêu cầu ít hơn** (tiền điều kiện yếu hơn — *requires less*) | Không thêm mệnh đề `requires` nào, và mỗi mệnh đề **không chặt hơn** mệnh đề tương ứng ở kiểu trên. Kiểu đối số có thể là **kiểu trên** của kiểu đối số tương ứng — gọi là **contravariance** (đảo biến) |
| **Cam kết nhiều hơn** (hậu điều kiện mạnh hơn — *guarantees more*) | Không thêm **ngoại lệ** nào; không thêm **biến bị sửa** nào; trong mô tả kết quả/trạng thái kết quả, có **nhiều mệnh đề hơn** mô tả tính chất **mạnh hơn**. Kiểu kết quả có thể là **kiểu con** của kiểu kết quả kiểu trên — gọi là **covariance** (đồng biến) |

*(Các mô tả trên đều **cho phép bằng nhau**; ví dụ "yêu cầu ít hơn" nên đọc là "không yêu cầu nhiều hơn", "yếu hơn" nên là "không chặt hơn" — diễn theo dạng này để dễ đọc.)*

**Điểm mấu chốt:** phương thức kiểu con **không được hứa** kết quả khác hay nhiều hơn kiểu trên theo nghĩa lạ — nó chỉ hứa **làm đúng việc** phương thức kiểu trên làm, nhưng **có thể đảm bảo thêm** tính chất.

> Ví dụ: nếu phương thức kiểu trên trả số lớn hơn đối số, phương thức kiểu con có thể trả số **nguyên tố** lớn hơn đối số.

### Ví dụ ràng buộc kiểu

Nếu `A` là kiểu con của `B`, phép override hợp lệ:

```
Bicycle   B.f(Bicycle arg);
RacingBicycle A.f(Vehicle arg);
```

- `B.f` nhận `Bicycle`, nhưng `A.f` có thể nhận **bất kỳ `Vehicle` nào** (bao gồm mọi `Bicycle`).
- `B.f` trả `Bicycle`, nhưng `A.f` trả `RacingBicycle` (chính nó là `Bicycle`).

### Tính chất (properties)

Mọi tính chất kiểu trên đảm bảo — như ràng buộc trên giá trị xuất hiện trong **trường đặc tả** — kiểu con cũng phải đảm bảo *(kiểu con được phép **tăng cường** các ràng buộc này)*.

Ví dụ từ giáo trình — `FatSet` luôn không rỗng:

```java
class FatSet {
    // Specification constraints: this always contains at least one element
    ...
    // effects: if this contains x and this.size > 1, removes x from this
    void remove(int x);
}
```

Loại `NotSoFatSet` với phương thức bổ sung:

```java
// effects: removes x from this
void reallyRemove(int x)
```

**không phải** kiểu con của `FatSet`. Dù không vấn đề gì với **mọi** phương thức của `FatSet` (`reallyRemove` là phương thức mới nên quy tắc "phương thức tương ứng" không áp dụng), phương thức này **vi phạm ràng buộc**.

### Hành vi quan sát được

> Nếu đối tượng kiểu con được xét **hoàn toàn như** đối tượng kiểu trên (tức chỉ truy vấn **phương thức và trường** của kiểu trên), kết quả phải **giống hệt** như thể đối tượng kiểu trên được thao tác từ đầu.

### Tóm tắt theo chương 7 của giáo trình

Nguyên tắc thay thế đặt ràng buộc trên:

| Loại ràng buộc | Nội dung |
|---|---|
| **Signatures** (chữ ký) | Về bản chất là quy tắc contravariant và covariance ở trên. Chữ ký thủ tục = tên, kiểu đối số, kiểu kết quả, ngoại lệ |
| **Methods** (phương thức) | Ràng buộc trên **hành vi** — mọi khía cạnh của đặc tả **không biểu đạt được** trong chữ ký |
| **Properties** (tính chất)** | Như mục trên — ràng buộc trường đặc tả, RI, v.v. |

---

## 11. Kiểu con của Java — weaker notion

Kiểu của Java là **lớp, giao diện, hoặc nguyên thủy**. Java có khái niệm kiểu con **riêng** (chỉ涉及 lớp và giao diện):

> Kiểu con của Java **yếu hơn** true subtyping mô tả ở trên; kiểu con của Java **không nhất thiết thỏa** nguyên tắc thay thế. Ngược lại, quan hệ kiểu con **thỏa** nguyên tắc thay thế có thể **không được Java cho phép** và sẽ **không biên dịch**.

### Điều kiện để là kiểu con của Java

1. Quan hệ phải được **khai báo** (`extends`/`implements`).
2. Phương thức thỏa **hai tính chất tương tự nhưng yếu hơn** true subtyping:

| True subtyping | Kiểu con của Java |
|---|---|
| Kiểu đối số có thể là **tổng quát hơn** (contravariance) | Đối số phải **cùng kiểu** |
| Kiểu kết quả có thể là **kiểu con** (covariance) | Kết quả phải **cùng kiểu** |
| Không thêm ngoại lệ | Không thêm ngoại lệ **được khai báo** |
| Kiểm tra **đặc tả hành vi** | **Không có** khái niệm đặc tả hành vi → **không kiểm tra gì**, không đảm bảo về hành vi |

> Yêu cầu **bằng nhau tuyệt đối** về kiểu đối số/kết quả **chặt hơn mức thực sự cần** để đảm bảo type-safety → **cấm** vài thứ ta muốn viết. Đổi lại: **đơn giản hóa** cú pháp và ngữ nghĩa Java.

---

## 12. Ví dụ kinh điển: hình vuông và hình chữ nhật

Ta đều biết từ tiểu học: **mọi hình vuông là hình chữ nhật**. Giả sử muốn `Square` là kiểu con của `Rectangle`, có `setSize`:

```java
class Rectangle {
    ...
    // effects: sets width and height to the specified values
    //          (that is, this.width' = w && this.height' = h)
    void setSize(int w, int h);
}

class Square extends Rectangle {
    ...
}
```

Phương thức nào dưới đây **đúng** cho `Square`?

```java
// Phương án 1
// requires: w = h
void setSize(int w, int h);

// Phương án 2
void setSize(int edgeLength);

// Phương án 3
// throws BadSizeException if w != h
void setSize(int w, int h) throws BadSizeException;
```

### Đánh giá từng phương án

| Phương án | Vì sao sai |
|---|---|
| **1** | Lớp con **yêu cầu nhiều hơn** lớp cha → đối tượng lớp con **không thay thế được** lớp cha (có thể có mã gọi `setSize` với hai đối số **khác** nhau) |
| **2** | Không đủ **với riêng nó** — lớp con vẫn phải đặc tả hành vi cho `setSize(int, int)`; định nghĩa đó là **phương thức khác** (cùng tên nhưng **chữ ký khác**) |
| **3** | Ném **ngoại lệ** lớp cha không nhắc → lại có **hành vi khác**, hình vuông không thay thế hình chữ nhật. Nếu `BadSizeException` là unchecked, **Java cho biên dịch** — nhưng Java cũng cho phương án 1 biên dịch → minh chứng kiểu con của Java **yếu hơn** kiểu con của 6.170 |

### Lối thoát

> Không có cách thoát khỏi tình thế này mà **không sửa đổi kiểu trên**. Đôi khi kiểu con **không khớp trực giác**! Hoặc trực giác về kiểu trên tốt của chúng ta là **sai**.

Một giải pháp hợp lý: sửa `Rectangle.setSize` chỉ định nó **nén ngoại lệ** (trong thực tế chỉ `Square.setSize` làm vậy). Giải pháp khác: **bỏ `setSize`**, thay bằng:

```java
void scale(double scaleFactor);   // co hoặc giãn hình
```

Còn giải pháp khác nữa — nhiều khả năng.

---

## 13. Lợi ích và đánh đổi của kế thừa

### Lợi ích — tất cả bắt nguồn từ tái sử dụng

| Lợi ích | Chi tiết |
|---|---|
| **Tái sử dụng hiện thực hóa** | Lớp con không lặp lại trường/phương thức không đổi |
| **Tái sử dụng mã phía khách hàng** | Khi thêm kiểu con mới, người gọi **không đổi mã** — mã cũ hoàn toàn không nhắc kiểu con, chỉ nhắc kiểu trên |
| **Modularity tốt hơn, độ phức tạp giảm** | Người thiết kế/hiện thực/người dùng chỉ cần hiểu **kiểu trên**, không mọi kiểu con — đây là **tái sử dụng đặc tả** |

Cơ chế then chốt tạo lợi ích: **override** — chuyên biệt hóa hành vi cho vài phương thức. Không có override, mọi thay đổi hành vi (kể cả tương thích) có thể buộc **hiện thực hóa lại hoàn toàn**. Override cho phép **phần** hiện thực hóa thay đổi mà không đổi các phần phụ thuộc nó → tái sử dụng mã và đặc tả nhiều hơn, cả phía hiện thực lẫn phía khách hàng.

### Nhược điểm tiềm ẩn

**Cơ hội tái sử dụng không phù hợp.**

- Lớp con và lớp cha có thể phụ thuộc lẫn nhau (rõ ràng qua tên kiểu, hoặc **ngầm** qua kiến thức về hiện thực hóa), đặc biệt vì lớp con **truy cập được** phần `protected` của hiện thực hóa lớp cha.
- Phụ thuộc thêm này **phức tạp hóa MDD, thiết kế, hiện thực hóa** — khó viết, khó hiểu, khó sửa hơn.

---

# Phần III — Lớp và giao diện (Bài 15)

> Lớp và giao diện nằm ở **trái tim** ngôn ngữ Java. Bài giảng mô tả các hướng dẫn thiết kế lớp/giao diện **dùng được (usable), bền (robust), linh hoạt (flexible)** — theo Chương 4 *Effective Java* của Joshua Bloch.

## 14. Truy cập (accessibility) và ẩn thông tin

### Nguyên tắc nền tảng

> Yếu tố **quan trọng nhất một** phân biệt mô-đun thiết kế tốt với mô-đun thiết kế kém là **mức độ** nó ẩn dữ liệu nội bộ và chi tiết hiện thực hóa khỏi các mô-đun khác.

Mô-đun thiết kế tốt ẩn **toàn bộ** chi tiết hiện thực hóa, tách **API** khỏi **hiện thực hóa** một cách sạch sẽ. Các mô-đun giao tiếp **chỉ qua API**; và **không biết** hoạt động nội bộ của nhau. Khái niệm này gọi là **information hiding** (ẩn thông tin) hoặc **encapsulation** (khuất phục / bọc kín).

> Ghi chú lịch sử: Parnas (bài 1) đặt thuật ngữ "information hiding" — lần đầu diễn đạt ý tưởng tổ chức mô-đun quanh **bí mật** chúng bọc kín (tài liệu 01).

Java có nhiều phương tiện hỗ trợ ẩn thông tin; một phương tiện như vậy là **cơ chế kiểm soát truy cập** quyết định tính truy cập được (accessibility) của lớp, giao diện và thành phần.

### Lớp/giao diện cấp cao (top-level): 2 mức

| Mức | Khi nào dùng |
|---|---|
| **package-private** (mặc định) | **Nếu có thể làm được thì nên làm** |
| **public** | Chỉ khi phải export |

Vì sao?

- Làm **package-private**: biến nó thành **phần hiện thực hóa của package**, không phải API export — bạn có thể **sửa, thay thế, loại bỏ** ở bản phát hành sau mà **không sợ hại** khách hàng hiện hữu.
- Làm **public**: bạn **bị ràng buộc hỗ trợ vĩnh viễn** để duy trì tương thích.

### Thành phần (members): 4 mức, tăng dần khả năng truy cập

| Mức | Phạm vi truy cập |
|---|---|
| **private** | Chỉ bên trong lớp cấp cao nơi nó được khai báo |
| **package-private** | Bất kỳ lớp nào trong package nơi nó khai báo. Kỹ thuật là **default access** — mức bạn nhận khi **không** ghi modifier |
| **protected** | Các lớp con của lớp khai báo (vài hạn chế không đi vào) **và** mọi lớp trong package |
| **public** | Bất kỳ đâu |

### Quy tắc thực hành

> Làm mỗi lớp/thành phần **khó truy cập nhất có thể**.

Sau khi **cẩn thận thiết kế API public**, làm mọi thành phần còn lại **private** nếu được.

| Cặp | Bản chất |
|---|---|
| `private` + `package-private` | Là **phần hiện thực hóa**, thường **không ảnh hưởng** API export |
| `protected` | Với thành phần của lớp public, mức nhảy từ package-private → protected là **tăng khổng lồ** về khả năng truy cập: `protected` là **phần API export**, phải hỗ trợ **vĩnh viễn** |

### Một ngoại lệ: quy tắc override

> Nếu một phương thức **override** phương thức lớp cha, nó **không được phép** có mức truy cập **thấp hơn** ở lớp con so với lớp cha.

Cần để đảm bảo đối tượng lớp con **dùng được ở bất kỳ đâu** đối tượng lớp cha dùng được (nguyên tắc thay thế, mục 10).

---

## 15. Nguy hiểm của kế thừa (dangers of inheritance)

### Kế thừa phá vỡ encapsulation

Kế thừa (subclassing) là cách **mạnh** để tái sử dụng mã nhưng **không phải lúc nào cũng là công cụ tốt nhất**. Dùng sai → phần mềm **giòn** (fragile). Dùng kế thừa **bên trong** một package là an toàn — nơi lớp con và lớp cha cùng dưới sự kiểm soát của **một** lập trình viên.

> Không giống lời gọi phương thức, **kế thừa phá vỡ encapsulation**. Lớp con **phụ thuộc chi tiết hiện thực hóa** của lớp cha để hoạt động đúng.

Hiện thực hóa lớp cha có thể đổi giữa các bản phát hành; nếu đổi, lớp con có thể **hỏng** dù mã của nó **không bị chạm tới**. Lớp con phải **tiến hóa song song** với lớp cha — trừ khi tác giả lớp cha đã thiết kế và tài liệu hóa nó **đặc biệt cho mục đích mở rộng**.

### Ví dụ cụ thể: InstrumentedHashSet

Chương trình dùng `HashSet`. Để tinh chỉnh hiệu năng, cần truy vấn số phần tử **đã thử chèn** kể từ khi tạo (khác `size` hiện tại — `size` giảm khi xóa). Viết lớp con:

```java
public class InstrumentedHashSet extends HashSet {
    // The number of attempted element insertions
    private int addCount = 0;

    public InstrumentedHashSet() { }
    public InstrumentedHashSet(Collection c) { super(c); }

    public boolean add(Object o) {
        addCount++;
        return super.add(o);
    }

    public boolean addAll(Collection c) {
        addCount += c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}
```

**Lớp này có vẻ hợp lý nhưng không hoạt động:**

```java
InstrumentedHashSet s = new InstrumentedHashSet();
s.addAll(Arrays.asList(new String[]{"S", "Cr", "P"}));
s.getAddCount();   // mong đợi 3, thực tế trả 6
```

**Chuyện gì đã xảy ra?** Bên trong, `addAll` của `HashSet` được hiện thực hóa **dựa trên** `add` của nó — dù `HashSet` không tài liệu hóa chi tiết này, và **không nên** phải làm vậy. `addAll` của lớp con cộng 3 vào `addCount`, rồi gọi `super.addAll` → gọi `add` **đã bị override** cho **mỗi phần tử** → mỗi lần cộng thêm 1 nữa: **mỗi phần tử chèn qua `addAll` bị đếm hai lần**.

### Ba cách "sửa" — và vì sao đều không ổn

| Cách | Kết quả | Vấn đề |
|---|---|---|
| **Bỏ override `addAll`** | Lớp hoạt động | Nhưng phụ thuộc vào việc `HashSet.addAll` dựa trên `add` — **chi tiết hiện thực hóa (self-use)**, không được đảm bảo, có thể đổi giữa bản phát hành → lớp **giòn** |
| **Override `addAll`, tự duyệt gọi `add` từng phần tử** | Khá hơn | Tự **hiện thực lại** phương thức lớp cha — khó và dễ sai; và **không phải lúc nào cũng làm được** nếu phương thức cần trường private mà lớp con không truy cập được |
| **Composition + forwarding** | **Giải pháp đúng** | Xem mục 16 |

Gốc rễ vấn đề: override phương thức.

---

## 16. Composition và forwarding (wrapper)

### Ý tưởng

> Thay vì `extends` một lớp có sẵn, cho lớp mới của bạn một **trường private** tham chiếu một **đối tượng** của lớp có sẵn. Thiết kế này gọi là **composition** vì lớp có sẵn trở thành **thành phần** của lớp mới. Mỗi phương thức instance trong lớp mới **gọi phương thức tương ứng** trên đối tượng bị chứa và trả kết quả — gọi là **forwarding**.

Kết quả: lớp **vững chắc**, không phụ thuộc chi tiết hiện thực hóa của lớp có sẵn.

```java
public class CompHashSet {
    private final HashSet s;
    private int addCount = 0;

    public CompHashSet(HashSet s) {
        this.s = s;
    }

    public boolean add(Object o) {
        addCount++;
        return s.add(o);
    }

    public boolean addAll(Collection c) {
        addCount += c.size();
        return s.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}
```

Để có `CompHashSet`, trước tiên tạo `HashSet` rồi truyền vào hàm khởi tạo:

```java
CompHashSet s = new CompHashSet(new HashSet());
```

### Wrapper class

Lớp `CompHashSet` được gọi là **lớp bọc** (wrapper class) vì mỗi đối tượng `CompHashSet` **bọc** một đối tượng `HashSet` khác. Kỹ thuật bọc này **rất mạnh** — bài trước đã nhắc rằng bọc có thể dùng để **thay thế phương thức `equals`** của kiểu bằng phương thức phù hợp hơn.

**Nhược điểm chính:** viết các phương thức forwarding hơi **nhàm chán** — nhưng bù lại bạn chỉ cần viết **một** hàm khởi tạo.

---

## 17. Kế thừa hay composition?

### Quy tắc quyết định

> Kế thừa **chỉ thích hợp** trong những trường hợp lớp con **thật sự là kiểu con** của lớp cha, theo định nghĩa ở Bài 14.
>
> Nếu bị cám dỗ cho lớp B `extends` lớp A, hãy tự hỏi: **"Mọi B có thật sự là một A không?"**
>
> - Không trả lời được **yes** → B **không nên** extend A.
> - Câu trả lời **không** → thường B nên **chứa** một đối tượng private của A và expose API **nhỏ và đơn giản hơn**: A không phải phần thiết yếu của B, chỉ là **chi tiết hiện thực hóa**.

### Áp dụng cho các ví dụ

| Lớp | Có phải kiểu con thật? | Tại sao |
|---|---|---|
| `InstrumentedHashSet` | **Không** | Có thêm biến bị sửa `addCount` |
| `Stack extends Vector` | **Không** — ngăn xếp không phải vector | Java platform library có sẵn vi phạm |
| `Properties extends Hashtable` | **Không** — danh sách thuộc tính không phải bảng băm | Như trên |

Với cả hai trường hợp Java, **composition mới là thích hợp**.

### Kế thừa ngay cả khi trả lời "yes" — vẫn phải cân nhắc kỹ

Như `InstrumentedHashSet`, hiện thực hóa lớp con có thể **hỏng** do hành vi **không được đặc tả** của lớp cha. Chuyện xảy ra: phương thức lớp con hỏng vì các phương thức lớp cha có **phụ thuộc ngầm** giữa chúng — phụ thuộc **không có trong đặc tả** lớp cha. Trước khi dùng `extends`, bạn phải **tự thuyết phục mình** rằng phụ thuộc giữa các phương thức lớp cha **sẽ không ảnh hưởng** hành vi lớp con.

### Hệ quả của kế thừa sai (ví dụ `Properties`)

Kế thừa nơi appropriate nên composition → **ngữ nghĩa khó hiểu**:

- Nếu `p` tham chiếu đối tượng `Properties`: `p.getProperty(key)` có thể **khác** `p.get(key)` — cái前者 **tính mặc định** (defaults), cái后者 kế thừa từ `Hashtable` thì **không**.
- **Nghiêm trọng hơn:** khách hàng có thể **làm hỏng bất biến** của lớp con bằng cách sửa lớp cha **trực tiếp**. Các nhà thiết kế `Properties` định chỉ **chuỗi** được làm key/value, nhưng truy cập trực tiếp `Hashtable` nền cho phép vi phạm. Một khi vi phạm, **không thể dùng** các phần API còn lại (`load`, `store`). Khi phát hiện thì **đã quá muộn** để sửa vì khách hàng đã phụ thuộc key/value không phải chuỗi.

---

## 18. Giao diện hay lớp trừu tượng?

Java cung cấp **hai cơ chế** định nghĩa kiểu cho phép nhiều hiện thực hóa: **giao diện** và **lớp trừu tượng**. *(Lớp trừu tượng = lớp chỉ được subclass, không được khởi tạo đối tượng.)*

Hai điểm khác biệt:

| | Lớp trừu tượng | Giao diện |
|---|---|---|
| Chứa **hiện thực hóa** phương thức | **Được** (một phần) | **Không** |
| Để hiện thực hóa kiểu | Lớp **phải là lớp con** | Bất kỳ lớp nào đủ phương thức + tuân hợp đồng tổng quát |

### Ưu điểm của giao diện

**1. Retrofits dễ.**

- Lớp có sẵn **dễ dàng** thêm `implements` giao diện mới: chỉ cần thêm các phương thức yêu cầu (nếu chưa có) + mệnh đề `implements`.
- Lớp có sẵn **không nói chung** được retrofit để `extends` lớp trừu tượng mới. Muốn hai lớp extend cùng một lớp trừu tượng, phải đặt nó **cao lên** trong phân cấp kiểu (trở thành lớp cha của tổ tiên cả hai) → có thể **phá vỡ** phân cấp.

**2. Cho phép khung kiểu **phi phân cấp** (non-hierarchical).**

```java
public interface Singer {
    CD compactDisc(Song s);
}

public interface Songwriter {
    Song compose(boolean hit);
}
```

Một số ca sĩ cũng là nhạc sĩ. Vì dùng giao diện, một lớp duy nhất **hoàn toàn được phép** implement cả hai. Thậm chí định nghĩa giao diện thứ ba **kế thừa cả hai** + phương thức mới cho tổ hợp:

```java
public interface SingerSongwriter extends Singer, Songwriter {
    void actSensitive();
}
```

---

## 19. Lớp xương sống (skeletal implementations)

### Kết hợp ưu điểm của cả hai

> Cung cấp một **lớp xương sống trừu tượng** (abstract skeletal implementation) đi kèm mỗi giao diện phi tầm thường bạn export.

- Giao diện vẫn **định nghĩa kiểu**.
- Lớp xương sống **gỡ phần lớn công việc** khỏi việc hiện thực hóa.

**Quy ước đặt tên:** lớp xương sống tên `AbstractInterface` — `Interface` là tên giao diện nó hiện thực hóa. Ví dụ: khung Collections cung cấp lớp xương sống cho mỗi giao diện sưu tập chính: `AbstractCollection`, `AbstractList`, v.v.

**Vẻ đẹp:** cung cấp **trợ giúp hiện thực hóa** của lớp trừu tượng mà **không áp đặt** các hạn chế nghiêm ngặt khi lớp trừu tượng giữ vai trò định nghĩa kiểu. Với hầu hết người hiện thực hóa, extend lớp xương sống là **lựa chọn rõ ràng** — nhưng **hoàn toàn tùy chọn**.

Nếu lớp có sẵn không extend được: lớp xương sống **vẫn giúp được** — lớp hiện thực hóa giao diện có thể **forward** lời gọi tới một lớp con private **lớp lồng** extend lớp xương sống. Kỹ thuật này gọi là **giả lập kế thừa đa** (simulated multiple inheritance), gắn chặt với thần thức wrapper (mục 16).

### Cách viết

Tương đối đơn giản, nếu hơi nhàm chán:

1. Nghiên cứu giao diện, quyết định phương thức nào là **phần tử nguyên thủy** (primitives) mà các phương thức khác có thể hiện thực hóa từ chúng → các phần tử đó là các phương thức **trừu tượng** trong lớp xương sống.
2. Cung cấp hiện thực hóa **cụ thể** cho mọi phương thức còn lại của giao diện.

Ví dụ — lớp xương sống một phần của giao diện `Map.Entry`:

```java
public abstract class AbstractMapEntry implements Map.Entry {
    // Primitives
    public abstract Object getKey();
    public abstract Object getValue();
    ...

    // Implements the general contract of Map.Entry.equals
    public boolean equals(Object o) {
        if (o == this) return true;
        if (!(o instanceof Map.Entry))
            return false;
        Map.Entry arg = (Map.Entry) o;
        return eq(getKey(), arg.getKey()) &&
               eq(getValue(), arg.getValue());
    }

    // Since Object equals was overridden, we better override hashCode!
    public int hashCode() {
        return
            (getKey() == null ? 0 : getKey().hashCode()) ^
            (getValue() == null ? 0 : getValue().hashCode());
    }
}
```

---

## 20. Bảng thuật ngữ và bài tập

### Bảng thuật ngữ (Anh – Việt)

| Tiếng Anh | Tiếng Việt |
|---|---|
| module dependency diagram (MDD) | sơ đồ phụ thuộc mô-đun |
| implementation part / specification part | phần hiện thực hóa / phần đặc tả |
| depends / meets | phụ thuộc / đáp ứng |
| weak dependence | phụ thuộc yếu |
| coupling | sự gắn kết / phụ thuộc lẫn nhau |
| decoupling | giải phóng phụ thuộc |
| instrumentation | Thăm dò / báo cáo tiến độ |
| abstraction by parameterization | trừu tượng hóa bằng tham số hóa |
| Singleton | đơn thể (mẫu thiết kế) |
| subtype / supertype | kiểu con / kiểu trên |
| substitution principle | nguyên tắc thay thế |
| contravariance / covariance | đảo biến / đồng biến |
| precondition / postcondition | tiền điều kiện / hậu điều kiện |
| subclassing / overriding | kế thừa lớp / ghi đè phương thức |
| fragile software | phần mềm giòn |
| composition and forwarding | tổng hợp và chuyển tiếp |
| wrapper class | lớp bọc |
| accessibility | khả năng truy cập |
| package-private / protected | riêng package / được bảo vệ |
| abstract class | lớp trừu tượng |
| skeletal implementation | hiện thực hóa xương sống |
| simulated multiple inheritance | giả lập kế thừa đa |
| retrofit | bổ sung vào mã có sẵn |
| self-use | tự dùng (phương thức gọi phương thức khác của chính nó) |

### Bài tập suy nghĩ

1. Với 3 cơ chế instrument chương trình (thủ tục static, truyền `Reporter`, trường static): nêu một tình huống **cụ thể** mà cơ chế 3 (Singleton) **sai** nghiêm trọng hơn hai cơ chế kia.
2. Trong MDD, vì sao cung phụ thuộc luôn được diễn đạt là phụ thuộc vào **đặc tả** chứ không phải phần hiện thực hóa? Điều gì sẽ xảy ra nếu cho phép phụ thuộc trực tiếp?
3. Chứng minh `RacingBicycle` thỏa nguyên tắc thay thế cho `Bicycle` theo cả ba loại ràng buộc: signatures, methods, properties.
4. Tại sao `NotSoFatSet` không phải kiểu con của `FatSet` dù **không vi phạm** quy tắc "phương thức tương ứng"?
5. `InstrumentedHashSet`: sửa bằng composition (`CompHashSet`) — vì sao lần này `addAll` không còn double-count?
6. Viết giao diện `Reporter` + lớp xương sống `AbstractReporter` (giả định: mặc định thêm timestamp; lớp con chỉ cung cấp phương thức `emit(String line)`).
7. Áp dụng quy tắc "Mọi B có thật sự là một A không?" cho `ArrayList extends AbstractList extends ...`: `List` là giao diện hay lớp — điều đó thay đổi câu trả lời thế nào?

---

*Nguồn: MIT 6.170 Lecture 10 (Module Dependence Diagrams), Lecture 14 (Subtypes and Subclasses), Lecture 15 (Classes and Interfaces), Fall 2005.*
