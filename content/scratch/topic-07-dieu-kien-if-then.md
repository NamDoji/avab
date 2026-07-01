# Chuyên đề 7: Điều Kiện If/Then

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Hiểu khái niệm điều kiện — "Nếu... thì..."
- Sử dụng block `if <condition> then` để tạo quyết định
- Dùng `if <condition> then... else...` để xử lý 2 trường hợp
- Kiểm tra va chạm với `touching`, `touching color`, `key pressed`
- Tạo game có logic: thắng/thua, va chạm kẻ thù, nhặt vật phẩm

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `if <condition> then` | Control | Nếu điều kiện đúng thì thực hiện |
| `if <condition> then... else` | Control | Nếu đúng thì làm A, sai thì làm B |
| `<touching [Sprite]?>` | Sensing | Kiểm tra có chạm nhân vật không |
| `<touching color [color]?>` | Sensing | Kiểm tra có chạm màu không |
| `<color [color] is touching [color]?>` | Sensing | Kiểm tra 2 màu chạm nhau |
| `<key [space] pressed?>` | Sensing | Kiểm tra phím đang bấm |
| `<mouse down?>` | Sensing | Kiểm tra chuột đang nhấn |
| `<[distance] to [Sprite]>` | Sensing | Khoảng cách đến nhân vật |
| `<touching [edge]?>` | Sensing | Kiểm tra chạm mép màn hình |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Condition | Điều kiện |
| If/Then | Nếu/Thì |
| Else | Nếu không |
| True / False | Đúng / Sai |
| Boolean | Giá trị đúng/sai |
| Sensing | Cảm biến |
| Touching | Chạm vào |
| Collision | Va chạm |
| Detection | Phát hiện |
| Logic | Lô-gic |

---

## 🎬 Project mẫu (mô tả)

**"Tránh Bom! 💣"**

Mini-game đơn giản: Nhân vật phi hành gia di chuyển bằng phím mũi tên. Bom rơi từ trên xuống theo đường ngẫu nhiên.

**Logic game:**
- **Nếu** phi hành gia chạm bom → **Thì** nói "BOOM! 💥" + phát âm thanh nổ + game over
- **Nếu** bom chạm mép dưới → **Thì** reset vị trí bom lên trên
- **Nếu** phi hành gia chạm ngôi sao (vật phẩm) → **Thì** cộng điểm + ẩn sao
- **Nếu** phi hành gia ở nửa trái màn hình → **Thì** mặt nhìn trái; **Không thì** mặt nhìn phải

Dự án minh họa cách `if/else` tạo ra trò chơi có logic thực sự.

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🤔 **Trò chơi "Nếu... Thì...":**
- Giáo viên đọc điều kiện, học sinh thực hiện:
  - *"Nếu bạn mặc áo đỏ → giơ tay phải"*
  - *"Nếu bạn thích ăn kem → đứng lên"*
  - *"Nếu hôm nay là thứ Hai → vỗ tay; Nếu không → giậm chân"*
- Giải thích: Trong Scratch, máy tính cũng ra quyết định theo cách này!

### Xem sản phẩm mẫu (5 phút)

Chiếu game "Tránh Bom!":
- Chơi demo trực tiếp trước lớp
- Hỏi: *"Điều gì xảy ra khi phi hành gia chạm bom? Tại sao bom lại tự reset?"*
- Mở code: *"Đây là các block `if/then` tạo ra những quy tắc đó!"*

### Học block mới (10 phút)

**Phần 1 — `if then` cơ bản:**
```
Demo: Mèo bị nhấp chuột

forever
  if <touching [mouse pointer]?> then
    say [Ôi! Đừng chạm tớ!] for (1) seconds
    change [color] effect by (25)

→ Chỉ nói khi bị chạm, không nói khi không chạm
```

**Phần 2 — `if then else` (2 trường hợp):**
```
forever
  if <key [right arrow] pressed?> then
    point in direction (90)
    move (5) steps
  else
    if <key [left arrow] pressed?> then
      point in direction (-90)
      move (5) steps

→ Nhân vật nhìn đúng hướng khi di chuyển
```

**Phần 3 — Va chạm Sprite:**
```
forever
  if <touching [Bomb]?> then
    play sound [Explosion] until done
    say [THUA RỒI! 💥] for (2) seconds
    stop [all]
```

**Phần 4 — Touching color (cạm bẫy màu sắc):**
```
forever
  if <touching color [#FF0000]?> then  ← Màu đỏ
    say [Chạm lửa rồi!] for (1) seconds
    go to x:(0) y:(0)  ← Reset về giữa
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Bắt Bươm Bướm":**

```
Nhân vật: Bàn tay (Hand) hoặc vợt (Paddle)
Bươm bướm: Butterfly Sprite

Script của Bươm bướm (chạy lung tung):
  when green flag clicked
  show
  forever
    move (3) steps
    if on edge, bounce
    turn (pick random (-10) to (10)) degrees

