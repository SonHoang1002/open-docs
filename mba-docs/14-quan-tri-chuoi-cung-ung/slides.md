---
marp: true
theme: default
paginate: true
---

<!-- _paginate: false -->

# Chuyên đề 14
## Quản trị chuỗi cung ứng
### Supply Chain Management

---

# Mục lục chuyên đề

- Bài 1: Tổng quan & thiết kế mạng lưới SC
- Bài 2: Dự báo nhu cầu
- Bài 3: Lập kế hoạch — S&OP & CPFR
- Bài 4: Tồn kho & safety stock
- Bài 5: Logistics & vận tải
- Bài 6: Quản trị nhà cung cấp & mua sắm
- Bài 7: Đo lường hiệu suất — OTIF, perfect order
- Bài 8: Rủi ro, bền vững & số hóa SC

---

# Bài 1 — Ba dòng chảy của chuỗi cung ứng

- Dòng hàng hóa: NCC → sản xuất → kho → khách
- Dòng tiền: thanh toán ngược về chuỗi
- Dòng thông tin: đơn hàng, dự báo, tồn kho
- Upstream: NCC. Downstream: khách hàng
- Decoupling point: ranh giới push / pull
- Thiếu thông tin → hàng hóa & tiền lệch hướng

---

# Hiệu ứng roi da buồm (Bullwhip)

- Biến động đơn phóng đại dần về thượng lưu
- Nguyên nhân: thiếu chia sẻ dự báo, lô lớn
- Phản hồi giá & lead time dài càng nặng
- Giảm: chia sẻ POS, CPFR, lô nhỏ, lead time ngắn
- Turns = COGS / tồn kho bình quân

---

# Thiết kế mạng lưới — trade-off

- Số & vị trí nhà máy, kho, DC
- Chi phí tổng TC: vận + kho + sản + tồn + dịch vụ
- Chi phí giữ tồn kho ~15–30%/năm giá trị
- Make-or-buy: năng lực lõi trước, giá sau
- Lean vs. Agile; hybrid: postponement
- SCOR: Plan–Source–Make–Deliver–Return–Enable

---

# Ứng dụng & phỏng vấn — Bài 1

- Áp dụng: 3 dòng chảy cho quy trình nội bộ
- "Bullwhip giảm bằng cách nào?"
- "Lean hay Agile cho sản phẩm này?"
- "Khi nào mua ngoài thay vì tự làm?"

---

# Bài 2 — Dự báo nhu cầu

- Định tính: chuyên gia, Delphi, khảo sát
- Định lượng: trung bình, làm mooth, hồi quy
- $F_{t+1} = \alpha A_t + (1-\alpha) F_t$
- MAE, MAPE, bias — đo cả sai số và hướng
- Bias dương dài = dự báo thấp = thiếu hàng
- Tách mùa vụ, xu hướng, khuyến mãi

---

# Ví dụ — newsvendor

- C_u = 80k (lỗ lãi), C_o = 40k (hạ giá)
- p = C_u / (C_u + C_o) = 66,7%
- Đặt tồn đến phân vị 66,7% nhu cầu
- Áp dụng: hàng mùa vụ, perishable
- Dự báo một con số + 3 kịch bản

---

# Ứng dụng & phỏng vấn — Bài 2

- Làm sạch dữ liệu trước khi dự báo
- ABC–XYZ: Z dùng chuyên gia, X tự động
- "MAE khác MAPE thế nào?"
- "Bullwhip giảm bằng dữ liệu nào?"

---

# Bài 3 — S&OP 6 bước

1. Demand review
2. Supply review
3. Reconciliation
4. Executive meeting
5. Plan lock
6. Execution & feedback

- Chủ trì cấp điều hành, chu kỳ tháng
- S&OE tuần giữ nhịp execution

---

# CPFR & kế hoạch

- CPFR: 2 bên chia sẻ dự báo & kế hoạch
- MPS: lịch sản xuất tuần/SKU
- MRP: tính ngược nguyên phụ liệu từ MPS
- S&OP thất bại = họp báo cáo, không quyết định
- 3 kịch bản: thận trọng / cơ sở / mạnh

---

# Ứng dụng & phỏng vấn — Bài 3

- SME: mini-S&OP 1 sheet + decision log
- Sales chỉnh dự báo cần ghi lý do
- "S&OP gồm bước nào, ai chủ trì?"
- "Phân biệt S&OP, MPS, MRP"

---

# Bài 4 — Công thức tồn kho cốt lõi

- $EOQ = \sqrt{2DS/H}$
- Ví dụ: D=12k, S=250k, H=8k → 866/lô
- $ROP = d \times L + SS$
- $SS = z \times \sigma_L$; z(95%) = 1,65
- Service 95→99%: SS tăng ~41%
- ABC-XYZ chọn chiến lược theo nhóm hàng

---

# Loại tồn kho & chi phí

- Cycle (theo lô) · Safety · Mùa vụ · Đang chuyển
- Chi phí giữ: vốn + lưu + hao + bảo hiểm
- Zero inventory không phải mục tiêu mọi hàng
- MEIO: tối ưu đa tầng, không cục bộ từng kho
- Hạn chế EOQ: nhu cầu đều, không chiết khấu

---

# Ứng dụng & phỏng vấn — Bài 4

