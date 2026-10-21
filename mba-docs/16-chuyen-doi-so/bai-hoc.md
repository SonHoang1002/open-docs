# Chuyên đề 16 — Chuyển đổi số & Công nghệ quản trị (Digital Transformation / MIS)

## Mở đầu

Chuyển đổi số (digital transformation) là việc sử dụng công nghệ số để **thay đổi
cách doanh nghiệp tạo giá trị** — không phải "mua thêm phần mềm". Trong chương
trình MBA, chuyên đề này thay thế/đứng cạnh môn Management Information Systems
(MIS): học viên hiểu được các hệ thống quản trị thông tin (ERP, CRM, SCM), dữ
liệu, cloud, AI, tự động hóa — và quan trọng hơn, **biết cách triển khai có
lợi nhuận và quản trị thay đổi**.

**Ai nên học chuyên đề này:**

- Quản lý điều hành, chiến lược trong doanh nghiệp đang số hóa quy trình.
- Giám đốc vận hành, công nghệ thông tin, giám đốc dữ liệu (CDO) tương lai.
- Chuyên viên phân tích kinh doanh, dự án chuyển đổi số.
- Startup/SME cần chọn công nghệ đúng tầng, đúng ngân sách.

**Cảnh báo "bẫy chuyển đổi số":** tỷ lệ dự án CĐS thất bại/không đạt kỳ vọng theo
các khảo sát tư vấn là cao — nguyên nhân thường **không phải thiếu công nghệ** mà
là thiếu mục tiêu kinh doanh, dữ liệu bẩn, quy trình không đổi, người không
được đào tạo. Chuyên đề này lặp lại thông điệp: **công nghệ phục vụ bài toán
kinh doanh, không ngược lại**.

## Mục lục các bài

| Bài | Tên bài | Trọng tâm |
|-----|---------|-----------|
| 1 | Tổng quan MIS & khung chuyển đổi số | Vai trò MIS, 4 tầng hệ thống, khung CĐS |
| 2 | Hệ thống hoạch định nguồn lực doanh nghiệp (ERP) | Module, lợi ích, rủi ro triển khai |
| 3 | CRM, SCM software & hệ thống bán hàng | 360° khách hàng, marketing automation |
| 4 | Dữ liệu, kho dữ liệu & trí tuệ doanh nghiệp | DWH, BI, quản trị dữ liệu, dashboard |
| 5 | Cloud, SaaS & kiến trúc hệ thống | IaaS/PaaS/SaaS, tích hợp, API, TCO |
| 6 | AI/ML & tự động hóa quy trình (RPA) | Ứng dụng kinh doanh, use case, giới hạn |
| 7 | Thương mại điện tử & nền tảng số | Mô hình TMĐT, marketplace, kinh tế nền tảng |
| 8 | An ninh thông tin, chiến lược CĐS & case Việt Nam | Rủi ro, quản trị thay đổi, case VN |

---

## Bài 1 — Tổng quan MIS & khung chuyển đổi số

### Phần A — Cơ bản

**Hệ thống quản trị thông tin (MIS — Management Information System):** hệ thống
tổ chức con người – quy trình – công nghệ để **tạo, lưu trữ, phân phối và sử
dụng thông tin** hỗ trợ ra quyết định và kiểm soát.

**Bốn tầng hệ thống thông tin trong doanh nghiệp:**

| Tầng | Vai trò | Ví dụ |
|-------|---------|-------|
| Hệ thống xử lý giao dịch (TPS) | Ghi nhận giao dịch hàng ngày | POS, hóa đơn, chấm công |
| Hệ thống quản lý (MIS/DSS) | Báo cáo, hỗ trợ quyết định | Báo cáo doanh thu, mô hình dự báo |
| Hệ thống điều hành (EIS/BI) | Tổng hợp cho cấp lãnh đạo | Dashboard CEO, KPI |
| Hệ thống chiến lược (EIS/strategic) | Hỗ trợ sáng kiến dài hạn | Phân tích thị trường, AI |

**Chuyển đổi số (digital transformation):** sử dụng công nghệ số làm thay đổi
**mô hình kinh doanh, quy trình, trải nghiệm khách hàng, văn hóa** — không chỉ
số hóa giấy tờ (**digitization**: chuyển giấy → file; **digitalization**: đổi
cách làm có công nghệ; **transformation**: đổi mô hình giá trị).

**Khung 4 trụ cột chuyển đổi số (tổng hợp thực hành):**

1. **Khách hàng** (trải nghiệm số, đa kênh).
2. **Vận hành** (tự động hóa, dữ liệu ra quyết định).
3. **Nhân sự & văn hóa** (kỹ năng số, mindset).
4. **Nền tảng & dữ liệu** (hệ thống, cloud, an ninh).

### Phần B — Nâng cao

**Vì sao "mua ERP = chuyển đổi số" là sai?** ERP số hóa **quy trình đã có** —
nếu quy trình đó rác ("garbage process in, garbage data out"), ERP làm rác chạy
nhanh hơn và đắt hơn. Chuyển đổi số thực sự thường phải **cắt bỏ quy trình**
trước khi số hóa.

**Tranh luận: "Digital first hay process first?"** — Phe process-first: hiểu
bài toán trước, công nghệ sau; phe digital-first: thử nhanh công nghệ để khám
phá giá trị (reverse-engineer). Phương án thực dụng: **chọn theo loại sáng
kiến** — thay thế hệ thống lõi (ERP, kho) thì process-first; khám phá trải
nghiệm mới (app khách hàng, chatbot) thì test nhanh digital-first.

**Các mô hình số hóa (digital maturity):**

1. **Present:** hiện diện số cơ bản (website, fanpage).
2. **Engage:** tương tác số (chat, app, CRM).
3. **Integrate:** hệ thống tích hợp, dữ liệu luân chuyển.
4. **Transform:** mô hình kinh doanh số là cốt lõi (nền tảng, subscription).

Đa số SME Việt Nam mới ở tầng 1–2; ngân sách tập trung đúng tầng sẽ hiệu quả
hơn "nhảy cóc" mua hệ thống enterprise.

**Giới hạn:** số hóa không tự tạo giá trị — nghiên cứu thực hành cho thấy dự
án chỉ tạo ROI khi gắn KPI kinh doanh cụ thể (giảm chi phí 15%, tăng tỉ lệ
chuyển đổi 2%...); "digital transformation" without KPI = budget burn.

### Phần C — Thực tế

**Case quốc tế — chuỗi bán lẻ truyền thống vs. digital native:** chuỗi có 500
cửa hàng + web + app nhưng dữ liệu khách hàng tách rời (3 database) → khuyến
mãi trùng, trải nghiệm mâu thuẫn. Dự án CĐS bắt đầu từ **CDP (customer data
platform) + đồng bộ POS-online**, không phải từ "app mới" — bài học: **dữ liệu
khách hàng là hạ tầng, app chỉ là mặt tiền**.

**Case generic — SME sản xuất 200 nhân sự:** giám đốc muốn "số hóa toàn diện"
với ngân sách 5 tỷ. Tư vấn viên chia: 6 tháng đầu (1) chuẩn hóa quy trình bán
hàng & kho trên Excel có kiểm soát + dashboard Power BI (300 triệu), (2) CRM
SaaS (200 triệu/năm), (3) chấm công/văn phòng số; ERP đầy đủ **hoãn** đến khi
quy trình ổn định & doanh thu đủ. Kết quả 12 tháng: thời gian chốt báo cáo
tuần từ 3 ngày → 2 giờ, ERP được phê duyệt với mô hình rõ ràng sau đó.

