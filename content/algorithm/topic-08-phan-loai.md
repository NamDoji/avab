# Chuyên đề 8: Phân Loại 🗂️

## 🎯 Mục tiêu học tập
- Hiểu được khái niệm phân loại (classification) — chia đồ vật vào các nhóm có điểm chung
- Biết đặt tiêu chí phân loại và áp dụng nhất quán
- Nhận ra rằng máy tính dùng phân loại để nhận diện hình ảnh, phân loại email, v.v.
- Thực hành phân loại theo nhiều tiêu chí khác nhau trên cùng một tập hợp

## 💡 Khái niệm chính
- **Tên khái niệm thuật toán (tiếng Anh):** Classification (Phân loại)
- **Giải thích bằng ngôn ngữ trẻ em:** Phân loại là khi chúng ta nhóm các thứ lại với nhau dựa trên điểm giống nhau. Giống như khi dọn đồ chơi: xe cộ vào hộp xanh, búp bê vào hộp hồng, khối gỗ vào hộp vàng! Mỗi đồ chơi chỉ vào một hộp thôi — dựa trên "quy tắc phân loại" em đặt ra.
- **Ví dụ thực tế:** Gmail phân loại email thành: Hộp thư đến / Spam / Quảng cáo. App nhạc phân loại bài hát theo: thể loại / nghệ sĩ / album. Thư viện phân loại sách theo chủ đề.

## 🤖 Câu chuyện dẫn nhập
Robi được thuê làm nhân viên kho hàng cho siêu thị lớn nhất thành phố 🏪. Hàng ngàn đồ vật đang nằm lộn xộn cần được sắp xếp vào đúng kệ: thực phẩm, đồ điện tử, quần áo, đồ chơi... Nhưng Robi lại bỏ kem đánh răng vào kệ kẹo, đặt áo vào ngăn mì tôm! Khách hàng tìm không ra gì cả, kêu la ầm ĩ! 😱 Giám đốc siêu thị cầu cứu các em: "Hãy dạy Robi cách **phân loại** đúng để siêu thị không hỗn loạn nữa!" 🛒

## 📋 Từ khóa cần học
| Từ khóa | Nghĩa | Ví dụ |
|---------|-------|-------|
| Phân loại (Classify) | Chia vật/thông tin vào nhóm | Chia trái cây theo màu |
| Tiêu chí (Criterion) | Quy tắc để phân loại | "Chia theo kích cỡ" |
| Nhóm (Group/Category) | Tập hợp các thứ có điểm chung | Nhóm "Động vật bay được" |
| Điểm chung | Đặc điểm giống nhau | Đều có lông → chim |
| Nhãn (Label) | Tên gọi của nhóm | Nhãn "Thực phẩm" |
| Thuật toán phân loại | Cách máy tính xếp loại dữ liệu | AI nhận diện mèo/chó |

## 🎮 Hoạt động lớp học (45 phút)

### 🌅 Khởi động (5 phút)
**"Phân loại học sinh!"** 😄: Giáo viên đọc tiêu chí, học sinh di chuyển theo:
- "Ai mặc áo xanh → đứng bên trái / Ai không mặc áo xanh → đứng bên phải!"
- "Ai thích ăn cơm → giơ tay / Ai thích ăn phở → ngồi xuống!"
- "Ai đi bộ đến trường → nhảy lên / Ai đi xe → đứng yên!"
Vui và sinh động, giúp trẻ hiểu ngay phân loại là gì!

### 📖 Bài học chính (15 phút)
1. **Phân loại là gì?** — Dùng hình ảnh kệ siêu thị có nhãn phân loại rõ ràng
2. **Tiêu chí phân loại quan trọng:** Cùng một tập đồ vật có thể phân loại theo NHIỀU cách
   - 5 quả: 🍎🍊🍌🍇🍋 → phân theo màu sắc VÀ phân theo hình dạng — khác nhau!
3. **Thuật toán phân loại đơn giản:** "Xét từng vật → Kiểm tra tiêu chí → Gắn nhãn → Bỏ vào nhóm"
4. **AI phân loại:** Giải thích app nhận diện ảnh chó/mèo — AI được "học" hàng triệu ảnh!

