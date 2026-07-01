# Chuyên đề 10: Clone Và Nhiều Đối Tượng

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Hiểu khái niệm clone — tạo bản sao của nhân vật
- Sử dụng `create clone of` để tạo nhiều đối tượng cùng loại
- Dùng `when I start as a clone` để điều khiển từng clone riêng
- Xóa clone với `delete this clone`
- Tạo game có nhiều kẻ thù, đạn bắn, hoặc hiệu ứng hạt (particle)

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `create clone of [myself]` | Control | Tạo 1 bản sao của nhân vật hiện tại |
| `create clone of [Sprite1]` | Control | Tạo 1 bản sao của Sprite khác |
| `when I start as a clone` | Control | Script chạy khi clone mới được tạo |
| `delete this clone` | Control | Xóa clone này khỏi sân khấu |
| `[timer]` | Sensing | Dùng timer để tạo clone theo thời gian |
| `pick random` | Operators | Vị trí/tốc độ ngẫu nhiên cho từng clone |
| `<touching [Sprite]?>` | Sensing | Kiểm tra clone có chạm nhân vật khác không |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Clone | Bản sao / Nhân bản |
| Original | Bản gốc |
| Instance | Thể hiện |
| Particle | Hạt (hiệu ứng hạt) |
| Spawn | Tạo ra / Xuất hiện |
| Delete | Xóa |
| Bullet | Đạn |
| Enemy | Kẻ thù |
| Wave | Làn sóng (đợt kẻ thù) |
| Swarm | Bầy đàn |

---

## 🎬 Project mẫu (mô tả)

**"Vũ Trụ Bắn Súng 🚀"**

Space shooter đơn giản:

- **Tàu vũ trụ** (người chơi): Di chuyển trái/phải ở dưới màn hình
- **Đạn** (clone): Nhấn Space → tạo clone đạn bay lên, xóa khi ra khỏi màn hình hoặc chạm kẻ thù
- **Thiên thạch** (clone): Cứ 1.5 giây tạo 1 thiên thạch mới, rơi từ trên xuống ở vị trí X ngẫu nhiên
- **Nổ** (clone): Khi đạn chạm thiên thạch → tạo clone hiệu ứng nổ, to dần rồi xóa
- `Score` tăng mỗi thiên thạch bị phá, `Lives` giảm khi thiên thạch chạm tàu

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🧬 **Trò chơi "Sao Chép Người":**
- 1 học sinh đứng lên, giơ tay phải
- Giáo viên hô: *"Clone!"* → 2 học sinh nữa đứng lên và làm y hệt (giơ tay phải)
- Hô tiếp: *"Clone!"* → 2 bạn nữa đứng lên
- Hỏi: *"Các bản sao có giống nhau không? Cái gì khác nhau?"*
- Giải thích: Clone trong Scratch cũng vậy — tất cả giống bản gốc nhưng có thể ở vị trí/trạng thái khác nhau!

### Xem sản phẩm mẫu (5 phút)

Chiếu game "Vũ Trụ Bắn Súng":
- Nhấn Space liên tục, thấy nhiều đạn cùng bay
- Hỏi: *"Làm thế nào chỉ có 1 Sprite đạn mà có nhiều viên đạn bay cùng lúc?"*
- Mở "See Inside": *"Ồ! Chỉ có 1 Sprite Bullet, nhưng dùng clone tạo ra nhiều bản sao!"*

### Học block mới (10 phút)

**Phần 1 — Clone cơ bản:**
```
Sprite "Bong bóng":
  Script gốc (ẩn bản gốc):
    when green flag clicked
    hide ← Ẩn bản gốc, chỉ thấy các clone
    forever
      create clone of [myself] ← Tạo clone mới mỗi 0.5 giây
      wait (0.5) seconds

  Script clone:
    when I start as a clone
    show ← Clone hiện ra
    go to x:(pick random (-230) to (230)) y:(-170) ← Vị trí ngẫu nhiên dưới
    repeat until <[y position] > [180]>
      change y by (5) ← Bay lên
      change [color] effect by (5)
    delete this clone ← Xóa khi ra khỏi màn hình
```

**Phần 2 — Clone tương tác:**
```
Script clone kẻ thù:
  when I start as a clone
  show
  forever
    change y by (-3)
    if <[y position] < [-180]> then
      delete this clone ← Ra khỏi màn hình → xóa
    
    if <touching [Player]?> then
      change [Lives] by (-1) ← Trừ mạng
      delete this clone ← Kẻ thù biến mất
```

**Phần 3 — Đạn từ người chơi:**
```
Script Player:
  when [space] key pressed
  create clone of [Bullet] ← Tạo đạn

Script Bullet:
  when green flag clicked
  hide
  
  when I start as a clone
  show
  go to x:(x position of [Player]) y:(y position of [Player])
  ← Xuất hiện tại vị trí tàu
  repeat until <[y position] > [180]>
    change y by (10) ← Đạn bay lên nhanh
    if <touching [Enemy]?> then
      change [Score] by (10)
      delete this clone ← Đạn biến mất khi trúng
  delete this clone ← Biến mất khi ra khỏi màn hình
```

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Cơn Mưa Sao Băng":**