**Lỗi thường gặp:**

- Đặt tên dự án "chuyển đổi số" nhưng không có KPI kinh doanh.
- Mua hệ thống đắt đỏ khi quy trình chưa chuẩn hóa.
- Bỏ qua dữ liệu (không làm sạch, không chủ sở hữu).
- Chỉ ban lãnh đạo "số hóa", nhân sự dùng Excel lén.
- Không tính tổng chi phí sở hữu (TCO) 3–5 năm.

**Checklist khởi động sáng kiến CĐS:**

- [ ] Bài toán kinh doanh nêu được bằng 1–2 KPI đo được.
- [ ] Quy trình hiện tại được vẽ (as-is) + điểm nghẽn.
- [ ] Dữ liệu cần thiết: nguồn, chất lượng, chủ sở hữu.
- [ ] Công nghệ là lựa chọn trong 3 phương án (bao gồm "không mua mới").
- [ ] Ngân sách gồm: license + tích hợp + đào tạo + thay đổi + chạy vận hành.
- [ ] Kế hoạch đo hiệu quả trước/tháng 3/tháng 6/tháng 12.

#### Ứng dụng thực tế

Áp dụng "4 trụ cột" đánh giá nhanh chính tổ chức bạn: điểm mỗi trụ 1–5. Trụ
nào thấp nhất thường là **con người & văn hóa** — nơi cần đầu tư trước khi
mua thêm license phần mềm.

#### Câu hỏi phỏng vấn xin việc

1. **Phân biệt digitization, digitalization và digital transformation.**
   *Gợi ý:* digitization = chuyển dạng (giây→file); digitalization = đổi cách
   làm có công nghệ; transformation = đổi mô hình giá trị/kinh doanh.
2. **Vì sao triển khai ERP không tự động là chuyển đổi số?**
   *Gợi ý:* ERP số hóa quy trình có sẵn; quy trình xấu + dữ liệu bẩn → hiệu quả
   âm; cần chuẩn hóa + thay đổi quản trị.
3. **Bạn đo hiệu quả một dự án CĐS bằng gì?**
   *Gợi ý:* KPI kinh doanh baseline và mục tiêu (chi phí, thời gian vòng đời
   đơn, tỉ lệ chuyển đổi, NPS…), so sánh before/after, ROI/TCO.

---

## Bài 2 — Hệ thống hoạch định nguồn lực doanh nghiệp (ERP)

### Phần A — Cơ bản

**ERP (Enterprise Resource Planning):** hệ thống tích hợp quản lý các nguồn lực
cốt lõi trên **một cơ sở dữ liệu chung**, các module liên thông với nhau.

**Module phổ biến:**

| Module | Chức năng chính |
|--------|-----------------|
| Kế toán/Tài chính (FI/CO) | Sổ cái, chi phí, ngân sách |
| Bán hàng & phân phối (SD) | Đơn hàng, giao hàng, hóa đơn |
| Mua hàng (MM/Procurement) | RFQ, PO, NCC |
| Sản xuất (PP/MRP) | Lập kế hoạch, lệnh sản xuất |
| Nhân sự (HR/HCM) | Hồ sơ, lương, chấm công |
| Kho (WM/EWM) | Nhập–xuất–tồn |

**Quy trình "order-to-cash" điển hình trên ERP:** đơn hàng bán → kiểm tra tồn
kho/giá → giao hàng → hóa đơn → thu tiền → ghi sổ cái tự động (không nhập tay
lần 2).

**Lợi ích kỳ vọng:** dữ liệu một nguồn (single source of truth), quy trình
chuẩn, báo cáo real-time, tuân thủ, giảm thao tác trùng lặp.

### Phần B — Nâng cao

**Rủi ro triển khai ERP (nổi tiếng):**

1. **Vượt ngân sách/thời gian** — nguyên nhân kinh điển: phạm vi phình (scope
   creep), dữ liệu chuyển đổi (data migration) phức tạp hơn dự kiến.
2. **Đại tu quy trình không phù hợp culture** — "customize 100%" làm mất đi
   best practice và chi phí nâng cấp khổng lồ.
3. **Phụ thuộc vendor & chi phí mở rộng** — license theo người dùng, module
   thêm, đối tác triển khai (SI) khóa chân.
4. **Đào tạo & chấp nhận thay đổi yếu** — hệ thống không dùng đúng → dữ liệu
   sai → báo cáo sai.
5. **Đứt gãy vận hành trong go-live** — cần kế hoạch song song (parallel run),
   hypercare.

**Tranh luận: "Cloud ERP vs. On-premise":** on-premise: kiểm soát cao, chi phí
capex + đội IT nội bộ; cloud/SaaS: opex theo thuê bao, nâng cấp vendor, phù
hợp SME/mid-market, ít đội vận hành. Phân kỳ lớn cho tập đoàn đa quốc gia phức tạp
— thường theo hybrid.

**Phân bổ chi phí thực tế của dự án ERP (bài học quý):** license chỉ là 1 phần;
**tích hợp + dữ liệu + đào tạo + quản trị thay đổi** thường chiếm 50–70% TCO
triển khai đầu tiên; ngân sách "20% dự phòng" là tối thiểu, 30–50% cho dự án
phức tạp.

**Giới hạn module "best practice":** quy trình chuẩn quốc tế có thể không khớp
quy định thuế/nhân sự đặc thù từng nước — cần đối tác hiểu luật VN; đừng
custom "cho giống cách cũ" nếu cách cũ là vấn đề.

### Phần C — Thực tế

**Case quốc tế — bài học thất bại công khai của nhiều dự án ERP lớn:** các
dự án kéo dài nhiều năm, vượt ngân sách hàng trăm triệu USD, một phần do "big
bang" go-live toàn công ty cùng lúc. Xu hướng hiện đại: **phân kỳ theo giai
đoạn (phased/multi-step)** — module cốt lõi trước (tài chính+kho), mở rộng sau.

**Case generic — SME thương mại VN 150 nhân sự:** chọn ERP cloud mid-market
cho kế toán+bán hàng+kho; quy trình: (1) chuẩn hóa danh mục hàng/NCC 1 tháng,
(2) migrate 24 tháng lịch sử (tinh gọn), (3) go-live 2 chi nhánh thí điểm
4 tuần, (4) mở rộng toàn quốc sau hypercare. Dữ liệu khách hàng >3 năm không
dọn → sai giá/khuyến mãi lịch sử → kéo dài 2 tháng data cleansing — đúng như
"nguyên nhân số 1".

**Lỗi thường gặp:**

- Chọn module theo catalogue thay vì theo quy trình có pain point.
- Không có "chủ sở hữu quy trình" bên nghiệp vụ (chỉ IT chịu trách nhiệm).
- Customize mọi thứ → nâng cấp thất bại, chi phí phình.
- Migrate toàn bộ dữ liệu lịch sử "cho đủ" trong khi cần 90% là 12–24 tháng.
- Go-live không có hypercare → sai sót chất lượng dữ liệu tháng đầu tích lũy.

**Checklist trước chọn & triển khai ERP:**

- [ ] Scope: module nào, quy trình nào, giai đoạn nào — nói "không" với phình.
- [ ] So sánh 3 nhà cung cấp: demo quy trình thực của bạn, không demo kịch bản.
- [ ] TCO 5 năm: license, tích hợp, đào tạo, nâng cấp, nhân sự nội bộ.
- [ ] Data migration plan: nguồn, làm sạch, chủ sở hữu từng trường dữ liệu.
- [ ] Kế hoạch thay đổi: truyền thông, đào tạo theo vai trò, KPI áp dụng.
- [ ] Go-live plan: thí điểm, hypercare 4–8 tuần, tiêu chí rollback.

