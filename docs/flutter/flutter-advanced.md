# Flutter nâng cao — Kiến trúc, state, offline và vận hành

> Dành cho ứng dụng Flutter đã có nền tảng cơ bản. Mục tiêu: tách lớp rõ ràng (domain/data/presentation),
> chọn state management có kỷ luật, cache offline-first, tối ưu hiệu năng và chuẩn bị đưa app
> vào CI. Code dùng Dart 3.x/Flutter 3.x stable; ví dụ trung lập theo domain.

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

### 1.1. Feature-first vs layer-first

Feature-first thay vì layer-first để một feature có thể xóa/ship độc lập:

```text
lib/
├── app/                 # bootstrap, router, theme
├── core/                # dio, database, logger, l10n
└── features/guestbook/  # data, domain, presentation
```

**So sánh nhanh:**

| Tiêu chí | Layer-first (`data/`, `domain/`, `ui/`) | Feature-first (`features/guestbook/`) |
|---|---|---|
| Phù hợp dự án | Rất nhỏ, prototyping | Trung bình - lớn, nhiều feature độc lập |
| Khả năng tái sử dụng | Dễ tái sử dụng chung toàn cục | Có thể bị trùng, cần `core/` cho chia sẻ thật sự |
| Xóa feature | Khó, dễ để lại import | Dễ xóa cả thư mục |
| Onboarding | Dễ hình dung lớp | Dễ hình dung theo nghiệp vụ |

### 1.2. Dependency rule

- **Domain**: không phụ thuộc bất kỳ lớp nào khác. Chỉ định nghĩa `Entity`, `Repository` (interface), `UseCase`.
- **Data**: phụ thuộc `Domain`. Triển khai `Repository`, map `DTO` ↔ `Entity`, gọi API/DB.
- **Presentation**: phụ thuộc `Domain` (khuyến nghị). Tránh phụ thuộc trực tiếp `Data` implementation.
- **Core/App**: chia sẻ hạ tầng, có thể được tất cả dùng nhưng **không** chứa logic nghiệp vụ đặc thù feature.

> 💡 **Nguyên tắc cốt lõi:** "Dependency points inward". Mũi tên phụ thuộc luôn hướng về `domain/`.

> ⚠️ **Tránh đảo chiều:** Nếu `domain` import `data` để tiết kiệm thời gian, bạn sẽ khó test/mock và khó thay thế hạ tầng sau này.

### 1.3. DTO, Domain Entity, Mapper

- **DTO (Data Transfer Object):** phản ánh schema backend/DB, có `fromJson/toJson`, field snake_case, có thể nullable theo contract.
- **Entity (Domain):** model nghiệp vụ thuần Dart, không biết serialization. Chỉ chứa rule cần thiết (ví dụ validation nội bộ).
- **Mapper:** chuyển đổi `DTO → Entity`. Nên đặt ở `data/mappers/` hoặc cùng file repository. Mapper phải xử lý default an toàn, không nuốt lỗi schema một cách mù quáng.

**Ví dụ:**

```dart
// data/dto/wish_dto.dart
@freezed
class WishDto with _$WishDto {
  const factory WishDto({
    required String id,
    @JsonKey(name: 'sender_name') required String senderName,
    required String content,
    @JsonKey(name: 'will_attend') @Default(false) bool willAttend,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _WishDto;
  factory WishDto.fromJson(Map<String, dynamic> json) => _$WishDtoFromJson(json);
}

// data/mappers/wish_mapper.dart
extension WishDtoX on WishDto {
  Wish toEntity() => Wish(
        id: id,
        senderName: senderName,
        content: content,
        willAttend: willAttend,
        createdAt: DateTime.parse(createdAt).toUtc(),
      );
}
```

> 📌 **Lưu ý:** Luôn parse thời gian về `UTC` trong mapper/repo, chỉ `toLocal()` khi hiển thị UI.

### 1.4. Use Case

`UseCase` hữu ích khi có **nhiều bước nghiệp vụ** hoặc rule cần tái sử dụng. Với CRUD đơn giản, gọi thẳng `Repository` từ presentation/controller cũng chấp nhận được.

**Khi nên dùng UseCase:**
- Kết hợp nhiều repository (`UserRepo` + `NotificationRepo`)
- Áp dụng rule nghiệp vụ phức tạp (quyền, giới hạn, validation)
- Cần dễ unit test logic độc lập khỏi state management

**Khi không cần:**
- Chỉ `repo.watch()`/`repo.get()`
- Logic quá mỏng, chỉ pass-through

```dart
// domain/usecases/submit_wish_usecase.dart
class SubmitWishUseCase {
  SubmitWishUseCase(this.repository);
  final MessageRepository repository;

  Future<Result<void>> call(WishDraft draft) async {
    if (draft.content.trim().isEmpty) {
      return const Result.failure(ValidationFailure('Nội dung không được trống'));
    }
    if (draft.content.length > 500) {
      return const Result.failure(ValidationFailure('Tối đa 500 ký tự'));
    }
    return repository.submit(draft);
  }
}
```

> 💡 Dùng `Result<T>` (sealed class) thay `throw` để buộc presentation xử lý thất bại rõ ràng.

### 1.5. Repository contract

`Repository` là **boundary** giữa domain và data. Interface nằm ở `domain/repositories/`, implementation ở `data/repositories/`.

```dart
// domain/repositories/message_repository.dart
abstract class MessageRepository {
  Stream<List<Wish>> watchMessages();
  Future<void> refresh({String? before});
  Future<void> submit(WishDraft draft);
  Future<void> delete(String id);
  void dispose();
}
```

**Quy tắc:**
- Trả về `Stream<Entity>` hoặc `Future<Entity/List<Entity>>`, **không** trả DTO/Row
- Bắt/translate lỗi ở data layer thành `Failure` domain-friendly
- `dispose()` để dọn subscription/socket
- Single source of truth: ưu tiên stream từ DB local

### 1.6. Error boundary và module boundaries

