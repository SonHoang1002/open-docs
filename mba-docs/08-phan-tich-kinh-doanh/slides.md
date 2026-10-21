---
marp: true
theme: default
paginate: true
---

<!--
footer: 'Phân tích & Thống kê kinh doanh — MBA'
-->

# PHÂN TÍCH & THỐNG KÊ KINH DOANH
## Business Analytics

Quyết định bằng dữ liệu, không bằng trực giác

---

# Mục lục học phần

- **Bài 1** — Tổng quan BA: 4 cấp phân tích & quy trình
- **Bài 2** — Thống kê mô tả & trực quan hóa
- **Bài 3** — Xác suất & kiểm định giả thuyết
- **Bài 4** — Hồi quy tuyến tính & đa biến
- **Bài 5** — Phân loại: cây, logistic, đánh giá mô hình
- **Bài 6** — Tương quan, nhân quả & A/B testing
- **Bài 7** — Dashboard & storytelling với dữ liệu
- **Bài 8** — Đạo đức dữ liệu & AI có trách nhiệm

---

# Bài 1 — Tổng quan: 4 cấp phân tích

- **Mô tả** — Điều gì đã xảy ra? (dashboard)
- **Khai phá** — Vì sao? (phân rã, chẩn đoán)
- **Dự báo** — Sẽ xảy ra gì? (regression, ML)
- **Prescriptive** — Nên làm gì? (tối ưu, thử nghiệm)

Bắt đầu từ câu hỏi kinh doanh, không từ công cụ

---

# Bài 1 — Quy trình CRISP-DM (6 bước)

1. Hiểu bài toán & quyết định cần ra
2. Hiểu dữ liệu: nguồn, chất lượng
3. Chuẩn bị dữ liệu (60–80% thời gian!)
4. Phân tích / mô hình
5. Đánh giá: model có trả lời câu hỏi không?
6. Triển khai & theo dõi (monitor drift)

`garbage in → gospel out` — dữ liệu xấu, kết luận sai

---

# Bài 1 — Mức trưởng thành phân tích

- **Cấp 0** — Quyết định theo cảm tính
- **Cấp 1** — Spreadsheet cá nhân
- **Cấp 2** — BI tập trung, dashboard dùng chung
- **Cấp 3** — Dự báo có mô hình
- **Cấp 4** — Tự động hóa, real-time

Mỗi cấp đòi hỏi: dữ liệu + kỹ năng + văn hóa dữ liệu

---

# Bài 2 — Thống kê mô tả: trung tâm

- **Mean** — nhạy với outlier: $\bar x = \sum x_i / n$
- **Median** — chống outlier, "giá trị điển hình"
- **Mode** — phổ biến nhất, hữu ích cho định tính

Phân phối lệch phải → báo **cả mean và median**
VD: doanh số có ngày spike 120 → mean 23.8, median 13

---

# Bài 2 — Độ phân tán & outlier

- **Variance / Std dev** — độ biến động quanh trung bình
- **IQR** = Q3 − Q1; fence = Q1 − 1.5·IQR, Q3 + 1.5·IQR
- **Quy tắc 68–95–99.7** áp dụng cho phân phối chuẩn

Outlier ngoài fence → điều tra: chiến dịch hay lỗi nhập liệu?

---

# Bài 2 — Chọn biểu đồ đúng

| Mục đích | Dùng | Tránh |
|---|---|---|
| So sánh nhóm | Bar | Trục cắt cụt |
| Xu hướng thời gian | Line | Bar dày |
| Phân phối | Histogram, box | Chỉ báo mean |
| Tương quan | Scatter | Kết luận nhân quả |

Pie >5 lát = không thấy gì. Highlight exception, không trang trí

---

# Bài 2 — Cạm bẫy diễn giải

- **Simpson's Paradox** — xu hướng từng nhóm bị đảo khi gộp
- **Trục Y cắt cụt** — phóng đại +% lên board
- **Mean che bất bình đẳng** — luôn thêm median/P90
- **Cohort analysis** — retention theo nhóm gia nhập

Báo cáo trung thực = mean + median + phân vị cao

---

# Bài 3 — Giả thuyết thống kê

- **$H_0$** — không có khác biệt/tác dụng
- **p-value** — xác suất dữ extrem nếu $H_0$ đúng
- **α = 0.05** — ngưỡng bác bỏ $H_0$
- **Lỗi loại I** — false positive; **loại II** — false negative
- **Power = 1 − β** — thường ≥ 0.8

p < 0.05 ≠ $H_0$ sai 95%. p ≠ quan trọng về kinh doanh

---

# Bài 3 — Base rate quyết định niềm tin

