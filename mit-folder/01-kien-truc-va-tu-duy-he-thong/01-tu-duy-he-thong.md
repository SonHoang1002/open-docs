# Chương 1: Tư duy hệ thống

## 1.1. Mở đầu: vì sao phải nghĩ theo hệ thống

Con người có xu hướng tự nhiên là nhìn sự vật theo từng phần rời rạc. Khi
đứng trước một chiếc xe hơi, ta thấy bánh xe, động cơ, vô lăng; khi đứng
trước một tổ chức, ta thấy các phòng ban; khi đứng trước một sản phẩm phần
mềm, ta thấy các màn hình chức năng. Cách nhìn này hữu ích cho việc phân
tích cục bộ, nhưng nó bỏ qua điều quan trọng nhất: **các phần tử tương tác
với nhau**, và chính tương tác mới tạo ra hành vi mà ta quan tâm.

Tư duy hệ thống (systems thinking) là năng lực nhìn một đối tượng như một
**tổng thể có tương tác**, thay vì một tập hợp các bộ phận độc lập. Nó đòi
hỏi ta phải đồng thời trả lời ba câu hỏi:

1. Cái gì nằm bên trong hệ thống (các phần tử)?
2. Các phần tử liên kết với nhau như thế nào (cấu trúc)?
3. Hệ thống làm gì trong môi trường của nó (chức năng)?

Khóa học System Architecture đặt tư duy hệ thống làm nền tảng, bởi vì kiến
trúc sư không thể đưa ra quyết định đúng nếu chỉ nhìn thấy các bộ phận. Một
quyết định về bánh xe có thể làm hỏng khả năng phanh; một quyết định về giao
diện phần mềm có thể làm tê liệt toàn bộ kiến trúc thông tin; một quyết định
về một phòng ban có thể phá vỡ luồng giá trị của cả doanh nghiệp.

## 1.2. Định nghĩa hệ thống

### 1.2.1. Định nghĩa

> **Hệ thống (system)** là một tập hợp các phần tử (elements) có quan hệ
> tương tác lẫn nhau, được tổ chức để thực hiện một chức năng (function),
> mà chức năng của toàn thể lớn hơn tổng chức năng của các phần.

Ba thành phần không thể thiếu của định nghĩa:

| Thành phần | Ý nghĩa | Câu hỏi kiểm tra |
|------------|---------|------------------|
| Phần tử (elements) | Các thành phần cấu thành | Có những gì? |
| Tương tác (interactions) | Quan hệ giữa các phần tử | Chúng liên kết ra sao? |
| Chức năng (function) | Mục đích của toàn thể | Nó làm gì? |

Nếu thiếu tương tác, ta chỉ có một **tập hợp** (collection), không phải hệ
thống. Một đống gạch không phải là hệ thống; một bức tường có gạch liên kết
với nhau mới là hệ thống. Nếu thiếu chức năng, ta có một **cấu trúc** nhưng
không có hệ thống theo nghĩa kỹ thuật. Nếu chức năng toàn thể chỉ bằng tổng
các phần, ta có một **tổ hợp** (aggregate), không phải hệ thống thực sự.

### 1.2.2. Ví dụ: còi (whistle)

Một chiếc còi là hệ thống đơn giản nhất mà khóa học dùng để minh họa. Nó có:

- **Phần tử**: thân còi (cavity), lỗ thổi (mouthpiece), lỗ thoát (opening),
  mép cắt (edge), và viên bi (pea) nếu là còi có bi.
- **Tương tác**: luồng khí đi qua khe hẹp, tách dòng (shedding) tạo xoáy,
  va vào mép cắt, gây dao động cộng hưởng trong khoang.
- **Chức năng**: phát ra âm thanh có tần số xác định khi có luồng khí đi vào.

