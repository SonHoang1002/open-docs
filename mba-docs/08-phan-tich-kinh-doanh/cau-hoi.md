# BỘ CÂU HỌI — PHÂN TÍCH & THỐNG KÊ KINH DOANH

Hướng dẫn: Mỗi bài gồm câu hỏi trắc nghiệm (A–D), câu hỏi tự luận, bài toán tình huống. Ôn theo thứ tự bài; đáp án và giải thích ở cuối file.

---

## Bài 1: Tổng quan phân tích dữ liệu kinh doanh

### Câu hỏi trắc nghiệm

**1.1.** Quỹ đạo "vì sao tỷ lệ hủy đơn tăng trong quý II?" thuộc cấp phân tích nào?
A. Mô tả (Descriptive)
B. Khai phá (Diagnostic)
C. Dự báo (Predictive)
D. Prescriptive

**1.2.** Mô hình dự báo khách hàng nào sẽ rời dịch vụ thuộc cấp nào?
A. Mô tả
B. Khai phá
C. Dự báo
D. Prescriptive

**1.3.** Bước đầu tiên trong quy trình CRISP-DM là:
A. Làm sạch dữ liệu
B. Hiểu bài toán kinh doanh
C. Chọn mô hình machine learning
D. Xây dashboard

**1.4.** Theo thực tế dự án, tỷ lệ thời gian dành cho data preparation thường chiếm:
A. 5–10%
B. 20–30%
C. 60–80%
D. Không đáng kể

**1.5.** "Prescriptive analytics" trả lời câu hỏi:
A. Điều gì đã xảy ra?
B. Vì sao xảy ra?
C. Điều gì sẽ xảy ra?
D. Nên làm gì?

**1.6.** Trong thiết kế bảng dữ liệu, "grain" chỉ có nghĩa là:
A. Loại biểu đồ dùng
B. Độ mịn của một dòng dữ liệu (một dòng đại diện cho gì)
C. Số lượng metric trên dashboard
D. Tần suất cập nhật dữ liệu

**1.7.** Cấp độ trưởng thành phân tích nào có quyết định tự động/real-time?
A. Cấp 1 — spreadsheet cá nhân
B. Cấp 2 — BI tập trung
C. Cấp 3 — dự báo có mô hình
D. Cấp 4 — quyết định tự động

**1.8.** Lỗi nào phổ biến nhất khiến dashboard "không khớp báo cáo tài chính"?
A. Sai màu biểu đồ
B. Sai grain/metric definition giữa các hệ thống
C. Dashboard dùng quá nhiều tab
D. Người dùng không được đào tạo

### Câu hỏi tự luận

**1.9.** Phân biệt 4 cấp độ phân tích (mô tả, khai phá, dự báo, prescriptive) — mỗi cấp 1 ví dụ bài toán bán lẻ cụ thể.

**1.10.** Vì sao dự án phân tích nên bắt đầu từ "quyết định gì cần thay đổi" thay vì "dùng công cụ gì"?

**1.11.** Liệt kê và giải thích 4 rủi ro chính khi mô hình phân tích không có "owner hành động" sau triển khai.

### Bài toán tình huống

**1.12.** Một chuỗi cà phê thấy doanh số app giảm 10% trong tháng 6. Giám đốc muốn ngay một mô hình machine learning dự báo doanh số 6 tháng tới. Bạn — trưởng bộ phận phân tích — phản hồi thế nào? Trình bày theo quy trình CRISP-DM: xác định lại bài toán, đề xuất bước phân tích phù hợp và cách thuyết phục giám đốc.

---

## Bài 2: Thống kê mô tả & trực quan hóa

### Câu hỏi trắc nghiệm

**2.1.** Dữ liệu: 5, 7, 7, 9, 20. Mean, median, mode lần lượt là:
A. 9, 7, 7
B. 9.6, 7, 7
C. 7, 9.6, 20
D. 9.6, 9, 7

**2.2.** Với phân phối lệch phải mạnh, chỉ số nào đáng tin nhất để mô tả "giá trị điển hình"?
A. Mean
B. Median
C. Range
D. Standard deviation

**2.3.** Dữ liệu: 10, 12, 14. Phương sai (s², mẫu) bằng:
A. 2
B. 4
C. 2.77
D. 1.63

**2.4.** Quy tắc 68–95–99.7 áp dụng cho:
A. Mọi phân phối
B. Phân phối chuẩn
C. Phân phối lệch
D. Dữ liệu categorical

**2.5.** Q1 = 12, Q3 = 15. Ngưỡng nhận diện outlier phía trên (1.5 × IQR) là:
A. 16.5
B. 18
C. 19.5
D. 22.5

**2.6.** Chọn biểu đồ phù hợp nhất để so sánh doanh số 12 tháng:
A. Pie chart
B. Line chart
C. Scatter plot
D. Histogram

**2.7.** Trục Y của bar chart bị cắt từ 95 đến 100 → hậu quả:
A. Phóng đại khác biệt giữa các nhóm
B. Thu hẹp khác biệt
C. Không ảnh hưởng
D. Làm dữ liệu chính xác hơn

**2.8.** Xu hướng trong mọi nhóm đều một kiểu nhưng gộp nhóm lại đảo ngược — hiện tượng này gọi là:
A. Outlier
B. Simpson's Paradox
C. Kurtosis
D. Multicollinearity

### Câu hỏi tự luận

**2.9.** Giải thích vì sao báo cáo doanh thu nên trình bày cả mean, median và phân vị cao (P90) — kèm ví dụ.

**2.10.** Nêu 5 nguyên tắc chọn biểu đồ, mỗi nguyên tắc 1 ví dụ minh họa.

