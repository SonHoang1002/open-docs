# Câu hỏi đánh giá — Chuyên đề 14: Quản trị chuỗi cung ứng

Hướng dẫn: mỗi bài có **Trắc nghiệm** (A–D), **Tự luận ngắn**, **Tình huống doanh
nghiệp**. Đáp án ở cuối file.

---

## Bài 1 — Tổng quan & thiết kế mạng lưới chuỗi cung ứng

### Trắc nghiệm

1. Dòng chảy nào KHÔNG phải là "ba dòng chảy" của chuỗi cung ứng?
   A. Dòng hàng hóa.
   B. Dòng tiền.
   C. Dòng thông tin.
   D. Dòng lao động.

2. Hiệu ứng bullwhip (roi da buồm) là:
   A. Chi phí vận chuyển tăng theo quãng đường.
   B. Biến động đơn hàng phóng đại dần khi đi ngược lên thượng lưu.
   C. Tồn kho luôn tăng theo thời gian.
   D. Giá nguyên liệu tăng theo mùa.

3. Nguyên nhân nào KHÔNG phải là nguyên nhân kinh điển của bullwhip?
   A. Thiếu chia sẻ dự báo.
   B. Đơn hàng gom theo lô (lot sizing).
   C. Phản hồi giá (mua nhiều khi giá tăng).
   D. Tăng tần suất giao hàng nhỏ lẻ.

4. Inventory turns = 6 lần/năm nghĩa là:
   A. Tồn kho bằng 6 tháng COGS.
   B. Sức chứa kho khoảng 2 tháng tiêu thụ.
   C. Doanh thu gấp 6 lần tồn kho.
   D. Tồn kho luôn là 6 tỷ.

5. Trong SCOR, nhóm quy trình "Return" xử lý:
   A. Hoàn tiền cho nhà đầu tư.
   B. Đổi trả hàng lỗi/khách trả lại.
   C. Trả lương nhân viên.
   D. Nộp thuế.

6. Decoupling point là:
   A. Điểm giao giữa hai công ty.
   B. Điểm chuyển đổi giữa sản xuất/dự trữ theo dự báo và kéo theo đơn hàng thật.
   C. Điểm kiểm tra chất lượng.
   D. Điểm dừng cao tốc.

7. Chiến lược "postponement" nghĩa là:
   A. Trì hoãn mọi sản xuất.
   B. Cá biệt hóa sản phẩm sát thời điểm đơn hàng.
   C. Hoãn thanh toán nhà cung cấp.
   D. Dời lịch tàu biển.

8. So sánh chi phí giữ tồn kho lý thuyết thường ở khoảng:
   A. 1–3% giá trị/năm.
   B. 15–30% giá trị/năm.
   C. 50–70% giá trị/năm.
   D. Không tính được.

9. Make-or-buy nên ưu tiên yếu tố nào trước?
   A. Giá chào thấp nhất.
   B. Có phải năng lực lõi của công ty không.
   C. NCC ở gần nhất.
   D. Hợp đồng dài nhất.

10. Tối ưu cục bộ (VD: cước vận chuyển thấp nhất) có thể làm tệ tổng thể vì:
    A. Không ai đo được.
    B. Có thể tăng tồn kho/phí khác và giảm dịch vụ — tối ưu bộ phận phá tổng thể.
    C. Luôn đúng là tối ưu cục bộ tốt.
    D. Luật cấm.

### Tự luận ngắn

1. Giải thích bullwhip bằng ví dụ chuỗi bán lẻ→phân phối→sản xuất.
2. Viết công thức inventory turns và tính: COGS 90 tỷ, tồn kho bình quân 18 tỷ.
3. Nêu 4 nhóm chi phí nên cộng lại khi so sánh chi phí tổng (TC) giữa 2 kịch bản
   mạng lưới.

### Tình huống

**Tình huống 1.** Công ty định mở thêm 2 kho vùng để "giao nhanh hơn", nhưng bộ
phận tài chính chỉ ra chi phí tồn kho tăng 40%. Bạn dùng khung nào để trình bày
quyết định cân bằng?

---

## Bài 2 — Dự báo nhu cầu

### Trắc nghiệm

1. Làm mooth nhân quả: $F_t = 90$, $A_t = 120$, $\alpha = 0{,}4$ → $F_{t+1}$:
   A. 90.
   B. 102.
   C. 120.
   D. 150.

2. MAPE dùng để đo:
   A. Tổng sai số tuyệt đối.
   B. Sai số theo tỉ lệ phần trăm trung bình.
   C. Chi phí dự báo.
   D. SốSKU dự báo sai.

3. Bias dự báo luôn dương (A − F > 0 kéo dài) nghĩa là:
   A. Dự báo cao liên tục.
   B. Dự báo thấp liên tục — dễ thiếu hàng.
   C. Dự báo hoàn hảo.
   D. Dữ liệu hỏng.

4. Trong newsvendor, $C_u = 100k$, $C_o = 50k$ → tỉ lệ critical:
   A. 33%.
   B. 50%.
   C. 67%.
   D. 100%.

