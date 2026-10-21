---
marp: true
theme: default
paginate: true
---

<!-- _paginate: false -->

# Chuyên đề 16
## Chuyển đổi số & Công nghệ quản trị
### Digital Transformation / MIS

---

# Mục lục chuyên đề

- Bài 1: Tổng quan MIS & khung chuyển đổi số
- Bài 2: Hệ thống hoạch định nguồn lực (ERP)
- Bài 3: CRM, SCM software & bán hàng số
- Bài 4: Dữ liệu, kho dữ liệu & BI
- Bài 5: Cloud, SaaS & kiến trúc hệ thống
- Bài 6: AI/ML & tự động hóa quy trình (RPA)
- Bài 7: Thương mại điện tử & nền tảng số
- Bài 8: An ninh thông tin & quản trị thay đổi số

---

# Bài 1 — MIS là gì?

- MIS: con người – quy trình – công nghệ – thông tin
- TPS: giao dịch hàng ngày (POS, hóa đơn)
- MIS/DSS: báo cáo, hỗ trợ quyết định
- EIS/BI: KPI tổng hợp cho lãnh đạo
- Hệ thống chiến lược: phân tích, AI theo kịch bản
- Thông tin tốt = dữ liệu đúng + đúng người + đúng lúc

---

# Ba khái niệm dễ nhầm

- **Digitization**: giấy → dữ liệu số
- **Digitalization**: đổi cách làm bằng công nghệ
- **Transformation**: đổi mô hình kinh doanh
- 4 trụ cột CĐS: khách hàng, vận hành, người, dữ liệu
- Mua ERP ≠ chuyển đổi số
- KPI kinh doanh trước, công nghệ sau

---

# Ứng dụng & phỏng vấn — Bài 1

- "Digitization khác digitalization thế nào?"
- "Vì sao ERP không tự động là CĐS?"
- Checklist: bài toán KPI, as-is, dữ liệu, 3 phương án, TCO
- Đào tạo & thay đổi nằm trong ngân sách

---

# Bài 2 — ERP

- Module: FI/CO, SD, MM, PP, HR, WM
- Một cơ sở dữ liệu chung, module liên thông
- Order-to-cash: đơn → giao → hóa đơn → thu → sổ cái
- Single source of truth, quy trình chuẩn
- Cloud ERP: thuê bao, hợp SME/mid-market
- Customize quá mức = chi phí phình, nâng cấp khó

---

# Rủi ro triển khai ERP

- Vượt ngân sách/phạm vi (scope creep)
- Data migration: dữ liệu cũ bẩn/trùng
- Đào tạo & chấp nhận thay đổi yếu
- Go-live big bang = gián đoạn lớn
- Chi phí ẩn: tích hợp + dữ liệu + đào tạo > license
- Hypercare sau go-live là bắt buộc

---

# Ứng dụng & phỏng vấn — Bài 2

- TCO 5 năm, không chỉ giá license
- Phân kỳ: module cốt lõi trước
- "3 rủi ro ERP lớn nhất?"
- Chủ sở hữu quy trình = nghiệp vụ, không chỉ IT

---

# Bài 3 — CRM & bán hàng số

- CRM: liên hệ, cơ hội, tương tác, sau bán
- Funnel: lead → MQL → SQL → thắng → giữ
- RFM: Recency, Frequency, Monetary
- Lead scoring, marketing automation
- Omnichannel: dữ liệu khách/tồn kho một nguồn
- Pipeline + forecast = lợi ích thấy ngay cho sales

---

# CRM thành công cần gì

- Quy trình bán hàng thống nhất (5–7 bước)
- Incentive & KPI liên kết dữ liệu CRM
- Làm sạch dữ liệu trước migrate
- Dashboard: pipeline, win rate, nguồn lead
- Tuân thủ bảo vệ dữ liệu cá nhân (PDPL)
- CRM ≠ danh bạ điện tử

---

# Ứng dụng & phỏng vấn — Bài 3

- Áp dụng RFM trên dữ liệu hiện có
- "Vì sao CRM không tăng doanh thu?"
- Chiến dịch VIP ngủ vs. khách 1 lần
- Không song song "sự thật" Excel riêng

---

# Bài 4 — Dữ liệu & BI

- Dữ liệu → thông tin → kiến thức → quyết định
- DWH tích hợp nhiều nguồn (ERP, CRM, POS)
- ETL: Extract – Transform – Load
- OLTP giao dịch vs. OLAP phân tích
- BI: dashboard, báo cáo theo vai trò
- Garbage in – garbage out

---

# Chất lượng & quản trị dữ liệu

- 6 tiêu chí: đầy đủ, chính xác, nhất quán…
- MDM: một mã, một tên, một nguồn (KH, hàng, NCC)
- Data owner + định nghĩa chỉ số viết thành văn
- Dashboard 50 chỉ số = không ai nhìn
- Lake không quản lý = swamp
- Câu hỏi kinh doanh trước, công cụ sau

---

# Ứng dụng & phỏng vấn — Bài 4

- "ETL gồm 3 bước nào?"
- Viết định nghĩa 5 chỉ số phòng bạn
- OLTP vs. OLAP
- Governance trước, mua BI sau

---

# Bài 5 — Cloud & SaaS