**2.11.** Cohort analysis khác gì so với báo cáo tổng thể? Mang lại giá trị gì cho mô hình subscription?

### Bài toán tình huống

**2.12.** Số ngày giao hàng của chuỗi e-commerce: mean 2,1 ngày nhưng P90 = 4,5 ngày, P99 = 8 ngày; histogram lệch phải mạnh. Bộ phận marketing đang dùng mean trong quảng cáo "giao nhanh 2 ngày". Phân tích vấn đề và đề xuất cách sửa báo cáo + KPI vận hành.

---

## Bài 3: Xác suất & kiểm định giả thuyết

### Câu hỏi trắc nghiệm

**3.1.** p-value = 0.03, α = 0.05. Kết luận đúng là:
A. Có 97% xác suất $H_0$ đúng
B. Bác bỏ $H_0$
C. Không đủ bằng chứng bác bỏ $H_0$
D. Mô hình đúng 97%

**3.2.** Lỗi loại I (Type I) là:
A. Không bác bỏ $H_0$ khi $H_0$ sai
B. Bác bỏ $H_0$ khi $H_0$ đúng
C. Sai dự báo nhãn positive
D. Sai dự báo nhãn negative

**3.3.** Tỷ lệ churn nền 5%; mô hình sensitivity 90%, FPR 10%. $P(churn|alert)$ xấp xỉ:
A. 90%
B. 50%
C. 32%
D. 5%

**3.4.** Muốn so sánh conversion giữa 3 biến thể website, kiểm định phù hợp nhất:
A. z-test 2 mẫu
B. T-test paired
C. ANOVA
D. Chi-square independence

**3.5.** Với α = 0.05, two-tailed, ngưỡng z/t để bác bỏ $H_0$ (n lớn) là:
A. ±1.28
B. ±1.64
C. ±1.96
D. ±2.58

**3.6.** Với n = 1.000.000, khác biệt 0.01 điểm % giữa 2 nhóm nhưng p = 0.01 → diễn giải đúng:
A. Hiệu ứng rất quan trọng về kinh doanh
B. Significant nhưng cần kiểm tra effect size — có thể vô nghĩa kinh doanh
C. Mô hình sai
D. Phải tăng α

**3.7.** p-hacking là:
A. Tính toán sai p
B. Chạy nhiều biến/test rồi chọn kết quả significant α = 0.05
C. Dùng sai t-test
D. Báo cáo CI thay p

**3.8.** Công thức approx tính cỡ mẫu mỗi nhóm (α = 0.05, power 0.8) cho 2 nhóm:
A. $n = 16s^2/\delta^2$
B. $n = s^2/\delta^2$
C. $n = 2.8s/\delta$
D. $n = 1.96s^2/\delta^2$

### Câu hỏi tự luận

**3.9.** Phân biệt statistical significance và practical significance — kèm ví dụ nghiệp vụ.

**3.10.** Giải thích base rate trong mô hình cảnh báo gian lận vì sao quyết định niềm tin vào tín hiệu; dẫn công thức Bayes.

**3.11.** Vì sao cần pre-register experiment? Liệt kê 4 lợi ích.

### Bài toán tình huống

**3.12.** Team A/B test nút thanh toán: sau 3 ngày với n = 500/nhóm thấy p = 0.04 nên dừng và rollout. Bạn review. Trình bày: (a) 4 sai lầm trong quy trình; (b) tính n tối thiểu nếu baseline conversion 4%, muốn phát hiện lift 0,8 điểm % (α = 0.05, power 0.8, s ≈ 0.196); (c) đề xuất quy trình test đúng.

---

## Bài 4: Hồi quy tuyến tính & đa biến

### Câu hỏi trắc nghiệm

**4.1.** Mô hình $\hat y = 36 + 1.19x$. Khi x = 50, dự báo y là:
A. 86
B. 95.5
C. 86.5
D. 100

**4.2.** $b_1 = 0.8$ trong hồi quy đa biến có nghĩa:
A. Tương quan Pearson = 0.8
B. x tăng 1 đơn vị → y thay đổi +0.8, giữ nguyên các x khác
C. Mô hình giải thích 80% phương sai
D. 80% dữ nằm trên đường regression

**4.3.** $R^2$ đo lường:
A. Tỷ lệ biến thiên của y được mô hình giải thích
B. Chất lượng dữ liệu
C. Độ significant của $H_0$
D. Số quan sát trong mẫu

**4.4.** VIF = 14 cho một biến → dấu hiệu:
A. Outlier nghiêm trọng
B. Đa cộng tuyến nghiêm trọng
C. Sai phân phối residuals
D. Thiếu dữ liệu

**4.5.** Giả định nào KHÔNG thuộc bộ giả định OLS?
A. Tuyến tính
B. Phương sai đồng đều
C. Không đa cộng tuyến
D. Target phải nhị phân

**4.6.** Thêm biến nhiễu vào mô hình luôn:
A. Giảm $R^2$
B. Không đổi $R^2$
C. Tăng (hoặc không giảm) $R^2$ in-sample
D. Tăng adjusted $R^2$

**4.7.** Regression trên hai chuỗi cùng trend nhưng không liên hệ nhân quả →:
A. R² cao ảo (spurious regression)
B. Luôn có VIF cao
C. p-value luôn > 0.05
D. Không dùng được t-test

**4.8.** Lasso (L1) khác Ridge (L2) chủ yếu ở chỗ:
A. Không có penalty
B. Có thể co hệ số về đúng 0 (tự chọn biến)
C. Không dùng được với dữ lớn
D. Luôn cho R² cao hơn

### Câu hỏi tự luận

**4.9.** Kể 5 giả định OLS, mỗi giả định: cách phát hiện và cách xử lý nếu vi phạm.

