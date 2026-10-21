# Chương 10: Mô hình hóa Object-Process (OPM)

## 10.1. Mở đầu

Sau khi đã hiểu kiến trúc, form, function, quy trình và các kỹ thuật tư duy,
câu hỏi còn lại là: **làm thế nào để biểu diễn kiến trúc một cách chặt chẽ,
nhất quán, và có thể kiểm chứng?**

Có nhiều ngôn ngữ mô hình hóa: sơ đồ khối, UML, SysML, IDEF, và
**Object-Process Methodology (OPM)**. Chương này tập trung vào OPM, phương
pháp do Dov Dori phát triển, vì nó có một số ưu điểm nổi bật:

- Dùng **một mô hình duy nhất** cho cả cấu trúc và hành vi.
- Có **ngữ nghĩa hình thức** (formal semantics).
- Có thể chuyển đổi giữa sơ đồ và văn bản.
- Phù hợp với tư duy hệ thống.

## 10.2. OPM là gì

### 10.2.1. Định nghĩa

> **Object-Process Methodology (OPM)** là một phương pháp mô hình hóa hệ thống
> dựa trên hai khái niệm cơ bản: **object** (đối tượng) và **process** (quá
> trình), cùng các **liên kết** (links) có ngữ nghĩa rõ ràng.

### 10.2.2. Triết lý

OPM dựa trên quan sát rằng mọi hệ thống đều có hai khía cạnh:

- **Cấu trúc (structure):** các đối tượng và quan hệ giữa chúng.
- **Hành vi (behavior):** các quá trình biến đổi đối tượng.

Thay vì dùng hai mô hình riêng (ví dụ: class diagram và sequence diagram trong
UML), OPM dùng một mô hình thống nhất.

### 10.2.3. Things

Trong OPM, **thing** (thực thể) là khái niệm chung cho object và process.

```
Thing
├── Object
└── Process
```

## 10.3. Object (đối tượng)

### 10.3.1. Định nghĩa

> **Object** là một thực thể có thể tồn tại trong một khoảng thời gian, có
> thuộc tính (attributes), và có thể ở các trạng thái (states) khác nhau.

### 10.3.2. Đặc điểm

- **Tồn tại (existence):** object tồn tại theo thời gian.
- **Thuộc tính:** object có các đặc tính.
- **Trạng thái:** object có thể ở nhiều trạng thái.
- **Có thể được tạo ra, biến đổi, hoặc bị tiêu hủy** bởi process.

### 10.3.3. Phân loại object

**Object vật lý (physical):** có tồn tại vật chất.

Ví dụ: còi, tủ lạnh, ô tô.

**Object thông tin (informational):** là thông tin, dữ liệu.

Ví dụ: đơn hàng, báo cáo, bản vẽ.

**Object môi trường (environmental):** thuộc bối cảnh, không do hệ thống tạo
ra.

Ví dụ: không khí, người dùng, nguồn điện.

### 10.3.4. Thuộc tính (attributes)

Thuộc tính là đặc tính của object. Có thể là:

- **Thuộc tính đơn (single-valued):** chỉ có một giá trị.
- **Thuộc tính đa (multi-valued):** có nhiều giá trị.

Ví dụ với còi:

- Vật liệu: nhựa.
- Khối lượng: 20 g.
- Màu: đỏ.

### 10.3.5. Trạng thái (states)

Trạng thái là các chế độ mà object có thể ở. Object chuyển từ trạng thái này
sang trạng thái khác thông qua process.

Ví dụ với còi:

- Trạng thái: im lặng / kêu.
- Trạng thái: có bi / không bi.

Ví dụ với tủ lạnh:

- Trạng thái: bật / tắt.
- Trạng thái: cửa mở / đóng.
- Trạng thái: nhiệt độ cao / thấp.

## 10.4. Process (quá trình)

### 10.4.1. Định nghĩa

> **Process** là một thực thể biến đổi object: tạo ra, tiêu hủy, hoặc thay
> đổi trạng thái của object.

### 10.4.2. Đặc điểm

- **Có thời gian:** process diễn ra trong thời gian.
- **Biến đổi object:** process tác động lên object.
- **Có thể có thuộc tính:** thời gian, chi phí, xác suất.
- **Có thể lồng nhau:** process có thể chứa process con.

### 10.4.3. Phân loại process

- **Process tạo ra object (creation):** sinh ra object mới.
- **Process tiêu hủy object (destruction):** loại bỏ object.
- **Process biến đổi (transformation):** thay đổi trạng thái hoặc thuộc tính.

