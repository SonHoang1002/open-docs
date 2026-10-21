# PHÂN TÍCH & THỐNG KÊ KINH DOANH (Business Analytics)

## Mở đầu

Phân tích & Thống kê kinh doanh (Business Analytics – BA) là học phần đưa ra quyết định quản trị bằng dữ liệu thay vì trực giác. Trong chương trình MBA, BA đóng vai trò "chiếc la bàn định lượng": mọi môn khác (tài chính, marketing, vận hành, chiến lược) đều sinh ra dữ liệu — môn này dạy cách đọc, kiểm chứng và biến dữ liệu thành hành động.

**Mục tiêu học tập — sau học phần, học viên có thể:**

1. Phân loại đúng bài toán: mô tả / khai phá / dự báo / prescriptive và chọn công cụ phù hợp.
2. Tính toán và diễn giải thống kê mô tả, phân phối xác suất, kiểm định giả thuyết (z, t, chi-square).
3. Xây dựng, đọc và phê bình mô hình hồi quy tuyến tính & đa biến; nhận diện đa cộng tuyến.
4. Phân loại dữ liệu bằng cây quyết định và hồi quy logistic; đánh giá mô hình bằng confusion matrix, AUC.
5. Phân biệt tương quan và nhân quả; thiết kế và phân tích A/B testing đúng (nền tảng, ý nghĩa thống kê, hiệu ứng).
6. Thiết kế dashboard và kể chuyện bằng dữ liệu (data storytelling) thuyết phục nhà ra quyết định.
7. Nhận diện vấn đề đạo đức: thiên kiến dữ liệu, quyền riêng tư, AI có trách nhiệm.

**Vị trí trong chương trình MBA:** BA thường là học phần nền tảng giữa chương trình, phục vụ Phân tích kinh doanh nâng cao, Nghiên cứu thị trường, Chuyển đổi số. Không yêu cầu lập trình nâng cao — công cụ minh họa: Excel/Google Sheets, R/Python cơ bản, công cụ BI (Power BI/Tableau) theo lựa chọn.

---

## Mục lục các bài

- **Bài 1:** Tổng quan phân tích dữ liệu kinh doanh — 4 loại phân tích & quy trình
- **Bài 2:** Thống kê mô tả & trực quan hóa dữ liệu
- **Bài 3:** Xác suất & kiểm định giả thuyết
- **Bài 4:** Hồi quy tuyến tính & đa biến
- **Bài 5:** Phân loại — cây quyết định, hồi quy logistic & đánh giá mô hình
- **Bài 6:** Tương quan, nhân quả & A/B testing
- **Bài 7:** Dashboard & storytelling with data
- **Bài 8:** Đạo đức dữ liệu, quyền riêng tư & AI có trách nhiệm

---

## Bài 1: Tổng quan phân tích dữ liệu kinh doanh — 4 loại & quy trình

### Phần A — Cơ bản

**Định nghĩa.** Business Analytics là tập hợp phương pháp thống kê, mô hình và công cụ để biến dữ liệu thành thông tin hỗ trợ ra quyết định. Khác Data Science (lập trình/mô hình nặng), BA nhấn mạnh **câu hỏi kinh doanh → hành động**.

**4 cấp độ phân tích (Davenport):**

| Cấp | Câu hỏi | Ví dụ | Công cụ |
|---|---|---|---|
| **Mô tả (Descriptive)** | Điều gì đã xảy ra? | Doanh số quý II theo vùng | SQL, PivotTable, BI dashboard |
| **Khai phá (Diagnostic)** | Vì sao xảy ra? | Churn tăng do lỗi giao hàng vùng X | Phân rã, A/B nhỏ, regression |
| **Dự báo (Predictive)** | Điều gì sẽ xảy ra? | Khách nào có nguy cơ churn? | Regression, tree, machine learning |
| **Prescriptive (Chỉ đạo)** | Nên làm gì? | Ngân sách marketing phân bổ thế nào? | Tối ưu, mô phỏng, thử nghiệm |

Quy tắc thực hành: **bắt đầu từ prescriptive cần gì**, chứ không nhảy vào model trước.

**Quy trình phân tích chuẩn (CRISP-DM rút gọn 6 bước):**

1. **Hiểu bài toán kinh doanh** (business understanding): ai ra quyết định, quyết định gì, trade-off gì.
2. **Hiểu dữ liệu** (data understanding): nguồn, chất lượng, độ đầy đủ.
3. **Chuẩn bị dữ liệu** (data prep): làm sạch, biến đổi — 60–80% thời gian.
4. **Phân tích/mô hình** (modeling): mô tả, dự báo, thử nghiệm.
5. **Đánh giá** (evaluation): mô hình có trả lời câu hỏi kinh doanh không? (không chỉ R² cao).
6. **Triển khai & theo dõi** (deployment): dashboard, quy trình, giám sát drift.

**Data types & measurement scales (nền tảng):**

- **Định tính (categorical):** nominal (giới tính, vùng), ordinal (hài lòng 1–5).
- **Định lượng (numerical):** discrete (số đơn), continuous (doanh thu, thời gian).
- Thang đo quan trọng cho việc chọn phép thử (xem Bài 3): t-test vs. chi-square vs. ANOVA.

**Ví dụ đơn giản:** Câu hỏi "Vì sao doanh số tháng 5 giảm 12%?" — Descriptive: dashboard doanh số theo ngày/kênh/SKU cho thấy giảm chủ yếu ở kênh online; Diagnostic: so sánh traffic (không đổi) vs. conversion (giảm 25%) sau khi đổi trang thanh toán; Action: A/B test checkout. Ba bước = ba cấp phân tích.

### Phần B — Nâng cao

**"Garbage in, gospel out."** Mô hình ML phức tạp không cứu dữ liệu sai. 3 lớp chất lượng dữ liệu: (1) **accuracy** (đúng sự thật), (2) **completeness** (đầy đủ), (3) **consistency** (nhất quán giữa hệ thống). Data quality có kinh tế: mỗi dollar đầu vào làm sạch tiết kiệm nhiều dollar xử lý lỗi downstream (nghiên cứu IBM/DAMA ước tính chi phí dữ liệu kém chiếm 15–25% doanh thu ở một số ngành).

**Metrics vs. dimensions.** Dimension = "theo gì" (ngày, vùng, kênh, SKU); Metric = "đo cái gì" (doanh thu, số đơn, AOV). Thiết kế bảng dữ liệu sạch: grain (độ mịn) + dimensions + metrics + thời gian. Sai grain → số liệu dashboard "không khớp báo cáo tài chính" — lỗi phổ biến nhất làm mất niềm tin phân tích.

**Analytics maturity model.** 5 cấp: (0) phân tích theo cảm tính; (1) spreadsheet cá nhân; (2) BI tập trung; (3) dự báo có mô hình; (4) quyết định tự động/real-time. Mỗi cấp đòi hỏi: data governance, kỹ năng, văn hóa ra quyết định theo dữ liệu. Nhảy cấp 0→4 trong 1 năm gần như thất bại.

**Giới hạn tư duy "số liệu nói tất cả."** Vai trò con người: đặt câu hỏi đúng, hiểu bối cảnh nghiệp vụ, chịu trách nhiệm đạo đức. Mô hình dự báo không biết "thế giới có thể đổi luật" (COVID); BA giỏi kết hợp quantitative + qualitative (phỏng vấn khách, chuyên gia).

### Phần C — Thực tế

**Case: ngân hàng bán lẻ VN — từ dashboard churn đến hành động.** Team BA xây mô hình logistic dự báo churn 30 ngày (AUC 0.74); điểm mạnh không phải mô hình mà là **quy trình**: điểm risk được push vào app CRM của giao dịch viên, kịch bản gọi giữ khách có sẵn, campaign test A/B giảm churn nhóm cao 18% — mô hình chỉ đáng giá khi nối được vào hành động hàng ngày. Bài học: deployment & adoption > thuật toán.

**Case generic: chuỗi F&B đọc "vì sao AOV giảm".** Ban đầu đổ lỗi giá. Phân rã $AOV = \frac{doanh thu}{số đơn}$: số đơn tăng 15%, AOV giảm 8% — do promo mua 1 tặng 1 giờ thấp điểm. Doanh thu tăng 6%, biên giảm 3 điểm % — promo tạo đơn nhưng hủy biên. Chiến lược sửa: limit promo theo khung giờ, bundle margin cao. Analytics cứu marketing khỏi tự chúc mừng doanh thu.

**5 lỗi thường gặp:**

1. **Bắt đầu bằng công cụ** ("cần dashboard gì?" thay vì "quyết định gì?").
2. **Không định nghĩa grain & metric** — 3 báo cáo 3 con số doanh thu.
3. **Tin correlation = causation** (Bài 6).
4. **Mô hình không có owner hành động** — slide xong rồi nằm đó.
5. **Không giám sát sau triển khai:** model drift, dữ liệu đổi schema, dashboard "hỏng im lặng".

**Checklist khởi động dự án phân tích (buổi đầu):**

