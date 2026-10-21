# Chương 7: Giải quyết mơ hồ (Ambiguity)

## 7.1. Mở đầu

Mơ hồ (ambiguity) là đặc trưng không thể tránh khỏi của giai đoạn đầu phát
triển sản phẩm. Khi dự án bắt đầu, ta thường chưa biết rõ:

- Khách hàng thực sự muốn gì.
- Đâu là ràng buộc cứng, đâu là mong muốn mềm.
- Công nghệ nào sẽ khả dụng.
- Thị trường sẽ phản ứng ra sao.
- Các bên liên quan có mâu thuẫn gì.

Nghịch lý cơ bản: **những quyết định quan trọng nhất lại được đưa ra khi
thông tin ít nhất**. Kiến trúc sư giỏi không phải là người loại bỏ mơ hồ
ngay lập tức, mà là người **quản lý** mơ hồ một cách có hệ thống: nhận diện,
phân loại, giảm thiểu, và ra quyết định dưới điều kiện không chắc chắn.

Chương này trình bày:

- Định nghĩa và các nguồn gốc của mơ hồ.
- Thượng nguồn và hạ nguồn của PDP.
- Nhu cầu, mục tiêu, yêu cầu.
- Bên liên quan (stakeholders).
- Biên giới và bối cảnh.
- Kỹ thuật giảm thiểu mơ hồ.
- Ra quyết định dưới điều kiện không chắc chắn.

## 7.2. Định nghĩa mơ hồ

### 7.2.1. Định nghĩa

> **Ambiguity** là sự mơ hồ đến từ nhiều cách diễn giải và sự không chắc
> chắn, bị khuếch đại bởi thông tin thiếu, mâu thuẫn hoặc sai.

Mơ hồ gồm hai thành phần:

- **Đa nghĩa (ambiguity of meaning):** cùng một phát biểu có thể hiểu theo
  nhiều cách.
- **Không chắc chắn (uncertainty):** ta không biết chắc điều gì sẽ xảy ra.

### 7.2.2. Ví dụ

- "Sản phẩm phải thân thiện với người dùng." — Thân thiện nghĩa là gì? Với
  ai? Đo bằng cách nào?
- "Hệ thống phải nhanh." — Nhanh bao nhiêu? Trong điều kiện nào?
- "Giá phải cạnh tranh." — So với ai? Ở phân khúc nào?
- "Thiết kế phải đẹp." — Đẹp theo tiêu chuẩn nào?

### 7.2.3. Mơ hồ không phải là xấu

Mơ hồ có mặt tích cực:

- Nó cho phép khám phá không gian giải pháp.
- Nó tránh khóa cứng quá sớm vào một giải pháp.
- Nó phản ánh thực tế rằng tương lai chưa được biết.

Vấn đề không phải là có mơ hồ, mà là **không quản lý** mơ hồ.

## 7.3. Các nguồn gốc của mơ hồ

### 7.3.1. Nguồn gốc từ nhu cầu

- Khách hàng không biết rõ mình muốn gì.
- Khách hàng khác nhau muốn những điều khác nhau.
- Nhu cầu thay đổi theo thời gian.

### 7.3.2. Nguồn gốc từ thông tin

- Thông tin thiếu (missing information).
- Thông tin mâu thuẫn (conflicting information).
- Thông tin sai (incorrect information).
- Thông tin quá tải (information overload).

### 7.3.3. Nguồn gốc từ ngôn ngữ

- Từ ngữ đa nghĩa.
- Thuật ngữ khác nhau giữa các nhóm.
- Ngữ cảnh văn hóa khác nhau.
- Giả định ngầm không được nói ra.

### 7.3.4. Nguồn gốc từ bối cảnh

- Thị trường biến động.
- Công nghệ thay đổi.
- Chính sách, pháp lý thay đổi.
- Đối thủ cạnh tranh hành động.

### 7.3.5. Nguồn gốc từ tổ chức

