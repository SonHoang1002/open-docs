# Chuyên đề 14 — Quản trị chuỗi cung ứng (Supply Chain Management)

## Mở đầu

Chuỗi cung ứng (supply chain) là mạng lưới các bên cùng đưa sản phẩm/từ nguyên
vật liệu đến tay người tiêu dùng: nhà cung cấp → sản xuất → kho → vận chuyển →
bán lẻ/khách hàng cuối. **Quản trị chuỗi cung ứng (SCM)** là môn học biến sự phức
tạp đó thành một hệ thống có thể **lập kế hoạch, đo lường và tối ưu**.

Trong MBA, chuyên đề này nối liền môn Quản trị vận hành (Operations) và Chiến lược:
nhiều cuộc khủng hoảng doanh nghiệp gần đây (thiếu chip, tắc container, gãy
chuỗi lạnh vaccine) cho thấy **chiến lược thắng thua được quyết định không chỉ
bởi marketing hay tài chính, mà bởi sức mạnh chuỗi cung ứng**.

**Ai nên học chuyên đề này:**

- Quản lý sản xuất, kho, logistics, mua hàng trong SME và tập đoàn.
- Quản lý chuỗi cửa hàng, bán lẻ, F&B, thương mại điện tử.
- Chuyên viên tư vấn vận hành / chuỗi cung ứng.
- Founder sản xuất-kinh doanh (nhà máy, thực phẩm, thời trang, linh kiện).

**Bối cảnh Việt Nam:** Việt Nam là mắt xích sản xuất–xuất khẩu quan trọng
(thủy sản, dệt may, điện tử, đồ gỗ). Hiểu SCM giúp bạn đọc được báo cáo tài chính
hiệu quả hơn: **tồn kho và vòng quay hàng tồn kho** thường là câu chuyện lớn
nhất trong P&L của doanh nghiệp sản xuất–bán lẻ.

## Mục lục các bài

| Bài | Tên bài | Trọng tâm |
|-----|---------|-----------|
| 1 | Tổng quan & thiết kế mạng lưới chuỗi cung ứng | Khái niệm, bullwhip, make-or-buy, design network |
| 2 | Dự báo nhu cầu | Định tính & định lượng, MAD/MAPE, bias |
| 3 | Lập kế hoạch nhu cầu–cung ứng | S&OP, CPFR, master production schedule |
| 4 | Quản trị tồn kho & safety stock | EOQ, safety stock, ABC/XYZ, ROP |
| 5 | Logistics & vận tải, mạng lưới phân phối | Trung tâm phân phối, phương thức, chi phí |
| 6 | Quản trị nhà cung cấp & mua sắm | Segmentation, hợp đồng, đàm phán, rủi ro NCC |
| 7 | Đo lường hiệu suất chuỗi cung ứng | OTIF, perfect order, SCOR, chi phí |
| 8 | Rủi ro, phục hồi, bền vững & số hóa | Resilience, ESG, AI forecast, traceability |

---

## Bài 1 — Tổng quan & thiết kế mạng lưới chuỗi cung ứng

### Phần A — Cơ bản

**Chuỗi cung ứng (supply chain)** = mạng lưới tổ chức, người, hoạt động, thông tin
và nguồn lực liên quan đến việc tạo và chuyển một sản phẩm/dịch vụ từ nhà cung cấp
đến khách hàng. **Quản trị chuỗi cung ứng** = điều phối các dòng: *hàng hóa, tiền
mặt, thông tin* theo cả hai chiều.

**Ba dòng chảy (three flows):**

1. **Dòng hàng hóa** (physical flow): nguyên liệu → sản phẩm → giao hàng.
2. **Dòng tiền** (cash flow): thanh toán ngược về chuỗi.
3. **Dòng thông tin** (information flow): đơn hàng, dự báo, tồn kho — dòng này
   quyết định chất lượng hai dòng kia.

**Các khái niệm nền:**

- **Upstream** (hướng thượng lưu): phía nhà cung cấp.
- **Downstream** (hướng hạ lưu): phía khách hàng.
- **Tier 1, Tier 2…**: NCC cấp 1 trực tiếp, cấp 2 là NCC của NCC…
- **Push vs. Pull:** đẩy hàng theo dự báo (push) vs. kéo theo đơn hàng thật
  (pull); **giới hạn decoupling point** là điểm chuyển đổi.

**Hiệu ứng roi da buồm (bullwhip effect):** biến động đơn hàng **phóng đại** dần
khi đi ngược lên thượng lưu — khách lẻ dao động 10%, nhà sản xuất có thể thấy 50%.
Nguyên nhân: chênh lệch thời gian, lọc đơn theo lô, tăng giá theo lô, thiếu chia
sẻ dự báo.

**Công thức chỉ số vòng quay tồn kho:**

$$\text{Inventory Turns} = \frac{\text{Giá vốn hàng bán (COGS)}}{\text{Tồn kho bình quân}}$$

Ví dụ: COGS 120 tỷ/năm, tồn kho bình quân 20 tỷ → vòng quay = 6 lần/năm (sức chứa
kho ~2 tháng). Turns cao hơn = vốn ít bị kẹt hơn (nhưng rủi ro hết hàng tăng).

### Phần B — Nâng cao

**Thiết kế mạng lưới (network design) — các quyết định chiến lược:**

- Số lượng và vị trí nhà máy/kho/trung tâm phân phối (DC).
- Năng suất each nhà máy (dedicated vs. flexible).
- Vận chuyển inter-mode (đường bộ/đường biển/bộ hành không).
- Trong nước vs. nước ngoài (offshore = rẻ hơn nhưng lead time dài, rủi ro cao).

**Trade-off cốt lõi: chi phí vs. dịch vụ vs. rủi ro.** Ví dụ công thức chi phí
tổng quát:

$$TC = C_{\text{vận chuyển}} + C_{\text{kho}} + C_{\text{sản xuất}} + C_{\text{tồn kho giữ}} + C_{\text{thất bại dịch vụ}}$$

Trong đó chi phí giữ tồn kho ≈ $\text{Giá trị hàng} \times \text{Tỉ lệ giữ (%
năm)}$ (thường 15–30%, gồm chi phí vốn, lưu kho, hao hụt, bảo hiểm).

**Make-or-buy (sản xuất hay mua ngoài):** ra quyết định theo (i) năng lực lõi
(core competency), (ii) chi phí unit so sánh được, (iii) rủi ro độc quyền
supplier, (iv) khả năng kiểm soát chất lượng/quy trình.

**Mô hình SCOR (Supply Chain Operations Reference)** chuẩn hóa các quy trình:
**Plan, Source, Make, Deliver, Return, Enable** — dùng làm ngôn ngữ chung đo &
so sánh.

**Tranh luận: "Lean hay Agile trong thiết kế SC?"** — Lean (giảm dư thừa) hiệu
quả với nhu cầu ổn định, sản phẩm chuẩn; Agile (linh hoạt) cần cho nhu cầu biến
động mạnh, sản phẩm thời trang/điện tử. Phương án phổ biến: **postponement**
(trì hoãn cá biệt hóa) — sản xuất dở dang chuẩn, cá biệt hóa sát đơn hàng
(ví dụ: sơn màu xe tại khâu cuối). Kết hợp: "hedged" — nền tảng lean + lớp agile
bên ngoài.

**Giới hạn:** mô hình toán tối ưu hóa mạng lưới (facility location, mixed-integer)
phụ thuộc mạnh vào dự báo chi phí/demand; dữ liệu đầu vào sai thì "tối ưu" chỉ là
tối ưu giả. Ngoài ra, tối ưu cục bộ từng bộ phận có thể làm tệ tổng thể
(suboptimization) — luật bất biến: *tối ưu chi phí vận chuyển có thể làm tăng tồn
kho và giảm dịch vụ*.

### Phần C — Thực tế

**Case quốc tế — Zara (Inditex):** thiết kế SC "ngược" — nhà máy giữ công suất
linh hoạt gần châu Âu, đặt hàng nhỏ, tuần giao ngắn (vài tuần vs. ngành ~6 tháng).
Kết quả: tồn kho thấp, hàng mới liên tục, chi phí logistic cao hơn nhưng được bù
bởi chi phí giảm giá/markdown. Bài học: **tối ưu toàn hệ thống, không tối ưu cước
vận chuyển đơn lẻ**.

