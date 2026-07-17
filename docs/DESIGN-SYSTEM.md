# AvaB Adaptive Learning Design System

> Dark Cherry Master Brand × Adaptive Learning Experience

---

## 1. Kiến trúc nhận diện

**AvaB Adaptive Learning Design System** gồm 3 lớp:

### Lớp 1 — Master Brand
Nhận diện cốt lõi, xuất hiện trên mọi màn hình:
- Logo, App icon, Header, Footer
- Nút hành động chính, trạng thái được chọn
- Màn hình đăng nhập, tài liệu truyền thông

**Màu cốt lõi: AvaB Dark Cherry `#951F3D`**

### Lớp 2 — Experience Palette
Hệ màu theo trải nghiệm: bài học, thành tích, thử thách, AI, khoa học, lập trình, cảnh báo, hoàn thành.

### Lớp 3 — Age & Role Adaptation
Giao diện tự thay đổi theo: độ tuổi học sinh, vai trò người dùng, loại nhiệm vụ, thiết bị, mức độ phức tạp dữ liệu.

---

## 2. Bảng màu thương hiệu chính (Dark Cherry Scale)

| Token | Mã màu | Sử dụng |
|---|---|---|
| Cherry 50 | `#FFF7F9` | Nền rất nhạt, hover bg |
| Cherry 100 | `#FDECF0` | Nền chọn, selected bg |
| Cherry 200 | `#F9CCD6` | Viền nhẹ |
| Cherry 300 | `#EF9AAF` | Minh họa, accent |
| Cherry 400 | `#DC607D` | Điểm nhấn sáng |
| Cherry 500 | `#BE3659` | Secondary branding |
| **Cherry 600** | **`#951F3D`** | **Primary brand** |
| Cherry 700 | `#7B1933` | Hover |
| Cherry 800 | `#5F1227` | Sidebar, header đậm |
| Cherry 900 | `#400B19` | Footer, premium background |
| Cherry 950 | `#29050F` | Dark premium |

**Lý do giữ `#951F3D`:** đủ sâu để cao cấp, đủ đỏ để không già như Burgundy, sắc hồng nhẹ để thân thiện, phù hợp công nghệ giáo dục Việt Nam.

---

## 3. Hệ màu Learning Joy

| Tên | Mã màu | Ý nghĩa |
|---|---|---|
| AvaB Sky | `#4385F5` | Kiến thức, bài học |
| AvaB Mint | `#27A875` | Hoàn thành, tiến bộ |
| AvaB Sunshine | `#F4BD3C` | Thành tích, phần thưởng |
| AvaB Orange | `#F27A49` | Thử thách, hoạt động |
| AvaB Violet | `#8064D8` | AI, sáng tạo |
| AvaB Aqua | `#28A9A5` | Khoa học, khám phá |
| AvaB Coral | `#E85F65` | Năng lượng, tương tác |

**Nguyên tắc phân bổ màu mỗi màn hình:**
- 1 màu Dark Cherry (nhận diện)
- 1 màu nội dung chính (Learning Joy)
- 1 màu trạng thái (semantic)
- Nền trung tính

---

## 4. Thiết kế theo độ tuổi

### AvaB Kids — Lớp 1–2
- Tính cách: vui, an toàn, dễ hiểu, ít chữ, không gây áp lực
- Tỷ lệ màu: Dark Cherry 8–12% · Learning Joy 25–30% · Nền trắng/pastel 60–65%
- Card lớn, nút ≥48px, icon bo tròn, minh họa sinh động
- Tối đa 1 hành động chính/khối, có nhân vật hướng dẫn
- Tiến độ bằng hành trình, huy hiệu, bản đồ — không dùng bảng dữ liệu dài

### AvaB Junior — Lớp 3–5
- Sinh động nhưng ít "trẻ con" hơn
- Có thành tích, cấp độ, thử thách
- Dark Cherry ~12–18%
- Bảng xếp hạng không tạo áp lực tiêu cực
- Màu nhận diện theo môn học

### AvaB Teen — THCS
- Hiện đại, nhanh, cảm giác công nghệ, ít hoạt hình
- Dark Cherry ~18–22%
- Có dashboard cá nhân, mục tiêu, chuỗi học tập

### AvaB Pro — THPT
- Tinh gọn, tập trung kết quả
- Lịch học, mục tiêu, kỳ thi, hồ sơ năng lực
- Dark Cherry ~20–25%
- Giao diện gần sản phẩm năng suất cao cấp

---

## 5. Thiết kế theo vai trò

### Học sinh
> "Hôm nay em sẽ học gì và cần làm gì tiếp theo?"

