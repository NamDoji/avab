# AvaB Publishing Standard v1.0

> **Tài liệu quy định xuất bản học liệu cho toàn hệ thống AvaB Education**
> **Document ID:** AvaB-STD-PUB-001
> **Version:** 1.0.0
> **Status:** ✅ ACTIVE
> **Effective Date:** 2026-07-04
> **Owner:** AvaB Content & Engineering Team
> **Last Updated:** 2026-07-04

---

## Table of Contents

| # | Section | Page |
|---|---------|------|
| 1 | Publishing Philosophy & Scope | §1 |
| 2 | Document Publishing Standards | §2 |
| 3 | Presentation / Slide Standard | §3 |
| 4 | Video Standard | §4 |
| 5 | LMS / Web Publishing Standard | §5 |
| 6 | SCORM / xAPI Standard | §6 |
| 7 | File Naming & Organization Standard | §7 |
| 8 | Version Control & Update Policy | §8 |
| 9 | Multi-language Support | §9 |
| 10 | Publishing Workflow & Approval Gates | §10 |
| 11 | JSON Schema — Publishing Package | §11 |
| 12 | Database Design | §12 |
| 13 | Admin UI — Publishing Dashboard | §13 |
| 14 | QA Checklist (30+ items) | §14 |
| A | Phụ lục A: Template Downloads | §A |
| B | Phụ lục B: Brand Assets | §B |
| C | Phụ lục C: Approved Third-party Tools | §C |

---

## Terminology & Requirement Levels

| Keyword | Meaning |
|---------|---------|
| **MUST** | Bắt buộc — vi phạm = không được publish |
| **MUST NOT** | Nghiêm cấm tuyệt đối |
| **SHOULD** | Khuyến nghị mạnh — cần lý do rõ ràng nếu không tuân thủ |
| **SHOULD NOT** | Khuyến nghị không làm — nếu có phải ghi rõ lý do |
| **MAY** | Tùy chọn — cho phép nhưng không yêu cầu |

---

---

# §1 — Publishing Philosophy & Scope

## 1.1 Core Philosophy

> **"One content, many formats — Write once, publish everywhere."**

Mọi học liệu AvaB được thiết kế theo nguyên tắc **platform-agnostic**: nội dung gốc là nguồn chân lý duy nhất (single source of truth), sau đó được chuyển đổi và phân phối sang nhiều định dạng phù hợp với từng ngữ cảnh sử dụng.

```
                    ┌────────────────────┐
                    │   Content Source   │
                    │  (Structured Data) │
                    └────────┬───────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐    ┌──────▼──────┐
    │  Web/LMS  │     │  PDF/DOCX   │    │    Video    │
    │ avab.vn   │     │  Printable  │    │  MP4/Stream │
    └───────────┘     └─────────────┘    └─────────────┘
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐    ┌──────▼──────┐
    │  Mobile   │     │   SCORM/    │    │  Worksheet  │
    │    App    │     │    xAPI     │    │    Print    │
    └───────────┘     └─────────────┘    └─────────────┘
```

## 1.2 Publishing Platforms

| Platform | Endpoint | Primary Audience | Format |
|----------|----------|------------------|--------|
| **Web LMS** | avab.vn | Students, Teachers | HTML5/CSS3 |
| **Mobile App** | iOS & Android | Students (ages 5+) | React Native |
| **PDF** | Download / Print | Teachers, Parents | PDF/UA |
| **Word/DOCX** | Editable docs | Teachers (customization) | OOXML |
| **Slide/PPTX** | Classroom projection | Teachers | PPTX / Google Slides |
| **Video** | Streaming / Download | Students, Parents | MP4 H.264 |
| **Worksheet** | Print-ready | Students (classwork) | PDF A4 |
| **SCORM/xAPI** | Partner LMS | B2B Partners | SCORM 2004 |

## 1.3 Content Types

| Type | Mã | Mô tả | Audience |
|------|----|-------|----------|
| **Lesson** | `lesson` | Bài học chính — lý thuyết + ví dụ | Student |
| **Theory** | `theory` | Lý thuyết chuyên sâu, tra cứu | Student/Teacher |
| **Exercise** | `exercise` | Bài tập có hướng dẫn trong lớp | Student |
| **Homework** | `homework` | Bài tập về nhà tự luyện | Student |
| **Assessment** | `assessment` | Kiểm tra/đánh giá học sinh | Teacher/Admin |
| **Teacher Guide** | `teacher-guide` | Hướng dẫn giáo viên | Teacher |
| **Parent Report** | `parent-report` | Báo cáo kết quả gửi phụ huynh | Parent |
| **Certificate** | `certificate` | Chứng chỉ hoàn thành | Student/Parent |

## 1.4 Scope Statement

Tiêu chuẩn này **áp dụng cho**:
- Tất cả nội dung được xuất bản trên hệ thống AvaB
- Nội dung từ đội ngũ nội bộ và đối tác bên thứ ba
- Cả nội dung mới và nội dung nâng cấp từ version cũ

Tiêu chuẩn này **không áp dụng cho**:
- Nội dung thử nghiệm chưa có content_id chính thức (sandbox only)
- Nháp nội bộ (drafts) chưa qua Human Review

---

---

# §2 — Document Publishing Standards

## 2.1 Word / DOCX Standard

### 2.1.1 Template Specification

**MUST** sử dụng AvaB Official Template (`AvaB-Template-v1.0.dotx`) cho mọi tài liệu Word.

| Element | Specification | MUST / SHOULD |
|---------|--------------|---------------|
| Page size | A4 (210 × 297mm) | MUST |
| Orientation | Portrait (mặc định), Landscape chỉ khi bảng biểu rộng | SHOULD |
| Margins — Top | 2.5cm | MUST |
| Margins — Bottom | 2.5cm | MUST |
| Margins — Left | 2.5cm | MUST |
| Margins — Right | 2.5cm | MUST |
| Gutter | 0 (không binding offset) | MUST |

### 2.1.2 Typography

| Style | Font Family | Size | Weight | Color |
|-------|------------|------|--------|-------|
| Body Text | Be Vietnam Pro | 13pt | Regular | #1F1F1F |
| Heading 1 | Be Vietnam Pro | 16pt | Bold | #7C3AED |
| Heading 2 | Be Vietnam Pro | 14pt | SemiBold | #5B21B6 |
| Heading 3 | Be Vietnam Pro | 12pt | SemiBold | #14B8A6 |
| Caption | Be Vietnam Pro | 10pt | Italic | #6B7280 |
| Math / Code | JetBrains Mono | 12pt | Regular | #111827 |
| Table Header | Be Vietnam Pro | 12pt | Bold | #FFFFFF |

> **MUST NOT** dùng font chưa được phê duyệt trong danh sách trên.
> **SHOULD** embed font trong file DOCX khi xuất bản.

### 2.1.3 Color Palette

| Color Name | Hex | RGB | Usage |
|-----------|-----|-----|-------|
| AvaB Purple | `#7C3AED` | 124, 58, 237 | Heading 1, Key accents |
| AvaB Purple Dark | `#5B21B6` | 91, 33, 182 | Heading 2, Borders |
| AvaB Teal | `#14B8A6` | 20, 184, 166 | Heading 3, Highlights |
| AvaB Yellow | `#F59E0B` | 245, 158, 11 | Warnings, Callouts |
| Success Green | `#10B981` | 16, 185, 129 | Correct answers |
| Error Red | `#EF4444` | 239, 68, 68 | Wrong answers, Alerts |
| Text Primary | `#1F1F1F` | 31, 31, 31 | Body text |
| Text Secondary | `#6B7280` | 107, 114, 128 | Captions, Notes |
| Background | `#FFFFFF` | 255, 255, 255 | Page background |
| Surface | `#F9FAFB` | 249, 250, 251 | Callout backgrounds |

### 2.1.4 Page Numbering & Header/Footer

**Header (MUST):**
```
[Left: AvaB Logo small]    [Center: Course Name — Topic Name]    [Right: AvaB Purple line]
```

**Footer (MUST):**
```
[Left: AvaB Education © 2026]    [Center: ---]    [Right: Page X of Y]
```

**MUST NOT** để trang đầu tiên (cover page) có header/footer.
**SHOULD** dùng "Different first page" option trong Word.

### 2.1.5 Watermark Rules

| Document Type | Watermark | Visibility |
|--------------|-----------|-----------|
| Draft | "DRAFT — CHƯA PHÁT HÀNH" | 45°, 30% opacity, AvaB Purple |
| Internal Only | "NỘI BỘ — KHÔNG PHÂN PHỐI" | 45°, 30% opacity, Red |
| Teacher Guide | "DÀNH CHO GIÁO VIÊN" | 45°, 20% opacity, Teal |
| Student Copy | Không có watermark | — |
| Assessment | "BÀI KIỂM TRA — BẢO MẬT" | 45°, 25% opacity, Purple |

### 2.1.6 Export to PDF Process

```
DOCX Review Complete
    ↓
Check all fonts embedded
    ↓
Check all images ≥150dpi
    ↓
Export via: File → Save As → PDF
  [Options: ISO 19005-1 (PDF/A), Optimize for: Standard]
    ↓
Open PDF → Verify page count matches
    ↓
Run accessibility check (PDF/UA)
    ↓
Set security (see §2.2)
    ↓
Upload to publishing pipeline
```