**4.10.** Đa cộng tuyến ảnh hưởng thế nào đến diễn giải hệ số? 3 cách xử lý.

**4.11.** Vì sao phải đánh giá mô hình hồi quy trên dữ liệu out-of-sample? Mô tả cách split hợp lý cho dữ liệu thời gian.

### Bài toán tình huống

**4.12.** Mô hình $\hat{doanh thu} = 20 + 0.8×ads + 15×promo - 3×price\_index$ cho kết quả: promo p = 0.06, ads p = 0.01, $R^2$ = 0.93 in-sample nhưng holdout RMSE tệ hơn baseline naive 10%. Giải thích hiện tượng và đề xuất 4 bước sửa.

---

## Bài 5: Phân loại — cây, logistic & đánh giá mô hình

### Câu hỏi trắc nghiệm

**5.1.** Confusion matrix: TP = 50, FP = 10, FN = 20, TN = 420. Precision bằng:
A. 83.3%
B. 71.4%
C. 94%
D. 50%

**5.2.** Dữ liệu churn chỉ 3%. Đánh giá mô hình bằng accuracy = 97% (báo tất cả "không churn") → diễn giải đúng:
A. Mô hình xuất sắc
B. Accuracy ảo — mô hình không học được gì, xem recall/AUC
C. Phải tăng sample
D. Lỗi tính toán

**5.3.** Chi phí bỏ lỡ churner = 500k, gọi sai = 50k. Ngưỡng xác suất tối ưu $\tau^*$ ≈:
A. 0.5
B. 0.09
C. 0.59
D. 0.91

**5.4.** AUC = 0.5 nghĩa là:
A. Mô hình tốt
B. Mô hình không phân biệt tốt hơn may rủi
C. Mô hình overfit
D. Dữ thiếu

**5.5.** Mô hình có feature `days_since_post_churn_complaint` — vấn đề:
A. Multicollinearity
B. Data leakage
C. Class imbalance
D. Heteroscedasticity

**5.6.** Trong bài toán imbalance, metric nào thích hợp hơn accuracy?
A. Accuracy
B. F1 hoặc AUC-PR
C. Mean squared error
D. MAPE

**5.7.** Khi nào ưu tiên cây quyết định pruned thay ensemble black-box?
A. Luôn luôn
B. Khi cần giải thích và tổ chức hành động theo mô hình
C. Khi dữ liệu < 10 dòng
D. Khi không có compute

**5.8.** Perfect calibration nhưng AUC thấp có nghĩa:
A. Xác suất đúng trung bình nhưng ranking yếu
B. Mô hình thần kỳ
C. Lỗi tính AUC
D. Phải đổi ngưỡng

### Câu hỏi tự luận

**5.9.** Tính và diễn giải: TP = 60, FP = 60, FN = 40, TN = 840 (n = 1.000, 100 churn). Đưa accuracy, precision, recall, F1 và nhận xét.

**5.10.** Giải thích selection threshold theo chi phí FP/FN — dẫn công thức $\tau^* = c_{FP}/(c_{FP}+c_{FN})$ và ví dụ.

**5.11.** Kể 3 cách xử lý class imbalance và rủi ro từng cách.

### Bài toán tình huống

**5.12.** Mô hình screen hồ sơ vay đạt AUC 0.92 (in-sample) — cao bất thường. Review của bạn: liệt kê 4 nghi vấn (leakage, split, overfit, drift) và quy trình kiểm chứng trước khi đưa vào sản xuất.

---

## Bài 6: Tương quan, nhân quả & A/B testing

### Câu hỏi trắc nghiệm

**6.1.** "Số cửa hàng kem ↑ và số vụ đuối nước ↑ theo tháng" — lời giải thích đúng nhất:
A. Kem gây đuối nước
B. Confounder: nhiệt độ/mùa hè
C. Lỗi đo lường
D. Multicollinearity

**6.2.** A/B test đúng nghĩa yêu cầu:
A. Chia theo lựa chọn của user
B. Randomization ngẫu nhiên có kiểm soát
C. Chia đều theo giới tính
D. Dùng regression không cần random

**6.3.** Peeking và dừng test khi p vừa < 0.05 dẫn đến:
A. Tăng lỗi loại I thực tế vượt α
B. Giảm lỗi loại I
C. Không ảnh hưởng
D. Tăng power

**6.4.** Unit randomization ở cấp user phù hợp khi:
A. Có network effects mạnh giữa user
B. Mỗi user độc lập với user khác
C. Dữ liệu categorical
D. Sample < 100

**6.5.** Design effect = $1 + (m-1)\rho$ > 1 xuất hiện khi:
A. Randomization cá nhân
B. Cluster randomization có correlation nội cụm
C. Dữ imbalance
D. Test nhiều biến thể

**6.6.** Difference-in-differences cần:
A. 2 nhóm × trước/sau, giả định parallel trends
B. Chỉ 1 nhóm sau
C. Randomization bắt buộc
D. Dữ nhị phân

**6.7.** "Không significant ≠ không khác biệt" vì:
A. Power thấp → CI rộng chứa cả khác biệt lớn
B. p luôn sai
C. Phải tăng α
D. ANOVA tốt hơn

**6.8.** Guardrail metric trong experiment dùng để:
A. Thay metric primary
B. Đảm bảo không hi sinh chỉ số quan trọng khác (latency, margin...)
C. Tăng p-value
D. Tăng sample

### Câu hỏi tự luận

**6.9.** Phân biệt correlation và causation; nêu 3 cơ chế tạo tương quan giả.

**6.10.** Mô tả 5 bước thiết kế một A/B test đúng, từ hypothesis đến phân tích.

