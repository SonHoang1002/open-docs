# Chương 3: Thuật ngữ chuyên môn (Glossary)

## 3.1. Giới thiệu

Chương này giải thích chi tiết các thuật ngữ cốt lõi của khóa học System
Architecture. Bảng thuật ngữ gốc của khóa học có khoảng 66 mục, mỗi mục ghi
từ (word), bài giảng giới thiệu (introduced), và bài giảng định nghĩa
(defined). Dưới đây là phần diễn giải đầy đủ, sắp xếp theo nhóm chủ đề để
dễ tra cứu, kèm ví dụ và ghi chú phân biệt.

Cách dùng chương này:

- Tra cứu nhanh một thuật ngữ khi đọc các chương khác.
- Hiểu sự khác biệt giữa các thuật ngữ dễ nhầm.
- Nắm được thuật ngữ nào thuộc miền nào (form, function, quy trình, tổ chức).

## 3.2. Nhóm thuật ngữ về hệ thống

### 3.2.1. System (hệ thống)

**Định nghĩa:** Một tập hợp các phần tử có quan hệ tương tác lẫn nhau, thực
hiện một chức năng, mà chức năng đó lớn hơn tổng các phần.

**Ghi chú:** Ba yếu tố bắt buộc: phần tử, tương tác, chức năng. Thiếu tương
tác thì chỉ là tập hợp; thiếu chức năng thì chỉ là cấu trúc.

**Ví dụ:** Còi, tủ lạnh, ô tô, Internet, doanh nghiệp.

### 3.2.2. Subsystem (hệ thống con)

**Định nghĩa:** Một hệ thống nằm trong hệ thống lớn hơn, có chức năng riêng
và giao diện với phần còn lại.

**Ghi chú:** Hệ thống con có thể được phân rã tiếp thành các hệ thống con
nhỏ hơn. Ranh giới giữa hệ thống con và linh kiện là tương đối, phụ thuộc
mục đích phân tích.

**Ví dụ:** Máy nén là hệ thống con của tủ lạnh; piston là hệ thống con của
máy nén.

### 3.2.3. System boundary (biên giới hệ thống)

**Định nghĩa:** Ranh giới khái niệm phân biệt bên trong và bên ngoài hệ thống.

**Ghi chú:** Biên giới không nhất thiết trùng với biên giới vật lý. Với phần
mềm, biên giới là giao diện lập trình, không phải file thực thi.

**Ví dụ:** Với tủ lạnh, biên giới chức năng bao gồm cả không khí trong tủ và
môi trường tản nhiệt, không chỉ vỏ tủ.

### 3.2.4. Context (bối cảnh)

**Định nghĩa:** Phần của thế giới bên ngoài có tương tác với hệ thống.

**Ghi chú:** Bối cảnh được mô tả bằng sơ đồ bối cảnh: tác nhân bên ngoài,
dòng vào/ra, ràng buộc.

**Ví dụ:** Với tủ lạnh: nguồn điện, người dùng, thực phẩm, không khí phòng,
tiêu chuẩn an toàn.

### 3.2.5. Whole product system (toàn bộ hệ thống sản phẩm)

**Định nghĩa:** Toàn bộ hệ thống bao quanh sản phẩm chính, bao gồm phụ trợ,
hạ tầng, dịch vụ, tài liệu, đào tạo.

**Ghi chú:** Khách hàng mua cả whole product system, không chỉ sản phẩm chính.
Kiến trúc sư phải tính đến toàn bộ hệ thống này.

**Ví dụ:** Tủ lạnh + nguồn điện + không gian + bảo trì + hướng dẫn + tái chế.

### 3.2.6. System of systems (hệ thống của các hệ thống)

**Định nghĩa:** Một tập hợp các hệ thống độc lập về vận hành nhưng phối hợp
để tạo ra hành vi toàn cục.

**Ghi chú:** Hệ thống của các hệ thống có các đặc điểm: các hệ thống con hoạt
động độc lập, tiến hóa riêng, nhưng vẫn phải tương tác.

**Ví dụ:** Hệ thống giao thông (xe, đường, tín hiệu, người lái); Internet.

### 3.2.7. Emergence (tính xuất hiện)