- [ ] Viết 1 câu: bên ra quyết định, quyết định gì, kỳ vọng thay đổi hành vi gì.
- [ ] Liệt kê 3 metric success (VD: giảm churn X điểm, tăng conversion Y%).
- [ ] Xác định nguồn dữ liệu + owner data + lịch cập nhật.
- [ ] Chọn cấp phân tích phù hợp — đừng dự báo khi mới có mô tả sai.
- [ ] Chốt cách kiểm chứng (holdout, A/B, backtest) TRƯỚC khi phân tích.
- [ ] Phân bổ 20%+ effort cho data prep & data quality.

#### Ứng dụng thực tế

Áp dụng CRISP-DM cho bài toán "tăng thu hồi công nợ": business understanding — bộ phận nợ xấu muốn giảm DSO 10 ngày; data — hóa đơn, lịch sử thanh toán, tương tác nhắc nợ; prep — làm sạch mã khách, chuẩn hóa lý do chậm; modeling — điểm ưu tiên nhắc (dự báo thanh toán trong 14 ngày); evaluation — ưu tiên nhóm có "cảm biến" chuyển đổi; deployment — bảng việc hàng ngày cho telesales; theo dõi — % thu theo nhóm điểm. KPI cuối: DSO giảm 7 ngày sau 3 tháng, chi phí nhắc nợ không tăng.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Phân biệt 4 loại phân tích bằng ví dụ bạn từng làm.
**Gợi ý trả lời:** Mô tả: dashboard doanh thu theo kênh tháng. Khai phá: phát hiện traffic ổn nhưng conversion giảm sau đổi UI — dùng phân rã và cohort. Dự báo: mô hình dự báo đơn/triệu để điều tồn kho. Prescriptive: khuyến nghị phân bổ ngân sách tối đa hóa ROI ước tính từ thử nghiệm A/B. Tôi luôn nói rõ loại nào trả lời câu hỏi nào và dữ liệu cần gì.

**Câu 2:** Bạn dành bao nhiêu thời gian cho data prep? Vì sao?
**Gợi ý trả lời:** Thường 60–80% — vì dữ liệu thật bẩn: trùng, thiếu, sai định dạng, lệch grain giữa hệ thống. Prep tốt quyết định mô hình có ý nghĩa không; prep dở thì mọi model chỉ là trang trí. Tôi cũng tranh luận sớm với owner data để sửa quy trình ghi dữ liệu gốc, giảm mãi mãi công sức làm sạch lặp lại.

**Câu 3:** R² cao nghĩa là mô hình tốt chứ?
**Gợi ý trả lời:** Chưa chắc. R² cao có thể do overfitting, đa cộng tuyến, hoặc biến target rò rỉ (data leakage). Mô hình tốt = trả lời đúng câu hỏi kinh doanh trên dữ liệu chưa từng thấy (out-of-sample), ổn định theo thời gian, và có hành động đi kèm. Tôi kiểm bằng cross-validation, baseline so sánh, và tác động kinh doanh đo được sau pilot.

---

## Bài 2: Thống kê mô tả & trực quan hóa dữ liệu

### Phần A — Cơ bản

**Đo xu hướng trung tâm (Central tendency):**

- **Trung bình (mean):** $\bar{x} = \frac{\sum x_i}{n}$. Nhạy với outlier.
- **Trung vị (median):** giá trị giữa khi sắp xếp. Chống outlier.
- **Mode:** giá trị xuất hiện nhiều nhất (hữu ích cho dữ liệu định tính).

**Ví dụ tính:** Doanh số 10 ngày (triệu): 12, 14, 13, 15, 12, 13, 14, 13, 12, **120** (1 ngày chiến dịch).
Mean = $(12+14+13+15+12+13+14+13+12+120)/10 = 238/10 = 23.8$ — "bị" kéo bởi 1 ngày spike. Median: sắp xếp 12,12,12,13,13,13,14,14,15,120 → median = 13. Mode = 12 và 13 (bimodal). Bài học: **luôn báo median + mean khi phân phối lệch**.

**Đo độ phân tán (Dispersion):**

- **Phạm vi (range):** $max - min$.
- **Phương sai (variance):** $s^2 = \frac{\sum(x_i - \bar{x})^2}{n-1}$.
- **Độ lệch chuẩn (std dev):** $s = \sqrt{s^2}$.

**Ví dụ tính std:** Dữ liệu: 10, 12, 14 → $\bar x = 12$; $s^2 = ((−2)^2+0+2^2)/2 = 4$; $s = 2$. $s$ = 2 triệu — ngày biến động ±2 triệu quanh trung bình.

**Phân phối & hình dạng:**

- **Lệch (skewness):** lệch phải (phải đuôi dài — doanh thu: nhiều ngày thường + ít ngày spike lớn).
- **Độ nhọn (kurtosis):** đuôi dày = outlier nhiều hơn chuẩn.
- **Quy tắc 68–95–99.7** (phân phối chuẩn): 68% dữ ±1σ, 95% ±2σ, 99,7% ±3σ.

**Percentiles & quartiles:** P25 (Q1), P50 (median), P75 (Q3); IQR = Q3 − Q1. Quy tắc nhận diện outlier: ngoài $[Q1 - 1.5\times IQR,\; Q3 + 1.5\times IQR]$.

**Ví dụ:** Q1=12, Q3=15 → IQR=3 → fence trên = 15+4.5=19.5. Ngày doanh thu 120 là outlier cực đoan — điều tra: chiến dịch hay lỗi nhập liệu?

**Trực quan hóa đúng/sai:**

| Mục đích | Biểu đồ nên dùng | Tránh |
|---|---|---|
| So sánh nhóm | Bar chart | Pie >5 nhóm |
| Xu hướng thời gian | Line chart | Bar cho thời gian dày |
| Phân phối | Histogram, box plot | Chỉ mean |
| Tương quan 2 biến | Scatter | Kết luận nhân quả |
| Thành phần | Stacked bar (100%) | Trùng pie chồng nhau |

**Lỗi trục:** cắt bớt trục (trục Y không về 0 với bar chart) phóng đại khác biệt — lỗi phổ biến trong báo cáo "tự hào".

### Phần B — Nâng cao

**Trung bình có "câu chuyện":** nền kinh tế dùng bình quân đầu người (mean) che bất bình đẳng — tương tự doanh thu TB/khách bị ảnh hưởng bởi top 1% khách hàng lớn. Luôn phân tích theo phân vị và phân khúc (segment). Rule: mean nói về **tổng**, median nói về **typical**.

**Simpson's Paradox.** Xu hướng trong từng nhóm bị đảo khi gộp nhóm (VD: tỷ lệ sống điều trị A > B trong mọi nhóm tuổi nhưng gộp lại < do phân bố tuổi lệch). Bài học: luôn phân rã theo confounder tiềm năng trước khi kết luận chiến dịch.

**Cohort analysis & retention curve.** Theo dõi nhóm khách theo tháng gia nhập — phát hiện retention tháng 1 khác nhau theo kênh; gộp chung che mất. Curve retention theo thời gian là "huyết áp" của mô hình subscription/SaaS.

**Data visualization psychology.** Màu sắc: sequential (thang lượng), diverging (tâm trung lập), categorical (phân loại). Tránh rainbow chart, 3D pie. Annotation quan trọng hơn decor: mỗi chart cần takeaway 1 dòng. Design: tối giản grid, highlight 1–2 điểm, "story arc" (bối cảnh → xung đột → số liệu → hành động).

### Phần C — Thực tế

**Case: báo cáo doanh thu "đẹp" nhưng sai.** Retail chain: VP report mean AOV tăng 5% "nhờ chiến dịch cao cấp". Analyst phát hiện: median AOV giảm 2%; mean bị 12 khách sạn B2B event kéo lên. Hành động: tách B2B/B2C trong dashboard; KPI marketing dùng median + phân phối; tránh trả thưởng dựa trên mean bị thao túng. Bài học: metric chọn phải "khó hack".

**Case generic: startup edtech — histogram churn theo "số buổi tham dự".** Ban đầu bar chart 6 nhóm thô (0–2, 3–5...). Chuyển sang histogram 1 buổi/vạch + đường retention: phát hiện ngưỡng "đi ≥4 buổi đầu" là điểm rơi retention lớn nhất → chiến dịch onboarding 4 buổi đầu. Trực quan hóa đúng mở ra chiến lược sản phẩm.

**5 lỗi thường gặp:**

1. **Chỉ báo mean** không median/std — che outlier và skew.
2. **Pie chart 12 lát** cho thấy không gì.
3. **Trục Y cắt cụt** phóng đại +% cho board.
4. **Gộp nhóm rồi kết luận** — Simpson's paradox.
5. **Dashboard 40 card** không câu chuyện — mắt không biết nhìn đâu.

**Checklist build 1 báo cáo phân tích (nửa ngày):**

- [ ] 3 câu hỏi báo cáo này trả lời.
- [ ] Mỗi metric: định nghĩa + grain + owner + nguồn.
- [ ] Mean + median + P90 cho mọi biến quan trọng.
- [ ] 1 histogram + 1 trend + 1 so sánh nhóm (tối thiểu).
- [ ] 1 dòng takeaway/chart + 1 khuyến nghị hành động.
- [ ] Kiểm tra trục, màu, nhãn; colleague "cold read" 60 giây.

#### Ứng dụng thực tế