**6.11.** Khi không random được (thuế, chính sách khu vực), dẫn 3 phương pháp quasi-experimental và giả định của chúng.

### Bài toán tình huống

**6.12.** App thương mại: tuần 1 n = 2.000, p = 0.04 team ăn mừng; thực ra tháng đó đã chạy 12 biến thể; sau chạy lại với n pre-registered = 40.000, p = 0.4. Trình bày: (a) các sai lầm thống kê; (b) cách sửa (correction, pre-registration, power); (c) bài học văn hóa experiment cho công ty.

---

## Bài 7: Dashboard & storytelling with data

### Câu hỏi trắc nghiệm

**7.1.** Nguyên tắc thiết kế dashboard phù hợp nhất:
A. Càng nhiều chart càng tốt
B. Mỗi dashboard trả lời ≤5–7 câu hỏi quyết định
C. Mọi KPI màu đỏ để chú ý
D. Drill-down tối đa cho CEO

**7.2.** Row 1 của dashboard vận hành nên là:
A. Chi tiết từng giao dịch
B. 4–5 KPI card với delta và sparkline
C. Ma trận correlation
D. Bảng raw data

**7.3.** North-star metric là:
A. Chỉ số duy nhất thể hiện giá trị khách hàng cốt lõi
B. Metric nhiều nhất
C. Metric dễ tính nhất
D. Revenue luôn luôn

**7.4.** "Last refresh" hiển thị trên dashboard phục vụ:
A. Trang trí
B. Minh bạch freshness — xây niềm tin dữ liệu
C. Tăng tốc hệ thống
D. Legal requirement mọi trường hợp

**7.5.** Cấu trúc Observation → Implication → Recommendation → Ask thuộc lớp nào của storytelling?
A. Visual
B. Narrative
C. Audience
D. Chart type

**7.6.** Dual-axis chart rủi ro vì:
A. Chậm render
B. Không hiển thị trên mobile
C. Tạo ảo giác tương quan giữa 2 thang đo
D. Tốn bộ nhớ

**7.7.** Semantic layer giúp:
A. Tự động vẽ chart
B. 1 định nghĩa metric duy nhất dùng chung mọi công cụ BI
C. Tăng tốc SQL
D. Dự báo tương lai

**7.8.** Dashboard có 40 KPI, sau 6 tháng 12 login/tuần → chẩn đoán đúng nhất:
A. Thiếu màu sắc
B. Không gắn với quyết định; quá nhiều tín hiệu
C. Sai cơ sở dữ liệu
D. User kém computer

### Câu hỏi tự luận

**7.9.** Trình bày cấu trúc "1 trang dashboard vận hành" mẫu — từng row chức năng gì.

**7.10.** Phân biệt visualization và data storytelling; mỗi lớp 1 ví dụ.

**7.11.** Liệt kê 4 cách xây niềm tin vào dashboard của tổ chức.

### Bài toán tình huống

**7.12.** Dashboard logistics 50 charts, 8 tab, 3 tháng xây, không ai dùng. Thiết kế lại theo quy trình: phỏng vấn người dùng → thu hẹp → ritual vận hành. KPI đo thành công sau 30 ngày là gì?

---

## Bài 8: Đạo đức dữ liệu, quyền riêng tư & AI có trách nhiệm

### Câu hỏi trắc nghiệm

**8.1.** Nguyên tắc "data minimization" nghĩa là:
A. Lưu dữ liệu lâu nhất có thể
B. Chỉ thu dữ liệu cần cho mục đích khai báo
C. Thu tất cả rồi lọc sau
D. Xóa dữ liệu định kỳ không phân loại

**8.2.** Nghị định 13/2023/NĐ-CP liên quan đến:
A. Thuế doanh nghiệp
B. Bảo vệ dữ liệu cá nhân tại Việt Nam
C. Chuẩn ISO 9001
D. Lương tối thiểu

**8.3.** Mô hình credit scoring dùng "mã vùng" làm proxy → rủi ro:
A. Overfitting
B. Proxy discrimination / bias
C. Data leakage thời gian
D. Heteroscedasticity

**8.4.** Human-in-the-loop đặc biệt cần khi:
A. Mô hình dự báo thời tiết
B. Quyết định tác động trực tiếp con người (từ chối vay, tuyển dụng)
C. Dashboard nội bộ
D. Phân loại email rác

**8.5.** Nhân viên dán hợp đồng khách hàng vào ChatGPT public → rủi ro lớn nhất:
A. Mô hình sai
B. Rò rỉ dữ liệu nhạy cảm ra bên thứ ba
C. Tốn chi phí API
D. Chậm kết nối

**8.6.** Differential privacy (giới thiệu) là:
A. Mã hóa khóa công khai
B. Thêm nhiễu có kiểm soát khi phân tích dữ liệu để bảo vệ cá nhân
C. Xóa outlier
D. Backup dữ liệu

**8.7.** "Fairness metrics xung đột" nghĩa là:
A. Tối ưu 1 tiêu chí công bằng thường đánh đổi tiêu chí khác + accuracy
B. Không có fairness metric nào
C. Fairness luôn tăng accuracy
D. Chỉ dùng được 1 metric

**8.8.** Kế hoạch lưu trữ (retention) plan cho dữ liệu giao dịch phục vụ:
A. Chỉ marketing
B. Giới hạn lưu trữ — một trong 7 nguyên tắc nền privacy
C. Tăng R²
D. Giảm VIF

### Câu hỏi tự luận

**8.9.** Liệt kê 7 nguyên tắc bảo vệ dữ liệu cá nhân (OECD/UNESCO) và giải thích ngắn từng nguyên tắc.

