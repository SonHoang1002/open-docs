# Chương 5: Tính năng, Chức năng và Hành vi xuất hiện

## 5.1. Mở đầu

Chương này đi sâu vào **function** (chức năng) — một trong ba đỉnh của tam
giác kiến trúc. Nếu form trả lời câu hỏi "hệ thống là gì", thì function trả
lời câu hỏi "hệ thống làm gì". Việc hiểu rõ function là điều kiện để:

- Xác định giá trị mà hệ thống tạo ra.
- Phân rã hệ thống một cách đúng đắn.
- Ánh xạ chức năng sang form.
- Phát hiện các chức năng bị bỏ sót.
- Đánh giá kiến trúc.

Chương này cũng trình bày khái niệm **hành vi xuất hiện** (emergence) ở mức
sâu hơn chương 1, vì emergence là hệ quả trực tiếp của cách các chức năng
tương tác.

## 5.2. Định nghĩa function

### 5.2.1. Định nghĩa

> **Function** là các hoạt động, thao tác và biến đổi tạo ra hoặc đóng góp
> vào hiệu năng (performance), tức là đạt được các mục tiêu; là cái hệ thống
> "làm".

Công thức:

```
Function = Process + Operand
```

### 5.2.2. Process (quá trình)

Process là hoạt động biến đổi. Process có thể là:

- **Vật lý:** nén, kéo, cắt, hàn, bay hơi.
- **Hóa học:** oxy hóa, phân hủy, tổng hợp.
- **Thông tin:** tính toán, truyền, lưu trữ, chuyển đổi.
- **Tổ chức:** phê duyệt, phân công, báo cáo.
- **Nhận thức:** quyết định, đánh giá, học.

### 5.2.3. Operand (đối tượng tác động)

Operand là cái bị biến đổi bởi process. Operand có thể là:

- **Vật chất:** môi chất lạnh, thực phẩm, vật liệu.
- **Năng lượng:** nhiệt, điện, cơ năng.
- **Thông tin:** dữ liệu, tín hiệu, tri thức.
- **Con người:** người dùng, nhân viên, khách hàng.
- **Tổ chức:** đơn hàng, hợp đồng, quy trình.

### 5.2.4. Ví dụ

| Hệ thống | Process | Operand | Function |
|----------|---------|---------|----------|
| Còi | Thổi khí, tạo xoáy | Luồng khí | Tạo âm thanh |
| Tủ lạnh | Nén, bay hơi | Môi chất, nhiệt | Làm lạnh |
| Ô tô | Đốt nhiên liệu | Nhiên liệu, không khí | Di chuyển |
| Phần mềm | Tính toán, sắp xếp | Dữ liệu | Xử lý thông tin |
| Doanh nghiệp | Mua, bán, sản xuất | Hàng hóa, tiền | Tạo giá trị |

### 5.2.5. Function không phải là mục tiêu

Cần phân biệt function với goal:

- **Goal** là kết quả mong muốn (ví dụ: "thực phẩm tươi lâu").
- **Function** là hoạt động tạo ra kết quả đó (ví dụ: "làm lạnh").

Function là *phương tiện*; goal là *mục đích*. Kiến trúc sư cần hiểu cả hai
để không nhầm lẫn phương tiện với mục đích.

## 5.3. Các loại chức năng

### 5.3.1. Chức năng bên ngoài (external function)

Là chức năng nhìn thấy từ bên ngoài, qua giao diện với bối cảnh. Đây là chức
năng tạo ra giá trị cho khách hàng.

Ví dụ với tủ lạnh: "giữ thực phẩm ở nhiệt độ thấp".

### 5.3.2. Chức năng bên trong (internal function)

Là chức năng của các phần tử bên trong, phục vụ chức năng bên ngoài.

Ví dụ với tủ lạnh: "nén môi chất", "trao đổi nhiệt", "điều khiển nhiệt độ".

### 5.3.3. Chức năng chính (primary function)

Là chức năng cốt lõi mà hệ thống được tạo ra để thực hiện.

Ví dụ: tủ lạnh → làm lạnh; còi → tạo âm thanh.

### 5.3.4. Chức năng phụ (secondary function)

Là chức năng bổ sung, không phải mục đích chính nhưng cần thiết cho trải
nghiệm hoặc vận hành.

Ví dụ: tủ lạnh → làm đá, lấy nước, hiển thị nhiệt độ.