- **Error boundary**: Map mọi ngoại lệ (Dio/SQLite/Platform) thành `Failure` có ý nghĩa. UI chỉ hiển thị message đã được chuẩn hóa.
- **Module boundary**: Feature chỉ import từ `core/` và interface của feature khác (không import implementation). Nếu cần chia sẻ mạnh, đưa lên `core/` hoặc tạo `shared/`.
- **Anti-overengineering:** Tránh tạo UseCase/Mapper/Layer chỉ vì "chuẩn". Thêm khi thực sự giải quyết vấn đề (test khó, coupling cao, rule phức tạp). 

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
`runApp(const ProviderScope(child: AppRoot()));`

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

### 2.1. Các loại provider

Quy tắc chọn provider:

| Nhu cầu | Dùng | Ghi chú |
|---|---|---|
| Giá trị bất biến, dependency | `Provider` | Tạo object, cache, có `ref.onDispose` |
| State có thể thay đổi (sync) | `NotifierProvider` / `StateProvider` | Ưu tiên `Notifier` rõ ràng hơn `StateProvider` cho logic phức tạp |
| State async có thể ghi | `AsyncNotifierProvider` | Khuyến nghị cho form/action async |
| Stream realtime | `StreamProvider` | Tự động `AsyncValue` từ stream |
| Future đơn giản | `FutureProvider` | Chỉ đọc, ít ghi |
| Tham số hóa (chi tiết wish) | `.family` | Tránh tạo provider động bằng tay |
| Giữ sống lâu hơn scope | `keepAlive: true` | Chỉ khi cần (auth, cart, config). Cẩn thận leak memory |

### 2.2. ref API: watch/read/listen/invalidate/refresh

| API | Khi dùng | Lưu ý |
|---|---|---|
| `ref.watch(provider)` | Trong `build()` để rebuild khi provider thay đổi | Nên dùng `.select` để thu hẹp rebuild |
| `ref.read(provider)` | Trong callback/event handler | Không gây rebuild UI |
| `ref.listen(provider, ...)` | Side-effect (navigation, snackBar) | Thường đặt trong `build` của `ConsumerWidget/ConsumerState` |
| `ref.invalidate(provider)` | Buộc fetch lại (force refresh) | `autoDispose` có thể bị hủy; dùng cẩn thận |
| `ref.refresh(provider)` | Lấy giá trị mới ngay (trả giá trị) | Khác `invalidate` về timing |

**Ví dụ `select` để tránh rebuild không cần thiết:**

```dart
final hasUnsent = ref.watch(outboxCountProvider.select((c) => c > 0));
```

### 2.3. AsyncValue lifecycle & error handling

`AsyncValue` có 3 trạng thái: `loading`, `data`, `error`. Với `AsyncNotifier`, cần xử lý:

- `AsyncLoading` khi khởi tạo
- `AsyncData` sau thành công
- `AsyncError` khi thất bại, vẫn có thể giữ `previousState` tùy ngữ cảnh
- `state = AsyncValue.guard(() async { ... })` để catch tự động

```dart
class SubmitWishNotifier extends AsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> submit(WishDraft draft) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(messageRepositoryProvider).submit(draft));
  }
}
```

> ⚠️ **Pitfall rebuild/leak:** Nếu `StreamProvider` không `autoDispose`, stream có thể chạy mãi. Luôn `autoDispose` cho screen-scoped. Nếu dùng `keepAlive`, nhớ dọn hoặc kiểm soát vòng đời.

### 2.4. Testing với Riverpod

Override provider trong test:

```dart
test('integration-like với override', () async {
  final container = ProviderContainer(
    overrides: [
      messageRepositoryProvider.overrideWithValue(FakeRepo()),
      dioProvider.overrideWithValue(fakeDio),
    ],
  );
  addTearDown(container.dispose);
  // ...
});
```

**Mẹo test:**
- Dùng `ProviderContainer` cho unit test notifier
- Dùng `ProviderScope(overrides: ...)` cho widget test
- Mock dependency, không mock provider nội bộ trừ trường hợp cần thiết
- Kiểm tra side-effect bằng `ref.listen` trong test nếu cần

### 2.5. Riverpod 2 vs 3 migration

Riverpod 3 đang tiến hóa. Trước khi nâng:

- Đọc [migration guide](https://riverpod.dev/docs/migration/riverpod_3) chính thức
- Kiểm tra breaking change: `StateProvider` vs `Notifier`, `AutoDispose`, retry behavior
- Chạy test đầy đủ, analyze sau khi nâng
- **Khóa version** trong `pubspec.yaml` nếu đang gần release: `flutter_riverpod: ^2.5.1`
- Nếu đã dùng codegen (`riverpod_generator`), cần đồng bộ phiên bản

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

### 3.1. So sánh Riverpod vs Bloc/Cubit

| Tiêu chí | Riverpod | Bloc/Cubit |
|---|---|---|
| Boilerplate | Thấp | Trung bình–cao |
| Test | Override provider | `blocTest` |
| Team | Thích functional/DI | Thích event rõ ràng |
| Side-effect | Linh hoạt, dễ mix | Rõ ràng qua event/transformer |
| Compile safety | Rất tốt (codegen + types) | Tốt với sealed class |
| Guestbook | ✅ Khuyến nghị | ✅ Nếu team đã dùng |

Chọn **một** hướng; không bọc Bloc trong Riverpod provider rồi vẫn `setState` song song.

### 3.2. emit.forEach, concurrency transformer

- `emit.forEach`: subscribe stream, tự emit state. Cần cẩn thận cancel (Bloc tự handle khi close).
- **Concurrency:** `bloc_concurrency` cung cấp transformer (`droppable`, `restartable`, `sequential`). Hữu ích khi user spam button submit.
- **Error mapping:** Luôn map error thành state user-friendly, không để raw exception leak.

```dart
on<WishSubmitted>(
  (event, emit) async {
    emit(const GuestbookSubmitting());
    try {
      await _repository.submit(event.draft);
      emit(const GuestbookSubmitSuccess());
    } catch (e) {
      emit(GuestbookFailure('$e'));
    }
  },
  transformer: droppable(),
);
```

### 3.3. Lifecycle và testing

- **Lifecycle:** `close()` hủy subscription. Tránh leak bằng cách dùng `emit.forEach` đúng cách.
- **blocTest:** Rất mạnh cho chuỗi event → state.

```dart
blocTest<GuestbookBloc, GuestbookState>(
  'emits loading then loaded',
  build: () {
    when(() => repo.watchMessages()).thenAnswer((_) => Stream.value([wish]));
    return GuestbookBloc(repo);
  },
  act: (bloc) => bloc.add(const GuestbookStarted()),
  expect: () => [const GuestbookLoading(), GuestbookLoaded([wish])],
);
```

> ⚠️ **Pitfall:** Không emit state sau khi `bloc` đã close. `emit` sẽ throw nếu không cẩn thận.

---

## 4. Dependency injection

Riverpod đã là DI container: provider tạo instance, `ref.onDispose` dọn tài nguyên,
override thay thế trong test. Không cần `get_it` cho app cỡ này.

```dart
final messageApiProvider = Provider<MessageApi>((ref) => MessageApi(ref.watch(dioProvider)));
```

### 4.1. Quy ước vòng đời

| Đối tượng | Vòng đời | Dọn bằng |
|---|---|---|
| `Dio`, `ApiClient` | App | `ref.onDispose(() => dio.close())` |
| `AppDatabase` | App | `db.close()` |
| `SocketService` | App/Repository | `socket.dispose()`, đóng stream/subscription |
| Repository | App hoặc screen | `dispose()` socket/subscription |
| Controller/Notifier | Screen (`autoDispose`) | `ref.onDispose` |

### 4.2. Constructor injection vs service locator

**Constructor injection (khuyến nghị):**
- Rõ ràng dependency
- Dễ test (truyền mock/fake trực tiếp)
- Không có hidden global
- IDE hỗ trợ tốt

**Service locator (get_it):**
- Có thể hữu ích nếu cần truy cập ngoài widget tree khó
- Nhưng dễ lạm dụng, khó trace dependency
- Test cần reset (`GetIt.I.reset()`)

Nếu buộc phải dùng service locator, đăng ký một lần trong `main()` và **không** đọc
trong `build()`. Lạm dụng `GetIt.I<X>()` khắp nơi làm test phải reset global state và
che giấu dependency thật.

> 💡 Constructor injection vẫn là cách rõ nhất: `WishCard({required this.onTap})` dễ
> test hơn widget tự tìm service toàn cục.

### 4.3. Scoping và testability

- **App scope:** infra (dio, db, logger) — `Provider` cấp app
- **Feature scope:** repo, notifier — có thể `autoDispose` theo screen/flow
- **Test scope:** luôn override, ưu tiên in-memory DB/fake API
- **Tránh circular dependency:** Nếu A phụ thuộc B và ngược lại, cân nhắc event/stream hoặc tách interface

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

### 5.1. Routes, nested, shell, guard

- **Nested routes:** group flow liên quan
- **ShellRoute:** giữ navigation bar/drawer chung
- **Redirect/guard:** kiểm tra auth/role trước khi vào route
- **Type-safe routes:** cân nhắc `go_router_builder` để tránh string literal sai

```dart
ShellRoute(
  builder: (context, state, child) => MainScaffold(child: child),
  routes: [
    GoRoute(path: '/', builder: (_, __) => const Home()),
    GoRoute(path: '/guestbook', builder: (_, __) => const GuestbookScreen()),
  ],
);
```

### 5.2. path/query/extra

- `pathParameters`: bắt buộc từ route (`:id`)
- `queryParameters`: optional (`?from=share`)
- `extra`: object tạm trong session navigation — **không** dùng cho deep link từ ngoài
- Deep link từ ngoài luôn chỉ có path/query, nên screen phải tự fetch theo `id`

`state.extra` chỉ dùng cho object tạm trong session; deep link từ ngoài luôn chỉ có
path/query, nên screen phải tự fetch theo `id`.

### 5.3. Deep link native config (Android/iOS/Web)

Deep link cần cấu hình native, không chỉ route:

- **Android**: `<intent-filter>` với `VIEW`/`BROWSABLE`, host `app.example.com`, và `android:autoVerify="true"` cho App Links. Thêm asset links (`/.well-known/assetlinks.json`).
- **iOS**: Associated Domains `applinks:app.example.com` + file `apple-app-site-association` trên domain (không có `.json` extension theo convention chuẩn).
- **Web**: bật path URL strategy để `/wish/42` không thành `/#/wish/42` (`usePathUrlStrategy()`).
- **Fallback**: nếu id không tồn tại, hiển thị empty state thay vì crash.

**Checklist deep link:**
- [ ] Test cold start (app kill) và warm start (background)
- [ ] Test từ browser, SMS, email, QR
- [ ] Xử lý khi route không tồn tại
- [ ] Không crash nếu thiếu param

### 5.4. Testing, Navigator vs go_router

> ⚠️ Đừng dùng `Navigator.push` song song `go_router` cho cùng màn hình. Chọn router
> làm nguồn sự thật, trừ dialog/bottom sheet.

**Khi dùng `showDialog`/`showModalBottomSheet`:** vẫn OK, không cần route.  
**Khi điều hướng phức tạp:** ưu tiên `context.go`/`context.push` thống nhất.

**Test routing:**
- Unit test redirect logic
- Widget test với `GoRouter` fake hoặc override
- Integration test deep link trên emulator/device

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

### 6.1. Retry chỉ idempotent

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

**Quy tắc retry:**
- **Idempotent only:** GET, HEAD, OPTIONS. PUT/PATCH tùy backend có idempotent không.
- **POST/DELETE:** Mặc định **KHÔNG** retry tự động. Chỉ retry nếu có idempotency key.
- **Network error (status 0):** Có thể retry GET
- **5xx:** Có thể retry GET với backoff
- **4xx:** Hầu hết không retry (bad request/auth/forbidden)
- **Timeout:** Retry có giới hạn

### 6.2. CancelToken, timeout

Hủy request khi rời screen bằng `CancelToken`; đóng token trong `dispose`. Với upload
ảnh cưới (nếu mở rộng), dùng `onSendProgress` và giới hạn kích thước **trước** khi gửi.

```dart
class WishListController {
  final CancelToken _token = CancelToken();
  Future<void> load() async {
    try {
      await api.fetch(cancelToken: _token);
    } on DioException catch (e) {
      if (CancelToken.isCancel(e)) return; // user navigated away
      rethrow;
    }
  }
  void dispose() {
    if (!_token.isCancelled) _token.cancel('disposed');
  }
}
```

### 6.3. Error mapping

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
final class UnauthorizedFailure extends ApiFailure {
  const UnauthorizedFailure() : super('Phiên đăng nhập hết hạn');
}
final class ValidationFailure extends ApiFailure {
  const ValidationFailure(super.message);
}

ApiFailure mapDioError(DioException error) => switch (error.type) {
      DioExceptionType.connectionError ||
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        const NetworkFailure(),
      DioExceptionType.badResponse => switch (error.response?.statusCode) {
          401 => const UnauthorizedFailure(),
          400 || 422 => ServerFailure(_serverMessage(error.response?.data) ?? 'Dữ liệu không hợp lệ'),
          429 => const ServerFailure('Quá nhiều yêu cầu, thử lại sau'),
          >=500 => ServerFailure(_serverMessage(error.response?.data) ?? 'Lỗi máy chủ', statusCode: error.response?.statusCode),
          _ => ServerFailure(_serverMessage(error.response?.data) ?? 'Không gửi được lời chúc', statusCode: error.response?.statusCode),
        },
      DioExceptionType.badCertificate => const ServerFailure('Lỗi chứng chỉ bảo mật'),
      DioExceptionType.cancel => const NetworkFailure(), // hoặc ignore
      _ => const ServerFailure('Không gửi được lời chúc'),
    };

String? _serverMessage(Object? body) =>
    body is Map<String, dynamic> ? (body['error'] ?? body['message'])?.toString() : null;
```

### 6.4. Logging an toàn, refresh token, multipart, cert pinning caveat

- **Logging an toàn:** Chỉ log method/path/status/time ở debug. **KHÔNG** log headers chứa token, request/response body có PII. Xem thêm mục 13.
- **Refresh token:** Nếu có auth, dùng interceptor queue để tránh refresh song song. Refresh chỉ 1 lần, retry request bị 401 với token mới. Cẩn thận vòng lặp vô hạn.
- **Multipart/upload progress:** Kiểm tra dung lượng trước upload, nén ảnh nếu cần. Hiển thị progress, cho phép hủy.
- **Certificate pinning caveat:** Pinning tăng bảo mật nhưng khó rotation. Nếu pin sai → toàn bộ app không kết nối. Chưa có quy trình rotation → dùng TLS chuẩn. Xem thêm mục 13.

> ⚠️ **Quan trọng:** Với POST submit lời chúc, **KHÔNG** bật retry mặc định. Nếu backend chưa có idempotency key, retry có thể tạo bản ghi trùng. Ưu tiên "enqueue outbox + verify" thay vì blind retry.

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

### 7.1. Codegen, build_runner

Tách `WishDraft` (chỉ field ghi) để không gửi `id`/`created_at` lên server; khai báo
tương tự với `@freezed`. Chạy codegen: `dart run build_runner build
--delete-conflicting-outputs` (hoặc `watch` khi đang code).

**Workflow:**
- Thêm/sửa model `@freezed`/`@JsonSerializable` → chạy build_runner
- Không sửa file `*.freezed.dart`/`*.g.dart` bằng tay
- Commit generated file nếu CI **không** chạy codegen; nếu CI chạy codegen, thêm bước build trước `analyze`

### 7.2. Versioning contract, nullable/backward compatibility

- **Default value:** `@Default(...)` giúp client cũ không crash khi backend thêm field
- **Nullable:** Chỉ dùng nullable nếu field thực sự optional. Tránh `dynamic`
- **Backward compatible:** Khi xóa field, cân nhắc giữ mapper xử lý
- **Union/type safety:** Dùng `sealed class` cho response phức tạp
- **Log schema drift:** Ở debug, có thể log key lạ để phát hiện backend đổi contract

```dart
@freezed
class ApiResponse with _$ApiResponse {
  const factory ApiResponse({
    required List<WishDto> data,
    @Default(0) int total,
  }) = _ApiResponse;
  factory ApiResponse.fromJson(Map<String, dynamic> json) => _$ApiResponseFromJson(json);
}
```

> 💡 Với response lỗi hoặc field mới, `@Default` giúp app cũ không crash. Nhưng đừng
> nuốt lỗi schema: log field lạ ở môi trường debug để phát hiện backend đổi contract.

### 7.3. DateTime/timezone, id number vs string

`DateTime` mặc định parse ISO và giữ UTC; khi hiển thị mới `toLocal()`:

```dart
final label = DateFormat('HH:mm · dd/MM/yyyy').format(wish.createdAt.toLocal());
```

**Lưu ý:**
- **UTC vs Local:** Parse về UTC để so sánh/sort nhất quán
- **id number vs string:** Luôn normalize về `String` trong domain (`_idFromJson`) để tránh so sánh sai giữa JSON/DB
- **Timezone:** Nếu cần timezone cụ thể, dùng `intl`/`timezone` package cẩn thận
- **Invalid date:** Có thể try/catch parse, fallback an toàn

> ⚠️ **Pitfall:** So sánh `DateTime` không cùng kind (UTC/local) có thể gây bug sort không mong muốn.

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

### 8.1. DAO, stream, upsert batch

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

### 8.2. LazyDatabase, isolate

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

**Lưu ý:**
- `createInBackground` chạy trên background isolate — phù hợp mobile
- Web: cần `drift/web.dart` với `IndexedDB`/Wasm; kiểm tra giới hạn
- Đường dẫn file: dùng `path_provider`

### 8.3. Schema, migration, indexes, batch/transaction

- **Schema version:** Tăng `schemaVersion` khi thay đổi schema
- **Migration:** Viết `MigrationStrategy` (`onCreate`, `onUpgrade`). Test migration với dữ liệu cũ
- **Indexes:** Thêm index cho cột thường query/sort (vd `created_at`)
- **Batch/transaction:** `batch()` cho nhiều insert/update; `transaction()` cho logic atomic
- **Foreign key:** Cân nhắc nếu có quan hệ

```dart
@override
MigrationStrategy get migration => MigrationStrategy(
  onCreate: (m) async {
    await m.createAll();
    await m.createIndex(Index('idx_wishes_created_at', [wishes.createdAt]));
  },
  onUpgrade: (m, from, to) async {
    // if (from == 1 && to == 2) { ... }
  },
);
```

### 8.4. Test in-memory, backup, SQLite vs khác

- **Test in-memory:** Dùng `NativeDatabase.memory()` hoặc `VmDatabase.memory()` trong unit test
- **Backup:** Nếu cần backup/restore, export DB file cẩn thận (có PII)
- **Khi nào dùng SQLite vs khác:** Drift/SQLite phù hợp quan hệ + query phức tạp + offline-first. `ObjectBox`/`Isar`/`Hive` nhanh hơn cho key-value/document đơn giản.

> ⚠️ Đừng cache lỗi thành empty list. Nếu refresh fail, giữ dữ liệu cũ và hiển thị banner
> "Đang offline — dữ liệu có thể chưa mới nhất" thay vì xóa trắng màn hình.

Chiến lược cache:

| Dữ liệu | Cache | TTL |
|---|---|---|
| Danh sách lời chúc | Drift, đầy đủ | Không hết hạn, refresh khi mở app |
| Tên khách, cờ onboarding | `shared_preferences` | Vô hạn |
| Token/admin session | `flutter_secure_storage` | Theo token |

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

### 9.1. Flush tuần tự, backoff

Xử lý tuần tự, dừng khi gặp lỗi mạng để giữ thứ tự (dùng cờ `_flushing` để tránh chạy
song song):

```dart
Future<void> flushOutbox() async {
  if (_flushing) return;
  _flushing = true;
  try {
    for (final op in await _db.pendingDao.dueOps()) {
      try {
        await _execute(op);
        await _db.pendingDao.remove(op.id);
      } on ApiFailure {
        await _db.pendingDao.markAttempt(op.id, _backoff(op.attempts + 1));
        return;
      }
    }
  } finally {
    _flushing = false;
  }
}

Duration _backoff(int attempts) => Duration(
      seconds: math.min(300, math.pow(2, attempts).toInt()),
    );
```

`_execute(op)` switch theo `kind`; `pendingDao` là DAO của `PendingOps`.

### 9.2. Idempotency, dedupe

Backend hiện **không có idempotency key**, nên POST retry sau timeout có thể tạo bản ghi
trùng. Cách giảm rủi ro:

1. Sau timeout, gọi `GET /api/messages/` và tìm bản ghi khớp `sender_name` + `content`
   trong 2 phút gần nhất trước khi retry.
2. Chỉ retry khi lỗi mạng rõ ràng; không retry khi server đã trả 4xx.
3. Ghi `client_generated_id` vào payload nếu backend được nâng cấp để dedupe.
4. Ưu tiên **exponential backoff** + jitter nhẹ nếu có nhiều client
5. Giới hạn `maxAttempts` (vd 10) rồi mark failed + báo UI

> ⚠️ **Critical:** Với POST không idempotent, **blind retry = duplicate risk**. Luôn cân nhắc verify thay vì retry mù.

### 9.3. Conflict resolution, tombstone

Conflict của guestbook là **last-write-wins** theo `id`: PUT của admin thắng, delete tạo
tombstone local để refresh không làm tin đã xóa sống lại. Nếu nhiều thiết bị cùng sửa,
cần `updated_at`/version từ server; đừng tự bịa conflict resolution khi backend chưa hỗ trợ.

**Tombstone pattern:**
- Thêm bảng/flag `deleted_at` hoặc `is_deleted`
- Khi refresh, bỏ qua record đã tombstone và đã sync
- Sau khi xác nhận server xóa, xóa hẳn khỏi DB local

```dart
class Wishes extends Table {
  // ...
  DateTimeColumn get deletedAt => dateTime().nullable()();
}

// Khi delete: tạo op delete + mark local deletedAt, flush sau
```

### 9.4. Connectivity vs internet, ordering, UI offline banner, test

Theo dõi connectivity bằng `connectivity_plus: ^6.0.3`; có mạng thì `flushOutbox` và
`refresh`. Connectivity chỉ báo loại mạng, không đảm bảo internet — vẫn kiểm tra request.

**Lưu ý:**
- **Ordering:** Xử lý outbox **tuần tự** để giữ thứ tự operation
- **UI offline banner:** Hiển thị khi mất mạng hoặc có pending ops
- **Test mất mạng:** Mô phỏng airplane mode, reconnect, verify outbox flush đúng thứ tự
- **Debounce:** Tránh flush liên tục khi connectivity thay đổi nhanh

```dart
ref.listen(connectivityProvider, (_, next) {
  next.whenData((result) {
    if (result != ConnectivityResult.none) {
      ref.read(outboxServiceProvider).flushOutbox();
      ref.read(messageRepositoryProvider).refresh();
    }
  });
});
```

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

### 10.1. Render pipeline, rebuild scope

- **const:** Dùng `const` cho widget bất biến
- **Tách widget:** Nhỏ hóa widget để giới hạn rebuild scope
- **Keys:** Chỉ dùng key khi cần preserve state (reorder/list động)
- **Consumer:** Chỉ wrap phần cần rebuild

### 10.2. const, keys, RepaintBoundary

Checklist tối ưu:

- `const` cho widget tĩnh; tách widget nhỏ để rebuild cục bộ.
- `ListView.builder` + `itemExtent`/`prototypeItem` nếu card cùng chiều cao.
- `RepaintBoundary` quanh animation hoặc card phức tạp, nhưng đừng bọc mọi item.
- Ảnh: `cacheWidth`/`cacheHeight` theo kích thước hiển thị, dùng `cached_network_image`.
- Tránh `Opacity` lặp lại; dùng `AnimatedOpacity`/`FadeTransition` hoặc màu alpha.
- Không `shrinkWrap: true` cho list dài; tránh `IntrinsicHeight` trong list.
- Kiểm tra trên **profile mode** và thiết bị thật thấp cấp, không chỉ debug.

> ⚠️ `RepaintBoundary` có cost. Chỉ dùng khi đo thực tế thấy benefit.

### 10.3. Image cache/cacheWidth, list optimization

```dart
Image.network(
  url,
  cacheWidth: (200 * MediaQuery.of(context).devicePixelRatio).toInt(),
  fit: BoxFit.cover,
)
```

Với `cached_network_image`, cũng có `memCacheWidth`/`memCacheHeight`. Luôn resize theo hiển thị.

### 10.4. Jank/shaders (Impeller), startup, memory leaks

| Triệu chứng | Nguyên nhân thường gặp | Công cụ |
|---|---|---|
| Scroll giật | Decode ảnh lớn, rebuild item | Performance overlay, Timeline |
| Mất frame khi mở form | Keyboard + layout lớn | Timeline, rebuild stats |
| Chậm startup | Nhiều plugin khởi tạo đồng bộ | `flutter run --trace-startup` |
| Shader jank | Compilation shader lần đầu (đặc biệt Android Vulkan) | Impeller giúp giảm, vẫn cần test |

**Impeller:** Flutter 3.x dùng Impeller mặc định trên iOS, dần trên Android. Vẫn cần profile.

**Memory leaks:** Kiểm tra stream/subscription/controller không dispose. Dùng DevTools Memory.

> 💡 Với tiệc cưới, slideshow trên tablet là màn hình rủi ro nhất: ảnh 4K + animation.
> Resize ảnh trước khi upload và giới hạn cache là cách rẻ nhất để ổn định.

---

## 11. Isolate và platform channel

### 11.1. Isolate.run/compute, transferable data

JSON lớn, parse/export danh sách khách, hoặc hash ảnh có thể đẩy sang isolate:

```dart
final wishes = await Isolate.run(() => parseWishes(rawJson));
```

`Isolate.run` copy dữ liệu qua message; closure không được capture `BuildContext` hay
object không gửi được. Trên web, isolate bị giới hạn — code phải vẫn chạy (có thể
fallback cùng isolate). `compute()` là wrapper cũ, vẫn dùng được cho hàm top-level.

**Lưu ý transferable data:**
- Chỉ truyền dữ liệu sendable (primitive, List/Map đơn giản, String)
- Tránh truyền Flutter objects, Dio objects
- Với dữ liệu lớn, cân nhắc cost copy

### 11.2. MethodChannel/EventChannel

Platform channel khi plugin chưa có hoặc cần API nội bộ:

```dart
const _channel = MethodChannel('app/native');

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

### 11.3. Pigeon, error codes, timeout, FFI caveat

Quy tắc: channel name có prefix app, method trả `notImplemented` thay vì crash, luôn
timeout ở phía Dart nếu native có thể treo. Với surface lớn (nhiều method/struct), dùng
**Pigeon** để generate binding type-safe thay vì viết tay string.

**Pigeon benefits:**
- Type-safe Dart<->Kotlin/Swift
- Giảm lỗi string typo
- Dễ maintain

**FFI caveat:**
- Phức tạp hơn, cần build native
- Debugging khó hơn
- Chỉ dùng khi thực sự cần (performance critical C library)
- Cần xử lý memory management cẩn thận

**Timeout pattern:**

```dart
Future<String?> safeCall() => _channel
    .invokeMethod<String>('someMethod')
    .timeout(const Duration(seconds: 3), onTimeout: () => null);
```

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

### 12.1. AppLifecycleListener vs WidgetsBindingObserver

`AppLifecycleListener` đơn giản hơn, cover các state chính. `WidgetsBindingObserver` vẫn hữu ích cho edge case.

### 12.2. workmanager/BGTask, push vs socket

Đồng bộ định kỳ nền:

- **Android**: `workmanager` (khoảng 15 phút, bị Doze điều chỉnh) hoặc foreground service nếu thật cần realtime liên tục (không phù hợp guestbook).
- **iOS**: `BGAppRefreshTask` không đảm bảo thời điểm; chỉ dùng để dọn outbox.
- **Push**: FCM data message có thể đánh thức app ngắn, nhưng không đảm bảo; luôn có fallback refresh khi mở app.

### 12.3. iOS kill, test

- **iOS kill:** Hệ thống có thể kill app bất kỳ lúc. Không giả định background task chạy
- **Task nền chỉ nên:** gọi `flushOutbox()` idempotent, không mở UI hay giữ socket
- **Test:** Test foreground/background/kill/relaunch trên thiết bị thật
- **Exact alarms:** Tránh nếu không cần thiết (restricted trên Android 13+)

> ⚠️ **Không** chạy WebSocket liên tục trong background. Chỉ flush outbox khi có cơ hội (foreground, BGTask).

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
| Dependency supply chain | Audit dependencies, pin versions, review transitive |

Không đặt `SUPABASE_KEY`, mật khẩu admin hay signing secret trong `--dart-define`: giá
trị vẫn nằm trong binary. Thao tác quản trị phải qua backend có auth hoặc chỉ chạy nội bộ.

### 13.1. secure storage, secrets

```dart
// flutter_secure_storage
final storage = FlutterSecureStorage();
await storage.write(key: 'token', value: token);
final token = await storage.read(key: 'token');
```

**Lưu ý:**
- `--dart-define` compile-time, extractable
- Biometric protection nếu nhạy cảm
- Clear storage khi logout

### 13.2. Obfuscation, FLAG_SECURE

- **Obfuscation:** `flutter build apk --obfuscate --split-debug-info=...` giúp khó reverse engineer
- **FLAG_SECURE (Android):** Ngăn screenshot/recents preview
- **iOS:** Thêm blur/overlay khi app inactive

```dart
// Android via platform channel hoặc package
// package: flutter_windowmanager
await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
```

### 13.3. Logging redaction, dependency supply chain

Log an toàn, không in body vì có thể chứa tên khách và lời chúc:

```dart
void logApiError(DioException error) => debugPrint(
    'API ${error.requestOptions.path} → ${error.response?.statusCode}');
```

**Redaction rules:**
- Không log `Authorization`, `Cookie`
- Không log `sender_name`, `content`, email, phone
- Chỉ log metadata (path, method, status, duration)
- Tắt hoàn toàn verbose log ở release build

Chỉ bật certificate pinning khi có quy trình rotate pin trước khi hết hạn; pin sai làm
**toàn bộ** app không kết nối được. Chưa có quy trình thì dùng TLS chuẩn + HSTS.

> ⚠️ **Security mantra:** "Assume the app can be decompiled". Never trust client-side secrets.

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

### 14.1. Unit/Widget/Golden/Integration

Bổ sung:

- `bloc_test` cho chuỗi state: `expect: () => [isA<GuestbookLoading>(), isA<GuestbookLoaded>()]`.
- Golden test cho `WishCard` ở text scale 1.0/1.3/2.0 (dùng `matchesGoldenFile`).
- Integration test chạy backend local, gửi lời chúc và chờ WS cập nhật.
- `flutter test --coverage`, đặt ngưỡng thực tế (data/domain ≥70%, toàn app không cần 100%).

### 14.2. Mocktail, ProviderContainer, blocTest

- **Mocktail:** No need to extend mock classes, great for stubbing
- **ProviderContainer:** Test notifiers in isolation
- **blocTest:** Clean syntax for Bloc/Cubit

### 14.3. Fake time, network fake, golden text scale, coverage, CI flakiness

- **Fake time:** `fake_async` hoặc `clock` package
- **Network fake:** Dùng `http_mock_adapter` với Dio hoặc fake repository
- **Golden text scale:** Test accessibility scaling
- **Coverage:** Focus on critical paths (sync, outbox, mapper)
- **CI flakiness:** Tránh `sleep`, dùng `pumpAndSettle` cẩn thận, mock time, isolate flaky tests

```dart
testWidgets('golden', (tester) async {
  tester.binding.platformDispatcher.textScaleFactorTestValue = 1.3;
  addTearDown(() => tester.binding.platformDispatcher.clearTextScaleFactorTestValue());
  await tester.pumpWidget(...);
  await expectLater(find.byType(WishCard), matchesGoldenFile('wish_card_1.3.png'));
});
```

| Loại | Chạy khi | Thời gian | Phạm vi |
|---|---|---|---|
| Unit | Mỗi save/CI | < 1s/test | Mapper, notifier, validation |
| Widget | CI | Vài giây | Form, list, error/empty |
| Golden | PR UI | Vài giây | Layout/theme |
| Integration | Trước release | Phút | API + WS + navigation |

> 💡 **Nguyên tắc:** Test behavior, không test implementation. Mock boundary (repo/api), không mock everything.

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

### 15.1. Cache, format/analyze/test/build, codegen

Upload `coverage/lcov.info` làm artifact nếu cần báo cáo. Nếu dùng `freezed`/`drift`,
thêm `build_runner build` trước `analyze` (hoặc commit generated file). Cache `~/.pub-cache`
và `concurrency` giúp giảm thời gian/tránh đốt runner cho commit cũ.

```yaml
- run: dart run build_runner build --delete-conflicting-outputs
- run: flutter analyze
```

### 15.2. Artifacts, signing secrets, matrix, branch protection

CD gợi ý:

| Nhánh/tag | Hành động |
|---|---|
| PR | Analyze + test + build APK debug |
| `main` | Build internal (Firebase App Distribution/TestFlight) |
| `v*` | Build AAB/IPA release, tạo GitHub Release, upload store |

Không commit keystore. Dùng GitHub Secrets + base64 decode trong bước build, hoặc
`fastlane match` cho iOS. Chi tiết signing ở [`flutter-production.md`](./flutter-production.md).

**Best practices:**
- **Matrix:** Test trên multiple Flutter versions nếu cần
- **Concurrency:** `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`
- **Branch protection:** Require status checks
- **Secrets:** Chỉ inject cần thiết, không echo
- **Artifacts:** Lưu APK/AAB/IPA với retention ngắn

```yaml
- name: Decode keystore
  run: echo "$KEYSTORE_BASE64" | base64 --decode > android/app/upload-keystore.jks
  env:
    KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
```

---

## 16. Accessibility và i18n

Guestbook có khách lớn tuổi và ánh sáng tiệc yếu — accessibility là yêu cầu thật:

- Tap target ≥48dp; không đặt icon 24dp không padding.
- Text scale: kiểm tra 1.3 và 2.0, tránh `Row` vỡ bằng `Flexible`/`Wrap`.
- Tương phản ≥4.5:1 cho text thường; không dùng vàng nhạt trên nền trắng.
- `Semantics` cho icon-only; `ExcludeSemantics` khi label đã đủ nghĩa.
- Thứ tự focus hợp lý; form có `textInputAction` và `autofillHints`.
- Không truyền đạt trạng thái chỉ bằng màu (RSVP ✓ kèm text).
- Hỗ trợ screen reader (TalkBack/VoiceOver)

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

### 16.1. Semantics, focus, contrast

- **Semantics:** Mô tả rõ ràng, tránh redundant
- **Focus traversal:** Quan trọng cho keyboard/external input
- **Contrast:** Dùng tool check contrast
- **Live region:** Thông báo động quan trọng

### 16.2. i18n với flutter_localizations + intl

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

### 16.3. RTL, locale formatting

- **RTL:** Test layout với `Directionality(textDirection: TextDirection.rtl)` 
- **Number/date/currency:** Dùng `intl` theo locale
- **Font:** Đảm bảo fallback có dấu
- **String length:** Text dài hơn ở ngôn ngữ khác có thể vỡ layout

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
      options.release = 'app-example@1.0.0+1';
    },
    appRunner: () => runApp(const ProviderScope(child: AppRoot())),
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