5. Mức dịch vụ 95% tương ứng z ≈:
   A. 0,84.
   B. 1,65.
   C. 2,33.
   D. 3,0.

6. Dự báo cho hàng mới (new item) thường dùng:
   A. ARIMA trên dữ liệu 3 năm.
   B. Analog product + sell-through curve theo tuần.
   C. Không dự báo.
   D. Giá đối thủ.

7. Cách nào KHÔNG giảm bullwhip từ dữ liệu dự báo?
   A. Chia sẻ POS với nhà sản xuất.
   B. Giảm chi phí đặt hàng để giảm lô lớn.
   C. Để mỗi bộ phận "đấm" dự báo cao phòng hết hàng.
   D. Rút ngắn lead time.

8. "Kịch bản (scenario) dự báo" cần thiết vì:
   A. Dự báo một con số luôn đúng.
   B. Cú sốc bất thường không nằm trong phân bố lịch sử.
   C. Dễ tính thuế hơn.
   D. Bắt buộc theo luật.

9. Hàm exponential smoothing nhạy cao với dữ liệu mới khi:
   A. α nhỏ.
   B. α lớn.
   C. α = 0.
   D. Không phụ thuộc α.

10. Dữ liệu lịch sử cần xử lý gì trước khi dự báo?
    A. Gộp mọi đơn kể cả đơn thử/khuyến mãi bất thường.
    B. Tách khuyến mãi, hàng lỗi, đơn thử; làm sạch dữ liệu.
    C. Chỉ lấy năm ngoái.
    D. Bỏ weekends.

### Tự luận ngắn

1. Tính MAE và MAPE cho 4 kỳ: (A,F) = (100,90), (120,110), (80,100), (150,140).
2. Giải thích vì sao "dự báo tốt" là KPI hai chiều (accuracy + bias) chứ không chỉ
   accuracy.
3. So sánh dự báo định tính và định lượng; khi nào dùng loại nào?

### Tình huống

**Tình huống 2.** Chuỗi F&B phàn nàn MAPE nguyên liệu 35%. Bạn phát hiện: mọi
kỳ lễ đều dùng trung bình 12 tháng gần nhất và không tách khuyến mãi. Bạn cải
thiện thế nào và kỳ vọng MAPE mới ra sao?

---

## Bài 3 — S&OP & CPFR

### Trắc nghiệm

1. S&OP là quy trình:
   A. Hợp đồng mua hàng quý.
   B. Lập kế hoạch nhu cầu–cung ứng hàng tháng ở mức tổng hợp, cấp điều hành duyệt.
   C. Kiểm kê kho hàng tuần.
   D. Quảng cáo mùa vụ.

2. Thứ tự 6 bước S&OP đúng là:
   A. Demand → Supply → Reconcile → Executive → Lock → Feedback.
   B. Executive → Demand → Supply → Lock.
   C. Supply → Demand → Marketing.
   D. Lock → Demand → Executive.

3. Mục đích chính của bước "reconciliation" là:
   A. Đối chiếu sổ cái kế toán.
   B. Gỡ mâu thuẫn giữa số bán muốn và năng lực vận hành có.
   C. Chọn màu slide.
   D. Ký hợp đồng NCC.

4. MPS là:
   A. Master Sales Plan — kế hoạch doanh thu.
   B. Master Production Schedule — lịch sản xuất chi tiết theo tuần/SKU.
   C. Kế hoạch marketing.
   D. Ngân sách.

5. MRP tính:
   A. Dòng tiền cổ đông.
   B. Nhu cầu nguyên phụ liệu ngược từ MPS.
   C. Giá cổ phiếu.
   D. Lịch nghỉ lễ.

6. CPFR đòi hỏi điều kiện tiên quyết là:
   A. Hai bên cùng chia sẻ dữ liệu & quy trình dự báo thống nhất.
   B. Một bên mua hết hàng bên kia.
   C. Giá luôn tăng.
   D. Chỉ email đều đặn.

7. S&OE (execution tuần) giải quyết vấn đề gì?
   A. Thay thế S&OP tháng.
   B. Điều chỉnh execution hàng tuần, không chờ cuộc họp tháng.
   C. Quản lý nhân sự.
   D. Kế toán chi phí.

8. "Plan lock" có ý nghĩa:
   A. Khóa file Excel.
   B. Chốt kế hoạch; thay đổi sau đó cần phê duyệt exception.
   C. Tạm dừng sản xuất.
   D. Chuyển sang dự báo mới.

9. Dấu hiệu S&OP thất bại là:
   A. Có bảng dashboard.
   B. Chỉ phòng kế hoạch tham gia, không có lãnh đạo chọn kịch bản.
   C. Họp đúng lịch.
   D. Có 3 kịch bản.