---

## 2.2 PDF Standard

### 2.2.1 Security Settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| Open password | None | Student access tự do |
| Permissions password | Set (internal) | Prevent unauthorized modification |
| Printing | **Allowed** (High Quality) | Học sinh/giáo viên có thể in |
| Editing | **Disabled** | Bảo vệ nội dung gốc |
| Copying text | Allowed (read-only) | Hỗ trợ screen reader |
| Form filling | Allowed cho Assessment | Worksheets interactive |
| Commenting | Allowed cho Teacher Guide | Giáo viên có thể ghi chú |
| Encryption | AES-128 minimum | SHOULD AES-256 |

### 2.2.2 PDF/UA Compliance (Accessibility)

**MUST** tuân thủ PDF/UA (ISO 14289-1) cho mọi tài liệu phát hành:

- [ ] Tất cả hình ảnh có Alt text
- [ ] Cấu trúc heading được tag đúng (H1, H2, H3)
- [ ] Bảng biểu có header cells được mark
- [ ] Reading order logic (không bị reflow lỗi)
- [ ] Document title được set trong metadata
- [ ] Language được chỉ định (vi-VN hoặc en-US)
- [ ] Không có "artifact" content chưa được tagged

### 2.2.3 Compression & Quality

| Asset Type | Compression | Max Size | DPI |
|-----------|-------------|----------|-----|
| Images (general) | JPEG 85% | 200KB/image | 150dpi screen |
| Images (print) | JPEG 95% | 500KB/image | 300dpi |
| Charts / Diagrams | PNG lossless | 300KB | 150dpi+ |
| Text | No compression (lossless) | — | Vector |
| Total PDF | — | 10MB max | — |

**MUST NOT** dùng lossy compression cho text, math formulas, hoặc code snippets.

### 2.2.4 PDF Metadata

**MUST** set đầy đủ metadata trước khi publish:

```
Title:    [Tên bài học đầy đủ tiếng Việt]
Author:   AvaB Education Team
Subject:  [Subject] - Grade [X] - [Topic Code]
Keywords: AvaB, [subject], lớp [X], [topic tags]
Creator:  AvaB Publishing Pipeline v1.0
Producer: AvaB Publishing Pipeline v1.0
Language: vi-VN
```

### 2.2.5 Bookmark Structure

**MUST** có PDF bookmarks (outline) cho tài liệu ≥5 trang:

```
├── Heading 1 → Level 1 bookmark
│   ├── Heading 2 → Level 2 bookmark
│   │   └── Heading 3 → Level 3 bookmark (SHOULD)
```

### 2.2.6 Hyperlinks

| Link Type | Format | Behavior |
|-----------|--------|----------|
| Internal cross-reference | Named destination | Jump in-document |
| avab.vn links | Full URL | Open in browser |
| External links | Full URL + tooltip | Open in new tab |
| Email links | mailto: | Open mail client |

**SHOULD** kiểm tra tất cả hyperlinks trước khi publish (không có broken links).

---

## 2.3 Worksheet Standard (Phiếu Học Tập)

### 2.3.1 Layout Requirements

| Element | Specification | Requirement |
|---------|--------------|-------------|
| Page size | A4 Portrait | MUST |
| Margins | Tất cả ≥ 2cm | MUST |
| Font size | ≥ 12pt (body text) | MUST |
| Line spacing | 1.5 minimum | MUST |
| Answer lines height | 0.8cm per line | MUST |
| Column layout | 1 column (default), 2 max | SHOULD |

### 2.3.2 Student Info Header

**MUST** có header ở đầu mỗi worksheet:

```
┌─────────────────────────────────────────────────────┐
│  Họ và tên: ________________________  Lớp: _______  │
│  Ngày: _______________________________  Điểm: ____  │
│  [AvaB Logo]                          [Topic Code]  │
└─────────────────────────────────────────────────────┘
```

### 2.3.3 Answer Space Calculation

```
Short answer (1 line):    height = 0.8cm
Medium answer (3 lines):  height = 2.4cm  
Long answer (5 lines):    height = 4.0cm
Drawing space:            height = 5cm minimum
Blank box (check/fill):   min 0.6cm × 0.6cm
```

### 2.3.4 Print-friendly Requirements

**MUST:**
- Không có backgrounds màu tối (>40% black)
- Sử dụng borders thay vì fills cho tables
- Tất cả text đủ contrast khi in grayscale (≥ 4.5:1)
- Hình ảnh có thể hiểu được khi in trắng đen

**SHOULD NOT:**
- Dùng màu đỏ và xanh lá cây cùng nhau (colorblind concern)
- Dùng background gradients phức tạp

**MAY:**
- Có hướng dẫn cho giáo viên ở cuối trang (bằng font nhỏ hơn)

---

---

# §3 — Presentation / Slide Standard

## 3.1 Slide Structure

### 3.1.1 Technical Specs

| Property | Value | Requirement |
|----------|-------|-------------|
| Aspect ratio | 16:9 | MUST |
| Resolution | 1920 × 1080px | MUST |
| Format (native) | PPTX / Google Slides | MUST |
| Export format | PDF (for review), PPTX (for delivery) | MUST |
| Slide count | Max 7 slides per topic intro | SHOULD |

### 3.1.2 Slide Type System

| Type | Mã | Mục đích | Template |
|------|----|---------|----------|
| **Title** | `TITLE` | Tên bài, chủ đề | Cover with illustration |
| **Agenda** | `AGENDA` | Nội dung sẽ học | Numbered list |
| **Theory** | `THEORY` | Giải thích lý thuyết | Split: text + visual |
| **Example** | `EXAMPLE` | Ví dụ minh họa | Stepped animation |
| **Practice** | `PRACTICE` | Bài tập thực hành | Interactive layout |
| **Summary** | `SUMMARY` | Tổng kết bài học | Card-based |
| **Assessment** | `ASSESS` | Câu hỏi kiểm tra | Clean Q&A format |

### 3.1.3 Content Density Rules

**MUST NOT** vi phạm các giới hạn sau:

```
Max bullet points per slide:  5
Max words per bullet:         6
Max words per slide:          50
Max nested levels:            2 (SHOULD be 1)
Max images per slide:         2 (SHOULD be 1)
```

**"2-minute rule":** Mỗi slide phải có thể đọc & hiểu trong ≤ 2 phút.

---

## 3.2 Design Rules

### 3.2.1 Typography for Slides

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Slide title (heading) | Be Vietnam Pro | 36–44pt | Bold |
| Body text | Be Vietnam Pro | 24–28pt | Regular |
| Emphasized text | Be Vietnam Pro | 24–28pt | SemiBold |
| Caption / footnote | Be Vietnam Pro | 18pt | Regular |
| Math / Code | JetBrains Mono | 22pt | Regular |

**MUST NOT** dùng font size < 18pt trong slides.

### 3.2.2 Layout Principles

- **One concept per slide** — một ý tưởng chính duy nhất mỗi slide
- **Visual hierarchy** — tiêu đề → nội dung chính → chi tiết phụ
- **Breathing room** — padding tối thiểu 80px mỗi cạnh
- **Brand consistency** — chỉ dùng màu từ AvaB palette (§2.1.3)
- **Contrast** — text contrast ≥ 4.5:1 với background

### 3.2.3 Animation Policy

| Animation Type | Allowed | Notes |
|---------------|---------|-------|
| Appear (fade in) | ✅ MUST use | Mặc định cho tất cả elements |
| Fly in | ✅ MAY | Chỉ cho illustrations |
| Wipe | ❌ MUST NOT | Gây phân tâm |
| Spin, Bounce, Swivel | ❌ MUST NOT | Không phù hợp học thuật |
| Slide transitions | Fade hoặc None only | MUST |
| Auto-advance | ❌ SHOULD NOT | Teacher controls pace |

---

## 3.3 Video Presentation (Bài Giảng Video)

### 3.3.1 Format by Subject

| Subject | Format | Rationale |
|---------|--------|-----------|
| Toán, Văn, Anh | Talking-head + slides | Cảm giác gần gũi |
| Tin học | Screen recording + voiceover | Hiển thị thao tác thực |
| STEM | Demo thực tế + slides | Hands-on learning |
| Thể dục / Nghệ thuật | Full video + voiceover | Thấy được chuyển động |

### 3.3.2 Optimal Age-based Presentation Style

| Age Group | Presentation Style | Pacing |
|-----------|-------------------|--------|
| 5–6 tuổi | Hoạt hình + nhân vật AvaB | Chậm, lặp lại nhiều |
| 7–8 tuổi | Talking-head + illustrations | Vừa phải, ví dụ cụ thể |
| 9–10 tuổi | Mixed media | Nhanh hơn, abstractions bắt đầu |
| 11+ tuổi | Professional presentation | Standard academic pace |

### 3.3.3 Voiceover Standards

- **MUST** dùng giọng đọc rõ ràng, chuẩn accent vùng miền phù hợp học sinh
- **MUST** không có tiếng ồn nền (background noise)
- **SHOULD** dùng giọng đọc chuyên nghiệp hoặc AI TTS được phê duyệt
- **MAY** dùng AI TTS từ danh sách phê duyệt (§C)

---

---

# §4 — Video Standard

## 4.1 Technical Specifications

### 4.1.1 Video Specs

