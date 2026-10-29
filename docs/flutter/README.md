# Flutter cho Wedding Guestbook — Bộ tài liệu mobile

> Hướng dẫn thực hành Flutter từ con số 0 đến production, gắn trực tiếp với backend
> wedding guestbook trong repo (`/api/messages`, `/ws`). Ví dụ dùng Dart 3.x/Flutter 3.x
> ổn định; API/package có rủi ro thay đổi đều ghi rõ điều kiện sử dụng.

---

## Mục lục

1. [Flutter là gì?](#1-flutter-là-gì)
2. [Kiến trúc Flutter](#2-kiến-trúc-flutter)
3. [Ưu, nhược điểm và khi nào chọn Flutter](#3-ưu-nhược-điểm-và-khi-nào-chọn-flutter)
4. [Bản đồ tài liệu](#4-bản-đồ-tài-liệu)
5. [Lộ trình học 7 tuần](#5-lộ-trình-học-7-tuần)
6. [Lộ trình cho dev đã biết OOP](#6-lộ-trình-cho-dev-đã-biết-oop)
7. [Cài đặt nhanh](#7-cài-đặt-nhanh)
8. [Tạo project và chạy lần đầu](#8-tạo-project-và-chạy-lần-đầu)
9. [Cấu trúc project mặc định](#9-cấu-trúc-project-mặc-định)
10. [Quy ước code và package](#10-quy-ước-code-và-package)
11. [Hot reload và vòng lặp phát triển](#11-hot-reload-và-vòng-lặp-phát-triển)
12. [Checklist môi trường](#12-checklist-môi-trường)
13. [Lỗi thường gặp khi setup](#13-lỗi-thường-gặp-khi-setup)
14. [Tài liệu tham khảo](#14-tài-liệu-tham-khảo)

---

## 1. Flutter là gì?

Flutter là **UI toolkit mã nguồn mở** của Google: một codebase Dart build app cho
Android, iOS, web và desktop. Khác React Native, Flutter **tự vẽ toàn bộ UI** bằng
engine riêng thay vì map sang widget native. Kiến trúc: app Dart → framework (widget,
layout, animation) → engine C/C++ (Impeller/Skia, Dart VM, text, I/O) → embedder
(Kotlin/Swift/C++) quản lý vòng đời và input.

Trong dự án wedding, Flutter phù hợp cho **guestbook app** (xem lời chúc, gửi RSVP,
nhận tin realtime), **photo booth/slideshow** trên tablet tại tiệc, và **app nội bộ**
cho bride/groom kiểm duyệt.

---

## 2. Kiến trúc Flutter

| Thành phần | Ngôn ngữ | Vai trò |
|---|---|---|
| Framework | Dart | Widget, layout, animation, gesture, Material/Cupertino |
| Engine | C/C++ | Render (Impeller/Skia), Dart runtime, text shaping, I/O |
| Embedder | Kotlin/Swift/C++ | Tích hợp engine vào app host, vòng đời, input |
| Dart VM/AOT | Dart | JIT khi debug, AOT khi release, GC generational |

Hệ quả: UI nhất quán trên mọi thiết bị, nhưng **mọi thứ là widget** — muốn tối ưu
hiệu năng phải hiểu widget tree và render pipeline. Dart có sound null safety,
async/await, isolate, mixin, extension; cú pháp gần Kotlin/TypeScript nên dev OOP
chuyển sang nhanh.

---

## 3. Ưu, nhược điểm và khi nào chọn Flutter

**Ưu điểm:** một codebase cho Android/iOS; hot reload; Material 3 đầy đủ; animation
mạnh; render 60/120 fps nếu không rebuild thừa; hệ sinh thái package lớn (`dio`,
`go_router`, `riverpod`, `drift`, `freezed`).

**Nhược điểm:** app size lớn hơn native (+8–20 MB); tính năng hệ thống mới phải chờ
plugin/platform channel; không "native feel" tuyệt đối; dễ lạm dụng `setState`.

So với native, Flutter chia sẻ code tốt hơn nhưng tích hợp native sâu kém hơn; so với
React Native, hiệu năng UI ổn định hơn nhưng app size lớn hơn. Guestbook chỉ có list +
form + realtime → Flutter ra bản Android/iOS trong một sprint; nếu cần camera/AR/HealthKit
đặc thù, cân nhắc native hoặc platform channel.

---

## 4. Bản đồ tài liệu

| Tài liệu | Nội dung | Khi nào đọc |
|---|---|---|
| [`flutter-basics.md`](./flutter-basics.md) | Dart, widget, layout, form, state, HTTP, WebSocket, testing | Tuần 1–3 |
| [`flutter-advanced.md`](./flutter-advanced.md) | Kiến trúc, Riverpod/Bloc, DI, routing, offline, perf, CI | Tuần 4–6 |
| [`flutter-production.md`](./flutter-production.md) | Flavors, signing, store, push, monitoring, release | Trước phát hành |
| [`../ios/README.md`](../ios/README.md) | Bộ tài liệu iOS native | Khi cần đối chiếu |
| [`../mobile-integration.md`](../mobile-integration.md) | Hợp đồng API, auth, lỗi chung mobile/backend | Trước khi code API client |

> 💡 Bộ tài liệu iOS và hợp đồng tích hợp mobile ↔ backend đã có trong repo. Tài liệu
> backend liên quan: [`../websocket.md`](../websocket.md),
> [`../api-security.md`](../api-security.md) và [`../api/README.md`](../api/README.md).

---

## 5. Lộ trình học 7 tuần

| Tuần | Chủ đề | Sản phẩm |
|---|---|---|
| 1 | Dart, widget, layout, theme | Static guestbook screen với dữ liệu giả |
| 2 | Form, navigation, state cơ bản | Form RSVP + validation + chuyển màn hình |
| 3 | HTTP, JSON, FutureBuilder, WebSocket | Kết nối `/api/messages` và `/ws` |
| 4 | Kiến trúc, Riverpod/Bloc, DI | Tách repository, state management |
| 5 | Routing, offline cache, codegen | Deep link + cache + model freezed |
| 6 | Testing, performance, CI | Unit/widget test + GitHub Actions |
| 7 | Release, signing, store, monitoring | Build nội bộ + checklist phát hành |

Mỗi tuần cần **một demo chạy được**, không chỉ đọc.

---

## 6. Lộ trình cho dev đã biết OOP

Nếu đã quen Java/Kotlin/C#/TypeScript, dành một tuần cho các mốc sau:

1. Cú pháp Dart, null safety, collection, extension — bỏ thói quen `new`, hiểu `final`/`const`.
2. Widget tree, Stateless/Stateful, lifecycle — `build()` phải pure, không side effect.
3. Layout, constraint, `Expanded`, `ListView` — "constraints go down, sizes go up".
4. Form, controller, focus, navigation — `TextEditingController` phải `dispose()`.
5. Async, Future/Stream, HTTP — Dart event loop đơn luồng.
6. State management + kiến trúc — chọn Riverpod **hoặc** Bloc; test, DevTools, build release.

> 💡 Khác biệt lớn nhất với OOP truyền thống: **UI là hàm của state**. Đừng giữ widget
> trong biến rồi mutate; đổi state và để framework rebuild.

---

## 7. Cài đặt nhanh

```bash
git clone https://github.com/flutter/flutter.git -b stable ~/development/flutter
export PATH="$PATH:$HOME/development/flutter/bin"
flutter --version && flutter doctor -v
```

Windows dùng installer hoặc `winget install Flutter`. Ghim phiên bản bằng FVM:
`dart pub global activate fvm && fvm install 3.24.0 && fvm use 3.24.0`.

**Android:** cài Android Studio (SDK, Platform Tools, Build Tools), tạo emulator API
34+, rồi `flutter doctor --android-licenses`. **iOS (macOS):** cài Xcode, nhận license,
chọn command line tools, cài CocoaPods (`brew install cocoapods`). **IDE:** VS Code +
extension Dart/Flutter hoặc Android Studio + plugin Flutter; bật format on save.

---

## 8. Tạo project và chạy lần đầu

```bash
flutter create --org com.example --project-name wedding_guestbook wedding_guestbook
cd wedding_guestbook && flutter pub get && flutter devices
flutter run -d <device-id> --dart-define=API_BASE_URL=http://10.0.2.2:3000 \
  --dart-define=WS_URL=ws://10.0.2.2:3000/ws
```

| Môi trường | Base URL |
|---|---|
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Thiết bị thật | `http://<LAN-IP>:3000` (cùng Wi-Fi) |
| Production | `https://api.example.com` |

> ⚠️ Android 9+ chặn cleartext HTTP. Khi dev, chỉ bật `usesCleartextTraffic` trong
> **debug manifest**; production luôn dùng HTTPS/WSS.

---

## 9. Cấu trúc project mặc định

```text
wedding_guestbook/
├── android/ ios/ web/ ...   # native host, manifest, Podfile
├── lib/main.dart            # entry point
├── test/ integration_test/  # unit, widget, e2e
├── assets/{images,fonts}/
└── pubspec.yaml, analysis_options.yaml
```

Quy ước: `lib/` chỉ chứa code app; file `snake_case.dart`, class `PascalCase`, biến/hàm
`camelCase`; mỗi feature có thư mục riêng khi app lớn; không commit `build/`,
`.dart_tool/`, `ios/Pods/`, file `.jks`/`.p12`.

---

## 10. Quy ước code và package

```yaml
name: wedding_guestbook
environment:
  sdk: ">=3.4.0 <4.0.0"
dependencies:
  flutter: {sdk: flutter}
  http: ^1.2.2
  web_socket_channel: ^2.4.5
dev_dependencies:
  flutter_test: {sdk: flutter}
  flutter_lints: ^4.0.0
flutter:
  uses-material-design: true
```

Bật lint nghiêm trong `analysis_options.yaml`: kế thừa `flutter_lints`, thêm
`avoid_print`, `prefer_const_constructors`, `use_super_parameters`.

| Loại | Đặc điểm | Ví dụ |
|---|---|---|
| Dart package | Chỉ Dart, chạy mọi nền tảng | `intl`, `collection`, `freezed` |
| Plugin | Có code native Android/iOS | `shared_preferences`, `firebase_messaging` |

Trước khi thêm package, kiểm tra pub points, maintenance, license, issue mở và nền
tảng hỗ trợ. Với guestbook, giữ bộ package nhỏ: HTTP, WebSocket, storage, routing,
state management.

---

## 11. Hot reload và vòng lặp phát triển

| Phím (terminal) | Tác dụng |
|---|---|
| `r` | Hot reload — giữ state, rebuild widget |
| `R` | Hot restart — reset state, chạy lại `main()` |
| `p` / `o` / `q` | Debug paint / chuyển device / thoát |

Hot reload không áp dụng cho `main()`, thêm field, native code hoặc asset đã bundle —
cần restart. Giữ `flutter run` và `flutter test --watch` ở hai terminal để phản hồi nhanh.

---

## 12. Checklist môi trường

- [ ] `flutter --version` đúng `stable`, `flutter doctor -v` không còn lỗi `✗`.
- [ ] `flutter devices` thấy emulator/simulator.
- [ ] Android SDK Platform 34+ và Build Tools đã cài.
- [ ] CocoaPods chạy được trên macOS.
- [ ] IDE nhận plugin Dart/Flutter, autocomplete hoạt động.
- [ ] App mẫu `flutter create` chạy được trên cả hai nền tảng mục tiêu.
- [ ] `flutter test` pass, emulator gọi được backend, Git ignore đúng.

---

## 13. Lỗi thường gặp khi setup

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `cmdline-tools component is missing` | Thiếu command line tools | SDK Manager → SDK Tools → cài |
| `Android license status unknown` | Chưa accept license | `flutter doctor --android-licenses` |
| `CocoaPods not installed` | Chưa cài pod/Ruby sai | `brew install cocoapods` |
| `Signing ... error` | Thiếu team/provisioning | Xcode → Signing & Capabilities → chọn Team |
| `Connection refused` | Android emulator dùng `localhost` | Đổi sang `10.0.2.2` |
| `errno 111` | Server chưa chạy/firewall | Chạy `bun run index.ts`, kiểm tra LAN IP |
| `Cleartext HTTP not permitted` | Android chặn HTTP | Dùng HTTPS hoặc debug manifest |
| `Version solving failed` | Xung đột constraint | Đọc lỗi, nâng SDK hoặc `flutter pub upgrade` |

---

## 14. Tài liệu tham khảo

- Flutter Get started: https://docs.flutter.dev/get-started
- Flutter architecture overview: https://docs.flutter.dev/resources/architectural-overview
- Dart language tour: https://dart.dev/language
- Flutter cookbook: https://docs.flutter.dev/cookbook
- Material 3: https://m3.material.io/
- Flutter DevTools: https://docs.flutter.dev/tools/devtools/overview

---

*Đọc tiếp [`flutter-basics.md`](./flutter-basics.md) để bắt đầu viết widget đầu tiên.*
