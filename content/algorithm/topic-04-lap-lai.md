# Chuyên đề 4: Lặp Lại 🔄

## 🎯 Mục tiêu học tập
- Hiểu được khái niệm vòng lặp (loop) — làm đi làm lại nhiều lần
- Nhận ra khi nào nên dùng vòng lặp thay vì viết lệnh lặp đi lặp lại
- Biết dùng ký hiệu "Lặp X lần: [lệnh]" để viết ngắn gọn hơn
- Thấy được vòng lặp xuất hiện ở khắp nơi trong cuộc sống

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Loop / Repeat
- **Giải thích bằng ngôn ngữ trẻ em:** Vòng lặp là khi chúng ta muốn làm đi làm lại một việc nhiều lần mà không cần phải viết lại lệnh đó. Thay vì nói "nhảy, nhảy, nhảy, nhảy, nhảy" — mình chỉ cần nói "Lặp 5 lần: nhảy!" ngắn hơn nhiều đúng không?
- **Ví dụ thực tế:** Khi đánh răng, em chải qua chải lại nhiều lần — đó là vòng lặp! Khi giáo viên gọi điểm danh từng bạn — đó cũng là vòng lặp! Nhạc có câu điệp khúc lặp lại — vòng lặp!

## 🤖 Câu chuyện dẫn nhập
Robi được giao nhiệm vụ tưới 10 chậu hoa 🌸 trong vườn. Ban đầu, người lập trình viết cho Robi: "Tưới hoa, Tiến, Tưới hoa, Tiến, Tưới hoa, Tiến..." — phải viết đến 30 lệnh! Cả trang giấy chỉ viết được 10 chậu hoa. Nếu có 100 chậu hoa thì viết đến bao giờ xong? 😅 Rồi một bạn nhỏ tên **Minh** nảy ra ý kiến thiên tài: "Hay là mình dùng phép lặp kỳ diệu?" Chỉ cần viết: "Lặp 10 lần: [Tưới hoa → Tiến]" — xong! Ngắn gọn, thần kỳ! ✨

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| Lặp lại (Loop/Repeat) | Làm đi làm lại nhiều lần | Lặp 5 lần: nhảy |
| Vòng lặp (Loop) | Chu kỳ làm việc lặp đi lặp lại | Vòng quay của bánh xe |
| Số lần lặp | Bao nhiêu lần phải làm lại | Lặp **3 lần** |
| Lệnh trong vòng lặp | Việc cần làm lại nhiều lần | Lặp 5 lần: [**tiến 1 bước**] |
| Điệp khúc | Phần lặp lại trong bài hát | "Chorus" trong nhạc |
| Tiết kiệm | Viết ngắn hơn, làm nhanh hơn | Dùng loop = tiết kiệm công |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Bài hát vòng lặp":** Giáo viên dẫn bài hát đơn giản có điệp khúc lặp lại (ví dụ: "Nào cùng nhảy, nhảy, nhảy / Nào cùng vỗ, vỗ, vỗ / Lặp lại từ đầu!"). Cả lớp hát và vận động theo. Sau đó hỏi: "Phần nào được lặp lại? Lặp mấy lần?"

### 📖 Bài học chính (15 phút)
1. **Vấn đề với việc viết lặp lại:** Giáo viên viết lên bảng: "Tiến, Tiến, Tiến, Tiến, Tiến, Tiến, Tiến, Tiến, Tiến, Tiến" — mệt mỏi không? 😅
2. **Cách dùng vòng lặp:** "Lặp 10 lần: [Tiến]" — ngắn hơn nhiều!
3. **Ký hiệu vòng lặp đơn giản:** Vẽ hình mũi tên tròn ♻️ và viết số lần bên trong
4. **Tìm vòng lặp trong cuộc sống:** Học sinh nêu ví dụ — giáo viên xác nhận