### 🤖 Robot Challenge (10 phút)
**"Nhân viên kho hàng Robi":** Mỗi nhóm nhận bộ thẻ hình (hoặc vật thật) gồm 12 đồ vật.
Nhiệm vụ: Phân loại vào 4 kệ (thực phẩm / quần áo / đồ chơi / văn phòng phẩm)
- Thống nhất quy tắc phân loại trước!
- Mỗi đội giải thích tại sao chọn như vậy
- So sánh kết quả giữa các đội — có khác không? Tại sao?

### 🎲 Mini Game (10 phút)
**"Venn Diagram khổng lồ":** Vẽ 2 vòng tròn to trên bảng (hoặc dùng dây thừng trên sàn).
- Vòng trái: "Có cánh" | Vòng phải: "Sống dưới nước" | Phần giao: "Cả hai"
- Giáo viên đọc tên động vật — học sinh chạy đặt thẻ vào đúng vùng
- Ví dụ: Cá = vòng phải | Chim = vòng trái | Vịt = phần giao (có cánh VÀ bơi được) 🦆

### 📝 Tổng kết & BTVN (5 phút)
- Hỏi: "Cùng một tập đồ vật, em có thể phân loại theo mấy cách khác nhau?"
- Kết nối: "AI phân loại email spam cũng dùng cách tương tự!"
- Giao bài tập về nhà

## 🏆 Robot Challenge
**Nhiệm vụ: Cứu siêu thị của Robi!**

Đây là 16 sản phẩm lộn xộn: 🍎 🥤 👕 ✏️ 🍌 📚 👖 🧃 🍊 🖊️ 👗 🥛 📓 🎽 🧴 🍇

**Bước 1:** Phân loại theo 4 nhóm: Thực phẩm | Quần áo | Văn phòng phẩm | Đồ dùng nhà tắm
(Ghi vào bảng)

**Bước 2:** Phân loại lại theo tiêu chí MỚI: Màu sắc (Đỏ/Vàng/Xanh/Khác)
(Cùng đồ vật nhưng kết quả khác!)

**Câu hỏi suy nghĩ:**
- Sản phẩm nào bạn không chắc nên xếp vào nhóm nào? Tại sao?
- Em có thể đề xuất thêm nhóm thứ 5 không?
- Nếu siêu thị có 10.000 sản phẩm, robot làm việc này nhanh hơn người không?

## 📝 Bài tập về nhà (5 bài đơn giản, phù hợp lớp 1-2)
1. 🧹 Dọn đồ chơi và chia vào 3 hộp theo tiêu chí em tự đặt ra — chụp ảnh hoặc vẽ lại kết quả
2. 📚 Nhìn vào tủ sách ở nhà — sách được sắp xếp theo tiêu chí nào? Hỏi bố/mẹ để biết
3. 🍎 Vẽ 6 loại trái cây và phân loại theo 2 cách: màu sắc VÀ có hạt/không có hạt
4. 🦁 Cắt 8 hình ảnh động vật từ tạp chí (hoặc vẽ) và phân loại vào 3 nhóm tự chọn
5. ✏️ Hoàn thành bài tập "Venn Diagram đơn giản" — phân loại 10 đồ vật vào 2 vòng tròn (đính kèm)

## 💡 Gợi ý AI hỗ trợ
- **AI phân loại thử:** Đưa danh sách đồ vật cho AI và hỏi "AI phân loại những thứ này thành 3 nhóm như thế nào?" — so sánh với cách em làm
- **AI giải thích AI phân loại:** Hỏi "AI nhận biết ảnh con mèo và con chó như thế nào?" — AI giải thích Machine Learning đơn giản
- **AI tạo bài tập:** Hỏi "Tạo cho em một danh sách 15 đồ vật lộn xộn để em luyện phân loại nhé" — AI tạo bài tập phù hợp

## 🏅 Huy hiệu hoàn thành
**🗂️ Huy Hiệu "Chuyên Gia Sắp Xếp"** — Dành cho em đã cứu siêu thị của Robi khỏi hỗn loạn và sắp xếp 16 sản phẩm vào đúng vị trí! Từ nay khách hàng tìm đồ dễ dàng nhờ công em! 🛒✨
