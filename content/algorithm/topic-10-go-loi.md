# Chuyên đề 10: Gỡ Lỗi 🔧

## 🎯 Mục tiêu học tập
- Hiểu được khái niệm "lỗi" (bug) trong lập trình và tại sao lỗi xảy ra
- Biết quy trình gỡ lỗi: Phát hiện lỗi → Tìm nguyên nhân → Sửa lỗi → Kiểm tra lại
- Rèn tính kiên nhẫn, không sợ mắc lỗi — lỗi là cơ hội để học!
- Thực hành tìm và sửa lỗi trong chương trình robot đơn giản

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Debugging (Gỡ lỗi)
- **Giải thích bằng ngôn ngữ trẻ em:** Debugging là khi chương trình không chạy đúng và em phải tìm ra xem sai ở đâu rồi sửa lại. Giống như khi bài toán ra kết quả sai — em không vứt đi mà tìm chỗ tính sai rồi sửa lại! Lập trình viên gỡ lỗi hàng ngày — đó là việc bình thường và thú vị!
- **Ví dụ thực tế:** Khi xe hơi bị hỏng, thợ sửa xe tìm nguyên nhân từng bộ phận. Khi điện thoại bị lag, kỹ sư xem log để tìm lỗi. Ngay cả phần mềm của NASA cũng có lỗi cần sửa!

## 🤖 Câu chuyện dẫn nhập
Robi vừa được lập trình để nhảy múa trong tiệc sinh nhật 🎂! Nhưng khi màn trình diễn bắt đầu, Robi lại... quay tròn tại chỗ mãi không dừng, rồi bỗng dưng đi giật lùi ra khỏi sân khấu, cuối cùng va vào bánh sinh nhật! 😱💥 Cả tiệc nhìn ngớ ngẩn. Chủ tiệc khóc vì bánh hỏng! Robi không biết mình sai ở đâu vì robots không tự biết mình sai — cần người kiểm tra! Hôm nay, các em sẽ trở thành **Thám Tử Lỗi** — tìm ra bug trong chương trình nhảy múa của Robi và sửa cho Robi biểu diễn đúng! 💃🕺

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| Lỗi / Bug | Sai sót trong chương trình | Lệnh "Tiến" bị ghi thành "Lùi" |
| Gỡ lỗi (Debug) | Tìm và sửa lỗi | Tìm chỗ sai → sửa lại |
| Kiểm tra (Test) | Chạy thử chương trình sau khi sửa | Thử lại xem đúng chưa |
| Nguyên nhân | Lý do tại sao có lỗi | Viết sai lệnh, sai thứ tự |
| Kết quả mong muốn | Chương trình phải làm gì | Robi đi đến đích |
| Kết quả thực tế | Chương trình thực sự làm gì | Robi đi sai hướng |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Tìm lỗi sai trong câu":** Giáo viên viết lên bảng các câu CÓ LỖI, học sinh tìm và sửa:
- "Con mèo sủa gâu gâu" → Lỗi: mèo kêu "meo meo"!
- "1 + 1 = 3" → Lỗi: bằng 2!
- "Mặt trời mọc phía Tây" → Lỗi: mọc phía Đông!
- "NẾU trời mưa THÌ đi tắm nắng" → Lỗi logic!
Ai tìm ra lỗi và sửa đúng đầu tiên nhận sticker 🌟

### 📖 Bài học chính (15 phút)
1. **Bug là gì và từ đâu ra?** — Câu chuyện thú vị: Năm 1947, máy tính Harvard Mark II bị lỗi vì có con bọ (bug = con bọ tiếng Anh) chui vào mạch điện! Từ đó "bug" = lỗi máy tính!
2. **4 bước gỡ lỗi:** Phát hiện → Hiểu chương trình đang làm gì → Tìm chỗ sai → Sửa và kiểm tra
3. **Lỗi phổ biến nhất:** Sai thứ tự lệnh, thiếu lệnh, dùng lệnh sai
4. **Quan trọng:** Lỗi là chuyện bình thường! Mọi lập trình viên đều gặp lỗi. Biết gỡ lỗi mới là giỏi!