**Case generic — nhà máy nội thất SME VN xuất khẩu:** 100% đặt cọc 30% rồi sản
xuất theo đơn (pull tại decoupling point), nhưng nguyên liệu gỗ nhập khẩu lead
time 45 ngày → bullwhip từ NCC gỗ. Sửa: (i) dự trữ 1 tháng nguyên liệu chiến
lược, (ii) hợp đồng capacity với 2 NCC, (iii) chia sẻ kế hoạch bán hàng 3 tháng
với NCC → biến động đặt hàng NCC giảm ~30%.

**Lỗi thường gặp:**

- Tối ưu chi phí riêng lẻ từng phòng ban (mua hàng mua giá rẻ → hàng chất lượng
  thấp → tồn kho lỗi tăng).
- Quên dòng thông tin: chỉ điều chuyển hàng, không chia sẻ dự báo.
- Đánh đồng "nhiều kho" với "phục vụ nhanh" mà không tính chi phí tồn kho thêm.
- Bỏ qua reverse flow (đổi trả) trong thiết kế.
- Ra quyết định network design bằng Excel đơn lẻ, không kịch bản hóa.

**Checklist thiết kế mạng lưới (vòng đầu):**

- [ ] Liệt kê dòng sản phẩm theo độ biến động nhu cầu (Y/X/Z).
- [ ] Xác định decoupling point (dự báo vs. đơn hàng thật).
- [ ] Đánh giá chi phí tổng 5 nhóm trong TC (không chỉ cước).
- [ ] So sánh kịch bản: 1 DC lớn vs. 2–3 DC vùng.
- [ ] Mô phỏng tác động dịch vụ: % giao đúng hạn theo kịch bản.
- [ ] Rà soát rủi ro thượng lưu (đơn nguồn, thiên tai, thuế quan).

#### Ứng dụng thực tế

Áp dụng ba dòng chảy cho **quy trình nội bộ công ty bạn**: lần cuối ai trong công
ty "đặt hàng" một vật tư/đồ dùng văn phòng, dòng thông tin đi qua đâu, mất bao
lâu? Nếu dòng thông tin chậm, mọi tối ưu hàng hóa đều vô nghĩa.

#### Câu hỏi phỏng vấn xin việc

1. **Giải thích hiệu ứng bullwhip và 2 cách giảm thiểu.**
   *Gợi ý:* nguyên nhân (thiếu chia sẻ dự báo, lọc đơn theo lô, lead time dài);
   giải pháp: chia sẻ dự báo/POS data, giảm lô đặt hàng, hợp tác dự báo (CPFR),
   rút ngắn lead time.
2. **Lean và Agile khác nhau khi nào, chọn sao cho đúng?**
   *Gợi ý:* nhu cầu ổn định/độ biến động thấp → lean; cao/mùa vụ mạnh → agile;
   dùng postponement/phân lớp hybrid.
3. **Một công ty nên mua ngoài (buy) khi nào thay vì tự làm (make)?**
   *Gợi ý:* không phải năng lực lõi, NCC có quy mô/khả năng tốt hơn, chi phí unit
   thấp hơn sau khi tính rủi ro, công ty cần tập trung nguồn lực vào khác.

---

## Bài 2 — Dự báo nhu cầu

### Phần A — Cơ bản

**Dự báo nhu cầu (demand forecasting)** là ước tính nhu cầu trong tương lai để
phục vụ sản xuất, tồn kho, nhân sự, dòng tiền. Dự báo **không bao giờ đúng tuyệt
đối** — mục tiêu là **sai số tối thiểu và kiểm soát được**.

**Hai phương pháp chính:**

1. **Định tính (qualitative):** ý kiến chuyên gia, Delphi, khảo sát khách hàng
   (phù hợp sản phẩm mới, ít dữ liệu lịch sử).
2. **Định lượng (quantitative):**
   - *Độ dịch chuyển (moving average):* trung bình n kỳ gần nhất.
   - *Làm mooth nhân quả (exponential smoothing):* $F_{t+1} = \alpha A_t +
     (1-\alpha)F_t$.
   - *Hồi quy:* doanh số ~ quảng cáo, giá, mùa vụ…

**Ví dụ làm mooth nhân quả:** dự báo kỳ trước $F_t$ = 100, thực tế $A_t$ = 120,
$\alpha = 0{,}3$ → $F_{t+1} = 0{,}3 \times 120 + 0{,}7 \times 100 = 106$.
$\alpha$ lớn = bám phản ứng nhanh; nhỏ = mượt hơn.

**Đo lường sai số:**

$$\text{MAE} = \frac{\sum |A_t - F_t|}{n}; \quad
\text{MAPE} = \frac{1}{n}\sum \left|\frac{A_t - F_t}{A_t}\right| \times 100\%$$

- MAPE 10% thường khá tốt cho bán lẻ ổn định; hàng thời trang/new item MAPE cao
  là bình thường.
- **Bias** (thiên lệch hệ thống): $\frac{\sum (A_t - F_t)}{n}$ — nếu bias luôn
  dương nghĩa là dự báo *thấp* liên tục (thiếu hàng), luôn âm = dư hàng.

### Phần B — Nâng cao

**Thành phần chuỗi thời gian:** xu hướng (trend), mùa vụ (seasonality), chu kỳ
(cycle), ngẫu nhiên (noise). Mô hình **STL/ARIMA/Prophet** tách các thành phần
để dự báo từng cái. Tương tác: mùa vụ × xu hướng (mùa vụ lớn dần theo tăng
trưởng) là điểm sai phổ biến của trung bình đơn thuần.

**Dự báo theo SKU và "newsvendor" mindset:** với hàng perishable/mùa vụ, câu
hỏi không phải "dự báo đúng nhất" mà là **"cân bằng chi phí dư (overage) và chi
thiếu (underage)"**. Công thức tỷ lệ tối ưu (critical ratio):

$$p = \frac{C_u}{C_u + C_o}$$

trong đó $C_u$ = chi phí thiếu 1 đơn (mất lợi nhuận + mất khách), $C_o$ = chi phí
dư 1 đơn (hạ giá/hỏng). Chọn tồn kho để xác suất nhu cầu ≤ $Q^*$ đạt $p$.

**Ví dụ số:** bán hàng Tết giá 200k, chi phí 120k → lợi nhuận/đơn 80k ($C_u$).
Hàng tồn phải hạ giá còn 80k → $C_o = 40k$. $p = 80/120 = 66{,}7\%$ → đặt mức
tồn đến phân vị 66,7% của phân bố nhu cầu (dùng dữ liệu năm trước).

**Dự báo Collaborative & AI:** dự báo "thật" nên dùng cả **dữ liệu POS bán lẻ**,
lịch khuyến mãi, thời tiết, sự kiện. Mô hình ML (gradient boosting, LSTM) thường
giảm MAPE 10–30% so với trung bình lịch sử — nhưng chỉ khi dữ liệu sạch và có
người chịu trách nhiệm sửa forecast bias.

**Giới hạn:**

- Dự báo cho **hàng mới (new product)**: không có lịch sử → dùng phân bổ bán
  theo tuần (sell-through curve) + so sánh với sản phẩm tương tự (analog).
- **Bullwhip số 2:** bộ phận bán hàng "đấm" dự báo lên để không hết hàng; hệ quả
  dự báo gộp vô dụng → cần văn hóa "forecast accuracy là KPI", không phải
  "forecast quantity".
- Không dự báo được sự kiện **bất thường** (covid, thiên tai, thay đổi thuế) →
  cần **kịch bản (scenario)** và **dự báo theo dải (prediction interval)** thay
  vì một con số.

### Phần C — Thực tế

**Case quốc tế — Walmart & P&G (dữ liệu POS):** P&P/P&G nhận dữ liệu bán lẻ thời
gian thực từ siêu thị → sản xuất bám đúng nhu cầu thực, giảm bullwhip cả hai
chiều. Bài học: **ai sở hữu dữ liệu người đó dự báo tốt nhất**.

**Case generic — chuỗi cà phê 30 điểm bán tại VN:** ban đầu mỗi cửa hàng tự
dự báo nguyên liệu tuần → 3 cửa hàng gần nhau "giữ hàng" phòng hết → hàng tháng
kho vùng thừa 15% sữa tươi. Sửa: (i) dự báo tập trung theo POS 8 tuần gần nhất
+ lễ, (ii) điều chỉnh bởi weather/traffic, (iii) cửa hàng chỉ được chỉnh ±10%,
lý do ghi nhận. Sai số nguyên liệu giảm từ MAPE 28% → 14% sau 3 tháng.

**Lỗi thường gặp:**

