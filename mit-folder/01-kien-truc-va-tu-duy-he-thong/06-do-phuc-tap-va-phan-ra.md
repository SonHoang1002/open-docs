# Chương 6: Độ phức tạp và Phân rã

## 6.1. Mở đầu

Độ phức tạp (complexity) là một trong ba thách thức lớn của kiến trúc, cùng
với mơ hồ (ambiguity) và sáng tạo (creativity). Khi hệ thống lớn lên, số
phần tử và số giao diện tăng nhanh hơn tuyến tính, và con người mất khả năng
hiểu toàn bộ hệ thống trong một lần.

Chương này trình bày:

- Định nghĩa và các loại độ phức tạp.
- Vì sao độ phức tạp là vấn đề.
- Chiến lược phân rã (decomposition).
- Module hóa (modularity).
- Giao diện (interfaces).
- Các công cụ: DSM, ma trận N², sơ đồ phân tầng.
- Mối quan hệ giữa độ phức tạp và kiến trúc.

## 6.2. Định nghĩa độ phức tạp

### 6.2.1. Định nghĩa

> **Complexity** là tình trạng có nhiều phần tử và giao diện liên kết, đan
> xen; hệ quả là cần một lượng lớn thông tin để mô tả đầy đủ hệ thống.

Định nghĩa này nhấn mạnh **lượng thông tin** cần để mô tả hệ thống. Một hệ
thống càng phức tạp thì càng cần nhiều thông tin để hiểu, thiết kế, kiểm thử,
và vận hành.

### 6.2.2. Độ phức tạp không phải là "khó"

Cần phân biệt:

- **Complex** (phức tạp): nhiều phần tử và giao diện, cần nhiều thông tin.
- **Complicated** (rối rắm): khó hiểu, thường do thiết kế kém.

Một hệ thống có thể phức tạp nhưng vẫn rõ ràng (ví dụ: Internet). Một hệ thống
có thể đơn giản nhưng rối rắm (ví dụ: một đoạn mã ngắn nhưng khó đọc).

### 6.2.3. Các loại độ phức tạp

**Độ phức tạp cấu trúc (structural complexity):** số phần tử và kết nối.

**Độ phức tạp hành vi (behavioral complexity):** số trạng thái và chuyển
trạng thái.

**Độ phức tạp nhận thức (cognitive complexity):** khó khăn cho con người
hiểu.

**Độ phức tạp tổ chức (organizational complexity):** số nhóm, bộ phận, và
giao diện tổ chức.

**Độ phức tạp động (dynamic complexity):** tương tác theo thời gian, vòng
phản hồi, phi tuyến.

## 6.3. Vì sao độ phức tạp là vấn đề

### 6.3.1. Giới hạn nhận thức

Con người có giới hạn về số lượng thông tin có thể xử lý đồng thời (working
memory). Khi hệ thống vượt quá giới hạn này, ta mất khả năng hiểu toàn bộ.

### 6.3.2. Chi phí gia tăng

Độ phức tạp làm tăng:

- Chi phí thiết kế và kiểm thử.
- Chi phí tích hợp.
- Chi phí bảo trì.
- Xác suất lỗi.
- Thời gian phát triển.

### 6.3.3. Khó khăn giao tiếp

Khi hệ thống phức tạp, các nhóm khó chia sẻ hiểu biết chung. Điều này dẫn
đến hiểu nhầm, làm lại, và xung đột.

### 6.3.4. Rủi ro hành vi xuất hiện

Độ phức tạp cao làm tăng khả năng xuất hiện hành vi không mong muốn, khó dự
đoán và khó kiểm thử.

## 6.4. Phân rã (decomposition)

### 6.4.1. Định nghĩa

> **Decomposition** là quá trình chia hệ thống thành các phần nhỏ hơn, có
> thể quản lý được, với giao diện rõ ràng.

Phân rã là công cụ chính để quản lý độ phức tạp. Mục tiêu là chia hệ thống
thành các phần mà mỗi phần có thể được hiểu, thiết kế, kiểm thử độc lập.

### 6.4.2. Các loại phân rã

**Phân rã vật lý (physical decomposition):** chia theo phần tử vật lý.

Ví dụ: tủ lạnh → hệ thống lạnh, hệ thống điện, hệ thống vỏ.

**Phân rã chức năng (functional decomposition):** chia theo chức năng.

Ví dụ: tủ lạnh → làm lạnh, điều khiển, cách nhiệt, chiếu sáng.