Điều đáng chú ý: *không phần tử nào tự nó tạo ra âm thanh*. Thân còi không
kêu, lỗ thổi không kêu, mép cắt không kêu. Âm thanh **xuất hiện** (emerges)
từ tương tác của tất cả các phần tử trong một cấu trúc nhất định. Đây là
ví dụ nền tảng cho khái niệm **hành vi xuất hiện** (emergent behavior), sẽ
được triển khai ở mục 1.4.

### 1.2.3. Ví dụ: tủ lạnh (refrigerator)

Tủ lạnh phức tạp hơn còi nhưng vẫn đủ nhỏ để phân tích. Nó gồm:

- **Phần tử cơ**: vỏ, cửa, gioăng, kệ, quạt.
- **Phần tử điện**: máy nén (compressor), động cơ quạt, thermostat, relay.
- **Phần tử nhiệt**: dàn bay hơi (evaporator), dàn ngưng (condenser),
  ống mao dẫn (capillary tube), môi chất lạnh (refrigerant).
- **Tương tác**: môi chất lạnh bay hơi hấp thụ nhiệt, máy nén tăng áp,
  dàn ngưng thải nhiệt ra môi trường, ống mao dẫn điều tiết áp suất.
- **Chức năng**: giữ nhiệt độ bên trong thấp hơn môi trường và ổn định.

Tủ lạnh cho thấy một hệ thống thường có **nhiều tầng chức năng**: chức năng
chính (bảo quản thực phẩm), các chức năng phụ (làm đá, lấy nước), và các
chức năng hỗ trợ (cách nhiệt, giảm tiếng ồn, tiết kiệm điện).

## 1.3. Hệ thống mở và hệ thống đóng

### 1.3.1. Hệ thống mở (open system)

Hệ thống mở trao đổi vật chất, năng lượng hoặc thông tin với môi trường.
Hầu hết hệ thống kỹ thuật và xã hội là hệ thống mở:

- Tủ lạnh trao đổi nhiệt với phòng bếp.
- Ô tô trao đổi nhiên liệu, khí thải, nhiệt với môi trường.
- Doanh nghiệp trao đổi tiền, hàng hóa, thông tin với thị trường.

### 1.3.2. Biên giới hệ thống (system boundary)

Biên giới là ranh giới khái niệm phân biệt "bên trong" và "bên ngoài" hệ
thống. Biên giới không phải lúc nào cũng trùng với biên giới vật lý:

- Với còi, biên giới vật lý khá rõ: vỏ còi.
- Với tủ lạnh, biên giới vật lý là vỏ tủ, nhưng biên giới chức năng bao gồm
  cả không khí trong tủ và môi trường tản nhiệt.
- Với phần mềm, biên giới là giao diện lập trình (API) và giao diện người
  dùng, không phải là file thực thi.

Việc xác định biên giới là một **quyết định kiến trúc**. Nó quyết định cái
gì nằm trong phạm vi thiết kế, cái gì là ràng buộc từ bên ngoài. Rất nhiều
tranh chấp trong dự án thực chất là tranh chấp về biên giới hệ thống.

### 1.3.3. Bối cảnh (context)

Bối cảnh là phần của thế giới bên ngoài có tương tác với hệ thống. Kiến trúc
sư cần vẽ **sơ đồ bối cảnh** (context diagram) để xác định:

- Các tác nhân bên ngoài (external actors) tương tác với hệ thống.
- Các dòng vào/ra (inputs/outputs) giữa hệ thống và tác nhân.
- Các ràng buộc (constraints) do bối cảnh áp đặt.

Ví dụ với tủ lạnh, bối cảnh gồm: nguồn điện, người dùng, thực phẩm, không
khí phòng, và tiêu chuẩn an toàn/năng lượng.

## 1.4. Hành vi xuất hiện (emergent behavior)

### 1.4.1. Định nghĩa

> **Hành vi xuất hiện** là hành vi của hệ thống không thể quy trực tiếp về
> hành vi của bất kỳ phần tử riêng lẻ nào, mà nảy sinh từ tương tác giữa các
> phần tử.

