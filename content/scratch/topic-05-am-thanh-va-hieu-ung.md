# Chuyên đề 5: Âm Thanh Và Hiệu Ứng

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Phát âm thanh trong Scratch bằng các block Sound
- Điều chỉnh âm lượng và thêm nhạc nền cho dự án
- Khám phá thư viện âm thanh của Scratch
- Ghi âm và thêm âm thanh tùy chỉnh vào dự án
- Tạo dự án kết hợp âm thanh với hình ảnh sinh động

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `play sound [Meow] until done` | Sound | Phát âm thanh và chờ kết thúc |
| `start sound [Meow]` | Sound | Phát âm thanh (không chờ) |
| `stop all sounds` | Sound | Dừng tất cả âm thanh |
| `change volume by [-10]` | Sound | Tăng/giảm âm lượng |
| `set volume to [100]%` | Sound | Đặt âm lượng cụ thể |
| `volume` | Sound | Giá trị âm lượng hiện tại |
| `change [pitch] effect by [10]` | Sound | Đổi cao độ giọng |
| `set [pitch] effect to [0]` | Sound | Đặt cao độ cụ thể |
| `clear sound effects` | Sound | Xóa hiệu ứng âm thanh |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Sound | Âm thanh |
| Volume | Âm lượng |
| Pitch | Cao độ / Tone giọng |
| Loop | Lặp lại (nhạc) |
| Background music | Nhạc nền |
| Sound effect | Hiệu ứng âm thanh |
| Record | Ghi âm |
| Instrument | Nhạc cụ |
| Tempo | Tốc độ nhạc |
| Mute | Tắt tiếng |

---

## 🎬 Project mẫu (mô tả)

**"Buổi Hoà Nhạc Của Các Con Vật"**

Sân khấu là sân khấu biểu diễn. Có 4 nhân vật: Mèo, Chó, Vịt, Ếch.

- Khi nhấn **cờ xanh**: Nhạc nền vui vẻ (Cheer) bắt đầu phát liên tục
- Mèo giới thiệu: *"Chào mừng đến buổi hòa nhạc!"*
- Nhấn **phím 1**: Mèo hát (phát âm thanh Meow + hiệu ứng pitch cao)
- Nhấn **phím 2**: Chó sủa (phát âm thanh Bark)
- Nhấn **phím 3**: Vịt kêu quạc quạc (phát âm thanh Duck)
- Nhấn **phím 4**: Ếch kêu (phát âm thanh Frog)
- Nhấn **Space**: Tất cả cùng biểu diễn, âm lượng tăng dần
- Nhấn **M**: Tắt/bật tiếng (Mute)

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🎵 **Trò chơi "Nhạc Cụ Cơ Thể":**
- Giáo viên bắt đầu vỗ tay theo nhịp
- Học sinh thêm giậm chân
- Thêm tiếng "thụp" bằng miệng
- Tạo bản nhạc từ cơ thể người!
- Hỏi: *"Trong Scratch, mình có thể thêm âm thanh như thế này không?"*

### Xem sản phẩm mẫu (5 phút)

Chiếu dự án "Buổi Hoà Nhạc Của Các Con Vật":
- Chạy và nhấn từng phím
- Hỏi: *"Âm thanh nào nghe vui nhất? Có nhạc nền không?"*
- Mở tab **Sounds** để học sinh thấy danh sách âm thanh

### Học block mới (10 phút)

**Phần 1 — Khám phá thư viện âm thanh:**
```
→ Nhấn vào Sprite
→ Chọn tab "Sounds" (góc trên bên trái)
→ Nhấn biểu tượng loa (+) để thêm âm thanh
→ Duyệt qua các danh mục: Animals, Effects, Music, People...
```

**Demo sự khác biệt quan trọng:**
```
play sound [Meow] until done  ← Script DỪNG lại chờ âm thanh hết
start sound [Meow]            ← Script TIẾP TỤC chạy ngay lập tức

→ Demo: Kết hợp start sound + move → nhân vật vừa đi vừa kêu
→ Demo: play until done → nhân vật kêu xong mới đi
```

**Phần 2 — Volume và Pitch:**
```
set volume to (100)%
say [To nhất!] for (1) seconds
set volume to (50)%
say [Vừa phải!] for (1) seconds
set volume to (10)%
say [Thì thầm...] for (1) seconds

change [pitch] effect by (50)  → Giọng cao vít
change [pitch] effect by (-50) → Giọng trầm như gấu
clear sound effects             → Trở về bình thường
```

**Phần 3 — Nhạc nền liên tục:**
```
→ Nhân vật nền (vô hình): set size to (1)%
  when green flag clicked
  forever
    play sound [Dance Around] until done  ← Lặp lại mãi mãi
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Bàn Phím Âm Nhạc":**

```
Chọn 5 Sprite hình nốt nhạc hoặc nhạc cụ (hoặc vẽ)
Đặt thành hàng ngang: Do Re Mi Fa Sol