Áp dụng percentile + box plot cho thời gian giao hàng chuỗi e-commerce: mean 2,1 ngày "ổn", nhưng P90 = 4,5 ngày và P99 = 8 ngày — nhóm đau nhất là đơn đi tỉnh xa. Dashboard mới hiển thị P50/P90 theo vùng; KPI ops chuyển sang "P90 vùng miền < 3 ngày". Sau 2 quý, P90 giảm còn 3,1 ngày; NPS tỉnh tăng 9 điểm — khách hàng thực sự sống ở phần đuôi, không ở trung bình.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Khi nào dùng median thay mean?
**Gợi ý trả lời:** Khi phân phối lệch hoặc có outlier (doanh thu, thời gian xử lý, giá nhà). Median đại diện "typical" không bị 1 điểm extreme thao túng. Thông lệ báo cáo: mean + median + P90 cùng lúc để thấy cả tổng và phần đuôi.

**Câu 2:** Bạn kiểm tra 1 dashboard mới tiếp quản thế nào?
**Gợi ý trả lời:** (1) Đối chiếu 3 metric key với nguồn hệ thống/BCF; (2) kiểm grain và công thức metric (vd: AOV = doanh thu/số đơn — numerator/denominator cùng kỳ?); (3) đọc phân phối thay vì chỉ card tổng; (4) cold-read với người nghiệp vụ — 60 giây họ có hiểu takeaway không; (5) xác minh 1 con số bằng truy vấn độc lập (SQL tay).

**Câu 3:** Giải thích Simpson's Paradox bằng ví dụ marketing.
**Gợi ý trả lời:** Chiến dịch A có conversion tổng cao hơn B, nhưng khi phân theo kênh, B thắng ở cả mobile và desktop — vì A dồn nhiều traffic vào desktop (conversion cao tự nhiên). Gộp trộn cấu trúc traffic tạo ảo tưởng. Giải pháp: phân rã theo dimension then chốt (kênh, vùng, segment) trước khi kết luận; tốt hơn: so sánh trong A/B đồng nhất.

---

## Bài 3: Xác suất & kiểm định giả thuyết

### Phần A — Cơ bản

**Xác suất nền.** $P(A)$ = xác suất; $P(A|B)$ = xác suất có điều kiện. Bayes:

$$P(A|B) = \frac{P(B|A)\,P(A)}{P(B)}$$

**Ví dụ (bài toán kinh điển y tế-nghiệp vụ):** Tỷ lệ churn thật 5%; mô hình cảnh báo đúng 90% churner (sensitivity), false positive 10%. Khách bị cảnh báo: $P(churn|alert) = \frac{0.9×0.05}{0.9×0.05 + 0.1×0.95} = \frac{0.045}{0.14} \approx 32\%$. "Mô hình 90% chính xác" — 2/3 cảnh báo là sai! Bài học: **base rate** quyết định niềm tin vào tín hiệu.

**Phân phối chuẩn & z-score.** $z = \frac{x - \mu}{\sigma}$ — số đơn vị chuẩn hóa. $P(|Z|>1.96) = 5\%$.

**Giả thuyết thống kê — khung:**

- $H_0$ (null): không có khác biệt/tác dụng (VD: conversion A = B).
- $H_1$ (alternative): có khác biệt.
- **p-value:** xác suất quan sát được dữ (hoặc cực đoan hơn) nếu $H_0$ đúng. p nhỏ → data bất thường dưới $H_0$ → nghi ngờ $H_0$.
- **Mức ý nghĩa α:** ngưỡng p để bác bỏ $H_0$ (thường 0.05).
- **Lỗi loại I (α):** bác bỏ $H_0$ khi nó đúng (false positive).
- **Lỗi loại II (β):** không bác bỏ $H_0$ khi nó sai (false negative); **công suất = 1 − β** (thường ≥ 0.8).

**Kiểm định t cho 2 nhóm độc lập (công thức approx):**

$$t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}$$

**Ví dụ tính:** Group A (n=1.000): conversion 5,2%, s≈22%; Group B (n=1.000): 4,5%, s≈20,8%.
$t \approx \frac{0.052-0.045}{\sqrt{0.22^2/1000 + 0.208^2/1000}} = \frac{0.007}{\sqrt{0.0000936}} \approx \frac{0.007}{0.00967} \approx 0.72$ → |t| < 1.96 → **không đủ bằng chứng bác bỏ $H_0$** dù difference 0.7 điểm % — cần sample lớn hơn hoặc effect lớn hơn.

**Kiểm định khác theo dữ liệu:**

- **z cho mean (n lớn):** thay t khi n ≥ 30–100.
- **Chi-square:** association hai biến categorical (VD: kênh × mua/không).
- **ANOVA:** so sánh mean ≥ 3 nhóm.
- **Paired t:** trước–sau trên cùng mẫu.

**Kẹt p-hacking:** chạy 20 biến, ngưỡng α=0.05 → kỳ vọng ~1 kết quả "significant" giả. Chống: pre-register hypotheses, correction (Bonferroni α/m), ưu tiên effect size + CI.

### Phần B — Nâng cao

**Khoảng tin cậy (Confidence Interval – CI).** Mean 95% CI: $\bar{x} \pm t^* \cdot SE$ với $SE = s/\sqrt{n}$. CI chứa 0 → không significant; CI hẹp → ước lượng chính xác. **Báo CI luôn**, không chỉ p — CI rộng chứa cả ý nghĩa lớn lẫn nhỏ = nghiên cứu vô dụng để ra quyết định.

**Effect size vs. statistical significance.** Với n=1.000.000, khác biệt 0,01 điểm % có thể significant nhưng vô nghĩa kinh doanh. Dùng Cohen's d: $d = \frac{\bar x_1 - \bar x_2}{s_pooled}$ — |d|≈0.2 nhỏ, 0.5 trung bình, 0.8 lớn. Quy tắc: **significant ≠ important**.

**Power analysis (tính cỡ mẫu trước).** Công thức approx cho 2 nhóm, α=0.05, power=0.8:

$$n_{\text{mỗi nhóm}} \approx \frac{16\,s^2}{\delta^2}$$

**Ví dụ tính:** Muốn phát hiện lift conversion từ 4% lên 4,8% (δ=0.008), s≈0.2 (binary ~$\sqrt{p(1-p)}≈0.196$):
$n \approx \frac{16 \times 0.04}{0.000064} = 10.000$ mỗi nhóm. "Test 2 tuần 500 khách" chắc chắn không đủ power — chạy 2 tuần chỉ cho kết luận nhiễu.

**Bayesian vs. frequentist (tóm tắt):** Bayesian cập nhật niềm tin bằng posterior theo data mới (hữu ích ra quyết định tuần tự); frequentist lặp biến thiên tưởng tượng. Thực tiễn: dùng frequentist cho thử nghiệm tiêu chuẩn, Bayesian khi dữ liệu nhỏ/điều chỉnh niềm tin trước.

**Non-parametric alternatives:** Mann–Whitney (thay t khi lệch mạnh), Kruskal–Wallis (thay ANOVA). Khi dữ skewed (giá trị giao dịch) → ưu tiên hoặc transform (log).

### Phần C — Thực tế

**Case: A/B "thắng" ảo của một app thương mại.** Test nút đỏ vs. xanh, n=2.000 tổng, p=0.04 → team ăn mừng. Review: 12 biến thể đã test trong tháng, không correction → Bonferroni α'=0.004 → p=0.04 fail. Chạy lại với n=40.000 pre-registered: không có khác biệt. Bài học: p-hacking + sample nhỏ = tự lừa; chi phí "rollout sai" lớn gấp nhiều lần chi phí chạy đủ sample.

**Case generic: bệnh viện đọc khảo sát hài lòng.** Mean điểm 4,1/5 "tốt"; nhưng 15% trả lời ≤2 — phân phối bimodal (khoa nhi cao, khoa ngoại thấp). Median che mất tiếng nói thiểu số. Leadership dashboard thêm % hài lòng thấp theo khoa — hành động đào tạo 2 kho điểm đuôi. Thống kê mô tả cứu dịch vụ.

**5 lỗi thường gặp:**

1. **Kết luận "significant" khi p=0.049 với 50 biến** — không correction, không pre-register.
2. **Không tính power** → test quá nhỏ, kết luận bừa hoặc bỏ test oan.
3. **Báo % mà không có n** — "tăng 50%" từ 2 lên 3 khách.
4. **Áp t-test cho dữ categorical** — phải dùng chi-square/proportion test.
5. **Nhầm p-value = xác suất $H_0$ đúng** — p ≠ P(H0|data).

**Checklist thiết kế 1 kiểm định/test (buổi trước khi chạy):**

- [ ] $H_0/H_1$ viết bằng 1 câu nghiệp vụ; metric primary duy nhất.
- [ ] Cỡ mẫu từ power analysis; thời gian test ≥ 1 chu kỳ hành vi mua (thường ≥2 tuần).
- [ ] α, phương pháp (z/t/chi-square), plan correction nếu nhiều biến thể.
- [ ] Effect size & CI sẽ báo cáo thế nào.
- [ ] Điều kiện dừng sớm (sequential test nếu có) — tránh peek sai.
- [ ] Ai ra quyết định với kết quả, ngưỡng effect size kinh doanh tối thiểu.

#### Ứng dụng thực tế