### 17.1. FlutterError, PlatformDispatcher.onError

Bắt cả Flutter framework errors và uncaught async errors.

### 17.2. Breadcrumbs, sampling, privacy

Breadcrumb: `refresh_started`, `refresh_failed`, `ws_reconnected`, `send_failed` kèm
status code, không kèm `content`/`sender_name`; log một dòng có `attempt`, `elapsed`.

**Privacy rules:**
- **Redact PII:** Không gửi tên, nội dung, email, phone
- **User context:** Tránh user ID nhạy cảm hoặc hash an toàn
- **Sampling:** `tracesSampleRate` 0.1-0.2 đủ cho app nhỏ
- **Before send:** Filter event chứa PII nếu cần

| Tín hiệu | Ngưỡng cảnh báo | Hành động |
|---|---|---|
| Crash-free sessions | < 99.5% | Chặn release, điều tra |
| API 5xx | > 2% trong 15 phút | Kiểm tra backend/Supabase |
| WS reconnect | > 5 lần/phiên | Kiểm tra mạng/proxy |
| Send failure | > 5% | Kiểm tra validation/offline |

Không log toàn bộ response; sampling 10–20% trace đủ cho app nhỏ. Nếu dùng Firebase
Crashlytics, đặt custom key `route` và `release` để lọc.