**Phân rã theo tổ chức (organizational decomposition):** chia theo nhóm
phát triển.

Ví dụ: tủ lạnh → nhóm cơ khí, nhóm điện, nhóm phần mềm.

**Phân rã theo giai đoạn (process decomposition):** chia theo bước của quy
trình.

Ví dụ: sản xuất → gia công, lắp ráp, kiểm tra.

**Phân rã theo đối tượng (object decomposition):** chia theo đối tượng mà
hệ thống tác động.

Ví dụ: hệ thống bán hàng → khách hàng, đơn hàng, thanh toán.

### 6.4.3. Tiêu chí phân rã tốt

Một phân rã tốt cần:

- **Bao phủ đầy đủ (complete):** mọi chức năng đều được gán.
- **Không chồng lấn (non-overlapping):** mỗi chức năng chỉ thuộc một phần.
- **Giao diện tối thiểu (minimal interfaces):** ít phụ thuộc giữa các phần.
- **Có thể hiểu (comprehensible):** mỗi phần đủ nhỏ để hiểu.
- **Có thể kiểm thử (testable):** mỗi phần có thể kiểm thử độc lập.
- **Phù hợp tổ chức (organizational fit):** phản chiếu cấu trúc nhóm.

### 6.4.4. Nguyên tắc "chia để trị"

Phân rã dựa trên nguyên tắc chia để trị: chia bài toán lớn thành các bài
toán nhỏ, giải quyết từng bài, rồi kết hợp. Tuy nhiên, cần cẩn thận vì:

- Tổng các giải pháp tối ưu cục bộ không nhất thiết là giải pháp tối ưu
  toàn cục.
- Phân rã tạo ra giao diện, và giao diện là nguồn của chi phí và rủi ro.
- Phân rã sai có thể làm tăng độ phức tạp thay vì giảm.

## 6.5. Module hóa (modularity)

### 6.5.1. Định nghĩa

> **Modularity** là mức độ mà hệ thống được chia thành các module tương đối
> độc lập, với giao diện rõ ràng.

### 6.5.2. Đặc điểm của module tốt

- **Độc lập chức năng:** module thực hiện một chức năng rõ ràng.
- **Giao diện tối thiểu:** module trao đổi với bên ngoài qua giao diện hẹp.
- **Có thể thay thế:** có thể thay module mà không ảnh hưởng phần khác.
- **Có thể kiểm thử:** có thể kiểm thử độc lập.
- **Có thể tái sử dụng:** có thể dùng lại trong hệ thống khác.

### 6.5.3. Ưu điểm của module hóa

- **Giảm độ phức tạp:** mỗi module nhỏ hơn, dễ hiểu.
- **Tăng khả năng thay thế:** dễ nâng cấp, sửa chữa.
- **Tăng khả năng tái sử dụng:** giảm chi phí phát triển.
- **Tăng khả năng tiến hóa:** dễ thêm tính năng mới.
- **Hỗ trợ phát triển song song:** nhiều nhóm làm việc độc lập.
- **Giảm rủi ro:** lỗi trong một module ít lan rộng.

### 6.5.4. Nhược điểm của module hóa

- **Chi phí giao diện:** giao diện giữa các module tốn chi phí thiết kế,
  kiểm thử, và có thể làm giảm hiệu năng.
- **Khó tối ưu toàn cục:** module hóa có thể ngăn cản tối ưu xuyên module.
- **Nguy cơ module hóa quá mức:** quá nhiều module nhỏ làm tăng chi phí
  quản lý.
- **Phụ thuộc ẩn:** nếu giao diện không được định nghĩa đủ chặt, module có
  thể phụ thuộc ngầm vào nhau.

### 6.5.5. Các mức module hóa

- **Module hóa cứng (hard modularity):** thay thế module đòi hỏi thay đổi
  vật lý.
- **Module hóa mềm (soft modularity):** thay thế module qua cấu hình hoặc
  phần mềm.

Ví dụ: máy tính để bàn có module hóa cứng (RAM, ổ cứng) và mềm (driver).

## 6.6. Ghép nối và gắn kết

### 6.6.1. Coupling (ghép nối)

Mức độ phụ thuộc giữa các module.

- **Ghép nối lỏng (loose coupling):** ít phụ thuộc, dễ thay thế.
- **Ghép nối chặt (tight coupling):** phụ thuộc nhiều, khó thay thế.

### 6.6.2. Cohesion (gắn kết)

