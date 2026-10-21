---
marp: true
theme: default
paginate: true
---

<!-- _paginate: false -->

# Chuyên đề 15
## Đầu tư & Quản trị danh mục
### Investments & Portfolio Management

---

# Mục lục chuyên đề

- Bài 1: Công cụ tài chính & thị trường
- Bài 2: Trái phiếu & đường cong lợi suất
- Bài 3: Phân tích cơ bản & CAPM
- Bài 4: Hiệu suất đầu tư — Sharpe, alpha
- Bài 5: Lý thuyết danh mục — Markowitz
- Bài 6: Quản trị rủi ro — VaR, stress test
- Bài 7: Thị trường vốn Việt Nam & fintech
- Bài 8: Quản trị danh mục & đạo đức đầu tư

---

# Bài 1 — Ba nhóm công cụ tài chính

- Cổ phiếu: sở hữu — cổ tức + lãi vốn
- Trái phiếu: cho vay — coupon + gốc
- Phái sinh: hợp đồng — futures, options, swap
- ETF: quỹ bám chỉ số, mua bán như cổ phiếu
- $R = (P_1 - P_0 + D) / P_0$
- Rủi ro hệ thống vs. rủi ro riêng

---

# Ví dụ & đòn bẩy

- Mua 25.000 → bán 29.000 + cổ tức 1.000
- Lợi nhuận = 16%
- Ký quỹ 10% futures = đòn bẩy 10 lần
- Lợi nhuận kỳ vọng tăng, phương sai tăng gấp bình phương bình phương
- "Không đầu tư" = mất mát thầm lặng theo lạm phát

---

# Bài 2 — Trái phiếu & lãi suất

- Giá & lãi suất ngược chiều
- $P = \sum C/(1+y)^t + F/(1+y)^n$
- Current yield = coupon / giá thị trường
- Yield curve: bình thường / đảo ngược / phẳng
- Lãi suất tăng → giá trái phiếu dài giảm mạnh

---

# Duration & tín dụng

- Modified duration ước tính %Δ giá
- $\Delta P/P \approx -D_{\text{mod}} \times \Delta y$
- Duration 4,5, lãi +0,75% → giá −3,38%
- Credit spread = ytpDN − yTC cùng kỳ
- Yield thực ≈ danh nghĩa − lạm phát kỳ vọng
- Đảo ngược curve: tín hiệu thắt chặt / suy thoái

---

# Bài 3 — CAPM

- $E(R_i) = R_f + \beta_i (E(R_m) - R_f)$
- Ví dụ: Rf = 6%, premium 7%, β = 1,3
- → E(R) = 15,1%
- β > 1: nhạy thị trường hơn
- SML: beta vs lợi suất kỳ vọng — dưới SML = bán
- Alpha dương = vượt kỳ vọng rủi ro

---

# WACC — cầu nối CAPM & dự án

- $WACC = \frac{E}{E+D}R_e + \frac{D}{E+D}R_d(1-t)$
- Ví dụ: 0,7×15% + 0,3×9%×0,8 = 12,66%
- Dự án IRR > WACC mới tạo giá trị
- Giới hạn CAPM: 1 yếu tố, β không ổn định
- Dùng như khung tham chiếu, không phải sự thật

---

# Bài 4 — Hiệu suất đầu tư

- Sharpe = (Rp − Rf) / σp
- Sortino: dùng downside deviation
- Treynor: mẫu số beta
- Jensen alpha = Rp − CAPM kỳ vọng
- Tracking error: σ(Rp − Rb)
- MDD: nỗi đau tối đa từ đỉnh xuống đáy

---

# Ví dụ Sharpe & đọc hiệu suất

- Rp = 18%, Rf = 5%, σ = 15% → Sharpe 0,87
- Thị trường +40%, quỹ +30% → thua benchmark
- Sharpe cao ≠ quỹ tốt (phí, phong cách, MDD)
- Đo 3–5 năm+, gồm cả giai đoạn crash
- So sánh sau phí và sau thuế

---

# Bài 5 — Markowitz