**Định nghĩa:** Hành vi của hệ thống không thể quy trực tiếp về hành vi của
bất kỳ phần tử riêng lẻ nào, mà nảy sinh từ tương tác giữa các phần tử.

**Ghi chú:** Có xuất hiện mong muốn và không mong muốn. Là dấu hiệu của hệ
thống thực sự.

**Ví dụ:** Âm thanh của còi; tắc nghẽn giao thông; deadlock phần mềm.

### 3.2.8. Holism (tính toàn thể)

**Định nghĩa:** Cách nhìn hệ thống như một chỉnh thể, không bị cuốn vào chi
tiết cục bộ.

**Ghi chú:** Là một trong ba phẩm chất tư duy của kiến trúc sư (cùng với
balance và focus).

**Ví dụ:** Đánh giá tủ lạnh theo trải nghiệm tổng thể (làm lạnh, tiếng ồn,
tiêu thụ điện, độ bền) chứ không chỉ theo công suất máy nén.

## 3.3. Nhóm thuật ngữ về form

### 3.3.1. Form (hình thái)

**Định nghĩa:** Hiện thân vật lý/thông tin có thể tồn tại hoặc có tiềm năng
tồn tại; là cái hệ thống "là".

**Ghi chú:** Form = Elements + Structure. Là nguồn của chi phí.

**Ví dụ:** Vỏ, lõi, cánh quạt, mạch điện, mã nguồn.

### 3.3.2. Element (phần tử)

**Định nghĩa:** Đơn vị cấu thành form.

**Ghi chú:** Mức của phần tử phụ thuộc mục đích phân tích.

**Ví dụ:** Với tủ lạnh: máy nén, dàn ngưng, thermostat.

### 3.3.3. Structure (cấu trúc)

**Định nghĩa:** Cách các phần tử được tổ chức và liên kết.

**Ghi chú:** Có thể phân cấp, mạng, phân tầng, hoặc module.

**Ví dụ:** Cấu trúc phân cấp của tủ lạnh: tủ → hệ thống lạnh → máy nén →
piston.

### 3.3.4. Attribute (thuộc tính)

**Định nghĩa:** Đặc tính có thể đo hoặc mô tả của phần tử.

**Ghi chú:** Thuộc tính có thể là vật lý (khối lượng), chức năng (công suất),
hoặc kinh tế (giá).

**Ví dụ:** Khối lượng máy nén, công suất làm lạnh, điện áp danh định.

### 3.3.5. State (trạng thái)

**Định nghĩa:** Chế độ mà phần tử có thể ở.

**Ghi chú:** Trạng thái thay đổi bởi process. OPM mô tả rõ object, state, và
process.

**Ví dụ:** Bật/tắt, mở/đóng, nóng/lạnh.

### 3.3.6. Behavior (hành vi)

**Định nghĩa:** Cách trạng thái thay đổi theo thời gian hoặc theo sự kiện.

**Ghi chú:** Hành vi là cầu nối giữa form và function.

**Ví dụ:** Máy nén bật khi nhiệt độ vượt ngưỡng, tắt khi đạt ngưỡng.

### 3.3.7. Interface (giao diện)

**Định nghĩa:** Nơi hai phần tử gặp nhau và trao đổi vật chất, năng lượng,
hoặc thông tin.

**Ghi chú:** Giao diện là nơi tập trung rủi ro và chi phí tích hợp.

**Ví dụ:** Khớp nối ống, đầu nối điện, API phần mềm.

### 3.3.8. Modularity (tính module)

**Định nghĩa:** Mức độ mà hệ thống được chia thành các module tương đối độc
lập, với giao diện rõ ràng.

**Ghi chú:** Module hóa giúp dễ thay thế, dễ kiểm thử, dễ tiến hóa, nhưng có
thể tăng chi phí giao diện.

**Ví dụ:** Máy tính cá nhân với các module RAM, ổ cứng, card đồ họa.

### 3.3.9. Decomposition (phân rã)

**Định nghĩa:** Quá trình chia hệ thống thành các phần nhỏ hơn.

**Ghi chú:** Có phân rã vật lý, phân rã chức năng, phân rã tổ chức.