Mức độ các chức năng bên trong một module liên quan đến nhau.

- **Gắn kết cao (high cohesion):** các chức năng liên quan chặt chẽ.
- **Gắn kết thấp (low cohesion):** các chức năng rời rạc.

### 6.6.3. Nguyên tắc vàng

> **Coupling thấp, cohesion cao.**

Đây là nguyên tắc nền tảng của thiết kế module. Nó giúp hệ thống dễ hiểu,
dễ thay thế, và dễ tiến hóa.

### 6.6.4. Ví dụ

**Tốt:** Module "xử lý thanh toán" chỉ chứa các chức năng thanh toán (gắn
kết cao), và giao tiếp với module "đơn hàng" qua API rõ ràng (ghép nối lỏng).

**Xấu:** Module "tiện ích" chứa đủ loại chức năng không liên quan (gắn kết
thấp), và truy cập trực tiếp vào dữ liệu nội bộ của module khác (ghép nối
chặt).

### 6.6.5. Đo lường

Có thể đo coupling và cohesion bằng:

- Số giao diện giữa các module.
- Số tham chiếu chéo.
- Ma trận phụ thuộc.
- Phân tích mã nguồn (đối với phần mềm).

## 6.7. Giao diện (interfaces)

### 6.7.1. Vai trò

Giao diện là nơi các module gặp nhau. Nó là:

- Nguồn của chi phí tích hợp.
- Nguồn của rủi ro.
- Nơi dễ xảy ra hiểu nhầm.
- Nơi cần được định nghĩa rõ ràng nhất.

### 6.7.2. Các loại giao diện

**Giao diện vật lý:** kích thước, khớp nối, vật liệu, dung sai.

**Giao diện năng lượng:** điện áp, dòng điện, nhiệt, lực.

**Giao diện thông tin:** định dạng dữ liệu, giao thức, tần suất.

**Giao diện con người:** giao diện người dùng, quy trình vận hành.

**Giao diện tổ chức:** trách nhiệm, quyền hạn, báo cáo.

### 6.7.3. Đặc tả giao diện

Một đặc tả giao diện tốt cần:

- Định nghĩa rõ cái gì đi qua giao diện.
- Định nghĩa định dạng, đơn vị, dung sai.
- Định nghĩa điều kiện biên.
- Định nghĩa hành vi khi lỗi.
- Định nghĩa ai chịu trách nhiệm.
- Có phiên bản (versioning).

### 6.7.4. Quản lý giao diện

- Lập danh sách giao diện (interface register).
- Gán chủ sở hữu cho mỗi giao diện.
- Kiểm tra giao diện định kỳ.
- Kiểm thử tích hợp sớm.
- Quản lý thay đổi giao diện.

### 6.7.5. Giao diện và độ phức tạp

Số giao diện tăng nhanh theo số phần tử. Với N phần tử, số giao diện tiềm
năng là N(N-1)/2. Đây là lý do vì sao giảm số phần tử hoặc tổ chức chúng
thành tầng có thể giảm độ phức tạp đáng kể.

## 6.8. Phân cấp (hierarchy)

### 6.8.1. Khái niệm

Phân cấp là tổ chức các phần tử thành nhiều tầng, mỗi tầng chỉ tương tác
trực tiếp với tầng trên và tầng dưới.

### 6.8.2. Ưu điểm

- Giảm số giao diện trực tiếp.
- Cho phép trừu tượng hóa ở mỗi tầng.
- Hỗ trợ phân rã và tích hợp.
- Phù hợp với cách con người hiểu hệ thống.

### 6.8.3. Nhược điểm

- Có thể che giấu phụ thuộc chéo.
- Có thể làm chậm giao tiếp (nhiều tầng).
- Có thể tạo ra "ống khói" (silo) tổ chức.

### 6.8.4. Ví dụ

- **Phần cứng:** hệ thống → bo mạch → chip → cổng logic.
- **Phần mềm:** ứng dụng → dịch vụ → module → hàm.
- **Tổ chức:** công ty → phòng ban → nhóm → cá nhân.

## 6.9. Phân tầng (layering)

### 6.9.1. Khái niệm

Phân tầng là tổ chức các chức năng thành các tầng trừu tượng, mỗi tầng cung
cấp dịch vụ cho tầng trên và sử dụng dịch vụ của tầng dưới.

### 6.9.2. Ví dụ: TCP/IP

```
+-------------------+
| Application       |
+-------------------+
| Transport (TCP)   |
+-------------------+
| Internet (IP)     |
+-------------------+
| Link (Ethernet)   |
+-------------------+
```

