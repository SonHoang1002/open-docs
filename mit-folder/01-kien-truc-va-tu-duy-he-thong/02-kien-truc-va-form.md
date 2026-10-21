# Chương 2: Kiến trúc và Form

## 2.1. Mở đầu: kiến trúc là gì

Trong ngôn ngữ thường ngày, "kiến trúc" gợi đến hình ảnh của một tòa nhà,
một bản vẽ, hay một phong cách. Trong kỹ thuật hệ thống, kiến trúc có nghĩa
chặt chẽ hơn nhiều, và việc hiểu đúng định nghĩa là điều kiện tiên quyết để
hành nghề.

Khóa học đưa ra định nghĩa làm việc:

> **Kiến trúc (architecture)** là hiện thân của **concept**, cùng với việc
> **phân bổ chức năng** (function) cho các **phần tử của form**, và **định
> nghĩa các giao diện** (interfaces) giữa các phần tử với nhau và với **bối
> cảnh xung quanh**.

Ba thành tố — form, function, concept — được biểu diễn bằng một tam giác.
Ba thành tố này không độc lập; chúng định nghĩa lẫn nhau trong một cấu trúc
logic.

```
                 Form
                /    \
               /      \
              /        \
       Function ------- Concept
```

Định nghĩa này có ba hệ quả quan trọng:

1. Kiến trúc **không chỉ là form**. Một bản vẽ lắp ráp (assembly drawing) chỉ
   là form, chưa phải kiến trúc.
2. Kiến trúc **không chỉ là chức năng**. Một bản đặc tả yêu cầu chỉ là chức
   năng, chưa phải kiến trúc.
3. Kiến trúc là **ánh xạ** giữa hai bên, được hướng dẫn bởi concept.

## 2.2. Form (hình thái)

### 2.2.1. Định nghĩa

> **Form** là hiện thân vật lý/thông tin có thể tồn tại hoặc có tiềm năng
> tồn tại; là cái hệ thống "là".

Công thức:

```
Form = Elements + Structure
```

- **Elements** (phần tử): các bộ phận cấu thành.
- **Structure** (cấu trúc): cách các phần tử được tổ chức và liên kết.

Form là nguồn gốc của **chi phí** (cost). Câu châm ngôn của khóa học:
**"Parts attract cost"** — các bộ phận hút chi phí. Mỗi phần tử thêm vào làm
tăng chi phí vật liệu, chế tạo, lắp ráp, kiểm thử, tồn kho, bảo trì.

Form có thể là:

- **Vật lý** (physical): còi, tủ lạnh, ô tô, cầu.
- **Thông tin** (informational): phần mềm, giao thức, quy trình, tổ chức.
- **Hỗn hợp**: hệ thống nhúng (embedded system) vừa có phần cứng vừa có phần
  mềm.

### 2.2.2. Form không chỉ là hình dạng

Một điểm dễ nhầm: "form" không chỉ là hình dáng bên ngoài. Nó bao gồm cả:

- Thành phần (components).
- Vật liệu (materials).
- Cấu trúc liên kết (connections).
- Thuộc tính (attributes) như khối lượng, kích thước, màu sắc.
- Trạng thái (states) mà phần tử có thể có.
- Hành vi (behavior) của phần tử.

Ví dụ với còi: form không chỉ là hình cái còi, mà còn là vật liệu (nhựa/kim
loại), kích thước khoang, vị trí mép cắt, và trạng thái (có bi/không bi).

### 2.2.3. Form có thể được phân rã

Form phân rã được theo nhiều cách:

- **Phân rã vật lý** (physical decomposition): còi → thân, lỗ thổi, mép cắt.
- **Phân rã chức năng** (functional decomposition): còi → tạo luồng khí,
  tạo dao động, khuếch đại âm thanh.
- **Phân rã theo tổ chức** (organizational decomposition): đội thiết kế →
  nhóm cơ khí, nhóm điện tử, nhóm phần mềm.

Phân rã vật lý và phân rã chức năng **không nhất thiết trùng nhau**. Đây là
nguồn gốc của nhiều khó khăn trong thiết kế. Ví dụ: một phần tử vật lý có thể
đảm nhận nhiều chức năng (một vỏ máy vừa bảo vệ vừa tản nhiệt vừa là ăng-ten),
và một chức năng có thể được chia sẻ bởi nhiều phần tử.

### 2.2.4. Thuộc tính và trạng thái

Mỗi phần tử của form có:

- **Thuộc tính** (attributes): các đặc tính có thể đo hoặc mô tả (khối lượng,
  chiều dài, công suất, màu).
- **Trạng thái** (states): các chế độ mà phần tử có thể ở (bật/tắt, mở/đóng,
  nóng/lạnh).
- **Hành vi** (behavior): cách trạng thái thay đổi theo thời gian hoặc theo
  sự kiện.

Việc mô tả đầy đủ form đòi hỏi mô tả cả ba loại thông tin này. Đây là lý do
vì sao OPM (chương 10) dùng cả object (có thuộc tính và trạng thái) và
process (làm thay đổi trạng thái).

## 2.3. Function (chức năng)

### 2.3.1. Định nghĩa

> **Function** là các hoạt động, thao tác và biến đổi tạo ra hoặc đóng góp
> vào hiệu năng (performance), tức là đạt được các mục tiêu; là cái hệ thống
> "làm".

Công thức:

```
Function = Process + Operand
```

- **Process** (quá trình): hoạt động biến đổi.
- **Operand** (đối tượng tác động): cái bị biến đổi bởi process.

Ví dụ với còi:

- Process: thổi khí, tạo xoáy, cộng hưởng.
- Operand: luồng khí, cột không khí trong khoang.
- Function: tạo âm thanh.

Ví dụ với tủ lạnh:

- Process: nén, bay hơi, ngưng tụ, tuần hoàn môi chất.
- Operand: môi chất lạnh, nhiệt, thực phẩm.
- Function: làm lạnh và bảo quản.

### 2.3.2. Function là nguồn của lợi ích

Nếu form là nguồn của chi phí, thì function là nguồn của **lợi ích** bên
ngoài. Khách hàng không mua form; họ mua chức năng mà form mang lại. Họ
không mua "một khối kim loại có cánh quạt"; họ mua "sự mát lạnh cho thực phẩm".

Đây là nền tảng của **kiến trúc hướng giá trị** (value-based architecture):
kiến trúc tốt phải nối chức năng có giá trị với form có chi phí hợp lý.

### 2.3.3. Function bên ngoài và bên trong

- **Chức năng bên ngoài** (external function): chức năng nhìn thấy từ bên
  ngoài, qua giao diện với bối cảnh. Đây là chức năng tạo ra giá trị.
- **Chức năng bên trong** (internal function): chức năng của các phần tử
  bên trong, phục vụ cho chức năng bên ngoài.

Ví dụ với tủ lạnh: chức năng bên ngoài là "giữ thực phẩm lạnh". Chức năng
bên trong gồm "nén môi chất", "trao đổi nhiệt", "điều khiển nhiệt độ". Khách
hàng quan tâm chức năng bên ngoài; kỹ sư quan tâm cả hai.

### 2.3.4. Function có thể thu phóng (zoom)

Khác với form (phân rã), function **thu phóng**: ta có thể nhìn một chức năng
ở các mức trừu tượng khác nhau.

Ví dụ với còi:

- Mức 1: tạo âm thanh.
- Mức 2: chuyển động của khí thành dao động âm.
- Mức 3: tách dòng xoáy tại mép cắt.
- Mức 4: phương trình Navier–Stokes cho dòng chảy.

Ở mỗi mức, ta có thể mô tả chức năng mà không cần biết chi tiết mức dưới.
Đây là cơ sở của **thiết kế độc lập với giải pháp** (solution-neutral design).

## 2.4. Concept (khái niệm)

### 2.4.1. Định nghĩa

> **Concept** là một tầm nhìn, ý tưởng, hoặc hình ảnh tinh thần về sản phẩm
> hoặc hệ thống; là sự ánh xạ từ function sang form; bao gồm **nguyên lý
> hoạt động** (principle of operation) và một mức trừu tượng của form.

Concept không phải là một thuộc tính của hệ thống. Nó là một **ánh xạ** giữa
hai miền:

```
Function  --------->  Form
   |                    |
   |   Concept          |
   |   (mapping)        |
   v                    v
Process + Operand    Elements + Structure
```

Ví dụ với còi:

- Nguyên lý hoạt động: "dòng khí qua khe hẹp tạo xoáy, xoáy va vào mép cắt
  gây dao động cộng hưởng trong khoang."
- Ánh xạ: chức năng "tạo âm thanh" được gán cho form "khoang cộng hưởng +
  mép cắt + khe thổi".

### 2.4.2. Concept khác với form

Concept là **trừu tượng hơn** form. Nó có thể được hiện thực hóa bằng nhiều
form khác nhau. Ví dụ, cùng concept "cộng hưởng khoang" có thể hiện thực bằng:

