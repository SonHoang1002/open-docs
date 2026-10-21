---
marp: true
theme: default
paginate: true
---

<!-- _class: lead -->

# TÀI CHÍNH DOANH NGHIỆP
## Corporate Finance

Tài liệu MBA — Slide bài giảng tiếng Việt

---

## Mục lục học phần

- Bài 1: Tổng quan & vai trò CFO
- Bài 2: Thời gian giá trị tiền (TVM)
- Bài 3: Rủi ro, lợi nhuận & CAPM
- Bài 4: Dòng tiền tự do & vốn lưu động
- Bài 5: Chi phí vốn & WACC
- Bài 6: Cấu trúc vốn & cổ tức
- Bài 7: Đánh giá: DCF & multiple
- Bài 8: M&A & đầu tư rủi ro

---

## Thông điệp xuyên suốt

- Mục tiêu: **tối đa hóa giá trị cổ đông**
- Giá trị = PV dòng tiền tương lai, xét **rủi ro**
- Lợi nhuận kế toán ≠ dòng tiền
- Mọi quyết định: so với **chi phí cơ hội**
- Nợ & cổ tức là **công cụ**, không phải mục tiêu

---

# Bài 1 — Tổng quan & CFO

---

## Ba quyết định cốt lõi

- **Đầu tư**: dự án nào tạo giá trị → NPV
- **Tài trợ**: vay hay góp → WACC, cấu trúc vốn
- **Phân phối**: cổ tức hay tái đầu tư
- Mọi quyết định quay về **giá trị cổ đông**

---

## Vòng đời tài chính

- Khởi đầu: CF âm, vốn cổ phần mạo hiểm
- Tăng trưởng: NWC phình, CF có thể âm
- Trưởng thành: CF dương → trả nợ, cổ tức
- Suy giảm: CAPEX < khấu hao → tái cấu trúc
- Mỗi giai đoạn: **cấu trúc vốn khác nhau**

---

## Xung đột lợi ích

- Cổ đông vs quản lý: empire building
- Cổ đông vs chủ nợ: đánh bạc rủi ro
- Tập đoàn vs công ty con: chuyển giá
- Giảm: giám sát HĐQT, thưởng equity, covenant

---

# Bài 2 — Thời gian giá trị tiền

---

## Công thức nền tảng

- $FV = PV \times (1+r)^n$
- $PV = FV / (1+r)^n$
- $PV_{annuity} = C \times \frac{1-(1+r)^{-n}}{r}$
- Quy mọi dòng tiền về **cùng mốc**

---

## Ví dụ trả góp máy 2 tỷ

- Trả góp 5 năm, cuối năm, r = 12%
- $C = 2.000 / 3,6048 \approx 554,8$ tr/năm
- Tổng trả 2.774tr → 774tr là "tiền lãi"
- So trả trước chiết khấu bằng **PV**

---

## EAR & so sánh lãi suất

- $EAR = (1 + r/m)^m - 1$
- 12%/năm gộp tháng → EAR ≈ 12,68%
- 1,5%/tháng → EAR ≈ 19,56% (không phải 18%)
- Luôn quy EAR khi so sản phẩm vay

---

## Trái phiếu & TVM

- Giá = PV(coupon) + PV(mệnh giá)
- YTM > coupon → giá < mệnh giá
- Lãi tăng → giá trái phiếu giảm
- Kỳ hạn dài → nhạy lãi suất hơn (duration)

---

# Bài 3 — Rủi ro & CAPM

---

## Đo rủi ro & lợi nhuận

- $E(R) = \sum p_i R_i$
- Rủi ro: độ lệch chuẩn σ
- Hệ thống: không phân tán được (β)
- Phí hệ thống: phân tán được (đa dạng hóa)

---

## CAPM

- $K_e = R_f + \beta \times (E(R_m) - R_f)$
- Ví dụ: R_f=5%, ERP=6%, β=1,4 → 13,4%
- β>1: mạo hiểm; β<1: phòng thủ
- Ke = cửa sổ mọi dự án phải vượt

---

## Giới hạn CAPM

