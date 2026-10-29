# Python thực chiến — Từ code chạy được đến hệ thống vận hành được

> Những gì trường học và tutorial ít dạy: thiết kế repo, API, database, background job,
> testing, CI/CD, logging, bảo mật, Docker/Kubernetes, ETL, code review và xử lý sự cố.
> Mục tiêu: đưa Python vào production **an toàn, quan sát được, rollback được**.

---

## Mục lục

1. [Bức tranh công việc Python thực tế](#1-bức-tranh-công-việc-python-thực-tế)
2. [Kiến trúc repo và ranh giới module](#2-kiến-trúc-repo-và-ranh-giới-module)
3. [Config và secrets](#3-config-và-secrets)
4. [Web API với FastAPI](#4-web-api-với-fastapi)
5. [Database và ORM](#5-database-và-orm)
6. [Background job và message queue](#6-background-job-và-message-queue)
7. [Cache](#7-cache)
8. [Testing chiến lược](#8-testing-chiến-lược)
9. [Quality gate và CI/CD](#9-quality-gate-và-cicd)
10. [Logging, metrics, tracing](#10-logging-metrics-tracing)
11. [Bảo mật](#11-bảo-mật)
12. [Đóng gói và triển khai](#12-đóng-gói-và-triển-khai)
13. [Data, ETL và automation](#13-data-etl-và-automation)
14. [Code review và cộng tác](#14-code-review-và-cộng-tác)
15. [Incident và on-call](#15-incident-và-on-call)
16. [Checklist](#16-checklist)
17. [Tài liệu tham khảo](#17-tài-liệu-tham-khảo)

---

## 1. Bức tranh công việc Python thực tế

Cùng là "dev Python" nhưng công việc rất khác:

| Vai trò | Công việc chính | Kỹ năng cần |
|---|---|---|
| Backend | API, auth, DB, queue, tích hợp | FastAPI/Django, SQL, distributed basics |
| Data engineer | Pipeline, warehouse, chất lượng dữ liệu | SQL, pandas/Spark, orchestration |
| Data analyst | Phân tích, báo cáo, dashboard | pandas, SQL, statistics, viz |
| ML engineer | Train/serve model, feature pipeline | Python, ML, MLOps |
| Platform/SRE | Tooling, automation, CI/CD | Linux, Docker/K8s, Python scripting |
| Automation | Script vận hành, scraping, tích hợp nội bộ | stdlib, API, scheduling |

**Sự thật cần chấp nhận:**

1. Phần lớn thời gian là đọc code, debug, đọc log, trao đổi — không phải gõ code mới.
2. Yêu cầu mơ hồ; việc của bạn là làm rõ acceptance criteria trước khi code.
3. Production khác local: network chập chờn, dữ liệu bẩn, user bấm lung tung.
4. Code chạy đúng chưa đủ: phải quan sát được, bảo mật, rollback được, bàn giao được.
5. Tối ưu quan trọng nhất thường là **giảm phạm vi**, không phải viết nhanh hơn.

> 💡 Tiêu chuẩn của senior không phải "biết nhiều thư viện" mà là **chọn đúng độ phức tạp**,
> **đo được**, **giảm rủi ro** và **giúp người khác đi nhanh hơn**.

### 1.1 Chọn stack theo bài toán

| Bài toán | Stack gợi ý | Ghi chú |
|---|---|---|
| API CRUD nhanh, async | FastAPI + Pydantic + SQLAlchemy | Hệ sinh thái mạnh, tài liệu tốt |
| Ứng dụng full-stack, admin | Django + DRF | Pin trọn bộ, admin sẵn |
| Service nhỏ, đơn giản | Flask/Litestar | Linh hoạt, ít magic |
| Batch/ETL | pandas/Polars + DuckDB/Spark | Chọn theo kích thước dữ liệu |
| Worker/job | Celery/arq/RQ | Celery phổ biến, vận hành nặng hơn |
| CLI nội bộ | Typer/argparse | Đừng dựng web cho việc một lệnh |
| ML serving | FastAPI + ONNX/Triton | Tách training/serving |

Không có stack "tốt nhất"; chọn theo **team hiện tại**, **hạ tầng**, **chi phí vận hành**
và **khả năng tuyển người**.

---

## 2. Kiến trúc repo và ranh giới module

### 2.1 Layout khuyến nghị

```text
guestbook/
├── pyproject.toml
├── uv.lock
├── .python-version
├── README.md
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   └── runbooks/
├── src/guestbook/
│   ├── __init__.py
│   ├── main.py                 # app factory/lifespan
│   ├── config.py
│   ├── api/
│   │   ├── router.py
│   │   ├── guests.py
│   │   └── schemas.py
│   ├── domain/
│   │   ├── guest.py
│   │   └── errors.py
│   ├── service/
│   │   └── guest_service.py
│   ├── repository/
│   │   ├── guest_repo.py
│   │   └── models.py
│   └── infra/
│       ├── db.py
│       ├── redis.py
│       └── email.py
├── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── Dockerfile
└── .github/workflows/ci.yml
```

### 2.2 Quy tắc phụ thuộc

```text
api → service → domain
        ↓
   repository/infra → DB/queue/API
```

- Domain **không** import FastAPI/SQLAlchemy/requests.
- Service điều phối use case, mở transaction, không biết HTTP status.
- API map input/output, auth, status code.
- Repository che persistence; infra che vendor.
- Test unit không cần DB/network.

Với CRUD đơn giản, có thể gộp API + service; đừng tạo tầng rỗng. Tách khi logic thật sự
phức tạp hoặc cần nhiều adapter.

### 2.3 ADR

Mỗi quyết định lớn nên có ADR ngắn:

```markdown
# ADR-0003: Dùng PostgreSQL thay vì SQLite cho production

## Bối cảnh
Cần transaction đồng thời, backup, replication và JSONB.

## Quyết định
Dùng PostgreSQL 16, SQLAlchemy 2.0 async + asyncpg.

## Hệ quả
+ Transaction/locking chuẩn, hệ sinh thái rộng.
- Cần vận hành DB, migration phức tạp hơn.
- Team phải học async session.

## Phương án đã cân nhắc
SQLite (không đủ concurrent), MySQL (team ít kinh nghiệm).
```

ADR giúp người mới hiểu "vì sao", tránh tranh luận lại, và là bằng chứng khi review.

---

## 3. Config và secrets

### 3.1 12-factor

- Config qua **environment variables**, không hard-code.
- Secrets không commit; inject từ secret manager/K8s Secret/CI.
- Cùng một artifact deploy nhiều môi trường.
- Config validate lúc khởi động, fail fast.

### 3.2 Pydantic Settings

```python
# src/guestbook/config.py
from functools import lru_cache
from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="GUESTBOOK_",
        extra="ignore",
    )

    env: str = "local"
    database_url: PostgresDsn
    redis_url: RedisDsn
    jwt_public_key: str
    jwt_audience: str = "guestbook"
    log_level: str = "INFO"
    max_page_size: int = Field(default=100, ge=1, le=500)


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

```bash
GUESTBOOK_DATABASE_URL=postgresql+asyncpg://app:pass@localhost/guestbook
GUESTBOOK_REDIS_URL=redis://localhost:6379/0
GUESTBOOK_JWT_PUBLIC_KEY="$(cat keys/public.pem)"
```

Ưu điểm: validate kiểu ngay, default rõ, test dễ (`Settings(...)` trực tiếp), không đọc
`os.environ` rải rác.

| Sai lầm | Hậu quả |
|---|---|
| `os.getenv("DB")` khắp nơi | Không biết config nào cần, default mơ hồ |
| Secret trong `.env` commit | Lộ vĩnh viễn trong git history |
| Config optional rồi fail giữa request | Lỗi muộn, khó debug |
| Log toàn bộ settings | Lộ secret ra log |
| Dùng chung secret mọi môi trường | Sự cố staging ảnh hưởng production |

### 3.3 Secret management

| Môi trường | Cách |
|---|---|
| Local | `.env` (gitignored), `.env.example` mẫu |
| CI | Secret của CI, mask log |
| AWS | Secrets Manager/SSM Parameter Store + IAM role |
| GCP | Secret Manager + workload identity |
| K8s | External Secrets Operator + sealed secret |
| Vault | Dynamic credential, lease |

Xoay vòng secret định kỳ và khi có sự cố. Không log secret, không đưa secret vào query
string/URL (dễ lộ trong access log).

---

## 4. Web API với FastAPI

### 4.1 App factory và lifespan

```python
# src/guestbook/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api.router import api_router
from .infra.db import create_engine, create_session_factory
from .infra.redis import create_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.engine = create_engine()
    app.state.session_factory = create_session_factory(app.state.engine)
    app.state.redis = create_redis()
    try:
        yield
    finally:
        await app.state.redis.aclose()
        await app.state.engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Guestbook API",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
```

Không tạo connection ở top-level module: import trong test/CLI sẽ mở kết nối ngoài ý muốn.
Lifespan đảm bảo cleanup khi shutdown.

### 4.2 Schema, validation và serialization

```python
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class GuestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    side: Literal["bride", "groom"] = "bride"
    email: str | None = None


class GuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    side: str
    created_at: datetime
```

| Nguyên tắc | Lý do |
|---|---|
| Schema input/output tách biệt | Không lộ field nội bộ (password, internal_id) |
| `response_model`/return type | FastAPI filter + sinh OpenAPI |
| Validate ở biên | Không tin client |
| Không trả ORM entity trực tiếp | Tránh lazy load, lộ dữ liệu |
| Dùng `Literal`/Enum cho trạng thái | Chặn giá trị lạ |

### 4.3 Dependency injection

```python
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .infra.db import get_session_factory


async def get_session() -> AsyncIterator[AsyncSession]:
    factory = get_session_factory()
    async with factory() as session:
        async with session.begin():
            yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]
```

`session.begin()` commit khi block kết thúc bình thường, rollback khi exception. Mọi thay
đổi trong một request nằm trong một transaction — trừ khi cố ý tách.

### 4.4 Router và nghiệp vụ

```python
from fastapi import APIRouter, HTTPException, status

from .deps import SessionDep
from .schemas import GuestCreate, GuestOut
from ..service.guest_service import GuestService

router = APIRouter(prefix="/guests", tags=["guests"])


@router.post("", response_model=GuestOut, status_code=status.HTTP_201_CREATED)
async def create_guest(payload: GuestCreate, session: SessionDep) -> GuestOut:
    service = GuestService(session)
    try:
        guest = await service.create(payload)
    except DuplicateGuest as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return GuestOut.model_validate(guest)
```

Không đặt business logic trong router; router chỉ parse, gọi service, map lỗi, trả response.

### 4.5 Error model thống nhất

Theo RFC 9457 (Problem Details):

```json
{
  "type": "https://api.example.com/problems/duplicate-guest",
  "title": "Khách đã tồn tại",
  "status": 409,
  "detail": "Tên 'Hoa' đã có trong danh sách",
  "instance": "/api/v1/guests"
}
```

```python
from fastapi import Request
from fastapi.responses import JSONResponse


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": f"https://api.example.com/problems/{exc.code}",
            "title": exc.title,
            "status": exc.status_code,
            "detail": str(exc),
            "instance": str(request.url.path),
        },
    )
```

Không trả stack trace, SQL, tên bảng, hay thông tin nội bộ. Log đầy đủ ở server với
correlation id; client chỉ nhận thông tin cần thiết.

### 4.6 AuthN/AuthZ

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

bearer = HTTPBearer(auto_error=False)


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Thiếu token")
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_public_key,
            algorithms=["RS256"],          # allowlist, không lấy từ token
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            options={"require": ["exp", "iat", "sub", "aud"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token không hợp lệ") from exc
    return await load_user(payload["sub"])
```

| Lỗi thường gặp | Hậu quả |
|---|---|
| Nhận `alg` từ token | `alg=none`/confusion attack |
| Không kiểm tra `aud`/`iss` | Token của service khác dùng được |
| Không kiểm tra `exp` | Token vĩnh viễn |
| Chỉ check đăng nhập, không check quyền | IDOR, user A đọc dữ liệu user B |
| Trả chi tiết lỗi auth | Dò tài khoản |
| Lưu token trong localStorage | XSS đánh cắp; ưu tiên httpOnly cookie + CSRF protection |

Authorization phải kiểm tra **theo resource**, không chỉ role toàn cục:

```python
async def get_owned_guest(guest_id: int, user: User, session: SessionDep) -> Guest:
    guest = await session.get(Guest, guest_id)
    if guest is None or guest.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return guest
```

### 4.7 Middleware, CORS, rate limit

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
)
```

- Không `allow_origins=["*"]` khi dùng cookie.
- Rate limit theo user/IP/API key; lưu counter ở Redis, có cửa sổ trượt.
- Giới hạn body size, timeout upstream, số connection.
- Middleware giữ nhẹ; việc nặng đẩy service/queue.

### 4.8 FastAPI vs Django vs Flask

| Tiêu chí | FastAPI | Django | Flask |
|---|---|---|---|
| Async native | Có | Có (Django 4.1+ ORM async hạn chế) | Hạn chế |
| Admin | Không sẵn | Rất mạnh | Không |
| ORM | Chọn tự do | ORM tích hợp | Chọn tự do |
| Validation | Pydantic | Form/DRF serializer | Tự chọn |
| OpenAPI | Tự sinh | DRF + drf-spectacular | Extension |
| Phù hợp | API/service mới | Sản phẩm full-stack, CRUD lớn | Service nhỏ, linh hoạt |
| Đường cong | Trung bình | Cao (nhiều khái niệm) | Thấp |

Chọn Django khi cần auth/admin/CRUD nhanh và team quen; FastAPI khi API-first, async, nhiều
tích hợp; Flask khi cần tối giản và kiểm soát mọi thứ.

---

## 5. Database và ORM

### 5.1 Model SQLAlchemy 2.0

```python
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    side: Mapped[str] = mapped_column(String(10), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    rsvps: Mapped[list["Rsvp"]] = relationship(back_populates="guest")
```

Dùng `Mapped[...]` + `mapped_column` (2.0 style), không dùng `Column` kiểu cũ cho code mới.
`DateTime(timezone=True)` map `timestamptz` ở PostgreSQL.

### 5.2 Session lifecycle

```python
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

engine = create_async_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)
```

| Cấu hình | Ý nghĩa |
|---|---|
| `pool_size` | Connection giữ thường trực mỗi process |
| `max_overflow` | Connection tạm thêm khi tải cao |
| `pool_pre_ping` | Kiểm tra connection chết trước khi dùng |
| `pool_recycle` | Tái tạo connection trước timeout của DB/proxy |
| `expire_on_commit=False` | Tránh lazy load sau commit trong async |

Tổng connection = `pool_size + max_overflow` × số worker/process. Đừng để vượt
`max_connections` của PostgreSQL. Với serverless, dùng PgBouncer hoặc driver pool phù hợp.

### 5.3 Query, N+1 và index

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

stmt = (
    select(Guest)
    .where(Guest.side == side)
    .order_by(Guest.created_at.desc(), Guest.id.desc())
    .limit(limit)
    .offset(offset)
)
guests = (await session.scalars(stmt)).all()

# Tránh N+1 khi cần quan hệ
stmt = select(Guest).options(selectinload(Guest.rsvps)).where(Guest.id.in_(ids))
```

| Vấn đề | Dấu hiệu | Cách xử lý |
|---|---|---|
| N+1 | 1 query list + N query con | `selectinload`/`joinedload`, batch |
| Thiếu index | Query chậm khi bảng lớn | Index theo filter/order/join |
| Index thừa | Ghi chậm, tốn disk | Bỏ index không dùng |
| Offset lớn | Trang cuối chậm | Cursor pagination |
| SELECT * | Tải cột không cần | Chọn cột cụ thể |
| Transaction dài | Lock, bloat | Ngắn hóa, tách I/O ra ngoài |

Kiểm tra bằng `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu giống production. Đừng đoán.

### 5.4 Transaction và isolation

```python
async with session.begin():
    guest = Guest(name="Hoa")
    session.add(guest)
    await session.flush()          # lấy id, chưa commit
    session.add(Rsvp(guest_id=guest.id, status="pending"))
# commit khi ra khỏi block
```

| Mức isolation | Dùng khi |
|---|---|
| READ COMMITTED (mặc định PG) | Đa số OLTP |
| REPEATABLE READ | Báo cáo cần snapshot nhất quán |
| SERIALIZABLE | Tuyệt đối không race, chấp nhận retry |

Không giữ transaction trong lúc gọi HTTP/email (có thể timeout, giữ lock). Dùng outbox/queue.

### 5.5 Migration với Alembic

```bash
alembic revision --autogenerate -m "add guests table"
alembic upgrade head
alembic downgrade -1
```

**Luôn review file autogenerate**: Alembic có thể bỏ sót rename, default, constraint, index.

Chiến lược **expand → migrate → contract** cho zero-downtime:

1. **Expand:** thêm cột nullable/default, bảng mới, index `CONCURRENTLY`.
2. **Deploy code** đọc/ghi cả cũ và mới.
3. **Backfill** theo batch, idempotent.
4. **Switch** đọc sang mới, kiểm tra.
5. **Contract:** bỏ cột/constraint cũ sau khi chắc chắn.

| Thay đổi nguy hiểm | Vấn đề |
|---|---|
| `ALTER TABLE ... ADD COLUMN NOT NULL` không default | Khóa bảng/rewrite |
| Rename cột trực tiếp | Code cũ gãy |
| Drop cột ngay | Rollback không được |
| Tạo index thường trên bảng lớn | Lock ghi |
| Backfill một transaction | Lock lâu, WAL lớn |

### 5.6 Raw SQL khi cần

```python
from sqlalchemy import text

stmt = text("""
    SELECT side, count(*) AS total
    FROM guests
    WHERE created_at >= :since
    GROUP BY side
""")
rows = (await session.execute(stmt, {"since": since})).mappings().all()
```

Luôn dùng **bind parameter**, không f-string với input. Raw SQL phù hợp báo cáo, window
function, bulk operation; ORM phù hợp CRUD và transaction.

### 5.7 Async DB

- `asyncpg` (PostgreSQL) nhanh, `psycopg` 3 hỗ trợ async.
- Không dùng chung `AsyncSession` giữa các task concurrent.
- Không dùng `Session` sync trong async endpoint.
- Với SQLite, `aiosqlite` chỉ phù hợp dev/test nhỏ.
- Transaction + cancellation: đảm bảo rollback trong `finally`.

---

## 6. Background job và message queue

### 6.1 Khi nào cần

Đưa ra ngoài request khi:

- Việc > vài trăm ms (email, PDF, resize ảnh, gọi API chậm).
- Cần retry bền vững.
- Cần chạy theo lịch.
- Cần tách tải/cô lập lỗi.

Không cần queue cho việc < 50ms hoặc có thể làm đồng bộ đơn giản.

### 6.2 Celery

```python
from celery import Celery

celery_app = Celery("guestbook", broker=settings.redis_url)
celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_time_limit=300,
)


@celery_app.task(bind=True, max_retries=5, autoretry_for=(TimeoutError,))
def send_invitation(self, guest_id: int) -> None:
    guest = load_guest(guest_id)
    if guest.invitation_sent_at is not None:      # idempotent
        return
    send_email(guest.email, template="invitation")
    mark_sent(guest_id)
```

| Cấu hình | Ý nghĩa |
|---|---|
| `acks_late=True` | Ack sau khi xử lý; worker chết → task được giao lại |
| `prefetch_multiplier=1` | Công bằng giữa worker, tránh dồn task |
| `max_retries` | Giới hạn retry, tránh vô hạn |
| `task_time_limit` | Kill task treo |
| `autoretry_for` | Chỉ retry exception transient |
| Idempotency check | Chống xử lý trùng khi redelivery |

**Idempotency** là bắt buộc: ít nhất một lần (at-least-once) là mặc định, không phải exactly
once. Dùng unique key/trạng thái/outbox để chống tác dụng phụ lặp.

### 6.3 Outbox pattern

Ghi DB + publish message không thể atomic trong hai hệ thống. Outbox:

1. Trong cùng transaction: ghi business row + outbox row (`event_id`, payload, status).
2. Một publisher đọc outbox chưa gửi, publish queue, đánh dấu sent.
3. Consumer xử lý idempotent theo `event_id`.

Đảm bảo "không mất event" dù broker down; đổi lại cần dọn outbox và theo dõi lag.

### 6.4 Retry, backoff, DLQ

```python
import random
import time

def backoff(attempt: int, base: float = 0.5, cap: float = 30.0) -> float:
    delay = min(cap, base * 2 ** attempt)
    return delay * (0.5 + random.random())      # jitter
```

- Retry chỉ lỗi **transient** (timeout, 429, 5xx, connection reset).
- Không retry lỗi 4xx/logic (trừ 408/409 tùy ngữ cảnh).
- Tôn trọng `Retry-After`.
- Giới hạn số lần, đưa vào **DLQ** để xử lý tay.
- Theo dõi queue depth, age, failure rate.

### 6.5 Chọn công cụ

| Công cụ | Phù hợp | Lưu ý |
|---|---|---|
| Celery | Hệ sinh thái lớn, nhiều broker | Nặng, cấu hình nhiều |
| RQ | Đơn giản, Redis | Ít tính năng nâng cao |
| arq | Async, Redis, nhẹ | Cộng đồng nhỏ hơn |
| Dramatiq | Đơn giản, ổn định | Ít phổ biến ở VN |
| Cloud queue | SQS/PubSub | Vendor lock-in, vận hành nhẹ |
| Kafka | Event stream, replay | Phức tạp, cần nền tảng |

Với job theo lịch đơn giản, cron/systemd timer + script có log/exit code đúng là đủ.

---

## 7. Cache

### 7.1 Cache-aside

```python
import json

async def get_guest(guest_id: int) -> dict | None:
    key = f"guest:{guest_id}"
    cached = await redis.get(key)
    if cached is not None:
        return json.loads(cached)

    guest = await repo.get(guest_id)
    if guest is None:
        await redis.set(key, "null", ex=30)      # cache negative ngắn
        return None

    await redis.set(key, json.dumps(guest), ex=300 + random.randint(0, 60))
    return guest
```

| Chiến lược | Dùng khi |
|---|---|
| Cache-aside | Mặc định, dễ hiểu |
| Write-through | Ghi qua cache, nhất quán hơn |
| Write-behind | Ghi async, rủi ro mất dữ liệu |
| Read-through | Cache tự load, cần thư viện |

### 7.2 Invalidation và stampede

- TTL ngắn cho dữ liệu thay đổi; TTL dài + invalidate chủ động khi có event.
- Xóa cache **sau** khi commit DB, không trước.
- Chống stampede: distributed lock ngắn hoặc "stale-while-revalidate".
- Jitter TTL để tránh hàng loạt key hết hạn cùng lúc.
- Cache key có version (`v2:guest:1`) để đổi schema an toàn.

> ⚠️ Cache không phải nguồn sự thật. Luôn có đường đọc DB; cache hỏng thì hệ thống vẫn đúng
> (chậm hơn), không trả dữ liệu sai vĩnh viễn.

### 7.3 Local cache

```python
from functools import lru_cache

@lru_cache(maxsize=1024)
def get_plan_features(plan: str) -> frozenset[str]:
    return load_from_db(plan)
```

Local cache nhanh nhưng **không đồng bộ giữa các instance**. Chỉ dùng cho dữ liệu ít đổi,
chấp nhận stale, hoặc có TTL ngắn. Với multi-tenant/permission, tuyệt đối cẩn thận.

---

## 8. Testing chiến lược

### 8.1 Kim tự tháp

```text
        E2E (ít, chậm, đắt)
      Integration
    Unit (nhiều, nhanh, rẻ)
```

| Loại | Kiểm tra | Tốc độ | Số lượng |
|---|---|---|---|
| Unit | Logic thuần, edge case | ms | Nhiều |
| Integration | DB, Redis, HTTP, migration | 100ms–vài s | Vừa |
| Contract | Schema/API với consumer | Vừa | Ít |
| E2E | Luồng người dùng chính | Phút | Rất ít |
| Load | Throughput/latency | Phút | Theo đợt |

Đừng cố đạt 100% E2E; chậm, flaky, khó debug. Ưu tiên unit cho logic, integration cho
ranh giới hạ tầng.

### 8.2 Cấu trúc test

```python
# tests/conftest.py
import pytest
from httpx import ASGITransport, AsyncClient

from guestbook.main import create_app


@pytest.fixture
def app():
    return create_app()


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
```

```python
# tests/integration/test_guests.py
import pytest

@pytest.mark.asyncio
async def test_create_guest(client):
    response = await client.post("/api/v1/guests", json={"name": "Hoa"})
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Hoa"
    assert body["id"] > 0


@pytest.mark.asyncio
async def test_reject_empty_name(client):
    response = await client.post("/api/v1/guests", json={"name": ""})
    assert response.status_code == 422
```

### 8.3 Cô lập DB

| Cách | Ưu | Nhược |
|---|---|---|
| Transaction rollback mỗi test | Nhanh | Không test commit/DDL thật |
| Tạo/drop schema mỗi test | Sạch | Chậm |
| Testcontainers | Giống production | Cần Docker, chậm hơn |
| DB riêng mỗi CI job | Đơn giản | Cần hạ tầng |
| SQLite in-memory | Rất nhanh | Khác PostgreSQL (JSONB, lock, kiểu) |

Khuyến nghị: unit dùng fake; integration dùng PostgreSQL thật (testcontainers/CI service),
mỗi test rollback transaction hoặc truncate có kiểm soát. **Không** test PostgreSQL bằng
SQLite rồi tin tưởng hành vi production.

### 8.4 Mock đúng chỗ

| Mock | Không nên mock |
|---|---|
| HTTP bên thứ ba | Logic domain của bạn |
| Email/SMS/payment | ORM/DB trong integration test |
| Clock/random | Chính lớp đang test |
| File system chậm | Mọi thứ (test thành đọc mock) |

Ưu tiên **dependency injection + fake** hơn `patch` chuỗi. Patch nơi tên được tra cứu:

```python
monkeypatch.setattr("guestbook.service.email.send", fake_send)
```

### 8.5 Contract và load test

- **OpenAPI contract:** dùng `schemathesis` sinh request từ schema, kiểm tra response.
- **Consumer-driven:** Pact nếu nhiều team/service.
- **Load:** k6/Locust, đo p95/p99, test cả DB pool và downstream.
- **Chaos nhẹ:** tắt Redis/DB replica, kiểm tra fallback/timeout.

### 8.6 Flaky test

Nguyên nhân thường gặp:

- Phụ thuộc thời gian thật (`sleep`, `now`).
- Thứ tự test/state toàn cục.
- Network/DB không ổn định.
- Race trong async.
- Port cố định, file dùng chung.
- Assert quá chặt vào message/log.

Cách xử lý: inject clock, fixture cô lập, retry **chỉ ở tầng hạ tầng**, đặt timeout, chạy
lặp `pytest -x --count=20` (pytest-repeat) để tái hiện. Không rerun mù trong CI.

### 8.7 Coverage policy

- Đặt ngưỡng theo **diff coverage** (ví dụ 80% cho code mới) thay vì toàn repo.
- Không dùng coverage để đánh giá năng lực cá nhân.
- Ưu tiên test hành vi quan trọng, error path, boundary.
- Coverage giảm đột ngột là tín hiệu, không phải mục tiêu.

---

## 9. Quality gate và CI/CD

### 9.1 Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic]
```

Chạy `pre-commit install`. Pre-commit chỉ là lớp đầu; CI vẫn phải chạy lại (không tin máy dev).

### 9.2 GitHub Actions

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
        with:
          enable-cache: true
      - run: uv sync --frozen
      - run: uv run ruff check .
      - run: uv run ruff format --check .
      - run: uv run mypy src
      - run: uv run pytest --cov=src --cov-report=xml --cov-fail-under=80
      - run: uv run pip-audit
        continue-on-error: false
```

| Gate | Mục đích | Chặn merge? |
|---|---|---|
| Lint/format | Nhất quán, bắt lỗi đơn giản | Có |
| Type check | Hợp đồng kiểu | Có (theo lộ trình) |
| Unit/integration test | Hành vi | Có |
| Security scan | CVE, secret | Có |
| Build image | Artifact deploy được | Có |
| Migration check | Migration chạy được | Có |
| Coverage diff | Không giảm chất lượng | Có (ngưỡng) |

### 9.3 CD

```text
PR → CI → merge main → build image (tag sha) → deploy staging → smoke test
   → approve → deploy production (canary 10% → 100%) → monitor → done/rollback
```

- Image tag bất biến (`sha-<commit>`), không dùng `latest` cho production.
- Migration chạy job riêng, trước/sau deploy theo chiến lược expand/contract.
- Smoke test: health, một endpoint đọc, một luồng ghi quan trọng.
- Rollback: deploy image cũ; migration phải tương thích ngược.
- Feature flag để tách deploy khỏi release.

### 9.4 Version và changelog

- `CHANGELOG.md` theo Keep a Changelog.
- Tag git + release notes.
- Breaking change ghi rõ migration path.
- Với service nội bộ, ít nhất ghi trong PR/ADR.

---

## 10. Logging, metrics, tracing

### 10.1 Structured logging

```python
import json
import logging
from contextvars import ContextVar

request_id: ContextVar[str] = ContextVar("request_id", default="-")


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id.get(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)
```

| Quy tắc | Lý do |
|---|---|
| JSON ở production | Dễ parse/index |
| Có `request_id`, `user_id` (nếu được phép) | Truy vết |
| Không log password/token/PII | Tuân thủ, tránh lộ |
| Log level đúng | ERROR cho sự cố, INFO cho nghiệp vụ |
| Không log mỗi vòng lặp | Tốn tiền, nhiễu |
| Không dùng `print` | Không level/context |
| Không log payload quá lớn | Ảnh hưởng I/O, chi phí |

`request_id` gắn qua middleware và truyền vào log/trace/response header.

### 10.2 Metrics

| Loại | Ví dụ |
|---|---|
| RED (service) | Rate, Errors, Duration |
| USE (resource) | Utilization, Saturation, Errors |
| Business | Số RSVP, tỉ lệ gửi thành công, queue lag |
| Runtime | GC, memory, connection pool, worker count |

```python
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter("http_requests_total", "Total requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request latency",
    ["method", "path"],
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)
```

Không đặt label cardinality cao (user_id, raw URL, request_id) — sẽ nổ Prometheus. Dùng
route template, status class.

### 10.3 Tracing

- OpenTelemetry instrument FastAPI, SQLAlchemy, httpx, Redis.
- Propagate `traceparent` qua service.
- Span cho external call/DB query; attribute có kiểm soát.
- Sampling hợp lý (head/tail) để kiểm soát chi phí.

```python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine)
```

### 10.4 Error tracking

- Sentry/GlitchTip: exception, release, environment, breadcrumb, user context (ẩn PII).
- Không gửi toàn bộ request body/headers.
- Cấu hình `before_send` để lọc dữ liệu nhạy cảm.
- Alert theo tỉ lệ lỗi/triệu chứng người dùng, không chỉ exception count.

### 10.5 SLO và alert

| SLI | SLO gợi ý |
|---|---|
| Availability | 99.9% tháng |
| Latency p95 | < 300ms |
| Error rate | < 0.5% |
| Queue lag | < 60s |
| Freshness dữ liệu | < 5 phút |

Alert phải **actionable**: có runbook, owner, ngưỡng, thời gian. Tránh alert mọi thứ gây
mệt mỏi và bỏ qua cảnh báo thật.

---

## 11. Bảo mật

### 11.1 OWASP Top 10 trong Python

| Rủi ro | Biểu hiện Python | Phòng |
|---|---|---|
| Injection | f-string SQL, `os.system` | Parameterized query, subprocess list |
| Broken auth | JWT `alg=none`, token không hết hạn | Verify đủ claim, Argon2 |
| Sensitive data | Log token, `.env` commit | Mask, secret manager |
| XXE/deserialization | `pickle`, `yaml.load` | `safe_load`, JSON |
| Broken access control | IDOR | Check ownership mọi resource |
| Security misconfig | Debug on, CORS `*` | Hardening, review config |
| XSS | Template không escape | Autoescape, CSP |
| SSRF | Fetch URL do user nhập | Allowlist, chặn metadata IP |
| Vulnerable deps | Package cũ | `pip-audit`, Renovate |
| Insufficient logging | Không audit | Audit log có cấu trúc |

### 11.2 Deserialization

```python
import yaml

data = yaml.safe_load(untrusted)        # KHÔNG dùng yaml.load mặc định
# json.loads an toàn hơn; pickle thì tuyệt đối không với input ngoài
```

`pickle.loads` có thể thực thi code tùy ý. Không dùng pickle cho cache/queue liên service
nếu có thể dùng JSON/MessagePack/Protobuf. Nếu buộc dùng, ký/HMAC và chỉ tin nguồn nội bộ.

### 11.3 SSRF và path traversal

```python
from ipaddress import ip_address
from urllib.parse import urlparse

ALLOWED_HOSTS = {"api.partner.com"}

def validate_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in {"https"} or parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError("URL không được phép")
    # DNS rebinding: resolve và kiểm tra IP private/loopback/link-local
```

- Chặn `localhost`, `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`.
- Theo dõi redirect; kiểm tra lại sau redirect.
- Path: `(root / user_path).resolve().is_relative_to(root)`.

### 11.4 Auth và mật khẩu

- Hash bằng Argon2id (khuyến nghị) hoặc bcrypt cost ≥ 12; không tự viết crypto.
- Không lưu mật khẩu dạng plaintext/ reversible encryption.
- Rate limit login, thông báo lỗi chung, khóa tạm sau nhiều lần sai.
- MFA cho admin.
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, CSRF token nếu cần.
- JWT access token ngắn hạn + refresh token rotation; revoke khi logout/đổi mật khẩu.

### 11.5 Multi-tenant

Mọi query phải scope theo tenant, kể cả `get by id`:

```python
stmt = select(Guest).where(Guest.id == guest_id, Guest.tenant_id == user.tenant_id)
```

Cân nhắc Row-Level Security (PostgreSQL) + session variable; test IDOR tự động. Không tin
`tenant_id` từ client.

### 11.6 Dependency và CI security

```bash
uv run pip-audit
uv run bandit -r src
uv run detect-secrets scan
```

- Pin lockfile, cập nhật định kỳ.
- Kiểm tra package name (typosquatting), maintainer.
- Không chạy `curl | bash` trong CI.
- Scan image (Trivy/Grype), base image tối giản.
- Secret scanning + rotate nếu lộ.

### 11.7 Audit log

Ghi lại hành động nhạy cảm: đăng nhập, đổi quyền, xóa dữ liệu, export. Có actor, thời gian,
IP, resource, kết quả. Không ghi secret/PII quá mức; có retention và quyền truy cập.

---

## 12. Đóng gói và triển khai

### 12.1 Docker production

```dockerfile
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

FROM base AS builder
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM base AS runtime
COPY --from=builder /app/.venv /app/.venv
COPY src ./src
ENV PATH="/app/.venv/bin:$PATH"
RUN useradd --create-home app && chown -R app:app /app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')"
CMD ["uvicorn", "guestbook.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 12.2 Worker model

| Server | Phù hợp | Ghi chú |
|---|---|---|
| Uvicorn (1 process) | Container, K8s scale ngang | Đơn giản, tín hiệu sạch |
| Uvicorn `--workers N` | VM, ít orchestration | N process, mỗi process pool riêng |
| Gunicorn + UvicornWorker | Cần Gunicorn quản lý | Cấu hình worker/timeout |
| Hypercorn | HTTP/2, ASGI khác | Ít phổ biến hơn |

Với async, bắt đầu 1 worker/container và scale bằng replica; tránh nhân worker quá nhiều
làm tăng connection DB. Với sync, công thức cũ `(2 × CPU) + 1` chỉ là điểm khởi đầu — đo
lại theo workload.

### 12.3 Health check

```python
@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz")
async def readyz(session: SessionDep) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"status": "ready"}
```

- **Liveness**: process còn sống, không phụ thuộc DB (tránh restart dây chuyền).
- **Readiness**: nhận traffic được, kiểm tra dependency quan trọng.
- Không đặt auth cho health nội bộ; giới hạn network.

### 12.4 Kubernetes

```yaml
spec:
  terminationGracePeriodSeconds: 30
  containers:
    - name: api
      image: registry/guestbook:sha-abc123
      ports: [{containerPort: 8000}]
      readinessProbe:
        httpGet: {path: /readyz, port: 8000}
        periodSeconds: 5
      livenessProbe:
        httpGet: {path: /healthz, port: 8000}
        periodSeconds: 10
      resources:
        requests: {cpu: "250m", memory: "256Mi"}
        limits: {memory: "512Mi"}
      lifecycle:
        preStop:
          exec:
            command: ["sleep", "5"]
```

Graceful shutdown: ngừng nhận request mới, đợi request đang chạy, đóng pool. Uvicorn bắt
`SIGTERM` và shutdown; đảm bảo timeout orchestrator > thời gian xử lý tối đa.

### 12.5 Migration trong deploy

1. Chạy migration **trước** deploy code nếu backward compatible (expand).
2. Deploy code mới.
3. Backfill/switch.
4. Cleanup (contract) ở release sau.

Không chạy migration tự động trong mỗi pod khởi động (race, khóa). Dùng job riêng có
advisory lock hoặc CI step.

### 12.6 Rollback

| Kịch bản | Cách rollback |
|---|---|
| Code lỗi | Deploy image cũ, giữ DB tương thích |
| Migration lỗi | Downgrade đã test, hoặc forward-fix |
| Feature lỗi | Tắt feature flag |
| Dữ liệu sai | Backup/PITR, script sửa có audit |
| Tải cao | Scale, rate limit, tắt tính năng nặng |

Rollback phải được **diễn tập**. Một quy trình rollback chưa thử là một giả định.

---

## 13. Data, ETL và automation

### 13.1 pandas vs Polars vs SQL

| Quy mô | Công cụ |
|---|---|
| < 1GB | pandas/Polars trong memory |
| 1–100GB | Polars lazy/DuckDB, chunking |
| > 100GB | Spark/warehouse (BigQuery/Snowflake) |
| Phân tích ad-hoc | SQL trước, pandas sau |

Đừng dùng pandas cho dữ liệu không vừa RAM; đừng dùng Spark cho file 10MB.

### 13.2 pandas thực chiến

```python
import pandas as pd

dtypes = {"guest_id": "int64", "amount": "int64", "status": "category"}
df = pd.read_csv("rsvp.csv", dtype=dtypes, parse_dates=["created_at"])

# Vector hóa, không lặp iterrows
df["is_attending"] = df["status"].eq("yes")
summary = (
    df.groupby("side", observed=True)
      .agg(total=("guest_id", "count"), attending=("is_attending", "sum"))
      .reset_index()
)
```

| Bẫy | Hậu quả |
|---|---|
| `iterrows` cho dữ liệu lớn | Rất chậm |
| Không set dtype | Tốn RAM, parse sai |
| `SettingWithCopyWarning` | Sửa nhầm bản copy |
| `NaN` với kiểu int | Tự đổi float/object |
| Múi giờ naive | Lệch giờ |
| Float cho tiền | Sai số |

Dùng `pd.options.mode.copy_on_write = True` (pandas 2.x) để giảm bất ngờ.

### 13.3 ETL idempotent

```python
def load_partition(ds: str) -> None:
    # 1. Ghi vào staging table/partition tạm
    df = extract(ds)
    validate_schema(df)
    write_staging(df, ds)

    # 2. Merge theo key (upsert) hoặc replace partition
    merge_into_target(ds)

    # 3. Ghi checkpoint chỉ khi thành công
    mark_checkpoint(ds)
```

- Chạy lại một ngày không tạo duplicate.
- Schema validation (pandera/Pydantic) trước khi ghi.
- Checkpoint/watermark để resume.
- Log row count, null rate, min/max, thời gian.
- Dữ liệu bẩn: quarantine + alert, không âm thầm drop.

### 13.4 Excel/CSV cho nghiệp vụ

```python
from openpyxl import Workbook

wb = Workbook(write_only=True)
ws = wb.create_sheet("guests")
ws.append(["Tên", "Bên", "Bàn"])
for guest in guests:
    ws.append([guest.name, guest.side, guest.table])
wb.save("guests.xlsx")
```

- File lớn dùng `write_only=True`/`read_only=True`.
- CSV: `utf-8-sig` nếu mở bằng Excel cần hiển thị tiếng Việt đúng.
- Validate số dòng/cột, giới hạn upload, quét formula injection (`=`, `+`, `-`, `@`) khi
  xuất CSV cho người dùng.

### 13.5 Automation và scraping

```python
import sys
import logging

def main() -> int:
    logging.basicConfig(level=logging.INFO)
    try:
        run()
    except Exception:
        logging.exception("job failed")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

- Exit code 0/≠0 để cron/CI biết thành công.
- Lockfile/pid file chống chạy chồng.
- Timeout, retry, alert khi fail.
- Scraping: đọc `robots.txt`, giới hạn rate, user-agent rõ, cache, tôn trọng ToS và bản
  quyền; ưu tiên API chính thức.
- Dùng Playwright khi cần JS; Selenium cũ hơn, nặng hơn.

### 13.6 Orchestration

| Công cụ | Phù hợp |
|---|---|
| cron/systemd timer | Job đơn giản, một máy |
| Airflow | DAG phức tạp, dependency, backfill |
| Prefect/Dagster | Pipeline hiện đại, observability |
| Celery beat | Job nhỏ trong hệ sinh thái Celery |
| Cloud scheduler | Lambda/Cloud Run, ít vận hành |

---

## 14. Code review và cộng tác

### 14.1 PR tốt

- Nhỏ (< 400 dòng thay đổi lý tưởng), một mục đích.
- Mô tả: vấn đề, cách giải, ảnh hưởng, cách test, rollback.
- Có test đi kèm, hoặc giải thích vì sao không.
- Không trộn refactor lớn với feature.
- Migration/feature flag/config được ghi rõ.

### 14.2 Checklist review

- [ ] Logic đúng với acceptance criteria, edge case được xử lý.
- [ ] Không lộ secret/PII, log an toàn.
- [ ] Query không N+1, có index, transaction đúng.
- [ ] Error handling: không nuốt lỗi, thông điệp hữu ích.
- [ ] Async không block, timeout/retry hợp lý.
- [ ] Type hint, naming, test rõ ràng.
- [ ] Backward compatibility/API contract.
- [ ] Migration an toàn, rollback được.
- [ ] Observability: log/metric cần thiết.
- [ ] Không thêm dependency không cần.

### 14.3 Review văn minh

- Bình luận vào code, không vào người.
- Phân biệt **blocking** (phải sửa) và **nit/suggestion**.
- Hỏi "vì sao" trước khi khẳng định "sai".
- Đề xuất giải pháp cụ thể, kèm link/tài liệu.
- Chấp nhận trade-off đã thống nhất; không bắt sở thích cá nhân.

### 14.4 ADR, docs, onboarding

- README chạy được trong < 10 phút.
- `.env.example` đầy đủ.
- Makefile/justfile cho lệnh thường dùng.
- Sơ đồ kiến trúc + luồng dữ liệu.
- Runbook cho job/service quan trọng.
- ADR cho quyết định lớn.
- Glossary thuật ngữ nội bộ.

### 14.5 Estimate và tech debt

- Estimate theo **khoảng** + giả định + rủi ro, không một con số.
- Tách task mơ hồ thành spike (timebox) trước khi cam kết.
- Tech debt ghi lại (vấn đề, rủi ro, chi phí, đề xuất), trả dần theo tỉ lệ.
- Không dùng "tech debt" để biện minh cho code cẩu thả.

### 14.6 Legacy code

1. Viết **characterization test** mô tả hành vi hiện tại trước khi sửa.
2. Sửa từng bước nhỏ, deploy thường xuyên.
3. Strangler fig: bọc module cũ bằng interface, thay dần.
4. Không big-bang rewrite nếu không có lý do sống còn.
5. Đo trước/sau để chứng minh cải thiện.

---

## 15. Incident và on-call

### 15.1 Phân loại và vai trò

| Severity | Ảnh hưởng | Ví dụ |
|---|---|---|
| SEV1 | Toàn bộ dịch vụ/khách hàng | API down, mất dữ liệu |
| SEV2 | Một phần/flow chính | Thanh toán lỗi 30% |
| SEV3 | Ảnh hưởng nhỏ, workaround | Chậm báo cáo |
| SEV4 | Không ảnh hưởng người dùng | Cảnh báo nội bộ |

Vai trò: **Incident Commander** (điều phối), **Comms Lead** (cập nhật stakeholder),
**Ops/SME** (debug/fix), **Scribe** (timeline). Với team nhỏ, một người kiêm nhiệm nhưng
vẫn phải phân vai rõ.

### 15.2 Quy trình

1. **Phát hiện** qua alert/user report.
2. **Xác nhận** phạm vi, severity, bắt đầu timeline.
3. **Giảm thiểu trước, tìm root cause sau**: rollback, tắt flag, scale, chặn traffic.
4. **Cập nhật** stakeholder theo nhịp cố định (ví dụ 15 phút/lần).
5. **Ghi lại** mọi thay đổi, thời điểm, giả thuyết.
6. **Khôi phục**, xác nhận metric trở lại bình thường.
7. **Postmortem** không đổ lỗi, trong 2–5 ngày.
8. **Action item** có owner, deadline, ticket; theo dõi đến hết.

### 15.3 Debug production

| Bước | Công cụ |
|---|---|
| Xem tổng quan | Dashboard RED/USE, SLO |
| Tìm lỗi | Log JSON, error tracking |
| Truy vết request | Trace ID, correlation ID |
| Xem process | `py-spy top --pid`, `py-spy dump` |
| Xem memory | `tracemalloc`, `memray`, RSS/GC metric |
| Xem DB | `pg_stat_activity`, slow query log, lock |
| Xem queue | Depth, age, consumer lag, DLQ |
| Xem network | Timeout, DNS, TLS, 5xx upstream |

Không debug bằng cách SSH sửa code trên production. Dùng công cụ read-only, feature flag,
và thay đổi qua pipeline.

### 15.4 Postmortem mẫu

```markdown
# Postmortem: API guestbook lỗi 500 trong 42 phút (2026-10-20)

## Tóm tắt
Migration thêm cột NOT NULL không default gây lock bảng, request timeout.

## Ảnh hưởng
- 42 phút, 18% request lỗi, không mất dữ liệu.

## Dòng thời gian
10:02 deploy migration — 10:04 alert latency — 10:10 rollback — 10:44 hết lỗi.

## Nguyên nhân gốc
Migration không tương thích ngược; thiếu kiểm tra lock trên staging.

## Yếu tố góp phần
- Staging ít dữ liệu nên migration chạy nhanh.
- Không có lint migration.
- Alert đến sau 2 phút.

## Bài học
- Bắt buộc expand/contract cho bảng lớn.
- Thêm bước kiểm tra migration trên bản sao dữ liệu.
- Giảm ngưỡng alert latency.

## Action item
| Việc | Owner | Deadline |
|---|---|---|
| Migration lint CI | An | 2026-10-27 |
| Diễn tập rollback | Bình | 2026-11-03 |
```

### 15.5 On-call bền vững

- Runbook cho mọi alert; alert không có runbook thì chưa xong.
- Giới hạn số alert/tuần, loại bỏ alert nhiễu.
- Luân phiên, có thời gian phục hồi sau incident đêm.
- Không trừng phạt người báo lỗi; thưởng cho việc phát hiện sớm.
- Đo MTTR/MTTD, không chỉ số incident.

---

## 16. Checklist

### 16.1 Service mới

- [ ] Repo layout, pyproject, lockfile, README chạy được.
- [ ] Config qua env, validate lúc start, `.env.example`.
- [ ] Health/readiness, graceful shutdown.
- [ ] Log JSON + request id; metric cơ bản; error tracking.
- [ ] Authn/authz, rate limit, CORS, security headers.
- [ ] DB migration có rollback/expand-contract.
- [ ] Test unit + integration; CI xanh.
- [ ] Docker non-root, image nhỏ, scan CVE.
- [ ] Runbook + on-call + alert có owner.
- [ ] Backup/restore và rollback đã diễn tập.

### 16.2 Trước release

- [ ] `ruff`, `mypy`, test pass; coverage không giảm.
- [ ] Migration đã chạy staging với dữ liệu giống production.
- [ ] Feature flag/toggle nếu rủi ro.
- [ ] Dashboard/alert cho tính năng mới.
- [ ] Kế hoạch rollback + người trực.
- [ ] Thông báo stakeholder (nếu cần).
- [ ] Kiểm tra quyền/secret môi trường.
- [ ] Smoke test sau deploy.

### 16.3 Production readiness

- [ ] SLO/alert có ngưỡng và runbook.
- [ ] Timeout/retry/circuit breaker ở mọi dependency.
- [ ] Giới hạn tài nguyên (memory/CPU/connection).
- [ ] Backup tự động + restore test.
- [ ] Log retention và quyền truy cập.
- [ ] Dependency/security scan định kỳ.
- [ ] Tài liệu kiến trúc + ADR.
- [ ] Diễn tập incident/rollback.

### 16.4 Performance

- [ ] Đo p50/p95/p99, không chỉ trung bình.
- [ ] Query có index, không N+1.
- [ ] Payload/response không thừa.
- [ ] Cache có TTL/invalidation.
- [ ] Async không block; concurrency có giới hạn.
- [ ] Pool size khớp số worker và DB.
- [ ] Load test ở mức tải dự kiến ×2.

---

## 17. Tài liệu tham khảo

- FastAPI: https://fastapi.tiangolo.com/
- Pydantic: https://docs.pydantic.dev/
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/
- Alembic: https://alembic.sqlalchemy.org/
- Django: https://docs.djangoproject.com/
- Celery: https://docs.celeryq.dev/
- pytest: https://docs.pytest.org/
- testcontainers: https://testcontainers-python.readthedocs.io/
- OpenTelemetry Python: https://opentelemetry.io/docs/languages/python/
- Prometheus: https://prometheus.io/docs/
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- 12-Factor App: https://12factor.net/
- Google SRE Book: https://sre.google/books/
- PostgreSQL docs: https://www.postgresql.org/docs/
- Kubernetes: https://kubernetes.io/docs/
- pandas: https://pandas.pydata.org/docs/
- Polars: https://docs.pola.rs/
- Airflow: https://airflow.apache.org/docs/

---

*Đọc tiếp: [`interview/README.md`](./interview/README.md) để ôn phỏng vấn theo level, hoặc
[`python-cheatsheet.md`](./python-cheatsheet.md) để tra cứu nhanh hằng ngày.*