> ⚠️ **GDPR/Privacy:** Chỉ log đủ để debug. Tránh "log everything".

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
| `shrinkWrap: true` + long list | Layout expensive, jank | Dùng `ListView.builder` bình thường |
| `IntrinsicHeight` trong scroll | Rất tốn, gây jank | Tránh, dùng constraint rõ ràng |
| `Opacity` widget thay `AnimatedOpacity` không cần | Repaint không cần thiết | Dùng cách hiệu quả hơn |
| Bọc mọi item bằng `RepaintBoundary` | Overhead không cần | Chỉ khi đo thấy benefit |
| `--dart-define` cho secret | Dễ extract | Dùng secure storage/native secure config |
| Giữ socket chạy background | Bị kill, tốn pin | Chỉ foreground, flush outbox nền |
| Không map DioException | UI hiển thị raw error | Map thành `ApiFailure` thân thiện |
| Sửa file generated | Mất khi rebuild | Chỉ sửa source, chạy build_runner |

### 18.1. Thêm cảnh báo thực chiến

> ⚠️ **Over-abstraction:** Đừng tạo interface cho mọi thứ. Chỉ abstract khi có >=2 implementation hoặc cần test.
> 
> ⚠️ **Premature optimization:** Đo trước khi tối ưu (DevTools). "Looks slow" không bằng measurement.
> 
> ⚠️ **God provider:** Một provider biết quá nhiều = khó test + khó thay đổi.
> 
> ⚠️ **Silent failure:** Luôn log/handle hoặc báo UI. Không `catch(e) {}`.
> 
> 💡 **Rule of thumb:** Simple > clever. Maintainable > "DRY" cực đoan.

