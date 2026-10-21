# Khả dụng (Usability) — Nhân tố con người và kỹ nghệ khả dụng

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering*, Fall 2005 — hai bài:

- **Bài 16: Usability** (vì sao quan trọng, Hall of Shame, iterative design, mô hình xoắn ốc, định nghĩa khả dụng, năng lực con người: tri giác, vận động, trí nhớ, màu sắc)
- **Bài 17: Usability Engineering** (10 heuristic của Nielsen, prototype độ trung thực thấp, kiểm thử người dùng)

Giảng viên: GS. Rob Miller (MIT EECS).

---

## Mục lục

**Phần I — Nền tảng khả dụng (Bài 16)**

1. [Giao diện người dùng quan trọng — tại sao?](#1-giao-diện-người-dùng-quan-trọng--tại-sao)
2. [Sự thật từ "Sảnh vinh nhục giao diện"](#2sự-thật-từ-sảnh-vinh-nhục-giao-diện)
3. [Khó khi thiết kế: Bạn không phải người dùng](#3-khó-khi-thiết-kế-bạn-không-phải-người-dùng)
4. [Thiết kế lặp lại và mô hình xoắn ốc](#4-thiết-kế-lặp-lại-và-mô-hình-xoắn-ốc)
5. [Định nghĩa khả dụng — 5 chiều](#5-định-nghĩa-khả-dụng--5-chiều)
6. [Xử lý thông tin của con người (MHP model)](#6-xử-lý-thông-tin-của-con-người-mhp-model)
7. [Hợp nhất tri giác và phản hồi thời gian](#7-hợp-nhất-tri-giác-và-phản-hồi-thời-gian)
8. [Xử lý vận động và Luật Fitts](#8-xử-lý-vận-động-và-luật-fitts)
9. [Nhiệm vụ dẫn đường và menu xếp lớp](#9-nhiệm-vụ-dẫn-đường-và-menu-xếp-lớp)
10. [Trí nhớ: working và long-term, chunking](#10-trí-nhớ-working-và-long-term-chunking)
11. [Màu sắc: mù màu và aberration sắc](#11-màu-sắc-mù-màu-và-aberration-sắc)

**Phần II — Kỹ nghệ khả dụng (Bài 17)**

12. [Ba công cụ trong vòng lặp thiết kế](#12-ba-công-trong-vòng-lặp-thiết-kế)
13. [Heuristic là gì?](#13-heuristic-là-gì)
14. [10 heuristic của Nielsen](#14-10-heuristic-của-nielsen)
15. [Tổng kết heuristic theo 4 nhóm](#15-tổng-kết-heuristic-theo-4-nhóm)
16. [Prototype độ trung thực thấp](#16-prototype-độ-trung-thấp-thấp)
17. [Kiểm thử người dùng](#17-kiểm-thử-người-dùng)
18. [Cách quan sát người dùng và critical incidents](#18-cách-quan-sát-người-dùng-và-critical-incidents)
19. [Tóm tắt, tài liệu đọc thêm, bài tập](#19-tóm-tắt-tài-liệu-đọc-thêm-bài-tập)

---

# Phần I — Nền tảng khả dụng (Bài 16)

## 1. Giao diện người dùng quan trọng — tại sao?

> **Khả dụng nói về việc tạo ra giao diện người dùng (UI) hiệu quả.** Đánh một cửa sổ giao diện đẹp lên một chương trình **không tự động** mang lại khả dụng cho nó.

### Tại sao phải quan tâm?

Bạn có thể nghĩ: con người **có khả năng học và thích nghi phi thường**. Giao diện tệ nhất cũng sửa được bằng một *man page*, đúng không? Gác lại **bất nhân tính cốt lõi** của lập luận đó, có vài lý do **thực tế**:

| Lý do | Chi tiết |
|---|---|
| **UI định hình nhận thức về phần mềm** | Giao diện là phương tiện phần mềm **tự trình bày ra thế giới** |
| **Phần mềm dùng được bán tốt** | Đánh giá "dễ dùng" xuất hiện trong bài review tạp chí, ảnh hưởng **truyền miệng**, ảnh hưởng **quyết định mua** |
| **Web kém khả dụng bị bỏ rơi** | Trang web khó dùng đến mức người mua **không tìm thấy thứ họ muốn** hoặc **không qua được bước thanh toán** → họ **đi nơi khác** |

> **Phần mềm dùng được bán được. Ngược lại, phần mềm kém khả dụng thì không.**

### Nhận thức thường hời hợt — và hệ quả nguy hiểm

Nhận thức của người dùng về khả dụng **thường hời hợt**:

- Giao diện **hấp dẫn** có thể trông "thân thiện người dùng" dù **không thật sự dùng được**.
- Người dùng thường **tự trách mình** vì lỗi họ gây ra, kể cả khi lỗi có thể tránh bằng thiết kế tốt hơn. (*"Ối, mình lại lỡ qua menu File rồi! Mình ngu thế!"*)

> Khả dụng **hơi khác** các thuộc tính quan trọng khác của phần mềm như **độ tin cậy, hiệu năng, an ninh**:
>
> - Chương trình **chậm**, **đổ vỡ**, hay **bị hack** → biết **chỉ trích ai**.
> - Chương trình **khó dùng** nhưng **không chết người** → vấn đề khả dụng **có thể không được báo cáo**.

---

## 2. Sự thật từ "Sảnh vinh nhục giao diện"

*(Nguồn: Interface Hall of Shame — các ảnh chụp màn hình bị lược vì lý do bản quyền.)*

### 2.1 Ví dụ 1: thanh cuộn dùng để chọn template

Hộp thoại trong chương trình in **chứng chỉ khen thưởng tùy chọn**, presents nhiệm vụ **chọn template**. Giao diện này rõ ràng là **đồ họa**:

- **Điều khiển bằng chuột** — không gõ lệnh phức tạp.
- Thậm chí **WYSIWYG** — xem trước phần thưởng sẽ được tạo.

**Vậy tại sao không dùng được?**

**Bước đầu tiên phát hiện vấn đề:** thông báo trợ giúp dài bên trái. *Vì sao cần nhiều trợ giúp cho một nhiệm vụ chọn đơn giản?* Vì giao diện **kỳ quặc**: **thanh cuộn dùng để chọn template**. Mỗi vị trí trên thanh cuộn đại diện một template; di chuyển thanh cuộn qua lại **đổi template hiển thị**.

Đây là cách dùng thanh cuộn **đáng yêu nhưng xấu**:

| Câu hỏi | Vấn đề |
|---|---|
| Có bao nhiêu template? | **Không có vạch nào** trên thanh cuộn |
| Chúng sắp xếp thế nào? | Không đoán được |
| Phải cuộn bao xa để chọn cái tiếp theo? | **Không đoán được** |

**Tệ hơn với người dùng thường xuyên:**

- Muốn template đã dùng trước → làm sao tìm? Nhớ nó nằm ở **56% chiều dài thanh cuộn**?
- Giao diện **không cung cấp lối tắt**.
- Biến quá trình lẽ ra là **truy cập ngẫu nhiên** thành **quá trình tuyến tính**: mọi người dùng phải xem **mọi lựa chọn**, kể cả khi **đã biết** mình muốn cái nào. *Nhà khoa học máy tính trong bạn nên rùng mình với thuật toán đó.*

**Ngay cả thông báo trợ giúp cũng có vấn đề khả dụng:** *"Press OKAY"?* Đó là đâu? Và sao thông báo có **lề trái răng cưa** (ragged left)? Báo tạp chí ít khi dùng lề trái răng cưa — và có lý do chính đáng.

**Điểm tích cực duy nhất:** người thiết kế **ít nhất nhận ra có vấn đề** — nên mới có thông báo trợ giúp. Nhưng thông báo đó là **dấu hiệu của cách tiếp cận sai**:

> Khả dụng **không được để đến cuối** quá trình phát triển phần mềm, như artwork bao bì hay bộ cài đặt. Nó **không được vá** ở đây đó bằng thông báo thêm hay tài liệu thêm. Nó **phải là một phần của quá trình**, để **bug khả dụng được sửa** — chứ không chỉ được **vá**.

**Thiết kế lại:** template giờ nằm trong **list box** bên trái; chọn template hiện **xem trước** bên phải. Giao diện này **không mắc** vấn đề nào của bản trước:

- List box rõ ràng **mô phỏng khả năng chọn** (affordance) cho người dùng mới.
- **Truy cập ngẫu nhiên** trivial với người dùng thường xuyên.
- **Không cần** thông báo trợ giúp.

### 2.2 Ví dụ 2: hẹn giờ bằng chuột — biến GUI thành đồng hồ báo thức

Chương trình **khởi chạy tác vụ bảo dưỡng** theo lịch.

- Ngày và giờ **trông như** trường có thể sửa (**affordance!**) — nhưng **không sửa được bằng bàn phím**.
- Muốn đổi giờ → phải nhấp nút **Set Time** mở hộp thoại.
- Hộp thoại đó hiển thị giờ **khác kiểu**: **12 giờ** (7:17 pm) trong khi hộp thoại gốc dùng **24 giờ** (**consistency!**).
- Thêm nữa: còn thêm **biểu diễn thứ ba** — **mặt đồng hồ analog**.

**Vậy đổi giờ thực sự thế nào?** Bằng cách **nhấp nút chuột**: chuột trái tăng **phút** +1 (quay vòng 59→0), chuột phải tăng **giờ**. Nghe quen không?

> Nhà thiết kế này đã biến một **giao diện đồ họa tinh vi** — đầy cửa sổ, nút, widget, điều khiển bởi bàn phím **trăm phím** và chuột **hai nút** — thành một **đồng hồ báo thức!**

**Phần tệ nhất:** đây **không phải kết quả của lười biếng**. Ai đó đã **tốn công vẽ** mặt đồng hồ với kim. Giá như họ dùng bớt thời gian đó để **nghĩ về khả dụng**.

### 2.3 Ví dụ 3: GIMP — menu ngữ cảnh

GIMP (chỉnh ảnh mã nguồn mở, tương đương Photoshop) đưa ra lựa chọn **kỳ lạ**: cửa sổ GIMP **không có menu bar**. Mọi menu truy cập qua **menu ngữ cảnh** (nhấp chuột phải).

- **Không nhất quán** với ứng dụng khác → người dùng mới **vấp** khi tìm menu File (menu File **không bao giờ** xuất hiện ở menu ngữ cảnh của ứng dụng khác).
- Nhưng nhà thiết kế GIMP **có lẽ nghĩ về người dùng chuyên**: menu ngữ cảnh **mạnh hơn** vì không phải di chuột lên menu bar, và **mở được ở bất kỳ đâu**.

**Đúng không?** — **Sai.**

Với thiết kế GIMP, **ngay khi chuột hover** lên một lựa chọn (File, Edit), submenu **ngay lập tức** bật ra bên phải. Nghĩa là:

- Muốn tới một tùy chọn trong menu File → phải di chuột **cẩn thận sang phải**, **nằm yên trong** lựa chọn File, cho tới khi chạm submenu.
- Nếu chuột **lỡ lạc** vào mục Edit → menu File **biến mất**, thay bằng menu Edit.
- Muốn chọn File/Quit → **không kéo chuột thẳng hàng** được — phải **lái vào** menu File, **rẽ 90 độ**, rồi **đi xuống** Quit!

> **Menu xếp lớp thực ra chậm hơn menu bar.**
>
> Nhà thiết kế GIMP đã đưa ra lựa chọn mà **không xem xét đầy đủ** nó tương tác với **khả năng con người** như thế nào.

*(Xem phân tích khoa học ở mục 9 — Luật Fitts và nhiệm vụ dẫn đường.)*

### 2.4 Ví dụ 4: Clippy — tấm ghim giấy

Cuối cùng là **Paperclip** bị nhiều người chê. Clippy là nỗ lực **với thiện ý** giải quyết một **vấn đề khả dụng thật**:

- Người dùng **không đọc hướng dẫn**, **không dùng help online**, không biết cách tìm câu trả lời.
- Clippy cố **gợi ý** câu trả lời cho vấn đề nó **nghĩ** bạn đang gặp.

Tiếc là nó **thường sai**, **thường xâm nhập**, **thường gây bực**.

> **Chất lượng chủ quan** của giao diện cũng quan trọng.

---

## 3. Khó khi thiết kế: Bạn không phải người dùng

### Bạn không phải người dùng

| | |
|---|---|
| Phần lớn kỹ nghệ phần mềm là **giao tiếp với lập trình viên khác** | Người giống ta |
| **UI là giao tiếp với người dùng** | Người **không giống** ta |

Bạn (nhà phát triển) **không phải** người dùng điển hình. Bạn biết **nhiều hơn** người dùng bất kỳ về ứng dụng. Có thể cố tưởng tượng mình là **mẹ hay bà** — nhưng **không giúp mấy**. *Rất khó quên những thứ bạn biết.*

> Đây là điểm khả dụng **khác biệt với mọi thứ khác** bạn học về kỹ nghệ phần mềm: đặc tả, assertion, mô hình đối tượng đều là giao tiếp với **lập trình viên khác**; khả dụng là giao tiếp với **người dùng khác**.

### Người dùng luôn đúng

> **Người dùng luôn đúng.** Đừng **trách người dùng** khi có chuyện sai.
>
> Nếu người dùng **thường xuyên mắc lỗi** với một phần giao diện → đó là **dấu hiệu giao diện sai**, không phải người dùng **dốt**.
>
> Bài học này **rất khó nuốt** với nhà thiết kế phần mềm!

### ... nhưng người dùng không phải lúc nào cũng đúng

Người dùng **không phảioracle**. Họ không phải lúc nào biết mình **cần gì** hay cái gì **giúp được**.

**Nghiên cứu thập niên 1950:** hỏi người ta có muốn **ống nghe điện thoại nhẹ hơn** không — trung bình họ nói **hài lòng** với ống nghe hiện tại (lúc đó làm **đủ nặng** cho bền). Nhưng **thử thực tế** ống nghe giống hệt nhau **chỉ khác trọng lượng** → người ta **thích** ống nghe nặng bằng **gần một nửa** mức bình thường. *(Klemmer, Ergonomics, Ablex, 1989, pp 197-201.)*

### Người dùng không phải nhà thiết kế

> Dễ nói: *"Ừ giao diện dở thật, nhưng người dùng tự tùy biến được."*

Hai vấn đề:

1. **Hầu hết người dùng không** tự tùy biến.
2. **Tùy biến của người dùng có thể còn tệ hơn!**

Nghiên cứu về **viết tắt lệnh**: người dùng tạo **số lỗi gấp đôi** với viết tắt **của chính họ** so với bộ viết tắt được **thiết kế cẩn thận** *(Grudin & Barnard, "When does an abbreviation become a word?", CHI '85)*.

> Tùy biến **không phải viên đạn bạc** (silver bullet).

---

## 4. Thiết kế lặp lại và mô hình xoắn ốc

### Vòng lặp thiết kế

```
    ┌──────── Design ────────┐
    ▼                        │
 Implement ──── Evaluate ─────┘
```

> Phát triển UI là **quá trình lặp lại**. Bạn muốn vòng thiết kế diễn ra **bên trong**, hay **trước mắt khách hàng**?

Thiết kế lặp: phần mềm được **tinh chỉnh bằng các vòng lặp** quanh chu kỳ: trước tiên **tưởng tượng** (design), rồi **hiện thực hóa vật lý** (implementation), rồi **kiểm tra** (evaluation).

### Hai cái bẫy

| Bẫy | Điều gì xảy ra |
|---|---|
| **Thả cho thị trường** | Nhiều dự án UI thương mại **ép thiết kế lặp lên khách trả tiền**: thiết kế UI dở → hiện thực hóa → phát hành. Evaluation diễn ra **ở thị trường** — khách **bất hạnh** mua rồi **phàn nàn**. Rồi lặp trên **bản 2** |
| **Giấu trong nhà** | Giữ mọi lặp **bên trong** → có thể **không bao giờ phát hành gì!** Rất **đắt** để làm mọi vòng lặp bằng hiện thực hóa **chất lượng cao** trong Java/C++ — đặc biệt nếu phát hiện phải **vứt toàn bộ mã** vì thiết kế dở |

### Mô hình xoắn ốc (spiral model)

> **Dùng prototype vứt đi và đánh giá rẻ cho các vòng lặp đầu.**

Mô hình xoắn ốc đưa ra **lối thoát**: xây dựng **khoảng trống cho vài vòng lặp** trong quá trình, và làm vậy bằng cách làm **các vòng đầu rẻ nhất có thể**.

- **Chiều bán kính** của xoắn ốc tương ứng **chi phí của bước lặp** — hay đồng nghĩa, **độ trung thực (fidelity)** hoặc **độ chính xác** của nó.
- Ví dụ: hiện thực hóa đầu có thể là **bản phác giấy** hay **mockup**. **Độ trung thực thấp** — chỉ cái **bóng mờ** của hình dạng và hành vi phần mềm tương tác.
- Nhưng nó **rẻ kinh ngạc** để làm, và **đánh giá được** bằng cách **trình cho người dùng xem** và **hỏi họ câu hỏi**.

---

## 5. Định nghĩa khả dụng — 5 chiều

> **Khả dụng (usability): mức người dùng có thể dùng được chức năng của hệ thống.**

### Khác với "tốt" nói chung

Hệ thống có thể **tốt hay dở theo nhiều cách**:

| Tình huống | Thuộc tính liên quan |
|---|---|
| Yêu cầu quan trọng **không thỏa** | Thiếu **chức năng** — không phải khả dụng |
| **Đắt tiền** hoặc **hay đổ vỡ** | Chắc chắn giảm trải nghiệm — nhưng **không cần kiểm thử người dùng** để biết |

### Năm chiều của khả dụng

| # | Chiều | Câu hỏi |
|---|---|---|
| 1 | **Learnability** (dễ học) | Có **dễ học** không? |
| 2 | **Efficiency** (hiệu quả) | Sau khi học rồi, có **nhanh** khi dùng không? |
| 3 | **Memorability** (dễ nhớ) | Có **dễ nhớ** những gì đã học không? |
| 4 | **Errors** (lỗi) | Lỗi có **ít** và **khôi phục được** không? |
| 5 | **Satisfaction** (hài lòng) | Có **dễ chịu** khi dùng không? |

### Định lượng được

> Ta có thể **định lượng** mọi biện pháp khả dụng. Giống như nói thuật toán X **nhanh hơn** thuật toán Y trên tải công việc nào đó, ta nói giao diện X **dễ học hơn**, hoặc **hiệu quả hơn**, hoặc **dễ nhớ hơn** giao diện Y cho **tập nhiệm vụ** nào đó và **lớp người dùng** nào đó.

---

## 6. Xử lý thông tin của con người (MHP model)

> Giống như hiểu tính chất **máy tính** bạn đang lập trình (tốc độ CPU, bộ nhớ, ổ đĩa, OS, tương tác giữa chúng), điều quan trọng là hiểu vài tính chất của **con người** mà bạn thiết kế cho. Chủ đề này lớn hơn nhiều một bài giảng — chỉ nhắc vài điểm **đáng biết nhất** khi thiết kế UI.

### Mô hình trừu tượng

```
   ┌──────────────────┐        ┌──────────────────┐
   │ Perceptual        │        │ Cognitive         │
   │ Processor         │───────▶│ Processor         │
   │ (nhận thức)       │        │ (nhận thức)       │
   └────────▲──────────┘        └────────┬──────────┘
            │                           │
       ~100ms/cycle                 ~7ms/cycle
            │                           │
   senses ◀─┴─── feedback ◀── Motor ─────┘
   (giác quan)                   Processor (vận động)
                                 ~70ms/cycle
   ┌──────────────────┐        ┌──────────────────┐
   │ Working memory    │        │ Long-term memory  │
   │ 7 ± 2 chunks      │        │ lớn, suy giảm ít  │
   │ ~10 giây          │        │                    │
   └──────────────────┘        └──────────────────┘
```

### Các thành phần

| Thành phần | Vai trò |
|---|---|
| **Perceptual processor** (bộ xử lý tri giác) | Nhận đầu vào cảm giác, cố **nhận diện** thứ trong nó: chữ, từ, âm vị, icon, khuôn mặt... |
| **Cognitive processor** (bộ xử lý nhận thức) | So sánh và ra quyết định — làm phần lớn việc chúng ta coi là **"nghĩ"** |
| **Motor processor** (bộ xử lý vận động) | Nhận hành động từ bộ xử lý nhận thức, chỉ thị cơ **thực hiện**. Có **vòng phản hồi ngầm**: hiệu quả của hành động được **giác quan quan sát** và dùng để **sửa chuyển động** trong quá trình liên tục |
| **Working memory** | **Nhỏ** và **ngắn hạn** |
| **Long-term memory** | **Lớn** và **suy giảm rất ít** |

> Mô hình này **không nhằm phản ánh giải phẫu** hệ thần kinh — có lẽ **không có vùng nào** trong não tương ứng bộ xử lý tri giác. Nhưng nó vẫn là **trừu tượng hữu ích** — vì ta có thể **gán tham số số học** cho các thành phần để ước lượng **sơ bộ** hành vi người dùng.

---

## 7. Hợp nhất tri giác và phản hồi thời gian

### Hợp nhất tri giác (perceptual fusion)

> Hai kích thích **cùng một chu kỳ** của bộ xử lý tri giác (**~100 ms**) có vẻ **hợp nhất** (fused).

**Cơ chế:** mỗi chu kỳ, bộ xử lý tri giác **chụp một khung hình**. Hai sự kiện cách nhau **ít hơn chu kỳ** có vẻ nằm **cùng khung**. Nếu chúng **tương tự** (vd Mickey Mouse ở vị trí này, rồi lát sau vị trí khác) → chúng **hợp thành một** sự kiện tri giác — *một Mickey Mouse đang chuyển động*.

### Hệ quả

| Hệ quả | Chi tiết |
|---|---|
| **10 khung/giây** đủ để tri giác **ảnh chuyển động** | 20 khung/giây **tốt hơn** (`Tp` có thể nhanh tới **50 ms** với người nhanh nhất, điều kiện thuận lợi nhất) |
| Phản hồi máy tính **< 100 ms** | Cảm thấy **tức thì** (instantaneous) với hành động |
| **Nhân quả** bị ảnh hưởng mạnh bởi hợp nhất | Nếu hai sự kiện cách nhau **< Tp** → có xu hướng tin cái trước **gây ra** cái sau |

- Hệ thống có phản hồi kiểu đó có vẻ là **phần mở rộng của cơ thể người dùng**.
- Nếu dùng trình soạn văn bản mất **hơn Tp** để hiển thị **mỗi phím bấm** → bạn sẽ **nhận ra**.

> Áp dụng thực tế: **điều gì đó phải đổi, nhìn thấy được, trong 100 ms** — nếu không, hợp nhất tri giác bị **phá vỡ** (xem mục 14, heuristic #5).

---

## 8. Xử lý vận động và Luật Fitts

### Hai chế độ điều khiển

| Chế độ | Mô tả | Chu kỳ |
|---|---|---|
| **Open-loop** (mở) | Bộ xử lý vận động **chạy chương trình của chính nó**, lặp chỉ thị cho cơ. **Không nhận phản hồi** từ hệ tri giác | `Tm ~ 70 ms` |
| **Closed-loop** (đóng) | Vòng phản hồi **đầy đủ**: hệ tri giác nhìn bộ xử lý vận động làm gì, hệ nhận thức ra quyết định **sửa chuyển động**, rồi bộ vận động phát chỉ thị mới | `Tp + Tc + Tm ~ 240 ms` |

### Thử nghiệm đơn giản (tự đo)

Lấy một tờ giấy kẻ dòng, **vẽ sóng cưa** qua lại giữa hai dòng, **nhanh nhất có thể** nhưng cố **trúng dòng chính xác** ở mọi đỉnh/đáy. Làm 5 giây:

- Tần số **sóng mang** do điều khiển **open-loop** quy định → dùng để suy ra `Tm`.
- Tần số **bao envelop** của sóng (các **sửa** bạn phải làm để quay lại dòng) là điều khiển **closed-loop** → suy ra `Tp + Tc`.

### Luật Fitts — nhiệm vụ trỏ

> **Mất bao lâu để chạm tới mục tiêu?**
>
> - Di chuột tới mục tiêu trên màn hình
> - Di ngón tay tới phím trên bàn phím
> - Di tay **giữa** bàn phím và chuột

Luật Fitts mô tả **nhiệm vụ trỏ tới mục tiêu kích thước S ở khoảng cách D** (trong tầm tay). Đây là **luật cơ bản** của hệ cảm giác–vận động con người, được **nhiều nghiên cứu tái lập**.

### Suy ra luật từ mô hình MHP

Chạm mục tiêu là **điều khiển closed-loop**:

1. Mỗi chu kỳ, hệ vận động chỉ thị tay di **toàn bộ khoảng cách còn lại D**.
2. Độ chính xác của chuyển động **tỷ lệ với khoảng cách di** → tay dừng trong **sai số αD** của mục tiêu (có thể **trượt ngắn** hoặc **vượt qua**).
3. Bộ tri giác/nhận thức thấy tay **ở đâu**, so với mục tiêu, rồi phát lệnh **sửa** quãng còn lại **αD** — nhưng lại với sai số tỷ lệ → giờ tay trong **α²D**.
4. Lặp lại, sai số **giảm hình học**, tới khi n vòng đưa tay vào mục tiêu: `αⁿD ≤ S`.

Giải `n`, đặt tổng thời gian `T = n(Tp + Tc + Tm)`:

```
T = a + b · log(D/S)
```

- `a` = thời gian phản ứng để tay **bắt đầu di chuyển**.
- `b = -(Tp + Tc + Tm)/log α`.

*(Biểu đồ trong bài cho thấy quỹ典型: đồ thị vị trí–thời gian là chuỗi xen kẽ **di chuyển** và **tĩnh** — mỗi cặp là một chu kỳ; đồ thị vận tốc cho thấy vận tốc mỗi chu kỳ **nhỏ dần** vì phải **chính xác hơn**.)*

### Hệ quả thiết kế: "bất động sản" mép màn hình

```
T = RT + MT = a + b · log(D/S)
log(D/S) là chỉ số độ khó của nhiệm vụ trỏ
```

- **Mép màn hình chặn** con trỏ chuột → **không cần vòng sửa** để trúng. Về bản chất, mép màn hình như mục tiêu **cỡ vô hạn**.
- Vì thế **bất động sản mép màn hình rất quý**.
- **Menu bar Macintosh** (ở **đỉnh** màn hình) **nhanh hơn** menu bar Windows (dù cửa sổ maximize vẫn bị title bar đẩy xuống).

> Nếu đặt điều khiển **tại mép màn hình**, chúng nên **hoạt động suốt tới mép** để tận dụng hiệu ứng này. **Đừng** đặt lề không nhấp được bên cạnh.

---

## 9. Nhiệm vụ dẫn đường và menu xếp lớp

### Hai loại nhiệm vụ

| Loại | Đạo hàm |
|---|---|
| **Trỏ tự do** (unconstrained) | `T = a + b · log(D/S)` — Luật Fitts |
| **Dẫn đường trong hầm** (tunnel) | Task **khó hơn nhiều** |

### Vì sao menu xếp lớp chậm — phân tích

Luật Fitts áp dụng **khi con đường tới mục tiêu không bị giới hạn**. Nhưng task **nhiều hơn** nếu con đường **bị giới hạn vào một hầm** (vd submenu):

> Đây là lý do **cascading menus chậm!**

Vì người dùng phải **giữ chuột trong hầm menu**, họ phải di **chậm enough** để sai số mỗi chu kỳ (`αd` — `d` là khoảng di trong chu kỳ) **luôn nhỏ hơn `S`**:

- Khoảng cách mỗi chu kỳ: `d ≤ S/α`
- Tổng số chu kỳ **tỷ lệ với `D/S`** — chậm hơn **rất nhiều** so với `log(D/S)` của Fitts — **chậm theo hàm mũ!**

### So sánh ba hệ điều hành với cùng bài toán

| Hệ | Hành vi | Đánh giá |
|---|---|---|
| **GIMP** | Submenu **biến mất ngay** khi chuột thoát hầm | **Tệ nhất có thể** |
| **Windows** | Phải hover ~**0,5 giây** trước khi submenu hiện → trượt ngắn không mất mục tiêu | Khá hơn — nhưng **vượt Tp** → **phá hợp nhất tri giác** và cảm giác nhân quả; **vẫn phải rẽ góc cua** |
| **Macintosh** | Khi submenu mở, có **vùng tam giác** lan từ chuột tới submenu — chuột di trong đó **không mất submenu** | **Tốt nhất**: chỉ thẳng vào submenu **không cần sửa bất thường**, thậm chí **không nhận ra** có vấn đề |

---

## 10. Trí nhớ: working và long-term, chunking

### Working memory (trí nhớ làm việc)

| Tính chất | Giá trị |
|---|---|
| **Kích thước** | **7 ± 2** chunks — *nhỏ đấy!* |
| **Thời lượng** | ~**10 giây** |
| **Duy trì** (maintenance rehearsal — lặp lại) | Chống suy giảm **nhưng tốn sự chú ý** → **phân tâm có thể phá** working memory |

- Working memory là nơi bạn **nghĩ có ý thức** — bộ xử lý nhận thức **lấy操作数** và **đặt kết quả** ở đó.
- Mô hình được ưa chuộng hiện nay: working memory **không phải nơi riêng** trong não, mà là **mẫu kích hoạt** các phần tử trong **long-term memory**.

> **Giao diện tốt sẽ không đặt gánh nặng nặng** lên working memory của người dùng.

### Long-term memory (trí nhớ dài hạn)

- Kích thước và thời lượng **về thực tế là vô hạn**.
- Bộ nhớ dài hạn **rõ ràng không bị xóa có chủ ý** — chúng chỉ trở nên **không truy cập được**.
- **Maintenance rehearsal** (lặp lại) **vô dụng** để chuyển thông tin vào trí nhớ dài hạn. Cơ chế có vẻ là **elaborative rehearsal** — tìm cách **nối với các chunk hiện có**.
- Elaborative rehearsal **đứng sau sức mạnh** của kỹ thuật ghi nhớ (mnemonic) — liên kết thứ cần nhớ với **nơi quen thuộc** (phòng thời thơ ấu). Nó cũng **tốn资源 chú ý**.

### Chunking

> **"Chunk" = đơn vị của tri giác hoặc trí nhớ.**
>
> Chunking **phụ thuộc cách trình bày** và **kiến thức sẵn có**.

```
M W R C A A O L I B M F B I B    ← các chữ lẻ
MWR CAA OLI BMF BIB              ← nhóm 3 chữ
BMW RCA AOL IBM FBI              ← tổ hợp có nghĩa (TLA quen thuộc)
```

- Chuỗi **chữ lẻ** tend bị chunk thành **chữ**; chuỗi **nhóm 3 chữ** tend bị chunk thành **nhóm**.
- Cũng phụ thuộc bạn **đã biết gì**: nếu nhóm 3 chữ là **TLA** (three-letter acronym) đã **ổn trong trí nhớ dài hạn**, giữ trong working memory **tốt hơn**.
- **3–4 chữ số** là mức chunk **lý tưởng** cho việc mã hóa **chữ số không liên quan**.

**Nghiên cứu cờ vua kinh điển:**

| Người | Kết quả |
|---|---|
| **Mới chơi** | Chỉ nhớ được vị trí **vài quân** |
| **Bậc thầy** | Nhớ **toàn bộ bàn cờ** — nhưng **chỉ khi quân cờ sắp xếp theo thế hợp lệ** |
| **Bậc thầy, quân ngẫu nhiên** | **Không giỏi hơn người mới** |

Khả năng nhớ thế cờ của bậc thầy đến từ khả năng **chunk bàn cờ** — nhận ra **mẫu** từ kinh nghiệm chơi và nghiên cứu.

---

## 11. Màu sắc: mù màu và aberration sắc

### Mù màu

| Số liệu | Chi tiết |
|---|---|
| **8%** người không phân biệt **đỏ–xanh** | Đa số **đàn ông** |
| Mù **xanh–vàng** cũng tồn tại | **Hiếm hơn** |

> Vì mù màu ảnh hưởng **nhiều người**, nó **cần thiết** phải tính tới khi quyết định dùng màu trong UI.
>
> **Đừng phụ thuộc duy nhất vào phân biệt màu** — đặc biệt **đỏ–xanh** — để truyền thông tin.

**Ví dụ sai:** ứng dụng Microsoft Office — gạch **sóng đỏ** báo lỗi **chính tả**, gạch **sóng xanh giống hệt** báo lỗi **ngữ pháp**.

**Ví dụ khác — đèn giao thông:** người mù đỏ–xanh biết đèn xanh hay đỏ thế nào? May thay, đèn giao thông Mỹ có **gợi ý không gian**: đỏ **luôn ở trên** (hoặc **trái**) xanh. Với vài loại mù đỏ–xanh, đèn đỏ cũng **tối hơn** đèn xanh.

### Aberration sắc (chromatic aberration)

> **Thấu kính không thể lấy nét xanh và đỏ cùng lúc.**

- Chỉ số khúc xạ của thủy tinh thể **phụ thuộc bước sóng** — giống lăng kính, bước sóng khác **uốn khác góc**.
- Mắt cần **lấy nét khác** cho chi tiết đỏ so với chi tiết xanh.
- Kết quả: **biên** giữa hai bước sóng **cách xa** (như xanh và đỏ) **không thể lấy nét** — luôn **mờ mờ**.

> **Chữ xanh trên đỏ** (hoặc đỏ trên xanh) **đau mắt khi đọc** — nên **tránh bằng mọi giá**.

**Ví dụ xấu có thật:** công cụ **ForceQuit** của Apple trong Mac OS X — ứng dụng không phản hồi hiển thị **màu đỏ**, nhưng phần chọn được highlight **màu xanh**. Kết quả: **cực kỳ khó đọc**.

---

# Phần II — Kỹ nghệ khả dụng (Bài 17)

## 12. Ba công cụ trong vòng lặp thiết kế

Nhắc lại mô hình xoắn ốc / thiết kế lặp từ bài trước:

```
    1. Design ──────────┐
    ▼                   │
 3. Evaluate ◀── 2. Implement
```

| Vòng | Công cụ |
|---|---|
| **1. Design** | **Nguyên tắc thiết kế** (design principles) — dẫn hướng sự hình dung UI |
| **2. Implement** | **Prototype độ trung thực thấp** (low-fidelity prototypes) — thử thiết kế **rẻ và dễ** |
| **3. Evaluate** | **Kiểm thử người dùng** (user testing) — **đo lường** thiết kế có dùng được không |

---

## 13. Heuristic là gì?

> **Guideline khả dụng**, hay **heuristic**, là các quy tắc **chưng cất** nguyên tắc của giao diện người dùng hiệu quả.

### Có rất nhiều bộ để chọn

- **10 nguyên tắc của Nielsen**
- **16 nguyên tắc của Tognazzini** (Tog)
- **Hướng dẫn nền tảng** (platform guidelines)

Thậm chí có vẻ như **mọi nhà nghiên cứu khả dụng** có bộ heuristic riêng.

### Nhưng chuyên gia không bất đồng về "giao diện tốt"

> Các chuyên gia **không bất đồng** về **thứ gì cấu thành UI tốt**. Họ chỉ bất đồng về cách **tổ chức kiến thức thành tập quy tắc vận hành nhỏ**.

### Hai cách dùng heuristic

| Giai đoạn | Cách dùng |
|---|---|
| **Thiết kế** | **Chọn giữa** các phương án thay thế |
| **Đánh giá** | **Tìm và biện minh** vấn đề trong giao diện — gọi là **"heuristic evaluation"** |

### Hướng dẫn nền tảng — hữu ích nhưng hẹp

- Rất **cụ thể**: vd phải có menu **File**, và lệnh **Exit** trên đó (không phải Quit, không phải Leave, không phải Go Away).
- Tuân theo → đảm bảo **tính nhất quán** giữa các ứng dụng cùng nền tảng — **giá trị** cho cả người mới lẫn người thường xuyên.
- Nhưng **hạn chế về phạm vi** — chỉ giải quyết **vài** trong số quyết định thiết kế của một UI điển hình.

---

## 14. 10 heuristic của Nielsen

### #1. Match the Real World — khớp với thế giới thực

*(Tên gốc của Nielsen: **"Speak the user's language"** — khẩu hiệu dễ nhớ.)*

| Quy tắc | Chi tiết |
|---|---|
| Dùng **từ thường**, không thuật ngữ kỹ thuật | Người dùng nói tiếng Anh → UI nói tiếng Anh, **không nói Geekish**. Dùng jargon phản ánh **mô hình hệ thống tràn vào mô hình giao diện** một cách không cần thiết |
| Dùng thuật ngữ **riêng của miền** khi phù hợp | Giao diện cho **bác sĩ** không nên **làm ngu** thuật ngữ y khoa |
| **Không đặt giới hạn** cho tên do người dùng định nghĩa | Nên tự do chọn tên **dài, mô tả**. DOS từng giới hạn tên file **8 chữ + 3 phần mở rộng** — vang hưởng vẫn còn trong Windows ngày nay |
| Hỗ trợ **nhiều bí danh/từ đồng nghĩa** cho lệnh/tìm kiếm | Một nghiên cứu: xác suất hai người dùng nhắc **cùng tên** chỉ **7–18%** *(Furnas et al., "The vocabulary problem in human-system communication," CACM v30 n11, 1987)* |
| **Ẩn dụ** (metaphor) hữu ích nhưng **có thể gây hiểu lầm** | Giao diện **phải lệch** ẩn dụ ở điểm nào đó — nếu không, sao không dùng **vật lý thật**? Tại các điểm lệch, ẩn dụ có thể **gây hại nhiều hơn** |

**Ví dụ điển hình:** hộp thoại *"Type mismatch"* — một người dùng **đọc `type` như động từ** và gõ **M-I-S-M-A-T-C-H** mỗi lần hộp thoại hiện. Phản ứng **hoàn toàn hợp lý** khi nhớ hầu hết người dùng computer **cả ngày chỉ gõ**. Nhưng lập trình viên **sẽ không nghĩ** đọc thông điệp theo cách đó. Một ví dụ nữa cho **"Bạn không phải người dùng."**

**Ẩn dụ máy chữ:** dễ nói *"soạn văn bản giống máy chữ"* — nhưng **không nên** dùng như máy chữ. Nhấn Enter mỗi lần con trỏ gần lề phải (như máy chữ đòi) sẽ **phá hoại** tính **tự ngắt dòng** của phần mềm.

---

### #2. Consistency and Standards — nhất quán và tiêu chuẩn

**Principle of Least Surprise** (nguyên tắc ít bất ngờ):

> **Cái giống nhau nên trông và hành xử giống nhau. Cái khác nhau nên trông khác nhau.**

Áp dụng cho **nhiều** tính chất: **thuật ngữ, kích thước, vị trí, màu sắc, thứ tự...**

- Tuân **tiêu chuẩn nền tảng**.
- **Quan trọng nhất: tính nhất quán về cách đặt tên (wording).** Nếu một chỗ nói *"share price"*, chỗ khác *"stock price"*, chỗ nữa *"stock quote"* → người dùng tự hỏi đây có phải **ba thứ khác nhau**.

**Nghịch lý giữa heuristic #1 và #2:**

| | Quy tắc |
|---|---|
| **#1 Match Real World** | Ủng hộ **từ đồng nghĩa** → lệnh nên có delete, erase, remove |
| **#2 Consistency** | Ủng hộ **một tên cho một lệnh** → nếu không người dùng tưởng **ba lệnh khác nhau** |

**Cách gỡ:** xem **ngữ cảnh** áp dụng heuristic:

- **Khi giao diện NGHE** (user nói) → nỗ lực **tối đa hiểu** người dùng, cho phép đồng nghĩa/bí danh.
- **Khi giao diện NÓI** → **nhất quán**, luôn cùng tên cho cùng lệnh/đối tượng.
- UI đủ thông minh **tự thích nghi**? Có lẽ — nhưng **giao diện thích nghi** vẫn là **lĩnh vực nghiên cứu active**, chưa biết nhiều.

**Ba loại nhất quán cần lo:**

| Loại | Ví dụ |
|---|---|
| **Nội tại** (internal) | Trong chính ứng dụng (3 layout hộp thoại VB khác nhau → thiết kế nhất quán chỉ dùng **một**) |
| **Ngoại tại** (external) | Với ứng dụng khác cùng nền tảng (app Windows khác xếp OK/Cancel thế nào?) |
| **Ẩn dụ** (metaphorary) | Với ẩn dụ giao diện hoặc vật thể thế giới thực tương tự |

**Bài học Dvorak:** thiết kế **nghiêm trọng không nhất quán** nhưng chỉ cải thiện **tí hiệu năng** sẽ **thất bại**. Bàn Dvorak **nhanh hơn một chút** QWERTY, nhưng **không đủ** để vượt sức mạnh của **tiêu chuẩn đã ăn sâu**.

---

### #3. Help and Documentation — trợ giúp và tài liệu

> **Người dùng không đọc manual** — thích dành thời gian làm **mục tiêu công việc**, không phải **học về hệ thống**.
>
> Nhưng manual và help online là **sống còn** — thường khi người dùng **bực bội** hoặc **kẹt**.

**Trợ giúp tốt nên:**

| Thuật ngữ | Nghĩa |
|---|---|
| **Searchable** | Tra được |
| **Context-sensitive** | Theo ngữ cảnh |
| **Task-oriented** | Theo nhiệm vụ |
| **Concrete** | Cụ thể |
| **Short** | Ngắn |

*(Đây cũng là bối cảnh của Clippy — mục 2.4: thiện ý nhưng sai/xâm nhập/gây bực.)*

---

### #4. User Control and Freedom — kiểm soát và tự do của người dùng

*(Tên cũ trong danh sách Nielsen: **"Clearly Marked Exits"** — lối thoát được đánh dấu rõ.)*

| Quy tắc | |
|---|---|
| Người dùng **không được kẹt** bởi giao diện | Mọi hộp thoại **phải có nút Cancel** (ở đâu trong hộp thoại CuteFTP này?) |
| Thao tác **dài** phải **hủy được** | |
| **Cung cấp undo** | Cách tuyệt vời để hỗ trợ **khám phá** |
| Người dùng phải **khám phá được** giao diện | **Không sợ** bị kẹt trong ngõ cụt |

---

### #5. Visibility of System Status — hiển thị trạng thái hệ thống

*(Tên cũ đơn giản: **"Feedback"**.)*

> **Giữ người dùng thông báo** về chuyện gì đang xảy ra.

**Các thần thức feedback đã có — hãy dùng:**

| Thần thức | Dùng để chỉ |
|---|---|
| **Đổi con trỏ** | hành động có thể (bàn tay trên hyperlink), chế độ (drag/drop), hoạt động (đồng hồ cát) |
| **Highlight** | đối tượng được chọn. **Đừng** để lựa chọn **ngầm** |
| **Status bar** | thông điệp và chỉ báo tiến độ |

**Nhưng đừng làm quá:** hộp thoại này đòi **một cú nhấp** của người dùng. *Tại sao?* Giao diện cần được **vỗ tay** khi xong chuyển đổi? Tốt hơn nên **bỏ qua** và hiện tài liệu kết quả.

**Theo thời gian phản hồi (liên hệ mục 7):**

| Thời gian | Phản hồi cần |
|---|---|
| **< 0,1 s** | Cảm thấy **tức thì** |
| **0,1–1 s** | Người dùng **nhận ra** nhưng **không cần** feedback |
| **1–5 s** | Hiển thị **con trỏ bận** (busy cursor) |
| **> 1–5 s** | Hiển thị **thanh tiến độ** |

> Dù nói "không cần feedback" nếu < 1 giây, nhớ: **điều gì đó phải đổi**, nhìn thấy được, **trong 100 ms** — nếu không **hợp nhất tri giác bị phá**.

---

### #6. Flexibility and Efficiency — linh hoạt và hiệu quả

*(Tên cũ: **"Shortcuts"** — lối tắt.)*

> Người dùng thường xuyên **cần và muốn** lối tắt.

| Loại lối tắt | Ví dụ |
|---|---|
| **Keyboard accelerators** | Phím tắt |
| **Command abbreviations** | Viết tắt lệnh |
| **Styles** | Kiểu |
| **Bookmarks** | Dấu trang |
| **History** | Lịch sử — menu **dùng gần đây** là loại lối tắt **rất hữu ích** |

---

### #7. Error Prevention — phòng ngừa lỗi

> Vì con người **gây lỗi khi có cơ hội**, giải pháp tốt nhất là **ngăn lỗi hoàn toàn**.

| Kỹ thuật | Chi tiết |
|---|---|
| **Chọn thay vì gõ** | Lỗi chính tả trở thành **không thể**. Nhưng thái độ này có thể **đi quá xa** (xem ảnh minh họa) |
| **Lệnh bất hợp pháp → disable** ("mờ đi") | Ví dụ: Copy **không thể** nếu không chọn gì → lệnh **không chọn được ngay từ đầu** |
| **Tránh chế độ** (modes) | — |

**Mode là gì?** Trạng thái mà **cùng một hành động có nghĩa khác nhau**:

- **Caps Lock**: phím chữ sinh **chữ hoa**.
- **`vi` nổi tiếng với mode**: chế độ **chèn** (insert) phím chữ **chèn vào file**; chế độ **lệnh** (mặc định) phím chữ **gọi lệnh sửa**.

**Mode error** xảy ra khi người dùng cố gọi hành động **không có hiệu quả mong muốn** trong chế độ hiện tại (vd muốn gõ chữ thường nhưng không注意到 Caps Lock bật).

**Cách giảm mode error:**

| Cách | Ghi chú |
|---|---|
| **Loại bỏ hoàn toàn mode** | Tốt nhất, dù **không phải lúc nào cũng được** |
| Khi mode **cần thiết** → phải **hiển thị mode** | Nhưng hiển thị mode **khó hơn affordance nhiều** — khi mode error xảy ra, người dùng **không chủ động tìm** chế độ, như họ tìm **điều khiển**. Vì thế chỉ báo mode phải nằm trong **locus of attention** (vùng chú ý). Đó là lý do **đèn Caps Lock không thật sự hoạt động** *(Raskin, The Humane Interface, 2000 — thảo luận tốt về locus of attention)* |
| **Spring-loaded mode** (mode có lò xo) | Người dùng phải **làm gì đó chủ động** để **giữ** chế độ thay thế → gần như loại bỏ cơ hội **quên** mình ở chế độ nào. **Phím Shift** là bản spring-loaded của mode chữ hoa. **Drag-and-drop** cũng vậy — chỉ di kéo **chừng nào giữ** chuột |
| **Temporary mode** (mode tạm) | Rất ngắn hạn. Nhiều phần mềm đồ họa: chọn công cụ vẽ (chữ nhật, đường thẳng) → mode vẽ chỉ active cho **một thao tác chuột**. Vẽ xong một hình → mode **tự quay lại** trỏ thường |

---

### #8. Recognition, Not Recall — nhận ra, đừng nhớ lại

*(Tên gốc: **"Minimize Memory Load"** — giảm gánh nặng trí nhớ; nó dẫn dắt phần lớn thiết kế UI hiện đại.)*

| Quy tắc | |
|---|---|
| Dùng **menu**, không ngôn ngữ lệnh | |
| Dùng **combo box**, không textbox | |
| Thông tin cần thiết phải **hiển thị** | |

**Chọn tốt hơn gõ** vì **giảm gánh nặng trí nhớ** cho người dùng.

**Phân biệt của Norman** (*The Design of Everyday Things*):

| Loại | Định nghĩa |
|---|---|
| **Knowledge in the head** (kiến thức trong đầu) | Khó **đút vào**, còn **khó hơn lấy ra** |
| **Knowledge in the world** (kiến thức ngoài thế giới) | **Truy cập được far hơn** — không chỉ tài liệu, nhãn nút, biển báo, mà cả **tính chất phi ngôn ngữ** của hệ thống **hạn chế hành động** hay **nhắc việc cần làm** |

> **Ngôn ngữ lệnh đòi nhiều knowledge in the head; menu dựa vào knowledge in the world.**

Bất kỳ thông tin nào nhiệm vụ cần phải **hiển thị hoặc truy cập được** trong giao diện cho nhiệm vụ đó. Giao diện **không nên** bắt người dùng **nhớ** địa chỉ email muốn gửi thư, hay **mã sản phẩm** muốn mua.

**Ví dụ xấu:** hộp thoại modal này — người dùng **không thể bắt đầu** làm theo hướng dẫn cho tới khi nhấp OK. Nhưng rồi hướng dẫn **biến mất** khỏi màn hình → người dùng **chật vật nhớ**. Giải pháp显然: một nút **thực thi luôn hướng dẫn**! Thông điệp này rõ ràng là **vá phút chót** cho một vấn đề khả dụng.

---

### #9. Error Reporting, Diagnosis, and Recovery — báo cáo, chẩn đoán và khôi phục lỗi

| # | Yêu cầu | |
|---|---|---|
| 1 | **Chính xác** (precise) | Nêu lại **đầu vào của người dùng**: không *"Cannot open file"*, mà *"Cannot open file named **paper.doc**"* |
| 2 | **Ngôn ngữ người dùng** | Tránh thuật ngữ và chi tiết kỹ thuật **trừ khi được yêu cầu tường minh** |
| 3 | **Trợ giúp mang tính xây dựng** | **Tại sao** lỗi xảy ra và **cách sửa** |
| 4 | **Lịch sự** | Không *"fatal error"*, không *"illegal"* |
| — | **Ẩn chi tiết kỹ thuật** (stack trace) | Cho tới khi được **yêu cầu** |

> Thông điệp nên được đặt chữ để **chừa尽可能 nhiều lỗi cho hệ thống**, **dồn lỗi lên hệ thống**. **Giữ thể diện người dùng**; đừng lo cho máy tính. Máy tính **không cảm thấy gì**, và trong nhiều trường hợp **lỗi tại giao diện** vì không tìm ra cách **ngăn lỗi ngay từ đầu**.

**Tooltip từ bản phát hành thật của AutoCad:** theo truyền thuyết, một lập trình viên **chèn vào làm trò đùa** — nhưng somehow **không gỡ trước khi phát hành**.

---

### #10. Aesthetic and Minimalist Design — thẩm mỹ và thiết kế tối giản

> **"Less is More"** — bớt là nhiều.
>
> **Bỏ** thông tin thừa, đồ họa thừa, tính năng thừa.

Đây là **catch-all** cho nhiều quy tắc thiết kế đồ họa tốt — thực chất quy về **một từ: sự đơn giản**.

| Quy tắc | |
|---|---|
| **Bỏ thứ gì ra** trừ khi có lý do tốt | Đừng đặt nhiều help text hơn **thực sự cần** trên cửa sổ chính |
| Bỏ đồ họa thừa | |
| **Quan trọng nhất: bỏ tính năng thừa** | Tính năng **không bao giờ được dùng** → không lý do让它 làm phức tạp giao diện |

**Ví dụ tích cực:** **Google** và **remote TiVo** — triết lý less-is-more.

**Thiết kế đồ họa tốt (phần bổ sung):**

| Quy tắc | Chi tiết |
|---|---|
| **Màu và font ít, chọn kỹ** | Thanh công cụ thứ nhất đầy màu **bão hòa** → **lòe loẹt, gây xao nhãng, khó quét**. Thanh Microsoft Office chỉ dùng **một nhúm màu** — đen, trắng, xám, xanh, vàng — **dịu, tĩnh**, dùng hiệu quả để **phân biệt icon** |
| **Nhóm bằng whitespace** | Khoảng trắng tách nhóm icon **giúp rất nhiều** |
| **Căn chỉnh điều khiển hợp lý** | Hộp thoại minh họa layout **bày bừa, khó hiểu** khi điều khiển **không căn** |
| Dùng **ngôn ngữ cô đọng** | |
| **Chọn label cẩn thận** | |

*(Bài giảng có nói sẽ bàn thiết kế đồ họa **chi tiết hơn** ở bài sau.)*

---

## 15. Tổng kết heuristic theo 4 nhóm

> Vì **khó học 10 heuristic và giữ trong đầu** khi đang thiết kế, tác giả phân loại thêm:

### Nhóm A — Meet expectations (Đáp ứng kỳ vọng)

| # | Heuristic | Nội dung |
|---|---|---|
| 1 | **Match the real world** | Giao diện **vận hành** tốt với môi trường, nhiệm vụ, người dùng thế nào: **nói ngôn ngữ người dùng** |
| 2 | **Consistency & standards** | **Nhất quán** với chính nó và ứng dụng khác |
| 3 | **Help & documentation** | Đáp ứng **kỳ vọng về help** khi cần |

### Nhóm B — User is the boss (Người dùng là sếp)

| # | Heuristic | Nội dung |
|---|---|---|
| 4 | **User control & freedom** | **Đừng đẩy sếp vào góc** |
| 5 | **Visibility of system status** | **Giữ sếp biết** chuyện gì đang xảy ra |
| 6 | **Flexibility & efficiency** | Làm sếp **hiệu quả và productive** |

### Nhóm C — Handle errors (Xử lý lỗi)

| # | Heuristic | Nội dung |
|---|---|---|
| 7 | **Error prevention** | **Ngăn tối đa** |
| 8 | **Recognition, not recall** | **Đừng dựa vào trí nhớ** con người |
| 9 | **Error reporting, diagnosis, recovery** | Khi lỗi **không tránh được**, **báo cáo đúng cách** |

### Nhóm D — Keep it simple (Giữ đơn giản)

| # | Heuristic |
|---|---|
| 10 | **Aesthetic & minimalist design** — xứng đáng ở **nhóm riêng** vì **tầm quan trọng áp đảo** |

---

## 16. Prototype độ trung thực thấp

> **Giấy là công cụ prototype nhanh nhất.**

| Quy tắc | Chi tiết |
|---|---|
| **Phác cửa sổ, menu, hộp thoại, widget** | |
| **Làm ra rất nhiều thiết kế** và **đánh giá** chúng | |
| **Phác tay OK — thậm chí ưa chuộng hơn** | |
| **Tập trung vào hành vi & tương tác**, không phải font & màu | |
| Prototype giấy có thể **thực thi được** | Dùng các **mảnh giấy** đại diện cửa sổ/hộp thoại/menu; **mô phỏng** phản hồi của máy bằng cách **di chuyển mảnh** và **viết lên chúng** |

### Vì sao phác tay trước, không code ngay?

> Nếu bạn ngồi xuống viết **mã Java** cho UI mà **chưa phác** → bạn đang để **Java thiết kế UI cho bạn**. **Luôn phác giấy trước.**

| Lợi ích của phác tay | Chi tiết |
|---|---|
| **Tập trung vào vấn đề quan trọng** | Không làm ai xao nhãng bằng chi tiết. Khi phác tay, bạn **không bị làm phiền** bởi font, màu, căn chỉnh, whitespace... |
| **Trong chương đồ họa**, bạn phải đối mặt **mọi quyết định đó** | Có thể tốn **rất nhiều thời gian** — thời gian **rõ ràng lãng phí** nếu phải **vứt thiết kế** |
| **Cải thiện feedback** khi trình thiết kế cho người khác | Họ **ít soi** chi tiết không liên quan giai đoạn này. Họ **không phàn nàn** bảng màu nếu **chưa có** |
| Quan trọng hơn: bản phác **trông ít "xong" hơn**, ít "đóng đinh" hơn, **mở cho đề xuất** | **Kiến trúc sư** đã biết hiện tượng này nhiều năm: trình **bản CAD sạch** → khách **khó thảo luận** nhu cầu đòi **thay đổi lớn**. Nhiều công cụ CAD có tùy chọn render kiểu **"sketchy"** — **chính vì lý do này** |

### Prototype giấy có thể thực thi — và kiểm thử được

> **Paper prototype** là **mô hình vật lý** của giao diện, phần lớn bằng giấy.

- Thường phác tay trên **nhiều mảnh giấy**, mảnh khác nhau hiện menu/hộp thoại/phần tử cửa sổ khác nhau.
- Được **sống dậy** bởi một **người mô phỏng** phản hồi máy trước "click" và "gõ phím" của người dùng: **di chuyển mảnh**, **viết phản hồi tùy chỉnh**, thỉnh thoảng **báo thành công bằng lời** những thứ **khó vẽ trên giấy**.
- Vì **thật sự tương tác** → có thể **kiểm thử người dùng thật**.

### Mẹo thực hành (từ các prototype khoá 6.831)

| Mẹu | |
|---|---|
| Prototype **to, tối, dễ đọc** | **Bút lông** tốt hơn bút chì. (Bút correction cũng sửa được như tẩy!) |
| **Màu** thì hay — nhưng chỉ nếu màu là **quyết định thiết kế cần kiểm**. Nếu màu không quan trọng, prototype **đơn sắc** hoạt động **vừa đủ** |
| Phác tay hay **vẽ máy**? | Sớm → phác tay tốt hơn; đôi khi ảnh **thực** lại **hữu ích**: prototype tích hợp vào trình duyệt web dùng **ảnh screenshot web page thật** làm **prop**, giúp cụ thể hóa. Vì **layout web page không phải vấn đề** UI giải quyết → không lý do phác tay trang web |
| Mảnh nhỏ hay rơi | **Keo Post-it** giúp — dạng **bút keo** bôi lên giấy làm **dính nhưng gỡ được** |
| Nhưng nhiều mảnh thừa | Có thể **bỏ hẳn** bằng cách **viết thông điệp lúc chạy** — không cần mảnh chuẩn bị cho mọi mục có thể hiển thị; cứ **viết lên "màn hình"** khi cần |

---

## 17. Kiểm thử người dùng

> **Kiểm thử người dùng là tiêu chuẩn vàng** (gold standard) để đánh giá giao diện người dùng.

Vì **khó dự đoán** người dùng điển hình phản ứng thế nào, cách tốt nhất là **tìm vài người dùng điển hình**, đặt họ **trước giao diện**, và **quan sát** chuyện gì xảy ra.

### Bắt đầu

1. **Không cần hiện thực hóa hoàn chỉnh** — prototype giấy **đủ để kiểm**; nó dễ xây đến mức thường là **bản đầu tiên** kiểm trên người dùng.
2. **Viết vài nhiệm vụ đại diện** (representative tasks):

| Đặc trưng | |
|---|---|
| **Ngắn** nhưng **không trivial** | |
| Đại diện | Vd: *"thêm cuộc họp này vào lịch"*, *"gõ bức thư này và in nó"* |
| Chọn loại nhiệm vụ | **Phổ biến**; nhiệm vụ lẽ ra **dễ**; nhiệm vụ bạn **lo** có thể **khó** |
| **Cụ thể** | Vd: *"xếp lịch họp 3h chiều thứ Tư này"* |
| Nhưng **không hướng dẫn cách làm** | |

3. **Tìm vài người dùng đại diện** cho **tập người dùng mục tiêu**:

| Quy tắc | |
|---|---|
| **Không dùng** người trong đội phát triển | Kể cả khi họ **thuộc tập mục tiêu** — họ **biết quá nhiều** về hệ thống → **không điển hình** |
| **Một nhúm người dùng** thường đủ | Cho feedback về vấn đề khả dụng **hiển nhiên** |
| Muốn **đo cải tiến định lượng**? | Cần **nhiều hơn nhiều**, và phải **thiết kế kiểm tra cẩn thận** |

4. **Xem họ làm nhiệm vụ với prototype.**

---

## 18. Cách quan sát người dùng và critical incidents

### Trước kiểm thử: brief người dùng

> **Trở thành người dùng kiểm thử gây căng thẳng** cho hầu hết mọi người — cảm giác như **đề thi thông minh**. Nếu họ **không figuring out** cách dùng giao diện, họ có thể cảm thấy **mình đã thất bại**.

Nói rõ:

| Câu nói | |
|---|---|
| *"... đang **kiểm thử hệ thống**, không kiểm **thử bạn**"* | |
| *"... có rắc rối, đó là **lỗi của hệ thống**"* | |
| *"... **tự do dừng bất cứ lúc nào**"* | |

**Vấn đề đạo đức — informed consent:** nghiên cứu người dùng tại MIT phải tuân chính sách như **thử nghiệm tâm lý, thử thuốc, thử thủ thuật y tế mới** — cần phê duyệt từ **COUHES** (Committee on the Use of Humans as Experimental Subjects) của MIT.

### Trong kiểm thử: think aloud — và im lặng

| Người dùng | Người quan sát |
|---|---|
| **Nghĩ thành tiếng** (think aloud): nói to suy nghĩ khi dùng | **Im lặng!** |
| Vd: *"OK, giờ đang tìm chỗ đặt cỡ chữ, thường ở thanh công cụ, không thấy, hmm, chắc là menu Format..."* | **Không offer giúp**, **không giải thích** giao diện |
| Think aloud cho bạn **cửa sổ vào quá trình tư duy** → hiểu họ **cố làm gì** và **kỳ vọng gì** | **Ngồi yên, nín, quan sát** |
| Khó khi người dùng **chìm vào nhiệm vụ** → đôi khi phải **nhắc nhẹ**: *"Bạn đang nghĩ gì?"*, *"Tại sao bạn nhìn đó?"* | Mục tiêu: **cái nhìn về cách người dùng điển hình tương tác**. Vì người dùng điển hình **không có nhà thiết kế ngồi cạnh** → phải **giảm thiểu ảnh hưởng** của bạn |

> Bạn chỉ có **hai lý do mở miệng** khi kiểm thử người dùng:
>
> 1. **Đẩy người dùng nghĩ thành tiếng.**
> 2. **Chuyển người dùng sang nhiệm vụ khác** khi họ **thật sự kẹt**.

Trong khi quan sát, **tự bận rộn bằng cách ghi rất nhiều chú thích** (notes).

### Critical incidents — sự cố then chốt

> **Critical incident:** sự kiện **ảnh hưởng mạnh** tới **hiệu năng nhiệm vụ** (hiệu suất hoặc tỷ lệ lỗi) hoặc **sự hài lòng**.

| Loại | Ví dụ |
|---|---|
| **Thường tiêu cực** | Nhấn **sai nút**; **thử lặp lại** cùng tính năng để làm xong nhiệm vụ; **chửi thề** |
| **Cũng có thể tích cực** | *"Cool!"*, *"Ồ, giờ mình thấy rồi."* |

Người dùng có thể **gọi sự chú ý** tới critical incident qua think aloud: *"Tại sao nó làm vậy?"* hay *"... @%!@#$!"*.

> Critical incident cho bạn **danh sách vấn đề khả dụng tiềm năng** để **tập trung** ở vòng thiết kế lặp **tiếp theo**.

---

## 19. Tóm tắt, tài liệu đọc thêm, bài tập

### Tóm tắt hai bài

**Bài 16:**

1. UI ảnh hưởng mạnh **nhận thức** phần mềm — nhưng nhận thức thường **hời hợt**; vấn đề khả dụng **dễ bị bỏ qua**.
2. **Hall of Shame**: thanh cuộn chọn template, đồng hồ báo thức hóa GUI, menu GIMP, Clippy — đều là bài học cụ thể.
3. **Bạn không phải người dùng**; người dùng luôn đúng **với lỗi lặp lại**; nhưng người dùng **không phải oracle/nhà thiết kế**.
4. **Thiết kế lặp** + **mô hình xoắn ốc** (prototype rẻ, vứt đi) để quản lý rủi ro.
5. **Khả dụng = 5 chiều** định lượng được.
6. **MHP model**: ~100ms tri giác, ~70ms vận động, working memory **7±2** / ~10s.
7. **Hợp nhất tri giác**: <100ms phản hồi = tức thì; ảnh 10 khung/giây; nhân quả.
8. **Luật Fitts**: `T = a + b·log(D/S)`; mép màn hình = mục tiêu vô hạn.
9. **Menu xếp lớp**: dẫn đường hầm → số chu kỳ tỷ lệ D/S → **chậm hàm mũ**; Mac vùng tam giác là tốt nhất.
10. **Trí nhớ**: 7±2 chunks; elaborative rehearsal; chunking giải thích bậc thầy cờ vua.
11. **Màu**: 8% mù đỏ–xanh; **không truyền thông tin chỉ bằng màu**; tránh chữ xanh trên đỏ.

**Bài 17:**

1. **10 heuristic Nielsen** + phân nhóm 4: meet expectations / user is the boss / handle errors / keep it simple.
2. Heuristic **nghịch lý** giữa #1 và #2 → gỡ bằng ngữ cảnh: khi **nghe** thì đa từ, khi **nói** thì nhất quán.
3. **Paper prototype**: phác tay trước, phác được thực thi, kiểm thử được ngay.
4. **User testing**: tasks ngắn-cụ thể, ~3 người đủ, không dùng người phát triển, **think aloud + im lặng**, ghi **critical incidents**.

### Tóm tắt tổng (slide cuối)

| | |
|---|---|
| **Bạn không phải người dùng** | |
| **Giữ năng lực con người và nguyên tắc thiết kế trong đầu** | |
| **Lặp lại thiết kế** | |
| **Làm prototype rẻ, vứt đi** | |
| **Đánh giá chúng với người dùng** | |

### Tài liệu đọc thêm

**Sách chung về khả dụng:**

- Johnson. *GUI Bloopers: Don'ts and Dos for Software Developers and Web Designers*, Morgan Kaufmann, 2000.
- Jeff Raskin. *The Humane Interface*, Addison-Wesley, 2000.
- Dix et al. *(nguồn ghi "x & Hartson")*. *Developing User Interfaces*, Wiley, 1995.

**Prototype độ trung thực thấp:**

- Rettig. *"Prototyping for Tiny Fingers"*, CACM, Apr 1994.

**Heuristic khả dụng:**

- Nielsen. *"Heuristic Evaluation"* — `useit.com/papers/heuristic/`
- Tognazzini. *"First Principles"* — `asktog.com/basics/firstPrinciples.html`

### Bảng thuật ngữ (Anh – Việt)

| Tiếng Anh | Tiếng Việt |
|---|---|
| usability | khả dụng |
| user interface (UI) | giao diện người dùng |
| affordance | tín hiệu affordance (gợi ý cách dùng) |
| WYSIWYG | thấy gì được nấy |
| iterative / spiral model | thiết kế lặp / mô hình xoắn ốc |
| low-fidelity (lo-fi) prototype | prototype độ trung thực thấp |
| heuristic (evaluation) | kinh nghiệm đánh giá / heuristic (đánh giá) |
| perception / cognitive / motor processor | bộ xử lý tri giác / nhận thức / vận động |
| working / long-term memory | trí nhớ làm việc / dài hạn |
| chunking | phân cụm |
| perceptual fusion | hợp nhất tri giác |
| open-loop / closed-loop control | điều khiển hở / kín |
| Fitts's Law | Luật Fitts |
| index of difficulty | chỉ số độ khó |
| locus of attention | vùng chú ý |
| mode / mode error | chế độ / lỗi chế độ |
| spring-loaded mode | chế độ có lò xo |
| think aloud | nghĩ thành tiếng |
| critical incident | sự cố then chốt |
| knowledge in the head / in the world | kiến thức trong đầu / ngoài thế giới |
| color blindness | mù màu |
| chromatic aberration | aberration sắc |
| informed consent | đồng ý có thông tin |
| memorability / satisfaction | tính dễ nhớ / sự hài lòng |

### Bài tập suy nghĩ

1. Chọn một ứng dụng bạn dùng hàng ngày: liệt kê **3 vị trí** vi phạm heuristic #2 (nhất quán) — chúng ảnh hưởng chiều khả dụng nào?
2. Áp dụng phân tích **menu xếp lớp** (mục 9) cho ứng dụng bạn dùng: ước lượng số chu kỳ cần để vào submenu sâu 3 cấp.
3. Với hộp thoại *"Type mismatch"*: viết lại thông điệp theo **4 yêu cầu** heuristic #9.
4. Thiết kế **2 nhiệm vụ kiểm thử** cụ thể cho ứng dụng bạn đang viết theo đúng tiêu chí mục 17 (ngắn, cụ thể, không hướng dẫn).
5. Vì sao "trong 100 ms phải có gì đổi" mâu thuẫn dường như với "0,1–1s không cần feedback"? Giải thích cách hai quy tắc cùng đúng.
6. Prototype giấy cho tính năng "đổi mật khẩu": liệt kê các **mảnh giấy** cần và **phản hồi** người mô phỏng phải viết.

---

*Nguồn: MIT 6.170 Lecture 16 (Usability), Lecture 17 (Usability Engineering), Fall 2005 — GS. Rob Miller.*
