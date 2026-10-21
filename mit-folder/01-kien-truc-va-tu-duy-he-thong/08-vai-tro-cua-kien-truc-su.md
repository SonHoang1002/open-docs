# Chương 8: Vai trò của Kiến trúc sư

## 8.1. Mở đầu

Sau khi đã hiểu hệ thống, form, function, concept, quy trình, độ phức tạp và
mơ hồ, câu hỏi tiếp theo là: **ai làm việc kiến trúc, và làm như thế nào?**
Chương này bàn về vai trò của kiến trúc sư (architect) — người chịu trách
nhiệm định nghĩa kiến trúc hệ thống và dẫn dắt các quyết định kiến trúc.

Vai trò này thường bị hiểu sai. Kiến trúc sư không phải là:

- Người vẽ sơ đồ đẹp.
- Người viết tài liệu kỹ thuật.
- Người ra quyết định mọi thứ một mình.
- Người chỉ làm việc ở giai đoạn đầu rồi biến mất.

Kiến trúc sư là:

- Người **định hình** vấn đề và giải pháp ở mức cao.
- Người **cân bằng** các thuộc tính đối kháng.
- Người **định nghĩa** giao diện và cấu trúc.
- Người **dẫn dắt** đội ngũ kỹ thuật.
- Người **bảo vệ** tính nhất quán của kiến trúc theo thời gian.

## 8.2. Định nghĩa vai trò

### 8.2.1. Định nghĩa

> **Kiến trúc sư (architect)** là người chịu trách nhiệm định nghĩa kiến
> trúc hệ thống: hiện thân concept, phân bổ chức năng cho form, định nghĩa
> giao diện, và đảm bảo kiến trúc đáp ứng các mục tiêu của bên liên quan.

### 8.2.2. Ba khía cạnh của vai trò

**Khía cạnh kỹ thuật:** hiểu sâu các nguyên lý kỹ thuật, công nghệ, và đánh
đổi.

**Khía cạnh kinh doanh:** hiểu giá trị, chi phí, thị trường, và chiến lược.

**Khía cạnh con người:** dẫn dắt, giao tiếp, thuyết phục, và xây dựng đồng
thuận.

Kiến trúc sư giỏi cần cả ba. Thiếu kỹ thuật → kiến trúc không khả thi. Thiếu
kinh doanh → kiến trúc không tạo giá trị. Thiếu con người → kiến trúc không
được thực thi.

### 8.2.3. Kiến trúc sư và quản lý dự án

| Tiêu chí | Kiến trúc sư | Quản lý dự án |
|----------|--------------|----------------|
| Tập trung | Cái gì và như thế nào (kỹ thuật) | Ai, khi nào, bao nhiêu |
| Thời gian | Dài hạn, vòng đời | Ngắn hạn, tiến độ |
| Thành công | Kiến trúc đúng, bền vững | Dự án đúng hạn, đúng ngân sách |
| Quyết định | Đánh đổi kỹ thuật | Phân bổ nguồn lực |

Hai vai trò bổ sung cho nhau, nhưng thường xung đột. Kiến trúc sư cần làm
việc chặt chẽ với quản lý dự án.

## 8.3. Trách nhiệm của kiến trúc sư

### 8.3.1. Hiểu và định hình vấn đề

- Thu thập và phân tích nhu cầu.
- Xác định bên liên quan.
- Định hình vấn đề (problem framing).
- Xác định biên giới và bối cảnh.
- Làm rõ mơ hồ.

### 8.3.2. Tạo và đánh giá concept

- Tạo nhiều concept khả thi.
- Đánh giá concept theo tiêu chí: khả thi, hiệu quả, cạnh tranh.
- Chọn concept và ghi lại lý do.

### 8.3.3. Định nghĩa kiến trúc

- Phân rã chức năng.
- Phân rã form.
- Ánh xạ function → form.
- Định nghĩa giao diện.
- Xác định cấu trúc phân cấp.
- Ghi lại các quyết định kiến trúc.

### 8.3.4. Cân bằng các thuộc tính

- Hiệu năng và chi phí.
- Độ tin cậy và độ phức tạp.
- Tính linh hoạt và tính tối ưu.
- Thời gian phát triển và chất lượng.
- Khả năng mở rộng và tính đơn giản.

