# Flutter — Bộ tài liệu mobile

> Hướng dẫn thực hành Flutter từ con số 0 đến production với cách tiếp cận trung lập
> theo domain (orders/products/customers/todo/notes). Tài liệu tập trung vào nguyên lý,
> trade-off và thực hành vững chắc. Sử dụng Dart 3.x/Flutter 3.x ổn định; mọi API/package
> có rủi ro thay đổi đều nêu rõ điều kiện sử dụng.

Đây là **điểm vào** của bộ tài liệu Flutter trong repo. Nếu bạn mới bắt đầu, đọc tuần tự
từ mục 1 đến mục 9, sau đó mở các file chuyên sâu theo bản đồ ở mục 4. Nếu đã có kinh
nghiệm mobile, đọc mục 1–3 để nắm trade-off rồi đi thẳng vào mục 7–12.

> 📌 Tài liệu không cố gắng thay thế docs chính thức. Mục tiêu là giúp bạn ra quyết định
> đúng, tránh lỗi setup tốn thời gian và biết **khi nào không nên dùng** một giải pháp.

---

## Mục lục

1. [Flutter là gì?](#1-flutter-là-gì)
2. [Kiến trúc Flutter](#2-kiến-trúc-flutter)
3. [Ưu, nhược điểm và khi nào chọn Flutter](#3-ưu-nhược-điểm-và-khi-nào-chọn-flutter)
4. [Bản đồ tài liệu](#4-bản-đồ-tài-liệu)
5. [Lộ trình học 7 tuần](#5-lộ-trình-học-7-tuần)
6. [Lộ trình cho dev đã biết OOP](#6-lộ-trình-cho-dev-đã-biết-oop)
7. [Cài đặt chi tiết](#7-cài-đặt-chi-tiết)
8. [Tạo project và chạy lần đầu](#8-tạo-project-và-chạy-lần-đầu)
9. [Cấu trúc project](#9-cấu-trúc-project)
10. [Quy ước code và package](#10-quy-ước-code-và-package)
11. [Hot reload và vòng lặp phát triển](#11-hot-reload-và-vòng-lặp-phát-triển)
12. [Kiểm tra chất lượng: analyze, format, lint](#12-kiểm-tra-chất-lượng-analyze-format-lint)
13. [Checklist môi trường](#13-checklist-môi-trường)
14. [Lỗi thường gặp khi setup](#14-lỗi-thường-gặp-khi-setup)
15. [Bảo mật cơ bản](#15-bảo-mật-cơ-bản)
16. [Tài liệu tham khảo](#16-tài-liệu-tham-khảo)

---

## 1. Flutter là gì?

Flutter là **UI toolkit mã nguồn mở** của Google: một codebase Dart dùng để build ứng
dụng cho Android, iOS, web, desktop và embedded. Khác với cách map widget sang native,
Flutter **tự vẽ toàn bộ UI** bằng engine riêng. Kiến trúc tổng quan: app Dart →
framework (widget, layout, animation, gesture) → engine C/C++ (Impeller/Skia, Dart
runtime, text shaping, I/O) → embedder (Kotlin/Swift/C++/...) quản lý vòng đời, input
và tích hợp hệ thống.

Flutter phù hợp cho hầu hết ứng dụng đa nền tảng: danh sách, form, điều hướng phức
tạp, offline/cache, realtime, cùng với khả năng tích hợp native sâu khi cần qua platform
channel/FFI.

### 1.1 Flutter là gì — và không phải là gì

| Flutter **là** | Flutter **không phải** |
|---|---|
| UI toolkit + SDK + toolchain đa nền tảng | Một ngôn ngữ lập trình (ngôn ngữ là Dart) |
| Framework tự render bằng engine riêng | Lớp wrapper WebView hay “web app đóng gói” |
| Tập hợp widget, layout, animation, gesture | Hệ điều hành hoặc runtime thay thế Android/iOS |
| Công cụ build AOT cho release | Giải pháp “write once, run everywhere” tuyệt đối |
| Hệ sinh thái package trên pub.dev | Công cụ code-push/OTA cập nhật logic tức thời |

> ⚠️ Flutter **không miễn phí** phần tích hợp nền tảng. Mọi tính năng mới của iOS/Android
> vẫn cần plugin, platform channel hoặc code native. Ngân sách cho phần native integration
> vẫn phải có, chỉ là nhỏ hơn so với làm hai app native.

### 1.2 Nền tảng hỗ trợ và mức độ trưởng thành

| Nền tảng | Trạng thái | Điểm cần lưu ý |
|---|---|---|
| Android | Ổn định, phổ biến nhất | Nhiều phiên bản OS/thiết bị; test trên máy thật yếu |
| iOS | Ổn định | Phụ thuộc Xcode/CocoaPods; theo dõi quy định App Store |
| Web | Ổn định cho app nội bộ/dashboard | Bundle lớn, SEO và accessibility khác web native |
| Windows/macOS/Linux | Ổn định nhưng plugin ít hơn mobile | Cần cấu hình build native, ký và đóng gói riêng |
| Embedded/kiosk | Hệ sinh thái cộng đồng | Không kỳ vọng “cắm là chạy” như mobile |

### 1.3 Thuật ngữ cần nắm ngay

| Thuật ngữ | Hiểu ngắn gọn |
|---|---|
| Widget | Mô tả UI bất biến (immutable); cấu hình, không phải “control” mutable |
| Element | Instance của widget trong cây; giữ liên kết widget ↔ render object |
| RenderObject | Đối tượng thực hiện layout và paint |
| Engine | Lõi C/C++: render, text, runtime Dart, I/O |
| Embedder | Cầu nối engine với Android/iOS/desktop |
| Impeller | Renderer mới của Flutter, thay dần Skia |
| Isolate | Đơn vị concurrency có heap riêng, giao tiếp bằng message |
| Platform channel | Cầu nối Dart ↔ code native qua message |
| FFI | Gọi thư viện C/C++ trực tiếp từ Dart |

> 💡 Nếu chỉ nhớ một câu: **Flutter vẽ UI của chính nó, còn Dart chạy logic của bạn**.
> Mọi vấn đề hiệu năng thường quy về widget tree, rebuild, layout hoặc tải dữ liệu.

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

### 2.1 Ba tầng: framework, engine, embedder

**Framework (Dart).** Chứa `Widget`, `Element`, `RenderObject`, hệ layout, animation,
gesture, Material/Cupertino, `MediaQuery`, `Navigator`, `Scrollable`. Đây là nơi bạn
làm việc hằng ngày. Framework chạy trên **UI thread** của Dart.

**Engine (C/C++).** Rasterize frame (Impeller/Skia), text shaping/layout, Dart
runtime/VM + GC, I/O/network/image decode, ghép layer thành scene và đưa lên GPU.
**Embedder (native).** Tạo `FlutterEngine`, quản lý vòng đời, input, accessibility,
platform view, lifecycle và kết nối window system; khác nhau theo nền tảng nhưng
dùng chung engine.

> 📌 Engine được biên dịch sẵn cho từng kiến trúc/ABI. Vì vậy build release cần
> quan tâm `arm64-v8a`, `armeabi-v7a`, `x86_64` và cách Play Store split APK/ABI.

### 2.2 Ba cây: Widget, Element, RenderObject

| Cây | Vai trò | Vòng đời |
|---|---|---|
| Widget | Mô tả cấu hình UI, bất biến | Tạo lại mỗi lần `build()` |
| Element | Instance bền vững, quản lý vị trí trong cây | Tạo/mount/update/unmount |
| RenderObject | Layout, paint, hit-test | Tạo bởi RenderObjectWidget |

Khi state đổi, Flutter gọi `build()`, so sánh widget mới/cũ và **reconcile** element.
Nếu `runtimeType` và `key` phù hợp, element được tái sử dụng; ngược lại bị hủy và tạo
mới. Vì vậy:

- `const` widget giúp bỏ qua rebuild không cần thiết.
- `Key` cần khi danh sách thay đổi thứ tự, thêm/xóa phần tử có state.
- `BuildContext` là vị trí của element trong cây, không phải “global app context”.

> ⚠️ Không lưu widget vào biến rồi mutate. Widget là ảnh chụp của state tại thời điểm
> build; sửa state và để framework rebuild.

### 2.3 Rendering pipeline: build → layout → paint → composite

Mỗi frame trải qua các pha:

1. **Build**: chạy `build()` trên các element bị dirty, tạo/cập nhật widget.
2. **Layout**: tính constraint từ trên xuống, trả size từ dưới lên
   (“constraints go down, sizes go up”).
3. **Paint**: tạo display list/layer cho từng render object.
4. **Composite**: ghép layer thành scene, chuẩn bị cho GPU.
5. **Rasterize**: GPU vẽ scene lên surface.

Ngân sách frame: ~16.7 ms cho 60 fps, ~8.3 ms cho 120 fps. Jank thường do `setState`
quá cao, tạo object/parse JSON trong `build()`, `ListView` không builder, `Opacity`/
`Clip`/blur lặp lại hoặc layout scroll sai.

```dart
@override
Widget build(BuildContext context) {
  return ListView.builder(
    itemCount: items.length,
    itemBuilder: (context, index) => ItemTile(item: items[index]),
  );
}
```

> 💡 Dùng `RepaintBoundary` có chọn lọc cho animation độc lập, không bọc mọi widget.
> Bọc tràn lan làm tăng layer, tốn memory và có thể chậm hơn.

### 2.4 Impeller và Skia

| Tiêu chí | Impeller | Skia |
|---|---|---|
| Thiết kế | Renderer mới, shader biên dịch trước | Renderer lâu năm, linh hoạt |
| Jank do compile shader | Giảm đáng kể | Có thể gặp lần đầu |
| Độ chín | Đang là mặc định ở nhiều nền tảng | Rất chín, vẫn là fallback |
| Platform view | Có thể khác hành vi | Hỗ trợ rộng |
| Kiểm soát | `--enable-impeller` / `--no-enable-impeller` | Tùy phiên bản |

Impeller là mặc định trên iOS và Android mới trong các bản Flutter 3.2x; Skia vẫn tồn
tại làm fallback và có thể cần cho thiết bị cũ hoặc một số platform view. **Luôn kiểm
tra release notes của đúng phiên bản bạn dùng** thay vì giả định theo bài viết cũ.

> ⚠️ Tắt Impeller (`--no-enable-impeller`) chỉ là biện pháp tạm thời để cô lập lỗi.
> Nếu gặp lỗi render, ghi lại thiết bị, phiên bản OS, GPU, đoạn UI và thử trên cả
> Impeller/Skia trước khi kết luận.

### 2.5 Dart VM: JIT, AOT, GC và isolate

| Chế độ | Khi nào | Đặc điểm |
|---|---|---|
| JIT | Debug, `flutter run` | Có hot reload, chậm hơn, không tối ưu release |
| AOT | Release/profile | Biên dịch native trước, không hot reload |
| Kernel | Trung gian | Dùng trong debug/compile pipeline |

**Garbage collector** của Dart là generational: vùng young thu gom nhanh (scavenger),
vùng old dùng mark-sweep. GC tự động, nhưng allocation quá nhiều trong `build()` hoặc
giữ reference lớn sẽ tạo áp lực bộ nhớ. Giảm allocation bằng `const`, tái sử dụng
object, tránh closure/parse lặp lại.

**Isolate** có heap riêng, không chia sẻ mutable state. Giao tiếp qua `SendPort`/
`ReceivePort`. Dùng isolate cho parse JSON lớn, xử lý ảnh, tính toán nặng; không dùng
cho tác vụ quá nhỏ vì chi phí spawn/message.

> 📌 UI thread của Dart là single-threaded. Một hàm đồng bộ chạy lâu sẽ chặn cả UI,
> kể cả khi bạn dùng `Future` nhưng không thực sự nhường event loop.

> 📌 Platform channel/FFI là cầu nối native: MethodChannel/EventChannel cho method và
> stream, Pigeon sinh code type-safe, `dart:ffi` gọi C/C++. Chúng đều có overhead, nên
> batch dữ liệu thay vì gọi hàng nghìn lần mỗi frame.

---

## 3. Ưu, nhược điểm và khi nào chọn Flutter

**Ưu điểm:** một codebase cho Android/iOS; hot reload; Material 3 đầy đủ; animation
mạnh; render 60/120 fps nếu không rebuild thừa; hệ sinh thái package lớn (`dio`,
`go_router`, `riverpod`, `drift`, `freezed`).

**Nhược điểm:** app size lớn hơn native (+8–20 MB); tính năng hệ thống mới phải chờ
plugin/platform channel; không “native feel” tuyệt đối; dễ lạm dụng `setState`.

So với native, Flutter chia sẻ code tốt hơn nhưng tích hợp native sâu kém hơn; so với
React Native, hiệu năng UI ổn định hơn nhưng app size lớn hơn. Guestbook chỉ có list +
form + realtime → Flutter ra bản Android/iOS trong một sprint; nếu cần camera/AR/HealthKit
đặc thù, cân nhắc native hoặc platform channel.

### 3.1 So sánh Flutter với native, React Native và KMP

| Tiêu chí | Flutter | Native | React Native | KMP |
|---|---|---|---|---|
| Ngôn ngữ | Dart | Kotlin/Swift | TypeScript/JS | Kotlin (+ Swift cho iOS) |
| Chia sẻ UI | Gần như toàn bộ | Không | Phần lớn, qua native component | Tùy chọn (Compose Multiplatform) |
| Render | Engine tự vẽ | Native UI | Native view + Fabric/JSI | Native hoặc Compose |
| Hiệu năng UI | Ổn định, phụ thuộc rebuild | Cao nhất, sát nền tảng | Tốt, phụ thuộc kiến trúc | Cao, đặc biệt phần logic |
| App size | Trung bình–lớn | Nhỏ nhất | Trung bình | Trung bình |
| Tích hợp native sâu | Tốt qua channel/FFI | Tốt nhất | Tốt, hệ sinh thái lớn | Rất tốt trên Android, cần interop iOS |
| Hệ sinh thái | Lớn, tăng nhanh | Lớn nhất | Lớn nhất về JS | Đang phát triển |
| Hot reload | Có (debug) | Không đầy đủ | Có | Hạn chế |
| Web/desktop | Có, nhưng khác mobile | Riêng từng nền tảng | Web qua React Native Web | Hạn chế |
| Đường cong học | Trung bình | Cao nếu làm 2 nền tảng | Thấp với dev web | Trung bình–cao |

Đọc bảng theo bối cảnh: **React Native** không còn chỉ là “bridge” (Fabric/TurboModules/
JSI đã đổi mô hình hiệu năng); **KMP** mạnh nhất khi chia sẻ logic, UI có thể vẫn native;
**Native** thắng khi cần hệ sinh thái/accessibility/tính năng OS mới hoặc hiệu năng cực đoan.

> 📌 Không chọn framework chỉ vì “hot”. Chọn theo: kỹ năng đội, thời gian ra thị trường,
> yêu cầu native, ngân sách bảo trì 2–3 năm và chi phí tuyển dụng.

### 3.2 Khi nào **KHÔNG** nên dùng Flutter

- **Game 3D/AR/VR chuyên sâu**: dùng Unity/Unreal/ARKit/ARCore; Flutter chỉ phù hợp UI phụ.
- **App cực nhỏ hoặc chỉ một nền tảng**: lợi ích cross-platform thấp, vẫn chịu thêm runtime.
- **Phụ thuộc tính năng OS mới ngay ngày đầu**: plugin có thể chậm hơn native.
- **Tích hợp sâu**: home screen widget, watchOS/tvOS, CarPlay/Android Auto, background
  service dài hạn, extension phức tạp — cần đánh giá kỹ.
- **Cần “native feel”/accessibility đặc thù hoặc đội native mạnh**: native có thể rẻ hơn dài hạn.
- **Cần SEO mạnh, site content-heavy**: cân nhắc Next.js/Astro thay vì Flutter web.

> ⚠️ “Không nên dùng” không có nghĩa “không thể”. Nhiều app lớn vẫn dùng Flutter cho
> 90% UI và native cho 10% còn lại. Câu hỏi đúng là: **phần nào nên native?**
>
> ⚠️ Đừng đánh giá Flutter bằng một app demo. Hãy thử một luồng thật có list dài,
> form, ảnh, offline, push và đo trên thiết bị yếu nhất trong tập người dùng.

### 3.3 App size, startup và memory

Các con số dưới đây chỉ để **định hướng**, không phải cam kết; kích thước thực phụ thuộc
phiên bản Flutter, ABI, asset, package và cách build.

| Chỉ số | Mức thường gặp | Cách cải thiện |
|---|---|---|
| APK arm64 / IPA cơ bản | ~8–15 MB / ~15–25 MB | `--split-per-abi`, tree shaking, bỏ asset thừa |
| Startup lạnh | Vài trăm ms đến vài giây | Giảm init plugin, trì hoãn tác vụ nặng |
| Memory nền | 80–200 MB tùy app | Giới hạn image cache, dispose, tránh giữ ảnh lớn |

```bash
flutter build apk --release --split-per-abi \
  --obfuscate --split-debug-info=build/symbols
flutter build appbundle --release --analyze-size
flutter build ipa --release --analyze-size
```

Checklist tối ưu:

- [ ] Dùng `ListView.builder`/`SliverList`; đặt `cacheWidth`/`cacheHeight` cho ảnh.
- [ ] `dispose()` controller/subscription/animation/stream; tránh `Opacity`/`Clip`/blur lặp.
- [ ] Dùng `const`, tách widget để giảm rebuild; parse JSON lớn bằng isolate.
- [ ] Đo bằng profile/release, kiểm tra startup bằng `flutter run --profile --trace-startup`.

> 💡 Obfuscate không làm app nhỏ hơn đáng kể và **không bảo vệ secret**. Nó chỉ đổi tên
> symbol; hãy giữ file symbol để đọc stack trace.

> 💡 Trade-off thực chiến: Flutter đổi tính nhất quán/một codebase lấy size lớn hơn và
> phụ thuộc plugin; Riverpod/Bloc đổi boilerplate lấy khả năng test; offline-first đổi
> độ phức tạp đồng bộ lấy UX chịu mạng yếu. Chọn theo bối cảnh, không theo “best practice”.

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

**Thứ tự đọc:** README → `flutter-basics` → `flutter-advanced` → `flutter-production` →
`mobile-integration` + `api-security`. Mới học Dart đọc basics mục 1 trước; đã biết
mobile đọc mục 1–3 rồi advanced mục 1–6; chuẩn bị release đọc production từ đầu; làm
backend đọc `../mobile-integration.md` để nắm hợp đồng API và mã lỗi.

> 📌 Các tài liệu dùng chung domain trung lập (orders/products/customers/todo/notes),
> không phụ thuộc một backend cụ thể. Khi áp vào dự án thật, thay domain nhưng giữ
> nguyên nguyên lý và checklist.

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

> ⚠️ Mỗi tuần phải có demo chạy được trên máy thật, không chỉ đọc. Đừng học quá nhiều
> package cùng lúc; nắm `FutureBuilder`, `ListView`, `Form`, `Navigator` và state cơ bản
> trước khi nhảy vào Riverpod/Bloc, codegen và offline sync. Ghi lại lỗi gặp phải và
> commit nhỏ mỗi ngày để giữ đà.

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

Ánh xạ nhanh: `new` → constructor thường; interface → `abstract class`/`implements`;
thread → isolate hoặc async event loop; Activity lifecycle → `State` +
`WidgetsBindingObserver`; DI container → Provider/Riverpod hoặc constructor injection.

> 📌 Pitfall: giữ controller toàn cục, gọi API trong `build()`, mutate list khi build,
> lạm dụng `late`, bắt mọi exception rồi bỏ qua, copy code native 1:1. Chuyển sang
> Flutter nhanh nhất khi chấp nhận **composition over inheritance** và **state-driven UI**,
> thay vì tìm cách “giữ reference đến view”.

---

## 7. Cài đặt chi tiết

Cài bằng SDK chính thức: clone Flutter stable, thêm `flutter/bin` vào `PATH`, chạy
`flutter --version && flutter doctor -v`. Windows dùng installer hoặc
`winget install Flutter`. Ghim phiên bản bằng FVM:
`dart pub global activate fvm && fvm install 3.24.0 && fvm use 3.24.0`.

**Android:** cài Android Studio (SDK, Platform Tools, Build Tools), tạo emulator API
34+, rồi `flutter doctor --android-licenses`. **iOS (macOS):** cài Xcode, nhận license,
chọn command line tools, cài CocoaPods (`brew install cocoapods`). **IDE:** VS Code +
extension Dart/Flutter hoặc Android Studio + plugin Flutter; bật format on save.

### 7.1 Cài theo hệ điều hành

**macOS:** cài Xcode (App Store/developer.apple.com), mở một lần, accept license, chọn
Command Line Tools, cài CocoaPods. Kiểm tra `xcodebuild -version` và `pod --version`.
Apple Silicon chỉ cài Rosetta khi plugin cũ yêu cầu:
`sudo softwareupdate --install-rosetta --agree-to-license`.

**Windows:** dùng installer/winget; bật **Developer Mode** để tạo symlink plugin; cài
Visual Studio Build Tools với “Desktop development with C++” nếu làm desktop; thêm
`flutter\bin` và `Android\Sdk\platform-tools` vào `PATH`; mở terminal mới sau khi đổi biến.

**Linux:** cài dependency build native (tên package khác nhau theo distro), ví dụ
`libglu1-mesa clang cmake ninja-build pkg-config libgtk-3-dev liblzma-dev`, rồi chạy
`flutter doctor -v`.

### 7.2 FVM và pin phiên bản

FVM giúp mỗi project dùng đúng phiên bản Flutter, tránh “máy tôi chạy được”.

```bash
dart pub global activate fvm
fvm install 3.24.0
fvm use 3.24.0
fvm flutter --version
fvm flutter run
```

Commit file cấu hình FVM (`.fvmrc` hoặc `.fvm/fvm_config.json`) và ignore `.fvm/`
(SDK/symlink). Trong CI, dùng đúng phiên bản qua FVM/action; đừng để CI tự “latest stable”.

### 7.3 Nâng cấp Flutter an toàn

Đọc release notes/breaking changes → tạo branch và commit trạng thái hiện tại → nâng SDK
(FVM/`flutter upgrade`) và `flutter pub upgrade` → analyze/test/build Android+iOS → kiểm
tra plugin chưa hỗ trợ → test máy thật → cập nhật CI/version pin rồi mới merge.

```bash
flutter channel stable
flutter upgrade
flutter --version
flutter pub outdated
flutter pub upgrade
flutter clean
flutter pub get
```

> ⚠️ `flutter downgrade` chỉ hữu ích trong một số trường hợp và không đảm bảo quay về
> đúng bản cũ. Cách an toàn nhất là pin bằng FVM và commit lockfile.

### 7.4 Android SDK, NDK và JDK

| Thành phần | Khi cần | Kiểm tra |
|---|---|---|
| Android SDK Platform | Luôn cần | SDK Manager, API 34+ |
| Build Tools | Luôn cần | SDK Manager |
| Platform Tools (`adb`) | Thiết bị/emulator | `adb devices` |
| Command-line Tools | `flutter doctor` yêu cầu | SDK Tools |
| NDK | Chỉ khi có native/plugin cần | `ndkVersion` trong Gradle |
| JDK 17 | Khuyến nghị cho AGP 8.x | `java -version` |

```bash
flutter doctor --android-licenses
flutter config --android-sdk "$HOME/Library/Android/sdk"
flutter config --jdk-dir "$JAVA_HOME"
adb devices
```

> ⚠️ Không cài NDK “cho chắc”. NDK làm tăng thời gian build và dung lượng; chỉ cài
> phiên bản plugin yêu cầu. Lỗi `NDK not configured` thường do thiếu đúng phiên bản,
> không phải thiếu NDK hoàn toàn.

### 7.5 Xcode, CocoaPods và license

```bash
sudo xcodebuild -license accept
xcodebuild -runFirstLaunch
pod --version
cd ios && pod install --repo-update
```

- Mở `ios/Runner.xcworkspace` (không phải `.xcodeproj`) sau khi có Pods.
- Chọn Team trong Signing & Capabilities trước khi chạy máy thật.
- Nếu pod lỗi do version, đọc `Podfile`/`Podfile.lock` trước khi xóa bừa.
- `pod deintegrate` và `pod install` là biện pháp mạnh; chỉ dùng khi đã backup.

### 7.6 Biến môi trường, proxy và mirror

| Biến | Mục đích |
|---|---|
| `PATH` | Tìm `flutter`, `dart`, `adb` |
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | Vị trí Android SDK |
| `JAVA_HOME` | JDK cho Gradle |
| `PUB_CACHE` | Vị trí cache package |
| `CHROME_EXECUTABLE` | Trình duyệt cho Flutter web |
| `FLUTTER_STORAGE_BASE_URL` | Mirror SDK/artifact (mạng hạn chế) |
| `PUB_HOSTED_URL` | Mirror pub.dev (mạng hạn chế) |

> ⚠️ Chỉ dùng mirror (`FLUTTER_STORAGE_BASE_URL`, `PUB_HOSTED_URL`) khi thật sự cần;
> mirror có thể chậm cập nhật/thiếu package và ảnh hưởng toàn vẹn. Ghi rõ trong onboarding.

### 7.7 IDE và extension

VS Code + extension Dart/Flutter (nhẹ, phổ biến), Android Studio/IntelliJ + plugin Flutter
(debug native Android tốt), Xcode cho signing/native iOS. Bật format on save; nếu dùng
FVM, trỏ `dart.flutterSdkPath` tới `.fvm/flutter_sdk` để analyzer đúng phiên bản.

---

## 8. Tạo project và chạy lần đầu

```bash
flutter create --org com.example --project-name app_example app_example
cd app_example && flutter pub get && flutter devices
flutter run -d <device-id> \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000 \
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

### 8.1 Ý nghĩa `flutter create`

| Flag | Ý nghĩa | Lưu ý |
|---|---|---|
| `--org` | Reverse domain cho package/bundle | Đổi sau khi tạo rất phiền |
| `--project-name` | Tên package Dart | `snake_case`, không bắt đầu bằng số |
| `--platforms` | Chọn nền tảng | Ví dụ `android,ios,web` |
| `--template` | `app`, `package`, `plugin` | Chọn đúng loại ngay từ đầu |
| `--empty` | Bỏ counter demo | Hữu ích khi muốn tự dựng |
| `--description` | Mô tả trong pubspec | Không ảnh hưởng runtime |

Ví dụ tạo app chỉ Android/iOS:

```bash
flutter create \
  --org com.acme.guestbook \
  --project-name guestbook_app \
  --platforms=android,ios \
  .
```

Quy tắc đặt tên:

- `--org com.acme` + project `guestbook_app` → Android package thường là
  `com.acme.guestbook_app`, iOS bundle ID tương ứng.
- Không dùng dấu cách, gạch ngang, ký tự Unicode trong `project-name`.
- Tránh trùng tên package đã có trên pub.dev nếu định publish.
- Chọn org **trước** khi phát hành; đổi applicationId/bundle ID sau đó cần làm cẩn thận.

### 8.2 Đổi tên app sau khi tạo

**Tên hiển thị** khác package name: Android sửa `android:label` trong
`AndroidManifest.xml`; iOS sửa `CFBundleDisplayName`/`CFBundleName` trong `Info.plist`;
web sửa `manifest.json` + `<title>`; desktop sửa file runner tương ứng.

**Đổi applicationId/bundle ID** phức tạp hơn: sửa Gradle/`namespace`, package Kotlin,
bundle identifier trong Xcode rồi `flutter clean && flutter pub get`. Nếu app đã phát
hành, **không đổi ID** vì store coi là app mới.

> ⚠️ Đổi tên thư mục không tự đổi package name; đổi package name không tự đổi tên hiển
> thị. Kiểm tra cả ba lớp: **tên hiển thị, package/bundle ID, tên Dart package**.

### 8.3 Chạy trên thiết bị và emulator

```bash
flutter devices
flutter emulators
flutter emulators --launch <emulator-id>
flutter run -d <device-id>
flutter run -d chrome
flutter run -d macos
```

| Chế độ | Lệnh | Dùng khi |
|---|---|---|
| Debug | `flutter run` | Phát triển, hot reload, debug |
| Profile | `flutter run --profile` | Đo hiệu năng gần release |
| Release | `flutter run --release` | Kiểm tra build tối ưu trên máy thật |

Đọc biến compile-time an toàn:

```dart
const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000',
);
```

> 📌 `--dart-define` là compile-time, không phải secret store. Giá trị vẫn có thể bị
> trích xuất từ binary; không đặt API key bí mật ở đây.
>
> ⚠️ `--dart-define-from-file` hữu ích cho nhiều biến, nhưng file cấu hình phải nằm
> ngoài Git nếu chứa thông tin nhạy cảm.

---

## 9. Cấu trúc project

```text
app_example/
├── android/ ios/ web/ macos/ linux/ windows/  # native host
├── lib/main.dart                             # entry point
├── test/ integration_test/                   # unit, widget, e2e
├── assets/{images,fonts}/
└── pubspec.yaml, analysis_options.yaml
```

Quy ước: `lib/` chỉ chứa code app; file `snake_case.dart`, class `PascalCase`, biến/hàm
`camelCase`; mỗi feature có thư mục riêng khi app lớn; không commit `build/`,
`.dart_tool/`, `ios/Pods/`, file `.jks`/`.p12`.

### 9.1 Giải thích từng thư mục/file

| Đường dẫn | Vai trò | Có commit? |
|---|---|---|
| `lib/`, `lib/main.dart` | Code Dart và entry point `runApp()` | Có |
| `test/`, `integration_test/` | Unit/widget test và E2E test | Có |
| `assets/` | Ảnh, font, JSON, âm thanh khai báo trong pubspec | Có |
| `android/`, `ios/` | Gradle/manifest/Kotlin và Xcode/Podfile/Swift host | Có (trừ file local/Pods) |
| `web/`, `macos/`, `linux/`, `windows/` | Host web/desktop | Có |
| `pubspec.yaml`, `pubspec.lock` | Dependency và version đã resolve | Có (app commit lock) |
| `analysis_options.yaml` | Cấu hình analyzer/lint | Có |
| `.dart_tool/`, `build/`, `ios/Pods/`, `.flutter-plugins*` | Cache/artifact sinh tự động | Không |

### 9.2 Generated, cache và `.gitignore`

File native quan trọng: Android `build.gradle(.kts)` (applicationId/version/signing),
`AndroidManifest.xml` (quyền/label/intent), iOS `Info.plist` (quyền/tên/URL scheme),
`Podfile` (platform/pod) và `Runner.xcworkspace` (signing). Commit `Podfile.lock` nếu
cần reproducible build; không commit `Pods/`.

Mẫu `.gitignore` tối thiểu:

```gitignore
.dart_tool/
build/
.flutter-plugins*
.idea/
.vscode/
ios/Pods/
ios/.symlinks/
ios/Flutter/Flutter.framework
android/local.properties
android/.gradle/
*.jks
*.keystore
*.p12
*.mobileprovision
.env
.env.*
!.env.example
```

- **Không commit** keystore, certificate, provisioning profile, file `.env` thật.
- **Nên commit** `pubspec.lock` với app, `Podfile.lock`, file cấu hình version.
- **Codegen**: `*.g.dart`, `*.freezed.dart` có thể commit hoặc ignore tùy team. Nếu
  ignore, CI/phát triển phải chạy `dart run build_runner build --delete-conflicting-outputs`.
- `android/local.properties` chứa đường dẫn máy cá nhân, không commit.

> 📌 Đừng ignore cả `ios/` hoặc `android/` chỉ vì “Flutter tự sinh”. Bạn sẽ mất cấu
> hình quyền, signing, intent filter và build setting.

### 9.4 Gợi ý cấu trúc khi app lớn

```text
lib/
├── main.dart
├── app/        # app.dart, router.dart, theme.dart
├── core/       # network, storage, utils, widgets dùng chung
├── features/   # auth, orders, profile... mỗi feature data/domain/presentation
└── l10n/
```

Ưu tiên **feature-first** cho app lớn (mỗi feature sở hữu data/domain/presentation);
layer-first dễ bắt đầu nhưng dễ phình. `presentation/` không gọi HTTP trực tiếp, `data/`
chứa DTO/API/local DB, `domain/` chứa entity/use case thuần Dart, `core/` chỉ chứa thứ
dùng chung thật sự.

> ⚠️ Pitfall: nhét mọi thứ vào `main.dart`, import chéo feature, đặt asset ngoài
> `assets/`, quên `pub get` sau pull hoặc commit file build. Tách `app.dart`/feature và
> giữ dependency một chiều để tránh coupling.

---

## 10. Quy ước code và package

```yaml
name: app_example
environment:
  sdk: ">=3.4.0 <4.0.0"
dependencies:
  flutter: {sdk: flutter}
dev_dependencies:
  flutter_test: {sdk: flutter}
  flutter_lints: ^5.0.0
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
tảng hỗ trợ. Giữ bộ package nhỏ và chỉ thêm khi có nhu cầu rõ ràng (networking, routing,
state management, storage, codegen). Prefer package có null safety, hỗ trợ đa nền tảng
và duy trì tích cực.

### 10.1 `pubspec.yaml` chi tiết

| Khóa | Ý nghĩa | Ghi chú |
|---|---|---|
| `name` | Tên package Dart | `snake_case`, không đổi tùy tiện |
| `description` | Mô tả | Bắt buộc nếu publish |
| `version` | Version app/package | `1.2.3+45` (version+build) |
| `environment.sdk` | Ràng buộc Dart SDK | Nên khớp Flutter đang dùng |
| `dependencies` | Dependency runtime | Ảnh hưởng app size |
| `dev_dependencies` | Test, lint, codegen | Không bundle vào app |
| `flutter.assets` | Danh sách asset | Sai path = lỗi runtime |
| `flutter.fonts` | Khai báo font | Cần family/weight đúng |
| `flutter.uses-material-design` | Dùng icon Material | Bật nếu dùng `Icons` |

```yaml
flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/data/seed.json
```

> ⚠️ Khai báo cả thư mục `assets/images/` sẽ bundle mọi file trong đó. File tạm, ảnh
> chưa dùng, file thiết kế lớn cũng bị đưa vào app nếu nằm trong thư mục.

### 10.2 Dependency constraints và lockfile

Cú pháp: `^1.2.3` = `>=1.2.3 <2.0.0`; có thể dùng khoảng tường minh; tránh `any`;
version chính xác hiếm khi cần; `{sdk: flutter}` lấy từ Flutter SDK.

```bash
flutter pub add dio
flutter pub add --dev mocktail
flutter pub remove dio
flutter pub outdated
flutter pub upgrade
flutter pub upgrade --major-versions
flutter pub deps
flutter pub get
```

- `pubspec.lock` ghi version chính xác đã resolve. Với **app**, commit lockfile để cả
  team/CI dùng cùng version.
- Với **package publish lên pub.dev**, thường không commit lockfile vì người dùng cần
  resolve theo SDK của họ.
- `dependency_overrides` chỉ dùng tạm để gỡ xung đột; phải ghi issue và có kế hoạch bỏ.
- `flutter pub upgrade --major-versions` có thể tạo breaking change; chạy test ngay.

> 📌 Nếu `Version solving failed`, đọc kỹ dòng “Because X depends on Y...”. Đừng xóa
> lockfile ngay. Thử nâng package trực tiếp, nâng SDK constraint hoặc tìm package thay thế.
> Cache mặc định ở `~/.pub-cache` (Windows `%LOCALAPPDATA%\Pub\Cache`); khi lỗi checksum,
> chạy `dart pub cache repair`, còn `dart pub cache clean` rồi `flutter pub get` khi cần reset.

### 10.3 Các loại package

| Loại | Có code native? | Ví dụ | Lưu ý |
|---|---|---|---|
| Dart package | Không | `intl`, `collection` | Chạy mọi nơi, nhẹ |
| Flutter package | Không (chỉ Dart+widget) | `flutter_svg` (tùy version) | Phụ thuộc Flutter SDK |
| Plugin | Có | `shared_preferences`, `camera` | Cần cấu hình native/quyền |
| Federated plugin | Có, tách interface | `url_launcher` | Chất lượng khác nhau theo nền tảng |
| FFI package | Có, gọi C/C++ | Thư viện xử lý ảnh/âm thanh | Quản lý bộ nhớ, build native |

### 10.4 Đánh giá package trước khi dùng

- [ ] Còn maintain trong 6–12 tháng gần đây, hỗ trợ đúng nền tảng cần?
- [ ] Null safety/SDK constraint tương thích; license phù hợp; test/CI/issue hoạt động?
- [ ] Transitive dependencies hợp lý; API ổn định, không còn “experimental”?
- [ ] Có giải pháp đơn giản hơn; rủi ro bảo mật/quyền thấp?
- [ ] Nếu package bị bỏ rơi, chi phí thay thế là bao nhiêu?

> ⚠️ Đừng chọn package theo số likes. Một package ít like nhưng do team uy tín bảo trì
> có thể tốt hơn package phổ biến nhưng đã bỏ hoang. Đọc changelog và issue gần đây.

### 10.5 `analysis_options.yaml` chi tiết

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true
  errors:
    invalid_annotation_target: ignore

linter:
  rules:
    always_declare_return_types: true
    avoid_print: true
    prefer_const_constructors: true
    prefer_final_locals: true
    require_trailing_commas: true
    sort_child_properties_last: true
    unawaited_futures: true
    use_key_in_widget_constructors: true
    use_super_parameters: true
```

`strict-casts`/`strict-inference`/`strict-raw-types` bắt lỗi type ngầm; `avoid_print`
chặn log production; `prefer_const_constructors` giảm rebuild; `unawaited_futures` bắt
Future bị bỏ quên; `require_trailing_commas` giữ diff sạch.

> 📌 Với `flutter_lints` cũ, một số rule có thể chưa tồn tại. Chạy `flutter analyze`
> để phát hiện rule không hợp lệ thay vì copy nguyên file cấu hình.

### 10.6 Quy ước code

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| File/thư mục | `snake_case` | `order_repository.dart` |
| Class/enum/typedef | `PascalCase` | `OrderRepository`, `OrderStatus` |
| Biến/hàm/field | `camelCase` | `fetchOrders()`, `itemCount` |
| Hằng số | `lowerCamelCase` | `defaultTimeout` |
| Private | Tiền tố `_` | `_controller`, `_load()` |
| Acronym | Không viết hoa toàn bộ | `HttpClient`, `ApiClient` |
| Import | dart → flutter → package → relative | Gom nhóm, sắp xếp |

Quy tắc thực chiến:

- Widget nhỏ, một trách nhiệm; `build()` không side effect, không gọi API/tạo controller.
- Ưu tiên `const`/`Stateless`; dùng `ValueKey(id)` cho list động thay vì index.
- `dispose()` controller, stream, animation, focus node; không dùng `print` production.
- Đặt tên theo domain (`OrderRepository`, không `ApiHelper`); tránh `dynamic`/`late` bừa.
- Comment giải thích **vì sao**, không giải thích điều code đã rõ.

> 💡 `dart fix --apply` có thể tự sửa nhiều lint đơn giản. Chạy `dart fix --dry-run`
> trước để xem thay đổi, đặc biệt trên codebase lớn.

> 📌 Monorepo: đặt domain dùng chung trong `packages/core`, UI kit trong `packages/ui_kit`,
> app phụ thuộc qua `path:`. Giữ dependency một chiều và tránh import ngược từ core
> sang app.

---

## 11. Hot reload và vòng lặp phát triển

| Phím (terminal) | Tác dụng |
|---|---|
| `r` | Hot reload — giữ state, rebuild widget |
| `R` | Hot restart — reset state, chạy lại `main()` |
| `p` / `o` / `q` | Debug paint / chuyển device / thoát |

Hot reload không áp dụng cho `main()`, thêm field, native code hoặc asset đã bundle —
cần restart. Giữ `flutter run` và `flutter test --watch` ở hai terminal để phản hồi nhanh.

### 11.1 Hot reload làm gì và không làm gì

| Thay đổi | Hot reload | Cần build lại |
|---|---|---|
| Sửa `build()`, text/style | Có | Không |
| Thêm field có initializer, sửa `main()`/`initState` đã chạy | Không (thường cần restart) | Không |
| Sửa pubspec/dependency | Không | Có (`pub get`) |
| Sửa native Kotlin/Swift, asset/font, manifest/Info.plist | Không | Có |

> ⚠️ Hot reload giữ state cũ, nên bug “biến mất sau restart” thường do state/cache.
> Khi nghi ngờ, bấm `R` trước khi kết luận code sai.

### 11.2 Quy trình debug hiệu quả

Tái hiện lỗi với bước nhỏ nhất → đọc log Flutter/native → dùng `debugPrint` có nhãn
(không log dữ liệu nhạy cảm) → kiểm tra widget tree bằng Inspector → đặt breakpoint
trong IDE → nếu là hiệu năng, chuyển profile mode và dùng DevTools → ghi lại nguyên
nhân và cách sửa vào PR/issue.

### 11.3 Flutter DevTools

| Tab | Dùng để |
|---|---|
| Inspector | Widget/element tree, constraint, size |
| Performance / CPU Profiler | Frame chart, jank, timeline, hàm tốn thời gian |
| Memory / Network | Heap, allocation, request/response |
| Logging / App Size | Log từ app, phân tích binary |

Mở bằng `flutter run --profile` rồi nhấn `v`, hoặc `dart devtools`. DevTools hiệu quả
nhất ở **profile mode**; debug mode có overhead và không đại diện cho release.

### 11.4 Debug, profile và release

| Chế độ | Assert | Hot reload | Tối ưu | Dùng để |
|---|---|---|---|---|
| Debug | Bật | Có | Không | Phát triển hằng ngày |
| Profile | Tắt | Không | Gần release | Đo hiệu năng |
| Release | Tắt | Không | Có | Kiểm tra bản phát hành |

- Assertions chỉ chạy debug; đừng dựa vào assert để validate input production.
- Debug build chậm hơn đáng kể; đừng kết luận “Flutter chậm” từ debug.
- `flutter run --release` trên máy thật là bắt buộc trước phát hành; một số plugin
  hoạt động khác ở release do obfuscation/tree shaking.

> 💡 Khi `flutter run` mất kết nối, dùng `flutter attach` thay vì khởi động lại app,
> đặc biệt khi đang debug state hoặc deep link. `flutter logs` xem log thiết bị,
> `flutter screenshot` chụp màn hình.

---

## 12. Kiểm tra chất lượng: analyze, format, lint

Chạy trước mỗi commit/PR:

```bash
dart format lib test
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test --coverage
dart fix --dry-run
dart fix --apply
flutter pub outdated
```

`flutter format` đã bị bỏ; dùng `dart format`. Thêm `--fatal-infos` cho analyze nếu CI
nghiêm; `flutter test` chạy nhanh không cần thiết bị; `--coverage` cần `lcov` để xem HTML;
`dart fix --dry-run` xem gợi ý trước khi sửa; đọc major version trước khi nâng package.

### 12.1 Thứ tự kiểm tra

1. `dart format` — tránh diff format lẫn với logic.
2. `dart analyze` — bắt lỗi type/lint sớm.
3. `flutter test` — bắt regression logic/UI.
4. `flutter build` cho nền tảng mục tiêu — bắt lỗi native/Gradle/Xcode.
5. Test trên máy thật — bắt lỗi camera, quyền, hiệu năng, lifecycle.

> ⚠️ Đừng bỏ qua bước 4. Rất nhiều lỗi chỉ xuất hiện khi build release hoặc khi
> Gradle/Xcode thực sự chạy, không thấy trong `flutter test`.

> 📌 Lint: kế thừa `flutter_lints`, loại trừ file generated, thêm rule theo vấn đề thực
> tế. Ignore từng dòng có lý do, tránh ignore cả file; CI có thể dùng
> `flutter analyze --fatal-infos`. Format: dùng duy nhất `dart format`, bật format on
> save và tạo commit format riêng nếu code cũ chưa chuẩn.

### 12.2 Test tối thiểu

Unit (`flutter_test`, `mocktail`) cho model/repository/use case; widget (`WidgetTester`)
cho render/interaction/state; integration (`integration_test`) cho luồng thật trên thiết
bị; golden (`matchesGoldenFile`) cho UI ổn định, cẩn thận khác font/OS.

```dart
test('parse order status', () {
  expect(OrderStatus.fromJson('paid'), OrderStatus.paid);
});
```

> 📌 Test không chỉ để CI xanh. Một test tốt ghi lại **hành vi mong đợi** và giúp
> refactor an toàn. Ưu tiên test luồng quan trọng hơn chạy theo % coverage.

### 12.3 CI tối thiểu

```yaml
name: flutter-ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: stable
          cache: true
      - run: flutter pub get
      - run: dart format --output=none --set-exit-if-changed .
      - run: flutter analyze
      - run: flutter test --coverage
```

> ⚠️ Pin version Flutter trong CI. Dùng “latest stable” khiến build thay đổi ngoài ý
> muốn và khó tái hiện lỗi. Với app có native, cần thêm job build Android/iOS.

---

## 13. Checklist môi trường

- [ ] **Toolchain:** `flutter --version` đúng `stable`, `flutter doctor -v` không lỗi `✗`;
  `dart --version` khớp Flutter; FVM (nếu dùng) trỏ đúng phiên bản project.
- [ ] `flutter devices`/`flutter emulators` thấy thiết bị/emulator.
- [ ] **Android:** SDK Platform 34+, Build Tools, Command-line Tools; `adb devices` thấy
  thiết bị; JDK 17 (hoặc bản AGP yêu cầu); `--android-licenses` đã accept.
- [ ] **iOS/macOS:** Xcode + license, Command Line Tools trỏ đúng Xcode; CocoaPods chạy
  được; simulator mở được; Signing Team đã chọn.
- [ ] **IDE/project:** plugin Dart/Flutter hoạt động, format on save bật; app mẫu
  `flutter create` chạy trên nền tảng mục tiêu; `flutter test` pass.
- [ ] Gọi được API dev; Git ignore đúng; không có secret trong repo; build release thử
  được trên ít nhất một máy thật.

> 📌 Đây là điều kiện tối thiểu trước khi nói “môi trường đã xong”. Nếu một mục không
> áp dụng (ví dụ không làm iOS), ghi rõ lý do thay vì bỏ qua im lặng.

---

## 14. Lỗi thường gặp khi setup

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `cmdline-tools component is missing` | Thiếu command line tools | SDK Manager → SDK Tools → cài |
| `Android license status unknown` | Chưa accept license | `flutter doctor --android-licenses` |
| `Signing ... error` | Thiếu team/provisioning | Xcode → Signing & Capabilities → chọn Team |
| `Connection refused` | Android emulator dùng `localhost` | Đổi sang `10.0.2.2` |
| `errno 111` | Server chưa chạy/firewall | Chạy server local, kiểm tra LAN IP/port |
| `Cleartext HTTP not permitted` | Android chặn HTTP | Dùng HTTPS hoặc debug manifest |
| `Version solving failed` | Xung đột constraint | Đọc lỗi, nâng SDK hoặc `flutter pub upgrade` |
| `No connected devices` | Chưa bật USB debugging/emulator | `flutter devices`, `adb devices` |
| `SDK location not found` | Thiếu `ANDROID_HOME`/`local.properties` | Cấu hình SDK path |
| `Unsupported class file major version` | JDK không tương thích Gradle/AGP | Dùng JDK 17, kiểm tra `JAVA_HOME` |
| `NDK not configured` | Thiếu đúng phiên bản NDK | Cài NDK version trong Gradle |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` / `INSUFFICIENT_STORAGE` | Khác chữ ký hoặc hết dung lượng | Gỡ app cũ/dùng cùng keystore; dọn dung lượng |
| `Gradle task assembleDebug failed` | Lỗi build native | Đọc log Gradle, chạy `flutter run -v` |
| `Could not resolve ...` | Mạng/proxy/repository | Kiểm tra mạng, proxy, mirror |
| `CocoaPods could not find compatible versions` | Xung đột pod/platform | `pod repo update`, chỉnh platform |
| `CocoaPods not installed`/`pod install` fail | Thiếu pod hoặc chưa cài plugin | `brew install cocoapods`; `cd ios && pod install` |
| `Module not found` / `Target of URI doesn't exist` | Chưa `pod install`/`pub get` hoặc sai import | `cd ios && pod install`; `flutter pub get` |
| `The current Dart SDK version is ...` | SDK thấp hơn constraint | Nâng Flutter/Dart hoặc hạ constraint |
| `MissingPluginException` / `PlatformException` | Native chưa build lại hoặc thiếu quyền/cấu hình | Hot restart/build lại; đọc message, sửa manifest/Info.plist |
| `XMLHttpRequest error` (web) | CORS/server chưa cho phép | Cấu hình CORS đúng |
| `RenderFlex overflowed` | Layout không đủ chỗ | Dùng `Expanded`/`Flexible`/scroll |
| `setState() called after dispose()` | Callback về sau khi widget hủy | Kiểm tra `mounted` trước `setState` |
| `LateInitializationError` / `Null check operator used on null` | `late` chưa gán hoặc ép `!` sai | Khởi tạo/dùng nullable; kiểm tra null, tránh `!` bừa |

### 14.1 Debug theo lớp và thu thập log

Dart/Flutter → `flutter run -v` + DevTools; Android → `adb logcat` + Android Studio;
iOS → Xcode console + `pod install`; network → DevTools/proxy/log server; lỗi chỉ trên
máy thật → Logcat/Xcode Devices và test thủ công. Thu thập `flutter doctor -v`,
`flutter pub deps`, `xcrun simctl list devices` khi cần hỗ trợ.

> ⚠️ `flutter clean` là biện pháp cuối, không phải bước đầu; xóa build/cache làm mất
> manh mối. Khi nhờ trợ giúp, gửi kèm phiên bản Flutter/Dart, OS, thiết bị, log đầy đủ
> và các bước tái hiện — đừng chỉ gửi “app không chạy”.

---

## 15. Bảo mật cơ bản

Mobile không phải môi trường tin cậy: người dùng có thể root/jailbreak, chặn proxy, dịch
ngược binary. Nguyên tắc: **server là nguồn kiểm soát quyền**, client chỉ hiển thị và
gửi request đã xác thực.

| Rủi ro | Cách giảm thiểu |
|---|---|
| Hardcode API key/secret | Không nhúng secret; dùng backend/proxy, rotate key |
| Token lưu plain text | Dùng Keychain/Keystore qua `flutter_secure_storage` |
| HTTP không mã hóa | Chỉ HTTPS/WSS, kiểm tra certificate |
| Log dữ liệu nhạy cảm | Không log token/PII; tắt verbose ở release |
| Binary bị dịch ngược | Obfuscate + giữ symbol; không coi là bảo mật tuyệt đối |
| Deep link giả mạo | Validate scheme/host/parameter, xác thực trước hành động |
| WebView không an toàn | Chặn navigation ngoài whitelist, tắt JS không cần |
| Quyền quá rộng/dependency lỗi thời | Chỉ xin quyền khi dùng; audit/cập nhật có kiểm soát |
| Screenshot/clipboard | Cân nhắc chặn chụp màn hình cho màn hình nhạy cảm |

Checklist bảo mật tối thiểu:

- [ ] Không có secret thật trong repo, `--dart-define` hay asset.
- [ ] Token nhạy cảm lưu trong secure storage, không `SharedPreferences`.
- [ ] API production bắt buộc HTTPS; không bật cleartext.
- [ ] Log release không chứa token, mật khẩu, dữ liệu cá nhân.
- [ ] Quyền Android/iOS tối giản; deep link/WebView được validate.
- [ ] Có quy trình rotate key/token, logout toàn thiết bị và test token hết hạn.
- [ ] Build release dùng `--obfuscate --split-debug-info`, lưu symbol an toàn.
- [ ] Rà soát dependency/license; privacy manifest/Data Safety khớp dữ liệu thu thập.

> ⚠️ Certificate pinning tăng an toàn nhưng cũng tăng rủi ro vận hành: khi rotate
> certificate mà quên cập nhật app, toàn bộ người dùng cũ có thể bị khóa. Chỉ dùng khi
> có quy trình rotation và fallback rõ ràng.
>
> 📌 Obfuscation không bảo vệ secret. Bất kỳ giá trị nào nhúng trong app đều có thể bị
> trích xuất; đừng đặt khóa bí mật trong client.

---

## 16. Tài liệu tham khảo

- Flutter: [Get started](https://docs.flutter.dev/get-started) •
  [Architecture](https://docs.flutter.dev/resources/architectural-overview) •
  [Breaking changes](https://docs.flutter.dev/release/breaking-changes)
- Flutter: [Performance](https://docs.flutter.dev/perf/best-practices) •
  [Testing](https://docs.flutter.dev/testing) •
  [DevTools](https://docs.flutter.dev/tools/devtools/overview)
- Flutter: [Deploy Android](https://docs.flutter.dev/deployment/android) •
  [Deploy iOS](https://docs.flutter.dev/deployment/ios) •
  [Platform integration](https://docs.flutter.dev/platform-integration)
- Dart: [Language tour](https://dart.dev/language) •
  [Linter rules](https://dart.dev/tools/linter-rules) •
  [Pub](https://dart.dev/tools/pub)
- [pub.dev](https://pub.dev) • [FVM](https://fvm.app)

> 📌 Docs chính thức thay đổi theo phiên bản. Khi làm theo hướng dẫn trên blog/Stack
> Overflow, luôn đối chiếu lại với docs của đúng Flutter/Dart bạn đang dùng. Đặc biệt
> cẩn thận với bài viết trước Flutter 3.x hoặc trước khi Impeller thành mặc định.

---

*Đọc tiếp [`flutter-basics.md`](./flutter-basics.md) để bắt đầu viết widget đầu tiên.*