10. Vai trò của "người bán hàng" trong S&OP demand review:
    A. Không tham gia.
    B. Cung cấp input thị trường, khách hàng lớn, chương trình bán hàng — có chỉnh
       sửa có ghi lý do.
    C. Chỉ ký duyệt.
    D. Thay dự báo bằng mục tiêu doanh số duy nhất.

### Tự luận ngắn

1. Mô tả lịch S&OP 1 tháng theo từng tuần.
2. Vì sao S&OP được gọi là "quyết định kinh doanh" chứ không phải báo cáo?
3. Cho nhu cầu 12.000 giờ công, giờ công hiện có 8.000, ngoài thầu 2.000, tồn
   kho dịch được 1.000 → thiếu bao nhiêu?

### Tình huống

**Tình huống 3.** S&OP 6 tháng nay luôn chốt "kế hoạch cơ sở" rồi sales vẫn
vượt/hụt 20% và không ai review. Bạn thiết kế lại quy trình ra sao?

---

## Bài 4 — Tồn kho & safety stock

### Trắc nghiệm

1. Công thức EOQ là:
   A. $\sqrt{2DS/H}$.
   B. $D \times S / H$.
   C. $2D + S$.
   D. $H / (2S)$.

2. $D = 24.000$, $S = 500.000đ$, $H = 10.000đ$ → EOQ ≈
   A. 1.549.
   B. 155.
   C. 15.492.
   D. 500.

3. ROP = nhu cầu bình quân × lead time + …
   A. Giá bán.
   B. Safety stock.
   C. EOQ.
   D. Biên lợi nhuận.

4. Safety stock = $z \times \sigma_L$. Nếu $\sigma_L = 50$, service 95% (z = 1,65):
   A. 50.
   B. 82,5.
   C. 116,5.
   D. 25.

5. Nâng service 95% → 99%, $\sigma_L$ giữ nguyên, SS tăng khoảng:
   A. 10%.
   B. 41%.
   C. 100%.
   D. Không đổi.

6. Hàng nhóm AX (ABC–XYZ) nên:
   A. Bỏ qua kiểm soát.
   B. Kiểm soát chặt, service cao, tối ưu vòng quay.
   C. Chỉ đặt khi khách hỏi.
   D. Luôn dùng FCL nhập khẩu.

7. Cycle stock tồn tại vì:
   A. Mua theo lô.
   B. Dự phòng rủi ro.
   C. Mùa vụ.
   D. Đang trên đường.

8. Chi phí giữ hàng không bao gồm:
   A. Chi phí vốn.
   B. Lưu kho, hao hụt, bảo hiểm.
   C. Chi phí cơ hội vốn.
   D. Chi phí marketing cho hàng đã bán.

9. EOQ giả định gì về nhu cầu?
   A. Biến động mạnh ngẫu nhiên.
   B. Ổn định/đều đặn (mô hình cơ bản).
   C. Bằng không.
   D. Chỉ tồn tại 1 ngày.

10. Tồn kho multi-echelon tối ưu cục bộ từng kho thường dẫn đến:
    A. Tổng tồn giảm.
    B. Tổng tồn phình — cần phối hợp cấp hệ thống.
    C. Dịch vụ luôn 100%.
    D. Không liên quan.

### Tự luận ngắn

1. Tính SS cho: $\sigma_L = 40$, service 99% (z = 2,33). So sánh với service 95%.
2. Phân biệt cycle stock và safety stock bằng ví dụ.
3. Vì sao "zero inventory" không phải mục tiêu đúng cho mọi mặt hàng?

### Tình huống

**Tình huống 4.** Cửa hàng tiện lợi dùng "2 tuần tồn" cho mọi hàng, bao gồm nước
đóng chai (biên mỏng, biến động cao) và bia Tết (mùa vụ mạnh). Bạn phân biệt lại
chính sách ra sao?

---

## Bài 5 — Logistics & vận tải

### Trắc nghiệm

1. Chế độ vận tải rẻ nhất/đơn vị trọng lượng thường là:
   A. Đường hàng không.
   B. Đường biển.
   C. Đường bộ.
   D. Đường sắt (mọi trường hợp).

2. FTL khác LTL ở:
   A. FTL = cả chuyến, LTL = lẻ theo trọng/khối.
   B. FTL = hàng đông lạnh.
   C. LTL = quốc tế.
   D. Không khác.

3. Cross-docking nghĩa là:
   A. Lưu kho dài hạn.
   B. Nhận và chuyển tiếp hàng mà không lưu kho (hoặc rất ngắn).
   C. Giao hàng sai.
   D. Đóng container.

4. Chi phí giao chặng cuối (last mile) thường chiếm:
   A. 1–5% tổng chi phí vận chuyển.
   B. 30–50% tổng chi phí vận chuyển bán lẻ.
   C. Không đáng kể.
   D. Chỉ trong vận tải biển.

5. Incoterm DDP nghĩa là:
   A. Bên bán giao lên tàu.
   B. Bên bán giao đến tận nơi bên mua, chịu thuế (trách nhiệm lớn nhất).
   C. Bên mua trả hết.
   D. Giao hàng đường sông.