**8.10.** Vì sao "dữ liệu quá khứ = lịch sử có lỗi"? Cơ chế bias dữ liệu khuếch đại bất bình đẳng — kèm 1 ví dụ.

**8.11.** Mô tả responsible AI lifecycle tối thiểu 7 bước cho mô hình tác động đến con người.

### Bài toán tình huống

**8.12.** Fintech cá nhân hóa giá: nhóm khách có dấu hiệu khẩn cấp tài chính thấy lãi suất cao hơn; doanh thu tăng 8% nhưng sắp có báo chí phản ánh. Trình bày: (a) 3 vấn đề đạo đức/quản trị; (b) khung xử lý 5 bước (đánh giá, fairness audit, guardrail, minh bạch, redress); (c) thay đổi metric tối ưu hóa để sự việc không lặp lại.

---

# ĐÁP ÁN & GIẢI THÍCH

## Bài 1

**1.1. B** — "Vì sao" = diagnostic. Mô tả là "điều gì đã xảy ra".
**1.2. C** — Dự báo (predictive) — gắn nhãn/khả năng tương lai.
**1.3. B** — CRISP-DM luôn bắt đầu business understanding; chọn mô hình là bước sau.
**1.4. C** — Thực tế 60–80% thời gian; làm sạch quyết định chất lượng mô hình.
**1.5. D** — Prescriptive trả lời "nên làm gì" (tối ưu, khuyến nghị).
**1.6. B** — Grain = một dòng dữ liệu đại diện cho gì (VD: 1 dòng = 1 đơn hàng). Sai grain → số không khớp.
**1.7. D** — Cấp 4 = real-time/tự động; leo từ cấp 1 lên cấp 4 trong 1 năm gần như thất bại.
**1.8. B** — Grain/metric definition lệch giữa hệ thống là nguyên nhân phổ biến nhất.

**1.9.** (Mẫu) Mô tả: dashboard doanh số theo ngày/kênh. Khai phá: vì sao tuần 3 region B tụt (phân rã traffic vs. conversion). Dự báo: đơn hàng tuần tới để điều tồn kho. Prescriptive: phân bổ ngân sách ads tối đa ROI ước tính từ A/B test.

**1.10.** Analytics tạo giá trị chỉ khi thay đổi hành động; bắt đầu từ quyết định xác định: ai ra quyết định, trade-off gì, metric success nào → chọn đúng cấp phân tích và dữ liệu; tránh "đẹp nhưng không dùng" (case dashboard 50 chart chết). Công cụ là phương tiện, câu hỏi là chủ.

**1.11.** (1) Mô hình không được đưa vào quy trình làm việc → không tác động; (2) Không ai chịu trách nhiệm monitor drift/sửa khi lỗi → model degrade im lặng; (3) Không có feedback loop → không cải thiện được; (4) Tổ chức mất niềm tin phân tích do "slide xong rồi mất".

**1.12.** (Mẫu) Cảm ơn kỳ vọng; nhưng 6 tháng dự báo ngay khi dữ liệu nền "doanh số giảm" chưa hiểu nguyên nhân = xây nhà trên cát. Theo CRISP-DM: (1) business understanding — quyết định cần là gì: có nên chỉnh menu/giá/đẩy promo tháng 7? (2) hiểu dữ — app metrics: DAU, conversion, AOV, theo cohort; (3) prep & mô tả — xu hướng có thực hay do mùa/sự kiện (tháng 6 vs. tháng 5 năm trước)? (4) khai phá — giảm ở funnel bước nào, nhóm khách nào; (5) nếu cần dự báo — dùng sau khi yếu tố quyết định rõ. Đề xuất: 1 tuần phân tích chẩn đoán → họp ra quyết định → nếu vẫn cần forecast, dựng baseline đơn giản trước, model phức tạp sau.

## Bài 2

**2.1. B** — Mean = 48/5 = 9.6; median = 7; mode = 7.
**2.2. B** — Median không bị outlier (20) kéo; mean bị lệch.
**2.3. B** — $\bar x = 12$; $s^2 = (4+0+4)/2 = 4$.
**2.4. B** — Quy tắc này đặc trưng phân phối chuẩn (đơn vị σ).
**2.5. C** — IQR = 3; fence = 15 + 1.5×3 = 19.5.
**2.6. B** — Thời gian liên tục → line chart giữ shape trend.
**2.7. A** — Cắt trục với bar chart phóng đại sai lệch (lừa trực quan).
**2.8. B** — Simpson's Paradox — luôn phân rã theo nhóm/confounder.

**2.9.** Mean = tổng/khách quan trọng cho doanh thu; median = typical khách; P90 = trải nghiệm phần đuôi (VD giao hàng, thời gian chờ) nơi giữ/churn khách. VD: mean AOV tăng nhờ 12 khách B2B nhưng median giảm — chỉ mean sẽ kết luận sai.

**2.10.** (1) Theo mục đích: so sánh nhóm → bar, trend → line. (2) Trục honest: bar từ 0. (3) Số nhóm hợp lý: pie ≤5 lát. (4) Phân phối hiển thị đầy đủ: histogram + box thay vì chỉ mean. (5) Tối giản: mỗi chart 1 takeaway.

**2.11.** Cohort = theo dõi nhóm theo thời điểm gia nhập (kênh, chiến dịch); gộp chung che mất retention khác nhau giữa cohort. Giá trị: chẩn đoán onboarding, LTV theo kênh, phát hiện ngưỡng (VD ≥4 buổi đầu) — thứ báo cáo tổng thể không thấy.

