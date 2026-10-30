# WebSocket — Kiến thức toàn diện từ cơ bản đến nâng cao

> Tài liệu tham khảo đầy đủ về WebSocket: nguyên lý hoạt động, giao thức, kiến trúc,
> bảo mật, scaling, mã nguồn ví dụ (Node.js/TypeScript, Python, Go) và các mẫu thiết kế
> thực tế. Ví dụ dùng domain **orders/notifications** để minh hoạ, không phụ thuộc một
> backend cụ thể.

---

## Mục lục

1. [WebSocket là gì?](#1-websocket-là-gì)
2. [Vì sao cần WebSocket? HTTP không đủ sao?](#2-vì-sao-cần-websocket-http-không-đủ-sao)
3. [Lịch sử & tiêu chuẩn](#3-lịch-sử--tiêu-chuẩn)
4. [Handshake — quá trình thiết lập kết nối](#4-handshake--quá-trình-thiết-lập-kết-nối)
5. [Cấu trúc khung tin (Frame) của WebSocket](#5-cấu-trúc-khung-tin-frame-của-websocket)
6. [Các loại nút (Opcode) & Control Frames](#6-các-loại-nút-opcode--control-frames)
7. [Mã hóa & bảo mật: wss://](#7-mã-hóa--bảo-mật-wss)
8. [Xác thực (Authentication) cho WebSocket](#8-xác-th-authentication-cho-websocket)
9. [Kiến trúc Server: từ single connection đến cluster](#9-kiến-trúc-server-từ-single-connection-đến-cluster)
10. [Pub/Sub & Redis Adapter để scale](#10-pubsub--redis-adapter-để-scale)
11. [Quản lý kết nối, heartbeat, reconnect](#11-quản-lý-kết-nối-heartbeat-reconnect)
12. [Nhận diện & phân loại client (Rooms/Channels)]#12-nhận-diện--phân-loại-client-roomschannels)
13. [Xử lý lỗi & trạng thái kết nối](#13-xử-lý-lỗi--trạng-thái-kết-nối)
14. [Mẫu tin nhắn (Message Protocol) & Serialization](#14-mẫu-tin-nhắn-message-protocol--serialization)
15. [Rate limiting & chống lạm dụng](#15-rate-limiting--chống-lạm-dụng)
16. [WebSocket vs các giải pháp thay thế](#16-websocket-vs-các-giải-pháp-thay-thế)
17. [Bảo mật WebSocket — checklist đầy đủ](#17-bảo-mật-websocket--checklist-đầy-đủ)
18. [Presence & trạng thái online](#18-presence--trạng-thái-online)
19. [Delivery guarantees, ordering & idempotency](#19-delivery-guarantees-ordering--idempotency)
20. [Backpressure & flow control](#20-backpressure--flow-control)
21. [Testing, observability & load testing](#21-testing-observability--load-testing)
22. [Ví dụ dự án thực tế: Order Notifications Realtime](#22-ví-dụ-dự-án-thực-tế-order-notifications-realtime)
23. [Debugging & công cụ hỗ trợ](#23-debugging--công-cụ-hỗ-trợ)
24. [Anti-patterns thường gặp](#24-anti-patterns-thường-gặp)
25. [Tài liệu tham khảo](#25-tài-liệu-tham-khảo)

---

## 1. WebSocket là gì?

**WebSocket** (RFC 6455) là giao thức truyền thông **hai chiều (full-duplex)** chạy trên
một **kết nối TCP duy nhất**, cho phép cả **client** và **server** chủ động gửi dữ liệu
cho nhau mà không cần client phải hỏi lại (khác HTTP request/response).

Đặc điểm cốt lõi:

| Đặc điểm | Mô tả |
|---|---|
| Full-duplex | Cả hai phía gửi/nhận đồng thời |
| Một kết nối TCP | Giữ nguyên sau khi handshake xong |
| Ít overhead | Frame chỉ 2–14 byte header (so với HTTP header hàng trăm byte) |
| Push từ server | Server chủ động gửi dữ liệu (không cần long-polling) |
| Origin-based security | Handshake có header `Origin` để server kiểm tra |
| Text + Binary | Truyền được cả văn bản (UTF-8) và dữ liệu nhị phân |

**Các trường hợp sử dụng phổ biến:**
- Chat, tin nhắn real-time (Slack, Zalo, Facebook Messenger)
- Cập nhật bảng điểm / tài chính (stock ticker)
- Game multiplayer real-time
- Collaborative editing (Google Docs, Figma comments)
- Thông báo (notification), badge đồng bộ
- IoT telemetry (nhận dữ liệu cảm biến liên tục)
- Live comment / reaction trên livestream
- Theo dõi trạng thái đơn hàng, tồn kho hoặc giá sản phẩm theo thời gian thực
- Presence (ai đang online), typing indicator, trạng thái tài xế/giao vận

---

## 2. Vì sao cần WebSocket? HTTP không đủ sao?

### 2.1 Các kỹ thuật "giả lập" real-time trên HTTP

```
1. Short Polling   : client hỏi đi hỏi lại mỗi 1s        → lãng phí, chậm
2. Long Polling    : server giữ request cho đến khi có dữ liệu → tốt hơn nhưng vẫn 1 request/message
3. Server-Sent Events (SSE): server push 1 chiều (server → client), dựa trên HTTP
4. WebSocket       : hai chiều, 1 kết nối duy nhất      → tối ưu nhất cho 2 chiều
```

### 2.2 So sánh chi tiết

```
Short Polling (10 tin nhắn trong 10 giây):
Client: GET /messages  → 404, GET → 404, GET → 404 ...  (10 request, 9 lần rỗng)

Long Polling:
Client: GET /messages (treo 30s) → server trả khi có tin → client kết nối lại ngay
        (1 request liên tục, nhưng vẫn phải mở lại sau mỗi lần)

SSE:
Server ──HTTP chunk──▶ Client   (chỉ 1 chiều; nếu cần gửi lên phải kèm 1 HTTP request)

WebSocket:
Client ◀════ TCP ════▶ Server   (cả 2 chiều, không overhead mỗi lần)
```

### 2.3 Khi nào KHÔNG cần WebSocket?

- API CRUD thông thường (REST vẫn là lựa chọn tốt).
- Dữ liệu ít thay đổi, không cần push.
- Môi trường có proxy/firewall chặn WebSocket (nhiều hạ tầng cũ).
- Khi SSE đủ dùng (chỉ cần server push 1 chiều như báo giá, log stream).

---

## 3. Lịch sử & tiêu chuẩn

| Năm | Sự kiện |
|---|---|
| 2008 | Đề xuất ban đầu bởi WhatWG (trong HTML5) |
| 2009 | Opera giới thiệu triển khai đầu tiên |
| 2011 | **RFC 6455** — chuẩn WebSocket chính thức do IETF phát hành |
| 2011 | Hixie-76 / HyBi-00 (phiên bản cũ, còn gặp ở server legacy) |
| Nay | Hỗ trợ bởi mọi trình duyệt hiện đại, HTTP/2 & HTTP/3 đều tương thích |

Tiêu chuẩn lõi:
- **RFC 6455**: The WebSocket Protocol
- **RFC 7692**: Compression Extensions for WebSocket (permessage-deflate)
- **RFC 8441**: Bootstrapping WebSockets with HTTP/2

---

## 4. Handshake — quá trình thiết lập kết nối

### 4.1 Client gửi Upgrade Request

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Extensions: permessage-deflate
```

Giải thích từng header:

| Header | Vai trò |
|---|---|
| `Upgrade: websocket` | Báo muốn nâng cấp giao thức |
| `Connection: Upgrade` | Bắt buộc kèm theo (cũ hơn dùng `Connection: keep-alive, Upgrade`) |
| `Sec-WebSocket-Key` | Chuỗi ngẫu nhiên 16 byte, base64 — server dùng để chứng minh |
| `Sec-WebSocket-Version: 13` | Phiên bản WebSocket (luôn là 13) |
| `Origin` | Gốc của trang web gọi kết nối — server kiểm tra chống CSRF |
| `Sec-WebSocket-Protocol` | Danh sách sub-protocol mong muốn (chọn 1) |
| `Sec-WebSocket-Extensions` | Extension mong muốn (ví dụ nén) |

### 4.2 Server phản hồi 101

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

### 4.3 Tính toán `Sec-WebSocket-Accept`

```text
GUID đặc biệt = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

Accept = Base64( SHA1( client_key + GUID ) )
```

**Ví dụ JavaScript:**

```js
import crypto from "node:crypto";

const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const clientKey = "dGhlIHNhbXBsZSBub25jZQ==";

const accept = crypto
  .createHash("sha1")
  .update(clientKey + GUID)
  .digest("base64");

console.log(accept); // "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
```

**Tại sao cần GUID?** — Chứng minh server hiểu đúng giao thức WebSocket (không phải
HTTP server ngẫu nhiên nào cũng phản hồi đúng), và gắn kết response với request cụ thể.

> ⚠️ **Lưu ý bảo mật**: `Sec-WebSocket-Key` KHÔNG phải là khóa mã hóa. Nó chỉ là
> nonce chống cache/confusion. **Bảo mật thực sự đến từ TLS (`wss://`)**.

### 4.4 Handshake thất bại — đọc log thế nào

| Triển khai server | Status khi từ chối | Dấu hiệu |
|---|---|---|
| Đúng chuẩn | `400`, `401`, `403`, `404` | Client nhận HTTP error, không có `101` |
| Sai `Sec-WebSocket-Accept` | `101` rồi đóng ngay | Browser báo lỗi handshake, frame đầu không tới |
| Thiếu `Upgrade`/`Connection` | `400` | Proxy có thể đã strip header |
| `Sec-WebSocket-Version` khác 13 | `426 Upgrade Required` + `Sec-WebSocket-Version: 13` | Chỉ gặp ở client cũ/IoT |
| Proxy không hỗ trợ upgrade | `200` HTML hoặc `502` | Kiểm tra `X-Forwarded-*`, cấu hình proxy |

Checklist debug handshake:

1. `curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" https://host/ws`
   phải trả `101`.
2. Nếu qua Nginx: cần `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";` và `proxy_read_timeout` đủ lớn.
3. Nếu qua Cloudflare/ALB: kiểm tra idle timeout (thường 60s) — heartbeat phải ngắn hơn.
4. Nếu browser báo `403` ngay: thường do `Origin` allowlist hoặc cookie `SameSite`.
5. Nếu Node nhận `req.headers.upgrade` rỗng: có middleware/proxy đã xử lý request trước đó.

---

## 5. Cấu trúc khung tin (Frame) của WebSocket

Sau handshake, mọi dữ liệu trao đổi đều nằm trong các **frame**:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (nếu len = 126/127)        |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+-------------------------------+
|     Extended payload length continued, if payload len == 126  |
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

| Field | Bit | Ý nghĩa |
|---|---|---|
| `FIN` | 1 | 1 = đây là frame cuối cùng của thông điệp (fragmentation) |
| `RSV1-3` | 3 | Dùng cho extensions (ví dụ RSV1 = 1 khi permessage-deflate) |
| `Opcode` | 4 | Loại frame (xem mục 6) |
| `MASK` | 1 | 1 = payload bị mask (bắt buộc với client → server) |
| `Payload len` | 7 | Độ dài payload: <126 → dùng trực tiếp; 126 → 16 bit kế; 127 → 64 bit kế |
| `Masking-Key` | 32 | Khóa mask 4 byte (chỉ có khi MASK=1) |
| `Payload Data` | — | Dữ liệu thực sự |

### 5.1 Masking (chống cache poisoning)

Client **bắt buộc** mask frame gửi lên server:

```text
maskedByte = originalByte XOR maskKey[i % 4]
```

**Tại sao chỉ client mask, server không mask?**
- Ngăn **proxy cache poisoning**: dữ liệu ngẫu nhiên (do XOR) không thể bị nhầm lẫn
  với HTTP response trong cache chung.
- Server không mask vì attacker không kiểm soát được browser (không thể ép browser
  gửi frame không mask → không có gì để chống).

**Ví dụ mask trong Node.js:**

```js
function maskPayload(payload, key) {
  const buf = Buffer.from(payload);
  for (let i = 0; i < buf.length; i++) {
    buf[i] ^= key[i % 4];
  }
  return buf;
}

const key = crypto.randomBytes(4);
console.log(maskPayload("hello", key));
```

### 5.2 Fragmentation (chia nhỏ thông điệp)

Thông điệp lớn (> frame size của OS) được chia thành nhiều frame:
- Frame đầu: `FIN=0, opcode=0x1 (text)` hoặc `0x2 (binary)`
- Frame tiếp: `FIN=0, opcode=0x0 (continuation)`
- Frame cuối: `FIN=1, opcode=0x0`

```text
[FIN=0, TEXT, "Hello "] [FIN=0, CONT, "World"] [FIN=1, CONT, "!"]
                 ──── receiver ghép lại thành "Hello World!" ────
```

### 5.3 Những cạm bẫy ở tầng frame

| Cạm bẫy | Hậu quả | Cách tránh |
|---|---|---|
| Gửi frame > `maxPayload` | Server đóng `1009` | Chunk dữ liệu hoặc tăng giới hạn có kiểm soát |
| Text frame chứa byte không phải UTF-8 | Đóng `1007` | Encode đúng; binary dùng opcode `0x2` |
| Client gửi frame không mask | Server phải đóng `1002` | Dùng thư viện chuẩn, không tự viết frame |
| Control frame > 125 byte | Vi phạm RFC | Ping/pong chỉ chứa metadata nhỏ |
| Fragment control frame | Vi phạm RFC | Control frame luôn `FIN=1` |
| Bật RSV bit khi không negotiate extension | `1002` | Chỉ bật sau khi handshake đồng ý |
| Giả định 1 `message` = 1 frame | Xử lý sai message lớn | Thư viện thường ghép sẵn; nếu tự viết phải ghép |
| Không giới hạn tổng message sau fragmentation | Memory DoS | Giới hạn tổng byte và số fragment |

> 💡 `ws` (Node.js) và hầu hết thư viện đã xử lý masking, fragmentation, UTF-8 validation.
> Chỉ tự viết parser khi thật sự cần (IoT, embedded) và luôn chạy bộ test RFC 6455
> (Autobahn TestSuite).

---

## 6. Các loại nút (Opcode) & Control Frames

### Data Frames

| Opcode | Tên | Mô tả |
|---|---|---|
| `0x0` | Continuation | Tiếp tục frame trước (fragmentation) |
| `0x1` | Text | Payload là UTF-8 text |
| `0x2` | Binary | Payload là dữ liệu nhị phân |

### Control Frames

| Opcode | Tên | Mô tả |
|---|---|---|
| `0x8` | Close | Đóng kết nối (kèm mã lý do 2 byte) |
| `0x9` | Ping | Gửi ping (heartbeat) |
| `0xA` | Pong | Trả lời ping |

**Quy tắc Control Frames:**
- Payload ≤ **125 byte**
- Không được fragment
- Server **phải** trả lời Pong khi nhận Ping (nếu kết nối còn mở)

### Close Codes phổ biến (RFC 6455 §7.4)

| Mã | Ý nghĩa |
|---|---|
| 1000 | Normal closure — đóng bình thường |
| 1001 | Going away — server/browser đóng (đổi trang, tắt app) |
| 1002 | Protocol error |
| 1003 | Unsupported data (ví dụ server nhận binary nhưng chỉ nhận text) |
| 1006 | **Abnormal closure** — mất kết nối (không được dùng khi gửi, chỉ ghi nhận) |
| 1007 | Invalid payload (text không phải UTF-8) |
| 1008 | Policy violation |
| 1009 | Message too big |
| 1011 | Internal server error |
| 4000–4999 | Phạm vi riêng của ứng dụng (vd: `4001` = token hết hạn, `4003` = bị kick) |

---

## 7. Mã hóa & bảo mật: wss://

### 7.1 ws vs wss

```
ws://  → không mã hóa  (tương đương http://)
wss:// → mã hóa TLS    (tương đương https://)   ← BẮT BUỘC cho production
```

- Handshake của `wss://` chạy **bên trong TLS**, tức toàn bộ HTTP upgrade + mọi frame
  sau đó đều được mã hóa.
- Trình duyệt **bắt buộc** dùng `wss://` khi trang web đang ở `https://`
  (**Mixed Content** sẽ chặn `ws://`).

### 7.2 Mã hóa server (Node.js + TypeScript)

```ts
import { WebSocketServer } from "ws";
import fs from "node:fs";
import https from "node:https";

const server = https.createServer({
  key: fs.readFileSync("./certs/privkey.pem"),
  cert: fs.readFileSync("./certs/fullchain.pem"),
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket, req) => {
  console.log("Kết nối mới từ", req.socket.remoteAddress);
  socket.send(JSON.stringify({ type: "welcome", msg: "Đã kết nối" }));
});

server.listen(443);
```

### 7.3 Client kết nối (browser)

```ts
const proto = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${proto}://${location.host}/ws`);

ws.onopen = () => ws.send(JSON.stringify({ type: "join", room: "lobby" }));
ws.onmessage = (e) => console.log("Nhận:", JSON.parse(e.data));
ws.onclose = (e) => console.log("Đóng:", e.code, e.reason);
ws.onerror = () => console.log("Lỗi kết nối");
```

### 7.4 Client kết nối có token (Node.js)

```ts
import WebSocket from "ws";

const ws = new WebSocket("wss://api.example.com/ws", {
  headers: {
    Authorization: "Bearer <JWT>",
    "Origin": "https://myapp.com",
  },
});

// Trong môi trường không có Origin (Node), vẫn có thể giả lập để pass server check
```

### 7.5 Dùng cookie/session (same-site)

```ts
import WebSocket from "ws";

const ws = new WebSocket("wss://api.example.com/ws", {
  headers: { Cookie: "session=s%3Aabc123..." },
});
```

---

## 8. Xác thực (Authentication) cho WebSocket

> **Vấn đề cốt lõi**: handshake WebSocket không phải là AJAX — ta không easily set
> header tùy ý từ browser. Có 3 cách chính:

### Cách 1 — Token trong query string (nhanh, nhưng cẩn thận log URL)

```ts
// Client
const ws = new WebSocket(`wss://api.example.com/ws?token=${jwt}`);
```

```ts
// Server
wss.on("connection", async (socket, req) => {
  const url = new URL(req.url!, `https://${req.headers.host}`);
  const token = url.searchParams.get("token");

  try {
    const payload = await verifyJwt(token!);       // ✅ verify chữ ký + exp
    (socket as any).user = payload;
    socket.send(JSON.stringify({ type: "auth", ok: true }));
  } catch {
    socket.close(4001, "Token không hợp lệ");      // ❌ đóng ngay
  }
});
```

> ⚠️ **Rủi ro**: URL thường bị ghi vào access log, proxy log. **Giải pháp**: dùng
> short-lived token (60s) chỉ cho handshake, hoặc chuyển sang cookie.

### Cách 2 — Token trong Sec-WebSocket-Protocol (không bị log URL)

Trình duyệt cho đặt **sub-protocol** dạng chữ:

```ts
// Client — gửi nguyên token làm sub-protocol
const ws = new WebSocket("wss://api.example.com/ws", ["auth", `jwt.${token}`]);
```

```ts
// Server — đọc từ req.headers["sec-websocket-protocol"]
wss.on("connection", (socket, req) => {
  const raw = req.headers["sec-websocket-protocol"] ?? "";
  const parts = raw.split(",").map((s) => s.trim());
  const token = parts.find((p) => p.startsWith("jwt."))?.slice(4);

  // Server PHẢI echo lại đúng sub-protocol đã chọn
  if (token) socket.send(...);
});
```

> ⚠️ Hạn chế: token không được chứa dấu phẩy hoặc ký tự đặc biệt của header.

### Cách 3 — Cookie / Session (khuyến nghị cho web app có đăng nhập)

```ts
// Server (dùng cookie-parser hoặc parse tay)
import { parse as parseCookie } from "cookie";
import { verifySession } from "./auth";

wss.on("connection", async (socket, req) => {
  const cookies = parseCookie(req.headers.cookie ?? "");
  const session = await verifySession(cookies["sid"]);
  if (!session) return socket.close(4001, "Chưa đăng nhập");
  (socket as any).user = session;
});
```

```ts
// Client — trình duyệt tự động gửi cookie cùng origin
const ws = new WebSocket(`wss://${location.host}/ws`);
```

**Lưu ý thêm:**
- **Origin check** — kiểm tra `req.headers.origin` chống WebSocket Hijacking:

```ts
const ALLOWED = new Set(["https://app.example.com"]);

wss.on("connection", (socket, req) => {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED.has(origin)) {
    return socket.close(4003, "Origin không được phép");
  }
});
```

- **Re-auth định kỳ**: token có thể hết hạn trong khi kết nối vẫn mở. Nên đặt timer
  kiểm tra lại định kỳ, hoặc server gửi `{type:"auth:refresh"}` khi cần.

---

## 9. Kiến trúc Server: từ single connection đến cluster

### 9.1 Đơn giản — 1 process, tất cả kết nối trong RAM

```ts
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map<string, WebSocket>();   // userId → socket

wss.on("connection", (ws) => {
  const userId = crypto.randomUUID();
  clients.set(userId, ws);

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    broadcast({ ...msg, from: userId, at: Date.now() });
  });

  ws.on("close", () => clients.delete(userId));
});

function broadcast(payload: unknown) {
  const data = JSON.stringify(payload);
  for (const socket of clients.values()) {
    if (socket.readyState === WebSocket.OPEN) socket.send(data);
  }
}
```

**Giới hạn**: chỉ 1 process → không thể ngang hàng (horizontal scaling).

### 9.2 Multi-process với PM2 / Node cluster

```js
// cluster.js
import cluster from "node:cluster";
import os from "node:os";
import { setupPrimary } from "@socket.io/cluster-adapter";

if (cluster.isPrimary) {
  setupPrimary();
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  await import("./server.ts");
}
```

### 9.3 Đa vùng (Multi-node) — cần Pub/Sub chung

Xem mục 10.

---

## 10. Pub/Sub & Redis Adapter để scale

**Vấn đề**: khi chạy nhiều instance, client A kết nối vào node 1 nhưng client B vào
node 2 → node 1 không thể gửi trực tiếp cho B. **Giải pháp**: dùng message broker
(Redis) làm kênh trung gian.

```text
                    ┌──────────────┐
  Client A ──WS──▶  │  Node 1      │
                    └──────┬───────┘
                           │ PUBLISH ws:room:lobby
                    ┌──────▼───────┐      ┌─────────┐
                    │   Redis      │◀────▶│ Node 2  │──WS──▶ Client B
                    │  Pub/Sub     │      └─────────┘
                    └──────────────┘
```

**Ví dụ với Socket.IO + Redis adapter:**

```ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);

const io = new Server(httpServer, {
  adapter: createAdapter(pub, sub),
});

io.on("connection", (socket) => {
  socket.join("lobby");
  socket.on("chat", (m) => io.to("lobby").emit("chat", m)); // tự lan ra mọi node
});
```

**Ví dụ tự viết với raw WebSocket + Redis:**

```ts
import { createClient } from "redis";

const redis = createClient();
await redis.connect();
const sub = redis.duplicate();
await sub.subscribe("ws:broadcast", (raw) => {
  const { target, payload } = JSON.parse(raw);
  const socket = clients.get(target);
  if (socket?.readyState === WebSocket.OPEN) socket.send(payload);
});

// Khi muốn gửi tới user ở node bất kỳ:
async function sendToUser(userId: string, payload: unknown) {
  const local = clients.get(userId);
  if (local) return local.send(JSON.stringify(payload));
  await redis.publish("ws:broadcast", JSON.stringify({ target: userId, payload }));
}
```

**Các lựa chọn Pub/Sub:**

| Hệ thống | Ưu điểm | Nhược điểm |
|---|---|---|
| Redis Pub/Sub | Đơn giản, phổ biến | Không lưu lại (subscriber offline mất tin) |
| Redis Streams | Có lưu, consumer group | Phức tạp hơn |
| NATS | Rất nhanh, nhẹ | Ít thư viện hơn |
| RabbitMQ | Ổn định, nhiều feature | Nặng hơn |
| Kafka | Replay, throughput lớn | Overkill cho WebSocket app thông thường |
| Postgres `LISTEN/NOTIFY` | Không cần thêm hạ tầng | Throughput thấp |

**Nhắc nhở:** pub/sub chỉ là **kênh đẩy realtime**, không phải nơi lưu sự thật. Luôn lưu
event/message vào database (PostgreSQL, MySQL, DynamoDB…) hoặc event log trước khi publish;
khi client reconnect, đọc lại từ nguồn bền vững rồi mới bật lại luồng push.

### 10.1 NATS JetStream — lựa chọn khi cần nhẹ và nhanh

Redis Pub/Sub phù hợp để bắt đầu, nhưng không replay được message khi subscriber offline.
NATS + JetStream bổ sung stream bền vững, consumer group và replay theo sequence:

```ts
import { connect, StringCodec, AckPolicy } from "nats";

const nc = await connect({ servers: process.env.NATS_URL });
const js = nc.jetstream();
const sc = StringCodec();

// Tạo stream một lần (idempotent ở tầng hạ tầng)
await js.streams.add({
  name: "ORDERS",
  subjects: ["orders.updated"],
  retention: "limits",
  max_age: 24 * 60 * 60 * 1_000_000_000, // 24h (nanosecond)
});

// Publish sau khi DB commit thành công
await js.publish("orders.updated", sc.encode(JSON.stringify({
  orderId: "ord_123",
  status: "shipped",
  version: 7,
})));

// Mỗi node WebSocket có consumer riêng, chỉ nhận event cần thiết
const sub = await js.subscribe("orders.updated", {
  durable: `ws-node-${process.env.NODE_ID}`,
  ack_policy: AckPolicy.Explicit,
});
for await (const msg of sub) {
  const event = JSON.parse(sc.decode(msg.data));
  broadcastToRoom(`order:${event.orderId}`, event);
  msg.ack();
}
```

| Tiêu chí | Redis Pub/Sub | Redis Streams | NATS JetStream | Kafka |
|---|---|---|---|---|
| Replay khi offline | Không | Có (giới hạn) | Có | Có |
| Độ trễ | Rất thấp | Thấp | Rất thấp | Trung bình |
| Vận hành | Đơn giản | Trung bình | Trung bình | Phức tạp |
| Throughput | Cao | Cao | Rất cao | Rất cao |
| Phù hợp | Broadcast tức thời | Event ngắn hạn | Realtime + replay vừa | Data pipeline lớn |

> ⚠️ Đừng publish trước khi transaction DB commit. Nếu publish xong rồi rollback, client
> nhận event cho dữ liệu không tồn tại. Dùng **transactional outbox** hoặc publish sau
> commit với cơ chế retry.

### 10.2 Chọn khóa routing khi scale

Khi có nhiều node, cần biết event nào đi tới node nào. Ba cách phổ biến:

| Cách | Cơ chế | Ưu điểm | Nhược điểm |
|---|---|---|---|
| Broadcast toàn bộ | Mọi node nhận mọi event, tự lọc client local | Đơn giản, không mất event | Tốn băng thông khi nhiều node/room |
| Sharding theo room | Hash `roomId` → node, chỉ node đó subscribe | Hiệu quả | Rebalance khi thêm/bớt node phức tạp |
| Presence registry | Lưu `userId → nodeId` trong Redis, publish đích danh | Chính xác cho direct message | Cần TTL/heartbeat để tránh stale |

Với chat/notification quy mô vừa (< 50 node), broadcast + lọc local thường kinh tế hơn
sharding vì đơn giản và ít lỗi khi node chết. Chỉ shard khi băng thông pub/sub trở thành
điểm nghẽn đo được.

---

## 11. Quản lý kết nối, heartbeat, reconnect

### 11.1 Heartbeat (Ping/Pong)

Mục đích: phát hiện kết nối "chết" (zombie connection), giữ NAT/firewall không cắt.

```ts
// Server
const HEARTBEAT_INTERVAL = 30_000;   // 30s
const HEARTBEAT_TIMEOUT = 10_000;    // cho client phản hồi thêm 10s

wss.on("connection", (ws: any) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
});

const timer = setInterval(() => {
  for (const ws of wss.clients) {
    if ((ws as any).isAlive === false) {
      console.log("Kill zombie:", (ws as any).userId);
      return ws.terminate();          // cắt kết nối chết
    }
    (ws as any).isAlive = false;
    ws.ping();                        // gửi control frame Ping
  }
}, HEARTBEAT_INTERVAL);

wss.on("close", () => clearInterval(timer);
```

### 11.2 Client reconnect với exponential backoff

```ts
function connect() {
  const ws = new WebSocket(`wss://${location.host}/ws`);

  ws.onopen = () => {
    attempt = 0;
    ws.send(JSON.stringify({ type: "sync", since: lastSeenTs }));
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "ack") lastSeenTs = msg.ts;
    render(msg);
  };

  ws.onclose = (e) => {
    if (e.code === 4001 || e.code === 4003) return; // lỗi auth/origin → không retry
    const delay = Math.min(30_000, 1000 * 2 ** attempt++) + Math.random() * 500;
    setTimeout(connect, delay);
  };
}

connect();
```

```
Thử lại: 1s → 2s → 4s → 8s → 16s → 30s → 30s ... (có jitter ±500ms)
```

**Jitter** quan trọng để tránh "thundering herd" — hàng nghìn client cùng reconnect
một lúc sau sự cố.

### 11.3 Đồng bộ lại dữ liệu sau khi reconnect

```ts
// Client yêu cầu bù khoảng thời gian mất kết nối
ws.send(JSON.stringify({ type: "sync", since: lastMessageAt }));

// Server
ws.on("message", (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.type === "sync") {
    const missed = await db.messages
      .where("created_at >").equals(m.since)
      .orderBy("created_at").limit(200).toArray();
    missed.forEach((row) => ws.send(JSON.stringify({ type: "msg", data: row })));
  }
});
```

> Pattern này quan trọng: **WebSocket là kênh push, database là nguồn sự thật.**

### 11.4 Ping/Pong đúng cách và close handshake

- **Ping/pong là control frame**, không phải message ứng dụng. Đừng dùng JSON `{type:"ping"}`
  thay thế nếu muốn tương thích mọi client/proxy.
- Server nên ping định kỳ (25–30s) và coi client “chết” nếu không pong sau 1–2 chu kỳ.
- Browser không cho JS gửi ping thủ công; browser tự trả lời pong. Vì vậy heartbeat do
  server chủ động là chuẩn.
- Client có thể gửi ping nếu runtime hỗ trợ (Node, Go); browser thì dùng message ứng dụng
  hoặc dựa vào server ping.
- Khi đóng, gửi close frame với code/reason hợp lệ rồi chờ peer đóng; đừng `destroy()`
  ngay nếu muốn đối phương biết lý do. `terminate()` chỉ dùng cho socket zombie.

```ts
// Close đúng cách: gửi code + reason, đợi tối đa 5s rồi terminate
function gracefulClose(ws: WebSocket, code = 1000, reason = "bye") {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.close(code, reason);
  setTimeout(() => {
    if (ws.readyState !== WebSocket.CLOSED) ws.terminate();
  }, 5_000).unref();
}
```

> ⚠️ Nếu server đóng kết nối do token hết hạn, dùng close code ứng dụng (4001) + reason
> ngắn. Client nhận code này phải **không reconnect vô hạn** mà chuyển sang luồng đăng nhập.

---

## 12. Nhận diện & phân loại client (Rooms/Channels)

### 12.1 Rooms/Channels

```ts
// Socket.IO
socket.join(`tenant:${tenantId}`);
socket.join(`order:${orderId}`);

io.to(`tenant:${tenantId}`).emit("order:stats", stats);
io.to(`order:${orderId}`).emit("order:status", { status: "shipped" });
```

### 12.2 Tự viết room bằng Map

```ts
const rooms = new Map<string, Set<WebSocket>>();

function join(ws: WebSocket, room: string) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room)!.add(ws);
}

function leave(ws: WebSocket, room: string) {
  rooms.get(room)?.delete(ws);
}

function emitTo(room: string, data: unknown) {
  const payload = JSON.stringify(data);
  for (const ws of rooms.get(room) ?? []) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}
```

### 12.3 Kiểm tra quyền truy cập room

```ts
// Khi client yêu cầu join
ws.on("message", async (raw) => {
  const { type, room } = JSON.parse(raw.toString());
  if (type !== "join") return;

  const allowed = await canAccessRoom(user.id, room);  // check DB/policy
  if (!allowed) return ws.send(JSON.stringify({ type: "error", code: "FORBIDDEN" }));

  join(ws, room);
  ws.send(JSON.stringify({ type: "joined", room }));
});
```

> 🔑 **Quy tắc vàng**: LUÔN kiểm tra quyền **trên server** mỗi lần join room.
> Client có thể gửi bất kỳ `room` nào — không bao giờ tin tưởng input từ client.

---

## 13. Xử lý lỗi & trạng thái kết nối

### Trạng thái (readyState)

| Giá trị | Tên | Ý nghĩa |
|---|---|---|
| 0 | `CONNECTING` | Đang mở |
| 1 | `OPEN` | Mở, gửi/nhận được |
| 2 | `CLOSING` | Đang đóng |
| 3 | `CLOSED` | Đã đóng |

### Pattern gửi an toàn

```ts
function safeSend(ws: WebSocket, data: unknown) {
  if (ws.readyState !== WebSocket.OPEN) return false;
  try {
    ws.send(typeof data === "string" ? data : JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("Send failed:", err);
    return false;
  }
}
```

### Server chặn lỗi parse

```ts
ws.on("message", (raw, isBinary) => {
  if (isBinary) return ws.close(1003, "Chỉ hỗ trợ text");

  let msg: any;
  try {
    msg = JSON.parse(raw.toString());
  } catch {
    return ws.send(JSON.stringify({ type: "error", code: "BAD_JSON" }));
  }

  if (typeof msg.type !== "string") {
    return ws.send(JSON.stringify({ type: "error", code: "BAD_SCHEMA" }));
  }

  handle(msg, ws);
});
```

---

## 14. Mẫu tin nhắn (Message Protocol) & Serialization

### 14.1 Khuyến nghị cấu trúc envelope thống nhất

```jsonc
// Mọi tin nhắn đều có dạng:
{
  "v": 1,                       // version protocol
  "id": "01HXYZ...",            // ULID/UUID — để ack/deduplicate
  "type": "order.created",      // định danh loại sự kiện (namespaced)
  "ts": 1730000000000,          // timestamp client
  "payload": { ... }            // dữ liệu riêng của loại này
}

// Phản hồi server:
{ "v": 1, "type": "ack", "ref": "01HXYZ...", "ok": true }
{ "v": 1, "type": "error", "ref": "01HXYZ...", "code": "VALIDATION", "message": "..." }
```

### 14.2 Bảng type cho ứng dụng chat/notification (gợi ý)

```text
Client → Server:
  auth.token            { token }
  room.join / room.leave{ room_id }
  message.send          { client_msg_id, room_id, content }
  typing.start / stop   { room_id }
  sync.request          { since_cursor }
  ping                  {}

Server → Client:
  auth.ok / auth.fail
  message.created       { id, client_msg_id, room_id, content, sender, created_at }
  message.updated       { id, content, edited_at }
  order.status.changed  { order_id, status, version }
  presence.changed      { user_id, status, last_seen }
  error                 { code, ref?, message }
  pong                  {}
```

Quy ước đặt tên `resource.action` giúp client route bằng một bảng `switch` duy nhất và
giúp log/metrics dễ aggregate. Tránh tên mơ hồ kiểu `update`, `data`, `event`.

### 14.3 So sánh định dạng

| Định dạng | Kích thước | Tốc độ parse | Ghi chú |
|---|---|---|---|
| JSON | Lớn | Nhanh (native) | Dễ đọc, phổ biến nhất |
| MessagePack | Nhỏ ~10-30% | Nhanh | Binary, compatible schema |
| Protobuf | Nhỏ nhất | Rất nhanh | Cần .proto, schema strict |
| CBOR | Nhỏ | Nhanh |类似 JSON, dùng trong IoT |
| YAML/CSV | — | Chậm | ❌ không dùng cho WS |

**Ví dụ dùng MessagePack (Node.js):**

```ts
import { encode, decode } from "@msgpack/msgpack";

ws.send(encode({ type: "chat", text: "Xin chào" }));
ws.on("message", (buf) => {
  const msg = decode(buf);   // buf là ArrayBuffer/Buffer
});
```

---

## 15. Rate limiting & chống lạm dụng

### 15.1 Token bucket per connection

```ts
class TokenBucket {
  private tokens: number;
  private lastRefill = Date.now();
  constructor(
    private capacity = 20,        // tối đa 20 tin
    private refillPerSec = 5,     // thêm 5 token/giây
  ) {
    this.tokens = capacity;
  }

  allow(): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSec);
    this.lastRefill = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}

ws.on("message", (raw) => {
  if (!bucket.allow()) {
    return ws.send(JSON.stringify({ type: "error", code: "RATE_LIMITED" }));
  }
  // ...xử lý
});
```

### 15.2 Các biện pháp chống lạm dụng khác

| Biện pháp | Mô tả |
|---|---|
| Giới hạn kết nối/IP | `100 kết nối/phút/địa chỉ IP` |
| Giới hạn message/đoạn thời gian | `60 msg/phút/socket` |
| Giới hạn kích thước frame | `≤ 4KB` cho chat app (ws option `maxPayload`) |
| Giới hạn số room join | `≤ 20 rooms/socket` |
| Captcha khi handshake | Không cần thiết với app đã đăng nhập |
| Idle timeout | Đóng kết nối im lặng quá 60s |
| Global connection cap | `10_000 connections` để tránh OOM |

**Cấu hình `maxPayload` với ws:**

```ts
const wss = new WebSocketServer({ port: 8080, maxPayload: 4 * 1024 }); // 4KB
```

---

## 16. WebSocket vs các giải pháp thay thế

```
┌──────────────────┬────────────┬──────────┬─────────────┬──────────────┐
│ Tiêu chí         │ WebSocket  │ SSE      │ Long Poll   │ HTTP/2 Push  │
├──────────────────┼────────────┼──────────┼─────────────┼──────────────┤
│ Hướng            │ 2 chiều    │ 1 chiều  │ 1 chiều*    │ 1 chiều      │
│ Kết nối          │ 1 TCP cố định│ 1 HTTP │ 1 HTTP lặp  │ 1 HTTP       │
│ Overhead/message │ Rất thấp   │ Trung bình│ Cao        │ Thấp         │
│ Proxy/H firewall │ Hay bị chặn│ Dễ qua   │ Dễ qua      │ Ít hỗ trợ    │
│ Reconnect tự động│ Tự viết    │ Browser tự│ Tự viết    │ Không có     │
│ Độ phức tạp      │ Trung bình │ Thấp     │ Thấp        │ Cao          │
│ Hỗ trợ binary   │ Có         │ Không    │ Không       │ Có           │
│ Phù hợp          │ Chat, game │ Log, ticker│ Đơn giản  │ Ít dùng      │
└──────────────────┴────────────┴──────────┴─────────────┴──────────────┘
* nếu client gửi request mới để nhận tiếp
```

### Socket.IO / raw WebSocket?

| | raw `ws` | Socket.IO |
|---|---|---|
| Tiêu chuẩn | RFC 6455 chuẩn | Protocol riêng (fallback polling/WS) |
| Kích thước | ~150KB (lib nhẹ) | ~50KB gzip + server lib |
| Tính năng | Tự build | Rooms, ack, reconnect, broadcast sẵn |
| Kiểm soát | Toàn quyền | Theo framework |
| Phù hợp | Cần chuẩn hóa, tối ưu | Dự án cần nhanh, đầy đủ tính năng |

> Nếu làm ứng dụng cần **tương thích chuẩn** (mobile lib, IoT, browser thuần) → dùng
> raw WebSocket/`ws`. Nếu cần **tính năng phong phú nhanh** → Socket.IO.

---

## 17. Bảo mật WebSocket — checklist đầy đủ

### ✅ Bắt buộc

1. **Luôn dùng `wss://` (TLS) trong production** — mọi frame đều được mã hóa.
2. **Xác thực khi handshake** — JWT/cookie/session; đóng ngay nếu thất bại.
3. **Kiểm tra `Origin` header** — chống WebSocket Hijacking từ trang lạ.
4. **Không bao giờ tin input client** — validate + sanitize mọi message (JSON schema).
5. **Kiểm tra quyền từng hành động** — join room, gửi tin, đọc dữ liệu.
6. **Giới hạn kích thước & tần suất** — `maxPayload`, token bucket, connection cap.
7. **Xử lý đóng kết nối khi token hết hạn** — timer re-verify định kỳ.
8. **Escape dữ liệu khi hiển thị** — chống XSS qua nội dung chat (client-side).

### ⚠️ Nâng cao

9. **Không lộ stack trace / internal error** trong message lỗi.
10. **Rate limit theo IP + theo user + theo socket.**
11. **Log & giám sát** — kết nối bất thường, số msg/giây, mã close bất thường.
12. **CORS/Origin allowlist** thay vì `*`.
13. **Không để token trong URL** (dùng cookie hoặc sub-protocol).
14. **Chống amplification** — không cho client ép server gửi broadcast lớn (vd: yêu cầu
    gửi lại lịch sử 10k tin cho mọi người).
15. **Cân nhắc permessage-deflate** — nén CPU có thể bị abuse (zip bomb); giới hạn
    `threshold` và `concurrency`.

### 🔴 Các lỗ hổng WebSocket phổ biến

| Lỗ hổng | Mô tả | Phòng ngừa |
|---|---|---|
| **WebSocket Hijacking** | Trang tấn công kết nối WS tới server bạn bằng cookie của nạn nhân | Kiểm tra `Origin` chặt |
| **XSS → WS** | Script inject trên trang gửi lệnh qua WS đã mở | XSS protection + auth per message |
| **Broken Authentication** | Token không được verify hoặc hết hạn vẫn dùng | verify JWT + exp check định kỳ |
| **Insecure data exposure** | Gửi dữ liệu nhạy cảm khi chưa auth | Auth trước khi nhận bất kỳ data nào |
| **DoS bằng kết nối** | Mở hàng triệu kết nối giữ RAM | Connection cap, idle timeout, load balancer |
| **DoS bằng message flood** | Gửi msg liên tục | Rate limit, maxPayload |
| **Authorization missing** | Client tự join room người khác | Server-side permission check |
| **Cache poisoning** | Frame không mask lẫn vào cache proxy | Client bắt buộc mask (chuẩn đã có) |

**Ví dụ kiểm tra Origin nghiêm ngặt:**

```ts
const ALLOWED_ORIGINS = new Set([
  "https://app.example.com",
  "https://admin.example.com",
]);

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    ws.close(4003, "Origin bị từ chối");
    return;
  }
  // ...tiếp tục auth
});
```

**Ví dụ kiểm tra lại token định kỳ (re-auth):**

```ts
setInterval(async () => {
  for (const [ws, ctx] of sessions) {
    if (Date.now() - ctx.issuedAt > ctx.ttl) {
      try {
        ctx.issuedAt = Date.now();  // gia hạn hoặc verify lại
      } catch {
        ws.close(4001, "Phiên hết hạn");
      }
    }
  }
}, 60_000);
```

---

## 18. Presence & trạng thái online

**Presence** trả lời câu hỏi “ai đang online?”, “user này đang ở phòng nào?”, “thiết bị
nào đang hoạt động?”. Đây là loại dữ liệu **tạm thời, có TTL**, khác với dữ liệu nghiệp
vụ cần lưu bền vững.

### 18.1 Mô hình lưu presence

| Cách | Ví dụ | Phù hợp |
|---|---|---|
| In-memory per node | `Map<userId, Set<WebSocket>>` | Một node, đơn giản |
| Redis key + TTL | `SET presence:{userId}:{nodeId} 1 EX 60` | Nhiều node, cần TTL |
| Redis Hash | `HSET presence:{userId} status online node n1 last_seen ts` | Cần nhiều thuộc tính |
| Database | `UPDATE users SET last_seen_at = now()` | Không cần realtime chính xác |

```ts
// Mỗi node cập nhật TTL định kỳ; key tự hết hạn nếu node chết
async function markOnline(redis: RedisClient, userId: string, nodeId: string) {
  await redis.set(`presence:${userId}:${nodeId}`, "1", { EX: 60 });
}

// Đọc trạng thái tổng hợp từ mọi node
async function getPresence(redis: RedisClient, userId: string) {
  const keys = await redis.keys(`presence:${userId}:*`);
  return keys.length > 0 ? "online" : "offline";
}
```

> ⚠️ `KEYS` quét toàn bộ keyspace và rất chậm khi dữ liệu lớn. Production dùng `SCAN`
> theo batch, hoặc lưu một Set `presence:user:{id}:nodes` cạnh các key TTL.

### 18.2 Presence theo phòng và typing indicator

- Presence theo room nên là **derived state**: đếm connection đang join room, không lưu
  một bản ghi riêng cho từng cặp user/room nếu không cần.
- Typing indicator là **ephemeral**: gửi `typing.start`/`typing.stop`, server broadcast
  cho room, client tự hết hạn sau 3–5 giây nếu không nhận thêm.
- Không lưu typing vào DB. Không gửi cho người đang không mở cuộc trò chuyện.

```ts
const typingTimers = new Map<string, NodeJS.Timeout>();

function handleTyping(ws: WebSocket, userId: string, roomId: string, active: boolean) {
  const key = `${roomId}:${userId}`;
  clearTimeout(typingTimers.get(key));
  broadcastToRoom(roomId, {
    type: active ? "typing.started" : "typing.stopped",
    user_id: userId,
    room_id: roomId,
  });
  if (active) {
    typingTimers.set(key, setTimeout(() => {
      broadcastToRoom(roomId, { type: "typing.stopped", user_id: userId, room_id: roomId });
      typingTimers.delete(key);
    }, 5_000));
  }
}
```

### 18.3 Multi-device và last-seen

- Một user có thể mở nhiều thiết bị. Chỉ chuyển `offline` khi **tất cả** connection đóng.
- Dùng connection id (`connId`) thay vì `userId` làm khóa chính cho socket.
- `last_seen_at` chỉ nên cập nhật theo interval (ví dụ 30s), không mỗi message, để tránh
  ghi DB quá nhiều.
- Khi app mobile vào background, OS có thể giữ socket thêm vài chục giây; đừng coi
  “socket còn mở” là “user đang thực sự xem app”.

---

## 19. Delivery guarantees, ordering & idempotency

WebSocket chạy trên TCP nên **trong một kết nối** frame đến đúng thứ tự và không mất.
Nhưng khi kết nối đứt, message đang trên đường có thể mất; khi reconnect, server không tự
biết client đã nhận tới đâu. Vì vậy cần thiết kế delivery ở tầng ứng dụng.

### 19.1 Các mức đảm bảo

| Mức | Ý nghĩa | Cách làm |
|---|---|---|
| At-most-once | Gửi một lần, có thể mất | `socket.send` không retry |
| At-least-once | Có thể trùng, không mất | Retry + `event_id`/`message_id` để dedupe |
| Exactly-once (logic) | Client chỉ xử lý hiệu ứng một lần | At-least-once + idempotent consumer |

> ⚠️ Không có “exactly-once” thật sự trên mạng. Cái ta làm được là **at-least-once +
> dedupe**, để *hiệu ứng* chỉ xảy ra một lần.

### 19.2 Event envelope có sequence

```json
{
  "v": 1,
  "event_id": "evt_01J9Z4K2",
  "sequence": 1024,
  "type": "order.status.changed",
  "occurred_at": "2026-10-25T10:00:00.000Z",
  "data": { "order_id": "ord_123", "status": "shipped" }
}
```

- `event_id`: ULID/UUID, dùng để dedupe.
- `sequence`: số tăng dần theo room/aggregate, giúp phát hiện mất event.
- `occurred_at`: do server sinh; không tin đồng hồ client.
- Client giữ `last_sequence`; nếu nhận `sequence` nhảy cóc → gọi REST để sync lại.

### 19.3 Resume sau reconnect

```ts
// Server: lưu event gần đây theo room (Redis Stream/DB outbox)
async function replaySince(ws: WebSocket, roomId: string, sinceSeq: number) {
  const events = await eventStore.list({ roomId, after: sinceSeq, limit: 500 });
  for (const event of events) {
    safeSend(ws, event);
  }
  if (events.length === 500) {
    safeSend(ws, { type: "sync.truncated", room_id: roomId });
  }
}
```

Nếu không muốn lưu replay buffer, client phải **tải lại trạng thái từ REST** sau mỗi lần
reconnect. Đây là lựa chọn hợp lý cho app nhỏ, miễn là contract nói rõ.

### 19.4 Ordering và race condition

- Không giả định event từ nhiều nguồn đến đúng thứ tự. Hai event update cùng một order
  có thể đến lệch nhau.
- Gắn `version` (optimistic locking) vào aggregate; client bỏ qua event có version cũ hơn
  version đang giữ.
- Với chat, thứ tự hiển thị nên dựa trên `created_at` + `id`, không dựa vào thứ tự nhận.
- Khi create và update đến gần nhau, update có thể tới trước create. Client nên giữ
  “pending update” hoặc gọi lại `GET` resource đó.

### 19.5 Transactional outbox

Để không mất event giữa DB và broker:

```text
BEGIN;
  INSERT INTO orders (...) VALUES (...);
  INSERT INTO outbox (id, topic, payload, created_at) VALUES (...);
COMMIT;
-- Worker riêng đọc outbox chưa publish → publish broker → mark published
```

Worker phải idempotent: publish lại cùng `event_id` là an toàn nếu consumer dedupe.
Outbox cũng cho phép replay khi broker mất dữ liệu.

---

## 20. Backpressure & flow control

WebSocket không có built-in flow control ở tầng ứng dụng. Nếu server `send()` nhanh hơn
client đọc, buffer trong process hoặc kernel tăng dần → RAM tăng → OOM. Đây là lỗi
production phổ biến khi broadcast cho nhiều client chậm.

### 20.1 Phát hiện consumer chậm

```ts
const MAX_BUFFERED = 1 * 1024 * 1024; // 1 MB

function sendWithBackpressure(ws: WebSocket, payload: string): boolean {
  if (ws.readyState !== WebSocket.OPEN) return false;
  if (ws.bufferedAmount > MAX_BUFFERED) {
    ws.close(1013, "Client too slow"); // 1013 = try again later
    return false;
  }
  ws.send(payload);
  return true;
}
```

`bufferedAmount` là số byte đã đưa vào socket nhưng chưa gửi hết. Với Node `ws` còn có
`ws._socket.writableLength` để xem buffer tầng TCP.

### 20.2 Các chiến lược khi client chậm

| Chiến lược | Cách làm | Phù hợp |
|---|---|---|
| Drop oldest | Giữ queue có giới hạn, bỏ event cũ | Ticker giá, telemetry |
| Coalesce | Gộp nhiều update thành snapshot mới nhất | Trạng thái đơn hàng, dashboard |
| Disconnect | Đóng client quá chậm | Chat, tài chính, cần đúng |
| Slow producer | Không đọc source nhanh hơn consumer | Stream hiếm, ít client |
| Per-client queue | Queue riêng + worker gửi | Broadcast lớn, cần kiểm soát |

```ts
// Coalesce: chỉ giữ trạng thái mới nhất cho mỗi order
const pending = new Map<string, unknown>();

function queueOrderUpdate(orderId: string, payload: unknown) {
  pending.set(orderId, payload);
}

setInterval(() => {
  for (const [orderId, payload] of pending) {
    broadcastToRoom(`order:${orderId}`, payload);
  }
  pending.clear();
}, 100);
```

### 20.3 Backpressure từ phía client

- Client không nên xử lý nặng trong `onmessage`; đẩy vào queue/worker.
- Client nên giới hạn số message xử lý mỗi frame (`requestAnimationFrame` cho UI).
- Khi tab background, trình duyệt có thể throttle timer; đừng dựa vào timer chính xác.
- Mobile: khi app background, nên đóng socket hoặc chuyển sang push notification.

> 💡 Đo **độ trễ từ lúc event phát sinh đến lúc client render** (end-to-end latency),
> không chỉ đo throughput. Một hệ thống 100k msg/s nhưng client trễ 30s là hệ thống hỏng.

---

## 21. Testing, observability & load testing

### 21.1 Test pyramid cho WebSocket

| Tầng | Test gì | Công cụ |
|---|---|---|
| Unit | Parse envelope, auth, rate limit, backoff | Vitest/Jest, pytest |
| Integration | Handshake, auth thất bại, join room, broadcast | `ws` client, Testcontainers |
| Contract | Schema event, version, field bắt buộc | JSON Schema, Zod, Pydantic |
| E2E | Hai client chat qua server thật | Playwright, custom harness |
| Load | N connection, M message/s, p95 latency | k6, Artillery, autocannon |

### 21.2 Ví dụ integration test (Node + Vitest)

```ts
import { afterAll, beforeAll, expect, test } from "vitest";
import { WebSocketServer } from "ws";
import WebSocket from "ws";

let wss: WebSocketServer;
let port: number;

beforeAll(async () => {
  wss = new WebSocketServer({ port: 0 });
  port = (wss.address() as { port: number }).port;
  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "echo") ws.send(JSON.stringify({ type: "echo", data: msg.data }));
    });
  });
});

afterAll(() => wss.close());

test("echo round-trip", async () => {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  await new Promise((resolve) => ws.on("open", resolve));
  const reply = new Promise((resolve) => ws.on("message", (m) => resolve(JSON.parse(m.toString()))));
  ws.send(JSON.stringify({ type: "echo", data: "hello" }));
  await expect(reply).resolves.toEqual({ type: "echo", data: "hello" });
  ws.close();
});
```

Test quan trọng nhất thường bị bỏ quên:

- Auth fail → đóng với đúng close code.
- Message sai schema → trả lỗi, **không crash process**.
- Client ngắt giữa broadcast → server không throw.
- Reconnect → không nhận trùng event (dedupe hoạt động).
- Slow consumer → bị disconnect/coalesce theo chính sách.
- Token hết hạn giữa phiên → bị đóng hoặc re-auth.

### 21.3 Observability: metric, log, trace

| Loại | Cần đo |
|---|---|
| Gauge | Số connection hiện tại, số room, số client chậm |
| Counter | Connection mở/đóng, message in/out, auth fail, rate limit |
| Histogram | Độ trễ xử lý message, kích thước payload, thời gian broadcast |
| Log | `conn_id`, `user_id` (hash), `event_type`, `close_code`, `duration` |
| Trace | Span cho `ws.message` → DB → broker → broadcast |

```ts
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("ws-server");
const connections = meter.createUpDownCounter("ws.connections.active");
const messages = meter.createCounter("ws.messages.total");
const latency = meter.createHistogram("ws.message.duration_ms");

wss.on("connection", (ws) => {
  connections.add(1);
  ws.on("close", () => connections.add(-1));
  ws.on("message", async (raw) => {
    const start = performance.now();
    messages.add(1, { direction: "in" });
    try {
      await handle(raw);
    } finally {
      latency.record(performance.now() - start);
    }
  });
});
```

**Log mẫu có cấu trúc:**

```json
{
  "level": "warn",
  "event": "ws.close",
  "conn_id": "c_01J9",
  "user_hash": "9f2c",
  "close_code": 1006,
  "duration_ms": 48213,
  "node": "ws-3"
}
```

Không log token, cookie, nội dung tin nhắn đầy đủ. Nếu cần debug, log độ dài và hash.

### 21.4 Load testing

Công cụ:

- **k6** (`k6/ws`) — script JS, tốt cho scenario nhiều bước, có threshold.
- **Artillery** — YAML/JS, hỗ trợ WebSocket engine.
- **autocannon** — chủ yếu HTTP, có plugin WebSocket không mạnh bằng.
- **Custom harness** (`ws` + worker_threads) — kiểm soát hoàn toàn, tốt để test protocol.

```js
// k6 load test: 1.000 VU, mỗi VU giữ 1 connection, gửi 1 msg/5s
import ws from "k6/ws";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    steady: {
      executor: "ramping-vus",
      startVUs: 100,
      stages: [
        { duration: "1m", target: 1000 },
        { duration: "3m", target: 1000 },
        { duration: "1m", target: 0 },
      ],
    },
  },
  thresholds: {
    ws_connecting: ["p(95)<500"],
    ws_msgs_received: ["rate>0.99"],
  },
};

export default function () {
  const url = "wss://api.example.com/ws";
  const res = ws.connect(url, {}, (socket) => {
    socket.on("open", () => socket.send(JSON.stringify({ type: "ping" })));
    socket.on("message", (data) => check(data, { "có dữ liệu": (d) => d.length > 0 }));
    socket.setInterval(() => socket.send(JSON.stringify({ type: "ping" })), 5000);
    socket.setTimeout(() => socket.close(), 60_000);
  });
  check(res, { "handshake 101": (r) => r && r.status === 101 });
  sleep(1);
}
```

**Đo gì khi load test:**

1. Số connection tối đa trước khi CPU/RAM/file descriptor chạm trần.
2. p50/p95/p99 end-to-end latency khi broadcast cho N client.
3. Tỷ lệ drop/disconnect, close code 1006/1013.
4. Throughput broker (Redis/NATS) và độ trễ publish → consume.
5. Hành vi khi một node chết giữa test (chaos).

> ⚠️ Load test trên môi trường staging, không production. Tăng tải từ từ và theo dõi
> file descriptor (`ulimit -n`), ephemeral port, và giới hạn connection của load balancer.

---

## 22. Ví dụ dự án thực tế: Order Notifications Realtime

> Domain minh hoạ: khách đặt hàng, admin cập nhật trạng thái, mọi client đang xem đơn
> nhận thông báo ngay. Dữ liệu lưu ở database quan hệ; WebSocket chỉ là kênh đẩy.

### 22.1 Server — `server.ts`

```ts
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseCookie } from "cookie";
import { db } from "./db";          // repository nội bộ, không phụ thuộc vendor

const wss = new WebSocketServer({ port: 8080, path: "/ws", maxPayload: 4 * 1024 });
const ALLOWED_ORIGINS = new Set(["https://app.example.com", "http://localhost:3000"]);

type Session = { userId: string; joinedAt: number; bucket: TokenBucket };
const sessions = new WeakMap<WebSocket, Session>();

// --- Rate limiter ---
class TokenBucket {
  private t: number;
  constructor(private cap = 10, private refill = 1 / 3) { this.t = cap; }
  allow() {
    const now = Date.now() / 1000;
    this.t = Math.min(this.cap, this.t + (now - (this as any)._last ?? now));
    (this as any)._last = now;
    if (this.t < 1) return false;
    this.t -= 1;
    return true;
  }
}

// --- Heartbeat ---
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const s: any = ws;
    if (s.alive === false) return ws.terminate();
    s.alive = false;
    ws.ping();
  });
}, 30_000);
wss.on("connection", (ws) => { (ws as any).alive = true; ws.on("pong", () => ((ws as any).alive = true)); });

wss.on("connection", async (ws, req) => {
  // 1. Origin check
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return ws.close(4003, "Forbidden origin");

  // 2. Auth bằng cookie / session
  const cookies = parseCookie(req.headers.cookie ?? "");
  const userId = await verifySession(cookies["sid"]);
  if (!userId) return ws.close(4001, "Missing session");

  sessions.set(ws, { userId, joinedAt: Date.now(), bucket: new TokenBucket() });
  ws.send(JSON.stringify({ v: 1, type: "system.notice", payload: { text: "Đã kết nối" } }));

  // 3. Gửi 20 thông báo mới nhất khi vừa kết nối
  const recent = await db.notifications.listRecent({ userId, limit: 20 });
  ws.send(JSON.stringify({ v: 1, type: "notification.history", payload: recent }));

  // 4. Nhận message
  ws.on("message", async (raw, isBinary) => {
    if (isBinary) return ws.close(1003, "Text only");
    const session = sessions.get(ws)!;

    if (!session.bucket.allow()) {
      return ws.send(JSON.stringify({ v: 1, type: "error", code: "RATE_LIMITED" }));
    }

    let msg: any;
    try { msg = JSON.parse(raw.toString()); }
    catch { return ws.send(JSON.stringify({ v: 1, type: "error", code: "BAD_JSON" })); }

    if (msg.type === "order.subscribe") {
      // Kiểm tra quyền trên server trước khi join room
      const orderId = String(msg.payload?.order_id ?? "");
      if (!(await db.orders.canView(orderId, session.userId))) {
        return ws.send(JSON.stringify({ v: 1, type: "error", code: "FORBIDDEN" }));
      }
      joinRoom(ws, `order:${orderId}`);
      ws.send(JSON.stringify({ v: 1, type: "order.subscribed", payload: { order_id: orderId } }));
    }
  });

  ws.on("close", () => sessions.delete(ws));
});

process.on("SIGINT", () => { clearInterval(interval); wss.close(); process.exit(0); });
```

### 22.2 Client — `client.ts` (browser)

```ts
function connectOrderFeed() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  let attempt = 0;
  let lastSequence = Number(localStorage.getItem("lastSequence") ?? 0);

  const ws = new WebSocket(`${proto}://${location.host}/ws`);

  ws.onopen = () => {
    attempt = 0;
    ws.send(JSON.stringify({
      v: 1,
      type: "sync.request",
      payload: { since_sequence: lastSequence },
    }));
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    switch (msg.type) {
      case "notification.history":
      case "order.status.changed":
        for (const event of Array.isArray(msg.payload) ? msg.payload : [msg.payload]) {
          if (event.sequence <= lastSequence) continue; // dedupe + chống event cũ
          renderOrder(event);
          lastSequence = event.sequence;
          localStorage.setItem("lastSequence", String(lastSequence));
        }
        break;
      case "sync.truncated":
        // Quá nhiều event bị lỡ → tải lại toàn bộ từ REST
        void refetchOrders();
        break;
      case "error":
        if (msg.code === "RATE_LIMITED") showToast("Thao tác quá nhanh, thử lại sau.");
        break;
    }
  };

  ws.onclose = (e) => {
    if (e.code === 4001 || e.code === 4003) return; // lỗi auth/origin, không retry
    const delay = Math.min(30_000, 1000 * 2 ** attempt++) + Math.random() * 500;
    setTimeout(connectOrderFeed, delay);
  };
}
```

### 22.3 Những điểm cần giữ khi adapt ví dụ

1. **Auth trước, join room sau.** Không cho client join room dựa trên `room_id` do client
   gửi mà chưa kiểm tra quyền.
2. **DB là nguồn sự thật.** Không broadcast dữ liệu chưa commit.
3. **Mọi event có `event_id` và `sequence`.** Client dedupe và phát hiện mất event.
4. **Giới hạn payload và rate.** `maxPayload`, token bucket, timeout.
5. **Backpressure.** Kiểm tra `bufferedAmount` trước khi broadcast cho client chậm.
6. **Reconnect có jitter.** Tránh reconnect storm sau sự cố hạ tầng.
7. **Tách transport khỏi business logic.** `handle(msg, ctx)` nên test được mà không cần
   socket thật.

---

## 23. Debugging & công cụ hỗ trợ

| Công cụ | Công dụng |
|---|---|
| **Chrome DevTools → Network → WS** | Xem frame real-time, gửi frame thủ công |
| **wscat** (`npm i -g wscat`) | CLI kết nối WS: `wscat -c ws://localhost:8080/ws` |
| **websocat** | CLI mạnh hơn (Rust): `websocat wss://...` |
| **Insomnia / Postman** | Hỗ trợ WebSocket request (Postman) |
| **Wireshark** | Phân tích frame ở tầng network |
| **Socket.IO Inspector** | Devtool cho Socket.IO |
| **wss.hacks.gg / piehost** | Kiểm tra WS public nhanh |

```bash
# wscat với header Origin + cookie
wscat -c ws://localhost:8080/ws \
  -H "Origin: https://app.example.com" \
  -H "Cookie: sid=<session-id>"
```

**Log gợi ý cho server:**

```ts
ws.on("open",    () => console.log("[OPEN]", req.socket.remoteAddress));
ws.on("message", (m) => console.log("[MSG ]", m.toString().slice(0, 200)));
ws.on("close",   (c, r) => console.log("[CLOSE]", c, r.toString()));
ws.on("error",   (e) => console.error("[ERR ]", e));
```

---

## 24. Anti-patterns thường gặp

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| Lưu `message history` chỉ trong RAM của server | Lưu DB (PostgreSQL/MySQL), WS chỉ để push |
| Tin tưởng `client.id`/`room` do client gửi | Server xác định identity từ session, kiểm tra quyền |
| Gửi JSON.stringify cho mọi client mọi lúc | Chỉ gửi cho room liên quan (broadcast hẹp) |
| Không có heartbeat → socket zombie giữ RAM | Ping/Pong 30s, terminate nếu chết |
| Reconnect ngay lập tức hàng loạt | Exponential backoff + jitter |
| Tự viết protocol riêng không version | Có trường `v` (version) để nâng cấp sau |
| Để server giữ toàn bộ state (VD trạng thái game) | State có thể recover từ DB/Redis |
| Bỏ qua kiểm tra `readyState` trước khi gửi | `safeSend()` wrapper |
| Log toàn bộ payload chứa PII/token | Che token, giới hạn log payload |
| Cho phép mọi Origin (`*`) | Allowlist Origin cụ thể |
| Broadcast cho mọi client rồi client tự lọc | Server lọc theo room/subscription |
| Không giới hạn `bufferedAmount` | Ngắt/coalesce client chậm, đặt queue cap |
| Dùng WebSocket cho request/response CRUD | Dùng HTTP; WS chỉ cho push/low-latency |
| Retry vô hạn khi auth fail | Phân loại close code, dừng retry với 4001/4003 |
| Publish event trước khi DB commit | Outbox hoặc publish sau commit |
| Không có `event_id` | Client không dedupe được, hiển thị trùng |
| Tin vào `sequence` của client | Server sinh sequence, client chỉ đọc |
| Giữ socket khi app mobile background | Đóng socket, dùng push notification |

---

## 25. Tài liệu tham khảo

- **RFC 6455** — The WebSocket Protocol: https://datatracker.ietf.org/doc/html/rfc6455
- **RFC 7692** — Compression Extensions: https://datatracker.ietf.org/doc/html/rfc7692
- **MDN WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- **`ws` library (Node.js)**: https://github.com/websockets/ws
- **Socket.IO docs**: https://socket.io/docs/v4/
- **OWASP — WebSocket Security**: https://owasp.org/www-project-web-security-testing-guide/
  (xem OWASP Testing Guide — Testing for WebSocket)

---

*Tài liệu tạo ngày 20/10/2026 — phần bổ sung về bảo mật API xem tại
[`api-security.md`](../api/api-security.md).*