Tính xuất hiện (emergence) là dấu hiệu phân biệt hệ thống thực sự với một
tập hợp đơn thuần. Nó có hai mặt:

- **Xuất hiện mong muốn** (desirable emergence): chức năng mà ta thiết kế.
- **Xuất hiện không mong muốn** (undesirable emergence): hành vi phụ, tai
  nạn, hiệu ứng phụ, thất bại dây chuyền.

### 1.4.2. Ví dụ mong muốn

- Còi: âm thanh xuất hiện từ tương tác khí và khoang cộng hưởng.
- Đàn violin: âm nhạc xuất hiện từ tương tác dây, thùng đàn, cần đàn, vĩ.
- Thị trường: giá cả xuất hiện từ tương tác người mua và người bán, không
  ai đặt ra giá cho toàn thị trường.
- Internet: khả năng định tuyến toàn cầu xuất hiện từ tương tác hàng triệu
  router độc lập theo giao thức chung.

### 1.4.3. Ví dụ không mong muốn

- Cầu Tacoma Narrows: dao động xoắn xuất hiện từ tương tác gió và kết cấu,
  phá hủy cầu dù từng phần tử đều đạt yêu cầu.
- Tắc nghẽn giao thông: xuất hiện từ tương tác các xe, không do một xe nào.
- Sụp đổ tài chính: xuất hiện từ tương tác các công cụ tài chính phức tạp.
- Phần mềm: deadlock xuất hiện từ tương tác các tiến trình, dù từng tiến
  trình đúng.

### 1.4.4. Hệ quả cho kiến trúc sư

Kiến trúc sư không thể chỉ kiểm tra từng phần tử riêng lẻ. Phải kiểm tra
**tương tác** và **hành vi toàn cục**. Đây là lý do vì sao kiểm thử tích hợp
(integration testing), mô phỏng (simulation), và đánh giá kiến trúc
(architecture evaluation) là bắt buộc, không thể thay thế bằng kiểm thử đơn vị.

Một nguyên tắc thực hành: **thiết kế cho hành vi xuất hiện mong muốn, và
thiết kế để phát hiện sớm hành vi xuất hiện không mong muốn**. Điều này dẫn
đến các khái niệm như "fail-fast", "observability", "graceful degradation".

## 1.5. Holism, balance, focus

Khóa học nêu ba phẩm chất tư duy của kiến trúc sư giỏi:

### 1.5.1. Holism (tính toàn thể)

Nhìn hệ thống như một chỉnh thể, không bị cuốn vào chi tiết cục bộ. Kiến
trúc sư phải giữ được "bức tranh lớn" trong khi vẫn hiểu đủ sâu các phần
quan trọng.

### 1.5.2. Balance (cân bằng)

Cân bằng giữa các thuộc tính đối kháng: hiệu năng và chi phí, độ tin cậy và
độ phức tạp, tính linh hoạt và tính tối ưu, tốc độ phát triển và chất lượng.
Không có kiến trúc "tốt tuyệt đối"; chỉ có kiến trúc phù hợp với bối cảnh.

### 1.5.3. Focus (tập trung)

Tập trung vào các quyết định có đòn bẩy cao nhất, vào các giao diện quan
trọng nhất, vào các rủi ro lớn nhất. Kiến trúc sư không thể giải quyết mọi
thứ; phải chọn nơi đặt nỗ lực.

Ba phẩm chất này bổ sung cho nhau: holism để không mất tổng thể, balance để
không cực đoan, focus để không phân tán.

## 1.6. Các cấp độ ý định (levels of intent)

Một trong những công cụ tư duy mạnh nhất của khóa học là thang **các cấp độ
ý định** — từ mục tiêu trừu tượng nhất đến hành động cụ thể nhất:

