# Chuyên đề 11: Chia Bài Toán 🧩

## 🎯 Mục tiêu học tập
- Hiểu được khái niệm phân rã vấn đề (decomposition) — chia bài toán lớn thành bài toán nhỏ hơn
- Biết giải quyết từng phần nhỏ rồi ghép lại thành giải pháp hoàn chỉnh
- Nhận ra rằng mọi dự án lớn đều bắt đầu từ những bước nhỏ
- Thực hành phân tích và chia nhỏ một nhiệm vụ phức tạp

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Decomposition (Phân rã)
- **Giải thích bằng ngôn ngữ trẻ em:** Khi gặp bài toán khó, đừng nhìn vào toàn bộ và hoảng sợ! Hãy chia nó thành những mảnh nhỏ hơn, dễ làm hơn. Giống như ăn một chiếc bánh khổng lồ — không ai ăn cả bánh một lúc! Ăn từng miếng nhỏ thôi 🍰!
- **Ví dụ thực tế:** Xây nhà không phải xây tất cả cùng lúc — xây nền → xây tường → lợp mái → trang trí từng phần. Làm phim hoạt hình: viết kịch bản → vẽ nhân vật → làm nhạc → ghép lại.

## 🤖 Câu chuyện dẫn nhập
Robi nhận nhiệm vụ vĩ đại nhất từ trước đến nay: **Tổ chức Lễ Hội Robot** 🎪 cho cả thành phố! Cần có: sân khấu, ánh sáng, âm nhạc, trò chơi, thức ăn, quà tặng, bảo vệ, dọn dẹp... Robi nhìn vào danh sách dài và... đứng im không biết bắt đầu từ đâu! 😰 Robi bị "đóng băng" vì quá choáng ngợp! Giáo viên robot nói: "Robi ơi, bí quyết là CHIA NHỎ! Mỗi việc lớn đều bắt đầu từ việc nhỏ!" Hôm nay, các em sẽ giúp Robi học cách chia nhỏ nhiệm vụ khổng lồ thành những mảnh nhỏ xinh dễ làm! 🎯

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| Phân rã (Decompose) | Chia bài toán lớn thành nhỏ | Chia "làm tiệc" thành nhiều việc |
| Bài toán con | Phần nhỏ của bài toán lớn | "Chuẩn bị âm nhạc" là bài toán con |
| Ghép lại (Combine) | Kết hợp các phần nhỏ thành tổng thể | Ghép tất cả bước lại = lễ hội hoàn chỉnh |
| Cây phân tích | Sơ đồ chia nhỏ vấn đề (dạng cây) | Cây quyết định |
| Ưu tiên | Việc nào làm trước, việc nào sau | Chuẩn bị sân khấu trước khi có khách |
| Nhiệm vụ con | Công việc nhỏ cụ thể cần làm | "Mua 50 ly nước" |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Puzzle khổng lồ":** Giáo viên mang một tờ giấy A0 và hỏi "Làm sao gấp tờ giấy này vừa vào hộp bút?"
- Học sinh thảo luận: Gấp đôi → Gấp đôi nữa → Gấp lại → Gấp lại...
- Mỗi lần gấp = một bước nhỏ! Nhiều bước nhỏ = giải được bài toán lớn
- Bài học: "Chia nhỏ mới giải được!"

### 📖 Bài học chính (15 phút)
1. **Tại sao cần chia nhỏ?** — Não người không thể xử lý quá nhiều thông tin cùng lúc — chia nhỏ giúp tập trung
2. **Cây phân tích (Decomposition Tree):** Vẽ sơ đồ cây: bài toán lớn ở gốc, các bài toán con ở cành, nhiệm vụ nhỏ ở lá
3. **Demo cùng lớp:** Chia nhỏ "Chuẩn bị đi cắm trại" thành cây phân tích 3 cấp
4. **Kết nối lập trình:** Mọi ứng dụng lớn (game, mạng xã hội) đều được chia thành hàng nghìn module nhỏ

### 🤖 Robot Challenge (10 phút)
**"Đội lập kế hoạch":** Chia lớp thành 3 đội, mỗi đội nhận một nhiệm vụ lớn cần phân rã:
- Đội 1: "Xây dựng thư viện robot"
- Đội 2: "Tổ chức cuộc thi chạy robot"
- Đội 3: "Thiết kế trường học tương lai"
Mỗi đội vẽ cây phân tích 3 cấp trong 8 phút, sau đó trình bày

