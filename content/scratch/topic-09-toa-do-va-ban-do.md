# Chuyên đề 9: Tọa Độ Và Bản Đồ

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Hiểu hệ tọa độ X/Y của Scratch (0,0 là trung tâm)
- Đặt nhân vật ở vị trí cụ thể bằng X và Y
- Sử dụng `pick random` để tạo vị trí ngẫu nhiên
- Xây dựng giới hạn màn hình (boundary) để nhân vật không ra ngoài
- Thiết kế bản đồ màn chơi với vùng cấm, đường đi, và điểm đến

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `go to x:[0] y:[0]` | Motion | Di chuyển đến tọa độ chính xác |
| `glide [1] secs to x:[0] y:[0]` | Motion | Trượt đến tọa độ trong N giây |
| `set x to [0]` | Motion | Chỉ đổi tọa độ X |
| `set y to [0]` | Motion | Chỉ đổi tọa độ Y |
| `change x by [10]` | Motion | Dịch X thêm N đơn vị |
| `change y by [10]` | Motion | Dịch Y thêm N đơn vị |
| `x position` | Motion | Đọc tọa độ X hiện tại |
| `y position` | Motion | Đọc tọa độ Y hiện tại |
| `pick random [-240] to [240]` | Operators | Chọn số ngẫu nhiên trong khoảng |
| `go to [random position]` | Motion | Đến vị trí ngẫu nhiên trên sân khấu |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Coordinate | Tọa độ |
| X-axis | Trục X (ngang) |
| Y-axis | Trục Y (dọc) |
| Origin | Gốc tọa độ (0,0) |
| Boundary | Giới hạn / Biên |
| Random | Ngẫu nhiên |
| Position | Vị trí |
| Map | Bản đồ |
| Spawn | Vị trí xuất hiện |
| Negative | Âm (số âm) |

---

## 🎬 Project mẫu (mô tả)

**"Mê Cung Huyền Bí 🗺️"**

Bản đồ mê cung 2D được vẽ trực tiếp trên nền (Backdrop). Nhân vật bóng đen nhỏ cần đi từ điểm bắt đầu đến lối ra.

**Tọa độ quan trọng:**
- Điểm xuất phát: `x: -200, y: -150` (góc dưới trái)
- Điểm đích: `x: 200, y: 150` (góc trên phải)
- Tường mê cung: Màu xanh đậm

**Logic:**
- Nhân vật di chuyển bằng phím mũi tên (thay đổi X và Y từng 5 bước)
- **Nếu** chạm màu tường xanh → Reset về điểm xuất phát
- **Nếu** chạm ngôi sao ở điểm đích → Thắng!
- **Nếu** `x < -230` hoặc `x > 230` → giới hạn lại (boundary)
- Timer hiển thị thời gian hoàn thành

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🗺️ **Trò chơi "Bản Đồ Kho Báu":**
- Vẽ lên bảng một lưới đơn giản, có trục X (ngang) và Y (dọc)
- Đánh dấu: 0,0 ở giữa; trái âm, phải dương; lên dương, xuống âm
- Đố học sinh: *"Bạn hãy tìm kho báu ở tọa độ (-3, 2)!"*
- Học sinh lên chỉ đúng điểm
- Giải thích: Scratch cũng dùng tọa độ như vậy, với (0,0) là giữa màn hình!

### Xem sản phẩm mẫu (5 phút)

Chiếu game "Mê Cung Huyền Bí":
- Khi di chuyển nhân vật, chú ý số X và Y thay đổi (hiển thị ở bảng Sprite info)
- Hỏi: *"Khi di chuyển sang phải, X tăng hay giảm? Lên trên thì Y thế nào?"*
- Mở "See Inside" xem block `change x by` và `change y by`

### Học block mới (10 phút)

**Phần 1 — Hiểu bản đồ tọa độ Scratch:**
```
🗺️ Sân khấu Scratch:
  - Rộng: 480px → X từ -240 (trái) đến +240 (phải)
  - Cao: 360px  → Y từ -180 (dưới) đến +180 (trên)
  - Trung tâm: X=0, Y=0

Demo: Nhấp chuột vào các góc → Đọc tọa độ trong bảng Sprite info
  - Góc trên trái: (-240, 180)
  - Góc trên phải: (240, 180)
  - Góc dưới trái: (-240, -180)
  - Góc dưới phải: (240, -180)
```

**Phần 2 — Di chuyển bằng phím mũi tên chính xác:**
```
when [right arrow] key pressed
change x by (5)

when [left arrow] key pressed
change x by (-5)

when [up arrow] key pressed
change y by (5)

when [down arrow] key pressed
change y by (-5)
```

**Phần 3 — Giới hạn màn hình (Boundary):**
```
forever
  if <[x position] > [230]> then
    set x to (230)
  
  if <[x position] < [-230]> then
    set x to (-230)
  
  if <[y position] > [170]> then
    set y to (170)
  
  if <[y position] < [-170]> then
    set y to (-170)
```