Script của Bàn tay (theo chuột):
  when green flag clicked
  forever
    go to (mouse pointer)

Script kiểm tra va chạm (trên Bươm bướm):
  when green flag clicked
  forever
    if <touching [Hand]?> then
      play sound [Pop]
      say [Bắt được! 🦋] for (1) seconds
      go to (random position)  ← Bướm chạy chỗ khác
      change [color] effect by (30)
```

**Nâng cao — Thêm if/else:**
```
Script trên Bươm bướm:
  when green flag clicked
  forever
    if <touching [Hand]?> then
      play sound [Pop]
      go to (random position)
    else
      if <touching [edge]?> then
        turn (180) degrees
      else
        move (3) steps
        turn (pick random (-5) to (5)) degrees
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách:**
- **Cạm bẫy màu:** Vẽ đường màu đỏ trên nền, nhân vật reset về điểm xuất phát khi chạm màu đỏ
- **Vùng an toàn:** Nếu nhân vật ở trong vùng xanh (touching color xanh) → điểm tăng liên tục
- **Kẻ thù thông minh:** Kẻ thù tăng tốc khi lại gần nhân vật chính (dùng `distance to`)

### Nộp & Nhận xét (5 phút)

- Demo game "Bắt Bướm" - ai bắt được nhiều nhất trong 30 giây?
- Hỏi: *"Script if/then của bạn kiểm tra điều gì? Điều gì xảy ra khi đúng? Khi sai?"*

---

## 🚀 Project học sinh tự làm

**"Game Né Chướng Ngại Vật"**

Xây dựng mini-game:
1. Nhân vật di chuyển bằng phím mũi tên (hoặc theo chuột)
2. **Nếu** chạm kẻ thù/bom → **Thì** phát âm thanh + nói "Thua!" + dừng game
3. **Nếu** chạm vật phẩm (ngôi sao/tim) → **Thì** phát âm thanh vui + vật phẩm ẩn đi
4. **Nếu** nhân vật chạm mép trái/phải → **Thì** bật lại
5. **Bonus:** Nếu thu thập đủ 3 vật phẩm → "Thắng rồi! 🏆"

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Va chạm không được phát hiện | Sprite quá nhỏ hoặc quá xa | Tăng kích thước Sprite; kiểm tra tên Sprite trong `touching [Sprite]` |
| `if` kích hoạt khi không muốn | Điều kiện quá rộng | Thêm điều kiện phụ; ví dụ kiểm tra thêm vị trí |
| Game thua ngay khi bắt đầu | Nhân vật và kẻ thù cùng vị trí lúc đầu | Thêm `go to x:(X) y:(Y)` để đặt vị trí ban đầu cách xa nhau |
| `touching color` không hoạt động | Chọn màu chưa chính xác | Dùng eyedropper tool chọn đúng màu; màu phải rõ, không bị che |
| `if/else` bỏ qua nhánh `else` | Nhầm thứ tự block | Đảm bảo block `else` được ghép bên trong `if/then/else`, không phải riêng lẻ |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Cửa ma thuật:** Tạo dự án có 2 vùng màu (xanh = an toàn, đỏ = nguy hiểm). Nhân vật đổi màu và nói khác nhau tùy vào vùng đang đứng.

2. **Bài 2 — Đèn giao thông:** Tạo đèn giao thông (3 màu: đỏ/vàng/xanh). Khi nhấp vào mỗi đèn, xe ô tô nhỏ phản ứng: dừng, chuẩn bị, hoặc chạy.

3. **Bài 3 — Phân tích logic:** Mô tả 3 quy tắc "if/then" trong game yêu thích của bạn (Minecraft, Among Us, Flappy Bird...). Viết dưới dạng: "Nếu [điều kiện] → Thì [kết quả]".

4. **Bài 4 — Nhân vật thông minh:** Tạo nhân vật có 3 phản ứng khác nhau: (1) nếu bị chạm chuột → bỏ chạy, (2) nếu bấm Space → nhảy, (3) nếu chạm mép → đổi màu.

5. **Bài 5 — Câu đố logic:** Viết 5 câu dạng "if/then/else" về cuộc sống thực, ví dụ: "Nếu trời mưa → mang ô, nếu không → không mang ô". Sau đó làm thành hoạt hình Scratch.

---

## 🏅 Huy hiệu hoàn thành

> 🧠 **"Nhà Logic Học Nhí"**
>
> Học sinh đã biết tạo điều kiện và quyết định trong Scratch!
> Thành thạo `if/then`, `if/then/else`, va chạm `touching`, và kiểm tra phím/chuột.
>
> ⭐ Tiêu chí: Dự án có ít nhất 2 điều kiện `if/then` khác nhau, ít nhất 1 dùng `touching`, và 1 dùng `if/else`.
