# Chương 4: Quy trình phát triển sản phẩm (PDP)

## 4.1. Mở đầu

Mọi sản phẩm, dù là chiếc còi nhựa hay một hệ thống vệ tinh, đều đi qua một
chuỗi hoạt động từ khi còn là ý tưởng đến khi được sử dụng, bảo trì và thải
hồi. Chuỗi hoạt động đó được gọi là **quy trình phát triển sản phẩm**
(Product Development Process — PDP).

Kiến trúc không tồn tại trong chân không. Nó là một **giai đoạn** trong PDP,
và hiểu PDP là điều kiện để hiểu vì sao kiến trúc lại quan trọng, khi nào nó
diễn ra, ai tham gia, và sản phẩm bàn giao của nó là gì.

Chương này trình bày:

- Mô hình tham chiếu của PDP (reference PDP model).
- Vị trí của kiến trúc trong PDP.
- Sự khác biệt giữa PDP "quy mô lớn" và PDP "thu nhỏ" (in the small).
- Các cổng quyết định (decision gates).
- Vai trò của công nghệ (technology infusion).
- Các mô hình PDP phổ biến: thác nước, xoắn ốc, song song, Agile.

## 4.2. Vì sao cần mô hình tham chiếu

### 4.2.1. PDP thực tế rất đa dạng

Không có một PDP duy nhất cho mọi sản phẩm. Một chiếc còi có thể được phát
triển trong vài tuần bởi một người; một chiếc máy bay mất hàng thập kỷ với
hàng nghìn người. Tuy vậy, các hoạt động cốt lõi thường giống nhau về bản
chất, chỉ khác về quy mô, hình thức và mức độ hình thức hóa.

### 4.2.2. Mô hình tham chiếu

Mô hình tham chiếu là một **mô tả lý tưởng hóa** của PDP, dùng để:

- Giao tiếp giữa các bên.
- So sánh các quy trình thực tế.
- Xác định điểm thiếu hoặc thừa trong quy trình.
- Đào tạo và cải tiến.

Mô hình tham chiếu không phải là quy trình bắt buộc. Nó là "bản đồ" để định
vị, không phải "luật" để tuân thủ máy móc.

## 4.3. Mô hình tham chiếu của PDP

Mô hình tham chiếu của khóa học chia PDP thành các giai đoạn chính:

```
+-----------+   +--------------+   +--------+   +--------+   +--------+
|  Concept  |-->| Architecture |-->| Design |-->| Build  |-->|  Test  |
+-----------+   +--------------+   +--------+   +--------+   +--------+
                                                                  |
                                                                  v
                                                            +-----------+
                                                            | Operations|
                                                            +-----------+
```

Mỗi giai đoạn có đầu vào, hoạt động, đầu ra, và tiêu chí hoàn thành.

### 4.3.1. Giai đoạn Concept (khái niệm)

**Mục tiêu:** Xác định nhu cầu, mục tiêu, và tạo ra (các) concept khả thi.

**Hoạt động:**

- Xác định bên liên quan (stakeholders).
- Thu thập nhu cầu (needs).
- Chuyển nhu cầu thành mục tiêu (goals) và yêu cầu (requirements).
- Tạo nhiều concept (concept generation).
- Đánh giá sơ bộ và chọn concept.
- Xác định biên giới và bối cảnh hệ thống.

**Đầu ra:**

- Tuyên bố nhu cầu (needs statement).
- Mục tiêu và yêu cầu cấp cao.
- Mô tả concept được chọn.
- Phân tích khả thi sơ bộ.

**Đặc trưng:** Độ mơ hồ cao nhất; thông tin ít nhất; chi phí cam kết bắt đầu
tăng mạnh.

### 4.3.2. Giai đoạn Architecture (kiến trúc)

**Mục tiêu:** Chuyển concept thành kiến trúc: phân bổ chức năng cho form,
định nghĩa giao diện, thiết lập cấu trúc phân rã.

**Hoạt động:**

- Phân rã chức năng (functional decomposition).
- Phân rã form (physical decomposition).
- Ánh xạ function → form.
- Định nghĩa giao diện giữa các phần tử và với bối cảnh.
- Đánh giá các phương án kiến trúc.
- Xác định các quyết định kiến trúc chính (key architecture decisions).