6. Reverse logistics xử lý:
   A. Đơn hàng mới.
   B. Đổi trả, hàng lỗi, tái chế/hạ giá sau trả.
   C. Vận chuyển nội bộ.
   D. Đăng ký doanh nghiệp.

7. Hub-and-spoke phù hợp khi:
   A. Không có trung tâm.
   B. Muốn gom hàng qua trung tâm để tiết kiệm, chấp nhận đi 2 chặng.
   C. Hàng quá khổ duy nhất.
   D. Giao đơn siêu khẩn.

8. Tỉ lệ giao thành công lần đầu (first attempt) thấp gây hậu quả:
   A. Không ảnh hưởng chi phí.
   B. Mỗi lần giao lỗi thêm chi phí đáng kể và giảm hài lòng khách.
   C. Tăng OTIF.
   D. Cải thiện vòng quay xe.

9. 3PL là:
   A. Công ty vận chuyển nội bộ.
   B. Nhà cung cấp dịch vụ logistics bên thứ ba.
   C. Chuỗi bán lẻ.
   D. Cơ quan hải quan.

10. Bài toán Vehicle Routing (VRP) khó vì:
    A. Dễ tính.
    B. NP-hard; thực tế cần heuristic + ràng buộc địa phương.
    C. Chỉ có 1 xe.
    D. Không có dữ liệu khoảng cách.

### Tự luận ngắn

1. So sánh FTL và LTL với 2 tiêu chí chi phí và thời gian.
2. Doanh nghiệp giao 120 đơn/ngày, tổng cước 9 triệu/ngày → chi phí giao/đơn?
3. Nêu 3 cách giảm chi phí last mile cho TMĐT.

### Tình huống

**Tình huống 5.** Công ty giao 2 chuyến/ngày/cửa hàng bằng 10 xe riêng, xe đầy
~50%. Bạn so sánh phương án tự vận hành vs. 3PL gom theo tuyến bằng tiêu chí
nào? Kể thêm 2 rủi ro gián tiếp khi dùng 3PL.

---

## Bài 6 — Quản trị nhà cung cấp & mua sắm

### Trắc nghiệm

1. Ma trận Kraljic xếp hàng theo:
   A. Giá và số lượng.
   B. Rủi ro cung ứng × tác động lợi nhuận.
   C. Địa lý và kích thước.
   D. Tuổi NCC.

2. Hàng "bottleneck" cần chiến lược:
   A. Đấu giá liên tục.
   B. Đảm bảo nguồn cung, đa hóa NCC, dự trữ.
   C. Bỏ qua hợp đồng.
   D. Mua tối thiểu mỗi quý.

3. RFQ là:
   A. Request for Quote — xin báo giá.
   B. Báo cáo tài chính.
   C. Quy chế nội bộ.
   D. Hợp đồng lao động.

4. Should-cost model nhằm:
   A. Dự đoán giá cổ phiếu NCC.
   B. Tự dựng cấu trúc chi phí hợp lý để đàm phán có căn cứ.
   C. Tính thuế GTGT.
   D. Chấm điểm nhân viên.

5. Dual sourcing tăng:
   A. Chỉ chi phí.
   B. Rủi ro dừng cung, giảm; tăng chi phí quản lý quan hệ.
   C. Luôn tăng giá 50%.
   D. Thời gian giao hàng.

6. Sole sourcing phù hợp khi:
   A. Hàng non-critical nhiều NCC.
   B. Hàng strategic có hợp đồng chặt + phương án dự phòng.
   C. Không bao giờ phù hợp.
   D. Chỉ khi NCC là người thân.

7. Chấm điểm NCC theo KPI nên gồm:
   A. Chỉ giá.
   B. OTIF, chất lượng (PPM/lỗi), phản ứng sự cố, giá/đề xuất cải tiến.
   C. Độ thân thiện nhân viên bán hàng.
   D. Số năm thành lập.

8. Hợp đồng NCC tốt nên có:
   A. Chỉ giá.
   B. Giá, lead time, SLA, phạt/giải trừ, điều kiện thay đổi, sở hữu trí tuệ.
   C. Chỉ điều khoản chung chung.
   D. Một trang duy nhất.

9. Sustainable procurement nghĩa là:
   A. Mua hàng xanh chỉ vì hình ảnh.
   B. Tích hợp ESG vào tiêu chí lựa chọn và quản trị NCC.
   C. Mua tại địa phương 100%.
   D. Từ chối mọi NCC nước ngoài.

10. Khi NCC Tier 2 gây sự cố, nguyên nhân gốc thường bị bỏ sót vì:
    A. Không ai mapping đa tầng NCC.
    B. Tier 2 không tồn tại.
    C. Luật cấm xem Tier 2.
    D. OTIF Tier 1 luôn 100%.

### Tự luận ngắn

