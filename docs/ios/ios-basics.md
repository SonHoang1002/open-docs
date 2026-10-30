# iOS Cơ bản — Swift, SwiftUI và nền tảng phát triển iOS

> Tài liệu nền tảng để xây dựng ứng dụng iOS từ đầu. Tập trung vào ngôn ngữ Swift, bộ nhớ, concurrency, Xcode, SwiftUI, UIKit, networking, lưu trữ và quy trình phát triển chuẩn. 
> 
> Ưu tiên hiểu bản chất thay vì học thuộc, và áp dụng đúng các quy tắc để tránh các lỗi phổ biến trong thực tế.

**Môi trường tham khảo:** Swift 6 (Swift 5 language mode), iOS 17.0+, Xcode 16+

---

## Mục lục

- [1. Tổng quan về phát triển iOS](#1-tổng-quan-về-phát-triển-ios)
- [2. Swift cơ bản](#2-swift-cơ-bản)
- [3. Kiểu dữ liệu nâng cao: Struct, Class, Enum, Protocol](#3-kiểu-dữ-liệu-nâng-cao-struct-class-enum-protocol)
- [4. Closures, Higher-Order Functions và Functional Thinking](#4-closures-higher-order-functions-và-functional-thinking)
- [5. Xử lý lỗi (Error Handling)](#5-xử-lý-lỗi-error-handling)
- [6. Quản lý bộ nhớ với ARC](#6-quản-lý-bộ-nhớ-với-arc)
- [7. Swift Concurrency cơ bản](#7-swift-concurrency-cơ-bản)
- [8. Xcode, Project, Target, Scheme và Build Settings](#8-xcode-project-target-scheme-và-build-settings)
- [9. SwiftUI cơ bản](#9-swiftui-cơ-bản)
- [10. UIKit Tổng quan](#10-uikit-tổng-quan)
- [11. Layout, Auto Layout và Responsive Design](#11-layout-auto-layout-và-responsive-design)
- [12. Navigation, Sheet, Alert và Presentation](#12-navigation-sheet-alert-và-presentation)
- [13. Networking với URLSession](#13-networking-với-urlsession)
- [14. JSON, Codable và Mapping dữ liệu](#14-json-codable-và-mapping-dữ-liệu)
- [15. Lưu trữ dữ liệu cục bộ](#15-lưu-trữ-dữ-liệu-cục-bộ)
- [16. App Lifecycle, Scene và State Preservation](#16-app-lifecycle-scene-và-state-preservation)
- [17. Debugging, Logging và Instruments](#17-debugging-logging-và-instruments)
- [18. Testing cơ bản với XCTest](#18-testing-cơ-bản-với-xctest)
- [19. Build, Run, Signing và Distribution căn bản](#19-build-run-signing-và-distribution-căn-bản)
- [20. Thực hành tổng hợp: Xây dựng màn hình danh sách](#20-thực-hành-tổng-hợp-xây-dựng-màn-hình-danh-sách)
- [21. Anti-patterns thường gặp và cách tránh](#21-anti-patterns-thường-gặp-và-cách-tránh)
- [22. Lộ trình học tiếp theo](#22-lộ-trình-học-tiếp-theo)
- [23. Tài liệu tham khảo](#23-tài-liệu-tham-khảo)

---

## 1. Tổng quan về phát triển iOS

Trước khi đi vào code, cần nắm rõ quy trình phát triển một ứng dụng iOS:

| Khái niệm | Giải thích |
|---|---|
| **Native iOS** | Ứng dụng được viết bằng Swift/Objective-C, chạy trực tiếp trên hệ điều hành iOS, tận dụng tối đa hiệu năng và API hệ thống. |
| **UIKit** | Framework cổ điển, imperatively-based. Rất phổ biến, bao phủ hầu hết các tính năng của iOS. |
| **SwiftUI** | Framework khai báo (declarative), hiện đại, đơn giản hơn cho UI. Được khuyến khích cho dự án mới từ iOS 13+. |
| **App Sandbox** | Mỗi app chạy trong môi trường bị cô lập, chỉ được truy cập tài nguyên được cấp phép. |
| **Human Interface Guidelines (HIG)** | Bộ quy tắc thiết kế của Apple giúp app nhất quán, thân thiện và dễ sử dụng. |

---

## 2. Swift cơ bản

Swift là ngôn ngữ mạnh mẽ, an toàn về kiểu (type-safe), hiệu năng cao và được thiết kế đặc biệt cho hệ sinh thái Apple.

### 2.1 Biến, hằng và kiểu dữ liệu

- `let`: khai báo hằng số (không thay đổi sau khi gán)
- `var`: khai báo biến (có thể thay đổi)
- Swift có khả năng **type inference** (suy luận kiểu), nhưng vẫn khuyến khích khai báo rõ ràng khi giúp code dễ đọc hơn.

```swift
let appName = "MyApp" // String, inferred
var counter: Int = 0   // Int, explicit
let version = 1.0      // Double
```

Các kiểu cơ bản quan trọng:

| Kiểu | Mô tả |
|---|---|
| `Int` | Số nguyên (phụ thuộc nền tảng 64-bit trên thiết bị hiện tại) |
| `Double` / `Float` | Số thực |
| `Bool` | `true` / `false` |
| `String` | Chuỗi ký tự Unicode |
| `Character` | Ký tự đơn |
| `Array<Element>` | Mảng có thứ tự |
| `Set<Element>` | Tập hợp không trùng lặp, không đảm bảo thứ tự |
| `Dictionary<Key: Hashable, Value>` | Ánh xạ key-value |

### 2.2 Optional

**Optional** đại diện cho một giá trị có thể tồn tại hoặc không (`nil`). Đây là cơ chế quan trọng giúp Swift tránh lỗi "unexpectedly found nil".

Có nhiều cách để unwrap Optional:

| Cách | Mô tả | Ghi chú |
|---|---|---|
| `if let` | Unwrap an toàn nếu có giá trị | Rất phổ biến, giữ phạm vi biến cục bộ |
| `guard let` | Unwrap an toàn, nếu `nil` thoát khỏi scope hiện tại (`return`, `break`, `throw`) | Ưu tiên dùng khi cần dừng sớm |
| `??` (Nil-coalescing) | Cung cấp giá trị mặc định nếu `nil` | Ngắn gọn, phù hợp hiển thị UI |
| Optional chaining `?.` | Gọi thuộc tính/phương thức nếu optional không nil, ngược lại trả về `nil` | Tránh if-let lồng nhau |
| `!` (Force unwrap) | Ép unwrap, crash nếu `nil` | **Chỉ dùng** khi bạn hoàn toàn chắc chắn giá trị tồn tại (hiếm khi trong code thực tế) |

```swift
var nickname: String? = "Alex"

// if let
if let unwrapped = nickname {
    print("Xin chào \(unwrapped)")
}

// guard let
func greet(_ name: String?) {
    guard let name else { return } // Thoát nếu nil
    print("Xin chào \(name)")
}

// Nil-coalescing
let displayName = nickname ?? "Khách"

// Optional chaining
let count = nickname?.count // Int?
```

### 2.3 Vòng lặp và rẽ nhánh

```swift
// if-else
if counter >= 10 {
    print("Đủ")
} else if counter >= 5 {
    print("Gần đủ")
} else {
    print("Còn ít")
}

// switch - rất mạnh trong Swift
enum Status { case idle, loading, success, failure }
let status: Status = .loading
switch status {
case .idle: print("Chưa bắt đầu")
case .loading: print("Đang tải")
case .success: print("Thành công")
case .failure: print("Thất bại")
}

// for-in
for i in stride(from: 0, to: 5, by: 1) {
    print(i)
}

// while
var attempts = 0
while attempts < 3 {
    attempts += 1
}
```

### 2.4 Hàm (Functions)

Hàm trong Swift hỗ trợ tham số mặc định, label tham số, return nhiều giá trị (tuple), và `inout`.

```swift
// Hàm cơ bản
func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}

// Tham số mặc định
func greet(name: String, prefix: String = "Xin chào") -> String {
    return "\(prefix), \(name)!"
}

// Nhiều giá trị trả về
func minMax(_ numbers: [Int]) -> (min: Int, max: Int)? {
    guard let first = numbers.first else { return nil }
    var min = first, max = first
    for num in numbers.dropFirst() {
        if num < min { min = num }
        if num > max { max = num }
    }
    return (min, max)
}

// inout - thay đổi giá trị bên ngoài
func increment(_ value: inout Int) {
    value += 1
}
```

---

## 3. Kiểu dữ liệu nâng cao: Struct, Class, Enum, Protocol

Việc lựa chọn đúng kiểu dữ liệu là nền tảng để viết code rõ ràng, an toàn và dễ bảo trì.

### 3.1 So sánh Struct, Class, Enum

| Đặc điểm | `struct` | `class` | `enum` |
|---|---|---|---|
| **Kiểu** | Value Type (truyền theo giá trị - copy) | Reference Type (truyền theo tham chiếu - cùng địa chỉ bộ nhớ) | Value Type |
| **Kế thừa** | Không hỗ trợ | Có thể kế thừa từ class khác | Không hỗ trợ |
| **`deinit`** | Không có | Có (gọi khi instance bị giải phóng) | Không có |
| **Identity** | Không quan tâm "cùng object", quan tâm "bằng giá trị" | Quan tâm "cùng một instance" | Không quan tâm identity |
| **Thread-safety** | An toàn hơn do copy | Cần cẩn thận do shared state | An toàn hơn do value type |
| **Khi dùng** | Model dữ liệu, state, DTO, cấu trúc nhỏ | Service, Manager, Coordinator, đối tượng có vòng đời phức tạp | Trạng thái hữu hạn, lựa chọn ràng buộc, Result-like type |

```swift
struct User {
    var name: String
    var age: Int
}

var user1 = User(name: "An", age: 25)
var user2 = user1
user2.name = "Binh"
print(user1.name) // "An" - user1 không bị ảnh hưởng (copy)
```

```swift
class NetworkManager {
    var isConnected: Bool = false
}

let manager1 = NetworkManager()
let manager2 = manager1
manager2.isConnected = true
print(manager1.isConnected) // true - cùng instance
```

### 3.2 Enum mạnh mẽ trong Swift

Enum không chỉ là tập hằng số như nhiều ngôn ngữ khác. Trong Swift, enum có thể có **raw value**, **associated value**, **computed property**, và **method**.

```swift
// Enum đơn giản
enum Direction {
    case north, south, east, west
}

// Enum với associated value
enum NetworkResult {
    case success(data: Data)
    case failure(error: Error)
    case offline
}

// Enum với raw value
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

// Sử dụng
func handle(result: NetworkResult) {
    switch result {
    case .success(let data):
        print("Nhận \(data.count) bytes")
    case .failure(let error):
        print("Lỗi: \(error.localizedDescription)")
    case .offline:
        print("Không có mạng")
    }
}
```

### 3.3 Protocol và Extension

**Protocol** định nghĩa "hợp đồng" về hành vi mà một kiểu phải tuân thủ. **Extension** cho phép mở rộng chức năng của kiểu có sẵn mà không cần kế thừa.

```swift
protocol Identifiable {
    var id: UUID { get }
}

struct Article: Identifiable {
    let id = UUID()
    let title: String
    let content: String
}

// Extension thêm phương thức
extension String {
    var trimmed: String {
        self.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    func isValidEmail() -> Bool {
        let regex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
        return NSPredicate(format: "SELF MATCHES %@", regex).evaluate(with: self)
    }
}

// Sử dụng
let email = " test@example.com ".trimmed
print(email.isValidEmail()) // true
```

### 3.4 Access Control

Kiểm soát truy cập giúp bảo vệ API nội bộ và thiết kế module rõ ràng.

| Modifier | Phạm vi |
|---|---|
| `open` | Chỉ dùng cho class. Cho phép override từ module khác. |
| `public` | Truy cập từ module khác, nhưng không cho override. |
| `internal` | Mặc định. Chỉ truy cập trong cùng module. |
| `fileprivate` | Chỉ truy cập trong cùng file. |
| `private` | Chỉ truy cập trong cùng declaration/scope. |

**Nguyên tắc:** Bắt đầu với mức hạn chế nhất (`private`) có thể, chỉ mở rộng khi thực sự cần thiết.

---

## 4. Closures, Higher-Order Functions và Functional Thinking

### 4.1 Closures là gì?

**Closure** là một khối code có thể được truyền đi, gán vào biến, và **capture** (bắt giữ) các giá trị từ phạm vi xung quanh.

Cú pháp closure có thể được rút gọn rất mạnh trong Swift:

```swift
let numbers = [1, 2, 3, 4, 5]

// Dạng đầy đủ
let doubledFull = numbers.map({ (number: Int) -> Int in
    return number * 2
})

// Rút gọn: type inference
let doubled1 = numbers.map({ number in number * 2 })

// Rút gọn: shorthand argument names ($0, $1,...)
let doubled2 = numbers.map { $0 * 2 }

// Nếu closure là tham số cuối cùng, có thể bỏ ngoặc
let doubled3 = numbers.map { $0 * 2 }
```

### 4.2 Higher-Order Functions

Các hàm bậc cao rất hữu ích để xử lý collection một cách ngắn gọn, rõ ràng.

| Hàm | Mục đích | Ví dụ |
|---|---|---|
| `map` | Biến đổi mỗi phần tử, trả về mảng mới cùng kích thước | `[1,2,3].map { $0 * 2 }` |
| `filter` | Lọc phần tử thỏa điều kiện | `[1,2,3,4].filter { $0 % 2 == 0 }` |
| `reduce` | Gộp toàn bộ thành một giá trị duy nhất | `[1,2,3].reduce(0) { $0 + $1 }` |
| `compactMap` | Map + loại bỏ `nil` | `["1","a","2"].compactMap(Int.init)` |
| `flatMap` | Làm phẳng mảng lồng nhau | `[[1,2],[3]].flatMap { $0 }` |
| `forEach` | Thực thi cho mỗi phần tử (không trả về giá trị) | `items.forEach { print($0) }` |
| `sorted(by:)` | Sắp xếp theo điều kiện | `items.sorted { $0 < $1 }` |
| `first(where:)` | Tìm phần tử đầu tiên thỏa điều kiện | `items.first { $0.isActive }` |

```swift
struct Product {
    let name: String
    let price: Double
    let inStock: Bool
}

let products = [
    Product(name: "Bàn phím", price: 899000, inStock: true),
    Product(name: "Chuột", price: 450000, inStock: false),
    Product(name: "Tai nghe", price: 1290000, inStock: true)
]

// Lấy tên sản phẩm còn hàng, sắp xếp theo giá
let result = products
    .filter { $0.inStock }
    .sorted { $0.price < $1.price }
    .map { $0.name }

print(result) // ["Bàn phím", "Tai nghe"]
```

---

## 5. Xử lý lỗi (Error Handling)

Swift phân biệt rõ **lỗi có thể phục hồi** (`throws`) và **lỗi lập trình** (crash).

### 5.1 Định nghĩa và throw lỗi

```swift
enum LoginError: LocalizedError {
    case emptyEmail
    case emptyPassword
    case invalidEmail
    case weakPassword(minLength: Int)
    
    var errorDescription: String? {
        switch self {
        case .emptyEmail: return "Email không được để trống"
        case .emptyPassword: return "Mật khẩu không được để trống"
        case .invalidEmail: return "Email không hợp lệ"
        case .weakPassword(let minLength): return "Mật khẩu cần ít nhất \(minLength) ký tự"
        }
    }
}

func login(email: String, password: String) throws -> String {
    let emailTrimmed = email.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !emailTrimmed.isEmpty else { throw LoginError.emptyEmail }
    guard emailTrimmed.contains("@") else { throw LoginError.invalidEmail }
    guard !password.isEmpty else { throw LoginError.emptyPassword }
    guard password.count >= 8 else { throw LoginError.weakPassword(minLength: 8) }
    return "auth-token-example"
}
```

### 5.2 Bắt và xử lý lỗi

```swift
// do-catch
do {
    let token = try login(email: "user@test.com", password: "12345678")
    print("Đăng nhập thành công, token: \(token)")
} catch LoginError.invalidEmail {
    print("Vui lòng nhập đúng định dạng email")
} catch {
    print("Lỗi khác: \(error.localizedDescription)")
}

// try? - trả về Optional, bỏ qua chi tiết lỗi
if let token = try? login(email: "user@test.com", password: "12345678") {
    print(token)
}

// try! - force try, CRASH nếu throw. Chỉ dùng khi tuyệt đối không thể xảy ra lỗi
// let token = try! login(email: "admin@test.com", password: "veryStrongPass123")
```

**Quy tắc quan trọng:**

- Dùng `throws` cho lỗi **có thể dự đoán và phục hồi** (validation, network, file)
- **Không bao giờ** dùng `try!` cho input người dùng, response mạng, hoặc dữ liệu bên ngoài
- Luôn hiện thông báo thân thiện với người dùng, log chi tiết cho dev/debug

---

## 6. Quản lý bộ nhớ với ARC

Swift sử dụng **Automatic Reference Counting (ARC)** để tự động theo dõi và giải phóng bộ nhớ cho các **reference type** (`class`). **Value type** (`struct`, `enum`) không bị ARC quản lý vì chúng được copy thay vì tham chiếu.

### 6.1 Strong, Weak, Unowned

Khi một instance được tham chiếu, ARC tăng bộ đếm. Khi không còn tham chiếu mạnh, bộ đếm về 0 và instance được giải phóng (`deinit` được gọi).

| Tham chiếu | Hành vi | Khi sử dụng |
|---|---|---|
| `strong` (mặc định) | Tăng retain count, giữ instance sống | Quan hệ sở hữu thông thường (cha -> con) |
| `weak` | Không tăng retain count, tự động trở thành `nil` khi instance bị giải phóng | Quan hệ sở hữu ngược, tránh retain cycle. Thường dùng với `var` và `Optional` |
| `unowned` | Không tăng retain count, **KHÔNG** tự động trở thành `nil` | Khi chắc chắn 100% instance tham chiếu vẫn còn sống suốt thời gian sử dụng. Nếu không, gây **crash** `EXC_BAD_ACCESS` |

### 6.2 Retain Cycle (Vòng tham chiếu giữ nhau)

**Retain cycle** xảy ra khi hai object giữ lẫn nhau bằng `strong reference`, khiến cả hai không bao giờ về 0 và không bị giải phóng (memory leak).

```swift
class Owner {
    var pet: Pet?
    deinit { print("Owner deinit") }
}

class Pet {
    var owner: Owner? // strong mặc định -> gây retain cycle
    deinit { print("Pet deinit") }
}

var owner: Owner? = Owner()
var pet: Pet? = Pet()
owner?.pet = pet
pet?.owner = owner

owner = nil
pet = nil
// KHÔNG in ra deinit -> leak
```

**Khắc phục bằng `weak`:**

```swift
class Pet {
    weak var owner: Owner? // weak reference
    deinit { print("Pet deinit") }
}

// Sau khi gán nil: cả hai đều in deinit
```

### 6.3 Retain Cycle với Closure

Closures cũng là reference type và có thể capture `self` mạnh mẽ.

```swift
class ViewModel {
    var onUpdate: (() -> Void)?
    
    func setup() {
        // Sai: closure capture self mạnh -> retain cycle
        // onUpdate = { self.refresh() }
        
        // Đúng: dùng capture list [weak self]
        onUpdate = { [weak self] in
            guard let self else { return }
            self.refresh()
        }
    }
    
    func refresh() { print("Đã refresh") }
    deinit { print("ViewModel deinit") }
}
```

**Lời khuyên:**

- Luôn nghĩ về **vòng đời** giữa các object khi dùng `class`
- Ưu tiên `struct` cho model/state để tránh hoàn toàn vấn đề tham chiếu
- Dùng `[weak self]` trong closure trừ khi bạn có lý do rất rõ ràng để dùng `[unowned self]`
- Theo dõi memory bằng **Instruments > Leaks** trong quá trình phát triển

---

## 7. Swift Concurrency cơ bản

Từ Swift 5.5+, **Swift Concurrency** được tích hợp native, giúp viết code bất đồng bộ an toàn, dễ đọc hơn rất nhiều so với `GCD` truyền thống.

### 7.1 async/await

- `async` đánh dấu hàm có thể bị tạm dừng (suspend) trong khi chờ
- `await` đánh dấu điểm tạm dừng, cho phép thread khác làm việc trong lúc chờ

```swift
func fetchUser() async throws -> User {
    // Giả lập gọi mạng
    try await Task.sleep(for: .seconds(1))
    return User(name: "Minh", age: 28)
}

// Gọi async function
Task {
    do {
        let user = try await fetchUser()
        print("Người dùng: \(user.name)")
    } catch {
        print("Lỗi: \(error)")
    }
}
```

### 7.2 async let - Chạy song song

Khi có nhiều tác vụ **độc lập** với nhau, dùng `async let` để chạy song song thay vì tuần tự.

```swift
func fetchProfile() async throws -> Profile { ... }
func fetchSettings() async throws -> Settings { ... }

func loadDashboard() async throws {
    async let profile = fetchProfile()
    async let settings = fetchSettings()
    
    // Chờ cả hai hoàn thành
    let (p, s) = try await (profile, settings)
    print(p, s)
}
```

### 7.3 Task

`Task` cho phép chạy code `async` từ ngữ cảnh đồng bộ (ví dụ: action button trong SwiftUI).

```swift
Button("Tải dữ liệu") {
    Task {
        await viewModel.loadData()
    }
}
```

**Quan trọng:** `Task` được huỷ tự động nếu không còn cần thiết, đặc biệt hiệu quả khi dùng với `.task` modifier trong SwiftUI (sẽ nói ở phần sau).

### 7.4 MainActor

UI **chỉ được cập nhật trên Main Thread**. `@MainActor` đảm bảo code chạy trên main thread ở cấp độ compiler.

```swift
@MainActor
class HomeViewModel: ObservableObject {
    @Published var items: [Item] = []
    @Published var isLoading = false
    
    func load() async {
        isLoading = true
        defer { isLoading = false }
        // Mọi thay đổi @Published ở đây đều an toàn cho UI
        items = try? await api.fetchItems() ?? []
    }
}
```

**Lời khuyên:**

- Ưu tiên `async/await` thay vì completion handler khi có thể
- Chỉ chạy song song những thứ **thực sự độc lập**
- Luôn cập nhật UI trên `@MainActor`
- Hiểu sự khác biệt giữa "tạm dừng" (suspend) và "block thread". `await` **không block** thread hiện tại

---

## 8. Xcode, Project, Target, Scheme và Build Settings

Hiểu cấu trúc project giúp bạn điều hướng, debug và build đúng cách.

### 8.1 Các khái niệm cốt lõi

| Thành phần | Giải thích |
|---|---|
| **Project** | Toàn bộ cấu trúc, chứa targets, settings, file references. |
| **Target** | Đại diện cho một sản phẩm build (App, Widget, Unit Test, UI Test). Mỗi target có build settings riêng. |
| **Scheme** | Định nghĩa cách chạy/build/test/profile/archive. Thường có Debug/Release. |
| **Build Configuration** | `Debug` (phát triển, có debug symbol, nhanh build) vs `Release` (tối ưu, cho TestFlight/App Store). |
| **Bundle Identifier** | Định danh duy nhất dạng reverse-DNS: `com.tencongty.tenapp` |
| **Info.plist** | File metadata: quyền truy cập (Camera, Location), URL scheme, display name,... |
| **Assets.xcassets** | Quản lý App Icon, màu sắc, hình ảnh, hỗ trợ dark mode. |

### 8.2 Thư mục quan trọng trong project

```
MyApp/
├── MyAppApp.swift      // Entry point (@main)
├── ContentView.swift   // Root View
├── Models/             // Data models
├── Views/              // UI components/screens
├── ViewModels/         // Business logic / state
├── Services/           // Networking, storage,...
├── Extensions/         // Swift extensions
└── Assets.xcassets     // Resources
```

> Cấu trúc trên chỉ mang tính tham khảo. Quan trọng nhất là **nhất quán** trong toàn bộ project.

### 8.3 Các thao tác hữu ích trong Xcode

| Phím tắt | Chức năng |
|---|---|
| `⌘+R` | Build và Run |
| `⌘+.` | Dừng app đang chạy |
| `⌘+B` | Chỉ Build |
| `⌘+U` | Chạy Unit Test |
| `⌘+Shift+O` | Open Quickly (tìm file/class nhanh) |
| `⌘+Shift+F` | Tìm toàn bộ project |
| `⌘+/` | Comment/Uncomment |
| `⌥+Click` | Quick Help / Documentation |

---

## 9. SwiftUI cơ bản

SwiftUI dùng mô hình **declarative UI**: bạn mô tả *UI trông như thế nào* với trạng thái hiện tại, còn framework tự cập nhật khi trạng thái thay đổi.

### 9.1 View, Body và Modifier

Mọi UI đều là `View`. `body` trả về mô tả UI, và **modifier** trả về một `View` mới (không sửa view gốc).

```swift
struct GreetingView: View {
    let name: String
    
    var body: some View {
        Text("Xin chào, \(name)!")
            .font(.title)
            .fontWeight(.bold)
            .foregroundColor(.blue)
            .padding()
            .background(Color.yellow.opacity(0.2))
            .cornerRadius(12)
    }
}
```

**Lưu ý về thứ tự modifier:** Thứ tự rất quan trọng. `.padding().background()` sẽ khác với `.background().padding()`.

### 9.2 Layout cơ bản: VStack, HStack, ZStack

| Stack | Hướng | Ứng dụng |
|---|---|---|
| `VStack` | Dọc (vertical) | Form, danh sách dọc |
| `HStack` | Ngang (horizontal) | Icon + text, hàng hành động |
| `ZStack` | Chồng lên nhau (z-axis) | Overlay, badge, background |

```swift
struct CardView: View {
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 16)
                .fill(.blue.gradient)
                .frame(height: 200)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Tiêu đề")
                    .font(.headline)
                Text("Mô tả ngắn")
                    .font(.subheadline)
            }
            .foregroundStyle(.white)
            .padding()
        }
        .padding()
    }
}
```

### 9.3 State Management

| Property Wrapper | Chủ sở hữu | Khi dùng |
|---|---|---|
| `@State` | View hiện tại | Dữ liệu nội bộ, tạm thời của view (toggle, text field, sheet) |
| `@Binding` | Truyền từ cha | Cho view con đọc/ghi dữ liệu của view cha |
| `@StateObject` | View hiện tại | Tạo và giữ `ObservableObject` suốt vòng đời view |
| `@ObservedObject` | View nhận từ bên ngoài | Nhận object được tạo ở nơi khác |
| `@EnvironmentObject` | Inject từ ancestor | Chia sẻ object xuyên suốt cây view |
| `@Environment` | Hệ thống/App | Truy cập giá trị môi trường (`\.dismiss`, `\.colorScheme`) |

```swift
struct CounterView: View {
    @State private var count = 0
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Số lần: \(count)")
                .font(.largeTitle)
            
            Button("Tăng") {
                count += 1
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
```

**Quy tắc quan trọng:** Luôn dùng `private` với `@State` trừ khi có lý do đặc biệt.

### 9.4 List, ForEach, LazyVStack

- `List` tối ưu sẵn cho danh sách, hỗ trợ edit, delete, section
- `ForEach` dùng để lặp dữ liệu với `id` duy nhất
- `LazyVStack/LazyHStack` chỉ render item khi hiển thị (hiệu quả hơn với danh sách dài)

```swift
struct Item: Identifiable {
    let id = UUID()
    let name: String
}

struct ItemListView: View {
    let items: [Item] = [
        Item(name: "Mục 1"),
        Item(name: "Mục 2"),
        Item(name: "Mục 3")
    ]
    
    var body: some View {
        List(items) { item in
            Text(item.name)
        }
        .navigationTitle("Danh sách")
    }
}
```

### 9.5 .task và vòng đời View

`.task` là cách an toàn và hiện đại để chạy async code khi view xuất hiện, và **tự động huỷ** khi view bị ẩn/biến mất.

```swift
struct DataView: View {
    @State private var data: [String] = []
    @State private var isLoading = false
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView("Đang tải...")
            } else {
                List(data, id: \.self) { Text($0) }
            }
        }
        .task {
            await loadData()
        }
    }
    
    func loadData() async {
        isLoading = true
        // Giả lập
        try? await Task.sleep(for: .seconds(1))
        data = ["A", "B", "C"]
        isLoading = false
    }
}
```

### 9.6 Preview

`#Preview` giúp xem nhanh UI mà không cần build chạy toàn bộ app.

```swift
#Preview {
    GreetingView(name: "Học viên iOS")
}
```

Có thể truyền mock data, environment để test nhiều trạng thái khác nhau.

---

## 10. UIKit Tổng quan

Mặc dù SwiftUI là hiện tại, hiểu UIKit vẫn rất quan trọng vì nhiều project legacy, third-party component, và một số API nâng cao vẫn hoạt động tốt trên UIKit.

### 10.1 UIViewController và UIView

| Thành phần | Vai trò |
|---|---|
| `UIView` | Nền tảng cho mọi UI element (button, label, view tùy chỉnh) |
| `UIViewController` | Quản lý view, xử lý sự kiện, điều hướng giữa màn hình |
| `UIViewControllerLifeCycle` | `viewDidLoad`, `viewWillAppear`, `viewDidAppear`, `viewWillDisappear`, `viewDidDisappear` |

```swift
import UIKit

class DetailViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Chi tiết"
        setupUI()
    }
    
    private func setupUI() {
        let label = UILabel()
        label.text = "Nội dung chi tiết"
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}
```

### 10.2 UITableView và UICollectionView

Đây là 2 component quan trọng nhất để hiển thị danh sách/lưới dữ liệu lớn.

- `UITableView`: Danh sách dọc (phổ biến nhất)
- `UICollectionView`: Lưới, layout tùy biến cao

Cần implement ít nhất: `numberOfSections`, `numberOfRowsInSection`, `cellForRowAt`.

### 10.3 Kết hợp UIKit với SwiftUI

Dùng `UIViewControllerRepresentable` để nhúng UIKit vào SwiftUI, hoặc `UIHostingController` để nhúng SwiftUI vào UIKit.

```swift
import SwiftUI
import UIKit

struct UIKitViewRepresentable: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> DetailViewController {
        return DetailViewController()
    }
    
    func updateUIViewController(_ uiViewController: DetailViewController, context: Context) {
        // Cập nhật nếu cần
    }
}
```

---

## 11. Layout, Auto Layout và Responsive Design

### 11.1 Auto Layout nguyên tắc

Auto Layout dùng **constraints** để xác định vị trí và kích thước view dựa trên quan hệ với view khác.

Các khái niệm:

- **Leading/Trailing** thay vì Left/Right (hỗ trợ RTL tốt hơn)
- **Safe Area**: vùng an toàn không bị che bởi notch, status bar, home indicator
- **Intrinsic Content Size**: kích thước tự nhiên của view (Label, Button)
- **Priority**: ưu tiên khi constraints xung đột

### 11.2 Responsive với Size Classes

iOS phân biệt `horizontalSizeClass` và `verticalSizeClass`: `.compact` và `.regular`.

- **iPhone dọc**: thường compact x compact
- **iPhone ngang**: compact x regular
- **iPad**: thường regular x regular

```swift
struct AdaptiveView: View {
    @Environment(\.horizontalSizeClass) var sizeClass
    
    var body: some View {
        if sizeClass == .compact {
            VStack { /* Layout cho điện thoại */ }
        } else {
            HStack { /* Layout cho tablet */ }
        }
    }
}
```

### 11.3 Dynamic Type

Người dùng có thể thay đổi cỡ chữ hệ thống. App cần hỗ trợ để tăng khả năng truy cập.

```swift
Text("Tiêu đề")
    .font(.title) // Tự động scale theo Dynamic Type

// Với custom font
Text("Nội dung")
    .font(.custom("Helvetica", size: 16, relativeTo: .body))
```

**Quy tắc:** Tránh dùng `frame(width:height:)` cứng cho text. Ưu tiên padding và để text tự co giãn.

### 11.4 Dark Mode

Dùng **semantic color** thay vì hardcode màu.

```swift
Text("Nội dung")
    .foregroundStyle(.primary) // Tự động theo light/dark

// Hoặc Asset Catalog: Colors set với Appearances = Any, Light, Dark
Color("BrandColor")
```

---

## 12. Navigation, Sheet, Alert và Presentation

### 12.1 NavigationStack (iOS 16+)

`NavigationStack` thay thế `NavigationView` cũ, hỗ trợ navigation theo path mạnh mẽ hơn.

```swift
struct HomeView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink("Đi tới chi tiết") {
                    DetailView()
                }
            }
            .navigationTitle("Trang chủ")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Thêm") { }
                }
            }
        }
    }
}
```

### 12.2 Sheet, FullScreenCover

```swift
struct ContentView: View {
    @State private var showSheet = false
    
    var body: some View {
        Button("Mở Sheet") {
            showSheet = true
        }
        .sheet(isPresented: $showSheet) {
            SheetView()
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }
}
```

### 12.3 Alert và ConfirmationDialog

```swift
@State private var showAlert = false

Button("Xóa") { showAlert = true }
    .alert("Xác nhận", isPresented: $showAlert) {
        Button("Hủy", role: .cancel) { }
        Button("Xóa", role: .destructive) { /* action */ }
    } message: {
        Text("Hành động này không thể hoàn tác")
    }
```

### 12.4 Dismiss

```swift
struct SheetView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Text("Nội dung")
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        Button("Đóng") { dismiss() }
                    }
                }
        }
    }
}
```

---

## 13. Networking với URLSession

`URLSession` là framework chuẩn của Apple để thực hiện HTTP request.

### 13.1 Các thành phần cơ bản

| Thành phần | Mô tả |
|---|---|
| `URL` | Địa chỉ endpoint |
| `URLRequest` | Cấu hình request (method, header, body) |
| `URLSession` | Thực thi request, quản lý connection |
| `URLSessionDataTask` | Task cho data request (GET/POST/...) |
| `URLResponse` / `HTTPURLResponse` | Phản hồi từ server |

### 13.2 GET Request cơ bản

```swift
func fetchData() async throws -> [String] {
    guard let url = URL(string: "https://jsonplaceholder.typicode.com/posts") else {
        throw URLError(.badURL)
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let httpResponse = response as? HTTPURLResponse else {
        throw URLError(.badServerResponse)
    }
    
    guard (200...299).contains(httpResponse.statusCode) else {
        throw URLError(.badServerResponse)
    }
    
    // Decode sau (xem phần 14)
    return []
}
```

### 13.3 POST Request với JSON Body

```swift
struct PostRequest: Codable {
    let title: String
    let body: String
    let userId: Int
}

func createPost() async throws {
    guard let url = URL(string: "https://jsonplaceholder.typicode.com/posts") else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let post = PostRequest(title: "Hello", body: "World", userId: 1)
    request.httpBody = try JSONEncoder().encode(post)
    
    let (_, response) = try await URLSession.shared.data(for: request)
    print((response as? HTTPURLResponse)?.statusCode ?? 0)
}
```

### 13.4 Cấu hình URLSession nâng cao

```swift
let configuration = URLSessionConfiguration.default
configuration.timeoutIntervalForRequest = 30  // Timeout cho request
configuration.timeoutIntervalForResource = 60 // Timeout tổng
configuration.allowsCellularAccess = true
configuration.waitsForConnectivity = true      // Chờ mạng thay vì fail ngay

let session = URLSession(configuration: configuration)
```

**Lời khuyên:** Dùng `URLSession.shared` cho hầu hết trường hợp đơn giản. Tạo custom session khi cần cấu hình đặc biệt.

---

## 14. JSON, Codable và Mapping dữ liệu

### 14.1 Codable protocol

`Codable` là hợp nhất của `Encodable` và `Decodable`, giúp chuyển đổi giữa JSON và Swift type một cách tự động.

```swift
struct User: Codable, Identifiable {
    let id: Int
    let name: String
    let email: String
    let phone: String?
}
```

### 14.2 Decoding với JSONDecoder

```swift
func decodeUsers(from data: Data) throws -> [User] {
    let decoder = JSONDecoder()
    // Nếu API dùng snake_case: user_name
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    // Nếu dùng date format riêng
    // decoder.dateDecodingStrategy = .iso8601
    return try decoder.decode([User].self, from: data)
}
```

### 14.3 Encoding với JSONEncoder

```swift
func encodeUser(_ user: User) throws -> Data {
    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    encoder.outputFormatting = .prettyPrinted // Chỉ dùng cho debug
    return try encoder.encode(user)
}
```

### 14.4 Custom CodingKeys

Khi tên field trong JSON khác hoàn toàn với Swift, dùng `CodingKeys`.

```swift
struct Product: Codable {
    let productId: Int
    let productName: String
    let priceInVnd: Double
    
    enum CodingKeys: String, CodingKey {
        case productId = "product_id"
        case productName = "product_name"
        case priceInVnd = "price_in_vnd"
    }
}
```

### 14.5 Xử lý Date

```swift
let decoder = JSONDecoder()
decoder.dateDecodingStrategy = .custom { decoder in
    let container = try decoder.singleValueContainer()
    let string = try container.decode(String.self)
    
    // Thử ISO8601
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = formatter.date(from: string) { return date }
    
    formatter.formatOptions = [.withInternetDateTime]
    if let date = formatter.date(from: string) { return date }
    
    throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date")
}
```

**Lời khuyên:**

- Luôn dùng `Codable` thay vì parse JSON thủ công bằng Dictionary
- Ưu tiên `let` cho properties không thay đổi
- Dùng `Optional` cho field có thể `null` trong JSON
- Tránh force unwrap khi decode

---

## 15. Lưu trữ dữ liệu cục bộ

Tùy vào mục đích sử dụng mà chọn công cụ lưu trữ phù hợp.

| Công cụ | Phù hợp cho | Ghi chú |
|---|---|---|
| **UserDefaults** | Cài đặt đơn giản, preference, flag nhỏ | Không lưu dữ liệu lớn, không mã hóa, đồng bộ không đảm bảo |
| **FileManager (Documents/Cache)** | JSON, ảnh, file tùy chỉnh | Linh hoạt, cần tự quản lý |
| **Keychain** | Thông tin nhạy cảm (token, password) | Được hệ thống mã hóa, an toàn nhất cho dữ liệu bảo mật |
| **Core Data** | Dữ liệu quan hệ phức tạp, query mạnh, offline lớn | Boilerplate nhiều, học đường cong cao |
| **SwiftData** | Dữ liệu đơn giản đến trung bình, iOS 17+ | Hiện đại, gọn hơn Core Data, API rất Swift-native |

### 15.1 UserDefaults

```swift
// Lưu
UserDefaults.standard.set(true, forKey: "hasSeenOnboarding")
UserDefaults.standard.set("dark", forKey: "theme")

// Đọc
let hasSeen = UserDefaults.standard.bool(forKey: "hasSeenOnboarding")
let theme = UserDefaults.standard.string(forKey: "theme")

// Xóa
UserDefaults.standard.removeObject(forKey: "theme")
```

### 15.2 Lưu/đọc file JSON

```swift
struct Settings: Codable {
    var notificationsEnabled: Bool
    var language: String
}

class StorageManager {
    static let shared = StorageManager()
    private let fileName = "settings.json"
    
    private var fileURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent(fileName)
    }
    
    func save(_ settings: Settings) throws {
        let data = try JSONEncoder().encode(settings)
        try data.write(to: fileURL)
    }
    
    func load() throws -> Settings {
        let data = try Data(contentsOf: fileURL)
        return try JSONDecoder().decode(Settings.self, from: data)
    }
}
```

### 15.3 Keychain cơ bản (ý tưởng)

Keychain phức tạp hơn với API C, nhưng nguyên tắc rất quan trọng: **không bao giờ lưu token vào UserDefaults**.

Nếu cần dùng nhanh, có thể tham khảo thư viện như `KeychainSwift`, nhưng vẫn nên hiểu khái niệm để bảo mật đúng đắn.

---

## 16. App Lifecycle, Scene và State Preservation

### 16.1 @main và App Protocol

Từ iOS 14+, ứng dụng SwiftUI dùng `@main` với protocol `App`.

```swift
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### 16.2 ScenePhase

`@Environment(\.scenePhase)` theo dõi trạng thái scene:

| Phase | Ý nghĩa |
|---|---|
| `.active` | App đang hiển thị và tương tác được |
| `.inactive` | App đang chuyển trạng thái (ví dụ: mở Control Center, nhận cuộc gọi) |
| `.background` | App không hiển thị, chạy ngầm. Có thể bị hệ thống suspend bất cứ lúc nào |

```swift
@main
struct MyApp: App {
    @Environment(\.scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { oldPhase, newPhase in
            switch newPhase {
            case .active:
                print("App đã active")
            case .inactive:
                print("App đang inactive")
            case .background:
                print("App vào background - lưu dữ liệu quan trọng")
            @unknown default:
                break
            }
        }
    }
}
```

### 16.3 Quy tắc khi vào Background

- **Lưu state quan trọng** ngay lập tức (draft, form chưa lưu)
- **Dừng animation không cần thiết**
- **Không giữ connection dài hạn** nếu không cần thiết
- **Hoàn tất thao tác ghi ngắn** trước khi hệ thống suspend
- **Tránh** chạy task nặng, không đảm bảo hoàn thành

---

## 17. Debugging, Logging và Instruments

### 17.1 Debugging cơ bản

| Công cụ | Sử dụng |
|---|---|
| **Breakpoint** | Dừng tại dòng code để kiểm tra biến, stack trace |
| **Condition Breakpoint** | Chỉ dừng khi điều kiện đúng (VD: `id == 123`) |
| **Exception Breakpoint** | Dừng ngay khi có exception/crash |
| **Print/Debug** | Nhanh cho kiểm tra đơn giản |
| **LLDB Console** | `po`, `p`, `v`, `bt` để inspect runtime |

```swift
// Trong LLDB
po variableName  // Print object description
p count           // Print raw value
bt                // Backtrace
```

### 17.2 Logging với OSLog

`OSLog` hiệu quả hơn `print` rất nhiều: có mức log, filter được trong Console app, không ảnh hưởng hiệu năng nhiều.

```swift
import OSLog

let logger = Logger(subsystem: "com.example.myapp", category: "network")

logger.debug("Bắt đầu request")
logger.info("Request thành công")
logger.warning("Timeout sắp xảy ra")
logger.error("Request thất bại: \(error.localizedDescription)")
```

**Quy tắc:** Không log dữ liệu nhạy cảm (password, token đầy đủ, thông tin cá nhân).

### 17.3 Instruments

Truy cập: `Product > Profile` (`⌘+I`)

| Template | Mục đích |
|---|---|
| **Time Profiler** | Tìm code tốn CPU nhất (hotspot) |
| **Allocations** | Theo dõi cấp phát bộ nhớ |
| **Leaks** | Phát hiện memory leak/retain cycle |
| **Network** | Theo dõi request/response, latency |
| **Core Animation** | Kiểm tra FPS, layout, rendering |
| **Energy Log** | Đánh giá tiêu thụ pin |

**Nguyên tắc tối ưu:** **Đo trước, tối ưu sau**. Không tối ưu theo cảm tính.

---

## 18. Testing cơ bản với XCTest

Testing giúp phát hiện lỗi sớm, tự tin refactor và đảm bảo logic quan trọng hoạt động đúng.

### 18.1 Các loại test

| Loại | Phạm vi | Mục đích |
|---|---|---|
| **Unit Test** | Logic thuần (function, ViewModel, validation) | Nhanh, nhiều nhất, quan trọng nhất |
| **Integration Test** | Tương tác giữa nhiều component | Kiểm tra luồng hoàn chỉnh |
| **UI Test (XCUITest)** | Toàn bộ app từ góc người dùng | Kiểm tra flow quan trọng, chạy chậm hơn |

### 18.2 Viết Unit Test cơ bản

```swift
import XCTest
@testable import MyApp

final class ValidationTests: XCTestCase {
    func testEmailIsValid() {
        XCTAssertTrue("test@example.com".isValidEmail())
    }
    
    func testEmailIsInvalidWithoutAtSymbol() {
        XCTAssertFalse("testexample.com".isValidEmail())
    }
    
    func testEmptyEmailIsInvalid() {
        XCTAssertFalse("".isValidEmail())
    }
}
```

### 18.3 Test async

```swift
final class APIServiceTests: XCTestCase {
    func testFetchUsersReturnsData() async throws {
        let service = MockAPIService()
        let users = try await service.fetchUsers()
        XCTAssertFalse(users.isEmpty)
        XCTAssertEqual(users.count, 3)
    }
}
```

### 18.4 Setup và Teardown

```swift
final class ViewModelTests: XCTestCase {
    var sut: HomeViewModel!
    
    override func setUp() {
        super.setUp()
        sut = HomeViewModel()
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    func testInitialState() {
        XCTAssertTrue(sut.items.isEmpty)
        XCTAssertFalse(sut.isLoading)
    }
}
```

**Lời khuyên:**

- Ưu tiên **unit test** cho business logic/validation
- Dùng **mock/stub** thay vì gọi API thực trong unit test
- Đặt tên test rõ ràng: `test<Condition>_<ExpectedResult>`
- Giữ test **độc lập**, không phụ thuộc thứ tự chạy
- Chạy test thường xuyên (`⌘+U`)

---

## 19. Build, Run, Signing và Distribution căn bản

### 19.1 Chạy trên Simulator vs Thiết bị thật

| Tiêu chí | Simulator | Thiết bị thật |
|---|---|---|
| **Tốc độ** | Nhanh để test UI/layout | Chính xác nhất về hiệu năng |
| **Camera/Push/Location một số case** | Hạn chế | Hoàn chỉnh |
| **Network** | Thường dùng mạng Mac | Dùng mạng thiết bị |
| **Debug** | Rất tiện | Cần kết nối/cấp phép |

### 19.2 Code Signing cơ bản

Để chạy trên thiết bị thật, Xcode cần cấp phép:

1. **Apple ID**: Đăng nhập trong `Xcode > Settings > Accounts`
2. **Team**: Chọn team trong `Target > Signing & Capabilities`
3. **Automatically manage signing**: Phù hợp hầu hết người mới
4. **Bundle Identifier**: Phải unique

### 19.3 Build Configuration

- **Debug**: Dùng khi phát triển. Chứa debug info, không tối ưu.
- **Release**: Dùng khi archive. Tối ưu compiler, strip debug symbol.

### 19.4 Archive và phân phối

| Phương thức | Khi dùng |
|---|---|
| **Run on Device** | Test nhanh cá nhân |
| **Archive (Product > Archive)** | Tạo bản build để phân phối |
| **TestFlight** | Beta test với người khác (cần App Store Connect) |
| **Ad Hoc** | Phân phối giới hạn thiết bị đăng ký |
| **App Store** | Phát hành công khai |

**Lưu ý quan trọng:** Luôn tăng **Build Number** trước mỗi lần archive gửi đi.

---

## 20. Thực hành tổng hợp: Xây dựng màn hình danh sách

Mục tiêu: Áp dụng hầu hết kiến thức cơ bản vào một bài thực hành hoàn chỉnh.

### 20.1 Yêu cầu

Xây dựng màn hình hiển thị danh sách sản phẩm đơn giản với:

- Hiển thị danh sách bằng `List`
- Loading state
- Error state
- Navigation tới màn hình chi tiết
- Tải dữ liệu bất đồng bộ

### 20.2 Model

```swift
struct Product: Codable, Identifiable, Hashable {
    let id: Int
    let title: String
    let price: Double
    let description: String
    let category: String
    let image: String
}
```

### 20.3 Service

```swift
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case server(status: Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL không hợp lệ"
        case .invalidResponse: return "Phản hồi không hợp lệ"
        case .server(let status): return "Lỗi máy chủ (\(status))"
        }
    }
}

class ProductService {
    static let shared = ProductService()
    private init() {}
    
    func fetchProducts() async throws -> [Product] {
        guard let url = URL(string: "https://fakestoreapi.com/products") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(http.statusCode) else {
            throw APIError.server(status: http.statusCode)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode([Product].self, from: data)
    }
}
```

### 20.4 ViewModel

```swift
import Foundation

@MainActor
class ProductListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            products = try await ProductService.shared.fetchProducts()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

### 20.5 View

```swift
import SwiftUI

struct ProductListView: View {
    @StateObject private var viewModel = ProductListViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Đang tải sản phẩm...")
                } else if let error = viewModel.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundStyle(.orange)
                        Text(error)
                            .multilineTextAlignment(.center)
                        Button("Thử lại") {
                            Task { await viewModel.load() }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    List(viewModel.products) { product in
                        NavigationLink(value: product) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(product.title)
                                    .font(.headline)
                                    .lineLimit(2)
                                Text("\(product.price, format: .currency(code: "USD"))")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Sản phẩm")
            .navigationDestination(for: Product.self) { product in
                ProductDetailView(product: product)
            }
            .task {
                await viewModel.load()
            }
            .refreshable {
                await viewModel.load()
            }
        }
    }
}

struct ProductDetailView: View {
    let product: Product
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(product.title)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text(product.category.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.blue.opacity(0.1))
                    .cornerRadius(8)
                
                Text(product.description)
                    .font(.body)
                
                Spacer()
            }
            .padding()
        }
        .navigationTitle("Chi tiết")
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

### 20.6 Kiểm tra sau khi hoàn thành

- [ ] Danh sách hiển thị đúng khi có mạng
- [ ] Hiển thị loading khi đang tải
- [ ] Hiển thị lỗi + nút "Thử lại" khi mất mạng
- [ ] Pull-to-refresh hoạt động
- [ ] Điều hướng sang màn hình chi tiết thành công
- [ ] Không crash khi rotate màn hình
- [ ] Hoạt động tốt trên cả iPhone và iPad

---

## 21. Anti-patterns thường gặp và cách tránh

| Anti-pattern | Tại sao sai | Cách thay thế |
|---|---|---|
| **Force unwrap `!` tùy tiện** | Gây crash không kiểm soát | `guard let`, `if let`, `??` |
| **Gọi API trong `body` của SwiftUI View** | Body có thể được gọi nhiều lần, gây gọi API lặp | Dùng `.task`, ViewModel method |
| **Cập nhật UI trên background thread** | Gây crash hoặc UI không cập nhật | Dùng `@MainActor`, `DispatchQueue.main.async` chỉ khi cần thiết |
| **Tạo `@StateObject` mới trong body** | Bị tạo lại mỗi lần view re-render | Tạo một lần ở nơi sở hữu view |
| **Retain cycle với closure** | Memory leak khó phát hiện | Dùng `[weak self]` với `guard let self` |
| **Lưu token trong UserDefaults** | Không an toàn | Dùng Keychain |
| **Dùng `print` thay vì Logger** | Khó filter, ảnh hưởng performance | Dùng `OSLog/Logger` |
| **Viết toàn bộ logic trong View** | Khó test, khó tái sử dụng, code rối | Tách ViewModel/Service theo trách nhiệm |
| **Force try `try!` cho dữ liệu bên ngoài** | Rất dễ crash | Luôn xử lý lỗi bằng `do-catch` hoặc `try?` cẩn thận |
| **Bỏ qua accessibility** | Loại trừ người dùng | Hỗ trợ Dynamic Type, VoiceOver, semantic color |

---

## 22. Lộ trình học tiếp theo

Sau khi nắm vững tài liệu này, bạn nên học theo thứ tự sau để tiến xa hơn:

| Giai đoạn | Nội dung | Ghi chú |
|---|---|---|
| **Giai đoạn 1** | Ôn lại toàn bộ bài thực hành (phần 20) | Viết lại từ đầu không nhìn code, đảm bảo hiểu từng dòng |
| **Giai đoạn 2** | Chuyển sang `ios-advanced.md` | Học kiến trúc, Dependency Injection, Observation, Offline-first |
| **Giai đoạn 3** | Thực hành project thực tế nhỏ | VD: To-Do app, Weather app, Notes app (hoàn chỉnh CRUD) |
| **Giai đoạn 4** | Đọc Human Interface Guidelines | Học cách thiết kế UI đúng chuẩn Apple |
| **Giai đoạn 5** | Làm quen Instruments & Performance | Học cách đo và tối ưu thực tế |
| **Giai đoạn 6** | Viết test cho project cá nhân | Bắt đầu từ unit test cho ViewModel/Validation |

**Lời khuyên quan trọng:** **Code nhiều hơn đọc**. Mỗi khái niệm bạn học, hãy mở Xcode và thử ngay thay vì chỉ đọc lý thuyết.

---

## 23. Tài liệu tham khảo

- [Swift Documentation](https://docs.swift.org/swift-book/) - Ngôn ngữ Swift chính thức, đầy đủ và chính xác nhất
- [Apple Developer Documentation](https://developer.apple.com/documentation/) - Tất cả framework của Apple
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/) - Tài liệu SwiftUI chính thức
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - Quy chuẩn thiết kế iOS
- [WWDC Videos](https://developer.apple.com/videos/) - Các bài giảng mới nhất từ Apple
- [Hacking with Swift](https://www.hackingwithswift.com/) - Rất phù hợp cho người mới, bài tập thực tế
- [Swift.org](https://www.swift.org/) - Thông tin cộng đồng và cập nhật Swift

---

*Hãy hoàn thành bài thực hành phần 20 một cách độc lập trước khi chuyển sang tài liệu nâng cao. Hiểu sâu nền tảng luôn quan trọng hơn học quá nhiều framework cùng lúc.*