### 5.3.5. Chức năng hỗ trợ (supporting function)

Là chức năng giúp hệ thống vận hành ổn định, an toàn, dễ bảo trì.

Ví dụ: tủ lạnh → cách nhiệt, giảm tiếng ồn, bảo vệ quá tải, chẩn đoán lỗi.

### 5.3.6. Chức năng gây hại (harmful function)

Là chức năng không mong muốn nhưng không thể tránh hoàn toàn.

Ví dụ: tủ lạnh → tạo tiếng ồn, thải nhiệt ra phòng, tiêu thụ điện.

Việc nhận diện chức năng gây hại giúp kiến trúc sư giảm thiểu tác động.

### 5.3.7. Bảng phân loại

| Loại | Mục đích | Ai quan tâm | Ví dụ |
|------|----------|-------------|-------|
| External | Tạo giá trị | Khách hàng | Làm lạnh |
| Internal | Hỗ trợ external | Kỹ sư | Nén môi chất |
| Primary | Mục đích chính | Tất cả | Bảo quản thực phẩm |
| Secondary | Trải nghiệm | Người dùng | Làm đá |
| Supporting | Vận hành | Kỹ sư, bảo trì | Cách nhiệt |
| Harmful | Không mong muốn | Tất cả | Tiếng ồn |

## 5.4. Phản chiếu chức năng (function reflection)

### 5.4.1. Khái niệm

Function reflection là kỹ thuật nhìn một chức năng từ nhiều góc độ khác nhau
để phát hiện các chức năng ẩn, chức năng phụ, và các bên liên quan bị bỏ sót.

### 5.4.2. Các góc nhìn

Với tủ lạnh:

- **Người dùng:** muốn thực phẩm lạnh, dễ lấy, ít ồn, tiết kiệm điện.
- **Người lắp đặt:** muốn dễ vận chuyển, dễ đặt, dễ kết nối điện.
- **Kỹ thuật viên bảo trì:** muốn dễ tiếp cận, dễ thay thế linh kiện.
- **Nhà sản xuất:** muốn dễ chế tạo, ít linh kiện, dễ lắp ráp.
- **Môi trường:** muốn ít năng lượng, ít khí thải, dễ tái chế.
- **Cơ quan quản lý:** muốn an toàn điện, an toàn thực phẩm, nhãn năng lượng.

Mỗi góc nhìn có thể tiết lộ một chức năng mà góc nhìn khác bỏ qua.

### 5.4.3. Ví dụ: phát hiện chức năng ẩn

Nhìn tủ lạnh từ góc người dùng cao tuổi, ta phát hiện chức năng "mở cửa dễ
dàng với lực nhỏ" — một chức năng quan trọng nhưng dễ bị bỏ sót nếu chỉ nghĩ
đến "làm lạnh".

Nhìn từ góc môi trường, ta phát hiện chức năng "cho phép tháo rời để tái
chế" — một chức năng ngày càng quan trọng.

### 5.4.4. Quy trình thực hành

1. Liệt kê các bên liên quan.
2. Với mỗi bên, hỏi: họ muốn gì từ hệ thống?
3. Ghi lại các chức năng tương ứng.
4. Tìm chức năng trùng lặp, mâu thuẫn, hoặc bị bỏ sót.
5. Ưu tiên các chức năng theo giá trị và chi phí.

## 5.5. Chức năng độc lập giải pháp (solution-neutral function)

### 5.5.1. Khái niệm

Mô tả chức năng mà không gắn với một giải pháp cụ thể. Đây là nguyên tắc
quan trọng để mở rộng không gian giải pháp.

### 5.5.2. Ví dụ

| Có thiên kiến giải pháp | Độc lập giải pháp |
|-------------------------|-------------------|
| Dùng máy nén khí để làm lạnh | Làm lạnh thực phẩm |
| Dùng bánh răng để truyền động | Truyền chuyển động quay |
| Dùng TCP để truyền dữ liệu | Truyền dữ liệu tin cậy |
| Dùng pin lithium | Lưu trữ năng lượng |

### 5.5.3. Lợi ích

- Mở rộng không gian giải pháp.
- Tránh thiên kiến thiết kế (design fixation).
- Cho phép so sánh các giải pháp khác nhau.
- Hỗ trợ tái sử dụng chức năng qua nhiều form.

### 5.5.4. Thách thức

