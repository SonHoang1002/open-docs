# PostgreSQL — Kiến thức nâng cao & thực chiến

> Tài liệu dành cho người đã biết SQL cơ bản: đọc execution plan, thiết kế index,
> xử lý khoá và MVCC, partition, JSONB, full-text search, bảo mật/RLS, vận hành,
> backup/HA và migration không downtime. Ví dụ gắn với dự án `wedding-server`.
>
> 📌 Nếu mới bắt đầu, đọc [`postgresql-basics.md`](./postgresql-basics.md) trước.

---

## Mục lục

1. [Đọc execution plan (EXPLAIN)](#1-đọc-execution-plan-explain)
2. [Index nâng cao](#2-index-nâng-cao)
3. [Query tuning — các mẫu thực chiến](#3-query-tuning--các-mẫu-thực-chiến)
4. [MVCC, bloat, VACUUM & autovacuum](#4-mvcc-bloat-vacuum--autovacuum)
5. [Lock & đồng thời](#5-lock--đồng-thời)
6. [Isolation level & retry](#6-isolation-level--retry)
7. [Partitioning](#7-partitioning)
8. [JSONB trong thực tế](#8-jsonb-trong-thực-tế)
9. [Full-text search & tìm kiếm mờ](#9-full-text-search--tìm-kiếm-mờ)
10. [Window function, CTE, LATERAL](#10-window-function-cte-lateral)
11. [Function, trigger & audit](#11-function-trigger--audit)
12. [Role, GRANT & Row Level Security](#12-role-grant--row-level-security)
13. [Cấu hình & vận hành production](#13-cấu-hình--vận-hành-production)
14. [Backup, PITR & High Availability](#14-backup-pitr--high-availability)
15. [Migration không downtime](#15-migration-không-downtime)
16. [Case study: wedding-server](#16-case-study-wedding-server)
17. [Diagnostic cookbook](#17-diagnostic-cookbook)
18. [Checklist production](#18-checklist-production)
19. [Anti-patterns nâng cao](#19-anti-patterns-nâng-cao)
20. [Tài liệu tham khảo](#20-tài-liệu-tham-khảo)

---

## 1. Đọc execution plan (EXPLAIN)

### 1.1 `EXPLAIN` vs `EXPLAIN ANALYZE`

```sql
-- Chỉ ước lượng (KHÔNG chạy query)
EXPLAIN
SELECT id, sender_name, content
FROM messages
WHERE guest_of = 'Cô dâu'
ORDER BY created_at DESC
LIMIT 20;

-- Chạy thật + đo thời gian + I/O
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, sender_name, content
FROM messages
WHERE guest_of = 'Cô dâu'
ORDER BY created_at DESC
LIMIT 20;
```

| Tuỳ chọn | Ý nghĩa |
|---|---|
| `ANALYZE` | Chạy query thật, trả `actual time`, `rows`, `loops` |
| `BUFFERS` | Số block đọc từ cache (`hit`) và từ đĩa (`read`) |
| `VERBOSE` | In thêm cột output, schema, alias |
| `SETTINGS` | Các `SET` ảnh hưởng plan |
| `WAL` | Lượng WAL sinh ra (PostgreSQL 13+) |
| `COSTS OFF` | Ẩn cost, dễ đọc |
| `TIMING OFF` | Giảm overhead khi đo (vẫn có `actual rows`) |
| `FORMAT JSON` | Cho công cụ visualize |
| `MEMORY` | Thống kê bộ nhớ (PostgreSQL 17+) |
| `GENERIC_PLAN` | Plan cho prepared statement không bind giá trị (PostgreSQL 16+) |

> ⚠️ `EXPLAIN ANALYZE` **thực sự thực thi** query. Với `UPDATE`/`DELETE`, hãy bọc trong
> `BEGIN; ... ROLLBACK;` hoặc thêm `WHERE false` để tránh sửa dữ liệu.

### 1.2 Giải phẫu một plan

```text
Limit  (cost=0.43..125.12 rows=20 width=64) (actual time=0.051..0.842 rows=20 loops=1)
  Buffers: shared hit=38
  ->  Index Scan using idx_messages_created_at on messages
        (cost=0.43..62453.10 rows=10000 width=64)
        (actual time=0.048..0.835 rows=20 loops=1)
        Filter: (guest_of = 'Cô dâu'::text)
        Rows Removed by Filter: 812
        Buffers: shared hit=38
Planning:
  Buffers: shared hit=12
Planning Time: 0.312 ms
Execution Time: 0.901 ms
```

Đọc từ trong ra ngoài, từ dưới lên:

| Thành phần | Ý nghĩa |
|---|---|
| `cost=startup..total` | Chi phí ước lượng tương đối (không phải ms) |
| `rows=20` | Số dòng ước lượng **mỗi lần thực thi node** |
| `width=64` | Kích thước trung bình mỗi dòng (byte) |
| `actual time=first..total` | Thời gian tới dòng đầu / toàn bộ node (ms) |
| `rows=20 loops=1` | Số dòng thực tế **mỗi loop** |
| `loops=N` | Node được chạy bao nhiêu lần (nhân với actual time) |
| `Buffers: shared hit` | Block lấy từ shared_buffers (cache) |
| `read` | Block phải đọc từ OS/đĩa |
| `temp read/written` | Sort/hash tràn ra đĩa — dấu hiệu thiếu `work_mem` |
| `Rows Removed by Filter` | Đọc nhiều nhưng bị lọc bỏ — index chưa đúng |
| `Heap Fetches` | Index-only scan vẫn phải vào heap (vacuum chưa theo kịp) |

Quy tắc đọc nhanh:

1. `actual time` của node con thường lớn hơn node cha (cha chỉ nhận dòng).
2. `rows` ước lượng lệch `actual` > 10× → statistic sai hoặc điều kiện tương quan.
3. `loops` lớn + node con đắt → **Nested Loop** bị chọn sai.
4. `Buffers: read` lớn → chưa cache hoặc index không selective.
5. `Sort Method: external merge Disk: ...` → tăng `work_mem` hoặc thêm index sắp xếp.

### 1.3 Các node thường gặp

| Node | Khi nào xuất hiện | Ghi chú |
|---|---|---|
| `Seq Scan` | Đọc cả bảng | Tốt cho bảng nhỏ / lấy phần lớn dữ liệu |
| `Index Scan` | Index trả ít dòng | Có thể phải đọc heap |
| `Index Only Scan` | Index chứa đủ cột | Cần `VACUUM` để `Heap Fetches` thấp |
| `Bitmap Index Scan` → `Bitmap Heap Scan` | Nhiều dòng, không cần thứ tự | `Recheck Cond` có thể xuất hiện |
| `Nested Loop` | Bảng ngoài nhỏ, bảng trong có index | Nguy hiểm nếu `loops` lớn |
| `Hash Join` | Join bảng lớn không có index | Có thể tràn đĩa (`Batches > 1`) |
| `Merge Join` | Hai bên đã sắp xếp | Tốt với index/`ORDER BY` |
| `Sort` | `ORDER BY`/`GROUP BY` không có index | `external merge` = tràn đĩa |
| `HashAggregate` / `GroupAggregate` | `GROUP BY` | Hash nhanh; Group dùng index sort |
| `Gather` / `Gather Merge` | Parallel query | Xem `Workers Launched` |
| `Materialize` | Lặp lại node con | Có thể tốt hoặc tốn RAM |
| `Memoize` | Nested loop lặp key giống nhau | Cache kết quả |
| `Append` | Partition/UNION | Kiểm tra partition pruning |
| `Unique` | `DISTINCT` | |
| `Limit` | `LIMIT` | Dừng sớm nếu node con không sort toàn bộ |

### 1.4 Cost model — hiểu để không bị lừa

Các tham số mặc định (ước lượng):

```text
seq_page_cost        = 1.0     # đọc tuần tự 1 page 8KB
random_page_cost     = 4.0     # đọc ngẫu nhiên 1 page (SSD nên ~1.1)
cpu_tuple_cost       = 0.01
cpu_index_tuple_cost = 0.005
cpu_operator_cost    = 0.0025
```

- Cost chỉ để **so sánh plan**, không phải mili giây.
- SSD: `random_page_cost = 1.1` thường giúp planner chọn index đúng.
- `effective_cache_size` càng lớn planner càng tin index (vì cache nhiều).
- Đừng sửa `enable_seqscan = off` trên production để "ép index" — hãy sửa index/stat.

### 1.5 Vì sao ước lượng `rows` sai?

Nguyên nhân phổ biến:

- Cột có tương quan (ví dụ `city` và `postal_code`) nhưng planner coi độc lập.
- Dữ liệu lệch (skew) — một giá trị chiếm 90%.
- Statistic cũ sau bulk load → `ANALYZE`.
- Biểu thức không có statistic (`lower(email)`, `date_trunc(...)`).

Cách xử lý:

```sql
-- Cập nhật statistic
ANALYZE messages;

-- Tăng độ chi tiết cho cột skew
ALTER TABLE messages ALTER COLUMN guest_of SET STATISTICS 500;
ANALYZE messages;

-- Extended statistics cho cột tương quan
CREATE STATISTICS st_messages_guest_created (dependencies, ndistinct)
  ON guest_of, created_at FROM messages;
ANALYZE messages;

-- Xem statistic
SELECT attname, n_distinct, most_common_vals, correlation
FROM pg_stats
WHERE tablename = 'messages';
```

### 1.6 `pg_stat_statements` — nguồn sự thật về query chậm

```conf
# postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT
  calls,
  round(total_exec_time::numeric, 1) AS total_ms,
  round(mean_exec_time::numeric, 2)  AS mean_ms,
  rows,
  round(100.0 * shared_blks_hit
        / nullif(shared_blks_hit + shared_blks_read, 0), 1) AS cache_hit_pct,
  left(query, 120) AS query
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;
```

- `total_exec_time` (PostgreSQL 13+; trước đó là `total_time`).
- Query được **chuẩn hoá**: hằng số thay bằng `$1`, nên gom nhóm tốt.
- `mean_exec_time` cao = từng lần chậm; `total` cao = gọi nhiều.
- Reset: `SELECT pg_stat_statements_reset();` (chỉ khi đã lưu baseline).

`auto_explain` — log plan tự động cho query chậm:

```conf
session_preload_libraries = 'auto_explain'
auto_explain.log_min_duration = '500ms'
auto_explain.log_analyze = on
auto_explain.log_buffers = on
auto_explain.log_verbose = on
```

### 1.7 Prepared statement & plan cache

```sql
PREPARE feed(text) AS
SELECT id, content FROM messages WHERE guest_of = $1 ORDER BY created_at DESC LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS) EXECUTE feed('Cô dâu');

DEALLOCATE feed;
```

- PostgreSQL có thể dùng **custom plan** (biết giá trị) hoặc **generic plan** (dùng chung).
- Nếu generic plan tệ do dữ liệu lệch: `SET plan_cache_mode = force_custom_plan;`.
- Với PgBouncer transaction mode, prepared statement có thể không tồn tại giữa các
  transaction → kiểm tra phiên bản PgBouncer/driver trước khi bật.

---

## 2. Index nâng cao

### 2.1 B-tree — hiểu để thiết kế đúng

- Đơn vị lưu trữ: **page 8KB**.
- Leaf chứa key + `TID` (ctid trỏ tới heap), các leaf liên kết hai chiều.
- Chiều cao thường 3–4 tầng kể cả hàng tỷ dòng → tìm 1 key rất nhanh.
- Index mặc định là B-tree: hỗ trợ `=`, `<`, `>`, `BETWEEN`, `IN`, `ORDER BY`,
  `LIKE 'prefix%'` (tuỳ collation).

```sql
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);
```

**Selectivity** (độ chọn lọc) quyết định index có hữu ích:

```text
id = 123                 → 1 / N        → rất tốt
email = '...'            → 1 / N        → rất tốt
will_attend = true       → 90% bảng     → kém
status IN ('a','b')      → 50% bảng     → trung bình
```

Index tốt khi lọc ra **một phần nhỏ** dữ liệu.

### 2.2 Composite index — thứ tự cột là tất cả

```sql
CREATE INDEX idx_messages_feed
  ON messages (guest_of, created_at DESC, id DESC);
```

Dùng được:

```sql
WHERE guest_of = 'Cô dâu'
WHERE guest_of = 'Cô dâu' ORDER BY created_at DESC
WHERE guest_of = 'Cô dâu' AND created_at >= $1 ORDER BY created_at DESC
WHERE guest_of IN ('Cô dâu','Chú rể') ORDER BY created_at DESC
```

Không dùng tốt:

```sql
WHERE created_at >= $1                  -- thiếu cột đầu
WHERE id = $1                           -- thiếu cột đầu
ORDER BY guest_of, created_at            -- thứ tự/hướng không khớp
```

Quy tắc thực dụng:

1. **Equality trước, range/sort sau**: `(status, created_at DESC)`.
2. Cột `ORDER BY` nên nằm cuối index, cùng hướng.
3. Thêm `id` làm tiebreaker cho phân trang.
4. Index `(a, b)` cũng phục vụ `WHERE a = ...`; nhưng không thay thế index `(b)` nếu
   query chỉ lọc `b`.

### 2.3 Covering index & Index-only scan

```sql
CREATE INDEX idx_messages_cover
  ON messages (guest_of, created_at DESC)
  INCLUDE (sender_name, content);
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT sender_name, content
FROM messages
WHERE guest_of = 'Cô dâu'
ORDER BY created_at DESC
LIMIT 20;
```

Kỳ vọng: `Index Only Scan` + `Heap Fetches: 0`.

- `Heap Fetches > 0` vì **visibility map** chưa đánh dấu page là all-visible →
  `VACUUM` thường xuyên hơn.
- `INCLUDE` không dùng để lọc/sort, chỉ để mang thêm cột → đổi dung lượng lấy I/O.

### 2.4 Partial index

```sql
-- Chỉ index lời chúc còn hiệu lực
CREATE INDEX idx_messages_active
  ON messages (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

-- Chỉ index đơn hàng đang chờ
CREATE INDEX idx_jobs_queued
  ON jobs (created_at)
  WHERE status = 'queued';
```

Query phải **bao hàm** điều kiện của index:

```sql
SELECT * FROM messages
WHERE deleted_at IS NULL           -- ✅ khớp predicate
ORDER BY created_at DESC
LIMIT 20;
```

Partial index nhỏ hơn, ít tốn write hơn, nhưng chỉ dùng được cho đúng tập dòng đó.

### 2.5 Expression index

```sql
-- Query: WHERE lower(email) = lower($1)
CREATE INDEX idx_guests_email_lower ON guests (lower(email));

-- Query: WHERE (payload->>'type') = 'rsvp'
CREATE INDEX idx_events_type ON events ((payload->>'type'));

-- Query: WHERE date_trunc('day', created_at) = $1
CREATE INDEX idx_messages_day ON messages ((date_trunc('day', created_at)));
```

Biểu thức trong index phải **giống hệt** biểu thức trong query (kể cả kiểu, hàm).
Tốt hơn: viết lại query thành range để dùng index thường:

```sql
-- ✅ Sargable, dùng index (created_at)
WHERE created_at >= $1 AND created_at < $1 + interval '1 day'
```

### 2.6 Unique index & soft delete

```sql
-- Mỗi khách chỉ 1 RSVP còn hiệu lực
CREATE UNIQUE INDEX uq_rsvps_guest_active
  ON rsvps (guest_id)
  WHERE deleted_at IS NULL;
```

Không thể dùng `UNIQUE (guest_id, deleted_at)` vì mỗi lần soft delete lại tạo giá trị
`deleted_at` khác nhau → không chặn được bản ghi active trùng. Partial unique index là
cách đúng.

### 2.7 Các loại index khác

| Loại | Tốt cho | Ví dụ |
|---|---|---|
| **B-tree** | So sánh, sort, unique | `created_at`, `email` |
| **Hash** | Chỉ `=` | Ít dùng; B-tree thường tốt hơn |
| **GIN** | JSONB, array, full-text, trigram | `payload`, `search`, `tags` |
| **GiST** | Dữ liệu hình học, range, KNN | PostGIS, `tsrange`, `pg_trgm` |
| **SP-GiST** | Cấu trúc không cân bằng (quadtree) | Điểm, prefix |
| **BRIN** | Bảng rất lớn, dữ liệu tự nhiên có thứ tự | `created_at` theo thời gian |

```sql
-- BRIN cho log/event append-only
CREATE INDEX idx_events_created_brin
  ON events USING brin (created_at)
  WITH (pages_per_range = 32);

-- GIN cho JSONB (containment)
CREATE INDEX idx_events_payload
  ON events USING gin (payload jsonb_path_ops);
```

BRIN cực nhỏ (vài MB cho hàng TB) nhưng chỉ hiệu quả khi dữ liệu **tương quan vật lý**
với thứ tự (insert tăng dần). Nếu dữ liệu bị xáo trộn, BRIN gần như vô dụng.

### 2.8 Tạo index trên production

```sql
-- ❌ Chặn ghi trong lúc build
CREATE INDEX idx_messages_content ON messages (content);

-- ✅ Không chặn ghi (nhưng chậm hơn, quét 2 lần)
CREATE INDEX CONCURRENTLY idx_messages_content ON messages (content);
```

`CREATE INDEX CONCURRENTLY`:

- **Không chạy trong transaction block** (migration tool phải hỗ trợ).
- Có thể để lại index `INVALID` nếu lỗi/huỷ giữa chừng:

```sql
SELECT indexrelid::regclass
FROM pg_index
WHERE NOT indisvalid;

DROP INDEX CONCURRENTLY idx_messages_content;
```

- Theo dõi:

```sql
SELECT * FROM pg_stat_progress_create_index;
```

- Trên bảng partitioned, `CREATE INDEX CONCURRENTLY` trên parent chưa được hỗ trợ ở
  nhiều phiên bản. Pattern an toàn: tạo index `CONCURRENTLY` cho **từng partition**,
  rồi `CREATE INDEX ON ONLY parent` và `ALTER INDEX ... ATTACH PARTITION ...`.

### 2.9 Index bloat & bảo trì

Index cũng bị bloat do update/delete:

```sql
CREATE EXTENSION IF NOT EXISTS pgstattuple;
SELECT * FROM pgstattuple('messages');
SELECT * FROM pgstatindex('idx_messages_feed');
```

- `avg_leaf_density` thấp, `leaf_fragmentation` cao → cân nhắc rebuild.
- `REINDEX INDEX CONCURRENTLY idx_messages_feed;` (PostgreSQL 12+).
- `REINDEX TABLE CONCURRENTLY messages;`
- Với bảng cực lớn, `pg_repack` online (extension) ít khoá hơn `VACUUM FULL`.

### 2.10 Index không dùng & chi phí ẩn

```sql
SELECT
  schemaname, relname, indexrelname, idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint WHERE contype IN ('p','u','x')
  )
ORDER BY pg_relation_size(indexrelid) DESC;
```

Mỗi index thêm:

- Dung lượng (RAM + disk).
- Chi phí cho mọi `INSERT/UPDATE/DELETE`.
- Nguy cơ bloat.
- Có thể khiến planner chọn plan tệ.

Đừng index "phòng khi cần". Đo bằng `pg_stat_user_indexes` sau 1–2 tuần lưu lượng thật.

---

## 3. Query tuning — các mẫu thực chiến

### 3.1 Sargability — đừng bọc cột trong hàm

```sql
-- ❌ Không dùng được index (created_at)
WHERE date_trunc('day', created_at) = '2026-10-23'
WHERE created_at::date = current_date
WHERE extract(year FROM created_at) = 2026

-- ✅ Range
WHERE created_at >= '2026-10-23 00:00:00+07'
  AND created_at <  '2026-10-24 00:00:00+07'

-- ✅ Nếu cần theo ngày local, tính biên ở app hoặc dùng timezone rõ ràng
WHERE created_at >= ($1 AT TIME ZONE 'Asia/Ho_Chi_Minh')
  AND created_at <  (($1 + interval '1 day') AT TIME ZONE 'Asia/Ho_Chi_Minh')
```

```sql
-- ❌
WHERE lower(email) = 'a@b.c'
-- ✅ Expression index
CREATE INDEX ON users (lower(email));
WHERE lower(email) = 'a@b.c'

-- ❌ Ép kiểu cột
WHERE id::text = '123'
-- ✅
WHERE id = 123
```

### 3.2 Phân trang: OFFSET vs Keyset

```sql
-- ❌ Càng về sau càng chậm: đọc + bỏ N dòng
SELECT * FROM messages
ORDER BY created_at DESC
LIMIT 20 OFFSET 100000;

-- ✅ Keyset: dùng index, chi phí gần như không đổi
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL
  AND (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Index tương ứng:

```sql
CREATE INDEX CONCURRENTLY idx_messages_feed
  ON messages (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
```

Tại sao cần `id`?

- `created_at` có thể trùng (seed, import hàng loạt).
- Chỉ dùng `created_at < $1` sẽ **bỏ sót** các dòng cùng timestamp.
- `(created_at, id)` là **cursor duy nhất, ổn định**.

### 3.3 `EXISTS` vs `IN` vs `JOIN`

```sql
-- NOT IN + NULL = thảm hoạ
SELECT * FROM guests
WHERE id NOT IN (SELECT guest_id FROM messages);   -- có thể 0 dòng

-- ✅ NOT EXISTS
SELECT g.*
FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM messages m WHERE m.guest_id = g.id);

-- ✅ Anti-join (thường nhanh nhất với bảng lớn)
SELECT g.*
FROM guests g
LEFT JOIN messages m ON m.guest_id = g.id
WHERE m.id IS NULL;
```

`IN` với danh sách nhỏ ổn; với subquery lớn, `EXISTS`/anti-join thường tốt hơn.

### 3.4 Đếm dòng — đừng `count(*)` cho UI

`count(*)` phải đọc toàn bộ index/bảng (trừ khi có index-only scan). Với bảng lớn:

```sql
-- Ước lượng cực nhanh (sai số vài %)
SELECT reltuples::bigint AS estimate
FROM pg_class
WHERE oid = 'messages'::regclass;

-- Supabase/PostgREST: estimated thay vì exact
supabase.from("messages").select("*", { count: "estimated", head: true });
```

Cần chính xác tuyệt đối:

- Bảng counter cập nhật trong cùng transaction.
- Hoặc chấp nhận `count(*)` có index-only scan + cache.

### 3.5 N+1 — lỗi phổ biến nhất của ORM

```ts
// ❌ 1 query lấy messages + N query lấy guest
const messages = await getMessages();
for (const m of messages) {
  m.guest = await getGuest(m.guest_id);
}

// ✅ 1 query join / 1 query batch
const { data } = await supabase
  .from("messages")
  .select("id, content, guest:guests(id, full_name)");
```

Với raw SQL:

```sql
SELECT m.id, m.content, g.full_name
FROM messages m
LEFT JOIN guests g ON g.id = m.guest_id
WHERE m.deleted_at IS NULL
ORDER BY m.created_at DESC
LIMIT 20;
```

Hoặc batch `IN`:

```sql
SELECT id, full_name FROM guests WHERE id = ANY($1::bigint[]);
```

### 3.6 Bulk insert / update

```sql
-- ✅ Một câu, nhiều dòng
INSERT INTO messages (sender_name, content)
SELECT * FROM unnest($1::text[], $2::text[]);

-- ✅ Update theo batch từ VALUES
UPDATE messages m
SET content = v.content
FROM (VALUES (1, 'a'), (2, 'b')) AS v(id, content)
WHERE m.id = v.id;

-- ✅ UPDATE ... FROM bảng khác
UPDATE messages m
SET guest_id = g.id
FROM guests g
WHERE g.phone = m.sender_phone
  AND m.guest_id IS NULL;
```

Với 5.000–100.000 dòng, `COPY` nhanh nhất:

```sql
COPY messages (sender_name, content, created_at)
FROM '/tmp/messages.csv'
WITH (FORMAT csv, HEADER true);
```

### 3.7 Hàng đợi trong PostgreSQL

```sql
WITH picked AS (
  SELECT id
  FROM jobs
  WHERE status = 'queued'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 10
)
UPDATE jobs j
SET status     = 'running',
    started_at = now(),
    attempts   = attempts + 1
FROM picked p
WHERE j.id = p.id
RETURNING j.*;
```

- `SKIP LOCKED` cho phép nhiều worker lấy job khác nhau, không chờ nhau.
- Index: `CREATE INDEX ON jobs (created_at) WHERE status = 'queued';`
- Không dùng `LIMIT 1` + `SELECT` rồi `UPDATE` riêng (race condition) nếu chưa khoá.

### 3.8 Top-N mỗi nhóm

```sql
-- Cách 1: DISTINCT ON (gọn, thường nhanh với index đúng)
SELECT DISTINCT ON (guest_id)
       guest_id, id, content, created_at
FROM messages
WHERE guest_id IS NOT NULL
ORDER BY guest_id, created_at DESC;

-- Cách 2: LATERAL (linh hoạt, lấy nhiều dòng mỗi nhóm)
SELECT g.id, g.full_name, m.id AS message_id, m.content
FROM guests g
CROSS JOIN LATERAL (
  SELECT id, content, created_at
  FROM messages m
  WHERE m.guest_id = g.id
    AND m.deleted_at IS NULL
  ORDER BY m.created_at DESC
  LIMIT 3
) m;

-- Cách 3: row_number (khi cần lọc/tính toán thêm)
WITH ranked AS (
  SELECT m.*,
         row_number() OVER (PARTITION BY guest_id ORDER BY created_at DESC) AS rn
  FROM messages m
  WHERE guest_id IS NOT NULL
)
SELECT * FROM ranked WHERE rn <= 3;
```

### 3.9 Tổng hợp lồng nhau cho API

```sql
SELECT
  g.id,
  g.full_name,
  coalesce(
    jsonb_agg(
      jsonb_build_object('id', m.id, 'content', m.content, 'created_at', m.created_at)
      ORDER BY m.created_at DESC
    ) FILTER (WHERE m.id IS NOT NULL),
    '[]'::jsonb
  ) AS messages
FROM guests g
LEFT JOIN messages m ON m.guest_id = g.id AND m.deleted_at IS NULL
GROUP BY g.id, g.full_name
ORDER BY g.full_name;
```

Một query trả về cấu trúc lồng nhau → tránh N+1, nhưng đừng lạm dụng cho payload quá lớn.

### 3.10 CTE: materialize có chủ đích

```sql
-- PostgreSQL 12+: CTE thường được inline (không materialize)
WITH recent AS (
  SELECT * FROM messages WHERE created_at >= now() - interval '7 days'
)
SELECT count(*) FROM recent;

-- Buộc materialize khi muốn "chốt" kết quả đắt tiền
WITH heavy AS MATERIALIZED (
  SELECT guest_id, count(*) AS n
  FROM messages
  GROUP BY guest_id
)
SELECT * FROM heavy WHERE n > 10;
```

`MATERIALIZED` có thể giúp tránh chạy lại subquery, nhưng cũng có thể cản optimizer đẩy
predicate xuống. Đo bằng `EXPLAIN ANALYZE`, đừng đoán.

### 3.11 `UNION` vs `UNION ALL`

```sql
-- UNION phải sort/khử trùng
SELECT guest_of FROM messages WHERE will_attend
UNION
SELECT guest_of FROM messages WHERE NOT will_attend;

-- UNION ALL nhanh hơn nếu biết chắc không trùng
SELECT guest_of FROM messages WHERE will_attend
UNION ALL
SELECT guest_of FROM messages WHERE NOT will_attend;
```

### 3.12 Query chậm do `OR`

```sql
-- OR trên hai cột khác index → có thể full scan
WHERE sender_name = $1 OR content = $2;

-- ✅ Tách UNION ALL, mỗi nhánh dùng index riêng
SELECT * FROM messages WHERE sender_name = $1
UNION ALL
SELECT * FROM messages WHERE content = $2 AND sender_name <> $1;
```

Hoặc tạo index phù hợp (GIN/trigram) tuỳ trường hợp.

---

## 4. MVCC, bloat, VACUUM & autovacuum

### 4.1 MVCC hoạt động thế nào?

PostgreSQL không sửa dòng tại chỗ. `UPDATE` tạo **phiên bản mới** của dòng:

```text
Heap page:
  ctid=(0,1) xmin=100 xmax=0   content='A'   ← phiên bản cũ, còn visible
  ctid=(0,2) xmin=105 xmax=0   content='B'   ← phiên bản mới
```

- `xmin` = transaction tạo phiên bản.
- `xmax` = transaction xoá/thay thế phiên bản (0 nếu chưa).
- Mỗi transaction thấy snapshot nhất định → đọc không chặn ghi.
- Phiên bản cũ trở thành **dead tuple** khi không còn transaction nào cần.

```sql
SELECT ctid, xmin, xmax, id, content
FROM messages
ORDER BY id
LIMIT 5;
```

### 4.2 Bloat

Dead tuple chiếm chỗ nhưng không được tái sử dụng cho đến khi `VACUUM`. Hệ quả:

- Bảng/index phình to.
- Scan chậm hơn.
- Cache kém hiệu quả.
- Backup lớn hơn.

```sql
SELECT relname,
       n_live_tup,
       n_dead_tup,
       round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 1) AS dead_pct,
       last_vacuum,
       last_autovacuum,
       last_analyze,
       last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

Đo chính xác hơn:

```sql
CREATE EXTENSION IF NOT EXISTS pgstattuple;
SELECT * FROM pgstattuple('messages');
-- dead_tuple_percent, free_percent, table_len
```

### 4.3 `VACUUM` vs `VACUUM FULL`

| Lệnh | Việc làm | Khoá | Rewrite? |
|---|---|---|---|
| `VACUUM` | Đánh dấu dead tuple tái sử dụng | `SHARE UPDATE EXCLUSIVE` (không chặn DML) | Không |
| `VACUUM FULL` | Viết lại bảng, thu nhỏ file | `ACCESS EXCLUSIVE` (chặn đọc/ghi) | Có |
| `VACUUM (ANALYZE)` | Dọn + cập nhật statistic | Như trên | Không |
| `VACUUM (FREEZE)` | Freeze transaction ID | Như trên | Không |
| `TRUNCATE` | Xoá sạch, reset page | `ACCESS EXCLUSIVE` | Không (tạo file mới) |
| `pg_repack` | Viết lại online | Ngắn, không chặn DML | Có |

```sql
VACUUM (ANALYZE, VERBOSE) messages;
VACUUM FULL messages;          -- ⚠️ chỉ khi bảng nhỏ / có cửa sổ bảo trì
```

> `VACUUM` **không** trả dung lượng về OS; nó chỉ tái sử dụng page trống. Muốn giảm
> file thật sự phải `VACUUM FULL`/`pg_repack`/`CLUSTER`.

### 4.4 Autovacuum — không được tắt

Autovacuum kích hoạt khi:

```text
dead tuples > autovacuum_vacuum_threshold
              + autovacuum_vacuum_scale_factor × reltuples
```

Mặc định: `threshold = 50`, `scale_factor = 0.2` → bảng 1 triệu dòng cần **200.050**
dead tuple mới chạy. Quá trễ với bảng update nhiều.

```sql
-- Tune riêng cho bảng nóng
ALTER TABLE messages SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 1000,
  autovacuum_analyze_scale_factor = 0.01
);

-- Bảng insert-only (log) — PostgreSQL 13+
ALTER TABLE events SET (
  autovacuum_vacuum_insert_threshold = 10000,
  autovacuum_vacuum_insert_scale_factor = 0.05
);
```

Kiểm tra:

```sql
SELECT relname, n_dead_tup, last_autovacuum, autovacuum_count
FROM pg_stat_user_tables
WHERE relname IN ('messages', 'events');

SHOW autovacuum;
SHOW autovacuum_naptime;
SHOW autovacuum_max_workers;
```

### 4.5 Transaction ID wraparound & freeze

Mỗi transaction có ID 32-bit (~4,3 tỷ). PostgreSQL phải **freeze** dòng cũ để tránh
tràn số. Nếu age quá cao → database ngừng nhận ghi để bảo vệ dữ liệu.

```sql
SELECT datname, age(datfrozenxid) AS xid_age
FROM pg_database
ORDER BY xid_age DESC;

SELECT relname, age(relfrozenxid) AS age
FROM pg_class
WHERE relkind = 'r'
ORDER BY age DESC
LIMIT 10;
```

- `autovacuum_freeze_max_age` mặc định 200 triệu → autovacuum bắt buộc chạy.
- Cảnh báo khi `age > 1,5 tỷ`; nguy hiểm khi gần 2 tỷ.
- `VACUUM FREEZE` thủ công nếu autovacuum không theo kịp.

### 4.6 Transaction dài — kẻ thù của VACUUM

Một transaction mở lâu giữ `xmin` horizon → VACUUM không dọn được phiên bản mới hơn.

```sql
SELECT
  pid,
  usename,
  application_name,
  state,
  now() - xact_start AS xact_age,
  now() - state_change AS idle_age,
  backend_xmin,
  left(query, 100) AS query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start
LIMIT 20;
```

Đặt timeout phòng thủ:

```sql
ALTER ROLE app_rw SET statement_timeout = '30s';
ALTER ROLE app_rw SET lock_timeout = '5s';
ALTER ROLE app_rw SET idle_in_transaction_session_timeout = '30s';
```

> ⚠️ Replication slot không active cũng giữ WAL và có thể làm đầy đĩa:
> `SELECT * FROM pg_replication_slots;` (xem mục 14).

### 4.7 HOT updates & fillfactor

Nếu `UPDATE` **không đổi cột có index** và page còn chỗ, PostgreSQL dùng **HOT update**
(không phải cập nhật index) → nhanh hơn, ít bloat hơn.

```sql
-- Bảng update nhiều: chừa chỗ trống trên page
ALTER TABLE messages SET (fillfactor = 85);
```

Kiểm tra:

```sql
SELECT relname, n_tup_upd, n_tup_hot_upd,
       round(100.0 * n_tup_hot_upd / nullif(n_tup_upd, 0), 1) AS hot_pct
FROM pg_stat_user_tables
WHERE n_tup_upd > 0
ORDER BY n_tup_upd DESC;
```

`fillfactor` thấp hơn → nhiều page hơn → scan tốn hơn. Chỉ dùng cho bảng update nóng.

---

## 5. Lock & đồng thời

### 5.1 Các mức khoá bảng

| Lock mode | Lệnh tiêu biểu | Chặn gì |
|---|---|---|
| `ACCESS SHARE` | `SELECT` | Chỉ chặn `ACCESS EXCLUSIVE` |
| `ROW SHARE` | `SELECT FOR UPDATE` | Chặn `EXCLUSIVE`, `ACCESS EXCLUSIVE` |
| `ROW EXCLUSIVE` | `INSERT/UPDATE/DELETE` | Chặn `SHARE`, `SHARE ROW EXCLUSIVE`, ... |
| `SHARE UPDATE EXCLUSIVE` | `VACUUM`, `CREATE INDEX CONCURRENTLY`, `VALIDATE CONSTRAINT` | Chặn DDL nặng, không chặn DML |
| `SHARE` | `CREATE INDEX` (không concurrent) | Chặn ghi |
| `SHARE ROW EXCLUSIVE` | Một số `ALTER TABLE` | Chặn ghi + DDL |
| `EXCLUSIVE` | `REFRESH MATERIALIZED VIEW CONCURRENTLY`? (một số) | Chặn ghi |
| `ACCESS EXCLUSIVE` | `DROP`, `TRUNCATE`, `ALTER TABLE`, `VACUUM FULL` | Chặn tất cả |

Bảng đầy đủ trong docs PostgreSQL: **Table 13.2 — Conflicting Lock Modes**.

### 5.2 Row-level lock

```sql
BEGIN;

SELECT * FROM rsvps WHERE id = 1 FOR UPDATE;          -- khoá ghi
-- hoặc
SELECT * FROM rsvps WHERE id = 1 FOR NO KEY UPDATE;   -- nhẹ hơn
SELECT * FROM rsvps WHERE id = 1 FOR SHARE;           -- nhiều reader giữ
SELECT * FROM rsvps WHERE id = 1 FOR KEY SHARE;       -- FK dùng

UPDATE rsvps SET number_attend = 2 WHERE id = 1;

COMMIT;
```

- `FOR UPDATE` chặn cả `UPDATE`, `DELETE`, `FOR NO KEY UPDATE`, `FOR SHARE`.
- `FOR NO KEY UPDATE` không chặn FK insert vào bảng con (nhẹ hơn).
- `NOWAIT` → lỗi ngay nếu bị khoá.
- `SKIP LOCKED` → bỏ qua dòng đang khoá (dùng cho queue).

### 5.3 Deadlock

```text
Session A: BEGIN; UPDATE accounts SET ... WHERE id = 1;
Session B: BEGIN; UPDATE accounts SET ... WHERE id = 2;
Session A: UPDATE accounts SET ... WHERE id = 2;   -- chờ B
Session B: UPDATE accounts SET ... WHERE id = 1;   -- chờ A → DEADLOCK
```

PostgreSQL phát hiện sau `deadlock_timeout` (mặc định 1s), huỷ một transaction với
`40P01`.

Cách phòng:

1. **Luôn khoá theo thứ tự nhất quán** (`ORDER BY id` trước khi update nhiều dòng).
2. Transaction ngắn.
3. Retry khi gặp `40P01`/`40001`.
4. Dùng `SELECT ... FOR UPDATE` với thứ tự xác định:

```sql
SELECT id FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
```

### 5.4 Tìm ai đang khoá ai

```sql
SELECT
  pid,
  usename,
  state,
  wait_event_type,
  wait_event,
  pg_blocking_pids(pid) AS blockers,
  left(query, 120) AS query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

```sql
SELECT
  blocked.pid        AS blocked_pid,
  blocked.query      AS blocked_query,
  blocking.pid       AS blocking_pid,
  blocking.query     AS blocking_query
FROM pg_stat_activity blocked
JOIN LATERAL unnest(pg_blocking_pids(blocked.pid)) AS b(pid) ON true
JOIN pg_stat_activity blocking ON blocking.pid = b.pid;
```

```sql
-- Huỷ query (nhẹ)
SELECT pg_cancel_backend(12345);

-- Ngắt kết nối (mạnh, rollback transaction)
SELECT pg_terminate_backend(12345);
```

### 5.5 Advisory lock

Khoá ứng dụng (không gắn với bảng/dòng), hữu ích cho cron job, migration, singleton task:

```sql
-- Session-level: phải unlock hoặc ngắt kết nối
SELECT pg_try_advisory_lock(hashtext('send-daily-report'));  -- true/false
SELECT pg_advisory_unlock(hashtext('send-daily-report'));

-- Transaction-level: tự nhả khi COMMIT/ROLLBACK
BEGIN;
SELECT pg_advisory_xact_lock(42);
-- ... làm việc
COMMIT;
```

```ts
// Chỉ một instance được chạy job
const { rows } = await sql`
  SELECT pg_try_advisory_lock(hashtext('sync-guests')) AS locked
`;
if (!rows[0].locked) return; // instance khác đang chạy

try {
  await syncGuests();
} finally {
  await sql`SELECT pg_advisory_unlock(hashtext('sync-guests'))`;
}
```

### 5.6 `lock_timeout` trước DDL

Một `ALTER TABLE` có thể xếp hàng sau query dài và **chặn mọi query phía sau** (lock
queue). Luôn đặt timeout:

```sql
SET lock_timeout = '3s';
ALTER TABLE messages ADD COLUMN source text;
```

Nếu timeout → thử lại sau, không để DDL treo vô hạn.

---

## 6. Isolation level & retry

### 6.1 Ma trận anomaly

| Anomaly | READ COMMITTED | REPEATABLE READ | SERIALIZABLE |
|---|---|---|---|
| Dirty read | Không | Không | Không |
| Non-repeatable read | Có thể | Không | Không |
| Phantom read | Có thể | Không* | Không |
| Lost update | Có thể | Không (báo lỗi) | Không |
| Read skew | Có thể | Không | Không |
| Write skew | Có thể | Có thể | Không |

\* PostgreSQL dùng snapshot nên phantom không xuất hiện trong cùng transaction, dù
chuẩn SQL cho phép.

### 6.2 Lost update — ví dụ kinh điển

```sql
-- Session A                         -- Session B
BEGIN;                               BEGIN;
SELECT seats FROM events WHERE id=1; -- 10
                                     SELECT seats FROM events WHERE id=1; -- 10
UPDATE events SET seats = 10 - 1
WHERE id=1;
COMMIT;                              -- 9
                                     UPDATE events SET seats = 10 - 1
                                     WHERE id=1;  -- ghi đè thành 9!
                                     COMMIT;
```

Cách sửa:

```sql
-- ✅ Atomic update (đọc-ghi trong 1 câu)
UPDATE events
SET seats = seats - 1
WHERE id = 1 AND seats > 0;

-- ✅ Hoặc khoá dòng trước
BEGIN;
SELECT seats FROM events WHERE id = 1 FOR UPDATE;
UPDATE events SET seats = seats - 1 WHERE id = 1;
COMMIT;
```

### 6.3 Write skew — vì sao cần SERIALIZABLE

Ví dụ: bác sĩ trực — yêu cầu "luôn có ít nhất 2 bác sĩ trực".

```text
A: SELECT count(*) FROM shifts WHERE on_call;  -- 2
B: SELECT count(*) FROM shifts WHERE on_call;  -- 2
A: UPDATE shifts SET on_call=false WHERE id=1;  -- còn 1
B: UPDATE shifts SET on_call=false WHERE id=2;  -- còn 0
```

Cả hai đều thấy hợp lệ, nhưng kết quả vi phạm. Chỉ `SERIALIZABLE` (SSI) phát hiện và
huỷ một transaction.

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ...
COMMIT;
```

### 6.4 Retry pattern

```ts
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const code = err?.code ?? err?.cause?.code;
      const retryable = code === "40001" || code === "40P01"; // serialization / deadlock
      if (!retryable || attempt >= maxAttempts) throw err;

      const delay = Math.min(1000, 10 * 2 ** attempt) + Math.random() * 50;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Dùng
await withRetry(() => sql.begin(async (tx) => {
  await tx`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`;
  // ...
}));
```

Chỉ retry lỗi **serialization/deadlock**, không retry lỗi logic/constraint.

### 6.5 Report dài với snapshot ổn định

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE;
-- Query báo cáo dài, không bị serialization failure
SELECT ...;
COMMIT;
```

`DEFERRABLE` đợi đến khi có snapshot an toàn → không phải retry, phù hợp báo cáo.

---

## 7. Partitioning

### 7.1 Khi nào cần partition?

- Bảng rất lớn (hàng chục–trăm triệu dòng) và query thường lọc theo thời gian.
- Cần xoá dữ liệu cũ nhanh (`DROP PARTITION` thay vì `DELETE`).
- Cần maintenance theo từng phần (vacuum, reindex).
- Dữ liệu tự nhiên phân vùng: theo tháng, theo tenant, theo vùng.

Không cần partition nếu bảng < vài chục triệu dòng và index đã đủ tốt — partition thêm
phức tạp cho migration, FK, unique constraint.

### 7.2 Range partition theo thời gian

```sql
CREATE TABLE messages (
  id          bigint GENERATED BY DEFAULT AS IDENTITY,
  sender_name text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  PRIMARY KEY (id, created_at)          -- PK phải chứa partition key
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2026_10 PARTITION OF messages
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE messages_2026_11 PARTITION OF messages
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE messages_default PARTITION OF messages DEFAULT;
```

Index trên parent sẽ tạo index trên từng partition:

```sql
CREATE INDEX idx_messages_feed
  ON messages (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
```

### 7.3 List & Hash partition

```sql
-- List: theo khu vực / tenant
CREATE TABLE guests (
  id      bigint GENERATED BY DEFAULT AS IDENTITY,
  region  text NOT NULL,
  name    text NOT NULL,
  PRIMARY KEY (id, region)
) PARTITION BY LIST (region);

CREATE TABLE guests_north PARTITION OF guests FOR VALUES IN ('north');
CREATE TABLE guests_south PARTITION OF guests FOR VALUES IN ('south');

-- Hash: chia đều khi không có khóa tự nhiên
CREATE TABLE events (
  id      bigint NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE events_p0 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE events_p1 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE events_p2 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE events_p3 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

### 7.4 Partition pruning

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM messages
WHERE created_at >= '2026-10-01'
  AND created_at <  '2026-11-01';
```

Kỳ vọng: chỉ scan `messages_2026_10`.

- Pruning hoạt động với **hằng số** hoặc **parameter** (runtime pruning).
- Hàm bọc cột (`date_trunc(created_at)`) có thể **vô hiệu hoá pruning**.
- `SET enable_partition_pruning = on;` (mặc định on).

### 7.5 Bảo trì partition

```sql
-- Tạo partition tương lai (nên tự động bằng pg_partman/cron)
CREATE TABLE messages_2026_12 PARTITION OF messages
  FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Detach không chặn ghi (PostgreSQL 14+), không chạy trong transaction
ALTER TABLE messages DETACH PARTITION messages_2025_01 CONCURRENTLY;
DROP TABLE messages_2025_01;

-- Attach partition có sẵn
CREATE TABLE messages_2027_01
  (LIKE messages INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE messages ATTACH PARTITION messages_2027_01
  FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
```

> `ATTACH PARTITION` phải quét dữ liệu để kiểm tra ràng buộc, trừ khi bạn thêm `CHECK`
> chứng minh range trước. Với bảng lớn, thêm constraint `NOT VALID`/`CHECK` phù hợp để
> tránh scan dài.

**Default partition** rất tiện nhưng nguy hiểm: nếu có dòng nằm trong default, bạn
**không thể** tạo partition mới phủ vùng đó cho đến khi di chuyển dữ liệu. Với bảng
tăng theo thời gian, tốt hơn là tạo trước partition và **không dùng default**.

### 7.6 Unique constraint & FK

- `UNIQUE`/`PRIMARY KEY` trên bảng partitioned **phải chứa partition key**.
- FK từ bảng khác tới bảng partitioned bị giới hạn (kiểm tra version).
- `ON CONFLICT` trên bảng partitioned có một số hạn chế tuỳ phiên bản — test kỹ.

### 7.7 Tự động hoá

- **pg_partman**: tạo/drop partition theo lịch.
- Cron + procedure:
  - Tạo partition 3–6 tháng tới.
  - Drop partition cũ hơn retention.
- Giám sát số partition (quá nhiều → planning chậm, nhiều file).

---

## 8. JSONB trong thực tế

### 8.1 Toán tử cần nhớ

| Toán tử | Ý nghĩa | Ví dụ |
|---|---|---|
| `->` | Lấy JSON (jsonb) | `payload->'user'` |
| `->>` | Lấy text | `payload->>'type'` |
| `#>` | Lấy theo path | `payload#>'{user,name}'` |
| `#>>` | Lấy text theo path | `payload#>>'{user,name}'` |
| `@>` | Chứa (containment) | `payload @> '{"type":"rsvp"}'` |
| `<@` | Bị chứa | `'{"a":1}' <@ payload` |
| `?` | Có key/top-level string | `payload ? 'tags'` |
| `?|` | Có 1 trong các key | `payload ?| array['a','b']` |
| `?&` | Có tất cả key | `payload ?& array['a','b']` |
| `||` | Merge (shallow) | `payload || '{"status":"done"}'` |
| `-` | Xoá key | `payload - 'temp'` |
| `#-` | Xoá theo path | `payload #- '{user,age}'` |
| `@?` | JSONPath tồn tại | `payload @? '$.items[*] ? (@.qty > 2)'` |
| `@@` | JSONPath predicate | `payload @@ '$.status == "done"'` |

### 8.2 Index cho JSONB

```sql
-- Containment (@>) — nhỏ và nhanh hơn cho trường hợp phổ biến
CREATE INDEX idx_events_payload
  ON events USING gin (payload jsonb_path_ops);

-- Query
SELECT * FROM events
WHERE payload @> '{"type":"rsvp","status":"pending"}';

-- Key tồn tại
CREATE INDEX idx_events_payload_gin
  ON events USING gin (payload);        -- jsonb_ops, hỗ trợ ? ?| ?& @>

-- Field cụ thể (nhẹ hơn GIN nếu chỉ lọc 1 field)
CREATE INDEX idx_events_type
  ON events ((payload->>'type'));

SELECT * FROM events WHERE payload->>'type' = 'rsvp';
```

| Index | Hỗ trợ | Kích thước |
|---|---|---|
| `jsonb_ops` (mặc định) | `@>`, `<@`, `?`, `?|`, `?&` | Lớn hơn |
| `jsonb_path_ops` | Chủ yếu `@>` | Nhỏ, nhanh hơn |
| Expression B-tree | `=`, `<`, `>` trên 1 field | Rất nhỏ |

### 8.3 Đọc & duyệt JSONB

```sql
-- Duyệt key
SELECT key, value
FROM events, jsonb_each(payload)
WHERE id = 1;

-- Duyệt array
SELECT value->>'name' AS name
FROM events, jsonb_array_elements(payload->'items')
WHERE id = 1;

-- Chuyển thành bảng
SELECT *
FROM jsonb_to_recordset('[{"id":1,"name":"An"},{"id":2,"name":"Bình"}]')
  AS x(id int, name text);

-- JSONPath
SELECT jsonb_path_query(payload, '$.items[*].name')
FROM events WHERE id = 1;

SELECT jsonb_path_exists(payload, '$.items[*] ? (@.qty > 2)')
FROM events WHERE id = 1;
```

### 8.4 Cập nhật JSONB an toàn

```sql
-- Thêm/sửa key (shallow merge)
UPDATE events
SET payload = payload || jsonb_build_object('status', 'done', 'updated_at', now())
WHERE id = $1;

-- Sửa nested key
UPDATE events
SET payload = jsonb_set(payload, '{user,name}', '"An"', true)
WHERE id = $1;

-- Xoá key
UPDATE events
SET payload = payload - 'temp'
WHERE id = $1;

-- Xoá nested
UPDATE events
SET payload = payload #- '{user,age}'
WHERE id = $1;
```

> ⚠️ Đừng đọc JSONB lên app, sửa rồi ghi lại nếu có concurrent update — dễ mất dữ liệu.
> Dùng toán tử atomic trong SQL (`||`, `jsonb_set`) hoặc khoá dòng `FOR UPDATE`.

### 8.5 Khi nào dùng JSONB?

| Dùng JSONB | Dùng cột quan hệ |
|---|---|
| Thuộc tính thay đổi thường xuyên | Dữ liệu cốt lõi, join nhiều |
| Payload webhook/event | Cần FK, UNIQUE, CHECK |
| Metadata ít query | Cần index B-tree, aggregate |
| Cấu hình linh hoạt | Cần báo cáo phức tạp |

Thiết kế tốt thường là **hybrid**:

```sql
CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES customers(id),
  total       numeric(12,2) NOT NULL,
  status      text NOT NULL CHECK (status IN ('pending','paid','cancelled')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb
);
```

Cột quan hệ cho thứ cần join/lọc; JSONB cho phần "phụ".

### 8.6 Validate JSONB

```sql
ALTER TABLE events
  ADD CONSTRAINT payload_is_object
  CHECK (jsonb_typeof(payload) = 'object');

ALTER TABLE events
  ADD CONSTRAINT payload_has_type
  CHECK (payload ? 'type');
```

Với JSON Schema phức tạp, validate ở app hoặc dùng extension (ví dụ `pg_jsonschema`
trên Supabase).

---

## 9. Full-text search & tìm kiếm mờ

### 9.1 FTS cơ bản

```sql
SELECT to_tsvector('simple', 'Chúc mừng hạnh phúc');
-- 'chúc':1 'hạnh':3 'mừng':2 'phúc':4

SELECT to_tsquery('simple', 'hạnh & phúc');
SELECT plainto_tsquery('simple', 'hạnh phúc');       -- AND các từ
SELECT websearch_to_tsquery('simple', 'hạnh phúc -buồn'); -- cú pháp giống search engine
```

```sql
SELECT id, content
FROM messages
WHERE to_tsvector('simple', content) @@ plainto_tsquery('simple', 'hạnh phúc');
```

Query trên **không dùng index** vì `to_tsvector` tính lại mỗi dòng. Cần cột
`tsvector` + GIN.

### 9.2 Cột generated + GIN

Với tiếng Việt, PostgreSQL không có stemmer/segmenter chuyên dụng. Cấu hình `simple`
tách theo khoảng trắng/dấu câu và giữ nguyên dấu. Để tìm không dấu, dùng `unaccent`.

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() là STABLE, không dùng trực tiếp trong generated column/expression index.
-- Tạo wrapper IMMUTABLE (pattern chính thức của PostgreSQL):
CREATE OR REPLACE FUNCTION f_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT public.unaccent('public.unaccent', $1)
$$;

ALTER TABLE messages
  ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', f_unaccent(coalesce(sender_name, ''))), 'A') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(content, ''))), 'B')
  ) STORED;

CREATE INDEX idx_messages_search
  ON messages USING gin (search);
```

> ⚠️ `ADD COLUMN ... GENERATED ... STORED` **viết lại toàn bảng** và giữ
> `ACCESS EXCLUSIVE`. Với bảng lớn: thêm cột `search tsvector` thường → backfill theo
> batch → gắn trigger cập nhật (hoặc tính trong app) → tạo GIN index `CONCURRENTLY`.
> Sau đó mới cân nhắc chuyển sang generated column trong cửa sổ bảo trì.

Query:

```sql
SELECT
  id,
  sender_name,
  content,
  ts_rank_cd(search, q) AS rank,
  ts_headline('simple', content, q,
              'StartSel=<b>, StopSel=</b>, MaxWords=30') AS snippet
FROM messages,
     websearch_to_tsquery('simple', f_unaccent('hạnh phúc')) AS q
WHERE search @@ q
  AND deleted_at IS NULL
ORDER BY rank DESC
LIMIT 20;
```

> Phải dùng **cùng chuẩn hoá** ở cột và query (`f_unaccent`), nếu không sẽ không khớp.

### 9.3 `ts_rank` & trọng số

```sql
-- A > B > C > D
setweight(to_tsvector('simple', sender_name), 'A') ||
setweight(to_tsvector('simple', content), 'B')
```

`ts_rank` (tần suất) hoặc `ts_rank_cd` (cover density — cụm từ gần nhau) để xếp hạng.

### 9.4 Tìm kiếm mờ / substring với `pg_trgm`

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index cho LIKE '%...%' / ILIKE
CREATE INDEX idx_messages_content_trgm
  ON messages USING gin (content gin_trgm_ops);

SELECT id, content
FROM messages
WHERE content ILIKE '%hạnh phúc%';

-- Không dấu + không phân biệt hoa thường
CREATE INDEX idx_messages_content_unaccent_trgm
  ON messages USING gin ((f_unaccent(content)) gin_trgm_ops);

SELECT id, content
FROM messages
WHERE f_unaccent(content) ILIKE f_unaccent('%hanh phuc%');
```

```sql
SELECT similarity('hạnh phúc', 'hanh phuc');       -- 0..1
SELECT word_similarity('hạnh phúc', 'chúc mừng hạnh phúc');
SELECT * FROM messages
WHERE content % 'hạnh phúc'                        -- toán tử similarity
ORDER BY similarity(content, 'hạnh phúc') DESC;
```

| Công cụ | Phù hợp |
|---|---|
| FTS (`tsvector`) | Tìm theo từ, xếp hạng, ngôn ngữ |
| `pg_trgm` | Substring, typo, `LIKE '%x%'`, tên riêng |
| `ILIKE` + B-tree | Chỉ prefix `LIKE 'abc%'` |
| Elasticsearch/Meilisearch | Tách từ tiếng Việt, relevance phức tạp, scale lớn |

### 9.5 Giới hạn với tiếng Việt

- `simple` tách theo **âm tiết**, không hiểu từ ghép ("hạnh phúc" là 2 token).
- Tìm chính xác cụm: dùng phrase query `to_tsquery('simple', 'hạnh <-> phúc')`.
- Không có stemming: "chúc" và "chúc mừng" khác nhau.
- `unaccent` giúp bỏ dấu nhưng có thể gây nhập nhằng ("mã"/"ma").
- Với nhu cầu cao, đồng bộ sang search engine chuyên dụng.

---

## 10. Window function, CTE, LATERAL

### 10.1 Window function cơ bản

```sql
SELECT
  id,
  sender_name,
  created_at,
  row_number() OVER (ORDER BY created_at DESC)            AS rn,
  rank()       OVER (ORDER BY created_at DESC)            AS rank,
  lag(created_at)  OVER (ORDER BY created_at)             AS prev_at,
  lead(created_at) OVER (ORDER BY created_at)             AS next_at,
  count(*)     OVER ()                                    AS total,
  sum(number_attend) OVER (
    PARTITION BY guest_of
    ORDER BY created_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_seats
FROM messages
WHERE deleted_at IS NULL;
```

| Hàm | Ý nghĩa |
|---|---|
| `row_number()` | 1,2,3… không trùng |
| `rank()` | Cùng giá trị → cùng hạng, nhảy hạng |
| `dense_rank()` | Cùng giá trị → cùng hạng, không nhảy |
| `lag/lead` | Dòng trước/sau |
| `ntile(n)` | Chia n nhóm |
| `percent_rank`, `cume_dist` | Phân vị |
| `first_value`, `last_value` | Giá trị đầu/cuối trong frame |

### 10.2 Frame

```sql
-- Mặc định: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
-- (các dòng cùng ORDER BY value được tính cùng nhau)

ROWS BETWEEN 6 PRECEDING AND CURRENT ROW   -- 7 dòng gần nhất
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
```

### 10.3 Khử trùng lặp

```sql
WITH ranked AS (
  SELECT *,
         row_number() OVER (
           PARTITION BY guest_id
           ORDER BY created_at DESC, id DESC
         ) AS rn
  FROM messages
  WHERE guest_id IS NOT NULL
)
SELECT * FROM ranked WHERE rn = 1;
```

### 10.4 CTE đệ quy

```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name, 1 AS depth
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT c.id, c.parent_id, c.name, t.depth + 1
  FROM categories c
  JOIN tree t ON c.parent_id = t.id
  WHERE t.depth < 10                 -- chống treo nếu có cycle
)
SELECT * FROM tree ORDER BY depth, name;
```

Chống cycle chắc chắn hơn:

```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name, ARRAY[id] AS path
  FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name, t.path || c.id
  FROM categories c
  JOIN tree t ON c.parent_id = t.id
  WHERE NOT c.id = ANY(t.path)
)
SELECT * FROM tree;
```

### 10.5 `GROUPING SETS`, `ROLLUP`, `CUBE`

```sql
SELECT
  coalesce(guest_of, 'TỔNG') AS guest_of,
  count(*) AS total
FROM messages
GROUP BY ROLLUP (guest_of)
ORDER BY guest_of NULLS LAST;

-- Nhiều chiều
SELECT guest_of, will_attend, count(*)
FROM messages
GROUP BY GROUPING SETS ((guest_of), (will_attend), ())
ORDER BY 1 NULLS LAST, 2 NULLS LAST;
```

### 10.6 `LATERAL`

`LATERAL` cho phép subquery tham chiếu bảng bên trái — giống "for each row".

```sql
-- 3 tin mới nhất của mỗi khách
SELECT g.id, g.full_name, m.content, m.created_at
FROM guests g
CROSS JOIN LATERAL (
  SELECT content, created_at
  FROM messages m
  WHERE m.guest_id = g.id
    AND m.deleted_at IS NULL
  ORDER BY m.created_at DESC
  LIMIT 3
) m;
```

```sql
-- Top 5 khách theo số ghế
SELECT g.id, g.full_name, s.seats
FROM guests g
JOIN LATERAL (
  SELECT coalesce(sum(number_attend), 0) AS seats
  FROM rsvps r
  WHERE r.guest_id = g.id AND r.will_attend
) s ON true
ORDER BY s.seats DESC
LIMIT 5;
```

### 10.7 `FILTER` + aggregate

```sql
SELECT
  count(*)                                   AS total,
  count(*) FILTER (WHERE will_attend)        AS attending,
  count(*) FILTER (WHERE NOT will_attend)    AS declined,
  avg(number_attend) FILTER (WHERE will_attend) AS avg_seats
FROM rsvps;
```

Gọn hơn nhiều `SUM(CASE WHEN ...)`.

---

## 11. Function, trigger & audit

### 11.1 Volatility — cực kỳ quan trọng

| Mức | Ý nghĩa | Ví dụ |
|---|---|---|
| `IMMUTABLE` | Cùng input → cùng output mãi mãi | `lower()`, `md5()` |
| `STABLE` | Cùng trong 1 statement | `now()`, `current_user` |
| `VOLATILE` | Có thể đổi mỗi lần gọi | `random()`, `nextval()` |

Sai volatility gây hậu quả:

- `IMMUTABLE` sai → index/generated column sai, planner hằng số hoá sai.
- `STABLE` cho `now()` là đúng (không đổi trong transaction).
- Không đánh dấu `IMMUTABLE` cho hàm phụ thuộc cấu hình/locale.

```sql
CREATE FUNCTION full_name(first text, last text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$ SELECT btrim(first || ' ' || last) $$;
```

### 11.2 Function trả bảng

```sql
CREATE OR REPLACE FUNCTION rsvp_stats()
RETURNS TABLE (
  responded  bigint,
  attending  bigint,
  seats      bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*),
    count(*) FILTER (WHERE will_attend),
    coalesce(sum(number_attend) FILTER (WHERE will_attend), 0)
  FROM rsvps;
$$;

SELECT * FROM rsvp_stats();
```

### 11.3 Trigger `updated_at`

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION set_updated_at();
```

> Trigger chạy mỗi lần UPDATE → giữ logic nhất quán, nhưng ẩn khỏi app. Đừng đặt
> business logic nặng trong trigger.

### 11.4 Audit log

```sql
CREATE TABLE audit_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  op         text NOT NULL CHECK (op IN ('INSERT','UPDATE','DELETE')),
  row_pk     text,
  before     jsonb,
  after      jsonb,
  actor      text NOT NULL DEFAULT session_user,
  at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_table_at ON audit_log (table_name, at DESC);

CREATE OR REPLACE FUNCTION audit_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_log (table_name, op, row_pk, before, after)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    coalesce(to_jsonb(OLD)->>'id', to_jsonb(NEW)->>'id'),
    CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_messages_audit
AFTER INSERT OR UPDATE OR DELETE ON messages
FOR EACH ROW
EXECUTE FUNCTION audit_row();
```

Lưu ý:

- Audit table tăng rất nhanh → partition theo tháng, retention.
- `SECURITY DEFINER` + `SET search_path` để tránh bị chiếm quyền.
- Không log mật khẩu/token/PII đầy đủ — mask trước khi ghi.
- Trigger `AFTER` không làm chậm transaction gốc quá nhiều, nhưng vẫn là I/O thêm.

### 11.5 Procedure & transaction control

Procedure (khác function) có thể `COMMIT`/`ROLLBACK` khi được gọi bằng `CALL` ngoài
transaction block — hữu ích cho backfill theo batch:

```sql
-- Giả sử đã có: ALTER TABLE messages ADD COLUMN normalized_name text;
CREATE OR REPLACE PROCEDURE backfill_normalized_name(batch_size int DEFAULT 5000)
LANGUAGE plpgsql
AS $$
DECLARE
  affected int;
BEGIN
  LOOP
    UPDATE messages
    SET normalized_name = lower(btrim(sender_name))
    WHERE id IN (
      SELECT id
      FROM messages
      WHERE normalized_name IS NULL
      ORDER BY id
      LIMIT batch_size
    );

    GET DIAGNOSTICS affected = ROW_COUNT;
    COMMIT;                       -- chỉ hợp lệ trong procedure
    EXIT WHEN affected = 0;

    PERFORM pg_sleep(0.05);       -- giảm áp lực replication/IO
  END LOOP;
END;
$$;

CALL backfill_normalized_name();
```

> `CALL` phải chạy **ngoài** transaction block, nếu không `COMMIT` bên trong procedure sẽ
> báo lỗi. `DO $$ ... $$` là anonymous block, cũng **không** `COMMIT` được.

### 11.6 Bắt lỗi & mã lỗi

```sql
DO $$
BEGIN
  INSERT INTO guests (full_name) VALUES (NULL);
EXCEPTION
  WHEN not_null_violation THEN
    RAISE NOTICE 'Thiếu tên: %', SQLERRM;
  WHEN unique_violation THEN
    RAISE NOTICE 'Trùng dữ liệu: %', SQLSTATE;
END;
$$;
```

Mã thường gặp:

| SQLSTATE | Nghĩa |
|---|---|
| `23505` | Unique violation |
| `23503` | Foreign key violation |
| `23502` | Not null violation |
| `23514` | Check violation |
| `40001` | Serialization failure |
| `40P01` | Deadlock detected |
| `57014` | Query canceled (statement_timeout) |
| `55P03` | Lock not available (`NOWAIT`/`lock_timeout`) |

---

## 12. Role, GRANT & Row Level Security

### 12.1 Role tối thiểu

```sql
-- Role chạy app: chỉ DML
CREATE ROLE app_rw LOGIN PASSWORD '...' NOSUPERUSER NOCREATEDB NOCREATEROLE;

-- Role migration: DDL
CREATE ROLE app_migrator LOGIN PASSWORD '...' NOSUPERUSER NOCREATEDB NOCREATEROLE;

GRANT CONNECT ON DATABASE wedding TO app_rw, app_migrator;
GRANT USAGE ON SCHEMA public TO app_rw, app_migrator;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_rw;
```

Nguyên tắc:

- App **không** dùng `postgres`/superuser.
- Tách role DDL và role runtime.
- `REVOKE ALL ON SCHEMA public FROM PUBLIC;` (PostgreSQL 15+ mặc định đã hạn chế).
- Cấp quyền theo bảng/cột nếu cần.

### 12.2 `GRANT` vs RLS

- `GRANT` quyết định **có được chạm bảng không**.
- **RLS** quyết định **được thấy/sửa dòng nào**.
- Cần cả hai. RLS không thay thế GRANT.

### 12.3 RLS cơ bản

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chủ bảng cũng bị RLS (quan trọng nếu app role là owner)
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

-- Ai cũng đọc tin chưa xoá
CREATE POLICY messages_select_public
  ON messages
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- Chỉ chèn với sender_id của chính mình (Supabase)
CREATE POLICY messages_insert_own
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()));

-- Chỉ sửa/xoá tin của mình
CREATE POLICY messages_update_own
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = (SELECT auth.uid()))
  WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY messages_delete_own
  ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = (SELECT auth.uid()));
```

> Schema hiện tại của `wedding-server` chưa có `sender_id uuid`. Nếu muốn dùng RLS theo
> người dùng, thêm cột này và map với `auth.users.id` của Supabase.

### 12.4 `USING` vs `WITH CHECK`

| Mệnh đề | Áp dụng | Ý nghĩa |
|---|---|---|
| `USING` | `SELECT`, `UPDATE`, `DELETE` | Dòng **hiện có** có được thấy/sửa/xoá? |
| `WITH CHECK` | `INSERT`, `UPDATE` | Dòng **mới/sau khi sửa** có hợp lệ? |
| Cả hai | `UPDATE` | Xem dòng cũ + kiểm tra dòng mới |

Nếu `UPDATE` chỉ có `USING`, dòng sau khi sửa vẫn phải thoả `USING` (ngầm định).
Muốn đổi chủ sở hữu phải có `WITH CHECK` phù hợp.

### 12.5 Policy kết hợp

- Nhiều policy **PERMISSIVE** → OR với nhau.
- Policy **RESTRICTIVE** → AND với tất cả.
- Mặc định policy là PERMISSIVE.

```sql
CREATE POLICY messages_admin_all
  ON messages
  FOR ALL
  TO admin_role
  USING (true)
  WITH CHECK (true);
```

### 12.6 Hiệu năng RLS

```sql
-- ❌ auth.uid() gọi cho từng dòng (có thể)
USING (sender_id = auth.uid())

-- ✅ Scalar subquery → planner đánh giá 1 lần (initplan)
USING (sender_id = (SELECT auth.uid()))
```

- Policy nên dùng cột có index.
- Tránh gọi function phức tạp/`SELECT` bảng khác trong policy.
- RLS áp dụng cả khi dùng PostgREST/Supabase client; service role **bỏ qua RLS** →
  tuyệt đối không để lộ service key.

### 12.7 Bảo vệ function `SECURITY DEFINER`

```sql
CREATE OR REPLACE FUNCTION public.my_secure_fn()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public      -- bắt buộc
AS $$ ... $$;

REVOKE ALL ON FUNCTION public.my_secure_fn() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_secure_fn() TO app_rw;
```

Nếu không set `search_path`, kẻ tấn công có thể tạo bảng/function cùng tên ở schema
khác và khiến function chạy với quyền cao hơn.

### 12.8 Kiểm thử RLS

```sql
-- Giả lập user (chạy trong transaction để set_config(..., true) có hiệu lực)
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"uuid-cua-user"}', true);
SELECT * FROM messages;
ROLLBACK;
```

Trong Supabase local, dùng `supabase test db` / pgTAP để test policy tự động.

---

## 13. Cấu hình & vận hành production

### 13.1 Bộ nhớ

| Tham số | Gợi ý | Ghi chú |
|---|---|---|
| `shared_buffers` | 25% RAM (tối đa ~8–16GB) | Cache chính của PostgreSQL |
| `effective_cache_size` | 50–75% RAM | Ước lượng cache OS + PG cho planner |
| `work_mem` | 4–16MB | **Mỗi** node sort/hash, không phải mỗi connection |
| `maintenance_work_mem` | 256MB–2GB | VACUUM, CREATE INDEX |
| `wal_buffers` | 16MB | Tự tăng nếu `-1` |
| `huge_pages` | `try` | Giảm TLB miss |

> `work_mem` nhân với số node và số connection → đặt quá cao dễ OOM. Query báo cáo nặng
> có thể `SET LOCAL work_mem = '256MB';` riêng.

### 13.2 WAL & checkpoint

```conf
wal_level = replica                 # logical nếu cần logical replication
synchronous_commit = on             # off = mất vài trăm ms khi crash
wal_compression = on
max_wal_size = 8GB
min_wal_size = 1GB
checkpoint_timeout = 15min
checkpoint_completion_target = 0.9
```

- `max_wal_size` nhỏ → checkpoint nhiều → I/O tăng.
- `synchronous_commit = off` chỉ dùng cho bulk load/batch chấp nhận mất dữ liệu gần nhất.
- `fsync` **luôn bật** trên production.

### 13.3 Planner

```conf
random_page_cost = 1.1              # SSD
effective_io_concurrency = 200      # SSD
default_statistics_target = 100
```

- HDD: giữ `random_page_cost = 4.0`.
- Cloud volume (EBS/gp3): thử 1.1–2.0 và đo.
- `default_statistics_target` cao hơn → statistic tốt hơn, `ANALYZE` chậm hơn.

### 13.4 Parallel query

```conf
max_parallel_workers_per_gather = 2
max_parallel_workers = 8
max_worker_processes = 16
parallel_setup_cost = 1000
min_parallel_table_scan_size = 8MB
```

Parallel tốt cho analytics, có thể gây hại cho OLTP nhiều query nhỏ. Theo dõi CPU và
`Gather` trong plan.

### 13.5 Connection pooling

| Chế độ PgBouncer | Đặc điểm | Dùng khi |
|---|---|---|
| `session` | Giữ server connection cho cả session | App cần session state, prepared statement |
| `transaction` | Trả connection sau mỗi transaction | Web app/ORM, tiết kiệm nhất |
| `statement` | Trả sau mỗi statement | Hiếm dùng, hạn chế |

Kích thước pool tham khảo:

```text
connections ≈ (CPU cores × 2) + số đĩa hiệu dụng
```

Ví dụ 8 core → ~18–25 connection xử lý đồng thời; còn lại xếp hàng. Nhiều connection
hơn **không** nhanh hơn mà tăng context switch.

Supabase:

| Cổng | Chế độ | Dùng cho |
|---|---|---|
| `5432` (direct) | Không pool | Migration, admin, kết nối lâu |
| `5432` (session pooler) | Session | IPv4, app cần session |
| `6543` | Transaction | Serverless/edge, app runtime |

> Transaction pooler không hỗ trợ đầy đủ session features (advisory lock session,
> `SET` session, prepared statement tuỳ phiên bản). Kiểm tra driver trước khi dùng.

### 13.6 Timeout & log

```conf
log_min_duration_statement = 500ms
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 250ms
log_checkpoints = on
log_line_prefix = '%m [%p] %q%u@%d '
log_statement = 'ddl'
```

```sql
ALTER ROLE app_rw SET statement_timeout = '30s';
ALTER ROLE app_rw SET lock_timeout = '5s';
ALTER ROLE app_rw SET idle_in_transaction_session_timeout = '30s';
```

- `log_statement = 'all'` chỉ dùng tạm thời để debug (rất nhiều I/O, lộ dữ liệu).
- `log_min_duration_statement = 0` trên staging để bắt mọi query.

### 13.7 Hệ điều hành & container

- Filesystem: XFS/ext4; **tránh NFS** cho PGDATA.
- `fsync=on`, `full_page_writes=on`.
- Disk riêng cho WAL nếu I/O cao.
- Container: volume persistent, đủ IOPS, **`/dev/shm` ≥ 256MB** (parallel query dùng).
- Không chạy `VACUUM FULL`/`pg_repack` trong giờ cao điểm.
- Giám sát disk, inode, RAM, CPU steal (VM).

### 13.8 Extension hữu ích

| Extension | Công dụng |
|---|---|
| `pg_stat_statements` | Thống kê query |
| `pgcrypto` | `gen_random_uuid()`, hash |
| `pg_trgm` | Tìm kiếm mờ |
| `unaccent` | Bỏ dấu tiếng Việt |
| `pg_partman` | Quản lý partition |
| `pg_repack` | Rebuild online |
| `pgstattuple` | Đo bloat |
| `amcheck` | Kiểm tra index corruption |
| `postgis` | Dữ liệu địa lý |
| `pg_jsonschema` | Validate JSON Schema |
| `pgaudit` | Audit chi tiết |

---

## 14. Backup, PITR & High Availability

### 14.1 RPO / RTO

| Khái niệm | Ý nghĩa |
|---|---|
| **RPO** (Recovery Point Objective) | Mất tối đa bao nhiêu dữ liệu (thời gian) |
| **RTO** (Recovery Time Objective) | Thời gian tối đa để phục hồi |

Ví dụ:

- Backup logic hằng ngày → RPO 24h.
- WAL archiving + PITR → RPO vài phút.
- Streaming replication đồng bộ → RPO gần 0.

### 14.2 Logical backup

```bash
# Nén, custom format, parallel
pg_dump -Fd -j 4 -f /backup/wedding_$(date +%F) wedding

# Restore
pg_restore -d wedding_new -j 4 /backup/wedding_2026-10-23

# Chỉ schema / chỉ data
pg_dump -s wedding > schema.sql
pg_dump -a wedding > data.sql

# Toàn bộ role/global
pg_dumpall --globals-only > globals.sql
```

- `pg_dump` lấy snapshot nhất quán, không chặn ghi (phần lớn).
- Với database lớn, dùng directory format + parallel.
- **Luôn test restore** định kỳ — backup không restore được là backup vô nghĩa.

### 14.3 Physical backup & PITR

```bash
pg_basebackup -D /backup/base -Ft -z -Xs -P
```

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'wal-g wal-push %p'
# hoặc pgBackRest
```

Restore PITR:

```conf
restore_command = 'wal-g wal-fetch %f %p'
recovery_target_time = '2026-10-23 14:30:00+07'
```

```bash
touch /var/lib/postgresql/data/recovery.signal   # PostgreSQL 12+
```

Công cụ: **pgBackRest**, **WAL-G**, **Barman**.

### 14.4 Streaming replication

```text
Primary ──WAL──▶ Standby (hot standby, read-only)
```

- `wal_level=replica`, `max_wal_senders`, `max_replication_slots`.
- Standby có thể phục vụ read-only query.
- `synchronous_commit=on` + `synchronous_standby_names` → RPO 0 nhưng tăng latency.
- `pg_stat_replication` để xem lag.
- Failover: **Patroni**, **repmgr**, hoặc managed service.

```sql
SELECT client_addr, state, sent_lsn, replay_lsn,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
FROM pg_stat_replication;
```

### 14.5 Logical replication

```sql
-- Publisher
CREATE PUBLICATION wedding_pub FOR TABLE messages, rsvps;

-- Subscriber
CREATE SUBSCRIPTION wedding_sub
CONNECTION 'host=... dbname=wedding user=repl password=...'
PUBLICATION wedding_pub;
```

> `CREATE SUBSCRIPTION` không chạy trong transaction block. Trên managed service
> (RDS/Supabase), có thể cần bật `wal_level=logical` và cấp quyền replication trước.

Dùng khi:

- Nâng cấp major version gần như zero-downtime.
- Đồng bộ sang hệ thống khác (CDC).
- Chỉ replicate một số bảng.

Hạn chế:

- Không replicate DDL, sequence (cần xử lý riêng).
- Không replicate `TRUNCATE` (tuỳ cấu hình).
- Conflict có thể xảy ra nếu ghi hai phía.

### 14.6 Backup trên Supabase

- Supabase có backup hằng ngày (tuỳ plan) và PITR (add-on).
- Không phụ thuộc 100% vào provider: định kỳ `pg_dump` ra nơi khác.
- Kiểm tra thời gian retention và **thử restore** trên project staging.

### 14.7 Restore drill

```text
1. Chọn backup bất kỳ (không phải mới nhất).
2. Restore vào môi trường isolated.
3. Chạy kiểm tra: row counts, query quan trọng, application smoke test.
4. Ghi lại thời gian restore (RTO thực tế).
5. Sửa runbook nếu thiếu bước.
```

---

## 15. Migration không downtime

### 15.1 Ma trận khoá & rewrite

| Thao tác | Rewrite bảng? | Khoá | Ghi chú |
|---|---|---|---|
| `ADD COLUMN` nullable | Không | `ACCESS EXCLUSIVE` (ngắn) | An toàn |
| `ADD COLUMN ... DEFAULT` (non-volatile, PG11+) | Không | Ngắn | `now()` được coi là non-volatile |
| `ADD COLUMN ... DEFAULT` volatile | **Có** | Lâu | `random()`, `gen_random_uuid()` |
| `DROP COLUMN` | Không | Ngắn | Nhưng code cũ sẽ lỗi |
| `SET NOT NULL` | Scan | `ACCESS EXCLUSIVE` | Dùng CHECK `NOT VALID` trước |
| `ADD CHECK` | Scan | `ACCESS EXCLUSIVE` | Dùng `NOT VALID` rồi `VALIDATE` |
| `VALIDATE CONSTRAINT` | Không | `SHARE UPDATE EXCLUSIVE` | Không chặn DML |
| `ADD FOREIGN KEY` | Scan | Mạnh | `NOT VALID` rồi validate |
| `CREATE INDEX` | Không | `SHARE` | **Chặn ghi** |
| `CREATE INDEX CONCURRENTLY` | Không | `SHARE UPDATE EXCLUSIVE` | Không chặn ghi, 2 scan |
| `ALTER TYPE` | Thường có | `ACCESS EXCLUSIVE` | Trừ vài kiểu binary-coercible |
| `RENAME` | Không | Ngắn | Code cũ lỗi ngay |
| `VACUUM FULL` | Có | `ACCESS EXCLUSIVE` | Tránh giờ cao điểm |
| `CLUSTER` | Có | `ACCESS EXCLUSIVE` | |
| `TRUNCATE` | Không | `ACCESS EXCLUSIVE` | |

### 15.2 Expand–Contract (đổi tên cột an toàn)

Mục tiêu: đổi `sender_name` → `guest_name` mà không làm sập app đang chạy.

```text
Bước 1: ADD COLUMN guest_name text;                (nullable)
Bước 2: App ghi cả sender_name và guest_name.
Bước 3: Backfill guest_name theo batch.
Bước 4: App đọc guest_name, fallback sender_name.
Bước 5: SET NOT NULL cho guest_name (dùng CHECK hợp lệ).
Bước 6: App ngừng ghi sender_name.
Bước 7: DROP COLUMN sender_name sau vài ngày.
```

```sql
-- 1
ALTER TABLE messages ADD COLUMN guest_name text;

-- 3. Backfill theo batch (procedure ở mục 11.5)
UPDATE messages
SET guest_name = sender_name
WHERE id IN (
  SELECT id FROM messages
  WHERE guest_name IS NULL
  ORDER BY id
  LIMIT 5000
);

-- 5. NOT NULL không scan toàn bảng
ALTER TABLE messages
  ADD CONSTRAINT chk_guest_name_not_null
  CHECK (guest_name IS NOT NULL) NOT VALID;

ALTER TABLE messages VALIDATE CONSTRAINT chk_guest_name_not_null;

ALTER TABLE messages ALTER COLUMN guest_name SET NOT NULL;

ALTER TABLE messages DROP CONSTRAINT chk_guest_name_not_null;
```

### 15.3 `NOT VALID` + `VALIDATE`

```sql
-- Thêm FK không quét bảng ngay
ALTER TABLE messages
  ADD CONSTRAINT fk_messages_guest
  FOREIGN KEY (guest_id) REFERENCES guests(id)
  NOT VALID;

-- Kiểm tra dữ liệu cũ sau (không chặn ghi)
ALTER TABLE messages VALIDATE CONSTRAINT fk_messages_guest;
```

Tương tự với `CHECK`. Đây là pattern bắt buộc với bảng lớn.

### 15.4 Backfill theo batch

Không chạy:

```sql
-- ❌ 10 triệu dòng: bloat, WAL khổng lồ, replication lag, lock lâu
UPDATE messages SET normalized_name = lower(sender_name);
```

Thay bằng:

```sql
CREATE OR REPLACE PROCEDURE backfill_normalized_name(batch_size int DEFAULT 5000)
LANGUAGE plpgsql AS $$
DECLARE affected int;
BEGIN
  LOOP
    UPDATE messages
    SET normalized_name = lower(btrim(sender_name))
    WHERE id IN (
      SELECT id FROM messages
      WHERE normalized_name IS NULL
      ORDER BY id
      LIMIT batch_size
    );
    GET DIAGNOSTICS affected = ROW_COUNT;
    COMMIT;
    EXIT WHEN affected = 0;
    PERFORM pg_sleep(0.05);
  END LOOP;
END;
$$;

CALL backfill_normalized_name();
```

Sau backfill: `VACUUM (ANALYZE) messages;`.

### 15.5 Index trên bảng lớn

```bash
# Migration tool thường bọc transaction → CONCURRENTLY sẽ lỗi
# Tách riêng bước này, chạy ngoài transaction
psql -c "CREATE INDEX CONCURRENTLY idx_messages_feed ON messages (created_at DESC, id DESC) WHERE deleted_at IS NULL;"
```

Kiểm tra index invalid sau khi chạy:

```sql
SELECT indexrelid::regclass
FROM pg_index
WHERE NOT indisvalid;
```

### 15.6 Thứ tự deploy

```text
1. Backup / snapshot.
2. Chạy migration **backward-compatible** (thêm cột, index, constraint NOT VALID).
3. Deploy code mới (đọc/ghi cả cột cũ + mới nếu cần).
4. Backfill.
5. Validate constraint / SET NOT NULL.
6. Sau khi ổn định: deploy code bỏ cột cũ.
7. DROP cột cũ + index không dùng.
```

Không bao giờ deploy code mới **trước** khi schema có cột nó cần.

### 15.7 Công cụ migration

| Công cụ | Ghi chú |
|---|---|
| **Supabase CLI** | `supabase migration new`, `supabase db push` |
| **node-pg-migrate** | JS/TS, SQL migration |
| **Flyway** | Java, phổ biến doanh nghiệp |
| **Liquibase** | XML/YAML/SQL, rollback |
| **Atlas** | Declarative schema, lint |
| **Prisma Migrate** | ORM Prisma |
| **Drizzle Kit** | ORM Drizzle |

Yêu cầu tối thiểu:

- Migration **forward-only** (hoặc có rollback được test).
- Không sửa migration đã chạy trên production.
- Checksum/versioning.
- Chạy migration tự động trong CI/CD, không tay.
- Test trên dữ liệu giống production (size, skew).

### 15.8 Rollback

- Ưu tiên **roll forward** (sửa bằng migration mới) hơn rollback.
- Nếu rollback: phải chắc code cũ tương thích schema mới.
- `DROP INDEX CONCURRENTLY` để gỡ index lỗi.
- Không `DROP COLUMN` ngay sau deploy — giữ ít nhất 1 release.

---

## 16. Case study: wedding-server

### 16.1 Hiện trạng & rủi ro

`GET /api/messages` hiện tại:

```ts
let query = supabase.from(dbColumn).select("*")
  .order("created_at", { ascending: false }).limit(20);

if (before) query = query.lt("created_at", before);
```

Vấn đề:

1. **Cursor chỉ có `created_at`** → nhiều dòng cùng timestamp (seed/import) có thể bị
   bỏ sót hoặc lặp.
2. `select("*")` → trả cả cột nội bộ, tốn băng thông.
3. `before` không validate → input lạ có thể gây lỗi/lỗi 500.

Hai endpoint xoá:

```ts
app.delete("/api/messages/:id", ...);   // không auth
app.delete("/api/messages", ...);       // xoá tất cả với neq('id', 0)
```

Rủi ro:

- Bất kỳ ai gọi được đều xoá dữ liệu.
- `neq("id", 0)` là "xoá mọi thứ" trá hình.
- Không có audit/soft delete.

### 16.2 Schema đề xuất

> Nếu đã chạy ví dụ partition ở mục 7, dùng database khác hoặc bỏ qua `CREATE TABLE
> messages` bên dưới (schema đã tồn tại).

```sql
-- Khách mời
CREATE TABLE guests (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  text NOT NULL,
  phone      text UNIQUE,
  side       text NOT NULL DEFAULT 'both'
             CHECK (side IN ('bride','groom','both')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RSVP: 1 khách / 1 phản hồi
CREATE TABLE rsvps (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id      bigint NOT NULL UNIQUE
                REFERENCES guests(id) ON DELETE CASCADE,
  will_attend   boolean NOT NULL,
  number_attend smallint NOT NULL DEFAULT 0
                CHECK (number_attend BETWEEN 0 AND 10),
  note          text CHECK (char_length(note) <= 500),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

-- Guestbook
CREATE TABLE messages (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id    bigint REFERENCES guests(id) ON DELETE SET NULL,
  sender_id   uuid,                         -- map auth.users.id (nếu dùng Supabase Auth)
  sender_name text NOT NULL CHECK (char_length(btrim(sender_name)) BETWEEN 2 AND 80),
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- Index cho feed + keyset pagination
CREATE INDEX CONCURRENTLY idx_messages_feed
  ON messages (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_messages_guest_id ON messages (guest_id);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
```

> `CREATE INDEX CONCURRENTLY` không chạy trong transaction — chạy riêng ngoài migration
> transaction (hoặc dùng migration tool hỗ trợ `disableTransaction`).

### 16.3 Keyset pagination đúng

SQL:

```sql
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL
  AND (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT $3;
```

Hono + Supabase (cursor base64url):

```ts
type Cursor = { createdAt: string; id: number };

const encodeCursor = (c: Cursor) =>
  Buffer.from(`${c.createdAt}|${c.id}`).toString("base64url");

function decodeCursor(raw: string): Cursor {
  const [rawDate, rawId] = Buffer.from(raw, "base64url").toString().split("|");
  const date = new Date(rawDate ?? "");
  const id = Number(rawId);

  if (Number.isNaN(date.getTime()) || !Number.isSafeInteger(id)) {
    throw new Error("INVALID_CURSOR");
  }
  // Chuẩn hoá lại ISO (chỉ chứa Z, không có dấu + gây rối query string)
  return { createdAt: date.toISOString(), id };
}

app.get("/api/messages", async (c) => {
  const requested = Number(c.req.query("limit") ?? 20);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), 50)
    : 20;
  const rawCursor = c.req.query("cursor");

  let query = supabase
    .from("messages")
    .select("id, sender_name, content, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);              // +1 để biết còn trang sau

  if (rawCursor) {
    const { createdAt, id } = decodeCursor(rawCursor);
    query = query.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`,
    );
  }

  const { data, error } = await query;
  if (error) return c.json({ success: false, error: "DB_ERROR" }, 500);

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page.at(-1);

  return c.json({
    success: true,
    data: page.reverse(), // trả về cũ → mới cho UI
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.created_at, id: last.id })
        : null,
  });
});
```

Lưu ý:

- Dùng `toISOString()` (có `Z`) cho cursor để tránh dấu `+` gây rối query string.
- `.or()` của PostgREST cần giá trị không chứa dấu phẩy; ISO timestamp ổn.
- `nextCursor = null` khi hết dữ liệu.

### 16.4 Xoá an toàn

```ts
// Chỉ admin (verify JWT/role) — service role chỉ dùng server-side
app.delete("/api/messages/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return c.json({ success: false, error: "DB_ERROR" }, 500);
  if (!data) return c.json({ success: false, error: "NOT_FOUND" }, 404);

  return c.json({ success: true, data });
});
```

- Không có endpoint "xoá tất cả". Nếu thật sự cần, yêu cầu xác nhận + audit + giới hạn
  thời gian.
- Soft delete giữ dữ liệu cho audit; job dọn vĩnh viễn sau N ngày.

### 16.5 RLS cho Supabase

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

GRANT SELECT ON messages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON messages TO authenticated;

CREATE POLICY messages_read_public
  ON messages FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY messages_insert_own
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND char_length(btrim(sender_name)) BETWEEN 2 AND 80
  );

CREATE POLICY messages_update_own
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = (SELECT auth.uid()) AND deleted_at IS NULL)
  WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY messages_delete_own
  ON messages FOR DELETE
  TO authenticated
  USING (sender_id = (SELECT auth.uid()));
```

> `anon` key là công khai; **mọi bảo vệ nằm ở RLS**. `service_role` bỏ qua RLS — không
> bao giờ đưa key này xuống client.

### 16.6 Thống kê & Realtime

```sql
-- Thống kê (một query)
SELECT
  count(*)                                             AS responded,
  count(*) FILTER (WHERE will_attend)                  AS attending,
  count(*) FILTER (WHERE NOT will_attend)              AS declined,
  coalesce(sum(number_attend) FILTER (WHERE will_attend), 0) AS seats
FROM rsvps
WHERE deleted_at IS NULL;

-- Bật realtime cho bảng (Supabase)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

Realtime `postgres_changes` vẫn tuân theo RLS → chỉ nhận dòng user được phép thấy.
Với guestbook public, policy `SELECT` cho `anon` là đủ.

### 16.7 Seed 5.000 dòng

Thay vì 10 lần gọi Supabase từ `seed.ts`:

```sql
INSERT INTO messages (sender_name, content, created_at)
SELECT
  (ARRAY['Nguyễn Văn An','Trần Thị Bình','Lê Hoàng Cường','Phạm Thu Dung'])
    [1 + floor(random() * 4)::int],
  (ARRAY[
    'Chúc mừng hạnh phúc!',
    'Trăm năm viên mãn nhé hai bạn!',
    'Chúc gia đình nhỏ luôn ngập tràn tiếng cười.',
    'Happy wedding!'
  ])[1 + floor(random() * 4)::int],
  now() - random() * interval '90 days'
FROM generate_series(1, 5000);

ANALYZE messages;
```

- Một round-trip thay vì 10.
- `ANALYZE` ngay sau bulk load để planner có statistic đúng.

### 16.8 Performance budget

Giả định 100.000 lời chúc, feed 20 dòng:

| Query | Index | Mục tiêu |
|---|---|---|
| Trang đầu feed | `(created_at DESC, id DESC) WHERE deleted_at IS NULL` | < 5ms |
| Trang sau (keyset) | như trên | < 5ms |
| Đếm thống kê | index nhỏ / bảng counter | < 50ms |
| Tìm theo nội dung | GIN `search` hoặc trigram | < 100ms |
| Xoá mềm 1 dòng | PK | < 5ms |

Đo bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu **giống production**, không phải bảng
100 dòng.

---

## 17. Diagnostic cookbook

### 17.1 Query chậm nhất

```sql
SELECT
  calls,
  round(total_exec_time::numeric, 1) AS total_ms,
  round(mean_exec_time::numeric, 2)  AS mean_ms,
  round(max_exec_time::numeric, 1)   AS max_ms,
  rows,
  left(query, 140) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

### 17.2 Query đang chạy

```sql
SELECT
  pid,
  usename,
  application_name,
  state,
  wait_event_type,
  wait_event,
  now() - query_start  AS query_age,
  now() - xact_start   AS xact_age,
  left(query, 140)     AS query
FROM pg_stat_activity
WHERE state <> 'idle'
ORDER BY query_start
LIMIT 30;
```

### 17.3 Blocking / lock

```sql
SELECT
  pid,
  pg_blocking_pids(pid) AS blockers,
  wait_event_type,
  wait_event,
  left(query, 140) AS query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

### 17.4 Kích thước bảng & index

```sql
SELECT
  c.relname,
  pg_size_pretty(pg_total_relation_size(c.oid))        AS total,
  pg_size_pretty(pg_relation_size(c.oid))              AS heap,
  pg_size_pretty(pg_indexes_size(c.oid))               AS indexes,
  s.n_live_tup,
  s.n_dead_tup
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 20;
```

### 17.5 Index không dùng

```sql
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint WHERE contype IN ('p','u','x')
  )
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 17.6 Seq scan nhiều

```sql
SELECT
  relname,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup,
  round(seq_tup_read::numeric / nullif(seq_scan, 0), 0) AS avg_rows_per_seqscan
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

Seq scan trên bảng nhỏ là bình thường; trên bảng lớn + `seq_tup_read` cao mới đáng lo.

### 17.7 Bloat

```sql
CREATE EXTENSION IF NOT EXISTS pgstattuple;

SELECT
  table_len,
  tuple_count,
  dead_tuple_count,
  round(dead_tuple_percent::numeric, 2) AS dead_pct,
  round(free_percent::numeric, 2)       AS free_pct
FROM pgstattuple('messages');
```

### 17.8 Cache hit ratio

```sql
SELECT
  datname,
  blks_hit,
  blks_read,
  round(100.0 * blks_hit / nullif(blks_hit + blks_read, 0), 2) AS hit_pct
FROM pg_stat_database
WHERE datname = current_database();
```

Mục tiêu OLTP: > 99% (sau warm-up). Thấp → thiếu RAM hoặc query scan quá nhiều.

### 17.9 Transaction ID age

```sql
SELECT datname, age(datfrozenxid) AS xid_age
FROM pg_database
ORDER BY xid_age DESC;
```

### 17.10 Replication lag

```sql
SELECT
  client_addr,
  state,
  sent_lsn,
  replay_lsn,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes,
  replay_lag
FROM pg_stat_replication;
```

### 17.11 Replication slot giữ WAL

```sql
SELECT
  slot_name,
  active,
  restart_lsn,
  pg_size_pretty(
    pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)
  ) AS retained_wal
FROM pg_replication_slots
ORDER BY pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) DESC;
```

Slot inactive giữ WAL mãi → đầy đĩa. Xoá slot không dùng:

```sql
SELECT pg_drop_replication_slot('slot_name');
```

### 17.12 Progress

```sql
SELECT * FROM pg_stat_progress_vacuum;
SELECT * FROM pg_stat_progress_create_index;
SELECT * FROM pg_stat_progress_copy;      -- PostgreSQL 14+
```

### 17.13 Setting hiện tại

```sql
SELECT name, setting, unit, source
FROM pg_settings
WHERE name IN (
  'shared_buffers', 'work_mem', 'maintenance_work_mem',
  'effective_cache_size', 'random_page_cost',
  'max_connections', 'wal_level', 'synchronous_commit',
  'autovacuum', 'statement_timeout', 'lock_timeout'
)
ORDER BY name;
```

### 17.14 Kết thúc query/kết nối

```sql
SELECT pg_cancel_backend(pid);       -- huỷ query
SELECT pg_terminate_backend(pid);    -- ngắt kết nối
```

Luôn kiểm tra `pg_stat_activity` trước khi terminate, tránh kill nhầm autovacuum/backup.

---

## 18. Checklist production

### Schema & dữ liệu

- [ ] PK cho mọi bảng; FK cho quan hệ quan trọng.
- [ ] `NOT NULL`/`CHECK`/`UNIQUE` ở database, không chỉ app.
- [ ] `timestamptz` cho mốc thời gian; không lưu ngày dạng text.
- [ ] `numeric` cho tiền; không `float`.
- [ ] Index cho FK và query feed; composite đúng thứ tự.
- [ ] Partial index cho soft delete / trạng thái.
- [ ] Không index tràn lan; review index không dùng.
- [ ] `ANALYZE` sau bulk load.

### Query

- [ ] Không `SELECT *` ở API.
- [ ] Keyset pagination cho feed; không `OFFSET` sâu.
- [ ] Không N+1.
- [ ] Query dùng parameterized, không nối chuỗi.
- [ ] `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu giống production.
- [ ] `pg_stat_statements` bật và có dashboard.
- [ ] `statement_timeout`/`lock_timeout` cho app role.

### Vận hành

- [ ] Autovacuum bật; tune bảng nóng.
- [ ] Giám sát `n_dead_tup`, `xid_age`, bloat.
- [ ] Transaction ngắn; `idle_in_transaction_session_timeout`.
- [ ] Connection pool (PgBouncer/Supabase pooler).
- [ ] `shared_buffers`, `work_mem`, `effective_cache_size` phù hợp RAM.
- [ ] Disk IOPS đủ; không NFS.
- [ ] Log slow query, lock wait, temp file, checkpoint.
- [ ] Cảnh báo disk, connection, replication lag, deadlock.

### Bảo mật

- [ ] App role không phải superuser/owner.
- [ ] Tách role migration và runtime.
- [ ] `REVOKE` quyền thừa; `search_path` cố định cho `SECURITY DEFINER`.
- [ ] RLS bật + `FORCE` nếu cần; test policy.
- [ ] `service_role`/secret không lộ client.
- [ ] TLS (`sslmode=verify-full`), `scram-sha-256`.
- [ ] Audit hành động nhạy cảm.
- [ ] Backup mã hoá, giới hạn quyền truy cập.

### Backup & HA

- [ ] Backup tự động + retention.
- [ ] PITR/WAL archiving nếu RPO thấp.
- [ ] **Test restore** định kỳ.
- [ ] Replication lag được giám sát.
- [ ] Runbook failover.
- [ ] Biết RPO/RTO thực tế.

### Migration

- [ ] Migration backward-compatible.
- [ ] `CREATE INDEX CONCURRENTLY` ngoài transaction.
- [ ] `NOT VALID` + `VALIDATE` cho constraint trên bảng lớn.
- [ ] Backfill theo batch, có throttle.
- [ ] `lock_timeout` trước DDL.
- [ ] Test trên bản sao dữ liệu production.
- [ ] Có kế hoạch rollback/roll-forward.

---

## 19. Anti-patterns nâng cao

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| Index mọi cột "cho chắc" | Đo query thật, index theo workload |
| `OFFSET` sâu cho infinite scroll | Keyset pagination `(created_at, id)` |
| `count(*)` mỗi lần mở app | `count: 'estimated'` / bảng counter |
| `SELECT *` + serialize cả bảng | Chọn cột, phân trang |
| N+1 query trong loop | JOIN / batch `IN` / `jsonb_agg` |
| Bọc cột trong hàm khi lọc | Range query / expression index |
| `NOT IN` với subquery có NULL | `NOT EXISTS` / anti-join |
| Ép `enable_seqscan=off` để "sửa" plan | Sửa index/statistic/query |
| Tắt autovacuum vì "chậm" | Tune theo bảng, giám sát bloat |
| `VACUUM FULL` định kỳ | `VACUUM` thường xuyên + `pg_repack` khi cần |
| Transaction mở chờ user | Transaction ngắn, timeout |
| `idle in transaction` | `idle_in_transaction_session_timeout` |
| Khoá nhiều bảng không theo thứ tự | Khoá theo `ORDER BY id`, retry deadlock |
| Không retry `40001`/`40P01` | Retry có backoff + jitter |
| Dùng DB làm queue không `SKIP LOCKED` | `FOR UPDATE SKIP LOCKED` |
| JSONB cho toàn bộ schema | Cột quan hệ + JSONB metadata |
| `LIKE '%x%'` không index | `pg_trgm` / FTS |
| FTS `to_tsvector` mỗi query | Generated column + GIN |
| `unaccent()` trong generated column | Wrapper `IMMUTABLE` |
| RLS mà không `FORCE` (app là owner) | `FORCE ROW LEVEL SECURITY` |
| `auth.uid()` gọi từng dòng | `(SELECT auth.uid())` |
| `SECURITY DEFINER` không `search_path` | `SET search_path = ...` |
| App dùng `service_role`/superuser | Role tối thiểu, RLS |
| Migration bọc `CREATE INDEX CONCURRENTLY` | Tách transaction |
| `ALTER TYPE`/`SET NOT NULL` giờ cao điểm | Expand–contract, `NOT VALID` |
| Backup nhưng chưa từng restore | Restore drill định kỳ |
| Bỏ qua replication slot inactive | Giám sát + drop slot chết |
| `ORDER BY random() LIMIT 1` bảng lớn | `TABLESAMPLE` / cột random đã index |
| Soft delete không partial index | Index `WHERE deleted_at IS NULL` |
| Xoá cứng dữ liệu không audit | Soft delete + audit log + retention |

### 19.1 Ghi chú với code hiện tại của `wedding-server`

- `DELETE /api/messages` dùng `neq("id", 0)` → **xoá toàn bộ**. Nên bỏ hoặc bảo vệ
  bằng admin + xác nhận + audit.
- `delete` không kiểm tra `count`/`data` → trả `success: true` dù không xoá gì.
- `COLUMN_NAME` lấy từ env làm tên bảng → nếu env bị đổi, API trỏ sai bảng. Nên cố định
  tên bảng hoặc validate allowlist.
- Cursor `before` chỉ dùng `created_at` → nên chuyển sang `(created_at, id)`.

---

## 20. Tài liệu tham khảo

### Chính thức

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/current/
- **EXPLAIN / Using EXPLAIN**: https://www.postgresql.org/docs/current/using-explain.html
- **Indexes**: https://www.postgresql.org/docs/current/indexes.html
- **Concurrency Control / MVCC**: https://www.postgresql.org/docs/current/mvcc.html
- **Explicit Locking**: https://www.postgresql.org/docs/current/explicit-locking.html
- **VACUUM**: https://www.postgresql.org/docs/current/routine-vacuuming.html
- **Partitioning**: https://www.postgresql.org/docs/current/ddl-partitioning.html
- **JSON Types**: https://www.postgresql.org/docs/current/datatype-json.html
- **Full Text Search**: https://www.postgresql.org/docs/current/textsearch.html
- **Row Security Policies**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Backup & Restore**: https://www.postgresql.org/docs/current/backup.html
- **High Availability**: https://www.postgresql.org/docs/current/high-availability.html

### Sách & blog

- **Use The Index, Luke!** — https://use-the-index-luke.com/
- **PostgreSQL 14 Administration Cookbook** — Simon Riggs, Gianni Ciolli
- **High Performance PostgreSQL** — Gregory Smith
- **CYBERTEC PostgreSQL Blog** — https://www.cybertec-postgresql.com/en/blog/
- **Depesz** — https://www.depesz.com/
- **explain.dalibo.com** — visualize plan: https://explain.dalibo.com/
- **explain.depesz.com** — https://explain.depesz.com/
- **pgPedia** — tra cứu tham số/feature: https://pgpedia.info/
- **PgTune** — gợi ý cấu hình: https://pgtune.leopard.in.ua/

### Supabase

- **Database**: https://supabase.com/docs/guides/database
- **RLS**: https://supabase.com/docs/guides/database/postgres/row-level-security
- **Connection pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Realtime**: https://supabase.com/docs/guides/realtime
- **Migrations**: https://supabase.com/docs/guides/deployment/database-migrations

### Công cụ

- **pgBadger** — phân tích log: https://github.com/darold/pgbadger
- **pg_repack**: https://reorg.github.io/pg_repack/
- **pg_partman**: https://github.com/pgpartman/pg_partman
- **Patroni** — HA: https://patroni.readthedocs.io/
- **pgBackRest**: https://pgbackrest.org/
- **WAL-G**: https://github.com/wal-g/wal-g
- **pgbench** — benchmark: https://www.postgresql.org/docs/current/pgbench.html

---

*Tài liệu tạo ngày 23/10/2026 — phần cơ bản xem tại
[`postgresql-basics.md`](./postgresql-basics.md).*
