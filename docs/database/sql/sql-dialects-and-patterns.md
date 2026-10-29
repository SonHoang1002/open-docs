# SQL — Dialect và pattern thực chiến

> So sánh cú pháp PostgreSQL, MySQL, SQL Server, SQLite và 17 pattern SQL thường gặp trong
> backend: top-N, dedupe, cohort, funnel, sessionization, SCD2, leaderboard, pagination,
> soft delete, audit, idempotent upsert… Kèm cheatsheet và bài tập tổng hợp.

> 📌 Câu SQL ghi rõ dialect khi khác nhau. Version được ghi chú khi tính năng mới. Mặc
> định không ghi = PostgreSQL 16+. Nền tảng lý thuyết xem
> [`sql-fundamentals.md`](./sql-fundamentals.md); tối ưu xem
> [`sql-advanced.md`](./sql-advanced.md).

---

## Mục lục

1. [So sánh dialect](#1-so-sánh-dialect)
2. [Cú pháp tương đương cho 25 tác vụ](#2-cú-pháp-tương-đương-cho-25-tác-vụ)
3. [Pattern thực chiến](#3-pattern-thực-chiến)
4. [Cheatsheet](#4-cheatsheet)
5. [Anti-patterns đa dialect](#5-anti-patterns-đa-dialect)
6. [Bài tập tổng hợp](#6-bài-tập-tổng-hợp)
7. [Tài liệu tham khảo](#7-tài-liệu-tham-khảo)

---

## 1. So sánh dialect

### 1.1 Identifier, literal, comment

| Chủ đề | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Quote identifier | `"col"` | `` `col` `` | `[col]` | `"col"` |
| Quote string | `'text'` | `'text'` / `"text"`* | `'text'` / `N'text'` | `'text'` |
| Escape quote | `''` | `''` / `\'` | `''` | `''` |
| Comment | `--`, `/* */` | `--`, `#`, `/* */` | `--`, `/* */` | `--`, `/* */` |
| Case identifier | Case-sensitive khi quote | Phụ thuộc `lower_case_table_names` | Không phân biệt | Không phân biệt |

\* MySQL cho phép `"text"` nếu không bật `ANSI_QUOTES`; đừng dựa vào.

### 1.2 Pagination, identity, boolean

| Chủ đề | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Limit | `LIMIT n OFFSET m` | `LIMIT m, n` | `OFFSET m ROWS FETCH NEXT n ROWS ONLY` | `LIMIT n OFFSET m` |
| Không offset | `LIMIT n` | `LIMIT n` | `TOP (n)` / `FETCH FIRST n ROWS ONLY` | `LIMIT n` |
| Auto id | `GENERATED ... AS IDENTITY` | `AUTO_INCREMENT` | `IDENTITY(1,1)` | `INTEGER PRIMARY KEY` |
| Lấy id vừa insert | `RETURNING id` | `LAST_INSERT_ID()` | `SCOPE_IDENTITY()` / `OUTPUT` | `last_insert_rowid()` |
| Boolean literal | `TRUE`/`FALSE` | `1`/`0` | `1`/`0` | `1`/`0` |
| Boolean type | `boolean` | `TINYINT(1)` | `bit` | `INTEGER` + CHECK |

### 1.3 Date/time

| Việc | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Bây giờ | `now()` | `NOW()` | `SYSDATETIME()` | `datetime('now')` |
| Hôm nay | `current_date` | `CURDATE()` | `CAST(GETDATE() AS date)` | `date('now')` |
| Cộng 7 ngày | `now() + interval '7 days'` | `DATE_ADD(NOW(), INTERVAL 7 DAY)` | `DATEADD(day, 7, GETDATE())` | `datetime('now','+7 days')` |
| Trunc ngày | `date_trunc('day', ts)` | `DATE(ts)` | `CAST(ts AS date)` | `date(ts)` |
| Trunc tháng | `date_trunc('month', ts)` | `DATE_FORMAT(ts,'%Y-%m-01')` | `DATEFROMPARTS(YEAR(ts),MONTH(ts),1)` | `date(ts,'start of month')` |
| Extract năm | `extract(year from ts)` | `YEAR(ts)` | `YEAR(ts)` | `strftime('%Y', ts)` |
| Diff ngày | `(a::date - b::date)` | `DATEDIFF(a,b)` | `DATEDIFF(day,b,a)` | `julianday(a)-julianday(b)` |
| Format | `to_char(ts,'YYYY-MM-DD')` | `DATE_FORMAT(ts,'%Y-%m-%d')` | `FORMAT(ts,'yyyy-MM-dd')` | `strftime('%Y-%m-%d',ts)` |
| Timezone | `timestamptz` | `TIMESTAMP` + `CONVERT_TZ` | `datetimeoffset` | `TEXT` UTC |

### 1.4 String, NULL, aggregate

| Việc | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Nối chuỗi | `a \|\| b` | `CONCAT(a,b)` | `CONCAT(a,b)` / `a + b` | `a \|\| b` |
| Độ dài | `length` | `CHAR_LENGTH` | `LEN` | `length` |
| Substring | `substring(s,1,3)` | `SUBSTRING(s,1,3)` | `SUBSTRING(s,1,3)` | `substr(s,1,3)` |
| Vị trí | `strpos(s,'x')` | `LOCATE('x',s)` | `CHARINDEX('x',s)` | `instr(s,'x')` |
| Thay thế | `replace` | `REPLACE` | `REPLACE` | `replace` |
| Regex | `~`, `regexp_replace` | `REGEXP_LIKE` (8.0) | Không native (CLR) | `REGEXP` (3.15+) |
| NULL thay thế | `COALESCE` | `IFNULL`/`COALESCE` | `ISNULL`/`COALESCE` | `IFNULL`/`COALESCE` |
| So sánh NULL | `IS DISTINCT FROM` | `<=>` | `(a = b OR (a IS NULL AND b IS NULL))` | `IS` / `IS NOT` |
| Nối aggregate | `string_agg(x, ',')` | `GROUP_CONCAT(x SEPARATOR ',')` | `STRING_AGG(x, ',')` | `group_concat(x, ',')` |
| Aggregate có điều kiện | `FILTER (WHERE ...)` | `CASE WHEN` | `CASE WHEN` | `FILTER` (3.30+) |

### 1.5 JSON, full-text, upsert

| Chủ đề | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Kiểu JSON | `jsonb` | `JSON` | `nvarchar` + `ISJSON` | `TEXT` |
| Lấy field | `col->>'key'` | `col->>'$.key'` | `JSON_VALUE(col,'$.key')` | `json_extract(col,'$.key')` |
| Query JSON table | `jsonb_array_elements` | `JSON_TABLE` | `OPENJSON` | `json_each` |
| Index JSON | GIN `jsonb_path_ops` | Multi-valued index (8.0.17+) | Computed column + index | Generated column + index |
| Full-text | `tsvector` + GIN | `FULLTEXT` + `MATCH` | Full-Text Index + `CONTAINS` | FTS5 |
| Upsert | `ON CONFLICT` | `ON DUPLICATE KEY UPDATE` | `MERGE` | `ON CONFLICT` |
| Returning | `RETURNING` | `LAST_INSERT_ID()` + `SELECT` | `OUTPUT` | `RETURNING` (3.35+) |
| Window function | Có | 8.0+ | 2012+ | 3.25+ |
| Recursive CTE | Có | 8.0+ | Có | 3.8.3+ |
| `INTERSECT`/`EXCEPT` | Có | 8.0.31+ | Có | Có |
| Transactional DDL | Có | Không | Có (hầu hết) | Có |

> ⚠️ Đừng viết SQL "portable" bằng cách dùng chung một chuỗi cho mọi hệ. Hãy tách
> repository/adapter theo dialect, hoặc dùng query builder có dialect.

---

## 2. Cú pháp tương đương cho 25 tác vụ

| # | Tác vụ | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|---|
| 1 | Lấy 10 dòng | `LIMIT 10` | `LIMIT 10` | `TOP (10)` | `LIMIT 10` |
| 2 | Trang 3, 20 dòng | `LIMIT 20 OFFSET 40` | `LIMIT 40,20` | `OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY` | `LIMIT 20 OFFSET 40` |
| 3 | Nối chuỗi | `a \|\| b` | `CONCAT(a,b)` | `CONCAT(a,b)` | `a \|\| b` |
| 4 | Chuỗi → số | `'42'::int` | `CAST('42' AS SIGNED)` | `CAST('42' AS int)` | `CAST('42' AS INTEGER)` |
| 5 | Số → chuỗi | `42::text` | `CAST(42 AS CHAR)` | `CAST(42 AS varchar)` | `CAST(42 AS TEXT)` |
| 6 | Ngày hiện tại | `current_date` | `CURDATE()` | `CAST(GETDATE() AS date)` | `date('now')` |
| 7 | Cộng thời gian | `now() + interval '1 day'` | `DATE_ADD(NOW(),INTERVAL 1 DAY)` | `DATEADD(day,1,GETDATE())` | `datetime('now','+1 day')` |
| 8 | Đầu tháng | `date_trunc('month',ts)` | `DATE_FORMAT(ts,'%Y-%m-01')` | `DATEFROMPARTS(YEAR(ts),MONTH(ts),1)` | `date(ts,'start of month')` |
| 9 | Chuỗi → ngày | `to_date(s,'YYYY-MM-DD')` | `STR_TO_DATE(s,'%Y-%m-%d')` | `CONVERT(date,s,23)` | `date(s)` |
| 10 | NULL → 0 | `COALESCE(x,0)` | `IFNULL(x,0)` | `ISNULL(x,0)` | `IFNULL(x,0)` |
| 11 | So sánh NULL an toàn | `a IS DISTINCT FROM b` | `a <=> b` | `(a = b OR (a IS NULL AND b IS NULL))` | `a IS NOT b` |
| 12 | Random | `random()` | `RAND()` | `NEWID()` | `random()` |
| 13 | UUID | `gen_random_uuid()` | `UUID()` | `NEWID()` | `lower(hex(randomblob(16)))` |
| 14 | Lấy id vừa insert | `RETURNING id` | `LAST_INSERT_ID()` | `OUTPUT INSERTED.id` | `last_insert_rowid()` |
| 15 | Upsert | `ON CONFLICT` | `ON DUPLICATE KEY` | `MERGE` | `ON CONFLICT` |
| 16 | Giới hạn chuỗi | `left(s,10)` | `LEFT(s,10)` | `LEFT(s,10)` | `substr(s,1,10)` |
| 17 | Tìm chuỗi | `strpos(s,'x')` | `LOCATE('x',s)` | `CHARINDEX('x',s)` | `instr(s,'x')` |
| 18 | Regex match | `s ~ '^A'` | `REGEXP_LIKE(s,'^A')` | `s LIKE 'A%'` (không regex) | `s REGEXP '^A'` |
| 19 | JSON field | `j->>'k'` | `j->>'$.k'` | `JSON_VALUE(j,'$.k')` | `json_extract(j,'$.k')` |
| 20 | Full-text | `tsv @@ q` | `MATCH(c) AGAINST(q)` | `CONTAINS(c,q)` | `fts MATCH q` |
| 21 | Xoá bảng nếu có | `DROP TABLE IF EXISTS` | `DROP TABLE IF EXISTS` | `DROP TABLE IF EXISTS` (2016+) | `DROP TABLE IF EXISTS` |
| 22 | Đổi tên cột | `RENAME COLUMN` | `RENAME COLUMN` (8.0) | `sp_rename` | `RENAME COLUMN` (3.25+) |
| 23 | Thêm cột nếu chưa có | `ADD COLUMN IF NOT EXISTS` | `ADD COLUMN` + check | `ADD` + check | `ADD COLUMN` + check |
| 24 | Xoá nhanh bảng | `TRUNCATE` | `TRUNCATE` | `TRUNCATE` | `DELETE FROM` |
| 25 | Xem plan | `EXPLAIN ANALYZE` | `EXPLAIN ANALYZE` (8.0.18+) | `SET SHOWPLAN_ALL ON` | `EXPLAIN QUERY PLAN` |

> 💡 `||` là chuẩn SQL cho concat nhưng MySQL mặc định coi là `OR`; SQL Server cần
> `CONCAT` để NULL không làm mất cả chuỗi.

---

## 3. Pattern thực chiến

### 3.1 Top-N per group

Lấy lời chúc mới nhất của mỗi khách; phần window mở rộng thành top 3.

```sql
-- PostgreSQL: DISTINCT ON (top 1, nhanh, gọn)
SELECT DISTINCT ON (guest_id) guest_id, content, created_at
FROM messages WHERE deleted_at IS NULL
ORDER BY guest_id, created_at DESC, id DESC;

-- Chuẩn: window function (mọi hệ hỗ trợ window)
WITH ranked AS (
  SELECT guest_id, content, created_at,
         row_number() OVER (PARTITION BY guest_id ORDER BY created_at DESC, id DESC) rn
  FROM messages WHERE deleted_at IS NULL
)
SELECT * FROM ranked WHERE rn <= 3;
```

MySQL 8+/SQL Server/SQLite 3.25+ dùng window. MySQL 5.7 dùng biến hoặc correlated
subquery (chậm). Luôn có tie-breaker `id`; `DISTINCT ON` chỉ trả một dòng mỗi nhóm,
top 3 phải dùng window/LATERAL.

### 3.2 Deduplicate, giữ bản mới nhất

```sql
-- PostgreSQL: ctid + row_number
WITH dup AS (
  SELECT ctid, row_number() OVER (
    PARTITION BY sender_name, content ORDER BY created_at DESC, id DESC) rn
  FROM messages
)
DELETE FROM messages m USING dup
WHERE m.ctid = dup.ctid AND dup.rn > 1;

-- MySQL: self join
DELETE m1 FROM messages m1
JOIN messages m2
  ON m1.sender_name = m2.sender_name AND m1.content = m2.content
 AND (m1.created_at < m2.created_at
      OR (m1.created_at = m2.created_at AND m1.id < m2.id));

-- SQL Server: CTE
WITH dup AS (
  SELECT id, row_number() OVER (
    PARTITION BY sender_name, content ORDER BY created_at DESC, id DESC) rn
  FROM messages
)
DELETE FROM dup WHERE rn > 1;

-- SQLite: rowid
DELETE FROM messages WHERE rowid NOT IN (
  SELECT max(rowid) FROM messages GROUP BY sender_name, content
);
```

> ⚠️ Chạy `SELECT` đếm trùng trước, backup, và thực hiện trong transaction. Với bảng lớn,
> xoá theo batch để tránh lock/WAL lớn.

### 3.3 Running total và moving average

```sql
SELECT day, daily,
       sum(daily) OVER (ORDER BY day
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running,
       avg(daily) OVER (ORDER BY day
                        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7d
FROM (
  SELECT created_at::date AS day, count(*) AS daily
  FROM messages GROUP BY created_at::date
) d ORDER BY day;
```

MySQL 8+/SQL Server/SQLite 3.25+ tương tự. MySQL 5.7 dùng biến session (không đáng tin
khi có `ORDER BY` phức tạp) hoặc bảng tổng hợp.

### 3.4 Gaps and islands

Tìm chuỗi ngày liên tiếp có lời chúc.

```sql
WITH days AS (
  SELECT DISTINCT created_at::date AS day FROM messages
),
grouped AS (
  SELECT day,
         day - (row_number() OVER (ORDER BY day) * interval '1 day') AS grp
  FROM days
)
SELECT min(day) AS start_day, max(day) AS end_day, count(*) AS length
FROM grouped GROUP BY grp ORDER BY start_day;
```

Nguyên lý: hiệu giữa giá trị ngày và `row_number` không đổi trong một chuỗi liên tiếp.
Với số nguyên (ID), dùng `id - row_number()`; cẩn thận khoảng trống do xoá.

### 3.5 Cohort retention

```sql
WITH first_seen AS (
  SELECT guest_id, min(created_at::date) AS cohort
  FROM messages GROUP BY guest_id
),
activity AS (
  SELECT m.guest_id, f.cohort,
         date_trunc('month', m.created_at)::date AS month
  FROM messages m JOIN first_seen f ON f.guest_id = m.guest_id
  GROUP BY m.guest_id, f.cohort, date_trunc('month', m.created_at)
)
SELECT cohort, month,
       count(DISTINCT guest_id) AS active
FROM activity GROUP BY cohort, month ORDER BY cohort, month;
```

Retention tháng N = số guest hoạt động ở tháng `cohort + N` chia số guest trong cohort.
Cần chuẩn hoá date trunc theo dialect (`DATE_FORMAT`, `DATEFROMPARTS`, `strftime`).

### 3.6 Funnel conversion

```sql
SELECT
  count(*) FILTER (WHERE opened_at IS NOT NULL) AS opened,
  count(*) FILTER (WHERE rsvp_at IS NOT NULL)   AS rsvp,
  count(*) FILTER (WHERE message_at IS NOT NULL) AS messaged,
  round(100.0 * count(*) FILTER (WHERE rsvp_at IS NOT NULL) / count(*), 2) AS rsvp_rate
FROM guest_journey;
```

MySQL/SQL Server thay `FILTER` bằng `sum(CASE WHEN ... THEN 1 ELSE 0 END)`. Funnel phải
định nghĩa thứ tự bước; nếu không, một người có thể nhảy bước.

### 3.7 Sessionization

```sql
WITH ordered AS (
  SELECT guest_id, created_at,
         lag(created_at) OVER (PARTITION BY guest_id ORDER BY created_at) AS prev
  FROM events
),
marked AS (
  SELECT *,
         CASE WHEN prev IS NULL OR created_at - prev > interval '30 minutes'
              THEN 1 ELSE 0 END AS new_session
  FROM ordered
)
SELECT guest_id, created_at,
       sum(new_session) OVER (PARTITION BY guest_id ORDER BY created_at) AS session_no
FROM marked;
```

MySQL dùng `TIMESTAMPDIFF(MINUTE, prev, created_at) > 30`; SQLite dùng
`(julianday(created_at)-julianday(prev))*1440 > 30`.

### 3.8 Slowly changing dimension type 2

```sql
BEGIN;
UPDATE guest_history
SET valid_to = now(), is_current = FALSE
WHERE guest_id = $1 AND is_current;

INSERT INTO guest_history (guest_id, full_name, valid_from, is_current)
VALUES ($1, $2, now(), TRUE);
COMMIT;
```

Truy vấn tại thời điểm `t`: `valid_from <= t AND (valid_to IS NULL OR valid_to > t)`.
PostgreSQL có thể dùng `tstzrange` + exclusion constraint để chặn chồng lấn; SQL Server
có temporal table.

### 3.9 Tree và hierarchy

```sql
-- Adjacency list + recursive CTE
WITH RECURSIVE subtree AS (
  SELECT id, parent_id, name, 1 AS depth FROM categories WHERE id = $1
  UNION ALL
  SELECT c.id, c.parent_id, c.name, s.depth + 1
  FROM categories c JOIN subtree s ON c.parent_id = s.id
)
SELECT * FROM subtree ORDER BY depth, name;

-- Closure table: mọi cặp tổ tiên - hậu duệ
SELECT d.name
FROM category_closure c
JOIN categories d ON d.id = c.descendant_id
WHERE c.ancestor_id = $1;
```

| Cách | Ưu | Nhược |
|---|---|---|
| Adjacency list | Đơn giản, ghi nhanh | Query cây cần recursive |
| Closure table | Query cây nhanh | Ghi phức tạp, nhiều dòng |
| Materialized path | Query prefix nhanh | Đổi parent tốn |
| PostgreSQL `ltree` | Index GiST, query gọn | Riêng PostgreSQL |

MySQL 8+ có recursive CTE; SQL Server dùng `hierarchyid`; SQLite 3.8.3+ recursive CTE.

### 3.10 Leaderboard

```sql
SELECT sender_name, count(*) AS total,
       rank()       OVER (ORDER BY count(*) DESC) AS rnk,
       dense_rank() OVER (ORDER BY count(*) DESC) AS drnk,
       row_number() OVER (ORDER BY count(*) DESC, sender_name) AS rn
FROM messages WHERE deleted_at IS NULL
GROUP BY sender_name
ORDER BY total DESC LIMIT 20;
```

`RANK` nhảy khi trùng; `DENSE_RANK` không; `ROW_NUMBER` luôn duy nhất. Chọn theo yêu cầu
sản phẩm. Với leaderboard lớn, cache bảng tổng hợp theo giờ.

### 3.11 Time series fill missing dates

```sql
-- PostgreSQL
SELECT d::date AS day, count(m.id) AS total
FROM generate_series('2026-01-01'::date, '2026-01-31'::date, interval '1 day') d
LEFT JOIN messages m ON m.created_at::date = d::date
GROUP BY d ORDER BY d;

-- MySQL 8+ (SQLite/SQL Server: xem ghi chú bên dưới)
WITH RECURSIVE days AS (
  SELECT DATE('2026-01-01') AS d
  UNION ALL
  SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM days
  WHERE d < '2026-01-31'
)
SELECT days.d, count(m.id)
FROM days LEFT JOIN messages m ON DATE(m.created_at) = days.d
GROUP BY days.d ORDER BY days.d;
```

SQLite dùng `date(d,'+1 day')` và `WITH`; SQL Server bỏ `RECURSIVE` (chỉ dùng `WITH`),
thay `DATE_ADD` bằng `DATEADD(day,1,d)` và `DATE()` bằng `CAST(... AS date)`. Với báo cáo
lớn, dùng bảng `calendar` thay vì generate mỗi lần.

### 3.12 Pagination: offset vs keyset

```sql
-- Offset: đơn giản, chậm khi sâu
SELECT * FROM messages ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET 10000;

-- Keyset: ổn định, nhanh
SELECT * FROM messages
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC LIMIT 20;
```

| Tiêu chí | Offset | Keyset |
|---|---|---|
| Nhảy trang tuỳ ý | Có | Không (chỉ next/prev) |
| Hiệu năng trang sâu | Kém | Tốt |
| Dữ liệu thay đổi giữa trang | Lặp/sót | Ổn định |
| Cần sort đa dạng | Dễ | Phải index theo sort |

Row constructor `(a,b) < (x,y)` có ở PostgreSQL, MySQL, SQLite; SQL Server không hỗ trợ,
phải viết `(a < x OR (a = x AND b < y))`.

### 3.13 Dynamic search/filter an toàn

```ts
const sortable = { created_at: 'm.created_at', sender_name: 'm.sender_name' };
const sortCol = sortable[input.sort] ?? 'm.created_at';
const order = input.order === 'asc' ? 'ASC' : 'DESC';

const sql = `
  SELECT m.id, m.sender_name, m.content, m.created_at
  FROM messages m JOIN guests g ON g.id = m.guest_id
  WHERE m.wedding_id = $1
    AND ($2::text IS NULL OR m.content ILIKE '%' || $2 || '%')
    AND ($3::text IS NULL OR g.side = $3)
  ORDER BY ${sortCol} ${order}
  LIMIT $4 OFFSET $5`;
```

Không bao giờ nội suy `input.sort` trực tiếp. Whitelist cột, whitelist hướng sort, tham
số hoá giá trị. Với filter optional, dùng `($n IS NULL OR col = $n)` — cẩn thận plan
generic; có thể viết query động theo tổ hợp filter.

### 3.14 Soft delete + unique constraint

```sql
-- Giả sử guests đã có deleted_at timestamptz
-- PostgreSQL/SQLite: partial unique
CREATE UNIQUE INDEX uq_guests_phone_active
  ON guests (phone) WHERE deleted_at IS NULL;

-- SQL Server: filtered index
CREATE UNIQUE INDEX uq_guests_phone_active
  ON guests (phone) WHERE deleted_at IS NULL;

-- MySQL: generated column + unique
ALTER TABLE guests
  ADD COLUMN phone_active varchar(20)
    GENERATED ALWAYS AS (IF(deleted_at IS NULL, phone, NULL)) STORED,
  ADD UNIQUE KEY uq_guests_phone_active (phone_active);
```

Mọi query phải lọc `deleted_at IS NULL`; hoặc tạo view `v_guests_active`. Soft delete
làm bảng phình — cân nhắc archive job.

### 3.15 Audit log

```sql
CREATE TABLE audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL, op text NOT NULL,
  row_pk text, old_data jsonb, new_data jsonb,
  actor text DEFAULT current_user,
  at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION audit_messages() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO audit_log (table_name, op, row_pk, old_data, new_data)
  VALUES ('messages', TG_OP, coalesce(NEW.id, OLD.id)::text,
          to_jsonb(OLD), to_jsonb(NEW));
  RETURN coalesce(NEW, OLD);
END $$;
```

MySQL trigger viết `OLD`/`NEW` tương tự nhưng không có `to_jsonb`; dùng `JSON_OBJECT`.
SQL Server dùng `OUTPUT INTO` hoặc temporal table. Audit log chỉ append; phân quyền
riêng; có retention.

### 3.16 Many-to-many tag filtering

```sql
-- Có TẤT CẢ tag (AND)
SELECT m.id, m.content
FROM messages m
JOIN message_tags mt ON mt.message_id = m.id
JOIN tags t ON t.id = mt.tag_id
WHERE t.name IN ('family','friends')
GROUP BY m.id, m.content
HAVING count(DISTINCT t.name) = 2;

-- Có BẤT KỲ tag (OR)
SELECT DISTINCT m.id, m.content
FROM messages m
JOIN message_tags mt ON mt.message_id = m.id
JOIN tags t ON t.id = mt.tag_id
WHERE t.name IN ('family','friends');
```

`HAVING count(DISTINCT ...) = N` là pattern AND kinh điển. Với tập tag lớn, dùng
`INTERSECT` hoặc bitmap trong search engine.

### 3.17 Idempotent upsert

```sql
-- PostgreSQL; SQLite 3.35+
INSERT INTO rsvps (guest_id, will_attend, number_attend, updated_at)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
ON CONFLICT (guest_id) DO UPDATE
SET will_attend = EXCLUDED.will_attend,
    number_attend = EXCLUDED.number_attend,
    updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- MySQL
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES (?, ?, ?) AS new
ON DUPLICATE KEY UPDATE
  will_attend = new.will_attend,
  number_attend = new.number_attend;
```

Idempotency thật sự cần `request_id` unique:

```sql
INSERT INTO processed_requests (request_id, result)
VALUES ($1, $2) ON CONFLICT (request_id) DO NOTHING;
```

Nếu insert 0 dòng, đọc kết quả cũ và trả lại — client retry không tạo side effect.

---

## 4. Cheatsheet

```sql
-- SELECT
SELECT DISTINCT col1, col2 FROM t
WHERE col1 = $1 AND col2 IS NOT NULL
ORDER BY col1 DESC NULLS LAST LIMIT 20 OFFSET 0;

-- JOIN
SELECT a.*, b.* FROM a
LEFT JOIN b ON b.a_id = a.id AND b.active
WHERE a.created_at >= $1;

-- GROUP
SELECT col, count(*) FILTER (WHERE cond) AS n
FROM t GROUP BY col HAVING count(*) > 1;

-- Window
row_number() OVER (PARTITION BY g ORDER BY ts DESC, id DESC)
sum(x) OVER (ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
lag(x, 1, 0) OVER (ORDER BY ts)

-- CTE
WITH x AS (SELECT ...), y AS (SELECT ... FROM x)
SELECT * FROM y;

-- Upsert
INSERT ... ON CONFLICT (key) DO UPDATE SET col = EXCLUDED.col;

-- Transaction
BEGIN; ... COMMIT;  -- ROLLBACK; SAVEPOINT s; ROLLBACK TO s;

-- Index
CREATE INDEX CONCURRENTLY ix ON t (a, b DESC) INCLUDE (c)
WHERE deleted_at IS NULL;

-- EXPLAIN
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT ...;
```

| Kiểm tra | Lệnh |
|---|---|
| Query đang chạy | `pg_stat_activity` |
| Query chậm | `pg_stat_statements` |
| Index dùng | `pg_stat_user_indexes` |
| Kích thước bảng | `pg_total_relation_size` |
| Lock | `pg_locks` |
| Stats | `ANALYZE t` |
| Plan JSON | `EXPLAIN (FORMAT JSON)` |

---

## 5. Anti-patterns đa dialect

| Anti-pattern | Hệ hay gặp | Sửa |
|---|---|---|
| `LIMIT` trong SQL Server | SQL Server | `TOP`/`FETCH NEXT` |
| `"col"` cho MySQL | MySQL | `` `col` `` hoặc bật `ANSI_QUOTES` |
| `a \|\| b` cho concat ở MySQL | MySQL | `CONCAT` |
| `= NULL` mọi hệ | Tất cả | `IS NULL` |
| `NOT IN` có NULL | Tất cả | `NOT EXISTS` |
| `RETURNING` ở SQL Server | SQL Server | `OUTPUT` |
| `ON CONFLICT` ở MySQL | MySQL | `ON DUPLICATE KEY` |
| `MERGE` không unique | SQL Server | unique + transaction |
| `TINYINT(1)` tưởng là boolean | MySQL | quy ước 1/0, đặt tên `is_*` |
| `DATETIME` không timezone | MySQL/SQL Server | lưu UTC, cột hậu tố `_at` |
| `utf8` thay `utf8mb4` | MySQL | `utf8mb4` |
| `nvarchar` thiếu ở SQL Server | SQL Server | dùng `nvarchar` cho Unicode |
| `TRUNCATE` trong transaction | MySQL | dùng `DELETE` nếu cần rollback |
| `AUTOINCREMENT` sai chỗ | SQLite | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `EXPLAIN` không `ANALYZE` | Tất cả | thêm `ANALYZE` khi cần thời gian thật |
| Index leading wildcard | Tất cả | trigram/FTS |
| Offset sâu | Tất cả | keyset |
| `SELECT *` | Tất cả | liệt kê cột |

---

## 6. Bài tập tổng hợp

1. Viết query top 3 lời chúc mỗi khách cho cả 4 dialect.
2. Dedupe `messages` theo `(sender_name, content)`, giữ bản mới nhất.
3. Tính retention theo tháng của khách gửi lời chúc.
4. Tìm chuỗi ngày liên tiếp có ít nhất 5 lời chúc.
5. Viết upsert RSVP idempotent cho PostgreSQL và MySQL.
6. Viết query tìm khách có đủ tag `family` và `friends`.
7. Viết migration thêm soft delete + unique phone cho PostgreSQL và MySQL.
8. Viết keyset pagination cho feed, xử lý tie `created_at`.

### 6.1 Đáp án gợi ý

```sql
-- 1 (cả 4 hệ, window function)
WITH ranked AS (
  SELECT guest_id, content, created_at,
         row_number() OVER (PARTITION BY guest_id ORDER BY created_at DESC, id DESC) rn
  FROM messages
)
SELECT guest_id, content, created_at FROM ranked WHERE rn <= 3;

-- 2 (PostgreSQL)
WITH d AS (
  SELECT ctid, row_number() OVER (
    PARTITION BY sender_name, content ORDER BY created_at DESC, id DESC) rn
  FROM messages
)
DELETE FROM messages m USING d WHERE m.ctid = d.ctid AND d.rn > 1;

-- 3
WITH first_seen AS (
  SELECT guest_id, min(date_trunc('month', created_at)) AS cohort
  FROM messages GROUP BY guest_id
)
SELECT f.cohort, date_trunc('month', m.created_at) AS month,
       count(DISTINCT m.guest_id) AS active
FROM messages m JOIN first_seen f ON f.guest_id = m.guest_id
GROUP BY f.cohort, month ORDER BY f.cohort, month;

-- 4
WITH days AS (SELECT DISTINCT created_at::date AS day FROM messages),
g AS (SELECT day, day - row_number() OVER (ORDER BY day) * interval '1 day' AS grp FROM days)
SELECT min(day) AS start_day, max(day) AS end_day, count(*) AS len
FROM g GROUP BY grp HAVING count(*) >= 5;

-- 5 (PostgreSQL)
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES ($1,$2,$3)
ON CONFLICT (guest_id) DO UPDATE
SET will_attend = EXCLUDED.will_attend, number_attend = EXCLUDED.number_attend;

-- 5 (MySQL 8.0.20+)
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES (?, ?, ?) AS new
ON DUPLICATE KEY UPDATE
  will_attend = new.will_attend,
  number_attend = new.number_attend;

-- 6
SELECT m.id FROM messages m
JOIN message_tags mt ON mt.message_id = m.id
JOIN tags t ON t.id = mt.tag_id
WHERE t.name IN ('family','friends')
GROUP BY m.id HAVING count(DISTINCT t.name) = 2;

-- 7 (PostgreSQL)
ALTER TABLE guests ADD COLUMN deleted_at timestamptz;
CREATE UNIQUE INDEX uq_guests_phone_active ON guests (phone) WHERE deleted_at IS NULL;

-- 7 (MySQL 8.0.13+)
ALTER TABLE guests ADD COLUMN deleted_at datetime(6) NULL,
  ADD COLUMN phone_active varchar(20)
    GENERATED ALWAYS AS (IF(deleted_at IS NULL, phone, NULL)) STORED,
  ADD UNIQUE KEY uq_guests_phone_active (phone_active);

-- 8
SELECT id, content, created_at FROM messages
WHERE wedding_id = $1 AND deleted_at IS NULL
  AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC LIMIT 20;
```

---

## 7. Tài liệu tham khảo

**Chính thức:** [PostgreSQL](https://www.postgresql.org/docs/current/) ·
[MySQL 8.4](https://dev.mysql.com/doc/refman/8.4/en/) ·
[SQL Server](https://learn.microsoft.com/sql/) ·
[SQLite](https://www.sqlite.org/lang.html) · [Modern SQL](https://modern-sql.com/).

**Sách:** Markus Winand, *SQL Performance Explained* · Bill Karwin, *SQL Antipatterns* ·
Martin Kleppmann, *Designing Data-Intensive Applications*.

**Nội bộ:** [README](./README.md) · [fundamentals](./sql-fundamentals.md) ·
[advanced](./sql-advanced.md) · [postgresql-basics](../postgresql-basics.md) ·
[postgresql-advanced](../postgresql-advanced.md).
