# Chuyên đề 1: Hello Python 🐍

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Hiểu Python là gì và dùng để làm gì
- Viết và chạy chương trình Python đầu tiên
- Dùng hàm `print()` để in ra màn hình
- Làm quen với IDLE / VS Code / Replit

---

## 🐍 Python Syntax chính

```python
# Đây là comment — Python không chạy dòng này
# Dùng # để giải thích code cho người đọc

# In ra màn hình dùng print()
print("Hello, World!")
print("Xin chào! Mình là Python!")
print("Mình", 9, "tuổi")  # In nhiều thứ cùng lúc

# In số
print(42)
print(3.14)

# Tính toán bên trong print
print(5 + 3)   # Kết quả: 8
print(10 - 4)  # Kết quả: 6
print(6 * 7)   # Kết quả: 42
print(15 / 3)  # Kết quả: 5.0

# In nhiều dòng
print("Dòng 1")
print("Dòng 2")
print("Dòng 3")

# In dòng trống
print()  # In ra một dòng trống

# Dùng sep để ngăn cách
print("Python", "thật", "vui!", sep=" - ")
# Kết quả: Python - thật - vui!

# Dùng end để không xuống dòng
print("Xin chào", end=" ")
print("bạn!")
# Kết quả: Xin chào bạn!
```

---

## 💡 Từ khóa & Khái niệm

| Từ khóa | Ý nghĩa |
|---------|---------|
| `print()` | Hàm in ra màn hình |
| `#` | Comment — ghi chú không chạy |
| `"..."` hoặc `'...'` | Chuỗi văn bản (string) |
| `+`, `-`, `*`, `/` | Phép tính cộng, trừ, nhân, chia |
| IDLE | Phần mềm viết Python đơn giản |

**Python là gì?**
- Python là ngôn ngữ lập trình dễ học như tiếng Anh
- Được dùng để làm: game, AI, website, robot, phân tích dữ liệu
- Được tạo bởi Guido van Rossum năm 1991
- Tên lấy từ chương trình hài "Monty Python" — không phải con rắn! 🐍 (nhưng logo là rắn cho vui)

---

## 🔨 Project thực hành: Thẻ Giới Thiệu Bản Thân

Viết chương trình in ra thẻ giới thiệu của bạn:

```python
# ============================================
# Project: Thẻ Giới Thiệu Bản Thân
# Tác giả: [Tên bạn]
# ============================================

print("=" * 40)
print("       THẺ GIỚI THIỆU BẢN THÂN")
print("=" * 40)
print()
print("Tên     : Nguyễn Văn An")
print("Tuổi    : 11 tuổi")
print("Lớp     : 6A")
print("Trường  : THCS Lê Lợi")
print("Sở thích: Game, lập trình, vẽ tranh")
print("Ước mơ  : Trở thành kỹ sư AI")
print()
print("=" * 40)
print("  Câu nói yêu thích:")
print("  'Code mỗi ngày, giỏi mỗi ngày!'")
print("=" * 40)
print()
print("🐍 Được tạo bằng Python!")

# Thử thêm: in hình ngôi sao
print()
print("Xếp hạng của mình:")
print("⭐⭐⭐⭐⭐")
```

**Kết quả mẫu:**
```
========================================
       THẺ GIỚI THIỆU BẢN THÂN
========================================

Tên     : Nguyễn Văn An
Tuổi    : 11 tuổi
Lớp     : 6A
Trường  : THCS Lê Lợi
Sở thích: Game, lập trình, vẽ tranh
Ước mơ  : Trở thành kỹ sư AI

========================================
  Câu nói yêu thích:
  'Code mỗi ngày, giỏi mỗi ngày!'
========================================

🐍 Được tạo bằng Python!
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Bạn biết gì về Python?"**
- Giáo viên hỏi: "Ai đã nghe tới Python? Python dùng làm gì?"
- Cho học sinh xem video ngắn: Những thứ được làm bằng Python (YouTube, TikTok, Instagram, Netflix đều dùng Python!)
- Hỏi: "Nếu bạn có thể lập trình, bạn muốn tạo ra gì?"

### Review — 5 phút
*(Bài đầu tiên — không có review, dùng để giới thiệu lớp học)*
- Học sinh tự giới thiệu tên + điều mình muốn học
- Ghi lên bảng: "Chúng ta sẽ học gì trong 12 buổi"

### Learn & Demo — 10 phút
1. Giáo viên mở IDLE/Replit, gõ `print("Hello!")` → chạy → cho học sinh thấy kết quả
2. Giải thích: `print()` = "máy tính nói"
3. Demo thêm: tính toán, nhiều print, comment
4. Cho học sinh xem lỗi khi thiếu nháy kép → học cách đọc lỗi

### Code Along — 15 phút
Học sinh tự gõ (không copy-paste):
```python
print("Xin chào!")
print("Tên mình là: ...")   # Thay tên thật vào
print("Mình", 11, "tuổi")
print(2 + 2)
print("Python thật", "tuyệt vời!")
```

### Challenge — 10 phút
**Thử thách:** Tạo "nghệ thuật ASCII" bằng print:
```python
# Vẽ ngôi nhà bằng chữ
print("    /\\")
print("   /  \\")
print("  / 🏠 \\")
print(" /______\\")
print(" |  []  |")
print(" |______|")
```

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** In tên bạn 5 lần, mỗi lần một dòng.

**Bài 2 — Dễ:** Tính và in kết quả: 123 × 456, 1000 ÷ 8, 999 - 123.

**Bài 3 — Trung bình:** Vẽ một hình chữ nhật bằng dấu `*` (5 dòng × 10 cột).

**Bài 4 — Trung bình:** In thời khóa biểu một ngày của bạn bằng Python (dùng nhiều `print()`).

**Bài 5 — Khó:** Tạo "menu nhà hàng" đẹp với tên món và giá tiền, dùng `=` và `-` để trang trí.

---

## 🤖 AI Coach gợi ý

Khi bạn bị kẹt, thử hỏi AI (ChatGPT, Gemini) như thế này:
- *"Tôi đang học Python lớp 6. print() dùng như thế nào? Giải thích đơn giản."*
- *"Code Python này có lỗi gì? [dán code vào]"*
- *"Giúp tôi in ra hình trái tim bằng dấu * trong Python"*

**Mẹo:** Đọc thông báo lỗi — Python thường nói chính xác lỗi ở đâu!

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Quên nháy kép
print(Hello)  # NameError: name 'Hello' is not defined

# ✅ ĐÚNG
print("Hello")

# ❌ SAI: Quên đóng ngoặc
print("Hello"  # SyntaxError

# ✅ ĐÚNG
print("Hello")

# ❌ SAI: Viết hoa Print
Print("Hello")  # NameError

# ✅ ĐÚNG: Python phân biệt chữ hoa/thường
print("Hello")

# ❌ SAI: Dùng nháy đơn và đôi lẫn lộn
print("Hello')  # SyntaxError

# ✅ ĐÚNG: Phải cùng loại
print("Hello") hoặc print('Hello')
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người mới bắt đầu:** Chạy được `print("Hello, World!")`

**🥈 Lập trình viên nhí:** Tạo thẻ giới thiệu bản thân hoàn chỉnh

**🥇 Python Explorer:** Vẽ được hình nghệ thuật ASCII sáng tạo

**💎 Siêu sao:** Tạo menu nhà hàng đẹp có trang trí và tính tổng tiền
