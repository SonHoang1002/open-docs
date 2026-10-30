# SQL — Kiến thức cơ bản

> Tài liệu nền tảng SQL **độc lập với dialect**: mô hình quan hệ, kiểu dữ liệu, DDL/DML,
> JOIN, aggregate, subquery, transaction và index. Ví dụ dùng domain thương mại điện tử
> trung lập (`customers`, `products`, `orders`, `order_items`, `payments`, `shipments`),
> ghi rõ khác biệt PostgreSQL / MySQL / SQL Server / SQLite. Mặc định là PostgreSQL 16+
> nếu không ghi chú.
>
> Quy ước: ID UUID/ULID, tiền lưu integer **minor units** (`*_minor`), thời gian
> `timestamptz` UTC.

> 📌 Khi cần đào sâu PostgreSQL (kiến trúc, `psql`, EXPLAIN, MVCC, JSONB, RLS), đọc
> [`../postgres-sql/postgresql-basics.md`](../postgres-sql/postgresql-basics.md) và
> [`../postgres-sql/postgresql-advanced.md`](../postgres-sql/postgresql-advanced.md).
> Tài liệu này không lặp lại.

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
17. [Schema mẫu thương mại điện tử](#17-schema-mẫu-thương-mại-điện-tử)
18. [Bài tập](#18-bài-tập)
19. [Anti-patterns cơ bản](#19-anti-patterns-cơ-bản)
20. [Tài liệu tham khảo](#20-tài-liệu-tham-khảo)

---
## 1. Cơ sở dữ liệu quan hệ

Mô hình quan hệ biểu diễn dữ liệu bằng **quan hệ**; người dùng thấy dưới dạng **bảng**:
hàng (tuple/row), cột (attribute/column), kiểu + ràng buộc tạo thành miền giá trị.

Bảng là **tập hợp không có thứ tự**: không có `ORDER BY` thì DBMS trả thứ tự bất kỳ.

```sql
SELECT id FROM orders;                          -- thứ tự không bảo đảm
SELECT id FROM orders ORDER BY placed_at, id;   -- ổn định
```

| Khoá | Vai trò | Ví dụ |
|---|---|---|
| Primary key | Định danh duy nhất, không NULL | `orders.id` |
| Surrogate key | Khoá nhân tạo | `id uuid DEFAULT gen_random_uuid()` |
| Natural key | Khoá từ dữ liệu thật | `customers.email`, `products.sku` |
| Foreign key | Tham chiếu PK bảng khác | `order_items.order_id` |
| Composite key | PK nhiều cột | `(order_id, product_id)` nếu mỗi sản phẩm chỉ một dòng |
| Unique key | Không trùng, cho phép NULL | `payments.provider_ref` |

> 💡 Dùng surrogate key cho PK, đặt `UNIQUE` cho natural key. Đổi email/SKU không phải
> sửa mọi FK.

| Quan hệ | Biểu diễn | Ví dụ |
|---|---|---|
| 1–1 | FK + `UNIQUE` ở bảng con | `orders.customer_id` nếu mỗi khách chỉ một đơn (hiếm) |
| 1–N | FK ở bảng "nhiều" | `orders.customer_id`, `order_items.order_id` |
| N–N | Bảng nối, composite PK | `product_tags(product_id, tag_id)` |

**Schema** là namespace: PostgreSQL có schema trong database (`public`, `search_path`);
MySQL coi schema = database; SQL Server có `dbo`; SQLite chỉ có file database.

**ACID:** Atomicity (tất cả hoặc không), Consistency (ràng buộc luôn đúng), Isolation
(không thấy dở dang), Durability (commit rồi mất điện vẫn còn nhờ WAL/redo log). Càng
isolation cao càng ít concurrency — chi tiết ở [`sql-advanced.md`](./sql-advanced.md) §12.

### 1.1 Vì sao mô hình quan hệ vẫn quan trọng?

Dữ liệu giao dịch có ba đặc điểm: **liên kết chặt** (đơn → dòng đơn → sản phẩm), **ràng
buộc nghiệp vụ** (tổng tiền = subtotal − discount + shipping + tax), và **truy vấn linh
hoạt** (báo cáo theo tháng, theo khách, theo sản phẩm). Mô hình chuẩn hoá giúp:

1. Không lặp dữ liệu khách/sản phẩm trong từng đơn.
2. Database tự bảo vệ tính đúng khi có bug ứng dụng hoặc job import.
3. Planner có thống kê và index để tối ưu join.

Denormalize chỉ có lợi khi đã đo được chi phí join và có cơ chế đồng bộ rõ ràng.

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
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         text NOT NULL UNIQUE,
  name        text NOT NULL,
  price_minor bigint NOT NULL CHECK (price_minor >= 0),
  currency    char(3) NOT NULL DEFAULT 'USD'
);
```

> ⚠️ `FLOAT`/`DOUBLE` là xấp xỉ nhị phân (`0.1 + 0.2 <> 0.3`). Không dùng cho tiền.
> Dùng integer minor units hoặc `numeric` với scale cố định.

- **Chuỗi:** SQL Server cần `nvarchar` cho tiếng Việt; MySQL dùng `utf8mb4`; PostgreSQL
  `text` và `varchar(n)` hiệu năng tương đương, `varchar(n)` chủ yếu là ràng buộc.
- **Boolean:** MySQL/SQL Server dùng `1/0`; đừng so sánh với `'true'`.
- **Thời gian:** lưu UTC. `timestamptz` (PG) lưu UTC và hiển thị theo session;
  `timestamp` không múi giờ dễ sai. MySQL dùng `UTC_TIMESTAMP(6)`, SQL Server
  `SYSUTCDATETIME()`.
- **UUID:** tốt khi cần sinh ID trước/không đoán được; index lớn hơn số nguyên. UUIDv7
  gần tuần tự hơn, giảm phân mảnh index.
- **JSON:** payload linh hoạt, ít lọc theo trường con; trường hay lọc thì tách cột thật.

### 2.1 Chọn kiểu tiền

| Cách | Ví dụ | Ưu | Nhược |
|---|---|---|---|
| Integer minor units | `total_minor bigint` | Chính xác, nhanh, dễ đối soát | Phải quy ước scale |
| `numeric(12,2)` | `total numeric(12,2)` | Đọc trực tiếp | Chậm hơn, dễ lệch scale |
| `float` | `total float8` | Không nên dùng | Sai số |

Quy ước trong tài liệu: mọi bảng có tiền dùng `*_minor bigint` + `currency char(3)`.
Với VND, minor unit = đồng (`250000` nghĩa là 250.000 VND). Với USD, minor unit = cent
(`1999` nghĩa là 19,99 USD).

### 2.2 Thời gian: UTC ở tầng lưu trữ

```sql
-- ✅ Lưu UTC, hiển thị theo timezone của client
SET TIME ZONE 'UTC';
SELECT placed_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS local_time FROM orders;

-- ❌ Trộn giờ địa phương không có offset
SELECT '2026-10-30 09:00:00'::timestamp;   -- "wall clock", không biết múi giờ
```

Quy tắc: cột kết thúc bằng `_at` là `timestamptz`; cột chỉ có ngày (ví dụ `birth_date`)
dùng `date`; không lưu ngày dạng text.

---
## 3. DDL: định nghĩa cấu trúc

```sql
CREATE DATABASE shop;                       -- PostgreSQL
CREATE SCHEMA IF NOT EXISTS app;
-- MySQL: CHARACTER SET utf8mb4; SQL Server: CREATE DATABASE shop; USE shop;
```

SQLite không có `CREATE DATABASE`: `sqlite3 shop.db`.

```sql
CREATE TABLE customers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  full_name  text NOT NULL,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_customers_email UNIQUE (email),
  CONSTRAINT ck_customers_name CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120)
);

CREATE TABLE orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    uuid NOT NULL,
  status         text NOT NULL DEFAULT 'pending',
  currency       char(3) NOT NULL DEFAULT 'USD',
  subtotal_minor bigint NOT NULL DEFAULT 0 CHECK (subtotal_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  shipping_minor bigint NOT NULL DEFAULT 0 CHECK (shipping_minor >= 0),
  tax_minor      bigint NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor    bigint NOT NULL DEFAULT 0 CHECK (total_minor >= 0),
  placed_at      timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_orders_status CHECK (
    status IN ('pending','paid','fulfilled','cancelled','refunded')),
  CONSTRAINT ck_orders_total CHECK (
    total_minor = subtotal_minor - discount_minor + shipping_minor + tax_minor)
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

> ⚠️ `CASCADE` lan truyền: `DELETE FROM customers` có thể xoá đơn, dòng đơn, thanh toán,
> vận chuyển. Đếm dòng bằng `SELECT` trước. Với dữ liệu tài chính, ưu tiên `RESTRICT` +
> soft delete thay vì xoá cứng.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()          -- PostgreSQL
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY     -- PostgreSQL (nội bộ)
id BIGINT AUTO_INCREMENT PRIMARY KEY                   -- MySQL
id bigint IDENTITY(1,1) PRIMARY KEY                    -- SQL Server
id INTEGER PRIMARY KEY AUTOINCREMENT                   -- SQLite

line_total_minor bigint GENERATED ALWAYS AS
  (quantity * unit_price_minor) STORED                 -- PG/MySQL/SQLite
line_total_minor AS (quantity * unit_price_minor) PERSISTED  -- SQL Server
```

```sql
ALTER TABLE customers ADD COLUMN note text;
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;      -- PostgreSQL
ALTER TABLE customers ADD CONSTRAINT uq_customers_phone UNIQUE (phone);
ALTER TABLE customers RENAME COLUMN phone TO phone_number;  -- PostgreSQL

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders CASCADE;      -- PostgreSQL
TRUNCATE TABLE orders;                    -- nhanh, giữ cấu trúc
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
```

MySQL đổi kiểu bằng `MODIFY COLUMN`; SQL Server dùng `ALTER COLUMN`, đổi tên bằng
`sp_rename`. Trên bảng lớn, `ALTER TABLE` có thể khoá bảng hoặc rewrite — kiểm tra staging
trước. `TRUNCATE` không có `WHERE`, không rollback được ở MySQL; SQLite không có
`TRUNCATE` — dùng `DELETE FROM`.

### 3.1 Thứ tự tạo bảng và FK

Tạo theo thứ tự phụ thuộc: `customers` → `products` → `orders` → `order_items` →
`payments`/`shipments`. Khi xoá thì ngược lại, hoặc dùng `CASCADE` có kiểm soát. Trong
migration lớn, thêm FK bằng `NOT VALID` rồi `VALIDATE CONSTRAINT` để tránh khoá bảng lâu.

### 3.2 Generated column cho tiền dòng đơn

`line_total_minor = quantity * unit_price_minor` nên là generated column hoặc được tính
trong cùng transaction. Nếu lưu riêng mà không có ràng buộc, dữ liệu sẽ lệch khi code
cập nhật một phía.

```sql
CREATE TABLE order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity         integer NOT NULL CHECK (quantity > 0),
  unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor bigint GENERATED ALWAYS AS
                   (quantity * unit_price_minor) STORED,
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

---
## 4. Chuẩn hoá dữ liệu

Chuẩn hoá giảm **dư thừa** và **dị thường cập nhật**: một thông tin chỉ nằm một nơi.

**1NF — nguyên tử.** Mỗi ô một giá trị, không danh sách (`tags = 'a,b,c'` là sai).

```sql
CREATE TABLE tags (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);
CREATE TABLE product_tags (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
```

**2NF — phụ thuộc đầy đủ vào khoá.** Với PK composite, cột không được phụ thuộc một phần
khoá. `product_name` không thuộc `(order_id, product_id)`; đặt ở `products`.

**3NF — không phụ thuộc bắc cầu.** Cột không phụ thuộc cột không phải khoá (ví dụ
`postal_code → city`). **BCNF:** mọi determinant là superkey; 3NF đủ cho hầu hết ứng
dụng, BCNF quan trọng khi có nhiều khoá ứng viên chồng chéo.

### 4.1 Denormalization có chủ đích

Chỉ denormalize khi: (1) đã đo được bottleneck, (2) có cơ chế đồng bộ (trigger, job, cùng
transaction), (3) chấp nhận độ trễ. Ví dụ hợp lý: `orders.total_minor` là snapshot tại
thời điểm đặt hàng — không tính lại từ `order_items` mỗi lần đọc, vì giá sản phẩm có thể
đổi. Không hợp lý: copy `customer_name` vào mọi bảng mà không có lý do lịch sử.

```sql
-- ✅ Snapshot giá tại thời điểm mua
SELECT oi.quantity, oi.unit_price_minor, p.price_minor AS current_price_minor
FROM order_items oi JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = $1;
```

`unit_price_minor` trong `order_items` là **giá lịch sử**; `products.price_minor` là giá
hiện tại. Đây là denormalization có chủ đích, không phải lỗi chuẩn hoá.

### 4.2 ERD

```text
customers 1──N orders 1──N order_items N──1 products
                  │
                  ├──1──N payments
                  └──1──N shipments
products N──N tags (qua product_tags)
```

Quy ước: hình chữ nhật = bảng, đường nối = quan hệ `1—N`, ghi rõ PK/FK. Công cụ:
dbdiagram.io, drawSQL, Mermaid.

### 4.3 Checklist thiết kế schema orders

- [ ] `orders` có `customer_id`, trạng thái, tiền tệ, tổng tiền, mốc thời gian.
- [ ] `order_items` lưu **snapshot** `unit_price_minor` và `quantity`.
- [ ] Tổng tiền có `CHECK` hoặc được tính trong cùng transaction.
- [ ] `payments` tách khỏi `orders`; một đơn có thể có nhiều lần thanh toán/hoàn tiền.
- [ ] `shipments` tách riêng; một đơn có thể giao nhiều kiện.
- [ ] FK có index ở phía con; trạng thái có CHECK; soft delete có partial index.

---
## 5. DML: thêm, sửa, xoá

```sql
INSERT INTO customers (email, full_name, phone)
VALUES ('an@example.com', 'Nguyễn An', '+84901234567');

INSERT INTO orders (customer_id, status, currency, subtotal_minor, total_minor)
VALUES ('00000000-0000-0000-0000-000000000001', 'pending', 'USD', 4998, 4998);

INSERT INTO orders_archive (id, customer_id, total_minor, placed_at)
SELECT id, customer_id, total_minor, placed_at FROM orders
WHERE placed_at < '2025-01-01';
```

Luôn liệt kê cột: `INSERT INTO t VALUES (...)` phụ thuộc thứ tự và vỡ khi thêm cột. Batch
500–1000 dòng; hàng triệu dòng dùng `COPY` (PG), `LOAD DATA` (MySQL), `BULK INSERT`
(SQL Server).

```sql
UPDATE orders SET status = 'paid', updated_at = now() WHERE id = $1;

UPDATE order_items oi SET unit_price_minor = p.price_minor   -- PostgreSQL
FROM products p WHERE oi.product_id = p.id AND oi.order_id = $1;

UPDATE order_items oi JOIN products p ON p.id = oi.product_id  -- MySQL
SET oi.unit_price_minor = p.price_minor WHERE oi.order_id = $1;

UPDATE oi SET oi.unit_price_minor = p.price_minor              -- SQL Server
FROM order_items AS oi JOIN products AS p ON p.id = oi.product_id
WHERE oi.order_id = $1;

DELETE FROM orders
WHERE status = 'cancelled' AND placed_at < now() - interval '2 years';

DELETE FROM order_items oi USING orders o                    -- PostgreSQL
WHERE oi.order_id = o.id AND o.status = 'cancelled';
```

SQLite hỗ trợ `UPDATE ... FROM` từ 3.33.0; MySQL xoá theo join dùng
`DELETE oi FROM order_items oi JOIN orders o ...`.

> ⚠️ Chạy `SELECT` với **cùng** `WHERE` để đếm dòng trước khi `UPDATE`/`DELETE`. Không có
> `WHERE` là toàn bảng. `TRUNCATE` nhanh hơn nhưng không có điều kiện.

| Hệ | Trả về dòng đã ghi | Version |
|---|---|---|
| PostgreSQL | `RETURNING id, created_at` | 8.2+ |
| SQLite | `RETURNING *` | 3.35+ |
| MySQL | Không có; dùng `LAST_INSERT_ID()` + `SELECT` | — |
| SQL Server | `OUTPUT INSERTED.id` | 2005+ |

```sql
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES ($1, 'stripe', $2, 4998, 'USD', 'captured')
ON CONFLICT (provider, provider_ref) DO UPDATE      -- PostgreSQL/SQLite 3.24+
SET status = EXCLUDED.status,
    amount_minor = EXCLUDED.amount_minor;

INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES (?, 'stripe', ?, 4998, 'USD', 'captured')
ON DUPLICATE KEY UPDATE                            -- MySQL
  status = VALUES(status),
  amount_minor = VALUES(amount_minor);
```

SQL Server dùng `MERGE` (nhiều cạm bẫy — xem [`sql-advanced.md`](./sql-advanced.md) §6).

### 5.1 Idempotency khi tạo đơn

Client retry có thể tạo hai đơn. Cách đúng là unique key theo `request_id`:

```sql
CREATE TABLE idempotency_keys (
  request_id uuid PRIMARY KEY,
  response   jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO idempotency_keys (request_id, response)
VALUES ($1, $2)
ON CONFLICT (request_id) DO NOTHING
RETURNING request_id;
```

Nếu insert 0 dòng, đọc `response` cũ và trả lại — không tạo side effect lần hai.

---
## 6. SELECT và thứ tự thực thi logic

```sql
SELECT DISTINCT o.status, count(*) AS total
FROM orders AS o
WHERE o.placed_at >= '2025-01-01'
GROUP BY o.status
HAVING count(*) >= 5
ORDER BY total DESC
LIMIT 10 OFFSET 0;
```

Thứ tự **viết** khác thứ tự **chạy**: `FROM/JOIN` → `WHERE` → `GROUP BY` → `HAVING` →
window → `SELECT` → `DISTINCT` → `ORDER BY` → `LIMIT/OFFSET`.

Hệ quả: alias ở `SELECT` **không** dùng được ở `WHERE` nhưng dùng được ở `ORDER BY`;
`HAVING` dùng aggregate, `WHERE` thì không; thiếu `ORDER BY` thì `LIMIT` trả dòng tuỳ ý.

```sql
SELECT status, count(*) AS total
FROM orders GROUP BY status HAVING count(*) > 10;
```

`WHERE` nhận `=`, `<>`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `IN`, `LIKE`, `ILIKE` (PG),
`IS NULL`, `AND`, `OR`, `NOT`. `DISTINCT` áp dụng trên tổ hợp cột; nó thường là dấu hiệu
join nhân dòng hoặc thiếu `GROUP BY` — kiểm tra trước khi dùng để "che" lỗi.

`ORDER BY` hỗ trợ `ASC`/`DESC`, `NULLS FIRST/LAST` (PG, SQLite 3.30+; MySQL dùng
`ORDER BY col IS NULL, col`). Collation ảnh hưởng thứ tự tiếng Việt.

```sql
SELECT * FROM orders ORDER BY placed_at DESC, id DESC LIMIT 20 OFFSET 40;
SELECT * FROM orders ORDER BY placed_at DESC
OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY;        -- chuẩn SQL / SQL Server
SELECT * FROM orders ORDER BY placed_at DESC LIMIT 40, 20;  -- MySQL
```

`OFFSET` lớn chậm vì vẫn phải đọc và bỏ qua. Feed nên dùng **keyset pagination** trên
`(placed_at, id)` — xem [`sql-advanced.md`](./sql-advanced.md) §18.

### 6.1 Keyset pagination cơ bản

```sql
-- Trang đầu
SELECT id, customer_id, total_minor, placed_at
FROM orders
WHERE status = 'paid' AND deleted_at IS NULL
ORDER BY placed_at DESC, id DESC
LIMIT 20;

-- Trang sau: cursor = (placed_at, id) của dòng cuối
SELECT id, customer_id, total_minor, placed_at
FROM orders
WHERE status = 'paid' AND deleted_at IS NULL
  AND (placed_at, id) < ($1, $2)
ORDER BY placed_at DESC, id DESC
LIMIT 20;
```

Index `(status, placed_at DESC, id DESC) WHERE deleted_at IS NULL` phục vụ cả filter,
sort và cursor.

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
SELECT * FROM orders WHERE deleted_at = NULL;   -- ❌ luôn rỗng
SELECT * FROM orders WHERE deleted_at IS NULL;  -- ✅

SELECT COALESCE(deleted_at, placed_at) AS reference_at FROM orders;
SELECT NULLIF(discount_minor, 0) AS discount FROM orders;
```

`IS DISTINCT FROM` (PG, SQLite 3.39+) so sánh an toàn với NULL; MySQL dùng `<=>`.
`COALESCE` là chuẩn, nhận nhiều tham số; `IFNULL` (MySQL/SQLite) và `ISNULL` (SQL Server)
chỉ hai.

### 7.1 Bẫy NOT IN

```sql
-- ❌ Nếu subquery có một NULL, kết quả rỗng
SELECT * FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);

-- ✅
SELECT c.* FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

`NOT IN (1, NULL)` tương đương `<> 1 AND <> NULL` → luôn `UNKNOWN`. Đây là lỗi production
phổ biến nhất liên quan NULL.

### 7.2 NULL trong aggregate

`COUNT(*)` đếm mọi dòng; `COUNT(col)`, `SUM`, `AVG`, `MIN`, `MAX` bỏ qua NULL. `SUM` toàn
NULL → NULL; `AVG` chia cho số dòng **không NULL**; `NULL + 1` → `NULL`.

```sql
SELECT avg(quantity) FROM order_items;              -- bỏ qua NULL
SELECT avg(COALESCE(quantity,0)) FROM order_items;  -- coi NULL = 0
```

> ⚠️ PostgreSQL/MySQL cho nhiều NULL trong `UNIQUE`; SQL Server chỉ một. `ORDER BY` đặt
> NULL khác nhau giữa các hệ — chỉ định `NULLS FIRST/LAST` nếu quan trọng.

### 7.3 NULL trong tính tiền

`total_minor = subtotal - discount + shipping + tax`: nếu bất kỳ thành phần nào NULL,
tổng thành NULL. Vì vậy các cột tiền nên `NOT NULL DEFAULT 0`; NULL chỉ dùng khi thật sự
"chưa biết" (ví dụ `refunded_at`).

---
## 8. JOIN

```sql
SELECT o.id, o.total_minor, c.full_name
FROM orders o INNER JOIN customers c ON c.id = o.customer_id;

SELECT c.id, c.full_name, o.id AS order_id
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id;

SELECT c.full_name, o.id
FROM customers c FULL OUTER JOIN orders o ON o.customer_id = c.id;

SELECT oi.id, p.name AS product_name
FROM order_items oi JOIN products p ON p.id = oi.product_id;
```

| Loại | Kết quả | Dùng khi |
|---|---|---|
| `INNER` | Chỉ cặp khớp | Báo cáo cần đủ hai phía |
| `LEFT` | Toàn bộ trái + khớp | "Khách chưa có đơn" |
| `RIGHT` | Toàn bộ phải + khớp | Hiếm; đảo bảng rõ hơn |
| `FULL` | Cả hai bên | Đối soát |
| `CROSS` | Mọi tổ hợp | Sinh lịch, test data |

> ⚠️ MySQL không có `FULL OUTER JOIN`: ghép `LEFT JOIN` với nhánh `RIGHT JOIN`/anti-join
> bằng `UNION ALL`.

**`ON` vs `WHERE`:** với `INNER JOIN` tương đương; với `OUTER JOIN` khác hoàn toàn.

```sql
-- ✅ Giữ mọi khách; chỉ join đơn đã thanh toán
SELECT c.full_name, o.id AS paid_order
FROM customers c LEFT JOIN orders o
  ON o.customer_id = c.id AND o.status = 'paid';
-- ❌ Lọc sau join → mất khách chưa có đơn đã thanh toán
SELECT c.full_name, o.id AS paid_order
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid';
```

Quy tắc: lọc **bảng phải** đặt ở `ON`; lọc **kết quả cuối** đặt ở `WHERE`.

```sql
SELECT o.id, o.status, c.full_name, oi.product_id, p.name, oi.quantity
FROM orders o
JOIN customers c   ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p    ON p.id = oi.product_id
WHERE o.id = $1 ORDER BY p.name;

-- Semi join / anti join
SELECT c.id, c.full_name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
SELECT c.id, c.full_name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

`EXISTS` dừng khi tìm thấy một dòng, an toàn với NULL và thường tốt hơn `IN` với subquery
lớn. `NOT EXISTS` rõ ý định hơn `LEFT JOIN ... WHERE right.id IS NULL`.

```sql
SELECT c.id, c.full_name,
       count(DISTINCT o.id) AS orders,
       COALESCE(sum(o.total_minor) FILTER (WHERE o.status = 'paid'), 0) AS revenue_minor
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.full_name
ORDER BY revenue_minor DESC;
```

### 8.1 Join nhân dòng (fan-out)

Join nhiều bảng 1–N cùng lúc có thể nhân dòng. Ví dụ join `orders` với cả `order_items`
và `payments` khiến mỗi item nhân với mỗi payment. Dấu hiệu: `SUM` bị phóng đại.

```sql
-- ❌ Doanh thu và số item bị nhân chéo
SELECT o.id, sum(oi.line_total_minor) AS items_total,
       sum(p.amount_minor) AS paid_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN payments p     ON p.order_id = o.id
GROUP BY o.id;

-- ✅ Aggregate riêng rồi join
WITH items AS (
  SELECT order_id, sum(line_total_minor) AS items_total
  FROM order_items GROUP BY order_id
), paid AS (
  SELECT order_id, sum(amount_minor) AS paid_total
  FROM payments WHERE status = 'captured' GROUP BY order_id
)
SELECT o.id, i.items_total, p.paid_total
FROM orders o
LEFT JOIN items i ON i.order_id = o.id
LEFT JOIN paid p  ON p.order_id = o.id;
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
SELECT count(*) AS total_orders,
       count(DISTINCT customer_id) AS customers,
       count(*) FILTER (WHERE status = 'paid') AS paid_orders,
       COALESCE(sum(total_minor) FILTER (WHERE status = 'paid'), 0) AS revenue_minor
FROM orders;
```

`FILTER` (chuẩn SQL:2003) có ở PG và SQLite 3.30+; MySQL/SQL Server dùng
`sum(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`.

```sql
SELECT status, currency, count(*) AS total
FROM orders
GROUP BY status, currency
HAVING count(*) >= 5
ORDER BY status, currency;
```

Mọi cột không aggregate trong `SELECT` phải có trong `GROUP BY`; MySQL cũ tắt
`ONLY_FULL_GROUP_BY` và trả giá trị tuỳ ý — bật lại. `HAVING` lọc sau nhóm; điều kiện
không liên quan aggregate nên đặt ở `WHERE` để giảm dữ liệu sớm.

Không lồng aggregate trực tiếp; dùng subquery/CTE. `ROLLUP` sinh dòng tổng theo cấp (PG,
MySQL, SQL Server; SQLite không hỗ trợ).

```sql
WITH per_day AS (
  SELECT placed_at::date AS day, count(*) AS total
  FROM orders GROUP BY placed_at::date
)
SELECT avg(total) FROM per_day;
```

### 9.1 Doanh thu: đếm gì và lọc gì?

Doanh thu thường chỉ tính `status = 'paid'` hoặc `fulfilled`, không tính `pending` và
`cancelled`. Nếu hoàn tiền, cần trừ `refunded`. Định nghĩa này phải thống nhất giữa báo
cáo, API và dashboard:

```sql
SELECT date_trunc('day', placed_at)::date AS day,
       sum(total_minor) FILTER (WHERE status IN ('paid','fulfilled')) AS revenue_minor,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled
FROM orders
WHERE placed_at >= now() - interval '30 days'
GROUP BY 1 ORDER BY 1;
```

### 9.2 `GROUPING SETS` cho báo cáo đa chiều

```sql
SELECT status, currency, count(*) AS orders,
       sum(total_minor) AS total_minor
FROM orders
GROUP BY GROUPING SETS ((status), (currency), ())
ORDER BY status NULLS LAST, currency NULLS LAST;
```

`GROUPING(status)` phân biệt NULL thật với NULL do rollup sinh ra.

---
## 10. Subquery

```sql
-- Scalar: đúng một dòng, một cột
SELECT c.full_name,
       (SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
FROM customers c;

-- IN
SELECT * FROM orders
WHERE customer_id IN (SELECT id FROM customers WHERE created_at >= '2025-01-01');

-- EXISTS tương quan
SELECT c.id, c.full_name FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.placed_at >= now() - interval '30 days'
);

-- Derived table
SELECT status, avg(total) FROM (
  SELECT c.id, o.status, count(*) AS total
  FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, o.status
) AS per_customer GROUP BY status;
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

### 10.1 Correlated subquery và N+1

Correlated subquery chạy về mặt logic cho từng dòng ngoài; planner có thể biến thành
join, nhưng nếu không, nó là dạng N+1 trong SQL. Với bảng lớn, ưu tiên `JOIN`/`LATERAL`
có index hỗ trợ.

```sql
-- Có thể ổn với ít khách, tệ với 1 triệu khách nếu không được decorrelate
SELECT c.id,
       (SELECT max(o.placed_at) FROM orders o WHERE o.customer_id = c.id) AS last_order
FROM customers c;

-- ✅ Thường rõ và nhanh hơn với index (customer_id, placed_at DESC)
SELECT c.id, o.last_order
FROM customers c
LEFT JOIN LATERAL (
  SELECT max(placed_at) AS last_order FROM orders o WHERE o.customer_id = c.id
) o ON true;
```

---
## 11. Set operations

```sql
SELECT email FROM customers_2024
UNION                                   -- hợp, loại trùng
SELECT email FROM customers_2025;

SELECT email FROM customers_2024
UNION ALL                               -- giữ trùng, nhanh hơn
SELECT email FROM customers_2025;

SELECT customer_id FROM orders WHERE status = 'paid'
INTERSECT SELECT customer_id FROM orders WHERE status = 'refunded';

SELECT customer_id FROM orders
EXCEPT SELECT customer_id FROM payments;   -- MySQL 8.0.31+
```

Quy tắc: cùng số cột, kiểu tương thích theo thứ tự, tên cột lấy từ query đầu, `ORDER BY`
ở cuối. `UNION` tốn sort/hash để loại trùng. MySQL cũ không có `INTERSECT`/`EXCEPT` —
emulate bằng `JOIN`/`NOT EXISTS`.

### 11.1 Đối soát hai nguồn

```sql
-- Đơn có trong hệ thống nhưng thiếu ở bảng đối soát
SELECT id FROM orders
EXCEPT
SELECT order_id FROM payment_reconciliation;

-- Dòng chỉ có ở một bên, kèm cờ
SELECT COALESCE(a.id, b.id) AS order_id,
       (a.id IS NOT NULL) AS in_orders,
       (b.id IS NOT NULL) AS in_recon
FROM orders a
FULL OUTER JOIN payment_reconciliation b ON b.order_id = a.id
WHERE a.id IS NULL OR b.id IS NULL;
```

---
## 12. CASE, CAST, chuỗi và ngày

```sql
SELECT id,
  CASE WHEN total_minor >= 100000 THEN 'VIP'
       WHEN total_minor >= 10000  THEN 'Standard'
       ELSE 'Small' END AS order_tier
FROM orders;

SELECT CAST('42' AS integer), CAST(placed_at AS date);
SELECT full_name || ' <' || email || '>' FROM customers;   -- PG/SQLite
SELECT CONCAT(full_name, ' <', email, '>') FROM customers; -- MySQL/SQL Server
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
       DATE_FORMAT(placed_at, '%Y-%m-%d');                          -- MySQL
SELECT GETDATE(), DATEADD(day, -7, GETDATE()),
       FORMAT(placed_at, 'yyyy-MM-dd');                             -- SQL Server
SELECT datetime('now'), datetime('now','-7 days'),
       strftime('%Y-%m-%d', placed_at);                             -- SQLite
```

> ⚠️ `BETWEEN '2025-01-01' AND '2025-01-31'` bỏ sót phần lớn ngày 31 nếu cột là
> `timestamp`. Dùng nửa khoảng `>= '2025-01-01' AND < '2025-02-01'`.

### 12.1 Chuẩn hoá chuỗi trước khi so sánh

```sql
-- Email không nên phân biệt hoa/thường
CREATE UNIQUE INDEX uq_customers_email_lower ON customers (lower(email));

SELECT id FROM customers WHERE lower(email) = lower($1);

-- Số điện thoại: bỏ ký tự không phải số ở tầng ứng dụng hoặc expression index
SELECT regexp_replace(phone, '\D', '', 'g') FROM customers;
```

Không `lower()` cột trong `WHERE` nếu không có expression index — index thường sẽ không
được dùng.

---
## 13. View, materialized view, sequence

```sql
CREATE VIEW v_paid_orders AS
SELECT o.id, o.customer_id, o.total_minor, o.placed_at
FROM orders o
WHERE o.status = 'paid' AND o.deleted_at IS NULL;

CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT placed_at::date AS day, sum(total_minor) AS revenue_minor
FROM orders WHERE status = 'paid'
GROUP BY placed_at::date;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_revenue;  -- cần unique index

CREATE SEQUENCE order_number_seq START 1000;
SELECT nextval('order_number_seq');
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

### 13.1 View bảo mật và view hiệu năng

- **Bảo mật:** view có thể ẩn cột nhạy cảm (`payment.provider_ref`) và giới hạn dòng.
- **Hiệu năng:** view không tự tối ưu; predicate bên ngoài có thể được đẩy vào nếu view
  đơn giản. Với view nhiều join, kiểm tra plan thực tế.
- **Ổn định API:** view là hợp đồng ổn định khi schema nội bộ đổi.

---
## 14. Transaction cơ bản

```sql
BEGIN;
UPDATE orders SET status = 'paid', updated_at = now() WHERE id = $1;
INSERT INTO payments (order_id, provider, provider_ref, amount_minor, currency, status)
VALUES ($1, 'stripe', $2, 4998, 'USD', 'captured');
COMMIT;

BEGIN;
DELETE FROM order_items WHERE order_id = $1;
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
INSERT INTO customers (email, full_name) VALUES ('an@example.com', 'Nguyễn An');
SAVEPOINT before_order;
INSERT INTO orders (customer_id, total_minor) VALUES ($1, 0);
ROLLBACK TO SAVEPOINT before_order;   -- giữ customer, huỷ order
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

### 14.1 Transaction cho nghiệp vụ đặt hàng

Một đơn hàng cần nhất quán: tạo `orders`, `order_items`, trừ tồn kho, ghi `payments`.
Nếu một bước lỗi, tất cả phải rollback. Đừng gọi API thanh toán bên ngoài **trong** lúc
giữ transaction — thời gian chờ mạng làm lock lâu. Pattern thường dùng: tạo order
`pending` → gọi payment ngoài → cập nhật `paid` trong transaction ngắn, có idempotency key.

---
## 15. Index cơ bản

```sql
CREATE INDEX idx_orders_placed_at ON orders (placed_at DESC);
CREATE INDEX idx_orders_customer_placed ON orders (customer_id, placed_at DESC);
CREATE UNIQUE INDEX uq_customers_email_lower ON customers (lower(email))
  WHERE deleted_at IS NULL;
```

B-tree phù hợp `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, prefix `LIKE 'abc%'`; không phù hợp
`LIKE '%abc'`, full-text, dữ liệu không gian (dùng GIN/GiST).

**Composite index** `(customer_id, placed_at)` dùng được cho `WHERE customer_id = $1`,
cho cả hai cột, và cho `ORDER BY placed_at` khi `customer_id` cố định; **không** dùng được
cho `WHERE placed_at > ...` một mình. Quy tắc: cột `=` trước, cột range/sort sau.

| Có lợi | Ít lợi |
|---|---|
| Bảng lớn, lọc ít dòng | Bảng vài trăm dòng |
| Selectivity cao | Boolean gần cân bằng |
| Query thường xuyên | Bảng ghi nhiều hơn đọc |
| `ORDER BY` khớp index | Query trả phần lớn bảng |

Index làm chậm ghi và tốn dung lượng. Kiểm tra bằng `EXPLAIN ANALYZE`; tìm `Index
Scan`/`Bitmap Index Scan`/`Index Only Scan`. `Seq Scan` trên bảng lớn: kiểm tra index tồn
tại, cột bị bọc hàm, implicit cast, hoặc planner ước lượng sai.

### 15.1 Index cho FK và trạng thái

PostgreSQL **không tự tạo index** cho cột FK. Nếu xoá customer hoặc join theo
`customer_id`, thiếu index sẽ gây seq scan bảng `orders`.

```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_payments_order_id ON payments (order_id);

-- Partial index cho trạng thái ít dòng nhưng query thường xuyên
CREATE INDEX idx_orders_pending ON orders (placed_at)
  WHERE status = 'pending';
```

---
## 16. Bảo mật cơ bản

```sql
CREATE ROLE app_read LOGIN PASSWORD 'doi-mat-khau-manh-truoc-khi-dung';
GRANT CONNECT ON DATABASE shop TO app_read;
GRANT USAGE ON SCHEMA public TO app_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read;
REVOKE ALL ON orders FROM PUBLIC;
```

| Vai trò | Quyền |
|---|---|
| `app_read` | `SELECT` |
| `app_write` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` bảng nghiệp vụ |
| `migration` | DDL, chỉ trong CI/CD |
| `admin` | Toàn quyền, không dùng cho app |

MySQL dùng `CREATE USER` + `GRANT ... ON shop.*`; SQL Server dùng login → user → role
(`db_datareader`, `db_datawriter`); SQLite bảo vệ bằng quyền file.

```ts
// ❌ Nối chuỗi
const sql = `SELECT * FROM orders WHERE status = '${status}'`;

// ✅ Prepared statement
const { rows } = await client.query(
  'SELECT id, total_minor FROM orders WHERE status = $1', [status]
);
```

Placeholder: `$1` (PG), `?` (MySQL/SQLite), `@p1` (SQL Server). Không nối input vào SQL;
không tin stored procedure nếu bên trong vẫn `EXEC` chuỗi động; whitelist tên cột/sort
(identifier không tham số hoá được); tài khoản app quyền tối thiểu; không trả stack trace.

### 16.1 RLS là tính năng PostgreSQL, không phải framework

PostgreSQL hỗ trợ **Row Level Security**: lọc dòng theo policy ngay trong database. Đây là
lớp bảo vệ bổ sung cho `GRANT`, không thay thế `GRANT`. Ví dụ multi-tenant:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY orders_tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
```

Ứng dụng `SET LOCAL app.tenant_id = '...'` trong transaction. RLS chỉ có ở PostgreSQL;
các hệ khác phải lọc ở tầng ứng dụng hoặc dùng view.

---
## 17. Schema mẫu thương mại điện tử

Mô hình chuẩn hoá gồm `customers`, `products`, `orders`, `order_items`, `payments`,
`shipments`. `orders` là aggregate root; `order_items` là snapshot giá; `payments` và
`shipments` tách riêng vì có vòng đời riêng.

```sql
CREATE TABLE customers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  full_name  text NOT NULL,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_customers_email UNIQUE (email),
  CONSTRAINT ck_customers_name CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120)
);

CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         text NOT NULL UNIQUE,
  name        text NOT NULL,
  price_minor bigint NOT NULL CHECK (price_minor >= 0),
  currency    char(3) NOT NULL DEFAULT 'USD',
  status      text NOT NULL DEFAULT 'active'
              CHECK (status IN ('draft','active','archived')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded')),
  currency       char(3) NOT NULL DEFAULT 'USD',
  subtotal_minor bigint NOT NULL DEFAULT 0 CHECK (subtotal_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  shipping_minor bigint NOT NULL DEFAULT 0 CHECK (shipping_minor >= 0),
  tax_minor      bigint NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor    bigint NOT NULL DEFAULT 0 CHECK (total_minor >= 0),
  placed_at      timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz,
  CONSTRAINT ck_orders_total CHECK (
    total_minor = subtotal_minor - discount_minor + shipping_minor + tax_minor)
);

CREATE TABLE order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity         integer NOT NULL CHECK (quantity > 0),
  unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor bigint GENERATED ALWAYS AS
                   (quantity * unit_price_minor) STORED,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider      text NOT NULL,
  provider_ref  text NOT NULL,
  amount_minor  bigint NOT NULL CHECK (amount_minor > 0),
  currency      char(3) NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','authorized','captured','failed','refunded')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_payments_provider_ref UNIQUE (provider, provider_ref)
);