#### Ứng dụng thực tế

Nếu doanh nghiệp bạn đang dùng Excel rời rạc: bước lên ERP không cần nhảy thẳng
máy chủ lớn — quy trình chuẩn hóa + module cloud bán hàng/kho đã tạo 70% giá
trị "tích hợp" với chi phí 1/10 ERP full suite.

#### Câu hỏi phỏng vấn xin việc

1. **ERP gồm module nào cơ bản và chúng liên thông ra sao?**
   *Gợi ý:* FI/CO, SD, MM, PP, HR, WM; ví dụ order-to-cash ghi nhận tồn kho,
   doanh thu, sổ cái tự động.
2. **3 rủi ro lớn nhất khi triển khai ERP.**
   *Gợi ý:* vượt ngân sách/phạm vi, dữ liệu migration, đào tạo/chấp nhận thay
   đổi.
3. **Cloud ERP khác on-premise về mô hình chi phí và kiểm soát?**
   *Gợi ý:* SaaS opex/thuê bao, vendor nâng cấp, ít hạ tầng nội bộ; on-premise
   capex, kiểm soát cao, cần đội vận hành.

---

## Bài 3 — CRM, SCM software & hệ thống bán hàng

### Phần A — Cơ bản

**CRM (Customer Relationship Management):** hệ thống quản trị toàn bộ quan hệ
khách hàng: liên hệ, cơ hội (lead/opportunity), tương tác, hợp đồng, dịch vụ
sau bán.

**KPI cốt lõi CRM:**

- Lead → MQL → SQL → cơ hội → thắng (funnel bán hàng).
- Churn, retention, NPS.
- Thời gian phản hồi khách, giá trị hợp đồng trung bình.
- Pipeline theo giá trị/ xác suất (weighted pipeline).

**Phân loại khách hàng trong CRM (RFM cơ bản):**

| Tiêu chí | Nghĩa |
|----------|-------|
| Recency | Lần mua gần nhất |
| Frequency | Tần suất mua |
| Monetary | Giá trị chi tiêu |

RFM dùng để phân nhóm: khách VIP (R/F/M cao), khách ngủ (R thấp) → chiến dịch
kích hoạt khác nhau.

**SCM software & hệ thống bán lẻ:** quản lý đơn hàng (OMS), kho (WMS), vận
đường, POS — kết nối ERP để tồn kho/khách hàng đồng bộ.

### Phần B — Nâng cao

**Marketing automation & omnichannel:** kịch bản email/Zalo/SMS theo hành vi
(đã xem nhưng chưa mua), điểm số lead (lead scoring), cá nhân hóa nội dung.
**Omnichannel** đúng nghĩa: tồn kho và lịch sử mua **một nguồn** giữa cửa hàng
và online — khác "có app riêng + có quầy riêng mà dữ liệu tách".

**Tranh luận: "CRM có tự tăng doanh thu?"** — CRM là **công cụ ghi và nhắc**;
doanh thu đến từ quy trình bán hàng có kỷ luật + offer đúng. Triển khai CRM
thất bại kinh điển: mua về rồi ghi "dư" sau 3 tháng vì sales không thấy lợi
ích (phải nhập gấp đôi công việc, không có giá trị báo cáo tức thì). Điều kiện
thành công: **quy trình + incentive + dữ liệu nhập là một phần KPI + dashboard
sales hữu ích**.

**360° view & quyền riêng tư:** hợp nhất định danh khách (email, SĐT, mã KH)
trong CDP; tại VN cần tuân thủ quy định bảo vệ dữ liệu cá nhân (PDPL) — thu
thập tối thiểu, có đồng ý, không dùng dữ liệu ngoài mục đích đã công bố.

**Giới hạn:** CRM "enterprise" đắt so với SME; giải pháp SaaS phổ thông (tầng
quản lý liên hệ + pipeline + email) đủ dùng tới khi có đội 5–10 sales. Đừng
mua hệ thống có AI bán hàng khi dữ liệu CRM còn bẩn.

### Phần C — Thực tế

**Case quốc tế — Amazon/retail hiện đại:** dữ liệu hành vi (xem gì, bỏ giỏ,
mua gì) dùng cho cá nhân hóa khuyến nghị — tỉ lệ conversion tăng đáng kể nhờ
gợi ý đúng thời điểm. Bài học: CRM/CDP hiệu quả nhất khi **gắn với đề xuất
hành động** (next best action), không phải chỉ lưu hồ sơ.

**Case generic — công ty phân phối thiết bị y tế VN (B2B):** 12 sales, theo
dõi cơ hội bằng Excel + Zalo cá nhân → sếp không thấy pipeline thật, dự báo
doanh số ±40%. Triển khai CRM SaaS: (1) quy trình 5 giai đoạn cơ hội thống
nhất, (2) bắt buộc cập nhật 2 lần/tuần có kiểm tra, (3) dashboard pipeline
tuần + win rate theo nguồn, (4) commission liên kết data. Sau 6 tháng: dự
báo ±12%, tỉ lệ thắng cơ hội +8 điểm phần trăm nhờ lọc sớm cơ hội yếu.

**Lỗi thường gặp:**

- CRM chỉ dùng làm danh bạ điện tử.
- Không làm sạch dữ liệu cũ trước khi migrate (số trùng, tên sai).
- Sales có 2 "sự thật" (CRM + bảng tính cá nhân).
- Không tích hợp email/điện thoại → nhập tay mỏi tay.
- Chọn tính năng theo demo vendor thay vì theo quy trình bán hàng thật.

**Checklist triển khai CRM:**

- [ ] Vẽ quy trình bán hàng 5–7 bước + tiêu chí chuyển bước.
- [ ] Làm sạch dữ liệu khách hàng cũ (trùng, thiếu SĐT/email).
- [ ] Đào tạo theo vai trò (sales, leader, marketing) + quick reference.
- [ ] Dashboard: pipeline, forecast, hoạt động/sales, nguồn lead.
- [ ] Quy tắc cập nhật & kiểm tra tuân thủ hàng tuần.
- [ ] Tích hợp kênh liên hệ chính (email/Zalo/SĐT) hoặc kế hoạch nối sau.

#### Ứng dụng thực tế

Áp dụng RFM trên dữ liệu khách hàng hiện có (kể cả Excel): chia khách thành
8–10 nhóm, chọn 1 chiến dịch cho nhóm "VIP ngủ" và 1 cho nhóm "mua 1 lần" —
đo tỉ lệ quay lại trước/sau. Bài tập này tạo ROI nhanh hơn mọi cuộc họp
"chuyển đổi số".

#### Câu hỏi phỏng vấn xin việc

1. **RFM là gì và dùng để làm gì?**
   *Gợi ý:* Recency–Frequency–Monetary chia nhóm khách; thiết kế chiến dịch/
   ưu đãi/ưu tiên dịch vụ theo nhóm.
2. **Vì sao CRM mua về vẫn không tăng doanh thu?**
   *Gợi ý:* thiếu quy trình, incentive, dữ liệu, dashboard giá trị — công cụ
   không thay văn hóa bán hàng.
3. **Dữ liệu cá nhân khách hàng cần chú ý gì ở Việt Nam?**
   *Gợi ý:* thu thập tối thiểu, mục đích rõ, đồng ý người dùng, bảo mật, không
   dùng sai mục đích — theo quy định bảo vệ dữ liệu cá nhân hiện hành.

---

## Bài 4 — Dữ liệu, kho dữ liệu & trí tuệ doanh nghiệp