**2.12.** Mean giao hàng 2,1 ngày che đuôi: 10% đơn > 4,5 ngày — nhóm trải nghiệm tệ nhất (thường là tỉnh xa) cũng là nhóm dễ mất. Sửa: (1) quảng cáo dùng P50/P90 trung thực ("80% đơn ≤ 3 ngày"); (2) KPI ops chuyển sang P90 theo vùng; (3) dashboard thêm phân phối + outlier alert; (4) phân tích nguyên nhân đuôi (kho vùng, đơn vị vận chuyển) — hành động giảm P90 giữ khách tốt hơn "trung bình đẹp".

## Bài 3

**3.1. B** — p = 0.03 < α = 0.05 → bác bỏ $H_0$. (p không phải P($H_0$ đúng).)
**3.2. B** — Loại I = false positive: bác $H_0$ sai; β = loại II.
**3.3. C** — $P(churn|alert) = 0.045/(0.045+0.095) ≈ 32\%$ — base rate quyết định.
**3.4. C** — So sánh mean ≥3 nhóm → ANOVA.
**3.5. C** — Two-tailed α = 0.05 → ngưỡng ±1.96 (z/t n lớn).
**3.6. B** — Significant ≠ important; kiểm effect size + CI + giá trị kinh doanh.
**3.7. B** — Chạy nhiều test rồi chọn p<0.05 → sai phạm family-wise error; cần correction/pre-register.
**3.8. A** — $n ≈ 16s^2/\delta^2$ cho α = 0.05, power 0.8, 2 nhóm.

**3.9.** Statistical significance = từ chối $H_0$ ở ngưỡng p; practical = effect đủ lớn để hành động. VD: p = 0.01 với lift 0,1% ở n = 10 triệu → chắc chắn nhưng không bù chi phí thay đổi. Luôn báo effect size + CI + giá trị kinh tế trong quyết định.

**3.10.** Tín hiệu chỉ mạnh khi so với tỷ lệ nền: model "90% đúng" với base rate 5% → precision ~32%, 2/3 cảnh báo sai. Công thức $P(A|B) = P(B|A)P(A)/P(B)$. Hành động: đánh giá theo precision/PR-AUC, tối ưu chi phí FP/FN, không khoe accuracy.

**3.11.** (1) Chống p-hacking/researcher degrees of freedom; (2) Tăng niềm tin nội bộ/bên ngoài (auditable); (3) Bắt team suy nghĩ effect size kinh doanh & power trước khi tốn dữ liệu; (4) Tránh spin kết quả hậu kỳ.

**3.12.** (a) Sai: dừng sớm (peeking) làm α thật > 0.05; n = 500 quá nhỏ (power thấp → kết luận nhiễu cả 2 chiều); nhiều biến thể tháng đó không correction; thiếu pre-registration. (b) $n ≈ 16×0.196^2/0.008^2 ≈ 9.604$ ≈ 10.000/nhóm. (c) Quy trình: hypothesis + metric primary + ngưỡng effect kinh doanh → power → chốt thời gian chạy (≥2 tuần/vòng mua) → SRM check → phân tích 1 lần theo plan + CI → quyết định theo EV, không theo p đơn độc.

## Bài 4

**4.1. B** — $36 + 1.19×50 = 95.5$.
**4.2. B** — Ceteris paribus — không phải tương quan Pearson.
**4.3. A** — $R^2$ = tỷ lệ variance y giải thích bởi mô hình.
**4.4. B** — VIF > 5–10 cảnh báo đa cộng tuyến nghiêm trọng.
**4.5. D** — Target nhị phân là logistic; OLS cần continuous y + giả định khác.
**4.6. C** — $R^2$ không giảm khi thêm biến → dùng adjusted $R^2$/AIC.
**4.7. A** — Cùng trend → spurious regression, R² ảo; cần diff/stationarity check.
**4.8. B** — Lasso (L1) co hệ số = 0 → tự chọn biến; Ridge (L2) chỉ thu nhỏ.

**4.9.** (1) Tuyến tính: residual vs. fitted có pattern → thêm bậc/đổi biến. (2) Độc lập lỗi: DW/Autocorrelation (dữ thời gian) → thêm lag/AR/GMM. (3) Phương sai đồng đều: residual fan-shaped → robust SE/log. (4) Bình thường lỗi (n nhỏ): QQ plot → transform/non-parametric. (5) Không đa cộng tuyến: VIF → gộp/loại/PCA/regularize.

**4.10.** Multicollinearity → SE phình, hệ số không ổn định (đảo dấu), diễn giải riêng lẻ không đáng tin (dự báo vẫn OK nếu ngoài mẫu ổn). Xử lý: (1) loại/gộp biến tương quan cao; (2) biến tổng hợp/PCA; (3) Ridge/Lasso nếu mục tiêu dự báo.

**4.11.** In-sample luôn optimistic (đặc biệt thêm biến) → không phản ánh hiệu năng dữ tương lai. Dữ thời gian: split theo thời gian (train quá khứ, test tương lai), không shuffle — tránh rò rỉ tương lai; có thể rolling/walk-forward validation; holdout cuối cùng never touched.

**4.12.** Hiện tượng: (1) $R^2$ 0.93 in-sample nhưng holdout tệ → overfitting/spurious trend; (2) promo p = 0.06 — không đủ bằng chứng, có thể multicollinearity với price (SE phình); (3) baseline naive thắng → mô hình không học được signal thật. Sửa: kiểm VIF/residual theo thời gian; split time-based; đơn giản hóa mô hình (biến có lý luận); thêm yếu tố mùa/competition; so sánh AIC/CV; nếu ngoài mẫu vẫn không thắng baseline → dừng, thu thập thêm dữ/feature nghiệp vụ thay vì tune thêm.

## Bài 5