- Pha trộn đơn hàng bù hàng (phân bổ cả đơn hàng dồn) vào dữ liệu lịch sử.
- Dùng một phương pháp cho mọi SKU (ABC-XYZ: hàng Z dùng chuyên gia, hàng X dùng
  mô hình tự động).
- Không cập nhật alpha/độ dài cửa sổ theo mùa.
- Lãnh đạo "chỉnh tay" dự báo vì mục tiêu doanh số → mất kiểm soát thống kê.
- Quên tách đơn hàng thử (trial orders) khỏi lịch sử.

**Checklist quy trình dự báo hàng tháng:**

- [ ] Dữ liệu: tách khuyến mãi, hàng lỗi, đơn thử, ảnh hưởng thời tiết/sự kiện.
- [ ] Chạy baseline tự động theo nhóm SKU (ABC-XYZ).
- [ ] Người bán hàng/PM chỉ trích được ±X% có ghi lý do.
- [ ] Đánh giá MAPE, bias theo nhóm SKU sau mỗi kỳ.
- [ ] Dự báo 3 kịch bản (trung vị, cao, thấp) cho kế hoạch capacity.
- [ ] Rà soát sản phẩm mới bằng analog + sell-through curve.

#### Ứng dụng thực tế

Trong doanh nghiệp bạn: tính MAPE/MAE cho dự báo hiện có của công ty (kể cả dự
báo ngân sách). Nếu không ai biết — đó chính là điểm bắt đầu cải tiến: một bảng
theo dõi sai số 3 tháng gần nhất thay đổi cách quản lý nhiều hơn bất kỳ phần mềm
mới nào.

#### Câu hỏi phỏng vấn xin việc

1. **Phân biệt MAE và MAPE; khi nào MAPE vô nghĩa?**
   *Gợi ý:* MAE sai số tuyệt đối; MAPE theo tỉ lệ; MAPE vô nghĩa khi demand ≈ 0
   hoặc biến động cực mạnh (new item), và dễ thiên lệch khi chuỗi có giá trị nhỏ
   chiếm nhiều.
2. **Giải thích critical ratio trong newsvendor bằng ví dụ số.**
   *Gợi ý:* $p = C_u/(C_u+C_o)$; ví dụ 200k/120k/hạ giá 80k → p = 66,7%.
3. **Làm sao giảm bullwhip giữa chuỗi bán lẻ và sản xuất?**
   *Gợi ý:* chia sẻ POS/forecast, giảm lô, rút ngắn lead time, CPFR, KPI forecast
   accuracy thay vì dự báo cao.

---

## Bài 3 — Lập kế hoạch nhu cầu–cung ứng: S&OP & CPFR

### Phần A — Cơ bản

**S&OP (Sales & Operations Planning)** = quy trình lặp lại **hàng tháng** cân
bằng **nhu cầu** và **cung ứng** ở mức tổng hợp, do ban lãnh đạo duyệt. S&OP
không phải họp tồn kho — nó là **quyết định kinh doanh về: bán gì, sản xuất gì,
mua gì, cần bao nhiêu người/nguồn lực, dự kiến doanh thu/chi phí ra sao**.

**6 bước S&OP chuẩn:**

1. **Data & demand review** (dự báo nhu cầu, sales input).
2. **Supply review** (năng lực sản xuất/kho/vận chuyển).
3. **Reconciliation** (gỡ mâu thuẫn: bán muốn nhiều, vận hành muốn ít).
4. **Executive S&OP meeting** (ban lãnh đạo chọn kịch bản).
5. **Plan lock** (chốt kế hoạch điều hành).
6. **Execution & feedback** (theo dõi thực tế vs. kế hoạch).

**Lịch S&OP 1 tháng:** tuần 1 demand, tuần 2 supply, tuần 3 reconcile, tuần 4
executive meeting.

**MPS (Master Production Schedule)** = lịch sản xuất chi tiết theo tuần/SKU,
xuất phát từ S&OP nhưng ở cấp độ chi tiết hơn. **MRP (Material Requirements
Planning)** = tính ngược nhu cầu nguyên phụ liệu từ MPS.

**CPFR (Collaborative Planning, Forecasting & Replenishment)** = hợp tác lập kế
báo, dự báo và bổ sung hàng **giữa 2 bên chuỗi** (ví dụ: nhà sản xuất & nhà bán
lẻ) trên nền dữ liệu chung.

### Phần B — Nâng cao

**Vì sao S&OP hay thất bại?** (i) được làm như "họp báo cáo" thay vì **ra quyết
định**; (ii) thiếu chủ sở hữu dữ liệu; (iii) sales input "chính trị" (chốt quota);
(iv) không có kịch bản; (v) dừng bước 5–6. S&OP trưởng thành cần: **kPI rõ**
(forecast accuracy, service level, inventory days) + **quy tắc chơi** (ai sửa dự
báo, ngưỡng duyệt exception).

**Cấp độ lập kế hoạch (planning hierarchy):** Strategic (1–3 năm: network,
capacity) → S&OP (1–18 tháng: sản phẩm/tài nguyên tổng hợp) → MPS/MRP (tuần–ngày:
lịch chi tiết). **Sai lệch giữa các cấp = mất alignment** kinh điển.

**Aggregate plan — công thức cân bằng cơ bản:**

$$\text{Nhu cầu nhân sự} = \frac{\text{Công suất cần} - \text{Công suất tồn kho
dự kiến} - \text{Công suất ngoài} + \text{Công suất làm thêm}}{\text{Năng suất/
người/ kỳ}}$$

Ví dụ: nhu cầu 10.000 giờ công tháng sau, giờ công hiện có 7.000, ngoài thầu
1.500, tồn kho dịch được 500 giờ → thiếu 1.000 giờ → làm thêm hoặc tăng công
(năng suất 150 giờ/người/tháng → ~7 người-tháng).

**Tranh luận: S&OP gắn với S&OE (Sales & Operations Execution)?** — S&OP chu kỳ
tháng phù hợp quyết định tactical; biến động tuần (trễ chuyến container, thiếu
nguyên liệu) cần **S&OE / weekly operational review** — vòng lặp tuần chỉnh
execution để không chờ tháng sau. Doanh nghiệp tốt chạy **cả hai**: tháng chọn
hướng, tuần giữ nhịp.

**Giới hạn CPFR:** đòi hỏi chia sẻ dữ liệu nhạy cảm (giá vốn, dự báo) — rào cản
tin cậy và hợp đồng; lợi ích phân bố không đều (bên nào dữ liệu mạnh hưởng nhiều
hơn) → cần cơ chế chia sẻ lợi ích rõ ràng.

### Phần C — Thực tế

**Case quốc tế — Unilever & retailers:** quy trình S&OP chặt với phân khúc theo
nhãn hàng, review demand hàng tháng có marketing/sales, scenario cho khuyến mãi
lớn; dùng chung dữ liệu POS với bán lẻ đối tác. Kết quả: tồn kho và dịch vụ cùng
cải thiện (không đánh đổi lẫn nhau).

**Case generic — công ty thực phẩm đóng gói (VN):** S&OP trước đây = phòng
kế hoạch gửi Excel, không ai tranh luận → dự báo sales "đấm" 20% → tồn kho nguyên
liệu cao. Sửa: (i) chốt luật: sales chỉ chỉnh dòng có ghi lý do, (ii) executive
S&OP có GĐ điều hành chủ trì, chọn 1 trong 3 kịch bản, (iii) KPI: forecast bias
gần 0, tồn kho nguyên liệu ≤ 45 ngày. Sau 6 tháng: vòng quay tồn kho 5,2 → 7,1.

**Lỗi thường gặp:**

- Gọi "S&OP" nhưng chỉ có phòng kế hoạch tham gia.
- Bỏ bước reconciliation — mọi người giữ số riêng.
- Kế hoạch không "lock" → mỗi bộ phận tự điều chỉnh → không ai chịu trách nhiệm.
- Không rà soát accuracy sau 3–6 tháng (ai cũng quên con số dự báo cũ).
- M&A doanh nghiệp không hợp nhất S&OP → hai chuỗi cung ứng "đánh nhau" mua hàng.

**Checklist S&OP phiên bản gọn cho SME:**

- [ ] Chủ trì là điều hành (không phải chỉ kế hoạch).
- [ ] Trước họp: demand baseline + sales input + supply capacity trên 1 sheet.
- [ ] Buộc chọn 1 trong 3 kịch bản: thận trọng/cơ sở/mạnh.
- [ ] Quyết định ghi vào decision log: dừng/đẩy dự án, làm thêm, mua ngoài.
- [ ] Plan lock: mọi thay đổi sau đó cần exception approval.
- [ ] Review thực tế tháng sau: actual vs. plan, ai đúng/ sai và vì sao.

