# Chuyên đề 11: Thiết Kế Game Hoàn Chỉnh

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Thiết kế cấu trúc game đầy đủ: Màn hình chờ → Gameplay → Game Over → Chiến thắng
- Xây dựng hệ thống level (cấp độ) tăng dần độ khó
- Tạo màn hình Start Screen và Game Over Screen chuyên nghiệp
- Dùng `broadcast` để chuyển đổi giữa các trạng thái game
- Kết hợp tất cả kiến thức từ chuyên đề 1-10 vào một game hoàn chỉnh

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `switch backdrop to [backdrop1]` | Looks | Chuyển đổi nền (dùng cho các màn hình game) |
| `broadcast [start-game]` | Events | Tín hiệu bắt đầu game |
| `broadcast [game-over]` | Events | Tín hiệu kết thúc game |
| `broadcast [level-up]` | Events | Tín hiệu lên level |
| `broadcast [you-win]` | Events | Tín hiệu chiến thắng |
| `when I receive [start-game]` | Events | Kích hoạt gameplay khi nhận tín hiệu |
| `stop [other scripts in sprite]` | Control | Dừng scripts khác trong nhân vật này |
| `stop [all]` | Control | Dừng tất cả — kết thúc game |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Game State | Trạng thái game |
| Start Screen | Màn hình bắt đầu |
| Game Over | Kết thúc game (thua) |
| Victory Screen | Màn hình chiến thắng |
| Level | Cấp độ |
| Difficulty | Độ khó |
| HUD | Giao diện người dùng (điểm/mạng hiển thị) |
| Replay | Chơi lại |
| Pause | Tạm dừng |
| Transition | Chuyển cảnh |

---

## 🎬 Project mẫu (mô tả)

**"STAR CATCHER — Game Hoàn Chỉnh ⭐"**

Game bắt ngôi sao với 3 level, màn hình đầy đủ:

**Cấu trúc game:**
```
[START SCREEN] → Nhấn Space
      ↓
[GAMEPLAY Level 1] → Thu thập 5 sao (sao rơi chậm)
      ↓
[LEVEL UP] → Màn hình "Level 2!" 2 giây
      ↓
[GAMEPLAY Level 2] → Thu thập 8 sao (sao rơi nhanh hơn)
      ↓
[LEVEL UP] → Màn hình "Level 3!" 2 giây
      ↓
[GAMEPLAY Level 3] → Thu thập 12 sao + tránh bom
      ↓
[YOU WIN! 🏆] HOẶC [GAME OVER 💀]
      ↓
[Nhấn R để chơi lại] → quay về START SCREEN
```

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🎮 **Phân tích game yêu thích:**
- Hỏi cả lớp: *"Game nào bạn hay chơi nhất?"*
- Chọn 1 game, hỏi: *"Game đó có mấy màn hình? Start, gameplay, game over, thắng không?"*
- Vẽ sơ đồ lên bảng: Box "Start" → "Play" → "Win/Lose"
- Giải thích: Mọi game đều có cấu trúc này. Hôm nay mình học cách xây dựng nó!

### Xem sản phẩm mẫu (5 phút)

Chiếu game "STAR CATCHER":
- Chơi trọn vẹn 1 ván (kể cả thua và chơi lại)
- Hỏi: *"Game có mấy màn hình? Chuyển màn hình bằng cách nào?"*
- Mở "See Inside": *"Tất cả các trạng thái game đều dùng broadcast và backdrop!"*

### Học block mới (10 phút)

**Kiến trúc game dùng Broadcast:**

```
📐 SƠ ĐỒ BROADCAST:

[START SCREEN Sprite]
  when green flag clicked
  switch backdrop to [start-screen]  ← Hiện màn hình bắt đầu
  show
  
  when [space] key pressed
  broadcast [start-game]  ← Bắt đầu!
  hide  ← Ẩn màn hình bắt đầu

[PLAYER]
  when I receive [start-game]
  show
  set [Score] to (0)
  set [Lives] to (3)
  set [Level] to (1)
  [... gameplay code ...]
  
[ENEMY/STAR Sprite]
  when I receive [start-game]
  [... tạo clone, rơi xuống ...]

[GAME OVER Sprite]
  hide lúc đầu
  when I receive [game-over]
  show
  switch backdrop to [gameover-screen]
  stop [other scripts in sprite]

[YOU WIN Sprite]
  hide lúc đầu
  when I receive [you-win]
  show
  switch backdrop to [win-screen]
```

**Hệ thống level:**
```
[PLAYER Script]:
  when I receive [start-game]
  forever
    ... gameplay ...
    if <[Score] >= [(Level) * (5)]> then  ← 5 sao/level
      change [Level] by (1)
      if <[Level] > [3]> then
        broadcast [you-win]
        stop [this script]
      else
        broadcast [level-up]
        wait (2) seconds  ← Chờ màn hình level-up
        broadcast [start-game]  ← Bắt đầu level mới
        stop [this script]

[LEVEL UP Sprite]:
  when I receive [level-up]
  show
  say (join [🎉 LEVEL ] (Level)) for (2) seconds
  hide
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng framework game hoàn chỉnh:**

**Bước 1: Tạo các Backdrop**
```
1. "start-screen" → Nền đen, chữ tên game + "Nhấn SPACE để bắt đầu"
2. "gameplay" → Nền gameplay thực sự
3. "level-up" → Nền vàng/rực rỡ
4. "gameover-screen" → Nền đỏ/tối
5. "win-screen" → Nền vàng/vui vẻ
```

**Bước 2: Tạo các Sprite quản lý màn hình**
```
Sprite "StartMenu" (hình chữ hoặc logo):
  when green flag clicked
  switch backdrop to [start-screen]
  show
  when [space] key pressed
  broadcast [start-game]
  hide

