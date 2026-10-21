# KẾ TOÁN QUẢN TRỊ (Managerial Accounting)

## Mở đầu

**Kế toán quản trị** là nhánh cung cấp thông tin chi phí – doanh thu – hiệu quả cho
người **bên trong** doanh nghiệp (ban giám đốc, quản lý bộ phận) ra quyết định. Khác với
kế toán tài chính hướng ra bên ngoài (cổ đông, cơ quan thuế, ngân hàng) và bắt buộc tuân
theo chuẩn mực (VAS/IFRS), kế toán quản trị **không bắt buộc đúng chuẩn nào** — chỉ cần
**hữu ích, kịp thời, đúng mục đích quản trị**.

Trong chương trình MBA chuẩn (Wharton ACCT, Kellogg, Olin, USF...), Kế toán quản trị thường
là **môn nền tảng của học kỳ 1**, vì nó cung cấp "ngôn ngữ số" cho các môn sau: Tài chính
doanh nghiệp (dùng bảng CFS, vốn lưu động), Chiến lược (phân tích chi phí – lợi nhuận),
Vận hành (định giá nội bộ, hiệu suất) và Phân tích dữ liệu (BI/management reporting).

**Mục tiêu học phần:**

1. Đọc và hiểu bảng kết quả kinh doanh theo **hấp thụ (absorption)** và **biến đổi (variable)**.
2. Dự báo – ra quyết định bằng **phân tích CVP** (doanh thu – chi phí – lợi nhuận).
3. Phân bổ chi phí chính xác bằng **ABC** thay cho phân bổ máy mốc truyền thống.
4. Xây dựng **ngân sách master**, **ngân sách linh hoạt** và **phân tích chênh lệch**.
5. Đánh giá dự án đầu tư bằng **NPV, IRR, payback, PI**.
6. Thiết lập **KPI và Balanced Scorecard** để đo – quản trị hiệu quả.

---

## Mục lục các bài

| Bài | Tên bài | Nội dung chính |
|-----|---------|----------------|
| 1 | Vai trò & dòng chảy thông tin kế toán quản trị | Phân biệt quản trị/tài chính, dòng dữ liệu, chi phí theo vai trò |
| 2 | Kế toán chi phí: Hấp thụ vs Biến đổi | Định giá theo hấp thụ/định giá biến đổi, tồn kho, lợi nhuận |
| 3 | Phân tích CVP & điểm hòa vốn | CMR, BEP, đòn bẩy vận hành, an toàn, đa sản phẩm |
| 4 | Kế toán chi phí theo hoạt động (ABC/ABM) | Pool chi phí, driver, so sánh với phân bổ truyền thống |
| 5 | Ngân sách: Master budget & ngân sách linh hoạt | Sản xuất, tiền mặt, dự trữ, rolling forecast |
| 6 | Phân tích chênh lệch (Variance Analysis) | Giá, khối lượng, hiệu quả, công suất, tiêu chuẩn |
| 7 | Quyết toán vốn: NPV, IRR, payback, PI | Dòng tiền tự do, chi phí cơ hội, hạn chế lý thuyết |
| 8 | KPI, Balanced Scorecard & quản trị hiệu quả | 4 quan điểm, cascading, anti-gaming, OKR vs KPI |

---

## Bài 1 — Vai trò & dòng chảy thông tin kế toán quản trị

### Phần A — Cơ bản

**Định nghĩa.** Kế toán quản trị (managerial accounting) là quá trình **nhận diện, đo lường,
phân tích, chuẩn bị và truyền đạt** thông tin tài chính – phi tài chính để nhà quản trị
đạt **mục tiêu của tổ chức** (theo định nghĩa kinh điển của IMA – Institute of Management
Accountants).

**Bảng so sánh hai nhánh:**

| Tiêu chí | Kế toán quản trị | Kế toán tài chính |
|----------|------------------|-------------------|
| Người dùng | Quản lý nội bộ | Cổ đông, thuế, ngân hàng |
| Thời gian | Chủ yếu **tương lai** + quá khứ gần | **Quá khứ** (đã phát sinh) |
| Tính bắt buộc | Không bắt buộc | Bắt buộc theo chuẩn (VAS/IFRS) |
| Phạm vi | Rất chi tiết (theo bộ phận, sản phẩm, khách hàng) | Tổng hợp theo công ty/báo cáo |
| Tần suất | Hàng ngày/tuần/tháng | Quý/năm |
| Trọng tâm | Tính **hữu ích** | Tính **đúng chuẩn, kiểm toán được** |

**Dòng chảy thông tin (bốn bước):**

1. **Thu thập**: chứng từ, nhật ký sản xuất, hệ thống ERP (SAP, Odoo, FastMoney...).
2. **Phân loại**: biến đổi vs cố định, trực tiếp vs gián tiếp, theo bộ phận.
3. **Phân tích & báo cáo**: báo cáo hiệu quả bộ phận, biểu đồ chi phí, dự toán.
4. **Truyền đạt**: bảng điều khiển (dashboard), họp giao ban tháng, cảnh báo dự kiến.

**Nhóm chi phí theo hai trục:**

- **Theo hành vi (behavior)**: $TC = FC + VC \times Q$
  - Chi phí cố định (FC): tiền thuê nhà máy, lương quản lý — **không đổi** trong relevant range.
  - Chi phí biến đổi (VC): nguyên liệu, tiền lương sản xuất theo sản lượng — **đổi tỷ lệ** với $Q$.
- **Theo mối quan hệ với sản phẩm**:
  - Trực tiếp (direct): nguyên liệu chính, lương công nhân lắp ráp.
  - Gián tiếp (indirect): chi phí xưởng (overhead): điện nước xưởng, khấu hao máy, bảo trì.

**Ví dụ đơn giản.** Xưởng sản xuất 10.000 hộp/tháng. Nguyên liệu $25.000$, nhân công trực
tiếp $15.000$, điện nước xưởng $5.000$, tiền thuê $10.000$, quản lý xưởng $7.000$.

- Chi phí biến đổi = $25.000 + 15.000 = 40.000$ → $VC/unit = 40.000 / 10.000 = 4$ (đ).
- Chi phí cố định = $5.000 + 10.000 + 7.000 = 22.000$.
- Tổng = $62.000$ → chi phí bình quân $6,2$/hộp; **nhưng** nếu chỉ sản xuất 8.000 hộp,
  chi phí biến đổi = $32.000$, cố định vẫn $22.000$ → tổng $54.000$, bình quân $6,75$.
  → Chi phí bình quân **tăng khi sản lượng giảm** (do phân bổ FC) — cốt lõi của toàn bộ môn học.

### Phần B — Nâng cao

**Relevant range (phạm vi liên quan).** Hành vi "FC cố định, VC tuyến tính" chỉ đúng trong
một khoảng sản lượng. Qua ngưỡng đó phải **mở rộng xưởng, tăng ca, mua máy mới** — FC "bước
tang" (step-fixed cost). Nhà quản trị giỏi luôn nói: *"FC là cố định VỚI MỨC SẢN XUẤT NÀY."*

**Đơn vị kinh doanh và trách nhiệm (responsibility center):**

| Loại | Đo bằng | Người chịu trách nhiệm |
|------|---------|------------------------|
| Chi phí (cost center) | Chi phí | Giám đốc sản xuất, IT |
| Doanh thu (revenue center) | Doanh thu | Trưởng vùng bán hàng |
| Lợi nhuận (profit center) | Lợi nhuận = DT − TC | Giám đốc chi nhánh |
| Đầu tư (investment center) | ROI / EVA | CEO, tổng giám đốc công ty con |

**Định giá chuyển giao (transfer pricing)** — bài toán kinh điển: chi nhánh A bán thành phẩm
cho chi nhánh B. Giá quá cao → B lỗ, Giám đốc B kiện; giá quá thấp → A lỗ, dòng tiền thuế
thay đổi. Phương pháp: chi phí biến đổi, chi phí biến đổi + %, giá thị trường. Trong tập đoàn
quốc tế, giá chuyển giao phải **gần giá thị trường** để tránh bị cơ quan thuế điều chỉnh
(chống chuyển giá — transfer pricing regulation).

**Tranh luận học thuật.** Kế toán quản trị "không chuẩn hóa" tạo **rủi ro đạo đức**: quản lý
có thể chọn cách phân bổ chi phí "đẹp sổ" để tăng lợi nhuận bộ phận. Trường phái **kế toán
xã hội (social accounting)** và **kế toán hành vi (behavioral accounting)** nhấn mạnh: báo cáo
quản trị cũng phải **minh bạch, chống gaming** — giống như thiết kế trò chơi (game design):
mọi KPI đều bị "chơi" nếu thiếu kiểm soát.

**Giới hạn.** Thông tin quản trị không kiểm toán độc lập; dữ liệu phụ thuộc hệ thống; chi phí
thu thập thông tin đôi khi **vượt giá trị của nó** (cost-benefit constraint) — nguyên tắc nền
tảng: chỉ thu thập thông tin khi **lợi ích > chi phí thu thập**.

### Phần C — Thực tế

**Áp dụng vào doanh nghiệp.** Một công ty sản xuất bia địa phương (giả định) chuyển từ báo
cáo "chi phí cả nhà máy" sang **theo từng dòng sản phẩm** (lon, thùng, chai 1L) và phát hiện:
dòng chai 1L chiếm 40% sản lượng nhưng chỉ đóng góp 12% lợi nhuận gộp do chi phí đóng chai
tay cao. Quyết định: ưu tiên tự động hóa dây chuyền chai hoặc tăng giá.