Mỗi nhân vật (ví dụ Sprite1 = Đô):
  when this sprite clicked
  change [pitch] effect to (0)   ← Âm Đô
  play sound [Piano C] until done
  say [Đô! 🎵] for (0.5) seconds

Sprite2 = Rê:
  when this sprite clicked
  change [pitch] effect to (10)  ← Âm Rê
  play sound [Piano C] until done
  say [Rê! 🎵] for (0.5) seconds

(và cứ thế cho Mi, Fa, Sol)

Nhân vật MC (giáo viên robot):
  when green flag clicked
  say [Nhấp vào nốt nhạc để chơi đàn!] for (3) seconds
  say [Thử tạo một giai điệu nào!] for (3) seconds
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách âm nhạc:**
- **Ghi âm giọng của bạn:** Tab Sounds → Nhấn nút ghi âm (microphone) → Nói một câu → Lưu → Dùng trong dự án
- **Nhạc nền biến đổi:** Dùng `change volume by (-5)` trong `forever` để nhạc nhỏ dần khi chơi xong
- **Hiệu ứng rùng rợn:** Dùng pitch rất thấp + ghost effect cho nhân vật ma

### Nộp & Nhận xét (5 phút)

- Học sinh nhấp vào bàn phím âm nhạc của nhau và "chơi" một giai điệu nhỏ
- Hỏi: *"Giai điệu của bạn là bài gì? Bạn đã tạo ra nó như thế nào?"*
- Ai tự ghi âm giọng mình lên chia sẻ!

---

## 🚀 Project học sinh tự làm

**"Studio Âm Nhạc Của Tôi"**

Tạo dự án nhạc tương tác:
1. Có ít nhất **5 nhạc cụ/âm thanh** khác nhau, mỗi cái gắn với 1 nhân vật
2. Nhấp vào nhân vật → phát âm thanh + hiệu ứng hình ảnh (đổi màu, to lên...)
3. Có **nhạc nền** chạy liên tục
4. Có nút **"Tắt nhạc"** (nhân vật hình nút tròn) → `stop all sounds`
5. Bonus: Ghi âm giọng mình và thêm vào một nhân vật

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Không nghe thấy âm thanh | Máy tính tắt tiếng hoặc volume = 0 | Kiểm tra volume máy tính; kiểm tra block `set volume to (100)%` |
| Âm thanh chạy chậm, giật | Nhiều âm thanh phát cùng lúc | Thêm `stop all sounds` trước khi phát âm thanh mới |
| Nhạc nền phát 1 lần rồi thôi | Dùng `start sound` thay vì `forever` + `play until done` | Dùng `forever { play sound [X] until done }` để lặp |
| Âm thanh quá to che mất âm thanh khác | Volume của nhạc nền quá cao | Giảm volume nhạc nền xuống 30-50% |
| Pitch effect không hoạt động | Clear effects đã xóa pitch | Đặt lại pitch trước khi phát âm thanh |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Khám phá:** Nghe qua tất cả âm thanh trong thư viện Scratch. Chọn 10 âm thanh yêu thích và ghi lại tên chúng và dùng chúng vào việc gì.

2. **Bài 2 — Ghi âm:** Ghi âm giọng đọc một câu thơ ngắn (hoặc bài hát yêu thích). Tạo dự án Scratch trong đó nhấp vào nhân vật sẽ nghe được giọng của bạn.

3. **Bài 3 — Câu chuyện có âm thanh:** Chỉnh sửa dự án câu chuyện từ chuyên đề 3 hoặc 4, thêm âm thanh phù hợp vào mỗi sự kiện (nhân vật xuất hiện có nhạc, nhân vật nói có âm thanh...).

4. **Bài 4 — Hiệu ứng pitch:** Tạo dự án trong đó 1 nhân vật nói 1 câu với 5 tone giọng khác nhau (pitch từ -50 đến +50). Nghe và mô tả sự khác biệt.

5. **Bài 5 — Sáng tác:** Tạo một bài nhạc ngắn (8-16 nốt) bằng cách nhấp vào các nhân vật theo thứ tự. Ghi lại thứ tự nhấp để tạo ra giai điệu đó.

---

## 🏅 Huy hiệu hoàn thành

> 🎵 **"Nhạc Sĩ Scratch"**
>
> Học sinh đã biết thêm và điều chỉnh âm thanh trong Scratch như một nhạc sĩ thực thụ!
> Thành thạo `play sound`, `start sound`, `set volume`, `pitch effect`, và nhạc nền liên tục.
>
> ⭐ Tiêu chí: Dự án có ít nhất 3 âm thanh khác nhau được kích hoạt bởi các sự kiện khác nhau, và có nhạc nền chạy liên tục.
