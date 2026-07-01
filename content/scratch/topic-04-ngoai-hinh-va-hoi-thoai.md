# Chuyên đề 4: Ngoại Hình Và Hội Thoại

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Sử dụng `say` và `think` để tạo hội thoại cho nhân vật
- Chuyển đổi trang phục (Costume) để tạo hiệu ứng hoạt hình
- Ẩn/hiện nhân vật với `show` và `hide`
- Thay đổi kích thước nhân vật với `set size`
- Tạo một hoạt hình ngắn có nhân vật thay đổi ngoại hình

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `say [Hello!] for [2] seconds` | Looks | Nói và tự động tắt sau N giây |
| `say [Hello!]` | Looks | Nói và giữ mãi cho đến khi lệnh khác |
| `think [Hmm...] for [2] seconds` | Looks | Nghĩ (bong bóng suy nghĩ) |
| `think [Hmm...]` | Looks | Nghĩ và giữ mãi |
| `switch costume to [costume1]` | Looks | Đổi sang trang phục cụ thể |
| `next costume` | Looks | Chuyển sang trang phục tiếp theo |
| `show` | Looks | Hiện nhân vật |
| `hide` | Looks | Ẩn nhân vật |
| `set size to [100]%` | Looks | Đặt kích thước nhân vật (%) |
| `change size by [10]` | Looks | Tăng/giảm kích thước |
| `set [color] effect to [0]` | Looks | Thêm hiệu ứng màu sắc |
| `change [color] effect by [25]` | Looks | Thay đổi hiệu ứng màu từ từ |
| `clear graphic effects` | Looks | Xóa tất cả hiệu ứng |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Costume | Trang phục / Hình dáng |
| Appearance | Ngoại hình |
| Size | Kích thước |
| Show | Hiện ra |
| Hide | Ẩn đi |
| Effect | Hiệu ứng |
| Color effect | Hiệu ứng màu sắc |
| Speech bubble | Bong bóng thoại |
| Thought bubble | Bong bóng suy nghĩ |
| Animation | Hoạt hình |

---

## 🎬 Project mẫu (mô tả)

**"Biến Hình Siêu Nhân"**

Nhân vật ban đầu là một em nhỏ bình thường (costume 1). Khi nhấn cờ xanh:
1. Em nhỏ suy nghĩ: *"Hmm... hôm nay tớ muốn là siêu nhân!"*
2. Nhân vật to dần lên (change size by 20, lặp 5 lần)
3. Nhấp nháy màu sắc (change color effect)
4. Chuyển costume sang siêu nhân (switch costume to costume2)
5. Nói: *"BIẾN HÌNH! ⚡ Tôi là Siêu Nhân Scratch!"*
6. Nhấn **Space** → biến trở lại thành em nhỏ

Dự án cho thấy sức mạnh của việc kết hợp costume + hiệu ứng.

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🎭 **Trò chơi "Bắt Chước":**
- Giáo viên đứng trước lớp và thay đổi biểu cảm: vui → buồn → ngạc nhiên → tức giận
- Học sinh đoán cảm xúc
- Hỏi: *"Trong hoạt hình, người ta làm nhân vật thay đổi cảm xúc bằng cách nào?"*
- Giới thiệu: **Costume** là cách Scratch đổi "bộ mặt" của nhân vật!

🖼️ Cho xem một đoạn hoạt hình ngắn, hỏi: *"Nhân vật thay đổi ngoại hình bao nhiêu lần?"*

### Xem sản phẩm mẫu (5 phút)

Chiếu dự án "Biến Hình Siêu Nhân":
- Chạy dự án từng bước chậm
- Hỏi: *"Điều gì khiến nhân vật trông khác đi?"*
- Mở Costumes tab: *"Đây là nơi chứa tất cả trang phục của nhân vật!"*

### Học block mới (10 phút)

**Phần 1 — Say vs Think:**
```
Demo 1: say [Tớ nói ra tiếng!] for (3) seconds
Demo 2: think [Tớ đang nghĩ trong đầu...] for (3) seconds
→ Chỉ ra sự khác biệt: bong bóng thoại vs bong bóng suy nghĩ
```

**Phần 2 — Costume:**
```
Demo: Chọn Sprite "Avery" (có nhiều costume)
→ Mở tab Costumes → Giải thích mỗi costume là 1 hình ảnh

next costume → Nhấn nhiều lần, thấy nhân vật "đi bộ"
switch costume to [avery-a] → Nhảy thẳng đến costume cụ thể
```

**Phần 3 — Show/Hide và Size:**
```
hide → Nhân vật biến mất
show → Xuất hiện lại

set size to (50)% → Thu nhỏ còn nửa
set size to (200)% → Phóng to gấp đôi
change size by (10) → Từ từ to hơn
```

**Phần 4 — Hiệu ứng màu:**
```
change [color] effect by (25) → Đổi màu
change [whirl] effect by (30) → Xoáy
clear graphic effects → Xóa hiệu ứng
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Nhân Vật Cảm Xúc":**

```
Chọn Sprite có nhiều costume (ví dụ: Abby, Casey, Avery)
Nền: Phòng khách hoặc trường học