1. Đặt 5 hàng hóa vào 4 ô Kraljic (tự chọn ví dụ) và chỉ chiến lược mỗi ô.
2. Vì sao "mua rẻ nhất" không phải mục tiêu tối thượng?
3. Danh sách 6 hạng mục cần kiểm tra khi onboard NCC mới (theo bài).

### Tình huống

**Tình huống 6.** NCC độc quyền linh kiện A chào giá tăng 18%, đối thủ Trung
Quốc báo giá rẻ hơn 20% nhưng chưa từng giao cho bạn. Bạn lập kịch bản đàm phán
ra sao?

---

## Bài 7 — Đo lường hiệu suất chuỗi cung ứng

### Trắc nghiệm

1. OTIF gồm 2 điều kiện:
   A. Đúng hạn + đủ hàng.
   B. Đúng giá + đúng nơi.
   C. Nhanh + rẻ.
   D. Đủ giấy tờ + không hỏng.

2. Perfect order gồm tối thiểu:
   A. Đúng hạn.
   B. Đúng hạn × đủ hàng × giấy tờ đúng × không hư hỏng.
   C. Khách khen.
   D. Giao trong ngày.

3. 4 chỉ số con đều 95% → POR ≈
   A. 95%.
   B. 81,5% (0,95⁴).
   C. 100%.
   D. 76%.

4. Chi phí logistics/doanh thu 8% thường được coi:
   A. Thấp bất thường với mọi ngành.
   B. Trong khoảng hợp lý tùy ngành (bán lẻ/FMCG thường 5–15%).
   C. Luôn là thất bại.
   D. Chỉ đúng cho xuất khẩu.

5. Goodhart's law trong KPI SC nghĩa là:
   A. KPI càng nhiều càng tốt.
   B. Khi chỉ số thành mục tiêu, nó có thể bị tối ưu giả/che vấn đề.
   C. Không nên đo lường.
   D. Chỉ dùng 1 KPI.

6. Đặt OTIF 100% cho mọi khách có thể:
    A. Luôn khả thi.
    B. Đạt được bằng dự trữ khổng lồ hoặc giao sớm — tốn kém/phá định nghĩa.
    C. Không liên quan chi phí.
    D. Là best practice duy nhất.

7. Inventory record accuracy quan trọng vì:
    A. Gây ấn tượng.
    B. Dữ liệu tồn kho sai làm mọi KPI và quyết định sai theo.
    C. Bắt buộc theo luật kế toán.
    D. Không quan trọng.

8. Khung SCOR đo nhóm quy trình "Make" gồm:
   A. Yield, downtime, năng suất.
   B. Giá cổ phiếu.
   C. Mạng xã hội.
   D. Văn phòng phẩm.

9. Giao "đúng hạn" không có định nghĩa thống nhất có hệ quả:
    A. OTIF so sánh được ngay giữa các công ty.
    B. OTIF giữa các bộ phận/khách hàng so sánh được — cần chốt định nghĩa.
    C. Không ảnh hưởng.
    D. Làm OTIF luôn đúng.

10. Leading indicators cho SC tốt là:
    A. Chỉ số chỉ xuất hiện khi khách khiếu nại.
    B. Độ trễ lead time NCC, chính xác tồn kho, bias dự báo.
    C. Báo cáo năm.
    D. Số cuộc họp.

### Tự luận ngắn

1. Tính POR nếu: đúng hạn 92%, đủ hàng 95%, giấy tờ 98%, không hỏng 99%.
2. Vì sao phải đọc chỉ số dịch vụ cùng chỉ số chi phí và tồn kho?
3. Thiết kế scorecard SC 6 chỉ số cho công ty bán lẻ.

### Tình huống

**Tình huống 7.** KPI "số đơn xuất/nhân viên kho" khiến kho gom đơn lớn, bỏ đơn
nhỏ, khách nhỏ phàn nàn. Bạn thay KPI ra sao?

---

## Bài 8 — Rủi ro, phục hồi, bền vững & số hóa

### Trắc nghiệm

1. Resilience của chuỗi cung ứng gồm:
   A. Chịu cú sốc, phục hồi nhanh, học/ thích nghi.
   B. Chỉ dự trữ nhiều.
   C. Chỉ đa nguồn.
   D. Chỉ số hóa.

2. Chiến lược nào KHÔNG giảm rủi ro cung ứng?
   A. Đa vùng địa lý.
   B. Buffer stock hàng critical.
   C. Ký hợp đồng không điều khoản dự phòng khi đơn nguồn.
   D. Safety lead time.

3. Scope 3 phát thải thường bao gồm:
   A. Chỉ nhà máy công ty.
   B. Phát thải toàn chuỗi cung ứng — thường chiếm phần lớn.
   C. Chỉ xe công ty.
   D. Không đo được.

4. Traceability giá trị mạnh nhất với:
   A. Hàng commodity không nhãn.
   B. Thực phẩm, dược, nông sản xuất khẩu yêu cầu truy xuất lô.
   C. Văn phòng phẩm.
   D. Hàng giảm giá cuối mùa.