Mỗi tầng có giao diện riêng, có thể thay thế mà không ảnh hưởng tầng khác.

### 6.9.3. Ưu điểm

- Tách biệt mối quan tâm (separation of concerns).
- Cho phép thay thế từng tầng.
- Hỗ trợ tiêu chuẩn hóa.
- Dễ hiểu.

### 6.9.4. Nhược điểm

- Chi phí hiệu năng do nhiều tầng.
- Có thể dư thừa chức năng.
- Khó tối ưu xuyên tầng.

### 6.9.5. Nguyên tắc

- Mỗi tầng chỉ phụ thuộc tầng dưới trực tiếp.
- Giao diện giữa các tầng phải ổn định.
- Không nhảy tầng (layer skipping) trừ khi có lý do rõ ràng.

## 6.10. DSM và ma trận N²

### 6.10.1. Design Structure Matrix (DSM)

DSM là ma trận vuông N×N, trong đó hàng và cột là các phần tử, và dấu X tại
ô (i,j) biểu thị phụ thuộc từ i đến j.

Ví dụ:

```
        A  B  C  D
    A   -  X  .  .
    B   .  -  X  .
    C   .  .  -  X
    D   X  .  .  -
```

### 6.10.2. Cách đọc DSM

- Hàng i, cột j có X: phần tử i phụ thuộc phần tử j.
- Ma trận tam giác dưới: thứ tự tuần tự (sequential).
- Ma trận có cụm (cluster): module.
- Ma trận có vòng (loop): phụ thuộc vòng.

### 6.10.3. Lợi ích

- Trực quan hóa phụ thuộc.
- Phát hiện cụm module.
- Phát hiện phụ thuộc vòng.
- Hỗ trợ sắp xếp thứ tự thiết kế/tích hợp.
- Hỗ trợ phân rã.

### 6.10.4. Ma trận N²

Ma trận N² là biến thể của DSM, dùng để ánh xạ chức năng sang form.

```
            Form 1  Form 2  Form 3
Function 1    X
Function 2            X
Function 3                    X
```

### 6.10.5. Hạn chế

- Không thể hiện loại phụ thuộc (chỉ có/không).
- Không thể hiện cường độ phụ thuộc.
- Khó dùng cho hệ thống rất lớn (N lớn).
- Phụ thuộc vào chất lượng dữ liệu đầu vào.

## 6.11. Trừu tượng hóa

### 6.11.1. Khái niệm

Trừu tượng hóa là quá trình bỏ qua chi tiết không cần thiết để tập trung
vào khía cạnh quan trọng.

### 6.11.2. Vai trò trong quản lý độ phức tạp

Trừu tượng hóa cho phép:

- Mô tả hệ thống ở mức phù hợp với người đọc.
- Che giấu chi tiết bên trong module.
- Tạo giao diện đơn giản cho hệ thống phức tạp.
- Hỗ trợ phân rã và phân tầng.

### 6.11.3. Các mức trừu tượng

- **Mức khái niệm:** hệ thống làm gì.
- **Mức kiến trúc:** cấu trúc và giao diện.
- **Mức thiết kế:** chi tiết hiện thực.
- **Mức vật lý:** vật liệu, linh kiện.

### 6.11.4. Nguyên tắc

- Mỗi mức chỉ nên phụ thuộc mức liền kề.
- Trừu tượng hóa phải nhất quán.
- Không rò rỉ chi tiết (leaky abstraction) nếu có thể tránh.

## 6.12. Chiến lược quản lý độ phức tạp

### 6.12.1. Giảm số phần tử

- Loại bỏ chức năng không cần thiết.
- Tích hợp chức năng (nhiều-một).
- Dùng platform và tái sử dụng.

### 6.12.2. Giảm số giao diện

- Tổ chức thành tầng.
- Chuẩn hóa giao diện.
- Dùng bus hoặc trung gian (mediator).
- Giảm phụ thuộc chéo.

### 6.12.3. Tăng trừu tượng

- Che giấu chi tiết trong module.
- Định nghĩa giao diện đơn giản.
- Dùng mô hình thay vì chi tiết.

### 6.12.4. Phân rã hợp lý

- Phân rã theo chức năng, không theo cấu trúc tùy tiện.
- Đảm bảo gắn kết cao, ghép nối thấp.
- Cân nhắc cấu trúc tổ chức.

### 6.12.5. Kiểm soát thay đổi

