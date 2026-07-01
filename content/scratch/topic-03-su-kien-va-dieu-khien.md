# Chuyên đề 3: Sự Kiện Và Điều Khiển

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Hiểu khái niệm "sự kiện" — điều gì đó xảy ra kích hoạt hành động
- Sử dụng `when green flag clicked`, `when key pressed`, `when sprite clicked`
- Dùng `broadcast` và `when I receive` để nhân vật "nói chuyện" với nhau
- Tạo chương trình phản hồi theo phím bấm (điều khiển trò chơi)
- Xây dựng trò chơi đơn giản có tương tác với người chơi

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `when green flag clicked` | Events | Kích hoạt khi nhấn cờ xanh |
| `when [space] key pressed` | Events | Kích hoạt khi nhấn phím cụ thể |
| `when this sprite clicked` | Events | Kích hoạt khi nhấp chuột vào nhân vật |
| `when backdrop switches to [backdrop1]` | Events | Kích hoạt khi đổi phông nền |
| `broadcast [message1]` | Events | Gửi thông điệp đến tất cả nhân vật |
| `broadcast [message1] and wait` | Events | Gửi thông điệp và chờ xử lý xong |
| `when I receive [message1]` | Events | Nhận thông điệp và thực hiện hành động |
| `stop [all]` | Control | Dừng tất cả scripts |
| `stop [this script]` | Control | Dừng script hiện tại |
| `wait [1] seconds` | Control | Chờ N giây |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Event | Sự kiện |
| Trigger | Kích hoạt |
| Broadcast | Phát/Gửi thông điệp |
| Receive | Nhận |
| Message | Thông điệp |
| Key | Phím |
| Arrow keys | Phím mũi tên |
| Space bar | Phím cách |
| Click | Nhấp chuột |
| Interact | Tương tác |

---

## 🎬 Project mẫu (mô tả)

**"Cuộc Đối Thoại Thần Kỳ"**

Sân khấu có 2 nhân vật: Mèo (trái) và Chó (phải). Nền: Công viên.

- Khi nhấn **cờ xanh**: Mèo nói *"Ê Chó ơi! Tớ có tin vui!"*
- Mèo `broadcast` thông điệp "tin-vui"
- Chó `when I receive "tin-vui"` → Chó nói *"Thật hả? Tin gì vậy?"*
- Chó `broadcast` thông điệp "hoi-lai"
- Mèo `when I receive "hoi-lai"` → Mèo nói *"Chúng mình học Scratch hôm nay! 🎉"*
- Nhấn **phím Space**: Cả 2 nhảy lên vui mừng (glide lên rồi xuống)
- Nhấn **phím R**: Reset, bắt đầu lại từ đầu

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🎭 **Trò chơi "Điện Thoại Thần Kỳ":**
- Giáo viên thì thầm một câu vào tai học sinh A
- Học sinh A thì thầm vào tai học sinh B
- Học sinh B nói to câu đó
- Hỏi: *"Điều này giống gì trong Scratch?"* → Giống `broadcast` và `receive`!
- Giải thích: `broadcast` là "gửi tin", `when I receive` là "nhận tin và làm theo"

### Xem sản phẩm mẫu (5 phút)

Chiếu dự án "Cuộc Đối Thoại Thần Kỳ":
- Chạy và hỏi: *"Tại sao Chó lại biết nói khi Mèo đã nói xong?"*
- Hỏi: *"Điều gì xảy ra khi bấm Space? Phím R?"*
- Mở "See Inside" để học sinh thấy nhiều `when green flag clicked` trên 2 nhân vật khác nhau

### Học block mới (10 phút)

**Phần 1 — Events cơ bản:**

```
Demo 1: when [space] key pressed → say [Bấm Space rồi!]
→ Nhấn Space nhiều lần, thấy nhân vật phản hồi ngay lập tức

Demo 2: when this sprite clicked → say [Ôi! Bấm vào tớ rồi!]
→ Nhấp chuột vào nhân vật

Demo 3: when [up arrow] key pressed → move (10) steps
        when [down arrow] key pressed → move (-10) steps
→ Dùng phím mũi tên điều khiển nhân vật
```

**Phần 2 — Broadcast:**

```
Nhân vật A:
  when green flag clicked
  say [Tớ gửi tín hiệu!] for (2) seconds
  broadcast [hello] ← Tạo thông điệp mới tên "hello"

Nhân vật B:
  when I receive [hello]
  say [Nhận được rồi! 📨] for (2) seconds
```

📌 **Giải thích:** `broadcast` như đài phát thanh, tất cả đều nghe nhưng chỉ ai có `when I receive` mới phản ứng!

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Trò Chơi Hỏi Đáp Đơn Giản":**

