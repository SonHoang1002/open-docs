---
marp: true
theme: default
paginate: true
---

# Quản trị Vận hành
## Operations Management

- Biến chiến lược thành sản phẩm/dịch vụ thật
- Quy trình – tồn kho – chất lượng – dự báo
- Công thức: Little's Law, EOQ, OEE

---

## Mục lục học phần

- Bài 1: Tổng quan & thiết kế quy trình
- Bài 2: Dòng chảy & Little's Law
- Bài 3: Cân bằng công suất & điều độ
- Bài 4: Tồn kho — EOQ, JIT, SS
- Bài 5: Chất lượng — TQM, Six Sigma, SPC
- Bài 6: Dự báo & MRP, S&OP
- Bài 7: Lean — sản xuất, văn phòng, startup
- Bài 8: OEE & KPI vận hành

---

## Bài 1: OM là gì?

- Quy trình chuyển đổi đầu vào → đầu ra giá trị
- Áp dụng: nhà máy, bệnh viện, bank, phần mềm
- 5 trục: Chi phí – Chất lượng – Thời gian
  – Flexibility – Tồn kho/Dòng tiền
- Không tối ưu cả 5 cùng lúc (focused factory)
- Service: tiêu dùng đồng thời, không lưu trữ được

---

## Phân loại quy trình

- **Job shop:** ít lượng, nhiều loại (xưởng custom)
- **Flow shop:** lượng lớn, ít loại (nước giải khát)
- **Batch:** lô theo kế hoạch (thực phẩm)
- **Project:** duy nhất, lớn (xây cầu)
- **Continuous:** liên tục (hóa dầu, điện)
- Chọn loại = chọn công cụ OM phù hợp

---

## Hàng đợi & utilization

$$L_q = \frac{\rho^2}{1-\rho} \quad (\text{M/M/1})$$

- $\rho = 0.5 → L_q = 0.5$
- $\rho = 0.9 → L_q \approx 8.1$
- Util 100% = hàng đợi vô hình phình to
- Util mục tiêu 70–85% tùy biến thiên
- "Nhà máy kín lịch" ≠ nhà máy khỏe

---

## Bài 2: Dòng chảy — 3 biến số

$$WIP = TH \times FT$$

- **Throughput:** đơn vị hoàn thành/ngày
- **WIP:** đang trong quy trình
- **FT:** thời gian luân chuyển (chứa chờ đợi!)
- VD: WIP 200, TH 50/ngày → FT 4 ngày
- Giảm WIP → rút FT (không cần chạy nhanh hơn)

---

## Bottleneck

- Bước capacity thấp nhất = TH hệ thống
- $TH_{sys} = \min_i(capacity_i)$
- Util bottleneck ≈ 100%, các bước khác idle là bình thường
- Đầu tư không bottleneck = lãng phí
- TOC 5 bước: Identify – Exploit – Subordinate
  – Elevate – Repeat
- Không để bottleneck idle: giảm setup, PM, chất lượng tại nguồn

---

## Bullwhip & P90

- Biến thiên nhu cầu khuếch đại ngược chuỗi
- Nguyên nhân: lô lớn, forecast sai, giấu thông tin
- Giảm: chia sẻ POS, lô nhỏ, S&OP đồng bộ
- Đưa P90 lead time vào KPI — khách cảm nhận đuôi
- WIP cap (CONWIP): pull signal khi hoàn thành

---

## Bài 3: Takt time

$$Takt = \frac{\text{Giờ hiệu dụng}}{\text{Nhu cầu khách}}$$

- VD: 480 phút / 480 đơn = 1 phút/đơn
- Cycle time > takt → thiếu công suất
- Cycle time < takt → nhàn rỗi, gộp việc
- Line efficiency = Σtask / (số trạm × takt)

---

## Điều độ (heijunka) & push/pull

- **Heijunka:** blend SKU theo takt, không lô lớn
- Tiền đề: SMED — đổi máy nhanh
- **Push:** sản xuất theo forecast → WIP cao nếu sai
- **Pull (kanban):** kéo theo tiêu thụ thật
- Chase vs. level: so chi phí OT vs. chi phí kho
- Hybrid phổ biến: base level + đỉnh chase

---

## Bài 4: EOQ

$$Q^* = \sqrt{\frac{2DS}{H}}$$

- $D$: nhu cầu/năm; $S$: chi phí mỗi lần đặt
- $H$: chi phí giữ 1 đơn vị/năm
- TC min $= \sqrt{2DSH}$
- EPQ: thêm yếu tố rate sản xuất
- SMED giảm S → lô tối ưu nhỏ hơn

---

## Safety stock & ROP

$$ROP = d \times L + SS$$
$$SS = z \times \sigma_{LT}$$

- 95% → $z \approx 1.645$; 99% → $z \approx 2.33$
- Dịch vụ cao → SS tăng ~40% (1.645→2.33)
- ABC: A quản chặt, C auto min-max
- JIT: đúng lúc, đúng số lượng — cần supplier tốt
- Newsvendor: hàng thời vụ — critical ratio

---

## Bài 5: Chi phí chất lượng (COQ)

- **Phòng ngừa:** đào tạo, thiết kế, quy trình
- **Đánh giá:** kiểm tra, audit
- **Lỗi nội bộ:** scrap, rework
- **Lỗi ngoại bộ:** bảo hành, mất khách
- Crosby: chất lượng phòng ngừa gần như "free"
- PDCA: Plan – Do – Check – Act lặp vô hạn

---

## SPC & capability

