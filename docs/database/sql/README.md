# SQL — Tài liệu nền tảng và thực chiến

> Bộ tài liệu SQL tổng quát cho backend: từ mô hình quan hệ và cú pháp chuẩn ANSI/ISO đến
> các mẫu truy vấn thực chiến trên PostgreSQL, MySQL, SQL Server, SQLite. Ví dụ xuyên suốt
> dùng database thương mại điện tử trung lập: `customers`, `products`, `orders`,
> `order_items`, `payments`, `shipments`.
>
> Quy ước dữ liệu: ID dạng UUID/ULID, tiền lưu **integer minor units** (VND không có phần
> lẻ thì minor unit = đồng; USD/EUR dùng cent), thời gian `timestamptz` UTC.

> 📌 Bộ này **độc lập với dialect** và không lặp lại hai tài liệu PostgreSQL chuyên sâu.
> Khi cần đào sâu PostgreSQL, đọc
> [`../postgres-sql/postgresql-basics.md`](../postgres-sql/postgresql-basics.md) và
> [`../postgres-sql/postgresql-advanced.md`](../postgres-sql/postgresql-advanced.md).

---

## Mục lục

1. [SQL là gì?](#1-sql-là-gì)
2. [Vì sao backend cần SQL?](#2-vì-sao-backend-cần-sql)
3. [Bản đồ tài liệu](#3-bản-đồ-tài-liệu)
4. [Lộ trình học 4–6 tuần](#4-lộ-trình-học-46-tuần)
5. [SQL chuẩn và dialect](#5-sql-chuẩn-và-dialect)
6. [Cách chạy ví dụ](#6-cách-chạy-ví-dụ)
7. [Quy ước tài liệu](#7-quy-ước-tài-liệu)
8. [Checklist năng lực](#8-checklist-năng-lực)
9. [Tài liệu tham khảo](#9-tài-liệu-tham-khảo)

---

## 1. SQL là gì?

**SQL** (Structured Query Language) là ngôn ngữ **khai báo** để định nghĩa, truy vấn và
điều khiển dữ liệu quan hệ. Bạn mô tả kết quả mong muốn; DBMS tự chọn cách thực thi —
index nào, join theo thứ tự nào, có song song hoá không. Không DBMS nào implement 100%
chuẩn: mỗi hệ có **dialect**, và kỹ năng thực tế là biết phần nào portable.

| Mốc | Sự kiện |
|---|---|
| 1970–1974 | Codd công bố mô hình quan hệ; IBM System R và SEQUEL |
| 1986–1987 | ANSI X3.135 / ISO 9075 — chuẩn SQL đầu tiên |
| 1992 | SQL-92: nền tảng cú pháp hiện đại |
| 1999–2003 | CTE, trigger, boolean; window function, `MERGE` |
| 2016–2023 | JSON, row pattern recognition, graph query |

### 1.1 Năm nhóm lệnh

| Nhóm | Lệnh tiêu biểu | Mục đích |
|---|---|---|
| DDL | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` | Định nghĩa cấu trúc |
| DML | `INSERT`, `UPDATE`, `DELETE`, `MERGE` | Thay đổi dữ liệu |
| DQL | `SELECT` | Đọc dữ liệu |
| DCL | `GRANT`, `REVOKE` | Phân quyền |
| TCL | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` | Ranh giới giao dịch |

### 1.2 SQL khai báo, không phải thủ tục

Điều quan trọng nhất khi học SQL là tách **ý định** khỏi **cách thực thi**. Câu SQL dưới
đây không nói “đọc từng dòng”; nó nói “trả các đơn đã thanh toán, mới nhất trước”:

```sql
SELECT id, customer_id, total_minor, placed_at
FROM orders
WHERE status = 'paid'
ORDER BY placed_at DESC, id DESC
LIMIT 20;
```

DBMS có thể dùng index, bitmap scan, parallel scan hoặc sort tuỳ dữ liệu và thống kê.
Vì vậy tối ưu SQL là tối ưu **thông tin planner có** (index, statistic, kiểu dữ liệu),
không phải “thêm gợi ý” mù quáng.

---

## 2. Vì sao backend cần SQL?

| Tình huống | Vì sao cần SQL |
|---|---|
| ORM sinh query sai | Đọc `EXPLAIN` mới biết vì sao chậm |
| Báo cáo, thống kê | Window function, `GROUPING SETS` vượt khả năng ORM |
| Sửa dữ liệu khẩn cấp | `UPDATE` phải chính xác, có backup |
| Migration bảng lớn | Hiểu lock, rewrite, thời gian chạy |
| Debug production | Log chậm, deadlock, replication lag đều là câu hỏi SQL |
| Bảo mật | SQL injection, RLS, least privilege |
| API sinh từ schema | Hiểu SQL = hiểu hợp đồng dữ liệu của API |

> 💡 **ORM cho CRUD, SQL cho logic.** Đừng nhồi phân tích phức tạp vào ORM, cũng đừng
> viết raw SQL cho mọi `INSERT` đơn giản.

Với một hệ thương mại điện tử, câu hỏi thật đều là SQL: 20 đơn mới nhất, doanh thu theo
ngày, tồn kho theo sản phẩm, đối soát thanh toán, chống tạo trùng đơn khi client retry.

### 2.1 SQL trong vòng đời request

Một request “xem chi tiết đơn hàng” thường chạm nhiều tầng dữ liệu:

```text
HTTP GET /orders/{id}
  → xác thực + phân quyền (RLS hoặc WHERE customer_id = $1)
  → SELECT order + JOIN order_items + JOIN payments + JOIN shipments
  → serialize JSON
  → cache/ETag (tuỳ thiết kế)
```

Nếu tầng ứng dụng chỉ coi database là “hộp đen”, các lỗi phổ biến sẽ khó thấy: N+1,
thiếu index cho `customer_id`, `SELECT *` kéo theo cột JSON lớn, hoặc transaction giữ
lock quá lâu.

---

## 3. Bản đồ tài liệu

| File | Nội dung | Đọc khi |
|---|---|---|
| [`sql-fundamentals.md`](./sql-fundamentals.md) | Mô hình quan hệ, kiểu dữ liệu, DDL/DML, JOIN, aggregate, transaction, index, schema orders | Mới học hoặc ôn nền |
| [`sql-advanced.md`](./sql-advanced.md) | Window, CTE đệ quy, JSONB, FTS, planner, lock, partition, migration | Đã viết query, cần tối ưu |
| [`sql-dialects-and-patterns.md`](./sql-dialects-and-patterns.md) | So sánh 4 dialect, 25 tác vụ tương đương, 17 pattern, cheatsheet | Làm việc đa database |
| `README.md` | Định hướng, lộ trình, chạy ví dụ, checklist | Bắt đầu |

| Tài liệu PostgreSQL | Nội dung | Quy mô |
|---|---|---|
| [`../postgres-sql/postgresql-basics.md`](../postgres-sql/postgresql-basics.md) | Kiến trúc, kiểu dữ liệu, `psql`, schema, bài tập | 1.500+ dòng |
| [`../postgres-sql/postgresql-advanced.md`](../postgres-sql/postgresql-advanced.md) | `EXPLAIN`, index, MVCC, lock, partition, JSONB, FTS, RLS, HA, migration | 3.000+ dòng |

**Chọn theo nhu cầu:** JOIN → fundamentals §8 · query chậm → advanced §11 rồi
postgresql-advanced §1–3 · MySQL → dialects §1–2 · top-N → dialects §3.1 · zero-downtime
→ advanced §20 · phỏng vấn → fundamentals §18 + advanced §24.

---

## 4. Lộ trình học 4–6 tuần

| Tuần | Chủ đề | Đầu ra |
|---|---|---|
| 1 | Mô hình quan hệ, kiểu dữ liệu, DDL | Tự tạo schema orders, vẽ ERD, thêm constraint |
| 2 | DML, `SELECT`, NULL, toán tử | 20 query lọc/sắp xếp/phân trang trên seed data |
| 3 | JOIN, aggregate, subquery, set ops | 10 báo cáo doanh thu, top sản phẩm, đơn theo ngày |
| 4 | Transaction, index, view, bảo mật | Chứng minh index nhanh hơn bằng `EXPLAIN` |
| 5 | Window, CTE, UPSERT, JSON | Top-N per group, running total, dedupe |
| 6 | Planner, lock, partition, migration | Case study e-commerce + một migration expand/contract |

**Ba lộ trình:** **A — Backend mới (6 tuần):** tuần 1–4 bắt buộc, tuần 5–6 chọn lọc, bỏ
partition/HA. **B — Biết ORM (3 tuần):** fundamentals §1–7 đọc nhanh, tập trung §8–11 và
advanced trừ §14–15, làm hết pattern. **C — Phỏng vấn (2 tuần):** fundamentals §6–11,
advanced §1–2, §11–13, cheatsheet; luyện nói lý do chọn JOIN/EXISTS/window.

> ⚠️ Đừng học thuộc cú pháp. Học **thứ tự thực thi logic** và **cách DB đọc dữ liệu** —
> hai thứ đó giải thích phần lớn lỗi SQL.

### 4.1 Cách luyện tập hiệu quả

1. Viết query trước, tối ưu sau. Lưu lại query gốc và plan gốc để so sánh.
2. Luôn seed dữ liệu đủ lớn (≥ 100.000 dòng) trước khi kết luận về hiệu năng.
3. Với mỗi bài, trả lời ba câu: kết quả đúng chưa, plan có hợp lý không, có edge case nào?
4. Ghi lại anti-pattern đã gặp vào checklist cá nhân.

---

## 5. SQL chuẩn và dialect

**Portable:** `SELECT ... WHERE ... GROUP BY ... HAVING ... ORDER BY`, các loại JOIN,
`UNION`/`INTERSECT`/`EXCEPT`, `CASE`/`COALESCE`/`CAST`, subquery, window cơ bản,
`BEGIN`/`COMMIT`/`ROLLBACK`, DDL với PK/FK/UNIQUE/CHECK. **Dễ vỡ khi đổi hệ:**

| Chủ đề | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Quote identifier | `"col"` | `` `col` `` | `[col]` | `"col"` |
| Pagination | `LIMIT n OFFSET m` | `LIMIT m, n` | `OFFSET ... FETCH NEXT` | `LIMIT n OFFSET m` |
| Auto increment | `GENERATED AS IDENTITY` | `AUTO_INCREMENT` | `IDENTITY(1,1)` | `INTEGER PRIMARY KEY` |
| Upsert | `ON CONFLICT` | `ON DUPLICATE KEY` | `MERGE` | `ON CONFLICT` |
| Trả dòng đã ghi | `RETURNING` | `LAST_INSERT_ID()` + `SELECT` | `OUTPUT` | `RETURNING` (3.35+) |
| Boolean | `boolean` | `TINYINT(1)` | `bit` | `INTEGER 0/1` |
| JSON | `jsonb` | `JSON` | `nvarchar` + `ISJSON` | `TEXT` + JSON1 |
| Full-text | `tsvector`/GIN | `FULLTEXT` | Full-Text Index | FTS5 |

Chi tiết ở [`sql-dialects-and-patterns.md`](./sql-dialects-and-patterns.md) §1.
**Nguyên tắc portable vừa đủ:** viết chuẩn trước, extension khi có lý do đo được; cô lập
phần đặc thù vào adapter; `snake_case`, tránh từ khoá; không dựa vào thứ tự dòng khi
thiếu `ORDER BY`; với `NULL` luôn nghĩ "unknown".

### 5.1 Chọn kiểu ID: UUID hay ULID?

| Tiêu chí | UUIDv4 | UUIDv7 | ULID |
|---|---|---|---|
| Sinh trước khi insert | Có | Có | Có |
| Sắp xếp theo thời gian | Không | Có | Có |
| Kích thước nhị phân | 16 byte | 16 byte | 16 byte |
| Dạng text | 36 ký tự | 36 ký tự | 26 ký tự Crockford |
| Index locality | Kém (random) | Tốt | Tốt |

Với PostgreSQL 18+, `uuidv7()` có sẵn; trước đó dùng extension hoặc sinh ở app. Nếu ID
chỉ dùng nội bộ và cần index nhỏ nhất, `bigint identity` vẫn là lựa chọn tốt — nhưng
tài liệu này dùng UUID/ULID để ví dụ phân tán và không đoán được.

---

## 6. Cách chạy ví dụ

### 6.1 Database mẫu

Schema chuẩn hoá dùng trong toàn bộ ví dụ:

```text
customers 1──N orders 1──N order_items N──1 products
                  │
                  ├──1──N payments
                  └──1──N shipments
```

DDL đầy đủ ở [`sql-fundamentals.md`](./sql-fundamentals.md) §17. Các cột tiền có hậu tố
`_minor`; thời gian có hậu tố `_at` và luôn là UTC.

### 6.2 PostgreSQL

```bash
docker run --name sql-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=shop \
  -p 5432:5432 -d postgres:17
psql "postgresql://postgres:postgres@localhost:5432/shop"
```

Trong `psql`: `\i schema.sql`, `\dt`, `\d orders`, `\x auto`, `\timing on`.

### 6.3 MySQL

```bash
docker run --name sql-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=shop \
  -p 3306:3306 -d mysql:8.4
docker exec -it sql-mysql mysql -uroot -proot shop
```

Dùng `utf8mb4`; bật `STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY`.

### 6.4 SQL Server

```bash
docker run --name sql-mssql -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Str0ng!Passw0rd" \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
docker exec -it sql-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Str0ng!Passw0rd' -C -Q "SELECT @@VERSION"
```

### 6.5 SQLite

```bash
sqlite3 shop.db
.read schema.sql
.headers on
.mode box
```

> 💡 Chạy `ANALYZE` sau khi seed để planner có statistic. Kết luận hiệu năng trên bảng
> 100 dòng gần như luôn sai.

---

## 7. Quy ước tài liệu

1. **Dialect mặc định:** PostgreSQL 16+; khác sẽ ghi `-- MySQL`, `-- SQL Server`,
   `-- SQLite` ngay trên block.
2. **Version:** ghi chú tính năng mới (`MERGE` PG 15+, `RETURNING` SQLite 3.35+,
   `ON CONFLICT` SQLite 3.24+).
3. **Đặt tên:** `snake_case`, bảng số nhiều (`orders`), constraint tiền tố
   `pk_/uq_/ck_/fk_/ix_`.
4. **NULL:** viết hoa, luôn `IS NULL`, không bao giờ `= NULL`.
5. **Thời gian:** UTC; `timestamptz` (PG), `DATETIME`/`datetime2` UTC (MySQL/SQL Server).
6. **Tiền:** `integer`/`bigint` **minor units** (`total_minor`), không `float`; khoá
   chính UUID/ULID hoặc `bigint` identity khi chỉ cần nội bộ.
7. **Ví dụ:** ❌ sai, ✅ đúng; anti-pattern luôn kèm cách sửa. Link chéo tương đối, nguồn
   ngoài để cuối file.

### 7.1 Vì sao tiền dùng integer minor units?

`numeric` chính xác nhưng xử lý chậm hơn và dễ nhầm scale giữa các dịch vụ. Integer
minor units loại bỏ hoàn toàn sai số thập phân, dễ trao đổi qua JSON, và so khớp chính
xác khi đối soát:

```sql
-- ✅ 1999 = 19,99 USD; 250000 = 250.000 VND
SELECT 1999::bigint AS amount_minor, 'USD'::char(3) AS currency;
```

Quy ước bắt buộc: mọi cột tiền phải đi kèm `currency`; không cộng hai đơn vị khác nhau.

---

## 8. Checklist năng lực

Đánh dấu khi **tự làm được không tra cứu**. Mục tiêu là biết mình đang ở đâu.

**Cơ bản — phải có**

- [ ] Giải thích bảng, hàng, cột, PK, FK, index; `CREATE TABLE` với PK, FK, UNIQUE,
      CHECK, NOT NULL.
- [ ] `INSERT` một/nhiều dòng, `INSERT ... SELECT`; `UPDATE`/`DELETE` có `WHERE` và kiểm
      tra số dòng ảnh hưởng.
- [ ] `SELECT` với `WHERE`, `ORDER BY`, `LIMIT/OFFSET`, alias; `IS NULL` vs `= NULL`,
      `NULL` trong `NOT IN`.
- [ ] `INNER JOIN`, `LEFT JOIN`; phân biệt `ON` và `WHERE`; subquery `IN`, `EXISTS`.
- [ ] `COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`; `UNION ALL` vs `UNION`.
- [ ] `CASE`, `COALESCE`, `CAST`; `BEGIN`/`COMMIT`/`ROLLBACK`.

**Trung cấp — nên có**

- [ ] Đọc plan đơn giản: scan type, rows ước lượng, loop; biết khi nào index bị bỏ qua.
- [ ] Composite index đúng thứ tự; hiểu selectivity.
- [ ] Window function: xếp hạng, running total, LAG/LEAD; CTE và CTE đệ quy.
- [ ] UPSERT an toàn, hiểu race condition.
- [ ] Chuẩn hoá 3NF, biết khi nào denormalize.
- [ ] Isolation level, anomaly; migration nullable → backfill → constraint.
- [ ] Keyset pagination thay cho `OFFSET` sâu; nhận diện N+1.

**Nâng cao — dấu hiệu senior**

- [ ] Tối ưu query 2s → 50ms và giải thích được.
- [ ] Partition bảng log/time-series; chẩn đoán deadlock, lock wait, replication lag.
- [ ] MERGE/upsert idempotent cho job import.
- [ ] `FOR UPDATE SKIP LOCKED` cho queue; RLS/role cho multi-tenant.
- [ ] Migration zero-downtime có rollback.
- [ ] Chọn JSONB vs bảng phụ vs cột mới có lý do.
- [ ] Thiết kế backup/restore có RPO/RTO và đã test restore.

> 💡 Nếu phần cơ bản còn trống, đừng nhảy sang window function. JOIN + NULL + index giải
> quyết phần lớn công việc hằng ngày.

---

## 9. Tài liệu tham khảo

**Chuẩn & lý thuyết:** ISO/IEC 9075:2023 · C. J. Date, *SQL and Relational Theory* ·
R. Ramakrishnan & J. Gehrke, *Database Management Systems*.

**Thực hành:** Markus Winand, *SQL Performance Explained* và
<https://use-the-index-luke.com/> · Bill Karwin, *SQL Antipatterns* · Itzik Ben-Gan,
*T-SQL Window Functions* · Joe Celko, *SQL for Smarties*.

**Chính thức:** [PostgreSQL](https://www.postgresql.org/docs/current/) ·
[MySQL](https://dev.mysql.com/doc/refman/8.4/en/) ·
[SQL Server](https://learn.microsoft.com/sql/t-sql/) ·
[SQLite](https://www.sqlite.org/lang.html) · [Modern SQL](https://modern-sql.com/).

**Nội bộ:** [fundamentals](./sql-fundamentals.md) · [advanced](./sql-advanced.md) ·
[dialects](./sql-dialects-and-patterns.md) ·
[postgresql-basics](../postgres-sql/postgresql-basics.md) ·
[postgresql-advanced](../postgres-sql/postgresql-advanced.md).
