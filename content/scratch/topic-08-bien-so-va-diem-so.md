# Chuyên đề 8: Biến Số Và Điểm Số

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Hiểu khái niệm biến số — "hộp chứa thông tin"
- Tạo và sử dụng biến `Score` (điểm số), `Lives` (mạng sống), `Timer` (thời gian)
- Cộng/trừ biến và hiển thị trên màn hình
- Tạo hệ thống điểm số và mạng sống cho game
- Kết hợp biến với điều kiện để tạo logic game hoàn chỉnh

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `set [Variable] to [0]` | Variables | Đặt giá trị cho biến |
| `change [Variable] by [1]` | Variables | Tăng/giảm biến |
| `show variable [Variable]` | Variables | Hiển thị biến trên màn hình |
| `hide variable [Variable]` | Variables | Ẩn biến khỏi màn hình |
| `[Variable]` | Variables | Đọc giá trị biến (dùng trong block khác) |
| `<[Variable] > [10]>` | Operators | So sánh: lớn hơn |
| `<[Variable] = [0]>` | Operators | So sánh: bằng |
| `<[Variable] < [5]>` | Operators | So sánh: nhỏ hơn |
| `timer` | Sensing | Giá trị đồng hồ (giây từ khi bắt đầu) |
| `reset timer` | Sensing | Reset đồng hồ về 0 |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Variable | Biến số |
| Score | Điểm số |
| Lives | Mạng sống |
| Timer | Đồng hồ đếm thời gian |
| Value | Giá trị |
| Initialize | Khởi tạo (đặt giá trị ban đầu) |
| Increment | Tăng lên |
| Decrement | Giảm xuống |
| Display | Hiển thị |
| Counter | Bộ đếm |

---

## 🎬 Project mẫu (mô tả)

**"Bắt Táo Rơi 🍎"**

Màn hình có giỏ ở dưới cùng (điều khiển bằng phím trái/phải). Táo rơi từ trên xuống ở vị trí ngẫu nhiên.

**Hệ thống biến:**
- `Score = 0` → Cộng 10 điểm mỗi lần bắt được táo ✅
- `Lives = 3` → Trừ 1 mạng mỗi lần táo rơi xuống đất ❌
- `Timer` → Hiển thị thời gian đã chơi
- **Nếu** `Lives = 0` → Game over, hiển thị điểm số cuối
- **Nếu** `Score >= 100` → Chiến thắng! Level up!
- Táo tốc độ tăng dần khi điểm tăng

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🎒 **Trò chơi "Hộp Bí Mật":**
- Giáo viên cầm 1 hộp nhỏ (hay tờ giấy gấp lại)
- Viết lên bảng: **Điểm = [  ]**
- Hỏi học sinh: *"Trong game, điểm số được lưu ở đâu? Ai giữ nó?"*
- Giải thích: Biến số trong Scratch như chiếc hộp — nó **giữ** một con số, và con số đó có thể **thay đổi** trong khi chơi!
- Demo bằng cách tự ghi số lên bảng, xóa đi, ghi số mới

### Xem sản phẩm mẫu (5 phút)

Chiếu game "Bắt Táo Rơi":
- Chạy demo, chú ý điểm số thay đổi trên màn hình
- Hỏi: *"Điểm số tăng khi nào? Giảm khi nào? Nó hiển thị ở đâu?"*
- Hỏi: *"Nếu mạng về 0 thì sao?"*

### Học block mới (10 phút)

**Phần 1 — Tạo biến:**
```
→ Vào "Variables" → Nhấn "Make a Variable"
→ Đặt tên: "Score"
→ Chọn: For all sprites (dùng chung) hay For this sprite only (riêng)
→ Biến hiện ra màn hình ngay!
```

**Phần 2 — Sử dụng biến:**
```
Khởi tạo:
  when green flag clicked
  set [Score] to (0)
  set [Lives] to (3)

Tăng điểm:
  change [Score] by (10)

Giảm mạng:
  change [Lives] by (-1)

Hiển thị/ẩn:
  show variable [Score]
  hide variable [Lives]  ← Khi không cần thấy
```

**Phần 3 — So sánh biến để tạo điều kiện:**
```
forever
  if <[Lives] = [0]> then
    say [GAME OVER! 😢] for (3) seconds
    stop [all]
  
  if <[Score] >= [100]> then
    say [🏆 CHIẾN THẮNG! Điểm: (Score)] for (3) seconds
    stop [all]
```

**Phần 4 — Dùng `join` để hiển thị biến trong câu:**
```
say (join [Điểm của bạn: ] (Score)) for (2) seconds
say (join [Còn ] (join (Lives) [ mạng!])) for (2) seconds
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Game Bắt Ngôi Sao ⭐":**

```
Biến cần tạo: Score, Lives, Level