**Đầu ra:**

- Mô tả kiến trúc (architecture description).
- Sơ đồ khối và sơ đồ giao diện.
- Ma trận ánh xạ chức năng–form.
- Danh sách quyết định kiến trúc và lý do (rationale).

**Đặc trưng:** Đây là giai đoạn trung tâm của khóa học. Độ mơ hồ còn cao
nhưng đang giảm; chi phí cam kết đạt mức cao nhất so với chi phí thực chi.

### 4.3.3. Giai đoạn Design (thiết kế)

**Mục tiêu:** Hiện thực hóa kiến trúc thành thiết kế chi tiết.

**Hoạt động:**

- Thiết kế chi tiết từng phần tử.
- Chọn vật liệu, linh kiện, công nghệ.
- Thiết kế giao diện chi tiết.
- Phân tích kỹ thuật (kết cấu, nhiệt, điện, phần mềm).
- Tạo bản vẽ, mô hình CAD, mã nguồn.

**Đầu ra:**

- Hồ sơ thiết kế chi tiết.
- Bản vẽ, mô hình, đặc tả.
- Kế hoạch kiểm thử.

**Đặc trưng:** Độ mơ hồ thấp; chi phí thực chi bắt đầu tăng nhanh.

### 4.3.4. Giai đoạn Build (chế tạo)

**Mục tiêu:** Tạo ra sản phẩm vật lý hoặc phần mềm.

**Hoạt động:**

- Mua sắm vật liệu, linh kiện.
- Chế tạo, gia công.
- Lắp ráp.
- Viết mã, tích hợp phần mềm.
- Kiểm tra chất lượng trong quá trình.

**Đầu ra:**

- Nguyên mẫu (prototype) hoặc sản phẩm sản xuất.
- Hồ sơ sản xuất.

### 4.3.5. Giai đoạn Test (kiểm thử)

**Mục tiêu:** Xác minh (verify) và xác nhận (validate) sản phẩm.

**Hoạt động:**

- Kiểm thử đơn vị (unit test).
- Kiểm thử tích hợp (integration test).
- Kiểm thử hệ thống (system test).
- Kiểm thử chấp nhận (acceptance test).
- Kiểm thử độ bền, an toàn, môi trường.

**Đầu ra:**

- Báo cáo kiểm thử.
- Danh sách lỗi và biện pháp khắc phục.
- Xác nhận đạt yêu cầu.

### 4.3.6. Giai đoạn Operations (vận hành)

**Mục tiêu:** Đưa sản phẩm vào sử dụng, bảo trì, và cuối cùng là thải hồi.

**Hoạt động:**

- Triển khai (deployment).
- Đào tạo người dùng.
- Bảo trì, sửa chữa.
- Nâng cấp, cập nhật.
- Thu hồi, tái chế, thải hồi.

**Đầu ra:**

- Sản phẩm hoạt động.
- Dữ liệu vận hành.
- Bài học kinh nghiệm (lessons learned).

## 4.4. Vị trí của kiến trúc trong PDP

### 4.4.1. Kiến trúc ở thượng nguồn

Kiến trúc nằm ở **thượng nguồn** (upstream) của PDP. Đây là nơi:

- Thông tin ít nhất.
- Độ mơ hồ cao nhất.
- Chi phí cam kết tăng nhanh nhất.
- Khả năng ảnh hưởng đến kết quả lớn nhất.

### 4.4.2. Đường cong chi phí

```
Mức
 ^
 |  Chi phí cam kết (committed cost)
 |  ................................========
 |                          .....
 |                   .....
 |            .....
 |      .....
 | .....
 |________________________________________> Thời gian
   Concept  Arch  Design  Build  Test  Ops
```

Đường cong chi phí cam kết dốc lên rất nhanh trong giai đoạn concept và
architecture. Đường cong chi phí thực chi (incurred cost) thì ngược lại:
thấp ở đầu, cao ở cuối. Khoảng cách giữa hai đường cong chính là **đòn bẩy
kiến trúc**: quyết định ở thượng nguồn khóa chặt chi phí ở hạ nguồn.

### 4.4.3. Hệ quả