**Case – General Motors & chi phí trên mỗi ô tô (case kinh điển của Harvard):** đội thiết kế
được báo "chi phí đơn vị" **chỉ gồm chi phí biến đổi** → liên tục thêm option đắt tiền (nhựa,
đèn, tiện ích) vì "đơn vị vẫn dưới chuẩn". Chi phí biến đổi tăng mà không ai nhìn tổng thể.
Bài học: **mỗi bộ phận cần thấy TOÀN BỘ chi phí liên quan đến quyết định của mình**.

**Case generic – Công ty nhựa Việt Nam:** kế toán chia chi phí xưởng theo **số giờ chạy
máy**, nhưng máy chạy 24/7 cho cả hàng tồn kho cũ → sản phẩm mới (sản lượng nhỏ) bị gánh
phần chi phí khổng lồ, bị báo lỗ và suýt ngừng sản xuất. Sai lầm: **phân bổ theo công suất
không dùng thay vì theo hoạt động thực tế** (bài 4 sẽ sửa bằng ABC).

**Lỗi thường gặp của quản lý Việt Nam:**

1. **Nhầm lẫn kế toán quản trị với kế toán thuế**: dùng sổ thuế để ra quyết định kinh doanh.
2. **Không tách cố định/biến đổi**: "chi phí bình quân 10.000đ/sp" rồi nhân với 50.000 sp
   để dự báo → sai trầm trọng ở mức 50.000.
3. **Báo cáo tháng chậm 15–20 ngày** → quyết định đã mất cơ hội.
4. **Giao chi phí thay vì giao trách nhiệm lợi nhuận**: bộ phận chỉ "tiết kiệm chi phí"
   làm giảm chất lượng, khách hàng bỏ.
5. **Thu thập dữ liệu quá đắt**: Excel 20 sheet, mỗi tháng 3 người ngồi nhập tay.

**Checklist công cụ:**

- [ ] Đã lập bảng **TC = FC + VC×Q** cho từng dòng sản phẩm trong relevant range chưa?
- [ ] Mỗi bộ phận có **responsibility center** và người chịu trách nhiệm rõ chưa?
- [ ] Báo cáo quản trị ra **trước ngày X của tháng sau** chưa?
- [ ] Có quy định **ngưỡng cảnh báo** (ví dụ chênh lệch >10% phải giải trình) chưa?
- [ ] Dữ liệu có **1 nguồn sự thật duy nhất** (single source of truth) chưa?

#### Ứng dụng thực tế

Lập bảng "3 phút chi phí" cho bất kỳ quyết định nào: (1) chi phí **biến đổi** tăng thêm nếu
chấp nhận; (2) **doanh thu/giá trị** tăng thêm; (3) chênh lệch = kết luận nhận/thứ/bán. Áp
dụng ngay cho: nhận đơn hàng lớn giá thấp, thuê thêm nhân sự, mua máy mới.

#### Câu hỏi phỏng vấn xin việc

1. **Phân biệt kế toán quản trị và kế toán tài chính cho tôi.**
   *Gợi ý:* Người dùng – nội bộ vs bên ngoài; thời gian – tương lai vs quá khứ; chuẩn –
   tùy mục đích vs bắt buộc VAS/IFRS; chi tiết theo bộ phận vs tổng hợp.
2. **Chi phí cố định là gì? Có thực sự cố định không?**
   *Gợi ý:* Không đổi trong relevant range; qua ngưỡng sản lượng phải mở rộng → step-fixed;
   luôn nêu phạm vi sản lượng khi nói "cố định".
3. **Quản lý bộ phận nên chịu trách nhiệm về chi phí hay lợi nhuận?**
   *Gợi ý:* Profit center nếu có thể kiểm soát doanh thu và chi phí; chỉ giao chi phí khi
   họ **không kiểm soát** được doanh thu; tránh tiêu chí khiến họ tối ưu local nhưng hại tổng.

---

## Bài 2 — Kế toán chi phí: Hấp thụ vs Biến đổi

### Phần A — Cơ bản

**Hai cách "gói" chi phí sản xuất:**

- **Định giá theo hấp thụ (absorption/Full costing)** — **bắt buộc cho báo cáo tài chính và
  thuế**: mọi chi phí sản xuất (nguyên liệu, nhân công trực tiếp **và cả chi phí xưởng gián
  tiếp, kể cả cố định**) đều **vào giá vốn hàng bán (COGS)** khi hàng bán đi, phần còn lại
  "ngủ" trong **tồn kho**.
- **Định giá theo biến đổi (variable/direct costing)** — **dùng cho nội bộ**: chỉ chi phí
  **biến đổi** vào giá trị hàng tồn kho; toàn bộ **chi phí xưởng cố định** được coi là
  **chi phí kỳ (period cost)**, trừ ngay vào lãi lỗ kỳ.

**Công thức:**

Giá trị tồn kho hấp thụ:

$$GI_{abs} = (NL + NCTT + \text{CXX gián tiếp biến đổi} + \text{CXX gián tiếp cố định phân bổ}) \times SL_{tồn}$$

Giá trị tồn kho biến đổi:

$$GI_{var} = (NL + NCTT + \text{CXX gián tiếp biến đổi}) \times SL_{tồn}$$

Chênh lệch lợi nhuận giữa hai phương pháp:

$$\Delta L = \Delta \text{tồn kho} \times \text{CXX cố định đơn vị}$$

**Ví dụ tính số.** Sản xuất 10.000 sp, bán 7.000 sp, tồn 3.000 sp.

- Biến đổi/sp: NL 40 + NCTT 30 + CXX gián tiếp biến đổi 10 = **80.000đ**
- CXX cố định kỳ: **300.000.000đ** → 30.000đ/sp khi phân bổ trên 10.000 sp.
- Giá hấp thụ = 110.000đ/sp; giá biến đổi = 80.000đ/sp.
- Tồn kho hấp thụ = $3.000 \times 110.000 = 330.000.000$; tồn biến đổi = $3.000 \times 80.000 = 240.000.000$.
- **Lợi nhuận hấp thụ cao hơn 90.000.000đ** = $3.000 \times 30.000$.

**Bảng tổng hợp (đơn vị: triệu đồng):**

| Hạng mục | Hấp thụ | Biến đổi |
|----------|---------|----------|
| Doanh thu (7.000 sp × 150) | 1.050.000 | 1.050.000 |
| Biến đổi hàng bán (7.000 × 80) | 560.000 | 560.000 |
| CM (contribution margin) | 490.000 | 490.000 |
| CXX cố định kỳ | — (đã vào tồn kho: 210.000) | 300.000 |
| COGS hấp thụ (7.000 × 110) | 770.000 | — |
| Lợi nhuận | **280.000** | **190.000** |
| Kiểm tra | 190.000 + 90.000 (tồn kho) = 280.000 ✓ | |

→ Lợi nhuận **khác nhau do tồn kho khác nhau**; nếu sản xuất = bán thì **giống hệt nhau**.

### Phần B — Nâng cao

