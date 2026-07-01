# Chuyên đề 6: Vòng Lặp

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Hiểu khái niệm vòng lặp và tại sao nó hữu ích
- Sử dụng `repeat` để lặp một số lần nhất định
- Sử dụng `forever` để tạo hành động không ngừng
- Dùng `wait` để kiểm soát tốc độ vòng lặp
- Tạo hoạt hình mượt mà và nhân vật chuyển động liên tục

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `repeat [10]` | Control | Lặp lại các lệnh bên trong N lần |
| `forever` | Control | Lặp lại mãi mãi (cho đến khi dừng) |
| `wait [1] seconds` | Control | Dừng N giây |
| `wait until <condition>` | Control | Chờ cho đến khi điều kiện đúng |
| `repeat until <condition>` | Control | Lặp cho đến khi điều kiện đúng |
| `stop [all]` | Control | Dừng tất cả vòng lặp |
| `stop [this script]` | Control | Dừng script hiện tại |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Loop | Vòng lặp |
| Repeat | Lặp lại |
| Forever | Mãi mãi |
| Iteration | Lần lặp |
| Condition | Điều kiện |
| Wait | Chờ / Đợi |
| Animation | Hoạt hình |
| Frame | Khung hình |
| Cycle | Chu kỳ |

---

## 🎬 Project mẫu (mô tả)

**"Chú Cá Bơi Trong Đại Dương"**

Sân khấu là đại dương sâu. Có 3 con cá bơi theo hướng khác nhau:

- **Cá đỏ** (forever): Bơi qua lại liên tục, bật lại khi chạm tường
- **Cá xanh** (repeat 10): Bơi theo hình tròn 10 vòng rồi dừng
- **Cá vàng** (repeat until): Bơi cho đến khi chạm vào cá đỏ
- **Bong bóng** (forever + wait): Nổi lên từ dưới đáy, cứ 2 giây lại xuất hiện bong bóng mới
- Nhạc nền: âm thanh đại dương phát liên tục

Dự án minh họa sự khác biệt giữa `forever`, `repeat`, và `repeat until`.

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🔄 **Trò chơi "Máy Đếm Người":**
- Cả lớp đứng lên
- Giáo viên hô: *"Vỗ tay 5 lần!"* → Học sinh vỗ 5 cái → Ngồi xuống → Đây là `repeat (5)`
- Giáo viên hô: *"Nhảy lên mãi mãi!"* → Học sinh nhảy... và nhảy... và nhảy → Đây là `forever`!
- Giáo viên hô: *"Dừng!"* → Đây là `stop all`!
- Hỏi: *"Bạn nghĩ trong Scratch, khi nào mình dùng repeat, khi nào dùng forever?"*

### Xem sản phẩm mẫu (5 phút)

Chiếu dự án "Chú Cá Bơi Trong Đại Dương":
- Để chương trình chạy 30 giây
- Hỏi: *"Cá nào bơi mãi không dừng? Cá nào dừng lại? Bong bóng xuất hiện theo quy luật gì?"*
- Mở "See Inside" để xem các loại vòng lặp khác nhau

### Học block mới (10 phút)

**Demo 1 — `repeat` (Lặp có đếm):**
```
Không dùng repeat — Rất dài và lặp lại:
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps
  move (10) steps

Dùng repeat — Ngắn gọn và hiệu quả:
  repeat (10)
    move (10) steps
```

*"Thay vì viết 10 dòng, mình chỉ cần 2 dòng! 🎉"*

**Demo 2 — `forever` (Lặp vĩnh cửu):**
```
forever
  move (5) steps
  if on edge, bounce

→ Nhân vật bơi mãi mãi không dừng!
```

**Demo 3 — `forever` + `wait` (Điều chỉnh tốc độ):**
```
forever              forever              forever
  next costume         next costume         next costume
                       wait (0.1) seconds   wait (0.5) seconds

→ Nhanh nhất          → Vừa phải           → Chậm nhất
```

**Demo 4 — Hoạt hình đi bộ:**
```
forever
  next costume     ← Tự động chuyển costume
  wait (0.2) seconds
  move (10) steps
  if on edge, bounce
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Đêm Pháo Hoa":**

```
Nền: Thành phố ban đêm (City with Water)
Sprite 1: Tia sáng nhỏ (Sprite hình tròn)

