# iOS — Từ Swift cơ bản đến ứng dụng production

> Bộ tài liệu độc lập, tập trung vào cách xây dựng ứng dụng iOS vững chắc: từ ngôn ngữ Swift, SwiftUI/UIKit, kiến trúc, networking, persistence, concurrency, bảo mật, hiệu năng đến quy trình phát hành và vận hành trên App Store.

Viết cho **Swift 5.9+ / 6.x**, **Xcode 16+ (khuyến nghị 26.x)**, deployment target mẫu **iOS 17.0**. Các API chỉ có trên iOS 18+ sẽ được ghi rõ và **không** dùng làm nền tảng bắt buộc.

---

## Mục lục

- [1. Hệ sinh thái iOS](#1-hệ-sinh-thái-ios)
- [2. SwiftUI vs UIKit: khi nào dùng cái nào](#2-swiftui-vs-uikit-khi-nào-dùng-cái-nào)
- [3. Bản đồ tài liệu](#3-bản-đồ-tài-liệu)
- [4. Lộ trình học](#4-lộ-trình-học)
- [5. Cài đặt môi trường](#5-cài-đặt-môi-trường)
- [6. Cấu trúc project, module hoá và quy ước](#6-cấu-trúc-project-module-hoá-và-quy-ước)
- [7. Nguyên tắc thiết kế ứng dụng iOS](#7-nguyên-tắc-thiết-kế-ứng-dụng-ios)
- [8. Checklist môi trường](#8-checklist-môi-trường)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [10. Tài liệu tham khảo](#10-tài-liệu-tham-khảo)

---

## 1. Hệ sinh thái iOS

| Thành phần | Vai trò | Ghi chú |
|---|---|---|
| **Swift** | Ngôn ngữ chính, an toàn về kiểu, ARC, Swift Concurrency | Ưu tiên hiểu value/reference semantics, `Sendable`, `actor`, `MainActor`. |
| **Xcode** | IDE, trình biên dịch, debugger, Instruments, Simulator, Archive | Kiểm tra phiên bản Xcode được App Store chấp nhận tại thời điểm phát hành. |
| **iOS SDK** | Framework hệ thống (Foundation, UIKit, SwiftUI, Combine, CryptoKit, ...) | Luôn kiểm tra tính khả dụng theo `@available`/`if #available`. |
| **SwiftUI** | UI khai báo, state-driven, tích hợp sâu với hệ thống | Phù hợp đa số màn hình form/list/detail cho ứng dụng mới. |
| **UIKit** | UI mệnh lệnh, kiểm soát chi tiết, tương thích rộng | Hữu ích cho view phức tạp, transition tùy chỉnh, tích hợp component legacy. |
| **Swift Package Manager (SPM)** | Quản lý dependency, module hóa, tách kiến trúc | Ưu tiên cho dự án mới; dễ tích hợp với Xcode và CI. |
| **TestFlight** | Phân phối beta nội bộ/ngoài | Build TestFlight có thời hạn (thường 90 ngày), cần quản lý nhóm tester. |
| **Apple Developer Program** | Chứng chỉ, provisioning, entitlements, APNs, App Store Connect | Cần thiết để ký, phân phối và phát hành. |

**Khái niệm nền tảng quan trọng:**

| Khái niệm | Giải thích |
|---|---|
| **Bundle ID** | Định danh duy nhất dạng reverse-DNS (vd. `com.example.ordersapp`). Gần như không thể thay đổi sau khi phát hành lên App Store. |
| **Target** | Sản phẩm build ra (app, app extension, widget, framework...). Mỗi target có signing, build settings riêng. |
| **Scheme** | Cấu hình chạy/build/test/archive (Debug/Release, biến môi trường, launch arguments). |
| **Provisioning Profile + Certificate** | Ghép quyền (entitlements), App ID, thiết bị được phép chạy. |
| **App Sandbox** | Cách ly app, hạn chế truy cập file/network/hệ thống theo nguyên tắc tối thiểu quyền. |
| **Entitlements** | Quyền đặc biệt (Push Notifications, App Groups, Keychain Sharing, Associated Domains,...). |

> ⚠️ **Simulator có giới hạn:** không có camera thật, một số cảm biến, hầu hết hành vi Push thật, một số giới hạn mạng/background. Luôn xác minh trên **thiết bị thật** trước khi release.

---

## 2. SwiftUI vs UIKit: khi nào dùng cái nào

Không có "một cách đúng" duy nhất. Lựa chọn dựa trên yêu cầu thực tế, kỹ năng team và khả năng bảo trì dài hạn.

| Tiêu chí | **SwiftUI** | **UIKit** |
|---|---|---|
| **Phong cách** | Khai báo (declarative), data-driven | Mệnh lệnh (imperative), view/controller-driven |
| **Tốc độ dựng UI đơn giản** | Nhanh, ít boilerplate | Nhiều hơn nhưng rất rõ ràng |
| **Hiệu năng với list rất lớn** | Tốt với `LazyVStack`/`List` nếu tối ưu đúng; cần chú ý `@ViewBuilder`, identity | Rất ổn định với `UITableView`/`UICollectionView`, dễ kiểm soát cell reuse |
| **Animation & gesture** | Tích hợp tốt, nhanh cho đa số case | Linh hoạt tối đa, phù hợp gesture phức tạp, custom transition |
| **Truy cập API hệ thống mới** | Thường có wrapper nhanh, nhưng đôi khi chậm hơn so với UIKit thuần | Truy cập trực tiếp, thường đầy đủ nhất |
| **Tương thích** | Tốt dần; cần kiểm tra theo deployment target | Rất rộng, ổn định qua nhiều phiên bản iOS |
| **Testing UI** | Có thể test logic/view model dễ dàng; UI test vẫn cần cân nhắc | UI test truyền thống quen thuộc, nhiều pattern đã được chứng minh |
| **Học đường dài** | Rất phù hợp để bắt đầu và mở rộng nhanh | Nền tảng thiết yếu để hiểu sâu iOS, hữu ích khi debug hệ thống |

**Khuyến nghị thực tế:**

- **Ưu tiên SwiftUI** cho app mới nếu target >= iOS 17 và không có yêu cầu bắt buộc phải dùng component UIKit-only.
- **Kết hợp**: dùng `UIViewRepresentable`/`UIViewControllerRepresentable` để bọc UIKit khi cần. Giữ ranh giới rõ ràng (vd. một feature/module chỉ dùng một hướng khi có thể).
- **Học cả hai**: hiểu lifecycle (`UIViewController`, `View`) giúp debug tốt hơn rất nhiều, đặc biệt khi gặp vấn đề rendering/navigation.

---

## 3. Bản đồ tài liệu

| Tài liệu | Nội dung chính | Khi nào đọc |
|---|---|---|
| [`ios-basics.md`](./ios-basics.md) | Swift ngôn ngữ, Optional, value/reference, closure, ARC, Swift Concurrency cơ bản, Xcode, SwiftUI/UIKit, URLSession, Codable, persistence cơ bản, XCTest, debug | Nền tảng — đọc trước tiên |
| [`ios-advanced.md`](./ios-advanced.md) | Kiến trúc (MVVM/Clean), DI, State management, Combine vs async/await, Swift Concurrency nâng cao (actor/task/group), Navigation nâng cao, Networking nâng cao, Persistence (FileManager, UserDefaults, Keychain, Core Data/SwiftData), Offline-first, Push Notifications, Deep Link/Universal Link, Background Tasks, Module hóa/SPM, Performance, Security nâng cao | Sau khi nắm basics — áp dụng vào dự án thực tế |
| [`ios-production.md`](./ios-production.md) | Signing & Provisioning, Build/Archive, TestFlight, App Store Connect, App Privacy, Privacy Manifest, App Review guidelines, Crash Reporting/Observability, CI/CD, Release checklist, Hotfix, Versioning/Build numbers, Accessibility, Compliance | Trước và trong quá trình phát hành/vận hành |
| [`../mobile-integration.md`](../mobile-integration.md) | Hợp đồng API/WebSocket chung giữa client mobile và backend (định dạng, lỗi, realtime, bảo mật) — tham khảo khi cần | Khi tích hợp mạng/realtime |
| [`../websocket.md`](../websocket.md) | Lý thuyết WebSocket, heartbeat/ping-pong, reconnect/backoff, trạng thái kết nối, bảo mật | Khi cần hiểu sâu realtime |
| [`../api-security.md`](../api-security.md) | Nguyên tắc bảo mật API, xác thực/ủy quyền, rate limit, input validation, OWASP API Top 10 | Khi thiết kế tích hợp mạng an toàn |

**Thứ tự khuyến nghị:** `README` → `ios-basics` → `ios-advanced` → `ios-production`. Ưu tiên **học + code** thay vì đọc toàn bộ lý thuyết.

---

## 4. Lộ trình học

### 4.1 Từ số 0 (8 tuần)

| Tuần | Trọng tâm | Sản phẩm bàn giao | Mục tiêu |
|---|---|---|---|
| **1** | Swift cơ bản: biến/hằng, Optional, collection, control flow, hàm | Bộ bài tập CLI nhỏ (validate, filter, map) | Thành thạo cú pháp + tư duy type-safe |
| **2** | Struct/Class/Enum/Protocol, Closure, ARC/memory | Mô hình domain đơn giản (vd. `Product`, `Order`) với unit test | Hiểu value vs reference, ownership |
| **3** | Swift Concurrency cơ bản (`async/await`, `Task`, `MainActor`) + URLSession + Codable | Client tải danh sách từ API công khai, hiển thị log | Hiểu async flow, threading, JSON mapping |
| **4** | SwiftUI: State/Binding/Observable, List/Form/Navigation, Validation | Ứng dụng `Todo`/`Notes` đọc+tạo+cập nhật/xóa | Nắm state management cơ bản, navigation, form |
| **5** | Networking nâng cao: error handling, decoding, cancellation, retry đơn giản | Tách `NetworkClient`, `APIError`, mapping model | Thiết kế lớp networking tái sử dụng |
| **6** | Persistence: UserDefaults, FileManager, Keychain cơ bản; SwiftData/Core Data khái quát | Cache danh sách offline đơn giản + lưu cài đặt | Hiểu trade-offs lưu trữ cục bộ |
| **7** | Kiến trúc: MVVM, DI đơn giản, testable services | Refactor app theo feature-first + unit test cho ViewModel/Service | Code dễ mở rộng, dễ test |
| **8** | Production basics: signing, build/archive, checklist, lỗi thường gặp | Build archive local, rà soát signing & entitlements | Chuẩn bị quy trình phát hành cơ bản |

### 4.2 Đã biết OOP (4 tuần)

| Tuần | Trọng tâm | Ghi chú |
|---|---|---|
| **1** | Optional, value semantics, protocol-oriented, ARC, closure | Bỏ qua cú pháp lặp/biến nếu đã quen |
| **2** | Swift Concurrency, `MainActor`, `actor`, SwiftUI state, networking với URLSession | Tập trung vào khác biệt so với Java/C#/Kotlin/TS |
| **3** | Kiến trúc, DI, navigation, persistence, unit/UI test | Ưu tiên testable design |
| **4** | Signing, provisioning, TestFlight, Privacy Manifest, performance/accessibility, release checklist | Tập trung vào vận hành production |

**Nguyên tắc vàng:** Mỗi khái niệm phải dẫn đến **một thay đổi chạy được**. Đừng học Combine, TCA, Core Data cùng lúc — chọn **một** công cụ, ship, sau đó mở rộng.

---

## 5. Cài đặt môi trường

### 5.1 Xcode & Command Line Tools

```bash
# Cài Xcode từ Mac App Store hoặc Apple Developer Downloads
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -runFirstLaunch
xcodebuild -version && swift --version
```

Nếu chỉ cần compiler CLI:

```bash
xcode-select --install
```

### 5.2 Simulator

```bash
# Liệt kê simulator khả dụng
xcrun simctl list devices available

# Boot simulator
xcrun simctl boot "iPhone 16 Pro" && open -a Simulator

# Cài và chạy app (thay đổi đường dẫn/bundle ID phù hợp)
xcrun simctl install booted /path/to/YourApp.app
xcrun simctl launch booted com.example.yourapp

# Shutdown/reset khi gặp sự cố
xcrun simctl shutdown all
xcrun simctl erase "iPhone 16 Pro"
```

Tải runtime thêm tại **Xcode → Settings → Platforms**.

### 5.3 Swift Package Manager

```bash
# Tạo library package để học module hóa
mkdir ExampleKit && cd ExampleKit
swift package init --type library
swift build && swift test
```

Trong Xcode: **File → Add Package Dependencies...** để thêm remote package, hoặc dùng **local package** để tách module nội bộ.

### 5.4 Tạo project mới

1. **File → New → Project → iOS → App**
2. **Product Name:** `ExampleApp`, **Interface:** `SwiftUI`, **Language:** `Swift`
3. **Minimum Deployments:** `iOS 17.0` (hoặc cao hơn theo nhu cầu)
4. **Run** (⌘R) trên Simulator/thiết bị thật

### 5.5 Kiểm tra kết nối mạng local (nếu cần tích hợp API)

```bash
# Kiểm tra HTTP
curl -i https://api.example.com/health

# Kiểm tra WebSocket (vd. dùng websocat/wscat)
# websocat wss://echo.websocket.events
```

> ⚠️ Trên thiết bị thật, `localhost` **không** trỏ về máy Mac. Dùng IP LAN của Mac và đảm bảo cùng mạng Wi-Fi + tường lửa cho phép.

---

## 6. Cấu trúc project, module hoá và quy ước

### 6.1 Cấu trúc feature-first (khuyến nghị)

```text
ExampleApp/
├── App/                # Entry point (@main), AppDelegate/SceneDelegate (nếu có), DI root
├── Core/               # Shared: Models, Networking, Extensions, Utilities, Constants
├── DesignSystem/       # Colors, Typography, Spacing, Reusable Components
├── Features/           # Từng feature theo domain: Products/, Orders/, Settings/
│   ├── Products/
│   │   ├── Views/
│   │   ├── ViewModels/ (hoặc Stores/)
│   │   ├── Models/
│   │   └── Services/
└── Resources/          # Assets.xcassets, Localizable.xcstrings, InfoPlist.strings
```

**Lý do:** dễ scale, dễ tách module, giảm coupling, dễ tìm code theo nghiệp vụ thay vì theo loại file.

### 6.2 Quy ước đặt tên & tổ chức

| Quy ước | Áp dụng |
|---|---|
| **UpperCamelCase** | Type, Protocol, Enum case group, Struct/Class/Actor |
| **lowerCamelCase** | Biến, property, function, method, parameter |
| **Một type chính / file** | Tên file trùng tên type chính (vd. `ProductListViewModel.swift`) |
| **`private` mặc định** | Chỉ mở `internal`/`fileprivate` khi thực sự cần chia sẻ |
| **Tách UI model vs API model** | Tránh "leak" DTO ra toàn bộ View; mapping rõ ràng |
| **Feature-first > Layer-first** | Ưu tiên tổ chức theo tính năng/domain |
| **Immutability** | Ưu tiên `let`, dùng `struct` cho dữ liệu bất biến khi phù hợp |

### 6.3 Module hóa với SPM

Khi dự án lớn dần, cân nhắc tách thành local packages:

| Package | Mục đích |
|---|---|
| `CoreNetworking` | HTTP client, request/response, error, interceptor |
| `CorePersistence` | Keychain, File storage, SwiftData wrapper |
| `DesignSystem` | Component tái sử dụng, theme |
| `Domain` | Entity, UseCase, Protocol (giảm phụ thuộc framework) |
| `FeatureX` | Toàn bộ feature có thể build độc lập |

**Lợi ích:** build nhanh hơn, ranh giới rõ ràng, dễ test, dễ tái sử dụng.

---

## 7. Nguyên tắc thiết kế ứng dụng iOS

| Nguyên tắc | Giải thích thực tế |
|---|---|
| **KISS** | Giữ đơn giản. Tránh over-engineering trước khi có nhu cầu thật. |
| **YAGNI** | Chỉ thêm abstraction khi đã thấy pattern lặp lại >= 2-3 lần. |
| **Separation of Concerns** | View chỉ hiển thị, ViewModel/Store xử lý state/logic, Service/Repository xử lý dữ liệu. |
| **Single Source of Truth** | Mỗi trạng thái quan trọng chỉ có một nguồn chân lý (state holder). |
| **Unidirectional Data Flow** | Hành động -> cập nhật state -> UI render lại. Dễ debug, dễ dự đoán. |
| **Fail gracefully** | Luôn xử lý lỗi mạng/offline/timeout, hiển thị thông báo hữu ích, không crash. |
| **Offline-aware** | Cân nhắc cache, trạng thái kết nối, retry, đồng bộ khi có mạng. |
| **Accessibility-first** | Hỗ trợ Dynamic Type, VoiceOver, đủ contrast, hit target hợp lý. |
| **Security by design** | Không log secret/token, dùng Keychain, chứng thực HTTPS, tuân thủ nguyên tắc tối thiểu quyền. |
| **Performance-conscious** | Tránh work nặng trên main thread, lazy loading, image caching, đo bằng Instruments. |

---

## 8. Checklist môi trường

- [ ] **Xcode**: `xcodebuild -version` và `swift --version` đúng phiên bản.
- [ ] **Command Line Tools**: `xcode-select -p` trỏ đúng `/Applications/Xcode.app/Contents/Developer`.
- [ ] **Simulator**: Có runtime tương thích, boot/run thành công.
- [ ] **Thiết bị thật**: Kết nối được, trust device, build/run không lỗi signing.
- [ ] **Signing**: Team hiển thị đúng, Bundle ID duy nhất, entitlements phù hợp.
- [ ] **SPM**: Thêm/xóa/reset package không lỗi.
- [ ] **Git**: `.gitignore` bỏ qua `xcuserdata/`, `DerivedData/`, `*.xcuserstate`, `*.xcscmblueprint`, build artifacts.
- [ ] **Debug tools**: Biết dùng **Report Navigator** (⌘9), **Issue Navigator**, **Console**.
- [ ] **Instruments cơ bản**: Biết mở Time Profiler/Leaks để rà soát sơ bộ.
- [ ] **Mạng**: Nếu test local, biết dùng IP LAN thay `localhost` trên thiết bị thật.

---

## 9. Lỗi thường gặp

| Triệu chứng | Nguyên nhân khả dĩ | Cách xử lý |
|---|---|---|
| **`No signing certificate`** | Chưa thêm Apple ID/team hoặc thiếu chứng chỉ | **Xcode → Settings → Accounts** → thêm account, chọn Team, bật "Automatically manage signing". |
| **`Unable to boot simulator`** | Simulator trong trạng thái lỗi | `xcrun simctl shutdown all` → boot lại hoặc `Erase All Content and Settings`. |
| **`Could not resolve package dependencies`** | Cache SPM lỗi, mạng chậm/proxy | **File → Packages → Reset Package Caches** → thử lại. Kiểm tra network/proxy. |
| **`App Transport Security blocked`** | Gọi HTTP cleartext không được phép | Ưu tiên HTTPS. Chỉ cho phép local/network nội bộ với lý do rõ ràng trong `NSAppTransportSecurity`. |
| **`Unrecognized selector` / crash runtime** | Type mismatch, casting sai, IBOutlet nil | Kiểm tra Optional, casting an toàn (`as?`), lifecycle view/controller. |
| **Preview crash** | Thiếu mock/dependency trong `#Preview` | Inject mock, dùng environment object giả, tránh gọi network thực trong preview. |
| **Build chậm bất thường** | DerivedData lớn, nhiều module, indexing | Xóa `DerivedData`, kiểm tra build settings, cân nhắc module hóa. |
| **Ký build archive thất bại** | Provisioning/profile sai, entitlements không khớp | Kiểm tra App ID, entitlements, Distribution certificate/profile trong Xcode/App Store Connect. |

> 💡 **Mẹo:** Luôn đọc thông báo lỗi từ dưới lên. Nhiều khi nguyên nhân thật nằm ở dòng cảnh báo trước đó, không phải dòng cuối cùng.

---

## 10. Tài liệu tham khảo

### Chính thức của Apple
- [The Swift Programming Language](https://docs.swift.org/swift-book/) — Ngôn ngữ Swift đầy đủ, chuẩn xác nhất
- [Swift Concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) — `async/await`, `Task`, `actor`, structured concurrency
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui) — API, guides, sample
- [UIKit Documentation](https://developer.apple.com/documentation/uikit) — API, lifecycle, view/controller
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) — Thiết kế theo chuẩn Apple
- [Xcode Documentation](https://developer.apple.com/documentation/xcode) — Build, signing, debugging, testing
- [Swift Package Manager](https://www.swift.org/package-manager/) — Quản lý module/dependency
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/) — Phát hành, TestFlight, review
- [App Privacy Details](https://developer.apple.com/app-store/app-privacy/) — Quy định về quyền riêng tư
- [Privacy Manifest Files](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files) — Yêu cầu manifest privacy

### Bảo mật & Chất lượng
- [OWASP Mobile Application Security Verification Standard (MASVS)](https://mas.owasp.org/MASVS/) — Tiêu chuẩn bảo mật mobile
- [OWASP Mobile Security Testing Guide (MSTG)](https://mas.owasp.org/MSTG/) — Kiểm thử bảo mật thực tế

### Công cụ hữu ích
- [Instruments User Guide](https://developer.apple.com/documentation/instruments) — Profile performance/memory/leaks
- [URLSession Documentation](https://developer.apple.com/documentation/foundation/urlsession) — Networking
- [URLSessionWebSocketTask](https://developer.apple.com/documentation/foundation/urlsessionwebsockettask) — WebSocket

**Bắt đầu:** [`ios-basics.md`](./ios-basics.md). Sau khi hiểu vững nền tảng, chuyển sang [`ios-advanced.md`](./ios-advanced.md) và [`ios-production.md`](./ios-production.md).