---

## 19. Capstone và tài liệu tham khảo

Ghép tất cả thành app guestbook có kiến trúc hoàn chỉnh:

```text
lib/
├── app/{app.dart, bootstrap.dart, router.dart}
├── core/{network, database, logging}/
└── features/guestbook/{domain, data, presentation}/
```

### 19.1. Thứ tự triển khai

1. Domain + DTO + mapper; unit test `Wish.fromJson` với payload thật từ backend.
2. Drift schema + DAO; test upsert idempotent và sort `created_at`.
3. API + repository cache-first; test refresh fail vẫn giữ dữ liệu.
4. Riverpod providers; override fake trong widget test.
5. WebSocket → repository → Drift; test new/update/delete.
6. go_router + deep link; test cold start `/wish/42`.
7. Outbox + connectivity; test mất mạng rồi có mạng.
8. Performance profile trên thiết bị thật; CI xanh trước khi release.

### 19.2. Checklist hoàn thành

- [ ] Không có `DioException`, JSON key hay SQL trong presentation.
- [ ] `GET` có retry; `POST` không retry mù; lỗi 4xx hiển thị thông báo thân thiện.
- [ ] Offline mở app vẫn thấy lời chúc cũ; gửi khi offline vào outbox.
- [ ] WS reconnect có backoff, đóng khi background, refetch khi resume.
- [ ] Deep link `/wish/:id` hoạt động từ cold start trên Android và iOS.
- [ ] `flutter analyze` sạch, test pass, coverage data/domain đạt ngưỡng.
- [ ] Không log token/tên khách; secret không nằm trong binary.
- [ ] Accessibility: tap target ≥48dp, text scale OK, semantics cho icon-only.
- [ ] CI format/analyze/test xanh, build debug thành công.
- [ ] Migration strategy tested, schema version hợp lý.
- [ ] Error mapping đầy đủ, không leak exception thô.

### 19.3. Bài tập

1. Thêm `delete` vào outbox và xử lý tombstone để refresh không làm tin sống lại.
2. Viết `bloc_test` cho luồng submit thành công/thất bại, so sánh với Riverpod.
3. Đo startup bằng `--trace-startup`, tối ưu ít nhất một plugin khởi tạo muộn.
4. Cấu hình App Links/Universal Links thật và test bằng link trên trình duyệt.
5. Thêm golden test cho `WishCard` ở 3 text scales, đảm bảo không overflow.
6. Viết test integration cho offline→online sync với outbox.

### 19.4. Tài liệu tham khảo

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
