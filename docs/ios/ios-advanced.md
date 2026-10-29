# iOS Advanced — Kiến trúc, offline-first và realtime production

> Dành cho người đã hoàn thành [`ios-basics.md`](./ios-basics.md). Nội dung đi sâu vào
> kiến trúc feature-first, dependency injection, concurrency, Observation, sync engine,
> push, background, bảo mật, performance, module hóa và CI. Ví dụ vẫn dùng API
> `/api/messages` và WebSocket `/ws` của wedding guestbook.

Code dùng **Swift 6 compiler** (Swift 5 language mode), deployment target **iOS 17.0**.
API chỉ có trên iOS 18+ sẽ được ghi rõ.

---

## Mục lục

1. [Kiến trúc app guestbook](#1-kiến-trúc-app-guestbook)
2. [Dependency injection và composition root](#2-dependency-injection-và-composition-root)
3. [Swift concurrency nâng cao](#3-swift-concurrency-nâng-cao)
4. [SwiftUI nâng cao và Observation](#4-swiftui-nâng-cao-và-observation)
5. [Navigation và deep link](#5-navigation-và-deep-link)
6. [Networking nâng cao](#6-networking-nâng-cao)
7. [Realtime nâng cao](#7-realtime-nâng-cao)
8. [Offline-first và sync engine](#8-offline-first-và-sync-engine)
9. [Persistence nâng cao](#9-persistence-nâng-cao)
10. [Push notifications với APNs](#10-push-notifications-với-apns)
11. [Background tasks và lifecycle](#11-background-tasks-và-lifecycle)
12. [Security và auth](#12-security-và-auth)
13. [Performance và memory](#13-performance-và-memory)
14. [Testing nâng cao](#14-testing-nâng-cao)
15. [Modularization và SPM](#15-modularization-và-spm)
16. [CI/CD](#16-cicd)
17. [Observability và feature flags](#17-observability-và-feature-flags)
18. [Accessibility và localization](#18-accessibility-và-localization)
19. [Anti-patterns nâng cao và bài tập](#19-anti-patterns-nâng-cao-và-bài-tập)
20. [Tài liệu tham khảo](#20-tài-liệu-tham-khảo)

---

## 1. Kiến trúc app guestbook

Mục tiêu: UI mỏng, business logic test được, realtime và cache thay thế được. Với quy mô
guestbook, **feature-first + protocol seam** đủ tốt; không cần TCA/Redux nếu team chưa có
kinh nghiệm vận hành.

| Layer | Trách nhiệm | Ví dụ |
|---|---|---|
| App | Entry point, composition root, scene | `GuestbookApp`, `AppDependencies` |
| Features | View + feature model | `GuestbookScreen`, `GuestbookStore` |
| Core/Domain | Model, protocol, validation | `GuestMessage`, `GuestbookService` |
| Core/Data | REST, WebSocket, cache, sync | `GuestbookAPI`, `MessageCache` |
| DesignSystem | Token màu, font, component | `GuestbookCard`, `BrandColor` |

**Quy tắc phụ thuộc:** Feature được phép import Domain và Data protocol; Data không import
Feature; UI không gọi `URLSession` trực tiếp. Một chiều giúp thay backend, thêm cache hoặc
test mà không sửa View.

```swift
struct GuestMessage: Codable, Identifiable, Hashable, Sendable {
    let id: Int
    let senderName: String
    let content: String
    let willAttend: Bool
    let guestOf: String
    let numberAttend: Int
    let createdAt: Date
}

enum GuestbookRoute: Hashable {
    case message(Int)
    case compose
}
```

> ⚠️ Đừng tạo “God Store” giữ network, cache, push, analytics và navigation. Tách theo
> feature; một store chỉ sở hữu state của một màn hình/luồng.

---

## 2. Dependency injection và composition root

Không dùng singleton toàn cục cho service. Tạo dependency ở `@main`, inject qua
initializer hoặc `Environment`. Cách này giữ preview/test thay thế được và tránh giữ
object sống ngoài ý muốn.

```swift
protocol GuestbookService: Sendable {
    func fetchMessages(before: Date?) async throws -> [GuestMessage]
    func createMessage(_ draft: NewGuestMessage) async throws -> GuestMessage
}

@MainActor
protocol RealtimeStreaming: Sendable {
    func events() -> AsyncStream<RealtimeEvent>
    func stop()
}

protocol MessageCache: Sendable {
    func all() async -> [GuestMessage]
    func upsert(_ message: GuestMessage) async
    func replaceAll(_ messages: [GuestMessage]) async
}

struct AppDependencies {
    let service: any GuestbookService
    let realtime: any RealtimeStreaming
    let cache: any MessageCache

    @MainActor
    static func live() -> AppDependencies {
        AppDependencies(
            service: GuestbookAPI(baseURL: AppConfig.apiBaseURL),
            realtime: RealtimeClient(url: AppConfig.webSocketURL),
            cache: SwiftDataMessageCache(container: AppDatabase.container)
        )
    }
}
```

**Quy ước:** API/realtime/cache sống theo app và được tạo ở composition root; feature store
theo màn hình (`@State`); form draft theo sheet (`@State`). `@main` tạo
`AppDependencies.live()` một lần rồi truyền vào `GuestbookScreen`; không để View tự khởi
tạo service.

> 💡 Preview inject `AppDependencies` giả thay vì gọi mạng. Với iOS 17+, có thể đưa
> dependency vào `.environment(...)` và đọc bằng `@Environment(AppDependencies.self)`.

---

## 3. Swift concurrency nâng cao

### 3.1 Actor làm cache và chống data race

`actor` bảo vệ mutable state khỏi truy cập đồng thời. Cache là ứng viên tự nhiên vì vừa bị
đọc bởi UI, vừa bị ghi bởi sync/realtime.

```swift
actor InMemoryMessageCache: MessageCache {
    private var messages: [Int: GuestMessage] = [:]

    func upsert(_ message: GuestMessage) async {
        messages[message.id] = message
    }

    func replaceAll(_ incoming: [GuestMessage]) async {
        messages = Dictionary(uniqueKeysWithValues: incoming.map { ($0.id, $0) })
    }

    func all() async -> [GuestMessage] {
        messages.values.sorted { $0.createdAt < $1.createdAt }
    }
}
```

### 3.2 TaskGroup, cancellation và timeout

Chỉ dùng `TaskGroup` khi các việc thật sự độc lập. Phân trang tuần tự phải `await` từng
trang vì `before` phụ thuộc trang trước. Khi cần đọc song song cache và network, dùng
`async let` rồi merge theo `id`; nhớ rằng kết quả network mới hơn cache.

Với timeout, thêm một task `Task.sleep` vào `withThrowingTaskGroup`, lấy kết quả đầu tiên
rồi `cancelAll()`. Không cần custom helper nếu `URLSession` đã có timeout.

**Quy tắc:**

- `.task` tự huỷ khi View biến mất; vòng lặp dài gọi `try Task.checkCancellation()`.
- Không `Task.detached` để “chạy nền” UI update; mất actor context và cancellation.
- `Task.sleep` là điểm huỷ; dùng `try` nếu cần dừng ngay.
- `@MainActor` cho state UI; actor cho cache/DB; không đánh dấu mọi thứ `@MainActor`.
- Tránh `Task { }` không lưu handle trong View nếu cần huỷ; ưu tiên `.task`/`.task(id:)`.

### 3.3 Sendable và isolation

Model qua actor/thread phải `Sendable`; struct toàn `let` là lựa chọn đơn giản. Closure
gửi vào TaskGroup cần `@Sendable`. Nếu compiler báo lỗi isolation, sửa thiết kế dữ liệu
hơn là thêm `@unchecked Sendable` cho có.

> ⚠️ `@unchecked Sendable` che lỗi data race thật. Chỉ dùng khi type bất biến hoặc đã được
> bảo vệ bởi lock/actor và có comment giải thích.

---

## 4. SwiftUI nâng cao và Observation

### 4.1 `@Observable` thay `ObservableObject`

iOS 17 có Observation: property thay đổi chỉ invalidate view đọc property đó, giảm body
recompute so với `@Published` phát cho toàn bộ object.

```swift
@MainActor
@Observable
final class GuestbookStore {
    private(set) var messages: [GuestMessage] = []
    private(set) var isLoading = false
    var errorMessage: String?

    private let service: any GuestbookService

    init(service: any GuestbookService) { self.service = service }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        do { messages = try await service.fetchMessages(before: nil) }
        catch { errorMessage = error.localizedDescription }
    }
}
```

`GuestbookScreen` đọc `store.messages`, dùng `List`, `.overlay` cho loading và
`.task { await store.refresh() }`; không cần `@ObservedObject` khi store là `@Observable`.

**Khi nào dùng gì:**

| Wrapper | Dùng với | Ghi chú |
|---|---|---|
| `@State` | `@Observable` object | Owner tạo và giữ object |
| `@Bindable` | `@Observable` object | Tạo `Binding` tới property |
| `@Environment` | `@Observable`/value | Inject dependency hoặc store |
| `@StateObject` | `ObservableObject` legacy | Tương thích Combine |
| `@ObservedObject` | `ObservableObject` legacy | Object do cha sở hữu |

Chỉ dùng Combine khi phải tích hợp API cũ (`NotificationCenter`, `Timer`, SDK). Với code
mới, `AsyncSequence` + `for await` dễ huỷ và dễ test hơn; bridge bằng `publisher.values`.

> 💡 Không trộn `@Observable` và `ObservableObject` trong cùng một store. Chọn một mô hình
> state cho cả feature để tránh bug update không nhất quán.

---

## 5. Navigation và deep link

Dùng `NavigationStack(path:)` với route `Hashable`. Không truyền cả object lớn vào route;
truyền `id` rồi đọc từ store/cache để deep link và state restoration hoạt động.

```swift
enum DeepLink {
    static func route(from url: URL) -> GuestbookRoute? {
        guard url.scheme == "guestbook" else { return nil }
        switch url.host {
        case "message":
            return Int(url.lastPathComponent).map(GuestbookRoute.message)
        case "compose":
            return .compose
        default:
            return nil
        }
    }
}
```

```swift
.onOpenURL { url in
    if let route = DeepLink.route(from: url) { path.append(route) }
}
```

**Universal Links** cần `Associated Domains` (`applinks:guestbook.wedding.example`) và file
`apple-app-site-association` trên domain. Không dùng custom scheme cho link công khai vì
app khác có thể chiếm scheme.

| Loại link | Dùng khi | Lưu ý |
|---|---|---|
| Custom scheme | Debug, share nội bộ | Không có fallback web |
| Universal Link | Link công khai, marketing | Cần HTTPS + AASA + team ID |
| Push payload | Mở đúng màn hình từ notification | Luôn kiểm tra object còn tồn tại |

> ⚠️ Khi mở deep link tới message đã bị xoá, hiện empty state thay vì crash hoặc màn hình
> trắng. Route chỉ là con trỏ, không phải nguồn dữ liệu.

---

## 6. Networking nâng cao

### 6.1 Retry có backoff, jitter và giới hạn

Chỉ retry lỗi tạm thời (`408`, `429`, `5xx`, lỗi mạng). Không retry `400`, `401`, `403`,
`404` vì lặp lại không đổi kết quả.

```swift
struct RetryPolicy: Sendable {
    var maxAttempts = 4
    var baseDelay: Duration = .milliseconds(400)

    func delay(for attempt: Int) -> Duration {
        let exponential = baseDelay * pow(2.0, Double(attempt))
        let jitter = Double.random(in: 0...0.3)
        return exponential + .milliseconds(Int(jitter * 1000))
    }

    func shouldRetry(status: Int?) -> Bool {
        guard let status else { return true }
        return status == 408 || status == 429 || (500..<600).contains(status)
    }
}
```

Vòng retry: `for attempt in 0..<policy.maxAttempts`, gọi API, chỉ `throw` ngay khi status
không retry được, còn lại `try await Task.sleep(for: policy.delay(for: attempt))`.

### 6.2 Timeout, cache và connectivity

```swift
let config = URLSessionConfiguration.default
config.timeoutIntervalForRequest = 15
config.timeoutIntervalForResource = 30
config.waitsForConnectivity = true
let session = URLSession(configuration: config)
```

`waitsForConnectivity` giúp request chờ mạng thay vì fail ngay, nhưng đừng bật cho request
cần phản hồi tức thời. `URLCache` chỉ dùng cho GET; không cache POST.

**POST an toàn:** backend hiện chưa có idempotency key, nên retry POST có thể tạo tin trùng.
Client nên giữ draft và kiểm tra danh sách sau khi timeout; giải pháp bền vững là thêm
`client_id` unique ở backend.

> 💡 `429` phải tôn trọng `Retry-After` nếu server trả. Với guestbook, hiển thị “Thử lại sau
> ít phút” thay vì spam request.

---

## 7. Realtime nâng cao

### 7.1 Trạng thái, reconnect và backoff

Client production cần state rõ ràng, backoff có jitter và refresh sau reconnect.

```swift
enum RealtimeEvent: Sendable {
    case connected
    case created(GuestMessage)
    case updated(GuestMessage)
    case deleted(Int)
    case waiting(seconds: Int)
}
```

```swift
@MainActor
final class RealtimeClient: RealtimeStreaming {
    private let url: URL
    private var socket: URLSessionWebSocketTask?
    private var task: Task<Void, Never>?
    private var attempt = 0

    init(url: URL) { self.url = url }

    func events() -> AsyncStream<RealtimeEvent> {
        let (stream, continuation) = AsyncStream<RealtimeEvent>.makeStream()
        task = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                do {
                    let socket = URLSession.shared.webSocketTask(with: self.url)
                    self.socket = socket
                    socket.resume()
                    self.attempt = 0
                    continuation.yield(.connected)
                    while !Task.isCancelled {
                        let message = try await socket.receive()
                        guard let data = payload(from: message),
                              let event = try? JSONDecoder.guestbook
                                .decode(SocketEvent.self, from: data).event
                        else { continue }
                        continuation.yield(event)
                    }
                } catch {
                    guard !Task.isCancelled else { break }
                    self.attempt += 1
                    let seconds = min(30, 1 << min(self.attempt, 5))
                    let jitter = Double.random(in: 0...0.5)
                    continuation.yield(.waiting(seconds: seconds))
                    try? await Task.sleep(for: .seconds(Double(seconds) + jitter))
                }
            }
            continuation.finish()
        }
        return stream
    }

    func stop() {
        task?.cancel()
        task = nil
        socket?.cancel(with: .normalClosure, reason: nil)
        socket = nil
    }
}
```

### 7.2 Heartbeat và phát hiện kết nối chết

WebSocket có thể “half-open”: TCP chưa đóng nhưng server đã mất. Gửi `sendPing` mỗi ~25
giây; nếu callback trả lỗi, `cancel(with: .goingAway)` để vòng reconnect chạy. Heartbeat
phải nằm trong cùng task với receive để `stop()` huỷ được cả hai.

### 7.3 Reconnect không làm mất dữ liệu

Backend hiện không có sequence number hay replay buffer. Sau mỗi lần reconnect: gọi
`GET /api/messages/`, merge theo `id` và xoá message không còn trong cửa sổ. Không giả định
event nào cũng tới.

Xử lý event theo hướng idempotent: `.connected` → refetch; `.created`/`.updated` → upsert
cache và merge theo `id`; `.deleted` → xoá khỏi cache/list; `.waiting` → chỉ cập nhật UI.
Merge phải thay thế phần tử cũ, không append mù, để event lặp không tạo bản ghi trùng.

> ⚠️ Không dựa vào WebSocket để biết “đã có đủ dữ liệu”. REST/DB là source of truth; socket
> chỉ giảm độ trễ. Đây là lý do reconnect luôn kèm refetch.

---

## 8. Offline-first và sync engine

### 8.1 Mô hình

Guestbook có thể đọc offline; ghi offline phức tạp hơn vì backend chưa có idempotency và
`updated_at`. Chiến lược thực tế:

| Thao tác | Offline | Ghi chú |
|---|---|---|
| Đọc 20 tin | Có, từ cache | Hiện banner “Đang offline” |
| Gửi lời chúc | Có, xếp outbox | Có thể trùng nếu retry |
| Sửa/xoá | Không khuyến khích | Thiếu version để giải quyết conflict |
| Realtime | Không | Socket bị suspend ở background |

### 8.2 Outbox

```swift
enum OutboxState: String, Codable, Sendable { case pending, sending, failed }

struct OutboxItem: Codable, Identifiable, Sendable {
    let id: UUID
    let draft: NewGuestMessage
    var state: OutboxState
    var lastError: String?
    var createdAt: Date
}
```

```swift
actor SyncEngine {
    private let service: any GuestbookService
    private let cache: MessageCache
    private var outbox: [OutboxItem] = []
    private var isSyncing = false

    init(service: any GuestbookService, cache: MessageCache) {
        self.service = service
        self.cache = cache
    }

    func enqueue(_ draft: NewGuestMessage) {
        outbox.append(OutboxItem(id: UUID(), draft: draft, state: .pending,
                                 lastError: nil, createdAt: .now))
    }

    func sync() async {
        guard !isSyncing else { return }
        isSyncing = true
        defer { isSyncing = false }
        for item in outbox where item.state != .sending {
            do {
                await cache.upsert(try await service.createMessage(item.draft))
                outbox.removeAll { $0.id == item.id }
            } catch {
                if let index = outbox.firstIndex(where: { $0.id == item.id }) {
                    outbox[index].state = .failed
                    outbox[index].lastError = error.localizedDescription
                }
            }
        }
    }
}
```

Trong code thật, trạng thái `sent` rõ ràng hơn thay vì tái dùng `.pending`. Ví dụ trên giữ
ngắn gọn nhưng thể hiện nguyên tắc: **một item chỉ bị xoá sau khi server xác nhận**.

### 8.3 Conflict resolution

| Tình huống | Cách xử lý |
|---|---|
| Hai client gửi hai tin khác nhau | Không conflict; cả hai là tin mới |
| Sửa cùng một tin | Server thắng; refetch sau khi reconnect |
| Xoá khi offline | Không cho phép ở client |
| Tin đã xoá nhưng cache còn | Reconcile theo danh sách server |

> ⚠️ Đừng tự chế “last write wins” khi schema không có `updated_at`/version. Không có dữ
> liệu thời gian chính xác thì mọi so sánh chỉ là phỏng đoán.

---

## 9. Persistence nâng cao

### 9.1 SwiftData cho cache

```swift
import SwiftData

@Model
final class CachedMessage {
    @Attribute(.unique) var id: Int
    var senderName: String
    var content: String
    var willAttend: Bool
    var guestOf: String
    var numberAttend: Int
    var createdAt: Date

    init(_ message: GuestMessage) {
        (id, senderName, content, willAttend, guestOf, numberAttend, createdAt) = (
            message.id, message.senderName, message.content, message.willAttend,
            message.guestOf, message.numberAttend, message.createdAt
        )
    }
}
```

```swift
actor SwiftDataMessageCache: MessageCache {
    private let context: ModelContext
    init(container: ModelContainer) { context = ModelContext(container) }

    func all() async -> [GuestMessage] {
        let descriptor = FetchDescriptor<CachedMessage>(sortBy: [SortDescriptor(\.createdAt)])
        return ((try? context.fetch(descriptor)) ?? []).map(\.asGuestMessage)
    }

    func upsert(_ message: GuestMessage) async {
        context.insert(CachedMessage(message))
        try? context.save()
    }

    func replaceAll(_ messages: [GuestMessage]) async {
        try? context.delete(model: CachedMessage.self)
        messages.forEach { context.insert(CachedMessage($0)) }
        try? context.save()
    }
}
```

`@Attribute(.unique)` giúp tránh trùng `id`; tuy nhiên `insert` cùng unique key có thể throw.
Trong production, fetch theo id rồi update thay vì insert mù.

### 9.2 Migration và dung lượng

- Đặt `VersionedSchema` + `SchemaMigrationPlan` ngay từ đầu nếu dự kiến đổi model.
- Giới hạn cache (ví dụ 200 tin gần nhất) và không lưu PII không cần thiết để app không phình.
- Cache nên nằm ở thư mục Caches hoặc exclude khỏi iCloud backup nếu tái tạo được.

> 💡 Core Data vẫn hợp lý cho app legacy hoặc cần quan hệ phức tạp. Đừng migrate chỉ vì
> SwiftData mới; hãy cân nhắc migration cost và test.

---

## 10. Push notifications với APNs

Backend hiện **chưa có** endpoint đăng ký device token. Phần này là thiết kế production,
không phải contract đang chạy.

### 10.1 Luồng

Luồng: app xin quyền → `registerForRemoteNotifications()` → APNs trả device token → app
gửi token về backend (endpoint tương lai). Server push khi có tin mới hoặc RSVP thay đổi;
app mở đúng màn hình từ payload qua `userNotificationCenter(_:didReceive:)`.

```swift
let token = deviceToken.map { String(format: "%02x", $0) }.joined()
Task { await DeviceAPI.register(token: token) }
```

Xin quyền bằng `UNUserNotificationCenter.current().requestAuthorization(options:)`, sau đó
gọi `UIApplication.shared.registerForRemoteNotifications()` khi user đồng ý.

### 10.2 Payload và privacy

```json
{
  "aps": { "alert": { "title": "Lời chúc mới", "body": "Lan vừa gửi lời chúc" }, "badge": 1 },
  "message_id": 42
}
```

Không đưa toàn bộ nội dung lời chúc vào payload nếu đó là dữ liệu riêng tư; payload có thể
hiện trên lock screen. Gửi `message_id`, để app fetch nội dung khi mở.

| Môi trường | APNs host | Ghi chú |
|---|---|---|
| Development | `api.sandbox.push.apple.com` | Build debug/TestFlight nội bộ |
| Production | `api.push.apple.com` | App Store |

> ⚠️ Simulator có thể nhận push giả lập bằng `xcrun simctl push`, nhưng không thay thế test
> thiết bị thật với APNs production.

---

## 11. Background tasks và lifecycle

iOS suspend app khi vào background; WebSocket không được giữ mở vô hạn. Dùng background
task cho việc ngắn, `BGTaskScheduler` cho refresh định kỳ.

```swift
import BackgroundTasks

func registerBackgroundTasks() {
    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.example.guestbook.refresh", using: nil
    ) { task in
        guard let refresh = task as? BGAppRefreshTask else { return }
        let operation = Task { await GuestbookSync.shared.refresh() }
        refresh.expirationHandler = { operation.cancel() }
        Task {
            await operation.value
            refresh.setTaskCompleted(success: !operation.isCancelled)
        }
    }
    let request = BGAppRefreshTaskRequest(identifier: "com.example.guestbook.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
    try? BGTaskScheduler.shared.submit(request)
}
```

| API | Thời lượng | Dùng cho |
|---|---|---|
| `BGAppRefreshTask` | Ngắn, hệ thống quyết định | Refresh guestbook, badge |
| `BGProcessingTask` | Dài hơn, cần điện năng | Migrate cache, dọn file |
| `beginBackgroundTask` | ~30 giây | Hoàn tất ghi file/upload nhỏ |

> ⚠️ Không dùng background task để giữ WebSocket sống. Nếu cần realtime khi app mở, dùng
> socket; khi app đóng, dùng push.

---

## 12. Security và auth

Backend hiện không có auth cho các route ghi. Trước khi public, tối thiểu phải có:

| Route | Hiện tại | Production |
|---|---|---|
| `GET /api/messages/` | Công khai | Có thể công khai có rate limit |
| `POST /api/messages` | Công khai | Captcha/rate limit hoặc RSVP token |
| `PUT /api/messages/:id` | Công khai | Chỉ admin |
| `DELETE /api/messages/:id` | Công khai | Chỉ admin |

### 12.1 Token trong Keychain

```swift
struct AuthToken: Codable, Sendable {
    let accessToken: String
    let expiresAt: Date
}
```

Đọc/ghi bằng `SecItemCopyMatching`/`SecItemAdd` với `kSecClassGenericPassword`, service cố
định và account theo user. Khi decode lỗi hoặc token hết hạn, xoá item và đăng nhập lại.

**Quy tắc:**

- Không log token, device token hay nội dung lời chúc riêng tư.
- Dùng `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` cho token; không sync iCloud.
- Access token ngắn hạn; refresh token luân chuyển và revoke được.
- WebSocket auth: gửi token qua header/subprotocol, không đặt token trong URL (log/proxy).
- ATS bật mặc định; chỉ `NSAllowsLocalNetworking` cho dev.
- Certificate pinning chỉ khi có quy trình rotate; pin sai làm chết app hàng loạt.

### 12.2 Validate phía client

Backend kiểm tra `sender_name.isEmpty` và `content.isEmpty` — đây là kiểm tra thô, không
trim khoảng trắng và không giới hạn độ dài. Client phải:

```swift
func validate(name: String, content: String) throws {
    let name = name.trimmingCharacters(in: .whitespacesAndNewlines)
    let content = content.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !name.isEmpty else { throw ValidationError.emptyName }
    guard name.count <= 60 else { throw ValidationError.tooLong(60) }
    guard !content.isEmpty else { throw ValidationError.emptyContent }
    guard content.count <= 500 else { throw ValidationError.tooLong(500) }
}
```

> ⚠️ Không coi client validation là bảo mật. Server vẫn phải validate, rate limit và phân
> quyền; client validation chỉ cải thiện UX.

---

## 13. Performance và memory

### 13.1 Đo trước khi tối ưu

| Công cụ | Đo gì | Cách dùng |
|---|---|---|
| Instruments Time Profiler | CPU hotspot | Product → Profile |
| Allocations/Leaks | Memory, retain cycle | Chạy luồng list + form |
| Network | Request thừa, payload lớn | Lọc host localhost |
| MetricKit | Launch, hang, crash | Thu thập trên TestFlight |
| Xcode Organizer | Launch time, battery | Dữ liệu người dùng thật |

### 13.2 SwiftUI performance

- `List`/`LazyVStack` thay `VStack` cho danh sách dài; `id` ổn định theo `Identifiable`,
  không dùng `ForEach(0..<count)` cho dữ liệu động.
- Tránh format Date/number trong `body` lặp lại; dùng `Text(date, format: .dateTime)` hoặc
  cache `DateFormatter`.
- Không gọi network/DB đồng bộ trong `body`; tách subview để giảm phạm vi invalidate.
- Ảnh: downsample theo kích thước hiển thị, không giữ `UIImage` gốc trong list. Dùng
  `CGImageSourceCreateThumbnailAtIndex` thay vì decode full ảnh.

> 💡 Đừng tối ưu bằng cảm giác. Ghi lại số đo trước/sau trên cùng thiết bị, cùng build
> configuration; iPhone cũ chậm hơn simulator rất nhiều.

---

## 14. Testing nâng cao

### 14.1 Test seam

| Thành phần | Cách test |
|---|---|
| Validation | Unit test thuần, không async |
| Store | Stub `GuestbookService`, cache in-memory |
| API client | `URLProtocol` stub, kiểm tra request/response |
| Realtime | Fake `RealtimeStreaming` yield event |
| Sync engine | Fake clock, kiểm tra retry/outbox |
| UI | XCUITest cho luồng gửi và empty state |

Dùng `URLProtocol` stub gắn vào `URLSessionConfiguration.ephemeral` để không gọi mạng thật:
`canInit` trả `true`, `startLoading` trả response/data đã chuẩn bị, `stopLoading` để trống.
Reset handler trong `tearDown` để test không dính state.

### 14.2 Test retry mà không chờ thật

Đưa `sleep` và `now` qua protocol để test nhanh, deterministic.

```swift
protocol Sleeper: Sendable {
    func sleep(for duration: Duration) async throws
}

struct ImmediateSleeper: Sleeper {
    func sleep(for duration: Duration) async throws {}
}
```

> ⚠️ Test có `Task.sleep(seconds: 2)` làm CI chậm và flaky. Inject clock/sleeper; chỉ giữ
> một vài integration test chạy thật.

---

## 15. Modularization và SPM

Tách module khi build chậm, ranh giới layer bị phá hoặc nhiều app dùng chung. Với guestbook
nhỏ, bắt đầu bằng 2–3 package là đủ.

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GuestbookKit",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "GuestbookCore", targets: ["GuestbookCore"]),
        .library(name: "GuestbookUI", targets: ["GuestbookUI"])
    ],
    targets: [
        .target(name: "GuestbookCore"),
        .target(name: "GuestbookUI", dependencies: ["GuestbookCore"]),
        .testTarget(name: "GuestbookCoreTests", dependencies: ["GuestbookCore"])
    ]
)
```

| Module | Nội dung | Không được import |
|---|---|---|
| `GuestbookCore` | Model, API, cache, sync | SwiftUI |
| `GuestbookUI` | View, DesignSystem | URLSession trực tiếp |
| `GuestbookTestSupport` | Fixture, stub | Production target |

**Quy tắc:** dependency một chiều; protocol ở Core, implementation ở App/Data. Tránh
`@_exported import` vì che dependency thật và làm build chậm.

> 💡 Đo thời gian build trước/sau khi tách. Tách quá sớm với 5 file làm tăng boilerplate mà
> không cải thiện tốc độ.

---

## 16. CI/CD

### 16.1 Pipeline tối thiểu

```yaml
name: ios-ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4
      - run: xcodebuild -resolvePackageDependencies -scheme Guestbook
      - name: Test
        run: |
          xcodebuild test -scheme Guestbook \
            -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
            -resultBundlePath TestResults.xcresult \
            CODE_SIGNING_ALLOWED=NO
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: test-results, path: TestResults.xcresult }
```

### 16.2 Build và ký

- CI không giữ certificate cá nhân; dùng App Store Connect API key + `xcodebuild
  -allowProvisioningUpdates` hoặc fastlane match trong secret store.
- Tách job test (không signing) và job archive có signing; archive Release cho
  `generic/platform=iOS` và lưu `.xcarchive`, dSYM, build number theo từng run.
- Cache SPM/DerivedData có kiểm soát; cache bẩn gây lỗi khó tái hiện.

> ⚠️ Không đưa `-allowProvisioningUpdates` vào mọi build local; nó có thể tạo/sửa profile
> ngoài ý muốn. Chỉ dùng trong CI có team và App Store Connect API key.

---

## 17. Observability và feature flags

### 17.1 Log có cấu trúc

```swift
import OSLog

let log = Logger(subsystem: "com.example.guestbook", category: "network")
log.info("GET messages status=\(status, privacy: .public) count=\(count)")
log.debug("Reconnect attempt=\(attempt, privacy: .public)")
```

Không log tên khách, nội dung lời chúc, token. Dùng `privacy: .private` cho dữ liệu nhạy
cảm hoặc bỏ hoàn toàn.

### 17.2 Metric và crash

| Tín hiệu | Nguồn | Ngưỡng hành động |
|---|---|---|
| Crash-free sessions | Crashlytics/Sentry/MetricKit | < 99.5% phải điều tra |
| Launch time | MetricKit/Xcode Organizer | > 2s trên thiết bị cũ |
| Network error rate | Log/analytics | > 5% trong 15 phút |
| Reconnect rate | Realtime log | Tăng đột biến sau release |
| Sync backlog | Outbox count | > 20 item hoặc > 10 phút |

### 17.3 Feature flags

Feature flag cho phép tắt realtime/offline sync khi backend lỗi mà không phát hành bản mới.
Giữ flag trong một struct `Sendable` (`offlineSyncEnabled`, `pushEnabled`) đọc từ remote
config, có giá trị `default` an toàn khi không tải được.

> 💡 Flag phải có ngày hết hạn và owner. Flag tồn tại mãi sẽ biến code thành ma trận không
> ai dám xoá.

---

## 18. Accessibility và localization

### 18.1 Accessibility

- Mọi button/icon có `.accessibilityLabel`; row đọc tên + lời chúc, không đọc từng mảnh.
- Dynamic Type: dùng font semantic, tránh `.frame(height:)` cố định cho text.
- Contrast và Reduce Motion: kiểm tra màu brand ở cả hai theme, tắt animation lớn bằng
  `@Environment(\.accessibilityReduceMotion)`.
- VoiceOver đọc theo nội dung, không theo thứ tự code; form báo lỗi bằng text kèm
  accessibility announcement.

```swift
VStack(alignment: .leading, spacing: 4) {
    Text(message.senderName).font(.headline)
    Text(message.content).font(.body)
}
.accessibilityElement(children: .combine)
.accessibilityLabel("\(message.senderName): \(message.content)")
```

### 18.2 Localization

Dùng String Catalog (`.xcstrings`) với plural và biến:

```swift
Text(String(localized: "guestbook.attendees \(message.numberAttend)"))
```

| Chuỗi | Tiếng Việt | Lưu ý |
|---|---|---|
| `guestbook.title` | Sổ lưu bút | Ngắn, không dấu ngoặc |
| `guestbook.attendees` | `%lld khách` | Dùng plural cho 0/1/nhiều |
| `guestbook.error.network` | Không kết nối được | Không lộ chi tiết kỹ thuật |

Ngày giờ dùng `Date.FormatStyle` với locale hiện tại; không hard-code `dd/MM/yyyy`. Tên
khách tiếng Việt có dấu cần kiểm tra font, search và sort (dùng `localizedStandardCompare`).

> ⚠️ Đừng dịch máy các thông báo pháp lý/privacy. Nội dung nhạy cảm cần người bản ngữ và
> review trước khi release.

---

## 19. Anti-patterns nâng cao và bài tập

### 19.1 Anti-patterns

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| Singleton `APIClient.shared` khắp nơi | Inject qua composition root |
| `Task.detached` để update UI | `@MainActor` + `.task` |
| Cache và server cùng là “source of truth” | Server là truth, cache là read model |
| Reconnect không refetch | Refetch sau mỗi lần nối lại |
| Retry POST không idempotency | Giữ draft, kiểm tra trùng, thêm `client_id` |
| Lưu token/device token trong log | Keychain + log privacy |
| Test phụ thuộc mạng thật | `URLProtocol`/stub + clock injection |
| Feature flag không owner | Deadline + cleanup PR |
| Tối ưu không đo | Instruments/MetricKit trước/sau |
| Module hóa quá sớm | Tách khi có boundary thật |

### 19.2 Bài tập

1. Thêm `client_id` (UUID) vào `NewGuestMessage`, gửi kèm POST; backend giả lập bỏ qua nếu
   đã tồn tại. Viết test cho retry không tạo trùng.
2. Xây `SyncEngine` với outbox lưu bằng SwiftData; mô phỏng mất mạng giữa lúc gửi.
3. Thêm reconnect có jitter, heartbeat 25 giây và state indicator trên UI.
4. Viết `URLProtocol` test cho `429` + `Retry-After`, đảm bảo không retry `400`.
5. Tách `GuestbookCore` và `GuestbookUI` thành package; đo thời gian build trước/sau.
6. Thêm deep link `guestbook://message/42`; xử lý trường hợp message đã bị xoá.
7. Thêm feature flag tắt realtime, kiểm tra pull-to-refresh vẫn chạy; đo launch time và
   memory với 200 tin trong cache, tối ưu một điểm và ghi lại số đo.

---

## 20. Tài liệu tham khảo

- **Swift concurrency**: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/
- **Observation**: https://developer.apple.com/documentation/observation
- **SwiftUI**: https://developer.apple.com/documentation/swiftui
- **SwiftData**: https://developer.apple.com/documentation/swiftdata
- **Background Tasks**: https://developer.apple.com/documentation/backgroundtasks
- **User Notifications**: https://developer.apple.com/documentation/usernotifications
- **Swift Package Manager**: https://www.swift.org/package-manager/
- **OWASP MASVS**: https://mas.owasp.org/MASVS/
- **WebSocket trong repo**: [`../websocket.md`](../websocket.md)
- **API security trong repo**: [`../api-security.md`](../api-security.md)
- **Release checklist**: [`ios-production.md`](./ios-production.md)
