# Python — Từ nền tảng đến Senior Manager

> Bộ tài liệu Python tiếng Việt cho người học và người đi làm: cú pháp, internals, kiến trúc,
> vận hành production và ngân hàng câu hỏi phỏng vấn từ **Fresher → Junior → Middle →
> Senior → Tech Lead → Engineering Manager → Senior Manager**. Ví dụ bám công việc thật
> (backend, data, automation), không chỉ bài tập sách giáo khoa.

---

## Mục lục

1. [Python là gì và được dùng ở đâu?](#1-python-là-gì-và-được-dùng-ở-đâu)
2. [Chọn phiên bản Python](#2-chọn-phiên-bản-python)
3. [Bản đồ tài liệu](#3-bản-đồ-tài-liệu)
4. [Lộ trình 8 tuần cho người mới](#4-lộ-trình-8-tuần-cho-người-mới)
5. [Lộ trình 4 tuần cho dev đã biết ngôn ngữ khác](#5-lộ-trình-4-tuần-cho-dev-đã-biết-ngôn-ngữ-khác)
6. [Cài đặt môi trường chuẩn](#6-cài-đặt-môi-trường-chuẩn)
7. [Project đầu tiên](#7-project-đầu-tiên)
8. [Quy ước code và chất lượng](#8-quy-ước-code-và-chất-lượng)
9. [Cấu trúc project thực tế](#9-cấu-trúc-project-thực-tế)
10. [Checklist môi trường](#10-checklist-môi-trường)
11. [Lỗi setup thường gặp](#11-lỗi-setup-thường-gặp)
12. [Cách dùng bộ tài liệu](#12-cách-dùng-bộ-tài-liệu)
13. [Tài liệu tham khảo](#13-tài-liệu-tham-khảo)

---

## 1. Python là gì và được dùng ở đâu?

Python là ngôn ngữ **thông dịch, kiểu động, đa mục đích**, do Guido van Rossum tạo ra
(1991). Triết lý của nó nằm trong *The Zen of Python* (PEP 20): dễ đọc hơn viết nhanh,
tường minh hơn ngầm hiểu, đơn giản hơn phức tạp. CPython — bản tham chiếu viết bằng C —
biên dịch source sang **bytecode** rồi chạy trên máy ảo; PyPy, GraalPy, Jython là các
implementation khác.

| Lĩnh vực | Thư viện/framework tiêu biểu | Ghi chú |
|---|---|---|
| Web/API | FastAPI, Django, Flask, Litestar | FastAPI + Pydantic v2 rất phổ biến cho API mới |
| Data/ETL | pandas, Polars, PySpark, dbt | Xử lý dữ liệu lớn thường đẩy sang Spark/warehouse |
| ML/AI | PyTorch, scikit-learn, Hugging Face | Python là ngôn ngữ điều phối, compute ở C/CUDA |
| Automation | argparse, Typer, Playwright, Ansible | Script vận hành, scraping, CI tooling |
| Testing/tooling | pytest, ruff, mypy, tox, uv | Hệ sinh thái tooling rất mạnh |
| Hạ tầng | Celery, Redis, Kafka clients, OpenTelemetry | Thường đứng sau API, worker, scheduler |

**Điểm mạnh:** hệ sinh thái lớn, cú pháp ngắn, cộng đồng data/AI, tốc độ phát triển
nhanh, dễ đọc và dễ bảo trì. **Điểm yếu:** chậm hơn C/Rust/Go cho CPU-bound, đóng gói
môi trường dễ lệch, dynamic typing đòi hỏi test + type checker kỷ luật, GIL giới hạn
đa luồng CPU-bound (đang thay đổi với free-threading).

> 💡 Python không "chậm" trong đa số bài toán backend: thời gian thường nằm ở DB, network
> và I/O. Chỉ tối ưu khi đã đo — xem [`python-advanced.md`](./python-advanced.md) §11.

---

## 2. Chọn phiên bản Python

| Phiên bản | Trạng thái (2026) | Điểm đáng chú ý |
|---|---|---|
| 3.9 | Hết hỗ trợ | `zoneinfo`, `dict \|`; không dùng cho dự án mới |
| 3.10 | Bảo trì hạn chế | `match/case`, `X \| Y`, `zip(strict=True)` |
| 3.11 | Ổn định, phổ biến | `ExceptionGroup`/`except*`, `TaskGroup`, nhanh hơn 3.10 |
| 3.12 | **Baseline khuyến nghị** | PEP 695 generics, f-string linh hoạt, `itertools.batched`, `override` |
| 3.13 | Ổn định | REPL mới, free-threaded **experimental**, JIT thử nghiệm, `TypeIs` |
| 3.14 | Ổn định | Template strings (t-string), annotations trì hoãn, free-threading chính thức |

Khuyến nghị:

- **Dự án mới:** Python 3.12+ (hoặc 3.13 nếu hạ tầng đã hỗ trợ). Ghim phiên bản trong
  `.python-version`, `pyproject.toml` và Docker image.
- **Thư viện public:** hỗ trợ tối thiểu 3.10–3.11, test matrix nhiều phiên bản.
- **Free-threaded (3.13/3.14):** chỉ dùng khi đã benchmark và toàn bộ dependency tương
  thích; bản free-threaded chậm hơn bản thường ở tác vụ single-thread.
- Không dùng 3.8/3.9 cho code mới: thiếu typing hiện đại, bảo mật hết hạn.

> ⚠️ Tính năng mới phải kiểm tra lại docs tại thời điểm dùng. Ví dụ `except*` cần 3.11+,
> `type` alias cần 3.12+, t-string cần 3.14+.

---

## 3. Bản đồ tài liệu

| Tài liệu | Nội dung | Dành cho |
|---|---|---|
| [`python-basics.md`](./python-basics.md) | Cú pháp, kiểu dữ liệu, collection, hàm, OOP, exception, file, stdlib, pytest, debug | Fresher → Junior |
| [`python-advanced.md`](./python-advanced.md) | Data model, generator, decorator, descriptor, typing nâng cao, async, GIL, memory, profiling, packaging, pattern | Middle → Senior |
| [`python-production.md`](./python-production.md) | Kiến trúc repo, FastAPI/Django, SQLAlchemy, queue, cache, test, CI/CD, logging, security, Docker/K8s, data/automation, incident | Đi làm thật |
| [`python-cheatsheet.md`](./python-cheatsheet.md) | Tra cứu nhanh cú pháp, stdlib, lệnh uv/pytest/ruff/mypy, recipe | Hằng ngày |
| [`interview/README.md`](./interview/README.md) | Ma trận câu hỏi, thang điểm, lộ trình ôn, công thức trả lời | Ứng viên + interviewer |
| [`interview/01-fresher.md`](./interview/01-fresher.md) | ~100 câu nền tảng + coding cơ bản | 0–1 năm |
| [`interview/02-junior.md`](./interview/02-junior.md) | ~80 câu ngôn ngữ, web, DB, test, Git | 1–3 năm |
| [`interview/03-middle.md`](./interview/03-middle.md) | ~80 câu internals, async, kiến trúc, DB, security, system design nhỏ | 3–5 năm |
| [`interview/04-senior.md`](./interview/04-senior.md) | ~70 câu nội bộ CPython, distributed system, scale, technical strategy | 5+ năm |
| [`interview/05-lead-manager.md`](./interview/05-lead-manager.md) | ~65 câu tech lead, EM, senior manager: people, delivery, hiring, org, budget | Lead/Manager |
| [`interview/06-scenarios.md`](./interview/06-scenarios.md) | Tình huống debug, code review, system design, behavioral, rapid-fire | Mid → Manager |

Tổng cộng khoảng **395 câu hỏi có đáp án**, **25 tình huống thực chiến** và **~120 câu rapid-fire**.

---

## 4. Lộ trình 8 tuần cho người mới

Giả định 1.5–2 giờ/ngày, có laptop và biết dùng terminal cơ bản.

| Tuần | Nội dung | Sản phẩm bàn giao |
|---|---|---|
| 1 | Cài môi trường, biến/kiểu, string, list/dict/set, điều kiện, vòng lặp | 30 bài tập nhỏ + CLI tính chi phí |
| 2 | Hàm, scope, module, exception, file/JSON/CSV, venv | CLI quản lý chi tiêu lưu JSON |
| 3 | OOP, dataclass, kế thừa, composition, type hints cơ bản | Refactor CLI thành package có model/service |
| 4 | Stdlib, logging, argparse, datetime, regex, test với pytest | CLI có test, logging, `--help` |
| 5 | HTTP client, FastAPI cơ bản, REST, SQL cơ bản | API CRUD + SQLite/PostgreSQL |
| 6 | SQLAlchemy, migration, auth cơ bản, validation | API có user, phân quyền, migration |
| 7 | Async, background job, Docker, CI | API chạy Docker + GitHub Actions |
| 8 | Observability, security, deploy, ôn phỏng vấn | Service chạy staging + portfolio README |

**Nguyên tắc:** mỗi tuần phải có **một artifact chạy được**, không chỉ đọc. Cuối tuần viết
5 dòng "học được gì, còn yếu gì, tuần sau sửa gì".

---

## 5. Lộ trình 4 tuần cho dev đã biết ngôn ngữ khác

| Tuần | Trọng tâm | Khác biệt cần bỏ thói quen |
|---|---|---|
| 1 | Cú pháp, collection, comprehension, unpacking, f-string | Không cần `new`, không có `{}`; `for` lặp theo giá trị |
| 2 | Hàm, closure, decorator, generator, context manager | Hàm là first-class; `with` thay cho try/finally thủ công |
| 3 | OOP, MRO, dataclass, Protocol, typing | Duck typing + Protocol; tránh abstract factory kiểu Java |
| 4 | Async, concurrency, packaging, pytest, FastAPI | GIL, event loop; venv/uv thay cho npm/maven |

Đọc nhanh [`python-cheatsheet.md`](./python-cheatsheet.md) mỗi ngày trong tuần 1.

---

## 6. Cài đặt môi trường chuẩn

### 6.1 Công cụ khuyến nghị

| Công cụ | Vai trò | Lệnh |
|---|---|---|
| `uv` | Quản lý Python + dependency + lockfile, rất nhanh | `brew install uv` |
| `pyenv` | Chuyển nhiều phiên bản Python | `brew install pyenv` |
| `ruff` | Lint + format, thay flake8/black/isort | `uv tool install ruff` |
| `mypy` / `pyright` | Kiểm tra kiểu tĩnh | `uv tool install mypy` |
| `pytest` | Test framework | dependency dev |
| `pre-commit` | Chạy check trước commit | `uv tool install pre-commit` |
| `direnv` (tuỳ chọn) | Tự load `.env` theo thư mục | `brew install direnv` |

### 6.2 Tạo project với uv

```bash
mkdir my-service && cd my-service
uv init --python 3.12 --package
uv add fastapi "uvicorn[standard]" pydantic-settings
uv add --dev pytest pytest-cov ruff mypy httpx
uv run python -m my_service
```

`uv init --package` tạo layout `src/`, `pyproject.toml`, `.python-version`. `uv.lock`
phải commit; CI dùng `uv sync --frozen`.

### 6.3 Cách ly môi trường

| Cách | Khi dùng |
|---|---|
| `uv venv` + `uv sync` | Mặc định cho mọi dự án |
| `python -m venv .venv` + pip | Khi môi trường không có uv |
| Docker | Đồng nhất giữa máy dev, CI và production |
| Conda | Data/ML cần CUDA, thư viện native đặc thù |

Không bao giờ `pip install` vào Python hệ thống của macOS/Linux. Kiểm tra:

```bash
python3 -c "import sys; print(sys.executable)"
# phải trỏ tới .venv/bin/python khi đã activate
```

### 6.4 VS Code / PyCharm

- Chọn interpreter `.venv/bin/python`.
- Bật format on save bằng ruff, organize imports.
- Bật type checking workspace (basedpyright/pyright) ở chế độ `basic` hoặc `standard`.
- Cài extension: Python, Ruff, Even Better TOML, Docker, GitLens.

---

## 7. Project đầu tiên

```bash
uv init --package guestbook
cd guestbook
uv add typer rich
```

`src/guestbook/cli.py`:

```python
from __future__ import annotations

import json
from pathlib import Path

import typer

app = typer.Typer(help="Quản lý danh sách khách mời.")
DATA = Path("guests.json")


def load() -> list[dict[str, str]]:
    if not DATA.exists():
        return []
    return json.loads(DATA.read_text(encoding="utf-8"))


@app.command()
def add(name: str, side: str = "bride") -> None:
    """Thêm khách mời và lưu ngay xuống đĩa."""
    guests = load()
    guests.append({"name": name.strip(), "side": side})
    DATA.write_text(json.dumps(guests, ensure_ascii=False, indent=2), encoding="utf-8")
    typer.echo(f"Đã thêm {name} ({len(guests)} khách)")


@app.command()
def list_guests() -> None:
    """In toàn bộ khách mời."""
    for i, guest in enumerate(load(), start=1):
        typer.echo(f"{i:>3}. {guest['name']} — {guest['side']}")


if __name__ == "__main__":
    app()
```

Chạy:

```bash
uv run guestbook add "Chị Hoa" --side bride
uv run guestbook list-guests
uv run pytest -q
```

> 💡 Bài tập mở rộng: thêm `remove`, `search`, đếm theo bên, import CSV, test với
> `tmp_path`, và đóng gói thành Docker image.

---

## 8. Quy ước code và chất lượng

### 8.1 PEP 8 và ruff

| Quy ước | Chuẩn |
|---|---|
| Tên biến/hàm | `snake_case` |
| Tên class | `PascalCase` |
| Hằng số | `UPPER_SNAKE_CASE` |
| Module/package | `snake_case`, ngắn, không trùng stdlib |
| Độ dài dòng | 88 (ruff/black mặc định) |
| Import | stdlib → third-party → local, mỗi nhóm cách dòng |
| Docstring | Google hoặc NumPy style, bắt đầu bằng động từ |
| Type hint | Bắt buộc ở public function, domain model |

`pyproject.toml` mẫu:

```toml
[tool.ruff]
line-length = 88
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM", "S", "RUF"]
ignore = ["S101"]  # assert dùng trong test

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101", "S105", "S106"]

[tool.mypy]
python_version = "3.12"
strict = true
warn_unused_ignores = true
plugins = ["pydantic.mypy"]

[tool.pytest.ini_options]
addopts = "-q --strict-markers --cov=src --cov-report=term-missing"
testpaths = ["tests"]
```

### 8.2 Nguyên tắc code

1. **Rõ hơn ngắn.** Không viết one-liner khó đọc chỉ để tiết kiệm dòng.
2. **Type hint ở biên.** Public API, service, DTO phải có type; hàm nội bộ đơn giản có
   thể bỏ nếu test đủ.
3. **Không nuốt exception.** `except Exception: pass` là bug tiềm ẩn.
4. **Không dùng mutable default.** `def f(xs: list[int] = [])` → dùng `None`.
5. **Tách I/O khỏi logic.** Hàm tính toán thuần túy dễ test hơn hàm vừa đọc DB vừa ghi file.
6. **Log có cấu trúc, không `print`.** Production dùng JSON log + correlation id.
7. **Test hành vi, không test implementation.** Đổi refactor không được làm đỏ test.
8. **Dependency tối thiểu.** Mỗi thư viện thêm là một bề mặt bảo mật và bảo trì.

### 8.3 Definition of Done cho một feature

- [ ] Có issue/requirements rõ, acceptance criteria.
- [ ] Code + type hint + docstring cho public API.
- [ ] Unit test cho logic, integration test cho DB/API khi cần.
- [ ] `ruff check`, `ruff format --check`, `mypy` pass.
- [ ] Log/metric phù hợp, không lộ dữ liệu nhạy cảm.
- [ ] Migration có rollback hoặc kế hoạch expand/contract.
- [ ] README/ADR cập nhật nếu đổi kiến trúc.
- [ ] Đã thử trên môi trường giống production.

---

## 9. Cấu trúc project thực tế

### 9.1 Service nhỏ (khuyến nghị bắt đầu)

```text
guestbook/
├── pyproject.toml
├── uv.lock
├── .python-version
├── README.md
├── src/guestbook/
│   ├── __init__.py
│   ├── main.py           # entrypoint, khởi tạo app
│   ├── config.py         # settings từ env
│   ├── api/              # router, schema
│   ├── service/          # business logic
│   ├── repository/       # DB access
│   └── domain/           # entity, value object, exception nghiệp vụ
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── migrations/
├── Dockerfile
└── .github/workflows/ci.yml
```

### 9.2 Khi nào tách package

| Quy mô | Cách tổ chức |
|---|---|
| < 5k dòng, 1 team | Một package, chia module theo feature |
| 5–50k dòng, 2–4 team | Monorepo nhiều package (`apps/`, `libs/`), boundary rõ |
| Nhiều service | Mỗi service một repo/package, contract qua OpenAPI/event schema |
| Data platform | Tách ingestion, transform, orchestration; dbt/Spark ngoài Python thuần |

> ⚠️ Đừng tách microservice chỉ vì "nghe chuyên nghiệp". Tách khi có nhu cầu scale,
> ownership hoặc deploy độc lập thật. Xem [`python-production.md`](./python-production.md) §2.

---

## 10. Checklist môi trường

- [ ] `python3 --version` ≥ 3.12 (hoặc đúng version dự án ghim).
- [ ] `uv --version` chạy được; `uv sync` tạo `.venv` không lỗi.
- [ ] Interpreter trong IDE trỏ `.venv/bin/python`.
- [ ] `ruff check .` và `ruff format --check .` pass.
- [ ] `mypy src` (hoặc pyright) pass ở mức dự án đặt ra.
- [ ] `pytest -q` pass; coverage report đọc được.
- [ ] `pre-commit install` đã chạy.
- [ ] `.env.example` đầy đủ, `.env` nằm trong `.gitignore`.
- [ ] Docker build chạy được (nếu dự án có Docker).
- [ ] `git config user.name/email` đúng, SSH key tới remote hoạt động.

---

## 11. Lỗi setup thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `command not found: python` | macOS chỉ có `python3` | Dùng `python3` hoặc `uv run python` |
| `No module named ...` dù đã pip install | Cài vào interpreter khác | Kiểm tra `sys.executable`, activate `.venv`, dùng `uv run` |
| `externally-managed-environment` | PEP 668 chặn pip vào hệ thống | Tạo venv hoặc dùng `uv` |
| `ImportError: attempted relative import` | Chạy file trực tiếp thay vì module | `python -m package.module`, thêm `__init__.py` |
| `ModuleNotFoundError` khi chạy pytest | `src/` layout chưa cài package | `uv sync`, cấu hình `pythonpath = ["src"]` |
| `SyntaxError` với `match`/`type` | Python < 3.10/3.12 | Nâng version hoặc bỏ cú pháp mới |
| `SSL: CERTIFICATE_VERIFY_FAILED` (macOS) | Python thiếu cert | Chạy `Install Certificates.command` hoặc dùng uv |
| `psycopg2` build fail | Thiếu PostgreSQL headers | Dùng `psycopg[binary]` hoặc cài `libpq` |
| `Address already in use` | Port bận | `lsof -i :8000`, đổi port hoặc kill process |
| `ruff` báo hàng nghìn lỗi lần đầu | Chưa format legacy | Chạy `ruff format .` rồi `ruff check --fix .`, commit riêng |

---

## 12. Cách dùng bộ tài liệu

- **Người mới:** đọc `python-basics.md` theo thứ tự, làm bài tập, rồi mới sang advanced.
- **Đang đi làm:** đọc `python-production.md` như checklist; tra `python-cheatsheet.md`
  khi cần cú pháp; đọc interview theo level mục tiêu.
- **Phỏng vấn:** bắt đầu [`interview/README.md`](./interview/README.md), chọn level, ôn
  theo ma trận, luyện nói 60–90 giây/câu, mock interview cuối tuần.
- **Interviewer:** dùng câu hỏi + rubric, chấm theo bằng chứng hành vi, tránh hỏi đố mẹo.
- **Manager:** dùng file lead-manager cho vòng quản lý, scenarios cho vòng bar-raiser.

> 📌 Mọi đáp án là **một cách trả lời tốt**, không phải chân lý. Khi phỏng vấn hãy nêu
> bối cảnh, trade-off, cách đo và bài học thực tế.

---

## 13. Tài liệu tham khảo

- Python docs: https://docs.python.org/3/
- Python Developer's Guide: https://devguide.python.org/
- PEP index: https://peps.python.org/
- The Zen of Python (PEP 20): https://peps.python.org/pep-0020/
- typing spec: https://typing.readthedocs.io/
- FastAPI: https://fastapi.tiangolo.com/
- Django: https://docs.djangoproject.com/
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/
- pytest: https://docs.pytest.org/
- Ruff: https://docs.astral.sh/ruff/
- uv: https://docs.astral.sh/uv/
- OpenTelemetry Python: https://opentelemetry.io/docs/languages/python/
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

*Bắt đầu với [`python-basics.md`](./python-basics.md), hoặc vào thẳng
[`interview/README.md`](./interview/README.md) nếu đang chuẩn bị phỏng vấn.*
