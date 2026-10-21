# Kiến trúc hệ thống và Tư duy hệ thống

## Giới thiệu bộ tài liệu

Bộ tài liệu này được biên soạn từ chuỗi bài giảng IAP tháng 1 năm 2007 của môn
**System Architecture** (Kiến trúc hệ thống) do Giáo sư **Edward Crawley** giảng
dạy tại Viện Công nghệ Massachusetts (MIT), thuộc chương trình
**System Design and Management (SDM)**. Nội dung gốc gồm sáu bài giảng chính,
một bảng thuật ngữ (glossary), một bài hướng dẫn về
**Object-Process Methodology (OPM)**, cùng các tài liệu chuyên đề về
sáng tạo (creativity), kịch bản (scenarios) và bản đồ tư duy (mind mapping)
của Thomas H. Speller, Jr.

Mục tiêu của bộ tài liệu không phải là chép lại nguyên văn slide, mà là
diễn giải, giải thích và mở rộng các khái niệm cốt lõi để người đọc có thể
hiểu và áp dụng vào công việc kiến trúc hệ thống thực tế. Các thuật ngữ
tiếng Anh được giữ trong ngoặc để tiện tra cứu, đối chiếu với tài liệu gốc.

## Tinh thần của khóa học

Câu nói định hướng của Giáo sư Crawley là:

> "This is a course in how to think, not what to think."
> (Đây là khóa học về cách tư duy, không phải dạy bạn phải nghĩ gì.)

Khóa học không biến người học thành người ghi nhớ các định nghĩa, mà rèn
luyện một *cách nhìn*: nhìn sản phẩm như một hệ thống, nhìn hệ thống như
một tập hợp các quyết định kiến trúc có hệ quả lên chi phí, lợi ích, khả
năng tiến hóa và khả năng vận hành.

Ba trụ cột tư duy mà khóa học xoay quanh:

1. **Ambiguity** (mơ hồ) — sự không rõ ràng ở giai đoạn đầu của quá trình
   phát triển sản phẩm, khi nhu cầu, mục tiêu và ràng buộc chưa được xác định.
2. **Creativity** (sáng tạo) — khả năng tạo ra cái mới, tổ hợp cái đã có theo
   cách mới, để sinh ra concept (khái niệm) cho hệ thống.
3. **Complexity** (độ phức tạp) — lượng thông tin cần thiết để mô tả đầy đủ
   một hệ thống và các giao diện của nó.

Vai trò của kiến trúc sư (architect) là *cân bằng và quản lý* ba lực này:
làm giảm mơ hồ ở thượng nguồn, định hướng sáng tạo để tạo concept, và quản
lý độ phức tạp để hệ thống vẫn còn "hiểu được" (comprehensible) đối với tất
cả những người tham gia trong suốt vòng đời của nó.

## Kiến trúc là gì

Định nghĩa làm việc (working definition) của khóa học:

> **Architecture** là hiện thân của **concept**, cùng với việc **phân bổ
> chức năng vật lý/thông tin** (physical/informational function) cho các
> **phần tử của form**, và **định nghĩa các giao diện** (interfaces) giữa
> các phần tử với nhau và với **bối cảnh xung quanh** (surrounding context).

Kiến trúc gồm ba thành tố được biểu diễn bằng tam giác:

```
                 Form
                  /\
                 /  \
                /    \
               /      \
        Function ------ Concept
```

- **Function** (chức năng): hệ thống *làm gì* — được tạo thành từ
  **process** (quá trình) + **operand** (đối tượng bị tác động).
- **Form** (hình thái): hệ thống *là gì* — được tạo thành từ
  **elements** (phần tử) + **structure** (cấu trúc).
- **Concept** (khái niệm): ánh xạ (mapping) từ function sang form, chứa
  nguyên lý hoạt động (principle of operation) và một mức trừu tượng của form.

Điểm then chốt: **form và function là hai thuộc tính hoàn toàn khác nhau**.
Form *kết tụ* (aggregates) và *phân rã* (decomposes); function *xuất hiện*
(emerges) và *thu phóng* (zooms). Form là nguồn của **chi phí** (cost);
function là nguồn của **lợi ích** (benefit) bên ngoài. Kiến trúc tốt là kiến
trúc nối được lợi ích với chi phí một cách cạnh tranh.