**Ví dụ:** Chia tủ lạnh thành hệ thống lạnh, hệ thống điện, hệ thống vỏ.

### 3.3.10. Integration (tích hợp)

**Định nghĩa:** Quá trình kết hợp các phần tử để tạo thành hệ thống hoàn chỉnh.

**Ghi chú:** Tích hợp là nơi kiểm chứng kiến trúc; lỗi tích hợp thường do
giao diện không được định nghĩa đủ rõ.

**Ví dụ:** Lắp máy nén vào tủ, kết nối ống, nạp môi chất, chạy thử.

## 3.4. Nhóm thuật ngữ về function

### 3.4.1. Function (chức năng)

**Định nghĩa:** Các hoạt động, thao tác, biến đổi tạo ra hoặc đóng góp vào
hiệu năng; là cái hệ thống "làm".

**Ghi chú:** Function = Process + Operand. Là nguồn của lợi ích.

**Ví dụ:** Tạo âm thanh, làm lạnh, di chuyển, lưu trữ dữ liệu.

### 3.4.2. Process (quá trình)

**Định nghĩa:** Hoạt động biến đổi operand.

**Ghi chú:** Process có thể là vật lý, hóa học, thông tin, hoặc tổ chức.

**Ví dụ:** Nén, bay hơi, tính toán, phê duyệt.

### 3.4.3. Operand (đối tượng tác động)

**Định nghĩa:** Cái bị biến đổi bởi process.

**Ghi chú:** Operand có thể là vật chất, năng lượng, thông tin, hoặc con người.

**Ví dụ:** Môi chất lạnh, luồng khí, dữ liệu, đơn hàng.

### 3.4.4. External function (chức năng bên ngoài)

**Định nghĩa:** Chức năng nhìn thấy từ bên ngoài, qua giao diện với bối cảnh.

**Ghi chú:** Đây là chức năng tạo ra giá trị cho khách hàng.

**Ví dụ:** Giữ thực phẩm lạnh; phát âm thanh cảnh báo.

### 3.4.5. Internal function (chức năng bên trong)

**Định nghĩa:** Chức năng của các phần tử bên trong, phục vụ chức năng bên
ngoài.

**Ghi chú:** Khách hàng không quan tâm trực tiếp, nhưng kỹ sư phải thiết kế.

**Ví dụ:** Nén môi chất, trao đổi nhiệt, điều khiển nhiệt độ.

### 3.4.6. Functional decomposition (phân rã chức năng)

**Định nghĩa:** Chia một chức năng thành các chức năng con.

**Ghi chú:** Khác với phân rã vật lý; hai loại phân rã không nhất thiết trùng
nhau.

**Ví dụ:** "Làm lạnh" → "nén" + "bay hơi" + "ngưng tụ" + "tiết lưu".

### 3.4.7. Function-to-form mapping (ánh xạ chức năng sang hình thái)

**Định nghĩa:** Việc gán mỗi chức năng cho một hoặc nhiều phần tử form.

**Ghi chú:** Ánh xạ có thể một-một, một-nhiều, hoặc nhiều-một.

**Ví dụ:** "Tạo âm thanh" → "khoang + mép cắt"; "giữ nhiệt" → "vỏ + gioăng".

### 3.4.8. Solution-neutral function (chức năng độc lập giải pháp)

**Định nghĩa:** Mô tả chức năng mà không gắn với một giải pháp cụ thể.

**Ghi chú:** Giúp mở rộng không gian giải pháp và tránh thiên kiến thiết kế.

**Ví dụ:** "Làm mát thực phẩm" thay vì "dùng máy nén khí".

### 3.4.9. Function reflection (phản chiếu chức năng)

**Định nghĩa:** Kỹ thuật nhìn một chức năng từ góc độ của các bên liên quan
khác nhau để phát hiện chức năng ẩn.

**Ghi chú:** Giúp tránh bỏ sót chức năng quan trọng.

**Ví dụ:** Tủ lạnh nhìn từ góc người dùng (lạnh), kỹ thuật viên (dễ sửa),
nhà sản xuất (dễ lắp), môi trường (tái chế).

## 3.5. Nhóm thuật ngữ về kiến trúc và concept

### 3.5.1. Architecture (kiến trúc)

