# Chuyên đề 6: So Sánh ⚖️

## 🎯 Mục tiêu học tập
- Hiểu được khái niệm so sánh trong lập trình: lớn hơn, nhỏ hơn, bằng nhau
- Biết dùng ký hiệu so sánh: >, <, =
- Nhận ra rằng máy tính đưa ra quyết định dựa trên so sánh số/giá trị
- Kết hợp so sánh với câu điều kiện IF-THEN từ bài trước

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Comparison / Relational Operators
- **Giải thích bằng ngôn ngữ trẻ em:** So sánh là cách máy tính kiểm tra xem cái gì lớn hơn, nhỏ hơn, hay bằng nhau. Giống như khi em so sánh chiều cao với bạn — ai cao hơn? Máy tính làm điều này cực kỳ nhanh với số!
- **Ví dụ thực tế:** Khi mua hàng online, app so sánh giá để tìm giá rẻ nhất. Trò chơi video game so sánh điểm số để xem ai thắng. Cân so sánh trọng lượng để hiện số.

## 🤖 Câu chuyện dẫn nhập
Robi làm thủ quỹ cho câu lạc bộ robot! 💰 Hôm nay có 3 bạn robot muốn mua kẹo: Robo-A có 5 đồng xu, Robo-B có 3 đồng xu, Robo-C có 5 đồng xu. Giá kẹo là 4 đồng xu. Robi phải quyết định: ai mua được kẹo, ai không đủ tiền? Nhưng Robi bị bối rối vì không biết cách so sánh số! 😵 Các em hãy dạy Robi cách dùng **phép so sánh kỳ diệu** để quyết định công bằng cho cả 3 bạn robot nhé!

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| So sánh (Compare) | Xem xét 2 thứ hơn/kém/bằng nhau | So sánh 5 và 3 |
| Lớn hơn ( > ) | Số bên trái lớn hơn số bên phải | 5 > 3 ✅ |
| Nhỏ hơn ( < ) | Số bên trái nhỏ hơn số bên phải | 3 < 5 ✅ |
| Bằng nhau ( = ) | Hai giá trị như nhau | 5 = 5 ✅ |
| Kết quả so sánh | Đúng (True) hoặc Sai (False) | 5 > 3 → Đúng |
| Điểm số | Số dùng để xếp hạng | Điểm thi 10/10 |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Ai cao hơn?":** Giáo viên mời 2 học sinh lên đứng cạnh nhau.
- Cả lớp đồng thanh: "[Tên] CAO HƠN [Tên]!" hoặc "HAI BẠN CAO BẰNG NHAU!"
- Thử 3 cặp khác nhau
- Sau đó hỏi: "Trong lập trình, ký hiệu nào dùng để so sánh cao hơn?" → Giới thiệu dấu >

### 📖 Bài học chính (15 phút)
1. **Ba phép so sánh cơ bản:** Vẽ to lên bảng: **> < =** với hình minh họa cá sấu há miệng ăn số lớn hơn (mẹo nhớ dấu > và <)
2. **Luyện đọc ký hiệu:** Giáo viên viết: 5 ☐ 3 — học sinh điền dấu đúng
3. **Kết hợp với IF-THEN:** "NẾU tiền có >= giá kẹo → THÌ mua được"
4. **Ứng dụng thực tế:** Giải thích game video: "NẾU HP < 0 → THÌ Game Over"

### 🤖 Robot Challenge (10 phút)
**"Thủ quỹ Robot":** Học sinh làm bài toán thủ quỹ của Robi:
- Robo-A: 5 xu > 4 xu → MUA ĐƯỢC ✅
- Robo-B: 3 xu < 4 xu → KHÔNG ĐỦ TIỀN ❌
- Robo-C: 5 xu = 5 xu... giá kẹo 4 xu → 5 > 4 → MUA ĐƯỢC ✅
Học sinh viết câu IF-THEN đầy đủ cho Robi

### 🎲 Mini Game (10 phút)
**"Bài thẻ so sánh":** Mỗi học sinh nhận 2 thẻ số ngẫu nhiên (1-20). Đứng dậy, tìm bạn cùng chơi.
- Hai bạn so sánh thẻ của nhau, người số lớn hơn thắng và giơ tay lên
- Nếu bằng nhau → cả hai nhảy lên hét "BẰNG NHAU!"
- Đổi thẻ và tìm bạn mới — chơi 5 vòng

### 📝 Tổng kết & BTVN (5 phút)
- Ôn lại 3 ký hiệu: > < =
- Mẹo nhớ: "Cá sấu luôn há miệng về phía số lớn hơn!" 🐊
- Giao bài tập về nhà

## 🏆 Robot Challenge
**Nhiệm vụ: Robi làm trọng tài bóng đá!**

Hai đội thi đấu, Robi cần quyết định đội nào thắng:

**Trận 1:** Đội Đỏ: 3 bàn | Đội Xanh: 5 bàn
```
NẾU [điểm Đỏ > điểm Xanh] → THÌ [Đỏ thắng]
NẾU [điểm Xanh > điểm Đỏ] → THÌ [Xanh thắng]
NẾU [điểm Đỏ = điểm Xanh] → THÌ [Hòa]
```
→ Học sinh điền kết quả: ______ thắng!

**Trận 2:** Đội Vàng: 4 bàn | Đội Tím: 4 bàn → Kết quả: ______

**Trận 3 (Học sinh tự đặt):** Em tự điền điểm số cho 2 đội và tìm kết quả!

**Bonus:** Viết quy tắc "Top 3 bảng xếp hạng" — đội điểm cao nhất đứng thứ 1!

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. ⚖️ Điền dấu > < = vào 10 cặp số từ 1-20 trong tờ bài tập đính kèm
2. 🛒 Đi siêu thị với bố/mẹ — xem giá 2 sản phẩm giống nhau và hỏi "Cái nào đắt hơn?"
3. 🎮 Chơi một trò chơi có điểm số với anh/chị — ai điểm cao hơn thắng — ghi lại kết quả bằng ký hiệu > < =
4. 📏 Dùng thước đo chiều cao của 3 đồ vật trong nhà, sắp xếp từ thấp đến cao bằng ký hiệu <
5. 🤖 Vẽ tranh Robi đang so sánh hai chiếc bánh và viết câu IF-THEN cho Robi chọn chiếc bánh lớn hơn

## 💡 Gợi ý AI hỗ trợ
- **AI tạo bài luyện so sánh:** Hỏi "Tạo cho em 10 phép so sánh số từ 1-100 để em luyện điền dấu > < = nhé" — AI tạo bài tập phù hợp
- **AI ứng dụng thực tế:** Hỏi "Máy tính dùng so sánh số trong trò chơi game như thế nào?" — AI giải thích vui và dễ hiểu
- **AI kết hợp bài học:** Hỏi "Giúp em viết câu IF-THEN kết hợp với phép so sánh cho robot đi thi đấu" — AI hỗ trợ viết câu lệnh hoàn chỉnh

## 🏅 Huy hiệu hoàn thành
**⚖️ Huy Hiệu "Trọng Tài Công Bằng"** — Dành cho em đã thành thạo ba phép so sánh > < = và giúp Robi làm trọng tài công bằng nhất trong lịch sử! Mọi robot đều phục tùng quyết định của em! 🏆✨
