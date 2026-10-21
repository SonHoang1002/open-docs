# Kiểm thử phần mềm (Testing)

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering* — **Bài 5: Testing** (Fall 2005). Đọc kèm: Chương 10 của *Program Development in Java* — Barbara Liskov.

---

## Mục lục

1. [Mục tiêu của kiểm thử và ba kỹ thuật xác minh](#1-mục-tiêu-của-kiểm-thử-và-ba-kỹ-thuật-xác-minh)
2. [Chia vùng không gian đầu vào](#2-chia-vùng-không-gian-đầu-vào)
3. [Ba mẹo chọn trường hợp thử cốt lõi](#3-ba-mẹo-chọn-trường-hợp-thử-cốt-lõi)
4. [Kiểm thử hộp đen](#4-kiểm-thử-hộp-đen)
5. [Kiểm thử hộp trong (clear-box)](#5-kiểm-thử-hộp-trong-clear-box)
6. [Chiều bao phủ mã (coverage)](#6-chiều-bao-phủ-mã-coverage)
7. [Chiến lược kiểm thử và tự động hóa](#7-chiến-lược-kiểm-thử-và-tự-động-hóa)
8. [Xác minh tĩnh](#8-xác-minh-tĩnh)
9. [Tóm tắt và bài tập](#9-tóm-tắt-và-bài-tập)

---

## 1. Mục tiêu của kiểm thử và ba kỹ thuật xác minh

Mục tiêu của kiểm thử — như mọi kỹ thuật xác minh chương trình khác — là đảm bảo chương trình hoạt động đúng.

> **Kiểm thử không thể chứng minh sự vắng mặt của lỗi, chỉ chứng minh sự hiện diện của chúng.**

Tuy nhiên, kiểm thử kỹ lục có thể **tăng sự tin cậy** vào phần mềm, với giả định hầu hết lỗi sẽ bị lộ bởi một trường hợp thử nào đó.

### Ba kỹ thuật xác minh chương trình

#### Kỹ thuật 1 — Chứng minh đúng

Viết đặc tả chính xác, đầy đủ, hình thức (tiền điều kiện, hậu điều kiện, và thường cả bất biến vòng lặp), rồi **chứng minh** rằng mã và môi trường thỏa các đặc tả đó.

| Ưu điểm | Nhược điểm |
|---|---|
| Kết quả đảm bảo cho **mọi** lần chạy có thể có | Viết và chứng minh đặc tả rất khó |
| | Với chương trình không tầm thường, chứng minh dài và nhàm chán, con người dễ sai |
| | Cần phần mềm chứng minh định lý, thường phải có người điều hướng |
| | Nhiều thuộc tính (liên quan con trỏ và tham chiếu) nằm ngoài khả năng phân tích hiện tại |
| | **Không hiệu quả chi phí** vì khó viết/chứng minh đặc tả |
| | Chỉ **trì hoãn** vấn đề: làm sao xác minh đặc tả là đúng? |

#### Kỹ thuật 2 — Chạy chương trình trên mọi đầu vào có thể

Nếu chạy trên **mọi** đầu vào và kiểm tra mọi đầu ra, chương trình được đảm bảo đúng. Đầu ra mong đợi có thể tạo tay (đầu vào nhỏ) hoặc bằng hiện thực hóa đơn giản đã được xác minh độc lập (đầu vào lớn).

**Không khả thi trong thực tế** vì không gian đầu vào có thể **vô hạn** (một chương trình đếm từ có thể nhận bất kỳ tệp ký tự nào) hoặc gần như vô hạn:

- Một routine số học nhận ba giá trị `int` Java.
- Mỗi `int` có 4.294.967.296 giá trị khác nhau.
- → khoảng **8 × 10²⁸** bộ ba `int` khác nhau.

#### Kỹ thuật 3 — Chạy chương trình trên một số đầu vào

Không đảm bảo như hai kỹ thuật đầu. "Chương trình chạy đúng 1000 lần đầu" không có nghĩa lần 101 sẽ đúng. Nhưng nếu các trường hợp thử được **lựa chọn cẩn thận**, ta có thể có **sự tin cậy cao** rằng chương trình đúng trên mọi đầu vào.

### Ý tưởng nền tảng: chia vùng tương đương

Chia không gian mọi đầu vào có thể thành các **nhóm tương đương** (equivalence groups) mà chương trình "hành vi giống nhau" trên từng nhóm:

- Chương trình **hỏng** trên bất kỳ thành viên nào của một nhóm → hỏng trên **tất cả** thành viên nhóm đó.
- Chương trình **đúng** trên bất kỳ thành viên nào → đúng trên tất cả.
- Thử **một** thành viên tương đương với thử **mọi** thành viên, xét về mặt tìm lỗi.

→ Bộ thử chứa **một** đầu vào từ mỗi nhóm tương đương cung cấp kiểm thử **đầy đủ**.

### Vấn đề then chốt

Tìm các lớp tương đương mà chương trình hành vi giống nhau **khó ngang việc chứng minh đúng**. Vì vậy chúng ta dùng **mẹo** (heuristics) — quy tắc nói chung hữu ích nhưng **không đảm bảo đúng** — để chọn bộ trường hợp thử.

Mục tiêu thực tế: hy vọng **ít nhất một** trường hợp thử nằm trong mỗi nhóm tương đương **thật** (mà ta không thể biết). Hai hướng tiếp cận:

1. **Đoán** các lớp tương đương rồi chọn trường hợp thử trong chúng.
2. **Bổ sung** các trường hợp thử để đề phòng các vấn đề với phép đoán đó.

Nếu đoán đúng (hoặc nhóm của ta **nhóm con** của nhóm thật), chỉ cần một trường hợp cho mỗi nhóm là **đủ tìm mọi lỗi**.

---

## 2. Chia vùng không gian đầu vào

Mẹo chọn trường hợp thử có thể được xem là hướng dẫn chọn trường hợp thử, hoặc cách chia vùng đầu vào. **Kết quả cuối cùng như nhau**: hướng dẫn xây dựng bộ thử.

Ba mẹo cốt lõi: **bao phủ (coverage)**, **trường hợp biên (boundary cases)**, **trùng lặp (duplicates)**.

### Các đối tượng áp dụng ba mẹo

| Đối tượng | Ví dụ |
|---|---|
| **Giá trị đầu vào** | Số nguyên âm, không, dương; chuỗi rỗng |
| **Giá trị đầu ra** | Kết quả là số âm / không / dương |
| **Giá trị không tường minh** | Số lần lặp vòng, kích thước tập hợp, số lần xuất hiện của phần tử, khoảng cách giữa hai lần lặp |

Các đại lượng này ảnh hưởng đến hành vi mã, tường minh hoặc ngầm định.

### Áp dụng cho cả hai kiểu kiểm thử

- **Hộp đen** (black-box): chỉ dựa trên đặc tả.
- **Hộp trong** (clear-box/glass-box): xem xét hiện thực hóa.

Khi nhiều mẹo cùng áp dụng, hãy lấy **tích chữ nhật** của chúng: một mẹo gợi ý 2 phân vùng (trên một đầu vào) và mẹo khác gợi ý 3 phân vùng (trên đầu vào khác) → bộ thử cần **ít nhất 6** trường hợp thử.

---

## 3. Ba mẹo chọn trường hợp thử cốt lõi

### 3.1 Bao phủ (Coverage)

Mẹo then chốt trong kiểm thử. Tiêu chí bao phủ nhằm làm cho **một phân vùng đầu vào (một trường hợp thử) thực thi mỗi cấu trúc mã hoặc đặc tả**. Vì các cấu trúc khác nhau thường có hành vi khác nhau, bộ thử dùng hết chúng có nhiều khả năng đầy đủ hơn bộ không dùng hết.

**Bao phủ mã đầy đủ thường không khả thi:**

- Mã kiểm tra lỗi có thể **không bao giờ thực thi** (theo thiết kế) hoặc khó kích hoạt.
- Mã chết (không thể truy cập) không bao giờ thực thi được.
- Bao phủ **không hiệu quả** trong tìm **lỗi thiếu sót** (errors of omission).

Nhiều công cụ tồn tại để kiểm tra độ bao phủ mã của bộ thử; một số phương pháp luận yêu cầu mức bao phủ nhất định.

| Loại bao phủ | Điều kiện |
|---|---|
| Statement (câu lệnh) | Mỗi câu lệnh được thực thi bởi bộ thử |
| Branch (nhánh) | Mỗi nhánh được đi qua ở một số điểm **và** không đi qua ở một số điểm |
| Decision (quyết định) | Mỗi thành phần boolean của biểu thức điều kiện (như `a` và `b` trong `if (a && b) ...`) lần lượt đúng ở một nơi và sai ở nơi khác |
| Def-use (định nghĩa – sử dụng) | Mọi biến được sử dụng đều được tiếp cận bởi **mỗi** định nghĩa của biến đó |
| Path (đường đi) | Mọi đường không chứa vòng lặp (chuỗi câu lệnh liên tiếp) trong một hàm được đi theo ở một lần chạy |

Bao phủ một miền đòi hỏi có **một phần tử trong mỗi phần của nó**. Miền đơn nhất chỉ cần một trường hợp thử. Một số miền có cấu trúc tự nhiên, khi đó nên bao phủ mọi phần: với đầu ra là số nguyên, nên cung cấp đầu vào **âm, không và dương**.

### 3.2 Trường hợp biên (Boundary cases)

Khi vẽ biên lớp tương đương, kể cả ý tưởng tổng thể đúng, các biên vẫn có thể **sai một chút**: bị lệch, và/hoặc có các lớp tương đương nhỏ ở biên của lớp lớn hơn.

**Ví dụ 1 — phân vùng bị lệch:**

Bạn cho rằng chương trình hành vi một way với đầu vào < 10, way khác với 10 ≤ đầu vào ≤ 20, và way khác nữa với đầu vào > 20. Bạn chọn thử 9, 20, 21.

Giả sử bạn **sai một chút** — phân vùng đúng là: < 10, 10 ≤ đầu vào < 20, ≥ 20:

```
Thử của tester:        9               20  21
Phân vùng thực:   [7  8  9]  [10 11 ... 19]  [20 21 22 23]
                        ^           ^           ^ ^
                     bao phủ     bao phủ     trúng  trúng
```

Trường hợp thử của bạn chỉ bao phủ **hai trong ba** phân vùng thật.

**Ví dụ 2 — một giá trị biên riêng lẻ:**

Bạn cho rằng: < 10 một way, ≥ 10 một way; thử 5 và 15. Nếu thực ra chương trình có **ba** chế độ: < 10, **đúng bằng 10**, và > 10 (có thể 10 lẽ ra phải như > 10 nhưng code bạn có lỗi) → bộ thử lại thiếu một phân vùng thật.

```
Thử của tester:   4   5   6        ...        16
Phân vùng thực:  [4  5  6 7 8 9]  [10]  [11 ... 15 16]
                        ^                  ^
```

**Bảo hiểm chống sai biên:** ngoài các giá trị "điển hình" gần tâm lớp, hãy thêm trường hợp thử **gần biên**. Nên gồm cả giá trị **cực đại/cực tiểu ngay trên biên** và **hàng xóm** của chúng. Đừng quên thử **cả hai** biên cực tiểu và cực đại.

Ví dụ: với tham số là `BigInteger` không âm, có thể cung cấp `0`, `1`, `2`, và vài giá trị rất lớn.

### 3.3 Stress testing

Dùng đầu vào lớn, phức tạp (về cơ bản là trường hợp biên cực đại với đầu vào không bị chặn) đôi khi được gọi là **stress testing**. Hữu ích đặc biệt khi hệ thống không kiểm tra bất biến biểu diễn, tiền điều kiện hay hậu điều kiện. Lỗi có thể không hiển thị ngay; một lần chạy dài cho phép vấn đề **tự biểu lộ**.

### 3.4 Trùng lặp (Duplicates)

Chương trình thường hành vi khác khi các đầu vào có **mối quan hệ đặc biệt** với nhau.

```java
// modifies: v1, v2
// effects: removes all elements of v2 and appends them in reverse order
//          to the end of v1
// throws: NullPointerException if v1 is null or v2 is null
static void appendVector(Vector v1, Vector v2) {
    while (v2.size() > 0) {
        Object elt = v2.remove(v2.size() - 1);
        v1.add(elt);
    }
}
```

Hoạt động đúng **trừ khi hai đối số là cùng một `Vector`** — khi đó nó **lặp vô hạn**.

**Aliasing** (nhiều tham chiếu tới cùng một đối tượng) là vấn đề phổ biến nhất, nhưng các dạng trùng lặp khác cũng có thể gây rắc rối.

### 3.5 Bảng tổng hợp ba mẹo

| Mẹo | Câu hỏi then chốt | Ví dụ điển hình |
|---|---|---|
| Bao phủ | Mọi cấu trúc/chiều đã được thử chưa? | Mỗi nhánh `if/else`; số âm, 0, số dương |
| Biên | Biên có bị đoán sai không? | `Integer.MIN_VALUE`, chuỗi rỗng, đúng bằng ngưỡng |
| Trùng lặp | Đầu vào có mối quan hệ đặc biệt không? | `v1 == v2`, hai khóa trùng, nhiều phần tử giống nhau |

---

## 4. Kiểm thử hộp đen

Trường hợp thử hộp đen được tạo bằng cách **xem xét đặc tả**. Đôi khi gọi là **kiểm thử chức năng** (functional tests) vì chúng kiểm tra chức năng chứ không kiểm tra hiện thực hóa.

### Ưu điểm

- Tránh bẫy xem hiện thực hóa rồi **lặp lại lỗi hoặc giả định** của nó.
- Về cơ bản là **xác minh độc lập** chức năng.
- **Không phụ thuộc biểu diễn** (representation-independent) — vẫn hợp lệ và đầy đủ ngay cả khi thay hiện thực hóa mới.

### Ví dụ 1: `abs`

```
// returns the absolute value of its input
int abs(int x);
```

Áp dụng ba mẹo:

**Bao phủ:**
- Đầu vào: miền đầu vào là **đơn nhất** (monolithic) → một thử là đủ. (Thực tế số nguyên có cấu trúc tự nhiên: nên chia thành 3 lớp tương đương — âm, không, dương — và áp mẹo riêng cho từng lớp.)
- Đầu ra: cũng là số nguyên. (Thực tế là số nguyên **không âm** — sẽ dùng điều này bên dưới.)
- Giá trị không tường minh: không có obvious → không thêm.

**Trường hợp biên:**
- Đầu vào: số nguyên trải từ `Integer.MIN_VALUE` đến `Integer.MAX_VALUE` → nên cung cấp các giá trị này (và các giá trị lớn hơn/bé hơn một đơn vị).
- Cung cấp `Integer.MIN_VALUE` sẽ **lộ lỗi** trong hiện thực hóa: vì `Integer.MIN_VALUE = -2147483648` trong khi `Integer.MAX_VALUE = 2147483647`, **không hàm Java nào** thỏa được đặc tả.
- Đầu ra: nếu xem đầu ra là `int`, sẽ thử tạo đầu ra `MIN_VALUE`/`MAX_VALUE`. Sớm phát hiện đầu ra không âm → biên dưới ở `0`: thử tạo `0`, `1`, có thể `2`.

**Trùng lặp:** chỉ có một đầu vào, một đầu ra → chỉ có hai thử gợi ý: đầu vào khác đầu ra, và đầu vào bằng đầu ra.

### Ví dụ 2: đặc tả chi tiết hơn

```
// if x<0, returns -x; else returns x
int abs(int x);
```

Bao phủ đặc tả **ngụ ý thực thi mỗi nhánh** — về cơ bản điều này được tạo ra bằng cách xem phân vùng ngầm của số nguyên thành âm, không, dương. Biên đầu vào gồm `-2`, `-1` (biên trên lớp âm) và `1`, `2` (biên dưới lớp dương).

### Ví dụ 3: `stutterCount` (từ Problem Set 0)

```
// returns the length of the longest stutter in s
int stutterCount(String s)
```

**Bao phủ:**
- Đầu vào: miền chuỗi đơn nhất; chuỗi rỗng là lựa chọn khôn ngoan (cũng được mẹo khác gợi ý).
- Đầu ra: số nguyên không âm; chỉ chuỗi rỗng trả về 0.
- Giá trị không tường minh: độ dài đầu vào, độ dài stutter, vị trí stutter, số stutter, số stutter độ dài cực đại — tất cả là số không âm. Nên có thử làm cho chúng bằng **0** (mẹo biên sẽ lo phần này).

**Trường hợp biên:**
- Đầu vào: chuỗi rỗng, chuỗi 1 ký tự, chuỗi rất dài.
- Đầu ra: 0, 1, và số lớn.
- Không tường minh: làm các giá trị trên bằng 0, 1, và lớn. Nếu chúng xuất hiện trong hiện thực hóa → đạt dạng bao phủ mã; nếu không → vô hại.

**Trùng lặp:**
- Chuỗi chỉ chứa **một ký tự duy nhất** → stutter bằng cả chuỗi.
- Nhiều stutter **cùng độ dài** (cùng ký tự hoặc khác), kề nhau hoặc không (tạo giá trị không tường minh mới: khoảng cách — có thể bằng 0, nhỏ, lớn).
- Các thử hợp lý: không ngạc nhiên nếu thủ tục **không reset** biến nội bộ đúng, đặc biệt nếu được mở rộng để trả về cả ký tự lẫn độ dài.

---

## 5. Kiểm thử hộp trong (clear-box)

Trường hợp thử clear-box được tạo bằng cách **xem hiện thực hóa**. Còn gọi là **glass-box / white-box** (so với black-box) hoặc **cấu trúc** (structural, so với chức năng).

### Khi nào đặc biệt hiệu quả

- Tìm vấn đề với các **trường hợp đặc biệt** được xử lý khác biệt bởi mã (nhưng không được nhắc trong đặc tả vì kết quả lẽ ra cùng thuộc tính).
- Tìm vấn đề với các **tối ưu hóa** — nguồn của nhiều lỗi và làm mã phức tạp, tạo khoảng trống cho hiện thực hóa "đúng phần lớn" với hành vi bất thường ở nơi không obvious.

### Ví dụ 1: `max3`

```java
// returns the maximum of its arguments
int max3(int x, int y, int z) {
    if (x > y) {
        if (x > z) return x; else return z;
    } else {
        if (y > z) return y; else return z;
    }
}
```

Đặc tả khai báo tốt hơn đặc tả vận hành, nhưng chỉ gợi ý **ba** trường hợp thử (trả về tham số thứ nhất, thứ hai, thứ ba). Người thử tinh vi hơn có thể注意到 6 thứ tự sắp xếp có thể có của đầu vào, thậm chí cả trùng lặp.

**Bao phủ hộp đen không đảm bảo bao phủ hộp trong** — cần **bốn** trường hợp thử. Với bất kỳ bộ ba thử nào, ít nhất một câu lệnh không được thực thi — điều đó có thể **không tìm ra** lỗi copy-paste (như gán nhầm `x` cho `y` hay `z` ở một chỗ — lỗi dễ mắc trong loại mã này).

### Ví dụ 2: một câu lệnh, nhiều trạng thái bao phủ

```java
int abx(int x) {
    if (x < -1)
        x = -x;
    return x;
}
```

**Một** trường hợp thử có thể bao phủ **mọi** câu lệnh. Nhưng cần ít nhất **hai** để đạt bao phủ nhánh (và hai trường hợp đó đạt mọi dạng bao phủ hộp trong).

### Ví dụ 3: bao phủ nhánh không ngụ ý bao phủ đường đi

```java
if (p1) a; else b;
if (p2) c; else d;
```

Hai lần chạy có thể đảm bảo bao phủ câu lệnh và nhánh (lần 1: cả hai đúng; lần 2: cả hai sai). Nhưng có **bốn** đường đi (`a` rồi `d`; `b` rồi `c`). Nếu `p1` và `p2` liên quan (một ngụ ý kia), bao phủ đường đi **không thể đạt được**.

### Ví dụ 4: bao phủ không bao giờ tìm ra lỗi thiếu sót

```java
int max3(int x, int y, int z) {
    return x;
}
```

Một trường hợp thử `3 2 1` đạt **bao phủ hoàn chỉnh** nhưng hoàn toàn **không lộ** rằng hiện thực hóa này khiếm khuyết nghiêm trọng!

### Bảng tổng hợp: quan hệ giữa các dạng bao phủ

| Dạng | Điều kiện | Ví dụ phá vỡ giả định |
|---|---|---|
| Câu lệnh | Mọi câu lệnh chạy | `return x;` duy nhất |
| Nhánh | Mỗi nhánh chạy và không chạy | 2 trường hợp cho `if/else` |
| Đường đi | Mọi đường không vòng lặp | 4 đường cho 2 `if` độc lập; có thể **bất khả thi** nếu điều kiện liên quan |
| Thiếu sót | — | **Không bao giờ** tìm được bằng bao phủ nào |

### Áp dụng mẹo lên biến cục bộ

Xem xét mã có thể lộ thêm các đại lượng (biến cục bộ) để áp mẹo. Ví dụ: bộ thử tốt sẽ cố chạy mỗi vòng lặp **0, 1, 2 và nhiều lần** ở các lần chạy khác nhau.

---

## 6. Chiến lược kiểm thử và tự động hóa

### 6.1 Kết hợp cả hai kiểu

Chiến lược đầy đủ dùng **cả hộp đen và hộp trong**, vì chúng hữu ích theo cách khác nhau và tìm **loại lỗi khác nhau**.

Thứ tự khuyến nghị:

1. **Làm kiểm thử hộp đen trước** — hoạt động tốt nhất khi trường hợp thử được tạo **không biết gì về mã**.
2. Lý tưởng, trường hợp thử hộp đen do người **chưa từng thấy mã** (hay chưa thảo luận thiết kế) viết, chỉ đọc đặc tả.

### 6.2 Các cấp kiểm thử

Bạn có thể đọc về unit, module, system, acceptance testing — đó là kiểm thử các **phần lớn dần** của toàn hệ thống, được mô tả trong nhiều sách kỹ thuật phần mềm.

### 6.3 Kiểm thử bottom-up và top-down

Xét MDD (sơ đồ phụ thuộc mô-đun) sau:

```
        A
       / \
      B   C
     / \ / \
    D   E   F
```

| Chiều | Thứ tự | Công cụ cần viết | Ưu điểm |
|---|---|---|---|
| **Bottom-up** | D trước B; E và F trước C; B và C trước A | **Drivers** (chương trình điều khiển) mô phỏng môi trường gọi | Driver là bắt buộc cho kiểm thử đầy đủ → không yêu cầu thêm gì |
| **Top-down** | A trước B hoặc C; B trước D; C trước E hoặc F | **Stubs** (mô phỏng) cho các phần chưa viết/chưa kiểm thử | **Lỗi thiết kế được phát hiện sớm**, thay vì chỉ khi phần lớn hệ thống đã dựng xong mà các phần vẫn không khớp |

Nguyên tắc chung: chọn kiểu **phù hợp với phong cách phát triển** của bạn.

### 6.4 Kiểm thử trong khi viết mã

Kiểm thử **trong lúc code** hiệu quả hơn vì bạn còn nhớ mã và tìm lỗi nhanh hơn. Đặc biệt nếu vấn đề có thể ảnh hưởng phần còn lại của thiết kế (ví dụ: đặc tả không khả thi về hiệu năng), biết sớm rất có ích. Và kết quả là một **sản phẩm dùng được** thay vì sản phẩm đầy lỗi.

Hợp lý khi kiểm thử **một lớp** tại một thời điểm thay vì một phương thức (trừ khi lớp/hàm đó lớn và phức tạp). Tài liệu cũng vậy — viết trong lúc làm.

### 6.5 Kiểm thử hồi quy (regression testing)

Kiểm thử lại mã **sau khi thay đổi**. Điều này **then chốt** vì rất dễ **tạo lỗi mới khi sửa lỗi cũ**, nhưng nhiều người không buồn xác minh lại sau khi sửa chữa, mở rộng hay chỉnh sửa.

Nếu các trường hợp thử **dễ chạy** (ví dụ: bạn đã viết test driver), kiểm thử hồi quy rất dễ thực hiện.

### 6.6 Dùng assertion

Assertion kiểm tra một thuộc tính và báo lỗi nếu không thỏa. Hữu ích cho **tiền điều kiện, hậu điều kiện và bất biến biểu diễn**.

Nguyên tắc: **phát hiện lỗi càng sớm** (tính bằng số dòng mã đã chạy giữa lúc lỗi xảy ra và lúc phát hiện), **càng dễ định vị**. Định vị lỗi thường khó hơn sửa lỗi rất nhiều.

> Gợi ý thực hành: assertion cũng có giá trị tài liệu — kể cả khi không được thực thi, chúng giúp người đọc mã hiểu mã đang làm gì (xem tài liệu 06).

---

## 7. Xác minh tĩnh

Các kỹ thuật trên là **động** (chạy chương trình, kiểm tra tại runtime). Thay thế là kỹ thuật **tĩnh** — không chạy chương trình:

### 7.1 Chạy công cụ

| Công cụ | Điều nó đảm bảo |
|---|---|
| Trình chứng minh định lý | Đảm bảo đúng cho một thủ tục trong trường hợp nhất định |
| **Trình biên dịch Java** | Không có lỗi kiểu trong chương trình (hoặc báo lỗi và từ chối sinh bytecode); không dùng biến trước khi gán |
| Công cụ kiểm tra kiểu, dòng dữ liệu | Nhiều thuộc tính tĩnh khác |

Lỗi kiểu rất khó phát hiện và gây hành vi cực khó gỡ lỗi — trình biên dịch loại trừ chúng đã là bước tiến lớn.

### 7.2 Suy nghĩ về mã

Kể cả khi không chứng minh tự động được, con người vẫn có thể chứng minh thuộc tính của mã, cả hình thức lẫn suy luận không hình thức. **Quá trình viết xuống bất biến biểu diễn, hàm trừu tượng hóa, tiền/hậu điều kiện đã có thể lộ vấn đề** vì nó buộc bạn nghĩ về mã một cách có cấu trúc.

Tương tự, **hành động viết trường hợp thử** (và chỉ nghĩ về đặc tả) thường khiến lập trình viên nhận ra hiện thực hóa không xử lý một trường hợp nào.

### 7.3 Hỏi một người bạn

**Code inspection** — lập trình viên không viết đoạn mã đó đọc và suy luận về nó — **hiệu quả đáng kinh ngạc** trong tìm lỗi.

> Lưu ý: sinh viên không được làm điều này trong nửa đầu 6.170 (đó là việc của LA và TA), nhưng khóa khuyến khích cho dự án cuối kỳ.

### Bảng tổng hợp xác minh

| Kỹ thuật | Tính chất | Chi phí | Hạn chế |
|---|---|---|---|
| Chứng minh đúng | Đảm bảo mọi lần chạy | Rất cao | Khó viết đặc tả; tự nó cần được xác minh |
| Chạy mọi đầu vào | Đảm bảo | Không khả thi | Không gian đầu vào vô hạn/lớn |
| Chạy một số đầu vào | Không đảm bảo, tăng tin cậy | Thấp | Phụ thuộc chất lượng chọn trường hợp |
| Công cụ tĩnh (biên dịch) | Đảm bảo thuộc tính kiểu | Rất thấp | Ràng buộc bởi khả năng của công cụ |
| Suy nghĩ / viết tài liệu | Phát hiện nhiều loại lỗi | Trung bình | Phụ thuộc con người |
| Inspection | Rất hiệu quả tìm lỗi | Trung bình | Cần người thứ hai |

---

## 8. Tóm tắt và bài tập

### Tóm tắt

- Kiểm thử tìm lỗi, **không chứng minh được không có lỗi** — nhưng kiểm thử kỹ làm tăng tin cậy.
- Nền tảng lý luận: chia không gian đầu vào thành lớp tương đương; thực tế dùng **mẹo** vì nhóm thật không thể biết.
- Ba mẹo: **bao phủ**, **biên**, **trùng lặp** — áp cho đầu vào, đầu ra, và đại lượng không tường minh; lấy tích chữ nhật khi nhiều mẹo áp dụng.
- **Hộp đen trước** (dựa trên đặc tả, độc lập với hiện thực hóa), rồi **hộp trong** (dựa trên mã, tìm lỗi trường hợp đặc biệt/tối ưu).
- Bao phủ có giới hạn: không tìm được **lỗi thiếu sót**; bao phủ nhánh không đảm bảo bao phủ đường đi.
- Kết hợp bottom-up/top-down; kiểm thử **hồi quy** là bắt buộc; assertion vừa kiểm tra vừa tài liệu.
- Xác minh tĩnh: công cụ, suy nghĩ có cấu trúc, inspection.

### Bảng thuật ngữ

| Tiếng Anh | Tiếng Việt |
|---|---|
| equivalence class / group | lớp / nhóm tương đương |
| heuristics | mẹo / quy tắc thực hành |
| coverage | bao phủ |
| boundary case | trường hợp biên |
| black-box / clear-box (glass-box, white-box) | hộp đen / hộp trong (hộp kính, hộp trắng) |
| stress testing | kiểm thử áp lực |
| regression testing | kiểm thử hồi quy |
| driver / stub | chương trình điều khiển / mô phỏng |
| bottom-up / top-down testing | kiểm thử từ dưới lên / từ trên xuống |
| static / dynamic verification | xác minh tĩnh / động |
| assertion | câu lệnh khẳng định |
| code inspection | rà soát mã |
| errors of omission | lỗi thiếu sót |

### Bài tập suy nghĩ

1. Vì sao nhóm tương đương **thật** không thể biết được? Làm sao "nhóm của ta là nhóm con của nhóm thật" dẫn đến bộ thử đầy đủ?
2. Áp dụng ba mẹo cho hàm `boolean isLeap(int year)` — liệt kê ít nhất 8 trường hợp thử.
3. Cho mã `max3` ở mục 5.1: tìm bộ 3 trường hợp thử đạt bao phủ câu lệnh nhưng **bỏ sót** một nhánh, nếu có.
4. Vì sao kiểm thử hộp đen nên làm **trước** và bởi người chưa thấy mã?
5. Kiểm thử hồi quy liên quan gì đến nhận định "sửa lỗi cũ dễ tạo lỗi mới"? Bạn sẽ thiết lập quy trình gì cho nhóm của mình?

---

*Nguồn: MIT 6.170 Lecture 5 (Testing), Fall 2005; Chương 10, Program Development in Java, Barbara Liskov.*
