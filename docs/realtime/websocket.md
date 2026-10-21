# WebSocket — Kiến thức toàn diện từ cơ bản đến nâng cao

> Tài liệu tham khảo đầy đủ về WebSocket: nguyên lý hoạt động, giao thức, kiến trúc,
> bảo mật, scaling, mã nguồn ví dụ (Node.js/Bun, TypeScript, Python, Go) và các mẫu
> thiết kế thực tế.

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
18. [Ví dụ dự án thực tế: Wedding Guestbook Realtime](#18-ví-dụ-dự-án-thực-tế-wedding-guestbook-realtime)
19. [Debugging & công cụ hỗ trợ](#19-debugging--công-cụ-hỗ-trợ)
20. [Anti-patterns thường gặp](#20-anti-patterns-thường-gặp)
21. [Tài liệu tham khảo](#21-tài-liệu-tham-khảo)

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
- Cập nhật RSVP, guestbook của wedding website (áp dụng cho dự án hiện tại)

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

### 7.2 Mã hóa server (Node.js / Bun, TypeScript)

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
const ALLOWED = new Set(["https://wedding.example.com"]);

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

**Nhắc nhở:** dùng **Redis pub/sub + database cho message history** (như dự án
wedding này lưu tin nhắn vào Supabase) — pub/sub chỉ để đẩy realtime, DB lưu vĩnh viễn.

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

---

## 12. Nhận diện & phân loại client (Rooms/Channels)

### 12.1 Rooms/Channels

```ts
// Socket.IO
socket.join(`wedding:${weddingId}`);
socket.join(`table:${tableNo}`);

io.to(`wedding:${weddingId}`).emit("rsvp:update", stats);
io.to(`table:${tableNo}`).emit("toast", { from: guestName });
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
  "type": "rsvp.create",        // định danh loại sự kiện (namespaced)
  "ts": 1730000000000,          // timestamp client
  "payload": { ... }            // dữ liệu riêng của loại này
}

// Phản hồi server:
{ "v": 1, "type": "ack", "ref": "01HXYZ...", "ok": true }
{ "v": 1, "type": "error", "ref": "01HXYZ...", "code": "VALIDATION", "message": "..." }
```

### 14.2 Bảng type cho ứng dụng wedding (gợi ý)

```text
Client → Server:
  auth.token          { token }
  rsvp.create         { name, will_attend, guest_of, number_attend }
  message.send        { content }
  typing.start / stop { room }
  ping                {}

Server → Client:
  auth.ok / auth.fail
  rsvp.created        { ...rsvp }
  rsvp.stats          { total, attending, declined }
  message.created     { id, content, sender_name, created_at }
  system.notice       { text }
  pong                {}
```

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
  "https://wedding.example.com",
  "https://admin.wedding.example.com",
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

## 18. Ví dụ dự án thực tế: Wedding Guestbook Realtime

> Áp dụng trực tiếp cho repo `wedding-server` hiện tại: khách mời gửi tin nhắn/chúc
> phúc, mọi người thấy ngay lập tức, dữ liệu lưu vào Supabase.

### 18.1 Server — `server.ts`

```ts
import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookie } from "cookie";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const wss = new WebSocketServer({ port: 8080, path: "/ws", maxPayload: 4 * 1024 });
const ALLOWED_ORIGINS = new Set(["https://wedding.example.com", "http://localhost:3000"]);

type Session = { name: string; joinedAt: number; bucket: TokenBucket };
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

  // 2. Auth bằng cookie
  const cookies = parseCookie(req.headers.cookie ?? "");
  const displayName = cookies["guest_name"];
  if (!displayName) return ws.close(4001, "Missing session");

  sessions.set(ws, { name: displayName, joinedAt: Date.now(), bucket: new TokenBucket() });
  ws.send(JSON.stringify({ v: 1, type: "system.notice", payload: { text: `Chào ${displayName}!` } }));

  // 3. Gửi 20 tin mới nhất khi vừa kết nối
  const { data: recent } = await supabase
    .from("messages").select("*").order("created_at", { ascending: false }).limit(20);
  ws.send(JSON.stringify({ v: 1, type: "message.history", payload: recent ?? [] }));

  // 4. Nhận tin nhắn
  ws.on("message", async (raw, isBinary) => {
    if (isBinary) return ws.close(1003, "Text only");
    const session = sessions.get(ws)!;

    if (!session.bucket.allow()) {
      return ws.send(JSON.stringify({ v: 1, type: "error", code: "RATE_LIMITED" }));
    }

    let msg: any;
    try { msg = JSON.parse(raw.toString()); }
    catch { return ws.send(JSON.stringify({ v: 1, type: "error", code: "BAD_JSON" })); }

    if (msg.type === "message.send") {
      const content = String(msg.payload?.content ?? "").trim().slice(0, 500);
      if (!content) return;

      const { data: row, error } = await supabase
        .from("messages")
        .insert([{
          sender_name: session.name,
          content,
          will_attend: Boolean(msg.payload?.will_attend),
          guest_of: msg.payload?.guest_of ?? "Khách",
          number_attend: Number(msg.payload?.number_attend ?? 0),
        }])
        .select().single();

      if (error) return ws.send(JSON.stringify({ v: 1, type: "error", code: "DB" }));

      const out = JSON.stringify({ v: 1, type: "message.created", payload: row });
      wss.clients.forEach((c) => c.readyState === WebSocket.OPEN && c.send(out));
    }
  });

  ws.on("close", () => sessions.delete(ws));
});

process.on("SIGINT", () => { clearInterval(interval); wss.close(); process.exit(0); });
```

### 18.2 Client — `client.ts` (browser)

```ts
function connectGuestbook() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  let lastSeen = Number(localStorage.getItem("lastSeen") ?? 0);

  const ws = new WebSocket(`${proto}://${location.host}/ws`);

  ws.onopen = () => ws.send(JSON.stringify({ v: 1, type: "sync", payload: { since: lastSeen } }));

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    switch (msg.type) {
      case "message.history":
      case "message.created":
        renderMessage(msg.payload);
        break;
      case "error":
        if (msg.code === "RATE_LIMITED") showToast("Bạn gửi hơi nhanh, chờ chút nhé!");
        break;
    }
  };

  ws.onclose = (e) => {
    if (e.code === 4001 || e.code === 4003) return;
    const delay = Math.min(30_000, 1000 * 2 ** (attempt++)) + Math.random() * 500;
    setTimeout(connectGuestbook, delay);
  };

  (window as any).sendGuestbook = (data: object) =>
    ws.send(JSON.stringify({ v: 1, type: "message.send", payload: data }));
}
```

---

## 19. Debugging & công cụ hỗ trợ

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
  -H "Origin: https://wedding.example.com" \
  -H "Cookie: guest_name=A"
```

**Log gợi ý cho server:**

```ts
ws.on("open",    () => console.log("[OPEN]", req.socket.remoteAddress));
ws.on("message", (m) => console.log("[MSG ]", m.toString().slice(0, 200)));
ws.on("close",   (c, r) => console.log("[CLOSE]", c, r.toString()));
ws.on("error",   (e) => console.error("[ERR ]", e));
```

---

## 20. Anti-patterns thường gặp

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| Lưu `message history` chỉ trong RAM của server | Lưu DB (Supabase/Postgres), WS chỉ để push |
| Tin tưởng `client.id`/`room` do client gửi | Server xác định identity từ session, kiểm tra quyền |
| Gửi JSON.stringify cho mọi client mọi lúc | Chỉ gửi cho room liên quan (broadcast hẹp) |
| Không có heartbeat → socket zombie giữ RAM | Ping/Pong 30s, terminate nếu chết |
| Reconnect ngay lập tức hàng loạt | Exponential backoff + jitter |
| Tự viết protocol riêng không version | Có trường `v` (version) để nâng cấp sau |
| Để server giữ toàn bộ state (VD trạng thái game) | State có thể recover từ DB/Redis |
| Bỏ qua kiểm tra `readyState` trước khi gửi | `safeSend()` wrapper |
| Log toàn bộ payload chứa PII/token | Che token, giới hạn log payload |
| Cho phép mọi Origin (`*`) | Allowlist Origin cụ thể |

---

## 21. Tài liệu tham khảo

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
