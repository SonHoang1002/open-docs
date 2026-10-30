# iOS Nâng Cao — Kiến trúc, Concurrency, SwiftUI, Performance và Thực tiễn Production

> Dành cho người đã nắm vững nền tảng iOS. Tài liệu tập trung vào kiến trúc ứng dụng có khả năng mở rộng, quản lý state hiệu quả, xử lý bất đồng bộ nâng cao, tối ưu hiệu năng, bảo mật và các kỹ thuật cần thiết cho ứng dụng production.
> 
> Mục tiêu: Xây dựng ứng dụng iOS sạch, dễ test, dễ bảo trì và sẵn sàng cho môi trường thực tế.

**Môi trường tham khảo:** Swift 6 (Swift 5 language mode), iOS 17.0+, Xcode 16+

---

## Mục lục

- [1. Tư duy thiết kế kiến trúc](#1-tư-duy-thiết-kế-kiến-trúc)
- [2. Kiến trúc ứng dụng phổ biến](#2-kiến-trúc-ứng-dụng-phổ-biến)
- [3. Dependency Injection (DI)](#3-dependency-injection-di)
- [4. Swift Concurrency nâng cao](#4-swift-concurrency-nâng-cao)
- [5. Swift 6 và Data Race Safety](#5-swift-6-và-data-race-safety)
- [6. SwiftUI nâng cao](#6-swiftui-nâng-cao)
- [7. Observation Framework (iOS 17+)](#7-observation-framework-ios-17)
- [8. Navigation nâng cao](#8-navigation-nâng-cao)
- [9. Networking nâng cao](#9-networking-nâng-cao)
- [10. Persistence nâng cao](#10-persistence-nâng-cao)
- [11. Combine Framework cơ bản](#11-combine-framework-cơ-bản)
- [12. Performance Optimization](#12-performance-optimization)
- [13. Memory Management nâng cao](#13-memory-management-nâng-cao)
- [14. Testing nâng cao](#14-testing-nâng-cao)
- [15. Modularization với Swift Package Manager](#15-modularization-với-swift-package-manager)
- [16. Accessibility nâng cao](#16-accessibility-nâng-cao)
- [17. Localization nâng cao](#17-localization-nâng-cao)
- [18. App Extensions và Widgets](#18-app-extensions-và-widgets)
- [19. Security nâng cao](#19-security-nâng-cao)
- [20. Thực hành tổng hợp: Xây dựng kiến trúc sạch](#20-thực-hành-tổng-hợp-xây-dựng-kiến-trúc-sạch)
- [21. Anti-patterns nâng cao](#21-anti-patterns-nâng-cao)
- [22. Lộ trình học tiếp theo](#22-lộ-trình-học-tiếp-theo)
- [23. Tài liệu tham khảo](#23-tài-liệu-tham-khảo)

---

## 1. Tư duy thiết kế kiến trúc

Trước khi chọn kiến trúc cụ thể, cần hiểu các nguyên tắc cốt lõi:

| Nguyên tắc | Giải thích | Ý nghĩa thực tiễn |
|---|---|---|
| **Separation of Concerns (SoC)** | Mỗi thành phần chỉ làm một việc | Dễ test, dễ thay thế, dễ bảo trì |
| **Single Responsibility Principle (SRP)** | Mỗi class/struct chỉ có một lý do để thay đổi | Tránh God Object, code rõ ràng hơn |
| **Dependency Inversion Principle (DIP)** | Phụ thuộc vào abstraction, không phụ thuộc vào implementation | Dễ mock trong test, thay đổi implementation không ảnh hưởng caller |
| **Open/Closed Principle (OCP)** | Mở cho mở rộng, đóng cho sửa đổi | Thêm tính năng mới mà không sửa code cũ |
| **Interface Segregation Principle (ISP)** | Nhiều interface nhỏ tốt hơn một interface lớn | Client không phụ thuộc vào method không dùng |
| **Testability** | Code dễ viết unit test | Phát hiện bug sớm, tự tin refactor |

**Mục tiêu kiến trúc:**
- **UI mỏng**: View chỉ hiển thị, không chứa business logic
- **Business logic độc lập**: Có thể test mà không cần UI hay network
- **Dễ thay thế**: Có thể đổi API, database mà không ảnh hưởng toàn bộ app
- **Scalable**: Dễ mở rộng khi team lớn dần

---

## 2. Kiến trúc ứng dụng phổ biến

Không có "kiến trúc hoàn hảo". Lựa chọn dựa trên quy mô dự án, kinh nghiệm team và thời gian.

### 2.1 MVC (Model-View-Controller) - Truyền thống

MVC là kiến trúc cổ điển của Apple. Trong thực tế, thường dẫn đến **Massive View Controller**.

| Thành phần | Trách nhiệm |
|---|---|
| **Model** | Dữ liệu, business logic |
| **View** | UI, hiển thị |
| **Controller** | Điều phối giữa Model và View |

**Khi dùng:** Dự án nhỏ, prototype nhanh. **Tránh:** Dự án lớn, cần test nhiều.

### 2.2 MVVM (Model-View-ViewModel)

MVVM rất phổ biến với SwiftUI. ViewModel đóng vai trò bridge, View quan sát thay đổi từ ViewModel.

```swift
// Model
struct User: Codable, Identifiable {
    let id: UUID
    let name: String
    let email: String
}

// ViewModel
@MainActor
class UserListViewModel: ObservableObject {
    @Published private(set) var users: [User] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    
    private let service: UserServiceProtocol
    
    init(service: UserServiceProtocol) {
        self.service = service
    }
    
    func fetchUsers() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            users = try await service.fetchUsers()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// View
struct UserListView: View {
    @StateObject private var viewModel: UserListViewModel
    
    init(service: UserServiceProtocol) {
        _viewModel = StateObject(wrappedValue: UserListViewModel(service: service))
    }
    
    var body: some View {
        List(viewModel.users) { user in
            Text(user.name)
        }
        .task { await viewModel.fetchUsers() }
    }
}
```

**Ưu điểm:** Tách UI khỏi logic, dễ test ViewModel, hoạt động tốt với SwiftUI.  
**Nhược điểm:** ViewModel có thể phình nếu không quản lý tốt.

### 2.3 Clean Architecture

Clean Architecture chia app thành nhiều layer với quy tắc phụ thuộc một chiều: **outer layers phụ thuộc inner layers, inner layers không phụ thuộc outer layers**.

| Layer | Trách nhiệm | Ví dụ |
|---|---|---|
| **Domain (Core)** | Entities, Use Cases, Protocols. Hoàn toàn độc lập, không phụ thuộc framework nào | `User`, `FetchUsersUseCase`, `UserRepositoryProtocol` |
| **Data** | Implementation của Repository, API calls, local storage | `UserRepository`, `UserAPI`, `UserLocalDataSource` |
| **Presentation** | UI, ViewModel, Navigation | `UserListView`, `UserListViewModel` |
| **App/DI** | Composition Root, App entry point | `AppDelegate`, `DIContainer` |

```swift
// Domain - Entity
struct User: Equatable {
    let id: UUID
    let name: String
    let email: String
}

// Domain - Repository Protocol
protocol UserRepository {
    func getUsers() async throws -> [User]
}

// Domain - Use Case
protocol FetchUsersUseCase {
    func execute() async throws -> [User]
}

struct FetchUsersUseCaseImpl: FetchUsersUseCase {
    private let repository: UserRepository
    
    init(repository: UserRepository) {
        self.repository = repository
    }
    
    func execute() async throws -> [User] {
        return try await repository.getUsers()
    }
}

// Data - Repository Implementation
struct UserRepositoryImpl: UserRepository {
    private let remoteDataSource: UserRemoteDataSource
    private let localDataSource: UserLocalDataSource
    
    func getUsers() async throws -> [User] {
        // Có thể implement caching logic ở đây
        if let cached = try? await localDataSource.getUsers(), !cached.isEmpty {
            // Có thể return cached và refresh background
        }
        let remote = try await remoteDataSource.fetchUsers()
        try? await localDataSource.saveUsers(remote)
        return remote
    }
}
```

**Khi dùng:** Dự án lớn, dài hạn, nhiều module. **Chi phí:** Nhiều boilerplate ban đầu.

### 2.4 Feature-First vs Layer-First

| Cách tổ chức | Ưu điểm | Nhược điểm |
|---|---|---|
| **Layer-First** (`Views/`, `ViewModels/`, `Services/`) | Dễ bắt đầu, quen thuộc | Khó scale, phụ thuộc chéo dễ xảy ra, khó tách module |
| **Feature-First** (`Features/Auth/`, `Features/Home/`, `Features/Profile/`) | Tập trung theo tính năng, dễ tách module, team có thể làm song song | Cần discipline về shared code, dễ duplicate nếu không có Core module |

**Khuyến nghị:** Với dự án vừa và lớn, **Feature-First + Core/Shared** là lựa chọn cân bằng tốt nhất.

```
App/
├── Core/           # Shared: Models, Protocols, Extensions, Utilities
├── Features/       # Feature modules
│   ├── Auth/
│   ├── Home/
│   └── Profile/
└── App/            # Entry point, DI Container
```

---

## 3. Dependency Injection (DI)

DI giúp loại bỏ singleton toàn cục, làm code testable và dễ thay thế dependency.

### 3.1 Các cách thực hiện DI

| Phương pháp | Mô tả | Phù hợp |
|---|---|---|
| **Constructor Injection** | Truyền dependency qua initializer | Tốt nhất, rõ ràng, bắt buộc phải có dependency |
| **Property Injection** | Gán qua property sau khi tạo object | Khi dependency optional hoặc chỉ cần sau khi init |
| **Method Injection** | Truyền dependency vào method cụ thể | Khi chỉ cần dependency cho 1 method duy nhất |

### 3.2 DI Container đơn giản

```swift
@MainActor
final class DIContainer {
    // MARK: - Services
    lazy var networkClient: NetworkClient = URLSessionNetworkClient()
    lazy var userService: UserServiceProtocol = UserService(client: networkClient)
    lazy var storage: StorageProtocol = UserDefaultsStorage()
    
    // MARK: - Repositories
    lazy var userRepository: UserRepository = UserRepositoryImpl(
        remote: UserRemoteDataSource(client: networkClient),
        local: UserLocalDataSource(storage: storage)
    )
    
    // MARK: - Use Cases
    lazy var fetchUsersUseCase: FetchUsersUseCase = FetchUsersUseCaseImpl(
        repository: userRepository
    )
    
    // MARK: - ViewModels
    func makeUserListViewModel() -> UserListViewModel {
        UserListViewModel(fetchUsersUseCase: fetchUsersUseCase)
    }
}
```

### 3.3 Sử dụng với SwiftUI

```swift
@main
struct MyApp: App {
    @StateObject private var container = DIContainer()
    
    var body: some Scene {
        WindowGroup {
            UserListView(viewModel: container.makeUserListViewModel())
        }
    }
}
```

### 3.4 Factory Pattern

Khi cần tạo nhiều instance hoặc object có vòng đời phức tạp, dùng Factory.

```swift
protocol ViewModelFactory {
    func makeHomeViewModel() -> HomeViewModel
    func makeDetailViewModel(id: UUID) -> DetailViewModel
}

struct AppViewModelFactory: ViewModelFactory {
    let container: DIContainer
    
    func makeHomeViewModel() -> HomeViewModel {
        HomeViewModel(service: container.userService)
    }
    
    func makeDetailViewModel(id: UUID) -> DetailViewModel {
        DetailViewModel(id: id, service: container.userService)
    }
}
```

**Lời khuyên:**
- Tránh singleton `Service.shared` trừ khi thực sự global và không thể inject
- Ưu tiên Constructor Injection
- Composition Root chỉ nằm ở `App` layer, không rải rác
- Với SwiftUI Preview, luôn inject mock/stub

---

## 4. Swift Concurrency nâng cao

Sau khi nắm vững async/await, cần hiểu sâu hơn về actor, Task, structured concurrency.

### 4.1 Actor

`actor` là reference type đặc biệt, bảo vệ mutable state khỏi data race bằng **actor isolation**. Chỉ một task tại một thời điểm được truy cập mutable state của actor.

```swift
actor BankAccount {
    private var balance: Decimal = 0
    
    func deposit(_ amount: Decimal) {
        balance += amount
    }
    
    func withdraw(_ amount: Decimal) throws {
        guard balance >= amount else { throw BankError.insufficientFunds }
        balance -= amount
    }
    
    func getBalance() -> Decimal {
        return balance
    }
}

// Sử dụng
let account = BankAccount()
Task {
    await account.deposit(100)
    let balance = await account.getBalance()
    print(balance)
}
```

### 4.2 MainActor

`@MainActor` đảm bảo tất cả code chạy trên main thread. Rất quan trọng cho UI updates.

```swift
@MainActor
class ViewModel: ObservableObject {
    @Published var data: [Item] = []
    
    func load() async {
        // Tự động chạy trên main thread
        let items = try? await fetchItems()
        data = items ?? []
    }
    
    nonisolated func processInBackground() async -> String {
        // Chạy trên background, không truy cập MainActor state
        return "processed"
    }
}
```

### 4.3 Sendable Protocol

`Sendable` đánh dấu type an toàn để truyền qua actor boundary (giữa các isolation domain).

- **Struct/Class immutable**: Tự động conform nếu tất cả stored property là Sendable
- **Final class với immutable let**: Có thể Sendable
- **@Sendable closure**: Closure không capture mutable shared state

```swift
struct Message: Sendable {
    let id: UUID
    let content: String
}

// @unchecked Sendable - chỉ dùng khi biết chắc an toàn
final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [String: Data] = [:]
    
    func set(_ key: String, value: Data) {
        lock.lock()
        defer { lock.unlock() }
        storage[key] = value
    }
    
    func get(_ key: String) -> Data? {
        lock.lock()
        defer { lock.unlock() }
        return storage[key]
    }
}
```

**Lời khuyên:** Chỉ dùng `@unchecked Sendable` khi đã bảo vệ bằng lock/queue và thực sự hiểu rủi ro.

### 4.4 TaskGroup

`withThrowingTaskGroup` cho phép chạy nhiều task song song và xử lý kết quả.

```swift
func fetchAllUsers(ids: [UUID]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids {
            group.addTask {
                try await self.userService.fetchUser(id: id)
            }
        }
        
        var users: [User] = []
        for try await user in group {
            users.append(user)
        }
        return users
    }
}
```

**Lưu ý quan trọng:**
- Thứ tự kết quả không đảm bảo theo thứ tự thêm task
- Nếu một task throw, `group` sẽ throw và các task còn lại có thể bị cancel
- Dùng `withThrowingTaskGroup` khi có thể throw error

### 4.5 Task Cancellation

Task có thể bị hủy. Luôn kiểm tra cancellation cho long-running operations.

```swift
func downloadLargeFile() async throws -> Data {
    var data = Data()
    for chunk in chunks {
        try Task.checkCancellation() // Throw CancellationError nếu đã hủy
        let downloaded = try await downloadChunk(chunk)
        data.append(downloaded)
    }
    return data
}

// Trong SwiftUI
struct DownloadView: View {
    @State private var task: Task<Void, Never>?
    
    var body: some View {
        Button("Tải") {
            task = Task {
                try? await downloadLargeFile()
            }
        }
        .onDisappear {
            task?.cancel() // Hủy task khi view biến mất
        }
    }
}
```

### 4.6 AsyncSequence

`AsyncSequence` cho phép iterate over values theo thời gian bất đồng bộ.

```swift
struct TimerSequence: AsyncSequence {
    typealias Element = Date
    let interval: Duration
    
    struct AsyncIterator: AsyncIteratorProtocol {
        let interval: Duration
        var last = Date()
        
        mutating func next() async -> Date? {
            try? await Task.sleep(for: interval)
            last = Date()
            return last
        }
    }
    
    func makeAsyncIterator() -> AsyncIterator {
        AsyncIterator(interval: interval)
    }
}

// Sử dụng
for await date in TimerSequence(interval: .seconds(1)) {
    print(date)
    if shouldStop { break }
}
```

---

## 5. Swift 6 và Data Race Safety

Swift 6 mặc định bật **strict concurrency checking**, buộc code phải an toàn khỏi data race.

### 5.1 Complete Concurrency Checking

Trong Build Settings: `SWIFT_STRICT_CONCURRENCY = complete`

Swift sẽ báo lỗi nếu có khả năng data race tại compile time.

### 5.2 Global actors

Tạo custom global actor cho domain cụ thể:

```swift
@globalActor
actor DatabaseActor {
    static let shared = DatabaseActor()
}

@DatabaseActor
class DatabaseManager {
    func save() { /* chỉ chạy trên DatabaseActor */ }
}

// Sử dụng
@DatabaseActor
func migrate() async { ... }
```

### 5.3 Sendable conformance

Khi Swift báo lỗi "type does not conform to Sendable":

1. **Nếu immutable**: Đảm bảo tất cả properties là `let` và Sendable
2. **Nếu mutable nhưng protected**: Dùng `actor` hoặc lock, mark `@unchecked Sendable` với comment
3. **Nếu reference type không thể thay đổi**: Xem xét chuyển sang `struct`
4. **Nếu closure**: Đảm bảo không capture mutable state, dùng `@Sendable`

```swift
// Trước - không Sendable
class Configuration {
    var apiKey: String = ""
}

// Sau - chuyển thành struct hoặc làm immutable
struct Configuration: Sendable {
    let apiKey: String
}
```

### 5.4 Region-based Isolation

Swift 6 hiểu rằng trong một scope, bạn có thể chuyển đổi ownership an toàn mà không cần Sendable:

```swift
func process() {
    var localData = [1, 2, 3] // non-Sendable
    Task {
        // localData được transfer vào task - an toàn vì không dùng sau khi transfer
        await processData(localData)
    }
    // localData không được dùng ở đây nữa
}
```

---

## 6. SwiftUI nâng cao

### 6.1 View Identity và Performance

SwiftUI xác định view identity để quyết định có re-render hay không. Hiểu identity giúp tối ưu.

- **Structural identity**: Dựa vào vị trí trong view hierarchy
- **Explicit identity**: Dùng `.id(_:)` hoặc `ForEach` với `Identifiable`

```swift
// Có thể gây vấn đề identity
if showDetails {
    DetailsView()
} else {
    EmptyView()
}

// Tốt hơn - dùng enum hoặc giữ identity
switch viewState {
case .details: DetailsView()
case .empty: EmptyView()
}
```

### 6.2 ViewBuilder và Custom Views

```swift
struct Card<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding()
            .background(.background)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(radius: 4)
    }
}

// Sử dụng
Card {
    VStack {
        Text("Title")
        Text("Subtitle")
    }
}
```

### 6.3 PreferenceKey

Dùng để truyền dữ liệu **từ child lên parent** trong view hierarchy.

```swift
struct HeightPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}

struct HeightReportingView: View {
    var body: some View {
        Text("Hello")
            .background(
                GeometryReader { geo in
                    Color.clear
                        .preference(key: HeightPreferenceKey.self, value: geo.size.height)
                }
            )
    }
}

struct ParentView: View {
    @State private var childHeight: CGFloat = 0
    
    var body: some View {
        VStack {
            HeightReportingView()
                .onPreferenceChange(HeightPreferenceKey.self) { height in
                    childHeight = height
                }
            Text("Child height: \(childHeight)")
        }
    }
}
```

### 6.4 ViewModifier tùy chỉnh

```swift
struct ShimmerEffect: ViewModifier {
    @State private var phase: CGFloat = 0
    
    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    colors: [.clear, .white.opacity(0.3), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .mask(content)
                .offset(x: phase)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 300
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerEffect())
    }
}
```

### 6.5 Environment Values tùy chỉnh

```swift
struct ThemeKey: EnvironmentKey {
    static let defaultValue: Theme = .light
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

enum Theme {
    case light, dark
}

// Sử dụng
struct ContentView: View {
    @Environment(\.theme) var theme
    
    var body: some View {
        Text("Hello")
            .foregroundColor(theme == .dark ? .white : .black)
    }
}

// Inject
ContentView()
    .environment(\.theme, .dark)
```

---

## 7. Observation Framework (iOS 17+)

`@Observable` là thế hệ mới thay thế `ObservableObject`, hiệu quả hơn và ít boilerplate hơn.

### 7.1 So sánh ObservableObject vs @Observable

| Tiêu chí | `ObservableObject` | `@Observable` |
|---|---|---|
| **Boilerplate** | Cần `@Published`, `@StateObject`, `@ObservedObject` | Chỉ cần `@Observable`, `@State`, `@Bindable` |
| **Granular updates** | Toàn bộ view quan sát object re-render khi bất kỳ `@Published` thay đổi | Chỉ view đọc property cụ thể re-render khi property đó thay đổi |
| **Performance** | Nhiều re-render không cần thiết | Hiệu quả hơn đáng kể |
| **Combine dependency** | Phụ thuộc vào Combine | Native, không cần Combine |
| **iOS support** | Tất cả iOS 13+ | iOS 17+ |

### 7.2 Sử dụng @Observable

```swift
import Observation

@MainActor
@Observable
final class ProductViewModel {
    var products: [Product] = []
    var isLoading = false
    var searchQuery = ""
    
    private let service: ProductServiceProtocol
    
    init(service: ProductServiceProtocol) {
        self.service = service
    }
    
    var filteredProducts: [Product] {
        if searchQuery.isEmpty {
            return products
        }
        return products.filter { $0.name.localizedCaseInsensitiveContains(searchQuery) }
    }
    
    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            products = try await service.fetchProducts()
        } catch {
            // Handle error
        }
    }
}
```

```swift
struct ProductListView: View {
    @State private var viewModel: ProductViewModel
    
    init(service: ProductServiceProtocol) {
        _viewModel = State(wrappedValue: ProductViewModel(service: service))
    }
    
    var body: some View {
        NavigationStack {
            List(viewModel.filteredProducts) { product in
                Text(product.name)
            }
            .searchable(text: $viewModel.searchQuery)
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            .task { await viewModel.load() }
            .navigationTitle("Sản phẩm")
        }
    }
}
```

### 7.3 @Bindable

Dùng khi cần tạo `Binding` tới property của `@Observable` object.

```swift
struct SettingsView: View {
    @Bindable var viewModel: SettingsViewModel
    
    var body: some View {
        Form {
            Toggle("Thông báo", isOn: $viewModel.notificationsEnabled)
            Toggle("Chế độ tối", isOn: $viewModel.darkModeEnabled)
        }
    }
}
```

### 7.4 @Observable với Environment

```swift
@main
struct MyApp: App {
    @State private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
        }
    }
}

struct ContentView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        if appState.isLoggedIn {
            HomeView()
        } else {
            LoginView()
        }
    }
}
```

---

## 8. Navigation nâng cao

### 8.1 NavigationStack với path

Dùng `NavigationPath` để điều hướng programmatically và hỗ trợ deep linking.

```swift
enum Route: Hashable {
    case productDetail(id: UUID)
    case cart
    case checkout
}

struct ContentView: View {
    @State private var path = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $path) {
            HomeView(path: $path)
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .productDetail(let id):
                        ProductDetailView(productId: id)
                    case .cart:
                        CartView()
                    case .checkout:
                        CheckoutView()
                    }
                }
        }
    }
}

struct HomeView: View {
    @Binding var path: NavigationPath
    
    var body: some View {
        Button("Xem chi tiết") {
            path.append(Route.productDetail(id: UUID()))
        }
        Button("Đi tới giỏ hàng") {
            path.append(Route.cart)
        }
        Button("Về trang chủ") {
            path.removeLast(path.count)
        }
    }
}
```

### 8.2 Coordinator Pattern

Với app phức tạp, Coordinator tách logic navigation khỏi View.

```swift
@MainActor
protocol Coordinator {
    func start()
    func navigate(to route: Route)
    func pop()
    func popToRoot()
}

@MainActor
class AppCoordinator: ObservableObject {
    @Published var path = NavigationPath()
    
    func navigate(to route: Route) {
        path.append(route)
    }
    
    func pop() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }
    
    func popToRoot() {
        path.removeLast(path.count)
    }
}
```

```swift
struct RootView: View {
    @StateObject private var coordinator = AppCoordinator()
    let container: DIContainer
    
    var body: some View {
        NavigationStack(path: $coordinator.path) {
            HomeView(coordinator: coordinator, container: container)
                .navigationDestination(for: Route.self) { route in
                    view(for: route)
                }
        }
        .environmentObject(coordinator)
    }
    
    @ViewBuilder
    func view(for route: Route) -> some View {
        switch route {
        case .productDetail(let id):
            ProductDetailView(coordinator: coordinator, productId: id, container: container)
        case .cart:
            CartView(coordinator: coordinator)
        case .checkout:
            CheckoutView(coordinator: coordinator)
        }
    }
}
```

### 8.3 Deep Linking

```swift
struct MyApp: App {
    @State private var path = NavigationPath()
    
    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $path) {
                ContentView(path: $path)
            }
            .onOpenURL { url in
                handleDeepLink(url)
            }
        }
    }
    
    func handleDeepLink(_ url: URL) {
        // myapp://product/123
        guard url.scheme == "myapp" else { return }
        guard let host = url.host else { return }
        
        switch host {
        case "product":
            if let idString = url.lastPathComponent,
               let id = UUID(uuidString: idString) {
                path = NavigationPath()
                path.append(Route.productDetail(id: id))
            }
        case "cart":
            path = NavigationPath()
            path.append(Route.cart)
        default:
            break
        }
    }
}
```

---

## 9. Networking nâng cao

### 9.1 Network Client Protocol

```swift
protocol NetworkClient {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
    func request(_ endpoint: Endpoint) async throws -> Data
}

struct Endpoint {
    let baseURL: URL
    let path: String
    let method: HTTPMethod
    let headers: [String: String]?
    let queryItems: [URLQueryItem]?
    let body: Data?
    
    enum HTTPMethod: String {
        case get = "GET"
        case post = "POST"
        case put = "PUT"
        case patch = "PATCH"
        case delete = "DELETE"
    }
}
```

### 9.2 URLSession Implementation

```swift
struct URLSessionNetworkClient: NetworkClient {
    private let session: URLSession
    private let decoder: JSONDecoder
    
    init(session: URLSession = .shared, decoder: JSONDecoder = .default) {
        self.session = session
        self.decoder = decoder
    }
    
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let data = try await request(endpoint)
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decodingFailed(error)
        }
    }
    
    func request(_ endpoint: Endpoint) async throws -> Data {
        let request = try buildRequest(from: endpoint)
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.serverError(httpResponse.statusCode, data)
        }
        
        return data
    }
    
    private func buildRequest(from endpoint: Endpoint) throws -> URLRequest {
        var components = URLComponents(url: endpoint.baseURL.appendingPathComponent(endpoint.path), resolvingAgainstBaseURL: false)
        components?.queryItems = endpoint.queryItems
        
        guard let url = components?.url else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.allHTTPHeaderFields = endpoint.headers
        request.httpBody = endpoint.body
        request.timeoutInterval = 30
        return request
    }
}

enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(Int, Data)
    case decodingFailed(Error)
    case noInternetConnection
    case timeout
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL không hợp lệ"
        case .invalidResponse: return "Phản hồi không hợp lệ từ máy chủ"
        case .serverError(let code, _): return "Lỗi máy chủ (\(code))"
        case .decodingFailed: return "Lỗi xử lý dữ liệu"
        case .noInternetConnection: return "Không có kết nối mạng"
        case .timeout: return "Hết thời gian chờ"
        }
    }
}

extension JSONDecoder {
    static var `default`: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}
```

### 9.3 API Router/Service

```swift
enum API {
    case getUsers
    case getUser(id: UUID)
    case createUser(UserRequest)
    case updateUser(id: UUID, UserRequest)
    case deleteUser(id: UUID)
}

extension API {
    func endpoint(baseURL: URL) -> Endpoint {
        switch self {
        case .getUsers:
            return Endpoint(baseURL: baseURL, path: "/users", method: .get, headers: defaultHeaders, queryItems: nil, body: nil)
        case .getUser(let id):
            return Endpoint(baseURL: baseURL, path: "/users/\(id.uuidString)", method: .get, headers: defaultHeaders, queryItems: nil, body: nil)
        case .createUser(let request):
            let data = try? JSONEncoder().encode(request)
            return Endpoint(baseURL: baseURL, path: "/users", method: .post, headers: defaultHeaders, queryItems: nil, body: data)
        case .updateUser(let id, let request):
            let data = try? JSONEncoder().encode(request)
            return Endpoint(baseURL: baseURL, path: "/users/\(id.uuidString)", method: .put, headers: defaultHeaders, queryItems: nil, body: data)
        case .deleteUser(let id):
            return Endpoint(baseURL: baseURL, path: "/users/\(id.uuidString)", method: .delete, headers: defaultHeaders, queryItems: nil, body: nil)
        }
    }
    
    var defaultHeaders: [String: String] {
        ["Content-Type": "application/json", "Accept": "application/json"]
    }
}
```

```swift
struct UserService: UserServiceProtocol {
    private let client: NetworkClient
    private let baseURL: URL
    
    init(client: NetworkClient, baseURL: URL) {
        self.client = client
        self.baseURL = baseURL
    }
    
    func fetchUsers() async throws -> [User] {
        try await client.request(API.getUsers.endpoint(baseURL: baseURL))
    }
    
    func fetchUser(id: UUID) async throws -> User {
        try await client.request(API.getUser(id: id).endpoint(baseURL: baseURL))
    }
    
    func createUser(_ request: UserRequest) async throws -> User {
        try await client.request(API.createUser(request).endpoint(baseURL: baseURL))
    }
}
```

### 9.4 Retry và Timeout

```swift
struct RetryableNetworkClient: NetworkClient {
    private let baseClient: NetworkClient
    private let maxRetries: Int
    private let retryDelay: Duration
    
    init(baseClient: NetworkClient, maxRetries: Int = 3, retryDelay: Duration = .seconds(1)) {
        self.baseClient = baseClient
        self.maxRetries = maxRetries
        self.retryDelay = retryDelay
    }
    
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        try await retry {
            try await baseClient.request(endpoint)
        }
    }
    
    func request(_ endpoint: Endpoint) async throws -> Data {
        try await retry {
            try await baseClient.request(endpoint)
        }
    }
    
    private func retry<T>(_ operation: () async throws -> T) async throws -> T {
        var lastError: Error?
        for attempt in 0...maxRetries {
            do {
                return try await operation()
            } catch let error as NetworkError {
                lastError = error
                // Chỉ retry cho lỗi mạng hoặc server 5xx
                if case .serverError(let code, _) = error, code < 500 {
                    throw error
                }
                if attempt < maxRetries {
                    try await Task.sleep(for: retryDelay * Double(attempt + 1))
                }
            } catch {
                throw error
            }
        }
        throw lastError ?? NetworkError.invalidResponse
    }
}
```

---

## 10. Persistence nâng cao

### 10.1 Protocol-based Storage

```swift
protocol StorageProtocol {
    func save<T: Codable>(_ value: T, forKey key: String) throws
    func load<T: Codable>(forKey key: String) throws -> T?
    func remove(forKey key: String)
    func clearAll()
}

class UserDefaultsStorage: StorageProtocol {
    private let defaults: UserDefaults
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }
    
    func save<T: Codable>(_ value: T, forKey key: String) throws {
        let data = try encoder.encode(value)
        defaults.set(data, forKey: key)
    }
    
    func load<T: Codable>(forKey key: String) throws -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try decoder.decode(T.self, from: data)
    }
    
    func remove(forKey key: String) {
        defaults.removeObject(forKey: key)
    }
    
    func clearAll() {
        if let bundleID = Bundle.main.bundleIdentifier {
            defaults.removePersistentDomain(forName: bundleID)
        }
    }
}
```

### 10.2 FileManager Storage

```swift
class FileStorage {
    private let directory: URL
    
    init(directory: FileManager.SearchPathDirectory = .documentDirectory) {
        let urls = FileManager.default.urls(for: directory, in: .userDomainMask)
        self.directory = urls[0]
    }
    
    func save(_ data: Data, filename: String) throws {
        let url = directory.appendingPathComponent(filename)
        try data.write(to: url, options: .atomic)
    }
    
    func load(filename: String) throws -> Data {
        let url = directory.appendingPathComponent(filename)
        return try Data(contentsOf: url)
    }
    
    func delete(filename: String) throws {
        let url = directory.appendingPathComponent(filename)
        try FileManager.default.removeItem(at: url)
    }
    
    func exists(filename: String) -> Bool {
        let url = directory.appendingPathComponent(filename)
        return FileManager.default.fileExists(atPath: url.path)
    }
}
```

### 10.3 Keychain (Cơ bản với Security framework)

```swift
enum KeychainError: Error {
    case duplicateItem
    case unknown(OSStatus)
    case itemNotFound
}

class KeychainManager {
    static let shared = KeychainManager()
    private init() {}
    
    func save(_ value: String, forKey key: String) throws {
        guard let data = value.data(using: .utf8) else { return }
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.unknown(status)
        }
    }
    
    func load(forKey key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecItemNotFound {
            return nil
        }
        
        guard status == errSecSuccess else {
            throw KeychainError.unknown(status)
        }
        
        guard let data = dataTypeRef as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return string
    }
    
    func delete(forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unknown(status)
        }
    }
}
```

### 10.4 SwiftData cơ bản (iOS 17+)

```swift
import SwiftData

@Model
final class TodoItem {
    @Attribute(.unique) var id: UUID
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    
    init(title: String) {
        self.id = UUID()
        self.title = title
        self.isCompleted = false
        self.createdAt = Date()
    }
}

@MainActor
class TodoStore {
    private let modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }
    
    func fetchTodos() -> [TodoItem] {
        let descriptor = FetchDescriptor<TodoItem>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        return (try? modelContext.fetch(descriptor)) ?? []
    }
    
    func addTodo(title: String) {
        let todo = TodoItem(title: title)
        modelContext.insert(todo)
        try? modelContext.save()
    }
    
    func toggleTodo(_ todo: TodoItem) {
        todo.isCompleted.toggle()
        try? modelContext.save()
    }
    
    func deleteTodo(_ todo: TodoItem) {
        modelContext.delete(todo)
        try? modelContext.save()
    }
}
```

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            TodoListView()
        }
        .modelContainer(for: TodoItem.self)
    }
}

struct TodoListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TodoItem.createdAt, order: .reverse) private var todos: [TodoItem]
    @State private var newTodoTitle = ""
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(todos) { todo in
                    HStack {
                        Button {
                            todo.isCompleted.toggle()
                            try? modelContext.save()
                        } label: {
                            Image(systemName: todo.isCompleted ? "checkmark.circle.fill" : "circle")
                        }
                        Text(todo.title)
                            .strikethrough(todo.isCompleted)
                    }
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        modelContext.delete(todos[index])
                    }
                    try? modelContext.save()
                }
            }
            .toolbar {
                ToolbarItem(placement: .bottomBar) {
                    HStack {
                        TextField("Thêm việc...", text: $newTodoTitle)
                        Button("Thêm") {
                            guard !newTodoTitle.isEmpty else { return }
                            let todo = TodoItem(title: newTodoTitle)
                            modelContext.insert(todo)
                            try? modelContext.save()
                            newTodoTitle = ""
                        }
                    }
                }
            }
            .navigationTitle("Việc cần làm")
        }
    }
}
```

---

## 11. Combine Framework cơ bản

Mặc dù Swift Concurrency đang thay thế dần, Combine vẫn hữu ích cho một số trường hợp (legacy code, UI bindings phức tạp, NotificationCenter).

### 11.1 Publisher và Subscriber

```swift
import Combine

class SearchViewModel: ObservableObject {
    @Published var searchText = ""
    @Published private(set) var results: [String] = []
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        $searchText
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .filter { !$0.isEmpty }
            .flatMap { query in
                self.search(query: query)
            }
            .assign(to: &$results)
    }
    
    func search(query: String) -> AnyPublisher<[String], Never> {
        // Giả lập search
        Future { promise in
            DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
                let results = ["Result 1 for \(query)", "Result 2 for \(query)"]
                promise(.success(results))
            }
        }
        .eraseToAnyPublisher()
    }
}
```

### 11.2 Operators phổ biến

| Operator | Mục đích |
|---|---|
| `map` | Biến đổi giá trị |
| `filter` | Lọc giá trị |
| `debounce` | Chờ ngừng input trước khi emit |
| `throttle` | Giới hạn tần suất emit |
| `removeDuplicates` | Loại bỏ giá trị trùng liên tiếp |
| `flatMap` | Chuyển publisher thành publisher khác |
| `merge` | Gộp nhiều publisher |
| `combineLatest` | Kết hợp giá trị mới nhất từ nhiều publisher |
| `sink` | Subscribe và xử lý giá trị |
| `assign(to:on:)` | Gán vào property |

### 11.3 Kết hợp Combine với SwiftUI

```swift
struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    
    var body: some View {
        VStack {
            TextField("Tìm kiếm...", text: $viewModel.searchText)
                .textFieldStyle(.roundedBorder)
                .padding()
            
            List(viewModel.results, id: \.self) { result in
                Text(result)
            }
        }
    }
}
```

---

## 12. Performance Optimization

### 12.1 SwiftUI Performance Tips

| Kỹ thuật | Giải thích | Ví dụ |
|---|---|---|
| **Sử dụng Lazy containers** | Chỉ render view trong viewport | `LazyVStack`, `LazyVGrid` thay `VStack` cho danh sách dài |
| **Tách subview** | Giảm scope re-render | Tạo `RowView` riêng thay vì inline trong body |
| **Tránh heavy work trong body** | Body phải nhanh và pure | Tính toán trong ViewModel, cache kết quả |
| **Dùng `EquatableView`** | Tránh re-render không cần thiết | `.equatable()` hoặc conform `Equatable` |
| **Stable identity** | Đảm bảo `id` không đổi khi không cần | Dùng `Identifiable` với stable ID |
| **Hạn chế GeometryReader** | Chỉ dùng khi thực sự cần | Tránh wrap toàn bộ view |

```swift
struct ProductRow: View, Equatable {
    let product: Product
    
    static func == (lhs: ProductRow, rhs: ProductRow) -> Bool {
        lhs.product.id == rhs.product.id && lhs.product.name == rhs.product.name
    }
    
    var body: some View {
        HStack {
            AsyncImage(url: product.imageURL) { image in
                image.resizable()
            } placeholder: {
                Color.gray
            }
            .frame(width: 60, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(alignment: .leading) {
                Text(product.name).font(.headline)
                Text(product.price.formatted(.currency(code: "VND")))
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// Sử dụng
LazyVStack {
    ForEach(products) { product in
        ProductRow(product: product)
            .equatable()
    }
}
```

### 12.2 Image Optimization

```swift
struct OptimizedImage: View {
    let url: URL?
    
    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .empty:
                ProgressView()
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            case .failure:
                Image(systemName: "photo")
                    .foregroundStyle(.gray)
            @unknown default:
                EmptyView()
            }
        }
        .frame(width: 100, height: 100)
        .clipped()
    }
}
```

**Tips:**
- Sử dụng `AsyncImage` có built-in caching
- Downsample ảnh trước khi hiển thị trong list
- Dùng appropriate image format (HEIC, WebP)
- Lazy load images trong scroll view

### 12.3 List Performance

```swift
// Tốt - LazyVStack
ScrollView {
    LazyVStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}

// Tránh - VStack render tất cả
ScrollView {
    VStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

### 12.4 Instruments Usage

| Instrument | Khi dùng |
|---|---|
| **Time Profiler** | Tìm hot paths, code chậm |
| **Allocations** | Theo dõi memory allocation, phát hiện retention |
| **Leaks** | Tìm memory leaks và retain cycles |
| **Core Animation** | Kiểm tra FPS, dropped frames, slow animations |
| **Energy Log** | Đánh giá battery usage |
| **Network** | Phân tích network requests |

**Quy trình tối ưu:**
1. **Đo** - Sử dụng Instruments trên thiết bị thật
2. **Xác định** - Tìm bottleneck cụ thể
3. **Tối ưu** - Áp dụng fix targeted
4. **Đo lại** - Xác nhận cải thiện
5. **Lặp lại** - Chỉ tối ưu nếu có lợi ích thực tế

---

## 13. Memory Management nâng cao

### 13.1 Retain Cycle Detection

Luôn kiểm tra retain cycle với:

- **Instruments > Leaks** - Tự động phát hiện
- **Debug Memory Graph** (Xcode) - Visualize object graph
- **deinit logging** - Thêm print trong `deinit` để confirm

```swift
class ViewModel {
    var onComplete: (() -> Void)?
    
    func setup() {
        // BAD - retain cycle
        // onComplete = { self.finish() }
        
        // GOOD
        onComplete = { [weak self] in
            self?.finish()
        }
    }
    
    func finish() {}
    
    deinit {
        print("ViewModel deallocated")
    }
}
```

### 13.2 Capture List nâng cao

```swift
class Service {
    var name = "Service"
    
    func doWork() {
        // [weak self] - self optional
        Task { [weak self] in
            guard let self else { return }
            print(self.name)
        }
        
        // [unowned self] - self non-optional, crash nếu deallocated
        // Chỉ dùng khi chắc chắn self sống lâu hơn closure
        Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [unowned self] _ in
            print(self.name)
        }
    }
}
```

### 13.3 Avoiding Strong References

```swift
// NotificationCenter
class Observer {
    var token: NSObjectProtocol?
    
    func register() {
        token = NotificationCenter.default.addObserver(
            forName: .someNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.handle(notification)
        }
    }
    
    func unregister() {
        if let token {
            NotificationCenter.default.removeObserver(token)
        }
    }
    
    deinit {
        unregister()
    }
}
```

---

## 14. Testing nâng cao

### 14.1 Testing Pyramid

```
        /\
       /  \      E2E/UI Tests (ít nhất)
      /____\     
     /      \    Integration Tests
    /________\   
   /          \  Unit Tests (nhiều nhất)
  /____________\
```

### 14.2 Mock, Stub, Spy

```swift
protocol UserServiceProtocol {
    func fetchUsers() async throws -> [User]
}

// Stub - trả về dữ liệu cố định
class UserServiceStub: UserServiceProtocol {
    var usersToReturn: [User] = []
    var errorToThrow: Error?
    
    func fetchUsers() async throws -> [User] {
        if let error = errorToThrow { throw error }
        return usersToReturn
    }
}

// Spy - ghi lại calls
class UserServiceSpy: UserServiceProtocol {
    private(set) var fetchUsersCallCount = 0
    var usersToReturn: [User] = []
    
    func fetchUsers() async throws -> [User] {
        fetchUsersCallCount += 1
        return usersToReturn
    }
}

// Mock - kết hợp stub + verify
class UserServiceMock: UserServiceProtocol {
    var fetchUsersCalled = false
    var usersToReturn: [User] = []
    
    func fetchUsers() async throws -> [User] {
        fetchUsersCalled = true
        return usersToReturn
    }
    
    func verifyFetchUsersCalled() -> Bool {
        return fetchUsersCalled
    }
}
```

### 14.3 Testing ViewModel với async/await

```swift
import XCTest
@testable import MyApp

@MainActor
final class UserListViewModelTests: XCTestCase {
    var sut: UserListViewModel!
    var mockService: UserServiceStub!
    
    override func setUp() {
        super.setUp()
        mockService = UserServiceStub()
        sut = UserListViewModel(service: mockService)
    }
    
    override func tearDown() {
        sut = nil
        mockService = nil
        super.tearDown()
    }
    
    func testFetchUsers_Success_LoadsUsers() async {
        // Given
        let expectedUsers = [
            User(id: UUID(), name: "John", email: "john@test.com"),
            User(id: UUID(), name: "Jane", email: "jane@test.com")
        ]
        mockService.usersToReturn = expectedUsers
        
        // When
        await sut.fetchUsers()
        
        // Then
        XCTAssertEqual(sut.users.count, 2)
        XCTAssertEqual(sut.users.first?.name, "John")
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.errorMessage)
    }
    
    func testFetchUsers_Failure_SetsErrorMessage() async {
        // Given
        mockService.errorToThrow = NetworkError.noInternetConnection
        
        // When
        await sut.fetchUsers()
        
        // Then
        XCTAssertTrue(sut.users.isEmpty)
        XCTAssertFalse(sut.isLoading)
        XCTAssertNotNil(sut.errorMessage)
    }
    
    func testFetchUsers_LoadingState() async {
        // Given
        mockService.usersToReturn = []
        
        // When
        let task = Task {
            await sut.fetchUsers()
        }
        
        // Then - kiểm tra loading state trong lúc đang load
        // (cần điều chỉnh để test đúng hơn)
        await task.value
        XCTAssertFalse(sut.isLoading)
    }
}
```

### 14.4 Testing với URLProtocol

```swift
class MockURLProtocol: URLProtocol {
    static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?
    
    override class func canInit(with request: URLRequest) -> Bool {
        return true
    }
    
    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        return request
    }
    
    override func startLoading() {
        guard let handler = MockURLProtocol.requestHandler else {
            fatalError("Handler is unavailable.")
        }
        
        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }
    
    override func stopLoading() {}
}

final class NetworkClientTests: XCTestCase {
    var client: URLSessionNetworkClient!
    var session: URLSession!
    
    override func setUp() {
        super.setUp()
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [MockURLProtocol.self]
        session = URLSession(configuration: configuration)
        client = URLSessionNetworkClient(session: session)
    }
    
    override func tearDown() {
        MockURLProtocol.requestHandler = nil
        client = nil
        session = nil
        super.tearDown()
    }
    
    func testFetchUsers_Success() async throws {
        // Given
        let users = [User(id: UUID(), name: "Test", email: "test@test.com")]
        let data = try JSONEncoder().encode(users)
        let response = HTTPURLResponse(url: URL(string: "https://test.com")!, statusCode: 200, httpVersion: nil, headerFields: nil)!
        
        MockURLProtocol.requestHandler = { request in
            return (response, data)
        }
        
        // When
        let endpoint = Endpoint(baseURL: URL(string: "https://test.com")!, path: "/users", method: .get, headers: nil, queryItems: nil, body: nil)
        let result: [User] = try await client.request(endpoint)
        
        // Then
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result.first?.name, "Test")
    }
}
```

### 14.5 UI Testing cơ bản

```swift
import XCTest

final class MyAppUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func testLoginFlow() {
        // Tìm elements
        let emailTextField = app.textFields["Email"]
        let passwordTextField = app.secureTextFields["Mật khẩu"]
        let loginButton = app.buttons["Đăng nhập"]
        
        // Tương tác
        XCTAssertTrue(emailTextField.exists)
        emailTextField.tap()
        emailTextField.typeText("test@example.com")
        
        passwordTextField.tap()
        passwordTextField.typeText("password123")
        
        loginButton.tap()
        
        // Kiểm tra kết quả
        let homeTitle = app.navigationBars["Trang chủ"]
        XCTAssertTrue(homeTitle.waitForExistence(timeout: 5))
    }
}
```

---

## 15. Modularization với Swift Package Manager

### 15.1 Tại sao modularize?

- **Build time nhanh hơn**: Chỉ build module thay đổi
- **Reusability**: Dùng lại code giữa app, extension, widget
- **Clear boundaries**: Ràng buộc dependencies rõ ràng
- **Team scalability**: Nhiều team làm song song
- **Better testability**: Test từng module độc lập

### 15.2 Cấu trúc module

```
MyApp/
├── App/                    # Main app target
├── Packages/
│   ├── Core/               # Shared utilities, extensions, network
│   │   ├── Package.swift
│   │   └── Sources/Core/
│   ├── DesignSystem/       # UI components, colors, fonts
│   │   ├── Package.swift
│   │   └── Sources/DesignSystem/
│   ├── FeatureHome/        # Home feature
│   │   ├── Package.swift
│   │   └── Sources/FeatureHome/
│   └── FeatureAuth/        # Auth feature
│       ├── Package.swift
│       └── Sources/FeatureAuth/
```

### 15.3 Package.swift mẫu

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Core",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "Core",
            targets: ["Core"]
        ),
    ],
    dependencies: [
        // External dependencies nếu cần
    ],
    targets: [
        .target(
            name: "Core",
            dependencies: []
        ),
        .testTarget(
            name: "CoreTests",
            dependencies: ["Core"]
        ),
    ]
)
```

```swift
// FeatureHome/Package.swift
let package = Package(
    name: "FeatureHome",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "FeatureHome", targets: ["FeatureHome"]),
    ],
    dependencies: [
        .package(path: "../Core"),
        .package(path: "../DesignSystem"),
    ],
    targets: [
        .target(
            name: "FeatureHome",
            dependencies: ["Core", "DesignSystem"]
        ),
        .testTarget(
            name: "FeatureHomeTests",
            dependencies: ["FeatureHome"]
        ),
    ]
)
```

### 15.4 Quy tắc dependencies

- **Core** không phụ thuộc module nào khác
- **DesignSystem** chỉ phụ thuộc Core
- **Feature modules** có thể phụ thuộc Core, DesignSystem, và các feature khác **KHÔNG** được (tránh circular dependency)
- **App** phụ thuộc tất cả features

**Tránh:**
- Feature A import Feature B trực tiếp
- Circular dependencies
- `@_exported import` lạm dụng

### 15.5 Local SPM vs Remote

- **Local packages**: Cho development trong cùng repo, nhanh, dễ debug
- **Remote packages**: Khi muốn share giữa nhiều repo/teams

---

## 16. Accessibility nâng cao

### 16.1 VoiceOver

```swift
struct ProductCard: View {
    let product: Product
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(product.name)
                .font(.headline)
            Text(product.price.formatted(.currency(code: "VND")))
                .font(.subheadline)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(product.name), giá \(product.price.formatted(.currency(code: "VND")))")
        .accessibilityHint("Nhấn để xem chi tiết sản phẩm")
        .accessibilityAddTraits(.isButton)
    }
}
```

### 16.2 Dynamic Type

```swift
struct ContentView: View {
    @ScaledMetric(relativeTo: .body) private var padding: CGFloat = 16
    @Environment(\.sizeCategory) var sizeCategory
    
    var body: some View {
        Text("Nội dung")
            .font(.body)
            .padding(padding)
            .lineLimit(nil) // Cho phép nhiều dòng với large text
    }
}
```

**Lời khuyên:**
- Dùng font styles (`.body`, `.headline`) thay vì fixed size
- Test với Accessibility Inspector
- Tránh `frame(height:)` cố định cho text
- Đảm bảo touch target >= 44x44 points

### 16.3 Reduce Motion

```swift
struct AnimatedView: View {
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    @State private var isAnimating = false
    
    var body: some View {
        Circle()
            .scaleEffect(isAnimating ? 1.2 : 1.0)
            .animation(
                reduceMotion ? nil : .easeInOut.repeatForever(),
                value: isAnimating
            )
            .onAppear { isAnimating = true }
    }
}
```

### 16.4 Color Contrast

- Sử dụng semantic colors: `.primary`, `.secondary`, `.background`
- Kiểm tra contrast ratio >= 4.5:1 cho text thường
- Hỗ trợ Dark Mode đầy đủ
- Tránh chỉ dùng màu để truyền thông tin

### 16.5 Accessibility Actions

```swift
struct ItemRow: View {
    let item: Item
    let onDelete: () -> Void
    let onFavorite: () -> Void
    
    var body: some View {
        HStack {
            Text(item.title)
            Spacer()
        }
        .accessibilityActions {
            Button("Yêu thích") {
                onFavorite()
            }
            Button("Xóa") {
                onDelete()
            }
        }
    }
}
```

---

## 17. Localization nâng cao

### 17.1 String Catalog (.xcstrings)

String Catalog là cách hiện đại để quản lý localization trong Xcode 15+.

```swift
Text("welcome_message", comment: "Thông báo chào mừng khi mở app")
```

Hoặc với string interpolation:

```swift
Text(String(localized: "items_count \(count)", comment: "Số lượng item"))
```

### 17.2 Pluralization

Trong String Catalog, có thể cấu hình plural rules cho từng ngôn ngữ:

```
"items_count %lld" 
  - zero: "Không có mục nào"
  - one: "%lld mục"
  - other: "%lld mục"
```

### 17.3 Formatting theo locale

```swift
// Date
Text(Date.now, format: .dateTime.day().month().year())

// Number
Text(price, format: .currency(code: Locale.current.currency?.identifier ?? "VND"))

// List
Text(items.formatted(.list(type: .and)))
```

### 17.4 RTL Support

- Sử dụng `.leading`/`.trailing` thay vì `.left`/`.right`
- Dùng `HStack` với alignment phù hợp
- Kiểm tra layout với RTL language
- Icons có hướng cần mirror

```swift
Image(systemName: "chevron.right")
    .flipsForRightToLeftLayoutDirection(true)
```

---

## 18. App Extensions và Widgets

### 18.1 WidgetKit cơ bản

```swift
import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), title: "Placeholder")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), title: "Snapshot")
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entries = [
            SimpleEntry(date: Date(), title: "Current")
        ]
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let title: String
}

struct MyWidgetEntryView: View {
    var entry: Provider.Entry
    
    var body: some View {
        Text(entry.title)
    }
}

struct MyWidget: Widget {
    let kind: String = "MyWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("My Widget")
        .description("Widget mô tả")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### 18.2 App Groups cho shared data

Để share data giữa app và widget/extension:

1. Bật App Groups capability
2. Sử dụng `UserDefaults(suiteName:)` hoặc shared container
3. FileManager với container URL

```swift
let sharedDefaults = UserDefaults(suiteName: "group.com.example.app")!
sharedDefaults.set("value", forKey: "key")
```

```swift
if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.example.app") {
    let fileURL = containerURL.appendingPathComponent("data.json")
    // Read/write
}
```

---

## 19. Security nâng cao

### 19.1 Biometric Authentication (Face ID/Touch ID)

```swift
import LocalAuthentication

class BiometricAuth {
    func authenticate() async throws -> Bool {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw AuthError.biometricsNotAvailable
        }
        
        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Xác thực để truy cập"
        )
    }
}

enum AuthError: Error {
    case biometricsNotAvailable
    case authenticationFailed
}
```

### 19.2 SSL Pinning (cơ bản)

```swift
class PinnedURLSessionDelegate: NSObject, URLSessionDelegate {
    let pinnedCertificates: [SecCertificate]
    
    init(certificates: [SecCertificate]) {
        self.pinnedCertificates = certificates
    }
    
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard let serverTrust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        
        // Validate certificate
        let policies = [SecPolicyCreateSSL(true, challenge.protectionSpace.host as CFString)]
        SecTrustSetPolicies(serverTrust, policies as CFArray)
        
        var result: SecTrustResultType = .invalid
        SecTrustEvaluate(serverTrust, &result)
        
        if result == .proceed || result == .unspecified {
            // Check pinning
            if isCertificatePinned(serverTrust) {
                completionHandler(.useCredential, URLCredential(trust: serverTrust))
                return
            }
        }
        
        completionHandler(.cancelAuthenticationChallenge, nil)
    }
    
    private func isCertificatePinned(_ serverTrust: SecTrust) -> Bool {
        // Implementation
        return true
    }
}
```

**Lưu ý:** Certificate pinning phức tạp và khó maintain. Chỉ dùng khi thực sự cần thiết và có quy trình rotate certificate.

### 19.3 Jailbreak Detection (tham khảo)

```swift
func isJailbroken() -> Bool {
    #if targetEnvironment(simulator)
    return false
    #else
    let paths = [
        "/Applications/Cydia.app",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/bin/bash",
        "/usr/sbin/sshd",
        "/etc/apt"
    ]
    
    for path in paths {
        if FileManager.default.fileExists(atPath: path) {
            return true
        }
    }
    
    if let url = URL(string: "cydia://package/com.example.package"),
       UIApplication.shared.canOpenURL(url) {
        return true
    }
    
    return false
    #endif
}
```

**Lời khuyên:** Jailbreak detection không phải bảo mật tuyệt đối, chỉ là lớp bảo vệ bổ sung.

### 19.4 Secure Coding Practices

- **Không hardcode secrets** trong source code
- **Sử dụng Keychain** cho sensitive data
- **Validate input** ở cả client và server
- **Sử dụng HTTPS** luôn luôn
- **Không log sensitive information**
- **Obfuscation** không thay thế bảo mật đúng đắn
- **Kiểm tra URL scheme** trước khi open
- **Sử dụng `FileProtectionType`** khi lưu file nhạy cảm

```swift
try data.write(to: url, options: [.atomic, .completeFileProtection])
```

---

## 20. Thực hành tổng hợp: Xây dựng kiến trúc sạch

Xây dựng một app đơn giản với Clean Architecture + MVVM + DI để áp dụng toàn bộ kiến thức.

### 20.1 Cấu trúc project

```
CleanApp/
├── CleanApp/              # App target
├── Core/                  # SPM Package
├── DesignSystem/          # SPM Package
└── Features/
    └── Products/          # SPM Package (Feature)
```

### 20.2 Domain Layer (Core)

```swift
// Core/Sources/Core/Domain/Entities/Product.swift
public struct Product: Identifiable, Equatable, Sendable {
    public let id: UUID
    public let name: String
    public let price: Decimal
    public let imageURL: URL?
    
    public init(id: UUID, name: String, price: Decimal, imageURL: URL?) {
        self.id = id
        self.name = name
        self.price = price
        self.imageURL = imageURL
    }
}

// Core/Sources/Core/Domain/Repositories/ProductRepositoryProtocol.swift
public protocol ProductRepositoryProtocol: Sendable {
    func fetchProducts() async throws -> [Product]
}

// Core/Sources/Core/Domain/UseCases/FetchProductsUseCase.swift
public protocol FetchProductsUseCase: Sendable {
    func execute() async throws -> [Product]
}

public struct FetchProductsUseCaseImpl: FetchProductsUseCase {
    private let repository: ProductRepositoryProtocol
    
    public init(repository: ProductRepositoryProtocol) {
        self.repository = repository
    }
    
    public func execute() async throws -> [Product] {
        return try await repository.fetchProducts()
    }
}
```

### 20.3 Data Layer

```swift
// Features/Products/Sources/Products/Data/DTOs/ProductDTO.swift
struct ProductDTO: Codable {
    let id: String
    let name: String
    let price: Double
    let imageUrl: String?
}

// Features/Products/Sources/Products/Data/Mappers/ProductMapper.swift
extension ProductDTO {
    func toDomain() -> Product {
        Product(
            id: UUID(uuidString: id) ?? UUID(),
            name: name,
            price: Decimal(price),
            imageURL: imageUrl.flatMap { URL(string: $0) }
        )
    }
}

// Features/Products/Sources/Products/Data/DataSources/ProductRemoteDataSource.swift
protocol ProductRemoteDataSource {
    func fetchProducts() async throws -> [ProductDTO]
}

struct ProductRemoteDataSourceImpl: ProductRemoteDataSource {
    private let client: NetworkClient
    private let baseURL: URL
    
    init(client: NetworkClient, baseURL: URL) {
        self.client = client
        self.baseURL = baseURL
    }
    
    func fetchProducts() async throws -> [ProductDTO] {
        // Implementation
        return []
    }
}

// Features/Products/Sources/Products/Data/Repositories/ProductRepository.swift
struct ProductRepository: ProductRepositoryProtocol {
    private let remoteDataSource: ProductRemoteDataSource
    
    init(remoteDataSource: ProductRemoteDataSource) {
        self.remoteDataSource = remoteDataSource
    }
    
    func fetchProducts() async throws -> [Product] {
        let dtos = try await remoteDataSource.fetchProducts()
        return dtos.map { $0.toDomain() }
    }
}
```

### 20.4 Presentation Layer

```swift
// Features/Products/Sources/Products/Presentation/ViewModel/ProductListViewModel.swift
import Foundation
import Core

@MainActor
@Observable
public final class ProductListViewModel {
    public var products: [Product] = []
    public var isLoading = false
    public var errorMessage: String?
    
    private let fetchProductsUseCase: FetchProductsUseCase
    
    public init(fetchProductsUseCase: FetchProductsUseCase) {
        self.fetchProductsUseCase = fetchProductsUseCase
    }
    
    public func loadProducts() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            products = try await fetchProductsUseCase.execute()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// Features/Products/Sources/Products/Presentation/View/ProductListView.swift
import SwiftUI
import Core
import DesignSystem

public struct ProductListView: View {
    @State private var viewModel: ProductListViewModel
    
    public init(viewModel: ProductListViewModel) {
        _viewModel = State(wrappedValue: viewModel)
    }
    
    public var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Đang tải...")
                } else if let error = viewModel.errorMessage {
                    ErrorView(message: error) {
                        Task { await viewModel.loadProducts() }
                    }
                } else {
                    List(viewModel.products) { product in
                        ProductRow(product: product)
                    }
                }
            }
            .navigationTitle("Sản phẩm")
            .task { await viewModel.loadProducts() }
        }
    }
}
```

### 20.5 DI Container

```swift
// CleanApp/DIContainer.swift
import Core
import Products

@MainActor
final class DIContainer {
    // Network
    private lazy var networkClient: NetworkClient = URLSessionNetworkClient()
    private let baseURL = URL(string: "https://api.example.com")!
    
    // Data Sources
    private lazy var productRemoteDataSource: ProductRemoteDataSource = 
        ProductRemoteDataSourceImpl(client: networkClient, baseURL: baseURL)
    
    // Repositories
    private lazy var productRepository: ProductRepositoryProtocol = 
        ProductRepository(remoteDataSource: productRemoteDataSource)
    
    // Use Cases
    private lazy var fetchProductsUseCase: FetchProductsUseCase = 
        FetchProductsUseCaseImpl(repository: productRepository)
    
    // ViewModels
    func makeProductListViewModel() -> ProductListViewModel {
        ProductListViewModel(fetchProductsUseCase: fetchProductsUseCase)
    }
}

// CleanApp/CleanApp.swift
@main
struct CleanApp: App {
    @State private var container = DIContainer()
    
    var body: some Scene {
        WindowGroup {
            ProductListView(viewModel: container.makeProductListViewModel())
        }
    }
}
```

---

## 21. Anti-patterns nâng cao

| Anti-pattern | Tại sao nguy hiểm | Cách tránh |
|---|---|---|
| **Massive View Controller/ViewModel** | Khó test, khó bảo trì, vi phạm SRP | Tách thành Use Cases, Services, nhỏ hơn |
| **God Object/Singleton abuse** | Tight coupling, khó test, global state | Sử dụng DI, inject dependencies |
| **Force unwrapping everywhere** | Crash không kiểm soát | `guard let`, `if let`, `??`, optional chaining |
| **Business logic trong View** | Không testable, View phức tạp | Chuyển sang ViewModel/Use Case |
| **Ignoring structured concurrency** | Data race, memory leak, khó cancel | Dùng `async/await`, `Task`, actor đúng cách |
| **Mixing Combine và async/await không cần thiết** | Code phức tạp, khó hiểu | Chọn một approach nhất quán |
| **Over-modularization** | Boilerplate quá nhiều, build phức tạp | Chỉ tách khi có boundary rõ ràng |
| **Not using protocols for dependencies** | Khó mock test | Luôn định nghĩa protocol cho services/repositories |
| **Retain cycles** | Memory leak | Dùng `[weak self]`, check với Instruments |
| **Updating UI on background thread** | Crash, undefined behavior | Dùng `@MainActor` |
| **Ignoring Sendable in Swift 6** | Compile errors, data race | Tuân thủ strict concurrency |
| **Fat models in Core Data/SwiftData** | Khó test, tight coupling | Map to domain models |

---

## 22. Lộ trình học tiếp theo

| Giai đoạn | Chủ đề | Thời gian | Ghi chú |
|---|---|---|---|
| **1. Ôn tập** | Hoàn thành bài thực hành phần 20 | 1-2 tuần | Viết lại không nhìn code |
| **2. Concurrency sâu** | Actors, Sendable, Swift 6 migration | 2-3 tuần | Thực hành với data race |
| **3. Architecture** | Clean Architecture với project thực tế | 2-4 tuần | Áp dụng vào To-Do app hoàn chỉnh |
| **4. Testing** | Unit + Integration + UI testing đầy đủ | 1-2 tuần | Đạt coverage cho business logic |
| **5. Performance** | Instruments mastery | 1-2 tuần | Tối ưu app thực tế |
| **6. Modularization** | Tách thành nhiều packages | 1-2 tuần | Đo build time trước/sau |
| **7. Production** | Đọc `ios-production.md` và thực hành | Ongoing | Chuẩn bị publish app |

**Lời khuyên:** Chọn **MỘT** project lớn và áp dụng toàn bộ kiến thức thay vì nhảy qua nhiều project nhỏ.

---

## 23. Tài liệu tham khảo

### Chính thức Apple
- [Swift Documentation](https://docs.swift.org/swift-book/) - Swift language guide
- [Swift Concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) - Concurrency guide
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui) - SwiftUI framework
- [Observation Framework](https://developer.apple.com/documentation/observation) - @Observable
- [SwiftData Documentation](https://developer.apple.com/documentation/swiftdata) - SwiftData
- [WWDC Videos](https://developer.apple.com/videos/) - Cập nhật mới nhất

### Cộng đồng
- [Hacking with Swift](https://www.hackingwithswift.com/) - Học thực tế, rất tốt
- [Swift by Sundell](https://www.swiftbysundell.com/) - Articles chất lượng cao về architecture
- [Point-Free](https://www.pointfree.co/) - Advanced Swift/SwiftUI (có phí nhưng rất giá trị)
- [Apple Developer Forums](https://developer.apple.com/forums/) - Hỏi đáp chính thức

### Công cụ
- [Instruments User Guide](https://help.apple.com/instruments/) - Profiling
- [Swift Package Manager](https://www.swift.org/package-manager/) - Modularization

---

*Thành thạo iOS nâng cao không phải học hết tất cả, mà là biết khi nào dùng cái gì và tại sao. Ưu tiên đơn giản, rõ ràng hơn phức tạp không cần thiết.*