| Parameter | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| Resolution | 1080p (1920×1080) | 4K (3840×2160) | Downscale khi cần |
| Frame rate | 30fps | 60fps (action content) | 24fps cho presentations |
| Video codec | H.264 | H.265/HEVC | H.264 for max compatibility |
| Container | MP4 | MP4 | — |
| Bitrate (1080p) | 4 Mbps | 8 Mbps | CBR preferred |
| Bitrate (4K) | 15 Mbps | 25 Mbps | — |

### 4.1.2 Audio Specs

| Parameter | Specification | Requirement |
|-----------|--------------|-------------|
| Sample rate | 44.1 kHz | MUST |
| Bit depth | 16-bit minimum, 24-bit preferred | MUST |
| Channels | Stereo (2ch) | MUST |
| Loudness normalization | -12 LUFS integrated | MUST |
| Peak level | -1 dBTP max | MUST |
| Noise floor | < -60 dBFS | MUST |
| Codec | AAC-LC | MUST |
| Bitrate | 192 kbps minimum | MUST |

### 4.1.3 Thumbnail Requirements

| Property | Specification |
|----------|--------------|
| Resolution | 1280 × 720px |
| Format | JPEG (90%+) hoặc PNG |
| Text overlay | ≤ 6 words, font ≥ 36pt |
| Brightness | Bright, high contrast |
| AvaB branding | Logo visible, brand colors |
| Face (if any) | Clear, expressive, engaging |
| Safe area | Keep key content inside 90% frame |

---

## 4.2 Content Structure by Age

| Age Group | Duration | Max Segments | Speaking Speed | Pause Frequency |
|-----------|----------|--------------|----------------|-----------------|
| 5–6 tuổi | 3–5 min | 3 segments | 120 WPM | Every 30s |
| 7–8 tuổi | 5–8 min | 4–5 segments | 130 WPM | Every 45s |
| 9–10 tuổi | 8–12 min | 5–6 segments | 140 WPM | Every 60s |
| 11+ tuổi | 10–15 min | 6–8 segments | 150 WPM | Every 90s |

> **WPM = Words Per Minute** (tốc độ đọc lời thoại/voiceover)

**MUST NOT** vượt quá thời lượng tối đa theo nhóm tuổi mà không có interactive break.

---

## 4.3 Script Format

### 4.3.1 Script Structure (3-Part Rule)

```
┌─────────────────────────────────────────────┐
│  HOOK (20%)                                  │
│  • Thu hút sự chú ý                          │
│  • Đặt câu hỏi hoặc tình huống thú vị        │
│  • Preview nội dung sẽ học                   │
├─────────────────────────────────────────────┤
│  CORE CONTENT (60%)                          │
│  • Trình bày kiến thức chính                 │
│  • Ví dụ minh họa                            │
│  • Thực hành có hướng dẫn                   │
│  • Interaction tại mỗi 2 phút               │
├─────────────────────────────────────────────┤
│  SUMMARY + CTA (20%)                         │
│  • Tóm tắt 3 điểm chính                     │
│  • Bài tập về nhà / tiếp theo               │
│  • Call-to-action rõ ràng                   │
└─────────────────────────────────────────────┘
```

### 4.3.2 Script Markup Format

```markdown
## Scene 1: Hook (0:00 - 0:45)

[VISUAL: Nhân vật AvaBot xuất hiện với quả táo trên tay]
[AUDIO: Nhạc vui tươi fade in → fade out]
[INTERACTION: None]

**SCRIPT:**
"Chào các bạn! Hôm nay AvaBot có một câu hỏi rất thú vị: 
Nếu có 3 quả táo và thêm 2 quả nữa, các bạn có bao nhiêu quả táo?
Hãy cùng khám phá phép cộng nhé!"

---

## Scene 2: Core — Phép cộng (0:45 - 5:30)

[VISUAL: Slide với 3 quả táo → animation thêm 2 quả táo]
[AUDIO: Voiceover, không có nhạc nền]
[INTERACTION: Pause tại 2:30 — học sinh đếm theo]

**SCRIPT:**
"Nhìn vào màn hình — chúng ta có 3 quả táo. 
Bây giờ thêm 2 quả táo nữa...
Các bạn đếm cùng AvaBot: 1, 2, 3, 4, 5!"

[PAUSE 3 seconds for student response]
```

### 4.3.3 Caption / Subtitle Requirements

| Language | Requirement | Notes |
|----------|-------------|-------|
| Vietnamese | MUST | .srt hoặc .vtt format |
| English | MAY | Dành cho content quốc tế |
| Timing accuracy | ≤ 0.5s offset | MUST |
| Line length | Max 42 characters/line | SHOULD |
| Max lines | 2 lines per caption | MUST |

---

---

# §5 — LMS / Web Publishing Standard

## 5.1 Content Structure

### 5.1.1 HTML Structure (MUST)

```html
<article class="avab-lesson" lang="vi">
  <header class="lesson-header">
    <h1 class="lesson-title">Tiêu đề bài học</h1>
    <div class="lesson-meta">
      <!-- Subject, Grade, Topic Code, Duration -->
    </div>
  </header>

  <section class="lesson-objectives" aria-label="Mục tiêu bài học">
    <h2>Sau bài học này, học sinh sẽ...</h2>
    <!-- Learning objectives -->
  </section>

  <section class="lesson-content">
    <!-- Main content blocks -->
  </section>

  <aside class="lesson-notes" aria-label="Ghi chú">
    <!-- Callouts, tips, warnings -->
  </aside>

  <footer class="lesson-footer">
    <!-- Navigation, progress, related content -->
  </footer>
</article>
```

**MUST** dùng semantic HTML5 tags: `<section>`, `<article>`, `<figure>`, `<aside>`, `<nav>`
**MUST NOT** dùng `<div>` và `<span>` cho structural content

### 5.1.2 Progressive Loading

**MUST:**
- Lazy load images dưới fold
- Placeholder skeleton cho media content
- Critical CSS inlined trong `<head>`
- Non-critical CSS deferred

```html
<!-- MUST: Lazy loading for images -->
<img
  src="placeholder.svg"
  data-src="actual-image.webp"
  loading="lazy"
  alt="Mô tả hình ảnh"
  width="800"
  height="450"
/>
```

### 5.1.3 Screen Time Guidance

| Age Group | Max Session Duration | Break Reminder |
|-----------|---------------------|----------------|
| 5–7 tuổi | 20 minutes | MUST show break reminder |
| 8–10 tuổi | 30 minutes | SHOULD show break reminder |
| 11+ tuổi | 45 minutes | MAY show break reminder |

---

## 5.2 Accessibility (WCAG 2.1 AA)

### 5.2.1 Mandatory Requirements

**MUST:**

| Requirement | Implementation |
|-------------|---------------|
| Alt text cho mọi hình ảnh có ý nghĩa | `alt="Mô tả nội dung"` |
| Decorative images empty alt | `alt=""` |
| Color contrast ≥ 4.5:1 (normal text) | Verified with contrast checker |
| Color contrast ≥ 3:1 (large text ≥18pt) | Verified with contrast checker |
| Keyboard navigable (Tab/Shift+Tab) | All interactive elements |
| Focus indicators visible | CSS outline không bị xóa |
| Skip navigation link | `<a href="#main">Bỏ qua điều hướng</a>` |
| Form labels | `<label for="...">` explicitly linked |
| Error messages | Clear text, không chỉ dùng màu |
| Video captions | SRT/VTT file đính kèm |
| Audio transcripts | Text transcript cho audio |

### 5.2.2 Font Resizability

**MUST** hỗ trợ text resize lên đến 200% mà không mất nội dung:
```css
/* MUST: Dùng rem/em thay vì px cho font sizes */
body { font-size: 1rem; }  /* 16px base */
h1   { font-size: 2rem; }  /* 32px */
p    { font-size: 0.875rem; line-height: 1.6; }
```

### 5.2.3 Color & Visual

**MUST NOT** dùng màu sắc là cách DUY NHẤT để truyền thông tin:
```
❌ WRONG: "Câu trả lời đúng hiển thị màu xanh"
✅ RIGHT: "Câu trả lời đúng hiển thị màu xanh + icon ✓"
```

---

## 5.3 Performance Targets

| Metric | Target | Requirement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | ≤ 1.5s | MUST |
| Largest Contentful Paint (LCP) | ≤ 2.5s | MUST |
| Time to Interactive (TTI) | ≤ 3.0s | MUST |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | MUST |
| Total Page Weight | ≤ 3MB | SHOULD |
| Images per page weight | ≤ 200KB each | MUST |

### 5.3.1 Image Optimization

```
Format hierarchy:
1. WebP (best): 25–35% smaller than JPEG
2. AVIF (future): 50% smaller than JPEG
3. PNG (lossless): diagrams, illustrations, transparent
4. JPEG (fallback): photos, complex images

MUST use WebP with JPEG/PNG fallback:
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="..." width="800" height="450">
</picture>
```

### 5.3.2 Script Loading

**MUST NOT** có render-blocking scripts trong `<head>`:
```html
<!-- WRONG ❌ -->
<head>
  <script src="heavy-library.js"></script>
</head>

<!-- RIGHT ✅ -->
<head>
  <script src="critical-only.js" defer></script>
</head>
<body>
  <!-- content -->
  <script src="non-critical.js" defer></script>
</body>
```