### Phần A — Cơ bản

**Dữ liệu (data) → Thông tin (information) → Kiến thức (knowledge):** dữ liệu
số liệu thô; thông tin có ngữ cảnh; kiến thức + kinh nghiệm = quyết định.

**Kho dữ liệu (data warehouse — DWH):** kho **tích hợp, lịch sử, tối ưu truy
vấn báo cáo** từ nhiều nguồn (ERP, CRM, POS…); nguyên tắc: **ETL** (Extract –
Transform – Load) hoặc ELT.

**OLTP vs. OLAP:**

| | OLTP | OLAP |
|---|------|------|
| Mục đích | Giao dịch hàng ngày | Phân tích, báo cáo |
| Truy vấn | Rất nhiều, nhỏ | Ít, quét lớn |
| Ví dụ | Tạo đơn hàng | Doanh thu 3 năm theo ngành |

**Trí tuệ doanh nghiệp (BI — Business Intelligence):** lớp báo cáo/dashboard/
khai phá dữ liệu trên DWH/công cụ như Power BI, Tableau, Looker.

**Phân biệt:**

- **Dashboard hoạt động (operational):** theo dõi real-time (đơn/giờ).
- **Dashboard quản trị (strategic):** KPI tháng/quý theo mục tiêu.
- **Phân tích chẩn đoán:** vì sao chỉ số đổi (phân rã dimension).

### Phần B — Nâng cao

**Kiến trúc dữ liệu hiện đại:** source systems → staging (làm sạch) → warehouse
(khách hàng/sản phẩm thời gian) → **data marts** theo chủ đề (bán hàng, tài
chính) → BI/nền tảng ML. **Master Data Management (MDM):** quản lý dữ liệu
chủ (khách hàng, hàng hóa, NCC) — một mã, một tên, một nguồn chân lý — điều
kiện của mọi báo cáo đúng.

**Chất lượng dữ liệu (data quality) 6 tiêu chí:** đầy đủ, chính xác, nhất quán,
đúng thời điểm, duy nhất, hợp lệ. **Garbage in – garbage out:** dashboard đẹp
trên dữ liệu bẩn = ảo giác quản trị.

**Data governance (quản trị dữ liệu):** chính sách dữ liệu, chủ sở hữu dữ
liệu (data owner), steward, quyền truy cập, catalog, dòng chảy dữ liệu —
khung công việc thường bị thiếu vắng nhất nhưng quyết định độ bền của mọi sáng
kiến data.

**Tranh luận: "Data lake vs. warehouse vs. lakehouse":** lake (lưu thô, rẻ,
linh hoạt nhưng dễ thành "swamp"), warehouse (sạch, có cấu trúc, đắt hơn),
lakehouse (kết hợp). SME: **warehouse nhỏ + dashboard tốt** gần như luôn thắng
"data lake khổng lồ chưa ai dùng".

**Giới hạn:** dữ liệu quá khứ ≠ dự báo tương lai; dữ liệu hành vi chỉ phản ánh
hành vi trong hệ thống của bạn (selection bias); "big data" không cứu được
câu hỏi kinh doanh mơ hồ — **ngược lại, câu hỏi tốt cần ít dữ liệu hơn**.

### Phần C — Thực tế

**Case quốc tế — "data-driven" tại công ty bán lẻ lớn:** khi mọi quyết định
khuyến mãi dựa trên mô hình nhưng **không ai chịu trách nhiệm kiểm định kết
quả thử A/B**, công ty lạc quan về hiệu quả chiến dịch — bài học: data-driven
có nghĩa **có quy trình chứng minh nhân quả** (test), không chỉ nhìn correlation
trên dashboard.

**Case generic — SME thương mại điện tử VN:** 3 nguồn dữ liệu (website, fanpage,
kênh đại lý) → doanh thu báo cáo khác nhau mỗi phòng. Dự án: (1) thống nhất
định nghĩa "đơn hàng hợp lệ", "doanh thu thuần", (2) ETL tự động 2 nguồn về
kho nhỏ, (3) dashboard 12 KPI chung, (4) họp review tuần dùng chung số liệu.
Sau 3 tháng: thời gian họp báo cáo giảm 60%, tranh cãi "số của ai" chấm dứt.

**Lỗi thường gặp:**

- Dashboard 50 chỉ số → không ai nhìn.
- Không ai là chủ sở hữu dữ liệu → lỗi dữ liệu không ai sửa.
- Mỗi phòng tự làm báo cáo → 3 phiên bản "sự thật".
- Đánh đồng BI (mô tả) với AI (dự báo).
- Chi phí DWH phình vì ingest mọi thứ "phòng khi cần".

**Checklist sáng kiến dữ liệu/BI:**

- [ ] Danh sách 10–15 câu hỏi kinh doanh cần trả lời (trước khi chọn công cụ).
- [ ] Chủ sở hữu từng tập dữ liệu chủ (KH, hàng, NCC, giao dịch).
- [ ] Định nghĩa chỉ số viết thành văn bản (VD: "khách hoạt động = mua 90 ngày").
- [ ] Pipeline ETL có kiểm soát lỗi + log chất lượng.
- [ ] Dashboard theo vai trò, tối đa 1 trang/người.
- [ ] Review: chỉ số nào được dùng ra quyết định trong quý — cắt chỉ số chết.

#### Ứng dụng thực tế

Làm "định nghĩa chỉ số" cho 5 KPI phòng bạn: công thức, nguồn, tần suất, chủ
sở hữu, ngưỡng hành động — chỉ 2 trang, nhưng giảm 80% tranh cãi số liệu nội
bộ và là tiền đề cho mọi công cụ BI sau này.

#### Câu hỏi phỏng vấn xin việc

1. **Phân biệt OLTP và OLAP.**
   *Gợi ý:* OLTP: giao dịch nhiều, nhỏ, real-time; OLAP: phân tích, truy vấn
   quét lớn, dữ liệu lịch sử tích hợp.
2. **ETL gồm 3 bước nào?**
   *Gợi ý:* Extract (lấy), Transform (chuyển đổi/chuẩn hóa), Load (nạp) vào
   kho.
3. **Vì sao cần data governance trước khi mua công cụ BI?**
   *Gợi ý:* thiếu chủ sở hữu/định nghĩa → dashboard sai/tranh cãi; công cụ không
   sửa được dữ liệu và trách nhiệm.

---

## Bài 5 — Cloud, SaaS & kiến trúc hệ thống

### Phần A — Cơ bản

**Đám mây (cloud):** sử dụng tài nguyên tính toán/kho dữ liệu qua mạng, trả
theo dùng; loại bỏ/bớt chi phí sở hữu hạ tầng tại chỗ.

**3 mô hình dịch vụ:**

| Mô hình | Bạn quản lý | Ví dụ |
|---------|--------------|-------|
| IaaS | Hệ điều hành, app, data | máy ảo, storage |
| PaaS | Chỉ app & data | nền tảng web/DB managed |
| SaaS | Chỉ người dùng & dữ liệu | CRM/email/ERP cloud |

**3 mô hình triển khai:** công (public), riêng (private), kết hợp (hybrid) /
đa đám mây (multi-cloud).

**SaaS (Software as a Service):** phần mềm theo thuê bao, trình duyệt/app,
nâng cấp bởi nhà cung cấp — mô hình phổ biến nhất cho SME.

**Chi phí cloud — tính TCO:**

$$TCO_{\text{cloud}} = \text{Phí thuê bao/tháng} \times n + \text{Chi phí tích
hợp + đào tạo + nhân sự điều phối + rủi ro lock-in}$$