- Sai lầm kiến trúc đắt hơn nhiều so với sai lầm thiết kế.
- Sửa kiến trúc muộn thường đòi hỏi làm lại (rework) lớn.
- Đầu tư vào kiến trúc ở thượng nguồn có tỷ suất hoàn vốn cao.

## 4.5. PDP "thu nhỏ" (PDP in the small)

### 4.5.1. Khái niệm

Khóa học phân biệt PDP quy mô lớn và PDP "thu nhỏ". PDP thu nhỏ là phiên bản
rút gọn, dùng cho sản phẩm đơn giản hoặc cho mục đích giảng dạy.

Ví dụ: phát triển một chiếc còi.

### 4.5.2. Các bước của PDP thu nhỏ

```
1. Xác định nhu cầu
        |
        v
2. Xác định chức năng (function)
        |
        v
3. Tạo concept
        |
        v
4. Định nghĩa form
        |
        v
5. Ánh xạ function -> form
        |
        v
6. Định nghĩa giao diện
        |
        v
7. Đánh giá và lặp
```

### 4.5.3. Ví dụ: còi

| Bước | Nội dung |
|------|----------|
| Nhu cầu | Tạo âm thanh cảnh báo to, rõ, khi thổi |
| Chức năng | Chuyển luồng khí thành âm thanh |
| Concept | Cộng hưởng khoang với vortex shedding |
| Form | Thân, lỗ thổi, mép cắt, khoang, viên bi |
| Ánh xạ | Khí → lỗ thổi; dao động → mép cắt; cộng hưởng → khoang |
| Giao diện | Lỗ thổi–khoang; mép cắt–khoang; bi–khoang |
| Đánh giá | Thử nghiệm âm lượng, tần số, độ bền |

### 4.5.4. Giá trị của PDP thu nhỏ

- Cho phép luyện tập các khái niệm mà không bị sa lầy vào chi tiết.
- Minh họa rằng các nguyên tắc kiến trúc áp dụng ở mọi quy mô.
- Tạo mẫu tư duy (mental model) để áp dụng vào hệ thống lớn.

## 4.6. Các cổng quyết định (decision gates)

### 4.6.1. Khái niệm

Cổng quyết định là điểm kiểm soát trong PDP, nơi dự án được đánh giá để
quyết định tiếp tục, sửa đổi, hay dừng lại.

### 4.6.2. Các cổng điển hình

| Cổng | Tên | Câu hỏi chính |
|------|-----|----------------|
| G0 | Concept review | Concept có khả thi và đáng làm không? |
| G1 | Architecture review | Kiến trúc có đáp ứng yêu cầu và ràng buộc không? |
| G2 | Design review | Thiết kế chi tiết có nhất quán với kiến trúc không? |
| G3 | Integration review | Các phần tử có tích hợp được không? |
| G4 | Test review | Sản phẩm có đạt yêu cầu không? |
| G5 | Launch review | Có sẵn sàng triển khai không? |

### 4.6.3. Tiêu chí đánh giá kiến trúc tại cổng G1

- Chức năng bên ngoài có được bao phủ đầy đủ?
- Giao diện có được định nghĩa rõ ràng?
- Các quyết định kiến trúc chính có lý do (rationale)?
- Có phương án dự phòng cho rủi ro chính?
- Kiến trúc có hỗ trợ khả năng tiến hóa?
- Các bên liên quan có đồng thuận?

### 4.6.4. Vai trò của kiến trúc sư tại cổng

Kiến trúc sư là người trình bày kiến trúc, bảo vệ các quyết định, và giải
thích đánh đổi. Đây là cơ hội để phát hiện sớm các vấn đề trước khi chi phí
sửa chữa tăng vọt.

## 4.7. Công nghệ trong PDP (technology infusion)

### 4.7.1. Vấn đề

Công nghệ mới có thể tạo ra lợi thế cạnh tranh, nhưng cũng mang lại rủi ro.
Câu hỏi: khi nào đưa công nghệ mới vào sản phẩm?

### 4.7.2. Ma trận rủi ro công nghệ

| | Công nghệ đã chứng minh | Công nghệ mới |
|---|---|---|
| **Sản phẩm quen thuộc** | Rủi ro thấp | Rủi ro trung bình |
| **Sản phẩm mới** | Rủi ro trung bình | Rủi ro cao |

