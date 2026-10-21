# MBA-DOCS — Bộ tài liệu học MBA hoàn chỉnh (tiếng Việt)

Bộ tài liệu được xây dựng dựa trên chương trình MBA chuẩn của các trường danh tiếng
(Wharton, Columbia, Kellogg, Olin/WashU, USF, SCU...) với 16 học phần:
**12 môn cốt lõi + 4 chuyên đề chọn**.

Mỗi học phần gồm 3 tài liệu:

| File | Nội dung |
|------|----------|
| `bai-hoc.md` | Bài học đầy đủ: kiến thức **cơ bản → nâng cao → thực tế**, công cụ, case |
| `cau-hoi.md` | Câu hỏi sau mỗi bài: trắc nghiệm + tự luận + tình huống (kèm đáp án) |
| `slides.md` | Slide bài giảng tiếng Việt (định dạng Marp, `---` phân tách trang) |

## Cấu trúc thư mục

```
mba-docs/
├── README.md                          ← file này
├── 00-tong-quan/
│   └── chuong-trinh-mba-hoan-chinh.md ← lộ trình, tín chỉ, mẹo học
├── 01-ke-toan-quan-tri/               ← Managerial Accounting
├── 02-tai-chinh-doanh-nghiep/         ← Corporate Finance
├── 03-kinh-te-quan-tri/               ← Economics for Managers (vi mô + vĩ mô)
├── 04-quan-tri-marketing/             ← Marketing Management
├── 05-hanh-vi-to-chuc/                ← Org. Behavior & Management
├── 06-chien-luoc-kinh-doanh/          ← Strategic Management (Capstone)
├── 07-quan-tri-van-hanh/              ← Operations Management
├── 08-phan-tich-kinh-doanh/           ← Business Analytics & Statistics
├── 09-quan-tri-nhan-luc/              ← Human Resource Management
├── 10-lanh-dao-lam-viec-nhom/         ← Leadership & Teamwork
├── 11-phap-luat-dao-duc-kinh-doanh/   ← Business Law & Ethics
├── 12-truyen-thong-quan-tri/          ← Management Communication
├── 13-khoi-nghiep/                    ← Entrepreneurship (chuyên đề)
├── 14-quan-tri-chuoi-cung-ung/        ← Supply Chain Management (chuyên đề)
├── 15-dau-tu-quan-tri-danh-muc/       ← Investments & Portfolio (chuyên đề)
└── 16-chuyen-doi-so/                  ← Digital Transformation (chuyên đề)
```

## Hướng dẫn học

1. Đọc `00-tong-quan` để nắm lộ trình và thứ tự học gợi ý.
2. Với mỗi môn: đọc `bai-hoc.md` theo 3 tầng **Cơ bản → Nâng cao → Thực tế**.
3. Làm `cau-hoi.md` sau mỗi bài để tự kiểm tra (đáp án ở cuối file).
4. Dùng `slides.md` để ôn nhanh hoặc thuyết trình — xem Marp (`npx @marp-team/marp-cli`)
   hoặc mở trực tiếp trong VS Code với extension Marp.

## Ghi chú

- Slide trong bộ tài liệu được **soạn mới bằng tiếng Việt**, tổng hợp kiến thức chuẩn
  của các chương trình MBA (không sao chép slide gốc của trường).
- Kiến thức "thực tế" gắn với bối cảnh doanh nghiệp Việt Nam (SMB, startup, tập đoàn)
  và các case quốc tế phổ biến.