**Định nghĩa:** Hiện thân của concept, phân bổ chức năng cho các phần tử của
form, và định nghĩa các giao diện giữa các phần tử và với bối cảnh.

**Ghi chú:** Kiến trúc không chỉ là form, không chỉ là function, mà là ánh
xạ được hướng dẫn bởi concept.

**Ví dụ:** Kiến trúc của còi: concept cộng hưởng khoang + phân bổ chức năng
cho các phần tử + giao diện khí.

### 3.5.2. Concept (khái niệm)

**Định nghĩa:** Tầm nhìn, ý tưởng, hình ảnh tinh thần về sản phẩm/hệ thống;
ánh xạ function sang form; bao gồm nguyên lý hoạt động và một mức trừu tượng
của form.

**Ghi chú:** Concept không phải thuộc tính của hệ thống; nó là một ánh xạ.

**Ví dụ:** Nguyên lý cộng hưởng khoang của còi; nguyên lý chu trình lạnh của
tủ lạnh.

### 3.5.3. Principle of operation (nguyên lý hoạt động)

**Định nghĩa:** Cơ chế vật lý/hóa học/thông tin mà qua đó chức năng được
hiện thực.

**Ghi chú:** Là thành phần cốt lõi của concept.

**Ví dụ:** Vortex shedding trong còi; chu trình Rankine trong tủ lạnh.

### 3.5.4. Architecture description (mô tả kiến trúc)

**Định nghĩa:** Tập hợp các tài liệu, sơ đồ, mô hình mô tả kiến trúc.

**Ghi chú:** Có nhiều khung mô tả: OPM, SysML, UML, sơ đồ khối.

**Ví dụ:** Sơ đồ khối chức năng, sơ đồ giao diện, ma trận DSM.

### 3.5.5. Architect (kiến trúc sư)

**Định nghĩa:** Người chịu trách nhiệm định nghĩa kiến trúc hệ thống.

**Ghi chú:** Vai trò bao gồm: hiểu nhu cầu, tạo concept, phân rã, định nghĩa
giao diện, cân bằng thuộc tính, dẫn dắt đội ngũ.

**Ví dụ:** Kiến trúc sư trưởng của một dòng sản phẩm.

### 3.5.6. Architecting (hành nghề kiến trúc)

**Định nghĩa:** Quá trình tạo ra kiến trúc.

**Ghi chú:** Là hoạt động sáng tạo có kỷ luật, không phải quy trình hành chính.

**Ví dụ:** Từ nhu cầu → concept → phân rã → giao diện → đánh giá.

### 3.5.7. Architecture style (phong cách kiến trúc)

**Định nghĩa:** Mẫu tổ chức lặp lại của các phần tử và giao diện.

**Ghi chú:** Phong cách giúp tái sử dụng kinh nghiệm và giao tiếp.

**Ví dụ:** Kiến trúc phân tầng, kiến trúc module, kiến trúc hướng dịch vụ,
kiến trúc pipeline.

### 3.5.8. Platform (nền tảng)

**Định nghĩa:** Tập hợp các phần tử và giao diện chung được chia sẻ bởi nhiều
sản phẩm trong một dòng sản phẩm.

**Ghi chú:** Platform hóa giúp giảm chi phí và tăng tốc phát triển biến thể.

**Ví dụ:** Khung gầm chung cho nhiều mẫu xe; nhân hệ điều hành chung cho nhiều
thiết bị.

### 3.5.9. Product family (dòng sản phẩm)

**Định nghĩa:** Tập hợp các sản phẩm chia sẻ platform và kiến trúc chung,
khác nhau ở một số tính năng.

**Ghi chú:** Là chiến lược để đạt khả năng tiến hóa và giảm rủi ro.

**Ví dụ:** Dòng điện thoại với nhiều cấu hình; dòng máy bay với nhiều phiên
bản.

### 3.5.10. Evolvability (khả năng tiến hóa)

**Định nghĩa:** Khả năng của kiến trúc để thay đổi và mở rộng theo thời gian
với chi phí hợp lý.

**Ghi chú:** Đạt được qua module hóa, giao diện ổn định, platform hóa.

**Ví dụ:** Hệ điều hành cho phép cài thêm ứng dụng mà không sửa lõi.

