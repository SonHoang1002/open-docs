# Python Interview — Tech Lead, Engineering Manager, Senior Manager

> ~65 câu cho vòng leadership: Tech Lead (dẫn kỹ thuật), Engineering Manager (dẫn người và
> delivery), Senior Manager (nhiều team, chiến lược, org, ngân sách). Trọng tâm là **quyết định,
> hành vi, bằng chứng thật** — không phải lý thuyết quản trị suông.

---

## Mục lục

1. [Tech Lead: vai trò và quyết định kỹ thuật](#1-tech-lead-vai-trò-và-quyết-định-kỹ-thuật)
2. [Engineering Manager: con người và team](#2-engineering-manager-con-người-và-team)
3. [Tuyển dụng và onboarding](#3-tuyển-dụng-và-onboarding)
4. [Hiệu suất và phát triển](#4-hiệu-suất-và-phát-triển)
5. [Delivery và vận hành](#5-delivery-và-vận-hành)
6. [Stakeholder và sản phẩm](#6-stakeholder-và-sản-phẩm)
7. [Tổ chức, chiến lược, ngân sách](#7-tổ-chức-chiến-lược-ngân-sách)
8. [Văn hóa và tình huống khó](#8-văn-hóa-và-tình-huống-khó)
9. [Tình huống STAR](#9-tình-huống-star)
10. [Tài liệu tham khảo](#10-tài-liệu-tham-khảo)

---

## 1. Tech Lead: vai trò và quyết định kỹ thuật

### Q01. Tech Lead, Senior IC và Engineering Manager khác nhau thế nào? [L]

**Trả lời:** Ba vai trò khác **đầu ra**, không chỉ khác title:

| Vai trò | Đầu ra chính | Thời gian |
|---|---|---|
| Senior IC | Hệ thống/feature khó, chuẩn kỹ thuật | Phần lớn viết code/thiết kế |
| Tech Lead | Đội ngũ giao đúng, kiến trúc nhất quán | ~50% kỹ thuật, 50% điều phối |
| EM | Con người, delivery, sức khỏe team | ~20% kỹ thuật, 80% con người/quy trình |

Tech Lead vẫn là kỹ sư: review, thiết kế, gỡ blocker, đặt chuẩn; quyền lực chủ yếu đến từ năng
lực và sự tin cậy. EM chịu trách nhiệm tuyển dụng, phát triển, hiệu suất, và kết quả của team;
không nhất thiết là người giỏi nhất về kỹ thuật. Ở nhiều công ty, một người kiêm cả hai — khi
đó phải nói rõ thời gian và ưu tiên, tránh "lead nửa vời".

**Điểm cộng:** nêu ranh giới khi nào TL escalate lên EM, và khi nào EM không nên can thiệp kỹ
thuật quá sâu.

---

### Q02. Tech Lead ra quyết định kiến trúc thế nào? [L]

**Trả lời:** Xác định **loại quyết định**: one-way door (khó đảo ngược: chọn DB, ngôn ngữ,
boundary service) cần chậm, nhiều dữ kiện; two-way door (dễ đảo ngược) nên giao cho người gần
nhất và quyết nhanh.

Quy trình: viết vấn đề + ràng buộc → liệt kê 2–3 phương án → tiêu chí (chi phí, rủi ro, thời
gian, kỹ năng team) → POC nếu bất định → quyết định + ADR → review sau một thời gian. Phân biệt
**consent** (không ai phản đối nghiêm trọng) với **consensus** (mọi người đồng ý) — consent
thực dụng hơn. Người quyết định phải rõ, không "cả team cùng chịu".

**Bẫy:** dùng chức danh để áp đặt mà không giải thích trade-off; hoặc hỏi ý kiến mọi người rồi
không ai chịu trách nhiệm.

---

### Q03. Chia việc và delegation cho team? [L]

**Trả lời:** Chia theo **outcome + mức trưởng thành**, không chỉ theo task. Với người mới: mô
tả kết quả, ví dụ, checkpoint; với người có kinh nghiệm: nêu mục tiêu, ràng buộc, để họ chọn
cách làm. Dùng mô hình situational leadership: directing → coaching → supporting → delegating.

```text
Task: "Làm endpoint export" (task)
Outcome: "Khách tải được báo cáo tháng < 30s, không chặn API" (outcome)
Ràng buộc: deadline, schema, không dùng thêm vendor
Checkpoint: demo giữa kỳ + review thiết kế
```

Không delegation kiểu "ném việc". Ghi rõ owner, deadline, definition of done, và cách escalate.
Theo dõi tải của team, tránh dồn việc khó cho 1–2 người "làm nhanh".

---

### Q04. Tech Lead nên review code thế nào? [L]

**Trả lời:** Review để **giảm rủi ro và truyền chuẩn**, không để chứng minh thông minh. Phân
loại comment: blocking (bug, bảo mật, sai thiết kế), nên sửa, nit (style — để tool lo). Giới hạn
phạm vi PR, yêu cầu test/evidence, và trả lời trong SLA hợp lý.

```text
Blocking: "Query này không có tenant_id -> rò rỉ dữ liệu."
Question: "Vì sao chọn queue thay vì gọi sync ở đây?"
Nit: "Đặt tên `data` khó hiểu, nhưng không chặn."
```

Với senior, tập trung vào trade-off/kiến trúc; với junior, chỉ 1–2 điểm quan trọng nhất để không
quá tải. Đo: thời gian review, số vòng, defect lọt ra production, và chất lượng thảo luận. TL
cũng phải viết code đủ để hiểu hệ thống, nhưng không trở thành bottleneck.

---

### Q05. Cân bằng feature và tech debt thế nào? [L]

**Trả lời:** Không có tỉ lệ cố định đúng cho mọi nơi; **gắn nợ với rủi ro và mục tiêu**. Dành
10–20% capacity thường xuyên, cộng thêm khi có sự cố hoặc trước mùa cao điểm. Phân loại nợ:
chặn delivery, rủi ro bảo mật/sự cố, chi phí vận hành, khó tuyển dụng.

```text
Nợ A: không có test cho luồng thanh toán -> rủi ro cao, làm ngay
Nợ B: tên biến xấu -> cosmetic, gộp vào feature
Nợ C: version Python cũ -> deadline theo lịch security support
```

Nói chuyện với product bằng **ngôn ngữ tác động**: "nếu không xử lý, mỗi tháng mất X giờ và rủi
ro Y". Đừng xin "thời gian cho tech debt" chung chung; gắn với feature/mùa vụ cụ thể.

---

### Q06. Ra quyết định khi thiếu thông tin? [L]

**Trả lời:** Phân biệt **bất định có thể giảm** (làm spike/POC, hỏi stakeholder, đo) và **bất
định không thể giảm** (thị trường, hành vi người dùng). Với loại đầu, đừng quyết vội; với loại
sau, chọn phương án dễ đảo ngược, đặt điểm kiểm tra, và ghi giả định.

```text
Giả định: 70% user dùng mobile -> ưu tiên API cho mobile.
Kiểm tra: sau 2 tuần đo traffic; nếu sai, điều chỉnh roadmap.
```

Nêu rõ "điều gì sẽ khiến quyết định này sai" và cách phát hiện sớm. Tránh paralysis analysis;
đặt thời hạn cho việc tìm hiểu. Khi liên quan nhiều team, dùng RFC ngắn để lộ giả định.

---

### Q07. Tech Lead chịu trách nhiệm gì về bảo mật và vận hành? [L]

**Trả lời:** Đảm bảo các **mặc định an toàn** đi vào quy trình: threat model cho feature nhạy
cảm, review quyền/tenant, secret không vào code, dependency scan, logging không lộ PII. Về vận
hành: SLO, alert actionable, runbook, on-call, và postmortem có action item.

Không cần TL làm tất cả, nhưng phải có owner và kiểm tra. Đưa checklist vào PR template/definition
of done. Đo: số incident, thời gian phát hiện/khắc phục, lỗ hổng tồn đọng, tỉ lệ alert actionable.
Khi trade-off, nêu rủi ro bằng kịch bản cụ thể thay vì "không an toàn".

---

### Q08. Vai trò Tech Lead trong incident? [L]

**Trả lời:** Không nhất thiết là Incident Commander, nhưng phải đảm bảo: có người điều phối, có
kênh riêng, có người giao tiếp, và mọi thay đổi được ghi lại. TL thường là người hiểu hệ thống
nhất — tập trung vào giả thuyết và cách kiểm chứng, tránh tự tay sửa mọi thứ.

Sau incident: dẫn dắt postmortem, đảm bảo action item cụ thể, và bảo vệ người trực khỏi đổ lỗi.
Nếu nguyên nhân là quyết định kiến trúc của mình, nói rõ và điều chỉnh. Đo MTTR/MTTD và tỉ lệ
tái diễn; cải thiện hệ thống, không chỉ viết "cẩn thận hơn".

---

### Q09. Mentoring và coaching khác nhau? [L]

**Trả lời:** Mentoring truyền **kinh nghiệm/kiến thức** ("anh thường làm thế này"); coaching
giúp người học **tự tìm ra** ("em nghĩ nguyên nhân là gì?", "em muốn đạt gì?"). TL cần cả hai,
nhưng lạm dụng mentoring dễ tạo phụ thuộc.

Dùng GROW: Goal (mục tiêu) → Reality (hiện trạng) → Options (lựa chọn) → Will (hành động). Giao
việc kèm cơ hội học, cho phép sai trong phạm vi an toàn, và feedback cụ thể. Không "mentor" bằng
cách làm hộ. Đo bằng sự tiến bộ của người được mentor (mức độ tự chủ, chất lượng quyết định),
không bằng số buổi.

---

### Q10. Ảnh hưởng cross-team khi không có quyền? [L]

**Trả lời:** Xây dựng quan hệ trước khi cần. Hiểu mục tiêu và áp lực của team kia; trình bày đề
xuất dưới dạng **lợi ích chung** và chi phí nếu không làm. Dùng dữ liệu (incident, chi phí,
thời gian) thay vì ý kiến. Đề xuất thử nghiệm nhỏ, có tiêu chí thành công.

Khi bất đồng, escalate bằng **vấn đề và trade-off**, không bằng cá nhân; tôn trọng quyền quyết
định của owner. Ghi lại thỏa thuận (Interface/ADR/SLA) để tránh hiểu lầm. Ảnh hưởng bền vững
đến từ việc giúp người khác thành công, không từ chức danh.

---

## 2. Engineering Manager: con người và team

### Q11. EM làm gì trong một tuần? Chuyển từ IC sang EM thế nào? [EM]

**Trả lời:** Một tuần điển hình: 1:1, unblock, review delivery/rủi ro, tuyển dụng, phối hợp
stakeholder, coaching, và xử lý vận hành. Không còn là người code nhiều nhất; thành công được đo
bằng **kết quả của team**, không bằng output cá nhân.

Chuyển vai trò thường khó vì: mất cảm giác "làm được việc", phải buông kiểm soát, và phải học kỹ
năng mới (feedback, tuyển, lập kế hoạch). Cách chuyển: giảm dần coding, đặt ranh giới review/
mentoring, học quản lý có chủ đích, tìm mentor, và xin feedback sớm. Tránh kiêm nhiệm quá lâu
gây xung đột ưu tiên.

---

### Q12. Một buổi 1:1 hiệu quả gồm gì? [EM]

**Trả lời:** Thuộc về **người nhân viên**, không phải báo cáo tiến độ. Hỏi: công việc thế nào,
điều gì khó, em muốn phát triển gì, có gì cần anh/chị hỗ trợ, và feedback hai chiều. Lắng nghe
nhiều hơn nói; ghi lại cam kết và theo dõi.

```text
- Mood/energy: tuần này thế nào?
- Blockers: có gì chặn em?
- Growth: em muốn học gì 3 tháng tới?
- Feedback: anh cần điều chỉnh gì?
- Actions: 1-2 việc rõ, có owner
```

Tần suất 1–2 tuần/lần, 30 phút, không hủy vô cớ. Với remote, giữ camera khi cần, nhưng tôn trọng
thời gian. Không dùng 1:1 để đột ngột đưa feedback tiêu cực nặng — việc đó cần không gian riêng.

---

### Q13. Xây psychological safety trong team? [EM]

**Trả lời:** Người ta dám nói khi: sai sót không bị trừng phạt, câu hỏi ngốc không bị cười, ý
kiến khác được cân nhắc, và người có quyền cũng nhận sai. EM làm mẫu: cảm ơn người báo lỗi, hỏi
ý kiến người ít nói, tách "sự cố" khỏi "con người".

Cụ thể: blameless postmortem, retro có action item, "disagree and commit" được tôn trọng, không
ngắt lời, và minh bạch tiêu chí quyết định. Đo bằng khảo sát ẩn danh, tỉ lệ người dám nêu rủi ro,
và việc bad news đến sớm hay muộn. Psychological safety không có nghĩa là dễ dãi về chất lượng.

---

### Q14. Xử lý underperformance thế nào? [EM]

**Trả lời:** Bắt đầu bằng **kỳ vọng rõ** và bằng chứng cụ thể, không dựa cảm giác. Kiểm tra
nguyên nhân: thiếu kỹ năng, thiếu context, vấn đề cá nhân, role mismatch, hay thiếu động lực.
Trao đổi riêng, lắng nghe, thống nhất hành động và thời hạn.

```text
1. Nêu quan sát: "3 sprint gần đây, 2 task trễ deadline..."
2. Tác động: "điều này làm team phải làm bù..."
3. Lắng nghe: "em thấy nguyên nhân là gì?"
4. Kỳ vọng + hỗ trợ: "trong 30 ngày cần đạt..."
5. Theo dõi, feedback thường xuyên, ghi lại
```

Nếu không cải thiện, dùng quy trình chính thức (PIP) theo HR/pháp lý, có mục tiêu đo được và hỗ
trợ thực chất. PIP không phải để "đuổi cho hợp lệ"; nếu đã xác định không phù hợp, minh bạch và
nhân văn. Không để kéo dài vì né tránh — ảnh hưởng cả team.

---

### Q15. Hai senior xung đột về thiết kế, bạn xử lý? [EM]

**Trả lời:** Chuyển khỏi "ai đúng" sang **tiêu chí chung**: yêu cầu, ràng buộc, rủi ro, chi phí,
thời gian. Yêu cầu mỗi bên viết ngắn gọn proposal và trade-off; nếu vẫn bất đồng, làm spike/POC
có tiêu chí đo.

```text
Bước 1: làm rõ vấn đề chung, tách sở thích khỏi dữ kiện
Bước 2: thống nhất tiêu chí đánh giá trước
Bước 3: thử nghiệm nhỏ / review với chuyên gia
Bước 4: quyết định, ghi ADR, cả hai cam kết thực thi
```

EM không nhất thiết chọn bên kỹ thuật; đảm bảo quy trình công bằng và không để xung đột thành
mất đoàn kết. Nếu một người liên tục làm việc qua kênh khác, xử lý hành vi riêng.

---

### Q16. Top performer xin nghỉ. Bạn làm gì? [EM]

**Trả lời:** Trước tiên lắng nghe lý do thật (phát triển, lương, manager, dự án, môi trường).
Không vội counter-offer; hiểu điều gì có thể thay đổi thực chất và điều gì không. Nếu có thể giữ,
đưa ra cam kết cụ thể (role, scope, lộ trình) bằng văn bản; nếu không, giữ quan hệ tốt và lo
handover.

Đồng thời: đánh giá rủi ro knowledge loss, phân tán kiến thức, và ổn định team. Nhìn lại hệ
thống phát triển/ghi nhận để người giỏi không phải "nghỉ mới được đền". Tránh hứa suông để giữ
tạm rồi vài tháng sau lại mất.

---

### Q17. Phải layoff hoặc tái cấu trúc team? [EM]

**Trả lời:** Phối hợp HR/pháp lý, đảm bảo minh bạch tiêu chí và quy trình. Chuẩn bị: danh sách,
thông điệp, thời điểm, hỗ trợ (severance, outplacement), và cách thông báo cho người ở lại.
Không để tin đồn dẫn dắt.

Thông báo trực tiếp, riêng tư, ngắn gọn, tôn trọng; không hứa những gì không chắc. Với người ở
lại: thừa nhận cảm xúc, giải thích lý do ở mức có thể, tập trung vào tương lai và hỗ trợ. EM
cũng cần chăm sóc bản thân và có người hỗ trợ. Ghi lại bài học về tuyển dụng/kế hoạch để tránh
lặp lại.

---

### Q18. Quản lý team remote/hybrid hiệu quả? [EM]

**Trả lời:** Ưu tiên **kết quả và giao tiếp rõ** thay vì giám sát hiện diện. Có nhịp: 1:1 đều,
standup ngắn, tài liệu hóa quyết định, kênh chat theo chủ đề, và thời gian tập trung. Múi giờ
khác nhau cần core hours và luân phiên họp.

Đo bằng outcome, không bằng online status. Chống cô lập: gặp gỡ không công việc, pairing, cơ hội
học. Với hybrid, tránh "hai tầng" (người ở văn phòng có thông tin hơn); mọi cuộc họp quan trọng
phải có ghi chú. Đào tạo manager về giao tiếp bất đồng bộ.

---

### Q19. Team có dấu hiệu burnout. Bạn làm gì? [EM]

**Trả lời:** Nhận diện: giảm chất lượng, im lặng trong meeting, tăng nghỉ ốm, overtime kéo dài,
hoài nghi. Nói chuyện riêng, hỏi về workload và kiểm soát, không chỉ hỏi "có ổn không". Giảm tải
cụ thể: cắt scope, dừng dự án ít ưu tiên, thêm người, hoặc dời deadline.

Kiểm tra hệ thống: on-call quá dày, thiếu người, yêu cầu thay đổi liên tục, môi trường độc hại.
Không "khuyên nghỉ ngơi" rồi giữ nguyên workload. Theo dõi sau 2–4 tuần; nếu là vấn đề tổ chức,
escalate. Burnout là tín hiệu hệ thống, không phải yếu đuối cá nhân.

---

### Q20. Inclusion và đa dạng: làm thực chất thế nào? [EM]

**Trả lời:** Không chỉ tuyển cho đủ số. Tạo điều kiện để mọi người đóng góp: tiêu chí đánh giá
rõ, phân công công bằng, meeting có người điều phối, tài liệu dễ tiếp cận, và xử lý hành vi loại
trừ. Kiểm tra ai được giao việc visible, ai bị ngắt lời, ai không được thăng tiến.

Tuyển dụng: JD trung tính, panel đa dạng, scorecard, đào tạo bias. Đo bằng dữ liệu (tỉ lệ ứng
viên, giữ chân, thăng tiến) nhưng cẩn thận privacy. Inclusion là hành vi hằng ngày, không phải
chiến dịch truyền thông.

---

### Q21. Thiết kế team ownership và ranh giới? [EM]

**Trả lời:** Team nên sở hữu **một domain/service đầu-cuối**, gồm code, vận hành, on-call, và
chất lượng dữ liệu. Ranh giới rõ qua API/event contract, không chia sẻ DB tùy tiện. Mỗi service
có owner, SLO, runbook, và kênh hỗ trợ.

```text
Team Orders: order API, DB, worker, on-call, SLO
Team Payments: payment API, provider integration, ledger
Interface: event OrderPlaced, API /payments
```

Tránh team "chỉ làm feature" mà không vận hành (đẩy nợ cho ops). Tránh quá nhiều team nhỏ với
dependency chéo. Xem lại ranh giới khi coupling tăng hoặc ownership mơ hồ.

---

### Q22. Manager of managers khác gì? [SM]

**Trả lời:** Chuyển từ quản lý cá nhân sang **quản lý hệ thống quản lý**. Không còn 1:1 với
toàn bộ kỹ sư; phát triển các EM, đảm bảo tiêu chuẩn nhất quán, phân bổ nguồn lực, và kết nối
chiến lược. Thời gian dành cho chiến lược, org design, stakeholder cấp cao, ngân sách.

Kỹ năng mới: coaching manager, đọc tín hiệu qua nhiều lớp, ra quyết định với thông tin không
đầy đủ, và xử lý xung đột giữa team. Tránh micro-manage hoặc nhảy qua EM để sửa việc nhỏ. Đo
bằng sức khỏe org, delivery, talent retention, và kết quả kinh doanh — không chỉ output.

---

### Q23. Truyền đạt tin xấu từ cấp trên xuống? [EM]

**Trả lời:** Nhanh, trung thực, có ngữ cảnh và hành động. Nói điều mình biết, điều chưa biết, và
khi nào sẽ cập nhật. Không giữ bí mật quá lâu để "ổn định" — tin đồn tệ hơn. Không hứa những
điều ngoài tầm kiểm soát.

```text
"Chúng ta không đạt mục tiêu Q3. Lý do: X. Ảnh hưởng: Y.
Điều đang làm: Z. Anh sẽ cập nhật vào thứ Sáu."
```

Cho không gian để hỏi; thừa nhận cảm xúc. Với tin ảnh hưởng trực tiếp (layoff, đổi sếp), thông
báo riêng trước. Sau đó theo dõi tác động và hỗ trợ team.

---

### Q24. Feedback lên cấp trên và đồng nghiệp? [EM]

**Trả lời:** Feedback phải **cụ thể, kịp thời, có tác động**, và đưa ra với thiện ý. Dùng SBI:
Situation – Behavior – Impact. Hỏi trước nếu cần ("anh có 10 phút để em góp ý không?"). Với cấp
trên, tập trung vào quan sát và đề xuất, không phán xét con người.

```text
"Trong buổi review hôm qua (S), khi anh ngắt lời bạn X (B),
bạn ấy không nói tiếp được (I). Em đề xuất để từng người trình bày hết ý."
```

Nếu không được tiếp nhận, ghi lại và cân nhắc kênh phù hợp (skip-level, HR) khi ảnh hưởng nghiêm
trọng. Không dùng "radical candor" như cái cớ để thiếu tôn trọng.

---

## 3. Tuyển dụng và onboarding

### Q25. Thiết kế scorecard tuyển dụng? [EM]

**Trả lời:** Scorecard định nghĩa **kỳ vọng quan sát được** cho từng năng lực, neo theo level.
Ví dụ Middle backend: coding, thiết kế module, DB, testing, giao tiếp, ownership. Mỗi tiêu chí
có mô tả mức 1–4 và câu hỏi/bài tập tương ứng.

| Năng lực | Trọng số | Bằng chứng |
|---|---:|---|
| Coding/quality | 30% | Bài code, test, edge case |
| Thiết kế/DB | 25% | System design nhỏ, trade-off |
| Debug/vận hành | 20% | Tình huống sự cố |
| Giao tiếp | 15% | Giải thích, viết |
| Ownership/học hỏi | 10% | Kinh nghiệm thật |

Dùng cùng bộ câu cho mọi ứng viên cùng level để so sánh công bằng. Ghi bằng chứng, không ghi
cảm nhận. Scorecard giúp giảm bias và giúp ứng viên biết kỳ vọng.

---

### Q26. Vòng phỏng vấn kỹ thuật nên đánh giá gì? [EM]

**Trả lời:** Đánh giá **cách nghĩ và cách làm**, không đố mẹo. Bài code nên giống công việc:
đọc hiểu, viết hàm, test, xử lý edge case, giao tiếp. Cho phép dùng tài liệu/IDE như thực tế nếu
vị trí không yêu cầu nhớ API.

Cấu trúc: 5 phút làm rõ yêu cầu → 20 phút code → 10 phút test/review → 5 phút câu hỏi. Đánh giá:
correctness, clarity, test, trade-off, phản ứng khi gặp lỗi. Tránh bài "đảo bit" không liên quan
công việc. Với senior, thêm thiết kế và tình huống vận hành.

---

### Q27. Giảm bias trong tuyển dụng? [EM]

**Trả lời:** Dùng cấu trúc: cùng câu hỏi, scorecard, nhiều interviewer độc lập, ghi bằng chứng
trước khi thảo luận. Đào tạo về bias (halo, similarity, anchoring, confirmation). Panel đa dạng;
không để một người quyết toàn bộ.

Ẩn thông tin không liên quan khi đánh giá (trường, tuổi, giới tính) nếu có thể; tập trung vào
bằng chứng công việc. Kiểm tra JD/ngôn ngữ tuyển dụng. Theo dõi funnel để phát hiện rơi rớt bất
thường. Bias không biến mất hoàn toàn, nhưng quy trình tốt làm giảm tác động.

---

### Q28. Debrief và ra quyết định tuyển? [EM]

**Trả lời:** Mỗi interviewer ghi scorecard **trước** khi họp để tránh anchoring. Debrief: đọc
bằng chứng theo từng tiêu chí, không tranh luận cảm tính; người điều phối giữ trung lập. Quyết
định theo ngưỡng đã định, không "vớt" vì cần người.

Phân biệt **không đủ bằng chứng** với **bằng chứng tiêu cực**. Nếu nghi ngờ, có thể thêm vòng
tập trung vào điểm yếu, nhưng tránh kéo dài quá mức. Ghi lý do và feedback cho ứng viên (trong
phạm vi phù hợp). Đo chất lượng tuyển qua hiệu suất sau 6–12 tháng và tỉ lệ pass thử việc.

---

### Q29. Tuyển senior hay junior? Xây team mix thế nào? [EM]

**Trả lời:** Theo **công việc thực tế** và khả năng phát triển người. Senior giúp giải bài toán
khó, thiết kế, mentor; junior mang năng lượng, chi phí thấp, nhưng cần thời gian. Team toàn
senior dễ thiếu người làm vận hành/chi tiết và tốn chi phí; toàn junior dễ thiếu định hướng.

```text
Team 6 người: 1 lead, 2 senior, 2 middle, 1 junior + mentor rõ
Tỉ lệ không cố định; phụ thuộc roadmap và on-call
```

Đảm bảo mỗi junior có mentor và công việc phù hợp, không chỉ việc "phụ". Dự báo 6–12 tháng để
tránh tắc nghẽn khi senior nghỉ. Tuyển người phù hợp văn hóa học hỏi, không chỉ khớp stack.

---

### Q30. Sourcing và employer branding? [EM]

**Trả lời:** Kênh hiệu quả thường là **referral, cộng đồng kỹ thuật, nội dung**, không chỉ job
board. Xây thương hiệu bằng: bài viết kỹ thuật thật, open source, meetup, minh bạch quy trình
tuyển, và trải nghiệm ứng viên tốt.

Đo funnel: source → apply → interview → offer → accept, thời gian mỗi bước, tỉ lệ pass. Viết JD
rõ level, phạm vi, stack, và điều kiện làm việc; tránh "rockstar" hoặc yêu cầu phi thực tế. Trả
lời ứng viên đúng hẹn, kể cả khi từ chối — thị trường nhỏ và uy tín lan nhanh.

---

### Q31. Onboarding 30–60–90 ngày? [EM]

**Trả lời:** Mục tiêu: 30 ngày hiểu hệ thống/quy trình và ship thay đổi nhỏ; 60 ngày sở hữu một
module/feature; 90 ngày độc lập, on-call phụ, và đóng góp cải tiến.

```text
Tuần 1: môi trường, tài liệu, buddy, 1 task nhỏ
Ngày 30: hiểu kiến trúc, đã merge 2-3 PR, biết cách escalate
Ngày 60: sở hữu feature nhỏ, review được code người khác
Ngày 90: on-call phụ, đề xuất cải tiến, feedback onboarding
```

Gán buddy, có checklist, lịch 1:1 với stakeholder. Đo time-to-first-PR, time-to-independent,
feedback 30 ngày. Onboarding tệ là nguyên nhân nghỉ việc sớm — đầu tư vào tài liệu và người kèm.

---

### Q32. Tuyển sai người, xử lý thế nào? [EM]

**Trả lời:** Phân biệt **chưa phù hợp do onboarding/context** với **không phù hợp vai trò**. Nếu
do context: cải thiện hướng dẫn, giao việc phù hợp, theo dõi. Nếu do năng lực/hành vi: feedback
cụ thể, kỳ vọng rõ, thời hạn, hỗ trợ; dùng quy trình chính thức nếu cần.

Không giữ người sai quá lâu vì "thương" — ảnh hưởng team và cá nhân. Nếu quyết định chấm dứt,
làm đúng luật/HR, tôn trọng, và hỗ trợ chuyển tiếp trong khả năng. Rút kinh nghiệm cho scorecard
và vòng phỏng vấn, nhưng tránh đổ lỗi cá nhân.

---

## 4. Hiệu suất và phát triển

### Q33. Đánh giá hiệu suất công bằng? [EM]

**Trả lời:** Dựa trên **kỳ vọng của level** + bằng chứng trong kỳ, không dựa ấn tượng vài tuần
cuối. Có goal rõ từ đầu, feedback thường xuyên, self-review, peer feedback, và calibration giữa
các manager để tránh lệch chuẩn.

```text
Kết quả: mục tiêu đạt bao nhiêu, chất lượng, tác động
Hành vi: collaboration, ownership, mentoring
Phát triển: kỹ năng mới, mức tự chủ
```

Tránh đánh giá theo "visibility" (người nói nhiều) hoặc số giờ. Với người làm nền tảng/on-call,
ghi nhận tác động gián tiếp. Rating phải đi kèm ví dụ cụ thể; nếu bất ngờ với nhân viên, đó là
lỗi feedback trong năm.

---

### Q34. Đặt mục tiêu OKR thế nào cho team kỹ thuật? [EM]

**Trả lời:** Objective là định hướng có ý nghĩa; Key Results là kết quả đo được, không phải
danh sách task. Phân biệt **commitment** (phải đạt) và **aspirational** (stretch). Team kỹ thuật
cần OKR gắn với người dùng/hệ thống, không chỉ "nâng cấp framework".

```text
O: Giảm rủi ro vận hành mùa cao điểm
KR1: p95 checkout < 400ms trong 95% thời gian
KR2: 0 sự cố P1 do thay đổi schema
KR3: 90% alert có runbook và actionable
```

Không dùng OKR để xếp hạng cá nhân; tránh đặt KR dễ đạt hoặc đo bằng output. Review hàng tháng,
điều chỉnh khi hoàn cảnh đổi; nhưng không đổi liên tục làm mất trọng tâm.

---

### Q35. Chuẩn bị cho Senior lên Tech Lead? [L]

**Trả lời:** Mở rộng phạm vi từ **task → team**: thiết kế ảnh hưởng nhiều người, review/mentor,
giao tiếp stakeholder, ra quyết định dưới mơ hồ. Giao dần việc điều phối dự án nhỏ, để họ chủ trì
design review và xử lý xung đột.

Đánh giá: có tạo ra kết quả qua người khác không, có nâng chuẩn team không, có xử lý conflict
không, có biết nói "không" không. Không chỉ dựa vào code giỏi. Nếu chưa sẵn sàng, nói rõ khoảng
cách và lộ trình; tránh thăng chức vì "đến lượt".

---

### Q36. Xây career framework cho Python engineers? [EM]

**Trả lời:** Định nghĩa các bậc theo **phạm vi ảnh hưởng, độ phức tạp, mức tự chủ, tác động**,
không chỉ năm kinh nghiệm. Có hai track: IC (senior → staff → principal) và management (TL →
EM → SM). Mỗi bậc có mô tả hành vi và ví dụ.

```text
Middle: sở hữu feature, chọn giải pháp trong module
Senior: sở hữu service, giải bài toán mơ hồ, mentor
Staff: ảnh hưởng nhiều team, đặt chuẩn, giải bài toán org
```

Framework dùng cho phát triển, không phải "bảng lương". Review định kỳ, đảm bảo công bằng giữa
track. Cho nhân viên biết tiêu chí bậc tiếp theo và bằng chứng cần có.

---

### Q37. Coaching bằng mô hình GROW? [EM]

**Trả lời:** Goal: điều người học muốn đạt. Reality: hiện trạng, đã thử gì. Options: các lựa
chọn, trade-off. Will: hành động cụ thể, thời hạn, hỗ trợ.

```text
G: "6 tháng tới em muốn dẫn dắt một dự án nhỏ."
R: "Hiện em mạnh code, chưa từng chia việc hay nói trước team."
O: "Nhận một feature 4 tuần, chủ trì design review, mentor 1 bạn."
W: "Bắt đầu tháng sau; họp checkpoint 2 tuần/lần."
```

Coaching không phải đưa lời khuyên ngay; hỏi để người học tự thấy. Phù hợp khi người học có động
lực và cần mở rộng góc nhìn. Với vấn đề hành vi nghiêm trọng, dùng feedback trực tiếp, không
coaching vòng vo.

---

### Q38. Feedback khó nói thế nào? [EM]

**Trả lời:** Chuẩn bị bằng chứng, chọn thời điểm riêng, mô tả hành vi không gán nhãn nhân cách,
nêu tác động, và đề xuất kỳ vọng. Hỏi góc nhìn của họ. Ghi lại và theo dõi.

```text
S: "Trong buổi demo hôm qua"
B: "khi khách hỏi về lỗi, em nói 'không phải việc của tôi'"
I: "khách mất tin tưởng, team phải giải thích lại"
Yêu cầu: "lần sau em chủ động ghi nhận và hẹn follow-up"
```

Không dùng "mọi người nói rằng" để né tránh; không so sánh với đồng nghiệp. Feedback hai chiều:
hỏi họ cần gì để thay đổi. Nếu hành vi lặp lại, nêu hậu quả rõ ràng và bước tiếp theo.

---

### Q39. Quản lý high performer và low performer cùng lúc? [EM]

**Trả lời:** Không đối xử "cào bằng". High performer cần thử thách, phạm vi, ghi nhận, và lộ
trình; đừng dồn hết việc khó cho họ đến burnout. Low performer cần kỳ vọng rõ, hỗ trợ, và thời
hạn; đừng để việc của họ chuyển sang người giỏi mà không giải quyết gốc.

Công bằng là **cùng tiêu chí, khác hỗ trợ**. Minh bạch cách đánh giá để team không cảm thấy thiên
vị. Theo dõi tải và cơ hội của cả hai. Nếu low performer không cải thiện, xử lý theo quy trình;
nếu high performer muốn nghỉ, xử lý sớm (xem Q16).

---

### Q40. Succession planning cho vị trí lead/manager? [SM]

**Trả lời:** Xác định **vị trí rủi ro** (single point of failure) và năng lực kế cận. Với mỗi vị
trí, có 1–2 người sẵn sàng trong 6–12 tháng, lộ trình phát triển cụ thể (không chỉ "học thêm").

```text
Vị trí: Tech Lead team Payments
Hiện tại: A (ổn định), B (sẵn sàng 2/3 tiêu chí)
Hành động: B chủ trì dự án X, mentor bởi A, review cuối kỳ
Dự phòng: C (middle senior) tham gia design review
```

Phân tán kiến thức, tài liệu hóa, luân phiên on-call. Succession không phải chỉ khi người ta
nghỉ; cần cho mùa cao điểm, dự án mới, và phát triển tổ chức. Review 6 tháng/lần.

---

## 5. Delivery và vận hành

### Q41. Dùng DORA metrics thế nào cho đúng? [EM]

**Trả lời:** Bốn chỉ số: deployment frequency, lead time for changes, change failure rate, time
to restore. Dùng để **hiểu hệ thống delivery**, không để xếp hạng cá nhân/team.

```text
Deploy freq: 5/ngày
Lead time:   commit -> production p50 4h
CFR:         8% (deploy gây incident cần hotfix/rollback)
MTTR:        p50 25 phút
```

Đo tự động từ CI/CD, tránh thủ công. Cải thiện bằng: PR nhỏ, test ổn định, pipeline nhanh,
feature flag, canary. Không tăng deploy frequency bằng cách bỏ qua kiểm soát. Bối cảnh quan trọng:
hệ thống regulated có thể khác, nhưng vẫn đo để cải thiện.

---

### Q42. Estimate và cam kết deadline thế nào? [EM]

**Trả lời:** Estimate là **dự báo có bất định**, không phải lời hứa. Dùng range (best/likely/
worst), tách phần chưa rõ, và cập nhật khi học thêm. Với deadline cố định, thương lượng scope
trước, không thương lượng chất lượng một cách mù quáng.

```text
"Feature A: 3-5 tuần (70% confidence), phụ thuộc API bên thứ ba.
Nếu cần chắc chắn hơn, làm spike 3 ngày trước."
```

Ghi giả định và dependency. Buffer không nên giấu trong từng task; nói rõ ở cấp dự án. Khi trễ,
báo sớm với phương án (cắt scope, thêm người có chi phí ramp-up, dời ngày). Không dùng deadline
làm đòn bẩy liên tục — sẽ mất dự báo.

---

### Q43. Ưu tiên roadmap thế nào? [EM]

**Trả lời:** Kết hợp giá trị, chi phí, rủi ro, và học hỏi. Dùng RICE (Reach, Impact, Confidence,
Effort) hoặc WSJF (Cost of Delay / Job Size), nhưng không máy móc. Luôn dành chỗ cho vận hành,
bảo mật, nợ kỹ thuật, và việc không lường trước.

```text
RICE = (Reach * Impact * Confidence) / Effort
```

Nói rõ **điều gì không làm** và vì sao. Kiểm tra dependency và capacity thật (trừ on-call, nghỉ
phép, hỗ trợ). Review hàng tháng; bảo vệ 1–2 ưu tiên lớn khỏi bị cắt ngang. Roadmap là công cụ
giao tiếp, không phải hợp đồng cứng.

---

### Q44. Xử lý dependency giữa nhiều team? [EM]

**Trả lời:** Làm rõ **interface, owner, timeline** bằng văn bản. Ưu tiên giảm phụ thuộc: API/
event contract, mock/stub, feature flag, hoặc tách công việc để team không chờ nhau.

```text
Team A cần API từ team B:
- Contract + mock để A làm song song
- Ngày B sẵn sàng, SLA hỗ trợ
- Điểm kiểm tra chung hàng tuần
- Escalation nếu trễ > 3 ngày
```

Tránh "dependency" chỉ tồn tại trong đầu người. Dùng bảng dependency trong planning, và tính
rủi ro vào estimate. Khi xung đột ưu tiên, đưa lên cấp có thẩm quyền với dữ liệu tác động.

---

### Q45. Quản lý on-call và sự cố ở cấp team? [EM]

**Trả lời:** On-call phải có: rotation hợp lý, runbook, quyền truy cập, escalation, và thời gian
nghỉ bù. Alert chỉ cho việc cần hành động; giảm nhiễu định kỳ. Người mới on-call phụ trước khi
trực chính.

Đo số trang/người/tuần, tỉ lệ actionable, thời gian ack, và burnout. Sau incident: postmortem
blameless, action item có owner. EM bảo vệ team khỏi "anh hùng cứu hỏa" văn hóa; khuyến khích tự
động hóa và cải thiện hệ thống. On-call là một phần công việc, không phải nghĩa vụ ngoài giờ
miễn phí.

---

### Q46. Chất lượng và tốc độ: cân bằng thế nào? [EM]

**Trả lời:** Không phải đánh đổi tuyệt đối: chất lượng kém làm chậm về sau. Xác định **mức chất
lượng phù hợp** theo rủi ro: code path tiền/thanh toán cần test/review chặt; prototype nội bộ có
thể nhanh hơn nhưng phải có nhãn và kế hoạch.

Đầu tư vào: CI nhanh, test ổn định, review nhỏ, feature flag, rollback dễ. Đo lead time và
change failure rate cùng lúc; nếu tăng tốc mà CFR tăng, đó là nợ. Nói "không" với scope không
thực tế thay vì cắt test/quality một cách âm thầm.

---

### Q47. Nhịp planning/agile nào phù hợp? [EM]

**Trả lời:** Chọn nhịp theo **độ bất định và vòng phản hồi**, không theo giáo điều. Team ổn định,
công việc rõ: sprint 2 tuần + Kanban cho vận hành. Nhiều bất định: chu kỳ ngắn hơn, discovery
song song, demo thường xuyên.

```text
Weekly: ưu tiên, rủi ro, dependency
Bi-weekly: planning + demo + retro
Daily: standup ngắn, tập trung blocker
Monthly: roadmap, sức khỏe team, nợ
```

Tránh ceremony hình thức: retro không action, standup đọc status, planning không có mục tiêu.
Linh hoạt khi có incident/mùa cao điểm. Agile là giảm lãng phí và tăng học hỏi, không phải
"chạy đua sprint".

---

### Q48. Release management và change failure? [EM]

**Trả lời:** Release nhỏ, thường xuyên, có kiểm soát: CI/CD, test, canary, feature flag, rollback
trong vài phút, và thông báo. Với thay đổi rủi ro (schema, security), có checklist và người
review độc lập.

Theo dõi CFR, thời gian rollback, và incident do change. Nếu CFR cao, tìm nguyên nhân hệ thống:
test thiếu, review qua loa, deploy phức tạp, thiếu quan sát. Đừng chỉ thêm phê duyệt — tăng
friction mà không giảm rủi ro. Sau sự cố, cập nhật quy trình và test.

---

## 6. Stakeholder và sản phẩm

### Q49. Nói "không" với stakeholder thế nào? [EM]

**Trả lời:** Nói "không" với **yêu cầu cụ thể**, không phủ định mục tiêu. Hiểu mục tiêu thật,
trình bày trade-off và phương án thay thế, dùng dữ liệu (capacity, rủi ro, chi phí). Đề xuất
điều kiện để làm được (giảm scope, dời ưu tiên khác, thêm nguồn lực).

```text
"Không thể làm A trong 2 tuần mà vẫn giữ chất lượng.
Có thể: (1) làm phần lõi 2 tuần, (2) dời B, (3) thêm 1 người.
Anh/chị muốn ưu tiên nào?"
```

Không né tránh rồi trễ hạn. Ghi lại quyết định và hệ quả. Với yêu cầu phi thực tế lặp lại, làm
rõ nguyên tắc ưu tiên ở cấp cao hơn.

---

### Q50. Chuyển mục tiêu kinh doanh thành kế hoạch kỹ thuật? [EM]

**Trả lời:** Hỏi: người dùng nào, vấn đề gì, đo bằng gì, ràng buộc nào. Từ đó xác định capability
cần xây, rủi ro kỹ thuật, và thứ tự học. Không bắt đầu từ công nghệ.

```text
Mục tiêu: giảm 20% thời gian xử lý đơn
Capability: tự động validate, gợi ý, theo dõi trạng thái
Kỹ thuật: API, workflow, event, dashboard
Đo: thời gian trung bình, tỉ lệ lỗi, adoption
```

Chia thành lát cắt nhỏ có giá trị, đặt giả thuyết và cách đo. Review với product/data. Ghi rõ
điều gì **không** nằm trong phạm vi. Kế hoạch kỹ thuật phải nói ngôn ngữ kết quả, không chỉ
danh sách công nghệ.

---

### Q51. Báo cáo tiến độ khi dự án trễ? [EM]

**Trả lời:** Báo sớm, ngắn, có dữ kiện và phương án. Cấu trúc: hiện trạng, nguyên nhân, tác động,
lựa chọn, đề xuất, và mốc cập nhật tiếp theo. Không giấu để "cố gắng thêm".

```text
"Hiện tại trễ 1 tuần do API bên thứ ba chậm.
Ảnh hưởng: demo ngày 15/11.
Phương án: (1) demo phần lõi với mock, (2) dời 1 tuần.
Đề xuất: (1), cập nhật thứ Tư."
```

Nhận trách nhiệm phần thuộc về mình, không đổ lỗi. Với stakeholder, tập trung vào quyết định họ
cần đưa ra. Sau đó cập nhật đúng hẹn — mất niềm tin thường do im lặng, không chỉ do trễ.

---

### Q52. Yêu cầu thay đổi liên tục, team kiệt sức? [EM]

**Trả lời:** Phân loại thay đổi: must-have do pháp lý/sự cố, nên có, hay "ý tưởng mới". Thiết lập
quy trình: cửa sổ thay đổi, tiêu chí, người quyết định, và chi phí cơ hội. Bảo vệ sprint goal
bằng cách nói rõ điều gì sẽ bị hoãn.

Với stakeholder, cho thấy tác động lên tiến độ/chất lượng bằng dữ liệu. Dùng feature flag để
giảm rủi ro thay đổi. Nếu thay đổi là bản chất môi trường, thiết kế team/quy trình chịu được
(mô-đun hóa, release nhỏ), không chỉ tăng giờ làm.

---

### Q53. Quan hệ với Product, Design, Data? [EM]

**Trả lời:** Cùng chịu kết quả, khác chuyên môn. Thiết lập nhịp: discovery chung, review
feasibility sớm, định nghĩa metric, và retro liên chức năng. Kỹ thuật đóng góp vào "làm thế nào"
và cả "nên làm gì" khi liên quan chi phí/rủi ro.

Tránh thái độ "chỉ nhận ticket". Đưa lựa chọn kỹ thuật có tác động người dùng (độ trễ, độ tin
cậy). Với data, thống nhất định nghĩa event/metric trước khi build. Xung đột thì quay về mục
tiêu chung và dữ liệu, không về phe phái.

---

### Q54. Giao tiếp với executive? [EM]

**Trả lời:** Ngắn, tập trung vào **kết quả, rủi ro, quyết định cần**. Bắt đầu bằng kết luận,
sau đó 2–3 dữ kiện, rồi yêu cầu. Tránh thuật ngữ kỹ thuật không cần thiết; dùng ẩn dụ và con số
có ngữ cảnh.

```text
"Chúng ta có thể ra mắt 15/11. Rủi ro: phụ thuộc API đối tác.
Cần quyết định: chấp nhận fallback hay dời 1 tuần.
Nếu fallback, ảnh hưởng 5% người dùng."
```

Chuẩn bị cho câu hỏi "nếu sai thì sao". Không đưa quá nhiều chi tiết; có phụ lục cho ai muốn đào
sâu. Theo dõi cam kết và cập nhật. Executive tin vào sự nhất quán và minh bạch hơn là lạc quan
quá mức.

---

## 7. Tổ chức, chiến lược, ngân sách

### Q55. Thiết kế org và span of control? [SM]

**Trả lời:** Tổ chức theo **giá trị/domain** trước, sau đó theo địa lý/chức năng nếu cần. Mỗi
team có mission, owner, interface rõ. Span of control hợp lý: EM thường 5–8 người; manager of
managers 3–6 EM (tùy độ trưởng thành).

```text
Director
├── EM Payments (7 người)
├── EM Orders (6 người)
└── EM Platform (5 người + 2 EM)
```

Tránh team quá nhỏ (thiếu on-call) hoặc quá lớn (khó phối hợp). Xem lại khi product/domain thay
đổi. Org design là công cụ chiến lược: nếu muốn ưu tiên X, đặt owner và quyền quyết định cho X.

---

### Q56. Lập ngân sách kỹ thuật? [SM]

**Trả lời:** Gồm người (lương, tuyển, đào tạo), hạ tầng (compute, storage, egress, DB, observability),
vendor/license, công cụ, và dự phòng. Dự báo theo usage growth và cam kết kinh doanh.

```text
Ngân sách năm = people + infra + vendors + contingency (10-15%)
Theo dõi unit cost: USD/1k request, USD/tenant, USD/engineer
```

Review hàng tháng; cảnh báo khi vượt. Tối ưu bằng right-size, commitment discount, tier storage,
giảm log/metric thừa — nhưng không cắt backup/security. Khi cần tăng, trình bày ROI/rủi ro, không
chỉ "cần thêm tiền".

---

### Q57. Đàm phán vendor và tránh lock-in? [SM]

**Trả lời:** Xác định yêu cầu thật (SLA, bảo mật, dữ liệu, tích hợp), so sánh ít nhất 2–3 lựa
chọn, và hiểu chi phí 3 năm gồm egress/support. Đàm phán dựa trên dữ kiện usage và phương án
thay thế (BATNA), không chỉ giá niêm yết.

```text
Điều khoản cần rõ: SLA, thời gian khắc phục, dữ liệu sở hữu, export,
giá tăng, chấm dứt, bảo mật, tuân thủ, hỗ trợ.
```

Giảm lock-in bằng interface trừu tượng, dữ liệu export được, chuẩn mở, và kế hoạch di chuyển.
Với vendor quan trọng, có người sở hữu quan hệ và review định kỳ. Đừng chọn vendor chỉ vì quen
hoặc quà tặng.

---

### Q58. Headcount planning? [SM]

**Trả lời:** Từ roadmap và năng lực hiện tại: khối lượng công việc, kỹ năng thiếu, on-call, và
tỉ lệ nghỉ dự kiến. Tính **ramp-up** (junior 3–6 tháng, senior 1–3 tháng) và chi phí tuyển.

```text
Capacity thực = headcount * (1 - on-call/meeting/nghỉ) * utilization
Nhu cầu = feature + vận hành + nợ + hỗ trợ
Gap -> tuyển/contract/đào tạo/cắt scope
```

Ưu tiên vị trí mở khóa nhiều việc (platform, security, data). Tránh tuyển trước rồi tìm việc.
Có kế hoạch kế nhiệm và phân bổ theo quý; review khi ưu tiên kinh doanh đổi. Nói rõ trade-off
nếu không có đủ người: scope, thời gian, hay rủi ro.

---

### Q59. Chiến lược kỹ thuật 1–3 năm? [SM]

**Trả lời:** Bắt đầu từ mục tiêu kinh doanh và rủi ro lớn, không từ công nghệ. Xác định 3–5
**bets** có tác động, mỗi bet có lý do, kết quả mong đợi, chi phí, và cách đo. Gắn với lộ trình
năng lực (hiring, platform, security, data).

```text
Bet 1: Nền tảng multi-tenant ổn định -> mở phân khúc enterprise
Bet 2: Giảm chi phí hạ tầng 20% -> unit cost cạnh tranh
Bet 3: Nâng chuẩn bảo mật -> đáp ứng SOC2
```

Truyền đạt bằng ngôn ngữ sản phẩm; review hàng quý. Chấp nhận rằng chiến lược sẽ sai một phần;
đặt dấu hiệu để điều chỉnh. Tránh danh sách 20 sáng kiến không ưu tiên — đó là thiếu chiến lược.

---

### Q60. Platform team hay product team sở hữu hạ tầng? [SM]

**Trả lời:** Platform team cung cấp **self-service capability** (deploy, observability, auth,
data), giảm gánh nặng lặp lại. Product team sở hữu trải nghiệm và domain. Ranh giới: platform
cung cấp "paved road", product có quyền tự chủ trong guardrail.

```text
Platform: CI/CD template, logging, secrets, service template, SLO dashboard
Product: feature, domain logic, on-call cho service của mình
```

Tránh platform team thành "ticket queue" hoặc gatekeeper. Đo adoption, thời gian onboard service
mới, ticket giảm. Platform phải đối xử với product như khách hàng nội bộ, có roadmap và feedback.

---

### Q61. Lãnh đạo bảo mật và tuân thủ? [SM]

**Trả lời:** Xây chương trình: owner bảo mật, threat model, secure SDLC, dependency scanning,
pentest, incident response, đào tạo, và audit. Tuân thủ (SOC2/ISO/GDPR) là quy trình liên tục,
không phải dự án một lần.

```text
Risk register -> owner -> mitigation -> deadline -> verify
```

Ưu tiên theo rủi ro thực tế, không chỉ checklist. Ngân sách cho công cụ/người; văn hóa báo lỗi
không trừng phạt. Khi có sự cố, minh bạch với khách hàng theo quy định. Lãnh đạo phải làm mẫu:
không bỏ qua quy trình khi tiện.

---

### Q62. Tối ưu chi phí mà không hại team? [SM]

**Trả lời:** Đo unit cost và tìm lãng phí: tài nguyên idle, môi trường không dùng, log/metric
quá mức, license trùng, kiến trúc kém hiệu quả. Ưu tiên thay đổi ít rủi ro, có owner và thời
hạn.

```text
- Right-size + autoscale
- Spot/commitment cho workload phù hợp
- Tier storage, TTL log
- Giảm query/scan thừa
```

Không cắt người/on-call/backup/security để đạt số ngắn hạn. Truyền đạt mục tiêu và cho team tham
gia ý tưởng; tránh áp chỉ tiêu giảm chi phí vô lý. Theo dõi tác động lên SLO và burnout.

---

## 8. Văn hóa và tình huống khó

### Q63. Xây văn hóa viết tài liệu? [EM]

**Trả lời:** Bắt đầu từ nhu cầu thật: onboarding, quyết định, runbook, API. Đặt chuẩn tối thiểu:
ADR cho quyết định lớn, README cho service, runbook cho alert, postmortem sau sự cố. Viết ngắn,
có owner, và được cập nhật.

Lãnh đạo làm mẫu: viết và tham chiếu tài liệu trong meeting; khen tài liệu tốt; đưa vào definition
of done. Tránh "tài liệu cho có" — nếu không ai đọc, cắt bớt. Đo bằng thời gian onboarding, số
câu hỏi lặp lại, và chất lượng quyết định.

---

### Q64. Accountability mà không đổ lỗi? [EM]

**Trả lời:** Phân biệt **trách nhiệm** (sở hữu kết quả, hành động tiếp theo) với **đổ lỗi** (quy
kết tội cá nhân). Sau sự cố: xem hệ thống/quyết định, nhưng vẫn yêu cầu owner hành động. Nói rõ
kỳ vọng và hậu quả nếu hành vi lặp lại.

```text
"Chúng ta sẽ sửa test và thêm alert (hệ thống).
Anh X sở hữu việc cập nhật runbook trước thứ Sáu (trách nhiệm).
Không ai bị kỷ luật vì báo lỗi sớm."
```

Văn hóa trưởng thành: thừa nhận sai, sửa nhanh, học. Nhưng không dung túng hành vi cố ý/thiếu
trách nhiệm lặp lại — điều đó làm xói mòn niềm tin.

---

### Q65. Khi giá trị công ty xung đột với quyết định kỹ thuật? [SM]

**Trả lời:** Làm rõ giá trị nào đang xung đột và mức độ. Ví dụ: "move fast" vs cam kết bảo mật/
chất lượng. Nêu hậu quả cụ thể và lựa chọn, không chỉ trích. Tìm cách đáp ứng cả hai ở mức hợp
lý (scope nhỏ, flag, kiểm soát bù).

Nếu xung đột nghiêm trọng và lặp lại, đưa lên cấp có thẩm quyền với dữ liệu; ghi lại quyết định.
Với vấn đề đạo đức/pháp lý, không thỏa hiệp — tìm kênh phù hợp (legal, HR, board). Lãnh đạo
giỏi không chỉ chọn phe; họ làm rõ trade-off và bảo vệ nguyên tắc quan trọng.

---

## 9. Tình huống STAR

> Trả lời theo **Situation – Task – Action – Result**, ưu tiên tình huống thật, số liệu, và bài
> học. Không bịa; nếu chưa có, nói rõ và mô tả cách sẽ làm.

### L1. Một dự án bạn dẫn bị trễ nghiêm trọng. Bạn xử lý thế nào?

**Gợi ý:** Nêu bối cảnh, phát hiện sớm hay muộn, cách tách nguyên nhân, phương án (cắt scope, dời,
thêm người), cách giao tiếp stakeholder, kết quả (ngày, chất lượng, niềm tin), bài học (estimate,
dependency, checkpoint).

---

### L2. Bạn phải sa thải hoặc đưa ai đó vào PIP. Kể lại.

**Gợi ý:** Tập trung vào quy trình công bằng: kỳ vọng rõ, bằng chứng, hỗ trợ, thời hạn, giao tiếp
tôn trọng, tuân thủ HR. Nêu kết quả và bài học về tuyển dụng/feedback sớm. Không tiết lộ thông
tin nhạy cảm.

---

### L3. Bạn thuyết phục tổ chức đầu tư vào một thay đổi kỹ thuật lớn.

**Gợi ý:** Vấn đề + chi phí không làm, phương án, POC/số liệu, stakeholder, cách giảm rủi ro,
kết quả. Nêu cả phản đối và cách xử lý. Tránh chỉ nói "công nghệ mới tốt hơn".

---

### L4. Bạn xử lý xung đột giữa hai team/manager.

**Gợi ý:** Làm rõ mục tiêu chung, dữ kiện, tiêu chí; tách vấn đề con người khỏi kỹ thuật; thỏa
thuận interface/SLA; escalation nếu cần. Kết quả: quyết định, mối quan hệ, và cơ chế tránh lặp.

---

### L5. Bạn từng mắc sai lầm lớn trong vai trò lãnh đạo. Kể lại.

**Gợi ý:** Chọn sai lầm thật, không quá nhỏ. Nêu bối cảnh, bạn đã làm gì, hậu quả, cách sửa,
và thay đổi cụ thể sau đó. Thể hiện tự nhận thức, không phòng thủ. Tránh đổ lỗi hoàn cảnh.

---

### L6. Bạn xây một team mới từ đầu.

**Gợi ý:** Mục tiêu, tuyển dụng (scorecard), cơ cấu, onboarding, nhịp vận hành, chuẩn kỹ thuật,
cách đo sau 3–6 tháng. Nêu khó khăn (tuyển chậm, thiếu context) và cách xử lý.

---

### L7. Bạn phải nói không với một yêu cầu từ cấp trên.

**Gợi ý:** Hiểu mục tiêu thật, trình bày trade-off bằng dữ liệu, đề xuất phương án, giữ quan hệ.
Nêu kết quả và bài học về giao tiếp, ranh giới, và cách escalated.

---

### L8. Bạn cải thiện sức khỏe on-call/vận hành.

**Gợi ý:** Số liệu trước (số trang, MTTR, alert nhiễu), hành động (runbook, giảm alert, tự động
hóa, rotation), kết quả (giảm trang, giảm burnout, SLO), và cách duy trì.

---

## 10. Tài liệu tham khảo

- [`../python-production.md`](../python-production.md)
- [`./04-senior.md`](./04-senior.md) — nền tảng kỹ thuật
- [`./06-scenarios.md`](./06-scenarios.md) — tình huống thực chiến
- [`./README.md`](./README.md) — thang điểm và ma trận
- The Manager's Path (Camille Fournier)
- Staff Engineer (Will Larson)
- An Elegant Puzzle (Will Larson)
- Radical Candor (Kim Scott)
- High Output Management (Andy Grove)
- Google SRE: https://sre.google/books/
- DORA: https://dora.dev/
- LeadDev: https://leaddev.com/

---

*Tiếp theo: [`06-scenarios.md`](./06-scenarios.md) — 25 tình huống thực chiến và 60 câu rapid-fire
cho Middle đến Manager.*