### 8.3.5. Dẫn dắt đội ngũ kỹ thuật

- Truyền đạt tầm nhìn kiến trúc.
- Giải thích các quyết định và đánh đổi.
- Hỗ trợ các nhóm giải quyết vấn đề.
- Giải quyết xung đột kỹ thuật.
- Đảm bảo tính nhất quán.

### 8.3.6. Bảo vệ kiến trúc theo thời gian

- Đánh giá thay đổi so với kiến trúc.
- Ngăn chặn "xói mòn kiến trúc" (architecture erosion).
- Cập nhật kiến trúc khi cần.
- Ghi lại bài học kinh nghiệm.

## 8.4. Sản phẩm bàn giao của kiến trúc sư

### 8.4.1. Mô tả kiến trúc (architecture description)

Tài liệu mô tả:

- Chức năng bên ngoài và bên trong.
- Form và cấu trúc.
- Ánh xạ function → form.
- Giao diện.
- Các quyết định kiến trúc và lý do.
- Các ràng buộc và giả định.

### 8.4.2. Sơ đồ kiến trúc

- Sơ đồ khối chức năng.
- Sơ đồ khối vật lý.
- Sơ đồ giao diện.
- Sơ đồ bối cảnh.
- Sơ đồ phân tầng.
- Ma trận DSM/N².

### 8.4.3. Danh sách quyết định kiến trúc

Mỗi quyết định gồm:

- Nội dung quyết định.
- Bối cảnh.
- Các phương án.
- Lý do chọn.
- Hệ quả.
- Ngày xem xét lại.

### 8.4.4. Đặc tả giao diện

- Danh sách giao diện.
- Định dạng, đơn vị, dung sai.
- Điều kiện biên.
- Hành vi khi lỗi.
- Chủ sở hữu giao diện.
- Phiên bản.

### 8.4.5. Nguyên tắc kiến trúc (architecture principles)

Các nguyên tắc hướng dẫn quyết định:

- Ưu tiên module hóa.
- Giao diện ổn định.
- Tách biệt mối quan tâm.
- Đơn giản trước, tối ưu sau.
- Thiết kế cho khả năng tiến hóa.

### 8.4.6. Đánh giá kiến trúc (architecture evaluation)

- Đánh giá theo kịch bản (scenario-based).
- Phân tích đánh đổi (trade-off analysis).
- Đánh giá rủi ro.
- Đánh giá khả năng tiến hóa.

## 8.5. Giá trị của kiến trúc

### 8.5.1. Giá trị kinh tế

Kiến trúc tốt:

- Giảm chi phí tích hợp.
- Giảm làm lại.
- Tăng khả năng tái sử dụng.
- Rút ngắn thời gian phát triển.
- Giảm chi phí vòng đời.

### 8.5.2. Giá trị chiến lược

Kiến trúc tốt:

- Tạo lợi thế cạnh tranh.
- Cho phép tiến hóa theo thị trường.
- Hỗ trợ platform và dòng sản phẩm.
- Giảm rủi ro kỹ thuật.

### 8.5.3. Giá trị tổ chức

Kiến trúc tốt:

- Tạo ngôn ngữ chung.
- Hỗ trợ phối hợp giữa các nhóm.
- Giảm xung đột.
- Tăng khả năng học hỏi.

### 8.5.4. Giá trị xã hội

Kiến trúc tốt:

- Tạo sản phẩm an toàn hơn.
- Giảm tác động môi trường.
- Tăng khả năng tiếp cận.
- Đóng góp vào phúc lợi xã hội.

### 8.5.5. Chi phí của kiến trúc

Kiến trúc cũng có chi phí:

- Thời gian và nguồn lực.
- Có thể làm chậm dự án.
- Có thể tạo ra quy trình quan liêu.
- Có thể khóa cứng vào một hướng.

Cần cân bằng giữa giá trị và chi phí của việc làm kiến trúc.

## 8.6. Phong cách kiến trúc (architecture style)

### 8.6.1. Khái niệm

Phong cách kiến trúc là mẫu tổ chức lặp lại của các phần tử và giao diện.
Nó giúp tái sử dụng kinh nghiệm và giao tiếp.

