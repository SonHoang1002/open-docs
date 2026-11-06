# Flutter cơ bản — Từ Dart đến ứng dụng thực tế

> Nền tảng toàn diện: Dart 3, widget/layout, form, state, HTTP, WebSocket, testing,
> debug. Ví dụ dùng domain trung lập (danh sách đơn hàng/lời nhắn/tin tức) với API REST
> và WebSocket để minh họa realtime. Tất cả đều áp dụng cho app Flutter bất kỳ.

> 📌 Bám Flutter 3.x/Dart 3.x. Code là ví dụ tối giản, không phụ thuộc backend cụ thể.
> Mỗi mục có bảng, blockquote thực chiến, lỗi thường gặp và checklist.

---

## Mục lục

1. [Dart cơ bản](#1-dart-cơ-bản) — [1.1](#11-biến-và-null-safety) · [1.2](#12-kiểu-collection-hàm) · [1.3](#13-class-mixin-extension) · [1.4](#14-asyncawait-futurestream-isolate) · [1.5](#15-record-pattern-switch-và-sealed-class) · [1.6](#16-enum-nâng-cao) · [1.7](#17-generics-typedef-static-và-factory) · [1.8](#18-operator-equality-immutable-model-và-pure-function) · [1.9](#19-lỗi-thường-gặp-khi-học-dart)
2. [Widget và ba cây](#2-widget-và-ba-cây) — [2.1](#21-widget-element-build-purity-và-setstate) · [2.2](#22-lifecycle-state-và-didupdatewidget) · [2.3](#23-keys) · [2.4](#24-const-repaintboundary-và-inheritedwidget) · [2.5](#25-lỗi-thường-gặp)
3. [Layout](#3-layout) — [3.1](#31-container-row-column) · [3.2](#32-stack-positioned) · [3.3](#33-listview-gridview-slivers) · [3.4](#34-responsive) · [3.5](#35-constraints-overflow-và-unbounded) · [3.6](#36-flex-expanded-flexible-stack-wrap-và-scroll) · [3.7](#37-safearea-mediaquery-layoutbuilder-text-overflow-và-responsive)
4. [Style và theme](#4-style-và-theme) — [4.1](#41-material-3-colorscheme-texttheme-và-dark-mode) · [4.2](#42-asset-font-và-themeextension) · [4.3](#43-lỗi-và-checklist-theme)
5. [Navigation cơ bản](#5-navigation-cơ-bản) — [5.1](#51-navigator-named-routes-và-arguments) · [5.2](#52-popscope-go_router-và-context-async) · [5.3](#53-lỗi-navigation-thường-gặp)
6. [Form và input](#6-form-và-input) — [6.1](#61-controller-focusnode-và-dispose) · [6.2](#62-validation-keyboard-autofill-và-formatter) · [6.3](#63-debounce-submit-picker-và-form-trong-listview) · [6.4](#64-lỗi-form-thường-gặp)
7. [State cơ bản](#7-state-cơ-bản) — [7.1](#71-local-state-lifting-state-và-inheritedwidget) · [7.2](#72-valuenotifier-changenotifier-provider-riverpod-và-bloc) · [7.3](#73-khi-nào-dùng-gì-và-lỗi-thường-gặp)
8. [Async và HTTP](#8-async-và-http) — [8.1](#81-event-loop-future-và-asyncawait) · [8.2](#82-futurewait-eagererror-unawaited-timeout-và-retry) · [8.3](#83-stream-streamcontroller-backpressure-và-timer) · [8.4](#84-zone-isolate-và-compute) · [8.5](#85-http-json-utf-8-pagination-và-error-mapping) · [8.6](#86-futurebuilder-dispose-và-fake-client) · [8.7](#87-lỗi-async-và-http-thường-gặp)
9. [Local storage](#9-local-storage) — [9.1](#91-shared_preferences-và-secure-storage) · [9.2](#92-sqflite-drift-bảo-mật-và-lỗi)
10. [Realtime với WebSocket](#10-realtime-với-websocket) — [10.1](#101-event-schema-lifecycle-và-reconnect) · [10.2](#102-backoff-auth-close-code-app-lifecycle-và-offline) · [10.3](#103-dedupe-test-và-lỗi-thường-gặp)
11. [Animation cơ bản](#11-animation-cơ-bản) — [11.1](#111-implicit-explicit-animationcontroller-và-dispose) · [11.2](#112-curves-hero-reduce-motion-và-lỗi)
12. [Testing cơ bản](#12-testing-cơ-bản) — [12.1](#121-unit-test-widget-test-và-matchers) · [12.2](#122-pump-golden-integration-và-fake-client) · [12.3](#123-coverage-flaky-test-và-lỗi)
13. [Debug và DevTools](#13-debug-và-devtools) — [13.1](#131-flutter-devtools-widget-performance-memory-network) · [13.2](#132-logging-error-handling-và-fluttererror) · [13.3](#133-breakpoint-inspect-hot-reload-và-lỗi-thường-gặp)
14. [Build và release](#14-build-và-release) — [14.1](#141-flavors-entrypoint-dart-define-và-biến-môi-trường) · [14.2](#142-android-signing-ios-signing-và-ci) · [14.3](#143-kích-thước-app-obfuscate-crash-reporting-và-version) · [14.4](#144-play-store-app-store-và-checklist-release) · [14.5](#145-lỗi-build-thường-gặp)
15. [Câu hỏi thường gặp](#15-câu-hỏi-thường-gặp) — [15.1](#151-bài-tập-thực-hành) · [15.2](#152-gợi-ý-kiến-trúc-và-lộ-trình) · [15.3](#153-tài-liệu-tham-khảo-nhanh)
16. [Anti-patterns](#16-anti-patterns)
17. [Checklist](#17-checklist)
18. [Tài liệu tham khảo](#18-tài-liệu-tham-khảo)

---

## 1. Dart cơ bản

### 1.1 Biến và null safety

```dart
var count = 0;                 // int, gán lại được
final name = 'Minh';           // gán một lần (runtime)
const maxGuests = 2;           // hằng compile-time
late final DateTime loadedAt;  // khởi tạo sau, vẫn chỉ gán một lần

String? guestOf;
final length = guestOf?.length ?? 0;          // fallback
if (guestOf != null) print(guestOf.length);   // được promote
final risky = guestOf!;                       // có thể crash nếu null
```

Mặc định dùng `final`, `const` cho widget/cấu hình. Toán tử: `?.`, `??`, `??=`, `!`
(hạn chế), `late`. Dart tách `String` và `String?`; compiler buộc xử lý null.

| Từ khóa | Gán lại | Khởi tạo | Ghi chú |
|---|---|---|---|
| `var` | Được | Ngay/sau | Kiểu suy ra lần gán đầu |
| `final` | Không | Một lần, runtime | Mặc định cho local/field |
| `const` | Không | Compile-time | Canonicalize; dùng cho widget |
| `late final` | Không | Một lần, sau | Hữu ích trong `initState` |
| `late` | Được | Sau | Dễ `LateInitializationError` |

`const` yêu cầu biểu thức hằng; `final` chỉ khóa tham chiếu, object bên trong vẫn có
thể mutable. Promotion chỉ chắc chắn với biến local; field công khai/getter có thể đổi
giữa hai lần đọc nên không được promote.

```dart
String describe(String? name) {
  if (name == null || name.isEmpty) return 'Khách';
  return name.toUpperCase(); // promoted
}

class User { User(this.nickname); String? nickname; }
void printNickname(User user) {
  final nickname = user.nickname; // copy ra local mới promote được
  if (nickname != null) print(nickname.length);
}
```

> ⚠️ Mỗi `!` là một điểm crash: chỉ dùng khi chắc chắn không null. Với JSON, parse
> phòng thủ bằng `as String? ?? ''` hoặc `?.toString() ?? ''`.

> ⚠️ `late` không phải cách né null safety. Đọc trước khi gán → `LateInitializationError`.
> Controller nên tạo ở field/`initState`, không tạo trong `build`.

- [ ] Biến không gán lại dùng `final`; hằng/cấu hình/widget dùng `const`.
- [ ] Không lạm dụng `!`; field nullable có quy ước rõ khi nào null.
- [ ] Controller/stream/timer khởi tạo đúng chỗ và dispose.

### 1.2 Kiểu, collection, hàm

```dart
final wishes = <String>['Chúc mừng!', 'Trăm năm hạnh phúc'];
final counts = <String, int>{'attending': 120, 'declined': 8};
final ids = <int>{1, 2, 3};
final pair = (name: 'Minh', guests: 2);       // record (Dart 3)
final total = counts.values.fold(0, (sum, value) => sum + value);

int attendeeCount(bool willAttend, int number) => willAttend ? number : 0;
String greeting({required String name, String prefix = 'Chào'}) => '$prefix $name';
```

`List` giữ thứ tự, `Set` chống trùng, `Map` tra cứu, record trả nhiều giá trị nhỏ. Hàm
là first-class object, truyền/nhận như biến.

```dart
final base = [1, 2];
final more = [...base, 3, if (includeFour) 4, for (final n in [5, 6]) n * 2];
final merged = {...mapA, ...mapB};
final maybeNull = <int>[...?nullableList];

final buffer = StringBuffer()
  ..write('Xin chào ')
  ..write(name)
  ..writeln('!');
```

- `if`/`for` trong collection tạo list theo điều kiện; `...?` bỏ qua nguồn null.
- `List.filled(3, <int>[])` tạo 3 tham chiếu cùng một list; dùng `List.generate`.
- `int`/`double` đều là `num`; JSON nên đọc `as num?` rồi `.toInt()`.
- `DateTime` gửi API dạng UTC ISO-8601, hiển thị local; không so sánh `double` bằng `==`.

> ⚠️ Closure trong vòng lặp dùng chung biến `i`; dùng `final index = i;` nếu cần chụp
> giá trị tại thời điểm đó.

| Lỗi collection | Nguyên nhân | Xử lý |
|---|---|---|
| `RangeError` | Index ngoài phạm vi | Kiểm tra `isEmpty`/`length` |
| `Concurrent modification` | Sửa list khi đang `for` | Duyệt bản copy |
| `Unsupported operation` | Sửa list `const`/fixed | `toList()`/tạo list mới |
| `Bad state: No element` | `first` trên rỗng | `firstOrNull` hoặc kiểm tra |

### 1.3 Class, mixin, extension

```dart
mixin Timestamped {
  DateTime get createdAt;
}

class Wish with Timestamped {
  Wish({required this.senderName, required this.content, DateTime? createdAt})
      : createdAt = createdAt ?? DateTime.now();

  final String senderName;
  final String content;

  @override
  final DateTime createdAt;
}

extension NameInitials on String {
  String get initials => trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .take(2)
      .map((part) => part[0].toUpperCase())
      .join();
}
```

`mixin` chia sẻ hành vi không qua kế thừa; `extension` thêm method vào kiểu có sẵn.
Constructor có initializer list, named/redirecting constructor; `abstract interface class`
định nghĩa hợp đồng cho `implements`; composition thường tốt hơn kế thừa sâu.

```dart
abstract interface class MessageRepository {
  Future<List<Wish>> fetch();
  Future<Wish> create(Wish wish);
}

class Wish {
  Wish({required this.senderName, required this.content, DateTime? createdAt})
      : createdAt = createdAt ?? DateTime.now();
  Wish.guest(String name)
      : this(senderName: name, content: 'Chúc mừng!', createdAt: DateTime.now());
  final String senderName;
  final String content;
  final DateTime createdAt;
}
```

> ⚠️ Extension không thêm field, không override member đã có, không truy cập private
> thư viện khác. Tránh tên quá chung như `value`, `build`.

> 💡 Mixin có state; nếu chỉ cần hàm tiện ích, dùng extension. Nếu cần state + lifecycle,
> dùng composition hoặc mixin có chủ đích.

### 1.4 Async/await, Future/Stream, isolate

```dart
Future<List<Wish>> loadWishes() async {
  await Future<void>.delayed(const Duration(milliseconds: 300));
  return [Wish(senderName: 'Chị Hoa', content: 'Chúc mừng!')];
}

Stream<int> countdown() async* {
  for (var i = 3; i > 0; i--) {
    yield i;
    await Future<void>.delayed(const Duration(seconds: 1));
  }
}
```

`Future<T>` là một giá trị tương lai; `Stream<T>` là nhiều giá trị theo thời gian
(WebSocket, timer). Luôn `await` hoặc `try/catch`; đừng bỏ rơi Future.

Dart chạy một event loop mỗi isolate; đẩy tác vụ CPU nặng sang isolate bằng
`Isolate.run(() => ...)` (không chia sẻ biến). HTTP/WebSocket không cần isolate vì đã async.

- `try/catch` chỉ bắt lỗi của Future được `await` trong khối `try`; `rethrow` giữ stack.
- `Stream` single-subscription chỉ một listener; broadcast nhiều listener, không replay.
- `Isolate.run`/`compute` cho CPU nặng; dữ liệu phải sendable, không gửi `BuildContext`.
- I/O đã async, bọc isolate chỉ tăng overhead.

> ⚠️ `await a(); await b();` chạy tuần tự; `await Future.wait([a(), b()]);` mới song song.

### 1.5 Record, pattern, switch và sealed class

```dart
({String name, int guests}) guestSummary(Wish wish) =>
    (name: wish.senderName, guests: wish.numberAttend);

final summary = guestSummary(wish);
final (:name, :guests) = summary; // destructuring named fields

String label(Wish wish) => switch (wish) {
      Wish(willAttend: true, numberAttend: final n) when n > 0 => 'Sẽ đến ($n người)',
      Wish(willAttend: true) => 'Sẽ đến',
      Wish(willAttend: false) => 'Không đến',
    };
```

- Record immutable, equality theo cấu trúc; positional `(int, String)` khác named
  `({int id})`; list/map bên trong vẫn so sánh theo tham chiếu.
- Pattern: object, list `[final first, ...]`, map `{'id': final id}`, guard `when`, `_`.
- `if (json case {'id': final String id}) { ... }` dùng pattern trong if.

```dart
sealed class LoadState<T> { const LoadState(); }
final class Loading<T> extends LoadState<T> { const Loading(); }
final class Data<T> extends LoadState<T> {
  const Data(this.value);
  final T value;
}
final class Failure<T> extends LoadState<T> {
  const Failure(this.message);
  final String message;
}

Widget buildState(LoadState<List<Wish>> state) => switch (state) {
      Loading() => const CircularProgressIndicator(),
      Data(value: final items) => Text('${items.length} lời chúc'),
      Failure(message: final message) => Text(message),
    };
```

`sealed` cho compiler biết toàn bộ subtype trong cùng thư viện; thêm subtype mới làm mọi
switch thiếu nhánh báo lỗi compile. Đặt pattern cụ thể trước, tổng quát sau; tránh `_`
nếu muốn giữ kiểm tra exhaustive.

> ⚠️ Sealed class không thể bị `extend` từ package khác. `_`/`default` che mất lỗi khi
> thêm subtype mới.

### 1.6 Enum nâng cao

```dart
enum RsvpStatus {
  attending('Sẽ đến', 1),
  declined('Không đến', 0),
  maybe('Chưa chắc', 0);

  const RsvpStatus(this.label, this.guestWeight);
  final String label;
  final int guestWeight;

  bool get countsAsGuest => guestWeight > 0;

  static RsvpStatus fromApi(String value) => values.firstWhere(
        (status) => status.name == value,
        orElse: () => maybe,
      );
}
```

- Enhanced enum có field, constructor `const`, method/getter, implement interface.
- Serialize bằng `.name`, không dùng `.index` (đổi thứ tự sẽ phá dữ liệu cũ).
- `byName` ném lỗi nếu thiếu; dùng `asNameMap()[value]` hoặc fallback.
- Đổi tên value cần migration dữ liệu đã lưu.

> 💡 Enum khi mọi trạng thái cùng bộ field; `sealed class` khi mỗi trạng thái có dữ liệu
> khác nhau.

### 1.7 Generics, typedef, static và factory

```dart
class ApiResult<T> {
  const ApiResult.success(this.value) : error = null;
  const ApiResult.failure(this.error) : value = null;
  final T? value;
  final String? error;
  bool get isSuccess => error == null;
}

T maxOf<T extends Comparable<T>>(T a, T b) => a.compareTo(b) >= 0 ? a : b;

typedef JsonMap = Map<String, dynamic>;
typedef WishLoader = Future<List<Wish>> Function({String? before});
typedef Result<T> = ({T? data, Object? error});
```

Generic reified (kiểm tra `is T` runtime); typedef là alias, không tạo kiểu runtime.
Extension generic hữu ích:

```dart
extension NullableIterableX<T extends Object> on Iterable<T?> {
  Iterable<T> get nonNull => whereType<T>();
}
extension DurationX on int {
  Duration get seconds => Duration(seconds: this);
}
```

Static thuộc class, không có `this`, không đa hình; hạn chế static mutable. Factory dùng
để validate/parse, trả subtype/cache, hoặc ẩn constructor private; factory không có
`this` và phải `return`. `const` constructor yêu cầu mọi field `final` và giá trị hằng.

```dart
class Wish {
  Wish._({required this.id, required this.content});
  factory Wish.fromJson(JsonMap json) {
    final id = json['id']?.toString();
    if (id == null || id.isEmpty) throw const FormatException('Thiếu id');
    return Wish._(id: id, content: json['content']?.toString() ?? '');
  }
  final String id;
  final String content;
}

class ThemeTokens {
  const ThemeTokens({this.radius = 12, this.gap = 8});
  final double radius;
  final double gap;
}
```

> ⚠️ Singleton toàn cục khó test; ưu tiên inject. `const` chỉ bảo vệ tham chiếu, không
> đảm bảo deep immutability.

### 1.8 Operator, equality, immutable model và pure function

```dart
class Money {
  const Money(this.amount, this.currency);
  final int amount;
  final String currency;

  Money operator +(Money other) {
    if (currency != other.currency) throw ArgumentError('Khác tiền tệ');
    return Money(amount + other.amount, currency);
  }

  @override
  bool operator ==(Object other) =>
      other is Money && other.amount == amount && other.currency == currency;

  @override
  int get hashCode => Object.hash(amount, currency);

  @override
  String toString() => '$amount $currency';
}
```

- `==` phải đi với `hashCode`; object bằng nhau phải cùng hashCode.
- `identical` khác `==`; `Object.hash`/`hashAll` gộp field.
- So sánh list/map: `listEquals`/`mapEquals` (flutter/foundation) hoặc `ListEquality`.
- Không đưa field mutable vào hashCode nếu dùng làm key Map/Set.
- `toString` không chứa token/mật khẩu/PII.

```dart
@immutable
class Wish {
  const Wish({required this.id, required this.content, this.willAttend = false});
  final String id;
  final String content;
  final bool willAttend;

  Wish copyWith({String? id, String? content, bool? willAttend}) => Wish(
        id: id ?? this.id,
        content: content ?? this.content,
        willAttend: willAttend ?? this.willAttend,
      );
  Wish toggleAttendance() => copyWith(willAttend: !willAttend);
}
```

Pure function không sửa input/global, cùng input → cùng output; dễ test và an toàn trong
rebuild. `final` field không đảm bảo deep immutability: `final List<Wish>` vẫn có thể
`add`; trả ra ngoài bằng `List.unmodifiable`/`toList(growable: false)`.

> 💡 Tách transform (`applyWishEvent`, `filterWishes`, `totalGuests`) thành hàm thuần;
> widget chỉ render. Đây là cách rẻ nhất để giảm bug.

### 1.9 Lỗi thường gặp khi học Dart

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `Null check operator used on a null value` | Dùng `!` sai | `?.`/`??`/kiểm tra null |
| `LateInitializationError` | Đọc `late` trước khi gán | Gán sớm/đổi nullable |
| `Concurrent modification` | Sửa collection khi duyệt | Duyệt bản copy |
| `Cannot add to a fixed-length list` | List `const`/`List.filled` | `List.generate`/`toList()` |
| `type 'Null' is not a subtype` | Ép kiểu JSON sai | `as T? ?? fallback` |
| `RangeError` | Index ngoài phạm vi | Kiểm tra length |
| `Bad state: No element` | `first`/`single` trên rỗng | `firstOrNull` |
| `Switch expression is not exhaustive` | Thiếu nhánh | Thêm nhánh/`_` có chủ đích |
| `Unhandled Exception` sau `await` | Future lỗi không bắt | `try/catch`/`onError` |
| `NoSuchMethodError` | Gọi method trên `dynamic` | Khai báo kiểu cụ thể |

> 📌 Checklist: bật `flutter analyze`, sửa warning; dùng `prefer_final_locals`,
> `avoid_print`; model có `==`/`hashCode` khi cần; không dùng `dynamic` ở boundary;
> async luôn được await/xử lý lỗi.

---

## 2. Widget và ba cây

Widget là **mô tả bất biến của UI**. State đổi → widget mới được tạo, framework so
sánh và cập nhật render tối thiểu.

| Cây | Vai trò | Tồn tại |
|---|---|---|
| Widget tree | Cấu hình UI, rất nhẹ | Ngắn hạn |
| Element tree | Gắn widget với vị trí, giữ state | Dài hạn |
| Render tree | Layout + paint | Dài hạn |

| | StatelessWidget | StatefulWidget |
|---|---|---|
| State nội bộ | Không | Có (`State`) |
| Rebuild | Parent/Inherited đổi | `setState()` hoặc parent đổi |
| Ví dụ | Card lời chúc | Form RSVP, screen loading |

```dart
class GuestbookCounter extends StatefulWidget {
  const GuestbookCounter({super.key});
  @override
  State<GuestbookCounter> createState() => _GuestbookCounterState();
}

class _GuestbookCounterState extends State<GuestbookCounter> {
  int _count = 1;

  @override
  void dispose() { /* hủy controller/subscription/timer */ super.dispose(); }

  @override
  Widget build(BuildContext context) => TextButton(
        onPressed: () => setState(() => _count++),
        child: Text('$_count lời chúc'),
      );
}
```

Lifecycle: `initState` → `didChangeDependencies` → `build` → `didUpdateWidget` →
`deactivate` → `dispose`. Không gọi `setState` sau `dispose`; kiểm tra `mounted` sau
mỗi `await`. Dùng `ValueKey(wish.id)` cho item list; `GlobalKey` chỉ khi cần truy cập
state từ ngoài (ví dụ `GlobalKey<FormState>`).

### 2.1 Widget, Element, build purity và setState

- Widget immutable, tạo rẻ; Element giữ vị trí/State; RenderObject layout/paint.
- Parent rebuild: Flutter so `runtimeType` + `key`; khớp → update Element, khác → hủy
  State cũ.
- `build()` không gọi API/ghi storage/tạo controller/gọi `setState`, không side effect.
- `setState` chỉ khi mounted, dữ liệu UI thật đổi; không gọi trong `build`.
- `mounted` cho State; `context.mounted` cho context sau async gap.

```dart
Future<void> _refresh() async {
  final items = await _api.fetchMessages();
  if (!mounted) return;
  setState(() => _items = items);
}
```

> ⚠️ Gọi `setState` trong `initState` không cần thiết; gán field trước build đầu.
> Không dùng `setState` cho state không ảnh hưởng UI.

### 2.2 Lifecycle State và didUpdateWidget

| Phương thức | Khi nào | Dùng để |
|---|---|---|
| `initState` | Trước build đầu | Controller, subscription |
| `didChangeDependencies` | Inherited đổi | Đọc theme/locale |
| `build` | Render | Trả widget thuần |
| `didUpdateWidget` | Widget cha đổi | So sánh config, sync controller |
| `deactivate`/`activate` | Gỡ/gắn lại | Dọn nhẹ/khôi phục |
| `dispose` | Hủy vĩnh viễn | Hủy controller/timer/sub |
| `reassemble` | Hot reload | Debug |

```dart
@override
void didUpdateWidget(covariant WishEditor oldWidget) {
  super.didUpdateWidget(oldWidget);
  if (oldWidget.initialText != widget.initialText) {
    _controller.text = widget.initialText;
  }
}

@override
void dispose() {
  _subscription.cancel();
  _controller.dispose();
  super.dispose();
}
```

> ⚠️ `super.initState()` đầu, `super.dispose()` cuối. `didChangeDependencies` có thể chạy
> nhiều lần; đừng khởi tạo tài nguyên đắt không kiểm tra.

### 2.3 Keys

| Key | So sánh | Dùng khi |
|---|---|---|
| `ValueKey<T>(value)` | `==` value | Item list có id ổn định |
| `ObjectKey(object)` | identity | Object không có `==` tốt |
| `UniqueKey()` | luôn khác | Buộc tạo mới (hiếm) |
| `GlobalKey<T>()` | duy nhất app | Form, scaffold, truy cập State |
| `LocalKey` | base | Chung Value/Object/Unique |

```dart
ListView.builder(
  itemCount: wishes.length,
  itemBuilder: (context, index) => WishCard(
    key: ValueKey(wishes[index].id),
    wish: wishes[index],
  ),
)
```

> ⚠️ `ValueKey(index)` làm State gắn sai item khi sắp xếp/chèn/xóa. `UniqueKey()` mỗi
> build làm mất state/animation. `GlobalKey` trùng → `Duplicate GlobalKey`.

### 2.4 const, RepaintBoundary và InheritedWidget

- Widget `const` được canonicalize, không rebuild khi parent rebuild nếu vị trí không đổi.
- `RepaintBoundary` tách layer cho vùng animate liên tục cạnh vùng tĩnh; không bọc mọi
  thứ vì tốn memory/compositing.
- Giảm rebuild: chia widget nhỏ, `const`, `ValueListenableBuilder`/`Selector`,
  `itemExtent` cho list dài; đo bằng DevTools, đừng tối ưu cảm tính.

```dart
class WishScope extends InheritedWidget {
  const WishScope({super.key, required this.count, required super.child});
  final int count;

  static WishScope of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WishScope>()!;

  static WishScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WishScope>();

  @override
  bool updateShouldNotify(WishScope oldWidget) => count != oldWidget.count;
}
```

- `of` tạo dependency (rebuild khi notify); `maybeOf` optional; `getInherited...` đọc
  không dependency.
- `updateShouldNotify` so đúng field ảnh hưởng UI; `true` thừa gây rebuild, `false` sai
  gây UI cũ.
- Không gọi `dependOnInheritedWidgetOfExactType` trong `initState`; dùng
  `didChangeDependencies` hoặc build.

> 💡 Nhiều aspect độc lập → `InheritedModel`; app lớn → Provider/Riverpod.

### 2.5 Lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `setState() after dispose()` | Future/timer sau khi hủy | `mounted` + cancel |
| `Duplicate GlobalKey` | Dùng key ở hai nơi | Tạo key theo instance |
| State mất khi đổi tab | runtimeType/key đổi | `IndexedStack`, key ổn định |
| Rebuild quá nhiều | setState cha lớn | Chia nhỏ/`const`/selector |
| Context không hợp lệ | Dùng sau async gap | `context.mounted` |
| UI không cập nhật | Sửa list tại chỗ | Tạo list mới + setState |

---

## 3. Layout

Quy tắc: **constraints đi xuống, sizes đi lên, parent đặt vị trí**. Cha truyền
`min/maxWidth`, `min/maxHeight`; con chọn size; cha quyết định vị trí.

### 3.1 Container, Row, Column

```dart
Row(children: [
  const CircleAvatar(child: Icon(Icons.favorite)),
  const SizedBox(width: 12),
  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text('Ngọc Anh', style: Theme.of(context).textTheme.titleMedium),
    const Text('Sẽ đến · 2 người', maxLines: 1, overflow: TextOverflow.ellipsis),
  ])),
])
```

`Padding`/`SizedBox` nhẹ hơn `Container` khi không cần decoration. `Expanded` chiếm
phần còn lại theo `flex`; `Flexible` cho con nhỏ hơn phần chia. Trong `Column` cuộn
được, dùng `Expanded(child: ListView(...))` để tránh unbounded height.

- `mainAxisAlignment` theo trục chính; `crossAxisAlignment` trục phụ.
- `mainAxisSize.min` co theo nội dung; `Spacer()` đẩy hai bên.
- `Container` có decoration nặng hơn `Padding`/`SizedBox`.

### 3.2 Stack, Positioned

```dart
Stack(children: [
  ClipRRect(borderRadius: BorderRadius.circular(24), child: Image.asset(
      'assets/images/cover.jpg', height: 220, fit: BoxFit.cover)),
  const Positioned(left: 16, bottom: 16, child: Text('Minh & Lan · 20.12.2026',
      style: TextStyle(color: Colors.white, fontSize: 20))),
])
```

- Con đầu tiên dưới cùng; `Positioned` cần ít nhất một cạnh hoặc width/height.
- `Positioned.fill` phủ toàn bộ; `Stack` không tự mở rộng theo con Positioned.
- Dùng `ClipRect`/`ClipRRect`, gradient/scrim để text trên ảnh đủ tương phản.

### 3.3 ListView, GridView, Slivers

```dart
ListView.separated(
  itemCount: wishes.length,
  separatorBuilder: (_, __) => const SizedBox(height: 8),
  itemBuilder: (context, index) => WishCard(
    key: ValueKey(wishes[index].id),
    name: wishes[index].senderName, content: wishes[index].content),
)
```

Danh sách dài luôn dùng `.builder`/`.separated`. `GridView.count(crossAxisCount: 2,
childAspectRatio: 1.2, children: [...])` cho gallery; tránh `shrinkWrap` nếu không cần.

```dart
CustomScrollView(slivers: [
  const SliverAppBar(pinned: true, expandedHeight: 180,
      flexibleSpace: FlexibleSpaceBar(title: Text('Sổ lưu bút'))),
  SliverList.builder(itemCount: wishes.length,
    itemBuilder: (context, index) => WishCard(
        name: wishes[index].senderName, content: wishes[index].content)),
])
```

| Widget | Dùng khi | Lưu ý |
|---|---|---|
| `ListView` | Danh sách tuyến tính | `.builder` cho dữ liệu lớn |
| `GridView` | Lưới đều | `SliverGridDelegate` kiểm soát tỷ lệ |
| `CustomScrollView` | Nhiều sliver | Kết hợp app bar/list/grid |
| `SliverList/Grid` | Trong CustomScrollView | Dùng `.builder` |
| `SliverToBoxAdapter` | Chèn widget thường | Không lạm dụng cho list dài |
| `SliverFillRemaining` | Lấp phần còn lại | Empty state |

> ⚠️ `shrinkWrap: true` đo toàn bộ con, mất lazy. Không lồng nhiều list cuộn cùng chiều;
> dùng sliver/`NestedScrollView`.

### 3.4 Responsive

Dùng `LayoutBuilder` để chọn số cột (ví dụ `<600` → 1, `600–900` → 2, `>=900` → 3),
`MediaQuery.sizeOf(context)` cho breakpoint toàn app và `SafeArea` cho tai thỏ.

```dart
LayoutBuilder(builder: (context, constraints) {
  final columns = switch (constraints.maxWidth) {
    < 600 => 1,
    < 900 => 2,
    _ => 3,
  };
  return GridView.builder(
    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
      crossAxisCount: columns, mainAxisSpacing: 12, crossAxisSpacing: 12,
      childAspectRatio: 1.2),
    itemCount: wishes.length,
    itemBuilder: (context, index) => WishCard(wish: wishes[index]),
  );
})
```

| Khoảng | Tên | Gợi ý |
|---|---|---|
| `< 600` | Compact | 1 cột, bottom navigation |
| `600–839` | Medium | 2 cột, navigation rail |
| `840–1199` | Expanded | 2–3 cột, rail + panel |
| `>= 1200` | Large | 3–4 cột |

> 💡 Breakpoint dựa trên nội dung/không gian thực, không chỉ thiết bị. Tablet nhỏ và
> điện thoại landscape có thể cùng width.

### 3.5 Constraints, overflow và unbounded

`BoxConstraints` gồm min/max width/height: **tight** (min=max), **loose** (min=0), hoặc
**unbounded** (max=infinity). Con phải chọn size hữu hạn; widget cuộn như `ListView` xử
lý unbounded theo trục cuộn.

```dart
Row(children: [
  const Icon(Icons.favorite),
  Text(longContent), // overflow
])

Row(children: [
  const Icon(Icons.favorite),
  const SizedBox(width: 8),
  Expanded(child: Text(longContent, maxLines: 2, overflow: TextOverflow.ellipsis)),
])
```

Cách sửa overflow: `Expanded`/`Flexible`, `maxLines` + ellipsis, `Wrap` thay `Row`,
`FittedBox` cho nhãn ngắn, kiểm tra `textScaler`. Không che bằng `ClipRect` — nội dung
vẫn mất.

| Tình huống | Lỗi | Sửa |
|---|---|---|
| `ListView` trong `Column` | Unbounded height | `Expanded(child: ListView)` |
| ListView trong scroll khác | Unbounded | Bỏ scroll ngoài/dùng sliver |
| Image trong Row không size | Overflow | `SizedBox`/`AspectRatio` |
| `Column` trong `Row` | Overflow ngang | `Expanded`/`Flexible` |
| `CustomPaint` không size | Không vẽ | `SizedBox`/`ConstrainedBox` |

### 3.6 Flex, Expanded, Flexible, Stack, Wrap và scroll

| | `Expanded` | `Flexible` |
|---|---|---|
| Ràng buộc | tight, lấp đầy | loose, được nhỏ hơn |
| Dùng khi | Chia đều/phần cố định | Con tự quyết nhưng không vượt |

- `flex` mặc định 1; `Expanded(flex: 2)` gấp đôi phần còn lại.
- `Flexible(fit: FlexFit.tight)` tương đương `Expanded`.
- `Wrap` xuống dòng khi hết chỗ (tag/chip); `Align`/`Center` đặt con.
- `AspectRatio` giữ tỷ lệ; `FractionallySizedBox` lấy phần trăm.
- `IntrinsicHeight/Width` đo nội dung, tốn kém — tránh trong list dài.

```dart
Wrap(spacing: 8, runSpacing: 8, children: [
  for (final tag in tags) Chip(label: Text(tag)),
])

AspectRatio(aspectRatio: 4 / 3, child: Image.network(url, fit: BoxFit.cover))
```

`ScrollController` cho vị trí/jump/infinite scroll; luôn remove listener + dispose. Dùng
`hasClients` trước khi đọc `position`. `NestedScrollView` cho app bar co giãn + tab/list
bên trong; chỉ dùng khi thật cần, còn lại ưu tiên `CustomScrollView`.

```dart
if (_scrollController.position.pixels >=
    _scrollController.position.maxScrollExtent - 200) {
  _loadMore();
}
```

### 3.7 SafeArea, MediaQuery, LayoutBuilder, text overflow và responsive

| Công cụ | Dùng cho |
|---|---|
| `SafeArea` | Tai thỏ, status bar, home indicator |
| `MediaQuery.sizeOf` | Breakpoint/kích thước |
| `MediaQuery.paddingOf` | Insets |
| `MediaQuery.textScalerOf` | Cỡ chữ |
| `LayoutBuilder` | Constraint của cha/panel |

`MediaQuery.of(context)` rebuild khi mọi thông số đổi (kể cả bàn phím); dùng `sizeOf`,
`paddingOf`, `textScalerOf`. `LayoutBuilder` tốt hơn khi widget nằm trong panel/sidebar.

```dart
final size = MediaQuery.sizeOf(context);
final isCompact = size.width < 600;
final textScale = MediaQuery.textScalerOf(context).scale(14) / 14;
```

Text overflow: `maxLines` + `overflow: TextOverflow.ellipsis`; bọc `Expanded` trong
Row/Column; tôn trọng text scale; `height` đủ lớn cho dấu tiếng Việt. Tránh hard-code
chiều cao text.

> ⚠️ `TextOverflow.visible` thường gây lỗi layout; `clip` có thể mất chữ. Kiểm tra
> 320dp, 600dp, 900dp và text scale 1.5–2.0.

- [ ] List dài dùng builder; không `shrinkWrap`; text có ellipsis.
- [ ] ScrollController/TabController/PageController dispose.
- [ ] Ảnh có fit/width/height/AspectRatio; SafeArea cho edge-to-edge.
- [ ] Không lồng scroll cùng chiều; kiểm tra màn hình nhỏ + text scale.

---

## 4. Style và theme

```dart
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFB76E79)),
  ),
  darkTheme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFFB76E79), brightness: Brightness.dark),
  ),
  themeMode: ThemeMode.system,
  home: const GuestbookScreen(),
)
```

Không hard-code màu; lấy `Theme.of(context).colorScheme` để dark mode và accessibility
đúng. Spacing theo bội số 4/8 (4, 8, 12, 16, 24, 32). Text style lấy từ `textTheme`:

```dart
final theme = Theme.of(context);
Text('Lời chúc', style: theme.textTheme.titleLarge?.copyWith(color: theme.colorScheme.primary));
```

```yaml
flutter:
  uses-material-design: true
  assets: [assets/images/cover.jpg]
  fonts:
    - family: PlayfairDisplay
      fonts:
        - asset: assets/fonts/PlayfairDisplay-Regular.ttf
        - asset: assets/fonts/PlayfairDisplay-Bold.ttf
          weight: 700
```

Dùng `Image.asset('assets/images/cover.jpg', fit: BoxFit.cover)` và
`TextStyle(fontFamily: 'PlayfairDisplay')`. Sau khi sửa `pubspec.yaml`, chạy
`flutter pub get`; restart nếu asset chưa cập nhật.

### 4.1 Material 3, ColorScheme, TextTheme và dark mode

| Role | Dùng cho |
|---|---|
| `primary`/`onPrimary` | Nút chính, nhấn mạnh |
| `primaryContainer`/`onPrimaryContainer` | Card nhấn, chip chọn |
| `surface`/`onSurface` | Nền/text chính |
| `surfaceContainerHighest` | Nền phụ/input |
| `error`/`onError` | Lỗi/cảnh báo |
| `outline` | Viền/divider |

Luôn dùng cặp `x`/`onX` để đảm bảo tương phản. `textTheme` từ `displayLarge` →
`labelSmall`; dùng đúng cấp bậc, `copyWith` thay đổi cục bộ màu/weight. Dark mode:
`themeMode.system`, lưu lựa chọn vào prefs nếu cho override; kiểm tra loading/empty/
error/disabled. Không dùng `Colors.black/white` cho text.

> ⚠️ Font display thiếu dấu tiếng Việt; kiểm tra kỹ file font và weight bold thật.

### 4.2 Asset, font và ThemeExtension

- Khai báo từng file hoặc cả thư mục trong `pubspec.yaml`.
- Ảnh `@2x`/`@3x` đặt cạnh bản gốc; Flutter tự chọn.
- Font khai báo `weight`/`style`; thiếu weight → synthetic bold.
- SVG cần `flutter_svg`; Flutter không render trực tiếp.
- Sau khi thêm asset: `flutter pub get`, nếu vẫn lỗi `flutter clean`.
- Đường dẫn phân biệt hoa/thường; giữ lowercase để tránh lỗi CI/macOS.

```dart
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({required this.heroGradient});
  final List<Color> heroGradient;

  @override
  AppColors copyWith({List<Color>? heroGradient}) =>
      AppColors(heroGradient: heroGradient ?? this.heroGradient);

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) =>
      other is AppColors ? other : this;
}
```

```dart
final appColors = Theme.of(context).extension<AppColors>()!;
```

> ⚠️ `lerp` cần xử lý đúng để animation theme mượt; gradient/list có thể trả `this` nếu
> không cần nội suy.

### 4.3 Lỗi và checklist theme

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `Unable to load asset` | Chưa khai báo/sai path | Kiểm tra pubspec, `pub get` |
| Asset cũ vẫn hiện | Cache build | `flutter clean` |
| Font không áp dụng | Sai family/thiếu weight | Khai báo đủ file |
| Chữ giả bold | Thiếu file weight | Thêm file weight |
| Ảnh mờ | Ảnh nhỏ cho màn lớn | Thêm `@2x`/`@3x` |

- [ ] Không hard-code màu; text dùng `textTheme`.
- [ ] Dark mode kiểm tra mọi trạng thái; spacing token 4–8.
- [ ] Font tiếng Việt đủ dấu; asset/font đã khai báo.
- [ ] Kiểm tra text scale 1.0/1.5/2.0; contrast đạt WCAG AA nếu có thể.

---

## 5. Navigation cơ bản

```dart
final sent = await Navigator.of(context).push<bool>(
  MaterialPageRoute(builder: (_) => const RsvpPage()),
);
if (sent == true && context.mounted) {
  ScaffoldMessenger.of(context)
      .showSnackBar(const SnackBar(content: Text('Cảm ơn bạn đã phản hồi!')));
}
Navigator.of(context).pop(true); // quay lại kèm kết quả; nút back cũng gọi pop
```

Named routes cho app nhỏ; arguments qua `settings.arguments`:

```dart
MaterialApp(routes: {'/': (_) => const GuestbookScreen(), '/rsvp': (_) => const RsvpPage()})
Navigator.pushNamed(context, '/rsvp', arguments: 'Ngọc Anh');
final guestName = ModalRoute.of(context)?.settings.arguments as String? ?? 'Khách';
```

Khi có deep link, auth guard, nested tab, dùng `go_router`:
`GoRouter(routes: [GoRoute(path: '/', builder: ...), ...])` + `MaterialApp.router`.

Chặn back khi form có dữ liệu chưa lưu bằng `PopScope(canPop: false,
onPopInvokedWithResult: ...)` (Flutter 3.12+).

### 5.1 Navigator, named routes và arguments

| Thao tác | API | Ghi chú |
|---|---|---|
| Đẩy route | `push`, `pushReplacement`, `pushAndRemoveUntil` | `pushReplacement` thay route hiện tại |
| Quay lại | `pop(result)` | Trả kết quả cho `push` |
| Xóa lịch sử | `popUntil((r) => r.isFirst)` | Về màn gốc |
| Đọc route | `ModalRoute.of(context)` | Arguments/settings |
| Named | `pushNamed` | Cần `routes`/`onGenerateRoute` |

`push<T>` trả `Future<T?>`; `pop` không result → `null`; generic phải khớp. Named route
không type-safe; `onGenerateRoute` parse/validate arguments, trả `null` nếu không tồn
tại. Không truyền object lớn qua arguments vì restore/app kill chỉ an toàn với dữ liệu
serializable.

> ⚠️ Không gọi `Navigator.of(context)` sau `await` mà chưa kiểm tra `context.mounted`.

### 5.2 PopScope, go_router và context async

```dart
PopScope(
  canPop: false,
  onPopInvokedWithResult: (didPop, result) async {
    if (didPop) return;
    final shouldLeave = await _confirmDiscard();
    if (shouldLeave && context.mounted) Navigator.of(context).pop(result);
  },
  child: const RsvpForm(),
)
```

```dart
final router = GoRouter(
  redirect: (context, state) {
    final loggedIn = AuthScope.of(context).isLoggedIn;
    final onLogin = state.matchedLocation == '/login';
    if (!loggedIn && !onLogin) return '/login';
    if (loggedIn && onLogin) return '/';
    return null;
  },
  routes: [
    GoRoute(path: '/', builder: (_, __) => const GuestbookScreen(), routes: [
      GoRoute(path: 'wish/:id',
        builder: (_, state) => WishDetailPage(id: state.pathParameters['id']!)),
    ]),
    GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
  ],
);
MaterialApp.router(routerConfig: router);
```

`context.push('/wish/42')`, `context.go('/')`, `context.pop()`. go_router hợp deep
link/web/guard/nested tab (`StatefulShellRoute`); app nhỏ không bắt buộc.

> ⚠️ `PopScope` chủ yếu chặn back gesture/button hệ thống, không chặn `Navigator.pop`
> trực tiếp. Quên `if (didPop) return;` có thể pop hai lần.

Sau `await`, dùng `mounted`/`context.mounted`; lấy `Navigator`/`ScaffoldMessenger` trước
await nếu cần. Không lưu `BuildContext` lâu dài.

### 5.3 Lỗi navigation thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| Không tìm thấy Navigator | Context ngoài MaterialApp | Dùng context trong route |
| `There is nothing to pop` | Stack chỉ còn một route | Kiểm tra `canPop()` |
| `setState` sau pop | Async xong sau khi đóng | `mounted` |
| Mất state khi quay lại | Route bị tạo mới | Giữ state ở controller/scope |
| Deep link sai màn | Không parse path/query | go_router + test link |
| Back không chặn | Dùng `WillPopScope` cũ | Chuyển `PopScope` |

---

## 6. Form và input

```dart
class RsvpForm extends StatefulWidget {
  const RsvpForm({super.key, required this.onSubmit});
  final Future<void> Function(Wish wish) onSubmit;
  @override
  State<RsvpForm> createState() => _RsvpFormState();
}

class _RsvpFormState extends State<RsvpForm> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _content = TextEditingController();
  final _contentFocus = FocusNode();
  bool _sending = false;

  @override
  void dispose() {
    _name.dispose();
    _content.dispose();
    _contentFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _sending = true);
    try {
      await widget.onSubmit(Wish(
          senderName: _name.text.trim(), content: _content.text.trim()));
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      debugPrint('Gửi lời chúc thất bại: $e');
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) => Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          TextFormField(
            controller: _name,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(labelText: 'Tên của bạn'),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Nhập tên' : null,
            onFieldSubmitted: (_) => _contentFocus.requestFocus(),
          ),
          TextFormField(
            controller: _content,
            focusNode: _contentFocus,
            minLines: 3,
            maxLines: 5,
            maxLength: 500,
            decoration: const InputDecoration(labelText: 'Lời chúc'),
            validator: (v) => (v == null || v.trim().length < 5) ? 'Ít nhất 5 ký tự' : null,
          ),
          FilledButton(
            onPressed: _sending ? null : _submit,
            child: Text(_sending ? 'Đang gửi...' : 'Gửi lời chúc'),
          ),
        ]),
      );
}
```

Ngày cưới dùng `showDatePicker(context:, initialDate:, firstDate:, lastDate:)` rồi
`setState`. Validate client để phản hồi nhanh nhưng **luôn validate lại server**; giới
hạn `maxLength` khớp backend; khóa nút khi đang gửi.

> ⚠️ Backend kiểm tra `sender_name` và `content`; app vẫn phải trim và chặn chuỗi rỗng.

### 6.1 Controller, FocusNode và dispose

- Controller/FocusNode là field của `State`, không tạo trong `build`.
- Dispose trong `dispose()`: remove listener → dispose controller → `super.dispose()`.
- Chỉ owner dispose; controller truyền từ ngoài thì widget con không dispose.
- `FocusScope.of(context).unfocus()` đóng bàn phím; `FocusNode.requestFocus()` chuyển
  focus.
- Không gọi `setState` trong listener controller nếu không cần; listener chạy mỗi lần gõ.

```dart
@override
void initState() {
  super.initState();
  _name = TextEditingController(text: widget.initialName);
}
@override
void dispose() {
  _name.dispose();
  super.dispose();
}
```

> ⚠️ `setState` trong `dispose`/sau `dispose` gây lỗi; luôn kiểm tra `mounted` sau async.

### 6.2 Validation, keyboard, autofill và formatter

```dart
TextFormField(
  keyboardType: TextInputType.number,
  textInputAction: TextInputAction.done,
  autofillHints: const [AutofillHints.oneTimeCode],
  inputFormatters: [
    FilteringTextInputFormatter.digitsOnly,
    LengthLimitingTextInputFormatter(6),
  ],
  validator: (value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Nhập mã';
    return null;
  },
)
```

- `Form.validate()` chạy toàn bộ validator; `AutovalidateMode.onUserInteraction` tránh
  báo lỗi ngay khi mở form.
- Validator trả `String?` (`null` = hợp lệ), phải đồng bộ; kiểm tra async ở submit.
- `keyboardType`: text/email/number/phone/multiline; `textInputAction.next/done`.
- `autofillHints` cho password/OTP/email; formatter chặn ký tự/giới hạn độ dài.
- `maxLength` chỉ UI; server vẫn kiểm tra. Không chặn dấu tiếng Việt nếu cần nhập tên.

> ⚠️ `TextInputType.number` không đảm bảo chỉ chữ số; luôn dùng formatter.

### 6.3 Debounce, submit, picker và form trong ListView

```dart
Timer? _debounce;
void _onSearchChanged(String value) {
  _debounce?.cancel();
  _debounce = Timer(const Duration(milliseconds: 350), () => _search(value.trim()));
}
@override
void dispose() {
  _debounce?.cancel();
  super.dispose();
}
```

- Debounce tránh gọi API mỗi lần gõ; luôn cancel timer.
- Submit state nên là enum `idle/loading/success/error`; khóa nút bằng `onPressed: null`,
  không chỉ đổi text.
- `showDatePicker` trả `DateTime?`; `showTimePicker` trả `TimeOfDay?`; kiểm tra
  `mounted` sau await. `firstDate`/`lastDate` phải bao `initialDate`.
- Form trong ListView: bọc `Form` ngoài, padding bottom theo
  `MediaQuery.viewInsetsOf(context).bottom`, `keyboardDismissBehavior: onDrag`.
- Không đặt `Form` trong `ListView.builder` nếu field lazy có thể chưa build → validator
  bỏ sót; dùng children cố định hoặc `SingleChildScrollView` + `Column`.

```dart
final picked = await showDatePicker(
  context: context,
  initialDate: _date,
  firstDate: DateTime(2020),
  lastDate: DateTime(2100),
);
if (picked != null && mounted) setState(() => _date = picked);
```

### 6.4 Lỗi form thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `Controller used after disposed` | Dispose khi còn dùng | Đúng owner, không dispose controller truyền vào |
| `setState` sau submit | Async xong sau pop | `mounted` |
| Bàn phím che nút | Thiếu padding `viewInsets` | Thêm bottom padding |
| Validate không chạy | `Form` không bọc field | Đặt đúng cấp |
| Field trong ListView không validate | Chưa build | Children cố định/SingleChildScrollView |
| Submit bấm nhiều lần | Nút còn enabled | `onPressed: null` khi loading |
| Text nhân đôi | Controller tạo trong build | Field của State |
| Mất dữ liệu hot reload | State reset | Chấp nhận/restoration |

---

## 7. State cơ bản

Đặt state ở **widget cha gần nhất** mà các con cùng cần; con nhận dữ liệu qua
constructor, gửi sự kiện qua callback. `InheritedWidget` chia sẻ state xuống sâu:

```dart
class WishScope extends InheritedWidget {
  const WishScope({super.key, required this.count, required super.child});
  final int count;

  static WishScope of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WishScope>()!;

  @override
  bool updateShouldNotify(WishScope oldWidget) => count != oldWidget.count;
}
```

| | Provider | Riverpod | Bloc/Cubit |
|---|---|---|---|
| Độ phức tạp | Thấp | Trung bình | Trung bình–cao |
| Compile-safe | Một phần | Có | Có |
| Test | Khá | Rất tốt | Rất tốt |
| Phù hợp | App nhỏ/MVP | ✅ Vừa/lớn | Team quen event-driven |

Chọn một giải pháp từ đầu; không trộn nhiều giải pháp trong cùng feature.

### 7.1 Local state, lifting state và InheritedWidget

| Loại state | Ví dụ | Đặt ở |
|---|---|---|
| Local UI | `_expanded`, `_obscureText` | State widget |
| Local form | text/focus/validate | State + controller |
| Shared feature | list/filter/loading | Cha gần nhất/controller |
| Global | auth/theme/locale | Scope/provider root |

Lifting state: hai widget ngang hàng cần chia sẻ → đưa state lên cha chung. Không đưa
lên global chỉ vì lười truyền prop.

```dart
class _ListState extends State<WishListPage> {
  final _selected = <String>{};
  void _toggle(String id) => setState(() {
        if (!_selected.add(id)) _selected.remove(id);
      });
  // truyền selected + onToggle xuống con
}
```

`InheritedNotifier` tự rebuild khi notifier đổi; phù hợp state nhỏ. Tạo notifier ở State
cha và dispose đúng lifecycle.

```dart
class WishScope extends InheritedNotifier<ValueNotifier<int>> {
  const WishScope({super.key, required ValueNotifier<int> count, required super.child})
      : super(notifier: count);
  static int of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WishScope>()!.notifier!.value;
}
```

> ⚠️ Không gọi `dependOnInheritedWidgetOfExactType` trong `initState`; dùng
> `didChangeDependencies` hoặc build.

### 7.2 ValueNotifier, ChangeNotifier, Provider, Riverpod và Bloc

```dart
class WishController extends ChangeNotifier {
  WishController(this._api);
  final MessageApi _api;
  List<Wish> _items = const [];
  bool _loading = false;
  Object? _error;

  List<Wish> get items => List.unmodifiable(_items);
  bool get loading => _loading;
  Object? get error => _error;

  Future<void> load() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _items = await _api.fetchMessages();
    } catch (error) {
      _error = error;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
```

```dart
ValueListenableBuilder<int>(
  valueListenable: _count,
  builder: (context, value, child) => Text('$value'),
)

AnimatedBuilder(
  animation: _controller,
  builder: (context, child) => _controller.loading
      ? const CircularProgressIndicator()
      : WishList(items: _controller.items),
)
```

- `ValueNotifier<T>` cho một giá trị; `ChangeNotifier` cho nhiều field; luôn dispose.
- Không `notifyListeners()` sau dispose hoặc trong build.
- Provider: `context.watch` tạo dependency, `context.read` không rebuild; `Selector`
  giới hạn phạm vi.
- Riverpod: `Provider`/`AsyncNotifierProvider`, `AsyncValue` xử lý loading/error/data,
  đọc không cần `BuildContext`, dễ override test.
- Bloc/Cubit: state immutable, event-driven; Cubit cho logic đơn giản, Bloc cho nhiều
  event/audit; dùng `equatable`/`bloc_test` nếu phù hợp.

```dart
final wishesProvider =
    AsyncNotifierProvider<WishesNotifier, List<Wish>>(WishesNotifier.new);

class WishesNotifier extends AsyncNotifier<List<Wish>> {
  @override
  Future<List<Wish>> build() => ref.read(apiProvider).fetchMessages();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(apiProvider).fetchMessages());
  }
}
```

### 7.3 Khi nào dùng gì và lỗi thường gặp

| Tình huống | Gợi ý |
|---|---|
| 1–2 màn, state ít | `setState` + lifting |
| Theme/auth toàn app | InheritedWidget/Provider |
| App vừa, team nhỏ | Provider/Riverpod |
| Nhiều event/audit | Bloc |
| Cần test/override dependency | Riverpod |
| Prototype nhanh | `setState`/ChangeNotifier |

Tiêu chí: bao nhiêu nơi cần state → local hay shared; có cần sống qua navigation không;
có cần test không; team quen gì. Không dùng provider chỉ để tránh truyền 2 props.

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| UI không cập nhật | Sửa list tại chỗ | Tạo list mới + notify/setState |
| Rebuild toàn app | Provider quá cao/watch rộng | `select`/`Selector` |
| `ProviderNotFoundException` | Thiếu provider trên cây | Bọc đúng root/feature |
| State mất hot reload | State cục bộ reset | Chấp nhận/restoration |
| Memory leak | Không dispose | Dispose trong `dispose` |
| Race condition | Hai request cùng cập nhật | Request id/cancel/ignore stale |
| Global khó test | Singleton ẩn | Inject dependency |

> ⚠️ Không trộn Provider + Riverpod + Bloc trong cùng feature. Chọn một và thống nhất
> quy ước.

---

## 8. Async và HTTP

### 8.1 Event loop, Future và async/await

Mỗi isolate có event loop: **microtask** (Future callback, `scheduleMicrotask`) chạy ngay
sau code đồng bộ, trước **event** (timer, I/O, gesture). `await` không block UI nhưng
không làm code song song; tác vụ CPU nặng vẫn chặn frame.

```dart
Future<int> fetchCount() => Future<int>.delayed(
      const Duration(milliseconds: 300), () => 42);

Future<String> loadLabel() async {
  try {
    final count = await fetchCount();
    return '$count lời chúc';
  } on TimeoutException {
    return 'Quá thời gian';
  } catch (error, stackTrace) {
    debugPrint('$error\n$stackTrace');
    rethrow;
  }
}
```

- `Future.value`, `Future.error`, `Future.microtask`, `Future.delayed`.
- `then/catchError/whenComplete` thay cho async/await khi cần; `catchError` phải trả
  đúng kiểu.
- `Future` chỉ hoàn thành một lần; retry phải tạo Future mới.
- Lỗi trong hàm `async` được đóng gói vào Future; chỉ ném khi await/không ai bắt.

> ⚠️ Đừng bỏ rơi Future. Nếu cố ý không chờ, dùng `unawaited` từ `dart:async` và xử lý
> lỗi bên trong.

### 8.2 Future.wait, eagerError, unawaited, timeout và retry

```dart
final results = await Future.wait<int>([fetchCount(), fetchUnread()]);
final first = await Future.any<int>([fetchPrimary(), fetchFallback()]);
unawaited(_analytics.track('wish_created'));
```

- `Future.wait` chạy song song, giữ thứ tự kết quả; mặc định chờ tất cả rồi mới ném lỗi
  đầu tiên; `eagerError: true` ném ngay.
- `Future.wait` không cancel Future còn lại khi một cái lỗi.
- `unawaited` chỉ khi không cần kết quả; lỗi không bắt có thể thành unhandled exception.

```dart
try {
  await _client.get(uri).timeout(const Duration(seconds: 10));
} on TimeoutException {
  throw const ApiException('Kết nối quá chậm');
}

Future<T> withRetry<T>(Future<T> Function() task, {int maxAttempts = 3}) async {
  Object? lastError;
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt == maxAttempts) break;
      final delay = Duration(
        milliseconds: (200 * (1 << (attempt - 1))) + Random().nextInt(100));
      await Future<void>.delayed(delay);
    }
  }
  throw lastError ?? StateError('Retry thất bại');
}
```

Chỉ retry `GET`/`HEAD` hoặc request có idempotency key; không retry `401/403/404/422`;
retry `429/5xx`/timeout/network với backoff + jitter. `package:http` không có
`CancelToken`; `dio` có `CancelToken`. Với `http`, có thể bỏ kết quả nếu `!mounted` thay
vì hủy.

> ⚠️ Retry `POST` không idempotent có thể tạo bản ghi trùng.

### 8.3 Stream, StreamController, backpressure và Timer

```dart
final controller = StreamController<int>();
controller.stream.listen(
  (value) => debugPrint('$value'),
  onError: (Object error) => debugPrint('$error'),
  onDone: () => debugPrint('done'),
  cancelOnError: false,
);
controller.add(1);
await controller.close();

final broadcast = StreamController<Wish>.broadcast();
```

| Loại | Listener | Replay | Dùng khi |
|---|---|---|---|
| Single-subscription | 1 | Không | Đọc file/request một lần |
| Broadcast | Nhiều | Không | Event bus/state/WebSocket |
| `Stream.periodic` | 1 | Không | Timer lặp |

- Broadcast không replay; listener đến sau mất dữ liệu cũ.
- `add` sau `close` ném lỗi; `sync: true` có thể gây reentrancy.
- Stream không tự giảm tốc producer; dùng `pause()`/`resume()`, coalesce, hoặc giới hạn
  buffer.
- Luôn `cancel()` subscription trong dispose.

```dart
final sub = source.listen((event) async {
  sub.pause();
  await handle(event);
  sub.resume();
});
```

Timer:

```dart
final ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
  if (!mounted) { timer.cancel(); return; }
  setState(() => _elapsed++);
});
// dispose: ticker.cancel();
```

> ⚠️ `Timer.periodic` sống ngoài widget; không cancel sẽ tiếp tục chạy và gây leak.

### 8.4 Zone, isolate và compute

```dart
void main() {
  runZonedGuarded(
    () => runApp(const MyApp()),
    (error, stackTrace) => debugPrint('Uncaught: $error\n$stackTrace'),
  );
}
```

- Zone bắt lỗi async chưa xử lý; Flutter dùng Zone để báo crash.
- `runZonedGuarded` bọc `runApp`; không lồng zone không cần thiết.

```dart
Future<List<int>> sortBigList(List<int> values) =>
    Isolate.run(() => [...values]..sort());

Future<String> hashLargeText(String input) => compute(_hashWorker, input);
String _hashWorker(String input) => input.hashCode.toRadixString(16);
```

- Isolate có bộ nhớ riêng; dữ liệu phải sendable; không gửi `BuildContext`/`State`.
- `compute` cho một lần; `Isolate.spawn` cho worker sống lâu; `TransferableTypedData`
  giảm copy dữ liệu lớn.
- Không dùng isolate cho I/O đã async; tạo isolate có chi phí, không spawn từng item nhỏ.
- Lỗi trong isolate phải listen `onError`/`onExit` hoặc để `Isolate.run` ném lại.

### 8.5 HTTP, JSON, UTF-8, pagination và error mapping

Model thủ công theo field snake_case của Supabase:

```dart
class Wish {
  const Wish({required this.id, required this.senderName, required this.content,
      required this.willAttend, required this.guestOf, required this.numberAttend,
      required this.createdAt});

  final String id;
  final String senderName;
  final String content;
  final bool willAttend;
  final String guestOf;
  final int numberAttend;
  final DateTime createdAt;

  factory Wish.fromJson(Map<String, dynamic> json) => Wish(
        id: json['id'].toString(),
        senderName: json['sender_name'] as String? ?? '',
        content: json['content'] as String? ?? '',
        willAttend: json['will_attend'] as bool? ?? false,
        guestOf: json['guest_of'] as String? ?? 'Khách',
        numberAttend: (json['number_attend'] as num?)?.toInt() ?? 0,
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '')?.toLocal() ??
            DateTime.fromMillisecondsSinceEpoch(0),
      );

  Map<String, dynamic> toCreateJson() => {'sender_name': senderName, 'content': content,
      'will_attend': willAttend, 'guest_of': guestOf, 'number_attend': numberAttend};
}
```

API client:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

const apiBaseUrl = String.fromEnvironment('API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000');

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;
  @override
  String toString() => message;
}

class MessageApi {
  MessageApi({http.Client? client}) : _client = client ?? http.Client();
  final http.Client _client;

  Future<List<Wish>> fetchMessages({String? before}) async {
    final uri = Uri.parse('$apiBaseUrl/api/messages/')
        .replace(queryParameters: before == null ? null : {'before': before});
    final response = await _client
        .get(uri, headers: const {'Accept': 'application/json'})
        .timeout(const Duration(seconds: 10));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200 || body['success'] != true) {
      throw ApiException(body['error']?.toString() ?? 'Không tải được lời chúc',
          statusCode: response.statusCode);
    }
    return (body['data'] as List<dynamic>)
        .whereType<Map<String, dynamic>>()
        .map(Wish.fromJson)
        .toList();
  }

  Future<Wish> createMessage(Wish wish) async {
    final response = await _client
        .post(Uri.parse('$apiBaseUrl/api/messages'),
            headers: const {'Content-Type': 'application/json'},
            body: jsonEncode(wish.toCreateJson()))
        .timeout(const Duration(seconds: 10));
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 300 || body['success'] != true) {
      throw ApiException(body['error']?.toString() ?? 'Không gửi được lời chúc',
          statusCode: response.statusCode);
    }
    return Wish.fromJson(body['data'] as Map<String, dynamic>);
  }

  void close() => _client.close();
}
```

- Dùng một `Client` cho nhiều request; `close()` khi không dùng. `10.0.2.2` là localhost
  Android emulator; iOS simulator dùng `127.0.0.1`.
- `String.fromEnvironment` nhận `--dart-define`; không log token/PII.
- `response.body` giải mã theo charset header; nếu thiếu charset, dùng
  `utf8.decode(response.bodyBytes)`.
- `jsonEncode` không tự đặt `Content-Type: application/json`.
- Parse phòng thủ; `id` có thể số/chuỗi; `DateTime.tryParse` tránh crash.
- Status: `2xx` thành công; `400` validation; `401` refresh/logout; `403` không quyền;
  `404` không tìm thấy; `409` xung đột; `429` chờ `Retry-After`; `5xx` retry giới hạn.
- Không hiển thị nguyên văn lỗi server; map sang thông báo thân thiện.
- Pagination: cursor `before` = `created_at` cũ nhất; dedupe theo id; khóa `_loadingMore`
  tránh gọi trùng; `_hasMore = older.length == 20`.

```dart
Future<void> _loadMore() async {
  if (_loadingMore || !_hasMore) return;
  final oldest = _items.isEmpty ? null : _items.last.createdAt;
  setState(() => _loadingMore = true);
  try {
    final older = await _api.fetchMessages(
      before: oldest?.toUtc().toIso8601String());
    if (!mounted) return;
    final ids = _items.map((wish) => wish.id).toSet();
    setState(() {
      _items = [..._items, ...older.where((wish) => !ids.contains(wish.id))];
      _hasMore = older.length == 20;
    });
  } finally {
    if (mounted) setState(() => _loadingMore = false);
  }
}
```

> ⚠️ Cursor ổn định hơn offset khi có dữ liệu mới; `_items.last` chỉ gọi khi list không
> rỗng.

### 8.6 FutureBuilder, dispose và fake client

`FutureBuilder` với đủ trạng thái:

```dart
FutureBuilder<List<Wish>>(
  future: _future,
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const Center(child: CircularProgressIndicator());
    }
    if (snapshot.hasError) return Center(child: Text('${snapshot.error}'));
    final wishes = snapshot.data ?? const <Wish>[];
    if (wishes.isEmpty) return const Center(child: Text('Hãy là người đầu tiên!'));
    return ListView.builder(
      itemCount: wishes.length,
      itemBuilder: (context, index) => WishCard(
        key: ValueKey(wishes[index].id),
        name: wishes[index].senderName, content: wishes[index].content),
    );
  },
)
```

- Tạo `_future` trong `initState`/controller, không trong build (mỗi rebuild gọi lại).
- `snapshot.hasData` có thể true với list rỗng; kiểm tra `isEmpty` riêng.
- `FutureBuilder` không cancel request khi dispose; kiểm tra `mounted` khi setState.
- Không dùng cho state realtime; dùng Stream/controller.

```dart
import 'package:http/testing.dart';

MessageApi buildApi() => MessageApi(client: MockClient((request) async {
      return http.Response(
        '{"success":true,"data":[]}', 200,
        headers: {'content-type': 'application/json; charset=utf-8'});
    }));
```

Test success/error/empty/timeout; không gọi mạng thật trong unit/widget test.

> ⚠️ `snapshot.error` có thể chứa thông tin nội bộ; map trước khi hiển thị.

### 8.7 Lỗi async và HTTP thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `TimeoutException` | Server chậm/mất mạng | `.timeout`, thông báo, retry |
| `SocketException` | Sai URL/server chưa chạy | Kiểm tra base URL/`curl` |
| `FormatException` | JSON sai | Kiểm tra content-type/body |
| `HandshakeException` | TLS/cert | Kiểm tra chứng chỉ, không bypass |
| `setState` sau dispose | Request xong sau rời màn | `mounted` |
| Request cũ ghi đè mới | Race | Request id/cancel/ignore stale |
| `ClientException` | Client đã close | Không dùng sau `close` |
| UI kẹt loading | Thiếu `finally` | Reset state trong `finally` |

- [ ] Base URL từ `--dart-define`; mọi request có timeout.
- [ ] Parse JSON phòng thủ; đủ loading/error/empty/data.
- [ ] Không gọi API trong build; client/repository đóng đúng lifecycle.
- [ ] Retry chỉ lỗi tạm thời/idempotent; token không bị log.
- [ ] Test client giả cho success/error/empty.

---

## 9. Local storage

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setString('guest_name', 'Ngọc Anh');
await prefs.setString('last_seen_at', DateTime.now().toUtc().toIso8601String());
```

`shared_preferences` phù hợp tên khách, lần đồng bộ cuối, cờ onboarding. Không lưu token.

`sqflite` (SQL trực tiếp) hoặc `Drift` (type-safe, migration tốt) cho cache danh sách.
Bảng gợi ý: `wishes(id TEXT PRIMARY KEY, sender_name TEXT, content TEXT, created_at TEXT,
synced INTEGER)`, index trên `created_at` và `synced`.

```dart
const storage = FlutterSecureStorage();
await storage.write(key: 'access_token', value: token);
final token = await storage.read(key: 'access_token');
```

Secure storage dùng Keychain (iOS)/EncryptedSharedPreferences (Android) cho token;
không dùng cho dữ liệu lớn.

### 9.1 shared_preferences và secure storage

- Chỉ lưu primitive: `String/int/double/bool/List<String>`; không lưu JSON lớn.
- Không lưu token/PII nhạy cảm; shared_preferences không mã hóa.
- Android có thể backup dữ liệu; iOS Keychain có thể tồn tại sau khi gỡ app.
- Secure storage: token ngắn hạn + refresh token; luôn xóa khi logout; test thiết bị thật.
- Không đọc/ghi storage trong `build`; đây là I/O async.

```dart
class TokenStore {
  TokenStore(this._storage);
  final FlutterSecureStorage _storage;
  static const _key = 'access_token';
  Future<void> save(String token) => _storage.write(key: _key, value: token);
  Future<String?> read() => _storage.read(key: _key);
  Future<void> clear() => _storage.delete(key: _key);
}
```

> ⚠️ Secure storage không chống malware/root; chỉ giảm rủi ro so với plain text.

### 9.2 sqflite, Drift, bảo mật và lỗi

```dart
final db = await openDatabase(
  join(await getDatabasesPath(), 'open_docs.db'),
  version: 1,
  onCreate: (db, version) async {
    await db.execute('''
      CREATE TABLE wishes(
        id TEXT PRIMARY KEY,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0)
    ''');
    await db.execute('CREATE INDEX idx_wishes_created_at ON wishes(created_at)');
    await db.execute('CREATE INDEX idx_wishes_synced ON wishes(synced)');
  },
);
```

- Luôn có migration (`onUpgrade`) ngay từ version 1; dùng transaction cho nhiều bước.
- Lưu `DateTime` UTC ISO-8601; không nối SQL trực tiếp (SQL injection), dùng tham số.
- Drift type-safe, migration tốt, phù hợp app lớn.
- Mã hóa dữ liệu nhạy cảm nếu lưu ngoài secure storage; xóa khi logout; dọn cache.
- `path_provider` cho thư mục; không hard-code `/data/...`.

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `MissingPluginException` | Plugin chưa pub get/restart | Chạy lại app |
| `PlatformException` | Cấu hình native/thiết bị | Đọc mã lỗi, test thật |
| `no such table` | Chưa onCreate/migration | Tăng version, `onUpgrade` |
| `database is locked` | Nhiều thao tác đồng thời | Transaction/await tuần tự |
| Token cũ vẫn dùng | Chưa clear khi logout | Xóa token + state |
| Mất dữ liệu khi uninstall | Bản chất local | Đồng bộ server nếu cần |

---

## 10. Realtime với WebSocket

| Event | `data` | Xử lý phía app |
|---|---|---|
| `new_message` | object mới | Thêm nếu chưa có id |
| `update_message` | object/array sau update, hoặc `{id}` sau delete | Thay theo id; chỉ có `id` thì xóa |

```dart
import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:web_socket_channel/web_socket_channel.dart';

const wsUrl = String.fromEnvironment('WS_URL',
    defaultValue: 'ws://10.0.2.2:3000/ws');

class GuestbookSocket {
  GuestbookSocket(this.onEvent);
  final void Function(Map<String, dynamic>) onEvent;
  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _sub;
  Timer? _retry;
  int _attempt = 0;
  bool _closed = false;

  void connect() {
    if (_closed) return;
    _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
    _sub = _channel!.stream.listen((raw) {
      _attempt = 0;
      if (raw is String) {
        final data = jsonDecode(raw);
        if (data is Map<String, dynamic>) onEvent(data);
      }
    }, onDone: _reconnect, onError: (_) => _reconnect(), cancelOnError: true);
  }

  void _reconnect() {
    if (_closed || _retry != null) return;
    _retry = Timer(Duration(seconds: math.min(30, math.pow(2, _attempt++).toInt())), () {
      _retry = null;
      connect();
    });
  }

  Future<void> dispose() async {
    _closed = true;
    _retry?.cancel();
    await _sub?.cancel();
    await _channel?.sink.close();
  }
}
```

```dart
List<Wish> applyWishEvent(List<Wish> items, Map<String, dynamic> event) {
  final data = event['data'];
  final row = switch (data) {
    Map<String, dynamic> map => map,
    List<dynamic> list when list.isNotEmpty && list.first is Map<String, dynamic> =>
      list.first as Map<String, dynamic>,
    _ => null,
  };
  final id = row?['id']?.toString();
  if (row == null || id == null) return items;
  final next = [...items];
  final index = next.indexWhere((wish) => wish.id == id);
  if (event['type'] == 'update_message' && row.length == 1) {
    if (index >= 0) next.removeAt(index); // delete
  } else if (index >= 0) {
    next[index] = Wish.fromJson(row);
  } else {
    next.add(Wish.fromJson(row));
  }
  return next;
}
```

Gọi `setState(() => _items = applyWishEvent(_items, event))` trong screen. Backoff 1, 2, 4…
giây (tối đa 30) + jitter. Khi app background, đóng socket; khi `resumed`, reconnect và
refetch để bù tin bị lỡ. Không reconnect với close code auth (4001/4003). Dùng
`WidgetsBindingObserver`, kiểm tra `mounted` trước `setState`.

### 10.1 Event schema, lifecycle và reconnect

Envelope tối thiểu: `type` (discriminator), `data` (object/array), `id` (dedupe/update),
`version`/`sent_at` (tiến hóa/debug). Không giả định `data` luôn object; delete nên là
event riêng hoặc `{id}` rõ ràng. Validate shape trước khi xử lý; event lạ bỏ qua an toàn.

- `WebSocketChannel.connect` trả ngay; lỗi kết nối qua stream `onError/onDone`.
- Luôn listen `onError`, `onDone`; quản lý state `connecting/connected/disconnected` để
  tránh nhiều socket.
- `sink.add(jsonEncode(...))` để gửi; kiểm tra sink trước; `sink.close()` khi dispose.
- Reconnect switch/backoff như code trên; reset `_attempt` khi nhận message đầu.

```dart
Duration _nextDelay(int attempt) {
  final baseMs = math.min(30000, 500 * math.pow(2, attempt).toInt());
  return Duration(milliseconds: baseMs + math.Random().nextInt(500));
}
```

> ⚠️ Reconnect không thay thế refetch. Sau khi kết nối lại, luôn tải lại dữ liệu để bù
> event bị lỡ.

### 10.2 Backoff, auth close code, app lifecycle và offline

| Close code | Ý nghĩa | Hành động |
|---|---|---|
| `1000` | Đóng bình thường | Không reconnect nếu chủ động |
| `1001` | Going away | Reconnect khi phù hợp |
| `4001` | Token hết hạn | Refresh token rồi reconnect một lần |
| `4003` | Không có quyền | Không reconnect, logout/báo lỗi |
| `4xxx` khác | Lỗi ứng dụng | Log, xử lý theo server |

Không retry vô hạn với `4003`; `4001` refresh có giới hạn để tránh vòng lặp. Log close
code/reason nhưng không log token.

```dart
class _ScreenState extends State<Screen> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _socket.connect();
      _refetch();
    } else if (state == AppLifecycleState.paused) {
      _socket.dispose();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    unawaited(_socket.dispose());
    super.dispose();
  }
}
```

- `paused`/`inactive`: đóng/tạm dừng socket tiết kiệm pin; `resumed`: reconnect + refetch.
- Offline: banner, hàng đợi thao tác, thử reconnect khi có mạng.

> ⚠️ `State.dispose` không await được; gọi `unawaited(_socket.dispose())` hoặc để socket
> tự đóng.

### 10.3 Dedupe, test và lỗi thường gặp

- Dedupe theo `id`, không theo nội dung; upsert (có thì thay, không thì thêm).
- Delete idempotent; update out-of-order dùng `updated_at`/version để bỏ event cũ.
- Sort theo `created_at` nếu UI cần thứ tự.

```dart
List<Wish> upsert(List<Wish> items, Wish wish) {
  final index = items.indexWhere((item) => item.id == wish.id);
  if (index < 0) return [...items, wish];
  final next = [...items];
  next[index] = wish;
  return next;
}
```

Test `applyWishEvent` như hàm thuần (create/update/delete/trùng/event lạ); inject fake
socket cho widget test; giả lập close code 4003 để đảm bảo không reconnect.

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| Không nhận event | Chưa listen/connect | Kiểm tra lifecycle/state |
| Reconnect loop | Server đóng liên tục | Backoff, kiểm tra auth/code |
| Trùng item | Không dedupe | Upsert theo id |
| Mất event khi background | Socket bị đóng | Refetch khi resumed |
| `WebSocketException` | URL/scheme sai | `ws://` dev, `wss://` prod |
| Pin drain | Socket mở background | Đóng khi paused |
| Token lộ URL | Gửi token query | Header/subprotocol nếu hỗ trợ |

---

## 11. Animation cơ bản

```dart
AnimatedContainer(
  duration: const Duration(milliseconds: 250),
  curve: Curves.easeOut,
  padding: const EdgeInsets.all(16),
  decoration: BoxDecoration(
    color: _attending
        ? Theme.of(context).colorScheme.primaryContainer
        : Theme.of(context).colorScheme.surfaceContainerHighest,
    borderRadius: BorderRadius.circular(_attending ? 24 : 8),
  ),
  child: Text(_attending ? 'Sẽ tham dự' : 'Không tham dự'),
)
```

Implicit widget: `AnimatedOpacity`, `AnimatedSwitcher`, `AnimatedScale`,
`AnimatedCrossFade` — chỉ cần đổi giá trị trong `setState`. `Hero(tag: 'wish-${wish.id}',
child: ...)` cho chuyển cảnh list → chi tiết; tag duy nhất và item cần key ổn định.

### 11.1 Implicit, explicit, AnimationController và dispose

| Implicit | Thuộc tính |
|---|---|
| `AnimatedContainer` | size/màu/padding/border/decoration |
| `AnimatedOpacity` | độ mờ |
| `AnimatedScale/Rotation` | scale/góc xoay |
| `AnimatedSwitcher` | chuyển child (cần key) |
| `AnimatedCrossFade` | fade giữa hai child |

Duration 150–300ms cho micro-interaction; 300–500ms cho chuyển màn. `AnimatedSwitcher`
cần key khác nhau cho child mới. Explicit animation cần `AnimationController` +
`TickerProvider`:

```dart
class _PulseState extends State<Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 600));
    _scale = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      ScaleTransition(scale: _scale, child: widget.child);
}
```

- `SingleTickerProviderStateMixin` cho một controller; `TickerProviderStateMixin` cho
  nhiều.
- `repeat/reverse/stop/reset/forward(from:)`; `AnimationStatus` để biết trạng thái.
- `AnimatedBuilder`/`ListenableBuilder` chỉ rebuild phần cần; không `setState` mỗi frame.
- Không tạo controller trong `build`.

> ⚠️ Quên dispose controller gây leak ticker và assertion khi hot reload.

### 11.2 Curves, Hero, reduce motion và lỗi

Curves: `easeOut` enter, `easeIn` exit, `easeInOut` mượt, `easeOutBack` hơi overshoot,
`elasticOut` dùng tiết chế.

- `Hero` tag duy nhất trên màn nguồn/đích; item list cần key ổn định; không dùng cho
  widget state phức tạp/kích thước chênh lớn; có thể `flightShuttleBuilder`.
- Reduce motion: `MediaQuery.maybeOf(context)?.disableAnimations ?? false`; giảm duration
  về 0 hoặc fade nhẹ; không truyền tải thông tin chỉ bằng animation.

```dart
final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
final duration = reduceMotion ? Duration.zero : const Duration(milliseconds: 250);
```

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| Ticker leak | Không dispose controller | Dispose trong `dispose` |
| Animation không chạy | Quên forward/repeat | Gọi đúng lifecycle |
| Giật/lag | Animate layout phức tạp | Ưu tiên transform/opacity |
| Hero sai item | Tag trùng/không key | Tag duy nhất + ValueKey |
| Không tôn trọng accessibility | Bỏ qua MediaQuery | Kiểm tra `disableAnimations` |

---

## 12. Testing cơ bản

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Wish.fromJson đọc đúng field snake_case', () {
    final wish = Wish.fromJson({
      'id': 42, 'sender_name': 'Ngọc Anh', 'content': 'Chúc mừng!',
      'will_attend': true, 'guest_of': 'Bạn thân', 'number_attend': 2,
      'created_at': '2026-10-20T10:00:00Z',
    });

    expect(wish.id, '42');
    expect(wish.senderName, 'Ngọc Anh');
    expect(wish.numberAttend, 2);
    expect(wish.createdAt.isUtc, isFalse);
  });
}
```

```dart
testWidgets('hiển thị empty state', (tester) async {
  await tester.pumpWidget(const MaterialApp(
    home: Scaffold(body: Center(child: Text('Hãy là người đầu tiên!'))),
  ));
  expect(find.text('Hãy là người đầu tiên!'), findsOneWidget);
});
```

Widget gọi API: inject client giả hoặc tách UI thuần. Dùng `tester.enterText`,
`tester.tap`, `tester.pumpAndSettle`. Integration test khởi động app thật với
`IntegrationTestWidgetsFlutterBinding.ensureInitialized()`; chạy `flutter test` và
`flutter test integration_test/app_test.dart -d <device-id>`.

### 12.1 Unit test, widget test và matchers

- Unit: parse, transform, validation, tính toán; `group`, `setUp/tearDown`.
- Widget: `pumpWidget`, finder `byType/byKey/text/icon/descendant/ancestor`.
- `tester.ensureVisible` trước tap item ngoài viewport; `drag`/`scrollUntilVisible`.
- `tester.view.physicalSize`/`devicePixelRatio` để test màn nhỏ; reset sau test.
- Matchers: `equals`, `same`, `isA<T>`, `contains`, `hasLength`, `isEmpty`,
  `throwsA(isA<Exception>())`, `closeTo`, `predicate`, `greaterThan/lessThan`.
- `expect(actual, equals(expected))` cần `==` đúng; list/map dùng `listEquals`/`equals`.

```dart
testWidgets('form báo lỗi khi tên rỗng', (tester) async {
  await tester.pumpWidget(MaterialApp(
    home: Scaffold(body: RsvpForm(onSubmit: (_) async {})),
  ));
  await tester.tap(find.text('Gửi lời chúc'));
  await tester.pump();
  expect(find.text('Nhập tên'), findsOneWidget);
});
```

> ⚠️ Widget test không có plugin thật; storage/network cần fake hoặc integration test.

### 12.2 pump, golden, integration và fake client

| Hàm | Hành vi | Dùng khi |
|---|---|---|
| `pump()` | Một frame | Ngay sau tap/setState |
| `pump(Duration)` | Tiến thời gian giả | Timer/animation ngắn |
| `pumpAndSettle()` | Lặp đến hết frame | Animation kết thúc |
| `runAsync()` | Async thật | I/O/isolate |

`pumpAndSettle` treo với animation vô hạn (`CircularProgressIndicator`) → dùng
`pump(Duration)`. Golden test so pixel, rất nhạy font/theme/OS; tạo/cập nhật bằng
`flutter test --update-goldens`; chạy CI cố định.

Integration test:

```dart
import 'package:integration_test/integration_test.dart';
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('gửi lời chúc', (tester) async {
    app.main();
    await tester.pumpAndSettle();
    // enterText, tap, expect...
  });
}
```

Fake client:

```dart
class FakeMessageRepository implements MessageRepository {
  FakeMessageRepository({this.items = const [], this.error});
  final List<Wish> items;
  final Object? error;
  int fetchCount = 0;

  @override
  Future<List<Wish>> fetch() async {
    fetchCount++;
    if (error != null) throw error!;
    return items;
  }

  @override
  Future<Wish> create(Wish wish) async => wish;
}
```

Ưu tiên fake interface hơn mock framework; mock quá sâu dễ vỡ khi refactor.

> ⚠️ Integration test gọi mạng thật dễ flaky; dùng backend test/mock server.

### 12.3 Coverage, flaky test và lỗi

`flutter test --coverage`; ưu tiên logic quan trọng, không viết test chỉ tăng số. Flaky
thường do thời gian thật, animation vô hạn, mạng thật, thứ tự test, state toàn cục,
random/DateTime.now, golden khác môi trường. Sửa nguyên nhân, không thêm retry mù.

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `pumpAndSettle timed out` | Animation vô hạn/loading | `pump(Duration)` |
| `Found 0 widgets` | Finder sai/offstage | `find.byKey`, kiểm tra |
| `Found multiple widgets` | Finder quá chung | `.first`, `descendant` |
| Golden lệch | Font/theme/version | Update trên CI |
| `MissingPluginException` | Widget test thiếu plugin | Mock/integration |
| Test treo | Future không hoàn thành | Fake/`runAsync` |

---

## 13. Debug và DevTools

```dart
debugPrint('Gửi lời chúc thất bại: $error');
// Tránh: print(token) hoặc log toàn bộ response chứa dữ liệu cá nhân.
```

`debugPrint` tự throttle trên Android, không bị cắt log dài như `print`; vẫn không dùng
cho log production. Dùng logging có mức (`debug/info/warn/error`) và ẩn PII.

| Triệu chứng | Kiểm tra trước tiên |
|---|---|
| Màn hình đỏ/overflow | Đọc lỗi constraint, widget gần nhất, `Expanded`/scroll |
| UI không cập nhật | State ownership, `notifyListeners`, `mounted` |
| Crash khi mở màn | Log, `flutter run`, stack trace, DevTools |
| API lỗi | `curl`/Postman, base URL, CORS (web), token |
| Chậm | DevTools Performance, rebuild thừa, ảnh lớn |
| Memory tăng | Controller/subscription/socket không dispose |

### 13.1 Flutter DevTools: widget, performance, memory, network

Mở bằng `flutter run` rồi nhấn phím `v`, hoặc `dart devtools`. Các tab chính:

| Tab | Dùng để |
|---|---|
| Widget Inspector | Cây widget, constraint, size, rebuild |
| Performance | Frame chart, timeline, jank |
| CPU Profiler | Hàm tốn CPU |
| Memory | Heap, allocation, leak nghi ngờ |
| Network | Request/response (nếu bật) |
| App Size | Thành phần APK/IPA |

- Bật **Highlight oversized images** và **Track widget rebuilds**.
- Performance overlay: `showPerformanceOverlay: true` trong `MaterialApp` (debug).
- `debugPaintSizeEnabled = true`, `debugPaintBaselinesEnabled = true` khi cần.
- Repaint rainbow: `debugRepaintRainbowEnabled = true` (debug only).

> ⚠️ Không bật debug flags trong release; chúng làm chậm và lộ thông tin.

### 13.2 Logging, error handling và FlutterError

```dart
FlutterError.onError = (details) {
  FlutterError.presentError(details);
  // gửi details.exceptionAsString() tới crash reporting nếu có
};

PlatformDispatcher.instance.onError = (error, stack) {
  debugPrint('Lỗi nền: $error\n$stack');
  return true;
};
```

- `FlutterError.onError` bắt lỗi build/layout/paint; `runZonedGuarded` bắt async.
- `ErrorWidget.builder` chỉ để debug/thay UI lỗi; không che lỗi.
- `assert` chỉ chạy debug; không dùng để validate input production.
- `debugPrintStack`/`FlutterError.dumpErrorToConsole` khi cần stack đầy đủ.
- Không log token, Authorization header, nội dung lời chúc riêng tư.

### 13.3 Breakpoint, inspect, hot reload và lỗi thường gặp

- Breakpoint trong VS Code/Android Studio; dùng `debugger()` hoặc `dart:developer`.
- Hot reload giữ state; hot restart xóa state — dùng restart khi đổi `main`, global,
  static, enum, hoặc thêm asset/plugin.
- `flutter clean` + `pub get` khi lỗi build khó hiểu; xóa app trên máy khi đổi native.
- Inspect widget trong DevTools để xem constraint thực tế thay vì đoán.
- `flutter analyze` trước khi chạy; sửa warning sớm.

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| Hot reload không thấy đổi | Thay đổi cấu trúc/asset | Hot restart/rebuild |
| `setState() called after dispose` | Async sau khi rời màn | `mounted` |
| `RenderFlex overflow` | Constraint chật | `Expanded`/scroll/ellipsis |
| `Null check operator` | `!` trên null | Null safety/validate |
| `LateInitializationError` | `late` chưa gán | Khởi tạo đúng |
| `Bad state: No element` | `first` trên rỗng | `firstOrNull`/kiểm tra |

---

## 14. Build và release

Cấu trúc gợi ý:

```text
lib/
  main.dart
  app.dart
  core/            # theme, router, env, network
  features/
    guestbook/
      data/        # api, repository, dto
      domain/      # model, use case
      presentation/# screen, widget, controller
  shared/          # widget dùng chung
supabase/
  migrations/
  functions/
test/
integration_test/
```

Lệnh thường dùng:

```bash
flutter pub get
flutter analyze
flutter test
flutter build apk --release --flavor prod -t lib/main_prod.dart \
  --dart-define=API_BASE_URL=https://api.example.com
flutter build appbundle --release --flavor prod -t lib/main_prod.dart
flutter build ios --release --flavor prod -t lib/main_prod.dart
```

`--split-per-abi` giảm dung lượng APK nhưng tạo nhiều file; AAB cho Play Store. iOS cần
Xcode/signing, `flutter build ipa`; không commit keystore/certificate.

### 14.1 Flavors, entrypoint, dart-define và biến môi trường

```dart
class AppConfig {
  const AppConfig({required this.apiBaseUrl, required this.wsUrl, required this.isProd});
  final String apiBaseUrl;
  final String wsUrl;
  final bool isProd;

  factory AppConfig.fromEnvironment() => AppConfig(
        apiBaseUrl: const String.fromEnvironment('API_BASE_URL'),
        wsUrl: const String.fromEnvironment('WS_URL'),
        isProd: const bool.fromEnvironment('dart.vm.product'),
      );
}
```

Truyền `--dart-define` hoặc `--dart-define-from-file=config/prod.json`. Không commit
secret; `API_BASE_URL`/`WS_URL` không phải secret, token/API key phải ở backend. Mỗi
flavor có bundle id, tên app, icon, signing riêng.

| Môi trường | API | Ghi chú |
|---|---|---|
| dev | `http://10.0.2.2:3000` | Android emulator |
| staging | `https://staging-api...` | Dữ liệu test |
| prod | `https://api...` | HTTPS/WSS bắt buộc |

> ⚠️ Không dùng chung database prod cho dev/staging. Không hard-code URL trong widget.

### 14.2 Android signing, iOS signing và CI

Android:

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA \
  -keysize 2048 -validity 10000 -alias upload
```

Khai báo `key.properties` (không commit) và `signingConfigs.release` trong
`android/app/build.gradle` (Groovy) hoặc `.kts`; bật minify/shrink nếu đã test kỹ.

iOS: mở `ios/Runner.xcworkspace`, cấu hình Team/Bundle ID/Provisioning; `flutter build
ipa --export-method app-store`. Dùng `--obfuscate --split-debug-info=build/symbols` nếu
cần, lưu file symbol để đọc stack trace.

CI cơ bản: format/analyze/test → build → upload artifact; pin Flutter version; cache
pub; không in secret; build reproducible nếu có thể.

---

## 15. Câu hỏi thường gặp

**Vì sao UI không cập nhật?**
Kiểm tra state có thực sự đổi tham chiếu (list `add` tại chỗ không đổi identity), đã gọi
`setState`/`notifyListeners`, widget có đang `const` hoặc lấy state từ provider đúng
không, và async có bị bỏ qua bởi `mounted` không.

**Provider, Riverpod hay Bloc?**
App nhỏ: `setState` + `ChangeNotifier`/Provider. App vừa/lớn, cần test/override: Riverpod.
Nhiều event/audit, team quen: Bloc. Chọn một từ đầu, không trộn trong cùng feature.

**`FutureBuilder` hay `StreamBuilder`?**
`FutureBuilder` cho request một lần; `StreamBuilder` cho dữ liệu realtime/stream. Với
logic phức tạp (retry, cache, pagination), dùng controller/repository thay vì nhồi vào
builder.

**Làm sao tránh overflow?**
Dùng `Expanded`/`Flexible` trong Row/Column, `maxLines` + ellipsis cho text, `Wrap` cho
chip/tag, scroll cho nội dung dài, và kiểm tra constraint thực tế bằng DevTools.

**Nên dùng go_router không?**
Có, khi cần deep link, web, auth guard, nested tab, hoặc nhiều màn. App 2–3 màn có thể
dùng `Navigator` thuần.

**Làm sao gửi lời chúc an toàn?**
Validate client + server, giới hạn độ dài, rate limit, trim, escape/encode đúng, không
log nội dung riêng tư, dùng HTTPS. Không tin `sender_name`/`guest_of` từ client.

**Tại sao ảnh không hiện trên release?**
Kiểm tra asset đã khai báo, đường dẫn đúng hoa/thường, `flutter clean`, bundle id/version;
với ảnh mạng kiểm tra HTTPS/quyền.

### 15.1 Bài tập thực hành

1. Dựng màn `GuestbookScreen` tải `/api/messages/`, có loading/error/empty, pull-to-refresh
   và phân trang cursor.
2. Form RSVP: validate tên ≥2 ký tự, lời chúc 5–500 ký tự, chọn số người 0–10; khóa nút
   khi gửi; hiển thị lỗi server.
3. Thêm `go_router`: `/`, `/wish/:id`, `/rsvp`; chặn rời form khi có dữ liệu chưa lưu.
4. Viết unit test `Wish.fromJson` (id số/chuỗi, field thiếu) và widget test empty/error.
5. Thêm WebSocket upsert/delete + reconnect backoff; refetch khi app resumed.
6. Golden test `WishCard` ở 320dp và text scale 1.5.

---

## 16. Anti-patterns

1. **Gọi API trong `build`.** Mỗi rebuild tạo request mới. Tạo Future/controller trong
   `initState`, repository hoặc provider; cache kết quả.
2. **Quên dispose controller/subscription/socket/timer.** Gây leak, ticker tiếp tục
   chạy, setState sau dispose. Dispose đúng owner.
3. **Dùng `context` sau `await` mà không kiểm tra `mounted`.** Crash hoặc điều hướng sai.
4. **Hard-code màu, spacing, URL, token.** Khó dark mode/đổi môi trường, lộ secret. Dùng
   theme, token, `--dart-define`.
5. **List dài không dùng builder, bọc `shrinkWrap` + scroll lồng nhau.** Mất lazy, jank,
   overflow. Dùng `ListView.builder`/sliver.
6. **Nuốt lỗi bằng `catch (_) {}`.** Không ai biết vì sao trống/lỗi. Log có ngữ cảnh,
   map lỗi, hiển thị trạng thái.
7. **Chỉ validate client.** Server vẫn phải validate; client chỉ hỗ trợ UX.
8. **Tạo controller trong build.** Mất text, leak listener. Controller là field của
   `State`.
9. **Dùng `setState` cho mọi thứ.** Rebuild quá rộng; tách widget, dùng `ValueListenable`,
   `Selector`, `AnimatedBuilder`.
10. **Không dedupe realtime.** Event lặp/update tạo item trùng. Upsert theo id.
11. **Retry mọi lỗi, kể cả POST không idempotent.** Tạo bản ghi trùng; chỉ retry lỗi tạm
    thời/idempotent với backoff.
12. **Lưu token trong shared_preferences hoặc log request.** Lộ thông tin; dùng secure
    storage, che header/PII.
13. **Bỏ qua text scale, dark mode, màn hình nhỏ.** Vỡ layout/không truy cập được. Test
    320dp, 1.5–2.0x, light/dark.
14. **Trộn Provider/Riverpod/Bloc trong cùng feature.** Khó hiểu, khó test. Chọn một.
15. **Đưa mọi thứ lên global.** Khó test, coupling cao. State ở gần nơi dùng nhất.
16. **Không có loading/error/empty.** Người dùng thấy màn trắng hoặc kẹt. Thiết kế đủ
    trạng thái.
17. **Dùng `!` thay vì xử lý null.** Crash production. Kiểm tra/`??`/pattern matching.
18. **Không khóa nút submit.** Double-tap tạo hai bản ghi. Disable khi đang gửi.
19. **Dựa vào `print` trong production.** Không có mức log, lộ dữ liệu. Dùng logging có
    kiểm soát.
20. **Không tôn trọng reduce motion.** Animation gây khó chịu. Kiểm tra
    `disableAnimations`.
21. **Đặt `Form` trong `ListView.builder` với field lazy.** Validator bỏ sót field chưa
    build. Dùng children cố định/scroll view.
22. **Reconnect WebSocket vô hạn khi auth lỗi.** Tốn pin, spam server. Không reconnect
    với close code 4003; refresh có giới hạn với 4001.
23. **Không tăng build number.** Store từ chối upload. Tăng mỗi bản phát hành.
24. **Không lưu symbol khi obfuscate.** Stack trace vô dụng. Lưu artifact symbol.
25. **Copy code mà không hiểu lifecycle/constraint.** Bug khó tái hiện. Đọc widget
    contract và kiểm tra bằng DevTools.

---

## 17. Checklist

### Dart và model

- [ ] Null safety rõ ràng; không lạm dụng `!`/`late`.
- [ ] Model immutable; `fromJson` phòng thủ; `DateTime` UTC → local khi hiển thị.
- [ ] Enum/pattern matching xử lý đủ nhánh; có giá trị fallback.
- [ ] Equality/hashCode đúng nếu dùng trong Set/Map/so sánh.

### Async, HTTP và realtime

- [ ] Request có timeout; base URL từ môi trường; client được đóng.
- [ ] Đủ loading/error/empty/data; không gọi API trong build.
- [ ] `mounted` sau await; race condition được xử lý.
- [ ] Retry chỉ lỗi tạm thời/idempotent; backoff + jitter.
- [ ] WebSocket dedupe theo id; reconnect backoff; refetch khi resumed.

### UI và state

- [ ] State ở đúng cấp; không global hóa không cần thiết.
- [ ] Controller/FocusNode/Timer/Subscription/Socket được dispose.
- [ ] List dài dùng builder/sliver; không scroll lồng cùng chiều.
- [ ] Text có `maxLines`/ellipsis; `Expanded`/`Flexible` đúng chỗ.
- [ ] Theme Material 3, dark mode, contrast; không hard-code màu.
- [ ] SafeArea; responsive 320/600/900dp; text scale 1.5–2.0.
- [ ] Animation 150–300ms, tôn trọng reduce motion.

### Form và navigation

- [ ] Validate client + server; trim; giới hạn độ dài; khóa nút khi gửi.
- [ ] Bàn phím không che nút; focus/next/done hợp lý.
- [ ] Back chặn khi có dữ liệu chưa lưu bằng `PopScope`.
- [ ] Deep link/auth guard được test; `context.mounted` sau await.

### Storage và bảo mật

- [ ] Không lưu token/PII trong shared_preferences; dùng secure storage.
- [ ] Migration DB có version; index cho truy vấn thường dùng.
- [ ] Xóa token/cache khi logout; không log Authorization/PII.
- [ ] HTTPS/WSS ở production; không bypass TLS.

### Testing và release

- [ ] `flutter analyze` sạch; unit/widget test cho luồng chính.
- [ ] Test empty/error/loading, màn nhỏ, dark mode, text scale.
- [ ] Golden test ổn định hoặc chấp nhận cập nhật có kiểm soát.
- [ ] Integration test trên thiết bị thật cho luồng quan trọng.
- [ ] Version/build tăng; signing đúng; ProGuard/R8 ổn.
- [ ] Icon/splash/permission/privacy; API prod; không debug flag.
- [ ] Lưu symbol nếu obfuscate; crash reporting đã cấu hình.
- [ ] Kiểm tra offline/retry/back; staged rollout.

---

## 18. Tài liệu tham khảo

- **Flutter**: widget catalog, cookbook, layout/constraints, navigation, testing,
  performance, build/release.
- **Dart**: language tour, null safety, asynchronous programming, isolates, patterns.
- **Material 3**: color roles, typography, accessibility, motion.
- **Package chính**: `http`, `go_router`, `provider`, `flutter_riverpod`, `flutter_bloc`,
  `web_socket_channel`, `shared_preferences`, `sqflite`, `drift`,
  `flutter_secure_storage`, `intl`, `flutter_svg`.
- **Công cụ**: Flutter DevTools, `flutter analyze`, `flutter test`, `flutter build`,
  Android Studio/VS Code, Xcode.

> 📌 Khi API/package thay đổi, ưu tiên tài liệu chính thức và changelog của package;
> kiểm tra phiên bản trong `pubspec.yaml` trước khi copy code.