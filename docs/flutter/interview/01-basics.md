# Flutter Interview — Cơ bản (Junior)

> 140 câu hỏi nền tảng: Dart, widget, layout, lifecycle, navigation, async, HTTP,
> WebSocket, testing và debug. Đáp án viết theo hướng "nói được trong 60–90 giây",
> kèm ví dụ và bẫy thường gặp.

---

## Mục lục

1. [Dart language](#1-dart-language)
2. [Flutter core](#2-flutter-core)
3. [Layout và UI](#3-layout-và-ui)
4. [Navigation, form, theme](#4-navigation-form-theme)
5. [Async, network, storage](#5-async-network-storage)
6. [Testing, debug, build](#6-testing-debug-build)
7. [Câu hỏi tình huống ngắn](#7-câu-hỏi-tình-huống-ngắn)
8. [Câu hỏi bổ sung (cập nhật)](#8-câu-hỏi-bổ-sung-cập-nhật)
9. [Tài liệu tham khảo](#9-tài-liệu-tham-khảo)

---

## 1. Dart language

### Q01. Dart là ngôn ngữ biên dịch hay thông dịch? [J]

**Trả lời:** Dart hỗ trợ cả hai. Khi development, code được biên dịch sang kernel và chạy
bằng Dart VM ở chế độ **JIT**, cho phép hot reload và debug. Khi release, Dart được
**AOT compile** sang mã máy native cho từng nền tảng (hoặc JavaScript/Wasm cho web).
Dart có **sound null safety** (từ Dart 2.12), garbage collector generational, và mỗi
isolate có event loop riêng.

**Điểm cộng:** phân biệt JIT (nhanh vòng lặp phát triển) với AOT (khởi động và chạy
nhanh, không có source code Dart trong app release). Không nói "Dart chạy trên JVM".

---

### Q02. `var`, `final`, `const`, `late` khác nhau thế nào? [J]

**Trả lời:**

| Từ khóa | Ý nghĩa |
|---|---|
| `var` | Suy luận kiểu, biến có thể gán lại |
| `final` | Gán đúng một lần, có thể là runtime value |
| `const` | Hằng compile-time, được canonicalize |
| `late` | Khởi tạo muộn (lazy), bắt buộc gán trước khi đọc |

```dart
var count = 0;
count = 1;

final now = DateTime.now();       // runtime, chỉ gán một lần
const maxGuests = 200;            // compile-time
const list = <int>[1, 2, 3];      // const collection

late final controller = TextEditingController(); // tạo khi đọc lần đầu
```

`final` không làm object bên trong bất biến: `final List<int> xs = [1]; xs.add(2);` vẫn
hợp lệ. `const` yêu cầu toàn bộ giá trị là hằng compile-time.

**Bẫy:** `late` che giấu lỗi logic; đọc trước khi gán sẽ ném `LateInitializationError`.
Không dùng `late` chỉ để tránh khai báo nullable nếu lifecycle không đảm bảo.

---

### Q03. Null safety trong Dart hoạt động thế nào? [J]

**Trả lời:** Mặc định mọi biến **không được null**; muốn null phải khai báo `Type?`.
Compiler buộc xử lý trước khi dùng, nhờ flow analysis và type promotion.

```dart
String? nickname;
final length = nickname?.length ?? 0;
if (nickname != null) {
  print(nickname.length); // promoted
}
final unsafe = nickname!; // ném nếu null — chỉ dùng khi chắc chắn
```

Các công cụ: `?.`, `??`, `??=`, `!`, `late`, `required`, `Object?`.

**Điểm cộng:** sound null safety nghĩa là không thể gán null cho biến non-nullable trừ
khi dùng `dynamic`/interop. `!` là escape hatch, không phải cách xử lý null.

---

### Q04. `dynamic`, `Object?`, và `var` khác nhau gì? [J]

**Trả lời:**

- `var` suy luận kiểu tại compile-time, sau đó kiểu cố định.
- `Object?` là kiểu cha của mọi thứ, nhưng muốn dùng phải kiểm tra/cast.
- `dynamic` tắt kiểm tra kiểu tĩnh, gọi method nào cũng được và có thể nổ runtime.

```dart
dynamic a = 'hello';
a.foo();                 // compile OK, runtime NoSuchMethodError

Object? b = 'hello';
if (b is String) print(b.length); // an toàn
```

**Bẫy:** dùng `dynamic` cho JSON sẽ đẩy lỗi từ compile-time sang production. Ưu tiên
`Object?` + parse có kiểm tra, hoặc model có `fromJson` tường minh.

---

### Q05. `List`, `Set`, `Map` khác nhau và dùng khi nào? [J]

**Trả lời:**

| Kiểu | Đặc điểm | Ví dụ |
|---|---|---|
| `List<T>` | Có thứ tự, index, cho phép trùng | Danh sách lời chúc |
| `Set<T>` | Không trùng, không index | Tập id đã xử lý |
| `Map<K,V>` | Key → value, key duy nhất | `{guestId: rsvpStatus}` |

```dart
final wishes = <String>['Chúc mừng', 'Hạnh phúc'];
final ids = <String>{'w1', 'w2'};
final byId = <String, Wish>{for (final w in list) w.id: w};
```

**Điểm cộng:** `Set`/`Map` dựa trên `==` và `hashCode`; object không override hai hàm
này sẽ so sánh theo identity. Dùng `List.unmodifiable` hoặc `const` khi muốn bảo vệ API.

---

### Q06. `Iterable` và `List` khác nhau gì? [J]

**Trả lời:** `List` là collection có index và lưu phần tử; `Iterable` là giao diện cho
chuỗi phần tử, nhiều thao tác là **lazy**. `map`, `where`, `expand` trả về `Iterable`,
chưa chạy cho đến khi được duyệt.

```dart
final names = wishes.map((w) => w.sender).where((s) => s.isNotEmpty);
final first = names.first;      // lúc này mới tính
final list = names.toList();    // vật chất hóa
```

**Bẫy:** lặp nhiều lần trên `Iterable` có side effect sẽ chạy lại; lặp qua `Iterable`
được sinh từ nguồn thay đổi có thể không ổn định. Khi cần index hoặc truy cập nhiều lần,
dùng `List`.

---

### Q07. `Future` và `Stream` khác nhau thế nào? [J]

**Trả lời:** `Future<T>` đại diện **một** giá trị (hoặc lỗi) trong tương lai.
`Stream<T>` đại diện **nhiều** giá trị theo thời gian (WebSocket, timer, DB watch).

```dart
Future<Wish> loadOne() async => api.getWish('w1');

Stream<Wish> watchAll() => repository.watchWishes();

final sub = watchAll().listen(
  (wish) => print(wish.content),
  onError: (e) => print('Lỗi: $e'),
  onDone: () => print('Kết thúc'),
);
await sub.cancel();
```

**Điểm cộng:** stream có single-subscription và broadcast; `StreamBuilder` tự quản lý
subscription; luôn `cancel()` khi không cần để tránh leak.

---

### Q08. Event loop, microtask và event queue trong Dart? [J]

**Trả lời:** Mỗi isolate chạy một event loop. Sau khi code đồng bộ kết thúc, Dart xử lý
**microtask queue** trước, rồi mới đến **event queue** (I/O, timer, message). Phần tiếp
theo sau `await` được schedule như microtask.

```dart
print('A');
Future.microtask(() => print('B'));
Future(() => print('C'));
print('D');
// A D B C
```

**Bẫy:** tác vụ CPU nặng trong một callback sẽ chặn cả UI lẫn event loop. Dùng isolate
cho parse/encrypt/compress lớn, không dùng `await Future.delayed` để "nhường" CPU.

---

### Q09. `Future.wait` và `Future.any` khác nhau? [J]

**Trả lời:** `Future.wait` chờ **tất cả** future và trả về `List` kết quả; mặc định nó
fail-fast khi một future lỗi (có thể đổi bằng `eagerError`). `Future.any` trả về future
**đầu tiên** hoàn thành, bất kể thành công hay lỗi.

```dart
final results = await Future.wait([
  api.getMessages(),
  api.getGuests(),
]);

final fastest = await Future.any([
  cache.read(),
  api.fetch().timeout(const Duration(seconds: 2)),
]);
```

**Điểm cộng:** `Future.wait` không tự hủy các future còn lại khi một cái lỗi; với
request HTTP nên dùng cancellation token/timeout để tránh tải không cần thiết.

---

### Q10. Isolate là gì? Khi nào cần dùng? [J]

**Trả lời:** Isolate là đơn vị concurrency của Dart, có **bộ nhớ riêng**, giao tiếp bằng
message qua `SendPort`/`ReceivePort`. Không có shared mutable memory nên không cần lock.

```dart
final result = await Isolate.run(() {
  return heavyJsonDecode(payload);
});
```

Dùng khi có tác vụ CPU nặng (parse file lớn, mã hóa, xử lý ảnh) làm UI jank. Không cần
isolate cho HTTP/DB vì các thao tác đó đã async và chờ I/O.

**Bẫy:** closure gửi sang isolate phải gửi được (sendable); không capture `BuildContext`,
`dio`, object native. Trên web, `Isolate.run` không tạo OS thread như mobile.

---

### Q11. `mixin`, `extends`, `implements`, `extension` khác nhau? [J]

**Trả lời:**

- `extends`: kế thừa class, có `super`, quan hệ **is-a**.
- `implements`: cam kết implement toàn bộ interface, không nhận code.
- `with mixin`: tái sử dụng hành vi theo chiều ngang, không cần kế thừa.
- `extension`: thêm method/getter cho kiểu có sẵn, dispatch tĩnh.

```dart
mixin Timestamped {
  DateTime get createdAt;
}

extension Initials on String {
  String get initials => split(' ').map((p) => p[0]).take(2).join();
}

class Wish with Timestamped {
  @override
  final DateTime createdAt;
  Wish(this.createdAt);
}
```

**Bẫy:** extension không thể thêm field, không override method của class, và nếu hai
extension cùng tên method sẽ cần chỉ định rõ. Mixin có thể yêu cầu `on SomeBase`.

---

### Q12. `sealed class` và pattern matching trong Dart 3 dùng để làm gì? [J]

**Trả lời:** `sealed` giới hạn các subclass trong cùng library, cho phép compiler kiểm
tra `switch` **exhaustive**. Rất phù hợp để mô hình hóa state/result.

```dart
sealed class LoadState<T> {
  const LoadState();
}
final class Loading<T> extends LoadState<T> { const Loading(); }
final class Success<T> extends LoadState<T> {
  const Success(this.data);
  final T data;
}
final class Failure<T> extends LoadState<T> {
  const Failure(this.message);
  final String message;
}

String describe(LoadState<List<Wish>> state) => switch (state) {
      Loading() => 'Đang tải',
      Success(:final data) => '${data.length} lời chúc',
      Failure(:final message) => 'Lỗi: $message',
    };
```

**Điểm cộng:** `final`/`base`/`interface` class modifier kiểm soát kế thừa; `sealed` giúp
loại bỏ default branch và giảm bug khi thêm state mới.

---

### Q13. Record trong Dart 3 là gì? [J]

**Trả lời:** Record là kiểu gộp nhiều giá trị, có thể positional hoặc named, so sánh theo
giá trị, không cần tạo class.

```dart
({int attending, int declined}) rsvpStats(List<Guest> guests) {
  final attending = guests.where((g) => g.attending).length;
  return (attending: attending, declined: guests.length - attending);
}

final stats = rsvpStats(guests);
print(stats.attending);

final (name, age) = ('Minh', 30); // destructuring
```

**Bẫy:** record không có `fromJson`/`toJson`, không phù hợp làm entity lớn hoặc cần
method. Dùng record cho return value nhỏ, còn domain model vẫn nên là class.

---

### Q14. Các loại constructor trong Dart? [J]

**Trả lời:** default, named, factory, const, redirecting, và initializer list.

```dart
class Wish {
  Wish({required this.sender, required this.content})
      : createdAt = DateTime.now();

  Wish.empty() : this(sender: '', content: '');

  factory Wish.fromJson(Map<String, Object?> json) => Wish(
        sender: json['sender'] as String? ?? 'Ẩn danh',
        content: json['content'] as String? ?? '',
      );

  const Wish.seed({this.sender = 'Seed', this.content = '...'})
      : createdAt = null;

  final String sender;
  final String content;
  final DateTime? createdAt;
}
```

**Điểm cộng:** `factory` không bắt buộc tạo instance mới (cache/subclass), `const`
constructor cần mọi field `final` và initializer là hằng. Không đặt logic nặng trong
constructor.

---

### Q15. `==`, `hashCode`, `identical` khác nhau? [J]

**Trả lời:** `identical(a, b)` kiểm tra cùng một object (identity). `==` mặc định cũng là
identity, nhưng có thể override để so sánh giá trị. Nếu override `==` **phải** override
`hashCode` để dùng đúng trong `Set`/`Map`.

```dart
class Wish {
  Wish(this.id);
  final String id;

  @override
  bool operator ==(Object other) => other is Wish && other.id == id;

  @override
  int get hashCode => id.hashCode;
}
```

**Bẫy:** dùng object mutable làm key rồi thay đổi field ảnh hưởng `hashCode` sẽ làm mất
entry trong Map/Set. Với model lớn, dùng `Equatable`, `freezed` hoặc codegen.

---

### Q16. Getter/setter khác method thế nào? [J]

**Trả lời:** getter/setter truy cập như property, không cần `()`; getter không tham số,
setter một tham số. Dùng khi thao tác nhẹ, không gây bất ngờ hoặc I/O.

```dart
class Rsvp {
  int _guests = 0;
  int get guests => _guests;
  set guests(int value) {
    if (value < 0) throw ArgumentError.value(value, 'guests');
    _guests = value;
  }
}
```

**Bẫy:** getter gọi API/DB hoặc tính toán nặng khiến caller tưởng là miễn phí. Nếu có
thể ném lỗi/async, dùng method rõ ràng (`Future<int> loadGuests()`).

---

### Q17. `static` và top-level khác gì? Khi nào dùng? [J]

**Trả lời:** `static` thuộc class, không cần instance, không truy cập `this`. Top-level là
biến/hàm trong library, cũng không cần instance. Dùng cho hằng số, factory helper, pure
function; tránh static mutable toàn cục vì khó test và gây state ẩn.

```dart
class ApiRoutes {
  static const messages = '/api/messages';
  static Uri message(String id) => Uri.parse('$messages/$id');
}
```

**Điểm cộng:** static field giữ state suốt vòng đời isolate; trong test có thể rò rỉ giữa
các test. Ưu tiên dependency injection cho service có state.

---

### Q18. `late final` có lợi và hại gì? [J]

**Trả lời:** `late final` khởi tạo lười lần đầu đọc, sau đó không đổi. Tiện cho controller
cần `this`/context hoặc dependency khởi tạo tốn kém.

```dart
class _FormState extends State<FormScreen> {
  late final TextEditingController _name =
      TextEditingController(text: widget.initialName);

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }
}
```

**Bẫy:** nếu không bao giờ đọc, đối tượng không được tạo — có thể che lỗi; nếu đọc trước
khi gán trong nhánh khác, ném `LateInitializationError`; vòng tham chiếu có thể rò rỉ.
Không dùng `late` cho biến có thể thực sự null.

---

### Q19. `Exception` và `Error` khác nhau? Xử lý lỗi async thế nào? [J]

**Trả lời:** `Exception` là lỗi dự kiến có thể phục hồi (network, format, validation);
`Error` là lỗi lập trình (null check, assertion, type) thường không nên bắt để tiếp tục.
Bắt cụ thể, `rethrow` nếu không xử lý được, dùng `finally` để cleanup.

```dart
try {
  final json = await api.fetchMessages();
  return parseMessages(json);
} on TimeoutException {
  throw const ApiFailure.timeout();
} on FormatException catch (e) {
  throw ApiFailure.badData(e.message);
} finally {
  loading = false;
}
```

**Điểm cộng:** lỗi async không được await sẽ thành unhandled; bọc `runZonedGuarded` hoặc
gán `FlutterError.onError`/`PlatformDispatcher.instance.onError` để log. Không catch
`Object` rồi nuốt lỗi.

---

### Q20. `StreamController` single-subscription và broadcast khác nhau? [J]

**Trả lời:** Single-subscription chỉ cho một listener, có buffer và backpressure
(pause/resume). Broadcast cho nhiều listener, không buffer cho listener đến muộn.

```dart
final controller = StreamController<Wish>.broadcast();

final sub = controller.stream.listen(print);
controller.add(wish);
await controller.close();
await sub.cancel();
```

**Bẫy:** broadcast không giữ event cho listener mới; nếu cần replay, dùng
`BehaviorSubject` (rxdart) hoặc state layer. Luôn `close()` controller và `cancel()`
subscription khi dispose. `sync: true` có thể gây re-entrancy, chỉ dùng khi hiểu rõ.

---

### Q21. `FutureBuilder` và `StreamBuilder` dùng thế nào cho đúng? [J]

**Trả lời:** Chúng rebuild theo `AsyncSnapshot`, gồm `connectionState`,
`hasData`, `hasError`. Phải xử lý đủ loading/error/data/empty.

```dart
class WishList extends StatefulWidget {
  const WishList({super.key});
  @override
  State<WishList> createState() => _WishListState();
}

class _WishListState extends State<WishList> {
  late final Future<List<Wish>> _future = api.getMessages();

  @override
  Widget build(BuildContext context) => FutureBuilder<List<Wish>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) return ErrorView(error: snapshot.error!);
          final wishes = snapshot.data ?? const [];
          if (wishes.isEmpty) return const EmptyView();
          return WishListView(wishes: wishes);
        },
      );
}
```

**Bẫy:** tạo `Future` trực tiếp trong `build()` làm request lặp mỗi rebuild. Lưu future
trong `initState`/provider. Không gọi `setState` bên trong builder.

---

## 2. Flutter core

### Q22. Kiến trúc tổng thể của Flutter gồm những gì? [J]

**Trả lời:** Ba tầng:

| Tầng | Ngôn ngữ | Vai trò |
|---|---|---|
| Framework | Dart | Widget, layout, animation, gesture, Material/Cupertino |
| Engine | C++ | Render (Impeller/Skia), text, Dart VM, I/O |
| Embedder | Kotlin/Swift/C++ | Tích hợp engine vào app host, lifecycle, input |

Ứng dụng Dart chạy trên engine; engine vẽ bằng GPU. Flutter **tự vẽ UI** thay vì map
sang widget native, nên UI nhất quán nhưng tích hợp hệ thống sâu cần platform channel.

**Điểm cộng:** Impeller là renderer mặc định trên iOS và Android mới, giảm shader
compilation jank; Skia vẫn là fallback ở một số môi trường.

---

### Q23. Widget tree, Element tree, Render tree khác nhau? [J]

**Trả lời:**

| Cây | Bản chất | Tồn tại |
|---|---|---|
| Widget | Mô tả UI bất biến, rất nhẹ | Ngắn hạn, tạo lại khi rebuild |
| Element | Instance gắn widget với vị trí, giữ State | Dài hạn |
| RenderObject | Layout + paint + hit test | Dài hạn |

Khi `setState`, widget mới được tạo; framework so sánh với widget cũ qua Element. Nếu
cùng runtimeType + key, Element được update thay vì tạo mới, nhờ đó State được giữ.

**Bẫy:** tưởng widget giữ state. State nằm ở `State` object do Element giữ, không nằm
trong widget. Widget phải bất biến (`final` field).

---

### Q24. `StatelessWidget` và `StatefulWidget` khác nhau? Khi nào dùng? [J]

**Trả lời:** `StatelessWidget` không có state nội bộ, build từ input. `StatefulWidget` có
object `State` tồn tại qua các lần rebuild, có lifecycle và `setState`.

```dart
class Counter extends StatefulWidget {
  const Counter({super.key});
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int value = 0;
  @override
  Widget build(BuildContext context) => TextButton(
        onPressed: () => setState(() => value++),
        child: Text('$value'),
      );
}
```

Dùng Stateful cho state **cục bộ, ngắn hạn** (animation, form, toggle). State chia sẻ
hoặc business state nên đưa lên state management.

**Bẫy:** field trong `StatefulWidget` phải `final`; đừng giữ mutable state ở widget.

---

### Q25. Lifecycle của `State` gồm những gì? [J]

**Trả lời:** Thứ tự chính:

1. `createState()`
2. `initState()` — khởi tạo, chưa nên dùng `context` phụ thuộc InheritedWidget.
3. `didChangeDependencies()` — sau `initState` và khi dependency đổi.
4. `build()` — có thể gọi nhiều lần.
5. `didUpdateWidget(oldWidget)` — parent truyền config mới.
6. `deactivate()` — rời tree tạm thời.
7. `dispose()` — hủy controller/subscription/timer.

```dart
@override
void initState() {
  super.initState();
  _sub = repository.watchWishes().listen(_onWish);
}

@override
void dispose() {
  _sub.cancel();
  _controller.dispose();
  super.dispose();
}
```

**Bẫy:** `setState` trong `initState` không cần thiết; `setState` sau `dispose` gây lỗi.
`didChangeDependencies` có thể chạy nhiều lần — đừng tạo subscription trùng ở đó nếu
không cleanup.

---

### Q26. `setState` hoạt động thế nào và những lỗi thường gặp? [J]

**Trả lời:** `setState(fn)` chạy `fn` đồng bộ, đánh dấu Element dirty, rồi schedule frame.
Trong frame tiếp theo, framework rebuild widget.

```dart
Future<void> submit() async {
  setState(() => loading = true);
  try {
    await api.send(draft);
    if (!mounted) return;
    setState(() => loading = false);
  } catch (e) {
    if (!mounted) return;
    setState(() { loading = false; error = '$e'; });
  }
}
```

**Bẫy:** gọi trong `build` gây loop; gọi sau `await` khi widget đã dispose; chỉ dùng cho
state cục bộ. Không mutate state trực tiếp mà không gọi `setState` nếu muốn UI cập nhật.

---

### Q27. `BuildContext` là gì? Vì sao không dùng sau `await`? [J]

**Trả lời:** `BuildContext` là handle tới vị trí của widget trong Element tree, dùng để
tra cứu `Theme`, `MediaQuery`, `Navigator`, `ScaffoldMessenger`... Context chỉ hợp lệ khi
widget còn mounted.

```dart
Future<void> save() async {
  await api.save();
  if (!mounted) return;          // State.mounted
  ScaffoldMessenger.of(context).showSnackBar(...);
}
```

Trong callback không có `State`, dùng `if (!context.mounted) return;`.

**Bẫy:** lưu context vào singleton/biến toàn cục; dùng context của widget cha sau khi
điều hướng; dùng context từ `initState` cho InheritedWidget phụ thuộc.

---

### Q28. Các loại key trong Flutter và khi nào dùng? [J]

**Trả lời:**

- `ValueKey<T>`: so sánh theo value, hay dùng cho item list (`ValueKey(wish.id)`).
- `ObjectKey`: so sánh theo identity object.
- `UniqueKey`: luôn khác, dùng khi muốn force tạo mới.
- `GlobalKey`: duy nhất toàn app, truy cập state/render object từ ngoài.
- `LocalKey`: base của ValueKey/ObjectKey/UniqueKey.

```dart
ListView.builder(
  itemBuilder: (context, i) => WishCard(key: ValueKey(wishes[i].id)),
);

final formKey = GlobalKey<FormState>();
Form(key: formKey, child: ...);
formKey.currentState?.validate();
```

**Bẫy:** dùng index làm key khi list thêm/xóa/sắp xếp gây state sai. `GlobalKey` đắt và
dễ lỗi nếu trùng; chỉ dùng khi thật cần (form, chart, scroll).

**Điểm cộng:** key giúp Element reconciliation nhận diện item di chuyển, giữ state và
tránh rebuild sai.

---

### Q29. `const` widget giúp gì? [J]

**Trả lời:** Widget `const` được tạo compile-time và canonicalize: cùng tham số → cùng
instance. Khi parent rebuild, nếu widget con là cùng instance, framework có thể bỏ qua
rebuild subtree, giảm công việc.

```dart
const SizedBox(height: 12);
const Icon(Icons.favorite);
```

**Bẫy:** `const` chỉ áp dụng khi mọi tham số là hằng; `const` không làm state runtime bất
biến. Đừng hy sinh readability để `const` mọi thứ; ưu tiên widget lá và widget tĩnh.

---

### Q30. Vì sao `build()` phải là hàm thuần (pure)? [J]

**Trả lời:** `build()` có thể được gọi nhiều lần, bất cứ lúc nào, kể cả khi không có thay
đổi rõ ràng. Nó chỉ nên đọc state và trả về widget tree, không gây side effect.

**Không làm trong build:**

- Gọi API/DB, đọc file.
- `setState`, `Navigator.push`, hiện SnackBar/dialog.
- Tạo controller/subscription mới không dispose.
- Mutate state hoặc biến toàn cục.

**Nên làm:** tính toán rẻ, format hiển thị, đọc `Theme`/`MediaQuery`, tạo widget.

**Bẫy:** `FutureBuilder(future: api.fetch())` trong build là lỗi kinh điển; tạo future ở
`initState` hoặc state layer.

---

### Q31. Quy tắc layout "constraints đi xuống, sizes đi lên" nghĩa là gì? [J]

**Trả lời:** Parent truyền `BoxConstraints` (min/max width/height) xuống con. Con chọn
kích thước trong giới hạn đó và báo lên. Parent quyết định vị trí.

```dart
// Cha cho con tối đa chiều rộng, con chọn chiều cao
SizedBox(
  width: 200,
  child: Text('Nội dung dài', maxLines: 2, overflow: TextOverflow.ellipsis),
);
```

Hệ quả: `Column` trong `ListView` có chiều cao **unbounded** → `Expanded` lỗi; `Row` với
`Text` dài có thể overflow; `IntrinsicHeight` tốn kém vì đo hai lần.

**Điểm cộng:** dùng `LayoutBuilder` khi cần biết constraint thực tế; dùng `Flexible`,
`Expanded`, `Wrap`, `FittedBox` để xử lý.

---

### Q32. `Container`, `SizedBox`, `Padding`, `DecoratedBox` khác nhau? [J]

**Trả lời:**

| Widget | Công dụng | Ghi chú |
|---|---|---|
| `SizedBox` | Cố định/khoảng trống | Nhẹ nhất |
| `Padding` | Thêm khoảng đệm | Không vẽ nền |
| `DecoratedBox` | Vẽ decoration | Không padding/constraint |
| `Container` | Kết hợp padding, margin, decoration, alignment, constraints | Nặng hơn, tạo nhiều widget |

```dart
// Chỉ cần khoảng cách
const SizedBox(height: 12);

// Chỉ cần nền + bo góc
DecoratedBox(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
  ),
  child: const Padding(padding: EdgeInsets.all(16), child: WishCard()),
);
```

**Bẫy:** lạm dụng `Container` với `width/height` vô nghĩa hoặc `color` + `decoration` cùng
lúc (assert). Ưu tiên widget nhỏ nhất đáp ứng nhu cầu.

---

### Q33. `Expanded`, `Flexible`, `Spacer` khác nhau? [J]

**Trả lời:** Trong `Row`/`Column`/`Flex`:

- `Expanded` = `Flexible(fit: FlexFit.tight)`: ép con chiếm đúng phần được chia.
- `Flexible` mặc định `loose`: con được phép nhỏ hơn phần chia.
- `Spacer` = `Expanded(child: SizedBox.shrink())`: đẩy các phần tử ra xa.

```dart
Row(children: [
  const Icon(Icons.favorite),
  const SizedBox(width: 8),
  Expanded(child: Text('Lời chúc', overflow: TextOverflow.ellipsis)),
  const Spacer(),
  Text('$likes'),
]);
```

**Bẫy:** `Expanded` trong `Column` nằm trong `ListView`/`SingleChildScrollView` không có
chiều cao bounded sẽ lỗi. `Flexible` không đảm bảo con co lại nếu con có min width lớn.

---

### Q34. Làm sao xử lý `Row`/`Column` overflow? [J]

**Trả lời:** Xác định trục bị tràn rồi chọn cách:

1. `Expanded`/`Flexible` cho phần co giãn.
2. `Text(maxLines: 1, overflow: TextOverflow.ellipsis)`.
3. `Wrap` nếu muốn xuống dòng.
4. `SingleChildScrollView`/`ListView` nếu nội dung dài.
5. `FittedBox` cho nội dung cần scale.
6. Giảm padding/font hoặc dùng `LayoutBuilder` cho màn hình nhỏ.

```dart
Row(children: [
  const CircleAvatar(),
  const SizedBox(width: 12),
  Expanded(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(name, maxLines: 1, overflow: TextOverflow.ellipsis),
        Text(content, maxLines: 2, overflow: TextOverflow.ellipsis),
      ],
    ),
  ),
]);
```

**Bẫy:** đặt `Expanded` bên trong `Row` không có bounded width; dùng `overflow: visible`
che lỗi thay vì sửa layout; hardcode chiều cao.

---

### Q35. `mainAxisAlignment` và `crossAxisAlignment` khác nhau? [J]

**Trả lời:** Trong `Row`, main axis là ngang, cross axis là dọc; trong `Column` ngược lại.
`mainAxisAlignment` phân bố khoảng trống dọc trục chính; `crossAxisAlignment` căn theo
trục còn lại.

```dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: const [Text('A'), Text('B')],
);
```

`MainAxisSize.min` co vừa nội dung; `.max` chiếm hết. `CrossAxisAlignment.baseline` cần
`textBaseline`.

**Bẫy:** `crossAxisAlignment.stretch` trong `Row` làm con cao hết; trong `Column` làm con
rộng hết. Đôi khi nguyên nhân layout sai là do cha, không phải con.

---

### Q36. `ListView` và `SingleChildScrollView` khác nhau? [J]

**Trả lời:** `ListView` là viewport cuộn **lazy** (với `.builder`/`.separated`), chỉ build
item trong vùng nhìn thấy. `SingleChildScrollView` build toàn bộ child rồi cuộn, phù hợp
form nhỏ hoặc nội dung cố định.

```dart
// Nhiều item: lazy
ListView.builder(
  itemCount: wishes.length,
  itemBuilder: (context, i) => WishCard(wish: wishes[i]),
);

// Form nhỏ: cuộn toàn bộ
SingleChildScrollView(
  padding: const EdgeInsets.all(16),
  child: Column(children: [...formFields]),
);
```

**Bẫy:** `SingleChildScrollView` + `Column` chứa list dài gây tốn bộ nhớ. `ListView` lồng
trong `Column` cần `Expanded` hoặc `shrinkWrap` (đắt). Ưu tiên `CustomScrollView` khi
nhiều loại section.

---

### Q37. `ListView.builder`, `.separated`, và `children` khác nhau? [J]

**Trả lời:**

- `children`: build tất cả ngay, phù hợp list ngắn/cố định.
- `.builder`: lazy theo `itemCount` + `itemBuilder`.
- `.separated`: như builder + `separatorBuilder`, không tạo separator sau item cuối.

```dart
ListView.separated(
  itemCount: wishes.length,
  separatorBuilder: (_, __) => const Divider(height: 1),
  itemBuilder: (context, i) => WishCard(
    key: ValueKey(wishes[i].id),
    wish: wishes[i],
  ),
);
```

**Điểm cộng:** `itemExtent`/`prototypeItem` giúp scroll chính xác và nhanh hơn nếu item
cùng chiều cao; `cacheExtent` tăng giảm vùng build trước.

**Bẫy:** `shrinkWrap: true` trong list lồng nhau khiến toàn bộ list được layout; tránh
nếu không thật cần.

---

### Q38. `GridView` có những constructor nào và dùng khi nào? [J]

**Trả lời:** `GridView.count` (số cột), `.extent` (chiều rộng item), `.builder` (lazy),
`.custom` (SliverGridDelegate tùy chỉnh). Dùng `.builder` cho ảnh/lời chúc số lượng lớn.

```dart
GridView.builder(
  padding: const EdgeInsets.all(12),
  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    mainAxisSpacing: 12,
    crossAxisSpacing: 12,
    childAspectRatio: 3 / 4,
  ),
  itemCount: photos.length,
  itemBuilder: (context, i) => PhotoTile(photo: photos[i]),
);
```

**Bẫy:** `childAspectRatio` sai gây overflow bên trong tile; ảnh grid nên dùng
`cacheWidth` và `BoxFit.cover`; không dùng `GridView` lồng trong `ListView` mà không xử lý
constraint.

---

### Q39. `Stack` và `Positioned` hoạt động thế nào? [J]

**Trả lời:** `Stack` xếp con theo thứ tự paint (sau đè trước). `Positioned` đặt con theo
`top/right/bottom/left` (không set cả top+bottom nếu muốn co giãn thì dùng `Positioned.fill`).
`clipBehavior` kiểm soát phần tràn.

```dart
Stack(
  children: [
    Image.asset('cover.jpg', fit: BoxFit.cover),
    Positioned(
      left: 16,
      bottom: 16,
      child: Text('Minh & Lan', style: Theme.of(context).textTheme.titleLarge),
    ),
  ],
);
```

**Điểm cộng:** `IndexedStack` giữ state các tab nhưng vẫn build tất cả; `Stack` thường
dùng cho overlay/badge. `OverflowBox` cho phép con vượt constraint nhưng dễ che lỗi.

**Bẫy:** `Positioned` chỉ có tác dụng khi parent là `Stack`; hit test của phần tràn có
thể không như mong đợi.

---

### Q40. Làm responsive UI trong Flutter thế nào? [J]

**Trả lời:** Dùng constraint thực tế thay vì hardcode:

1. `LayoutBuilder` để lấy `maxWidth`.
2. Breakpoints: `< 600` mobile, `600–1024` tablet, `> 1024` desktop.
3. `MediaQuery.sizeOf(context)` (chỉ rebuild khi size đổi) thay `MediaQuery.of`.
4. `Flex`, `Wrap`, `FractionallySizedBox`, `AspectRatio`, `Expanded`.
5. `SafeArea` cho notch/status bar.
6. Test landscape, tablet, text scale.

```dart
LayoutBuilder(builder: (context, constraints) {
  final columns = constraints.maxWidth >= 900 ? 3 : 1;
  return columns == 1
      ? ListView(children: cards)
      : GridView.count(crossAxisCount: columns, children: cards);
});
```

**Bẫy:** dùng `MediaQuery.of(context).size` trong build làm rebuild khi bàn phím mở;
kiểm tra `orientation` một lần thay vì theo constraint.

---

### Q41. `SafeArea`, `MediaQuery`, `viewInsets` dùng thế nào? [J]

**Trả lời:** `SafeArea` tránh notch/status bar/home indicator. `MediaQuery` cung cấp
size, padding, viewInsets (bàn phím), textScaler, platformBrightness.

```dart
Scaffold(
  resizeToAvoidBottomInset: true,
  body: SafeArea(
    child: Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: const RsvpForm(),
    ),
  ),
);
```

**Bẫy:** dùng `MediaQuery.of` ở widget cha làm rebuild toàn subtree khi bàn phím mở; dùng
`viewInsetsOf`/`sizeOf` để giới hạn. `SafeArea` lặp nhiều lớp gây padding thừa.

---

### Q42. `Image.asset` và `Image.network` khác nhau? Cách tránh OOM? [J]

**Trả lời:** `Image.asset` đọc từ bundle, `Image.network` tải qua HTTP và dùng
`ImageCache` trong bộ nhớ. Với ảnh lớn, decode ở kích thước hiển thị bằng
`cacheWidth`/`cacheHeight`, dùng `BoxFit.cover`, `errorBuilder`, `loadingBuilder`.

```dart
Image.network(
  url,
  fit: BoxFit.cover,
  cacheWidth: 600,
  errorBuilder: (_, __, ___) => const Icon(Icons.broken_image),
  loadingBuilder: (context, child, progress) =>
      progress == null ? child : const CircularProgressIndicator(),
);
```

**Điểm cộng:** `precacheImage` cho ảnh sắp hiện; `cached_network_image` cho disk cache;
`ResizeImage` cho decode nhỏ; xóa cache khi memory pressure. Không giữ ảnh gốc 4000px
trong list thumbnail.

---

### Q43. `TextField` và `TextFormField` khác nhau? [J]

**Trả lời:** `TextField` là widget nhập liệu thuần, cần `TextEditingController` để đọc
giá trị. `TextFormField` bọc `FormField`, tích hợp validation/reset/save với `Form`.

```dart
TextFormField(
  controller: _nameController,
  textInputAction: TextInputAction.next,
  keyboardType: TextInputType.name,
  decoration: const InputDecoration(labelText: 'Tên khách'),
  validator: (v) => (v == null || v.trim().isEmpty) ? 'Nhập tên' : null,
  onFieldSubmitted: (_) => _focusNode.requestFocus(),
);
```

**Bẫy:** không `dispose` controller/focus node; dùng `initialValue` cùng `controller`
gây assert; validation chỉ chạy khi gọi `validate` hoặc autovalidate.

---

### Q44. Validate form và focus lỗi đầu tiên thế nào? [J]

**Trả lời:** Dùng `GlobalKey<FormState>`, `validator` trả `String?`, gọi `validate()`
trước khi submit. `Form` tự rebuild lỗi; có thể dùng `autovalidateMode` hợp lý.

```dart
final _formKey = GlobalKey<FormState>();

void submit() {
  if (!_formKey.currentState!.validate()) return;
  _formKey.currentState!.save();
  // gửi dữ liệu
}

Form(
  key: _formKey,
  autovalidateMode: AutovalidateMode.onUserInteraction,
  child: Column(children: [nameField, guestField]),
);
```

**Điểm cộng:** validate async (kiểm tra email tồn tại) phải làm ngoài `validator` (vì
validator sync), hiển thị trạng thái riêng. Focus lỗi đầu tiên cần `FocusNode` hoặc
package hỗ trợ; đảm bảo accessibility đọc lỗi.

---

### Q45. Quản lý focus và bàn phím trong form? [J]

**Trả lời:** Dùng `FocusNode`, `FocusScope`, `autofocus`, `textInputAction`,
`onFieldSubmitted`; gọi `FocusScope.of(context).unfocus()` khi tap ngoài hoặc submit.

```dart
GestureDetector(
  onTap: () => FocusScope.of(context).unfocus(),
  child: Form(...),
);
```

**Bẫy:** tạo `FocusNode` trong `build` gây mất focus mỗi rebuild; không dispose; dùng
`TextInputAction.done` nhưng không ẩn bàn phím. Với form dài, cân nhắc `Scrollable` và
`ensureVisible`.

---

### Q46. `Navigator.push`/`pop` hoạt động thế nào? [J]

**Trả lời:** Navigator quản lý stack route. `push` thêm route, `pop` gỡ route hiện tại và
trả kết quả cho route bên dưới.

```dart
final result = await Navigator.of(context).push<bool>(
  MaterialPageRoute(builder: (_) => const ConfirmRsvpPage()),
);
if (result == true) { /* cập nhật */ }

Navigator.of(context).pop(true);
```

**Điểm cộng:** `maybePop` tôn trọng `PopScope`; `pushReplacement` thay route;
`pushAndRemoveUntil` xóa stack (login → home); `popUntil` quay về route cụ thể.

**Bẫy:** dùng context sau `await push` mà không kiểm tra `mounted`; push trùng route do
double tap; `Navigator` lấy sai nested navigator.

---

### Q47. Navigator 1.0 và Router 2.0 khác nhau? [J]

**Trả lời:** Navigator 1.0 là **imperative**: gọi `push/pop` trực tiếp, phù hợp app nhỏ.
Router 2.0 là **declarative**: URL/route information đi vào `RouterDelegate`,
`RouteInformationParser` tạo stack; phù hợp deep link, web URL, state restoration.

Thực tế thường dùng `go_router` để có API khai báo mà không tự viết RouterDelegate.

**Điểm cộng:** Router 2.0 cho phép back/forward trên web và deep link nhất quán; nhưng
phức tạp hơn, cần quản lý state route cẩn thận.

---

### Q48. Truyền dữ liệu giữa các route bằng cách nào? [J]

**Trả lời:** Ưu tiên constructor có kiểu rõ ràng. Với named route, dùng
`settings.arguments` và cast/validate; với `go_router`, dùng path/query param hoặc `extra`.

```dart
class WishDetailPage extends StatelessWidget {
  const WishDetailPage({super.key, required this.wishId});
  final String wishId;
}

Navigator.push(context, MaterialPageRoute(
  builder: (_) => WishDetailPage(wishId: wish.id),
));
```

**Bẫy:** truyền object lớn qua `arguments` làm khó deep link/restore; dùng global
singleton để "truyền" dữ liệu gây coupling; không validate argument từ deep link.

---

### Q49. `Scaffold`, `AppBar`, `SnackBar` và bottom navigation? [J]

**Trả lời:** `Scaffold` cung cấp khung Material: app bar, body, FAB, drawer, bottom
navigation, snackbar. `ScaffoldMessenger` hiển thị SnackBar và tồn tại qua route.

```dart
Scaffold(
  appBar: AppBar(title: const Text('Sổ lưu bút')),
  body: const GuestbookBody(),
  floatingActionButton: FloatingActionButton(
    onPressed: _openForm,
    child: const Icon(Icons.add),
  ),
  bottomNavigationBar: NavigationBar(
    selectedIndex: _index,
    onDestinationSelected: (i) => setState(() => _index = i),
    destinations: const [
      NavigationDestination(icon: Icon(Icons.home), label: 'Trang'),
      NavigationDestination(icon: Icon(Icons.favorite), label: 'Lời chúc'),
    ],
  ),
);
```

**Điểm cộng:** Material 3 dùng `NavigationBar` thay `BottomNavigationBar`; `IndexedStack`
giữ state tab; SnackBar nên có action và không chặn thao tác.

**Bẫy:** gọi `ScaffoldMessenger.of(context)` sau khi route bị pop; hiện SnackBar trong
`build`; dùng `Scaffold` lồng nhau không cần thiết.

---

### Q50. Theme trong Flutter hoạt động thế nào? [J]

**Trả lời:** `MaterialApp` nhận `theme`, `darkTheme`, `themeMode`. Widget đọc qua
`Theme.of(context)`; Material 3 dùng `ColorScheme` sinh từ seed.

```dart
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF7A5C3E)),
    textTheme: GoogleFonts.beVietnamProTextTheme(),
  ),
  darkTheme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF7A5C3E),
      brightness: Brightness.dark,
    ),
  ),
  themeMode: ThemeMode.system,
);
```

**Bẫy:** hardcode `Colors.black/white` làm dark mode hỏng; dùng `ThemeExtension` cho token
riêng; `Theme.of` ở widget cha làm rebuild rộng khi theme đổi (chấp nhận được vì hiếm).

---

### Q51. `InheritedWidget` là gì? Vì sao cần state management? [J]

**Trả lời:** `InheritedWidget` truyền dữ liệu xuống subtree; widget gọi
`dependOnInheritedWidgetOfExactType` sẽ rebuild khi `updateShouldNotify` trả true. Đây là
nền tảng của `Theme`, `MediaQuery`, Provider.

```dart
class WishScope extends InheritedWidget {
  const WishScope({required this.wish, required super.child, super.key});
  final Wish wish;

  static Wish of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WishScope>()!.wish;

  @override
  bool updateShouldNotify(WishScope old) => old.wish != wish;
}
```

State management (Provider/Riverpod/Bloc) giải quyết: tách business logic khỏi UI, chia sẻ
state, test, lifecycle, async state, tránh prop drilling.

**Bẫy:** lạm dụng InheritedWidget cho mọi thứ → rebuild rộng; tự viết state management
phức tạp khi app nhỏ.

---

### Q52. `setState` vs `ValueNotifier`/`ChangeNotifier`? [J]

**Trả lời:** `setState` phù hợp state cục bộ trong một widget. `ValueNotifier<T>` +
`ValueListenableBuilder` cập nhật cục bộ theo một giá trị. `ChangeNotifier` +
`ListenableBuilder`/`AnimatedBuilder` phù hợp model có nhiều field và nhiều listener.

```dart
final counter = ValueNotifier<int>(0);

ValueListenableBuilder<int>(
  valueListenable: counter,
  builder: (context, value, _) => Text('$value'),
);

// nhớ dispose
counter.dispose();
```

**Điểm cộng:** `InheritedNotifier` kết hợp cả hai; `ListenableBuilder` thay
`AnimatedBuilder` khi không cần animation. Chỉ rebuild phần cần thiết thay vì cả screen.

---

### Q53. Những lỗi thường gặp với `FutureBuilder`? [J]

**Trả lời:** (1) tạo future trong `build`; (2) quên xử lý `waiting/error/empty`;
(3) tưởng `FutureBuilder` tự retry; (4) dùng `initialData` rồi hiển thị dữ liệu cũ như
mới; (5) gọi side effect trong builder.

```dart
late final Future<List<Wish>> _future;

@override
void initState() {
  super.initState();
  _future = repository.load();
}

void retry() => setState(() => _future = repository.load());
```

**Điểm cộng:** khi cần refresh theo tham số, dùng `FutureBuilder` với key/future mới hoặc
state management; với dữ liệu realtime, dùng `StreamBuilder`.

---

## 3. Layout và UI

### Q54. `Wrap` khác `Row`/`Column` thế nào? [J]

**Trả lời:** `Wrap` tự xuống dòng khi hết chỗ, phù hợp tag/chip/filter. `Row`/`Column`
không xuống dòng và có thể overflow. `Wrap` có `spacing` (main axis), `runSpacing`
(cross axis), `alignment`.

```dart
Wrap(
  spacing: 8,
  runSpacing: 8,
  children: tags.map((t) => Chip(label: Text(t))).toList(),
);
```

**Bẫy:** `Wrap` trong `Row` vẫn cần width bounded; item quá rộng vẫn tràn; `Wrap` build
tất cả con nên không phù hợp list rất dài.

---

### Q55. `AspectRatio`, `FractionallySizedBox`, `LayoutBuilder` dùng khi nào? [J]

**Trả lời:**

- `AspectRatio`: giữ tỉ lệ width/height (ảnh, video, card).
- `FractionallySizedBox`: kích thước theo % parent.
- `LayoutBuilder`: lấy constraint thực tế để quyết định layout.

```dart
AspectRatio(
  aspectRatio: 16 / 9,
  child: Image.network(url, fit: BoxFit.cover),
);

FractionallySizedBox(
  widthFactor: 0.8,
  child: ElevatedButton(onPressed: submit, child: const Text('Gửi')),
);
```

**Bẫy:** `AspectRatio` trong constraint unbounded có thể lỗi; `FractionallySizedBox` cần
parent có kích thước xác định; `LayoutBuilder` không nên chứa logic nặng.

---

### Q56. `CustomScrollView` và sliver là gì? [J]

**Trả lời:** `CustomScrollView` ghép nhiều **sliver** thành một vùng cuộn thống nhất:
`SliverAppBar`, `SliverList`, `SliverGrid`, `SliverToBoxAdapter`, `SliverFillRemaining`.
Mỗi sliver nhận `SliverConstraints` và đóng góp phần tử cuộn.

```dart
CustomScrollView(
  slivers: [
    const SliverAppBar(pinned: true, title: Text('Sổ lưu bút')),
    SliverPadding(
      padding: const EdgeInsets.all(12),
      sliver: SliverList.builder(
        itemCount: wishes.length,
        itemBuilder: (context, i) => WishCard(wish: wishes[i]),
      ),
    ),
  ],
);
```

**Điểm cộng:** sliver tránh lồng list, cho app bar co giãn, sticky header. Không dùng
`shrinkWrap` nếu có thể chuyển sang sliver.

---

### Q57. `SafeArea` có làm hỏng layout toàn màn hình (ảnh, video) không? [J]

**Trả lời:** Có thể. Với ảnh/video tràn viền, thường bỏ `SafeArea` ở ngoài và chỉ áp dụng
cho control/nội dung cần tránh notch. Dùng `MediaQuery.paddingOf(context)` để tính padding
riêng, hoặc `SliverAppBar` với `systemOverlayStyle`.

```dart
Stack(children: [
  Positioned.fill(child: Image.asset('cover.jpg', fit: BoxFit.cover)),
  SafeArea(child: Align(alignment: Alignment.topLeft, child: BackButton())),
]);
```

**Bẫy:** bọc toàn bộ `Scaffold` trong `SafeArea` làm mất edge-to-edge; xử lý status bar
sáng/tối không đúng trên Android.

---

### Q58. `Hero` animation hoạt động thế nào? [J]

**Trả lời:** Hai widget ở hai route có cùng `Hero.tag` sẽ được animate khi chuyển route.
`tag` phải duy nhất trong mỗi subtree tại một thời điểm.

```dart
Hero(
  tag: 'wish-${wish.id}',
  child: Image.network(wish.photoUrl),
);
```

**Bẫy:** trùng tag gây exception; dùng object không ổn định làm tag; Hero bọc widget có
state riêng có thể mất state; ảnh khác kích thước gây nhảy. Với list, tag phải duy nhất
theo item.

---

### Q59. Animation implicit và explicit khác nhau? [J]

**Trả lời:** Implicit (`AnimatedContainer`, `AnimatedOpacity`, `AnimatedSwitcher`) tự
animate khi property đổi, không cần controller. Explicit (`AnimationController` + `Tween`
+ `AnimatedBuilder`) kiểm soát thời gian, curve, repeat, reverse, status.

```dart
class _PulseState extends State<Pulse> with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
        opacity: Tween(begin: 0.4, end: 1.0).animate(_controller),
        child: const Icon(Icons.favorite),
      );
}
```

**Bẫy:** quên dispose controller; dùng `vsync` sai mixin; animate trong build; không tôn
trọng `MediaQuery.disableAnimationsOf(context)`.

---

## 4. Navigation, form, theme

### Q60. `MaterialPageRoute` và `CupertinoPageRoute` khác nhau? [J]

**Trả lời:** `MaterialPageRoute` dùng transition/gesture theo Material; `CupertinoPageRoute`
dùng transition trượt ngang và back gesture kiểu iOS. Có thể dùng `PageTransitionsTheme`
để áp transition theo platform.

```dart
MaterialApp(
  theme: ThemeData(
    pageTransitionsTheme: const PageTransitionsTheme(builders: {
      TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      TargetPlatform.android: FadeForwardsPageTransitionsBuilder(),
    }),
  ),
);
```

**Bẫy:** trộn route không nhất quán; tự làm transition gây lệch back gesture; kiểm tra
`PopScope` khi chặn back.

---

### Q61. `PopScope` dùng để làm gì? [J]

**Trả lời:** `PopScope` chặn hoặc quan sát back navigation (Android back, gesture, web).
`canPop: false` chặn pop; `onPopInvokedWithResult` xử lý (ví dụ xác nhận rời form).

```dart
PopScope(
  canPop: !_hasUnsavedChanges,
  onPopInvokedWithResult: (didPop, result) async {
    if (didPop) return;
    final leave = await showDialog<bool>(...);
    if (leave == true && context.mounted) Navigator.of(context).pop();
  },
  child: const FormScreen(),
);
```

**Bẫy:** dùng API cũ `WillPopScope` (deprecated); quên xử lý `didPop`; block back mà không
có đường thoát gây kẹt màn hình.

---

### Q62. `Navigator.of(context)` và `Navigator.of(context, rootNavigator: true)` khác gì? [J]

**Trả lời:** Mặc định lấy Navigator gần nhất trong cây (có thể là nested Navigator).
`rootNavigator: true` lấy Navigator gốc của `MaterialApp`, hữu ích khi muốn đóng dialog/
full-screen route từ nested navigator.

```dart
Navigator.of(context, rootNavigator: true).pop();
```

**Bẫy:** nested navigator + bottom navigation dễ pop nhầm; với `go_router`, dùng
`context.pop()`/`context.go()` đúng API; dialog nên đóng bằng root nếu mở bằng root.

---

### Q63. `ScaffoldMessenger` khác `Scaffold` thế nào? [J]

**Trả lời:** `ScaffoldMessenger` quản lý SnackBar/Banner ở cấp app/nhánh, giữ hiển thị
khi chuyển route. `Scaffold.of(context)` chỉ lấy Scaffold gần nhất và dùng cho FAB/drawer.

```dart
ScaffoldMessenger.of(context)
  ..hideCurrentSnackBar()
  ..showSnackBar(
    SnackBar(
      content: const Text('Đã gửi lời chúc'),
      action: SnackBarAction(label: 'Hoàn tác', onPressed: undo),
    ),
  );
```

**Bẫy:** gọi `ScaffoldMessenger.of` trong `initState` khi chưa có ancestor; dùng
`Scaffold.of` để hiện SnackBar (sai API hiện đại); hiện nhiều SnackBar chồng nhau.

---

### Q64. `TextEditingController` cần lưu ý gì? [J]

**Trả lời:** Controller giữ text/selection, phải `dispose()`. Không tạo trong `build`.
Có thể listen để debounce/format; cẩn thận cập nhật text gây loop.

```dart
late final _controller = TextEditingController(text: widget.initialText);

@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

**Bẫy:** dùng controller sau dispose; set `text` trong listener làm mất cursor; quên
`selection` khi format; rò rỉ khi tạo mới mỗi build.

---

### Q65. Làm sao hiển thị ảnh asset và cấu hình font? [J]

**Trả lời:** Khai báo trong `pubspec.yaml`, chạy `flutter pub get`, dùng
`Image.asset`/`AssetImage`; font khai báo family + weight và dùng `TextStyle(fontFamily:)`
hoặc `ThemeData.textTheme`.

```yaml
flutter:
  assets:
    - assets/images/
  fonts:
    - family: BeVietnamPro
      fonts:
        - asset: assets/fonts/BeVietnamPro-Regular.ttf
        - asset: assets/fonts/BeVietnamPro-Bold.ttf
          weight: 700
```

**Bẫy:** thiếu `pubspec` asset gây `Unable to load asset`; tên file/folder phân biệt hoa
thường; font chưa khai báo weight sẽ bị synthesize; ảnh quá lớn làm app nặng.

---

### Q66. Các lỗi debug phổ biến và cách xử lý? [J]

**Trả lời:**

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `RenderFlex overflowed` | Row/Column tràn | `Expanded`, `Flexible`, `Wrap`, scroll |
| `setState() called after dispose` | Async xong sau khi widget hủy | Kiểm tra `mounted` |
| `Null check operator used on a null value` | Dùng `!` sai | Xử lý nullable, validate |
| `LateInitializationError` | Đọc `late` trước khi gán | Khởi tạo đúng lifecycle |
| `Incorrect use of ParentDataWidget` | Expanded/Positioned sai parent | Đặt đúng Flex/Stack |
| `Bottom overflowed by keyboard` | Không xử lý viewInsets | `resizeToAvoidBottomInset`, scroll |
| `Unable to load asset` | Sai pubspec/đường dẫn | Khai báo lại, pub get |
| `No Material widget found` | Thiếu MaterialApp/Scaffold | Thêm Material ancestor |

**Điểm cộng:** đọc stack trace từ dòng đầu tiên **trong code mình**, dùng Flutter
Inspector/DevTools, tái hiện tối thiểu, kiểm tra `flutter analyze` trước khi debug runtime.

---

## 5. Async, network, storage

### Q67. Chọn `http` hay `dio`? [J]

**Trả lời:** `http` nhẹ, đủ cho app nhỏ, API đơn giản. `dio` có interceptor, cancellation,
timeout, retry, form-data, progress, adapter — phù hợp app cần auth refresh, logging,
upload ảnh.

```dart
final response = await http.get(
  Uri.parse('$baseUrl/api/messages'),
  headers: {'Accept': 'application/json'},
).timeout(const Duration(seconds: 10));

if (response.statusCode != 200) {
  throw ApiFailure.status(response.statusCode);
}
final json = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
```

**Bẫy:** decode `response.body` thay vì `bodyBytes` với tiếng Việt; không đóng client;
hardcode base URL; không xử lý status != 2xx.

---

### Q68. Xử lý lỗi network và retry thế nào? [J]

**Trả lời:** Phân loại lỗi: timeout, mất mạng (`SocketException`), HTTP 4xx/5xx, parse
(`FormatException`), auth. Chỉ retry lỗi tạm thời và request idempotent; exponential
backoff + jitter; giới hạn số lần; hủy khi user rời màn hình.

```dart
Future<T> withRetry<T>(Future<T> Function() task, {int max = 3}) async {
  var attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (e) {
      attempt++;
      if (attempt >= max || !isRetryable(e)) rethrow;
      await Future<void>.delayed(
        Duration(milliseconds: 300 * (1 << attempt)),
      );
    }
  }
}
```

**Bẫy:** retry POST thanh toán/gửi lời chúc mà không có idempotency key gây trùng dữ liệu;
retry mọi 4xx; retry storm khi server down.

---

### Q69. Gọi API và parse JSON an toàn? [J]

**Trả lời:** Dùng `utf8.decode(bodyBytes)`, kiểm tra status, parse có kiểm tra kiểu, xử lý
field thiếu/null, không dùng `as` mù quáng.

```dart
List<Wish> parseWishes(String body) {
  final decoded = jsonDecode(body);
  if (decoded is! Map<String, dynamic>) throw const FormatException('Root');
  final data = decoded['data'];
  if (data is! List) throw const FormatException('data');
  return data
      .whereType<Map<String, dynamic>>()
      .map(Wish.fromJson)
      .toList(growable: false);
}
```

**Điểm cộng:** model `fromJson` nên defensive; log payload lỗi (không log PII); dùng
codegen (`json_serializable`/`freezed`) khi schema lớn; version API để tránh breaking.

---

### Q70. WebSocket trong Flutter: kết nối, reconnect, dispose? [J]

**Trả lời:** Dùng `web_socket_channel`; lắng nghe stream, gửi qua `sink`, đóng khi dispose.
Reconnect với backoff, heartbeat, và lắng nghe app lifecycle để đóng/mở lại.

```dart
class WishSocket {
  WebSocketChannel? _channel;
  StreamSubscription? _sub;
  Timer? _retry;

  void connect() {
    _channel = WebSocketChannel.connect(Uri.parse('$wsUrl/ws'));
    _sub = _channel!.stream.listen(
      _onMessage,
      onError: (_) => _scheduleReconnect(),
      onDone: _scheduleReconnect,
    );
  }

  void _scheduleReconnect() {
    _retry?.cancel();
    _retry = Timer(const Duration(seconds: 3), connect);
  }

  void dispose() {
    _retry?.cancel();
    _sub?.cancel();
    _channel?.sink.close();
  }
}
```

**Bẫy:** reconnect ngay lập tức gây loop; không kiểm tra token khi reconnect; không dedupe
event sau khi mất kết nối; đóng channel nhưng quên subscription.

---

### Q71. Chọn local storage nào? [J]

**Trả lời:**

| Nhu cầu | Lựa chọn |
|---|---|
| Key-value nhỏ, không nhạy cảm | `shared_preferences` |
| Token/password | `flutter_secure_storage` (Keychain/Keystore) |
| Dữ liệu quan hệ, query phức tạp | `sqflite`/`drift` |
| Object/NoSQL, cache | `Hive`/`Isar`/`objectbox` |
| File lớn (ảnh, PDF) | File system + path_provider |

**Bẫy:** lưu token trong SharedPreferences; lưu ảnh base64 trong DB; không có migration
schema; không mã hóa dữ liệu nhạy cảm; tin rằng local storage là bảo mật tuyệt đối.

---

### Q72. `shared_preferences` có phải nơi lưu token? [J]

**Trả lời:** Không. SharedPreferences lưu plain text (Android XML/DataStore, iOS
NSUserDefaults), dễ đọc trên thiết bị root/jailbreak hoặc backup. Token phải dùng
`flutter_secure_storage`, ưu tiên access token ngắn hạn + refresh token an toàn; cân nhắc
sinh trắc học cho thao tác nhạy cảm.

**Điểm cộng:** không có storage nào tuyệt đối an toàn trên client; giảm thiệt hại bằng
token ngắn hạn, rotation, revoke, certificate pinning, không log token.

---

### Q73. `Future.delayed` và `Timer` khác nhau? [J]

**Trả lời:** `Future.delayed` trả future hoàn thành sau thời gian; dùng với `await`.
`Timer` chạy callback, có `Timer.periodic`, hủy bằng `cancel()`. Trong widget, hủy timer
trong `dispose`; trong test, dùng `fake_async`/`tester.pump(duration)` thay vì chờ thật.

```dart
final timer = Timer(const Duration(seconds: 2), () => print('later'));
timer.cancel();
```

**Bẫy:** dùng delay để "fix" race condition; timer chạy sau dispose; delay trong test làm
test chậm/flaky.

---

### Q74. `compute` và `Isolate.run` khác nhau? [J]

**Trả lời:** `compute` là API tiện dụng của Flutter, nhận top-level/static function và một
message, trả future; `Isolate.run` là API Dart 2.19+ nhận closure, linh hoạt hơn.
Cả hai tạo isolate mới, không chia sẻ state.

```dart
final parsed = await compute(parseWishesIsolate, rawJson);
final hash = await Isolate.run(() => sha256.convert(bytes).toString());
```

**Bẫy:** function gửi vào `compute` phải top-level/static; không capture object không
sendable; chi phí spawn isolate đáng kể với tác vụ rất nhỏ.

---

### Q75. `StreamBuilder` xử lý dữ liệu realtime thế nào? [J]

**Trả lời:** `StreamBuilder` subscribe stream, rebuild theo snapshot; khi widget dispose,
subscription được hủy. Nên tạo stream một lần (trong `initState`/provider), không tạo
trong build.

```dart
StreamBuilder<WishEvent>(
  stream: repository.events,
  builder: (context, snapshot) {
    if (!snapshot.hasData) return const Loading();
    return EventBanner(event: snapshot.data!);
  },
);
```

**Bẫy:** broadcast stream không replay event cho widget mới; stream lỗi làm UI kẹt nếu
không xử lý `hasError`; reconnect tạo stream mới cần key/refresh đúng.

---

## 6. Testing, debug, build

### Q76. Unit test, widget test, integration test khác nhau? [J]

**Trả lời:**

| Loại | Phạm vi | Công cụ | Tốc độ |
|---|---|---|---|
| Unit | Hàm/class/logic | `test` | Rất nhanh |
| Widget | Một widget subtree | `flutter_test` | Nhanh |
| Integration | App + platform/API thật | `integration_test` | Chậm |

```dart
test('format tên hiển thị', () {
  expect(formatName('  Minh  '), 'Minh');
});

testWidgets('hiện lỗi khi rỗng', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: RsvpForm()));
  await tester.tap(find.text('Gửi'));
  await tester.pump();
  expect(find.text('Nhập tên'), findsOneWidget);
});
```

**Điểm cộng:** test pyramid: nhiều unit, vừa widget, ít integration; test behavior thay vì
implementation; widget test dùng `pump` đúng số frame.

---

### Q77. `pump` và `pumpAndSettle` khác nhau? [J]

**Trả lời:** `pump()` chạy một frame (có thể kèm duration); `pumpAndSettle()` lặp pump cho
đến khi không còn frame scheduled (animation hoàn tất), có timeout. Với animation vô hạn
(loading xoay), `pumpAndSettle` treo/timeout.

```dart
await tester.pump();                       // frame đầu
await tester.tap(find.text('Gửi'));
await tester.pump(const Duration(seconds: 1)); // animation 1s
```

**Bẫy:** dùng `pumpAndSettle` với `CircularProgressIndicator` vô hạn; quên `await`; test
network thật trong widget test.

---

### Q78. Test widget có async/network bằng cách nào? [J]

**Trả lời:** Inject fake repository/API qua constructor hoặc provider override; dùng
`Completer`/`StreamController` để kiểm soát thời điểm; không gọi mạng thật. Nếu cần HTTP
giả, dùng `MockClient` của package `http` hoặc `DioAdapter`.

```dart
testWidgets('loading rồi data', (tester) async {
  final completer = Completer<List<Wish>>();
  await tester.pumpWidget(MaterialApp(
    home: WishList(load: () => completer.future),
  ));
  expect(find.byType(CircularProgressIndicator), findsOneWidget);

  completer.complete([Wish.seed()]);
  await tester.pump();
  expect(find.text('Seed'), findsOneWidget);
});
```

**Điểm cộng:** test cả error/empty/retry; dùng `fake_async` cho timer; tránh `sleep`.

---

### Q79. Golden test là gì? Khi nào dùng? [J]

**Trả lời:** Golden test render widget thành ảnh và so sánh với ảnh chuẩn (golden). Dùng
cho design system, component ổn định, regression visual. Cập nhật bằng
`flutter test --update-goldens`; cần môi trường/font ổn định.

```dart
await expectLater(
  find.byType(WishCard),
  matchesGoldenFile('goldens/wish_card.png'),
);
```

**Bẫy:** golden khác nhau giữa OS/font/engine; quá nhiều golden gây maintenance; không
kiểm tra logic thay bằng golden. Dùng `--update-goldens` có review diff.

---

### Q80. Làm sao debug UI và performance? [J]

**Trả lời:** Dùng Flutter DevTools: Widget Inspector (tree, constraints, rebuild), Performance
(timeline, frame chart), Memory, Network, Logging. `flutter run --profile` để đo thật;
`debugPaintSizeEnabled`, `debugRepaintRainbowEnabled`; breakpoint trong IDE.

**Điểm cộng:** xác định UI thread vs raster thread; dùng `RepaintBoundary`; kiểm tra
rebuild bằng `debugPrintRebuildDirtyWidgets`; không đo performance ở debug mode.

---

### Q81. Debug mode, profile mode, release mode khác nhau? [J]

**Trả lời:**

| Mode | Dart | Đặc điểm |
|---|---|---|
| Debug | JIT | Assertions, hot reload, chậm, dùng để phát triển |
| Profile | AOT | Gần release, có tracing/observability, dùng để đo |
| Release | AOT | Tối ưu, tree shaking, không assertion, build store |

`kDebugMode`, `kProfileMode`, `kReleaseMode` để phân nhánh. Không dùng debug mode để đánh
giá performance; không để log/secret trong release.

---

### Q82. Hot reload khác hot restart? [J]

**Trả lời:** Hot reload inject code mới, rebuild widget, **giữ state**; không chạy lại
`main()`, không áp dụng thay đổi native, thêm field vào class, thay đổi kiểu/const. Hot
restart chạy lại app từ đầu, reset state.

**Bẫy:** tưởng hot reload áp dụng mọi thay đổi; state cũ không tương thích code mới gây
hành vi lạ; luôn hot restart khi nghi ngờ.

---

### Q83. `flutter analyze`, format và lint dùng thế nào? [J]

**Trả lời:** `dart format .`, `flutter analyze`, `dart fix --apply`; cấu hình
`analysis_options.yaml` kế thừa `flutter_lints`, bật rule phù hợp. CI nên chạy format
check + analyze + test, coi warning là lỗi.

```yaml
include: package:flutter_lints/flutter.yaml
analyzer:
  errors:
    invalid_annotation_target: ignore
linter:
  rules:
    avoid_print: true
    prefer_const_constructors: true
    use_super_parameters: true
```

**Bẫy:** suppress lint diện rộng; commit code format lệch; bật quá nhiều rule gây noise
mà không sửa.

---

### Q84. `pubspec.yaml` quản lý dependency thế nào? [J]

**Trả lời:** `dependencies` cho runtime, `dev_dependencies` cho test/lint/codegen; khai báo
asset/font trong `flutter:`. Dùng version constraint (`^1.2.0`), commit lockfile cho app,
chạy `flutter pub get`/`pub upgrade`.

**Bẫy:** dùng `any` cho dependency; thêm package không kiểm tra license/maintenance;
nâng major không đọc changelog; commit `pubspec.lock` cho library (thường không) nhưng nên
commit cho app.

---

### Q85. `const` constructor và immutable widget khác gì? [J]

**Trả lời:** Widget nên có field `final`, constructor `const` nếu có thể. Điều này cho phép
canonicalization và an toàn khi rebuild. Tuy nhiên `const` không bắt buộc để widget bất
biến — widget vẫn có thể có field `final` mà không `const` nếu giá trị runtime.

**Bẫy:** đặt mutable field trong widget; thay đổi field trực tiếp; dùng `const` với value
runtime gây compile error.

---

### Q86. `mounted` dùng khi nào? [J]

**Trả lời:** `State.mounted` cho biết State còn gắn với Element. Sau mỗi `await`, trước khi
gọi `setState`, dùng `context`, Navigator hay ScaffoldMessenger, kiểm tra `mounted` (hoặc
`context.mounted` trong callback không có State).

```dart
await api.send(draft);
if (!mounted) return;
setState(() => sent = true);
```

**Bẫy:** kiểm tra trước `await` là vô nghĩa; bỏ qua kiểm tra gây exception; dùng
`mounted` của widget khác.

---

### Q87. `debugPrint` khác `print`? [J]

**Trả lời:** `debugPrint` throttle output để tránh mất log trên Android, có thể override
`debugPrint` để gửi logger; `print` có thể bị OS cắt khi log dày. Trong production, dùng
logger có level/redaction, không dùng `print`.

**Bẫy:** log token/PII; log trong hot path gây chậm; quên tắt verbose log ở release.

---

### Q88. Build app release cho Android/iOS gồm những bước nào? [J]

**Trả lời:** Android: cấu hình signing, `flutter build appbundle --release` (hoặc
`apk --split-per-abi`), kiểm tra `applicationId`, versionCode. iOS: cấu hình signing/team,
`flutter build ipa --release`, archive/TestFlight. Trước đó chạy test, analyze, build
profile, kiểm tra asset/API URL.

```bash
flutter test
flutter analyze
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.example.com
flutter build ipa --release
```

**Bẫy:** build với URL dev; quên tăng build number; signing debug; không lưu symbol cho
Crashlytics; không test bản release thật.

---

### Q89. Khi nào dùng `ListView` lồng trong `Column`? [J]

**Trả lời:** Chỉ khi list có chiều cao xác định (`SizedBox`/`Expanded`) hoặc dùng
`shrinkWrap: true` (đắt) hoặc chuyển sang `CustomScrollView` với sliver. Tốt nhất tránh
lồng scroll cùng hướng.

**Bẫy:** `Column` + `ListView` không có height → lỗi unbounded; `shrinkWrap` + list dài
gây jank; nested scroll tranh gesture.

---

### Q90. Làm sao xử lý bàn phím che TextField? [J]

**Trả lời:** `Scaffold.resizeToAvoidBottomInset: true` (mặc định), đặt form trong
`SingleChildScrollView`, dùng `MediaQuery.viewInsetsOf(context).bottom` cho padding, và
`Scrollable.ensureVisible`/`FocusNode` để cuộn tới field.

```dart
Padding(
  padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
  child: ...,
);
```

**Bẫy:** bọc toàn bộ bằng `SafeArea` nhưng bỏ qua viewInsets; dùng `Expanded` trong form
cuộn; ẩn bàn phím không đúng thời điểm.

---

## 7. Câu hỏi tình huống ngắn

### Q91. Người dùng báo app "giật" khi cuộn list ảnh. Bạn kiểm tra gì trước? [J]

**Trả lời:** Tái hiện ở **profile mode** trên thiết bị thật; mở DevTools Performance xem
UI thread hay raster thread. Kiểm tra: ảnh decode quá lớn (`cacheWidth`), `setState` toàn
screen, `shrinkWrap`, thiếu `const`, `Opacity`/`Clip` nặng, shader compilation. Đo frame
time trước/sau, không đoán.

**Điểm cộng:** dùng `RepaintBoundary` đúng chỗ, `itemExtent`, lazy list, cache ảnh; đặt
mục tiêu 60/120 fps và frame budget 16.7/8.3 ms.

---

### Q92. Một widget rebuild liên tục, bạn tìm nguyên nhân thế nào? [J]

**Trả lời:** Bật `debugPrintRebuildDirtyWidgets`, dùng Widget Inspector "Highlight
rebuilds"; kiểm tra `setState` trong build/stream phát liên tục, `MediaQuery.of` ở cha,
provider không `select`, `FutureBuilder` tạo future mới, animation controller. Tách widget
và dùng `const`/`select` để thu hẹp phạm vi.

---

### Q93. Vì sao State bị mất khi chuyển tab hoặc xoay màn hình? [J]

**Trả lời:** Widget bị remove khỏi tree hoặc key thay đổi khiến Element/State bị hủy. Với
tab, dùng `IndexedStack`, `AutomaticKeepAliveClientMixin` hoặc `PageStorageKey`; với list,
key ổn định; với rotation, state cục bộ vẫn giữ nếu widget không bị recreate — nếu bị,
lưu vào state management/restoration.

**Bẫy:** dùng `UniqueKey`/`ValueKey(index)` làm state reset; dựng lại widget từ đầu mỗi
lần build.

---

### Q94. Làm sao test một màn hình có WebSocket? [J]

**Trả lời:** Tách interface `WishSocket`, inject fake phát `StreamController` trong test.
Không mở socket thật trong widget test; kiểm tra trạng thái connecting/open/error/reconnect
bằng cách đẩy event và `pump`. Integration test mới dùng server thật/giả.

---

### Q95. App bị crash chỉ ở release, debug không sao. Vì sao? [J]

**Trả lời:** Khác biệt AOT/tree shaking/assertions/obfuscation/R8/signing. Kiểm tra: dùng
`dynamic`/reflection-like code bị tree shake, JSON key bị obfuscate, plugin thiếu rule
ProGuard, `assert` chứa logic, API URL/config sai, quyền bị giới hạn, font/asset không
đóng gói. Build release có symbol và đọc crash log/stack đã symbolicate.

**Bẫy:** chỉ test debug; không lưu mapping/symbol; bật minify mà không test.

---

### Q96. Người dùng mất mạng khi gửi lời chúc. Bạn thiết kế UX thế nào? [J]

**Trả lời:** Optimistic UI + lưu draft/outbox local; hiển thị trạng thái "đang gửi/đã gửi/
chờ đồng bộ/lỗi"; retry tự động có backoff và idempotency key; cho user retry/xóa; không
mất nội dung khi đóng app; phân biệt lỗi tạm thời và lỗi vĩnh viễn.

**Điểm cộng:** đồng bộ khi có mạng, tránh gửi trùng, sắp xếp event, hiển thị rõ dữ liệu
nào đã lên server.

---

### Q97. Bạn chọn state management nào cho guestbook? Vì sao? [J]

**Trả lời:** Với app nhỏ, `setState` + `ValueNotifier` đủ cho state cục bộ; state chia sẻ
và async dùng Riverpod (compile-safe, test tốt, không cần context) hoặc Bloc nếu team
quen event-driven/audit. Mình chọn theo: số màn hình, số team, yêu cầu test, đường học.
Không chọn theo trend.

**Điểm cộng:** nêu trade-off boilerplate, learning curve, debugging, codegen; thống nhất
một hướng trong team.

---

### Q98. Bạn kiểm tra accessibility của một màn hình thế nào? [J]

**Trả lời:** Bật TalkBack/VoiceOver, kiểm tra label/role/action, thứ tự focus, tap target
≥ 48dp, contrast ≥ 4.5:1, text scale 200%, không chỉ dùng màu để truyền đạt. Dùng
`Semantics`, `ExcludeSemantics`, `MergeSemantics`; test bằng `SemanticsTester` nếu cần.

**Bẫy:** label chỉ có icon; `GestureDetector` không có semantic button; text bị cắt khi
tăng font.

---

### Q99. Làm sao giảm thời gian khởi động app? [J]

**Trả lời:** Đo first frame bằng DevTools/`flutter run --trace-startup`; trì hoãn init
không cần thiết, tránh làm nặng `main()`, dùng lazy provider, giảm plugin khởi tạo sớm,
cache dữ liệu nhỏ, dùng splash/placeholder, cân nhắc isolate cho parse lớn. Không block
first frame bằng network.

**Bẫy:** gọi nhiều API tuần tự trước `runApp`; init Firebase/analytics đồng bộ; asset/font
quá lớn.

---

### Q100. Bạn review một PR Flutter, checklist chính là gì? [J]

**Trả lời:** Correctness + lifecycle (dispose, mounted), state đúng phạm vi, loading/
error/empty, key list, rebuild/performance, navigation an toàn, accessibility, i18n/theme,
test, lint, security (không log token), API contract. Đọc diff theo feature, không chỉ style.

**Điểm cộng:** yêu cầu test cho bug fix; đề xuất cải tiến nhỏ thay vì bắt viết lại; kiểm
tra behavior trên thiết bị thật nếu UI phức tạp.

---

## 8. Câu hỏi bổ sung (cập nhật)

> Phần này bổ sung các chủ đề thường gặp trong phỏng vấn 2025–2026: pattern matching,
> enhanced enum, generic variance, xử lý lỗi async, animation/scroll nâng cao, networking
> thực chiến và build release. Đánh số tiếp từ Q100 để không phá vỡ tham chiếu cũ.

**Dart 3 và ngôn ngữ**

### Q101. `switch` expression và exhaustive switch trong Dart 3 khác gì? [J]

**Trả lời:** `switch` expression trả về giá trị, viết gọn hơn switch statement; compiler
kiểm tra **exhaustive** nếu kiểu là `sealed`, enum hoặc union đã biết. Với enum, thiếu case
là lỗi compile-time; với kiểu mở phải có `_` hoặc `default`.

```dart
String label(WishStatus s) => switch (s) {
  WishStatus.pending => 'Chờ duyệt',
  WishStatus.approved => 'Đã duyệt',
  WishStatus.rejected => 'Từ chối',
};
```

**Điểm cộng:** exhaustive switch giúp thêm case mới sẽ fail compile thay vì rơi vào nhánh
mặc định âm thầm. `sealed class` + `switch` là cách mô hình hoá UI state an toàn.

---

### Q102. `if-case` và destructuring pattern dùng khi nào? [J]

**Trả lời:** Pattern cho phép kiểm tra cấu trúc và ràng buộc biến trong một bước, đặc biệt
hữu ích khi parse JSON hoặc state union.

```dart
if (json case {'id': String id, 'message': String msg, 'likes': int likes}) {
  return Wish(id: id, message: msg, likes: likes);
}

final [first, second, ...rest] = ids;
if (result case Success(:final data)) return data;
```

**Bẫy:** pattern map chỉ khớp key có mặt, không tự validate toàn bộ schema; dùng pattern
quá phức tạp làm khó đọc. Với JSON production vẫn nên có model/parse tường minh và test.

---

### Q103. Enhanced enum (enum có field/method) dùng khi nào? [J]

**Trả lời:** Từ Dart 2.17 enum có constructor `const`, field, getter và method. Phù hợp khi
mỗi giá trị có metadata cố định như label, icon, mã code — thay cho class + hằng static.

```dart
enum WishStatus {
  pending('Chờ duyệt'),
  approved('Đã duyệt'),
  rejected('Từ chối');

  const WishStatus(this.label);
  final String label;

  bool get isVisible => this == approved;
}
```

**Bẫy:** enum không kế thừa class khác; không dùng enum cho dữ liệu thay đổi runtime; khi
cần nhiều biến thể có payload, dùng `sealed class`.

---

### Q104. Generic constraints và variance trong Dart hoạt động thế nào? [J]

**Trả lời:** `class Box<T extends Object>` giới hạn `T`; `where`/`T extends Comparable<T>`
dùng cho thuật toán. Dart generic là **covariant** theo kiểu sử dụng: `List<String>` là
subtype của `List<Object>`, nhưng ghi `Object` vào list đó sẽ ném lỗi runtime.

```dart
void addAll(List<Object> target) {}
addAll(<String>[]); // compile OK, nhưng add(1) bên trong sẽ ném

T max<T extends Comparable<T>>(T a, T b) => a.compareTo(b) >= 0 ? a : b;
```

**Điểm cộng:** hiểu `covariant` ở override; tránh `List<dynamic>`; dùng `List<Object>` khi
chỉ đọc. Không có wildcard `?` như Java.

---

### Q105. `typedef` cho function type và khi nào dùng? [J]

**Trả lời:** `typedef` đặt tên cho kiểu hàm, giúp API dễ đọc và tránh lặp signature.

```dart
typedef Validator = String? Function(String? value);
typedef WishCallback = void Function(Wish wish);

final Validator required = (v) => (v == null || v.isEmpty) ? 'Bắt buộc' : null;
```

Dart 3 còn có `extension type` để bọc kiểu nguyên thuỷ với zero-cost (khác `typedef` chỉ là
alias). Dùng `typedef` cho callback/validator; không lạm dụng để che giấu signature phức tạp.

---

### Q106. Closure hoạt động thế nào? Có bẫy gì khi dùng trong vòng lặp? [J]

**Trả lời:** Closure là hàm giữ tham chiếu tới biến trong scope nơi nó được tạo; biến sống
theo closure, không theo stack. Trong Dart, biến khai báo trong thân `for` được tạo mới mỗi
vòng lặp, nên callback thường bắt đúng giá trị.

```dart
final callbacks = <VoidCallback>[];
for (var i = 0; i < 3; i++) {
  callbacks.add(() => print(i)); // 0, 1, 2
}

var j = 0;
while (j < 3) {
  final current = j;
  callbacks.add(() => print(current));
  j++;
}
```

**Bẫy:** capture biến mutable khai báo ngoài loop rồi mutate sau đó; giữ closure trỏ tới
`State`/`BuildContext` đã dispose gây leak hoặc crash.

---

### Q107. `sync*` và `async*` là gì? Khi nào dùng generator? [J]

**Trả lời:** `sync*` trả `Iterable`, `async*` trả `Stream`; dùng `yield` để phát từng phần
tử, `yield*` để nối generator khác. Generator hữu ích khi dữ liệu được tính/lazy hoặc đọc
theo trang, tránh tạo list lớn trong bộ nhớ.

```dart
Iterable<int> range(int n) sync* {
  for (var i = 0; i < n; i++) yield i;
}

Stream<String> decoded(Stream<List<int>> bytes) async* {
  yield* utf8.decoder.bind(bytes); // decoder xử lý ranh giới byte đúng cách
}
```

**Bẫy:** `async*` chỉ chạy khi có listener; lỗi phải được ném trong generator để stream
phát error; hủy subscription sẽ dừng generator tại `yield` kế tiếp.

---

### Q108. Biến đổi `Stream` thường dùng những toán tử nào? [J]

**Trả lời:** `map`, `where`, `expand`, `distinct`, `take`, `skip`, `asyncMap` (giữ thứ tự,
xử lý tuần tự) và `StreamTransformer` cho logic tái sử dụng. `asyncMap` khác `map` ở chỗ
callback trả Future và được await.

```dart
final visible = wishStream
    .where((w) => w.status == WishStatus.approved)
    .distinct((a, b) => a.id == b.id)
    .map((w) => w.copyWith(message: w.message.trim()));
```

**Điểm cộng:** debounce/search cần `Timer` + `switchMap` (RxDart) hoặc tự quản lý
subscription; `asyncMap` tuần tự nên không phù hợp cho request song song; luôn xử lý
`onError` và hủy subscription khi dispose.

---

### Q109. Xử lý lỗi async trong Dart/Flutter đúng cách? [J]

**Trả lời:** `try/catch` quanh `await` bắt lỗi của Future; `Future.catchError`/`onError`
cho pipeline; lỗi không được await (fire-and-forget) có thể thành unhandled. Trong app,
đăng ký `FlutterError.onError` cho lỗi framework, `PlatformDispatcher.instance.onError`
cho lỗi async ngoài framework, và có thể dùng `runZonedGuarded` khi khởi động.

```dart
Future<void> send() async {
  try {
    await api.send(draft);
  } on SocketException catch (e) {
    throw NetworkFailure(e.message);
  } finally {
    loading.value = false;
  }
}

PlatformDispatcher.instance.onError = (error, stack) {
  reporter.record(error, stack);
  return true;
};
```

**Bẫy:** `catch (e)` quá rộng nuốt cả lỗi lập trình; `catchError` phải trả đúng kiểu Future;
không log token/PII; đừng biến mọi lỗi thành "Đã có lỗi xảy ra" mà không có mã để hỗ trợ.

---

### Q110. Optional positional và named parameter khác nhau? [J]

**Trả lời:** Optional positional dùng `[]`, gọi theo vị trí; named dùng `{}`, gọi theo tên và
có thể `required`. Không trộn hai kiểu trong cùng một danh sách tham số.

```dart
Wish create(String message, [int likes = 0]) => ...;

Wish createNamed({
  required String message,
  int likes = 0,
  String? sender,
}) => ...;

createNamed(message: 'Chúc mừng', sender: 'An');
```

**Điểm cộng:** named + `required` tốt cho API nhiều tham số, tránh đảo thứ tự; default phải
là hằng compile-time; không dùng positional cho boolean dễ nhầm (`true, false`).

---

### Q111. Cascade `..` và spread `...` dùng thế nào? [J]

**Trả lời:** Cascade gọi nhiều method/setter trên cùng object và trả về object gốc; spread
trải phần tử collection vào collection mới, `...?` bỏ qua nếu nguồn null.

```dart
final controller = TextEditingController()
  ..text = 'Hello'
  ..selection = const TextSelection.collapsed(offset: 5);

final all = [...approved, ...pending, if (hasDraft) draft];
final copy = [...?maybeList];
```

**Bẫy:** cascade trên `null` cần `?..`; spread tạo collection mới (không phải view), có chi
phí với list lớn; đừng lạm dụng cascade cho logic nhiều bước khó debug.

---

### Q112. `const` canonicalization và collection bất biến hoạt động thế nào? [J]

**Trả lời:** Cùng một biểu thức `const` cho ra cùng instance (canonicalized); collection
`const` là bất biến, thêm/xóa sẽ ném `UnsupportedError`. `List.unmodifiable` tạo bản sao
không sửa được tại runtime; `UnmodifiableListView` chỉ là wrapper.

```dart
const a = <int>[1, 2];
const b = <int>[1, 2]; // identical(a, b) == true

final safe = List<int>.unmodifiable(source);
```

**Điểm cộng:** phân biệt `final list` (vẫn sửa phần tử) với collection `const`; dùng
`UnmodifiableListView` khi cần zero-copy và chấp nhận nguồn có thể đổi.

---

### Q113. `String` trong Dart có đặc điểm gì? Xử lý chuỗi lớn/Unicode thế nào? [J]

**Trả lời:** `String` bất biến; nối chuỗi trong vòng lặp bằng `+` tạo nhiều object, nên dùng
`StringBuffer`. `length` đếm UTF-16 code unit, không phải ký tự hiển thị; emoji/combining
mark có thể dài hơn 1. Dùng `runes` cho code point và package `characters` cho grapheme
cluster.

```dart
final buffer = StringBuffer();
for (final w in wishes) buffer.writeln(w.message);
final text = buffer.toString();

final chars = '👨‍👩‍👧'.characters.length; // 1 grapheme cluster
```

**Bẫy:** cắt chuỗi theo index có thể tách đôi emoji; `toUpperCase`/so sánh phụ thuộc locale;
interpolation gọi `toString()` nên tránh trong vòng lặp nóng.

---

### Q114. `int`, `double`, `num` có những bẫy nào? [J]

**Trả lời:** `num` là cha của `int`/`double`; `/` luôn trả `double`, `~/` chia lấy nguyên.
`double` là IEEE-754 nên `0.1 + 0.2 != 0.3`. Trên native, `int` là 64-bit có dấu; trên web
là number của JS nên giới hạn khác. Tiền tệ nên lưu `int` (cent) hoặc `Decimal`, không dùng
`double` để tính.

```dart
final avg = total / count;      // double
final pages = total ~/ pageSize; // int
final cents = (price * 100).round();
```

**Bẫy:** so sánh double bằng `==`; parse chuỗi bằng `int.parse` có thể ném, dùng `tryParse`;
tràn số trên web; chia cho 0 với double cho Infinity/NaN.

---

### Q115. `DateTime` và timezone: lưu/ hiển thị thế nào cho đúng? [J]

**Trả lời:** Lưu **UTC** trong DB/API, kèm offset hoặc ký hiệu `Z`; hiển thị theo timezone
thiết bị. `DateTime.parse` hiểu `Z`/offset; `DateTime.now()` là local; `isUtc` cho biết.
Dùng `package:timezone` khi cần timezone cụ thể (lịch, nhắc hẹn), `package:intl` cho format
theo locale.

```dart
final utc = DateTime.parse('2026-10-29T08:00:00Z');
final local = utc.toLocal();
final label = DateFormat.yMMMd('vi').format(local);
```

**Bẫy:** `Duration(days: 30)` không phải "1 tháng"; DST làm ngày có 23/25 giờ; đừng tự
cộng offset bằng tay; test với timezone khác CI.

---

**Widget, layout và tương tác**

### Q116. `AnimatedContainer`, `TweenAnimationBuilder`, `AnimatedBuilder` khác nhau? [J]

**Trả lời:** `AnimatedContainer` (implicit) tự animate khi property đổi, không cần
controller. `TweenAnimationBuilder` animate một giá trị từ `begin` tới `end` khi `tween` đổi.
`AnimatedBuilder` dùng với `AnimationController`/`Listenable` khi cần điều khiển, sequence
hoặc nhiều widget dùng chung animation.

```dart
AnimatedContainer(
  duration: const Duration(milliseconds: 250),
  width: selected ? 240 : 160,
  color: selected ? scheme.primary : scheme.surface,
);

TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: progress),
  duration: const Duration(milliseconds: 400),
  builder: (_, value, __) => LinearProgressIndicator(value: value),
);
```

**Bẫy:** implicit animation không hỗ trợ mọi property; `AnimatedBuilder` vẫn rebuild
`builder` mỗi frame nên đặt phần tĩnh vào `child`; luôn dispose controller.

---

### Q117. `PageView` và `TabBarView` khác nhau? Khi nào chọn cái nào? [J]

**Trả lời:** `PageView` vuốt theo trang, có `PageController`, phù hợp onboarding, gallery,
carousel. `TabBarView` gắn với `TabController`/`TabBar`, phù hợp nội dung theo tab và cần
đồng bộ indicator. Cả hai lazy build và có thể giữ state bằng `AutomaticKeepAliveClientMixin`.

```dart
final controller = PageController(viewportFraction: 0.9);
PageView.builder(
  controller: controller,
  itemCount: photos.length,
  itemBuilder: (_, i) => PhotoCard(photos[i]),
);
```

**Bẫy:** quên dispose `PageController`/`TabController`; `TabBarView` không có `TabBar` vẫn
chạy nhưng không có điều khiển; `PageView` lồng trong scroll dọc dễ tranh gesture.

---

### Q118. `Draggable`, `DragTarget`, `Dismissible` dùng cho tương tác nào? [J]

**Trả lời:** `Draggable` tạo widget kéo được, thả vào `DragTarget` để nhận dữ liệu — phù hợp
kanban, gán ảnh vào album. `Dismissible` để vuốt xoá/ẩn item, cần `key` ổn định và xử lý
`confirmDismiss`/`onDismissed`.

```dart
Dismissible(
  key: ValueKey(wish.id),
  direction: DismissDirection.endToStart,
  confirmDismiss: (_) => showConfirmDialog(context),
  onDismissed: (_) => controller.remove(wish.id),
  background: const ColoredBox(color: Colors.red),
  child: WishTile(wish: wish),
);
```

**Bẫy:** `onDismissed` phải remove item khỏi nguồn dữ liệu ngay, nếu không sẽ lỗi "dismissed
widget still in tree"; `Dismissible` không phù hợp để reorder (dùng
`ReorderableListView`); kiểm tra accessibility cho thao tác chỉ có gesture.

---

### Q119. `GestureDetector`, `InkWell` và `Listener` khác nhau? [J]

**Trả lời:** `GestureDetector` nhận gesture đã qua gesture arena (tap, long press, pan) nhưng
không có hiệu ứng. `InkWell`/`InkResponse` thêm ripple Material và cần ancestor `Material`.
`Listener` nhận pointer event thô (down/move/up/cancel) trước khi thành gesture, dùng cho
hover, low-level tracking hoặc custom gesture.

```dart
InkWell(
  onTap: () => openWish(wish),
  borderRadius: BorderRadius.circular(12),
  child: WishTile(wish: wish),
);
```

**Bẫy:** `InkWell` không có ripple nếu thiếu `Material`; `GestureDetector` chồng nhau gây
xung đột, cần `behavior`/`HitTestBehavior`; đừng dùng `Listener` cho button thông thường.

---

### Q120. `Overlay`, dialog, bottom sheet và SnackBar khác nhau thế nào? [J]

**Trả lời:** `Overlay` là stack cao nhất của app, chứa entry tạm (tooltip, dropdown, custom
HUD). `showDialog` mở route modal có barrier. `showModalBottomSheet` mở sheet từ đáy.
`ScaffoldMessenger` hiển thị SnackBar gắn với `Scaffold`. Chọn theo mức độ chặn tương tác và
ngữ cảnh.

```dart
final ok = await showDialog<bool>(
  context: context,
  builder: (_) => AlertDialog(
    title: const Text('Xoá lời chúc?'),
    actions: [
      TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Huỷ')),
      FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Xoá')),
    ],
  ),
);
if (ok == true) controller.remove(id);
```

**Bẫy:** dùng `context` sau `await` mà không kiểm tra `mounted`; mở dialog từ context không
có `Navigator`; SnackBar gọi sai `Scaffold.of` thay vì `ScaffoldMessenger.of`; quên đóng
overlay entry gây leak.

---

### Q121. `IntrinsicHeight`/`IntrinsicWidth` dùng khi nào và vì sao đắt? [J]

**Trả lời:** Intrinsic buộc layout đo "kích thước tự nhiên" của con trước khi layout thật,
thường cần nhiều pass nên chi phí tăng theo độ sâu cây. Dùng khi cần các card cùng chiều cao
theo nội dung, row có divider cao bằng item cao nhất.

```dart
IntrinsicHeight(
  child: Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [Expanded(child: Text(a)), const VerticalDivider(), Expanded(child: Text(b))],
  ),
)
```

**Bẫy:** lạm dụng trong list dài gây jank; có thể thay bằng `CrossAxisAlignment.stretch` với
chiều cao cố định, `Table`, hoặc thiết kế lại layout; không dùng intrinsic trong scroll
viewport lớn nếu không đo.

---

### Q122. `NestedScrollView` và `SliverAppBar` giải quyết bài toán gì? [J]

**Trả lời:** `NestedScrollView` phối hợp header cuộn ngoài với nội dung cuộn trong (thường
`TabBarView`), giữ trải nghiệm app bar co giãn. `SliverAppBar` đặt trong `CustomScrollView`,
hỗ trợ `pinned`, `floating`, `snap`, `expandedHeight`, `FlexibleSpaceBar` cho ảnh/tiêu đề.

```dart
CustomScrollView(
  slivers: [
    SliverAppBar(
      pinned: true,
      expandedHeight: 220,
      flexibleSpace: FlexibleSpaceBar(background: Image.network(cover, fit: BoxFit.cover)),
    ),
    SliverList.builder(itemCount: wishes.length, itemBuilder: ...),
  ],
);
```

**Bẫy:** lồng nhiều scrollable dọc gây giật/gesture conflict; `NestedScrollView` cần
`SliverOverlapAbsorber` khi dùng `TabBarView`; `expandedHeight` lớn + ảnh full size gây
memory/jank.

---

### Q123. `LayoutBuilder`, `MediaQuery`, `OrientationBuilder` khác nhau? [J]

**Trả lời:** `LayoutBuilder` nhận **constraint từ parent**, rebuild khi constraint đổi — tốt
cho component responsive theo vùng chứa. `MediaQuery` cho kích thước/vùng an toàn/text scale
của cửa sổ; `OrientationBuilder` chỉ quan tâm portrait/landscape. Dùng `MediaQuery.sizeOf`
thay `MediaQuery.of` để giảm rebuild.

```dart
LayoutBuilder(builder: (context, constraints) {
  final wide = constraints.maxWidth >= 720;
  return wide ? const Row(children: [...]) : const Column(children: [...]);
});
```

**Bẫy:** dùng `MediaQuery.of(context)` ở gốc làm rebuild toàn app khi bàn phím mở; breakpoint
theo chiều rộng không đủ cho tablet/foldable; test cả text scale và landscape.

---

### Q124. Quản lý ảnh network: cache, decode size, placeholder thế nào? [J]

**Trả lời:** Dùng `cacheWidth`/`cacheHeight` để decode đúng kích thước hiển thị, tránh giữ
ảnh full resolution. `precacheImage` tải trước cho màn hình sắp mở. `FadeInImage`/
`frameBuilder` cho placeholder, `errorBuilder` cho lỗi, `gaplessPlayback` tránh nháy khi đổi
URL. Có thể tinh chỉnh `PaintingBinding.instance.imageCache`.

```dart
Image.network(
  url,
  cacheWidth: (MediaQuery.sizeOf(context).width * dpr).round(),
  fit: BoxFit.cover,
  frameBuilder: (_, child, frame, sync) =>
      sync ? child : AnimatedOpacity(opacity: frame == null ? 0 : 1, duration: ..., child: child),
  errorBuilder: (_, __, ___) => const Icon(Icons.broken_image),
);
```

**Bẫy:** giữ ảnh gốc trong list thumbnail gây OOM; không có `errorBuilder` làm lỗi trắng;
cache không giới hạn; dùng URL làm key nhưng URL chứa token thay đổi liên tục.

---

### Q125. `PageStorageKey` dùng để làm gì? Khi nào không đủ? [J]

**Trả lời:** `PageStorageKey` lưu trạng thái cuộn của `ListView`/`PageView` vào
`PageStorageBucket` theo key, giúp giữ vị trí khi chuyển tab/route rồi quay lại. Key phải ổn
định và duy nhất trong bucket.

```dart
ListView.builder(
  key: const PageStorageKey('wish-list'),
  itemCount: wishes.length,
  itemBuilder: ...,
);
```

**Bẫy:** `PageStorageKey` không khôi phục form/state sau khi app bị kill — dùng
`RestorationMixin` hoặc lưu draft; key trùng gây lẫn state; không thay thế `AutomaticKeepAlive`
khi cần giữ widget sống.

---

### Q126. `ScrollController` và `NotificationListener<ScrollNotification>` khác nhau? [J]

**Trả lời:** `ScrollController` cho phép đọc/điều khiển scroll (`offset`, `jumpTo`,
`animateTo`) và lắng nghe; phải dispose. `NotificationListener` bắt notification từ descendant
mà không cần giữ controller, phù hợp khi muốn quan sát mà không sở hữu scrollable.

```dart
_scroll.addListener(() {
  if (_scroll.position.pixels >= _scroll.position.maxScrollExtent - 200) loadMore();
});

NotificationListener<ScrollNotification>(
  onNotification: (n) {
    if (n.metrics.pixels >= n.metrics.maxScrollExtent - 200) loadMore();
    return false;
  },
  child: ListView.builder(...),
);
```

**Bẫy:** tạo controller trong `build`; dùng `jumpTo` khi chưa `hasClients`; gọi `loadMore`
nhiều lần do không debounce/guard; notification từ nested scroll có thể bị bubble.

---

### Q127. `WidgetsBindingObserver` dùng để làm gì? [J]

**Trả lời:** Lắng nghe vòng đời app (`resumed`, `inactive`, `paused`, `detached`, `hidden`)
và các thay đổi như metrics (bàn phím, kích thước), memory pressure. Dùng để pause video,
lưu draft, refresh token, huỷ timer hoặc tải lại dữ liệu khi quay lại app.

```dart
class _HomeState extends State<Home> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) controller.saveDraft();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
```

**Bẫy:** không remove observer gây leak; làm việc nặng trong `paused` vì OS có thể kill;
giả định `paused` luôn được gọi trên mọi nền tảng; refresh dữ liệu mỗi lần resume gây bão
request — cần throttle.

---

### Q128. `FocusNode`, `FocusScope`, `FocusTraversalGroup` khác nhau? [J]

**Trả lời:** `FocusNode` đại diện một vị trí nhận focus; `FocusScope` nhóm focus theo
route/dialog và lưu focus trước đó; `FocusTraversalGroup`/`FocusTraversalOrder` điều khiển
thứ tự Tab. Dùng `requestFocus`, `unfocus`, `autofocus`, `onKeyEvent` cho bàn phím.

```dart
final emailFocus = FocusNode();
final passFocus = FocusNode();

TextField(focusNode: emailFocus, textInputAction: TextInputAction.next,
  onSubmitted: (_) => passFocus.requestFocus());
```

**Bẫy:** tạo `FocusNode` trong `build`; quên dispose; focus order sai trên form dài; dialog
cần scope riêng để không nhảy focus ra ngoài; test với keyboard/switch access.

---

### Q129. `NavigationBar` (Material 3) khác `BottomNavigationBar` thế nào? [J]

**Trả lời:** `NavigationBar` là component M3, dùng `destinations` +
`selectedIndex`/`onDestinationSelected`, hỗ trợ label behavior và badge; `BottomNavigationBar`
là M2 với `items`, `type` fixed/shifting. App mới nên dùng `NavigationBar`; tablet/desktop
cân nhắc `NavigationRail`.

```dart
NavigationBar(
  selectedIndex: index,
  onDestinationSelected: (i) => setState(() => index = i),
  destinations: const [
    NavigationDestination(icon: Icon(Icons.favorite_border), label: 'Lời chúc'),
    NavigationDestination(icon: Icon(Icons.photo_library), label: 'Ảnh'),
  ],
);
```

**Bẫy:** quá 5 destination làm chật; không giữ state tab (dùng `IndexedStack` hoặc
`StatefulShellRoute`); bottom bar bị bàn phím che; thiếu semantics label.

---

**Networking và realtime**

### Q130. Dio interceptor dùng để làm gì? Viết interceptor an toàn. [J]

**Trả lời:** Interceptor chèn logic vào `onRequest`, `onResponse`, `onError`: thêm header
auth, log, refresh token, retry, map lỗi. Với refresh token, dùng `QueuedInterceptor` để
tránh nhiều request cùng refresh; đánh dấu request đã retry để không lặp vô hạn.

```dart
class AuthInterceptor extends QueuedInterceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = tokenStore.accessToken;
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !err.requestOptions.extra.containsKey('retried')) {
      await auth.refresh();
      err.requestOptions.extra['retried'] = true;
      return handler.resolve(await dio.fetch(err.requestOptions));
    }
    handler.next(err);
  }
}
```

**Bẫy:** log body chứa token/PII; refresh fail vẫn retry; interceptor sửa request dùng chung
gây side effect; thứ tự interceptor ảnh hưởng hành vi.

---

### Q131. Upload file/multipart và hiển thị progress thế nào? [J]

**Trả lời:** Dùng `FormData` + `MultipartFile`; theo dõi `onSendProgress` để cập nhật UI;
với file lớn nên stream thay vì đọc toàn bộ vào RAM, và cho phép huỷ bằng `CancelToken`.
Server cần giới hạn size/type và trả lỗi rõ ràng.

```dart
final form = FormData.fromMap({
  'wishId': wishId,
  'photo': await MultipartFile.fromFile(path, filename: 'photo.jpg'),
});
await dio.post('/photos', data: form, cancelToken: token,
  onSendProgress: (sent, total) => setState(() => progress = sent / total));