## Vì sao kiến trúc quan trọng

Kiến trúc nằm ở **thượng nguồn** (upstream) của quá trình phát triển sản phẩm
(Product Development Process — PDP). Ở đó, chi phí *cam kết* (committed cost)
gần như toàn bộ vòng đời đã được quyết định, trong khi chi phí *thực chi*
(incurred cost) còn rất nhỏ. Đây là điểm đòn bẩy (leverage) cao nhất:

- Quyết định kiến trúc sớm khóa chặt cấu trúc chi phí về sau.
- Kiến trúc tốt giúp hệ thống dễ tích hợp, dễ tiến hóa, dễ vận hành.
- Kiến trúc là nguồn lợi thế cạnh tranh bền vững.
- Kiến trúc kém tạo ra nợ kỹ thuật (technical debt) và làm tăng độ phức tạp
  không cần thiết.

## Cấu trúc bộ tài liệu

Bộ tài liệu gồm 10 chương nội dung, được thiết kế để đọc tuần tự, nhưng mỗi
chương cũng có thể đọc độc lập.

| STT | Tệp | Nội dung chính |
|-----|-----|----------------|
| 0 | `README.md` | Tổng quan, triết lý, mục lục |
| 1 | `01-tu-duy-he-thong.md` | Hệ thống, hành vi xuất hiện, holism, tư duy hệ thống |
| 2 | `02-kien-truc-va-form.md` | Kiến trúc, form, function, concept |
| 3 | `03-thuat-ngu-glossary.md` | Giải thích chi tiết từng thuật ngữ |
| 4 | `04-quy-trinh-phat-trien-san-pham-PDP.md` | PDP, mô hình tham chiếu, vị trí kiến trúc |
| 5 | `05-tinh-nang-function-va-emergence.md` | Function, process, operand, emergence |
| 6 | `06-do-phuc-tap-va-phan-ra.md` | Complexity, decomposition, tái hợp, module, interface |
| 7 | `07-giai-quyet-mo-ho-ambiguity.md` | Ambiguity, upstream/downstream, needs, goals, bối cảnh |
| 8 | `08-vai-tro-cua-kien-truc-su.md` | Vai trò, sản phẩm bàn giao, giá trị, phong cách, platform |
| 9 | `09-tu-duy-sang-tao-va-doi-moi.md` | Creativity, scenario, mind mapping, TRIZ, phá lối mòn |
| 10 | `10-mo-hinh-object-process-OPM.md` | Object-Process Methodology |

## Lộ trình đọc gợi ý

### Lộ trình 1: Người mới bắt đầu

Đọc theo thứ tự 1 → 2 → 3 → 5 → 6 → 7 → 8 → 4 → 9 → 10.
Mục đích là nắm khái niệm nền (hệ thống, form, function, thuật ngữ) trước,
sau đó mới đi vào quy trình và công cụ.

### Lộ trình 2: Kỹ sư đã có kinh nghiệm

Đọc 2 → 3 → 5 → 6 → 7 → 10, sau đó quay lại 1, 4, 8, 9 để hệ thống hóa.
Trọng tâm là các chương về form/function, complexity và ambiguity.

### Lộ trình 3: Quản lý / lãnh đạo

Đọc 1 → 4 → 7 → 8 → 9. Trọng tâm là triết lý, quy trình, vai trò kiến trúc sư
và sáng tạo trong tổ chức.

## Các ví dụ xuyên suốt

Để bảo đảm tính nhất quán, bộ tài liệu dùng lại một tập ví dụ của khóa học:

- **Whistle** (còi) — hệ thống cơ học đơn giản, dùng để minh họa form,
  function, concept, emergence, OPM.
- **Op amp** (khuếch đại thuật toán) — hệ thống điện tử đơn giản, minh họa
  decomposition, interface, whole product system.
- **Bubblesort** — hệ thống phần mềm đơn giản, minh họa cấu trúc thông tin,
  sequence, interface phần mềm.
