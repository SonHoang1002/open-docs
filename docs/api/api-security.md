# Bảo Mật API — Kiến thức toàn diện từ cơ bản đến nâng cao

> Tài liệu tham khảo đầy đủ về bảo mật API: mô hình đe dọa, xác thực/ủy quyền, chống tấn công phổ biến, rate limiting, mã hóa, hardening hạ tầng, kiểm thử bảo mật và hướng dẫn thực hành đa ngôn ngữ.

---

## Mục lục

1. [Nguyên tắc cốt lõi](#1-nguyên-tắc-cốt-lõi)
2. [Mô hình đe dọa (Threat Model)](#2-mô-hình-đe-dọa-threat-model)
3. [Xác thực (Authentication)](#3-xác-thực-authentication)
4. [Ủy quyền (Authorization) & RBAC/ABAC](#4-ủy-quyền-authorization--rbacabac)
5. [OWASP API Security Top 10 (2023)](#5-owasp-api-security-top-10-2023)
6. [Các cuộc tấn công phổ biến và biện pháp phòng ngừa](#6-các-cuộc-tấn-công-phổ-biến-và-biện-pháp-phòng-ngừa)
7. [Input Validation & Output Encoding](#7-input-validation--output-encoding)
8. [Rate Limiting, Throttling & Quota](#8-rate-limiting-throttling--quota)
9. [Mã hóa dữ liệu & Quản lý bí mật](#9-mã-hóa-dữ-liệu--quản-lý-bí-mật)
10. [CORS, CSP & Hardening Headers](#10-cors-csp--hardening-headers)
11. [Bảo mật tầng hạ tầng & Triển khai](#11-bảo-mật-tầng-hạ-tầng--triển-khai)
12. [API Gateway, Versioning & Lifecycle](#12-api-gateway-versioning--lifecycle)
13. [Logging, Giám sát & Phát hiện xâm nhập](#13-logging-giám-sát--phát-hiện-xâm-nhập)
14. [Bảo mật Third-party, OAuth 2.0, OIDC & Webhook](#14-bảo-mật-third-party-oauth-20-oidc--webhook)
15. [Multi-tenancy, IDOR & Row-Level Authorization](#15-multi-tenancy-idor--row-level-authorization)
16. [File Upload Security](#16-file-upload-security)
17. [SSRF, Outbound Requests & Service-to-Service](#17-ssrf-outbound-requests--service-to-service)
18. [Threat Modeling, Secure SDLC & Incident Response](#18-threat-modeling-secure-sdlc--incident-response)
19. [Checklist bảo mật API (OWASP API Top 10 2023)](#19-checklist-bảo-mật-api-owasp-api-top-10-2023)
20. [Kiểm thử bảo mật API](#20-kiểm-thử-bảo-mật-api)
21. [Ví dụ ứng dụng thực tế: Hardening Orders/Customers API](#21-ví-dụ-ứng-dụng-thực-tế-hardening-orderscustomers-api)
22. [Anti-patterns](#22-anti-patterns)
23. [Tài liệu tham khảo](#23-tài-liệu-tham-khảo)

---

## 1. Nguyên tắc cốt lõi

### 1.1 Defense in Depth (Phòng thủ nhiều lớp)

Không có "cái khóa vàng" duy nhất — mỗi lớp đều cần bảo vệ:

```text
┌─ Lớp 6: WAF / DDoS protection (Cloudflare, AWS Shield)
├─ Lớp 5: TLS 1.3, HSTS, mTLS (chứng chỉ hai chiều)
├─ Lớp 4: API Gateway — auth, rate limit, validation, schema enforcement
├─ Lớp 3: Application middleware — verify token, RBAC/ABAC, input validation
├─ Lớp 2: Business logic — ownership check, business rules, idempotency
└─ Lớp 1: Database — least-privilege role, parameterized queries, RLS/ACL
```

### 1.2 Least Privilege (Quyền tối thiểu)

- Người dùng/chức vụ chỉ được quyền cần thiết cho nhiệm vụ của họ.
- API key/DB role/service account chỉ cấp scope tối thiểu.
- Service-to-service nên dùng mTLS + scoped token, tuyệt đối không chia sẻ chung 1 bí mật.
- Áp dụng nguyên tắc "default deny" (từ chối mặc định, chỉ cho phép rõ ràng).

### 1.3 Fail Secure (Thất bại an toàn)

- Nếu xác thực/ủy quyền thất bại → **từ chối**, không phải "cho qua mặc định".
- Lỗi exception → trả `500` chung chung, **không** lộ stack trace, file path, query SQL.
- Nếu dependency xuống → có fallback an toàn hoặc từ chối rõ ràng.
- Timeout/retry phải có giới hạn để tránh lan truyền lỗi.

### 1.4 Never Trust Input

Mọi thứ đến từ client đều là **giả định cần kiểm chứng**: header, query, body, cookie, path params, file upload, TLS client cert, IP header (`X-Forwarded-For`) — tất cả đều có thể bị giả mạo.

### 1.5 Separation of Concerns

- **Authentication** = bạn là ai?
- **Authorization** = bạn được làm gì?
- **Validation** = dữ liệu có hợp lệ không?
- **Auditing** = bạn đã làm gì (ghi log bất biến)?
- **Accounting/Quota** = giới hạn sử dụng như thế nào?

### 1.6 Secure by Design

- **KISS**: đơn giản hơn → ít bề mặt tấn công hơn.
- **Explicit over implicit**: chỉ định rõ ràng thay vì dựa vào ngầm định.
- **Complete mediation**: kiểm tra quyền **cho mỗi request**.
- **Psychological acceptability**: bảo mật không được làm phức tạp đến mức người dùng tìm cách lách.
- **Open design**: bảo mật dựa trên bí mật (keys) chứ không phải "giấu thiết kế".

---

## 2. Mô hình đe dọa (Threat Model)

Áp dụng phương pháp **STRIDE** cho API:

| Ký hiệu | Mối đe dọa | Ví dụ trên API | Biện pháp phòng ngừa |
|---|---|---|---|
| **S**poofing | Giả mạo danh tính | Giả JWT, chiếm session/cookie | Xác thực mạnh, MFA, mTLS, session regeneration |
| **T**ampering | Thay đổi dữ liệu | Sửa `customer_id`/`order_id` trong body/URL (IDOR/BOLA) | Kiểm tra chủ sở hữu/ủy quyền ở server, chữ ký, HMAC |
| **R**epudiation | Chối bỏ hành động | Không log ai đã huỷ đơn, đổi trạng thái thanh toán | Audit log bất biến, request-id, timestamp, actor traceable |
| **I**nformation Disclosure | Lộ thông tin nhạy cảm | Lỗi trả stack trace, user enumeration, over-fetching | Message lỗi chung chung, allowlist response fields, 404 thay 403 khi cần ẩn tồn tại |
| **D**enial of Service | Từ chối dịch vụ | Flood, regex DoS (ReDoS), payload lớn, expensive query | Rate limit, timeout, max body/limit, query optimization, circuit breaker |
| **E**levation of Privilege | Thăng quyền trái phép | User thường gọi admin, mass assignment thêm `role: "admin"` | RBAC/ABAC per-route/per-method, allowlist field, default deny |

### Câu hỏi Threat Modeling cho từng endpoint

```text
1. Endpoint này phục vụ ai? (public / authenticated / admin / service-to-service)
2. Nếu attacker thay toàn bộ body/query thì sao?
3. Nếu attacker đổi ID resource trong URL/body thì sao? (BOLA/IDOR)
4. Nếu attacker replay request nhiều lần thì sao?
5. Dữ liệu trả về có lộ dữ liệu người dùng/đơn hàng khác không?
6. Hành động nào là không thể đảo ngược? (xóa, huỷ, thanh toán) cần bảo vệ thế nào?
7. Nếu upstream/dependency bị compromise thì sao?
8. Có thể bị lạm dụng cho business logic (fraud/spam) không?
9. Có cần idempotency/confirmation không?
10. Có cần audit log không?
```

### Mô hình tấn công điển hình (Attack Surface)

- **Authentication endpoints**: `/auth/login`, `/auth/refresh`, `/auth/reset-password`
- **Sensitive resources**: `/orders`, `/payments`, `/customers`, `/shipments`
- **Admin endpoints**: `/admin/*`
- **File upload**: `/uploads`, `/attachments`
- **Webhooks**: `/webhooks/*`
- **Outbound calls**: endpoints gọi URL bên thứ 3

---

## 3. Xác thực (Authentication)

### 3.1 So sánh các phương pháp xác thực

| Phương pháp | An toàn | Phức tạp | Phù hợp | Ghi chú |
|---|---|---|---|---|
| **API Key (header)** | Thấp–Trung bình | Rất thấp | Machine-to-machine nội bộ, backend jobs | Bí mật tĩnh, cần rotation + scope + lưu an toàn |
| **Session Cookie + TLS** | Trung bình–Cao | Trung bình | Web app truyền thống (server-render) | HttpOnly+Secure+SameSite, session fixation protection |
| **JWT (Bearer, RS256/EdDSA)** | Cao (nếu cấu hình đúng) | Trung bình | SPA, mobile, microservice | Stateless, cần cẩn thận với thu hồi & algorithm confusion |
| **OAuth 2.0 / OIDC** | Cao | Cao | Third-party login, SSO, delegated access | Luôn dùng Authorization Code + PKCE cho public client |
| **mTLS (mutual TLS)** | Rất cao | Cao | Service-to-service, B2B nhạy cảm, ngân hàng | Chứng chỉ hai chiều, cần quản lý CA lifecycle |
| **HMAC-signed request** | Cao | Trung bình | Webhook, partner API | Timestamp + nonce + chữ ký, chống replay |

### 3.2 API Key

```ts
// Middleware kiểm tra API key (chỉ dùng cho M2M nội bộ)
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  if (!key) return res.status(401).json({ error: "Unauthorized" });
  
  // So sánh constant-time với keys đã hash/lưu trong kho bí mật
  const isValid = await apiKeyStore.verify(key); // verify hash
  if (!isValid) return res.status(401).json({ error: "Unauthorized" });
  
  req.auth = { type: "api-key", scopes: isValid.scopes };
  next();
}
```

**Lưu ý quan trọng:**
- **Không bao giờ** nhúng API key vào frontend, mobile app public, repo, log.
- Lưu **hash** của API key trong DB (giống mật khẩu), chỉ hiển thị full key **1 lần** khi tạo.
- Cấp theo **scope** rõ ràng, hỗ trợ **rotation** (nhiều key đồng thời), có **expiration**.
- Giới hạn theo IP/rate limit riêng cho API key.

### 3.3 Session Cookie an toàn

```ts
import session from "express-session";
import RedisStore from "connect-redis";

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,        // >= 32 bytes ngẫu nhiên
  name: "__Host-sid",                        // prefix an toàn (chỉ HTTPS, không domain)
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: true,                            // chỉ gửi qua HTTPS
    httpOnly: true,                          // JS không đọc được
    sameSite: "strict",                      // chống CSRF mạnh (hoặc "lax")
    maxAge: 30 * 60 * 1000,                  // session ngắn
    path: "/",
  },
}));
```

**Session Fixation Protection:**

```ts
app.post("/auth/login", async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).json({ error: "Thông tin đăng nhập không đúng" });

  // Tạo session ID MỚI sau khi xác thực thành công
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Lỗi máy chủ" });
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.createdAt = Date.now();
    res.json({ ok: true });
  });
});

// Hủy session hoàn toàn
app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("__Host-sid", { path: "/" });
    res.json({ ok: true });
  });
});
```

### 3.4 JWT (JSON Web Token)

**Cấu trúc:** `header.payload.signature` (base64url)

```text
header:    {"alg":"RS256","typ":"JWT","kid":"key-2026-01"}
payload:   {"sub":"usr_9xQ2","role":"customer","scope":"orders:read","iss":"api.example.com","aud":"app.example.com","exp":1735689600,"iat":1735686000,"jti":"8f14e45f-..."}
signature: RSASSA-PKCS1-v1_5 + SHA-256(header.payload, privateKey)
```

#### Claims quan trọng

| Claim | Bắt buộc | Ý nghĩa |
|---|---|---|
| `sub` | Khuyến nghị | Subject — định danh người dùng/service |
| `iss` | Khuyến nghị | Issuer — ai phát hành token |
| `aud` | Khuyến nghị | Audience — dịch vụ nào được phép dùng |
| `exp` | **Bắt buộc** | Expiration time (Unix timestamp, ngắn) |
| `iat` | Khuyến nghị | Issued at |
| `nbf` | Tùy chọn | Not before |
| `jti` | Khuyến nghị | JWT ID — dùng cho denylist/revocation, audit |

#### Chống Algorithm Confusion

```ts
import jwt from "jsonwebtoken";

// ❌ NGUY HIỂM — không bao giờ tin tưởng alg từ header
// const decoded = jwt.verify(token, (header) => header.alg);

// ✅ ĐÚNG — whitelist thuật toán cứng
const publicKey = fs.readFileSync("./keys/public.pem", "utf8");
const payload = jwt.verify(token, publicKey, {
  algorithms: ["RS256"],           // hoặc ["EdDSA"]
  issuer: "api.example.com",
  audience: "app.example.com",
  maxAge: "60m",                   // bổ sung kiểm tra
}) as JwtPayload;
```

**Lỗi phổ biến:** attacker đổi `alg: "HS256"` và ký bằng public key → server dùng HS256 với public key làm secret. **Luôn dùng `algorithms` whitelist + chỉ định key theo thuật toán.**

#### Issue & Verify JWT (đa stack neutral)

**Node.js/TypeScript (RS256):**

```ts
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";

const privateKey = fs.readFileSync("./keys/private.pem", "utf8");
const publicKey  fs.readFileSync("./keys/public.pem", "utf8");

export function issueAccessToken(userId: string, role: string, scopes: string[]) {
  return jwt.sign(
    { sub: userId, role, scope: scopes.join(" "), jti: crypto.randomUUID() },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "15m",
      issuer: "api.example.com",
      audience: "app.example.com",
      keyid: "key-2026-01",
    }
  );
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: "api.example.com",
      audience: "app.example.com",
    }) as { sub: string; role: string; scope?: string; jti?: string };
    
    // Kiểm tra revoke nếu cần
    if (payload.jti && await isRevoked(payload.jti)) {
      return res.status(401).json({ error: "Token đã bị thu hồi" });
    }
    
    req.user = { id: payload.sub, role: payload.role, scope: payload.scope?.split(" ") ?? [] };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token hết hạn" });
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
}
```

#### Refresh Token với Rotation & Reuse Detection

```text
Access token  : ngắn (10-15 phút), stateless, mang quyền
Refresh token : dài (7-14 ngày), LƯU server (hash), dùng 1 LẦN (rotation)
Khi phát hiện reuse (dùng refresh token đã used) → thu hồi TOÀN BỘ family
```

```ts
import crypto from "node:crypto";

function sha256(s: string){ return crypto.createHash("sha256").update(s).digest("hex"); }

app.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });
  
  const tokenHash = sha256(refreshToken);
  const record = await db.refreshTokens.findByHash(tokenHash);
  
  if (!record) return res.status(401).json({ error: "Invalid refresh token" });
  
  // Phát hiện reuse
  if (record.usedAt) {
    // Nghi bị đánh cắp → thu hồi cả family
    await db.refreshTokens.revokeFamily(record.familyId);
    await auditLog({ action: "auth.refresh_reuse_detected", userId: record.userId, familyId: record.familyId });
    return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại" });
  }
  
  // Đánh dấu đã dùng
  await db.refreshTokens.markUsed(record.id);
  
  // Tạo refresh token mới (rotation)
  const { raw: newRefresh, hash: newHash } = await generateRefreshToken();
  await db.refreshTokens.create({
    userId: record.userId,
    familyId: record.familyId, // giữ cùng family để phát hiện reuse
    tokenHash: newHash,
    expiresAt: addDays(new Date(), 7),
  });
  
  res.json({
    accessToken: issueAccessToken(record.userId, record.role, record.scopes),
    refreshToken: newRefresh,
  });
});
```

#### JWT Revocation (Denylist)

```ts
// Khi logout/change password/permission revoked
async function revokeToken(jti: string, exp: number) {
  const ttl = exp - Math.floor(Date.now()/1000);
  if (ttl > 0) {
    await redis.set(`jwt:revoked:${jti}`, "1", { EX: ttl });
  }
}

async function isRevoked(jti: string): Promise<boolean> {
  const v = await redis.get(`jwt:revoked:${jti}`);
  return v === "1";
}
```

> **Trade-off:** JWT stateless → khó thu hồi ngay. Nếu cần thu hồi **ngay lập tức** (logout, ban), dùng short-lived access token (5-15 phút) + server-side session/denylist. Nếu chỉ cần rotation thông thường, refresh token rotation đã đủ trong nhiều trường hợp.

#### So sánh JWT vs Session

| Tiêu chí | JWT (stateless) | Session (server-side) |
|---|---|---|
| Lưu trạng thái | Không | Có (Redis/DB) |
| Thu hồi ngay | Khó (cần denylist) | Dễ (xóa key/session) |
| Phân tán đa service | Dễ (verify bằng public key) | Cần share session store hoặc sticky |
| Kích thước | Lớn hơn (header+payload+sig) | Session ID nhỏ |
| XSS/CSRF | Bearer token: ít CSRF hơn nhưng dễ bị XSS steal nếu lưu localStorage | Cookie HttpOnly: chống XSS steal tốt hơn, cần chống CSRF |
| Revocation | Phức tạp hơn | Đơn giản hơn |
| Phù hợp | Microservice, mobile, SPA, M2M | Web app truyền thống, cần thu hồi tức thời |

### 3.5 Lưu trữ mật khẩu

```text
❌ MD5 / SHA1 / SHA256 thuần  — quá nhanh, dễ brute-force bằng GPU/ASIC
❌ "Mã hóa" mật khẩu (AES)     — reversible, hoàn toàn sai
✅ Argon2id                    — khuyến nghị OWASP 2024+, chống GPU/ASIC
✅ bcrypt                      — vẫn chấp nhận được, cost >= 12
✅ scrypt                      — tốt
```

```ts
// Argon2id (khuyến nghị)
import argon2 from "argon2";

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64MB
  timeCost: 3,
  parallelism: 4,
});
const valid = await argon2.verify(hash, password);

// bcrypt
import bcrypt from "bcrypt";
const hash2 = await bcrypt.hash(password, 12);
const valid2 = await bcrypt.compare(password, hash2);
```

**Nguyên tắc:**
- **Hash** mật khẩu — không bao giờ lưu plain.
- **Encrypt** dữ liệu cần đọc lại (PII nhạy cảm) — dùng AES-256-GCM.
- **Pepper** (tùy chọn): giá trị bí mật toàn cục lưu trong secret manager, kết hợp với salt (pepper khác với salt).
- **Rate limit** login + user enumeration protection.

### 3.6 MFA / Passkey

- **TOTP** (RFC 6238): 6 chữ số, 30s window, secret base32. Dùng `speakeasy`, `otplib`.
- **WebAuthn/FIDO2/Passkey**: mạnh nhất, chống phishing, khuyến nghị cho tài khoản nhạy cảm/admin.
- **Backup codes**: cung cấp khi bật MFA, dùng 1 lần.

```ts
import { authenticator } from "otplib";

const secret = authenticator.generateSecret();
const otpauth = authenticator.keyuri(user.email, "MyApp", secret);
// Hiển thị QR cho user scan

const verified = authenticator.verify({ token: req.body.code, secret: user.totpSecret });
if (!verified) return res.status(401).json({ error: "Mã xác thực không đúng" });
```

---

## 4. Ủy quyền (Authorization) & RBAC/ABAC

> **Quy tắc số 1:** Authorization **PHẢI** kiểm tra ở server, **cho MỖI request**. Ẩn UI không phải là kiểm soát quyền.

### 4.1 Phân biệt Authentication vs Authorization

| Khái niệm | Câu hỏi | Status code |
|---|---|---|
| **Authentication (AuthN)** | "Bạn là ai?" | 401 nếu chưa xác thực/invalid |
| **Authorization (AuthZ)** | "Bạn được làm gì?" | 403 nếu đã xác thực nhưng không có quyền |

### 4.2 RBAC (Role-Based Access Control)

```ts
type Role = "customer" | "support" | "manager" | "admin";

const PERMISSIONS: Record<Role, string[]> = {
  customer: ["orders:read:own", "orders:create", "profile:read:own", "profile:update:own"],
  support:  ["orders:read:any", "customers:read:any", "shipments:update"],
  manager:  ["orders:*", "customers:*", "reports:read"],
  admin:    ["*"],
};

function hasPermission(role: Role, required: string): boolean {
  const perms = PERMISSIONS[role] ?? [];
  if (perms.includes("*")) return true;
  if (perms.includes(required)) return true;
  // wildcard: orders:* matches orders:read:any
  for (const p of perms) {
    if (p.endsWith(":*")) {
      const prefix = p.slice(0, -1);
      if (required.startsWith(prefix)) return true;
    }
  }
  return false;
}

export function requirePermission(perm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!hasPermission(req.user.role, perm)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// Sử dụng
app.delete("/orders/:id", authenticate, requirePermission("orders:delete"), deleteOrder);
```

### 4.3 ABAC (Attribute-Based Access Control)

Quyết định dựa trên thuộc tính: **subject + resource + action + environment**.

```ts
interface PolicyContext {
  user: { id: string; role: string; orgId: string; trustLevel: number };
  resource: { id: string; ownerId: string; orgId: string; status: string };
  action: string;
  env: { ip: string; time: Date; mfaVerified: boolean };
}

function canCancelOrder(ctx: PolicyContext): boolean {
  // Admin có thể hủy mọi đơn
  if (ctx.user.role === "admin") return true;
  
  // Chủ sở hữu chỉ hủy đơn của chính mình
  if (ctx.resource.ownerId !== ctx.user.id) return false;
  
  // Chỉ hủy đơn trong trạng thái cho phép
  if (!["pending", "confirmed"].includes(ctx.resource.status)) return false;
  
  // Chỉ hủy trong 30 phút sau khi tạo
  const ageMin = (ctx.env.time.getTime() - ctx.resource.createdAt.getTime()) / 60000;
  if (ageMin > 30) return false;
  
  // Yêu cầu MFA cho hủy đơn giá trị lớn
  if (ctx.resource.total > 5_000_000 && !ctx.env.mfaVerified) return false;
  
  return true;
}
```

### 4.4 Resource-Level Authorization (Ownership)

```ts
// ❌ NGUY HIỂM — BOLA/IDOR
app.get("/orders/:id", authenticate, async (req, res) => {
  const order = await db.orders.findById(req.params.id);
  res.json(order); // attacker có thể xem đơn của người khác
});

// ✅ ĐÚNG — kiểm tra sở hữu
app.get("/orders/:id", authenticate, async (req, res) => {
  const order = await db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  
  // Chỉ chủ sở hữu hoặc admin/support mới được xem
  if (order.customerId !== req.user.id && !["admin","support"].includes(req.user.role)) {
    // Trả 404 thay vì 403 để không tiết lộ sự tồn tại resource
    return res.status(404).json({ error: "Not found" });
  }
  
  res.json(order);
});

// ✅ Còn tốt hơn — filter trong query
app.get("/orders/:id", authenticate, async (req, res) => {
  const order = await db.orders.findByIdAndOwner(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});
```

### 4.5 Function-Level Authorization

Mỗi **route × method** đều phải được kiểm tra quyền. Không chỉ nhóm route, mà cả hành động cụ thể.

```ts
// Sai: chỉ check auth, quên check role
app.post("/admin/orders/:id/refund", authenticate, handler); // NGUY HIỂM

// Đúng: check auth + permission
app.post("/admin/orders/:id/refund", authenticate, requirePermission("orders:refund"), handler);
```

### 4.6 401 vs 403 vs 404

| Status | Ý nghĩa | Khi nào dùng |
|---|---|---|
| `401 Unauthorized` | Chưa xác thực / token sai/hết hạn/thu hồi | Thiếu `Authorization`, token không hợp lệ |
| `403 Forbidden` | Đã xác thực nhưng không có quyền | Có quyền truy cập endpoint nhưng không đủ quyền với resource/hành động này |
| `404 Not Found` | Không tồn tại HOẶC không được phép biết sự tồn tại | Tránh user enumeration/IDOR leak — dùng 404 thay 403 khi tiết lộ existence gây rủi ro |

---

## 5. OWASP API Security Top 10 (2023)

| # | Tên lỗ hổng | Mô tả | Biện pháp chính |
|---|---|---|---|
| **API1:2023** | **Broken Object Level Authorization (BOLA)** | Truy cập object không thuộc quyền qua ID | Ownership check, filter by user/org, dùng UUID khó đoán, trả 404 thay 403 |
| **API2:2023** | **Broken Authentication** | Xác thực yếu, brute force, token lộ | MFA, short-lived token, refresh rotation, rate limit, chống enumeration |
| **API3:2023** | **Broken Object Property Level Authorization** | Expose/modify field không được phép (mass assignment, excess data exposure) | Allowlist input, allowlist output, response schema, hide sensitive fields |
| **API4:2023** | **Unrestricted Resource Consumption** | Abuse tài nguyên (DoS, cost attack) | Rate limit/quota, pagination max, body size, timeout, query cost limit |
| **API5:2023** | **Broken Function Level Authorization** | Gọi endpoint/hành động admin mà không có quyền | RBAC per route×method, default deny, kiểm tra function-level |
| **API6:2023** | **Unrestricted Access to Sensitive Business Flows** | Lạm dụng flow nghiệp vụ (fraud) | Business rule validation, bot detection, step-up auth, device fingerprint, velocity check |
| **API7:2023** | **Server Side Request Forgery (SSRF)** | Ép server gọi URL nội bộ/metadata | Allowlist domain/IP, block private/reserved/metadata, DNS rebinding protection, no redirects to internal |
| **API8:2023** | **Security Misconfiguration** | Cấu hình sai (CORS, headers, debug, default) | Harden config, disable debug, security headers, least privilege infra |
| **API9:2023** | **Improper Inventory Management** | API cũ/ẩn chưa bảo mật, shadow API | API inventory, deprecation/sunset, versioning, access control, retirement plan |
| **API10:2023** | **Unsafe Consumption of APIs** | Tin tưởng blind API bên thứ 3 | Validate response schema, timeout/retry/circuit breaker, mTLS, don't forward blindly |

---

## 6. Các cuộc tấn công phổ biến và biện pháp phòng ngừa

### 6.1 Broken Object Property Level Authorization (Mass Assignment / Excess Data Exposure)

**Mass Assignment:**

```ts
// ❌ NGUY HIỂM
app.put("/customers/:id", authenticate, async (req, res) => {
  const customer = await db.customers.update(req.params.id, req.body); // attacker thêm "role":"admin"
  res.json(customer);
});

// ✅ ĐÚNG — allowlist
const UPDATE_ALLOWED = ["fullName", "phone", "addressLine1", "addressLine2", "email"] as const;
app.put("/customers/:id", authenticate, async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== "admin") return res.status(404).end();
  
  const patch = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => (UPDATE_ALLOWED as readonly string[]).includes(k))
  );
  
  const customer = await db.customers.update(req.user.id, patch);
  res.json(customer);
});
```

**Excess Data Exposure:**

```ts
// ❌ Trả toàn bộ
res.json(customer); // có thể chứa passwordHash, internalNotes, ssn...

// ✅ Trả DTO/response schema
function toPublic(c: Customer) {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    createdAt: c.createdAt,
  };
}
res.json(toPublic(customer));
```

### 6.2 Injection (SQL, NoSQL, Command, LDAP)

**SQL Injection:**

```ts
// ❌ String concatenation
db.query(`SELECT * FROM orders WHERE id = '${orderId}'`);

// ✅ Parameterized query
db.query("SELECT * FROM orders WHERE id = $1 AND customer_id = $2", [orderId, customerId]);

// ✅ ORM/Query builder an toàn
db.orders.findFirst({ where: { id: orderId, customerId: req.user.id } });
```

**NoSQL Injection:**

```ts
// ❌ Object injection
// attacker gửi {"email": {"$gt": ""}, "password": {"$gt": ""}} → bypass
app.post("/auth/login", async (req, res) => {
  // validate type
  if (typeof req.body.email !== "string" || typeof req.body.password !== "string") {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
  }
  // ...
});
```

**Command Injection:**

```ts
// ❌
import { exec } from "node:child_process";
exec(`nslookup ${req.query.domain}`); // nguy hiểm

// ✅ Dùng execFile, không qua shell
import { execFile } from "node:child_process";
execFile("nslookup", [sanitizedDomain], { timeout: 5000 }, callback);

// ✅ Validate domain chặt trước
```

**Path Traversal:**

```ts
import path from "node:path";

const UPLOAD_DIR = path.resolve("/var/app/uploads");
const safeName = path.basename(req.query.file); // loại bỏ ../
const fullPath = path.resolve(UPLOAD_DIR, safeName);

if (!fullPath.startsWith(UPLOAD_DIR + path.sep) && fullPath !== UPLOAD_DIR) {
  return res.status(400).json({ error: "Invalid path" });
}
// Đọc file an toàn
```

### 6.3 XSS (Cross-Site Scripting)

- **Stored XSS**: lưu dữ liệu độc hại vào DB → render không escape
- **Reflected XSS**: phản chiếu vào response
- **DOM-based XSS**: xử lý phía client

**Phòng ngừa:**
- Escape output khi render HTML. Với JSON API, XSS chủ yếu xảy ra ở **client**.
- Dùng framework có auto-escaping (React, Vue) đúng cách.
- CSP chặt chẽ (mục 10).
- Sanitize HTML nếu cho phép rich text.

```ts
import sanitizeHtml from "sanitize-html";

const clean = sanitizeHtml(userInput, {
  allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  allowedAttributes: {},
  disallowedTagsMode: "escape",
});
```

### 6.4 CSRF (Cross-Site Request Forgery)

Chỉ ảnh hưởng đến **cookie-based authentication** (session cookie). Bearer token trong header **không** dễ bị CSRF.

**Biện pháp:**

```ts
// 1) SameSite cookie
cookie: { httpOnly: true, secure: true, sameSite: "strict" } // hoặc "lax"

// 2) CSRF token (Double Submit Cookie / Synchronizer Token)
import csurf from "csurf";
app.use(csurf({ cookie: { httpOnly: true, secure: true, sameSite: "strict" } }));

// 3) Kiểm tra Origin/Referer
app.use((req, res, next) => {
  if (["POST","PUT","PATCH","DELETE"].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer;
    if (origin && !isAllowedOrigin(origin)) return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// 4) Custom header bắt buộc (vd: X-Requested-With) — cần kết hợp
```

### 6.5 Clickjacking

```ts
// Headers
res.setHeader("X-Frame-Options", "DENY"); // hoặc SAMEORIGIN
// Hoặc CSP
res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
```

### 6.6 ReDoS (Regular Expression Denial of Service)

```ts
// ❌ Catastrophic backtracking
const bad = /^(a+)+$/;
bad.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!");

// ✅ Giới hạn độ dài input TRƯỚC regex
if (input.length > 256) return res.status(400).json({ error: "Quá dài" });

// ✅ Dùng regex an toàn, tránh nested quantifiers
// ✅ Có thể dùng validator libraries đã được review
```

### 6.7 Business Logic Abuse

Áp dụng quy tắc nghiệp vụ **hoàn toàn ở server**:

```ts
// Ví dụ: không cho tạo đơn nếu vượt quota
const todayCount = await db.orders.countToday(req.user.id);
if (todayCount >= MAX_ORDERS_PER_DAY) {
  return res.status(429).json({ error: "Đã vượt giới hạn đơn hàng trong ngày" });
}

// Ví dụ: không áp dụng voucher 2 lần
const used = await db.vouchers.findUsage(voucherId, req.user.id);
if (used) return res.status(409).json({ error: "Voucher đã được sử dụng" });
```

---

## 7. Input Validation & Output Encoding

### 7.1 Nguyên tắc

1. **Validate tại boundary**: ngay khi request vào (middleware), validate body/query/params/headers.
2. **Allowlist, không blocklist**: chỉ cho phép những gì cần, từ chối còn lại.
3. **Whitelist fields**: cho update/filter/sort.
4. **Fail fast**: trả lỗi rõ ràng với field-level errors.
5. **Sanitize output**: chỉ trả field cần thiết.
6. **Validate lại ở business layer** nếu critical.

### 7.2 Schema Validation với Zod (TypeScript)

```ts
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
    price: z.number().int().min(0), // minor units
  })).min(1).max(50),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(100).regex(/^[\p{L}\s.'-]+$/u),
    phone: z.string().regex(/^\+?[0-9]{8,15}$/),
    line1: z.string().trim().min(5).max(200),
    city: z.string().trim().min(2).max(100),
    country: z.string().length(2), // ISO 3166-1 alpha-2
  }),
  notes: z.string().trim().max(500).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map(i => ({
          path: i.path.join("."),
          message: i.message,
          code: i.code,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

// Sử dụng
app.post("/orders", authenticate, validate(CreateOrderSchema), createOrder);
```

### 7.3 Validate Query/Params

```ts
const ListOrdersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(["pending","confirmed","paid","shipped","delivered","cancelled"]).optional(),
  customerId: z.string().uuid().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  sort: z.enum(["createdAt","total","status"]).default("createdAt"),
  order: z.enum(["asc","desc"]).default("desc"),
});

app.get("/orders", authenticate, (req,res,next)=>{
  const r = ListOrdersQuery.safeParse(req.query);
  if(!r.success) return res.status(400).json({error:"Invalid query", details:r.error.issues});
  req.query = r.data as any;
  next();
}, listOrders);
```

### 7.4 JSON Schema (ngôn ngữ khác)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["customerId", "items"],
  "additionalProperties": false,
  "properties": {
    "customerId": { "type": "string", "format": "uuid" },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["productId", "quantity"],
        "additionalProperties": false,
        "properties": {
          "productId": { "type": "string", "format": "uuid" },
          "quantity": { "type": "integer", "minimum": 1, "maximum": 100 }
        }
      }
    }
  }
}
```

### 7.5 Output Encoding

- **JSON API**: trả JSON đúng kiểu, không nối string thủ công vào HTML.
- **HTML context**: escape `& < > " ' /`.
- **URL context**: encodeURIComponent.
- **SQL**: luôn parameterized.
- **Log**: không log raw sensitive data.

---

## 8. Rate Limiting, Throttling & Quota

### 8.1 Chiến lược

| Chiến lược | Mô tả | Ưu | Nhược | Phù hợp |
|---|---|---|---|---|
| **Fixed Window** | Đếm request trong khoảng thời gian cố định | Đơn giản, dễ hiểu | Burst ở biên window (cuối+đầu) | API đơn giản |
| **Sliding Window Log** | Lưu timestamp mỗi request | Chính xác | Tốn memory với traffic cao | Chính xác cao |
| **Sliding Window Counter** | Kết hợp fixed window + weighted | Cân bằng tốt | Phức tạp hơn | Phổ biến production |
| **Token Bucket** | Có bucket token, refill theo tỷ lệ, cho burst | Linh hoạt, cho burst hợp lý | Cần đồng bộ distributed | REST API chung |
| **Leaky Bucket** | Xử lý đều đặn với tốc độ cố định | Smooth traffic | Không cho burst | Streaming/throttling nghiêm ngặt |
| **Quota (daily/monthly)** | Giới hạn tổng theo thời gian dài | Kiểm soát chi phí | Khác với burst protection | API có billing/quota |

### 8.2 Token Bucket với Redis (Lua script, distributed)

```lua
-- KEYS[1] = rl:user:123
-- ARGV[1]=capacity, ARGV[2]=refillPerSec, ARGV[3]=nowSec, ARGV[4]=cost
local key=KEYS[1]; local capacity=tonumber(ARGV[1]); local refill=tonumber(ARGV[2]); local now=tonumber(ARGV[3]); local cost=tonumber(ARGV[4])
local data=redis.call('HMGET',key,'tokens','ts')
local tokens=tonumber(data[1]) or capacity
local ts=tonumber(data[2]) or now
tokens = math.min(capacity, tokens + (now-ts)*refill)
if tokens < cost then
  redis.call('HMSET',key,'tokens',tokens,'ts',now); redis.call('EXPIRE',key,3600)
  return {0, math.floor(tokens)}
end
tokens = tokens - cost
redis.call('HMSET',key,'tokens',tokens,'ts',now); redis.call('EXPIRE',key,3600)
return {1, math.floor(tokens)}
```

```ts
export async function rateLimit(id: string, cost=1, cap=60, refill=1){
  const now = Date.now()/1000;
  const res = await redis.eval(LUA, { keys:[`rl:${id}`], arguments:[String(cap),String(refill),String(now),String(cost)] }) as number[];
  return { allowed: res[0]===1, remaining: res[1] };
}

export function limiter(opts:{cap:number; refill:number; keyFn?:(req:Request)=>string}){
  return async (req:Request,res:Response,next:NextFunction)=>{
    const id = opts.keyFn?.(req) ?? (req.user?.id ?? req.ip!);
    const {allowed, remaining} = await rateLimit(id,1,opts.cap,opts.refill);
    res.setHeader('RateLimit-Limit', opts.cap);
    res.setHeader('RateLimit-Remaining', remaining);
    if(!allowed){
      res.setHeader('Retry-After','1');
      return res.status(429).json({error:'Too many requests'});
    }
    next();
  };
}

// Phân tầng
app.use('/auth/login', limiter({cap:5, refill:5/300})); // 5 req/5 phút
app.use('/auth/password-reset', limiter({cap:3, refill:3/3600}));
app.use('/api', limiter({cap:120, refill:2})); // 120 req, refill 2/s
```

### 8.3 Headers chuẩn

```http
HTTP/1.1 200 OK
RateLimit-Limit: 120
RateLimit-Remaining: 87
RateLimit-Reset: 1735689660

HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1735689690
Content-Type: application/json
```

### 8.4 Chống Brute Force & User Enumeration

```ts
// Login protection
app.post("/auth/login", async (req,res)=>{
  const { email, password } = req.body;
  const key = `login:fail:${email.toLowerCase()}`;
  
  const fails = await redis.incr(key);
  if(fails === 1) await redis.expire(key, 900); // 15 phút
  
  if(fails > 5){
    const backoff = Math.min(60, 2 ** (fails-5));
    await sleep(backoff*1000);
    if(fails > 20) return res.status(429).json({error:'Tài khoản tạm thời bị khóa, vui lòng thử lại sau'});
  }
  
  const user = await findUserByEmail(email);
  const ok = user && await verifyPassword(user, password);
  
  if(!ok){
    // Thông báo CHUNG CHUNG — không phân biệt email tồn tại hay không
    return res.status(401).json({error:'Thông tin đăng nhập không đúng'});
  }
  
  await redis.del(key);
  // ... issue tokens
});
```

**Lưu ý:** Luôn trả message giống nhau cho "email không tồn tại" và "sai mật khẩu". Thêm timing attack consideration (verify password luôn chạy) nếu cần.

---

## 9. Mã hóa dữ liệu & Quản lý bí mật

### 9.1 Ba trạng thái dữ liệu

| Trạng thái | Mục tiêu | Phương pháp |
|---|---|---|
| **In transit** | Truyền qua mạng | TLS 1.2+ (ưu tiên TLS 1.3), mTLS cho service-to-service |
| **At rest** | Lưu trên đĩa/DB | AES-256-GCM, TDE (Transparent Data Encryption), encrypt field-level cho PII |
| **In use** | Đang xử lý trong RAM | Giảm thiểu exposure, clear memory khi có thể, không log, mask trong debug |

### 9.2 AES-256-GCM (Authenticated Encryption)

```ts
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32; // 256-bit
const IV_LEN = 12;  // recommended for GCM

function getKey(): Buffer {
  const k = process.env.DATA_ENCRYPTION_KEY!;
  return Buffer.from(k, "base64"); // hoặc derive
}

export function encrypt(plaintext: string){
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Lưu: iv + tag + ciphertext (base64)
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(b64: string){
  const key = getKey();
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + 16);
  const enc = buf.subarray(IV_LEN + 16);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
```

**Lưu ý:** Không dùng ECB. IV phải unique. GCM cung cấp **confidentiality + authenticity**. Nếu tag không khớp → `decrypt` ném lỗi.

### 9.3 Hashing vs Encryption

| Mục đích | Thuật toán | Ghi chú |
|---|---|---|
| Mật khẩu | Argon2id, bcrypt, scrypt | Một chiều, slow hash |
| API key/token lookup | SHA-256 + constant-time compare | Hash để lưu, không cần reverse |
| Integrity check | SHA-256, SHA-384 | Fast hash |
| Digital signature | Ed25519, RSA-PSS | Asymmetric |
| Field encryption (cần đọc lại) | AES-256-GCM | Symmetric, authenticated |

### 9.4 Constant-time comparison

```ts
import crypto from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Dùng cho API key, webhook signature
```

### 9.5 Quản lý bí mật

**Quy tắc:**
- **Không bao giờ** commit `.env`, key, cert vào git
- Dùng secret manager: AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, Doppler, Infisical
- Tách secret theo môi trường (dev/staging/prod)
- Rotation định kỳ + có quy trình khẩn cấp
- Least privilege access
- Audit access to secrets
- Pre-commit scanning: `gitleaks`, `truffleHog`

```bash
# .gitignore
.env
.env.*
!.env.example
*.pem
*.key
secrets/
```

```ts
// Fail-fast nếu thiếu secret
const REQUIRED = ["JWT_PRIVATE_KEY", "JWT_PUBLIC_KEY", "DATABASE_URL", "DATA_ENCRYPTION_KEY"];
for (const k of REQUIRED) {
  if (!process.env[k]) {
    console.error(`FATAL: Missing env ${k}`);
    process.exit(1);
  }
}
```

### 9.6 TLS, HSTS, Certificate

```nginx
# nginx example
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

- Ưu tiên **TLS 1.3**
- Redirect HTTP → HTTPS
- HSTS preload nếu phù hợp
- Auto-renew (Let's Encrypt)
- mTLS cho internal service-to-service khi cần

---

## 10. CORS, CSP & Hardening Headers

### 10.1 CORS đúng cách

```ts
import cors from "cors";

const ALLOWED_ORIGINS = new Set([
  "https://app.example.com",
  "https://admin.example.com",
]);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-Request-Id"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset", "X-Request-Id"],
  maxAge: 600, // preflight cache
}));
```

**Lỗi nguy hiểm:**
- `origin: "*" ` + `credentials: true` → **không hợp lệ** theo spec, trình duyệt sẽ chặn hoặc cấu hình sai
- Reflect origin động không kiểm soát → có thể bị bypass

### 10.2 Security Headers với Helmet

```ts
import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://cdn.example.com"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));
```

### 10.3 Headers bổ sung

```ts
app.use((req, res, next) => {
  // Chống MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Chống clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Permissions Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // Cache control cho dữ liệu nhạy cảm
  if (req.path.startsWith("/api") && isSensitive(req.path)) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
  }
  // Ẩn server info
  res.removeHeader("X-Powered-By");
  next();
});
```

---

## 11. Bảo mật tầng hạ tầng & Triển khai

### 11.1 Container Security

```dockerfile
# Dùng distroless/non-root
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER nonroot
EXPOSE 8080
CMD ["server.js"]
```

**Checklist container:**
- [ ] Chạy non-root user
- [ ] Multi-stage build, minimal image
- [ ] Không cài debug tools không cần thiết
- [ ] Scan image: `trivy`, `grype`
- [ ] Read-only filesystem khi có thể
- [ ] Drop capabilities, no privilege escalation
- [ ] Secrets không bake vào image

### 11.2 Network Security

- **Private subnets** cho DB, cache, internal services
- **Public subnet** chỉ cho load balancer/API gateway
- **Security groups/NACLs**: chỉ mở port cần thiết (443)
- **WAF** trước API
- **DDoS protection**
- **Service mesh** với mTLS nếu microservices phức tạp

### 11.3 Dependency Security

```bash
# Kiểm tra vulnerability
npm audit --production --audit-level=high
# Hoặc
pnpm audit --prod

# Scan filesystem
trivy fs --severity CRITICAL,HIGH .

# Cập nhật tự động
# Renovate/Dependabot
```

**CI example:**

```yaml
name: security-scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --production --audit-level=high
      - uses: gitleaks/gitleaks-action@v2
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

### 11.4 Environment & Config

- **12-factor app**: config qua env, không hardcode
- **Secrets rotation**: tự động hóa
- **Least privilege IAM**
- **Immutable infrastructure**
- **Logging không chứa secrets**

### 11.5 Backup & Recovery

- Backup định kỳ (full + incremental)
- **Test restore** thường xuyên
- Point-in-time recovery
- Encryption backup
- Disaster recovery plan, RTO/RPO rõ ràng

---

## 12. API Gateway, Versioning & Lifecycle

### 12.1 API Gateway Responsibilities

```text
Client → WAF → API Gateway → Backend Services
                ├─ TLS termination
                ├─ Authentication/Authorization
                ├─ Rate limiting / quota
                ├─ Request/response validation (JSON Schema/OpenAPI)
                ├─ Transformation
                ├─ Caching
                ├─ Logging/Tracing/Metrics
                ├─ IP allowlist/blocklist
                └─ Circuit breaker
```

### 12.2 Versioning Strategies

| Chiến lược | Ví dụ | Ưu | Nhược | Khuyến nghị |
|---|---|---|---|---|
| **URI Path** | `/v1/orders` | Rõ ràng, dễ route/cache | URL thay đổi | **Phổ biến nhất** — khuyến nghị cho public API |
| **Query Parameter** | `/orders?version=1` | Cùng URI | Cache phức tạp, dễ quên | Ít dùng |
| **Custom Header** | `X-API-Version: 1` | URL sạch | Khó test browser, cache khó | Chấp nhận được |
| **Accept Header (Content Negotiation)** | `Accept: application/vnd.api.v1+json` | Rất RESTful | Phức tạp, ít hỗ trợ | Chỉ nếu thực sự cần |
| **Date-based** | `X-API-Version: 2026-01-01` | Linh hoạt, additive-friendly | Cần quản lý tốt | Tốt cho API lớn (Azure-style) |

**Khuyến nghị:** Dùng **URI path versioning** (`/v1/`, `/v2/`) cho simplicity. Chỉ **major version** khi có **breaking change**.

### 12.3 API Lifecycle

```text
Design (OpenAPI) → Review → Implement → Test → Deploy → Monitor → Deprecate → Sunset/Retire
```

**Deprecation headers:**

```http
Deprecation: true
Sunset: Sat, 01 Jul 2027 00:00:00 GMT
Link: <https://docs.example.com/migration/v2>; rel="deprecation"; type="text/html"
```

**Inventory management (API9):**
- Duy trì **API catalog** (tất cả endpoint, owner, status, auth)
- Phát hiện shadow/undocumented API
- Chính sách sunset rõ ràng, thông báo trước
- Xóa endpoint không dùng

---

## 13. Logging, Giám sát & Phát hiện xâm nhập

### 13.1 Những gì NÊN log

```json
{
  "timestamp": "2026-10-30T10:15:00Z",
  "level": "info",
  "requestId": "req_7f3a9c2e",
  "traceId": "trace_abc123",
  "method": "POST",
  "path": "/orders",
  "status": 201,
  "durationMs": 45,
  "userId": "usr_9xQ2",
  "ip": "203.0.113.10",
  "userAgent": "Mozilla/5.0...",
  "outcome": "success",
  "action": "order.create"
}
```

### 13.2 Những gì KHÔNG BAO GIỜ log

- Mật khẩu, token (access/refresh), API key
- Cookie
- Thẻ thanh toán (PAN), CVV
- OTP/MFA code
- SSN/CCCD đầy đủ
- Session ID đầy đủ
- Private keys

### 13.3 Masking PII

```ts
function maskEmail(e: string){
  const [local, domain] = e.split('@');
  if(!domain) return '***';
  return local.slice(0,2) + '***@' + domain;
}

function maskPhone(p: string){
  return p.slice(0,3) + '****' + p.slice(-2);
}
```

### 13.4 Security Events cần alert

| Sự kiện | Ngưỡng gợi ý | Mức độ |
|---|---|---|
| Nhiều 401 liên tiếp từ 1 IP | > 20/5 phút | Medium-High |
| Nhiều 403 liên tiếp | > 10/5 phút | Medium |
| Brute force login | > 5 fails/IP hoặc > 10 fails/account | High |
| IDOR probing (truy cập nhiều ID khác nhau) | Pattern bất thường | High |
| 404 scan (`/.env`, `/admin`, `/.git`) | > 5/1 phút | Medium |
| Rate limit hit nhiều | Spike bất thường | Medium |
| Permission escalation attempt | Bất kỳ | **Critical** |
| Token reuse detected | Bất kỳ | **Critical** |
| Large payload/expensive query | Anomaly | Medium-High |

### 13.5 Observability

- **Logs**: structured JSON (JSONL), centralized (ELK/OpenSearch/Loki)
- **Metrics**: Prometheus (latency p50/p95/p99, error rate, RPS)
- **Tracing**: OpenTelemetry (trace request across services)
- **APM**: correlation requestId/traceId
- **SIEM**: tích hợp alerts

---

## 14. Bảo mật Third-party, OAuth 2.0, OIDC & Webhook

### 14.1 OAuth 2.0 Authorization Code + PKCE (khuyến nghị)

Dùng cho **public clients** (SPA, mobile). **Không dùng Implicit Flow**.

```text
1. Client tạo code_verifier (32 bytes random) → base64url
2. Tạo code_challenge = BASE64URLURLENCODE(SHA256(ASCII(code_verifier)))
3. Redirect đến /authorize?response_type=code&client_id=...&redirect_uri=...&scope=openid profile&state=...&code_challenge=...&code_challenge_method=S256
4. User đồng ý → auth server redirect về redirect_uri với code + state
5. Client verify state, POST /token với code, code_verifier, client_id, redirect_uri
6. Auth server verify PKCE → trả access_token, id_token, refresh_token
```

```ts
import crypto from "node:crypto";

function generatePKCE(){
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}
```

### 14.2 OAuth/OIDC Best Practices

| Lỗi thường gặp | Nguy hiểm | Phòng ngừa |
|---|---|---|
| `redirect_uri` linh động/open redirect | Code/token theft | **Allowlist exact** redirect_uri |
| Thiếu `state` | CSRF trong OAuth flow | Tạo state ngẫu nhiên, lưu session, verify |
| Thiếu PKCE (public client) | Authorization code interception | **Bắt buộc PKCE** S256 |
| `response_type=token` (Implicit) | Token lộ trong URL/history/log | Dùng Authorization Code + PKCE |
| Scope quá rộng | Excessive permission | Least privilege scope |
| Lưu token không an toàn (localStorage) | XSS steal | HttpOnly cookie hoặc secure storage, consider BFF pattern |
| Không validate `iss`/`aud` của id_token | Token substitution | Verify đầy đủ claims |

### 14.3 Webhook Security

```text
Nguyên tắc:
- Verify chữ ký (HMAC-SHA256)
- Verify timestamp (chống replay) — vd ±5 phút
- Dùng nonce + idempotency (xử lý trùng event)
- Trả 200/202 nhanh, xử lý async
- Không tin tưởng dữ liệu từ webhook để gọi URL tùy ý (SSRF)
- Rotate webhook secret
```

**HMAC verification (constant-time):**

```ts
import crypto from "node:crypto";

function verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string, toleranceSec=300){
  const ts = extractTimestamp(signature); // hoặc header x-timestamp
  if(Math.abs(Date.now()/1000 - ts) > toleranceSec) return false;
  
  const expected = crypto.createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  // Constant-time compare
  const a = Buffer.from(signature.replace('sha256=',''));
  const b = Buffer.from(expected);
  if(a.length !== b.length) return false;
  return crypto.timingSafeEqual(a,b);
}

// Express với raw body
app.post("/webhooks/partner", express.raw({type:'application/json'}), async (req,res)=>{
  const sig = req.headers['x-signature'] as string;
  if(!verifyWebhookSignature(req.body, sig, WEBHOOK_SECRET)) {
    return res.status(401).json({error:'Invalid signature'});
  }
  
  const event = JSON.parse(req.body.toString());
  // Idempotency
  if(await isProcessed(event.id)) return res.status(200).json({received:true});
  await markProcessed(event.id);
  
  // Process async
  queue.add(event);
  res.status(202).json({received:true});
});
```

---

## 15. Multi-tenancy, IDOR & Row-Level Authorization

### 15.1 Multi-tenancy patterns

| Pattern | Mô tả | Ưu | Nhược |
|---|---|---|---|
| **Shared DB, shared schema (discriminator)** | Tất cả tenant trong cùng bảng, filter by `tenant_id` | Đơn giản, cost thấp | Dễ quên filter → cross-tenant leak |
| **Shared DB, separate schema** | Mỗi tenant 1 schema | Cách ly tốt hơn | Migration phức tạp hơn |
| **Separate DB per tenant** | Hoàn toàn cách ly | An toàn nhất, dễ backup/scale riêng | Chi phí cao, ops phức tạp |

### 15.2 Ngăn Cross-Tenant Leak

```ts
// Middleware inject tenant context
app.use(authenticate, (req,res,next)=>{
  req.tenantId = req.user.orgId;
  next();
});

// LUÔN filter theo tenant
app.get("/orders", authenticate, async (req,res)=>{
  const orders = await db.orders.findMany({ 
    where: { 
      tenantId: req.tenantId,  // BẮT BUỘC
      customerId: req.user.id   // nếu customer scope
    } 
  });
  res.json(orders);
});

// Repository pattern với tenant scope
class OrderRepo {
  constructor(private db:any, private tenantId:string){}
  findById(id:string){
    return this.db.orders.findFirst({ where:{ id, tenantId: this.tenantId }});
  }
}
```

### 15.3 Row-Level Authorization (RLA/RLS)

**Postgres RLS example:**

```sql
-- Bật RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: chỉ xem order của tenant mình
CREATE POLICY tenant_isolation ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Policy: customer chỉ xem order của mình
CREATE POLICY customer_own_orders ON orders
  FOR SELECT
  USING (customer_id = current_setting('app.user_id')::uuid);

-- Set context per request
-- SET app.tenant_id = '...'; SET app.user_id = '...';
```

```ts
// Set context trước query
await db.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
await db.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`;
```

**Lưu ý:** Nếu dùng **service role/key** bypass RLS, phải tự enforce authorization cẩn thận.

---

## 16. File Upload Security

### 16.1 Nguyên tắc bảo vệ

| Rủi ro | Biện pháp |
|---|---|
| **Malicious file (webshell)** | Không lưu executable, validate MIME + magic bytes |
| **Path traversal** | Dùng `path.basename`, random filename |
| **XSS via SVG/HTML** | Không serve inline nếu không sanitize, dùng Content-Disposition: attachment |
| **Large file DoS** | Giới hạn size, rate limit upload |
| **Metadata leak (EXIF GPS)** | Strip EXIF cho ảnh public |
| **Storage abuse** | Scan virus/malware, quota per user |
| **Direct access** | Lưu ngoài webroot hoặc dùng signed URL + private bucket |

### 16.2 Validation

```ts
import fileType from 'file-type';
import path from 'node:path';
import crypto from 'node:crypto';

const ALLOWED = {
  'image/jpeg': ['jpg','jpeg'],
  'image/png':  ['png'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateUpload(file: Express.Multer.File){
  if(file.size > MAX_SIZE) throw new Error('File quá lớn');
  
  // Check magic bytes
  const type = await fileType.fromBuffer(file.buffer);
  if(!type || !ALLOWED[type.mime]) throw new Error('Loại file không được phép');
  
  // Kiểm tra extension khớp
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if(!ALLOWED[type.mime].includes(ext)) throw new Error('Extension không khớp');
  
  // Tạo tên ngẫu nhiên
  const safeName = `${crypto.randomUUID()}.${type.ext}`;
  return { safeName, mime: type.mime };
}
```

### 16.3 Lưu trữ an toàn

```text
- Lưu ngoài document root (/var/uploads) — không trực tiếp truy cập qua URL
- Dùng object storage (S3/GCS) với bucket private + presigned URL
- Set Content-Type đúng, Content-Disposition: attachment cho file nhạy cảm
- Scan với ClamAV/antivirus
- Disable execute permission
- Không cho user control path/filename
- Rate limit upload endpoint
- Virus scanning cho upload công khai
```

```ts
// Trả file an toàn
res.setHeader('Content-Type', file.mime);
res.setHeader('Content-Disposition', `attachment; filename="download.${ext}"`);
res.setHeader('X-Content-Type-Options', 'nosniff');
fs.createReadStream(safePath).pipe(res);
```

---

## 17. SSRF, Outbound Requests & Service-to-Service

### 17.1 SSRF Protection

```ts
import { URL } from 'node:url';
import dns from 'node:dns/promises';
import net from 'node:net';

const ALLOWLIST = new Set(['api.partner.com', 'cdn.example.com']);

function isPrivateIP(ip: string){
  // IPv4
  if(ip.startsWith('127.')) return true;
  if(ip.startsWith('10.')) return true;
  if(ip.startsWith('192.168.')) return true;
  if(/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if(ip.startsWith('169.254.')) return true; // link-local/cloud metadata
  if(ip === '0.0.0.0') return true;
  // IPv6
  if(ip === '::1') return true;
  if(ip.startsWith('fe80:')) return true;
  if(ip.startsWith('fc') || ip.startsWith('fd')) return true;
  return false;
}

export async function safeFetch(input: string){
  const url = new URL(input);
  
  // Chỉ HTTPS
  if(url.protocol !== 'https:') throw new Error('Chỉ cho phép HTTPS');
  
  // Allowlist host
  if(!ALLOWLIST.has(url.hostname)) throw new Error('Host không được phép');
  
  // DNS resolution + check IP
  const addresses = await dns.lookup(url.hostname, { all: true });
  for(const { address } of addresses){
    if(isPrivateIP(address)) throw new Error('IP nội bộ bị chặn');
  }
  
  // Fetch với timeout, không follow redirect tới internal
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 5000);
  
  try {
    const res = await fetch(url, { 
      redirect: 'manual',
      signal: controller.signal,
      headers: {'User-Agent': 'API-Client/1.0'}
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}
```

### 17.2 Service-to-Service Security

- **mTLS**: mutual authentication bằng client cert
- **Service tokens**: short-lived JWT với audience/service name
- **Network policies**: zero-trust, chỉ cho phép kết nối cần thiết
- **API Gateway internal**: rate limit + auth
- **Circuit breaker + timeout + retry with jitter**
- **No implicit trust**: luôn authenticate/authorize giữa services

```ts
// Service token
const serviceToken = jwt.sign(
  { sub: 'service-orders', aud: 'service-payments', scope: 'payments:charge' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '5m', issuer: 'internal-auth' }
);

fetch('http://payments.internal/charge', {
  headers: { 'Authorization': `Bearer ${serviceToken}` }
});
```

---

## 18. Threat Modeling, Secure SDLC & Incident Response

### 18.1 Threat Modeling (STRIDE + Attack Trees)

**Quy trình:**
1. **Define scope**: vẽ data flow diagram (DFD)
2. **Identify assets**: orders, payments, PII, tokens
3. **Identify threats**: áp dụng STRIDE
4. **Identify mitigations**: map với controls
5. **Validate**: review với security + engineering
6. **Document & update**: thường xuyên

### 18.2 Secure SDLC Checklist

| Giai đoạn | Hoạt động |
|---|---|
| **Requirements** | Security requirements, compliance, data classification |
| **Design** | Threat modeling, authz design, API contract review |
| **Implementation** | Secure coding, validation, secrets management |
| **Review** | Code review security-focused, SAST |
| **Test** | SAST/DAST, dependency scan, API security test, penetration test |
| **Deploy** | Secure config, secrets, IaC scan, image scan |
| **Operate** | Monitoring, logging, patching, incident response |
| **Retire** | Secure decommission, key rotation, data deletion |

### 18.3 Incident Response Plan

**Phases (NIST):**

1. **Preparation**: runbook, on-call, contacts, tools
2. **Detection & Analysis**: phát hiện alert, classify severity
3. **Containment**: cô lập (revoke tokens, block IP, disable endpoint)
4. **Eradication**: loại bỏ root cause, fix vuln
5. **Recovery**: khôi phục service, verify
6. **Post-Incident**: post-mortem blameless, lessons learned, improve controls

**Incident checklist:**
- [ ] Ghi nhận thời gian, người phát hiện
- [ ] Thu thập logs/evidence (preserve)
- [ ] Revoke compromised credentials/tokens
- [ ] Thông báo phù hợp (legal/compliance nếu có breach)
- [ ] Chứa rò rỉ
- [ ] Patch/fix
- [ ] Verify không còn IOC
- [ ] Post-mortem document

---

## 19. Checklist bảo mật API (OWASP API Top 10 2023)

```markdown
### API1 - Broken Object Level Authorization
- [ ] Kiểm tra ownership/tenant cho MỌI truy cập object
- [ ] Filter bằng userId/orgId trong query, không chỉ client gửi
- [ ] Trả 404 thay 403 khi cần ẩn sự tồn tại
- [ ] Dùng ID không dễ đoán (UUID/ULID)
- [ ] Test IDOR với user khác

### API2 - Broken Authentication
- [ ] Password hash mạnh (Argon2id/bcrypt)
- [ ] JWT verify với algorithms whitelist
- [ ] Access token ngắn (10-15m), refresh rotation
- [ ] Rate limit login/password reset
- [ ] Chống user enumeration
- [ ] MFA cho tài khoản nhạy cảm
- [ ] Secure session/cookie

### API3 - Broken Object Property Level Authorization
- [ ] Allowlist input fields (chống mass assignment)
- [ ] Allowlist/DTO output (chống excess data exposure)
- [ ] Không trả passwordHash, internal flags
- [ ] Validate schema chặt chẽ

### API4 - Unrestricted Resource Consumption
- [ ] Rate limiting per user/IP/key
- [ ] Pagination max limit
- [ ] Body size limit
- [ ] Timeout cho outbound
- [ ] Query complexity/depth limit
- [ ] File upload size limit

### API5 - Broken Function Level Authorization
- [ ] Authz check per route × method
- [ ] Default deny
- [ ] Admin endpoints riêng biệt
- [ ] Không dựa vào "hidden URL"

### API6 - Unrestricted Access to Sensitive Business Flows
- [ ] Business rules ở server
- [ ] Velocity/fraud checks
- [ ] Step-up auth cho hành động quan trọng
- [ ] Idempotency cho payment/critical actions
- [ ] Anti-automation khi cần

### API7 - Server Side Request Forgery
- [ ] Allowlist outbound hosts/IP
- [ ] Block private/reserved/metadata IPs
- [ ] DNS rebinding protection
- [ ] Chỉ HTTPS, redirect manual
- [ ] Timeout

### API8 - Security Misconfiguration
- [ ] Security headers đầy đủ
- [ ] CORS allowlist
- [ ] Tắt debug/thông tin server
- [ ] HTTPS/HSTS
- [ ] Least privilege infra
- [ ] Secure defaults

### API9 - Improper Inventory Management
- [ ] API inventory/catalog
- [ ] Versioning + deprecation/sunset
- [ ] Tắt/retire endpoint cũ
- [ ] Authz cho mọi endpoint
- [ ] Documentation cập nhật

### API10 - Unsafe Consumption of APIs
- [ ] Validate response từ third-party
- [ ] Timeout/retry/circuit breaker
- [ ] Không forward blind
- [ ] mTLS khi cần
- [ ] Least privilege
```

**Bổ sung:**
```markdown
- [ ] Input validation toàn diện
- [ ] Parameterized queries/ORM
- [ ] Secrets không trong repo (scan)
- [ ] Logging không chứa secrets/PII
- [ ] Audit log cho hành động nhạy cảm
- [ ] Dependency scan trong CI
- [ ] Error handling không lộ stack trace
- [ ] File upload bảo mật
- [ ] mTLS/service-to-service auth
```

---

## 20. Kiểm thử bảo mật API

### 20.1 Công cụ

| Công cụ | Mục đích | Ghi chú |
|---|---|---|
| **OWASP ZAP** | Automated scan (baseline/active) | Miễn phí, mạnh |
| **Burp Suite** | Intercept, manual testing, intruder | Community/Pro |
| **Postman/Insomnia** | Authorization matrix testing | Thủ công có hệ thống |
| **schemathesis** | Property-based fuzzing theo OpenAPI | Tốt để tìm edge case |
| **Dredd** | Contract testing | Đảm bảo impl khớp spec |
| **Nuclei** | Template-based scanning | Nhanh, cộng đồng lớn |
| **sqlmap** | SQLi testing | **Chỉ test trên môi trường được phép** |
| **gitleaks/truffleHog** | Secret scanning | Pre-commit/CI |
| **trivy/grype** | Dependency/container scan | CI/CD |

### 20.2 Authorization Matrix Test

Với mỗi endpoint quan trọng, test với các actor:

```text
Actors: anonymous, customer_A, customer_B, support, admin

Test cases:
- GET /orders/:id (owner vs non-owner) → 404/403 đúng
- PUT/PATCH /customers/:id → chỉ owner/admin
- DELETE /orders/:id → permission check
- POST /admin/* → chỉ admin
- Mass assignment: thêm field nhạy cảm → bị ignore
- Cross-tenant: truy cập resource tenant khác → 404
```

### 20.3 Security Test Checklist Thủ công

```markdown
- [ ] Auth bypass (thiếu token, token sai)
- [ ] IDOR/BOLA
- [ ] Mass assignment
- [ ] Privilege escalation
- [ ] JWT alg confusion
- [ ] Rate limit bypass
- [ ] SQL/NoSQL/Command injection
- [ ] SSRF
- [ ] File upload bypass
- [ ] CORS misconfig
- [ ] Security headers
- [ ] Error disclosure
- [ ] Business logic flaws
```

### 20.4 CI Security Gate

```yaml
# .github/workflows/api-security.yml
name: API Security Checks
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: npm ci
      - name: Dependency audit
        run: npm audit --production --audit-level=high
      - name: Secret scan
        uses: gitleaks/gitleaks-action@v2
      - name: SAST (optional)
        uses: github/codeql-action/analyze@v3
      - name: Container scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          severity: CRITICAL,HIGH
          exit-code: 1
      - name: Type check & tests
        run: npm run typecheck && npm test
```

---

## 21. Ví dụ ứng dụng thực tế: Hardening Orders/Customers API

Domain trung lập: **customers, products, orders, order_items, payments, shipments**. Sử dụng UUID, integer minor units, RFC 3339 UTC.

### 21.1 Middleware Stack (thứ tự quan trọng)

```ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

const app = express();

// 1. Trust proxy
app.set("trust proxy", 1);
app.disable("x-powered-by");

// 2. Security headers
app.use(helmet());

// 3. CORS
app.use(cors(getCorsOptions()));

// 4. Body parsing với limit
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 5. Compression
app.use(compression());

// 6. Request ID
app.use(requestId());

// 7. Rate limiting toàn cục
app.use("/api", globalLimiter);

// 8. Routes
// ...
```

### 21.2 Tạo đơn hàng an toàn

```ts
const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(20),
  shippingAddressId: z.string().uuid(),
  notes: z.string().trim().max(500).optional(),
});

app.post("/api/v1/orders",
  authenticate,
  validate(CreateOrderSchema),
  limiter({ cap: 10, refill: 10/3600 }), // 10 đơn/giờ
  async (req, res, next) => {
    const userId = req.user!.id;
    const body = req.body;
    
    try {
      // Kiểm tra tồn tại & ownership của địa chỉ
      const addr = await db.addresses.findFirst({ 
        where: { id: body.shippingAddressId, customerId: userId } 
      });
      if (!addr) return res.status(400).json({ error: "Địa chỉ không hợp lệ" });
      
      // Kiểm tra tồn kho sản phẩm
      for (const item of body.items) {
        const product = await db.products.findById(item.productId);
        if (!product || product.stock < item.quantity) {
          return res.status(409).json({ error: "Sản phẩm không đủ tồn kho" });
        }
      }
      
      // Tạo đơn trong transaction
      const order = await db.$transaction(async (tx) => {
        // Tạo order
        const order = await tx.orders.create({
          data: {
            id: crypto.randomUUID(),
            customerId: userId,
            status: "pending",
            total: calculateTotal(body.items), // tính server-side
            shippingAddressSnapshot: addr, // snapshot
          },
        });
        
        // Tạo order_items
        await tx.orderItems.createMany({ data: body.items.map(i => ({...i, orderId: order.id})) });
        
        // Trừ tồn kho
        for (const item of body.items) {
          await tx.products.update(item.productId, { stock: { decrement: item.quantity } });
        }
        
        return order;
      });
      
      await auditLog({ actor: userId, action: "order.create", target: order.id, ip: req.ip });
      res.status(201).location(`/api/v1/orders/${order.id}`).json(toOrderDto(order));
    } catch (e) {
      next(e);
    }
  }
);
```

### 21.3 Lấy đơn hàng với ownership check

```ts
app.get("/api/v1/orders/:id", authenticate, async (req, res, next) => {
  try {
    const order = await db.orders.findFirst({
      where: { id: req.params.id, customerId: req.user!.id }, // filter by owner
      include: { items: true }
    });
    
    if (!order) return res.status(404).json({ error: "Not found" });
    
    res.json(toOrderDto(order));
  } catch (e) {
    next(e);
  }
});
```

### 21.4 Error Handler tập trung

```ts
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  // Log server-side (không lộ client)
  logger.error({
    err: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    requestId,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });
  
  // Zod validation
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', requestId, details: err.errors });
  }
  
  // Don't leak
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Internal server error', requestId });
  }
  
  res.status(500).json({ error: err.message, requestId, stack: err.stack });
});
```

---

## 22. Anti-patterns

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| "Frontend ẩn nút nên an toàn" | Luôn kiểm tra authz ở server |
| JWT verify không whitelist algorithm | `algorithms: ["RS256"]` hoặc EdDSA |
| Lưu mật khẩu plain/hash MD5/SHA256 | Argon2id/bcrypt |
| CORS `*` + credentials | Allowlist chính xác |
| Trả stack trace cho client | Log server, trả message chung |
| Log toàn bộ request body | Filter/redact secrets/PII |
| So sánh secret bằng `===` | `crypto.timingSafeEqual` |
| `SELECT *` trả mọi field | DTO/allowlist fields |
| Không rate limit auth endpoints | Aggressive limit + backoff |
| Secret trong repo/env commit | Secret manager + gitleaks |
| Tự viết crypto | Dùng `crypto` built-in/lib chuẩn |
| Trust `X-Forwarded-For` blind | `trust proxy` đúng + validate |
| 401/403/404 nhầm lẫn | Dùng đúng semantics |
| Bỏ qua IDOR/BOLA | Ownership check bắt buộc |
| Mass assignment | Input allowlist |
| File upload không validate | MIME+magic bytes+random name |
| SSRF không bảo vệ | Allowlist+DNS check+block private |
| Không idempotency cho payment | Idempotency-Key |
| Debug endpoint prod | Tắt/xóa hoặc bảo vệ mạnh |

---

## 23. Tài liệu tham khảo

### Chuẩn & Guidelines
- **OWASP API Security Top 10 (2023)**: [https://owasp.org/API-Security/editions/2023/en/0x11-t10/](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- **OWASP Cheat Sheet Series**: [https://cheatsheetseries.owasp.org/](https://cheatsheetseries.owasp.org/)
- **OWASP Web Security Testing Guide**: [https://owasp.org/www-project-web-security-testing-guide/](https://owasp.org/www-project-web-security-testing-guide/)
- **NIST SP 800-63B**: [https://pages.nist.gov/800-63-3/sp800-63b.html](https://pages.nist.gov/800-63-3/sp800-63b.html)
- **NIST SP 800-207 (Zero Trust)**: [https://www.nist.gov/publications/zero-trust-architecture](https://www.nist.gov/publications/zero-trust-architecture)

### RFCs
- **RFC 6749 OAuth 2.0**: [https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749)
- **RFC 7636 PKCE**: [https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636)
- **RFC 7519 JWT**: [https://www.rfc-editor.org/rfc/rfc7519](https://www.rfc-editor.org/rfc/rfc7519)
- **RFC 8725 JWT BCP**: [https://www.rfc-editor.org/rfc/rfc8725](https://www.rfc-editor.org/rfc/rfc8725)
- **RFC 7807/9457 Problem Details**: [https://www.rfc-editor.org/rfc/rfc9457](https://www.rfc-editor.org/rfc/rfc9457)
- **RFC 8446 TLS 1.3**: [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)

### Thực tế & Tools
- **PortSwigger Web Security Academy**: [https://portswigger.net/web-security](https://portswigger.net/web-security)
- **API Security Fundamentals**: [https://apisecurity.io/](https://apisecurity.io/)
- **OWASP ZAP**: [https://www.zaproxy.org/](https://www.zaproxy.org/)
- **gitleaks**: [https://github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks)
- **trivy**: [https://github.com/aquasecurity/trivy](https://github.com/aquasecurity/trivy)

### Liên quan trong repo
- [restful-api.md](./restful-api.md) — Quy chuẩn thiết kế RESTful API
- [openapi.yaml](./openapi.yaml) — OpenAPI specification
- [websocket.md](../realtime/websocket.md) — Bảo mật WebSocket
- [grpc.md](../network/grpc.md) — Bảo mật gRPC

---

*Tài liệu này tập trung vào nguyên tắc bảo mật độc lập với stack cụ thể, áp dụng được cho Express/Fastify/NestJS, FastAPI/Django/Flask, Spring Boot, Go (Gin/Echo), v.v. Luôn điều chỉnh theo ngữ cảnh, rủi ro và yêu cầu tuân thủ của dự án.*
