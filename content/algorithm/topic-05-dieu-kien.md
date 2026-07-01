# Chuyên đề 5: Điều Kiện 🚦

## 🎯 Mục tiêu học tập
- Hiểu được câu điều kiện "Nếu... thì..." (If/Then) trong lập trình
- Biết phân biệt trường hợp "điều kiện đúng" và "điều kiện sai"
- Thực hành viết câu điều kiện đơn giản cho robot
- Thấy được câu điều kiện xuất hiện ở khắp nơi trong cuộc sống hàng ngày

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Conditional Statement / If-Then
- **Giải thích bằng ngôn ngữ trẻ em:** Câu điều kiện là khi robot (hoặc máy tính) hỏi một câu hỏi và làm khác nhau tùy theo câu trả lời. Giống như: "NẾU trời mưa → THÌ mang ô đi / KHÔNG THÌ đi bộ bình thường." Robot cần biết kiểm tra điều kiện trước rồi mới quyết định làm gì!
- **Ví dụ thực tế:** Đèn giao thông: NẾU đèn xanh → THÌ đi; NẾU đèn đỏ → THÌ dừng. Cửa tự động: NẾU có người → THÌ mở cửa. ATM: NẾU đúng mật khẩu → THÌ rút tiền được.

## 🤖 Câu chuyện dẫn nhập
Robi được giao cổng bảo vệ trường học. Nhiệm vụ: Chỉ cho phép học sinh có thẻ hợp lệ đi vào! 🎫 Nhưng Robi chưa biết cách kiểm tra — lúc thì cho tất cả mọi người vào, lúc thì không cho ai vào! Bạn giám thị phải la hét cả ngày! 😰 Hôm nay, các em sẽ dạy Robi cách dùng **phép điều kiện thần kỳ**: "NẾU thẻ hợp lệ → THÌ mở cổng / KHÔNG THÌ giữ cổng đóng và báo động!" Robi sẽ trở thành bảo vệ giỏi nhất trường! 🔐

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| Điều kiện (Condition) | Câu hỏi đúng/sai để quyết định | "Trời có mưa không?" |
| Nếu (If) | Bắt đầu câu điều kiện | **Nếu** trời mưa... |
| Thì (Then) | Việc làm khi điều kiện đúng | ...**thì** mang ô |
| Không thì (Else) | Việc làm khi điều kiện sai | ...**không thì** đi bình thường |
| Đúng (True) | Điều kiện thỏa mãn | Trời đang mưa = Đúng |
| Sai (False) | Điều kiện không thỏa mãn | Trời không mưa = Sai |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Trò chơi Simon Says với điều kiện":**
- "NẾU Simon nói 'Simon says' → THÌ làm theo"
- "NẾU Simon KHÔNG nói 'Simon says' → THÌ đứng yên"
- Giáo viên đổi thành phiên bản tiếng Việt: "Nếu thầy/cô nói 'Robot làm' trước → thì làm / Không thì đứng yên!"
- Ai làm sai ngồi xuống — thử nhanh và vui!

### 📖 Bài học chính (15 phút)
1. **Giới thiệu câu IF-THEN:** Dùng hình ảnh đèn giao thông — quen thuộc với trẻ
2. **Cấu trúc:** Vẽ sơ đồ kim cương (diamond shape) — hình dạng của điều kiện trong sơ đồ thuật toán
3. **Viết câu IF-THEN bằng tiếng Việt:** "NẾU [điều kiện] → THÌ [làm gì] / KHÔNG THÌ [làm gì khác]"
4. **Ví dụ cùng làm:** Cùng cả lớp viết 3 câu IF-THEN từ cuộc sống thực

### 🤖 Robot Challenge (10 phút)
**"Lập trình bảo vệ Robi":** Mỗi nhóm nhận tình huống và viết câu IF-THEN cho Robi:
- Tình huống 1: Robi lái xe — đèn giao thông
- Tình huống 2: Robi phục vụ bữa sáng — NẾU thích trứng → THÌ...
- Tình huống 3: Robi soạn bài tập — NẾU bài khó → THÌ...

### 🎲 Mini Game (10 phút)
**"Thẻ điều kiện":** Giáo viên giơ thẻ, học sinh phản ứng theo đúng điều kiện:
- Thẻ ☀️ → Đứng lên (trời đẹp, đi chơi!)
- Thẻ 🌧️ → Ngồi xuống (trời mưa, ở trong nhà)
- Thẻ 🍎 → Vỗ tay (có trái cây, ăn được)
- Thẻ 🍄 → Lắc đầu (nấm lạ, không ăn!)
Giáo viên giơ nhanh hơn từng vòng — học sinh phản ứng càng nhanh càng tốt!

### 📝 Tổng kết & BTVN (5 phút)
- Cùng đọc to: "Nếu... thì... không thì..."
- Hỏi: "Em tìm được câu điều kiện nào ở nhà rồi?"
- Giao bài tập về nhà

## 🏆 Robot Challenge
**Nhiệm vụ: Lập trình Robot Bảo Vệ Trường!**

Viết câu IF-THEN cho Robi trong các tình huống sau:

**Tình huống 1: Kiểm tra thẻ học sinh**
```
NẾU [thẻ hợp lệ]
  THÌ [mở cổng + nói "Chào bạn!"]
KHÔNG THÌ [giữ cổng đóng + báo bảo vệ]
```

**Tình huống 2: Báo thức buổi sáng**
```
NẾU [đã đến 6 giờ sáng]
  THÌ [phát nhạc báo thức]
KHÔNG THÌ [tiếp tục im lặng]
```

**Tình huống 3 (Học sinh tự viết):**
Robi là đầu bếp! Viết câu IF-THEN khi Robi nấu cơm:
- NẾU [___________] → THÌ [___________]
- KHÔNG THÌ [___________]

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. 🏠 Tìm 5 câu "Nếu... thì..." trong cuộc sống ở nhà và viết ra (ví dụ: NẾU đói → THÌ ăn)
2. 🎨 Vẽ tranh đèn giao thông và viết câu IF-THEN cho mỗi màu đèn
3. 🤖 Tưởng tượng em có một robot ở nhà — viết 3 câu lệnh IF-THEN em muốn dạy robot
4. 📺 Xem một chương trình hoạt hình — tìm xem nhân vật có dùng câu "Nếu... thì..." không?
5. ✏️ Hoàn thành tờ bài tập "Điền vào chỗ trống: Nếu ___ thì ___" (đính kèm)

## 💡 Gợi ý AI hỗ trợ
- **AI tạo tình huống:** Hỏi "AI ơi, tạo cho em 5 tình huống vui để em viết câu NẾU-THÌ nhé" — AI tạo tình huống sáng tạo và thú vị
- **AI kiểm tra câu IF-THEN:** Học sinh viết câu IF-THEN và hỏi "Câu điều kiện này của em có đúng không?" — AI phân tích và góp ý
- **AI giải thích thực tế:** Hỏi "AI ơi, điều kiện IF-THEN được dùng trong cuộc sống thực như thế nào?" — AI đưa ra nhiều ví dụ thú vị từ công nghệ

## 🏅 Huy hiệu hoàn thành
**🚦 Huy Hiệu "Chuyên Gia Quyết Định"** — Dành cho em đã thành thạo phép điều kiện NẾU-THÌ và giúp Robi trở thành người bảo vệ thông minh nhất trường! Em là Lập Trình Viên Cao Cấp rồi! 🎯✨