### 8.6.2. Các phong cách phổ biến

**Kiến trúc phân tầng (layered):**

```
+-------------------+
| Presentation      |
+-------------------+
| Business Logic    |
+-------------------+
| Data Access       |
+-------------------+
| Database          |
+-------------------+
```

Ưu điểm: tách biệt mối quan tâm, dễ thay thế.
Nhược điểm: có thể dư thừa, chậm.

**Kiến trúc pipeline:**

```
Input --> Stage 1 --> Stage 2 --> Stage 3 --> Output
```

Ưu điểm: đơn giản, dễ song song hóa.
Nhược điểm: khó xử lý ngoại lệ, phụ thuộc thứ tự.

**Kiến trúc client-server:**

```
Client <--> Server <--> Database
```

Ưu điểm: tập trung dữ liệu, dễ quản lý.
Nhược điểm: server là điểm nghẽn, phụ thuộc mạng.

**Kiến trúc hướng dịch vụ (service-oriented):**

```
Service A <--> Service B <--> Service C
```

Ưu điểm: linh hoạt, tái sử dụng, độc lập triển khai.
Nhược điểm: phức tạp, khó đảm bảo nhất quán.

**Kiến trúc hướng sự kiện (event-driven):**

```
Producer --> Event Bus --> Consumer
```

Ưu điểm: ghép nối lỏng, mở rộng tốt.
Nhược điểm: khó gỡ lỗi, khó đảm bảo thứ tự.

**Kiến trúc module (modular):**

```
+--------+  +--------+  +--------+
| Module |  | Module |  | Module |
+--------+  +--------+  +--------+
```

Ưu điểm: độc lập, dễ thay thế.
Nhược điểm: cần quản lý giao diện.

### 8.6.3. Chọn phong cách

Việc chọn phong cách phụ thuộc:

- Loại hệ thống.
- Yêu cầu phi chức năng.
- Kinh nghiệm đội ngũ.
- Hệ sinh thái công nghệ.
- Mức độ thay đổi dự kiến.

### 8.6.4. Phong cách và ngôn ngữ chung

Phong cách tạo ra ngôn ngữ chung: khi mọi người nói "kiến trúc phân tầng",
họ hiểu ngay các đặc điểm, ưu nhược điểm. Điều này tăng hiệu quả giao tiếp.

## 8.7. Platform và dòng sản phẩm

### 8.7.1. Platform

Platform là tập hợp các phần tử và giao diện chung được chia sẻ bởi nhiều
sản phẩm.

Ví dụ:

- Khung gầm chung cho nhiều mẫu xe.
- Nhân hệ điều hành chung cho nhiều thiết bị.
- Bộ thư viện chung cho nhiều ứng dụng.

### 8.7.2. Lợi ích của platform

- Giảm chi phí phát triển.
- Rút ngắn thời gian ra thị trường.
- Tăng chất lượng nhờ tái sử dụng.
- Cho phép tạo biến thể nhanh.

### 8.7.3. Rủi ro của platform

- Khóa cứng vào một công nghệ.
- Platform kém có thể ảnh hưởng nhiều sản phẩm.
- Cần đầu tư ban đầu lớn.
- Có thể không phù hợp với mọi thị trường.

### 8.7.4. Dòng sản phẩm (product family)

Dòng sản phẩm là tập hợp các sản phẩm chia sẻ platform và kiến trúc chung.

Chiến lược:

- **Phát triển tất cả cùng lúc:** chia sẻ tối đa, nhưng rủi ro cao.
- **Phát triển tuần tự:** bắt đầu với một sản phẩm, sau đó tạo biến thể.
- **Phát triển theo nền tảng:** xây platform trước, sau đó phát triển sản phẩm.

### 8.7.5. Vai trò của kiến trúc sư

Kiến trúc sư cần:

- Thiết kế platform đủ linh hoạt.
- Xác định điểm biến thiên (variation points).
- Cân bằng giữa chia sẻ và khác biệt.
- Quản lý tiến hóa của platform.

## 8.8. Kỹ năng của kiến trúc sư

### 8.8.1. Kỹ năng kỹ thuật

- Hiểu sâu lĩnh vực.
- Hiểu nhiều lĩnh vực liên quan.
- Hiểu công nghệ và xu hướng.
- Có kinh nghiệm thiết kế và tích hợp.