### 🎲 Mini Game (10 phút)
**"Bánh pizza phân rã":** Giáo viên đưa ra bài toán: "Làm một chiếc pizza cho 10 người". Cả lớp cùng xây dựng cây phân tích:
- Cấp 1: Mua nguyên liệu | Làm pizza | Phục vụ
- Cấp 2: (học sinh đề xuất từng bước nhỏ hơn)
- Cấp 3: Danh sách mua hàng cụ thể
Xem ai đề xuất bước chi tiết nhất mà vẫn có ý nghĩa!

### 📝 Tổng kết & BTVN (5 phút)
- Ôn lại: "3 bước phân rã: Nhìn toàn cảnh → Chia thành phần lớn → Chia tiếp thành phần nhỏ → Thực hiện từng phần"
- Kết nối: "Đây là cách lập trình viên xây dựng app lớn — chia thành màn hình, tính năng, từng nút bấm..."
- Giao bài tập về nhà

## 🏆 Robot Challenge
**Nhiệm vụ: Lập kế hoạch Lễ Hội Robot cho Robi!**

Vẽ Cây Phân Tích cho "Lễ Hội Robot" với ít nhất 3 cấp:

```
🎪 LỄ HỘI ROBOT
├── 🎭 Sân Khấu
│   ├── Dựng sân khấu
│   ├── Chuẩn bị ánh sáng
│   └── Âm thanh / micro
├── 🎮 Khu Trò Chơi
│   ├── Trò chơi 1: Robot mê cung
│   ├── Trò chơi 2: Robot nhảy múa
│   └── Trò chơi 3: _________ (em tự thêm)
├── 🍔 Khu Ẩm Thực
│   ├── _________
│   ├── _________
│   └── _________
└── 🧹 Dọn Dẹp Sau Lễ Hội
    ├── _________
    └── _________
```

**Em điền vào các ô trống và thêm ít nhất 2 nhánh mới!**

**Câu hỏi suy nghĩ:**
- Nhánh nào cần làm TRƯỚC TIÊN?
- Nhánh nào có thể làm CÙNG LÚC?
- Bao nhiêu robot cần thiết để thực hiện tất cả các nhánh?

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. 🎂 Vẽ cây phân tích "Chuẩn bị tiệc sinh nhật" — ít nhất 3 nhánh chính, mỗi nhánh 2 việc nhỏ
2. 📚 Chuẩn bị bài kiểm tra toán — chia ra thành các bước nhỏ (ôn bài nào trước, bài nào sau)
3. 🏠 Hỏi bố/mẹ: Khi xây nhà/mua nhà, bố/mẹ đã chia thành bao nhiêu bước nhỏ?
4. 🎮 Nếu em muốn tự làm một trò chơi board game, cần làm những gì? Vẽ cây phân tích!
5. ✏️ Hoàn thành tờ bài tập "Chia nhỏ bài toán" — 3 nhiệm vụ lớn cần em phân rã thành bước nhỏ (đính kèm)

## 💡 Gợi ý AI hỗ trợ
- **AI phân tích cùng em:** Nêu một dự án lớn và hỏi "Giúp em chia nhiệm vụ này thành các bước nhỏ nhé" — AI tạo cây phân tích chi tiết
- **AI giải thích lập trình thực tế:** Hỏi "Khi lập trình app game, người ta chia thành các phần nhỏ như thế nào?" — AI giải thích kiến trúc phần mềm đơn giản
- **AI tạo thử thách mới:** Hỏi "Cho em một nhiệm vụ phức tạp để em luyện tập chia nhỏ bài toán nhé" — AI tạo tình huống mới thú vị

## 🏅 Huy hiệu hoàn thành
**🧩 Huy Hiệu "Bậc Thầy Chia Nhỏ"** — Dành cho em đã lập được kế hoạch hoàn chỉnh cho Lễ Hội Robot và giúp Robi không còn bị "đóng băng" vì sợ nhiệm vụ lớn nữa! Em suy nghĩ như một Giám Đốc Dự Án thực thụ! 🎪✨