---

## 5.4 Mobile Requirements

### 5.4.1 Touch Targets

**MUST** đảm bảo mọi interactive element có kích thước tối thiểu:

```css
/* MUST: Touch target size */
.btn, .link, .input, .checkbox {
  min-width: 44px;
  min-height: 44px;
  padding: 8px 12px; /* additional padding */
}
```

### 5.4.2 Navigation

**MUST** dùng bottom navigation cho mobile (thumb-friendly):

```
Bottom navigation layout:
[🏠 Home]  [📚 Lessons]  [✏️ Practice]  [📊 Progress]  [👤 Profile]
```

**SHOULD NOT** dùng hamburger menu ẩn cho primary navigation trên mobile.

### 5.4.3 Offline Capability

**MUST** cho core content:
- Bài lý thuyết (text + static images) hoạt động offline
- Progress được sync khi có kết nối lại
- Service Worker implemented

**SHOULD** cho interactive content:
- Bài tập offline với local scoring
- Video download cho offline viewing

### 5.4.4 Data Efficiency

**MUST** cung cấp "Chế độ tiết kiệm dữ liệu":
- Images: reduce quality 50%
- Videos: stream at 480p
- Disable auto-play
- Disable animations

---

---

# §6 — SCORM / xAPI Standard

## 6.1 SCORM Standard

### 6.1.1 Version Compatibility

**MUST** support SCORM 2004 4th Edition as primary.
**SHOULD** support SCORM 1.2 for legacy partner systems.

### 6.1.2 Required CMI Data Fields

| CMI Field | Description | Required |
|-----------|-------------|----------|
| `cmi.completion_status` | completed/incomplete/not_attempted | MUST |
| `cmi.success_status` | passed/failed/unknown | MUST |
| `cmi.score.raw` | Raw score (0–100) | MUST |
| `cmi.score.min` | Minimum score (always 0) | MUST |
| `cmi.score.max` | Maximum score (always 100) | MUST |
| `cmi.score.scaled` | Score 0–1 | MUST |
| `cmi.progress_measure` | Progress 0–1 | MUST |
| `cmi.time_limit_action` | continue,no message | SHOULD |
| `cmi.session_time` | Time spent this session | MUST |
| `cmi.total_time` | Cumulative time | MUST |
| `cmi.location` | Bookmark/resume point | MUST |
| `cmi.suspend_data` | Custom resume data (JSON) | SHOULD |
| `cmi.learner_name` | Student name | MUST |
| `cmi.learner_id` | Student ID | MUST |

### 6.1.3 Completion Rules

```
Completion Threshold: 80% correct exercises
→ cmi.completion_status = "completed"
→ cmi.success_status = "passed" (nếu score ≥ passing_score)

Passing Score: Configurable per assessment (default 70%)
→ cmi.success_status = "passed" | "failed"

Progress Measure:
→ 0.0 = not started
→ 0.0–1.0 = proportion of content viewed
→ 1.0 = all content viewed (triggers completion check)
```

### 6.1.4 SCORM Package Structure

```
[content_id]-scorm.zip
├── imsmanifest.xml         ← MUST: Course manifest
├── adlcp_rootv1p2.xsd      ← Schema validation
├── ims_xml.xsd
├── imscp_v1p1.xsd
├── imsmd_v1p2p2.xsd
├── assets/
│   ├── index.html          ← Launch file
│   ├── css/
│   ├── js/
│   │   └── scorm-api.js    ← SCORM API wrapper
│   ├── images/
│   └── audio/
└── metadata/
    └── course-metadata.xml
```

### 6.1.5 Resume Capability

**MUST** implement resume:
1. On exit: save `cmi.location` + `cmi.suspend_data` (JSON state)
2. On re-launch: check `cmi.entry` = "resume"
3. If resume: restore from `cmi.location` và `cmi.suspend_data`
4. If first launch: `cmi.entry` = "ab-initio"

---

## 6.2 xAPI (Tin Can API) Statements

### 6.2.1 Required Statement Verbs

| Verb | IRI | Trigger |
|------|-----|---------|
| **launched** | http://adlnet.gov/expapi/verbs/launched | Student opens content |
| **progressed** | http://adlnet.gov/expapi/verbs/progressed | Student completes a section |
| **completed** | http://adlnet.gov/expapi/verbs/completed | Student finishes all content |
| **scored** | http://adlnet.gov/expapi/verbs/scored | Score recorded |
| **passed** | http://adlnet.gov/expapi/verbs/passed | Score ≥ passing threshold |
| **failed** | http://adlnet.gov/expapi/verbs/failed | Score < passing threshold |
| **answered** | http://adlnet.gov/expapi/verbs/answered | Student answers a question |
| **interacted** | http://adlnet.gov/expapi/verbs/interacted | Student interacts with element |

### 6.2.2 Statement Template

```json
{
  "actor": {
    "objectType": "Agent",
    "name": "Nguyễn Văn A",
    "account": {
      "homePage": "https://avab.vn",
      "name": "student-uuid-12345"
    }
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "vi-VN": "đã hoàn thành", "en-US": "completed" }
  },
  "object": {
    "objectType": "Activity",
    "id": "https://avab.vn/content/MATH-G2-QLD-003-lesson-v1.0",
    "definition": {
      "type": "http://adlnet.gov/expapi/activities/lesson",
      "name": { "vi-VN": "Phép cộng trong phạm vi 20" },
      "description": { "vi-VN": "Bài học về phép cộng lớp 2" }
    }
  },
  "result": {
    "completion": true,
    "success": true,
    "score": {
      "raw": 85,
      "min": 0,
      "max": 100,
      "scaled": 0.85
    },
    "duration": "PT12M30S"
  },
  "context": {
    "registration": "session-uuid",
    "platform": "AvaB LMS",
    "language": "vi-VN",
    "extensions": {
      "https://avab.vn/xapi/ext/grade": "2",
      "https://avab.vn/xapi/ext/subject": "MATH"
    }
  },
  "timestamp": "2026-07-04T10:30:00.000Z"
}
```

---

---

# §7 — File Naming & Organization Standard

## 7.1 File Naming Convention

### 7.1.1 Standard Format

```
Format:  [SUBJECT]-[GRADE]-[TOPIC_CODE]-[TYPE]-v[VERSION].[ext]

Fields:
  SUBJECT     → Mã môn học (MATH, VAN, ENG, TIN, STEM, GDCN, TDMT)
  GRADE       → Khối lớp (G1–G12)
  TOPIC_CODE  → Mã chủ đề (3 ký tự + số, ví dụ: QLD-003, PCC-012)
  TYPE        → Loại nội dung (xem bảng bên dưới)
  VERSION     → Semantic version (v1.0, v1.2.1)
  ext         → Extension file
```

### 7.1.2 Type Codes

| Content Type | Type Code | Extensions |
|-------------|-----------|-----------|
| Lesson | `lesson` | .html, .pdf, .docx |
| Theory | `theory` | .pdf, .docx |
| Exercise | `exercise` | .html, .pdf |
| Homework | `homework` | .pdf, .docx |
| Assessment | `assessment` | .html, .pdf |
| Worksheet | `worksheet` | .pdf |
| Teacher Guide | `teacher-guide` | .pdf, .docx |
| Parent Report | `parent-report` | .pdf |
| Video | `video` | .mp4 |
| Thumbnail | `thumbnail` | .jpg, .webp |
| Slide | `slide` | .pptx, .pdf |
| Script | `script` | .md, .docx |
| SCORM Package | `scorm` | .zip |

### 7.1.3 Examples

```bash
# Lesson PDF
MATH-G2-QLD-003-lesson-v1.0.pdf

# Homework DOCX (editable for teachers)
MATH-G2-QLD-003-homework-v1.2.docx

# Video
MATH-G2-QLD-003-video-v1.0.mp4

# Video thumbnail
MATH-G2-QLD-003-thumbnail-v1.0.jpg

# SCORM package
MATH-G2-QLD-003-scorm-v1.0.zip

# Teacher guide
MATH-G2-QLD-003-teacher-guide-v1.0.pdf

# Assessment (versioned for academic year)
MATH-G2-QLD-003-assessment-v2026.1.pdf

# Slide presentation
MATH-G2-QLD-003-slide-v1.0.pptx
```

**MUST NOT:**
- Dùng spaces trong tên file (dùng `-` hoặc `_`)
- Dùng ký tự đặc biệt: `!@#$%^&*()+=[]{}|;':"<>?,`
- Tên file quá 255 ký tự
- Dùng tiếng Việt có dấu trong tên file

---

## 7.2 Folder Structure

```
/content/
└── courses/
    └── [SUBJECT]-G[GRADE]-[COURSE_CODE]/
        │   ← e.g.: MATH-G2-TOAN-LOP2-2026
        │
        ├── topics/
        │   └── [TOPIC_CODE]/
        │       │   ← e.g.: QLD-003 (Phép cộng trong phạm vi 20)
        │       │
        │       ├── lessons/          ← HTML + PDF lessons
        │       ├── exercises/        ← Interactive exercises
        │       ├── homework/         ← Homework PDFs + DOCX
        │       ├── videos/           ← MP4 + thumbnails
        │       │   ├── [name]-video-v1.0.mp4
        │       │   └── [name]-thumbnail-v1.0.jpg
        │       ├── worksheets/       ← Print-ready worksheets
        │       ├── slides/           ← PPTX + PDF exports
        │       ├── assessments/      ← Tests + quizzes
        │       └── scripts/          ← Video scripts (MD)
        │
        ├── teacher-guides/           ← Teacher materials (all topics)
        ├── parent-reports/           ← Report templates
        └── certificates/            ← Certificate templates
```