- Mục tiêu khác nhau giữa các phòng ban.
- Quyền hạn không rõ ràng.
- Giao tiếp kém.
- Văn hóa tổ chức.

## 7.4. Thượng nguồn và hạ nguồn

### 7.4.1. Định nghĩa

**Upstream (thượng nguồn):** phần đầu của PDP, nơi nhu cầu, mục tiêu,
concept, và kiến trúc được xác định.

**Downstream (hạ nguồn):** phần sau của PDP, nơi thiết kế chi tiết, hiện
thực, kiểm thử, và vận hành diễn ra.

### 7.4.2. Đặc điểm

| Tiêu chí | Upstream | Downstream |
|----------|----------|------------|
| Mơ hồ | Cao | Thấp |
| Thông tin | Ít | Nhiều |
| Chi phí cam kết | Cao | Thấp (đã cam kết) |
| Chi phí thực chi | Thấp | Cao |
| Khả năng thay đổi | Cao | Thấp |
| Đòn bẩy | Cao | Thấp |

### 7.4.3. Hệ quả

- Mơ hồ tập trung ở thượng nguồn.
- Giải quyết mơ hồ ở thượng nguồn rẻ hơn nhiều so với hạ nguồn.
- Kiến trúc sư làm việc chủ yếu ở thượng nguồn.

### 7.4.4. Mô hình "hai thế giới"

Có thể hình dung thượng nguồn và hạ nguồn là hai thế giới:

```
Thế giới thượng nguồn          Thế giới hạ nguồn
- Nhu cầu, mục tiêu            - Thiết kế chi tiết
- Concept, kiến trúc           - Chế tạo, kiểm thử
- Mơ hồ cao                    - Mơ hồ thấp
- Tư duy tổng hợp              - Tư duy phân tích
```

Kiến trúc sư là người cầu nối giữa hai thế giới.

## 7.5. Nhu cầu, mục tiêu, yêu cầu

### 7.5.1. Needs (nhu cầu)

Nhu cầu là mong muốn, kỳ vọng của bên liên quan. Nhu cầu thường:

- Mơ hồ.
- Không đầy đủ.
- Mâu thuẫn.
- Thay đổi.

Ví dụ: "Tôi muốn thực phẩm tươi lâu."

### 7.5.2. Goals (mục tiêu)

Mục tiêu là kết quả mà hệ thống hoặc tổ chức muốn đạt. Mục tiêu cụ thể hơn
nhu cầu nhưng vẫn có thể trừu tượng.

Ví dụ: "Giữ thực phẩm tươi trong 7 ngày."

### 7.5.3. Requirements (yêu cầu)

Yêu cầu là phát biểu cụ thể, có thể kiểm chứng, mà hệ thống phải thỏa mãn.

Ví dụ: "Duy trì nhiệt độ ngăn mát ở 4°C ± 1°C trong điều kiện môi trường
32°C."

### 7.5.4. Chuỗi chuyển hóa

```
Needs --> Goals --> Requirements --> Functions --> Design
```

Mỗi bước là một lần giảm mơ hồ và tăng cụ thể hóa.

### 7.5.5. Tiêu chí của yêu cầu tốt

- **Cụ thể (specific):** không mơ hồ.
- **Đo lường được (measurable):** có chỉ số.
- **Có thể đạt (achievable):** khả thi.
- **Liên quan (relevant):** gắn với mục tiêu.
- **Có thời hạn (time-bound):** có mốc.
- **Có thể kiểm chứng (verifiable):** có phương pháp kiểm tra.

### 7.5.6. Sai lầm thường gặp

- Biến giải pháp thành yêu cầu ("phải dùng máy nén").
- Yêu cầu mâu thuẫn không được phát hiện.
- Yêu cầu không đo lường được.
- Yêu cầu quá chi tiết ở giai đoạn sớm.
- Bỏ sót yêu cầu của bên liên quan yếu thế.

