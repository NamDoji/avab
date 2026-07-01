# Chuyên đề 3: Đi Trong Mê Cung 🗺️

## 🎯 Mục tiêu học tập
- Hiểu được khái niệm tìm đường (pathfinding) trong không gian có vật cản
- Biết lập kế hoạch trước khi di chuyển — nhìn toàn bộ bản đồ trước khi ra lệnh
- Thực hành viết chuỗi lệnh (tiến/lùi/trái/phải) để dẫn robot qua mê cung
- Biết thử nhiều đường khác nhau và chọn đường đúng/ngắn hơn

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Pathfinding / Navigation
- **Giải thích bằng ngôn ngữ trẻ em:** Pathfinding là cách tìm đường đi từ chỗ này đến chỗ kia khi có nhiều thứ chặn đường. Giống như khi đi từ nhà đến trường mà có đường bị kẹt xe, mình phải tìm đường khác vậy!
- **Ví dụ thực tế:** Google Maps tìm đường cho xe hơi đi tránh kẹt xe; robot hút bụi Roomba tự tìm đường đi xung quanh bàn ghế trong nhà

## 🤖 Câu chuyện dẫn nhập
Robi bị lạc trong một kho báu khổng lồ! Xung quanh có rất nhiều bức tường và cạm bẫy 🧱. Robi nhìn thấy ánh sáng vàng óng của kho báu ở cuối mê cung nhưng không biết phải đi đường nào. Nếu Robi đi sai đường, sẽ va vào tường và bị "đứng đơ"! 😱 May mắn thay, Robi có một chiếc bản đồ nhỏ và chờ các em Lập Trình Viên Nhí ra lệnh dẫn đường. Các em có sẵn sàng cứu Robi và tìm kho báu không? 🏆

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| Mê cung (Maze) | Đường đi phức tạp với nhiều ngõ cụt | Mê cung trong sách truyện |
| Vật cản (Obstacle) | Thứ chặn đường không cho đi qua | Bức tường, hố sâu |
| Tìm đường (Pathfinding) | Cách tìm ra đường đi đúng | GPS tìm đường |
| Lối ra (Exit) | Điểm đích cần đến | Cửa ra của mê cung |
| Thử — Sai (Try & Error) | Thử một cách, nếu sai thì thử cách khác | Thử mở hộp bằng chìa khóa khác |
| Bản đồ (Map) | Hình vẽ cho thấy đường đi và vật cản | Bản đồ Google Maps |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Mù quáng dẫn đường":** Một học sinh bịt mắt, một học sinh khác dùng LỜI NÓI dẫn đường đi vòng quanh lớp tránh ghế bàn.
- Chỉ được dùng: "Tiến 2 bước, Quay phải, Tiến 1 bước..."
- Không được chạm tay vào nhau!
- Vui nhộn và giúp học sinh cảm nhận thực sự việc "ra lệnh dẫn đường" quan trọng như thế nào

### 📖 Bài học chính (15 phút)
1. **Giới thiệu mê cung:** Cho xem hình mê cung đơn giản trên bảng (lưới 4x4 có vài ô bị chặn)
2. **Cách đọc bản đồ lưới:** Dạy ký hiệu ô trống (đi được), ô đen (vật cản), ô xuất phát (🟢), ô đích (🏆)
3. **Chiến thuật đơn giản:** "Trước khi ra lệnh, hãy nhìn toàn bộ bản đồ trước — lập kế hoạch!"
4. **Demo cùng lớp:** Giáo viên vẽ mê cung nhỏ lên bảng, cả lớp cùng tìm đường

### 🤖 Robot Challenge (10 phút)
**"Dẫn đường cho Robi":** Mỗi học sinh nhận tờ giấy có mê cung khác nhau (3 cấp độ: dễ/trung bình/khó).
- Vẽ đường đi bằng bút màu
- Sau đó chuyển sang viết chuỗi lệnh bên cạnh: Tiến, Phải, Tiến, Tiến...
- Giáo viên đi quanh kiểm tra

### 🎲 Mini Game (10 phút)
**"Mê cung sàn nhà":** Dùng băng keo dán mê cung trên sàn lớp (hoặc vẽ phấn nếu có sân).
- Một học sinh đóng vai Robot đứng vào ô xuất phát
- Cả lớp cùng đồng thanh ra lệnh từng bước một
- Mỗi nhóm được thử một lần, ai dẫn Robot đến đích thắng!

### 📝 Tổng kết & BTVN (5 phút)
- Ôn lại: "Trước khi ra lệnh phải làm gì?" → "Nhìn toàn bộ bản đồ trước!"
- Giao bài tập về nhà
- Giới thiệu ứng dụng/web mê cung trực tuyến để em chơi thêm

## 🏆 Robot Challenge
**Nhiệm vụ: Dẫn Robi qua Mê Cung Kho Báu!**

```
🟢 . . ⬛ .
.  ⬛ . .  .
.  ⬛ ⬛ . .
.  .  . ⬛ .
.  .  . .  🏆
```
*(🟢 = Robi xuất phát, 🏆 = Kho báu, ⬛ = Tường)*

Học sinh viết chuỗi lệnh: Ví dụ: Tiến → Tiến → Phải → Phải → Tiến → ...

**Quy tắc:**
- Không được đi vào ô ⬛
- Cố gắng tìm đường ngắn nhất
- Viết đầy đủ từng bước lệnh

**Bonus:** Có bao nhiêu đường khác nhau để đến kho báu? Thử tìm ít nhất 2 đường!

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. 🎨 Vẽ mê cung đơn giản của riêng em (lưới 4x4, tự vẽ tường) rồi mang đến lớp cho bạn giải
2. 📱 Chơi game mê cung trên điện thoại/máy tính bảng cùng bố mẹ ít nhất 10 phút
3. 🏠 Quan sát đường đi từ phòng ngủ đến nhà bếp trong nhà em — vẽ sơ đồ đơn giản
4. 🗺️ Cùng bố/mẹ dùng Google Maps xem đường đến siêu thị — hỏi "Sao có nhiều đường vậy?"
5. ✏️ Hoàn thành tờ bài tập 3 mê cung (cấp độ: dễ → vừa → khó) trong tờ bài tập đính kèm

## 💡 Gợi ý AI hỗ trợ
- **AI tạo mê cung:** Hỏi AI "Mô tả cho em một mê cung đơn giản 4x4 với 3 bức tường để em giải nhé" — AI sẽ tạo mê cung bằng chữ
- **AI kiểm tra lời giải:** Học sinh mô tả đường đi của mình, AI phân tích "Em đi đường này có gặp tường không?"
- **AI giải thích GPS:** Hỏi "AI ơi, Google Maps tìm đường cho xe hơi như thế nào?" — AI giải thích bằng ngôn ngữ dễ hiểu

## 🏅 Huy hiệu hoàn thành
**🗺️ Huy Hiệu "Thám Tử Mê Cung"** — Dành cho em đã dũng cảm dẫn Robi qua mê cung nguy hiểm và tìm được kho báu! Em chính là Nhà Thám Hiểm Tài Ba nhất lớp! 🏆✨