## 3.6. Nhóm thuật ngữ về quy trình và tổ chức

### 3.6.1. Product Development Process (PDP)

**Định nghĩa:** Quy trình phát triển sản phẩm từ ý tưởng đến triển khai.

**Ghi chú:** Kiến trúc nằm ở giai đoạn đầu (upstream) của PDP. Sẽ bàn kỹ ở
chương 4.

**Ví dụ:** Mô hình tham chiếu gồm các giai đoạn: concept, architecture,
design, implementation, test, operations.

### 3.6.2. Upstream (thượng nguồn)

**Định nghĩa:** Phần đầu của PDP, nơi nhu cầu, mục tiêu, concept và kiến trúc
được xác định.

**Ghi chú:** Đặc trưng bởi độ mơ hồ cao và chi phí cam kết lớn.

**Ví dụ:** Khảo sát nhu cầu, phân tích bên liên quan, tạo concept.

### 3.6.3. Downstream (hạ nguồn)

**Định nghĩa:** Phần sau của PDP, nơi thiết kế chi tiết, hiện thực, kiểm thử,
và vận hành diễn ra.

**Ghi chú:** Đặc trưng bởi độ mơ hồ thấp và chi phí thực chi lớn.

**Ví dụ:** Thiết kế chi tiết, chế tạo, lắp ráp, kiểm thử.

### 3.6.4. Requirements (yêu cầu)

**Định nghĩa:** Các điều kiện, khả năng, hoặc đặc tính mà hệ thống phải có.

**Ghi chú:** Yêu cầu là cầu nối giữa nhu cầu (needs) và chức năng (function).

**Ví dụ:** Nhiệt độ tủ lạnh dưới 4°C; thời gian khởi động dưới 2 giây.

### 3.6.5. Needs (nhu cầu)

**Định nghĩa:** Các mong muốn, kỳ vọng của bên liên quan mà hệ thống phải
đáp ứng.

**Ghi chú:** Nhu cầu thường mơ hồ và cần được chuyển hóa thành yêu cầu.

**Ví dụ:** "Thực phẩm tươi lâu"; "không ồn khi ngủ".

### 3.6.6. Goals (mục tiêu)

**Định nghĩa:** Các kết quả mà hệ thống hoặc tổ chức muốn đạt được.

**Ghi chú:** Mục tiêu có thể ở cấp xã hội, kinh doanh, hoặc người dùng.

**Ví dụ:** Giảm 30% tiêu thụ điện; tăng thị phần lên 20%.

### 3.6.7. Stakeholder (bên liên quan)

**Định nghĩa:** Cá nhân hoặc tổ chức có lợi ích hoặc ảnh hưởng đến hệ thống.

**Ghi chú:** Cần xác định đầy đủ để tránh bỏ sót nhu cầu.

**Ví dụ:** Người dùng, nhà sản xuất, nhà cung cấp, cơ quan quản lý, cộng đồng.

### 3.6.8. Value (giá trị)

**Định nghĩa:** Lợi ích trên chi phí (benefit at cost).

**Ghi chú:** Lợi ích đến từ chức năng; chi phí đến từ form.

**Ví dụ:** Một tủ lạnh tiết kiệm điện có giá trị cao hơn nếu lợi ích tiết
kiệm vượt chi phí tăng thêm.

### 3.6.9. Benefit (lợi ích)

**Định nghĩa:** Những gì hệ thống mang lại cho bên liên quan.

**Ghi chú:** Lợi ích có thể hữu hình (tiền, thời gian) hoặc vô hình (an tâm,
thẩm mỹ).

**Ví dụ:** Thực phẩm tươi lâu hơn; ít tiếng ồn hơn.

### 3.6.10. Cost (chi phí)

**Định nghĩa:** Các nguồn lực tiêu hao để tạo ra và vận hành hệ thống.

**Ghi chú:** Chi phí có thể là phát triển, sản xuất, vận hành, bảo trì, thải
hồi.

**Ví dụ:** Chi phí vật liệu, nhân công, điện năng, bảo hành.

### 3.6.11. Lifecycle (vòng đời)

**Định nghĩa:** Toàn bộ các giai đoạn của hệ thống từ ý tưởng đến thải hồi.