- "Tính EOQ với D, S, H cho trước"
- "Nâng 95% → 99% ảnh hưởng SS?"
- Áp dụng: vật tư văn phòng cũng có EOQ
- Phân loại ABC-XYZ cập nhật mỗi quý

---

# Bài 5 — Vận tải & phân phối

- Biển: rẻ, chậm · Bộ: linh hoạt · Air: gấp
- FTL cả chuyến vs. LTL lẻ trọng/khối
- Cross-docking: nhận–chuyển, không lưu kho
- Hub-and-spoke vs. point-to-point
- Last mile 30–50% chi phí vận bán lẻ
- Reverse logistics: đổi trả & xử lý sau trả

---

# Incoterms & 3PL

- FOB: giao lên tàu · CIF: + cước bảo hiểm
- DDP: giao tận nơi, bên bán chịu thuế
- 3PL: ngoài làm logistics; 4PL điều phối
- Chi phí giao/đơn = cước chuyến / số đơn
- Gom đơn giảm chi phí, tăng thời gian chờ

---

# Ứng dụng & phỏng vấn — Bài 5

- So sánh 3PL bằng TCO, không chỉ giá/km
- "FTL khác LTL thế nào?"
- "3 cách giảm chi phí last mile"
- Đo: % tải đầy, first attempt delivery

---

# Bài 6 — Kraljic: 4 ô mua hàng

- Strategic: rủi ro cao × lợi nhuận cao → đối tác
- Bottleneck: rủi ro cao × lợi nhuận thấp → bảo vệ cung
- Leverage: rủi ro thấp × lợi nhuận cao → mặc cả
- Non-critical: chuẩn hóa, tự động hóa đơn
- Should-cost: dựng chi phí để đàm phán

---

# Rủi ro nhà cung cấp

- Mapping đa tầng Tier 1, Tier 2, Tier 3
- Sole source: rẻ nhưng mỏng manh
- Dual source cho bottleneck thiết yếu
- Scorecard NCC: OTIF, chất lượng, phản ứng
- Sustainable procurement: ESG trong lựa chọn

---

# Ứng dụng & phỏng vấn — Bài 6

- "Kraljic xếp hàng theo tiêu chí nào?"
- "NCC liên tục trễ giao — xử lý thế nào?"
- Onboard NCC: pilot nhỏ + SLA trước hợp đồng
- Đàm phán nhiều biến số, không chỉ giá

---

# Bài 7 — Chỉ số chuỗi cung ứng

- OTIF = đúng hạn AND đủ hàng
- Perfect Order = OTIF × giấy tờ × không hỏng
- 4 chỉ số 95% → POR chỉ ~81%
- Chi phí logistics/doanh thu: 5–15% tùy ngành
- Turns, số ngày tồn, slow-moving %
- Đọc dịch vụ + chi phí + tồn kho cùng lúc

---

# Goodhart & scorecard

- "Khi chỉ số thành mục tiêu, nó hỏng"
- Ví dụ: OTIF tốt nhờ dự trữ khổng lồ
- Chốt định nghĩa "đúng hạn" khi so sánh
- SCOR: Plan–Source–Make–Deliver–Return–Enable
- Leading indicators: bias dự báo, lead time NCC

---

# Ứng dụng & phỏng vấn — Bài 7

- "Tính Perfect Order từ 4 chỉ số con"
- "OTIF khác Perfect Order thế nào?"
- Dashboard 6 chỉ số/bán lẻ
- Không tối ưu 1 chỉ số phá chỉ số khác

---

# Bài 8 — Resilience chuỗi cung ứng

- Chịu cú sốc → phục hồi nhanh → học/adapt
- Đa nguồn, buffer critical, safety lead time
- Nearshoring: rút ngắn khoảng cách NCC
- Just-in-case có chọn lọc: critical few
- Diễn tập kịch bản ≥ 1 lần/năm

---

# Số hóa & bền vững

- Traceability: blockchain/IoT/QR theo lô
- AI forecast: giảm MAPE, vẫn cần người
- Digital twin: mô phỏng trước khi quyết
- Control tower: visibility real-time
- Scope 3: phát thải chuỗi cung ứng — lớn nhất
- Greenwashing: công bố không có dữ liệu đo

---

# Ứng dụng & phỏng vấn — Bài 8

- 1 kịch bản sự cố 2 trang = vô giá trị?
- "3 chiến lược tăng resilience"
- "Blockchain traceability giá trị khi nào?"
- Quy trình thủ công có kiểm soát = resilience

---

# Tóm tắt chuyên đề

| Bài | Công cụ chính | Ngưỡng/công thức |
|-----|---------------|------------------|
| 1 | Bullwhip, network design | Turns = COGS/tồn |
| 2 | MAPE, newsvendor | p = Cu/(Cu+Co) |
| 3 | S&OP, CPFR | Tháng/S&OP, tuần/S&OE |
| 4 | EOQ, SS | √(2DS/H), zσ_L |
| 5 | Vận tải, 3PL | Chi phí/đơn |
| 6 | Kraljic | Total ownership cost |
| 7 | OTIF, POR | Tích 4 chỉ số con |
| 8 | Resilience, AI, ESG | Xác suất × tác động |

---

# Cảm ơn & Q&A

- Chi tiết & ví dụ tính số: `bai-hoc.md`
- Tự kiểm tra: `cau-hoi.md`
- Câu hỏi thảo luận?