- Quản lý phiên bản giao diện.
- Đánh giá tác động của thay đổi.
- Giữ giao diện ổn định.

## 6.13. Độ phức tạp và kiến trúc

### 6.13.1. Kiến trúc là công cụ quản lý độ phức tạp

Kiến trúc xác định:

- Cách phân rã hệ thống.
- Cách tổ chức các phần tử.
- Cách định nghĩa giao diện.
- Cách trừu tượng hóa.

Do đó, kiến trúc tốt là kiến trúc làm cho độ phức tạp **có thể quản lý được**.

### 6.13.2. Độ phức tạp không thể loại bỏ hoàn toàn

Mọi hệ thống thực đều có độ phức tạp cố hữu (inherent complexity). Mục tiêu
không phải là loại bỏ mà là **quản lý** nó.

### 6.13.3. Độ phức tạp cố hữu và độ phức tạp tùy ý

- **Độ phức tạp cố hữu (inherent):** do bản chất bài toán.
- **Độ phức tạp tùy ý (accidental):** do cách giải quyết kém.

Kiến trúc sư cần giảm độ phức tạp tùy ý và chấp nhận độ phức tạp cố hữu.

### 6.13.4. Đo lường độ phức tạp kiến trúc

- Số phần tử.
- Số giao diện.
- Số tầng.
- Mức độ ghép nối.
- Số phụ thuộc vòng.
- Kích thước ma trận DSM.

## 6.14. Ví dụ tổng hợp: phân rã tủ lạnh

### 6.14.1. Phân rã chức năng

```
Bảo quản thực phẩm
├── Làm lạnh
│   ├── Nén môi chất
│   ├── Ngưng tụ
│   ├── Tiết lưu
│   └── Bay hơi
├── Điều khiển nhiệt độ
│   ├── Đo nhiệt độ
│   ├── So sánh với ngưỡng
│   └── Bật/tắt máy nén
├── Cách nhiệt
└── Chiếu sáng
```

### 6.14.2. Phân rã vật lý

```
Tủ lạnh
├── Hệ thống lạnh
│   ├── Máy nén
│   ├── Dàn ngưng
│   ├── Ống mao dẫn
│   └── Dàn bay hơi
├── Hệ thống điện
│   ├── Bo mạch điều khiển
│   ├── Thermostat
│   └── Động cơ quạt
├── Hệ thống vỏ
│   ├── Thân tủ
│   ├── Cửa
│   └── Gioăng
└── Hệ thống phụ
    ├── Đèn
    └── Kệ
```

### 6.14.3. Ánh xạ

| Chức năng | Phần tử |
|-----------|---------|
| Nén môi chất | Máy nén |
| Ngưng tụ | Dàn ngưng |
| Tiết lưu | Ống mao dẫn |
| Bay hơi | Dàn bay hơi |
| Đo nhiệt độ | Thermostat |
| Bật/tắt | Bo mạch điều khiển |
| Cách nhiệt | Vỏ + gioăng |

### 6.14.4. Đánh giá

- Số phần tử: vừa phải.
- Số giao diện: tập trung ở hệ thống lạnh (ống, điện).
- Gắn kết: cao trong từng hệ thống con.
- Ghép nối: hệ thống lạnh và điện ghép nối qua tín hiệu điều khiển.
- Có thể thay thế máy nén mà không thay đổi vỏ.

## 6.15. Bài tập

1. Chọn một hệ thống và thực hiện phân rã chức năng đến 3 tầng.
2. Thực hiện phân rã vật lý đến 3 tầng.
3. Lập ma trận DSM cho 6 phần tử.
4. Xác định coupling và cohesion cho các module.
5. Đề xuất cách giảm độ phức tạp.
6. Đánh giá xem độ phức tạp nào là cố hữu, độ phức tạp nào là tùy ý.

## 6.16. Tóm tắt chương

- Complexity là lượng thông tin cần để mô tả hệ thống.
- Phân rã là công cụ chính để quản lý độ phức tạp.
- Module hóa với coupling thấp, cohesion cao là nguyên tắc vàng.
- Giao diện là nơi tập trung chi phí và rủi ro.
- Phân cấp và phân tầng giúp giảm số giao diện.
- DSM và ma trận N² là công cụ trực quan hóa phụ thuộc.
- Trừu tượng hóa giúp che giấu chi tiết không cần thiết.
- Kiến trúc tốt làm độ phức tạp trở nên có thể quản lý.
