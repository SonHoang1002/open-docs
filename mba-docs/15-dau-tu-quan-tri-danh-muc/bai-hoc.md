# Chuyên đề 15 — Đầu tư & Quản trị danh mục (Investments & Portfolio Management)

## Mở đầu

Chuyên đề này trang bị "ngôn ngữ" của thị trường tài chính: đọc được một trái phiếu,
định giá một cổ phiếu theo CAPM, so sánh hai quỹ bằng Sharpe ratio, và ghép các
tài sản thành một danh mục có cân bằng rủi ro–lợi nhuận phù hợp khẩu vị rủi ro.
Đây là chuyên đề có **số liệu và công thức nhiều nhất** trong 4 chuyên đề của bộ
tài liệu — hãy cầm máy tính nháp khi đọc.

**Ai nên học chuyên đề này:**

- Quản lý/tổng giám đốc doanh nghiệp cần đọc báo cáo tài chính và quyết định
  phân bổ vốn.
- Chuyên viên tài chính doanh nghiệp, quỹ đầu tư, ngân hàng, công ty chứng khoán.
- Nhà đầu tư cá nhân nghiêm túc muốn quản trị danh mục có kỷ luật.
- Chuyên viên phân tích kinh doanh (business analyst) làm việc với dữ liệu thị
  trường.

**Cảnh báo quan trọng:** nội dung chuyên đề là **giáo dục**, không phải khuyến
nghị đầu tư. Mọi công thức đều có giả định; thị trường thật biến động mạnh hơn
mô hình. Đặc biệt với phái sinh: đây là công cụ phòng vệ **hoặc** đầu cơ rủi ro
rất cao.

## Mục lục các bài

| Bài | Tên bài | Trọng tâm |
|-----|---------|-----------|
| 1 | Công cụ tài chính & thị trường | Cổ phiếu, trái phiếu, phái sinh, ETF |
| 2 | Trái phiếu & đường cong lợi suất | Đánh giá, duration, đáo hạn, tín dụng |
| 3 | Phân tích cơ bản & CAPM | Beta, SML, vốn chủ sở hữu |
| 4 | Hiệu suất đầu tư | Sharpe, Sortino, alpha, Treynor, M² |
| 5 | Lý thuyết danh mục hiện đại | Markowitz, efficient frontier, diversification |
| 6 | Quản trị rủi ro danh mục | VaR, stress test, rủi ro hệ thống/riêng |
| 7 | Thị trường vốn Việt Nam & fintech | HOSE, trái phiếu, phái sinh, robo-advisor |
| 8 | Quản trị danh mục thực hành & đạo đức | Phân bổ chiến thuật, ESG, lỗi thường gặp |

---

## Bài 1 — Công cụ tài chính & thị trường

### Phần A — Cơ bản

**Công cụ tài chính** là hợp đồng cho phép chuyển giao giá trị giữa các bên theo
thời gian và rủi ro. Ba nhóm nền tảng:

**1. Cổ phiếu (equity)** — quyền sở hữu phần vốn chủ sở hữu công ty.

- Lợi nhuận = **cổ tức** + **lãi vốn** (chênh lệch giá mua/bán).
- Lợi nhuận suất đơn (simple return):

$$R = \frac{P_1 - P_0 + D}{P_0}$$

$P_0$ giá mua, $P_1$ giá bán, $D$ cổ tức.

**Ví dụ:** mua 100 cổ phiếu giá 25.000đ, bán 29.000đ, nhận cổ tức 1.000đ/cp:

$$R = \frac{29.000 - 25.000 + 1.000}{25.000} = 16\%$$

**Lợi nhuận log (log return)** dùng trong thống kê:

$$r = \ln\left(\frac{P_1}{P_0}\right)$$

Ví dụ giá 100 → 110: $r = \ln(1{,}1) ≈ 9{,}53\%$.

**2. Trái phiếu (bond)** — cho vay: nhà đầu tư cho công ty/thuận nợ nhà nước vay,
nhận lãi (coupon) định kỳ + gốc đáo hạn.

- Giá trái phiếu là **hiện giá (PV)** dòng tiền tương lai:

$$P = \sum_{t=1}^{n} \frac{C}{(1+y)^t} + \frac{F}{(1+y)^n}$$

$C$ = coupon, $F$ = mệnh giá, $y$ = suất chiết khấu (yield), $n$ = số kỳ.

**3. Phái sinh (derivatives)** — giá trị phái sinh từ tài sản gốc:

- **Hợp đồng tương lai (futures):** cam kết mua/bán tại ngày tương lai với giá
  thỏa thuận; chuẩn hóa, qua clearinghouse, có ký quỹ (margin).
- **Quyền chọn (options):** *quyền* (không nghĩa vụ) mua (call) hoặc bán (put)
  tại giá thực hiện (strike) trước/sau ngày đáo hạn; người mua trả **phí quyền
  chọn (premium)**.
- **Hợp đồng hoán đổi (swap):** hoán dòng tiền (lãi suất, tỉ giá…).

**ETF (exchange-traded fund):** quỹ giao dịch trên sàn, mua/bán như cổ phiếu,
thường bám theo một chỉ số — công cụ diversification rẻ, thanh khoản cao.

### Phần B — Nâng cao

**Lợi suất đến hạn (yield to maturity — YTM):** suất chiết khấu làm **giá trái
phiếu bằng giá thị trường**. Quan hệ nền: giá và yield **ngược chiều**.

**Ví dụ tính YTM gần đúng (current yield + vốn hóa):** trái phiếu 2 năm, coupon
10%/năm, mệnh giá 100, đang bán 95:

- Current yield = 10/95 ≈ 10,53%.
- Lãi vốn đến hạn (100−95)/2 = 2,5/năm → 2,63%/năm trên giá 95.
- YTM ≈ 10,53% + 2,63% ≈ **13,16%** (ước tính; giá trị chính xác tính bằng máy:
  khoảng 13,0–13,2%).

**Đòn bẩy tài chính (financial leverage) qua CDS/futures:** ký quỹ 10% hợp đồng
tương lai chỉ số = đòn bẩy 10 lần — dao động 1% của tài sản gốc = ±10% ký quỹ.
**Lợi nhuận kỳ vọng tăng nhưng phương sai tăng bình phương đòn bẩy.**

**Phân biệt rủi ro:**

- **Rủi ro hệ thống (systematic):** thị trường, lãi suất, vĩ mô — **không** diversify
  được (beta).
- **Rủi ro riêng (unspecific/idiosyncratic):** riêng công ty — giảm được bằng
  diversification.

**Tranh luận: "Phái sinh là đầu cơ hay phòng vệ?"** — cả hai, tùy vị thế. Nông
dân bán futures lúa mì = **phòng vệ** giá; nhà đầu tư mua futures chỉ số với 5x
đòn bẩy = **đầu cơ**. Hợp pháp hóa và đạo đức phụ thuộc mục đích + quy mô vị thế
so với nhu cầu thực.

**Giới hạn mô hình:** cổ phiếu quá khứ không dự báo được tương lai; yield trái
phiếu rủi ro tín dụng không phản ánh đúng xác suất vỡ nợ đuôi; phái sinh cần
quản trị margin và thanh khoản — nhiều nhà đầu tư cá nhân VN mất trắng do "ngầm"
của margin/futures không hiểu kỹ.

### Phần C — Thực tế

**Case quốc tế — LTCM (1998):** quỹ do hai Nobel kinh tế cố vấn, dùng chênh lệch
yield rất nhỏ với **đòn bẩy khổng lồ**; Nga vỡ nợ → chênh lệch nới rộng ngược
dự kiến → thua lỗ tỷ USD, cần giải cứu hệ thống. **Bài học:** rủi ro mô hình +
đòn bẩy + thanh khoản chồng lên nhau.

**Case generic — danh mục người mới VN:** 100% tiền gửi ngân hàng 6%/năm, lạm
phát 3,5% → lợi nhuận thực ~2,4%. Khi mở danh mục, cần nhớ: **không đầu tư =
mất mát thầm lặng theo lạm phát**, nhưng "all-in" cổ phiếu penny lại mang rủi
ro riêng rất lớn — phương án trung gian: ETF/quỹ chỉ số + trái phiếu/nhà nước +
tiền mặt.