### 10.4.4. Ví dụ

Với còi:

- Process "thổi khí" biến đổi object "luồng khí".
- Process "tạo xoáy" biến đổi object "dòng chảy".
- Process "cộng hưởng" biến đổi object "cột không khí".

Với tủ lạnh:

- Process "nén" biến đổi object "môi chất lạnh".
- Process "bay hơi" biến đổi object "môi chất lạnh" và "nhiệt".
- Process "điều khiển" biến đổi object "trạng thái máy nén".

## 10.5. Liên kết (links)

OPM có hai loại liên kết chính: **liên kết cấu trúc** (structural links) và
**liên kết thủ tục** (procedural links).

### 10.5.1. Liên kết cấu trúc

Liên kết cấu trúc mô tả quan hệ tĩnh giữa các object.

**Aggregation (tổng hợp):** quan hệ "là một phần của" (whole-part).

Ký hiệu: tam giác đen ở đầu whole.

```
Tủ lạnh ◆--- Máy nén
```

**Exhibition (thể hiện):** object này thể hiện một tính chất của object khác.

**Instantiation (khởi tạo):** object này là một thể hiện của object khác.

**Specialization (chuyên biệt hóa):** object này là một loại của object khác.

```
Còi ---▷ Nhạc cụ
```

**Unidirectional/Bidirectional:** quan hệ một chiều hoặc hai chiều.

### 10.5.2. Liên kết thủ tục

Liên kết thủ tục mô tả cách process tác động lên object.

**Consumption (tiêu thụ):** process tiêu thụ object.

Ký hiệu: mũi tên đen.

```
Process ●---> Object
```

**Result (kết quả):** process tạo ra object.

Ký hiệu: mũi tên trắng.

```
Process ---▷ Object
```

**Effect (tác động):** process thay đổi trạng thái object.

Ký hiệu: mũi tên với chấm.

```
Process ---> Object
```

**Agent (tác nhân):** object thực hiện process.

Ký hiệu: mũi tên với đầu tròn.

```
Object ---● Process
```

**Instrument (công cụ):** object được process sử dụng.

Ký hiệu: mũi tên với đầu mở.

```
Object ---⊳ Process
```

### 10.5.3. Bảng tóm tắt liên kết thủ tục

| Liên kết | Ý nghĩa | Ký hiệu |
|----------|---------|---------|
| Consumption | Process tiêu thụ object | Mũi tên đen |
| Result | Process tạo ra object | Mũi tên trắng |
| Effect | Process thay đổi trạng thái | Mũi tên chấm |
| Agent | Object thực hiện process | Đầu tròn |
| Instrument | Object được sử dụng | Đầu mở |

## 10.6. Ngữ nghĩa của OPM

### 10.6.1. Một mô hình, hai khía cạnh

OPM cho phép mô tả cả cấu trúc và hành vi trong cùng một sơ đồ:

- Object và liên kết cấu trúc mô tả cấu trúc.
- Process và liên kết thủ tục mô tả hành vi.

### 10.6.2. Tính nhất quán

Mọi process phải tác động lên ít nhất một object. Mọi object phải được tạo
ra, biến đổi, hoặc tiêu hủy bởi ít nhất một process (hoặc là object môi
trường). Điều này đảm bảo tính nhất quán.

### 10.6.3. Phân rã

OPM hỗ trợ phân rã (refinement):

- Object có thể được phân rã thành các object con.
- Process có thể được phân rã thành các process con.

Điều này cho phép mô hình hóa ở nhiều mức trừu tượng.

## 10.7. Sơ đồ OPM (OPD)

### 10.7.1. OPD là gì

**Object-Process Diagram (OPD)** là biểu diễn đồ họa của mô hình OPM.

### 10.7.2. Ký hiệu cơ bản

- **Hình chữ nhật:** object.
- **Hình elip:** process.
- **Đường nối:** liên kết.

### 10.7.3. Ví dụ: còi

```
+----------+        +----------+        +----------+
| Luồng khí|        |  Thổi khí|        |  Khoang  |
+----------+        +----------+        +----------+
     |                   |                   |
     |                   |                   |
     +------------------>O                   |
                         |                   |
                         |                   |
                    +----------+             |
                    | Tạo xoáy |             |
                    +----------+             |
                         |                   |
                         v                   |
                    +----------+             |
                    |  Xoáy    |             |
                    +----------+             |
                         |                   |
                         +------------------>+
                                             |
                                        +----------+
                                        | Âm thanh |
                                        +----------+
```

