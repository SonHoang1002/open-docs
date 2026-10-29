# Flutter Interview — Nâng cao (Senior)

> 75 câu hỏi cho ứng viên Senior/Lead: render pipeline, Element reconciliation, isolate,
> platform channel/FFI, profiling, bảo mật, release, kiến trúc quy mô lớn và system design.
> Kỳ vọng không chỉ "biết API" mà còn **đo, đánh đổi, vận hành và dẫn dắt**.

---

## Mục lục

1. [Rendering và framework internals](#1-rendering-và-framework-internals)
2. [Concurrency và native interop](#2-concurrency-và-native-interop)
3. [Platform, accessibility và vận hành](#3-platform-accessibility-và-vận-hành)
4. [Performance, memory, startup](#4-performance-memory-startup)
5. [Testing, observability, web và desktop](#5-testing-observability-web-và-desktop)
6. [Kiến trúc, build và vận hành](#6-kiến-trúc-build-và-vận-hành)
7. [System design, tổ chức và incident](#7-system-design-tổ-chức-và-incident)
8. [Kiến trúc quy mô lớn](#8-kiến-trúc-quy-mô-lớn)
9. [System design nâng cao](#9-system-design-nâng-cao)
10. [Behavioral và leadership](#10-behavioral-và-leadership)
11. [Câu hỏi bổ sung (cập nhật)](#11-câu-hỏi-bổ-sung-cập-nhật)
12. [Tài liệu tham khảo](#12-tài-liệu-tham-khảo)

---

## 1. Rendering và framework internals

### Q01. Mô tả đầy đủ pipeline render của Flutter. [S]

**Trả lời:** Mỗi frame đi qua các pha:

1. **Build**: `BuildOwner.buildScope` chạy `Element.rebuild` cho dirty elements, tạo/cập
   nhật widget tree.
2. **Layout**: `PipelineOwner.flushLayout` gọi `RenderObject.layout(constraints)`; parent
   truyền constraint, con set `size`.
3. **Compositing bits**: xác định render object cần layer riêng.
4. **Paint**: `flushPaint` gọi `paint` để ghi vào `PictureLayer`/layer tree.
5. **Semantics**: cập nhật semantics tree (nếu bật).
6. **Compositing**: `LayerTree` được gửi sang engine.
7. **Raster**: engine (Impeller/Skia) chuyển layer thành lệnh GPU và vẽ.

`SchedulerBinding` điều phối frame; `WidgetsBinding.drawFrame` gọi các pha. Jank xảy ra khi
UI thread (build/layout/paint) hoặc raster thread vượt frame budget (16.7ms/8.3ms).

**Điểm cộng:** biết `markNeedsBuild`, `markNeedsLayout`, `markNeedsPaint` lan truyền khác
nhau; `RepaintBoundary` cắt paint; `PipelineOwner` tách UI/raster.

---

### Q02. Element reconciliation hoạt động thế nào? Vì sao key quan trọng? [S]

**Trả lời:** Khi parent rebuild, `updateChild` so sánh widget mới với Element cũ. Nếu
`Widget.canUpdate(old, new)` — cùng `runtimeType` và cùng `key` — Element được update với
widget mới; nếu không, Element cũ bị deactivate/unmount và Element mới được inflate.

```dart
static bool canUpdate(Widget oldWidget, Widget newWidget) {
  return oldWidget.runtimeType == newWidget.runtimeType &&
      oldWidget.key == newWidget.key;
}
```

Trong list, nếu dùng index làm key, việc chèn/xóa làm widget ở vị trí đó "đổi danh tính"
→ State bị gán sai hoặc mất. `ValueKey(id)` giúp framework nhận ra item di chuyển và giữ
State đúng. `GlobalKey` còn đăng ký trong global registry để move Element giữa các vị trí.

**Bẫy:** key không ổn định (timestamp/random) gây recreate mỗi build; trùng `GlobalKey`
gây exception; lạm dụng key làm mất tối ưu.

---

### Q03. `BuildContext` và `InheritedElement` liên hệ thế nào? [S]

**Trả lời:** `BuildContext` là interface của `Element`. Khi gọi
`dependOnInheritedWidgetOfExactType<T>()`, Element tìm `InheritedElement` gần nhất và thêm
mình vào `_dependents`. Khi inherited widget update, `InheritedElement.update` gọi
`notifyClients` nếu `updateShouldNotify` true; các dependent được `markNeedsBuild`.
`didChangeDependencies` chạy trên dependent trước build kế tiếp.

Có hai kiểu lookup:

- `dependOn...`: đăng ký rebuild.
- `getElementForInheritedWidgetOfExactType`: chỉ đọc, không rebuild.

Đây là cơ chế Provider/Riverpod dùng để giới hạn rebuild theo scope/select.

**Bẫy:** lookup trong `initState` (chưa được phép depend) hoặc trong async callback;
giữ context quá lâu; dùng global key để lấy inherited widget.

---

### Q04. Viết một `RenderBox` tùy chỉnh cần hiểu gì? [S]

**Trả lời:** Cần nắm protocol:

- `performLayout()`: đọc `constraints`, layout child, set `size`.
- `computeDryLayout()` (nếu hỗ trợ intrinsic): trả size mà không mutate.
- `paint(context, offset)`: vẽ.
- `hitTest`/`hitTestSelf`: tương tác.
- `markNeedsLayout`, `markNeedsPaint`; relayout boundary khi constraint không phụ thuộc
  parent.
- `setupParentData`, `parentData` cho child.

```dart
class FixedAspectBox extends RenderBox
    with RenderObjectWithChildMixin<RenderBox> {
  FixedAspectBox({required this.ratio});
  final double ratio;

  @override
  void performLayout() {
    size = constraints.constrain(
      Size(constraints.maxWidth, constraints.maxWidth / ratio),
    );
    child?.layout(BoxConstraints.tight(size));
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    if (child != null) context.paintChild(child!, offset);
  }
}
```

**Điểm cộng:** hầu hết nhu cầu chỉ cần `CustomPaint`/`LayoutBuilder`; chỉ viết RenderObject
khi cần layout protocol đặc biệt. Test bằng `RenderBox` assertions và golden.

---

### Q05. Sliver protocol khác box protocol ở đâu? [S]

**Trả lời:** Box nhận `BoxConstraints` (min/max width/height) và trả `Size`. Sliver nhận
`SliverConstraints` (axis, scrollOffset, remainingPaintExtent, crossAxisExtent,
overlap...) và trả `SliverGeometry` (scrollExtent, paintExtent, layoutExtent, maxPaintExtent,
hitTestExtent, hasVisualOverflow). Sliver không có kích thước 2D cố định; nó mô tả phần
chiếm trong vùng cuộn.

`SliverList` dùng `SliverMultiBoxAdaptorElement` để quản lý child lazy theo index.
Custom sliver cần xử lý scroll offset, paint extent, và child layout.

**Bẫy:** đặt box widget trực tiếp trong `CustomScrollView` (phải bọc `SliverToBoxAdapter`);
`SliverFillRemaining` với `hasScrollBody` sai; nested scroll cùng hướng.

---

### Q06. `RepaintBoundary`, layer và raster cache hoạt động ra sao? [S]

**Trả lời:** `RepaintBoundary` tạo `RenderRepaintBoundary` với layer riêng, cắt subtree
khỏi paint của parent. Khi subtree repaint, chỉ layer đó được cập nhật; engine có thể cache
layer thành texture (raster cache) nếu ít thay đổi.

Dùng cho: item list phức tạp, animation tách biệt, widget tĩnh đắt. Không dùng tràn lan vì
tăng layer/texture memory và compositing cost.

**Điểm cộng:** `Opacity`/`ClipRRect`/`saveLayer` có thể tạo offscreen buffer; ưu tiên
`FadeTransition`/`ColorFiltered` khi phù hợp; Impeller xử lý layer khác Skia nhưng nguyên
lý đo vẫn vậy.

---

### Q07. `SchedulerBinding` và các loại callback? [S]

**Trả lời:** `SchedulerBinding` quản lý frame:

- `scheduleFrame()` yêu cầu frame.
- `addFrameCallback` (transient) chạy đầu frame, dùng cho animation ticker.
- Persistent callbacks: build/layout/paint.
- `addPostFrameCallback` chạy sau frame, an toàn để đọc size/scroll hoặc schedule việc.
- `SchedulerBinding.instance.endOfFrame` future hoàn thành cuối frame.

```dart
WidgetsBinding.instance.addPostFrameCallback((_) {
  if (!mounted) return;
  final box = _key.currentContext?.findRenderObject() as RenderBox?;
  print(box?.size);
});
```

**Bẫy:** gọi `setState` trong post-frame mỗi frame gây loop; dùng `addPostFrameCallback`
để "fix" layout thay vì thiết kế đúng; block frame bằng tác vụ dài.

---

## 2. Concurrency và native interop

### Q08. Isolate: cơ chế message, chi phí và pattern pool? [S]

**Trả lời:** Isolate có heap riêng; giao tiếp qua `SendPort`/`ReceivePort`. Message được
copy hoặc transfer (ví dụ `TransferableTypedData`) tùy kiểu. `Isolate.spawn` tạo isolate
mới; `Isolate.run` tiện cho one-shot; `compute` của Flutter tương tự.

Chi phí spawn đáng kể (vài ms đến vài chục ms), nên với nhiều tác vụ nhỏ dùng **isolate
pool** (giữ worker sống, gửi job qua port) thay vì spawn mỗi lần. `Isolate.exit(port,
result)` gửi kết quả rồi kết thúc nhanh.

```dart
final receive = ReceivePort();
await Isolate.spawn((SendPort port) {
  final result = heavyWork();
  Isolate.exit(port, result);
}, receive.sendPort);
final result = await receive.first;
```

**Bẫy:** gửi closure capture `BuildContext`/object native; copy payload lớn qua lại; không
xử lý lỗi/exit; web không có isolate thật; isolate không giải quyết I/O async.

---

### Q09. Platform channel hoạt động thế nào? [S]

**Trả lời:** Flutter và host nói chuyện qua `BinaryMessenger` với `MethodCodec`
(StandardMessageCodec). `MethodChannel.invokeMethod` gửi tên method + args; host xử lý và
trả result/error. `EventChannel` cho stream event từ native; `BasicMessageChannel` cho
message tùy ý.

Luồng: Dart → engine → platform thread (Android main/UI, iOS main) → handler. Handler chạy
trên platform thread; tác vụ nặng phải đẩy sang background thread của native rồi trả kết
quả.

```dart
static const _channel = MethodChannel('wedding/native');
final path = await _channel.invokeMethod<String>('pickImage');
```

**Bẫy:** block main thread native; gọi channel trước `ensureInitialized`/plugin registration;
không xử lý `PlatformException`; dùng channel cho high-frequency data (dùng FFI/Pigeon/batch).

---

### Q10. Pigeon giải quyết vấn đề gì? [S]

**Trả lời:** Pigeon sinh code type-safe cho channel từ schema Dart, giảm lỗi string method,
cast sai kiểu, và boilerplate hai phía. Hỗ trợ class, enum, list/map, callback/stream,
error. Code được generate cho Dart, Kotlin/Java, Swift/ObjC.

**Bẫy:** schema thay đổi cần regenerate cả hai phía; versioning package; generated code
không commit tùy quy ước; vẫn phải xử lý thread và lỗi native.

---

### Q11. `dart:ffi` dùng khi nào? Những rủi ro chính? [S]

**Trả lời:** FFI gọi thư viện C/C++ trực tiếp, phù hợp crypto, xử lý ảnh, SDK native không
có plugin. Cần `DynamicLibrary.open`, lookup symbol, định nghĩa `Struct`/`Pointer`, cấp
phát bộ nhớ (`malloc`/`calloc`), giải phóng đúng, `NativeCallable` cho callback.

```dart
typedef NativeAdd = Int32 Function(Int32, Int32);
typedef DartAdd = int Function(int, int);

final lib = DynamicLibrary.open('libmath.so');
final add = lib.lookupFunction<NativeAdd, DartAdd>('add');
print(add(2, 3));
```

**Rủi ro:** segfault, memory leak, use-after-free, ABI khác nhau, không portable, khó debug,
không chạy web. Chỉ dùng khi plugin không đáp ứng; bọc API an toàn và test kỹ.

---

### Q12. Federated plugin là gì? Thiết kế plugin đa nền tảng? [S]

**Trả lời:** Federated plugin tách:

- **App-facing package**: API người dùng thấy.
- **Platform interface package**: contract chung.
- **Platform implementation package**: Android/iOS/web/desktop.

Nhờ đó thêm nền tảng không phá API; có thể endorsed (tự động dùng impl chính thức) hoặc
không. Plugin cần versioning, platform support rõ, test trên từng nền tảng.

**Bẫy:** leak dependency native; implementation không tuân interface; channel name trùng;
không xử lý lifecycle/activity detach.

---

### Q13. Custom shader (`FragmentProgram`) dùng thế nào? [S]

**Trả lời:** Viết GLSL trong `shaders/*.frag`, khai báo trong `pubspec.yaml` mục `shaders`,
load bằng `FragmentProgram.fromAsset`, truyền uniforms, vẽ qua `CustomPainter` với
`Paint()..shader = program.fragmentShader()`. Dùng cho hiệu ứng gradient/noise/transition
mà widget không làm được.

**Bẫy:** shader compilation jank lần đầu; uniform layout sai; Impeller/Skia/Web hỗ trợ khác
nhau; shader phức tạp tốn GPU; cần fallback.

---

### Q14. Animation nâng cao: simulation, custom curve, thư viện? [S]

**Trả lời:** `AnimationController.animateWith(Simulation)` cho physics (spring, friction);
`Curve` tùy chỉnh cho timing; `TweenSequence` cho nhiều chặng; `Ticker` cho frame chính
xác. Với Lottie/Rive, cân nhắc file size, runtime, khả năng tương tác, accessibility,
reduce motion.

**Điểm cộng:** animation phải cancellable, không giữ state sau dispose, test bằng
`pump(duration)`, tôn trọng `MediaQuery.disableAnimationsOf`, đo jank trên thiết bị yếu.

---

### Q15. Text rendering trong Flutter gồm những gì? [S]

**Trả lời:** `TextPainter` layout paragraph (line break, ellipsis, maxLines), dùng font
fallback, text scale, locale, text direction. Engine shapes glyph, tạo atlas, raster.
Các vấn đề thường gặp: font thiếu glyph tiếng Việt, line height khác giữa nền tảng, text
scale lớn gây overflow, baseline lệch.

**Điểm cộng:** dùng `Text.rich`/`InlineSpan`, `StrutStyle`, `TextHeightBehavior`;
`TextPainter` cho custom render; test text scale 200%; tránh đo text trong build nếu không
cần.

---

## 3. Platform, accessibility và vận hành

### Q16. Semantics tree hoạt động thế nào? [S]

**Trả lời:** `RenderObject` sinh `SemanticsNode`; `SemanticsOwner` gửi cây sang platform
accessibility (TalkBack/VoiceOver). Widget `Semantics` thêm label/role/action; `MergeSemantics`
gộp node con; `ExcludeSemantics` bỏ. Custom RenderObject cần override `describeSemanticsConfiguration`
và `assembleSemanticsNode` nếu có con.

**Bẫy:** `GestureDetector` không tự có semantic button; icon không label; merge sai làm
mất action; semantics bị stale nếu không `markNeedsSemanticsUpdate`.

---

### Q17. State restoration hoạt động thế nào khi app bị kill? [S]

**Trả lời:** `RestorationMixin` + `RestorableProperty` lưu state vào `RestorationManager`,
được OS/engine persist. Cần `restorationScopeId` trên `MaterialApp`/`Router`; route
restoration; `RestorableInt`, `RestorableTextEditingController`... Khi app bị kill và mở
lại, state được khôi phục thay vì mất.

**Bẫy:** lưu object lớn/không serialize được; coi restoration là database; không test kill;
state nhạy cảm trong restoration storage; khôi phục navigation sai khi auth hết hạn.

---

### Q18. Universal Links/App Links khác custom scheme thế nào? [S]

**Trả lời:** Custom scheme (`wedding://`) đơn giản nhưng có thể bị app khác chiếm, không
fallback web tốt. Universal Links (iOS) và App Links (Android) dùng HTTPS + file xác minh
(`apple-app-site-association`, `assetlinks.json`) để mở app, fallback web nếu không cài.

Cần xử lý cold start/warm start, route không tồn tại, auth, query/path, test trên thiết bị
thật; server phải serve file đúng content-type, không redirect.

**Bẫy:** chỉ test warm start; verification fail do signing/bundle id; link chứa dữ liệu
nhạy cảm; không validate tham số.

---

### Q19. Đồng bộ offline nâng cao: chọn conflict strategy thế nào? [S]

**Trả lời:** Tùy domain:

| Chiến lược | Khi dùng | Rủi ro |
|---|---|---|
| Last-write-wins | Dữ liệu ít xung đột, timestamp tin cậy | Mất update |
| Version/ETag + reject | Cần bảo toàn, cho user resolve | UX phức tạp |
| Field-level merge | Form nhiều field độc lập | Cần metadata |
| CRDT | Collaborative realtime | Phức tạp, size |
| Append-only/event log | Guestbook, audit | Cần compaction |

Kèm idempotency key, tombstone cho delete, ordering, retry, reconciliation khi reconnect,
và UI hiển thị trạng thái. Không có "exactly once" miễn phí; thường là at-least-once +
idempotent.

---

### Q20. Threat model cho app mobile gồm những gì? [S]

**Trả lời:** Xác định tài sản (token, PII, ảnh cưới), actor (user, malware, network), bề mặt
(API, deep link, WebView, storage, backup, clipboard, screenshot, push). Kiểm soát: TLS +
pinning có rotation, secure storage, least privilege, input validation, obfuscation, root/
jailbreak signal, certificate transparency, dependency scan, MASVS.

**Điểm cộng:** client không đáng tin; server phải authorize; không nhúng secret; logging
redaction; xử lý token revoke; test backup/root; incident plan.

---

## 4. Performance, memory, startup

### Q21. Quy trình profiling performance chuẩn? [S]

**Trả lời:**

1. Định nghĩa metric + baseline (frame p95, startup, memory, network).
2. Tái hiện trên profile mode/thiết bị đại diện, dữ liệu thật.
3. Ghi trace DevTools/Timeline, xác định UI hay raster thread.
4. Khoanh vùng (widget rebuild, layout, image, shader, I/O).
5. Thay đổi **một** biến, đo lại nhiều lần, so sánh thống kê.
6. Thêm regression test/benchmark vào CI nếu có thể.
7. Document kết quả và trade-off.

**Bẫy:** đo debug; sample quá nhỏ; bỏ qua nhiệt độ/thiết bị; tối ưu vi mô; không kiểm tra
memory/battery.

---

### Q22. Tìm memory leak bằng công cụ nào? [S]

**Trả lời:** DevTools Memory: snapshot trước/sau, diff, retainers/dominator tree; allocation
profiling; `leak_tracker` trong test; VM service `getAllocationProfile`; native memory qua
Android Studio/Xcode Instruments. Kiểm tra dispose, listener, stream, static, image cache,
platform views.

**Bẫy:** nhầm cache tăng với leak; snapshot không GC; giữ debugger làm object sống; bỏ qua
native memory; không tái hiện đủ lâu.

---

### Q23. Tối ưu startup sâu: những thành phần nào chiếm thời gian? [S]

**Trả lời:** Engine init, Dart VM/isolate, plugin registration, `main()`/DI, first build/
layout, asset/font load, network, native SDK. Đo `--trace-startup`/Timeline, tách
time-to-first-frame và time-to-interactive. Kỹ thuật: lazy init, deferred components
(Android), isolate, preload có kiểm soát, cache, splash, giảm plugin, tránh sync I/O.

**Bẫy:** tối ưu first frame nhưng user vẫn chờ network; che bằng splash; init analytics
trước UI; đo trên máy flagship.

---

### Q24. Build release internals: AOT, tree shaking, R8, symbol? [S]

**Trả lời:** Release dùng AOT compile Dart → native; tree shaking loại code không dùng;
Android R8/ProGuard shrink/obfuscate Java/Kotlin; `--obfuscate --split-debug-info` làm rối
tên Dart và tách symbol; cần upload mapping/symbol cho Crashlytics/Sentry. App Bundle tách
theo ABI/ngôn ngữ; Play generate APK tối ưu.

**Bẫy:** obfuscate mà không lưu symbol → không đọc crash; reflection/JSON key bị ảnh hưởng;
R8 loại class plugin; test release thật trước khi rollout.

---

## 5. Testing, observability, web và desktop

### Q25. Flutter web/desktop khác mobile ở điểm nào? [S]

**Trả lời:** Web có renderer (HTML/CanvasKit/skwasm), tải runtime, SEO/accessibility khác,
plugin support hạn chế, bundle size, browser quirks. Desktop có window management, menu,
keyboard, file system, plugin maturity khác. Không giả định code mobile chạy y hệt.

**Điểm cộng:** chọn renderer theo nhu cầu; lazy load; test browser; xử lý text selection/
scroll; desktop keyboard/focus; CI build từng target.

---

### Q26. CI/CD nâng cao cho mobile: signing và store automation? [S]

**Trả lời:** Quản lý signing key trong secret manager/KMS; CI tạo keystore tạm, build, ký,
upload; iOS dùng App Store Connect API key, fastlane match/pilot; Android dùng Play
Developer API/service account; version/build number tự tăng; staged rollout; artifact
retention; audit log.

**Bẫy:** key trong repo; một người giữ key; build không reproducible; upload nhầm track;
không lưu mapping/symbol; rollback chậm vì store review.

---

### Q27. Testing ở quy mô lớn: làm sao giữ độ tin cậy? [S]

**Trả lời:** Test pyramid + contract test + device farm + golden + performance benchmark;
quarantine test flaky có owner; test analytics (flaky rate, duration); shift-left; test data
management; môi trường giả lập ổn định; smoke test trên release artifact thật.

**Bẫy:** coverage ảo; integration test chậm chạy mọi PR; retry che flaky; không test
migration/upgrade; không test offline/permission.

---

### Q28. Observability và SLO cho mobile? [S]

**Trả lời:** Metric: crash-free sessions/users, ANR, startup p95, screen load, API error/
latency, jank frame %, push delivery, sync failure. Log/trace có correlation id; alert
theo SLO; release health theo version/thiết bị; sampling và redaction. Dashboard chung với
backend để thấy end-to-end.

**Bẫy:** chỉ crash; alert quá nhiều; không phân biệt version; log PII; không có runbook.

---

## 6. Kiến trúc, build và vận hành

### Q29. Thiết kế modular architecture cho app lớn? [S]

**Trả lời:** Chia theo **feature** + **layer**, package có API surface rõ, dependency một
chiều (app → feature → core/domain), không import chéo feature. Dùng melos/workspace,
versioning nội bộ, CI path filter, code ownership. Domain/core không phụ thuộc UI.

**Điểm cộng:** đo build time, dependency graph, cycle; tách dần từ monolith; tránh package
quá nhỏ; contract test giữa package.

**Bẫy:** chia theo layer toàn cục (`models/`, `services/`) gây merge conflict; package
"common" khổng lồ; circular dependency; version drift.

---

### Q30. Design system ở cấp tổ chức: làm sao để được adopt? [S]

**Trả lời:** Token (màu, spacing, typography) + component API ổn định + tài liệu sống +
Storybook/catalog + golden test + versioning + migration guide. Làm việc với designer/
product, đo adoption, deprecate dần, không fork.

**Bẫy:** component cứng nhắc không cho override; breaking change không báo; không accessible;
chỉ là bản vẽ Figma; không có owner.

---

### Q31. Build performance/codegen chậm, xử lý thế nào? [S]

**Trả lời:** Đo thời gian `build_runner`, analyze, build; giảm generated code, tách package,
dùng cache, chạy incremental, tránh generate lại không cần, CI cache pub/Gradle, cân nhắc
`build_runner watch` local. Tách codegen theo package; không commit file thay đổi liên tục.

**Bẫy:** xóa cache mỗi build; codegen toàn repo mỗi lần; generated file conflict; analysis
server quá tải.

---

### Q32. Nâng cấp Flutter major version an toàn? [S]

**Trả lời:** Đọc release notes/breaking changes, chạy `flutter pub outdated`, tạo branch,
nâng SDK/package theo bước, chạy analyze/test/build cả target, kiểm tra plugin native,
golden/UI regression, beta/staged rollout. Có rollback và thời gian buffer.

**Bẫy:** nâng tất cả cùng lúc; bỏ qua deprecation; test thiếu nền tảng; không khóa version
CI; nâng ngay trước release.

---

## 7. System design, tổ chức và incident

### Q33. System design: guestbook realtime từ mobile đến DB? [S]

**Trả lời:** Yêu cầu: đọc danh sách, gửi lời chúc, realtime, moderation, offline, scale đọc
lớn. Thiết kế:

- Mobile: local DB source of truth, outbox, WS reconnect, pagination cursor.
- API: REST cho CRUD, auth, rate limit, idempotency key, validation/moderation.
- DB: bảng messages (id, guest_id, content, status, created_at), index `(status, created_at desc)`;
  cursor `(created_at,id)`.
- Realtime: WS gateway pub/sub, event id/sequence, resume; fan-out; backpressure.
- Cache: Redis cho feed nóng; CDN cho ảnh.
- Observability: trace, error rate, WS connections, lag.

**Điểm cộng:** moderation async (pending → approved), spam/abuse, PII, deletion/GDPR,
reconnect storm, scale WS horizontally với sticky/redis pubsub.

---

### Q34. System design: upload ảnh cưới dung lượng lớn, mạng yếu? [S]

**Trả lời:** Chọn/compress client (giữ chất lượng hợp lý), upload resumable/presigned URL
trực tiếp lên object storage (S3/GCS), chia chunk, retry idempotent, progress, background
upload (foreground service iOS/Android), queue offline, checksum, virus scan/moderation,
CDN + signed URL để đọc, lifecycle/cleanup.

**Bẫy:** upload qua API server gây nghẽn; base64 trong JSON; mất file khi app kill; public
bucket; không giới hạn size/type; retry tạo file trùng.

---

### Q35. System design: chat/moderation realtime? [S]

**Trả lời:** Room/conversation, message ordering theo server sequence, client gửi
idempotency key, optimistic UI, delivery/read receipt, push khi offline, presence, history
pagination cursor, moderation/ban, rate limit, encryption nếu cần. WS gateway + pub/sub,
DB append-only, cache recent, queue cho fan-out.

**Điểm cộng:** exactly-once không khả thi → at-least-once + dedupe; ordering theo
conversation; xử lý reconnect/missed events; abuse report; data retention.

---

### Q36. Flutter vs native vs React Native: tư vấn cho CTO thế nào? [S]

**Trả lời:** Trình bày theo bối cảnh:

| Tiêu chí | Flutter | Native | React Native |
|---|---|---|---|
| Code sharing | Cao | Thấp | Cao |
| UI consistency | Cao | Theo platform | Gần native |
| Performance | Rất tốt, trừ native nặng | Tốt nhất | Tốt, phụ thuộc bridge |
| Ecosystem | Lớn, ít native mới | Đầy đủ nhất | Lớn (JS) |
| Team | Dart mới | Kotlin/Swift | JS/TS sẵn |
| Time-to-market | Nhanh | Chậm hơn | Nhanh |

Quyết định dựa team, app cần native sâu (camera/AR/HealthKit), tuổi thọ sản phẩm, ngân
sách, không chỉ benchmark.

---

### Q37. White-label/multi-tenant app với Flutter? [S]

**Trả lời:** Tách config/theme/assets theo tenant; dùng flavor + `--dart-define-from-file`
hoặc build config; một codebase, nhiều bundle id; CI matrix build từng tenant; signing/
store listing riêng; feature flags cho khác biệt; tránh fork code.

**Bẫy:** if/else tenant rải rác; asset nặng cho mọi tenant; build thủ công; lộ dữ liệu
tenant; version lệch; không test matrix.

---

### Q38. Feature flag/experimentation trên mobile? [S]

**Trả lời:** Remote config + flag có default an toàn offline; kill switch; gradual rollout;
A/B với metric rõ; guardrail (crash, latency); phân nhóm ổn định; audit thay đổi. Không
dùng flag thay cho release branch phức tạp; dọn flag cũ.

**Bẫy:** flag không default → app crash offline; thay đổi UI đột ngột; flag lâu năm; thử
nghiệm không đủ mẫu; PII trong targeting.

---

### Q39. Incident production trên mobile: quy trình? [S]

**Trả lời:** Detect (alert/crash-free drop) → triage/severity → mitigate: tắt flag, rollback
server, hotfix/forced update, thông báo. Mobile không rollback tức thì do store review, nên
chuẩn bị kill switch, remote config, version gating, staged rollout. Sau đó RCA/postmortem,
action item, cải thiện test/observability.

**Điểm cộng:** phân biệt server-side fix vs client; communicate ETA; không đổ lỗi; lưu
artifact/symbol; kiểm tra phiên bản bị ảnh hưởng.

---

### Q40. Staff/Lead: chọn build vs buy và định hướng kỹ thuật? [S]

**Trả lời:** Đánh giá core competency, total cost of ownership, time-to-market, rủi ro
vendor lock-in, bảo mật, khả năng tuyển dụng. Build khi là lợi thế cạnh tranh/domain đặc
thù; buy khi commodity. Viết ADR, đo kết quả, đặt exit criteria, review định kỳ.

**Điểm cộng:** nói về chi phí ẩn (maintain, upgrade, on-call), chiến lược 2–3 năm, mentoring,
tạo guardrails thay vì kiểm soát từng dòng code.

---

## 8. Kiến trúc quy mô lớn

### Q41. Làm sao tách monolith Flutter thành module mà không trễ roadmap? [S]

**Trả lời:** Bắt đầu bằng **seams**: tách domain/core dùng chung, sau đó feature ít phụ
thuộc; viết test/contract trước; di chuyển dần, giữ API tương thích; đo build time và
merge conflict. Không big-bang. Dùng feature flag để ship độc lập.

**Bẫy:** tách package trước khi hiểu boundary; import chéo; package hoá mọi thứ; không
đầu tư CI.

---

### Q42. Làm sao đánh giá một đề xuất kiến trúc? [S]

**Trả lời:** Xác định vấn đề, giả thuyết, option, trade-off (complexity, cost, time,
risk), khả năng đảo ngược, ảnh hưởng team/vận hành. Yêu cầu PoC/benchmark nếu tác động
lớn; ADR ghi quyết định; review sau một thời gian.

**Điểm cộng:** ưu tiên giải pháp đơn giản nhất đủ dùng; tính chi phí cơ hội; không chạy
theo trend; đo bằng outcome.

---

## 9. System design nâng cao

### Q43. Thiết kế offline-first + realtime cho app guestbook có moderation. [S]

**Trả lời:** Local DB (Drift) + outbox: ghi local `pending`, sync API, server trả
`id/status`, WS event cập nhật. Moderation: message `pending/approved/rejected`; client chỉ
hiển thị approved cho khách, pending cho chủ; poll/WS trạng thái. Conflict: server thắng
cho nội dung đã sync; draft local giữ. Reconnect: cursor + dedupe; push cho moderation.
Bảo mật: auth, rate limit, XSS sanitize, report/block.

**Điểm cộng:** xử lý xóa/GDPR, spam, ảnh, scale read, cache, observability, test mất mạng.

---

### Q44. Thiết kế hệ thống feature flag + rollout cho app đã phát hành. [S]

**Trả lời:** Server config phân theo app version/platform/user cohort; client cache + default
an toàn; flag có owner/expiry; kill switch; audit; metric theo cohort; rollout 1% → 10% →
50% → 100%; rollback tức thì. Với thay đổi lớn, kèm migration tương thích hai chiều.

**Bẫy:** đổi schema/API không tương thích; flag bật cho user cũ; không quan sát; flag rác.

---

### Q45. Thiết kế CI/CD cho team 20 dev, release hàng tuần. [S]

**Trả lời:** Trunk-based + feature flag; pipeline PR nhanh (format/analyze/unit/widget),
pipeline main build artifact; nightly integration/device farm/golden; signing tự động;
version tự tăng; release branch cho hotfix; staged rollout; dashboard; owner rõ. Tối ưu
cache, chia job, tránh test flaky.

**Điểm cộng:** đo lead time, failure rate, MTTR; rollback plan; artifact retention; security
scan; dependency update tự động.

---

## 10. Behavioral và leadership

### Q46. Kể về một incident bạn xử lý. Bạn học được gì? [S]

**Trả lời:** Áp dụng theo STAR. **S (Tình huống):** Sau khi release tính năng guestbook, tỷ lệ crash-free giảm mạnh. **T (Nhiệm vụ):** Xác định nguyên nhân, hạn chế thiệt hại và ngăn tái diễn trong thời gian ngắn. **A (Hành động):** Rollback build/áp dụng kill-switch, phân tích log/crash report (stack trace + JSON gây lỗi), thêm defensive parsing với null-safety cho model, viết unit test reproducing JSON thực tế, cập nhật mapping API, bổ sung alert theo crash-free rate và viết postmortem ngắn với action item. **R (Kết quả):** Crash-free phục hồi >99.5%, thời gian phát hiện/khắc phục giảm rõ rệt, các action item được theo dõi đến khi đóng.

**Bài học:** Schema evolution giữa client-server phải đảm bảo backward compatible; client cần "defensive" với dữ liệu từ API; cần contract test, feature flag/kill-switch và quy trình rollback rõ ràng.

**Điểm cộng:** Nêu số liệu cụ thể, nói rõ vai trò của bản thân, tập trung vào hệ thống/process chứ không chỉ fix code; không đổ lỗi.

---

### Q47. Bạn xử lý technical debt thế nào khi deadline gấp? [S]

**Trả lời:** Phân loại debt theo rủi ro (crash, bảo mật, tốc độ) và chi phí; trả ngay phần
chặn feature/an toàn; ghi lại phần còn lại với owner/ngày; thương lượng scope; dùng
strangler pattern, feature flag, test bao quanh; đo impact. Không âm thầm bỏ qua.

**Bẫy:** "làm lại từ đầu"; trả nợ không kiểm chứng; biến tech debt thành dự án không hồi kết.

---

### Q48. Bạn bất đồng với tech lead/đồng đội về kiến trúc. Làm gì? [S]

**Trả lời:** Làm rõ mục tiêu chung, viết ra giả định; đề xuất PoC/benchmark; so sánh trade-off
bằng dữ liệu; lắng nghe ràng buộc (deadline, team); nếu vẫn khác, theo quyết định tập thể
và ghi ADR; có thể đề xuất thử nghiệm nhỏ. Không biến bất đồng thành công kích cá nhân.

---

### Q49. Bạn mentoring junior thế nào để họ tiến bộ? [S]

**Trả lời:** Đặt mục tiêu cụ thể, pairing, review có giải thích "vì sao", giao việc tăng dần
độ khó, khuyến khích hỏi, tạo môi trường an toàn để sai, feedback thường xuyên, đo tiến bộ
qua output/độc lập. Không chỉ sửa code hộ.

**Điểm cộng:** điều chỉnh theo phong cách học; tạo checklist/tài liệu; trao ownership.

---

### Q50. Bạn estimate một feature Flutter mới thế nào? [S]

**Trả lời:** Chia nhỏ theo luồng (UI, state, API, storage, test, release), làm rõ unknown
(design, API contract, native plugin), thêm buffer cho integration/store, tham khảo dữ liệu
quá khứ, nêu giả định và dependency. Ước lượng theo range, không một con số; cập nhật khi
học thêm.

**Bẫy:** bỏ qua QA/accessibility/migration; cam kết ngày khi chưa rõ API; không tính thời
gian review/store.

---

## 11. Câu hỏi bổ sung (cập nhật)

> Các chủ đề Senior hay bị đào sâu: Impeller/shader, compositing native view, FFI, isolate
> dài hạn, profiling nâng cao, supply chain, rollout và quyết định kiến trúc dài hạn.

**Rendering, text và compositing**

### Q51. Impeller khác Skia thế nào? Shader compilation jank xử lý ra sao? [S]

**Trả lời:** Impeller biên dịch shader trước (AOT) và thiết kế cho GPU hiện đại, giảm jank
lần đầu do shader compile — vấn đề thường gặp với Skia. Skia biên dịch shader runtime, có
thể gây spike frame đầu. Impeller không loại bỏ jank do layout/paint/overdraw; vẫn cần
profile. Trên một số thiết bị/plugin cũ có thể còn fallback Skia.

**Điểm cộng:** biết `--enable-impeller`/fallback, đo bằng timeline cả frame đầu; warm-up
không phải giải pháp bền vững; shader riêng (`FragmentProgram`) vẫn cần kiểm tra compile/
cache; don't blame renderer before measuring.

---

### Q52. Raster cache hoạt động thế nào? Khi nào `saveLayer` gây hại? [S]

**Trả lời:** Raster cache lưu layer phức tạp thành texture để tái sử dụng khi transform ổn
định; nhưng cache tốn memory và chỉ có lợi khi layer được vẽ lại nhiều lần. `saveLayer`
(qua `Opacity`, `BlendMode`, shadow, clip phức tạp) buộc engine render offscreen rồi composite,
tăng bandwidth/memory, dễ gây jank.

**Điểm cộng:** thay `Opacity` bằng alpha màu/`FadeTransition` khi có thể; dùng
`RepaintBoundary` có chọn lọc; kiểm tra overdraw; đo raster thread; không bọc mọi thứ trong
`RepaintBoundary` vì tăng layer/texture.

---

### Q53. PlatformView và Texture hoạt động thế nào? Chi phí composition? [S]

**Trả lời:** `PlatformView` nhúng native view (map, WebView, camera preview); có hai chế độ
hybrid composition (Android) và virtual display, ảnh hưởng đồng bộ/performance. `Texture`
chia sẻ texture từ native (camera/video) hiệu quả hơn cho nội dung động nhưng cần quản lý
lifecycle. Cả hai đều phá vỡ "Flutter vẽ tất cả", nên cần test kỹ.

**Bẫy:** lạm dụng PlatformView trong list cuộn gây jank; memory native không được giải phóng;
z-order/clip/opacity không như widget thường; lifecycle khi background; accessibility cần
native bridge.

---

### Q54. Accessibility ở quy mô lớn: semantics và custom action? [S]

**Trả lời:** Xây dựng semantics như một phần của design system: role, label, hint, value,
action; dùng `Semantics`/`MergeSemantics`/`SemanticsService.announce`; custom action cho
widget phức tạp (chart, carousel); đảm bảo focus order và không nuốt gesture của screen
reader. Test tự động guideline + test tay TalkBack/VoiceOver.

**Điểm cộng:** audit theo màn hình, có owner; test text scale/RTL/reduced motion; không chỉ
thêm label mà bỏ qua thứ tự đọc; theo dõi lỗi accessibility trong CI nếu có.

---

### Q55. Text layout nâng cao gồm những gì? Font fallback và variable font? [S]

**Trả lời:** Flutter dùng `TextPainter`/`Paragraph` (Skia/Impeller) với `TextStyle`,
`TextScaler`, locale; font fallback theo platform và khai báo `fontFamilyFallback`. Variable
font cho phép nhiều weight từ một file nhưng cần kiểm tra rendering/đo; font lớn ảnh hưởng
startup/size. Với text phức tạp (Arabic, emoji, CJK), cần test shaping/line breaking.

**Bẫy:** giả định font giống nhau giữa iOS/Android; thiếu glyph làm tofu; dùng `height`/leading
sai gây cắt chữ; quên `textScaler` khi tính layout; không subset font.

---

**Concurrency và native interop**

### Q56. Long-lived background isolate và `IsolateNameServer` dùng thế nào? [S]

**Trả lời:** Isolate dài hạn phù hợp xử lý CPU liên tục (parse lớn, crypto, audio) và sống
độc lập với UI; giao tiếp qua `SendPort`/`ReceivePort`. `IsolateNameServer` cho phép tìm
port theo tên (ví dụ từ isolate khác hoặc callback native). Cần quản lý lifecycle, lỗi,
backpressure và tắt isolate khi không dùng.

**Bẫy:** giữ isolate sống mãi gây pin; gửi object lớn qua port tốn copy; không xử lý isolate
chết; dùng isolate cho I/O không cần thiết; tưởng background isolate chạy khi app bị kill.

---

### Q57. Platform channel có chi phí gì? Khi nào dùng Pigeon và batching? [S]

**Trả lời:** Mỗi message qua `BinaryMessenger` phải serialize/deserialize và chuyển thread;
gọi nhiều lần nhỏ gây overhead. Pigeon sinh code type-safe, giảm lỗi string key và boilerplate.
Với dữ liệu lớn, batch hoặc dùng `Texture`/FFI; tránh gọi channel mỗi frame.

**Điểm cộng:** đo thời gian round-trip; chạy native work ngoài main thread; xử lý lỗi/exception
qua `ErrorCode`; version API native; test integration trên cả hai nền tảng.

---

### Q58. FFI: quản lý memory và native crash thế nào? [S]

**Trả lời:** `dart:ffi` cho gọi C/C++ trực tiếp; memory cấp phát bằng `malloc`/`calloc` phải
giải phóng thủ công hoặc dùng `NativeFinalizer`/`Arena`. Struct phải khớp layout/ABI; chuỗi
dùng `Utf8` pointer và free đúng allocator. Native crash (segfault) làm chết cả process,
không catch được bằng Dart.

**Bẫy:** use-after-free; sai kiểu/size struct; gọi native trên isolate sai; thiếu symbol trong
release; không test trên ABI thật (arm64/x86_64); block UI bằng native call dài.

---

### Q59. Nhúng native view hoặc nhiều Flutter engine: lưu ý gì? [S]

**Trả lời:** Add-to-app/nhiều engine phù hợp tích hợp dần vào app native, nhưng mỗi engine
có chi phí memory/khởi tạo và state riêng; cần chia sẻ dữ liệu qua platform channel, quản lý
route/lifecycle, và tránh nhiều engine nếu không cần. Native view nhúng cần xử lý keyboard,
safe area, theme và accessibility.

**Điểm cộng:** đánh giá chi phí trước khi chọn; ưu tiên một engine + nhiều entrypoint; đo
startup/memory; kế hoạch migration; test lifecycle background/foreground.

---

### Q60. `Isolate.run` có giới hạn gì? Khi nào cần truyền dữ liệu lớn? [S]

**Trả lời:** `Isolate.run` tạo isolate một lần, chạy closure, trả kết quả rồi thoát; tiện cho
tác vụ CPU one-shot. Closure bị giới hạn: không capture object không gửi được (ví dụ socket,
một số native handle), mỗi lần gọi có chi phí spawn. Dữ liệu lớn nên dùng
`TransferableTypedData` để tránh copy, hoặc isolate pool cho nhiều tác vụ.

**Bẫy:** spawn isolate cho việc rất nhỏ; gửi object lớn lặp lại; giả định được dùng
`BuildContext`/plugin trong isolate; không xử lý lỗi/stack; block UI chờ isolate.

---

**Performance và profiling nâng cao**

### Q61. Layout thrash và intrinsic pass là gì? Cách phát hiện và sửa? [S]

**Trả lời:** Layout thrash xảy ra khi nhiều widget phải layout lại trong cùng frame do
constraint thay đổi hoặc phụ thuộc chéo; intrinsic pass buộc đo kích thước tự nhiên trước
khi layout thật, chi phí tăng theo độ sâu. Phát hiện bằng timeline (nhiều `Layout`), debug
paint, và thử bỏ intrinsic/`shrinkWrap`/scroll lồng.

**Cách sửa:** cố định `itemExtent`/`prototypeItem`, tránh `IntrinsicHeight` trong list,
`RepaintBoundary` đúng chỗ, giảm lồng scroll, dùng sliver, tránh `LayoutBuilder` bao trùm
phần lớn cây.

---

### Q62. Debug memory leak nâng cao: heap snapshot và `leak_tracker`? [S]

**Trả lời:** Chụp heap trước/sau thao tác lặp, ép GC, so sánh số instance/retained size; xem
retaining path để tìm object giữ tham chiếu (listener, closure, static, cache). `leak_tracker`
theo dõi object được dispose đúng trong test; Instruments/Android Studio cho native memory.
Phân biệt cache tăng hợp lý với leak thật.

**Bẫy:** snapshot khi chưa GC; debugger giữ object; chỉ nhìn Dart heap mà bỏ native; sample
quá ngắn; không tái hiện đúng luồng mở/đóng màn hình; bỏ qua image cache.

---

### Q63. Giảm startup sâu: deferred components, engine warm-up, blank screen? [S]

**Trả lời:** Tách time-to-first-frame và time-to-interactive; đo `--trace-startup`, timeline,
platform logs. Giảm plugin/init đồng bộ, lazy DI, preload asset/font có kiểm soát, cache
config, dùng splash/placeholder đúng nghĩa (không che lỗi), deferred components cho Android,
và giữ main isolate nhẹ.

**Điểm cộng:** không init analytics/ads trước UI; tránh I/O đồng bộ; đo trên thiết bị thấp;
theo dõi cold/warm start riêng; đặt budget và alert regression; cẩn thận deferred component
làm tăng độ phức tạp.

---

### Q64. Benchmark hiệu năng và chặn regression trong CI thế nào? [S]

**Trả lời:** Dùng integration test + `traceAction`/Timeline để đo frame, startup; chạy trên
device farm/profile mode với dữ liệu cố định; lưu baseline theo thiết bị/version; so sánh
p95/p99 thay vì trung bình; gate PR lớn hoặc release; cảnh báo khi vượt ngưỡng. Benchmark
phải ổn định (cùng máy, cùng build mode) mới có ý nghĩa.

**Bẫy:** đo debug; máy nóng; sample nhỏ; chỉ đo một lần; bỏ qua nhiễu mạng; gate quá chặt
gây flaky; tối ưu vi mô không ảnh hưởng UX.

---

**Security, supply chain và release**

### Q65. Certificate pinning: triển khai và rotation thế nào? [S]

**Trả lời:** Pin public key/SPKI hoặc cert của CA, không chỉ leaf cert để giảm rủi ro rotation;
luôn có ít nhất hai pin (hiện tại + dự phòng), thời hạn, và kế hoạch cập nhật qua app release.
Pinning tăng chống MITM nhưng có thể làm app chết nếu sai cấu hình; cần test và telemetry
riêng, fallback có kiểm soát.

**Bẫy:** pin cert hết hạn làm toàn bộ user cũ fail; không có quy trình rotate; pin trong code
mà không test; dùng pinning thay cho TLS đúng; bỏ qua proxy doanh nghiệp.

---

### Q66. Jailbreak/root detection có đáng tin không? Phòng thủ thế nào? [S]

**Trả lời:** Chỉ là **tín hiệu**, không phải bảo mật tuyệt đối: thiết bị root/jailbreak có
thể ẩn bằng hook. Kết hợp nhiều dấu hiệu (integrity, safetynet/play integrity, debugger,
hook), nhưng quyết định bảo mật phải ở server: attestation, rate limit, phát hiện bất thường,
token ngắn hạn, không chứa secret/authorization quan trọng ở client.

**Điểm cộng:** tránh chặn user hợp lệ quá mức; cân nhắc privacy; log/telemetry; test trên
thiết bị thật; hiểu đây là phòng thủ theo lớp, không phải chốt chặn duy nhất.

---

### Q67. Quản lý secret và mô hình tin cậy client thế nào? [S]

**Trả lời:** Client không đáng tin: mọi secret nhúng trong app đều có thể bị lấy. API key
cần hạn chế theo platform/bundle id hoặc để ở BFF; OAuth dùng PKCE; token ngắn hạn + refresh
+ revoke; server authorize mọi request. Không dùng "obfuscation" như bảo mật.

**Bẫy:** nhúng service account/private key; dùng client secret cho OAuth confidential; log
token; tin `isPremium` do client gửi; không rotate key; không có rate limit.

---

### Q68. Supply chain và license compliance cho app mobile? [S]

**Trả lời:** Audit dependency (transitive), theo dõi CVE, pin version/lockfile, kiểm tra
package maintainer, tránh package bỏ hoang; tạo SBOM; quét license (GPL/AGPL có thể ảnh
hưởng phân phối), lưu NOTICE; CI chặn dependency lạ/không nguồn gốc. Với native SDK, kiểm
tra privacy manifest và tracking.

**Điểm cộng:** tự động hoá license/CVE; review package mới; có quy trình nâng cấp; cân nhắc
vendor/fork; theo dõi yêu cầu store (privacy, SDK index).

---

### Q69. Staged rollout, kill switch và rollback trên mobile thế nào? [S]

**Trả lời:** Phát hành theo tỷ lệ (Play staged, iOS phased release), theo dõi crash-free/ANR/
metric; có remote config/feature flag để tắt tính năng mà không cần build mới; chuẩn bị
rollback server-side vì app đã phát hành không thể thu hồi. Version API tương thích ngược,
force update khi cần.

**Bẫy:** rollout 100% ngay; không có kill switch; flag không có default an toàn; phụ thuộc
app update để sửa incident; không theo dõi version/thiết bị; schema backend phá vỡ app cũ.

---

**System design và leadership nâng cao**

### Q70. Thiết kế realtime moderation và chống abuse cho guestbook? [S]

**Trả lời:** Luồng: client gửi wish kèm idempotency key → API validate/rate limit → hàng đợi
→ moderation (rule + ML + human) → trạng thái `pending/approved/rejected` → realtime chỉ
phát approved cho guest; author thấy trạng thái của mình. Có report/block, audit log, retry,
và tombstone khi xoá.

**Điểm cộng:** chống spam (rate limit theo IP/user/device, captcha), chống ảnh độc hại,
PII redaction, chống replay, backpressure, chi phí moderation, minh bạch chính sách; xử lý
khi moderation lỗi (fail closed hay queue).

---

### Q71. Đồng bộ nhiều thiết bị cùng user: chọn mô hình nào? [S]

**Trả lời:** Xác định dữ liệu chia sẻ (wish, draft, seen state), độ trễ chấp nhận và xung
đột. Ưu tiên server authoritative + version/ETag; client gửi mutation kèm base version;
server trả conflict để client merge/reload. Với collaborative realtime, cân nhắc CRDT/OT
nhưng chi phí cao; với guestbook, last-write-wins có audit thường đủ.

**Bẫy:** dùng timestamp client làm nguồn sự thật; không có version; sync hai chiều không
idempotent; tombstone thiếu gây "sống lại" dữ liệu đã xoá; không test hai thiết bị offline.

---

### Q72. Distributed tracing cho mobile khác backend thế nào? [S]

**Trả lời:** Mobile tạo `trace_id`/`span` cho flow (app start → API → render), truyền
correlation id qua header để backend nối; sample theo tỷ lệ và theo lỗi; tránh PII; lưu
breadcrumb/attribute (version, network, device) để tái hiện. Không thể trace mọi thứ vì chi
phí/pin; ưu tiên luồng quan trọng và lỗi.

**Điểm cộng:** liên kết crash ↔ API ↔ backend log; đo cold start/checkout; kiểm soát sampling
trong app; tôn trọng consent; có dashboard end-to-end; không dùng trace thay metric.

---

### Q73. ADR/RFC là gì? Vì sao team Senior cần? [S]

**Trả lời:** ADR ghi lại quyết định kiến trúc: bối cảnh, lựa chọn, trade-off, hệ quả, trạng
thái; RFC mở rộng để lấy ý kiến trước khi làm. Giúp người mới hiểu "vì sao", tránh tranh
luận lặp, và có căn cứ khi thay đổi. ADR ngắn, versioned trong repo, cập nhật khi bị thay thế.

**Điểm cộng:** template rõ; review trong PR; gắn owner/ngày; không dùng để hợp thức hoá quyết
định đã rồi; lưu cả phương án bị loại; định kỳ rà soát.

---

### Q74. Migrate state management/kiến trúc mà không rewrite toàn bộ? [S]

**Trả lời:** Chọn boundary nhỏ (một feature/màn hình), thêm lớp adapter để code cũ và mới
cùng chạy, viết test đặc trưng trước, migrate theo strangler-fig, đo sau mỗi bước, và có
tiêu chí dừng. Tránh "big bang"; giữ tương thích router/DI trong giai đoạn chuyển.

**Điểm cộng:** lộ trình theo sprint, feature flag, rollback; đào tạo team; xoá code cũ có kế
hoạch; theo dõi bug/perf; không migrate vì trend mà không có lý do đo được.

---

### Q75. Năm 2026, chọn Flutter, native hay KMP thế nào? [S]

**Trả lời:** Không có lựa chọn tuyệt đối. Flutter mạnh về UI đồng nhất, tốc độ ship đa nền
tảng, hệ sinh thái widget; native mạnh khi cần tích hợp sâu (camera/AR/HealthKit), hiệu năng
tối đa, team đã có; KMP hấp dẫn khi cần chia sẻ logic với UI native. Đánh giá theo roadmap,
kỹ năng team, chi phí dài hạn, yêu cầu nền tảng và rủi ro tuyển dụng.

**Điểm cộng:** nêu tiêu chí đo (time-to-market, chi phí bảo trì, hiệu năng, số nền tảng,
talent); chấp nhận trade-off; có kế hoạch thoát; không chọn theo cảm tính hay benchmark
không liên quan.

---

## 12. Tài liệu tham khảo

- Flutter architectural overview: https://docs.flutter.dev/resources/architectural-overview
- Flutter rendering: https://docs.flutter.dev/resources/rendering
- Impeller: https://docs.flutter.dev/perf/impeller
- Dart isolates: https://dart.dev/language/concurrency
- Platform channels: https://docs.flutter.dev/platform-integration/platform-channels
- Pigeon: https://pub.dev/packages/pigeon
- Dart FFI: https://dart.dev/interop/c-interop
- Flutter performance: https://docs.flutter.dev/perf
- OWASP MASVS: https://mas.owasp.org/MASVS/
- Flutter security: https://docs.flutter.dev/security

---

*Tiếp tục với [`04-scenarios.md`](./04-scenarios.md) để luyện tình huống và rapid-fire.*
