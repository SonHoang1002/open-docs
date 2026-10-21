# QUẢN TRỊ VẬN HÀNH (Operations Management)

## Mở đầu

Quản trị vận hành (Operations Management – OM) là học phần biến chiến lược thành sản phẩm/dịch vụ thực tế: thiết kế quy trình, quản trị tồn kho, chất lượng, dự báo và cải tiến liên tục. Trong MBA, OM trả lời câu hỏi: **làm sao cung cấp đúng sản phẩm/dịch vụ cho khách, đúng số lượng, đúng chất lượng, với chi phí thấp nhất và dòng tiền tốt nhất**. Đây là môn "nặng toán nhưng cứu doanh nghiệp thật" — mọi sai lầm vận hành đều hiện trên báo cáo tài chính ngay quý kế tiếp.

**Mục tiêu học tập — sau học phần, học viên có thể:**

1. Vẽ và phân tích quy trình; tính flow time, WIP, throughput; nhận diện bottleneck bằng Little's Law.
2. Cân bằng công suất dây chuyền, thiết kế takt time và quản trị điều độ sản xuất.
3. Tính toán tồn kho: EOQ, safety stock, điểm đặt hàng lại; vận hành JIT và ABC.
4. Phân tích chất lượng: TQM, Six Sigma, công cụ SPC (control chart, capability).
5. Dự báo nhu cầu và lập kế hoạch: MRP, S&OP; cải tiến lean trong sản xuất, văn phòng và khởi nghiệp.
6. Đo lường hiệu suất vận hành bằng OEE và hệ thống KPI.

**Vị trí trong chương trình MBA:** môn thường đặt sau Tài chính & Marketing, song song hoặc trước Chuỗi cung ứng nâng cao. Đây là nơi học viên "mổ" doanh nghiệp sản xuất/bán lẻ/dịch vụ bằng số liệu, không bằng cảm tính.

---

## Mục lục các bài

- **Bài 1:** Tổng quan Quản trị vận hành — vai trò & thiết kế quy trình
- **Bài 2:** Dòng chảy & thời gian luân chuyển — Little's Law & bottleneck
- **Bài 3:** Cân bằng công suất & điều độ sản xuất
- **Bài 4:** Quản trị tồn kho — EOQ, JIT & safety stock
- **Bài 5:** Quản trị chất lượng — TQM, Six Sigma & SPC
- **Bài 6:** Dự báo & lập kế hoạch — MRP, S&OP
- **Bài 7:** Lean — sản xuất, văn phòng & lean startup
- **Bài 8:** Đo lường hiệu suất — OEE & KPI vận hành

---

## Bài 1: Tổng quan Quản trị vận hành — vai trò & thiết kế quy trình

### Phần A — Cơ bản

**Định nghĩa OM.** Quản trị vận hành là hoạt động quản lý các quá trình chuyển đổi (transformation process) đầu vào (nguyên liệu, lao động, thông tin, vốn) thành đầu ra (sản phẩm, dịch vụ) có giá trị cho khách hàng. Phạm vi OM rộng hơn sản xuất: logistics, dịch vụ khách hàng, bệnh viện, ngân hàng, phần mềm đều là "vận hành".

**Ba loại hệ thống chuyển đổi:**

| Loại | Đặc điểm | Ví dụ |
|---|---|---|
| Hàng hóa (manufacturing) | Vật lý, tồn kho được, đo đạc dễ | Nhà máy điện thoại, thực phẩm |
| Dịch vụ (service) | Vô hình, tiêu dùng đồng thời với sản xuất | Bệnh viện, nhà hàng, bank |
| Lai (hybrid) | Phần sản phẩm + phần dịch vụ | Bán lẻ, chuỗi cà phê, xe máy có bảo hành |

**Chỉ số vận hành nền tảng (nhóm "tam giác vàng"):**

1. **Chi phí unit (C):** chi phí trên mỗi đơn vị đầu ra.
2. **Chất lượng (Q):** đúng đặc tả, ít lỗi, khách hài lòng.
3. **Thời gian/Tốc độ (T):** thời gian hoàn thành đơn, time-to-market.
4. **Flex linh hoạt (F):** khả năng đổi chủng loại, số lượng nhanh.
5. **Dòng tiền/tồn kho (I):** vốn quay nhanh, tồn kho thấp.

Công thức đơn giản hóa: $S = f(C, Q, T, F, I)$ — điểm số vận hành tổng thể là hàm của 5 trục; cải thiện một trục mà không biết trục nào chiến lược là lãng phí.

**Phân loại quy trình theo dòng chảy:**

- **Nhánh (Job shop):** ít lượng, nhiều chủng loại (xưởng cơ khí custom, bệnh viện chuyên khoa).
- **Dòng (Flow shop/line):** lượng lớn, chủng loại ít (dây chuyền nước giải khát).
- **Lặp lại (Batch):** trung gian, lô sản xuất (thực phẩm theo lô, phần mềm theo sprint).
- **Dự án (Project):** duy nhất, quy mô lớn (xây cầu, triển khai ERP).
- **Lưu lượng cao liên tục (Continuous):** hóa dầu, điện.

**Ví dụ tính đơn giản:** Một xưởng in ấn: capacity 1.000 thẻ/ngày, demand trung bình 750 thẻ/ngày → công suất utilized = $750/1000 = 75\%$; nếu đơn tăng lên 950 → utilized = 95%, biên buffer chỉ còn 50 thẻ → dễ trễ hạn khi có sự cố. Câu hỏi vận hành: giữ buffer bao nhiêu tùy rủi ro demand?

### Phần B — Nâng cao

**Sự đánh đổi vận hành (Skinner, "The Focused Factory").** Không nhà máy nào tối ưu cả 5 trục $C, Q, T, F, I$ cùng lúc; nhà máy "focused" chọn 2–3 trục then chốt theo chiến lược khách hàng. VD: factory dược xuất khẩu tập trung Q+T (GMP, đúng hạn), không đua F (đổi màu sắc liên tục). "Sản phẩm nhiều chủng loại với chi phí thấp nhất, giao trong 1 ngày" là viễn vông vận hành.

**Sức chứa (capacity) vs. demand & quản trị peak.** Capacity thiết kế (design) vs. capacity hiệu dụng (rated/effective). Quản trị đỉnh: smoothing, booking trước, giá theo giờ (yield management của hàng không/khách sạn), thuê ngoài bờ (overflow partner). Khái niệm "utilization tối ưu" không phải 100%: utilization quá cao → biến thiên (variability) gây trễ gấp đôi (hiệu ứng queue — xem Bài 2).

**Queuing (hàng đợi) — nguyên lý then chốt.** $L_q$ (số trung bình trong hàng đợi) tăng phi tuyến khi util $\to 1$. Công thức M/M/1 đơn giản: $L_q = \frac{\rho^2}{1-\rho}$ với $\rho$ = utilization. VD: $\rho=0.5 → L_q=0.5$; $\rho=0.9 → L_q=8.1$; $\rho=0.95 → L_q=9.02$. Bài học: **chạy 95% công suất triền miên = xây hàng đợi khổng lồ** cho khách hàng.

**Design thinking trong dịch vụ (service blueprint).** Vẽ: front-stage (khách thấy) vs. back-stage (ẩn), line of interaction, line of visibility, fail points. Dịch vụ OM cần thiết kế "script + tự do có kiểm soát": nhà hàng fast-food chuẩn hóa 90% pha chế nhưng linh hoạt 10% yêu cầu đặc biệt.

### Phần C — Thực tế

**Case: Masan Consumer — OM nền tảng cho FMCG.** Masan đầu tư capacity nhà máy nước mắm/hoa quả theo mùa (cherry, táo), cân bằng giữa util cao mùa vụ và buffer xuất khẩu. Bài học OM: (1) chuẩn hóa SKU lõi để line chạy liên tục (reduce changeover); (2) dùng công suất dư nhận gia công (co-packing) cho đối thủ ngoài mùa — biến fixed cost thành nguồn thu; (3) KPI vận hành gắn P&L: chi phí/logistics unit, yield %.

**Case generic: chuỗi bánh mì 40 cửa hàng.** Morning peak 6–8h chiếm 60% doanh số; capacity nướng theo batch cố định → 8h15 hết hàng, 10h thừa. Chẩn nhật OM: forecast theo giờ theo cửa hàng + nướng 2 đợt nhỏ + pre-bake dough lạnh. Kết quả: hết hàng giờ cao điểm giảm 70%, waste cuối ngày giảm 45% — classic OM, không cần mở rộng cửa hàng.

**5 lỗi thường gặp của quản lý Việt Nam:**

1. **Tối ưu cục bộ, hỏng toàn hệ thống:** phòng mua mua giá rẻ → chất lượng đầu vào kém → chi phí lỗi (failure cost) phình gấp 3.
2. **Chạy util 98% mà không hiểu queue:** "nhà máy lúc nào cũng kín lịch" = giao trễ làm khách phàn nàn, overtime vô tận.
3. **Không tách capacity thiết kế/effective:** kế hoạch dựa trên capacity "trên giấy", thực tế mất 15% downtime máy.
4. **Bỏ qua tính biến thiên:** plan theo trung bình, không có buffer/worst case.
5. **Đo OM bằng cảm tính:** "vận hành ổn" thay vì OEE, lead time, defect rate, inventory turns.

**Checklist chẩn đoán quy trình (nửa ngày):**

- [ ] Vẽ 1 dòng chảy end-to-end cho sản phẩm/dịch vụ chủ lực (khách đến → khách nhận).
- [ ] Đánh số từng bước: value-add / necessary non-value / waste (theo lean).
- [ ] Ghi số liệu mỗi bước: time/unit, % lỗi, WIP, chờ đợi.
- [ ] Xác định bottleneck (bước utilization cao nhất hoặc thời gian cycle dài nhất).
- [ ] Chọn 2 chỉ số pain-point khách hàng cảm nhận nhiều nhất (chờ, lỗi, trễ).