5. Digital twin dùng để:
   A. Thay thế kho thật.
   B. Mô phỏng kịch bản trước khi quyết định.
   C. Quảng cáo.
   D. Tính lương.

6. Blockchain trong traceability có giới hạn vì:
   A. Không lưu dữ liệu.
   B. Dữ liệu đầu vào sai thì blockchain chỉ "lưu giữ" sai một cách đáng tin cậy.
   C. Luôn đắt.
   D. Chỉ dùng cho tiền mã hóa.

7. "Just-in-case" buffers có chọn lọc nghĩa là:
   A. Buffers mọi hàng.
   B. Dự trữ & dự phòng có chủ đích cho critical few, giữ lean cho phần còn lại.
   C. Bỏ JIT hoàn toàn.
   D. Chỉ dùng khi có covid.

8. Ransomware tấn công WMS, cách tốt nhất là:
   A. Im lặng chờ.
   B. Quy trình vận hành thủ công khẩn cấp + sao lưu + phản ứng 24/7.
   C. Mua thêm quảng cáo.
   D. Đổi WMS mỗi tuần.

9. Diễn tập kịch bản (tabletop exercise) nên:
   A. Chỉ viết báo cáo.
   B. Diễn tập ít nhất 1 kịch bản rủi ro cao mỗi năm.
   C. Làm khi có sự cố rồi thôi.
   D. Chỉ IT tham gia.

10. AI trong SC:
    A. Dự báo được mọi cú sốc.
    B. Cải thiện phần định lượng; sự kiện ngoài mẫu lịch sử vẫn cần người & kịch bản.
    C. Thay thế toàn bộ S&OP.
    D. Không cần dữ liệu.

### Tự luận ngắn

1. Chọn 3 rủi ro SC lớn nhất cho 1 doanh nghiệp FMCG Việt Nam và biện pháp.
2. Vì sao "vận hành thủ công có kiểm soát" là một phần của resilience?
3. Nêu 4 chỉ số bền vững cho chuỗi cung ứng bán lẻ.

### Tình huống

**Tình huống 8.** Sau sự cố kẹt đường biển quốc tế, công ty mất 3 tuần hàng
critical. Bạn lập plan gì cho 90 ngày tới và thay đổi chính sách gì lâu dài?

---

# ĐÁP ÁN

## Bài 1

1. **D** — Ba dòng: hàng hóa, tiền, thông tin (lao động không phải dòng chuẩn).
2. **B** — Bullwhip: biến động phóng đại dần về thượng lưu.
3. **D** — Giao hàng nhỏ lẻ thường *giảm* bullwhip; nguyên nhân kinh điển gồm
   thiếu chia sẻ dữ liệu, lot sizing, phản hồi giá, lead time.
4. **B** — Turns 6 ≈ tồn kho ~2 tháng (12/6).
5. **B** — Return = đổi trả hàng.
6. **B** — Decoupling point: ranh giới push/pull.
7. **B** — Postponement = cá biệt hóa sát đơn (VD sơn màu cuối).
8. **B** — 15–30%/năm là dải phổ biến (vốn + lưu kho + hao hụt…).
9. **B** — Năng lực lõi đứng trước khi cân make-or-buy.
10. **B** — Suboptimization: cục bộ tối ưu phá tổng thể.

**Tự luận (gợi ý):** (1) cửa hàng dao động nhỏ nhưng phân phối gom lô + dự phòng
→ sản xuất thấy dao động lớn; (2) 90/18 = 5 lần; (3) vận chuyển, kho, sản xuất,
giữ tồn + chi phí thất bại dịch vụ.

**Tình huống 1 (gợi ý):** dùng khung chi phí tổng TC (vận chuyển + kho + sản xuất
+ giữ tồn + thất bại dịch vụ) + kịch bản dịch vụ (% giao đúng hạn); so sánh 3
kịch bản (0/1/2 kho vùng); đo thêm vòng quay tồn kho; quyết định theo tổng thể
không theo chỉ 1 chi phí.

## Bài 2

1. **B** — 0,4×120 + 0,6×90 = 102.
2. **B** — MAPE = sai số tỉ lệ trung bình (%).
3. **B** — A > F kéo dài = dự báo thấp = thiếu hàng.
4. **C** — 100/150 ≈ 67%.
5. **B** — z ≈ 1,65 cho 95%.
6. **B** — Analog + sell-through curve.
7. **C** — "Đấm" dự báo làm bullwhip tăng.
8. **B** — Scenario cho sự kiện ngoài mẫu lịch sử.
9. **B** — α lớn → bám dữ liệu mới mạnh.
10. **B** — Làm sạch & tách thành phần khuyến mãi/lỗi.

**Tự luận (gợi ý):** (1) |e|: 10,10,20,10 → MAE = 12,5; MAPE: 10%+8,3%+25%+6,7%
≈ 12,5%; (2) accuracy + bias = biết cả độ sai và hướng sai (thiếu/dư hàng);
(3) định tính cho mới/ít dữ liệu; định lượng cho lịch sử đủ; kết hợp.