### 4.7.3. Chiến lược

- **Đưa công nghệ mới vào sản phẩm quen thuộc** (technology infusion): giảm
  rủi ro bằng cách giữ nguyên kiến trúc, chỉ thay công nghệ ở một phần tử.
- **Tạo sản phẩm mới với công nghệ đã chứng minh**: giảm rủi ro bằng cách
  dùng công nghệ quen.
- **Tránh đồng thời cả hai**: sản phẩm mới + công nghệ mới = rủi ro cao nhất.

### 4.7.4. Ví dụ

Tủ lạnh: đưa công nghệ inverter (đã chứng minh ở điều hòa) vào tủ lạnh
(sản phẩm quen thuộc) là technology infusion. Ngược lại, tạo một loại tủ lạnh
hoàn toàn mới với công nghệ làm lạnh từ tính (magnetic refrigeration) là rủi
ro cao.

### 4.7.5. Nguyên tắc

- Tách rủi ro công nghệ khỏi rủi ro thị trường.
- Kiểm chứng công nghệ ở quy mô nhỏ trước khi tích hợp.
- Có phương án dự phòng (fallback) cho công nghệ chưa chín.

## 4.8. Các mô hình PDP phổ biến

### 4.8.1. Mô hình thác nước (waterfall)

```
Concept -> Architecture -> Design -> Build -> Test -> Operations
```

**Ưu điểm:** Rõ ràng, dễ quản lý, phù hợp hệ thống ổn định, yêu cầu ít thay
đổi.

**Nhược điểm:** Khó thích nghi với thay đổi; phát hiện lỗi muộn; giả định
yêu cầu biết trước.

### 4.8.2. Mô hình xoắn ốc (spiral)

Lặp lại các vòng: xác định mục tiêu → phân tích rủi ro → phát triển → đánh
giá. Mỗi vòng tạo ra một nguyên mẫu.

**Ưu điểm:** Quản lý rủi ro tốt; thích nghi với thay đổi.

**Nhược điểm:** Phức tạp; cần kỷ luật cao.

### 4.8.3. Mô hình song song (concurrent engineering)

Nhiều giai đoạn diễn ra đồng thời với thông tin chia sẻ. Ví dụ: thiết kế
chế tạo (design for manufacturing) diễn ra song song với thiết kế sản phẩm.

**Ưu điểm:** Rút ngắn thời gian; giảm làm lại.

**Nhược điểm:** Cần phối hợp chặt; dễ xung đột.

### 4.8.4. Mô hình Agile

Lặp ngắn (sprint), phản hồi liên tục, sản phẩm tăng dần.

**Ưu điểm:** Thích nghi nhanh; phù hợp phần mềm và sản phẩm có yêu cầu biến
động.

**Nhược điểm:** Khó áp dụng cho phần cứng; có thể thiếu tầm nhìn kiến trúc
dài hạn nếu không cẩn thận.

### 4.8.5. Lựa chọn mô hình

Không có mô hình tốt nhất cho mọi trường hợp. Tiêu chí lựa chọn:

- Mức độ ổn định của yêu cầu.
- Mức độ phức tạp của hệ thống.
- Rủi ro công nghệ.
- Quy mô đội ngũ.
- Ràng buộc pháp lý và chứng nhận.

## 4.9. Vai trò của kiến trúc trong các mô hình khác nhau

### 4.9.1. Trong thác nước

Kiến trúc là một giai đoạn riêng, hoàn thành trước khi sang thiết kế. Đây là
cách tiếp cận cổ điển, phù hợp hệ thống lớn, ổn định.

### 4.9.2. Trong xoắn ốc

Kiến trúc được phát triển tăng dần qua các vòng. Mỗi vòng có thể tinh chỉnh
kiến trúc dựa trên bài học từ nguyên mẫu.

### 4.9.3. Trong Agile

Kiến trúc không biến mất; nó trở thành **kiến trúc tiến hóa** (evolutionary
architecture). Cần có "kiến trúc sư" hoặc "nhóm kiến trúc" để giữ tầm nhìn
dài hạn, tránh nợ kỹ thuật.

### 4.9.4. Nguyên tắc chung