#### Ứng dụng thực tế

Áp dụng service blueprint cho phòng khám đa khoa: bước tiếp nhận (front) chờ 35 phút vì bác sĩ phòng 2 "vừa khám vừa viết hồ sơ" (back-stage bottleneck). Sửa: tách nhập liệu cho nhân viên y tế (parallel task), đặt lịch theo khung 15 phút, màn hình hiển thị thứ tự. Thời gian khám trung bình giảm từ 42 xuống 28 phút, số khám/ngày tăng 22% không tăng giờ làm — OM chứ không phải marketing.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Phân biệt manufacturing và service operations — thách thức OM riêng biệt?
**Gợi ý trả lời:** Manufacturing: tồn kho buffer được, capacity theo máy, chất lượng đo bằng defect rate; khó khăn: changeover, planning. Service: không lưu trữ được (phòng trống đêm qua mất vĩnh viễn), khách tham gia quy trình (variability), chất lượng cảm nhận. Khó khăn service: dự báo giờ/địa điểm, đồng bộ cung–cầu theo thời gian thực; giải pháp: booking, giá giờ linh hoạt, chuẩn hóa kịch bản.

**Câu 2:** Vì sao utilization 100% không phải mục tiêu tốt?
**Gợi ý trả lời:** Do tính biến thiên: ở util cao, hàng đợi và thời gian chờ tăng phi tuyến (queue). Util 95%+ khiến OT, trễ hẹn, burnout; đồng thời không còn chỗ chứa spike nhu cầu hay xử lý sự cố. Util mục tiêu phụ thuộc CV biến thiên, nhưng thường 70–85% cho môi trường nhiều bất định.

**Câu 3:** Bạn mô tả một quy trình bạn đã cải thiện gần đây?
**Gợi ý trả lời:** (Khung STAR) Tình huống: quy trình duyệt chi phí 7 bước, trung bình 9 ngày. Hành động: đo time mỗi bước (phát hiện bước 4 – kế toán trưởng – kẹt 4 ngày); mang dữ liệu đề xuất ngưỡng duyệt online tự động <5 triệu; pilot 1 phòng. Kết quả: 9 ngày → 2,5 ngày, 0 lỗi phê duyệt, tăng satisfaction nội bộ — kèm công thức: đo baseline → tìm bottleneck → sửa điểm kẹt → đo lại.

---

## Bài 2: Dòng chảy & thời gian luân chuyển — Little's Law & bottleneck

### Phần A — Cơ bản

**Ba biến số dòng chảy (flow fundamentals):**

- **Throughput ($TH$):** số đơn vị hoàn thành / đơn vị thời gian (đơn vị/giờ,/ngày).
- **Work-in-process ($WIP$):** số đơn vị đang trong quy trình (bao gồm đang làm + đang chờ).
- **Flow time ($FT$):** thời gian trung bình một đơn vị ở trong quy trình từ đầu đến cuối (gồm process time + wait time).

**Little's Law (định luật Little):**

$$WIP = TH \times FT$$

Điều kiện: hệ thống ổn định (rate vào ≈ rate ra trung bình), không có "xám xịt" biến thiên cực đoan ngoài dự liệu. Ứng dụng: biết 2 đại lượng, tính đại lượng thứ 3.

**Ví dụ tính:**

1. Xưởng gia công: TH = 50 đơn/ngày, WIP trung bình = 200 đơn → $FT = WIP/TH = 200/50 = 4$ ngày mỗi đơn ở trong xưởng.
2. Phòng khám: 200 bệnh nhân/ngày khám xong, mỗi người trung bình 1,5 giờ từ tiếp nhận đến ra về → WIP = $200 \times 1.5 = 300$ "giờ-bệnh nhân" đồng thời tương đương $300$ người-giờ; nếu mở 10 giờ/ngày → TB ~30 người có mặt cùng lúc.
3. Giảm WIP 25% (từ 200 xuống 150) mà TH giữ 50 → $FT = 3$ ngày — rút ngắn 25% lead time chỉ bằng giảm WIP (nếu không tạo bottleneck mới).

**Bottleneck (nút cổ chai).** Bước có công suất thấp nhất trong chuỗi (capacity nhỏ nhất) quyết định throughput toàn hệ thống: $TH_{sys} = \min_i (capacity_i)$. Bước không phải bottleneck có "idle time" — đó là hệ quả tất yếu, không phải lãng phí phải triệt tiêu tuyệt đối. Công thức: $Util_i = \frac{TH_{sys}}{capacity_i}$; bottleneck có util ≈ 100% (trừ downtime).

**Process time vs. cycle time vs. lead time:**

- **Process time:** thời gian gia công thực sự cho 1 đơn vị.
- **Cycle time:** khoảng thời gian giữa 2 đơn vị đầu ra (tại bước bottleneck).
- **Lead time (flow time):** toàn bộ từ yêu cầu đến giao.
- $TH = 1/\text{cycle time}$ (đơn vị cùng nhịp).

**Ví dụ tính bottleneck:** 3 bước: A: 10 phút/đơn, capacity 6/giờ; B: 6 phút/đơn nhưng chỉ 1 máy, capacity 10/giờ; C: 4 phút/đơn, capacity 15/giờ. TH hệ thống = min(6, 10, 15) = 6 đơn/giờ — A là bottleneck. Đầu tư thêm máy cho B = lãng phí; nâng capacity A (thêm máy hoặc giảm process time) mới tăng TH.

### Phần B — Nâng cao

**Hiệu ứng bullwhip trong dòng chảy thông tin.** Biến thiên nhu cầu tăng dần khi đi ngược lên chuỗi cung ứng (order > demand thật) do: batch ordering, dự báo sai, phân bổ thiếu, tăng giá dự kiến. Bài học: chia sẻ POS data real-time, giảm biên độ đặt hàng, VMI (vendor-managed inventory).

**Theory of Constraints (Goldratt – "The Goal").** 5 bước lặp: (1) identify constraint, (2) exploit (khai thác tối đa bottleneck, không để idle), (3) subordinate (các bước khác phục vụ bottleneck — kể cả chấp nhận idle có chủ đích), (4) elevate (đầu tư nâng bottleneck), (5) repeat (không ngủ trên chiến thắng — constraint mới xuất hiện). Kèm khái niệm "dependent events + statistical fluctuations": biến thiên cộng dồn → không san bằng mọi bước bằng cách tăng WIP.

**Đo flow: throughput time distribution.** Trung bình có thể che mất: 90% đơn 2 ngày, 10% đơn 20 ngày → trung bình 3,8 ngày "tốt đẹp". Khách hàng cảm nhận theo phần đuôi (P90, P95) — quản trị theo percentiles, không chỉ mean.

**WIP cap & CONWIP.** Kiểm soát WIP bằng cap (đơn cao nhất cho phép trong hệ thống) để ổn định flow time: khi WIP bị chặn, bước trước tự "chờ" thay vì chất hàng. CONWIP (constant WIP): WIP cố định, pull signal khi hoàn thành 1 đơn → đơn mới được phép vào. Đây là nền tảng của pull/kanban.

### Phần C — Thực tế

**Case: Rang Dong / nhà máy điện tử — Little's Law soát tồn kho thành phẩm.** TH = 5.000 SP/ngày, WIP + FG bình quân 45.000 SP → $FT = 9$ ngày tồn kho + xử lý. Sau khi giảm lô và tinh gọn packing: WIP 45k → 30k, TH giữ nguyên → $FT = 6$ ngày — giải phóng ~60 tỷ vốn lưu động mà không tăng doanh số. Little's Law là công cụ CFO+OM đọc chung.

**Case generic: app giao đồ ăn — bottleneck "ảo".** Phân tích: restaurant prep 8', rider waiting 4' (idle), system matching 3'. TH bị chặn bởi thuật toán matching giờ cao điểm (matching > capacity) — không phải nhà hàng. Sửa: dynamic batching + ETA hiển thị → matching time P50 giảm 40%, hệ thống không cần thêm tài xế giờ thấp điểm.

**5 lỗi thường gặp:**

1. **Cải thiện không bottleneck** — bộ phận nhàn rỗi 30% "được đầu tư", bottleneck vẫn 100%, TH không đổi → thất vọng "đầu tư vô ích".
2. **Dùng Little's Law sai hệ thống** (tính WIP của 10 sản phẩm gộp rồi so với TH 1 sản phẩm).
3. **Đo lead time theo trung bình** che mất 10% đơn trễ nghiêm trọng (khách phàn nàn từ đuôi phân phối).
4. **Chất WIP để "phòng khi"** → dòng tiền chết, lead time phình, lỗi ẩn giấu trong tồn kho cũ.
5. **Không tính wait time** khi báo "thời gian xử lý 2 giờ" — khách chờ 6 giờ, 2 giờ chỉ là process time.

**Checklist phân tích dòng chảy (1 ngày):**

- [ ] Chọn 1 dòng sản phẩm/dịch vụ chủ lực, vẽ map value stream (cả thông tin & vật chất).
- [ ] Đo: process time, wait time, % lỗi từng bước; tính WIP, TH, FT thực tế.
- [ ] Xác định bottleneck bằng capacity & util; xác nhận bằng số liệu 4 tuần.
- [ ] Tính kịch bản: nếu bottleneck +20% capacity → TH tăng bao nhiêu? (thường trả lời được 80% bài toán đầu tư).
- [ ] Thiết lập WIP cap thử nghiệm 2 tuần, so sánh FT và OT.

#### Ứng dụng thực tế