- Mô tả quá trừu tượng có thể không hữu ích.
- Cần cân bằng giữa trừu tượng và cụ thể.
- Đòi hỏi kỷ luật ngôn ngữ.

### 5.5.5. Kỹ thuật

- Dùng động từ + danh từ: "làm lạnh + thực phẩm".
- Tránh tên công nghệ: không nói "máy nén", nói "tạo chênh lệch nhiệt".
- Hỏi "vì sao" để leo lên mức trừu tượng cao hơn.
- Hỏi "như thế nào" để hạ xuống mức cụ thể hơn.

## 5.6. Thu phóng chức năng (function zooming)

### 5.6.1. Khái niệm

Function có thể được nhìn ở nhiều mức trừu tượng. Khác với form (phân rã
thành phần), function **thu phóng** như một camera zoom.

### 5.6.2. Ví dụ với còi

```
Mức 0: Tạo âm thanh
   |
Mức 1: Chuyển luồng khí thành dao động âm
   |
Mức 2: Tạo xoáy tại mép cắt
   |
Mức 3: Tách dòng chảy (vortex shedding)
   |
Mức 4: Phương trình Navier-Stokes
```

### 5.6.3. Ví dụ với tủ lạnh

```
Mức 0: Bảo quản thực phẩm
   |
Mức 1: Duy trì nhiệt độ thấp
   |
Mức 2: Bơm nhiệt từ trong ra ngoài
   |
Mức 3: Chu trình nén - bay hơi - ngưng tụ
   |
Mức 4: Nhiệt động học của môi chất
```

### 5.6.4. Lợi ích

- Cho phép mô tả chức năng ở mức phù hợp với đối tượng.
- Giúp chuyển đổi giữa các lĩnh vực chuyên môn.
- Hỗ trợ phân tích và thiết kế.
- Giúp phát hiện các mức chức năng bị bỏ sót.

### 5.6.5. Quan hệ với form decomposition

Function zoom và form decomposition là hai trục khác nhau:

```
              Function (zoom)
                    ^
                    |
                    |
                    +----------> Form (decompose)
```

Một hệ thống có thể có nhiều mức function và nhiều mức form, và chúng không
nhất thiết tương ứng một-một.

## 5.7. Ánh xạ chức năng sang form

### 5.7.1. Các kiểu ánh xạ

**Một-một:** Mỗi chức năng được hiện thực bởi đúng một phần tử.

```
F1 --> E1
F2 --> E2
F3 --> E3
```

**Một-nhiều:** Một chức năng được chia sẻ bởi nhiều phần tử.

```
      --> E1
F1 --|--> E2
      --> E3
```

**Nhiều-một:** Một phần tử đảm nhận nhiều chức năng.

```
F1 --|
F2 --|--> E1
F3 --|
```

**Nhiều-nhiều:** Kết hợp cả hai.

### 5.7.2. Ví dụ

**Một-một:** Còi có lỗ thổi chỉ để dẫn khí.

**Một-nhiều:** Chức năng "giữ nhiệt" của tủ lạnh được chia sẻ bởi vỏ, gioăng,
và lớp cách nhiệt.

**Nhiều-một:** Vỏ điện thoại đảm nhận bảo vệ, tản nhiệt, ăng-ten, thẩm mỹ.

### 5.7.3. Hệ quả của từng kiểu

| Kiểu | Ưu điểm | Nhược điểm |
|------|---------|------------|
| Một-một | Rõ ràng, dễ phân rã, dễ kiểm thử | Nhiều phần tử, chi phí cao |
| Một-nhiều | Tối ưu hiệu năng, giảm phần tử | Khó thay thế, khó kiểm thử |
| Nhiều-một | Tích hợp cao, giảm kích thước | Phức tạp, khó bảo trì |

### 5.7.4. Nguyên tắc cân bằng

- Ưu tiên một-một cho các chức năng quan trọng, dễ thay đổi.
- Chấp nhận nhiều-một khi cần tối ưu không gian, chi phí.
- Tránh nhiều-nhiều quá mức vì làm tăng độ phức tạp.

## 5.8. Hành vi xuất hiện (emergence) — chuyên sâu

### 5.8.1. Định nghĩa

> **Emergence** là hành vi của hệ thống không thể quy trực tiếp về hành vi
> của bất kỳ phần tử riêng lẻ nào, mà nảy sinh từ tương tác giữa các phần tử.

