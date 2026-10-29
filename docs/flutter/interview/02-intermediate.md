# Flutter Interview — Trung cấp (Mid)

> 85 câu hỏi dành cho ứng viên 2–4 năm kinh nghiệm: chọn state management có lý do, tách
> kiến trúc, routing/deep link, networking, offline-first, realtime, testing và CI. Đáp án
> tập trung vào **trade-off** và **cách kiểm chứng**, không chỉ định nghĩa.

---

## Mục lục

1. [State management](#1-state-management)
2. [Kiến trúc và DI](#2-kiến-trúc-và-di)
3. [Routing, deep link và networking](#3-routing-deep-link-và-networking)
4. [Offline, realtime, storage](#4-offline-realtime-storage)
5. [UI, form, i18n, accessibility](#5-ui-form-i18n-accessibility)
6. [Performance, testing, CI, release](#6-performance-testing-ci-release)
7. [Code review và chất lượng](#7-code-review-và-chất-lượng)
8. [Refactor và tiến hoá kiến trúc](#8-refactor-và-tiến-hoá-kiến-trúc)
9. [Câu hỏi bổ sung (cập nhật)](#9-câu-hỏi-bổ-sung-cập-nhật)
10. [Tài liệu tham khảo](#10-tài-liệu-tham-khảo)

---

## 1. State management

### Q01. Bạn chọn state management dựa trên tiêu chí nào? [M]

**Trả lời:** Không có lựa chọn tốt nhất tuyệt đối. Mình đánh giá:

| Tiêu chí | Câu hỏi |
|---|---|
| Phạm vi state | Cục bộ một widget hay chia sẻ nhiều màn hình? |
| Độ phức tạp | Async, cache, realtime, dependent state? |
| Testability | Có override/giả lập dễ không? |
| Learning curve | Team mới mất bao lâu? |
| Boilerplate | Codegen có sẵn không? |
| Debugging | Có DevTools/audit trail? |
| Lifecycle | Auto-dispose, keep-alive, family? |

Với guestbook: `setState` cho toggle/form; Riverpod cho repository + async list;
Bloc nếu cần event log/audit hoặc team đã quen. Mình thống nhất một hướng, tránh trộn
Provider + Bloc + GetX trong cùng feature.

**Điểm cộng:** nêu chi phí chuyển đổi và cách đo (số rebuild, thời gian onboard, bug state).

---

### Q02. `InheritedWidget` hoạt động bên trong thế nào? [M]

**Trả lời:** Khi widget gọi `context.dependOnInheritedWidgetOfExactType<T>()`, Flutter ghi
nhận Element đó là dependent của `InheritedElement`. Khi `InheritedWidget` được update và
`updateShouldNotify(old) == true`, `InheritedElement` gọi `notifyClients`, đánh dấu các
dependent dirty. Chỉ các widget đã đăng ký mới rebuild.

```dart
class AuthScope extends InheritedNotifier<AuthController> {
  const AuthScope({
    required AuthController controller,
    required super.child,
    super.key,
  }) : super(notifier: controller);
}

final auth = context.dependOnInheritedWidgetOfExactType<AuthScope>()!.notifier!;
```

`InheritedNotifier` tự lắng nghe `Listenable`; Provider/Riverpod dùng nguyên lý tương tự
nhưng tối ưu select/scope.

**Bẫy:** gọi `dependOn...` trong `initState` (chưa có dependency) hoặc trong callback
không phải build; dùng `getElementForInheritedWidgetOfExactType` khi không muốn rebuild.

---

### Q03. Provider: `watch`, `read`, `select`, `Consumer` khác nhau? [M]

**Trả lời:**

- `context.watch<T>()`: đăng ký rebuild khi `T` đổi — chỉ dùng trong `build`.
- `context.read<T>()`: đọc một lần, không rebuild — dùng trong callback/init.
- `context.select<T, R>((t) => t.field)`: chỉ rebuild khi `R` đổi.
- `Consumer<T>`: giới hạn phạm vi rebuild trong builder.
- `Selector<T, R>`: như select nhưng có `shouldRebuild`.

```dart
final count = context.select<Cart, int>((cart) => cart.itemCount);
ElevatedButton(
  onPressed: () => context.read<Cart>().add(item),
  child: Text('Thêm ($count)'),
);
```

**Bẫy:** `watch` trong `initState`/callback; `read` trong build rồi kỳ vọng UI cập nhật;
`notifyListeners` sau dispose; state mutable khiến select không phát hiện thay đổi.

---

### Q04. Riverpod giải quyết vấn đề gì so với Provider? [M]

**Trả lời:** Riverpod là compile-safe, không phụ thuộc `BuildContext`, cho phép provider
phụ thuộc provider, override trong test, `autoDispose`, `family`, `AsyncValue`, và tách
state khỏi widget tree.

```dart
final apiProvider = Provider<MessageApi>((ref) => MessageApi(ref.watch(dioProvider)));

final wishesProvider = StreamProvider.autoDispose<List<Wish>>((ref) {
  final repo = ref.watch(messageRepositoryProvider);
  return repo.watchAll();
});

class Guestbook extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(wishesProvider);
    return async.when(
      data: (wishes) => WishList(wishes),
      loading: () => const Loading(),
      error: (e, _) => Retry(onRetry: () => ref.invalidate(wishesProvider)),
    );
  }
}
```

`ref.watch` trong build/provider; `ref.read` trong callback; `ref.listen` cho side effect
(navigation/SnackBar); `ref.invalidate` để refresh.

**Bẫy:** tạo provider trong widget; `autoDispose` làm mất state khi không còn listener;
family key không stable gây tạo provider mới liên tục; lạm dụng `keepAlive`.

---

### Q05. Bloc và Cubit khác nhau? Khi nào chọn Bloc? [M]

**Trả lời:** Cubit phát state trực tiếp qua method; Bloc nhận event, xử lý qua handler,
phát state. Bloc phù hợp khi cần event log/audit, nhiều nguồn event, concurrency control,
hoặc team muốn tách input/output rõ ràng.

```dart
class GuestbookBloc extends Bloc<GuestbookEvent, GuestbookState> {
  GuestbookBloc(this._repo) : super(const GuestbookLoading()) {
    on<GuestbookStarted>(_load);
    on<WishSubmitted>(_submit, transformer: droppable());
  }

  Future<void> _load(GuestbookStarted event, Emitter<GuestbookState> emit) {
    return emit.forEach(_repo.watchAll(), onData: GuestbookLoaded.new);
  }
}
```

**Điểm cộng:** `bloc_concurrency` (`droppable`, `restartable`, `sequential`) xử lý race;
state immutable; test bằng `blocTest`. Cubit gọn hơn cho CRUD đơn giản.

**Bẫy:** emit sau khi bloc đóng; handler dài không kiểm tra `isClosed`; state mutable dùng
chung; lạm dụng event cho UI state cục bộ.

---

## 2. Kiến trúc và DI

### Q06. Clean architecture trong Flutter nên hiểu thế nào cho thực tế? [M]

**Trả lời:** Mục tiêu là **dependency rule** và khả năng test, không phải vẽ nhiều lớp.
Tối thiểu:

| Lớp | Trách nhiệm | Phụ thuộc |
|---|---|---|
| Presentation | Widget, controller/notifier, route | Domain |
| Domain | Entity, repository interface, use case | Không phụ thuộc Flutter/IO |
| Data | API client, DTO, DB, mapper | Domain |
| Core | Network, DB, logger, theme, DI | Không phụ thuộc feature |

```text
lib/
├── app/
├── core/
└── features/guestbook/
    ├── data/          # WishDto, WishApi, WishRepositoryImpl
    ├── domain/        # Wish, WishRepository, WatchWishes
    └── presentation/  # GuestbookPage, GuestbookController, widgets
```

Feature-first giúp xóa/ship feature độc lập. Với app 2 màn hình, đừng tạo 12 thư mục
rỗng; bắt đầu từ feature rồi tách khi đau.

**Điểm cộng:** nêu dấu hiệu over-engineering: mapper 1-1 vô nghĩa, use case chỉ gọi
repository, interface chỉ có một implementation chưa bao giờ thay.

---

### Q07. Repository và use case có cần thiết không? [M]

**Trả lời:** Repository che giấu nguồn dữ liệu (API/DB/cache) và cho domain một API ổn
định. Use case chỉ cần khi có logic điều phối/kiểm tra quyền/ghép nguồn; nếu chỉ pass
through, gọi repository trực tiếp từ controller là đủ.

```dart
abstract interface class WishRepository {
  Stream<List<Wish>> watchAll();
  Future<void> send(WishDraft draft);
}

class SendWish {
  const SendWish(this._repo);
  final WishRepository _repo;

  Future<void> call(WishDraft draft) {
    if (draft.content.trim().isEmpty) {
      throw const ValidationFailure('Nội dung không được rỗng');
    }
    return _repo.send(draft);
  }
}
```

**Bẫy:** repository trả DTO/JSON lên UI; domain import `dio`/`sqflite`; use case chỉ là
lớp trung gian không kiểm thử được gì.

---

### Q08. Dependency injection trong Flutter: chọn cách nào? [M]

**Trả lời:** Ưu tiên **constructor injection** cho dependency tường minh, dễ test. Với
graph lớn, dùng Riverpod provider hoặc `get_it` + `injectable`; tránh service locator ẩn
trong widget.

```dart
class GuestbookController {
  GuestbookController({required WishRepository repository})
      : _repository = repository;
  final WishRepository _repository;
}

// Riverpod
final repoProvider = Provider<WishRepository>((ref) => WishRepositoryImpl(
      api: ref.watch(apiProvider),
      db: ref.watch(dbProvider),
    ));
```

**Điểm cộng:** phân biệt lifetime (singleton, factory, scoped); override trong test;
không giữ `BuildContext` trong singleton; dispose resource đúng.

**Bẫy:** global mutable singleton gây state rò rỉ giữa test; inject `BuildContext`;
circular dependency; khởi tạo nặng trong constructor.

---

## 3. Routing, deep link và networking

### Q09. `go_router` xử lý auth guard và deep link thế nào? [M]

**Trả lời:** Khai báo route với `redirect` dựa trên auth state; `refreshListenable` để
router re-evaluate khi auth đổi. Path parameter/query được parse có kiểu; `errorBuilder`
cho URL sai.

```dart
final router = GoRouter(
  initialLocation: '/wishes',
  refreshListenable: authController,
  redirect: (context, state) {
    final loggedIn = authController.isLoggedIn;
    final onLogin = state.matchedLocation == '/login';
    if (!loggedIn && !onLogin) return '/login?from=${state.uri}';
    if (loggedIn && onLogin) return '/wishes';
    return null;
  },
  routes: [
    GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
    GoRoute(
      path: '/wishes/:id',
      builder: (_, state) => WishDetailPage(id: state.pathParameters['id']!),
    ),
  ],
);
```

**Bẫy:** redirect loop; guard chỉ ở UI mà không bảo vệ API; deep link chứa id không tồn
tại; `extra` không tồn tại sau cold start (phải fetch theo id); auth state chưa load xong
đã redirect.

---

### Q10. Navigator 2.0 hoạt động thế nào? Khi nào tự implement? [M]

**Trả lời:** `Router` nhận route information từ engine, `RouteInformationParser` parse
thành route state, `RouterDelegate` build Navigator theo state. Back/forward, URL web và
deep link đều đi qua pipeline này.

Hầu hết app nên dùng `go_router`/`auto_route` thay vì tự viết. Tự implement khi cần
navigation model đặc biệt (multi-pane, state machine phức tạp) hoặc tích hợp host đặc thù.

**Điểm cộng:** phân biệt `RouteInformationParser`, `RouterDelegate`, `RouterInformation`;
xử lý restoration và browser history; test navigation bằng integration test.

---

### Q11. Dio interceptor xử lý refresh token thế nào cho đúng? [M]

**Trả lời:** Gắn access token; trên 401, **single-flight** refresh (một request refresh
dùng chung), rồi retry request gốc một lần. Không refresh cho chính endpoint refresh;
tránh vòng lặp; nếu refresh fail → logout và điều hướng login.

```dart
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._auth, this._dio);
  final AuthService _auth;
  final Dio _dio;
  Future<String>? _refreshing;

  @override
  void onRequest(options, handler) async {
    final token = await _auth.accessToken();
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  void onError(DioException err, handler) async {
    final response = err.response;
    if (response?.statusCode != 401 || err.requestOptions.extra['retried'] == true) {
      return handler.next(err);
    }
    try {
      _refreshing ??= _auth.refresh().whenComplete(() => _refreshing = null);
      await _refreshing;
      final options = err.requestOptions
        ..extra['retried'] = true
        ..headers['Authorization'] = 'Bearer ${await _auth.accessToken()}';
      final retried = await _dio.fetch(options);
      return handler.resolve(retried);
    } catch (_) {
      await _auth.logout();
      return handler.reject(err);
    }
  }
}
```

**Bẫy:** mỗi request 401 tự refresh → bão request; refresh token hết hạn nhưng vẫn loop;
retry POST không idempotent; log token; interceptor order sai (auth trước khi token có).

---

### Q12. `json_serializable`/`freezed` có đáng dùng không? [M]

**Trả lời:** Đáng khi schema nhiều, cần `copyWith`, equality, union state, và muốn giảm
code tay. `freezed` sinh immutable class + `copyWith` + pattern matching; `json_serializable`
sinh `fromJson/toJson`. Đổi lại: build_runner chậm hơn, generated code cần quy ước commit.

```dart
@freezed
class Wish with _$Wish {
  const factory Wish({
    required String id,
    required String sender,
    required String content,
    @Default(0) int likes,
  }) = _Wish;

  factory Wish.fromJson(Map<String, Object?> json) => _$WishFromJson(json);
}
```

**Bẫy:** schema nhỏ 1–2 field thì code tay nhanh hơn; generated file lệch; enum mới làm
parse fail nếu không có fallback; không validate dữ liệu từ server.

---

### Q13. Thiết kế error model cho app thế nào? [M]

**Trả lời:** Tách lỗi theo tầng:

- Data: `DioException`, `SocketException`, `FormatException` → map thành `ApiFailure`.
- Domain: sealed failure (`Network`, `Timeout`, `Unauthorized`, `Validation`, `Server`,
  `Unknown`) với `retryable`, `message`, `code`.
- Presentation: quyết định UI (SnackBar, full error, field error) và message đã bản địa hóa.

```dart
sealed class Failure {
  const Failure(this.code, {this.retryable = false});
  final String code;
  final bool retryable;
}
final class NetworkFailure extends Failure {
  const NetworkFailure() : super('network', retryable: true);
}
final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure() : super('unauthorized');
}
```

**Bẫy:** hiển thị raw exception/stack cho user; mất mã lỗi để support; coi mọi lỗi là
retryable; nuốt lỗi trong catch; log PII/token.

---

### Q14. Phân trang nên dùng offset hay cursor? [M]

**Trả lời:** Cursor tốt hơn cho feed thay đổi liên tục: ổn định khi có insert/delete, hiệu
năng với offset lớn. Offset đơn giản cho dữ liệu tĩnh/admin.

```dart
Future<Page<Wish>> load({String? cursor}) => api.get(
      '/api/messages',
      query: {'limit': 20, if (cursor != null) 'before': cursor},
    );
```

UI cần: trạng thái loading lần đầu, loading thêm, hết dữ liệu, lỗi + retry, dedupe theo
id, hủy request cũ khi filter đổi, giữ vị trí scroll. Với realtime, item mới có thể chèn
đầu danh sách — cần key ổn định và tránh nhảy scroll ngoài ý muốn.

**Bẫy:** `hasMore` dựa `items.length < limit` sai khi có filter; gọi trùng khi scroll;
append trùng id; sort không ổn định; mất item khi server cập nhật giữa hai trang.

---

### Q15. Cache dữ liệu network ở những tầng nào? [M]

**Trả lời:** Ba tầng:

1. **HTTP cache** (ETag/Last-Modified, Cache-Control) — tầng network/proxy.
2. **Memory cache** (repository/provider) — nhanh, mất khi kill app.
3. **Disk/DB cache** — sống qua restart, dùng cho offline.

Chiến lược: cache-first cho dữ liệu ít đổi; network-first cho dữ liệu cần mới; stale-
while-revalidate cho UX mượt. Luôn có TTL, key theo user/tenant, invalidation khi mutation,
và không cache dữ liệu nhạy cảm ở nơi không mã hóa.

**Bẫy:** cache lỗi 4xx; cache response auth của user khác; không phân biệt online/offline;
cache vô hạn gây đầy disk; hiển thị dữ liệu cũ mà không báo.

---

## 4. Offline, realtime, storage

### Q16. Thiết kế offline-first cho guestbook thế nào? [M]

**Trả lời:** Local DB là **single source of truth**; UI watch DB. Luồng ghi:

1. Tạo wish với `localId` + `idempotencyKey`, trạng thái `pending`.
2. Ghi DB + enqueue outbox.
3. Sync gửi API; thành công → cập nhật `serverId`, `synced`; thất bại → retry/backoff.
4. Realtime event → upsert theo `serverId`/`localId` để tránh trùng.
5. Xung đột: ưu tiên server cho dữ liệu đã sync; giữ bản local cho draft; có tombstone
   cho xóa.

**Điểm cộng:** phân biệt lỗi retryable/permanent; ordering; giới hạn outbox; hiển thị
trạng thái đồng bộ; xử lý app bị kill giữa chừng; test mất mạng.

**Bẫy:** coi UI list là source of truth; sync chạy mỗi build; gửi trùng khi retry; xóa cứng
làm mất dữ liệu chưa sync.

---

### Q17. Chọn Drift, sqflite, Hive hay Isar? [M]

**Trả lời:**

| Giải pháp | Mạnh | Yếu | Phù hợp |
|---|---|---|---|
| `sqflite` | SQL, nhẹ, phổ biến | API thô, ít type-safe | CRUD đơn giản |
| `drift` | Type-safe SQL, query, migration, stream | Codegen, đường cong | Dữ liệu quan hệ, offline |
| `Hive` | Nhanh, object, không cần SQL | Query kém, migration thủ công | Cache/key-value |
| `Isar` | Nhanh, index, query | Native dependency, thay đổi API | Object DB lớn |

Guestbook có message + guest + RSVP quan hệ → Drift hợp lý. Nếu chỉ lưu settings/token
(không nhạy cảm) → SharedPreferences; token → secure storage.

**Bẫy:** chọn NoSQL rồi tự viết join; không có migration; query trên main isolate với dữ
liệu lớn; không test migration từ version cũ.

---

### Q18. Quản lý token và phiên đăng nhập thế nào? [M]

**Trả lời:** Access token ngắn hạn + refresh token dài hạn; lưu trong secure storage
(Keychain/Keystore). Refresh single-flight; rotation nếu server hỗ trợ; logout xóa token +
revoke + clear cache; xử lý clock skew/expiry; không log token.

**Điểm cộng:** refresh token trong cookie HttpOnly nếu dùng web; khóa app bằng biometric
cho thao tác nhạy cảm; phát hiện token bị thu hồi; queue request trong lúc refresh.

**Bẫy:** lưu token trong SharedPreferences; refresh mỗi request; không xóa cache khi logout;
dùng token hết hạn gây 401 loop.

---

### Q19. WebSocket production cần những gì ngoài `connect`? [M]

**Trả lời:** State machine (`disconnected/connecting/open/reconnecting`), heartbeat ping/
pong, exponential backoff + jitter, resume bằng cursor/sequence, dedupe theo event id,
ordering, auth khi handshake/reconnect, xử lý app lifecycle (background → close, resume →
reconnect), giới hạn queue, fallback polling, metrics.

```dart
Duration backoff(int attempt) {
  final base = 500 * (1 << attempt.clamp(0, 5));
  final jitter = Random().nextInt(300);
  return Duration(milliseconds: base + jitter);
}
```

**Bẫy:** reconnect ngay lập tức; không phân biệt lỗi auth (không nên retry vô hạn); miss
event trong lúc mất kết nối; nhiều socket do màn hình tạo riêng; không đóng khi logout.

---

### Q20. Background task trên mobile có giới hạn gì? [M]

**Trả lời:** iOS không cho chạy nền tùy ý; `BGTaskScheduler`/background fetch bị hệ thống
quyết định thời điểm, có giới hạn thời gian. Android dùng WorkManager cho deferrable work,
foreground service cho tác vụ dài có thông báo. Không đảm bảo chạy đúng giờ.

Chiến lược: ưu tiên push để đánh thức, sync ngắn khi app mở/foreground, lưu outbox và
retry; đừng thiết kế phụ thuộc background chạy liên tục.

**Bẫy:** hứa "realtime" khi app bị kill; dùng background để upload lớn không foreground
service; pin battery optimization trên Android; không test chế độ tiết kiệm pin.

---

### Q21. Push notification hoạt động thế nào trong Flutter? [M]

**Trả lời:** FCM (Android) và APNs (iOS), thường qua `firebase_messaging`. Cần quyền
(Android 13+ notification permission, iOS request), lấy device token, gửi token lên
backend, xử lý foreground/background/terminated, deep link khi tap, refresh token khi đổi.

```dart
FirebaseMessaging.onMessage.listen((message) {
  // foreground: hiển thị in-app hoặc local notification
});
FirebaseMessaging.onMessageOpenedApp.listen((message) {
  router.go(message.data['route'] ?? '/');
});
final initial = await FirebaseMessaging.instance.getInitialMessage();
if (initial != null) { /* cold start deep link */ }
```

**Bẫy:** chỉ test foreground; quên `onMessageOpenedApp`; token hết hạn; notification
channel thiếu trên Android 8+; silent push bị giới hạn; gửi PII trong payload.

---

## 5. UI, form, i18n, accessibility

### Q22. Form phức tạp (dynamic fields, async validation) làm thế nào? [M]

**Trả lời:** Tách `FormField`/controller cho từng field; dùng `Form` + `GlobalKey` cho
validation đồng bộ; async validation chạy ngoài validator (debounce, trạng thái
`validating`), chặn submit đến khi xong. Dynamic list dùng `ValueKey` ổn định, dispose
controller khi xóa field.

**Điểm cộng:** `AutofillGroup`/`autofillHints`, input formatter, focus order, lưu draft,
validation cross-field, accessibility label/lỗi. Không dùng `TextEditingController` cho
mọi thứ nếu chỉ cần `onChanged`.

---

### Q23. Responsive và adaptive khác nhau? [M]

**Trả lời:** **Responsive** là thích nghi kích thước (breakpoint, grid, flex). **Adaptive**
là thích nghi nền tảng/thiết bị (Material vs Cupertino, hành vi back, permission, layout
tablet/foldable). Làm cả hai: dùng `LayoutBuilder`, `MediaQuery`, `Theme.of(context).platform`,
`Switch.adaptive`, `showAdaptiveDialog`.

**Bẫy:** chỉ test một kích thước; hardcode pixel; bỏ qua text scale/landscape; dùng
`Platform.isIOS` thay `Theme.of(context).platform` (khó test); bỏ qua foldable/split view.

---

### Q24. Xây design system/theme mở rộng trong Flutter thế nào? [M]

**Trả lời:** Dùng `ColorScheme` + `TextTheme` làm nền; thêm token riêng bằng
`ThemeExtension` (spacing, radius, brand color); component wrapper (Button, Card) đọc token,
không hardcode. Tổ chức file theme, version hóa component, test golden.

```dart
@immutable
class AppTokens extends ThemeExtension<AppTokens> {
  const AppTokens({required this.cardRadius, required this.gutter});
  final double cardRadius;
  final double gutter;

  @override
  AppTokens copyWith({double? cardRadius, double? gutter}) =>
      AppTokens(cardRadius: cardRadius ?? this.cardRadius, gutter: gutter ?? this.gutter);

  @override
  AppTokens lerp(AppTokens? other, double t) => other == null
      ? this
      : AppTokens(
          cardRadius: lerpDouble(cardRadius, other.cardRadius, t)!,
          gutter: lerpDouble(gutter, other.gutter, t)!,
        );
}
```

**Bẫy:** token và theme Material trùng chức năng; hardcode màu trong component; dark mode
chỉ đảo màu; không test contrast.

---

### Q25. i18n trong Flutter nên làm thế nào? [M]

**Trả lời:** Dùng `flutter_localizations` + `gen-l10n` với file ARB; khai báo
`supportedLocales`, `localizationsDelegates`; dùng `AppLocalizations.of(context)`. Hỗ trợ
plural/select, date/number format theo locale, RTL, fallback.

```yaml
flutter:
  generate: true
```

```arb
{
  "@wishCount": {"plural": {"one": "{count} lời chúc", "other": "{count} lời chúc"}},
  "wishCount": "{count, plural, =0{Không có lời chúc} one{1 lời chúc} other{{count} lời chúc}}"
}
```

**Bẫy:** hardcode tiếng Việt trong widget; nối chuỗi dịch; dùng `intl` format sai locale;
không test RTL/text dài; quên thêm locale vào `supportedLocales`.

---

### Q26. Accessibility trong Flutter gồm những gì? [M]

**Trả lời:** Semantic label/role/action, thứ tự đọc, tap target ≥ 48dp, contrast, text
scale, không chỉ dùng màu, hỗ trợ screen reader, reduce motion, focus visible.

```dart
Semantics(
  button: true,
  label: 'Gửi lời chúc',
  child: IconButton(
    onPressed: send,
    icon: const Icon(Icons.send),
  ),
);

// Chỉ đọc một lần cho cả card
MergeSemantics(child: WishCard(wish));
```

**Điểm cộng:** test với TalkBack/VoiceOver, `SemanticsTester`, `meetsGuideline` của
`flutter_test`; tránh `ExcludeSemantics` che nội dung; accessibility là yêu cầu, không
phải bước cuối.

---

### Q27. Animation nâng cao: stagger, physics, Hero? [M]

**Trả lời:** Dùng một `AnimationController` + nhiều `Interval`/`TweenSequence` cho stagger;
`SpringSimulation`/`CurvedAnimation` cho chuyển động tự nhiên; `Hero` cho shared element.
`AnimatedBuilder` chỉ rebuild phần cần thiết, truyền `child` tĩnh để tránh rebuild.

```dart
final controller = AnimationController(vsync: this, duration: const Duration(ms: 600));
final fade = CurvedAnimation(parent: controller, curve: Interval(0, .5));
final slide = Tween(begin: const Offset(0, .1), end: Offset.zero)
    .animate(CurvedAnimation(parent: controller, curve: Interval(.3, 1, curve: Curves.easeOut)));
```

**Bẫy:** nhiều controller không dispose; animation vô hạn trong test; dùng `setState` mỗi
frame thay `AnimatedBuilder`; không tôn trọng `disableAnimations`.

---

### Q28. `CustomPaint` dùng khi nào? [M]

**Trả lời:** Khi cần vẽ shape/chart/signature/decoration không có widget sẵn. Tách
`CustomPainter`, implement `paint`, `shouldRepaint` chính xác, dùng `Listenable` cho
repaint, `size` từ parent; hit test nếu cần tương tác.

```dart
class SparkPainter extends CustomPainter {
  SparkPainter(this.values, {Listenable? repaint}) : super(repaint: repaint);
  final List<double> values;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 2;
    final path = Path();
    // ... vẽ path
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant SparkPainter old) => old.values != values;
}
```

**Bẫy:** `shouldRepaint` luôn true gây paint lại; vẽ quá nhiều path mỗi frame; quên
`RepaintBoundary`; dùng `CustomPaint` cho layout đơn giản.

---

## 6. Performance, testing, CI, release

### Q29. Làm sao giảm rebuild mà không làm code rối? [M]

**Trả lời:** Đo trước bằng DevTools/rebuild stats. Sau đó: tách widget lá, `const`, dùng
`select`/`Selector`, `ValueListenableBuilder`, `AnimatedBuilder` với `child`, `RepaintBoundary`,
key ổn định, tránh `MediaQuery.of` ở gốc. Không tối ưu mù.

**Bẫy:** bọc mọi thứ `const` mà vẫn rebuild do state; tách widget quá nhỏ gây overhead;
`RepaintBoundary` tràn lan tăng layer; dùng `setState` ở widget cha cho state con.

---

### Q30. Tối ưu list lớn trong Flutter? [M]

**Trả lời:** `ListView.builder`/`SliverList`, `itemExtent`/`prototypeItem` nếu cùng kích
thước, `cacheExtent` hợp lý, key ổn định, ảnh `cacheWidth`, tránh `shrinkWrap`, tránh
widget nặng trong item, phân trang, `addAutomaticKeepAlives: false` nếu không cần giữ state.

**Điểm cộng:** profile trên thiết bị thật; kiểm tra scroll physics; dùng `SliverList` khi
có header; giữ 60/120fps; theo dõi memory ảnh.

---

### Q31. UI jank: phân biệt UI thread và raster thread? [M]

**Trả lời:** UI thread chạy Dart (build/layout), raster thread chuyển layer thành lệnh GPU.
Frame budget 16.7ms (60Hz) hoặc 8.3ms (120Hz). Nếu UI thread vượt → build/layout nặng;
raster vượt → paint/shader/overdraw/ảnh lớn. DevTools Performance ghi cả hai; dùng profile
mode, `--trace-skia`/Impeller tracing khi cần.

**Bẫy:** đo ở debug; tối ưu raster khi lỗi ở UI; bỏ qua shader compilation lần đầu; không
tái hiện trên thiết bị yếu.

---

### Q32. Các nguồn memory leak phổ biến trong Flutter? [M]

**Trả lời:** Controller/subscription/timer không dispose; listener không remove; static
giữ `BuildContext`/widget; closure giữ screen; ảnh lớn/cache không giới hạn; stream
controller không close; native view/plugin giữ activity. Dùng DevTools Memory, snapshot
diff, `leak_tracker`, kiểm tra dispose.

```dart
@override
void dispose() {
  _controller.dispose();
  _subscription.cancel();
  _timer?.cancel();
  _focusNode.dispose();
  super.dispose();
}
```

**Bẫy:** dispose nhưng vẫn giữ reference trong singleton; `addListener` không
`removeListener`; `StreamController` broadcast không close.

---

### Q33. Giảm startup time mà không làm hỏng UX? [M]

**Trả lời:** Đo first frame và time-to-interactive; giữ `main()` nhẹ; trì hoãn analytics/
DB/plugin không cần; lazy provider; cache dữ liệu nhỏ; splash/placeholder; tránh network
trước first frame; isolate cho parse lớn; kiểm tra asset/font. Với app lớn, cân nhắc
deferred components (Android) và warm-up.

**Bẫy:** gọi `await` nhiều thứ trước `runApp`; init Firebase đồng bộ; decode ảnh splash
lớn; che giấu startup chậm bằng splash quá lâu.

---

### Q34. Chiến lược test cho app Flutter trung bình? [M]

**Trả lời:** Test pyramid: nhiều unit cho domain/repository (fake API/DB), widget test cho
screen/component quan trọng, ít integration test cho luồng chính (login, gửi wish, offline).
Thêm golden cho design system, contract test với backend, test migration DB. Coverage là
chỉ số phụ, ưu tiên hành vi và nhánh lỗi.

**Bẫy:** test implementation (private method); mock quá nhiều; integration test phụ thuộc
server thật; test flaky do sleep/network; không test error/empty/offline.

---

### Q35. Làm sao làm code dễ test hơn? [M]

**Trả lời:** Constructor injection, interface nhỏ, tách pure function, inject clock/ID
generator/HTTP client, không static mutable, không gọi `DateTime.now()` trực tiếp trong
logic, dùng fake thay vì mock khi có thể, dựng test data builder.

```dart
class Clock {
  const Clock();
  DateTime now() => DateTime.now();
}

class SendWish {
  SendWish(this._repo, this._clock);
  final WishRepository _repo;
  final Clock _clock;
}
```

**Bẫy:** singleton toàn cục; logic trong widget; phụ thuộc thứ tự test; dùng `sleep`;
test phụ thuộc múi giờ/locale máy chạy.

---

### Q36. Thiết lập CI/CD cho Flutter gồm những gì? [M]

**Trả lời:** Pipeline: format check → analyze → unit/widget test → build debug/profile →
build release có signing → upload artifact/TestFlight/Play internal → thông báo. Cache
pub, Gradle, CocoaPods; pin Flutter version (FVM); secrets trong CI vault; chạy trên
PR + main; matrix nếu cần.

```yaml
steps:
  - uses: subosito/flutter-action@v2
    with: {flutter-version: '3.24.x', channel: stable, cache: true}
  - run: flutter pub get
  - run: dart format --output=none --set-exit-if-changed .
  - run: flutter analyze
  - run: flutter test --coverage
  - run: flutter build appbundle --release --dart-define-from-file=config/prod.json
```

**Bẫy:** build release mỗi PR gây tốn; không cache; secret trong log; không khóa version;
deploy mà không test migration/API.

---

### Q37. Khi nào dùng code generation? [M]

**Trả lời:** Khi lợi ích lớn hơn chi phí build: JSON model nhiều field, immutable state
(`freezed`), DB type-safe (`drift`), DI (`injectable`), route (`auto_route`), l10n. Với
model 2 field, viết tay nhanh hơn và dễ đọc.

**Bẫy:** generated code lệch schema; build_runner chậm; commit generated file gây conflict;
không chạy `build_runner` trong CI; lạm dụng codegen cho mọi thứ.

---

### Q38. Static analysis và lint nên cấu hình thế nào? [M]

**Trả lời:** Kế thừa `flutter_lints`, bật `strict-casts`, `strict-inference`,
`strict-raw-types` nếu phù hợp; thêm rule chống bug (`use_build_context_synchronously`,
`avoid_print`, `prefer_const_constructors`); dùng `custom_lint` cho rule nội bộ; CI fail
trên warning. Suppress có comment lý do, phạm vi hẹp.

**Bẫy:** bật tất cả rule gây noise; ignore toàn file; không format; lint không thay thế test.

---

### Q39. Observability cho app mobile gồm những gì? [M]

**Trả lời:** Crash reporting (Crashlytics/Sentry), non-fatal errors, structured logs,
breadcrumbs, performance traces (startup, screen, network), release health/crash-free
users, ANR, feature flags. Redact PII/token; upload symbol/mapping; sampling hợp lý; alert
theo SLO.

**Bẫy:** log token/nội dung nhạy cảm; crash report không có symbol; quá nhiều event gây
nhiễu/chi phí; chỉ theo dõi crash mà bỏ qua jank/ANR.

---

### Q40. Bảo mật mobile cần quan tâm gì? [M]

**Trả lời:** TLS bắt buộc; certificate pinning có trade-off (rotation, emergency); secure
storage cho token; không nhúng secret/API key trong app; obfuscation + split debug info;
validate deep link; chặn screenshot cho màn hình nhạy cảm; root/jailbreak detection (chỉ
là tín hiệu); cập nhật dependency; OWASP MASVS.

**Bẫy:** tin client là tin cậy; ẩn logic bằng obfuscation; lưu secret trong `--dart-define`
(bản chất vẫn nằm trong binary); pinning không có kế hoạch rotate; log request body.

---

### Q41. Giảm app size thế nào? [M]

**Trả lời:** `flutter build appbundle`/`--split-per-abi`, tree shaking, R8/ProGuard, xóa
asset/font không dùng, nén ảnh, dùng font subset, deferred components, tránh package nặng
không cần, `--analyze-size` để tìm thủ phạm, `--obfuscate --split-debug-info`.

**Bẫy:** chọn package tiện nhưng kéo native SDK lớn; giữ nhiều bản dịch/asset; không kiểm
tra size sau mỗi release; obfuscate làm khó debug mà không lưu symbol.

---

### Q42. Quản lý flavor/môi trường thế nào? [M]

**Trả lời:** Tách `dev/staging/prod`: bundle id, app name, icon badge, signing, API URL,
Firebase project. Dùng `--dart-define-from-file` hoặc config class; entry point riêng;
không cho phép build prod với URL dev; CI kiểm tra config.

**Bẫy:** một bundle id cho tất cả → không cài song song, lẫn dữ liệu; secret trong repo;
quên đổi GoogleService-Info.plist; test nhầm môi trường.

---

### Q43. Monorepo nhiều package Flutter nên tổ chức thế nào? [M]

**Trả lời:** Dùng workspace/melos, tách `apps/` và `packages/` (core, design system,
feature package); dependency graph một chiều; version nội bộ; CI path filter; test từng
package; tránh package "utils" khổng lồ.

**Bẫy:** circular dependency; package chia quá nhỏ; publish package nội bộ lên pub;
không khóa SDK; build toàn repo mỗi PR.

---

## 7. Code review và chất lượng

### Q44. Review PR Flutter: bạn tìm gì ngoài style? [M]

**Trả lời:** Correctness, lifecycle/dispose, async mounted, state scope, error/loading/
empty, key/identity, rebuild/performance, navigation/deep link, accessibility, i18n/theme,
security, test, API contract, migration. Đọc diff theo luồng người dùng; kiểm tra edge case
(xoay màn hình, mất mạng, back, app background).

**Điểm cộng:** yêu cầu test tái hiện bug; đề xuất thay đổi nhỏ, có thể merge; không bắt
viết lại vì sở thích; kiểm tra codegen/generated file.

---

### Q45. Anti-pattern thường gặp và cách refactor? [M]

**Trả lời:**

| Anti-pattern | Hậu quả | Cách sửa |
|---|---|---|
| God widget 800 dòng | Khó test/đọc | Tách screen/body/component |
| Business logic trong UI | Không test được | Đưa vào controller/use case |
| `setState` mọi state | Rebuild rộng, coupling | Local state + state management |
| Singleton mutable | State ẩn, test rò rỉ | DI, scoped provider |
| Hardcode text/color | Không i18n/theme | l10n + token |
| Bắt mọi lỗi rồi nuốt | Khó debug | Map failure, log, rethrow |
| Không dispose | Leak, crash | Dispose controller/subscription |
| `context` sau await | Crash | `mounted`/`context.mounted` |
| `shrinkWrap` khắp nơi | Jank | Sliver/Expanded |
| Test chỉ happy path | Bug production | Thêm error/offline/edge |

Refactor theo từng bước nhỏ, có test bao quanh, không trộn thay đổi hành vi với di chuyển
file.

---

### Q46. Làm sao đo hiệu năng một màn hình? [M]

**Trả lời:** Chạy profile mode trên thiết bị thật; mở DevTools Performance, ghi tương tác;
xem frame chart (UI/raster), thời gian build/layout/paint, số layer, overdraw. Đặt baseline
(p50/p95 frame time), thay đổi một biến, đo lại; dùng `Timeline`/`traceAction` cho flow cụ
thể. Không dùng cảm giác.

**Bẫy:** đo một lần; bỏ qua thiết bị yếu; không tái hiện dữ liệu thật; tối ưu thứ không
nằm trong top frame.

---

### Q47. Viết widget test cho form có validation và submit? [M]

**Trả lời:** Pump widget với fake repository; nhập liệu bằng `enterText`; tap submit; kiểm
tra lỗi hiển thị; sau đó nhập hợp lệ, tap, `pump`, kiểm tra gọi API/trạng thái thành công.
Dùng key/finder ổn định, không phụ thuộc text dịch nếu có thể.

```dart
await tester.enterText(find.byKey(const Key('name')), 'Minh');
await tester.tap(find.byKey(const Key('submit')));
await tester.pump();
expect(find.text('Nhập tên'), findsNothing);
verify(() => repo.send(any())).called(1);
```

**Bẫy:** `pumpAndSettle` với loading vô hạn; find theo text dễ vỡ khi i18n; không test
double-submit; không kiểm tra lỗi API.

---

### Q48. CI chạy test flaky, bạn xử lý thế nào? [M]

**Trả lời:** Tìm nguyên nhân: thời gian thật (`sleep`, network), animation vô hạn, trạng
thái toàn cục giữa test, thứ tự test, font/golden khác môi trường, race do `pump` thiếu.
Cô lập test, dùng fake clock/HTTP, reset singleton, seed random, chạy lặp để tái hiện.
Không retry mù trong CI.

**Bẫy:** tăng timeout che lỗi; bỏ test; chạy song song khi test dùng chung resource; golden
không pin font/engine.

---

### Q49. Làm sao đảm bảo chất lượng trước release? [M]

**Trả lời:** Checklist: analyze/test sạch, build release cả hai nền tảng, test trên thiết
bị thật (mạng yếu, offline, dark mode, font lớn, notch), kiểm tra config/URL, migration DB,
quyền/privacy, deep link/push, crash-free baseline, size budget, store metadata. Có rollback
và feature flag.

**Điểm cộng:** smoke test tự động, staged rollout, monitoring sau release, kế hoạch hotfix.

---

### Q50. Bạn xử lý dependency lỗi thời/xung đột version thế nào? [M]

**Trả lời:** Đọc kỹ `pub deps`/lỗi solver; xác định package chặn; ưu tiên package còn
maintain; dùng `dependency_overrides` tạm thời có issue/ngày hết hạn; nâng SDK/package theo
lộ trình; chạy test sau khi nâng. Không override vô thời hạn.

**Bẫy:** xóa lockfile tùy tiện; nâng tất cả cùng lúc; fork package không theo dõi; bỏ qua
breaking change.

---

## 8. Refactor và tiến hoá kiến trúc

### Q51. Khi nào tách một widget thành component riêng? [M]

**Trả lời:** Khi nó được dùng lại, có state/lifecycle riêng, đủ phức tạp để test độc lập,
hoặc làm screen dễ đọc. Không tách chỉ vì file dài; ưu tiên ranh giới theo trách nhiệm.
Component nhận dữ liệu qua constructor, phát event qua callback, không đọc global state
nếu không cần.

**Bẫy:** tách quá nhỏ tạo prop drilling; component biết quá nhiều về repository; đặt logic
trong widget "dumb".

---

### Q52. Làm sao migrate một màn hình từ setState sang Riverpod/Bloc? [M]

**Trả lời:** (1) Viết test/behavior baseline; (2) tách logic/IO ra repository/controller;
(3) thay state cục bộ bằng provider/bloc, giữ UI dumb; (4) xử lý loading/error/empty;
(5) xóa setState dần; (6) so sánh test và profile. Làm từng màn hình, không big bang.

**Bẫy:** đổi state management và UI cùng lúc; bỏ test cũ; giữ hai nguồn state song song;
không đo regression.

---

### Q53. Bạn chọn giữa package có sẵn và tự viết? [M]

**Trả lời:** Đánh giá: mức độ cần thiết, chi phí tự viết/bảo trì, chất lượng package
(pub points, issue, release gần đây, license), kích thước/native dependency, khả năng
thay thế, bảo mật. Package cho commodity (HTTP, storage) thường tốt; logic domain đặc thù
nên tự viết.

**Bẫy:** thêm package cho một hàm nhỏ; fork không maintain; phụ thuộc package bỏ hoang;
không đọc code trước khi dùng cho auth/security.

---

### Q54. Làm sao giữ kiến trúc không bị xuống cấp khi team tăng? [M]

**Trả lời:** Quy ước rõ (feature-first, dependency rule), lint/CI, template PR, review
checklist, ADR cho quyết định lớn, test, code ownership, định kỳ refactor. Đo bằng số
violation, lead time, bug regression, không chỉ cảm tính.

**Bẫy:** thêm lớp cho "chuẩn" nhưng không ai dùng; tài liệu lỗi thời; review chỉ style;
không có thời gian trả nợ kỹ thuật.

---

### Q55. Xử lý state toàn cục (auth, theme, cart) thế nào? [M]

**Trả lời:** Tách provider/service theo domain, khởi tạo một lần ở app scope, expose state
bất biến + command; UI chỉ đọc phần cần. Auth thay đổi phải invalidate cache/user-scoped
provider; theme dùng `MaterialApp` + `ThemeMode`; cart có thể persist local.

**Bẫy:** một `AppState` khổng lồ; widget đọc toàn bộ state; không clear khi logout; global
mutable không test được.

---

## 9. Câu hỏi bổ sung (cập nhật)

> Bổ sung các chủ đề được hỏi nhiều ở vòng Mid: Riverpod/Bloc nâng cao, normalized cache,
> monorepo, contract test, adaptive UI, quyền/biometric, analytics và performance budget.

**State management nâng cao**

### Q56. `Notifier`/`AsyncNotifier` khác `StateNotifier` thế nào? Có nên dùng codegen? [M]

**Trả lời:** `Notifier` là API Riverpod hiện đại thay `StateNotifier`: state bất biến, method
nghiệp vụ nằm trong notifier, `build()` trả state ban đầu; `AsyncNotifier` trả
`FutureOr<T>` và tự bọc `AsyncValue`. Codegen (`@riverpod`) giảm boilerplate, tạo provider
typed, hỗ trợ family/autoDispose rõ ràng, nhưng thêm `build_runner` và thời gian build.

```dart
@riverpod
class WishList extends _$WishList {
  @override
  Future<List<Wish>> build() => ref.watch(wishRepositoryProvider).load();

  Future<void> approve(String id) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(wishRepositoryProvider).approve(id);
      return ref.read(wishRepositoryProvider).load();
    });
  }
}
```

**Điểm cộng:** `AsyncValue.guard` tránh quên try/catch; không gọi `ref.watch` trong method
async sau khi notifier dispose; chọn codegen theo quy mô team, không theo trend.

---

### Q57. `ref.watch`, `ref.listen`, `ref.read` dùng đúng chỗ thế nào? [M]

**Trả lời:** `watch` trong `build`/provider để rebuild khi dependency đổi; `listen` cho side
effect (snackbar, navigation, analytics) khi giá trị đổi; `read` trong callback/init để đọc
một lần. Trong widget, `ref.listen` đặt trong `build` và không gây rebuild.

```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  ref.listen(authProvider, (prev, next) {
    if (next is LoggedOut) router.go('/login');
  });
  final wishes = ref.watch(wishListProvider);
  return wishes.when(data: ..., loading: ..., error: ...);
}
```

**Bẫy:** `read` trong build rồi kỳ vọng reactive; `watch` trong callback; `listen` trong
`initState` khi chưa có scope; side effect lặp do provider rebuild nhiều lần — cần guard.

---

### Q58. Bloc event transformer và `bloc_concurrency` dùng khi nào? [M]

**Trả lời:** Transformer quyết định cách xử lý event đồng thời: `concurrent` (mặc định),
`sequential` (giữ thứ tự), `droppable` (bỏ event mới khi đang xử lý), `restartable` (huỷ cũ,
chạy mới). Search nên `restartable` + debounce; submit nên `droppable`; hàng đợi đồng bộ nên
`sequential`.

```dart
on<SearchChanged>(
  _onSearch,
  transformer: (events, mapper) =>
      events.debounceTime(const Duration(milliseconds: 350)).switchMap(mapper),
);
on<SubmitWish>(_onSubmit, transformer: droppable());
```

**Bẫy:** debounce ở UI mà không huỷ request cũ; `restartable` làm mất kết quả cần giữ;
transformer sai gây race condition; test bằng `bloc_test` với `wait`/`expect` rõ ràng.

---

### Q59. Dùng `freezed`/sealed union cho UI state thế nào? [M]

**Trả lời:** Mô hình hoá state bằng union thay vì nhiều boolean (`loading`, `error`,
`empty`...) để loại trừ trạng thái không hợp lệ. `freezed` sinh `copyWith`, `==`, `toString`,
pattern matching; UI switch exhaustive.

```dart
@freezed
sealed class WishState with _$WishState {
  const factory WishState.loading() = WishLoading;
  const factory WishState.data(List<Wish> items) = WishData;
  const factory WishState.empty() = WishEmpty;
  const factory WishState.error(String message) = WishError;
}

Widget build() => switch (state) {
  WishLoading() => const CircularProgressIndicator(),
  WishData(:final items) => WishList(items),
  WishEmpty() => const EmptyView(),
  WishError(:final message) => ErrorView(message),
};
```

**Bẫy:** lạm dụng union cho state đơn giản; quên trạng thái `refreshing` khi đã có data; giữ
object lớn trong state; codegen làm chậm CI nếu không cache.

---

### Q60. Optimistic UI là gì? Rollback khi API fail thế nào? [M]

**Trả lời:** Cập nhật UI ngay như thể request thành công, gửi request nền; nếu fail thì
rollback về state trước đó và thông báo. Cần idempotency key, trạng thái `pending`, tránh
double-submit, và xử lý conflict nếu server trả bản mới hơn.

```dart
Future<void> like(Wish wish) async {
  final previous = state;
  state = state.update(wish.id, (w) => w.copyWith(likes: w.likes + 1, pending: true));
  try {
    final updated = await repo.like(wish.id, idempotencyKey: key);
    state = state.replace(updated);
  } catch (_) {
    state = previous;
    messenger.showSnackBar(const SnackBar(content: Text('Không thể thích, thử lại')));
  }
}
```

**Điểm cộng:** không optimistic cho thanh toán/auth; hiển thị pending rõ; test fail/retry;
tránh rollback đè lên thay đổi mới hơn của user khác.

---

### Q61. Normalized cache và invalidation nên thiết kế thế nào? [M]

**Trả lời:** Lưu entity theo `id` trong map (`Map<String, Wish>`), list chỉ giữ id/thứ tự;
selector ghép entity + list để tránh duplicate. Invalidate theo tag/domain/user, xoá khi
logout, TTL cho dữ liệu ít đổi, và reconcile response server thay vì thay cả list.

```dart
final wishesById = <String, Wish>{};
final wishIds = <String>[];

void upsert(Wish w) => wishesById[w.id] = w;
List<Wish> get visible => wishIds.map((id) => wishesById[id]!).toList();
```

**Bẫy:** copy nguyên list mỗi realtime event; cache theo user nhưng dùng chung key; không xoá
cache khi mutation; giữ entity đã xoá (cần tombstone); memory tăng vô hạn.

---

**Kiến trúc, routing và dữ liệu**

### Q62. Feature-first và layer-first khác nhau? Khi nào chọn cách nào? [M]

**Trả lời:** Layer-first chia `data/domain/presentation` toàn app; feature-first chia theo
tính năng (`wish/`, `gallery/`, `auth/`), mỗi feature có layer riêng. App nhỏ đi nhanh với
layer-first; app nhiều team/feature nên feature-first để giảm phụ thuộc chéo và review độc
lập.

```text
lib/
  core/            # network, theme, utils, error
  features/
    wish/
      data/ domain/ presentation/
    gallery/
      data/ domain/ presentation/
  app/             # router, DI, bootstrap
```

**Điểm cộng:** quy tắc phụ thuộc một chiều (feature → core, không feature → feature); dùng
package boundary khi cần enforce; tránh `shared/` thành bãi rác.

---

### Q63. Monorepo nhiều package Flutter nên tổ chức thế nào? [M]

**Trả lời:** Dùng Dart pub workspaces (Dart 3.6+) hoặc Melos; tách `app`, `core`, `design_system`,
`feature_*`, `api_client`. CI chỉ build/test package bị ảnh hưởng; version nội bộ qua path
dependency; quy ước import và lint chung.

```yaml
# pubspec.yaml (root)
name: wedding_workspace
environment:
  sdk: ^3.6.0
workspace:
  - apps/wedding_app
  - packages/design_system
  - packages/api_client
```

**Bẫy:** package phụ thuộc vòng; mỗi package tự pin version lệch nhau; CI chạy toàn bộ mỗi
PR gây chậm; thiếu owner cho package dùng chung.

---

### Q64. Contract testing giữa app và backend nên làm thế nào? [M]

**Trả lời:** Chốt schema (OpenAPI/JSON Schema/protobuf), generate client hoặc validate
response trong test; dùng mock server từ schema cho widget/integration test; chạy contract
test trong CI cả hai repo; version hoá và giữ backward compatibility.

```dart
test('response khớp schema', () async {
  final json = jsonDecode(fixture('wishes_page.json'));
  expect(WishPage.fromJson(json).items, isNotEmpty);
  expect(() => validateAgainstSchema(json), returnsNormally);
});
```

**Điểm cộng:** test lỗi 4xx/5xx, pagination, null/optional field, thay đổi enum; consumer-
driven contract (Pact) khi nhiều client; không chỉ test happy path.

---

### Q65. Thiết kế outbox/offline mutation queue nâng cao thế nào? [M]

**Trả lời:** Ghi mutation và entity trong cùng transaction local; outbox lưu `id`,
`idempotencyKey`, `entityId`, `type`, `payload`, `attempts`, `nextRetryAt`, `state`. Worker
gửi tuần tự theo entity để giữ thứ tự, backoff + jitter, dead-letter sau N lần; crash-safe
vì queue nằm trong DB.

**Điểm cộng:** phân biệt lỗi retryable/permanent; dedupe event realtime; giới hạn outbox;
hiển thị trạng thái đồng bộ; metric (queue depth, oldest age); test kill app giữa transaction.

**Bẫy:** queue trong memory; gửi song song làm sai thứ tự; retry 4xx vô hạn; không có
idempotency key; xoá entity trước khi sync xong.

---

### Q66. `ShellRoute` và `StatefulShellRoute` trong go_router khác nhau? [M]

**Trả lời:** `ShellRoute` bọc các route con trong một shell (bottom nav, sidebar) nhưng không
giữ state từng nhánh. `StatefulShellRoute.indexedStack` giữ navigator/state riêng cho từng
branch, phù hợp bottom navigation nhiều tab.

```dart
StatefulShellRoute.indexedStack(
  builder: (context, state, shell) => ScaffoldWithNav(shell: shell),
  branches: [
    StatefulShellBranch(routes: [GoRoute(path: '/wishes', builder: ...)]),
    StatefulShellBranch(routes: [GoRoute(path: '/gallery', builder: ...)]),
  ],
);
// trong shell: navigationShell.goBranch(index)
```

**Bẫy:** dùng `ShellRoute` rồi tưởng tab giữ state; deep link vào branch chưa init; back
behavior khác nhau giữa Android/iOS; lạm dụng global navigator key.

---

### Q67. Test deep link và deferred deep link thế nào? [M]

**Trả lời:** Test bằng `adb shell am start -a android.intent.action.VIEW -d <url>` và
`xcrun simctl openurl booted <url>`; viết integration test cho cold/warm start; kiểm tra
route không tồn tại, auth, tham số thiếu. Deferred deep link (app chưa cài) cần attribution
SDK/store link, không tự làm bằng Universal Link.

**Điểm cộng:** test universal link verification file trên domain thật; xử lý link khi đang
ở màn hình khác; không đưa token nhạy cảm vào URL; log link đã xử lý để debug.

---

### Q68. GraphQL và REST: chọn cái nào cho mobile? [M]

**Trả lời:** GraphQL giảm over/under-fetching, schema mạnh, codegen type-safe, phù hợp nhiều
màn hình cần dữ liệu khác nhau và backend hỗ trợ tốt. REST đơn giản, cache HTTP tự nhiên,
dễ debug, phù hợp CRUD và team nhỏ. GraphQL có chi phí query complexity, caching khó hơn,
upload/subscription phức tạp.

**Điểm cộng:** đánh giá theo backend hiện có, kỹ năng team, caching/offline, chi phí vận
hành; không chọn GraphQL chỉ vì "hiện đại"; dùng persisted query để giảm payload.

---

### Q69. WebSocket, SSE và polling chọn thế nào? [M]

**Trả lời:** WebSocket hai chiều, độ trễ thấp, hợp chat/collaboration nhưng cần tự quản lý
reconnect/heartbeat/scale. SSE một chiều server→client qua HTTP, tự reconnect, hợp feed/
notification, đơn giản hơn nhưng không gửi ngược. Polling dễ nhất, tốn request, hợp dữ liệu
ít thay đổi hoặc fallback.

**Điểm cộng:** có fallback polling khi WS fail; cursor/last-event-id để không mất event;
backpressure và rate limit; cân nhắc proxy/CDN timeout; đo chi phí pin/radio.

---

### Q70. Upload lớn và download có resume làm thế nào? [M]

**Trả lời:** Upload chia chunk (TUS/signed URL/multipart), lưu offset, retry từ chunk lỗi,
checksum để phát hiện hỏng; download về file tạm rồi rename atomic, hỗ trợ Range request,
progress/cancel, kiểm tra dung lượng trống và mạng. Background transfer có giới hạn theo OS.

**Bẫy:** giữ toàn bộ file trong RAM; không xử lý app bị kill; resume sai offset; không xác
thực URL signed hết hạn; ghi đè file đang dùng; quên dọn file tạm.

---

### Q71. ETag/conditional request và cache HTTP dùng thế nào? [M]

**Trả lời:** Server trả `ETag`/`Last-Modified`; client gửi `If-None-Match`/
`If-Modified-Since`; 304 nghĩa là dùng cache. Kết hợp `Cache-Control` (`max-age`,
`stale-while-revalidate`) và cache key theo user/tenant. Không cache response nhạy cảm.

```dart
final cached = await store.read(key);
final headers = cached?.etag != null ? {'If-None-Match': cached!.etag!} : null;
final res = await dio.get(url, options: Options(headers: headers, validateStatus: (_) => true));
if (res.statusCode == 304) return cached!.data;
```

**Bẫy:** cache lỗi 4xx; không Vary theo auth; dùng `no-store` rồi tự cache; quên invalidate
sau mutation; cache vô hạn gây đầy disk.

---

### Q72. Ghép dữ liệu realtime với list phân trang thế nào? [M]

**Trả lời:** Giữ map `id→item` + thứ tự; mỗi event upsert theo `id` (hoặc `localId`), dedupe
bằng event id/version; sắp xếp theo `seq`/timestamp server; tombstone cho delete; khi
reconnect, fetch gap theo cursor đã lưu. UI dùng key ổn định để không mất state item.

```dart
void onEvent(WishEvent e) {
  if (seen.contains(e.eventId)) return;
  seen.add(e.eventId);
  if (e.deleted) items.remove(e.id); else items.upsert(e.wish);
  items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
}
```

**Bẫy:** append event vào cuối list phân trang gây trùng; dùng timestamp client lệch; mất
event khi reconnect không fetch gap; list nhảy vị trí khi item mới chèn lên đầu.

---

**UI, form, accessibility, localization**

### Q73. Làm UI adaptive cho tablet, foldable và desktop thế nào? [M]

**Trả lời:** Phân biệt **responsive** (co giãn theo không gian) và **adaptive** (thay đổi
component/hành vi theo thiết bị). Dùng breakpoint, `LayoutBuilder`, `NavigationRail`, master-
detail, hỗ trợ bàn phím/chuột, và xử lý foldable qua `MediaQuery.displayFeatures`.

```dart
final width = MediaQuery.sizeOf(context).width;
final nav = width >= 1000 ? NavigationRail(...) : NavigationBar(...);
final body = width >= 720 ? Row(children: [list, detail]) : list;
```

**Bẫy:** chỉ scale font/ảnh lên tablet; bỏ qua landscape/fold; dialog quá rộng trên desktop;
thiếu hover/focus; test trên ít nhất 3 kích thước.

---

### Q74. Rive/Lottie và animation thường: chọn thế nào? [M]

**Trả lời:** Animation đơn giản (fade/slide/scale/hero) dùng widget/`AnimationController` để
nhẹ và dễ test. Lottie (JSON After Effects) hợp illustration ngắn; Rive hợp state machine/
tương tác, nhẹ hơn video nhưng vẫn cần kiểm tra size/CPU. Tránh animation nặng ở màn hình
chính/low-end.

**Điểm cộng:** đo jank bằng profile mode; preload asset; giới hạn loop; tôn trọng
`MediaQuery.disableAnimations`; có fallback tĩnh; không lạm dụng animation gây phân tâm.

---

### Q75. Quản lý form lớn, autosave và khôi phục draft thế nào? [M]

**Trả lời:** Tách controller/field state, chỉ rebuild field thay đổi; validation đồng bộ
trong `FormField`, async validation debounce; dirty tracking; autosave debounce vào local
(secure nếu nhạy cảm) và khôi phục khi resume. Với form dài, dùng `FocusTraversalGroup`,
`AutofillGroup`, và `RestorationMixin` cho process death.

**Bẫy:** `setState` cả form mỗi ký tự; autosave mỗi keystroke gây I/O; lưu draft chứa dữ liệu
nhạy cảm không mã hoá; không phân biệt draft cũ của user khác; submit khi validation async
chưa xong.

---

### Q76. Accessibility nâng cao gồm những gì ngoài `Semantics`? [M]

**Trả lời:** Label/role/action đúng, thứ tự focus hợp lý, tap target ≥48dp, contrast, hỗ trợ
dynamic type, reduced motion, không phụ thuộc màu, caption cho ảnh, và test thật với
TalkBack/VoiceOver. Dùng `Semantics`, `MergeSemantics`, `ExcludeSemantics`,
`SemanticsService.announce` cho thay đổi quan trọng.

**Điểm cộng:** test `meetsGuideline(androidTapTargetGuideline)`,
`labeledTapTargetGuideline`, `textContrastGuideline`; tránh `GestureDetector` không có
semantic action; kiểm tra bàn phím/switch access.

---

### Q77. Theming đa thương hiệu/white-label trong Flutter thế nào? [M]

**Trả lời:** Tách token (màu, spacing, typography, radius, motion) khỏi widget; nhiều
`ThemeData`/`ThemeExtension`, asset theo tenant; cấu hình runtime (remote config) cho logo/
màu nếu cho phép; build flavor cho app store riêng. Design system là nguồn sự thật.

**Bẫy:** hardcode màu/asset; theme bằng cách copy widget; remote theme không validate tương
phản; mỗi tenant một nhánh code; test matrix bùng nổ.

---

### Q78. Localization nâng cao: plural, RTL, format thế nào? [M]

**Trả lời:** Dùng `flutter_localizations` + ARB/`gen_l10n`, ICU cho plural/gender/select;
không nối chuỗi thủ công; format ngày/số/tiền qua `intl`; hỗ trợ RTL bằng `Directionality`
và tránh `left/right` cứng (dùng `start/end`). Có fallback locale và test pseudo-locale.

```json
{
  "wishCount": "{count, plural, =0{Không có lời chúc} =1{Một lời chúc} other{{count} lời chúc}}"
}
```

**Bẫy:** dịch khi build runtime gây chậm; chuỗi ghép sai ngữ pháp; icon mũi tên không lật
RTL; test chỉ tiếng Anh; locale của `DateTime` khác locale app.

---

**Platform, bảo mật và observability**

### Q79. App lifecycle và background execution trên mobile có giới hạn gì? [M]

**Trả lời:** App không chạy nền vô hạn: Android có Doze/App Standby, giới hạn background
service; iOS suspend app sau thời gian ngắn. Dùng WorkManager/BGTaskScheduler cho tác vụ
hoãn, push để đánh thức, sync khi resume; không dựa vào timer nền cho logic quan trọng.
Kiểm tra trạng thái khi quay lại foreground.

**Bẫy:** giả định socket sống khi nền; chạy sync nặng trong `paused`; bỏ qua battery
optimization; không xử lý app bị kill; dùng background location vô tội vạ gây reject store.

---

### Q80. Local notification: schedule và deep link thế nào? [M]

**Trả lời:** Dùng `flutter_local_notifications`, xin quyền (Android 13+, iOS), tạo channel
Android, `zonedSchedule` với timezone chính xác, payload chứa route/id để mở đúng màn hình;
huỷ/reschedule khi user đổi lịch; test cả app foreground/background/killed.

**Bẫy:** dùng `DateTime.now()` local mà không set timezone; notification không hiện do thiếu
quyền/channel; payload chứa dữ liệu nhạy cảm; schedule trùng sau reinstall; không dọn
notification cũ.

---

### Q81. Thiết kế luồng xin quyền (camera, notification) thế nào? [M]

**Trả lời:** Xin quyền đúng ngữ cảnh (khi user bấm chụp, không phải lúc mở app), giải thích
lợi ích trước, xử lý `denied`/`permanentlyDenied` bằng hướng dẫn mở Settings, không chặn
tính năng cốt lõi. iOS có limited photo access; Android có "chỉ lần này".

**Điểm cộng:** theo dõi tỉ lệ grant; test từ chối; có fallback nhập tay/chọn ảnh; không xin
hàng loạt quyền lúc onboarding; tôn trọng privacy manifest.

---

### Q82. Lưu token và dùng biometric đúng cách? [M]

**Trả lời:** Token lưu `flutter_secure_storage` (Keychain/Keystore), cân nhắc access control
khi mở khoá bằng biometric; không lưu secret trong prefs/DB thường; token ngắn hạn + refresh,
revoke khi logout, xoá khi đổi user. `local_auth` chỉ là tiện ích mở khoá — server vẫn phải
authorize.

```dart
const storage = FlutterSecureStorage(
  aOptions: AndroidOptions(encryptedSharedPreferences: true),
  iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
);
```

**Bẫy:** log token; backup token lên cloud; biometric thay thế auth server; không xử lý
thiết bị đổi passcode; giữ token cũ sau logout; dùng `shared_preferences` cho secret.

---

### Q83. Thiết kế analytics event taxonomy và consent thế nào? [M]

**Trả lời:** Quy ước tên event `object_action` (ví dụ `wish_submitted`), property có kiểu và
version, không gửi PII; có lớp wrapper để đổi provider dễ; consent theo vùng (GDPR), opt-out,
debug mode không gửi production; validate schema trước khi ship.

**Điểm cộng:** danh mục event có owner/tài liệu; sampling; dashboard funnel; tránh event
explosion; test event trong widget test; xoá dữ liệu theo yêu cầu.

---

### Q84. Crash reporting và breadcrumb nên cấu hình thế nào? [M]

**Trả lời:** Tích hợp Crashlytics/Sentry, upload symbol/mapping cho release, bật non-fatal
cho lỗi nghiệp vụ quan trọng, breadcrumb (navigation, API status, feature flag) không chứa
PII; set user id đã hash; phân loại crash theo version/thiết bị; alert theo crash-free rate.

**Bẫy:** obfuscate không upload symbol; log request body; report lỗi expected gây nhiễu; không
test crash ở release; thiếu version/build number trong report.

---

### Q85. Performance budget và chống regression thế nào? [M]

**Trả lời:** Đặt ngân sách đo được: startup p95, frame p95, jank %, size, memory, API latency;
đo trên thiết bị đại diện với dữ liệu thật; lưu baseline; chạy benchmark/integration test
trong CI nếu khả thi; alert khi vượt ngưỡng; review performance trong PR lớn.

**Điểm cộng:** không tối ưu khi chưa có baseline; đo trước/sau cùng điều kiện; tách mét
theo màn hình; theo dõi long-term; gắn budget với release checklist.

---

## 10. Tài liệu tham khảo

- Flutter architecture: https://docs.flutter.dev/resources/architectural-overview
- State management: https://docs.flutter.dev/data-and-backend/state-mgmt
- go_router: https://pub.dev/packages/go_router
- Riverpod: https://riverpod.dev/
- Bloc: https://bloclibrary.dev/
- Drift: https://drift.simonbinder.eu/
- Flutter performance: https://docs.flutter.dev/perf
- Flutter testing: https://docs.flutter.dev/testing

---

*Tiếp tục với [`03-advanced.md`](./03-advanced.md) để luyện câu hỏi Senior.*