**Tình huống 2 (gợi ý):** tách lịch sử theo ngày lễ/khuyến mãi, dùng dummy
promotion + mô hình theo tuần/ngày trong tuần; dùng dữ liệu 2 năm (có lễ tương
đương); thêm scenario cho lễ lớn. Kỳ vọng: MAPE giảm khoảng 1/3–1/2 (từ 35% còn
~18–24%), bias gần 0.

## Bài 3

1. **B** — S&OP monthly, aggregate, executive-approved.
2. **A** — Demand → Supply → Reconcile → Executive → Lock → Feedback.
3. **B** — Reconcile gỡ mâu thuẫn nhu cầu–cung ứng.
4. **B** — MPS = lịch sản xuất chính (tuần/SKU).
5. **B** — MRP tính ngược vật tư từ MPS.
6. **A** — CPFR = chia sẻ + quy trình chung.
7. **B** — S&OE tuần chỉnh execution.
8. **B** — Lock = chốt, thay đổi cần exception.
9. **B** — Thiếu lãnh đạo/ra quyết định → S&OP chết.
10. **B** — Sales input có căn cứ, chỉnh có lý do.

**Tự luận (gợi ý):** (1) tuần 1 demand, tuần 2 supply, tuần 3 reconcile, tuần 4
executive meeting + plan lock; (2) chọn kịch bản, phân bổ nguồn lực, chịu chi
phí — không phải báo cáo nhìn lại; (3) 12.000 − 8.000 − 2.000 − 1.000 = 1.000
giờ công thiếu.

**Tình huống 3 (gợi ý):** bổ sung bước feedback review actual-vs-plan mỗi kỳ;
chỉ số forecast accuracy/bias gắn người chịu trách nhiệm; executive meeting bắt
buộc chọn kịch bản + decision log; plan lock + exception approval; hủy họp nếu
không có chủ sở hữu số liệu.

## Bài 4

1. **A** — EOQ = √(2DS/H).
2. **A** — √(2×24.000×500.000/10.000) ≈ 1.549.
3. **B** — ROP = d×L + SS.
4. **B** — 1,65×50 = 82,5.
5. **B** — 2,33/1,65 ≈ 1,41 → +41%.
6. **B** — AX: kiểm soát chặt, service cao.
7. **A** — Cycle stock do đặt hàng theo lô.
8. **D** — Marketing không thuộc chi phí giữ hàng.
9. **B** — EOQ cơ bản: nhu cầu đều.
10. **B** — Tối ưu cục bộ phình tổng tồn → cần MEIO.

**Tự luận (gợi ý):** (1) SS 95% = 66; SS 99% = 2,33×40 = 93,2 (tăng ~41%);
(2) cycle = theo lô; safety = dự phòng biến động/lead time; (3) zero inventory
làm rủi ro stop-line, mất bán; mặt hàng critical/mùa vụ cần buffer chiến lược.

**Tình huống 4 (gợi ý):** nước: hàng X/CX, biên mỏng → SS theo σ, service 95%,
đặt điểm reorder tự động; bia Tết: seasonal stock + newsvendor (C_u cao khi hết
hàng mùa, C_o hạ giá sau Tết) → tồn trước Tết theo phân vị ~60–75% và giảm
sau; không dùng "2 tuần" cứng cho cả hai.

## Bài 5

1. **B** — Biển rẻ nhất/đơn vị, chậm nhất.
2. **A** — FTL cả chuyến vs LTL lẻ.
3. **B** — Cross-docking nhận–chuyển tiếp không/khó lưu kho.
4. **B** — 30–50% chi phí vận chuyển bán lẻ.
5. **B** — DDP: giao tận nơi, bên bán chịu thuế.
6. **B** — Reverse: đổi trả/xử lý sau trả.
7. **B** — Hub-and-spoke gom qua trung tâm.
8. **B** — Giao lỗi lặp = chi phí ×2–3 và mất khách.
9. **B** — 3PL = third-party logistics.
10. **B** — VRP NP-hard → heuristic + ràng buộc thực.

**Tự luận (gợi ý):** (1) FTL: chi phí/chuyến cao nhưng/đơn thấp khi đầy xe, chủ
động; LTL: rẻ cho lẻ, ghép tuyến, lâu hơn; (2) 9 triệu/120 = 75.000đ/đơn;
(3) gom điểm/khu, locker/điểm nhận, khung giờ rộng, tối ưu tuyến + mật độ đơn.

**Tình huống 5 (gợi ý):** so sánh TCO: chi phí xe + tài xế + bảo trì + quản lý vs.
3PL (cước + phí quản lý quan hệ + transition); thêm 2 rủi ro 3PL: mất trực tiếp
khách hàng cuối/cam kết dịch vụ, phụ thuộc & đổi giá khi hợp đồng hết; đánh giá
theo OTIF+chi phí giao/đơn, pilot 1 tuyến trước.

## Bài 6