```

**Bẫy:** nén ảnh trước khi upload; `content-type` sai làm server reject; không xử lý retry
phần đã gửi; progress không cập nhật trên web/nền tảng khác; quên giới hạn kích thước.

---

### Q132. Huỷ request khi user rời màn hình thế nào? [J]

**Trả lời:** Tạo `CancelToken` cho màn hình, truyền vào request và gọi `cancel()` trong
`dispose`. Khi bắt lỗi, kiểm tra `DioExceptionType.cancel` để không hiển thị lỗi cho user.

```dart
final token = CancelToken();

Future<void> load() async {
  try {
    final res = await dio.get('/messages', cancelToken: token);
    if (!mounted) return;
    setState(() => items = parse(res.data));
  } on DioException catch (e) {
    if (e.type == DioExceptionType.cancel) return;
    if (!mounted) return;
    setState(() => error = mapError(e));
  }
}

@override
void dispose() {
  token.cancel('screen disposed');
  super.dispose();
}
```

**Điểm cộng:** kết hợp cancel với dedupe request và `mounted`; với repository dùng chung,
cẩn thận huỷ token ảnh hưởng request của màn khác.

---

### Q133. Timeout và retry nên cấu hình thế nào? [J]

**Trả lời:** Đặt `connectTimeout`, `sendTimeout`, `receiveTimeout` theo loại API (upload lâu
hơn GET). Chỉ retry lỗi **tạm thời** và request **idempotent** (GET, PUT có idempotency key,
DELETE), với exponential backoff + jitter, giới hạn số lần; tôn trọng `Retry-After` với 429.

```dart
final options = BaseOptions(
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 20),
);