**Lỗi thường gặp:**

- Mua "phái sinh" từ app không rõ pháp lý (hợp đồng chênh lệch CFD offshore).
- Đánh đồng lãi suất ngân hàng với lợi suất trái phiếu (khác cấu trúc rủi ro).
- Mua cổ phiếu "theo lời đồn" mà không hiểu quyền sở hữu/ nghĩa vụ của cổ đông.
- Quên chi phí giao dịch, thuế, spread khi tính lợi nhuận.

**Checklist hiểu một công cụ trước khi mua:**

- [ ] Đây là sở hữu (cổ phiếu), cho vay (trái phiếu) hay hợp đồng (phái sinh)?
- [ ] Lợi nhuận đến từ đâu (cổ tức/coupon/capital gain/đòn bẩy)?
- [ ] Rủi ro lớn nhất mất bao nhiêu % vốn?
- [ ] Thanh khoản thế nào — bán lúc cần có được tiền không?
- [ ] Chi phí: phí, spread, thuế, ký quỹ?
- [ ] Pháp lý: phát hành/nhà cung cấp có giấy phép tại VN?

#### Ứng dụng thực tế

Làm việc doanh nghiệp: phân biệt **công cụ nợ vs. vốn** khi huy động — trái phiếu
nâng nợ (covenant, trả lãi trước thuế) vs. phát hành cổ phần (pha loãng, chia
quyền kiểm soát). Công thức bạn vừa học áp ngược cho **quyết định vốn của công ty
bạn**.

#### Câu hỏi phỏng vấn xin việc

1. **Tính lợi nhuận cổ phiếu: mua 50.000đ, bán 57.000đ, cổ tức 2.000đ.**
   *Gợi ý:* $(57.000-50.000+2.000)/50.000 = 18\%$.
2. **Giái thích quan hệ giá trái phiếu và lãi suất thị trường.**
   *Gợi ý:* lãi suất tăng → giá trái phiếu giảm (hiện giá dòng tiền coupon thấp
   hơn suất mới) — ngược chiều.
3. **Phái sinh dùng phòng vệ hoạt động ra sao? Cho ví dụ.**
   *Gợi ý:* bán futures/hedging giá đầu vào; nông dân hoặc nhà máy khóa giá;
   mất margin cơ hội khi giá đi có lợi.

---

## Bài 2 — Trái phiếu & đường cong lợi suất

### Phần A — Cơ bản

**Thành phần giá trái phiếu:**

- **Mệnh giá (face value/par):** thường 100.000đ/tp VN hoặc 1.000 USD/EUR quốc tế.
- **Coupon rate:** lãi suất danh nghĩa/năm trên mệnh giá.
- **Payment dates:** định kỳ 6 tháng hoặc 1 năm (tp Việt Nam thường 6 tháng).
- **Maturity:** ngày trả gốc.

**Phân loại trái phiếu:**

| Loại | Người phát hành | Rủi ro chính |
|------|-----------------|--------------|
| Trái phiếu chính phủ (TC) | Nhà nước | Rất thấp (theo xếp hạng) |
| Trái phiếu chính quyền địa phương (CLBĐ) | UBND tỉnh/thành | Trung bình thấp |
| Trái phiếu doanh nghiệp (TCPP/tpDN) | Công ty | Tín dụng, thanh khoản |
| Trái phiếu chuyển đổi | Công ty | Có quyền chuyển thành cổ phiếu |

**Hiệu suất trái phiếu tính nhanh:**

- Current yield: $\text{Coupon}/\text{Giá thị trường}$.
- Ví dụ coupon 9 triệu/năm, giá 93 triệu → current yield ≈ 9,68%.

**Quy tắc ngón tay (bài học kinh điển):** giá trị trái phiếu 1 năm đáo hạn gần
100; trái phiếu dài hạn nhạy lãi suất mạnh hơn — dùng **duration** đo (bài 4).

### Phần B — Nâng cao

**Macaulay duration & modified duration:**

$$D_{\text{Mac}} = \frac{\sum t \cdot PV(CF_t)}{P}; \quad
D_{\text{mod}} = \frac{D_{\text{Mac}}}{1+y}$$

**Modified duration** ước tính % thay đổi giá khi yield thay đổi 1%:

$$\frac{\Delta P}{P} \approx -D_{\text{mod}} \times \Delta y$$

**Ví dụ:** $D_{\text{mod}} = 4{,}5$; lãi suất tăng 0,75% → giá giảm xấp xỉ
$4{,}5 \times 0{,}75\% = 3{,}38\%$. Portfolio trái phiếu 10 tỷ → mất ~338 triệu.

**Convexity (lồi):** giá–yield không thẳng; duration chỉ xấp xỉ gần điểm hiện
tại; khi biến động lớn, convexity bổ sung sai số. Trái phiếu coupon thấp/duyên
dài dài có convexity cao hơn.

**Lợi suất thực (real yield) & TIPS/inflation linkage:**

$$y_{\text{thực}} \approx y_{\text{danh nghĩa}} - \text{lạm phát dự kiến}$$

Ví dụ yield 9%, lạm phát kỳ vọng 4% → lợi suất thực ~5%. Trái phiếu danh nghĩa
9% mà lạm phát 6% → thực chỉ 3%.

**Credit spread:** chênh lệch yield tpDN vs. TC = **bù rủi ro tín dụng**:

$$y_{\text{tpDN}} = y_{\text{TC cùng kỳ}} + \text{spread}$$

Ví dụ TC 5 năm 5,5%, tpDN AA 7,2% → spread 170 điểm cơ bản (bps).

**Đường cong lợi suất (yield curve):** 3 hình dạng chính:

- **Upward (bình thường):** dài hạn cao hơn — kỳ vọng tăng trưởng/lạm phát bình thường.
- **Inverted (đảo ngược):** ngắn hạn cao hơn — tín hiệu thắt chặt tiền tệ, thường
  đi trước suy thoái (mối liên hệ thống kê, không chắc chắn 100%).
- **Flat:** chuyển pha.

**Tranh luận:** "đảo ngược yield curve dự báo suy thoái" — thống kê Mỹ nhiều
thập kỷ tốt, nhưng **lead time không cố định** và VN có cấu trúc thị trường trái
phiếu khác (ngắn, thanh khoản thấp phân khúc tpDN) → chỉ dùng làm chỉ báo phụ.

### Phần C — Thực tế

**Case quốc tế — cuộc khủng hoảng trái phiếu thế chấp (2007–2008):** sản phẩm
phái sinh trên trái phiếu B (mortgage-backed) xếp hạng AAA nhưng dựa trên chất
lượng khoản vay nhà kém; khi giá nhà giảm, cả cấu trúc AAA nứt đổ. **Bài học:**
xếp hạng tín dụng ≠ sự thật kinh tế; đọc dòng tiền gốc rễ (underlying cash flows).

**Case generic — danh mục trái phiếu doanh nghiệp VN (minh họa):** NĐT mua 5
trái phiếu phát hành riêng lẻ khác nhau, mỗi cái 2 tỷ. Một công ty chậm trả lãi
2 quý → mất ~40% giá trị trái phiếu đó. Bài học: **mua lẻ 1–2 tpDN = rủi ro
riêng khổng lồ**; thay bằng quỹ/trái phiếu phân tán, hoặc lọc theo xếp hạng +
covenant (điều khoản bảo vệ NĐT: giới hạn vay thêm, tài sản đảm bảo).

**Lỗi thường gặp:**

- Mua tpDN vì "lãi cao hơn gửi" mà không đọc xếp hạng, tài sản đảm bảo, mục
  đích sử dụng vốn.
- Giữ trái phiếu dài hạn khi chu kỳ lãi suất tăng mà không hiểu duration.
- Đánh đồng "trái phiếu = không rủi ro" (tpDN có rủi ro vỡ nợ thanh khoản).
- Bỏ qua thuế và phí khi so sánh với gửi tiết kiệm.

**Checklist trước khi mua trái phiếu:**

- [ ] Người phát hành: ai, xếp hạng tín dụng (nếu có), lịch sử trả lãi.
- [ ] Coupon, tần suất trả, yield đến hạn (ước tính), ngày đáo hạn.
- [ ] Tài sản đảm bảo / điều khoản bảo vệ NĐT.
- [ ] Than khoản: có thể bán lại trên sàn/OTC khi cần không?
- [ ] So sánh với TC cùng kỳ + spread có hợp lý rủi ro không?
- [ ] Phân bổ: không để 1 tpDN vượt % nhất định của danh mục.

