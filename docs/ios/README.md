# iOS — Từ Swift cơ bản đến ứng dụng production

> Bộ tài liệu cho kỹ sư xây dựng app iOS wedding guestbook: khách mời xem lời chúc,
> gửi RSVP và nhận tin mới realtime từ backend Bun + Hono + Supabase trong repo này.
> Nội dung đi từ Swift, SwiftUI/UIKit, networking, WebSocket, persistence đến kiến
> trúc, bảo mật, CI/CD và phát hành App Store.

Viết cho **Swift 5.9+ / 6.x**, Xcode 16+ (khuyến nghị 26.x), deployment target mẫu **iOS 17.0**. API
chỉ có trên iOS 18+ sẽ được ghi rõ và không dùng làm nền tảng.

---

## Mục lục

1. [Hệ sinh thái iOS](#1-hệ-sinh-thái-ios)
2. [Chọn native iOS hay Flutter](#2-chọn-native-ios-hay-flutter)
3. [Bản đồ tài liệu](#3-bản-đồ-tài-liệu)
4. [Lộ trình học](#4-lộ-trình-học)
5. [Cài đặt môi trường](#5-cài-đặt-môi-trường)
6. [Cấu trúc project và quy ước](#6-cấu-trúc-project-và-quy-ước)
7. [Checklist môi trường](#7-checklist-môi-trường)
8. [Lỗi thường gặp](#8-lỗi-thường-gặp)
9. [Tài liệu tham khảo](#9-tài-liệu-tham-khảo)

---

## 1. Hệ sinh thái iOS

| Thành phần | Vai trò | Ghi chú |
|---|---|---|
| **Swift** | Ngôn ngữ chính, ARC, concurrency | Swift 6.x; có thể giữ Swift 5 language mode khi migrate |
| **Xcode** | IDE, compiler, debugger, Instruments, simulator | Xcode 26.x; kiểm tra bản tối thiểu App Store chấp nhận |
| **iOS SDK** | Framework hệ thống | SDK iOS 26.x; dự án mới nên target iOS 17+ |
| **SwiftUI** | UI khai báo, state-driven | Đủ trưởng thành cho guestbook, form, list, animation |
| **UIKit** | UI imperative, nền tảng lâu năm | Cần cho camera, thư viện cũ, collection phức tạp |
| **SPM** | Quản lý dependency, module hóa | Ưu tiên hơn CocoaPods cho dự án mới |
| **TestFlight** | Phân phối beta | Cần App Store Connect; build beta hết hạn sau 90 ngày |
| **Apple Developer Program** | Phát hành, APNs, entitlements | 99 USD/năm |

**Khái niệm nền tảng:** **Bundle ID** là định danh reverse-DNS
(`com.example.guestbook`), gần như không đổi được sau khi phát hành.
**Provisioning profile** ghép certificate + App ID + thiết bị được phép chạy.
**Scheme** là cấu hình build/run/test; **target** là sản phẩm build ra.
**Simulator** chạy iOS giả lập trên Mac, không thay thế thiết bị thật.

> ⚠️ Simulator không có camera thật, push thật, Bluetooth; hành vi mạng/background
> cũng khác. Trước khi release, test ít nhất một iPhone thật, một mạng 4G và một
> Wi-Fi yếu.

## 2. Chọn native iOS hay Flutter

Cả hai đều làm được guestbook. Quyết định nên dựa trên **kỹ năng team**, **phạm vi
nền tảng** và **tuổi thọ sản phẩm**, không chỉ tốc độ dựng màn hình đầu tiên.

| Tiêu chí | Native iOS (SwiftUI) | Flutter |
|---|---|---|
| Hiệu năng | Tốt nhất, ít lớp trung gian | Rất tốt, có engine riêng |
| Độ native của UI | Chuẩn Apple, animation mượt | Tự vẽ UI, khó giống 100% |
| Chia sẻ code | Chỉ iOS | iOS + Android + web |
| Hệ sinh thái | Toàn bộ API Apple ngay ngày đầu | Plugin bên thứ ba, có độ trễ |
| Kích thước app | Nhỏ hơn | Lớn hơn |
| Hot reload | Preview/canvas | Rất mạnh |
| Phù hợp | App iOS-only, cần độ hoàn thiện cao | App đa nền tảng, team Dart |

**Chọn native iOS khi:** sản phẩm iOS-first; cần camera/AR/Watch/widget/App Clips
hoặc API iOS mới; cần animation, typography, gesture, accessibility chuẩn Apple;
team đã có iOS engineer.

**Chọn Flutter khi:** cần ship iOS + Android cùng lúc với một codebase; team mạnh
Dart; UI chủ yếu form/list/CRUD; thời gian ra mắt quan trọng hơn tối ưu từng pixel.

> 💡 Backend này là REST + WebSocket thuần nên hai client tích hợp giống nhau. Xem
> [`../flutter/README.md`](../flutter/README.md) và hợp đồng chung tại
> [`../mobile-integration.md`](../mobile-integration.md).

## 3. Bản đồ tài liệu

| Tài liệu | Nội dung | Khi nào đọc |
|---|---|---|
| [`ios-basics.md`](./ios-basics.md) | Swift, ARC, concurrency, Xcode, SwiftUI, UIKit, networking, WebSocket, persistence, testing, debug | Tuần 1–4 |
| [`ios-advanced.md`](./ios-advanced.md) | Kiến trúc, DI, Swift/Combine/SwiftUI nâng cao, offline-first, push, background, security, performance, SPM, CI | Tuần 5–8 |
| [`ios-production.md`](./ios-production.md) | Signing, archive, TestFlight, privacy, CI/CD, APNs, monitoring, release, ASO, incident | Trước release |
| [`../mobile-integration.md`](../mobile-integration.md) | Hợp đồng API/WebSocket dùng chung iOS + Flutter | Khi backend đổi contract |
| [`../websocket.md`](../websocket.md) | Lý thuyết WebSocket, heartbeat, reconnect, bảo mật | Khi cần hiểu sâu realtime |
| [`../api-security.md`](../api-security.md) | Auth, rate limit, OWASP API | Khi bật auth cho admin/RSVP |

**Thứ tự đọc:** README → basics → advanced → production → mobile-integration. Không
cần đọc hết lý thuyết trước khi code; mỗi tuần nên có một sản phẩm chạy được.

## 4. Lộ trình học

### 4.1 Tám tuần từ số 0

| Tuần | Chủ đề | Sản phẩm bàn giao |
|---|---|---|
| 1 | Swift, Optional, struct/class/enum, protocol, closure | CLT chạy 10 bài tập nhỏ; hiểu value/reference |
| 2 | ARC, async/await, MainActor, URLSession, Codable | CLI gọi `GET /api/messages/`, in 20 lời chúc |
| 3 | SwiftUI state, list, form, navigation, sheet | Guestbook đọc dữ liệu thật, pull-to-refresh |
| 4 | Form gửi lời chúc, validation, error handling, unit test | Gửi được `POST /api/messages`, có test |
| 5 | WebSocket, AsyncStream, reconnect, lifecycle | Tin mới tự hiện; reconnect sau khi mất mạng |
| 6 | MVVM, DI, persistence, offline cache | Tách store/service; cache 20 tin; chạy offline |
| 7 | Push, background refresh, security, performance | Nhận push giả lập; Instruments không leak rõ ràng |
| 8 | Signing, TestFlight, privacy manifest, CI | Build TestFlight nội bộ, checklist release xong |

### 4.2 Bốn tuần cho dev đã biết OOP

Giả định quen Java/C#/Kotlin/TypeScript, hiểu class, interface, generic, async.

| Tuần | Trọng tâm | Có thể bỏ qua |
|---|---|---|
| 1 | Optional, value semantics, protocol, closure, ARC | Cú pháp biến, vòng lặp |
| 2 | async/await, actor, SwiftUI state, networking | Lý thuyết concurrency tổng quát |
| 3 | WebSocket, MVVM, DI, testing, offline cache | UIKit cơ bản (đọc để biết) |
| 4 | Signing, TestFlight, privacy, performance | Lịch sử framework, Objective-C |

**Nguyên tắc:** mỗi khái niệm gắn với một thay đổi chạy được trên app. Đừng học
Combine, TCA và Core Data cùng lúc — chọn một hướng, ship, rồi mở rộng.

## 5. Cài đặt môi trường

### 5.1 Xcode và command line tools

```bash
# Cài Xcode từ Mac App Store hoặc developer.apple.com/download
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -runFirstLaunch
xcodebuild -version && swift --version
xcrun simctl list runtimes
```

Chỉ cần compiler/CLI: `xcode-select --install`.

### 5.2 Simulator

```bash
xcrun simctl list devices available
xcrun simctl boot "iPhone 16 Pro" && open -a Simulator
xcrun simctl install booted build/Debug-iphonesimulator/Guestbook.app
xcrun simctl launch booted com.example.guestbook
xcrun simctl shutdown all          # reset khi simulator kẹt
```

Tải thêm runtime tại **Xcode → Settings → Platforms**.

### 5.3 Swift Package Manager

```bash
mkdir GuestbookKit && cd GuestbookKit
swift package init --type library
swift build && swift test
```

Thêm dependency: **File → Add Package Dependencies…**. Manifest mẫu, local package và
cách tách module xem [`ios-advanced.md`](./ios-advanced.md) mục Modularization & SPM.

### 5.4 Signing cơ bản

1. **Xcode → Settings → Accounts**, thêm Apple ID.
2. Project → target → **Signing & Capabilities** → chọn Team.
3. Bật **Automatically manage signing**, đặt Bundle ID duy nhất.
4. Thêm capability khi cần: Push Notifications, Associated Domains, Background Modes.

> ⚠️ Không commit `.p12`, private key, provisioning profile hay `.env`. CI dùng App
> Store Connect API key và secret store (xem `ios-production.md`).

### 5.5 Tạo project

1. **File → New → Project → iOS → App**; Product Name `Guestbook`, Interface
   **SwiftUI**, Language **Swift**.
2. Chọn scheme `Guestbook`, simulator, bấm **Run** (⌘R).
3. **Target → General → Minimum Deployments** = iOS 17.0.

Chạy backend cùng máy:

```bash
bun install && bun run index.ts
curl -s http://localhost:3000/api/messages/ | head -c 400
```

## 6. Cấu trúc project và quy ước

### 6.1 Cây thư mục

```text
Guestbook/
├── App/                 # @main, AppConfig, dependency root
├── Features/Guestbook/  # View, Store, MessageRow, MessageFormView
├── Features/RSVP/
├── Core/                # Models, Networking, Realtime, Persistence
├── DesignSystem/        # màu, font, spacing, component
├── Resources/           # Assets.xcassets, Localizable.xcstrings
└── Tests/               # GuestbookTests, GuestbookUITests
```

### 6.2 Quy ước

| Quy ước | Áp dụng |
|---|---|
| `UpperCamelCase` cho type, `lowerCamelCase` cho property/hàm | Toàn bộ Swift |
| Một type chính / file, tên file trùng type | `GuestbookStore.swift` |
| Feature-first, không layer-first | `Features/Guestbook` thay vì `Views/` rải rác |
| `private` mặc định, mở `internal` khi cần | Giảm surface area, dễ refactor |
| Không force unwrap ngoài hằng compile-time | `guard let`, `if let`, throw |
| API model tách khỏi UI model khi phình | `GuestMessage` vs `MessageRowModel` |
| Async UI update qua `@MainActor` | Tránh publish từ background thread |

### 6.3 SwiftUI hay UIKit?

SwiftUI cho toàn bộ app guestbook vì state-driven, ít code và accessibility tốt.
Bọc UIKit khi cần (`UIViewControllerRepresentable`) cho camera, mail composer, AR,
hoặc thư viện chưa có bản SwiftUI. UIKit vẫn kiểm soát tốt hơn với list cực lớn và
cell phức tạp, nhưng đổi lại nhiều boilerplate. Không trộn hai kiến trúc UI trong
cùng màn hình nếu không có lý do rõ ràng.

## 7. Checklist môi trường

- [ ] `xcodebuild -version` và `swift --version` chạy đúng.
- [ ] `xcode-select -p` trỏ `/Applications/Xcode.app/Contents/Developer`.
- [ ] Có iOS simulator runtime, boot được.
- [ ] Apple ID đã thêm, Team hiển thị trong Signing & Capabilities.
- [ ] Project build/run trên simulator không có warning signing.
- [ ] Backend chạy `http://localhost:3000`; `curl /api/messages/` trả JSON.
- [ ] `ws://localhost:3000/ws` kết nối được bằng `wscat`.
- [ ] `.gitignore` bỏ qua `xcuserdata/`, `DerivedData/`, `*.xcuserstate`, `.env`.
- [ ] Biết reset simulator: **Device → Erase All Content and Settings**.

## 8. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `No signing certificate "iOS Development"` | Chưa thêm Apple ID/team | Settings → Accounts, chọn Team, bật automatic signing |
| `Unable to boot device in current state` | Simulator đã boot | `xcrun simctl shutdown all` rồi boot lại |
| Package yêu cầu platform cao hơn target | Deployment target thấp | Nâng target hoặc hạ version package |
| `Could not resolve packages` | Mạng/proxy/cache SPM | **File → Packages → Reset Package Caches** |
| ATS blocked cleartext HTTP | Gọi `http://` trên thiết bị | Dùng HTTPS; dev local thêm `NSAllowsLocalNetworking` |
| WebSocket 400 hoặc đóng ngay | Sai path/backend không chạy | Kiểm tra `ws://localhost:3000/ws` bằng `wscat` |
| `localhost` không tới được trên iPhone | `localhost` là chính điện thoại | Dùng IP LAN của Mac, cùng Wi-Fi, mở firewall |
| Dữ liệu cũ còn sau khi sửa | App cài đè, cache còn | Xóa app khỏi simulator hoặc erase |
| Preview crash, app vẫn chạy | Preview thiếu environment | Inject mock trong `#Preview` |

> 💡 Đọc **Report navigator** (⌘9) từ dòng cuối, đối chiếu target/configuration.
> Phần lớn lỗi signing/build đến từ sai scheme hoặc sai destination.

## 9. Tài liệu tham khảo

- **The Swift Programming Language**: https://docs.swift.org/swift-book/
- **Swift Concurrency**: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/
- **SwiftUI**: https://developer.apple.com/documentation/swiftui
- **UIKit**: https://developer.apple.com/documentation/uikit
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Xcode**: https://developer.apple.com/documentation/xcode
- **Swift Package Manager**: https://www.swift.org/package-manager/
- **App Store Connect Help**: https://developer.apple.com/help/app-store-connect/
- **URLSessionWebSocketTask**: https://developer.apple.com/documentation/foundation/urlsessionwebsockettask
- **OWASP MASVS**: https://mas.owasp.org/MASVS/
- **WebSocket trong repo**: [`../websocket.md`](../websocket.md)

*Bắt đầu với [`ios-basics.md`](./ios-basics.md). Nếu đã có kinh nghiệm iOS, đọc
nhanh phần 1–4 rồi chuyển sang [`ios-advanced.md`](./ios-advanced.md).*