```
Mục tiêu xã hội (societal goal)
        |
        v
Mục tiêu kinh doanh (business goal)
        |
        v
Mục tiêu người dùng (user goal)
        |
        v
Yêu cầu (requirements)
        |
        v
Chức năng (function)
        |
        v
Hành vi (behavior)
        |
        v
Thiết kế (design)
```

Mỗi cấp độ trả lời câu hỏi "vì sao" của cấp dưới và "làm thế nào" của cấp
trên. Ví dụ với dụng cụ mở nút chai (corkscrew):

| Cấp độ | Nội dung |
|--------|----------|
| Mục tiêu xã hội | Thưởng thức rượu vang một cách thuận tiện |
| Mục tiêu kinh doanh | Bán được dụng cụ mở chai với lợi nhuận |
| Mục tiêu người dùng | Mở nút chai nhanh, không làm vỡ nút |
| Yêu cầu | Lực kéo nhỏ hơn X, thời gian dưới Y giây |
| Chức năng | Tách nút chai khỏi cổ chai |
| Hành vi | Xoắn mũi khoan vào nút, đòn bẩy kéo nút lên |
| Thiết kế | Tay quay, bánh răng, mũi xoắn, thân đỡ |

Việc leo thang và hạ thang các cấp độ ý định là kỹ năng cốt lõi để giải
quyết mơ hồ: khi yêu cầu chưa rõ, ta leo lên cấp mục tiêu; khi mục tiêu quá
trừu tượng, ta hạ xuống cấp chức năng.

## 1.7. Phân biệt hệ thống với các khái niệm gần

### 1.7.1. Hệ thống và quy trình (process)

Quy trình là một chuỗi hoạt động có thứ tự. Hệ thống bao gồm cả quy trình
và các đối tượng mà quy trình tác động. Một quy trình có thể là một phần
của hệ thống, hoặc bản thân nó có thể được xem là một hệ thống.

### 1.7.2. Hệ thống và sản phẩm (product)

Sản phẩm là một hệ thống được tạo ra để bán hoặc sử dụng. Không phải mọi hệ
thống đều là sản phẩm (ví dụ: hệ sinh thái), và không phải mọi sản phẩm đều
được thiết kế như hệ thống (ví dụ: tác phẩm nghệ thuật).

### 1.7.3. Hệ thống và doanh nghiệp (enterprise)

Doanh nghiệp là một hệ thống xã hội–kỹ thuật bao gồm con người, quy trình,
công nghệ, và cấu trúc tổ chức. Kiến trúc doanh nghiệp (enterprise
architecture) áp dụng cùng tư duy hệ thống cho tổ chức.

### 1.7.4. Hệ thống và hệ thống con (subsystem)

Hệ thống con là một hệ thống nằm trong hệ thống lớn hơn, có chức năng riêng
và giao diện với phần còn lại. Việc phân rã hệ thống thành các hệ thống con
là một quyết định kiến trúc, sẽ được bàn kỹ ở chương 6.

## 1.8. Tư duy hệ thống trong thực hành kiến trúc

### 1.8.1. Vẽ ranh giới trước khi vẽ giải pháp

Trước khi nghĩ đến bộ phận nào, hãy xác định:

- Hệ thống phục vụ ai (stakeholders)?
- Hệ thống tương tác với cái gì bên ngoài?
- Đâu là biên giới trách nhiệm của đội thiết kế?

### 1.8.2. Phân biệt chức năng và giải pháp

Chức năng là "cái gì", giải pháp là "như thế nào". Tư duy hệ thống đòi hỏi
ta nói về chức năng trước khi nói về giải pháp. Ví dụ: "làm mát thực phẩm"
là chức năng; "dùng máy nén khí" là giải pháp.

### 1.8.3. Tìm các vòng phản hồi (feedback loops)

Hệ thống thực thường có vòng phản hồi: đầu ra ảnh hưởng đầu vào. Ví dụ:

- Thermostat: nhiệt độ thấp → máy nén chạy → nhiệt độ giảm → máy nén dừng.
- Thị trường: giá cao → cung tăng → giá giảm.
- Phần mềm: tải cao → hàng đợi dài → độ trễ tăng → người dùng bỏ đi.

Nhận diện vòng phản hồi giúp dự đoán hành vi động, dao động, và mất ổn định.

### 1.8.4. Chấp nhận rằng hệ thống nằm trong hệ thống lớn hơn

Không có hệ thống nào tồn tại biệt lập. Mọi hệ thống đều là hệ thống con của
một hệ thống lớn hơn (system of systems). Điều này có nghĩa là kiến trúc phải
tính đến các ràng buộc và tác động ở cấp trên.

## 1.9. Các ngụy biện thường gặp

### 1.9.1. Ngụy biện "tối ưu từng phần sẽ tối ưu toàn thể"

Đây là sai lầm phổ biến nhất. Tối ưu cục bộ có thể làm xấu đi hiệu năng toàn
cục do tương tác. Ví dụ: tăng công suất máy nén tủ lạnh (tối ưu làm lạnh) có
thể làm tăng tiếng ồn, tăng tiêu thụ điện, và giảm tuổi thọ các bộ phận khác.

### 1.9.2. Ngụy biện "thêm phần tử sẽ tốt hơn"

Thêm phần tử làm tăng số giao diện, do đó tăng độ phức tạp. Đôi khi giải pháp
tốt nhất là **bớt** phần tử hoặc thay đổi cấu trúc.

### 1.9.3. Ngụy biện "hệ thống là tổng các phần"

Đã bàn ở trên: hệ thống có hành vi xuất hiện, nên không thể suy ra hành vi
toàn thể chỉ từ danh sách phần tử.

### 1.9.4. Ngụy biện "mọi thứ đều quan trọng như nhau"

Không phải vậy. Một số quyết định có đòn bẩy cao, số khác thấp. Tư duy hệ
thống bao gồm khả năng phân biệt cái quan trọng với cái không.

## 1.10. Phân loại hệ thống theo nguồn gốc

### 1.10.1. Hệ thống tự nhiên (natural systems)

Hệ thống tự nhiên hình thành không do con người thiết kế:

- Hệ sinh thái (rừng, đại dương).
- Cơ thể sinh vật.
- Hệ mặt trời.
- Khí hậu.

Đặc điểm: phức tạp, tự điều chỉnh, tiến hóa chậm, không có "mục tiêu" do
con người đặt ra. Kiến trúc sư có thể học từ chúng về tính bền vững, khả
năng thích nghi, và cân bằng.

### 1.10.2. Hệ thống nhân tạo (designed systems)

Hệ thống do con người tạo ra để đạt mục tiêu:

- Máy móc, thiết bị.
- Phần mềm.
- Công trình xây dựng.
- Quy trình sản xuất.

Đặc điểm: có mục tiêu rõ ràng, có người thiết kế, có thể phân rã và tối ưu.
Đây là đối tượng chính của kiến trúc hệ thống.

### 1.10.3. Hệ thống xã hội - kỹ thuật (socio-technical systems)

Hệ thống kết hợp con người, công nghệ, quy trình, và thể chế:

- Hệ thống giao thông.
- Hệ thống y tế.
- Hệ thống giáo dục.
- Doanh nghiệp.

Đặc điểm: có yếu tố con người không thể dự đoán hoàn toàn; hành vi xuất hiện
phức tạp; khó kiểm thử; cần quan tâm đến văn hóa và thể chế.

### 1.10.4. Hệ thống hỗn hợp (hybrid systems)

Nhiều hệ thống hiện đại là hỗn hợp: ví dụ xe tự lái kết hợp cơ khí, điện tử,
phần mềm, và con người. Việc phân loại chỉ là tương đối và phục vụ mục đích
phân tích.

### 1.10.5. Bảng so sánh

