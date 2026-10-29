# Python Interview — Tình huống thực chiến

> 25 tình huống sâu cho Middle → Manager và 60 câu rapid-fire. Mỗi tình huống có **cách khai
> thác**, **hướng trả lời tốt**, **điểm cộng** và **red flag**. Dùng cho vòng tình huống, pair
> debugging, hoặc tự luyện nói.

---

## Mục lục

1. [Cách dùng bộ tài liệu](#1-cách-dùng-bộ-tài-liệu)
2. [Production debugging](#2-production-debugging)
3. [Code review và chất lượng](#3-code-review-và-chất-lượng)
4. [System design](#4-system-design)
5. [Incident, delivery và con người](#5-incident-delivery-và-con-người)
6. [Rapid-fire 60 câu](#6-rapid-fire-60-câu)
7. [Cách chấm điểm tình huống](#7-cách-chấm-điểm-tình-huống)
8. [Tài liệu tham khảo](#8-tài-liệu-tham-khảo)

---

## 1. Cách dùng bộ tài liệu

- **Ứng viên:** đọc đề, tự nói 3–5 phút, ghi lại giả thuyết và bước kiểm chứng. Sau đó so với
  hướng trả lời; bổ sung ví dụ thật của mình.
- **Interviewer:** đưa đề, để ứng viên hỏi làm rõ, đóng vai stakeholder khi cần. Chấm theo năng
  lực: **cấu trúc, ưu tiên, trade-off, giao tiếp, hành động**.
- **Team:** dùng làm buổi luyện tập nội bộ, hoặc biến thể thành bài tập onboarding.

Mỗi tình huống không có một đáp án duy nhất. Điểm cao khi ứng viên:

1. Làm rõ phạm vi và ràng buộc trước khi lao vào giải.
2. Nêu giả thuyết và cách kiểm chứng, không đoán mò.
3. Ưu tiên giảm tác động trước, root cause sau.
4. Nói rõ trade-off và điều kiện thành công.
5. Có ví dụ thật, số liệu, và bài học.

---

## 2. Production debugging

### S01. API p99 tăng từ 200ms lên 2s sau deploy, CPU thấp [M]

**Đề bài:** Deploy lúc 10:00. Đến 10:15, p99 của `/orders` tăng gấp 10, error rate 0.1%, CPU
25%, memory bình thường. Bạn có 15 phút để giảm tác động.

**Câu hỏi dẫn:** Bạn kiểm tra gì trước? Khi nào rollback? Làm sao xác nhận nguyên nhân?

**Hướng trả lời:**

- Xác nhận tác động: p50/p95/p99, error rate, số user ảnh hưởng, bắt đầu từ phiên bản nào.
- Rollback nếu p99 ảnh hưởng SLO/người dùng và chưa rõ nguyên nhân — mitigation trước.
- Nếu chưa rollback: so sánh trace trước/sau, xem span DB/external, pool wait, N+1, lock,
  serialization, DNS/TLS, feature flag.
- CPU thấp + latency cao gợi ý chờ I/O hoặc lock, không phải tính toán.
- Kiểm tra thay đổi config, migration, index, dependency version, traffic pattern.

**Điểm cộng:** nêu giả thuyết cụ thể và cách bác bỏ; dùng canary/flag để khoanh vùng; đo lại sau
khi sửa; thêm regression test/benchmark.

**Red flag:** "chắc do DB" rồi sửa mò; restart hàng loạt; không rollback dù ảnh hưởng lớn.

---

### S02. Memory tăng dần đến OOM trên worker [M]

**Đề bài:** Worker xử lý ảnh tăng RAM từ 300MB lên 2GB sau 6 giờ, bị OOM kill. Restart tạm ổn.

**Câu hỏi dẫn:** Phân biệt leak và workload? Dùng công cụ nào? Sửa gốc hay restart định kỳ?

**Hướng trả lời:**

- Xác định pattern: RAM theo số job, kích thước ảnh, thời gian, phiên bản.
- `tracemalloc`, `memray`, `objgraph`, `gc.get_objects`; so sánh snapshot sau vài giờ.
- Nghi vấn: cache/global không bound, queue không giới hạn, session/connection không đóng,
  exception giữ traceback, closure giữ ảnh lớn, `lru_cache` trên tham số lớn.
- Sửa: bound cache + TTL, context manager, chunk/stream, `weakref`, giới hạn concurrency.
- Restart định kỳ chỉ là giảm nhẹ; cần root cause. Đặt memory limit/alert.

**Điểm cộng:** hiểu RSS vs allocated; nêu cách tái hiện; kiểm tra cả dependency native (Pillow,
NumPy) và fragmentation.

**Red flag:** tăng RAM máy/restart cron và coi là xong; không có metric theo job.

---

### S03. Đơn hàng bị trừ tiền hai lần [M]

**Đề bài:** Một số khách bị charge 2 lần khi bấm "Thanh toán" hoặc khi mạng chậm. Log cho thấy
hai request đến cách nhau 300ms.

**Câu hỏi dẫn:** Nguyên nhân? Sửa ở client, API hay provider? Làm sao xử lý các case đã bị?

**Hướng trả lời:**

- Nguyên nhân: client retry/ double click; API không idempotent; provider timeout rồi retry;
  message duplicate.
- Sửa: idempotency key từ client/order, unique constraint, lưu trạng thái request; provider
  idempotency key; UI disable + xử lý `409/202`.
- Với case đã bị: đối soát ledger/provider, hoàn tiền, thông báo, ghi nhận.
- Phòng ngừa: test concurrent/duplicate, log `request_id`, cảnh báo lệch.

**Điểm cộng:** phân biệt "retry an toàn" với "retry mù"; nêu trạng thái `unknown` khi timeout;
không chỉ sửa UI.

**Red flag:** bảo "do user bấm nhanh"; không có unique constraint/idempotency.

---

### S04. Event bị xử lý lặp, gửi 2 email [M]

**Đề bài:** Hệ thống gửi email xác nhận qua queue. Một số user nhận 2–3 email. Broker là
at-least-once.

**Câu hỏi dẫn:** Đây có phải lỗi broker không? Consumer cần gì? Làm sao đảm bảo không mất?

**Hướng trả lời:**

- At-least-once là bình thường; consumer phải idempotent.
- Lưu `event_id`/`notification_id` unique; kiểm tra trước khi gửi; ghi trạng thái trong cùng
  transaction với outbox nếu cần.
- Nếu gửi email là side effect ngoài DB: dùng bảng trạng thái + provider idempotency (nếu có),
  hoặc chấp nhận "ít nhất một" và dedupe ở tầng gửi.
- Không ack trước khi xử lý nếu không muốn mất; DLQ cho lỗi permanent.

**Điểm cộng:** nêu exactly-once thực dụng = at-least-once + idempotent; test duplicate; theo dõi
tỉ lệ duplicate.

**Red flag:** đổ lỗi broker; tắt retry (gây mất event); không có unique key.

---

### S05. Job export bị kẹt, không ai biết [M]

**Đề bài:** User bấm export báo cáo, trạng thái "processing" mãi. Không có alert.

**Câu hỏi dẫn:** Thiếu gì trong thiết kế? Cách phát hiện và xử lý?

**Hướng trả lời:**

- Thiếu trạng thái/timeout/retry và observability: tuổi job, số job stuck, lỗi.
- Kiểm tra worker có chạy, queue lag, job bị claim nhưng worker chết (lease hết hạn), lỗi
  serialization, file quá lớn, dependency down.
- Sửa: lease/heartbeat, timeout, retry, DLQ, alert theo tuổi job; UI hiển thị lỗi và retry.
- Với job đã kẹt: requeue an toàn (idempotent) hoặc đánh dấu failed + thông báo.

**Điểm cộng:** thiết kế job state machine; đo time-to-complete; backpressure; không để job vô
hạn.

---

### S06. Cache Redis down, API sập theo [M]

**Đề bài:** Redis cluster mất 30 giây, toàn bộ API trả 500 dù Redis chỉ để cache.

**Câu hỏi dẫn:** Vì sao? Thiết kế lại thế nào? Fail-open hay fail-closed?

**Hướng trả lời:**

- Code coi cache là bắt buộc, không bắt exception/timeout; connection pool treo; retry dồn dập.
- Sửa: timeout ngắn, circuit breaker, fallback DB, log/metric; cache-aside chịu lỗi.
- Fail-open cho cache đọc (chấp nhận chậm), fail-closed nếu là store chính (session/queue) và
  có thông báo.
- Kiểm tra stampede khi cache trở lại; TTL jitter.

**Điểm cộng:** nêu SLO khi degraded; load test fallback; không để retry làm DB sập.

---

### S07. Migration làm lock bảng 20 phút [M]

**Đề bài:** Migration thêm index trên bảng 50 triệu dòng, deploy giờ cao điểm, API timeout.

**Câu hỏi dẫn:** Lỗi ở đâu? Quy trình đúng? Rollback thế nào?

**Hướng trả lời:**

- `CREATE INDEX` không `CONCURRENTLY` giữ lock ghi; `ALTER TABLE` có thể rewrite/lock.
- Quy trình: chạy ngoài giờ, `CONCURRENTLY`, batch, throttle, theo dõi lock; test trên bản sao
  kích thước thật; có rollback.
- Nếu đang lock: cancel migration (nếu an toàn), kill query, kiểm tra bloat; ưu tiên phục hồi.
- Sau đó: chuẩn hóa migration checklist, thời gian ước lượng, approval cho bảng lớn.

**Điểm cộng:** phân biệt lock nhẹ/nặng theo PostgreSQL version; expand/contract; backfill riêng.

---

### S08. p99 cao chỉ với một tenant [M]

**Đề bài:** Một khách hàng lớn có p99 5s, các tenant khác 300ms. Cùng code.

**Câu hỏi dẫn:** Điều tra theo chiều nào? Có nên tách tenant?

**Hướng trả lời:**

- Cắt lát theo tenant: dữ liệu lớn (N+1, scan), query thiếu index, cache key, queue riêng,
  quota, số user concurrent.
- Kiểm tra query plan với `tenant_id` cụ thể, số row, index; payload; background job của tenant.
- Ngắn hạn: rate limit/quota, cache, tối ưu query, worker riêng. Dài hạn: shard/tách tenant lớn
  nếu cần.
- Không "tối ưu toàn hệ thống" khi vấn đề cục bộ.

**Điểm cộng:** noisy neighbor; SLO theo tenant; chi phí; công bằng tài nguyên.

---

## 3. Code review và chất lượng

### S09. Review PR 2.000 dòng [M]

**Đề bài:** Đồng nghiệp mở PR refactor lớn, 2.000 dòng, 40 file, không có test mới.

**Câu hỏi dẫn:** Bạn review thế nào? Có chặn không? Yêu cầu gì?

**Hướng trả lời:**

- Không review từng dòng ngay; hỏi mục tiêu, phạm vi, rủi ro, cách kiểm chứng.
- Đề nghị tách PR theo bước (mechanical rename, behavior change, test), hoặc ít nhất tách phần
  rủi ro.
- Yêu cầu test cho behavior thay đổi, mô tả rollback, và evidence (CI, staging).
- Review theo thứ tự: thiết kế/boundary → correctness/security → test → style (tool lo).
- Nếu gấp, tập trung file rủi ro cao và pair review.

**Điểm cộng:** giữ quan hệ, nêu tiêu chí rõ, tránh "LGTM" cho PR lớn; đề xuất quy trình PR size.

**Red flag:** từ chối thẳng không lý do; review hết 2.000 dòng qua loa; chỉ bắt lỗi style.

---

### S10. PR dùng `eval`/`pickle` dữ liệu người dùng [M]

**Đề bài:** Code parse config từ request bằng `eval`, hoặc `pickle.loads` dữ liệu từ queue.

**Câu hỏi dẫn:** Rủi ro gì? Thay bằng gì? Có trường hợp nào chấp nhận được?

**Hướng trả lời:**

- `eval`/`exec` trên input không tin cậy = RCE. `pickle` = arbitrary code execution khi load.
- Thay: `json.loads`, `ast.literal_eval` cho literal, schema validation (Pydantic), parser an
  toàn.
- Nếu buộc dùng pickle nội bộ: ký/ HMAC, nguồn tin cậy, isolate; vẫn không nên cho dữ liệu
  cross-boundary.
- Thêm test/security lint (bandit) để chặn.

**Điểm cộng:** phân biệt "trusted internal" với "user input"; nêu defense in depth.

---

### S11. Test pass nhưng production lỗi [M]

**Đề bài:** Test suite xanh, deploy lên production lỗi `NOT NULL violation` khi tạo order.

**Câu hỏi dẫn:** Vì sao test không bắt? Sửa test thế nào?

**Hướng trả lời:**

- Test dùng schema khác production (SQLite vs Postgres), hoặc migration chưa chạy, hoặc mock
  repository.
- Kiểm tra migration/test DB, default, constraint, transaction.
- Sửa: integration test với Postgres thật (container), chạy migration trong CI, test case thiếu
  field; contract test.
- Thêm bước deploy kiểm tra migration trước app.

**Điểm cộng:** nêu "test đúng tầng"; không chỉ thêm mock; kiểm tra cả rollback.

---

### S12. Đồng nghiệp liên tục bỏ qua review comment [M]

**Đề bài:** Một dev hay resolve comment mà không sửa, hoặc tranh luận kéo dài.

**Câu hỏi dẫn:** Bạn xử lý ở cấp cá nhân và quy trình?

**Hướng trả lời:**

- Phân biệt nit vs blocking; comment rõ lý do, đề xuất, mức độ.
- Nói chuyện riêng, hỏi nguyên nhân (không hiểu, không đồng ý, quá tải), thống nhất cách làm.
- Quy trình: comment blocking phải có phản hồi; dùng tool (required checks), pair review cho
  phần khó.
- Nếu hành vi lặp lại, feedback chính thức; không "chiến tranh comment".

**Điểm cộng:** tách vấn đề kỹ thuật khỏi con người; ví dụ cụ thể; cải thiện chuẩn review.

---

## 4. System design

### S13. Thiết kế hệ thống gửi email giao dịch [M]

**Đề bài:** 1 triệu email/ngày, cần retry, không gửi trùng quá mức, ưu tiên OTP.

**Hướng trả lời:**

- API nhận request → validate → enqueue theo priority (OTP cao) → worker → provider adapter.
- Idempotency/dedupe key; trạng thái `queued/sent/failed`; callback provider.
- Retry backoff theo loại lỗi; DLQ; rate limit theo provider/user.
- Template versioning, unsubscribe/preference, audit.
- Observability: tỉ lệ gửi, latency, bounce, DLQ; alert.
- Scale: partition theo priority, worker pool, provider fallback.

**Điểm cộng:** tách transactional vs marketing; PII; test provider giả; chi phí.

---

### S14. Thiết kế URL shortener có analytics [M]

**Đề bài:** 100 triệu link, đọc nhiều hơn ghi, cần thống kê click gần real-time.

**Hướng trả lời:**

- API tạo link (auth, rate limit), code base62/random + unique.
- Storage: `links` + cache Redis; redirect 302; analytics event async qua queue.
- Analytics: batch/stream aggregate, không làm chậm redirect; chấp nhận eventual.
- Abuse: malware check, allowlist, quota; expiration.
- Scale: cache, partition theo code, CDN cho redirect nếu được.

**Điểm cộng:** trade-off 301/302, ID đoán được, chống enumeration, chi phí lưu analytics.

---

### S15. Thiết kế import CSV 5GB [M]

**Đề bài:** Khách upload file lớn, cần báo lỗi theo dòng, không chặn API.

**Hướng trả lời:**

- Presigned upload → job `pending` → worker stream chunk.
- Validate schema/type; ghi batch (`COPY`/executemany); lỗi dòng vào bảng riêng.
- Idempotency theo job/checksum/unique key; checkpoint/resume.
- Progress + trạng thái cuối; error report tải về.
- Bảo mật: size/type, malware scan, CSV injection khi export.
- Scale: worker pool, partition file, giới hạn tài nguyên.

**Điểm cộng:** partial vs all-or-nothing; transaction size; retry; dữ liệu trùng.

---

### S16. Thiết kế rate limiter cho API public [M]

**Đề bài:** 10.000 khách, nhiều endpoint, cần công bằng và chống abuse.

**Hướng trả lời:**

- Key theo API key/user/tenant + endpoint; quota khác nhau theo plan.
- Token bucket/sliding window; Redis + Lua atomic; local cache cho phép xấp xỉ.
- Trả 429 + `Retry-After` + header quota; tài liệu hóa.
- Nhiều region: global hoặc local + sync; nêu trade-off.
- Bảo vệ dependency: rate riêng cho downstream, queue, circuit breaker.
- Observability: tỉ lệ chặn, false positive, top consumer.

**Điểm cộng:** không chỉ IP; fail-open/closed; kill switch; test tải.

---

### S17. Thiết kế multi-tenant SaaS [M]

**Đề bài:** 500 tenant, có enterprise cần cô lập, cần onboarding tự động.

**Hướng trả lời:**

- Chọn isolation: shared + `tenant_id`/RLS, schema riêng, DB riêng cho enterprise.
- Auth: tenant trong token, role/scope; kiểm tra ownership.
- Onboarding: tạo tenant, cấu hình, admin, quota.
- Noisy neighbor: rate limit, worker riêng, giới hạn concurrency.
- Data lifecycle: backup, export, xóa theo yêu cầu; audit.
- Migration/backfill theo tenant.

**Điểm cộng:** test cross-tenant; cache key; chi phí; compliance.

---

### S18. Thiết kế job scheduler phân tán [M]

**Đề bài:** 100.000 job/ngày, cần chạy đúng giờ, không trùng, retry.

**Hướng trả lời:**

- Bảng job + index `(status, run_at)`; claim bằng `FOR UPDATE SKIP LOCKED`/conditional update.
- Lease + heartbeat; hết lease thì nhận lại (at-least-once).
- Idempotent handler; retry/backoff; DLQ.
- Cron/timezone/catch-up; partition theo loại job.
- Observability: lag, success rate, thời gian chạy, job stuck.
- So sánh DB queue với Temporal/Celery/Cloud Scheduler.

**Điểm cộng:** clock skew, drift, job nặng, scale worker, chi phí.

---

## 5. Incident, delivery và con người

### S19. Sự cố P1 lúc 2h sáng, bạn là người trực [M]

**Đề bài:** Alert báo error rate 30%, bạn là on-call duy nhất, chưa biết nguyên nhân.

**Hướng trả lời:**

- Xác nhận alert thật, mức ảnh hưởng; declare incident, gọi hỗ trợ nếu cần.
- Mitigation trước: rollback, tắt flag, scale, failover, chặn traffic xấu.
- Giao tiếp: kênh incident, stakeholder, ETA cập nhật.
- Ghi timeline; không sửa nhiều thứ cùng lúc.
- Sau: postmortem, action item, bảo vệ người trực.

**Điểm cộng:** phân vai; runbook; không anh hùng đơn độc; ngủ đủ trước khi phân tích sâu.

---

### S20. Deadline cố định nhưng scope quá lớn [EM]

**Đề bài:** Còn 3 tuần, team báo không kịp. Stakeholder không muốn dời ngày.

**Hướng trả lời:**

- Làm rõ must-have vs nice-to-have; cắt scope theo giá trị.
- Đưa lựa chọn: giảm scope, thêm người (chi phí ramp-up), dời ngày, hoặc chấp nhận rủi ro.
- Ước lượng lại theo range; nêu giả định.
- Giao tiếp sớm, có phương án; không hứa rồi trễ.
- Bảo vệ chất lượng tối thiểu (test, rollback).

**Điểm cộng:** dùng dữ liệu; không đổ lỗi; ghi quyết định; kiểm tra sau.

---

### S21. Hai team tranh nhau resource/hạ tầng [EM]

**Đề bài:** Team A và B cùng cần platform team, ưu tiên khác nhau, cả hai đều gấp.

**Hướng trả lời:**

- Làm rõ tác động kinh doanh và chi phí chờ của từng bên.
- Đánh giá theo tiêu chí chung; tìm việc chia sẻ/giảm phụ thuộc (self-service, contract).
- Điều phối lịch, cam kết SLA; escalation nếu không đồng thuận.
- Ghi quyết định; theo dõi.

**Điểm cộng:** không "ai to tiếng hơn"; công bằng; giải pháp hệ thống.

---

### S22. Nhân viên giỏi nhưng độc hại [EM]

**Đề bài:** Một senior deliver tốt nhưng hay coi thường người khác, làm team im lặng.

**Hướng trả lời:**

- Thu thập bằng chứng cụ thể (hành vi, tác động), không dựa tin đồn.
- Feedback riêng, rõ kỳ vọng; lắng nghe nguyên nhân.
- Đặt hậu quả nếu lặp lại; theo dõi; có thể thay đổi vai trò/team.
- Bảo vệ team; không đánh đổi văn hóa lấy output ngắn hạn.
- Nếu không thay đổi, quy trình chính thức.

**Điểm cộng:** công bằng, minh bạch; không "star culture"; ghi nhận phần tốt nhưng không bao biện.

---

### S23. Bạn nhận feedback tiêu cực từ team về chính mình [EM]

**Đề bài:** Khảo sát ẩn danh cho thấy team thấy bạn micro-manage và không lắng nghe.

**Hướng trả lời:**

- Cảm ơn, không phòng thủ; hỏi ví dụ cụ thể (qua kênh phù hợp).
- Chọn 1–2 hành vi thay đổi, công bố cam kết, xin feedback sau 30–60 ngày.
- Thay đổi cụ thể: giảm kiểm tra, giao quyền, hỏi trước khi quyết, tạo không gian nói.
- Theo dõi bằng hành vi, không chỉ lời nói.

**Điểm cộng:** tự nhận thức; không đổ lỗi team; có cơ chế feedback.

---

### S24. Công ty yêu cầu tái cấu trúc, có thể layoff [SM]

**Đề bài:** Bạn phải thiết kế lại org 3 team thành 2, có người không còn vị trí.

**Hướng trả lời:**

- Làm rõ mục tiêu kinh doanh, tiêu chí, ngân sách, ràng buộc pháp lý/HR.
- Thiết kế org theo domain, không theo cá nhân; xác định vị trí, kỹ năng.
- Minh bạch tiêu chí, quy trình công bằng; tham vấn HR/legal.
- Kế hoạch giao tiếp, hỗ trợ, giữ người quan trọng, ổn định team.
- Theo dõi sau 30–90 ngày; điều chỉnh.

**Điểm cộng:** nhân văn, minh bạch; không hứa suông; bảo vệ việc vận hành.

---

### S25. Bạn được giao xây team Python mới trong 6 tháng [SM]

**Đề bài:** Công ty muốn mở mảng data/backend mới, chưa có người, cần ra sản phẩm trong 6 tháng.

**Hướng trả lời:**

- Làm rõ mục tiêu, phạm vi, ràng buộc, thành công đo bằng gì.
- Chọn 3–5 vị trí lõi (lead, backend, data, platform/DevOps); thuê ngoài nếu cần.
- Xây nền tảng trước: repo, CI/CD, cloud, observability, security, quy trình.
- Onboarding, nhịp delivery, SLO; MVP lát cắt nhỏ.
- Rủi ro: tuyển chậm, dependency, scope creep; có phương án.

**Điểm cộng:** không tuyển ồ ạt; ưu tiên năng lực mở khóa; văn hóa; chi phí.

---

## 6. Rapid-fire 60 câu

> Trả lời 20–40 giây/câu. Mục tiêu: đúng bản chất, có ví dụ ngắn, không lan man.

### Ngôn ngữ và runtime (R01–R15)

**R01.** List và tuple khác gì? → Mutable vs immutable; tuple hashable nếu phần tử hashable, nhẹ
hơn, dùng làm key/return nhiều giá trị.

**R02.** `is` và `==`? → Identity vs equality; `is` cho `None`/sentinel, không cho số/chuỗi.

**R03.** Shallow copy vs deep copy? → Container mới chia sẻ phần tử con vs đệ quy; `copy.copy`
vs `copy.deepcopy`.

**R04.** `*args` và `**kwargs`? → Nhận positional/keyword biến số; dùng chuyển tiếp, cẩn thận
mất type.

**R05.** Closure là gì? → Hàm giữ biến từ scope ngoài; bẫy late binding trong vòng lặp.

**R06.** Decorator hoạt động thế nào? → Hàm nhận hàm, trả hàm mới; dùng `functools.wraps`.

**R07.** Generator vs iterator? → Generator là cách viết iterator bằng `yield`, lười, một lần.

**R08.** `yield from`? → Ủy quyền cho iterable/concurrent generator, trả giá trị/exception.

**R09.** Context manager? → `__enter__/__exit__` hoặc `contextlib.contextmanager`; đảm bảo cleanup.

**R10.** `__slots__`? → Bỏ `__dict__`, giảm memory, cấm attribute mới; không phù hợp mọi class.

**R11.** MRO? → C3 linearization; `super()` gọi class kế tiếp trong MRO.

**R12.** Descriptor? → Object có `__get__/__set__`; nền tảng của `property`, ORM.

**R13.** Metaclass? → Class của class; dùng cho registry/validation, thường thay bằng
`__init_subclass__`.

**R14.** GIL? → Một thread chạy bytecode tại một thời điểm; I/O vẫn song song, CPU cần process/
native/free-threaded.

**R15.** Refcount và GC? → Refcount giải phóng ngay; GC phá cycle theo thế hệ.

### Async và concurrency (R16–R25)

**R16.** Coroutine là gì? → Hàm async, chạy khi await, do event loop điều phối.

**R17.** `await` làm gì? → Nhường quyền khi chờ, không block thread.

**R18.** Blocking call trong async? → Treo event loop; dùng async client/`to_thread`/process.

**R19.** `TaskGroup` vs `gather`? → TaskGroup hủy nhóm khi một task lỗi, structured; gather tùy
`return_exceptions`.

**R20.** Cancellation? → `CancelledError`, cleanup rồi re-raise; không nuốt.

**R21.** Timeout? → `asyncio.timeout`, timeout client/DB; nhỏ hơn caller, có deadline tổng.

**R22.** Thread-safe? → Lock/atomic; GIL không bảo vệ logic read-modify-write.

**R23.** Process pool? → CPU-bound, pickle, spawn, memory riêng.

**R24.** Backpressure? → Queue bound, semaphore, rate limit, 429/503.

**R25.** Contextvars? → Context theo task; không tự lan sang thread/process, phải truyền.

### Database và dữ liệu (R26–R35)

**R26.** ACID? → Atomicity, Consistency, Isolation, Durability.

**R27.** Isolation mặc định Postgres? → Read Committed; vẫn có lost update nếu read-modify-write.

**R28.** Index composite thứ tự? → Theo filter/sort; prefix quan trọng; tránh hàm lên cột.

**R29.** N+1? → Query con trong vòng lặp; sửa eager load/batch.

**R30.** Offset vs keyset? → Offset chậm/không ổn định; keyset nhanh, cần tie-breaker.

**R31.** Transaction boundary? → Use-case, không network bên trong, giữ ngắn.

**R32.** Optimistic vs pessimistic lock? → Version check vs khóa row; chọn theo contention.

**R33.** Migration zero-downtime? → Expand/contract, nullable trước, backfill batch, index
concurrently.

**R34.** UTC hay local? → Lưu UTC + timestamptz, đổi ở presentation; date cho ngày lịch.

**R35.** Connection pool size? → Theo core/DB limit, có timeout/pre_ping, tránh pool quá lớn.

### Testing, vận hành, bảo mật (R36–R50)

**R36.** Test pyramid? → Unit nhiều, integration DB thật, E2E ít luồng tiền.

**R37.** Flaky test? → Time/random/state/network; freeze/inject/isolate, quarantine có owner.

**R38.** Coverage? → Tín hiệu vùng chưa test, không phải chất lượng; branch + diff + mutation.

**R39.** Mock ở đâu? → Boundary bên ngoài; không mock domain/DB trong test nghiệp vụ.

**R40.** Profiling? → Đo trước: trace, EXPLAIN, py-spy, cProfile, memory profiler.

**R41.** SLO là gì? → Mục tiêu chất lượng đo được; error budget = 100% − SLO.

**R42.** RED metrics? → Rate, Errors, Duration.

**R43.** Trace lan truyền? → W3C traceparent, contextvars, truyền qua queue/thread.

**R44.** Log PII? → Không; structured + redact, retention, quyền truy cập.

**R45.** Secret management? → Secret manager, không commit/log, rotate, least privilege.

**R46.** SQL injection? → Parameterized query/ORM đúng, không nối chuỗi.

**R47.** `pickle` rủi ro? → Arbitrary code execution; không load dữ liệu không tin cậy.

**R48.** JWT vs session? → Stateless/revoke khó vs stateful/revoke dễ; lưu token an toàn.

**R49.** Idempotency? → Key + lưu trạng thái/response, unique constraint; retry an toàn.

**R50.** Rate limit algorithms? → Fixed/sliding window, token/leaky bucket; Redis Lua phân tán.

### Kiến trúc và lãnh đạo (R51–R60)

**R51.** Monolith vs microservices? → Modular monolith mặc định; tách khi có pain point cụ thể.

**R52.** Outbox? → Ghi event cùng transaction, relay publish, consumer idempotent.

**R53.** Saga? → Chuỗi local transaction + compensation; eventual consistency.

**R54.** Cache invalidation? → Xóa sau commit, TTL/version, chấp nhận stale; chống stampede.

**R55.** CAP? → Khi partition chọn C hoặc A; PACELC thêm latency; chọn theo luồng dữ liệu.

**R56.** Sharding key? → Phân bố đều, hỗ trợ query, tránh hotspot; reshard có kế hoạch.

**R57.** Tech debt? → Gắn rủi ro/chi phí, trả liên tục, có owner; không rewrite mù.

**R58.** Delegation? → Outcome + ràng buộc + checkpoint theo mức trưởng thành.

**R59.** Feedback? → SBI, cụ thể, kịp thời, riêng tư; hai chiều.

**R60.** Nói không với stakeholder? → Hiểu mục tiêu, trade-off, phương án thay thế, quyết định
bằng dữ liệu.

---

## 7. Cách chấm điểm tình huống

| Tiêu chí | 0–1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Làm rõ vấn đề | Lao vào giải | Hỏi vài câu | Hỏi đúng ràng buộc | Đặt lại vấn đề, xác định thành công |
| Cấu trúc | Lan man | Có bước | Ưu tiên rõ | Có nhánh theo dữ kiện |
| Kỹ thuật | Sai bản chất | Đúng cơ bản | Có trade-off | Có số liệu/kinh nghiệm thật |
| Vận hành | Bỏ qua rủi ro | Nhắc mitigation | Có rollback/observability | Có runbook, test, phòng ngừa |
| Giao tiếp | Không giải thích | Hiểu được | Rõ ràng, ngắn | Thuyết phục stakeholder |

**Cách tính gợi ý:** trung bình có trọng số; tình huống production/vận hành nên có ít nhất một
tiêu chí đạt 3. Với vai trò lead/manager, thêm trọng số cho giao tiếp, ưu tiên, và phát triển
người.

**Red flag chung:**

- Không hỏi làm rõ, giả định ngầm.
- Đề xuất "viết lại tất cả" hoặc "thêm công nghệ" mà không có lý do.
- Bỏ qua bảo mật/dữ liệu người dùng.
- Đổ lỗi cá nhân, không nhìn hệ thống.
- Không có cách đo hoặc xác nhận kết quả.

---

## 8. Tài liệu tham khảo

- [`./03-middle.md`](./03-middle.md)
- [`./04-senior.md`](./04-senior.md)
- [`./05-lead-manager.md`](./05-lead-manager.md)
- [`../python-production.md`](../python-production.md)
- [`../python-advanced.md`](../python-advanced.md)
- Google SRE: https://sre.google/books/
- PostgreSQL docs: https://www.postgresql.org/docs/
- OWASP: https://owasp.org/
- DORA: https://dora.dev/
- The Manager's Path (Camille Fournier)

---

*Quay lại: [`./README.md`](./README.md) — ma trận câu hỏi, thang điểm và lộ trình ôn.*
