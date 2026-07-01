# Chuyên đề 2: Nhân Vật Di Chuyển

## 🎯 Mục tiêu

Sau buổi học này, học sinh có thể:
- Sử dụng các block trong nhóm **Motion** để di chuyển nhân vật
- Hiểu hệ tọa độ đơn giản của Scratch (trái/phải, lên/xuống)
- Dùng `Move`, `Turn`, `Glide` để tạo chuyển động
- Tạo hoạt cảnh nhân vật đi lại trên sân khấu
- Kết hợp di chuyển với câu thoại để tạo câu chuyện đơn giản

---

## 🐱 Block Scratch cần học

| Block | Nhóm | Chức năng |
|-------|------|-----------|
| `move [10] steps` | Motion | Di chuyển nhân vật tiến về phía trước N bước |
| `turn ↻ [15] degrees` | Motion | Xoay nhân vật sang phải N độ |
| `turn ↺ [15] degrees` | Motion | Xoay nhân vật sang trái N độ |
| `glide [1] secs to x:[0] y:[0]` | Motion | Trượt đến vị trí trong N giây |
| `go to x:[0] y:[0]` | Motion | Nhảy ngay đến vị trí |
| `go to [random position]` | Motion | Nhảy đến vị trí ngẫu nhiên |
| `point in direction [90]` | Motion | Quay mặt về hướng nhất định |
| `if on edge, bounce` | Motion | Bật lại khi chạm mép sân khấu |
| `set rotation style [left-right]` | Motion | Cài kiểu xoay của nhân vật |
| `wait [1] seconds` | Control | Dừng N giây rồi tiếp tục |

---

## 💡 Từ khóa tiếng Anh

| Tiếng Anh | Nghĩa tiếng Việt |
|-----------|-----------------|
| Motion | Chuyển động |
| Steps | Bước đi |
| Degrees | Độ (góc xoay) |
| Glide | Trượt mượt mà |
| Direction | Hướng |
| Edge | Mép/Cạnh |
| Bounce | Bật lại |
| Random | Ngẫu nhiên |
| Position | Vị trí |
| Rotation | Xoay |

---

## 🎬 Project mẫu (mô tả)

**"Cuộc Phiêu Lưu Của Mèo Scratch"**

Mèo Scratch bắt đầu từ góc trái sân khấu. Khi nhấn cờ xanh:
1. Mèo trượt từ góc trái sang phải trong 2 giây, nói *"Tớ đang đi đây!"*
2. Mèo xoay 180 độ, trượt ngược lại
3. Mèo nhảy đến vị trí ngẫu nhiên, nói *"Ồ! Tớ ở đâu vậy?"*
4. Mèo trượt về trung tâm sân khấu
5. Mèo xoay tròn vui vẻ (turn 360 độ)

Dự án minh họa sự mượt mà của `glide` so với `go to` và `move`.

---

## 🎮 Hoạt động lớp (45-60 phút)

### Warm-up (5 phút)

🎲 **Trò chơi "Robot Người":**
- Giáo viên là "lập trình viên", 1 học sinh làm "robot"
- Giáo viên ra lệnh: *"Đi 5 bước về phía trước!"*, *"Quay phải 90 độ!"*, *"Trượt đến bàn của cô trong 3 giây!"*
- Robot thực hiện đúng lệnh
- Hỏi học sinh: *"Trong Scratch, mình dùng block nào để ra lệnh như vậy?"*

### Xem sản phẩm mẫu (5 phút)

Giáo viên chiếu dự án "Cuộc Phiêu Lưu Của Mèo Scratch":
- Chạy dự án và hỏi: *"Mèo di chuyển như thế nào? Nhanh hay chậm?"*
- So sánh `move` (giật cục) vs `glide` (mượt mà)
- Hỏi: *"Các bạn muốn nhân vật của mình đi đâu?"*

### Học block mới (10 phút)

**Demo từng block trong Motion:**

1. **`move [10] steps`** — Kéo ra, nhấn block, mèo tiến 10 bước. Đổi thành 100, nhấn lại. *"Số lớn hơn → đi xa hơn!"*

2. **`turn ↻ [15] degrees`** — Nhấn nhiều lần, mèo xoay. *"360 độ là xoay tròn một vòng!"*

3. **`glide [2] secs to x:[0] y:[0]`** — Mèo trượt mượt đến giữa sân khấu. *"Đây là cách di chuyển đẹp nhất!"*

4. **`if on edge, bounce`** — Kết hợp với `forever` để mèo đi qua đi lại.

5. **`set rotation style [left-right]`** — Ngăn mèo bị lộn ngược.

📌 **Thủ thuật:** Nhấn đúp vào số trong block để chỉnh sửa!

