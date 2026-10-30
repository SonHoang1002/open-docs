# FFmpeg — Hướng dẫn toàn diện từ cơ bản đến nâng cao

> Tài liệu tham khảo đầy đủ về FFmpeg: cấu trúc lệnh, mọi thuộc tính (option) quan trọng,
> codec, filter, muxer, chiến lược nén, xử lý video/ảnh/gif, nhúng metadata, pipeline
> transcode/HLS/DASH, DRM, CDN và mã lệnh ví dụ thực hành. Ví dụ dùng domain
> **products/orders** (video sản phẩm, ảnh do người bán tải lên) để minh hoạ, không phụ
> thuộc một dự án cụ thể.

---

## Mục lục

1. [FFmpeg là gì & cài đặt](#1-ffmpeg-là-gì--cài-đặt)
2. [Cấu trúc lệnh FFmpeg (kiến trúc cốt lõi)](#2-cấu-trúc-lệnh-ffmpeg-kiến-trúc-cốt-lõi)
3. [Global options — Thuộc tính toàn cục](#3-global-options--thuộc-tính-toàn-cục)
4. [Input options — Thuộc tính đầu vào](#4-input-options--thuộc-tính-đầu-vào)
5. [Output options — Thuộc tính đầu ra](#5-output-options--thuộc-tính-đầu-ra)
6. [Stream specifiers & map](#6-stream-specifiers--map)
7. [Codec, bitrate, quality — Thuộc tính mã hóa](#7-codec-bitrate-quality--thuộc-tính-mã-hóa)
8. [Container (muxer/demuxer) & options riêng](#8-container-muxerdemuxer--options-riêng)
9. [Video filters (filtergraph)](#9-video-filters-filtergraph)
10. [Audio filters](#10-audio-filters)
11. [Lệnh thường dùng — cheat sheet](#11-lệnh-thường-dùng--cheat-sheet)
12. [Pipeline media thực tế: video sản phẩm](#12-pipeline-media-thực-tế-video-sản-phẩm)
13. [Pipeline transcode production & HLS/DASH](#13-pipeline-transcode-production--hlsdash)
14. [Subtitle, loudness & accessibility](#14-subtitle-loudness--accessibility)
15. [DRM & bảo vệ nội dung](#15-drm--bảo-vệ-nội-dung)
16. [Storage, CDN & phân phối](#16-storage-cdn--phân-phối)
17. [Tích hợp Node.js và Python](#17-tích-hợp-nodejs-và-python)
18. [Xử lý lỗi, retry & failure modes](#18-xử-lý-lỗi-retry--failure-modes)
19. [CLI reference nhanh](#19-cli-reference-nhanh)
20. [Gỡ lỗi & mẹo hiệu năng](#20-gỡ-lỗi--mẹo-hiệu-năng)
21. [Anti-patterns](#21-anti-patterns)
22. [Tài liệu tham khảo](#22-tài-liệu-tham-khảo)

---

## 1. FFmpeg là gì & cài đặt

**FFmpeg** là bộ công cụ xử lý đa phương tiện mã nguồn mở: đọc, ghi, chuyển đổi, cắt, ghép,
lọc (filter) mọi định dạng video/audio/subtitle/image. Gồm nhiều binary:

| Binary | Vai trò |
|---|---|
| `ffmpeg` | Convert/transcode/nén — công cụ chính |
| `ffprobe` | Đọc thông tin file (codec, bitrate, duration, stream) |
| `ffplay` | Trình phát thử nhanh |
| `ffconcat` | Ghép file theo list |
| `ffserver` | Streaming server (đã gỡ khỏi bản chính thức) |

### Cài đặt

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg

# Kiểm tra version & cấu hình
ffmpeg -version
ffmpeg -buildconf          # xem library được compile kèm (libx264, libvpx...)
```

---

## 2. Cấu trúc lệnh FFmpeg (kiến trúc cốt lõi)

Mọi lệnh FFmpeg tuân theo **một khuôn duy nhất** — hiểu khuôn này là hiểu 90% FFmpeg:

```text
ffmpeg [global options] [input options -i INPUT] [output options] OUTPUT
       └── toàn cục      ── options cho input cụ thể ──  options cho output ── file ra
```

Ví dụ đầy đủ:

```bash
ffmpeg -hide_banner -y \
  -hwaccel videotoolbox \              # global/input option
  -i input.mov \                        # INPUT (đặt TRƯỚC options của nó)
  -t 00:01:30 \                         # output option: cắt 90 giây
  -c:v libx264 -preset slow -crf 23 \   # output option: codec + chất lượng
  -c:a aac -b:a 128k \                  # output option: audio
  -movflags +faststart \                # output option: option riêng của mp4
  output.mp4                            # OUTPUT
```

**Quy tắc bất di bất dịch:**

1. `-i` đặt **ngay trước** file input; mọi option **trước** `-i` apply cho input đó.
2. Mọi option **sau** input cuối cùng apply cho output.
3. Option **trước mọi `-i`** = global option.
4. Muốn nhiều input/output → lặp lại `-i` và đặt nhiều file output.

```bash
# 2 input (ghép ảnh + nhạc), 1 output
ffmpeg -loop 1 -i photo.jpg -i song.mp3 -shortest -c:v libx264 out.mp4
```

---

## 3. Global options — Thuộc tính toàn cục

Đặt ở bất kỳ đâu nhưng thường đặt đầu tiên, apply cho toàn bộ phiên.

| Option | Ý nghĩa | Ghi chú |
|---|---|---|
| `-h`, `-help` | Trợ giúp | `-h full` = đầy đủ; `-h demuxer=mp4` |
| `-version` | In phiên bản | |
| `-buildconf` | Cấu hình build (codec kèm theo) | |
| `-formats`, `-muxers`, `-demuxers` | Liệt kê định dạng hỗ trợ | |
| `-codecs`, `-decoders`, `-encoders` | Liệt kê codec | |
| `-bsfs`, `-protocols`, `-filters` | Liệt kê bitstream filter, giao thức, filter | |
| `-loglevel <level>` | Mức log | `quiet`,`fatal`,`error`,`warning`,`info`,`verbose`,`debug`,`trace` |
| `-v <level>` | Rút gọn của `-loglevel` | `-v error` rất hay dùng |
| `-hide_banner` | Ẩn banner version/library | Gọn output cho production |
| `-y` | Ghi đè file output **không hỏi** | **Bắt buộc** khi chạy server |
| `-n` | Không ghi đè — fail nếu file tồn tại | |
| `-nostdin` | Không đọc stdin | Quan trọng khi chạy dưới service/cron (tránh treo) |
| `-stats` | In tiến trình (`frame=... time=...`) | |
| `-progress <url>` | Ghi tiến trình ra file/URL/stdout machine-readable | Dùng cho progress bar UI |
| `-benchmark` | In thống kê hiệu năng ở cuối | |
| `-max_alloc <bytes>` | Giới hạn bộ nhớ FFmpeg được cấp | Bảo vệ server |
| `-filter_threads`, `-filter_complex_threads` | Số thread filter | |
| `-threads <n>` | Số thread encode/decode toàn cục | |
| `-debug_ts` | Debug timestamp | |
| `-benchmark_all` | Benchmark chi tiết từng stage | |
| `-stdin` | Bật đọc stdin (mặc định) | |

```bash
# Ví dụ: server-safe, không treo, chỉ in lỗi, progress cho UI
ffmpeg -hide_banner -nostdin -y -v error -progress pipe:1 -i in.mov out.mp4
```

---

## 4. Input options — Thuộc tính đầu vào

Đặt **ngay sau `-i`** (thực ra đặt **trước** `-i` của input đó).

### 4.1 Vị trí & thời gian

| Option | Ý nghĩa |
|---|---|
| `-ss <time>` | **Seek** — nhảy đến thời điểm. Đặt TRƯỚC `-i` = seek nhanh (keyframe, chính xác keyframe); Đặt SAU `-i` = decode rồi cắt — chính xác từng frame |
| `-t <duration>` | Giới hạn thời lượng đọc từ input (ví dụ `-t 30` = 30 giây) |
| `-to <time>` | Đọc đến timestamp cụ thể |
| `-timestamps <start_time>` | Ghi đè PTS bắt đầu |
| `-re` | **Read at native frame rate** — giả lập streaming realtime. Dùng khi serve file realtime (RTMP) |
| `-stream_loop <number>` | Lặp input N lần (`-1` = vô hạn, kết hợp `-t`) |
| `-f <format>` | Bắt buộc format đầu vào (khi không nhận ra từ extension hoặc input là pipe) |
| `-safe <0|1>` | Cho phép đường dẫn không an toàn (concat list) |
| `-skip_initial_bytes <n>` | Bỏ N byte đầu (file dính header rác) |
| `-analyzeduration <microseconds>` | Thời gian phân tích stream (tăng nếu format bị nhận nhầm) |
| `-probesize <bytes>` | Số byte probe tối đa |
| `-itsoffset <time>` | Dịch timestamp của input (dùng sync nhiều input) |
| `-f concat -safe 0` | Đọc file concat list |

```bash
# Seek nhanh (chỉ decode từ keyframe gần nhất — CHÍNH XÁC mức keyframe)
ffmpeg -ss 00:01:00 -i input.mp4 -c copy out.mp4

# Seek chính xác từng frame (decode từ đầu rồi cắt — CHẬM hơn nhưng chính xác)
ffmpeg -i input.mp4 -ss 00:01:00 -c:v libx264 -c:a aac out.mp4
```

> **Mẹo:** Đặt `-ss` trước `-i` khi chỉ cần cắt rough (nhanh gấp nhiều lần).
> Đặt `-ss` sau `-i` khi cần chính xác frame (xuất ảnh thumbnail, cắt theo beat...).
> Kết hợp cả hai: `-ss` trước `-i` (gần đúng) + `-ss` tinh chỉnh nhỏ sau `-i` (chính xác).

### 4.2 Tương tác đầu vào (thiết bị/bắt/stream)

| Option | Ý nghĩa |
|---|---|
| `-f <fmt>` | Input format (vd: `image2`, `rawvideo`, `lavfi`, `dshow`) |
| `-framerate <fps>` | Frame rate của input (quan trọng với `image2`, `rawvideo`) |
| `-video_size <WxH>` | Kích thước frame (rawvideo, x11grab) |
| `-pixel_format <pix_fmt>` | Pixel format input (rawvideo) |
| `-channel_layout` | Bố cục kênh audio input |
| `-sample_rate <hz>` | Sample rate input |
| `-grab_x`, `-grab_y` | Vị trí màn hình (x11grab) |
| `-i /dev/video0` | Camera (Linux v4l2) |
| `-f lavfi -i testsrc=duration=5:size=1280x720:rate=30` | Sinh video test bằng filter làm input |

### 4.3 Input từ network/stream

```bash
# RTMP stream
ffmpeg -i rtmp://server/live/stream -c copy out.mp4

# HTTP file
ffmpeg -i https://example.com/video.mp4 -c copy out.mp4

# RTSP camera
ffmpeg -rtsp_transport tcp -i rtsp://ip/stream -c:v libx264 out.mp4
```

---

## 5. Output options — Thuộc tính đầu ra

Đặt **sau input cuối cùng**.

### 5.1 Cấu trúc file output

| Option | Ý nghĩa |
|---|---|
| `-f <format>` | Output format/muxer. Bắt buộc với pipe (`-f mp4 -`) |
| `-y` / `-n` | Ghi đè / không ghi đè |
| `-map <spec>` | Chọn stream output (xem mục 6) |
| `-c <codec>` | Codec cho **tất cả** stream |
| `-c:v <codec>` | Codec video (`copy` = không mã hóa lại) |
| `-c:a <codec>` | Codec audio |
| `-c:s <codec>` | Codec subtitle |
| `-c:d <codec>` | Codec data |
| `-c:t <codec>` | Codec timecode |
| `-copyts` | Giữ nguyên timestamps |
| `-vsync <mode>` | Đồng bộ video: `passthrough`(0), `cfr`(1), `vfr`(2), `drop`, `ntsc` |
| `-async <n>` | Đồng bộ audio (stretch/skip) — deprecated, prefer filter `aresample` |
| `-shortest` | Kết thúc khi stream **ngắn nhất** kết thúc |
| `-t <duration>` | Giới hạn thời lượng output |
| `-to <time>` | Cắt đến timestamp |
| `-fs <bytes>` | Giới hạn kích thước output tối đa (bytes) |
| `-muxdelay <seconds>` | Delay mux (mpegts) |
| `-muxpreload <seconds>` | Preload mux |
| `-avoid_negative_ts <mode>` | Tránh timestamp âm: `auto`, `make_non_negative`, `make_zero`, `disabled` |
| `-max_interleave_delta <n>` | Giới hạn khoảng cách interleaving (tránh file lỗi) |
| `-movflags <flags>` | Option riêng MP4/MOV (xem mục 8) |
| `-metadata <key=value>` | Ghi metadata |
| `-map_metadata <src>` | Copy metadata từ input index |
| `-frames:v <n>` | Xuất đúng N frame video |
| `-fps_mode <mode>` | Tên mới của `-vsync` |
| `-atleast_height`, `-atleast_width` | Điều kiện |

```bash
# Ép về 30 fps (cfr = constant frame rate)
ffmpeg -i in.mkv -fps_mode cfr -r 30 -c:v libx264 out.mp4

# Giới hạn output ≤ 50 MB
ffmpeg -i in.mov -fs 52428800 -c:v libx264 -crf 26 out.mp4
```

### 5.2 Overlay / chèn

| Option | Ý nghĩa |
|---|---|
| `-ss`, `-t`, `-to` | Cắt output |
| `-itsoffset` (input) | Sync offset |

### 5.3 Multiple outputs

```bash
# Xuất 2 phiên bản cùng lúc (1 transcode + 1 copy)
ffmpeg -i input.mkv -map 0 -c copy remux.mp4 \
       -map 0:v -map 0:a:0 -c:v libx264 -crf 23 -c:a aac preview.mp4
```

> **Lưu ý:** Mọi option không có `:<stream>` áp dụng cho **mọi stream** của output
> liên quan. Nếu không muốn, dùng `-map` để giới hạn stream.

---

## 6. Stream specifiers & map

### 6.1 Stream specifier (`c:v:0`, `b:a:1`...)

```
<type>:<specifier>
type = v (video), a (audio), s (subtitle), d (data), t (timecode), 0/1/2 (index tuyệt đối)
specifier: (bỏ trống = stream đầu), N (index trong nhóm type), N-K (đếm ngược)
```

| Specifier | Ý nghĩa |
|---|---|
| `-c:v` | Codec video (stream video đầu tiên) |
| `-c:v:0` | Stream video index 0 |
| `-c:a:1` | Stream audio thứ 2 |
| `-c:s` | Codec subtitle |
| `-b:v:0` | Bitrate video stream 0 |
| `-disposition:a:0 default` | Đánh dấu stream mặc định |
| `-metadata:s:v:0 language=eng` | Metadata cho video stream 0 |

### 6.2 `-map` — chọn stream output

```bash
# Lấy video stream 0 + audio stream 0 (mặc định: chọn 1 stream mỗi type "best")
ffmpeg -i in.mkv -map 0:v:0 -map 0:a:0 -c copy out.mp4

# Lấy TẤT CẢ stream
ffmpeg -i in.mkv -map 0 -c copy out.mkv

# Lấy video + audio tiếng Anh (chọn theo language metadata)
ffmpeg -i in.mkv -map 0:v:0 -map 0:a:m:language:eng -c copy out.mp4

# BỎ một stream (vd: bỏ subtitle)
ffmpeg -i in.mkv -map 0 -map -0:s -c copy out.mp4

# Thêm stream từ input khác (vd: chèn audio từ file riêng)
ffmpeg -i video.mp4 -i audio.aac -map 0:v:0 -map 1:a:0 -c copy out.mp4

# Metadata từ input 0, nhưng stream từ cả 2 input
ffmpeg -i v.mp4 -i a.mp3 -map 0:v -map 1:a -map_metadata 0 -c copy out.mp4
```

| Kiểu map | Ví dụ |
|---|---|
| `index` | `-map 0` (mọi stream input 0) |
| `type:index` | `-map 0:v:0`, `-map 0:a:1` |
| `type:specifier` | `-map 0:a:m:language:eng` |
| `-` (loại trừ) | `-map -0:s` |

---

## 7. Codec, bitrate, quality — Thuộc tính mã hóa

### 7.1 Chọn codec

```bash
ffmpeg -encoders | grep 264          # liệt kê encoder H.264
ffmpeg -i in.mp4 -c:v libx264 out.mp4
ffmpeg -i in.mp4 -c:v h264_videotoolbox out.mp4     # hardware (macOS)
ffmpeg -i in.mp4 -c:v h264_nvenc out.mp4            # hardware (NVIDIA)
ffmpeg -i in.mp4 -c:v h264_qsv out.mp4              # hardware (Intel QSV)
ffmpeg -i in.mp4 -c copy out.mkv                    # không mã hóa lại
```

**Codec phổ biến:**

| Dùng cho | Video | Audio |
|---|---|---|
| Web/MP4 | `libx264` (H.264), `libx265` (HEVC) | `aac`, `libopus` |
| Web/WebM | `libvpx-vp9` | `libopus` |
| Nén tối đa | `libx265`, `libsvtav1` | `libopus`, `libmp3lame` |
| Lossless/chỉnh sửa | `ffv1`, `libx264-qp 0`, `utvideo` | `flac`, `pcm_s16le` |
| GIF | `gif` (palette) | — |

### 7.2 Bitrate & quality

| Option | Ý nghĩa | Ví dụ |
|---|---|---|
| `-b:v <rate>` | Bitrate video | `-b:v 5M` (5 Mbps), `800k` |
| `-b:a <rate>` | Bitrate audio | `-b:a 128k` |
| `-b:a:0` | Bitrate audio stream 0 | |
| `-q:v <n>` | Quality (scale 1–31, thấp hơn = tốt hơn, dùng với某些 codec) | `-q:v 2` |
| `-crf <n>` | **Constant Rate Factor** — quality-based (libx264/libx265/libvpx-vp9) | `-crf 23` (mặc định x264) |
| `-qp <n>` | Constant Quantizer (h264_nvenc, qsv) | `-qp 23` |
| `-profile:v <p>` | Profile | `baseline`, `main`, `high`, `high10` |
| `-level <n>` | Level | `3.1`, `4.0`, `4.1`, `4.2` |
| `-preset <p>` | Speed/efficiency trade-off (x264/x265) | `ultrafast`…`veryslow` |
| `-tune <t>` | Tune cho nội dung | `film`, `animation`, `stillimage`, `fastdecode`, `zerolatency` |
| `-g <n>` | GOP size (số frame giữa 2 keyframe) | `-g 60` |
| `-keyint_min <n>` | Keyframe tối thiểu | |
| `-sc_threshold <n>` | Scene-change threshold (tự thêm keyframe) | |
| `-bf <n>` | Số B-frame | `-bf 3` |
| `-refs <n>` | Số reference frame | |
| `-pix_fmt <fmt>` | Pixel format | `yuv420p` (chuẩn web), `yuv420p10le` (10-bit) |
| `-colorspace`, `-color_primaries`, `-color_trc`, `-color_range` | metadata màu | `bt709`, `tv`/`pc` |
| `-x264-params "k=v:k=v"` | Tham số x264 thô | `keyint=60:min-keyint=60:scenecut=0` |
| `-x265-params` | Tương tự cho x265 | |

#### CRF vs Bitrate — khi nào dùng gì?

```text
CRF (Constant Rate Factor):
  ✅ Chất lượng MỖI frame đồng đều — phù hợp archive, upload
  ❌ Bitrate THAY ĐỔI theo nội dung → không kiểm soát dung lượng chính xác
  Range: libx264 = 0–51 (0 lossless, 18–28 hợp lý, 23 mặc định)
         libx265 = 0–51 (28 mặc định, nên trừ 6–10 so với x264 cùng mức)

CBR / VBR bitrate:
  ✅ Kiểm soát dung lượng / bandwidth chính xác — phù hợp streaming, giới hạn upload
  ❌ Chất lượng không đều (frame phức tạp bị nén nặng)
  VBR 2-pass: encode 2 lần → bitrate chính xác + chất lượng tốt
```

```bash
# CRF — chất lượng cao, file nhỏ (upload ảnh/video cưới)
ffmpeg -i in.mov -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 128k out.mp4

# VBR 2-pass — kiểm soát dung lượng chính xác
ffmpeg -i in.mov -c:v libx264 -b:v 2M -pass 1 -an -f null /dev/null
ffmpeg -i in.mov -c:v libx264 -b:v 2M -pass 2 -c:a aac -b:a 128k out.mp4

# CBR — streaming bitrate cố định
ffmpeg -i in.mov -c:v libx264 -b:v 3M -minrate 3M -maxrate 3M -bufsize 6M out.mp4
```

### 7.3 Hardware acceleration

```bash
# Decode hardware
ffmpeg -hwaccel videotoolbox -i in.mov -c:v h264_videotoolbox out.mp4   # macOS
ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i in.mp4 -c:v h264_nvenc out.mp4  # NVIDIA
ffmpeg -hwaccel qsv -i in.mp4 -c:v h264_qsv out.mp4                     # Intel

# Kiểm tra hỗ trợ
ffmpeg -hwaccels
ffmpeg -encoders | grep -E 'nvenc|qsv|videotoolbox|vaapi'
```

| Backend | Nền tảng | Encode | Decode |
|---|---|---|---|
| `videotoolbox` | macOS | ✅ | ✅ |
| `cuda`/`nvenc`/`nvdec` | NVIDIA | ✅ | ✅ |
| `qsv` | Intel | ✅ | ✅ |
| `vaapi` | Linux (DRM) | ✅ | ✅ |
| `amf` | AMD | ✅ | ✅ |

### 7.4 CRF/tham số khuyến nghị (bảng nhanh)

```text
MỤC ĐÍCH                     VIDEO                    AUDIO
────────────────────────────────────────────────────────────────
Web playback 1080p           libx264 -crf 23          aac -b:a 128k
                             -preset medium -pix_fmt yuv420p
Archive chất lượng cao       libx264 -crf 18          aac -b:a 192k
                             -preset slow
YouTube/Upload               libx264 -crf 18          aac -b:a 192k
                             -preset slow -pix_fmt yuv420p
Giới hạn dung lượng nhỏ       libx264 -crf 28          aac -b:a 96k
                             -preset slow              (hoặc libopus 64k)
10-bit / HDR                 libx265 -crf 20          aac -b:a 192k
                             -pix_fmt yuv420p10le
GIF                          palettegen+paletteuse    (no audio)
Slideshow ảnh cưới           libx264 -crf 20 -r 30    aac/nen
```

---

## 8. Container (muxer/demuxer) & options riêng

### 8.1 Chọn container

```bash
ffmpeg -i in.mov -f mp4 out.mp4        # MP4
ffmpeg -i in.mp4 -f mkv out.mkv        # Matroska (linh hoạt codec)
ffmpeg -i in.mp4 -f webm out.webm      # WebM
ffmpeg -i in.mp4 -f mov out.mov        # QuickTime
ffmpeg -i in.mp4 -f gif out.gif        # GIF
ffmpeg -i in.wav -f mp3 out.mp3        # MP3
ffmpeg -i in.mp4 -f hls out.m3u8       # HLS streaming
ffmpeg -i in.mp4 -f dash out.mpd       # DASH
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4  # Ghép file
```

### 8.2 MP4/MOV — `-movflags`

| Flag | Ý nghĩa |
|---|---|
| `+faststart` | **Di chuyển moov atom lên đầu file** — stream ngay khi tải (BẮT BUỘC cho web) |
| `+use_metadata_tags` | Dùng metadata atom tùy biến |
| `+write_colr` | Ghi color info (nên bật cho HDR) |
| `+write_tmcd` | Ghi timecode track |
| `+separate_moof` | Fragment riêng (DASH/HLS) |
| `+omit_tfhd_offset` | Bỏ offset (fragmented MP4) |
| `frag_keyframe+empty_moov` | Fragmented MP4 (streaming, chống file hỏng khi ghi dở) |
| `default_base_moof` | Base_moof cho fMP4 (DASH) |

```bash
# Web-ready: moov đầu file, stream được ngay
ffmpeg -i in.mov -c:v libx264 -c:a aac -movflags +faststart out.mp4

# Fragmented MP4 (streaming, chống hỏng file)
ffmpeg -i in.mov -c:v libx264 -c:a aac \
  -movflags frag_keyframe+empty_moov+default_base_moof out.mp4
```

### 8.3 Matroska (MKV) — `-matroska` options

```bash
ffmpeg -i in.mp4 -c copy -metadata title="Product demo" -metadata:s:v language=und out.mkv
```

### 8.4 HLS / DASH

```bash
# HLS: tạo playlist + segments
ffmpeg -i in.mp4 \
  -c:v libx264 -c:a aac \
  -f hls -hls_time 6 -hls_playlist_type vod \
  -hls_segment_filename 'seg_%03d.ts' out.m3u8

# DASH
ffmpeg -i in.mp4 \
  -c:v libx264 -c:a aac \
  -f dash -seg_duration 4 \
  -use_timeline 1 -use_template 1 out.mpd
```

| Option HLS | Ý nghĩa |
|---|---|
| `-hls_time <s>` | Độ dài mỗi segment (giây) |
| `-hls_list_size <n>` | Số segment trong playlist live (`0` = VOD, giữ hết) |
| `-hls_playlist_type vod` | Playlist VOD (không xoá segment cũ) |
| `-hls_flags delete_segments` | Xoá segment cũ (live) |
| `-hls_segment_filename <pattern>` | Tên file segment |
| `-hls_segment_type mpegts/fmp4` | Kiểu segment |

---

## 9. Video filters (filtergraph)

**Filtergraph** = chuỗi bộ lọc xử lý frame. Có 2 kiểu:

| Kiểu | Cú pháp | Dùng cho |
|---|---|---|
| Simple filter | `-vf <filter>` (video), `-af <filter>` (audio) | 1 input → 1 output |
| Complex filter | `-filter_complex <graph>` | Nhiều input/output, split, overlay, merge |

### 9.1 Bộ lọc thường dùng

| Filter | Ý nghĩa | Ví dụ |
|---|---|---|
| `scale` | Đổi kích thước | `scale=1280:-2` (giữ tỉ lệ, chẵn) |
| `crop` | Cắt khung | `crop=1280:720:0:0` (W:H:x:y) |
| `pad` | Thêm viền | `pad=1920:1080:(ow-iw)/2:(oh-ih)/2` |
| `fps` | Đổi frame rate | `fps=30` |
| `format` | Đổi pixel format | `format=yuv420p` |
| `transpose` | Xoay 90° | `transpose=1` (CW), `2` (CCW), `3` (180+flip) |
| `hflip`, `vflip` | Lật ngang/dọc | |
| `eq` | Brightness/contrast/saturation | `eq=brightness=0.05:saturation=1.2` |
| `unsharp` | Tăng sắc nét | `unsharp=5:5:0.8:5:5:0.0` |
| `gblur`, `boxblur` | Làm mờ | |
| `drawtext` | Chèn chữ | `drawtext=text='Wedding':fontsize=72:fontcolor=white` |
| `overlay` | Chèn layer lên trên (complex) | |
| `concat` | Ghép nhiều clip (complex) | |
| `thumbnail` | Chọn frame đại diện | |
| `select`, `trim`, `atrim` | Chọn/cắt frame/thời lượng | |
| `setsar`, `setdar` | Đặt SAR/DAR | |
| `colorchannelmixer` | Đổi channel màu | |
| `hqdn3d`, `nlmeans` | Giảm nhiễu | |
| `delogo` | Xoá watermark/logo vùng | |
| `subtitles`, `ass` | Nhúng phụ đề (hardsub) | |
| `palettegen`, `paletteuse` | Tạo GIF chất lượng cao | |
| `minterpolate` | Interpolate frame (slow-mo) | |
| `setpts` | Đặt PTS (đổi tốc độ) | `setpts=2.0*PTS` (slow-mo 2x) |
| `atempo` | Đổi tốc độ audio | `atempo=2.0` (nhanh 2x, max 2.0, dùng chuỗi cho >2) |
| `amix`, `amerge` | Trộn audio | |
| `volume` | Âm lượng | `volume=1.5` |
| `loudnorm` | Chuẩn hoá loudness (EBU R128) | |
| `afade` | Fade in/out audio | `afade=t=in:st=0:d=1` |
| `xfade` | Chuyển cảnh giữa 2 video | `xfade=transition=fade:duration=1:offset=4` |
| `vignette` | Hiệu ứng vignette | |
| `rotate` | Xoay theo độ | `rotate=45*PI/180` |
| `cropdetect` | Tự detect vùng đen | |
| `zscale`, `scale` | Scaling chất lượng cao | |

### 9.2 Scale — thuộc tính chi tiết

```bash
# Giữ tỉ lệ, width 1280 (height tự tính, -2 để chẵn)
ffmpeg -i in.mov -vf scale=1280:-2 -c:v libx264 out.mp4

# Giữ tỉ lệ, height 720
ffmpeg -i in.mov -vf scale=-2:720 -c:v libx264 out.mp4

# Ép chính xác 1920x1080 (kéo méo nếu sai tỉ lệ)
ffmpeg -i in.mov -vf scale=1920:1080 -c:v libx264 out.mp4

# Scale + pad giữ tỉ lệ gốc trong khung 1920x1080 (letterbox)
ffmpeg -i in.mov \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 out.mp4

# Scale nhanh, tốt (lanczos)
ffmpeg -i in.mov -vf "scale=1280:720:flags=lanczos" -c:v libx264 out.mp4

# Giới hạn ≤ 1080p nhưng không upscale (chỉ co nếu to hơn)
ffmpeg -i in.mov -vf "scale='min(1920,iw)':-2:flags=lanczos" -c:v libx264 out.mp4
```

| Tham số `scale` | Ý nghĩa |
|---|---|
| `W:H` | Kích thước mục tiêu (`-1`/`-2` = tự tính, `-2` đảm bảo chẵn) |
| `flags` | Thuật toán: `fast_bilinear`, `bicubic`, `lanczos`, `spline` |
| `force_original_aspect_ratio` | `decrease`/`increase` — giữ tỉ lệ |
| `in_color_matrix`, `out_color_matrix` | Hiệu chỉnh màu |

> **Tại sao `-2` chứ không `-1`?** Nhiều codec (H.264 yuv420p) yêu cầu chiều cao chẵn.
> `-1` có thể ra số lẻ → lỗi `height not divisible by 2`.

### 9.3 Crop — thuộc tính chi tiết

```bash
# Cắt 1280x720 từ góc trên-trái
ffmpeg -i in.mov -vf "crop=1280:720:0:0" out.mp4

# Cắt centred 1:1 (vuông, cho Instagram)
ffmpeg -i in.mov -vf "crop='min(iw,ih)':'min(iw,ih)'" out.mp4

# Cắt 16:9 trung tâm từ 4:3
ffmpeg -i in.mov -vf "crop='min(iw\,ih*16/9)':'min(ih\,iw*9/16)'" out.mp4

# Tự detect và cắt vùng đen (letterbox)
ffmpeg -i in.mov -vf "cropdetect=24:2:0" -f null -   # in ra crop=
ffmpeg -i in.mov -vf "crop=w:h:x:y" out.mp4          # dùng kết quả
```

| Tham số `crop` | Ý nghĩa |
|---|---|
| `W` | Width |
| `H` | Height |
| `x` | Vị trí ngang (mặc định: centred) |
| `y` | Vị trí dọc |
| `keep_aspect` | Giữ tỉ lệ |

### 9.4 Overlay (complex filter)

```bash
# Chèn logo góc phải-dưới với padding 10px
ffmpeg -i video.mp4 -i logo.png \
  -filter_complex "[1:v][0:v]overlay=W-w-10:H-h-10[v]" \
  -map "[v]" -map 0:a -c:v libx264 -c:a copy out.mp4

# Chèn chữ (drawtext)
ffmpeg -i in.mp4 \
  -vf "drawtext=fontfile=/path/font.ttf:text='Cô Dâu & Chú Rể':fontsize=64:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-120" \
  -c:v libx264 out.mp4
```

### 9.5 Concat (ghép nhiều clip)

```bash
# Cách 1: filter_complex — an toàn, tự re-encode khi cần
ffmpeg -i a.mp4 -i b.mp4 -i c.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -c:a aac out.mp4

# Cách 2: concat demuxer — nhanh, CẦN cùng codec/params (dùng -c copy)
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
```

```text
# list.txt
file 'part1.mp4'
file 'part2.mp4'
file 'part3.mp4'
```

### 9.6 XFade (chuyển cảnh)

```bash
# Fade 1 giây giữa 2 clip (clip1 dài 4s, offset = 4 - 1 = 3)
ffmpeg -i a.mp4 -i b.mp4 \
  -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=1:offset=3[v]" \
  -map "[v]" -map 0:a -c:v libx264 -c:a aac out.mp4
```

| Transition | Ý nghĩa |
|---|---|
| `fade` | Mờ dần |
| `wipeleft`, `wiperight`, `wipeup`, `wipedown` | Quét |
| `slideleft`, `slideright`, `slideup`, `slidedown` | Trượt |
| `circlecrop`, `rectcrop` | Cắt tròn/rect |
| `distance`, `fadeblack`, `fadewhite` | Fade đen/trắng |
| `smoothleft`, `smoothright` | Trơn |
| `circleopen`, `circleclose` | Mở/đóng tròn |
| `dissolve` | Hòa tan |
| `pixelize` | Pixelize |
| `hblur` | Mờ ngang |

### 9.7 Thay đổi tốc độ

```bash
# Slow-mo 2x (video PTS x2, audio tempo /2)
ffmpeg -i in.mp4 \
  -filter_complex "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" \
  -map "[v]" -map "[a]" out.mp4

# Tăng tốc 2x
ffmpeg -i in.mp4 \
  -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
  -map "[v]" -map "[a]" out.mp4
```

> `atempo` chỉ nhận 0.5–100 (mặc định 0.5–2.0). Để slowdown > 2x, dùng chuỗi:
> `atempo=0.5,atempo=0.5` (tổng = 0.25).

### 9.8 Tạo GIF chất lượng cao (palette 2-pass)

```bash
# Bước 1: tạo palette
ffmpeg -i in.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,palettegen" palette.png

# Bước 2: dùng palette
ffmpeg -i in.mp4 -i palette.png \
  -filter_complex "fps=15,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  out.gif

# 1-pass (dùng filter split trong)
ffmpeg -i in.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" out.gif
```

| Thuộc palette | Ý nghĩa |
|---|---|
| `max_colors` | Số màu tối đa (256 mặc định) |
| `stats_mode` | `full`(toàn clip), `diff`(giữa frame), `single` |
| `dither` | `bayer`, `floyd_steinberg`, `sierra2_4a`, `none` |
| `new` | Tạo palette mới |

### 9.9 Slideshow ảnh cưới → video

```bash
# Ảnh chuyển 3s/ảnh, kèm nhạc, fade giữa các ảnh, xuất 1080p30
ffmpeg -loop 1 -i img1.jpg -loop 1 -i img2.jpg -loop 1 -i img3.jpg \
  -i song.mp3 \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=1,fade=t=out:st=2:d=1[v0];\
    [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=1,fade=t=out:st=2:d=1[v1];\
    [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=1,fade=t=out:st=2:d=1[v2];\
    [v0][v1]xfade=transition=fade:duration=1:offset=2[x1];\
    [x1][v2]xfade=transition=fade:duration=1:offset=4[v]" \
  -map "[v]" -map 3:a -shortest \
  -c:v libx264 -crf 20 -preset slow -r 30 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart \
  slideshow.mp4
```

**Công thức tính offset xfade:**
```text
offset_n = (thời lượng mỗi ảnh × n) - (duration × n)
Ví dụ 3 ảnh × 3s, fade 1s:
  xfade_1: offset = 3 - 1 = 2
  xfade_2: offset = (3×2) - 1 = 5   (hoặc công thức chính xác hơn:
             offset_{n} = offset_{n-1} + thời lượng_ảnh - duration)
```

---

## 10. Audio filters

| Filter | Ý nghĩa | Ví dụ |
|---|---|---|
| `volume` | Âm lượng | `volume=2.0`, `volume=-6dB` |
| `loudnorm` | Chuẩn hoá loudness EBU R128 | `loudnorm=I=-16:TP=-1.5:LRA=11` |
| `alimiter` | Giới hạn peak | |
| `aresample` | Đổi sample rate | `aresample=48000` |
| `aformat` | Đổi format audio | `aformat=sample_fmts=fltp:channel_layouts=stereo` |
| `adelay` | Trễ audio | `adelay=1000` (ms) |
| `atempo` | Đổi tốc độ | `atempo=1.5` |
| `afade` | Fade in/out | `afade=t=in:st=0:d=2,afade=t=out:st=8:d=2` |
| `pan` | Đổi layout kênh | `pan=stereo\|c0=c0\|c1=c0` |
| `amix` | Trộn nhiều audio | `amix=inputs=2:duration=first` |
| `anullsrc` | Tạo audio im lặng | `anullsrc=r=48000:cl=stereo` |
| `highpass`, `lowpass` | Lọc tần số | |
| `aphaser`, `aecho` | Hiệu ứng | |
| `silencedetect` | Phát hiện khoảng im | |
| `astats` | Thống kê audio | |

```bash
# Chuẩn hoá loudness (chuẩn phát sóng/web)
ffmpeg -i in.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v copy out.mp4

# Tách mono → stereo
ffmpeg -i in.mp4 -af "pan=stereo|c0=c0|c1=c0" -c:v copy out.mp4

# Thêm audio im lặng (khi video thiếu audio stream)
ffmpeg -i video.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo \
  -shortest -map 0:v -map 1:a -c:v copy -c:a aac out.mp4
```

---

## 11. Lệnh thường dùng — cheat sheet

### 11.1 Xem thông tin file (ffprobe)

```bash
# Thông tin tổng quan
ffprobe -v error -show_format -show_streams input.mp4

# JSON (dễ parse bằng code)
ffprobe -v error -print_format json -show_format -show_streams input.mp4

# Chỉ duration
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1 input.mp4

# Chỉ resolution
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 input.mp4

# Liệt kê mọi stream dạng bảng
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,bit_rate,duration -of table input.mp4
```

**Parse JSON trong Node/TypeScript:**

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

export async function probe(filePath: string) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-print_format", "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);
  const data = JSON.parse(stdout);
  const video = data.streams.find((s: any) => s.codec_type === "video");
  const audio = data.streams.find((s: any) => s.codec_type === "audio");
  return {
    durationSec: Number(data.format?.duration ?? 0),
    sizeBytes: Number(data.format?.size ?? 0),
    bitRate: Number(data.format?.bit_rate ?? 0),
    width: video?.width,
    height: video?.height,
    fps: evalFps(video?.avg_frame_rate ?? video?.r_frame_rate),
    videoCodec: video?.codec_name,
    audioCodec: audio?.codec_name,
    hasAudio: !!audio,
  };
}

function evalFps(rate?: string): number {
  if (!rate) return 0;
  const [n, d] = rate.split("/").map(Number);
  return d ? n / d : n;
}
```

### 11.2 Convert / transcode

```bash
# MOV → MP4 (chuẩn web)
ffmpeg -i input.mov -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4

# MKV → MP4 (copy stream, không re-encode — nhanh)
ffmpeg -i input.mkv -c copy -movflags +faststart output.mp4

# WebM → MP4
ffmpeg -i input.webm -c:v libx264 -crf 23 -c:a aac output.mp4

# MP4 → WebM
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 33 -b:v 0 -c:a libopus -b:a 128k output.webm

# AVI → MP4
ffmpeg -i input.avi -c:v libx264 -crf 23 -c:a aac output.mp4
```

### 11.3 Cắt / trim

```bash
# Cắt 30s từ phút thứ 1 (seek nhanh, trước -i)
ffmpeg -ss 00:01:00 -i input.mp4 -t 30 -c copy output.mp4

# Cắt chính xác từng frame (sau -i)
ffmpeg -i input.mp4 -ss 00:01:00 -to 00:01:30 -c:v libx264 -c:a aac output.mp4

# Cắt theo thời lượng
ffmpeg -i input.mp4 -t 00:00:30 -c copy output.mp4
```

### 11.4 Tách stream

```bash
# Tách audio
ffmpeg -i input.mp4 -vn -c:a copy audio.m4a

# Tách video (bỏ audio)
ffmpeg -i input.mp4 -an -c:v copy video.mp4

# Tách frame ảnh
ffmpeg -i input.mp4 -vf "fps=1" frame_%04d.png
```

### 11.5 Ảnh / thumbnail

```bash
# 1 thumbnail tại giây 5
ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 -q:v 2 thumb.jpg

# Thumbnail quality cao (webp)
ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 -c:v libwebp -quality 90 thumb.webp

# Thumbnail đại diện (tự chọn frame "đẹp")
ffmpeg -i input.mp4 -vf "thumbnail=300,scale=640:-2" -frames:v 1 thumb.jpg

# Resize ảnh
ffmpeg -i photo.jpg -vf "scale=1920:1080:force_original_aspect_ratio=decrease" resized.jpg

# Ảnh → PDF
ffmpeg -i image%d.png -c:v png out.pdf

# WebP có độ trong suốt
ffmpeg -i input.png -c:v libwebp -lossless 1 -quality 80 out.webp
```

### 11.6 Watermark / overlay

```bash
# Overlay logo (phải dùng -map để chỉ định stream video từ filter)
ffmpeg -i video.mp4 -i logo.png \
  -filter_complex "overlay=W-w-20:H-h-20" \
  -map 0:v -map 0:a -c:v libx264 -c:a copy out.mp4

# Chèn watermark chữ mờ (opacity)
ffmpeg -i in.mp4 \
  -vf "drawtext=text='Wedding 2026':fontsize=48:fontcolor=white@0.5:x=20:y=20" \
  -c:v libx264 out.mp4
```

### 11.7 Ghép file

```bash
# Ghép video (cùng codec) — concat demuxer
printf "file 'a.mp4'\nfile 'b.mp4'\nfile 'c.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4

# Ghép nhanh (binary append — chỉ mp4 có moov cuối)
cat a.mp4 b.mp4 > out.mp4   # ⚠️ không phải ffmpeg, chỉ dùng khi chắc chắn
```

### 11.8 Âm thanh

```bash
# Đổi âm lượng
ffmpeg -i in.mp4 -filter:a "volume=2.0" -c:v copy out.mp4

# Im lặng 1 đoạn (st=start, d=duration)
ffmpeg -i in.mp4 -af "volume='if(lt(t,5)+gt(t,10),1,0)':eval=frame" -c:v copy out.mp4

# Fade audio
ffmpeg -i in.mp4 -af "afade=t=in:st=0:d=2,afade=t=out:st=8:d=2" -c:v copy out.mp4
```

### 11.9 Screen recording (demo/thu)

```bash
# macOS
ffmpeg -f avfoundation -framerate 30 -i "1:0" -c:v libx264 -preset ultrafast out.mp4

# Linux (X11)
ffmpeg -f x11grab -framerate 30 -i :0.0 -c:v libx264 -preset ultrafast out.mp4
```

### 11.10 Rotation / metadata

```bash
# Xoay video 90° CW (transpose)
ffmpeg -i in.mp4 -vf "transpose=1" -c:v libx264 -c:a copy out.mp4

# Xoay bằng metadata (player tôn trọng, không re-encode)
ffmpeg -i in.mp4 -c copy -metadata:s:v:0 rotate=90 out.mp4

# Xoá metadata (rất riêng tư — EXIF GPS!)
ffmpeg -i in.mp4 -map_metadata -1 -c copy clean.mp4
```

### 11.11 Snapshot / frames

```bash
# 1 frame mỗi giây thành PNG
ffmpeg -i in.mp4 -vf fps=1 img_%04d.png

# 1 frame mỗi 10 giây
ffmpeg -i in.mp4 -vf fps=1/10 img_%04d.png

# Lấy đúng 1 frame tại timestamp
ffmpeg -ss 00:00:10 -i in.mp4 -frames:v 1 frame.png
```

---

## 12. Ứng dụng thực tế cho wedding-server

### 12.1 Chuẩn hoá video khách gửi lên (khách gửi từ iPhone/Android/PC)

Khách gửi video từ nhiều nguồn: iPhone (HEVC/MOV), Android (H.264/MP4 hoặc HEVC), PC
(MKV/AVI). Server cần chuẩn hoá về 1 định dạng web-playback.

```bash
# Chuẩn hoá mọi video → MP4 H.264 1080p30, AAC, faststart
ffmpeg -hide_banner -nostdin -y -v error \
  -i "$INPUT" \
  -vf "scale='min(1920,iw)':-2:flags=lanczos,format=yuv420p,fps=30" \
  -c:v libx264 -preset medium -crf 23 -profile:v high -level 4.1 \
  -c:a aac -b:a 160k -ac 2 -ar 44100 \
  -movflags +faststart \
  "$OUTPUT"
```

**Giải thích từng thuộc tính:**

| Thuộc tính | Vì sao dùng |
|---|---|
| `-hide_banner` | Log gọn cho server |
| `-nostdin` | Không treo khi chạy dưới process/service |
| `-y` | Ghi đè không hỏi (output tên random UUID) |
| `-v error` | Chỉ in lỗi — giảm log rác |
| `scale='min(1920,iw)':-2` | Không upscale, chỉ co nếu >1080p, chiều cao chẵn |
| `flags=lanczos` | Scaling chất lượng cao |
| `format=yuv420p` | Bắt buộc cho compatibility web (Chrome/Safari) |
| `fps=30` | Chuẩn hoá frame rate (video 24fps/60fps → 30fps thống nhất) |
| `libx264` | H.264 — codec phổ biến nhất, mọi trình duyệt hỗ trợ |
| `-preset medium` | Cân bằng tốc độ/size (server: medium hoặc faster) |
| `-crf 23` | Chất lượng mặc định hợp lý |
| `-profile:v high -level 4.1` | Tương thích rộng |
| `aac -b:a 160k -ac 2 -ar 44100` | Audio stereo 44.1kHz chuẩn |
| `+faststart` | moov đầu file → stream ngay, không cần tải hết |

### 12.2 Tạo thumbnail cho video

```bash
# Thumbnail 640px tại giây 3 (hoặc 10% duration)
ffmpeg -hide_banner -nostdin -y -v error \
  -ss 3 -i "$INPUT" \
  -vf "scale=640:-2" \
  -frames:v 1 -q:v 3 \
  "$OUTPUT.jpg"

# Thumbnail webp nhẹ hơn (giảm 30–50% dung lượng)
ffmpeg -hide_banner -nostdin -y -v error \
  -ss 3 -i "$INPUT" \
  -vf "scale=640:-2" \
  -frames:v 1 -c:v libwebp -quality 80 \
  "$OUTPUT.webp"
```

### 12.3 Ảnh cưới → slideshow video (cho landing page)

```bash
# 30 ảnh, 4s/ảnh, fade 0.8s, nhạc nền, xuất 1080p
ffmpeg -hide_banner -nostdin -y -v error \
  $(for f in photos/*.jpg; do echo -n "-loop 1 -t 4 -i $f "; done) \
  -i music.mp3 \
  -filter_complex "\
    $(for i in $(seq 0 $((N-1))); do
        echo -n "[$i:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=0.8,fade=t=out:st=3.2:d=0.8[v$i];"
      done) \
    $(build_xfade_chain) \
    [last]format=yuv420p[v]" \
  -map "[v]" -map $N:a -shortest \
  -c:v libx264 -crf 20 -preset medium -r 30 \
  -c:a aac -b:a 192k -movflags +faststart \
  slideshow.mp4
```

**Code Node/TypeScript điều phối slideshow:**

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
const execFileAsync = promisify(execFile);

interface SlideshowOptions {
  images: string[];          // danh sách file ảnh
  music?: string;            // file nhạc nền (optional)
  secondsPerImage?: number;  // thời lượng mỗi ảnh (default 4)
  fadeDuration?: number;     // thời gian fade (default 0.8)
  width?: number;            // default 1920
  height?: number;           // default 1080
  fps?: number;              // default 30
  crf?: number;              // default 20
  outputPath: string;
}

export async function createSlideshow(opts: SlideshowOptions) {
  const {
    images, music, secondsPerImage = 4, fadeDuration = 0.8,
    width = 1920, height = 1080, fps = 30, crf = 20, outputPath,
  } = opts;

  const n = images.length;
  if (n === 0) throw new Error("Cần ít nhất 1 ảnh");

  // 1) Xây dựng input args
  const inputArgs: string[] = [];
  for (const img of images) {
    inputArgs.push("-loop", "1", "-t", String(secondsPerImage), "-i", img);
  }
  let audioInputIndex = n;
  if (music) {
    inputArgs.push("-i", music);
  } else {
    inputArgs.push("-f", "lavfi", "-t", String(n * secondsPerImage),
                   "-i", "anullsrc=r=48000:cl=stereo");
  }

  // 2) Xây dựng filter_complex
  const scaleFilter =
    `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,` +
    `fade=t=in:st=0:d=${fadeDuration},` +
    `fade=t=out:st=${secondsPerImage - fadeDuration}:d=${fadeDuration}`;

  const segments: string[] = [];
  for (let i = 0; i < n; i++) {
    segments.push(`[${i}:v]${scaleFilter}[v${i}]`);
  }

  // 3) Xây dựng xfade chain
  const totalPerClip = secondsPerImage - fadeDuration;
  let currentLabel = "v0";
  for (let i = 1; i < n; i++) {
    const offset = i * totalPerClip;
    const nextLabel = i === n - 1 ? "vout" : `vx${i}`;
    segments.push(
      `[${currentLabel}][v${i}]xfade=transition=fade:duration=${fadeDuration}:offset=${offset}[${nextLabel}]`
    );
    currentLabel = nextLabel;
  }
  segments.push(`[${currentLabel}]format=yuv420p[vfinal]`);

  const filterComplex = segments.join(";");

  // 4) Gộp args & chạy
  const args = [
    "-hide_banner", "-nostdin", "-y", "-v", "error",
    ...inputArgs,
    "-filter_complex", filterComplex,
    "-map", "[vfinal]",
    "-map", `${audioInputIndex}:a`,
    "-shortest",
    "-c:v", "libx264", "-preset", "medium",
    "-crf", String(crf), "-r", String(fps), "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    outputPath,
  ];

  await execFileAsync("ffmpeg", args, { timeout: 10 * 60 * 1000 });
  return outputPath;
}
```

### 12.4 An toàn khi gọi FFmpeg từ server (command injection)

> **CỰC KỲ QUAN TRỌNG:** FFmpeg nhận **filter strings** có thể thực thi file đọc/ghi
> tùy ý qua `movie=`, `subtitles=`, `drawtext=fontfile=`, `amovie=`... Nếu user-controlled
> input lọt vào filter → **RCE / path traversal**.

```ts
// ❌ NGUY HIỂM — filename/filter do user điều khiển
exec(`ffmpeg -i ${userFilename} -vf "drawtext=text='${userText}'" out.mp4`);
// attacker: userText = "x':fontfile='/etc/passwd:x=0:y=0"
//           userFilename = "-i /etc/passwd -f lavfi -i anullsrc -y /app/out.mp4"

// ✅ AN TOÀN — execFile, KHÔNG qua shell, validate input
import { execFile } from "node:child_process";
import path from "node:path";
import crypto from "node:crypto";

const SAFE_EXT = new Set([".mp4", ".mov", ".mkv", ".webm", ".jpg", ".png", ".mp3", ".aac"]);
const UPLOAD_DIR = "/var/uploads";
const OUTPUT_DIR = "/var/processed";

export async function transcode(userUploadId: string) {
  // 1) KHÔNG tin filename — dùng UUID nội bộ
  const inPath = path.join(UPLOAD_DIR, `${userUploadId}.bin`);
  const outPath = path.join(OUTPUT_DIR, `${crypto.randomUUID()}.mp4`);

  // 2) Verify magic bytes / ffprobe TRƯỚC khi transcode (chống file giả)
  const info = await probe(inPath);
  if (!info.durationSec || info.durationSec > 3600) {
    throw new Error("File không hợp lệ hoặc quá dài");
  }

  // 3) execFile — mảng args, KHÔNG shell → không injection được
  await execFile("ffmpeg", [
    "-hide_banner", "-nostdin", "-y", "-v", "error",
    "-i", inPath,
    "-t", "3600",                          // giới hạn cứng thời lượng output
    "-vf", "scale='min(1920,iw)':-2:flags=lanczos,format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "23",
    "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart",
    "-max_muxing_queue_size", "1024",
    outPath,
  ], {
    timeout: 5 * 60 * 1000,               // timeout cứng
    maxBuffer: 1024 * 1024,               // giới hạn stdout/stderr
  });

  return outPath;
}
```

**Checklist an toàn FFmpeg trên server:**

```markdown
- [ ] Luôn dùng execFile/spawn với mảng args — KHÔNG exec(string) qua shell
- [ ] Không nhúng user input vào filter string (-vf/-filter_complex)
- [ ] Nếu bắt buộc: whitelist ký tự, escape `'\`:\[];,` (ký tự filtergraph)
- [ ] Đổi tên file theo UUID nội bộ — không dùng filename gốc
- [ ] Giới hạn: -t (thời lượng), -fs (dung lượng), timeout process
- [ ] Giới hạn thread: -threads 2 (tránh hog CPU server)
- [ ] Giới hạn bộ nhớ: -max_alloc
- [ ] Verify bằng ffprobe trước khi transcode (chống decompression bomb)
- [ ] Chạy dưới user không quyền ghi ngoài thư mục output (chroot/container)
- [ ] Dùng -nostdin (không treo), -v error (không log rác)
- [ ] Rate-limit endpoint upload/transcode (chống DoS CPU)
- [ ] Chạy trong container có memory/CPU limit (cgroup)
```

### 12.5 Xử lý video HEVC/ProRes từ iPhone → web

```bash
# iPhone HEVC MOV → H.264 MP4 web
ffmpeg -hide_banner -nostdin -y -v error \
  -i IMG_1234.mov \
  -vf "scale='min(1920,iw)':-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 160k \
  -movflags +faststart \
  output.mp4

# Hoặc hardware (macOS server — nhanh hơn nhiều)
ffmpeg -hide_banner -nostdin -y -v error \
  -i IMG_1234.mov \
  -c:v h264_videotoolbox -b:v 5M \
  -c:a aac -b:a 160k \
  -movflags +faststart \
  output.mp4
```

### 12.6 Loop video nền cho landing page (nhẹ)

```bash
# WebM VP9 + Opus — nhẹ, loop mượt, alpha nếu cần
ffmpeg -i input.mp4 \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  -c:a libopus -b:a 96k \
  -an \                                # bỏ audio nếu chỉ nền
  output.webm

# MP4 H.264 loop-friendly (không cần audio)
ffmpeg -i input.mp4 -an \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
  -movflags +faststart \
  output.mp4
```

### 12.7 Tạo sprite/thumbnail sheet (cho scrubber video)

```bash
# Sprite 10x10 ảnh nhỏ 160x90 (dùng cho video player seek preview)
ffmpeg -i input.mp4 \
  -vf "fps=1/5,scale=160:90,tile=10x10" \
  -frames:v 1 -q:v 3 sprite.jpg
```

---

## 13. Gỡ lỗi & mẹo hiệu năng

### 13.1 Debug

```bash
# Xem log verbose
ffmpeg -v verbose -i in.mp4 -c:v libx264 out.mp4

# In thông tin stream được detect
ffmpeg -v info -i in.mp4 -f null -

# Kiểm tra file output
ffprobe -v error -show_format -show_streams out.mp4

# Test nhanh không ghi file
ffmpeg -v error -i in.mp4 -f null -

# Benchmark
ffmpeg -benchmark -i in.mp4 -c:v libx264 -f null -
```

### 13.2 Lỗi thường gặp

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `height not divisible by 2` | Scale ra chiều lẻ | Dùng `-2` thay `-1` trong scale |
| `Unknown encoder 'libx264'` | Build thiếu libx264 | Cài FFmpeg có `--enable-libx264`, hoặc dùng `h264_videotoolbox` |
| `moov atom not found` | File MP4 chưa hoàn chỉnh (upload dở) | Transcode lại, hoặc dùng `-movflags frag_keyframe+empty_moov` khi ghi |
| `Output file is empty` | Filter/map sai → không stream nào | Kiểm tra `-map`, filter_complex labels |
| `Stream map '0:v' matches no streams` | Input không có stream type đó | Dùng ffprobe kiểm tra, hoặc bỏ `-map` |
| `Cannot find a matching stream` | `-shortest` + input không có audio | Thêm `anullsrc` hoặc bỏ `-shortest` |
| `Conversion failed` (chung) | Xem log `-v error` dòng cuối | Thường do filter syntax |
| Filter syntax error | Thiếu escape `:` `,` `[` `]` | Trong filter dùng `\:` escape hoặc `''` quoting |

### 13.3 Hiệu năng

```bash
# Hardware decode + encode (nhanh nhất)
ffmpeg -hwaccel videotoolbox -i in.mov -c:v h264_videotoolbox out.mp4

# Tăng threads
ffmpeg -threads 0 -i in.mov -c:v libx264 out.mp4   # 0 = tự detect all cores

# Filter nhẹ (bilinear thay lanczos nếu không cần chất lượng)
ffmpeg -vf "scale=1280:720:flags=bilinear" ...

# Chỉ remux (không re-encode) — gần như tức thì
ffmpeg -i in.mkv -c copy -movflags +faststart out.mp4
```

| Chiến lược | Tăng tốc |
|---|---|
| `-c copy` (remux) | ∞ (không encode) |
| Hardware encode | 5–20x |
| `-preset ultrafast` thay `slow` | 3–5x |
| Bỏ filter không cần thiết | 1.5–3x |
| `-threads` đúng số core | 1.2–2x |
| SSD cho I/O | Đáng kể với file lớn |

---

## 14. Anti-patterns

```bash
# ❌ 1. Không giới hạn thời lượng/dung lượng → DoS
ffmpeg -i user_upload.mp4 out.mp4
# ✅
ffmpeg -t 3600 -fs 2147483648 -i user_upload.mp4 out.mp4

# ❌ 2. Dùng shell với filename user-controlled → injection
exec(`ffmpeg -i ${filename} out.mp4`)
# ✅
execFile("ffmpeg", ["-i", safePath, outPath])

# ❌ 3. Nhúng user text vào drawtext/filter → RCE/path traversal
`-vf drawtext=text='${userText}'`
# ✅ Không nhúng; hoặc whitelist [a-zA-Z0-9 ] và escape filter metacharacters

# ❌ 4. Bỏ -nostdin → process treo vô hạn dưới service
# ✅ Luôn có -nostdin

# ❌ 5. Ghi đè file output không kiểm tra → race condition
# ✅ Output UUID ngẫu nhiên, -y (vì tên đã unique)

# ❌ 6. Không có timeout → ffmpeg treo làm đầy CPU/RAM
# ✅ execFile(..., { timeout: 5*60*1000 }) + kill process group

# ❌ 7. Scale về width lẻ → codec lỗi
# ✅ scale=-2:... (luôn chẵn)

# ❌ 8. Re-encode mọi thứ → lãng phí CPU
# ✅ Nếu chỉ đổi container: -c copy. Chỉ re-encode khi cần đổi codec/resize/filter

# ❌ 9. Bỏ qua pixel format → video xanh/nhiễm màu trên web
# ✅ Thêm format=yuv420p cho mọi output web

# ❌ 10. Upload file lên FFmpeg với extension tùy ý → path traversal qua -i
# ✅ UUID filename + verify magic bytes/ffprobe
```

---

## 15. Tài liệu tham khảo

- **Tài liệu chính thức:** https://ffmpeg.org/ffmpeg.html
- **FFmpeg Wiki (Filter Guide):** https://trac.ffmpeg.org/wiki/FilteringGuide
- **MP4 faststart:** https://trac.ffmpeg.org/wiki/How%20to%20start%20streaming%20when%20moov%20atom%20is%20at%20the%20end
- **CRF guideline:** https://trac.ffmpeg.org/wiki/Encode/H.264
- **HLS:** https://ffmpeg.org/ffmpeg-formats.html#hls-1
- **loudnorm:** https://ffmpeg.org/ffmpeg-filters.html#loudnorm
- **Security (GHSA / filter injection):** Luôn giả định filter string & filename là untrusted
- **ffprobe JSON:** https://ffmpeg.org/ffprobe.html

---

> **Tóm tắt nhanh cho wedding-server:**
> 1. **Transcode chuẩn hoá:** `libx264 -crf 23 -preset medium` + `aac -b:a 160k` + `format=yuv420p` + `+faststart`.
> 2. **Thumbnail:** `-ss 3 -frames:v 1 -vf scale=640:-2 -q:v 3 thumb.jpg` (hoặc libwebp).
> 3. **Slideshow:** `-loop 1 -t N -i img` × nhiều + `xfade` + nhạc `-shortest`.
> 4. **An toàn server:** `execFile` mảng args, `-nostdin -y -v error`, giới hạn `-t`/`-fs`/timeout/threads, không nhúng user input vào filter.
> 5. **Khi chỉ đổi container:** `-c copy` — không re-encode.