---

---

# §8 — Version Control & Update Policy

## 8.1 Semantic Versioning

**Format:** `v[MAJOR].[MINOR].[PATCH]`

| Component | When to increment | Example |
|-----------|-----------------|---------|
| **MAJOR** | Thay đổi curriculum/structure cơ bản | v1.0 → v2.0 |
| **MINOR** | Cập nhật nội dung đáng kể, thêm section | v1.0 → v1.1 |
| **PATCH** | Sửa lỗi chính tả, typo, minor formatting | v1.0 → v1.0.1 |

### 8.1.1 MAJOR Version Triggers

**MUST** tăng MAJOR khi:
- Thay đổi curriculum theo quyết định Bộ GD&ĐT
- Cấu trúc nội dung thay đổi >50%
- Đổi mục tiêu học tập chính
- Breaking change với SCORM packages

### 8.1.2 MINOR Version Triggers

**MUST** tăng MINOR khi:
- Thêm hoặc xóa exercises/examples
- Cập nhật hình ảnh, video minh họa
- Thêm ngôn ngữ mới
- Cải thiện độ khó bài tập

### 8.1.3 PATCH Version Triggers

**MUST** tăng PATCH khi:
- Sửa lỗi chính tả, ngữ pháp
- Fix formatting issues
- Cập nhật hyperlinks
- Minor layout adjustments

---

## 8.2 Deprecation Policy

| Phase | Duration | Action |
|-------|----------|--------|
| Active | Ongoing | Fully supported |
| Deprecated | 30 days notice | Warning shown to educators |
| Sunset | After notice period | Archived, not accessible for new assignments |
| Archived | Indefinite | Read-only, compliance/audit access |

**MUST** gửi deprecation notice 30 ngày trước khi chuyển sang version mới (MAJOR).
**MUST** maintain backward compatibility cho MINOR và PATCH updates.

---

## 8.3 Student Submission Compatibility

**MUST NOT** phá vỡ student submissions khi update nội dung:
- Submissions tham chiếu đến content version tại thời điểm nộp
- Grading rubrics được snapshot cùng version
- Score không bị thay đổi retroactively khi content update

---

## 8.4 Changelog Format

**MUST** có CHANGELOG.md tại thư mục topic:

```markdown
# CHANGELOG — MATH-G2-QLD-003

## v1.2.0 (2026-07-04)
### Added
- Thêm 5 bài tập nâng cao
- Video minh họa phần 2

### Changed
- Cập nhật hình ảnh slide 3

### Fixed
- Sửa công thức trang 4

## v1.1.0 (2026-05-01)
### Added
- Homework bổ sung (phần B)

## v1.0.0 (2026-03-01)
### Initial Release
```

---

---

# §9 — Multi-language Support

## 9.1 Language Hierarchy

| Priority | Language | Code | Usage |
|----------|----------|------|-------|
| Primary | Tiếng Việt | `vi-VN` | Tất cả nội dung |
| Secondary | English | `en-US` | Competition content, bilingual programs |
| Reserved | RTL languages | — | Tương lai |

## 9.2 Translation Workflow

```
[VN Original Content]
        ↓
[Native Speaker Review]
    (Chuyên gia giáo dục VN)
        ↓
[Approved VN Version]
        ↓
[Professional Translation → EN]
    (Human translator, not AI-only)
        ↓
[EN Review by Subject Expert]
        ↓
[Bilingual QA Check]
    (Verify math/code terminology)
        ↓
[Approved EN Version]
        ↓
[Publish bilingual package]
```

## 9.3 Content ID Independence

**MUST** dùng language-independent content IDs:
```
content_id: "MATH-G2-QLD-003"   ← Không có ngôn ngữ trong ID
locale: "vi-VN"                  ← Locale riêng biệt
content_id + locale = unique key
```

## 9.4 Localization Requirements

| Element | Requirement |
|---------|-------------|
| Mathematical notation | MUST follow VN standard (dấu phẩy = decimal separator) |
| Date format | DD/MM/YYYY cho VN, MM/DD/YYYY cho EN |
| Currency | VND cho VN context |
| Measurement | Metric system (cm, kg, lít) |
| Cultural references | MUST be Vietnam-appropriate |

**MUST NOT** translate placeholder text như `[TÊN HỌC SINH]` — keep as placeholders.

---

---

# §10 — Publishing Workflow & Approval Gates

## 10.1 Full Publishing Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    CONTENT CREATION                      │
│  Author creates content using AvaB templates            │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   AUTO QA CHECK                          │
│  ✓ File naming convention                               │
│  ✓ Metadata completeness                                │
│  ✓ Image alt texts present                              │
│  ✓ Font compliance                                      │
│  ✓ File size limits                                     │
│  ✓ Broken links check                                   │
│                                                         │
│  FAIL ──────────────────────────────────► Back to Author│
└────────────────────────┬────────────────────────────────┘
                         ↓ PASS
┌─────────────────────────────────────────────────────────┐
│                   HUMAN REVIEW                           │
│  Reviewer: Senior Educator or Content Lead              │
│  ✓ Pedagogical accuracy                                 │
│  ✓ Age-appropriate language                             │
│  ✓ Curriculum alignment                                 │
│  ✓ AvaB brand consistency                              │
│                                                         │
│  REJECT ────────────────────────────────► Back to Author│
│  (with feedback comments)                               │
└────────────────────────┬────────────────────────────────┘
                         ↓ APPROVED
┌─────────────────────────────────────────────────────────┐
│               FORMAT CONVERSION                          │
│  ┌──────────────┬──────────────┬────────────────────┐  │
│  │  PDF / DOCX  │   Web / LMS  │      Mobile        │  │
│  └──────────────┴──────────────┴────────────────────┘  │
│  ┌──────────────┬──────────────┬────────────────────┐  │
│  │ SCORM (if    │    Video     │    Worksheet       │  │
│  │  needed)     │  Packaging   │    Print-ready     │  │
│  └──────────────┴──────────────┴────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│             PREVIEW & ADMIN APPROVAL                     │
│  Admin reviews final rendered versions on all platforms │
│                                                         │
│  REJECT ────────────────────────────────► Fix & Resubmit│
└────────────────────────┬────────────────────────────────┘
                         ↓ APPROVED