### 8.8.2. Kỹ năng tư duy hệ thống

- Nhìn tổng thể.
- Hiểu tương tác.
- Dự đoán hành vi xuất hiện.
- Cân bằng các thuộc tính.

### 8.8.3. Kỹ năng giao tiếp

- Trình bày rõ ràng.
- Viết tài liệu mạch lạc.
- Vẽ sơ đồ hiệu quả.
- Điều chỉnh thông điệp theo đối tượng.

### 8.8.4. Kỹ năng lãnh đạo

- Xây dựng tầm nhìn.
- Tạo đồng thuận.
- Giải quyết xung đột.
- Truyền cảm hứng.
- Ra quyết định.

### 8.8.5. Kỹ năng kinh doanh

- Hiểu giá trị và chi phí.
- Hiểu thị trường.
- Hiểu chiến lược.
- Hiểu rủi ro.

### 8.8.6. Kỹ năng học hỏi

- Học từ thất bại.
- Cập nhật công nghệ.
- Học từ các lĩnh vực khác.
- Phản tư (reflection).

## 8.9. Kiến trúc sư trong tổ chức

### 8.9.1. Vị trí

Kiến trúc sư có thể:

- Là vai trò chuyên trách.
- Là vai trò kiêm nhiệm.
- Là một nhóm (architecture team).
- Là một chức năng trong tổ chức (enterprise architecture).

### 8.9.2. Quyền hạn

Kiến trúc sư cần đủ quyền hạn để:

- Ra quyết định kiến trúc.
- Từ chối thay đổi phá vỡ kiến trúc.
- Phân bổ nguồn lực kỹ thuật.
- Đại diện kỹ thuật với bên ngoài.

Thiếu quyền hạn, kiến trúc sư chỉ là "cố vấn" và kiến trúc dễ bị xói mòn.

### 8.9.3. Quan hệ với các vai trò khác

| Vai trò | Quan hệ |
|---------|---------|
| Quản lý sản phẩm | Cung cấp nhu cầu, ưu tiên |
| Quản lý dự án | Phân bổ nguồn lực, tiến độ |
| Kỹ sư trưởng | Hiện thực kiến trúc |
| Nhóm phát triển | Thực thi thiết kế |
| Kiểm thử | Xác minh kiến trúc |
| Vận hành | Phản hồi về khả năng vận hành |

### 8.9.4. Mô hình tổ chức

- **Kiến trúc sư tập trung:** một người/nhóm quyết định tất cả.
- **Kiến trúc sư phân tán:** mỗi nhóm có kiến trúc sư riêng.
- **Kiến trúc sư liên kết:** kiến trúc sư trưởng điều phối các kiến trúc sư
  nhóm.

Mỗi mô hình có ưu nhược điểm riêng, phụ thuộc quy mô và văn hóa tổ chức.

## 8.10. Nguyên tắc hành nghề

### 8.10.1. Bắt đầu từ giá trị

Mọi quyết định kiến trúc nên được đánh giá theo giá trị mang lại: lợi ích
cho bên liên quan so với chi phí.

### 8.10.2. Đơn giản khi có thể

Kiến trúc đơn giản nhất đáp ứng yêu cầu là kiến trúc tốt nhất. Độ phức tạp
chỉ nên được thêm khi thực sự cần.

### 8.10.3. Tối ưu hóa giao diện

Giao diện là nơi tập trung chi phí và rủi ro. Đầu tư vào giao diện rõ ràng,
ổn định, và được quản lý tốt.

### 8.10.4. Thiết kế cho thay đổi

Hệ thống sẽ thay đổi. Kiến trúc tốt tạo điều kiện cho thay đổi với chi phí
hợp lý.

### 8.10.5. Ghi lại lý do

Quyết định mà không có lý do sẽ bị hiểu sai và bị thay đổi tùy tiện. Ghi lại
bối cảnh, phương án, và lý do chọn.

### 8.10.6. Giao tiếp sớm và thường xuyên

Kiến trúc chỉ có giá trị khi được hiểu và thực thi. Giao tiếp với các bên
liên quan từ sớm.

### 8.10.7. Khiêm tốn