| Tiêu chí | Tự nhiên | Nhân tạo | Xã hội - kỹ thuật |
|----------|----------|----------|-------------------|
| Nguồn gốc | Tiến hóa | Thiết kế | Thiết kế + tiến hóa |
| Mục tiêu | Không rõ | Rõ | Đa mục tiêu, mâu thuẫn |
| Phân rã | Khó | Dễ | Khó |
| Kiểm thử | Không | Có | Rất khó |
| Thay đổi | Chậm | Có kiểm soát | Phức tạp |

## 1.11. Vòng đời hệ thống

### 1.11.1. Các giai đoạn

Mọi hệ thống đều có vòng đời:

```
Ý tưởng --> Thiết kế --> Chế tạo --> Vận hành --> Bảo trì --> Thải hồi
```

### 1.11.2. Hệ quả cho tư duy hệ thống

- Quyết định ở giai đoạn đầu ảnh hưởng đến toàn bộ vòng đời.
- Chi phí vận hành và bảo trì thường lớn hơn chi phí phát triển.
- Khả năng thải hồi và tái chế cần được tính đến từ đầu.
- Hệ thống có thể tiến hóa qua nhiều phiên bản.

### 1.11.3. Tư duy vòng đời

Kiến trúc sư cần hỏi:

- Hệ thống sẽ được vận hành như thế nào?
- Ai bảo trì, và với chi phí nào?
- Hệ thống sẽ kết thúc vòng đời ra sao?
- Có thể tái sử dụng hoặc tái chế phần nào?

## 1.12. Mô hình tư duy (mental models)

### 1.12.1. Khái niệm

Mô hình tư duy là cách ta hiểu thế giới trong đầu. Mỗi người có mô hình
riêng, thường không đầy đủ và có thể sai.

### 1.12.2. Vai trò trong kiến trúc

- Mô hình tư duy định hình cách ta nhìn vấn đề.
- Mô hình khác nhau dẫn đến giải pháp khác nhau.
- Xung đột thường do mô hình tư duy khác nhau, không chỉ do dữ kiện.

### 1.12.3. Cải thiện mô hình tư duy

- Học từ nhiều lĩnh vực.
- Đặt câu hỏi với giả định.
- So sánh mô hình với thực tế.
- Chia sẻ mô hình với người khác.
- Cập nhật khi có thông tin mới.

### 1.12.4. Ví dụ

Một kỹ sư cơ khí có thể nhìn tủ lạnh như "hệ thống nhiệt"; một kỹ sư phần
mềm có thể nhìn nó như "hệ thống điều khiển"; một nhà kinh tế có thể nhìn
nó như "sản phẩm tiêu dùng". Mỗi mô hình đều đúng một phần; kiến trúc sư cần
tích hợp chúng.

## 1.13. Vòng phản hồi và hành vi động

### 1.13.1. Vòng phản hồi âm (negative feedback)

Vòng phản hồi âm ổn định hệ thống:

```
Sai lệch --> Hành động --> Giảm sai lệch
```

Ví dụ: thermostat, bộ điều tốc, cân bằng nội môi.

### 1.13.2. Vòng phản hồi dương (positive feedback)

Vòng phản hồi dương khuếch đại sai lệch:

```
Sai lệch --> Hành động --> Tăng sai lệch
```

Ví dụ: phản ứng dây chuyền, bong bóng tài chính, tăng trưởng theo cấp số
nhân.

### 1.13.3. Độ trễ (delay)

Độ trễ trong vòng phản hồi có thể gây dao động hoặc mất ổn định. Ví dụ: điều
khiển nhiệt có độ trễ có thể làm nhiệt độ dao động quanh ngưỡng.

### 1.13.4. Hệ quả cho kiến trúc

- Cần hiểu vòng phản hồi để dự đoán hành vi.
- Cần thiết kế bộ điều khiển phù hợp.
- Cần kiểm thử trong điều kiện động.
- Cần giám sát trong vận hành.

