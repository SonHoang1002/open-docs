# iOS Production — Ký, phát hành và vận hành App Store

> Checklist thực chiến để đưa app wedding guestbook từ Xcode lên App Store: ký và
> provisioning, build configuration, archive/export, TestFlight, review, privacy manifest,
> APNs, CI/CD, monitoring và xử lý sự cố sau release. Nội dung giả định deployment target
> **iOS 17.0**, Swift 6 compiler (Swift 5 language mode) và bundle ID mẫu
> `com.example.guestbook`; thay bằng bundle ID thật của team trước khi lưu hành.

Tài liệu này không thay thế [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
Khi guideline và tài liệu nội bộ khác nhau, guideline và thông báo mới nhất của Apple thắng.

---

## Mục lục

1. [Code signing: certificate, App ID và provisioning profile](#1-code-signing-certificate-app-id-và-provisioning-profile)
2. [Build configuration, scheme và versioning](#2-build-configuration-scheme-và-versioning)
3. [Archive, export và upload](#3-archive-export-và-upload)
4. [TestFlight](#4-testflight)
5. [App Store Connect và submission](#5-app-store-connect-và-submission)
6. [App Store review](#6-app-store-review)
7. [Privacy manifest và quyền](#7-privacy-manifest-và-quyền)
8. [Bảo mật production](#8-bảo-mật-production)
9. [CI/CD](#9-cicd)
10. [APNs production](#10-apns-production)
11. [Monitoring, crash và dSYM](#11-monitoring-crash-và-dsym)
12. [Release checklist, rollback, incident và ASO](#12-release-checklist-rollback-incident-và-aso)
13. [Tài liệu tham khảo](#13-tài-liệu-tham-khảo)

---

## 1. Code signing: certificate, App ID và provisioning profile

Code signing chứng minh binary do team phát hành và cho phép thiết bị/App Store chấp nhận
app. Ba mảnh ghép:

| Thành phần | Vai trò | Nơi quản lý |
|---|---|---|
| **Certificate** | Danh tính ký code, gồm public key + private key | Keychain trên Mac; Apple Developer portal |
| **App ID** | Định danh app và capabilities | Apple Developer → Identifiers |
| **Provisioning profile** | Ghép App ID + certificate + thiết bị (nếu dev/ad hoc) | Developer portal hoặc Xcode-managed |

### 1.1 Certificate

- **Apple Development**: chạy trên thiết bị dev, dùng cho debug.
- **Apple Distribution**: ký App Store và Ad Hoc.
- **Developer ID**: dùng cho macOS ngoài App Store, **không** dùng cho iOS App Store.

Kiểm tra certificate đang có bằng `security find-identity -v -p codesigning`.

Mỗi certificate có một private key. Khi chuyển máy, export `.p12` từ Keychain (kèm mật
khẩu mạnh) và import sang máy mới; không gửi `.p12` qua chat hay commit vào repo. Nếu mất
private key, phải tạo certificate mới và cập nhật profile/CI.

> ⚠️ Revoke certificate đang dùng có thể làm hỏng build của người khác và pipeline. Kiểm
> tra ngày hết hạn, owner và profile liên quan trước khi revoke.

### 1.2 App ID và capabilities

Tạo App ID dạng explicit (`com.example.guestbook`) thay vì wildcard để bật được
capabilities. Với guestbook, bật tối thiểu:

- **Push Notifications** — nhận tin mới qua APNs.
- **Associated Domains** — Universal Link `applinks:guestbook.wedding.example`; chỉ bật
  **Background Modes** khi thật sự dùng (`fetch`, `remote-notification`).

Capabilities phải khớp giữa Developer portal, file `.entitlements` và App Store Connect.
Bật push ở portal nhưng thiếu entitlement sẽ nhận lỗi `no valid aps-environment`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>aps-environment</key><string>production</string>
  <key>com.apple.developer.associated-domains</key>
  <array><string>applinks:guestbook.wedding.example</string></array>
</dict>
</plist>
```

`aps-environment` do profile quyết định khi build; đừng hard-code `development` cho bản
Release.

### 1.3 Provisioning profile

| Loại | Dùng cho | Thiết bị |
|---|---|---|
| iOS App Development | Debug trên máy thật | Có danh sách UDID |
| Ad Hoc | Phát nội bộ ngoài TestFlight | Có danh sách UDID, tối đa 100/năm |
| App Store | Archive gửi App Store/TestFlight | Không giới hạn thiết bị |

**Automatic signing** phù hợp team nhỏ: Xcode tự tạo certificate/profile, nhưng vẫn cần
Apple ID có quyền. **Manual signing** phù hợp CI hoặc team nhiều người: quản lý profile
tường minh, dễ tái lập nhưng dễ hết hạn.

```bash
xcodebuild -showBuildSettings -scheme Guestbook \
  | grep -E 'CODE_SIGN|DEVELOPMENT_TEAM|PROVISIONING_PROFILE'
```

Checklist signing:

- [ ] Profile chứa đúng certificate và capabilities.
- [ ] Build Release trên máy sạch thành công.
- [ ] CI dùng App Store Connect API key, không dùng Apple ID cá nhân.

---

## 2. Build configuration, scheme và versioning

### 2.1 Ba cấu hình tối thiểu

| Configuration | Backend | Dùng cho | Ghi chú |
|---|---|---|---|
| Debug | Local hoặc staging | Dev hằng ngày | Bật log, không upload |
| Staging | Staging | QA/TestFlight nội bộ | Cùng code, khác endpoint |
| Release | Production | App Store | Tắt log nhạy cảm, bật crash reporting |

Không tạo app “debug” riêng rồi release nhầm endpoint. Dùng `.xcconfig` để cấu hình
endpoint theo build, tránh sửa tay trước khi archive.

```text
// Config/Release.xcconfig
PRODUCT_BUNDLE_IDENTIFIER = com.example.guestbook
MARKETING_VERSION = 1.0.0
API_BASE_URL = https:/$()/guestbook.wedding.example
```

`$()` trong xcconfig tránh `//` bị hiểu là comment. Đọc giá trị trong Info.plist bằng key
`APIBaseURL` trỏ tới `$(API_BASE_URL)`.

### 2.2 Scheme và test plan

- Chia sẻ scheme (`Shared`) để CI và đồng nghiệp dùng được; scheme cá nhân không nằm
  trong repo.
- Dùng test plan cho unit/UI test; đặt biến môi trường cho test thay vì hard-code.
- Scheme Release không chạy `#if DEBUG`; kiểm tra `assert`/`precondition` không lọt vào
  luồng người dùng.

### 2.3 Version và build number

| Trường | Ý nghĩa | Quy tắc |
|---|---|---|
| `CFBundleShortVersionString` | Version hiển thị (1.2.0) | Tăng theo semantic version |
| `CFBundleVersion` | Build number | Tăng đơn điệu mỗi lần upload |

App Store từ chối build trùng số. Trong CI, dùng số run hoặc timestamp:

```bash
# Tăng build number cho mọi target trước khi archive
xcrun agvtool new-version -all "${GITHUB_RUN_NUMBER:-$(date +%Y%m%d%H%M)}"
```

Không đổi `MARKETING_VERSION` cho mỗi build TestFlight; chỉ đổi khi có bản phát hành mới.
Ghi tag Git (`v1.2.0`) trùng version để truy vết.

> 💡 Đặt `CURRENT_PROJECT_VERSION` trong xcconfig làm giá trị mặc định, CI override bằng
> `xcodebuild CURRENT_PROJECT_VERSION=...` để không sửa file trong pipeline.

---

## 3. Archive, export và upload

### 3.1 Archive

Archive là snapshot build Release kèm dSYM. Luôn archive trên máy sạch hoặc CI, không dùng
build Debug.

```bash
xcodebuild clean archive \
  -scheme Guestbook \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/Guestbook.xcarchive \
  -allowProvisioningUpdates
```

### 3.2 Export

Tạo `ExportOptions.plist` cho App Store:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key><string>app-store-connect</string>
    <key>signingStyle</key><string>automatic</string>
    <key>teamID</key><string>ABCDE12345</string>
    <key>uploadSymbols</key><true/>
</dict>
</plist>
```

```bash
xcodebuild -exportArchive \
  -archivePath build/Guestbook.xcarchive \
  -exportOptionsPlist Config/ExportOptions.plist \
  -exportPath build/export \
  -allowProvisioningUpdates
```

`method` phụ thuộc Xcode: với Xcode 15.3+ dùng `app-store-connect`; bản cũ dùng
`app-store`. `uploadSymbols` giúp symbolicate crash.

### 3.3 Upload

Ba cách phổ biến: **Xcode Organizer** cho release thủ công, **`xcrun altool`** cho CI, và
**Transporter/fastlane** khi cần log rõ ràng.

```bash
xcrun altool --upload-app \
  --type ios \
  --file build/export/Guestbook.ipa \
  --apiKey "$ASC_KEY_ID" \
  --apiIssuer "$ASC_ISSUER_ID"
```

Nếu `altool` bị bỏ trong Xcode tương lai, chuyển sang Transporter CLI hoặc fastlane
`upload_to_testflight`/`deliver`. Nguyên tắc không đổi: API key nằm trong secret store,
không nằm trong repo.

> ⚠️ Đừng upload archive chứa framework debug, endpoint localhost hoặc `-Onone`. Kiểm tra
> `Build Configuration = Release`, `SWIFT_OPTIMIZATION_LEVEL = -O`, và biến môi trường
> trước khi bấm upload.

---

## 4. TestFlight

TestFlight là vòng beta trước App Store. Có hai nhóm:

| Nhóm | Số tester | Review | Dùng cho |
|---|---|---|---|
| Internal | Tối đa 100 thành viên team | Không cần beta review | Dev, QA, stakeholder |
| External | Tối đa 10.000 | Beta App Review cho build đầu | Khách mời thật, đối tác |

Build TestFlight hết hạn sau **90 ngày**; đánh dấu phiên bản đang test và nhắc tester cập
nhật. Mỗi build cần chờ Apple xử lý (thường vài phút đến dưới một giờ), sau đó mới xuất
hiện cho tester.

### 4.1 Thông tin cần điền

- **What to Test**: kịch bản ngắn, bằng tiếng Việt, ví dụ “mở tab Lời chúc, gửi một lời
  chúc, kiểm tra danh sách cập nhật realtime, thử mất mạng rồi gửi lại”.
- **Test Information**: email liên hệ, URL privacy policy, tài khoản demo nếu có auth.
- **Feedback**: bật screenshot/feedback trong TestFlight; nhắc tester ghi rõ thiết bị,
  phiên bản iOS và thời điểm lỗi.
- **Export compliance**: trả lời câu hỏi mã hoá; nếu chỉ dùng HTTPS tiêu chuẩn, khai báo
  `ITSAppUsesNonExemptEncryption = NO` trong Info.plist để bớt câu hỏi mỗi build.

### 4.2 Điều nên test trên bản beta

- [ ] Gửi lời chúc khi mạng chậm, mất mạng giữa request và khi server trả 5xx.
- [ ] Hai thiết bị cùng mở: tin mới, tin sửa, tin xoá cập nhật realtime.
- [ ] Tên tiếng Việt có dấu, emoji, nội dung dài, chỉ khoảng trắng; Dynamic Type lớn nhất,
      VoiceOver, dark mode.
- [ ] Push trên thiết bị thật; cold start, background/foreground và xoay màn hình.

> ⚠️ TestFlight dùng APNs production, còn build Debug chạy từ Xcode dùng sandbox. Đừng
> kết luận push hỏng chỉ vì thử trên simulator hoặc sai môi trường.

---

## 5. App Store Connect và submission

### 5.1 Hồ sơ app

| Trường | Giới hạn/ghi chú |
|---|---|
| Tên app | 30 ký tự, không nhồi từ khoá |
| Subtitle | 30 ký tự, mô tả giá trị chính |
| Category | Lifestyle hoặc Events; chọn đúng để review không hỏi lại |
| Privacy Policy URL | Bắt buộc, phải truy cập được |
| Support URL | Trang hỗ trợ thật, có email liên hệ |
| Age rating | Trả lời bảng câu hỏi hiện hành; UGC thường đẩy mức tuổi lên |
| Keywords | 100 ký tự, phân tách bằng dấu phẩy, không lặp tên app |
| Promotional text | 170 ký tự, có thể sửa không cần build mới |

Ảnh chụp phải đúng kích thước và phản ánh app thật: iPhone 6.9 inch `1320 × 2868`, 6.5
inch `1284 × 2778` (hoặc `1242 × 2688`), thêm iPad nếu app hỗ trợ. Tối thiểu 3 ảnh, nên có
danh sách lời chúc, form gửi, trạng thái realtime/offline; không dùng mockup có tính năng
app không có.

### 5.2 Chọn build và gửi review

1. Chọn build đã upload, kiểm tra version/build number.
2. Trả lời export compliance và content rights.
3. Điền **Review Notes**: backend đang chạy ở đâu, có cần tài khoản demo không, cách tạo
   dữ liệu mẫu. Với guestbook chưa có auth, ghi rõ mọi thao tác ghi đều công khai trong
   bản test.
4. Chọn **Manually release** nếu cần kiểm tra lần cuối; **Automatically release** nếu
   pipeline đã ổn định.
5. Bật **Phased release** (7 ngày) để giảm rủi ro khi có lỗi nghiêm trọng.

Khai báo `ITSAppUsesNonExemptEncryption = NO` trong Info.plist nếu app chỉ dùng HTTPS/TLS
tiêu chuẩn và không tự implement mã hoá. Nếu dùng crypto riêng, chuẩn bị tài liệu export
compliance theo hướng dẫn của Apple.

> 💡 Tên app và subtitle nên nói rõ “Sổ lưu bút / Wedding Guestbook” thay vì chỉ “Guestbook”
> để người dùng và reviewer hiểu mục đích.

---

## 6. App Store review

### 6.1 Rủi ro lớn nhất: nội dung người dùng tạo

Guestbook chứa nội dung do khách gửi, nên guideline **1.2 User-Generated Content** áp dụng.
App cần tối thiểu:

- Cơ chế **lọc/báo cáo** nội dung phản cảm và **chặn** người dùng lạm dụng (khi có auth)
  hoặc vô hiệu hoá thiết bị/token.
- **Liên hệ** công khai, EULA nêu rõ không dung túng nội dung thù địch, và quy trình xử lý
  báo cáo trong vòng 24 giờ.

Backend hiện chưa có auth và chưa có moderation. Trước khi public, cần thêm report button,
trạng thái `hidden`, và admin duyệt/xoá. Nếu không, app có thể bị từ chối hoặc gỡ sau khi
lên store.

### 6.2 Lỗi thường gặp

| Guideline | Biểu hiện | Cách tránh |
|---|---|---|
| 2.1 Performance | Crash, link hỏng, màn hình trắng | Test trên thiết bị thật, kiểm tra mọi URL |
| 2.3.1 Hidden features | UI/metadata không khớp tính năng | Không giấu debug menu trong Release |
| 3.1.1 In-App Purchase | Bán nội dung số ngoài IAP | Dùng IAP nếu có tính năng trả phí |
| 4.2 Minimum functionality | App chỉ là web wrapper/landing page | Có giá trị native: realtime, offline, form |
| 5.1.1 Data collection | Thiếu purpose string, thu thập quá mức | Chỉ xin quyền khi cần, giải thích rõ |
| 5.1.2 Data use | Dùng dữ liệu khách mời cho quảng cáo | Không bán/chia sẻ dữ liệu guestbook |

### 6.3 Quy trình xử lý

- Trả lời trong **Resolution Center**, ngắn gọn, nêu build/screenshot và cách tái hiện.
- Nếu bị từ chối vì hiểu nhầm, giải thích bằng tiếng Anh rõ ràng, kèm video ngắn nếu cần.
- **Appeal** khi guideline bị áp dụng sai; **expedited review** chỉ dùng cho sự cố nghiêm
  trọng (bảo mật, sự kiện sắp diễn ra), không dùng để xin nhanh.
- Không upload build mới chỉ để “thử xem” khi chưa sửa đúng vấn đề; mỗi lần review tốn
  thời gian và có thể làm chậm release.

Checklist trước khi submit:

- [ ] Không còn task tạm/debug menu, endpoint staging hoặc log token.
- [ ] Có report/block hoặc moderation cho nội dung guestbook.
- [ ] Privacy policy và support URL truy cập được từ thiết bị thật.
- [ ] Ảnh chụp màn hình khớp build đang gửi.
- [ ] Ghi chú review có hướng dẫn tạo dữ liệu mẫu.
- [ ] Đã test luồng gửi lời chúc từ máy chưa từng cài app.

---

## 7. Privacy manifest và quyền

### 7.1 PrivacyInfo.xcprivacy

Từ iOS 17, app và third-party SDK cần privacy manifest khi dùng một số API hoặc thu thập
dữ liệu. File nằm trong app bundle:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeName</string>
            <key>NSPrivacyCollectedDataTypeLinked</key><true/>
            <key>NSPrivacyCollectedDataTypeTracking</key><false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array><string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string></array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key><array><string>CA92.1</string></array>
        </dict>
    </array>
</dict>
</plist>
```

Khai báo đúng những gì app thực sự thu thập: tên khách, nội dung lời chúc, device token
(push), dữ liệu chẩn đoán nếu có. Không khai báo “cho chắc” mọi loại dữ liệu.

### 7.2 Required reason APIs

Các API phổ biến cần lý do:

| API | Reason code thường dùng | Ghi chú |
|---|---|---|
| `UserDefaults` | `CA92.1` | Chỉ đọc/ghi cấu hình của chính app |
| Disk space | `E174.1` | Kiểm tra dung lượng trước khi cache |

Chỉ khai báo API thật sự dùng; reviewer có thể kiểm tra bằng static analysis. Third-party
SDK phải có manifest và chữ ký riêng; cập nhật SDK thay vì tự vá manifest của họ.

### 7.3 Quyền và ATT

- **Notification**: xin quyền qua `UNUserNotificationCenter`, không cần purpose string.
- **Camera/Photo**: chỉ thêm khi có tính năng đính kèm ảnh; luôn có
  `NSCameraUsageDescription`/`NSPhotoLibraryUsageDescription` bằng tiếng Việt.
- **Tracking (ATT)**: chỉ dùng khi thật sự track người dùng xuyên app/website của bên khác.
  Guestbook không nên tracking; nếu có analytics, ưu tiên first-party, không liên kết
  quảng cáo.
- **Account deletion**: nếu sau này thêm tài khoản, app phải cho xoá tài khoản ngay trong
  app (guideline 5.1.1(v)).

> ⚠️ Hiển thị prompt ATT tuỳ chỉnh trước prompt hệ thống có thể bị từ chối. Nếu không
> tracking, đặt `NSPrivacyTracking = false` và đừng xin ATT.

---

## 8. Bảo mật production

Backend hiện tại chưa có auth cho các route ghi. Trước khi public, tối thiểu:

| Rủi ro | Hiện tại | Production |
|---|---|---|
| Spam lời chúc | POST công khai | Rate limit theo IP/device + captcha hoặc RSVP token |
| Sửa/xoá trái phép | PUT/DELETE công khai | Chỉ admin, có auth + audit log |
| Dữ liệu khách mời | Tên, số người tham dự | Tối thiểu hoá, retention rõ ràng, không log |
| Token/secret | Chưa có | Keychain, secret manager, không nằm trong app |
| Nội dung xấu | Chưa moderation | Report + duyệt/xoá + lưu bằng chứng |

### 8.1 App Transport Security

Giữ ATS mặc định; chỉ thêm `NSAllowsLocalNetworking = true` khi dev với backend localhost.
Không dùng `NSAllowsArbitraryLoads` trong Release. Nếu backend chưa có HTTPS, đó là blocker
release, không phải lý do tắt ATS.

### 8.2 Secret và dữ liệu nhạy cảm

- Supabase **service role key** chỉ nằm ở backend; app không bao giờ giữ key này.
- Access token (nếu có auth) lưu Keychain với `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`.
- Không đưa token vào URL WebSocket; dùng header/subprotocol.
- Không log tên khách, nội dung lời chúc, device token hoặc Authorization header.
- Pin dependency SPM theo version; certificate pinning chỉ khi có quy trình rotate, vì pin
  sai làm app chết hàng loạt.

> ⚠️ Client validation chỉ là UX. Server vẫn phải kiểm tra độ dài, trim khoảng trắng, rate
> limit và phân quyền; đừng tin bất kỳ dữ liệu nào từ app.

---

## 9. CI/CD

### 9.1 Nguyên tắc

- Pull request: build + unit test, **không** ký và **không** upload.
- Tag `v*` hoặc merge vào `main`: archive, upload TestFlight, tạo tag.
- Secret nằm trong GitHub Environments có approval; không in ra log.
- Pin runner (`macos-15`) và action version; macOS runner thay đổi theo thời gian.
- Lưu `.xcresult`, `.xcarchive`, dSYM và log upload theo từng run.

### 9.2 Pipeline mẫu

```yaml
name: ios-release
on:
  push:
    tags: ["v*"]

jobs:
  release:
    runs-on: macos-15
    environment: app-store
    steps:
      - uses: actions/checkout@v4
      - name: Prepare API key
        run: |
          echo "$ASC_KEY_CONTENT" | base64 -D > "$RUNNER_TEMP/AuthKey.p8"
        env:
          ASC_KEY_CONTENT: ${{ secrets.ASC_KEY_CONTENT }}
      - name: Archive
        run: |
          xcodebuild archive -scheme Guestbook -configuration Release \
            -destination 'generic/platform=iOS' \
            -archivePath build/Guestbook.xcarchive \
            -allowProvisioningUpdates
      - name: Export
        run: |
          xcodebuild -exportArchive \
            -archivePath build/Guestbook.xcarchive \
            -exportOptionsPlist Config/ExportOptions.plist \
            -exportPath build/export \
            -allowProvisioningUpdates
      - name: Upload
        run: |
          xcrun altool --upload-app --type ios \
            --file build/export/Guestbook.ipa \
            --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
        env:
          ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
```

### 9.3 Secret cần có

| Secret | Dùng cho |
|---|---|
| `ASC_KEY_ID` | App Store Connect API key ID |
| `ASC_ISSUER_ID` | Issuer ID của API key |
| `ASC_KEY_CONTENT` | Nội dung file `.p8`, base64 |
| `MATCH_PASSWORD` | Nếu dùng fastlane match để quản lý certificate |

Nếu đã dùng fastlane, thay ba bước archive/export/upload bằng `build_app` và
`upload_to_testflight`/`deliver`; vẫn dùng `match(readonly: true)` trong CI và không commit
thư mục certificate.

> ⚠️ Không chạy job upload trên `pull_request` từ fork: secret không có, và code chưa được
> review có thể lọt vào build. Dùng `environment` có approval cho job release.

---

## 10. APNs production

### 10.1 Chọn loại xác thực

| Loại | Hạn | Ưu điểm | Nhược điểm |
|---|---|---|---|
| Certificate | 1 năm | Cấu hình đơn giản | Phải gia hạn, mỗi môi trường riêng |
| Token (.p8) | Không hết hạn | Một key cho sandbox + production | Bảo mật key quan trọng hơn |

Khuyến nghị dùng **.p8 token-based**. Tạo tại Apple Developer → Keys → APNs, tải file
**một lần duy nhất**, ghi lại **Key ID** và **Team ID**. Không commit file `.p8`; đưa vào
secret manager của backend.

### 10.2 Gửi push từ backend

Backend tạo JWT ES256 với header `alg`/`kid`, claims `iss`/`iat`, ký bằng private key trong
`.p8`; cache token khoảng 50 phút thay vì tạo mới mỗi request.

```bash
curl --http2 \
  --header "authorization: bearer $APNS_JWT" \
  --header "apns-topic: com.example.guestbook" \
  --header "apns-push-type: alert" \
  --header "apns-priority: 10" \
  --data '{"aps":{"alert":{"title":"Lời chúc mới","body":"Lan vừa gửi lời chúc"},"badge":1},"message_id":42}' \
  https://api.push.apple.com/3/device/$DEVICE_TOKEN
```

Dùng `api.sandbox.push.apple.com` cho build Debug từ Xcode và `api.push.apple.com` cho
TestFlight/App Store.

### 10.3 Xử lý lỗi và token

- `410 Unregistered` hoặc `BadDeviceToken`: xoá token khỏi DB, không retry vô hạn.
- `429 TooManyRequests`, `5xx`: retry có backoff; tôn trọng `apns-expiration`.
- Token thay đổi sau khi cài lại app hoặc restore; luôn đăng ký lại khi app khởi động.
- Backend cần endpoint `POST /api/devices` (tương lai) để lưu token theo user/thiết bị.
- Không gửi nội dung riêng tư trong payload; gửi `message_id` và để app fetch khi mở.
- Client nhận token trong `didRegisterForRemoteNotificationsWithDeviceToken`, đổi sang chuỗi
  hex rồi gửi về backend; không log token.

> ⚠️ TestFlight dùng APNs production. Nếu backend cấu hình sandbox, tester TestFlight sẽ
> không nhận được push dù build chạy tốt trên máy dev.

---

## 11. Monitoring, crash và dSYM

### 11.1 dSYM và symbolication

Crash report chỉ đọc được khi có dSYM đúng UUID. Archive Release tạo dSYM; upload lên
Crashlytics/Sentry hoặc lưu cùng artifact. Kiểm tra UUID bằng
`dwarfdump --uuid build/Guestbook.xcarchive/dSYMs/Guestbook.app.dSYM`. Build phase upload chỉ
nên chạy cho Release, không làm fail build khi upload lỗi (`|| true`) và phải tìm đúng
`*.dSYM` trong `$DWARF_DSYM_FOLDER_PATH`.

### 11.2 MetricKit và log

Đăng ký một `MXMetricManagerSubscriber` trong `didFinishLaunching` bằng
`MXMetricManager.shared.add(subscriber)`, upload `MXMetricPayload` và
`MXDiagnosticPayload` dưới dạng JSON. MetricKit tổng hợp theo ngày, phù hợp theo dõi launch
time, hang rate, memory và pin mà không cần SDK bên thứ ba.

Log dùng `OSLog` với category (`network`, `realtime`, `sync`); đặt `privacy: .private` cho
dữ liệu nhạy cảm và không log tên khách/nội dung lời chúc.

### 11.3 Ngưỡng cảnh báo

| Tín hiệu | Nguồn | Ngưỡng hành động |
|---|---|---|
| Crash-free sessions | Crashlytics/Sentry/MetricKit | < 99.5% |
| Launch time | MetricKit/Organizer | > 2 giây trên thiết bị cũ |
| Tỷ lệ lỗi API | Log/analytics | > 5% trong 15 phút |
| Reconnect WebSocket | Log realtime | Tăng đột biến sau release |
| Outbox backlog | Sync engine | > 20 item hoặc > 10 phút |
| Push 410 | Backend APNs log | Tăng bất thường → kiểm tra token cleanup |

> 💡 Cảnh báo phải có owner và kênh nhận. Dashboard không ai đọc không phải monitoring.

---

## 12. Release checklist, rollback, incident và ASO

### 12.1 Trước release

- [ ] Build number mới, tag Git trùng version.
- [ ] Test trên iPhone thật, iOS cũ nhất còn hỗ trợ và bản iOS mới nhất.
- [ ] Backend production: HTTPS, CORS/rate limit, migration đã chạy, sao lưu gần nhất.
- [ ] Không còn endpoint staging/localhost trong build Release.
- [ ] Privacy manifest, purpose string, privacy policy khớp tính năng.
- [ ] dSYM upload hoạt động; report/moderation cho guestbook đã bật.

### 12.2 Ngày release

- [ ] Chọn đúng build, bật phased release.
- [ ] Theo dõi App Store Connect processing và trạng thái review.
- [ ] Kiểm tra app trên máy sạch sau khi lên store (không chỉ TestFlight).
- [ ] Xác nhận gửi lời chúc, realtime, push hoạt động từ bản store.
- [ ] Thông báo cho stakeholder và ghi mốc thời gian.

### 12.3 Sau release

- 1 giờ: crash-free, lỗi API, gửi lời chúc.
- 24 giờ: rating, review, push, outbox backlog, phản hồi người dùng.
- 7 ngày: retention, hiệu năng trên thiết bị cũ, quyết định có tắt phased release sớm.

### 12.4 Rollback và incident

App Store **không cho downgrade** bản đã phát hành. Cách giảm thiểu:

| Tình huống | Hành động |
|---|---|
| Lỗi UI nhỏ | Hotfix ở bản kế tiếp; tắt tính năng bằng feature flag |
| Lỗi nghiêm trọng, crash nhiều | Pause phased release; tắt tính năng qua remote config; chuẩn bị hotfix |
| Backend lỗi | Rollback deploy backend; app hiển thị trạng thái lỗi thay vì crash |
| Dữ liệu sai | Stop ghi, sửa bằng migration có backup, thông báo người dùng |

Phân loại incident:

- **P0**: app không dùng được, mất dữ liệu, lộ dữ liệu → xử lý ngay, mọi người liên quan.
- **P1**: tính năng chính hỏng nhưng có workaround → xử lý trong ngày.
- **P2**: lỗi nhỏ, ảnh hưởng một nhóm → đưa vào sprint.

Quy trình tối thiểu: phát hiện → xác nhận → khoanh vùng → giảm thiểu → khắc phục → viết
postmortem không đổ lỗi, có action item và owner.

### 12.5 ASO

- **Tên + subtitle + keywords**: chứa từ khoá tự nhiên (“Sổ lưu bút”, “Wedding
  Guestbook”); keywords tối đa 100 ký tự, không lặp tên app.
- **Ảnh đầu tiên**: thể hiện giá trị trong 3 giây; screenshot thứ hai nói về realtime/gửi
  lời chúc.
- **Preview video**: 15–30 giây, không chứa nội dung gây hiểu nhầm.
- **Đánh giá**: xin review sau hành động tích cực (gửi lời chúc thành công) bằng
  `AppStore.requestReview(in:)` trên iOS 16+; không spam prompt.
- **Localization + Product Page Optimization**: dịch cả metadata, test ảnh/subtitle với
  tỷ lệ chia nhỏ và đo conversion.

### 12.6 Anti-patterns

| ❌ Anti-pattern | ✅ Thay thế |
|---|---|
| Archive bằng cấu hình Debug | Luôn archive Release trên máy sạch/CI |
| Commit `.p12`/`.p8`/API key | Secret manager + environment approval |
| Tắt ATS vì backend chưa có HTTPS | Sửa backend, giữ ATS |
| Xin mọi quyền ngay khi mở app | Xin quyền đúng ngữ cảnh |
| Gửi nội dung lời chúc trong push | Gửi `message_id`, fetch khi mở |
| Không có moderation UGC | Report + duyệt/xoá + EULA |
| Release không có rollback plan | Feature flag + pause phased release |

### 12.7 Bài tập

1. Viết `ExportOptions.plist` và chạy archive/export thành công trên máy sạch.
2. Tạo TestFlight internal group, mời một tester và thu feedback có screenshot.
3. Thêm privacy manifest cho `UserDefaults` và kiểm tra bằng `plutil -lint`.
4. Dựng pipeline GitHub Actions upload TestFlight khi push tag `v*`.
5. Mô phỏng incident: backend trả 500 khi gửi lời chúc, viết runbook và hotfix trong 30 phút.

---

## 13. Tài liệu tham khảo

- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Apple Developer Program**: https://developer.apple.com/programs/
- **Certificates, Identifiers & Profiles**: https://developer.apple.com/account/resources/
- **TestFlight**: https://developer.apple.com/testflight/
- **Privacy manifest**: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- **Required reason APIs**: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files/describing-use-of-required-reason-api
- **APNs**: https://developer.apple.com/documentation/usernotifications/
- **MetricKit**: https://developer.apple.com/documentation/metrickit
- **Xcode build/archive**: https://developer.apple.com/documentation/xcode
- **WebSocket trong repo**: [`../websocket.md`](../websocket.md)
- **API security trong repo**: [`../api-security.md`](../api-security.md)
- **Kiến trúc nâng cao**: [`ios-advanced.md`](./ios-advanced.md)