┌─────────────────────────────────────────────────────────┐
│              PUBLISH TO PRODUCTION                       │
│  • Set publish date/time                                │
│  • Configure visibility (public/enrolled/teacher-only)  │
│  • Tag curriculum metadata                              │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                CDN DISTRIBUTION                          │
│  • CloudFront/CDN push                                  │
│  • Cache invalidation for updated content               │
│  • Geographic distribution                              │
│  • Edge caching for performance                         │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                STUDENT ACCESS                            │
│  Content live on avab.vn + Mobile App                  │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│             ANALYTICS COLLECTION                         │
│  • Engagement metrics (time-on-task, completion rate)   │
│  • Assessment scores                                    │
│  • Error/struggle point tracking                        │
│  • Device/platform stats                                │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                 FEEDBACK LOOP                            │
│  • Teacher feedback                                     │
│  • Student difficulty signals                           │
│  • Content update triggers                              │
│  → Triggers PATCH or MINOR version update              │
└─────────────────────────────────────────────────────────┘
```

## 10.2 SLA — Service Level Agreements

| Stage | Target Time | Notes |
|-------|------------|-------|
| Auto QA | < 5 minutes | Automated |
| Human Review | ≤ 3 business days | Content Lead |
| Format Conversion | < 2 hours | Automated pipeline |
| Admin Approval | ≤ 1 business day | Admin team |
| CDN Distribution | < 30 minutes after publish | Automated |

## 10.3 Emergency Hotfix Process

Khi nội dung có lỗi nghiêm trọng (sai kiến thức, sai đáp án):

```
1. Admin/Content Lead xác nhận lỗi
2. Unpublish content ngay lập tức
3. Author fix → PATCH version
4. Fast-track review (same day)
5. Re-publish
6. Notify affected teachers via email
```

**MUST** hoàn thành Emergency Hotfix trong ≤ 4 giờ.

---

---

# §11 — JSON Schema — Publishing Package

## 11.1 PublishingPackage Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://avab.vn/schemas/publishing-package-v1.json",
  "title": "AvaB Publishing Package",
  "description": "Schema cho một gói xuất bản học liệu AvaB",
  "type": "object",
  "required": [
    "content_id",
    "version",
    "content_type",
    "metadata",
    "formats",
    "approval",
    "distribution"
  ],
  "properties": {
    "content_id": {
      "type": "string",
      "description": "Unique identifier, language-independent",
      "pattern": "^[A-Z]+-G[0-9]+-[A-Z0-9]+-[0-9]{3}$",
      "examples": ["MATH-G2-QLD-003"]
    },
    "version": {
      "type": "string",
      "description": "Semantic version",
      "pattern": "^v[0-9]+\\.[0-9]+(\\.[0-9]+)?$",
      "examples": ["v1.0", "v1.2.3"]
    },
    "content_type": {
      "type": "string",
      "enum": [
        "lesson", "theory", "exercise", "homework",
        "assessment", "worksheet", "teacher-guide",
        "parent-report", "certificate"
      ]
    },
    "metadata": {
      "type": "object",
      "required": ["title", "subject", "grade", "topic_code", "author", "created_at", "language"],
      "properties": {
        "title": {
          "type": "object",
          "properties": {
            "vi": { "type": "string" },
            "en": { "type": "string" }
          },
          "required": ["vi"]
        },
        "description": {
          "type": "object",
          "properties": {
            "vi": { "type": "string" },
            "en": { "type": "string" }
          }
        },
        "subject": {
          "type": "string",
          "enum": ["MATH", "VAN", "ENG", "TIN", "STEM", "GDCN", "TDMT"]
        },
        "grade": {
          "type": "integer",
          "minimum": 1,
          "maximum": 12
        },
        "topic_code": {
          "type": "string",
          "pattern": "^[A-Z]{3}-[0-9]{3}$"
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "author": {
          "type": "object",
          "required": ["name", "user_id"],
          "properties": {
            "name": { "type": "string" },
            "user_id": { "type": "string" }
          }
        },
        "language": {
          "type": "string",
          "enum": ["vi-VN", "en-US"],
          "default": "vi-VN"
        },
        "created_at": {
          "type": "string",
          "format": "date-time"
        },
        "updated_at": {
          "type": "string",
          "format": "date-time"
        },
        "curriculum_alignment": {
          "type": "object",
          "properties": {
            "standard": { "type": "string", "examples": ["BGDT-2018", "BGDT-2023"] },
            "learning_objectives": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "age_group": {
          "type": "object",
          "properties": {
            "min_age": { "type": "integer" },
            "max_age": { "type": "integer" }
          }
        },
        "duration_minutes": {
          "type": "integer",
          "description": "Expected time to complete in minutes"
        }
      }
    },
    "formats": {
      "type": "array",
      "description": "Danh sách các định dạng được xuất bản",
      "items": {
        "type": "object",
        "required": ["format", "status", "url"],
        "properties": {
          "format": {
            "type": "string",
            "enum": ["web", "pdf", "docx", "video", "worksheet", "slide", "scorm", "mobile"]
          },
          "status": {
            "type": "string",
            "enum": ["pending", "processing", "ready", "published", "error", "deprecated"]
          },
          "url": {
            "type": "string",
            "format": "uri",
            "description": "CDN URL của file/page"
          },
          "file_name": { "type": "string" },
          "file_size_bytes": { "type": "integer" },
          "checksum_sha256": { "type": "string" },
          "published_at": { "type": "string", "format": "date-time" }
        }
      },
      "minItems": 1
    },
    "assets": {
      "type": "array",
      "description": "Media assets được dùng trong nội dung",
      "items": {
        "type": "object",
        "required": ["asset_id", "type", "url"],
        "properties": {
          "asset_id": { "type": "string" },
          "type": {
            "type": "string",
            "enum": ["image", "video", "audio", "document", "font"]
          },
          "url": { "type": "string", "format": "uri" },
          "alt_text": { "type": "string" },
          "file_size_bytes": { "type": "integer" },
          "dimensions": {
            "type": "object",
            "properties": {
              "width": { "type": "integer" },
              "height": { "type": "integer" }
            }
          },
          "license": { "type": "string", "examples": ["AvaB-proprietary", "CC-BY-4.0"] }
        }
      }
    },
    "approval": {
      "type": "object",
      "required": ["status"],
      "properties": {
        "status": {
          "type": "string",
          "enum": ["draft", "auto_qa_pending", "auto_qa_failed", "human_review", "rejected", "approved", "published"]
        },
        "auto_qa": {
          "type": "object",
          "properties": {
            "passed": { "type": "boolean" },
            "checked_at": { "type": "string", "format": "date-time" },
            "failures": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "check": { "type": "string" },
                  "message": { "type": "string" }
                }
              }
            }
          }
        },
        "human_review": {
          "type": "object",
          "properties": {
            "reviewer_id": { "type": "string" },
            "reviewer_name": { "type": "string" },
            "reviewed_at": { "type": "string", "format": "date-time" },
            "decision": { "type": "string", "enum": ["approved", "rejected"] },
            "comments": { "type": "string" }
          }
        },
        "admin_approval": {
          "type": "object",
          "properties": {
            "admin_id": { "type": "string" },
            "approved_at": { "type": "string", "format": "date-time" },
            "notes": { "type": "string" }
          }
        }
      }
    },
    "distribution": {
      "type": "object",
      "properties": {
        "visibility": {
          "type": "string",
          "enum": ["public", "enrolled-only", "teacher-only", "admin-only", "draft"],
          "default": "enrolled-only"
        },
        "publish_at": {
          "type": "string",
          "format": "date-time",
          "description": "Scheduled publish time (null = immediate)"
        },
        "expire_at": {
          "type": "string",
          "format": "date-time",
          "description": "Auto-expire time (null = no expiry)"
        },
        "cdn_status": {
          "type": "string",
          "enum": ["not_pushed", "pushing", "live", "invalidating", "error"]
        },
        "cdn_invalidated_at": { "type": "string", "format": "date-time" },
        "regions": {
          "type": "array",
          "items": { "type": "string" },
          "default": ["VN"],
          "description": "Distribution regions"
        }
      }
    }
  }
}
```

---

---

# §12 — Database Design

## 12.1 Core Tables

### 12.1.1 `published_content`

```sql
CREATE TABLE published_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      VARCHAR(50) NOT NULL,    -- e.g.: MATH-G2-QLD-003
    content_type    VARCHAR(30) NOT NULL,    -- lesson, homework, assessment...
    subject         VARCHAR(10) NOT NULL,
    grade           SMALLINT NOT NULL,
    topic_code      VARCHAR(10) NOT NULL,
    title_vi        TEXT NOT NULL,
    title_en        TEXT,
    description_vi  TEXT,
    description_en  TEXT,
    language        VARCHAR(10) NOT NULL DEFAULT 'vi-VN',
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
                    -- draft | published | deprecated | archived
    visibility      VARCHAR(20) NOT NULL DEFAULT 'enrolled-only',
    author_id       UUID NOT NULL REFERENCES users(id),
    published_at    TIMESTAMPTZ,
    expire_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_content_id_language UNIQUE (content_id, language)
);

CREATE INDEX idx_published_content_subject_grade ON published_content(subject, grade);
CREATE INDEX idx_published_content_status ON published_content(status);
CREATE INDEX idx_published_content_topic ON published_content(topic_code);
```

### 12.1.2 `content_versions`

```sql
CREATE TABLE content_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      VARCHAR(50) NOT NULL,
    version         VARCHAR(20) NOT NULL,    -- v1.0, v1.2.3
    major           SMALLINT NOT NULL,
    minor           SMALLINT NOT NULL,
    patch           SMALLINT NOT NULL DEFAULT 0,
    changelog       TEXT,
    is_current      BOOLEAN NOT NULL DEFAULT FALSE,
    deprecated_at   TIMESTAMPTZ,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_content_version UNIQUE (content_id, version)
);

CREATE INDEX idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX idx_content_versions_current ON content_versions(content_id, is_current);
```

### 12.1.3 `publishing_packages`

```sql
CREATE TABLE publishing_packages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      VARCHAR(50) NOT NULL,
    version         VARCHAR(20) NOT NULL,
    package_data    JSONB NOT NULL,          -- Full PublishingPackage JSON
    approval_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    auto_qa_passed  BOOLEAN,
    auto_qa_at      TIMESTAMPTZ,
    auto_qa_results JSONB,
    reviewer_id     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    review_decision VARCHAR(10),             -- approved | rejected
    review_notes    TEXT,
    admin_id        UUID REFERENCES users(id),
    admin_approved_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (content_id, version) REFERENCES content_versions(content_id, version)
);
```

### 12.1.4 `cdn_assets`

```sql
CREATE TABLE cdn_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      VARCHAR(50) NOT NULL,
    version         VARCHAR(20) NOT NULL,
    format          VARCHAR(20) NOT NULL,    -- web, pdf, docx, video...
    file_name       VARCHAR(255) NOT NULL,
    file_path       TEXT NOT NULL,           -- S3/CDN path
    cdn_url         TEXT NOT NULL,
    file_size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    mime_type       VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    pushed_at       TIMESTAMPTZ,
    invalidated_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_cdn_asset UNIQUE (content_id, version, format)
);

CREATE INDEX idx_cdn_assets_content ON cdn_assets(content_id, version);
```

### 12.1.5 `publishing_approval` (Audit Log)

```sql
CREATE TABLE publishing_approval (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      UUID NOT NULL REFERENCES publishing_packages(id),
    action          VARCHAR(30) NOT NULL,
                    -- submitted | auto_qa_pass | auto_qa_fail |
                    -- human_approved | human_rejected |
                    -- admin_approved | published | rollback
    actor_id        UUID REFERENCES users(id),
    actor_type      VARCHAR(20),             -- user | system | automation
    notes           TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_package ON publishing_approval(package_id);
CREATE INDEX idx_approval_action ON publishing_approval(action, created_at);
```