**5.1. A** — Precision = TP/(TP+FP) = 50/60 ≈ 83,3%.
**5.2. B** — Baseline "tất cả negative" đã 97% — accuracy không thêm thông tin; xem recall, confusion matrix, PR-AUC.
**5.3. B** — $\tau^* = 50/(50+500) ≈ 9\%$ — gọi nhóm risk > 9%.
**5.4. B** — AUC 0.5 = xếp hạng ngẫu nhiên — không phân biệt.
**5.5. B** — Feature sinh sau khi churn → rò rỉ nhãn; model "ảo thần".
**5.6. B** — F1/PR-AUC/AUC quan tâm lớp positive hiếm; accuracy che.
**5.7. B** — Khi cần giải thích, đưa vào SOP, training con người — không phải mặc định.
**5.8. A** — Calibration = xác suất trúng mức; AUC = khả năng xếp đúng thứ tự — 2 khái niệm độc lập.

**5.9.** Accuracy = 900/1.000 = 90% (gần baseline 90% của "báo không ai churn" — ảo). Precision = 60/120 = 50%. Recall = 60/100 = 60%. F1 = 2×0.5×0.6/1.1 ≈ 54,5%. Nhận xét: mô hình yếu — 50% cảnh báo sai; cải thiện: feature/imbalance handling/ngưỡng theo chi phí, đánh giá AUC-PR.

**5.10.** Ngưỡng 0.5 chỉ tối ưu khi FP/FN bằng nhau. $\tau^* = c_{FP}/(c_{FP}+c_{FN})$ — VD FN = 500k, FP = 50k → 9%: call center gọi từ nhóm >9% thay vì đợi 50%. Verify bằng expected cost curve trên holdout; monitor precision@k theo tuần.

**5.11.** (1) Class weight/penalty — cheap, ít đổi phân phối, nhưng thuật toán cũ chưa cân bằng được. (2) Oversample minority (SMOTE) — tăng signal, rủi ro leakage/nếu oversample trước split → làm tròn test sai. (3) Undersample majority — nhanh, mất thông tin nhóm lớn. Bổ sung: đổi metric (PR-AUC), ngưỡng theo chi phí, anomaly detection cho fraud cực hiếm.

**5.12.** Nghi vấn: (1) Leakage — biến sinh sau kết quả (đánh giá sau giải ngân, "flag duyệt" trong data); (2) Split sai — shuffle dữ thời gian/leak cùng khách hàng vào train và test; (3) Overfitting — model phức tạp, in-sample, chưa CV/holdout time-based; (4) Duplicate khách hàng train-test. Quy trình sản xuất: hiểu feature availability timestamp → time-based split → baseline → benchmark out-of-sample (kỳ vọng drop về ~0.75–0.8) → subgroup audit + calibration → shadow mode pilot 1–2 quý → monitor drift + appeal channel → rollout có ngưỡng.

## Bài 6

**6.1. B** — Confounder nhiệt độ/mùa giải thích cả hai — không phải nhân quả kem → đuối nước.
**6.2. B** — Randomization có kiểm soát cân bằng confound kỳ vọng; lựa chọn self-selection = bias.
**6.3. A** — Xem p nhiều lần rồi dừng → FWER phình; phải chốt plan hoặc sequential method.
**6.4. B** — Khi user độc lập; network effects → random theo cluster (thành phố/nhóm).
**6.5. B** — Design effect = $1+(m-1)\rho$ — cluster correlation → inflate n so với SRS.
**6.6. A** — 2×2 trước/sau + giả định parallel trends; không cần random nhưng phải kiểm trend.
**6.7. A** — Power thấp → CI rộng chứa cả 0 lẫn hiệu ứng lớn; fail-to-reject ≠ equivalence (cần equivalence test).
**6.8. B** — Guardrail (latency, margin, refund, complaint) ngăn thắng metric chính nhưng thua hệ sinh thái.

**6.9.** 3 cơ chế: (1) Confounder chung (mùa/nền kinh tế kéo cả hai); (2) Reverse causality (y → x); (3) Chance/spurious (chọn data hậu kỳ, nhiều biến). Ngẫu nhiên hóa, DiD, RDD, matching giúp dựng nhân quả — không phải thêm regression vào dashboard.

**6.10.** (1) Hypothesis + primary metric + MDE kinh doanh; (2) Power → n, chốt thời gian (≥1 vòng mua, thường 2 tuần+); (3) Randomization unit + stable bucket + SRM check; (4) Chạy đủ n, không peek; (5) Phân tích theo plan: effect + CI + p + pre-specified segments; guardrail; quyết định + monitor sau rollout.

**6.11.** (1) Difference-in-differences: so chênh lệch trước-sau giữa treatment/control — cần parallel trends. (2) Regression discontinuity: so 2 bên ngưỡng điểm (điểm thi, thu nhập) — cần không nhảy cóc khác ở ngưỡng. (3) Matching/propensity score: ghép tương đương trên observed confounders — vẫn yếu với unobserved.

**6.12.** (a) (1) Peek + dừng sớm → α thật vượt 0.05; (2) n = 2.000 dưới power → p = 0.04 nhiễu; (3) 12 test trong tháng → không correction (Bonferroni 0.05/12 ≈ 0.004 → 0.04 fail); (4) không pre-register → degrees of freedom. (b) Chốt metric/hypotheses trước; power calculator; correction/alpha spending; chạy đủ n = 40.000 như sau — kết quả p = 0.4 = không đủ bằng chứng, giữ nguyên. (c) Văn hóa: experiment registry, 1 primary metric/test, tôn trọng "inconclusive" là kết quả hợp lệ, celebrate learning không chỉ thắng, review design trước launch.

## Bài 7

