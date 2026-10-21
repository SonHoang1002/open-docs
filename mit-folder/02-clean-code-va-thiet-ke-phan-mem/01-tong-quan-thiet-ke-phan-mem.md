# Tổng quan về thiết kế phần mềm

Tài liệu biên soạn từ bài giảng MIT 6.170 *Laboratory in Software Engineering* (Giáo sư Daniel Jackson, Fall 2005), bao gồm bài 1 (*Introduction*) và bài 2 (*Object Semantics*).

---

## Mục lục

1. [Khóa học 6.170: ba khóa học trong một](#1-khóa-học-6170-ba-khóa-học-trong-một)
2. [Vì sao kỹ thuật phần mềm lại quan trọng](#2-vì-sao-kỹ-thuật-phần-mềm-lại-quan-trọng)
3. [Các dự án phát triển thất bại](#3-các-dự-án-phát-triển-thất-bại)
4. [Các tai nạn phần mềm](#4-các-tai-nạn-phần-mềm)
5. [Chất lượng phần mềm](#5-chất-lượng-phần-mềm)
6. [Vì sao thiết kế lại quan trọng](#6-vì-sao-thiết-kế-lại-quan-trọng)
7. [Câu chuyện Netscape](#7-câu-chuyện-netscape)
8. [Nguyên tắc giữ cho mọi thứ đơn giản (KISS)](#8-nguyên-tắc-giữ-cho-mọi-thứ-đơn-giản-kiss)
9. [Ngữ nghĩa đối tượng: nền tảng để đọc và viết mã Java](#9-ngữ-nghĩa-đối-tượng-nền-tảng-để-đọc-và-viết-mã-java)
10. [Tóm tắt](#10-tóm-tắt)

---

## 1. Khóa học 6.170: ba khóa học trong một

Khóa học thực chất là ba khóa học ghép lại:

| Thành phần | Nội dung |
|---|---|
| Khóa học cấp tốc về lập trình hướng đối tượng | Kỹ năng Java cần thiết để thực hành |
| Thiết kế phần mềm trong môi trường trung gian | Các cơ chế trừu tượng hóa mạnh mẽ và tập hợp các mẫu thiết kế đã được kiểm chứng |
| Xưởng thực hành về xây dựng phần mềm theo nhóm | Dự án nhóm, đặt lịch trình, phối hợp |

Trọng tâm là **thiết kế**. Lập trình được đưa vào vì nó là điều kiện tiên quyết; dự án được đưa ra vì ở giai đoạn này, bạn chưa thực sự hiểu một thiết kế cho đến khi bạn triển khai nó.

### Những gì người học sẽ nhận được

- Thiết kế phần mềm bằng các cơ chế trừu tượng hóa mạnh mẽ và một bộ mẫu (pattern) đã được chứng minh là hiệu quả trong thực tế.
- Cách "đúng ngay từ đầu" bằng hai con đường: **xây dựng đúng** (by construction) và **suy luận mô-đun** (modular reasoning).
- Cách diễn đạt ý tưởng thiết kế và phê bình thiết kế của người khác.
- Trên đường đi: cách tư duy về một vấn đề, cách viết mã Java, cách làm việc theo nhóm.

### Hai nửa của khóa học

Nửa đầu kỳ là bài giảng và bài tập giao hàng tuần làm việc cá nhân; nửa sau là dự án nhóm. Các bài tập nửa đầu tích lũy thành việc hiện thực hóa **MapQuick** — một phiên bản cục bộ của MapQuest dùng Cơ sở dữ liệu Cục Thống kê Dân số Hoa Kỳ. Dự án nhóm là **Gizmoball** với các tính năng mới.

### Chính sách hợp tác và sở hữu trí tuệ

- Được thảo luận tài liệu khóa học với bạn bè.
- Không được chia sẻ phát hiện/ý tưởng giải bài tập hàng tuần.
- Được dùng mọi mã do giảng viên cung cấp và mã trong thư viện chuẩn Java.
- Được sao chép mã và giải thuật từ sách giáo khoa hay nguồn trực tuyến tổng quát.
- Không được sao chép mã của nhau, không được dùng mã của sinh viên các khóa trước.
- Trong dự án nhóm: được chia sẻ mọi thứ nhưng tất cả mọi người phải đóng góp vào mọi khía cạnh.

---

## 2. Vì sao kỹ thuật phần mềm lại quan trọng

### Đóng góp của phần mềm cho kinh tế Mỹ (số liệu 1996)

Phần mềm là mặt hàng xuất khẩu thặng dư lớn nhất của Hoa Kỳ:

| Ngành | Xuất khẩu | Nhập khẩu | Thặng dư |
|---|---|---|---|
| Phần mềm | 24 tỷ USD | 4 tỷ USD | **+20 tỷ USD** |
| Nông nghiệp | 26 | 14 | +12 |
| Hàng không vũ trụ | 11 | 3 | +8 |
| Hóa chất | 26 | 19 | +7 |
| Phương tiện giao thông | 21 | 43 | -22 |
| Hàng hóa chế biến | 200 | 265 | -64 |

### Vai trò trong hạ tầng

Phần mềm không chỉ là Internet. Nó vận hành giao thông, năng lượng, y tế, tài chính. Khi phần mềm hỏng, các hệ thống hạ tầng đó hỏng theo.

### Chất lượng phần mềm hiện tại ra sao?

- Các dự án thất bại tràn lan.
- Các tai nạn xảy ra.
- Phần mềm chất lượng kém vẫn được đưa vào sử dụng.

Báo cáo của PITAC (Ủy ban Cố vấn Công nghệ Thông tin của Tổng thống, 24/02/1999) đã tóm gọn vấn đề:

> "Nhu cầu đối với phần mềm đã tăng nhanh hơn nhiều lần so với khả năng sản xuất ra phần mềm của chúng ta. Hơn nữa, đất nước cần phần mềm có khả năng sử dụng, tin cậy và mạnh mẽ hơn nhiều so với những gì đang được sản xuất ngày nay. Chúng ta đã phụ thuộc một cách nguy hiểm vào các hệ thống phần mềm lớn mà hành vi của chúng không được hiểu thấu đáo và thường thất bại theo những cách không được dự báo."

---

## 3. Các dự án phát triển thất bại

### Khảo sát của IBM (1994)

| Chỉ số | Tỷ lệ |
|---|---|
| Hệ thống tốn nhiều hơn dự kiến | 55% |
| Trễ lịch trình | 68% |
| Phải thiết kế lại đáng kể | 88% |

### Hệ thống Tự động hóa Nâng cao (FAA, 1982–1994)

- Trung bình ngành lúc đó là 100 USD/dòng mã; FAA kỳ vọng trả 500 USD/dòng.
- Kết quả cuối: 700–900 USD/dòng.
- 6 tỷ USD công việc bị vứt bỏ.

### Thống kê của Cục Thống kê Lao động (1997)

- Cứ 6 hệ thống mới đưa vào vận hành thì có 2 hệ thống bị hủy.
- Khả năng hủy đối với các hệ thống lớn nhất vào khoảng 50%.
- Dự án trung bình trễ lịch trình 50%.
- 3/4 hệ thống bị coi là "thất bại vận hành".

Bài học chung: **đây không phải là những con số của một ngành nghiệp dư**. Ngay cả với chuyên gia, rủi ro thất bại là nền tảng, không phải ngoại lệ.

---

## 4. Các tai nạn phần mềm

> "Cách có khả năng nhất khiến thế giới bị hủy diệt, hầu hết chuyên gia đồng ý, là do tai nạn. Đó là nơi chúng ta xuất hiện. Chúng ta là chuyên gia máy tính. Chúng ta gây ra tai nạn."
>
> — Nathaniel Borenstein, người sáng tạo ra MIME, trong *Programming as if People Mattered* (Princeton University Press, 1991)

### Therac-25 (1985–1987)

- Máy xạ trị phóng xạ có bộ điều khiển bằng phần mềm.
- Khóa cơ khí (interlock) vật lý bị tháo bỏ, nhưng phần mềm không có khóa tương đương.
- Phần mềm không duy trì được các bất biến thiết yếu: hoặc ở chế độ tia electron, hoặc ở chế độ tia mạnh hơn có tấm chắn để tạo tia X.
- Kết quả: nhiều ca tử vong do bỏng.
- Lập trình viên không có kinh nghiệm về lập trình đồng thời (concurrency).

**Bài học:** một bất biến bị phá vỡ trong phần mềm điều khiển vật lý có thể giết người. Bất biến không phải là khái niệm học thuật thuần túy.

### Ariane-5 (tháng 6/1996)

- Cơ quan Vũ trụ Châu Âu (ESA).
- Mất hoàn toàn tên lửa không người lái ngay sau khi phóng.
- Nguyên nhân: một ngoại lệ được ném trong mã Ada.
- Mã lỗi đó thậm chí **không cần thiết sau khi phóng**.
- Nguyên nhân gốc: thay đổi môi trường vật lý — các giả định không được ghi tài liệu đã bị vi phạm.

**Bài học:** mã có thể "đúng" với môi trường cũ và trở nên sai chỉ sau một thay đổi điều kiện bên ngoài. Giả định phải được ghi lại.

### London Ambulance Service (1992)

- Mất cuộc gọi, điều phối trùng lặp do lệnh gọi trùng.
- Lựa chọn nhà phát triển kém: kinh nghiệm không đủ.

### Diễn đàn RISKS

RISKS Forum tập hợp các báo cáo từ báo chí về các sự cố liên quan đến máy tính — một nguồn theo dõi liên tục cho thấy tai nạn phần mềm không phải chuyện hiếm.

---

## 5. Chất lượng phần mềm

### Một thước đo: số lỗi trên nghìn dòng mã (bugs/kloc)

| Mức chất lượng | Số lỗi/kloc |
|---|---|
| Trung bình ngành | khoảng 10 |
| Chất lượng cao | 0,1 hoặc thấp hơn |
| Praxis CDIS (1993) | khoảng 0,75 |

**Praxis CDIS** là hệ thống kiểm soát không lưu khu vực của Anh. Dự án này dùng phương pháp hình thức (formal methods) — đặc tả chính xác — và **không làm tăng chi phí ròng**, nhưng tỷ lệ lỗi thấp hơn nhiều, thậm chí nhà cung cấp còn dám đưa ra bảo hành cho khách hàng.

### Hợp đồng mẫu (trích *ACM Software Engineering Notes*, Vol. 12, No. 3, 1987)

Hai bản miễn trừ trách nhiệm dưới đây minh họa một cách trào phúng thực tế phổ biến: nhà cung cấp phần mềm hầu như không cam kết gì:

> "Cosmotronic Software Unlimited Inc. không bảo đảm rằng các chức năng chứa trong chương trình sẽ đáp ứng yêu cầu của bạn, hay hoạt động của chương trình sẽ không bị gián đoạn hay không có lỗi. Tuy nhiên, Công ty bảo đảm rằng các đĩa mềm được cung cấp có màu đen và hình vuông dưới sử dụng bình thường trong chín mươi (90) ngày kể từ ngày mua."

> "Chúng tôi không khẳng định Interactive EasyFlow có ích cho bất cứ điều gì... Nếu Interactive EasyFlow không hoạt động: chịu. Nếu bạn mất một triệu vì Interactive EasyFlow làm hỏng việc: bạn mất một triệu, không phải chúng tôi. Nếu bạn không thích miễn trừ này: chịu. Chúng tôi bảo lưu quyền làm tối thiểu mà pháp luật cho phép, kể cả không làm gì."

Điểm mấu chốt: **điều khoản chất lượng do người viết phần mềm tự đặt ra gần như luôn có lợi cho họ**. Thiết kế và kỹ thuật là cách để buộc cam kết phải trở nên có ý nghĩa.

---

## 6. Vì sao thiết kế lại quan trọng

> "Bạn biết cần gì trước khi chúng ta có phần mềm tốt không? Xe hơi ở đất nước này tốt hơn khi Nhật Bản cho thấy xe hơi có thể được chế tạo tốt hơn. Ai đó sẽ phải cho ngành công nghiệp thấy phần mềm có thể được chế tạo tốt hơn."
>
> — John Murray, chuyên gia chất lượng phần mềm của FDA

**Đó chính là bạn.**

Mục tiêu của 6.170 là cho thấy "hack code" không phải là toàn bộ câu chuyện khi xây dựng phần mềm. Thực tế, nó chỉ là một phần nhỏ. Đừng coi mã là một phần của giải pháp; thường thì nó là một phần của vấn đề. Chúng ta cần các cách nói về phần mềm tốt hơn mã nguồn — ngắn gọn hơn, trực tiếp hơn, và ít phụ thuộc vào công nghệ sẽ nhanh chóng trở nên lỗi thời hơn.

### Vai trò của thiết kế và nhà thiết kế

| Lợi ích | Giải thích |
|---|---|
| Tư duy trước luôn có ích | So với việc dựa vào thử nghiệm: hiệu quả hơn nhiều và rẻ hơn nhiều |
| Biến việc ủy thác và làm việc nhóm thành khả thi | Không có giao diện rõ ràng thì không thể chia việc |
| Thiếu sót thiết kế ảnh hưởng người dùng | Phần mềm thiếu mạch lạc, cứng nhắc, khó dùng |
| Thiếu sót thiết kế ảnh hưởng nhà phát triển | Giao diện kém, lỗi nhân lên |

Sinh viên khoa học máy tính thường phản kháng ý tưởng phát triển phần mềm như một hoạt động kỹ thuật — có lẽ họ nghĩ kỹ thuật kỹ thuật sẽ lấy đi sự huyền bí của "bản năng hacker". Thực tế ngược lại: các kỹ thuật này giúp bạn vận dụng tài năng sẵn có một cách hiệu quả hơn nhiều.

### Thử nghiệm so với suy nghĩ trước: bằng chứng thực nghiệm

Trong một thí nghiệm, 32 lập trình viên NASA áp dụng 3 kỹ thuật thử nghiệm khác nhau lên vài chương trình nhỏ, và được hỏi ước tính tỷ lệ lỗi mà mỗi phương pháp tìm ra. Trực giác của họ **sai hoàn toàn**:

- Họ nghĩ kiểm thử hộp đen (dựa trên đặc tả) hiệu quả nhất.
- Thực tế **đọc mã** hiệu quả hơn — kể cả khi mã không có chú thích.
- Bằng việc đọc mã, họ tìm lỗi **nhanh hơn 50%**.

(Tham khảo: Basili & Selby, *Comparing the Effectiveness of Software Testing Strategies*, IEEE TSE, Vol. SE-13, No. 12, December 1987.)

Đối với phần mềm hạ tầng (như kiểm soát không lưu), thiết kế đặc biệt quan trọng. Bài báo của Daniel Jackson và John Chapin mô tả việc họ thiết kế lại một thành phần của CTAS (hệ thống kiểm soát không lưu mới) bằng các ý tưởng từ 6.170: *Redesigning Air-Traffic Control: An Exercise in Software Design*, IEEE Software, May/June 2000.

---

## 7. Câu chuyện Netscape

Với phần mềm cho PC, tồn tại một huyền thoại rằng thiết kế không quan trọng vì điều quan trọng duy nhất là thời gian ra thị trường. Câu chuyện sụp đổ của Netscape đáng để hiểu.

### Diễn biến

| Thời điểm | Sự kiện |
|---|---|
| Trước 1994 | Đội NCSA Mosaic (Đại học Illinois) tạo ra trình duyệt phổ biến đầu tiên, nhưng làm vội vàng |
| 4–12/1994 | Thành lập Netscape, xây Navigator 1.0 chạy trên 3 nền tảng, nhanh chóng thành trình duyệt được chọn trên Windows, Unix, Mac |
| 10/1994 | Microsoft bắt đầu phát triển IE 1.0 |
| 8/1995 | Microsoft phát hành IE kèm Windows 95 |
| 1995–1997 | Giai đoạn tăng trưởng bùng nổ: tập trung tung sản phẩm và tính năng, **dành rất ít thời gian cho thiết kế** |
| Communicator 4.0 | 120 nhà phát triển (từ 10), 3 triệu dòng mã (gấp 30 lần) |

Michael Toy, quản lý phát hành, phát biểu:

> "Chúng tôi đang ở tình trạng rất tệ... lẽ ra chúng ta phải ngừng phát hành mã này từ một năm trước. Nó chết rồi... Đây như là sự tỉnh giấc cay đắng... Chúng ta đang trả giá cho việc đi quá nhanh."

### Về phía Microsoft

Microsoft nhận ra cần xây dựng trên nền thiết kế vững chắc. Họ xây NT từ đầu và tái cấu trúc bộ Office dùng các thành phần chung. Họ cũng vội đưa IE ra thị trường để bắt kịp, nhưng sau đó **dành thời gian tái cấu trúc IE 3.0**. Việc tái cấu trúc IE này được xem bên trong Microsoft là quyết định then chốt giúp họ thu hẹp khoảng cách với Netscape.

### Điểm thú vị

Lập luận về thiết kế mô-đun bên trong Netscape năm 1997 lại xuất phát từ **mong muốn quay lại làm việc với nhóm nhỏ**. Không có giao diện sạch và đơn giản thì không thể chia công việc thành các nhóm độc lập.

Netscape dành 2 tháng để kiến trúc lại trình duyệt — không đủ. Họ định làm lại từ đầu với Communicator 6.0, nhưng 6.0 không bao giờ hoàn thành. Phiên bản 5.0 (Mozilla) được phát hành dạng mã nguồn mở nhưng không ai muốn làm việc với mã spaghetti. Microsoft thắng cuộc chiến trình duyệt, và AOL mua lại Netscape.

Đọc toàn bộ câu chuyện trong: Cusumano & Yoffie, *Competing on Internet Time*, Free Press, 1998, đặc biệt Chương 4 (Design Strategy).

**Lưu ý:** Netscape phải mất hơn 2 năm mới nhận ra tầm quan trọng của thiết kế. Đừng ngạc nhiên nếu sau một học kỳ bạn chưa hoàn toàn thuyết phục — có những điều chỉ đến với kinh nghiệm.

---

## 8. Nguyên tắc giữ cho mọi thứ đơn giản (KISS)

### Lời khuyên về tư duy

- **Nghĩ trước:** đừng lao vào viết mã.
- Thiết kế **vui hơn** sửa lỗi (debugging)!
- Tập trung vào **ý tưởng**, không phải hình thức hiện thân.
- Không bị che mắt bởi công nghệ.
- Bạn nên thành thạo Java, nhưng hãy nhận ra rằng nó sẽ trở nên lỗi thời.

### Trích dẫn then chốt của Tony Hoare

> "Tôi đã cảnh báo khẩn cấp về sự mơ hồ, sự phức tạp, và tham vọng quá mức của thiết kế mới, nhưng cảnh báo của tôi không được lắng nghe. Tôi kết luận rằng có hai cách dựng một thiết kế phần mềm: cách thứ nhất là làm cho nó đủ đơn giản đến mức không có khiếm khuyết nào hiển nhiên, và cách thứ hai là làm cho nó đủ phức tạp đến mức không có khiếm khuyết nào hiển nhiên."
>
> — Tony Hoare, Bài giảng Giải thưởng Turing, 1980 (nói về thiết kế của Ada)

Hai cách tiếp cận này không cân bằng: cách thứ hai luôn dễ đạt được hơn, và đó chính là lý do nó nguy hiểm.

### Cách thực hành "Keep it simple, stupid"

| Nguyên tắc | Giải thích |
|---|---|
| Tránh trượt trên băng mỏng | Tránh các mánh khóe thông minh, giải thuật và cấu trúc dữ liệu phức tạp |
| Không dùng các tính năng ngôn ngữ tối nghĩa | Phần lớn tính năng Java có thể bỏ qua an toàn |
| Không tối ưu hóa cho đến khi cần thiết được chứng minh | Tối ưu sớm là lãng phí và gây hại |
| Hoài nghi với sự phức tạp | Mỗi lớp phức tạp đều có chi phí |
| Không tham vọng quá mức | Nhận diện "creep­ing featurism" (tính năng cứ thế mọc thêm) và "second system effect" (hiệu ứng hệ thống thứ hai — hệ thống thứ hai thường phình to và phức tạp) |

Một điểm cần ghi nhớ: **điều khó không phải là làm cho phức tạp, mà là làm cho thực sự đơn giản.**

---

## 9. Ngữ nghĩa đối tượng: nền tảng để đọc và viết mã Java

Phần này tổng hợp bài 2 (*Object Semantics*) — những cơ chế chạy (runtime) cốt lõi của mọi ngôn ngữ hướng đối tượng, với trọng tâm là Java. Mục tiêu: dự đoán được mã sẽ làm gì **mà không cần chạy nó**.

### 9.1 Biến, tham chiếu và đối tượng

```java
String a = "zeeb";
String b = a.toUpperCase();
System.out.println(b);   // in ra ZEEB
```

Lệnh 2 là lời gọi phương thức `toUpperCase`, với *receiver* (người nhận) là `a`. Lời gọi tạo ra một chuỗi mới và gắn vào biến `b`.

Sơ đồ đối tượng (object diagram) của hai câu lệnh đầu:

```
        a                    b
        |                    |
        v                    v
   "zeeb"(String)      "ZEEB"(String)
```

Điểm then chốt: biến là **tham chiếu đến đối tượng**, không phải bản thân đối tượng, cũng không phải một ô chứa đối tượng.

### 9.2 Bất biến (immutability)

```java
String a = "zeeb";
a.toUpperCase();
System.out.println(a);   // in ra zeeb
```

Lệnh 2 tạo một chuỗi mới bị **vứt bỏ** vì không được gán vào biến nào. Chuỗi mà `a` tham chiếu **không đổi**: `String` là kiểu bất biến.

```java
String a = "zeeb";
a = a.toUpperCase();
System.out.println(a);   // in ra ZEEB
```

Ở đây cũng **không có đối tượng nào bị thay đổi** — chỉ có tham chiếu `a` được gán lại để trỏ đến đối tượng mới.

### 9.3 Aliasing, tính khả biến và đẳng thức tham chiếu

```java
Vector v = new Vector();
Vector k = v;                  // k và v là alias của CÙNG một đối tượng
String a = "zeeb";
v.add(a);
k.add(a.toUpperCase());
System.out.println(v.lastElement());   // in ra ZEEB
```

- `lastElement` giống `toUpperCase`: không có hiệu lực với receiver, trả về tham chiếu.
- `add` **đổi (mutate)** receiver — vì vậy `Vector` là kiểu **có thể thay đổi** (mutable), còn `String` là bất biến.
- Sau lệnh 2, `k` và `v` là **alias** — sửa qua tên này thấy qua tên kia. Có thể hoán đổi tên `k` và `v` trong các câu 4–6 mà hành vi không đổi.

```
   v   k
    \ /
     o----(Vector)---- elts[0] --> "zeeb"
                       elts[1] --> "ZEEB"
     a -------------> "zeeb"
```

**Aliasing phá vỡ quy tắc "một câu lệnh chỉ ảnh hưởng đến các biến nó nhắc tới"**: Statement 5 không nhắc `v` nhưng Statement 6 (chỉ nhắc `v`) lại bị ảnh hưởng.

### 9.4 Hai loại đẳng thức

```java
Vector v = new Vector();
Vector k = v;
if (v == k) System.out.println("same");      // same
```

`==` là **đẳng thức tham chiếu** (reference equality): kiểm tra hai tham chiếu có trỏ cùng một đối tượng không.

```java
Vector v = new Vector();
Vector k = new Vector();
if (v == k) System.out.println("same");      // different
```

Đối tượng do hàm khởi tạo trả về **luôn là mới** (fresh). Trình thu gom rác có thể tái chế đối tượng, nhưng chỉ khi không còn tham chiếu nào trỏ tới nó — nhờ đó ta không bao giờ phân biệt được đối tượng đã bị tái chế.

#### Câu đố đáng ngờ

```java
String a = "zeeb";
String b = "zeeb";
if (a == b) System.out.println("same");      // same (!)
```

Máy ảo Java tự động **intern** chuỗi nguyên thủy (string literal): nếu hai literal có cùng dãy ký tự, chỉ phân bổ một đối tượng. Đây là tối ưu hiệu năng, và **rất không nên** dùng `==` để so sánh các đối tượng bất biến. Hãy dùng `equals`:

```java
String a = "zeeb";
String b = a.toUpperCase();
if (b.equals("ZEEB")) System.out.println("same characters");
```

#### Về `equals` được kế thừa

Mọi lớp đều tự động kế thừa một phương thức `equals` từ `Object`, nhưng nó **gần như không bao giờ là thứ bạn muốn**. Mỗi khi thiết kế một lớp, một trong những việc đầu tiên cần làm là xác định hai đối tượng của lớp đó bao giờ được coi là bằng nhau.

Các câu hỏi quan trọng:

- `x == y` có ngụ ý `x.equals(y)` không? — Vâng, lẽ ra phải vậy. `equals` có thể được định nghĩa tùy ý, kể cả làm thay đổi đối tượng! Nhưng điều đó sẽ thảm họa: khách hàng mong đợi một hợp đồng chung cho `equals`.
- Vì sao ngôn ngữ lại có kiểu bất biến? — Vì aliasing phức tạp, và khi dùng kiểu bất biến, vấn đề đó không xuất hiện; mã xây dựng từ kiểu bất biến đôi khi hiệu quả hơn.
- Vì sao vẫn cần kiểu có thể thay đổi? — Vì **sự biến đổi tạo ra một dạng mô-đun hóa hữu ích**: cho phép thay đổi cục bộ một cấu trúc. Và thường mô hình hóa tự nhiên các thực thể thực tế (giao dịch trên tài khoản ngân hàng *đổi* tài khoản, chứ không tạo ra tài khoản mới).

### 9.5 Tham chiếu null

```java
String a = null;
System.out.println(a);          // in ra null
```

`null` là một giá trị mà tham chiếu có thể nhận: nghĩa là tham chiếu đó **không trỏ tới đối tượng nào cả**. Không có "đối tượng null"!

```java
String a = null;
String b = a.toUpperCase();     // ném NullPointerException
```

Receiver của lời gọi phương thức **không bao giờ được là null**, vì nó xác định đối tượng "nhận" lời gọi — và đối tượng đó phải tồn tại. Nhưng `System.out.println(a)` thì ổn vì `a` là **tham số**, và đó là thủ tục thông thường không có receiver.

**Khuyến nghị:** thay vì bắt null và đối xử đặc biệt, tốt hơn là **tránh tạo tham chiếu ngay từ đầu**. Khi không tránh được, phải ghi tài liệu rõ ở đâu có thể có null — đó là một lý do đặc tả quan trọng: chúng có thể cứu bạn khỏi lỗi runtime và các kiểm tra không cần thiết.

Về tính đối xứng của `equals`:

- `a.equals(b)` có thể thay `b.equals(a)` không? **Không** — khi `a` là null và `b` không, lời đầu ném ngoại lệ, lời sau thường trả về false.
- Nếu bỏ null sang một bên, `a.equals(b)` và `b.equals(a)` có cùng hiệu lực không? **Có** — tính chất này (đối xứng) là yêu cầu của "hợp đồng đối tượng" (object contract) của Java.

### 9.6 Lớp do người dùng định nghĩa, trường và hàm khởi tạo

```java
class Trans {
    int amount;
    Date date;
}
```

```java
Trans t = new Trans();
t.amount = 20;
t.date = new Date();
```

Khi đối tượng được tạo, các trường được khởi tạo giá trị mặc định: `null` cho tham chiếu đối tượng, `0` cho số nguyên. Ngay sau lệnh 1, ta có một đối tượng giao dịch **chưa lành lặn**: `amount = 0`, `date = null`.

**Vì sao điều này quan trọng?** Chúng ta muốn trách nhiệm đảm bảo đối tượng của lớp `Trans` luôn được định hình đúng (well-formed) nằm **hoàn toàn bên trong lớp `Trans`**. Khi đó, để kiểm tra, bạn cần đọc không chỉ mã của lớp đó mà cả mã của các nơi dùng nó. Ở quy mô lớn, điều này phá vỡ tính mô-đun.

Giải pháp: khai báo hàm khởi tạo riêng:

```java
class Trans {
    int amount;
    Date date;
    Trans(int a, Date d) { amount = a; date = d; }
}
```

Tính chất thú vị: khi đã định nghĩa hàm khởi tạo của riêng mình, **hàm khởi tạo mặc định không còn khả dụng** — nên `new Trans()` không còn biên dịch. Thay vào đó:

```java
Trans t = new Trans(20, new Date());
```

Một dòng này thay cho ba câu lệnh trước.

**Lưu ý:** đây chưa phải giải pháp trọn vẹn. Vẫn có thể làm hỏng đối tượng `Trans` từ bên ngoài (ví dụ gán `t.date = null`). Bước đầu tiên để ngăn là dùng cơ chế truy cập của Java: làm các trường `private`. Nhưng như sẽ thấy khi học về trừu tượng hóa dữ liệu, **điều đó vẫn chưa đủ**.

### 9.7 Bảng tổng hợp: các khái niệm nền của ngữ nghĩa đối tượng

| Khái niệm | Định nghĩa | Ví dụ | Phản ví dụ (điều cần tránh) |
|---|---|---|---|
| Tham chiếu | Giá trị trỏ tới một đối tượng trên heap | `String a = "zeeb";` | Cứ tưởng biến *chứa* chuỗi "zeeb" |
| Bất biến | Phương thức không đổi đối tượng, tạo đối tượng mới | `a.toUpperCase()` không đổi `a` | Kỳ vọng `v.add(x)` "trả về" vector đã thêm |
| Có thể thay đổi | Phương thức đổi trạng thái đối tượng | `v.add(a)` đổi `Vector v` | Gọi `k.add(...)` rồi ngạc nhiên vì `v` đổi |
| Aliasing | Hai biến trỏ cùng đối tượng | `Vector k = v;` | Sửa `k` rồi nghĩ `v` không ảnh hưởng |
| Đẳng thức tham chiếu | `==` kiểm tra cùng đối tượng | `v == k` khi `k = v` | Dùng `==` so hai `String` bất biến |
| Đẳng thức đối tượng | `equals` kiểm tra bằng nhau theo hợp đồng | `b.equals("ZEEB")` | Để mặc định `equals` của `Object` |
| Null | Tham chiếu không trỏ đối tượng nào | `String a = null;` | Gọi `a.toUpperCase()` khi `a` null |
| Hàm khởi tạo | Tạo đối tượng đúng lệ ngay từ đầu | `new Trans(20, new Date())` | Tạo rỗng rồi set trường từng cái |

### 9.8 Thực hành: đoán kết quả trước khi chạy

**Bài 1.**

```java
String a = "zeeb";
String b = a;
a = a.toUpperCase();
System.out.println(a);   // ?
System.out.println(b);   // ?
```

Dự đoán: `ZEEB` rồi `zeeb`. `b` giữ tham chiếu cũ; chuỗi ban đầu không đổi.

**Bài 2.**

```java
Vector v = new Vector();
Vector k = v;
v.add("one");
k.add("two");
System.out.println(v.size());   // ?
```

Dự đoán: `2`. Cả hai tên trỏ cùng một vector duy nhất.

**Bài 3.**

```java
String a = null;
System.out.println(a);        // ?  -> null  (a là tham số, không có receiver)
String b = a.toUpperCase();   // ?  -> NullPointerException (a là receiver)
```

**Bài 4.**

```java
Trans t = new Trans();   // không biên dịch, nếu lớp đã có Trans(int, Date)
```

Bài 4 minh họa rằng định nghĩa hàm khởi tạo riêng **loại bỏ** hàm khởi tạo mặc định — một cách ngôn ngữ buộc người dùng phải cung cấp đủ dữ liệu để đối tượng được định hình đúng.

### 9.9 Thuật ngữ (Anh – Việt)

| Tiếng Anh | Tiếng Việt |
|---|---|
| object reference | tham chiếu đối tượng |
| mutable / immutable | có thể thay đổi / bất biến |
| aliasing | trùng tham chiếu (alias) |
| reference equality | đẳng thức tham chiếu |
| object equality | đẳng thức đối tượng |
| constructor | hàm khởi tạo |
| field / instance variable | trường / biến thể |
| receiver | người nhận lời gọi |
| garbage collector | trình thu gom rác |
| representation invariant | bất biến biểu diễn (xem tài liệu 04) |
| specification | đặc tả (xem tài liệu 02) |
| invariant | bất biến |

---

## 10. Tóm tắt

| Chủ đề | Điểm cốt lõi |
|---|---|
| Lý do học kỹ thuật phần mềm | Thất bại, tai nạn và chất lượng kém là chuẩn lệch ngành; phần mềm là hạ tầng thiết yếu |
| Vai trò của thiết kế | Tư duy trước rẻ và hiệu quả hơn thử nghiệm; thiết kế tạo điều kiện cho ủy thác và nhóm nhỏ |
| Câu chuyện Netscape | "Đi nhanh" không thay thế được thiết kế; thiếu mô-đun thì không thể chia việc cho nhóm |
| KISS | Hoặc đơn giản đến mức không có khiếm khuyết hiển nhiên, hoặc phức tạp đến mức không có khiếm khuyết hiển nhiên — chỉ có hai cách, và chỉ cách đầu tiên là tốt |
| Biến, tham chiếu, đối tượng | Biến chứa tham chiếu; hiểu sơ đồ đối tượng để dự đoán mã |
| Bất biến vs. có thể thay đổi | Bất biến dễ suy luận hơn; có thể thay đổi cho phép thay đổi cục bộ |
| Aliasing | Phá vỡ quy tắc "câu lệnh chỉ ảnh hưởng biến nó nhắc"; kiểm tra bằng `==` |
| `==` vs `equals` | `==` là đẳng thức tham chiếu; `equals` là đẳng thức đối tượng và phải tuân hợp đồng |
| Hàm khởi tạo | Đảm bảo đối tượng lành lặn ngay khi tạo; vô hiệu hóa hàm khởi tạo mặc định |

### Câu hỏi ôn tập

1. Vì sao đọc đặc tả dễ hơn đọc mã nguồn? Lấy ví dụ `Vector` trong `java.util`.
2. Cho đoạn mã dùng `Vector` với alias — dự đoán kết quả trước khi chạy.
3. `String` bất biến có lợi ích gì về lý luận và về hiệu năng? Vì sao vẫn cần `Vector`?
4. Vì sao định nghĩa hàm khởi tạo cho `Trans` lại liên quan đến tính mô-đun của bất biến?
5. Dựa trên số liệu IBM 1994, nhận định nào đúng: "gần như mọi dự án lớn đều phải thiết kế lại"?

---

*Nguồn: MIT 6.170 Lecture 1 (Introduction) và Lecture 2 (Object Semantics), Daniel Jackson, Fall 2005.*