So sánh với on-premise: capex (máy chủ, phòng máy, điện làm mát, đội vận hành).

### Phần B — Nâng cao

**API & tích hợp hệ thống:** API (giao diện lập trình ứng dụng) cho phép 2 hệ
thống trao đổi dữ liệu; **iPaaS** (nền tảng tích hợp) giúp nối SaaS–SaaS không
cần code nhiều. Kiến trúc **best-of-breed** (mỗi lĩnh vực 1 phần mềm best)
cần iPaaS tốt; **suite** (ERP làm trung tâm) giảm tích hợp nhưng tăng phụ thuộc.

**Kinh tế chi phí cloud (cost sprawl):** dễ "quên tắt" tài nguyên, môi trường
test chạy 24/7, data egress phí. Công cụ: tagging theo dự án, cảnh báo ngân
sách, FinOps (văn hóa quản trị chi phí cloud chung finance–IT).

**Bảo mật cloud shared responsibility:** nhà cung cấp bảo mật "mây" (hạ tầng);
bạn bảo mật "trong mây" (tài khoản, phân quyền, dữ liệu, cấu hình) — đa số
sự cố do **cấu hình sai** (bucket public, key lộ), không phải nhà cung cấp bị
hack.

**Lock-in & portability:** API riêng, format dữ liệu riêng → chuyển nhà cung
cấp đắt; cân bằng: dùng managed services khi giá trị lớn, giữ chuẩn mở cho
lớp dữ liệu quan trọng.

**Tranh luận "cloud always cheaper?":** không — workload ổn định, dùng hết
công suất 24/7 có thể on-premise rẻ hơn; cloud thắng ở **linh hoạt, tốc độ,
quy mô biến đổi, giảm đội vận hành**. Quyết định bằng TCO 3–5 năm theo
từng workload, không theo slogan.

### Phần C — Thực tế

**Case quốc tế — "cloud first" của nhiều tập đoàn:** di chuyển email/CRM trước
(low risk), giữ ERP lõi/lệ chuyển sau (high risk) — **di chuyển theo giá trị/
rủi ro**, không big-bang cả data center trong 1 đêm.

**Case generic — công ty phần mềm nhỏ VN (20 người):** trước đây mua 2 máy
chủ + backup + điện + admin bán thời gian ~350 triệu/năm; chuyển SaaS
(containers managed + CI/CD + storage) ~120 triệu/năm + ít sự cố cuối tuần.
Nhưng khi khách hàng enterprise đòi "trung tâm dữ liệu trong nước" → hybrid:
dữ liệu khách chính giữ region VN (nếu nhà cung cấp hỗ trợ) + backup — bài
học: lựa chọn cloud theo **yêu cầu pháp lý/khách hàng**, không chỉ theo giá.

**Lỗi thường gặp:**

- Chuyển cloud "tiết kiệm" nhưng quên chi phí tích hợp + đào tạo + nhân sự
  điều phối.
- 10 SaaS rời rạc không tích hợp → 10 silo dữ liệu mới.
- Quyền admin chung cho cả công ty, MFA không bật.
- Không có kế hoạch backup/restore "test" (backup chưa từng restore = không
  có backup).
- Đọc báo giá cloud bằng USD không quy đổi rủi ro tỉ giá & thuế.

**Checklist chọn & vận hành SaaS/cloud:**

- [ ] TCO 3 năm so với phương án hiện tại (gồm ẩn phí).
- [ ] Dữ liệu: xuất được (export), định dạng mở, nơi lưu (quyền riêng tư).
- [ ] Bảo mật: MFA, RBAC, nhật ký truy cập, SSO nếu có.
- [ ] Tích hợp: API có/giấy tờ, iPaaS, đồng bộ danh mục chủ.
- [ ] SLA & hỗ trợ (tiếng Việt, thời gian phản hồi).
- [ ] Kế hoạch rời đi (exit plan) viết ngay khi ký hợp đồng.

#### Ứng dụng thực tế

Làm bảng inventory SaaS toàn công ty: phần mềm, chủ sở hữu, người dùng, chi
phí/năm, mức sử dụng thật. Nhiều công ty cắt được 20–40% chi phí license "mồ
côi" chỉ bằng 1 buổi rà soát.

#### Câu hỏi phỏng vấn xin việc

1. **IaaS, PaaS, SaaS khác nhau ở phần nào bạn quản lý?**
   *Gợi ý:* IaaS: OS+app+data; PaaS: app+data; SaaS: chỉ nội dung người dùng.
2. **Shared responsibility trong cloud nghĩa là gì?**
   *Gợi ý:* hạ tầng do nhà cung cấp, cấu hình/tài khoản/dữ liệu do khách hàng;
   sự cố thường do cấu hình sai.
3. **Khi nào workload không nên chuyển cloud?**
   *Gợi ý:* dùng ổn định công suất cao, yêu cầu kiểm soát đặc thù, chi phí
   chuyển đổi/đào tạo vượt lợi ích — so TCO 3–5 năm.

---

## Bài 6 — AI/ML & tự động hóa quy trình (RPA)

### Phần A — Cơ bản

**Trí tuệ nhân tạo (AI)** là thuật ngữ rộng; **machine learning (ML)**: thuật
toán học từ dữ liệu để **dự đoán/phân loại** mà không lập trình từng luật.

**Các bài toán ML kinh doanh phổ biến:**

| Loại | Câu hỏi | Ví dụ |
|------|---------|-------|
| Phân loại | Thuộc nhóm nào? | Churn/ko churn, gian lận |
| Hồi quy | Bao nhiêu? | Doanh số, giá nhà |
| Gom cụm | Có nhóm nào ẩn? | Phân khúc khách |
| Dự báo chuỗi | Kỳ tới? | Demand forecast |
| Gợi ý | Cái gì hấp dẫn? | Sản phẩm gợi ý |

**AI sinh nội dung (generative AI):** mô hình tạo văn bản/ảnh/hộp thoại (LLM) —
ứng dụng: hỗ trợ CSKH (soạn email, tóm tắt), sinh nội dung, hỗ trợ lập trình.
**Khác ML dự đoán truyền thống:** sinh nội dung, cần layer kiểm soát chất
lượng/pháp lý.

**RPA (Robotic Process Automation):** "robot phần mềm" thao tác trên giao diện
ứng dụng như người (click, nhập, copy) — **tự động hóa quy trình có luật
rõ, dữ liệu có cấu trúc**, không cần API.

**So sánh nhanh:**

| | RPA | AI/ML |
|---|-----|-------|
| Bản chất | Giả lập thao tác | Dự đoán/tạo từ dữ liệu |
| Phù hợp | Quy trình lặp, luật cứng | Mẫu ẩn, dự báo |
| Sai sót | Giảm thao tác tay | Sai mô hình nếu dữ liệu lệch |

### Phần B — Nâng cao

**Ladder ứng dụng AI trong kinh doanh (thứ tự thực tế):**

1. **Dự báo** (demand, churn, cash flow) — ROI rõ nhất.
2. **Phân loại** (gian lận, điểm tín dụng, phân loại yêu cầu CSKH).
3. **Tối ưu** (giá, tồn kho, tuyến giao).
4. **Hỗ trợ người** (soạn thảo, tra cứu tri thức nội bộ).
5. **Tự động có kiểm soát** (agent thực hiện một phần quy trình, người phê
   duyệt cuối).

**MLOps & giám sát mô hình:** model degrade theo thời gian (dữ liệu đổi —
concept drift); cần: giám sát độ chính xác theo thời gian, retrain, có ngưỡng
tự động quay về luật cũ/ con người can thiệp. **AI không "cài 1 lần dùng mãi".**

