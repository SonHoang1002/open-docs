# Flutter Interview — Tình huống, code review và rapid-fire

> 50 tình huống thực chiến + 90 câu rapid-fire. Dùng cho vòng phỏng vấn Mid/Senior, mock
> interview hoặc tự luyện debug. Mỗi tình huống có cách tiếp cận, đáp án mẫu và điểm cộng.

---

## Mục lục

1. [Cách dùng](#1-cách-dùng)
2. [Tình huống debug và production](#2-tình-huống-debug-và-production)
3. [Code review](#3-code-review)
4. [System design và behavioral](#4-system-design-và-behavioral)
5. [Tình huống bổ sung](#5-tình-huống-bổ-sung)
6. [Rapid-fire 90 câu](#6-rapid-fire-90-câu)
7. [Rapid-fire bổ sung](#7-rapid-fire-bổ-sung)
8. [Tài liệu tham khảo](#8-tài-liệu-tham-khảo)

---

## 1. Cách dùng

- Đọc **hiện tượng**, tự nêu giả thuyết trong 2–3 phút trước khi xem đáp án.
- Khi trả lời, đi theo: **tái hiện → đo → khoanh vùng → sửa → kiểm chứng → phòng ngừa**.
- Với câu code review: nêu bug/rủi ro, giải thích hậu quả, đề xuất code sửa.
- Với system design: làm rõ requirement trước khi vẽ.

---

## 2. Tình huống debug và production

### S01. `RenderFlex overflowed by 37 pixels` ở màn hình hẹp. [M]

**Hiện tượng:** Màn hình 320dp hoặc text scale 200% làm `Row` tràn; debug banner vàng đen.

**Trả lời:** Tái hiện ở kích thước nhỏ + tăng text scale trong DevTools/thiết bị thật. Đọc log overflow để xác định `Row`/`Column` gây lỗi, xem widget con nào không co được. Ưu tiên dùng `Expanded`/`Flexible`, `Wrap`, `maxLines` + `TextOverflow.ellipsis`, hoặc đưa vào `SingleChildScrollView` nếu cần cuộn. Luôn kiểm tra với accessibility (text scaler lớn) và tránh dùng `FittedBox` để ép chữ quá nhỏ.

**Cách xử lý:**

1. Xác định `Row`/`Column` nào tràn từ log (file/line).
2. Kiểm tra con nào không co được: text dài, ảnh fixed width, button.
3. Sửa bằng `Expanded`/`Flexible`, `maxLines` + ellipsis, `Wrap`, hoặc scroll.
4. Test ở 320dp, landscape, text scale 2.0.

```dart
Row(children: [
  const Icon(Icons.favorite),
  const SizedBox(width: 8),
  Expanded(
    child: Text(
      wish.sender,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    ),
  ),
  const SizedBox(width: 8),
  Text('${wish.likes}'),
]);
```

**Điểm cộng:** không dùng `FittedBox` cho mọi thứ (chữ quá nhỏ, mất accessibility); kiểm
tra `MediaQuery.textScalerOf(context)`; thêm widget test với `tester.view.physicalSize`.

---

### S02. `setState() called after dispose()`. [M]

**Hiện tượng:** User rời màn hình khi request đang chạy; response về gọi `setState`.

**Trả lời:** Nguyên nhân là callback/future hoàn thành sau khi `State` bị dispose. Sau mỗi `await` cần kiểm tra `if (!mounted) return;` trước khi cập nhật UI. Với stream/subscription, hủy trong `dispose()`. Nếu logic phức tạp, nên đưa vào controller/service độc lập với lifecycle của widget và dùng `CancelableOperation` hoặc `CancelToken`.

**Cách xử lý:** Kiểm tra `mounted` sau mỗi `await`; hủy request/subscription khi dispose;
không giữ callback trỏ vào State đã hủy.

```dart
Future<void> load() async {
  final result = await repository.load();
  if (!mounted) return;
  setState(() => _items = result);
}
```

**Điểm cộng:** dùng `CancelableOperation`/Dio `CancelToken`; tách controller khỏi widget để
lifecycle rõ; test bằng cách pop trước khi future complete.

---

### S03. Danh sách ảnh cuộn giật trên máy tầm trung. [M]

**Trả lời:** Chạy profile mode trên thiết bị thật, quan sát UI/raster thread trong DevTools. Tìm nguyên nhân như decode ảnh full size, rebuild cả list, overdraw, opacity/shadow. Sửa bằng `ListView.builder`, `RepaintBoundary`, `cacheWidth/cacheHeight`, tránh `Opacity`, dùng `const` và giảm việc vẽ thừa. Luôn so sánh frame rate p95 trước/sau.

**Cách điều tra:**

1. Chạy **profile mode** trên thiết bị thật.
2. DevTools Performance: UI thread hay raster thread vượt budget?
3. Kiểm tra ảnh decode full size, `setState` cả list, `shrinkWrap`, shadow/clip/opacity,
   shader compilation lần đầu.

**Cách sửa:** `ListView.builder` + `itemExtent`, `cacheWidth`, `RepaintBoundary` cho item
phức tạp, `const` widget tĩnh, tránh `Opacity` (dùng `FadeTransition`/màu alpha), giảm
overdraw.

**Điểm cộng:** đo trước/sau bằng số frame p95; không tối ưu khi chưa có baseline.

---

### S04. Bàn phím che `TextField` ở cuối form. [M]

**Trả lời:** Đảm bảo `Scaffold.resizeToAvoidBottomInset: true`, bọc form bằng `SingleChildScrollView` và thêm padding bottom theo `viewInsets`. Với form dài, dùng `ScrollController` + `Scrollable.ensureVisible` khi field được focus. Tránh dùng `Expanded` trong vùng cuộn và kiểm tra trên thiết bị thật với bàn phím ảo.

**Cách xử lý:** `Scaffold.resizeToAvoidBottomInset: true`; form trong
`SingleChildScrollView`; padding theo `MediaQuery.viewInsetsOf(context).bottom`; cuộn tới
field bằng `Scrollable.ensureVisible` sau khi focus.

```dart
SingleChildScrollView(
  padding: EdgeInsets.only(
    left: 16,
    right: 16,
    top: 16,
    bottom: 16 + MediaQuery.viewInsetsOf(context).bottom,
  ),
  child: Form(...),
);
```

**Bẫy:** bọc `SafeArea` nhưng bỏ qua viewInsets; dùng `Expanded` trong form cuộn; ẩn bàn
phím bằng cách unfocus sai thời điểm.

---

### S05. Cuộn list bị nhảy sau khi load thêm trang. [M]

**Nguyên nhân thường gặp:** dùng index làm key, `ListView` bị rebuild mất scroll position,
item mới chèn lên đầu, hoặc `shrinkWrap`.

**Trả lời:** Ưu tiên key ổn định theo `id`, không dùng index. Giữ `ScrollController` để theo dõi vị trí cuộn. Với pagination append vào cuối, tránh rebuild toàn bộ list (chỉ cập nhật phần mới). Nếu có chèn đầu (realtime), cần điều chỉnh offset hoặc dùng cursor theo thời gian thay vì index. Tránh `shrinkWrap` và đảm bảo `itemCount` chính xác.

**Cách xử lý:** key ổn định theo id; giữ `ScrollController`; nếu chèn đầu, điều chỉnh
offset hoặc dùng `reverse`/cursor hợp lý; tránh rebuild toàn list khi append.

```dart
ListView.builder(
  controller: _controller,
  itemCount: items.length,
  itemBuilder: (_, i) => WishCard(key: ValueKey(items[i].id), wish: items[i]),
);
```

**Điểm cộng:** dedupe theo id, `hasMore` đúng, hủy request cũ khi filter đổi, test scroll
tới cuối.

---

### S06. App bị OOM khi xem gallery ảnh cưới. [S]

**Nguyên nhân:** decode ảnh gốc 4000×3000 vào RAM, cache không giới hạn, giữ list ảnh full
resolution.

**Cách xử lý:** `cacheWidth/cacheHeight` theo kích thước hiển thị; `ResizeImage`; dùng
thumbnail từ server/CDN; giới hạn `ImageCache`; `precacheImage` có kiểm soát; dispose ảnh
lớn; theo dõi memory profile.

```dart
Image.network(
  url,
  cacheWidth: (MediaQuery.sizeOf(context).width * devicePixelRatio).round(),
  fit: BoxFit.cover,
);
```

**Điểm cộng:** server trả `srcset`/nhiều size; nén WebP/AVIF; lazy load; kiểm tra ảnh
animated (GIF) và native memory.

---

### S07. WebSocket mất event hoặc nhận trùng sau reconnect. [S]

**Nguyên nhân:** không có cursor/sequence, reconnect tạo subscription trùng, server replay
không idempotent, app background bị đóng socket.

**Cách xử lý:** mỗi event có `id`/`sequence`; client lưu cursor cuối; khi reconnect gửi
`since=cursor`; dedupe theo id; một socket singleton theo session; heartbeat; backoff +
jitter; đóng khi logout/background tùy nhu cầu.

```dart
final seen = <String>{};
void onEvent(WishEvent e) {
  if (!seen.add(e.id)) return;
  repository.apply(e);
}
```

**Điểm cộng:** xử lý gap (miss event) bằng REST resync; giới hạn queue; test reconnect;
metric lag/disconnect.

---

### S08. Refresh token gây vòng lặp 401 hoặc bão request. [S]

**Nguyên nhân:** mỗi request 401 tự gọi refresh; endpoint refresh cũng 401; refresh fail
nhưng vẫn retry; nhiều request đồng thời.

**Cách xử lý:** single-flight refresh; đánh dấu request đã retry; loại trừ endpoint auth;
nếu refresh fail → logout và clear queue; queue request chờ refresh; kiểm tra clock/expiry.

```dart
Future<String>? _refreshing;

Future<String> token() async {
  _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
  return _refreshing!;
}
```

**Điểm cộng:** refresh token rotation; revoke; không log token; test nhiều request đồng
thời; timeout refresh.

---

### S09. Gửi lời chúc offline bị trùng khi có mạng lại. [S]

**Cách xử lý:** idempotency key sinh ở client, lưu cùng outbox; server dedupe theo key;
retry an toàn; UI hiển thị `pending/sent/failed`; không xóa outbox trước khi server ACK;
đối chiếu khi sync.

**Điểm cộng:** thứ tự event, tombstone, conflict resolution, test app kill giữa lúc gửi.

---

### S10. Deep link mở app nhưng không điều hướng đúng khi cold start. [M]

**Nguyên nhân:** router khởi tạo trước khi auth/config sẵn sàng; `extra` không tồn tại sau
cold start; initial location ghi đè deep link; universal link chưa verify.

**Cách xử lý:** chờ bootstrap/auth xong mới build router; đọc `initialLocation`/route
information; fetch dữ liệu theo id thay vì `extra`; xử lý route không tồn tại; test cả
cold/warm start.

**Điểm cộng:** validate tham số, fallback web, logging; không đưa PII vào URL.

---

### S11. Push notification không đến trên iOS/Android. [M]

**Checklist:** quyền notification; APNs key/certificate; Firebase config; device token đã
gửi backend; topic/token đúng; app bị kill; background handler; notification channel
Android 8+; silent push không đảm bảo; test trên thiết bị thật (không chỉ emulator).

**Điểm cộng:** kiểm tra token refresh, log server-side, deep link khi tap, fallback in-app
khi push fail.

---

### S12. Crash chỉ xảy ra ở bản release. [S]

**Nguyên nhân:** AOT/tree shaking, obfuscation, R8 loại code, assert chứa logic, config/URL
khác, plugin thiếu rule, font/asset không đóng gói, quyền bị giới hạn.

**Cách xử lý:** build release có symbol; đọc stack đã symbolicate; thử tắt obfuscate/minify
để khoanh vùng; kiểm tra ProGuard/R8; test release trên thiết bị thật; thêm integration
smoke test trên artifact release.

**Điểm cộng:** lưu mapping/symbol; reproducible build; staged rollout; crash-free alert.

---

### S13. App khởi động chậm 4–5 giây. [S]

**Đo:** `flutter run --trace-startup`, DevTools timeline, đánh dấu time-to-first-frame và
time-to-interactive.

**Sửa:** giảm việc trong `main()`; lazy init plugin/analytics/DB; không await network trước
`runApp`; cache dữ liệu nhỏ; isolate cho parse lớn; giảm asset/font; deferred components;
splash hợp lý.

**Điểm cộng:** đo trên máy yếu, cold start vs warm start; không che giấu bằng splash quá lâu.

---

### S14. App size tăng vọt sau khi thêm một package. [M]

**Cách xử lý:** `flutter build appbundle --analyze-size`/`--analyze-size` để xem đóng góp;
kiểm tra native SDK/asset/font; thay package nhẹ hơn; split ABI; deferred components; xóa
asset không dùng; R8; theo dõi size budget trong CI.

**Điểm cộng:** so sánh download size vs install size; kiểm tra package license/maintenance;
không hy sinh UX chỉ để giảm vài KB.

---

### S15. CI test flaky, lúc pass lúc fail. [M]

**Nguyên nhân:** `sleep`/network thật, animation vô hạn, singleton giữ state, test order,
golden/font khác môi trường, race do thiếu `pump`.

**Cách xử lý:** fake clock/HTTP, reset state, test độc lập, `pump` đúng, pin font/engine,
chạy lặp để tìm, quarantine có owner. Không tăng timeout mù.

---

### S16. Golden test khác nhau giữa máy local và CI. [M]

**Nguyên nhân:** font/engine/OS, device pixel ratio, text rendering, thiếu font asset.

**Cách xử lý:** chạy golden trong container image cố định; load font test; set
`tester.view.devicePixelRatio`; cập nhật golden có review; chỉ golden cho component ổn định.

---

### S17. Memory tăng dần khi mở/đóng màn hình. [S]

**Kiểm tra:** controller/subscription/timer không dispose; listener không remove; static
giữ context; ảnh cache; native view. Dùng DevTools snapshot diff, retainers, `leak_tracker`.

```dart
@override
void dispose() {
  _controller.dispose();
  _sub.cancel();
  _timer?.cancel();
  super.dispose();
}
```

**Điểm cộng:** tái hiện bằng mở/đóng 20 lần; đo trước/sau; thêm test leak cho widget quan
trọng.

---

### S18. `flutter build ipa` fail ở CI nhưng máy local OK. [S]

**Nguyên nhân:** certificate/provisioning, keychain, CocoaPods, Xcode version, signing
identity, bundle id, missing API key, disk space.

**Cách xử lý:** dùng fastlane match/App Store Connect API key; log signing; pin Xcode/
CocoaPods; clean pod; build trên runner tương đương; lưu artifact log.

---

### S19. Android 15 edge-to-edge làm UI lệch status bar. [M]

**Cách xử lý:** dùng `SafeArea` cho nội dung cần tránh, cập nhật `WindowCompat`/theme, kiểm
tra `MediaQuery.padding`, không hardcode status bar height; test gesture navigation và
3-button navigation.

**Điểm cộng:** xử lý contrast icon status bar, notch, landscape; kiểm tra target SDK mới.

---

### S20. State mất khi xoay màn hình hoặc chuyển tab. [M]

**Nguyên nhân:** widget bị remove khỏi tree; key đổi; `UniqueKey`; tab dùng `PageView`
không keep alive.

**Cách xử lý:** `IndexedStack`, `AutomaticKeepAliveClientMixin`, `PageStorageKey`; key ổn
định; đưa state cần giữ vào controller/provider; `RestorationMixin` cho process death.

**Bẫy:** giữ state trong widget rồi kỳ vọng sống mãi; dùng global singleton cho mọi thứ.

---

## 3. Code review

### S21. Review đoạn code sau. [M]

```dart
class _WishListState extends State<WishList> {
  List<Wish> wishes = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    final data = await api.getMessages();
    setState(() => wishes = data);
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: wishes.length,
      itemBuilder: (context, i) => WishCard(wish: wishes[i]),
    );
  }
}
```

**Vấn đề:**

1. `setState` sau `await` không kiểm tra `mounted` → crash khi rời màn hình.
2. Không xử lý loading/error/empty.
3. Không có key cho item → state sai khi list đổi.
4. `api` phụ thuộc trực tiếp, khó test.
5. Không hủy request khi dispose.
6. List không phân trang/cache; nếu dài sẽ tải hết.
7. Không có retry/refresh.

**Sửa:** dùng repository inject, `AsyncValue`/state rõ ràng, `mounted`, key, loading/error/
empty, `RefreshIndicator`, phân trang; test.

**Điểm cộng:** khen điểm tốt (dùng builder), đề xuất thay đổi nhỏ có thể merge, không bắt
viết lại toàn bộ.

---

### S22. Review đoạn code sau. [M]

```dart
final controller = TextEditingController();

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return TextField(controller: controller);
  }
}
```

**Vấn đề:** controller toàn cục không dispose, giữ state giữa các lần mở app/test; widget
stateless nhưng giữ mutable; không có validation/loading; keyboard/focus chưa xử lý.

**Sửa:** `StatefulWidget` + `late final controller` + dispose; hoặc dùng `TextFormField`
với `initialValue` nếu không cần controller; inject auth service; test.

---

### S23. Review đoạn code sau. [S]

```dart
Future<void> refreshToken() async {
  final response = await dio.post('/auth/refresh', data: {'token': refreshToken});
  accessToken = response.data['accessToken'];
}

@override
void onError(DioException err, ErrorInterceptorHandler handler) async {
  if (err.response?.statusCode == 401) {
    await refreshToken();
    final retry = await dio.fetch(err.requestOptions);
    handler.resolve(retry);
    return;
  }
  handler.next(err);
}
```

**Vấn đề:** mọi request 401 đều refresh (bão request); không single-flight; refresh endpoint
có thể 401 gây loop; không retry giới hạn; không xử lý refresh fail/logout; race khi nhiều
request; token lưu không an toàn.

**Sửa:** single-flight, exclude auth endpoint, mark retried, queue, logout on failure, secure
storage, test concurrency.

---

### S24. Review kiến trúc: mọi thứ nằm trong một `AppState`. [S]

**Vấn đề:** một provider/bloc khổng lồ gây rebuild toàn app, khó test, merge conflict, state
không liên quan bị reset, lifecycle không rõ.

**Sửa:** tách theo feature/domain (auth, guestbook, theme); state immutable; dependency
một chiều; selector để giới hạn rebuild; command rõ ràng; test từng phần.

---

### S25. Review bảo mật một app guestbook. [S]

**Checklist:**

- Token trong secure storage, không log.
- HTTPS/WSS, cân nhắc pinning + rotation.
- Không có secret/API key trong binary.
- Validate input, sanitize nội dung (XSS nếu hiển thị webview).
- Deep link validate, không mở URL tùy ý.
- Ảnh/URL signed, không public bucket.
- Quyền tối thiểu, privacy manifest/Data Safety.
- Rate limit server-side, authz cho moderation.
- Backup/screenshot/clipboard cho màn hình nhạy cảm.
- Dependency scan, obfuscation + symbol.

**Điểm cộng:** client không đáng tin; server phải kiểm soát; có threat model và test.

---

## 4. System design và behavioral

### S26. Thiết kế app guestbook realtime với 10k khách, 100k lời chúc. [S]

**Làm rõ:** read/write ratio, moderation, offline, ảnh, ngôn ngữ, mùa cưới (traffic spike).

**Thiết kế:**

- Mobile: local cache/DB, cursor pagination, WS reconnect, outbox.
- API: REST + auth/rate limit/idempotency; moderation queue; input validation.
- DB: messages + indexes; cursor `(created_at,id)`; partition nếu cần.
- Realtime: WS gateway + pub/sub; event id/sequence; resume; fan-out; fallback polling.
- Storage/CDN cho ảnh.
- Observability: trace, error, WS lag, moderation SLA.

**Trade-off:** consistency vs latency; moderation async vs immediate; cache invalidation;
cost WS vs polling.

---

### S27. Thiết kế offline sync cho app có nhiều thiết bị cùng user. [S]

**Trả lời:** Server là authority; client local DB + outbox; mỗi mutation có idempotency key
+ version; conflict strategy theo domain; khi pull, merge theo version; UI hiển thị xung
đột; tombstone cho delete; cursor sync; test mất mạng/kill app/đa thiết bị.

---

### S28. Kể về lần bạn từ chối một yêu cầu kỹ thuật. [S]

**Gợi ý:** Yêu cầu thêm SDK analytics nặng vào app. Bạn phân tích size, privacy, crash
risk, maintenance; đề xuất SDK nhẹ hơn/self-host; đo PoC; thuyết phục bằng dữ liệu; nêu
trade-off. Kết quả: giảm size, đáp ứng mục tiêu đo lường. Bài học: nói "không" kèm phương
án thay thế.

---

### S29. Kể về lần bạn làm hỏng production. [S]

**Gợi ý:** Release đổi API parse làm trắng màn hình. Bạn phát hiện qua crash-free alert,
tắt flag/rollback server, thêm fallback parse, test contract, postmortem. Kết quả: thời
gian khôi phục ngắn, bài học về schema evolution. Trung thực, tập trung vào hệ thống và
hành động sửa.

---

### S30. Bạn ưu tiên feature hay độ ổn định khi gần release? [S]

**Trả lời:** Không nhị phân. Phân loại rủi ro: feature có thể sau release bằng flag; bug
chặn luồng chính/bảo mật phải sửa; nợ kỹ thuật ghi lại. Dùng tiêu chí release (crash-free,
test, performance, store) và thương lượng scope với product. Không che giấu rủi ro.

---

## 5. Tình huống bổ sung

### S31. `RenderBox was not laid out`. [M]

**Hiện tượng:** Exception khi widget chưa được layout nhưng bị đọc `size`, thường do
`Column`/`Row` lồng trong scroll mà không có constraint, hoặc dùng `Positioned` sai.

**Trả lời:** Đọc stack trace để tìm widget gây lỗi; kiểm tra parent có truyền constraint
hữu hạn không. Các nguyên nhân hay gặp: `ListView`/`Expanded` trong `Column` không được bọc
`Expanded`, `Positioned` ngoài `Stack`, `IntrinsicHeight` với con không layout được, hoặc
truy cập `context.size` quá sớm.

```dart
Column(children: [
  const Header(),
  Expanded(child: ListView.builder(...)), // tránh ListView trần trong Column
])
```

**Điểm cộng:** dùng `flutter run --debug` + widget inspector; hiểu constraint đi xuống;
không "sửa" bằng `shrinkWrap` mọi nơi vì che lỗi và gây chậm.

---

### S32. `Incorrect use of ParentDataWidget`. [M]

**Hiện tượng:** `Expanded`, `Flexible`, `Positioned` hoặc `AspectRatio` bị đặt sai parent,
ví dụ `Expanded` nằm trong `Padding` thay vì trực tiếp trong `Row`/`Column`.

**Trả lời:** ParentDataWidget phải là con **trực tiếp** của RenderObjectWidget tương ứng
(`Expanded` → `Flex`; `Positioned` → `Stack`). Bọc đúng cấu trúc hoặc đổi widget; đọc stack
trace để tìm cặp parent/con sai.

```dart
Row(children: [
  Expanded( // trực tiếp trong Row
    child: Padding(padding: ..., child: Text(...)),
  ),
])
```

**Điểm cộng:** hiểu ParentData là dữ liệu parent ghi vào RenderObject con; không bọc
`Expanded` trong `SizedBox`/`Padding` rồi đặt vào `Row`; kiểm tra khi refactor layout.

---

### S33. `Vertical viewport was given unbounded height`. [M]

**Hiện tượng:** `ListView`/`GridView`/`SingleChildScrollView` nằm trong `Column` hoặc scroll
khác mà không có chiều cao hữu hạn.

**Trả lời:** Scrollable cần constraint hữu hạn theo trục cuộn. Sửa bằng `Expanded`/`Flexible`
bao scrollable trong `Column`, đặt `shrinkWrap: true` + `physics: NeverScrollableScrollPhysics`
(nếu thật cần, chấp nhận chậm), hoặc chuyển sang `CustomScrollView` với sliver.

```dart
Column(children: [
  const Title(),
  Expanded(child: ListView(children: items)),
])
```

**Điểm cộng:** tránh lồng scroll cùng hướng; ưu tiên sliver; `shrinkWrap` làm layout toàn bộ
list nên không dùng cho list dài; kiểm tra `LayoutBuilder` constraint.

---

### S34. `setState() or markNeedsBuild() called during build`. [M]

**Hiện tượng:** Gọi `setState`, `notifyListeners`, hoặc thay đổi provider ngay trong `build`
của widget khác.

**Trả lời:** Không mutate state đồng bộ trong build. Chuyển sang `initState`,
`didChangeDependencies`, callback (`onPressed`), hoặc `WidgetsBinding.instance.addPostFrameCallback`
nếu buộc phải chạy sau frame. Với provider, dùng `ref.listen` cho side effect thay vì cập
nhật provider trong build.

```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted) controller.refresh();
  });
}
```

**Điểm cộng:** tìm nguồn gọi bằng stack trace; không dùng `Future.microtask` tràn lan; hiểu
side effect thuộc lifecycle nào; test bằng widget test.

---

### S35. `Duplicate GlobalKey` exception. [M]

**Hiện tượng:** Cùng một `GlobalKey` xuất hiện ở hai vị trí trong widget tree tại cùng thời
điểm, thường do list/route/overlay.

**Trả lời:** `GlobalKey` phải duy nhất toàn app. Tạo key một lần và tái sử dụng đúng chỗ;
không tạo trong `build`; xóa key khỏi widget cũ trước khi dùng lại. Với list, dùng
`ValueKey` thay vì `GlobalKey`. Nếu cần move widget, dùng `GlobalKey` có kiểm soát.

```dart
final _formKey = GlobalKey<FormState>(); // field của State, không tạo trong build
```

**Điểm cộng:** hiểu GlobalKey đăng ký trong global registry; lạm dụng GlobalKey làm mất
encapsulation và tăng chi phí; debug bằng widget inspector/error stack.

---

### S36. `MissingPluginException` sau khi thêm plugin. [M]

**Hiện tượng:** Gọi method plugin nhưng native side chưa đăng ký, thường sau hot restart,
đổi flavor, hoặc thêm plugin chưa `pub get`/build lại.

**Trả lời:** Dừng app, chạy `flutter clean`, `flutter pub get`, build lại (không chỉ hot
reload); kiểm tra plugin hỗ trợ nền tảng/flavor hiện tại; iOS chạy `pod install`; Android
kiểm tra plugin registration và `minSdk`. Nếu plugin tự viết, kiểm tra `PluginRegistrant`.

**Điểm cộng:** hiểu hot reload không nạp native code; kiểm tra log native; test trên cả hai
nền tảng; pin phiên bản plugin tương thích Flutter.

---

### S37. `SocketException: Connection refused` trên máy thật. [M]

**Hiện tượng:** App gọi `localhost` hoặc IP sai; Android emulator cần `10.0.2.2`, iOS
simulator dùng `localhost`; máy thật cần IP LAN và server listen `0.0.0.0`.

**Trả lời:** Kiểm tra base URL theo môi trường, firewall, cùng mạng Wi-Fi, server bind đúng
interface; Android 9+ chặn cleartext HTTP — dùng HTTPS hoặc `networkSecurityConfig` cho dev;
kiểm tra CORS chỉ liên quan web.

**Điểm cộng:** cấu hình qua `--dart-define`; không hardcode IP; test timeout/DNS; log lỗi
network có mã; không bật cleartext cho production.

---

### S38. `HandshakeException` hoặc certificate pinning fail. [M]

**Hiện tượng:** TLS handshake lỗi do cert hết hạn, sai hostname, CA không tin cậy, proxy
doanh nghiệp, hoặc pinning cấu hình sai.

**Trả lời:** Kiểm tra cert chain/hostname/thời hạn bằng `openssl s_client`; đảm bảo pin
SPKI đúng và có pin dự phòng; không tắt validate trong production. Với proxy nội bộ, cần
cấu hình trust hợp lý; test trên thiết bị thật và mạng thật.

**Điểm cộng:** có telemetry riêng cho lỗi TLS; quy trình rotate pin; không dùng
`badCertificateCallback => true`; kiểm tra sau khi đổi CDN/cert.

---

### S39. Push token không đổi hoặc không nhận sau reinstall. [M]

**Hiện tượng:** Token cũ còn trên server, user cài lại app nhận token mới, hoặc notification
không đến do quyền/channel.

**Trả lời:** Luôn đăng ký lại token khi app start/login, gửi lên server và xoá token cũ khi
logout; xử lý token refresh; kiểm tra quyền, channel Android, APNs key/cert, môi trường
sandbox/production. Test foreground/background/killed.

**Điểm cộng:** map token ↔ user/device, revoke khi logout; idempotent registration; theo dõi
delivery; không gửi PII trong payload; xử lý notification mở app đúng route.

---

### S40. ANR do xử lý nặng trên main isolate. [M]

**Hiện tượng:** UI đứng >5s (Android ANR), app bị kill hoặc watchdog iOS; thường do parse
JSON lớn, đọc file, mã hoá, hoặc chờ đồng bộ trong `main`.

**Trả lời:** Chuyển tác vụ CPU sang `Isolate.run`/`compute`, I/O sang async; không chờ
network đồng bộ; chia nhỏ batch; hiển thị loading và cho phép huỷ. Đo bằng DevTools/Timeline
và kiểm tra frame.

```dart
final parsed = await Isolate.run(() => parseLargeJson(raw));
```

**Điểm cộng:** không spawn isolate cho việc nhỏ; dùng `TransferableTypedData` cho dữ liệu lớn;
xử lý lỗi isolate; test trên thiết bị thấp; tránh `await` vô hạn trong init.

---

### S41. Bottom sheet/dialog mở lần đầu bị giật. [S]

**Hiện tượng:** Frame đầu của animation bị spike do shader compile, layout phức tạp, ảnh
chưa decode, hoặc blur/shadow nặng.

**Trả lời:** Profile mode để xác định UI hay raster; giảm blur/shadow/`saveLayer`; preload/
decode ảnh đúng size; giữ cây widget nhẹ; với shader lần đầu, cân nhắc Impeller hoặc warm-up
có kiểm soát. Đo frame đầu thay vì chỉ frame trung bình.

**Điểm cộng:** không "sửa" bằng cách thêm splash; kiểm tra low-end; dùng `RepaintBoundary`
đúng chỗ; theo dõi regression sau khi đổi hiệu ứng.

---

### S42. App bị kill khi nền, mất draft form. [M]

**Hiện tượng:** User nhập liệu, chuyển app, OS kill; quay lại form trắng.

**Trả lời:** Lưu draft debounce vào local (và secure nếu nhạy cảm), khôi phục khi mở lại;
dùng `RestorationMixin`/`RestorableTextEditingController` cho state nhỏ; lưu theo user/form
id; xoá draft sau submit. Không coi draft là bản ghi chính thức.

**Điểm cộng:** xử lý conflict draft cũ/mới; giới hạn dung lượng; bảo mật dữ liệu; test kill
giữa lúc nhập; thông báo khôi phục cho user.

---

### S43. Ngày giờ hiển thị lệch múi giờ. [M]

**Hiện tượng:** Server trả UTC nhưng app hiển thị sai, hoặc gửi local time lên server; lệch
do parse không có `Z`/offset hoặc dùng `DateTime.now()`.

**Trả lời:** Chuẩn hoá API dùng ISO-8601 UTC; parse và chuyển `toLocal()` khi hiển thị;
format theo locale/timezone; test với timezone khác và DST. Lưu UTC trong DB.

**Điểm cộng:** dùng `package:timezone` cho lịch/nhắc hẹn; không cộng offset thủ công; kiểm
tra server/client clock skew; test CI ở timezone khác.

---

### S44. iOS build fail sau khi update Xcode/CocoaPods. [S]

**Hiện tượng:** Pod install lỗi, deployment target thấp, Swift version mismatch, hoặc plugin
chưa hỗ trợ Xcode mới.

**Trả lời:** Đọc log lỗi cụ thể; chạy `pod repo update`, `pod install --repo-update`, xoá
`Pods/` + `Podfile.lock` nếu cần; nâng deployment target; cập nhật plugin/Flutter; kiểm tra
signing/provisioning; build trên CI sạch.

**Điểm cộng:** pin Xcode/Flutter trong CI; không commit `Pods`; đọc `Podfile.lock`; tách
bước build native; thông báo team trước khi nâng major.

---

### S45. Android build lỗi duplicate class/không tìm thấy SDK. [S]

**Hiện tượng:** Nhiều dependency kéo cùng class, xung đột AndroidX/Support, thiếu
`compileSdk`/NDK, hoặc R8 loại nhầm class.

**Trả lời:** Chạy `./gradlew app:dependencies` tìm trùng; dùng BOM/version catalog; exclude
module trùng; nâng `compileSdk`/`minSdk`; thêm keep rule cho plugin nếu R8; chạy `flutter
clean` và build lại. Kiểm tra log Gradle đầy đủ.

**Điểm cộng:** tái hiện trên CI sạch; tránh `force` mọi version; theo dõi release note SDK;
giữ build reproducible; test release thật.

---

### S46. Hot reload không áp dụng thay đổi. [M]

**Hiện tượng:** Sửa code nhưng UI không đổi; thường do thay đổi native, `main`, global/static
initializer, enum/const, hoặc file mới chưa được import.

**Trả lời:** Hot reload chỉ áp dụng một số thay đổi; dùng hot restart cho state/global/native;
build lại khi sửa plugin/Manifest/Info.plist. Kiểm tra terminal log, chạy `flutter clean` nếu
cache lỗi, và xác nhận đang chạy đúng flavor/entrypoint.

**Điểm cộng:** hiểu hot reload giữ state, hot restart mất state; dùng `--verbose` khi cần;
không mất thời gian khi lỗi là do build cũ; kiểm tra IDE chạy đúng file.

---

### S47. `pub get` báo version solving failed. [M]

**Hiện tượng:** Ràng buộc version giữa package không tương thích, hoặc SDK/Flutter quá cũ/mới.

**Trả lời:** Đọc thông báo package xung đột; nâng/ hạ ràng buộc hợp lý; chạy `flutter pub
outdated`; ưu tiên package còn maintain; dùng dependency override tạm thời chỉ khi hiểu rủi
ro; cập nhật Flutter/Dart nếu package yêu cầu.

**Điểm cộng:** commit lockfile; không override vô tội vạ; kiểm tra changelog breaking changes;
tách PR nâng dependency; có kế hoạch bỏ package bỏ hoang.

---

### S48. Test pass local nhưng fail trên CI. [M]

**Hiện tượng:** Khác timezone/locale, font không có, golden khác rendering, test phụ thuộc
thứ tự, hoặc chạy song song.

**Trả lời:** Cố định timezone/locale trong test; dùng font test ổn định; golden chạy trên
cùng môi trường/image; tránh shared state giữa test; đặt seed cho random; chạy `--concurrency=1`
để khoanh vùng. So sánh artifact/log CI với local.

**Điểm cộng:** dùng container/device farm; golden cập nhật có review; quarantine test flaky
có owner; không retry che lỗi; test deterministic.

---

### S49. App bị store reject vì privacy/tracking. [S]

**Hiện tượng:** Thiếu privacy manifest, khai báo tracking sai, dùng SDK quảng cáo không khai
báo, hoặc yêu cầu quyền không có mục đích rõ.

**Trả lời:** Rà soát dữ liệu thu thập và SDK bên thứ ba; cập nhật privacy manifest/
nutrition label; hiển thị ATT đúng lúc và xử lý từ chối; chỉ xin quyền cần thiết; giải trình
trong App Store Connect; test lại trên bản build nộp.

**Điểm cộng:** data map end-to-end; consent trước khi collect; SDK index; kiểm tra Google
Play Data safety; không che giấu tracking; có owner compliance.

---

### S50. Analytics bắn trùng event sau retry/resume. [M]

**Hiện tượng:** Event gửi lại khi mạng lỗi, app resume, hoặc retry request; dashboard tăng
ảo.

**Trả lời:** Gắn `event_id`/`idempotencyKey`, dedupe ở client và server analytics; chỉ gửi
một lần sau khi action thành công; phân biệt retry kỹ thuật với action mới; kiểm tra lifecycle
(resume không bắn lại). Có thể buffer và flush có kiểm soát.

**Điểm cộng:** test event schema; sampling; debug mode; theo dõi funnel; tránh PII; có tài
liệu taxonomy và version; không log event trong build/hot reload lặp.

---

## 6. Rapid-fire 90 câu

| # | Câu hỏi | Đáp án ngắn |
|---|---|---|
| R01 | `final` khác `const`? | `final` runtime một lần; `const` compile-time, canonicalized. |
| R02 | `late` là gì? | Khởi tạo lười, phải gán trước khi đọc. |
| R03 | `dynamic` vs `Object?`? | `dynamic` tắt kiểm tra tĩnh; `Object?` vẫn an toàn kiểu. |
| R04 | `Future` vs `Stream`? | Một giá trị vs nhiều giá trị theo thời gian. |
| R05 | Microtask vs event? | Microtask chạy trước event trong cùng event loop. |
| R06 | `Future.wait` làm gì? | Chờ tất cả, trả list; mặc định fail-fast. |
| R07 | Isolate chia sẻ memory? | Không; giao tiếp qua port/message. |
| R08 | `Isolate.run` dùng khi nào? | Tác vụ CPU nặng one-shot. |
| R09 | Mixin là gì? | Tái sử dụng hành vi theo chiều ngang. |
| R10 | Extension thêm field được không? | Không. |
| R11 | `sealed class` để làm gì? | Giới hạn subclass, switch exhaustive. |
| R12 | Record dùng khi nào? | Trả nhiều giá trị nhỏ, không cần class. |
| R13 | `factory` constructor khác gì? | Có thể trả instance có sẵn/subclass, không nhất thiết tạo mới. |
| R14 | Override `==` cần gì? | Override cả `hashCode`. |
| R15 | `Error` vs `Exception`? | Error là lỗi lập trình; Exception dự kiến có thể xử lý. |
| R16 | `rethrow` khác `throw e`? | Giữ nguyên stack trace. |
| R17 | Stream broadcast là gì? | Nhiều listener, không buffer cho listener mới. |
| R18 | Ba cây của Flutter? | Widget, Element, RenderObject. |
| R19 | Widget có giữ state? | Không; State nằm ở State object/Element. |
| R20 | `setState` làm gì? | Mark dirty, schedule frame, rebuild. |
| R21 | `mounted` để làm gì? | Kiểm tra State còn trong tree sau async. |
| R22 | `BuildContext` là gì? | Handle tới vị trí Element trong tree. |
| R23 | `ValueKey` dùng khi nào? | Item list cần identity ổn định. |
| R24 | `GlobalKey` hại gì? | Đắt, dễ trùng, phá encapsulation. |
| R25 | `const` widget giúp gì? | Giảm rebuild subtree khi instance không đổi. |
| R26 | Build phải thuần vì sao? | Có thể gọi nhiều lần, không side effect. |
| R27 | Constraints đi hướng nào? | Xuống; size đi lên; parent đặt vị trí. |
| R28 | `Expanded` vs `Flexible`? | Tight vs loose fit. |
| R29 | `Spacer` là gì? | `Expanded` chứa `SizedBox.shrink`. |
| R30 | `ListView` vs `SingleChildScrollView`? | Lazy vs build toàn bộ. |
| R31 | `shrinkWrap` hại gì? | Layout toàn bộ list, chậm. |
| R32 | `CustomScrollView` dùng gì? | Sliver. |
| R33 | `SafeArea` để làm gì? | Tránh notch/status bar/home indicator. |
| R34 | `MediaQuery.sizeOf` hơn gì? | Chỉ rebuild khi size đổi. |
| R35 | `Hero` cần gì? | Tag duy nhất giữa hai route. |
| R36 | Implicit vs explicit animation? | Tự animate vs controller kiểm soát. |
| R37 | Controller phải làm gì? | `dispose()` sau khi dùng. |
| R38 | `FutureBuilder` bẫy chính? | Tạo future trong build. |
| R39 | `StreamBuilder` cần xử lý gì? | Loading/error/data, stream ổn định. |
| R40 | `http` vs `dio`? | Nhẹ vs interceptor/cancel/retry. |
| R41 | Retry request nào? | Idempotent + lỗi tạm thời, có backoff. |
| R42 | Token lưu ở đâu? | Secure storage (Keychain/Keystore). |
| R43 | Refresh token nên làm gì? | Single-flight, retry một lần, logout nếu fail. |
| R44 | WebSocket reconnect cần gì? | Backoff + jitter, heartbeat, cursor, dedupe. |
| R45 | Offline-first source of truth? | Local DB, không phải list trong widget. |
| R46 | Idempotency key để làm gì? | Tránh gửi trùng khi retry. |
| R47 | Cursor pagination hơn offset? | Ổn định khi dữ liệu đổi, nhanh hơn offset lớn. |
| R48 | Cache invalidation khi nào? | Sau mutation, logout, TTL, version. |
| R49 | `InheritedWidget` rebuild ai? | Các dependent đã đăng ký. |
| R50 | `watch` vs `read`? | Reactive trong build vs đọc một lần trong callback. |
| R51 | Riverpod `autoDispose`? | Hủy state khi không còn listener. |
| R52 | Bloc vs Cubit? | Event-driven/audit vs gọi method trực tiếp. |
| R53 | Clean architecture cốt lõi? | Dependency rule + testability, không phải số lớp. |
| R54 | DI ưu tiên? | Constructor injection, override dễ test. |
| R55 | go_router redirect để làm gì? | Auth guard/điều hướng khai báo. |
| R56 | Deep link cold start cần gì? | Chờ bootstrap, fetch theo id, xử lý route sai. |
| R57 | Profile mode để làm gì? | Đo performance gần release. |
| R58 | Frame budget 60/120Hz? | 16.7ms / 8.3ms. |
| R59 | `RepaintBoundary` để làm gì? | Cắt repaint subtree. |
| R60 | Release crash không thấy ở debug vì sao? | AOT/tree shaking/R8/obfuscation/config khác. |
| R61 | App size giảm bằng gì? | Split ABI, tree shaking, asset/font, deferred components. |
| R62 | Golden test dùng khi nào? | Regression visual/design system. |
| R63 | `pumpAndSettle` bẫy? | Treo với animation vô hạn. |
| R64 | CI nên chạy gì? | Format, analyze, test, build, artifact/signing. |
| R65 | Feature flag để làm gì? | Rollout/kill switch/tách release khỏi deploy. |
| R66 | Certificate pinning trade-off? | An toàn hơn nhưng cần rotation/fallback. |
| R67 | Không nhúng secret vào app vì sao? | Binary có thể bị dịch ngược; client không tin cậy. |
| R68 | Crash-free sessions là gì? | % session không crash — metric release health. |
| R69 | `Semantics` để làm gì? | Cung cấp thông tin cho screen reader. |
| R70 | Text scale 200% ảnh hưởng gì? | Overflow/layout; phải test accessibility. |

---

## 7. Rapid-fire bổ sung

| # | Câu hỏi | Đáp án ngắn |
|---|---|---|
| R71 | `extension type` là gì? | Wrapper zero-cost quanh kiểu khác, kiểu mới ở compile-time. |
| R72 | `sealed class` khác `abstract class`? | Sealed giới hạn subclass trong cùng library, switch exhaustive. |
| R73 | Record so sánh bằng gì? | So sánh từng field theo `==`/`hashCode` cấu trúc. |
| R74 | Guard trong pattern là gì? | `case X when condition` — thêm điều kiện cho pattern. |
| R75 | `whereType<T>()` làm gì? | Lọc phần tử đúng kiểu `T`, an toàn hơn cast. |
| R76 | `FutureOr<T>` dùng khi nào? | API nhận cả giá trị đồng bộ và Future. |
| R77 | `Zone` dùng để làm gì? | Bắt lỗi async, thay đổi behavior theo vùng thực thi. |
| R78 | `GlobalKey` lấy state thế nào? | `key.currentState`/`currentContext`, chỉ khi widget mounted. |
| R79 | `SliverFillRemaining` dùng khi nào? | Lấp phần còn lại của viewport, ví dụ empty state. |
| R80 | `AnimatedSwitcher` khác `AnimatedCrossFade`? | Switcher đổi child bất kỳ; CrossFade chuyển giữa hai child. |
| R81 | `IntrinsicHeight` có hại gì? | Nhiều pass layout, chậm trong list/cây sâu. |
| R82 | `textScalerOf` để làm gì? | Đọc text scale hiện tại mà không rebuild theo toàn MediaQuery. |
| R83 | `ScaffoldMessenger` khác `Scaffold`? | Quản lý SnackBar toàn cục, sống qua route. |
| R84 | `Hero` trùng tag thì sao? | Lỗi/không xác định; tag phải duy nhất trong mỗi subtree. |
| R85 | Dio `validateStatus` để làm gì? | Tự quyết định status nào là thành công/không ném lỗi. |
| R86 | Idempotency key là gì? | Khóa để retry không tạo bản ghi trùng. |
| R87 | ETag dùng để làm gì? | Cache validation: gửi `If-None-Match`, nhận 304. |
| R88 | Isolate có chung heap không? | Không; giao tiếp qua message/port. |
| R89 | App Bundle khác APK? | Bundle tối ưu theo thiết bị/ABI, store sinh APK; APK là file cài trực tiếp. |
| R90 | `--split-debug-info` để làm gì? | Tách symbol khỏi binary để giảm size và đọc crash sau obfuscate. |

---

## 8. Tài liệu tham khảo

- Flutter debugging: https://docs.flutter.dev/testing/debugging
- Flutter performance: https://docs.flutter.dev/perf
- Flutter security: https://docs.flutter.dev/security
- OWASP MASVS: https://mas.owasp.org/MASVS/
- Android App Links: https://developer.android.com/training/app-links
- Apple Universal Links: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app

---

*Quay lại [`README.md`](./README.md) để xem lộ trình ôn và ma trận câu hỏi.*