### 10.7.4. Ví dụ: tủ lạnh

```
+-----------+     +--------+     +-----------+
| Môi chất  |---->|  Nén   |---->| Môi chất  |
| (lỏng)    |     +--------+     | (áp cao)  |
+-----------+                    +-----------+
                                       |
                                       v
                                 +-----------+
                                 | Ngưng tụ  |
                                 +-----------+
                                       |
                                       v
                                 +-----------+
                                 | Tiết lưu  |
                                 +-----------+
                                       |
                                       v
                                 +-----------+
                                 | Bay hơi   |
                                 +-----------+
                                       |
                                       v
                                 +-----------+
                                 | Làm lạnh  |
                                 +-----------+
```

## 10.8. Quy trình xây dựng mô hình OPM

### 10.8.1. Bước 1: Xác định mục đích

Mô hình phục vụ mục đích gì? Ai sẽ đọc? Cần mức chi tiết nào?

### 10.8.2. Bước 2: Xác định object

Liệt kê các object chính:

- Object vật lý.
- Object thông tin.
- Object môi trường.

### 10.8.3. Bước 3: Xác định process

Liệt kê các process chính:

- Process tạo ra object.
- Process biến đổi object.
- Process tiêu hủy object.

### 10.8.4. Bước 4: Xác định trạng thái

Với mỗi object, xác định các trạng thái quan trọng.

### 10.8.5. Bước 5: Xác định liên kết

Nối process với object:

- Process nào tiêu thụ object nào?
- Process nào tạo ra object nào?
- Process nào thay đổi trạng thái object nào?
- Object nào là agent, object nào là instrument?

### 10.8.6. Bước 6: Vẽ OPD

Vẽ sơ đồ với ký hiệu chuẩn.

### 10.8.7. Bước 7: Kiểm tra tính nhất quán

- Mọi process có object không?
- Mọi object có process không?
- Các trạng thái có được mô tả đầy đủ không?
- Các liên kết có đúng ngữ nghĩa không?

### 10.8.8. Bước 8: Phân rã

Phân rã các object và process phức tạp thành mức chi tiết hơn.

### 10.8.9. Bước 9: Kiểm chứng

Đối chiếu mô hình với thực tế hoặc với yêu cầu.

## 10.9. Ưu điểm của OPM

### 10.9.1. Thống nhất

Một mô hình cho cả cấu trúc và hành vi, giảm sự phân mảnh.

### 10.9.2. Ngữ nghĩa rõ ràng

Các liên kết có ngữ nghĩa hình thức, giảm mơ hồ.

### 10.9.3. Hỗ trợ phân rã

Có thể mô hình hóa ở nhiều mức trừu tượng.

### 10.9.4. Chuyển đổi văn bản

OPM có thể được chuyển đổi thành văn bản (OPL — Object-Process Language),
giúp kiểm tra tính nhất quán và giao tiếp.

### 10.9.5. Phù hợp tư duy hệ thống

OPM phản ánh cách con người hiểu hệ thống: object và process.

## 10.10. Hạn chế của OPM

### 10.10.1. Ít phổ biến

OPM ít được biết đến hơn UML và SysML, nên khó tìm công cụ và chuyên gia.

### 10.10.2. Đường cong học tập

Cần thời gian để làm quen với ký hiệu và ngữ nghĩa.

### 10.10.3. Khó mô hình hóa một số khía cạnh

Một số khía cạnh (ví dụ: giao diện phức tạp, hành vi đồng thời) có thể khó
biểu diễn.

### 10.10.4. Công cụ hạn chế

Ít công cụ hỗ trợ so với UML.

## 10.11. So sánh OPM với các phương pháp khác

### 10.11.1. OPM và UML

| Tiêu chí | OPM | UML |
|----------|-----|-----|
| Mô hình | Một mô hình thống nhất | Nhiều loại sơ đồ |
| Ngữ nghĩa | Hình thức, chặt chẽ | Đa dạng, có thể mơ hồ |
| Cấu trúc + hành vi | Trong cùng sơ đồ | Tách riêng |
| Phổ biến | Ít | Rất phổ biến |
| Công cụ | Hạn chế | Phong phú |

### 10.11.2. OPM và SysML

SysML là mở rộng của UML cho hệ thống, có nhiều loại sơ đồ. OPM đơn giản hơn
nhưng nhất quán hơn.