### 5.8.2. Phân loại

**Emergence yếu (weak emergence):** Có thể suy ra từ mô phỏng các tương tác,
nhưng không thể suy ra từ phân tích từng phần tử riêng lẻ. Ví dụ: mô hình
giao thông, mô hình thị trường.

**Emergence mạnh (strong emergence):** Không thể suy ra ngay cả từ mô phỏng
đầy đủ, do tính phức tạp hoặc phi tuyến. Ví dụ: ý thức, sự sống (theo một
số quan điểm).

Trong kỹ thuật, hầu hết là emergence yếu: có thể dự đoán bằng mô phỏng, nhưng
không thể suy ra từ phân tích tĩnh.

### 5.8.3. Emergence mong muốn

- Âm thanh của còi.
- Âm nhạc của đàn violin.
- Khả năng định tuyến của Internet.
- Tính thanh khoản của thị trường.
- Sự an toàn của hệ thống có dự phòng.

### 5.8.4. Emergence không mong muốn

- Dao động của cầu.
- Tắc nghẽn giao thông.
- Deadlock phần mềm.
- Sụp đổ tài chính.
- Hiệu ứng phụ của thuốc.
- Tiếng ồn, rung, nhiệt thừa.

### 5.8.5. Nguyên nhân

Emergence không mong muốn thường do:

- Tương tác không được dự đoán.
- Phi tuyến (nonlinearity).
- Vòng phản hồi dương.
- Điều kiện biên không được kiểm thử.
- Tương tác giữa các hệ thống con.
- Yếu tố con người.

### 5.8.6. Cách quản lý

**Thiết kế cho emergence mong muốn:**

- Định nghĩa giao diện rõ ràng.
- Kiểm thử tích hợp sớm.
- Mô phỏng hành vi toàn cục.
- Thiết kế cơ chế phản hồi ổn định.

**Phát hiện emergence không mong muốn:**

- Kiểm thử ở điều kiện biên.
- Phân tích FMEA (Failure Mode and Effects Analysis).
- Kiểm thử hỗn hợp (fault injection).
- Giám sát trong vận hành (observability).

**Giảm thiểu tác động:**

- Cơ chế fail-safe.
- Giới hạn tải.
- Cách ly lỗi (fault isolation).
- Khả năng phục hồi (resilience).

## 5.9. Giá trị và các operand liên quan đến giá trị

### 5.9.1. Khái niệm

Không phải mọi chức năng đều tạo ra giá trị như nhau. **Value-related
operand** là operand mà sự biến đổi của nó trực tiếp tạo ra giá trị cho
bên liên quan.

### 5.9.2. Ví dụ

Với tủ lạnh:

- Operand liên quan giá trị: **thực phẩm** (được bảo quản), **nhiệt độ**
  (được duy trì).
- Operand không liên quan trực tiếp: **môi chất lạnh** (chỉ là phương tiện).

Với còi:

- Operand liên quan giá trị: **âm thanh** (tạo ra).
- Operand không liên quan trực tiếp: **luồng khí** (phương tiện).

### 5.9.3. Tầm quan trọng

Việc xác định đúng value-related operand giúp:

- Tập trung thiết kế vào cái tạo ra giá trị.
- Tránh tối ưu hóa các phần tử không quan trọng.
- Đo lường hiệu quả đúng cách.
- Giao tiếp với bên liên quan.

### 5.9.4. Chuỗi giá trị

Giá trị thường được tạo ra qua một **chuỗi** các biến đổi operand:

```
Nguyên liệu --> Xử lý --> Sản phẩm --> Phân phối --> Người dùng
```

Mỗi bước trong chuỗi là một function, và mỗi operand là một đối tượng được
biến đổi. Hiểu chuỗi giá trị giúp xác định đâu là chức năng cốt lõi và đâu
là chức năng hỗ trợ.

## 5.10. Chức năng và hiệu năng

### 5.10.1. Hiệu năng (performance)

Hiệu năng là mức độ hệ thống đạt được chức năng. Nó được đo bằng các chỉ số:

- **Tốc độ** (speed).
- **Độ chính xác** (accuracy).
- **Độ tin cậy** (reliability).
- **Hiệu suất** (efficiency).
- **Khả năng chịu tải** (capacity).

### 5.10.2. Chức năng và hiệu năng