### 12.1.6 `distribution_log`

```sql
CREATE TABLE distribution_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      VARCHAR(50) NOT NULL,
    version         VARCHAR(20) NOT NULL,
    event_type      VARCHAR(30) NOT NULL,
                    -- published | unpublished | cdn_pushed |
                    -- cdn_invalidated | deprecated | archived
    triggered_by    UUID REFERENCES users(id),
    platform        VARCHAR(20),            -- web, mobile, scorm, all
    details         JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_distribution_log_content ON distribution_log(content_id, created_at DESC);
```

---

---

# §13 — Admin UI — Publishing Dashboard

## 13.1 Dashboard Wireframe

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  AvaB Publishing Dashboard                         [+ New Content] [⚙ Settings]  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Filter: [Subject ▼] [Grade ▼] [Status ▼] [Type ▼]    🔍 Search...         ║
║                                                                              ║
╠══════════╦═══════════════╦════════╦═══════════════════╦══════════╦══════════╣
║ Content  ║ Title         ║ Type   ║ Format Status     ║ Version  ║ Actions  ║
╠══════════╬═══════════════╬════════╬═══════════════════╬══════════╬══════════╣
║          ║               ║        ║ [WEB✅][PDF✅]    ║          ║          ║
║ MATH-G2  ║ Phép cộng     ║ Lesson ║ [VID✅][SCO⏳]   ║ v1.2.0   ║ [Edit]   ║
║ QLD-003  ║ phạm vi 20    ║        ║ [MOB✅][DOCX✅]  ║ LIVE 🟢  ║ [▾More]  ║
╠══════════╬═══════════════╬════════╬═══════════════════╬══════════╬══════════╣
║          ║               ║        ║ [WEB✅][PDF✅]    ║          ║          ║
║ MATH-G2  ║ Phép trừ      ║ Lesson ║ [VID⚠️][SCO❌]   ║ v1.0.0   ║ [Edit]   ║
║ QLD-004  ║ phạm vi 20    ║        ║ [MOB✅][DOCX✅]  ║ LIVE 🟢  ║ [▾More]  ║
╠══════════╬═══════════════╬════════╬═══════════════════╬══════════╬══════════╣
║          ║               ║        ║ [WEB⏳][PDF⏳]   ║          ║          ║
║ MATH-G2  ║ Bảng cửu      ║ Lesson ║ [VID⏳][SCO —]   ║ v1.0.0   ║ [Review] ║
║ NHN-001  ║ chương        ║        ║ [MOB⏳][DOCX⏳]  ║ REVIEW 🟡║ [▾More]  ║
╚══════════╩═══════════════╩════════╩═══════════════════╩══════════╩══════════╝

Legend: ✅ Published  ⏳ Processing  ❌ Error  ⚠️ Warning  — Not applicable
```

## 13.2 Features

### 13.2.1 Content List

| Feature | Description |
|---------|-------------|
| Format Status Badges | Hiển thị status từng định dạng (Web, PDF, Video, SCORM, Mobile, DOCX) |
| Version Display | Version + status badge (LIVE 🟢, REVIEW 🟡, DRAFT ⚪, DEPRECATED 🔴) |
| Multi-select | Select nhiều items để bulk publish/archive |
| Sort | Theo Subject, Grade, Updated Date, Status |
| Filter | Theo subject, grade, content_type, status |
| Search | Full-text search theo title, content_id |

### 13.2.2 One-Click Publish

```
[Publish to Platforms]
☑ Web LMS
☑ Mobile App
☑ PDF Download
☑ DOCX Download
☐ SCORM (B2B)
☑ Worksheet (Print)

Schedule: ○ Now  ● Scheduled: [2026-07-05 08:00]

[Cancel]  [Publish Selected Platforms]
```

### 13.2.3 Version History Panel

```
Version History — MATH-G2-QLD-003
────────────────────────────────────────────
● v1.2.0  2026-07-04  CURRENT  [View] [Rollback ❌]
  └ Added 5 advanced exercises, updated video

○ v1.1.0  2026-05-01           [View] [Rollback]
  └ Added homework section B

○ v1.0.0  2026-03-01           [View] [Rollback]
  └ Initial release
────────────────────────────────────────────
[Compare versions]
```

### 13.2.4 CDN Status

```
CDN Distribution Status
────────────────────────────
Region: VN (Primary)  🟢 Live
Last pushed: 2026-07-04 10:30
Cache TTL: 24h
[Invalidate Cache] [Push Now]

Files distributed:
✅ lesson-v1.2.pdf     (2.1MB)
✅ lesson-v1.2.html    (45KB)
✅ lesson-v1.2.mp4     (180MB)
⏳ lesson-v1.2.scorm   (uploading 45%)
```

### 13.2.5 Download Statistics

```
📊 Analytics — Last 30 days
────────────────────────────────────────────
Views:        1,245   (+12% vs prev month)
Completions:    987   (79.3% completion rate)
Downloads:      234   PDF: 156 | DOCX: 78
Video plays:    876   Avg. watch: 8m 32s
Avg. score:    78.5%  (n=456 assessments)

[View full analytics] [Export CSV]
```

### 13.2.6 Rollback

**MUST** require confirmation dialog:
```
⚠️ Rollback to v1.1.0?

This will:
• Unpublish v1.2.0 from all platforms
• Re-publish v1.1.0 content
• Notify 23 teachers using this content
• Student submissions to v1.2.0 remain unchanged

Type "ROLLBACK" to confirm: [____________]
[Cancel]  [Confirm Rollback]
```

---

---

# §14 — QA Checklist (30+ Items)

> **QA RULE:** Không có nội dung nào được publish nếu còn item MUST chưa pass.

## 14.1 Document / PDF Checklist

| # | Check Item | Type | Method |
|---|-----------|------|--------|
| 1 | File name đúng convention | MUST | Auto |
| 2 | Metadata đầy đủ (title, author, subject, keywords) | MUST | Auto |
| 3 | Font embed trong file | MUST | Auto |
| 4 | Tất cả hình ảnh có alt text | MUST | Auto |
| 5 | Heading structure logical (H1→H2→H3) | MUST | Auto |
| 6 | Margins đúng spec (2.5cm) | MUST | Auto |
| 7 | Body font size ≥ 12pt | MUST | Auto |
| 8 | Page numbering đúng format | SHOULD | Manual |
| 9 | Header/footer đúng template | MUST | Manual |
| 10 | Watermark đúng loại tài liệu | MUST | Manual |
| 11 | Không có broken hyperlinks | MUST | Auto |
| 12 | Color contrast ≥ 4.5:1 | MUST | Auto |
| 13 | PDF/UA accessibility check pass | MUST | Auto |
| 14 | File size ≤ 10MB | SHOULD | Auto |
| 15 | Images ≥ 150dpi | SHOULD | Auto |

## 14.2 Web / LMS Checklist

| # | Check Item | Type | Method |
|---|-----------|------|--------|
| 16 | Semantic HTML5 structure | MUST | Auto |
| 17 | All images have alt text | MUST | Auto |
| 18 | Keyboard navigation works | MUST | Manual |
| 19 | Focus indicators visible | MUST | Manual |
| 20 | FCP ≤ 1.5s | MUST | Lighthouse |
| 21 | TTI ≤ 3s | MUST | Lighthouse |
| 22 | Mobile responsive (375px-1440px) | MUST | Manual + Auto |
| 23 | Touch targets ≥ 44×44px | MUST | Auto |
| 24 | No render-blocking scripts | MUST | Lighthouse |
| 25 | Images in WebP format | MUST | Auto |
| 26 | Images < 200KB each | MUST | Auto |
| 27 | Screen time warning implemented | MUST (ages 5-7) | Manual |

## 14.3 Video Checklist

| # | Check Item | Type | Method |
|---|-----------|------|--------|
| 28 | Resolution ≥ 1080p | MUST | Auto |
| 29 | Audio normalized to -12 LUFS | MUST | Auto |
| 30 | No background noise | MUST | Manual listen |
| 31 | Vietnamese captions/subtitles present | MUST | Manual |
| 32 | Duration within age-appropriate limit | MUST | Auto |
| 33 | Thumbnail 1280×720, <1MB | MUST | Auto |
| 34 | Hook-Core-Summary structure followed | SHOULD | Manual |
| 35 | No copyrighted music/content | MUST | Manual |

## 14.4 Content Quality Checklist

| # | Check Item | Type | Reviewer |
|---|-----------|------|---------|
| 36 | Kiến thức chính xác, không sai | MUST | Subject Expert |
| 37 | Ngôn ngữ phù hợp lứa tuổi | MUST | Content Lead |
| 38 | Không có nội dung nhạy cảm/phân biệt | MUST | Content Lead |
| 39 | Curriculum alignment đã xác nhận | MUST | Curriculum Lead |
| 40 | Learning objectives rõ ràng, measurable | MUST | Content Lead |
| 41 | Ví dụ đa dạng, phù hợp VN context | SHOULD | Content Lead |
| 42 | Độ khó phù hợp với grade level | MUST | Subject Expert |

## 14.5 SCORM / xAPI Checklist

| # | Check Item | Type | Method |
|---|-----------|------|--------|
| 43 | imsmanifest.xml hợp lệ | MUST | Auto validation |
| 44 | Tất cả CMI fields required được implement | MUST | Auto |
| 45 | Completion threshold 80% hoạt động đúng | MUST | Manual test |
| 46 | Resume capability hoạt động | MUST | Manual test |
| 47 | xAPI statements đúng format | MUST | Auto validation |

---

---

# Phụ lục A — Template Downloads

## A.1 Available Templates

| Template Name | File | Version | Usage |
|-------------|------|---------|-------|
| AvaB Word Master Template | `AvaB-Template-v1.0.dotx` | 1.0 | Tất cả DOCX documents |
| AvaB Lesson Template | `AvaB-Lesson-v1.0.dotx` | 1.0 | Lesson plans, Theory |
| AvaB Worksheet Template | `AvaB-Worksheet-v1.0.dotx` | 1.0 | Phiếu học tập |
| AvaB Assessment Template | `AvaB-Assessment-v1.0.dotx` | 1.0 | Bài kiểm tra |
| AvaB Teacher Guide Template | `AvaB-TeacherGuide-v1.0.dotx` | 1.0 | Hướng dẫn giáo viên |
| AvaB Parent Report Template | `AvaB-ParentReport-v1.0.dotx` | 1.0 | Báo cáo phụ huynh |
| AvaB Certificate Template | `AvaB-Certificate-v1.0.dotx` | 1.0 | Chứng chỉ hoàn thành |
| AvaB Slide Master | `AvaB-Slide-v1.0.potx` | 1.0 | Tất cả PPTX presentations |
| AvaB Video Script Template | `AvaB-Script-v1.0.md` | 1.0 | Video scripts (Markdown) |

## A.2 Template Location

Internal: `https://internal.avab.vn/templates/`
Content team shared drive: `AvaB Team > Resources > Templates`