#### Ứng dụng thực tế

Áp dụng "mini-S&OP" cho **dự án dịch vụ**: sales pipeline = demand, năng lực đội
= supply, họp hàng tháng chọn kịch bản số người/đối tác ngoài — cùng logic với
sản xuất.

#### Câu hỏi phỏng vấn xin việc

1. **S&OP gồm những bước nào, ai chủ trì?**
   *Gợi ý:* 6 bước demand–supply–reconcile–executive–lock–feedback; chủ trì cấp
   điều hành; thời gian 1 tháng/lần.
2. **Phân biệt S&OP và MPS/MRP.**
   *Gợi ý:* S&OP tổng hợp 1–18 tháng ra quyết định nguồn lực; MPS lịch sản xuất
   tuần/SKU; MRP tính ngược nguyên phụ liệu.
3. **CPFR khác gì hợp tác mua-bán thông thường?**
   *Gợi ý:* chung dữ liệu dự báo/kế hoạch, quy trình sửa đổi thống nhất, cùng
   chịu chỉ số dịch vụ–tồn kho.

---

## Bài 4 — Quản trị tồn kho & safety stock

### Phần A — Cơ bản

**Tồn kho tồn tại vì 4 lý do:** (1) **cycle stock** (theo lô đặt hàng), (2)
**safety stock** (dự phòng biến động), (3) **seasonal stock** (dự trữ mùa), (4)
**pipeline/in-transit stock** (đang vận chuyển). Mỗi loại có công thức và cách
kiểm soát riêng.

**EOQ (Economic Order Quantity) — lô đặt hàng kinh tế:**

$$EOQ = \sqrt{\frac{2DS}{H}}$$

$D$ = nhu cầu/năm, $S$ = chi phí mỗi lần đặt hàng, $H$ = chi phí giữ 1 đơn vị/năm.

**Ví dụ:** nhu cầu 12.000 thùng/năm, chi phí đặt hàng 250.000đ/lần, giữ 8.000đ/
thùng/năm → $EOQ = \sqrt{2 \times 12000 \times 250000 / 8000} = \sqrt{750{.}000.000}
\approx 866$ thùng/lô.

**Reorder Point (ROP):** điểm đặt lại hàng = nhu cầu bình quân × lead time +
safety stock:

$$ROP = d \times L + SS$$

$d$ = nhu cầu/ngày, $L$ = lead time (ngày).

**Safety stock cơ bản (phân bố chuẩn):**

$$SS = z \times \sigma_{L}$$

$z$ = hệ số dịch vụ (service level); $\sigma_L$ = sai số chuẩn nhu cầu trong lead
time. $z \approx 1{,}65$ cho 95%; $z \approx 2{,}33$ cho 99%.

**Ví dụ:** $\sigma_{L} = 40$ đơn vị, mức dịch vụ 95% → $SS = 1{,}65 \times 40 =
66$ đơn vị. Nâng lên 99%: $SS = 2{,}33 \times 40 = 93$ đơn vị — tăng 41% tồn kho
cho 4 điểm phần trăm dịch vụ.

**ABC & XYZ:** ABC theo giá trị sử dụng (A ~20% SKU = 80% giá trị); XYZ theo
tính ổn định của nhu cầu (X ổn định, Z biến động). Ma trận 9 ô chọn chiến lược:
AX = tối ưu vòng quay; CZ = đặt theo đơn, tránh dự trữ.

### Phần B — Nâng cao

**Mức dịch vụ (cycle service level) vs. mức hoàn thành đơn (fill rate):** một
nhà kho 95% cycle service có thể fill rate 99% nếu thiếu hàng rất nhỏ. Chọn chỉ
số phù hợp: hàng thiết yếu (dược phẩm) dùng fill rate; hàng value cao dùng cả hai.

**Safety stock với lead time biến động:** công thức đầy đủ hơn:

$$SS = z \times \sqrt{L \cdot \sigma_d^2 + d^2 \cdot \sigma_L^2}$$

Lead time nhập khẩu biến động (tàu trễ) làm term $d^2\sigma_L^2$ lớn → rút ngắn
lead time có giá trị hơn nhiều so với "tự an ủi" bằng tồn kho.

**Multi-echelon inventory (MEIO):** tồn kho phân bổ nhiều tầng (kho vùng, cửa
hàng). Tối ưu cục bộ từng kho làm tăng tổng tồn; MEIO cân giữa các tầng theo
mô hình xác suất. Bài học: **đúng kho, đúng tầng** quan trọng hơn "đúng tổng".

**Chi phí hàng tồn kho (chi tiết hơn):**

$$C_{\text{giữ}} = i \cdot V + C_{\text{lưu kho}} + C_{\text{hao hụt}} +
C_{\text{bảo hiểm}} + C_{\text{cơ hội vốn}}$$

$i \cdot V$: chi phí vốn (lãi vay hoặc chi phí cơ hội ~10–25%/năm tùy doanh
nghiệp); thường **tổng 15–30% giá trị/năm** — dùng làm $H$ trong EOQ.

**Tranh luận: "Tồn kho là rác (waste) — loại bỏ 100%?"** — Lean cực đoan coi tồn
kho là phung phí (che giấu vấn đề); thực tế: tồn kho **chiến lược** (mặt hàng
chiến lược, hàng đợi công suất, seasonal) là lựa chọn kinh tế có chủ đích. Mục
tiêu đúng: **loại bỏ tồn kho không tạo giá trị, giữ tồn kho đắt nhưng cần**.

**Giới hạn:** EOQ giả định nhu cầu đều, giá không đổi, chi phí đơn lẻ (không
quantity discount); an toàn khi điều kiện gần đúng, cần sửa bằng mô hình dịch
vụ/đa mặt hàng trong thực tế.

### Phần C — Thực tế

**Case quốc tế — Toyota & JIT:** tồn kho thấp nhờ ổn định quy trình và NCC gần,
nhưng JIT dễ tổn thương trước cú sốc cung ứng (thiên tai Nhật 2011) → sau đó
bổ sung "kho chiến lược" cho vài linh kiện — minh họa trade-off lean–resilience.

**Case generic — nhà thuốc phân phối dược (VN):** 8.000 SKU, hàng thiết yếu
(ống tiêm, hạ sốt) đang dùng chung chính sách. Phân tích ABC-XYZ: nhóm AX (120
SKU) chiếm 55% giá trị → đặt service 98%, SS tính theo công thức biến động lead
time nội địa (nhỏ); nhóm CZ (3.000+ SKU) → service 85%, bán thiếu thì đặt lại.
Tồn kho giảm 18% trong khi fill rate hàng thiết yếu tăng.

**Lỗi thường gặp:**

- Dùng 1 mức dịch vụ cho mọi hàng hóa.
- Đặt SS bằng "kinh nghiệm" (2 tuần tồn) không gắn với $\sigma$.
- Bỏ sót chi phí vốn trong $H$ → EOQ quá lớn.
- Quên lead time thực = thời gian đặt + kiểm tra + nhận, không chỉ thời gian giao.
- EOQ tính theo giá mua nhưng quên chi phí đặt hàng nội bộ (kiểm tra, duyệt).

**Checklist tồn kho hàng tháng:**

- [ ] Phân loại ABC-XYZ cập nhật mỗi quý.
- [ ] SS/ROP tính lại khi lead time hoặc độ biến động đổi.
- [ ] Theo dõi: vòng quay, số ngày tồn, % hàng tồn > 6 tháng.
- [ ] Review hàng slow-moving: hạ giá, chuyển kho, hủy — có chủ sở hữu.
- [ ] Kiểm kê thực tế vs. hệ thống (độ chính xác tồn kho ≥ 97%).
- [ ] Phân tách nguyên nhân thiếu hàng: dự báo vs. cung ứng vs. chất lượng.

#### Ứng dụng thực tế

Dùng tư duy EOQ cho **vật tư văn phòng/chiến dịch marketing**: chi phí đặt hàng
thực (thời gian duyệt, so sánh NCC) thường bị đánh giá thấp → mua "nhỏ giọt"
hàng tháng tốn hơn mua tập trung theo lô tối ưu.

#### Câu hỏi phỏng vấn xin việc

1. **Tính EOQ với D = 24.000, S = 500k, H = 10k. Đáp án?**
   *Gợi ý:* $EOQ = \sqrt{2\times24000\times500000/10000} = \sqrt{2{,}4{,}000{,}000} ≈ 1.549$ đơn vị.
