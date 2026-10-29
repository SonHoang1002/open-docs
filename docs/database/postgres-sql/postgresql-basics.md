# PostgreSQL — Kiến thức cơ bản

> Tài liệu nhập môn PostgreSQL dành cho lập trình viên backend: kiến trúc, kiểu dữ liệu,
> DDL/DML, truy vấn, JOIN, index, transaction và schema mẫu cho dự án wedding.
> Mọi ví dụ chạy được trực tiếp trong `psql` (PostgreSQL 16/17/18).

> 📌 Phần nâng cao (EXPLAIN, tuning, MVCC, lock, partition, JSONB, FTS, RLS, vận hành,
> migration zero-downtime) nằm trong [`postgresql-advanced.md`](./postgresql-advanced.md).

---

## Mục lục

1. [PostgreSQL là gì?](#1-postgresql-là-gì)
2. [Cài đặt & kết nối](#2-cài-đặt--kết-nối)
3. [Cấu trúc đối tượng trong PostgreSQL](#3-cấu-trúc-đối-tượng-trong-postgresql)
4. [Kiểu dữ liệu](#4-kiểu-dữ-liệu)
5. [DDL — Tạo và thay đổi bảng](#5-ddl--tạo-và-thay-đổi-bảng)
6. [DML — Thêm, sửa, xoá dữ liệu](#6-dml--thêm-sửa-xoá-dữ-liệu)
7. [Truy vấn dữ liệu](#7-truy-vấn-dữ-liệu)
8. [NULL — điều dễ sai nhất](#8-null--điều-dễ-sai-nhất)
9. [Index — khái niệm cơ bản](#9-index--khái-niệm-cơ-bản)
10. [Transaction](#10-transaction)
11. [View & Materialized View](#11-view--materialized-view)
12. [Schema mẫu cho dự án wedding](#12-schema-mẫu-cho-dự-án-wedding)
13. [psql cheatsheet](#13-psql-cheatsheet)
14. [Bài tập thực hành](#14-bài-tập-thực-hành)
15. [Anti-patterns cơ bản](#15-anti-patterns-cơ-bản)
16. [Tài liệu tham khảo](#16-tài-liệu-tham-khảo)

---

## 1. PostgreSQL là gì?

**PostgreSQL** là hệ quản trị cơ sở dữ liệu quan hệ — đối tượng (ORDBMS) mã nguồn mở,
ra đời từ 1986 (tiền thân POSTGRES) và được cộng đồng phát triển liên tục.

Điểm mạnh cốt lõi:

| Đặc điểm | Ý nghĩa thực tế |
|---|---|
| **ACID** | Transaction an toàn, kể cả khi mất điện giữa chừng |
| **MVCC** | Đọc không chặn ghi, ghi không chặn đọc |
| **Extensible** | Tự viết kiểu dữ liệu, index, function, extension |
| **SQL chuẩn** | Hỗ trợ window function, CTE, JSONB, full-text search |
| **Transactional DDL** | `CREATE TABLE`/`ALTER TABLE` rollback được (khác MySQL) |
| **JSONB + quan hệ** | Vừa lưu dữ liệu có cấu trúc, vừa lưu payload linh hoạt |
| **Cộng đồng & hệ sinh thái** | Supabase, Neon, RDS, TimescaleDB, PostGIS… |

### 1.1 Kiến trúc tiến trình

```
                    ┌──────────────────────────────┐
   Client (psql) ──▶│  postmaster (process chính)  │
   Client (app)  ──▶│  - lắng nghe cổng 5432       │
   Client (pool) ──▶│  - fork 1 backend/connection │
                    └──────────────┬───────────────┘
                                   │
        ┌──────────────────────────┼───────────────────────────┐
        ▼                          ▼                           ▼
  Backend process          Shared memory                Background workers
  (1 process / kết nối)    - shared_buffers             - checkpointer
  - parse, plan, execute   - WAL buffers                - background writer
  - trả kết quả            - lock table                 - WAL writer
                                                         - autovacuum launcher
                                                         - logical replication
```

Hệ quả cần nhớ:

- **Mỗi kết nối là một process** → 1.000 kết nối trực tiếp rất tốn RAM/CPU.
  Production nên dùng **connection pool** (PgBouncer, Supabase pooler).
- Dữ liệu được cache trong `shared_buffers`; đọc/ghi còn đi qua **WAL** (Write-Ahead Log)
  để đảm bảo crash recovery.
- **Autovacuum** chạy nền để dọn phiên bản dòng cũ (dead tuple) — không tắt.

### 1.2 PostgreSQL vs MySQL vs SQLite

| Tiêu chí | PostgreSQL | MySQL (InnoDB) | SQLite |
|---|---|---|---|
| Kiểu dữ liệu | Phong phú (JSONB, array, range, enum) | Khá tốt | Đơn giản |
| JSON | JSONB nhị phân, index GIN | JSON (text), index khó hơn | JSON1 |
| Transaction DDL | ✅ | ❌ (DDL auto-commit) | ✅ |
| Full-text search | Có sẵn, khá mạnh | Có, đơn giản hơn | FTS5 |
| Đồng thời | MVCC mạnh, nhiều writer | MVCC, nhiều writer | 1 writer tại một thời điểm |
| Phù hợp | App phức tạp, dữ liệu quan hệ + JSON | Web app phổ thông | Mobile, embedded, test |

### 1.3 Khi nào **không** nên dùng PostgreSQL?

- Dữ liệu chỉ là file/key-value đơn giản, quy mô nhỏ → SQLite/Redis đủ.
- Cần ghi cực cao kiểu append-only hàng triệu event/giây → cân nhắc Kafka/ClickHouse.
- Cần tìm kiếm tiếng Việt chuyên sâu (tách từ, xếp hạng) → Elasticsearch/Meilisearch
  (Postgres FTS vẫn dùng tốt cho nhu cầu vừa phải).

---

## 2. Cài đặt & kết nối

### 2.1 Chạy nhanh bằng Docker Compose

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:17
    container_name: wedding-db
    environment:
      POSTGRES_USER: wedding
      POSTGRES_PASSWORD: wedding_dev_password
      POSTGRES_DB: wedding
      TZ: Asia/Ho_Chi_Minh
      PGTZ: Asia/Ho_Chi_Minh
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wedding -d wedding"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  pgdata:
```

```bash
docker compose up -d
docker compose exec db psql -U wedding -d wedding
```

> ⚠️ Với image `postgres:18+`, đường dẫn volume mặc định đã thay đổi
> (`/var/lib/postgresql`). Nếu dùng version mới, đọc release notes của image trước khi
> copy cấu hình cũ.

### 2.2 Cài trên máy (Ubuntu/Debian)

```bash
sudo apt install postgresql postgresql-client
sudo systemctl enable --now postgresql

# Chuyển sang user postgres để tạo role/database
sudo -u postgres psql
```

### 2.3 Tạo role & database

```sql
-- Đang ở psql với quyền superuser
CREATE ROLE wedding_app LOGIN PASSWORD 'mot-mat-khau-manh';
CREATE DATABASE wedding OWNER wedding_app ENCODING 'UTF8';

-- PostgreSQL 15+: thu hồi quyền tạo object trong schema public
\c wedding
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO wedding_app;
```

> Với dữ liệu tiếng Việt, cân nhắc **ICU collation** (PostgreSQL 16+):
> `CREATE DATABASE wedding ... LOCALE_PROVIDER icu ICU_LOCALE 'vi-VN'`.
> Collation ảnh hưởng đến `ORDER BY`, `LIKE`, so sánh chuỗi và cả index.

### 2.4 Chuỗi kết nối

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

```bash
# psql
psql "postgresql://wedding:wedding_dev_password@localhost:5432/wedding"

# hoặc tách tham số
psql -h localhost -p 5432 -U wedding -d wedding
```

```dotenv
# .env (không commit!)
DATABASE_URL=postgresql://wedding:wedding_dev_password@localhost:5432/wedding
```

Với Supabase:

```dotenv
# Kết nối trực tiếp (migration, admin) — thường IPv6
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Transaction pooler (serverless, app runtime) — port 6543
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 2.5 Kiểm tra kết nối

```sql
SELECT version();
SELECT current_database(), current_user, now();
\conninfo
```

---

## 3. Cấu trúc đối tượng trong PostgreSQL

```
PostgreSQL server (cluster)
└── database: wedding
    ├── schema: public
    │   ├── table: messages
    │   ├── table: rsvps
    │   ├── index: idx_messages_feed
    │   ├── view: v_message_feed
    │   ├── sequence: messages_id_seq
    │   └── function: set_updated_at()
    └── schema: app
        └── table: ...
```

| Khái niệm | Giải thích |
|---|---|
| **Cluster** | Một instance PostgreSQL quản lý nhiều database |
| **Database** | Tập hợp schema; **không query chéo database** (trừ `dblink`/FDW) |
| **Schema** | Namespace bên trong database; mặc định là `public` |
| **Table** | Bảng quan hệ |
| **Index** | Cấu trúc phụ tăng tốc truy vấn |
| **Sequence** | Nguồn sinh số tự tăng (đứng sau `IDENTITY`) |
| **View** | Truy vấn được đặt tên |
| **Function/Procedure** | Logic chạy trong database |

### 3.1 `search_path`

Khi gọi `SELECT * FROM messages`, PostgreSQL tìm theo `search_path`:

```sql
SHOW search_path;                 -- mặc định: "$user", public
SET search_path = app, public;    -- ưu tiên schema app

-- Lưu vĩnh viễn cho role (khuyến nghị cho app)
ALTER ROLE wedding_app SET search_path = app, public;
```

> 🔒 Khi viết function `SECURITY DEFINER`, **luôn set `search_path` cố định** để tránh
> bị lợi dụng tạo object cùng tên ở schema khác (xem tài liệu nâng cao).

### 3.2 Quy ước đặt tên

```text
✅ snake_case:        sender_name, created_at, will_attend
✅ bảng số nhiều:     guests, messages, rsvps
✅ khoá chính:        id
✅ khoá ngoại:        guest_id (bảng + _id)
✅ index:             idx_<table>_<cols>, uq_<table>_<cols>
✅ constraint:        chk_..., fk_..., uq_...
❌ tránh:             "User", "order" (từ khoá), tên viết tắt khó hiểu
```

Tên có ký tự đặc biệt/chữ hoa phải bọc `"..."` → dễ sai về sau. Hãy dùng chữ thường.

---

## 4. Kiểu dữ liệu

### 4.1 Bảng chọn nhanh

| Nhu cầu | Kiểu nên dùng | Ghi chú |
|---|---|---|
| Số nguyên nhỏ | `smallint` | ±32.767 |
| Số nguyên thường | `integer` (`int`) | ±2,1 tỷ |
| Khoá chính / số lớn | `bigint` | ±9,2 × 10¹⁸ |
| Tiền, điểm số | `numeric(12,2)` | Chính xác tuyệt đối |
| Đo lường khoa học | `double precision` | Sai số nhị phân |
| Chuỗi | `text` | Không cần `varchar(255)` |
| Chuỗi giới hạn | `varchar(n)` hoặc `text + CHECK` | Hiệu năng tương đương |
| Đúng/sai | `boolean` | `true/false/NULL` |
| Ngày | `date` | Không có giờ |
| Thời điểm | `timestamptz` | **Luôn dùng cho thời gian thực** |
| Khoảng thời gian | `interval` | `'90 days'`, `'2 hours'` |
| UUID | `uuid` | `gen_random_uuid()`, `uuidv7()` |
| JSON | `jsonb` | Index được, binary |
| Mảng | `text[]`, `bigint[]` | Hữu hạn, không lạm dụng |
| Nhị phân | `bytea` | File nhỏ, hash |
| IP | `inet`, `cidr` | Có toán tử mạng |
| Full-text | `tsvector`, `tsquery` | Tìm kiếm |

### 4.2 Số

```sql
SELECT 1::smallint, 2147483647::integer, 9223372036854775807::bigint;

-- numeric: chính xác, dùng cho tiền
SELECT 1234567.89::numeric(12,2);
SELECT 0.1::numeric + 0.2::numeric;      -- 0.3 (chính xác)

-- double precision: nhanh nhưng có sai số
SELECT 0.1::float8 + 0.2::float8;        -- 0.30000000000000004

-- ❌ Đừng dùng kiểu money (phụ thuộc locale)
```

Chọn `bigint` cho `id` ngay từ đầu — nâng cấp `integer` → `bigint` sau này phải rewrite
bảng và sửa mọi FK.

### 4.3 Chuỗi

```sql
SELECT 'Xin chào'::text;
SELECT 'abc' || 'def';                    -- abcdef
SELECT char_length('Xin chào');           -- 8
SELECT lower('Xin Chào'), upper('abc');
SELECT btrim('  abc  ');                  -- abc
SELECT substring('wedding-server' from 1 for 7);  -- wedding
SELECT split_part('a,b,c', ',', 2);       -- b
SELECT format('%s có %s tin nhắn', 'An', 3);
```

- `text` và `varchar(n)` lưu giống nhau; `varchar(n)` chỉ thêm ràng buộc độ dài.
- `char(n)` đệm khoảng trắng → tránh.
- `LIKE` phân biệt hoa/thường, `ILIKE` thì không.

### 4.4 Thời gian — phần quan trọng nhất

```sql
SHOW TimeZone;                              -- ví dụ Asia/Ho_Chi_Minh

SELECT now();                               -- timestamptz
SELECT current_date;                        -- date
SELECT current_timestamp;                   -- timestamptz

-- timestamptz: lưu UTC, hiển thị theo TimeZone của session
SELECT '2026-10-23 20:00:00+07'::timestamptz;
SELECT '2026-10-23 20:00:00'::timestamptz;  -- hiểu là giờ session
SELECT '2026-10-23 20:00:00'::timestamp;    -- "wall clock", không timezone

SET TIME ZONE 'UTC';
SELECT '2026-10-23 20:00:00+07'::timestamptz;   -- 2026-10-23 13:00:00+00
```

| Kiểu | Kích thước | Dùng khi |
|---|---|---|
| `timestamptz` | 8 byte | **Mọi mốc thời gian thực**: `created_at`, `deleted_at`, lịch hẹn |
| `timestamp` | 8 byte | Giờ địa phương không gắn múi giờ: giờ mở cửa, lịch học lặp lại |
| `date` | 4 byte | Ngày sinh, ngày cưới |
| `time` | 8 byte | Giờ trong ngày |
| `interval` | 16 byte | Khoảng thời gian |

```sql
-- Cộng/trừ thời gian
SELECT now() + interval '7 days';
SELECT now() - interval '90 days';
SELECT current_date + 1;                    -- ngày mai
SELECT age(now(), '2020-01-01');            -- khoảng thời gian

-- Cắt theo ngày/tháng
SELECT date_trunc('month', now());
SELECT extract(year FROM now());
SELECT to_char(now(), 'DD/MM/YYYY HH24:MI');
```

> ⚠️ **Không lưu thời gian dạng `text`** (`'23/10/2026'`). Không sort/so sánh/index đúng,
> không tính được khoảng thời gian, phụ thuộc định dạng.

### 4.5 Boolean

```sql
SELECT true, false, NULL::boolean;
SELECT will_attend FROM messages WHERE will_attend IS TRUE;
```

Không dùng `'0'/'1'` hay `'Y'/'N'` — dùng `boolean` thật.

### 4.6 UUID

```sql
SELECT gen_random_uuid();       -- PostgreSQL 13+, built-in
-- SELECT uuidv7();             -- PostgreSQL 18+: time-ordered, index-friendly hơn
```

| | `bigint` identity | `uuid v4` | `uuid v7` |
|---|---|---|---|
| Kích thước | 8 byte | 16 byte | 16 byte |
| Đoán được | Có (tuần tự) | Không | Không |
| Index | Rất tốt (tuần tự) | Phân mảnh (random) | Tốt (theo thời gian) |
| Dùng khi | Internal ID | Public ID, phân tán | Public ID hiện đại |

Có thể dùng **cả hai**: `id bigint` làm PK nội bộ, `public_id uuid` cho API.

### 4.7 JSON & JSONB

```sql
SELECT '{"name":"An","tags":["family"]}'::jsonb;
SELECT '{"b":1,"a":2}'::jsonb;          -- jsonb sắp xếp key, bỏ khoảng trắng
```

| | `json` | `jsonb` |
|---|---|---|
| Lưu trữ | Text gốc | Binary đã parse |
| Giữ thứ tự/whitespace | Có | Không |
| Index | Không (chỉ expression) | GIN/GiST |
| Truy cập field | Chậm hơn | Nhanh hơn |
| Khi dùng | Lưu nguyên văn, audit | **Hầu hết trường hợp** |

```sql
SELECT payload->>'name' AS name, payload->'tags' AS tags
FROM events;

SELECT * FROM events WHERE payload @> '{"type":"rsvp"}';
```

### 4.8 Mảng

```sql
SELECT ARRAY[1,2,3] AS nums;
SELECT ARRAY['a','b']::text[];

CREATE TABLE posts (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tags text[] NOT NULL DEFAULT '{}'
);

INSERT INTO posts (tags) VALUES (ARRAY['wedding','family']);
SELECT * FROM posts WHERE 'family' = ANY(tags);
SELECT * FROM posts WHERE tags @> ARRAY['wedding'];
```

Mảng phù hợp cho tag nhỏ, ít join. **Không** dùng mảng thay bảng quan hệ khi cần
join/lọc/đếm thường xuyên.

### 4.9 Enum

```sql
CREATE TYPE guest_side AS ENUM ('bride', 'groom', 'both');

CREATE TABLE guests (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  side guest_side NOT NULL DEFAULT 'both'
);

ALTER TYPE guest_side ADD VALUE IF NOT EXISTS 'other';
```

Enum an toàn kiểu nhưng **xoá/đổi tên value rất khó**. Nếu tập giá trị có thể thay đổi
thường xuyên, dùng `text + CHECK` hoặc bảng lookup.

### 4.10 Domain & generated column

```sql
-- Domain: kiểu + ràng buộc tái sử dụng
CREATE DOMAIN email AS text
  CHECK (VALUE ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Generated column: tự tính, không ghi trực tiếp
CREATE TABLE guests (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name text NOT NULL,
  last_name  text NOT NULL,
  full_name  text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED
);
```

Biểu thức generated phải **IMMUTABLE** (cùng input → cùng output).

---

## 5. DDL — Tạo và thay đổi bảng

### 5.1 `CREATE TABLE` đầy đủ ràng buộc

```sql
CREATE TABLE messages (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_name   text        NOT NULL
                            CHECK (char_length(btrim(sender_name)) BETWEEN 2 AND 80),
  content       text        NOT NULL
                            CHECK (char_length(content) BETWEEN 1 AND 500),
  will_attend   boolean     NOT NULL DEFAULT false,
  guest_of      text        NOT NULL DEFAULT 'Cả hai'
                            CHECK (guest_of IN ('Chú rể', 'Cô dâu', 'Cả hai')),
  number_attend smallint    NOT NULL DEFAULT 0
                            CHECK (number_attend BETWEEN 0 AND 10),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

COMMENT ON TABLE messages IS 'Lời chúc / RSVP của khách mời';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete: NULL = còn hiệu lực';
```

### 5.2 Các loại ràng buộc

| Ràng buộc | Ý nghĩa | Ví dụ |
|---|---|---|
| `PRIMARY KEY` | Định danh duy nhất, ngầm `UNIQUE + NOT NULL`, tạo index | `id` |
| `UNIQUE` | Không trùng | `phone`, `guest_id` |
| `NOT NULL` | Bắt buộc có giá trị | `content` |
| `DEFAULT` | Giá trị mặc định | `now()` |
| `CHECK` | Điều kiện đúng | `number_attend BETWEEN 0 AND 10` |
| `FOREIGN KEY` | Tham chiếu bảng khác | `guest_id REFERENCES guests(id)` |
| `EXCLUDE` | Không được trùng khoảng (nâng cao) | Đặt phòng trùng giờ |

```sql
-- UNIQUE cho phép nhiều NULL (vì NULL <> NULL)
-- PostgreSQL 15+: coi NULL là trùng
ALTER TABLE guests
  ADD CONSTRAINT uq_guests_phone UNIQUE NULLS NOT DISTINCT (phone);
```

### 5.3 Khoá ngoại & hành vi khi xoá

```sql
CREATE TABLE rsvps (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id      bigint NOT NULL UNIQUE
                REFERENCES guests(id) ON DELETE CASCADE,
  will_attend   boolean NOT NULL,
  number_attend smallint NOT NULL DEFAULT 0
                CHECK (number_attend BETWEEN 0 AND 10),
  note          text CHECK (char_length(note) <= 500),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

| Hành vi | Khi xoá guest |
|---|---|
| `ON DELETE RESTRICT` (mặc định) | Chặn xoá nếu còn rsvp |
| `ON DELETE CASCADE` | Xoá luôn rsvp |
| `ON DELETE SET NULL` | `guest_id = NULL` |
| `ON DELETE SET DEFAULT` | Về giá trị mặc định |

> PostgreSQL **không tự tạo index** cho cột FK. Ở ví dụ trên, `guest_id` có `UNIQUE` nên
> đã được index sẵn. Nếu cột FK **không** có `UNIQUE`, hãy thêm index để kiểm tra/xoá
> parent nhanh: `CREATE INDEX idx_<child>_<fk> ON <child> (<fk_column>);`

### 5.4 `IDENTITY` thay cho `SERIAL`

```sql
-- ✅ Hiện đại, chuẩn SQL
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY

-- Cho phép insert id thủ công (import dữ liệu)
id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY

-- ❌ Legacy
id bigserial PRIMARY KEY
```

`GENERATED ALWAYS` chặn ghi đè id; khi cần import:

```sql
INSERT INTO messages (id, sender_name, content)
OVERRIDING SYSTEM VALUE
VALUES (100, 'An', 'Chúc mừng!');
```

### 5.5 `ALTER TABLE`

```sql
ALTER TABLE messages ADD COLUMN client_ip inet;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS source text DEFAULT 'web';

ALTER TABLE messages ALTER COLUMN content SET NOT NULL;
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

ALTER TABLE messages ADD CONSTRAINT chk_content_len
  CHECK (char_length(content) <= 500);

ALTER TABLE messages RENAME COLUMN sender_name TO guest_name;
ALTER TABLE messages RENAME TO guestbook_messages;

ALTER TABLE messages DROP COLUMN IF EXISTS legacy_field;
```

> ⚠️ `DROP COLUMN ... CASCADE` xoá luôn view/index/phụ thuộc. Kiểm tra trước:
> `\d+ messages`, hoặc query `pg_depend`.

### 5.6 `DROP` / `TRUNCATE`

```sql
DROP TABLE IF EXISTS messages;              -- xoá cấu trúc + dữ liệu
DROP TABLE IF EXISTS messages CASCADE;      -- xoá cả object phụ thuộc

TRUNCATE TABLE messages;                     -- xoá nhanh toàn bộ dòng
TRUNCATE TABLE messages RESTART IDENTITY;    -- reset sequence
TRUNCATE TABLE messages CASCADE;             -- truncate bảng có FK trỏ tới
```

| | `DELETE FROM t` | `TRUNCATE t` | `DROP TABLE t` |
|---|---|---|---|
| Xoá dòng | Có (có thể `WHERE`) | Tất cả | Tất cả + cấu trúc |
| Rollback được | Có | Có (trong transaction) | Có (trong transaction) |
| Tốc độ | Chậm (từng dòng, WAL) | Rất nhanh | Rất nhanh |
| Trigger | Chạy | Không | Không |

### 5.7 Schema

```sql
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE app.settings (key text PRIMARY KEY, value jsonb NOT NULL);

-- Cấp quyền
GRANT USAGE ON SCHEMA app TO wedding_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO wedding_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO wedding_app;
```

---

## 6. DML — Thêm, sửa, xoá dữ liệu

### 6.1 `INSERT`

```sql
-- Một dòng, trả về dữ liệu vừa tạo
INSERT INTO messages (sender_name, content, will_attend, guest_of, number_attend)
VALUES ('Nguyễn Văn An', 'Chúc mừng hạnh phúc!', true, 'Cô dâu', 2)
RETURNING id, created_at;

-- Nhiều dòng
INSERT INTO messages (sender_name, content, will_attend, guest_of, number_attend)
VALUES
  ('Trần Thị Bình', 'Trăm năm hạnh phúc!', true,  'Cô dâu', 1),
  ('Lê Hoàng Cường', 'Chúc mừng!',          false, 'Cả hai', 0)
RETURNING id;

-- Insert từ SELECT
INSERT INTO messages_archive (id, sender_name, content, created_at)
SELECT id, sender_name, content, created_at
FROM messages
WHERE created_at < now() - interval '1 year';
```

### 6.2 `UPDATE`

```sql
UPDATE messages
SET content    = 'Lời chúc đã chỉnh sửa',
    updated_at = now()
WHERE id = 1
RETURNING *;

-- Cập nhật từ bảng khác
UPDATE messages m
SET guest_of = g.side
FROM guests g
WHERE g.id = m.guest_id
  AND m.guest_of IS NULL;
```

> ⚠️ **Luôn có `WHERE`**. Chạy `UPDATE messages SET ...` không WHERE là cập nhật toàn bảng.

### 6.3 `DELETE`

```sql
DELETE FROM messages WHERE id = 1 RETURNING id;

-- Xoá theo điều kiện
DELETE FROM messages
WHERE deleted_at IS NOT NULL
  AND deleted_at < now() - interval '30 days'
RETURNING id;
```

### 6.4 `INSERT ... ON CONFLICT` (UPSERT)

```sql
INSERT INTO rsvps (guest_id, will_attend, number_attend)
VALUES ($1, $2, $3)
ON CONFLICT (guest_id) DO UPDATE
SET will_attend   = EXCLUDED.will_attend,
    number_attend = EXCLUDED.number_attend,
    updated_at    = now()
RETURNING *;
```

- `EXCLUDED` = dòng đang cố insert.
- `ON CONFLICT DO NOTHING` **không trả về** dòng bị trùng khi dùng `RETURNING`;
  nếu cần luôn có kết quả, dùng `DO UPDATE` (kể cả update "rỗng").
- Cột trong `ON CONFLICT (...)` phải có `UNIQUE`/`PRIMARY KEY` tương ứng.

```sql
-- Bỏ qua bản ghi trùng
INSERT INTO guests (phone, full_name)
VALUES ('0901234567', 'Nguyễn Văn An')
ON CONFLICT (phone) DO NOTHING;
```

### 6.5 `MERGE` (PostgreSQL 15+)

```sql
MERGE INTO rsvps r
USING (VALUES ($1::bigint, $2::boolean, $3::smallint))
      AS s(guest_id, will_attend, number_attend)
ON r.guest_id = s.guest_id
WHEN MATCHED THEN
  UPDATE SET will_attend   = s.will_attend,
             number_attend = s.number_attend,
             updated_at    = now()
WHEN NOT MATCHED THEN
  INSERT (guest_id, will_attend, number_attend)
  VALUES (s.guest_id, s.will_attend, s.number_attend);
```

### 6.6 Bulk load nhanh

```sql
-- Nhanh nhất: COPY (server-side)
COPY messages (sender_name, content, will_attend, guest_of)
FROM '/tmp/messages.csv'
WITH (FORMAT csv, HEADER true);

-- Client-side với quyền user hiện tại
\copy messages (sender_name, content) FROM '/tmp/messages.csv' CSV HEADER

-- Sinh dữ liệu test ngay trong SQL
INSERT INTO messages (sender_name, content, created_at)
SELECT
  'Khách ' || i,
  'Lời chúc số ' || i,
  now() - random() * interval '90 days'
FROM generate_series(1, 5000) AS i;

ANALYZE messages;
```

So sánh tốc độ (5.000 dòng): `COPY` ≫ multi-row `INSERT` ≫ 5.000 `INSERT` riêng lẻ.

---

## 7. Truy vấn dữ liệu

### 7.1 `SELECT` cơ bản

```sql
SELECT id, sender_name, content, created_at
FROM messages
WHERE will_attend = true
  AND created_at >= now() - interval '7 days'
ORDER BY created_at DESC
LIMIT 20;
```

Thứ tự thực thi logic (không phải thứ tự viết):

```text
FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET
```

Vì vậy `WHERE` không dùng được alias của `SELECT`, còn `ORDER BY` thì được.

### 7.2 Toán tử `WHERE`

| Toán tử | Ví dụ |
|---|---|
| `=`, `<>`, `!=` | `guest_of = 'Cô dâu'` |
| `>`, `>=`, `<`, `<=` | `created_at >= now() - interval '1 day'` |
| `BETWEEN` | `number_attend BETWEEN 1 AND 5` |
| `IN` | `guest_of IN ('Cô dâu', 'Chú rể')` |
| `LIKE` / `ILIKE` | `content ILIKE '%hạnh phúc%'` |
| `IS NULL` | `deleted_at IS NULL` |
| `IS DISTINCT FROM` | `a IS DISTINCT FROM b` (NULL-safe) |
| `ANY` / `ALL` | `'family' = ANY(tags)` |
| `AND` / `OR` / `NOT` | Kết hợp, nhớ ngoặc khi trộn |

```sql
-- LIKE: % = nhiều ký tự, _ = đúng 1 ký tự
SELECT * FROM messages WHERE content LIKE 'Chúc%';
SELECT * FROM messages WHERE sender_name LIKE 'Nguyễn _ăn';
```

### 7.3 `ORDER BY`, `LIMIT`, `OFFSET`

```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 20;

-- Phân trang kiểu offset (chỉ dùng cho trang nhỏ)
SELECT * FROM messages
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 40;

-- NULL sắp xếp ở cuối
SELECT * FROM messages ORDER BY deleted_at DESC NULLS LAST;
```

> ⚠️ `OFFSET 100000` vẫn phải đọc và bỏ 100.000 dòng → chậm dần. Với infinite scroll,
> dùng **keyset pagination** `(created_at, id) < (cursor)` (xem tài liệu nâng cao).

### 7.4 `DISTINCT`

```sql
SELECT DISTINCT guest_of FROM messages;

-- DISTINCT ON: lấy 1 dòng đại diện mỗi nhóm (PostgreSQL)
SELECT DISTINCT ON (guest_of) guest_of, sender_name, created_at
FROM messages
ORDER BY guest_of, created_at DESC;
```

### 7.5 Hàm tổng hợp & `GROUP BY`

```sql
SELECT
  count(*)                                        AS total,
  count(*) FILTER (WHERE will_attend)             AS attending,
  count(*) FILTER (WHERE NOT will_attend)         AS declined,
  coalesce(sum(number_attend) FILTER (WHERE will_attend), 0) AS seats,
  round(avg(number_attend)::numeric, 1)           AS avg_attend
FROM rsvps;
```

| Hàm | Ý nghĩa |
|---|---|
| `count(*)` | Đếm mọi dòng (kể cả NULL) |
| `count(col)` | Đếm dòng có `col` khác NULL |
| `count(DISTINCT col)` | Đếm giá trị khác nhau |
| `sum`, `avg`, `min`, `max` | Tổng/trung bình/nhỏ nhất/lớn nhất |
| `string_agg(col, ',')` | Ghép chuỗi |
| `array_agg(col)` | Gom thành mảng |
| `bool_and`, `bool_or` | AND/OR trên boolean |
| `FILTER (WHERE ...)` | Điều kiện cho từng aggregate |

```sql
SELECT guest_of,
       count(*) AS total,
       count(*) FILTER (WHERE will_attend) AS attending
FROM messages
GROUP BY guest_of
HAVING count(*) > 10
ORDER BY total DESC;
```

`WHERE` lọc **dòng trước khi gom**; `HAVING` lọc **nhóm sau khi gom**.

### 7.6 JOIN

```text
INNER JOIN  : chỉ dòng khớp ở cả hai bảng
LEFT JOIN   : giữ mọi dòng bảng trái, không khớp → NULL
RIGHT JOIN  : giữ mọi dòng bảng phải
FULL JOIN   : giữ mọi dòng cả hai bảng
CROSS JOIN  : tích Descartes (n × m dòng)
```

```sql
-- Ai đã phản hồi?
SELECT g.full_name, r.will_attend, r.number_attend
FROM guests g
JOIN rsvps r ON r.guest_id = g.id
ORDER BY g.full_name;

-- Tất cả khách, kể cả chưa phản hồi
SELECT g.full_name,
       coalesce(r.will_attend, false) AS will_attend,
       r.number_attend
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id
ORDER BY g.full_name;

-- Đếm theo phía nhà
SELECT g.side,
       count(*)                                AS guests,
       count(r.id)                             AS responded,
       count(*) FILTER (WHERE r.will_attend)   AS attending
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id
GROUP BY g.side
ORDER BY g.side;
```

> ⚠️ Điều kiện trên bảng phải khi dùng `LEFT JOIN` nên đặt ở `ON`, không phải `WHERE`:
> `WHERE r.will_attend = true` sẽ biến `LEFT JOIN` thành `INNER JOIN`.

### 7.7 Subquery & `EXISTS`

```sql
-- Subquery trả về danh sách
SELECT * FROM messages
WHERE guest_id IN (
  SELECT id FROM guests WHERE side = 'bride'
);

-- EXISTS: thường nhanh hơn IN với bảng lớn, dừng ngay khi tìm thấy
SELECT g.*
FROM guests g
WHERE EXISTS (
  SELECT 1 FROM rsvps r WHERE r.guest_id = g.id
);

-- NOT EXISTS: an toàn với NULL (khác NOT IN)
SELECT g.*
FROM guests g
WHERE NOT EXISTS (
  SELECT 1 FROM rsvps r WHERE r.guest_id = g.id
);

-- Scalar subquery
SELECT m.id, m.content,
       (SELECT count(*) FROM rsvps r WHERE r.guest_id = m.guest_id) AS rsvp_count
FROM messages m;
```

### 7.8 `CASE`, `COALESCE`, `NULLIF`

```sql
SELECT sender_name,
       CASE
         WHEN will_attend THEN 'Có tham dự'
         WHEN will_attend IS FALSE THEN 'Không tham dự'
         ELSE 'Chưa phản hồi'
       END AS trang_thai
FROM messages;

SELECT coalesce(note, '(không có ghi chú)') AS note FROM rsvps;
SELECT nullif(number_attend, 0) FROM rsvps;       -- 0 → NULL
SELECT greatest(1, 5, 3), least(1, 5, 3);
```

### 7.9 Hàm chuỗi & ngày thường dùng

```sql
-- Chuỗi
SELECT concat(first_name, ' ', last_name) FROM guests;
SELECT left(content, 50), right(content, 10) FROM messages;
SELECT replace(content, 'hạnh phúc', 'vui vẻ') FROM messages;
SELECT position('hạnh' IN content) FROM messages;
SELECT regexp_replace(phone, '\D', '', 'g') FROM guests;

-- Ngày
SELECT date_trunc('day', created_at) AS day, count(*)
FROM messages
GROUP BY 1
ORDER BY 1 DESC;

SELECT to_char(created_at, 'DD/MM/YYYY') AS ngay, count(*)
FROM messages
GROUP BY 1
ORDER BY 1 DESC;
```

### 7.10 CTE (`WITH`) — bước đệm

```sql
WITH recent AS (
  SELECT * FROM messages
  WHERE created_at >= now() - interval '7 days'
)
SELECT guest_of, count(*) AS total
FROM recent
GROUP BY guest_of
ORDER BY total DESC;
```

CTE giúp chia query phức tạp thành các bước dễ đọc. Từ PostgreSQL 12, CTE không bị
"materialize" mặc định nữa (trừ khi có `MATERIALIZED`), nên thường không làm chậm.

---

## 8. NULL — điều dễ sai nhất

`NULL` nghĩa là **không biết / không có giá trị**, không phải `0` hay `''`.

```sql
SELECT NULL = NULL;              -- NULL (không phải true)
SELECT NULL <> NULL;             -- NULL
SELECT NULL IS NULL;             -- true
SELECT 1 + NULL;                 -- NULL
SELECT coalesce(NULL, 'mặc định');  -- 'mặc định'
```

Quy tắc:

1. So sánh NULL phải dùng `IS NULL` / `IS NOT NULL`.
2. `WHERE col = NULL` **luôn không trả về dòng nào**.
3. `count(*)` đếm cả NULL; `count(col)` bỏ NULL.
4. `sum/avg/min/max` bỏ qua NULL (trừ khi mọi dòng NULL → `NULL`).
5. `UNIQUE` cho phép nhiều NULL (trừ `NULLS NOT DISTINCT`).
6. `NOT IN (subquery có NULL)` → **không trả về gì**. Dùng `NOT EXISTS`.

```sql
-- ❌ Nguy hiểm nếu có guest_id NULL
SELECT * FROM guests
WHERE id NOT IN (SELECT guest_id FROM messages);

-- ✅ An toàn
SELECT * FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM messages m WHERE m.guest_id = g.id);
```

`ORDER BY` mặc định: `NULLS LAST` với `ASC`, `NULLS FIRST` với `DESC` (PostgreSQL).

---

## 9. Index — khái niệm cơ bản

Index giống mục lục của sách: giúp tìm dòng mà không đọc cả bảng, đổi lại **tốn dung
lượng và làm chậm INSERT/UPDATE/DELETE** (mỗi lần ghi phải cập nhật index).

### 9.1 Tạo index

```sql
-- Index đơn
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- Index tổ hợp: thứ tự cột quan trọng
CREATE INDEX idx_messages_by_guest ON messages (guest_of, created_at DESC);

-- Partial index: chỉ index dòng cần
CREATE INDEX idx_messages_active
  ON messages (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
```

- **Unique index**: `CREATE UNIQUE INDEX ...` dùng khi cần ràng buộc duy nhất (xem mục 5.2).
- **Index cho cột FK**: PostgreSQL **không tự tạo** index cho cột tham chiếu (xem ghi chú ở mục 5.3).

### 9.2 Khi nào index có tác dụng?

| Tình huống | Index? |
|---|---|
| `WHERE id = 1` | ✅ PK/unique |
| `WHERE created_at >= ... ORDER BY created_at` | ✅ B-tree |
| `WHERE guest_of = 'Cô dâu' ORDER BY created_at DESC` | ✅ composite đúng thứ tự |
| `WHERE content LIKE '%hạnh phúc%'` | ❌ B-tree; cần `pg_trgm`/FTS |
| `WHERE lower(email) = ...` | ❌ trừ khi index biểu thức `lower(email)` |
| `WHERE will_attend = true` (bảng 90% true) | ❌ selectivity thấp |
| Bảng 100 dòng | ❌ thường seq scan nhanh hơn |

### 9.3 Xem PostgreSQL dùng index hay không

```sql
EXPLAIN
SELECT id, content FROM messages
WHERE guest_of = 'Cô dâu'
ORDER BY created_at DESC
LIMIT 20;
```

```text
Limit  (cost=0.43..125.12 rows=20 width=64)
  ->  Index Scan using idx_messages_by_guest on messages  (cost=0.43..62453.10 rows=10000 width=64)
        Index Cond: (guest_of = 'Cô dâu'::text)
```

- `Seq Scan` = đọc tuần tự cả bảng.
- `Index Scan` = đi qua index rồi lấy dòng.
- `cost` là đơn vị ước lượng tương đối, **không phải mili giây**.
- `EXPLAIN ANALYZE` chạy thật và trả thời gian (xem tài liệu nâng cao).

### 9.4 Composite index — quy tắc "tiền tố trái"

Index `(guest_of, created_at DESC)` dùng được cho:

```sql
WHERE guest_of = 'Cô dâu'                         -- ✅
WHERE guest_of = 'Cô dâu' ORDER BY created_at DESC -- ✅ (index đã sắp)
WHERE created_at >= ...                            -- ❌ thiếu cột đầu
```

Với PostgreSQL 18, **skip scan** có thể tận dụng index ngay cả khi thiếu cột đầu,
nhưng đừng dựa vào đó để thiết kế index cẩu thả.

### 9.5 Index không dùng được khi nào?

- Hàm/biểu thức che mất cột: `WHERE date_trunc('day', created_at) = ...`.
- Ép kiểu: `WHERE id::text = '123'`.
- `LIKE '%abc'` (leading wildcard).
- `OR` trên nhiều cột không có index phù hợp (có thể dùng BitmapOr).
- Kiểu dữ liệu không khớp (implicit cast).
- Statistic quá cũ → `ANALYZE table;`.

### 9.6 Kiểm tra index thừa

```sql
SELECT indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

Index `idx_scan = 0` sau thời gian dài (kể cả backup/report) có thể là ứng viên xoá —
nhưng **kiểm tra kỹ** trước khi xoá (unique index bảo vệ dữ liệu, query theo mùa…).

---

## 10. Transaction

Transaction nhóm nhiều câu lệnh thành một đơn vị: **hoặc tất cả thành công, hoặc
không có gì thay đổi**.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
```

```sql
BEGIN;
UPDATE messages SET content = 'Tạm' WHERE id = 1;
ROLLBACK;                              -- huỷ, dữ liệu về như cũ
```

### 10.1 ACID

| Tính chất | Ý nghĩa |
|---|---|
| **A**tomicity | Tất cả hoặc không |
| **C**onsistency | Ràng buộc luôn đúng (FK, CHECK, UNIQUE) |
| **I**solation | Transaction không thấy dữ liệu dở dang của nhau |
| **D**urability | Commit xong là mất điện vẫn còn (nhờ WAL) |

### 10.2 Lỗi làm abort transaction

```sql
BEGIN;
INSERT INTO guests (full_name) VALUES (NULL);  -- vi phạm NOT NULL
-- ERROR: null value in column "full_name"
SELECT 1;                                       -- ERROR: current transaction is aborted
ROLLBACK;                                       -- phải rollback
```

Muốn bắt lỗi cục bộ:

```sql
BEGIN;
SAVEPOINT sp1;

INSERT INTO guests (full_name) VALUES (NULL);  -- lỗi
ROLLBACK TO SAVEPOINT sp1;

INSERT INTO guests (full_name) VALUES ('An');  -- tiếp tục được
COMMIT;
```

### 10.3 Autocommit

Mặc định mỗi câu lệnh là một transaction riêng (autocommit). Trong `psql`:

```sql
\set ON_ERROR_STOP on     -- script dừng ngay khi lỗi
\echo 'Bắt đầu'
BEGIN;
-- ...
COMMIT;
```

### 10.4 Mức isolation (tóm tắt)

| Mức | Hiện tượng có thể gặp | Dùng khi |
|---|---|---|
| `READ COMMITTED` (mặc định) | Non-repeatable read, phantom | Hầu hết app |
| `REPEATABLE READ` | Serialization failure (phải retry) | Báo cáo cần snapshot nhất quán |
| `SERIALIZABLE` | Serialization failure (phải retry) | Nghiệp vụ tài chính, logic phức tạp |

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
-- ...
COMMIT;
```

Chi tiết anomaly, lost update, retry pattern: xem tài liệu nâng cao.

### 10.5 DDL cũng transactional

```sql
BEGIN;
ALTER TABLE messages ADD COLUMN source text;
CREATE INDEX idx_source ON messages (source);
ROLLBACK;          -- cả hai thay đổi bị huỷ
```

Ngoại lệ: `CREATE DATABASE`, `VACUUM`, `CREATE INDEX CONCURRENTLY` **không** chạy
trong transaction block.

---

## 11. View & Materialized View

### 11.1 View

```sql
CREATE VIEW v_message_feed AS
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL;

SELECT * FROM v_message_feed ORDER BY created_at DESC LIMIT 20;
```

- View không lưu dữ liệu; mỗi lần query là chạy lại câu SQL.
- View đơn giản có thể `INSERT/UPDATE/DELETE` (auto-updatable).
- Dùng để che giấu cột nhạy cảm, đơn giản hoá query cho app.

```sql
CREATE OR REPLACE VIEW v_rsvp_summary AS
SELECT guest_of,
       count(*) AS total,
       count(*) FILTER (WHERE will_attend) AS attending
FROM messages
GROUP BY guest_of;
```

### 11.2 Materialized View

Lưu kết quả thật, phù hợp báo cáo nặng:

```sql
CREATE MATERIALIZED VIEW mv_daily_stats AS
SELECT date_trunc('day', created_at) AS day,
       count(*) AS messages,
       count(*) FILTER (WHERE will_attend) AS attending
FROM messages
GROUP BY 1;

-- Cần unique index để refresh CONCURRENTLY
CREATE UNIQUE INDEX ON mv_daily_stats (day);

REFRESH MATERIALIZED VIEW mv_daily_stats;              -- khoá đọc
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_stats; -- không khoá đọc
```

> `REFRESH ... CONCURRENTLY` cần unique index và **không chạy trong transaction block**.
> Dữ liệu có thể cũ cho đến lần refresh tiếp theo.

---

## 12. Schema mẫu cho dự án wedding

> Các lệnh dưới đây dành cho **database sạch** (chưa có bảng cùng tên).
> Thiết kế tối giản, đủ dùng cho guestbook + RSVP:

```sql
-- Khách mời
CREATE TABLE guests (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 80),
  phone      text UNIQUE,
  side       text NOT NULL DEFAULT 'both'
             CHECK (side IN ('bride', 'groom', 'both')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Phản hồi tham dự (1 khách / 1 phản hồi)
CREATE TABLE rsvps (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id      bigint NOT NULL UNIQUE
                REFERENCES guests(id) ON DELETE CASCADE,
  will_attend   boolean NOT NULL,
  number_attend smallint NOT NULL DEFAULT 0
                CHECK (number_attend BETWEEN 0 AND 10),
  note          text CHECK (char_length(note) <= 500),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Lời chúc (guestbook)
CREATE TABLE messages (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_id    bigint REFERENCES guests(id) ON DELETE SET NULL,
  sender_name text NOT NULL CHECK (char_length(btrim(sender_name)) BETWEEN 2 AND 80),
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- Index cho feed + phân trang
CREATE INDEX idx_messages_feed
  ON messages (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_messages_guest_id ON messages (guest_id);

-- View tổng hợp cho màn hình thống kê
CREATE VIEW v_wedding_stats AS
SELECT
  (SELECT count(*) FROM guests)                                   AS total_guests,
  (SELECT count(*) FROM rsvps)                                    AS responded,
  (SELECT count(*) FROM rsvps WHERE will_attend)                  AS attending,
  (SELECT coalesce(sum(number_attend), 0)
     FROM rsvps WHERE will_attend)                                AS seats,
  (SELECT count(*) FROM messages WHERE deleted_at IS NULL)        AS messages;
```

### 12.1 Query thực dụng

```sql
-- 20 lời chúc mới nhất (trang đầu)
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Trang tiếp theo với cursor (created_at, id) của dòng cuối
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL
  AND (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Thống kê tham dự
SELECT
  count(*)                                             AS responded,
  count(*) FILTER (WHERE will_attend)                  AS attending,
  count(*) FILTER (WHERE NOT will_attend)              AS declined,
  coalesce(sum(number_attend) FILTER (WHERE will_attend), 0) AS seats
FROM rsvps;

-- Khách chưa phản hồi
SELECT g.id, g.full_name, g.phone
FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM rsvps r WHERE r.guest_id = g.id)
ORDER BY g.full_name;

-- Số lời chúc theo ngày (7 ngày gần nhất)
SELECT date_trunc('day', created_at) AS day, count(*) AS total
FROM messages
WHERE deleted_at IS NULL
  AND created_at >= now() - interval '7 days'
GROUP BY 1
ORDER BY 1 DESC;
```

### 12.2 Seed dữ liệu test

```sql
INSERT INTO messages (sender_name, content, created_at)
SELECT
  (ARRAY['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung'])
    [1 + floor(random() * 4)::int],
  (ARRAY[
    'Chúc mừng hạnh phúc!',
    'Trăm năm viên mãn nhé hai bạn!',
    'Chúc gia đình nhỏ luôn ngập tràn tiếng cười.',
    'Happy wedding!'
  ])[1 + floor(random() * 4)::int],
  now() - random() * interval '90 days'
FROM generate_series(1, 5000) AS i;

ANALYZE messages;
```

Với `seed.ts` hiện tại (chèn 5.000 dòng qua 10 batch Supabase), cách trên chạy **một
câu SQL** trong database sẽ nhanh hơn nhiều và không phụ thuộc round-trip mạng.

---

## 13. psql cheatsheet

### 13.1 Kết nối

```bash
psql "postgresql://user:pass@host:5432/db"
psql -h host -p 5432 -U user -d db
psql -c "SELECT now();"
psql -f migration.sql
```

### 13.2 Meta-command

| Lệnh | Công dụng |
|---|---|
| `\l` | Danh sách database |
| `\c dbname` | Chuyển database |
| `\dt` | Danh sách bảng |
| `\dt+` | Bảng + kích thước |
| `\d table` | Cấu trúc bảng (cột, index, FK) |
| `\d+ table` | Chi tiết + storage + comment |
| `\dn` | Danh sách schema |
| `\di` | Danh sách index |
| `\dv` | Danh sách view |
| `\df` | Danh sách function |
| `\du` | Danh sách role |
| `\x` | Bật/tắt chế độ mở rộng (dọc) |
| `\timing` | Bật/tắt đo thời gian |
| `\e` | Mở editor soạn query |
| `\i file.sql` | Chạy file SQL |
| `\copy ...` | COPY phía client |
| `\watch 2` | Chạy lại query mỗi 2 giây |
| `\q` | Thoát |
| `\?` | Trợ giúp meta-command |

### 13.3 Công cụ GUI

| Công cụ | Nền tảng | Ghi chú |
|---|---|---|
| **pgAdmin** | Web/Desktop | Chính thức, đầy đủ |
| **DBeaver** | Desktop | Đa database, miễn phí |
| **TablePlus** | Desktop | Nhẹ, đẹp |
| **DataGrip** | Desktop | Mạnh, trả phí |
| **Beekeeper Studio** | Desktop | Đơn giản, mã mở |
| **Supabase Studio** | Web | Nếu dùng Supabase |

---

## 14. Bài tập thực hành

Dùng schema ở mục 12.

**1.** Lấy 20 lời chúc mới nhất còn hiệu lực.

```sql
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

**2.** Đếm số lời chúc theo từng ngày trong 7 ngày gần nhất.

```sql
SELECT date_trunc('day', created_at) AS day, count(*) AS total
FROM messages
WHERE deleted_at IS NULL
  AND created_at >= now() - interval '7 days'
GROUP BY day
ORDER BY day DESC;
```

**3.** Danh sách khách chưa RSVP.

```sql
SELECT g.id, g.full_name
FROM guests g
WHERE NOT EXISTS (SELECT 1 FROM rsvps r WHERE r.guest_id = g.id)
ORDER BY g.full_name;
```

**4.** Thống kê: tổng phản hồi, số người tham dự, tổng số ghế.

```sql
SELECT
  count(*)                                            AS responded,
  count(*) FILTER (WHERE will_attend)                 AS attending,
  coalesce(sum(number_attend) FILTER (WHERE will_attend), 0) AS seats
FROM rsvps;
```

**5.** Với mỗi phía nhà (bride/groom/both), đếm số khách và số đã phản hồi.

```sql
SELECT g.side,
       count(*)      AS guests,
       count(r.id)   AS responded
FROM guests g
LEFT JOIN rsvps r ON r.guest_id = g.id
GROUP BY g.side
ORDER BY g.side;
```

**6.** Tìm lời chúc có chứa từ "hạnh phúc" (không phân biệt hoa/thường).

```sql
SELECT id, sender_name, content
FROM messages
WHERE content ILIKE '%hạnh phúc%'
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
```

**7.** Dùng index `idx_messages_feed` đã tạo ở mục 12 và kiểm tra plan của query bài 1.

```sql
EXPLAIN
SELECT id, sender_name, content, created_at
FROM messages
WHERE deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Kỳ vọng: `Index Scan` (hoặc `Index Only Scan`) trên `idx_messages_feed`, không có
`Sort`. Nếu thấy `Seq Scan` + `Sort`, chạy `ANALYZE messages;` rồi thử lại.

---

## 15. Anti-patterns cơ bản

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| `SELECT *` ở API | Chọn đúng cột cần dùng |
| Lưu tiền bằng `float` | `numeric(12,2)` |
| Lưu ngày dạng `text` | `timestamptz` / `date` |
| `timestamp` cho mốc thời gian thực | `timestamptz` |
| `WHERE id = '${id}'` (nối chuỗi) | Parameterized query (`$1`) |
| Không có FK/index cho cột join | Thêm FK + index |
| `OFFSET 100000` | Keyset pagination |
| `NOT IN` với subquery có NULL | `NOT EXISTS` |
| `varchar(255)` mặc định | `text` + `CHECK` khi cần |
| `serial` cho bảng mới | `GENERATED ... AS IDENTITY` |
| Xoá cứng mọi thứ | Soft delete + retention job |
| Không có `WHERE` khi UPDATE/DELETE | Luôn kiểm tra `WHERE`, dùng transaction |
| Transaction mở lâu (chờ user) | Transaction ngắn, timeout |
| Không backup | Backup + **test restore** |
| App dùng superuser | Role quyền tối thiểu |
| Unique chỉ kiểm tra ở app | Ràng buộc `UNIQUE` ở database |
| JSON cho mọi thứ | Cột quan hệ + JSONB cho phần linh hoạt |

### 15.1 SQL injection — ví dụ

```ts
// ❌ Nối chuỗi
await sql(`SELECT * FROM messages WHERE id = ${id}`);

// ✅ Parameterized (postgres.js)
await sql`SELECT * FROM messages WHERE id = ${id}`;

// ✅ Supabase
await supabase.from("messages").select("id, content").eq("id", id);
```

> Supabase/PostgREST đã parameterize sẵn; nguy hiểm nằm ở `.rpc()` với SQL nối chuỗi,
> hoặc khi bạn tự viết raw query trong Edge Function.

---

## 16. Tài liệu tham khảo

- **PostgreSQL Documentation** (bản hiện tại): https://www.postgresql.org/docs/current/
- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/
- **Use The Index, Luke!** — thiết kế index đúng: https://use-the-index-luke.com/
- **SQL Style Guide**: https://www.sqlstyle.guide/
- **pgExercises** — bài tập SQL: https://pgexercises.com/
- **Supabase Docs — Database**: https://supabase.com/docs/guides/database
- **PostgreSQL Wiki**: https://wiki.postgresql.org/

---

*Tài liệu tạo ngày 23/10/2026 — phần nâng cao xem tại
[`postgresql-advanced.md`](./postgresql-advanced.md).*