Áp dụng Bayes/base rate cho credit scoring: tỷ lệ nợ xấu 4%; mô hình ghi nợ 85% bad (TPR), FPR 8%. Trong 10.000 hồ sơ: bad thực = 400 (đúng 340), good = 9.600 (bị gọi nhầm 768). Precision = 340/(340+768) ≈ 31% — "mô hình 85%" hóa ra 2/3 hồ sơ bị gắn nhãn sai. Hành động: nâng ngưỡng điểm, dùng 2-stage (mô hình + thẩm định thủ công nhóm biên), tối ưu theo chi phí FP/FN thay vì accuracy tổng.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** p-value = 0.03 nghĩa là gì, không nghĩa là gì?
**Gợi ý trả lời:** Nghĩa là: nếu $H_0$ đúng, xác suất dữ extrem đến mức này ≈ 3% — đủ hiếm để nghi ngờ $H_0$ ở ngưỡng α=0.05. Không nghĩa là: $H_0$ có 97% xác suất sai; không nghĩa là effect quan trọng về kinh doanh; không chứng minh nhân quả. Luôn kèm effect size, CI, và kiểm tra design có confound không.

**Câu 2:** Tính cỡ mẫu tối thiểu cho test nâng conversion 4%→4,8% (α=0.05, power 0.8).
**Gợi ý trả lời:** $n ≈ 16 s^2/\delta^2$ với $s≈0.196$, $\delta=0.008$ → $n ≈ 10.000$/nhóm. Nếu không đủ traffic: kéo dài thời gian, tăng effect (thay đổi mạnh hơn), hoặc chấp nhận power thấp hơn với rủi ro rõ.

**Câu 3:** Vì sao cần pre-register experiment?
**Gợi ý trả lời:** Chốt metric, hypotheses, phân tích plan trước khi xem data — chống p-hacking và researcher degrees of freedom; tăng độ tin cậy nội bộ và bên ngoài; với team: buộc suy nghĩ về effect size kinh doanh trước, tránh "test rồi tính". Bonus: pre-registration giúp reviewer/team tin kết quả hơn.

---

## Bài 4: Hồi quy tuyến tính & đa biến

### Phần A — Cơ bản

**Mô hình hồi quy tuyến tính đơn (simple linear regression):**

$$\hat{y} = b_0 + b_1 x$$

Ước lượng bình phương nhỏ nhất (OLS): $b_1 = \frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}$; $b_0 = \bar y - b_1 \bar x$.

**Ví dụ tính:** 6 tháng chi phí quảng cáo (triệu) x và doanh thu y:
x = 10, 20, 30, 40, 50, 60; y = 50, 60, 70, 80, 95, 110.
$\bar x = 35$, $\bar y = 77.5$. $S_{xy} = (−25)(−27.5)+(−15)(−17.5)+(−5)(−7.5)+(5)(2.5)+(15)(17.5)+(25)(32.5) = 687.5+262.5+37.5+12.5+262.5+812.5 = 2075$; $S_{xx} = 625+225+25+25+225+625 = 1750$.
$b_1 = 2075/1750 \approx 1.186$; $b_0 = 77.5 - 1.186×35 ≈ 36.0$.
$\hat y = 36.0 + 1.186x$ — mỗi 1 triệu ads → +1,19 triệu doanh thu (ước tính trên mẫu này).

**Đọc kết quả:**

- **$R^2$:** tỷ lệ biến thiên y giải thích bởi x. Ở ví dụ: $R^2 \approx 0.99$ (gần như tuyến tính hoàn hảo — may mắn cho minh họa).
- **p-value của $b_1$:** $H_0: b_1=0$ (x không liên hệ tuyến tính với y).
- **SE của hệ số:** độ không chắc chắn ước lượng.

**Hồi quy đa biến:**

$$\hat{y} = b_0 + b_1x_1 + b_2x_2 + \dots + b_kx_k$$

Mỗi $b_j$: thay đổi y khi $x_j$ tăng 1 đơn vị, **giữ nguyên các x khác** (ceteris paribus). Điều chỉnh đồng thời confounders — đây là lý do đa biến mạnh hơn correlation đơn.

**Ví dụ diễn giải:** $\hat{doanh thu} = 20 + 0.8×ads + 15×promotion - 3×price\_index$.

**Giả định OLS (kiểm tra trước khi tin):**

1. **Tuyến tính** giữa y và x (residual plot).
2. **Độc lập** của errors (đặc biệt chuỗi thời gian — autocorrelation).
3. **Phương sai đồng đều** (homo/heteroscedasticity).
4. **Bình thường của residuals** (histogram/QQ, quan trọng cho CI nhỏ n).
5. **Không đa cộng tuyến** giữa các x (VIF).

### Phần B — Nâng cao

**Đa cộng tuyến (multicollinearity).** Hai biến x tương quan cao → hệ số $b$ không ổn định (đảo dấu, sai số chuẩn phình), khó diễn giải. Chẩn đoán: VIF > 5–10. Sửa: loại bớt biến, tạo biến tổng hợp, PCA (nâng cao), hoặc chấp nhận dùng dự báo không diễn giải.

**Biến giả (dummy variables) & tương tác.** Biến categorical: vùng (Bắc/Trung/Nam) → 2 dummies. Tương tác: $y = b_0 + b_1 ads + b_2 promo + b_3 ads×promo$ — kiểm tra tác động ads có phụ thuộc promo không.

**Overfitting & adjusted $R^2$.** Thêm biến luôn tăng $R^2$ (hoặc không giảm) — kể cả biến nhiễu. Dùng adjusted $R^2$, AIC/BIC, cross-validation, hoặc lựa chọn biến có lý luận nghiệp vụ. Quy tắc thô (không cứng): $n \gtrsim 10\text{–}20 \times k$ biến.

**Hồi quy chuỗi thời gian & stationarity.** Regression trên dữ liệu non-stationary (cùng trend) → spurious regression (R² cao ảo). Kiểm: chênh lệch (diff), ADF test (nâng cao), hoặc dùng lag/lead có nghiệp vụ.

**Regularization (giới thiệu).** Ridge (L2) / Lasso (L1): phạt hệ số lớn; Lasso thực hiện chọn biến tự động — hữu ích k (số biến) lớn, n vừa. Đây là cầu nối sang machine learning.

### Phần C — Thực tế

**Case: marketing mix modeling (MMM) của FMCG.** Regression: $sales_t = b_0 + b_1 TV + b_2 digital + b_3 promo + b_4 price + seasonality + \epsilon$. Kết quả: promo $b$ lớn nhất nhưng collinearity với price (giảm giá kèm đẩy promo) → hai biến nhiễu nhau; xử lý: orthogonalize promo, chạy mô hình với/without promo window; cuối cùng MMM dùng để ước ROI channel cấp chiến dịch (không thay A/B granular). CFO dùng để duyệt ngân sách quý.

**Case generic: dự báo demand hotel — regression + biến mùa.** $\hat y = b_0 + b_1 weekend + b_2 holiday + b_3 avg\_temp + b_4 lag\_occupancy$. $R^2$ out-of-sample 0.72; residuals autocorrelated → thêm AR term (nâng cao) hoặc chấp nhận dùng làm baseline. Bài học: regression là starting point linh hoạt, không phải cuối cùng.

**5 lỗi thường gặp:**

1. **Đọc $b$ đa biến như correlation đơn** — quên "giữ nguyên x khác".
2. **Tin R² in-sample** — không test out-of-sample.
3. **Bỏ qua dummy trap** (k dummy + intercept) và tương tác quan trọng.
4. **Regression spurious** trên 2 trend chung.
5. **Không diễn giải uncertainty** — báo hệ số mà không SE/CI/p.

**Checklist chạy 1 mô hình hồi quy (1 ngày):**

- [ ] Y và các X viết bằng biến nghiệp vụ có định nghĩa (units rõ).
- [ ] Exploratory: scatter matrix, correlation, missing %.
- [ ] Fit baseline 1–2 biến then chốt → thêm biến có lý luận.
- [ ] Kiểm residual: plot, VIF, Durbin–Watson (chuỗi), normal QQ.
- [ ] Đánh giá out-of-sample (holdout 20% hoặc time split).
- [ ] Bảng kết quả: $b$, SE, p, CI + 1 đoạn diễn giải cho non-statistician.

#### Ứng dụng thực tế

Công ty giáo dục dự báo số hồ sơ: y = hồ sơ/tháng; x1 = chi digital, x2 = số ngày còn hạn sớmbird, x3 = điểm đánh giá khóa, x4 = dummy chiến dịch t3/9. Model: $\hat y = 120 + 0.05×ads + 8×sớm + 15×rating + 40×dummy$. Đa biến điều khiển mùa (dummy tháng 9) — correlation đơn giữa ads và hồ sơ inflate vì cả hai cùng spike tháng 8–9. Sau kiểm out-of-sample, RMSE giảm 23% so với MA naive; team dùng model để đặt ngân sách ads theo tuần với ngưỡng diminishing return.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Hệ số $b_1 = 0.8$ trong hồi quy đa biến nghĩa là gì?
**Gợi ý trả lời:** Khi $x_1$ tăng 1 đơn vị, $y$ thay đổi trung bình +0.8 đơn vị, giữ nguyên các biến giải thích khác (ceteris paribus). Điều kiện tin: mô hình đúng dạng, không multicollinearity severe, dữ out-of-sample hỗ trợ. Nó KHÔNG đồng nghĩa: can thiệp tăng $x_1$ chắc chắn tăng $y$ 0.8 (cần thiết kế nhân quả/kiểm soát confound).