- IaaS: OS + app + data
- PaaS: app + data
- SaaS: chỉ dữ liệu người dùng
- SaaS = thuê bao, nhanh, ít hạ tầng
- TCO: thuê bao + tích hợp + đào tạo + lock-in
- Hybrid: workload chọn nơi phù hợp

---

# Bảo mật cloud & FinOps

- Shared responsibility: hạ tầng vs. cấu hình/dữ liệu
- Sự cố phổ biến: cấu hình sai, backup không test
- MFA, RBAC, audit log, exit plan
- FinOps: finance + IT cùng quản chi phí cloud
- Lock-in: giữ định dạng mở, kiểm soát export
- Cloud không luôn rẻ — so TCO 3–5 năm

---

# Ứng dụng & phỏng vấn — Bài 5

- "Shared responsibility nghĩa là gì?"
- Bảng inventory SaaS toàn công ty
- Exit plan ký ngay khi mua SaaS
- Workload ổn định 24/7: cân nhắc on-premise

---

# Bài 6 — AI/ML & RPA

- ML: dự đoán/phân loại từ dữ liệu
- Classification, regression, clustering, forecast
- Generative AI/LLM: sinh văn bản, hỗ trợ CSKH
- RPA: robot thao tác theo luật trên giao diện
- Khác: thao tác (RPA) vs. dự đoán (ML)
- Dự báo/churn có baseline = ROI rõ nhất

---

# Rủi ro & vận hành AI

- Concept drift: dữ liệu đổi, mô hình cũ sai
- Hallucination: nội dung sai như thật
- Bias dữ liệu, rò rỉ dữ liệu ra công cụ công cộng
- Human-in-the-loop: người duyệt cuối
- RPA cần quy trình chuẩn ≥ 80%
- "AI không sửa được dữ liệu bẩn"

---

# Ứng dụng & phỏng vấn — Bài 6

- "RPA khác AI thế nào?"
- 5 tiêu chí chọn use case AI/RPA
- Baseline đơn giản trước, ML phức tạp sau
- Kho tri thức duyệt khi dùng LLM nội bộ

---

# Bài 7 — TMĐT & nền tảng số

- B2C, B2B, C2C, D2C
- Conversion, AOV, CAC, tỉ lệ trả hàng
- Marketplace (hoa hồng) vs. 1P (tồn kho)
- Flywheel: hai mặt hiệu ứng mạng lưới
- Rủi ro: leakage, phụ thuộc 1 sàn
- Biên thực = giá − vốn − phí − ads − giao − trả

---

# Chiến lược bán số

- Đa kênh, giới hạn tập trung sàn
- D2C + dữ liệu khách hàng riêng (CDP/CRM)
- Mô tả hàng thật → giảm đổi trả
- Livestream cần kịch bản + hậu cần đơn
- So sánh lợi nhuận: sau phí, ads, trả hàng
- Sàn = tìm khách; D2C = nuôi khách

---

# Ứng dụng & phỏng vấn — Bài 7

- "AOV, CAC, cart abandonment liên hệ lợi nhuận"
- Tính biên thực theo kênh cho 3 kênh
- "Rủi ro phụ thuộc 1 sàn?"
- Không tối ưu GMV bằng ads lỗ

---

# Bài 8 — An ninh & chiến lược CĐS

- CIA: Confidentiality – Integrity – Availability
- Ransomware, phishing, rò rỉ, cấu hình sai
- MFA, least privilege, backup 3-2-1 + test
- PDPL: dữ liệu cá nhân, mục đích, đồng ý
- Steering committee liên phòng ban
- 4 pha change: mua vào → đồng thiết kế → thử → cố hóa

---

# Case Việt Nam & bài học

- Ngành số: hạ tầng + quy định + trải nghiệm
- SME phân phối: app đặt hàng 30 điểm bán,
  giảm 40% sai sót đơn, dashboard tồn kho vùng
- Phạm vi hẹp, giải pain cụ thể, lãnh đạo dùng số
- Đào tạo sát điểm bán, theo vai trò
- Không CĐS toàn diện 1 đêm
- CIA + quy trình offline khẩn cấp = resilience

---

# Ứng dụng & phỏng vấn — Bài 8

- "Tam giác CIA áp vào ransomware?"
- Vì sao change management > cài đặt phần mềm?
- Business case 1 trang cho sáng kiến số
- MFA + backup test + drill tối thiểu

---

# Tóm tắt chuyên đề

| Bài | Công cụ chính | Ngưỡng nhớ |
|-----|---------------|------------|
| 1 | MIS, khung CĐS | KPI trước công nghệ |
| 2 | ERP | TCO 5 năm, hypercare |
| 3 | CRM, RFM | Pipeline, win rate |
| 4 | DWH, ETL, BI | Định nghĩa chỉ số thống nhất |
| 5 | Cloud, SaaS | Shared responsibility |
| 6 | ML, RPA | Baseline + human-in-the-loop |
| 7 | TMĐT, marketplace | Biên thực theo kênh |
| 8 | CIA, PDPL, change | MFA, backup 3-2-1, steering |

---

# Cảm ơn & Q&A

- Chi tiết: `bai-hoc.md`
- Tự kiểm tra: `cau-hoi.md`
- Câu hỏi thảo luận?