#### Ứng dụng thực tế

Nếu công ty bạn phát hành trái phiếu: dùng duration để **ghp nợ theo kỳ hạn**
(match duration với dòng tiền dự án) — trái phiếu 5 năm cho dự án 5 năm, tránh
mất cân đối khi lãi suất đổi.

#### Câu hỏi phỏng vấn xin việc

1. **Tính current yield: coupon 8 triệu/năm, giá 85 triệu.**
   *Gợi ý:* 8/85 ≈ 9,41%.
2. **Modified duration 6, lãi suất tăng 1% → giá đổi bao nhiêu?**
   *Gợi ý:* giảm ~6%.
3. **Đường cong đảo ngược cho thấy điều gì?**
   *Gợi ý:* lãi suất ngắn hạn cao hơn dài hạn — tín hiệu thắt chặt/tăng trưởng
   chậm, thường gắn với kỳ vọng suy thoái phía trước.

---

## Bài 3 — Phân tích cơ bản & CAPM

### Phần A — Cơ bản

**Phân tích cơ bản (fundamental analysis):** định giá công ty qua doanh thu, lợi
nhuận, dòng tiền, tài sản, tăng trưởng — để tìm giá trị nội tại so với giá thị
trường.

**Một số chỉ số định giá:**

| Chỉ số | Công thức | Ý nghĩa |
|--------|-----------|---------|
| P/E | Giá / EPS | Trả bao nhiêu cho 1đ lãi |
| P/B | Giá / BVPS | So với sổ sách |
| EPS | Lợi nhuận / số cổ phiếu | Lãi trên mỗi cổ phiếu |
| ROE | Lợi nhuận / vốn chủ | Hiệu quả vốn |

**CAPM (Capital Asset Pricing Model)** — mô hình định giá tài sản, cho **lợi
suất kỳ vọng** của một tài sản:

$$E(R_i) = R_f + \beta_i \times [E(R_m) - R_f]$$

- $R_f$ = lãi suất không rủi ro (VD trái phiếu chính phủ ngắn hạn).
- $\beta_i$ = độ nhạy với thị trường.
- $E(R_m) - R_f$ = **risk premium thị trường** (bù rủi ro cổ phiếu).

**Beta** — đo rủi ro hệ thống:

- $\beta = 1$: biến động theo thị trường.
- $\beta > 1`: rủi ro cao hơn thị trường (VD cổ phiếu công nghệ đầu cơ).
- $\beta < 1$: ít nhạy hơn (VD cổ phiếu điện, tiêu dùng thiết yếu).

**Ước tính beta:** hồi quy suất cổ phiếu vs. chỉ số thị trường, hoặc so sánh
số liệu công bố; beta ngành thường ổn định hơn beta từng công ty theo thời gian.

**Ví dụ tính CAPM:** $R_f = 6\%$ (trái phiếu CP VN kỳ hạn ngắn tham chiếu),
premium thị trường 7%, cổ phiếu A có $\beta = 1{,}3$:

$$E(R_A) = 6\% + 1{,}3 \times 7\% = 6\% + 9{,}1\% = 15{,}1\%$$

Nếu cổ phiếu A đang có kỳ vọng thực tế chỉ 10% từ phân tích — "quá rẻ" theo
CAPM (trên SML); nếu kỳ vọng 25% — "quá đắt" hoặc bạn đang đánh cược rủi ro riêng
không được bù.

### Phần B — Nâng cao

**Security Market Line (SML):** đồ thị CAPM — trục x là beta, trục y là lợi
suất kỳ vọng; điểm thị trường $\beta=1$; **mọi tài sản cân bằng nằm trên SML**;
dưới SML = không đủ bù rủi ro → bán.

**Giới hạn nghiêm trọng của CAPM:**

1. Chỉ một yếu tố (beta) giải thích — thực tế còn quy mô, value, momentum (Fama–French 3 yếu tố, Carhart 4).
2. Giả định nhà đầu tư đa dạng hóa hoàn hảo — không mô tả được rủi ro riêng.
3. $R_f$, premium là ước tính — kết quả kỳ vọng nhạy dữ liệu đầu vào.
4. Dữ liệu lịch sử VN mỏng, chỉ số nền (VN-Index…) mới vài thập kỷ, cấu trúc
   thị trường thay đổi nhanh → beta không ổn định.

**WACC (chi phí vốn bình quân gia quyền)** — cầu nối CAPM sang quản trị doanh
nghiệp:

$$WACC = \frac{E}{E+D} \cdot R_e + \frac{D}{E+D} \cdot R_d \cdot (1-t)$$

$E$ vốn chủ, $D$ nợ, $R_e$ chi phí vốn chủ (từ CAPM), $R_d$ chi phí nợ, $t$ thuế
thu nhập doanh nghiệp.

**Ví dụ:** $E = 70\%$, $D = 30\%$, $R_e = 15\%$, $R_d = 9\%$, $t = 20\%$:

$$WACC = 0{,}7 \times 15\% + 0{,}3 \times 9\% \times 0{,}8 = 10{,}5\% + 2{,}16\% = 12{,}66\%$$

Dự án có IRR > 12,66% mới tạo giá trị (giả định rủi ro dự án = rủi ro công ty).

**Tranh luận: "CAPM vẫn dạy vì sao?"** — Dù sai thực nghiệm, CAPM cung cấp **ngôn
ngữ chung**: tách rủi ro bù được/bằng diversification, so sánh kỳ vọng qua SML,
tính WACC. Nâng cấp thực tế: dùng multifactor model + margin of safety thay vì
tin point estimate CAPM.

### Phần C — Thực tế

**Case quốc tế — "beta là thứ thay đổi":** trong khủng hoảng, cổ phiếu từng
"ổn định" (beta thấp) có beta tăng vọt — bảo hiểm rủi ro bằng beta quá khứ sai
ngay lúc cần nhất. Lesson: beta là **ước tính có tính chu kỳ**, không phải thuộc
tính vật chất.

**Case generic — đánh giá dự án M&A nội bộ:** công ty định mua startup với IRR
dự kiến 20%. Lãnh đạo hỏi "IRR 20% là cao hay thấp?" CAPM trả lời: nếu WACC công
ty 12,66%, "kỳ vọng trên rủi ro" = 20% − 12,66% = 7,34% → cao hơn lãi vay và
trên ngưỡng — nhưng phải cộng **margin of safety** cho startup (β thực > 1,5,
dữ liệu mỏng) → ngưỡng nội bộ đặt 25% → dự án rơi vào vùng cân nhắc, không
"auto-approve".

**Lỗi thường gặp:**

- Nhìn P/E thấp => "rẻ" mà không so ngành, không so tăng trưởng.
- Dùng beta 1 công ty niêm yết 3 tháng => không có ý nghĩa.
- Áp WACC cho mọi dự án không phân biệt rủi ro (dự án đầu cơ dùng WACC công ty).
- Tưởng CAPM "tính giá cổ phiếu" — CAPM tính **yêu cầu bù rủi ro**, không phải
  giá nội tại (cần dòng tiền + chiết khấu riêng).

**Checklist phân tích một cổ phiếu (bản đồ 1 trang):**

- [ ] Kinh doanh làm gì, 3 nguồn doanh thu chính.
- [ ] Xu hướng doanh thu/lợi nhuận 3–5 năm, biên.
- [ ] P/E, P/B so ngành + giải thích (không chỉ số).
- [ ] Nợ/vốn chủ, dòng tiền tự do.
- [ ] Quản trị: tỷ lệ sở hữu, lịch sử chia cổ tức, scandal.
- [ ] Rủi ro riêng chính: tập trung khách hàng, pháp lý, ngành.
- [ ] Kỳ vọng vs. CAPM/WACC (tài chính) — có margin of safety?

#### Ứng dụng thực tế

Dùng CAPM/WACC trong **proposal đầu tư nội bộ**: mọi dự án trên 1 tỷ đồng phải
trình IRR so với WACC điều chỉnh rủi ro ngành (dự án logistics rủi ro cao hơn
trụ sở văn phòng) — nâng chất thảo luận từ "có vẻ hay" sang "trên dưới ngưỡng".

#### Câu hỏi phỏng vấn xin việc

1. **Tính CAPM: Rf = 5%, premium 8%, β = 0,8.**
   *Gợi ý:* 5% + 0,8×8% = 11,4%.
2. **Beta > 1 nghĩa là gì?**
   *Gợi ý:* cổ phiếu nhạy thị trường hơn trung bình — rủi ro hệ thống cao, kỳ
   vọng bù cao hơn theo CAPM.
3. **3 giới hạn của CAPM bạn sẽ nhắc khi trình bày với sếp?**
   *Gợi ý:* một yếu tố, beta không ổn định, dữ liệu premium ước tính — dùng như
   khung tham chiếu, không dùng như máy tính sự thật.

---

## Bài 4 — Hiệu suất đầu tư: Sharpe, Sortino, alpha

### Phần A — Cơ bản

**Hiệu suất danh mục (portfolio performance)** luôn so với: (1) tuyệt đối (bao
nhiêu %), (2) rủi ro đã chịu, (3) chỉ số tham chiếu (benchmark).

**Sharpe ratio** — lợi nhuận vượt trên lãi suất không rủi ro cho mỗi đơn vị
rủi ro **tổng** (độ lệch chuẩn):

$$S = \frac{R_p - R_f}{\sigma_p}$$

**Ví dụ:** danh mục năm qua 18%, $R_f$ = 5%, $\sigma_p$ = 15%:

$$S = \frac{18 - 5}{15} = 0{,}87$$

**Sortino ratio** — chỉ tính **phía xấu** (downside deviation $\sigma_d$):

$$\text{Sortino} = \frac{R_p - R_f}{\sigma_d}$$

Phù hợp tài sản lệch (asymmetric) — phân phối lợi nhuận không chuẩn.

**Alpha (Jensen's alpha):**

$$\alpha = R_p - [R_f + \beta_p (R_m - R_f)]$$

Ví dụ: $R_p = 16\%$, $R_f = 5\%$, $\beta_p = 1{,}2$, $R_m = 10\%$:

$$\alpha = 16\% - [5\% + 1{,}2 \times (10\% - 5\%)] = 16\% - 11\% = 5\%$$

Alpha > 0 = hiệu suất sau rủi ro hệ thống là dương (tạo giá trị).

**Treynor ratio:**

$$T = \frac{R_p - R_f}{\beta_p}$$

— lợi nhuận vượt Rf cho mỗi đơn vị beta (rủi ro hệ thống).

### Phần B — Nâng cao

**M² (Modigliani–Modigliani):** chuẩn hóa Sharpe về %:

$$M^2 = S_p \times \sigma_m + R_f$$

Cho biết "nếu điều chỉnh rủi ro về mức thị trường, danh mục sẽ cho lợi nhuận
bao nhiêu" — dễ giải thích với khách hàng hơn Sharpe thuần.

**Ví dụ:** $S_p = 0{,}87$, $\sigma_m$ = 12%, $R_f$ = 5%:

$$M^2 = 0{,}87 \times 12\% + 5\% = 15{,}44\%$$

— danh mục "mạnh hơn thị trường" một cách điều chỉnh rủi ro.

**Đo tracking & information ratio:**

$$IR = \frac{R_p - R_b}{\text{TE}}, \quad \text{TE} = \sigma(R_p - R_b)$$

$R_b$ = benchmark; tracking error (TE) đo mức "lệch" khỏi chỉ số. IR cao = nhà
quản trị hiệu quả theo chủ động.

**Tranh luận: "Sharpe cao = quỹ tốt?"** — Sharpe penalize cả biến động tích cực
lẫn tiêu cực; quỹ chỉ số ổn định có thể Sharpe cao hơn quỹ thiên tài lệch đuôi;
nên đọc **Sharpe + Sortino + max drawdown + alpha dài kỳ** cùng nhau. Ngoài ra,
Sharpe trên dữ liệu ngắn/tháng rất nhiễu — dùng 3–5 năm+, và tính cả giai đoạn
crash.

**Max drawdown (MDD):** mức giảm sâu nhất từ đỉnh xuống đáy — đo "nỗi đau tối
đa":

$$MDD = \frac{\text{Đỉnh} - \text{Đáy sau đỉnh}}{\text{Đỉnh}}$$

Ví dụ danh mục 100 → 65 → 90: MDD = 35%. Quỹ Sharpe 1,0 nhưng MDD 60% khác
rất nhiều quỹ Sharpe 0,8, MDD 20% với NĐT cá nhân sợ mất mát.

**Bản cáo hiệu suất cần có:** return theo năm + so benchmark, Sharpe, Sortino,
MDD, AUM, phí, giai đoạn đo (nhất là gồm/loại trừ giai đoạn crash).

### Phần C — Thực tế

**Case quốc tế — quỹ chỉ số vs. quỹ chủ động (bức tranh dài hạn):** nhiều khảo
sát ngành cho thấy **phần lớn quỹ chủ động underperform chỉ số sau phí** trên
kỳ 10–15 năm (tỉ lệ đổi theo năm); điều đó giải thích rise of index investing.
Bài học: alpha **phải chứng minh sau phí, sau rủi ro, kéo dài** — không phải 1
quý đẹp.

**Case generic — so sánh 2 quỹ tại VN (bài tập minh họa):** Quỹ A: return 22%,
σ 28%, Rf 5% → Sharpe = 0,61; Quỹ B: return 14%, σ 10% → Sharpe = 0,90. NĐT
không rủi ro thích B; NĐT trẻ, khẩu vị cao, xem MDD chấp nhận được có thể chọn
A hoặc kết hợp. **Không có "quỹ tốt nhất" tuyệt đối — có danh mục phù hợp khẩu
vị.**

**Lỗi thường gặp:**

- So hiệu suất 1 quý làm kết luận.
- Quên so với benchmark (thị trường chung 40% năm đó, quỹ 30% là **kém**).
- Bỏ qua phí quản lý/sự kiện (fee + load) khi so sánh.
- Chọn quỹ theo Sharpe quá khứ mà không xem phong cách, AUM, MDD, tính liên tục
  của đội ngũ.
- Tính alpha 1 năm = "nhà quản lý giỏi" — statistically noisy.

**Checklist đánh giá hiệu suất quỹ/danh mục:**

- [ ] Trả lời: so với benchmark nào, trong bao lâu, gồm cả crash?
- [ ] Sharpe + Sortino + MDD + alpha (hoặc IR nếu chủ động).
- [ ] Phí tổng thể (%/năm) + thuế sự kiện.
- [ ] Tính nhất quán: drawdown phục hồi bao lâu, turnover.
- [ ] Phong cách/sector exposure có đúng mục tiêu bạn không?
- [ ] Rủi ro tập trung: top holdings %, trùng lặp với index bạn đã nắm.

#### Ứng dụng thực tế

Nếu bạn là khách hàng/cố vấn: xây **"hiệu suất dashboard" 1 trang** cho danh mục
bản thân: return năm, so VN-Index hoặc 60/40 benchmark, Sharpe 3 năm, MDD, %
phí — chấm điểm 4 tiêu chí thay vì nhìn giá tài sản "hôm nay xanh hay đỏ".

#### Câu hỏi phỏng vấn xin việc

1. **Sharpe khác Sortino ở đâu, khi nào dùng Sortino?**
   *Gợi ý:* Sharpe dùng σ tổng; Sortino dùng downside deviation — dùng khi phân
   phối lệch, NĐT chỉ quan tâm mất mát.
2. **Tính Jensen alpha: Rp = 14%, Rf = 4%, β = 1,1, Rm = 9%.**
   *Gợi ý:* 14% − [4% + 1,1×5%] = 14% − 9,5% = 4,5%.
3. **Vì sao "Sharpe cao vẫn có thể chọn sai quỹ"?**
   *Gợi ý:* phí, phong cách lệch mục tiêu, MDD khủng khiếp, alpha không bền,
   benchmark sai, dữ liệu quá ngắn.

---

## Bài 5 — Lý thuyết danh mục hiện đại (Markowitz)

### Phần A — Cơ bản

**Danh mục (portfolio):** tập hợp tài sản với tỷ trọng $w_i$ (weights), tổng
$\sum w_i = 1$.

**Lợi nhuận kỳ vọng danh mục:**

$$E(R_p) = \sum_{i} w_i E(R_i)$$

**Ví dụ:** cổ phiếu A 60% (kỳ vọng 15%), trái phiếu B 40% (kỳ vọng 7%):

$$E(R_p) = 0{,}6 \times 15\% + 0{,}4 \times 7\% = 11{,}8\%$$

**Phương sai 2 tài sản:**

$$\sigma_p^2 = w_1^2\sigma_1^2 + w_2^2\sigma_2^2 + 2w_1w_2\sigma_1\sigma_2\rho_{12}$$

**Ví dụ:** $\sigma_1 = 20\%$, $\sigma_2 = 10\%$, $\rho = 0{,}1$, $w_1=w_2=0{,}5$:

$$\sigma_p^2 = 0{,}25(0{,}04) + 0{,}25(0{,}01) + 2(0{,}5)(0{,}5)(0{,}1)(0{,}2)(0{,}1) = 0{,}01 + 0{,}0025 + 0{,}001 = 0{,}0135$$

$$\sigma_p = \sqrt{0{,}0135} ≈ 11{,}6\%$$

Trong khi trung bình hai σ = 15% — **giảm rủi ro nhờ correlation < 1**.

**Trường hợp đặc biệt:** $\rho = -1$ → có thể dựng danh mục **không rủi ro hoàn
toàn** (σ = 0) với trọng số phù hợp; thực tế hiếm cặp nào = −1.

**Efficient frontier (biên hiệu quả):** tập hợp các danh mục cho **lợi nhuận kỳ
vọng cao nhất tại mỗi mức rủi ro** (hoặc rủi ro thấp nhất cho mỗi mức lợi
nhuận); các điểm dưới biên là kém hiệu quả (có thể tăng lợi nhuận **miễn phí**giảm rủi ro).

### Phần B — Nâng cao

**Global minimum variance portfolio:** điểm trên biên có σ nhỏ nhất — tồn tại
kể cả không có tài sản "an toàn".

**Tangency portfolio & Sharpe tối đa:** đường thẳng từ $R_f$ tiếp xúc biên hiệu
quả tại **tangency portfolio** — danh mục có **Sharpe cao nhất** (kết hợp tiền
mặt + tangency = tất cả NĐT rational nắm cùng 1 danh mục rủi ro — **separation
theorem** của Tobin).

**Tranh luận & giả định "vũ khí hóa" (weaponized Markowitz):** Markowitz dùng
các ước tính số liệu (lợi nhuận kỳ vọng, ma trận hiệp phương sai) — sai số ước
tính nhỏ → trọng số tối ưu **rất nhạy cảm** (Michaud: "estimation error
maximized"). Thực hành sửa: **shrinkage estimator**, ràng buộc trọng số
(constrained optimization), equal weight/balanced rule (60/40) đôi khi đánh
bại "tối ưu" thuần.

**Diversification — "bữa trưa miễn phí":** giảm rủi ro riêng bằng cách nắm nhiều
tài sản ít tương quan. Số tài sản tối ưu theo nghiên cứu cổ điển: ~20–30 cổ
phiếu cá nhân để gần hết lợi ích; **quan trọng hơn số lượng là cấu trúc tương
quan** (cổ phiếu 10 ngành ≠ 10 cổ phiếu cùng ngành).

**Lợi nhuận kỳ vọng danh mục nhiều tài sản & ma trận:** viết gọn
$\mathbf{w}^\top \boldsymbol{\mu}$ và $\mathbf{w}^\top \boldsymbol{\Sigma}\mathbf{w}$
— nền tảng của mọi optimizer danh mục.

**Giới hạn:** (i) dữ liệu quá khứ là proxy tương lai — giả định yếu nhất;
(ii) chi phí giao dịch/thuế khi rebalance bị bỏ qua trong mô hình chuẩn;
(iii) correlation tăng trong khủng hoảng (khi cần nhất, diversification yếu đi).

### Phần C — Thực tế

**Case quốc tế — Harry Markowitz (1952) & Nobel 1990:** công trình biến "đa
cổ phiếu" từ trực giác sang toán; thực tế ông tự đầu tư theo… 1/N đơn giản —
câu chuyện nổi tiếng minh họa gap giữa lý thuyết ước tính và thực hành.

**Case generic — dựng danh mục 1 tỷ VNĐ (bài tập):**

| Tài sản | Trọng số | Kỳ vọng | σ |
|---------|----------|---------|-----|
| ETF cổ phiếu VN (index) | 50% | 14% | 20% |
| Trái phiếu CP/tpDN AA | 30% | 8% | 5% |
| Vàng | 10% | 7% | 15% |
| Tiền mặt/MMF | 10% | 5% | 1% |

$$E(R_p) = 0{,}5(14) + 0{,}3(8) + 0{,}1(7) + 0{,}1(5) = 7 + 2{,}4 + 0{,}7 + 0{,}5 = 10{,}6\%$$

σ danh mục sẽ **thấp hơn** trung bình có trọng số các σ nhờ tương quan < 1
(tính chi tiết cần ma trận hiệp phương sai).

**Lỗi thường gặp:**

- Đa dạng hóa… trong 1 ngành (10 cổ phiếu chứng khoán = không diversify).
- Optimizer với ước tính nhiễu → đặt 90% vào 1 "tài sản tối ưu" historical.
- Quên tài sản quốc tế/phái sinh thực khi hợp pháp cho phép.
- Rebalance theo cảm tính, mua đỉnh bán đáy tự phá chiến lược.
- Quên mục tiêu (mục đích tiền, thời gian, khẩu vị) — danh mục phải phục vụ kế
  hoạch cuộc đời, không phải bảng Excel đẹp.

**Checklist xây danh mục:**

- [ ] Mục tiêu: mục đích tiền, thời gian, mức sụt giảm chấp nhận được (VD −20%).
- [ ] Chọn benchmark mục tiêu (VD 50/50 cổ/trái VN).
- [ ] Phân bổ chiến thuật quanh mục tiêu ±5–10%.
- [ ] Chọn công cụ rẻ, thanh khoản tốt (ETF/quỹ chỉ số nếu phù hợp).
- [ ] Rebalance theo lịch (6–12 tháng) hoặc ngưỡng ±5%.
- [ ] Ghi nhật ký giả định & review 1 lần/năm.

#### Ứng dụng thực tế

Áp dụng "biên hiệu quả" cho **ngân sách R&D của công ty**: nhiều dự án ít tương
quan (một cái tăng khi kinh tế tốt, cái kia phòng thủ) tốt hơn danh sách 10 dự
án đều "chờ kinh tế tốt" — bài học diversification áp cho vốn chiến lược.

#### Câu hỏi phỏng vấn xin việc

1. **Vì sao σ danh mục 2 tài sản ρ = 0,2 có thể thấp hơn trung bình σ?**
   *Gợi ý:* phương sai có hạng mục hiệp phương sai 2w₁w₂σ₁σ₂ρ nhỏ; mất mát một
   tài sản bù bởi tài sản khác — diversification.
2. **Efficient frontier là gì?**
   *Gợi ý:* tập danh mục Pareto-optimal rủi ro–lợi nhuận; điểm dưới biên kém hiệu
   quả.
3. **Vấn đề "estimation error" của Markowitz thực hành?**
   *Gợi ý:* trọng số nhạy cảm lỗi ước tính μ, Σ; sửa bằng shrinkage, ràng buộc
   trọng số, quy tắc đơn giản 60/40, review định kỳ.

---

## Bài 6 — Quản trị rủi ro danh mục

### Phần A — Cơ bản

**Ba nhóm rủi ro đầu tư:**

1. **Hệ thống** (thị trường, lãi suất, vĩ mô) — không diversify hết, đo bằng beta/VaR thị trường.
2. **Riêng** (công ty) — giảm bằng đa dạng hóa.
3. **Thanh khoản & model** (không bán được, mô hình sai).

**VaR (Value at Risk) — rủi ro tại ngưỡng tin cậy:**

$$P(\text{mất ≥ VaR}) = 1 - c$$

**Ví dụ:** VaR 1 ngày, 95% = 50 triệu → "với xác suất 95%, ngày mai mất không
quá 50 triệu; 1 ngày/20 có thể mất **hơn** 50 triệu."

**Ba phương pháp tính VaR:**

| Phương pháp | Cách | Ưu/nhược |
|-------------|------|----------|
| Variance–covariance | phân phối chuẩn, σ | nhanh, sai với đuôi |
| Historical simulation | lấy dữ liệu quá khứ | không giả định phân phối |
| Monte Carlo | mô phỏng hàng nghìn kịch bản | linh hoạt, nặng máy |

**Expected Shortfall (CVaR)** — trung bình lỗ **vượt** ngưỡng VaR:

$$ES = E[\text{Loss} \mid \text{Loss} > VaR]$$

ES ≥ VaR; ES mô tả "kịch bản tệ trong nhóm tệ" — được Basel ưa chuộng hơn VaR.

### Phần B — Nâng cao

**VaR 1 ngày → 1 năm (quy tắc square root of time):**

$$VaR_{1\text{năm}} ≈ VaR_{1\text{ngày}} \times \sqrt{252}$$

Giả định lợi nhuận độc lập và biến động gần không đổi — **sai trong khủng hoảng
(volatility clustering)** — dùng cẩn thận.

**Ví dụ:** VaR 1 ngày 95% = 20 triệu → VaR 1 năm ≈ 20 × 15,87 ≈ **317 triệu**.

**Stress testing & scenario analysis:** VaR dựa dữ liệu quá khứ → không mô tả
cú sốc **chưa từng có**. Stress test thiết kế kịch bản: lãi suất +3%, tỉ giá
−10%, giá dầu +50%, crash −40% chỉ số… rồi tính tác động danh mục thực (full
revaluation hoặc sensitivities).

**Công cụ phòng vệ rủi ro (hedging):** mua protective put (quyền chọn bán) —
bảo hiểm giá sàn; short futures chỉ số — giảm beta danh mục về 0 (zero-beta
hedge); trái phiếu chính phủ thường có correlation âm với cổ phiếu trong crash
flight-to-quality — nhưng VN giai đoạn ngắn dữ liệu giới hạn.

**Risk budgeting:** phân bổ "ngân sách rủi ro" cho từng nhóm/chiến lược theo
**ngân sách VaR/contribution** thay vì chỉ theo % vốn — ví dụ: chiến lược cổ
phiếu cá nhân chỉ được chiếm 30% ngân sách rủi ro dù vốn 15%.

**Giới hạn VaR:** (i) không nói gì về **kích thước** lỗ vượt ngưỡng → bổ sung
ES; (ii) nhạy phương pháp/dữ liệu; (iii) dễ tạo ảo giác an toàn ("chỉ mất tối đa
50 triệu") — phải kèm kịch bản stress; (iv) rủi ro thanh khoản không hiện diện
trong mô hình chuẩn.

### Phần C — Thực tế

**Case quốc tế — biến động tháng 8/2015 (Flash Crash era & CNY devaluation):**
nhiều "phân bổ vốn" seemingly diversify chứng kiến correlation cổ phiếu châu Á
tăng về 1 trong vài tuần — bài học: **correlation trong khủng hoảng ≠ correlation
bình thường**; luôn chạy stress correlation-1 scenario.

**Case generic — desk risk một quỹ nhỏ tại VN (minh họa):** quỹ 200 tỷ, chính
sách: VaR 95% 1 ngày ≤ 2% NAV (≤ 4 tỷ); ES ≤ 1,5× VaR; beta danh mục 0,7–1,1;
stress −25% chỉ số: NAV không giảm quá −18%. Khi vượt 3 phiên liên tiếp VaR
ngưỡng → giảm position / tăng hedging futures VN30 theo quy tắc viết sẵn.

**Lỗi thường gặp:**

- Dùng VaR 95% cho quỹ phòng hộ chuyên biệt (cần 99% + ES).
- Coi stress test là bài tập nộp một lần/năm thay vì cửa hàng risk thật.
- Hedging với sản phẩm không khớp kỳ hạn/chiều → lock nhầm rủi ro.
- Không đo rủi ro tập trung (top 3 cổ phiếu 60% NAV mà "đa dạng 20 mã").
- Tâm lý: chỉ stress "mất mát thị trường" mà quên rủi ro trái phiếu khi lãi
  suất tăng đồng thời (2022 toàn cầu).

**Checklist quy trình rủi ro hàng tuần cho danh mục:**

- [ ] VaR 1 ngày 95%/99% + ES cập nhật.
- [ ] Beta thực tế & rủi ro tập trung (top 10, ngành).
- [ ] Stress: −15% cổ, lãi suất +1%, tỉ giá −5% → NAV %.
- [ ] Thanh khoản: bao nhiêu % NAV bán được trong 3 ngày?
- [ ] Khoản lỗ lớn nhất kỳ và nguyên nhân (post-mortem).
- [ ] Kiểm tra ràng buộc (constraints) chiến thuật có bị phá không.

#### Ứng dụng thực tế

Áp dụng stress test cho **ngân sách công ty bạn**: nếu doanh thu −30% quý, bạn
đốt bao nhiêu tháng tiền mặt (runway)? Nếu tỉ giá +10% trên nhập khẩu? — đây là
"VaR dòng tiền" dành cho CFO.

#### Câu hỏi phỏng vấn xin việc

1. **Giải thích VaR 95% 1 ngày = 50 triệu.**
   *Gợi ý:* 1/20 ngày có thể mất > 50 triệu; không nói gì về mức lỗ vượt — đọc
   kèm ES.
2. **VaR khác Expected Shortfall thế nào?**
   *Gợi ý:* VaR = ngưỡng; ES = trung bình lỗ vượt ngưỡng — mô tả đuôi sâu hơn.
3. **Vì sao cần stress test ngoài VaR?**
   *Gợi ý:* VaR dựa mẫu lịch sử, không có kịch bản chưa từng thấy/tương quan
   thay đổi; stress chủ động thiết kế cú sốc.

---

## Bài 7 — Thị trường vốn Việt Nam, fintech & robo-advisor

### Phần A — Cơ bản

**Thị trường vốn Việt Nam — cấu trúc chính:**

| Thành phần | Đặc điểm |
|------------|-----------|
| HOSE | Sở Giao dịch Chứng khoán TP.HCM — cổ phiếu lớn, VN30, trái phiếu |
| HNX | Sàn Hà Nội — vốn nhỏ, UPCOM (đăng ký giao dịch) |
| Chỉ số | VN-Index (HOSE), HNX-Index, VN30 |
| T+2 | Chu kỳ thanh toán giao dịch cổ phiếu (bản chất: mua hôm nay, cổ phiếu về T+2) |
| Biên độ | ±7%/ngày HOSE (áp dụng cho cổ phiếu thông thường; giảm còn ±5%… khi thị trường bất thường) |
| Sở hữu nước ngoài | room ngoại giới hạn từng công ty |

**Công cụ khác:**

- **Trái phiếu chính phủ** phát hành qua đấu giá; có thể giao dịch sơ cấp/secondary.
- **Trái phiếu doanh nghiệp** phát hành riêng lẻ (phổ biến) hoặc chào bán ra công
  chúng — cần kiểm tra hồ sơ pháp lý.
- **Phái sinh VN30 (VN30 futures):** hợp đồng tương lai trên chỉ số VN30, ký quỹ,
  đáo hạn hàng tháng — công cụ phòng vệ/đầu cơ.

**Nghị định/khung pháp lý:** mọi hoạt động môi giới, quản lý quỹ, ngân hàng đầu
tư cần **giấy phép** của cơ quan quản lý (Ủy ban Chứng khoán Nhà nước, NHNN) —
cảnh báo chung: sàn/offshore không phép, cam kết lợi nhuận cố định là dấu hiệu
cảnh báo đỏ.

### Phần B — Nâng cao

**So sánh tài khoản và công cụ (cái nhìn tổng quát):**

- Cổ phiếu/ETF: biến động cao, thanh khoản T+2, thuế giao dịch + phí môi giới.
- Trái phiếu: thu nhập coupon, rủi ro tín dụng/thanh khoản theo loại.
- Quỹ mở (open-end fund): đa dạng hóa, có người quản lý, phí NAV.
- Tiền gửi/MMF: thanh khoản cao, lợi nhuận thấp.

**Robo-advisor & fintech đầu tư:** mô hình dùng thuật toán phân bổ danh mục theo
khẩu vị rủi ro (khảo sát → portfolio ETF/quỹ → rebalance tự động). Ưu: chi phí
thấp, kỷ luật, tiếp cận dễ. Hạn chế: mô hình chuẩn hóa, ít xử lý tình huống
phức tạp, phụ thuộc công ty nền tảng và pháp lý; VN có các dịch vụ/quỹ số
tương đương trong giai đoạn phát triển — kiểm tra giấy phép, phí, cơ chế lưu ký.

**Tranh luận: "Fintech đầu tư có thay thế nhà tư vấn?"** — Robo giải quyết 80%
nhu cầu phổ thông (phân bổ, rebalance, kỷ luật); 20% còn lại (kế hoạch thuế,
di chúc, bài toán doanh nghiệp, behavioral coaching đỉnh/đáy) vẫn cần người +
quy trình. Kết hợp: robo cho phần core, người cho phần phức tạp.

**ESG & đạo đức đầu tư (giới thiệu mở rộng ở bài 8):** tích hợp tiêu chí môi
phát–xã hội–quản trị vào lựa chọn & quản trị danh mục; tại VN: dữ liệu ESG doanh
nghiệp còn thiếu, một số quỹ quốc tế đầu tư vào VN dùng bộ lọc ESG/ngoại trừ
ngành (sinh than, vũ khí…).

### Phần C — Thực tế

**Case thực tế VN — bài học từ sự cố trái phiếu doanh nghiệp & các sàn bất hợp
pháp (tổng hợp hiện tượng):** vài năm qua, nhiều NĐT cá nhân thua lỗ vì (i) mua
tpDN không rõ hồ sơ/covenant qua môi giới cam kết lợi nhuận cao, (ii) tham gia
sàn đầu tư offshore cam kết % lợi nhuận cố định (dấu hiệu ponzi). **Bài học:**
cam kết lợi nhuận cao gấp lãi vay ngân hàng + không rủi ro = **mâu thuẫn kinh
tế cơ bản**; luôn hỏi ai là người phát hành, giấy phép, dòng tiền trả lãi đến
từ đâu.

**Case generic — NĐT cá nhân 30 tuổi (bài tập):** thu nhập 50 triệu/tháng, chi
tiêu 25 triệu, tiết kiệm 25 triệu. Mục tiêu: mua nhà 10 năm, hưu trí 25 năm.
Phân bổ gợi ý giai đoạn tích lũy: 60–70% cổ phiếu (ETF/chiến lược chỉ số),
20–30% trái phiếu/MMF, 10% tiền mặt khẩn cấp = 6 tháng chi tiêu **ngoài** danh
mục đầu tư. Review 1 lần/năm + khi có biến cố lớn (đổi việc, có con).

**Lỗi thường gặp:**

- Mua tpDN "qua mạng" không kiểm chứng người phát hành.
- Giao dịch phái sinh khi không hiểu ký quỹ/đòn bẩy.
- Đuổi theo cổ phiếu "đang hot" bằng margin.
- Bỏ phí môi giới/thuế khỏi tính toán lãi lỗ.
- Chọn nền tảng theo app đẹp thay vì pháp lý & phí.

**Checklist mở tài khoản/mua công cụ tại VN:**

- [ ] Môi giới/công ty quản lý quỹ có giấy phép công bố trên website cơ quan quản lý.
- [ ] Phí: môi giới, quản lý quỹ, lưu ký, thuế giao dịch.
- [ ] Nguồn gốc sản phẩm: phát hành bởi ai, mục đích sử dụng vốn.
- [ ] Thanh khoản & lịch đáo hạn (đặc biệt tpDN).
- [ ] Không có cam kết lợi nhuận cố định "bao lãi".
- [ ] Kế hoạch: % danh mục, mua định kỳ (DCA) vs. lump sum, ngưỡng dừng.

#### Ứng dụng thực tế

Áp dụng checklist trên khi công ty bạn chọn **sở hữu quỹ/nhân viên kế hoạch
đầu tư** hoặc khi tư vấn chương trình Retirement cho nhân viên — giúp giảm
rủi ro pháp lý cho cả hai bên.

#### Câu hỏi phỏng vấn xin việc

1. **HOSE và UPCOM khác nhau thế nào (cấp độ tổng quan)?**
   *Gợi ý:* HOSE: niêm yết chính, quy định chặt, VN30; UPCOM: đăng ký giao dịch,
   doanh nghiệp nhỏ hơn, thông tin/phát hành nhẹ hơn.
2. **Dấu hiệu nhận biết sàn đầu tư bất hợp pháp/cam kết lợi nhuận?**
   *Gợi ý:* cam kết % cố định cao, không rõ giấy phép, cơ chế rút tiền khó,
   hoa hồng tuyển người (lôi kéo), áp dụng luật nước ngoài mập mờ.
3. **Robo-advisor phù hợp cho ai, không phù hợp cho ai?**
   *Gợi ý:* phù hợp: nhu cầu phổ thông, kỷ luật, chi phí thấp; không phù hợp:
   tình huống thuế/pháp lý phức tạp, khẩu vị riêng, doanh nghiệp cần giải pháp
  đặt riêng.

---

## Bài 8 — Quản trị danh mục thực hành & đạo đức đầu tư

### Phần A — Cơ bản

**Kế hoạch đầu tư cá nhân theo mục tiêu (goal-based investing):**

| Mục tiêu | Ví dụ thời gian | Khẩu vị gợi ý |
|----------|-----------------|----------------|
| Quỹ khẩn cấp | 0–1 năm | Tiền mặt/MMF, thanh khoản cao |
| Mua nhà | 3–7 năm | 50/50 → thiên cổ phiếu thận trọng |
| Hưu trí | 10–30 năm | Thiên cổ phiếu, diversify toàn cầu |

**Các phong cách phân bổ:**

- **Strategic asset allocation:** tỷ trọng mục tiêu dài hạn (cốt lõi).
- **Tactical asset allocation:** chỉnh ±5–15% theo chu kỳ kinh tế (có kỷ luật).
- **Core–satellite:** 70–80% core (ETF/quỹ chỉ số) + 20–30% satellite (chiến
  lược chủ động/sector).

**Dollar-cost averaging (DCA):** đầu tư đều đặn theo lịch — giảm rủi ro chọn
đỉnh, kỷ luật hóa tiết kiệm; không phải "thắng" lump sum luôn, mà **rủi ro hành
vi** thấp hơn cho đa số.

**Đạo đức đầu tư (ethical/ESG investing):**

- **Negative/exclusion screening:** loại trừ ngành (tobacco, vũ khí, than…).
- **ESG integration:** đưa E, S, G vào phân tích tài chính.
- **Impact investing:** đo tác động xã hội/môi trường song song tài chính.
- **Stewardship:** bỏ phiếu cổ đông, đối thoại công ty (engagement).

**Greenwashing:** quỹ gắn nhãn "xanh" nhưng phân tích mỏng hoặc chỉ đổi tên —
kiểm tra: % tài sản thực sự theo tiêu chí, báo cáo tác động có dữ liệu không.

### Phần B — Nâng cao

**Rủi ro hành vi (behavioral finance) trong quản trị danh mục:**

- **Loss aversion:** đau gấp ~2 lần niềm vui cùng độ lớn → bán đáy.
- **Disposition effect:** bán thắng sớm, giữ thua lỗ.
- **Recency bias:** Extrapolation "mọi thứ sẽ tiếp tục" (bull) hoặc "sẽ mãi mãi xấu"
  (bear).
- **Anchoring:** bám giá mua thay vì giá trị hiện tại.

**Giải pháp hệ thống:** investment policy statement (IPS) viết trước; rebalance
theo lịch; limit order/ngưỡng tự động; nhật ký quyết định lớn.

**Tranh luận lớn: active vs. passive** — sau phí, phần lớn quỹ chủ động không
đánh bại chỉ số dài hạn (bức tranh đa quốc gia); phản biện: quỹ chủ động tốt
ở thị trường kém hiệu quả + giai đoạn biến động, và **nhu cầu behavioral
coaching**. Kết luận thực dụng: **chi phí thấp là lợi thế đảm bảo được** —
chọn active phải có luận điểm vững, không thì chọn core passive.

**Thuế & cấu trúc pháp lý:** thuế cổ tức/lãi vốn (đọc quy định hiện hành từng
thời điểm — khung có thể thay đổi), thuế doanh nghiệp nếu đầu tư qua công ty;
quy tắc: **so sánh lợi nhuận sau phí và sau thuế** — không so trước.

**Giới hạn cuối:** mọi mô hình danh mục dựa trên quá khứ; mục tiêu thực tế của
đa số NĐT không phải Sharpe cao nhất mà là **không phá hoại kế hoạch cuộc đời**
(dưới-dưỡng an toàn, tránh hành vi hủy hoại, chi phí thấp) — "good enough is
excellent" (mô hình trộn quỹ chỉ số).

### Phần C — Thực tế

**Case quốc tế — mục tiêu "100 năm" (Buffett):** quyên góp từ thiện dùng chiến
lược chỉ số + cam kết không thay đổi chiến lược vì tin chu kỳ ngắn — minh họa
**khung thời gian dài + chi phí thấp + ít giao dịch** thắng hầu hết "cố gắng
thông minh".

**Case generic — IPS 1 trang (bài tập mẫu):**

- Mục tiêu: tích lũy 10 tỷ trong 15 năm, điều chỉnh lạm phát 5%/năm.
- Khẩu vị: sụt giảm một năm −25% là ngưỡng chấp nhận; không dùng margin.
- Phân bổ chiến thuật: cổ phiếu 60% (ETF nội 40 + quốc tế 20), trái phiếu 30%,
  tiền mặt 10%.
- Rebalance: 6 tháng hoặc khi lệch ±5%.
- Ràng buộc: không tpDN dưới AA, không phái sinh đầu cơ.
- Review: 1 lần/năm + viết nhật ký lý do thay đổi.
- Đạo đức: loại trừ ngành gây hại nghiêm trọng theo danh sách công ty công bố.

**Lỗi thường gặp cuối khóa (gộp):**

- Thay đổi chiến lược sau mỗi tin tức (không có IPS).
- Quên mục tiêu thực tế (mua nhà 3 năm mà 100% cổ phiếu).
- Nhầm nền tảng/công cụ bất hợp pháp.
- Không review phí – thuế – inflation trong kết quả thực.
- Đạo đức "nửa vời": tuyên bố ESG nhưng không có tiêu chí/kiểm toán.

**Checklist hoàn thiện chương trình quản trị danh mục:**

- [ ] IPS viết tay (mục tiêu, phân bổ, rebalance, ranh giới đạo đức).
- [ ] Quỹ khẩn cấp tách khỏi danh mục đầu tư.
- [ ] Chi phí đầu tư tổng < 1%/năm cho core passive.
- [ ] Tự động hóa: DCA + rebalance nhắc lịch.
- [ ] Nhật ký quyết định lớn + review hành vi lỗi mỗi năm.
- [ ] Cập nhật pháp lý/tThuế khi quy định đổi.

#### Ứng dụng thực tế

Trong doanh nghiệp: dùng IPS logic cho **quỹ đầu tư tạm thời của công ty**
(tiền nhàn rỗi 3–12 tháng): mục tiêu thanh khoản, ranh giới rủi ro (chỉ TPCP/
MMF/ngân hàng lớn), người phê duyệt, ngưỡng dừng — tránh "quỹ tạm thời" biến
thành đầu cơ khi thấy thị trường xanh.

#### Câu hỏi phỏng vấn xin việc

1. **IPS gồm những thành phần nào?**
   *Gợi ý:* mục tiêu, khẩu vị rủi ro, phân bổ chiến thuật, rebalance, ranh giới
   công cụ/đạo đức, quy trình review.
2. **DCA lợi thế gì so với lump sum?**
   *Gợi ý:* giảm rủi ro chọn đỉnh, kỷ luật dòng tiền, phù hợp tích lũy định kỳ;
   không phải luôn tối ưu tuyệt đối về mặt thống kê.
3. **Phân biệt ESG integration và impact investing.**
   *Gợi ý:* ESG: đưa yếu tố vào phân tích tài chính; impact: cam kết đo tác
   động xã hội/môi trường song song lợi nhuận.

---

## Tóm tắt nhanh

| Bài | Khung/công cụ chính | Công thức/ngưỡng nhớ |
|-----|----------------------|----------------------|
| 1 | Cổ phiếu, trái phiếu, phái sinh, ETF | $R = (P_1-P_0+D)/P_0$ |
| 2 | YTM, duration, yield curve | $\Delta P/P \approx -D_{\text{mod}}\Delta y$ |
| 3 | CAPM, beta, SML, WACC | $E(R_i) = R_f + \beta(R_m-R_f)$ |
| 4 | Sharpe, Sortino, alpha, MDD | $S = (R_p-R_f)/\sigma_p$ |
| 5 | Markowitz, efficient frontier | $\sigma_p^2 = \sum w_i w_j \sigma_{ij}$ |
| 6 | VaR, ES, stress test | $VaR_{1\text{năm}} \approx VaR_{1\text{ngày}}\sqrt{252}$ |
| 7 | HOSE, tpDN, phái sinh, robo | Cảnh báo: cam kết lợi nhuận cố định |
| 8 | IPS, ESG, DCA, active/passive | Chi phí thấp + kỷ luật + thời gian dài |

## Thuật ngữ Anh–Việt

| Anh | Việt |
|-----|------|
| Equity / Stock | Cổ phiếu |
| Bond / Coupon / Maturity | Trái phiếu / Coupon / Ngày đáo hạn |
| Yield to Maturity (YTM) | Lợi suất đến hạn |
| Yield curve | Đường cong lợi suất |
| Duration | Thời hạn hiệu chỉnh / độ nhạy lãi suất |
| Convexity | Tính lồi của giá–yield |
| Derivatives | Công cụ phái sinh |
| Futures / Options / Swap | Tương lai / Quyền chọn / Hoán đổi |
| Strike price / Premium | Giá thực hiện / Phí quyền chọn |
| ETF | Quỹ giao dịch hànaj sàn |
| Margin / Leverage | Ký quỹ / Đòn bẩy |
| CAPM | Mô hình định giá tài sản |
| Beta | Hệ số beta (nhạy thị trường) |
| Alpha (Jensen) | Alpha (hiệu suất vượt kỳ vọng rủi ro) |
| Sharpe ratio | Hệ số Sharpe |
| Sortino ratio | Hệ số Sortino |
| Treynor ratio | Hệ số Treynor |
| M² | Chỉ số M² |
| Tracking error | Sai lệch theo dõi (vs benchmark) |
| Information ratio | Hệ số thông tin |
| Max drawdown | Mức sụt giảm tối đa |
| Markowitz / MPT | Lý thuyết danh mục hiện đại |
| Efficient frontier | Biên hiệu quả |
| Diversification | Đa dạng hóa |
| Correlation / Covariance | Tương quan / Hiệp phương sai |
| Weight | Tỷ trọng danh mục |
| VaR | Giá trị rủi ro |
| ES / CVaR | Kỳ vọng rủi ro (trung bình đuôi) |
| Stress test | Kiểm tra căng thẳng |
| Hedging | Phòng vệ rủi ro |
| Risk appetite | Khẩu vị rủi ro |
| Benchmark | Chỉ số tham chiếu |
| NAV | Giá trị tài sản ròng (quỹ) |
| Robo-advisor | Cố vấn đầu tư tự động |
| ESG | Môi trường – Xã hội – Quản trị |
| Greenwashing | Rửa sinh thái (nhãn xanh giả) |
| IPS | Tuyên bố chính sách đầu tư |
| DCA | Đầu tư bình quân theo kỳ |
| Active vs. passive | Chủ động vs. thụ động |
| HOSE / HNX / UPCOM | Sàn chứng khoán TP.HCM / Hà Nội / Đăng ký giao dịch |
| VN30 | Chỉ số 30 cổ phiếu lớn HOSE |
| Bull / Bear market | Thị trường tăng / giảm |

---
*Từ đây, làm bài tập trong `cau-hoi.md` và xem nhanh `slides.md` của chuyên đề.*