Dù mô hình nào, kiến trúc vẫn cần:

- Được quyết định sớm ở mức đủ để định hướng.
- Được ghi lại và chia sẻ.
- Được đánh giá định kỳ.
- Được điều chỉnh khi có thông tin mới.

## 4.10. PDP và kiến trúc tổ chức

### 4.10.1. Conway's Law

> Cấu trúc hệ thống mà tổ chức tạo ra có xu hướng phản chiếu cấu trúc giao
> tiếp của tổ chức đó.

Đây là quy luật quan trọng: kiến trúc sản phẩm và kiến trúc tổ chức tương
tác lẫn nhau. Nếu tổ chức chia thành các nhóm theo module, sản phẩm có xu
hướng module hóa theo cách đó.

### 4.10.2. Hệ quả

- Cần thiết kế tổ chức phù hợp với kiến trúc mong muốn.
- Giao diện giữa các nhóm nên phản chiếu giao diện giữa các module.
- Thay đổi kiến trúc thường đòi hỏi thay đổi tổ chức.

### 4.10.3. Ví dụ

Nếu muốn kiến trúc module hóa cao, hãy tổ chức đội ngũ thành các nhóm độc
lập theo module, với giao diện rõ ràng. Nếu tổ chức quá tập trung, kiến trúc
có xu hướng tập trung theo.

## 4.11. Đo lường hiệu quả PDP

### 4.11.1. Các chỉ số

- **Thời gian đến thị trường** (time to market).
- **Chi phí phát triển** (development cost).
- **Chi phí vòng đời** (lifecycle cost).
- **Chất lượng** (số lỗi, độ tin cậy).
- **Mức độ đổi mới** (innovation).
- **Sự hài lòng của khách hàng**.

### 4.11.2. Đánh đổi

Các chỉ số thường đánh đổi lẫn nhau: nhanh hơn có thể tốn kém hơn; rẻ hơn
có thể kém chất lượng hơn. Kiến trúc sư cần hiểu các đánh đổi này để đưa ra
quyết định phù hợp.

### 4.11.3. Vai trò của kiến trúc

Kiến trúc tốt cải thiện nhiều chỉ số cùng lúc:

- Giảm chi phí tích hợp.
- Giảm làm lại.
- Tăng khả năng tái sử dụng.
- Tăng khả năng tiến hóa.
- Giảm rủi ro kỹ thuật.

## 4.12. PDP cho phần mềm

### 4.12.1. Đặc điểm

Phần mềm khác phần cứng ở:

- Chi phí sao chép gần bằng không.
- Có thể thay đổi nhanh chóng.
- Không có hao mòn vật lý.
- Phức tạp chủ yếu ở logic và giao diện.
- Yêu cầu thường thay đổi.

### 4.12.2. Mô hình phù hợp

Phần mềm thường dùng:

- Agile/Scrum.
- DevOps.
- Continuous delivery.
- Mô hình xoắn ốc cho hệ thống lớn.

### 4.12.3. Vai trò của kiến trúc

Trong phần mềm, kiến trúc vẫn quan trọng:

- Xác định module và giao diện.
- Định hướng công nghệ.
- Đảm bảo khả năng mở rộng và bảo trì.
- Ngăn ngừa nợ kỹ thuật.

### 4.12.4. Kiến trúc tiến hóa

Trong Agile, kiến trúc không được thiết kế một lần rồi cố định. Nó tiến hóa
qua các vòng lặp, nhưng vẫn cần tầm nhìn dài hạn.

## 4.13. PDP cho hệ thống quy mô lớn

### 4.13.1. Đặc điểm

Hệ thống quy mô lớn (máy bay, tàu vũ trụ, hạ tầng) có:

- Nhiều hệ thống con.
- Nhiều nhà cung cấp.
- Yêu cầu an toàn nghiêm ngặt.
- Thời gian phát triển dài.
- Chi phí lớn.

### 4.13.2. Thách thức

- Phối hợp nhiều tổ chức.
- Quản lý giao diện phức tạp.
- Đảm bảo nhất quán kiến trúc.
- Quản lý thay đổi.
- Chứng nhận và tuân thủ.

### 4.13.3. Cách tiếp cận