```
Nền: Bầu trời đêm (Stars backdrop)

Sprite "Sao Băng":
=== Script GỐC ===
  when green flag clicked
  hide
  forever
    create clone of [myself]
    wait (pick random (0.3) to (1)) seconds ← Tần suất ngẫu nhiên

=== Script CLONE ===
  when I start as a clone
  show
  set size to (pick random (10) to (50))%  ← Kích thước ngẫu nhiên
  set [color] effect to (pick random (0) to (200))  ← Màu ngẫu nhiên
  go to x:(pick random (-240) to (240)) y:(180)
  point in direction (pick random (120) to (150)) ← Góc rơi ngẫu nhiên
  
  repeat until <<[y position] < [-180]> or <[x position] > [240]>>
    move (pick random (5) to (15)) steps
    change [ghost] effect by (1) ← Mờ dần
  delete this clone

Sprite "Tay" (theo chuột):
  when green flag clicked
  forever
    go to (mouse pointer)
  
  → Khi chạm sao băng → sao băng xóa + cộng điểm

Cập nhật script clone:
  if <touching [Hand]?> then
    change [Score] by (1)
    play sound [Pop]
    delete this clone
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách clone nâng cao:**
- **Hiệu ứng nổ:** Khi nhấp vào bất kỳ đâu, tạo 10 clone bay ra mọi hướng như pháo hoa
- **Bầy cá:** 1 Sprite cá nhân bản 20 lần, mỗi clone di chuyển theo hướng hơi khác nhau
- **Chữ rơi:** Clone chữ cái A-Z, mỗi chữ rơi theo tốc độ khác nhau

### Nộp & Nhận xét (5 phút)

- Thi xem ai bắt được nhiều sao băng nhất trong 30 giây
- Hỏi: *"Script gốc làm gì? Script clone làm gì? Khác nhau chỗ nào?"*
- Thảo luận: *"Nếu không có clone, làm game bắn súng cần bao nhiêu Sprite đạn?"*

---

## 🚀 Project học sinh tự làm

**"Tower Defense Mini 🏰"**

Xây dựng game tower defense đơn giản:
1. **Kẻ thù (clone):** Liên tục xuất hiện từ một phía, đi theo đường đến "lâu đài"
2. **Đạn (clone):** Tháp canh tự động bắn đạn mỗi 1 giây
3. **Hiệu ứng nổ (clone):** Khi đạn trúng kẻ thù → hiệu ứng nổ nhỏ
4. `Score`: Cộng khi kẻ thù bị tiêu diệt
5. `Lives`: Trừ khi kẻ thù đến lâu đài
6. **Nếu** Lives = 0 → Game Over; **Nếu** Score = 50 → Chiến thắng!

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Quá nhiều clone làm Scratch lag | Tạo clone quá nhanh, không xóa | Tăng thời gian `wait` khi tạo clone; đảm bảo clone có `delete this clone` |
| Clone không hiện ra | Quên `show` trong `when I start as a clone` | Thêm `show` ngay đầu script clone |
| Clone hiện sai vị trí | `go to` sau `show` thay vì trước | Đặt `go to` TRƯỚC `show` để tránh nhấp nháy |
| Script gốc bị ảnh hưởng bởi clone | Nhầm script: viết vào gốc thay vì clone | Nhớ: Gốc dùng `when green flag clicked` + `hide`; Clone dùng `when I start as a clone` |
| Clone không xóa được | Không có điều kiện kết thúc | Luôn có ít nhất 1 `delete this clone` trong mỗi đường ra của script clone |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Bong bóng bay:** Tạo dự án bong bóng bay lên từ dưới màn hình mỗi 0.5 giây. Nhấp vào bong bóng → nổ và xóa. Tính điểm.

2. **Bài 2 — Làn sóng kẻ thù:** Tạo game có 3 làn sóng kẻ thù. Làn 1: 3 kẻ thù. Làn 2: 5 kẻ thù nhanh hơn. Làn 3: 7 kẻ thù nhanh nhất.

3. **Bài 3 — Hiệu ứng hạt:** Khi nhấp vào màn hình, tạo 15 clone hạt nhỏ bay ra mọi hướng (dùng `pick random` cho góc di chuyển), mờ dần rồi xóa.

4. **Bài 4 — Sửa game cũ:** Thêm hệ thống clone vào game chuyên đề 9. Thêm kẻ thù clone di chuyển ngẫu nhiên trên bản đồ; nhân vật chính né tránh.

5. **Bài 5 — Phân tích:** Mở 2 dự án Scratch bất kỳ trên scratch.mit.edu dùng clone. Giải thích: Clone được tạo khi nào? Script clone làm gì? Clone bị xóa khi nào?

---

## 🏅 Huy hiệu hoàn thành

> 🧬 **"Phù Thủy Nhân Bản"**
>
> Học sinh đã biết sử dụng clone để tạo nhiều đối tượng động trong game!
> Thành thạo `create clone`, `when I start as a clone`, `delete this clone`, và quản lý clone với random position.
>
> ⭐ Tiêu chí: Dự án có ít nhất 1 loại clone tự tạo và tự xóa, với vị trí/tốc độ ngẫu nhiên khác nhau giữa các clone.