Chuỗi khách sạn boutique áp Little's Law cho quy trình check-in: TH = 40 lượt/ngày, WIP (số khách trong sảnh chờ check-in hoặc chờ phòng) TB = 8 người → $FT = 8/40 = 0.2$ ngày = 4,8 giờ "chờ" trung bình (phần lớn vì phòng chưa sẵn sàng 12:00). Sửa dòng chảy: shift dọn phòng theo priority khách nhận sớm, check-in soft (vào sảnh, phòng nhắn tin khi xong) — WIP giảm còn 3 → FT = 1,8 giờ; NPS check-in tăng 18 điểm, không thêm nhân viên.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Trình bày Little's Law và một ứng dụng bạn từng làm.
**Gợi ý trả lời:** $WIP = TH \times FT$ — tồn kho trung bình = tốc độ hoàn thành × thời gian luân chuyển. Ứng dụng mẫu: tồn kho thành phẩm 45.000 SP, xuất 5.000/ngày → 9 ngày tồn; giảm lô 30% → WIP 30.000 → 6 ngày, giải phóng vốn. Law cho thấy: giảm lead time có thể bắt đầu từ giảm WIP, không chỉ tăng tốc xử lý.

**Câu 2:** Làm sao tìm bottleneck thực sự trong một quy trình 8 bước?
**Gợi ý trả lời:** Thu thập capacity thiết kế/effective và thời gian cycle thực tế từng bước 2–4 tuần (bao gồm downtime, defect rework); bottleneck là bước có util cao nhất hoặc rate thực tế thấp nhất; đối chiếu bằng WIP chồng chất đứng trước bước đó ("hàng đợi lớn nhất"). Không tin bản vẽ lý thuyết — tin số liệu hiện trường.

**Câu 3:** Sếp nói "tất cả phòng ban phải 90% utilization" — bạn phản hồi ra sao?
**Gợi ý trả lời:** Tôi giải thích bằng queueing: util 90%+ khiến thời gian chờ tăng phi tuyến, đặc biệt khi biến thiên cao (dịch vụ, đơn hàng thất thường); util mục tiêu phải tính theo CV của nhu cầu và thời gian xử lý. Tôi đề xuất: bottleneck giữ util cao (85–95%), các bước khác util mục tiêu thấp hơn để buffer biến thiên, đồng thời đo lead time khách hàng cảm nhận — tối ưu hệ thống không phải từng phòng ban.

---

## Bài 3: Cân bằng công suất & điều độ sản xuất

### Phần A — Cơ bản

**Cycle time & takt time.**

- **Cycle time (CT):** thời gian thực tế giữa hai đơn vị hoàn thành tại một trạm.
- **Takt time:** nhịp độ sản xuất khớp nhu cầu khách: $Takt = \frac{\text{Thời gian làm việc hiệu dụng}}{\text{Nhu cầu khách hàng cùng kỳ}}$.

**Ví dụ tính:** Ca 8 giờ = 480 phút, khách cần 480 đơn/ngày → $Takt = 480/480 = 1$ phút/đơn. Nếu CT bất kỳ trạm > takt → trạm đó là bottleneck, không đủ hàng. Nếu CT < takt → nhàn rỗi (cần gộp việc hoặc giảm nhân).

**Cân bằng dây chuyền (line balancing).** Mục tiêu: gán các nhiệm vụ (task) có thời gian cố định vào các trạm sao cho: (1) mỗi trạm không vượt takt; (2) số trạm và tổng thời gian nhàn rỗi nhỏ nhất. Chấm điểm: $Efficiency = \frac{\sum t_{task}}{n_{trạm} \times Takt} \times 100\%$.

**Ví dụ tính:** 5 task: 0.4, 0.6, 0.5, 0.3, 0.2 phút; takt = 1.0 phút. Gói: ST1 = 0.4+0.6=1.0; ST2 = 0.5+0.3=0.8; ST3 = 0.2 → 3 trạm, tổng task = 2.0 phút. $Eff = 2.0/(3×1.0) = 66.7\%$. Cải thiện: gộp 0.3+0.2+0.4=0.9, 0.6+0.5 quá takt — cần sắp lại: ST1=0.4+0.3+0.2=0.9; ST2=0.6; ST3=0.5 → vẫn 3 trạm nhưng idle ít hơn... minh họa: bài toán cân bằng = xếp bài có ràng buộc thời gian; heuristic: longest task time, most following tasks.

**Điều level (heijunka / production leveling).** Thay vì sản xuất lô lớn 1 chủng loại (batch 1.000 A rồi 1.000 B), blend theo takt: mỗi giờ ra 10A + 5B + 2C. Ưu: tồn thành phẩm giảm, phản ứng demand hỗn hợp tốt hơn, load nhà cung cấp mượt. Điều kiện: changeover time nhỏ (SMED).

**Sản xuất đẩy (push) vs. kéo (pull).**

- **Push:** plan đặt lịch sản xuất dựa trên forecast → đẩy hàng xuống dòng bất kể nhu cầu thật → WIP cao nếu forecast sai.
- **Pull:** chỉ sản xuất khi có tín hiệu tiêu thụ (kanban, replenishment signal) → WIP bị cap, align với demand thật, cần sẵn sàng phụ tùng/lead time nhà cung ứng ngắn.

### Phần B — Nâng cao**

**Capacity planning nhiều tầng.** Capacity theo giờ/ngày/tháng; loading (phân bổ load cho trạm) vs. scheduling (thứ tự). Chase strategy (điều nhân theo demand: overtime, ca tăng, thuê ngoài) vs. level strategy (sản lượng đều, dùng tồn kho buffer): chọn theo chi phí lưu kho vs. chi phí điều độ nhân công.

**Economic production lot (EPQ) & trade-off changeover.** Lô lớn → changeover/đơn vị thấp nhưng tồn kho cao; lô nhỏ → linh hoạt nhưng tần suất đổi máy tăng. $EPQ$ (mô hình sản xuất-lưu kho): $Q^* = \sqrt{\frac{2DS}{H}\cdot\frac{p}{p-d}}$ — với $D$ nhu cầu, $S$ chi phí setup/lần, $H$ chi phí lưu kho/đơn vị/năm, $p$ rate sản xuất, $d$ rate tiêu thụ.

**Ví dụ tính EPQ:** $D=10.000$ SP/năm, $S=500.000$đ/lần setup, $H=2.000$đ/SP/năm, $p=200$ SP/ngày, $d=40$ SP/ngày:
$Q^* = \sqrt{\frac{2\times10.000\times500.000}{2.000}\times\frac{200}{160}} = \sqrt{5.000.000\times1.25} \approx 2.500$ SP/lô.

**Muti-machine, multi-product scheduling.** Job shop: sequencing rules (SPT – shortest processing time giảm avg flow time; EDD – earliest due date giảm trễ hạn; CR – critical ratio ưu tiên đơn khẩn). Đây là trọng tâm bài toán scheduling thực tế.

**Variability reduction trước khi tăng capacity.** Nếu downtime máy bottleneck là 20% vì bảo trì hỗn loạn, nâng util bằng mua máy thứ hai = trả tiền cho sự hỗn loạn; trước đó: TPM (total productive maintenance), chuẩn hóa, 5S. Quy tắc: giảm biến thiên trước, nâng capacity sau.

### Phần C — Thực tế

**Case: nhà máy giày da Việt Nam — heijunka sau SMED.** Changeover 90 phút → line ưu tiên lô 5.000 để giảm setup → tồn WIP cao, khách EU phàn nàn small batch. Chương trình SMED: quay phim, tách internal/external setup, chuẩn hóa fixture → changeover 90 → 18 phút. Sau đó level: mixed model 3 size phổ biến theo takt — WIP giảm 40%, OT giảm 60%, kháchEU tăng đơn frequent buyer. Bài học: level không khả thi nếu không SMED.

**Case generic: tiệm bánh thủ công vs. chuỗi.** Tiệm 5 người, 40 SKU theo đơn, không takt (ai xong việc nấy) → khách chờ 40 phút giờ cao điểm. Chẩn nhật: 6 SKU chiếm 70% doanh số → tách "line hot" cho 6 SKU (takt 6 phút), SKU hiếm vào line cold batch theo giờ chẵn. Thời gian chờ giờ cao điểm: 40 → 12 phút, năng suất/người +25%.

**5 lỗi thường gặp:**

1. **Cân bằng trên giấy, không đo hiện trường** — cycle time biến thiên 30% giữa 2 ca, bảng plan vô nghĩa.
2. **Lô lớn để "tiết kiệm setup"** mà quên chi phí lưu kho, rủi ro lỗi lô, mất linh hoạt.
3. **Chase/Olevel chọn theo cảm tính:** không so chi phí lưu kho vs. chi phí overtime.
4. **Thêm công suất ở không-bottleneck** — "nhà máy đầy giờ nhưng tổng output không tăng".
5. **Bỏ SMED mà đòi lean** — mixed model không có thì heijunka là ảo.

**Checklist cân bằng & điều độ (2 ngày):**

- [ ] Tính takt từ demand + giờ hiệu dụng; đo CT 10 lần/trạm.
- [ ] Chọn quy tắc xếp thứ tự (SPT/EDD/CR) phù hợp ưu tiên (flow vs. due date).
- [ ] Lọc top 20% SKU theo doanh số → line hot / batch cold.
- [ ] Đánh giá 3 kịch bản: chase (OT), level (tồn), hybrid — so chi phí.
- [ ] Pilot SMED 1 máy bottleneck, mục tiêu giảm setup ≥50%.

#### Ứng dụng thực tế

Áp dụng takt cho phòng xử lý hồ sơ vay tín chấp: 8 giờ hiệu dụng = 480 phút, demand 60 hồ sơ/ngày → takt 8 phút. Đo: bước thẩm định 12 phút (bottleneck). Thay vì mua thêm phần mềm, tách thẩm định thành checklist chuẩn 5 phút + case khó 20 phút (nhánh exception flow) — CT bình quân thẩm định về 7,5 phút, TH từ 40 → 60 hồ sơ/ngày, tỉ lệ trễ hạn giảm một nửa. Line balancing applies cho dịch vụ, không chỉ nhà máy.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Tính takt time và giải thích vì sao cycle time > takt là vấn đề.
**Gợi ý trả lời:** $Takt = giờ hiệu dụng/nhu cầu$. Cycle time > takt nghĩa là trạm không kịp nhịp khách — hàng tích tụ (WIP phình) hoặc trễ hẹn. Phải: giảm process time, gộp nhân/máy, hoặc tách exception; không thể "cố gắng nhanh hơn" bền vững nếu CT cấu trúc > takt.