- β lịch sử ≠ β tương lai
- Fama–French: thêm quy mô, giá trị
- ERP khó ước lượng ổn định
- Dùng CAPM + build-up + kiểm chứng
- Không phải "số thần" — là khung khởi đầu

---

# Bài 4 — Dòng tiền tự do

---

## Công thức CFF

- $CFF = NOPAT + \text{khấu hao} - \Delta NWC - CAPEX$
- $NOPAT = EBIT \times (1-t)$
- Khấu hao: trừ thuế rồi, không phải tiền
- CFF = tiền cho **tất cả** nhà cung cấp vốn

---

## Ví dụ tính CFF

- EBIT 5.000; thuế 20% → NOPAT 4.000
- Khấu hao 1.500; ΔNWC 500; CAPEX 1.200
- CFF = 4.000 + 1.500 − 500 − 1.200 = 3.800
- Đối chiếu với lãi kế toán để hiểu lệch

---

## Vốn lưu động & CCC

- $CCC = DSO + DIO - DPO$
- DSO: ngày thu khách; DIO: ngày tồn
- DPO: ngày trả NCC
- CCC ngắn = tiền quay nhanh hơn

---

## NWC: bài học thực tế

- Tăng trưởng nhanh → NWC phình → hết tiền
- CCC âm: bán lẻ/thanh toán (thu trước)
- CAPEX < khấu hao + tăng trưởng = hao mòn
- "Profitable growth ≠ self-funding"

---

# Bài 5 — Chi phí vốn & WACC

---

## Công thức WACC

- $WACC = \frac{E}{V}K_e + \frac{D}{V}K_d(1-t)$
- Ke: CAPM; Kd: lãi vay **biên** hiện tại
- Trọng số: giá trị thị trường, cấu trúc mục tiêu
- $(1-t)$: lãi vay được trừ thuế

---

## Ví dụ WACC

- E 300 tỷ Ke 14%; D 200 tỷ Kd 10%; thuế 20%
- WACC = 0,6×14 + 0,4×10×0,8 = 8,4 + 3,2
- WACC = **11,6%** — cửa sổ dự án nội bộ
- WACC sai → cả chuỗi NPV sai

---

## WACC trong thực hành

- SME chưa niêm yết: β proxy + premium riêng
- Dự án khác rủi ro: r riêng (risk-adjusted)
- Lãi suất đổi → rà soát WACC 2 lần/năm
- WACC thấp = tự lừa mình chấp nhận kém
- APV cho cấu trúc vốn đổi theo giai đoạn

---

# Bài 6 — Cấu trúc vốn & cổ tức

---

## Nợ: lợi ích & chi phí

- Lợi ích: thuế, kỷ luật dòng tiền, rẻ hơn
- Chi phí: phá sản, đánh bạc, covenant
- MM có thuế: nợ = PV tax shield (giả định)
- Trade-off: thuế ≈ chi phí phá sản

---

## Pecking order & cổ tức

- Ưu tiên: giữ lại → nợ → cổ phiếu mới
- Sợ pha loãng (asymmetry information)
- Residual: đầu tư NPV dương trước, chia dư
- Cắt cổ tức = tín hiệu tiêu cực mạnh
- Buyback linh hoạt hơn cổ tức

---

# Bài 7 — DCF & multiple

---

## DCF ba bước

- Dự báo CFF 5–10 năm
- $TV = CFF_n(1+g)/(WACC-g)$
- $EV = PV(CFF) + PV(TV)$
- Giá cổ = (EV − Nợ + Tiền) / SL cổ phiếu

---

## Bẫy terminal value

- TV thường chiếm 60–80% EV
- Nhạy khủng khiếp với WACC & g
- Bắt buộc bảng nhạy cảm 5×5
- Kiểm tra g < tăng trưởng nền kinh tế
- TV cao → nói rõ "tin tưởng vào đâu"

---

## Multiple phổ biến

- P/E: lợi nhuận; EV/EBITDA: so nợ khác nhau
- P/B: tài sản; P/S: chưa có lãi
- Comparable phải **thật tương đương**
- P/E thấp có thể là "giá trị" hoặc "bẫy"
- Triangulation: DCF + multiple + precedent

---

