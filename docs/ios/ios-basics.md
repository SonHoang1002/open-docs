# iOS Cơ bản — Swift, kiến trúc UI, mạng, lưu trữ và debugging

> Tài liệu nền tảng độc lập, không phụ thuộc vào stack/backend cụ thể. Tập trung vào bản chất: ngôn ngữ Swift, quản lý bộ nhớ, concurrency, SwiftUI/UIKit, navigation, state management, networking, persistence, testing, debug và quy ước thực tế.

**Môi trường tham khảo:** Swift 5.9+ / 6.x (vẫn tương thích Swift 5 language mode), Xcode 16+, iOS 17.0+. Các API chỉ có từ iOS 18+ sẽ được ghi rõ.

---

## Mục lục

- [1. Tổng quan phát triển iOS](#1-tổng-quan-phát-triển-ios)
- [2. Swift: biến, kiểu, Optional](#2-swift-biến-kiểu-optional)
- [3. Struct, Class, Enum, Protocol, Extension](#3-struct-class-enum-protocol-extension)
- [4. Closures, Higher-Order Functions](#4-closures-higher-order-functions)
- [5. Xử lý lỗi (Error Handling)](#5-xử-lý-lỗi-error-handling)
- [6. ARC, bộ nhớ và vòng tham chiếu](#6-arc-bộ-nhớ-và-vòng-tham-chiếu)
- [7. Swift Concurrency cơ bản (async/await, Task, MainActor)](#7-swift-concurrency-cơ-bản-asyncawait-task-mainactor)
- [8. Xcode, Target, Scheme, Build Settings](#8-xcode-target-scheme-build-settings)
- [9. SwiftUI cơ bản: State, Binding, Observable, View](#9-swiftui-cơ-bản-state-binding-observable-view)
- [10. UIKit tổng quan và khi nào kết hợp](#10-uikit-tổng-quan-và-khi-nào-kết-hợp)
- [11. Layout, Auto Layout, Responsive Design](#11-layout-auto-layout-responsive-design)
- [12. Navigation, Sheet, FullScreenCover, Alert](#12-navigation-sheet-fullscreencover-alert)
- [13. State Management thực tế](#13-state-management-thực-tế)
- [14. Networking với URLSession](#14-networking-với-urlsession)
- [15. Codable, JSON, Mapping và versioning](#15-codable-json-mapping-và-versioning)
- [16. Lưu trữ cục bộ: UserDefaults, FileManager, Keychain](#16-lưu-trữ-cục-bộ-userdefaults-filemanager-keychain)
- [17. App Lifecycle, Scene, Background/Foreground](#17-app-lifecycle-scene-backgroundforeground)
- [18. Debugging, Logging, Instruments cơ bản](#18-debugging-logging-instruments-cơ-bản)
- [19. Testing cơ bản với XCTest](#19-testing-cơ-bản-với-xctest)
- [20. Thực hành tổng hợp: Ứng dụng danh sách sản phẩm](#20-thực-hành-tổng-hợp-ứng-dụng-danh-sách-sản-phẩm)
- [21. Bài tập tự luyện (có gợi ý)](#21-bài-tập-tự-luyện-có-gợi-ý)
- [22. Checklist tự đánh giá](#22-checklist-tự-đánh-giá)
- [23. Anti-patterns và cách tránh](#23-anti-patterns-và-cách-tránh)
- [24. Tài liệu tham khảo](#24-tài-liệu-tham-khảo)

---

## 1. Tổng quan phát triển iOS

| Khái niệm | Giải thích |
|---|---|
| **Native app** | Viết bằng Swift/Objective-C, chạy trực tiếp trên iOS, tận dụng framework hệ thống, hiệu năng tốt nhất. |
| **App Sandbox** | Mỗi ứng dụng chạy cô lập. Chỉ truy cập tài nguyên được cấp phép qua entitlements/permissions. |
| **Bundle ID** | Định danh duy nhất reverse-DNS. Không nên thay đổi sau khi phát hành. |
| **Target/Scheme** | Target định nghĩa sản phẩm build; Scheme định nghĩa cấu hình chạy/test/archive. |
| **Human Interface Guidelines (HIG)** | Nguyên tắc thiết kế của Apple về nhất quán, khả năng truy cập, trực quan. |

**Triết lý:** Ưu tiên **an toàn, rõ ràng, dễ test**. Swift được thiết kế để bắt lỗi sớm tại compile-time (type-safe, optional, error handling).

---

## 2. Swift: biến, kiểu, Optional

### 2.1 Biến, hằng, type inference

```swift
let appName = "ExampleApp"  // hằng số
var count: Int = 0          // biến, khai báo rõ ràng
count += 1
```

- `let` → immutable. Ưu tiên dùng `let` mặc định, chỉ dùng `var` khi thực sự cần thay đổi.
- Swift suy luận kiểu tự động, nhưng khai báo rõ ràng giúp code dễ đọc và tránh nhầm lẫn.

### 2.2 Kiểu dữ liệu cơ bản

| Kiểu | Mô tả | Ghi chú |
|---|---|---|
| `Int/UInt` | Số nguyên | Thường dùng `Int` trên 64-bit. |
| `Double/Float` | Số thực | Ưu tiên `Double` trừ khi có lý do đặc biệt. |
| `Bool` | Boolean | `true`/`false`. |
| `String` | Chuỗi Unicode | Hỗ trợ interpolation `"\(value)"`. |
| `Array<T>` | Mảng có thứ tự | Value type. |
| `Set<T: Hashable>` | Tập không trùng, không thứ tự | Tốt cho lookup nhanh. |
| `Dictionary<K: Hashable, V>` | Key-Value | Value type. |

### 2.3 Optional - "có hoặc không"

`Optional<T>` biểu thị giá trị có thể `nil`. Mục đích: buộc phải xử lý trường hợp thiếu dữ liệu.

```swift
var username: String? = nil
username = "alex"

// Unwrap an toàn
if let name = username {
    print("Hello \(name)")
}

// guard let - thoát sớm
func greet(_ name: String?) {
    guard let name else { return }
    print("Hi \(name)")
}

// Nil-coalescing
let display = username ?? "Guest"

// Optional chaining
let length = username?.count  // Int?

// Implicitly Unwrapped Optional (IUO) - dùng rất hạn chế
var config: String!  // chỉ khi chắc chắn gán trước khi dùng, tránh trong code mới
```

> ⚠️ Tránh force unwrap `!` trừ trường hợp thực sự bắt buộc và đã được bảo đảm bằng logic rõ ràng (hiếm gặp). Force unwrap sai là nguyên nhân crash phổ biến.

### 2.4 String, Collection và kiểm tra

```swift
let text = "Swift"
for char in text {
    // iterate characters
}

var items: [String] = []
items.append("A")
items += ["B", "C"]
items.remove(at: 0)

var set: Set<Int> = [1, 2, 2, 3]  // {1,2,3}
var dict: [String: Int] = ["a": 1]
```

---

## 3. Struct, Class, Enum, Protocol, Extension

### 3.1 Value vs Reference

| Thuộc tính | `struct` | `class` | `enum` |
|---|---|---|---|
| **Semantics** | Value type (copy) | Reference type (shared) | Value type |
| **Inheritance** | Không | Có | Không |
| **deinit** | Không | Có | Không |
| **Mutability** | `mutating` cần thiết khi thay đổi self trong method | Có thể thay đổi trực tiếp nếu instance mutable | Tùy thuộc |
| **Identity** | Quan tâm giá trị | Quan tâm instance identity (`===`) | Quan tâm giá trị |
| **Khuyến nghị** | Mặc định cho model/state đơn giản | Chỉ khi cần reference semantics (shared mutable state, lifecycle phức tạp) | Rất mạnh cho trạng thái hữu hạn |

```swift
struct Point { var x: Int, y: Int }
var p1 = Point(x: 0, y: 0)
var p2 = p1  // copy
p2.x = 10
// p1.x vẫn 0

class Counter { var value = 0 }
let c1 = Counter()
let c2 = c1  // cùng reference
c2.value = 5
// c1.value == 5
```

### 3.2 Enum với associated values/raw values

```swift
enum LoadingState<T> {
    case idle
    case loading
    case success(T)
    case failure(Error)
}

enum AppTheme: String, CaseIterable {
    case light, dark, system
}

// Pattern matching
func render<T>(_ state: LoadingState<T>) {
    switch state {
    case .idle: break
    case .loading: print("Loading...")
    case .success(let data): print(data)
    case .failure(let error): print(error.localizedDescription)
    }
}
```

### 3.3 Protocol, Protocol-Oriented Programming, Extension

```swift
protocol Identifiable {
    var id: UUID { get }
}

protocol Validatable {
    func validate() -> Bool
}

struct User: Identifiable, Validatable {
    let id = UUID()
    var email: String
    
    func validate() -> Bool {
        email.contains("@")
    }
}

// Extension thêm hành vi
extension String {
    var trimmed: String { self.trimmingCharacters(in: .whitespacesAndNewlines) }
    func isValidEmail() -> Bool { self.contains("@") && self.contains(".") }
}

// Protocol with default implementation
protocol Describable {
    var description: String { get }
}
extension Describable {
    var description: String { String(describing: Self.self) }
}
```

**Nguyên tắc POO nhẹ:** Ưu tiên protocol + extension để compose behavior thay vì kế thừa sâu.

### 3.4 Access Control

| Level | Phạm vi | Khi dùng |
|---|---|---|
| `private` | Chỉ trong declaration/block | Ẩn chi tiết nội bộ |
| `fileprivate` | Chỉ trong cùng file | Hiếm, chỉ khi cần chia sẻ giữa extensions trong cùng file |
| `internal` | Trong module (mặc định) | Hầu hết code ứng dụng |
| `public` | Có thể truy cập từ module khác | Khi xuất framework |
| `open` | `public` + cho phép override | Rất hiếm, chủ yếu framework thiết kế để subclass |

---

## 4. Closures, Higher-Order Functions

### 4.1 Closures

Closure là block code có thể capture giá trị từ scope xung quanh.

```swift
let add = { (a: Int, b: Int) -> Int in
    return a + b
}
add(2, 3)

// Trailing closure
func perform(_ action: () -> Void) {
    action()
}
perform {
    print("Done")
}

// Capture list
var multiplier = 3
let multiply = { (x: Int) -> Int in
    return x * multiplier  // capture by reference
}
multiplier = 5
multiply(2)  // 10
```

**Retain cycle nguy hiểm:** closure capture `self` mạnh mẽ. Xem phần 6.

### 4.2 Higher-Order Functions

| Hàm | Mục đích | Ví dụ |
|---|---|---|
| `map` | Biến đổi mỗi phần tử | `[1,2,3].map { $0 * 2 }` |
| `filter` | Lọc theo điều kiện | `[1,2,3,4].filter { $0 % 2 == 0 }` |
| `reduce` | Gộp thành một giá trị | `[1,2,3].reduce(0, +)` |
| `compactMap` | Map + loại `nil` | `["1","a","2"].compactMap(Int.init)` |
| `flatMap` | Làm phẳng mảng lồng | `[[1,2],[3]].flatMap { $0 }` |
| `sorted(by:)` | Sắp xếp tùy chỉnh | `items.sorted { $0.name < $1.name }` |
| `first(where:)` | Tìm phần tử đầu tiên thỏa điều kiện | `items.first { $0.isActive }` |
| `forEach` | Thực thi side effect | `items.forEach { print($0) }` |

```swift
struct Product { let name: String, price: Double, inStock: Bool }
let products = [
    Product(name: "A", price: 10, inStock: true),
    Product(name: "B", price: 5, inStock: false),
    Product(name: "C", price: 20, inStock: true)
]

let names = products
    .filter { $0.inStock }
    .sorted { $0.price < $1.price }
    .map { $0.name }
// ["B", "A", "C"] không đúng thứ tự vì B không inStock - kết quả ["A","C"]
```

---

## 5. Xử lý lỗi (Error Handling)

### 5.1 Định nghĩa lỗi

```swift
enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingFailed
    case statusCode(Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL không hợp lệ"
        case .noData: return "Không có dữ liệu"
        case .decodingFailed: return "Không thể phân tích dữ liệu"
        case .statusCode(let code): return "Lỗi server (mã: \(code))"
        }
    }
}
```

### 5.2 throw, do-catch, try?, try!

```swift
func fetchData() throws -> Data {
    guard let url = URL(string: "https://example.com") else {
        throw NetworkError.invalidURL
    }
    // ...
    throw NetworkError.noData
}

// do-catch
do {
    let data = try fetchData()
    // xử lý
} catch NetworkError.statusCode(let code) {
    print("Status: \(code)")
} catch {
    print(error.localizedDescription)
}

// try? - chuyển thành Optional, bỏ qua chi tiết lỗi
if let data = try? fetchData() {
    // xử lý
}

// try! - chỉ dùng nếu CHẮC CHẮN không throw (hiếm)
let data = try! Data(contentsOf: URL(fileURLWithPath: "/dev/null"))
```

**Quy tắc:** Ưu tiên `do-catch` hoặc propagate lỗi (`throws`). Tránh `try!` trong production code.

---

## 6. ARC, bộ nhớ và vòng tham chiếu

### 6.1 ARC là gì?

**Automatic Reference Counting** tự động quản lý bộ nhớ: tăng `retain count` khi giữ reference, giảm khi không còn. Object bị giải phóng khi `retain count = 0`. `deinit` được gọi trước khi giải phóng.

### 6.2 Strong, Weak, Unowned

| Reference | Hành vi | Khi dùng |
|---|---|---|
| **strong** (mặc định) | Tăng retain count, giữ object sống | Hầu hết trường hợp |
| **weak** | Không tăng retain count, tự động set `nil` khi object bị giải phóng | Delegate, parent-child tránh cycle, tránh giữ mạnh |
| **unowned** | Không tăng retain count, **không** tự động set nil → crash nếu truy cập sau khi giải phóng | Chỉ khi chắc chắn object tồn tại cùng/longer lifetime (hiếm, cần cẩn thận) |

```swift
class Person {
    var name: String
    var apartment: Apartment?
    init(name: String) { self.name = name }
    deinit { print("\(name) deinit") }
}

class Apartment {
    var number: String
    weak var tenant: Person?  // tránh strong cycle
    init(number: String) { self.number = number }
    deinit { print("Apt \(number) deinit") }
}
```

### 6.3 Retain Cycle với Closure

Closure capture `self` theo strong reference → có thể tạo cycle giữa object và closure.

```swift
class ViewModel {
    var name = "VM"
    var onComplete: (() -> Void)?
    
    func setup() {
        // SAI - retain cycle nếu closure giữ self lâu dài
        // onComplete = { print(self.name) }
        
        // ĐÚNG - weak self
        onComplete = { [weak self] in
            guard let self else { return }
            print(self.name)
        }
    }
    
    deinit { print("ViewModel deinit") }
}
```

**Khi nào dùng `[weak self]`:** closure được store (property), passed async, hoặc có thể sống lâu hơn object sở hữu.

**Khi nào dùng `[unowned self]`:** cực hiếm, chỉ khi lifecycle closure **chắc chắn ngắn hơn hoặc bằng** và không bao giờ nil. Nếu sai → crash.

### 6.4 Debug memory leaks

- Dùng **Instruments → Leaks** để phát hiện
- Quan sát `deinit` có được gọi không (thêm print tạm thời)
- Chú ý delegate, Timer, NotificationCenter, closure capture
- Với SwiftUI, tránh giữ strong reference không cần thiết giữa ViewModel/Coordinator

---

## 7. Swift Concurrency cơ bản (async/await, Task, MainActor)

Swift Concurrency giúp viết async code tuần tự, an toàn hơn GCD.

### 7.1 async/await

```swift
func fetchData() async throws -> [String] {
    // mô phỏng network
    try await Task.sleep(nanoseconds: 1_000_000_000)
    return ["A", "B", "C"]
}

func load() async {
    do {
        let items = try await fetchData()
        print(items)
    } catch {
        print(error)
    }
}
```

### 7.2 async let - chạy song song

```swift
func loadAll() async throws {
    async let users = fetchUsers()
    async let products = fetchProducts()
    let (u, p) = try await (users, products)  // chờ cả hai
}
```

### 7.3 Task

```swift
// Tạo task từ synchronous context
Task {
    await load()
}

// Task với priority
Task(priority: .userInitiated) {
    // ...
}

// Hủy task
let task = Task {
    try await Task.sleep(nanoseconds: 5_000_000_000)
    print("Done")
}
// task.cancel()
```

### 7.4 MainActor - cập nhật UI

UI chỉ được cập nhật trên main thread.

```swift
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [String] = []
    @Published var isLoading = false
    
    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await fetchData()
        } catch {
            // xử lý lỗi
        }
    }
}

// Gọi từ bất kỳ đâu
Task { @MainActor in
    // cập nhật UI
}

// Hoặc dùng MainActor.run
await MainActor.run {
    // UI update
}
```

**Khái niệm quan trọng:** `actor` bảo vệ mutable state khỏi data race. Trong Swift 6, kiểm tra concurrency chặt chẽ hơn. Luôn ưu tiên chạy UI update trên `@MainActor`.

---

## 8. Xcode, Target, Scheme, Build Settings

### 8.1 Khái niệm cốt lõi

| Khái niệm | Giải thích |
|---|---|
| **Project** | Container chứa targets, settings, files |
| **Target** | Một sản phẩm (App, WidgetExtension, Test). Có signing, capabilities riêng |
| **Scheme** | Cấu hình Run/Test/Profile/Analyze/Archive (thường map Debug/Release) |
| **Build Configuration** | Debug (không optimize, debug symbols), Release (optimize, strip) |
| **Info.plist** | Metadata app (Bundle ID, version, permissions) |
| **Capabilities** | Quyền hệ thống (Push, Background Modes, Keychain Sharing...) |

### 8.2 Cấu trúc file quan trọng

```text
YourApp.xcodeproj/      # project config
YourApp/                # source code
  ├── App/              # @main entry
  ├── Assets.xcassets   # images/colors
  └── Info.plist
YourAppTests/           # unit tests
YourAppUITests/         # UI tests
```

### 8.3 Các thao tác hữu ích

- **Build**: ⌘B
- **Run**: ⌘R
- **Test**: ⌘U
- **Clean Build Folder**: Shift+⌘K
- **Product → Archive**: để xuất build phát hành
- **Report Navigator** (⌘9): xem build log, warning, error chi tiết

### 8.4 Build Settings cần lưu ý

| Setting | Ghi chú |
|---|---|
| **Deployment Target** | iOS tối thiểu app hỗ trợ. Ảnh hưởng API khả dụng |
| **Signing & Capabilities** | Quản lý certificate/provisioning/entitlements |
| **Swift Language Version** | Thường để mặc định theo Xcode, hoặc đặt rõ khi migrate |
| **Other Linker Flags** | Hiếm chỉnh trừ trường hợp đặc biệt |

---

## 9. SwiftUI cơ bản: State, Binding, Observable, View

### 9.1 View là gì?

`View` là struct mô tả UI. `body` trả về view hierarchy. SwiftUI diffing để cập nhật hiệu quả.

```swift
struct ContentView: View {
    var body: some View {
        Text("Hello, World!")
            .padding()
    }
}
```

### 9.2 @State, @Binding

```swift
struct CounterView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") { count += 1 }
            ChildView(count: $count)
        }
    }
}

struct ChildView: View {
    @Binding var count: Int
    
    var body: some View {
        Button("Decrement") { count -= 1 }
    }
}
```

- `@State`: nguồn dữ liệu riêng của view
- `@Binding`: tham chiếu đến state bên ngoài (two-way)

### 9.3 @Observable (iOS 17+) vs ObservableObject

**Khuyến nghị dùng `@Observable` cho dự án mới (iOS 17+):**

```swift
import Observation

@Observable
class ProductStore {
    var products: [Product] = []
    var isLoading = false
    
    func load() async {
        isLoading = true
        // ...
        isLoading = false
    }
}

struct ProductListView: View {
    @State private var store = ProductStore()
    
    var body: some View {
        List(store.products) { product in
            Text(product.name)
        }
        .task { await store.load() }
    }
}
```

**ObservableObject (tương thích rộng):**

```swift
class LegacyStore: ObservableObject {
    @Published var items: [String] = []
}
struct View: View {
    @StateObject private var store = LegacyStore()
    @ObservedObject var shared: LegacyStore
    @EnvironmentObject var global: LegacyStore
}
```

**Quy tắc đơn giản:**
- Tạo object sở hữu: `@State` với `@Observable`, hoặc `@StateObject` với `ObservableObject`
- Quan sát object được truyền: `@Bindable` (với `@Observable`), hoặc `@ObservedObject`
- Chia sẻ toàn cục: `@Environment`/`@EnvironmentObject` cẩn thận, tránh lạm dụng

### 9.4 Common modifiers hữu ích

```swift
Text("Title")
    .font(.headline)
    .foregroundStyle(.primary)
    .padding()
    .background(.gray.opacity(0.1))
    .clipShape(RoundedRectangle(cornerRadius: 8))

Image(systemName: "star.fill")
    .imageScale(.large)
    .foregroundStyle(.yellow)
```

### 9.5 .task, .onAppear, lifecycle

```swift
struct DataView: View {
    @State private var store = Store()
    
    var body: some View {
        List(store.items) { item in Text(item.title) }
            .task {
                // chạy khi view xuất hiện, tự hủy khi view biến mất
                await store.load()
            }
            .refreshable {
                await store.load()
            }
    }
}
```

> Ưu tiên `.task` hơn `.onAppear` cho async work (tự động cancel, rõ ràng hơn).

---

## 10. UIKit tổng quan và khi nào kết hợp

### 10.1 Khi nào dùng UIKit

- Cần `UITableView`/`UICollectionView` với behavior cực kỳ tùy chỉnh
- Tích hợp thư viện UIKit-only cũ
- Custom transition phức tạp
- Một số API chỉ có UIKit
- Cần kiểm soát chi tiết về view lifecycle/performance

### 10.2 Kết hợp SwiftUI + UIKit

**UIViewRepresentable (SwiftUI → UIKit view):**

```swift
import SwiftUI
import UIKit

struct MapView: UIViewRepresentable {
    func makeUIView(context: Context) -> MKMapView {
        MKMapView()
    }
    
    func updateUIView(_ uiView: MKMapView, context: Context) {
        // cập nhật khi state thay đổi
    }
}
```

**UIViewControllerRepresentable:**

```swift
struct MailComposer: UIViewControllerRepresentable {
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> MFMailComposeViewController {
        let vc = MFMailComposeViewController()
        vc.mailComposeDelegate = context.coordinator
        return vc
    }
    
    func updateUIViewController(_ uiViewController: MFMailComposeViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator { Coordinator(dismiss: dismiss) }
    
    class Coordinator: NSObject, MFMailComposeViewControllerDelegate {
        let dismiss: DismissAction
        init(dismiss: DismissAction) { self.dismiss = dismiss }
        func mailComposeController(_ controller: MFMailComposeViewController, didFinishWith result: MFMailComposeResult, error: Error?) {
            dismiss()
        }
    }
}
```

**Nguyên tắc:** Chỉ bọc khi thực sự cần. Giữ adapter mỏng, truyền dữ liệu rõ ràng.

---

## 11. Layout, Auto Layout, Responsive Design

### 11.1 SwiftUI Layout hệ thống

SwiftUI có layout algorithm: parent đề xuất size → child tự quyết → parent đặt vị trí.

Công cụ quan trọng:
- `VStack`, `HStack`, `ZStack`
- `LazyVStack`, `LazyHStack`, `Grid` (iOS 16+)
- `Spacer`, `Divider`
- `Frame`, `Padding`, `Alignment`
- `GeometryReader` (dùng cẩn thận - có thể gây layout phức tạp)

```swift
VStack(alignment: .leading, spacing: 12) {
    Text("Title").font(.headline)
    Text("Subtitle").font(.subheadline).foregroundStyle(.secondary)
    Spacer()
}
.padding()
.frame(maxWidth: .infinity, alignment: .leading)
```

### 11.2 Auto Layout (UIKit) - khái niệm cần biết

- **Constraints**: quan hệ giữa views
- **Safe Area**: tránh notch, home indicator
- **Intrinsic Content Size**: kích thước tự nhiên
- **Compression Resistance / Hugging Priority**: xử lý khi không đủ/ thừa không gian
- **Stack View**: đơn giản hóa layout

Dù chủ yếu dùng SwiftUI, hiểu Auto Layout giúp debug và khi kết hợp UIKit.

### 11.3 Responsive Design

| Kỹ thuật | Mục đích |
|---|---|
| **Safe Area** | Tôn trọng vùng an toàn thiết bị |
| **Dynamic Type** | Hỗ trợ cài đặt font người dùng |
| **Size Classes** | Thích ứng portrait/landscape, iPhone/iPad |
| **Accessibility** | Đủ hit target (>=44x44), semantic, VoiceOver |
| **Dark Mode** | Dùng semantic color (`.primary`, `.background`, asset colors) |
| **Adaptive layout** | `GeometryReader` hoặc `ViewThatFits` (iOS 16+) |

```swift
Text("Content")
    .font(.body)
    .dynamicTypeSize(...DynamicTypeSize.xxxLarge...) // giới hạn nếu cần
```

---

## 12. Navigation, Sheet, FullScreenCover, Alert

### 12.1 NavigationStack (iOS 16+)

```swift
struct RootView: View {
    @State private var path = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $path) {
            List {
                NavigationLink("Chi tiết", value: "detail-id")
            }
            .navigationTitle("Trang chủ")
            .navigationDestination(for: String.self) { id in
                DetailView(id: id)
            }
        }
    }
}
```

**Lợi ích:** programmatic navigation, deep link dễ dàng hơn.

### 12.2 Sheet, FullScreenCover

```swift
struct ContentView: View {
    @State private var showSheet = false
    
    var body: some View {
        Button("Mở form") { showSheet = true }
            .sheet(isPresented: $showSheet) {
                FormView()
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
    }
}
```

### 12.3 Alert, ConfirmationDialog

```swift
Button("Xóa", role: .destructive) { showAlert = true }
    .alert("Xác nhận xóa?", isPresented: $showAlert) {
        Button("Hủy", role: .cancel) {}
        Button("Xóa", role: .destructive) { delete() }
    } message: {
        Text("Hành động này không thể hoàn tác.")
    }
```

### 12.4 Navigation patterns

- **Push**: hierarchy thông thường
- **Sheet/Modal**: flow độc lập, ngắn
- **FullScreenCover**: trải nghiệm immersive
- **TabView**: top-level navigation
- **Coordinator/Router**: hữu ích khi navigation phức tạp, testable

---

## 13. State Management thực tế

### 13.1 Quy tắc nguồn chân lý

Mỗi dữ liệu quan trọng chỉ có **một nguồn chân lý**. UI chỉ đọc và phát hành action.

### 13.2 Các công cụ

| Công cụ | Phạm vi | Ghi chú |
|---|---|---|
| `@State` | View-local | Đơn giản, đủ cho UI state |
| `@Binding` | Parent-child | Chia sẻ state hai chiều |
| `@Observable` + `@State` | Feature state | Khuyến nghị cho iOS 17+ |
| `ObservableObject` | Tương thích rộng | Vẫn phổ biến, cần hiểu rõ `@Published` |
| `Environment` | Dependency xuyên suốt cây view | Dùng cho theme/router/service, tránh truyền prop quá nhiều |
| `AppStorage` | UserDefaults binding | Chỉ cho setting đơn giản |

### 13.3 Anti-pattern state

- Lưu derived value vào state (tính toán lại thay vì lưu)
- Đồng bộ nhiều `@State` gây mâu thuẫn
- Dùng global singleton mutable khắp nơi (khó test)
- Truyền object qua quá nhiều level thay vì dùng `Environment`

### 13.4 Single Source of Truth ví dụ

```swift
@Observable
class CartStore {
    private(set) var items: [CartItem] = []
    
    var total: Decimal {
        items.reduce(0) { $0 + $1.price * Decimal($1.quantity) }
    }
    
    func add(_ item: Product) {
        // cập nhật state tại một nơi
    }
    
    func remove(id: UUID) {
        items.removeAll { $0.id == id }
    }
}
```

---

## 14. Networking với URLSession

### 14.1 Cấu trúc NetworkClient cơ bản

```swift
enum HTTPMethod: String {
    case get = "GET", post = "POST", put = "PUT", patch = "PATCH", delete = "DELETE"
}

struct APIRequest {
    var baseURL: URL
    var path: String
    var method: HTTPMethod = .get
    var headers: [String: String] = [:]
    var body: Data? = nil
    var queryItems: [URLQueryItem] = []
}

final class NetworkClient {
    private let session: URLSession
    private let decoder = JSONDecoder()
    
    init(session: URLSession = .shared) {
        self.session = session
        decoder.dateDecodingStrategy = .iso8601
    }
    
    func send<T: Decodable>(_ request: APIRequest) async throws -> T {
        var components = URLComponents(url: request.baseURL.appendingPathComponent(request.path), resolvingAgainstBaseURL: false)!
        if !request.queryItems.isEmpty { components.queryItems = request.queryItems }
        guard let url = components.url else { throw NetworkError.invalidURL }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = request.method.rawValue
        urlRequest.allHTTPHeaderFields = request.headers
        urlRequest.httpBody = request.body
        urlRequest.timeoutInterval = 30
        
        let (data, response) = try await session.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else { throw NetworkError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else { throw NetworkError.statusCode(http.statusCode) }
        guard !data.isEmpty else { throw NetworkError.noData }
        
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decodingFailed
        }
    }
}
```

### 14.2 Error handling đầy đủ

```swift
enum NetworkError: LocalizedError, Equatable {
    case invalidURL
    case invalidResponse
    case noData
    case statusCode(Int)
    case decodingFailed
    case offline
    case timeout
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL không hợp lệ"
        case .invalidResponse: return "Phản hồi không hợp lệ"
        case .noData: return "Không có dữ liệu"
        case .statusCode(let code): return "Lỗi máy chủ (\(code))"
        case .decodingFailed: return "Lỗi phân tích dữ liệu"
        case .offline: return "Không có kết nối mạng"
        case .timeout: return "Hết thời gian chờ"
        }
    }
}
```

### 14.3 Thực hành quan trọng

| Thực hành | Lý do |
|---|---|
| **Tách endpoint** | Dễ test, dễ thay đổi base URL |
| **Interceptor** | Thêm auth header, logging (chỉ dev), retry |
| **Timeout hợp lý** | Tránh treo UI vô thời hạn |
| **Cancellation** | Với `Task` tự động cancel khi view biến mất |
| **HTTPS only** | Bảo mật, ATS yêu cầu |
| **Không log body chứa secret** | An toàn |
| **Handle offline** | Kiểm tra kết nối hoặc bắt lỗi phù hợp |

### 14.4 GET/POST ví dụ

```swift
struct Product: Codable, Identifiable {
    let id: UUID
    let name: String
    let price: Double
}

func fetchProducts() async throws -> [Product] {
    let client = NetworkClient()
    var req = APIRequest(baseURL: URL(string: "https://api.example.com")!, path: "/products")
    req.headers = ["Accept": "application/json"]
    return try await client.send(req)
}

struct CreateProductRequest: Codable {
    let name: String, price: Double
}

func createProduct(_ body: CreateProductRequest) async throws -> Product {
    let client = NetworkClient()
    var req = APIRequest(baseURL: URL(string: "https://api.example.com")!, path: "/products", method: .post)
    req.headers = ["Content-Type": "application/json", "Accept": "application/json"]
    req.body = try JSONEncoder().encode(body)
    return try await client.send(req)
}
```

---

## 15. Codable, JSON, Mapping và versioning

### 15.1 Codable cơ bản

```swift
struct UserDTO: Codable {
    let id: Int
    let firstName: String
    let lastName: String
    let email: String
}

// JSONDecoder
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .useDefaultKeys  // hoặc .convertFromSnakeCase
let user = try decoder.decode(UserDTO.self, from: data)
```

### 15.2 Custom CodingKeys

```swift
struct APIUser: Codable {
    let userId: Int
    let displayName: String
    
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case displayName = "display_name"
    }
}
```

### 15.3 Mapping DTO → Domain/UI model

**Không bao giờ dùng DTO trực tiếp trong View nếu có khả năng thay đổi.**

```swift
struct UserDTO: Codable {
    let userId: Int
    let firstName: String
    let lastName: String
}

struct User: Identifiable {
    let id: Int
    let fullName: String
}

extension User {
    init(dto: UserDTO) {
        self.id = dto.userId
        self.fullName = "\(dto.firstName) \(dto.lastName)"
    }
}
```

### 15.4 Xử lý optional, default, dates

```swift
struct PostDTO: Codable {
    let id: Int
    let title: String
    let body: String?
    let createdAt: Date
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        body = try container.decodeIfPresent(String.self, forKey: .body)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
    }
}

let decoder = JSONDecoder()
decoder.dateDecodingStrategy = .custom { decoder in
    // custom parsing nếu cần
    throw DecodingError.dataCorrupted(...)
}
// hoặc .iso8601, .secondsSince1970
```

### 15.5 Versioning API

- Thêm field mới: backend có thể thêm optional → client phải dùng `decodeIfPresent`
- Thay đổi tên field: dùng `CodingKeys`
- Không giả định field luôn tồn tại
- Viết decoder resilient: xử lý thiếu dữ liệu, type mismatch cẩn thận
- Có thể dùng wrapper hoặc fallback

---

## 16. Lưu trữ cục bộ: UserDefaults, FileManager, Keychain

### 16.1 So sánh

| Storage | Dùng cho | An toàn | Giới hạn | Ghi chú |
|---|---|---|---|---|
| **UserDefaults** | Cài đặt đơn giản (bool/string/int) | Thấp (không mã hóa) | Nhỏ | Không lưu token/secret |
| **FileManager** | File lớn, cache, JSON offline | Tùy thuộc thư mục | Lớn hơn | Dùng `Documents/` (user data), `Library/Caches/` (cache có thể bị xóa) |
| **Keychain** | Thông tin nhạy cảm (token, credential) | Cao (mã hóa hệ thống) | Phù hợp nhỏ | Khuyến nghị cho secret |
| **SwiftData/Core Data** | Dữ liệu quan hệ phức tạp, offline-first | Tùy | Lớn | Xem chi tiết ở advanced |

### 16.2 UserDefaults

```swift
enum DefaultsKey {
    static let hasSeenOnboarding = "hasSeenOnboarding"
}

extension UserDefaults {
    var hasSeenOnboarding: Bool {
        get { bool(forKey: DefaultsKey.hasSeenOnboarding) }
        set { set(newValue, forKey: DefaultsKey.hasSeenOnboarding) }
    }
}

// Dùng
UserDefaults.standard.hasSeenOnboarding = true
```

### 16.3 FileManager - lưu JSON

```swift
struct CacheManager {
    static let shared = CacheManager()
    private let fileName = "products.json"
    
    private var fileURL: URL {
        let urls = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)
        return urls[0].appendingPathComponent(fileName)
    }
    
    func save(_ products: [Product]) throws {
        let data = try JSONEncoder().encode(products)
        try data.write(to: fileURL, options: .atomic)
    }
    
    func load() throws -> [Product] {
        let data = try Data(contentsOf: fileURL)
        return try JSONDecoder().decode([Product].self, from: data)
    }
    
    func clear() {
        try? FileManager.default.removeItem(at: fileURL)
    }
}
```

> **Lưu ý:** `Caches/` có thể bị hệ thống dọn khi thiếu dung lượng. `Documents/` được backup bởi iCloud (nếu bật). Chỉ lưu dữ liệu user-generated vào `Documents/`.

### 16.4 Keychain (khái quát)

Không lưu token dài hạn trong `UserDefaults`. Dùng Keychain. Có nhiều wrapper (vd. KeychainAccess) hoặc implement đơn giản. Nguyên tắc:
- Chỉ lưu thông tin cần thiết
- Xóa khi logout
- Tránh log
- Cân nhắc `kSecAttrAccessible` phù hợp (thường `afterFirstUnlock` hoặc nghiêm ngặt hơn tùy yêu cầu)

---

## 17. App Lifecycle, Scene, Background/Foreground

### 17.1 Khái niệm

Từ iOS 13+, dùng **Scene** thay vì single app delegate cho multi-window. Vẫn cần hiểu cả hai.

**Trạng thái app quan trọng:**
- `active`: đang chạy tương tác
- `inactive`: chuyển đổi trạng thái (incoming call, notification)
- `background`: chạy nền (giới hạn thời gian)
- `terminated`: bị kill

### 17.2 SwiftUI App lifecycle

```swift
@main
struct ExampleApp: App {
    @Environment(\.scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { oldPhase, newPhase in
            switch newPhase {
            case .active: print("Active")
            case .inactive: print("Inactive")
            case .background: print("Background")
            @unknown default: break
            }
        }
    }
}
```

### 17.3 Thực hành

| Sự kiện | Hành động phù hợp |
|---|---|
| **Vào foreground** | Refresh dữ liệu nếu stale, resume timer/realtime |
| **Vào background** | Lưu state quan trọng, ngừng timer không cần thiết, chuẩn bị cho kill |
| **Inactive** | Tạm dừng animation nặng, tránh UI updates không cần thiết |
| **Terminate** | Chỉ có thể lưu nhanh trong các hook, không phụ thuộc vào đây |

> ⚠️ App có thời gian rất hạn chế khi vào background. Đừng thực hiện network dài. Nếu cần xử lý nền dài hạn, xem **Background Tasks** ở advanced.

---

## 18. Debugging, Logging, Instruments cơ bản

### 18.1 Debug cơ bản

| Công cụ | Sử dụng |
|---|---|
| **Breakpoints** | Dừng execution, inspect biến |
| **LLDB** | `po`, `p`, `expr`, debug runtime |
| **View Debugger** | Inspect view hierarchy, constraints |
| **Debug Navigator** | Theo dõi threads, memory, CPU |
| **Console** | Xem log/crash |

### 18.2 Logging

Tránh `print` trong production. Dùng `os.Logger`:

```swift
import OSLog

struct Log {
    static let network = Logger(subsystem: "com.example.app", category: "Network")
    static let ui = Logger(subsystem: "com.example.app", category: "UI")
}

// Dùng
Log.network.debug("Request started")
Log.network.error("Failed: \(error.localizedDescription)")
```

**Lợi ích:** filter theo category/subsystem, không spam console không cần thiết, hiệu quả hơn.

### 18.3 Instruments cơ bản

| Instrument | Mục đích |
|---|---|
| **Time Profiler** | Tìm hot path, function chậm |
| **Leaks** | Phát hiện memory leak/retain cycle |
| **Allocations** | Theo dõi allocation, object graph |
| **Network** | Debug request/response (thường dùng proxy như Proxyman/Charles) |
| **Core Animation** | Kiểm tra FPS, offscreen rendering |

**Quy trình debug hiệu quả:** reproduce → isolate → breakpoint/log → measure (Instruments) → fix → verify.

---

## 19. Testing cơ bản với XCTest

### 19.1 Unit Test

```swift
import XCTest
@testable import ExampleApp

final class ValidatorTests: XCTestCase {
    func testValidEmail() {
        XCTAssertTrue("test@example.com".isValidEmail())
    }
    
    func testInvalidEmail() {
        XCTAssertFalse("invalid".isValidEmail())
    }
    
    func testEmptyString() {
        XCTAssertFalse("".isValidEmail())
    }
}
```

### 19.2 Test async/throws

```swift
final class ServiceTests: XCTestCase {
    func testFetch() async throws {
        let service = MockService()
        let items = try await service.fetch()
        XCTAssertEqual(items.count, 2)
    }
}
```

### 19.3 Mock/Stub

```swift
protocol ProductServiceProtocol {
    func fetch() async throws -> [Product]
}

final class MockProductService: ProductServiceProtocol {
    var result: Result<[Product], Error> = .success([])
    func fetch() async throws -> [Product] {
        try result.get()
    }
}
```

### 19.4 Nguyên tắc test

- **AAA**: Arrange - Act - Assert
- **Test một điều** mỗi test function
- **Đặt tên rõ ràng**: `test_method_scenario_expectedResult`
- **Ưu tiên test logic** (validator, formatter, mapper, ViewModel) trước UI test
- **Dùng `@testable import`** để truy cập internal
- **Tránh test implementation details** quá sâu

**Chạy test:** ⌘U hoặc **Product → Test**

---

## 20. Thực hành tổng hợp: Ứng dụng danh sách sản phẩm

Mục tiêu: xây dựng app đơn giản, chạy được, áp dụng hầu hết kiến thức trên. **Không dùng backend thực** - dùng mock/local data để tập trung vào nền tảng.

### 20.1 Yêu cầu

- [ ] Hiển thị danh sách sản phẩm
- [ ] Loading state
- [ ] Error state + retry
- [ ] Pull-to-refresh
- [ ] Điều hướng sang màn hình chi tiết
- [ ] Tách Model/ViewModel/Service
- [ ] Test cơ bản cho ViewModel

### 20.2 Model

```swift
struct Product: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let price: Double
    let description: String
    let imageName: String
}
```

### 20.3 Service (mock)

```swift
protocol ProductService {
    func fetchProducts() async throws -> [Product]
}

final class MockProductService: ProductService {
    func fetchProducts() async throws -> [Product] {
        try await Task.sleep(nanoseconds: 500_000_000)
        // Mô phỏng lỗi ngẫu nhiên nếu muốn test
        return [
            Product(id: UUID(), name: "Sản phẩm A", price: 100000, description: "Mô tả A", imageName: "photo"),
            Product(id: UUID(), name: "Sản phẩm B", price: 200000, description: "Mô tả B", imageName: "photo")
        ]
    }
}
```

### 20.4 ViewModel

```swift
enum ViewState<T> {
    case idle, loading, loaded(T), error(String)
}

@Observable
class ProductListViewModel {
    private let service: ProductService
    var state: ViewState<[Product]> = .idle
    
    init(service: ProductService = MockProductService()) {
        self.service = service
    }
    
    func load() async {
        state = .loading
        do {
            let products = try await service.fetchProducts()
            state = .loaded(products)
        } catch {
            state = .error(error.localizedDescription)
        }
    }
    
    func retry() async {
        await load()
    }
}
```

### 20.5 Views

```swift
struct ProductListView: View {
    @State private var viewModel = ProductListViewModel()
    
    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Sản phẩm")
                .task { await viewModel.load() }
                .refreshable { await viewModel.load() }
        }
    }
    
    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .idle:
            EmptyView()
        case .loading:
            ProgressView("Đang tải...")
        case .loaded(let products):
            List(products) { product in
                NavigationLink(value: product) {
                    ProductRowView(product: product)
                }
            }
            .navigationDestination(for: Product.self) { product in
                ProductDetailView(product: product)
            }
        case .error(let message):
            VStack(spacing: 16) {
                Text(message).multilineTextAlignment(.center)
                Button("Thử lại") {
                    Task { await viewModel.retry() }
                }
            }
            .padding()
        }
    }
}

struct ProductRowView: View {
    let product: Product
    var body: some View {
        HStack {
            Image(systemName: product.imageName)
                .frame(width: 40, height: 40)
            VStack(alignment: .leading) {
                Text(product.name).font(.headline)
                Text("\(Int(product.price)) VNĐ").font(.subheadline).foregroundStyle(.secondary)
            }
        }
    }
}

struct ProductDetailView: View {
    let product: Product
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Image(systemName: product.imageName)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 200)
                Text(product.name).font(.title2).bold()
                Text("\(Int(product.price)) VNĐ").font(.title3)
                Text(product.description).font(.body)
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Chi tiết")
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

### 20.6 Kiểm tra

- [ ] Chạy trên simulator không crash
- [ ] Loading hiển thị đúng
- [ ] Danh sách render đúng
- [ ] Navigation hoạt động
- [ ] Pull-to-refresh hoạt động
- [ ] Error + retry hoạt động (test bằng cách throw lỗi)
- [ ] Không cập nhật UI trên background thread
- [ ] Code tách rõ Model/ViewModel/View/Service

---

## 21. Bài tập tự luyện (có gợi ý)

| # | Bài tập | Mức độ | Gợi ý |
|---|---|---|---|
| **1** | **Validation** | Cơ bản | Viết hàm validate email/password. Unit test đầy đủ. |
| **2** | **Todo App** | Cơ bản | CRUD, lưu `UserDefaults`/file. Dùng `@Observable`. |
| **3** | **Notes App** | Cơ bản | Thêm sửa xóa, search, empty state. |
| **4** | **API Client** | Trung bình | Xây dựng `NetworkClient` generic + error mapping + test với mock. |
| **5** | **Weather UI** | Trung bình | Sử dụng mock data, loading/error, pull-to-refresh. |
| **6** | **Form phức tạp** | Trung bình | Validation realtime, disable button, focus handling. |
| **7** | **Image Cache đơn giản** | Trung bình | Download ảnh + cache in-memory/file, tránh duplicate request. |
| **8** | **Navigation sâu** | Trung bình | Dùng `NavigationStack` với path, hỗ trợ deep link mô phỏng. |

**Quy tắc:** Làm **từ đầu không copy** bài 20. Sau khi xong, so sánh, refactor.

---

## 22. Checklist tự đánh giá

### Ngôn ngữ & Bộ nhớ
- [ ] Hiểu Optional, unwrap an toàn
- [ ] Phân biệt struct vs class vs enum
- [ ] Biết protocol, extension, access control
- [ ] Hiểu ARC, weak/unowned, retain cycle
- [ ] Biết phát hiện leak đơn giản

### Concurrency & UI
- [ ] Dùng được `async/await`, `Task`, `MainActor`
- [ ] Thành thạo `@State`, `@Binding`, `@Observable`
- [ ] Biết NavigationStack, Sheet, Alert
- [ ] Hiểu state management đơn giản, rõ ràng

### Networking & Storage
- [ ] Viết `URLSession` cơ bản, xử lý lỗi
- [ ] Dùng `Codable` + mapping DTO→Domain
- [ ] Phân biệt UserDefaults/FileManager/Keychain
- [ ] Biết khi nào cache offline

### Thực tế
- [ ] Đọc được build error/log
- [ ] Viết unit test cho logic
- [ ] Debug bằng breakpoint + View Debugger
- [ ] Biết dùng Instruments sơ bộ (Leaks/Time Profiler)

---

## 23. Anti-patterns và cách tránh

| Anti-pattern | Tại sao sai | Cách thay thế |
|---|---|---|
| **Force unwrap `!`** | Crash không dự đoán | `guard let`, `if let`, `??`, optional chaining |
| **Gọi async trong `body`** | Body re-evaluate nhiều lần | `.task { await ... }` |
| **Tạo `@StateObject`/`@State` không đúng** | Mất state hoặc tạo lại | Tạo object ở nơi sở hữu đúng |
| **Capture `self` mạnh trong closure** | Retain cycle/leak | `[weak self]` + `guard let self` |
| **Lưu secret trong UserDefaults** | Không an toàn | Keychain |
| **Logic nặng trên MainActor không cần** | Block UI | Chuyển xuống background, quay lại MainActor để update UI |
| **Dùng `print` vô tội vạ** | Khó lọc, log rác | `os.Logger` theo category |
| **Force cast `as!`** | Crash runtime | `as?` + xử lý |
| **Trộn UI và networking trực tiếp** | Khó test, khó bảo trì | Tách Service/Repository/ViewModel |
| **Bỏ qua optional/throws** | Mất kiểm soát lỗi | Luôn xử lý rõ ràng |

---

## 24. Tài liệu tham khảo

- [Swift Book](https://docs.swift.org/swift-book/) — Ngôn ngữ chính thức
- [Swift Concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) — async/await, Task, actor
- [SwiftUI](https://developer.apple.com/documentation/swiftui) — API và guides
- [UIKit](https://developer.apple.com/documentation/uikit) — Tham khảo khi cần
- [Foundation/URLSession](https://developer.apple.com/documentation/foundation/urlsession) — Networking
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) — Thiết kế chuẩn Apple
- [Xcode Docs](https://developer.apple.com/documentation/xcode) — Build/debug/test/archive
- [Instruments](https://developer.apple.com/documentation/instruments) — Profiling
- [OSLog/Logger](https://developer.apple.com/documentation/os/logger) — Logging hiệu quả
- [WWDC Videos](https://developer.apple.com/videos/) — Cập nhật mới nhất

*Học chậm mà chắc. Viết code, debug, refactor. Đó là cách nhanh nhất để tiến bộ.*