## 7.6. Bên liên quan (stakeholders)

### 7.6.1. Định nghĩa

Bên liên quan là cá nhân hoặc tổ chức có lợi ích hoặc ảnh hưởng đến hệ thống.

### 7.6.2. Các loại bên liên quan

**Bên trong:**

- Người dùng cuối.
- Người vận hành.
- Kỹ thuật viên bảo trì.
- Nhà phát triển.
- Quản lý.

**Bên ngoài:**

- Khách hàng.
- Nhà cung cấp.
- Đối tác.
- Cơ quan quản lý.
- Cộng đồng.
- Môi trường.

### 7.6.3. Ma trận quyền lực - quan tâm

| | Quan tâm thấp | Quan tâm cao |
|---|---|---|
| **Quyền lực cao** | Giữ hài lòng | Quản lý chặt |
| **Quyền lực thấp** | Theo dõi | Giữ thông tin |

### 7.6.4. Xung đột lợi ích

Các bên liên quan thường có lợi ích xung đột:

- Người dùng muốn nhiều tính năng; nhà sản xuất muốn ít chi phí.
- Người vận hành muốn đơn giản; kỹ sư muốn tối ưu.
- Cộng đồng muốn ít tác động; doanh nghiệp muốn lợi nhuận.

Kiến trúc sư cần nhận diện và cân bằng các xung đột này.

### 7.6.5. Kỹ thuật thu thập nhu cầu

- Phỏng vấn (interviews).
- Khảo sát (surveys).
- Quan sát (observation).
- Hội thảo (workshops).
- Phân tích dữ liệu sử dụng.
- Nghiên cứu thị trường.
- Phân tích đối thủ.

## 7.7. Biên giới và bối cảnh

### 7.7.1. Xác định biên giới

Biên giới hệ thống là quyết định kiến trúc quan trọng. Nó xác định:

- Cái gì nằm trong phạm vi thiết kế.
- Cái gì là ràng buộc từ bên ngoài.
- Ai chịu trách nhiệm cho phần nào.

### 7.7.2. Câu hỏi để xác định biên giới

- Hệ thống bắt đầu và kết thúc ở đâu?
- Cái gì ta kiểm soát, cái gì ta không?
- Ranh giới trách nhiệm giữa các đội là gì?
- Đâu là giao diện với hệ thống bên ngoài?

### 7.7.3. Sơ đồ bối cảnh

Sơ đồ bối cảnh mô tả:

- Hệ thống ở trung tâm.
- Các tác nhân bên ngoài.
- Dòng vào/ra.
- Ràng buộc.

```
            +-------------+
   Người -->|             |--> Nhiệt
   dùng    |   Tủ lạnh   |
   Điện -->|             |--> Tiếng ồn
            +-------------+
                  |
                  v
              Thực phẩm
```

### 7.7.4. Biên giới thay đổi theo thời gian

Biên giới có thể thay đổi khi dự án tiến triển. Điều quan trọng là biên giới
phải được **nêu rõ** và **nhất quán**.

## 7.8. Kỹ thuật giảm thiểu mơ hồ

### 7.8.1. Đặt câu hỏi

- Hỏi "vì sao" nhiều lần (5 Whys).
- Hỏi "nếu... thì sao" (what if).
- Hỏi "còn gì nữa" (what else).
- Hỏi "ai, cái gì, khi nào, ở đâu, như thế nào, vì sao".

### 7.8.2. Tạo nguyên mẫu (prototyping)

Nguyên mẫu giúp:

- Kiểm chứng giả định.
- Khám phá nhu cầu ẩn.
- Giảm mơ hồ về khả thi kỹ thuật.
- Tạo điểm neo để thảo luận.

Các loại nguyên mẫu:

- **Nguyên mẫu giấy** (paper prototype).
- **Nguyên mẫu nhấp nháy** (clickable prototype).
- **Nguyên mẫu chức năng** (functional prototype).
- **Nguyên mẫu kỹ thuật** (technical prototype).