# Bài 8 — M&A & đầu tư rủi ro

---

## M&A: giá tối đa

- $Giá_{max} = V_B + PV(synergy) - chi phí tích hợp$
- Premium > synergy → hủy giá trị người mua
- Synergy chi phí: kiểm chứng dễ hơn doanh thu
- Winner's curse: thắng thầu tự hại mình

---

## Due diligence & PMI

- 6 lĩnh vực: TC, pháp lý, thuế, vận hành, HR, CNTT
- PMI 100 ngày quyết định giá trị hiện thực
- Escrow: giữ % cho rủi ro phát hiện sau
- Earn-out: gắn giá với hiệu suất tương lai
- 60–70% thất bại do tích hợp, không do giá

---

## Đầu tư rủi ro

- Danh mục: nhiều khoản nhỏ, vài khoản bù
- Staged financing: giải ngân theo milestone
- Mua quyền chọn mở rộng, không cam kết full
- Due diligence: team, thị trường, CAC/LTV
- Giảm downside quan trọng hơn dự báo upside

---

## Case ôn tập — "Doanh thu ×2, giá −35%"

- M&A bành trướng, ROIC 8% < WACC 13%
- Tăng trưởng phá giá trị khi sinh lời < vốn
- Bài học: theo ROIC–WACC spread, FCF
- Không kỷ niệm doanh thu — kỷ niệm giá trị

---

## Case ôn tập — "Lãi mà hết tiền"

- NOPAT dương, CCC từ 55 lên 155 ngày
- Đọng thêm ~100 ngày dòng tiền
- Hành động: thu sớm, tồn gọn, NCC đàm phán
- Bài học: theo CCC hàng tuần, không chờ năm

---

## Công thức — Bảng ôn nhanh

- $PV, FV, EAR$; CAPM: $K_e = R_f + \beta ERP$
- $CFF = NOPAT + kh.hao - \Delta NWC - CAPEX$
- $WACC = \frac{E}{V}K_e + \frac{D}{V}K_d(1-t)$
- $TV = CFF_n(1+g)/(WACC-g)$
- $CCC = DSO + DIO - DPO$

---

## Checklist 7 điểm cho CFO

1. Mọi quyết định lớn có NPV/CFF?
2. Ke/Kd/ trọng số dùng giá trị biên?
3. CCC + DSO/DIO/DPO theo tháng?
4. WACC rà soát khi lãi suất đổi?
5. Cấu trúc vốn có mục tiêu & room covenant?
6. Cổ tức là phần dư, không phải mục tiêu?
7. DCF có bảng nhạy cảm + kiểm chứng chéo?

---

## Lỗi thường gặp (tổng hợp)

- Dùng lãi vay làm WACC cho mọi dự án
- Cộng trực tiếp dòng tiền nhiều năm
- Chia cổ tức bằng mọi giá (kể cả vay)
- Tin synergy ảo, bỏ qua PMI
- Chọn multiple để biện minh giá có sẵn
- Quên chi phí cơ hội tiền mặt idle

---

## Tóm tắt 8 bài

- 1: Khung mục tiêu & 3 quyết định
- 2: TVM — nền tảng mọi tính toán
- 3: Rủi ro & Ke (CAPM)
- 4: CFF & CCC — sức khỏe dòng tiền
- 5: WACC — cửa sổ chiết khấu
- 6: Nợ & cổ tức — cấu trúc tối ưu
- 7: DCF + multiple — định giá
- 8: M&A & rủi ro — sáng suốt khi mua

---

## Liên kết với 3 môn còn lại

- Kế toán: CFF, NOPAT, khấu hao, NWC
- Kinh tế: lãi suất, lạm phát, tỷ giá → WACC
- Marketing: CAC/LTV → định giá startup, M&A
- Chiến lược: synergies & danh mục dự án

---

# Cảm ơn & Q&A

- Câu hỏi mở: mời hỏi về case/thương vụ
- Bài tập: dựng DCF 1 trang cho công ty mình
- Chi tiết: `bai-hoc.md`
- Tự kiểm: `cau-hoi.md`

---

<!-- _class: lead -->

# Hết — Tài chính doanh nghiệp