**Tranh luận: "AI sẽ thay thế quản lý?"** — AI thay thế **quyết định có luật
cứng và dữ liệu tốt**; quản lý thay vì thế tập trung vào: chọn câu hỏi đúng,
định nghĩa mục tiêu/đạo đức, quyết định khi dữ liệu mâu thuẫn, trách nhiệm
pháp lý. AI là "nhân viên phân tích cấp trung siêu nhanh, không có bối cảnh,
cần người chịu trách nhiệm".

**Rủi ro AI trong kinh doanh:** hallucination (sai có vẻ thật) với LLM, thiên
lệch dữ liệu (bias) tạo phân biệt đối xử (tín dụng, tuyển dụng), rò rỉ dữ
liệu nhạy cảm khi dùng công cụ công cộng, chi phí tính toán, khó giải thích
("black box") khi cần tranh tụng.

**Giới hạn:** AI/ML không sửa được quy trình xấu hay dữ liệu bẩn; use case
"AI everywhere" không có KPI → chi phí cao, giá trị mơ hồ; ROI tốt nhất ở
use case có: dữ liệu sẵn, tác động/quy mô lớn, sai sót còn người duyệt được.

### Phần C — Thực tế

**Case quốc tế — chatbot & trợ lý AI doanh nghiệp:** triển khai LLM nội bộ
"tra cứu chính sách + soạn email" với **kho tri thức được kiểm duyệt**, giảm
thời gian tìm thông tin; doanh nghiệp thuần chatbot công cộng với dữ liệu
khách hàng thật từng gặp sự cố rò rỉ — bài học: **giới hạn phạm vi dữ liệu +
layer duyệt của con người**.

**Case generic — RPA cho kế toán SME:** robot đọc email hóa đơn, nhập số liệu
vào kế toán, đối chiếu 3 bên (PO – hóa đơn – nhận hàng), gửi exception cho
kế toán viên. Trước: 2 nhân viên 6 giờ/ngày; sau: robot xử lý 85% giao dịch
tiêu chuẩn, người xử lý 15% ngoại lệ + kiểm tra. ROI 5 tháng. RPA thất bại
gần đó: quy trình đổi mỗi tháng → robot hỏng liên tục → bài học: chuẩn hóa
trước, RPA sau.

**Lỗi thường gặp:**

- "Đưa AI vào" không chọn use case, không đo baseline.
- Dùng LLM công cộng dán dữ liệu khách hàng/hợp đồng bí mật.
- RPA cho quy trình còn người thích "ngoại lệ sáng tạo" → robot liên tục cần
  người sửa.
- Không có người chịu trách nhiệm đạo đức/chất lượng mô hình.
- Kỳ vọng tự động hóa 100% — kế hoạch nên "automation với người trong vòng
  loop" (human-in-the-loop).

**Checklist đánh giá use case AI/RPA:**

- [ ] Bài toán có KPI baseline (VD: thời gian xử lý, % sai sót, % churn)?
- [ ] Dữ liệu: đủ, sạch, hợp pháp dùng?
- [ ] Sai sót nếu mô hình/robot sai: chi phí bao nhiêu, ai chặn?
- [ ] Có API hay phải RPA giao diện (dễ vỡ)?
- [ ] Quy trình chuẩn hóa ≥ 80% trước khi tự động?
- [ ] Kế hoạch giám sát & retrain/người duyệt?

#### Ứng dụng thực tế

Chọn **1use case dự báo** trong phạm vi bạn: dự báo dòng tiền 13 tuần, dự báo
nghỉ việc, dự báo ticket CSKH — bắt đầu bằng mô hình đơn giản (trung bình
hội tụ/hồi quy) làm baseline; chỉ thêm ML phức tạp khi baseline đã bị đánh
bại rõ ràng.

#### Câu hỏi phỏng vấn xin việc

1. **Phân biệt RPA và ML bằng ví dụ.**
   *Gợi ý:* RPA: robot nhập hóa đơn theo luật; ML: dự đoán khách churn từ dữ
   liệu hành vi — khác bản chất: thao tác vs. dự đoán.
2. **Concept drift là gì, xử lý ra sao?**
   *Gợi ý:* dữ liệu đổi làm mô hình cũ sai; giám sát metrics theo thời gian,
   retrain, ngưỡng cảnh báo, fallback.
3. **3 rủi ro khi dùng AI sinh nội dung trong CSKH?**
   *Gợi ý:* phát sinh nội dung sai (hallucination), rò rỉ dữ liệu, thiếu kiểm
   soát chất lượng — cần kho tri thức duyệt + người chịu trách nhiệm.

---

## Bài 7 — Thương mại điện tử & nền tảng số

### Phần A — Cơ bản

**Thương mại điện tử (TMĐT):** mua–bán hàng hóa/dịch vụ qua mạng. Phân loại
theo bên tham gia:

- **B2C:** doanh nghiệp → người tiêu dùng.
- **B2B:** doanh nghiệp → doanh nghiệp.
- **C2C:** người → người (sàn rao vặt).
- **D2C:** doanh nghiệp → người tiêu dùng qua kênh sở hữu (không qua đại lý).

**Kênh bán số phổ biến tại VN:** website/sàn TMĐT, mạng xã hội (bán hàng qua
fanpage/Zalo), livestream, siêu thị mini app. **Không có kênh "tốt nhất" —
có kênh khớp hành vi khách và chi phí phục vụ.**

**Chỉ số TMĐT cốt lõi:**

- Conversion rate (% mua / phiên).
- AOV (giá trị đơn trung bình).
- Cart abandonment rate.
- CAC, LTV, chi phí logistics/đơn.
- Repeat purchase rate.

### Phần B — Nâng cao

**Mô hình marketplace vs. inventory model:**

| | Marketplace | Giữ hàng (1P/retail) |
|---|-------------|----------------------|
| Vốn | Thấp (không mua hàng) | Cao (tồn kho) |
| Kiểm soát giá/dịch vụ | Thấp | Cao |
| Doanh thu | Hoa hồng, phí hiển thị | Biên lợi nhuận hàng |

Kết hợp phổ biến: 1P cho hàng chiến lược + 3P marketplace mở rộng SKU.

**Hiệu ứng mạng lưới & winner-take-most:** nền tảng hai mặt (người bán–người
mua) tăng giá trị khi mật độ tăng; chiến lược: ưu tiên **mật độ khu vực**,
giảm "rào cản" lần đầu (phí, onboarding), kiểm soát chất lượng để hai mặt
không bỏ chạy.

**Kinh tế nền tảng (platform economics) — dòng doanh thu:** hoa hồng giao
dịch, phí niêm yết/hiển thị (listing/ads), phí đăng ký, dịch vụ giá trị gia
tăng (vận chuyển, thanh toán, trả góp). **Rủi ro:** giao dịch ngoài nền tảng
("leakage"), race-to-bottom giá, trách nhiệm chất lượng hàng/hàng giả.

**Tranh luận: "Nền tảng vs. doanh nghiệp truyền thống":** nền tảng scale nhanh
nhưng biên lợi nhuận mỏng trước khi đủ mật độ, phụ thuộc quy định; doanh
nghiệp truyền thống số hóa giữ được mối quan hệ & chất lượng nhưng khó đạt
quy mô hai mặt. Xu hướng: **hybrid** — hãng lớn xây nền tảng riêng/dịch vụ
giá trị gia quanh khách.

**Giới hạn:** "có website = bán online" là ảo tưởng — CAC ads tăng, logistics
chặng cuối, đổi trả, và **cạnh tranh trên sàn** (giá + phí hoa hồng + chiến
thuật hiển thị) quyết định lợi nhuận thực.