**MUST** luôn download template mới nhất trước khi tạo nội dung.

---

---

# Phụ lục B — Brand Assets Reference

## B.1 Logo Variants

| Variant | File | Usage |
|---------|------|-------|
| Full logo (purple) | `avab-logo-full-purple.svg` | Light backgrounds, print |
| Full logo (white) | `avab-logo-full-white.svg` | Dark backgrounds |
| Icon only | `avab-icon.svg` | Favicon, small spaces |
| Horizontal | `avab-logo-horizontal.svg` | Headers, banners |

## B.2 Typography

| Font | Weights | License |
|------|---------|---------|
| Be Vietnam Pro | 300, 400, 500, 600, 700 | OFL (Google Fonts) |
| JetBrains Mono | 400, 700 | OFL (Google Fonts) |

**Download:** Google Fonts CDN hoặc internal font server: `fonts.avab.vn`

## B.3 Color Palette (Full)

```css
/* AvaB Design Tokens */
:root {
  /* Primary */
  --avab-purple-50:  #F5F3FF;
  --avab-purple-100: #EDE9FE;
  --avab-purple-200: #DDD6FE;
  --avab-purple-300: #C4B5FD;
  --avab-purple-400: #A78BFA;
  --avab-purple-500: #8B5CF6;
  --avab-purple-600: #7C3AED;  /* PRIMARY */
  --avab-purple-700: #6D28D9;
  --avab-purple-800: #5B21B6;
  --avab-purple-900: #4C1D95;

  /* Teal */
  --avab-teal-400:   #2DD4BF;
  --avab-teal-500:   #14B8A6;  /* SECONDARY */
  --avab-teal-600:   #0D9488;

  /* Semantic */
  --avab-success:    #10B981;
  --avab-warning:    #F59E0B;
  --avab-error:      #EF4444;
  --avab-info:       #3B82F6;

  /* Neutral */
  --avab-gray-50:    #F9FAFB;
  --avab-gray-100:   #F3F4F6;
  --avab-gray-500:   #6B7280;
  --avab-gray-900:   #111827;
}
```

## B.4 Mascot & Illustrations

| Asset | File | Notes |
|-------|------|-------|
| AvaBot (main mascot) | `avabot-*.svg` | Multiple poses available |
| Subject icons | `icon-[subject].svg` | MATH, VAN, ENG, TIN, STEM |
| Grade illustrations | `grade-[1-12].svg` | Per-grade themed |
| Emotion set | `emotion-*.svg` | Happy, thinking, celebrate, oops |

**Location:** `https://assets.avab.vn/brand/`

---

---

# Phụ lục C — Approved Third-party Tools

## C.1 Content Creation Tools

| Tool | Usage | License Type | Notes |
|------|-------|-------------|-------|
| Microsoft Word 365 | DOCX authoring | Subscription | Preferred DOCX tool |
| Google Docs | Collaborative editing | Subscription | Export to DOCX for final |
| Canva for Education | Graphics, worksheets | Subscription | Use AvaB brand kit |
| Figma | UI design, wireframes | Subscription | Design team only |
| Adobe Acrobat Pro | PDF editing, security | Subscription | PDF/UA check |

## C.2 Video Production Tools

| Tool | Usage | License Type | Notes |
|------|-------|-------------|-------|
| OBS Studio | Screen recording | Free/Open Source | For Tin học content |
| DaVinci Resolve | Video editing | Free tier available | Primary editor |
| Descript | Transcript + editing | Subscription | Voiceover editing |
| ElevenLabs | AI TTS voiceover | Subscription | Approved voices only |
| Audacity | Audio cleanup | Free/Open Source | Noise reduction |

## C.3 QA & Accessibility Tools

| Tool | Usage | License Type | Notes |
|------|-------|-------------|-------|
| axe DevTools | WCAG accessibility scan | Subscription | Browser extension |
| WAVE | Web accessibility evaluation | Free | Online tool |
| Colour Contrast Analyser | Contrast checking | Free | Desktop app |
| Adobe Acrobat | PDF accessibility check | Subscription | Built-in accessibility checker |
| Google Lighthouse | Web performance audit | Free | Chrome DevTools |
| W3C Validator | HTML validation | Free | validator.w3.org |

## C.4 AI Tools (Approved for Specific Use)

| Tool | Approved Usage | MUST NOT Use For |
|------|---------------|-----------------|
| ChatGPT / Claude | Draft generation, grammar check | Final content without human review |
| ElevenLabs TTS | Voiceover (approved voices) | Student-facing voiceover without QA |
| Midjourney / DALL-E | Illustration ideation | Final published illustrations (must be vetted) |
| DeepL | Translation assistance | Final translation (must have human review) |

**MUST:** Tất cả AI-generated content phải qua Human Review trước khi publish.
**MUST NOT:** Dùng AI tools chưa được phê duyệt trong danh sách này.

---

---

## Anti-patterns — Những Điều PHẢI TRÁNH

### ❌ Document Anti-patterns

| Anti-pattern | Vấn đề | Giải pháp |
|-------------|--------|-----------|
| Screenshot text thay text thực | Không accessible, không searchable | Dùng text thực + formatting |
| Màu tối làm background text | Tốn mực, contrast kém | Dùng borders thay fills |
| Font size < 11pt | Không đọc được | Min 12pt body, 10pt captions |
| Hình ảnh không có alt text | Blind users không tiếp cận được | Thêm alt text mô tả rõ ràng |
| File name tiếng Việt có dấu | Lỗi trên các hệ thống | Dùng naming convention đúng |

### ❌ Video Anti-patterns

| Anti-pattern | Vấn đề | Giải pháp |
|-------------|--------|-----------|
| Video >15 min không có break | Học sinh mất tập trung | Chia segments, thêm interaction |
| Âm thanh tiếng ồn nền | Khó nghe, mất tập trung | Record trong phòng cách âm |
| Không có captions | Không accessible | Thêm SRT/VTT file |
| Thumbnail không rõ ràng | Click-through rate thấp | Bright, clear, ≤6 words |
| Animation phức tạp | Gây phân tâm | Chỉ dùng "Appear" animation |

### ❌ Web Anti-patterns

| Anti-pattern | Vấn đề | Giải pháp |
|-------------|--------|-----------|
| Auto-play video | Disruptive UX | Require user interaction |
| Render-blocking scripts | Trang load chậm | Defer/async scripts |
| `<div>` cho layout chính | Không semantic | Dùng HTML5 elements |
| Hình ảnh không có kích thước | CLS score xấu | Luôn set width/height |
| CSS absolute pixel sizes | Break khi zoom | Dùng rem/em units |

### ❌ Process Anti-patterns

| Anti-pattern | Vấn đề | Giải pháp |
|-------------|--------|-----------|
| Publish không qua Auto QA | Lỗi cơ bản qua production | Auto QA là bắt buộc |
| Publish không có human review | Sai kiến thức, sai pedagogy | Human review bắt buộc |
| Không có changelog | Không track được thay đổi | CHANGELOG.md bắt buộc |
| Overwrite file thay vì versioning | Mất lịch sử, không rollback được | Semantic versioning bắt buộc |
| AI content không qua review | Sai thực tế, bias | Mọi AI content phải human-reviewed |

---

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-04 | AvaB Content Team | Initial release |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Content Director | — | 2026-07-04 | Pending |
| Tech Lead | — | 2026-07-04 | Pending |
| Academic Lead | — | 2026-07-04 | Pending |

---

> **AvaB Publishing Standard v1.0**
> © 2026 AvaB Education. Internal document — do not distribute externally.
> Document ID: AvaB-STD-PUB-001 | Next review: 2027-01-01