Script:
  when green flag clicked
  set size to (100)%
  clear graphic effects
  switch costume to [costume-vui]    ← Costume mặt vui
  say [Xin chào! Tớ đang rất vui!] for (3) seconds

  when [1] key pressed
  switch costume to [costume-buon]
  say [Hôm nay tớ buồn quá...] for (3) seconds
  change [color] effect by (20)

  when [2] key pressed
  switch costume to [costume-ngac-nhien]
  say [Ồ! Bất ngờ quá! 😲] for (3) seconds
  change [whirl] effect by (50)

  when [3] key pressed
  switch costume to [costume-vui]
  say [Vui lại rồi! 😊] for (3) seconds
  clear graphic effects

  when [s] key pressed
  hide
  wait (1) seconds
  show
  say [Tớ biến mất và xuất hiện lại!] for (2) seconds
```

*Gợi ý: Vào tab Costumes và vẽ thêm biểu cảm khác nhau!*

### Sáng tạo thêm (10 phút)

🌟 **Thử thách "Biến Hình Thực Sự":**
- Vào tab **Costumes**, nhấn "Paint" để vẽ trang phục mới
- Vẽ thêm 1-2 trang phục với màu sắc khác nhau
- Dùng `next costume` trong vòng lặp để tạo hiệu ứng nhấp nháy
- Thêm nhân vật xuất hiện dần (bắt đầu ẩn, từ từ `show` + `change size`)

### Nộp & Nhận xét (5 phút)

- Học sinh demo dự án "Nhân Vật Cảm Xúc"
- Hỏi: *"Bạn dùng bao nhiêu costume? Phím nào làm gì?"*
- Cả lớp nhận xét: *"Biểu cảm nào trông thú vị nhất?"*

---

## 🚀 Project học sinh tự làm

**"Câu Chuyện Hoạt Hình 3 Cảnh"**

Tạo hoạt hình ngắn với:
1. **Cảnh 1** (nền A): Nhân vật xuất hiện từ nhỏ → to dần, nói câu mở đầu
2. **Cảnh 2** (nền B): Nhân vật thay đổi costume (đổi trang phục/cảm xúc), đối thoại với nhân vật 2
3. **Cảnh 3** (nền C): Nhân vật nói câu kết, thu nhỏ dần và ẩn đi

**Yêu cầu tối thiểu:**
- Ít nhất 2 nhân vật
- Ít nhất 2 costume khác nhau cho nhân vật chính
- Có `say` và `think` xen kẽ
- Có sử dụng `show`/`hide`

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Nhân vật biến mất và không xuất hiện lại | Dùng `hide` nhưng quên `show` | Thêm `show` hoặc thêm `show` vào đầu script `when green flag clicked` |
| Costume đổi nhưng không thấy thay đổi | Sprite chỉ có 1 costume | Thêm costume mới trong tab Costumes |
| `say` và `think` xuất hiện cùng lúc | Chạy cùng lúc | Dùng `say` trước, `wait` rồi `think`, hoặc dùng `say for X seconds` |
| Nhân vật quá to/quá nhỏ | Set size sai | Thêm `set size to (100)%` ở đầu script khi nhấn cờ xanh |
| Hiệu ứng màu không xóa được | Quên `clear graphic effects` | Thêm `clear graphic effects` vào đầu script reset |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Diễn xuất:** Chọn nhân vật có ít nhất 4 costume. Tạo script để mỗi phím số (1-4) chuyển sang một costume khác và nói câu phù hợp với cảm xúc đó.

2. **Bài 2 — Vẽ costume:** Vào tab Costumes, vẽ thêm ít nhất 2 costume mới cho nhân vật (dùng công cụ vẽ của Scratch). Tạo hoạt hình với các costume này.

3. **Bài 3 — Xuất hiện ấn tượng:** Tạo hiệu ứng nhân vật xuất hiện ấn tượng: bắt đầu ẩn ở vị trí ngẫu nhiên → `show` → to dần từ 10% lên 100% → nói câu chào.

4. **Bài 4 — Kịch bản:** Viết ra giấy kịch bản hoạt hình ngắn (3-5 cảnh) với 2 nhân vật. Mô tả costume, vị trí, và câu thoại của mỗi nhân vật trong mỗi cảnh.

5. **Bài 5 — Thử nghiệm hiệu ứng:** Thử tất cả các hiệu ứng trong block `set [effect] to` (color, fisheye, whirl, pixelate, mosaic, brightness, ghost). Chụp màn hình kết quả thú vị nhất.

---

## 🏅 Huy hiệu hoàn thành

> 🎭 **"Diễn Viên Nhí"**
>
> Học sinh đã biết tạo nhân vật có biểu cảm phong phú với nhiều costume và hiệu ứng!
> Thành thạo `say`, `think`, `switch costume`, `show/hide`, và `set size`.
>
> ⭐ Tiêu chí: Dự án có nhân vật thay đổi ít nhất 3 costume khác nhau, sử dụng cả `say` và `think`, và có hiệu ứng show/hide.
