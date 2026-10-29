# Flutter nâng cao — Kiến trúc, state, offline và vận hành

> Dành cho app wedding guestbook đã chạy được bản cơ bản. Mục tiêu: tách lớp rõ ràng,
> chọn state management có kỷ luật, cache offline, tối ưu hiệu năng và đưa được app
> vào CI. Code dùng Dart 3.4+/Flutter 3.24 stable; package ghi kèm version đã kiểm tra.

---

## Mục lục

1. [Kiến trúc và luồng dữ liệu](#1-kiến-trúc-và-luồng-dữ-liệu)
2. [Riverpod](#2-riverpod)
3. [Bloc và Cubit](#3-bloc-và-cubit)
4. [Dependency injection](#4-dependency-injection)
5. [Routing và deep link với go_router](#5-routing-và-deep-link-với-go_router)
6. [Dio, interceptor và xử lý lỗi](#6-dio-interceptor-và-xử-lý-lỗi)
7. [Model, freezed và json_serializable](#7-model-freezed-và-json_serializable)
8. [Offline-first với Drift](#8-offline-first-với-drift)
9. [Đồng bộ, conflict và retry queue](#9-đồng-bộ-conflict-và-retry-queue)
10. [Hiệu năng và rebuild](#10-hiệu-năng-và-rebuild)
11. [Isolate và platform channel](#11-isolate-và-platform-channel)
12. [Background task và lifecycle](#12-background-task-và-lifecycle)
13. [Bảo mật mobile](#13-bảo-mật-mobile)
14. [Testing nâng cao](#14-testing-nâng-cao)
15. [CI/CD với GitHub Actions](#15-cicd-với-github-actions)
16. [Accessibility và i18n](#16-accessibility-và-i18n)
17. [Observability](#17-observability)
18. [Anti-patterns nâng cao](#18-anti-patterns-nâng-cao)
19. [Capstone và tài liệu tham khảo](#19-capstone-và-tài-liệu-tham-khảo)

---

## 1. Kiến trúc và luồng dữ liệu

App nhỏ vẫn nên có **một chiều phụ thuộc**: presentation → domain ← data. Domain không
biết Flutter, HTTP hay SQLite; nhờ vậy test nhanh và thay backend không đụng UI.

| Lớp | Chứa gì | Không được chứa |
|---|---|---|
| Presentation | Widget, controller/notifier, route | SQL, `Dio`, JSON key |
| Domain | Entity, repository interface, use case | `BuildContext`, package I/O |
| Data | API client, DTO, database, mapper | Widget, `setState` |
| Core | Theme, l10n, logging, network, DI | Logic riêng của feature |

Feature-first thay vì layer-first để một feature có thể xóa/ship độc lập:

```text
lib/
├── app/                 # bootstrap, router, theme
├── core/                # dio, database, logger, l10n
└── features/guestbook/  # data, domain, presentation
```

Luồng chuẩn của guestbook:

1. **Đọc**: UI watch stream từ repository → repository đọc Drift → UI render ngay cả khi offline.
2. **Refresh**: gọi `GET /api/messages/` → upsert vào Drift → stream tự phát lại.
3. **Gửi**: enqueue outbox → gọi `POST /api/messages` → server broadcast `new_message`.
4. **Realtime**: `/ws` đẩy event → repository upsert/xóa trong Drift → UI cập nhật.
5. **Lỗi**: data layer map lỗi thành `ApiFailure`; presentation quyết định retry/UI.

> 💡 Một nguồn sự thật duy nhất (single source of truth) là **database local**, không
> phải list trong widget. Nhờ vậy REST, WebSocket và cache không tranh nhau update UI.

---

## 2. Riverpod

Riverpod 2.x (`flutter_riverpod: ^2.5.1`) phù hợp guestbook: compile-safe, không cần
`BuildContext`, override dễ trong test. Bọc app bằng `ProviderScope`:
`runApp(const ProviderScope(child: WeddingApp()));`

Khai báo provider theo vai trò, tránh một provider ôm toàn bộ app:

```dart
final messageRepositoryProvider = Provider<MessageRepository>((ref) {
  final repository = DriftMessageRepository(
    api: ref.watch(messageApiProvider),
    db: ref.watch(databaseProvider),
    socket: ref.watch(socketProvider),
  );
  ref.onDispose(repository.dispose);
  return repository;
});

final wishesProvider = StreamProvider.autoDispose<List<Wish>>((ref) {
  return ref.watch(messageRepositoryProvider).watchMessages();
});
```

`autoDispose` giải phóng stream khi rời screen; `keepAlive` chỉ dùng khi thật cần giữ
state (ví dụ giỏ hàng — guestbook không cần). UI đọc `AsyncValue` và xử lý đủ ba nhánh:

```dart
class GuestbookScreen extends ConsumerWidget {
  const GuestbookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishes = ref.watch(wishesProvider);
    return wishes.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => ErrorRetry(
        message: '$error',
        onRetry: () => ref.invalidate(wishesProvider),
      ),
      data: (items) => WishList(items: items),
    );
  }
}
```

Gọi action qua `ref.read` trong callback (không `watch`) và bọc `try/catch` để hiện
`SnackBar` khi gửi thất bại.

Quy tắc chọn provider:

| Nhu cầu | Dùng |
|---|---|
| Giá trị bất biến, dependency | `Provider` |
| State async có thể ghi | `AsyncNotifierProvider` |
| Stream realtime | `StreamProvider` |
| Tham số hóa (chi tiết wish) | `.family` |

> ⚠️ Riverpod 3 thay đổi một số API (`Notifier`, retry, offline persistence). Nếu nâng
> major version, đọc migration guide và khóa version trong `pubspec.yaml` trước.

---

## 3. Bloc và Cubit

Bloc phù hợp team quen event-driven hoặc cần audit trail. Cubit gọn hơn cho guestbook.
State nên là `sealed class` để `switch` exhaustive:

```dart
sealed class GuestbookState { const GuestbookState(); }
final class GuestbookLoading extends GuestbookState { const GuestbookLoading(); }
final class GuestbookLoaded extends GuestbookState {
  const GuestbookLoaded(this.wishes);
  final List<Wish> wishes;
}
final class GuestbookFailure extends GuestbookState {
  const GuestbookFailure(this.message);
  final String message;
}

class GuestbookCubit extends Cubit<GuestbookState> {
  GuestbookCubit(this._repository) : super(const GuestbookLoading());
  final MessageRepository _repository;

  Future<void> load() {
    emit(const GuestbookLoading());
    return emit.forEach(
      _repository.watchMessages(),
      onData: GuestbookLoaded.new,
      onError: (error, _) => GuestbookFailure('$error'),
    );
  }
}
```

Với Bloc đầy đủ, event là input, state là output; không gọi repository trực tiếp từ UI:

```dart
sealed class GuestbookEvent { const GuestbookEvent(); }
final class GuestbookStarted extends GuestbookEvent { const GuestbookStarted(); }
final class WishSubmitted extends GuestbookEvent {
  const WishSubmitted(this.draft);
  final WishDraft draft;
}

class GuestbookBloc extends Bloc<GuestbookEvent, GuestbookState> {
  GuestbookBloc(this._repository) : super(const GuestbookLoading()) {
    on<GuestbookStarted>((event, emit) => emit.forEach(
          _repository.watchMessages(),
          onData: GuestbookLoaded.new,
          onError: (error, _) => GuestbookFailure('$error'),
        ));
    on<WishSubmitted>((event, emit) => _repository.send(event.draft));
  }
  final MessageRepository _repository;
}
```

| Tiêu chí | Riverpod | Bloc/Cubit |
|---|---|---|
| Boilerplate | Thấp | Trung bình–cao |
| Test | Override provider | `blocTest` |
| Team | Thích functional/DI | Thích event rõ ràng |
| Guestbook | ✅ Khuyến nghị | ✅ Nếu team đã dùng |

Chọn **một** hướng; không bọc Bloc trong Riverpod provider rồi vẫn `setState` song song.

---

## 4. Dependency injection

Riverpod đã là DI container: provider tạo instance, `ref.onDispose` dọn tài nguyên,
override thay thế trong test. Không cần `get_it` cho app cỡ này.

```dart
final messageApiProvider = Provider<MessageApi>((ref) => MessageApi(ref.watch(dioProvider)));
```

Quy ước vòng đời:

| Đối tượng | Vòng đời | Dọn bằng |
|---|---|---|
| `Dio`, `ApiClient` | App | `ref.onDispose(() => dio.close())` |
| `AppDatabase` | App | `db.close()` |
| Repository | App hoặc screen | `dispose()` socket/subscription |
| Controller/Notifier | Screen (`autoDispose`) | `ref.onDispose` |

Nếu buộc phải dùng service locator, đăng ký một lần trong `main()` và **không** đọc
trong `build()`. Lạm dụng `GetIt.I<X>()` khắp nơi làm test phải reset global state và
che giấu dependency thật.

> 💡 Constructor injection vẫn là cách rõ nhất: `WishCard({required this.onTap})` dễ
> test hơn widget tự tìm service toàn cục.

---

## 5. Routing và deep link với go_router

`go_router: ^14.2.0` hỗ trợ deep link, redirect và nested route. Router là provider để
auth thay đổi thì redirect cập nhật:

```dart
final routerProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(sessionProvider);
  return GoRouter(
    redirect: (context, state) {
      final adminRoute = state.matchedLocation.startsWith('/admin');
      if (adminRoute && !session.isAdmin) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const GuestbookScreen()),
      GoRoute(
        path: '/wish/:id',
        builder: (_, state) => WishDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(path: '/rsvp', builder: (_, __) => const RsvpScreen()),
      GoRoute(path: '/admin', builder: (_, __) => const ModerationScreen()),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
});
```

Bọc `MaterialApp.router(routerConfig: ref.watch(routerProvider), theme: buildTheme())`
trong một `ConsumerWidget`; router tự rebuild khi session đổi.

Deep link cần cấu hình native, không chỉ route:

- **Android**: `<intent-filter>` với `VIEW`/`BROWSABLE`, host `wedding.example.com`,
  và `android:autoVerify="true"` cho App Links.
- **iOS**: Associated Domains `applinks:wedding.example.com` + file
  `apple-app-site-association` trên domain.
- **Web**: bật path URL strategy để `/wish/42` không thành `/#/wish/42`.
- **Fallback**: nếu id không tồn tại, hiển thị empty state thay vì crash.

`state.extra` chỉ dùng cho object tạm trong session; deep link từ ngoài luôn chỉ có
path/query, nên screen phải tự fetch theo `id`.

> ⚠️ Đừng dùng `Navigator.push` song song `go_router` cho cùng màn hình. Chọn router
> làm nguồn sự thật, trừ dialog/bottom sheet.

---

## 6. Dio, interceptor và xử lý lỗi

`dio: ^5.7.0` cho interceptor, timeout, cancel và upload progress. Cấu hình một lần:

```dart
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL',
        defaultValue: 'http://10.0.2.2:3000'),
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 10),
    headers: const {'Accept': 'application/json'},
  ));
  dio.interceptors.add(RetryInterceptor(dio));
  if (kDebugMode) {
    dio.interceptors.add(LogInterceptor(requestBody: false, responseBody: false));
  }
  ref.onDispose(() => dio.close());
  return dio;
});
```

Chỉ retry request **idempotent** (GET); POST lặp có thể tạo lời chúc trùng vì backend
chưa có idempotency key:

```dart
class RetryInterceptor extends Interceptor {
  RetryInterceptor(this._dio);
  final Dio _dio;

  @override
  void onError(DioException error, ErrorInterceptorHandler handler) async {
    final options = error.requestOptions;
    final attempt = (options.extra['attempt'] as int?) ?? 0;
    final status = error.response?.statusCode ?? 0;
    final retryable = options.method == 'GET' &&
        attempt < 2 &&
        (status == 0 || status >= 500);
    if (!retryable) return handler.next(error);

    await Future<void>.delayed(Duration(milliseconds: 300 * (1 << attempt)));
    options.extra['attempt'] = attempt + 1;
    try {
      handler.resolve(await _dio.fetch(options));
    } on DioException catch (next) {
      handler.next(next);
    }
  }
}
```

Map lỗi ở data layer, không để `DioException` rò rỉ vào UI:

```dart
sealed class ApiFailure implements Exception {
  const ApiFailure(this.message, {this.statusCode});
  final String message;
  final int? statusCode;
}
final class NetworkFailure extends ApiFailure {
  const NetworkFailure() : super('Không có kết nối mạng');
}
final class ServerFailure extends ApiFailure {
  const ServerFailure(super.message, {super.statusCode});
}
ApiFailure mapDioError(DioException error) => switch (error.type) {
      DioExceptionType.connectionError ||
      DioExceptionType.connectionTimeout =>
        const NetworkFailure(),
      DioExceptionType.badResponse => ServerFailure(
          _serverMessage(error.response?.data) ?? 'Máy chủ trả lỗi',
          statusCode: error.response?.statusCode,
        ),
      _ => const ServerFailure('Không gửi được lời chúc'),
    };

String? _serverMessage(Object? body) =>
    body is Map<String, dynamic> ? body['error']?.toString() : null;
```

Hủy request khi rời screen bằng `CancelToken`; đóng token trong `dispose`. Với upload
ảnh cưới (nếu mở rộng), dùng `onSendProgress` và giới hạn kích thước **trước** khi gửi.

---

## 7. Model, freezed và json_serializable

Backend trả `snake_case`, `id` dạng number và `created_at` ISO-8601. Dùng
`freezed: ^2.5.7` + `json_serializable: ^6.8.0` để giảm code tay:

```dart
@freezed
class Wish with _$Wish {
  const factory Wish({
    @JsonKey(fromJson: _idFromJson) required String id,
    @JsonKey(name: 'sender_name') required String senderName,
    required String content,
    @JsonKey(name: 'will_attend') @Default(false) bool willAttend,
    @JsonKey(name: 'guest_of') @Default('Khách') String guestOf,
    @JsonKey(name: 'number_attend') @Default(0) int numberAttend,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _Wish;

  factory Wish.fromJson(Map<String, dynamic> json) => _$WishFromJson(json);
}

String _idFromJson(Object? value) => value.toString();
```

Tách `WishDraft` (chỉ field ghi) để không gửi `id`/`created_at` lên server; khai báo
tương tự với `@freezed`. Chạy codegen: `dart run build_runner build
--delete-conflicting-outputs` (hoặc `watch` khi đang code).

Commit file `*.freezed.dart`/`*.g.dart` nếu CI không chạy codegen; nếu chạy, thêm bước
`build_runner build` trước `analyze`. Không sửa file generated bằng tay.

`DateTime` mặc định parse ISO và giữ UTC; khi hiển thị mới `toLocal()`:

```dart
final label = DateFormat('HH:mm · dd/MM/yyyy').format(wish.createdAt.toLocal());
```

> 💡 Với response lỗi hoặc field mới, `@Default` giúp app cũ không crash. Nhưng đừng
> nuốt lỗi schema: log field lạ ở môi trường debug để phát hiện backend đổi contract.

---

## 8. Offline-first với Drift

`drift: ^2.18.0` + `sqlite3_flutter_libs` cho query type-safe và stream tự cập nhật:

```dart
@DataClassName('WishRow')
class Wishes extends Table {
  TextColumn get id => text()();
  TextColumn get senderName => text().named('sender_name')();
  TextColumn get content => text()();
  BoolColumn get willAttend => boolean().withDefault(const Constant(false))();
  TextColumn get guestOf => text().named('guest_of')();
  IntColumn get numberAttend => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime().named('created_at')();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [Wishes, PendingOps], daos: [WishDao])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.e);
  @override
  int get schemaVersion => 1;
}
```

DAO trả stream đã sort, và upsert theo batch:

```dart
@DriftAccessor(tables: [Wishes])
class WishDao extends DatabaseAccessor<AppDatabase> with _$WishDaoMixin {
  WishDao(super.db);

  Stream<List<Wish>> watchAll() => (select(wishes)
        ..orderBy([(row) => OrderingTerm.desc(row.createdAt)]))
      .watch()
      .map((rows) => rows.map(_toDomain).toList());

  Future<void> upsertAll(Iterable<Wish> items) => batch((batch) {
        batch.insertAllOnConflictUpdate(
          wishes,
          items.map((wish) => WishesCompanion.insert(
                id: wish.id,
                senderName: wish.senderName,
                content: wish.content,
                willAttend: Value(wish.willAttend),
                guestOf: wish.guestOf,
                numberAttend: Value(wish.numberAttend),
                createdAt: wish.createdAt,
              )),
        );
      });
}

Wish _toDomain(WishRow r) => Wish(
    id: r.id, senderName: r.senderName, content: r.content,
    willAttend: r.willAttend, guestOf: r.guestOf,
    numberAttend: r.numberAttend, createdAt: r.createdAt);
```

Repository cache-first:

```dart
class DriftMessageRepository implements MessageRepository {
  DriftMessageRepository({required this.api, required this.db});
  final MessageApi api;
  final AppDatabase db;

  @override
  Stream<List<Wish>> watchMessages() => db.wishDao.watchAll();

  @override
  Future<void> refresh({String? before}) async =>
      db.wishDao.upsertAll(await api.fetchMessages(before: before));
}
```

Mở database bằng `LazyDatabase` để I/O không chặn UI isolate:

```dart
final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase(LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    return NativeDatabase.createInBackground(
      File(p.join(dir.path, 'guestbook.sqlite')),
    );
  }));
  ref.onDispose(db.close);
  return db;
});
```

Chiến lược cache:

| Dữ liệu | Cache | TTL |
|---|---|---|
| Danh sách lời chúc | Drift, đầy đủ | Không hết hạn, refresh khi mở app |
| Tên khách, cờ onboarding | `shared_preferences` | Vô hạn |
| Token/admin session | `flutter_secure_storage` | Theo token |

> ⚠️ Đừng cache lỗi thành empty list. Nếu refresh fail, giữ dữ liệu cũ và hiển thị banner
> "Đang offline — dữ liệu có thể chưa mới nhất" thay vì xóa trắng màn hình.

---

## 9. Đồng bộ, conflict và retry queue

Ghi khi offline cần **outbox**: lưu ý định trước, gửi sau. Bảng `PendingOps`:

```dart
class PendingOps extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get kind => text()();          // create | update | delete
  TextColumn get payload => text()();       // JSON
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  DateTimeColumn get nextAttemptAt => dateTime()();
}
```

Xử lý tuần tự, dừng khi gặp lỗi mạng để giữ thứ tự (dùng cờ `_flushing` để tránh chạy
song song):

```dart
Future<void> flushOutbox() async {
  for (final op in await _db.pendingDao.dueOps()) {
    try {
      await _execute(op);
      await _db.pendingDao.remove(op.id);
    } on ApiFailure {
      await _db.pendingDao.markAttempt(op.id, _backoff(op.attempts + 1));
      return;
    }
  }
}

Duration _backoff(int attempts) => Duration(
      seconds: math.min(300, math.pow(2, attempts).toInt()),
    );
```

`_execute(op)` switch theo `kind`; `pendingDao` là DAO của `PendingOps`.

Backend hiện **không có idempotency key**, nên POST retry sau timeout có thể tạo bản ghi
trùng. Cách giảm rủi ro:

1. Sau timeout, gọi `GET /api/messages/` và tìm bản ghi khớp `sender_name` + `content`
   trong 2 phút gần nhất trước khi retry.
2. Chỉ retry khi lỗi mạng rõ ràng; không retry khi server đã trả 4xx.
3. Ghi `client_generated_id` vào payload nếu backend được nâng cấp để dedupe.

Conflict của guestbook là **last-write-wins** theo `id`: PUT của admin thắng, delete tạo
tombstone local để refresh không làm tin đã xóa sống lại. Nếu nhiều thiết bị cùng sửa,
cần `updated_at`/version từ server; đừng tự bịa conflict resolution khi backend chưa hỗ trợ.

Theo dõi connectivity bằng `connectivity_plus: ^6.0.3`; có mạng thì `flushOutbox` và
`refresh`. Connectivity chỉ báo loại mạng, không đảm bảo internet — vẫn kiểm tra request.

---

## 10. Hiệu năng và rebuild

Jank thường đến từ rebuild rộng, image decode lớn và layout phức tạp — không phải từ
Flutter engine. Đo bằng DevTools Performance, bật "Track widget builds".

```dart
// Chỉ rebuild badge khi số lượng đổi, không rebuild cả list.
final count = ref.watch(
  wishesProvider.select((value) => value.valueOrNull?.length ?? 0),
);
```

Checklist tối ưu:

- `const` cho widget tĩnh; tách widget nhỏ để rebuild cục bộ.
- `ListView.builder` + `itemExtent`/`prototypeItem` nếu card cùng chiều cao.
- `RepaintBoundary` quanh animation hoặc card phức tạp, nhưng đừng bọc mọi item.
- Ảnh: `cacheWidth`/`cacheHeight` theo kích thước hiển thị, dùng `cached_network_image`.
- Tránh `Opacity` lặp lại; dùng `AnimatedOpacity`/`FadeTransition` hoặc màu alpha.
- Không `shrinkWrap: true` cho list dài; tránh `IntrinsicHeight` trong list.
- Kiểm tra trên **profile mode** và thiết bị thật thấp cấp, không chỉ debug.

| Triệu chứng | Nguyên nhân thường gặp | Công cụ |
|---|---|---|
| Scroll giật | Decode ảnh lớn, rebuild item | Performance overlay |
| Mất frame khi mở form | Keyboard + layout lớn | Timeline, rebuild stats |
| Chậm startup | Nhiều plugin khởi tạo đồng bộ | `flutter run --trace-startup` |

> 💡 Với tiệc cưới, slideshow trên tablet là màn hình rủi ro nhất: ảnh 4K + animation.
> Resize ảnh trước khi upload và giới hạn cache là cách rẻ nhất để ổn định.

---

## 11. Isolate và platform channel

JSON lớn, parse/export danh sách khách, hoặc hash ảnh có thể đẩy sang isolate:

```dart
final wishes = await Isolate.run(() => parseWishes(rawJson));
```

`Isolate.run` copy dữ liệu qua message; closure không được capture `BuildContext` hay
object không gửi được. Trên web, isolate bị giới hạn — code phải vẫn chạy (có thể
fallback cùng isolate). `compute()` là wrapper cũ, vẫn dùng được cho hàm top-level.

Platform channel khi plugin chưa có hoặc cần API nội bộ:

```dart
const _channel = MethodChannel('wedding/native');

Future<String?> installSource() async {
  try {
    return await _channel.invokeMethod<String>('installSource');
  } on PlatformException catch (error) {
    debugPrint('installSource failed: ${error.code}');
    return null;
  } on MissingPluginException {
    return null; // widget test hoặc nền tảng chưa hỗ trợ
  }
}
```

Native side đăng ký `MethodChannel` trong `configureFlutterEngine` của `MainActivity`.
Quy tắc: channel name có prefix app, method trả `notImplemented` thay vì crash, luôn
timeout ở phía Dart nếu native có thể treo. Với surface lớn (nhiều method/struct), dùng
**Pigeon** để generate binding type-safe thay vì viết tay string.

---

## 12. Background task và lifecycle

Socket và refresh chỉ nên chạy khi app foreground. `AppLifecycleListener` (Flutter
3.13+) gọn hơn `WidgetsBindingObserver`:

```dart
late final AppLifecycleListener _lifecycle;

@override
void initState() {
  super.initState();
  _lifecycle = AppLifecycleListener(
    onResume: () => ref.read(messageRepositoryProvider).resume(),
    onPause: () => ref.read(messageRepositoryProvider).pause(),
  );
}

@override
void dispose() {
  _lifecycle.dispose();
  super.dispose();
}
```

`resume()` nên reconnect WebSocket **và** refetch để bù event bị lỡ; `pause()` đóng
socket, hủy timer. Không giữ reconnect timer chạy khi background — iOS sẽ kill.

Đồng bộ định kỳ nền:

- **Android**: `workmanager` (khoảng 15 phút, bị Doze điều chỉnh) hoặc foreground
  service nếu thật cần realtime liên tục (không phù hợp guestbook).
- **iOS**: `BGAppRefreshTask` không đảm bảo thời điểm; chỉ dùng để dọn outbox.
- **Push**: FCM data message có thể đánh thức app ngắn, nhưng không đảm bảo; luôn có
  fallback refresh khi mở app.

Task nền chỉ nên gọi `flushOutbox()` idempotent, không mở UI hay giữ socket.

---

## 13. Bảo mật mobile

| Rủi ro | Giảm thiểu |
|---|---|
| Nghe lén HTTP | Chỉ HTTPS/WSS production; cleartext chỉ debug manifest |
| Token bị đọc | `flutter_secure_storage`, không log token |
| Secret trong app | Không nhúng API key admin; `--dart-define` không phải secret |
| Debug log lộ dữ liệu khách | Tắt verbose log ở release, redact tên/nội dung |
| Screenshot màn hình admin | `FLAG_SECURE` (Android), che khi background (iOS) |
| MITM | Certificate pinning có kế hoạch rotation; cân nhắc trước khi bật |
| Backend hở | Hiện `/api/messages` không auth; không ship màn hình xóa/sửa cho guest |

Không đặt `SUPABASE_KEY`, mật khẩu admin hay signing secret trong `--dart-define`: giá
trị vẫn nằm trong binary. Thao tác quản trị phải qua backend có auth hoặc chỉ chạy nội bộ.

Log an toàn, không in body vì có thể chứa tên khách và lời chúc:

```dart
void logApiError(DioException error) => debugPrint(
    'API ${error.requestOptions.path} → ${error.response?.statusCode}');
```

Chỉ bật certificate pinning khi có quy trình rotate pin trước khi hết hạn; pin sai làm
**toàn bộ** app không kết nối được. Chưa có quy trình thì dùng TLS chuẩn + HSTS.

---

## 14. Testing nâng cao

Kim tự tháp: nhiều unit test data/domain, widget test cho state quan trọng, ít
integration test. Với dependency lớn, dùng `mocktail` thay fake viết tay:

```dart
class MockMessageRepository extends Mock implements MessageRepository {}

test('wishesProvider trả dữ liệu từ repository', () async {
  final repository = MockMessageRepository();
  when(() => repository.watchMessages())
      .thenAnswer((_) => Stream.value([sampleWish]));
  final container = ProviderContainer(overrides: [
    messageRepositoryProvider.overrideWithValue(repository),
  ]);
  addTearDown(container.dispose);

  final wishes = await container.read(wishesProvider.future);
  expect(wishes.single.senderName, 'Ngọc Anh');
});
```

Widget test với `ProviderScope` override, kiểm tra cả loading/error:

```dart
testWidgets('hiện lỗi và nút thử lại', (tester) async {
  await tester.pumpWidget(ProviderScope(
    overrides: [
      wishesProvider.overrideWith((ref) => Stream.error(const NetworkFailure())),
    ],
    child: const MaterialApp(home: GuestbookScreen()),
  ));
  await tester.pump();

  expect(find.text('Không có kết nối mạng'), findsOneWidget);
  expect(find.text('Thử lại'), findsOneWidget);
});
```

Bổ sung:

- `bloc_test` cho chuỗi state: `expect: () => [isA<GuestbookLoading>(), isA<GuestbookLoaded>()]`.
- Golden test cho `WishCard` ở text scale 1.0/1.3/2.0 (dùng `matchesGoldenFile`).
- Integration test chạy backend local, gửi lời chúc và chờ WS cập nhật.
- `flutter test --coverage`, đặt ngưỡng thực tế (data/domain ≥70%, toàn app không cần 100%).

| Loại | Chạy khi | Thời gian | Phạm vi |
|---|---|---|---|
| Unit | Mỗi save/CI | < 1s/test | Mapper, notifier, validation |
| Widget | CI | Vài giây | Form, list, error/empty |
| Golden | PR UI | Vài giây | Layout/theme |
| Integration | Trước release | Phút | API + WS + navigation |

---

## 15. CI/CD với GitHub Actions

Pipeline tối thiểu: format → analyze → test → build debug. Build release cần secret
signing, tách job và chỉ chạy trên tag.

```yaml
name: flutter-ci
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: {channel: stable, flutter-version: 3.24.x, cache: true}
      - run: flutter pub get
      - run: dart format --output=none --set-exit-if-changed .
      - run: flutter analyze
      - run: flutter test --coverage
```

Upload `coverage/lcov.info` làm artifact nếu cần báo cáo. Nếu dùng `freezed`/`drift`,
thêm `build_runner build` trước `analyze` (hoặc commit generated file). Cache `~/.pub-cache`
và `concurrency` giúp giảm thời gian/tránh đốt runner cho commit cũ.

CD gợi ý:

| Nhánh/tag | Hành động |
|---|---|
| PR | Analyze + test + build APK debug |
| `main` | Build internal (Firebase App Distribution/TestFlight) |
| `v*` | Build AAB/IPA release, tạo GitHub Release, upload store |

Không commit keystore. Dùng GitHub Secrets + base64 decode trong bước build, hoặc
`fastlane match` cho iOS. Chi tiết signing ở [`flutter-production.md`](./flutter-production.md).

---

## 16. Accessibility và i18n

Guestbook có khách lớn tuổi và ánh sáng tiệc yếu — accessibility là yêu cầu thật:

- Tap target ≥48dp; không đặt icon 24dp không padding.
- Text scale: kiểm tra 1.3 và 2.0, tránh `Row` vỡ bằng `Flexible`/`Wrap`.
- Tương phản ≥4.5:1 cho text thường; không dùng vàng nhạt trên nền trắng.
- `Semantics` cho icon-only; `ExcludeSemantics` khi label đã đủ nghĩa.
- Thứ tự focus hợp lý; form có `textInputAction` và `autofillHints`.
- Không truyền đạt trạng thái chỉ bằng màu (RSVP ✓ kèm text).

```dart
Semantics(
  button: true,
  label: 'Gửi lời chúc',
  child: FilledButton(
    onPressed: _sending ? null : _submit,
    child: ExcludeSemantics(
      child: _sending
          ? const SizedBox.square(
              dimension: 18, child: CircularProgressIndicator(strokeWidth: 2))
          : const Text('Gửi'),
    ),
  ),
)
```

i18n với `flutter_localizations` + `intl`:

```yaml
# l10n.yaml
arb-dir: lib/l10n
template-arb-file: app_vi.arb
output-localization-file: app_localizations.dart
```

```json
{"@@locale": "vi", "appTitle": "Sổ lưu bút",
 "guestCount": "{count, plural, =0{Khách} other{{count} khách}}"}
```

```dart
MaterialApp(
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
)
```

Đừng ghép chuỗi `'$count khách'` trong code; plural/giới từ khác nhau theo ngôn ngữ.
Với tiếng Việt, dùng `DateFormat.yMMMMd('vi')` và kiểm tra font có dấu đầy đủ.

---

## 17. Observability

Bắt lỗi toàn cục và gửi crash report có ngữ cảnh, nhưng **không** gửi dữ liệu cá nhân
của khách:

```dart
Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment('SENTRY_DSN');
      options.tracesSampleRate = 0.2;
      options.release = 'wedding-app@1.4.0+14';
    },
    appRunner: () => runApp(const ProviderScope(child: WeddingApp())),
  );
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    Sentry.captureException(details.exception, stackTrace: details.stack);
  };
  PlatformDispatcher.instance.onError = (error, stack) {
    Sentry.captureException(error, stackTrace: stack);
    return true;
  };
}
```

Breadcrumb: `refresh_started`, `refresh_failed`, `ws_reconnected`, `send_failed` kèm
status code, không kèm `content`/`sender_name`; log một dòng có `attempt`, `elapsed`.

| Tín hiệu | Ngưỡng cảnh báo | Hành động |
|---|---|---|
| Crash-free sessions | < 99.5% | Chặn release, điều tra |
| API 5xx | > 2% trong 15 phút | Kiểm tra backend/Supabase |
| WS reconnect | > 5 lần/phiên | Kiểm tra mạng/proxy |
| Send failure | > 5% | Kiểm tra validation/offline |

Không log toàn bộ response; sampling 10–20% trace đủ cho app nhỏ. Nếu dùng Firebase
Crashlytics, đặt custom key `route` và `release` để lọc.

---

## 18. Anti-patterns nâng cao

| ❌ Anti-pattern | Hệ quả | ✅ Thay thế |
|---|---|---|
| Repository trả `Widget`/`BuildContext` | Không test được, coupling | Trả domain entity/stream |
| UI gọi `Dio` trực tiếp | Lặp lỗi, khó cache | Qua repository |
| `ref.watch` trong callback | Rebuild/loop khó hiểu | `ref.read` |
| Provider toàn cục giữ state screen | Rò rỉ, stale data | `autoDispose`/scope |
| `setState` + Riverpod + Bloc cùng feature | Hai nguồn sự thật | Chọn một |
| Retry POST mù | Lời chúc trùng | Idempotency/verify trước |
| Cache lỗi thành list rỗng | Mất dữ liệu offline | Giữ cache + banner |
| Log token/nội dung khách | Vi phạm riêng tư | Redact, tắt verbose |
| Deep link chỉ test bằng `adb` một lần | Vỡ trên iOS/store | Test cả cold/warm start |

---

## 19. Capstone và tài liệu tham khảo

Ghép tất cả thành app guestbook có kiến trúc hoàn chỉnh:

```text
lib/
├── app/{app.dart, bootstrap.dart, router.dart}
├── core/{network, database, logging}/
└── features/guestbook/{domain, data, presentation}/
```

Thứ tự triển khai:

1. Domain + DTO + mapper; unit test `Wish.fromJson` với payload thật từ backend.
2. Drift schema + DAO; test upsert idempotent và sort `created_at`.
3. API + repository cache-first; test refresh fail vẫn giữ dữ liệu.
4. Riverpod providers; override fake trong widget test.
5. WebSocket → repository → Drift; test new/update/delete.
6. go_router + deep link; test cold start `/wish/42`.
7. Outbox + connectivity; test mất mạng rồi có mạng.
8. Performance profile trên thiết bị thật; CI xanh trước khi release.

Checklist hoàn thành:

- [ ] Không có `DioException`, JSON key hay SQL trong presentation.
- [ ] `GET` có retry; `POST` không retry mù; lỗi 4xx hiển thị thông báo thân thiện.
- [ ] Offline mở app vẫn thấy lời chúc cũ; gửi khi offline vào outbox.
- [ ] WS reconnect có backoff, đóng khi background, refetch khi resume.
- [ ] Deep link `/wish/:id` hoạt động từ cold start trên Android và iOS.
- [ ] `flutter analyze` sạch, test pass, coverage data/domain đạt ngưỡng.
- [ ] Không log token/tên khách; secret không nằm trong binary.

**Bài tập**

1. Thêm `delete` vào outbox và xử lý tombstone để refresh không làm tin sống lại.
2. Viết `bloc_test` cho luồng submit thành công/thất bại, so sánh với Riverpod.
3. Đo startup bằng `--trace-startup`, tối ưu ít nhất một plugin khởi tạo muộn.
4. Cấu hình App Links/Universal Links thật và test bằng link trên trình duyệt.

**Tài liệu tham khảo**

- Flutter architecture: https://docs.flutter.dev/resources/architectural-overview
- Riverpod: https://riverpod.dev/docs/introduction/getting_started
- Bloc: https://bloclibrary.dev/
- go_router: https://pub.dev/packages/go_router
- Dio: https://pub.dev/packages/dio
- Drift: https://drift.simonbinder.eu/
- Flutter performance: https://docs.flutter.dev/perf/best-practices
- Flutter accessibility: https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility
- WebSocket backend: [`../websocket.md`](../websocket.md)
- API security: [`../api-security.md`](../api-security.md)

---

*Tiếp theo: [`flutter-production.md`](./flutter-production.md) để đưa app ra store.*