=== Script của NGÔI SAO ===
  when green flag clicked
  set [Score] to (0)
  set [Lives] to (3)
  set [Level] to (1)
  forever
    go to (random position)
    show
    wait (pick random (1) to (3)) seconds
    hide
    
    → Nếu Score < 30: wait 3 giây (dễ)
    → Nếu Score < 60: wait 2 giây (vừa)
    → Nếu Score >= 60: wait 1 giây (khó)
    
    (Nếu sao biến mất mà chưa bị bắt → trừ mạng)
    change [Lives] by (-1)
    if <[Lives] = [0]> then
      broadcast [game-over]

=== Script của NGƯỜI CHƠI (chuột hoặc phím) ===
  forever
    go to (mouse pointer)  ← Hoặc dùng phím mũi tên

  when this sprite clicked ← Hoặc touching player
  play sound [Collect]
  change [Score] by (10)
  if <[Score] >= [50]> then
    change [Level] by (1)
    set [Score] to (0)
    say (join [Level ] (Level)) for (1) seconds

=== Script GAME OVER ===
  when I receive [game-over]
  play sound [Game Over]
  say (join [Trò chơi kết thúc! Điểm: ] (Score)) for (5) seconds
  stop [all]
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách biến số:**
- **Đồng hồ đếm ngược:** Tạo biến `Time = 30`, mỗi giây trừ 1, khi về 0 → hết giờ!
- **Bảng xếp hạng:** Lưu `Best Score` và so sánh với `Score` hiện tại
- **Combo system:** Nếu bắt liên tiếp 3 ngôi sao → điểm x2 trong 5 giây

### Nộp & Nhận xét (5 phút)

- Học sinh thi nhau chơi game của nhau
- Ghi lại điểm cao nhất của từng người
- Hỏi: *"Biến `Score` và `Lives` được khởi tạo ở đâu? Tại sao phải set = 0 khi bắt đầu?"*

---

## 🚀 Project học sinh tự làm

**"RPG Mini — Phiêu Lưu Rừng Xanh"**

Tạo game nhập vai đơn giản với hệ thống biến phong phú:

**Các biến:**
- `HP` (máu) = 100
- `Gold` (vàng) = 0
- `EXP` (kinh nghiệm) = 0
- `Level` = 1

**Gameplay:**
- Di chuyển nhân vật bằng phím mũi tên
- Chạm **Quái vật** → HP -20, nếu HP = 0 → Game Over
- Chạm **Túi vàng** → Gold +10
- Chạm **Ngôi sao** → EXP +25; nếu EXP >= 100 → Level +1, EXP = 0
- Chạm **Bình hồi phục** → HP +30 (không vượt quá 100)
- Hiển thị tất cả biến trên màn hình dưới dạng HUD

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Điểm số không reset khi chơi lại | Quên `set [Score] to (0)` khi nhấn cờ xanh | Luôn khởi tạo TẤT CẢ biến trong `when green flag clicked` |
| Biến tăng quá nhanh | `change by` trong `forever` không có điều kiện | Thêm điều kiện: chỉ cộng điểm khi va chạm thực sự |
| Điểm âm | Trừ điểm khi không nên trừ | Thêm điều kiện `if <[Score] > [0]> then` trước khi trừ |
| Biến hiển thị sai vị trí | Biến overlay chồng lên nhau | Kéo display của biến trên Stage đến vị trí khác nhau |
| Nhiều Sprite đều đọc/ghi 1 biến | Variable scope nhầm | Tạo biến "For all sprites" nếu cần dùng chung |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Đồng hồ đếm ngược:** Tạo dự án đếm ngược từ 10 về 0. Khi hết giờ, nhân vật nói "Hết giờ!" và phát âm thanh. Dùng biến `Time` và giảm 1 mỗi giây.

2. **Bài 2 — Máy tính đơn giản:** Tạo 2 biến `Number1` và `Number2`. Khi nhấn phím cộng (+) → nói kết quả. Khi nhấn trừ (-) → nói kết quả. *Gợi ý: dùng `join` để ghép chữ và số.*

3. **Bài 3 — Ngân hàng nhỏ:** Tạo biến `Balance = 100`. Có 3 nhân vật: "Gửi tiền" (Balance +10), "Rút tiền" (Balance -10, không rút nếu Balance = 0), "Kiểm tra" (nói số dư).

4. **Bài 4 — Sửa game cũ:** Thêm hệ thống điểm số vào game từ chuyên đề 7 (game né chướng ngại vật). Cộng 1 điểm mỗi giây sống sót; hiển thị điểm khi game over.

5. **Bài 5 — Thiết kế:** Thiết kế ra giấy một game có ít nhất 4 biến. Mô tả: Biến đó là gì? Bắt đầu bằng bao nhiêu? Tăng/giảm khi nào? Ảnh hưởng đến game ra sao?

---

## 🏅 Huy hiệu hoàn thành

> 📊 **"Kỹ Sư Điểm Số"**
>
> Học sinh đã biết tạo và quản lý biến số để xây dựng hệ thống game thực sự!
> Thành thạo `set variable`, `change variable by`, so sánh biến, và hiển thị biến trên màn hình.
>
> ⭐ Tiêu chí: Dự án có ít nhất 3 biến (Score, Lives, và 1 biến khác), có khởi tạo khi bắt đầu, và có điều kiện kiểm tra game over.