CREATE TABLE shipments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  carrier     text NOT NULL,
  tracking_no text,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','shipped','delivered','returned')),
  shipped_at  timestamptz,
  delivered_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_shipments_tracking UNIQUE (carrier, tracking_no)
);
```

`CHECK` kết hợp tổng tiền là **business rule ở tầng dữ liệu**: không thể lưu đơn có tổng
sai. Validate chỉ ở app sẽ bị lách bởi import CSV, job, client khác.

```sql
CREATE INDEX idx_orders_feed
  ON orders (status, placed_at DESC, id DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_customer ON orders (customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_shipments_order ON shipments (order_id);
```

Index `(status, placed_at DESC, id DESC)` phục vụ filter, sort và keyset pagination.

### 17.1 Câu hỏi thiết kế thường gặp

| Câu hỏi | Trả lời ngắn |
|---|---|
| Vì sao không lưu `product_name` trong `order_items`? | Có thể lưu snapshot nếu cần hiển thị lịch sử; nhưng giá và tên sản phẩm thay đổi, nên snapshot có kiểm soát |
| Vì sao `payments` tách bảng? | Một đơn có thể thanh toán nhiều lần, hoàn tiền, thất bại rồi retry |
| Vì sao `total_minor` không generated? | Phụ thuộc nhiều bảng và quy tắc giảm giá; nên tính trong transaction và kiểm bằng `CHECK` |
| Vì sao dùng `ON DELETE RESTRICT`? | Không mất dấu vết tài chính; xoá cứng chỉ qua quy trình riêng |
| Soft delete có cần unique index? | Có, partial unique `WHERE deleted_at IS NULL` để cho phép tạo lại bản ghi |

### 17.2 Chuyển từ schema phẳng sang chuẩn hoá

Nếu dữ liệu cũ lưu mọi thứ trong một bảng `orders_flat(customer_email, product_sku,
quantity, total, created_at)`, chiến lược an toàn:

1. Tạo bảng mới (`customers`, `products`, `orders`, `order_items`).
2. Backfill theo batch, khớp bằng natural key đã chuẩn hoá.
3. Dual-write hoặc trigger đồng bộ trong giai đoạn chuyển tiếp.
4. Chuyển đọc sang bảng mới, kiểm tra đối soát.
5. Bỏ cột cũ sau vài release.

Không đổi một lần trong production đang chạy (xem [`sql-advanced.md`](./sql-advanced.md)
§20).

---
## 18. Bài tập

**Mức dễ:**
1. Đếm tổng số đơn.
2. 10 đơn mới nhất (`id`, `customer_id`, `total_minor`, `placed_at`).
3. Đếm khách theo trạng thái đơn (kể cả khách chưa có đơn).

**Mức trung bình:**
4. Khách chưa có đơn nào.
5. Mỗi trạng thái: số đơn, số khách, tổng tiền.
6. Top 5 khách theo tổng chi tiêu đã thanh toán.
7. Số đơn theo ngày trong 30 ngày gần nhất, ngày có ≥ 10 đơn.

**Mức khó:**
8. Với mỗi khách, đơn mới nhất (nếu có).
9. Khách có tổng chi tiêu lớn hơn trung bình.
10. Doanh thu mỗi ngày kèm tổng luỹ kế.
11. Danh sách đơn kèm số item và trạng thái thanh toán, phân trang 20 dòng.
12. Tìm cặp sản phẩm thường được mua cùng nhau.

### 18.1 Đáp án gợi ý

```sql
-- 1
SELECT count(*) FROM orders;
-- 2
SELECT id, customer_id, total_minor, placed_at FROM orders
ORDER BY placed_at DESC, id DESC LIMIT 10;
-- 3
SELECT c.id, c.full_name, count(o.id) AS orders
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.full_name ORDER BY orders DESC;
-- 4
SELECT c.id, c.full_name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
-- 5
SELECT o.status, count(DISTINCT o.id) AS orders,
       count(DISTINCT o.customer_id) AS customers,
       COALESCE(sum(o.total_minor), 0) AS total_minor
FROM orders o GROUP BY o.status;
-- 6
SELECT c.id, c.full_name, sum(o.total_minor) AS spent_minor
FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE o.status IN ('paid','fulfilled')
GROUP BY c.id, c.full_name
ORDER BY spent_minor DESC, c.id LIMIT 5;
-- 7
SELECT placed_at::date AS day, count(*) AS total
FROM orders WHERE placed_at >= now() - interval '30 days'
GROUP BY placed_at::date HAVING count(*) >= 10 ORDER BY day;
-- 8 (PostgreSQL; MySQL 8+/SQL Server dùng ROW_NUMBER() rồi lọc rn = 1)
SELECT c.id, c.full_name, o.id AS last_order_id, o.placed_at
FROM customers c
LEFT JOIN LATERAL (
  SELECT id, placed_at FROM orders o
  WHERE o.customer_id = c.id AND o.deleted_at IS NULL
  ORDER BY o.placed_at DESC, o.id DESC LIMIT 1
) o ON TRUE;
-- 9
WITH totals AS (
  SELECT customer_id, sum(total_minor) AS spent
  FROM orders WHERE status IN ('paid','fulfilled') GROUP BY customer_id
)
SELECT customer_id, spent FROM totals
WHERE spent > (SELECT avg(spent) FROM totals);
-- 10
SELECT placed_at::date AS day, count(*) AS daily,
       sum(count(*)) OVER (ORDER BY placed_at::date) AS running
FROM orders WHERE status = 'paid'
GROUP BY placed_at::date ORDER BY day;
-- 11
SELECT o.id, o.status, count(oi.id) AS items,
       COALESCE(sum(p.amount_minor) FILTER (WHERE p.status = 'captured'), 0) AS paid_minor
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY o.id, o.status
ORDER BY o.placed_at DESC, o.id DESC LIMIT 20 OFFSET 0;
-- 12
SELECT a.product_id AS product_a, b.product_id AS product_b, count(*) AS together
FROM order_items a
JOIN order_items b ON b.order_id = a.order_id AND a.product_id < b.product_id
GROUP BY a.product_id, b.product_id
ORDER BY together DESC LIMIT 10;
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
| Tiền dùng `float` | Sai số | integer minor units hoặc `numeric` |
| `varchar(255)` mọi thứ | Vô nghĩa, lãng phí | Độ dài theo domain |
| Ghép chuỗi SQL từ input | Injection | Prepared statement |
| Index mọi cột | Ghi chậm, tốn đĩa | Index theo query thật |
| `OFFSET` lớn | Chậm dần | Keyset pagination |
| `DISTINCT` che join nhân dòng | Kết quả sai, chậm | Sửa điều kiện join |
| `NULL` vừa "không áp dụng" vừa "chưa biết" | Không phân biệt | Thêm trạng thái rõ |
| Trigger chứa business logic phức tạp | Khó debug/version | Logic ở app, trigger audit |
| Không có index cho FK | Join/xoá chậm, khoá bảng | Thêm index cột FK |

> 💡 Anti-pattern phổ biến nhất không phải cú pháp sai mà là **không đo**. Tối ưu phải
> bắt đầu bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu thật.

### 19.1 Checklist review query cơ bản

- [ ] Kết quả đúng với edge case: NULL, không có dòng, trùng lặp.
- [ ] Có `ORDER BY` khi dùng `LIMIT/OFFSET` hoặc keyset.
- [ ] Có index cho cột lọc/join/sort chính.
- [ ] Không bọc cột trong hàm ở `WHERE` nếu không có expression index.
- [ ] Tiền dùng integer minor units; không trộn currency.
- [ ] Thời gian UTC; dùng nửa khoảng thay `BETWEEN` cho timestamp.
- [ ] `UPDATE`/`DELETE` có `WHERE` và đã đếm trước.
- [ ] `NOT IN` đã thay bằng `NOT EXISTS` khi có NULL.

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
[postgresql-basics](../postgres-sql/postgresql-basics.md) ·
[postgresql-advanced](../postgres-sql/postgresql-advanced.md).