**Ghi chú:** Kiến trúc chịu ảnh hưởng của toàn bộ vòng đời, không chỉ giai
đoạn phát triển.

**Ví dụ:** Concept → phát triển → sản xuất → vận hành → bảo trì → thải hồi.

### 3.6.12. Ambiguity (mơ hồ)

**Định nghĩa:** Sự mơ hồ đến từ nhiều cách diễn giải và sự không chắc chắn,
bị khuếch đại bởi thông tin thiếu, mâu thuẫn hoặc sai.

**Ghi chú:** Là đặc trưng của thượng nguồn; cần được quản lý chứ không thể
loại bỏ hoàn toàn.

**Ví dụ:** "Sản phẩm phải thân thiện với người dùng" — thân thiện nghĩa là gì?

### 3.6.13. Complexity (độ phức tạp)

**Định nghĩa:** Có nhiều phần tử và giao diện liên kết, đan xen; hệ quả là
cần lượng lớn thông tin để mô tả đầy đủ hệ thống.

**Ghi chú:** Không đồng nhất với "khó". Độ phức tạp là thuộc tính cấu trúc.

**Ví dụ:** Hệ thống có hàng nghìn giao diện chéo là phức tạp.

### 3.6.14. Coupling (ghép nối)

**Định nghĩa:** Mức độ phụ thuộc giữa các phần tử.

**Ghi chú:** Ghép nối lỏng (loose coupling) giúp dễ thay thế; ghép nối chặt
(tight coupling) giúp hiệu năng nhưng khó tiến hóa.

**Ví dụ:** Hai module phần mềm chỉ trao đổi qua API là ghép nối lỏng.

### 3.6.15. Cohesion (gắn kết)

**Định nghĩa:** Mức độ các chức năng bên trong một module liên quan đến nhau.

**Ghi chú:** Gắn kết cao (high cohesion) là tốt; gắn kết thấp là dấu hiệu
module bị chia sai.

**Ví dụ:** Module "xử lý thanh toán" chỉ chứa các chức năng thanh toán.

### 3.6.16. Trade-off (đánh đổi)

**Định nghĩa:** Sự hy sinh một thuộc tính để đạt được thuộc tính khác.

**Ghi chú:** Kiến trúc là chuỗi đánh đổi có ý thức.

**Ví dụ:** Tăng độ dày cách nhiệt (giảm điện năng) nhưng tăng chi phí và
kích thước.

### 3.6.17. Constraint (ràng buộc)

**Định nghĩa:** Giới hạn không thể vi phạm mà hệ thống phải tuân theo.

**Ghi chú:** Ràng buộc có thể là kỹ thuật, pháp lý, kinh tế, hoặc tổ chức.

**Ví dụ:** Điện áp nguồn 220V; tiêu chuẩn an toàn; ngân sách tối đa.

### 3.6.18. Requirement vs. constraint

**Ghi chú:** Yêu cầu là cái hệ thống phải *làm*; ràng buộc là cái hệ thống
phải *tuân theo*. Cả hai đều giới hạn không gian giải pháp nhưng khác bản
chất.

## 3.7. Nhóm thuật ngữ về sáng tạo và mô hình hóa

### 3.7.1. Creativity (sáng tạo)

**Định nghĩa:** Năng lực tạo ra cái mới có giá trị.

**Ghi chú:** Trong kiến trúc, sáng tạo là tạo concept, không phải tạo form
chi tiết.

**Ví dụ:** Nghĩ ra nguyên lý cộng hưởng mới cho còi.

### 3.7.2. Innovation (đổi mới)

**Định nghĩa:** Việc đưa sáng tạo vào thực tế và tạo ra giá trị.

**Ghi chú:** Sáng tạo là ý tưởng; đổi mới là ý tưởng được hiện thực hóa và
chấp nhận.

**Ví dụ:** Từ ý tưởng tủ lạnh inverter đến sản phẩm thương mại.

### 3.7.3. Scenario (kịch bản)

**Định nghĩa:** Một câu chuyện có cấu trúc về tương lai có thể xảy ra, dùng
để kiểm tra tính bền vững của kiến trúc.