Trang đầu: Tiếp tục học · Bài tập cần hoàn thành · Lịch học gần nhất · Thành tích vừa đạt · Gợi ý AI

### Phụ huynh
> "Con đang học thế nào và phụ huynh cần quan tâm điều gì?"

Ưu tiên: tiến độ · nhận xét · bài tập · lịch học · học phí · thông báo quan trọng

### Giáo viên
> "Hôm nay cần dạy, chấm và chuẩn bị gì?"

Ưu tiên: lớp sắp dạy · bài cần chấm · học sinh cần hỗ trợ · nội dung cần chuẩn bị · AI hỗ trợ tạo bài

### Admin & Nhà trường
> "Hệ thống đang vận hành thế nào và vấn đề nào cần xử lý?"

Ưu tiên: dữ liệu tổng quan · cảnh báo · người dùng · vận hành · doanh thu · báo cáo

> ⚠️ **Không dùng cùng một dashboard rồi chỉ thay tên vai trò.**

---

## 6. Mascot — Bụt Ava

**Vai trò:**
- Hướng dẫn đăng nhập lần đầu
- Khen khi hoàn thành, gợi ý khi làm sai
- Giải thích AI đang làm gì
- Dẫn dắt hành trình học tập
- Xuất hiện trong empty state và lỗi nhẹ

**Phong cách:** đầu và mắt rõ · hình khối đơn giản · chi tiết Dark Cherry · thân thiện nhưng không quá trẻ con · 8–12 trạng thái cảm xúc

**Không nên:** xuất hiện quá nhiều · nhảy liên tục · che nội dung · dùng giọng em bé · khen quá mức thao tác đơn giản

---

## 7. Màu theo môn học

| Môn | Màu |
|---|---|
| Toán | `#4385F5` |
| Tiếng Việt | `#D95B75` |
| Tiếng Anh | `#8064D8` |
| Tin học | `#28A9A5` |
| Khoa học | `#27A875` |
| Vật lý | `#3974C6` |
| Hóa học | `#16A0A5` |
| Sinh học | `#63A744` |
| Lịch sử | `#B77A3B` |
| Địa lý | `#32A18C` |
| Nghệ thuật | `#E665A4` |
| Kỹ năng sống | `#F27A49` |

Màu môn học chỉ dùng cho: icon · nhãn · đường viền · vùng tiêu đề nhẹ · biểu đồ. **Không dùng làm nền toàn trang.**

---

## 8. Gamification không gây áp lực

**Nên có:** hành trình học tập · huy hiệu kỹ năng · chuỗi hoàn thành · ngôi sao/XP · mở khóa nội dung · mục tiêu cá nhân · lời khen cụ thể

**Ví dụ lời khen đúng:** *"Em đã giải đúng 4 bài liên tiếp về phép cộng có nhớ."* (thay vì "Tuyệt vời!")

**Bảng xếp hạng 3 dạng:** tiến bộ cá nhân · nhóm/đội · bảng tùy chọn. Không công khai trẻ đứng cuối lâu dài.

---

## 9. Hệ thống minh họa

**Phong cách:** hình khối mềm · nét bo tròn · màu pastel neo bởi Dark Cherry · nhân vật Việt Nam · môi trường học hiện đại · ít chi tiết thừa

**3 cấp độ hình ảnh:**
- **Marketing:** ảnh thật, chất lượng cao, có cảm xúc
- **Product UI:** minh họa đơn giản, icon thống nhất
- **Kids Learning:** mascot, nhân vật, phản hồi trực quan

---

## 10. Motion Design

| Ngữ cảnh | Thời gian |
|---|---|
| Button phản hồi | 100–150ms |
| Card hover | 150–200ms |
| Chuyển trang | 200–280ms |
| Thành tích animation | 600–900ms |

**Motion signature AvaB:** vệt sáng Cherry chuyển nhẹ trái→phải khi hoàn tất nhiệm vụ.

Mascot chỉ chuyển động khi có ý nghĩa. Hỗ trợ `prefers-reduced-motion`.

---

## 11. Giọng điệu theo đối tượng

| Đối tượng | Phong cách |
|---|---|
| Trẻ nhỏ | Câu ngắn, 1 yêu cầu/lần, tích cực, không trách móc |
| Học sinh lớn | Trực tiếp, tôn trọng, không trẻ con hóa |
| Phụ huynh | Rõ ràng, có bằng chứng, không gây lo lắng thừa |
| Giáo viên | Nhanh, cụ thể, ưu tiên hành động |

---

## 12. Accessibility