Function mô tả *cái gì*; performance mô tả *tốt đến đâu*. Hai khái niệm bổ
sung cho nhau.

Ví dụ: tủ lạnh có chức năng "làm lạnh"; hiệu năng là "duy trì 4°C trong
điều kiện 32°C môi trường với sai số ±1°C".

### 5.10.3. Yêu cầu hiệu năng

Yêu cầu hiệu năng cần:

- Có thể đo lường.
- Có điều kiện kiểm thử.
- Có ngưỡng chấp nhận.
- Có phương pháp xác minh.

## 5.11. Chức năng trong các lĩnh vực khác nhau

### 5.11.1. Cơ khí

Process: chuyển động, biến dạng, truyền lực.
Operand: vật liệu, lực, chuyển động.

### 5.11.2. Điện tử

Process: khuếch đại, lọc, chuyển đổi.
Operand: tín hiệu, năng lượng.

### 5.11.3. Phần mềm

Process: tính toán, lưu trữ, truyền.
Operand: dữ liệu, sự kiện, trạng thái.

### 5.11.4. Tổ chức

Process: ra quyết định, phối hợp, giao tiếp.
Operand: thông tin, con người, nguồn lực.

### 5.11.5. Hệ thống xã hội - kỹ thuật

Process: vận hành, quản lý, điều tiết.
Operand: con người, hạ tầng, chính sách.

## 5.12. Bài tập

1. Chọn một sản phẩm và liệt kê 10 chức năng. Phân loại thành external,
   internal, primary, secondary, supporting, harmful.
2. Thực hiện function reflection cho sản phẩm đó từ 5 góc nhìn khác nhau.
3. Viết lại 5 chức năng theo dạng độc lập giải pháp.
4. Vẽ sơ đồ thu phóng chức năng cho một chức năng chính.
5. Xác định value-related operand cho sản phẩm.
6. Tìm một ví dụ emergence không mong muốn và phân tích nguyên nhân.

## 5.13. Danh mục chức năng (function catalog)

### 5.13.1. Khái niệm

Danh mục chức năng là bảng liệt kê có hệ thống tất cả các chức năng mà hệ
thống cần thực hiện. Nó là công cụ để đảm bảo không bỏ sót chức năng.

### 5.13.2. Cấu trúc

Mỗi dòng trong danh mục gồm:

- Mã chức năng.
- Tên chức năng (động từ + danh từ).
- Loại chức năng.
- Operand chính.
- Bên liên quan.
- Ưu tiên.
- Ghi chú.

### 5.13.3. Ví dụ

| Mã | Chức năng | Loại | Operand | Ưu tiên |
|----|-----------|------|---------|---------|
| F1 | Làm lạnh thực phẩm | Primary | Thực phẩm | Cao |
| F2 | Duy trì nhiệt độ | External | Nhiệt độ | Cao |
| F3 | Làm đá | Secondary | Nước | Trung bình |
| F4 | Cách nhiệt | Supporting | Nhiệt | Cao |
| F5 | Hiển thị nhiệt độ | Secondary | Thông tin | Thấp |
| F6 | Bảo vệ quá tải | Supporting | Máy nén | Cao |
| F7 | Giảm tiếng ồn | Supporting | Âm thanh | Trung bình |

### 5.13.4. Lợi ích

- Đảm bảo bao phủ đầy đủ.
- Hỗ trợ phân rã.
- Hỗ trợ ánh xạ sang form.
- Hỗ trợ kiểm thử.
- Hỗ trợ giao tiếp với bên liên quan.

### 5.13.5. Quan hệ với yêu cầu

Mỗi chức năng trong danh mục nên truy vết được đến ít nhất một yêu cầu, và
mỗi yêu cầu nên được phục vụ bởi ít nhất một chức năng. Đây là **truy vết
yêu cầu** (requirements traceability).

## 5.14. Tóm tắt chương

- Function = Process + Operand.
- Có nhiều loại chức năng: external/internal, primary/secondary/supporting/
  harmful.
- Function reflection giúp phát hiện chức năng ẩn.
- Solution-neutral function mở rộng không gian giải pháp.
- Function zoom cho phép nhìn chức năng ở nhiều mức.
- Ánh xạ function → form có thể một-một, một-nhiều, nhiều-một.
- Emergence là hành vi toàn thể từ tương tác; cần được thiết kế và quản lý.
- Value-related operand là nơi giá trị thực sự được tạo ra.