- Control chart: special vs. common cause
- $C_p = \frac{USL-LSL}{6\sigma}$
- $C_{pk} = \min\left(\frac{USL-\bar x}{3\sigma},\frac{\bar x-LSL}{3\sigma}\right)$
- $C_{pk} \ge 1.33$ đạt, 2.0 world class
- $C_p$ cao nhưng lệch tâm → $C_{pk}$ vẫn thấp
- Poka-yoke: thiết kế chặn sai

---

## Six Sigma DMAIC

- **D**efine — vấn đề quy về $
- **M**easure — baseline DPMO/COQ
- **A**nalyze — root cause, Pareto
- **I**mprove — thí nghiệm có kiểm chứng
- **C**ontrol — chart, standard, audit
- FMEA: Severity × Occurrence × Detection = RPN
- CFO thấy tiền → Six Sigma sống

---

## Bài 6: Dự báo

- Moving average, WMA, exponential smoothing
- $F_{t+1} = F_t + \alpha(A_t - F_t)$
- $\alpha$ cao: nhạy; $\alpha$ thấp: mượt
- Đo: MAD, MAPE, MSE
- Seasonal index cho chu kỳ
- Dự báo luôn sai — quản trị theo error

---

## MRP & S&OP

- MRP: MPS + BOM → nổ nhu cầu ngược lead time
- Giả định capacity infinite → cần RCCP
- S&OP 5 bước hàng tháng:
  data → demand → supply → cân đối → executive chốt
- Kết quả: forecast consensus + plan + scenario P&L
- Sales forecast ≠ mục tiêu tăng trưởng
- Tách baseline + promo uplift

---

## Bài 7: 8 loại lãng phí (muda)

- Defects – Overproduction – Waiting
- Non-utilized talent – Transportation
- Inventory – Motion – Extra processing
- Overproduction tệ nhất (che mọi vấn đề)
- Lean ≠ cắt người — giải phóng năng lực cho giá trị
- Kaizen: cải tiến nhỏ liên tục, có dữ liệu

---

## Lean office & lean startup

- Văn phòng: chờ ký, nhập 2 lần, meeting không agenda
- VSM dịch vụ, one-piece flow duyệt chi phí
- Lean startup: Build – Measure – Learn
- MVP = nhỏ nhất kiểm chứng giả định
- Pivot = đổi hướng theo validated learning
- Lean + buffer có chủ đích (không 0 tuyệt đối)

---

## Bài 8: OEE

$$OEE = A \times P \times Q$$

- **A**vailability: chạy / planned time
- **P**erformance: tốc độ thực / lý thuyết
- **Q**uality: SP tốt / SP chế tạo
- VD: 0.875 × 0.762 × 0.95 ≈ 63.5% (typical)
- World class ≈ 85%
- TEEP = OEE × Utilization (mở ca/thêm máy)

---

## Six big losses

- Breakdown, Setup/Adjustment → Availability
- Idling/Minor stops, Reduced speed → Performance
- Defect, Reduced yield → Quality
- Pareto theo tiền, không theo số lần
- Pair KPI: OEE + inventory; OTIF + cost/unit
- Goodhart: chỉ số thành mục tiêu → mất ý nghĩa

---

## Case: Little's Law & vốn

- TH 5.000 SP/ngày, WIP+FG 45.000 → FT 9 ngày
- Giảm lô, tinh gọn packing: WIP 30k
- FT → 6 ngày, TH giữ nguyên
- Giải phóng ~60 tỷ vốn lưu động
- CFO và OM đọc chung một công thức
- Lead time = vốn + trải nghiệm khách

---

## Case: OEE 52% → 79.6%

- A 75% → 88% (TPM, spare critical)
- P 82% → 95% (SMED, minor stops)
- Q 84% → 95% (poka-yoke pha trộn)
- Output +18% không mua máy
- Savings ~6 tỷ/năm, chi phí 1,4 tỷ
- MES real-time thay sheet "chỉnh sửa" cuối ca

---

## 5 lỗi OM thường gặp

- Tối ưu cục bộ, hỏng hệ thống
- Cải thiện không bottleneck
- Util 95% rồi kẹt queue, OT vô tận
- Mọi SKU một quy tắc tồn kho
- OEE đẹp trên giấy, không downtime code

---

## Checklist nhà quản lý vận hành

- Vẽ VSM 1 dòng chủ lực, đo time/WIP/đỗi
- Xác định bottleneck bằng số liệu 4 tuần
- ABC + EOQ/SS cho nhóm A; auto cho C
- 3 dự án DMAIC có savings $
- OEE theo 6 big losses, dashboard real-time
- S&OP 5 bước, executive chốt plan

---

## Tóm tắt theo bài

| Bài | Công thức vàng | Thông điệp |
|---|---|---|
| 1 | Util = load/capacity | Buffer có lý do |
| 2 | $WIP = TH \times FT$ | Cải bottleneck |
| 3 | Takt = giờ/nhu cầu | SMED trước level |
| 4 | $Q^*=\sqrt{2DS/H}$ | ABC phân tầng |
| 5 | $C_{pk}$; DMAIC | Phòng ngừa > soát cuối |
| 6 | ES; MAPE | S&OP chốt plan |
| 7 | 8 waste; BML | Lean + buffer |
| 8 | $OEE=A\times P\times Q$ | Đào tiền từ loss |

---

## Thuật ngữ nhanh

- Bottleneck — Nút cổ chai
- Little's Law — Định luật Little
- Takt time — Nhịp khách hàng
- Safety stock — Tồn an toàn
- Six Sigma — Sáu sigma
- S&OP — Hoạch định cung–cầu
- Kaizen — Cải tiến liên tục
- OEE — Hiệu suất thiết bị tổng

---

# Q&A

- Bài tập: VSM doanh nghiệp thật
- Máy tính: EOQ, SS, OEE bài tập số
- Deliverable: kế hoạch cải tiến 90 ngày

**Xin cảm ơn!**