**Câu 2:** Push và pull khác nhau thế nào? Khi nào dùng?
**Gợi ý trả lời:** Push: sản xuất theo forecast, WIP cao nếu forecast sai, phù hợp nhu cầu ổn định, lead time cung ứng dài. Pull: sản xuất theo tín hiệu tiêu thụ, WIP bị cap, phù hợp nhu cầu biến thiên, cần supplier nhanh/chất lượng ổn. Hỗn hợp phổ biến: plan bậc tháng, pull bậc tuần/ngày (CONWIP/kanban).

**Câu 3:** Đánh đổi chase vs. level strategy.
**Gợi ý trả lời:** Chase: điều sản lượng khớp demand (OT, ca ca, thuê ngoài) — tồn kho thấp, chi phí lao động cao/instability việc làm. Level: sản lượng đều, dùng tồn kho absorb — nhân công ổn định, chi phí lưu kho & rủi ro obsolescence. Chọn theo: chi phí lưu kho/unit vs. chi phí điều độ, tính chất hàng (dễ hỏng → chase/level cẩn thận), cam kết nhân sự.

---

## Bài 4: Quản trị tồn kho — EOQ, JIT & safety stock

### Phần A — Cơ bản

**Vai trò & chi phí tồn kho.** Tồn kho buffer: (1) bảo vệ khỏi biến thiên nhu cầu/cung; (2) lợi thế quy mô (mua lô, sản xuất lô); (3) speculative (chờ giá). Chi phí: giữ kho (capital, storage, obsolescence, insurance — thường 15–30%/năm giá trị), đặt hàng/setup, thiếu hụt (lost sales, backorder, phạt hợp đồng).

**4 loại tồn kho trong chuỗi:** nguyên liệu (raw) → WIP → thành phẩm (FG) → phụ tùng dự phòng. Tồn "ẩn" (pipeline, transit) cũng tính vào hệ thống.

**Mô hình EOQ (Economic Order Quantity):**

$$Q^* = \sqrt{\frac{2DS}{H}}$$

- $D$: nhu cầu/năm, $S$: chi phí mỗi lần đặt hàng/setup, $H$: chi phí giữ 1 đơn vị/năm.
- Số lần đặt/năm: $N = D/Q^*$; chu kỳ đặt: $T = Q^*/D$ (năm).

**Ví dụ tính EOQ:** $D = 12.000$ SP/năm (1.000/tháng), $S = 200.000$đ/lần đặt, $H = 3.000$đ/SP/năm:
$Q^* = \sqrt{\frac{2\times12.000\times200.000}{3.000}} = \sqrt{1.600.000} \approx 1.265$ SP. $Q^* \approx 1.265$ SP/lần; $N = 12.000/1.265 \approx 9.5$ lần/năm. Tổng chi phí tối ưu: $TC = \sqrt{2DSH} = \sqrt{2\times12.000\times200.000\times3.000} \approx 3.795.000$đ/năm.

**Điểm đặt hàng lại (Reorder Point – ROP):**

$$ROP = d \times L + SS$$

$d$: nhu cầu/ngày, $L$: lead time (ngày), $SS$: tồn an toàn.

**Safety stock:** $SS = z \times \sigma_{LT}$, với $z$ theo dịch vụ mục tiêu (95% → $z \approx 1.645$; 99% → $z \approx 2.33$); $\sigma_{LT}$ = độ lệch chuẩn nhu cầu trong lead time. Trường hợp demand và lead time đều biến thiên: $\sigma_{LT} = \sqrt{L\sigma_d^2 + d^2\sigma_L^2}$.

**Ví dụ tính SS + ROP:** $d = 40$ SP/ngày, $\sigma_d = 8$, $L = 5$ ngày cố định, dịch vụ 95% ($z=1.645$):
$\sigma_{LT} = 8\sqrt{5} \approx 17.9$; $SS = 1.645 \times 17.9 \approx 29$ SP; $ROP = 40\times5 + 29 = 229$ SP. Khi tồn về mức 229 → đặt hàng.

**ABC phân loại.** A (~20% mặt hàng, ~80% giá trị): kiểm soát chặt, review tuần/tháng, SS tối ưu kỹ. B: trung bình. C (~50% mặt hàng, ~5% giá trị): quy tắc đơn giản, SS cao hơn cho phép (giá trị thấp), đơn auto-replenish.

### Phần B — Nâng cao

**EOQ giới hạn & mở rộng.** (1) Giá mua theo lô (quantity discount) → so TC ở điểm gãy; (2) EOQ giả định nhu cầu xác định — thực tế thêm SS vào max inventory: $I_{max} = Q + SS$; (3) EPQ (sản xuất tại chỗ) thay EOQ (mua ngoài).

**Newsvendor (hàng thời vụ/hao mòn).** Quyết định 1 lần cho mùa: quá ít = mất doanh thu, quá nhiều = chi phí thanh lý. Số lượng tối ưu: $F(Q^*) = \frac{C_u}{C_u + C_o}$ — với $C_u$ chi phí thiếu 1 đơn (margin mất), $C_o$ chi phí dư 1 đơn.

**Ví dụ tính Newsvendor:** Áo mùa, giá 200k, chi phí 100k, thanh lý 40k. $C_u = 100$k, $C_o = 60$k → critical ratio $= 100/160 = 0.625$. Theo bảng phân phối dự báo (nghĩa: tìm $Q$ sao cho $P(D \leq Q)=0.625$): nếu demand ~ Normal(1.000, 200) → $Q^* \approx 1.000 + 0.32\times200 = 1.064$ SP.

**Multi-echelon & bullwhip.** SS ở nhiều cấp (kho vùng, cửa hàng) cộng dồn lớn hơn SS dùng chung pool (risk pooling): tập trung hóa giảm tổng SS theo $\sqrt{n}$ (giả định độc lập). Trade-off: chi phí giao hàng tăng.

**JIT / Kanban / lean inventory.** JIT: đúng số lượng, đúng thời điểm, không dự trữ — đòi hỏi: supplier gần/chất lượng 6 phút sigma, lead time ngắn, changeover nhỏ, lỗi ≈ 0 (chất lượng xây dựng vào quy trình). Kanban: card/signal number of containers: $N = \frac{d \times L \times (1+\alpha)}{C}$ (số container; $\alpha$ buffer, $C$ container size).

**Giám sát & KPI tồn:** inventory turnover $= COGS / AVG\_INV$; days of supply $= 365/turnover$; fill rate; carrying cost %; obsolete %. So sánh ngành (bán lẻ hàng tiêu dùng turn 8–12; máy móc công nghiệp 3–5).

### Phần C — Thực tế

**Case: WinMart / bán lẻ FMCG — SS & ABC.** 4.000 SKU, 180 A + 700 B + 3.120 C. Chuyển: A dùng forecast + SS theo z=2 (dịch vụ 97,7%) + review tuần; C dùng min-max đơn giản, z=1, replenish tự động theo POS. Kết quả 6 tháng: overall fill rate 96.5% → 97.8%, tồn FG giảm 12%, không tăng nhân sự kế hoạch hàng cho nhóm C (giảm 2 planner). Bài học: phân biệt mức độ quản trị theo giá trị (ABC) — không phải mọi SKU cần EOQ phức tạp.

**Case generic: quán phở 3 chi nhánh.** Nguyên liệu tươi (giò, rau) không dùng EOQ (dễ hỏng): newsvendor + reorder nhanh 2 lần/ngày. Công thức: dự báo khách theo ngày trong tuần + mưa/nắng; đặt rau theo critical ratio với $C_o$ = hủy bỏ ~giá mua. Waste rau giảm 35%, hết hàng giờ cao điểm giảm.

**5 lỗi thường gặp:**

1. **Mọi mặt hàng một quy tắc** — hàng A cũng auto, hàng C cũng spreadsheet phức tạp → đội ngũ quá tải, sai cả hai.
2. **SS tính theo "cảm giác an toàn"** — không gắn dịch vụ mục tiêu, không phân biệt CV nhu cầu.
3. **Chase giá mua lô** → carrying cost + obsolescence vượt tiết kiệm giá (phổ biến với nguyên liệu điện tử).
4. **JIT "áo mưa" khi chuỗi cung ứng Việt Nam lead time dài** — cần buffer chiến lược/đa nguồn, không copy Toyota máy móc.
5. **Không tính shrinkage** (hao hụt trộm cắp, sai lệch) trong book inventory vs. physical — chênh lệch 2–3% giá trị tồn phổ biến ở bán lẻ.

**Checklist kiểm soát tồn kho (tuần):**

- [ ] Phân loại ABC theo giá trị luân chuyển 12 tháng.
- [ ] Với A: tính EOQ/EPQ, SS theo z dịch vụ, ROP; nguồn data demand 24 tháng.
- [ ] Với C: min-max đơn giản, container/auto-replenish.
- [ ] Dashboard: turns, DOS, fill rate, obsolete >90 ngày, chênh lệch inventory book-physical.
- [ ] Rà lead time thực tế vs. hợp đồng nhà cung cấp hàng tháng.

#### Ứng dụng thực tế