$P(churn|alert) = \dfrac{0.9 \times 0.05}{0.9 \times 0.05 + 0.1 \times 0.95} \approx 32\%$

- Mô hình đúng 90% với churn nền 5%
- **2/3 cảnh báo là sai** dù "90% accuracy"

Đánh giá theo precision/PR-AUC — không khoe accuracy

---

# Bài 3 — Tính cỡ mẫu trước khi test

$$n \approx \frac{16\,s^2}{\delta^2} \quad (\alpha=0.05,\ \text{power}=0.8)$$

VD: 4% → 4.8% (δ = 0.008, s ≈ 0.196):
**n ≈ 10.000 / nhóm**

Test 500 khách 2 tuần = kết luận nhiễu, không phải "không khác biệt"

---

# Bài 3 — Chống p-hacking

- Pre-register metric, hypothesis, kế hoạch phân tích
- Correction (Bonferroni: α/m) khi chạy nhiều test
- Báo **effect size + CI**, không chỉ p
- Significant ≠ important — kiểm giá trị tiền tệ

VD: 12 biến thể × α = 0.05 → ~1 "thắng" giả

---

# Bài 4 — Hồi quy tuyến tính

$$\hat y = b_0 + b_1 x_1 + b_2 x_2 + \dots$$

- $b_j$ = thay đổi y khi $x_j$ +1, **giữ các x khác** (ceteris paribus)
- $R^2$ = tỷ lệ variance y mô hình giải thích
- $b_0$ = intercept; $b_1$ = slope

Đa biến điều khiển confound — mạnh hơn correlation đơn

---

# Bài 4 — Giả định OLS & rủi ro

- Tuyến tính · phương sai đồng đều · lỗi bình thường (n nhỏ)
- Không autocorrelation (dữ thời gian) · không đa cộng tuyến (VIF)

**Overfitting:** thêm biến → $R^2$ in-sample luôn tăng
→ dùng adjusted $R^2$, AIC/BIC, **holdout out-of-sample**

Spurious regression: 2 trend chung → $R^2$ cao ảo

---

# Bài 5 — Bài toán phân loại

- **Cây quyết định** — dễ giải thích, đưa vào SOP
- **Logistic:** $\hat p = \dfrac{1}{1+e^{-(b_0+\sum b_j x_j)}}$
- $e^{b_j}$ = odds ratio khi $x_j$ +1
- Ngưỡng $\tau$: 0.5 mặc định — tối ưu theo **chi phí FP/FN**

Interpretable thắng khi cần con người thay đổi hành vi

---

# Bài 5 — Confusion matrix & chỉ số

| | Báo + | Báo − |
|---|---|---|
| **Thực +** | TP | FN |
| **Thực −** | FP | TN |

- **Precision** = TP/(TP+FP) — báo đúng bao nhiêu
- **Recall** = TP/(TP+FN) — tìm được bao nhiêu
- **Accuracy 97% có thể ảo** (imbalance 3%: báo toàn "−")
- **AUC:** 0.5 = may rủi · 0.7–0.8 OK · 0.9+ nghi leakage

---

# Bài 5 — Ngưỡng theo tiền, không theo 0.5

$$\tau^* = \frac{c_{FP}}{c_{FP} + c_{FN}}$$

- FN (bỏ lỡ churn) = 500k, FP (gọi sai) = 50k
- **$\tau^* \approx 9\%$** — call center gọi nhóm risk > 9%

Leakage phá mọi model "ảo thần" → hiểu timestamp feature
Monitor drift 6 tháng sau — model hỏng im lặng

---

# Bài 6 — Tương quan ≠ nhân quả

- **Confounder** — mùa nóng kéo cả kem lẫn đuối nước
- **Reverse causality** — y → x
- **Spurious** — may mắn, chọn hậu kỳ

3 điều kiện gợi ý nhân quả: thời gian trước → tương quan → không có lời giải thay thế

Randomization = vua của bằng chứng nhân quả

---

# Bài 6 — A/B test làm đúng

1. Hypothesis + metric primary + MDE kinh doanh
2. Power → n; chốt thời gian (≥ 2 tuần / vòng mua)
3. Randomization stable + check SRM
4. **Không peeking** — dừng khi p < 0.05 ngày 3 = α phình
5. Report: effect + CI + p + segments; guardrail xanh

Pre-register. "Không significant" ≠ "không khác biệt"

---

# Bài 6 — Khi không random được

- **Difference-in-differences** — 2 nhóm trước/sau, parallel trends
- **Regression discontinuity** — 2 bên ngưỡng điểm
- **Matching** — ghép tương đương trên observed confounders

Network effects → random theo **cluster** (thành phố/nhóm)
Quasi-experiment yếu hơn RCT — báo cáo giới hạn trung thực