**7.1. B** — Mỗi dashboard 1 mục đích ≤5–7 câu hỏi; 40 KPI = mù.
**7.2. B** — KPI card value + Δ + sparkline; chi tiết phía dưới.
**7.3. A** — North star = giá trị cốt lõi cho khách; input/guardrail tree hỗ trợ.
**7.4. B** — Freshness + lineage → niềm tin; dashboard sai im lặng làm mất niềm tin.
**7.5. B** — Narrative layer: Observation → Implication → Recommendation → Ask.
**7.6. C** — 2 thang đo tùy ý khiến mắt thấy tương quan không có thật.
**7.7. B** — Semantic layer: 1 SSOT cho định nghĩa metric.
**7.8. B** — Không gắn quyết định + quá tải tín hiệu → không ai dùng.

**7.9.** Row 1: 4–5 KPI + delta + sparkline. Row 2: trend chính + alert list theo ngưỡng. Row 3: phân tích dimension (bar/top-N). Footer: last refresh + owner. Drill-down/chi tiết ở trang analyst, không trộn vào trang executive.

**7.10.** Visualization = truyền đạt số đúng & không lừa (chart type, trục honest, highlight exception). Storytelling = cấu trúc bối cảnh → xung đột (số) → implication → recommendation → ask, "dịch" technical sang decision của người nghe. VD: chart P90 giao hàng = viz; slide "P90 tỉnh 4,5 ngày mất 3% NPS → đầu tư kho vùng, cần 2 tỷ Q3" = story.

**7.11.** (1) Semantic layer — 1 định nghĩa metric. (2) Đối chiếu định kỳ với sổ cái/BCF. (3) Minh bạch lineage + last refresh + data quality incident công khai. (4) Owner chịu trách nhiệm; ritual (standup thứ 2) tạo thói quen dùng → niềm tin đến từ dùng đều + đúng.

**7.12.** Phỏng vấn 8 người ra quyết định → list 3–5 câu hỏi họ cần mỗi sáng. Draft 6–7 chart: KPI + trend + 3 alert + top-N. Cold test 60 giây. Owner + refresh SLA. Training 30 phút + office hour. Ritual standup 15 phút thứ 2. Kill 45 chart cũ. KPI 30 ngày: ≥70% leader mở ≥3 lần/tuần; ≥2 cảnh báo biến thành hành động; user feedback CSAT ≥ 4/5.

## Bài 8

**8.1. B** — Minimization = chỉ thu cái cần cho mục đích khai báo; không "thu trước đã".
**8.2. B** — NĐ 13/2023/NĐ-CP quy định bảo vệ dữ liệu cá nhân tại VN.
**8.3. B** — Mã vùng làm proxy vùng/thu nhập → phân biệt gián tiếp (proxy discrimination).
**8.4. B** — Quyết định tác động con người cao rủi ro cần người trong vòng lặp + kênh khiếu nại.
**8.5. B** — Prompt ra ngoài → rủi ro rò bí mật/dữ cá nhân cho bên thứ ba.
**8.6. B** — Differential privacy = nhiễu có kiểm soát để bảo vệ cá nhân khi phân tích/tổng hợp.
**8.7. A** — Fairness criteria xung đột (demographic parity vs. equalized odds...); phải chọn theo bối cảnh + đo subgroup.
**8.8. B** — Storage limitation — một trong 7 nguyên tắc nền; retention plan + xóa theo lịch.

**8.9.** (1) Hợp pháp & minh bạch; (2) Mục đích hạn chế; (3) Dữ liệu tối thiểu; (4) Độ chính xác; (5) Giới hạn lưu trữ; (6) Toàn vẹn & bảo mật; (7) Trách nhiệm giải trình. Tương ứng hành động: lawful basis + notice; consent/purpose match; thu field tối thiểu; data quality; retention schedule; access control/encryption; audit + owner + DPO.

**8.10.** Mô hình học từ labels/quyết định quá khứ mang bias hệ thống (VD tuyển 90% nam → model coi nữ = điểm thấp; credit historical rejection vùng A → region proxy) → dự báo → quyết định lặp lại → khuếch đại bất bình đẳng (feedback loop). Ví dụ screening CV, face recognition sai nhóm thiểu số. Sửa: audit subgroup, bỏ proxy, labels theo outcome công bằng, human review, monitor.

**8.11.** (1) Define harm scenarios — ai có thể bị hại gì; (2) Data audit & consent (minimization, lineage); (3) Bias/fairness testing theo nhóm; (4) Human-in-the-loop + ngưỡng cảnh báo cho high-stakes; (5) Documentation (model card: dữ, giới hạn, metric); (6) Monitoring drift + incident response + appeal/redress cho người bị tác động; (7) Review định kỳ/retire model.

**8.12.** (a) (1) Discrimination theo distress — đạo đức + pháp lý; (2) Tối ưu revenue đơn metric, không fairness guardrail; (3) Minh bạch/redress không có — khách không biết bị "cá nhân hóa giá". (b) Khung: (1) dừng expansion & đánh giá tác động (DPIA-style); (2) fairness audit theo nhóm thu nhập/hành vi; (3) guardrail: chấm độ dễ tổn thương → không dùng đẩy giá, dùng offer hỗ trợ lãi nhẹ/kỳ hạn phù hợp; (4) minh bạch thuật toán giá với cơ quan/khách; (5) appeal channel khi khách khiếu nại giá. (c) Thay metric: không "revenue per user" thuần mà = revenue với ràng buộc fairness (khác biệt giá nhóm ≤ ngưỡng) + trust/retention guardrail; giá dịch vụ công bố theo khung rõ ràng.

---

*Hết bộ câu hỏi — 8 bài: 64 câu trắc nghiệm, 24 câu tự luận, 8 tình huống.*