**Phần 4 — Random spawn:**
```
go to x:(pick random (-200) to (200)) y:(pick random (-150) to (150))
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Bản Đồ Kho Báu":**

```
Chuẩn bị:
1. Vào Backdrop → Paint → Vẽ bản đồ đơn giản:
   - Nền cỏ màu xanh lá
   - 4-5 bức tường màu nâu (hình chữ nhật)
   - Điểm xuất phát (X): Vòng tròn vàng ở (-180, -120)
   - Kho báu (Goal): Ngôi sao ở (180, 120)

Script nhân vật (Thám tử nhỏ):
  when green flag clicked
  go to x:(-180) y:(-120)  ← Vị trí xuất phát
  set size to (30)%
  reset timer
  
  forever
    [Di chuyển bằng phím mũi tên như trên]
    
    if <touching color [#8B4513]?> then  ← Màu nâu = tường
      go to x:(-180) y:(-120)            ← Reset về điểm đầu
      play sound [Oops]
      say [Đụng tường rồi! 😅] for (1) seconds

Script Kho Báu (Sprite ngôi sao ở 180, 120):
  when green flag clicked
  go to x:(180) y:(120)
  show
  
  forever
    if <touching [Detective]?> then
      hide
      play sound [Fanfare]
      say (join [Tìm được rồi! Thời gian: ] (join (timer) [ giây!])) for (4) seconds
      stop [all]
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách tọa độ:**
- **Teleport:** Khi nhấp vào cổng dịch chuyển ở (-200, 0) → nhân vật xuất hiện ở (200, 0)
- **Theo dõi khoảng cách:** Hiển thị biến `Distance` = khoảng cách từ nhân vật đến kho báu
- **Nhiều phòng:** Khi chạm mép phải → đổi backdrop và teleport sang trái

### Nộp & Nhận xét (5 phút)

- Ai giải mê cung nhanh nhất? (Dùng timer so sánh)
- Hỏi: *"Tọa độ của kho báu nhà bạn là bao nhiêu? Bạn đặt tường ở đâu?"*

---

## 🚀 Project học sinh tự làm

**"Thế Giới Mở Mini"**

Tạo bản đồ mini có 4 khu vực:
1. **Rừng** (góc trên trái): Màu xanh, có nhân vật động vật bắt gặp
2. **Sa mạc** (góc trên phải): Màu vàng, di chuyển chậm hơn (wait 0.05 giây)
3. **Thành phố** (giữa): Màu xám, có nhân vật NPC nói chuyện
4. **Đại dương** (dưới): Màu xanh dương, không thể đi vào (boundary)

**Gameplay:**
- Di chuyển bằng phím mũi tên
- Mỗi khu vực có 1 vật phẩm ẩn ở tọa độ cụ thể
- Thu thập đủ 4 vật phẩm → thắng!

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Nhân vật đi ra khỏi màn hình | Không có boundary check | Thêm `forever` kiểm tra `x position` và `y position` |
| Nhân vật bị kẹt trong tường | Touching color check sau khi đã lún vào tường | Thêm step nhỏ hơn (change x/y by 2 thay vì 10) |
| `pick random` cho số không như mong muốn | Hiểu nhầm khoảng giá trị | Nhớ X từ -240 đến 240, Y từ -180 đến 180; điều chỉnh range |
| Tọa độ sai khi vẽ bản đồ | Không biết tọa độ khi vẽ | Nhấp vào vị trí trên Stage và đọc X,Y trong bảng Sprite info |
| Boundary check không hoạt động | Script kiểm tra không chạy song song | Đảm bảo boundary check trong `forever` riêng, chạy song song với script di chuyển |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Vẽ bản đồ:** Vẽ ra giấy bản đồ một khu vực (có thể là trường học, xóm nhà, hay vũ trụ). Đánh dấu tọa độ X,Y của ít nhất 5 vị trí quan trọng trên bản đồ đó (tính theo tỷ lệ Scratch).

2. **Bài 2 — Mưa sao băng:** Tạo dự án có 5 ngôi sao rơi từ trên xuống. Mỗi sao xuất hiện ở X ngẫu nhiên, rơi từ Y=180 xuống Y=-180, rồi reset lên trên.

3. **Bài 3 — Giới hạn phòng:** Vẽ một "phòng" trên nền (4 bức tường). Nhân vật di chuyển bằng phím mũi tên nhưng không thể ra khỏi phòng (boundary check bằng màu tường).

4. **Bài 4 — Teleport:** Tạo 4 "cổng dịch chuyển" ở 4 góc màn hình. Khi nhân vật chạm cổng góc trên trái → xuất hiện ở góc dưới phải, và ngược lại (như game Pac-Man).

5. **Bài 5 — Theo dõi vị trí:** Thêm 2 biến `X_POS` và `Y_POS` vào game từ chuyên đề 8. Cập nhật liên tục: `set [X_POS] to (x position)`. Hiển thị vị trí của nhân vật như radar.

---

## 🏅 Huy hiệu hoàn thành

> 🗺️ **"Nhà Thám Hiểm Bản Đồ"**
>
> Học sinh đã hiểu hệ tọa độ Scratch và biết thiết kế bản đồ màn chơi!
> Thành thạo X/Y positions, `pick random`, `change x/y by`, và boundary detection.
>
> ⭐ Tiêu chí: Dự án có bản đồ với ít nhất 3 vùng khác nhau, nhân vật di chuyển bằng phím, có boundary check và ít nhất 1 điểm đến cụ thể theo tọa độ.