### 7.8.3. Kịch bản (scenarios)

Kịch bản mô tả các tình huống sử dụng, giúp:

- Hiểu nhu cầu trong ngữ cảnh.
- Phát hiện trường hợp biên.
- Kiểm tra tính bền vững của thiết kế.

### 7.8.4. Phân tích bên liên quan

Liệt kê đầy đủ các bên, lợi ích, ảnh hưởng, và mức độ ưu tiên.

### 7.8.5. Mô hình hóa

Dùng mô hình (OPM, sơ đồ khối, mô hình toán) để làm rõ cấu trúc và hành vi.

### 7.8.6. Định nghĩa thuật ngữ

Tạo bảng thuật ngữ chung (glossary) để tránh hiểu nhầm.

### 7.8.7. Đánh giá chéo

Cho người ngoài đọc và phản biện để phát hiện giả định ngầm.

### 7.8.8. Lặp lại

Mơ hồ giảm dần qua các vòng lặp: hỏi → mô hình hóa → kiểm chứng → hỏi tiếp.

## 7.9. Ra quyết định dưới điều kiện không chắc chắn

### 7.9.1. Các loại quyết định

**Quyết định chắc chắn:** biết rõ kết quả.

**Quyết định rủi ro:** biết xác suất các kết quả.

**Quyết định không chắc chắn:** không biết xác suất.

**Quyết định mơ hồ:** không biết các kết quả có thể xảy ra.

### 7.9.2. Chiến lược

**Trì hoãn quyết định (defer):** chờ thêm thông tin, nhưng có chi phí cơ hội.

**Quyết định linh hoạt (flexible):** giữ nhiều lựa chọn mở (real options).

**Quyết định dựa trên nguyên tắc:** dùng nguyên tắc kiến trúc để hướng dẫn.

**Quyết định thử nghiệm:** thử quy mô nhỏ để học.

**Quyết định đa phương án:** chuẩn bị nhiều phương án dự phòng.

### 7.9.3. Nguyên tắc "đủ tốt"

Trong điều kiện mơ hồ, quyết định "đủ tốt" thường tốt hơn quyết định "tối
ưu" bị trì hoãn quá lâu. Đây là tư duy satisficing.

### 7.9.4. Ghi lại lý do quyết định (decision rationale)

Mỗi quyết định kiến trúc nên được ghi lại:

- Quyết định là gì.
- Bối cảnh và giả định.
- Các phương án đã xem xét.
- Lý do chọn.
- Hệ quả và rủi ro.
- Ngày xem xét lại.

### 7.9.5. Architecture Decision Records (ADR)

ADR là định dạng phổ biến để ghi lại quyết định kiến trúc:

```
# ADR-001: Chọn kiến trúc phân tầng

## Bối cảnh
...

## Quyết định
...

## Hệ quả
...
```

## 7.10. Mơ hồ trong các giai đoạn

### 7.10.1. Giai đoạn concept

Mơ hồ cao nhất:

- Nhu cầu chưa rõ.
- Mục tiêu chưa thống nhất.
- Concept chưa hình thành.
- Bên liên quan chưa được xác định đầy đủ.

Chiến lược: khám phá rộng, tạo nhiều concept, đặt nhiều câu hỏi.

### 7.10.2. Giai đoạn architecture

Mơ hồ giảm nhưng vẫn còn:

- Chức năng đã rõ hơn.
- Form chưa hoàn toàn xác định.
- Giao diện còn đang định hình.
- Đánh đổi chưa được quyết.

Chiến lược: mô hình hóa, đánh giá phương án, ghi lại quyết định.

### 7.10.3. Giai đoạn design

Mơ hồ thấp:

- Chức năng và form đã rõ.
- Chi tiết đang được xác định.
- Giao diện đã được định nghĩa.

Chiến lược: phân tích chi tiết, kiểm tra tính nhất quán.