**Ghi chú:** Kịch bản giúp thiết kế cho khả năng tiến hóa và phân tích
"what if".

**Ví dụ:** Kịch bản giá điện tăng gấp đôi; kịch bản người dùng tăng 10 lần.

### 3.7.4. Mind mapping (bản đồ tư duy)

**Định nghĩa:** Kỹ thuật ghi chú và tổ chức ý tưởng theo cấu trúc tỏa tròn
từ một chủ đề trung tâm.

**Ghi chú:** Giúp phát hiện liên kết và mở rộng không gian ý tưởng.

**Ví dụ:** Bản đồ tư duy cho "tủ lạnh tương lai" với các nhánh công nghệ,
người dùng, môi trường.

### 3.7.5. TRIZ

**Định nghĩa:** Lý thuyết giải bài toán sáng chế, dựa trên phân tích hàng
trăm nghìn bằng sáng chế để tìm quy luật tiến hóa của hệ thống kỹ thuật.

**Ghi chú:** Cung cấp 40 nguyên tắc sáng tạo và bảng mâu thuẫn.

**Ví dụ:** Nguyên tắc "phân đoạn" dùng để tách chức năng.

### 3.7.6. Ideality (tính lý tưởng)

**Định nghĩa:** Tỷ lệ giữa chức năng và chi phí/tác dụng phụ.

**Ghi chú:** Hệ thống tiến hóa về phía lý tưởng: chức năng tăng, chi phí giảm.

**Ví dụ:** Tủ lạnh ngày càng làm lạnh tốt hơn với ít điện hơn.

### 3.7.7. System conflict (mâu thuẫn hệ thống)

**Định nghĩa:** Tình huống cải thiện một phần của hệ thống lại làm xấu đi
một phần khác.

**Ghi chú:** Giải quyết mâu thuẫn là động lực của sáng tạo.

**Ví dụ:** Tăng độ cứng vỏ để bảo vệ nhưng làm tăng khối lượng.

### 3.7.8. Object-Process Methodology (OPM)

**Định nghĩa:** Phương pháp mô hình hóa hệ thống bằng object (có thuộc tính,
trạng thái) và process (biến đổi object), với các liên kết có ngữ nghĩa.

**Ghi chú:** OPM dùng một mô hình duy nhất cho cả cấu trúc và hành vi.

**Ví dụ:** Mô hình còi với object "không khí" và process "tạo xoáy".

### 3.7.9. Model (mô hình)

**Định nghĩa:** Biểu diễn đơn giản hóa của hệ thống, phục vụ mục đích cụ thể.

**Ghi chú:** Mọi mô hình đều sai, nhưng một số hữu ích. Mô hình phải phù hợp
mục đích.

**Ví dụ:** Sơ đồ khối, mô hình toán, mô hình OPM.

### 3.7.10. Abstraction (trừu tượng hóa)

**Định nghĩa:** Quá trình bỏ qua chi tiết không cần thiết để tập trung vào
khía cạnh quan trọng.

**Ghi chú:** Trừu tượng hóa là công cụ chính để quản lý độ phức tạp.

**Ví dụ:** Mô tả tủ lạnh như "hệ thống làm lạnh" mà không nêu từng linh kiện.

## 3.8. Các cặp thuật ngữ dễ nhầm

### 3.8.1. Form vs. Function

| Tiêu chí | Form | Function |
|----------|------|----------|
| Câu hỏi | Hệ thống là gì? | Hệ thống làm gì? |
| Thành phần | Elements + Structure | Process + Operand |
| Thao tác | Phân rã (decompose) | Thu phóng (zoom) |
| Nguồn | Chi phí | Lợi ích |
| Ví dụ | Vỏ, máy nén | Làm lạnh, bảo quản |

### 3.8.2. Concept vs. Architecture

- Concept là *ánh xạ* trừu tượng từ function sang form.
- Architecture là *hiện thân* của concept, kèm phân bổ chức năng và giao diện.

### 3.8.3. Architecture vs. Design

- Architecture: cấu trúc và giao diện ở mức cao, ràng buộc design.
- Design: chi tiết hiện thực ở mức thấp, tuân theo architecture.

### 3.8.4. Needs vs. Requirements

