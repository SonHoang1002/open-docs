# Tích hợp Mobile ↔ Wedding API — Hợp đồng dùng chung cho Flutter & iOS

> Tài liệu này là **hợp đồng tích hợp** giữa backend `wedding-server` và hai client mobile
> (Flutter, iOS native). Nội dung mô tả đúng API hiện có, chỉ rõ các điểm chưa chuẩn hoá,
> đồng thời đưa ra thiết kế mục tiêu để hai client không phải “đoán” cách xử lý.
>
> Đọc kèm: [`api/02-rest-design.md`](./api/02-rest-design.md),
> [`websocket.md`](./websocket.md), [`flutter/flutter-basics.md`](./flutter/flutter-basics.md),
> [`ios/ios-basics.md`](./ios/ios-basics.md).

---

## Mục lục

1. [Phạm vi và nguyên tắc](#1-phạm-vi-và-nguyên-tắc)
2. [Kiến trúc và luồng dữ liệu](#2-kiến-trúc-và-luồng-dữ-liệu)
3. [Môi trường và cấu hình base URL](#3-môi-trường-và-cấu-hình-base-url)
4. [Hợp đồng REST hiện tại](#4-hợp-đồng-rest-hiện-tại)
5. [Mô hình dữ liệu và validation](#5-mô-hình-dữ-liệu-và-validation)
6. [Phân trang cursor và infinite scroll](#6-phân-trang-cursor-và-infinite-scroll)
7. [Realtime WebSocket](#7-realtime-websocket)
8. [Tầng networking phía client](#8-tầng-networking-phía-client)
9. [Auth và quản lý token](#9-auth-và-quản-lý-token)
10. [Xử lý lỗi và retry](#10-xử-lý-lỗi-và-retry)
11. [Offline-first, cache và đồng bộ](#11-offline-first-cache-và-đồng-bộ)
12. [Upload file và media (mở rộng)](#12-upload-file-và-media-mở-rộng)
13. [Push notification và deep link](#13-push-notification-và-deep-link)
14. [Bảo mật phía client](#14-bảo-mật-phía-client)
15. [Quan sát và debug](#15-quan-sát-và-debug)
16. [Testing hợp đồng](#16-testing-hợp-đồng)
17. [Versioning và quản lý thay đổi](#17-versioning-và-quản-lý-thay-đổi)
18. [Checklist backend và mobile](#18-checklist-backend-và-mobile)
19. [Mã mẫu Flutter (Dart)](#19-mã-mẫu-flutter-dart)
20. [Mã mẫu iOS (Swift)](#20-mã-mẫu-ios-swift)
21. [Anti-patterns](#21-anti-patterns)
22. [Tài liệu tham khảo](#22-tài-liệu-tham-khảo)

---

## 1. Phạm vi và nguyên tắc

### 1.1 Phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---|---|
| Hợp đồng REST `/api/messages` | Thiết kế UI chi tiết |
| WebSocket `/ws` | Hạ tầng Supabase self-host |
| Envelope, lỗi, pagination, realtime | Thanh toán, đăng nhập mạng xã hội |
| Auth token ở mức tích hợp | Chính sách bảo mật toàn hệ thống |
| Offline cache, retry, idempotency | Migration dữ liệu lịch sử |
| Testing, versioning, release | Quy trình pháp lý/App Store đầy đủ |

### 1.2 Nguyên tắc

1. **Backend là nguồn sự thật cuối cùng.** Client validation chỉ để phản hồi nhanh, không thay
   thế validation server.
2. **Không phá vỡ client cũ.** Thêm field mới là an toàn; đổi kiểu/xóa field là breaking change.
3. **Mọi thao tác ghi phải nghĩ tới retry.** Mạng mobile chập chờn; `POST` lặp có thể tạo trùng.
4. **Realtime là tăng cường, không phải nguồn dữ liệu duy nhất.** Luôn có đường tải lại bằng REST.
5. **Lỗi phải phân loại được**: network, timeout, HTTP 4xx, HTTP 5xx, parse, business.
6. **Token và PII không bao giờ ghi log**; token lưu trong Keychain/Keystore, không trong
   `SharedPreferences`/`UserDefaults`.
7. **Hợp đồng được kiểm thử tự động**, không chỉ đọc bằng mắt.

---

## 2. Kiến trúc và luồng dữ liệu

```text
┌────────────────────┐        HTTPS/JSON         ┌──────────────────────────┐
│ Flutter app        │ ────────────────────────► │                          │
│  UI → state → repo │ ◄──────────────────────── │  Bun + Hono              │
│  local cache       │        WSS /ws            │   ├─ /api/messages       │
└────────────────────┘ ◄──────────────────────── │   ├─ /ws (broadcast)     │
                                                 │   └─ Supabase client     │
┌────────────────────┐        HTTPS/JSON         │          │               │
│ iOS app            │ ────────────────────────► │          ▼               │
│  SwiftUI → service │ ◄──────────────────────── │   PostgreSQL (Supabase)  │
│  Keychain/CoreData │        WSS /ws            │   bảng messages          │
└────────────────────┘ ◄──────────────────────── └──────────────────────────┘
```

### 2.1 Luồng đọc danh sách

1. App gọi `GET /api/messages` (lần đầu, không cursor).
2. Server trả tối đa 20 bản ghi mới nhất, đã đảo lại theo thứ tự thời gian tăng dần.
3. App render; nếu `data.length == 20`, cho phép cuộn thêm.
4. Cuộn lên đầu danh sách → gọi `GET /api/messages?before=<created_at>`.
5. Server trả 20 bản ghi cũ hơn cursor; app **prepend** và giữ vị trí cuộn.
6. Nếu `data.length < 20` → đã hết dữ liệu.

### 2.2 Luồng ghi

1. App validate form → tạo payload.
2. Gửi `POST /api/messages` (kèm `Idempotency-Key` khi backend hỗ trợ).
3. Server insert Supabase, trả bản ghi vừa tạo.
4. Server broadcast `new_message` tới mọi client đang mở `/ws`.
5. App nhận response **và** có thể nhận lại event; phải dedupe theo `id`.

### 2.3 Luồng cập nhật/xóa

1. Admin gửi `PUT /api/messages/:id` hoặc `DELETE /api/messages/:id`.
2. Server cập nhật DB, broadcast `update_message` (hiện tại dùng chung type cho cả update/xóa).
3. Client nhận event: nếu có `data` đầy đủ → replace; nếu chỉ có `id` → xóa khỏi list.
4. Thiết kế mục tiêu: tách `message.updated` / `message.deleted`.

---

## 3. Môi trường và cấu hình base URL

### 3.1 Bảng môi trường

| Môi trường | API base URL | WebSocket URL | Ghi chú |
|---|---|---|---|
| Local — iOS Simulator | `http://localhost:3000` | `ws://localhost:3000/ws` | Simulator dùng chung network với Mac |
| Local — Android Emulator | `http://10.0.2.2:3000` | `ws://10.0.2.2:3000/ws` | `10.0.2.2` là alias của host |
| Local — thiết bị thật | `http://<LAN-IP>:3000` | `ws://<LAN-IP>:3000/ws` | Cùng Wi-Fi; mở firewall port 3000 |
| Staging | `https://staging-api.example.com` | `wss://staging-api.example.com/ws` | Bắt buộc HTTPS/WSS |
| Production | `https://api.example.com` | `wss://api.example.com/ws` | Không dùng HTTP/WS trần |

### 3.2 Quy tắc cấu hình

- Base URL **không hard-code** trong widget/service; đọc từ config theo flavor/scheme.
- Tách `apiBaseUrl` và `wsBaseUrl`; có thể suy ra WS từ API nhưng nên cấu hình riêng.
- Không commit secret. Chỉ commit file mẫu (`config/dev.example.json`, `.env.example`).
- Kiểm tra URL một lần lúc khởi động; fail-fast nếu thiếu hoặc sai scheme.
- Trên iOS, HTTP local bị **ATS** chặn; thêm `NSAppTransportSecurity` ngoại lệ **chỉ cho
  debug/local**, không bật cho production.
- Trên Android, HTTP cleartext bị chặn từ API 28; dùng `networkSecurityConfig` chỉ cho debug.

### 3.3 Ví dụ cấu hình Flutter

```dart
// lib/core/config/app_config.dart
class AppConfig {
  const AppConfig({required this.apiBaseUrl, required this.wsBaseUrl});

  final Uri apiBaseUrl;
  final Uri wsBaseUrl;

  factory AppConfig.fromEnvironment() {
    const api = String.fromEnvironment('API_BASE_URL');
    const ws = String.fromEnvironment('WS_BASE_URL');
    if (api.isEmpty || ws.isEmpty) {
      throw StateError('Thiếu API_BASE_URL hoặc WS_BASE_URL khi build.');
    }
    return AppConfig(apiBaseUrl: Uri.parse(api), wsBaseUrl: Uri.parse(ws));
  }
}
```

```bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000 \
  --dart-define=WS_BASE_URL=ws://10.0.2.2:3000/ws
```

### 3.4 Ví dụ cấu hình iOS

```swift
// Config/AppConfig.swift
import Foundation

struct AppConfig: Sendable {
    let apiBaseURL: URL
    let wsBaseURL: URL

    static func load(bundle: Bundle = .main) -> AppConfig {
        guard
            let api = bundle.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
            let ws = bundle.object(forInfoDictionaryKey: "WS_BASE_URL") as? String,
            let apiURL = URL(string: api),
            let wsURL = URL(string: ws)
        else {
            fatalError("Thiếu API_BASE_URL/WS_BASE_URL trong Info.plist")
        }
        return AppConfig(apiBaseURL: apiURL, wsBaseURL: wsURL)
    }
}
```

> 💡 Với iOS, khai báo giá trị theo từng configuration trong `.xcconfig` rồi inject vào
> `Info.plist`; không sửa tay `Info.plist` mỗi lần đổi môi trường.

---

## 4. Hợp đồng REST hiện tại

Base path hiện tại: `/api/messages`. **Chưa có versioning**; thiết kế mục tiêu là `/api/v1/messages`.

| Method | Path | Mục đích | Auth hiện tại | Thành công |
|---|---|---|---|---|
| `GET` | `/api/messages/` | Danh sách 20 lời chúc mới nhất | Không | `200` |
| `POST` | `/api/messages` | Tạo lời chúc | Không | `200` (mục tiêu `201`) |
| `PUT` | `/api/messages/:id` | Cập nhật toàn bộ lời chúc | Không | `200` |
| `DELETE` | `/api/messages/:id` | Xóa một lời chúc | Không | `200` |
| `DELETE` | `/api/messages` | Xóa **toàn bộ** lời chúc | Không | `200` |
| `WS` | `/ws` | Nhận event realtime | Không | `101` |

> ⚠️ `DELETE /api/messages` là thao tác phá huỷ, hiện không có auth. Không expose endpoint này
> ra internet. Thiết kế mục tiêu: yêu cầu role admin, audit log, hoặc bỏ hẳn.

### 4.1 `GET /api/messages/`

Query:

| Tên | Kiểu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `before` | ISO 8601 string | Không | Lấy các bản ghi có `created_at < before` |

Response hiện tại:

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "sender_name": "Nguyễn Minh Anh",
      "content": "Chúc hai bạn trăm năm hạnh phúc!",
      "will_attend": true,
      "guest_of": "Bạn thân cô dâu",
      "number_attend": 2,
      "created_at": "2026-10-25T10:00:00.000Z"
    }
  ]
}
```

Đặc điểm cần biết:

- Giới hạn cứng 20 bản ghi/lần; không có tham số `limit`.
- Server sắp xếp giảm dần rồi `reverse()` → client nhận **tăng dần**.
- Cursor chỉ dùng `created_at`. Nếu nhiều bản ghi cùng timestamp, có thể **mất hoặc trùng**
  ở ranh giới trang. Thiết kế mục tiêu: cursor `(created_at, id)` mã hoá base64.
- Response không có `has_more`; client suy ra từ `data.length == 20`.
- Lỗi DB trả `500` với `{ success: false, error: "..." }`.

### 4.2 `POST /api/messages`

Request:

```json
{
  "sender_name": "Nguyễn Minh Anh",
  "content": "Chúc hai bạn trăm năm hạnh phúc!",
  "will_attend": true,
  "guest_of": "Bạn thân cô dâu",
  "number_attend": 2
}
```

| Field | Kiểu | Bắt buộc | Ràng buộc đề xuất |
|---|---|---|---|
| `sender_name` | string | Có | 1–80 ký tự, trim |
| `content` | string | Có | 1–1000 ký tự, trim |
| `will_attend` | boolean | Không | Mặc định `false`/`null` theo UI |
| `guest_of` | string \| null | Không | ≤ 100 ký tự |
| `number_attend` | integer \| null | Không | 1–20 nếu `will_attend = true` |

Response hiện tại: `{ "success": true, "data": { ...bản ghi... } }`.

> ⚠️ Code hiện tại dùng `sender_name.isEmpty` (không phải `.length === 0`), nên validation
> thực tế **không chặn** được input rỗng. Client phải validate; backend cần sửa trước khi
> public.

### 4.3 `PUT /api/messages/:id`

Request giống `POST` nhưng gửi **đầy đủ** các field (PUT là replace). Response hiện tại là
`{ "success": true, "data": [ ... ] }` vì Supabase `.select()` trả mảng — client phải xử lý
cả object và array trong giai đoạn chuyển tiếp.

Khuyến nghị:

- Đổi sang `PATCH` nếu chỉ cập nhật một phần.
- Trả về object đơn lẻ (`201/200` + `data` object).
- Thêm `updated_at`, `version` để optimistic locking.

### 4.4 `DELETE /api/messages/:id`

Response hiện tại: `{ "success": true, "data": null }` (không select lại bản ghi).

Server broadcast:

```json
{ "type": "update_message", "data": { "id": 42 } }
```

Đây là **quirk hiện tại**: dùng `update_message` cho cả xóa. Client nên kiểm tra `data` có
đủ field hay chỉ có `id`; thiết kế mục tiêu là event `message.deleted`.

### 4.5 `DELETE /api/messages`

Xóa toàn bộ bản ghi (`neq("id", 0)`), **không broadcast**, **không auth**. Chỉ dùng trong
development/test. Nếu cần giữ, thêm:

- `Authorization: Bearer <admin token>`
- Audit log (ai xóa, khi nào, bao nhiêu bản ghi)
- Feature flag tắt ở production
- Cân nhắc `TRUNCATE` có kiểm soát thay vì xóa từng dòng.

### 4.6 Hợp đồng mục tiêu (đề xuất)

| Method | Path | Thành công | Lỗi chính |
|---|---|---|---|
| `GET` | `/api/v1/messages?limit=20&cursor=...` | `200` | `400`, `429`, `500` |
| `POST` | `/api/v1/messages` | `201` + `Location` | `400`, `409`, `422`, `429` |
| `PATCH` | `/api/v1/messages/:id` | `200` | `400`, `404`, `412`, `422` |
| `DELETE` | `/api/v1/messages/:id` | `204` | `401`, `403`, `404` |
| `GET` | `/api/v1/messages/:id` | `200` | `404` |

Envelope mục tiêu:

```json
{
  "data": { "...": "..." },
  "meta": { "request_id": "req_01J9Z3K7", "next_cursor": null, "has_more": false }
}
```

Lỗi mục tiêu dùng `application/problem+json` (RFC 9457), xem `api/02` mục 9.

---

## 5. Mô hình dữ liệu và validation

### 5.1 Model chung

| Field | Kiểu DB | Kiểu mobile | Ghi chú |
|---|---|---|---|
| `id` | integer identity | `int` / `Int` | Không đổi sau khi tạo |
| `sender_name` | text | `String` | Trim, không rỗng |
| `content` | text | `String` | Giữ emoji/newline |
| `will_attend` | boolean | `bool?` / `Bool?` | Có thể chưa trả lời |
| `guest_of` | text | `String?` | Khách của ai |
| `number_attend` | integer | `int?` / `Int?` | Số người đi cùng |
| `created_at` | timestamptz | `DateTime` | Parse ISO 8601 UTC |
| `updated_at` | timestamptz | `DateTime?` | Chưa có trong schema hiện tại |
| `version` | integer | `int?` | Đề xuất cho optimistic locking |

### 5.2 Quy tắc parse

- `id` có thể là number; không parse thành string.
- `created_at` luôn coi là UTC, hiển thị theo timezone thiết bị.
- `will_attend` có thể `null`; không mặc định `false` một cách âm thầm nếu UI cần phân biệt
  “chưa trả lời” và “không tham dự”.
- `number_attend` có thể `null`; nếu `will_attend = true` mà null, hiển thị “chưa rõ”.
- Response có thể thay đổi thứ tự field; không phụ thuộc thứ tự JSON.
- Bỏ qua field lạ để tương thích khi backend thêm field mới.

### 5.3 Validation phía client

```dart
// Flutter
String? validateSenderName(String? value) {
  final v = value?.trim() ?? '';
  if (v.isEmpty) return 'Vui lòng nhập tên';
  if (v.length > 80) return 'Tên tối đa 80 ký tự';
  return null;
}

String? validateContent(String? value) {
  final v = value?.trim() ?? '';
  if (v.isEmpty) return 'Vui lòng nhập lời chúc';
  if (v.length > 1000) return 'Lời chúc tối đa 1000 ký tự';
  return null;
}
```

```swift
// iOS
enum MessageValidation {
    static func senderName(_ value: String) -> String? {
        let v = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if v.isEmpty { return "Vui lòng nhập tên" }
        if v.count > 80 { return "Tên tối đa 80 ký tự" }
        return nil
    }

    static func content(_ value: String) -> String? {
        let v = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if v.isEmpty { return "Vui lòng nhập lời chúc" }
        if v.count > 1_000 { return "Lời chúc tối đa 1000 ký tự" }
        return nil
    }
}
```

> ⚠️ Đếm ký tự: Dart `String.length` đếm UTF-16 code units; Swift `String.count` đếm
> grapheme clusters. Với emoji, hai bên có thể lệch. Backend nên là nơi quyết định giới hạn
> cuối cùng và trả lỗi rõ ràng.

---

## 6. Phân trang cursor và infinite scroll

### 6.1 Vì sao không dùng offset?

`OFFSET 1000` buộc DB quét và bỏ 1000 dòng; càng sâu càng chậm. Khi có bản ghi mới chèn
vào đầu, offset còn gây **trùng/lặp**. Với guestbook (dữ liệu tăng dần theo thời gian),
keyset/cursor là lựa chọn đúng.

### 6.2 Cursor hiện tại

```http
GET /api/messages/?before=2026-10-25T09:58:00.000Z
```

Server dùng `created_at < before`, limit 20, order desc, rồi reverse.

**Vấn đề:** nhiều bản ghi có thể cùng `created_at` (đặc biệt khi seed hoặc insert nhanh).
Điều kiện `<` sẽ bỏ sót các bản ghi cùng mốc; điều kiện `<=` sẽ lặp.

**Mục tiêu:** cursor ghép:

```text
cursor = base64url(created_at + "|" + id)
WHERE (created_at, id) < (cursor_created_at, cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT 20
```

PostgreSQL hỗ trợ so sánh row value:

```sql
SELECT *
FROM messages
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### 6.3 Thuật toán infinite scroll phía client

```text
state: items = [], cursor = null, hasMore = true, loading = false

loadInitial():
  reset items, cursor, hasMore
  page = GET /messages
  items = page.data
  cursor = page.data.first.created_at
  hasMore = page.data.length == 20

loadMore():
  if (!hasMore || loading) return
  loading = true
  page = GET /messages?before=cursor
  // loại bỏ bản ghi đã có để chống trùng
  newItems = page.data.filter(x => !items.any(y => y.id == x.id))
  items = newItems + items
  cursor = page.data.first?.created_at ?? cursor
  hasMore = page.data.length == 20
  loading = false
```

### 6.4 Dedupe và merge

- Luôn dedupe theo `id`, không theo `content`.
- Khi nhận WebSocket event, kiểm tra `id` đã có trong list chưa:
  - Có → replace (nếu là update) hoặc remove (nếu là delete).
  - Chưa → insert đúng vị trí theo `created_at`, không chỉ append.
- Khi refresh (pull-to-refresh), tải lại trang đầu; có thể giữ các item cũ nếu chưa chắc
  đã bị xóa, nhưng phải dedupe.

### 6.5 UI/UX

- Hiển thị skeleton cho lần tải đầu; spinner nhỏ cho load more.
- Giữ vị trí cuộn khi prepend: dùng `ScrollController` + `itemCount` delta, hoặc
  `CustomScrollView` với `center` key.
- Nếu lỗi load more: hiện nút “Thử lại”, không xóa dữ liệu đã có.
- Nếu hết dữ liệu: hiện “Bạn đã xem hết lời chúc”.

---

## 7. Realtime WebSocket

### 7.1 Kết nối

```text
ws://localhost:3000/ws        (local)
wss://api.example.com/ws      (production)
```

Hiện tại server không yêu cầu auth, không ping/pong, không gửi event chào mừng.

### 7.2 Event hiện tại

| Event | Khi nào | Payload |
|---|---|---|
| `new_message` | Sau khi `POST` thành công | `{ "type": "new_message", "data": Message }` |
| `update_message` | Sau `PUT` thành công | `{ "type": "update_message", "data": Message[] }` (Supabase trả mảng) |
| `update_message` | Sau `DELETE :id` | `{ "type": "update_message", "data": { "id": 42 } }` |

> ⚠️ `data` của update hiện là **mảng** (do `.select()`), trong khi `new_message` là object.
> Client phải kiểm tra kiểu. Thiết kế mục tiêu: luôn là object và tách event name.

### 7.3 Envelope mục tiêu

```json
{
  "type": "message.created",
  "event_id": "evt_01J9Z4",
  "occurred_at": "2026-10-25T10:00:00.000Z",
  "data": { "id": 42, "sender_name": "..." }
}
```

Quy ước:

- `type`: namespace `resource.action` (`message.created`, `message.updated`, `message.deleted`).
- `event_id`: dùng để dedupe khi reconnect hoặc nhận trùng.
- `occurred_at`: thời gian server, không tin đồng hồ client.
- `data`: object đầy đủ cho create/update; với delete có thể chỉ `{ id }`.

### 7.4 Reconnect và heartbeat

```text
connect():
  ws = new WebSocket(url)
  onOpen: reset backoff, start heartbeat
  onMessage: parse JSON, dedupe event_id, dispatch
  onError/onClose: scheduleReconnect()

scheduleReconnect():
  attempt += 1
  delay = min(30s, 1s * 2^attempt) + random(0..500ms)
  setTimeout(connect, delay)

heartbeat:
  mỗi 25–30s gửi ping (nếu server hỗ trợ) hoặc message `{type:"ping"}`
  nếu quá 2 chu kỳ không có pong → đóng và reconnect
```

Hiện server chưa xử lý ping/pong; client có thể gửi text `ping` nhưng server sẽ broadcast
nó cho client khác. Đừng dựa vào heartbeat cho tới khi backend hỗ trợ. Trong lúc chờ, dùng
timer kiểm tra `readyState` và reconnect khi đóng.

### 7.5 Đồng bộ sau reconnect

Không có replay buffer. Sau khi reconnect:

1. Gọi `GET /api/messages` (trang đầu) để lấy trạng thái mới nhất.
2. Merge với list hiện có theo `id`.
3. Tiếp tục nhận event.

Nếu cần “không mất event”, backend phải lưu event (outbox/event log) và hỗ trợ
`Last-Event-ID` hoặc cursor replay — chưa có trong repo.

### 7.6 Flutter (Dart)

```dart
import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

class MessageSocket {
  MessageSocket(this._url);

  final Uri _url;
  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  int _attempt = 0;
  bool _closedByUser = false;

  final _events = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get events => _events.stream;

  void connect() {
    _closedByUser = false;
    _channel = WebSocketChannel.connect(_url);
    _channel!.stream.listen(
      (raw) {
        _attempt = 0;
        final decoded = jsonDecode(raw as String);
        if (decoded is Map<String, dynamic>) _events.add(decoded);
      },
      onError: (_) => _scheduleReconnect(),
      onDone: _scheduleReconnect,
      cancelOnError: true,
    );
  }

  void _scheduleReconnect() {
    if (_closedByUser) return;
    _reconnectTimer?.cancel();
    final seconds = (1 << _attempt).clamp(1, 30);
    _attempt = (_attempt + 1).clamp(0, 5);
    _reconnectTimer = Timer(Duration(seconds: seconds), connect);
  }

  Future<void> close() async {
    _closedByUser = true;
    _reconnectTimer?.cancel();
    await _channel?.sink.close();
    await _events.close();
  }
}
```

### 7.7 iOS (Swift)

```swift
import Foundation

@MainActor
final class MessageSocket {
    private let url: URL
    private var task: URLSessionWebSocketTask?
    private var attempt = 0
    private var closedByUser = false

    var onEvent: ((Data) -> Void)?

    init(url: URL) { self.url = url }

    func connect() {
        closedByUser = false
        let task = URLSession.shared.webSocketTask(with: url)
        self.task = task
        task.resume()
        receiveLoop()
    }

    private func receiveLoop() {
        task?.receive { [weak self] result in
            guard let self else { return }
            switch result {
            case .success(let message):
                self.attempt = 0
                switch message {
                case .data(let data): self.onEvent?(data)
                case .string(let text): self.onEvent?(Data(text.utf8))
                @unknown default: break
                }
                self.receiveLoop()
            case .failure:
                self.scheduleReconnect()
            }
        }
    }

    private func scheduleReconnect() {
        guard !closedByUser else { return }
        let seconds = min(30, 1 << min(attempt, 5))
        attempt += 1
        DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(seconds)) { [weak self] in
            self?.connect()
        }
    }

    func close() {
        closedByUser = true
        task?.cancel(with: .goingAway, reason: nil)
        task = nil
    }
}
```

> ⚠️ `URLSessionWebSocketTask` không tự reconnect; phải tự quản lý. Khi app vào background,
> iOS có thể đóng socket; lắng nghe scene phase và reconnect khi active trở lại.

---

## 8. Tầng networking phía client

### 8.1 Kiến trúc đề xuất

```text
UI (widget/view)
  └─ state/controller (Riverpod Notifier, Bloc, ObservableObject)
       └─ repository (cache + network + sync)
            ├─ remote data source (API client)
            └─ local data source (DB/cache)
```

Quy tắc:

- UI không gọi HTTP trực tiếp.
- Repository là nơi quyết định “lấy cache hay gọi mạng”.
- API client chỉ lo HTTP, parse, lỗi transport; không chứa business rule UI.
- Model dùng chung cho response; mapper riêng nếu DB model khác API model.

### 8.2 Timeout, retry, cancellation

| Thao tác | Timeout đề xuất | Retry |
|---|---|---|
| `GET` list | 10s | 2 lần, exponential backoff + jitter |
| `POST` create | 15s | Chỉ khi có idempotency key; nếu không, không auto-retry |
| `PUT/PATCH` | 15s | Chỉ khi idempotent (replace cùng dữ liệu) |
| `DELETE` | 10s | Có thể retry (idempotent theo id) |
| WebSocket | 10s connect | Backoff tới 30s |

- Retry chỉ khi lỗi **transient**: timeout, connection reset, 502/503/504, 429 (tôn trọng
  `Retry-After`).
- Không retry 400/401/403/404/422.
- Hủy request khi user rời màn hình (Dio `CancelToken`, Swift `Task.cancel()`).

### 8.3 Idempotency

Hiện backend **chưa hỗ trợ** `Idempotency-Key`. Thiết kế mục tiêu:

```http
POST /api/v1/messages
Idempotency-Key: 8f14e45f-ea3b-4c2e-9f7a-6b1d2c3a4e5f
```

- Client tạo UUID cho mỗi lần submit, giữ nguyên khi retry.
- Server lưu key + response trong 24h; request trùng trả lại response cũ.
- Nếu backend chưa có, client nên disable nút submit trong lúc gửi và không auto-retry `POST`.

### 8.4 Nén và kích thước

- JSON nhỏ (20 item) không cần nén; bật `gzip`/`br` ở gateway nếu list lớn.
- Giới hạn body server (ví dụ 256KB) để chống abuse; client không gửi field thừa.
- Với ảnh, dùng upload riêng/presigned URL, không base64 trong JSON.

---

## 9. Auth và quản lý token

### 9.1 Hiện trạng

Toàn bộ endpoint `/api/messages` đang **public**, không có auth. Điều này phù hợp demo
guestbook nhưng không đủ cho production (ai cũng có thể xóa dữ liệu).

### 9.2 Mục tiêu

| Actor | Quyền |
|---|---|
| Guest (anonymous) | `GET` list, `POST` tạo lời chúc (có rate limit/captcha) |
| Admin | `GET` list đầy đủ, `PATCH`, `DELETE`, xem thống kê |
| Service | Token nội bộ cho job/backoffice |

### 9.3 Token

- Admin đăng nhập → nhận access token (JWT, ngắn hạn 15–60 phút) + refresh token (dài hạn,
  rotation).
- Gửi `Authorization: Bearer <access_token>`.
- Lưu token:
  - Flutter: `flutter_secure_storage` (Keychain/Keystore).
  - iOS: Keychain với `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`.
- Không lưu token trong `SharedPreferences`/`UserDefaults`/biến static lâu dài.
- Refresh token một lần (single-flight) để tránh nhiều request refresh đồng thời.
- Logout: xóa token local + gọi endpoint revoke nếu có.

### 9.4 Interceptor refresh (Dart, Dio)

```dart
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._refresh);

  final Future<String?> Function() _refresh;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) return handler.next(err);
    final token = await _refresh();
    if (token == null) return handler.next(err);
    final request = err.requestOptions;
    request.headers['Authorization'] = 'Bearer $token';
    try {
      final response = await Dio().fetch(request);
      handler.resolve(response);
    } on DioException catch (e) {
      handler.next(e);
    }
  }
}
```

> ⚠️ Đây là ví dụ tối giản; production cần mutex/single-flight, tránh vòng lặp refresh vô hạn,
> và xử lý trường hợp refresh token hết hạn.

### 9.5 iOS token storage

```swift
import Security

enum KeychainStore {
    static func save(_ data: Data, service: String, account: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError(status) }
    }
}
```

---

## 10. Xử lý lỗi và retry

### 10.1 Phân loại lỗi

| Loại | Ví dụ | Retry? | UI |
|---|---|---|---|
| Network không có mạng | `SocketException`, `NSURLErrorNotConnectedToInternet` | Có khi có mạng lại | “Không có kết nối”, nút thử lại |
| Timeout | quá 10–15s | Có (backoff) | “Kết nối chậm”, thử lại |
| 4xx do input | 400/422 | Không | Hiển thị lỗi field |
| 401/403 | token hết hạn/không quyền | Refresh token một lần | Đăng nhập lại |
| 404 | resource đã bị xóa | Không | Xóa khỏi list / báo không tồn tại |
| 409 | xung đột | Không auto, hỏi user | “Dữ liệu đã thay đổi” |
| 429 | rate limit | Có, theo `Retry-After` | “Thử lại sau X giây” |
| 5xx | lỗi server | Có giới hạn | “Server đang bận” |
| Parse/contract | JSON sai schema | Không auto | Log + “Dữ liệu không hợp lệ” |

### 10.2 Mô hình lỗi phía client

```dart
sealed class ApiFailure implements Exception {
  const ApiFailure(this.message);
  final String message;
}

final class NetworkFailure extends ApiFailure {
  const NetworkFailure() : super('Không có kết nối mạng');
}

final class TimeoutFailure extends ApiFailure {
  const TimeoutFailure() : super('Kết nối quá thời gian');
}

final class HttpFailure extends ApiFailure {
  const HttpFailure(this.statusCode, this.code, String message) : super(message);
  final int statusCode;
  final String? code;
}

final class ParseFailure extends ApiFailure {
  const ParseFailure() : super('Dữ liệu trả về không hợp lệ');
}
```

```swift
enum APIFailure: Error, Sendable {
    case network(String)
    case timeout
    case http(status: Int, code: String?, message: String)
    case decoding
    case cancelled
}
```

### 10.3 Backoff có jitter

```text
delay = min(maxDelay, base * 2^attempt) * random(0.5...1.0)
```

Ví dụ: 0.5s, 1s, 2s, 4s… tối đa 30s. Jitter tránh hàng nghìn client reconnect cùng lúc.

### 10.4 Hiển thị lỗi

- Luôn có thông điệp tiếng Việt dễ hiểu + mã lỗi kỹ thuật ẩn để hỗ trợ.
- Không hiển thị raw stack trace/SQL error.
- Với form: map lỗi field từ `errors[].path` nếu backend trả RFC 9457.
- Với list: giữ dữ liệu cũ, hiện banner lỗi, cho phép thử lại.

---

## 11. Offline-first, cache và đồng bộ

### 11.1 Khi nào cần?

Guestbook tại tiệc có thể mất Wi-Fi. Offline-first hữu ích cho:

- Xem lời chúc đã tải trước đó.
- Soạn lời chúc khi mạng yếu, gửi lại sau.
- Admin kiểm duyệt offline (nếu có cache).

Không cần offline cho thống kê realtime chính xác tuyệt đối.

### 11.2 Kiến trúc cache

```text
Remote API ──► Repository ──► Local DB (SQLite/Core Data/SwiftData)
                   │                 │
                   └──► UI ◄─────────┘
```

- Cache theo `id`, lưu `created_at`, `updated_at`, `sync_state`.
- Trang đầu: luôn thử mạng; nếu lỗi, đọc cache.
- Load more: ưu tiên cache nếu đã có; nếu thiếu, gọi mạng.
- Ghi: optimistic update + outbox.

### 11.3 Outbox pattern

| Bước | Hành động |
|---|---|
| 1 | User submit → lưu vào `outbox` với `local_id`, `payload`, `state=pending` |
| 2 | UI hiển thị item “đang gửi” (dùng `local_id`) |
| 3 | Sync worker gửi API; thành công → thay `local_id` bằng `server_id`, `state=synced` |
| 4 | Thất bại tạm thời → `state=failed`, retry có backoff |
| 5 | Thất bại vĩnh viễn (422) → đánh dấu `rejected`, hiện lỗi cho user |

Khi backend chưa có idempotency key, outbox `POST` có thể tạo trùng nếu request tới server
nhưng response bị mất. Vì vậy:

- Ưu tiên bổ sung `Idempotency-Key` ở backend.
- Trong lúc chờ, chỉ retry khi chắc chắn request chưa tới server (khó), hoặc chấp nhận rủi ro
  và cho admin xóa bản ghi trùng.

### 11.4 Conflict resolution

Hiện schema chưa có `version`/`updated_at`. Đề xuất:

- Thêm `updated_at timestamptz`, `version integer`.
- Update gửi `If-Match: "<version>"`; server trả `412` nếu lệch.
- Client chọn:
  - **Server wins** cho guestbook công khai (đơn giản).
  - **Manual merge** cho admin edit (hiện conflict).
- Với delete/create, dùng `id`/`local_id` để dedupe.

### 11.5 UI trạng thái

- `sending`: icon đồng hồ nhỏ, chặn sửa/xóa.
- `failed`: icon cảnh báo + “Gửi lại”.
- `synced`: bình thường.
- `rejected`: hiện lỗi validation, cho sửa và gửi lại.

> ⚠️ Không hiển thị item `pending` như đã thành công. Nếu server từ chối, user sẽ thấy
> lời chúc “biến mất” mà không hiểu vì sao.

---

## 12. Upload file và media (mở rộng)

Hiện backend **chưa có** endpoint upload. Nếu muốn cho khách gửi ảnh:

### 12.1 Thiết kế đề xuất

1. Client xin presigned URL: `POST /api/v1/uploads` với `content_type`, `size`.
2. Server kiểm tra quyền, giới hạn (5MB, jpeg/png/heic), trả URL + `object_key`.
3. Client upload trực tiếp lên storage (S3/Supabase Storage) bằng PUT.
4. Client gửi `POST /api/v1/messages` kèm `media_key`.
5. Server xác minh object tồn tại, quét virus/nội dung, rồi lưu message.

### 12.2 Quy tắc client

- Không base64 ảnh trong JSON.
- Resize trước khi upload (ví dụ max 2048px) để tiết kiệm data.
- Hiển thị progress; cho hủy.
- Retry upload được (PUT idempotent theo key) nhưng không retry vô hạn.
- Xử lý ảnh HEIC: convert sang JPEG nếu server không hỗ trợ.
- Xóa ảnh khi message bị xóa (server-side lifecycle).

---

## 13. Push notification và deep link

### 13.1 Hiện trạng

Backend chưa gửi push. Đây là thiết kế mục tiêu.

### 13.2 Luồng push

```text
Admin duyệt lời chúc
  → Backend lưu notification
  → Gửi FCM (Android) / APNs (iOS)
  → Client nhận, hiển thị
  → User tap → deep link tới message
```

### 13.3 Đăng ký device token

```http
POST /api/v1/devices
{
  "platform": "ios",          // ios | android
  "token": "APNs-or-FCM-token",
  "app_version": "1.2.0",
  "locale": "vi-VN"
}
```

- Gọi lại khi token đổi (iOS/Android đều có thể rotate).
- Xóa token khi logout hoặc token invalid.
- Backend lưu token theo user/device, tránh gửi trùng.

### 13.4 Payload gợi ý

```json
{
  "notification": {
    "title": "Lời chúc mới",
    "body": "Nguyễn Minh Anh vừa gửi lời chúc"
  },
  "data": {
    "type": "message.created",
    "message_id": "42",
    "deeplink": "wedding://messages/42"
  }
}
```

### 13.5 Deep link

| Loại | Ví dụ | Ghi chú |
|---|---|---|
| Custom scheme | `wedding://messages/42` | Dễ, nhưng app khác có thể chiếm |
| Universal Link (iOS) | `https://wedding.example.com/messages/42` | Cần `apple-app-site-association` |
| App Link (Android) | `https://wedding.example.com/messages/42` | Cần `assetlinks.json` |

- Luôn kiểm tra message tồn tại trước khi mở; nếu không, hiện thông báo.
- Nếu app chưa đăng nhập và route cần auth → lưu pending link, mở sau khi login.

---

## 14. Bảo mật phía client

| Rủi ro | Biện pháp |
|---|---|
| Token bị đọc | Keychain/Keystore, không log, không backup plaintext |
| MITM | HTTPS/WSS, ATS, không tắt certificate validation |
| Certificate giả | Certificate pinning (cân nhắc vận hành; có thể làm app không vào được khi rotate) |
| Jailbreak/root | Phát hiện mức cơ bản, không coi là tuyệt đối |
| Debug build lộ log | Tắt verbose log ở release; dùng `kReleaseMode`/`#if DEBUG` |
| PII trong analytics | Không gửi tên/lời chúc; chỉ gửi event ẩn danh |
| Screenshot nhạy cảm | iOS: che khi background nếu cần; Android: `FLAG_SECURE` |
| Deep link độc hại | Validate scheme/host/path; không mở URL tùy ý |
| WebView | Hạn chế; nếu dùng, chặn navigation ngoài allowlist |

### 14.1 Không làm

- Không tắt ATS toàn cục để “cho nhanh”.
- Không nhúng API secret trong app (ai cũng extract được).
- Không dùng `http://` cho production.
- Không log toàn bộ response/request body chứa tên khách.

---

## 15. Quan sát và debug

### 15.1 Request ID

- Backend nên trả `X-Request-Id` cho mọi response.
- Client log request ID khi lỗi; hiển thị mã ngắn cho user khi cần hỗ trợ.
- Nếu backend chưa có, client tự sinh `X-Request-Id` (UUID) và gửi kèm; server có thể log.

### 15.2 Log phía client

| Môi trường | Mức log | Nội dung |
|---|---|---|
| Debug | verbose | method, URL, status, thời gian; **không** token/PII |
| Staging | info | lỗi, retry, reconnect, sync |
| Production | warning/error | lỗi đã khử PII, crash, network failure |

### 15.3 Metrics cần theo dõi

- Tỷ lệ lỗi API theo endpoint/status.
- p50/p95 latency của list/create.
- Tỷ lệ reconnect WebSocket, thời gian downtime.
- Tỷ lệ sync outbox thất bại.
- Crash-free users, ANR/hang (Android), hang rate (iOS).

### 15.4 Debug checklist

1. Base URL đúng môi trường? (Android emulator dùng `10.0.2.2`)
2. Thiết bị và server cùng mạng? Firewall port 3000?
3. HTTPS/WSS certificate hợp lệ? ATS/cleartext config?
4. Token còn hạn? Header đúng `Bearer`?
5. Response có đúng envelope? `data` là object hay array?
6. WebSocket có mở không? Server log có client không?
7. Có proxy/VPN chặn WebSocket không?
8. Thử bằng `curl`/`wscat` để tách lỗi client vs server.

```bash
curl -i 'http://localhost:3000/api/messages/'

curl -i -X POST 'http://localhost:3000/api/messages' \
  -H 'Content-Type: application/json' \
  -d '{"sender_name":"Test","content":"Xin chào","will_attend":true,"number_attend":1}'

# WebSocket (cần cài wscat: npm i -g wscat)
wscat -c ws://localhost:3000/ws
```

---

## 16. Testing hợp đồng

### 16.1 Ma trận test tối thiểu

| Case | Flutter | iOS | Backend |
|---|---|---|---|
| List rỗng | Widget test | Unit test | Integration |
| List 20 item → load more | Widget/Integration | Unit/UI | Integration |
| Cursor trùng timestamp | Unit | Unit | SQL test |
| POST thành công | Unit + mock | Unit + mock | Integration |
| POST 422 | Unit | Unit | Integration |
| Mất mạng | Unit | Unit | — |
| Timeout | Unit | Unit | — |
| 401 → refresh token | Unit | Unit | Integration |
| WS new/update/delete | Integration | Integration | E2E |
| Reconnect sau khi server restart | Integration | Integration | Manual/chaos |
| Parse response lạ | Unit | Unit | Contract |

### 16.2 Mock server

- Dùng OpenAPI spec (`api/03-openapi.md`) + Prism/Mockoon/WireMock để sinh mock.
- Hoặc viết mock client đơn giản trả fixture JSON.
- Fixture nên có:
  - Trang đầy 20 item.
  - Trang cuối < 20 item.
  - Lỗi 422 RFC 9457.
  - Lỗi 500.
  - Response thiếu field (để test parse an toàn).

### 16.3 Contract test

- Chạy Schemathesis/Prism validate response thật với OpenAPI.
- Trong CI backend: gọi endpoint với DB test, validate schema.
- Trong CI mobile: dùng fixture được generate từ spec; nếu spec đổi, fixture đổi.

### 16.4 Ví dụ test Flutter

```dart
test('parse message list', () {
  final json = {
    'success': true,
    'data': [
      {
        'id': 1,
        'sender_name': 'An',
        'content': 'Chúc mừng',
        'will_attend': true,
        'guest_of': null,
        'number_attend': 2,
        'created_at': '2026-10-25T10:00:00.000Z',
      }
    ],
  };

  final page = MessagePage.fromJson(json);
  expect(page.items, hasLength(1));
  expect(page.items.first.id, 1);
  expect(page.hasMore, isFalse);
});
```

### 16.5 Ví dụ test iOS

```swift
func testDecodesMessageEnvelope() throws {
    let json = """
    {"success":true,"data":{"id":1,"sender_name":"An","content":"Chúc mừng",
     "will_attend":true,"guest_of":null,"number_attend":2,
     "created_at":"2026-10-25T10:00:00.000Z"}}
    """.data(using: .utf8)!

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    decoder.dateDecodingStrategy = .iso8601

    let envelope = try decoder.decode(APIEnvelope<GuestMessage>.self, from: json)
    XCTAssertEqual(envelope.data.id, 1)
    XCTAssertTrue(envelope.data.willAttend == true)
}
```

---

## 17. Versioning và quản lý thay đổi

### 17.1 Hiện trạng

Không có `/v1`; mọi thay đổi ảnh hưởng trực tiếp client. Đây là rủi ro lớn khi app đã phát hành.

### 17.2 Quy tắc tương thích

| Thay đổi | Breaking? | Cách làm |
|---|---|---|
| Thêm field vào response | Không | Client bỏ qua field lạ |
| Thêm query param optional | Không | Mặc định giữ hành vi cũ |
| Thêm endpoint | Không | Release độc lập |
| Đổi tên field | Có | Thêm field mới + deprecate field cũ |
| Đổi kiểu field | Có | Field mới + version mới |
| Bỏ field | Có | Deprecate tối thiểu 1 chu kỳ app |
| Đổi status code | Có | Version mới hoặc thương lượng |
| Đổi ý nghĩa `before` | Có | Giữ `before`, thêm `cursor` |

### 17.3 Chiến lược

1. **Ưu tiên mở rộng**: thêm field/endpoint, không sửa cái cũ.
2. **Deprecation có lịch**: header `Deprecation`, `Sunset`; thông báo tới client.
3. **Dual-write/dual-read** khi đổi schema lớn.
4. **Feature flag** cho hành vi mới; bật theo % hoặc theo app version.
5. **Theo dõi app version** qua header `X-App-Version`; log để biết bản cũ còn dùng.

### 17.4 Client version header

```http
X-App-Version: 1.2.0
X-Platform: ios
X-Request-Id: 8f14e45f-ea3b-4c2e-9f7a-6b1d2c3a4e5f
```

Backend có thể dùng để:

- Log/analytics.
- Trả message deprecation.
- Chặn version quá cũ (chỉ khi thật cần).

---

## 18. Checklist backend và mobile

### 18.1 Backend

- [ ] Có `/api/v1` hoặc chính sách versioning rõ ràng.
- [ ] Envelope và error format thống nhất (RFC 9457).
- [ ] Validation server thực sự hoạt động (không dựa vào `isEmpty`).
- [ ] Cursor `(created_at, id)` chống trùng/mất.
- [ ] `POST` hỗ trợ `Idempotency-Key`.
- [ ] Auth cho admin; rate limit cho guest.
- [ ] WebSocket event có `type`, `event_id`, `occurred_at`; tách create/update/delete.
- [ ] Heartbeat/ping-pong và replay hoặc hướng dẫn refresh sau reconnect.
- [ ] `DELETE /messages` được bảo vệ hoặc bỏ.
- [ ] CORS chỉ cho origin cần thiết.
- [ ] Log có request id, không lộ PII/stack.
- [ ] OpenAPI cập nhật cùng code; contract test trong CI.
- [ ] Có staging trước production.

### 18.2 Mobile

- [ ] Base URL theo môi trường, không hard-code.
- [ ] HTTPS/WSS ở production; ATS/cleartext chỉ mở cho debug.
- [ ] API client có timeout, retry có điều kiện, cancellation.
- [ ] Parse envelope an toàn; xử lý `data` object/array trong giai đoạn chuyển tiếp.
- [ ] Dedupe theo `id`; merge đúng thứ tự `created_at`.
- [ ] Infinite scroll giữ vị trí cuộn, có trạng thái hết dữ liệu/lỗi.
- [ ] WebSocket reconnect có backoff + jitter; refresh list sau reconnect.
- [ ] Token lưu Keychain/Keystore; refresh single-flight.
- [ ] Offline cache/outbox có trạng thái pending/failed/rejected.
- [ ] Log không chứa token/PII; tắt verbose ở release.
- [ ] Test case lỗi mạng/HTTP/parse/WS.
- [ ] Deep link/push (nếu có) được validate và test.
- [ ] Checklist release của Flutter/iOS đã hoàn tất.

---

## 19. Mã mẫu Flutter (Dart)

### 19.1 Model

```dart
class GuestMessage {
  const GuestMessage({
    required this.id,
    required this.senderName,
    required this.content,
    required this.willAttend,
    required this.guestOf,
    required this.numberAttend,
    required this.createdAt,
  });

  final int id;
  final String senderName;
  final String content;
  final bool? willAttend;
  final String? guestOf;
  final int? numberAttend;
  final DateTime createdAt;

  factory GuestMessage.fromJson(Map<String, dynamic> json) {
    return GuestMessage(
      id: (json['id'] as num).toInt(),
      senderName: json['sender_name'] as String? ?? '',
      content: json['content'] as String? ?? '',
      willAttend: json['will_attend'] as bool?,
      guestOf: json['guest_of'] as String?,
      numberAttend: (json['number_attend'] as num?)?.toInt(),
      createdAt: DateTime.parse(json['created_at'] as String).toUtc(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'sender_name': senderName,
        'content': content,
        'will_attend': willAttend,
        'guest_of': guestOf,
        'number_attend': numberAttend,
        'created_at': createdAt.toIso8601String(),
      };
}
```

### 19.2 API client

```dart
import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

class MessagePage {
  const MessagePage({required this.items, required this.hasMore});

  final List<GuestMessage> items;
  final bool hasMore;

  factory MessagePage.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] as List<dynamic>? ?? const []);
    final items = data
        .map((e) => GuestMessage.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
    return MessagePage(items: items, hasMore: items.length == 20);
  }
}

class WeddingApi {
  WeddingApi({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  final Uri baseUrl;
  final http.Client _client;

  Future<MessagePage> listMessages({String? before}) async {
    final uri = baseUrl.replace(
      path: '${baseUrl.path}/api/messages/',
      queryParameters: before == null ? null : {'before': before},
    );
    final response = await _client.get(uri).timeout(const Duration(seconds: 10));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200 || body['success'] != true) {
      throw ApiException.from(response.statusCode, body);
    }
    return MessagePage.fromJson(body);
  }

  Future<GuestMessage> createMessage({
    required String senderName,
    required String content,
    bool? willAttend,
    String? guestOf,
    int? numberAttend,
  }) async {
    final uri = baseUrl.replace(path: '${baseUrl.path}/api/messages');
    final response = await _client
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'sender_name': senderName,
            'content': content,
            'will_attend': willAttend,
            'guest_of': guestOf,
            'number_attend': numberAttend,
          }),
        )
        .timeout(const Duration(seconds: 15));

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200 || body['success'] != true) {
      throw ApiException.from(response.statusCode, body);
    }
    return GuestMessage.fromJson(body['data'] as Map<String, dynamic>);
  }

  void close() => _client.close();
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.message, {this.code});

  final int statusCode;
  final String message;
  final String? code;

  factory ApiException.from(int statusCode, Map<String, dynamic> body) {
    return ApiException(
      statusCode,
      (body['error'] ?? body['detail'] ?? 'Lỗi không xác định').toString(),
      code: body['code'] as String?,
    );
  }

  @override
  String toString() => 'ApiException($statusCode): $message';
}
```

> 💡 Trong production nên dùng `Dio` + interceptor để log/retry/refresh token tập trung; ví dụ
> trên dùng `http` để thấy rõ luồng cơ bản.

---

## 20. Mã mẫu iOS (Swift)

### 20.1 Model

```swift
import Foundation

struct GuestMessage: Codable, Identifiable, Sendable, Equatable {
    let id: Int
    let senderName: String
    let content: String
    let willAttend: Bool?
    let guestOf: String?
    let numberAttend: Int?
    let createdAt: Date
}

struct APIEnvelope<Value: Decodable>: Decodable {
    let success: Bool
    let data: Value
}

struct APIErrorBody: Decodable {
    let error: String?
    let title: String?
    let detail: String?
    let code: String?
}
```

### 20.2 API client

```swift
import Foundation

enum APIFailure: Error, Sendable {
    case network(String)
    case timeout
    case http(status: Int, code: String?, message: String)
    case decoding
}

actor WeddingAPI {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        self.decoder = decoder
    }

    func listMessages(before: Date? = nil) async throws -> [GuestMessage] {
        var components = URLComponents(
            url: baseURL.appendingPathComponent("api/messages/"),
            resolvingAgainstBaseURL: false
        )!
        if let before {
            components.queryItems = [
                URLQueryItem(name: "before", value: ISO8601DateFormatter().string(from: before))
            ]
        }

        var request = URLRequest(url: components.url!)
        request.timeoutInterval = 10
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIFailure.network("Invalid response")
        }
        guard http.statusCode == 200 else {
            let body = try? decoder.decode(APIErrorBody.self, from: data)
            throw APIFailure.http(
                status: http.statusCode,
                code: body?.code,
                message: body?.detail ?? body?.error ?? "HTTP \(http.statusCode)"
            )
        }

        do {
            let envelope = try decoder.decode(APIEnvelope<[GuestMessage]>.self, from: data)
            return envelope.data
        } catch {
            throw APIFailure.decoding
        }
    }

    func createMessage(
        senderName: String,
        content: String,
        willAttend: Bool?,
        guestOf: String?,
        numberAttend: Int?
    ) async throws -> GuestMessage {
        struct Payload: Encodable {
            let senderName: String
            let content: String
            let willAttend: Bool?
            let guestOf: String?
            let numberAttend: Int?
        }

        var request = URLRequest(url: baseURL.appendingPathComponent("api/messages"))
        request.httpMethod = "POST"
        request.timeoutInterval = 15
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(
            UUID().uuidString,
            forHTTPHeaderField: "Idempotency-Key"
        )
        request.httpBody = try JSONEncoder().encode(
            Payload(
                senderName: senderName,
                content: content,
                willAttend: willAttend,
                guestOf: guestOf,
                numberAttend: numberAttend
            )
        )

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIFailure.network("Invalid response")
        }
        guard http.statusCode == 200 else {
            let body = try? decoder.decode(APIErrorBody.self, from: data)
            throw APIFailure.http(
                status: http.statusCode,
                code: body?.code,
                message: body?.detail ?? body?.error ?? "HTTP \(http.statusCode)"
            )
        }

        do {
            let envelope = try decoder.decode(APIEnvelope<GuestMessage>.self, from: data)
            return envelope.data
        } catch {
            throw APIFailure.decoding
        }
    }
}
```

> ⚠️ `JSONEncoder` mặc định dùng camelCase; nếu dùng `Payload` như trên, backend nhận
> `senderName` thay vì `sender_name`. Hãy thêm `CodingKeys` hoặc cấu hình
> `keyEncodingStrategy = .convertToSnakeCase` cho encoder. Đây là lỗi rất phổ biến khi
> tích hợp Swift ↔ API snake_case.

### 20.3 Sửa encoder cho đúng

```swift
let encoder = JSONEncoder()
encoder.keyEncodingStrategy = .convertToSnakeCase
request.httpBody = try encoder.encode(payload)
```

---

## 21. Anti-patterns

| Anti-pattern | Hậu quả | Cách tránh |
|---|---|---|
| Hard-code `http://localhost:3000` | Chỉ chạy trên máy dev | Config theo flavor + `--dart-define`/xcconfig |
| Coi `data` luôn là object | Crash khi update trả array | Parse linh hoạt + contract test |
| Dùng `created_at` đơn làm cursor | Mất/trùng bản ghi cùng timestamp | Cursor `(created_at, id)` |
| Append mọi WS event vào cuối list | Sai thứ tự, trùng bản ghi | Insert theo `created_at`, dedupe `id` |
| Reconnect WS ngay lập tức | Reconnect storm khi server down | Exponential backoff + jitter |
| Retry `POST` vô điều kiện | Tạo lời chúc trùng | Idempotency key + disable submit |
| Lưu token trong `UserDefaults` | Token bị đọc khi máy compromise | Keychain/Keystore |
| Tắt ATS/cleartext toàn cục | Mất bảo mật production | Chỉ mở cho debug/local |
| Log toàn bộ request/response | Lộ tên, token, PII | Redact + log level |
| Chỉ validate client | Dữ liệu rác vào DB | Validate server + client |
| Hiển thị pending như đã gửi | User tưởng thành công | Trạng thái rõ ràng |
| Không version API | App cũ vỡ khi backend đổi | `/v1` + deprecation |
| Bỏ qua lỗi parse | Silent failure | Log + fallback + báo user |
| Test chỉ happy path | Production crash vì edge case | Test matrix lỗi/mạng/reconnect |
| Gửi ảnh base64 trong JSON | Payload lớn, chậm | Presigned upload |
| Deep link mở URL tùy ý | Open redirect/độc hại | Allowlist + validate |

---

## 22. Tài liệu tham khảo

- [`api/02-rest-design.md`](./api/02-rest-design.md) — thiết kế REST, pagination, lỗi, idempotency.
- [`api/03-openapi.md`](./api/03-openapi.md) — spec OpenAPI và contract testing.
- [`api/06-testing-observability.md`](./api/06-testing-observability.md) — test API và observability.
- [`websocket.md`](./websocket.md) — giao thức, reconnect, scaling.
- [`api-security.md`](./api-security.md) — auth, rate limit, OWASP.
- [`flutter/flutter-basics.md`](./flutter/flutter-basics.md) — Dart, HTTP, WebSocket.
- [`flutter/flutter-advanced.md`](./flutter/flutter-advanced.md) — state, offline-first, CI/CD.
- [`ios/ios-basics.md`](./ios/ios-basics.md) — Swift, URLSession, WebSocket.
- [`ios/ios-advanced.md`](./ios/ios-advanced.md) — concurrency, architecture, security.
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457)
- [OWASP Mobile Application Security](https://mas.owasp.org/)