- Còi nhựa rẻ tiền.
- Còi kim loại công nghiệp.
- Còi siêu âm dùng trong thiết bị y tế.

Ngược lại, cùng một form có thể mang nhiều concept khác nhau nếu ta thay đổi
nguyên lý hoạt động.

### 2.4.3. Concept và tính sáng tạo

Concept là nơi sáng tạo diễn ra. Thiết kế (design) là chọn và hiện thực hóa
concept; kiến trúc (architecting) là định nghĩa cấu trúc của concept và các
giao diện của nó. Đây là lý do vì sao chương 9 dành nhiều không gian cho các
kỹ thuật sáng tạo: concept tốt là nền tảng của kiến trúc tốt.

### 2.4.4. Concept phải trả lời ba câu hỏi

Một concept tốt cần:

1. **Khả thi** (feasible): có thể hiện thực bằng công nghệ hiện có hoặc
   công nghệ có thể phát triển.
2. **Hiệu quả** (effective): tạo ra chức năng mong muốn với hiệu năng đủ tốt.
3. **Cạnh tranh** (competitive): có chi phí và lợi ích tốt hơn các lựa chọn
   khác trên thị trường.

## 2.5. Tam giác kiến trúc

### 2.5.1. Quan hệ giữa ba thành tố

Tam giác kiến trúc không chỉ là một hình vẽ; nó là một mô hình logic:

- **Function — Form**: quan hệ "được hiện thực bởi" (is realized by). Mỗi
  chức năng được hiện thực bởi một hoặc nhiều phần tử form.
- **Form — Concept**: quan hệ "được tổ chức theo" (is organized by). Form
  được tổ chức theo concept.
- **Concept — Function**: quan hệ "ánh xạ" (maps). Concept ánh xạ chức năng
  sang form.

### 2.5.2. Kiến trúc là "concept được hiện thân"

Câu "architecture is the embodiment of concept" có nghĩa là: kiến trúc không
phải là ý tưởng trừu tượng (concept), cũng không phải là vật thể cụ thể
(form), mà là **sự kết tinh của ý tưởng vào vật thể**, cùng với cách phân bổ
chức năng và định nghĩa giao diện.

### 2.5.3. Kiến trúc và thiết kế

Phân biệt quan trọng:

| Khái niệm | Câu hỏi | Mức trừu tượng |
|-----------|---------|----------------|
| Concept | Làm thế nào để đạt chức năng? | Cao |
| Architecture | Cấu trúc và giao diện của concept là gì? | Trung bình |
| Design | Chi tiết hiện thực là gì? | Thấp |

Kiến trúc nằm giữa concept và design. Nó đủ cụ thể để ràng buộc thiết kế,
nhưng đủ trừu tượng để cho phép nhiều phương án thiết kế.

## 2.6. Form của hệ thống: các khái niệm liên quan

### 2.6.1. Phần tử (elements)

Phần tử là đơn vị cấu thành form. Phần tử có thể ở nhiều mức:

- Mức hệ thống: tủ lạnh.
- Mức hệ thống con: máy nén.
- Mức linh kiện: piston, xi-lanh, van.
- Mức vật liệu: thép, nhựa, cao su.

Việc chọn mức nào là "phần tử" phụ thuộc vào mục đích phân tích. Không có
mức đúng tuyệt đối.

### 2.6.2. Cấu trúc (structure)

Cấu trúc là cách các phần tử được tổ chức:

- **Cấu trúc phân cấp** (hierarchical): hệ thống → hệ thống con → linh kiện.
- **Cấu trúc mạng** (network): các nút và liên kết ngang hàng.
- **Cấu trúc phân tầng** (layered): các tầng trừu tượng xếp chồng.
- **Cấu trúc module** (modular): các khối chức năng độc lập.

### 2.6.3. Tổng thể sản phẩm (whole product system)

Một khái niệm quan trọng của khóa học: hệ thống không chỉ là sản phẩm chính,
mà là **toàn bộ hệ thống sản phẩm** bao gồm:

- Sản phẩm chính (core product).
- Các sản phẩm phụ trợ (accessories).
- Hạ tầng hỗ trợ (supporting infrastructure).
- Dịch vụ (services).
- Tài liệu (documentation).
- Đào tạo (training).

Ví dụ với tủ lạnh: whole product system gồm tủ lạnh, nguồn điện, không gian
đặt, dịch vụ bảo trì, hướng dẫn sử dụng, và dịch vụ thu gom/tái chế.