**Câu 2:** Phát hiện VIF = 12 cho biến "chi digital" — xử lý?
**Gợi ý trả lời:** Kiểm biến nào tương quan (thường chi total marketing); (1) nếu mục tiêu dự báo: giữ Ridge/Lasso hoặc chấp nhận, đánh giá out-of-sample; (2) mục tiêu diễn giải/ROI: gộp biến, thay bằng ratio có nghiệp vụ, hoặc chạy submodel tách kênh bằng dữ liệu chi tiết hơn; (3) không đưa hai biến gần như cùng thông tin vào rồi tin hệ số riêng lẻ.

**Câu 3:** Vì sao R² = 0.95 không đảm bảo mô hình hữu ích?
**Gợi ý trả lời:** Có thể overfit (in-sample), spurious trend, target leakage, hoặc sai out-of-sample. Kiểm: holdout/time-split performance, baseline so sánh (naive), residual pattern, stability theo thời gian. Hữu ích = dự báo ổn ngoài mẫu + hỗ trợ hành động + nhạy với thay đổi chính sách được monitor.

---

## Bài 5: Phân loại — cây quyết định, hồi quy logistic & đánh giá mô hình

### Phần A — Cơ bản

**Bài toán phân loại (classification).** Dự báo nhãn nhị phân/thực (churn/không; tốt/xấu nợ; spam/không). Khác regression: output = xác suất hoặc nhãn.

**Cây quyết định (Decision Tree).** Chia dữ liệu theo nhánh nếu-then; node lá = nhãn. Ưu: dễ giải thích (business-friendly), xử lý cả biến categorical, không cần scale. Nhược: dễ overfit (cây sâu); sửa: prune (hạn chế độ sâu, số mẫu tối thiểu/node), ensemble (random forest, gradient boosting — nâng cao).

**Ví dụ cây churn:** Root: "tháng cuối login < 2 lần?" Yes → (nhánh) "khiếu nại > 0?" Yes → Churn 85%; No → Churn 40%. No → Churn 8%.

**Hồi quy logistic:**

$$\hat{p} = \frac{1}{1 + e^{-(b_0 + b_1x_1 + \dots)}}$$

$\hat p \in (0,1)$; hệ số $e^{b_j}$ = odds ratio khi $x_j$ tăng 1 (giữ x khác). Chọn nhãn: ngưỡng $\tau$ (0.5 mặc định, nhưng tối ưu theo chi phí FP/FN).

**Ví dụ tính:** $\ln\frac{p}{1-p} = -2 + 0.05×income$. $income=60$ → logit = 1 → $p = 1/(1+e^{-1}) ≈ 0.73$. $income$ +10 → odds nhân $e^{0.5} ≈ 1.65$ (65% odds cao hơn).

**Confusion matrix & chỉ số nền:**

| | Dự báo Positive | Dự báo Negative |
|---|---|---|
| **Thực Positive** | TP | FN |
| **Thực Negative** | FP | TN |

- **Accuracy** = (TP+TN)/total — dối khi imbalance.
- **Precision** = TP/(TP+FP) — tín báo đúng bao nhiêu.
- **Recall (Sensitivity)** = TP/(TP+FN) — tìm được bao nhiêu thực.
- **F1** = 2·Precision·Recall/(P+R).
- **Specificity** = TN/(TN+FP).

**Ví dụ tính:** 1.000 khách, 100 churn thật. Mô hình báo 120 positive, trong đó 60 đúng churn (TP=60, FP=60); FN=40; TN=840.
Accuracy = 900/1000 = 90% (nhìn ổn — nhưng "báo không ai churn" cũng 90%!). Precision = 60/120 = 50%; Recall = 60/100 = 60%; F1 ≈ 54,5%.

### Phần B — Nâng cao

**ROC curve & AUC.** Vẽ TPR vs. FPR theo ngưỡng; AUC = xác suất mô hình xếp ngẫu nhiên 1 positive cao hơn 1 negative. AUC 0.5 = may rủi; 0.7–0.8 chấp nhận; 0.8+ tốt; 0.9+ nghi overfit/leakage. AUC đứng trước ngưỡng — đánh giá ranking power.

**Imbalanced classes & chi phí sai lệch.** Churn 3%, gian lận 0,5%: accuracy vô nghĩa. Kỹ thuật: class weight, undersample/oversample (cẩn thận leakage), anomaly detection. Ưu tiên thiết kế theo **chi phí**: FN (bỏ lỡ churn) vs. FP (gọi sai khách) → chọn ngưỡng $\tau$ tối ưu hóa $E[cost] = c_{FP}·FP + c_{FN}·FN$.

**Leakage (rò rỉ dữ liệu).** Biến "biết trước kết quả" (vd: `days_since_last_complaint_post_churn`) làm model "ảo thần". Chống: hiểu quy trình sinh dữ liệu, time-based split nghiêm ngặt, feature availability timestamp.

**Calibration.** Mô hình AUC cao nhưng $p=0.8$ không nghĩa 80% đúng thực tế (calibration curve). Với bài toán xếp hạng khách gọi giữ — ranking đủ; với bài toán pricing rủi ro — cần calibrated probabilities (Platt, isotonic).

### Phần C — Thực tế

**Case: ngân hàng TMCP — loan default model.** Logistic + tree ensemble; AUC test 0.78. Đổi metric chính từ accuracy sang **expected loss**: nhóm điểm dưới ngưỡng 20% default → từ chối/đặt cọc cao. Pilot 3 tháng: tỷ lệ nợ xấu nhóm cho vay mới giảm 1,3 điểm %; FP chấp nhận (từ chối khách tốt) được ước tính bằng backtest thu hồi. Bài học: chọn ngưỡng theo tiền, không theo 0.5 mặc định.

**Case generic: retail churn tree dễ giải thích.** Thay vì black-box, BI team dựng cây sâu 3, pruned: 4 nhánh chính (login giảm, tần suất đơn, khiếu nại, vùng). GM và store managers hiểu và hành động được; AUC 0.71 < black-box 0.75 nhưng adoption cao → tác động thật lớn hơn. Bài học: **interpretable model thắng khi cần thay đổi hành vi con người**.

**5 lỗi thường gặp:**

1. **Báo accuracy 95% cho bài imbalance 2%** — vô nghĩa; xem precision/recall/AUC.
2. **Chọn ngưỡng 0.5 máy móc** — không theo chi phí FP/FN.
3. **Train-test split sai thời gian** (shuffle dữ thời gian) → tương lai rò vào quá khứ.
4. **Feature leakage** — model quá giỏi không thật.
5. **Không monitor drift** — data đổi sau 6 tháng, model im lặng hỏng.

**Checklist project phân loại (2–3 tuần):**

- [ ] Bài toán: positive class là gì, ai dùng điểm số, hành động theo ngưỡng nào.
- [ ] Chi phí FP/FN ước tính bằng nghiệp vụ (tiền/giờ).
- [ ] Time-based split; baseline đơn (logistic) trước ensemble.
- [ ] Đánh giá: AUC + PR-AUC (imbalance) + confusion matrix ở ngưỡng chọn.
- [ ] Calibration plot nếu dùng xác suất.
- [ ] Plan monitor: PSI/feature drift quarterly, retrain trigger.

#### Ứng dụng thực tế

Ứng dụng cây quyết định cho hỗ trợ khách hàng: phân loại ticket "cần escalate kỹ thuật cao" hay không. Features: số lần reply, thời gian phản hồi trung bình, sentiment thô, SKU liên quan. Tree pruned 4 tầng: precision 78%, recall 71% ở nhóm escalate — telesales dùng checklist 5 câu theo node thay vì đoán. Thời gian xử lý ticket sai tệp giảm 40%, SLA kỹ thuật cao được bảo vệ — interpretable model trực tiếp train hành vi CS team.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Confusion matrix: TP=50, FP=10, FN=20, TN=420 — tính precision, recall, accuracy.
**Gợi ý trả lời:** Precision = 50/60 ≈ 83.3%; Recall = 50/70 ≈ 71.4%; Accuracy = 470/500 = 94%. Tôi báo thêm: vì positive chỉ 14% mẫu, accuracy so với baseline "tất cả negative" (86%) không quá ấn tượng — precision/recall và ma trận thật sự quan trọng hơn.

**Câu 2:** Khi nào chọn cây quyết định thay black-box?
**Gợi ý trả lời:** Khi mô hình phải giải thích cho người ra quyết định/điều chỉnh hành vi (CS, thẩm định, bác sĩ), khi cần quy tắc đưa vào SOP, hoặc dữ nhỏ/không cân bằng nhẹ. Khi chỉ cần điểm xếp hạng tối ưu hóa và có pipeline monitor, ensemble/ML mạnh hơn. Giải pháp phổ biến: song song — cây cho adoption, black-box cho benchmark; hoặc dùng SHAP giải thích black-box nếu tổ chức mature.