Công ty thiết bị điện tử nhập chip (đặt hàng 12 tuần, giá biến động): dùng hybrid — hợp đồng frame 60% nhu cầu baseline (bảo vệ cung), spot 40% theo demand thật; SS theo newsvendor cho nhóm chip EOL (c nguy cơ ngừng sản: $C_o$ cao → mua dư có chủ đích). Kết quả: trễ line do thiếu chip giảm 70% so với quý trước, chi phí inventory tăng chỉ 9% — bảo vệ TH bottleneck đáng giá hơn tiết kiệm kho.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Tính EOQ và giải thích giả định của nó.
**Gợi ý trả lời:** $Q^* = \sqrt{2DS/H}$ — cân bằng chi phí đặt hàng và giữ kho; TC gồm setup + carrying. Giả định: nhu cầu xác định đều, lead time cố định, giá không theo lô, không shortage. Trong thực tế cần hiệu chỉnh cho biến thiên (thêm SS), giá chiết khấu (so điểm gãy), và hàng dễ hỏng (newsvendor/FEFO).

**Câu 2:** Dịch vụ mục tiêu 99% vs. 95% ảnh hưởng safety stock thế nào?
**Gợi ý trả lời:** $z$ tăng từ 1.645 lên 2.33 → SS tăng khoảng 42% ($2.33/1.645$) cho cùng $\sigma_{LT}$ — chi phí kho tăng mạnh để chặn thiếu 4 điểm % xác suất. Chọn theo: margin của 1 lần thiếu, penalty hợp đồng, độ tin dự báo — không phải "càng cao càng tốt".

**Câu 3:** JIT có phù hợp doanh nghiệp Việt Nam?
**Gợi ý trả lời:** Một phần: JIT tinh thần (giảm waste, pull, chất lượng tại nguồn) luôn đúng; hình thức tuyệt đối (0 tồn kho, single source toàn cầu) rủi ro với lead time nội địa còn dài và logistics đứt gãy. Thực hành: JIT cho nhóm hàng ổn định, supplier gần, data chia sẻ; buffer/đa nguồn cho nhóm chiến lược, biến động cao — "lean + buffer có chủ đích".

---

## Bài 5: Quản trị chất lượng — TQM, Six Sigma & SPC

### Phần A — Cơ bản

**Chi phí chất lượng (Cost of Quality – Crosby/Juran):**

- **Phòng ngừa (prevention):** đào tạo, thiết kế, quy trình.
- **Đánh giá (appraisal):** kiểm tra, đo lát, audit.
- **Lỗi nội bộ (internal failure):** rework, scrap trong nhà máy.
- **Lỗi ngoại bộ (external failure):** bảo hành, trả hàng, mất khách, kiện tụng.

Crosby: "quality is free" — đầu tư phòng ngừa giảm lỗi ngoại bộ nhanh hơn chi phí; tổng COQ thường 15–25% doanh số ở doanh nghiệp chưa kiểm soát.

**TQM (Total Quality Management).** Triết lý: chất lượng = trách nhiệm toàn tổ chức, lấy khách hàng làm trung tâm, cải tiến liên tục (PDCA – Deming), dựa dữ liệu, quản lý bằng quy trình. Công cụ nền: 7 QC tools (cause-effect diagram, Pareto, histogram, control chart, scatter, check sheet, stratification).

**Chu trình PDCA (Deming):** Plan – Do – Check – Act lặp vô hạn; khác "làm – xong – quên": Check bằng dữ liệu, Act = chuẩn hóa hoặc điều chỉnh.

**SPC (Statistical Process Control) — control chart.** Quy trình ổn định (in control) vs. sai special cause. Với dữ liệu x-bar/R (n=5 mẫu): trung tâm $\bar{\bar{x}}$, giới hạn kiểm soát $UCL = \bar{\bar{x}} + A_2\bar{R}$, $LCL = \bar{\bar{x}} - A_2\bar{R}$ (với n=5, $A_2 = 0.577$). Biểu đồ p cho tỷ lệ lỗi: $UCL = \bar{p} + 3\sqrt{\frac{\bar{p}(1-\bar{p})}{n}}$.

**Quy tắc phát hiện special cause (Western Electric) đơn giản:** 1 điểm ngoài 3σ; 2/3 điểm liên tiếp ở ngoài 2σ cùng phía; 8 điểm liên tiếp cùng phía đường trung tâm.

**Process capability:**

- $C_p = \frac{USL - LSL}{6\sigma}$ (công suất tiềm năng, so spread).
- $C_{pk} = \min\left(\frac{USL - \bar{x}}{3\sigma}, \frac{\bar{x} - LSL}{3\sigma}\right)$ (công suất thực tế, tính lệch tâm).
- Ngưỡng thường: $C_{pk} \ge 1.33$ (4 sigma thực tế), lý tưởng 2.0 (6 sigma).

**Ví dụ tính:** Quy trình: $\bar{x}=50.0$, $\sigma=0.5$, USL=52, LSL=48. $C_p = (52-48)/(6×0.5) = 1.33$. Nếu $\bar{x}$ lệch về 50.8: $C_{pk} = \min((52-50.8)/1.5, (50.8-48)/1.5) = \min(0.8, 1.87) = 0.8$ — dưới 1.33, cần chỉnh tâm quy trình về 50.

### Phần B — Nâng cao

**Six Sigma (DMAIC).** Define – Measure – Analyze – Improve – Control cho quy trình hiện hữu; DMADV (Design) cho thiết kế mới. Trọng tâm: giảm biến thiên, dựa belt system (Yellow/Green/Black/Master Black), dự án có tiết kiệm $ tiền hóa chứng minh cho CFO. Lỗi Six Sigma: biến "giảm biến thiên" thành "bureaucracy kiểm tra" — chất lượng không tăng nếu voice of customer (VOC) sai.

**FMEA (Failure Mode & Effects Analysis).** Đánh giá từng chế độ hỏng: Severity × Occurrence × Detection = RPN. Ưu tiên khắc phục RPN cao; cập nhật sau cải tiến. FMEA là công cụ phòng ngừa (prevention), nối COQ với design/process risk.

**Quality function deployment (QFD – House of Quality).** Dịch VOC → đặc tả kỹ thuật (CTQs – critical to qualities), liên matrix khách hàng–kỹ thuật, kiểm tra conflict (vd: nhẹ vs. bền). Hữu ích khi thiết kế sản phẩm mới.

**Kansei & cảm nhận chất lượng dịch vụ.** Trong dịch vụ, chất lượng = khoảng cách giữa kỳ vọng và cảm nhận (SERVQUAL 5 tr_dimensions: tangibles, reliability, responsiveness, assurance, empathy). Đo bằng khảo sát định kỳ + mystery shopper.

**Tranh luận: Inspection vs. built-in quality (Juran).** Kiểm tra 100% đánh giá output (đắt, trễ); xây chất lượng vào đầu vào & quy trình (training, mistake-proofing/poka-yoke, tự kiểm) rẻ hơn dài hạn. Poka-yoke: thiết kế để lỗi không thể xảy ra (ổ cắm chỉ cắm được 1 chiều, template bắt buộc điền).

### Phần C — Thực tế

**Case: Công ty điện tử Việt Nam & Six Sigma Black Belt.** Dự án DMAIC giảm lỗi hàn SMT: Defect 12.000 DPMO → 1.800 DPMO sau 7 tháng. Phân tích: Pareto 3 lỗi đầu chiếm 78%: (1) sai nhiệt profile, (2) mực hàn cũ, (3) sai position feeder. Improve: chuẩn profile theo alloy, FEFO kho mực, poka-yoke feeder. Savings chứng minh: 2,1 tỷ/năm chi phí lỗi + tăng yield 4,3 điểm. Bài học: Six Sigma thắng khi CFO thấy tiền, không vì badge belt.

**Case generic: chuỗi spa — SERVQUAL.** Khoảng cách lớn nhất: responsiveness (chờ 20 phút so với hẹn) và assurance (kỹ thuật viên đổi lịch phút chót). Hành động: SLA nội bộ 5 phút phản hồi lịch; hệ thống backup therapist; mystery shopper hàng tháng. Điểm NPS 32 → 51 trong 2 quý — chất lượng dịch vụ đo bằng khoảng cách kỳ vọng-cảm nhận.

**5 lỗi thường gặp:**

1. **Đo chất lượng bằng "số lỗi phản ánh"** — phản ánh chỉ là phần nổi; phải đo internal + external failure + audit.
2. **SPC đặt chart nhưng không hành động special cause** — chart thành tranh treo tường.
3. **$C_{pk}$ đẹp trên mẫu chọn lọc** — sampling bias; lấy mẫu theo kế hoạch thống kê thật.
4. **Six Sigma thiếu VOC** — giảm biến thiên thứ khách không coi trọng.
5. **Chất lượng đổ cho QC cuối dây** — không sửa design/process, COQ cứ tăng.

**Checklist chương trình chất lượng 6 tháng:**

- [ ] Chọn 3 CTQ từ VOC (khảo sát + complaint data + lost order reasons).
- [ ] Lập baseline COQ 4 nhóm; mục tiêu giảm lỗi ngoại bộ 30%.
- [ ] Top 3 quy trình lỗi → 3 dự án DMAIC/FMEA, owner + savings mục tiêu.
- [ ] Đào tạo Green Belt nội bộ ≥5 người; 1 Black Belt dẫn dắt.
- [ ] Control phase: control chart + audit + review hàng tháng — chống quay lui.

#### Ứng dụng thực tế

Áp dụng poka-yoke cho quy trình xuất hóa đơn VAT: lỗi sai mã số thuế khách 2,1%. Sửa: (1) template bắt buộc validate mã thuế checksum trước khi in; (2) chặn in nếu thiếu email giao; (3) checklist 2 phút cho trường hợp đặc biệt. Lỗi giảm còn 0,3% trong 1 tháng — chi phí ~0 (chỉ sửa form) vs. chi phí xử lý khiếu nại trước: 18 triệu/tháng. Chất lượng phòng ngừa gần như free đúng tinh thần Crosby.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Giải thích $C_p$ và $C_{pk}$; vì sao $C_p$ cao vẫn có thể nhiều lỗi?
**Gợi ý trả lời:** $C_p$ so spread của quy trình với tolerance — chỉ nói quy trình "đủ hẹp". $C_{pk}$ thêm điều chỉnh lệch tâm trung tâm. Quy trình rất ổn định nhưng lệch tâm (vd $\bar{x}$ gần USL) → $C_p$ cao nhưng $C_{pk}$ thấp, một phần sản phẩm vượt spec. Phải theo $C_{pk}$ và chỉnh tâm trước khi bẻ hẹp spread.

