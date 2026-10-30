# Flutter cơ bản — Từ Dart đến ứng dụng thực tế

> Nền tảng toàn diện: Dart 3, widget/layout, form, state, HTTP, WebSocket, testing,
> debug. Ví dụ dùng domain trung lập (danh sách đơn hàng/lời nhắn/tin tức) với API REST
> và WebSocket để minh họa realtime. Tất cả đều áp dụng cho app Flutter bất kỳ.

---

## Mục lục

1. [Dart cơ bản](#1-dart-cơ-bản)
2. [Widget và ba cây](#2-widget-và-ba-cây)
3. [Layout](#3-layout)
4. [Style và theme](#4-style-và-theme)
5. [Navigation cơ bản](#5-navigation-cơ-bản)
6. [Form và input](#6-form-và-input)
7. [State cơ bản](#7-state-cơ-bản)
8. [Async và HTTP](#8-async-và-http)
9. [Local storage](#9-local-storage)
10. [Realtime với WebSocket](#10-realtime-với-websocket)
11. [Animation cơ bản](#11-animation-cơ-bản)
12. [Testing cơ bản](#12-testing-cơ-bản)
13. [Debug](#13-debug)
14. [Build và run](#14-build-và-run)
15. [Ví dụ tổng hợp: màn hình danh sách realtime](#15-ví-dụ-tổng-hợp-màn-hình-danh-sách-realtime)
16. [Bài tập](#16-bài-tập)
17. [Anti-patterns cơ bản](#17-anti-patterns-cơ-bản)
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

`List` giữ thứ tự (lời chúc), `Set` chống trùng (id realtime), `Map` tra cứu (thống kê),
record trả nhiều giá trị nhỏ. Hàm là first-class object, truyền/nhận như biến.

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

### 3.2 Stack, Positioned

```dart
Stack(children: [
  ClipRRect(borderRadius: BorderRadius.circular(24), child: Image.asset(
      'assets/images/cover.jpg', height: 220, fit: BoxFit.cover)),
  const Positioned(left: 16, bottom: 16, child: Text('Minh & Lan · 20.12.2026',
      style: TextStyle(color: Colors.white, fontSize: 20))),
])
```

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

### 3.4 Responsive

Dùng `LayoutBuilder` để chọn số cột (ví dụ `<600` → 1, `600–900` → 2, `>=900` → 3),
`MediaQuery.sizeOf(context)` cho breakpoint toàn app và `SafeArea` cho tai thỏ.

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

---

## 8. Async và HTTP

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

Phân trang: backend trả tối đa 20 tin mới nhất; truyền `before` = `created_at` của tin
cũ nhất rồi `insertAll(0, older)`; khóa `_loadingMore` tránh gọi trùng. `dio` thay
`http` khi cần interceptor, retry, `CancelToken` hoặc upload progress.

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

---

## 13. Debug

- **DevTools**: widget inspector, performance timeline, memory, network.
- Breakpoint khi `flutter run --debug`; `flutter analyze` trước commit.
- `debugPrint()` thay `print()` để log không bị strip ở release.

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `RenderFlex overflowed` | Con quá lớn trong Row/Column | `Expanded`, `Flexible`, giảm padding |
| `setState() after dispose()` | Future xong sau khi widget hủy | `if (!mounted) return;` |
| `Null check operator on null` | Dùng `!` sai | `?.`, `??`, kiểm tra null |
| `Unbounded height/width` | ListView trong Column | `Expanded`/`SizedBox(height:)` |
| `SocketException` | Sai URL/server chưa chạy | Kiểm tra base URL, `curl` endpoint |

Nhấn `p` khi `flutter run` để bật debug paint; tắt trước khi chụp screenshot.

---

## 14. Build và run

```bash
flutter run --debug
flutter run --release
flutter build apk --release
flutter build appbundle --release
flutter build ipa --release          # macOS + signing
```

| Chế độ | Đặc điểm |
|---|---|
| Debug | JIT, hot reload, chậm hơn, có assertion |
| Profile | AOT + trace, đo hiệu năng |
| Release | AOT, không assertion, tối ưu size |

Flavors dev/staging/prod cấu hình native + `--dart-define`; chi tiết ở
`flutter-production.md`.

---

## 15. Ví dụ tổng hợp: màn hình danh sách realtime

Màn hình minh họa dùng API client (mục 8), socket realtime (mục 10), form gửi dữ liệu (mục 6). Ý tưởng là danh sách items với khả năng thêm mới và cập nhật realtime.

```dart
final _api = MessageApi();
List<Wish> _items = [];
late final GuestbookSocket _socket;
bool _loading = true;
String? _error;

@override
void initState() {
  super.initState();
  _socket = GuestbookSocket(_onEvent)..connect();
  _load();
}

Future<void> _load() async {
  setState(() => _loading = true);
  try {
    final items = await _api.fetchMessages();
    if (!mounted) return;
    setState(() => _items = items);
  } catch (e) {
    if (mounted) setState(() => _error = '$e');
  } finally {
    if (mounted) setState(() => _loading = false);
  }
}

void _onEvent(Map<String, dynamic> event) {
  if (mounted) setState(() => _items = applyWishEvent(_items, event));
}
```

```dart
Widget _body() {
  if (_loading) return const Center(child: CircularProgressIndicator());
  if (_error != null) return Center(child: Text(_error!));
  if (_items.isEmpty) return const Center(child: Text('Hãy là người đầu tiên!'));
  return RefreshIndicator(
    onRefresh: _load,
    child: ListView.builder(physics: const AlwaysScrollableScrollPhysics(),
      itemCount: _items.length,
      itemBuilder: (context, index) => WishCard(
        key: ValueKey(_items[index].id),
        name: _items[index].senderName, content: _items[index].content),
    ),
  );
}

@override
Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Sổ lưu bút')),
      body: _body(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          builder: (_) => RsvpForm(onSubmit: _api.createMessage),
        ),
        icon: const Icon(Icons.favorite_outline),
        label: const Text('Gửi lời chúc'),
      ),
    );
```

Sau khi gửi thành công, server có thể broadcast event realtime cho tất cả client; app
có thể cập nhật list từ event hoặc thêm tạm từ response và dedupe theo id để tránh trùng.

---

## 16. Bài tập

1. Extension trên `List<Wish>` trả tổng người tham dự và tỷ lệ phản hồi; test list rỗng.
2. Card responsive 1/2/3 cột bằng `LayoutBuilder`; thêm `SliverAppBar` co giãn.
3. Form: thêm `guest_of`, chặn số người > 4, khóa submit khi đang gửi.
4. HTTP: tải tin cũ bằng `before`; xử lý timeout và nút thử lại.
5. WebSocket: badge "đang kết nối", reconnect sau mất mạng, log số lần thử.
6. Widget test form báo lỗi khi tên rỗng; integration test gửi lời chúc lên backend local.
7. Dark mode + kiểm tra độ tương phản text trên card.

---

## 17. Anti-patterns cơ bản

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| `setState` sau `await` không check `mounted` | `if (!mounted) return;` |
| Tạo controller trong `build()` | Field của State + `dispose()` |
| `ListView` trong `Column` không constraint | `Expanded`/`CustomScrollView` |
| Hard-code màu/kích thước | `Theme.of(context)`, spacing token |
| Gọi API trong `build()` | `initState`/controller/repository |
| Chỉ có loading, bỏ qua lỗi | State `loading/error/data` đầy đủ |
| WebSocket không reconnect/đóng | Lifecycle + backoff |
| `GlobalKey` cho mọi thứ | `ValueKey` cho list |
| Test chỉ "chạy được" | Assert UI/state/lỗi cụ thể |

---

## 18. Tài liệu tham khảo

- Dart language tour: https://dart.dev/language
- Dart async: https://dart.dev/libraries/async/async-await
- Flutter widgets: https://docs.flutter.dev/ui/widgets
- Flutter layout: https://docs.flutter.dev/ui/layout
- Flutter forms: https://docs.flutter.dev/cookbook/forms
- `http`: https://pub.dev/packages/http
- `web_socket_channel`: https://pub.dev/packages/web_socket_channel
- `go_router`: https://pub.dev/packages/go_router
- Flutter testing: https://docs.flutter.dev/testing
- WebSocket backend: [`../websocket.md`](../websocket.md)

---

*Tiếp theo: [`flutter-advanced.md`](./flutter-advanced.md).*
