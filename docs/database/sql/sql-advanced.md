# SQL — Kiến thức nâng cao

> Tài liệu SQL nâng cao thực chiến: window function, CTE đệ quy, JSONB, full-text search,
> query planner, transaction/lock, partition, migration và các pattern vận hành. Ví dụ
> mặc định PostgreSQL 16+; khác dialect sẽ ghi rõ. Database mẫu: thương mại điện tử
> (`customers`, `products`, `orders`, `order_items`, `payments`, `shipments`).
>
> Quy ước: ID UUID/ULID, tiền integer minor units, thời gian `timestamptz` UTC.

> 📌 Đây là bộ **độc lập dialect**. Phần PostgreSQL chuyên sâu (EXPLAIN chi tiết, MVCC,
> bloat, VACUUM, RLS, HA, PITR) nằm ở
> [`../postgres-sql/postgresql-advanced.md`](../postgres-sql/postgresql-advanced.md).
> Tài liệu này bổ sung góc nhìn chuẩn SQL, so sánh dialect và pattern áp dụng được cho
> nhiều hệ.

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
21. [Case study thương mại điện tử](#21-case-study-thương-mại-điện-tử)
22. [Diagnostic cookbook](#22-diagnostic-cookbook)
23. [Anti-patterns nâng cao](#23-anti-patterns-nâng-cao)
24. [Bài tập](#24-bài-tập)
25. [Tài liệu tham khảo](#25-tài-liệu-tham-khảo)
26. [Schema orders chuyên sâu](#26-schema-orders-chuyên-sâu)
27. [Runbook sự cố & checklist review](#27-runbook-sự-cố--checklist-review)

---

## 1. Window functions

Window function tính toán trên một **cửa sổ** dòng liên quan nhưng **không gộp** dòng như
`GROUP BY`.

```sql
SELECT customer_id, placed_at,
       row_number() OVER (ORDER BY placed_at DESC) AS rn,
       count(*)     OVER ()                        AS total
FROM orders;
```

Cấu trúc: `function() OVER (PARTITION BY ... ORDER BY ... frame)`.

| Thành phần | Ý nghĩa |
|---|---|
| `PARTITION BY` | Chia nhóm độc lập; bỏ trống = toàn bộ kết quả |
| `ORDER BY` | Thứ tự trong cửa sổ |
| frame | Tập dòng con so với dòng hiện tại |

### 1.1 Xếp hạng

```sql
SELECT customer_id, placed_at,
       row_number() OVER (PARTITION BY customer_id ORDER BY placed_at DESC) AS rn,
       rank()       OVER (PARTITION BY customer_id ORDER BY placed_at DESC) AS rnk,
       dense_rank() OVER (PARTITION BY customer_id ORDER BY placed_at DESC) AS drnk,
       ntile(4)     OVER (ORDER BY placed_at) AS quartile
FROM orders;
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
SELECT placed_at::date AS day,
       count(*) AS total,
       lag(count(*))  OVER (ORDER BY placed_at::date) AS prev_day,
       lead(count(*)) OVER (ORDER BY placed_at::date) AS next_day,
       count(*) - lag(count(*)) OVER (ORDER BY placed_at::date) AS delta
FROM orders
GROUP BY placed_at::date
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
  SELECT placed_at::date AS day, count(*) AS daily
  FROM orders GROUP BY placed_at::date
) d;
```

Frame mặc định khi có `ORDER BY` là `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
(gồm các dòng cùng giá trị). `ROWS` đếm theo dòng vật lý; `RANGE` theo giá trị. Khác biệt
quan trọng khi có tie.

### 1.4 FIRST_VALUE, LAST_VALUE, named window

```sql
SELECT customer_id, placed_at,
       first_value(total_minor) OVER w AS first_total,
       last_value(total_minor)  OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
                                         AND UNBOUNDED FOLLOWING) AS last_total
FROM orders
WINDOW w AS (PARTITION BY customer_id ORDER BY placed_at, id);
```

`LAST_VALUE` với frame mặc định chỉ tới dòng hiện tại — phải mở rộng frame như trên.
Named window (`WINDOW w AS ...`) giảm lặp khi nhiều hàm dùng cùng cửa sổ.

### 1.5 Top-N per group

```sql
WITH ranked AS (
  SELECT order_id, product_id, quantity, line_total_minor,
         row_number() OVER (PARTITION BY order_id
                            ORDER BY line_total_minor DESC, product_id) AS rn
  FROM order_items
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
WITH per_customer AS (
  SELECT customer_id, count(*) AS total
  FROM orders WHERE deleted_at IS NULL GROUP BY customer_id
),
ranked AS (
  SELECT c.full_name, p.total,
         rank() OVER (ORDER BY p.total DESC) AS rnk
  FROM per_customer p JOIN customers c ON c.id = p.customer_id
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

### 2.3 CTE cho pipeline dữ liệu

```sql
WITH new_orders AS (
  INSERT INTO orders (customer_id, status, total_minor)
  VALUES ($1, 'pending', $2)
  RETURNING id, customer_id
),
items AS (
  INSERT INTO order_items (order_id, product_id, quantity, unit_price_minor)
  SELECT o.id, v.product_id, v.quantity, v.unit_price_minor
  FROM new_orders o
  CROSS JOIN (VALUES ($3::uuid, $4::int, $5::bigint)) AS v(product_id, quantity, unit_price_minor)
  RETURNING order_id, line_total_minor
)
SELECT o.id, sum(i.line_total_minor) AS items_total
FROM new_orders o JOIN items i ON i.order_id = o.id
GROUP BY o.id;
```

Data-modifying CTE chạy trong cùng câu lệnh/transaction; hữu ích để trả kết quả sau khi
ghi, nhưng đừng lạm dụng vì khó đọc và khó debug hơn transaction tuần tự.

---

## 3. LATERAL và top-N per group

`LATERAL` cho phép subquery bên phải tham chiếu bảng bên trái (như `CROSS APPLY` của SQL
Server).

```sql
SELECT c.id, c.full_name, o.id AS last_order_id, o.placed_at
FROM customers c
LEFT JOIN LATERAL (
  SELECT id, placed_at
  FROM orders o
  WHERE o.customer_id = c.id AND o.deleted_at IS NULL
  ORDER BY o.placed_at DESC, o.id DESC
  LIMIT 1
) o ON TRUE;
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
SELECT o.status, p.status, count(*) AS total
FROM orders o JOIN payments p ON p.order_id = o.id
GROUP BY GROUPING SETS ((o.status, p.status), (o.status), ());
```

| Cấu trúc | Sinh ra |
|---|---|
| `ROLLUP (a,b)` | `(a,b)`, `(a)`, `()` |
| `CUBE (a,b)` | `(a,b)`, `(a)`, `(b)`, `()` |
| `GROUPING SETS (...)` | Đúng các tổ hợp liệt kê |

Dùng `GROUPING(col)` để phân biệt NULL thật với NULL do rollup:

```sql
SELECT o.status, p.status, count(*),
       grouping(o.status) AS g_status, grouping(p.status) AS g_payment
FROM orders o JOIN payments p ON p.order_id = o.id
GROUP BY ROLLUP (o.status, p.status);
```

`FILTER` lọc đầu vào aggregate:

```sql
SELECT count(*) FILTER (WHERE status = 'paid')     AS paid,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled
FROM orders;
```

`FILTER` kết hợp window:

```sql
SELECT placed_at::date AS day,
       count(*) FILTER (WHERE status = 'paid') AS paid,
       sum(count(*) FILTER (WHERE status = 'paid'))
         OVER (ORDER BY placed_at::date) AS running_paid
FROM orders GROUP BY placed_at::date;
```

Percentile (PostgreSQL, SQL Server `PERCENTILE_CONT`):

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY total_minor) AS median,
       percentile_cont(0.9) WITHIN GROUP (ORDER BY total_minor) AS p90
FROM orders WHERE status = 'paid';
```

MySQL 8.0 không có `percentile_cont`; dùng `PERCENT_RANK`/`CUME_DIST` hoặc tính thủ công.

---

## 5. Join và set operations nâng cao

```sql
-- Semi join
SELECT c.* FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid');
-- Anti join
SELECT c.* FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
-- Full outer diff: chỉ dòng không khớp ở một trong hai bên
SELECT coalesce(p.order_id, s.order_id) AS order_id,
       p.id AS payment_id, s.id AS shipment_id
FROM payments p
FULL OUTER JOIN shipments s ON s.order_id = p.order_id
WHERE p.id IS NULL OR s.id IS NULL;
-- Đối soát hai nguồn
SELECT id FROM staging_orders
EXCEPT
SELECT id FROM orders;
```

`EXCEPT`/`INTERSECT` loại trùng; nếu cần giữ trùng và đếm chênh lệch, dùng
`FULL OUTER JOIN` + `count(*)`. Anti-join bằng `NOT EXISTS` an toàn NULL hơn `NOT IN`.

### 5.1 Join strategy: nested loop, hash, merge

| Chiến lược | Phù hợp | Rủi ro |
|---|---|---|
| Nested Loop | Bảng ngoài nhỏ, bảng trong có index | `loops` lớn + node trong đắt |
| Hash Join | Bảng lớn, không index, join equality | Tràn đĩa nếu `work_mem` thấp |
| Merge Join | Hai bên đã sort hoặc có index sort | Sort ban đầu tốn kém |

Viết SQL không ép được join strategy, nhưng index và statistic quyết định. Nếu thấy
Nested Loop với `loops=1.000.000`, kiểm tra ước lượng `rows` và index của bảng trong.

---

## 6. UPSERT và MERGE

### 6.1 PostgreSQL: ON CONFLICT

```sql
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (provider, provider_ref) DO UPDATE
SET status       = EXCLUDED.status,
    amount_minor = EXCLUDED.amount_minor,
    updated_at   = now()
WHERE payments.status IS DISTINCT FROM EXCLUDED.status
   OR payments.amount_minor IS DISTINCT FROM EXCLUDED.amount_minor
RETURNING *;
```

`EXCLUDED` là dòng đề xuất insert. `ON CONFLICT ON CONSTRAINT uq_payments_provider_ref`
dùng tên constraint. `DO NOTHING` khi chỉ cần idempotent.

### 6.2 MySQL, SQL Server, SQLite

```sql
-- MySQL 8.0.20+
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES (?, ?, ?, ?, ?, ?) AS new
ON DUPLICATE KEY UPDATE
  status = new.status,
  amount_minor = new.amount_minor;
-- SQLite 3.24+
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT (provider, provider_ref) DO UPDATE SET status = excluded.status;
```

```sql
-- SQL Server: MERGE cần dấu ; kết thúc
MERGE payments AS t
USING (SELECT @order_id AS order_id, @provider AS provider,
              @provider_ref AS provider_ref, @status AS status) AS s
ON t.provider = s.provider AND t.provider_ref = s.provider_ref
WHEN MATCHED THEN UPDATE SET status = s.status
WHEN NOT MATCHED THEN INSERT (order_id, provider, provider_ref, status)
VALUES (s.order_id, s.provider, s.provider_ref, s.status);
```

> ⚠️ `MERGE` SQL Server có cạm bẫy kinh điển: race condition, trigger chạy nhiều lần,
> `WHEN NOT MATCHED` trùng nguồn. Với OLTP đơn giản, ưu tiên `UPDATE` rồi `INSERT` trong
> transaction + unique constraint, hoặc dùng `ON CONFLICT` nếu chuyển được PostgreSQL.

### 6.3 Race condition

Hai request cùng `SELECT` không thấy dòng, cùng `INSERT` → một bên lỗi unique. Cách xử
lý: (1) dựa vào unique constraint + `ON CONFLICT`, (2) retry lỗi duplicate, (3) advisory
lock theo `order_id`.

### 6.4 Idempotency cho webhook thanh toán

Webhook có thể gửi lại. Luôn lưu `(provider, provider_ref)` unique và xử lý trong
transaction:

```sql
BEGIN;
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES ($1, $2, $3, $4, $5, 'captured')
ON CONFLICT (provider, provider_ref) DO NOTHING;

UPDATE orders SET status = 'paid', updated_at = now()
WHERE id = $1 AND status = 'pending';
COMMIT;
```

Nếu payment đã tồn tại, `DO NOTHING` giữ nguyên; cập nhật order idempotent vì `WHERE`
trạng thái cũ.

---

## 7. JSON và JSONB

PostgreSQL có `json` (giữ nguyên text) và `jsonb` (nhị phân, index được). Luôn chọn
`jsonb` trừ khi cần giữ whitespace/thứ tự key. Ví dụ `orders` có cột `metadata jsonb`.

```sql
SELECT metadata->>'source' AS source,
       metadata->'campaign'->>'name' AS campaign
FROM orders
WHERE metadata @> '{"channel": "web"}'::jsonb;
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
CREATE INDEX idx_orders_metadata ON orders USING gin (metadata jsonb_path_ops);
CREATE INDEX idx_orders_channel ON orders ((metadata->>'channel'));
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

### 7.1 Cập nhật JSONB atomic

```sql
UPDATE orders
SET metadata = metadata || jsonb_build_object('risk_score', 42)
WHERE id = $1;

UPDATE orders
SET metadata = jsonb_set(metadata, '{shipping,note}', '"Giao giờ hành chính"', true)
WHERE id = $1;
```

> ⚠️ Đừng đọc JSONB lên app, sửa rồi ghi lại nếu có concurrent update — dễ mất dữ liệu.
> Dùng toán tử atomic trong SQL hoặc khoá dòng `FOR UPDATE`.

---

## 8. Array, range và kiểu nâng cao

```sql
-- Array (PostgreSQL), ví dụ products có cột tags text[]
SELECT ARRAY[1,2,3], tags[1], cardinality(tags), 'sale' = ANY(tags)
FROM products WHERE tags @> ARRAY['sale'];

CREATE INDEX idx_products_tags ON products USING gin (tags);
-- Range
SELECT daterange('2025-01-01','2025-02-01','[)');
SELECT * FROM promotions
WHERE period && daterange('2025-01-10','2025-01-20','[)');
```

| Khái niệm | PostgreSQL | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| Array | `int[]`, GIN | `JSON` array | JSON / bảng con | JSON text |
| Range | `daterange`, `tstzrange` | Không | Không | Không |
| Enum | `CREATE TYPE ... AS ENUM` | `ENUM(...)` | CHECK + lookup | CHECK |
| Network | `inet`, `cidr` | Không | Không | Không |

Range hữu ích cho khuyến mãi/đặt lịch; exclusion constraint
`EXCLUDE USING gist (period WITH &&)` ngăn chồng lấn. Với hệ khác, dùng cột
`start_at`/`end_at` + kiểm tra trong transaction.

---

## 9. Full-text search

### 9.1 PostgreSQL

```sql
ALTER TABLE products ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))
  ) STORED;

CREATE INDEX idx_products_search ON products USING gin (search_tsv);

SELECT id, name, ts_rank(search_tsv, q) AS score
FROM products, plainto_tsquery('simple', 'tai nghe') q
WHERE search_tsv @@ q
ORDER BY score DESC
LIMIT 20;

SELECT ts_headline('simple', description, plainto_tsquery('simple','tai nghe'))
FROM products WHERE search_tsv @@ plainto_tsquery('simple','tai nghe');
```

`simple` không stemming/stopword — phù hợp tiếng Việt; `english` chỉ dùng cho văn bản
tiếng Anh. Với tiếng Việt, có thể chuẩn hoá dấu hoặc dùng extension `unaccent`.

### 9.2 MySQL, SQL Server

```sql
-- MySQL 8.0, InnoDB
ALTER TABLE products ADD FULLTEXT INDEX ft_products (name, description) WITH PARSER ngram;
SELECT id, MATCH(name, description) AGAINST ('tai nghe' IN NATURAL LANGUAGE MODE) AS score
FROM products
WHERE MATCH(name, description) AGAINST ('tai nghe' IN NATURAL LANGUAGE MODE)
ORDER BY score DESC LIMIT 20;
-- SQL Server: cần Full-Text Index trên cột
SELECT id, name
FROM products
WHERE CONTAINS(name, N'"tai nghe"');
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
CREATE INDEX idx_orders_feed_cover
  ON orders (status, placed_at DESC) INCLUDE (customer_id, total_minor);
-- Partial: chỉ index phần cần thiết
CREATE INDEX idx_orders_active
  ON orders (placed_at DESC) WHERE deleted_at IS NULL;
-- Expression: tìm theo lower(email)
CREATE UNIQUE INDEX uq_customers_email_lower ON customers (lower(email));
```

| Loại | Dùng khi | Lưu ý |
|---|---|---|
| B-tree | So sánh, sort, prefix | Mặc định |
| Hash | Chỉ `=` | Ít dùng, không range |
| GIN | Array, JSONB, FTS | Ghi chậm, đọc nhanh |
| GiST | Range, geometry, fuzzy | Cân bằng |
| BRIN | Bảng rất lớn, dữ liệu theo thứ tự | Index cực nhỏ |

### 10.2 Composite order và selectivity

Index `(status, placed_at DESC, id DESC)` phục vụ filter + sort + keyset. Đổi thứ tự cột
có thể làm index vô dụng. Selectivity = tỉ lệ dòng khớp; cột càng chọn lọc càng đặt sớm
(sau cột `=`).

**Index-only scan** cần `INCLUDE` đủ cột và bảng được vacuum sạch (visibility map). Nếu
`Heap Fetches` cao, chạy `VACUUM`.

**Bloat:** index phình do update/delete. Kiểm tra `pg_stat_user_indexes`, `pgstattuple`;
`REINDEX CONCURRENTLY` để dựng lại không chặn ghi. Index không dùng (`idx_scan = 0`) là
ứng viên xoá — nhưng kiểm tra cả mùa vụ/báo cáo.

### 10.3 Index cho truy vấn nhiều điều kiện optional

Với filter optional, đừng tạo index cho mọi tổ hợp. Chọn index theo truy vấn phổ biến
nhất và viết query động:

```sql
-- Chỉ dùng index (status, placed_at) khi status có giá trị
SELECT id, total_minor FROM orders
WHERE ($1::text IS NULL OR status = $1)
  AND placed_at >= $2
ORDER BY placed_at DESC LIMIT 20;
```

Nếu `$1` NULL, điều kiện `status` không lọc được nhưng vẫn có thể dùng index
`(placed_at)`; planner phụ thuộc statistic và generic plan. Đo cả hai trường hợp.

---

## 11. Query planner và EXPLAIN

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM orders
WHERE status = 'paid' AND deleted_at IS NULL
ORDER BY placed_at DESC LIMIT 20;
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

### 11.2 Đọc plan theo mục tiêu

- **Latency thấp:** tìm node có `actual time` cao nhất; giảm `loops` hoặc thêm index.
- **I/O cao:** `Buffers: read` lớn; kiểm tra cache, index selectivity, `effective_cache_size`.
- **CPU cao:** `Rows Removed by Filter` lớn; index chưa đúng hoặc điều kiện không sargable.
- **Tràn đĩa:** `Sort Method: external merge Disk` hoặc `Batches > 1`; tăng `work_mem`
  cục bộ hoặc thêm index sort.

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
SELECT count(*) FROM orders WHERE status = 'paid';
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
UPDATE orders SET status = 'paid', version = version + 1
WHERE id = $1 AND version = $2;   -- 0 dòng = conflict
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
SELECT pg_try_advisory_lock(hashtext('order:payment:' || $1));
SELECT count(*) FROM payments WHERE order_id = $1;
SELECT pg_advisory_unlock(hashtext('order:payment:' || $1));
```

Idempotency: dùng `request_id` unique + `ON CONFLICT DO NOTHING`; trả kết quả cũ nếu đã
xử lý.

```sql
INSERT INTO processed_requests (request_id, response)
VALUES ($1, $2)
ON CONFLICT (request_id) DO NOTHING
RETURNING request_id;
```

### 13.3 State machine cho đơn hàng

Không cho phép nhảy trạng thái tuỳ ý. Cập nhật có điều kiện để chống race:

```sql
UPDATE orders
SET status = 'paid', updated_at = now()
WHERE id = $1 AND status = 'pending'
RETURNING id, status;
```

Nếu 0 dòng, đơn đã ở trạng thái khác — trả conflict thay vì ghi đè. Với luồng phức tạp,
lưu `order_status_history(order_id, from_status, to_status, changed_at, actor)`.

---

## 14. Partitioning và sharding

```sql
CREATE TABLE orders (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  status      text NOT NULL,
  total_minor bigint NOT NULL,
  placed_at   timestamptz NOT NULL,
  PRIMARY KEY (id, placed_at)   -- PK phải chứa partition key
) PARTITION BY RANGE (placed_at);

CREATE TABLE orders_2026_01 PARTITION OF orders
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE orders_2026_02 PARTITION OF orders
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

### 14.1 Partition và unique constraint

`UNIQUE`/`PRIMARY KEY` trên bảng partitioned phải chứa partition key. Vì vậy
`orders(id)` đơn thuần không thể là PK nếu partition theo `placed_at`; dùng
`(id, placed_at)` hoặc giữ bảng không partition. Đây là trade-off phải quyết trước khi
partition.

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
thường BASE (Basically Available, Soft state, Eventually consistent). Với thanh toán/đơn
hàng, ưu tiên consistency; với feed/analytics, eventual consistency chấp nhận được.

### 15.1 Backup/restore trong bối cảnh replication

Replication **không phải backup**: replica nhận lệnh xoá/hỏng dữ liệu ngay. Cần backup
logic (`pg_dump`) hoặc vật lý + WAL archiving (PITR). Kiểm tra định kỳ:

```bash
pg_dump -Fc -f /backup/shop_$(date +%F).dump shop
pg_restore -d shop_restore_test /backup/shop_2026-10-30.dump
```

Đo RPO/RTO thật bằng restore drill, không chỉ đọc cấu hình.

---

## 16. Function, procedure, trigger

```sql
CREATE FUNCTION order_revenue(p_from timestamptz, p_to timestamptz)
RETURNS bigint LANGUAGE sql STABLE AS $$
  SELECT coalesce(sum(total_minor), 0)
  FROM orders
  WHERE status IN ('paid','fulfilled')
    AND placed_at >= p_from AND placed_at < p_to
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

CREATE FUNCTION audit_orders() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO audit_log (table_name, op, row_pk, old_data, new_data)
  VALUES ('orders', TG_OP, coalesce(NEW.id, OLD.id)::text,
          to_jsonb(OLD), to_jsonb(NEW));
  RETURN coalesce(NEW, OLD);
END $$;

CREATE TRIGGER trg_orders_audit
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_orders();
```

Trigger chạy trong transaction của câu lệnh; lỗi trong trigger rollback cả câu lệnh. Giữ
trigger nhỏ, tránh gọi function nặng.

---

## 17. Bảo mật nâng cao

```sql
CREATE ROLE app_user NOLOGIN;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT ON orders TO app_user;
REVOKE UPDATE, DELETE ON orders FROM app_user;
-- Column privilege
GRANT SELECT (id, customer_id, status, total_minor, placed_at) ON orders TO app_read;
```

**Row Level Security (tính năng PostgreSQL):**

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY orders_customer_isolation ON orders
  USING (customer_id = current_setting('app.customer_id', true)::uuid)
  WITH CHECK (customer_id = current_setting('app.customer_id', true)::uuid);
```

Ứng dụng set `SET LOCAL app.customer_id = '...'` trong transaction. RLS bảo vệ cả khi có
bug query; nhưng `BYPASSRLS` và owner cần kiểm soát. RLS là tính năng của PostgreSQL,
không gắn với dịch vụ/framework cụ thể nào.

**Security definer** chạy với quyền owner — chỉ dùng khi cần, đặt `search_path` cố định:

```sql
CREATE FUNCTION get_revenue() RETURNS bigint
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT count(*) FROM orders WHERE status = 'paid'
$$;
```

SQL injection: parameter hoá, whitelist identifier, least privilege, không nối chuỗi,
không log query chứa dữ liệu nhạy cảm. Kiểm tra định kỳ role thừa quyền và object
`PUBLIC`.

### 17.1 RLS và hiệu năng

Policy nên dùng cột có index. Tránh gọi function phức tạp hoặc subquery bảng khác trong
policy. Với multi-tenant, index `(tenant_id, ...)` là bắt buộc để RLS không biến mọi query
thành seq scan.

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
rất tốn. Dùng PgBouncer (transaction mode) hoặc pooler tương đương. Pool size thường
`2 × CPU + số đĩa hiệu dụng`, không phải càng lớn càng tốt.

**N+1:** ORM load 1 danh sách rồi query từng item. Sửa bằng `JOIN`, `IN` batch, hoặc
DataLoader.

**Keyset pagination:**

```sql
SELECT id, customer_id, total_minor, placed_at
FROM orders
WHERE status = 'paid' AND deleted_at IS NULL
  AND (placed_at, id) < ($1, $2)
ORDER BY placed_at DESC, id DESC
LIMIT 20;
```

**Batch:** insert/update theo lô 500–1000; tránh transaction quá lớn gây WAL/bloat/lock.

### 18.1 N+1: nhận diện và sửa

```ts
// ❌ 1 + N query
const orders = await db.query('SELECT id, customer_id FROM orders LIMIT 20');
for (const o of orders) {
  o.customer = await db.query('SELECT * FROM customers WHERE id = $1', [o.customer_id]);
}

// ✅ 1 query join
const rows = await db.query(`
  SELECT o.id, o.total_minor, c.id AS customer_id, c.full_name
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = 'paid'
  ORDER BY o.placed_at DESC LIMIT 20
`);
```

Nếu API trả cấu trúc lồng, dùng `jsonb_agg` để gom trong một query — nhưng giới hạn kích
thước payload.

### 18.2 Pagination: chọn theo UI

| UI | Cách phù hợp |
|---|---|
| Infinite scroll | Keyset `(placed_at, id)` |
| Bảng có số trang | `OFFSET` cho trang nhỏ; cân nhắc count ước lượng |
| Export toàn bộ | Streaming/cursor, không `LIMIT` lớn |
| Tìm kiếm có sort đa dạng | Keyset theo đúng sort key + index tương ứng |

Không dùng `OFFSET` sâu cho feed. Không dùng keyset nếu UI cần nhảy trang tuỳ ý — hoặc
chấp nhận giới hạn.

---

## 19. Data modeling nâng cao

**SCD Type 2** (Slowly Changing Dimension): giữ lịch sử bằng `valid_from`/`valid_to` và
`is_current`.

```sql
CREATE TABLE customer_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid NOT NULL,
  full_name text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  is_current boolean NOT NULL DEFAULT TRUE,
  EXCLUDE USING gist (customer_id WITH =, tstzrange(valid_from, valid_to) WITH &&)
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

### 19.1 Chọn giữa snapshot và tham chiếu

Với dữ liệu giao dịch, cần phân biệt:

- **Tham chiếu sống:** `orders.customer_id` trỏ tới customer hiện tại.
- **Snapshot lịch sử:** `order_items.unit_price_minor`, `orders.total_minor`, địa chỉ
  giao hàng tại thời điểm đặt.

Không snapshot mọi thứ (dư thừa, khó cập nhật); không chỉ tham chiếu mọi thứ (báo cáo
lịch sử sai khi giá/địa chỉ đổi). Quy tắc: snapshot thứ ảnh hưởng tiền và hợp đồng.

---

## 20. Migration

**Expand/contract (zero-downtime):**

1. **Expand:** thêm cột nullable, bảng mới, dual-write.
2. **Backfill:** theo batch, tránh lock lâu.
3. **Migrate reads:** chuyển dần, kiểm tra.
4. **Contract:** bỏ cột/trigger cũ sau khi chắc chắn.

```sql
-- Bước 1: thêm cột nullable (gần như tức thời)
ALTER TABLE orders ADD COLUMN customer_ref uuid;
CREATE INDEX CONCURRENTLY idx_orders_customer_ref ON orders (customer_ref);

-- Bước 2: backfill theo batch (PostgreSQL không có LIMIT trong UPDATE)
WITH batch AS (
  SELECT id FROM orders WHERE customer_ref IS NULL
  LIMIT 1000 FOR UPDATE SKIP LOCKED
)
UPDATE orders o
SET customer_ref = c.id
FROM batch b, customers c
WHERE o.id = b.id AND c.email = o.customer_email;
```

Lặp batch đến khi không còn dòng `customer_ref IS NULL`, sau đó thêm FK `NOT VALID` rồi
`VALIDATE CONSTRAINT` để tránh quét bảng dưới lock mạnh. Khớp email chỉ là heuristic;
production nên dùng định danh đã chuẩn hoá.

**Quy tắc:** mỗi migration có rollback (hoặc forward-fix), idempotent, không phụ thuộc
dữ liệu production cụ thể. Không `ALTER TABLE` nặng trong giờ cao điểm. Dùng
`CREATE INDEX CONCURRENTLY` (không chạy trong transaction). Test trên bản sao có dữ liệu
thật.

**Versioning:** Flyway, Liquibase, Atlas, hoặc migration của framework. Không sửa
migration đã chạy production; tạo migration mới.

### 20.1 Migration an toàn cho bảng orders

| Thay đổi | Cách an toàn |
|---|---|
| Thêm cột | Nullable hoặc default non-volatile (PG 11+) |
| Đổi tên cột | Expand-contract, không `RENAME` trực tiếp khi app cũ còn chạy |
| Thêm NOT NULL | Backfill + `CHECK NOT VALID` + `VALIDATE` + `SET NOT NULL` |
| Thêm FK | `NOT VALID` rồi `VALIDATE` |
| Thêm index | `CONCURRENTLY`, ngoài transaction |
| Đổi kiểu | Thêm cột mới, backfill, dual-write, đổi đọc, bỏ cột cũ |
| Xoá cột | Chỉ sau khi code cũ ngừng dùng ít nhất một release |

---

## 21. Case study thương mại điện tử

### 21.1 Feed đơn hàng + keyset pagination

```sql
SELECT id, customer_id, status, total_minor, placed_at
FROM orders
WHERE customer_id = $1 AND deleted_at IS NULL
  AND ($2::timestamptz IS NULL OR (placed_at, id) < ($2, $3))
ORDER BY placed_at DESC, id DESC
LIMIT 20;
```

Index `(customer_id, placed_at DESC, id DESC) WHERE deleted_at IS NULL` phục vụ cả
filter, sort và cursor. Trả `next_cursor = (placed_at, id)` của dòng cuối.

### 21.2 Doanh thu theo trạng thái

```sql
SELECT status,
       count(DISTINCT id) AS orders,
       count(DISTINCT customer_id) AS customers,
       coalesce(sum(total_minor) FILTER (WHERE status IN ('paid','fulfilled')), 0)
         AS revenue_minor
FROM orders
WHERE deleted_at IS NULL
GROUP BY status;
```

### 21.3 Top sản phẩm và top khách

```sql
SELECT p.id, p.name, sum(oi.quantity) AS units,
       sum(oi.line_total_minor) AS revenue_minor
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status IN ('paid','fulfilled')
GROUP BY p.id, p.name
ORDER BY revenue_minor DESC, p.id LIMIT 10;

SELECT c.id, c.full_name, sum(o.total_minor) AS spent_minor
FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE o.status IN ('paid','fulfilled')
GROUP BY c.id, c.full_name
ORDER BY spent_minor DESC LIMIT 10;
```

### 21.4 Tìm kiếm sản phẩm + highlight

```sql
SELECT id, ts_headline('simple', description, q, 'MaxWords=20') AS snippet,
       ts_rank(search_tsv, q) AS score
FROM products, plainto_tsquery('simple', $1) q
WHERE status = 'active' AND search_tsv @@ q
ORDER BY score DESC LIMIT 20;
```

### 21.5 Đối soát thanh toán

```sql
SELECT o.id,
       o.total_minor,
       coalesce(sum(p.amount_minor) FILTER (WHERE p.status = 'captured'), 0) AS captured_minor,
       o.total_minor - coalesce(sum(p.amount_minor)
         FILTER (WHERE p.status = 'captured'), 0) AS diff_minor
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status IN ('paid','fulfilled')
GROUP BY o.id, o.total_minor
HAVING o.total_minor <> coalesce(sum(p.amount_minor)
         FILTER (WHERE p.status = 'captured'), 0);
```

### 21.6 Performance budget

Giả định 1.000.000 đơn, feed 20 dòng:

| Query | Index | Mục tiêu |
|---|---|---|
| Trang đầu feed | `(customer_id, placed_at DESC, id DESC)` | < 5ms |
| Trang sau (keyset) | như trên | < 5ms |
| Doanh thu theo ngày | index `(placed_at)` + aggregate | < 200ms cho 30 ngày |
| Top sản phẩm | `order_items(order_id)` + join | < 500ms |
| Tìm sản phẩm | GIN `search_tsv` | < 100ms |

Đo bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu **giống production**, không phải bảng
100 dòng.

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
| Lưu tiền bằng `float` | Sai số tài chính | Integer minor units |
| Không snapshot giá trong order_items | Báo cáo sai khi giá đổi | Lưu `unit_price_minor` |

---

## 24. Bài tập

1. Tính running total doanh thu theo ngày, mỗi khách riêng.
2. Top 3 sản phẩm bán chạy nhất của mỗi danh mục.
3. Tìm khách chưa có đơn bằng `NOT EXISTS`; so sánh plan với `NOT IN`.
4. Viết recursive CTE duyệt cây `categories`, phát hiện cycle.
5. Upsert payment idempotent, chỉ update khi dữ liệu đổi.
6. Tìm sản phẩm chứa "tai nghe" bằng FTS, sắp theo rank.
7. Thiết kế index cho feed `(customer_id, placed_at DESC, id DESC)` và giải thích.
8. Viết migration thêm `customer_ref` nullable + backfill batch + index concurrent.
9. Viết query đối soát `orders.total_minor` với tổng `payments` captured.
10. Viết query phát hiện sản phẩm bán kèm nhau nhiều nhất.

### 24.1 Đáp án gợi ý

```sql
-- 1
SELECT customer_id, placed_at::date AS day, count(*) AS daily,
       sum(count(*)) OVER (PARTITION BY customer_id ORDER BY placed_at::date) AS running
FROM orders WHERE status = 'paid'
GROUP BY customer_id, placed_at::date ORDER BY customer_id, day;
-- 2
WITH ranked AS (
  SELECT p.category_id, p.id, p.name, sum(oi.quantity) AS units,
         row_number() OVER (PARTITION BY p.category_id
                            ORDER BY sum(oi.quantity) DESC, p.id) AS rn
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status IN ('paid','fulfilled')
  GROUP BY p.category_id, p.id, p.name
) SELECT * FROM ranked WHERE rn <= 3;
-- 3
SELECT c.id FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
-- 4
WITH RECURSIVE t AS (
  SELECT id, parent_id, ARRAY[id] path FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, t.path || c.id
  FROM categories c JOIN t ON c.parent_id = t.id
  WHERE NOT c.id = ANY(t.path)
) SELECT * FROM t;
-- 5
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES ($1,$2,$3,$4,$5,'captured')
ON CONFLICT (provider, provider_ref) DO UPDATE
SET status = EXCLUDED.status, amount_minor = EXCLUDED.amount_minor
WHERE (payments.status, payments.amount_minor)
   IS DISTINCT FROM (EXCLUDED.status, EXCLUDED.amount_minor);
-- 6
SELECT id, ts_rank(search_tsv, q) score
FROM products, plainto_tsquery('simple','tai nghe') q
WHERE search_tsv @@ q ORDER BY score DESC LIMIT 20;
-- 7
CREATE INDEX idx_feed ON orders (customer_id, placed_at DESC, id DESC)
WHERE deleted_at IS NULL;
-- filter + sort + keyset trong một index; tránh sort riêng.
-- 8
ALTER TABLE orders ADD COLUMN customer_ref uuid;
CREATE INDEX CONCURRENTLY idx_orders_customer_ref ON orders (customer_ref);
-- backfill theo batch với CTE + SKIP LOCKED, sau đó thêm FK NOT VALID rồi VALIDATE.
-- 9
SELECT o.id, o.total_minor,
       coalesce(sum(p.amount_minor) FILTER (WHERE p.status = 'captured'), 0) AS paid_minor
FROM orders o LEFT JOIN payments p ON p.order_id = o.id
GROUP BY o.id, o.total_minor
HAVING o.total_minor <> coalesce(sum(p.amount_minor)
         FILTER (WHERE p.status = 'captured'), 0);
-- 10
SELECT a.product_id AS a, b.product_id AS b, count(*) AS together
FROM order_items a JOIN order_items b
  ON b.order_id = a.order_id AND a.product_id < b.product_id
GROUP BY a.product_id, b.product_id ORDER BY together DESC LIMIT 10;
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
[postgresql-basics](../postgres-sql/postgresql-basics.md) ·
[postgresql-advanced](../postgres-sql/postgresql-advanced.md).

---

## 26. Schema orders chuyên sâu

### 26.1 Aggregate boundary

`orders` là aggregate root: mọi thay đổi tiền và trạng thái đi qua nó. `order_items`
thuộc cùng aggregate; `payments` và `shipments` là aggregate riêng nhưng tham chiếu
`order_id`. Ranh giới này quyết định transaction:

```sql
BEGIN;
INSERT INTO orders (id, customer_id, status, currency, subtotal_minor, total_minor)
VALUES ($1, $2, 'pending', $3, $4, $4);
INSERT INTO order_items (order_id, product_id, quantity, unit_price_minor)
SELECT $1, product_id, quantity, unit_price_minor
FROM unnest($5::uuid[], $6::int[], $7::bigint[])
     AS v(product_id, quantity, unit_price_minor);
COMMIT;
```

Không gọi cổng thanh toán trong transaction này. Payment được xử lý ở bước sau với
idempotency key.

### 26.2 State machine và audit

| Từ | Đến hợp lệ |
|---|---|
| `pending` | `paid`, `cancelled` |
| `paid` | `fulfilled`, `refunded` |
| `fulfilled` | `refunded` |
| `cancelled` | — |
| `refunded` | — |

Mọi chuyển trạng thái nên ghi `order_status_history`:

```sql
CREATE TABLE order_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  from_status text NOT NULL,
  to_status text NOT NULL,
  actor text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
```

### 26.3 Snapshot địa chỉ giao hàng

Địa chỉ khách có thể đổi sau khi đặt. `shipments` nên lưu snapshot địa chỉ tại thời điểm
giao, không chỉ `customer_id`. Tương tự, `orders` có thể lưu `shipping_address jsonb`
hoặc bảng `order_addresses` nếu cần chuẩn hoá.

### 26.4 Tiền tệ và làm tròn

Không cộng hai currency khác nhau. Nếu cần đa tiền tệ, lưu tỷ giá và tiền tệ gốc:

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency char(3) NOT NULL,
  fx_rate numeric(18,8) NOT NULL DEFAULT 1,
  total_minor bigint NOT NULL
);
```

Quy tắc làm tròn phải thống nhất (half-up, half-even) và ghi lại trong tài liệu nghiệp
vụ. Sai số làm tròn tích luỹ có thể làm lệch đối soát.

### 26.5 Checklist schema orders

- [ ] `orders.id`, `customer_id`, `status`, `currency`, `total_minor`, `placed_at`.
- [ ] `order_items` snapshot `unit_price_minor`; `line_total_minor` generated.
- [ ] `CHECK` tổng tiền; `CHECK` trạng thái; FK có index.
- [ ] `payments` unique `(provider, provider_ref)`; idempotent webhook.
- [ ] `shipments` unique tracking; snapshot địa chỉ nếu cần.
- [ ] Soft delete có partial index; không xoá cứng dữ liệu tài chính.
- [ ] Audit/status history cho thay đổi quan trọng.

---

## 27. Runbook sự cố & checklist review

### 27.1 Sự cố: query đột nhiên chậm

1. Xác định query bằng `pg_stat_statements` hoặc log.
2. So sánh plan hiện tại với baseline; tìm `Seq Scan`, `Nested Loop` loops lớn, `Sort`
   tràn đĩa.
3. Kiểm tra statistic (`pg_stats`) và chạy `ANALYZE` nếu dữ liệu vừa bulk load.
4. Kiểm tra bloat và index invalid.
5. Nếu do plan cache/generic plan, thử `force_custom_plan` hoặc viết lại query.
6. Ghi lại nguyên nhân và thêm test hồi quy.

### 27.2 Sự cố: deadlock

1. Đọc log `deadlock detected`, xác định hai câu lệnh và thứ tự khoá.
2. Sửa code để khoá theo thứ tự nhất quán (`ORDER BY id`).
3. Giảm thời gian transaction; retry lỗi `40P01` với backoff.
4. Nếu do FK, kiểm tra index cột FK để giảm lock.

### 27.3 Sự cố: replication lag tăng

1. Kiểm tra `pg_stat_replication` (`replay_lag`, `lag_bytes`).
2. Tìm transaction/WAL lớn (`pg_stat_activity`, `pg_wal`).
3. Kiểm tra I/O và CPU trên replica.
4. Tạm dừng job bulk load/backfill; chia batch nhỏ hơn.
5. Nếu slot inactive giữ WAL, xử lý slot.

### 27.4 Checklist review nâng cao

- [ ] Query có index phù hợp và plan ổn định với tham số thực tế.
- [ ] Không N+1; payload API có giới hạn kích thước.
- [ ] Pagination dùng keyset cho feed; count dùng ước lượng khi phù hợp.
- [ ] Transaction ngắn; không gọi mạng trong transaction.
- [ ] Lock theo thứ tự nhất quán; có retry cho `40001`/`40P01`.
- [ ] JSONB chỉ cho metadata; trường lọc/join là cột thật.
- [ ] FTS dùng generated column + GIN, không tính `to_tsvector` mỗi query.
- [ ] Partition có pruning; unique constraint chứa partition key.
- [ ] Migration expand/contract; index `CONCURRENTLY`; constraint `NOT VALID` + validate.
- [ ] RLS bật `FORCE` nếu app là owner; policy dùng cột có index.
- [ ] Backup có restore drill; replication lag được giám sát.
- [ ] Autovacuum bật; bloat và `xid_age` được theo dõi.