**Câu 2:** Khi nào dùng SPC thay vì kiểm tra 100%?
**Gợi ý trả lời:** SPC: quy trình lặp, dữ liệu đo được, muốn phát hiện sai nguyên nhân trước khi ra lỗi hàng loạt — chi phí thấp hơn, phản ứng sớm. Kiểm tra 100%: an toàn sống còn (y tế, hàng không), chi phí lỗi cao nếu lọt lưới, hoặc chưa ổn định quy trình (vẫn cần sàng). Lý tưởng: SPC + poka-yoke + sampling cuối.

**Câu 3:** Bạn giải trình bày Six Sigma cho ban giám đốc chưa tin?
**Gợi ý trả lời:** Không bắt đầu bằng belt/DMAIC; bắt đầu bằng 1–2 vấn đề có số liệu: "lỗi X đang ăn 2 tỷ/năm và 5 điểm NPS". Đề xuất pilot 1 dự án với tiết kiệm mục tiêu, đo trước-sau, báo cáo bằng tiền. Khi thấy tiền và sự ổn định, mở rộng belt system — bán kết quả, không bán thuật ngữ.

---

## Bài 6: Dự báo & lập kế hoạch — MRP, S&OP

### Phần A — Cơ bản

**Dự báo nhu cầu — phân loại.** Short-term (tuần/tháng: scheduling, tồn kho); medium-term (6–18 tháng: capacity, nhân sự, mua sắm); long-term (2–5 năm: chiến lược capacity, location). Dự báo luôn sai — quản trị theo bias & error, không theo "đúng tuyệt đối".

**Phương pháp dự báo cơ bản:**

1. **Trung bình di chuyển (Moving Average):** $F_{t+1} = \frac{\sum_{i=t-n+1}^{t} A_i}{n}$. VD: demand 4 tuần gần: 110, 130, 120, 140; n=4 → $F = 125$.
2. **Trung bình di chuyển có trọng số (WMA):** $F_{t+1} = \sum w_i A_i$ với $\sum w_i = 1$. VD: w = 0.4, 0.3, 0.2, 0.1 (mới nhất 0.4): $F = 140×0.4 + 120×0.3 + 130×0.2 + 110×0.1 = 56+36+26+11 = 129$.
3. **Hiệu chỉnh mùa vụ (Seasonal index):** $SI_{season} = \frac{Actual_{season}}{SeasonalAvg}$; dự báo = trend × SI.
4. **Exponential smoothing:** $F_{t+1} = F_t + \alpha(A_t - F_t)$; $\alpha$ cao → nhạy biến thiên; $\alpha$ thấp → mượt. VD: $F_t=100$, $A_t=120$, $\alpha=0.3$ → $F_{t+1} = 100 + 0.3×20 = 106$.

**Đo lỗi dự báo:**

- $MAD = \frac{\sum |A_t - F_t|}{n}$
- $MAPE = \frac{100\%}{n}\sum \frac{|A_t-F_t|}{A_t}$
- $MSE = \frac{\sum (A_t - F_t)^2}{n}$

**Ví dụ tính:** Sai: 5, -3, 8, -2 (4 kỳ). $MAD = (5+3+8+2)/4 = 4.5$. $MSE = (25+9+64+4)/4 = 25.5$.

**MRP (Material Requirements Planning).** Từ MPS (Master Production Schedule — sản phẩm thành phẩm theo thời gian) → BOM (bill of materials) → nổ nhu cầu nguyên liệu theo lead time ngược (offset). Logic MRP: $Gross\;Requirements = \sum \text{cha} \times qty$; $Net = Gross - Available - Scheduled\;Receipts$; planned orders theo lot rule (L4L, EOQ, POQ).

**Ví dụ tính MRP đơn giản:** Sản phẩm A (2 B gồm 3 C). MPS: tuần 4 cần 50 A. Lead time: A=1 tuần, B=1 tuần, C=2 tuần. Planned order A (release) tuần 3 → B cần 100 release tuần 2 → C cần 300 release tuần 0. Nếu tồn C hiện có 80 → net 220, release 220 tuần 0.

### Phần B — Nâng cao**

**S&OP (Sales & Operations Planning).** Chu kỳ hàng tháng: (1) dữ liệu & forecast cập nhật, (2) demand plan (sales + marketing), (3) supply plan (vận hành, mua, capacity), (4) cân đối hội đồng S&OP (giải trade-off doanh thu–chi phí–tồn), (5) executive S&OP chốt plan. KPI S&OP: forecast accuracy, plan vs. actual, OTIF, inventory $, capacity utilization. S&OP là "hội đồng điều phối" nối marketing–vận hành–tài chính — thiếu nó, mỗi bên tối ưu cục bộ.

**APS (Advanced Planning & Scheduling) & giới hạn.** MRP kinh điển giả định capacity infinite → planned order vô lý khi bottleneck; APS tối ưu đồng thời capacity constraints (mixed integer). Doanh nghiệp nhỏ: MRP + spreadsheet kiểm tra bottleneck often đủ; tập đoàn: APS + tích hợp ERP.

**Demand-driven MRP (DDMRP).** Đặt buffer theo Demand Driven (red/yellow/green zones) tại các điểm decoupling, pull từ POS thay vì forecast nổ nguyên liệu từng cấp — giảm bullwhip so MRP kinh điển. Hợp môi trường biến động cao.

**S&OP maturity:** levels: react → basic plan → intermediate (tích hợp finance) → advanced (scenario, profit-based planning). Maturity cao: plan gắn P&L scenario — "nếu tăng khuyến mãi 10%, capacity nào bottleneck, margin ra sao?".

### Phần C — Thực tế

**Case: công ty FMCG nội địa & S&OP 6 tháng.** Trước: sales forecast "đặt mục tiêu" (inflated để được thưởng), ops tự chốt plan → tồn FG 70 ngày DOS, stockout giờ cao điểm mùa Tết 8%. S&OP mới: consensus forecast (sales + analítica + promo calendar), capacity check với bottleneck nướng, finance translate plan → P&L scenario. Sau 2 quý: WAPE giảm 22 điểm %, DOS 70 → 48 ngày, Tết sau stockout <2%, OTIF 91% → 96%. Bài học: S&OP không phải meeting — là quy trình có chốt plan & owner.

**Case generic: startup subscription box.** Dự báo theo moving average n=3 sai lệch mùa (Tết, 8/3). Thêm seasonal index theo 24 tháng lịch sử + waitlist data leading indicator → MAPE 35% → 18%; giảm lãng phí đóng gói 25%.

**5 lỗi thường gặp:**

1. **Sales forecast = mục tiêu tăng trưởng** — thúc đẩy over-forecast → bullwhip, tồn cao, khuyến mãi thừa.
2. **MRP chạy nhưng BOM sai/lead time giả** — "garbage in, gospel out" — planner mất niềm tin, quay Excel.
3. **S&OP không có executive chốt** — 4 bộ phận 4 plan khác nhau.
4. **Dự báo một đường, plan tồn một nẻo** — không nối forecast → inventory policy → capacity.
5. **Bỏ qua promo/event calendar** trong dự báo — spike mùa vụ treated as special cause mãi mãi.

**Checklist nâng cấp planning (quý):**

- [ ] Baseline MAPE/WAPE theo SKU/cluster; so với ngành.
- [ ] Chốt quy trình S&OP 5 bước + lịch cố định hàng tháng + mẫu agenda.
- [ ] Tách forecast thành baseline + promo uplift có mẫu số liệu khuyến mãi quá khứ.
- [ ] Rà BOM & lead time thực tế 1 lần/quý (audit nhà cung cấp).
- [ ] Kế hoạch scenario tài chính mỗi vòng S&OP (ít nhất 2 kịch bản).

#### Ứng dụng thực tế

Áp dụng exponential smoothing có mùa vụ cho chuỗi bánh mì: $F_{t+1} = F_t + 0.3(A_t - F_t)$ cho baseline; tháng 12 nhân SI=1.35 (lịch sử), thứ 7 SI=1.2. Với $F_t = 200$ bánh/ngày, $A_t = 240$ ngày thứ 6 → $F_{tt7} = 200+0.3×40 = 212$; $F_{T7\_m12} = 212 × 1.2 × (\text{SI tháng})$. Waste cuối ngày giảm 18%, giờ cao điểm hết hàng giảm một nửa — dự báo đơn giản + mùa vụ đủ cho SME, không cần AI.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** So sánh moving average và exponential smoothing.
**Gợi ý trả lời:** MA n: đơn giản, mượt, trễ phản ứng trend, cần giữ n quan sát. ES: cập nhật đệ quy, chỉ cần $F_t$, $A_t$, $\alpha$; $\alpha$ cao nhạy biến thiên, $\alpha$ thấp mượt; dễ thêm mùa vụ/trend (double/triple smoothing). Chọn bằng thử cross-validation trên lịch sử (minimize MAPE/MAD).

**Câu 2:** Trình bày vòng S&OP và kết quả cần chốt.
**Gợi ý trả lời:** 5 bước: data → demand plan → supply plan → cân đối (trade-off) → executive chốt. Kết quả: consensus forecast, production/purchase plan, inventory plan, financial scenario, danh sách action item có owner. Meeting không chốt plan = không phải S&OP. KPI: forecast accuracy, OTIF, DOS, plan adherence.