**Câu 3:** Chọn ngưỡng phân loại thế nào?
**Gợi ý trả lời:** Từ chi phí: $\tau$ tối ưu khi $p^* = \frac{c_{FP}}{c_{FP}+c_{FN}}$. VD: bỏ lỡ churner tốn 500k, gọi sai tốn 50k → $\tau^* = 50/550 ≈ 9\%$ — call center nên gọi nhóm >9% risk, không đợi 50%. Test trên lịch sử/pilot và monitor precision@k theo tuần.

---

## Bài 6: Tương quan, nhân quả & A/B testing

### Phần A — Cơ bản

**Tương quan (correlation) ≠ nhân quả (causation).** Pearson:

$$r = \frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum(x_i-\bar x)^2\sum(y_i-\bar y)^2}} \in [-1, 1]$$

$r$ cao không nói hướng nhân quả; có thể: x→y, y→x, confounder z→cả hai, hoặc may mắn.

**3 lý thuyết dựng nhân quả (criteria cổ điển — không phải điều kiện đủ, nhưng gợi ý):**

1. **Temporal precedence:** nguyên nhân trước kết quả.
2. **Tương quan** đủ mạnh, ổn định.
3. **Không có lời giải thích thay thế** (confounding) hợp lý — kiểm soát bằng thiết kế/điều chỉnh.

**Các mối quan hệ giả (spurious):** ice cream ↑ & đuối nước ↑ (mùa nóng confound); sneakers & doanh số công ty (lợi nhuận cho phép mua). Phòng: randomization, matching, điều khiển biến confound trong regression, natural experiments.

**A/B testing (randomized controlled trial cho web/app/marketing):**

- Chia **ngẫu nhiên** đối tượng sang A (control) và B (variant) — mọi confound cân bằng kỳ vọng.
- Chỉ khác 1 biến (hoặc vài biến có kế hoạch).
- Đủ sample (power), đủ thời gian (≥1 hành vi mua đầy đủ, thường 2 tuần+).
- Metric primary pre-registered; secondary exploratory.

**Thiết kế đúng A/B (checklist):**

1. Hypothesis có cơ sở: "B (nút xanh, chữ 'Đặt hàng ngay') tăng checkout conversion vì giảm nhận thức chi phí".
2. Unit randomization: user-level (không trộn session lẫn lộn), bucket stable (hash user id).
3. SRM check: tỷ lệ traffic lệch >1% → dừng, tìm bug split.
4. Analysis: proportion test / t-test theo metric; CI + p + effect size %.
5. Guardrail metrics: không hi sinh margin/latency.

**Ví dụ tính uplift:** A: 4.500/50.000 = 9.0%; B: 4.950/50.000 = 9.9%. Uplift tương đối = 10%. Test z cho 2 prop: se = $\sqrt{p(1-p)(1/n_1+1/n_2)}$ với pooled p=0.00945... ≈ 0.0018×... (tính đầy đủ: z≈3.5 → significant; CI uplift khoảng [4%, 16%] relative).

### Phần B — Nâng cao

**Peeking & sequential testing.** Xem p-value mỗi ngày rồi dừng khi p<0.05 = inflating lỗi loại I (vượt α thật sự). Cách: chốt thời gian test trước; hoặc dùng sequential methods (mSPRT), group-sequential với alpha spending.

**Multiple variants & interactions.** A/B/n test: Bonferroni/Benjamini-Hochberg correction; kiểm interactions (vd B khác effect trên mobile vs. desktop — cần sample subgroup).

**Experiment ở nền tảng & network effects.** Khi user ảnh hưởng user (mạng xã hội, marketplace hai mặt): unit randomization cluster (thành phố, nhóm) để tránh contamination; tính intracluster correlation khi ước sample — inflate n (design effect = $1+(m-1)\rho$).

**Quasi-experimental methods (khi không random được):** difference-in-differences (so trước-sau nhóm treatment vs. control), regression discontinuity, matching (propensity score). Hữu ích chính sách công/tax/cửa hàng khu vực — nhưng yếu hơn RCT.

**Experiment culture.** Amazon/Booking/Netflix: test hàng nghìn, nhưng lạm dụng → "tunnel vision" (tối ưu local, mất big picture); cần north-star metrics + nghiên cứu định tính song song.

### Phần C — Thực tế

**Case: Grab/Be platform — experiment khu vực.** Thay đổi thuật toán xếp tài xế: A/B city-level (một thành phố pilot, thành phố đối chứng tương đồng) — vì network effects intra-city mạnh. Design: difference-in-differences giữa cặp thành phố + A/B user-level cho UI thuần. Bài học: chọn unit randomization đúng cấp — sai cấp = contamination.

**Case generic: chuỗi gym đọc "khách tập buổi sáng khỏe hơn".** Observation: người tập sáng retention cao 30%. Confound: người có kỷ luật/lịch làm việc ổn định vừa tập sáng vừa kiên trì. Không thể random "ép" sáng toàn bộ; hybrid: offer slot sáng miễn phí 2 tuần cho nhóm ngẫu nhiên (encouragement design) — ITT effect nhỏ (5–7%) nhưng ATE trên compliers ước tính bằng IV — phân biệt correlation ảo và tác động thật.

**5 lỗi thường gặp:**

1. **Kết luận nhân quả từ dashboard correlation** ("tăng ads → tăng sale" khi cả hai theo mùa).
2. **Peek + stop sớm** khi p lọt 0.05 ngày thứ 3.
3. **Test 2 biến cùng lúc rồi không biết cái nào thắng.**
4. **Sample < power** rồi kết luận "không khác biệt = giữ nguyên" (confusion null với equivalence).
5. **A/B thắng nhỏ nhưng rollback sau vì guardrail** (chậm hơn, margin giảm) — thiếu guardrail metrics.

**Checklist chạy experiment văn minh (1 quý):**

- [ ] Experiment registry: ai, giả định, metric, n, ngày bắt đầu/kết thúc.
- [ ] Power calculator trước khi launch; n ngưỡng dừng.
- [ ] SRM + novelty checks sau khi launch.
- [ ] Report: effect size + CI + p + segments pre-specified.
- [ ] Rollout plan + monitor 4 tuần sau (carryover effects).
- [ ] Learning log: giữ/pivot — chia sẻ công ty, tránh test lại cái đã fail.

#### Ứng dụng thực tế

Thử nghiệm giá gói tháng cho SaaS B2B: A = 490k, B = 590k kèm onboarding. Uplift revenue/user 12% (p=0.02), nhưng guardrail: churn tháng 2 tăng 1,5 điểm % (not significant, CI rộng). Quyết định: roll B cho nhóm SMB, giữ A cho enterprise (segment analysis pre-specified); monitor 60 ngày churn — nếu drift vượt ngưỡng, rollback. Experiment thắng về doanh thu nhưng quản trị rủi ro cohort — "chiến thắng có điều kiện".

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Thiết kế A/B test cho nút mua hàng — bạn chọn gì làm metric primary?
**Gợi ý trả lời:** Checkout conversion trên user đủ điều kiện thấy variant (không phải sessions — tránh user nhiều session skew); secondary: revenue/user, margin/user, time-to-purchase. Guardrail: latency, refund rate, CS complaint. Ngưỡng dừng & n tính từ baseline conversion và MDE kinh doanh (VD: +3% relative); preregister tất cả trước khi split.

**Câu 2:** Correlation giữa chương trình training và tăng năng suất — đủ để thưởng training?
**Gợi ý trả lời:** Chưa — confound: người chủ động học giỏi sẵn; selection bias tham gia. Cách nâng bằng chứng: random encouragement (mời ngẫu nhiên nhóm), encouragement design + IV; hoặc DiD giữa vùng pilot/control. Thưởng khi còn correlation-only có thể tạo gaming "vào cho đủ" thay vì cải thiện.

**Câu 3:** A/B thắng +8% nhưng p=0.06 — roll out không?
**Gợi ý trả lời:** Không vội "win". p=0.06 với CI [-0.5%, 16%] chứa cả ~0 lẫn effect lớn — dữ không đủ chắc. Lựa chọn: (1) kéo dài test đến n pre-specified; (2) nếu risk cost rollout thấp và downside guardrail xanh — staged rollout 10% + monitor; (3) không tuyên bố thắng internal. Quyết định theo giá trị kỳ vọng: $EV = P(win)×gain - P(lose)×cost$.

---

## Bài 7: Dashboard & storytelling with data

### Phần A — Cơ bản

**Dashboard là công cụ quyết định, không phải album chart.** Mục tiêu: (1) trả lời câu hỏi trong <10 giây; (2) cảnh báo hành động; (3) chia sẻ trách nhiệm metric. Thiết kế theo người dùng: CEO 1 trang tổng; ops room screen real-time; analyst drill-down.

**Nguyên tắc thiết kế (Few/Munzner rút gọn):**

1. **Mục tiêu trước chart:** 1 dashboard = ≤5–7 câu hỏi.
2. **Đúng chart type** (Bài 2): line trend, bar so sánh, scatter relation.
3. **Hierarchy thị giác:** KPI lớn trên, drill detail dưới; màu highlight outlier.
4. **Context:** target/threshold, so sánh kỳ, sparkline history.
5. **Đậm/simplified:** cắt grid thừa, 0-baseline cho bar, decimal hợp lý.
6. **Interactivity đúng mức:** filter region/date; không filter vô tận làm mù.

**Cấu trúc "1 trang dashboard vận hành" mẫu:**