2. **Nâng service level 95% → 99% ảnh hưởng safety stock ra sao?**
   *Gợi ý:* z tăng 1,65 → 2,33, SS tăng ~41%, chi phí giữ thêm — so sánh với
   chi phí mất bán/ mất khách.
3. **Vì sao tối ưu từng kho đơn lẻ có thể làm tệ tổng thể?**
   *Gợi ý:* thiếu phối hợp multi-echelon, mỗi kho tích lũy SS riêng → tổng tồn
   phình; cần phân bổ tập trung theo demand pool.

---

## Bài 5 — Logistics & vận tải, mạng lưới phân phối

### Phần A — Cơ bản

**Logistics** = quản lý dòng hàng hóa, dịch vụ và thông tin từ điểm gốc đến điểm
dùng với chi phí thấp và dịch vụ thỏa thuận. **Vận tải (transportation)** là phần
cốt lõi nhưng logistics còn gồm kho, bao bì, customs, reverse logistics.

**4 chế độ vận tải chính (đương nhiên):**

| Chế độ | Ưu điểm | Nhược điểm | Dùng khi |
|--------|---------|------------|----------|
| Đường bộ | linh hoạt, door-to-door | chi phí/km cao hơn đường biển | ngắn–trung hạn nội địa |
| Đường biển | rẻ, khối lượng lớn | chậm, phụ thuộc cảng | xuất nhập khẩu bulk |
| Đường sông | rẻ (nếu có hạ tầng) | giới hạn địa lý | hàng nặng quanh sông |
| Đường hàng không | rất nhanh | đắt nhất | hàng giá trị cao, khẩn |

**Chi phí vận tải:**

$$C_{\text{chuyến}} = C_{\text{định kỳ}} + c \times \text{trọng lượng/khoảng cách}$$

Với **Full Truck Load (FTL)** trả giá cả chuyến; **Less than Truckload (LTL)**
trả theo cước chia sẻ theo trọng lượng/khối (CBM).

**Trung tâm phân phối (DC):** nơi tập kết – phân loại – gom hàng (cross-docking
= nhận và chuyển tiếp không lưu kho). Cross-docking giảm tồn kho nhưng đòi hỏi
lịch nhận–giao khớp chính xác.

**Công thức vòng quay giao hàng & chi phí giao/đơn:**

$$\text{Chi phí giao/đơn} = \frac{\text{Tổng cước chuyến}}{\text{Số đơn/ chuyến}}$$

Gom đơn (route batching) giảm chi phí/đơn nhưng tăng thời gian chờ — trade-off
dịch vụ–chi phí quen thuộc của giao hàng chặng cuối (last mile).

### Phần B — Nâng cao

**Network design vận chuyển: hub-and-spoke vs. point-to-point.** Hub-and-spoke
gom qua trung tâm (tiết kiệm, dùng cho bưu chính/bán lẻ); point-to-point nhanh
hơn (hàng không, giao khẩn). **Postponement vận chuyển:** gom hàng về hub rồi
mới quyết điểm đến cuối (in-transit postponement).

**Incoterms 2020 (cơ bản cần nhớ):** FOB (bên bán giao lên tàu, rủi ro chuyển
tại mạn), CIF (bên bán trả cước + bảo hiểm đến cảng đến), DDP (bên bán giao
đến tận cửa, trả thuế — trách nhiệm lớn nhất bên bán). Hiểu Incoterms = hiểu
**ai trả chi phí/rủi ro ở đâu** — tranh cãi phổ biến khi không rõ.

**Third-party logistics (3PL) vs. tự vận hành:** 3PL linh hoạt, biến chi phí
cố định sang biến đổi, tiếp cận công nghệ (WMS, tối ưu tuyến); rủi ro: phụ thuộc,
mất trực tiếp khách hàng cuối. **4PL** điều phối nhiều 3PL (nhà tư vấn điều
hành chuỗi).

**Last mile & reverse logistics:** chi phí giao chặng cuối chiếm 30–50% tổng chi
phí vận chuyển bán lẻ điện tử. Đảo trả (return) trong TMĐT có thể 15–30% —
reverse logistics cần: tiếp nhận, kiểm định, phân loại (bán lại/hạ giá/hủy),
và là **nguồn dữ liệu lỗi sản phẩm**.

**Giới hạn tối ưu tuyến (VRP):** bài toán vehicle routing NP-hard; giải pháp
thực hành: metaheuristic + ràng buộc thực (giờ giao, tải trọng, vùng cấm) +
**nhân viên giao quen đường** đánh bại mô hình thuần trong nhiều đô thị đông
(Việt Nam) — nơi dữ liệu bản đồ kém chính xác ở hẻm nhỏ.

### Phần C — Thực tế

**Case quốc tế — Amazon Fulfillment:** mạng lưới DC + vận chuyển nội bộ, giao
1 ngày/lấy ngày; chi phí logistics vẫn hàng chục % doanh thu → bù bằng density
đơn/khu vực, Prime giữ retention. Bài học: **dịch vụ cao không miễn phí —
bù bằng quy mô và công nghệ**.

**Case generic — chuỗi bánh ngọt 50 cửa hàng tại HCM:** tự giao mỗi cửa hàng (5
xe) → chi phí giao/cửa hàng 180k/ngày, độ trễ do kẹt xe. Chuyển về mô hình
**hub-and-spoke**: 1 kho trung tâm + 3 tuyến gom theo quận, xe lạnh nhỏ;
chi phí giao giảm 35%, nhưng phải chốt lịch giao cố định 2 chuyến/ngày và
cửa hàng nhận hàng theo khung giờ — thay đổi thói quen là phần khó nhất.

**Lỗi thường gặp:**

- Chọn 3PL theo giá cước đơn thuần, không tính chi phí quản lý quan hệ/đổi.
- Giao hàng chặng cuối không kiểm soát tỉ lệ giao thành công lần đầu (first
  attempt delivery) — mỗi lần giao lỗi thêm 30–50% chi phí.
- Đánh đồng "giao nhanh" với "tối ưu" — giao 2h nhưng 50% chuyến rỗng.
- Bỏ qua reverse logistics trong hợp đồng 3PL.
- Không đo chi phí logistics/đơn doanh thu (%) để benchmark.

**Checklist lựa chọn/tối ưu vận tải:**

- [ ] Phân loại hàng: giá trị/kg, khẩn cấp, lạnh, dễ hỏng.
- [ ] So sánh FTL/LTL/theo chuyến/đơn theo lane phổ biến.
- [ ] Đánh giá 3PL theo: cước, SLA đúng hạn, tỉ lệ hỏng/hụt, CIR (claim rate).
- [ ] Tối ưu tải trọng: % tải đầy, tỉ lệ quay vòng xe/ngày.
- [ ] First attempt delivery ≥ 90% với giao hàng B2C.
- [ ] Chi phí logistics % doanh thu theo dõi hàng tháng.

#### Ứng dụng thực tế

Dùng công thức chi phí giao/đơn để **ren-negotiate hợp đồng giao hàng nội bộ** của
công ty bạn: gom theo khung giờ, giảm chuyến rỗng, so sánh 3PL theo total cost
thông qua (TCO), không chỉ giá/km.

#### Câu hỏi phỏng vấn xin việc

1. **So sánh FTL và LTL; khi nào chọn cái nào?**
   *Gợi ý:* FTL: cả chuyến, phí cả chuyến, phù hợp khối lớn/nguyên xe, chủ động
   thời gian; LTL: chia sẻ, theo trọng/khối, rẻ cho lô nhỏ, thời gian lâu hơn.
2. **Cross-docking hoạt động thế nào và đòi hỏi gì?**
   *Gợi ý:* nhận–phân loại–chuyển tiếp không lưu kho; đòi hỏi lịch chính xác,
   thông tin đơn hàng thật, hệ thống WMS/ASN tốt.
3. **Chi phí giao chặng cuối cao — 3 cách giảm.**
   *Gợi ý:* gom điểm/nhóm theo khu, trạm locker/điểm nhận, khung giờ giao rộng
   hơn, tối ưu tuyến + tăng mật độ đơn/km.

---

## Bài 6 — Quản trị nhà cung cấp & mua sắm

### Phần A — Cơ bản

**Mua sắm (procurement)** = tìm, đánh giá, thương lượng, đặt hàng, quản lý NCC.
Mục tiêu không phải "mua rẻ nhất" mà **total value of ownership** (giá + chất
lượng + dịch vụ + rủi ro).