- **Skateboard** (ván trượt) — hệ thống cơ khí cỡ trung, minh họa
  decomposition, module, platform, kiến trúc dựa trên giá trị.
- **Refrigerator** (tủ lạnh) — hệ thống tích hợp cơ–điện–nhiệt, minh họa
  nhiều tầng chức năng (giá trị chính, giá trị khác, giao diện, hỗ trợ).
- **Corkscrew** (dụng cụ mở nút chai) — minh họa chuỗi ý định (levels of
  intent) và chuỗi vận hành.
- **TCP** — giao thức mạng, minh họa kiến trúc phân tầng (layered
  architecture), đánh đổi giữa linh hoạt và tối ưu.
- **ServeCo** — doanh nghiệp dịch vụ thiết kế, minh họa kiến trúc tổ chức
  và quy trình như một hệ thống.
- **Space shuttle / hệ thống hàng không** — ví dụ về hệ thống phức tạp,
  an toàn cao, nhiều bên liên quan.

## Quy ước trình bày

- Thuật ngữ tiếng Anh được giữ trong ngoặc, ví dụ: độ phức tạp (complexity).
- Sơ đồ được vẽ bằng ký tự ASCII để có thể đọc trong mọi trình soạn thảo.
- Bảng được dùng để so sánh các khái niệm song song.
- Các khối "Ghi chú", "Ví dụ", "Phản ví dụ" được đánh dấu bằng tiêu đề cấp ba.
- Không dùng biểu tượng cảm xúc (emoji) trong toàn bộ tài liệu.

## Các câu hỏi định hướng của khóa học

Đây là những câu hỏi mà mỗi chương sẽ lần lượt trả lời:

1. Hệ thống là gì, và điều gì làm cho một tập hợp các phần tử trở thành hệ thống?
2. Kiến trúc là gì, khác gì với thiết kế (design) và khái niệm (concept)?
3. Form và function khác nhau như thế nào, và chúng liên hệ ra sao?
4. Chức năng bên ngoài (external function) và giá trị (value) liên hệ thế nào?
5. Làm thế nào để quản lý độ phức tạp mà không làm hệ thống trở nên rối rắm?
6. Làm thế nào để giải quyết sự mơ hồ ở thượng nguồn?
7. Kiến trúc sư thực sự làm gì, và bàn giao những gì?
8. Làm thế nào để sáng tạo có định hướng?
9. Làm thế nào để biểu diễn kiến trúc một cách chặt chẽ?
10. Làm thế nào để biết một kiến trúc là "tốt"?

## Định nghĩa cốt lõi dùng xuyên suốt

Để tiện tra cứu nhanh, dưới đây là các định nghĩa cốt lõi sẽ được triển khai
chi tiết trong các chương sau.

### Hệ thống (System)

> Một tập hợp các phần tử có quan hệ tương tác lẫn nhau, thực hiện một chức
> năng, mà chức năng đó lớn hơn tổng các phần.

Định nghĩa này nhấn mạnh hai điều: (1) các phần tử phải *tương tác*, và
(2) chức năng của toàn thể *vượt trội* (emergent) so với tổng các phần.

### Form

> Hiện thân vật lý/thông tin có thể tồn tại hoặc có tiềm năng tồn tại;
> là cái hệ thống "là"; là tổng các phần tử cộng với cấu trúc.

Công thức: **Form = Elements + Structure**.

### Function

> Các hoạt động, thao tác và biến đổi tạo ra hoặc đóng góp vào hiệu năng
> (tức là đạt được các mục tiêu); là cái hệ thống "làm".

Công thức: **Function = Process + Operand**.

### Concept

> Một tầm nhìn, ý tưởng, hình ảnh tinh thần về sản phẩm/hệ thống, ánh xạ
> Function sang Form; bao gồm nguyên lý hoạt động và một mức trừu tượng
> của form.

Concept *không phải* là thuộc tính của hệ thống; nó là một **ánh xạ**.

### Architecture

> Hiện thân của concept, phân bổ chức năng cho các phần tử của form, và
> định nghĩa các giao diện giữa các phần tử và với bối cảnh.

### Value

> Lợi ích trên chi phí (benefit at cost). Lợi ích được dẫn dắt bởi chức năng
> được phân phối bên ngoài qua giao diện; chi phí được dẫn dắt bởi thiết kế
> của form — "parts attract cost".