- Row 1: 4–5 KPI card (value, Δ vs. kỳ, sparkline).
- Row 2: trend chính (line) + alert list (màu đỏ theo ngưỡng).
- Row 3: phân tích theo dimension (bar/top-N table).
- Footer: data freshness timestamp + owner.

**Data storytelling — 3 lớp:** (1) **Visual** (chart đúng, sạch); (2) **Narrative** (câu chuyện: bối cảnh → xung đột → resolution); (3) **Audience** (biến technical finding thành decision/implication cho người nghe). Công thức slide hành động: Observation → Implication → Recommendation → Ask (cần gì: tiền/quyết định/duyệt).

### Phần B — Nâng cao

**Cognitive load & preattentive attributes.** Não xử lý màu/vị trí/size trước có ý thức — dùng màu đỏ cho exception, đặt insight quan trọng góc trên trái (F-pattern đọc). Tránh dual-axis gây lừa; nếu dùng, giải thích rõ.

**Metric trees & north star.** Bắc đẩu (north star) metric: 1 chỉ số thể hiện giá trị khách hàng (VD: weekly active teams trả tiền); tree rẽ sang input metrics (signup, activation, retention, expansion). Dashboard leadership = north star + input health + guardrail. Giữ metric không đổi ≥2 quý để tránh "dashboard churn" làm mù văn hóa dữ liệu.

**Real-time vs. batch & trust.** Real-time dashboard sai schema/build trust = poison. Mỗi dashboard cần: data lineage, freshness SLA, "last refresh", reconciliation với hệ thống sổ cái 1 lần/tháng. Trust mất 1 lần = dashboard chết.

**Governance: semantic layer.** Định nghĩa metric tập trung (single source of truth): `revenue_net = gross - discount - refund` một bản duy nhất, mọi BI tool dùng chung. Thiếu semantic layer → "excel dashboard" mọc như nấm, 3 số doanh thu — khủng hoảng niềm tin phân tích.

### Phần C — Thực tế

**Case: dashboard logistics “đẹp – chết”.** 50 charts, 8 tab, team analyst dành 3 tháng. 6 tháng sau: logins/tuần = 12 (chỉ 2 người phân tích). Chẩn đoán: không ai biết chart nào trả lời quyết định nào; 30 phút để tìm số. Pivot: phỏng vấn 8 người ra quyết định → 1 trang 6 charts + alert; kill 45 charts. Adoption 80% trong 1 tháng; 2 cảnh báo đầu tiên phát hiện trễ giao hàng vùng — dashboard "sống".

**Case generic: storytelling cho HĐQT.** Thay vì 25 slide regression, presenter mở: "Quý này mất 4 tỷ margin từ 2 lý do: (1) promo không nhắm — 60% budget vào nhóm biên 0%; (2) tồn kho lỗi A tăng 30% sau đổi nhà cung. [Chart 1: waterfall margin]. Chúng tôi cần: cắt promo nhóm C, audit nhà cung trong 30 ngày [Ask]. Dữ liệu chi tiết ở phụ lục." — 3 phút, 2 quyết định. Science + story + ask.

**5 lỗi thường gặp:**

1. **Dashboard theo dữ liệu có sẵn**, không theo quyết định cần.
2. **40 KPI** → không ai nhìn; không ngưỡng → không cảnh báo.
3. **Chart lừa** (trục cắt, dual-axis, 3D pie).
4. **Không ai sở hữu** dashboard — data chết khi analyst nghỉ.
5. **Storytelling = trang trí** không có recommendation/ask.

**Checklist ra mắt dashboard (1 sprint):**

- [ ] 3–5 người dùng chính phỏng vấn: quyết định tuần này họ cần là gì?
- [ ] Draft 6–7 chart max; cold test 60 giây.
- [ ] Ngưỡng cảnh báo màu đỏ/gold cho mỗi KPI then chốt.
- [ ] Data owner + refresh SLA + last-refresh hiển thị.
- [ ] Training 30 phút + “office hour” tuần đầu.
- [ ] Sau 30 ngày: usage log + cắt ít dùng, thêm theo yêu cầu hành động.

#### Ứng dụng thực tế

Xây dashboard S&OP 1 trang cho ban điều hành: north star = OTIF; inputs = forecast accuracy (WAPE), inventory DOS, capacity util; guardrails = cash, complaint. Mỗi thứ hai 15 phút standup trước dashboard: quyết định 1–2 hành động (VD: “WAPE cluster B < 80% → họp demand review B hôm nay”). Sau quý: 40% meeting phân tích cũ bỏ, thời gian ra quyết định tồn kho giảm một nửa — dashboard sống vì có ritual.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Bạn thiết kế dashboard cho CEO có 3 phút mỗi sáng?
**Gợi ý trả lời:** 4–6 KPI north-star + delta vs. kỳ/ngưỡng; 1 trend 30 ngày; top 3 alert (chỉ exception, không list thường); data freshness. Không drill-down cho CEO — link sang dashboard ops cho team. Cold-test với trợ lý CEO trước khi launch; hỏi lại sau 2 tuần: “3 phút đó anh quyết được gì?” và sửa.

**Câu 2:** Phân biệt visualization và storytelling.
**Gợi ý trả lời:** Visualization = truyền thông chính xác bằng chart (đúng loại, không lừa trục). Storytelling = cấu trúc thông điệp cho người nghe ra quyết định: bối cảnh, xung đột (số liệu), implication, recommendation, ask. Chart đẹp mà không có ask = trình bày; story không có chart đúng = hùng biện.

**Câu 3:** Làm sao mọi người tin dashboard?
**Gợi ý trả lời:** (1) Semantic layer — 1 định nghĩa metric; (2) đối chiếu định kỳ với sổ cái/report tài chính; (3) minh bạch lineage + last refresh; (4) owner chịu trách nhiệm sửa data incident công khai; (5) bắt đầu scope nhỏ, đúng trước khi rộng. Niềm tin xây bằng consistency vài tháng, mất bằng 1 lần “sai số lớn” không giải thích.

---

## Bài 8: Đạo đức dữ liệu, quyền riêng tư & AI có trách nhiệm

### Phần A — Cơ bản

**Vì sao đạo đức dữ liệu là môn bắt buộc.** Phân tích tạo quyền lực: chọn ai được vay, giá ai thấy, ai bị coi là rủi ro. Lạm dụng: discrimination, surveillance, thao túng dark pattern, rò rỉ dữ liệu. Hậu quả: phạt pháp lý (GDPR, Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân VN), mất niềm tin, damage brand không đo được.

**Nguyên tắc nền (UNESCO/OECD rút gọn):**

1. **Hợp pháp & minh bạch (lawful & transparent):** cơ sở xử lý dữ liệu cá nhân rõ ràng.
2. **Mục đích hạn chế (purpose limitation):** thu cho mục đích khai báo, không dùng tràn lan.
3. **Dữ liệu tối thiểu (data minimization).**
4. **Độ chính xác (accuracy).**
5. **Giới hạn lưu trữ (storage limitation).**
6. **Toàn vẹn & bảo mật (integrity & confidentiality).**
7. **Trách nhiệm giải trình (accountability).**

**Khung VN & quốc tế cần biết:** GDPR (EU) — quyền được quên, DPIA, phạt mạnh; Nghị định 13/NĐ-CP (VN) — dữ liệu cá nhân, đồng ý, đánh giá tác động; chuẩn ngành: PCI DSS (thanh toán), HIPAA (y tế US). Doanh nghiệp Việt xử lý dữ liệu khách + nhân sự → cần: kho dữ liệu cá nhân, phân loại dữ liệu nhạy cảm, quy trình xóa/đồng ý, hợp đồng với vendor.

**Thuật toán bias.** Thiên kiến vào dữ liệu/hình thức: mô hình credit scoring phân biệt vùng/group thu nhập thấp (proxy discrimination); screening CV học bias lịch sử; facial recognition sai nhóm thiểu số. Bài học: **dữ liệu quá khứ = in sách lịch sử có lỗi** — mô hình học theo và khuếch đại.

### Phần B — Nâng cao**

**Fairness — nhiều định nghĩa xung đột.** Equalized odds, demographic parity, calibration theo nhóm... tối ưu 1 tiêu chí fairness thường đánh đổi tiêu chí khác + accuracy. Thực hành: (1) chọn fairness metric hợp bối cảnh pháp lý/nghiệp vụ; (2) đo subgroup performance; (3) documentation model card.

**Responsible AI lifecycle.** (1) Define harm scenarios; (2) data audit & consent; (3) bias testing theo nhóm; (4) human-in-the-loop cho quyết định cao rủi ro (từ chối vay, y tế, nhân sự); (5) monitoring sau triển khai; (6) incident response & redress (kênh khiếu nại khi thuật toán sai). Model card + datasheet: mô tả mục giới hạn, dữ liệu, metric.

**Privacy-enhancing tech (giới thiệu).** Kỹ thuật giảm rủi ro khi dùng dữ liệu: pseudonymization, aggregation, differential privacy (thêm nhiễu có kiểm soát), federated learning (học phân tán không gộp dữ liệu thô). Phân tích doanh nghiệp đủ dùng aggregation + access control + minimization trước khi nghĩ tới fancy crypto.