### 🤖 Robot Challenge (10 phút)
**"Bác Sĩ Robot":** Mỗi nhóm nhận "hồ sơ bệnh án" của Robi — gồm chương trình bị lỗi và mô tả kết quả sai. Nhiệm vụ: Chẩn đoán bệnh và kê đơn thuốc (sửa lỗi)!

Ví dụ hồ sơ:
- **Triệu chứng:** Robi cần đi đến ô (3,3) nhưng lại đứng ở (3,1)
- **Chương trình gốc:** Tiến, Tiến, Tiến, Phải, Tiến
- **Chẩn đoán:** ??? | **Sửa lỗi:** ???

### 🎲 Mini Game (10 phút)
**"Tìm lỗi trong bản nhạc":** Giáo viên vỗ tay theo "thuật toán vỗ tay" đã dạy — nhưng cố tình sai ở một chỗ. Học sinh lắng nghe và giơ tay khi nghe thấy lỗi!
- Vòng 1: Lỗi rõ ràng
- Vòng 2: Lỗi tinh tế hơn
- Vòng 3: Học sinh tự tạo "chương trình" vỗ tay và bạn tìm lỗi

### 📝 Tổng kết & BTVN (5 phút)
- Nhấn mạnh: "Gặp lỗi không phải thất bại — gặp lỗi là cơ hội học hỏi!"
- Chia sẻ: "Hôm nay em sửa được lỗi nào rồi? Em cảm thấy thế nào khi sửa xong?"
- Giao bài tập về nhà

## 🏆 Robot Challenge
**Nhiệm vụ: Sửa chương trình nhảy múa cho Robi!**

Chương trình nhảy múa (BỊ LỖI) của Robi:
```
Bước 1: Bật nhạc
Bước 2: Quay phải 3 lần
Bước 3: Lặp 5 lần: [Nhảy lên, Nhảy lên, Nhảy lên]
Bước 4: Chào khán giả
Bước 5: Dừng nhạc
Bước 6: Cúi chào
```

**Vấn đề được báo cáo:**
❌ Robi quay quá nhiều và bị chóng mặt
❌ Robi nhảy 15 lần liên tục mà không dừng nghỉ
❌ Robi cúi chào TRƯỚC khi dừng nhạc — trông kỳ lạ!

**Nhiệm vụ của em:**
1. Xác định BUG ở đâu trong từng bước
2. Đề xuất sửa lỗi cho từng bug
3. Viết lại chương trình đã sửa hoàn chỉnh
4. Mô tả Robi sẽ nhảy như thế nào sau khi sửa

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. 🍳 Nhờ bố/mẹ nấu một món ăn theo công thức — quan sát xem có bước nào bị bỏ qua hay làm sai không?
2. ✏️ Làm một bài toán cộng/trừ, rồi đổi bài cho bạn kiểm tra — tìm lỗi cho nhau (gỡ lỗi bài toán!)
3. 🎨 Vẽ sơ đồ "4 bước gỡ lỗi" bằng tranh minh họa vui nhộn
4. 🧩 Lắp ghép mô hình Lego — nếu mắc lỗi (ghép nhầm), gỡ ra và lắp lại đúng — đó là debugging!
5. ✏️ Hoàn thành tờ bài tập "Tìm bug trong chương trình" — 4 chương trình robot bị lỗi cần sửa (đính kèm)

## 💡 Gợi ý AI hỗ trợ
- **AI tạo chương trình lỗi:** Hỏi "Tạo cho em một chương trình robot đơn giản có 2 lỗi để em tìm và sửa nhé" — AI tạo bài tập debugging
- **AI giải thích lỗi:** Học sinh mô tả lỗi mình gặp và hỏi "Em sai ở bước nào?" — AI gợi ý hướng tìm lỗi (không nói thẳng đáp án)
- **AI chia sẻ câu chuyện bug:** Hỏi "Kể cho em nghe câu chuyện về lỗi phần mềm nổi tiếng nào thú vị nhé!" — AI kể các câu chuyện bug thực tế hài hước

## 🏅 Huy hiệu hoàn thành
**🔧 Huy Hiệu "Thám Tử Lỗi Cao Thủ"** — Dành cho em đã tìm ra tất cả bug trong chương trình nhảy múa và cứu buổi tiệc sinh nhật của Robi! Em không sợ lỗi — em THÍCH sửa lỗi! 🐛→✅✨