### 2.6.4. Giao diện (interfaces)

Giao diện là nơi hai phần tử gặp nhau và trao đổi. Có ba loại:

- **Giao diện vật lý** (physical): khớp nối, bu-lông, đường ống.
- **Giao diện năng lượng** (energy): dòng điện, nhiệt, lực.
- **Giao diện thông tin** (informational): tín hiệu, dữ liệu, giao thức.

Giao diện là nơi tập trung rủi ro và chi phí tích hợp. Quản lý giao diện là
một trong những nhiệm vụ trung tâm của kiến trúc sư.

## 2.7. Form và chức năng: ánh xạ nhiều-nhiều

### 2.7.1. Ánh xạ một-một

Lý tưởng nhất là mỗi chức năng được hiện thực bởi đúng một phần tử, và mỗi
phần tử hiện thực đúng một chức năng. Đây là **module hóa lý tưởng**, nhưng
hiếm khi đạt được.

### 2.7.2. Ánh xạ một-nhiều

Một chức năng được chia sẻ bởi nhiều phần tử. Ví dụ: chức năng "giữ nhiệt"
của tủ lạnh được hiện thực bởi vỏ cách nhiệt, gioăng cửa, và lớp phủ.

### 2.7.3. Ánh xạ nhiều-một

Một phần tử đảm nhận nhiều chức năng. Ví dụ: vỏ điện thoại vừa bảo vệ, vừa
tản nhiệt, vừa là ăng-ten, vừa là bộ phận thẩm mỹ. Đây là **tích hợp chức
năng** (functional integration).

### 2.7.4. Hệ quả

Ánh xạ nhiều-nhiều làm tăng độ phức tạp và làm khó phân rã. Kiến trúc sư cần
quyết định khi nào chấp nhận tích hợp (để giảm chi phí, giảm kích thước) và
khi nào tách biệt (để dễ thay thế, dễ kiểm thử).

## 2.8. Kiến trúc trong vòng đời sản phẩm

### 2.8.1. Kiến trúc là quyết định sớm

Kiến trúc được quyết định ở giai đoạn đầu, khi thông tin còn ít và mơ hồ
cao. Đây là nghịch lý cơ bản: **quyết định quan trọng nhất được đưa ra với
thông tin ít nhất**.

### 2.8.2. Chi phí cam kết và chi phí thực chi

```
Chi phí
  ^
  |        ______________  chi phí thực chi (incurred)
  |      /
  |    /          ____________  chi phí cam kết (committed)
  |  /
  |/
  +----------------------------------> Thời gian
     Concept  Arch  Design  Build  Test
```

Ở giai đoạn kiến trúc, chi phí thực chi còn thấp nhưng chi phí cam kết đã
cao. Đây là lý do vì sao sai lầm kiến trúc đắt hơn nhiều so với sai lầm
thiết kế chi tiết.

### 2.8.3. Kiến trúc và khả năng tiến hóa

Kiến trúc tốt không chỉ phục vụ phiên bản hiện tại mà còn tạo điều kiện cho
các phiên bản tương lai. Điều này đòi hỏi:

- Giao diện ổn định (stable interfaces).
- Module hóa (modularity).
- Platform hóa (platforming).
- Dự phòng mở rộng (extensibility).

## 2.9. Các tiêu chí đánh giá kiến trúc

### 2.9.1. Tính nhất quán (coherence)

Các quyết định kiến trúc phải nhất quán với nhau và với mục tiêu. Một kiến
trúc "vá víu" từ nhiều nguồn thường thiếu nhất quán.

### 2.9.2. Tính đơn giản (simplicity)

Kiến trúc tốt là kiến trúc đơn giản nhất có thể đạt được các mục tiêu. Đơn
giản không có nghĩa là sơ sài, mà là không có độ phức tạp thừa.

### 2.9.3. Tính mở (openness)

Kiến trúc tốt cho phép thay thế, mở rộng, và tích hợp mà không phá vỡ cấu
trúc. Điều này đạt được qua giao diện rõ ràng và module hóa.

### 2.9.4. Tính cân bằng (balance)

Kiến trúc tốt cân bằng các thuộc tính đối kháng: hiệu năng, chi phí, độ tin
cậy, khả năng bảo trì, thời gian phát triển.

### 2.9.5. Tính kiểm chứng được (verifiability)

Kiến trúc tốt cho phép kiểm chứng rằng hệ thống đạt yêu cầu. Điều này đòi
hỏi các giao diện và chức năng được định nghĩa đủ rõ để đo lường.