1. **B** — Kraljic: rủi ro × tác động lợi nhuận.
2. **B** — Bottleneck: đảm bảo cung, đa nguồn, dự trữ.
3. **A** — RFQ = xin báo giá.
4. **B** — Should-cost = dựng cost breakdown để đàm phán.
5. **B** — Dual: giảm rủi ro, tăng chi phí quản lý.
6. **B** — Sole hợp lý khi strategic + hợp đồng chặt.
7. **B** — Scorecard: OTIF, chất lượng, phản ứng, cải tiến.
8. **B** — Hợp đồng đủ: giá, lead time, SLA, phạt, IP…
9. **B** — Sustainable procurement = ESG trong mua sắm.
10. **A** — Không mapping đa tầng → mù Tier 2/3.

**Tự luận (gợi ý):** (1) ví dụ: chip (strategic), khóa/nút nhập (bottleneck),
văn phòng phẩm (non-critical), nguyên liệu phổ thông nhiều NCC (leverage);
(2) mua rẻ bù bằng: chậm, lỗi, stop-line, chi phí giao dịch; dùng total value of
ownership; (3) tài chính, năng lực, chứng nhận, rủi ro địa lý/polít, pilot,
điều khoản, onboarding.

**Tình huống 6 (gợi ý):** kịch bản: (1) đàm phán giá/volume/lead time/thanh toán
với NCC cũ, dùng data should-cost; (2) audit NCC mới (tài chính, mẫu, capacity,
khách tham chiếu) + đơn pilot có SLA; (3) time-buy/dự trữ bridge; (4) phát triển
NCC nội địa dài hạn. Không chuyển toàn bộ chỉ vì giá 20% khi rủi ro chất
lượng/lịch sử chưa kiểm chứng.

## Bài 7

1. **A** — OTIF = on time AND in full.
2. **B** — POR = tích 4 yếu tố.
3. **B** — 0,95⁴ ≈ 81,5%; tích 4 xác suất luôn thấp hơn từng mức con (95%).
4. **B** — 5–15% tùy ngành (bán lẻ/FMCG).
5. **B** — Goodhart: chỉ số thành mục tiêu → bị chơi đẹp số.
6. **B** — 100% mọi nơi thường đạt bằng dự trữ khổng lồ/giao sớm.
7. **B** — Inventory accuracy nền tảng của mọi KPI SC.
8. **A** — Make: yield, downtime, năng suất.
9. **B** — Cần chốt định nghĩa (trước giờ nhận, đúng ngày…).
10. **B** — Leading: lead time NCC, tồn kho accuracy, bias dự báo.

**Tự luận (gợi ý):** (1) 0,92×0,95×0,98×0,99 ≈ 84,8%; (2) trade-off: chỉ dịch
vụ 100% = chi phí khủng; chỉ chi phí = mất khách; đọc cùng lúc; (3) ví dụ: OTIF,
chi phí logistics%, vòng quay tồn, %slow-moving, POR, forecast bias.

**Tình huống 7 (gợi ý):** thay bằng: OTIF/fill rate theo nhóm khách, %
đơn đúng hạn SLA khách nhỏ, chi phí xử lý/đơn, giờ/nđ gộp chuẩn (throughput),
độ hài lòng khách nhỏ; đào tạo & dashboard minh bạch để kho không "chọn đơn
dễ".

## Bài 8

1. **A** — Resilience: absorb, recover, adapt.
2. **C** — Hợp đồng đơn nguồn không dự phòng = không giảm rủi ro.
3. **B** — Scope 3 = chuỗi cung ứng, thường lớn nhất.
4. **B** — Traceability mạnh cho thực phẩm/dược/nông sản xuất khẩu.
5. **B** — Digital twin mô phỏng kịch bản.
6. **B** — Garbage in, garbage out; blockchain không sửa dữ liệu nguồn.
7. **B** — Just-in-case có chọn lọc (critical few).
8. **B** — Quy trình offline + backup + response 24/7.
9. **B** — Diễn tập ít nhất 1 lần/năm.
10. **B** — AI định lượng + người cho bất thường/S&OP.

**Tự luận (gợi ý):** (1) ví dụ FMCG: mất nguồn nguyên liệu (dual source + buffer),
hỏng kho lạnh (bảo trì + bảo hiểm + DC dự phòng), cyber (backup + quy trình
thủ công); (2) sự cố hệ thống luôn xảy ra — quy trình paper/manual đã diễn tập
giữ dòng hàng; (3) g CO₂/đơn, % bao bì tái chế, % NCC audit ESG, % hàng truy
xuất đầy đủ.

**Tình huống 8 (gợi ý):** 90 ngày: (1) audit điểm nghẽn & đơn critical, (2) tạm
buffer + safety lead time cho critical, (3) dual-route/nhà cung cấp dự phòng
nội địa, (4) nâng visibility đơn theo ngày. Lâu dài: chính sách "just-in-case
có chọn lọc", hợp đồng force majeure + penalty rõ, tabletop exercise quý,
bảng rủi ro có chủ sở hữu.