- $E(R_p) = \sum w_i R_i$
- $\sigma_p^2 = \sum w_i w_j \sigma_{ij}$
- Ví dụ 50/50, ρ = 0,1 → σp ≈ 11,6% < 15%
- Diversification: ρ < 1 → giảm rủi ro "miễn phí"
- Efficient frontier: Pareto-optimal rủi ro–lợi nhuận
- Estimation error: trọng số nhạy lỗi ước tính

---

# Cẩn thận optimizer

- Quá khứ ≠ tương lai; correlation tăng khi crash
- Sửa: shrinkage, cap trọng số, 60/40 đơn giản
- Tangency portfolio + tiền mặt (separation)
- 10 cp cùng ngành ≠ đa dạng hóa
- Danh mục phục vụ mục tiêu cuộc đời, không phải bảng đẹp

---

# Bài 6 — VaR & stress test

- VaR 95% 1 ngày 50 triệu: 1/20 ngày có thể > 50 triệu
- 3 phương pháp: chuẩn, lịch sử, Monte Carlo
- ES/CVaR: trung bình lỗ vượt ngưỡng VaR
- $VaR_{1\text{năm}} \approx VaR_{1\text{ngày}}\sqrt{252}$
- Stress test: kịch bản chưa từng có, tương quan đổi
- Hedging: protective put, short futures chỉ số

---

# Bài 7 — Thị trường vốn Việt Nam

- HOSE, HNX, UPCOM — 3 tầng niêm yết/đăng ký
- VN30: 30 cổ phiếu lớn HOSE
- Biên độ ±7% (mức chuẩn), thanh toán T+2
- TPCP đấu giá; tpDN riêng lẻ — kiểm tra hồ sơ
- Phái sinh VN30: ký quỹ, đòn bẩy — rủi ro cao
- Robo-advisor: chi phí thấp, phổ thông, kỷ luật

---

# Cảnh báo quan trọng

- Cam kết lợi nhuận cố định cao = dấu hiệu đỏ
- "Bảo hiểm vốn 100%" + mời thêm người = nghi ponzi
- Luôn hỏi: ai phát hành? giấy phép? dòng tiền trả từ đâu?
- Sàn không phép: không tham gia, không giới thiệu
- Thuế + phí phải đưa vào lợi nhuận thực

---

# Bài 8 — Quản trị danh mục thực hành

- IPS: mục tiêu, khẩu vị, phân bổ, rebalance
- Quỹ khẩn cấp: 3–6 tháng chi tiêu, tách riêng
- Core–satellite: ETF/quỹ chỉ số + chủ động nhỏ
- DCA: kỷ luật, giảm rủi ro chọn đỉnh
- Mục tiêu 3 năm ≠ 100% cổ phiếu
- "Good enough" + chi phí thấp thắng phức tạp

---

# Đạo đức & hành vi đầu tư

- ESG: loại trừ / tích hợp / impact / stewardship
- Greenwashing: nhãn xanh không dữ liệu
- Loss aversion → bán đáy, giữ lỗ
- Phòng vệ: IPS viết trước, rebalance lịch, nhật ký
- Lợi nhuận so sánh: sau phí, sau thuế, sau rủi ro

---

# Tóm tắt chuyên đề

| Bài | Công cụ | Công thức chính |
|-----|---------|-----------------|
| 1 | Cổ phiếu/trái phiếu/phái sinh | R = (P₁−P₀+D)/P₀ |
| 2 | Duration, yield curve | ΔP/P ≈ −D·Δy |
| 3 | CAPM, WACC | Rf + β(Rm−Rf) |
| 4 | Sharpe, alpha, MDD | (Rp−Rf)/σp |
| 5 | Markowitz | w'Σw |
| 6 | VaR, ES, stress | VaR·√252 |
| 7 | HOSE, tpDN, robo | Cảnh báo lợi nhuận cố định |
| 8 | IPS, ESG, DCA | Chi phí thấp + kỷ luật |

---

# Cảm ơn & Q&A

- Chi tiết + ví dụ tính số: `bai-hoc.md`
- Bài tập trắc nghiệm & tình huống: `cau-hoi.md`
- Câu hỏi thảo luận?