**Quy trình mua sắm chuẩn:** xác định nhu cầu → phân loại → tìm NCC → RFQ/RFP
(xin báo giá/đề xuất) → đánh giá → đàm phán → hợp đồng → đặt hàng/giao → đánh
giá & phát triển.

**Phân loại hàng hóa Kraljic Matrix (2×2: rủi ro cung ứng × tác động lợi nhuận):**

| Ô | Đặc tính | Chiến lược |
|----|-----------|------------|
| Bottleneck | rủi ro cao, lợi nhuận thấp | đảm bảo cung, đa nguồn, dự trữ |
| Leverage | rủi ro thấp, lợi nhuận cao | mặc cả, đấu giá, tối ưu giá |
| Strategic | rủi ro cao, lợi nhuận cao | quan hệ đối tác dài hạn, cùng phát triển |
| Non-critical | rủi ro thấp, lợi nhuận thấp | chuẩn hóa, tự động hóa đơn hàng |

**Định giá tham chiếu (should-cost model):** tự xây bảng thành phần chi phí
(nguyên liệu + công + phí quản lý + lợi nhuận NCC) để đàm phán có căn cứ thay vì
chỉ so 2–3 báo giá.

### Phần B — Nâng cao

**Rủi ro NCC theo tầng (tiered risk):** rủi ro không chỉ ở Tier 1 — sự cố thường
xảy ra ở Tier 2/3 (nhà máy nhỏ, vùng thiên tai). Cách tiếp cận: mapping đa tầng,
điểm đơn nguồn (single point of failure) cho từng tier, hợp đồng yêu cầu NCC
Tier 1 công bố NCC quan trọng của họ.

**Dual sourcing vs. sole sourcing:** sole: chi phí thấp, cam kết cao, rủi ro cao;
dual: chi phí quản lý gấp đôi, nhưng đảm bảo. Chiến lược thực dụng: **sole cho
hàng strategic + hợp đồng capacity, dual cho bottleneck thiết yếu**.

**Đàm phán mua sắm — BATNA & nhiều biến số:** ngoài giá: lead time, thanh toán
60/90 ngày, SLA hoàn tiền, cam kết giá dài, hỗ trợ tồn kho (VMI). Nâng cao: **gain
sharing** — cùng chia phần tiết kiệm khi NCC cải tiến.

**Sustainable procurement:** tích hợp ESG vào tiêu chí lựa chọn NCC (lao động,
phát thải, nguồn nguyên liệu có trách nhiệm) — ngày càng là yêu cầu của khách
hàng xuất khẩu EU (CBAM, due diligence chuỗi cung ứng).

**Giới hạn:** phân tích Kraljic tĩnh (ma trận 1 lần/năm) không theo kịp biến động
(chiến tranh, dịch) → cần **radar quét định kỳ**; giá tham chiếu cần dữ liệu
thị trường cập nhật, nếu không sẽ đàm phán theo "ảo".

### Phần C — Thực tế

**Case quốc tế — Apple & các NCC chiến lược:** đầu tư tiền và chuyên gia vào NCC
để đảm bảo năng lực/độc quyền công nghệ; đổi lại cam kết dài hạn — minh họa ô
"Strategic" vận hành đúng nghĩa (không chỉ ký MOU).

**Case generic — công ty may mặc VN:** 70% nguyên phụ liệu (nút, chỉ, khóa) nhập
từ 1 NCC Trung Quốc duy nhất (bottleneck không được phân loại). Khi freight tăng
và hạn ngạch kiểm tra, 2 nhà máy dừng 9 ngày. Sửa: (i) phân loại lại Kraljic,
(ii) bổ sung 1 NCC nội địa cho khóa/nút phổ thông, (iii) hợp đồng 3 tháng giá
khóa + dự trữ 45 ngày cho hàng bottleneck. Chi phí mua tăng 2% nhưng rủi ro dừng
chạy giảm mạnh.

**Lỗi thường gặp:**

- "Mua rẻ nhất" rồi trả bằng: chậm giao, hàng lỗi, stop-line.
- Không ai sở hữu dữ liệu chi phí theo NCC (mỗi bộ phận mua lẻ).
- Chấm điểm NCC chỉ bằng cảm tính, không KPI (OTIF của NCC, PPMS, claim rate).
- Hợp đồng thiếu ràng buộc lead time/dịch vụ.
- Đổ lỗi cho NCC mà không audit nguyên nhân gốc (yêu cầu sai, thay đổi thiết kế
  phút cuối).

**Checklist đánh giá NCC mới:**

- [ ] Tài chính cơ bản (doanh thu, tình trạng pháp lý, tranh chấp).
- [ ] Năng lực: công suất, chứng nhận (ISO, industry), khách hàng tham chiếu.
- [ ] Rủi ro địa lý/polít + phương án dự phòng.
- [ ] Thử đơn pilot nhỏ với SLA trước hợp đồng lớn.
- [ ] Điều khoản: giá, lead time, thanh toán, phạt/giải trừ, IP.
- [ ] Kế hoạch onboard: chia sẻ dự báo, lịch giao, quy cách chất lượng.

#### Ứng dụng thực tế

Áp dụng Kraljic cho **nhóm mua sắm nội bộ** của công ty bạn (phần mềm, dịch vụ
văn phòng, đối tác marketing): phát hiện "bottleneck ẩn" (ví dụ: 1 freelancer
giữ mọi kiến thức SEO, 1 agency duy nhất) và xử lý bằng hợp đồng + knowledge
transfer.

#### Câu hỏi phỏng vấn xin việc

1. **Giải thích ma trận Kraljic và chiến lược cho 4 ô.**
   *Gợi ý:* rủi ro × tác động; bottleneck đảm bảo cung, leverage mặc cả, strategic
   đối tác, non-critical tự động hóa.
2. **Sole sourcing lợi và hại gì?**
   *Gợi ý:* lợi: giá/chi phí giao dịch thấp, cam kết; hại: rủi ro độc quyền,
   ngừng cung; dùng cho strategic có hợp đồng chặt, không dùng cho bottleneck
   không kiểm soát.
3. **Khi NCC liên tục trễ giao, bạn làm gì?**
   *Gợi ý:* đo OTIF cụ thể, audit nguyên nhân gốc (dự báo sai?, yêu cầu thay đổi?,
   năng lực NCC?), sửa hợp đồng/kế hoạch, phát triển NCC thứ hai, không chỉ
   "đẩy email hỏi tiến độ".

---

## Bài 7 — Đo lường hiệu suất chuỗi cung ứng

### Phần A — Cơ bản

**Không đo được thì không quản trị được.** Bộ chỉ số SC chuẩn hóa theo 3 nhóm:
**đúng hạn/dịch vụ, chi phí, tài sản (tồn kho)** — luôn đọc **cùng lúc** (dịch vụ
100% với chi phí khủng là thất bại).

**OTIF (On Time In Full)** = % đơn giao **đúng hạn AND đủ số lượng/chất lượng**:

$$OTIF = \frac{\text{Số đơn giao đúng hạn đủ hàng}}{\text{Tổng số đơn}} \times 100\%$$

**Perfect Order Rate (tỷ lệ đơn hoàn hảo)** — chặt hơn OTIF, cộng thêm **hồ sơ
đúng (documentation)** và **không hư hỏng**:

$$POR = \frac{\text{Đơn đúng hạn × đủ hàng × giấy tờ đúng × không hỏng}}{\text{Tổng đơn}}$$

Nếu 4 chỉ số con = 95% mỗi cái → $POR = 0{,}95^4 ≈ 81{,}5\%$ — minh họa vì sao
"95% mỗi nơi" vẫn cho đơn hoàn hảo thấp.

**Chi phí logistics so với doanh thu:**

$$\text{Chi phí logistics \% doanh thu} = \frac{C_{\text{vận + kho + quản}}}{\text{Doanh thu}} \times 100\%$$

Benchmark tham khảo: bán lẻ/FMCG thường 5–15%; hàng nặng/bulk thấp hơn; TMĐT
B2C có thể 15–25% do giao chặng cuối.

### Phần B — Nâng cao

**Khung SCOR — 6 quy trình đo:** Plan (độ chính xác kế hoạch), Source (OTIF NCC,
chi phí mua), Make (yield, downtime), Deliver (OTIF, chi phí giao), Return (tỷ
lệ trả, chi phí xử lý), Enable (thời gian onboarding NCC mới, chất lượng dữ
liệu). SCOR cho **ngôn ngữ so sánh giữa các công ty và với benchmark ngành**.