### Complexity

> Có nhiều phần tử và giao diện liên kết, đan xen; hệ quả là cần một lượng
> lớn thông tin để mô tả đầy đủ hệ thống.

### Ambiguity

> Sự mơ hồ đến từ nhiều cách diễn giải và sự không chắc chắn, bị khuếch đại
> bởi thông tin thiếu, mâu thuẫn hoặc sai.

## Ghi chú về nguồn gốc

Toàn bộ nội dung được biên soạn dựa trên:

- Sáu bài giảng `ESD.34_lec1.txt` … `ESD.34_lec6.txt`.
- Bảng thuật ngữ `ESD.34_glossary.txt`.
- Bài hướng dẫn OPM `ESD.34_lec2_opm.txt`.
- Tài liệu sáng tạo `ESD.34_creativity_wkshp.txt`.
- Tài liệu kịch bản `ESD.34_scenarios.txt`.
- Tài liệu bản đồ tư duy `ESD.34_mind_mapping.txt`.

Mọi diễn giải mở rộng đều nhằm mục đích giáo dục; khi có khác biệt giữa bản
diễn giải và slide gốc, slide gốc là nguồn tham chiếu cuối cùng.

## Cách sử dụng bộ tài liệu

1. Đọc README để nắm bản đồ tổng thể.
2. Với mỗi chương, đọc phần định nghĩa trước, sau đó đến ví dụ và phản ví dụ.
3. Tự trả lời các câu hỏi ở cuối mỗi chương trước khi sang chương tiếp theo.
4. Áp dụng ngay vào một sản phẩm/hệ thống thực tế mà bạn đang làm: vẽ form,
   liệt kê function, xác định value related operand, kiểm tra interface.
5. Ghi lại các nguyên tắc kiến trúc (architecting principles) mà bạn rút ra
   được — đây chính là bài tập xuyên suốt của khóa học gốc.

## Mục tiêu học tập

Sau khi hoàn thành bộ tài liệu, người đọc có thể:

1. **Định nghĩa** hệ thống, kiến trúc, form, function, concept, và giải thích
   quan hệ giữa chúng.
2. **Phân tích** một sản phẩm thành form và function, xác định ánh xạ và
   giao diện.
3. **Nhận diện** hành vi xuất hiện (emergent behavior) và phân biệt mong
   muốn/không mong muốn.
4. **Áp dụng** các chiến lược phân rã và module hóa để quản lý độ phức tạp.
5. **Nhận diện và giảm thiểu** mơ hồ ở thượng nguồn của quá trình phát triển.
6. **Mô tả** vai trò, trách nhiệm, và sản phẩm bàn giao của kiến trúc sư.
7. **Sử dụng** các kỹ thuật sáng tạo có cấu trúc để tạo concept.
8. **Biểu diễn** kiến trúc bằng OPM và các sơ đồ liên quan.
9. **Đánh giá** một kiến trúc theo các tiêu chí nhất quán, đơn giản, mở, cân
   bằng, kiểm chứng được.
10. **Ghi lại** các quyết định kiến trúc kèm lý do và hệ quả.

## Mô tả chi tiết từng chương

### Chương 1: Tư duy hệ thống

Chương này đặt nền tảng khái niệm. Nó trả lời câu hỏi "hệ thống là gì" và
"vì sao phải nghĩ theo hệ thống". Trọng tâm là định nghĩa hệ thống (phần tử
+ tương tác + chức năng), hành vi xuất hiện, ba phẩm chất tư duy (holism,
balance, focus), và thang cấp độ ý định. Chương cũng bàn về hệ thống mở,
biên giới, bối cảnh, và các ngụy biện thường gặp.

### Chương 2: Kiến trúc và Form

Chương này định nghĩa kiến trúc bằng tam giác form–function–concept. Nó giải
thích form (elements + structure), function (process + operand), concept
(ánh xạ), và cách chúng liên hệ. Chương cũng trình bày các loại giao diện,
ánh xạ nhiều-nhiều, kiến trúc như tập hợp quyết định, các khung nhìn kiến
trúc, yêu cầu phi chức năng, và nghiên cứu tình huống op amp.