bool retryable(DioException e) =>
    e.type == DioExceptionType.connectionTimeout ||
    e.type == DioExceptionType.receiveTimeout ||
    (e.response?.statusCode ?? 0) >= 500 ||
    e.response?.statusCode == 429;
```

**Bẫy:** retry POST tạo trùng dữ liệu; retry 401 vô hạn; backoff không jitter gây đồng loạt;
timeout quá ngắn trên mạng 3G; không có nút huỷ khi user chờ.

---

### Q134. Phân biệt các lỗi network thường gặp và map sang UX? [J]

**Trả lời:** `SocketException` (mất mạng/DNS/không kết nối được), `TimeoutException` (quá
hạn), `HandshakeException` (TLS/certificate), `FormatException` (JSON sai), `HttpException`
(protocol), và `DioException` bọc các loại trên. Map thành lỗi có `code`, `message` thân
thiện, `retryable` và `action` (thử lại, đăng nhập lại, liên hệ hỗ trợ).

```dart
AppFailure mapError(Object e) => switch (e) {
  SocketException() => const AppFailure('Không có kết nối mạng', retryable: true),
  TimeoutException() => const AppFailure('Máy chủ phản hồi chậm', retryable: true),
  FormatException() => const AppFailure('Dữ liệu không hợp lệ'),
  _ => const AppFailure('Có lỗi xảy ra, vui lòng thử lại'),
};
```

**Bẫy:** hiện raw exception cho user; nuốt lỗi parse làm màn trắng; coi mọi lỗi là retryable;
không log correlation id để debug.

---

### Q135. WebSocket: heartbeat và trạng thái kết nối nên quản lý thế nào? [J]

**Trả lời:** Ngoài connect/reconnect, cần heartbeat để phát hiện kết nối "chết im lặng"
(mạng đổi, NAT timeout): gửi ping định kỳ, chờ pong; nếu quá hạn thì đóng và reconnect.
Expose state (`connecting/connected/reconnecting/closed`) cho UI, dùng backoff + jitter, và
gửi lại subscription/cursor sau khi nối lại.

```dart
_timer = Timer.periodic(const Duration(seconds: 20), (_) {
  if (!_socket.isOpen) return;
  _socket.send(jsonEncode({'type': 'ping', 'ts': DateTime.now().toUtc().toIso8601String()}));
});
```

**Bẫy:** reconnect ngay lập tức khi mất mạng gây bão; không heartbeat nên tưởng còn sống;
gửi tin khi chưa connected; quên huỷ timer/subscription trong dispose; token hết hạn khi
reconnect.

---

**Testing và build**

### Q136. `mocktail` và `mockito` khác nhau? Viết test cơ bản. [J]

**Trả lời:** `mockito` dùng code generation (`build_runner`), mạnh nhưng thêm bước build;
`mocktail` không cần codegen, dùng `Mock` + `when`. Cả hai dùng để cô lập repository/API.
Không mock data class thuần; ưu tiên fake implementation cho logic đơn giản.

```dart
class MockWishRepository extends Mock implements WishRepository {}