**Mô hình cân bằng "scorecard":** Kaplan–Norton áp cho SC: 4 góc nhìn (tài chính,
khách hàng, quy trình nội bộ, học & tăng trưởng). Ví dụ: giảm tồn kho (tài chính
tốt) nhưng nếu làm fill rate giảm quá ngưỡng (khách hàng xấu) thì cần dừng.

**Chỉ số ẩn — chất lượng dữ liệu & forecast bias:** bias dự báo dương (liên tục
dự báo thấp) = chuỗi chạy "hụt hơi"; độ chính xác dữ liệu tồn kho thấp → mọi
KPI còn lại vô nghĩa. Thêm chỉ số **inventory record accuracy**.

**Tranh luận: "Đặt OTIF 100% có thực tế không?"** — 100% OTIF có thể đạt được
bằng cách (i) dự trữ khổng lồ, (ii) giao sớm "phòng hờ" (về sớm cũng bị tính
đúng hạn theo một số định nghĩa — cần chốt định nghĩa!) — cả hai đều tốn kém hoặc
phá định nghĩa. Cách làm chuẩn: đặt OTIF mục tiêu theo phân khúc khách (khách
chiến lược 98%, thông thường 95%) và theo dõi **xu hướng + nguyên nhân miss**.

**Giới hạn KPI:** Goodhart's law — "khi một chỉ số trở thành mục tiêu, nó ngừng là
chỉ số tốt". Ví dụ: giao đúng hạn bằng cách tăng tồn kho vùng; OTIF tốt nhưng
claim/đổi trả cao; shipper "đánh dấu sớm" để đạt on-time. Giải pháp: hệ chỉ số
cân bằng + audit định kỳ.

### Phần C — Thực tế

**Case quốc tế — Dell (báo cáo scorecard SC):** công bố công khai chỉ số SC
(thời gian order-to-ship, tồn kho ngày) — biến chỉ số vận hành thành **thông điệp
thị trường vốn** (giảm tồn kho = giải phóng dòng tiền). Bài học: chỉ số SC mạnh
có thể là công cụ quan hệ nhà đầu tư.

**Case generic — công ty FMCG phân phối qua 200 đại lý:** OTIF nội bộ 92% nhưng
khách khiếu nại 18%/tháng. Phân tích: OTIF tính tại kho "giao cho đại lý", không
tính thời gian đại lý nhập/xử lý; thêm **OTIF đầu cuối** (đến tay điểm bán cuối)
và gộp dữ liệu claim → phát hiện 40% lỗi ở khâu ghi nhận đơn sai (EDI thủ công).
Sửa: số hóa đơn hàng → OTIF đầu cuối 92% → 96% sau 5 tháng.

**Lỗi thường gặp:**

- Tối ưu riêng lẻ: kho tối ưu pallet, xe tối ưu tuyến, sales tối ưu cam kết —
  không ai tối ưu đơn hàng end-to-end.
- OTIF không có định nghĩa thống nhất (đúng hạn = trước giờ nhận? đúng ngày?).
- KPI "số đơn/nhân viên kho" khuyến khích gom đơn lớn, bỏ đơn nhỏ.
- So sánh benchmark quốc tế khi khác cấu trúc ngành (bán buôn vs. bán lẻ).
- Chỉ báo động khi khách khiếu nại — không leading indicators (độ trễ NCC,
  chính xác tồn kho).

**Checklist bộ chỉ số SC hàng tháng (1 trang):**

- [ ] OTIF & Perfect Order (theo nhóm khách/ sản phẩm chính).
- [ ] Chi phí logistics % doanh thu + xu hướng.
- [ ] Tồn kho: số ngày, vòng quay, % slow-moving, inventory accuracy.
- [ ] Trả hàng/claim rate + nguyên nhân top 3.
- [ ] Forecast bias & MAPE theo nhóm SKU.
- [ ] Lead time nội bộ & của NCC (trung vị + P90).

#### Ứng dụng thực tế

Chọn **3 chỉ số** cho bộ phận bạn đang quản lý theo nguyên tắc cân bằng: 1 chỉ số
dịch vụ khách, 1 chỉ số chi phí, 1 chỉ số tài sản/hiệu suất — giải trình được
trade-off giữa chúng trong mỗi cuộc họp tháng.

#### Câu hỏi phỏng vấn xin việc

1. **Tính Perfect Order Rate: 4 chỉ số con 95%, 96%, 97%, 98% → POR?**
   *Gợi ý:* 0,95×0,96×0,97×0,98 ≈ 86,7%.
2. **Phân biệt OTIF và Perfect Order.**
   *Gợi ý:* OTIF = đúng hạn + đủ hàng; POR cộng thêm giấy tờ và không hư hỏng —
   chặt hơn và phản ánh "khách thực sự hài lòng".
3. **KPI nào dễ bị lạm dụng (Goodhart)? Cho ví dụ.**
   *Gợi ý:* OTIF tăng nhờ dự trữ nhiều; giảm chi phí giao/đơn nhờ giao trễ;
   cần hệ chỉ số cân bằng + audit.

---

## Bài 8 — Rủi ro, khả năng phục hồi, bền vững & số hóa chuỗi cung ứng

### Phần A — Cơ bản

**Resilience (khả năng phục hồi) của chuỗi cung ứng** = khả năng **chịu cú sốc**
(disruption), **phục hồi nhanh** và **học/adapt** sau sự cố. Cú sốc phổ biến:
thiên tai, dịch bệnh, chiến tranh, đối thủ mua chuộc NCC, cháy kho, khủng hoảng
PR NCC.

**Các chiến lược chống rủi ro cung ứng cơ bản:**

- **Đa dạng hóa nguồn** (multi-sourcing) & đa vùng địa lý.
- **Dự trữ chiến lược** (strategic buffer stock) cho hàng critical.
- **Safety lead time** (đặt sớm hơn lịch cần).
- **Nearshoring/reshoring** (rút ngắn khoảng cách NCC).
- **Hợp đồng linh hoạt** (flexible capacity, penalty rõ ràng).

**Phân loại rủi ro theo xác suất × tác động (ma trận rủi ro):** 4 ô — cao/cao
là ưu tiên phòng ngừa; cao/thấp là giám sát; thấp/thấp là chấp nhận có ghi nhận.

**SC bền vững (sustainable/green SC):** 3 trục ESG trong SC — môi trường (phát
thải, bao bì, năng lượng), xã hội (lao động, an toàn), quản trị (minh bạch NCC).
Khung: **Scope 1/2/3** — Scope 3 (phát thải chuỗi cung ứng) thường chiếm phần
lớn nhất của doanh nghiệp sản xuất/bán lẻ.

### Phần B — Nâng cao

**Số hóa chuỗi cung ứng (digital SC):**

- **Traceability (truy xuất nguồn gốc):** blockchain/IoT/tem QR — theo lô hàng
  từ NCC đến khách; giá trị mạnh với thực phẩm, dược, nông sản xuất khẩu
  (yêu cầu EU/Japan).
- **AI/ML forecasting:** đã nói Bài 2; thêm: dự báo rủi ro NCC (news/sensor
  data), tối ưu tồn kho tự động (reorder bot).
- **Digital twin:** mô hình ảo của mạng lưới SC để **mô phỏng** kịch bản
  (nếu cảng X tắc thì sao?) trước khi quyết định.
- **Control tower:** bảng điều khiển tổng hợp đơn hàng/thông báo sự cố real-time.

**Tranh luận: "Lean toàn cầu hóa (global lean) có đủ cho cú sốc kiểu Covid?"**
Covid cho thấy: chuỗi siêu dài + zero-buffer + một vùng địa lý = dễ vỡ. Nhưng
"kéo gần về hết" lại tăng chi phí và giảm lợi thế so sánh. Phương án thực dụng:
**“just-in-case” có chọn lọc** — buffer và dual-source cho critical few, giữ lean
cho phần còn lại, đồng thời tăng **tầm nhìn (visibility)** để phản ứng nhanh.

**Rủi ro đạo đức & dữ liệu trong số hóa:** dữ liệu vị trí tài xế/dịch vụ NCC
nhạy cảm; blockchain "không thể sửa" nhưng "garbage in, garbage out"; rủi ro an
ninh thông tin khi mọi thứ kết nối (ransomware tấn công kho/cảng từng xảy ra
thực tế).