```
Nhân vật: Thầy giáo robot (Robot)
Nền: Lớp học (School)

Script của Robot:
  when green flag clicked
  say [Chào! Tớ là Robo-Thầy!] for (2) seconds
  say [Nhấn phím 1, 2, hoặc 3 để trả lời câu hỏi!] for (3) seconds
  say [Câu hỏi: Bầu trời màu gì?] for (4) seconds
  say [1=Đỏ  2=Xanh  3=Vàng] for (4) seconds

  when [1] key pressed
  say [Ồ không! Bầu trời không đỏ đâu bạn ơi!] for (3) seconds

  when [2] key pressed
  say [🎉 Đúng rồi! Bầu trời màu xanh!] for (3) seconds
  broadcast [correct-answer]

  when [3] key pressed
  say [Sai rồi bạn ơi, thử lại nhé!] for (3) seconds

Nhân vật thứ 2 (Ngôi sao bùng nổ):
  hide ← Ẩn lúc đầu
  when I receive [correct-answer]
  show
  play sound [Cheer] ← Tiếng hoan hô
  say [Xuất sắc! ⭐⭐⭐] for (3) seconds
  hide
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách:**
- Thêm câu hỏi thứ 2 (dùng `broadcast` "next-question")
- Tạo nhân vật phản ứng khi trả lời đúng và sai khác nhau
- Thêm điều khiển phím mũi tên để di chuyển một nhân vật trong khi nhân vật kia đứng yên

### Nộp & Nhận xét (5 phút)

- Demo dự án hỏi đáp cho cả lớp
- Hỏi bạn bên cạnh: *"Script của nhân vật A và nhân vật B kết nối với nhau như thế nào?"*

---

## 🚀 Project học sinh tự làm

**"Điều Khiển Nhân Vật Bằng Phím"**

Tạo dự án mini-game điều khiển:
1. Nhân vật di chuyển bằng 4 phím mũi tên (lên/xuống/trái/phải)
2. Nhấn **Space** → nhân vật nhảy lên (glide lên rồi xuống)
3. Nhấn **phím Z** → nhân vật nói câu gì đó
4. Nhân vật bật lại khi chạm mép (dùng `if on edge, bounce`)
5. Có ít nhất 1 nhân vật khác phản ứng khi nhận `broadcast`

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `broadcast` gửi nhưng nhân vật kia không phản ứng | Tên thông điệp khác nhau (chữ hoa/thường) | Kiểm tra tên thông điệp trong `broadcast` và `when I receive` phải giống hệt nhau |
| Nhấn phím nhưng cả 2 nhân vật đều phản ứng | Block `when key pressed` trên cả 2 nhân vật | Xóa block `when key pressed` ở nhân vật không cần phản ứng |
| Chương trình chạy quá nhanh, không kịp đọc | Thiếu `wait` | Thêm `wait [2] seconds` sau các câu `say` quan trọng |
| `broadcast and wait` làm chương trình đứng | Nhân vật nhận không kết thúc script | Đảm bảo script của nhân vật nhận có điểm kết thúc |
| Nhấn nhiều phím cùng lúc gây lộn | Nhiều Events cùng kích hoạt | Dùng biến `đang_di_chuyển` để khóa tạm (học sau ở chuyên đề 8) |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Phím điều khiển:** Tạo dự án dùng 4 phím mũi tên điều khiển một con tàu vũ trụ bay qua màn hình có nền vũ trụ.

2. **Bài 2 — Hỏi đáp:** Làm bài quiz 3 câu hỏi. Mỗi câu hỏi dùng phím 1/2/3 để trả lời. Nhân vật khen khi đúng và khuyến khích khi sai.

3. **Bài 3 — Truyện tương tác:** Tạo câu chuyện có 3 nhân vật, dùng `broadcast` để họ lần lượt nói chuyện với nhau (ít nhất 6 lượt thoại).

4. **Bài 4 — Nhấp chuột:** Làm dự án trong đó nhấp chuột vào từng nhân vật khác nhau sẽ hiển thị thông tin khác nhau (ví dụ: nhấp vào con chó → nó sủa, nhấp vào con mèo → nó kêu meo).

5. **Bài 5 — Sáng tạo:** Nghĩ ra một trò chơi đơn giản dùng phím bấm. Phác thảo ra giấy: nhân vật nào, phím nào làm gì, khi nào thắng/thua.

---

## 🏅 Huy hiệu hoàn thành

> 📡 **"Chuyên Gia Phát Sóng"**
>
> Học sinh đã biết cách dùng sự kiện và broadcast để các nhân vật giao tiếp với nhau!
> Nắm vững `when key pressed`, `broadcast`, và `when I receive`.
>
> ⭐ Tiêu chí: Dự án có ít nhất 2 nhân vật giao tiếp qua `broadcast`, và ít nhất 2 phím bấm có tác dụng khác nhau.
