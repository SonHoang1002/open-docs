# Ngoại lệ, assertion và bằng nhau của đối tượng

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering*, Fall 2005 — hai bài:

- **Bài 11: Assertions and Exceptions** (lập trình phòng thủ, assertion runtime, nhảy không cục bộ, checked/unchecked, tiền điều kiện)
- **Bài 12: Identity and Equality I** (hợp đồng Object — equals/hashCode, kế thừa phá vỡ bằng nhau, bảng băm)

Đọc kèm: *Effective Java* — Joshua Bloch (Items 39...); *Program Development in Java* — Barbara Liskov, p. 73.

---

## Mục lục

**Phần I — Assertion và ngoại lệ (Bài 11)**

1. [Lập trình phòng thủ (defensive programming)](#1-lập-trình-phòng-thủ-defensive-programming)
2. [Assertion runtime](#2-assertion-runtime)
3. [Assertion trong Java](#3-assertion-trong-java)
4. [Phản ứng với thất bại](#4-phản-ứng-với-thất-bại)
5. [Nhảy không cục bộ (non-local jumps)](#5-nhảy-không-cục-bộ-non-local-jumps)
6. [Ngoại lệ cho kết quả đặc biệt](#6-ngoại-lệ-cho-kết-đặc-biệt)
7. [Lạm dụng ngoại lệ](#7-lạm-dụng-ngoại-lệ)
8. [Checked và unchecked exceptions](#8-checked-và-unchecked-exceptions)
9. [Ngoại lệ và tiền điều kiện](#9-ngoại-lệ-và-tiền-điều-kiện)
10. [Cân nhắc thiết kế](#10-cân-nhắc-thiết-kế)
11. [Phân cấp Throwable](#11-phân-cấp-throwable)

**Phần II — Bằng nhau (Bài 12)**

12. [Hợp đồng Object](#12-hợp-đồng-object)
13. [Bằng nhau và kế thừa — phá vỡ đối xứng](#13-bằng-nhau-và-kế-thừa--phá-vỡ-đối-xứng)
14. [Hai cách giải quyết và bài học từ java.sql.Timestamp](#14-hai-cách-giải-quyết-và-bài-học-từ-javasqltimestamp)
15. [Bằng nhau và hiệu năng — bảng băm](#15-bằng-nhau-và-hiệu-năng--bảng-băm)
16. [Quy tắc: luôn override hashCode khi override equals](#16-quy-tắc-luôn-override-hashcode-khi-override-equals)
17. [Bảng thuật ngữ và bài tập](#17-bảng-thuật-ngữ-và-bài-tập)

---

# Phần I — Assertion và ngoại lệ (Bài 11)

> Bài giảng tập trung nhiều vào **vấn đề thiết kế** hơn chi tiết ngôn ngữ (có trong sách Java tham khảo):
> - Làm sao code **bền hơn** (robust) với assertion runtime;
> - Dùng ngoại lệ để **truyền kết quả về người gọi**, kể cả trong tình huống **không thất bại**;
> - Cách quyết định dùng **checked** hay **unchecked** exception.

## 1. Lập trình phòng thủ (defensive programming)

### Động cơ

Giả sử bạn thiết kế một **trình biên dịch**. Vì trình biên dịch nằm dưới sự phát triển liên tục, lại lớn và phức tạp, nó **có khả năng chứa bug** dù bạn cố gắng hết sức. Lập trình phòng thủ là cách **giảm nhẹ hậu quả bug mà không cần biết chúng ở đâu**.

> Áp dụng chiến lược phòng thủ **không phải là thú nhận bất lực**.

- Chương trình lớn nào **có khả năng** chứa bug.
- Ngay cả chương trình **không bug** cũng được lợi: bạn có thể phải đối mặt với **cơ sở dữ liệu** thỉnhn thoảng bị hỏng. Dự đoán **mọi hình thức hỏng** là quá khó → dùng chiến lược phòng thủ.

### Cách hoạt động

1. Khi viết mã, bạn xác định các **điều kiện mong đợi đúng** tại các điểm nhất định trong mã — gọi là **bất biến** (invariants).
2. Thay vì **chỉ giả định** chúng đúng, bạn **kiểm tra tường minh**.
3. Nếu điều kiện **sai** → **dừng phép tính**.

### Ví dụ: trường hợp Symbols

Trình biên dịch duy trì một vector ký hiệu và vài vector khác, mỗi vector chứa đối tượng lưu thông tin về ký hiệu:

```java
class Symbols {
    Vector symbols;
    Vector types;
    Vector positions;
    ...
}
```

Để truy cập thông tin cho một ký hiệu given, phải lấy phần tử vector thông tin **cùng chỉ số**. Với ký hiệu `sym`, lấy kiểu:

```java
int i = symbols.indexOf(sym);
Type t = types.get(i);
```

Mã này **chỉ hoạt động đúng khi**: ký hiệu được tra **thật sự có** trong `symbols`, và hai vector **cùng độ dài** để lệnh thứ hai chạy được. Nếu lệnh thứ hai thất bại → **có gì đó đã sai**, trình biên dịch **không khả năng** sinh mã đúng → tốt nhất **không tiêu thêm tài nguyên nào**, dừng ngay.

Thực tế làm tốt hơn — phát hiện vấn đề **sau lệnh đầu tiên**, chèn assertion runtime:

```java
int i = symbols.indexOf(sym);
if (!(i >= 0))
    System.exit(1);
...
Type t = types.get(i);
```

Nếu `indexOf` trả `-1` (ký hiệu không có trong vector), dừng **toàn bộ** trình biên dịch bằng `System.exit(1)`.

### Assertion cũng là tài liệu

Để assertion dễ viết, hầu hết lập trình viên định nghĩa một thủ tục, để có thể viết:

```java
assert (i >= 0)
```

Điều này cũng minh họa **giá trị tài liệu** của assertion: dù **không được thực thi**, chúng giúp người đọc mã **hiểu极大地** mã đang làm gì.

### Hai câu hỏi quan trọng

1. **Ở đâu và loại assertion runtime nào là tốt nhất?**
2. **Nên dừng thực thi như thế nào?**

---

## 2. Assertion runtime

### Assertion không phải nạng đỡ cho mã dở

> Muốn code **không bug** bằng cách **hiệu quả nhất**. Lập trình phòng thủ **không có nghĩa** viết mã tồi rồi rải assertion.

Nếu chưa biết điều này, bạn sẽ thấy **về lâu dài** viết mã tốt **từ đầu** tốn ít công hơn nhiều; mã xấu thường **bày bừa đến mức không sửa được** nếu không làm lại từ đầu.

### Khi nào viết?

> **Khi viết mã, không phải sau.**

Khi viết mã, bạn **đã có** các bất biến trong đầu; ghi chúng ra là **hình thức tài liệu hữu ích**. **Hoãn lại** → khả năng làm **thấp hơn**.

### Assertion **không miễn phí**

- Có thể **bày bừa mã** → phải dùng **thận trọng** (judiciously).
- Rõ ràng muốn viết assertion **có khả năng bắt bug nhất**.

**Lập trình viên giỏi thường dùng assertion:**

| Vị trí | Lý do |
|---|---|
| **Đầu thủ tục** — kiểm tra trạng thái khi thủ tục được gọi là **đúng như mong đợi** | Tỷ lệ lỗi lớn liên quan **hiểu lầm về giao diện** giữa các thủ tục |
| **Cuối thủ tục phức tạp** — kiểm tra kết quả **hợp lý** (plausible) | Loại assertion này đôi khi gọi là **self check** (kiểm tra tự thân) |
| **Trước khi thao tác có hiệu ứng ngoài** | Ngăn hiệu ứng ngoài xảy ra khi trạng thái sai |

### Hiệu năng

Assertion cũng **có thể làm chậm** thực thi. **Người mới thường lo lắng về điều này nhiều hơn mức cần**:

> **Không dùng** assertion runtime để **kiểm thử** rồi **tắt** trong bản phát hành chính thức.
>
> Quy tắc thực hành: nếu nghĩ assertion cần thiết, chỉ lo chi phí hiệu năng khi có **bằng chứng** (vd từ profiler) rằng chi phí **thật sự đáng kể**.

Tuy nhiên, viết assertion **đắt vô lý** thì vô nghĩa. Ví dụ: given mảng và chỉ số đã đặt phần tử, **hợp lý** để kiểm tra phần tử **có ở đó**; nhưng kiểm tra phần tử **không ở đâu khác** bằng cách quét hết mảng là **không hợp lý** — có thể biến thao tác **hằng số** thành **tuyến tính**.

---

## 3. Assertion trong Java

Từ Java 1.4, assertion trở thành tính năng **tích hợp**. Dạng đơn giản nhất nhận biểu thức boolean, ném `AssertionError` nếu nó sai:

```java
assert (x >= 0);
```

### Ba vấn đề (thời Java 1.4/2005)

| # | Vấn đề | Giải pháp |
|---|---|---|
| 1 | `assert` **không được trình biên dịch nhận ra** nếu không thêm switch đặc biệt | `javac -source 1.4 MyClass.java` |
| 2 | Assertion **mặc định tắt** — chạy chương trình bình thường thì **không assertion nào được kiểm tra** | Bật tường minh: `java -ea MyClass` (`-ea` = "enable assertions") |
| 3 | Assertion **không tương thích ngược** — không chạy được chương trình đã biên dịch dùng `assert` trên JVM 1.3 trở về trước | — |

*(Tham khảo tài liệu chính: `java.sun.com/j2se/1.4/docs/guide/lang/assert.html`.)*

---

## 4. Phản ứng với thất bại

### Không nên: sửa lỗi ngay tại chỗ

> Cảm thấy muốn **sửa vấn đề ngay khi nó xảy ra** (fix on the fly) — **gần như luôn là sai**.

- Làm mã **phức tạp hơn**, thường **giới thiệu thêm bug**.
- Khó đoán được **nguyên nhân** thất bại; nếu đoán được, bạn **có lẽ đã tránh được bug ngay từ đầu**.

### Nên: các phản ứng hợp lý

Tùy loại chương trình, có thể **dừng hẳn** hoặc **không dừng**. Thường có ý nghĩa thực hiện vài **hành động đặc biệt** bất kể nguyên nhân chính xác:

- Ghi thất bại ra **file** (log).
- **Thông báo** người dùng trên màn hình.

### Cấu trúc việc dừng một lệnh — cách cũ rất dài dòng

Với cơ chế đã thấy, việc dừng lệnh trong mã **cực kỳ nhàm chán**:

- Mỗi thủ tục phải trả **giá trị trả về đặc biệt** báo thành công/thất bại.
- **Mọi điểm gọi** phải kiểm tra giá trị đó.
- Thủ tục bị gọi thất bại → thủ tục gọi **cũng phải** trả giá trị thất bại.

```java
boolean p(...) {
    boolean success = q(...);
    if (!success) return false;
    success = r(...);
    if (!success) return false;
    ...
}
```

Ngoài việc nhàm chán (và tước của bạn các giá trị trả về khác — **vấn đề lớn** với ngôn ngữ chỉ cho **một** giá trị trả về), cách này còn có **vấn đề khác**. Đó là gì? → Câu trả lời ở mục 5: **không có nhảy không cục bộ** — mọi tầng trung gian phải tiếp tục dính dáng tới việc xử lý lỗi.

---

## 5. Nhảy không cục bộ (non-local jumps)

> Thứ ta cần là cơ chế **nhảy không cục bộ**.

```java
class Symbols {
    Vector symbols;
    Vector types;
    Vector positions;

    Type getType(Symbol s) {
        int i = symbols.indexOf(s);
        if (!(i >= 0))
            throw new RuntimeException("getType");
        ...
    }
    ...
}

class Compiler {
    Symbols symbols;
    ...

    void compile() {
        try {
            parse();
            typecheck();
            optimize();
            generate();
        } catch (RuntimeException e) {
            System.out.println("Failed at: " + e.getMessage());
        }
    }

    void typecheck() {
        ...
        Type t = symbols.getType(s);
        ...
    }
}
```

### Cách ngoại lệ hoạt động trong ví dụ

- Assertion trong `getType` thất bại → một ngoại lệ được **throw**.
- Điều này không chỉ dừng thực thi `getType` mà cả `typecheck` — **người gọi** nó.
- Thực thi **mọi người gọi** trong **ngăn xếp lời gọi** bị dừng, cho tới khi chạm tới một phương thức như `compile` có **bộ xử lý** cho ngoại lệ.
- Giờ điều khiển được **chuyển sang bộ xử lý** (nhãn `catch`), mã của nó được thực thi.

### `throw` truyền kèm đối tượng

Lệnh `throw` không **chỉ** chuyển điều khiển — nó còn **truyền một đối tượng**. Điều này cho phép **truyền thông tin về thất bại**.

- Hàm khởi tạo ngoại lệ nhận **chuỗi thông điệp** — được trích xuất trong bộ xử lý.
- Ở đây dùng để truyền thông tin **về vị trí trong mã** xảy ra thất bại — chiến lược phổ biến.
- Có thể làm **hữu ích hơn** bằng chi tiết thêm, như **ký hiệu cụ thể** đang được tra.

---

## 6. Ngoại lệ cho kết quả đặc biệt

> Ngoại lệ **không chỉ** cho xử lý thất bại. Chúng có thể dùng để **cải thiện cấu trúc** của mã involves các thủ tục có **kết quả đặc biệt**.

### Cách chuẩn (và vấn đề của nó)

Cách chuẩn xử lý kết quả đặc biệt: **trả giá trị đặc biệt**. Thao tác tra cứu trong thư viện Java thường thiết kế vậy: nhận **chỉ số -1** khi mong số nguyên dương, hoặc **tham chiếu null** khi mong đối tượng.

Cách này **ỔN nếu dùng tiết kiệm**. Hai vấn đề:

1. Kiểm tra giá trị trả về **nhàm chán**.
2. **Dễ quên** làm việc đó. *(Với ngoại lệ, bạn được **trình biên dịch giúp** — xem mục 8.)*

### Vấn đề: tìm "giá trị đặc biệt" không dễ

Giả sử lớp `BirthdayBook` có phương thức tra cứu. Một chữ ký khả dĩ:

```java
Date lookup(String name)
```

Phương thức nên làm gì nếu **không có** mục cho tên given? Có thể trả **ngày đặc biệt** không bao giờ dùng làm ngày thật. Lập trình viên dở đã làm vậy hàng thập kỷ — trả **9/9/99**, vì rõ ràng chương trình viết năm 1960 không còn chạy cuối thế kỷ.

### Cách tốt hơn: ném ngoại lệ

```java
Date lookup(String name) throws NotFoundException {
    ...
    if (/* not found */
        throw new NotFoundException();
    ...
}
```

Người gọi xử lý bằng `catch`. Giờ **không cần** giá trị đặc biệt, **không cần** kiểm tra kèm nó.

### Cảnh báo về `null`

> Người viết Java mới thường mắc lỗi dùng **tham chiếu null** làm giá trị đặc biệt. Đây là **ý tưởng xấu**, có thể dẫn đến mã **đầy vấn đề dereference null**.

---

## 7. Lạm dụng ngoại lệ

Ví dụ của Bloch (Item 39):

```java
try {
    int i = 0;
    while (true)
        a[i++].f();
} catch (ArrayIndexOutOfBoundsException e) { }
```

**Mã này làm gì?** Hoàn toàn **không rõ** khi đọc — và đó là đủ lý do **không dùng nó**. Vòng lặp vô hạn kết thúc bằng cách **throw, catch và bỏ qua** `ArrayIndexOutOfBoundsException` khi cố truy cập phần tử đầu tiên **ngoài biên** mảng. Nó **được cho là** tương đương:

```java
for (int i = 0; i < a.length; i++)
    a[i].f();
```

### Vì sao nó sai

**1. Lý luận sai.**
Thần thức dựa trên hy vọng cải thiện hiệu năng với suy luận lỗi: vì VM **đã kiểm tra biên** truy cập mảng, phép kiểm tra kết thúc vòng lặp chuẩn `i < a.length` là **thừa** nên nên tránh. Thực tế: vì ngoại lệ trong Java được thiết kế dùng **chỉ trong hoàn cảnh đặc biệt**, **rarely, nếu có** nào, JVM tối ưu hóa hiệu năng của chúng.

> Trên máy典型, thần thức dựa trên ngoại lệ **chậm 70 lần** so với chuẩn khi lặp từ 0 tới 99.

**2. Không được đảm bảo hoạt động.**
Giả sử tính toán `f()` trong thân vòng lặp chứa bug dẫn đến truy cập **ngoài biên** một mảng **không liên quan**:

| Thần thức | Hậu quả |
|---|---|
| Vòng lặp chuẩn | Bug sinh ngoại lệ **không bị bắt** → thread **dừng ngay** với thông điệp lỗi phù hợp |
| Thần thức ngoại lệ | Ngoại lệ liên quan bug **bị bắt** và **hiểu sai** là kết thúc vòng lặp bình thường |

---

## 8. Checked và unchecked exceptions

### Hai mục đích → hai loại ngoại lệ

Đã thấy hai mục đích khác nhau: **thất bại** và **kết quả đặc biệt**. Java cung cấp **hai loại** ngoại lệ cho hai mục đích này.

> Chúng **cùng hành vi** khi chạy; **khác biệt duy nhất** là loại **kiểm tra** nào trình biên dịch cung cấp.

### Checked exception

- Nếu một phương thức **có thể** ném checked exception, khả năng đó **phải được khai báo** trong chữ ký — `NotFoundException` sẽ là checked, đó là vì chữ ký kết thúc `throws NotFoundException`.
- Phương thức gọi phương thức có thể ném checked exception **phải** hoặc **xử lý** nó, hoặc **khai báo chính nó** (vì nếu không bắt cục bộ nó sẽ được **lan truyền**).

> Nếu bạn gọi `lookup` và **quên** xử lý, trình biên dịch **từ chối** mã.

Đây rất hữu ích — đảm bảo các ngoại lệ **mong đợi xảy ra** nên được xử lý.

### Unchecked exception

- Ngược lại, trình biên dịch **không kiểm tra** try-catch hay khai báo `throws`.
- Java vẫn **cho phép** bạn ghi `throws` cho unchecked — nhưng **không có hiệu lực** (vì thế hơi buồn cười, **khuyến nghị không làm**).

### Bảng tổng hợp

| | Checked | Unchecked |
|---|---|---|
| Mục đích | **Kết quả đặc biệt** (mong đợi) | **Thất bại** (bất ngờ) |
| Kiểm tra của compiler | **Có** — phải khai báo `throws` hoặc `try-catch` | **Không** |
| Xử lý ở đâu | Ở mọi tầng có khả năng chạm | Thường **chỉ tầng trên cùng** |
| Lý do | Để xử lý dự kiến được | **Lý do mô-đun**: không muốn khai báo khả năng thất bại **mọi tầng** |

### Thông điệp

Mọi error và exception **có thể** có thông điệp kèm. Nếu không cung cấp trong hàm khởi tạo, tham chiếu chuỗi thông điệp là `null`.

---

## 9. Ngoại lệ và tiền điều kiện

### Tiền điều kiện không có nghĩa "phải kiểm tra"

> Điều then chốt phải hiểu: tiền điều kiện **không yêu cầu** việc kiểm tra phải được thực hiện. **Ngược lại**, cách dùng phổ biến nhất của tiền điều kiện là **đòi hỏi** một tính chất **chính xác vì nó khó hoặc đắt để kiểm tra**.

### Tiền điều kiện làm phương thức **bán phần** (partial)

- **Bất tiện** cho khách hàng: họ phải đảm bảo **không gọi** phương thức ở trạng thái xấu (vi phạm tiền điều kiện); nếu vi phạm, **không có cách khôi phục dự đoán được**.
- Vì lý do này, người dùng **không thích** tiền điều kiện → các phương thức của **thư viện thường là tổng** (total).
- Đó là lý do các lớp **API Java** luôn **ném ngoại lệ** khi đối số không phù hợp → làm chương trình dùng chúng **bền hơn**.

### Khi tiền điều kiện lại có lợi

**1. Viết mã hiệu quả hơn.**

Ví dụ, trong hiện thực hóa **cây nhị phân**, có phương thức private cân bằng cây. Nó có nên xử lý trường hợp **thứ tự bất biến của cây không đúng**? Rõ ràng **không** — kiểm tra sẽ **đắt**. Bên trong lớp hiện thực hóa cây, **hợp lý khi giả định** bất biến đúng.

**2. Không phá mục đích.**

Trong thư viện chuẩn Java, các phương thức **tìm kiếm nhị phân** của lớp `Arrays` yêu cầu mảng given **đã sắp xếp**. Kiểm tra mảng có sắp xếp sẽ **phá hỏng toàn bộ mục đích** tìm kiếm nhị phân: có kết quả theo **logarithm**, không phải tuyến tính.

### Quyết định: phán đoán kỹ thuật

Hai yếu tố then chốt:

| Yếu tố | Nội dung |
|---|---|
| **Chi phí kiểm tra** | Cả khi viết lẫn khi thực thi |
| **Phạm vi của phương thức** | Chỉ gọi cục bộ trong lớp → tiền điều kiện có thể được **đảm bảo** bằng cách cẩn thận kiểm tra mọi điểm gọi. Phương thức **public**, dùng bởi nhà phát triển khác → dùng tiền điều kiện **ít khôn ngoan hơn** |

### Nếu dùng tiền điều kiện và muốn kiểm tra

> Nếu tiền điều kiện bị vi phạm, nên ném **unchecked exception**.

Khách hàng **không thể được kỳ vọng** xử lý ngoại lệ — vì họ **không đủ thông tin** để thiết lập lời gọi đúng ngay từ đầu.

---

## 10. Cân nhắc thiết kế

### Quy tắc đã nêu

> Dùng **checked exception cho kết quả đặc biệt**, **unchecked exception để báo thất bại**.

Quy tắc hợp lý, nhưng **không phải cuối cùng**. Nút thắt: ngoại lệ Java **không nhẹ nhàng** như vẻ ngoài.

### Chi phí thực của ngoại lệ Java

| Chi phí | Chi tiết |
|---|---|
| **Hiệu năng** | (nhẹ hơn so với cái sau) |
| **Phiền toái** (nghiêm trọng hơn) | Thiết kế phương thức có ngoại lệ riêng → phải tạo **lớp mới**. Gọi phương thức ném checked → phải **bọc try-catch** (dù **biết chắc** không bao giờ ném) |

### Nghịch cảnh hàng đợi

Thiết kế **kiểu trừu tượng hàng đợi**. `pop` khi hàng đợi rỗng có nên ném **checked** không? Giả sử muốn hỗ trợ phong cách: pop **trong vòng lặp** cho tới khi ngoại lệ → chọn checked. Giờ một khách hàng khác muốn dùng trong ngữ cảnh: **trước khi pop**, kiểm tra hàng đợi không rỗng rồi mới pop. **Bực bội thay**, khách đó **vẫn phải** bọc lời gọi trong try-catch.

### Quy tắc tinh chỉnh (giáo trình, p. 73)

- Dùng **unchecked exception** **chỉ khi** mong đợi khách hàng **thường** viết mã đảm bảo ngoại lệ **không xảy ra** — vì có cách **tiện lợi và rẻ** để tránh nó, **hoặc** vì ngoại lệ phản ánh **thất bại bất ngờ**.
- **Ngược lại** → dùng **checked exception**.

### Tại sao nhiều API Java dùng `null`

Chi phí dùng ngoại lệ Java là một lý do nhiều API Java dùng **tham chiếu null** làm giá trị đặc biệt. **Không phải việc tồi**, miễn là **dùng thận trọng** và **đặc tả cẩn thận**.

---

## 11. Phân cấp Throwable

```
          Throwable
          /       \
     Exception    Error
         |
  RuntimeException
```

| Lớp | Đặc điểm |
|---|---|
| **`Throwable`** | Lớp của đối tượng **có thể throw hoặc catch**. Mọi đối tượng dùng trong `throw`/`catch` hay khai báo trong `throws` **phải** là lớp con của `Throwable`. Hiện thực hóa của nó ghi **stack trace** tại điểm ném, kèm chuỗi mô tả (tùy chọn) |
| **`Error`** | Dành riêng cho lỗi do **hệ thống runtime Java** sinh ra: `StackOverflowError`, `OutOfMemoryError`. Đáng chú ý: `AssertionError` **cũng** extends `Error` dù báo lỗi **mã người dùng**. Error nên coi là **không thể phục hồi** (recoverable typo trong nguồn — nghĩa là không nên cố phục hồi), nhìn chung **không bắt** |
| **`RuntimeException`** | Lớp cha của các unchecked throwables **bạn nên** tạo (trực tiếp hoặc gián tiếp) |

### Quy tắc

| Quy tắc | Nội dung |
|---|---|
| **`Error` + `RuntimeException`** | Tương ứng **unchecked** exceptions |
| **Mọi `Throwable`/`Exception` còn lại** | **Checked** |
| **Không định nghĩa** throwable nào không phải con của `Exception`, `RuntimeException`, hoặc `Error` | — |

Tất cả throwable **bạn hiện thực hóa** không checked nên subclass `RuntimeException`.

---

# Phần II — Bằng nhau (Bài 12)

> **Bạn sẽ học:** bằng nhau của đối tượng và hash code; cách thỏa **hợp đồng Object**.
>
> **Vì sao học:** khi đối tượng của bạn **xáo trộn** trong chương trình — vào/ra các collection ví dụ — chúng **thỉnh thoảng được kiểm bằng nhau**; nếu bạn **không nghĩ kỹ** ý nghĩa đó với lớp bạn, hậu quả là bug có hiệu ứng **rất phi cục bộ**, khó truy vết.
>
> **Giả định:** đọc thông thạo đặc tả, khá quen classes sưu tập Java và dùng hash map.

## 12. Hợp đồng Object

### Hai phương thức quan trọng

Trong Java, mọi lớp extend `Object` → kế thừa mọi phương thức của nó. Hai phương thức **đặc biệt quan trọng và hệ quả** trong mọi chương trình:

```java
public boolean equals(Object o);
public int hashCode();
```

Giống mọi phương thức lớp cha khác, chúng **có thể override**. Bài sau sẽ thấy lớp con **nên là kiểu con** — nghĩa là nên hành xử **theo đặc tả của lớp cha**, để đối tượng lớp con đặt vào ngữ cảnh mong đợi đối tượng lớp cha vẫn hành xử phù hợp.

> Lớp override `equals` và `hashCode` nên **tuân thủ tỉ mỉ** đặc tả của chúng.

### Vì sao quan trọng

- Đặc tả lớp `Object` trong tài liệu khá **trừu tượng** và có vẻ **khó hiểu** (abstruse).
- Nhưng **không tuân thủ** → hệ quả **khủng khiếp**, thường sinh bug **vô cùng mơ hồ**.
- Tệ hơn: không hiểu đặc tả và hệ quả của nó → likely giới thiệu **khiếm khuyết** có hiệu ứng **toàn diện** (pervasive), khó loại bỏ mà không **tái cấu trúc lớn**.

Đặc tả quan trọng đến mức thường được gọi là **"Hợp đồng Object"** (The Object Contract) — nằm trong đặc tả các phương thức `equals` và `hashCode` trong tài liệu API Java:

| Điều khoản | Nội dung |
|---|---|
| **1** | `equals` phải định nghĩa **quan hệ tương đương** (equivalence relation) — tức là **phản xạ** (reflexive), **đối xứng** (symmetric), **truyền** (transitive) |
| **2** | `equals` phải **nhất quán** (consistent): các lời gọi lặp lại phải trả **cùng kết quả** trừ khi đối số bị sửa đổi giữa hai lần gọi |
| **3** | Với tham chiếu khác null `x`, `x.equals(null)` phải trả `false` |
| **4** | `hashCode` phải trả **cùng kết quả** cho hai đối tượng được `equals` coi là bằng nhau |

---

## 13. Bằng nhau và kế thừa — phá vỡ đối xứng

### Ba tính chất

Tạm bỏ `hashCode`, xét tính chất của `equals`:

| Tính chất | Định nghĩa | Vì sao hiển nhiên |
|---|---|---|
| **Phản xạ** | Đối tượng luôn bằng chính nó | Không đúng thì khó tưởng tượng `equals` dùng thế nào |
| **Đối xứng** | Khi `a` bằng `b` thì `b` bằng `a` | Nếu không, phải lo không biết viết `a.equals(b)` hay `b.equals(a)` |
| **Truyền** | Khi `a` bằng `b` và `b` bằng `c` thì `a` bằng `c` | Như trên |

> Điều **ít hiển nhiên hơn nhiều**: những tính chất này **dễ phá vô tình** đến mức nào.

### Bước 1: lớp Duration

```java
public class Duration {
    private final int day;
    private final int sec;

    public Duration(int day, int sec) {
        this.day = day;
        this.sec = sec;
    }

    public boolean equals(Object o) {
        if (!(o instanceof Duration))
            return false;
        Duration d = (Duration) o;
        return d.day == day && d.sec == sec;
    }
}
```

- `equals` nhận `Object` — **bắt buộc bởi hợp đồng object**.
- Trả `true` nếu đối tượng truyền vào là `Duration` và lưu **cùng khoảng thời gian**.

### Bước 2: thêm lớp con NanoDuration

Cần thêm độ chính xác nano giây:

```java
public class NanoDuration extends Duration {
    private final int nano;

    public NanoDuration(int day, int sec, int nano) {
        super(day, sec);
        this.nano = nano;
    }
}
```

`equals` của `NanoDuration` nên thế nào?

**Phương án A — kế thừa:**

```java
// kế thừa từ Duration
```

Hai `NanoDuration` **vẫn bị coi là bằng** dù khác nano giây → sai.

**Phương án B — override:**

```java
public boolean equals(Object o) {
    if (!(o instanceof NanoDuration))
        return false;
    NanoDuration nd = (NanoDuration) o;
    return super.equals(nd) && nano == nd.nano;
}
```

### Phá vỡ ĐỐI XỨNG

```java
Duration d = new Duration(1, 12);
NanoDuration nd = new NanoDuration(1, 12, 123);

System.out.println(d.equals(nd));   // true
System.out.println(nd.equals(d));   // false! — không đối xứng
```

`d.equals(nd)` trả `true` nhưng `nd.equals(d)` trả `false`. **Vấn đề:** hai biểu thức này dùng **hai phương thức `equals` khác nhau** — cái đầu dùng bản của `Duration` (bỏ qua nano), cái sau dùng bản của `NanoDuration`.

### Phương án C: sửa để giữ đối xứng → phá TRUYỀN

```java
public boolean equals(Object o) {
    if (!(o instanceof Duration))
        return false;
    // nếu o là Duration thường, so sánh không cần trường nano
    if (!(o instanceof NanoDuration))
        return super.equals(o);
    NanoDuration nd = (NanoDuration) o;
    return super.equals(nd) && nano == nd.nano;
}
```

Giải quyết đối xứng — nhưng giờ bằng nhau **không truyền**:

```java
NanoDuration d1 = new NanoDuration(1, 12, 123);
Duration d2 = new Duration(1, 12);
NanoDuration d3 = new NanoDuration(1, 12, 999);

System.out.println(d1.equals(d2));   // true
System.out.println(d2.equals(d3));   // true
System.out.println(d1.equals(d3));   // false! — không truyền
```

### Kết luận

> **Không có giải pháp cho vấn đề này**: đây là **khiếm khuyết cơ bản trong kế thừa**. Bạn **không thể** viết phương thức `equals` tốt cho `NanoDuration` nếu nó kế thừa `Duration` như đã viết.

Tuy nhiên, có **hai cách giải quyết** (workaround) — xem mục 14.

### Bẫy khác: thay `Object` bằng kiểu khác

Bloch gợi ý vài bẫy phổ biến. Ví dụ, chuyện gì xảy ra nếu viết:

```java
public boolean equals(Duration d)   // thay Object bằng Duration
```

*(Đây **không phải** override — chữ ký khác — và hợp đồng không được áp dụng.)*

---

## 14. Hai cách giải quyết và bài học từ java.sql.Timestamp

### Cách 1: lớp cha từ chối bằng với lớp con — so sánh `getClass()`

```java
public class Duration {
    //...
    public boolean equals(Object o) {
        if (o == null || !o.getClass().equals(getClass()))
            return false;
        Duration d = (Duration) o;
        return d.day == day && d.sec == sec;
    }
    //...
}
```

So sánh lớp tường minh là **kiểm tra mạnh hơn** `instanceof`: `NanoDuration` là `instanceof Duration`, nhưng `NanoDuration.getClass() != Duration.getClass()`.

**Hạn chế:** mất khả năng các lớp con **vô hại** so bằng với `Duration`. Ví dụ viết lớp con `ArithmeticDuration` **không thêm thuộc tính mới**, chỉ cung cấp phương thức cộng/trừ khoảng thời gian — với cách này, `ArithmeticDuration` **không bao giờ** bằng `Duration` dù nội bộ cùng giá trị `(day, sec)`.

### Cách 2: composition thay vì kế thừa

```java
public class NanoDuration {
    final Duration d;
    final int nano;
    //...
}
```

Vì `NanoDuration` **không còn** extend `Duration`, vấn đề **biến mất**. Chiến lược này gọi là **composition** — sẽ thấy nhiều hơn ở bài sau (Bài 15/16).

### Bài học thực tế: `java.util.Date` và `java.sql.Timestamp`

Vấn đề dựa trên **hai lớp Java có thật**: `Timestamp` extend `Date` bằng cách thêm trường nano — **đúng như** ví dụ trên. Gây **nhiều vấn đề** đến mức các bản đặc tả gần đây của `Timestamp` **đầy cảnh báo và phức tạp**:

> *"Lưu ý: kiểu này là tổ hợp của `java.util.Date` và một giá trị nano giây riêng. Chỉ **giây nguyên** được lưu trong thành phần `java.util.Date`. Phần giây phân số — nanos — riêng biệt. Phương thức `Timestamp.equals(Object)` **không bao giờ trả true** khi nhận giá trị kiểu `java.util.Date` vì thành phần nanos của một date là **không biết**. Kết quả: `Timestamp.equals(Object)` **không đối xứng** với `java.util.Date.equals(Object)`. Hơn nữa, `hashCode` dùng hiện thực hóa `java.util.Date` nền nên **không tính nanos**.*
>
> *Do các khác biệt giữa `Timestamp` và `java.util.Date` nói trên, **khuyến nghị mã không xem giá trị `Timestamp` như đối tượng `java.util.Date`**. Quan hệ kế thừa giữa `Timestamp` và `java.util.Date` thực sự biểu thị **kế thừa hiện thực hóa** (implementation inheritance), **không phải kế thừa kiểu** (type inheritance)."*

Ở đoạn cuối, các nhà thiết kế về bản chất **buông tay** và nói cách duy nhất giải quyết vấn đề là **từ chối** tư cách cha của `Timestamp`, xử lý nó như lớp **hoàn toàn riêng** với `Date`. Nhìn lại, điều này có thể đã làm bằng cách **dùng `Date` trong hiện thực hóa** `Timestamp`, thay vì dùng nó trong **đặc tả**.

> **Bài học:** kế thừa chỉ hợp lý khi lớp con là **kiểu con thật** (xem tài liệu 05, mục 17) — nếu không, dùng composition.

---

## 15. Bằng nhau và hiệu năng — bảng băm

### Bảng băm hoạt động thế nào

Để hiểu phần hợp đồng liên quan `hashCode`, cần biết **bảng băm** (hash table) hoạt động thế nào:

> Bảng băm là **phát minh tuyệt vời** — một trong những ý tưởng tốt nhất của khoa học máy tính. Bảng băm là **biểu diễn** cho một **ánh xạ** (mapping): một kiểu dữ liệu trừu tượng **ánh xạ key → value**.

- Tra cứu **hằng số** → thường **tốt hơn** cây hay danh sách.
- Key **không cần sắp xếp**, không cần tính chất đặc biệt nào — ngoài việc cung cấp `equals` và `hashCode`.

**Cơ chế:**

1. Bảng băm chứa một **mảng** được khởi tạo với cỡ tương ứng số phần tử dự kiến chèn.
2. Khi trao key và value để chèn: **tính hashCode của key**, đổi thành **chỉ số trong phạm vi mảng** (vd chia lấy dư).
3. Value được chèn tại chỉ số đó.
4. Hashcode được thiết kế để key **rải đều** trên các chỉ số.
5. Thỉnh thoảng **xung đột** (conflict) — hai key cùng chỉ số. Vì thế mỗi chỉ số không giữ một value mà giữ một **danh sách cặp key/value** (gọi là **hash bucket**), trong Java là đối tượng có hai trường.
6. **Chèn:** thêm một cặp vào danh sách tại slot do hash code xác định. **Tra cứu:** hash key, tìm đúng slot, rồi so từng cặp tới khi tìm được key khớp.

### Vì sao hợp đồng yêu cầu equal ⇒ cùng hashCode

> Nếu hai đối tượng bằng nhau có **hash key khác nhau**, chúng có thể bị đặt ở **slot khác nhau**. Khi dùng key **bằng** key đã chèn để tra, tra cứu **có thể thất bại**.

### Cách "an toàn" nhưng dở: trả hằng số

```java
public int hashCode() {
    return 1;
}
```

Thoả hợp đồng, nhưng **hậu quả thảm họa**: mọi key cùng một slot, mọi tra cứu **suy biến** thành tìm tuyến tính theo danh sách dài.

### Chuẩn để xây hashCode hợp lệ

Tính hashCode cho **mỗi thành phần** của đối tượng **tham gia quyết định bằng nhau** (thường gọi `hashCode` của từng thành phần), rồi **kết hợp** chúng với vài phép số học. Chi tiết xem *Effective Java*.

### Duration: các mức hashCode

Giả sử `a.equals(b)` khi cùng trường `day` và `sec`:

```java
// Luôn an toàn, nhưng làm bảng băm hoàn toàn kém hiệu quả
public int hashCode() {
    return 1;
}

// An toàn; nhưng xung đột cho Duration chỉ khác sec
public int hashCode() {
    return day;
}

// An toàn; xung đột có thể nhưng không có vẻ xảy ra có hệ thống
public int hashCode() {
    return day + sec;
}
```

### Thay đổi equals ⇒ phải xem lại hashCode

Giả sử đổi ý tưởng bằng nhau của `Duration`:

```java
public boolean equals(Object o) {
    if (!(o instanceof Duration))
        return false;
    Duration d = (Duration) o;
    return 24*60*60*day + sec == 24*60*60*d.day + d.sec;
}
```

Giờ `day`/`sec` **không cần giống hệt** — chỉ cần **tổng số giây** bằng. `hashCode` là `day` hay `day+sec` **không còn hoạt động** vì hai Duration bằng nhau có thể nhận hashCode khác:

```java
public int hashCode() {
    return 24*60*60*day + sec;   // hoạt động
}
```

> **Khi hành vi `equals` thay đổi, ta phải xem lại `hashCode` còn an toàn không.**

### Bản mặc định từ Object — không phù hợp

`hashCode` mặc định kế thừa từ `Object` **dựa trên địa chỉ đối tượng** trong bộ nhớ. Nó **hoạt độngfine** nếu đối tượng **chỉ bằng chính nó**. Nhưng khi tạo **hai đối tượng muốn coi là bằng** (hai `Duration` cùng `day`/`sec`), hash code này **không phù hợp** — có thể cho hai đối tượng bằng nhau **mã khác nhau**.

---

## 16. Quy tắc: luôn override hashCode khi override equals

> **Always override `hashCode` when you override `equals`.**
>
> *(Đây là một trong những aphorism của Bloch.)*

### Nếu không override hashCode

- Bạn nhận bản từ `Object` — dựa trên **địa chỉ** đối tượng.
- Nếu đã override `equals` → bạn **gần như chắc chắn vi phạm** hợp đồng.

### Truyền thuyết về lỗi chính tả

Nhiều năm trước, theo truyền thuyết, một sinh viên 6.170 dành **nhiều giờ** truy bug trong một project không hơn gì lỗi **đánh máy `hashCode` thành `hashcode`**. Việc này tạo một phương thức **không override** `hashCode` của `Object` **mấy**, và những sự kỳ lạ xảy ra...

---

## 17. Bảng thuật ngữ và bài tập

### Bảng thuật ngữ (Anh – Việt)

| Tiếng Anh | Tiếng Việt |
|---|---|
| defensive programming | lập trình phòng thủ |
| invariant | bất biến |
| runtime assertion | assertion runtime |
| non-local jump | nhảy không cục bộ |
| special result | kết quả đặc biệt |
| checked / unchecked exception | ngoại lệ được kiểm tra / không được kiểm tra |
| precondition (partial / total method) | tiền điều kiện (phương thức bán phần / tổng) |
| self check | kiểm tra tự thân |
| object contract | hợp đồng Object |
| equivalence relation | quan hệ tương đương |
| reflexive / symmetric / transitive | phản xức / đối xứng / truyền |
| consistency (of equals) | tính nhất quán |
| hash code / hash table / hash bucket | mã băm / bảng băm / xô băm |
| collision | xung đột |
| override (glossary) | ghi đè |
| composition | tổng hợp / kết hợp |
| implementation vs type inheritance | kế thừa hiện thực hóa / kế thừa kiểu |
| stack trace | dấu vết ngăn xếp |
| dereference | gián tiếp tham chiếu |

### Bài tập suy nghĩ

1. Trong ví dụ `Symbols`, vì sao nên dừng **sau lệnh đầu tiên** thay vì để `types.get(i)` thất bại? Áp dụng nguyên tắc này cho một bài toán bạn đã gặp.
2. Viết một assertion **ở giữa** một phương thức bạn từng viết: nó kiểm tính chất gì?
3. `lookup` trả `NotFoundException` (checked): với quy tắc tinh chỉnh ở mục 10, có trường hợp nào nên đổi sang unchecked không?
4. Chứng minh rằng "phương án C" của `NanoDuration` phá vỡ tính **truyền**, với các giá trị số cụ thể bạn tự chọn.
5. Với `equals` mới của `Duration` (tổng giây), vì sao `hashCode = day` không còn an toàn? Tìm một cặp Duration bằng nhau nhưng `day` khác.
6. Tại sao `assert` là unchecked error (`AssertionError extends Error`) chứ không phải exception? Điều đó có ý nghĩa gì với việc xử lý nó?

---

*Nguồn: MIT 6.170 Lecture 11 (Assertions and Exceptions), Lecture 12 (Identity and Equality I), Fall 2005.*