### Chương 3: Thuật ngữ chuyên môn

Chương này là từ điển giải thích chi tiết các thuật ngữ cốt lõi. Nó được tổ
chức theo nhóm: hệ thống, form, function, kiến trúc, quy trình, sáng tạo. Đặc
biệt, chương dành phần lớn cho các cặp thuật ngữ dễ nhầm (form vs function,
concept vs architecture, needs vs requirements, coupling vs cohesion, v.v.)
và bảng tra cứu nhanh.

### Chương 4: Quy trình phát triển sản phẩm

Chương này mô tả PDP và vị trí của kiến trúc trong đó. Nó trình bày mô hình
tham chiếu (concept → architecture → design → build → test → operations),
đường cong chi phí cam kết, PDP thu nhỏ, cổng quyết định, công nghệ trong
PDP, các mô hình thác nước/xoắn ốc/song song/Agile, và mối quan hệ với kiến
trúc tổ chức.

### Chương 5: Tính năng, Chức năng và Hành vi xuất hiện

Chương này đi sâu vào function: process + operand. Nó phân loại chức năng
(external/internal, primary/secondary/supporting/harmful), trình bày kỹ thuật
phản chiếu chức năng, chức năng độc lập giải pháp, thu phóng chức năng, ánh
xạ function → form, và phân tích sâu về emergence. Chương cũng bàn về
value-related operand và hiệu năng.

### Chương 6: Độ phức tạp và Phân rã

Chương này bàn về complexity và các chiến lược quản lý nó. Nó trình bày các
loại phân rã, module hóa, coupling/cohesion, giao diện, phân cấp, phân tầng,
DSM và ma trận N², trừu tượng hóa, và các chiến lược giảm độ phức tạp. Kết
thúc bằng ví dụ phân rã tủ lạnh.

### Chương 7: Giải quyết mơ hồ

Chương này bàn về ambiguity ở thượng nguồn. Nó trình bày các nguồn gốc của
mơ hồ, phân biệt upstream/downstream, chuỗi needs → goals → requirements →
functions → design, bên liên quan, biên giới và bối cảnh, các kỹ thuật giảm
mơ hồ, và ra quyết định dưới điều kiện không chắc chắn.

### Chương 8: Vai trò của Kiến trúc sư

Chương này mô tả vai trò, trách nhiệm, và sản phẩm bàn giao của kiến trúc
sư. Nó trình bày ba khía cạnh của vai trò (kỹ thuật, kinh doanh, con người),
giá trị của kiến trúc, phong cách kiến trúc, platform và dòng sản phẩm, kỹ
năng cần thiết, vị trí trong tổ chức, nguyên tắc hành nghề, và các mẫu phản
kiến trúc.

### Chương 9: Tư duy sáng tạo và Đổi mới

Chương này là chương dài nhất, dựa trên hội thảo sáng tạo của Speller. Nó
trình bày bản chất sáng tạo, tổ hợp và quy tắc thiết kế, sáu chiếc mũ của
de Bono, kỹ thuật tạm dừng/tập trung/thách thức, chuyển động, đầu vào ngẫu
nhiên và khiêu khích, TRIZ (tính lý tưởng, mâu thuẫn, 40 nguyên tắc, quy luật
tiến hóa), kịch bản, bản đồ tư duy, và cái nhìn tổng thể về đổi mới.

### Chương 10: Mô hình hóa Object-Process

Chương này trình bày OPM: object, process, trạng thái, thuộc tính, liên kết
cấu trúc và thủ tục, sơ đồ OPD, quy trình xây dựng mô hình, ưu nhược điểm,
và so sánh với UML/SysML. Kết thúc bằng ví dụ đầy đủ về còi.

## Bảng viết tắt