- Kiến trúc tổng thể trước.
- Phân rã thành hệ thống con.
- Định nghĩa giao diện chặt chẽ.
- Quản lý cấu hình.
- Kiểm thử tích hợp theo tầng.

### 4.13.4. Vai trò của kiến trúc sư trưởng

Kiến trúc sư trưởng cần:

- Giữ tầm nhìn tổng thể.
- Điều phối các kiến trúc sư hệ thống con.
- Giải quyết xung đột giao diện.
- Đảm bảo tuân thủ kiến trúc.

## 4.14. Quản lý thay đổi yêu cầu

### 4.14.1. Vì sao yêu cầu thay đổi

- Thị trường thay đổi.
- Công nghệ thay đổi.
- Hiểu biết tăng lên.
- Bên liên quan thay đổi ý kiến.
- Lỗi được phát hiện.

### 4.14.2. Quy trình quản lý thay đổi

1. Tiếp nhận yêu cầu thay đổi.
2. Đánh giá tác động (kỹ thuật, chi phí, tiến độ).
3. Quyết định chấp nhận/từ chối/trì hoãn.
4. Cập nhật tài liệu và kiến trúc.
5. Thông báo cho các bên.
6. Theo dõi thực hiện.

### 4.14.3. Vai trò của kiến trúc

Kiến trúc tốt giúp:

- Đánh giá tác động nhanh hơn.
- Cô lập thay đổi trong module.
- Giảm chi phí thay đổi.
- Duy trì tính nhất quán.

### 4.14.4. Kiến trúc và khả năng thay đổi

Kiến trúc cần được thiết kế để hấp thụ thay đổi:

- Module hóa.
- Giao diện ổn định.
- Trừu tượng hóa.
- Platform hóa.

## 4.15. Nghiên cứu tình huống: PDP của một thiết bị gia dụng

### 4.15.1. Bối cảnh

Một công ty phát triển tủ lạnh thông minh có kết nối Internet.

### 4.15.2. Các giai đoạn

**Concept:** xác định nhu cầu (tiết kiệm điện, điều khiển từ xa, bảo quản
tốt hơn), tạo concept (inverter, cảm biến, kết nối Wi-Fi).

**Architecture:** phân rã thành hệ thống lạnh, hệ thống điện, hệ thống
thông tin; định nghĩa giao diện giữa chúng.

**Design:** thiết kế chi tiết máy nén, bo mạch, ứng dụng di động.

**Build:** chế tạo nguyên mẫu, phát triển phần mềm.

**Test:** kiểm thử chức năng, hiệu năng, an toàn, bảo mật.

**Operations:** triển khai, cập nhật phần mềm, bảo trì.

### 4.15.3. Bài học

- Kiến trúc cần tính đến cả phần cứng và phần mềm.
- Giao diện giữa các hệ thống con là điểm rủi ro.
- Cập nhật phần mềm từ xa cần được thiết kế từ đầu.
- Bảo mật là yêu cầu kiến trúc, không phải tính năng thêm sau.

## 4.16. Bài tập

1. Vẽ PDP cho một sản phẩm bạn biết, xác định các giai đoạn và cổng quyết
   định.
2. Xác định đâu là giai đoạn kiến trúc trong PDP đó, và ai tham gia.
3. Phân tích một quyết định kiến trúc sớm và hệ quả của nó ở hạ nguồn.
4. Áp dụng mô hình PDP thu nhỏ cho một sản phẩm đơn giản (bút bi, cốc giấy).
5. Đánh giá rủi ro công nghệ cho một sản phẩm mới.

## 4.17. Tóm tắt chương

- PDP là chuỗi giai đoạn từ concept đến vận hành.
- Kiến trúc nằm ở thượng nguồn, nơi chi phí cam kết cao và mơ hồ lớn.
- PDP thu nhỏ minh họa các nguyên tắc ở quy mô dễ quản lý.
- Cổng quyết định giúp kiểm soát chất lượng và rủi ro.
- Công nghệ mới cần được đưa vào một cách có chiến lược.
- Nhiều mô hình PDP tồn tại; lựa chọn phụ thuộc bối cảnh.
- Kiến trúc tổ chức và kiến trúc sản phẩm tương tác lẫn nhau.