### Phần C — Thực tế

**Case quốc tế — Amazon Flywheel:** giá thấp → nhiều khách → nhiều người bán
→ nhiều lựa chọn/khối lượng → chi phí đơn vị giảm → giá thấp hơn; +
nội dung/dịch vụ (Prime) tăng tần suất. Bài học: **liệt kê vòng lặp tăng
trưởng thực của bạn** — không phải chỉ "mở sàn".

**Case generic — SME nội địa VN bán qua sàn + D2C:** 70% doanh số từ 2 sàn
lớn, biên thực sau hoa hồng + ads + trả hàng chỉ 8% (so với 25% bán trực
tiếp qua fanpage & Zalo OA có khách quen). Chiến lược 12 tháng: (1) giữ sàn
làm kênh tìm khách, (2) xây chương trình khách thân chuyển sang D2C (ưu
đãi thành viên, nội dung), (3) kiểm soát trả hàng bằng video đóng gói + mô
tả chính xác, (4) D2C lên 35% doanh số, biên bình quân cải thiện 5 điểm
phần trăm.

**Lỗi thường gặp:**

- Đặt cược toàn bộ doanh thu vào 1 sàn (rủi ro chính sách/phí đổi).
- Tối ưu GMV bằng ads lỗ không tính biên sau logistics & trả hàng.
- Mô tả hàng "quá đẹp" → đổi trả cao → phạt hiển thị + lỗ vận chuyển.
- Bỏ data khách sàn (không có CDP) → không xây được LTV.
- Livestream không có kịch bản & quy trình hậu cần đơn hàng.

**Checklist chiến lược bán số:**

- [ ] Biên lợi nhuận **thực** theo kênh (sau phí sàn, ads, trả hàng, giao).
- [ ] Tỉ lệ tập trung: không kênh nào > ~50% nếu tránh được.
- [ ] Dữ liệu khách: cách lấy đồng ý & lưu kênh D2C.
- [ ] Logistics: SLA giao, chi phí/đơn, tỉ lệ giao thành công.
- [ ] Chống gian lận & bảo mật thanh toán.
- [ ] Kế hoạch nội dung/CRM nuôi khách sau mua (repeat purchase).

#### Ứng dụng thực tế

Tính **biên thực theo kênh** cho 3 kênh bán của công ty bạn (hoặc 1 case bạn
biết): giá bán − giá vốn − phí nền tảng − ads − giao − trả hàng % — bảng 1
trang này thường làm thay đổi toàn bộ chiến lược phân bổ ngân sách.

#### Câu hỏi phỏng vấn xin việc

1. **Marketplace khác inventory model về vốn và kiểm soát?**
   *Gợi ý:* marketplace: hoa hồng, vốn thấp, ít kiểm soát; retail 1P: tồn
   kho, kiểm soát cao, vốn lớn.
2. **Giải thích CAC, AOV, tỉ lệ trả hàng và mối liên hệ lợi nhuận.**
   *Gợi ý:* AOV cao không cứu được CAC + tỉ lệ trả hàng cao; lợi nhuận thực
   = AOV × biên − CAC/amortized − phí trả hàng…
3. **Rủi ro phụ thuộc 1 sàn TMĐT là gì?**
   *Gợi ý:* đổi chính sách phí/hiển thị, khóa tài khoản, cạnh tranh giá — cần
   đa kênh + D2C.

---

## Bài 8 — An ninh thông tin, chiến lược CĐS & case Việt Nam

### Phần A — Cơ bản

**An ninh thông tin (information security) — tam giác CIA:**

- **Confidentiality:** chỉ người được phép xem.
- **Integrity:** dữ liệu không bị sửa trái phép.
- **Availability:** hệ thống/truy cập khi cần.

**Các mối đe dọa phổ biến:** phishing, mã độc tống tiền (ransomware), rò rỉ dữ
liệu, tấn công từ chối dịch vụ, bên thứ ba/đối tác bị xâm phạm, sai sót cấu
hình/con người.

**Biện pháp nền tảng:**

- Xác thực nhiều yếu tố (MFA), nguyên tắc đặc quyền tối thiểu (least privilege).
- Sao lưu 3-2-1 (3 bản, 2 môi trường, 1 ngoài chỗ): backup + **kiểm thử khôi phục**.
- Cập nhật vá lỗi, quản lý tài khoản, phân vùng mạng.
- Nhận diện & huấn luyện nhân sự (phishing drill).

**Quản trị rủi ro công nghệ (IT risk management):** xác định tài sản → mối đe
dọa → lỗ hổng → xác suất × tác động → biện pháp (tránh/chuyển/chịu/giảm) →
giám sát.

### Phần B — Nâng cao

**Pháp luật & tuân thủ dữ liệu tại VN (tổng quan cập nhật kiến thức):**
Luật An ninh mạng yêu cầu lưu trữ dữ liệu, hợp tác với cơ quan chức năng; Luật
Bảo vệ dữ liệu cá nhân (PDPL) quy định xử lý dữ liệu cá nhân, quyền của chủ dữ
liệu, đánh giá tác động trong trường hợp rủi ro cao; quy định về phòng, chống
rửa tiền (AML) với fintech. **Doanh nghiệp cần tư vấn pháp lý chuyên trách**
cho từng trường hợp cụ thể.

**Khung quản trị CĐS — chiến lược & con người:**

1. **Chiến lược gắn kinh doanh:** CĐS phục vụ chiến lược tổng thể (không phải
   chương trình IT riêng).
2. **Cấp lãnh đạo & sở hữu:** steering committee liên phòng, chủ sở hữu kết
   quả kinh doanh từng sáng kiến.
3. **Con người:** thay đổi vai trò (data analyst, product owner), đào tạo số,
   quản trị năng lực.
4. **Vốn & danh mục sáng kiến:** portfolio sáng kiến CĐS xếp theo ROI/rủi ro,
   nguồn lực; dừng dự án "zombie".
5. **Đo lường:** OKR CĐS (VD: % quy trình số, thời gian chu trình, NPS nội bộ,
   chi phí/giao dịch).

**Tranh luận: "Centralize IT hay business-led digital?"** — Central: kiểm soát,
tiết kiệm, tiêu chuẩn; business-led: nhanh, sát pain point, nhưng sinh silo &
rủi ro. Mô hình phổ biến: **nền tảng trung tâm (data, security, kiến trúc)
+ đội sản phẩm số gần business** (federated).

**Quản trị thay đổi số (change management) — 4 pha (khung thực dụng):**

1. **Nhận thức & mua vào (why).**
2. **Thiết kế cùng người dùng (co-creation).**
3. **Thử nghiệm & đào tạo theo vai trò.**
4. **Cố hóa (embed) vào KPI & quy trình mới.**

Thất bại CĐS phần lớn nằm ở pha 1 và 4 — không phải pha cài đặt.

### Phần C — Thực tế

**Case quốc tế — bài học ransomware với hệ thống cảng/logistics:** nhiều sự cố
cảng biển/công ty logistics toàn cầu bị tê liệt hoạt động hàng ngày khi hệ
thống bị mã hóa — chi phí chuỗi cung ứng toàn cầu tăng ngay. Bài học: quy
trình offline khẩn cấp + backup test + drill = một phần "resilience kinh
doanh", không phải chỉ bài toán IT.

