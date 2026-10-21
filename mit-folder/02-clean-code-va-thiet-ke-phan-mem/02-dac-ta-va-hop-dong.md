# Đặc tả và hợp đồng (Specifications and Contracts)

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering* — **Bài 4: Procedure Specifications** (Fall 2005).

---

## Mục lục

1. [Giới thiệu: đặc tả là điểm then chốt của làm việc nhóm](#1-giới-thiệu-đặc-tả-là-điểm-then-chốt-của-làm-việc-nhóm)
2. [Hợp đồng, tường lửa và decoupling](#2-hợp-thồng-tường-lửa-và-decoupling)
3. [Đẳng thức hành vi](#3-đẳng-thức-hành-vi)
4. [Cấu trúc của một đặc tả](#4-cấu-trúc-của-một-đặc-tả)
5. [Đặc tả cho hàm tìm kiếm: ba mức](#5-đặc-tả-cho-hàm-tìm-kiếm-ba-mức)
6. [Đặc tả cho hàm thay đổi trạng thái](#6-đặc-tả-cho-hàm-thay-đổi-trạng-thái)
7. [Đặc tả khai báo so với đặc tả vận hành](#7-đặc-tả-khai-báo-so-với-đặc-tả-vận-hành)
8. [Thứ tự đặc tả: khi nào thay thế được nhau](#8-thứ-tự-đặc-tả-khi-nào-thay-thế-được-nhau)
9. [Đánh giá một đặc tả tốt](#9-đánh-giá-một-đặc-tả-tốt)
10. [Tóm tắt và bài tập](#10-tóm-tắt-và-bài-tập)

---

## 1. Giới thiệu: đặc tả là điểm then chốt của làm việc nhóm

Đặc tả (specification) của một phương thức là **ghế tựa (linchpin)** của làm việc nhóm. Không thể ủy thác trách nhiệm hiện thực hóa một phương thức nếu không có đặc tả. Đặc tả hoạt động như một **hợp đồng**:

- Người hiện thực hóa (implementor) chịu trách nhiệm đáp ứng hợp đồng.
- Khách hàng (client) dùng phương thức có thể tin tưởng vào hợp đồng.
- Giống hợp đồng pháp lý thực, đặc tả đặt yêu cầu cho **cả hai bên**: khi có tiền điều kiện (precondition), khách hàng cũng có trách nhiệm.

### Vì sao có rất nhiều lỗi nghiêm trọng?

Nhiều lỗi xấu xí nhất trong chương trình sinh ra do **sự hiểu lầm về hành vi tại các giao diện**. Mặc dù mọi lập trình viên đều có đặc tả trong đầu, không phải ai cũng viết chúng xuống. Hậu quả: các lập trình viên khác nhau trong nhóm mang các đặc tả **khác nhau**. Khi chương trình hỏng, rất khó xác định lỗi ở đâu.

Đặc tả chính xác trong mã cho phép bạn **phân bổ trách nhiệm** (cho các đoạn mã, không phải cho con người!) và cứu bạn khỏi sự dày vò khi tự hỏi sửa nên đi đâu.

### Lợi ích cho khách hàng

Đặc tả **tiết kiệm việc phải đọc mã**. Nếu chưa tin đọc đặc tả dễ hơn đọc mã, hãy nhìn đặc tả chuẩn của Java và so với mã nguồn hiện thực hóa chúng. `Vector` trong `java.util` có đặc tả rất đơn giản nhưng mã của nó **không hề đơn giản**.

### Lợi ích cho người hiện thực hóa

- Được **tự do thay đổi hiện thực hóa** mà không cần báo cho khách hàng.
- Có thể làm mã **nhanh hơn**: đặc tả yếu hơn đôi khi cho phép hiện thực hóa hiệu quả hơn nhiều. Cụ thể, tiền điều kiện có thể loại trừ các trạng thái mà nếu không có nó, phương thức sẽ phải tốn công kiểm tra đắt đỏ không còn cần thiết.

---

## 2. Hợp đồng, tường lửa và decoupling

### 2.1 Thành phần có thể thay thế trong kỹ thuật truyền thống

Trong các ngành kỹ thuật truyền thống, sản phẩm thường được lắp từ các thành phần mua sẵn, được **chọn dựa trên đặc tả**. Đây là vai trò then chốt của đặc tả, và phần mềm cũng đóng vai trò đó.

Thật không may, **thành phần phần mềm phần lớn vẫn là khát vọng chưa thành hiện thực**:

- Có thành phần nhỏ (thư viện xử lý chuỗi) và thành phần lớn (cơ sở dữ liệu quan hệ), nhưng rất ít thứ ở giữa.
- Thành phần cỡ trung bình có vẻ cứng nhắc và đưa ra các giả định mâu thuẫn về cấu trúc của chương trình nhúng chúng. Vì vậy, dùng một cái thường có nghĩa là không thể dùng cái kia.
- Và phần mềm nổi tiếng không tin cậy được, nên đặc tả của nó thường không được coi trọng.

Hai bản miễn trừ trào phúng (ACM Software Engineering Notes, Vol. 12, No. 3, 1987) — trích lại để nhấn mạnh thực tế:

> "Cosmotronic Software Unlimited Inc. không bảo đảm chức năng nào trong chương trình sẽ đáp ứng yêu cầu của bạn... Công ty chỉ bảo đảm đĩa mềm màu đen và hình vuông trong chín mươi ngày."

> "Chúng tôi không khẳng định Interactive EasyFlow có ích cho gì... Nếu bạn mất một triệu vì nó: bạn mất, không phải chúng tôi. Chúng tôi bảo lưu quyền làm tối thiểu pháp luật cho phép, kể cả không làm gì."

### 2.2 Hợp đồng là một hàm ngụ ý

Hợp đồng đặc tả áp đặt nghĩa vụ cho **cả khách hàng và người hiện thực hóa**, được hiểu dưới dạng một **hàm ngụ ý**:

```
client-meets-obligation  =>  implementor-meets-obligation
(khách hàng làm tròn nghĩa vụ  =>  người hiện thực hóa làm tròn nghĩa vụ)
```

Ví dụ hợp đồng với công ty điện lực: bạn không được vượt quá tải cho phép; công ty cung cấp điện ở mức điện áp cố định với dao động nhỏ. Bạn không vượt tải → công ty giữ điện áp. Bạn lắp trại máy chủ 1 megawatt trong tầng hầm → công ty **không còn nghĩa vụ** cung cấp gì.

### 2.3 Hợp đồng là tường lửa

Hợp đồng hành động như một **tường lửa** giữa khách hàng và người hiện thực hóa:

| Chiều | Điều nó che chắn |
|---|---|
| Khách hàng | Không cần đọc mã nguồn của thủ tục nếu có đặc tả |
| Người hiện thực hóa | Không cần hỏi từng khách hàng định dùng thế nào |

Tường lửa này dẫn đến **decoupling** (tách rời): mã của đơn vị và mã của khách hàng **có thể thay đổi độc lập**, miễn là các thay đổi tôn trọng đặc tả — mỗi bên tuân nghĩa vụ của mình.

### 2.4 Hai vai trò khác biệt tinh tế của đặc tả

1. **Lập danh mục thành phần có thể tái sử dụng** — mục đích của đặc tả trong khung sưu tập Java collections.
2. **Điều tiết các kết nối giữa các mô-đun trong một thiết kế** — trong vai trò này, một đơn vị duy nhất có thể có **nhiều đặc tả**, một đặc tả cho mỗi khách hàng. Đặc tả định nghĩa mối quan hệ "uses" (dùng) giữa các mô-đun.

Khi hệ thống phát triển, các đặc tả là phần **ít bị ảnh hưởng nhất**. Do đó, có lẽ hơn bất cứ thứ gì khác, các đặc tả này **chính là đặc trưng của thiết kế phần mềm — chúng chính là thiết kế**.

Khi học về mẫu thiết kế (design patterns), sẽ thấy động cơ của hầu hết các mẫu là **cải thiện decoupling giữa các mô-đun**, và điều này thường đạt được bằng cách **giới thiệu đặc tả mới, yếu hơn** đặc tả dùng trong các thiết kế đơn giản hơn.

---

## 3. Đẳng thức hành vi

Xét hai hàm. Chúng giống nhau hay khác nhau?

```java
static int findA(int[] a, int val) {
    for (int i = 0; i < a.length; i++) {
        if (a[i] == val) return i;
    }
    return a.length;
}

static int findB(int[] a, int val) {
    for (int i = a.length - 1; i > 0; i--) {
        if (a[i] == val) return i;
    }
    return -1;
}
```

Mã khác nhau, nên theo nghĩa đó chúng khác nhau. Nhưng câu hỏi thực sự là: **có thể thay thế một hiện thực hóa bằng cái kia không?**

Không chỉ mã khác, chúng thực sự có **hành vi khác**:

| Tình huống | `findA` | `findB` |
|---|---|---|
| `val` không có mặt | trả về `a.length` | trả về `-1` |
| `val` xuất hiện hai lần | trả về chỉ số thấp hơn | trả về chỉ số cao hơn |
| `val` xuất hiện **đúng một lần** | giống hệt | giống hệt |

Có thể khách hàng **không bao giờ** dựa vào hành vi ở hai trường hợp đầu. Vì vậy khái niệm tương đương **nằm trong mắt người nhìn — tức là khách hàng**. Để có thể thay thế và biết khi nào chấp nhận được, cần một đặc tả nêu chính xác điều mà khách hàng dựa vào:

```
requires: val occurs in a          (tiền điều kiện: val xuất hiện trong a)
effects:  returns result such that a[result] = val
```

**Bài học:** đẳng thức hành vi không phải thuộc tính nội tại của mã — nó là mối quan hệ giữa mã và điều mà khách hàng tin tưởng.

---

## 4. Cấu trúc của một đặc tả

Đặc tả của một phương thức gồm vài mệnh đề:

| Mệnh đề | Từ khóa | Người chịu trách nhiệm | Ý nghĩa |
|---|---|---|---|
| Tiền điều kiện (precondition) | `requires` | **Khách hàng** (người gọi) | Điều kiện trên trạng thái khi gọi |
| Hậu điều kiện (postcondition) | `effects` | **Người hiện thực hóa** | Điều phải đúng sau khi thực hiện |
| Điều kiện khung (frame condition) | `modifies` | **Người hiện thực hóa** | Đối tượng nào được phép thay đổi |

### 4.1 Tiền điều kiện

- Là nghĩa vụ của khách hàng.
- Nếu tiền điều kiện **không đúng**, hiện thực hóa **được phép làm bất cứ thứ gì**: không kết thúc, ném ngoại lệ, trả về giá trị tùy ý, thay đổi tùy ý, v.v.
- Đây là lý do tiền điều kiện mạnh làm đời khách hàng khó khăn.

### 4.2 Hậu điều kiện

- Nếu tiền điều kiện đúng tại trạng thái gọi, phương thức **bắt buộc** tuân hậu điều kiện: trả về giá trị phù hợp, ném ngoại lệ đã chỉ rõ, thay đổi hoặc không thay đổi đối tượng, v.v.

### 4.3 Điều kiện khung (modifies)

Liên quan đến hậu điều kiện, giúp đặc tả **ngắn gọn hơn**. Không có nó, sẽ phải mô tả mọi đối tượng có thể truy cập được có thay đổi hay không — nhưng thường chỉ một phần nhỏ trạng thái bị thay đổi.

`modifies x` nghĩa là đối tượng `x` (giả định là có thể thay đổi) **có thể** bị sửa, nhưng **không đối tượng nào khác** được sửa. Vì vậy mệnh đề `modifies` thực chất là một khẳng định về các đối tượng **không được nhắc tới**:

- Đối tượng được nhắc: có thể sửa nhưng không bắt buộc.
- Đối tượng không được nhắc: **không được** sửa.

### 4.4 Các mệnh đề bị bỏ qua

| Mệnh đề bị bỏ | Giá trị mặc định | Hệ quả |
|---|---|---|
| `requires` | `true` | Mọi trạng thái gọi đều thỏa → không ràng buộc người gọi → phương thức là **toàn phần** (total) |
| `requires` không phải `true` | — | Phương thức là **bán phần** (partial) — chỉ hoạt động trên một số trạng thái |
| `modifies` | `modifies nothing` | Phương thức không thay đổi đối tượng nào |
| `effects` | — | **Không bao giờ** bỏ — vô nghĩa nếu bỏ |

---

## 5. Đặc tả cho hàm tìm kiếm: ba mức

### Mức 1 — Kết quả xác định (deterministic)

```
static int find(int[] a, int val)
requires: val occurs exactly once in a
effects:  returns result such that a[result] = val
```

Với trạng thái thỏa tiền điều kiện, kết quả **được xác định**. Cả `findA` và `findB` đều thỏa, nên theo đặc tả này hai hàm **tương đương và thay thế được cho nhau**.

### Mức 2 — Dưới xác định (under-determined)

```
static int find(int[] a, int val)
requires: val occurs in a
effects:  returns result such that a[result] = val
```

Đặc tả này **không** xác định. Thường được gọi là "bất định" (non-deterministic), nhưng cách gọi này **gây hiểu lầm**.

- **Code bất định** là code bạn mong đôi khi hành vi này, đôi khi hành vi kia (ví dụ: lập trình đồng thời, bộ lập lịch chọn thứ tự luồng).
- Đặc tả "bất định" không đòi hỏi sự bất định trong code — hành vi được đặc tả là **dưới xác định** (under-determined): đặc tả không nói chỉ số nào được trả về khi `val` xuất hiện nhiều lần; nó chỉ nói tra cứu tại chỉ số trả về sẽ thấy `val`.

Cả `findA` và `findB` đều thỏa, mỗi hàm "giải quyết" sự dưới xác định theo cách riêng. Khách hàng **không thể dự đoán** chỉ số nào sẽ trả về, nhưng cũng không nên mong hành vi thực sự bất định.

> Trong hầu hết mọi trường hợp chúng ta gặp, sự "bất định" trong đặc tả mang đến một **lựa chọn do người hiện thực hóa đưa ra tại thời điểm hiện thực hóa**, không phải tại runtime.

### Mức 3 — Phân biệt hai hàm

```
static int find(int[] a, int val)
effects: returns largest result such that
         a[result] = val or -1 if no such result
```

Đặc tả này được `findB` thỏa nhưng **không** được `findA` thỏa. Đây là đặc tả đủ chặt để loại một trong hai.

### Bảng so sánh

| Đặc tả | `findA` | `findB` | Ghi chú |
|---|---|---|---|
| `val occurs exactly once` | thỏa | thỏa | kết quả xác định |
| `val occurs` | thỏa | thỏa | dưới xác định |
| `largest result` (hoặc -1) | **không thỏa** | thỏa | phân biệt được |

---

## 6. Đặc tả cho hàm thay đổi trạng thái

Đặc tả `find` không có cơ hội minh họa điều kiện khung và mô tả hiệu ứng phụ. Sau đây là đặc tả cho hàm **mutate** đối tượng (lấy từ lớp `Vector` của Java, lược giản):

```java
class Vector {
    ...
    boolean addAll(Vector v)
        requires: v != null and v != this
        modifies: this
        effects:  adds the elements of v to the end of this,
                  and returns true if this changed as a result of call
}
```

Phân tích ba mệnh đề:

1. **`modifies: this`** — chỉ `this` bị sửa. Ngụ ý rất quan trọng: **tham số `v` không bị thay đổi** — với hầu hết khách hàng đây là thuộc tính then chốt.
2. **`effects`** — hai ràng buộc: cách `this` bị sửa, và cách giá trị trả về được xác định.
3. **`requires`** — hành vi không bị ràng buộc nếu truyền `v` là null, hoặc nếu tự thêm chính nó vào chính nó.

Vì sao người hiện thực hóa muốn loại trừ `v == this`? Ràng buộc này không loại bỏ ứng dụng hữu ích nào, nhưng **làm hiện thực hóa dễ hơn**: thuật toán đơn giản — lấy từng phần tử từ `v`, thêm vào `this`, tiếp tục đến hết `v`. Nếu `v` và `this` là cùng một vector, thuật toán **không bao giờ kết thúc** — một kết quả mà đặc tả cho phép.

**Bài học về mối quan hệ đặc tả – hiện thực hóa:** đặc tả yếu hơn cho phép hiện thực hóa đơn giản/hiệu quả hơn; tiền điều kiện là công cụ để đạt điều đó.

---

## 7. Đặc tả khai báo so với đặc tả vận hành

| Loại | Đặc điểm | Khi nào dùng |
|---|---|---|
| **Vận hành** (operational) | Liệt kê các bước mà phương thức thực hiện; mô tả dạng pseudocode | Hầu như không nên dùng |
| **Khai báo** (declarative) | Không nói về các bước trung gian; chỉ nêu thuộc tính của kết quả cuối và mối liên hệ với trạng thái ban đầu | **Gần như luôn được ưu tiên** |

### Vì sao đặc tả khai báo tốt hơn?

1. **Ngắn gọn hơn**, dễ hiểu hơn.
2. Quan trọng nhất: **kh vô tình lộ chi tiết hiện thực hóa** mà khách hàng có thể dựa vào — rồi phát hiện chúng không còn đúng khi hiện thực hóa thay đổi.

Ví dụ: nếu muốn cho phép cả hai hiện thực hóa của `find`, ta **không muốn** nói phương thức "duyệt xuống mảng cho đến khi tìm thấy `val`" — ngoài việc mơ hồ, đặc tả đó ngụ ý tìm kiếm chạy từ chỉ số thấp đến cao và chỉ số thấp nhất sẽ được trả về, có thể không phải ý của người viết đặc tả.

### Ví dụ từ lớp `String`

**`startsWith`:**

```java
public boolean startsWith(String prefix)
effects:
    if (prefix == null) throws NullPointerException
    else returns true iff there exists a sequence s such
    that (prefix.seq ^ s = this.seq)
```

Giả định: đối tượng `String` có một **specification field** (trường đặc tả) mô tả dãy ký tự. Ký hiệu `^` là toán tử nối chuỗi. Hậu điều kiện: trả về đúng khi tồn tại hậu tố nào đó, khi nối vào sau đối số, cho dãy ký tự của chuỗi. Sự vắng mặt của `modifies` nghĩa là **không đối tượng nào bị sửa** — vì `String` là kiểu bất biến, không phương thức nào của nó có `modifies`.

**`substring`:**

```java
public String substring(int i)
effects:
    if i < 0 or i > length(this.seq) throws IndexOutOfBoundsException
    else returns r such that
    some sequence s | length(s) = i && s ^ r.seq = this.seq
```

Đặc tả này cho thấy **toán học đôi khi dễ hiểu hơn mô tả tự nhiên**. Thay vì bàn `i` có phải chỉ số bắt đầu hay không, chỉ cần phân rã chuỗi thành tiền tố độ dài `i` và chuỗi trả về.

### Một phản ví dụ: đặc tả vận hành dở

```
void addAll(Vector v)
effects: adds the elements of v to this,
         unless it encounters a null element,
         at which point it throws a NullPointerException
```

Đặc tả này vừa **không đủ chặt** (cho phép sửa tùy ý khi không ném ngoại lệ), vừa mang phong cách vận hành không phù hợp. Xem thêm mục 9.3.

---

## 8. Thứ tự đặc tả: khi nào thay thế được nhau

Giả sử bạn muốn thay một phương thức bằng phương thức khác. So sánh đặc tả thế nào?

### Định nghĩa

Đặc tả **A mạnh ít nhất bằng** đặc tả **B** khi:

1. Tiền điều kiện của A **không mạnh hơn** tiền điều kiện của B.
2. Hậu điều kiện của A **không yếu hơn** hậu điều kiện của B, đối với các trạng thái thỏa tiền điều kiện của B.

### Những ý tưởng ẩn trong hai quy tắc

| Quy tắc | Hệ quả |
|---|---|
| Luôn được **yếu hóa** tiền điều kiện | Ít yêu cầu hơn với khách hàng sẽ không bao giờ làm họ phật ý |
| Luôn được **mạnh hóa** hậu điều kiện | Nhiều cam kết hơn — bao giờ cũng được |
| Ở trạng thái tiền điều kiện sai | Làm bất cứ thứ gì cũng được — hậu điều kiện có nêu cũng bỏ qua, vì kết quả đó không được đảm bảo |

Ví dụ: `maybePrime` (trả về true nếu có thể là số nguyên tố) có thể bị thay thế ở mọi ngữ cảnh bởi `isPrime` (trả về true đúng khi là số nguyên tố).

### Ứng dụng

Các mối quan hệ thứ tự này **rất quan trọng** khi xét điều kiện để kế thừa lớp hoạt động đúng — chủ đề của bài giảng về subtyping và subclassing (tài liệu 05).

---

## 9. Đánh giá một đặc tả tốt

Thiết kế một phương thức về cơ bản là **viết một đặc tả**. Không có quy tắc không sai sót, nhưng có nhiều hướng dẫn hữu ích.

### 9.1 Về hình thức

Ngắn gọn, rõ ràng, có cấu trúc tốt. Phần khó là **nội dung**.

### 9.2 Nhất quán (coherent)

Đặc tả không nên có **nhiều nhánh trường hợp khác nhau**. Danh sách tham số dài, câu lệnh if lồng sâu, cờ boolean là **dấu hiệu của rắc rối**.

**Phản ví dụ:**

```java
static int minFind(int[] a, int[] b, int val)
effects: returns smallest index in arrays a and b at which val appears
```

Có phải thủ tục được thiết kế tốt không? **Probably not** — nó **không nhất quán** vì nó làm hai việc (tìm và tìm cực tiểu) không thực sự liên quan. Tốt hơn nên tách thành hai thủ tục riêng.

### 9.3 Kết quả trả về phải cung cấp thông tin

Xét đặc tả `put` của `HashMap` trong Java:

```java
Object put(Object key, Object val)
effects: inserts (key, val) into the mapping,
         overriding any existing mapping for key,
         and returns old value for key, unless none,
         in which case it returns null
```

Phân tích:

- Tiền điều kiện **không** loại trừ giá trị null → hash map có thể lưu null.
- Nhưng hậu điều kiện dùng `null` làm giá trị trả về đặc biệt cho khóa chưa tồn tại.
- Hệ quả: nếu nhận `null`, **không thể phân biệt** khóa trước đó chưa bị gán, hay khóa đó thực sự **được gán với null**.

Đây **không phải thiết kế tốt**, vì giá trị trả về vô dụng trừ khi biết bạn không bao giờ chèn null.

### 9.4 Đặc tả phải đủ mạnh

Không có ý nghĩa gì khi ném ngoại lệ kiểm tra cho đối số xấu nhưng lại cho phép sửa tùy ý — khách hàng sẽ không xác định được sửa gì đã xảy ra.

**Phản ví dụ** (đồng thời viết theo phong cách vận hành không phù hợp):

```java
void addAll(Vector v)
effects: adds the elements of v to this,
         unless it encounters a null element,
         at which point it throws a NullPointerException
```

### 9.5 Đặc tả phải đủ yếu

Xét đặc tả mở tệp:

```java
static File open(String filename)
effects: opens a file named filename
```

Đây là đặc tả **dở** vì:

| Thiếu sót | Chi tiết |
|---|---|
| Thiếu chi tiết quan trọng | Mở để đọc hay ghi? Tệp đã tồn tại hay được tạo mới? |
| **Quá mạnh** | Không có cách nào đảm bảo mở được tệp — tiến trình có thể thiếu quyền, hoặc hệ thống tệp có vấn đề ngoài tầm kiểm soát |

Thay vào đó, đặc tả nên **yếu hơn nhiều**: nỗ lực mở tệp, và nếu thành công, tệp có các thuộc tính nào đó.

### 9.6 Bảng tổng hợp tiêu chí

| Tiêu chí | Tốt | Dở |
|---|---|---|
| Nhất quán | Một mục đích rõ ràng | Làm nhiều việc không liên quan |
| Thông tin trả về | Phân biệt được các trường hợp cần phân biệt | Dùng một giá trị cho nhiều nghĩa (null) |
| Đủ mạnh | Kết quả và hiệu ứng được xác định đầy đủ | Cho phép sửa tùy ý sau khi ném |
| Đủ yếu | Cam kết những gì có thể thực sự đảm bảo | Cam kết không thể đảm bảo (mở được mọi tệp) |
| Hình thức | Ngắn gọn, có cấu trúc | Dạng vận hành, nhiều nhánh |

### 9.7 Công thức đánh giá nhanh

Khi đọc một đặc tả, hãy tự hỏi:

1. **Tiền điều kiện** có hợp lý với khách hàng không? Có quá chặt không?
2. **Hậu điều kiện** có đủ để khách hàng không cần đọc mã không?
3. **`modifies`** có liệt kê đúng những gì cần sửa không? Có bỏ sót gì nguy hiểm không?
4. Nếu thay hiện thực hóa, đặc tả này còn đúng không?
5. Giá trị trả về có **phân biệt** được các trường hợp khác nhau quan trọng với khách hàng không?

---

## 10. Tóm tắt và bài tập

### Tóm tắt

- Đặc tả là **tường lửa** giữa người hiện thực hóa và khách hàng, khiến phát triển độc lập trở nên khả thi.
- Đặc tả khai báo gần như luôn hữu ích hơn đặc tả vận hành.
- Tiền điều kiện làm đời khách hàng khó khăn nhưng, khi dùng thận trọng, là công cụ thiết yếu của nhà thiết kế.
- Thứ tự đặc tả (yếu hóa tiền điều kiện, mạnh hóa hậu điều kiện) quyết định khi nào thay thế được — nền tảng cho subtyping ở tài liệu 05.
- Khi hệ thống phát triển, đặc tả là phần ít bị thay đổi nhất — **đặc tả chính là thiết kế**.

### Bảng thuật ngữ

| Tiếng Anh | Tiếng Việt |
|---|---|
| specification | đặc tả |
| contract | hợp đồng |
| precondition | tiền điều kiện |
| postcondition | hậu điều kiện |
| frame condition / modifies clause | điều kiện khung / mệnh đề modifies |
| total / partial (method) | toàn phần / bán phần |
| declarative / operational | khai báo / vận hành |
| behavioral equivalence | đẳng thức hành vi |
| under-determined | dưới xác định |
| decoupling | tách rời (giảm phụ thuộc lẫn nhau) |
| specification field | trường đặc tả |
| firewall | tường lửa |

### Bài tập suy nghĩ

1. Cho đặc tả `Vector.addAll` ở mục 6. Nếu bỏ `requires v != this`, hiện thực hóa đơn giản nào sẽ hỏng? Vì sao?
2. `find` mức 2 (dưới xác định) — tại sao hai hiện thực hóa khác nhau vẫn thỏa? Khách hàng được phép mong đợi gì?
3. Viết đặc tả khai báo cho hàm `int max3(int x, int y, int z)` trả về giá trị lớn nhất. Đặc tả của bạn mạnh hơn, yếu hơn, hay tương đương với "returns the maximum of its arguments"?
4. Phân tích `HashMap.put` theo tiêu chí "kết quả trả về phải cung cấp thông tin" — đề xuất cách sửa.
5. Vì sao nói "đặc tả chính là thiết kế"? Liên hệ với vai trò thứ hai của đặc tả (điều tiết kết nối giữa mô-đun).

---

*Nguồn: MIT 6.170 Lecture 4 (Procedure Specifications), Fall 2005.*
