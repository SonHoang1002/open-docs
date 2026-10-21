# Bảo Mật API — Kiến thức toàn diện từ cơ bản đến nâng cao

> Tài liệu tham khảo đầy đủ về bảo mật API: mô hình đe dọa, xác thực/ủy quyền,
> chống tấn công phổ biến, rate limiting, mã hóa, hardening hạ tầng, kiểm thử bảo mật
> và mã nguồn ví dụ thực hành (Node.js/Bun, TypeScript, Python).

---

## Mục lục

1. [Nguyên tắc cốt lõi](#1-nguyên-tắc-cốt-lõi)
2. [Mô hình đe dọa (Threat Model)](#2-mô-hình-đe-dọa-threat-model)
3. [Xác thực (Authentication)](#3-xác-th-authentication)
4. [Ủy quyền (Authorization) & RBAC/ABAC](#4-ủy-quyền-authorization--rbacabac)
5. [Các cuộc tấn công phổ biến vào API](#5-các-cuộc-tấn-công-phổ-biến-vào-api)
6. [Input Validation & Output Encoding](#6-input-validation--output-encoding)
7. [Rate Limiting, Throttling & Quota](#7-rate-limiting-throttling--quota)
8. [Mã hóa dữ liệu & quản lý bí mật](#8-mã-hóa-dữ-liệu--quản-lý-bí-mật)
9. [CORS, CSP & Hardening Headers](#9-cors-csp--hardening-headers)
10. [Bảo mật tầng hạ tầng & triển khai](#10-bảo-mật-tầng-hạ-tầng--triển-khai)
11. [API Gateway, Versioning & Lifecycle](#11-api-gateway-versioning--lifecycle)
12. [Logging, Giám sát & Phát hiện xâm nhập](#12-logging-giám-sát--phát-hiện-xâm-nhập)
13. [Bảo mật Third-party / OAuth 2.0 / OIDC](#13-bảo-mật-third-party--oauth-20--oidc)
14. [Checklist bảo mật API (OWASP API Top 10 2023)](#14-checklist-bảo-mật-api-owasp-api-top-10-2023)
15. [Kiểm thử bảo mật API](#15-kiểm-thử-bảo-mật-api)
16. [Ví dụ ứng dụng thực tế: Hardening API Wedding](#16-ví-dụ-ứng-dụng-thực-tế-hardening-api-wedding)
17. [Anti-patterns](#17-anti-patterns)
18. [Tài liệu tham khảo](#18-tài-liệu-tham-khảo)

---

## 1. Nguyên tắc cốt lõi

### 1.1 Defense in Depth (Phòng thủ nhiều lớp)

Không có "cái khóa vàng" duy nhất — mỗi lớp đều cần bảo vệ:

```
┌─ Lớp 6: WAF / DDoS protection (Cloudflare, AWS Shield)
├─ Lớp 5: TLS 1.3, HSTS, mTLS (chứng chỉ hai chiều)
├─ Lớp 4: API Gateway — auth, rate limit, validation
├─ Lớp 3: Application middleware — verify JWT, RBAC
├─ Lớp 2: Mã hóa dữ liệu (at rest: AES-256, in transit: TLS)
└─ Lớp 1: Database — RLS, least-privilege role, parameterized queries
```

### 1.2 Least Privilege (Quyền tối thiểu)

- User chỉ được quyền cần thiết.
- API key/DB role chỉ mang scope tối thiểu.
- Service-to-service dùng mTLS + scoped token, không chia sẻ chung 1 key.

### 1.3 Fail Secure (Thất bại an toàn)

- Không xác thực được → **từ chối**, không phải "cho qua mặc định".
- Lỗi exception → trả `500` chung chung, không lộ stack trace.

### 1.4 Không bao giờ tin tưởng input

Mọi thứ đến từ client đều là **giả định cần kiểm chứng**: header, body, query, cookie,
file upload, even TLS client cert (có thể bị giả nếu CA không verify kỹ).

### 1.5 Principle of Separation of Concerns

- **Authentication** = bạn là ai.
- **Authorization** = bạn được làm gì.
- **Validation** = dữ liệu có hợp lệ không.
- **Auditing** = bạn đã làm gì (log).

---

## 2. Mô hình đe dọa (Threat Model)

Phương pháp **STRIDE** áp dụng cho API:

| Ký hiệu | Mối đe dọa | Ví dụ trên API | Biện pháp |
|---|---|---|---|
| **S**poofing | Giả mạo danh tính | Giả JWT, chiếm cookie | Xác thực mạnh, mTLS |
| **T**ampering | Thay đổi dữ liệu | Sửa `user_id` trong body (IDOR) | Server-side check quyền |
| **R**epudiation | Chối bỏ hành động | Không log ai đã xoá gì | Audit log bất biến |
| **I**nformation Disclosure | Lộ thông tin | Lỗi trả stack trace, user enumeration | Message lỗi chung chung |
| **D**enial of Service | Từ chối dịch vụ | Flood request, regex DoS | Rate limit, timeout |
| **E**levation of Privilege | Thăng quyền | Đọc hoá đơn người khác | RBAC/ABAC chặt |

### Câu hỏi threat modeling cho từng endpoint

```text
1. Endpoint này nhận dữ liệu từ ai? (public / user / admin / service)
2. Nếu attacker thay toàn bộ body thì sao?
3. Nếu attacker đổi user_id trong URL thì sao?
4. Nếu attacker replay lại request 1000 lần thì sao?
5. Dữ liệu trả về có chứa dữ liệu người dùng khác không?
6. Nếu dependency bị compromised thì sao?
```

---

## 3. Xác thực (Authentication)

### 3.1 So sánh các phương pháp

| Phương pháp | An toàn | Phức tạp | Phù hợp |
|---|---|---|---|
| API Key (header) | Thấp (static secret) | Rất thấp | Machine-to-machine, backend jobs |
| Session Cookie + TLS | Trung bình–cao | Trung bình | Web app có đăng nhập |
| JWT (Bearer) | Cao (nếu cấu hình đúng) | Trung bình | SPA, mobile, microservice |
| OAuth 2.0 / OIDC | Cao | Cao | Login bằng Google, third-party |
| mTLS (chứng chỉ 2 chiều) | Rất cao | Cao | Service-to-service, ngân hàng |
| HMAC-signed request | Cao | Trung bình | Webhook (Stripe, GitHub) |

### 3.2 API Key — khi nào dùng

```ts
// Server: kiểm tra API key tĩnh của hệ thống nội bộ
const VALID_KEYS = new Set(process.env.INTERNAL_API_KEYS!.split(","));

function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  if (!key || !VALID_KEYS.has(key)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
```

⚠️ API key là **bí mật tĩnh** — không được nhúng vào frontend/HTML/repo. Quay vòng
(rotation) định kỳ, lưu kho bí mật (Vault, AWS Secrets Manager).

### 3.3 Session Cookie an toàn

```ts
import session from "express-session";
import RedisStore from "connect-redis";

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,           // ≥ 32 byte ngẫu nhiên
  name: "__Host-sid",                             // prefix an toàn
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,                                 // chỉ gửi qua HTTPS
    httpOnly: true,                               // JS không đọc được → chống XSS steal
    sameSite: "lax",                              // chống CSRF cơ bản
    maxAge: 7 * 24 * 60 * 60 * 1000,             // 7 ngày
  },
}));
```

**Bắt buộc:** triển khai **Session Fixation Protection** — regenerate session id sau
khi đăng nhập thành công:

```ts
app.post("/login", async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).json({ error: "Sai thông tin" });

  req.session.regenerate((err) => {          // ← session id MỚI
    if (err) throw err;
    req.session.userId = user.id;
    res.json({ ok: true });
  });
});
```

### 3.4 JWT (JSON Web Token)

**Cấu trúc:** `header.payload.signature` (base64url)

```text
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9      ← header: {"alg":"RS256","typ":"JWT"}
.eyJzdWIiOiIxMjMiLCJyb2xlIjoiZ3Vlc3QiLCJleHAiOjE3MzAwMDAwMDB9   ← payload
.Xc0k3...                                    ← chữ ký RS256
```

**Claims phổ biến:**

| Claim | Ý nghĩa |
|---|---|
| `sub` | Subject — id người dùng |
| `iss` | Issuer (ai phát hành) |
| `aud` | Audience (dịch vụ nào được nhận) |
| `exp` | Expiration (timestamp) |
| `iat` | Issued at |
| `jti` | JWT ID (dùng để thu hồi/one-time-use) |
| `scope` / `role` | Quyền hạn |

#### ⚠️ Lỗi NGUY HIỂM nhất với JWT: algorithm "none" & RS256→HS256

```ts
// ❌ SAI — tin tưởng alg từ token
const decoded = jwt.verify(token, (header) => header.alg);   // attacker chọn alg!

// ✅ ĐÚNG — chỉ định rõ thuật toán, KHÔNG lấy từ header
const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
  algorithms: ["RS256"],     // whitelist thuật toán
  issuer: "wedding-api",
  audience: "wedding-app",
  maxExpiration: true,
});
```

**Tấn công RS256 → HS256**: attacker đổi header `alg: HS256`, rồi ký lại bằng
**public key** (public key là bí mật công khai!) → server verify thành công nếu nó
linh động chọn thuật toán. **Chặn bằng `algorithms` whitelist.**

#### Tạo & verify JWT (Node.js, RS256)

```ts
import jwt from "jsonwebtoken";
import fs from "node:fs";

const privateKey = fs.readFileSync("./keys/private.pem", "utf8");
const publicKey = fs.readFileSync("./keys/public.pem", "utf8");

// Cấp token (60 phút, có jti để có thể thu hồi)
export function issueToken(userId: string, role: string) {
  return jwt.sign(
    { sub: userId, role, jti: crypto.randomUUID() },
    privateKey,
    { algorithm: "RS256", expiresIn: "60m", issuer: "wedding-api", audience: "wedding-app" },
  );
}

// Middleware verify
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(header.slice(7), publicKey, {
      algorithms: ["RS256"],
      issuer: "wedding-api",
      audience: "wedding-app",
    }) as { sub: string; role: string };
    req.user = payload;
    next();
  } catch (err) {
    const expired = (err as any)?.name === "TokenExpiredError";
    return res.status(401).json({ error: expired ? "Token hết hạn" : "Token không hợp lệ" });
  }
}
```

#### Refresh Token (luân chuyển — rotation)

```text
Access token  : ngắn (15 phút), mang quyền, KHÔNG lưu DB.
Refresh token : dài (7 ngày), lưu DB/bị hash, dùng 1 lần (rotation).
                Khi reuse → thu hồi cả family (phát hiện bị đánh cắp).
```

```ts
// Đổi token mới
app.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  const record = await db.refreshTokens.findOne({ tokenHash: sha256(refreshToken) });

  if (!record || record.usedAt) {
    // Reuse → nghi bị đánh cắp → thu hồi cả family
    await db.refreshTokens.deleteMany({ familyId: record?.familyId });
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  await db.refreshTokens.update(record.id, { usedAt: new Date() });
  const newRefresh = await createRefreshToken(record.userId, record.familyId);

  res.json({
    accessToken: issueToken(record.userId, record.role),
    refreshToken: newRefresh,
  });
});
```

#### Blacklist / revocation (thu hồi JWT)

```ts
// Trước khi verify, kiểm tra jti có bị thu hồi không
async function isRevoked(jti: string): Promise<boolean> {
  return redis.get(`jwt:revoked:${jti}`) !== null;
}

// Ví dụ khi user đổi mật khẩu:
await redis.set(`jwt:revoked:${oldJti}`, "1", { EX: 60 * 60 * 24 * 7 });
```

> **Trade-off:** JWT không lưu trạng thái (stateless) → thu hồi khó. Nếu cần thu hồi
> ngay lập tức, dùng **short-lived access token + server-side session/Redis denylist**.

#### So sánh JWT vs Session

| Tiêu chí | JWT | Session (server-side) |
|---|---|---|
| Lưu trạng thái | Không (stateless) | Có (Redis/DB) |
| Thu hồi ngay | Khó (cần denylist) | Dễ (xóa key) |
| Phân tán đa service | Dễ (ai có public key đều verify) | Cần share session store |
| Kích thước | Lớn hơn cookie | Session id nhỏ |
| Phù hợp | Microservice, mobile, SPA | Web app truyền thống |

### 3.5 So sánh các hashing mật khẩu

```ts
import argon2 from "argon2";       // ✅ khuyến nghị OWASP 2024+

// Argon2id (mặc định, resistant GPU/ASIC)
const hash = await argon2.hash("MậtKhẩuMạnh!", { type: argon2.argon2id });
const ok = await argon2.verify(hash, "MậtKhẩuMạnh!");

// bcrypt (tốt, vẫn chấp nhận được)
import bcrypt from "bcrypt";
const h2 = await bcrypt.hash(pw, 12);       // cost ≥ 12
await bcrypt.compare(h2, pw);
```

```text
❌ MD5 / SHA1 / SHA256 thuần  — quá nhanh, dễ bẻ bằng GPU
❌ "Mã hoá" mật khẩu (AES/DES) — reversible, không dùng
⚠️ bcrypt                  — tốt, giới hạn 72 byte
✅ scrypt / Argon2id        — khuyến nghị hiện đại
```

**Nguyên tắc lưu trữ:**
- **Hash** mật khẩu (không bao giờ lưu plain).
- **Encrypt** dữ liệu cần đọc lại (PII, thẻ — dùng AES-256-GCM).
- **Pepper** nằm trong kho bí mật (khác với salt lưu cạnh hash).

### 3.6 MFA / OTP

- **TOTP** (Google Authenticator, RFC 6238): 6 số, 30s, secret ký hiệu TOTP.
- **WebAuthn/FIDO2** (passkey): chống phishing, mạnh nhất.
- Áp dụng cho admin/endpoint nhạy cảm.

```ts
import speakeasy from "speakeasy";

const verified = speakeasy.totp.verify({
  secret: user.totpSecret,
  encoding: "base32",
  token: req.body.code,
  window: 1,              // ±30s
});
if (!verified) return res.status(401).json({ error: "Mã OTP sai" });
```

---

## 4. Ủy quyền (Authorization) & RBAC/ABAC

> **Quy tắc số 1: Authorization PHẢI kiểm tra ở server, cho MỖI request.**
> Ẩn nút bấm ở frontend KHÔNG phải là kiểm soát quyền.

### 4.1 OWASP Top 10 API #1: Broken Object Level Authorization (BOLA/IDOR)

```ts
// ❌ NGUY HIỂM — tin tưởng id từ client, không check chủ sở hữu
app.get("/orders/:id", auth, async (req, res) => {
  const order = await db.orders.find(req.params.id);
  res.json(order);    // attacker đổi /orders/123 → /orders/124 thấy đơn người khác
});

// ✅ ĐÚNG — luôn so sánh chủ sở hữu
app.get("/orders/:id", auth, async (req, res) => {
  const order = await db.orders.find(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });

  if (order.userId !== req.user.id && req.user.role !== "admin") {
    // Trả 404 thay vì 403 để không tiết lộ sự tồn tại của resource
    return res.status(404).json({ error: "Not found" });
  }
  res.json(order);
});
```

**Đối với Supabase (dự án wedding) — Row Level Security:**

```sql
-- Bật RLS: kể cả service key cũng phải tuân theo policy nếu dùng user JWT
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Ai cũng đọc được (wedding public guestbook)
CREATE POLICY "public_read" ON messages FOR SELECT USING (true);

-- Chỉ insert được với tên của chính mình (client truyền user id đã xác thực)
CREATE POLICY "insert_own" ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id);

-- Không ai update/delete qua API public (chỉ service role ở server)
CREATE POLICY "no_update" ON messages FOR UPDATE USING (false);
CREATE POLICY "no_delete" ON messages FOR DELETE USING (false);
```

### 4.2 RBAC (Role-Based Access Control)

```ts
type Role = "guest" | "member" | "editor" | "admin";

const PERMISSIONS: Record<Role, string[]> = {
  guest:  ["rsvp:create"],
  member: ["rsvp:create", "message:read", "message:create"],
  editor: ["rsvp:*", "message:*"],
  admin:  ["*"],
};

export function can(role: Role, permission: string): boolean {
  return PERMISSIONS[role].some((p) => p === "*" || p === permission || (p.endsWith(":*") && permission.startsWith(p.slice(0, -1))));
}

// Middleware
export function requirePermission(perm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!can(req.user.role, perm)) {
      return res.status(403).json({ error: "Forbidden" });      // 403 = hiểu request nhưng từ chối
    }
    next();
  };
}

// Dùng:
app.delete("/messages/:id", auth, requirePermission("message:delete"), handler);
```

### 4.3 ABAC (Attribute-Based) / Policy engine

```ts
// Quyết định dựa trên thuộc tính: resource + chủ thể + môi trường
function canDeleteMessage(user: User, msg: Message, env: { now: Date }): boolean {
  if (user.role === "admin") return true;
  if (msg.senderId !== user.id) return false;
  const ageMs = env.now.getTime() - new Date(msg.createdAt).getTime();
  return ageMs < 15 * 60 * 1000;      // chỉ sửa trong 15 phút
}
```

### 4.4 Phân biệt 401 vs 403 vs 404

| Status | Ý nghĩa | Khi nào dùng |
|---|---|---|
| `401 Unauthorized` | Chưa xác thực / token sai-hết hạn | Không có credential hợp lệ |
| `403 Forbidden` | Đã xác thực nhưng không có quyền | Auth OK, permission fail |
| `404 Not Found` | Không tồn tại (hoặc không được phép biết) | Ẩn resource của người khác |
| `429 Too Many Requests` | Vượt rate limit | Rate limit |

---

## 5. Các cuộc tấn công phổ biến vào API

### 5.1 OWASP API Security Top 10 (2023) — tóm tắt

| # | Lỗ hổng | Mô tả | Ngăn ngừa |
|---|---|---|---|
| API1 | **BOLA** | Truy cập object của người khác qua ID | Server-side ownership check |
| API2 | **Broken Authentication** | Đánh cắp/đoán token, brute force | JWT an toàn, MFA, rate limit login |
| API3 | **Broken Object Property Level Authorization** | Đọc/ghi field thừa (mass assignment) | Allowlist field |
| API4 | **Unrestricted Resource Consumption** | Flood, payload khổng lồ | Rate limit, maxPayload, timeout |
| API5 | **Broken Function Level Authorization** | User thường gọi endpoint admin | RBAC per route + per method |
| API6 | **Unrestricted Access to Sensitive Business Flows** | Bot mua vé, spam RSVP | Bot detection, CAPTCHA |
| API7 | **SSRF** | Ép server gọi URL nội bộ | Allowlist outbound URL, block private IP |
| API8 | **Security Misconfiguration** | CORS `*`, debug trên production, default creds | Harden config, scan |
| API9 | **Improper Inventory Management** | API cũ `/v1` chưa xoá còn lỗ hổng | Versioning, sunset policy |
| API10 | **Unsafe Consumption of APIs** | Tin tưởng data từ API bên thứ ba | Validate response của partner |

### 5.2 Broken Object Property Level Authorization (Mass Assignment)

```ts
// ❌ SAI — gán toàn bộ body vào record (attacker thêm "role":"admin" vào body!)
app.put("/profile/:id", auth, async (req, res) => {
  await db.users.update(req.params.id, req.body);      // MASS ASSIGNMENT
});

// ✅ ĐÚNG — allowlist các field được phép thay đổi
const ALLOWED = ["displayName", "avatarUrl", "bio"] as const;

app.put("/profile/:id", auth, async (req, res) => {
  if (req.params.id !== req.user.id) return res.status(404).end();
  const patch = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => (ALLOWED as readonly string[]).includes(k)),
  );
  res.json(await db.users.update(req.user.id, patch));
});
```

### 5.3 Injection

#### SQL/NoSQL Injection

```ts
// ❌ String concatenation
db.query(`SELECT * FROM users WHERE id = '${req.params.id}'`);
//  attacker: /users/1' OR '1'='1

// ✅ Parameterized query
db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);

// ✅ ORM / query builder (Supabase)
supabase.from("users").select("*").eq("id", req.params.id);

// NoSQL injection (Mongo) — object injection
// ❌ { "username": { "$gt": "" } }  → login không cần mật khẩu
// ✅ Validate kiểu: typeof username === "string"
```

#### Command Injection

```ts
// ❌
exec(`ping ${req.query.host}`);
// attacker: ?host=127.0.0.1; rm -rf /

// ✅ Không dùng shell; nếu buộc phải dùng:
import { execFile } from "node:child_process";
execFile("/usr/bin/ping", ["-c", "1", validatedHost], callback);
```

#### Path Traversal

```ts
// ❌
res.sendFile(`/uploads/${req.query.file}`);
// attacker: ?file=../../etc/passwd

// ✅
const safe = path.normalize(req.query.file).replace(/^(\.\.[\/\\])+/, "");
const full = path.join(UPLOAD_DIR, safe);
if (!full.startsWith(UPLOAD_DIR)) return res.status(400).end();   // block thoát ngoài
```

#### Template Injection / XSS / SSRF — xem mục 5.4, 5.7.

### 5.4 XSS (Cross-Site Scripting) qua API

```ts
// API trả JSON — vẫn có nguy cơ nếu client chèn thẳng vào DOM
// ✅ Khi render: dùng textContent / framework escape mặc định
el.textContent = message.content;              // an toàn
el.innerHTML = message.content;                // ❌ XSS

// Nếu API cho phép HTML (rich text) → sanitize
import sanitizeHtml from "sanitize-html";
const clean = sanitizeHtml(userHtml, {
  allowedTags: ["b", "i", "em", "strong", "p", "br"],
  allowedAttributes: {},
});
```

**Content-Security-Policy** (củng cố): xem mục 9.

### 5.5 CSRF (Cross-Site Request Forgery)

```text
Đối tượng bị ảnh hưởng: cookie-based auth (không phải Bearer token).
```

**Ngăn ngừa — kết hợp nhiều lớp:**

```ts
// 1) SameSite cookie (lớp chính)
cookie: { sameSite: "lax", secure: true, httpOnly: true }

// 2) CSRF token cho formPOST (double submit)
import csurf from "csurf";
app.use(csurf({ cookie: { httpOnly: true, secure: true, sameSite: "lax" } }));
app.post("/rsvp", csrfProtection, handler);

// 3) Kiểm tra Origin/Referer cho endpoint quan trọng
app.post("/transfer", auth, (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: "Bad origin" });
  next();
});

// 4) Bearer token trong header (không bị CSRF vì attacker không set được header từ trang khác)
```

### 5.6 CORS sai cấu hình (API8 — Misconfiguration)

```ts
// ❌ RẤT SAI — kết hợp credentials + wildcard
app.use(cors({ origin: "*", credentials: true }));

// ❌ SAI — reflection: echo origin từ request
app.use(cors({ origin: (o, cb) => cb(null, o) }));

// ✅ ĐÚNG — allowlist nghiêm ngặt
const ALLOWED = new Set([
  "https://wedding.example.com",
  "https://admin.wedding.example.com",
]);

app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED.has(origin)) return cb(null, true);   // no-origin = curl/internal
    cb(new Error("CORS bị chặn"));
  },
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
}));
```

**Cách CORS hoạt động (tóm tắt):**

```text
Pre-flight:  OPTIONS /api  →  server trả Access-Control-Allow-Origin / Methods
Actual:      POST /api     →  server kèm header ACAO

Server KHÔNG cho phép cross-origin — trình duyệt tự chặn.
CORS không phải "bảo mật server" — nó chỉ là quy tắc trình duyệt.
API vẫn phải tự xác thực/ủy quyền vì attacker có thể gọi thẳng bằng curl.
```

### 5.7 SSRF (Server-Side Request Forgery — API7)

```ts
// ❌ API cho phép user chỉ định URL server sẽ fetch
app.post("/fetch", async (req, res) => {
  const data = await fetch(req.body.url);     // attacker: http://169.254.169.254/latest/meta-data/
  res.send(data);                              // ← ĐỌC AWS CREDENTIALS!
});

// ✅ Allowlist域名 + block IP nội bộ
import { isIP } from "node:net";
import dns from "node:dns/promises";

const ALLOWED_HOSTS = new Set(["cdn.example.com", "api.partner.com"]);

async function safeFetch(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("Chỉ HTTPS");
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error("Host không được phép");

  const addrs = await dns.lookup(url.hostname, { all: true });
  for (const { address } of addrs) {
    if (isPrivateIp(address)) throw new Error("IP nội bộ bị chặn");
  }
  return fetch(url, { redirect: "manual" });   // không theo redirect về internal
}
```

**Block dải IP riêng (RFC1918 + link-local + cloud metadata):**

```ts
function isPrivateIp(ip: string): boolean {
  if (ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("0.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) return true;
  if (ip === "169.254.169.254") return true;   // AWS/GCP metadata
  return false;
}
```

### 5.8 Reuse / Replay Attack

```ts
// Webhook phải có timestamp + nonce + chữ ký
app.post("/webhooks/stripe", (req, res) => {
  const sig = req.headers["stripe-signature"];
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  // Stripe tự kiểm tra timestamp ±3 phút → replay bị chặn
  res.json({ received: true });
});
```

**Pattern HMAC có timestamp + nonce:**

```ts
import crypto from "node:crypto";

function sign(secret: string, ts: string, nonce: string, body: string) {
  return crypto.createHmac("sha256", secret).update(`${ts}.${nonce}.${body}`).digest("hex");
}

// Server verify
function verify(req: Request, secret: string): boolean {
  const ts = req.header("x-ts")!;
  const nonce = req.header("x-nonce")!;
  const sig = req.header("x-signature")!;

  if (Math.abs(Date.now() - Number(ts)) > 5 * 60 * 1000) return false;   // 5 phút
  if (redis.get(`nonce:${nonce}`)) return false;                          // đã dùng rồi
  redis.set(`nonce:${nonce}`, "1", { EX: 600 });

  const expected = sign(secret, ts, nonce, req.rawBody.toString());
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)); // so sánh constant-time
}
```

### 5.9 Regex DoS (ReDoS) & Payload DoS

```ts
// ❌ Regex lồng bẫy hồi quy — attacker gửi chuỗi dài → CPU 100%
const re = /^(a+)+$/;
re.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!");

// ✅ Giới hạn độ dài input TRƯỚC khi regex + dùng lib an toàn
if (input.length > 256) return res.status(400).end();
```

### 5.10 Business Logic Abuse (API6)

Ví dụ: RSVP nhận quà — attacker gửi 10.000 lần.

```ts
// ✅ Quy tắc nghiệp vụ phải do SERVER quyết định
const existing = await db.rsvps.count({ guestId: user.id, eventId });
if (existing >= 1) return res.status(409).json({ error: "Bạn đã phản hồi rồi" });
```

---

## 6. Input Validation & Output Encoding

### 6.1 Nguyên tắc

1. **Validate tại điểm tin cậy duy nhất (cho mỗi boundary)** — ngay khi request vào.
2. **Allowlist (cho phép những gì cần)**, không phải blocklist.
3. **Fail với 400 + message rõ ràng**, không xử lý tiếp dữ liệu sai.
4. **Không có schema = không nhận request** (reject nếu thiếu/không đúng kiểu).

### 6.2 Zod (TypeScript) — ví dụ đầy đủ

```ts
import { z } from "zod";

const CreateRsvp = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(200).optional(),
  will_attend: z.boolean(),
  guest_of: z.enum(["Chú rể", "Cô dâu", "Cả hai"]).default("Cả hai"),
  number_attend: z.number().int().min(0).max(10),
  message: z.string().trim().max(500).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({ path: i.path.join("."), msg: i.message }));
    return { ok: false as const, issues };
  }
  return { ok: true as const, data: result.data };
}

// Middleware
export function body(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = validate(schema, req.body);
    if (!r.ok) return res.status(400).json({ error: "Dữ liệu không hợp lệ", issues: r.issues });
    req.body = r.data;          // ← body đã được coerce/clean
    next();
  };
}

// Dùng:
app.post("/rsvp", auth, body(CreateRsvp), async (req, res) => { /* req.body đã hợp lệ */ });
```

### 6.3 Validate cả query & params

```ts
const ListQuery = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["created_at", "name"]).default("created_at"),
});

app.get("/messages", validateQuery(ListQuery), handler);
```

### 6.4 Giới hạn & kiểm tra file upload (nếu có)

```ts
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;   // 5MB

// ✅ Kiểm tra cả extension, MIME (từ header), magic bytes (nội dung file)
// ✅ Đổi tên file ngẫu nhiên, không dùng tên gốc
// ✅ Lưu ngoài webroot hoặc trên object storage có signed URL
// ✅ Strip metadata (EXIF) — có thể chứa GPS
```

---

## 7. Rate Limiting, Throttling & Quota

### 7.1 Các chiến lược

| Chiến lược | Mô tả | Phù hợp |
|---|---|---|
| Fixed Window | đếm theo phút/giờ cố định | Đơn giản, có burst ở ranh giới |
| Sliding Window Log | lưu timestamp từng request → chính xác | Chính xác, tốn bộ nhớ |
| Sliding Window Counter | kết hợp 2 cách trên | Cân bằng ✅ |
| Token Bucket | nén burst cho phép | API cần burst linh hoạt ✅ |
| Leaky Bucket | output đều, làm mịn | Streaming |
| Chi phí cạnh tranh | mỗi endpoint 1 chi phí | Quyết định phức tạp đắt hơn |

### 7.2 Token bucket với Redis (dùng được nhiều instance)

```ts
import { createClient } from "redis";
const redis = createClient();
await redis.connect();

const LUA = `
local key      = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill   = tonumber(ARGV[2])   -- token/giây
local now      = tonumber(ARGV[3])
local cost     = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "tokens", "ts")
local tokens = tonumber(data[1]) or capacity
local ts     = tonumber(data[2]) or now

tokens = math.min(capacity, tokens + (now - ts) * refill)

if tokens < cost then
  redis.call("HMSET", key, "tokens", tokens, "ts", now)
  redis.call("PEXPIRE", key, 60000)
  return {0, tokens}
end

tokens = tokens - cost
redis.call("HMSET", key, "tokens", tokens, "ts", now)
redis.call("PEXPIRE", key, 60000)
return {1, tokens}
`;

export async function rateLimit(
  id: string,               // userId hoặc IP
  cost = 1,
  capacity = 60,
  refillPerSec = 1,
): Promise<{ allowed: boolean; remaining: number }> {
  const [res] = await redis.eval(LUA, {
    keys: [`rl:${id}`],
    arguments: [String(capacity), String(refillPerSec), String(Date.now() / 1000), String(cost)],
  }) as [number[]];
  return { allowed: res[0] === 1, remaining: Math.floor(res[1]) };
}

// Express middleware
export function limiter(opts: { capacity: number; refill: number }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id ?? req.ip!;
    const { allowed, remaining } = await rateLimit(id, 1, opts.capacity, opts.refill);

    res.setHeader("RateLimit-Limit", opts.capacity);
    res.setHeader("RateLimit-Remaining", remaining);

    if (!allowed) return res.status(429).setHeader("Retry-After", "1").json({ error: "Too many requests" });
    next();
  };
}

// Dùng phân tầng:
app.use("/api/auth/login", limiter({ capacity: 5, refill: 1 / 60 }));   // 5 lần/phút
app.use("/api",            limiter({ capacity: 120, refill: 2 }));        // 120 token, 2/s
```

**Tiêu chuẩn response:**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 120
RateLimit-Remaining: 0
RateLimit-Reset: 1730000030
```

### 7.3 Bảo vệ login khỏi brute force

```ts
// Đúng: giới hạn + tăng dần độ trễ + cảnh báo
let failures = await redis.incr(`login:fail:${email}`);
if (failures === 1) await redis.expire(`login:fail:${email}`, 900);

if (failures > 5) {
  const backoff = Math.min(60, 2 ** (failures - 5));      // 2s, 4s, 8s... 60s
  await sleep(backoff * 1000);
  if (failures > 20) return res.status(429).json({ error: "Tài khoản tạm khóa" });
}

// Thông báo chung chung — KHÔNG phân biệt "sai mật khẩu" vs "không tồn tại tài khoản"
return res.status(401).json({ error: "Thông tin đăng nhập không đúng" });
```

> **Cẩn thận chống User Enumeration** — mọi lỗi đăng nhập dùng chung 1 message.

---

## 8. Mã hóa dữ liệu & quản lý bí mật

### 8.1 3 trạng thái dữ liệu

```
In transit  : TLS 1.2+/1.3 (HTTPS, wss://)              ← bắt buộc
At rest     : AES-256-GCM / TDE của DB provider           ← PII, secret
In use      : Càng ít càng tốt (không log plaintext, che mask khi hiển thị)
```

### 8.2 Mã hóa có kiểm chứng (AES-256-GCM)

```ts
import crypto from "node:crypto";

function encrypt(plain: string, key: Buffer) {
  const iv = crypto.randomBytes(12);                       // 12 byte cho GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();                          // chống tamper
  return { iv, enc, tag };
}

function decrypt({ iv, enc, tag }: any, key: Buffer) {
  const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");   // tag sai → ném lỗi
}
```

> GCM có **authenticated encryption** — dữ liệu bị sửa sẽ bị phát hiện.
> **Không dùng ECB mode** (mẫu lặp lộ pattern), không tự viết IV (dùng random 12 byte).

### 8.3 Hash có chủ đích (chọn đúng thuật toán)

| Mục đích | Dùng | Không dùng |
|---|---|---|
| Lưu mật khẩu | Argon2id, bcrypt, scrypt | MD5, SHA-256 thuần |
| So sánh token/API key | SHA-256 + `timingSafeEqual` | `===` (timing attack) |
| Chữ ký số | Ed25519, RSA-PSS |自己 viết |
| Mã hóa dữ liệu đọc lại | AES-256-GCM | Hash (không reversible) |
| Mã chống trùng lặp (nonce) | Random 128-bit | Hash của id (dễ đoán) |

```ts
// ✅ So sánh constant-time
import crypto from "node:crypto";
function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
```

### 8.4 Quản lý bí mật

```text
❌ Đừng: commit .env vào git
❌ Đừng: hardcode key trong source
❌ Đừng: gửi key qua Slack/log/console.log
✅ Nên: .env nằm trong .gitignore, chỉ có trên CI/CD & kho bí mật
✅ Nên: dùng Secret Manager (AWS SM, GCP SM, HashiCorp Vault, Doppler)
✅ Nên: quay vòng key định kỳ (90 ngày) + có key dự phòng
✅ Nên: tách biệt secret theo môi trường (dev/staging/prod)
✅ Nên: pre-commit hook chặn key bị lộ (gitleaks, truffleHog)
```

```bash
# Quét key lỡ commit
npx gitleaks detect --source . -v
```

```dotenv
# .gitignore
.env
.env.*
!.env.example
```

**Kiểm tra runtime — fail-fast nếu thiếu secret:**

```ts
const required = ["SUPABASE_URL", "SUPABASE_KEY", "JWT_PUBLIC_KEY"] as const;
for (const k of required) {
  if (!process.env[k]) {
    console.error(`❌ Thiếu biến môi trường: ${k}`);
    process.exit(1);            // ← fail secure, không chạy với config thiếu
  }
}
```

### 8.5 TLS & HSTS

```
# Nếu tự cấu hình reverse proxy (nginx)
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_tickets off;
HSTS: max-age=63072000; includeSubDomains; preload
```

---

## 9. CORS, CSP & Hardening Headers

### 9.1 Headers bảo mật nên có

```ts
import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],     // tránh 'unsafe-inline' nếu có thể
      imgSrc: ["'self'", "data:", "https://cdn.example.com"],
      connectSrc: ["'self'", "wss://wedding.example.com"],   // giới hạn WS được phép
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],                 // chống clickjacking
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");      // cho endpoint chứa dữ liệu cá nhân
  next();
});
```

### 9.2 API không trả HTML — thêm lớp bảo vệ

```ts
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
  }
  next();
});
```

### 9.3 Ẩn thông tin server

```ts
app.disable("x-powered-by");                     // Express
// nginx: server_tokens off;
```

---

## 10. Bảo mật tầng hạ tầng & triển khai

### 10.1 Hardening checklist

| Hạng mục | Biện pháp |
|---|---|
| TLS | TLS 1.3, HSTS, auto-renew (Let's Encrypt/certbot) |
| Reverse proxy | Nginx/Caddy phía trước app; rate limit ở tầng này |
| WAF | Cloudflare / AWS WAF chặn SQLi, XSS, bot |
| Container | Chạy bằng non-root user, image scan (trivy) |
| OS patch | Auto-update, minimal image (distroless/alpine) |
| Network | Private subnet cho DB; chỉ mở 443/80 |
| CORS | Allowlist |
| Secrets | Vault/SM, không trong image |
| Dependency | `npm audit`, Dependabot/Renovate, khóa version |
| Backup | DB backup + **kiểm tra restore được** |
| HTTPS everywhere | Redirect 301 từ HTTP → HTTPS |

### 10.2 Dependency security

```bash
npm audit --production
npm audit fix
# hoặc
bun audit

# Pinned version + lockfile phải commit
# CI chạy trivy fs ./ và fail nếu có CVE HIGH/CRITICAL
```

```yaml
# Ví dụ GitHub Actions
- uses: aquasecurity/trivy-action@master
  with:
    scan-type: fs
    severity: CRITICAL,HIGH
    exit-code: 1
```

### 10.3 Environment separation

```text
dev      → dữ liệu giả, log chi tiết, CORS rộng (nhưng vẫn có auth)
staging  → giống production nhất có thể (kể cả TLS, WAF)
prod     → секрет nghiêm ngặt, log aggregated, backup, giám sát
```

**Không bao giờ dùng chung DB/secret giữa các môi trường.**

---

## 11. API Gateway, Versioning & Lifecycle

### 11.1 Vai trò của API Gateway

```
Client → [WAF] → [API Gateway] → [Service A]
                    │  - TLS termination
                    │  - Auth (JWT verify)
                    │  - Rate limit (global + per client)
                    │  - Request validation (OpenAPI schema)
                    │  - Logging / Metrics
                    │  - Response caching
                    │  - Header sanitization
```

### 11.2 Versioning

```text
✅ URL path versioning : /api/v1/rsvp        → phổ biến, dễ kiểm soát
✅ Header versioning   : Accept: application/vnd.app.v2+json
❌ Query ?version=2     → dễ quên, cache phức tạp
```

**Sunset policy cho version cũ:**

```http
Deprecation: Sat, 01 Jan 2027 00:00:00 GMT
Sunset: Sat, 01 Jul 2027 00:00:00 GMT
Link: <https://docs.example.com/migrate-v2>; rel="successor-version"
```

### 11.3 Inventory (API9)

- Registry tất cả endpoint (OpenAPI spec làm nguồn sự thật).
- Quét endpoint thừa / không có auth (công cụ: schemathesis, 42crunch).
- Xoá endpoint không dùng sau khi deprecate đủ lâu.

---

## 12. Logging, Giám sát & Phát hiện xâm nhập

### 12.1 Nên log gì

```ts
logger.info({
  event: "api.request",
  method: req.method,
  path: req.path.replace(/\/\d+/g, "/:id"),     // chuẩn hoá id để group
  status: res.statusCode,
  durationMs: Math.round(performance.now() - t0),
  userId: req.user?.id ?? null,
  requestId,                                      // correlation id
  ip: req.ip,
});

// ⚠️ KHÔNG bao giờ log: mật khẩu, token, cookie, PAN thẻ, OTP, toàn bộ body PII
```

### 12.2 Các tín hiệu đáng ngờ cần cảnh báo

| Tín hiệu | Khả năng |
|---|---|
| 5xx spike | Lỗi hệ thống / exploit gây crash |
| 401/403 bất thường từ 1 IP | Brute force, dò endpoint |
| 429 cao bất thường | Đang bị tấn công / client lỗi |
| 404 dọc theo pattern `/admin`, `/.env`, `/wp-admin` | Scanner quét lỗ hổng |
| 1 user truy cập nhiều ID liên tiếp | Đang thử IDOR |
| Thời gian response chậm bất thường | ReDoS, query chậm, DoS |
| Endpoint nhạy cảm truy cập bất thường | Thăng quyền trái phép |

### 12.3 Cách ẩn PII trong log

```ts
function mask(value: string): string {
  if (value.length <= 4) return "***";
  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

logger.info({ email: mask(user.email) });   // ****@...… → "****7890"
```

---

## 13. Bảo mật Third-party / OAuth 2.0 / OIDC

### 13.1 OAuth 2.0 — luồng Authorization Code + PKCE (cho SPA/mobile)

```text
1. SPA tạo code_verifier (ngẫu nhiên) → code_challenge = BASE64URL(SHA256(verifier))
2. Redirect user sang provider:
   /authorize?client_id=APP&redirect_uri=...&code_challenge=...&method=S256&scope=openid
3. Provider xác thực → redirect về ?code=XYZ
4. SPA đổi code → token:
   POST /token  { code, code_verifier, client_id, redirect_uri }
   Provider kiểm tra SHA256(verifier) == challenge → cấp token
```

**PKCE ngăn** attacker đánh cắp `code` (trong native app, `custom scheme` có thể bị
app khác đăng ký bắt) rồi tự đổi lấy token.

```ts
// Tạo PKCE
import crypto from "node:crypto";
const verifier  = crypto.randomBytes(32).toString("base64url");
const challenge  = crypto.createHash("sha256").update(verifier).digest("base64url");
```

### 13.2 Các lỗi OAuth thường gặp

| Lỗi | Nguy hiểm | Phòng ngừa |
|---|---|---|
| `redirect_uri` linh động | Steal code/token → account takeover | Allowlist exact redirect_uri |
| Thiếu `state` | CSRF trong luồng login | `state` ngẫu nhiên, verify khi callback |
| Thiếu PKCE (public client) | Code interception | Bắt buộc PKCE |
| Trộn `response_type=token` implicit | Token lộ trong URL | Dùng Authorization Code + PKCE |
| Scope quá rộng | Lạm dụng quyền | Least privilege scope |

### 13.3 Webhook — xác thực nguồn

```ts
// ✅ Verify chữ ký (Stripe, GitHub, Shopee...)
function verifyWebhook(req: Request, secret: string): boolean {
  const signature = req.headers["x-signature"] as string;
  const expected = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  return safeEqual(signature, expected);
}

// ✅ GitHub example
const sig = `sha256=${crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex")}`;
if (!safeEqual(sig, req.headers["x-hub-signature-256"]!)) return res.status(401).end();
```

**Checklist webhook:**
- Verify chữ ký + timestamp (chống replay).
- Trả `200` nhanh, xử lý bất đồng bộ (không để provider timeout).
- Idempotency — xử lý trùng `event.id` 2 lần không sao.
- Không bao giờ gọi lại URL do webhook payload chỉ định (dẫn tới SSRF).

---

## 14. Checklist bảo mật API (OWASP API Top 10 2023)

```markdown
### API1 — BOLA / IDOR
- [ ] Mọi endpoint truy cập object đều kiểm tra chủ sở hữu
- [ ] Trả 404 khi user không được phép biết sự tồn tại
- [ ] Không lộ ID sequential dễ đoán (dùng UUID/ULID nếu public)

### API2 — Broken Authentication
- [ ] JWT verify với algorithms whitelist
- [ ] Access token ngắn hạn + refresh token rotation
- [ ] Rate limit login, CAPTCHA sau N lần sai
- [ ] Message lỗi đăng nhập chung chung (chống enumeration)
- [ ] MFA cho admin
- [ ] Logout thật sự (revoke token)

### API3 — Property-level authz
- [ ] Allowlist field nhận từ client (chống mass assignment)
- [ ] Response chỉ trả field cần thiết (chống over-fetching)
- [ ] Không trả password hash, internal flags

### API4 — Resource consumption
- [ ] Rate limit per user/IP/endpoint
- [ ] Giới hạn body size, file size, depth JSON
- [ ] Giới hạn page size (limit ≤ 100)
- [ ] Timeout cho mọi outbound call

### API5 — Function-level authz
- [ ] Kiểm tra quyền cho MỖI route × MỖI method (không chỉ nhóm)
- [ ] Method không được phép → 405/403
- [ ] Admin endpoints tách riêng, bắt buộc role admin + audit log

### API6 — Business flow
- [ ] Quy tắc nghiệp vụ (1 RSVP/người, số lượng có hạn...) ở server
- [ ] Bot detection / CAPTCHA cho flow quan trọng

### API7 — SSRF
- [ ] Allowlist outbound domain
- [ ] Block IP private/link-local/metadata
- [ ] Không cho user chỉ định URL tùy ý

### API8 — Misconfiguration
- [ ] CORS allowlist, không wildcard + credentials
- [ ] Không lộ version server, debug tắt
- [ ] TLS + HSTS
- [ ] Headers bảo mật (helmet/CSP)
- [ ] Error handler trả 500 chung chung, không stack trace

### API9 — Inventory
- [ ] OpenAPI spec đầy đủ, là nguồn sự thật
- [ ] Không còn endpoint dev/test trên production
- [ ] Chính sách sunset cho version cũ

### API10 — Unsafe consumption
- [ ] Validate response từ API bên thứ ba (schema!)
- [ ] Không tin tưởng field từ partner (vd: partner cũng có thể bị hack)
- [ ] Timeout + retry có giới hạn
```

**Bổ sung ngoài OWASP:**
```markdown
- [ ] Parameterized query / ORM cho mọi DB access
- [ ] Escape output, CSP
- [ ] Audit log cho hành động nhạy cảm (xoá, đổi quyền, export)
- [ ] Secret không nằm trong repo (gitleaks)
- [ ] Dependency audit trong CI
- [ ] Giới hạn kích thước log/hoạt động chống log flooding
```

---

## 15. Kiểm thử bảo mật API

### 15.1 Công cụ

| Công cụ | Mục đích |
|---|---|
| **OWASP ZAP** | Dò lỗ hổng tự động (baseline/active scan) |
| **Burp Suite** | Proxy intercept, thao tác request thủ công |
| **Postman/Insomnia + collections** | Chạy kiểm thử authorization matrix |
| **schemathesis** | Fuzz API theo OpenAPI spec |
| **42crunch / Akto** | Kiểm tra API security theo schema |
| **sqlmap** | Test SQLi (chỉ trên hệ thống được phép) |
| **gitleaks / truffleHog** | Quét secret bị commit |
| **npm audit / trivy** | Quét dependency CVE |

### 15.2 Kiểm thử thủ công — ma trận ủy quyền

```text
Đối với MỖI endpoint, test với 4 tài khoản:
  anonymous | user_A | user_B | admin

  GET    /messages          → anon: 200? (nếu public) / user: 200
  GET    /messages/:id      → user_A đọc id của user_B → phải 404/403
  PUT    /profile/:id       → user_A sửa id của user_B → phải 403/404
  DELETE /admin/users       → user thường → phải 403
  POST   /rsvp với role= trong body → phải bị bỏ qua (mass assignment)
```

**Script test tự động (Node):**

```ts
const ENDPOINTS = [
  { method: "GET",  path: "/api/messages/1" },
  { method: "PUT",  path: "/api/profile/1", body: { role: "admin" } },
  { method: "DELETE", path: "/api/admin/users/1" },
];

const ACTORS = {
  anon: null,
  userA: tokenUserA,
  userB: tokenUserB,
  admin: tokenAdmin,
};

for (const [name, token] of Object.entries(ACTORS)) {
  for (const ep of ENDPOINTS) {
    const res = await fetch(BASE + ep.path, {
      method: ep.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    console.log(`${name.padEnd(6)} ${ep.method.padEnd(6)} ${ep.path} → ${res.status}`);
  }
}
```

### 15.3 Fuzzing input

```bash
# schemathesis — fuzz theo OpenAPI
schemathesis run https://api.example.com/openapi.json \
  --checks all --hypothesis-max-examples=200

# ZAP baseline scan
zap-baseline.py -t https://staging.example.com -r report.html
```

### 15.4 CI/CD — Quality Gate bảo mật

```yaml
# .github/workflows/security.yml
name: security
on: [push, pull_request]
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --production --audit-level=high
      - run: npx gitleaks detect --source . -v
      - run: npx trivy fs --severity CRITICAL,HIGH --exit-code 1 .
      - run: npm run typecheck && npm test
```

---

## 16. Ví dụ ứng dụng thực tế: Hardening API Wedding

> Dự án `wedding-server` — API cho wedding guestbook: khách gửi RSVP/tin nhắn chúc
> phúc. Dưới đây là bản **production-ready** tích hợp mọi kiến thức ở trên.

### 16.1 Cấu trúc middleware (theo thứ tự — rất quan trọng!)

```ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const app = express();

// 1) Trust proxy (để req.ip đúng sau nginx) + ẩn server
app.set("trust proxy", 1);
app.disable("x-powered-by");

// 2) Hardening headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "same-site" } }));

// 3) CORS allowlist
const ALLOWED = new Set([process.env.PUBLIC_URL!]);
app.use(cors({ origin: (o, cb) => cb(null, !o || ALLOWED.has(o)), credentials: true }));

// 4) Body limit (chống payload quá lớn)
app.use(express.json({ limit: "16kb" }));

// 5) Rate limit toàn cục
app.use("/api", rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// 6) Cấu trúc lại body bị lỗi → JSON thống nhất
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "Payload quá lớn" });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "JSON không hợp lệ" });
  console.error(err);                                     // log server-side
  res.status(500).json({ error: "Lỗi máy chủ" });          // không lộ stack
});
```

### 16.2 Schema RSVP + endpoint an toàn

```ts
const RsvpSchema = z.object({
  sender_name: z.string().trim().min(2).max(80)
    .regex(/^[^<>{}]*$/, "Tên không được chứa ký tự đặc biệt"),
  content: z.string().trim().min(1).max(500),
  will_attend: z.boolean(),
  guest_of: z.enum(["Chú rể", "Cô dâu", "Cả hai"]),
  number_attend: z.coerce.number().int().min(0).max(10),
});

app.post("/api/rsvp",
  rateLimit({ windowMs: 60_000, max: 5 }),              // 5 RSVP/phút
  async (req, res, next) => {
    const parsed = RsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), msg: i.message })),
      });
    }

    try {
      // Idempotency: tránh spam trùng (dựa trên cookie session + content hash)
      const fingerprint = crypto
        .createHash("sha256")
        .update(`${req.ip}|${parsed.data.sender_name}|${parsed.data.content}`)
        .digest("hex");
      const dup = await redis.set(`dedup:${fingerprint}`, "1", { NX: true, EX: 3600 });
      if (!dup) return res.status(409).json({ error: "Bạn đã gửi nội dung này rồi" });

      const { data, error } = await supabase
        .from("messages")
        .insert([parsed.data])                          // ← body đã được validate & clean
        .select().single();

      if (error) throw error;
      res.status(201).json({ ok: true, id: data.id });
    } catch (err) {
      next(err);                                        // → error handler chung
    }
  },
);
```

### 16.3 Endpoint admin — phân quyền + audit log

```ts
app.delete("/api/admin/messages/:id",
  auth,                                                   // 401 nếu chưa đăng nhập
  requirePermission("message:delete"),                    // 403 nếu không phải admin
  async (req, res, next) => {
    try {
      const id = z.string().uuid().safeParse(req.params.id);
      if (!id.success) return res.status(404).json({ error: "Not found" });

      const { data, error } = await supabase
        .from("messages").delete().eq("id", id.data).select().single();

      if (error || !data) return res.status(404).json({ error: "Not found" });

      // Audit log — ai, khi nào, làm gì
      await auditLog({
        actor: req.user!.id,
        action: "message.delete",
        target: id.data,
        ip: req.ip,
        at: new Date().toISOString(),
      });

      res.json({ ok: true });
    } catch (err) { next(err); }
  },
);
```

### 16.4 .env & git hygiene cho dự án

```bash
# .gitignore đã có .env — kiểm tra lại
grep -q "^\.env$" .gitignore && echo "OK" || echo "THIẾU .env trong .gitignore"

# Quét secret lỡ commit
npx gitleaks detect --source . -v

# Chạy typecheck trước khi commit
bun run typecheck
```

---

## 17. Anti-patterns

| ❌ Anti-pattern | ✅ Nên làm |
|---|---|
| "Frontend ẩn nút admin nên an toàn" | Luôn check quyền ở server |
| JWT verify không chỉ định `algorithms` | `algorithms: ["RS256"]` |
| Lưu mật khẩu plain / hash MD5 | Argon2id/bcrypt |
| CORS `origin: "*"` + `credentials: true` | Allowlist Origin |
| Trả stack trace cho client khi lỗi | Log server, trả message chung chung |
| Log nguyên body request (chứa password/token) | Log field đã lọc, mask PII |
| So sánh secret bằng `===` | `crypto.timingSafeEqual` |
| `SELECT *` + trả toàn bộ record cho client | Chọn đúng field (over-fetching) |
| Không rate limit login | 5 lần/phần tử + CAPTCHA |
| Secret trong repo | Kho bí mật + gitleaks trong CI |
| Tự viết crypto/mã hoá | Dùng thư viện chuẩn |
| Trust header `X-Forwarded-For` không kiểm tra | `trust proxy` cấu hình đúng + dãy IP hợp lệ |
| One big `try/catch` nuốt mọi lỗi | Error handler tập trung, có requestId |
| Endpoint test (`/debug`, `/dev`) trên production | Tách môi trường, chặn ở gateway |
| Không version API | `/api/v1` + chính sách sunset |

---

## 18. Tài liệu tham khảo

- **OWASP API Security Top 10 (2023)**: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- **OWASP Cheat Sheet Series**: https://cheatsheetseries.owasp.org/
  - JWT Cheat Sheet, REST Cheat Sheet, Authentication, Cryptographic Storage…
- **OWASP Testing Guide**: https://owasp.org/www-project-web-security-testing-guide/
- **RFC 6749** — OAuth 2.0: https://datatracker.ietf.org/doc/html/rfc6749
- **RFC 7636** — PKCE: https://datatracker.ietf.org/doc/html/rfc7636
- **RFC 8725** — JWT Best Current Practices: https://datatracker.ietf.org/doc/html/rfc8725
- **NIST SP 800-63B** — Digital Identity Guidelines (mật khẩu/MFA)
- **Google API Design Guide**: https://cloud.google.com/apis/design
- **Snyk / Node.js Security Best Practices**: https://github.com/lirantal/awesome-nodejs-security

---

*Tài liệu WebSocket tương ứng: [`websocket.md`](../realtime/websocket.md)*