Sprite "GameOver" (skull hoặc X đỏ):
  when green flag clicked
  hide
  when I receive [game-over]
  switch backdrop to [gameover-screen]
  show
  say (join [Score: ] (Score)) for (5) seconds
  
  when [r] key pressed
  broadcast [restart]
  hide

Sprite "YouWin" (trophy hoặc sao):
  when green flag clicked
  hide
  when I receive [you-win]
  switch backdrop to [win-screen]
  show
  play sound [Fanfare]
```

**Bước 3: Sao chép game đã có từ chuyên đề 8-10 vào framework này**

### Sáng tạo thêm (10 phút)

🌟 **Nâng cao game:**
- **Pause:** Khi nhấn P → dừng nhân vật và kẻ thù, hiện "Tạm Dừng"
- **High Score:** Biến `Best Score`, so sánh với Score hiện tại sau mỗi ván
- **Chọn nhân vật:** Màn hình chọn nhân vật trước khi bắt đầu (dùng phím 1,2,3)
- **Settings:** Màn hình chọn độ khó (Easy/Medium/Hard ảnh hưởng đến tốc độ kẻ thù)

### Nộp & Nhận xét (5 phút)

- Demo game của 3-4 học sinh trước lớp
- Cả lớp chơi thử và góp ý: *"Game có màn hình start/game-over/win chưa? Level có khó hơn không?"*
- Giáo viên nhận xét cấu trúc game và gợi ý cho dự án cuối khóa

---

## 🚀 Project học sinh tự làm

**"Game Hoàn Chỉnh Của Tôi"**

Xây dựng game HOÀN CHỈNH với tất cả thành phần:

**Bắt buộc có:**
- ✅ Màn hình Start Screen (tên game + hướng dẫn)
- ✅ Gameplay có ít nhất 2 Level
- ✅ Hệ thống điểm số (Score)
- ✅ Hệ thống mạng (Lives) HOẶC đồng hồ đếm ngược
- ✅ Màn hình Game Over (hiển thị điểm)
- ✅ Màn hình Chiến Thắng
- ✅ Nút chơi lại (Replay)
- ✅ Nhạc nền và âm thanh hiệu ứng

**Bonus:**
- ⭐ Level 3+ với độ khó tăng đáng kể
- ⭐ High Score được lưu giữa các ván chơi
- ⭐ Màn hình chọn nhân vật
- ⭐ Hướng dẫn chơi (how-to-play screen)

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Game không reset khi chơi lại | Biến không được reset khi `broadcast [restart]` | Tạo script `when I receive [restart]` và khởi tạo lại TẤT CẢ biến |
| Clone từ level trước vẫn còn | Clone không bị xóa khi chuyển level | Thêm `broadcast [clear-all]`; clone nhận → `delete this clone` |
| Nhiều màn hình hiện cùng lúc | Quên `hide` các Sprite | Mọi Sprite menu: `when green flag clicked → hide`; chỉ `show` khi nhận đúng broadcast |
| Level-up liên tục kích hoạt | Điều kiện Score >= X vẫn đúng sau level-up | Reset Score về 0 khi lên level, hoặc dùng biến `level-changing` để khóa |
| Game không dừng sau game-over | `stop [all]` quá mạnh, xóa cả nhận broadcast | Dùng `stop [other scripts in sprite]` thay vì `stop [all]`, rồi xử lý game-over qua broadcast |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Sơ đồ game:** Vẽ sơ đồ trạng thái (state diagram) cho game yêu thích của bạn. Mỗi hộp là 1 trạng thái, mỗi mũi tên là 1 sự kiện chuyển trạng thái.

2. **Bài 2 — Màn hình chào:** Thiết kế màn hình Start Screen đẹp cho game của bạn trên giấy. Bao gồm: tên game, logo, hướng dẫn điều khiển, tên tác giả.

3. **Bài 3 — Hệ thống level:** Thêm ít nhất 1 level vào game từ chuyên đề 10. Level 2 phải khó hơn Level 1 (kẻ thù nhanh hơn, nhiều hơn, hoặc điều kiện thắng cao hơn).

4. **Bài 4 — Chơi và phân tích:** Chơi 3 game khác nhau trên scratch.mit.edu. Ghi lại: (1) Game có bao nhiêu màn hình? (2) Cách chuyển giữa các màn hình? (3) Điều gì làm level khó hơn?

5. **Bài 5 — Lên kế hoạch:** Viết kế hoạch chi tiết cho dự án cuối khóa: Loại game gì? Nhân vật nào? Bao nhiêu level? Điều kiện thắng/thua? Biến số nào cần? Âm thanh nào cần?

---

## 🏅 Huy hiệu hoàn thành

> 🎮 **"Nhà Thiết Kế Game Chuyên Nghiệp"**
>
> Học sinh đã biết xây dựng game hoàn chỉnh với cấu trúc Start → Play → Win/Lose → Replay!
> Thành thạo hệ thống broadcast để quản lý trạng thái game và tạo nhiều level với độ khó tăng dần.
>
> ⭐ Tiêu chí: Game có đầy đủ Start Screen, ít nhất 2 Level, Game Over Screen, Win Screen, và nút chơi lại — tất cả kết nối bằng `broadcast`.