**Case VN 1 — ngân hàng/tài chính số:** ngành ngân hàng VN có mức độ số hóa cao
(ngân hàng số, ví điện tử, QR); thành công đến từ: đầu tư mạnh hạ tầng +
kinh nghiệm quy định + trải nghiệm khách hàng; đồng thời chịu áp lực bảo mật
liên tục. Bài học cho SV: **ngành chịu regulación chặt có thể CĐS nhanh khi
quy định rõ + vốn đầu tư lớn** — không chỉ startup "linh hoạt".

**Case VN 2 — SME bán lẻ/phân phối số hóa hậu Covid:** chuỗi phân phối 30
điểm bán chuyển đơn hàng B2B từ điện thoại/Excel sang app đặt hàng + thanh
toán trực tuyến + dashboard tồn kho vùng. Giai đoạn 1 (3 tháng): 60% đơn
qua app, giảm 40% sai sót đơn, tồn kho vùng minh bạch. Giai đoạn 2: CRM
khách đại lý + dự báo bổ hàng. **Bài học:** CĐS SME thành công nhờ phạm vi
hẹp, giải pain cụ thể, đào tạo "thời vụ" (1 tuần/điểm bán), lãnh đạo vận
hành dùng số liệu mỗi sáng.

**Lỗi thường gặp CĐS cuối:**

- Không có steering committee → sáng kiến chết ở ranh giới phòng ban.
- Đào tạo 1 lần "cho có" khi go-live, không coaching 30–60 ngày sau.
- Không đưa chỉ số CĐS vào KPI lãnh đạo → ưu tiên lại rơi vào việc cũ khi
  khủng hoảng.
- Mua giải pháp an ninh đắt đỏ nhưng không bật MFA/backup test.
- Sợ rủi ro đến mức không thử gì → mất lợi thế; hoặc ngược lại "thử mọi thứ"
  không quản trị rủi ro dữ liệu.

**Checklist chương trình CĐS 12 tháng (khung điều hành):**

- [ ] CĐS gắn 3–5 mục tiêu chiến lược công ty, có chủ sở hữu cấp điều hành.
- [ ] Danh mục sáng kiến xếp theo giá trị/rủi ro; nguồn lực & dừng dự án rõ.
- [ ] Nền tảng chung: danh mục chủ (KH, hàng), MFA, backup, logging.
- [ ] Kế hoạch năng lực & thay đổi theo vai trò (không đào tạo chung chung).
- [ ] Dashboard chương trình: tiến độ, lợi nhuận thực hiện, rủi ro tuân thủ.
- [ ] Review quý: điều chỉnh danh mục, công bố bài học, khen thưởng hành vi
      dữ liệu/số tốt.

#### Ứng dụng thực tế

Viết **1 trang "business case"** cho sáng kiến số bạn đang muốn làm: bài toán,
KPI baseline/mục tiêu, phạm vi 90 ngày, chi phí, rủi ro chính, người chịu
trách nhiệm — 1 trang này giúp bạn nhận được nguồn lực nhanh hơn mọi bản
trình bày 50 slide thiếu số liệu.

#### Câu hỏi phỏng vấn xin việc

1. **Tam giác CIA gồm gì và áp vào ransomware ra sao?**
   *Gợi ý:* Confidentiality–Integrity–Availability; ransomware phá availability
   (và integrity), đòi tiền chuộc — phòng: backup test, offline copy, drill.
2. **Vì sao quản trị thay đổi quan trọng hơn cài đặt phần mềm trong CĐS?**
   *Gợi ý:* hệ thống không được dùng đúng → dữ liệu sai → giá trị = 0; thất bại
   CĐS nằm ở mua vào & cố hóa hành vi.
3. **Số hóa SME thành công có đặc điểm chung gì (case VN)?**
   *Gợi ý:* phạm vi hẹp theo pain cụ thể, dữ liệu/bảng điều khiển dùng hàng
   ngày, lãnh đạo dùng số liệu ra quyết định, đào tạo sát điểm bán.

---

## Tóm tắt nhanh

| Bài | Khung/công cụ chính | Chỉ số/ngưỡng nhớ |
|-----|----------------------|--------------------|
| 1 | MIS 4 tầng, khung CĐS 4 trụ | KPI kinh doanh trước công nghệ |
| 2 | ERP module, order-to-cash | TCO 5 năm; 50–70% chi phí ngoài license |
| 3 | CRM, RFM, omnichannel | Pipeline, win rate, churn |
| 4 | DWH, ETL, OLAP, BI | 6 tiêu chí chất lượng dữ liệu |
| 5 | IaaS/PaaS/SaaS, API, FinOps | Shared responsibility; exit plan |
| 6 | ML use case, RPA, MLOps | Baseline trước; human-in-the-loop |
| 7 | TMĐT, marketplace vs 1P | Biên thực theo kênh |
| 8 | CIA, PDPL/ANM, change 4 pha | MFA, backup 3-2-1, steering committee |

## Thuật ngữ Anh–Việt

| Anh | Việt |
|-----|------|
| MIS | Hệ thống quản trị thông tin |
| Digital transformation | Chuyển đổi số |
| Digitization / Digitalization | Số hóa giấy tờ / Đổi cách làm bằng công nghệ |
| ERP | Hệ thống hoạch định nguồn lực |
| Order-to-cash | Quy trình đơn hàng đến thu tiền |
| CRM | Quản trị quan hệ khách hàng |
| RFM | Gần nhất – Tần suất – Giá trị |
| CDP | Nền tảng dữ liệu khách hàng |
| Omnichannel | Đa kênh tích hợp |
| DWH / Data warehouse | Kho dữ liệu |
| ETL / ELT | Trích – chuyển – nạp dữ liệu |
| OLTP / OLAP | Giao dịch / phân tích |
| BI | Trí tuệ doanh nghiệp |
| MDM | Quản trị dữ liệu chủ |
| Data governance | Quản trị dữ liệu |
| Dashboard | Bảng điều khiển chỉ số |
| Cloud | Điện toán đám mây |
| IaaS / PaaS / SaaS | Hạ tầng / nền tảng / phần mềm dạng dịch vụ |
| TCO | Tổng chi phí sở hữu |
| API | Giao diện lập trình ứng dụng |
| iPaaS / FinOps | Tích hợp đám mây / vận hành chi phí cloud |
| Lock-in | Phụ thuộc nhà cung cấp |
| Shared responsibility | Trách nhiệm chung (bảo mật cloud) |
| AI / ML | Trí tuệ nhân tạo / học máy |
| Generative AI / LLM | AI sinh nội dung / mô hình ngôn ngữ lớn |
| Hallucination | Nội dung "ảo" sai nhưng có vẻ thật |
| RPA | Tự động hóa quy trình bằng robot phần mềm |
| MLOps / Concept drift | Vận hành ML / mô hình lỗi thời khi dữ liệu đổi |
| Human-in-the-loop | Con người trong vòng quyết định |
| TMĐT | Thương mại điện tử |
| Marketplace / D2C | Sàn đa bên / bán trực tiếp |
| AOV / CAC / Cart abandonment | Giá trị đơn / chi phí thu hút khách / bỏ giỏ |
| Platform economics | Kinh tế nền tảng |
| CIA triad | Tam giác bảo mật |
| MFA / Least privilege | Xác thực đa yếu tố / đặc quyền tối thiểu |
| Ransomware | Mã độc tống tiền |
| Backup 3-2-1 | Quy tắc sao lưu 3 bản–2 nơi–1 ngoài |
| PDPL | Luật Bảo vệ dữ liệu cá nhân |
| Change management | Quản trị thay đổi |
| Steering committee | Ủy ban chỉ đạo dự án |

---
*Từ đây, làm bài tập trong `cau-hoi.md` và xem nhanh `slides.md` của chuyên đề.*