**AI tạo sinh (GenAI) trong doanh nghiệp — rủi ro vận hành.** Hallucination (sai tự tin), rò dữ liệu nhạy cảm vào prompt công cộng, copyright data, over-reliance. Kiểm soát: use-case allowlist, DLP, human review đầu ra quan trọng, training nhân viên, log/audit.

### Phần C — Thực tế

**Case: Fintech app “cá nhân hóa giá quá tốt”.** Personalization dùng hành vi duyệt web + thiết bị → nhóm có dấu hiệu khẩn cấp tài chính thấy lãi suất cao hơn (price discrimination theo distress). Doanh thu short-term tăng; scandal + cơ quan quản lý vào cuộc + churn trust. Bài học: metric tối ưu hóa revenue không có guardrail đạo đức = self-destruction; thêm fairness & ethical review cho mọi mô hình pricing/chấm điểm.

**Case generic: HR analytics tuyển dụng.** Mô hình screen CV trained trên lịch sử tuyển (90% nam kỹ sư) → nữ applicant điểm thấp (bias proxy: tên, câu lạc bộ). Sửa: (1) anonymize name/gender trong screening đầu; (2) audit selection rate theo nhóm; (3) human review nhóm biên; (4) retrain với labels "hiệu suất 12 tháng" thay "được tuyển". Vòng đời responsible AI cấp HR.

**5 lỗi thường gặp:**

1. **Thu thập data “để đã”** không mục đích/retention plan — rủi ro pháp lý thuần.
2. **Dùng dữ cá nhân ngoài mục đích đồng ý** (mua data, trộn nguồn).
3. **Tối ưu single metric** không fairness/guardrail (pricing, credit, hiring).
4. **AI tool cá nhân** xử lý dữ liệu khách/công ty (prompt ChatGPT public) — rò rỉ im lặng.
5. **Không có incident plan:** khi data leak/bias scandal, im lặng vài tuần → khủng hoảng niềm tin.

**Checklist responsible analytics (áp mọi dự án nhạy cảm):**

- [ ] Dữ liệu này có cá nhân/nhạy cảm không? Cơ sở xử lý?
- [ ] Consent/purpose match? Minimization: field nào bỏ được?
- [ ] Subgroup audit: mô hình/campaign khác nhau thế nào giữa các nhóm?
- [ ] Human-in-the-loop & appeal channel cho quyết định tác động con người.
- [ ] Documentation: model card 1 trang (dữ liệu, giới hạn, metric).
- [ ] Retention & deletion schedule; access log.
- [ ] GenAI: use-case allowlist, cấm data nhạy vào prompt public.

#### Ứng dụng thực tế

Áp dụng privacy-by-design cho app loyalty chuỗi bán lẻ: chỉ thu số điện thoại + giao dịch (bỏ data hành vi app không cần); consent tách rõ: (a) tích điểm, (b) nhận promo SMS, (c) personalization; retention: chi tiết giao dịch 24 tháng, pseudonymize cho phân tích; dashboard cá nhân hóa dùng data aggregated + user-controlled toggle. Kết quả: complaint giảm, conversion SMS có consent cao hơn broadcast (trust), audit pháp lý 0 finding — đạo đức và hiệu quả cùng tăng.

#### Câu hỏi phỏng vấn xin việc

**Câu 1:** Bạn xử lý thế nào khi sếp yêu cầu “phân tích data hành vi khách hàng chi tiết hơn” nhưng vượt mục đích đồng ý ban đầu?
**Gợi ý trả lời:** Không từ chối suông cũng không tuânblind: (1) làm rõ business question; (2) kiểm consent/purpose hiện có — có lawful basis khác (legitimate interest kèm đánh giá cân bằng không?); (3) đề xuất phương án compliant: anonymize/aggregate, hoặc cập nhật consent flow cho người dùng; (4) involve legal/DPO. Bảo vệ khách + công ty là professional duty, không phải trở ngại "lề trái".

**Câu 2:** Mô hình chấm điểm cho thấy accuracy cao hơn ở nhóm nam — xử lý?
**Gợi ý trả lời:** (1) Audit: subgroup metrics (accuracy, FPR/FNR theo nhóm), kiểm proxy variables (tên, trường, địa chỉ); (2) chọn fairness criteria hợp bối cảnh; (3) xử lý: loại proxy, reweighting data, threshold theo nhóm (cẩn thận pháp lý), human review biên; (4) monitor sau khi sửa. Không giả vờ "mô hình neutral" — mô hình phản chiếu dữ liệu/hệ thống ban đầu.

**Câu 3:** Nhân viên dùng ChatGPT dán nội dung hợp đồng khách vào prompt — rủi ro và quy tắc?
**Gợi ý trả lời:** Rủi ro: rò bí mật thương mại/dữ cá nhân ra bên thứ ba, mất kiểm soát retention/quyền sử dụng data của vendor, đầu ra sai tự tin vào quyết định. Quy tắc: allowlist use-cases (viết tóm tắt đã xóa dữ liệu nhạy), tool enterprise có DLP + zero-retention contract, cấm dán PII/hợp đồng raw, log & audit, training nhận diện dữ liệu nhạy.

---

## Tóm tắt nhanh

| Bài | Khung chính | Công thức/mô hình | Thông điệp vàng |
|---|---|---|---|
| 1. Tổng quan BA | 4 cấp; CRISP-DM | Mô tả→khai phá→dự báo→prescriptive | Câu hỏi kinh doanh trước công cụ |
| 2. Thống kê mô tả | Mean/median/std; chart | IQR fence; 68–95–99.7 | Mean + median + P90; đừng lừa trục |
| 3. Xác suất & test | $H_0$, p, α, power | $z=(x-\mu)/\sigma$; Bayes base rate | Significant ≠ important |
| 4. Hồi quy | OLS, giả định, VIF | $\hat y=b_0+b_1x$; adjusted $R^2$ | Out-of-sample mới tính |
| 5. Phân loại | Tree, logistic, metrics | Precision/Recall/AUC | Ngưỡng theo chi phí FP/FN |
| 6. Nhân quả & A/B | Confound, RCT, peeking | CI uplift; power n | Pre-register & đủ cỡ mẫu |
| 7. Dashboard | Design, storytelling | North star tree | Dashboard = quyết định, không album |
| 8. Đạo đức & AI | Privacy, bias, GenAI | Fairness metrics | Minimization + human-in-the-loop |

## Danh mục thuật ngữ Anh–Việt

| English | Tiếng Việt |
|---|---|
| Business Analytics (BA) | Phân tích kinh doanh |
| Descriptive / diagnostic / predictive / prescriptive | Mô tả / chẩn đoán / dự báo / chỉ đạo |
| CRISP-DM | Quy trình khai thác dữ liệu chuẩn |
| Data grain / dimensions / metrics | Độ mịn dữ liệu / chiều / chỉ số |
| Mean / median / mode | Trung bình / trung vị / moda |
| Standard deviation | Độ lệch chuẩn |
| Percentile / IQR / outlier | Phân vị / khoảng tứ phân vị / ngoại lai |
| Skewness / kurtosis | Lệch phân phối / độ nhọn |
| Simpson's paradox | Nghịch lý Simpson |
| Cohort analysis | Phân tích đồng đội (cohort) |
| Probability / Bayes' rule | Xác suất / định luật Bayes |
| Base rate | Tỷ lệ nền |
| Hypothesis testing | Kiểm định giả thuyết |
| Null hypothesis / p-value | Giả thuyết không / giá trị p |
| Type I / Type II error | Lỗi loại I / loại II |
| Statistical power | Công suất thống kê |
| Confidence interval (CI) | Khoảng tin cậy |
| Effect size / Cohen's d | Cỡ hiệu ứng |
| Multiple testing / Bonferroni | Kiểm định nhiều lần / hiệu chỉnh |
| Regression / OLS | Hồi quy / bình phương nhỏ nhất |
| R-squared / adjusted R² | Hệ số xác định |
| Multicollinearity / VIF | Đa cộng tuyến |
| Logistic regression | Hồi quy logistic |
| Decision tree | Cây quyết định |
| Confusion matrix | Ma trận nhầm lẫn |
| Precision / recall / F1 | Độ chính xác / độ phủ / F1 |
| ROC / AUC | Đường ROC / diện tích dưới ROC |
| Data leakage | Rò rỉ dữ liệu |
| Class imbalance | Mất cân bằng lớp |
| Threshold | Ngưỡng phân loại |
| Correlation vs. causation | Tương quan so với nhân quả |
| Confounder | Biến nhiễu |
| A/B testing | Thử nghiệm A/B |
| Randomization | Random hóa |
| Peeking / sequential test | Nhòm lén / kiểm định tuần tự |
| Difference-in-differences | Sai khác trong sai khác |
| Dashboard | Bảng điều khiển dữ liệu |
| Data storytelling | Kể chuyện bằng dữ liệu |
| North-star metric | Chỉ số bắc đẩu |
| Semantic layer | Lớp ngữ nghĩa metric |
| Data privacy / GDPR / NĐ 13 | Quyền riêng tư dữ liệu / GDPR / Nghị định 13 |
| Algorithmic bias | Thiên kiến thuật toán |
| Fairness | Công bằng thuật toán |
| Human-in-the-loop | Con người trong vòng lặp |
| Model card | Thẻ mô hình |
| GenAI governance | Quản trị AI tạo sinh |