**Câu 3:** Vì sao MRP kinh điển dễ fail với demand biến động?
**Gợi ý trả lời:** MRP nổ nhu cầu theo forecast & BOM, giả định capacity infinite, lead time cố định — demand dao động → planned orders giãn nở bullwhip từng cấp, overload bottleneck. Bổ sung: rough-cut capacity check, buffers tại decoupling, hoặc DDMRP pull từ POS — và cập nhật master data đều đặn.

---

## Bài 7: Lean — sản xuất, văn phòng & lean startup

### Phần A — Cơ bản

**Lean là gì.** Xuất phát từ Toyota Production System: cung cấp đúng (đúng thứ, đúng lúc, đúng số lượng, an toàn, thân thiện) bằng cách **loại bỏ waste (muda)** cho dòng chảy giá trị. Lean ≠ cắt giảm blind; lean = tạo giá trị nhìn từ khách hàng.

**8 loại waste (muda) — Tim Wood / DOWNTIME:**

1. **D**efects – lỗi, rework
2. **O**verproduction – sản xuất thừa (mùi tệ nhất — che mọi vấn đề)
3. **W**aiting – chờ đợi
4. **N**on-utilized talent – không dùng hết năng lực người
5. **T**ransportation – vận chuyển thừa
6. **I**nventory – tồn kho thừa
7. **M**otion – chuyển động thừa của người/máy
8. **E**xtra processing – xử lý thừa (siêu chất lượng khách không cần)

**Công cụ lean nền tảng:** 5S (Sort, Set, Shine, Standardize, Sustain), kaizen (cải tiến nhỏ liên tục), kanban/pull, SMED, TPM, poka-yoke, VSM (value stream mapping), gemba (ra hiện trường).

**Kaizen event (blitz).** 3–5 ngày: team liên chức năng, vẽ VSM hiện tại/tương lai, thí nghiệm nhanh, chuẩn hóa. Điều kiện thành công: có chủ đề hẹp, data baseline, quyền thay đổi, người giữ standard sau event.

### Phần B — Nâng cao**

**Lean office / lean service.** Waste ở văn phòng: approval thừa (over-processing), chờ chữ ký (waiting), nhập liệu 2 lần (defect/motion), meeting không agenda, email cả nghìn (over-processing). Công cụ: process map dịch vụ, one-piece flow cho duyệt chi phí, visual management (dashboard chung), standard work cho quy trình lặp (onboarding, close sách tháng).

**Lean startup (Ries / Blank).** Khung cho đổi mới trong bất định: (1) Build – Measure – Learn loop; (2) MVP (minimum viable product) — sản phẩm nhỏ nhất kiểm chứng giả định; (3) validated learning qua experiment có giả định rõ (not feature shipping); (4) pivot vs. persevere theo data. Lean startup là "lean cho tri thức" — waste lớn nhất = xây thứ không ai muốn.

**Giả định – experiment – metric.** Công thức experiment: "Chúng ta tin [giả định], nếu đúng thì [metric] sẽ [ngưỡng] trong [thời gian] với [phương pháp]". Pivot types: customer segment, channel, revenue model, technology, growth engine.

**Giới hạn lean.** (1) Quá lean ở khâu then chốt (no buffer, single source) → dễ đứt gãy (bài học supply chain COVID); (2) Kaizen vô hồn = project wallpaper; (3) Áp lean vào sáng tạo thuần (R&D early) có thể bóp experiment. Đúng: lean + buffer có chủ đích; lean cho flow, portfolio thinking cho uncertainty.

### Phần C — Thực tế

**Case: Vingroup / VinFast apply lean culture.** VinFast đào tạo lean hàng loạt (5S, kaizen, line balancing) từ nhà máy mới; hệ thống đề xuất kaizen có thưởng (idea implemented → thưởng theo savings 1–3%), gemba walk của lãnh đạo hàng tuần. Tỷ lệ idea/nhân viên/năm đạt mức khá; yield cải thiện rõ sau 18 tháng. Bài học: lean sống được khi (1) lãnh đạo đi gemba, (2) đề xuất được xử lý <30 ngày, (3) savings chia sẻ minh bạch.

**Case generic: ngân hàng — lean office cho duyệt hồ sơ vay.** VSM 12 bước, 19 chữ ký; waste lớn: chờ (60% thời gian), thông tin nhập 3 lần. Cải tiến: digital checklist, e-sign theo ngưỡng, gộp bước thẩm định. Lead time phê duyệt 5,2 ngày → 1,4 ngày; chi phí xử lý/hồ sơ giảm 22%; nhân viên phản hồi "ít việc lặp vô nghĩa hơn" — tăng engagement (nối OM với OB).

**5 lỗi thường gặp:**

1. **Lean = cắt người** — hiểu sai, kaizen chết vì sợ mất việc; đúng là giải phóng năng lực cho giá trị.
2. **5S dừng lại ở dọn dẹp** — thiếu standardize/sustain, 1 tháng sau bừa bộn.
3. **MVP thành "phiên bản xong sớm"** — không có giả định/metric, chỉ ship feature.
4. **VSM vẽ trên phòng họp** — không đo thời gian thực tại gemba.
5. **Cắt buffer tuyệt đối** — hiệu quả ngắn hạn, đứt cung dài hạn (cần risk-based buffer).

**Checklist 90 ngày lean đầu tiên:**

- [ ] Chọn 1 dòng value stream chủ lực, vẽ VSM hiện tại (thời gian thực).
- [ ] Xếp 8 waste, chọn top 3 theo $ × tần suất.
- [ ] Kaizen event 1 tuần cho top 1 waste; baseline & sau = số liệu.
- [ ] Visual board hàng ngày 15 phút (5 người): an toàn – chất lượng – tiến độ – ý tưởng.
- [ ] Idea system: form 1 trang, xử lý <30 ngày, báo savings hàng tháng.
- [ ] Rà: buffer nào chiến lược được giữ (không lean tuyệt đối).

#### Ứng dụng thực tế

Startup edtech dùng lean startup: giả định "phụ huynh trả 300k/tháng cho feature chấm bài AI". MVP = landing page + demo video + thu 50 pre-order (không build sản phẩm đầy đủ) trong 2 tuần — chi phí 8 triệu. 12/50 trả cọc → giả định yếu (24% < ngưỡng 40%) → pivot segment: trường học (B2B) thay B2C. Build-Measure-Learn giúp tránh 6 tháng xây app không ai mua — waste tri thức bị loại trước khi waste code.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Liệt kê 8 waste và 2 ví dụ waste văn phòng.
**Gợi ý trả lời:** Defect, overproduction, waiting, non-utilized talent, transportation, inventory, motion, extra processing. Văn phòng: chờ chữ ký 4 ngày (waiting), nhập cùng dữ liệu 3 hệ thống (motion/defect), meeting không agenda & không chốt (over-processing).

**Câu 2:** Phân biệt lean operations và lean startup.
**Gợi ý trả lời:** Lean operations: tối ưu dòng chảy giá trị đã biết, waste vật lý/thời gian, công cụ VSM/5S/kanban. Lean startup: giảm waste tri thức trong bất định, build-measure-learn, MVP kiểm chứng giả định. Cả hai chung triết lý loại bỏ waste + tôn trọng data; khác đối tượng: flow vs. learning.

**Câu 3:** Khi nào KHÔNG nên lean hóa tối đa?
**Gợi ý trả lời:** Với hàng rủi ro cao (sức khỏe, an toàn), nhóm chiến lược supply chain dễ đứt gãy, và giai đoạn exploratory R&D/early startup: cần buffer, đa nguồn, slack cho experiment. Lean có chủ đích: buffer = f(rủi ro × impact), không phải 0 tuyệt đối; giữ "10% slack" cho đổi mới ở team vận hành.

---

## Bài 8: Đo lường hiệu suất — OEE & KPI vận hành

### Phần A — Cơ bản

**OEE (Overall Equipment Effectiveness).** Chuẩn vàng đo hiệu suất thiết bị/chuyền:

$$OEE = A \times P \times Q$$

- **Availability (A):** thời gian chạy / thời gian kế hoạch. Mất planned downtime (nghỉ lễ) không tính; mất breakdown/changeover tính.
- **Performance (P):** tốc độ thực tế / tốc độ lý thuyết (ideal cycle time).
- **Quality (Q):** số SP tốt / số SP chế tạo (tính cả làm lại hỏng).

**Ví dụ tính OEE:** Ca 480 phút; downtime (breakdown+setup) 60 phút → planned run time 420; SP chế tạo 400, SP tốt 380; ideal cycle 0.8 phút/SP → thời gian lý thuyết cho 400 SP = 320 phút.
$A = 420/480 = 0.875$; $P = 320/420 \approx 0.762$; $Q = 380/400 = 0.95$;
$OEE = 0.875 × 0.762 × 0.95 \approx 0.635 = 63.5\%$. World class ≈ 85%; typical ~60% — 63.5% là typical, mất ~36% cơ hội.

**World-class OEE components:** A ≈ 90%, P ≈ 95%, Q ≈ 99.9% → OEE ≈ 85%.

**KPI vận hành phổ biến ngoài OEE:**

- **OTIF** (On Time In Full): % đơn giao đúng hạn & đủ số lượng.
- **Throughput & cycle time** (bài 2).
- **First pass yield (FPY):** % không rework.
- **Lead time & takt adherence.**
- **Inventory turns / DOS** (bài 4).
- **Safety:** TRIR (tổng thương tích/200.000 giờ).
- **Cost/unit & labor productivity** (đơn/người/giờ).

**Balanced scorecard vận hành:** tránh "đo gì được tối ưu đó": pairing chỉ số (vd: OEE cao + inventory cao = overproduction waste; throughput cao + OTIF thấp = product wrong mix). Mỗi chỉ số cần: definition thống nhất, owner, tần suất, target, threshold action.

### Phần B — Nâng cao