| Viết tắt | Tiếng Anh | Tiếng Việt |
|----------|-----------|------------|
| ADR | Architecture Decision Record | Bản ghi quyết định kiến trúc |
| CAD | Computer-Aided Design | Thiết kế hỗ trợ máy tính |
| DSM | Design Structure Matrix | Ma trận cấu trúc thiết kế |
| FMEA | Failure Mode and Effects Analysis | Phân tích kiểu hỏng và tác động |
| OPD | Object-Process Diagram | Sơ đồ object-process |
| OPL | Object-Process Language | Ngôn ngữ object-process |
| OPM | Object-Process Methodology | Phương pháp object-process |
| PDP | Product Development Process | Quy trình phát triển sản phẩm |
| SDM | System Design and Management | Thiết kế và quản lý hệ thống |
| TRIZ | Theory of Inventive Problem Solving | Lý thuyết giải bài toán sáng chế |
| UML | Unified Modeling Language | Ngôn ngữ mô hình hóa thống nhất |

## Câu hỏi thường gặp

### Kiến trúc khác thiết kế ở đâu?

Kiến trúc ở mức cao hơn: nó xác định cấu trúc, giao diện, và nguyên lý;
thiết kế đi vào chi tiết hiện thực. Kiến trúc ràng buộc thiết kế nhưng không
thay thế nó.

### Có phải mọi dự án đều cần kiến trúc sư?

Mọi dự án đều cần *hoạt động kiến trúc*, nhưng không nhất thiết cần một
người có chức danh "kiến trúc sư". Với dự án nhỏ, hoạt động này có thể do
trưởng nhóm đảm nhận.

### Làm sao biết kiến trúc là đủ tốt?

Kiến trúc đủ tốt khi nó đáp ứng các mục tiêu của bên liên quan với chi phí
hợp lý, cho phép tiến hóa, và có thể kiểm chứng. Không có kiến trúc hoàn hảo.

### Sáng tạo có thể học được không?

Có. Sáng tạo là một quá trình có thể rèn luyện bằng kỹ thuật, môi trường, và
thực hành. Chương 9 trình bày nhiều kỹ thuật cụ thể.

### OPM có thay thế UML không?

Không. OPM và UML có ưu nhược điểm khác nhau. OPM có ngữ nghĩa chặt chẽ hơn
và thống nhất cấu trúc/hành vi; UML phổ biến hơn và có nhiều công cụ hơn.

### Làm sao áp dụng vào công việc hằng ngày?

Bắt đầu bằng việc vẽ form và function cho sản phẩm bạn đang làm, xác định
giao diện, ghi lại các quyết định kiến trúc, và kiểm tra hành vi xuất hiện.
Sau đó áp dụng dần các kỹ thuật khác.

## Hướng dẫn tự học

### Tuần 1: Nền tảng

- Đọc chương 1 và 2.
- Làm bài tập chương 1 và 2.
- Chọn một sản phẩm và phân tích form/function.

### Tuần 2: Thuật ngữ và quy trình

- Đọc chương 3 và 4.
- Lập bảng thuật ngữ cá nhân.
- Vẽ PDP cho một sản phẩm.

### Tuần 3: Chức năng và độ phức tạp

- Đọc chương 5 và 6.
- Thực hiện phân rã chức năng và vật lý.
- Lập DSM cho một hệ thống nhỏ.

### Tuần 4: Mơ hồ và vai trò

- Đọc chương 7 và 8.
- Viết ADR cho 5 quyết định.
- Phân tích bên liên quan.

### Tuần 5: Sáng tạo và mô hình hóa

- Đọc chương 9 và 10.
- Áp dụng một kỹ thuật sáng tạo.
- Vẽ mô hình OPM cho một sản phẩm.

## Các nguyên tắc cốt lõi cần ghi nhớ

1. **Form hút chi phí, function tạo lợi ích.**
2. **Kiến trúc là ánh xạ có chủ đích từ function sang form.**
3. **Hành vi xuất hiện không thể suy ra từ từng phần tử.**
4. **Phân rã tốt cần coupling thấp, cohesion cao.**
5. **Mơ hồ tập trung ở thượng nguồn, nơi đòn bẩy cao nhất.**
6. **Giao diện là nơi tập trung rủi ro và chi phí tích hợp.**
7. **Kiến trúc tốt phải hỗ trợ thay đổi.**
8. **Sáng tạo là quá trình có thể học và rèn luyện.**
9. **Mọi mô hình đều sai, nhưng một số hữu ích.**
10. **Ghi lại lý do quyết định, không chỉ quyết định.**