## 2.10. Ví dụ tổng hợp: kiến trúc của một chiếc còi

Hãy áp dụng toàn bộ chương này vào còi.

### 2.10.1. Function

- Chức năng bên ngoài: tạo âm thanh cảnh báo khi có luồng khí.
- Chức năng bên trong: dẫn khí, tạo xoáy, cộng hưởng, phát âm.

### 2.10.2. Form

- Phần tử: thân còi, lỗ thổi, mép cắt, khoang cộng hưởng, viên bi.
- Cấu trúc: thân còi bao quanh khoang; lỗ thổi dẫn vào khoang; mép cắt
  nằm ở biên khoang; viên bi nằm trong khoang.

### 2.10.3. Concept

- Nguyên lý: dòng khí qua khe hẹp tạo xoáy tuần hoàn (vortex shedding);
  xoáy va vào mép cắt tạo dao động áp suất; khoang cộng hưởng chọn lọc
  tần số; viên bi điều biến âm thanh.

### 2.10.4. Kiến trúc

- Chức năng "tạo âm thanh" được phân bổ cho cụm "khoang + mép cắt".
- Chức năng "dẫn khí" được phân bổ cho "lỗ thổi".
- Chức năng "điều biến" được phân bổ cho "viên bi".
- Giao diện: lỗ thổi–khoang (khí), mép cắt–khoang (áp suất), viên bi–khoang
  (va chạm).

### 2.10.5. Đánh giá

- Nhất quán: các phần tử phối hợp để tạo âm thanh.
- Đơn giản: ít phần tử.
- Mở: có thể thay đổi kích thước khoang để đổi tần số.
- Cân bằng: âm lượng đủ lớn nhưng không quá chói.
- Kiểm chứng: có thể đo tần số và âm lượng.

## 2.11. Kiến trúc như một tập hợp quyết định

### 2.10.1. Quyết định kiến trúc (architecture decision)

Quyết định kiến trúc là quyết định có ảnh hưởng rộng, khó đảo ngược, và ràng
buộc nhiều quyết định khác. Ví dụ:

- Chọn kiến trúc phân tầng hay module.
- Chọn giao diện đồng bộ hay bất đồng bộ.
- Chọn platform chung hay riêng cho từng sản phẩm.
- Chọn tích hợp chức năng hay tách biệt.

### 2.10.2. Đặc điểm của quyết định kiến trúc

- **Có tính hệ quả:** ảnh hưởng đến nhiều phần của hệ thống.
- **Khó đảo ngược:** thay đổi tốn kém.
- **Có đánh đổi:** không có lựa chọn hoàn hảo.
- **Cần lý do:** phải được ghi lại và giải thích.

### 2.10.3. Phân loại quyết định

**Quyết định cấu trúc:** phân rã, phân cấp, module.

**Quyết định giao diện:** định dạng, giao thức, hợp đồng.

**Quyết định công nghệ:** platform, ngôn ngữ, thư viện.

**Quyết định quy trình:** cách phát triển, kiểm thử, triển khai.

### 2.10.4. Ghi lại quyết định

Mỗi quyết định nên có:

- Tiêu đề và mã.
- Bối cảnh.
- Các phương án.
- Quyết định.
- Lý do.
- Hệ quả.
- Ngày xem xét lại.

## 2.12. Các khung nhìn kiến trúc (architecture views)

### 2.11.1. Vì sao cần nhiều khung nhìn

Một kiến trúc không thể được mô tả đầy đủ bằng một sơ đồ duy nhất. Các bên
liên quan khác nhau cần các khung nhìn khác nhau.

### 2.11.2. Các khung nhìn phổ biến

**Khung nhìn chức năng (functional view):** hệ thống làm gì.

**Khung nhìn cấu trúc (structural view):** các phần tử và quan hệ.

**Khung nhìn hành vi (behavioral view):** các tương tác theo thời gian.

**Khung nhìn triển khai (deployment view):** cách hệ thống được triển khai.

**Khung nhìn thông tin (information view):** dữ liệu và luồng dữ liệu.

**Khung nhìn vận hành (operational view):** cách hệ thống được vận hành.

### 2.11.3. Tính nhất quán giữa các khung nhìn

Các khung nhìn phải nhất quán với nhau. Một phần tử trong khung nhìn cấu
trúc phải xuất hiện trong khung nhìn hành vi nếu nó có hành vi.

### 2.11.4. Ví dụ

Với tủ lạnh:

