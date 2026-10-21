# Mẫu thiết kế (Design Patterns)

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering*, Fall 2005:

- **Bài 18: Design Patterns**

Đọc kèm: *Program Development in Java* — Barbara Liskov, **Chương 15**; *Effective Java* — Joshua Bloch.

---

## Mục lục

1. [Mẫu thiết kế là gì?](#1-mẫu-thiết-kế-là-gì)
2. [Ví dụ mẫu đã gặp](#2-ví-dụ-mẫu-đã-gặp)
3. [Khi nào (không) dùng mẫu thiết kế](#3-khi-nào-không-dùng-mẫu-thiết-kế)
4. [Mẫu tạo lập: Factory method](#4-mẫu-tạo-lập-factory-method)
5. [Mẫu tạo lập: Factory object](#5-mẫu-tạo-lập-factory-object)
6. [Mẫu tạo lập: Prototype](#6-mẫu-tạo-lập-prototype)
7. [Tổng kết nhóm mẫu tạo lập](#7-tổng-kết-nhóm-mẫu-tạo-lập)
8. [Mẫu hành vi: Observer](#8-mẫu-hành-vi-observer)
9. [Mẫu hành vi: Blackboard](#9-mẫu-hành-vi-blackboard)
10. [Mẫu cấu trúc: Wrapper — adapter, decorator, proxy](#10-mẫu-cấu-structure-wrap-wrappers--adapter-decorator-proxy)
11. [Adapter](#11-adapter)
12. [Decorator](#12-decorator)
13. [Proxy](#13-proxy)
14. [Kế thừa so với composition/forwarding](#14-kế-thừa-so-với-compositionforwarding)
15. [Bảng thuật ngữ và bài tập](#15-bảng-thuật-ngữ-và-bài-tập)

---

## 1. Mẫu thiết kế là gì?

> **Mẫu thiết kế** (design pattern) là:

| # | Định nghĩa |
|---|---|
| 1 | Một **giải pháp chuẩn** cho một **vấn đề lập trình phổ biến** |
| 2 | Một kỹ thuật làm cho mã **linh hoạt hơn** bằng cách thỏa các tiêu chí nhất định |
| 3 | Một cấu trúc thiết kế hoặc hiện thực hóa đạt được **mục đích cụ thể** |
| 4 | Một **thần thức lập trình cấp cao** (high-level programming idiom) |
| 5 | **Thuật ngữ viết tắt** để mô tả các khía cạnh nhất định của tổ chức chương trình |
| 6 | Các **kết nối** giữa các thành phần chương trình |
| 7 | **Hình dạng** của một sơ đồ đối tượng hoặc mô hình đối tượng |

Ý nghĩa thực hành quan trọng của điểm 5 và 6: khi bạn và đồng nghiệp **biết cùng từ vựng mẫu**, giao tiếp trở nên chính xác và nhanh hơn nhiều (xem mục 3).

---

## 2. Ví dụ mẫu đã gặp

Danh sách này gồm các mẫu bạn **đã thấy**. Với mỗi mẫu: **vấn đề** nó giải quyết, **giải pháp** nó cung cấp, và **nhược điểm** liên quan.

> Người thiết kế phần mềm phải **cân nhắc đổi** (trade off) ưu điểm với nhược điểm khi quyết định dùng mẫu. **Đánh đổi giữa linh hoạt và hiệu năng** là phổ biến — như bạn sẽ thường phát hiện trong khoa học máy tính (và các lĩnh vực khác).

### 2.1 Encapsulation (ẩn dữ liệu)

| | |
|---|---|
| **Vấn đề** | Trường bị lộ có thể bị thao tác trực tiếp từ ngoài → vi phạm **bất biến biểu diễn** hoặc sinh phụ thuộc **không mong muốn** khiến không đổi được hiện thực hóa |
| **Giải pháp** | Ẩn một số thành phần, chỉ cho phép truy cập **theo hình thức** (stylized access) tới đối tượng |
| **Nhược điểm** | Giao diện có thể **không (hiệu quả) cung cấp** mọi hoạt động mong muốn. **Sự gián tiếp** (indirection) có thể giảm hiệu năng |

*(Liên hệ tài liệu 04 — lộ biểu diễn qua chiều vào/ra; tài liệu 05 — accessibility.)*

### 2.2 Subclassing (kế thừa)

| | |
|---|---|
| **Vấn đề** | Các trừu tượng tương tự có thành phần tương tự (trường và phương thức). Lặp lại chúng **mệt mỏi, dễ sai, đau đầu khi bảo trì** |
| **Giải pháp** | **Kế thừa** thành phần mặc định từ lớp cha; chọn hiện thực hóa đúng qua **phân phát lúc chạy** (run-time dispatching) |
| **Nhược điểm** | Mã của một lớp bị **phân tán**, có thể giảm khả năng hiểu. Phân phát lúc chạy **tốn chi phí** (overhead) |

### 2.3 Iteration (duyệt)

| | |
|---|---|
| **Vấn đề** | Khách hàng muốn truy cập mọi thành phần một collection phải thực hiện **thao tác duyệt riêng** cho mỗi cấu trúc dữ liệu. Giới thiệu phụ thuộc **không mong muốn** và **không mở rộng** sang collection khác |
| **Giải pháp** | Các hiện thực hóa — **biết biểu diễn** — thực hiện duyệt và **theo dõi trạng thái** (bookkeeping). Kết quả truyền tới khách hàng qua **giao diện chuẩn** |
| **Nhược điểm** | **Thứ tự duyệt** bị hiện thực hóa cố định, **không thuộc quyền kiểm soát** của khách hàng |

### 2.4 Exceptions (ngoại lệ)

| | |
|---|---|
| **Vấn đề** | Lỗi xảy ra ở một phần mã **thường nên được xử lý ở nơi khác**. Mã **không nên bị bày bừa** bằng mã xử lý lỗi, cũng **không nên** để giá trị trả về bị chiếm bởi mã lỗi |
| **Giải pháp** | Giới thiệu **cấu trúc ngôn ngữ** để throw và catch ngoại lệ |
| **Nhược điểm** | Mã **vẫn có thể** bị bày bừa. **Khó biết** ngoại lệ sẽ được xử lý ở đâu. Lập trình viên có thể **cảm thấy muốn** dùng ngoại lệ cho **luồng điều khiển bình thường** — gây nhầm lẫn và thường kém hiệu quả |

### Nhận xét

Các mẫu **đặc biệt** này **quan trọng đến mức** chúng được **tích hợp sẵn vào Java**. Các mẫu khác quan trọng đến mức tích hợp vào **ngôn ngữ khác**. Vài mẫu có thể **không bao giờ** tích hợp vào ngôn ngữ, nhưng vẫn hữu ích **tại chỗ chúng**.

---

## 3. Khi nào (không) dùng mẫu thiết kế

### Quy tắc số một: hoãn lại

> **Quy tắc đầu tiên về mẫu thiết kế cũng giống quy tắc đầu tiên về tối ưu hóa: delay (hoãn).**
>
> Giống như bạn **không nên tối ưu hóa non**, cũng **không nên dùng mẫu thiết kế non**.

- Có thể tốt nhất: **trước tiên hiện thực hóa** thứ gì đó và đảm bảo nó **hoạt động**, rồi dùng mẫu để **cải thiện điểm yếu** — đặc biệt đúng nếu bạn **chưa nắm hết** chi tiết thiết kế.
- *(Nếu bạn **hiểu đầy đủ** miền và vấn đề, dùng mẫu **từ đầu** có thể hợp lý — giống như dùng thuật toán hiệu quả hơn ngay từ đầu trong một số ứng dụng.)*

### Mẫu thiết kế có thể tăng hoặc giảm khả năng hiểu

| Giảm khả năng hiểu | Tăng khả năng hiểu |
|---|---|
| Thêm **sự gián tiếp** (indirection) | Cải thiện **modularity** |
| Tăng **lượng mã** | Tách biệt tốt hơn các mối quan tâm (**separating concerns**) |
| | **Giản tiện việc mô tả** |

### Từ vựng mẫu — lợi thế giao tiếp

> Khi đã học **từ vựng** mẫu thiết kế, bạn giao tiếp với người khác biết từ vựng đó **chính xác và nhanh hơn**.

Nói *"Đây là một **instance của mẫu visitor**"* tốt hơn nhiều so với *"Đây là đoạn mã duyệt một cấu trúc và làm callback, và vài phương thức nhất định phải có, và chúng được gọi theo cách này và theo thứ tự này."*

### Cách phát hiện cần mẫu nào

Hầu hết người dùng mẫu khi họ **nhận ra vấn đề**:

- Trong **thiết kế** — thứ lẽ ra dễ thì **không dễ**.
- Trong **hiện thực hóa** — ví dụ **hiệu năng**.

**Quy trình:**

1. Xem xét thiết kế/mã **gây vấn đề**. Vấn đề của nó là gì? Nó thỏa **những thỏa hiệp** nào?
2. Bạn **muốn làm gì** mà hiện tại **quá khó**?
3. Kiểm tra **tham khảo mẫu thiết kế** (pattern reference). Tìm mẫu giải quyết các mối quan tâm của bạn.

---

## 4. Mẫu tạo lập: Factory method

### Bối cảnh: cuộc đua xe đạp

Giả sử viết lớp mô tả **cuộc đua xe đạp**. Cuộc đua gồm **nhiều xe đạp** (cùng có thể vài đối tượng khác):

```java
class Race {
    Race createRace() {
        Frame frame1 = new Frame();
        Wheel frontWheel1 = new Wheel();
        Wheel rearWheel1 = new Wheel();
        Bicycle bike1 = new Bicycle(frame1, frontWheel1, rearWheel1);

        Frame frame2 = new Frame();
        Wheel frontWheel2 = new Wheel();
        Wheel rearWheel2 = new Wheel();
        Bicycle bike2 = new Bicycle(frame2, frontWheel2, rearWheel2);
        ...
    }
}
```

Có thể **chuyên biệt hóa** `Race` cho các cuộc đua khác:

```java
// Cuộc đua Pháp
class TourDeFrance extends Race {
    Race createRace() {
        Frame frame1 = new RacingFrame();
        Wheel frontWheel1 = new Wheel700c();
        Wheel rearWheel1 = new Wheel700c();
        Bicycle bike1 = new Bicycle(frame1, frontWheel1, rearWheel1);
        ...
    }
    ...
}

// Cuộc đua địa hình
class Cyclocross extends Race {
    Race createRace() {
        Frame frame1 = new MountainFrame();
        Wheel frontWheel1 = new Wheel27in();
        Wheel rearWheel1 = new Wheel27in();
        Bicycle bike1 = new Bicycle(frame1, frontWheel1, rearWheel1);
        ...
    }
    ...
}
```

*(Trong các lớp con, `createRace` trả `Race` vì trình biên dịch Java **bắt buộc** phương thức override có **kiểu trả về giống hệt**.)*

### Vấn đề

- Mã lặp **mệt mỏi**.
- Đặc biệt: **không tái sử dụng được** `Race.createRace` **mấy**.
- *(Có vấn đề riêng là trừu tượng hóa việc tạo **một** xe đạp ra hàm — sẽ dùng mà không bàn thêm, vì hiển nhiên, ít nhất sau 6.001.)*

> **Phải có cách tốt hơn. Mẫu Factory cung cấp câu trả lời.**

### 4.1 Factory method — phương thức nhà máy

> **Factory method** là phương thức **sản xuất** đối tượng của một kiểu cụ thể.

Thêm vào `Race`:

```java
class Race {
    Frame createFrame() { return new Frame(); }
    Wheel createWheel() { return new Wheel(); }
    Bicycle createBicycle(Frame frame, Wheel front, Wheel rear) {
        return new Bicycle(frame, front, rear);
    }
    // trả về một xe đạp hoàn chỉnh mà không cần đối số nào
    Bicycle completeBicycle() {
        Frame frame = createFrame();
        Wheel frontWheel = createWheel();
        Wheel rearWheel = createWheel();
        return createBicycle(frame, frontWheel, rearWheel);
    }
    Race createRace() {
        Bicycle bike1 = completeBicycle();
        Bicycle bike2 = completeBicycle();
        ...
    }
}
```

Giờ các lớp con có thể **tái sử dụng** `createRace` thậm chí `completeBicycle` **mà không đổi**:

```java
// Cuộc đua Pháp
class TourDeFrance extends Race {
    Frame createFrame() { return new RacingFrame(); }
    Wheel createWheel() { return new Wheel700c(); }
    Bicycle createBicycle(Frame frame, Wheel front, Wheel rear) {
        return new RacingBicycle(frame, front, rear);
    }
}

class Cyclocross extends Race {
    Frame createFrame() { return new MountainFrame(); }
    Wheel createWheel() { return new Wheel26inch(); }
    Bicycle createBicycle(Frame frame, Wheel front, Wheel rear) {
        return new RacingBicycle(frame, front, rear);
    }
}
```

Các phương thức `create...` được gọi là **factory methods**.

> **Bài học:** tách phần **tạo đối tượng** thành các điểm nhỏ, override những điểm đó — phần còn lại (thuật toán xây cuộc đua) **tái sử dụng nguyên vẹn**.

---

## 5. Mẫu tạo lập: Factory object

### Vấn đề của factory method

- Khi có **nhiều đối tượng** phải dựng, việc đưa factory method vào **mỗi lớp** có thể làm **phình mã** và khó thay đổi.
- Các lớp con **anh em** (sibling subclasses) **không dễ** chia sẻ cùng một factory method.

> **Factory object** là đối tượng **đóng gói** các factory methods.

### Hiện thực hóa

```java
class BicycleFactory {
    Frame createFrame() { return new Frame(); }
    Wheel createWheel() { return new Wheel(); }
    Bicycle createBicycle(Frame frame, Wheel front, Wheel rear) {
        return new Bicycle(frame, front, rear);
    }
    // trả về xe đạp hoàn chỉnh không cần đối số
    Bicycle completeBicycle() {
        Frame frame = createFrame();
        Wheel frontWheel = createWheel();
        Wheel rearWheel = createWheel();
        return createBicycle(frame, frontWheel, rearWheel);
    }
}

class RacingBicycleFactory {
    Frame createFrame() { return new RacingFrame(); }
    Wheel createWheel() { return new Wheel700c(); }
    Bicycle createBicycle(Frame frame, Wheel front, Wheel rear) {
        return new RacingBicycle(frame, front, rear);
    }
}

class MountainBicycleFactory {
    Frame createFrame() { return new MountainFrame(); }
    Wheel createWheel() { return new Wheel26inch(); }
    Bicycle createBicycle(Frame frame, Wheel front, Wheel rear) {
        return new RacingBicycle(frame, front, rear);
    }
}
```

Các phương thức `Race` dùng đối tượng factory:

```java
class Race {
    BicycleFactory bfactory;
    // constructor
    Race() {
        bfactory = new BicycleFactory();
    }
    Race createRace() {
        Bicycle bike1 = bfactory.completeBicycle();
        Bicycle bike2 = bfactory.completeBicycle();
        ...
    }
}

class TourDeFrance extends Race {
    TourDeFrance() {
        bfactory = new RacingBicycleFactory();
    }
}

class Cyclocross extends Race {
    Cyclocross() {
        bfactory = new MountainBicycleFactory();
    }
}
```

### Linh hoạt hơn nữa: truyền factory qua constructor

Trong phiên bản trên, **loại xe đạp vẫn hard-code** vào từng biến thể cuộc đua. Có cách **linh hoạt hơn**, đòi hỏi đổi cách khách hàng gọi constructor:

```java
class Race {
    BicycleFactory bfactory;
    Race(BicycleFactory bfactory) {
        this.bfactory = bfactory;
    }
    Race createRace() {
        Bicycle bike1 = bfactory.completeBicycle();
        Bicycle bike2 = bfactory.completeBicycle();
        ...
    }
}

class TourDeFrance extends Race {
    TourDeFrance(BicycleFactory bfactory) {
        this.bfactory = bfactory;
    }
}

class Cyclocross extends Race {
    Cyclocross(BicycleFactory bfactory) {
        this.bfactory = bfactory;
    }
}
```

> Đây là cơ chế **linh hoạt nhất trong tất cả**. Giờ khách hàng kiểm soát **cả biến thể cuộc đua lẫn biến thể xe đạp**, ví dụ qua lời gọi:
>
> ```java
> new TourDeFrance(new TricycleFactory())
> ```

### Vì sao cần factory — điểm yếu của constructor Java

> Constructor Java **luôn trả về đối tượng của kiểu chỉ định**. Chúng **không bao giờ** trả đối tượng của **kiểu con**, dù điều đó **đúng kiểu** (theo cả kiểu con Java lẫn true behavior subtyping — Bài 14).

Thực tế, `createRace` **chính nó là một factory method**.

---

## 6. Mẫu tạo lập: Prototype

### Ý tưởng

> Mẫu **prototype** cung cấp cách khác để dựng đối tượng của **kiểu tùy ý**. Thay vì truyền vào đối tượng `BicycleFactory`, một đối tượng `Bicycle` được truyền vào. Phương thức `clone` của nó được gọi để tạo xe mới — ta đang **tạo bản sao** của đối tượng given.

```java
class Bicycle {
    Object clone() { ... }
}
class Frame { Object clone() { ... } }
class Wheel { Object clone() { ... } }
class RacingBicycle { Object clone() { ... } }
class RacingFrame { Object clone() { ... } }
class Wheel700c { Object clone() { ... } }
class MountainBicycle { Object clone() { ... } }
class MountainFrame { Object clone() { ... } }
class Wheel26inch { Object clone() { ... } }

class Race {
    Bicycle bproto;
    Race(Bicycle bproto) {
        this.bproto = bproto;
    }
    Race createRace() {
        Bicycle bike1 = (Bicycle) bproto.clone();
        Bicycle bike2 = (Bicycle) bproto.clone();
        ...
    }
}

class TourDeFrance extends Race {
    TourDeFrance(Bicycle bproto) {
        this.bproto = bproto;
    }
}

class Cyclocross extends Race {
    Cyclocross(Bicycle bproto) {
        this.bproto = bproto;
    }
}
```

> Về bản chất, **mỗi đối tượng tự nó là một factory** chuyên tạo đối tượng giống chính nó.

- Prototype thường dùng trong ngôn ngữ **động** như Smalltalk; **ít dùng hơn** trong ngôn ngữ **tĩnh** như C++ và Java.

### "Không có bữa trưa miễn phí"

> Code để tạo đối tượng của các lớp cụ thể **phải đi đâu đó**.

| Mẫu | Code nằm ở đâu |
|---|---|
| **Factory method** | Các phương thức trong **client** |
| **Factory object** | Các phương thức trong một **đối tượng factory** |
| **Prototype** | Các phương thức **`clone`** |

---

## 7. Tổng kết nhóm mẫu tạo lập

| Mẫu | Cách tạo | Linh hoạt | Chi phí thiết kế |
|---|---|---|---|
| **Factory method** | Override `create...` trong lớp con | Loại xe bị ràng buộc bởi lớp con | Thấp — thêm vài phương thức |
| **Factory object** | Đối tượng factory riêng, truyền qua constructor | **Cao nhất** — client chọn độc lập cuộc đua + xe | Trung bình — thêm lớp factory |
| **Prototype** | `clone()` đối tượng mẫu | Cao — đối số là bất kỳ đối tượng nào có `clone` | Trung bình — phải viết `clone` cho mọi lớp |

---

## 8. Mẫu hành vi: Observer

### Bối cảnh: bảng điểm

Giả sử có **cơ sở dữ liệu điểm** của mọi sinh viên MIT, và **ban tổ chức 6.170** muốn xem điểm của sinh viên 6.170. Họ viết lớp `SpreadsheetView` hiển thị thông tin từ database.

*(Giả định viewer **cache** thông tin về sinh viên 6.170 — cần cho việc vẽ lại — nhưng việc đó có cache hay không không phải phần quan trọng của thảo luận.)*

Hiển thị có thể trông như:

```
          PS1  PS2  PS3
G. Bates   45   85   80
A. Hacker  95   90   85
A. Turing  90  100   95
```

Giao diện giao tiếp giữa database và view:

```java
interface GradeDBViewer {
    void update(String course, String name, String assignment, int grade);
}
```

### Thiết kế hard-code — và cái giá của nó

Khi thông tin điểm mới sẵn sàng (bài tập mới được chấm, hoặc chấm lại), database **phải truyền** thông tin đó cho view. Giả sử **Gill Bates** yêu cầu chấm lại PS1 và phát hiện lỗi: điểm đúng phải là 30. Mã database phải ở đâu đó gọi `SpreadsheetView.update`:

```java
SpreadsheetView ssv = new SpreadsheetView();
...
ssv.update("6.170", "G. Bates", "PS1", 30);
```

View sẽ vẽ lại:

```
          PS1  PS2  PS3
G. Bates   30   85   80
A. Hacker  95   90   85
A. Turing  90  100   95
```

Ban tổ chức sau đó muốn thêm view **biểu đồ cột** điểm trung bình:

```
        95  90
        70
       G.B. A.H. A.T.
```

Duy trì view này **bên cạnh** view bảng tính đòi hỏi **sửa mã database**:

```java
SpreadsheetView ssv = new SpreadsheetView();
BargraphView bgv = new BargraphView();
...
ssv.update("6.170", "G. Bates", "PS1", 30);
bgv.update("6.170", "G. Bates", "PS1", 30);
```

Tương tự, thêm view **biểu đồ tròn**, hoặc **bỏ** một view, lại đòi thêm sửa mã database.

> Lập trình hướng đối tượng (chưa nói đến thực hành lập trình tốt) được cho là mang lại **sự giải thoát** khỏi các sửa đổi hard-coded như vậy: mã nên **tái sử dụng** mà không cần **chỉnh sửa và biên dịch lại** cả client lẫn hiện thực hóa.

### Giải pháp Observer

> Thay vì hard-code view nào sẽ update, database duy trì **danh sách các observer** cần được **thông báo** khi trạng thái đổi.

```java
Vector observers = new Vector();
...
for (int i = 0; i < observers.size(); i++) {
    GradeDBViewer v = (GradeDBViewer) observers.get(i);
    v.update("6.170", "G. Bates", "PS1", 30);
}
```

Để khởi tạo danh sách observer, database cung cấp hai phương thức thêm/bỏ:

```java
void register(GradeDBViewer observer) {
    observers.add(observer);
}

boolean remove(GradeDBViewer observer) {
    return observers.remove(observer);
}
```

> Mẫu observer cho phép **mã khách hàng** (quản lý database và các viewer) **chọn observer nào hoạt động**, và observer có thể được thêm/bỏ **ngay lúc chạy** (at run-time).

### Chi tiết bị bỏ qua — push và pull

Thảo luận này **lướt qua** nhiều chi tiết. Ví dụ:

- Khách hàng có thể **lưu mọi thông tin quan tâm** với nó (toàn bộ điểm 6.170, hoặc chỉ của vài sinh viên, hoặc chỉ số lần database được cập nhật cho `DatabaseActivityViewer`) — **trùng lặp** một phần database; **hoặc** khách hàng **đọc database khi cần**.
- Quyết định thiết kế liên quan: database **truyền mọi thông tin potentially liên quan** khi update xảy ra (**cấu trúc push**), hay database chỉ **thông báo** "có update xảy ra" (**cấu trúc pull**).

| Cấu trúc | Ưu điểm | Nhược điểm |
|---|---|---|
| **Push** | Client không phải chủ động hỏi | Truyền **nhiều dữ liệu** hơn — kể cả khi client không cần |
| **Pull** | Client **chủ động yêu cầu** thông tin → **ít tin nhắn hơn**, **tổng lượng dữ liệu truyền nhỏ hơn** | Nhiều lượt qua lại hơn |

---

## 9. Mẫu hành vi: Blackboard

### Định nghĩa

> Mẫu **blackboard** **tổng quát hóa** mẫu observer, cho phép **nhiều nguồn dữ liệu** cũng như **nhiều người xem**. Nó cũng có hiệu quả **giải phóng hoàn toàn** (completely decoupling) nhà **sản xuất** và nhà **tiêu thụ** thông tin.

- **Blackboard** là **kho chứa thông điệp** mà **mọi tiến trình có thể đọc và ghi**.
- Khi một **sự kiện** xảy ra có thể khiến bên khác quan tâm, tiến trình **trách nhiệm hoặc biết về** sự kiện đó **thêm vào blackboard một thông báo** về sự kiện.
- Các tiến trình khác **đọc** blackboard. Trong trường hợp điển hình, chúng **bỏ qua** phần lớn nội dung không liên quan, nhưng có thể **hành động** trên sự kiện khác.
- Tiến trình đăng thông báo **không idea** liệu có **0, 1, hay nhiều** tiến trình khác đang chú ý.

### Đặc điểm kỹ thuật

- Blackboard nhìn chung **không ép cấu trúc** particular lên thông báo, nhưng cần **định dạng thông điệp được hiểu tốt** để các tiến trình **hợp tác được** (interoperate).
- Một số blackboard cung cấp **dịch vụ lọc** để client không thấy mọi thông báo, chỉ loại particular; blackboard khác **tự động gửi** thông báo tới client đã **đăng ký quan tâm** (đây là cấu trúc pull).

### Ví dụ thực tế

| Ví dụ | Ghi chú |
|---|---|
| **Bảng tin** (bulletin board) vật lý hoặc điện tử | Ví dụ điển hình |
| **Zephyr** — dịch vụ nhắn tin tại MIT | Blackboard |
| **Hearsay-II** — hệ thống nhận dạng giọng nói | Hệ thống blackboard **lớn đầu tiên**, hiện thực hóa 1971–1976 |

> *Ghi chú tên gọi:* giáo trình Liskov gọi mẫu này là **"whiteboard"** thay vì **"blackboard"**. Tên trước nghe **hiện đại hơn**, nhưng tên sau là **thuật ngữ khoa học máy tính chuẩn**, đã dùng **hàng thập kỷ**, sẽ được **nhận ra nhanh hơn** bên ngoài 6.170.

---

## 10. Mẫu cấu trúc: Wrapper — adapter, decorator, proxy

### Wrapper là gì

> **Wrapper** (lớp bọc) **sửa đổi hành vi** của một lớp khác; thường là một **lớp vỏ mỏng** (thin veneer) trên lớp được đóng gói — lớp đó **làm việc thật**.

Wrapper có thể:

- **Sửa đổi giao diện**,
- **Mở rộng** hành vi,
- **Hoặc hạn chế** truy cập.

Wrapper **làm trung gian** giữa hai giao diện **không tương thích**, **dịch** các lời gọi giữa chúng. Điều này cho phép hai đoạn mã **không được thiết kế/viết cùng nhau** — do đó **hơi không tương thích** — vẫn **dùng cùng nhau**.

### Ba biến thể

| Mẫu | Chức năng (functionality) | Giao diện (interface) |
|---|---|---|
| **Adapter** | **Giống** (same) | **Khác** (different) |
| **Decorator** | **Khác** | **Giống** |
| **Proxy** | **Giống** | **Giống** |

*(Chức năng và giao diện được so sánh là ở **trong** và **ngoài** wrapper: góc nhìn của khách hàng về đối tượng được bọc so với góc nhìn về wrapper.)*

---

## 11. Adapter

> **Adapter** **đổi giao diện** của một lớp **mà không đổi** chức năng cơ bản của nó.

Ví dụ: cho phép **hợp tác chéo** (interoperability) giữa một gói hình học yêu cầu góc tính bằng **radian** và một client mong truyền góc theo **độ**.

### 11.1 Ví dụ: Rectangle

Giả sử có mã hoạt động với đối tượng `Rectangle` và gọi `scale`:

```java
interface Rectangle {
    // co hoặc giãn this theo hệ số given
    void scale(float factor);
    // các hoạt động khác
    float area();
    float circumference();
    ...
}

class myClass {
    void myMethod(Rectangle r) {
        ...
        r.scale(2);
        ...
    }
}
```

Có lớp `NonScaleableRectangle` **thiếu** `scale` nhưng có các phương thức khác của `Rectangle`, cộng thêm `setWidth`/`setHeight`:

```java
class NonScaleableRectangle {
    void setWidth(float width) { ... }
    void setHeight(float height) { ... }
    ...
}
```

Muốn dùng lớp này (vì nó có tính chất mong muốn như **hiệu năng tốt hơn**, hoặc vì nó dùng ở nơi khác trong hệ thống cần hợp tác) — nhưng **không dùng trực tiếp được** vì **giao diện không tương thích**.

**Hai cách viết adapter:**

**Cách 1 — subclassing:**

```java
class ScaleableRectangle1 extends NonScaleableRectangle implements Rectangle {
    void scale(float factor) {
        setWidth(factor * getWidth());
        setHeight(factor * getHeight());
    }
}
```

**Cách 2 — composition/forwarding** (kỹ thuật "chuyền quả bóng", forward yêu cầu để đối tượng **khác** làm việc được yêu cầu):

```java
class ScaleableRectangle2 implements Rectangle {
    NonScaleableRectangle r;

    ScaleableRectangle2(NonScaleableRectangle r) {
        this.r = r;
    }

    void scale(float factor) {
        r.setWidth(factor * r.getWidth());
        r.setHeight(factor * r.getHeight());
    }

    float area() { return r.area(); }
    float circumference() { return r.circumference(); }
    ...
}
```

### 11.2 Ví dụ: ColorPalette (chuyện thật)

Giáo sư Guttag gọi giáo sư Devadas **khuya** vì có người phát hiện vấn đề với problem set: cần hỗ trợ xe đạp **tái sơn** (đổi màu). Hai ông chia việc:

- **Guttag** viết lớp `ColorPalette` — phương thức given tên như "red", "blue", "taupe" trả về **mảng ba giá trị RGB**.
- **Devadas** viết mã dùng lớp đó.

Hai ông làm xong, **kiểm thử**, rồi **đi nghỉ cuối tuần**, để file `.class` cho TA **tổng hợp**. TA phát hiện:

Mã của Devadas phụ thuộc:

```java
interface ColorPalette {
    // trả về giá trị RGB
    int[] getColorPalette(String name);
}
```

Nhưng lớp của Guttag lại tuân:

```java
interface ColorPallet {
    // trả về giá trị RGB
    int[] getColorPallet(String name);
}
```

*(Lưu ý: `Palette` vs `Pallet`, `getColorPalette` vs `getColorPallet` — khác một chữ.)*

**TA làm gì?** Họ **không có source**, **không có thời gian** hiện thực hóa lại và kiểm thử lại. Giải pháp: viết một adapter cho `ColorPallet` **đổi tên hoạt động**. Implement adapter bằng subclassing hoặc composition/forwarding — như đã nói ở Bài 15 (tài liệu 05).

> **Bài học thực tiễn:** adapter giải quyết cả những "lỗi tiếng Anh" tích hợp — chi phí cực thấp so với tái hiện thực hóa.

---

## 12. Decorator

> Trong khi adapter **đổi giao diện** mà **không thêm chức năng** mới, một decorator **mở rộng chức năng** trong khi **giữ nguyên giao diện**.

Thường decorator **không đổi** chức năng hiện có, chỉ **thêm vào** → đối tượng của lớp kết quả **hành xử chính xác như bản gốc**, nhưng **còn làm thêm**.

### Không phải mọi subclassing đều là decoration

Nghe giống subclassing, nhưng **khung khác**:

| Khác biệt | Subclassing | Decorator |
|---|---|---|
| Hiện thực hóa hoạt động | Có thể **hoàn toàn khác** hoặc **viết lại** trong lớp con | Thường **không** — decorator chứa chức năng **ít hơn tương đối** và **tái sử dụng** mã lớp cha |
| Thao tác mới | Lớp con **có thể giới thiệu** thao tác mới | Wrapper (gồm decorator) nhìn chung **không** |

### Ví dụ: Window / BorderedWindow

```java
interface Window {
    // hình chữ nhật bao quanh cửa sổ
    Rectangle bounds();
    // vẽ this lên màn hình specified
    void draw(Screen s);
    ...
}

class WindowImpl implements Window {
    ...
}
```

`BorderedWindow` hành xử **đúng như** `Window`, trừ việc nó còn **vẽ viền** (border) xung quanh.

**Cách subclassing:**

```java
class BorderedWindow1 extends WindowImpl {
    void draw(Screen s) {
        super.draw(s);
        bounds().draw(s);
    }
}
```

**Cách composition/forwarding:**

```java
class BorderedWindow2 implements Window {
    Window innerWindow;

    BorderedWindow2(Window innerWindow) {
        this.innerWindow = innerWindow;
    }

    void draw(Screen s) {
        innerWindow.draw(s);
        innerWindow.bounds().draw(s);
    }
}
```

---

## 13. Proxy

> **Proxy** là wrapper có **cùng giao diện** và **cùng chức năng** với lớp nó bọc.

Nghe qua **không hữu ích**. Tuy nhiên proxy phục vụ mục đích quan trọng: **kiểm soát truy cập** vào đối tượng khác. Đặc biệt giá trị khi đối tượng đó phải được truy cập theo cách **theo hình thức hoặc phức tạp**.

### 13.1 Proxy cho đối tượng từ xa

Nếu đối tượng ở **máy từ xa**, truy cập đòi hỏi dùng nhiều **cơ sở hạ tầng mạng**. Dễ hơn: tạo proxy **cục bộ** hiểu mạng và thực hiện thao tác cần thiết, rồi trả kết quả. Điều này **đơn giản hóa client** bằng cách **cục bộ hóa** mã riêng của mạng tại **vị trí khác**.

### 13.2 Proxy khóa (locking)

Nếu đối tượng có thể bị **nhiều client** truy cập, nó có thể cần **khóa**:

- Khóa biểu thị **quyền đọc và/hoặc cập nhật** đối tượng.
- Không có khóa: cập nhật đồng thời có thể để đối tượng ở **trạng thái không nhất quán**; hoặc đọc **giữa chuỗi** cập nhật có thể quan sát **trạng thái không nhất quán**.

Proxy có thể **chăm sóc việc khóa** đối tượng trước một (chuỗi) thao tác, rồi **mở khóa** sau đó. **Ít dễ sai hơn** là bắt client tự hiện thực hóa **giao thức khóa** đúng.

### 13.3 Proxy an ninh

Hoạt động đúng nếu người gọi có **thông tin chứng thực hợp lệ** (vd chứng chỉ Kerberos hợp lệ), nhưng **ném lỗi** khi người dùng **không được phép** cố thực hiện thao tác.

### 13.4 Proxy cho đối tượng chưa tồn tại

Nếu việc **tạo đối tượng đắt** (vì tính toán hoặc độ trễ mạng), nó có thể được **đại diện bằng proxy**:

| Chiến lược | Hành vi | Lợi ích |
|---|---|---|
| **Tạo trước ở nền** | Proxy **ngay lập tức bắt đầu** tạo đối tượng trong tác vụ nền, hy vọng nó sẵn sàng trước khi thao tác đầu được gọi | Phần còn lại của hệ thống **tiến được mà không chờ** |
| **Trễ tạo** | Trì hoãn tạo tới khi thao tác đầu được gọi | Việc tạo **không bao giờ phải làm** nếu không bao giờ dùng |

**Ở cả hai trường hợp, thao tác bị trì hoãn cho tới khi đối tượng sẵn sàng.**

**Ví dụ: `autoload` của Emacs.** File `util-mde.el` định nghĩa nhiều hàm hữu ích, nhưng không muốn **làm chậm Emacs** bằng cách nạp nó mỗi lần khởi động. Thay vào đó `.emacs` chứa:

```elisp
(autoload 'looking-back-at "util-mde")
(autoload 'in-buffer "util-mde")
(autoload 'in-window "util-mde")
```

Dạng `(autoload 'function "file")` về bản chất tương đương (theo cú pháp Scheme; Emacs Lisp dùng `defun`):

```scheme
(define (function)
  (load "file")     ;; định nghĩa lại function
  (function)        ;; gọi phiên bản mới
)
```

Emacs autoload **phần lớn chức năng của chính nó** — từ trình đọc mail/tin tức tới chế độ soạn thảo Java. Người phàn nàn Emacs **khởi động chậm** thường đã put các biểu thức `load` **bừa bãi** vào `.emacs` — giống như dùng hiện thực hóa **kém hiệu quả** rồi phàn nàn trình biên dịch dở vì chương trình chạy chậm.

### Tổng kết proxy

> Khả năng proxy đặc biệt hữu ích khi client **không biết** đối tượng nó thao tác có **tính chất đặc biệt** không (ở máy từ xa, cần khóa/an ninh, hay chưa được nạp). Tốt nhất nên **cách ly client** khỏi các mối quan tâm đó và **cục bộ hóa chúng trong wrapper proxy**.

---

## 14. Kế thừa so với composition/forwarding

Cả adapter và decorator đều có thể hiện thực hóa bằng **hai chiến lược**: subclassing và composition/forwarding.

### So sánh

| Tiêu chí | Subclassing (kế thừa) | Composition/forwarding (bọc) |
|---|---|---|
| Quan hệ kiểu | Lớp con **phải là kiểu con thật** | **Không yêu cầu** — chỉ chứa đối tượng |
| Tái sử dụng mã lớp cha | **Tự động** (kể cả `super`) | Phải **gọi tường minh** từng phương thức |
| Phá encapsulation | **Có** — phụ thuộc hiện thực hóa lớp cha (tài liệu 05, mục 15) | **Không** — chỉ phụ thuộc giao diện |
| Chi phí viết | Thấp hơn | Cao hơn chút — viết **nhiều phương thức forwarding** (nhưng chỉ **một** constructor) |
| Giao diện | Bị ràng buộc bởi lớp cha (override không được giảm truy cập) | **Tự do** — expose API nhỏ hơn/simpler |
| Số lớp con từ một lớp cha | **Một** dòng kế thừa | **Bao nhiêu** wrapper tùy ý, tổ hợp tự do |

### Quy tắc nhắc lại (liên hệ tài liệu 05, mục 17)

> Trước khi `extends`: **"Mọi B có thật sự là một A không?"** — nếu không, B nên **chứa** một đối tượng private của A.

---

## 15. Bảng thuật ngữ và bài tập

### Bảng thuật ngữ (Anh – Việt)

| Tiếng Anh | Tiếng Việt |
|---|---|
| design pattern | mẫu thiết kế |
| creational / behavioral / structural pattern | mẫu tạo lập / hành vi / cấu trúc |
| factory method | phương thức nhà máy |
| factory object | đối tượng nhà máy |
| prototype | nguyên mẫu |
| clone | sao chép (phương thức) |
| observer | người quan sát (mẫu) |
| register / remove (observer) | đăng ký / gỡ |
| push / pull structure | cấu trúc đẩy / kéo |
| blackboard | bảng đen (mẫu) |
| wrapper | lớp bọc |
| adapter | bộ chuyển đổi (mẫu) |
| decorator | bộ trang trí (mẫu) |
| proxy | đại diện (proxy) |
| forwarding | chuyển tiếp |
| indirection | sự gián tiếp |
| trade-off | đánh đổi |
| vocabulary (of patterns) | từ vựng |
| interoperate | hợp tác chéo |
| autoload | tự động nạp |
| stylized access | truy cập theo hình thức |

### Bài tập suy nghĩ

1. Với mỗi mẫu trong mục 2 (encapsulation, subclassing, iteration, exceptions): nêu **một tình huống cụ thể** mà nhược điểm của nó **trở thành vấn đề thật**.
2. Áp dụng quy trình mục 3 cho một đoạn mã bạn thấy "lẽ ra dễ mà không dễ": vấn đề gì? Mẫu nào trong tài liệu này giải quyết được?
3. So sánh ba cách tạo `Race`: với 10 loại cuộc đua × 5 loại xe, cách nào tốn ít mã nhất? Cách nào linh hoạt nhất cho client?
4. Observer push vs pull: với 1000 update/giây và mỗi client chỉ cần 1% thông tin, chọn cấu trúc nào? Vì sao?
5. Với `ScaleableRectangle`, chọn subclassing hay composition? Gợi ý: xét `NonScaleableRectangle` có phải `Rectangle` **thật sự** không.
6. Proxy "tạo trước ở nền": viết pseudocode cho proxy đó với một đối tượng `Database` mất 2 giây để mở kết nối.
7. Vì sao prototype "ít dùng hơn trong ngôn ngữ tĩnh"? Java có cơ chế nào hỗ trợ prototype không?

---

*Nguồn: MIT 6.170 Lecture 18 (Design Patterns), Fall 2005. Đọc kèm: Chương 15, Program Development in Java — Barbara Liskov.*
