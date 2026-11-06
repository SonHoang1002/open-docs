# Flutter production — Phát hành app lên Google Play/App Store

> Checklist thực chiến để đưa app từ `flutter run` ra Google Play/App Store: flavor,
> signing, build, store listing, privacy, push, monitoring, rollout và rollback. Ví dụ
> dùng API REST + WebSocket trung lập; mọi thao tác production phải dùng HTTPS/WSS.
>
> Tài liệu tập trung vào vận hành thực tế: cấu hình sai thường gặp, kiểm tra trước khi
> upload, cách xử lý khi store từ chối và quy trình khi có sự cố trong ngày cưới. Code
> chỉ là mẫu tối thiểu; luôn đối chiếu Flutter/Dart, Gradle và Xcode trong repo.

---

## Mục lục

1. [Ma trận môi trường](#1-ma-trận-môi-trường) — [1.1](#11-ba-môi-trường-tối-thiểu) · [1.2](#12-quy-tắc-tách-dữ-liệu) · [1.3](#13-ma-trận-cấu-hình-chi-tiết) · [1.4](#14-bundle-id-signing-và-tài-khoản-theo-môi-trường) · [1.5](#15-cấu-hình-sai-thường-gặp) · [1.6](#16-kiểm-tra-môi-trường-trên-thiết-bị) · [1.7](#17-definition-of-done-cho-từng-môi-trường)
2. [Flavor và cấu hình build](#2-flavor-và-cấu-hình-build) — [2.1](#21-android-productflavors-với-groovy) · [2.2](#22-android-productflavors-với-kotlin-dsl) · [2.3](#23-ios-scheme-configuration-và-xcconfig) · [2.4](#24-entry-point-và-file-cấu-hình) · [2.5](#25-truyền-biến-cấu-hình-với-dart-define-from-file) · [2.6](#26-kiểm-tra-cấu-hình-lúc-khởi-động) · [2.7](#27-quản-lý-secret-và-tránh-commit-nhầm) · [2.8](#28-flavor-cho-web-và-desktop) · [2.9](#29-lỗi-flavor-thường-gặp)
3. [App identity, version và build number](#3-app-identity-version-và-build-number) — [3.1](#31-semantic-versioning) · [3.2](#32-versioncode-và-cfbundleversion) · [3.3](#33-quy-ước-tăng-build) · [3.4](#34-build-trùng-và-store-từ-chối) · [3.5](#35-version-trong-ci-log-và-sentry) · [3.6](#36-chiến-lược-build-number-khi-hotfix) · [3.7](#37-kiểm-tra-version-trước-khi-upload)
4. [Signing Android](#4-signing-android) — [4.1](#41-tạo-và-backup-keystore) · [4.2](#42-keyproperties-và-gradle) · [4.3](#43-kotlin-dsl-cho-signing) · [4.4](#44-play-app-signing-và-upload-key) · [4.5](#45-reset-upload-key) · [4.6](#46-signing-trong-ci-bằng-base64) · [4.7](#47-debug-và-release-signing) · [4.8](#48-bảo-mật-keystore) · [4.9](#49-lỗi-signing-thường-gặp) · [4.10](#410-gitignore-mẫu)
5. [Signing iOS](#5-signing-ios) — [5.1](#51-certificate-và-provisioning-profile) · [5.2](#52-cấu-hình-xcode) · [5.3](#53-fastlane-match) · [5.4](#54-infoplist-và-capabilities) · [5.5](#55-app-store-connect-api-key) · [5.6](#56-testflight) · [5.7](#57-export-compliance) · [5.8](#58-lỗi-signing-ios-thường-gặp)
6. [Build artifact và tối ưu kích thước](#6-build-artifact-và-tối-ưu-kích-thước) — [6.1](#61-chọn-artifact) · [6.2](#62-obfuscate-và-split-debug-info) · [6.3](#63-app-bundle-và-apk) · [6.4](#64-đo-và-tối-ưu-kích-thước) · [6.5](#65-hình-ảnh-font-và-icon) · [6.6](#66-r8-proguard-và-native-libs) · [6.7](#67-ngân-sách-kích-thước) · [6.8](#68-lưu-symbols-và-crash-symbolication)
7. [CI/CD phát hành](#7-cicd-phát-hành) — [7.1](#71-tách-pipeline-test-và-release) · [7.2](#72-github-actions-cho-android) · [7.3](#73-github-actions-cho-ios) · [7.4](#74-cache-và-thời-gian-build) · [7.5](#75-secrets-và-approval) · [7.6](#76-fastlane-cho-release) · [7.7](#77-versioning-tag-và-artifact) · [7.8](#78-matrix-build) · [7.9](#79-chi-phí-macos-runner) · [7.10](#710-lỗi-pipeline-thường-gặp)
8. [Store listing và asset](#8-store-listing-và-asset) — [8.1](#81-asset-bắt-buộc) · [8.2](#82-quy-cách-screenshot) · [8.3](#83-nội-dung-mô-tả-và-aso) · [8.4](#84-age-rating-và-content-rating) · [8.5](#85-privacy-policy-và-trang-hỗ-trợ) · [8.6](#86-ngôn-ngữ-và-bản-địa-hóa) · [8.7](#87-lý-do-bị-từ-chối-thường-gặp)
9. [Quyền, privacy và Data Safety](#9-quyền-privacy-và-data-safety) — [9.1](#91-nguyên-tắc-quyền-tối-thiểu) · [9.2](#92-privacy-manifest-ios) · [9.3](#93-required-reason-api) · [9.4](#94-data-safety-android) · [9.5](#95-gdpr-và-pdpa-việt-nam) · [9.6](#96-lưu-trữ-và-xóa-dữ-liệu) · [9.7](#97-analytics-tối-thiểu) · [9.8](#98-trẻ-em-và-nội-dung-nhạy-cảm) · [9.9](#99-checklist-privacy)
10. [Push notification](#10-push-notification) — [10.1](#101-kiến-trúc-fcm-và-apns) · [10.2](#102-cấu-hình-firebase) · [10.3](#103-quyền-thông-báo) · [10.4](#104-topic-và-token) · [10.5](#105-trạng-thái-foreground-background-và-terminated) · [10.6](#106-payload-deep-link-và-bảo-mật) · [10.7](#107-test-push) · [10.8](#108-lỗi-push-thường-gặp)
11. [Deep link và universal link](#11-deep-link-và-universal-link) — [11.1](#111-app-links-android) · [11.2](#112-universal-links-ios) · [11.3](#113-assetlinksjson-và-aasa) · [11.4](#114-cold-start-và-warm-start) · [11.5](#115-fallback-web) · [11.6](#116-firebase-dynamic-links-đã-ngừng) · [11.7](#117-test-và-lỗi-thường-gặp)
12. [Monitoring và analytics](#12-monitoring-và-analytics) — [12.1](#121-sentry-và-crashlytics) · [12.2](#122-dsym-mapping-và-symbol) · [12.3](#123-release-health) · [12.4](#124-sampling-và-alert) · [12.5](#125-dashboard-và-log) · [12.6](#126-log-redaction-và-privacy) · [12.7](#127-anr-và-jank) · [12.8](#128-runbook-monitoring)
13. [Quy trình release và staged rollout](#13-quy-trình-release-và-staged-rollout) — [13.1](#131-lịch-release) · [13.2](#132-code-freeze) · [13.3](#133-internal-testing-và-smoke-test) · [13.4](#134-play-staged-rollout) · [13.5](#135-ios-phased-release) · [13.6](#136-theo-dõi-24-giờ) · [13.7](#137-release-note) · [13.8](#138-ngày-cao-điểm)
14. [Rollback và hotfix](#14-rollback-và-hotfix) — [14.1](#141-giới-hạn-rollback-của-store) · [14.2](#142-remote-config-và-feature-flag) · [14.3](#143-dừng-rollout) · [14.4](#144-hotfix-build) · [14.5](#145-không-có-code-push) · [14.6](#146-xử-lý-dữ-liệu-sai) · [14.7](#147-truyền-thông-khi-rollback)
15. [Incident response](#15-incident-response) — [15.1](#151-phân-loại-p0p3) · [15.2](#152-vai-trò-và-kênh-liên-lạc) · [15.3](#153-timeline-xử-lý) · [15.4](#154-runbook-ngày-cưới) · [15.5](#155-postmortem) · [15.6](#156-diễn-tập-trước-sự-kiện)
16. [Checklist trước phát hành](#16-checklist-trước-phát-hành) — [16.5](#165-bảo-mật) · [16.6](#166-hiệu-năng) · [16.7](#167-vận-hành-nâng-cao) · [16.8](#168-checklist-ngày-phát-hành)
17. [Tài liệu tham khảo](#17-tài-liệu-tham-khảo) — [17.1](#171-flutter-và-store) · [17.2](#172-signing-và-ci) · [17.3](#173-privacy-push-và-deep-link) · [17.4](#174-monitoring-và-vận-hành) · [17.5](#175-tài-liệu-nội-bộ)

---

## 1. Ma trận môi trường

### 1.1 Ba môi trường tối thiểu

Tối thiểu ba môi trường, tách biệt dữ liệu và signing:

| Môi trường | API | App ID | Mục đích |
|---|---|---|---|
| dev | `http://10.0.2.2:3000` | `com.example.app.dev` | Dev máy local |
| staging | `https://staging-api.example.com` | `com.example.app.staging` | QA/UAT, dữ liệu giả |
| prod | `https://api.example.com` | `com.example.app` | Production, store |

App chỉ đọc dữ liệu công khai có thể bỏ staging; khi đã ghi dữ liệu (lời chúc, RSVP)
thì staging gần như bắt buộc, nếu không mọi lần test đều tạo rác trong production.

> 📌 `example.com` chỉ là placeholder. Không commit domain thật kèm token/secret; tài
> liệu nội bộ dùng biến môi trường thay vì hardcode.

### 1.2 Quy tắc tách dữ liệu

Quy tắc:

- Không dùng chung database staging/prod; seed dữ liệu giả trước khi test.
- Prod chỉ HTTPS/WSS; cleartext HTTP chỉ bật trong debug manifest.
- Mỗi flavor có tên app, icon badge và bundle id riêng để cài song song.
- Nếu không có auth/authorization phù hợp, **không** phát hành màn hình xóa/sửa công khai;
  cần bổ sung auth/role/permission trước khi đưa lên store hoặc dùng công cụ nội bộ riêng.
- Tách Firebase project, Sentry project/environment, storage bucket và tài khoản test.
- Seed phải idempotent, có script reset; backup staging không restore nhầm prod.
- Log staging được chi tiết hơn nhưng vẫn không chứa mật khẩu/token.

> ⚠️ Lỗi nguy hiểm nhất là staging trỏ nhầm database prod. Đặt hậu tố `-staging` cho
> database/bucket/project và thêm guard startup từ chối host staging trong bản prod.

### 1.3 Ma trận cấu hình chi tiết

| Thành phần | dev | staging | prod |
|---|---|---|---|
| API | `http://10.0.2.2:3000` | `https://staging-api.example.com` | `https://api.example.com` |
| WebSocket | `ws://10.0.2.2:3000/ws` | `wss://staging-api.example.com/ws` | `wss://api.example.com/ws` |
| Bundle ID | `com.example.app.dev` | `com.example.app.staging` | `com.example.app` |
| App name | `Wedding Dev` | `Wedding Staging` | `App Example` |
| Signing | Debug keystore | Upload key nội bộ | Upload key + Play App Signing |
| Firebase/Sentry | Project dev, `environment=development` | Project staging, `environment=staging` | Project prod, `environment=production` |
| Dữ liệu | Seed local | Dữ liệu giả, reset định kỳ | Dữ liệu thật, backup |
| Phát hành | Không | Internal/TestFlight | Store |

Không cần tách vật lý mọi thứ nếu chi phí cao, nhưng **API, database, Firebase và
signing** phải tách. Dùng chung project Firebase dễ gửi push test tới khách thật.

### 1.4 Bundle ID, signing và tài khoản theo môi trường

- **Android**: `applicationIdSuffix` đổi package id; `namespace` có thể giữ nguyên.
  Chỉ bản prod cần trùng app đã tạo trên store.
- **iOS**: mỗi bundle id cần App ID/provisioning profile; staging có thể dùng TestFlight
  với bundle id riêng, không upload lên trang store công khai.
- **Signing**: dev dùng debug; staging/prod dùng release; không dùng chung keystore với app khác.
- **Tài khoản**: mỗi môi trường có tài khoản test riêng, không dùng admin thật cho QA;
  tài khoản demo cho reviewer phải có hạn và được kiểm soát.
- Bật 2FA cho tài khoản store; chỉ người phát hành có quyền release.

> ⚠️ Đổi bundle id sau khi phát hành là gần như không thể trên store. Chốt
> `applicationId`/`PRODUCT_BUNDLE_IDENTIFIER` trước build đầu tiên.

### 1.5 Cấu hình sai thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Prod gọi `localhost`/`10.0.2.2` | Quên `--dart-define-from-file` | Fail fast startup; kiểm tra artifact |
| Staging ghi vào DB prod | Copy config/thiếu env CI | Đặt tên có hậu tố; guard theo host |
| Cài đè app này lên app kia | Trùng applicationId/bundle id | Tách suffix; kiểm tra package |
| Push nhầm môi trường | Sai `google-services.json` | Đặt theo `src/<flavor>/` |
| Crash trộn môi trường | Thiếu `environment`/`release` | Set trong CI/runtime; tách project |
| Deep link mở staging | Sai fingerprint/team ID/AASA | Kiểm tra assetlinks/AASA |
| App bị chặn HTTP | Dùng `http://` trong release | Chỉ HTTPS/WSS, không cleartext |
| Tên app sai launcher | `resValue`/`CFBundleDisplayName` sai | Kiểm tra từng build |
| API 401 ở prod | Dùng OAuth client dev | Cấu hình client riêng từng môi trường |

### 1.6 Kiểm tra môi trường trên thiết bị

Thêm màn hình "About" chỉ ở debug/internal: môi trường, bundle id, version/build, host
API/WS (không token), commit hash, trạng thái push, deep link gần nhất.

```bash
adb shell pm list packages | grep com.example
adb shell dumpsys package com.example.app | grep versionName
xcrun simctl listapps booted | grep -i wedding
```

Với bản release, kiểm tra bằng tài khoản test, gọi API và đối chiếu log backend. Không
dựa vào cảm giác "chắc là đúng flavor".

### 1.7 Definition of done cho từng môi trường

- [ ] Dev chạy trên emulator Android/simulator iOS, không cần sửa code.
- [ ] Staging cài song song prod, reset dữ liệu test được, không đụng prod.
- [ ] Prod build từ CI, ký release, có symbols, cài được từ internal testing.
- [ ] Mỗi môi trường có tài khoản test và quy trình cấp/xóa quyền.
- [ ] Không có secret trong repo; `.gitignore` chặn keystore, `key.properties`, `.env`.
- [ ] Có bảng version/build đang chạy ở từng môi trường, kèm người phụ trách.

---

## 2. Flavor và cấu hình build

### 2.1 Android productFlavors với Groovy

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
            resValue "string", "app_name", "App Example"
        }
    }
}
```

Thêm staging và field hữu ích:

```gradle
staging {
    dimension "env"
    applicationIdSuffix ".staging"
    versionNameSuffix "-stg"
    resValue "string", "app_name", "Wedding Staging"
    buildConfigField "String", "ENV", '"staging"'
}
```

- `resValue "string", "app_name"` phải khớp `android:label="@string/app_name"`.
- `applicationIdSuffix` đổi package id; `namespace` chỉ dùng cho R class/build.
- `versionNameSuffix` không thay thế việc tăng build number.
- `buildConfigField` cần `buildFeatures { buildConfig true }` với Gradle mới.

### 2.2 Android productFlavors với Kotlin DSL

Nếu dùng `android/app/build.gradle.kts`:

```kotlin
android {
    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"
            versionNameSuffix = "-dev"
            resValue("string", "app_name", "Wedding Dev")
            buildConfigField("String", "ENV", "\"dev\"")
        }
        create("staging") {
            dimension = "env"
            applicationIdSuffix = ".staging"
            resValue("string", "app_name", "Wedding Staging")
            buildConfigField("String", "ENV", "\"staging\"")
        }
        create("prod") {
            dimension = "env"
            resValue("string", "app_name", "App Example")
            buildConfigField("String", "ENV", "\"prod\"")
        }
    }
    buildFeatures { buildConfig = true }
}
```

> 💡 Không trộn Groovy và Kotlin DSL trong cùng module; lỗi cú pháp thường chỉ lộ ở CI.

### 2.3 iOS scheme, configuration và xcconfig

Tạo scheme `dev`/`staging`/`prod` trong Xcode, mỗi scheme gắn configuration và bundle id
tương ứng; tick **Shared** để CI thấy scheme. Ví dụ `ios/Flutter/Config/prod.xcconfig`:

```text
PRODUCT_BUNDLE_IDENTIFIER = com.example.app
PRODUCT_NAME = Runner
DISPLAY_NAME = App Example
DEVELOPMENT_TEAM = ABCDE12345
```

Trong `Info.plist` dùng `$(DISPLAY_NAME)` và `$(PRODUCT_BUNDLE_IDENTIFIER)`.

```bash
xcodebuild -workspace ios/Runner.xcworkspace -list
flutter build ipa --release --flavor prod -t lib/main_prod.dart
```

> ⚠️ `flutter build ios --flavor prod` cần scheme tên `prod` (hoặc `Prod` tùy quy ước);
> \"No scheme named\" nghĩa là scheme chưa share/đặt sai tên, không phải lỗi code.

### 2.4 Entry point và file cấu hình

Dùng entry point riêng để tránh nhầm cấu hình:

```text
lib/main_dev.dart
lib/main_prod.dart
config/dev.json
config/prod.json
```

Mỗi entry point chỉ nên nạp cấu hình, khởi tạo dependency, gọi `runApp`; logic chung đặt
trong `lib/bootstrap.dart` hoặc `lib/app.dart`. Có thể thêm `lib/main_staging.dart`.

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
  "SENTRY_DSN": ""
}
```

> 📌 `10.0.2.2` chỉ đúng cho Android emulator. Máy thật dùng IP LAN và backend phải
> listen `0.0.0.0`, không chỉ `127.0.0.1`.

### 2.5 Truyền biến cấu hình với dart-define-from-file

```bash
flutter run --flavor dev -t lib/main_dev.dart \
  --dart-define-from-file=config/dev.json
flutter build appbundle --flavor prod -t lib/main_prod.dart \
  --dart-define-from-file=config/prod.json
```

`--dart-define-from-file` có từ Flutter 3.7; với bản cũ hơn dùng nhiều
`--dart-define=KEY=value`. Không đưa signing password vào file JSON được commit.

- Giá trị là compile-time, không đổi khi app chạy; đọc bằng `String.fromEnvironment`.
- Không dùng `--dart-define` chứa secret thật: APK/IPA có thể bị dịch ngược.
- Có thể kết hợp file và biến CI:

```bash
flutter build appbundle \
  --dart-define-from-file=config/prod.json \
  --dart-define=SENTRY_DSN="$SENTRY_DSN" \
  --build-name="$VERSION_NAME" --build-number="$BUILD_NUMBER"
```

> ⚠️ Giá trị `--dart-define` có thể lộ trong log build nếu pipeline echo lệnh. Không đặt
> token dài hạn; nếu buộc dùng, che log và rotate định kỳ.

### 2.6 Kiểm tra cấu hình lúc khởi động

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

`String.fromEnvironment` phải dùng `const` để đọc đúng giá trị:

```dart
const apiBaseUrl = String.fromEnvironment('API_BASE_URL');
```

`throw` ở `main` trong release có thể chỉ hiện màn hình trắng. Cách an toàn: kiểm tra
trong CI và hiển thị màn hình lỗi thân thiện thay vì crash im lặng.

> 💡 CI nên đọc `config/prod.json`, assert `https://`/`wss://`, không chứa `localhost`,
> `10.0.2.2`, `staging`. Đừng để lỗi cấu hình lọt tới store.

### 2.7 Quản lý secret và tránh commit nhầm

```text
android/key.properties
android/app/upload-keystore.jks
android/app/*.keystore
ios/AuthKey_*.p8
ios/*.mobileprovision
.env
.env.*
config/*.local.json
```

- **Secret thật**: signing password, service account key, `.p8`, APNs key, token backend.
- **Client config**: Firebase config, Sentry DSN — không phải secret nhưng nên tách môi trường.
- **Dữ liệu cá nhân**: không đưa tên khách, số điện thoại, lời chúc thật vào repo/test.
- Bật secret scanning; kiểm tra `git diff --cached --name-only` trước push.
- Nếu lỡ commit secret: xóa khỏi lịch sử, rotate ngay, thông báo người liên quan.

### 2.8 Flavor cho web và desktop

Flutter web không có `productFlavors`; dùng target + `--dart-define`:

```bash
flutter build web -t lib/main_prod.dart \
  --dart-define-from-file=config/prod.json --release
flutter build macos --release -t lib/main_prod.dart \
  --dart-define-from-file=config/prod.json
```

Web fallback nên là deployment riêng, URL ổn định; không giả định hành vi offline/WS
giống app. Desktop nội bộ cần khóa màn hình, không lưu token plaintext.

### 2.9 Lỗi flavor thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `No flavor named prod` | Chưa khai báo/sai tên | Kiểm tra Gradle, chạy lại đúng flavor |
| `No scheme named prod` (iOS) | Scheme chưa share/sai tên | Manage Schemes → Shared |
| Build ra app dev dù chọn prod | Sai `-t`/cache | `flutter clean`; kiểm tra lệnh CI |
| App name không đổi | Manifest dùng label cứng | Dùng `@string/app_name` + `resValue` |
| Không cài song song | Trùng applicationId/bundle id | Thêm suffix dev/staging |
| Push sai môi trường | Sai thư mục `google-services.json` | Đặt theo `src/<flavor>/` |
| Config prod rỗng | Thiếu `--dart-define-from-file` | Thêm vào build; fail fast |

---

## 3. App identity, version và build number

### 3.1 Semantic versioning

`pubspec.yaml` là nguồn version duy nhất:

```yaml
version: 1.4.0+14
```

- `1.4.0` là **versionName** (người dùng thấy), `14` là **versionCode/buildNumber**.
- Mỗi lần upload store phải tăng build number, kể cả hotfix.
- Android `versionCode` tối đa 2.1 tỷ; iOS `CFBundleVersion` chỉ tăng, không giảm.
- Gắn version vào Sentry/Crashlytics và log để đối chiếu sự cố.
- SemVer: MAJOR đổi lớn, MINOR thêm tính năng, PATCH sửa lỗi; pre-release chỉ nội bộ.
- Android/iOS dùng cùng versionName; không đổi nghĩa version giữa nền tảng.

### 3.2 versionCode và CFBundleVersion

| Nền tảng | Field | Kiểu | Quy tắc |
|---|---|---|---|
| Android | `versionCode` | Số nguyên | Tăng đơn điệu; tối đa 2.1 tỷ |
| Android | `versionName` | Chuỗi | Người dùng thấy; theo SemVer |
| iOS | `CFBundleVersion` | Chuỗi số | Tăng đơn điệu; mỗi upload phải khác |
| iOS | `CFBundleShortVersionString` | Chuỗi | Thường trùng versionName |

Flutter map `version: x.y.z+n` thành versionName/versionCode Android và
`CFBundleShortVersionString`/`CFBundleVersion` iOS. Nếu Xcode/Gradle override, kiểm tra
không lệch `pubspec.yaml`.

```bash
aapt dump badging build/app/outputs/flutter-apk/app-prod-release.apk \
  | grep -E 'versionCode|versionName'
```

### 3.3 Quy ước tăng build

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
| Release candidate | `1.5.0+20` | Có thể upload internal |
| Build trùng version | `1.5.0+21` | Chỉ khi build trước lỗi kỹ thuật |

Build number = số commit trên `main` hoặc số run CI; không dùng số ngẫu nhiên, không dùng
lại build đã upload. Build number chỉ cần tăng, không cần đẹp.

### 3.4 Build trùng và store từ chối

- Google Play: mỗi `versionCode` chỉ dùng một lần, kể cả build lỗi; phải tăng khi sửa.
- App Store/TestFlight: `CFBundleVersion` phải cao hơn bản đã upload; trùng bị từ chối.
- Không xóa/recreate app để "reset" build number; mất review, rating, người dùng.
- Pipeline song song có thể tạo hai artifact cùng build; dùng `concurrency`/khóa job.
- Build hỏng trước upload vẫn nên tăng build cho lần sau để tránh nhầm artifact.

```text
Version code 14 has already been used. Try another version code.
The bundle version must be higher than the previously uploaded version.
```

### 3.5 Version trong CI, log và Sentry

- Truyền `--build-name`/`--build-number` từ tag/CI, không sửa tay.
- Tên artifact: `app-prod-1.4.0+14.aab`, `symbols-1.4.0+14.zip`.
- Sentry/Crashlytics: `release = app@1.4.0+14`, `dist = 14`, `environment = production`.
- Đọc crash report phải đối chiếu đúng release/dist, không chỉ versionName.
- Nếu release không khớp artifact, source map/symbol có thể không được áp dụng.

### 3.6 Chiến lược build number khi hotfix

1. Tạo nhánh `hotfix/x.y.z` từ tag production, chỉ cherry-pick fix.
2. Tăng patch + build trong `pubspec.yaml`.
3. Build/test/ký với build number cao hơn mọi build đã có.
4. Rollout chậm 10%, theo dõi rồi mới tăng.
5. Không hạ versionName; nếu lỗi nặng, hotfix tiếp thay vì cố rollback.

### 3.7 Kiểm tra version trước khi upload

- [ ] `pubspec.yaml` đã tăng và khớp tag.
- [ ] `versionCode`/`CFBundleVersion` cao hơn bản đã upload.
- [ ] Artifact có version + build, không có chữ `debug`.
- [ ] Sentry/Crashlytics nhận đúng release/dist.
- [ ] Release note ghi version, build, thay đổi chính.

---

## 4. Signing Android

### 4.1 Tạo và backup keystore

Tạo keystore một lần, backup an toàn (mất keystore = không update được app):

```bash
keytool -genkeypair -v -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

- `-validity 10000` khoảng 27 năm; `-alias upload` phải khớp `keyAlias`.
- JDK mới có thể tạo PKCS12; vẫn dùng được với Android Gradle.
- Backup ít nhất hai bản offline ở hai nơi, mật khẩu trong password manager.
- Ghi ngày tạo, người giữ, alias; thử khôi phục định kỳ trên máy sạch.

> ⚠️ Mất keystore upload (khi chưa bật Play App Signing) gần như mất quyền cập nhật app.
> Với Play App Signing, có thể reset upload key, nhưng vẫn nên backup.

### 4.2 key.properties và Gradle

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

`storeFile` nên là absolute path trong CI. Nếu `key.properties` thiếu, CI release phải
fail, không được âm thầm dùng debug key. Không in `keystoreProperties` ra log.

### 4.3 Kotlin DSL cho signing

```kotlin
import java.io.FileInputStream
import java.util.Properties

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }
    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

Nếu CI không có `key.properties`, `as String` sẽ ném lỗi khó hiểu; thêm guard
`if (keystorePropertiesFile.exists())` hoặc fail sớm với thông báo rõ.

> 💡 Giữ logic đọc keystore ở một chỗ; đừng để cả `build.gradle` và `build.gradle.kts`
> cùng tồn tại gây nhầm lẫn.

### 4.4 Play App Signing và upload key

Play App Signing tách **app signing key** (Google giữ) và **upload key** (bạn giữ). App
mới thường bật mặc định; kiểm tra Play Console → Setup → App signing.

Quy trình upload key:

1. Bật Play App Signing khi tạo app trên Play Console.
2. Lưu upload keystore + mật khẩu trong secret manager, có ít nhất 2 người biết.
3. Nếu mất upload key, dùng **Request upload key reset** trên Play Console; không tạo
   app mới.
4. Không dùng chung keystore với app khác hoặc môi trường staging.

> ⚠️ Không dùng debug keystore cho bản phát hành. Không chia sẻ keystore qua chat;
> dùng password manager/secret manager và giới hạn người có quyền.

> 📌 Khi bật Play App Signing, SHA-256 cho Android App Links là fingerprint của **app
> signing certificate** trong Play Console, không phải upload key.

### 4.5 Reset upload key

1. Tạo keystore mới bằng `keytool`.
2. Export certificate:

```bash
keytool -export -rfc -keystore new-upload-keystore.jks \
  -alias upload -file upload_certificate.pem
```

3. Play Console → App signing → Request upload key reset, upload certificate.
4. Chờ xác nhận, cập nhật CI secret, thu hồi quyền keystore cũ, ghi lại sự cố.
5. Không tạo app mới/đổi package name; dừng rollout dở trước khi reset nếu cần.

### 4.6 Signing trong CI bằng base64

```bash
# macOS
base64 -i upload-keystore.jks | pbcopy
# Linux
base64 -w0 upload-keystore.jks
```

```bash
echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > android/app/upload-keystore.jks
```

Sau đó tạo `key.properties` trỏ tới file vừa giải mã. Không echo secret, giải mã vào
thư mục tạm và xóa sau build; không cache keystore giữa runner. Chỉ job release có quyền
đọc secret, không cấp cho PR/fork.

> ⚠️ Không đưa keystore base64 vào biến môi trường của job test. Kiểm tra log để chắc
> chuỗi base64 không bị in ra.

### 4.7 Debug và release signing

| Loại | Keystore | Dùng cho | Lưu ý |
|---|---|---|---|
| Debug | `debug.keystore` | Chạy local/test nhanh | Không upload store |
| Release | Upload keystore | Play/Internal testing | Bảo mật, backup |
| App signing (Play) | Google giữ | Phát hành cho người dùng | Không có private key |

Build release thiếu signingConfig có thể fallback debug. Kiểm tra bằng:

```bash
apksigner verify --print-certs build/app/outputs/flutter-apk/app-prod-release.apk
```

Debug/release khác certificate nên không cài đè cùng package; gỡ app khi test bản khác
chữ ký. Không commit `debug.keystore`.

### 4.8 Bảo mật keystore

Giới hạn người đọc keystore/mật khẩu; ít nhất hai người nắm khôi phục. Lưu trong secret
manager/HSM, audit người tải, rotate khi người rời nhóm. Không dùng chung keystore nhiều
app; ghi quy trình reset vào runbook; kiểm tra `.gitignore` và lịch sử git trước public.

### 4.9 Lỗi signing thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `Keystore was tampered with` | Sai mật khẩu/file hỏng | Kiểm tra storePassword; khôi phục backup |
| `Alias does not exist` | Sai `keyAlias` | `keytool -list` để xem alias |
| `Failed to read key` | Sai `keyPassword` | Kiểm tra mật khẩu key |
| `storeFile not found` | Path tương đối sai | Dùng absolute path trong CI |
| Build release dùng debug key | Thiếu signingConfig | Kiểm tra buildType release |
| Upload bị từ chối chữ ký | Nhầm keystore/alias | Đối chiếu certificate fingerprint |
| `Unsupported keystore format` | JDK/định dạng không khớp | Dùng JDK phù hợp, export lại |

### 4.10 .gitignore mẫu

```gitignore
android/key.properties
android/app/upload-keystore.jks
android/app/*.jks
android/app/*.keystore
*.keystore
ios/AuthKey_*.p8
ios/*.mobileprovision
ios/*.p12
.env
.env.*
config/*.local.json
```

---

## 5. Signing iOS

### 5.1 Certificate và provisioning profile

| Loại | Dùng cho | Ghi chú |
|---|---|---|
| Development | Chạy máy thật khi dev | Cần UDID thiết bị |
| Ad Hoc | Phát hành nội bộ giới hạn | Cần UDID, không hợp public |
| App Store | TestFlight/App Store | Ký bản gửi Apple |
| Enterprise | Phân phối nội bộ doanh nghiệp | Không dùng cho app public |

Mỗi profile gắn App ID, certificate và entitlement. Profile hết hạn/thiếu thiết bị làm
build hoặc cài thất bại dù code đúng.

Cần macOS + Xcode. Cách thủ công: mở `ios/Runner.xcworkspace`, chọn Runner → Signing &
Capabilities → team, bundle id, bật Automatically manage signing.

### 5.2 Cấu hình Xcode

- Luôn mở `Runner.xcworkspace`, không mở `.xcodeproj` khi có CocoaPods.
- Chọn đúng target Runner; kiểm tra Team, Bundle Identifier, Profile, Certificate.
- Version/Build khớp `pubspec.yaml`; kiểm tra lại sau khi Xcode tự đổi.
- Dev dùng automatic signing; CI dùng manual + Match.
- Scheme phải shared và có configuration tương ứng flavor.

### 5.3 Fastlane Match

Với team/CI, dùng Fastlane Match để đồng bộ certificate/provisioning:

```bash
bundle exec fastlane match appstore --readonly
flutter build ipa --release --export-method app-store
```

`Matchfile` tối thiểu: `git_url` repo certificate private, `type("appstore")`,
`app_identifier([...])`. Lưu `MATCH_PASSWORD` trong secret manager; CI dùng deploy key
chỉ đọc và `--readonly`. Chỉ máy được phép mới chạy `match` tạo certificate mới. Không
commit `.p12`/`.mobileprovision`.

> ⚠️ Apple giới hạn số certificate distribution. Mỗi máy tự tạo certificate sẽ nhanh
> hết quota và phải revoke; dùng Match hoặc một người chịu trách nhiệm signing.

### 5.4 Info.plist và capabilities

`ios/Runner/Info.plist` cần:

- `CFBundleDisplayName`, `CFBundleShortVersionString`, `CFBundleVersion`.
- `NSCameraUsageDescription`/`NSPhotoLibraryUsageDescription` **chỉ khi** dùng.
- `UIBackgroundModes` chỉ khai báo thứ thật dùng (fetch/remote-notification).

| Key/Entitlement | Khi nào dùng | Lưu ý |
|---|---|---|
| Camera/Photos UsageDescription | Chụp/chọn ảnh | Mô tả rõ mục đích, tiếng Việt |
| Microphone UsageDescription | Quay video có tiếng | Không khai nếu không dùng |
| `UIBackgroundModes` | Push/refresh | Chỉ `remote-notification` nếu cần |
| `CFBundleURLTypes` | Custom scheme | Ưu tiên universal link |
| Associated Domains | Universal link | `applinks:domain` |
| `ITSAppUsesNonExemptEncryption` | Khai báo mã hóa | HTTPS thường → exempt |

Không thêm quyền "phòng hờ"; App Store có thể hỏi lý do và người dùng thấy mô tả quyền.

### 5.5 App Store Connect API key

App Store Connect → Users and Access → Integrations → App Store Connect API. Tạo key
quyền phù hợp, tải `.p8` **một lần**, lưu `Issuer ID`, `Key ID`, file trong secret
manager. Fastlane dùng `app_store_connect_api_key` hoặc biến môi trường. Không commit
`.p8`; nếu lộ, revoke và tạo key mới; không dùng key cá nhân của admin cho CI.

### 5.6 TestFlight

App Store Connect: tạo app, điền SKU/bundle id, bật App Store Connect API key cho CI.
TestFlight internal test trước khi gửi review; external test cần beta review.

Checklist TestFlight:

- [ ] Internal tester nhận build trong 15 phút sau upload.
- [ ] Test trên ít nhất một iPhone màn hình nhỏ và một iPad nếu hỗ trợ.
- [ ] Kiểm tra push, deep link, mở app từ trạng thái terminated.
- [ ] Ghi rõ "What to Test" và thông tin liên hệ cho tester.
- [ ] Export compliance/encryption trả lời đúng (chỉ HTTPS thường → exempt).

Build TestFlight có thời hạn (thường 90 ngày); external tester cần beta review. Build
thiếu export compliance bị chặn ở "Waiting for Compliance". Không chia sẻ Apple ID tester.

> 💡 iOS không cho cài bản build từ file IPA tùy ý như Android. Mọi bản test phải qua
> TestFlight/Ad Hoc với UDID hoặc enterprise (không phù hợp app public).

### 5.7 Export compliance

App chỉ dùng HTTPS/TLS tiêu chuẩn thường exempt; khai `ITSAppUsesNonExemptEncryption =
false` nếu đúng. Nếu tự implement mã hóa, dùng VPN hoặc phân phối ở quốc gia đặc biệt,
kiểm tra yêu cầu export và có thể phải nộp giấy tờ. Trả lời nhất quán giữa App Store
Connect và `Info.plist`; khi nghi ngờ, hỏi pháp lý thay vì đoán.

### 5.8 Lỗi signing iOS thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| No profiles for bundle id | Chưa tạo App ID/profile | Tạo profile/automatic signing |
| Certificate expired | Hết hạn | Renew qua Match/Xcode |
| Profile doesn't include device | Thiếu UDID | Thêm thiết bị vào profile |
| Bundle id mismatch | Đổi id chưa đổi profile | Đồng bộ lại profile |
| Missing entitlement | Chưa bật capability | Bật trong Xcode/App ID |
| Invalid signature | Sai certificate | Kiểm tra `codesign -dv`; dùng Match |
| Upload lỗi API key | Sai Issuer/Key ID/.p8 | Kiểm tra secret; revoke nếu lộ |

---

## 6. Build artifact và tối ưu kích thước

### 6.1 Chọn artifact

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

Không upload nhầm APK debug hoặc APK ký debug. Kiểm tra tên, dung lượng, chữ ký, version
trước khi gửi; với AAB có thể validate bằng `bundletool`.

### 6.2 Obfuscate và split-debug-info

- `--obfuscate` đổi tên class/function; `--split-debug-info` xuất symbol riêng.
- Obfuscate không phải bảo mật; không đặt secret trong code.
- Mỗi ABI có symbol riêng; lưu cả bộ.
- iOS cần dSYM từ archive; Flutter symbols không thay dSYM native.
- Đọc stack trace: `flutter symbolize -i crash.txt -d build/symbols`.

> ⚠️ Bật `--obfuscate` mà quên `--split-debug-info` khiến crash report gần như không đọc
> được và không có cách khôi phục symbol từ artifact đã upload.

### 6.3 App Bundle và APK

AAB chứa nhiều cấu hình, Play tạo APK tối ưu theo thiết bị; APK universal tiện QA nhưng
lớn hơn. Dùng `--split-per-abi` nếu cần APK riêng. Không upload APK lên Play nếu đã dùng
AAB; test AAB bằng Internal testing hoặc `bundletool`, đừng chỉ tin vào build local.

```bash
flutter build apk --release --split-per-abi --flavor prod -t lib/main_prod.dart
```

### 6.4 Đo và tối ưu kích thước

Giảm size: xóa asset không dùng, nén ảnh (WebP), subset font, tránh package nặng cho
một tính năng nhỏ, kiểm tra `flutter build appbundle --analyze-size`. Với guestbook,
ảnh cover/gallery thường chiếm nhiều nhất — resize trước khi bundle.

```bash
flutter build appbundle --release --analyze-size \
  --target-platform android-arm64 --flavor prod -t lib/main_prod.dart
```

Build sạch, đo baseline theo version, xem phần lớn nhất trong DevTools App Size, chỉ tối
ưu phần chiếm nhiều. Không so sánh size giữa các cấu hình/ABI khác nhau.

### 6.5 Hình ảnh, font và icon

- Resize ảnh theo kích thước hiển thị; không bundle ảnh 4000px cho thumbnail.
- Dùng WebP/AVIF nếu target hỗ trợ; kiểm tra chất lượng trên thiết bị.
- Subset font tiếng Việt; tránh nhiều font family chỉ để lấy vài icon.
- Giữ icon tree shaking (đừng tắt `--tree-shake-icons` nếu không có lý do).
- Ảnh cover/gallery lớn nên tải từ CDN/backend thay vì bundle toàn bộ.
- Nén asset trước khi commit; đừng để file 20 MB trong repo.

### 6.6 R8, ProGuard và native libs

Có thể bật R8 cho Android release:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"),
                      "proguard-rules.pro"
    }
}
```

- Minify có thể hỏng reflection/serialization; test kỹ, thêm rule cần thiết.
- Giữ `mapping.txt` mỗi build; thiếu mapping thì crash Java/native khó đọc.
- Không xóa rule của Flutter engine/plugin.
- Chỉ build ABI cần khi test; store nhận AAB và tách theo thiết bị.
- `shrinkResources` có thể xóa asset truy cập động; kiểm tra sau khi bật.
- Test lại các màn hình ít dùng sau khi bật R8.

### 6.7 Ngân sách kích thước

| Chỉ số | Ngân sách gợi ý | Cách đo |
|---|---|---|
| APK/AAB download | < 25 MB | Play Console/`--analyze-size` |
| Startup cold | < 2 giây | `--trace-startup`, profile |
| Bộ nhớ khi cuộn list | < 200 MB | DevTools Memory |
| Frame dựng | < 16 ms (60 fps) | Performance overlay |
| Crash-free sessions | > 99.5% | Sentry/Crashlytics |
| API 5xx | < 1% | Dashboard backend |

Vượt ngân sách thì đo trước khi tối ưu; đừng đổi kiến trúc chỉ vì cảm giác. Thiết bị
tiệc thường là tablet/điện thoại tầm trung, không phải flagship.

### 6.8 Lưu symbols và crash symbolication

Lưu symbols theo version + build + ABI (`symbols-1.4.0+14-android-arm64.zip`), kèm
checksum/metadata, tối thiểu 1 năm. Giới hạn quyền đọc. Với iOS lưu dSYM; Android lưu
mapping + Flutter symbols. Định kỳ tải thử symbol cũ và symbolize stack mẫu; xác nhận
Sentry/Crashlytics đã xử lý symbol.

Lưu `build/symbols` theo version/build number trong CI artifact ít nhất 1 năm; thiếu
symbols thì crash report đã obfuscate gần như vô dụng.

---

## 7. CI/CD phát hành

### 7.1 Tách pipeline test và release

- **PR/push**: `flutter analyze`, `flutter test`, build debug, không secret.
- **Main**: build internal/staging, integration test nếu có.
- **Tag `v*`**: build release, ký, upload store, cần approval.
- Không cấp secret cho PR từ fork; tách GitHub Environment `staging`/`production`.
- Dùng `concurrency` để tránh hai release chạy song song.

### 7.2 GitHub Actions cho Android

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
```

Thêm `--dart-define-from-file=config/prod.json`, `--build-number` từ CI, upload symbols
cùng AAB, và kiểm tra artifact trước khi upload store.

### 7.3 GitHub Actions cho iOS

```yaml
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

Chọn Xcode version rõ ràng; `pod install` lần đầu chậm; `.p8` chỉ mount trong job release.
iOS không chạy trên Linux, đừng đặt job iOS trong matrix Linux.

### 7.4 Cache và thời gian build

| Thành phần | Cache key gợi ý | Lưu ý |
|---|---|---|
| Flutter SDK | `flutter-version` + channel | `subosito/flutter-action` hỗ trợ |
| Pub packages | `pubspec.lock` hash | Không cache secret |
| Gradle | `gradle/wrapper` + build files | Có thể tăng dung lượng |
| CocoaPods | `Podfile.lock` hash | Cẩn thận khi đổi Xcode |
| Build directory | Không nên cache release | Dễ lẫn artifact cũ |

Cache chỉ tăng tốc, không thay đổi kết quả. Release build nên bắt đầu từ `flutter clean`.

### 7.5 Secrets và approval

| Secret | Dùng cho | Phạm vi |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Giải mã keystore | Release Android |
| `ANDROID_STORE_PASSWORD` | Mở keystore | Release Android |
| `ANDROID_KEY_PASSWORD` | Mở key | Release Android |
| `ANDROID_KEY_ALIAS` | Chọn key | Release Android |
| `MATCH_PASSWORD` | Mở repo certificate | Release iOS |
| `ASC_KEY_ID`/`ASC_ISSUER_ID`/`.p8` | Upload App Store | Release iOS |
| `SENTRY_AUTH_TOKEN` | Upload symbols | Release |

Dùng GitHub Environment với required reviewers cho production. Không echo secret; che cả
`key.properties`. Bảo vệ nhánh `main`, yêu cầu review, khóa quyền tạo tag. Secret chỉ
inject ở job release, không in ra log.

### 7.6 Fastlane cho release

```ruby
platform :ios do
  lane :beta do
    setup_ci if ENV["CI"]
    match(type: "appstore", readonly: true)
    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "prod",
      export_method: "app-store"
    )
    upload_to_testflight(skip_waiting_for_build_processing: false)
  end
end
```

`beta` dùng TestFlight; `release` thêm bước submit review. Không để Fastlane tự tạo
certificate mới trên CI nếu chưa kiểm soát. Log Fastlane có thể chứa thông tin thiết
bị/tài khoản; hạn chế public. Android có thể dùng `supply` hoặc Gradle thuần.

### 7.7 Versioning, tag và artifact

Tag `v1.4.0` trỏ đúng commit release; build number từ CI hoặc `pubspec.yaml`. Tag bất
biến, không force-push. Artifact name gồm version+build/flavor/platform; lưu checksum
SHA-256. Ghi link artifact, symbols, release note vào bảng nội bộ. Nếu tag và
`pubspec.yaml` lệch, fail pipeline thay vì sửa tay.

```bash
shasum -a 256 build/app/outputs/bundle/prodRelease/app-prod-release.aab
```

### 7.8 Matrix build

Matrix hữu ích cho test nhiều cấu hình, nhưng chỉ build artifact store một lần với
version cố định. Nếu matrix tạo nhiều artifact cùng build number, đặt tên khác và chỉ
upload một. iOS không chạy trên Linux; cân nhắc chi phí trước khi nhân job.

```yaml
strategy:
  matrix:
    flutter-version: ["3.24.x"]
```

### 7.9 Chi phí macOS runner

macOS runner tốn phút CI gấp nhiều lần Linux; chỉ chạy khi cần build/test iOS. Chạy iOS
trên tag/nightly thay vì mọi commit; cache CocoaPods/Flutter; dùng `paths`/`if` để bỏ
qua job khi chỉ sửa docs. Kiểm tra chính sách phút hiện hành, đừng giả định mãi miễn phí.
Đo thời gian từng bước; `pod install` và upload thường chiếm nhiều nhất.

### 7.10 Lỗi pipeline thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `flutter: command not found` | Chưa setup action/PATH | Dùng `subosito/flutter-action` |
| Gradle JDK mismatch | Java 11 vs 17 | Chọn JDK phù hợp AGP |
| `key.properties` missing | Secret/bước tạo file lỗi | Kiểm tra env, path, heredoc |
| Base64 decode lỗi | Secret xuống dòng/khoảng trắng | Kiểm tra secret, dùng `base64 -d` |
| CocoaPods lỗi | Pod repo cũ/Xcode mới | `pod repo update`, xóa Pods |
| Signing iOS fail | Match/API key hết hạn | Kiểm tra secret/certificate |
| Artifact rỗng | Sai path output/flavor | Kiểm tra tên flavor và `build/` |
| Upload store 403 | Thiếu quyền API key | Cấp quyền App Manager phù hợp |
| Version trùng | Build number không tăng | Tăng build number, kiểm tra tag |
| Timeout | Build lâu/cache hỏng | Tăng timeout, xóa cache |

> 📌 Đọc bước đầu tiên fail, không chỉ dòng cuối. Nhiều lỗi signing chỉ là hệ quả của
> bước giải mã keystore hoặc thiếu config trước đó.

---

## 8. Store listing và asset

### 8.1 Asset bắt buộc

Chuẩn bị trước ngày cưới ít nhất 2 tuần:

| Asset | Google Play | App Store |
|---|---|---|
| Icon | 512×512 PNG | 1024×1024, không alpha |
| Feature graphic | 1024×500 | Không có |
| Screenshot | Tối thiểu 2, điện thoại | 6.9" hoặc 6.5" bắt buộc |
| Mô tả | Ngắn + đầy đủ, tiếng Việt | Subtitle + description |
| Privacy policy | URL công khai | URL công khai + trong app |

Kiểm tra yêu cầu hiện hành trên store; không dùng dữ liệu khách thật/logo bên thứ ba khi
chưa có quyền. Chuẩn bị asset tablet nếu hỗ trợ.

### 8.2 Quy cách screenshot

- Chụp UI thật, không ghép từ thiết kế chưa chạy.
- Che/thay tên khách, số điện thoại, lời chúc thật.
- Hiển thị luồng chính: mở thiệp, xem/gửi lời chúc, RSVP.
- Ngôn ngữ nhất quán với store listing; không hứa tính năng chưa có.
- Status bar sạch; kiểm tra dark mode/text scale trên màn hình nhỏ.

### 8.3 Nội dung mô tả và ASO

Gợi ý: "Sổ lưu bút số cho ngày cưới — gửi lời chúc, xác nhận tham dự và xem lời chúc
realtime". Không hứa tính năng chưa có. ASO: tiêu đề chứa từ khóa tự nhiên, mô tả ngắn
nêu giá trị; dùng "thiệp cưới", "sổ lưu bút", "lời chúc", "RSVP"; không dùng tên đối thủ
hoặc cam kết giá/quà không thực hiện được.

### 8.4 Age rating và content rating

Google Play dùng bảng câu hỏi content rating; App Store dùng age rating hiện hành. Trả
lời đúng về nội dung người dùng, quảng cáo, vị trí, mua hàng trong app. Nếu mở public
guestbook, cần kiểm duyệt/báo cáo; không thiết kế gây hiểu nhầm là app cho trẻ em.
Phân loại thường là `Everyone`/4+.

### 8.5 Privacy policy và trang hỗ trợ

Privacy policy nêu dữ liệu thu thập (tên, nội dung người dùng tạo), mục đích, thời gian
lưu, nơi xử lý backend, cách xóa dữ liệu và liên hệ. URL phải mở không cần đăng nhập,
HTTPS, có ngày hiệu lực; liệt kê bên thứ ba (Firebase, Sentry, hạ tầng); trang hỗ trợ
có email/điện thoại thật. Nếu có tài khoản, phải có cách xóa tài khoản; không dùng lại
policy của app khác.

> ⚠️ Google Play yêu cầu Data Safety khớp hành vi app. Khai "không thu thập" nhưng lại
> gửi tên khách lên server là nguyên nhân bị từ chối/gỡ app.

### 8.6 Ngôn ngữ và bản địa hóa

Tiếng Việt là chính, thêm tiếng Anh nếu có khách quốc tế. Dịch store listing, screenshot,
mô tả quyền, push; kiểm tra font/dấu/xuống dòng trên màn hình nhỏ. Ngày giờ, tiền tệ,
số điện thoại theo locale; không dùng máy dịch không kiểm tra cho nội dung quan trọng.

### 8.7 Lý do bị từ chối thường gặp

| Lý do | Cách phòng tránh |
|---|---|
| Thiếu privacy policy/URL hỏng | Kiểm tra URL public trước submit |
| Data Safety không khớp | Rà SDK, log, backend; khai đúng |
| App crash khi mở | Test bản release trên thiết bị thật |
| Screenshot sai/misleading | Dùng UI thật, không hứa tính năng |
| Thiếu demo account | Cung cấp tài khoản test hoạt động |
| Quyền không có mô tả | Chỉ khai quyền dùng thật |
| Nội dung người dùng không kiểm duyệt | Thêm báo cáo/ẩn/xóa, điều khoản |

---

## 9. Quyền, privacy và Data Safety

### 9.1 Nguyên tắc quyền tối thiểu

Guestbook chỉ cần **Internet**; chỉ thêm quyền khi có tính năng thật:

| Quyền | Khi nào cần | Ghi chú |
|---|---|---|
| `INTERNET` | Luôn | Bắt buộc cho API/WS |
| `POST_NOTIFICATIONS` | Android 13+, push | Xin sau khi giải thích lợi ích |
| Camera/Photos | Upload ảnh | Chỉ khi có tính năng, xin đúng lúc |
| Microphone | Không dùng | Không khai báo |

Kiểm tra merged manifest vì plugin có thể tự thêm quyền; iOS thiếu `UsageDescription` sẽ
crash. Không xin quyền ngay khi mở app và kiểm tra lại trạng thái trong Settings.

### 9.2 Privacy manifest iOS

iOS 17+ cần `PrivacyInfo.xcprivacy` khai báo required reason API nếu dùng UserDefaults/file
timestamp; kiểm tra cả SDK bên thứ ba:

```xml
<dict>
  <key>NSPrivacyTracking</key><false/>
  <key>NSPrivacyAccessedAPITypes</key>
  <array><dict>
    <key>NSPrivacyAccessedAPIType</key>
    <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
    <key>NSPrivacyAccessedAPITypeReasons</key>
    <array><string>CA92.1</string></array>
  </dict></array>
</dict>
```

Thêm file vào target Runner (Copy Bundle Resources), không khai tracking nếu không
tracking, xác nhận reason code với tài liệu Apple và rà manifest từng SDK.

### 9.3 Required reason API

| Nhóm API | Ví dụ | Lưu ý |
|---|---|---|
| UserDefaults | Lưu setting/session | Không dùng fingerprint thiết bị |
| File timestamp | Kiểm tra cache | Chỉ dùng cho chức năng cần thiết |
| System boot time | Tính uptime | Không nhận diện thiết bị |
| Disk space | Kiểm tra trước tải | Không fingerprint |
| Active keyboard | Kiểm tra bàn phím | Chỉ khi UI cần |

Đây là khai báo lý do, không phải xin quyền. SDK dùng API này mà thiếu manifest thì cập
nhật/thay SDK; lưu tài liệu để trả lời review.

### 9.4 Data Safety Android

| Loại dữ liệu | Thu thập? | Chia sẻ? | Mục đích |
|---|---|---|---|
| Tên | Có nếu người dùng nhập | Với backend | Hiển thị lời chúc |
| Nội dung người dùng | Có (lời chúc) | Không cho bên thứ ba | Hiển thị |
| Email/số điện thoại | Chỉ khi có tính năng | Theo mục đích | Liên hệ/RSVP |
| Token push | Có nếu dùng FCM | Với Firebase | Gửi thông báo |
| Crash logs | Có nếu dùng SDK | Với SDK | Sửa lỗi |
| Analytics | Tối thiểu | Với SDK | Đo lường |

Khai "mã hóa khi truyền" nếu mọi endpoint dùng HTTPS/WSS; Data Safety phải khớp privacy
policy và hành vi SDK.

### 9.5 GDPR và PDPA Việt Nam

Không phải tư vấn pháp lý; tham vấn chuyên gia khi có người dùng thật.

- **GDPR** (EU): cơ sở pháp lý, thông báo rõ, quyền truy cập/xóa/hạn chế, thời gian lưu.
- **PDPA/PDPD Việt Nam**: Nghị định 13/2023/NĐ-CP; cần đồng ý phù hợp, thông báo mục
  đích, bảo vệ dữ liệu và quyền của chủ thể dữ liệu.
- Chỉ thu dữ liệu cần thiết; có kênh xóa/điều chỉnh; kiểm tra yêu cầu khi chuyển dữ
  liệu ra nước ngoài; không thu dữ liệu trẻ em khi không có cơ sở phù hợp.

> ⚠️ Chỉ cần có tên khách, lời chúc, token push hoặc log IP là đã có dữ liệu cần khai
> báo; đừng mặc định trả lời "không thu thập dữ liệu".

### 9.6 Lưu trữ và xóa dữ liệu

Định nghĩa thời gian lưu cho lời chúc, RSVP, log, backup, analytics; có quy trình xóa
theo yêu cầu (xác minh, xóa/ẩn, thông báo). Phân biệt soft/hard delete, nêu rõ backup
giữ lâu hơn, xóa bản sao third-party nếu có thể. Log không chứa nội dung/tên đầy đủ.

### 9.7 Analytics tối thiểu

Chỉ thu event tối thiểu: `app_open`, `wish_sent`, `rsvp_submitted`, `ws_reconnected`,
`share_clicked`; không gửi `sender_name`, `content`, `guest_of`. Dùng allowlist property,
không gửi URL chứa token/email/số điện thoại, tôn trọng consent và không session replay
nội dung lời chúc.

### 9.8 Trẻ em và nội dung nhạy cảm

App cưới thường không hướng tới trẻ em; không thiết kế thu hút trẻ hoặc thu dữ liệu.
Nội dung công khai cần kiểm duyệt: từ chối ngôn từ thù địch, thông tin cá nhân, spam;
có nút báo cáo/ẩn và admin xóa nhanh.

### 9.9 Checklist privacy

- [ ] Privacy policy public, đúng hành vi, có ngày hiệu lực.
- [ ] Data Safety/Privacy Nutrition đã khai và rà soát.
- [ ] `PrivacyInfo.xcprivacy` có trong bundle và đúng API dùng.
- [ ] Chỉ khai quyền thật dùng; mô tả quyền rõ ràng.
- [ ] Không log PII/nội dung lời chúc ở release.
- [ ] Có quy trình xóa dữ liệu/tài khoản và thời gian phản hồi.
- [ ] SDK bên thứ ba đã rà soát privacy/phiên bản.
- [ ] Có cơ chế kiểm duyệt/báo cáo nội dung người dùng.

---

## 10. Push notification

### 10.1 Kiến trúc FCM và APNs

Push là **tùy chọn**: thông báo giờ khai tiệc/album mở. Backend chưa có API đăng ký token
nên ban đầu dùng Firebase Console gửi topic; muốn cá nhân hóa phải bổ sung bảng
`device_tokens`. Android dùng FCM, iOS dùng APNs (FCM gửi qua APNs nếu có key); server
gửi FCM HTTP v1, không nhúng server key vào app. Token đổi sau cài lại/cập nhật; push
không đảm bảo giao ngay và không dùng cho dữ liệu quan trọng như lời chúc.

### 10.2 Cấu hình Firebase

1. Tạo Firebase project, thêm `google-services.json`/`GoogleService-Info.plist`.
2. Cấu hình APNs key; bật `Push Notifications` + `Background Modes`.
3. Xin quyền sau onboarding, subscribe topic `wedding-updates`; lưu token nếu cần targeted.
4. Xử lý foreground/background/terminated; deep link vào đúng màn hình.

Đặt file Android theo flavor (`android/app/src/dev|staging|prod/google-services.json`),
iOS trong `ios/Runner` và thêm vào target. Sai file → push không tới hoặc nhầm môi
trường; APNs key lưu trong Firebase/secret manager, không commit.

### 10.3 Quyền thông báo

```dart
final settings = await FirebaseMessaging.instance.requestPermission(
  alert: true, badge: true, sound: true,
);
if (settings.authorizationStatus == AuthorizationStatus.authorized) {
  await FirebaseMessaging.instance.subscribeToTopic('wedding-updates');
}
```

Android 13+ cần runtime `POST_NOTIFICATIONS`; iOS xin sau khi giải thích, có thể dùng
provisional authorization. Kiểm tra trạng thái trước khi subscribe và tạo notification
channel Android phù hợp.

### 10.4 Topic và token

| Tiêu chí | Topic | Token |
|---|---|---|
| Mục đích | Broadcast nhóm | Gửi cá nhân hóa |
| Backend | Không cần lưu token | Cần bảng `device_tokens` |
| Quyền riêng tư | Thấp hơn | Cao hơn |
| Rời nhóm | Unsubscribe | Xóa token khỏi DB |
| Test | Dễ | Cần token thật |

Topic phù hợp thông báo chung; token phù hợp nhắc RSVP/thông báo riêng. Token cũ có thể
lỗi — xử lý response và xóa token không hợp lệ; khi logout hủy token/subscribe nếu có
tài khoản. Không gửi nội dung nhạy cảm qua topic.

### 10.5 Trạng thái foreground, background và terminated

- **Foreground**: `FirebaseMessaging.onMessage`; mặc định không tự hiện, muốn hiện thì
  dùng local notification và kiểm tra quyền.
- **Background**: `onMessageOpenedApp` khi người dùng chạm notification.
- **Terminated**: `getInitialMessage()` khi app mở từ notification; xử lý sau khi router sẵn sàng.
- Android data-only có thể không được giao khi app bị kill; không dựa vào cho logic
  quan trọng. iOS cần `UIBackgroundModes` `remote-notification` nếu nhận background.
- Tránh điều hướng hai lần từ initial message và stream.

> ⚠️ Lưu pending route và xử lý sau frame đầu; không điều hướng trước khi router/auth
> sẵn sàng để tránh mất điều hướng/mở sai màn hình.

### 10.6 Payload, deep link và bảo mật

Payload ngắn, chi tiết tải từ API sau khi mở app; không đặt tên khách/nội dung lời chúc
vì lock screen có thể hiển thị. Dùng `route`/`id` thay URL chứa token, validate trước khi
điều hướng. Android dùng icon nhỏ monochrome, channel; iOS badge/sound tùy chọn. Không
dùng push cho tin nhắn realtime — WebSocket đã đảm nhận.

### 10.7 Test push

Test Firebase Console rồi backend/CI trên thiết bị thật; test foreground/background/
terminated, tắt thông báo, mất mạng, token mới/cũ, deep link, Android 13+ và iOS mới
nhất. Không log token đầy đủ ở release.

### 10.8 Lỗi push thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| Không nhận push | Sai google-services/project | Kiểm tra sender ID/bundle id |
| iOS không nhận | Thiếu APNs key/entitlement | Cấu hình key, bật Push Notifications |
| Android 13 không hỏi quyền | Thiếu `POST_NOTIFICATIONS` | Khai manifest + xin runtime |
| Notification không hiện foreground | Flutter không tự hiện | Dùng local notification |
| Mở app không điều hướng | Chưa xử lý initial message | Đọc `getInitialMessage` |
| Token invalid | Đổi token/cài lại | Cập nhật token lên server |
| Push nhầm môi trường | File Firebase staging trong prod | Tách file theo flavor |
| Lộ nội dung lock screen | Payload chứa PII | Chỉ gửi route/id |

---

## 11. Deep link và universal link

### 11.1 App Links Android

Deep link production dùng domain thật, không dùng IP LAN:

- `https://wedding.example.com/wish/42` → mở app, fallback web.
- Android: App Links với `autoVerify`, SHA-256 fingerprint của **release** keystore.
- iOS: Associated Domains + `apple-app-site-association` (AASA) trả `application/json`,
  không redirect, không cần đăng nhập.
- Kiểm tra cả cold start, warm start và khi app chưa cài (mở web).

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="wedding.example.com"
          android:pathPrefix="/wish" />
</intent-filter>
```

Activity nhận link cần `android:exported="true"` (Android 12+). Chỉ khai host/path thật
dùng; `autoVerify` chỉ hoạt động với HTTPS và assetlinks hợp lệ. Với Play App Signing,
fingerprint lấy từ app signing certificate, không phải upload key.

### 11.2 Universal Links iOS

Bật Associated Domains, thêm `applinks:wedding.example.com`. AASA trả
`Content-Type: application/json`, không redirect/auth; `appIDs` gồm
`TEAMID.bundle.id` đúng team/bundle release; path khớp route. Universal link không mở
app nếu người dùng chọn Safari; cần fallback web. Test trên thiết bị thật.

### 11.3 assetlinks.json và AASA

`https://wedding.example.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.wedding",
      "sha256_cert_fingerprints": ["AA:BB:CC:..."]
    }
  }
]
```

`https://wedding.example.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.com.example.wedding"],
        "components": [{ "/": "/wish/*", "comment": "Wish detail" }]
      }
    ]
  }
}
```

Deploy file trước khi gửi link; cache CDN có thể làm chậm cập nhật. Không chặn file bằng
auth/WAF/redirect sai. Kiểm tra JSON hợp lệ; fingerprint phải SHA-256, không SHA-1/MD5.

### 11.4 Cold start và warm start

- **Cold start**: app chưa chạy; đọc initial URI trước khi dựng router hoặc lưu pending.
- **Warm start**: app ở background; nhận URI qua stream và điều hướng.
- **Terminated**: tương tự cold start; không mất link khi app khởi động chậm.
- Không điều hướng khi chưa có auth; lưu route và xử lý sau đăng nhập.
- Tránh mở trùng màn hình khi initial link và stream cùng phát.
- Link không hợp lệ: hiển thị 404/thông báo thay vì crash.

```bash
# Android: xác minh App Links sau khi cài bản release
adb shell pm verify-app-links --re-verify com.example.wedding
adb shell pm get-app-links com.example.wedding

# iOS: kiểm tra AASA public
curl -I https://wedding.example.com/.well-known/apple-app-site-association
```

### 11.5 Fallback web

Link chia sẻ phải mở được trên web khi app chưa cài; không dùng custom scheme làm link
chính. Trang fallback hiển thị nội dung/lời chúc và nút tải app, cùng domain với App
Links/Universal Links. Kiểm tra SEO cơ bản (title, description, OG image); link yêu cầu
đăng nhập vẫn phải có trang giải thích thay vì 401. QR trên thiệp trỏ domain ổn định,
không trỏ IP/localhost.

### 11.6 Firebase Dynamic Links đã ngừng

Firebase Dynamic Links không còn phù hợp để tạo link mới; dịch vụ đã ngừng nhận link mới
theo lộ trình của Google. Chuyển sang custom domain + App Links/Universal Links; cập nhật
link trên thiệp, QR, social, email. Kiểm tra link cũ còn hoạt động; tạo redirect web có
kiểm soát nếu cần. Không phụ thuộc Dynamic Links cho deep link production mới; lưu mapping
link cũ → link mới.

AASA/assetlinks phải deploy **trước** khi gửi link cho khách. Nếu dùng Firebase Dynamic
Links, lưu ý dịch vụ đã ngừng nhận link mới; ưu tiên custom domain.

### 11.7 Test và lỗi thường gặp

```bash
xcrun simctl openurl booted https://wedding.example.com/wish/42
keytool -list -v -keystore upload-keystore.jks -alias upload | grep SHA256
```

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| App Links `verified=false` | assetlinks sai fingerprint/package | Sửa fingerprint, re-verify |
| Universal link mở Safari | AASA sai team id/path | Kiểm tra appIDs/components |
| Link cũ vẫn mở app cũ | Cache/CDN | Xóa cache, kiểm tra redirect |
| Mở app không điều hướng | Chưa xử lý initial/stream | Kiểm tra router |
| Link chết khi chưa cài app | Không có fallback web | Tạo trang fallback |
| Fingerprint đúng vẫn fail | Dùng upload key thay app signing | Lấy từ Play Console |
| AASA trả HTML | Server rewrite sai | Trả JSON đúng content-type |

---

## 12. Monitoring và analytics

### 12.1 Sentry và Crashlytics

Tối thiểu: crash reporting, release health và log lỗi API. Cấu hình project/release
riêng cho prod (`environment=production`), upload symbol trong CI, cảnh báo crash-free
< 99.5%, API 5xx và WS reconnect bất thường. Khởi tạo sau khi đọc config, set
`release`/`dist` ngay; không gửi PII trong breadcrumb/extra.

### 12.2 dSYM, mapping và symbol

iOS archive tạo dSYM; Android lưu `mapping.txt` (R8) và Flutter symbols. Upload đúng
version trước khi gửi review, kiểm tra dashboard báo "symbolicated", giữ symbol theo
build number và không ghi đè giữa các build.

### 12.3 Release health

| Chỉ số | Ý nghĩa | Ngưỡng gợi ý |
|---|---|---|
| Crash-free sessions | Phiên không crash | > 99.5% |
| Crash-free users | Người dùng không crash | > 99% |
| ANR rate | App không phản hồi | < 0.5% |
| API error | 4xx/5xx | 5xx < 1% |
| WS reconnect | Mất kết nối | Theo dõi theo giờ |

So sánh với bản trước và đợi đủ mẫu trước khi kết luận.

### 12.4 Sampling và alert

Trace sampling 10–20%, không sampling crash/error. Alert theo cửa sổ 5–15 phút; P0 gọi
điện/Slack, P1 Slack, P2 ticket; kiểm tra alert bằng lỗi giả trên staging. Analytics chỉ
thu event tối thiểu (`app_open`, `wish_sent`, `rsvp_submitted`, `ws_reconnected`,
`share_clicked`), không gửi tên/nội dung lời chúc.

### 12.5 Dashboard và log

Dashboard: crash/ANR theo version/thiết bị, API 5xx/p95, WS reconnect, số RSVP/lời chúc
(không nội dung). Log structured với `request_id`, `route`, `status`; release dùng
info/warn/error, tắt debug/verbose.

### 12.6 Log redaction và privacy

Cấu hình Sentry `sendDefaultPii=false` nếu không cần; dùng `beforeSend` xóa tên, nội
dung lời chúc, token, email. Không log `Authorization`, cookie, query chứa token; kiểm
tra log sau release bằng tài khoản test.

### 12.7 ANR và jank

ANR thường do main thread bị chặn: parse JSON lớn, đọc file, chờ network đồng bộ. Dùng
`compute`/isolate cho tác vụ nặng, không khởi tạo SDK nặng trước `runApp`, dùng list
lazy, không tải ảnh full-res vào list. Test mạng chậm/offline và đọc ANR trace từ Play
Console.

### 12.8 Runbook monitoring

Ghi rõ ai kiểm tra dashboard, tần suất, link dashboard/log/Sentry, ngưỡng dừng rollout,
người quyết định, mẫu thông báo và quy trình lấy symbol/escalate backend.

---

## 13. Quy trình release và staged rollout

1. **Code freeze** trước ngày cưới 3–5 ngày; chỉ nhận fix P0/P1.
2. Build từ tag, ký đúng, lưu artifact + symbols.
3. Internal testing/TestFlight ít nhất 24 giờ trên thiết bị thật.
4. Smoke test: mở app, gửi lời chúc/RSVP, nhận WS, deep link, offline.
5. Play staged 10% → 50% → 100%; iOS phased release 1/2/3/4/7 ngày.
6. Theo dõi 24 giờ đầu; dừng rollout nếu vượt ngưỡng; ghi release note nội bộ.

### 13.1 Lịch release

| Mốc | Việc cần làm | Người phụ trách |
|---|---|---|
| T-14 ngày | Chốt tính năng, asset/privacy | Product + Design |
| T-7 ngày | Build RC, internal test, sửa lỗi chặn | Dev + QA |
| T-3 ngày | Code freeze, kiểm tra store listing | Tech lead |
| T-1 ngày | Build cuối, upload, smoke test | Release owner |
| Ngày cưới | Không release feature mới | On-call |
| T+1 ngày | Theo dõi, hotfix nếu cần | On-call |

Cộng buffer vì review store có thể chậm hơn ngày thường; đừng nộp sát ngày cưới.

### 13.2 Code freeze

Tạo nhánh release, thông báo freeze, chỉ cherry-pick fix được duyệt; mỗi fix có test/tái
hiện và người review. Không merge refactor lớn/đổi dependency/schema DB; tăng version
cho mọi build gửi store và có tiêu chí phá freeze (P0 ảnh hưởng gửi lời chúc/RSVP).

### 13.3 Internal testing và smoke test

- [ ] Cài bản sạch, mở app, thấy nội dung từ API prod.
- [ ] Gửi lời chúc, thấy xuất hiện realtime; RSVP đúng dữ liệu.
- [ ] Xem lời chúc cũ (`before`), phân trang/cuộn mượt.
- [ ] Deep link cold/warm start; fallback web; push mở đúng màn hình.
- [ ] Offline: mở cache, gửi outbox, có mạng tự sync.
- [ ] Đăng nhập/đăng xuất (nếu có); dark mode, text scale 2.0, màn hình nhỏ.
- [ ] Không crash khi xoay màn hình/background lâu.

Test ít nhất một Android tầm trung, một iPhone màn hình nhỏ, một iPad nếu hỗ trợ.

### 13.4 Play staged rollout

Upload AAB, bắt đầu staged 10%, theo dõi crash/ANR/feedback rồi tăng 50% → 100%. Có thể
halt nếu chỉ số xấu; người đã cập nhật vẫn ở bản mới. Không đổi nội dung release sau khi
bắt đầu; muốn sửa phải build mới.

### 13.5 iOS phased release

Bật phased release khi submit; Apple tăng dần trong 7 ngày, có thể pause/resume trong
App Store Connect nhưng không có mức % tùy chỉnh. Lỗi nghiêm trọng thì dừng và hotfix;
build đã release không thu hồi khỏi người đã cập nhật.

### 13.6 Theo dõi 24 giờ

Kiểm tra dashboard mỗi 1–2 giờ trong 8 giờ đầu, sau đó thưa dần; so sánh crash/ANR/API
với baseline, xem feedback và backend 5xx/độ trễ/WS/queue. Ngày cưới **không** release
feature mới; chỉ hotfix nếu lỗi chặn gửi lời chúc hoặc crash hàng loạt.

> 💡 Chuẩn bị QR code tải app và link web fallback để khách không cài được app vẫn gửi
> lời chúc.

### 13.7 Release note

Viết ngắn, nêu thay đổi thực tế, không thuật ngữ nội bộ. Bản nội bộ ghi version/build,
commit/tag, rủi ro, người duyệt, artifact, symbols; không dán link nội bộ/secret vào
release note public.

### 13.8 Ngày cao điểm

Tránh release sát ngày cưới, lễ, Tết, cuối tuần dài; kiểm tra lịch store review và chuẩn
bị người trực/quyền truy cập. Không thay đổi DNS/certificate/backend lớn trong ngày cao
điểm; chuẩn bị scale và kênh hỗ trợ nhanh.

---

## 14. Rollback và hotfix

### 14.1 Giới hạn rollback của store

Store không cho "rollback" về bản cũ ngay; cách xử lý:

| Tình huống | Hành động |
|---|---|
| Lỗi UI nhẹ | Tắt feature bằng remote flag, chờ bản sau |
| Crash/ANR tăng | Dừng staged rollout, phát hành hotfix |
| API sai contract | Sửa backend trước nếu tương thích ngược |
| Bản release hỏng signing | Tạo build mới cùng versionName, tăng build number |
| Dữ liệu sai | Ngừng ghi, backup, sửa có kiểm soát |

Người dùng đã cập nhật bản lỗi vẫn ở bản đó; Play halt không thu hồi bản đã cài. iOS
không cho hạ version; chỉ ngừng phased release và phát hành bản sửa. Giữ backend tương
thích ngược với ít nhất một bản client cũ.

### 14.2 Remote config và feature flag

Dùng remote config/feature flag để tắt tính năng lỗi mà không cần build mới. Luôn có
giá trị mặc định an toàn khi không tải được config; cache và không chặn khởi động.
Không dùng để chứa code động/secret. Ghi log khi flag đổi, giới hạn người sửa. Chuẩn bị
kill switch cho gửi lời chúc, RSVP, WS, push, deep link; không bọc cả app trong một flag.

> 📌 Remote config chỉ thay đổi hành vi đã có trong binary. Lỗi ở code chưa đọc flag
> thì phải phát hành bản mới.

### 14.3 Dừng rollout

Play Console: halt staged rollout ở % hiện tại. App Store Connect: pause/dừng phased
release. Thông báo nội bộ ngay, ghi lý do/thời điểm; ước lượng số người đã cập nhật.
Không xóa app khỏi store trừ yêu cầu pháp lý/nghiêm trọng. Sau khi dừng vẫn theo dõi
backend và khách đã cập nhật.

### 14.4 Hotfix build

Hotfix: tăng build number, giữ versionName nếu chỉ sửa lỗi nhỏ (hoặc patch `1.4.1`), chạy
lại toàn bộ smoke test, rollout 10% trước. Không vá trực tiếp trên máy dev rồi upload.

1. Branch từ tag production, không từ main đang phát triển.
2. Sửa tối thiểu, có test tái hiện; tăng build/version phù hợp.
3. Build từ CI, ký đúng, lưu symbol; internal test nhanh nhưng đủ luồng chính.
4. Rollout chậm, theo dõi sát; ghi release note và bài học.

### 14.5 Không có code push

Không có "code push" hợp lệ cho Flutter trên iOS/Android store; mọi thay đổi logic phải
qua review (trừ nội dung cấu hình/remote config).

- Không nhúng engine/script tải code từ xa để lách review.
- Không dùng hot update thay đổi chức năng chính; có thể vi phạm chính sách store.
- Web có thể deploy ngay, nhưng app mobile vẫn cần bản mới.
- Remote config chỉ điều chỉnh tham số/nội dung, không tải mã thực thi.
- Cần sửa gấp thì hotfix qua store là con đường chính thức.

### 14.6 Xử lý dữ liệu sai

Ngừng ghi nếu nguy cơ lan rộng, chuyển chỉ đọc. Backup trước khi sửa; xác định phạm vi
(bản ghi/version/client hay backend). Sửa bằng script dry-run, idempotent, log rõ; không
sửa tay hàng loạt. Kiểm tra toàn vẹn sau sửa; thông báo nếu dữ liệu cá nhân bị sai/lộ;
ghi postmortem và biện pháp ngăn tái diễn.

### 14.7 Truyền thông khi rollback

Thông báo ngắn, nêu ảnh hưởng/thời gian dự kiến, không đổ lỗi. Kênh nội bộ Slack/Telegram;
kênh khách email/Zalo/website. Hướng dẫn fallback web cho khách dùng app lỗi. Cập nhật
tiến triển, không im lặng quá lâu; sau khắc phục thông báo kết quả.

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

### 15.1 Phân loại P0–P3

| Mức | Định nghĩa | Ví dụ | Phản hồi | Thông báo |
|---|---|---|---|---|
| P0 | Toàn bộ app/guestbook không dùng được | Crash hàng loạt, API sập | Ngay lập tức | Gọi điện + Slack |
| P1 | Luồng chính hỏng cho nhiều người | Không gửi lời chúc, RSVP lỗi | < 15 phút | Slack + on-call |
| P2 | Một phần người dùng bị ảnh hưởng | Push không tới, ảnh không tải | < 1 giờ | Ticket/Slack |
| P3 | Lỗi nhỏ, có workaround | UI lệch, log nhiễu | Trong ngày | Ticket |

Không dùng P0 cho mọi thứ; khi chưa rõ, bắt đầu P1 và nâng cấp nếu ảnh hưởng rộng.

### 15.2 Vai trò và kênh liên lạc

- **Incident commander**: điều phối, quyết định dừng rollout/rollback, không tự sửa code.
- **Tech lead/client**: điều tra app, symbol, log, bản build.
- **Backend/on-call**: DB, API, WS, hạ tầng.
- **Comms**: cập nhật nội bộ/khách, giữ liên lạc MC/đội tiệc.
- **Scribe**: ghi timeline, quyết định, hành động.
- Kênh sự cố riêng + kênh dự phòng (điện thoại/SMS); danh sách liên hệ lưu offline.

### 15.3 Timeline xử lý

1. **Phát hiện**: alert, khách/MC báo; ghi giờ.
2. **Triage**: phân loại P0–P3, chỉ định người phụ trách.
3. **Giảm thiểu**: tắt flag, fallback web, dừng rollout, chuyển thủ công.
4. **Khắc phục**: hotfix/backend fix/cấu hình.
5. **Xác nhận**: chỉ số bình thường, khách gửi được.
6. **Đóng sự cố**: thông báo, lưu log, hẹn postmortem.

```text
19:05 Phát hiện API 5xx tăng, 40% request lỗi.
19:08 P1, Incident commander: A; backend: B.
19:12 Bật web fallback; tắt gửi ảnh.
19:20 Xác định DB connection pool cạn.
19:35 Tăng pool, restart an toàn; lỗi giảm.
19:50 Xác nhận gửi lời chúc hoạt động; đóng P1.
```

### 15.4 Runbook ngày cưới

- Trước giờ: kiểm tra app, API, WS, push, QR, web fallback, pin dự phòng.
- In danh sách liên hệ/link dashboard; có người trực suốt sự kiện, không uống rượu khi on-call.
- Mất mạng: dùng 4G/5G dự phòng, hotspot.
- App lỗi: khách gửi qua web/form; đội nhập sau.
- Backend sập: bật chế độ đọc cache, thông báo MC.
- Push lỗi: dùng loa/MC, không phụ thuộc push.
- Sau sự kiện: backup dữ liệu, xác nhận không mất lời chúc.

### 15.5 Postmortem

Không đổ lỗi cá nhân; nêu timeline, tác động, nguyên nhân gốc (5 Whys), phân biệt nguyên
nhân trực tiếp và yếu tố góp phần. Hành động có owner + deadline + kiểm chứng; bài học
cho release/checklist/runbook; chia sẻ trong team.

```text
## Sự cố ngày 2026-11-04
- Mức: P1
- Thời gian: 19:05–19:50
- Tác động: ~30% khách không gửi được lời chúc trong 45 phút
- Nguyên nhân gốc: connection pool backend cạn do traffic tăng
- Hành động: tăng pool, thêm alert, tải thử trước sự kiện
- Owner: Backend (hạn 2026-11-10)
```

### 15.6 Diễn tập trước sự kiện

Chạy thử API down, WS down, push sai, app crash; kiểm tra quyền truy cập khi không có
người chính; đo thời gian phát hiện → giảm thiểu; kiểm tra khôi phục backup/symbol;
cập nhật runbook; đảm bảo có người thứ hai biết dừng rollout và phát hành hotfix.

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

### 16.5 Bảo mật

- [ ] Không có secret trong repo/lịch sử git; secret scanning sạch.
- [ ] Prod chỉ HTTPS/WSS; certificate còn hạn, không pin sai.
- [ ] API có auth/authorization cho thao tác xóa/sửa; không để endpoint công khai.
- [ ] Có rate limit/validate input cho gửi lời chúc/RSVP.
- [ ] Nội dung người dùng được escape/encode, tránh XSS trong web guestbook.
- [ ] Deep link/notification không chứa token/PII; validate route.
- [ ] Dependency/SDK đã rà soát lỗ hổng; xóa package không dùng.
- [ ] Backup dữ liệu mã hóa, quyền truy cập tối thiểu.
- [ ] Tài khoản store/CI bật 2FA; có quy trình thu hồi quyền.
- [ ] Log release không chứa tên/lời chúc/token.

### 16.6 Hiệu năng

- [ ] Cold start < 2 giây trên thiết bị tầm trung.
- [ ] Cuộn danh sách lời chúc mượt, không jank rõ rệt.
- [ ] Ảnh được resize/nén, không tải full-res vào list.
- [ ] Bộ nhớ ổn định khi mở nhiều ảnh/lời chúc.
- [ ] API timeout/retry hợp lý; không chờ vô hạn.
- [ ] Offline/3G chậm vẫn dùng được, có phản hồi UI.
- [ ] Kích thước app trong ngân sách; đã xem `--analyze-size`.
- [ ] Không có tác vụ nặng trên main thread gây ANR.

### 16.7 Vận hành nâng cao

- [ ] Dashboard có crash/ANR/API/WS/wish success.
- [ ] Alert có người nhận và đã test.
- [ ] Runbook có link, tài khoản, ngưỡng, người quyết định.
- [ ] Diễn tập dừng rollout/hotfix/fallback web.
- [ ] Backup và khôi phục đã thử; biết thời gian khôi phục.
- [ ] Có status page/kênh thông báo cho khách.
- [ ] Theo dõi chi phí backend/SDK khi traffic tăng.
- [ ] Có kế hoạch scale trước ngày cưới.

### 16.8 Checklist ngày phát hành

- [ ] Release đã được duyệt, đúng tag/commit.
- [ ] Artifact checksum và symbols đã lưu.
- [ ] Internal test/TestFlight đã pass.
- [ ] Staged rollout bắt đầu ở % thấp.
- [ ] Dashboard/alert mở, người trực online.
- [ ] QR code và web fallback hoạt động.
- [ ] Kịch bản liên lạc khách/MC sẵn sàng.
- [ ] Biết cách dừng rollout và phát hành hotfix.

---

## 17. Tài liệu tham khảo

### 17.1 Flutter và store

- Flutter deployment: https://docs.flutter.dev/deployment
- Flutter flavors: https://docs.flutter.dev/deployment/flavors
- Flutter obfuscation/symbolize: https://docs.flutter.dev/deployment/obfuscate
- Flutter app size: https://docs.flutter.dev/perf/app-size
- Android app signing: https://developer.android.com/studio/publish/app-signing
- Android App Bundle: https://developer.android.com/guide/app-bundle
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com/

### 17.2 Signing và CI

- Fastlane: https://docs.fastlane.tools/
- Fastlane Match: https://docs.fastlane.tools/actions/match/
- App Store Connect API: https://developer.apple.com/documentation/appstoreconnectapi
- GitHub Actions: https://docs.github.com/actions
- Flutter GitHub Action: https://github.com/subosito/flutter-action
- bundletool: https://github.com/google/bundletool

### 17.3 Privacy, push và deep link

- Apple privacy manifest: https://developer.apple.com/documentation/bundleresources/privacy_manifest_files
- Apple export compliance: https://developer.apple.com/documentation/security/complying-with-export-compliance
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Firebase Flutter setup: https://firebase.google.com/docs/flutter/setup
- Android notification permission: https://developer.android.com/develop/ui/views/notifications/notification-permission
- Android App Links: https://developer.android.com/training/app-links
- Apple Universal Links: https://developer.apple.com/ios/universal-links/
- Firebase Dynamic Links: https://firebase.google.com/docs/dynamic-links

### 17.4 Monitoring và vận hành

- Sentry Flutter: https://docs.sentry.io/platforms/flutter/
- Firebase Crashlytics: https://firebase.google.com/docs/crashlytics
- Android vitals/ANR: https://developer.android.com/topic/performance/vitals
- Apple App Store server notifications: https://developer.apple.com/documentation/appstoreservernotifications

### 17.5 Tài liệu nội bộ

- WebSocket backend: [`../websocket.md`](../websocket.md)
- API security: [`../api-security.md`](../api-security.md)
- Flutter advanced: [`flutter-advanced.md`](./flutter-advanced.md)
- Flutter README: [`README.md`](./README.md)

---

*Quay lại [`README.md`](./README.md) để xem bản đồ tài liệu và lộ trình học.*