- Chức năng: làm lạnh, điều khiển, cách nhiệt.
- Cấu trúc: máy nén, dàn ngưng, dàn bay hơi, vỏ.
- Hành vi: chu trình làm lạnh, chu trình điều khiển.
- Triển khai: đặt trong bếp, kết nối điện.
- Thông tin: tín hiệu cảm biến, trạng thái hiển thị.
- Vận hành: bảo trì, vệ sinh, thay môi chất.

## 2.13. Kiến trúc và yêu cầu phi chức năng

### 2.12.1. Yêu cầu phi chức năng (non-functional requirements)

Là các yêu cầu về "chất lượng" chứ không phải "tính năng":

- Hiệu năng (performance).
- Độ tin cậy (reliability).
- Khả năng bảo trì (maintainability).
- Khả năng mở rộng (scalability).
- An toàn (safety, security).
- Khả năng sử dụng (usability).
- Khả năng tiến hóa (evolvability).

### 2.12.2. Vai trò của kiến trúc

Yêu cầu phi chức năng thường là **động lực chính** của kiến trúc. Chúng
quyết định:

- Cách phân rã.
- Cách định nghĩa giao diện.
- Công nghệ được chọn.
- Các đánh đổi.

### 2.12.3. Xung đột giữa các yêu cầu

Các yêu cầu phi chức năng thường xung đột:

- Hiệu năng vs. khả năng bảo trì.
- Bảo mật vs. khả năng sử dụng.
- Khả năng mở rộng vs. tính đơn giản.

Kiến trúc sư cần cân bằng và ghi lại đánh đổi.

### 2.12.4. Ví dụ

Với một ứng dụng web:

- Hiệu năng yêu cầu cache và phân tải.
- Bảo mật yêu cầu mã hóa và xác thực.
- Khả năng mở rộng yêu cầu thiết kế phi trạng thái.
- Khả năng bảo trì yêu cầu module hóa.

## 2.14. Nghiên cứu tình huống: op amp

### 2.13.1. Bối cảnh

Op amp (operational amplifier) là một hệ thống điện tử đơn giản nhưng có
kiến trúc phong phú. Nó thường được dùng để minh họa các khái niệm kiến trúc.

### 2.13.2. Chức năng

- Khuếch đại tín hiệu điện áp.
- Có thể cấu hình để thực hiện nhiều phép toán (cộng, trừ, tích phân, vi
  phân).

### 2.13.3. Form

- Các transistor.
- Điện trở.
- Tụ điện.
- Các chân vào/ra.

### 2.13.4. Concept

- Nguyên lý khuếch đại vi sai.
- Phản hồi âm để ổn định độ lợi.
- Cấu hình mạch ngoài để xác định chức năng.

### 2.13.5. Kiến trúc

- Chức năng "khuếch đại" được phân bổ cho tầng khuếch đại vi sai.
- Chức năng "ổn định" được phân bổ cho mạng phản hồi.
- Chức năng "cấu hình" được phân bổ cho các chân kết nối.
- Giao diện: chân vào, chân ra, nguồn.

### 2.13.6. Bài học

- Cùng một form có thể thực hiện nhiều chức năng tùy cấu hình.
- Giao diện đơn giản có thể che giấu sự phức tạp bên trong.
- Concept "phản hồi âm" là nguyên lý tổng quát, áp dụng được ngoài điện tử.

## 2.15. Bài tập

1. Chọn một sản phẩm và vẽ tam giác kiến trúc của nó. Xác định rõ function,
   form, concept.
2. Liệt kê các giao diện của sản phẩm đó. Phân loại thành vật lý, năng lượng,
   thông tin.
3. Xác định whole product system của sản phẩm, bao gồm các thành phần không
   phải là sản phẩm chính.
4. Tìm một ví dụ về ánh xạ nhiều-một (một phần tử đảm nhận nhiều chức năng)
   và một ví dụ về ánh xạ một-nhiều (một chức năng được chia sẻ bởi nhiều
   phần tử).

## 2.16. Tóm tắt chương

- Kiến trúc = concept + phân bổ function cho form + định nghĩa interface.
- Form = elements + structure; là nguồn của chi phí.
- Function = process + operand; là nguồn của lợi ích.
- Concept là ánh xạ function → form, chứa nguyên lý hoạt động.
- Kiến trúc nằm giữa concept và design, được quyết định sớm với thông tin ít.
- Kiến trúc tốt cần nhất quán, đơn giản, mở, cân bằng, kiểm chứng được.
