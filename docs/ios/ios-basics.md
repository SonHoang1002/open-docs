# iOS Basics — Swift, SwiftUI và guestbook realtime

> Nền tảng để làm app iOS cho wedding guestbook: Swift, bộ nhớ, concurrency, Xcode,
> SwiftUI/UIKit, networking, WebSocket, persistence, testing và debug. Ví dụ bám sát
> API `/api/messages` và WebSocket `/ws` của repo này.

Code dùng **Swift 6 compiler** (Swift 5 language mode), deployment target **iOS 17.0**.

---

## Mục lục

1. [Swift cơ bản](#1-swift-cơ-bản)
2. [ARC và bộ nhớ](#2-arc-và-bộ-nhớ)
3. [Swift concurrency cơ bản](#3-swift-concurrency-cơ-bản)
4. [Xcode và project](#4-xcode-và-project)
5. [SwiftUI cơ bản](#5-swiftui-cơ-bản)
6. [UIKit overview](#6-uikit-overview)
7. [Layout và responsive](#7-layout-và-responsive)
8. [Networking](#8-networking)
9. [WebSocket](#9-websocket)
10. [Persistence](#10-persistence)
11. [App lifecycle và scene](#11-app-lifecycle-và-scene)
12. [Testing cơ bản](#12-testing-cơ-bản)
13. [Debug](#13-debug)
14. [Build và run](#14-build-và-run)
15. [Ví dụ tổng hợp: guestbook screen](#15-ví-dụ-tổng-hợp-guestbook-screen)
16. [Bài tập](#16-bài-tập)
17. [Anti-patterns cơ bản](#17-anti-patterns-cơ-bản)
18. [Tài liệu tham khảo](#18-tài-liệu-tham-khảo)

---

## 1. Swift cơ bản

### 1.1 Cú pháp nền tảng

`let` bất biến, `var` khả biến; Swift suy luận kiểu. `Double?` là Optional: `if let`/`guard
let` unwrap, `??` cho default, `?.` chain. Chỉ dùng `!` với hằng compile-time; force unwrap
network/JSON/user input là crash phổ biến nhất.

```swift
var wishes = ["Chúc mừng!", "Trăm năm hạnh phúc"]
let unique: Set<String> = ["Lan", "Minh", "Lan"]      // 2 phần tử
var tables: [String: Int] = ["Lan": 3, "Minh": 2]
let shortest = wishes.min { $0.count < $1.count }
```

`Array` giữ thứ tự, `Set` chống trùng, `Dictionary` ánh xạ key → value; cả ba là value type.
Closure lưu capture theo reference — nguồn retain cycle ở mục 2.

### 1.2 Struct, class, enum, protocol

| | `struct` | `class` | `enum` |
|---|---|---|---|
| Ngữ nghĩa | Value (copy) | Reference (shared) | Value |
| Kế thừa/deinit | Không | Có | Không |
| Dùng cho | Model, state | Service, session | Tập giá trị hữu hạn |

Model/state dùng `struct`; service/coordinator dùng `class` hoặc `actor`; trạng thái hữu hạn
dùng `enum`. Protocol khai báo hành vi, extension thêm implementation mà không sửa type gốc;
generic (ví dụ `func newest<T>(_ items: [T], by date: (T) -> Date) -> T?`) giữ kiểu khi tái
sử dụng thuật toán.

### 1.3 Error handling và property wrapper

```swift
enum ValidationError: Error, Equatable, LocalizedError {
    case emptyName, emptyContent, tooLong(Int)
    var errorDescription: String? {
        switch self {
        case .emptyName: "Tên không được để trống."
        case .emptyContent: "Lời chúc không được để trống."
        case .tooLong(let limit): "Tối đa \(limit) ký tự."
        }
    }
}

func validate(name: String, content: String) throws {
    let name = name.trimmingCharacters(in: .whitespacesAndNewlines)
    let content = content.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !name.isEmpty else { throw ValidationError.emptyName }
    guard !content.isEmpty else { throw ValidationError.emptyContent }
    guard content.count <= 500 else { throw ValidationError.tooLong(500) }
}
```

`throws` cho lỗi có thể phục hồi; `fatalError` chỉ cho lỗi lập trình. Property wrapper
(`@State`, `@Binding`, `@Published`) gói logic get/set quanh một property; chỉ viết custom
wrapper khi logic thật sự tái sử dụng.

---

## 2. ARC và bộ nhớ

Swift dùng **Automatic Reference Counting** cho class instance; struct/enum không được ARC quản lý.

| Tham chiếu | Giữ object? | Dùng khi |
|---|---|---|
| `strong` (mặc định) | Có | Quan hệ sở hữu thông thường |
| `weak` | Không, tự thành `nil` | Delegate, closure callback, parent–child ngược |
| `unowned` | Không, không thành `nil` | Chắc chắn object kia sống lâu hơn |

**Retain cycle** xảy ra khi hai object giữ nhau bằng strong reference:

```swift
final class SocketListener {
    var onEvent: ((GuestMessage) -> Void)?
    func start() {
        onEvent = { [weak self] message in self?.handle(message) }
    }
    private func handle(_ message: GuestMessage) {}
}
```

Bỏ `[weak self]` → closure giữ listener, listener giữ closure → không bao giờ deinit.

**Value vs reference:** gán `struct` sẽ copy, gán `class` trỏ cùng object. Sửa property
của bản copy không ảnh hưởng bản gốc; sửa property của class qua một biến sẽ thấy ở biến
kia. `unowned` chỉ dùng khi vòng đời đã được đảm bảo, nếu không sẽ crash.

---

## 3. Swift concurrency cơ bản

```swift
func loadFirstPage() async throws -> [GuestMessage] {
    try await api.fetchMessages(before: nil)
}

Task {
    do {
        let messages = try await loadFirstPage()
        print("Tải được \(messages.count) lời chúc")
    } catch {
        print("Lỗi:", error.localizedDescription)
    }
}
```

`async` đánh dấu hàm có thể tạm dừng, `await` là điểm tạm dừng; không thread nào bị block
khi chờ network. **`@MainActor`** đảm bảo UI update trên main thread ở mức compiler —
không cần `DispatchQueue.main.async`.

`@MainActor` (đặt trên class/service) đảm bảo mọi truy cập UI chạy trên main thread ở mức
compiler — không cần `DispatchQueue.main.async`; store đầy đủ ở mục 15.

**`async let`** chạy song song việc độc lập; **`TaskGroup`** (`withThrowingTaskGroup`)
dùng khi số task đổi, ví dụ tải nhiều cursor cùng lúc:

```swift
func bootstrap(api: GuestbookAPI, drafts: DraftStore) async throws -> ([GuestMessage], String?) {
    async let messages = api.fetchMessages(before: nil)
    async let draft = drafts.load()
    return try await (messages, draft)
}
```

Không dùng TaskGroup cho phân trang tuần tự (trang sau phụ thuộc cursor trang trước). Task
tự hủy khi view biến mất (`.task`) hoặc khi gọi `cancel()`; vòng lặp dài nên gọi
`try Task.checkCancellation()`.

---

## 4. Xcode và project

| Khái niệm | Ý nghĩa |
|---|---|
| **Target** | Sản phẩm build: app, widget, extension, test bundle |
| **Scheme** | Cấu hình chạy/build/test (Debug, Staging, Release) |
| **Bundle ID** | Định danh reverse-DNS, dùng cho signing/App Store |
| **Build Settings** | Compiler flags, deployment target, signing, search paths |
| **Info.plist** | Metadata, quyền, ATS, background mode |
| **Assets** | App icon, màu, image; hỗ trợ light/dark, 1x/2x/3x |

```swift
enum AppConfig {
    static let apiBaseURL = URL(string: "http://localhost:3000")!
    static var webSocketURL: URL {
        var components = URLComponents(url: apiBaseURL, resolvingAgainstBaseURL: false)!
        components.scheme = apiBaseURL.scheme == "https" ? "wss" : "ws"
        components.path = "/ws"
        return components.url!
    }
}
```

Dev local cần `NSAppTransportSecurity` → `NSAllowsLocalNetworking = true` trong `Info.plist`
(không dùng `NSAllowsArbitraryLoads` cho production). Trên iPhone thật, `localhost` là chính
điện thoại — dùng IP LAN của Mac. Localization: `Text(String(localized: "guestbook.title"))`.

---

## 5. SwiftUI cơ bản

View là struct mô tả UI; state đổi → SwiftUI tính lại `body` và diff cây view.

```swift
struct MessageRow: View {
    let message: GuestMessage
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(message.senderName).font(.headline)
            Text(message.content)
            Text(message.willAttend ? "\(message.numberAttend) khách" : "Không tham dự")
                .font(.caption).foregroundStyle(.secondary)
        }
    }
}
```

Modifier trả về view mới, không sửa view cũ; thứ tự quan trọng
(`.padding().background()` khác `.background().padding()`).

| Wrapper | Ai sở hữu | Dùng khi |
|---|---|---|
| `@State` | View hiện tại | Giá trị local: textfield, toggle, sheet |
| `@Binding` | View cha | Truyền quyền đọc/ghi xuống view con |
| `@StateObject` | View hiện tại | Tạo và giữ `ObservableObject` |
| `@ObservedObject` | View khác | Nhận object đã tạo ở cha |
| `@EnvironmentObject` | Tổ tiên inject | Chia sẻ store sâu trong cây view |
| `@State` + `@Observable` | View hiện tại | iOS 17+, thay `@StateObject` hiện đại |

> ⚠️ Không tạo `@StateObject` bằng object mới trong `body`; object sẽ bị tạo lại ngoài ý
> muốn. Tạo ở owner (App/view cha), truyền xuống bằng `@ObservedObject` hoặc
> `@EnvironmentObject`.

**List, navigation, sheet, alert:**

```swift
struct GuestbookScreen: View {
    @StateObject private var store = GuestbookStore()
    @State private var composing = false

    var body: some View {
        NavigationStack {
            List(store.messages.reversed()) { message in
                NavigationLink(value: message) { MessageRow(message: message) }
                    .task {
                        if message.id == store.messages.first?.id { await store.loadOlder() }
                    }
            }
            .navigationTitle("Sổ lưu bút")
            .refreshable { await store.refresh() }
            .toolbar { Button("Gửi", systemImage: "square.and.pencil") { composing = true } }
            .sheet(isPresented: $composing) { MessageFormView { await store.send($0) } }
            .task { await store.start() }
        }
    }
}
```

**Form** dùng `@State` cho từng field, validate trước khi gửi:

```swift
struct MessageFormView: View {
    @Environment(\.dismiss) private var dismiss
    let onSend: @MainActor (NewGuestMessage) async -> Bool
    @State private var name = "", content = ""
    @State private var willAttend = true, count = 1
    @State private var errorText: String?

    var body: some View {
        NavigationStack {
            Form {
                TextField("Tên", text: $name)
                TextField("Lời chúc", text: $content, axis: .vertical)
                Toggle("Sẽ đến", isOn: $willAttend)
                if willAttend { Stepper("Số người: \(count)", value: $count, in: 1...10) }
                if let errorText { Text(errorText).foregroundStyle(.red) }
            }
            .navigationTitle("Gửi lời chúc")
            .toolbar {
                Button("Huỷ") { dismiss() }
                Button("Gửi") { Task { await submit() } }
            }
        }
    }

    private func submit() async {
        do { try validate(name: name, content: content) }
        catch { errorText = error.localizedDescription; return }
        let draft = NewGuestMessage(senderName: name, content: content,
            willAttend: willAttend, guestOf: "Bạn thân", numberAttend: willAttend ? count : 0)
        if await onSend(draft) { dismiss() } else { errorText = "Chưa gửi được." }
    }
}
```

> 💡 `NavigationStack`, `TextField(axis:)` là iOS 16+; `.presentationDetents` giúp sheet
> không chiếm toàn màn hình.

---

## 6. UIKit overview

UIKit vẫn cần cho codebase cũ, camera/AR và một số component chưa có bản SwiftUI. Một view
controller tối thiểu override `viewDidLoad` để dựng view và `viewWillDisappear` để dừng
timer/huỷ request; dùng `UIViewControllerRepresentable` để bọc UIKit trong SwiftUI.

**Auto Layout:** đặt `translatesAutoresizingMaskIntoConstraints = false`, dùng anchor
`leading/trailing/top` so với `view.safeAreaLayoutGuide`. **UITableView:** implement
`numberOfRowsInSection` và `cellForRowAt`; cell đơn giản dùng `defaultContentConfiguration`
(`text`/`secondaryText`) rồi gán vào `cell.contentConfiguration`. Điều hướng bằng
`navigationController?.pushViewController(_:animated:)`; bọc UIKit trong SwiftUI bằng
`UIViewControllerRepresentable` khi cần camera/photo picker.

---

## 7. Layout và responsive

| Chủ đề | Cách làm |
|---|---|
| Stack | `VStack`, `HStack`, `ZStack`; đặt `spacing`/`alignment` tường minh |
| Safe area | Mặc định tôn trọng; `.safeAreaInset` cho thanh dưới |
| Size class | `@Environment(\.horizontalSizeClass)` cho iPhone/iPad |
| Dynamic Type | `.font(.body)` thay vì size cố định; `@ScaledMetric` cho spacing |
| Dark mode | Semantic color (`.primary`, `.background`) hoặc asset color |
| Reduce Motion | `@Environment(\.accessibilityReduceMotion)` để tắt animation lớn |

```swift
struct ResponsiveWishGrid: View {
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        let minimum = sizeClass == .compact ? 160.0 : 220.0
        LazyVGrid(columns: [GridItem(.adaptive(minimum: minimum))]) {
            ForEach(0..<6) { Text("Lời chúc \($0 + 1)") }
        }.padding()
    }
}
```

Tránh `GeometryReader` bọc toàn màn hình: nó chiếm hết không gian và làm layout khó đoán;
chỉ dùng khi thật sự cần kích thước container.

---

## 8. Networking

### 8.1 Model và decoding

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

struct NewGuestMessage: Encodable, Sendable {
    var senderName, content, guestOf: String
    var willAttend: Bool
    var numberAttend: Int
}

extension JSONDecoder {
    static var guestbook: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let raw = try container.decode(String.self)
            if let date = try? Date(raw, strategy: Date.ISO8601FormatStyle(includingFractionalSeconds: true)) {
                return date
            }
            if let date = try? Date(raw, strategy: Date.ISO8601FormatStyle()) { return date }
            throw DecodingError.dataCorruptedError(in: container,
                debugDescription: "Không parse được ngày: \(raw)")
        }
        return decoder
    }
}
```

`convertFromSnakeCase` tự map `sender_name` → `senderName`, `created_at` → `createdAt`.
Supabase thường trả phần lẻ giây nên custom date strategy thử cả hai định dạng. Nếu field
legacy bị `null`, đổi field đó thành Optional thay vì `try!`.

### 8.2 API client

```swift
protocol GuestbookService: Sendable {
    func fetchMessages(before: Date?) async throws -> [GuestMessage]
    func createMessage(_ draft: NewGuestMessage) async throws -> GuestMessage
}

enum APIError: LocalizedError {
    case invalidURL, invalidResponse
    case http(status: Int, message: String?)
    case decoding

    var errorDescription: String? {
        switch self {
        case .invalidURL: "URL không hợp lệ."
        case .invalidResponse: "Phản hồi không hợp lệ."
        case .http(let status, let message): message ?? "Máy chủ lỗi \(status)."
        case .decoding: "Dữ liệu không đúng định dạng."
        }
    }
}

private struct APIEnvelope<Payload: Decodable>: Decodable {
    let data: Payload?
    let error: String?
}

struct GuestbookAPI: GuestbookService {
    let baseURL: URL
    var session: URLSession = .shared

    func fetchMessages(before: Date? = nil) async throws -> [GuestMessage] {
        let query = before.map { [URLQueryItem(name: "before", value: $0.ISO8601Format())] } ?? []
        return try await send(path: "api/messages/", query: query)
    }

    func createMessage(_ draft: NewGuestMessage) async throws -> GuestMessage {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return try await send(path: "api/messages", method: "POST",
                              body: try encoder.encode(draft))
    }

    private func send<P: Decodable>(
        path: String, method: String = "GET", query: [URLQueryItem] = [], body: Data? = nil
    ) async throws -> P {
        guard var comps = URLComponents(url: baseURL.appending(path: path),
                                        resolvingAgainstBaseURL: false)
        else { throw APIError.invalidURL }
        comps.queryItems = query.isEmpty ? nil : query
        guard let url = comps.url else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = body

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else {
            let message = try? JSONDecoder.guestbook
                .decode(APIEnvelope<GuestMessage>.self, from: data).error
            throw APIError.http(status: http.statusCode, message: message)
        }
        guard let envelope = try? JSONDecoder.guestbook.decode(APIEnvelope<P>.self, from: data),
              let payload = envelope.data
        else { throw APIError.decoding }
        return payload
    }
}
```

**Contract:** `GET /api/messages/` (có `/` cuối) trả 20 tin mới nhất theo `created_at`
tăng dần; `POST /api/messages` nhận body snake_case. Backend kiểm tra `sender_name.isEmpty`
— không phải API hợp lệ của JavaScript — nên client phải validate và xử lý lỗi. `400` giữ
nguyên form; `429`/`5xx` thì backoff và thông báo thân thiện; `404` thường là sai route,
không retry mù.

---

## 9. WebSocket

Backend broadcast `{"type":"new_message","data":{...}}`; `PUT` gửi `update_message` với
`data` là mảng, `DELETE` gửi `update_message` với `data: {"id": 1}`.

```swift
enum RealtimeEvent: Sendable {
    case created(GuestMessage), updated(GuestMessage), deleted(Int)
}

private struct SocketEvent: Decodable {
    let type: String
    let message: GuestMessage?
    let deletedID: Int?

    private enum CodingKeys: String, CodingKey { case type, data }
    private struct IDOnly: Decodable { let id: Int }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        type = try container.decode(String.self, forKey: .type)
        if let single = try? container.decode(GuestMessage.self, forKey: .data) {
            message = single
        } else if let list = try? container.decode([GuestMessage].self, forKey: .data) {
            message = list.first
        } else {
            message = nil
        }
        deletedID = (try? container.decode(IDOnly.self, forKey: .data))?.id
    }

    var event: RealtimeEvent? {
        switch type {
        case "new_message": return message.map(RealtimeEvent.created)
        case "update_message":
            if let message { return .updated(message) }
            if let deletedID { return .deleted(deletedID) }
            return nil
        default: return nil
        }
    }
}
```

```swift
@MainActor
final class RealtimeClient {
    private let url: URL
    private var socket: URLSessionWebSocketTask?

    init(url: URL) { self.url = url }

    func events() -> AsyncStream<RealtimeEvent> {
        let (stream, continuation) = AsyncStream<RealtimeEvent>.makeStream()
        Task { [weak self] in
            guard let self else { return }
            let socket = URLSession.shared.webSocketTask(with: self.url)
            self.socket = socket
            socket.resume()
            while !Task.isCancelled {
                guard let message = try? await socket.receive() else { break }
                guard let data = payload(from: message),
                      let event = try? JSONDecoder.guestbook
                        .decode(SocketEvent.self, from: data).event
                else { continue }
                continuation.yield(event)
            }
            continuation.finish()
        }
        return stream
    }

    func stop() {
        socket?.cancel(with: .normalClosure, reason: nil)
        socket = nil
    }
}

private func payload(from message: URLSessionWebSocketTask.Message) -> Data? {
    if case .string(let text) = message { return Data(text.utf8) }
    if case .data(let data) = message { return data }
    return nil
}
```

Kiểm tra server trước khi debug app:

```bash
wscat -c ws://localhost:3000/ws
curl -X POST http://localhost:3000/api/messages -H 'Content-Type: application/json' \
  -d '{"sender_name":"Lan","content":"Chúc mừng!","will_attend":true,"guest_of":"Bạn thân","number_attend":2}'
```

> ⚠️ Client cơ bản này không tự reconnect. Production cần backoff có jitter và đồng bộ lại
> bằng REST sau khi nối lại; WebSocket chỉ là kênh push, không phải nguồn sự thật. Xem
> [`ios-advanced.md`](./ios-advanced.md).

---

## 10. Persistence

| Công cụ | Dùng cho | Lưu ý |
|---|---|---|
| `UserDefaults` | Setting nhỏ, draft, flag | Không lưu dữ liệu nhạy cảm/list lớn |
| Keychain | Token, credential | Mã hóa bởi hệ thống, sống qua cài lại |
| FileManager | JSON cache, ảnh, file tải về | Tự quản lý version, dung lượng, backup |
| Core Data | Model phức tạp, query, migration | Nhiều boilerplate, mạnh về quan hệ |
| SwiftData | App iOS 17+, model nhẹ | API mới, chưa phù hợp mọi legacy |

```swift
UserDefaults.standard.set(content, forKey: "guestbook.draft")
let draft = UserDefaults.standard.string(forKey: "guestbook.draft")

enum KeychainError: Error { case status(OSStatus) }

func saveToken(_ token: String, service: String, account: String) throws {
    var query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: service,
        kSecAttrAccount as String: account
    ]
    SecItemDelete(query as CFDictionary)
    query[kSecValueData as String] = Data(token.utf8)
    query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    guard SecItemAdd(query as CFDictionary, nil) == errSecSuccess else {
        throw KeychainError.status(errSecInternalError)
    }
}
```

**Core Data overview:** `NSPersistentContainer` → `viewContext` cho UI, background context
cho import/sync. **SwiftData overview:** `@Model` + `ModelContainer` + `@Query` (iOS 17+).
Backend vẫn là nguồn sự thật; cache chỉ để đọc nhanh/offline.

---

## 11. App lifecycle và scene

```swift
@main
struct GuestbookApp: App {
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup { GuestbookScreen() }
            .onChange(of: scenePhase) { _, phase in
                if phase == .background {
                    // lưu draft, dừng socket, huỷ task không cần thiết
                }
            }
    }
}
```

`.active` app hiển thị; `.inactive` chuyển tiếp (Control Center, cuộc gọi); `.background`
app không hiển thị và có thể bị suspend bất cứ lúc nào. Background: hoàn tất ghi file nhỏ,
lưu state, không giữ WebSocket mở vô hạn. Background refresh/`BGTaskScheduler` cần
capability, trình bày trong [`ios-advanced.md`](./ios-advanced.md).

---

## 12. Testing cơ bản

```swift
final class MessageValidationTests: XCTestCase {
    func testRejectsWhitespaceName() {
        XCTAssertThrowsError(try validate(name: "   ", content: "Chúc mừng")) { error in
            XCTAssertEqual(error as? ValidationError, .emptyName)
        }
    }
}
```

```swift
struct StubService: GuestbookService {
    let messages: [GuestMessage]
    func fetchMessages(before: Date?) async throws -> [GuestMessage] { messages }
    func createMessage(_ draft: NewGuestMessage) async throws -> GuestMessage { messages[0] }
}

@MainActor
final class GuestbookStoreTests: XCTestCase {
    func testRefreshLoadsMessages() async {
        let store = GuestbookStore(service: StubService(messages: [.fixture]),
            realtime: RealtimeClient(url: URL(string: "ws://localhost:1/ws")!))
        await store.refresh()
        XCTAssertEqual(store.messages.map(\.id), [1])
    }
}

extension GuestMessage {
    static let fixture = GuestMessage(id: 1, senderName: "Lan", content: "Chúc mừng!",
        willAttend: true, guestOf: "Bạn thân", numberAttend: 2, createdAt: .now)
}
```

> ⚠️ UI test dễ flaky vì phụ thuộc layout/identifier. Ưu tiên unit test cho logic, chỉ giữ
> vài UI test cho luồng quan trọng (`XCUIApplication`, `waitForExistence(timeout:)`).

---

## 13. Debug

**Breakpoints:** click số dòng; chuột phải đặt **Condition** (ví dụ `message.id == 42`)
hoặc **Ignore** N lần. **Exception breakpoint** dừng ngay khi crash. Trong console dùng
`po store.messages.count`, `p message.content`, `bt`, `frame variable`.

**Instruments:** **Product → Profile** (⌘I) → Time Profiler (CPU), Allocations, Leaks
(retain cycle), Network, Energy Log.

| Crash | Nguyên nhân | Cách tránh |
|---|---|---|
| `Unexpectedly found nil` | Force unwrap `nil` | `guard let`, default value |
| `EXC_BAD_ACCESS` | Object đã giải phóng | Sửa retain cycle, dùng `weak` |
| Publish từ background thread | Update `@Published` ngoài main | `@MainActor` |
| `Index out of range` | Truy cập array rỗng | Kiểm tra index, dùng `first/last` |
| Layout loop, CPU 100% | Constraint mâu thuẫn | Đọc log Auto Layout, tách state |

**Debug → View Debugging → Capture View Hierarchy** cho thấy view nào đang chiếm không gian
hoặc bị che.

---

## 14. Build và run

```bash
xcodebuild -scheme Guestbook -destination 'generic/platform=iOS Simulator' build
xcodebuild -scheme Guestbook -destination 'platform=iOS Simulator,name=iPhone 16 Pro' test
xcodebuild -scheme Guestbook -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/Guestbook.xcarchive archive
```

Simulator nhanh, không cần signing, nhưng không có camera/push/hiệu năng thật. Thiết bị
thật cần provisioning và phản ánh đúng mạng, pin, background. Archive chứa app + dSYM;
TestFlight phân phối beta qua App Store Connect với build number tăng dần. Chi tiết
signing/upload ở [`ios-production.md`](./ios-production.md).

---

## 15. Ví dụ tổng hợp: guestbook screen

```swift
@MainActor
final class GuestbookStore: ObservableObject {
    @Published private(set) var messages: [GuestMessage] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?

    private let service: any GuestbookService
    private let realtime: RealtimeClient
    private var listenTask: Task<Void, Never>?

    init(
        service: any GuestbookService = GuestbookAPI(baseURL: AppConfig.apiBaseURL),
        realtime: RealtimeClient = RealtimeClient(url: AppConfig.webSocketURL)
    ) {
        self.service = service
        self.realtime = realtime
    }

    func start() async {
        if listenTask == nil {
            let stream = realtime.events()
            listenTask = Task { [weak self] in
                for await event in stream { self?.apply(event) }
                self?.listenTask = nil
            }
        }
        await refresh()
    }

    func stop() {
        listenTask?.cancel()
        listenTask = nil
        realtime.stop()
    }

    func refresh() async { await load(before: nil) }

    func loadOlder() async {
        guard let oldest = messages.first?.createdAt else { return }
        await load(before: oldest)
    }

    private func load(before cursor: Date?) async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            for message in try await service.fetchMessages(before: cursor) {
                upsert(message)
            }
        } catch { errorMessage = error.localizedDescription }
    }

    func send(_ draft: NewGuestMessage) async -> Bool {
        do {
            upsert(try await service.createMessage(draft))
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    private func apply(_ event: RealtimeEvent) {
        switch event {
        case .created(let message), .updated(let message): upsert(message)
        case .deleted(let id): messages.removeAll { $0.id == id }
        }
    }

    private func upsert(_ message: GuestMessage) {
        messages.removeAll { $0.id == message.id }
        messages.append(message)
        messages.sort { $0.createdAt < $1.createdAt }
    }
}
```

`GuestbookScreen` và `MessageFormView` ở mục 5 dùng trực tiếp store này; `GuestbookApp` ở
mục 11 là entry point. Luồng dữ liệu:

```text
App launch → GuestbookScreen.task
  ├─ store.start() → realtime.events() (AsyncStream) + refresh()
  ├─ pull-to-refresh → GET /api/messages/
  ├─ scroll tới tin cũ nhất → loadOlder() với before=createdAt
  ├─ form gửi → POST /api/messages → store.upsert()
  └─ server broadcast new_message → store.apply(.created) → UI cập nhật
```

Checklist chạy thật:

- [ ] `curl /api/messages/` trả `success: true` và 20 tin.
- [ ] Scroll lên tải thêm đúng `before`, không trùng tin.
- [ ] Gửi form thành công, tin mới hiện không cần refresh.
- [ ] Tắt/bật Wi-Fi: stream đóng, mở lại screen hoặc gọi `start()` để nối lại.
- [ ] Hai simulator: máy A gửi, máy B thấy tin mới.
- [ ] iPad, xoay màn hình, Dynamic Type lớn không tràn layout.

---

## 16. Bài tập

1. Thêm picker `guest_of` vào form và hiển thị trên row.
2. Chặn tên > 60 ký tự, nội dung > 500 ký tự; viết unit test.
3. Hiện loading indicator cuối list khi `loadOlder()`, chặn gọi trùng.
4. Badge "Mới" 3 giây cho tin đến qua WebSocket.
5. Cache 20 tin gần nhất; launch không mạng hiện cache kèm banner.
6. Map `429/500` thành thông báo thân thiện, có nút "Thử lại".
7. Thêm accessibility label, kiểm tra VoiceOver đọc tên + lời chúc.

---

## 17. Anti-patterns cơ bản

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| Force unwrap dữ liệu network/JSON | `guard let`, decode có kiểm tra |
| Gọi API trong `body` của View | `.task` hoặc store method |
| `DispatchQueue.main.async` rải rác | `@MainActor` + async/await |
| Giữ socket trong View, không cancel | Store sở hữu socket, có `stop()` |
| Retry vô hạn khi server lỗi | Retry giới hạn + backoff + thông báo |
| Lưu token trong `UserDefaults` | Keychain với accessibility phù hợp |
| Coi WebSocket là nguồn dữ liệu chính | REST/DB là source of truth |
| `@StateObject` tạo mới mỗi render | Khởi tạo một lần ở owner |
| Bỏ qua Dynamic Type/dark mode | Semantic color, font động |

---

## 18. Tài liệu tham khảo

- **Swift language guide**: https://docs.swift.org/swift-book/
- **ARC**: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/
- **Concurrency**: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/
- **SwiftUI**: https://developer.apple.com/documentation/swiftui
- **URLSession**: https://developer.apple.com/documentation/foundation/urlsession
- **URLSessionWebSocketTask**: https://developer.apple.com/documentation/foundation/urlsessionwebsockettask
- **XCTest**: https://developer.apple.com/documentation/xctest
- **WebSocket trong repo**: [`../websocket.md`](../websocket.md)
- **Bước tiếp theo**: [`ios-advanced.md`](./ios-advanced.md)

---

*Hoàn thành mục 15 và bài tập trước khi chuyển sang advanced. Nếu app chưa reconnect được
sau khi mất mạng, chưa nên học offline-first.*