Script pháo hoa 1 (repeat):
  when green flag clicked
  repeat (20)
    go to x:(0) y:(-150)  ← Bắt đầu từ dưới
    repeat (30)
      change y by (8)     ← Bay lên
      change [color] effect by (10)
    
    repeat (15)
      change size by (5)   ← Nổ ra
      change [ghost] effect by (5)  ← Mờ dần
    
    set size to (10)%
    clear graphic effects
    start sound [Zap]

Script pháo hoa 2 (forever):
  Sprite 2 ở vị trí khác
  when green flag clicked
  forever
    go to (random position)
    show
    repeat (10)
      change size by (8)
      change [color] effect by (15)
    hide
    wait (0.5) seconds
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách vòng lặp:**
- **Hoạt hình thở:** Nhân vật `change size by (3)` 10 lần, rồi `change size by (-3)` 10 lần, trong `forever`
- **Đèn nhấp nháy:** `forever { set [ghost] effect to (0); wait (0.5); set [ghost] effect to (100); wait (0.5) }`
- **Đám mây trôi:** Nhiều đám mây, mỗi cái tốc độ khác nhau trong `forever`

### Nộp & Nhận xét (5 phút)

- Demo pháo hoa của cả lớp
- Hỏi: *"Dự án của bạn dùng loại vòng lặp nào? `repeat` hay `forever`? Tại sao?"*
- Thảo luận: *"Khi nào nên dùng `repeat`, khi nào nên dùng `forever`?"*

---

## 🚀 Project học sinh tự làm

**"Thành Phố Không Ngủ"**

Tạo cảnh thành phố về đêm với:
1. **Xe ô tô** (forever): Chạy từ phải sang trái, ẩn khi ra khỏi màn hình, xuất hiện lại từ phải
2. **Ngôi sao** (forever + wait): Nhấp nháy liên tục (ghost effect 0 → 100 → 0)
3. **Mưa** (repeat 50): 50 giọt mưa rơi từ trên xuống
4. **Đồng hồ đếm** (repeat 60): Tick-tock 60 lần (1 phút), rồi chuông điểm giờ
5. Nhạc nền city đêm phát liên tục

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Chương trình đứng, không làm gì | `forever` trong 1 nhân vật block các script khác | Mỗi `forever` nên trong script riêng; các script Scratch chạy song song |
| Vòng lặp chạy quá nhanh | Không có `wait` | Thêm `wait (0.05) seconds` hoặc lớn hơn bên trong vòng lặp |
| Nhân vật biến mất khỏi màn hình | `move` trong `forever` không có `if on edge, bounce` | Thêm `if on edge, bounce` hoặc giới hạn tọa độ |
| `repeat (10)` chạy 1 lần rồi thôi | Nhầm block: dùng `wait` thay vì `repeat` | Kiểm tra lại block, đảm bảo là `repeat` không phải `wait` |
| Hoạt hình quá giật | `wait` quá lớn | Giảm `wait` xuống 0.1-0.2 giây; kiểm tra số costume |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Đếm vòng lặp:** Tạo dự án nhân vật nhảy tại chỗ đúng 10 lần (dùng `repeat`), mỗi cái mất 0.3 giây, sau đó nói "Mệt quá! 😅".

2. **Bài 2 — Hoạt hình đi bộ:** Chọn Sprite có costume đi bộ (ví dụ: Avery, Kai). Tạo hoạt hình đi bộ mượt mà bằng `forever { next costume; wait (0.2); move (5); if on edge, bounce }`.

3. **Bài 3 — Đồng hồ:** Tạo kim đồng hồ (Sprite mảnh dài) xoay liên tục: `forever { turn (6) degrees; wait (1) seconds }` → Đây là kim giây!

4. **Bài 4 — Cầu vồng:** Nhân vật di chuyển và liên tục đổi màu bằng `forever { change [color] effect by (5); move (2) steps; if on edge, bounce }`.

5. **Bài 5 — Phân tích:** Tìm 3 dự án trên Scratch sử dụng vòng lặp. Giải thích: dự án đó dùng `repeat` hay `forever`? Tại sao tác giả chọn loại vòng lặp đó?

---

## 🏅 Huy hiệu hoàn thành

> 🔄 **"Vua Vòng Lặp"**
>
> Học sinh đã hiểu và sử dụng thành thạo các loại vòng lặp trong Scratch!
> Biết khi nào dùng `repeat`, `forever`, và kết hợp với `wait` để tạo hoạt hình mượt mà.
>
> ⭐ Tiêu chí: Dự án có ít nhất 1 `forever` và 1 `repeat`, tạo ra chuyển động/hoạt hình có thể quan sát được.