- Body mobile tối thiểu **15–16px**
- Vùng bấm tối thiểu **44×44px**
- Không phân biệt trạng thái chỉ bằng màu
- Tương phản đạt chuẩn WCAG AA
- Điều hướng bàn phím + focus ring rõ
- Screen reader, video có phụ đề, công thức toán có alt text
- Không dùng animation chớp nhanh

---

## 13. Ba chế độ mật độ (Density Mode)

| Mode | Dành cho | Đặc điểm |
|---|---|---|
| **Comfortable** | Trẻ nhỏ, phụ huynh, mobile | Nhiều khoảng trắng, nút lớn |
| **Standard** | Học sinh lớn, giáo viên | Cân bằng thông tin/độ thoáng |
| **Compact** | Admin, tài chính, bảng dữ liệu | Nhiều thông tin, vẫn đọc được |

---

## 14. Design Tokens

```css
:root {
  /* AvaB Master Brand */
  --avab-cherry-50:  #FFF7F9;
  --avab-cherry-100: #FDECF0;
  --avab-cherry-200: #F9CCD6;
  --avab-cherry-300: #EF9AAF;
  --avab-cherry-400: #DC607D;
  --avab-cherry-500: #BE3659;
  --avab-cherry-600: #951F3D;  /* PRIMARY */
  --avab-cherry-700: #7B1933;
  --avab-cherry-800: #5F1227;
  --avab-cherry-900: #400B19;
  --avab-cherry-950: #29050F;

  /* Learning Joy */
  --avab-sky:      #4385F5;
  --avab-mint:     #27A875;
  --avab-sunshine: #F4BD3C;
  --avab-orange:   #F27A49;
  --avab-violet:   #8064D8;
  --avab-aqua:     #28A9A5;
  --avab-coral:    #E85F65;

  /* Neutral */
  --avab-text-primary:   #211A1D;
  --avab-text-secondary: #655D61;
  --avab-text-muted:     #958C90;
  --avab-border:         #DDD7DA;
  --avab-surface-soft:   #F7F5F6;
  --avab-surface:        #FFFFFF;

  /* Semantic */
  --avab-success: #18825B;
  --avab-warning: #B86A00;
  --avab-error:   #C53A49;
  --avab-info:    #3475CB;
  --avab-ai:      #7458C6;

  /* Interaction */
  --avab-focus-ring:   rgba(149, 31, 61, 0.20);
  --avab-selected-bg:  #FDECF0;
  --avab-hover-bg:     #FFF7F9;

  /* Shape */
  --avab-radius-control: 10px;
  --avab-radius-card:    16px;
  --avab-radius-modal:   20px;
  --avab-radius-banner:  24px;

  /* Motion */
  --avab-motion-fast:   120ms;
  --avab-motion-normal: 200ms;
  --avab-motion-slow:   280ms;
}
```

---

## 15. Mẫu phân bổ màu — Dashboard học sinh nhỏ

- Nền: trắng hoặc `#FFF7F9`
- Logo + active nav: Dark Cherry
- Card "Tiếp tục học": Sky Blue nhạt
- Thành tích: Sunshine
- Hoàn thành: Mint
- AI: Violet
- Nút chính: Dark Cherry
- Mascot: chi tiết Cherry

---

## 16. Tiêu chí đạt mức xuất sắc

| Đối tượng | Kiểm tra |
|---|---|
| Nhận diện | Nhìn một phần UI chưa có logo vẫn nhận ra AvaB |
| Trẻ nhỏ | Biết ngay: bấm đâu, học phần nào, đúng/sai, bước tiếp |
| Phụ huynh | Trong 10 giây biết: con học thế nào, có việc gì cần xử lý |
| Giáo viên | Trong 10 giây biết: lớp tiếp theo, bài cần chấm, HS cần hỗ trợ |
| Admin | Quản lý dữ liệu lớn mà giao diện không quá màu sắc/trẻ con |

---

## 17. Kết luận

> Phiên bản tốt nhất của AvaB không phải là một giao diện Dark Cherry phủ toàn hệ thống.

**Cấu trúc thương hiệu chốt:**

```
AvaB Dark Cherry Master Brand
         ×
AvaB Adaptive Learning Experience
```

- **Dark Cherry** → bản sắc và niềm tin
- **Learning Joy** → hứng thú và cảm xúc
- **Adaptive UI** → phù hợp với từng người dùng

AvaB đồng thời: cao cấp với nhà trường · đáng tin với phụ huynh · hiệu quả với giáo viên · hiện đại với học sinh lớn · vui và hấp dẫn với trẻ nhỏ.
