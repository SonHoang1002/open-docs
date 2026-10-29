# Python Interview — Từ Fresher đến Senior Manager

> Ngân hàng câu hỏi phỏng vấn Python **có đáp án tham chiếu**, chia theo level và loại vòng:
> nền tảng, coding, internals, system design, quản lý và hành vi. Nội dung bám công việc
> thật (backend, data, automation), không hỏi đố mẹo.

---

## Mục lục

1. [Bộ tài liệu dùng để làm gì?](#1-bộ-tài-liệu-dùng-để-làm-gì)
2. [Định nghĩa level và kỳ vọng](#2-định-nghĩa-level-và-kỳ-vọng)
3. [Cấu trúc file và số câu](#3-cấu-trúc-file-và-số-câu)
4. [Thang điểm 0–4](#4-thang-điểm-04)
5. [Ma trận câu hỏi theo level](#5-ma-trận-câu-hỏi-theo-level)
6. [Lộ trình ôn 8 tuần](#6-lộ-trình-ôn-8-tuần)
7. [Lộ trình cho người đã đi làm](#7-lộ-trình-cho-người-đã-đi-làm)
8. [Công thức trả lời](#8-công-thức-trả-lời)
9. [Red flags theo level](#9-red-flags-theo-level)
10. [Hướng dẫn cho interviewer](#10-hướng-dẫn-cho-interviewer)
11. [Cách dùng đáp án](#11-cách-dùng-đáp-án)
12. [Tài liệu tham khảo](#12-tài-liệu-tham-khảo)

---

## 1. Bộ tài liệu dùng để làm gì?

Ba mục đích:

1. **Ứng viên:** ôn có hệ thống, tự trả lời miệng, bổ sung ví dụ và trade-off thay vì học
   thuộc. Biết mình còn thiếu gì ở level tiếp theo.
2. **Interviewer:** chọn câu theo level, có đáp án tham chiếu, tiêu chí chấm và red flag.
   Giảm hỏi cảm tính, tăng nhất quán giữa các interviewer.
3. **Team:** dùng làm checklist onboarding, review năng lực, viết tài liệu nội bộ.

Mỗi câu gồm:

- **Level**: `[F]` Fresher, `[J]` Junior, `[M]` Middle, `[S]` Senior, `[L]` Lead,
  `[EM]` Engineering Manager, `[SM]` Senior Manager.
- **Trả lời:** nội dung tối thiểu cần nêu.
- **Ví dụ/code:** khi giúp làm rõ.
- **Điểm cộng/Bẫy:** phân biệt ứng viên khá và giỏi, hoặc lỗi hay gặp.

> ⚠️ Đáp án là **một cách trả lời tốt**, không phải chân lý. Khi phỏng vấn, nêu bối cảnh,
> trade-off, cách đo và bài học thực tế. Không có công cụ/kiến trúc nào tốt nhất cho mọi
> bài toán.

---

## 2. Định nghĩa level và kỳ vọng

| Level | Kinh nghiệm gợi ý | Kỳ vọng chính | Không cần |
|---|---|---|---|
| **Fresher** | 0–1 năm | Viết code đúng cú pháp, hiểu kiểu/collection/hàm cơ bản, debug lỗi đơn giản, học nhanh, hỏi đúng | Thiết kế hệ thống, tối ưu sâu |
| **Junior** | 1–3 năm | Tự làm feature nhỏ đến vừa, viết test, dùng Git/DB/API, hiểu OOP/exception/module, đọc traceback | Lãnh đạo, kiến trúc lớn |
| **Middle** | 3–5 năm | Thiết kế module/service, chọn giải pháp có lý do, xử lý async/concurrency, performance cơ bản, review code, mentoring | Quản lý con người, chiến lược dài hạn |
| **Senior** | 5–8 năm | Kiến trúc hệ thống, distributed system, scale, bảo mật, vận hành, dẫn dắt kỹ thuật, ra quyết định dưới mơ hồ | Quản lý ngân sách/org (trừ khi kiêm nhiệm) |
| **Tech Lead** | 6+ năm | Senior + dẫn dắt team, chia việc, review, giao tiếp stakeholder, cân bằng delivery/chất lượng | Quản lý nhân sự chính thức (tùy tổ chức) |
| **Engineering Manager** | 7+ năm | Quản lý 1–2 team: tuyển dụng, phát triển người, delivery, sức khỏe team, phối hợp | Viết code hằng ngày ở mức senior |
| **Senior Manager** | 10+ năm | Quản lý nhiều team/manager, chiến lược, ngân sách, org design, văn hóa, quan hệ cấp cao | Chi tiết implementation |

**Lưu ý về title:** cùng "Senior" ở công ty khác nhau có thể lệch 1–2 năm và phạm vi.
Luôn hỏi **phạm vi ảnh hưởng** (feature → team → nhiều team → org) thay vì chỉ năm kinh
nghiệm.

### 2.1 Câu hỏi theo phạm vi

| Phạm vi | Câu hỏi điển hình |
|---|---|
| Task | "Làm sao viết hàm này đúng?" |
| Feature | "Thiết kế module này thế nào?" |
| Service | "Service chịu tải 10k RPM ra sao?" |
| Hệ thống | "Đồng bộ dữ liệu giữa 3 service thế nào?" |
| Team | "Xử lý conflict giữa 2 senior ra sao?" |
| Nhiều team | "Ưu tiên roadmap cho 4 team thế nào?" |
| Org | "Tổ chức lại platform team vì sao?" |

---

## 3. Cấu trúc file và số câu

| File | Nội dung | Số câu | Level |
|---|---|---:|---|
| [`01-fresher.md`](./01-fresher.md) | Cú pháp, kiểu, collection, hàm, OOP cơ bản, exception, file, stdlib, Git/Linux/SQL cơ bản, coding | ~100 | Fresher |
| [`02-junior.md`](./02-junior.md) | Ngôn ngữ sâu hơn, module/package, test, FastAPI/Django, ORM, REST, Docker, debug, Git flow | ~80 | Junior |
| [`03-middle.md`](./03-middle.md) | Internals, generator/decorator, typing, async, concurrency, kiến trúc, DB, cache, queue, security, CI/CD | ~80 | Middle |
| [`04-senior.md`](./04-senior.md) | CPython internals, memory, distributed system, consistency, scale, bảo mật, migration, observability, technical strategy | ~70 | Senior |
| [`05-lead-manager.md`](./05-lead-manager.md) | Tech lead, EM, senior manager: people, hiring, delivery, stakeholder, org, budget, culture | ~65 | Lead → SM |
| [`06-scenarios.md`](./06-scenarios.md) | Debug, code review, system design, behavioral, rapid-fire | ~25 tình huống + 60 nhanh | Mid → Manager |

Tổng: **~395 câu có đáp án**, **25 tình huống thực chiến**, và **~120 câu rapid-fire** (ở
Fresher và file tình huống).

---

## 4. Thang điểm 0–4

Chấm từng câu theo **bằng chứng**, không theo cảm giác:

| Điểm | Mô tả | Dấu hiệu |
|---:|---|---|
| 0 | Không biết/sai bản chất | Im lặng, trả lời sai khái niệm |
| 1 | Biết định nghĩa | Nêu được thuật ngữ, không ví dụ |
| 2 | Dùng được | Có ví dụ đúng, xử lý case thường |
| 3 | Hiểu trade-off | Nêu khi nào dùng/không, lỗi thường gặp, cách test/đo |
| 4 | Kinh nghiệm thật | Kể case production, số liệu, bài học, ảnh hưởng người khác |

**Ngưỡng gợi ý (trung bình có trọng số):**

| Level | Trung bình | Điều kiện bắt buộc |
|---|---:|---|
| Fresher | ≥ 2.0 | Không có 0 ở cú pháp/collection/hàm/exception |
| Junior | ≥ 2.4 | ≥ 2 câu đạt 3 ở debug/test/DB |
| Middle | ≥ 2.7 | ≥ 3 câu đạt 3 ở kiến trúc/async/testing |
| Senior | ≥ 3.2 | ≥ 2 câu đạt 4 ở system design/incident/scale |
| Lead | ≥ 3.2 | ≥ 2 câu đạt 4 ở dẫn dắt/giao tiếp/ra quyết định |
| EM | ≥ 3.2 | ≥ 2 câu đạt 4 ở people/delivery/conflict |
| SM | ≥ 3.4 | ≥ 2 câu đạt 4 ở strategy/org/stakeholder |

Không cộng điểm vì "nói nhiều". Trả lời dài mà lan man không đạt 3. Một câu trả lời ngắn,
đúng, có trade-off đáng điểm cao hơn.

---

## 5. Ma trận câu hỏi theo level

| Chủ đề | Fresher | Junior | Middle | Senior | Lead/EM/SM |
|---|---|---|---|---|---|
| Cú pháp/kiểu/collection | Q01–Q25 | Q01–Q08 | — | — | — |
| Hàm/OOP/exception | Q26–Q45 | Q09–Q18 | Q01–Q05 | — | — |
| Module/package/tooling | Q46–Q55 | Q19–Q25 | Q06–Q10 | Q01–Q03 | — |
| File/stdlib/DB cơ bản | Q56–Q70 | Q26–Q40 | Q11–Q18 | — | — |
| Test/debug/Git | Q71–Q85 | Q41–Q55 | Q19–Q28 | Q04–Q06 | — |
| Web/API | Q86–Q95 | Q56–Q68 | Q29–Q35 | Q07–Q10 | — |
| Async/concurrency | — | Q69–Q72 | Q36–Q48 | Q11–Q18 | — |
| Internals/typing | — | Q73–Q78 | Q49–Q58 | Q19–Q30 | — |
| Kiến trúc/DB/cache/queue | — | — | Q59–Q72 | Q31–Q48 | Q01–Q10 |
| Security/observability | — | Q79–Q80 | Q73–Q76 | Q49–Q58 | Q07 |
| System design/scale | — | — | Q77–Q80 | Q59–Q68 | — |
| Chiến lược kỹ thuật | — | — | — | Q69–Q70 | — |
| People/delivery/strategy | — | — | — | — | Q11–Q65 |

> 💡 Mapping chỉ là gợi ý. Một ứng viên middle có thể bị hỏi 1–2 câu senior để tìm trần
> năng lực; một senior có thể bị hỏi lại nền tảng nếu nghi ngờ "học vẹt".

---

## 6. Lộ trình ôn 8 tuần

Giả định 1–1.5 giờ/ngày, mục tiêu Middle/Senior.

| Tuần | Trọng tâm | Việc làm |
|---|---|---|
| 1 | Cú pháp, kiểu, collection, hàm | Fresher Q01–Q45; viết lại ví dụ không nhìn đáp án |
| 2 | OOP, exception, module, file, stdlib | Fresher Q46–Q70; làm 10 bài coding |
| 3 | Test, debug, Git, SQL, HTTP | Fresher Q71–Q100; viết test cho project nhỏ |
| 4 | Web API, ORM, package, Docker | Junior Q01–Q68; dựng API CRUD có test |
| 5 | Async, concurrency, internals | Junior Q69–Q80 + Middle Q01–Q48; benchmark thread/process/async |
| 6 | Kiến trúc, DB, cache, queue, security | Middle Q49–Q80; vẽ system design 2 bài |
| 7 | Senior: scale, distributed, observability | Senior Q01–Q70; mock interview 60 phút |
| 8 | Tình huống + behavioral + rapid-fire | Scenarios; ghi âm, tự nghe, sửa |

**Cách ôn hiệu quả:**

1. Đọc câu hỏi, **nói to** câu trả lời trong 60–90 giây.
2. Mở đáp án, đánh dấu ý thiếu.
3. Viết một ví dụ code hoặc một case production cho câu đó.
4. Cuối tuần mock interview với đồng nghiệp, ghi âm.

---

## 7. Lộ trình cho người đã đi làm

### 7.1 Nhảy level Middle → Senior

Tập trung vào **phạm vi ảnh hưởng** và **ra quyết định**, không chỉ code:

- Kể 2 dự án bạn tự thiết kế, có số liệu trước/sau.
- Giải thích trade-off kiến trúc bạn đã chọn và đã sai ở đâu.
- Nói về incident bạn xử lý, cách giảm MTTR.
- Nói về mentoring/review, thay đổi quy trình.
- Luyện system design: API gateway, queue, cache, DB, observability, failure mode.

### 7.2 Chuẩn bị vòng quản lý (Lead/EM/SM)

- Chuẩn bị 8–10 câu chuyện STAR: conflict, underperformance, hiring, delivery trễ,
  incident, thay đổi ưu tiên, thất bại, thắng lớn.
- Có số liệu: team size, doanh thu/chi phí, SLA, turnover, cycle time, incident.
- Hiểu mô hình tổ chức và cách bạn chọn (team topology, platform vs stream-aligned).
- Luyện câu hỏi mở: "Bạn sẽ làm gì trong 30/60/90 ngày đầu?"
- Chuẩn bị câu hỏi ngược cho công ty (chiến lược, sức khỏe team, ngân sách, quyền quyết định).

---

## 8. Công thức trả lời

### 8.1 Câu hỏi kỹ thuật

```text
Định nghĩa ngắn (1 câu)
→ Cơ chế/nguyên lý (1–2 câu)
→ Ví dụ trong công việc (1 câu)
→ Trade-off/khi nào không dùng (1 câu)
→ Cách đo/test/lỗi thường gặp (1 câu)
```

Ví dụ "list vs set":

> List giữ thứ tự và cho index, tìm kiếm O(n); set không trùng, membership O(1) trung bình.
> Mình dùng list cho feed có thứ tự, set cho tập id đã xử lý. Nếu cần cả hai, dùng dict hoặc
> list + set phụ. Với dữ liệu nhỏ, khác biệt không đáng; mình chọn theo semantics trước.
> Kiểm tra bằng benchmark nếu nằm trong hot path.

### 8.2 Câu hỏi coding

1. **Làm rõ:** input/output, ràng buộc, edge case, có được dùng thư viện không.
2. **Ví dụ:** đi qua 1–2 case nhỏ, kể cả rỗng/trùng/âm.
3. **Ý tưởng:** nêu brute force rồi tối ưu; nói complexity.
4. **Code:** viết hàm rõ ràng, đặt tên tốt, xử lý edge case.
5. **Test:** tự chạy tay vài case, nêu test tự động sẽ viết.
6. **Mở rộng:** nếu input lớn/streaming/concurrent thì sao.

Không im lặng khi code. Nói ra giả định và lý do chọn.

### 8.3 System design

1. **Requirement:** functional + phi chức năng (scale, latency, consistency, budget).
2. **Estimate:** QPS, storage, read/write ratio, peak.
3. **API/data model:** endpoint, schema, access pattern.
4. **High-level:** client → gateway → service → DB/cache/queue.
5. **Deep dive:** 1–2 thành phần quan trọng (consistency, sharding, queue, cache).
6. **Failure:** timeout, retry, idempotency, circuit breaker, DLQ, degradation.
7. **Observability:** log/metric/trace/SLO.
8. **Trade-off & evolution:** scale 10×, multi-region, cost.

### 8.4 Behavioral (STAR)

- **S**ituation: bối cảnh, quy mô, ràng buộc.
- **T**ask: bạn chịu trách nhiệm gì.
- **A**ction: bạn làm gì, vì sao, ai tham gia.
- **R**esult: kết quả đo được, bài học.

Không kể "chúng tôi" nếu không nói rõ phần bạn làm. Không nhận công tập thể, cũng đừng đổ
lỗi đồng đội.

### 8.5 Management

```text
Bối cảnh + số liệu
→ Bạn chọn ưu tiên gì và vì sao
→ Cách giao tiếp/thực thi với stakeholder
→ Kết quả + điều chỉnh
→ Nguyên tắc bạn rút ra
```

Câu trả lời quản lý tốt thể hiện **phán đoán**, **giao tiếp**, **trách nhiệm**, không chỉ
kể việc đã làm.

---

## 9. Red flags theo level

### Fresher/Junior

| Red flag | Vì sao |
|---|---|
| `except: pass` | Nuốt lỗi, không debug được |
| `def f(x=[])` mà không biết | Hiểu sai default argument |
| Dùng `is` so sánh chuỗi/số | Hiểu sai identity |
| Không biết đọc traceback | Phụ thuộc người khác |
| Không viết test nào | Thiếu kỷ luật chất lượng |
| Không phân biệt list/dict/set | Chọn sai công cụ |
| Copy code không hiểu | Không phát triển được |
| Không hỏi lại yêu cầu | Đoán mò, làm sai |

### Middle

| Red flag | Vì sao |
|---|---|
| Chọn công nghệ theo trend, không trade-off | Thiếu phán đoán |
| Async gọi sync DB/HTTP | Block event loop |
| Không biết N+1/index | Chưa vận hành DB thật |
| Retry mọi lỗi | Khuếch đại sự cố |
| Không có loading/error/empty state | Chỉ nghĩ happy path |
| Test chỉ happy path | Thiếu tư duy rủi ro |
| Không log/metric | Không vận hành được |
| "Em làm theo chỉ dẫn" với mọi thứ | Thiếu ownership |

### Senior

| Red flag | Vì sao |
|---|---|
| Thiết kế microservice cho CRUD nhỏ | Over-engineering |
| Không nói được failure mode | Chưa từng vận hành |
| Không có số liệu/đo lường | Quyết định cảm tính |
| Đổ lỗi cho team/công cụ | Thiếu trách nhiệm |
| Không biết migration/rollback | Chưa release thật |
| Bảo mật chỉ nói "dùng HTTPS" | Hiểu nông |
| Không mentoring/chia sẻ | Ảnh hưởng hẹp |
| Mọi quyết định đều "tùy" | Thiếu quan điểm |

### Lead/Manager

| Red flag | Vì sao |
|---|---|
| Nhận hết việc kỹ thuật, không delegate | Không scale team |
| Đánh giá người chỉ bằng số giờ/code | Sai thước đo |
| Không nói được cách xử lý underperformance | Né tránh |
| Roadmap chỉ là danh sách feature | Thiếu chiến lược |
| Không có số liệu delivery/sức khỏe team | Quản lý cảm tính |
| "Tôi sẽ hỏi sếp" cho mọi quyết định | Thiếu ownership |
| Không nhận sai | Thiếu an toàn tâm lý |
| Tuyển người giống mình | Thiếu đa dạng tư duy |

---

## 10. Hướng dẫn cho interviewer

1. **Chuẩn bị bộ câu theo level**, không ứng biến hoàn toàn.
2. **Hỏi ít, đào sâu.** 8–12 câu chất lượng tốt hơn 30 câu bề mặt.
3. **Dùng câu hỏi mở**, để ứng viên chọn ví dụ; sau đó hỏi "vì sao", "đo bằng gì".
4. **Ghi chép bằng chứng**, không ghi cảm nhận ("có vẻ không thông minh").
5. **Calibrate** với interviewer khác sau buổi; thống nhất rubric.
6. **Tránh bias**: trường, giọng nói, giới tính, tuổi, background. Hỏi cùng bộ câu cho
   cùng level.
7. **Không hỏi đố mẹo** kiểu "in ra gì" với code phụ thuộc implementation; hỏi bản chất.
8. **Cho phép dùng tài liệu** ở câu coding nếu công việc thật cho phép; đánh giá cách tra
   cứu và kiểm chứng.
9. **Kết thúc bằng câu hỏi ngược** — ứng viên senior thường có câu hỏi sắc.
10. **Quyết định theo level**, không theo "giỏi hơn tôi/không bằng tôi".

### 10.1 Cấu trúc buổi 60 phút

| Phút | Nội dung |
|---:|---|
| 0–5 | Giới thiệu, phá băng |
| 5–15 | Nền tảng/ngôn ngữ theo level |
| 15–30 | Coding hoặc debug |
| 30–45 | Thiết kế/kinh nghiệm thực tế |
| 45–55 | Behavioral/management (theo level) |
| 55–60 | Ứng viên hỏi ngược |

---

## 11. Cách dùng đáp án

- **Không học thuộc code.** Hiểu API và tự viết lại.
- **Kiểm tra phiên bản.** Python thay đổi: `match` cần 3.10, `TaskGroup` 3.11, `type` alias
  3.12, free-threading 3.13/3.14. Đối chiếu docs tại thời điểm dùng.
- **Đáp án có thể ngắn hơn.** 60–90 giây/câu khi phỏng vấn; chỉ đi sâu khi được hỏi tiếp.
- **Luôn nêu bối cảnh.** "Với service nhỏ, mình chọn...; nếu scale 10×, mình sẽ..." thể
  hiện tư duy tốt hơn câu trả lời tuyệt đối.
- **Nói cả điều mình không biết.** "Phần này em chưa làm production, như em hiểu..." trung
  thực và đáng tin hơn bịa.

---

## 12. Tài liệu tham khảo

| Tài liệu | Dùng khi |
|---|---|
| [`../python-basics.md`](../python-basics.md) | Ôn nền tảng có ví dụ |
| [`../python-advanced.md`](../python-advanced.md) | Đào sâu internals/async/typing |
| [`../python-production.md`](../python-production.md) | Kinh nghiệm vận hành, system design |
| [`../python-cheatsheet.md`](../python-cheatsheet.md) | Tra cứu nhanh |
| [Python docs](https://docs.python.org/3/) | Nguồn chuẩn |
| [System Design Primer](https://github.com/donnemartin/system-design-primer) | Ôn system design |
| [Google SRE Book](https://sre.google/books/) | Reliability/incident |
| [Staff Engineer (Larson)](https://staffeng.com/) | Phát triển lên senior/lead |
| [The Manager's Path (Fournier)](https://www.oreilly.com/library/view/the-managers-path/9781491973882/) | EM/SM |

---

*Bắt đầu với [`01-fresher.md`](./01-fresher.md) nếu mới học, hoặc chọn file theo level mục
tiêu. Luyện nói to, không chỉ đọc.*