### Làm theo hướng dẫn (15-20 phút)

**Xây dựng "Chú Bướm Dạo Chơi":**

```
Bước 1: Chọn Sprite là con bướm (Butterfly)
Bước 2: Chọn Backdrop là vườn hoa (Garden)
Bước 3: Xây dựng script:

when green flag clicked
go to x:(-180) y:(0)        ← Bắt đầu từ bên trái
say [Tớ sẽ dạo vườn hoa!] for (2) seconds
glide (2) secs to x:(0) y:(80)    ← Trượt lên trên
glide (2) secs to x:(180) y:(0)   ← Trượt sang phải
glide (2) secs to x:(0) y:(-80)   ← Trượt xuống dưới
glide (2) secs to x:(-180) y:(0)  ← Trở về
say [Vườn đẹp quá!] for (2) seconds
```

### Sáng tạo thêm (10 phút)

🌟 **Thử thách nâng cao:**
- Thêm nhân vật thứ 2 di chuyển theo hướng ngược lại
- Tạo hiệu ứng "nhảy": dùng `glide` lên cao rồi xuống
- Làm nhân vật "theo dấu chuột": dùng `go to [mouse pointer]` trong `forever`
- Thêm câu thoại tại mỗi điểm dừng

### Nộp & Nhận xét (5 phút)

- Học sinh demo dự án cho bạn bên cạnh xem
- Cả lớp bình chọn: *"Nhân vật nào di chuyển đẹp nhất?"*
- Giáo viên nhận xét và gợi ý cải thiện

---

## 🚀 Project học sinh tự làm

**"Cuộc Đua Ngẫu Nhiên"**

Tạo dự án trong đó:
1. Có 2-3 nhân vật (xe đua, động vật, robot...)
2. Mỗi nhân vật bắt đầu từ vị trí khác nhau bên trái
3. Khi nhấn cờ xanh, tất cả cùng `glide` đến đích (bên phải)
4. Nhân vật đến đích nói: *"Tớ thắng rồi! 🏆"*

**Gợi ý:** Dùng thời gian `glide` khác nhau cho mỗi nhân vật (1 giây, 2 giây, 3 giây) để tạo cuộc đua thú vị!

---

## ❌ Lỗi thường gặp & Cách debug

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Nhân vật bị lộn ngược khi di chuyển | Rotation style chưa được cài | Thêm block `set rotation style [left-right]` ở đầu script |
| `move` nhưng nhân vật không đi theo chiều mong muốn | Nhân vật đang quay sai hướng | Dùng `point in direction [90]` (phải) hoặc `[-90]` (trái) trước |
| Nhân vật đi ra khỏi sân khấu | Quá nhiều steps hoặc tọa độ sai | Dùng `if on edge, bounce` hoặc kiểm tra lại số trong `glide` |
| `glide` quá nhanh, không thấy chuyển động | Thời gian quá nhỏ (0.1 giây) | Tăng thời gian lên 1-2 giây |
| Nhiều block `go to` không có `wait` giữa | Chương trình chạy quá nhanh | Thêm `wait [1] seconds` giữa các lệnh di chuyển |

---

## 📝 Bài tập về nhà (5 bài)

1. **Bài 1 — Vẽ hình:** Dùng block Motion làm nhân vật vẽ hình chữ nhật (đi 4 đoạn, mỗi đoạn xoay 90 độ). *Gợi ý: move 100, turn 90, lặp lại 4 lần.*

2. **Bài 2 — Đếm bước:** Thử các giá trị `move` khác nhau (10, 50, 100, 200). Chụp màn hình hoặc ghi lại: ở mỗi giá trị, nhân vật đi đến đâu?

3. **Bài 3 — Câu chuyện:** Tạo hoạt cảnh ngắn (ít nhất 5 lệnh `glide`) kể một câu chuyện về nhân vật đi từ nhà đến trường.

4. **Bài 4 — Theo chuột:** Tạo dự án nhân vật luôn chạy theo con trỏ chuột. *Gợi ý: `forever` + `go to [mouse pointer]`.*

5. **Bài 5 — Khám phá:** Mở dự án của người khác trên Scratch, nhấn "See Inside" để xem code. Tìm và ghi lại 3 block Motion mà họ đã dùng.

---

## 🏅 Huy hiệu hoàn thành

> 🏃 **"Tay Đua Nhí"**
>
> Học sinh đã thành thạo các block Motion của Scratch!
> Biết dùng `move`, `turn`, `glide` để tạo chuyển động mượt mà và thú vị.
>
> ⭐ Tiêu chí: Dự án có nhân vật di chuyển qua ít nhất 3 vị trí khác nhau bằng cách sử dụng `glide`.
