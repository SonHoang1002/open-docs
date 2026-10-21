# Kinh nghiệm dự án thiết kế — Dự án Thang máy Không gian & Quản lý nhóm nhỏ

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering*, Fall 2005 — ba bài:

- **Bài 19: Design Project Experiences — Space Elevator Simulator, Part I** (MDD tiến hóa, phân cấp lớp cho Viewer, Observer, `java.beans`)
- **Bài 20: Design Project Experiences — Space Elevator Simulator, Part II** (Visitor pattern, double dispatching, Java 3D, báo cáo dự án)
- **Bài 21: Managing a Small Software Team** (cuộc họp, ý tưởng, versioning — *"cách làm bài tập cuối kỳ với bạn bè mà vẫn còn bạn bè sau học kỳ"*)

---

## Mục lục

**Phần I — Dự án Thang máy không gian (Bài 19–20)**

1. [Bối cảnh: thang máy không gian là gì?](#1-bối-cảnh-thang-máy-không-gian-là-gì)
2. [Dự án mùa hè và tính năng](#2-dự-án-mùa-hè-và-tính-năng)
3. [MDD đầu tiên và bài toán mở rộng](#3-mdd-đầu-tiên-và-bài-toán-mở-rộng)
4. [MDD thứ hai — nguyên tắc thiết kế rút ra](#4-mdd-thứ-hai--nguyên-tắc-thiết-kế-rút-ra)
5. [Phân cấp lớp cho Viewer](#5-phân-cấp-lớp-cho-viewer)
6. [Nhiều view và Observer pattern](#6-nhiều-view-và-observer-pattern)
7. [Hỗ trợ của java.beans — PropertyChangeSupport](#7-hỗ-trợ-của-javabeans--propertychangesupport)
8. [Bài toán Visitor: thêm thao tác khó hơn thêm lớp con](#8-bài-toán-visitor-thêm-thao-tác-khó-hơn-thêm-lớp-con)
9. [Visitor và double dispatching](#9-visitor-và-double-dispatching)
10. [Đánh đổi của Visitor](#10-đánh-đổi-của-visitor)
11. [Java 3D và scene graph (tóm tắt)](#11-java-3d-và-scene-graph-tóm-tắt)
12. [Báo cáo dự án — nhìn lại](#12-báo-cáo-dự-án--nhìn-lại)

**Phần II — Quản lý nhóm nhỏ (Bài 21)**

13. [Cuộc họp có ý nghĩa — 4 vai trò](#13-cuộc-họp-có-ý-nghĩa--4-vai-trò)
14. [Ý tưởng có ảnh hưởng — 3 quy tắc](#14-ý-tưởng-có-ảnh-hưởng--3-quy-tắc)
15. [Versioning — tầm nhìn về phiên bản](#15-versioning--tầm-nhìn-về-phiên-bản)
16. [Mẹo phút chót](#16-mẹo-phút-chót)
17. [Bảng thuật ngữ và bài tập](#17-bảng-thuật-ngữ-và-bài-tập)

---

# Phần I — Dự án Thang máy không gian (Bài 19–20)

## 1. Bối cảnh: thang máy không gian là gì?

### Ý tưởng sci-fi

- **Thang máy cao 60.000 dặm** để **chở hàng vào không gian**.
- Giải pháp kiểu **sci-fi**: bắt một **tiểu hành tinh** → đặt vào **quỹ đạo quanh Trái Đất** → **khai thác carbon** của nó → một **dây cáp lớn được kéo** lên trên và xuống dưới cho tới khi hoàn thành.

### Gợi ý của Arthur C. Clarke

| Năm | Nội dung |
|---|---|
| **1978** — *"The Fountains of Paradise"* | **Phát minh** sợi carbon monofilament siêu mạnh và xây **cụm cáp** (!); xây **tháp đặc** quanh bộ khung cáp (??); kéo tháp vượt quỹ đạo địa tĩnh tới **trọng lượng đối** lớn |
| **1991** | Phát minh **ống nano carbon** → khái niệm chuyển từ **sci-fi** sang **phía rìa của thực tế** |
| **2002** — Edwards & Westling, *"The Space Elevator"* | Nghiện cứu khả thi **do NASA tài trợ** |

### "Thang máy không gian thực tế" (Edwards & Westling, 2002)

1. Tàu vũ trụ được phóng vào quỹ đạo **địa tĩnh (35.000 km)**.
2. Tàu **hạ dải mỏng** (ribbon) về phía mặt đất, và **di chuyển ra ngoài** để giữ nó không rơi — cuối cùng kết thúc ở **100.000 km** làm **trọng lượng đối**.
3. Khi dải chạm Trái Đất, nó được **buộc vào trạm gốc** (nền nổi ngoài khơi Ecuador).
4. Để **gia cố và làm rộng** dải ban đầu, các **climber** (leo dốc) được **cung cấp năng lượng bằng laser** từ mặt đất **khâu thêm dải** trong **2½ năm**.
5. Dải **rộng 3 feet** và **chịu được 13 tấn** khi thang máy hoàn thành.

### Vì sao cần thang máy không gian? (theo thứ tự thời gian)

| # | Lợi ích |
|---|---|
| 1 | **Chở vệ tinh vào không gian rẻ** |
| 2 | **Bộ thu thập quang điện quỹ đạo lớn** — tạo và truyền điện về Trái Đất |
| 3 | **Trạm vũ trụ có người** tại quỹ đạo địa tĩnh |
| 4 | **Khám phá và thuộc địa hóa Sao Hỏa có người** |
| 5 | **Cơ sở nghỉ mát tương lai trong không gian** |

**Trích dẫn nổi tiếng:**

> *"Thang máy không gian sẽ được xây khoảng 50 năm sau khi mọi người ngừng cười."* — Arthur C. Clarke, 1985
>
> *"Nó sẽ được xây 10 năm sau khi mọi người ngừng cười — và tôi nghĩ họ đã ngừng cười."* — Arthur C. Clarke, 2003, Hội nghị Thang máy Không gian lần 2, New Mexico

---

## 2. Dự án mùa hè và tính năng

### Mục tiêu

> **Dự án mùa hè:** có được **trải nghiệm thực tế** về dự án kiểu 6.170 — một **mô phỏng thang máy không gian**.

### Người & Lịch trình

| | |
|---|---|
| **Thành viên** | Dwaine Clarke, Srini Devadas, Blaise Gassend, Daihyun Lim |
| **6 tuần** làm việc **nghỉ nghỉ** | Sản xuất hiện thực hóa **sơ khai [và đầy bug]** |
| **Hoàn thành [và debug]** bởi | Lee Lin và Matt Notowidigdo |
| **Quy mô** | **~3.600 dòng mã**; **2 tuần** MDD, phân cấp lớp và mô hình đối tượng |

### Chức năng

- **Mô phỏng và xem** động học thang máy không gian.
- Đối tượng chính: **Central planet** (Trái Đất), **cable**, **counterweight**, **climber**.
- Cáp được mô hình hóa bằng **khối lượng và lò xo** (masses and springs).
- Lực chính: **hấp dẫn** (gravitational), **ly tâm** (centrifugal) và **Coriolis**.

> **Coriolis** là lực quán tính tác động lên đối tượng **di chuyển trong hệ tọa độ quay**. Nhờ lực Coriolis, đối tượng thực ra **không lệch khỏi quỹ đạo**, nhưng **trông như lệch** vì chuyển động của hệ tọa độ.

- **Nhiều view:** file văn bản, **Swing**, **Java 3D**.

---

## 3. MDD đầu tiên và bài toán mở rộng

### MDD thứ nhất

```
        GUI                    World
         │                      │
   ┌─────┴─────┐         ┌──────┴──────┐
   ▼           │         ▼             │
 SimOut        │    SimStruct ◀──── TimeSim
 (hiện)        │   (tạo phần tĩnh)   (cập nhật)
               │
      Invokes TimeSim methods
      Creates SimOut objects
```

Các cung (theo nguồn):

| Cung | Ý nghĩa |
|---|---|
| GUI → SimOut | **Hiện** SimOut |
| GUI → TimeSim | **Gọi** các phương thức TimeSim |
| GUI → World | **Hiện** World |
| World → SimStruct | **Tạo** các phần tĩnh của SimStruct |
| TimeSim → SimStruct | **Cập nhật động và đọc** SimStruct |
| TimeSim → SimOut | **Tạo** đối tượng SimOut |

### Định nghĩa các mô-đun

| Mô-đun | Vai trò |
|---|---|
| **World** | **Tất cả** các thành phần trong thang máy không gian và không gian — tối thiểu: **hành tinh trung tâm, cáp, climber, trọng lượng đối**. Có thể thêm hành tinh khác (vd Mặt Trăng) và mô tả cáp là **tập hợp** nhiều cáp |
| **SimStruct** | **Cấu trúc mô phỏng cơ bản** do World và TimeSim tạo. Đối tượng World **biến thành** đối tượng SimStruct — ví dụ: cáp → **tập hợp khối lượng và lò xo**. Vị trí và vận tốc của thành phần World **nằm trong** SimStruct |
| **TimeSim** | Chứa các phương thức **mô phỏng** thành phần World + các **phương trình mô hình hóa lực vật lý**. **Liên tục cập nhật** SimStruct trong khi mô phỏng |
| **SimOut** | **Thống kê** thu thập trong mô phỏng: lực lớn nhất, lực nhỏ nhất, v.v. |

### "Một chút chi tiết hơn" — bài toán

Thêm **Draw** (gọi phương thức truy cập dữ liệu World và vẽ), **World Editor** (thêm thành phần World), **SimEditor**.

> **Vấn đề:** nó **không mở rộng được** (not very extensible) nếu muốn **thêm thành phần khác** cho World — nói thêm **Mặt Trăng**, bên cạnh Central Planet, cable, v.v.

---

## 4. MDD thứ hai — nguyên tắc thiết kế rút ra

### Thiết kế lại: đối tượng tự vẽ/mô phỏng chính nó

```
                         Main
                          │
            ┌─────────────┼─────────────┐
            ▼             │             ▼
     SimOut Viewer        │          Editor
            │             │             │
            ▼             ▼             │
        Draw(Swing) ◀── World ──────────┘ (nghịch luân: tight coupling)
                          │
            ┌─────────────┼─────────────┐
            ▼             │             ▼
      SimStruct ◀──── TimeSim      (World gọi Draw methods)
   (cập nhật động)   (gọi methods)
```

Các cung chính (theo nguồn):

| Cung | Ý nghĩa |
|---|---|
| Main → World | **Tạo, biến đổi** (creation, mutation) |
| Main → SimOut Viewer / Editor | **Khởi động, làm mới** (startup, refresh) |
| Editor → World | **Constructor** |
| World → TimeSim | **Gọi** các phương thức TimeSim |
| World → Draw | **Gọi** các phương thức Draw |
| TimeSim → SimStruct | **Cập nhật động và đọc** SimStruct |

### Nguyên tắc thiết kế then chốt rút ra

> Hãy để các đối tượng trong World **gọi các phương thức Draw** và **tự vẽ chính nó**. Điều này làm cho World **mở rộng hơn** vì có thể **thêm mô-đun và thêm hàm vẽ của chúng**.
>
> **Nói chung, nếu bạn có một mô-đun phải liên tục thay đổi trong vòng đời phần mềm, đó là ý tốt giảm phụ thuộc VÀO mô-đun đó. Mô-đun mở rộng được nên phụ thuộc vào các mô-đun đổi ít thường xuyên hơn.**

*(Đây là dạng đảo ngược phụ thuộc — liên hệ tài liệu 05 về coupling và tài liệu 04 về tính độc lập biểu diễn.)*

Tương tự: các đối tượng trong World **gọi các phương thức mô phỏng** để mô phỏng động học của chính chúng.

### Quan sát cấu trúc

- Rõ ràng **World là mô-đun/ADT trung tâm**.
- **World và Editor tightly coupled**: World cần gọi phương thức Editor để **sửa các đối tượng của nó**, và Editor cần gọi phương thức World để **cập nhật đối tượng mới** hoặc **cập nhật vị trí**.

---

## 5. Phân cấp lớp cho Viewer

```
        World (module)
          │ chứa
    ┌─────┴──────┐
WorldStructure   Simulator
 (mảng các        │
  WorldElement)
    │
WorldElement (abstract class)
    │
┌───┴────┐
Cable   Planet   (và Mass, Connector/lò xo...)

Editor (abstract)          Illustrator / Drawer (abstract)
    │                            │
PlanetEditor, CableEditor...    PlanetIllustrator, CableIllustrator...
```

- Lớp **`World`**, lớp **`WorldStructure`**, lớp trừu tượng **`WorldElement`**.
- Đối tượng `World` **chứa** đối tượng `WorldStructure` và đối tượng `Simulator`.
- `WorldElement` có thể khởi tạo thành **hành tinh, cáp, khối lượng và connector (lò xo)**.
- Lớp `Editor` được lớp con hóa bởi editor cho từng `WorldElement` → `PlanetEditor`, `CableEditor`,...
- Tương tự `WorldIllustrator` (Drawer) được lớp con hóa bởi các illustrator → `PlanetIllustrator`, `CableIllustrator`,...

> *Bài 20 bổ sung động cơ:* muốn **thêm lớp con WorldElement mới** → **dễ** (kế thừa hiện thực hóa xương sống của lớp cha trừu tượng). Nhưng muốn **định nghĩa thao tác mới cho tất cả/bộ phận WorldElement** → **khó hơn** (phải cung cấp xương sống cho lớp trừu tượng, rồi hiện thực hóa cho **mỗi** lớp con) → động cơ cho **Visitor** (mục 8).

---

## 6. Nhiều view và Observer pattern

### Yêu cầu

> Muốn hỗ trợ **nhiều view**: view mô phỏng, view editor, render 3D.
>
> **Các view phải nhất quán trong suốt mô phỏng!** Thay đổi ở một view phải **lan truyền ngay** sang view khác.

- View editor giữ **tham số tĩnh** của WorldElement (hằng số vật liệu cáp, vị trí bắt đầu...). Nếu tham số đổi **trong lúc mô phỏng** (vd do **cáp đứt**), mô phỏng phải **dùng ngay** tham số đã đổi.
- View mô phỏng hiện **vị trí và vận tốc thay đổi** của WorldElement.
- Các con số trong view mô phỏng được **render bằng Java 3D** trong view 3D.

### Bước 1: hard-code hai viewer — và cái giá

**Vấn đề: muốn thêm viewer nữa thì sao?**

```java
interface WorldElementViewer {
    void update(property, newvalue);
}

class 2DElmViewer implements WorldElmViewer {
    void update(prop, nval) {
        // mã cập nhật Swing
    }
}

abstract class WorldElement {
    // ...
    ssv = new 2DElmViewer(...);
    ...
    ssv.update(property, newvalue);
}
```

Thêm `3DElmViewer`:

```java
class 3DElmViewer implements WorldElmViewer {
    void update(prop, nval) {
        // mã cập nhật Java 3D
    }
}
```

> **Cần đổi MỌI phương thức gọi `update` trên viewer cũ để cũng cập nhật viewer mới.**

Đây chính là bài toán của **mẫu Observer** (tài liệu 07, mục 8): hard-code view nào được update → sửa mã mọi khi thêm/bỏ view.

### Bước 2: Observer pattern

> Thay vì hard-code view nào sẽ được cập nhật, `WorldElement` duy trì **một danh sách observer** cần được **thông báo** khi trạng thái đổi.

```java
abstract class WorldElement {
    List<WorldElmViewer> observers =
        new ArrayList<WorldElmViewer>();

    // ...
    void updateAll(property, newvalue) {
        for (WorldElmViewer v : observers) {
            v.update(property, newvalue);
        }
    }
}
```

Để khởi tạo danh sách observer, lớp `WorldElement` cung cấp ít nhất hai phương thức bổ sung:

```java
abstract class WorldElement {
    void register(WorldElmViewer viewer) {
        observers.add(viewer);
    }

    boolean remove(WorldElmViewer viewer) {
        return observers.remove(viewer);
    }
}
```

*(Bỏ qua chi tiết ví dụ — vd `update` thực sự được sinh ra như thế nào.)*

---

## 7. Hỗ trợ của java.beans — PropertyChangeSupport

Thay vì tự viết Observer, Java cung cấp sẵn trong gói **`java.beans`**:

### Các thành phần

| Thành phần | Loại | Vai trò |
|---|---|---|
| **`EventListener`** | **Tagging interface** (interface không có phương thức) | Gắn nhãn cho listener |
| **`PropertyChangeListener`** | interface `extends EventListener` | `void propertyChange(PropertyChangeEvent evt)` |
| **`PropertyChangeSupport`** | class | Cung cấp phương thức **thêm listener, bỏ listener, duyệt mọi listener và fire** `PropertyChangeEvent` tới mọi listener đã đăng ký |
| **`PropertyChangeEvent`** | class | Hàm khởi tạo với **giá trị cũ và mới**; `getOldValue()`/`getNewValue()` |

> **Bean** là thành phần dựa trên kiến trúc **JavaBeans**. (Trong Javadoc gốc: *"...dựa trên `java.beans`, gói cung cấp hỗ trợ tương tác **phụ thuộc sự kiện** — ví dụ, xây dựng các ứng dụng GUI có thể được kết nối với các bean khác."*)

### Phương thức chính của `PropertyChangeSupport`

```java
PropertyChangeSupport(Object source)          //构造
void addPropertyChangeListener(PropertyChangeListener listener)
void removePropertyChangeListener(PropertyChangeListener listener)
void firePropertyChange(String name, int old, int newValue)
PropertyChangeListener[] getPropertyChangeListeners()
```

### Mô hình quan hệ (theo MDD trong bài)

```
EventListener (tagging interface — không có phương thức)
      ▲
PropertyChangeListener
      ▲
    MyLis ──implements──▶ propertyChange() để cập nhật trạng thái nội tại

MyProperty (Object Model)
   ├── PropertyChangeSupport support
   │      ├── addPropertyChangeListener(
   │      ├── removePropertyChangeListener(
   │      └── firePropertyChange(  → tạo PropertyChangeEvent
   │              → gọi MyLis.propertyChange(evt) trên mọi listener đã đăng ký)
   └── PropertyChangeEvent: Constructor, getOldValue(), getNewValue()
```

### Cách dùng — composition + forwarding

```java
class MyProperty {
    private Object val;
    PropertyChangeSupport support;

    MyProperty(Object ival) {
        val = ival;
        support = new PropertyChangeSupport(this);
    }

    void setValue(Object nval) {
        support.firePropertyChange("value", val, nval);
        val = nval;
    }

    public void addListener(PropertyChangeListener Ln) {
        support.addPropertyChangeListener(Ln);
    }

    public void removeListener(PropertyChangeListener Ln) {
        support.removePropertyChangeListener(Ln);
    }
}
```

> Chú ý cách dùng **composition và forwarding** trong `MyProperty`. Bạn **không muốn** `extends PropertyChangeSupport` — vì bạn hiện thực hóa một property **không phải kiểu con thật** của `PropertyChangeSupport`.

*(Liên hệ tài liệu 05 mục 17: "Mọi B có thật sự là một A không?" — một property không phải `PropertyChangeSupport`.)*

---

## 8. Bài toán Visitor: thêm thao tác khó hơn thêm lớp con

### Bài toán phân cấp

```
WorldElement (abstract)
   ├── Cable
   ├── Planet
   └── (Moon, ...)

Muốn:
  • Định nghĩa thao tác MỚI trên tất cả/bộ phận đối tượng lớp con WorldElement
  • Định nghĩa lớp con MỚI của WorldElement
```

| Nhiệm vụ | Độ khó |
|---|---|
| **Thêm lớp con mới** (vd `Moon`) | **Dễ** — lớp con kế thừa **hiện thực hóa xương sống** của lớp cha trừu tượng |
| **Thêm thao tác mới** (vd `calcGrav`, `calcCor` cho tất cả) | **Khó hơn** — phải cung cấp xương sống cho lớp trừu tượng, rồi hiện thực hóa cho **mỗi** lớp con |

### Giải pháp: tách thao tác ra phân cấp riêng

> **Mẫu Visitor:** thiết lập `WorldElement` sao cho **thao tác tùy ý dễ dàng thêm vào**.
>
> **Tách các thao tác thành một phân cấp lớp riêng**, tất cả extend lớp trừu tượng `Visitor`. **Mỗi lớp con biểu thị một thao tác.**

```
WorldElement (abstract)          Visitor (abstract class)
   ├── Cable                        ├── GravVisitor
   └── Planet                       └── CorVisitor
```

**Ý nghĩa:** với `GravVisitor`, lực hấp dẫn được cộng vào lực căng của cáp; lực Coriolis được cộng trong `CorVisitor`.

---

## 9. Visitor và double dispatching

### Cơ chế

```java
// Phía WorldElement
abstract class WorldElement {
    abstract void Accept(Visitor v);
}

class Cable extends WorldElement {
    void Accept(Visitor v) {
        v.VisitCable(this);
    }
}

class Planet extends WorldElement {
    void Accept(Visitor v) {
        v.VisitPlanet(this);
    }
}

// Phía Visitor
abstract class Visitor {
    abstract void VisitCable(Cable c);
    abstract void VisitPlanet(Planet p);
}

class GravVisitor extends Visitor { ... }
class CorVisitor extends Visitor { ... }
```

### Double dispatching — hai lần phân phát

```
WorldElement elm = ...;
Visitor vis = ...;
elm.Accept(vis);                       // ← LẦN PHÂN PHÁT TH NHẤT
                                       //    (theo kiểu elm: Cable hay Planet)

  cableObj.Accept(vis)  →  vis.VisitCable(cableObj)
  planetObj.Accept(vis) →  vis.VisitPlanet(planetObj)
                                       // ← LẦN PHÂN PHÁT TH HAI
                                       //    (theo kiểu vis: Grav hay Cor)

  GravVObj.VisitCable(cableObj)   CorVObj.VisitCable(cableObj)
  GravVObj.VisitPlanet(planetObj) CorVObj.VisitPlanet(planetObj)
```

- **Lần 1:** chọn `Accept` đúng theo **kiểu phần tử**.
- **Lần 2:** chọn `Visit...` đúng theo **kiểu visitor** (thao tác).

### Overloading — đường tắt cú pháp

Thay vì `VisitCable`/`VisitPlanet` riêng, có thể dùng **cùng tên `Visit`** với kiểu đối số khác nhau (**overloading**):

```java
Accept(Visitor v) { v.Visit(this); }   // ở Cable và Planet
Visit(Cable c)                         // ở Visitor
Visit(Planet p)
```

> **Chỉ là đường tắt cú pháp (syntactic sugar). Không dùng nếu bạn thấy nó gây混淆!**

Với double dispatching + overloading:

```
elm.Accept(vis)
  cableObj.Accept(vis)  → vis.Visit(cableObj)     // Lần phân phát 1
  planetObj.Accept(vis) → vis.Visit(planetObj)
  GravVOb.Visit(cableOb) / CorVOb.Visit(cableOb)   // Lần phân phát 2
```

> Trình phân phát Java **làm đúng việc** khi bạn overloading tên phương thức — tùy **kiểu đối số**, phương thức phù hợp được gọi.

### Sử dụng trong TimeSim

```java
for (i = 0; i < WorldStructureObj.Elements.size(); i++) {
    elm = WorldStructureObj.Elements.get(i);
    for (j = 0; j < visitorsVector.size(); j++) {
        vis = visitorsVector.get(j);
        elm.Accept(vis);
    }
}
```

> Đoạn mã trên **không phải đổi** kể cả khi thêm **lớp con WorldElement mới** hoặc **lớp con Visitor mới** (thao tác mới).

*(Cần thêm visit methods cho mỗi phần tử mới trong lớp Visitor — xem mục 10.)*

`Accept` được định nghĩa phù hợp cho mỗi **cặp lớp con cụ thể × thao tác**. Nó có thể là **no-op** — tức là **không làm gì**.

---

## 10. Đánh đổi của Visitor

### Trade-off cốt lõi

> Mẫu Visitor làm **dễ thêm thao tác mới**, nhưng làm **khó hơn thêm phần tử mới**. Mỗi phần tử mới phải có method `VisitElement()` trong **mỗi** lớp Visitor.

| | Thêm thao tác mới | Thêm phần tử (lớp con) mới |
|---|---|---|
| **Không Visitor** | Khó (mục 8) | Dễ |
| **Với Visitor** | **Dễ** — thêm 1 lớp Visitor | **Khó** — phải sửa **mọi** lớp Visitor |

### Ba điểm khác

| # | Điểm |
|---|---|
| 1 | Visitor có thể **thăm các phần tử không liên quan qua kế thừa** — trong ví dụ `Cable` và `Planet` **không cần** liên quan nhau |
| 2 | Visitor có thể **tích lũy trạng thái** khi thăm từng phần tử của cấu trúc đối tượng, trong **biến instance** của visitor. Với hoạt động thường, trạng thái đó phải được **truyền làm đối số** |
| 3 | Visitor có thể **cần truy cập trạng thái** mà nếu không sẽ được khai báo **`private`** |

---

## 11. Java 3D và scene graph (tóm tắt)

> API **Java 3D** cung cấp tập giao diện **hướng đối tượng** để **xây dựng, render và điều khiển hành vi** của đối tượng 3D.

### Khái niệm chính

| Khái niệm | Nội dung |
|---|---|
| **Phân cấp lớp Java** | Giao diện cho hệ thống render 3D |
| **Đối tượng hình học** | Nằm trong một **vũ trụ ảo** (virtual universe) |
| **Chi tiết render** | Được xử lý **tự động** |
| **Đa luồng** | Đối tượng render **song song** bằng Java threads |
| **Scene graph** | Chương Java 3D tạo instance đối tượng và đặt vào **cây** gọi là scene graph — **chỉ định đầy đủ** nội dung vũ trụ ảo và cách nó được render |

### Cấu trúc scene graph

```
Virtual Universe
   └── Locale (root) — landmark, thường chỉ 1
         └── Branch Group (BG) — tập hợp các Shape3D
               └── Transform Group (TG) — biến đổi áp cho con
                     └── Shape3D (visual object)
                            ├── NodeComponent: Appearance
                            └── NodeComponent: Geometry
```

- Chỉ có **một** vũ trụ ảo duy nhất trong một chương trình Java 3D (có nhiều được nhưng chúng **không giao tiếp** được với nhau).
- **Ràng buộc cơ bản:** mỗi `Shape3D` phải có **đường duy nhất** tới root Locale.

### Ví dụ: Mặt Trăng quay quanh Trái Đất

```
Locale (root) = Mặt Trời (tham chiếu)
   └── BG
        ├── TG (Rotation — tự quay) → Earth Shape3D
        └── TG (Revolution — quay quanh Trái Đất) → Moon Shape3D
             └── có thể có TG kế tiếp: Trái Đất quay quanh Mặt Trời
```

*Lưu ý:* hai biến đổi **liên tiếp** có thể áp cho cùng một `Shape3D` (trường hợp này là mặt trăng). Toàn bộ Branch Group có thể được biến đổi qua một TG **khác** để tạo quỹ đạo Trái Đất quanh Mặt Trời.

---

## 12. Báo cáo dự án — nhìn lại

### Quá trình

| Hạng mục | Nội dung |
|---|---|
| **Thảo luận đáng kể TRƯỚC khi code** | Chức năng nên là gì? *(Không phải vấn đề với Gizmoball/AntiChess — dự án có sẵn đặc tả)* |
| **2 tuần** | MDD, phân cấp lớp và mô hình đối tượng |
| **Quy mô mã** | ~**3.600 dòng** |
| **Vật lý** | *"Làm cho vật lý đúng mất một lúc"* — một phần vật lý **vẫn đáng ngờ** |
| **Trải nghiệm** | *"Vui lắm, đặc biệt vì Matt và Lee đã debug mã của tôi!"* |

### "Chín giai đoạn của dự án thiết kế" (trích dẫn trào phúng)

| # | Giai đoạn |
|---|---|
| 1 | **Wild Euphoria** (Hưng phấn tột độ) |
| 2 | **Growing Concern** (Lo ngại tăng dần) |
| 3 | **Near Total Disillusionment** (Gần như mất hết ảo tưởng) |
| 4 | **Unmitigated Disaster** (Thảm họa không cứu vãn) |
| 5 | **Search For The Guilty** (Tìm người có tội) |
| 6 | **Punishment Of The Innocent** (Trừng phạt người vô tội) |
| 7 | **Scream for Professional Help** (Hét cầu cứu chuyên gia) |
| 8 | **Declare Victory!** (Tuyên bố chiến thắng!) |
| 9 | **Blatant Self-Promotion** (Tự quảng cáo trơ trẽn) |

> *Bài học ngầm:* mọi dự án đều đi qua các giai đoạn này — nhận ra chúng để **không bị lạc**.

---

# Phần II — Quản lý nhóm nhỏ (Bài 21)

> **Tiêu đề phụ:** *"Cách làm bài tập cuối kỳ 6.170 với bạn bè mà vẫn còn bạn bè sau khi kết thúc học kỳ"*
>
> **Nội dung buổi học:** Cuộc họp có ý nghĩa · Ý tưởng có ảnh hưởng · Tầm nhìn về phiên bản

---

## 13. Cuộc họp có ý nghĩa — 4 vai trò

> Ở **mỗi cuộc họp nhóm**, bạn nên phân công thành viên vào **một trong bốn vai trò**:

### 1. Benign dictator — Nhà độc tài nhân từ

| | |
|---|---|
| **Lý do** | Bốn người **không đủ cho một nền dân chủ** |
| **Vai trò** | Cần **một người chịu trách nhiệm** và **sẵn sàng đưa ra quyết định khó** khi các thành viên bất đồng |
| **Cảnh báo** | **Tung đồng xu thường là cách tệ** để phá thế hòa 2–2 |
| **Cách hành xử** | Luôn **nhạy cảm** với các ý tưởng mâu thuẫn của người khác — nhưng **cuối cùng chỉ có một** quyết định. Các thành viên còn lại **phải công nhận quyền** của nhà độc tài **trong suốt cuộc họp** |

### 2. Grand inquisitor — Đại thẩm vấn

| | |
|---|---|
| **Khẩu hiệu** | *"Speak now or forever choke on your dog food"* (Nói bây giờ hoặc mãi mãi nghẹn trên đồ ăn cho chó của mình) |
| **Lý do** | Ít ý tưởng nào **hoàn hảo khi mới sinh**. Cần một người **chủ động nghĩ về câu hỏi khó** để **thách thức ý tưởng mới** trước khi chúng được chấp nhận |
| **Cảnh báo** | Nhóm bị chi phối bởi **ý tưởng một người mới sinh** sẽ có thiết kế **tầm thường** ít nhất |
| **Điều cấm kỵ khác** | Các thành viên khác **không được phật ý** — GI thẩm vấn **ý tưởng**, **không phải người** sinh ra chúng |

### 3. Timekeeper — Người giữ thời gian

| | |
|---|---|
| **Khẩu hiệu** | *"Stick to the agenda"* (Bám sát chương trình) |
| **Nhiệm vụ** | Luôn có **chương trình** (agenda) với danh sách **mục tiêu, điểm thảo luận, và hành động cụ thể** (actionable items). Theo dõi **thời gian** và **báo cho nhóm** khi cần **ra quyết định và chuyển sang mục tiếp** |
| **Cảnh báo** | Đừng làm cuộc họp **mãi không kết thúc**. *Không có ánh sáng cuối đường hầm trừ khi có ray để chạy và có người ném thêm than vào lò.* |

### 4. Note taker — Người ghi chép

| | |
|---|---|
| **Khẩu hiệu** | *"A meeting without minutes never happened"* (Cuộc họp không biên bản chưa từng xảy ra) |
| **Nhiệm vụ** | **Mọi ý tưởng, quyết định thiết kế, lý do và nhiệm vụ** phải được **ghi tỉ mỉ** và **phân phối cho nhóm** |
| **Hậu quả nếu thiếu** | Thảo luận sẽ **đi vòng vòng**, tiến độ **chậm hơn cả mật đường** (slower than molasses) |

### Bảng tổng hợp 4 vai trò

| Vai trò | Câu hỏi trả lời | Sản phẩm |
|---|---|---|
| **Benign dictator** | Ai **quyết** khi bất đồng? | Quyết định cuối |
| **Grand inquisitor** | Ý tưởng này có **lỗ hổng gì**? | Thách thức ý tưởng |
| **Timekeeper** | **Khi nào** xong mục này? | Nhịp họp |
| **Note taker** | Chúng ta đã **quyết gì**? | Biên bản phân phối |

---

## 14. Ý tưởng có ảnh hưởng — 3 quy tắc

### Quy tắc 1: Không gắn cái tôi vào ý tưởng của bạn

> Bạn **không nên sợ** chia sẻ ý tưởng với nhóm, và bạn **không nên cố giữ quyền sở hữu** một ý tưởng **một khi bạn đã chia sẻ nó**.

### Quy tắc 2: Người ta gắn cái tôi vào ý tưởng — hãy nhạy cảm khi phê bình

> **Không sợ** phê bình một ý tưởng, đặc biệt nếu bạn là **Grand Inquisitor**.
>
> Tuy nhiên, người ta **quên Quy tắc 1** — nên hãy **nhạy cảm**.

*(Hai quy tắc tạo căng thẳng có chủ đích: phê bình mạnh mẽ **và** tôn trọng người.)*

### Quy tắc 3: Xử lý ý tưởng mới sinh như trẻ sơ sinh

> Ý tưởng mới sinh như **trẻ sơ sinh**: chúng **không tốt cũng không xấu** — chỉ **non nớt**.
>
> *Cần cả làng để nuôi một đứa trẻ, và cần cả nhóm để ươm một ý tưởng.*

---

## 15. Versioning — tầm nhìn về phiên bản

### Update, edit, commit, lặp lại

> Một số bạn có thể **trốn được** việc đợi tới khi xong problem set mới **commit** mã. **Giờ bạn đang làm việc với một nhóm**, bạn nên dùng **CVS** để **bảo vệ mã nguồn** và **giữ mọi người cập nhật**.

### Đừng phá vỡ bản dựng (Don't break the build)

| Quy tắc | |
|---|---|
| **Luôn update** để lấy thay đổi mới nhất | **Bất cứ khi nào bạn bắt đầu làm việc** |
| **Luôn commit** mỗi khi hoàn thành **một mẩu công việc nhỏ** | Với điều kiện nó **không gây REGRESSIONS** (suy đoán) |

*(Regresion — tài liệu 03 về kiểm thử hồi quy.)*

### Thông điệp commit có ý nghĩa

> Viết **commit message có ý nghĩa** để bạn có thể **dễ dàng theo dõi** các thay đổi của mình.

### Cân nhắc email thông báo khi commit

> Cấu hình kho lưu trữ để **gửi đồng đội email thông báo** kèm **bản ghi commit** của bạn.

### Bảng quy tắc versioning

| # | Quy tắc | Tại sao |
|---|---|---|
| 1 | **Update → edit → commit → lặp** | Nhóm phải luôn trên cùng phiên bản |
| 2 | **Đừng phá build** | Regression hại cả nhóm |
| 3 | **Commit message có ý nghĩa** | Tra cứu thay đổi |
| 4 | **Email notification** | Đồng đội biết ngay |

---

## 16. Mẹo phút chót

### Mẹo 1: Áp dụng thiết kế vào kho mã

> Giống như bạn **không nên hack mã**, bạn cũng **không nên hack kho mã**.
>
> Chỉ định **một người phụ trách** tổ chức các nhánh **source, doc, resources** trong cây kho.

### Mẹo 2: Lưu biên bản cuộc họp và ghi chú trong CVS

> CVS cũng nên bao gồm **toàn bộ tài liệu, ghi chú và bài kiểm thử**.

### Mẹo 3: Dùng MDD để định nghĩa nhiệm vụ

| | |
|---|---|
| Dùng MDD định nghĩa **phân cấp package** cũng như **lớp mô-đun** | |
| **Chọn tên package và lớp cẩn thận** | **Đổi tên file trong CVS và hệ thống phần mềm là điều không mong muốn và khó khăn** |
| Dùng MDD gán **nhiệm vụ, hạn chót** | — |

### Mẹo 4: Tài liệu hóa trong lúc làm

> **Đừng** giữ tài liệu tới cuối. Tài liệu hóa trong lúc làm — không chỉ nó sẽ **không trở thành gánh nặng** treo lơ lửng ngày nộp, mà nó còn **làm rõ quá trình phát triển** của bạn.

### Mẹo 5: Lên lịch họp và giờ làm nhóm

### Mẹo 6: Nghĩ về khả dụng TỪ ĐẦU

> UI **không phải chỉ là lớp vỏ** (skin); nó đòi một **mô hình nền sạch**.
>
> **Đừng giao** nó cho **một người duy nhất**, và **đừng đẩy** nó tới phút chót.

### Mẹo 7: Cố làm đúng lần đầu

> Cố làm **đúng lần đầu** thay vì **lãng phí thời gian** *"thêm chất lượng vào" sau.*

*(Liên hệ bài 16 — khả dụng không vá được ở cuối; và bài 10 — thiết kế phần đắt nên làm sớm.)*

### Mẹo 8: Hỏi TA khi gặp rắc rối

> **Tham vấn TA của bạn** khi bạn gặp rắc rối.

---

## 17. Bảng thuật ngữ và bài tập

### Bảng thuật ngữ (Anh – Việt)

| Tiếng Anh | Tiếng Việt |
|---|---|
| space elevator | thang máy không ge |
| geosynchronous orbit | quỹ đạo địa tĩnh |
| counterweight | trọng lượng đối |
| climber | thiết bị leo (climber) |
| ribbon / cable | dải / cáp |
| Coriolis force | lực Coriolis |
| centrifugal / gravitational force | lực ly tâm / hấp dẫn |
| masses and springs | khối lượng và lò xo |
| illustrator / drawer | trình minh họa / trình vẽ |
| extensible | mở rộng được |
| tightly coupled | gắn chặt (coupling chặt) |
| visitor pattern | mẫu khách (thăm) |
| double dispatching | phân phát kép |
| overloading | nạp chồng (phương thức) |
| tagging interface | interface gắn nhãn |
| property change support | hỗ trợ đổi thuộc tính |
| scene graph | đồ thị cảnh |
| benign dictator | nhà độc tài nhân từ |
| grand inquisitor | đại thẩm vấn |
| timekeeper / note taker | người giữ thời gian / người ghi chép |
| minutes (of a meeting) | biên bản họp |
| actionable items | mục hành động cụ thể |
| commit / regression | cam kết (commit) / suy đoán (regression) |
| build | bản dựng |
| ego | cái tôi |

### Bài tập suy nghĩ

1. Áp dụng **nguyên tắc mục 4** (mô-đun đổi liên tục không nên bị phụ thuộc): chỉ ra trong MDD thứ nhất, mô-đun nào vi phạm nguyên tắc này.
2. Vì sao `World` và `Editor` **tightly coupled**? Đề xuất một cách giảm coupling đó (gợi ý: liên hệ Observer hay giao diện — tài liệu 05).
3. Với phân cấp `WorldElement`: liệt kê **3 thao tác mới** có thể thêm bằng Visitor mà **khó thêm** nếu không có; và **1 lớp con mới** mà Visitor làm **khó hơn**.
4. Sơ đồ double dispatching: với `Moon extends WorldElement` và `MassVisitor`, dòng nào phải thêm? Mẫu Visitor có phải sửa ở mấy nơi?
5. Vì sao `MyProperty` **không nên** `extends PropertyChangeSupport`? Áp dụng quy tắc "Mọi B có thật sự là một A?"
6. Trong 4 vai trò họp: với nhóm 4 người, mỗi người kiêm nhiệm bao nhiêu vai? Vì sao **không nên** để một người làm cả dictator + GI?
7. "Đừng phá build": nếu commit của bạn gây regression nhưng bạn đã về nhà, nhóm nên có quy tắc gì? (Suy nghĩ từ 4 vai trò + versioning.)

---

*Nguồn: MIT 6.170 Lecture 19 (Design Project Experiences: Space Elevator Simulator Part I), Lecture 20 (Part II), Lecture 21 (Managing a Small Software Team), Fall 2005.*
