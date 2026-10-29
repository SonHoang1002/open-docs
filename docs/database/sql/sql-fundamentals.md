# SQL — Kiến thức cơ bản

> Tài liệu nền tảng SQL **độc lập với dialect**: mô hình quan hệ, kiểu dữ liệu, DDL/DML,
> JOIN, aggregate, subquery, transaction và index. Ví dụ dùng database wedding, ghi rõ
> khác biệt PostgreSQL / MySQL / SQL Server / SQLite. Mặc định là PostgreSQL 16+ nếu
> không ghi chú.

> 📌 Khi cần đào sâu PostgreSQL (kiến trúc, `psql`, EXPLAIN, MVCC, JSONB, RLS), đọc
> [`../postgresql-basics.md`](../postgresql-basics.md) và
> [`../postgresql-advanced.md`](../postgresql-advanced.md). Tài liệu này không lặp lại.

---
## Mục lục

1. [Cơ sở dữ liệu quan hệ](#1-cơ-sở-dữ-liệu-quan-hệ)
2. [Kiểu dữ liệu chuẩn](#2-kiểu-dữ-liệu-chuẩn)
3. [DDL: định nghĩa cấu trúc](#3-ddl-định-nghĩa-cấu-trúc)
4. [Chuẩn hoá dữ liệu](#4-chuẩn-hoá-dữ-liệu)
5. [DML: thêm, sửa, xoá](#5-dml-thêm-sửa-xoá)
6. [SELECT và thứ tự thực thi logic](#6-select-và-thứ-tự-thực-thi-logic)
7. [Toán tử và NULL](#7-toán-tử-và-null)
8. [JOIN](#8-join)
9. [Aggregate và GROUP BY](#9-aggregate-và-group-by)
10. [Subquery](#10-subquery)
11. [Set operations](#11-set-operations)
12. [CASE, CAST, chuỗi và ngày](#12-case-cast-chuỗi-và-ngày)
13. [View, materialized view, sequence](#13-view-materialized-view-sequence)
14. [Transaction cơ bản](#14-transaction-cơ-bản)
15. [Index cơ bản](#15-index-cơ-bản)
16. [Bảo mật cơ bản](#16-bảo-mật-cơ-bản)
17. [Schema mẫu wedding](#17-schema-mẫu-wedding)
18. [Bài tập](#18-bài-tập)
19. [Anti-patterns cơ bản](#19-anti-patterns-cơ-bản)
20. [Tài liệu tham khảo](#20-tài-liệu-tham-khảo)

---
## 1. Cơ sở dữ liệu quan hệ

Mô hình quan hệ biểu diễn dữ liệu bằng **quan hệ**; người dùng thấy dưới dạng **bảng**:
hàng (tuple/row), cột (attribute/column), kiểu + ràng buộc tạo thành miền giá trị.

Bảng là **tập hợp không có thứ tự**: không có `ORDER BY` thì DBMS trả thứ tự bất kỳ.

```sql
SELECT id FROM messages;                          -- thứ tự không bảo đảm
SELECT id FROM messages ORDER BY created_at, id;  -- ổn định
```

| Khoá | Vai trò | Ví dụ |
|---|---|---|
| Primary key | Định danh duy nhất, không NULL | `messages.id` |
| Surrogate key | Khoá nhân tạo | `id bigint identity` |
| Natural key | Khoá từ dữ liệu thật | `guests.email` |
| Foreign key | Tham chiếu PK bảng khác | `rsvps.guest_id` |
| Composite key | PK nhiều cột | `(wedding_id, guest_id)` |
| Unique key | Không trùng, cho phép NULL | `invitations.code` |

> 💡 Dùng surrogate key cho PK, đặt `UNIQUE` cho natural key. Đổi email/phone không phải
> sửa mọi FK.

| Quan hệ | Biểu diễn | Ví dụ |
|---|---|---|
| 1–1 | FK + `UNIQUE` ở bảng con | `rsvps.guest_id UNIQUE` |
| 1–N | FK ở bảng "nhiều" | `messages.guest_id` |
| N–N | Bảng nối, composite PK | `message_tags(message_id, tag_id)` |

**Schema** là namespace: PostgreSQL có schema trong database (`public`, `search_path`);
MySQL coi schema = database; SQL Server có `dbo`; SQLite chỉ có file database.

**ACID:** Atomicity (tất cả hoặc không), Consistency (ràng buộc luôn đúng), Isolation
(không thấy dở dang), Durability (commit rồi mất điện vẫn còn nhờ WAL/redo log). Càng
isolation cao càng ít concurrency — chi tiết ở [`sql-advanced.md`](./sql-advanced.md) §12.

---
## 2. Kiểu dữ liệu chuẩn

| Nhu cầu | Chuẩn | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|---|
| Số nguyên | `INTEGER` | `integer` | `INT` | `int` | `INTEGER` |
| Số nguyên lớn | `BIGINT` | `bigint` | `BIGINT` | `bigint` | `INTEGER` |
| Thập phân | `NUMERIC(p,s)` | `numeric(12,2)` | `DECIMAL` | `decimal` | `NUMERIC` |
| Chuỗi | `VARCHAR(n)` | `varchar`/`text` | `VARCHAR` | `varchar`/`nvarchar` | `TEXT` |
| Boolean | `BOOLEAN` | `boolean` | `TINYINT(1)` | `bit` | `INTEGER` 0/1 |
| Ngày giờ | `TIMESTAMP` | `timestamptz` | `DATETIME` | `datetime2` | `TEXT` |
| UUID | `UUID` | `uuid` | `CHAR(36)`/`BINARY(16)` | `uniqueidentifier` | `TEXT` |
| JSON | `JSON` | `jsonb` | `JSON` | `nvarchar` + `ISJSON` | `TEXT` + JSON1 |
| Nhị phân | `BLOB` | `bytea` | `BLOB` | `varbinary(max)` | `BLOB` |

```sql
CREATE TABLE gifts (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  amount   numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency char(3) NOT NULL DEFAULT 'VND'
);
```

> ⚠️ `FLOAT`/`DOUBLE` là xấp xỉ nhị phân (`0.1 + 0.2 <> 0.3`). Không dùng cho tiền.

- **Chuỗi:** SQL Server cần `nvarchar` cho tiếng Việt; MySQL dùng `utf8mb4`; PostgreSQL
  `text` và `varchar(n)` hiệu năng tương đương, `varchar(n)` chủ yếu là ràng buộc.
- **Boolean:** MySQL/SQL Server dùng `1/0`; đừng so sánh với `'true'`.
- **Thời gian:** lưu UTC. `timestamptz` (PG) lưu UTC và hiển thị theo session;
  `timestamp` không múi giờ dễ sai. MySQL dùng `UTC_TIMESTAMP(6)`, SQL Server
  `SYSUTCDATETIME()`.
- **UUID:** tốt khi cần sinh ID trước/không đoán được; index lớn hơn số nguyên. UUIDv7
  gần tuần tự hơn.
- **JSON:** payload linh hoạt, ít lọc theo trường con; trường hay lọc thì tách cột thật.

---
## 3. DDL: định nghĩa cấu trúc

```sql
CREATE DATABASE wedding;                    -- PostgreSQL
CREATE SCHEMA IF NOT EXISTS app;
-- MySQL: CHARACTER SET utf8mb4; SQL Server: CREATE DATABASE wedding; USE wedding;
```

SQLite không có `CREATE DATABASE`: `sqlite3 wedding.db`.

```sql
CREATE TABLE guests (
  id         bigint GENERATED ALWAYS AS IDENTITY,
  full_name  varchar(80) NOT NULL,
  phone      varchar(20),
  side       varchar(10) NOT NULL DEFAULT 'both',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_guests PRIMARY KEY (id),
  CONSTRAINT uq_guests_phone UNIQUE (phone),
  CONSTRAINT ck_guests_side CHECK (side IN ('bride','groom','both')),
  CONSTRAINT ck_guests_name CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 80)
);

CREATE TABLE rsvps (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id      bigint NOT NULL,
  will_attend   boolean NOT NULL,
  number_attend smallint NOT NULL DEFAULT 0 CHECK (number_attend BETWEEN 0 AND 10),
  CONSTRAINT fk_rsvps_guest FOREIGN KEY (guest_id)
    REFERENCES guests(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT uq_rsvps_guest UNIQUE (guest_id)
);
```

| Ràng buộc | Bảo đảm | Lưu ý |
|---|---|---|
| `PRIMARY KEY` | Duy nhất + không NULL | Mỗi bảng một PK |
| `FOREIGN KEY` | Giá trị tồn tại ở bảng cha | Có `ON DELETE`/`ON UPDATE` |
| `UNIQUE` | Không trùng | PG/MySQL nhiều NULL; SQL Server một NULL |
| `CHECK` | Biểu thức đúng | MySQL 8.0.16+ mới thực thi đầy đủ |
| `NOT NULL` | Không NULL | Nên đặt cho hầu hết cột |
| `DEFAULT` | Giá trị khi không truyền | `DEFAULT now()` |

Hành vi FK: `RESTRICT`/`NO ACTION` chặn xoá; `CASCADE` xoá bảng con; `SET NULL` giữ bản
ghi và gán NULL. Đặt tên `pk_/uq_/ck_/fk_/ix_` giúp đọc lỗi và viết migration.

> ⚠️ `CASCADE` lan truyền: `DELETE FROM guests` có thể xoá lời chúc, RSVP, thiệp. Đếm
> dòng bằng `SELECT` trước.

```sql
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY   -- PostgreSQL (chuẩn)
id bigint GENERATED BY DEFAULT AS IDENTITY            -- cho phép insert id
id BIGINT AUTO_INCREMENT PRIMARY KEY                  -- MySQL
id bigint IDENTITY(1,1) PRIMARY KEY                   -- SQL Server
id INTEGER PRIMARY KEY AUTOINCREMENT                  -- SQLite

total numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED  -- PG/MySQL/SQLite
total AS (quantity * unit_price) PERSISTED                              -- SQL Server
```

```sql
ALTER TABLE guests ADD COLUMN note text;
ALTER TABLE guests ALTER COLUMN phone SET NOT NULL;      -- PostgreSQL
ALTER TABLE guests ADD CONSTRAINT uq_guests_email UNIQUE (email);
ALTER TABLE guests RENAME COLUMN phone TO phone_number;   -- PostgreSQL

DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS guests CASCADE;      -- PostgreSQL
TRUNCATE TABLE messages;                  -- nhanh, giữ cấu trúc
TRUNCATE TABLE messages RESTART IDENTITY CASCADE;
```

MySQL đổi kiểu bằng `MODIFY COLUMN`; SQL Server dùng `ALTER COLUMN`, đổi tên bằng
`sp_rename`. Trên bảng lớn, `ALTER TABLE` có thể khoá bảng hoặc rewrite — kiểm tra staging
trước. `TRUNCATE` không có `WHERE`, không rollback được ở MySQL; SQLite không có
`TRUNCATE` — dùng `DELETE FROM`.

---
## 4. Chuẩn hoá dữ liệu

Chuẩn hoá giảm **dư thừa** và **dị thường cập nhật**: một thông tin chỉ nằm một nơi.

**1NF — nguyên tử.** Mỗi ô một giá trị, không danh sách (`tags = 'a,b,c'` là sai).

```sql
CREATE TABLE tags (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(30) NOT NULL UNIQUE
);
CREATE TABLE message_tags (
  message_id bigint NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  tag_id     bigint NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (message_id, tag_id)
);
```

**2NF — phụ thuộc đầy đủ vào khoá.** Với PK composite, cột không được phụ thuộc một phần
khoá. `guest_name` không thuộc `(wedding_id, guest_id)`; đặt ở `guests`.

**3NF — không phụ thuộc bắc cầu.** Cột không phụ thuộc cột không phải khoá (ví dụ
`postal_code → city`). **BCNF:** mọi determinant là superkey; 3NF đủ cho hầu hết ứng
dụng, BCNF quan trọng khi có nhiều khoá ứng viên chồng chéo.

### 4.1 Denormalization có chủ đích

Chỉ denormalize khi: (1) đã đo được bottleneck, (2) có cơ chế đồng bộ (trigger, job, cùng
transaction), (3) chấp nhận độ trễ. Ví dụ hợp lý: `rsvp_count` trên `weddings`, cập nhật
cùng transaction với `rsvps`. Không hợp lý: copy `sender_name` khắp nơi.

### 4.2 ERD

```
weddings 1──N invitations N──1 guests 1──1 rsvps
   1
   └──N messages N──1 guests
messages N──N tags (qua message_tags)
```

Quy ước: hình chữ nhật = bảng, đường nối = quan hệ `1—N`, ghi rõ PK/FK. Công cụ:
dbdiagram.io, drawSQL, Mermaid.

---
## 5. DML: thêm, sửa, xoá

```sql
INSERT INTO messages (sender_name, content, will_attend, guest_of, number_attend)
VALUES ('Nguyễn An', 'Chúc hai bạn trăm năm hạnh phúc!', TRUE, 'Cô dâu', 2);

INSERT INTO messages (sender_name, content, will_attend, guest_of, number_attend)
VALUES ('Trần Bình', 'Chúc mừng hạnh phúc!', TRUE, 'Chú rể', 1),
       ('Lê Chi', 'Tiếc quá mình không đến được.', FALSE, 'Bạn thân', 0);

INSERT INTO messages_archive (id, sender_name, content, created_at)
SELECT id, sender_name, content, created_at FROM messages
WHERE created_at < '2025-01-01';
```

Luôn liệt kê cột: `INSERT INTO t VALUES (...)` phụ thuộc thứ tự và vỡ khi thêm cột. Batch
500–1000 dòng; hàng triệu dòng dùng `COPY` (PG), `LOAD DATA` (MySQL), `BULK INSERT`
(SQL Server).

```sql
UPDATE messages SET will_attend = TRUE, number_attend = 2 WHERE id = 42;

UPDATE messages m SET guest_of = g.side              -- PostgreSQL
FROM guests g WHERE m.guest_id = g.id AND m.guest_of IS NULL;

UPDATE messages m JOIN guests g ON g.id = m.guest_id  -- MySQL
SET m.guest_of = g.side WHERE m.guest_of IS NULL;

UPDATE m SET m.guest_of = g.side                      -- SQL Server
FROM messages AS m JOIN guests AS g ON g.id = m.guest_id
WHERE m.guest_of IS NULL;

DELETE FROM messages
WHERE created_at < '2025-01-01' AND will_attend = FALSE;

DELETE FROM messages m USING guests g                 -- PostgreSQL
WHERE m.guest_id = g.id AND g.side = 'bride';
```

SQLite hỗ trợ `UPDATE ... FROM` từ 3.33.0; MySQL xoá theo join dùng
`DELETE m FROM messages m JOIN guests g ...`.

> ⚠️ Chạy `SELECT` với **cùng** `WHERE` để đếm dòng trước khi `UPDATE`/`DELETE`. Không có
> `WHERE` là toàn bảng. `TRUNCATE` nhanh hơn nhưng không có điều kiện.

| Hệ | Trả về dòng đã ghi | Version |
|---|---|---|
| PostgreSQL | `RETURNING id, created_at` | 8.2+ |
| SQLite | `RETURNING *` | 3.35+ |
| MySQL | Không có; dùng `LAST_INSERT_ID()` + `SELECT` | — |
| SQL Server | `OUTPUT INSERTED.id` | 2005+ |

```sql
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES (10, TRUE, 2)
ON CONFLICT (guest_id) DO UPDATE                 -- PostgreSQL/SQLite 3.24+
SET will_attend = EXCLUDED.will_attend,
    number_attend = EXCLUDED.number_attend;

INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES (10, TRUE, 2)
ON DUPLICATE KEY UPDATE                           -- MySQL
  will_attend = VALUES(will_attend),
  number_attend = VALUES(number_attend);
```

SQL Server dùng `MERGE` (nhiều cạm bẫy — xem [`sql-advanced.md`](./sql-advanced.md) §6).

---
## 6. SELECT và thứ tự thực thi logic

```sql
SELECT DISTINCT m.guest_of, count(*) AS total
FROM messages AS m
WHERE m.created_at >= '2025-01-01'
GROUP BY m.guest_of
HAVING count(*) >= 5
ORDER BY total DESC
LIMIT 10 OFFSET 0;
```

Thứ tự **viết** khác thứ tự **chạy**: `FROM/JOIN` → `WHERE` → `GROUP BY` → `HAVING` →
window → `SELECT` → `DISTINCT` → `ORDER BY` → `LIMIT/OFFSET`.

Hệ quả: alias ở `SELECT` **không** dùng được ở `WHERE` nhưng dùng được ở `ORDER BY`;
`HAVING` dùng aggregate, `WHERE` thì không; thiếu `ORDER BY` thì `LIMIT` trả dòng tuỳ ý.

```sql
SELECT guest_of, count(*) AS total
FROM messages GROUP BY guest_of HAVING count(*) > 10;
```

`WHERE` nhận `=`, `<>`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `IN`, `LIKE`, `ILIKE` (PG),
`IS NULL`, `AND`, `OR`, `NOT`. `DISTINCT` áp dụng trên tổ hợp cột; nó thường là dấu hiệu
join nhân dòng hoặc thiếu `GROUP BY` — kiểm tra trước khi dùng để "che" lỗi.

`ORDER BY` hỗ trợ `ASC`/`DESC`, `NULLS FIRST/LAST` (PG, SQLite 3.30+; MySQL dùng
`ORDER BY col IS NULL, col`). Collation ảnh hưởng thứ tự tiếng Việt.

```sql
SELECT * FROM messages ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET 40;
SELECT * FROM messages ORDER BY created_at DESC
OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY;        -- chuẩn SQL / SQL Server
SELECT * FROM messages ORDER BY created_at DESC LIMIT 40, 20;  -- MySQL
```

`OFFSET` lớn chậm vì vẫn phải đọc và bỏ qua. Feed nên dùng **keyset pagination** trên
`(created_at, id)` — xem [`sql-advanced.md`](./sql-advanced.md) §18.

---
## 7. Toán tử và NULL

SQL dùng logic ba giá trị: `TRUE`, `FALSE`, `UNKNOWN`. `NULL` là **thiếu giá trị**, mọi
so sánh với `NULL` cho `UNKNOWN`; `WHERE` chỉ giữ `TRUE`.

| `A` | `B` | `A = B` | `A AND B` | `A OR B` |
|---|---|---|---|---|
| TRUE | FALSE | FALSE | FALSE | TRUE |
| TRUE | UNKNOWN | UNKNOWN | UNKNOWN | TRUE |
| FALSE | UNKNOWN | UNKNOWN | FALSE | UNKNOWN |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

```sql
SELECT * FROM messages WHERE guest_of = NULL;   -- ❌ luôn rỗng
SELECT * FROM messages WHERE guest_of IS NULL;  -- ✅

SELECT COALESCE(guest_of, 'Không rõ') AS side FROM messages;
SELECT NULLIF(number_attend, 0) AS seats FROM rsvps;
```

`IS DISTINCT FROM` (PG, SQLite 3.39+) so sánh an toàn với NULL; MySQL dùng `<=>`.
`COALESCE` là chuẩn, nhận nhiều tham số; `IFNULL` (MySQL/SQLite) và `ISNULL` (SQL Server)
chỉ hai.

### 7.1 Bẫy NOT IN

```sql
-- ❌ Nếu subquery có một NULL, kết quả rỗng
SELECT * FROM messages WHERE guest_of NOT IN (SELECT side FROM guest_sides);
-- ✅
SELECT * FROM messages m
WHERE NOT EXISTS (SELECT 1 FROM guest_sides s WHERE s.side = m.guest_of);
```

`NOT IN (1, NULL)` tương đương `<> 1 AND <> NULL` → luôn `UNKNOWN`. Đây là lỗi production
phổ biến nhất liên quan NULL.

### 7.2 NULL trong aggregate

`COUNT(*)` đếm mọi dòng; `COUNT(col)`, `SUM`, `AVG`, `MIN`, `MAX` bỏ qua NULL. `SUM` toàn
NULL → NULL; `AVG` chia cho số dòng **không NULL**; `NULL + 1` → `NULL`.

```sql
SELECT avg(number_attend) FROM rsvps;              -- bỏ qua NULL
SELECT avg(COALESCE(number_attend,0)) FROM rsvps;  -- coi NULL = 0
```

> ⚠️ PostgreSQL/MySQL cho nhiều NULL trong `UNIQUE`; SQL Server chỉ một. `ORDER BY` đặt
> NULL khác nhau giữa các hệ — chỉ định `NULLS FIRST/LAST` nếu quan trọng.

---
## 8. JOIN

```sql
SELECT m.id, m.sender_name, g.full_name
FROM messages m INNER JOIN guests g ON g.id = m.guest_id;

SELECT g.id, g.full_name, r.will_attend
FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id;

SELECT g.full_name, r.id
FROM guests g FULL OUTER JOIN rsvps r ON r.guest_id = g.id;

SELECT a.id, b.sender_name AS invited_by
FROM messages a JOIN messages b ON b.id = a.reply_to_id;  -- self join
```

| Loại | Kết quả | Dùng khi |
|---|---|---|
| `INNER` | Chỉ cặp khớp | Báo cáo cần đủ hai phía |
| `LEFT` | Toàn bộ trái + khớp | "Khách chưa RSVP" |
| `RIGHT` | Toàn bộ phải + khớp | Hiếm; đảo bảng rõ hơn |
| `FULL` | Cả hai bên | Đối soát |
| `CROSS` | Mọi tổ hợp | Sinh lịch, test data |

> ⚠️ MySQL không có `FULL OUTER JOIN`: ghép `LEFT JOIN` với nhánh `RIGHT JOIN`/anti-join
> bằng `UNION ALL`.

**`ON` vs `WHERE`:** với `INNER JOIN` tương đương; với `OUTER JOIN` khác hoàn toàn.

```sql
-- ✅ Giữ mọi khách; chỉ join RSVP will_attend = TRUE
SELECT g.full_name, r.will_attend
FROM guests g LEFT JOIN rsvps r
  ON r.guest_id = g.id AND r.will_attend = TRUE;
-- ❌ Lọc sau join → mất khách không/chưa tham dự
SELECT g.full_name, r.will_attend
FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id
WHERE r.will_attend = TRUE;
```

Quy tắc: lọc **bảng phải** đặt ở `ON`; lọc **kết quả cuối** đặt ở `WHERE`.

```sql
SELECT w.couple_name, g.full_name, i.code, r.will_attend
FROM invitations i
JOIN weddings w ON w.id = i.wedding_id
JOIN guests g   ON g.id = i.guest_id
LEFT JOIN rsvps r ON r.guest_id = g.id
WHERE w.id = 1 ORDER BY g.full_name;
-- Semi join / anti join
SELECT g.id, g.full_name FROM guests g
WHERE EXISTS (SELECT 1 FROM messages m WHERE m.guest_id = g.id);
SELECT g.id, g.full_name FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM messages m WHERE m.guest_id = g.id);
```

`EXISTS` dừng khi tìm thấy một dòng, an toàn với NULL và thường tốt hơn `IN` với subquery
lớn. `NOT EXISTS` rõ ý định hơn `LEFT JOIN ... WHERE right.id IS NULL`.

```sql
SELECT g.side, count(DISTINCT g.id) AS guests,
       count(DISTINCT r.guest_id) AS responded,
       COALESCE(sum(r.number_attend), 0) AS seats
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id AND r.will_attend = TRUE
GROUP BY g.side ORDER BY seats DESC;
```

---
## 9. Aggregate và GROUP BY

| Hàm | Bỏ qua NULL? | Ghi chú |
|---|---|---|
| `COUNT(*)` | Không | Đếm dòng |
| `COUNT(col)` | Có | Đếm giá trị khác NULL |
| `COUNT(DISTINCT col)` | Có | Đếm phân biệt |
| `SUM`/`AVG` | Có | Toàn NULL → NULL |
| `STRING_AGG` (PG) / `GROUP_CONCAT` (MySQL) | Có | Nối chuỗi |

```sql
SELECT count(*) AS total,
       count(DISTINCT sender_name) AS senders,
       count(*) FILTER (WHERE will_attend) AS attending,
       COALESCE(sum(number_attend), 0) AS seats
FROM messages;
```

`FILTER` (chuẩn SQL:2003) có ở PG và SQLite 3.30+; MySQL/SQL Server dùng
`sum(CASE WHEN will_attend = 1 THEN 1 ELSE 0 END)`.

```sql
SELECT guest_of, will_attend, count(*) AS total
FROM messages
GROUP BY guest_of, will_attend
HAVING count(*) >= 5
ORDER BY guest_of, will_attend;
```

Mọi cột không aggregate trong `SELECT` phải có trong `GROUP BY`; MySQL cũ tắt
`ONLY_FULL_GROUP_BY` và trả giá trị tuỳ ý — bật lại. `HAVING` lọc sau nhóm; điều kiện
không liên quan aggregate nên đặt ở `WHERE` để giảm dữ liệu sớm.

Không lồng aggregate trực tiếp; dùng subquery/CTE. `ROLLUP` sinh dòng tổng theo cấp (PG,
MySQL, SQL Server; SQLite không hỗ trợ).

```sql
WITH per_day AS (
  SELECT created_at::date AS day, count(*) AS total
  FROM messages GROUP BY created_at::date
)
SELECT avg(total) FROM per_day;
```

---
## 10. Subquery

```sql
-- Scalar: đúng một dòng, một cột
SELECT sender_name,
       (SELECT count(*) FROM messages m2 WHERE m2.guest_id = m.guest_id) AS msg_count
FROM messages m;
-- IN
SELECT * FROM messages
WHERE guest_id IN (SELECT id FROM guests WHERE side = 'bride');
-- EXISTS tương quan
SELECT g.id, g.full_name FROM guests g
WHERE EXISTS (
  SELECT 1 FROM messages m
  WHERE m.guest_id = g.id AND m.created_at >= now() - interval '30 days'
);
-- Derived table
SELECT side, avg(total) FROM (
  SELECT g.side, count(m.id) AS total
  FROM guests g LEFT JOIN messages m ON m.guest_id = g.id
  GROUP BY g.id, g.side
) AS per_guest GROUP BY side;
```

Scalar subquery trả nhiều dòng → lỗi; trả 0 dòng → `NULL`. Derived table cần alias.
Correlated subquery tham chiếu query ngoài, planner thường biến đổi thành semi-join.

| Tình huống | Nên dùng |
|---|---|
| Cần cột từ bảng khác | `JOIN` |
| Chỉ kiểm tra tồn tại | `EXISTS` |
| Aggregate độc lập | Subquery/CTE |
| Top-1 mỗi nhóm | `LATERAL`/window |
| Subquery trả nhiều dòng mỗi dòng ngoài | `JOIN`/`LATERAL` |

---
## 11. Set operations

```sql
SELECT sender_name FROM messages_2024
UNION                                   -- hợp, loại trùng
SELECT sender_name FROM messages_2025;

SELECT sender_name FROM messages_2024
UNION ALL                               -- giữ trùng, nhanh hơn
SELECT sender_name FROM messages_2025;

SELECT guest_id FROM rsvps WHERE will_attend
INTERSECT SELECT guest_id FROM messages;

SELECT guest_id FROM rsvps
EXCEPT SELECT guest_id FROM messages;   -- MySQL 8.0.31+
```

Quy tắc: cùng số cột, kiểu tương thích theo thứ tự, tên cột lấy từ query đầu, `ORDER BY`
ở cuối. `UNION` tốn sort/hash để loại trùng. MySQL cũ không có `INTERSECT`/`EXCEPT` —
emulate bằng `JOIN`/`NOT EXISTS`.

---
## 12. CASE, CAST, chuỗi và ngày

```sql
SELECT sender_name,
  CASE WHEN number_attend >= 3 THEN 'Đại gia đình'
       WHEN number_attend >= 1 THEN 'Có tham dự'
       ELSE 'Chưa phản hồi' END AS attendance_group
FROM messages;

SELECT CAST('42' AS integer), CAST(created_at AS date);
SELECT sender_name || ' (' || guest_of || ')' FROM messages;   -- PG/SQLite
SELECT CONCAT(sender_name, ' (', guest_of, ')') FROM messages; -- MySQL/SQL Server
```

`CASE` là biểu thức, dùng được ở `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`. Không có `IF`
portable; MySQL có `IF()`, SQL Server có `IIF()`. Cast viết tắt: `::int` (PG),
`CAST(x AS SIGNED)` (MySQL), `CONVERT(int,x)` (SQL Server).

| Việc | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Độ dài | `length` | `CHAR_LENGTH` | `LEN` | `length` |
| Cắt | `substring` | `SUBSTRING` | `SUBSTRING` | `substr` |
| Trim | `btrim`/`trim` | `TRIM` | `TRIM` | `trim` |
| Vị trí | `strpos` | `LOCATE` | `CHARINDEX` | `instr` |

```sql
SELECT now(), now() - interval '7 days', date_trunc('day', now());   -- PostgreSQL
SELECT NOW(), DATE_SUB(NOW(), INTERVAL 7 DAY),
       DATE_FORMAT(created_at, '%Y-%m-%d');                          -- MySQL
SELECT GETDATE(), DATEADD(day, -7, GETDATE()),
       FORMAT(created_at, 'yyyy-MM-dd');                             -- SQL Server
SELECT datetime('now'), datetime('now','-7 days'),
       strftime('%Y-%m-%d', created_at);                             -- SQLite
```

> ⚠️ `BETWEEN '2025-01-01' AND '2025-01-31'` bỏ sót phần lớn ngày 31 nếu cột là
> `timestamp`. Dùng nửa khoảng `>= '2025-01-01' AND < '2025-02-01'`.

---
## 13. View, materialized view, sequence

```sql
CREATE VIEW v_attending_guests AS
SELECT g.id, g.full_name, r.number_attend
FROM guests g JOIN rsvps r ON r.guest_id = g.id
WHERE r.will_attend = TRUE;

CREATE MATERIALIZED VIEW mv_daily_messages AS
SELECT created_at::date AS day, count(*) AS total
FROM messages GROUP BY created_at::date;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_messages;  -- cần unique index

CREATE SEQUENCE message_seq START 1000;
SELECT nextval('message_seq');
INSERT INTO messages (sender_name, content) VALUES ('An', 'Chúc mừng!');
```

View là query đã lưu, không lưu dữ liệu; dùng để đơn giản hoá query, giới hạn cột lộ ra,
tái sử dụng logic. View đơn giản có thể update, nhưng đừng dựa vào.

| Hệ | Materialized view / sequence |
|---|---|
| PostgreSQL | Có materialized view và sequence |
| SQL Server | Indexed view; `CREATE SEQUENCE` (2012+) |
| MySQL | Không materialized view; không sequence độc lập |
| SQLite | Không cả hai; dùng bảng thường + `INTEGER PRIMARY KEY` |

Materialized view đánh đổi độ tươi lấy tốc độ; cần chiến lược refresh rõ ràng. Sequence
không rollback: rollback vẫn tiêu số. Identity chuẩn hơn `SERIAL`.

---
## 14. Transaction cơ bản

```sql
BEGIN;
UPDATE rsvps SET number_attend = 3 WHERE guest_id = 10;
INSERT INTO audit_log (action, payload) VALUES ('rsvp_update', '{"guest_id":10}');
COMMIT;

BEGIN;
DELETE FROM messages WHERE id = 42;
ROLLBACK;
```

| Hệ | Bắt đầu |
|---|---|
| PostgreSQL | `BEGIN;` |
| MySQL | `START TRANSACTION;` (`BEGIN` cũng được) |
| SQL Server | `BEGIN TRANSACTION;` |
| SQLite | `BEGIN;` |

```sql
BEGIN;
INSERT INTO guests (full_name) VALUES ('Nguyễn An');
SAVEPOINT before_rsvp;
INSERT INTO rsvps (guest_id, will_attend, number_attend) VALUES (currval('guests_id_seq'), TRUE, 1);
ROLLBACK TO SAVEPOINT before_rsvp;   -- giữ guest, huỷ rsvp
COMMIT;
```

SQL Server dùng `SAVE TRANSACTION name` / `ROLLBACK TRANSACTION name`. Isolation mặc định:
PG `READ COMMITTED`, MySQL `REPEATABLE READ`, SQL Server `READ COMMITTED`, SQLite
serializable.

| Mức | Dirty read | Non-repeatable | Phantom |
|---|---|---|---|
| `READ UNCOMMITTED` | Có thể | Có thể | Có thể |
| `READ COMMITTED` | Không | Có thể | Có thể |
| `REPEATABLE READ` | Không | Không | Có thể* |
| `SERIALIZABLE` | Không | Không | Không |

\* PostgreSQL dùng snapshot nên phantom không xuất hiện trong cùng transaction.

> ⚠️ Transaction không tự retry. Với `SERIALIZABLE` hoặc deadlock, ứng dụng phải bắt lỗi
> và thử lại.

---
## 15. Index cơ bản

```sql
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX idx_messages_guest_created ON messages (guest_id, created_at DESC);
CREATE UNIQUE INDEX uq_guests_phone ON guests (phone) WHERE phone IS NOT NULL;
```

B-tree phù hợp `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, prefix `LIKE 'abc%'`; không phù hợp
`LIKE '%abc'`, full-text, dữ liệu không gian (dùng GIN/GiST).

**Composite index** `(guest_id, created_at)` dùng được cho `WHERE guest_id = 1`, cho cả
hai cột, và cho `ORDER BY created_at` khi `guest_id` cố định; **không** dùng được cho
`WHERE created_at > ...` một mình. Quy tắc: cột `=` trước, cột range/sort sau.

| Có lợi | Ít lợi |
|---|---|
| Bảng lớn, lọc ít dòng | Bảng vài trăm dòng |
| Selectivity cao | Boolean gần cân bằng |
| Query thường xuyên | Bảng ghi nhiều hơn đọc |
| `ORDER BY` khớp index | Query trả phần lớn bảng |

Index làm chậm ghi và tốn dung lượng. Kiểm tra bằng `EXPLAIN ANALYZE`; tìm `Index
Scan`/`Bitmap Index Scan`/`Index Only Scan`. `Seq Scan` trên bảng lớn: kiểm tra index tồn
tại, cột bị bọc hàm, implicit cast, hoặc planner ước lượng sai.

---
## 16. Bảo mật cơ bản

```sql
CREATE ROLE app_read LOGIN PASSWORD 'doi-mat-khau-manh-truoc-khi-dung';
GRANT CONNECT ON DATABASE wedding TO app_read;
GRANT USAGE ON SCHEMA public TO app_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read;
REVOKE ALL ON messages FROM PUBLIC;
```

| Vai trò | Quyền |
|---|---|
| `app_read` | `SELECT` |
| `app_write` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` bảng nghiệp vụ |
| `migration` | DDL, chỉ trong CI/CD |
| `admin` | Toàn quyền, không dùng cho app |

MySQL dùng `CREATE USER` + `GRANT ... ON wedding.*`; SQL Server dùng login → user → role
(`db_datareader`, `db_datawriter`); SQLite bảo vệ bằng quyền file.

```ts
// ❌ Nối chuỗi
const sql = `SELECT * FROM messages WHERE sender_name = '${name}'`;

// ✅ Prepared statement
const { rows } = await client.query(
  'SELECT id, content FROM messages WHERE sender_name = $1', [name]
);
```

Placeholder: `$1` (PG), `?` (MySQL/SQLite), `@p1` (SQL Server). Không nối input vào SQL;
không tin stored procedure nếu bên trong vẫn `EXEC` chuỗi động; whitelist tên cột/sort
(identifier không tham số hoá được); tài khoản app quyền tối thiểu; không trả stack trace.

---
## 17. Schema mẫu wedding

Production hiện tại dùng bảng phẳng `messages(id, sender_name, content, will_attend,
guest_of, number_attend, created_at)`. Mô hình này trùng lặp: một người gửi nhiều lời
chúc không liên kết, không có thiệp mời, RSVP và guestbook trộn lẫn. Mô hình chuẩn hoá
gồm `weddings`, `guests`, `invitations`, `rsvps`, `messages` (messages N–1
weddings/guests; rsvps 1–1 guests).

```sql
CREATE TABLE weddings (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  couple_name varchar(120) NOT NULL,
  event_date  date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guests (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  varchar(80) NOT NULL,
  phone      varchar(20) UNIQUE,
  email      varchar(160),
  side       varchar(10) NOT NULL DEFAULT 'both'
             CHECK (side IN ('bride','groom','both')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 80)
);

CREATE TABLE invitations (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wedding_id bigint NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id   bigint NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  code       varchar(32) NOT NULL UNIQUE,
  status     varchar(12) NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','sent','opened','declined')),
  UNIQUE (wedding_id, guest_id)
);

CREATE TABLE rsvps (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id      bigint NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  will_attend   boolean NOT NULL,
  number_attend smallint NOT NULL DEFAULT 0 CHECK (number_attend BETWEEN 0 AND 10),
  note          varchar(500),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK ((will_attend AND number_attend >= 1)
      OR (NOT will_attend AND number_attend = 0))
);

CREATE TABLE messages (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wedding_id  bigint NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id    bigint REFERENCES guests(id) ON DELETE SET NULL,
  sender_name varchar(80) NOT NULL,
  content     text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 1000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
```

`CHECK` kết hợp `will_attend` và `number_attend` là **business rule ở tầng dữ liệu**:
không thể lưu "không tham dự nhưng mang 2 người". Validate chỉ ở app sẽ bị lách bởi
import CSV, job, client khác.

```sql
CREATE INDEX idx_messages_feed
  ON messages (wedding_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_guest ON messages (guest_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rsvps_attending ON rsvps (will_attend) WHERE will_attend = TRUE;
```

Index `(wedding_id, created_at DESC, id DESC)` phục vụ filter, sort và keyset pagination.
View thống kê có thể dựng từ các bảng này; nhớ thay `FILTER` bằng `CASE WHEN ... THEN 1
END` trên MySQL/SQL Server.

| Cột cũ `messages` | Nơi mới | Ghi chú |
|---|---|---|
| `sender_name` | `messages.sender_name` | Giữ để không phá API |
| `content` | `messages.content` | |
| `will_attend` | `rsvps.will_attend` | Cần match guest |
| `guest_of` | `guests.side` | Chuẩn hoá giá trị |
| `number_attend` | `rsvps.number_attend` | |
| `created_at` | `messages.created_at` | |

Chiến lược: thêm bảng mới → backfill → dual-write → chuyển đọc → bỏ cột cũ. Không đổi
một lần trong production đang chạy (xem [`sql-advanced.md`](./sql-advanced.md) §20).

---
## 18. Bài tập

**Mức dễ:**
1. Đếm tổng số lời chúc.
2. 10 lời chúc mới nhất (`id`, `sender_name`, `created_at`).
3. Đếm khách theo từng phía.

**Mức trung bình:**
4. Khách chưa gửi RSVP.
5. Mỗi phía: số khách, số phản hồi, số ghế.
6. Top 5 người gửi nhiều lời chúc nhất.
7. Số lời chúc theo ngày trong 30 ngày gần nhất, ngày có ≥ 10 lời chúc.

**Mức khó:**
8. Với mỗi khách, lời chúc mới nhất (nếu có).
9. Khách có tổng người tham dự lớn hơn trung bình.
10. Số lời chúc mỗi ngày kèm tổng luỹ kế.
11. Danh sách khách kèm trạng thái thiệp/RSVP, phân trang 20 dòng.
12. Tìm cặp khách trùng số điện thoại.

### 18.1 Đáp án gợi ý

```sql
-- 1
SELECT count(*) FROM messages;
-- 2
SELECT id, sender_name, created_at FROM messages
ORDER BY created_at DESC, id DESC LIMIT 10;
-- 3
SELECT side, count(*) AS total FROM guests GROUP BY side ORDER BY total DESC;
-- 4
SELECT g.id, g.full_name FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM rsvps r WHERE r.guest_id = g.id);
-- 5
SELECT g.side, count(DISTINCT g.id) AS guests,
       count(DISTINCT r.guest_id) FILTER (WHERE r.will_attend) AS attending,
       COALESCE(sum(r.number_attend) FILTER (WHERE r.will_attend), 0) AS seats
FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id
GROUP BY g.side;
-- 6
SELECT sender_name, count(*) AS total FROM messages
WHERE deleted_at IS NULL
GROUP BY sender_name ORDER BY total DESC, sender_name LIMIT 5;
-- 7
SELECT created_at::date AS day, count(*) AS total
FROM messages WHERE created_at >= now() - interval '30 days'
GROUP BY created_at::date HAVING count(*) >= 10 ORDER BY day;
-- 8 (PostgreSQL; MySQL 8+/SQL Server dùng ROW_NUMBER() rồi lọc rn = 1)
SELECT g.id, g.full_name, m.content, m.created_at
FROM guests g
LEFT JOIN LATERAL (
  SELECT content, created_at FROM messages m
  WHERE m.guest_id = g.id AND m.deleted_at IS NULL
  ORDER BY m.created_at DESC, m.id DESC LIMIT 1
) m ON TRUE;
-- 9
SELECT g.full_name, r.number_attend
FROM guests g JOIN rsvps r ON r.guest_id = g.id
WHERE r.will_attend
  AND r.number_attend > (SELECT avg(number_attend) FROM rsvps WHERE will_attend);
-- 10
SELECT created_at::date AS day, count(*) AS daily,
       sum(count(*)) OVER (ORDER BY created_at::date) AS running
FROM messages GROUP BY created_at::date ORDER BY day;
-- 11
SELECT g.full_name, i.code, i.status, r.will_attend, r.number_attend
FROM guests g
LEFT JOIN invitations i ON i.guest_id = g.id
LEFT JOIN rsvps r       ON r.guest_id = g.id
ORDER BY g.full_name, g.id LIMIT 20 OFFSET 0;
-- 12
SELECT a.id AS id_a, b.id AS id_b, a.phone
FROM guests a JOIN guests b ON a.phone = b.phone AND a.id < b.id
WHERE a.phone IS NOT NULL;
```

---
## 19. Anti-patterns cơ bản

| Anti-pattern | Vấn đề | Cách sửa |
|---|---|---|
| `SELECT *` trong app | Tốn băng thông, vỡ khi đổi schema | Liệt kê cột |
| `UPDATE`/`DELETE` không `WHERE` | Mất dữ liệu | `SELECT` đếm trước, transaction |
| `NOT IN` với cột nullable | Kết quả rỗng | `NOT EXISTS` |
| `= NULL` | Luôn UNKNOWN | `IS NULL` |
| Ngày lưu dạng chuỗi | So sánh/sort sai | Kiểu date/time |
| Tiền dùng `float` | Sai số | `numeric` |
| `varchar(255)` mọi thứ | Vô nghĩa, lãng phí | Độ dài theo domain |
| Ghép chuỗi SQL từ input | Injection | Prepared statement |
| Index mọi cột | Ghi chậm, tốn đĩa | Index theo query thật |
| `OFFSET` lớn | Chậm dần | Keyset pagination |
| `DISTINCT` che join nhân dòng | Kết quả sai, chậm | Sửa điều kiện join |
| `NULL` vừa "không áp dụng" vừa "chưa biết" | Không phân biệt | Thêm trạng thái rõ |
| Trigger chứa business logic phức tạp | Khó debug/version | Logic ở app, trigger audit |

> 💡 Anti-pattern phổ biến nhất không phải cú pháp sai mà là **không đo**. Tối ưu phải
> bắt đầu bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu thật.

---
## 20. Tài liệu tham khảo

**Chuẩn & lý thuyết:** ISO/IEC 9075:2023 · E. F. Codd (1970) · C. J. Date, *SQL and
Relational Theory* · R. Ramakrishnan & J. Gehrke, *Database Management Systems*.

**Thực hành:** Markus Winand, *SQL Performance Explained* và
<https://use-the-index-luke.com/> · Bill Karwin, *SQL Antipatterns* · Itzik Ben-Gan,
*T-SQL Fundamentals* · Anthony DeBarros, *Practical SQL*.

**Chính thức:** [PostgreSQL 17](https://www.postgresql.org/docs/17/) ·
[MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/) ·
[SQL Server](https://learn.microsoft.com/sql/t-sql/) ·
[SQLite](https://www.sqlite.org/lang.html) · [Modern SQL](https://modern-sql.com/).

**Nội bộ:** [README](./README.md) · [sql-advanced](./sql-advanced.md) ·
[sql-dialects](./sql-dialects-and-patterns.md) ·
[postgresql-basics](../postgresql-basics.md) ·
[postgresql-advanced](../postgresql-advanced.md).