---

# Bài 7 — Dashboard = công cụ quyết định

- ≤ **5–7 câu hỏi** mỗi dashboard
- Row 1: 4–5 KPI (value, Δ, sparkline)
- Row 2: trend + alert list theo ngưỡng đỏ
- Row 3: bar/top-N theo dimension
- Footer: **last refresh + owner**

40 KPI → 12 login/tuần → dashboard chết

---

# Bài 7 — North-star metric tree

- **North star** — giá trị cốt lõi cho khách (VD: weekly active teams trả tiền)
- **Input metrics** — signup, activation, retention, expansion
- **Guardrail** — cash, latency, complaint

Semantic layer: **1 định nghĩa metric** dùng chung mọi BI tool
Không có SSOT → 3 con số doanh thu → khủng hoảng niềm tin

---

# Bài 7 — Storytelling với dữ liệu

3 lớp: **Visual** (chart đúng) · **Narrative** (câu chuyện) · **Audience** (dịch sang quyết định)

Công thức slide hành động:
**Observation → Implication → Recommendation → Ask**

Chart đẹp không có ask = trình bày
Story không có chart đúng = hùng biện

---

# Bài 8 — 7 nguyên tắc dữ liệu cá nhân

1. Hợp pháp & minh bạch
2. Mục đích hạn chế
3. **Dữ liệu tối thiểu**
4. Độ chính xác
5. Giới hạn lưu trữ
6. Toàn vẹn & bảo mật
7. Trách nhiệm giải trình

VN: Nghị định 13/2023/NĐ-CP · Quốc tế: GDPR

---

# Bài 8 — Bias & Fairness

- Dữ liệu quá khứ = **lịch sử có lỗi** → mô hình học và khuếch đại
- Proxy discrimination: mã vùng thay thu nhập, tên thay giới tính
- Các fairness metric **xung đột** — tối ưu 1, đánh đổi khác

Áp dụng: audit subgroup · bỏ proxy · human-in-the-loop · model card · kênh khiếu nại

---

# Bài 8 — AI có trách nhiệm (GenAI)

- **Allowlist use-case** — cấm dán PII/hợp đồng vào prompt public
- DLP + tool enterprise (zero-retention)
- Human review đầu ra quan trọng — hallucination là thật
- Retention/xóa theo lịch · access log · audit

Minimization + human-in-the-loop + redress = Responsible AI

---

# Tóm tắt 8 bài

| Bài | Thông điệp vàng |
|---|---|
| 1. Tổng quan | Câu hỏi kinh doanh trước công cụ |
| 2. Mô tả | Mean + median + P90; đừng lừa trục |
| 3. Kiểm định | Significant ≠ important; tính power trước |
| 4. Hồi quy | Out-of-sample mới tính; VIF, residual |
| 5. Phân loại | Ngưỡng theo chi phí FP/FN |
| 6. A/B | Pre-register & đủ cỡ mẫu |
| 7. Dashboard | Dashboard = quyết định, không album |
| 8. Đạo đức | Dữ tối thiểu + con người trong vòng lặp |

---

# Thuật ngữ Anh–Việt (1)

- Business Analytics — Phân tích kinh doanh
- Descriptive / diagnostic / predictive / prescriptive — Mô tả / chẩn đoán / dự báo / chỉ đạo
- Hypothesis testing — Kiểm định giả thuyết
- p-value / Type I error — Giá trị p / Lỗi loại I
- Confidence interval — Khoảng tin cậy
- Effect size — Cỡ hiệu ứng
- Regression / multicollinearity — Hồi quy / đa cộng tuyến

---

# Thuật ngữ Anh–Việt (2)

- Decision tree / logistic regression — Cây quyết định / hồi quy logistic
- Confusion matrix — Ma trận nhầm lẫn
- Precision / recall / AUC — Chính xác / phủ / diện tích dưới ROC
- Data leakage — Rò rỉ dữ liệu
- Correlation vs. causation — Tương quan so với nhân quả
- A/B testing / randomization — Thử nghiệm A/B / random hóa
- North-star metric / dashboard — Chỉ số bắc đẩu / bảng điều khiển
- Algorithmic bias / fairness — Thiên kiến thuật toán / công bằng

---

# Câu hỏi thảo luận & Q&A

1. Bài toán "tăng 10% doanh số" nên bắt đầu ở cấp phân tích nào?
2. Mean hay median cho KPI bạn đang theo dõi? Vì sao?
3. Bạn sẽ giải thích thế nào với sếp: "p = 0.06 chưa đủ bằng chứng"?
4. Dashboard của bạn trả lời được mấy câu hỏi quyết định?

**Cảm ơn — Hỏi & Đáp**