**"Lợi nhuận inventory profit" — bẫy thao túng.** Tăng sản lượng dư thừa → tồn kho tăng →
CXX cố định dồn vào tồn kho → lợi nhuận báo cáo **tăng dù không bán thêm được gì**. Đây là
chiêu quen thuộc trước khi bán doanh nghiệp hoặc trước kỳ đánh giá. Chuẩn kế toán có quy
tắc **hạn chế dồn chi phí vượt nhu cầu bán dự kiến** (nghiên cứu "income smoothing qua
overproduction" của các tác giả kế toán học thuật), nhưng kiểm toán cũng chỉ dùng **ngưỡng
hợp lý** chứ không loại bỏ hoàn toàn.

**Kế toán giá gốc absorption**: khi CXX cố định thực tế **thay đổi** (under/over-applied
overhead), phải phân bổ giữa COGS, tồn kho, hàng bán dở dang — ảnh hưởng trực tiếp lợi nhuận.

**Định giá biến đổi và quản trị:** vì CM (contribution margin) không bị chi phí cố định
"che", yönetici nhìn rõ **mỗi sp đóng góp bao nhiêu cho việc gánh cố định & lãi**.

**Tranh luận:** Absorption **bắt buộc** cho mục tiêu thuế (nhiều quốc gia không cho trừ toàn
bộ CXX cố định ngay), nhưng **phản khoái quyết định** (decision-useful) kém. **Giải pháp kép
bộ đôi sổ sách**: một bên statutory (absorption), một bên management (variable) — chi phí
phụng sự ~ không lớn nếu dùng ERP đúng.

**Giới hạn:** Đơn vị phân bổ cố định phụ thuộc **công suất định mức** (budgeted capacity) —
chọn công suất định mức thấp hơn thực tế → chi phí cố định/unit **vừa cao** vừa "nhân tạo",
cám dỗ giảm công suất định mức để "đẹp" báo cáo.

### Phần C — Thực tế

**Case – Nhà máy giày da xuất khẩu (generic):** tháng 11 khách hàng châu Âu đặt 50.000 đôi
giá tốt, nhưng sản lượng bình thường 40.000. Giám đốc sản xuất hưng phấn: tăng 25% → chi phí
cố định/unit giảm → lợi nhuận hấp thụ nhảy. Tuy nhiên tháng 12 đơn hàng chỉ 10.000 đôi →
tồn kho 30.000 đôi, tiền mặt đọng, hàng lỗi theo mùa. **Lỗi: đánh giá dựa trên lợi nhuận
absorption thay vì dòng tiền & nhu cầu thực.**

**Case – Bia, dệt may, điện tử tại Việt Nam:** dùng absorption cho mục tiêu thuế (đúng luật),
nhưng **dashboard nội bộ** dùng variable costing + CMR; khi so sánh hiệu quả chi nhánh, đều
quy về **biến đổi** để không trừng phạt chi nhánh có tồn kho cao.

**Lỗi thường gặp của quản lý Việt Nam:**

1. Dùng **giá absorption** làm **giá bán tối thiểu** → bỏ lỡ đơn hàng giá cao hơn biến đổi
   nhưng chưa bù cố định ngắn hạn (đặc biệt khi còn dư công suất).
2. **Không hiểu vì sao lợi nhuận tháng sản lượng cao lại "đẹp"** — tới khi bán chậm mới tá hỏa.
3. **Định giá nội bộ** dùng absorption → chi nhánh cạnh tranh ngoài bị thiệt.
4. **Quên under/over-applied overhead** cuối kỳ — để nguyên trên báo cáo, lợi nhuận méo.
5. Dồn hàng tồn kho cuối kỳ để **đạt chỉ tiêu** — rủi ro kiểm toán, rủi ro tiền mặt.

**Checklist công cụ:**

- [ ] Có **hai báo cáo** (absorption cho thuế/BCTC, variable cho quyết định) chưa?
- [ ] Chênh lệch absorption–variable = Δ tồn kho × CXX cố định/unit có **khớp kiểm tra** chưa?
- [ ] CXX cố định phân bổ có dùng **công suất định mức hợp lý** không?
- [ ] Cảnh báo tồn kho vượt **X ngày bán** (DSO tồn kho) trên dashboard chưa?
- [ ] Quy trình **under/over-applied overhead** cuối kỳ rõ chưa?

#### Ứng dụng thực tế

Khi sếp hỏi *"Tại sao tháng này lãi cao?"* — luôn trả lời bằng cách **tách 3 vế**:
(1) bán được bao nhiêu (CM), (2) sản xuất vượt bán bao nhiêu (Δ tồn kho), (3) chi phí cố
định thực tế so với phân bổ. Chỉ vế 1 là cải thiện bền vững.

#### Câu hỏi phỏng vấn xin việc

1. **Trường hợp nào lợi nhuận absorption khác biến đổi?**
   *Gợi ý:* Khi tồn kho thay đổi giữa hai kỳ; $\Delta L = \Delta GI \times CXX_{fixed/unit}$;
   bằng nhau khi sản xuất = bán.
2. **Bạn chọn phương pháp nào cho quyết định giá tối thiểu?**
   *Gợi ý:* Variable costing + CMR, với điều kiện còn dư công suất và đơn hàng ngắn hạn;
   absorption cho dài hạn giá sàn, vì mọi chi phí cuối cùng phải được bù.
3. **Làm sao phát hiện quản lý "sản xuất dư để làm đẹp lãi"?**
   *Gợi ý:* Tỷ lệ tồn kho/doanh thu tăng bất thường, sản lượng >> đơn hàng ký, chi phí
   cố định/unit giảm "đẹp" bất thường, dòng tiền từ hoạt động SX kinh doanh giảm ngược.

---

## Bài 3 — Phân tích CVP & điểm hòa vốn

### Phần A — Cơ bản

**CVP (Cost–Volume–Profit)** trả lời: *bán bao nhiêu thì đủ lời? Lãi nhất khi nào? Rủi ro
khi không đạt doanh thu là gì?*

**Biên đóng góp (CMR – contribution margin ratio):**

$$CMR = \frac{P - VC}{P} = \frac{CM}{Doanh thu}$$

**Điểm hòa vốn doanh thu (BEP – break-even point):**

$$BEP_{doanh thu} = \frac{FC}{CMR}$$

**Điểm hòa vốn khối lượng:**

$$BEP_{SL} = \frac{FC}{P - VC}$$

**Doanh thu mục tiêu với lợi nhuận mong muốn $T$:**

$$Doanh thu_{mục tiêu} = \frac{FC + T}{CMR}$$

**Ví dụ tính số.** Quán cà phê: giá 45.000đ/cốc, VC 18.000đ/cốc, FC hàng tháng
(truyền thông, lương cố định, tiền thuê) 270.000.000đ.

- CM = $45.000 - 18.000 = 27.000$; CMR = $27.000/45.000 = 0,6$ (60%).
- $BEP_{SL} = 270.000.000 / 27.000 = 10.000$ cốc/tháng ≈ **333 cốc/ngày** (30 ngày).
- $BEP_{dt} = 270.000.000 / 0{,}6 = 450.000.000$đ/tháng.
- Muốn lãi 90.000.000đ: $DT = (270 + 90)/0{,}6 = 600.000.000$đ → 13.334 cốc.

**Đòn bẩy vận trình (DOL – degree of operating leverage):**

$$DOL = \frac{CM}{L_{thuần}} = \frac{CM}{CM - FC}$$

DOL = 3 nghĩa: doanh thu tăng 1% → lợi nhuận tăng 3%.

### Phần B — Nâng cao

**Điểm hòa vốn nhạy cảm với giả định:**

1. **Đa sản phẩm**: dùng **doanh số hỗn hợp (sales mix)**. Công thức BEP theo doanh thu vẫn
   $FC / CMR_{hỗn hợp}$, nhưng CMR hỗn hợp thay đổi khi mix thay đổi → phải tính theo **từng
   kịch bản mix**, không dùng một CMR cho mọi tình huống.
2. **Vốn hóa (capital-intensive)**: FC lớn → BEP cao → rủi ro lớn khi cầu yếu, nhưng DOL cao
   → lợi nhuận bùng nổ khi qua BEP. Ngược lại, dịch vụ FC thấp → BEP thấp, an toàn hơn.
3. **Bước nhảy chi phí (step costs)**: qua 10.000 sp/tháng phải thuê thêm ca → FC "nhảy"
   → BEP nhảy vọt. CVP tuyến tính mất hiệu lực, cần **đồ thị rời rạc theo dải**.
4. **Thuế & chi phí bán hàng theo % doanh thu**: điều chỉnh $P_{thuần} = P \times (1 - t)$
   hoặc đưa vào VC như một khoản VC%.

**Dòng chi phí hoạt hình (relevant range) & thời gian**: CVP là mô hình **ngắn hạn** —
trong dài hạn mọi chi phí đều biến đổi được (FC có thể thành VC khi ký lại hợp đồng, giảm
nhân sự...). Tranh luận: **không tồn tại chi phí cố định tuyệt đối, chỉ có chi phí "chưa
quyết định đổi"** (chủ nghĩa kinh tế hành vi).

**Chỉ số an toàn (margin of safety):**

$$MS = \frac{Doanh thu thực tế - BEP}{Doanh thu thực tế}$$

MS = 20% → doanh thu giảm 20% mới lỗ.

**Đòn bẩy tổng hợp (DTL)**: $\% \Delta L / \% \Delta DT$, kết hợp DOL với đòn bẩy tài chính
($DFL = EBIT/(EBIT - I)$).

**Giới hạn CVP:**

- Giả định giá & VC **tuyến tính** trong relevant range — thực tế giá giảm khi bán số lượng
  (chiết khấu), VC/unit giảm theo learning curve.
- Giả định **doanh số hỗn hợp ổn định** — hiếm khi đúng.
- **Bỏ qua thời điểm dòng tiền**: một tháng BEP nhưng dòng tiền âm vì phải trả nhà trước.

### Phần C — Thực tế

**Case – Chuỗi trà sữa (generic):** 1 cửa hàng: giá 45k, VC 18k, FC 40tr/tháng → BEP
28.889 cốc ≈ 963 cốc/ngày → **vô lý** → mở rộng 4 cửa hàng, FC hành chính chung chia đều
10tr/cửa hàng → BEP còn ~600 cốc/ngày. Bài học: **đừng tính BEP cho một cửa hàng đơn lẻ khi
còn chi phí chung chưa phân bổ hợp lý**; đồng thời tính BEP **theo dòng tiền** (tiền thuê
đặt cọc, thiết bị trả góp trước).

**Case – Công ty phần mềm nội địa (giả định):** từ bán trọn gói (giá thấp, FC đội ngũ hỗ
trợ cao) chuyển sang **SaaS thuê bao** → VC gần như = 0, FC tăng (server, CS) → CVP đảo
ngược: rủi ro cao hơn lúc chưa đủ khách, nhưng khi vượt BEP CMR ~95% → lợi nhuận nhân
gấp nhiều lần. Phân tích CVP giúp **định hình lại mô hình kinh doanh**.

**Lỗi thường gặp của quản lý Việt Nam:**

1. **Nhầm CM với lợi nhuận**: "mỗi món lời 27k" rồi nghĩ qua BEP là có lãi thật.
2. **Quên phân bổ FC chung** (quảng cáo, lương văn phòng) → BEP **thấp ảo**.
3. **Không tính theo dòng tiền** → hòa vốn trên sổ nhưng **chết vì thiếu tiền mặt**.
4. **Dùng một CMR cho 20 sản phẩm** → sai khi mix thay đổi.
5. **Bỏ qua chiết khấu bán buôn** — VC thực tế cao hơn vì chiết khấu.

**Checklist công cụ:**

- [ ] Bảng CVP cho **3 kịch bản** (kịch bản, kỳ vọng, xấu nhất) chưa?
- [ ] BEP tính theo **dòng tiền** lẫn **kế toán** chưa?
- [ ] CMR hỗn hợp tính theo **sales mix hiện tại** và mix dự kiến chưa?
- [ ] **Margin of safety** và DOL hiển thị trên dashboard chưa?
- [ ] Đã kiểm tra **step costs** (ca sản xuất, mặt bằng) ở mức sản lượng mục tiêu chưa?

#### Ứng dụng thực tế

Mỗi khi xem xét **giá khuyến mãi**: giảm 10% giá → CMR từ 60% còn bao nhiêu? BEP tăng bao
nhiêu? Doanh số cần tăng % nào để **về lại cùng lãi**? Công thức nhanh: doanh số cần tăng
$\approx \dfrac{\% \text{giảm giá}}{\% \text{CMR giảm}}$ (xấp xỉ, dùng số cụ thể để chắc chắn).

#### Câu hỏi phỏng vấn xin việc

1. **Tính BEP cho tôi với P=100, VC=60, FC=400.000.000.**
   *Gợi ý:* CM=40, CMR=0,4; BEP_SL = 10.000.000 sp; BEP_dt = 1.000.000.000đ.
2. **Doanh nghiệp đang lỗ, đơn giá > VC, nên ngừng hay tiếp tục?**
   *Gợi ý:* Ngắn hạn: tiếp tục nếu có khách hàng kỳ vọng (đóng góp bù FC và dòng tiền);
   dài hạn: phải tái cấu trúc FC hoặc cải thiện CM, vì FC không giảm mãi được. Nêu thêm
   yếu tố danh tiếng/khách hàng trung thành và **không thể đảo ngược** (reputational cost).
3. **DOL=4 có ý nghĩa gì với rủi ro?**
   *Gợi ý:* Lợi nhuận nhạy gấp 4 lần doanh thu — "con dao hai lưỡi": dư địa tăng nhanh khi
   tốt, nhưng sụt sâu khi cầu yếu; kết hợp xem BEP & margin of safety để đo rủi ro.

---

## Bài 4 — Kế toán chi phí theo hoạt động (ABC/ABM)

### Phần A — Cơ bản

**ABC (Activity-Based Costing)** — phân bổ chi phí gián tiếp theo **hoạt động thực sự gây
ra chi phí (cost driver)** thay vì máy mốc như giờ chạy máy, số lao động.

**Ba bước ABC:**

1. **Nhóm chi phí** vào **pool chi phí** (đặt hàng, kiểm tra chất lượng, bảo trì máy, cấp
   phát vật tư...).
2. Xác định **đơn vị đo hoạt động (activity driver)**: số lần đặt hàng, số lượt kiểm tra,
   số giờ bảo trì, số lệnh sản xuất.
3. **Phân bổ** sang sản phẩm theo: $Cost_{sp} = \sum (Rate_{hoạt động} \times SL_{driver})$

**Ví dụ tính số.** Xưởng có 3 pool:

| Pool | Chi phí (tr) | Driver | SL driver | Rate |
|------|--------------|--------|-----------|------|
| Đặt hàng mua | 300 | Lần đặt hàng | 1.000 lần | 300.000đ/lần |
| Kiểm tra chất lượng | 450 | Lần kiểm tra | 9.000 lần | 50.000đ/lần |
| Bảo trì máy | 750 | Giờ bảo trì | 5.000 giờ | 150.000đ/giờ |

Sản phẩm A (ít, phức tạp): 20 lần đặt, 100 lần kiểm tra, 40 giờ bảo trì:

$$Cost_A = 20 \times 300k + 100 \times 50k + 40 \times 150k = 6tr + 5tr + 6tr = 17tr$$

Truyền thống (phân bổ theo giờ máy, A dùng 50/1.000 giờ): $1.500tr \times 5\% = 75tr$ —
**hoàn toàn khác** vì sản phẩm A "gây ra" nhiều hoạt động đặt hàng/kiểm tra hơn tỷ trọng giờ máy.

**ABM (Activity-Based Management)**: dùng ABC để **loại bỏ hoạt động không tạo giá trị**
(kiểm tra lại, chờ đợi, giấy tờ dư thừa) — kết hợp lean thinking.

### Phần B — Nâng cao

**Phân tầng chi phí (hierarchical costing):** chi phí tồn tại ở 3 tầng — unit-level (nguyên
liệu), batch-level (đặt hàng, setup), product-level (thiết kế, giấy phép), facility-level
(tiền thuê). ABC truyền thống đôi khi lẫn → cần **Time-Driven ABC (TDABC)** của Kaplan &
Anderson: ước tính **chi phí /phút năng lực** × **thời gian cần** cho từng hoạt động —
đơn giản hơn, dễ cập nhật hơn.

**Tranh luận & giới hạn:**

- **Chi phí – lợi ích**: ABC tốn kém (thu thập dữ liệu hoạt động, phân bổ theo thời gian).
  Nghiên cứu thực tế cho thấy nhiều doanh nghiệp **dựng ABC rồi bỏ** vì không ai dùng.
- **Phân bổ vẫn là ước lượng**: rate sai thì kết quả sai — ABC **giảm sai** chứ không
  **loại bỏ sai**.
- **Bộ nhớ lịch sử (activity-based “cost of nothing”)**: theo dõi mọi hoạt động → dữ liệu
  quá dày, báo cáo không ai đọc.
- **Mối liên hệ với chiến lược**: ABC cho thấy **sản phẩm ít ồn ào, đơn lẻ tốn kém hơn**
  → chiến lược: tăng giá cho đơn nhỏ, số hóa đơn hàng tự động, gộp lô.

**Tương tác với absorption/variable:** ABC **cải thiện bước phân bổ** CXX gián tiếp —
dùng trong cả hai phương pháp; bản chất ABC trả lời *"phân bổ thế nào đúng hơn"*, absorption
& variable trả lời *"phân bổ vào đâu, kỳ hay tồn kho"*.

### Phần C — Thực tế

**Case – Nhà máy dệt (generic):** Theo ABC, đơn hàng 500m của khách lẻ tốn 8 triệu chi phí
vận hành đơn (setup + kiểm tra + giao lẻ) trong khi đơn 5.000m chỉ tốn 2,5 triệu. Trước đó
cùng "giá/mét" → đơn nhỏ **thực ra lỗ**. Quyết định: **đơn tối thiểu 2.000m** hoặc **phụ
thu đơn nhỏ 15%** → biên lợi nhuận nhảy, đội sales đổi cách chào hàng.

**Case – Công ty logistic nội địa (giả định):** giao hàng "tiêu chuẩn" tính phí như nhau
nhưng ABC chỉ ra: giao chung cư tầng 7 không thang máy tốn gấp 2,5 lần giao nhà phố.
Định giá mới: **phụ thu theo điều kiện giao hàng** — khách khó tính vẫn trả, doanh nghiệp
dừng lỗ âm thầm.

**Lỗi thường gặp của quản lý Việt Nam:**

1. Phân bổ CXX theo **doanh thu hoặc giá trị nguyên liệu** — đơn giá cao bị bù chi phí
   không thuộc về nó.
2. **Làm ABC quá khổ** (theo 500 hoạt động) rồi không ai dùng → nên bắt đầu với 10–15
   hoạt động chiếm 80% chi phí.
3. **Quên chi phí batch/product level**: chỉ nhìn unit cost rồi kinh ngạc khi đơn nhỏ lỗ.
4. Dùng ABC cho **quyết định ngắn hạn sai**: chi phí phân bổ không phải chi phí phát sinh
   thêm (không relevant nếu không đổi hoạt động).

**Checklist công cụ:**

- [ ] Danh sách **10–15 hoạt động chính** (theo Pareto chi phí) chưa?
- [ ] **Driver** có đo được, dễ thu thập, gắn với **nguyên nhân** chi phí chưa?
- [ ] So sánh ABC vs truyền thống cho **3 sản phẩm đại diện** để thấy chênh lệch chưa?
- [ ] Có quy định **ngưỡng giá đơn nhỏ** (phụ thu / đơn tối thiểu) chưa?
- [ ] ABC có được **dùng trong giá & KPI** (không chỉ trình bày đẹp) chưa?

#### Ứng dụng thực tế

Áp dụng **TDABC nhanh**: ước tính chi phí nhân sự + máy của bộ phận / phút công suất →
mỗi quy trình (đơn hàng, báo giá, xử lý trả hàng) × thời gian trung bình = **giá dịch vụ
nội bộ**. Bảng tính 1 trang, đủ để tranh luận về hiệu quả.

#### Câu hỏi phỏng vấn xin việc

1. **ABC khác gì phân bổ truyền thống? Cho ví dụ.**
   *Gợi ý:* ABC theo driver hoạt động (đặt hàng, kiểm tra) phản ánh nguyên nhân; truyền
   thống theo máy mốc (giờ máy, doanh thu) → ABC lộ ra chi phí thật của đơn nhỏ/phức tạp.
2. **Khi nào không nên dùng ABC?**
   *Gợi ý:* Chi phí thu thập > lợi ích; chi phí đồng nhất (ngành hàng hóa); dữ liệu driver
   không thu thập được; hoặc chỉ cần quyết định ngắn hạn đơn giản (relevant cost là đủ).
3. **ABC phát hiện sản phẩm A lỗ — bạn làm gì tiếp?**
   *Gợi ý:* Kiểm tra driver & rate; tính CM thực tế (ABC gồm cả batch/product cost);
   phương án: tăng giá, giảm setup (SMED), gộp đơn, loại khỏi danh mục nếu CM<0 sau tối ưu.

---

## Bài 5 — Ngân sách: Master budget & ngân sách linh hoạt

### Phần A — Cơ bản

**Ngân sách (budget)** là **kế hoạch số hóa** về doanh thu, chi phí, dòng tiền, tài sản –
nợ phải trả cho kỳ tương lai. **Master budget** = toàn bộ các ngân sách con:

```
Ngân sách bán hàng (sales budget)
        ↓
Ngân sách sản xuất (production budget, theo SL = bán + tồn cuối − tồn đầu)
        ↓
Ngân sách NL, NCTT, CXX (direct materials/labor/overhead)
        ↓
Ngân sách chi phí bán hàng & QLDN (SG&A)
        ↓
Kết quả dự kiến (budgeted income statement)
        ↓
Ngân sách dòng tiền (cash budget: thu − chi = dự trữ)
        ↓
Ngân sách cân đối (balance sheet dự kiến)
```

**Công thức then chốt:**

$$SL_{sản xuất} = SL_{bán} + Tồn_{cuối} - Tồn_{đầu}$$

$$Tiền_{cuối} = Tiền_{đầu} + Thu - Chi$$

**Ví dụ:** bán 10.000 sp, tồn đầu 1.500, tồn cuối 2.000 → sản xuất $10.000 + 2.000 -
1.500 = 10.500$ sp. NL 2kg/sp, tồn NL đầu 1 tấn, cuối 1,2 tấn → mua $21.000 + 1.200 -
1.000 = 21.200$kg.

**Ngân sách linh hoạt (flexible budget)**: ngân sách được **tính lại theo mức sản lượng /
doanh thu thực tế** — nhờ đó tách **chênh lệch do "không đạt kế hoạch"** khỏi **chênh lệch
do "chi tiêu bất thường"**.

$$Flexible\ budget\ cost = FC_{ngân sách} + VC_{đơn vị} \times Q_{thực}$$

### Phần B — Nâng cao

**Tham gia & phản kháng (participative budgeting).** Ngân sách "từ trên xuống" nhanh nhưng
bị **phản kháng** (người thực hiện không cam kết, "thắt nút ngân sách" — budgetary slack).
Ngân sách "từ dưới lên" cam kết cao nhưng dễ **phình to** (xin dư để dễ đạt). Phương pháp
lai: **bottom-up với review ngang hàng (roll-up + challenge)**. Nghiên cứu hành vi cho thấy:
khi ngân sách **gắn với thưởng**, nhân viên hành xử **ngắn hạn** — đây là "giới hạn đạo đức"
của budget itself (chủ đề "Beyond Budgeting" của(jLabel Jensen & Røhnebæk — triết lý:
dùng **guidance, rolling forecast, mục tiêu relative** thay ngân sách cứng).

**Rolling forecast (dự báo cuộn):** luôn dự báo **12 tháng tới**, cập nhật mỗi tháng —
thích nghi với môi trường biến động (không chờ cuối năm mới sửa).

**Ngân sách zero-based (ZBB)**: mọi khoản phải **biện minh từ 0**, không lấy năm trước +
x%. Khắc phục inertia nhưng **tốn công**, thường dùng cho chi phí SG&A, marketing.

**Ngân sách dựa trên hoạt động (ABB)**: ngân sách theo **pool hoạt động** (gắn với ABC) —
thông minh hơn nhưng phức tạp.

**Tranh luận:** Ngân sách có **giá trị đạo đức & quản trị** (kỷ luật, kế hoạch, giao cam
kết) nhưng cũng **gây gaming**: dồn chi tiêu cuối năm ("use it or lose it"), ẩn dự phòng,
cắt R&D để đạt chỉ tiêu quý. Câu hỏi lớn: **ngân sách nên là công cụ kế hoạch hay công cụ
kiểm soát?** Câu trả lời MBA: **cả hai, nhưng luôn đo bằng ngân sách linh hoạt để không
trừng phạt người chịu rủi ro thị trường.**

**Giới hạn:** Dữ liệu đầu vào (dự báo bán hàng) sai → cả chuỗi sai ("garbage in, gospel
out"); chi phí cơ hội của lập ngân sách bị đánh giá thấp.

### Phần C — Thực tế

**Case – Công ty FMCG (generic):** tháng 6 doanh số thấp hơn dự kiến 20%. Nếu so chi phí
thực với **ngân sách gốc**, mọi bộ phận đều "tiết kiệm giỏi" — nhưng thực tế chi phí bán
hàng/unit **tăng 12%** (phí ship lẻ, khuyến mãi dày hơn). So với **flexible budget** (theo
khối lượng thực) mới lộ ra: chỉ tiêu "tiết kiệm" là ảo, **hiệu quả thực giảm**.

**Case – Nhà hàng chuỗi tại Việt Nam (giả định):** dùng **master budget + rolling forecast
3 tháng**; mỗi cửa hàng có ngân sách FC "cố định theo hợp đồng" và VC theo khách; khi lượng
khách giảm 15%, dashboard tự tính flexible budget → phát hiện cửa hàng A vẫn "đạt ngân sách
chi phí" nhưng chi phí/khách vượt 18% → xử lý kịp, tránh giả định "cố được ngân sách là
giỏi".

**Lỗi thường gặp của quản lý Việt Nam:**

1. **Ngân sách = mục tiêu thách thức (stretch) rồi dùng để kiểm tra** → bất công kép:
   cả người không đạt vì thị trường lẫn người "đạt" nhờ ẩn dự phòng.
2. **Không tách tồn kho & mua sắm khỏi ngân sách dòng tiền** → "lợi nhuận có mà tiền không".
3. **Phòng tài chính ôm làm một mình** → không ai sở hữu ngân sách của mình.
4. **Không theo lại**: January budget "đóng băng" 12 tháng, đến tháng 11 mới phát hiện
   cả năm lệch từ quý 2.
5. **Chi tiêu bung cuối năm** để dùng hết hạn mức.

**Checklist công cụ:**

- [ ] Master budget có đủ **5 khối** (bán, sản xuất, chi phí, tiền mặt, dự kiến) chưa?
- [ ] Đã lập **flexible budget cho mọi phân tích tháng** chưa?
- [ ] **Rolling forecast 12 tháng** cập nhật hàng tháng chưa?
- [ ] Ngân sách có phần **dự phòng rõ ràng** (không ẩn trong từng dòng) chưa?
- [ ] Mỗi dòng ngân sách có **1 chủ sở hữu** (owner) chịu trách nhiệm giải trình chưa?
- [ ] Quy tắc **ngân sách tham gia** (ai đóng góp, ai duyệt) rõ chưa?

#### Ứng dụng thực tế

Dựng **bảng điều khiển 3 lớp** cho mọi bộ phận: (1) Ngân sách gốc — (2) Ngân sách linh
hoạt theo thực tế — (3) Thực tế. Chênh lệch (3)−(2) = **hiệu quả vận hành**; (2)−(1) =
**ảnh hưởng khối lượng**. Chỉ thưởng/góp ý trên lớp (3)−(2).

#### Câu hỏi phỏng vấn xin việc

1. **Ngân sách linh hoạt khác gì ngân sách tĩnh?**
   *Gợi ý:* Linh hoạt tính lại theo Q thực tế ($FC + VC \times Q_{thực}$) → tách volume
   variance khỏi spending variance; tĩnh so thẳng → quy lỗi sai cho bộ phận khi khối lượng thay đổi.
2. **Ưu – nhược điểm ngân sách tham gia?**
   *Gợi ý:* Ưu: cam kết, thông tin cục bộ chính xác; nhược: phình to (slack), đàm phán
   kéo dài; cách khắc phục: tham gia + thách thức ngang hàng + so bằng flexible budget.
3. **"Use it or lose it" có phải là lỗi của ngân sách?**
   *Gợi ý:* Là hệ quả của thiết kế: nếu không tiêu hết bị cắt hạn mức kỳ sau → người ta tiêu
   hết; khắc phục: ngân sách 2 năm, tiết kiệm được thưởng %, đánh giá theo giá trị hoạt động
   thay vì % ngân sách đã dùng.

---

## Bài 6 — Phân tích chênh lệch (Variance Analysis)

### Phần A — Cơ bản

**Chênh lệch (variance)** = Thực tế − Ngân sách (cùng mức hoạt động). Trái phiếu ký hiệu:
**Có lợi (F – favorable)** nếu làm lợi nhuận tăng; **Bất lợi (U – unfavorable)** nếu giảm.

**Các chênh lệch then chốt:**

| Chênh lệch | Công thức | Ý nghĩa |
|------------|-----------|---------|
| Giá nguyên liệu (MPV) | $(P_{thực} - P_{std}) \times Q_{thực}$ | Mua đắt/rẻ |
| Sử dụng NL (MQV) | $(Q_{thực} - Q_{std}) \times P_{std}$ | Tiết kiệm/đốt NL |
| Giá nhân công (LRV) | $(R_{thực} - R_{std}) \times H_{thực}$ | Lương cao/thấp |
| Giờ công (LEV) | $(H_{thực} - H_{std}) \times R_{std}$ | Năng suất |
| Chi phí xưởng biến đổi (VOH spending) | $VOH_{thực} - VOH_{flex}$ | Chi tiêu |
| CXX biến đổi – công suất (VOH efficiency) | $(H_{thực} - H_{std}) \times R_{std}$ | Giờ máy |
| CXX cố định – công suất (FOH volume) | $CXX_{không phân bổ} = FOH_{budget} - FOH_{phân bổ}$ | Dùng công suất |

**Phân tích giá – khối lượng tổng quát** cho doanh thu:

$$\Delta DT = (P_{thực} - P_{std}) \times Q_{thực} + (Q_{thực} - Q_{std}) \times P_{std}$$

**Ví dụ tính số.** Tiêu chuẩn: NL 2kg/sp × 50.000đ/kg; thực: mua 21.200kg × 52.000đ,
dùng 21.500kg cho 10.000 sp (tiêu chuẩn cho 10.000 sp = 20.000kg).

- MPV = $(52.000 - 50.000) \times 21.200 = +42.400.000$ **U** (mua đắt).
- MQV = $(21.500 - 20.000) \times 50.000 = +75.000.000$ **U** (đốt NL).
- Tổng NL lệch **117,4 triệu U**.
- Giải thích nối: mua đắt vì mua gấp, gấp dẫn tới NL loại 2 → đốt nhiều → **nguyên nhân
  gốc (root cause)** nằm ở **quyết định mua gấp**, không phải ở xưởng.

### Phần B — Nâng cao

**Phân cấp (decomposition):** chênh lệch tổng = giá × khối lượng + tương tác; luôn truy
**"phải chăng" (appraisal)** — variance = tín hiệu bắt đầu, không phải kết luận.

**Phân tích mix & yield variance** (đa sản phẩm/đa nguyên liệu): chênh lệch doanh số
hỗn hợp tách thành **sales mix variance** (tỷ trọng) và **sales quantity variance** (quy mô).

**Ngân sách chi phí bán hàng & QLDN**: thường dùng **flexible budget theo mức hoạt động**
(tiêu chuẩn: % doanh thu, hoặc số lần chạy chiến dịch) — khó hơn sản xuất vì **chi phí
marketing không tuyến tính** (step spend) → cần ngân sách theo **hoạt động cụ thể** (ABC
tương tự).

**Tranh luận & giới hạn:**

- **Variance report truyền thống gây đổ lỗi** — nhân viên giấu sai sót, "chơi" tiêu chuẩn.
  Trường phái **behavioral accounting** đề xuất: nhấn vào **tín hiệu cải tiến**, không
  trừng phạt từng người; tách **variance nằm ngoài kiểm soát** (giá thị trường, tỷ giá)
  khỏi **nằm trong kiểm soát** (hiệu quả).
- **Tiêu chuẩn "lỏng" (attainable) vs "căng" (ideal)**: tiêu chuẩn quá dễ → vô nghĩa;
  quá căng → gaming, bỏ cuộc. Tiêu chuẩn khả thi (current attainable) là cân bằng.
- **Phân tích theo nguyên nhân có thể kiểm soát (controllable vs non-controllable)** —
  nguyên tắc quản trị công bằng.

**Liên hệ với ABC:** ABC cho chi phí gián tiếp theo hoạt động; variance analysis theo ABC
gọi là **activity variance** — theo thay đổi khối lượng hoạt động (số lần đặt hàng...) chứ
không chỉ giờ máy.

### Phần C — Thực tế

**Case – Công ty thực phẩm (generic):** Tháng 3 lệch giá mua đậu 900 triệu U. Nguyên nhân
"cung ứng": giá đậu thế giới tăng 8%. Nhưng phân tích sâu: hợp đồng mua theo quý, **không
có clause điều chỉnh giá** → 600 triệu U có thể tránh được bằng **hedging/hợp đồng linh
hoạt**. Bài học: **variance analysis phải dẫn tới hành động mua sắm / hợp đồng**, không
chỉ một báo cáo.

**Case – Nhà máy điện tử nội địa (giả định):** LEV (giờ công) U kéo dài 6 tháng ở xưởng
lắp ráp. Ban đầu đổ cho công nhân "lười". Phân tích root cause: **thay đổi thiết kế liên
tục giữa chừng** (engineering change order không kiểm soát) → giờ tăng. Sửa quy trình change
order → LEV về F sau 2 tháng. Bài học: **đừng trừng phạt người chịu hậu quả của người khác.**

**Lỗi thường gặp của quản lý Việt Nam:**

1. **Làm báo cáo variance 20 trang, không ai hành động** — variance phải kèm **người phụ
   trách + hành động + hạn**.
2. **So thực với ngân sách gốc** (không flexible) → tháng thấp sản lượng thì "tiết kiệm ảo".
3. **Đổ lỗi thay vì truy root cause** → biến báo cáo kiểm soát thành công cụ bắt lỗi.
4. **Tiêu chuẩn do kế toán đặt** cho bộ phận vận hành → không ai tin, không ai dùng.
5. **Bỏ qua chênh lệch nhỏ nhưng lặp lại** (death by a thousand cuts).

**Checklist công cụ:**

- [ ] Mọi variance có **ngưỡng báo động** (VD >5% hoặc >50 triệu) chưa?
- [ ] Có cột **controllable / không kiểm soát được** không?
- [ ] Mỗi variance lớn có **root cause + hành động + chủ trì + hạn** chưa?
- [ ] So sánh với **flexible budget**, không phải budget gốc?
- [ ] Báo cáo variance ra **trước ngày họp điều hành** và **không dùng để trừng phạt cá nhân**?

#### Ứng dụng thực tế

Dùng **quy tắc 80/20 variance**: lọc 5 chênh lệch lớn nhất theo tuyệt đối và 3 chênh lệch
"tỷ lệ nhỏ nhưng kéo dài". Gọi 2 người phụ trách mỗi biến thể vào 15 phút "5 Whys". Kết quả
phải là **quyết định** (đổi nhà cung cấp, sửa quy trình, đổi giá...), không phải "theo dõi
tiếp".

#### Câu hỏi phỏng vấn xin việc

1. **Chênh lệch giá và chênh lệch khối lượng nguyên liệu tính thế nào?**
   *Gợi ý:* MPV = $(P_{th} - P_{std}) \times Q_{mua}$; MQV = $(Q_{dùng} - Q_{std}) \times P_{std}$.
2. **Nếu giá nguyên liệu tăng do thị trường, bạn xử lý ra sao trong báo cáo?**
   *Gợi ý:* Gắn nhãn **ngoài kiểm soát**, tách khỏi đánh giá bộ phận; chuyển thành hành động
   chiến lược: đàm phán hợp đồng, hedging, đổi nhà cung cấp, điều chỉnh giá bán.
3. **Vì sao so thực tế với ngân sách gốc là sai?**
   *Gợi ý:* Vì khối lượng hoạt động khác nhau; phải so với flexible budget ở Q thực — phần
   lệch còn lại mới là **chi tiêu/hiệu quả thực sự**.

---

## Bài 7 — Quyết toán vốn: NPV, IRR, payback, PI

### Phần A — Cơ bản

**Quyết toán vốn (capital budgeting)** = chọn dự án đầu tư dài hạn (máy móc, nhà xưởng,
chiến dịch, M&A nhỏ) với dòng tiền **trải nhiều năm**.

**Thời gian giá trị tiền** (từ tài chính, dùng lại ở đây):

$$PV = \frac{FV}{(1 + r)^n}$$

**NPV – Giá trị hiện ròng:**

$$NPV = \sum_{t=0}^{n} \frac{CF_t}{(1 + r)^t} \quad \text{(CF}_0 \text{ là đầu tư, thường âm)}$$

**Quy tắc NPV:** NPV > 0 → **chấp nhận** (tạo giá trị hơn đòi hỏi).

**IRR – tỷ suất hoàn vốn nội bộ**: tỷ lệ $r$ sao cho $NPV = 0$:

$$\sum \frac{CF_t}{(1 + IRR)^t} = 0$$

**Payback (thời gian hoàn vốn):** $PB = $ số năm hoàn vốn đầu tư (chưa chiết khấu).

**PI (profitability index):**

$$PI = \frac{PV(\text{dòng tiền vào})}{|\text{đầu tư}|} = 1 + \frac{NPV}{I_0}$$

**Ví dụ tính số.** Dự án đầu tư 5.000 triệu, dòng tiền 3 năm: 1.800 / 2.200 / 2.000, r = 12%.

- $PV_1 = 1.800/1,12 = 1.607,1$; $PV_2 = 2.200/1,2544 = 1.753,8$; $PV_3 = 2.000/1,4049 = 1.423,6$.
- $NPV = -5.000 + 4.784,5 = -215,5$ triệu → **từ chối** (ở r=12%).
- Payback: 1.800 + 2.200 = 4.000 → còn 1.000 → $PB = 2 + 1.000/2.000 = 2,5$ năm.
- IRR: thử 10% → $NPV = -5.000 + 1.636,4 + 1.818,2 + 1.502,6 = -42,8$; thử 9% → ≈ +65 →
  **IRR ≈ 9,6%** < 12% → không đạt chi phí cơ hội.

**CFF (dòng tiền tự do) cho dự án:**

$$CFF_t = NOPAT_t + \text{khấu hao} - \Delta Vốn lưu động - \text{CAPEX}_t$$

### Phần B — Nâng cao

**NPV vs IRR — tranh luận kinh điển:**

1. **Dòng tiền đảo chiều** (đầu tư ban đầu, rồi dòng âm ở giữa — VD tua máy, dự án "đốt
   tiền" giai đoạn đầu) → **nhiều IRR** (một root mỗi lần đổi dấu), IRR mất ý nghĩa.
2. **Quy mô khác nhau**: dự án nhỏ IRR cao, dự án lớn NPV cao → chọn theo NPV tối đa hóa
   **giá trị tuyệt đối** (giả thiết tối đa hóa giá trị cổ đông).
3. **Lãi suất tái đầu tư khác nhau**: NPV giả định tái đầu tư ở $r$ (hợp lý hơn); IRR giả
   định tái đầu tư ở chính IRR — thường **thổi phồng** IRR.
4. **Khi xung đột**: **NPV là chuẩn vàng**; IRR dùng để giao tiếp ("dự án 18%").

**Phân loại theo rủi ro của r:**
- WACC cho dự án **cùng rủi ro** với doanh nghiệp.
- **Tăng rủi ro (risk-adjusted discount rate)** hoặc **giảm dòng tiền (certainty equivalent)**
  cho dự án rủi ro cao hơn.
- **APV (Adjusted Present Value)**: tách dòng tiền không đòn bẩy + PV lợi ích khấu trừ thuế
  vay (tax shield) — dùng cho dự án đổi cấu trúc vốn.

**Chiến lược quyền chọn thực (real options)**: dự án có thể **hoãn, mở rộng, đóng bỏ** —
NPV tĩnh bỏ qua giá trị này (VD: thăm dò dầu, R&D giai đoạn 1 mua "quyền" tiếp giai đoạn 2).

**Phân bổ ngân sách vốn (capital rationing)**: khi ngân sách hữu hạn → chọn bộ dự án
tối đa hóa NPV tổng (knapsack) — dùng PI để xếp hạng, nhưng phải xét tương quan (correlation)
giữa dự án.

**Giới hạn:** (1) dự báo dòng tiền 5–10 năm **không chính xác**; (2) chi phí cơ hội của
quản lý & thời gian quyết định bị bỏ qua; (3) **dòng tiền liên quan (relevant)** — không
phải lợi nhuận kế toán; (4) sunk cost phải **bỏ qua**, chi phí cơ hội phải **tính**.

### Phần C — Thực tế

**Case – Chuỗi bán lẻ (generic) mở siêu thị mới:** IRR dự kiến 22% (rất hấp dẫn) nhưng
NPV = −3 tỷ vì quy mô rất lớn, chi phí cơ hội 15%. Nếu chọn theo IRR, chuỗi **giảm giá trị
cổ đông** dù "tỷ suất đẹp". Ngược lại, dự án nhỏ NPV +800 triệu với IRR 16% lại bị bỏ qua —
**IRL (IRR ranking) gây sai lầm phân bổ ngân sách**.

**Case – Nhà máy bao bì tại Việt Nam (giả định):** mua máy 12 tỷ, PB tính thuần kế toán
(12 tỷ / lợi nhuận) = 3,5 năm, nhưng khi tính **CFF** (thêm ΔVLD, khấu hao, thuế) PB thực
= 4,8 năm và NPV âm ở r = 14% → **hủy máy, ký hợp đồng gia công** với đối tác — giải phóng
12 tỷ cho dòng tiền sản xuất chủ lực. Bài học: **paybook trên sổ ≠ dòng tiền**.

**Lỗi thường gặp của quản lý Việt Nam:**

1. **Chọn dự án theo IRR/ngay** (IRR cao dễ "đẹp" để xin vốn) thay NPV.
2. **Dùng lợi nhuận kế toán** (lãi) thay **dòng tiền** → bỏ sót VLD, thuế,CAPEX.
3. **Đánh giá giá trị tài sản cũ** (sunk) khi quyết định thay máy.
4. **Không điều chỉnh rủi ro**: áp WACC 12% cho dự án startup rủi ro cao.
5. **Không tính giá trị hủy bỏ**: cứ đổ tiền vì "đã đầu tư 40% rồi" (fallacy sunk cost).
6. **Quên giai đoạn tiền mặt**: thiết bị đặt cọc trước 6 tháng → dòng tiền 0 bị bỏ.

**Checklist công cụ:**

- [ ] Dòng tiền đã quy về **CFF đúng** (thuế, kh.hao, ΔVLD, CAPEX) chưa?
- [ ] Tính **NPV (chuẩn), IRR, PB, PI** — không chỉ 1 chỉ số?
- [ ] $r$ đã **điều chỉnh rủi ro dự án** chưa (không mặc định WACC)?
- [ ] Đã **bỏ sunk cost, tính chi phí cơ hội** chưa?
- [ ] Có kịch bản **xấu nhất (stress)** và **quyền chọn hủy bỏ** chưa?
- [ ] So NPV với **các phương án thay thế** (mua/leasing/gia công) chưa?

#### Ứng dụng thực tế

Bảng **1 trang quyết định đầu tư**: dòng tiền 5 năm theo 3 kịch bản (tốt/kỳ vọng/xấu),
NPV & IRR ở 2 mức r, payback, điểm hòa vốn, rủi ro lớn nhất + biện pháp giảm. Kèm 1 dòng
"**điều kiện hủy bỏ**" (VD: doanh số tháng 6 < 70% kế hoạch → dừng giai đoạn 2).

#### Câu hỏi phỏng vấn xin việc

1. **NPV và IRR khác gì? Khi nào xung đột?**
   *Gợi ý:* NPV đo giá trị tuyệt đối, IRR %; xung đột khi quy mô/dòng đảo chiều khác nhau;
   chọn NPV vì tối đa hóa giá trị; IRR còn giả định tái đầu tư tại IRR.
2. **Chi phí chìm nên xử lý thế nào?**
   *Gợi ý:* Bỏ qua trong phân tích tương lai (đã mất, không liên quan quyết định); chỉ
   tính chi phí cơ hội của tài nguyên **hiện có thể dùng cho phương án khác**.
3. **Nếu NPV dương nhưng IRR < WACC thì sao?**
   *Gợi ý:* Về mặt toán học điều đó không xảy ra với dòng tiền bình thường (IRR là điểm
   NPV=0, nếu NPV>0 ở WACC thì IRR > WACC) — nếu thấy vậy, kiểm tra lại dòng tiền đảo
   chiều/nhiều IRR hoặc nhập sai kỳ thanh toán.

---

## Bài 8 — KPI, Balanced Scorecard & quản trị hiệu quả

### Phần A — Cơ bản

**KPI (Key Performance Indicator)** = chỉ số **then chốt**, không phải mọi chỉ số. Tiêu
chuẩn lựa chọn (SMART-ish): **đo được, có chủ sở hữu, gắn chiến lược, có mục tiêu & ngưỡng,
phản ánh hành động được**.

**Balanced Scorecard (BSC)** – Kaplan & Norton: đo hiệu quả bằng **4 quan điểm**:

| Quan điểm | Câu hỏi | Ví dụ KPI |
|-----------|---------|-----------|
| Tài chính (Financial) | Chúng ta ra sao với cổ đông? | ROE, tăng trưởng DT, FCF, EVA |
| Khách hàng (Customer) | Khách đánh giá ta thế nào? | NPS, churn, share, CSAT |
| Nội bộ (Internal) | Ta phải giỏi gì? | Thời gian chu kỳ, defect rate, OEE |
| Học tập & tăng trưởng (Learning) | Ta tiếp tục cải tiến ra sao? | Giờ đào tạo, số cải tiến/kỳ, tỷ lệ giữ nhân tài |

**Cascading (phân rã)**: mục tiêu công ty → bộ phận → nhóm → cá nhân, kèm **quan hệ nhân
quả** (strategy map): *đào tạo nhân viên → quy trình nhanh hơn → khách hài lòng → doanh thu*.

**Ví dụ:** Mục tiêu công ty: tăng lợi nhuận 20%. Bộ phận sản xuất: giảm 15% tỷ lệ lỗi;
bộ phận bán: NPS ≥ 50; IT: uptime 99,5%.

### Phần B — Nâng cao

**Đo lường gây hành vi (Goodhart's Law):** *"Khi một chỉ số trở thành mục tiêu, nó ngừng là
chỉ số tốt."* Ví dụ kinh điển:

- Đội CS đo **thời gian cuộc gọi ngắn** → cúp máy sớm → khiếu nại tăng.
- Bệnh viện đo **tử vong** → từ chối ca nặng → đạo đức sụp.
- Bán hàng đo **số cuộc gọi** → gọi cho vui, không chốt.
- Dev đo **số dòng code** → code rác, bug tăng.

**Cách chống gaming:** nhóm KPI **cân bằng theo cặp** (chất lượng ↔ năng suất, nội bộ ↔
khách hàng), thêm **KPI thanh tra (counter-metric)**, đánh giá **xu hướng + định tính**,
và **không gắn thưởng 1-1** với 1 chỉ số.

**EVA (Economic Value Added):**

$$EVA = NOPAT - (WACC \times \text{Vốn đầu tư})$$

EVA > 0 → tạo lợi nhuận vượt chi phí vốn (gắn với bài tài chính). So với ROE, EVA **trừng
phạt vốn đứng yên** (không khuyến khích giữ máy móc vô dụng).

**KPI vs OKR:**

| | KPI | OKR |
|---|-----|-----|
| Bản chất | Đo trạng thái hiệu quả | Mục tiêu + kết quả then chốt (tham vọng) |
| Thời gian | Liên tục | Theo chu kỳ quý |
| Kỳ vọng | Giữ/tăng đều | 0,6–0,7/1.0 đạt = thành công |
| Dùng cho | Vận hành lặp | Thay đổi đột phá |

**Tranh luận:** BSC "đẹp nhưng dễ thất bại" — nghiên cứu thực tế chỉ ra thất bại khi:
(1) coi BSC là **bài tập kế toán** thay **công cụ chiến lược**; (2) thiếu **map nhân quả
được kiểm chứng**; (3) **quá nhiều KPI** (>20 → không ai nhớ); (4) **không liên kết thưởng**
đúng cách (thưởng 100% theo KPI → gaming).

**Giới hạn đo lường:** chỉ số tài chính luôn **hậu kỳ**; chỉ số khách hàng khảo sát tốn
độ trễ; đo lường phi tài chính **không kiểm toán** — cần chuẩn nội bộ, truy xuất nguồn.

### Phần C — Thực tế

**Case – ngân hàng bán lẻ (generic):** KPI "số khoản vay phát hành/tháng" → nhân viên chào
vay người không đủ điều kiện → nợ xấu 12 tháng sau. Sửa: thêm cặp **chất lượng** (tỷ lệ nợ
xấu 90 ngày, tuân thủ KYC) + **counter-metric** (khiếu nại khách hàng) → hành vi trở lại
đúng hướng mà **năng suất không tụt**.

**Case – startup giao đồ ăn tại Việt Nam (giả định):** dùng OKR quý: O "trở thành app được
tin nhất thành phố X" với KR: NPS ≥ 55, thời gian giao ≤ 30 phút, tỷ lệ hoàn đơn ≤ 1%.
KPI vận hành hàng tuần (giao đúng giờ) cascading xuống CA và tài xế hợp tác — **tách nhịp
đo hàng ngày (KPI) khỏi tham vọng quý (OKR)**.

**Lỗi thường gặp của quản lý Việt Nam:**

1. **30–50 KPI mỗi bộ phận** → báo cáo dày, không ai nhìn.
2. **Đo những gì đo được** thay vì **đo những gì quan trọng** (VD không đo NPS).
3. **Gắn thưởng 1-1** với KPI → hành vi lệch chuẩn ngay lập tức.
4. **Không cascading** → bộ phận "đạt KPI", công ty trượt mục tiêu (local optimum).
5. **Đổi KPI giữa kỳ** khi thấy không đạt → phá niềm tin vào hệ thống.
6. **Chỉ đo tài chính** → phát hiện vấn đề khách hàng khi đã mất khách.

**Checklist công cụ:**

- [ ] Mỗi KPI có **chủ sở hữu, mục tiêu, ngưỡng cảnh báo, tần suất đo** chưa?
- [ ] Mỗi KPI "nóng" có **counter-metric** cân bằng chưa?
- [ ] Strategy map có **chuỗi nhân quả** rõ (A → B → C) chưa?
- [ ] Tổng KPI cấp quản lý **≤ 8–10** chưa?
- [ ] Có quy tắc: **không đổi KPI giữa kỳ** trừ khi kinh doanh đổi mô hình?
- [ ] Dữ liệu KPI có **nguồn tự động** (không nhập tay) chưa?
- [ ] Đã thử **"red team"** — hỏi: "Làm sao người ta ăn gian chỉ số này?" chưa?

#### Ứng dụng thực tế

Thiết kế **bộ KPI 2 phút cho bất kỳ phòng ban**: 3 chỉ số kết quả (outcome) + 2 chỉ số
quy trình (leading) + 1 chỉ số thanh tra (counter). Kết quả = "điều gì phải xảy ra", quy
trình = "điều mình kiểm soát hàng tuần", thanh tra = "chống ăn gian".

#### Câu hỏi phỏng vấn xin việc

1. **Giải thích 4 quan điểm của BSC.**
   *Gợi ý:* Tài chính, khách hàng, nội bộ, học tập & tăng trưởng — gắn bằng strategy map
   nhân quả; mỗi quan điểm 3–5 KPI, cascading xuống bộ phận.
2. **Một chỉ số bị "chơi" (gaming) — bạn xử lý thế nào?**
   *Gợi ý:* Thêm counter-metric cân bằng, giảm trọng số thưởng, đo theo cặp outcome +
   leading, điều tra nguyên nhân (thường do thiết kế chỉ số/thưởng sai, không phải người sai).
3. **EVA khác gì lợi nhuận kế toán?**
   *Gợi ý:* EVA = NOPAT − WACC×vốn → trừ cả **chi phí vốn**; có thể âm dù lãi kế toán →
   lộ ra doanh nghiệp không tạo đủ lợi nhuận trên vốn chiếm dụng.

---

# Tóm tắt nhanh

| Bài | Công thức / Công cụ chính | Ứng dụng quyết định |
|-----|---------------------------|---------------------|
| 1 | $TC = FC + VC \times Q$; responsibility centers | Tách chi phí, giao trách nhiệm |
| 2 | Absorption vs Variable; $\Delta L = \Delta GI \times CXX_{fixed}$ | Đọc đúng lợi nhuận, chống thao túng tồn kho |
| 3 | $BEP = FC/CMR$; $DOL = CM/L$; MS | Đặt giá, ngưỡng an toàn, đòn bẩy |
| 4 | $Cost = \sum Rate \times Driver$ | Định giá đơn nhỏ, loại hoạt động lãng phí |
| 5 | $SL_{sx} = SL_{bán} + T_{cuối} - T_{đầu}$; Flex budget | Lập kế hoạch, tách volume vs hiệu quả |
| 6 | MPV, MQV, RLV, LEV, FOH volume | Truy nguyên nhân, hành động cải tiến |
| 7 | $NPV$, $IRR$, $PB$, $PI$, $CFF$ | Chọn dự án tối đa hóa giá trị |
| 8 | BSC 4 quan điểm; $EVA = NOPAT - WACC \times V$ | Đo – quản trị hiệu quả cân bằng |

**Mối liên hệ 4 học phần:** Kế toán quản trị cung cấp **CFF & vốn lưu động** → Tài chính
doanh nghiệp (bài 2); CVP & chi phí → Kinh tế quản trị (định giá, co giãn); KPI/BSC →
Quản trị marketing (CAC/LTV/ROAS đều là KPI outcome/leading).

---

# Thuật ngữ Anh – Việt

| Anh | Việt |
|-----|------|
| Managerial accounting | Kế toán quản trị |
| Financial accounting | Kế toán tài chính |
| Fixed / Variable cost | Chi phí cố định / biến đổi |
| Relevant range | Phạm vi liên quan |
| Direct / Indirect cost | Chi phí trực tiếp / gián tiếp |
| Overhead | Chi phí xưởng (gián tiếp) |
| Absorption costing | Định giá theo hấp thụ |
| Variable (direct) costing | Định giá theo biến đổi |
| Period cost / Product cost | Chi phí kỳ / chi phí sản phẩm |
| Contribution margin (CM) | Biên lợi nhuận gộp (biên đóng góp) |
| CMR | Tỷ lệ biên đóng góp |
| Break-even point (BEP) | Điểm hòa vốn |
| Operating leverage (DOL) | Đòn bẩy vận hành |
| Margin of safety | Dòng an toàn (khoảng cách hòa vốn) |
| Cost-Volume-Profit (CVP) | Phân tích chi phí – khối lượng – lợi nhuận |
| Activity-Based Costing (ABC) | Kế toán chi phí theo hoạt động |
| Cost driver | Yếu tố phát sinh chi phí |
| Cost pool | Nhóm chi phí |
| Master budget | Ngân sách tổng thể |
| Flexible budget | Ngân sách linh hoạt |
| Rolling forecast | Dự báo cuộn |
| Zero-based budgeting | Ngân sách cơ sở bằng không |
| Budgetary slack | Ngân sách dự phòng (ẩn) |
| Variance analysis | Phân tích chênh lệch |
| Favorable / Unfavorable | Có lợi / bất lợi |
| Standard cost | Chi phí tiêu chuẩn |
| Capital budgeting | Quyết toán vốn (ngân sách vốn) |
| Net present value (NPV) | Giá trị hiện ròng |
| Internal rate of return (IRR) | Tỷ suất hoàn vốn nội bộ |
| Payback period | Thời gian hoàn vốn |
| Profitability index (PI) | Chỉ số lợi nhuận |
| Free cash flow (CFF/FCF) | Dòng tiền tự do |
| Weighted average cost of capital (WACC) | Chi phí vốn bình quân theo trọng số |
| Economic Value Added (EVA) | Giá trị kinh tế gia tăng |
| Key Performance Indicator (KPI) | Chỉ số hiệu quả then chốt |
| Balanced Scorecard (BSC) | Thẻ điểm cân bằng |
| Responsibility center | Trung tâm trách nhiệm |
| Transfer pricing | Định giá chuyển giao |
| Controllable / Uncontrollable | Kiểm soát được / không kiểm soát được |
| Sunk cost | Chi phí chìm (đã lún) |
| Goodhart's Law | Định luật Goodhart (chỉ số thành mục tiêu) |
| Cascading (goals) | Phân rã (mục tiêu) |
| Counter-metric | Chỉ số đối trọng |