**Six Big Losses (OEE decomposition).** 6 lãng phí làm mất OEE: breakdown, setup/adjustment (→ availability); idling/minor stops, reduced speed (→ performance); defect/reduced yield (→ quality). Phân tích loss theo Pareto tiền (giờ × chi phí cơ hội) — không phải theo số lần.

**OEE vs. TEEP.** TEEP = OEE × Utilization (Util = planned production time / calendar time). Nhà máy chạy 2 ca 5 ngày vs. 3 ca 7 ngày: OEE cùng 70% nhưng TEEP khác hẳn — useful khi quyết định thêm ca/mở rộng capacity.

**Leading vs. lagging KPI.** Lagging: OEE, biên lợi nhuận, NPS (kết quả quá khứ). Leading: downtime phút/ngày, % PM hoàn thành, idea implemented, training giờ/nhân viên (dự báo lagging). Dashboard tốt: 3 leading + 3 lagging/chương trình.

**Digital ops / MES / IoT.** Thu thập OEE real-time từ máy (MES, sensor), thay vì sheet cuối ca bị " chỉnh sửa". Cảnh báo early: minor stops tăng = precursor breakdown. Big data ops: predictive maintenance, vision QA — nhưng data garbage in/out; cần standard downtime code & discipline nhập.

**Behavioral risk of metrics.** Goodhart: "khi chỉ số thành mục tiêu, nó ngừng là chỉ số tốt". VD: tối ưu Q bằng cách sort bỏ hàng borderline → "quality đẹp", khách thiếu hàng; tối ưu availability bằng cách bỏ PM → breakdown lớn sau đó. Thiết kế: paired metrics + random audit + rà incentive hàng quý.

### Phần C — Thực tế

**Case: nhà máy nhựa — OEE 52% → 78%.** Baseline: A=75% (breakdown 12%, setup 13%), P=82% (minor stops nhiều), Q=84% (scrap cao). 12 tháng: TPM cho 3 máy bottleneck (PM calendar, spare parts critical stock), SMED giảm setup 45%, poka-yoke cho sai pha trộn. OEE = 0.88×0.95×0.95 ≈ 79.6%. Output +18% không mua máy; chi phí TPM+SMED ≈ 1,4 tỷ, savings ước 6 tỷ/năm (máy mướn bên ngoài giảm, scrap, OT). Board review OEE tuần/tuần bằng MES.

**Case generic: contact center.** OEE dịch vụ: A = agent logged-in time / scheduled; P = average handle time vs. standard; Q = FCR (first call resolution) + QA score. Combo: A cao nhưng FCR thấp = rush; giải pháp: schedule shrinkage thật (training, break), QA weekly coaching — không chỉ đọc A.

**5 lỗi thường gặp:**

1. **OEE tính bằng "tay thần" cuối ca** — số đẹp nhưng sai; không có downtime standard code.
2. **Đuổi OEE bằng cách bỏ maintenance** — sập máy quý sau (cặp leading PM vs. lagging OEE).
3. **Ideal cycle time đặt "dễ"** để P đẹp — mất ý nghĩa benchmark.
4. **KPI vận hành không nối P&L** — ops tối ưu giờ máy, CFO thấy chi phí/unit không đổi (thiếu cost translation).
5. **Quá nhiều KPI ca (30+)** — attention scatter, không hành động được.

**Checklist hệ thống KPI vận hành (1 quý):**

- [ ] Chọn 8–12 KPI theo 5 nhóm (an toàn, chất lượng, giao hàng, chi phí, người).
- [ ] Mỗi KPI: definition chuẩn + owner + source data + tần suất + target + ngưỡng cảnh báo.
- [ ] OEE theo 6 big losses, Pareto theo tiền, top 3 có dự án.
- [ ] Dashboard 1 trang real-time tại xưởng + review tuần + MBR tháng.
- [ ] Rà Goodhart risk: mỗi KPI 2 câu "ai có thể optimize ảo?" — thêm paired metric nếu cần.

#### Ứng dụng thực tế

Áp dụng OEE cho kitchen chuỗi pizza delivery: planned time 600 phút; equipment downtime (lò nướng hỏng, cài đặt) 45 phút; ideal 3 phút/đơn, chế tạo 160 đơn → 480 phút lý thuyết; good 150 (10 lỗi).
$A = 555/600 = 0.925$; $P = 480/555 = 0.865$; $Q = 150/160 = 0.938$; $OEE ≈ 75.3\%$. Top loss: minor stops + defect phết nhân. Actions: checklist pre-shift lò, template nhân 150g, training — OEE mục tiêu 82% trong 2 tháng, đơn/giờ tăng 9%, waste nguyên liệu −22%.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Tính OEE từ số liệu và chỉ ra loss lớn nhất.
**Gợi ý trả lời:** (Khung) Lấy planned run time, downtime, actual count, ideal time, good count → tính A, P, Q; OEE = tích. Loss lớn nhất xác định bằng so sánh: (1−A) vs. (1−P) vs. (1−Q) quy về phút-giá-trị; Pareto theo tiền, không theo cảm tính "nhiều nhất là đúng nhất".

**Câu 2:** Vì sao phải pair KPI?
**Gợi ý trả lời:** Vì mỗi chỉ số đơn lẻ có incentive méo (Goodhart): OEE cao + tồn cao = overproduction; giá thấp + biên = phá giá; OTIF cao + chi phí OT cao = chạy đua tốn kém. Pairing (OEE + inventory; OTIF + cost/unit) buộc cân bằng hệ thống, đúng tinh thần trade-off vận hành.

**Câu 3:** Bạn sẽ trình bày cải thiện OEE cho ban giám đốc thế nào?
**Gợi ý trả lời:** Bắt đầu bằng tiền: baseline OEE & 6 big losses quy về đồng (phút × chi phí cơ hội), top 3 loss có owner dự án (TPM/SMED/poka-yoke), mục tiêu & mốc, savings dự kiến/quarter. Sau đó mới methodology. Báo cáo hàng tháng: OEE + loss Pareto + $ savings thực thu — bán kết quả kinh doanh, không bán thuật ngữ OEE.

---

## Tóm tắt nhanh

| Bài | Khung chính | Công thức/mô hình | Thông điệp vàng |
|---|---|---|---|
| 1. Tổng quan OM | Tam giác giá trị; types of process | Util = load/capacity | Không tối ưu cả 5 trục cùng lúc |
| 2. Dòng chảy | Little's Law, bottleneck, TOC | $WIP = TH \times FT$ | Cải thiện đúng bottleneck |
| 3. Cân bằng & điều độ | Takt, balancing, heijunka | $Takt = giờ/nhu cầu$; EPQ | SMED trước, level sau |
| 4. Tồn kho | EOQ, SS, JIT, ABC | $Q^*=\sqrt{2DS/H}$; $ROP=dL+SS$ | ABC: mỗi nhóm một quy tắc |
| 5. Chất lượng | TQM, Six Sigma, SPC | $C_{pk}$; control chart | Phòng ngừa > kiểm tra cuối |
| 6. Dự báo & plan | MRP, S&OP | ES; MAPE/MAD | S&OP = chốt plan, không phải meeting |
| 7. Lean | 8 waste, kaizen, lean startup | Build–Measure–Learn | Lean + buffer có chủ đích |
| 8. OEE & KPI | Six big losses, paired KPI | $OEE=A\times P\times Q$ | Đào tiền từ loss Pareto |

## Danh mục thuật ngữ Anh–Việt

| English | Tiếng Việt |
|---|---|
| Operations Management (OM) | Quản trị vận hành |
| Process / flow shop / job shop | Quy trình / dây chuyền / xưởng job |
| Capacity | Công suất |
| Utilization | Mức sử dụng |
| Bottleneck | Nút cổ chai |
| Little's Law | Định luật Little |
| Throughput / WIP / Flow time | Sản lượng / tồn dòng / thời gian luân chuyển |
| Theory of Constraints (TOC) | Lý thuyết ràng buộc |
| Lead time / cycle time | Thời gian dẫn / chu kỳ |
| Queue / queuing | Hàng đợi |
| Takt time | Thời gian takt (nhịp khách hàng) |
| Line balancing | Cân bằng dây chuyền |
| Heijunka / leveling | Điều độ sản xuất |
| Push / pull / kanban | Đẩy / kéo / kanban |
| SMED | Đổi máy nhanh |
| EOQ | Số lượng kinh tế |
| Safety stock | Tồn an toàn |
| Reorder point (ROP) | Điểm đặt hàng lại |
| ABC analysis | Phân loại ABC |
| JIT / lean inventory | Đúng lúc / tồn kho tinh gọn |
| Newsvendor model | Mô hình người bán báo |
| TQM | Quản trị chất lượng toàn diện |
| PDCA | Vòng lặp Plan–Do–Check–Act |
| SPC / control chart | Kiểm soát thống kê / biểu đồ kiểm soát |
| Cp / Cpk | Công suất quy trình |
| Six Sigma / DMAIC | Sáu sigma / DMAIC |
| FMEA | Phân tích chế độ hỏng |
| Poka-yoke | Chống sai sót |
| DPMO | Defects per million opportunities |
| MRP / BOM / MPS | Kế hoạch vật tư / danh mục BOM / kế hoạch sản xuất chính |
| S&OP | Hoạch định cung–cầu |
| Forecast accuracy (MAPE/MAD) | Độ chính xác dự báo |
| DDMRP | MRP theo nhu cầu |
| 8 wastes / muda | 8 loại lãng phí |
| Kaizen | Cải tiến liên tục |
| VSM | Bản đồ dòng giá trị |
| 5S | 5S |
| Lean startup / MVP | Khởi nghiệp tinh gọn / sản phẩm khả dụng tối thiểu |
| OEE / TEEP | Hiệu suất thiết bị tổng / TEEP |
| Six big losses | 6 tổn thất lớn |
| OTIF | Đúng hạn đủ lượng |
| Six big losses | Sáu tổn thất lớn |
