# Clean Code và Thiết kế Phần mềm

Bộ tài liệu biên soạn (tiếng Việt, có ví dụ code Java) từ bài giảng **MIT 6.170 Laboratory in Software Engineering** — Fall 2005, GS. Daniel Jackson & GS. Rob Miller — trích xuất từ 21 file text bài giảng tại thư mục `_raw-text/`.

## Mục lục

| # | Tài liệu | Nội dung chính | Nguồn |
|---|---|---|---|
| 01 | [Tổng quan thiết kế phần mềm](01-tong-quan-thiet-ke-phan-mem.md) | Mục tiêu môn học, tư duy thiết kế, quy trình phát triển | Lec 1–2 |
| 02 | [Đặc tả và hợp đồng](02-dac-ta-va-hop-dong.md) | Đặc tả, hợp đồng tiền/postcondition, hợp đồng mẫu | Lec 4 |
| 03 | [Kiểm thử](03-kiem-thu.md) | Kiểm thử đơn vị, TDD, kiểm thử hồi quy, techniques | Lec 5 |
| 04 | [Kiểu dữ liệu trừu tượng (ADT)](04-kieu-du-lieu-truu-tuong-ADT.md) | List spec, representation independence, RI/AF, checkRep, rep exposure, SeasonSet, queue bất biến | Lec 7–9 |
| 05 | [Thiết kế và phụ thuộc](05-thiet-ke-va-phu-thuoc.md) | MDD, instrument, subtypes, Square/Rectangle, InstrumentedHashSet, interface vs abstract class | Lec 10, 14–15 |
| 06 | [Ngoại lệ và bằng nhau](06-ngoai-le-va-bang-nhau.md) | Defensive programming, assertion, checked/unchecked, Object contract, Duration symmetry/transitivity, hash tables | Lec 11–12 |
| 07 | [Mẫu thiết kế (Design Patterns)](07-mau-thiet-ke-design-patterns.md) | Factory, observer, blackboard, adapter/decorator/proxy, kế thừa vs composition | Lec 18 |
| 08 | [Khả dụng (Usability)](08-kha-dung-usability.md) | Hall of Shame, spiral model, MHP model, Fitts's law, trí nhớ 7±2, 10 heuristic Nielsen, paper prototype, user testing | Lec 16–17 |
| 09 | [Kinh nghiệm dự án thiết kế](09-kinh-nghiem-du-an-thiet-ke.md) | Space Elevator Simulator (MDD, Observer, Visitor, Java 3D), quản lý nhóm nhỏ (4 vai trò họp, versioning) | Lec 19–21 |

## Cách dùng

- Đọc theo thứ tự 01 → 09 để nắm trọn mạch môn học.
- Mỗi tài liệu có mục lục liên kết, bảng biểu, ví dụ code Java, bảng thuật ngữ Anh–Việt và bài tập suy nghĩ.
- Dòng nguồn ở cuối mỗi file trỏ về bài giảng gốc để tra cứu.

## Ghi chú kỹ thuật

- Toàn bộ nội dung tiếng Việt; thuật ngữ chuyên ngành giữ dạng Anh trong ngoặc.
- Nguồn là file text trích xuất từ PDF — một số file có lỗi mã hóa đã được xử lý khi biên soạn (xem ghi chú trong các file có liên quan).