test('load trả danh sách', () async {
  final repo = MockWishRepository();
  when(() => repo.load()).thenAnswer((_) async => [wish]);
  final result = await repo.load();
  expect(result, hasLength(1));
  verify(() => repo.load()).called(1);
});
```

**Bẫy:** quên `registerFallbackValue` cho custom type; stub sai kiểu trả về; verify quá chặt
làm test dễ vỡ; mock static/extension không được.

---

### Q137. Các finder phổ biến trong widget test và khi nào dùng? [J]

**Trả lời:** `find.byType`, `find.byKey`, `find.text`, `find.byIcon`,
`find.bySemanticsLabel`, kết hợp `find.descendant`/`find.ancestor`. Ưu tiên `Key` cho widget
quan trọng, `Semantics` cho accessibility; tránh phụ thuộc text dễ đổi/i18n.

```dart
await tester.enterText(find.byKey(const Key('message-field')), 'Chúc mừng');
await tester.tap(find.widgetWithText(FilledButton, 'Gửi'));
await tester.pumpAndSettle();
expect(find.text('Đã gửi'), findsOneWidget);
```

**Bẫy:** `find.text` khớp cả text ẩn/offstage; quên `pump` sau animation; dùng
`pumpAndSettle` với animation vô hạn gây timeout; test phụ thuộc thứ tự widget.

---

### Q138. Test lỗi overflow/layout và text scale thế nào? [J]

**Trả lời:** Đặt kích thước màn hình nhỏ, `devicePixelRatio` và `textScaler` trong test, dùng
`tester.takeException()` để kiểm tra lỗi layout. Luôn reset view sau test để không ảnh hưởng
test khác.

```dart
testWidgets('không overflow ở 320dp và text scale 2', (tester) async {
  tester.view.physicalSize = const Size(320, 640);
  tester.view.devicePixelRatio = 1.0;
  tester.platformDispatcher.textScaleFactorTestValue = 2.0;

  await tester.pumpWidget(const MaterialApp(home: WishScreen()));
  expect(tester.takeException(), isNull);
});
```

**Bẫy:** chỉ test một kích thước; bỏ qua landscape/tablet; `takeException` nuốt lỗi không
liên quan; quên `addTearDown(tester.view.reset)`.

---

### Q139. Flavor và cấu hình môi trường nên làm thế nào? [J]

**Trả lời:** Tách build flavor (dev/staging/prod) ở Android `productFlavors` và iOS scheme/
xcconfig; truyền cấu hình không bí mật qua `--dart-define` hoặc
`--dart-define-from-file`; dùng `String.fromEnvironment`/`bool.fromEnvironment`. Không nhúng
secret trong app — secret thật nằm ở backend/BFF.

```bash
flutter run --flavor dev --dart-define=API_URL=https://dev.api.example.com
flutter build ipa --flavor prod --dart-define-from-file=config/prod.json
```

**Bẫy:** một bundle id cho mọi môi trường gây lẫn push/deep link; quên cấu hình signing cho
từng flavor; commit file chứa secret; `dart-define` là compile-time nên đổi phải rebuild.

---

### Q140. Build release lỗi hoặc app quá nặng: kiểm tra gì? [J]

**Trả lời:** Chạy `flutter build appbundle --release --analyze-size` để xem thành phần chiếm
size; kiểm tra signing, `minSdk`, R8/ProGuard, duplicate class, ABI/NDK, asset/font. Giảm size
bằng split per ABI, tree-shake icon (`--tree-shake-icons`), nén ảnh, bỏ asset không dùng,
deferred components (Android), và cân nhắc package thay thế.

```bash
flutter build apk --release --split-per-abi
flutter build appbundle --release --analyze-size
flutter build ipa --release --obfuscate --split-debug-info=build/symbols
```

**Bẫy:** build debug để đánh giá size; obfuscate mà không lưu symbol; xoá asset bằng tay làm
hỏng runtime; chỉ test trên máy flagship; bỏ qua cấu hình ProGuard của plugin.

---

## 9. Tài liệu tham khảo

- Dart language tour: https://dart.dev/language
- Flutter docs: https://docs.flutter.dev/
- Flutter widget catalog: https://docs.flutter.dev/ui/widgets
- Flutter cookbook: https://docs.flutter.dev/cookbook
- DevTools: https://docs.flutter.dev/tools/devtools/overview
- Testing: https://docs.flutter.dev/testing
- Material 3: https://m3.material.io/

---

*Tiếp tục với [`02-intermediate.md`](./02-intermediate.md) để luyện câu hỏi Mid.*