Không ai biết tất cả. Kiến trúc sư cần lắng nghe, học hỏi, và sẵn sàng thay
đổi quan điểm.

### 8.10.8. Chấp nhận đánh đổi

Không có giải pháp hoàn hảo. Mọi quyết định đều có đánh đổi. Điều quan trọng
là đánh đổi có ý thức và được ghi lại.

## 8.11. Các mẫu phản kiến trúc (anti-patterns)

### 8.11.1. Kiến trúc sư "voi trắng"

Kiến trúc sư chỉ làm việc ở giai đoạn đầu, không tham gia thực thi, không
theo dõi hậu quả.

### 8.11.2. Kiến trúc sư "cảnh sát"

Kiến trúc sư chỉ kiểm tra và từ chối, không hỗ trợ, không hướng dẫn.

### 8.11.3. Kiến trúc sư "nghệ sĩ"

Kiến trúc sư theo đuổi vẻ đẹp kỹ thuật mà bỏ qua giá trị và chi phí.

### 8.11.4. Kiến trúc sư "tắc kè"

Kiến trúc sư thay đổi quan điểm theo người nói chuyện, thiếu nhất quán.

### 8.11.5. Kiến trúc sư "ẩn dật"

Kiến trúc sư làm việc một mình, không giao tiếp, tạo ra kiến trúc không ai
hiểu.

### 8.11.6. Kiến trúc "vá víu"

Kiến trúc được xây dựng bằng cách thêm dần các quyết định cục bộ, không có
tầm nhìn tổng thể.

### 8.11.7. Kiến trúc "vàng son"

Kiến trúc quá phức tạp, quá tổng quát, không phù hợp với nhu cầu thực tế.

### 8.11.8. Kiến trúc "bong bóng"

Kiến trúc đẹp trên giấy nhưng không khả thi trong thực tế.

## 8.12. Đánh giá một kiến trúc sư giỏi

### 8.12.1. Kết quả

- Hệ thống đáp ứng nhu cầu.
- Hệ thống vận hành ổn định.
- Hệ thống dễ tiến hóa.
- Chi phí hợp lý.

### 8.12.2. Quá trình

- Quyết định có lý do.
- Giao tiếp hiệu quả.
- Cân bằng các bên liên quan.
- Học hỏi từ kết quả.

### 8.12.3. Ảnh hưởng

- Đội ngũ hiểu và tin tưởng kiến trúc.
- Các quyết định được thực thi nhất quán.
- Kiến trúc được bảo vệ theo thời gian.

## 8.13. Bài tập

1. Chọn một kiến trúc sư nổi tiếng (trong bất kỳ lĩnh vực nào) và phân tích
   vai trò của họ theo các khía cạnh trong chương này.
2. Đóng vai kiến trúc sư cho một sản phẩm đơn giản. Viết mô tả kiến trúc,
   danh sách giao diện, và 5 quyết định kiến trúc.
3. Xác định phong cách kiến trúc phù hợp cho một hệ thống bạn biết và giải
   thích lý do.
4. Liệt kê các bên liên quan và cách bạn sẽ giao tiếp với từng bên.
5. Tìm một ví dụ về "xói mòn kiến trúc" trong thực tế và đề xuất cách phòng
   ngừa.

## 8.14. Tóm tắt chương

- Kiến trúc sư định nghĩa kiến trúc, cân bằng thuộc tính, dẫn dắt đội ngũ,
  và bảo vệ kiến trúc.
- Vai trò có ba khía cạnh: kỹ thuật, kinh doanh, con người.
- Sản phẩm bàn giao gồm mô tả kiến trúc, sơ đồ, quyết định, đặc tả giao diện,
  nguyên tắc, đánh giá.
- Kiến trúc tạo giá trị kinh tế, chiến lược, tổ chức, xã hội, nhưng cũng có
  chi phí.
- Phong cách kiến trúc giúp tái sử dụng kinh nghiệm và giao tiếp.
- Platform và dòng sản phẩm là chiến lược quan trọng.
- Kiến trúc sư cần kỹ năng kỹ thuật, tư duy hệ thống, giao tiếp, lãnh đạo,
  kinh doanh, học hỏi.
- Tránh các mẫu phản kiến trúc và hành nghề có nguyên tắc.