**KPI bền vững bổ sung:** intensity phát thải/logistics (g CO₂/đơn), % bao bì
tái chế, % NCC được audit ESG, % hàng có truy xuất đầy đủ. Lưu ý rủi ro
**greenwashing**: công bố mục tiêu không có dữ liệu đo đạc.

**Giới hạn AI trong SC:** mô hình ML cần dữ liệu lịch sử đủ sạch; cú sốc chưa từng
có trong lịch sử (out-of-distribution) là giới hạn cứng; "AI dự báo" không thay
thế quy trình S&OP và trách nhiệm con người trong quyết định capacity.

### Phần C — Thực tế

**Case quốc tế — sự cố kênh đào Suez (Ever Given, 2021):** hơn 1 tuần tắc đường
biển chính → hàng nghìn chuyến trễ, chi phí tăng, hàng thời trang/electronics
ảnh hưởng dây chuyền. Bài học: (i) kịch bản "một điểm nghẽn" cần có trong rủi ro
SC; (ii) công ty có visibility + dual routing phục hồi nhanh hơn; (iii) chi phí
phòng ngừa rẻ hơn chi phí stop-line.

**Case 2 — truy xuất nông sản xuất khẩu VN:** thanh long/chuối xuất sang Nhật,
EU yêu cầu truy xuất thuốc trừ sâu, vùng trồng. Doanh nghiệp triển khai mã lô +
hồ sơ số cho mỗi lô — chi phí ban đầu vài trăm triệu, nhưng mở lại/duy trì thị
trường hàng tỷ doanh thu; đồng thời dữ liệu lô giúp thu hồi nhanh khi có sự cố
chất lượng.

**Case generic — ransomware tấn công hệ thống WMS:** công ty phân phối 3 ngày
nhập xuất tay bằng Excel giấy, đơn trễ 40%. Sau sự cố: (i) quy trình offline
emergency, (ii) sao lưu & phân quyền, (iii) hợp đồng IT 24/7 response. Bài học:
resilience bao gồm **khả năng vận hành thủ công có kiểm soát**, không chỉ dự
phòng trên hệ thống.

**Lỗi thường gặp:**

- Có ma trận rủi ro nhưng không ai sở hữu và không diễn tập (tabletop exercise).
- Dual source "trên giấy" nhưng NCC thứ hai chưa bao giờ chạy đơn lớn.
- Đầu tư traceability theo trào lưu mà khách hàng không yêu cầu/ko trả thêm.
- Đẩy Scope 3 báo cáo mà dữ liệu NCC không có.
- AI forecasting mua về nhưng quy trình forecast monthly vẫn… Excel và không ai
  sửa bias.

**Checklist đánh giá & nâng cao phục hồi SC:**

- [ ] Bản đồ rủi ro cập nhật: top 10 rủi ro, xác suất × tác động, chủ sở hữu.
- [ ] Kế hoạch ứng phó từng rủi ro cao (BCP): ai làm gì giờ đầu tiên.
- [ ] Single points of failure: danh sách NCC/kho/cảng đơn nguồn.
- [ ] Diễn tập ít nhất 1 kịch bản/năm (mô phỏng hoặc tabletop).
- [ ] Visibility: theo dõi đơn critical theo thời gian thực (hoặc cập nhật/ngày).
- [ ] Kế hoạch bền vững: mục tiêu Scope 3 + truy xuất theo yêu cầu thị trường
      xuất khẩu.

#### Ứng dụng thực tế

Làm việc nội bộ: viết **1 kịch bản sự cố 2 trang** cho quy trình then chốt của
bộ phận bạn (ví dụ: hệ thống chấm công sập, thủ kho nghỉ đột xuất, NCC phần
mềm dừng) — 2 trang này thường quý hơn mọi báo cáo 50 trang không diễn tập.

#### Câu hỏi phỏng vấn xin việc

1. **Nêu 3 chiến lược tăng resilience cho chuỗi cung ứng và chi phí của chúng.**
   *Gợi ý:* đa nguồn (tăng chi phí mua/quản lý), buffer stock (chi phí vốn giữ),
   nearshoring (đơn vị giá cao hơn); chọn theo criticality.
2. **Traceability blockchain giá trị khi nào, không cần khi nào?**
   *Gợi ý:* cần khi khách hàng/yêu cầu xuất khẩu đòi truy xuất lô, thu hồi nhanh,
   chống hàng giả; không cần khi hàng commodity, không yêu cầu, dữ liệu đầu vào
   không đáng tin (blockchain không cứu được dữ liệu sai).
3. **AI dự báo có thay thế chuyên gia dự báo/S&OP không?**
   *Gợi ý:* AI giảm MAPE phần định lượng, nhưng sự kiện bất thường, kiến thức
   thị trường và quy trình ra quyết định S&OP vẫn cần người; AI là công cụ trong
   quy trình, không thay chủ sở hữu quyết định.

---

## Tóm tắt nhanh

| Bài | Khung/công cụ chính | Công thức/ngưỡng nhớ |
|-----|----------------------|----------------------|
| 1 | Bullwhip, network design, SCOR | Turns = COGS / tồn kho bình quân |
| 2 | Làm mooth, MAPE/bias, newsvendor | $p = C_u/(C_u+C_o)$ |
| 3 | S&OP 6 bước, CPFR, MPS/MRP | Tháng/S&OP, tuần/S&OE |
| 4 | EOQ, ROP, safety stock, ABC-XYZ | $EOQ=\sqrt{2DS/H}$; $SS=z\sigma_L$ |
| 5 | Vận tải, DC, Incoterms, 3PL | Chi phí giao/đơn = cước/đơn–chuyến |
| 6 | Kraljic, đàm phán, rủi ro NCC | Total value of ownership |
| 7 | OTIF, perfect order, SCOR | POR = tích 4 chỉ số con |
| 8 | Resilience, ESG, AI, traceability | Ma trận xác suất × tác động |

## Thuật ngữ Anh–Việt

| Anh | Việt |
|-----|------|
| Supply Chain (SC) | Chuỗi cung ứng |
| SCM — Supply Chain Management | Quản trị chuỗi cung ứng |
| Bullwhip effect | Hiệu ứng roi da buồm |
| Upstream / Downstream | Thượng lưu / Hạ lưu |
| Decoupling point | Điểm tách đẩy–kéo |
| Push / Push–Pull | Đẩy theo dự báo / Kéo theo đơn |
| S&OP | Kế hoạch bán hàng & vận hành |
| CPFR | Hợp tác lập kế hoạch, dự báo & bổ sung |
| MPS / MRP | Lịch sản xuất chính / Kế hoạch yêu cầu vật tư |
| EOQ | Lô đặt hàng kinh tế |
| Safety stock | Tồn kho dự phòng |
| ROP — Reorder Point | Điểm đặt lại hàng |
| Service level | Mức dịch vụ / mức đáp ứng |
| Cycle / Fill rate | Tỷ lệ có hàng theo chu trình / theo đơn |
| Inventory turnover | Vòng quay hàng tồn kho |
| ABC / XYZ analysis | Phân tích theo giá trị / độ ổn định |
| Logistics | Hậu cần |
| Transportation / Freight | Vận tải / Cước vận chuyển |
| FTL / LTL | Cả chuyến / Lẻ theo trọng khối |
| DC — Distribution Center | Trung tâm phân phối |
| Cross-docking | Nhận – chuyển tiếp không lưu kho |
| Last mile | Chặng cuối |
| Reverse logistics | Hậu cần ngược (đổi trả) |
| Incoterms (FOB, CIF, DDP) | Điều khoản thương mại quốc tế |
| 3PL / 4PL | Hậu cần bên thứ ba / điều phối hậu cần ngoài |
| Procurement | Mua sắm |
| Kraljic matrix | Ma trận phân loại mua hàng |
| Sourcing / Dual sourcing | Tìm nguồn / Hai nguồn cung |
| Supplier scorecard | Thẻ điểm nhà cung cấp |
| OTIF | Đúng hạn & đủ hàng |
| Perfect Order Rate | Tỷ lệ đơn hoàn hảo |
| SCOR | Khung tham chiếu vận hành SC |
| Resilience | Khả năng phục hồi |
| Risk mitigation | Giảm thiểu rủi ro |
| Traceability | Truy xuất nguồn gốc |
| Digital twin | Bản sao số (mô phỏng hệ thống) |
| Sustainability / ESG | Bền vững |
| Bullwhip / Demand amplification | Phóng đại nhu cầu |

---
*Từ đây, làm bài tập trong `cau-hoi.md` và xem nhanh `slides.md` của chuyên đề.*