## 1.14. Tư duy hệ thống trong bối cảnh tổ chức

### 1.14.1. Tổ chức như hệ thống

Tổ chức có phần tử (con người, phòng ban), tương tác (quy trình, giao tiếp),
và chức năng (tạo giá trị). Nhiều vấn đề tổ chức là vấn đề hệ thống, không
phải vấn đề cá nhân.

### 1.14.2. Ví dụ

- Phòng ban tối ưu cục bộ gây tắc nghẽn toàn cục.
- Chỉ số đo lường không nhất quán tạo ra hành vi không mong muốn.
- Giao diện giữa các phòng ban không rõ gây hiểu nhầm.

### 1.14.3. Can thiệp hệ thống

Thay vì đổ lỗi cá nhân, hãy thay đổi:

- Cấu trúc tổ chức.
- Quy trình.
- Chỉ số đo lường.
- Giao diện giữa các bộ phận.

### 1.14.4. Bài học

Tư duy hệ thống giúp tránh "ngụy biện cá nhân hóa": giải thích vấn đề hệ
thống bằng lỗi cá nhân.

## 1.15. Các nguyên tắc tư duy hệ thống

### 1.15.1. Nguyên tắc 1: Nhìn tổng thể trước

Bắt đầu từ bức tranh lớn, sau đó đi vào chi tiết. Không để chi tiết che
khuất tổng thể.

### 1.15.2. Nguyên tắc 2: Tìm tương tác

Chú ý đến quan hệ giữa các phần tử, không chỉ các phần tử.

### 1.15.3. Nguyên tắc 3: Nhận diện vòng phản hồi

Tìm các vòng lặp, độ trễ, và phi tuyến.

### 1.15.4. Nguyên tắc 4: Xác định biên giới

Biết cái gì nằm trong và ngoài hệ thống.

### 1.15.5. Nguyên tắc 5: Chấp nhận nhiều góc nhìn

Không có một góc nhìn duy nhất đúng. Tích hợp nhiều góc nhìn.

### 1.15.6. Nguyên tắc 6: Tìm hành vi xuất hiện

Dự đoán và kiểm tra hành vi toàn cục.

### 1.15.7. Nguyên tắc 7: Học từ thất bại

Phân tích thất bại để hiểu hệ thống và cải tiến.

## 1.16. Bài tập tư duy

1. Chọn một vật dụng trong nhà. Liệt kê phần tử, tương tác, chức năng. Xác
   định ít nhất một hành vi xuất hiện mong muốn và một hành vi xuất hiện
   không mong muốn.
2. Vẽ sơ đồ bối cảnh cho một ứng dụng điện thoại bạn dùng hằng ngày. Xác
   định các tác nhân bên ngoài và dòng vào/ra.
3. Áp dụng thang cấp độ ý định cho một sản phẩm bạn đang phát triển. Ghi
   lại mục tiêu xã hội, mục tiêu kinh doanh, mục tiêu người dùng, yêu cầu,
   chức năng.
4. Tìm một ví dụ thất bại nổi tiếng (cầu, phần mềm, sản phẩm). Phân tích
   hành vi xuất hiện không mong muốn nào đã gây ra thất bại.

## 1.17. Tóm tắt chương

- Hệ thống = phần tử + tương tác + chức năng; chức năng toàn thể vượt tổng
  các phần.
- Hành vi xuất hiện là dấu hiệu của hệ thống thực; nó có thể mong muốn hoặc
  không mong muốn.
- Kiến trúc sư cần holism, balance, focus.
- Thang cấp độ ý định giúp nối mục tiêu trừu tượng với thiết kế cụ thể.
- Tư duy hệ thống là nền tảng cho mọi chương tiếp theo: định nghĩa kiến trúc,
  quản lý độ phức tạp, giải quyết mơ hồ, và sáng tạo có định hướng.
