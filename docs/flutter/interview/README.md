# Flutter Interview — Ngân hàng câu hỏi từ cơ bản đến nâng cao

> Bộ câu hỏi phỏng vấn Flutter có đáp án cụ thể, chia theo cấp độ **Junior → Mid → Senior**
> và tình huống thực chiến. Nội dung bám Flutter 3.x/Dart 3.x, Material 3, Impeller và
> cách làm việc trong một app thật (guestbook wedding: REST + WebSocket + offline cache).

---

## Mục lục

1. [Bộ tài liệu này dùng để làm gì?](#1-bộ-tài-liệu-này-dùng-để-làm-gì)
2. [Cấu trúc và độ khó](#2-cấu-trúc-và-độ-khó)
3. [Cách chấm điểm câu trả lời](#3-cách-chấm-điểm-câu-trả-lời)
4. [Ma trận câu hỏi theo cấp độ](#4-ma-trận-câu-hỏi-theo-cấp-độ)
5. [Lộ trình ôn 6 tuần](#5-lộ-trình-ôn-6-tuần)
6. [Công thức trả lời](#6-công-thức-trả-lời)
7. [Red flags khi phỏng vấn](#7-red-flags-khi-phỏng-vấn)
8. [Cách dùng đáp án đúng](#8-cách-dùng-đáp-án-đúng)
9. [Liên kết tài liệu liên quan](#9-liên-kết-tài-liệu-liên-quan)

---

## 1. Bộ tài liệu này dùng để làm gì?

Bộ tài liệu phục vụ ba mục đích:

1. **Ứng viên**: ôn có hệ thống, tự trả lời miệng, bổ sung ví dụ và trade-off thay vì học thuộc.
2. **Người phỏng vấn**: lấy câu hỏi theo level, có đáp án tham chiếu và tiêu chí chấm.
3. **Team**: dùng làm checklist kiến thức khi onboarding, review code hoặc viết tài liệu nội bộ.

Mỗi câu có:

- **Mức độ**: `[J]` Junior, `[M]` Mid, `[S]` Senior.
- **Trả lời**: nội dung tối thiểu cần nói.
- **Ví dụ/code**: chỉ dùng khi giúp làm rõ.
- **Điểm cộng/bẫy**: phần phân biệt ứng viên khá và giỏi (không bắt buộc thuộc lòng).

> ⚠️ Đáp án là **một cách trả lời tốt**, không phải chân lý duy nhất. Khi phỏng vấn, hãy
> nêu bối cảnh, trade-off và cách đo/kiểm chứng. Không có state management, kiến trúc
> hay thư viện nào "tốt nhất" cho mọi app.

---

## 2. Cấu trúc và độ khó

| File | Nội dung | Số câu | Level |
|---|---|---:|---|
| [`01-basics.md`](./01-basics.md) | Dart 3, widget, layout, lifecycle, navigation, async, HTTP, test, build | 140 | Junior |
| [`02-intermediate.md`](./02-intermediate.md) | State management, kiến trúc, DI, routing, networking, offline, platform, CI | 85 | Mid |
| [`03-advanced.md`](./03-advanced.md) | Rendering, isolate, platform channel/FFI, performance, security, system design | 75 | Senior |
| [`04-scenarios.md`](./04-scenarios.md) | Debug tình huống, code review, system design, behavioral + rapid-fire | 50 + 90 | Mid–Senior |

Tổng: **440 câu hỏi/đáp án** (140 + 85 + 75 + 50 tình huống + 90 rapid-fire, chưa tính
các câu follow-up). Các câu đánh số tiếp (Q101+, Q56+, Q51+, S31+, R71+) là phần **bổ sung
cập nhật**, giữ nguyên số cũ để không phá vỡ tham chiếu.

### Phân biệt level

| Level | Kỳ vọng |
|---|---|
| **Junior** | Viết được widget, layout, form, gọi API; hiểu lifecycle, null safety, async cơ bản; biết debug lỗi thường gặp. |
| **Mid** | Tự thiết kế feature theo lớp, chọn state management có lý do, xử lý lỗi/loading/empty, test, tối ưu rebuild, làm việc với CI. |
| **Senior** | Hiểu render pipeline, isolate/channel, profiling, bảo mật, release, trade-off kiến trúc; dẫn dắt incident và mentoring. |

---

## 3. Cách chấm điểm câu trả lời

Dùng thang 0–4 cho từng câu:

| Điểm | Mô tả | Dấu hiệu |
|---:|---|---|
| 0 | Không biết | Im lặng hoặc trả lời sai bản chất |
| 1 | Biết định nghĩa | Nêu được khái niệm nhưng không ví dụ |
| 2 | Dùng được | Có ví dụ đúng, xử lý được case thường |
| 3 | Hiểu trade-off | Nêu khi nào dùng/không dùng, lỗi thường gặp, cách test |
| 4 | Có kinh nghiệm thật | Kể case production, số liệu, cách đo, bài học |

**Điểm tổng gợi ý:**

- Junior: ≥ 2.0 trung bình, không có câu 0 ở Dart/widget/async.
- Mid: ≥ 2.7, ít nhất 3 câu đạt 3 ở kiến trúc/state/testing.
- Senior: ≥ 3.2, có ít nhất 2 câu đạt 4 ở performance/system design/incident.

---

## 4. Ma trận câu hỏi theo cấp độ

| Chủ đề | Junior (01) | Mid (02) | Senior (03/04) |
|---|---|---|---|
| Dart language | Q01–Q21, Q101–Q115 | — | Q08, Q58, Q60 |
| Widget/lifecycle/layout | Q22–Q66, Q116–Q129 | Q22–Q28, Q73–Q78 | Q01–Q07, Q51–Q55 |
| State management | Q51–Q53 | Q01–Q05, Q56–Q61 | Q74 |
| Networking/realtime | Q67–Q75, Q130–Q135 | Q11–Q21, Q64, Q68–Q72 | Q33–Q35, Q70–Q72 |
| Architecture/DI/routing | Q46–Q50 | Q06–Q10, Q62–Q67 | Q29–Q32, Q73–Q75 |
| Performance | Q42, Q60, Q80, Q99, Q124 | Q29–Q33, Q74, Q85 | Q21–Q23, Q51–Q52, Q61–Q64 |
| Testing/CI | Q76–Q79, Q136–Q138 | Q34–Q37, Q47–Q50, Q64 | Q27, Q64 |
| Security/release | Q61–Q63, Q72, Q81, Q88, Q139–Q140 | Q18, Q40–Q42, Q79–Q84 | Q20, Q24–Q26, Q65–Q69 |
| System design | — | Q16–Q21, Q65–Q72 | Q33–Q45, Q70–Q72 |
| Behavioral/incident | Q95, Q100 | Q44–Q45, Q54 | Q39, Q46–Q50; S28–S30 |

> 💡 Khi phỏng vấn junior, đừng bắt lỗi thuật ngữ. Khi phỏng vấn senior, đừng chỉ hỏi
> định nghĩa — hãy hỏi "đo bằng gì, đánh đổi gì, hỏng thì xử lý thế nào".

---

## 5. Lộ trình ôn 6 tuần

Giả định 1–1.5 giờ/ngày.

| Tuần | Trọng tâm | Việc làm |
|---|---|---|
| 1 | Dart + widget/layout | 01 Q01–Q44 và Q101–Q115; viết lại ví dụ không nhìn đáp án |
| 2 | Lifecycle + state + form | 01 Q25–Q29, Q43–Q53, Q116–Q129; build form RSVP có validation |
| 3 | Async + HTTP + WebSocket | 01 Q67–Q75, Q130–Q135; viết client có timeout/retry/reconnect |
| 4 | Kiến trúc + state management | 02 Q01–Q10, Q56–Q67; refactor guestbook theo feature-first |
| 5 | Performance + testing + CI | 02 Q29–Q37, Q73–Q85; profile list 1.000 item, widget/golden test |
| 6 | Advanced + system design + behavioral | 03 Q01–Q40, Q51–Q75; 04 S31–S50; mock interview 60–90 phút |

**Cách ôn hiệu quả:**

1. Đọc câu hỏi, **nói to** câu trả lời trong 60–90 giây.
2. Mở đáp án, đánh dấu ý thiếu.
3. Viết một ví dụ code hoặc một case production cho câu đó.
4. Cuối tuần làm mock interview, ghi âm và tự nghe lại.

---

## 6. Công thức trả lời

### 6.1 Câu hỏi kỹ thuật

```text
Định nghĩa ngắn (1 câu)
→ Cơ chế/nguyên lý (1–2 câu)
→ Ví dụ trong app (1 câu)
→ Trade-off / khi nào không dùng (1 câu)
→ Cách kiểm chứng hoặc lỗi thường gặp (1 câu)
```

Ví dụ với "Expanded vs Flexible":

> Cả hai chia phần trống trong Flex theo `flex`. `Expanded` là `Flexible(fit: tight)` nên
> ép con lấp đầy phần được chia; `Flexible` mặc định `loose` nên con được nhỏ hơn. Mình
> dùng `Expanded` cho cột text cần chiếm hết, `Flexible` khi badge chỉ cần tối đa phần
> còn lại. Nếu con không co được, `Flexible` vẫn có thể overflow, nên thường kết hợp
> `TextOverflow.ellipsis`. Mình kiểm tra bằng widget test ở các kích thước màn hình.

### 6.2 Câu hỏi hành vi (STAR)

- **S**ituation: bối cảnh, quy mô, ràng buộc.
- **T**ask: bạn chịu trách nhiệm gì.
- **A**ction: bạn làm gì, tại sao, ai tham gia.
- **R**esult: kết quả đo được, bài học.

Không kể "chúng tôi" nếu không nói rõ phần bạn làm. Không nhận công tập thể, cũng đừng
đổ lỗi đồng đội.

### 6.3 Câu hỏi system design

1. Làm rõ requirement + scale + phi chức năng.
2. Vẽ luồng dữ liệu end-to-end.
3. Chọn công nghệ và nêu trade-off.
4. Xử lý offline/lỗi/bảo mật/observability.
5. Nói cách đo và phương án khi scale gấp 10.

---

## 7. Red flags khi phỏng vấn

| Red flag | Vì sao nguy hiểm |
|---|---|
| "Dùng GetX vì nó ngắn" nhưng không nêu trade-off | Chọn công cụ theo cảm tính |
| Gọi API trong `build()` | Hiểu sai vòng đời widget |
| Không `dispose` controller/subscription | Rò rỉ bộ nhớ |
| Dùng `context` sau `await` mà không kiểm tra `mounted` | Crash hoặc dùng context đã hủy |
| `setState` cho mọi state, kể cả state toàn cục | Không phân biệt local/ephemeral |
| Không có loading/error/empty state | Chỉ nghĩ happy path |
| Không biết `const`, `ListView.builder` | Bỏ qua hiệu năng cơ bản |
| Không test gì cả | Thiếu kỷ luật chất lượng |
| Nói "Flutter không bao giờ jank" | Thiếu kinh nghiệm thực tế |
| Không biết release build khác debug thế nào | Chưa từng phát hành app |

---

## 8. Cách dùng đáp án đúng

- **Không học thuộc code**. Hiểu API và tự viết lại.
- **Kiểm tra phiên bản**: Flutter thay đổi nhanh; các API như `PopScope`, `NavigationBar`,
  `ThemeExtension`, `Isolate.run`, `dart:ffi` cần đối chiếu docs tại thời điểm dùng.
- **Đáp án có thể ngắn hơn**: khi phỏng vấn, 60–90 giây cho một câu là đủ; chỉ đi sâu khi
  người phỏng vấn hỏi tiếp.
- **Luôn nêu bối cảnh**: "Với app guestbook ít màn hình, mình chọn...; nếu app banking
  nhiều team, mình sẽ..." thể hiện tư duy tốt hơn một câu trả lời tuyệt đối.

---

## 9. Liên kết tài liệu liên quan

| Tài liệu | Dùng khi |
|---|---|
| [`../flutter-basics.md`](../flutter-basics.md) | Cần học lại nền tảng có ví dụ xuyên suốt |
| [`../flutter-advanced.md`](../flutter-advanced.md) | Đào sâu Riverpod/Bloc, offline, performance |
| [`../flutter-production.md`](../flutter-production.md) | Chuẩn bị release, signing, store |
| [`../../mobile-integration.md`](../../mobile-integration.md) | Hợp đồng REST/WebSocket với backend |
| [`../../websocket.md`](../../websocket.md) | Thiết kế realtime, reconnect, scale |
| [`../../api-security.md`](../../api-security.md) | Bảo mật API phía server |

---

*Bắt đầu với [`01-basics.md`](./01-basics.md).*
