# Flutter production — Phát hành app wedding guestbook

> Checklist thực chiến để đưa app từ `flutter run` ra Google Play/App Store: flavor,
> signing, build, store listing, privacy, push, monitoring, rollout và rollback. Ví dụ
> gắn với backend `/api/messages` + `/ws`; mọi thao tác phải dùng HTTPS/WSS.

---

## Mục lục

1. [Ma trận môi trường](#1-ma-trận-môi-trường)
2. [Flavor và cấu hình build](#2-flavor-và-cấu-hình-build)
3. [App identity, version và build number](#3-app-identity-version-và-build-number)
4. [Signing Android](#4-signing-android)
5. [Signing iOS](#5-signing-ios)
6. [Build artifact và tối ưu kích thước](#6-build-artifact-và-tối-ưu-kích-thước)
7. [CI/CD phát hành](#7-cicd-phát-hành)
8. [Store listing và asset](#8-store-listing-và-asset)
9. [Quyền, privacy và Data Safety](#9-quyền-privacy-và-data-safety)
10. [Push notification](#10-push-notification)
11. [Deep link và universal link](#11-deep-link-và-universal-link)
12. [Monitoring và analytics](#12-monitoring-và-analytics)
13. [Quy trình release và staged rollout](#13-quy-trình-release-và-staged-rollout)
14. [Rollback và hotfix](#14-rollback-và-hotfix)
15. [Incident response](#15-incident-response)
16. [Checklist trước phát hành](#16-checklist-trước-phát-hành)
17. [Tài liệu tham khảo](#17-tài-liệu-tham-khảo)

---

## 1. Ma trận môi trường

Tối thiểu ba môi trường, tách biệt dữ liệu và signing:

| Môi trường | API | App ID | Mục đích |
|---|---|---|---|
| dev | `http://10.0.2.2:3000` | `com.example.wedding.dev` | Dev máy local |
| staging | `https://staging-api.example.com` | `com.example.wedding.staging` | QA/UAT, dữ liệu giả |
| prod | `https://api.example.com` | `com.example.wedding` | Khách thật, store |

Quy tắc:

- Không dùng chung database staging/prod; seed dữ liệu giả trước khi test.
- Prod chỉ HTTPS/WSS; cleartext HTTP chỉ bật trong debug manifest.
- Mỗi flavor có tên app, icon badge và bundle id riêng để cài song song.
- Backend hiện chưa có auth: **không** phát hành màn hình xóa/sửa cho guest; nếu cần
  moderation, bổ sung auth trước hoặc dùng công cụ nội bộ riêng.

> ⚠️ Đổi bundle id sau khi phát hành là gần như không thể trên store. Chốt
> `applicationId`/`PRODUCT_BUNDLE_IDENTIFIER` trước build đầu tiên.

---

## 2. Flavor và cấu hình build

Khai báo flavor Android trong `android/app/build.gradle` (Groovy):

```gradle
android {
    flavorDimensions "env"
    productFlavors {
        dev {
            dimension "env"
            applicationIdSuffix ".dev"
            resValue "string", "app_name", "Wedding Dev"
        }
        prod {
            dimension "env"
            resValue "string", "app_name", "Wedding Guestbook"
        }
    }
}
```

iOS tạo scheme `dev`/`prod` trong Xcode, mỗi scheme gắn bundle id và team tương ứng.
Dùng entry point riêng để tránh nhầm cấu hình:

```text
lib/main_dev.dart
lib/main_prod.dart
config/dev.json
config/prod.json
```

`config/dev.json` trỏ backend local — Android emulator dùng `10.0.2.2`, iOS simulator
dùng `localhost` (thiết bị thật dùng IP LAN của máy dev):

```json
{
  "API_BASE_URL": "http://10.0.2.2:3000",
  "WS_URL": "ws://10.0.2.2:3000/ws",
  "SENTRY_DSN": ""
}
```

`config/prod.json` dùng domain thật, bắt buộc `https://` và `wss://`:

```json
{
  "API_BASE_URL": "https://api.example.com",
  "WS_URL": "wss://api.example.com/ws",
  "SENTRY_DSN": "https://<key>@o0.ingest.sentry.io/0"
}
```

```bash
flutter run --flavor dev -t lib/main_dev.dart \
  --dart-define-from-file=config/dev.json
flutter build appbundle --flavor prod -t lib/main_prod.dart \
  --dart-define-from-file=config/prod.json
```

`--dart-define-from-file` có từ Flutter 3.7; với bản cũ hơn dùng nhiều
`--dart-define=KEY=value`. Không đưa signing password vào file JSON được commit.

> 💡 `String.fromEnvironment` phải dùng `const` để đọc đúng giá trị:
> `const apiBaseUrl = String.fromEnvironment('API_BASE_URL');`

Kiểm tra cấu hình ngay khi khởi động, đừng để app chạy với URL rỗng:

```dart
void main() {
  const api = String.fromEnvironment('API_BASE_URL');
  const ws = String.fromEnvironment('WS_URL');
  if (api.isEmpty || ws.isEmpty) {
    throw StateError('Thiếu API_BASE_URL hoặc WS_URL');
  }
  if (kReleaseMode && (!api.startsWith('https://') || !ws.startsWith('wss://'))) {
    throw StateError('Bản production bắt buộc HTTPS/WSS');
  }
  runApp(const ProviderScope(child: WeddingApp()));
}
```

---

## 3. App identity, version và build number

`pubspec.yaml` là nguồn version duy nhất:

```yaml
version: 1.4.0+14
```

- `1.4.0` là **versionName** (người dùng thấy), `14` là **versionCode/buildNumber**.
- Mỗi lần upload store phải tăng build number, kể cả hotfix.
- Android `versionCode` tối đa 2.1 tỷ; iOS `CFBundleVersion` chỉ tăng, không giảm.
- Gắn version vào Sentry/Crashlytics và log để đối chiếu sự cố.

```bash
flutter build appbundle --build-name=1.4.0 --build-number=14
```

Không sửa version trong Xcode/Gradle lệch với `pubspec.yaml`; nếu buộc phải override,
ghi lại trong release note để tránh nhầm build.

| Loại release | Ví dụ | Quy ước |
|---|---|---|
| Feature | `1.5.0+15` | Tăng minor, build +1 |
| Hotfix | `1.4.1+16` | Tăng patch, build +1 |
| Build nội bộ | `1.4.0+14-dev.1` | Không upload store |

Trước ngày cưới, ghi version đang chạy vào một bảng nội bộ kèm link artifact. Nếu phải
hạ version vì lỗi, tạo build mới với build number cao hơn — store không nhận build thấp
hơn build đã publish.

---

## 4. Signing Android

Tạo keystore một lần, backup an toàn (mất keystore = không update được app):

```bash
keytool -genkeypair -v -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

`android/key.properties` (không commit):

```properties
storePassword=***
keyPassword=***
keyAlias=upload
storeFile=/absolute/path/upload-keystore.jks
```

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties["keyAlias"]
            keyPassword keystoreProperties["keyPassword"]
            storeFile file(keystoreProperties["storeFile"])
            storePassword keystoreProperties["storePassword"]
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Thêm `key.properties`, `*.jks`, `*.keystore` vào `.gitignore`. Nếu dùng Play App
Signing, Google giữ app signing key; upload key vẫn cần bảo mật và có quy trình reset.

Quy trình upload key:

1. Bật Play App Signing khi tạo app trên Play Console.
2. Lưu upload keystore + mật khẩu trong secret manager, có ít nhất 2 người biết.
3. Nếu mất upload key, dùng **Request upload key reset** trên Play Console; không tạo
   app mới.
4. Không dùng chung keystore với app khác hoặc môi trường staging.

> ⚠️ Không dùng debug keystore cho bản phát hành. Không chia sẻ keystore qua chat;
> dùng password manager/secret manager và giới hạn người có quyền.

---

## 5. Signing iOS

Cần macOS + Xcode. Cách thủ công: mở `ios/Runner.xcworkspace`, chọn Runner → Signing &
Capabilities → team, bundle id, bật Automatically manage signing.

Với team/CI, dùng Fastlane Match để đồng bộ certificate/provisioning:

```bash
bundle exec fastlane match appstore --readonly
flutter build ipa --release --export-method app-store
```

`ios/Runner/Info.plist` cần:

- `CFBundleDisplayName`, `CFBundleShortVersionString`, `CFBundleVersion`.
- `NSCameraUsageDescription`/`NSPhotoLibraryUsageDescription` **chỉ khi** dùng.
- `UIBackgroundModes` chỉ khai báo thứ thật dùng (fetch/remote-notification).

App Store Connect: tạo app, điền SKU/bundle id, bật App Store Connect API key cho CI.
TestFlight internal test trước khi gửi review; external test cần beta review.

Checklist TestFlight:

- [ ] Internal tester nhận build trong 15 phút sau upload.
- [ ] Test trên ít nhất một iPhone màn hình nhỏ và một iPad nếu hỗ trợ.
- [ ] Kiểm tra push, deep link, mở app từ trạng thái terminated.
- [ ] Ghi rõ "What to Test" và thông tin liên hệ cho tester.
- [ ] Export compliance/encryption trả lời đúng (chỉ HTTPS thường → exempt).

> 💡 iOS không cho cài bản build từ file IPA tùy ý như Android. Mọi bản test phải qua
> TestFlight/Ad Hoc với UDID hoặc enterprise (không phù hợp app public).

---

## 6. Build artifact và tối ưu kích thước

```bash
flutter clean && flutter pub get
flutter build appbundle --release --flavor prod -t lib/main_prod.dart \
  --obfuscate --split-debug-info=build/symbols
flutter build ipa --release --flavor prod -t lib/main_prod.dart \
  --obfuscate --split-debug-info=build/symbols --export-method app-store
```

| Artifact | Dùng cho | Ghi chú |
|---|---|---|
| `.aab` | Google Play | Bắt buộc cho app mới; Play tách APK theo thiết bị |
| `.apk` | Test nội bộ/QA | Không upload lên Play nếu đã có AAB |
| `.ipa` | App Store/TestFlight | Cần signing + macOS |
| symbols | Đọc stack trace đã obfuscate | Lưu artifact, không public |

Giảm size: xóa asset không dùng, nén ảnh (WebP), subset font, tránh package nặng cho
một tính năng nhỏ, kiểm tra `flutter build appbundle --analyze-size`. Với guestbook,
ảnh cover/gallery thường chiếm nhiều nhất — resize trước khi bundle.

| Chỉ số | Ngân sách gợi ý | Cách đo |
|---|---|---|
| APK/AAB download | < 25 MB | Play Console/`--analyze-size` |
| Startup cold | < 2 giây | `--trace-startup`, profile |
| Bộ nhớ khi cuộn list | < 200 MB | DevTools Memory |
| Frame dựng | < 16 ms (60 fps) | Performance overlay |

Vượt ngân sách thì đo trước khi tối ưu; đừng đổi kiến trúc chỉ vì cảm giác. Thiết bị
tiệc thường là tablet/điện thoại tầm trung, không phải flagship.

Lưu `build/symbols` theo version/build number trong CI artifact ít nhất 1 năm; thiếu
symbols thì crash report đã obfuscate gần như vô dụng.

---

## 7. CI/CD phát hành

Tách pipeline test và release. Release chỉ chạy trên tag `v*`, có approval của người
phụ trách:

```yaml
name: release
on:
  push:
    tags: ["v*"]
jobs:
  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: "17"}
      - uses: subosito/flutter-action@v2
        with: {channel: stable, flutter-version: 3.24.x, cache: true}
      - run: flutter pub get && flutter analyze && flutter test
      - run: echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > android/app/upload-keystore.jks
        env: {ANDROID_KEYSTORE_BASE64: "${{ secrets.ANDROID_KEYSTORE_BASE64 }}"}
      - run: |
          cat > android/key.properties <<EOF
          storePassword=${{ secrets.ANDROID_STORE_PASSWORD }}
          keyPassword=${{ secrets.ANDROID_KEY_PASSWORD }}
          keyAlias=${{ secrets.ANDROID_KEY_ALIAS }}
          storeFile=$GITHUB_WORKSPACE/android/app/upload-keystore.jks
          EOF
      - run: flutter build appbundle --release --flavor prod -t lib/main_prod.dart
      - uses: actions/upload-artifact@v4
        with: {name: android-aab, path: build/app/outputs/bundle/prodRelease/*.aab}
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: {channel: stable, flutter-version: 3.24.x, cache: true}
      - run: flutter pub get && cd ios && bundle install
      - run: cd ios && bundle exec fastlane beta
```

Lane `beta` (Fastlane) lo phần `match` + `build_ipa` + upload TestFlight; cấu hình API key
và certificate trong secret. Không build release trên máy cá nhân rồi upload tay nếu có
thể tự động hóa; ít nhất phải ghi lại build number và artifact checksum.

Bảo vệ nhánh `main`, yêu cầu review, khóa quyền tạo tag. Secret chỉ inject ở job release,
không in ra log; che cả `key.properties`.

---

## 8. Store listing và asset

Chuẩn bị trước ngày cưới ít nhất 2 tuần:

| Asset | Google Play | App Store |
|---|---|---|
| Icon | 512×512 PNG | 1024×1024, không alpha |
| Feature graphic | 1024×500 | Không có |
| Screenshot | Tối thiểu 2, điện thoại | 6.9" hoặc 6.5" bắt buộc |
| Mô tả | Ngắn + đầy đủ, tiếng Việt | Subtitle + description |
| Privacy policy | URL công khai | URL công khai + trong app |

Nội dung gợi ý: "Sổ lưu bút số cho ngày cưới — gửi lời chúc, xác nhận tham dự và xem
lời chúc realtime". Không hứa tính năng chưa có (upload ảnh, chat, thanh toán).

Phân loại: `Everyone`/4+; app không có nội dung nhạy cảm nhưng cần kiểm duyệt lời chúc
nếu mở public. Screenshot phải là UI thật, không chứa dữ liệu khách thật hoặc thông tin
cá nhân.

> ⚠️ Google Play yêu cầu mô tả Data Safety khớp hành vi app. Khai "không thu thập" nhưng
> lại gửi tên khách lên server là nguyên nhân bị từ chối/gỡ app.

---

## 9. Quyền, privacy và Data Safety

Guestbook chỉ cần **Internet** cho chức năng cơ bản. Chỉ thêm quyền khi có tính năng:

| Quyền | Khi nào cần | Ghi chú |
|---|---|---|
| `INTERNET` | Luôn | Bắt buộc cho API/WS |
| `POST_NOTIFICATIONS` | Android 13+, push | Xin sau khi giải thích lợi ích |
| Camera/Photos | Upload ảnh | Chỉ khi có tính năng, xin đúng lúc |
| Microphone | Không dùng | Không khai báo |

Privacy policy tối thiểu nêu: dữ liệu thu thập (tên, lời chúc, RSVP), mục đích, thời gian
lưu, nơi xử lý (Supabase), cách xóa, liên hệ. Backend hiện không có endpoint xóa theo
yêu cầu người dùng — cần quy trình admin hoặc bổ sung trước khi public rộng.

iOS 17+ cần `PrivacyInfo.xcprivacy` khai báo required reason API nếu dùng
UserDefaults/file timestamp; kiểm tra cả SDK bên thứ ba. Android Data Safety phải khai
đúng: dữ liệu cá nhân (tên), nội dung do người dùng tạo (lời chúc), có mã hóa khi truyền.

Không log tên/lời chúc ở release. Nếu dùng analytics, cân nhắc không gửi nội dung lời
chúc — chỉ gửi event đếm và trạng thái.

---

## 10. Push notification

Push là **tùy chọn** cho guestbook: thông báo "sắp tới giờ khai tiệc", "album ảnh đã mở".
Backend hiện chưa có API đăng ký device token, nên giai đoạn đầu có thể dùng Firebase
Console gửi theo topic; muốn cá nhân hóa phải bổ sung bảng `device_tokens`.

Luồng chuẩn:

1. Tạo Firebase project, thêm `google-services.json` (Android) và
   `GoogleService-Info.plist` (iOS).
2. Cấu hình APNs key trên Firebase; bật `Push Notifications` + `Background Modes`.
3. Xin quyền sau onboarding, không xin ngay khi mở app.
4. Subscribe topic `wedding-updates`; lưu token nếu cần gửi targeted.
5. Xử lý foreground/background/terminated; deep link vào đúng màn hình.

```dart
final settings = await FirebaseMessaging.instance.requestPermission(
  alert: true, badge: true, sound: true,
);
if (settings.authorizationStatus == AuthorizationStatus.authorized) {
  await FirebaseMessaging.instance.subscribeToTopic('wedding-updates');
}
```

Không dùng push cho tin nhắn realtime trong app — WebSocket đã đảm nhận. Không gửi nội
dung lời chúc trong notification (lộ dữ liệu trên lock screen).

---

## 11. Deep link và universal link

Deep link production dùng domain thật, không dùng IP LAN:

- `https://wedding.example.com/wish/42` → mở app, fallback web.
- Android: App Links với `autoVerify`, SHA-256 fingerprint của **release** keystore.
- iOS: Associated Domains + `apple-app-site-association` (AASA) trả `application/json`,
  không redirect, không cần đăng nhập.
- Kiểm tra cả cold start, warm start và khi app chưa cài (mở web).

```bash
# Android: xác minh App Links sau khi cài bản release
adb shell pm verify-app-links --re-verify com.example.wedding
adb shell pm get-app-links com.example.wedding

# iOS: kiểm tra AASA public
curl -I https://wedding.example.com/.well-known/apple-app-site-association
```

AASA/assetlinks phải deploy **trước** khi gửi link cho khách. Nếu dùng Firebase Dynamic
Links, lưu ý dịch vụ đã ngừng nhận link mới; ưu tiên custom domain.

---

## 12. Monitoring và analytics

Tối thiểu: crash reporting + release health + log lỗi API. Sentry/Crashlytics đã bàn ở
[`flutter-advanced.md`](./flutter-advanced.md); phần production tập trung cấu hình:

- Tạo project/release riêng cho prod; `environment=production`.
- Upload dSYM (iOS) và mapping/symbols (Android) trong CI.
- Bật cảnh báo crash-free < 99.5%, API 5xx, WS reconnect bất thường.
- Sampling trace 10–20%; không sampling crash.
- Alert gửi Slack/Telegram tới người trực ngày cưới.

Analytics chỉ thu event tối thiểu: `app_open`, `wish_sent`, `rsvp_submitted`,
`ws_reconnected`, `share_clicked`. Không gửi `sender_name`, `content`, `guest_of`.

Có thể dùng Firebase Analytics nếu đã dùng FCM; tránh cài nhiều SDK analytics cùng lúc
làm tăng size và phức tạp privacy declaration.

---

## 13. Quy trình release và staged rollout

1. **Code freeze** trước ngày cưới 3–5 ngày; chỉ nhận fix P0/P1.
2. Build release từ tag, ký đúng keystore/certificate, lưu artifact + symbols.
3. Internal testing (Play Internal/TestFlight) ít nhất 24 giờ, test trên thiết bị thật.
4. Smoke test: mở app, tải lời chúc, gửi RSVP, nhận WS, mở deep link, kiểm tra offline.
5. Staged rollout Play 10% → 50% → 100%; iOS phased release 1/2/3/4/7 ngày.
6. Theo dõi crash/ANR/API trong 24 giờ đầu; dừng rollout nếu vượt ngưỡng.
7. Ghi release note nội bộ: version, build, thay đổi, người duyệt, link artifact.

Ngày cưới nên **không** release feature mới. Chỉ hotfix nếu lỗi chặn gửi lời chúc hoặc
làm app crash hàng loạt.

> 💡 Chuẩn bị sẵn QR code tải app và link dự phòng (web guestbook) để khách không cài
> được app vẫn gửi lời chúc.

---

## 14. Rollback và hotfix

Store không cho "rollback" về bản cũ ngay; cách xử lý:

| Tình huống | Hành động |
|---|---|
| Lỗi UI nhẹ | Tắt feature bằng remote flag, chờ bản sau |
| Crash/ANR tăng | Dừng staged rollout, phát hành hotfix |
| API sai contract | Sửa backend trước nếu tương thích ngược |
| Bản release hỏng signing | Tạo build mới cùng versionName, tăng build number |
| Dữ liệu sai | Ngừng ghi, backup, sửa có kiểm soát |

Hotfix: tăng build number, giữ versionName nếu chỉ sửa lỗi nhỏ (hoặc patch `1.4.1`), chạy
lại toàn bộ smoke test, rollout 10% trước. Không vá trực tiếp trên máy dev rồi upload.

Không có "code push" hợp lệ cho Flutter trên iOS/Android store; mọi thay đổi logic phải
qua review (trừ nội dung cấu hình/remote config).

---

## 15. Incident response

Khi app lỗi trong ngày cưới:

1. **Xác nhận** (5 phút): crash rate, API 5xx, WS, số lời chúc gửi được.
2. **Khoanh vùng** (10 phút): client version? mạng? backend/Supabase? DNS/TLS?
3. **Giảm thiểu**: bật web fallback, tắt tính năng lỗi, chuyển sang kênh nhận lời chúc
   thủ công nếu cần.
4. **Thông báo**: người phụ trách, MC/đội tiệc, khách (nếu ảnh hưởng gửi lời chúc).
5. **Theo dõi** tới khi chỉ số về bình thường; ghi timeline.
6. **Postmortem** trong 48 giờ: nguyên nhân gốc, hành động, deadline, người chịu trách nhiệm.

Chuẩn bị trước: danh sách liên hệ backend/Supabase, quyền truy cập Play Console/App Store
Connect, tài khoản Sentry, và một người có quyền dừng rollout.

---

## 16. Checklist trước phát hành

**Build & signing**

- [ ] Version/build number tăng, khớp `pubspec.yaml` và store.
- [ ] Ký bằng release keystore/certificate, không dùng debug.
- [ ] `flutter analyze` sạch, `flutter test` pass trên CI.
- [ ] Build từ tag sạch, artifact + symbols được lưu.

**Chức năng**

- [ ] API prod dùng HTTPS, WS dùng WSS; không còn IP/`localhost`.
- [ ] Gửi lời chúc, RSVP, tải trang cũ (`before`), xóa/sửa (nếu có) hoạt động.
- [ ] WS nhận `new_message`/`update_message`, reconnect sau mất mạng.
- [ ] Offline: mở app thấy cache, gửi vào outbox, có mạng tự đồng bộ.
- [ ] Deep link `/wish/:id` cold/warm start; fallback web.
- [ ] Dark mode, text scale 2.0, màn hình nhỏ không overflow.

**Store & pháp lý**

- [ ] Icon/screenshot/mô tả đúng tiếng Việt, không hứa tính năng chưa có.
- [ ] Privacy policy URL hoạt động; Data Safety/Privacy Nutrition khớp.
- [ ] Chỉ khai báo quyền thật dùng; có mô tả lý do.
- [ ] Nội dung người dùng (lời chúc) có cơ chế kiểm duyệt/báo cáo.
- [ ] Email/điện thoại hỗ trợ trong store listing.

**Vận hành**

- [ ] Crash reporting + alert hoạt động với bản release.
- [ ] Sentry/Crashlytics nhận đúng version và symbols.
- [ ] Có người trực, kênh liên lạc, quy trình rollback đã diễn tập.
- [ ] QR code tải app + link web fallback sẵn sàng cho ngày cưới.

---

## 17. Tài liệu tham khảo

- Flutter deployment: https://docs.flutter.dev/deployment
- Android app signing: https://developer.android.com/studio/publish/app-signing
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com/
- Fastlane: https://docs.fastlane.tools/
- Apple privacy manifest: https://developer.apple.com/documentation/bundleresources/privacy_manifest_files
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Android App Links: https://developer.android.com/training/app-links
- Apple Universal Links: https://developer.apple.com/ios/universal-links/
- Sentry Flutter: https://docs.sentry.io/platforms/flutter/
- WebSocket backend: [`../websocket.md`](../websocket.md)
- API security: [`../api-security.md`](../api-security.md)

---

*Quay lại [`README.md`](./README.md) để xem bản đồ tài liệu và lộ trình học.*