### 10.11.3. OPM và sơ đồ khối

Sơ đồ khối chỉ mô tả cấu trúc hoặc chức năng, không mô tả hành vi động. OPM
mô tả cả hai.

### 10.11.4. OPM và System Dynamics

System Dynamics mô tả stock và flow (tồn kho và dòng chảy) ở mức hệ thống.
OPM mô tả object và process ở mức chi tiết hơn. Có thể kết hợp: stock là
object, flow là process.

## 10.12. Ví dụ đầy đủ: mô hình OPM cho còi

### 10.12.1. Object

- Người thổi (agent).
- Luồng khí.
- Khoang cộng hưởng.
- Mép cắt.
- Viên bi.
- Âm thanh.

### 10.12.2. Process

- Thổi khí.
- Tạo xoáy.
- Cộng hưởng.
- Phát âm.

### 10.12.3. Trạng thái

- Luồng khí: tĩnh / chuyển động.
- Khoang: yên / dao động.
- Âm thanh: không có / có.

### 10.12.4. Liên kết

| Từ | Đến | Loại |
|----|-----|------|
| Người thổi | Thổi khí | Agent |
| Thổi khí | Luồng khí | Effect (tĩnh → chuyển động) |
| Luồng khí | Tạo xoáy | Instrument |
| Tạo xoáy | Xoáy | Result |
| Xoáy | Cộng hưởng | Instrument |
| Khoang | Cộng hưởng | Instrument |
| Cộng hưởng | Khoang | Effect (yên → dao động) |
| Cộng hưởng | Âm thanh | Result |
| Mép cắt | Tạo xoáy | Instrument |
| Viên bi | Cộng hưởng | Instrument |

### 10.12.5. OPD

```
+-------------+     +-----------+     +----------+
| Người thổi  |---->| Thổi khí  |---->| Luồng khí|
+-------------+     +-----------+     +----------+
                                            |
                                            v
                                      +-----------+
                                      | Tạo xoáy  |
                                      +-----------+
                                            |
                              +-------------+-------------+
                              |                           |
                              v                           v
                        +-----------+               +-----------+
                        |   Xoáy    |               |  Mép cắt  |
                        +-----------+               +-----------+
                              |
                              v
                        +-----------+
                        | Cộng hưởng|
                        +-----------+
                              |
                    +---------+---------+
                    |                   |
                    v                   v
              +-----------+       +-----------+
              |  Khoang   |       | Viên bi   |
              +-----------+       +-----------+
                    |
                    v
              +-----------+
              |  Âm thanh |
              +-----------+
```

## 10.13. OPM trong kiến trúc hệ thống

### 10.13.1. Mô hình hóa kiến trúc

OPM có thể dùng để:

- Mô tả chức năng (process + operand).
- Mô tả form (object + cấu trúc).
- Mô tả ánh xạ function → form.
- Mô tả giao diện (object trao đổi).

### 10.13.2. Kiểm tra tính đầy đủ

OPM giúp phát hiện:

- Object không có process tạo ra/biến đổi.
- Process không có object.
- Trạng thái không được mô tả.
- Liên kết thiếu.

### 10.13.3. Giao tiếp

OPM cung cấp ngôn ngữ chung cho các bên liên quan, giảm mơ hồ.

### 10.13.4. Phân rã

OPM hỗ trợ phân rã từ mức hệ thống đến mức chi tiết, giúp quản lý độ phức
tạp.

## 10.14. Bài tập

1. Xây dựng mô hình OPM cho một sản phẩm đơn giản (bút bi, cốc giấy).
2. Xác định object, process, trạng thái, và liên kết.
3. Vẽ OPD và kiểm tra tính nhất quán.
4. Phân rã một process thành các process con.
5. So sánh mô hình OPM với sơ đồ khối của cùng hệ thống.

## 10.15. Tóm tắt chương

- OPM dùng object và process, cùng các liên kết có ngữ nghĩa.
- Object có thuộc tính và trạng thái; process biến đổi object.
- Liên kết cấu trúc mô tả quan hệ tĩnh; liên kết thủ tục mô tả tác động.
- OPD là biểu diễn đồ họa; OPL là biểu diễn văn bản.
- OPM thống nhất cấu trúc và hành vi trong một mô hình.
- OPM có ưu điểm về ngữ nghĩa và tính nhất quán, nhưng ít phổ biến.
- OPM hữu ích cho mô hình hóa kiến trúc, kiểm tra tính đầy đủ, và giao tiếp.
