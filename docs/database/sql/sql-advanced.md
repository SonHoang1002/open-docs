# SQL — Kiến thức nâng cao

> Tài liệu SQL nâng cao thực chiến: window function, CTE đệ quy, JSONB, full-text search,
> query planner, transaction/lock, partition, migration và các pattern vận hành. Ví dụ
> mặc định PostgreSQL 16+; khác dialect sẽ ghi rõ. Database mẫu: wedding.

> 📌 Đây là bộ **độc lập dialect**. Phần PostgreSQL chuyên sâu (EXPLAIN chi tiết, MVCC,
> bloat, VACUUM, RLS, HA, PITR) nằm ở
> [`../postgresql-advanced.md`](../postgresql-advanced.md). Tài liệu này bổ sung góc nhìn
> chuẩn SQL, so sánh dialect và pattern áp dụng được cho nhiều hệ.

---

## Mục lục

1. [Window functions](#1-window-functions)
2. [CTE và recursive CTE](#2-cte-và-recursive-cte)
3. [LATERAL và top-N per group](#3-lateral-và-top-n-per-group)
4. [Aggregate nâng cao](#4-aggregate-nâng-cao)
5. [Join và set operations nâng cao](#5-join-và-set-operations-nâng-cao)
6. [UPSERT và MERGE](#6-upsert-và-merge)
7. [JSON và JSONB](#7-json-và-jsonb)
8. [Array, range và kiểu nâng cao](#8-array-range-và-kiểu-nâng-cao)
9. [Full-text search](#9-full-text-search)
10. [Index nâng cao](#10-index-nâng-cao)
11. [Query planner và EXPLAIN](#11-query-planner-và-explain)
12. [Transaction nâng cao](#12-transaction-nâng-cao)
13. [Concurrency patterns](#13-concurrency-patterns)
14. [Partitioning và sharding](#14-partitioning-và-sharding)
15. [Replication và HA](#15-replication-và-ha)
16. [Function, procedure, trigger](#16-function-procedure-trigger)
17. [Bảo mật nâng cao](#17-bảo-mật-nâng-cao)
18. [Performance tuning](#18-performance-tuning)
19. [Data modeling nâng cao](#19-data-modeling-nâng-cao)
20. [Migration](#20-migration)
21. [Case study wedding](#21-case-study-wedding)
22. [Diagnostic cookbook](#22-diagnostic-cookbook)
23. [Anti-patterns nâng cao](#23-anti-patterns-nâng-cao)
24. [Bài tập](#24-bài-tập)
25. [Tài liệu tham khảo](#25-tài-liệu-tham-khảo)

---

## 1. Window functions

Window function tính toán trên một **cửa sổ** dòng liên quan nhưng **không gộp** dòng như
`GROUP BY`.

```sql
SELECT sender_name, created_at,
       row_number() OVER (ORDER BY created_at DESC) AS rn,
       count(*)     OVER ()                          AS total
FROM messages;
```

Cấu trúc: `function() OVER (PARTITION BY ... ORDER BY ... frame)`.

| Thành phần | Ý nghĩa |
|---|---|
| `PARTITION BY` | Chia nhóm độc lập; bỏ trống = toàn bộ kết quả |
| `ORDER BY` | Thứ tự trong cửa sổ |
| frame | Tập dòng con so với dòng hiện tại |

### 1.1 Xếp hạng

```sql
SELECT sender_name, created_at,
       row_number() OVER (PARTITION BY sender_name ORDER BY created_at DESC) AS rn,
       rank()       OVER (PARTITION BY sender_name ORDER BY created_at DESC) AS rnk,
       dense_rank() OVER (PARTITION BY sender_name ORDER BY created_at DESC) AS drnk,
       ntile(4)     OVER (ORDER BY created_at) AS quartile
FROM messages;
```

| Hàm | Khi trùng | Ví dụ |
|---|---|---|
| `ROW_NUMBER` | 1,2,3,4 (không trùng) | Phân trang ổn định |
| `RANK` | 1,2,2,4 (nhảy) | Bảng xếp hạng |
| `DENSE_RANK` | 1,2,2,3 (không nhảy) | Top N theo giá trị |
| `NTILE(n)` | Chia đều n bucket | Phân vị |

> ⚠️ `ROW_NUMBER` không xác định khi `ORDER BY` không duy nhất. Thêm cột tie-breaker
> (`id`) để kết quả ổn định.

### 1.2 LAG, LEAD

```sql
SELECT created_at::date AS day,
       count(*) AS total,
       lag(count(*))  OVER (ORDER BY created_at::date) AS prev_day,
       lead(count(*)) OVER (ORDER BY created_at::date) AS next_day,
       count(*) - lag(count(*)) OVER (ORDER BY created_at::date) AS delta
FROM messages
GROUP BY created_at::date
ORDER BY day;
```

`LAG(col, n, default)` lấy dòng trước `n` bước; `LEAD` lấy dòng sau.

### 1.3 Running total, moving average

```sql
SELECT day, daily,
       sum(daily) OVER (ORDER BY day
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running,
       avg(daily) OVER (ORDER BY day
                        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)        AS ma_7d
FROM (
  SELECT created_at::date AS day, count(*) AS daily
  FROM messages GROUP BY created_at::date
) d;
```

Frame mặc định khi có `ORDER BY` là `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
(gồm các dòng cùng giá trị). `ROWS` đếm theo dòng vật lý; `RANGE` theo giá trị. Khác biệt
quan trọng khi có tie.

### 1.4 FIRST_VALUE, LAST_VALUE, named window

```sql
SELECT sender_name, created_at,
       first_value(content) OVER w AS first_message,
       last_value(content)  OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
                                    AND UNBOUNDED FOLLOWING) AS last_message
FROM messages
WINDOW w AS (PARTITION BY sender_name ORDER BY created_at, id);
```

`LAST_VALUE` với frame mặc định chỉ tới dòng hiện tại — phải mở rộng frame như trên.
Named window (`WINDOW w AS ...`) giảm lặp khi nhiều hàm dùng cùng cửa sổ.

### 1.5 Top-N per group

```sql
WITH ranked AS (
  SELECT guest_id, content, created_at,
         row_number() OVER (PARTITION BY guest_id ORDER BY created_at DESC, id DESC) AS rn
  FROM messages
  WHERE deleted_at IS NULL
)
SELECT * FROM ranked WHERE rn <= 3;
```

Không lọc `rn` trong `WHERE` cùng cấp với window function — window chạy **sau** `WHERE`.
Dùng CTE/subquery.

---

## 2. CTE và recursive CTE

CTE (`WITH`) đặt tên cho subquery, tăng readability và cho phép tái sử dụng trong cùng
query.

```sql
WITH per_guest AS (
  SELECT guest_id, count(*) AS total
  FROM messages WHERE deleted_at IS NULL GROUP BY guest_id
),
ranked AS (
  SELECT g.full_name, p.total,
         rank() OVER (ORDER BY p.total DESC) AS rnk
  FROM per_guest p JOIN guests g ON g.id = p.guest_id
)
SELECT * FROM ranked WHERE rnk <= 10;
```

> 💡 PostgreSQL 12+ có thể inline CTE (không materialize) nếu chỉ dùng một lần và không
> có side effect. Đừng mặc định CTE nhanh hơn subquery; đọc plan.

### 2.1 Recursive CTE

```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name, 1 AS depth, ARRAY[id] AS path
  FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name, t.depth + 1, t.path || c.id
  FROM categories c JOIN tree t ON c.parent_id = t.id
  WHERE t.depth < 10
)
SELECT * FROM tree ORDER BY path;
```

Cấu trúc: anchor (`WHERE parent_id IS NULL`) `UNION ALL` recursive member tham chiếu
chính CTE. Luôn có điều kiện dừng (`depth < n`) để tránh vòng lặp vô hạn.

### 2.2 Cycle detection

```sql
-- PostgreSQL 14+: CYCLE
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name
  FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name
  FROM categories c JOIN tree t ON c.parent_id = t.id
) CYCLE id SET is_cycle USING path
SELECT * FROM tree WHERE NOT is_cycle;
```

Cách portable: giữ `path` array và `WHERE NOT c.id = ANY(t.path)`. Graph traversal tương
tự: thay `parent_id` bằng bảng cạnh `edges(src, dst)`; thêm `depth` để giới hạn.

---

## 3. LATERAL và top-N per group

`LATERAL` cho phép subquery bên phải tham chiếu bảng bên trái (như `CROSS APPLY` của SQL
Server).

```sql
SELECT g.id, g.full_name, m.content, m.created_at
FROM guests g
LEFT JOIN LATERAL (
  SELECT content, created_at
  FROM messages m
  WHERE m.guest_id = g.id AND m.deleted_at IS NULL
  ORDER BY m.created_at DESC, m.id DESC
  LIMIT 1
) m ON TRUE;
```

| Hệ | Cú pháp |
|---|---|
| PostgreSQL | `LEFT JOIN LATERAL (...) ON TRUE` |
| SQL Server | `CROSS APPLY` / `OUTER APPLY` |
| MySQL 8.0.14+ | `JOIN LATERAL (...)` (không có `LEFT JOIN LATERAL` trước 8.0.14) |
| SQLite | Không có LATERAL; dùng window function |

`CROSS APPLY` = inner, `OUTER APPLY` = left. Top-N per group với LATERAL thường nhanh khi
mỗi nhóm có index `(group_id, sort_col)` và N nhỏ.

---

## 4. Aggregate nâng cao

```sql
SELECT g.side, r.will_attend, count(*) AS total
FROM rsvps r JOIN guests g ON g.id = r.guest_id
GROUP BY GROUPING SETS ((g.side, r.will_attend), (g.side), ());
```

| Cấu trúc | Sinh ra |
|---|---|
| `ROLLUP (a,b)` | `(a,b)`, `(a)`, `()` |
| `CUBE (a,b)` | `(a,b)`, `(a)`, `(b)`, `()` |
| `GROUPING SETS (...)` | Đúng các tổ hợp liệt kê |

Dùng `GROUPING(col)` để phân biệt NULL thật với NULL do rollup:

```sql
SELECT g.side, r.will_attend, count(*),
       grouping(g.side) AS g_side, grouping(r.will_attend) AS g_attend
FROM rsvps r JOIN guests g ON g.id = r.guest_id
GROUP BY ROLLUP (g.side, r.will_attend);
```

`FILTER` lọc đầu vào aggregate:

```sql
SELECT count(*) FILTER (WHERE will_attend) AS attending,
       count(*) FILTER (WHERE NOT will_attend) AS declined
FROM rsvps;
```

`FILTER` kết hợp window:

```sql
SELECT created_at::date AS day,
       count(*) FILTER (WHERE will_attend) AS attending,
       sum(count(*) FILTER (WHERE will_attend))
         OVER (ORDER BY created_at::date) AS running_attending
FROM rsvps GROUP BY created_at::date;
```

Percentile (PostgreSQL, SQL Server `PERCENTILE_CONT`):

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY number_attend) AS median,
       percentile_cont(0.9) WITHIN GROUP (ORDER BY number_attend) AS p90
FROM rsvps WHERE will_attend;
```

MySQL 8.0 không có `percentile_cont`; dùng `PERCENT_RANK`/`CUME_DIST` hoặc tính thủ công.

---

## 5. Join và set operations nâng cao

```sql
-- Semi join
SELECT g.* FROM guests g
WHERE EXISTS (SELECT 1 FROM rsvps r WHERE r.guest_id = g.id AND r.will_attend);
-- Anti join
SELECT g.* FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM rsvps r WHERE r.guest_id = g.id);
-- Full outer diff: chỉ dòng không khớp ở một trong hai bên
SELECT coalesce(r.guest_id, m.guest_id) AS guest_id,
       r.id AS rsvp_id, m.id AS message_id
FROM rsvps r
FULL OUTER JOIN messages m ON m.guest_id = r.guest_id
WHERE r.id IS NULL OR m.id IS NULL;
-- Đối soát hai nguồn
SELECT id FROM staging_guests
EXCEPT
SELECT id FROM guests;
```

`EXCEPT`/`INTERSECT` loại trùng; nếu cần giữ trùng và đếm chênh lệch, dùng
`FULL OUTER JOIN` + `count(*)`. Anti-join bằng `NOT EXISTS` an toàn NULL hơn `NOT IN`.

---

## 6. UPSERT và MERGE

### 6.1 PostgreSQL: ON CONFLICT

```sql
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES ($1, $2, $3)
ON CONFLICT (guest_id) DO UPDATE
SET will_attend   = EXCLUDED.will_attend,
    number_attend = EXCLUDED.number_attend,
    updated_at    = now()
WHERE rsvps.will_attend IS DISTINCT FROM EXCLUDED.will_attend
   OR rsvps.number_attend IS DISTINCT FROM EXCLUDED.number_attend
RETURNING *;
```

`EXCLUDED` là dòng đề xuất insert. `ON CONFLICT ON CONSTRAINT uq_rsvps_guest` dùng tên
constraint. `DO NOTHING` khi chỉ cần idempotent.

### 6.2 MySQL, SQL Server, SQLite

```sql
-- MySQL 8.0.20+
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES (?, ?, ?) AS new
ON DUPLICATE KEY UPDATE
  will_attend = new.will_attend,
  number_attend = new.number_attend;
-- SQLite 3.24+
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES (?, ?, ?)
ON CONFLICT (guest_id) DO UPDATE SET will_attend = excluded.will_attend;
```

```sql
-- SQL Server: MERGE cần dấu ; kết thúc
MERGE rsvps AS t
USING (SELECT @guest_id AS guest_id, @will_attend AS will_attend) AS s
ON t.guest_id = s.guest_id
WHEN MATCHED THEN UPDATE SET will_attend = s.will_attend
WHEN NOT MATCHED THEN INSERT (guest_id, will_attend) VALUES (s.guest_id, s.will_attend);
```

> ⚠️ `MERGE` SQL Server có cạm bẫy kinh điển: race condition, trigger chạy nhiều lần,
> `WHEN NOT MATCHED` trùng nguồn. Với OLTP đơn giản, ưu tiên `UPDATE` rồi `INSERT` trong
> transaction + unique constraint, hoặc dùng `ON CONFLICT` nếu chuyển được PostgreSQL.

### 6.3 Race condition

Hai request cùng `SELECT` không thấy dòng, cùng `INSERT` → một bên lỗi unique. Cách xử
lý: (1) dựa vào unique constraint + `ON CONFLICT`, (2) retry lỗi duplicate, (3) advisory
lock theo `guest_id`.

---

## 7. JSON và JSONB

PostgreSQL có `json` (giữ nguyên text) và `jsonb` (nhị phân, index được). Luôn chọn
`jsonb` trừ khi cần giữ whitespace/thứ tự key. Ví dụ giả sử `messages` có cột `meta jsonb`.

```sql
SELECT meta->>'guest_of' AS side,
       meta->'campaign'->>'source' AS source
FROM messages
WHERE meta @> '{"tags": ["family"]}'::jsonb;
```

| Toán tử | Ý nghĩa |
|---|---|
| `->` | Lấy JSON (object/array) |
| `->>` | Lấy text |
| `#>` / `#>>` | Đường dẫn array |
| `@>` / `<@` | Containment |
| `?`, ?&#124;, `?&` | Key tồn tại |
| `jsonb_path_query` | JSONPath |

```sql
CREATE INDEX idx_messages_meta ON messages USING gin (meta jsonb_path_ops);
CREATE INDEX idx_messages_side ON messages ((meta->>'guest_of'));
```

`jsonb_path_ops` nhỏ và nhanh hơn cho `@>`; `jsonb_ops` hỗ trợ thêm `?`. Index biểu thức
cho truy vấn theo một key cụ thể.

**Khi nào dùng:** metadata thay đổi, payload từ webhook, cấu hình ít truy vấn. **Khi nào
không:** trường được JOIN/GROUP BY/sort thường xuyên, cần FK/constraint chặt — tách cột.

| Hệ | JSON |
|---|---|
| MySQL 8.0 | `JSON`, `JSON_EXTRACT`, `->>`, `JSON_TABLE` |
| SQL Server 2016+ | `nvarchar` + `ISJSON`, `JSON_VALUE`, `OPENJSON` |
| SQLite 3.38+ | `json_extract`, `json_each`, `->>` |

---

## 8. Array, range và kiểu nâng cao

```sql
-- Array (PostgreSQL), giả sử messages có cột tags text[]
SELECT ARRAY[1,2,3], tags[1], cardinality(tags), 'family' = ANY(tags)
FROM messages WHERE tags @> ARRAY['family'];

CREATE INDEX idx_messages_tags ON messages USING gin (tags);
-- Range
SELECT daterange('2025-01-01','2025-02-01','[)');
SELECT * FROM bookings
WHERE period && daterange('2025-01-10','2025-01-20','[)');
```

| Khái niệm | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Array | `int[]`, GIN | `JSON` array | JSON / bảng con | JSON text |
| Range | `daterange`, `tstzrange` | Không | Không | Không |
| Enum | `CREATE TYPE ... AS ENUM` | `ENUM(...)` | CHECK + lookup | CHECK |
| Network | `inet`, `cidr` | Không | Không | Không |

Range hữu ích cho đặt phòng/lịch; exclusion constraint `EXCLUDE USING gist (period WITH &&)`
ngăn chồng lấn. Với hệ khác, dùng cột `start_at`/`end_at` + kiểm tra trong transaction.

---

## 9. Full-text search

### 9.1 PostgreSQL

```sql
ALTER TABLE messages ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(content,''))) STORED;

CREATE INDEX idx_messages_search ON messages USING gin (search_tsv);

SELECT id, content, ts_rank(search_tsv, q) AS score
FROM messages, plainto_tsquery('simple', 'hạnh phúc') q
WHERE search_tsv @@ q
ORDER BY score DESC
LIMIT 20;

SELECT ts_headline('simple', content, plainto_tsquery('simple','hạnh phúc'))
FROM messages WHERE search_tsv @@ plainto_tsquery('simple','hạnh phúc');
```

`simple` không stemming/stopword — phù hợp tiếng Việt; `english` chỉ dùng cho văn bản
tiếng Anh. Với tiếng Việt, có thể chuẩn hoá dấu hoặc dùng extension `unaccent`.

### 9.2 MySQL, SQL Server

```sql
-- MySQL 8.0, InnoDB
ALTER TABLE messages ADD FULLTEXT INDEX ft_messages (content) WITH PARSER ngram;
SELECT id, MATCH(content) AGAINST ('hạnh phúc' IN NATURAL LANGUAGE MODE) AS score
FROM messages
WHERE MATCH(content) AGAINST ('hạnh phúc' IN NATURAL LANGUAGE MODE)
ORDER BY score DESC LIMIT 20;
-- SQL Server: cần Full-Text Index trên cột
SELECT id, content
FROM messages
WHERE CONTAINS(content, N'"hạnh phúc"');
```

| Nhu cầu | Cách làm |
|---|---|
| Ranking | `ts_rank`, `MATCH ... AGAINST`, `CONTAINSTABLE` |
| Highlight | `ts_headline`, xử lý ở app |
| Fuzzy/typo | `pg_trgm` + `similarity`, `SOUNDEX` |
| Autocomplete | Trigram GIN/GiST + `%` |
| Tìm kiếm lớn | OpenSearch/Elasticsearch, đồng bộ qua CDC |

> 💡 Full-text trong DB đủ cho vài triệu dòng. Vượt ngưỡng đó, tách search engine và
> chấp nhận eventual consistency.

---

## 10. Index nâng cao

### 10.1 Covering, partial, expression

```sql
-- Covering: cho phép index-only scan
CREATE INDEX idx_messages_feed_cover
  ON messages (wedding_id, created_at DESC) INCLUDE (sender_name);
-- Partial: chỉ index phần cần thiết
CREATE INDEX idx_messages_active
  ON messages (created_at DESC) WHERE deleted_at IS NULL;
-- Expression: tìm theo lower(email)
CREATE UNIQUE INDEX uq_guests_email_lower ON guests (lower(email));
```

| Loại | Dùng khi | Lưu ý |
|---|---|---|
| B-tree | So sánh, sort, prefix | Mặc định |
| Hash | Chỉ `=` | Ít dùng, không range |
| GIN | Array, JSONB, FTS | Ghi chậm, đọc nhanh |
| GiST | Range, geometry, fuzzy | Cân bằng |
| BRIN | Bảng rất lớn, dữ liệu theo thứ tự | Index cực nhỏ |

### 10.2 Composite order và selectivity

Index `(wedding_id, created_at DESC, id DESC)` phục vụ filter + sort + keyset. Đổi thứ
tự cột có thể làm index vô dụng. Selectivity = tỉ lệ dòng khớp; cột càng chọn lọc càng
đặt sớm (sau cột `=`).

**Index-only scan** cần `INCLUDE` đủ cột và bảng được vacuum sạch (visibility map). Nếu
`Heap Fetches` cao, chạy `VACUUM`.

**Bloat:** index phình do update/delete. Kiểm tra `pg_stat_user_indexes`, `pgstattuple`;
`REINDEX CONCURRENTLY` để dựng lại không chặn ghi. Index không dùng (`idx_scan = 0`) là
ứng viên xoá — nhưng kiểm tra cả mùa vụ/báo cáo.

---

## 11. Query planner và EXPLAIN

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM messages
WHERE wedding_id = 1 AND deleted_at IS NULL
ORDER BY created_at DESC LIMIT 20;
```

Đọc plan từ **trong ra**: node lá đọc bảng/index, node cha kết hợp. Các cột quan trọng:

| Cột | Ý nghĩa |
|---|---|
| `cost=start..total` | Chi phí ước lượng, không phải ms |
| `rows` | Số dòng ước lượng mỗi loop |
| `actual time` | Thời gian thực (chỉ với `ANALYZE`) |
| `loops` | Số lần node chạy |
| `Buffers: shared hit/read` | Cache hit vs đọc đĩa |
| `Heap Fetches` | Index-only scan phải đọc heap |

Scan type: `Seq Scan` (đọc cả bảng), `Index Scan` (theo index rồi heap), `Index Only
Scan`, `Bitmap Heap Scan` (nhiều dòng rải rác). Join: `Nested Loop` (phù hợp ít dòng),
`Hash Join` (bảng lớn không index), `Merge Join` (đã sort).

### 11.1 Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| `rows=1` nhưng `actual rows=100000` | Stats cũ | `ANALYZE table` |
| Index không dùng | Hàm trên cột | Expression index hoặc viết lại |
| Index không dùng | Implicit cast (`varchar` vs `int`) | Sửa kiểu/so sánh |
| `Seq Scan` bất thường | `OR`, `LIKE '%x'` | `UNION`, trigram index |
| Nested loop chậm | Ước lượng sai | Cập nhật stats, kiểm tra index |
| Plan đổi theo tham số | Generic plan | `plan_cache_mode`, viết lại |

`EXPLAIN` không chạy query; `EXPLAIN ANALYZE` **chạy thật** — cẩn thận với
`UPDATE`/`DELETE`, dùng transaction rollback.

---

## 12. Transaction nâng cao

### 12.1 Isolation và anomaly

| Anomaly | Mô tả |
|---|---|
| Dirty read | Đọc dữ liệu chưa commit |
| Non-repeatable read | Đọc cùng dòng hai lần ra khác |
| Phantom read | Cùng điều kiện, xuất hiện dòng mới |
| Lost update | Hai transaction ghi đè nhau |
| Write skew | Mỗi bên đọc rồi ghi dựa trên điều kiện chung |

| Mức | Dirty | Non-repeatable | Phantom | Write skew |
|---|---|---|---|---|
| `READ COMMITTED` | Không | Có thể | Có thể | Có thể |
| `REPEATABLE READ` | Không | Không | Không* | Có thể |
| `SERIALIZABLE` | Không | Không | Không | Không |

\* PostgreSQL snapshot; chuẩn SQL cho phép phantom ở RR.

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT count(*) FROM rsvps WHERE will_attend;
COMMIT;
```

### 12.2 MVCC và lock

PostgreSQL dùng MVCC: mỗi update tạo phiên bản mới, phiên bản cũ chờ vacuum. Hệ quả:
đọc không chặn ghi, nhưng bảng phình nếu vacuum không theo kịp.

Lock thường gặp: `FOR UPDATE` (khoá dòng), `FOR SHARE`, `LOCK TABLE` (nặng, tránh),
advisory lock (khoá ứng dụng). Deadlock xảy ra khi hai transaction giữ lock và chờ nhau;
DB phát hiện và huỷ một bên. Phòng tránh: khoá theo thứ tự nhất quán, transaction ngắn,
retry.

### 12.3 Retry pattern

```ts
async function withRetry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e) {
      const retryable = e.code === '40001' || e.code === '40P01';
      if (!retryable || i === attempts - 1) throw e;
      await new Promise(r => setTimeout(r, 50 * 2 ** i + Math.random() * 50));
    }
  }
}
```

`40001` = serialization failure, `40P01` = deadlock. Retry phải **idempotent**.

### 12.4 Optimistic vs pessimistic

| Cách | Cơ chế | Dùng khi |
|---|---|---|
| Optimistic | `version`/`updated_at` trong `WHERE` | Ít tranh chấp, web |
| Pessimistic | `SELECT ... FOR UPDATE` | Tranh chấp cao, nghiệp vụ chặt |

```sql
UPDATE rsvps SET number_attend = 3, version = version + 1
WHERE guest_id = 10 AND version = 7;   -- 0 dòng = conflict
```

---

## 13. Concurrency patterns

### 13.1 Queue với SKIP LOCKED

```sql
BEGIN;
SELECT id, payload FROM jobs
WHERE status = 'queued'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;

UPDATE jobs SET status = 'running', started_at = now() WHERE id = $1;
COMMIT;
```

Nhiều worker lấy job song song mà không chặn nhau. Luôn có cột `status`, `attempts`,
`locked_until` và job reclaim khi worker chết.

### 13.2 Advisory lock và idempotency

```sql
SELECT pg_try_advisory_lock(hashtext('rsvp:guest:10'));
SELECT count(*) FROM rsvps WHERE guest_id = 10;
SELECT pg_advisory_unlock(hashtext('rsvp:guest:10'));
```

Idempotency: dùng `request_id` unique + `ON CONFLICT DO NOTHING`; trả kết quả cũ nếu đã
xử lý.

```sql
INSERT INTO processed_requests (request_id, response)
VALUES ($1, $2)
ON CONFLICT (request_id) DO NOTHING
RETURNING request_id;
```

---

## 14. Partitioning và sharding

```sql
CREATE TABLE messages (
  id bigint NOT NULL,  -- PK (nếu có) phải gồm partition key
  wedding_id bigint NOT NULL,
  created_at timestamptz NOT NULL,
  content text
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2026_01 PARTITION OF messages
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE messages_2026_02 PARTITION OF messages
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

| Kiểu | Dùng khi |
|---|---|
| Range | Time-series, log, theo tháng/năm |
| List | Theo vùng, tenant, trạng thái |
| Hash | Phân tán đều, ít truy vấn theo range |

**Pruning:** query phải lọc trên cột partition key để planner bỏ partition. `EXPLAIN` thể
hiện `Append` chỉ các partition cần. **Maintenance:** tạo partition trước, drop/archive
partition cũ; index trên bảng cha tự áp dụng cho con.

**Sharding:** chia theo tenant/region khi một node không đủ. Phức tạp: cross-shard join,
transaction phân tán, rebalance. Chỉ shard khi vertical scaling + partition + replica
không đủ.

---

## 15. Replication và HA

| Khái niệm | Ý nghĩa |
|---|---|
| Streaming replication | Primary gửi WAL sang replica |
| Synchronous | Commit chờ replica xác nhận (an toàn hơn, chậm hơn) |
| Asynchronous | Commit ngay, replica trễ |
| Read replica | Scale đọc, chấp nhận lag |
| Failover | Promote replica khi primary chết |

**Replication lag** thường do mạng, replica yếu, hoặc transaction lớn. Ứng dụng đọc
replica phải chấp nhận dữ liệu cũ (read-your-writes không đảm bảo).

**CAP/BASE:** khi partition mạng, chọn Consistency hoặc Availability. Hệ thống thực tế
thường BASE (Basically Available, Soft state, Eventually consistent). Với nghiệp vụ
RSVP/thanh toán, ưu tiên consistency; với feed/analytics, eventual consistency chấp nhận
được.

---

## 16. Function, procedure, trigger

```sql
CREATE FUNCTION wedding_seats(p_wedding_id bigint)
RETURNS bigint LANGUAGE sql STABLE AS $$
  SELECT coalesce(sum(r.number_attend), 0)
  FROM rsvps r
  JOIN guests g ON g.id = r.guest_id
  JOIN invitations i ON i.guest_id = g.id
  WHERE i.wedding_id = p_wedding_id AND r.will_attend
$$;
```

**Khi nào dùng:** logic gần dữ liệu, batch lớn, bảo mật (security definer), trigger audit.
**Khi nào tránh:** business logic phức tạp (khó test/version), logic cần gọi API ngoài,
logic thay đổi thường xuyên.

```sql
CREATE TABLE audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  op text NOT NULL,
  row_pk text,
  old_data jsonb,
  new_data jsonb,
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

CREATE TRIGGER trg_messages_audit
AFTER INSERT OR UPDATE OR DELETE ON messages
FOR EACH ROW EXECUTE FUNCTION audit_messages();
```

Trigger chạy trong transaction của câu lệnh; lỗi trong trigger rollback cả câu lệnh. Giữ
trigger nhỏ, tránh gọi function nặng.

---

## 17. Bảo mật nâng cao

```sql
CREATE ROLE app_user NOLOGIN;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT ON messages TO app_user;
REVOKE UPDATE, DELETE ON messages FROM app_user;
-- Column privilege
GRANT SELECT (id, sender_name, content, created_at) ON messages TO app_read;
```

**Row Level Security:**

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_owner ON messages
  USING (guest_id = current_setting('app.guest_id', true)::bigint)
  WITH CHECK (guest_id = current_setting('app.guest_id', true)::bigint);
```

Ứng dụng set `SET LOCAL app.guest_id = '10'` trong transaction. RLS bảo vệ cả khi có
bug query; nhưng `BYPASSRLS` và owner cần kiểm soát.

**Security definer** chạy với quyền owner — chỉ dùng khi cần, đặt `search_path` cố định:

```sql
CREATE FUNCTION get_seats() RETURNS bigint
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT count(*) FROM rsvps WHERE will_attend
$$;
```

SQL injection: parameter hoá, whitelist identifier, least privilege, không nối chuỗi,
không log query chứa dữ liệu nhạy cảm. Kiểm tra định kỳ role thừa quyền và object
`PUBLIC`.

---

## 18. Performance tuning

**Quy trình 10 bước:**

1. Xác định query chậm từ log/APM (`pg_stat_statements`).
2. Đo baseline: thời gian, tần suất, số dòng.
3. `EXPLAIN (ANALYZE, BUFFERS)` — tìm node tốn nhất.
4. Kiểm tra index phù hợp và stats (`ANALYZE`).
5. Viết lại query: bỏ `SELECT *`, giảm subquery tương quan, dùng `EXISTS`.
6. Kiểm tra kiểu/cast, tránh hàm trên cột index.
7. Đo lại; so sánh plan và buffers.
8. Kiểm tra tác động ghi (index mới làm chậm insert).
9. Rollout có giám sát, feature flag nếu cần.
10. Ghi lại kết quả, thêm test hồi quy hiệu năng.

**Connection pooling:** mỗi connection PostgreSQL là một process; hàng nghìn connection
rất tốn. Dùng PgBouncer (transaction mode) hoặc pooler của Supabase. Pool size thường
`2 × CPU + spindle`, không phải càng lớn càng tốt.

**N+1:** ORM load 1 danh sách rồi query từng item. Sửa bằng `JOIN`, `IN` batch, hoặc
DataLoader.

**Keyset pagination:**

```sql
SELECT id, content, created_at
FROM messages
WHERE wedding_id = 1 AND deleted_at IS NULL
  AND (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

**Batch:** insert/update theo lô 500–1000; tránh transaction quá lớn gây WAL/bloat/lock.

---

## 19. Data modeling nâng cao

**SCD Type 2** (Slowly Changing Dimension): giữ lịch sử bằng `valid_from`/`valid_to` và
`is_current`.

```sql
CREATE TABLE guest_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id bigint NOT NULL,
  full_name varchar(80) NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  is_current boolean NOT NULL DEFAULT TRUE,
  EXCLUDE USING gist (guest_id WITH =, tstzrange(valid_from, valid_to) WITH &&)  -- cần btree_gist
);
```

**Soft delete:** `deleted_at` thay vì xoá; mọi query phải lọc. Cẩn thận unique constraint
— dùng partial unique index `WHERE deleted_at IS NULL` (PostgreSQL/SQLite) hoặc cột
`deleted_key`.

**Audit:** trigger hoặc CDC; lưu `old_data`/`new_data` JSONB, actor, thời điểm. Audit log
chỉ append, không update.

**Event sourcing:** lưu chuỗi event thay vì trạng thái; dựng lại state bằng replay. Phù hợp
khi cần audit đầy đủ/phân tích, nhưng phức tạp query và versioning event.

**Temporal data:** PostgreSQL `tstzrange` + exclusion constraint; SQL Server temporal
table (`SYSTEM_VERSIONED`); MySQL/MariaDB dùng trigger hoặc bảng history.

---

## 20. Migration

**Expand/contract (zero-downtime):**

1. **Expand:** thêm cột nullable, bảng mới, dual-write.
2. **Backfill:** theo batch, tránh lock lâu.
3. **Migrate reads:** chuyển dần, kiểm tra.
4. **Contract:** bỏ cột/trigger cũ sau khi chắc chắn.

```sql
-- Bước 1: thêm cột nullable vào bảng phẳng (gần như tức thời)
ALTER TABLE messages ADD COLUMN guest_id bigint;
CREATE INDEX CONCURRENTLY idx_messages_guest_new ON messages (guest_id);

-- Bước 2: backfill theo batch (PostgreSQL không có LIMIT trong UPDATE)
WITH batch AS (
  SELECT id FROM messages WHERE guest_id IS NULL
  LIMIT 1000 FOR UPDATE SKIP LOCKED
)
UPDATE messages m
SET guest_id = g.id
FROM batch b, guests g
WHERE m.id = b.id AND g.full_name = m.sender_name;
```

Lặp batch đến khi không còn dòng `guest_id IS NULL`, sau đó thêm FK `NOT VALID` rồi
`VALIDATE CONSTRAINT` để tránh quét bảng dưới lock mạnh. Khớp tên chỉ là heuristic;
production nên dùng phone/email đã chuẩn hoá.

**Quy tắc:** mỗi migration có rollback (hoặc forward-fix), idempotent, không phụ thuộc
dữ liệu production cụ thể. Không `ALTER TABLE` nặng trong giờ cao điểm. Dùng
`CREATE INDEX CONCURRENTLY` (không chạy trong transaction). Test trên bản sao có dữ liệu
thật.

**Versioning:** Flyway, Liquibase, Atlas, hoặc migration của framework. Không sửa
migration đã chạy production; tạo migration mới.

---

## 21. Case study wedding

### 21.1 Feed + keyset pagination

```sql
SELECT id, sender_name, content, created_at
FROM messages
WHERE wedding_id = $1 AND deleted_at IS NULL
  AND ($2::timestamptz IS NULL OR (created_at, id) < ($2, $3))
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Index `(wedding_id, created_at DESC, id DESC) WHERE deleted_at IS NULL` phục vụ cả
filter, sort và cursor. Trả `next_cursor = (created_at, id)` của dòng cuối.

### 21.2 Thống kê RSVP

```sql
SELECT g.side,
       count(DISTINCT g.id) AS invited,
       count(DISTINCT r.guest_id) AS responded,
       count(DISTINCT r.guest_id) FILTER (WHERE r.will_attend) AS attending,
       coalesce(sum(r.number_attend) FILTER (WHERE r.will_attend), 0) AS seats
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id
GROUP BY g.side;
```

### 21.3 Top người gửi và top ngày

```sql
SELECT sender_name, count(*) AS total
FROM messages WHERE wedding_id = $1 AND deleted_at IS NULL
GROUP BY sender_name ORDER BY total DESC, sender_name LIMIT 10;

SELECT created_at::date AS day, count(*) AS total
FROM messages WHERE wedding_id = $1 AND deleted_at IS NULL
GROUP BY created_at::date ORDER BY total DESC LIMIT 5;

SELECT coalesce(g.side, 'Không rõ') AS side, count(*) AS total
FROM messages m LEFT JOIN guests g ON g.id = m.guest_id
WHERE m.wedding_id = $1 AND m.deleted_at IS NULL
GROUP BY g.side ORDER BY total DESC;
```

### 21.4 Tìm kiếm + highlight

```sql
SELECT id, ts_headline('simple', content, q, 'MaxWords=20') AS snippet,
       ts_rank(search_tsv, q) AS score
FROM messages, plainto_tsquery('simple', $1) q
WHERE wedding_id = $2 AND deleted_at IS NULL AND search_tsv @@ q
ORDER BY score DESC LIMIT 20;
```

### 21.5 Realtime

Supabase Realtime phát thay đổi qua logical replication. Chỉ subscribe bảng cần thiết,
lọc theo `wedding_id`; không dựa vào realtime cho tính nhất quán (client vẫn cần refetch
khi reconnect). Với feed, có thể dùng `created_at` cursor + polling nhẹ thay vì realtime
cho mọi client.

---

## 22. Diagnostic cookbook

| Triệu chứng | Kiểm tra đầu tiên |
|---|---|
| Query chậm đột ngột | `EXPLAIN (ANALYZE, BUFFERS)`, stats, bloat |
| Không dùng index | Hàm trên cột, cast, leading wildcard, selectivity |
| Deadlock | Log `deadlock detected`, thứ tự khoá |
| Lock wait | `pg_locks`, `pg_stat_activity`, `wait_event` |
| Bảng phình | `pg_stat_user_tables`, `pgstattuple`, autovacuum |
| Replication lag | `pg_stat_replication`, WAL generate rate |
| Connection đầy | `pg_stat_activity`, pool size, idle in transaction |
| Disk đầy | WAL, log, bloat, archive |
| Autovacuum không chạy | `autovacuum_vacuum_scale_factor`, bảng lớn |
| Index không dùng | `pg_stat_user_indexes.idx_scan` |

```sql
SELECT pid, state, wait_event_type, wait_event,
       now() - query_start AS duration, left(query, 100)
FROM pg_stat_activity
WHERE state <> 'idle'
ORDER BY duration DESC;
```

---

## 23. Anti-patterns nâng cao

| Anti-pattern | Vấn đề | Cách sửa |
|---|---|---|
| Index mọi cột | Ghi chậm, planner loạn | Index theo workload |
| `SELECT *` + ORM N+1 | Băng thông, nhiều round-trip | Chọn cột, batch |
| `OFFSET` sâu | Chậm tuyến tính | Keyset |
| Transaction dài | Bloat, lock, replication lag | Chia batch |
| `SERIALIZABLE` mọi nơi | Retry nhiều | Chọn mức phù hợp |
| Tin CTE luôn nhanh | Materialize ngoài ý muốn | Đọc plan |
| JSONB cho mọi thứ | Mất constraint, query chậm | Cột thật khi cần |
| Trigger business logic | Khó test/version | Logic ở app |
| `MERGE` không test race | Mất/trùng dữ liệu | Unique + retry |
| Partition không pruning | Scan mọi partition | Lọc theo key |
| Migration không rollback | Kẹt khi lỗi | Expand/contract |
| Khoá theo thứ tự khác nhau | Deadlock | Thứ tự nhất quán |

---

## 24. Bài tập

1. Tính running total số lời chúc theo ngày, mỗi đám cưới riêng.
2. Top 3 lời chúc mới nhất của mỗi khách.
3. Tìm khách chưa RSVP bằng `NOT EXISTS`; so sánh plan với `NOT IN`.
4. Viết recursive CTE duyệt cây `categories`, phát hiện cycle.
5. Upsert RSVP idempotent, chỉ update khi dữ liệu đổi.
6. Tìm lời chúc chứa "hạnh phúc" bằng FTS, sắp theo rank.
7. Thiết kế index cho feed `(wedding_id, created_at DESC, id DESC)` và giải thích.
8. Viết migration thêm `guest_id` nullable + backfill batch + index concurrent.

### 24.1 Đáp án gợi ý

```sql
-- 1
SELECT wedding_id, created_at::date AS day, count(*) AS daily,
       sum(count(*)) OVER (PARTITION BY wedding_id ORDER BY created_at::date) AS running
FROM messages WHERE deleted_at IS NULL
GROUP BY wedding_id, created_at::date ORDER BY wedding_id, day;
-- 2
WITH r AS (
  SELECT guest_id, content, created_at,
         row_number() OVER (PARTITION BY guest_id ORDER BY created_at DESC, id DESC) rn
  FROM messages WHERE deleted_at IS NULL
) SELECT * FROM r WHERE rn <= 3;
-- 3
SELECT g.id FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM rsvps r WHERE r.guest_id = g.id);
-- 4
WITH RECURSIVE t AS (
  SELECT id, parent_id, ARRAY[id] path FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, t.path || c.id
  FROM categories c JOIN t ON c.parent_id = t.id
  WHERE NOT c.id = ANY(t.path)
) SELECT * FROM t;
-- 5
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES ($1,$2,$3)
ON CONFLICT (guest_id) DO UPDATE
SET will_attend = EXCLUDED.will_attend, number_attend = EXCLUDED.number_attend
WHERE (rsvps.will_attend, rsvps.number_attend)
   IS DISTINCT FROM (EXCLUDED.will_attend, EXCLUDED.number_attend);
-- 6
SELECT id, ts_rank(search_tsv, q) score
FROM messages, plainto_tsquery('simple','hạnh phúc') q
WHERE search_tsv @@ q ORDER BY score DESC LIMIT 20;
-- 7
CREATE INDEX idx_feed ON messages (wedding_id, created_at DESC, id DESC)
WHERE deleted_at IS NULL;
-- filter + sort + keyset trong một index; tránh sort riêng.
-- 8
ALTER TABLE messages ADD COLUMN guest_id bigint;
CREATE INDEX CONCURRENTLY idx_messages_guest_new ON messages (guest_id);
-- backfill theo batch với CTE + SKIP LOCKED, sau đó thêm FK NOT VALID rồi VALIDATE.
```

---

## 25. Tài liệu tham khảo

**Sách:** Markus Winand, *SQL Performance Explained* · Itzik Ben-Gan, *T-SQL Window
Functions* · Bill Karwin, *SQL Antipatterns* · Martin Kleppmann, *Designing Data-Intensive
Applications*.

**Chính thức:** [PostgreSQL](https://www.postgresql.org/docs/current/) ·
[MySQL](https://dev.mysql.com/doc/refman/8.4/en/) ·
[SQL Server](https://learn.microsoft.com/sql/) ·
[SQLite](https://www.sqlite.org/lang.html) · [Use The Index, Luke](https://use-the-index-luke.com/).

**Nội bộ:** [README](./README.md) · [fundamentals](./sql-fundamentals.md) ·
[dialects](./sql-dialects-and-patterns.md) ·
[postgresql-basics](../postgresql-basics.md) ·
[postgresql-advanced](../postgresql-advanced.md).