### 🤖 Robot Challenge (10 phút)
**"Rút gọn lệnh cho Robi":** Mỗi cặp học sinh nhận phiếu bài tập có chuỗi lệnh dài.
- Nhiệm vụ: Tìm phần nào lặp lại và viết lại bằng vòng lặp
- Ví dụ: "Tiến, Phải, Tiến, Phải, Tiến, Phải, Tiến, Phải" → "Lặp 4 lần: [Tiến, Phải]"
- Đội nào rút gọn được nhiều nhất thắng!

### 🎲 Mini Game (10 phút)
**"Nhảy vòng lặp":** Giáo viên ra lệnh vòng lặp, học sinh thực hiện.
- "Lặp 3 lần: [Nhảy lên, vỗ tay]" → Học sinh nhảy + vỗ tay 3 lần
- "Lặp 2 lần: [Đứng lên, ngồi xuống, quay phải]"
- Ai làm sai số lần phải ngồi xuống một vòng 😄

### 📝 Tổng kết & BTVN (5 phút)
- Hỏi: "Vòng lặp giúp ích gì cho lập trình viên?" → Viết ngắn hơn, không mắc lỗi khi viết lại nhiều lần
- Giao bài tập về nhà
- Thách thức: "Về nhà tìm 3 vòng lặp trong cuộc sống hàng ngày!"

## 🏆 Robot Challenge
**Nhiệm vụ: Lập trình Robi tưới vườn hoa bằng vòng lặp!**

Vườn hoa có 3 hàng, mỗi hàng 4 chậu hoa. Robi cần tưới tất cả 12 chậu.

**Cách 1 (Không dùng loop):** Viết 24 lệnh... (học sinh thử viết rồi thấy mệt)

**Cách 2 (Dùng loop):**
```
Lặp 3 lần:
  Lặp 4 lần: [Tưới hoa → Tiến]
  Quay trái → Tiến → Quay trái → Lùi lại hàng mới
```

**Câu hỏi thảo luận:**
- Cách nào ngắn hơn?
- Nếu vườn có 100 hàng, cách nào tiện hơn?
- Robot làm được bao nhiêu lệnh mỗi giây — vòng lặp có ích gì không?

**Super Challenge:** Viết vòng lặp cho Robi vẽ hình vuông (4 cạnh bằng nhau)!

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. 🔍 Tìm 3 vòng lặp trong cuộc sống ở nhà và viết ra (ví dụ: giặt quần áo bằng máy — máy quay lặp đi lặp lại!)
2. 🎵 Tìm một bài hát yêu thích và đếm xem điệp khúc được lặp mấy lần
3. ✏️ Viết lại chuỗi lệnh dài này bằng vòng lặp: "Bước, Bước, Bước, Bước, Bước" → Lặp ___ lần: [___]
4. 🎨 Vẽ hình bông tuyết ❄️ (mỗi cánh giống nhau — đó là "vòng lặp vẽ") — Vẽ bằng tay, tô màu thật đẹp!
5. 📖 Hoàn thành tờ bài tập "Vòng lặp kỳ diệu" — tìm và khoanh tròn các vòng lặp trong hình (đính kèm)

## 💡 Gợi ý AI hỗ trợ
- **AI tạo bài luyện tập:** Hỏi "AI ơi, tạo cho em 3 bài tập về vòng lặp đơn giản dễ hiểu nhé" — AI tạo bài thực hành phù hợp lứa tuổi
- **AI giải thích sâu hơn:** Hỏi "Vòng lặp trong máy tính khác vòng lặp trong cuộc sống như thế nào?" — AI so sánh giúp hiểu rõ hơn
- **AI viết code đơn giản:** Hỏi "Viết vòng lặp bằng Scratch blocks để Robi tiến 10 bước trông như thế nào?" — AI mô tả block Scratch

## 🏅 Huy hiệu hoàn thành
**🔄 Huy Hiệu "Phù Thủy Vòng Lặp"** — Dành cho em đã nắm bí kíp vòng lặp kỳ diệu, giúp Robi tưới cả vườn hoa mà không cần viết hàng trăm lệnh! Em là Lập Trình Viên Thông Minh rồi! 🌸✨