### 7.10.4. Giai đoạn build/test

Mơ hồ thấp nhất:

- Thiết kế đã hoàn tất.
- Sản phẩm đang được tạo ra.
- Kiểm thử xác nhận.

Chiến lược: quản lý thay đổi, kiểm soát chất lượng.

## 7.11. Mơ hồ và sáng tạo

### 7.11.1. Mơ hồ là nguyên liệu của sáng tạo

Khi mọi thứ đã rõ ràng, không còn không gian cho sáng tạo. Mơ hồ tạo ra
khoảng trống để khám phá.

### 7.11.2. Cân bằng

Quá nhiều mơ hồ → tê liệt, không thể hành động.
Quá ít mơ hồ → khóa cứng, không còn sáng tạo.

Kiến trúc sư cần duy trì **mơ hồ có kiểm soát**: đủ để khám phá, đủ rõ để
tiến bước.

### 7.11.3. Kỹ thuật

- Đặt khung vấn đề (problem framing) rõ ràng.
- Tách mơ hồ về "cái gì" khỏi mơ hồ về "như thế nào".
- Dùng kịch bản để khám phá.
- Dùng nguyên mẫu để kiểm chứng.
- Duy trì nhiều phương án song song khi rủi ro cao.

## 7.12. Ví dụ: ServeCo

### 7.12.1. Bối cảnh

ServeCo là một doanh nghiệp dịch vụ thiết kế, đối mặt với mơ hồ về:

- Khách hàng mục tiêu.
- Dịch vụ cung cấp.
- Quy trình nội bộ.
- Cách đo lường thành công.

### 7.12.2. Quá trình giảm mơ hồ

1. **Xác định bên liên quan:** khách hàng, nhân viên, đối tác, nhà đầu tư.
2. **Thu thập nhu cầu:** phỏng vấn, khảo sát.
3. **Định nghĩa mục tiêu:** tăng doanh thu, giảm chi phí, tăng hài lòng.
4. **Xây dựng kiến trúc tổ chức:** vai trò, quy trình, giao diện.
5. **Kiểm chứng:** thử nghiệm với một nhóm khách hàng nhỏ.

### 7.12.3. Bài học

- Mơ hồ về mục tiêu dẫn đến mơ hồ về kiến trúc.
- Cần làm rõ mục tiêu trước khi thiết kế cấu trúc.
- Kiến trúc tổ chức và kiến trúc dịch vụ tương tác lẫn nhau.
- Thử nghiệm nhỏ giúp giảm mơ hồ với chi phí thấp.

## 7.13. Bài tập

1. Chọn một dự án và liệt kê 10 phát biểu mơ hồ. Viết lại chúng thành yêu
   cầu cụ thể.
2. Lập ma trận bên liên quan cho dự án đó.
3. Vẽ sơ đồ bối cảnh.
4. Viết 3 kịch bản sử dụng.
5. Ghi lại 5 quyết định kiến trúc dưới dạng ADR.
6. Xác định đâu là mơ hồ cố hữu, đâu là mơ hồ có thể giảm.

## 7.14. Tóm tắt chương

- Ambiguity là đặc trưng của thượng nguồn, gồm đa nghĩa và không chắc chắn.
- Mơ hồ có nguồn gốc từ nhu cầu, thông tin, ngôn ngữ, bối cảnh, tổ chức.
- Thượng nguồn có mơ hồ cao, chi phí cam kết cao, đòn bẩy cao.
- Chuỗi needs → goals → requirements → functions → design giảm mơ hồ dần.
- Bên liên quan cần được xác định đầy đủ và cân bằng lợi ích.
- Biên giới và bối cảnh là quyết định kiến trúc quan trọng.
- Nhiều kỹ thuật giảm mơ hồ: đặt câu hỏi, nguyên mẫu, kịch bản, mô hình hóa.
- Ra quyết định dưới điều kiện không chắc chắn cần chiến lược và ghi lại lý do.