## Ghi chú về tính trung thực với nguồn

Bộ tài liệu này diễn giải và mở rộng nội dung từ slide gốc. Một số phần được
mở rộng bằng kiến thức nền của lĩnh vực để giải thích rõ hơn, nhưng không
thay đổi các khái niệm cốt lõi của khóa học. Các ví dụ như còi, tủ lạnh, op
amp, TCP, ServeCo, và xe đạp đều xuất phát từ tài liệu gốc. Các ví dụ bổ
sung được ghi rõ là minh họa.

## Sơ đồ thư mục

```
01-kien-truc-va-tu-duy-he-thong/
├── README.md
├── 01-tu-duy-he-thong.md
├── 02-kien-truc-va-form.md
├── 03-thuat-ngu-glossary.md
├── 04-quy-trinh-phat-trien-san-pham-PDP.md
├── 05-tinh-nang-function-va-emergence.md
├── 06-do-phuc-tap-va-phan-ra.md
├── 07-giai-quyet-mo-ho-ambiguity.md
├── 08-vai-tro-cua-kien-truc-su.md
├── 09-tu-duy-sang-tao-va-doi-moi.md
└── 10-mo-hinh-object-process-OPM.md
```

## Cách đọc hiệu quả

### Đọc chủ động

- Trước mỗi chương, đọc tiêu đề và tóm tắt để tạo khung.
- Trong khi đọc, ghi lại câu hỏi và liên hệ với kinh nghiệm.
- Sau mỗi chương, tự tóm tắt bằng lời của mình.
- Làm bài tập trước khi đọc chương tiếp theo.

### Ghi chú theo cấu trúc

- **Khái niệm:** định nghĩa và ví dụ.
- **Quan hệ:** khái niệm này liên hệ gì với khái niệm khác.
- **Ứng dụng:** áp dụng vào sản phẩm nào.
- **Câu hỏi:** điều gì chưa rõ.

### Học theo nhóm

- Mỗi người đọc một chương và trình bày lại.
- Thảo luận các ví dụ khác nhau.
- Phản biện các quyết định kiến trúc.

## Kiểm tra kiến thức

### Câu hỏi tự đánh giá

1. Bạn có thể giải thích sự khác biệt giữa form và function trong 1 phút?
2. Bạn có thể vẽ tam giác kiến trúc và giải thích từng cạnh?
3. Bạn có thể kể 3 ví dụ về hành vi xuất hiện mong muốn và 3 ví dụ không
   mong muốn?
4. Bạn có thể phân biệt needs, goals, requirements, functions?
5. Bạn có thể giải thích vì sao kiến trúc nằm ở thượng nguồn?
6. Bạn có thể áp dụng một kỹ thuật sáng tạo để tạo 10 ý tưởng?
7. Bạn có thể vẽ một mô hình OPM đơn giản?
8. Bạn có thể ghi lại một quyết định kiến trúc dưới dạng ADR?

### Bài kiểm tra tổng hợp

Chọn một sản phẩm bất kỳ và thực hiện:

1. Mô tả hệ thống, biên giới, bối cảnh.
2. Vẽ tam giác kiến trúc.
3. Liệt kê chức năng và phân loại.
4. Phân rã form và function.
5. Xác định giao diện.
6. Phân tích hành vi xuất hiện.
7. Xác định bên liên quan và nhu cầu.
8. Ghi lại 5 quyết định kiến trúc.
9. Đề xuất một cải tiến sáng tạo.
10. Vẽ mô hình OPM.

Nếu bạn làm được tất cả, bạn đã nắm được tinh thần của khóa học.

## Kết luận của phần giới thiệu

Kiến trúc hệ thống là nơi hội tụ của kỹ thuật, kinh doanh và tư duy thiết kế.
Nó không phải là một bước "vẽ sơ đồ" ở đầu dự án, mà là tập hợp các quyết định
có tính hệ quả lâu dài, được đưa ra dưới điều kiện mơ hồ, với mục tiêu tạo ra
giá trị bền vững. Bộ tài liệu này là một nỗ lực hệ thống hóa cách tư duy đó.