- Needs: mong muốn của bên liên quan, thường mơ hồ.
- Requirements: phát biểu cụ thể, kiểm chứng được, dẫn xuất từ needs.

### 3.8.5. Complexity vs. Complicated

- Complexity: nhiều phần tử và giao diện, cần nhiều thông tin để mô tả.
- Complicated: khó hiểu, có thể do thiết kế kém chứ không do bản chất hệ thống.

### 3.8.6. Modularity vs. Decomposition

- Decomposition: hành động chia tách.
- Modularity: thuộc tính của hệ thống đã được chia thành các module độc lập.

### 3.8.7. Coupling vs. Cohesion

- Coupling: phụ thuộc *giữa* các module (mong muốn thấp).
- Cohesion: liên quan *trong* một module (mong muốn cao).

### 3.8.8. Verification vs. Validation

- Verification: "đã xây đúng chưa?" (tuân theo đặc tả).
- Validation: "đã xây đúng thứ cần chưa?" (đáp ứng nhu cầu).

## 3.9. Bảng tra cứu nhanh

| Thuật ngữ | Định nghĩa ngắn | Chương |
|-----------|-----------------|--------|
| System | Phần tử + tương tác + chức năng | 1 |
| Form | Elements + Structure | 2 |
| Function | Process + Operand | 2 |
| Concept | Ánh xạ function → form | 2 |
| Architecture | Concept hiện thân + phân bổ + giao diện | 2 |
| Emergence | Hành vi toàn thể từ tương tác | 1 |
| Ambiguity | Mơ hồ do nhiều cách hiểu | 7 |
| Complexity | Nhiều phần tử/giao diện | 6 |
| Decomposition | Chia nhỏ hệ thống | 6 |
| Modularity | Độ độc lập của module | 6 |
| Interface | Nơi trao đổi giữa phần tử | 2 |
| Platform | Phần tử chung cho dòng sản phẩm | 8 |
| PDP | Quy trình phát triển sản phẩm | 4 |
| Upstream | Giai đoạn đầu, mơ hồ cao | 7 |
| Value | Benefit at cost | 8 |
| Stakeholder | Bên có lợi ích/ảnh hưởng | 7 |
| Scenario | Câu chuyện tương lai | 9 |
| TRIZ | Lý thuyết giải bài toán sáng chế | 9 |
| OPM | Mô hình object-process | 10 |

## 3.10. Ghi chú về cách dùng thuật ngữ

1. **Nhất quán:** Trong một dự án, mỗi thuật ngữ chỉ nên có một nghĩa. Nếu
   cần nghĩa khác, hãy định nghĩa lại rõ ràng.
2. **Phân biệt form và function:** Nhiều tranh chấp kỹ thuật thực chất là do
   trộn lẫn hai khái niệm này.
3. **Không lạm dụng "architecture":** Không phải mọi sơ đồ đều là kiến trúc.
4. **Phân biệt needs và requirements:** Đừng biến mong muốn mơ hồ thành yêu
   cầu cứng nhắc quá sớm.
5. **Dùng thuật ngữ để giao tiếp:** Thuật ngữ chung giúp đội ngũ giảm mơ hồ
   và tránh hiểu nhầm.

## 3.11. Bài tập

1. Chọn 10 thuật ngữ trong chương này và viết định nghĩa của bạn bằng ngôn
   ngữ riêng, kèm một ví dụ từ sản phẩm bạn biết.
2. Tìm một tài liệu kỹ thuật thực tế và đánh dấu các thuật ngữ xuất hiện.
   Kiểm tra xem chúng có được dùng nhất quán không.
3. Phân biệt form và function cho một sản phẩm phần mềm. Ghi rõ phần tử,
   cấu trúc, process, operand.
4. Viết một cặp needs/requirements cho một tính năng mới.

## 3.12. Tóm tắt chương

- Thuật ngữ là công cụ tư duy, không chỉ là nhãn.
- Các nhóm chính: hệ thống, form, function, kiến trúc, quy trình, sáng tạo.
- Nắm vững các cặp dễ nhầm giúp tránh sai lầm khái niệm.
- Dùng thuật ngữ nhất quán giúp giảm mơ hồ trong giao tiếp kỹ thuật.
