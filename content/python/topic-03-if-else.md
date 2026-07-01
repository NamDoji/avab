# Chuyên đề 3: If / Else — Điều Kiện & Rẽ Nhánh 🚦

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Dùng `if`, `elif`, `else` để máy tính đưa ra quyết định
- Viết các điều kiện so sánh với `>`, `<`, `==`, `!=`, `>=`, `<=`
- Kết hợp nhiều điều kiện với `and`, `or`, `not`
- Xây dựng chương trình có logic phân nhánh

---

## 🐍 Python Syntax chính

```python
# ============================================
# CẤU TRÚC IF / ELSE CƠ BẢN
# ============================================

tuoi = 12

if tuoi >= 18:
    print("Bạn đã trưởng thành!")
else:
    print("Bạn còn nhỏ tuổi.")

# ============================================
# IF / ELIF / ELSE — nhiều nhánh
# ============================================

diem = int(input("Nhập điểm (0-10): "))

if diem == 10:
    print("🏆 Xuất sắc! Điểm tuyệt đối!")
elif diem >= 9:
    print("🥇 Giỏi!")
elif diem >= 7:
    print("🥈 Khá!")
elif diem >= 5:
    print("🥉 Trung bình")
else:
    print("❌ Cần cố gắng hơn!")

# ============================================
# CÁC PHÉP SO SÁNH
# ============================================

a = 10
b = 5

print(a > b)    # True  — lớn hơn
print(a < b)    # False — nhỏ hơn
print(a == b)   # False — bằng nhau (== không phải =)
print(a != b)   # True  — khác nhau
print(a >= b)   # True  — lớn hơn hoặc bằng
print(a <= b)   # False — nhỏ hơn hoặc bằng

# ============================================
# AND, OR, NOT — kết hợp điều kiện
# ============================================

tuoi = 12
co_ve = True

# and: cả hai điều kiện phải đúng
if tuoi >= 6 and tuoi <= 15:
    print("Bạn đang ở độ tuổi học sinh.")

# or: ít nhất một điều kiện đúng
if tuoi < 5 or tuoi > 60:
    print("Có thể được giảm giá vé!")

# not: đảo ngược điều kiện
if not co_ve:
    print("Bạn chưa có vé.")
else:
    print("Bạn đã có vé, vào thôi!")

# ============================================
# IF LỒNG NHAU (Nested if)
# ============================================

so = int(input("Nhập một số: "))

if so > 0:
    if so % 2 == 0:
        print(f"{so} là số dương và số chẵn!")
    else:
        print(f"{so} là số dương và số lẻ!")
elif so == 0:
    print("Số không!")
else:
    print(f"{so} là số âm!")
```

---

## 💡 Từ khóa & Khái niệm

| Từ khóa | Ý nghĩa |
|---------|---------|
| `if` | Nếu điều kiện đúng, làm điều này |
| `elif` | Không thì nếu... (else if) |
| `else` | Không thì... (mặc định) |
| `==` | So sánh bằng (khác với `=` gán giá trị) |
| `!=` | Khác nhau |
| `and` | Và — cả hai đúng |
| `or` | Hoặc — ít nhất một đúng |
| `not` | Không — đảo ngược |
| indent | Thụt đầu dòng 4 dấu cách — BẮT BUỘC trong Python! |

**Lưu ý quan trọng về indent:**
```python
# ✅ ĐÚNG — 4 dấu cách indent
if True:
    print("Đúng rồi!")

# ❌ SAI — thiếu indent
if True:
print("Lỗi!")  # IndentationError!
```

---

## 🔨 Project thực hành: Quiz Game Động Vật

```python
# ============================================
# Project: Quiz Game — Đoán Động Vật
# ============================================

print("=" * 50)
print("   🦁 GAME ĐOÁN ĐỘNG VẬT 🐘")
print("=" * 50)
print()
print("Tôi đang nghĩ đến một con vật...")
print("Hãy hỏi tôi để đoán nhé!")
print()

# Các câu hỏi gợi ý
print("Trả lời các câu hỏi (có/không):")
print()

co_long = input("Con vật có lông không? ").lower()
co_canh = input("Con vật có cánh không? ").lower()
song_o_nuoc = input("Con vật sống ở nước không? ").lower()
an_thit = input("Con vật ăn thịt không? ").lower()

print()
print("🔍 Đang phân tích...")
print()

# Logic đoán động vật
if co_long == "có" and co_canh == "có":
    if an_thit == "có":
        print("Con vật bạn nghĩ có thể là: 🦅 Đại bàng!")
    else:
        print("Con vật bạn nghĩ có thể là: 🐦 Chim sẻ!")
elif co_long == "có" and co_canh == "không":
    if song_o_nuoc == "có":
        print("Con vật bạn nghĩ có thể là: 🦭 Hải cẩu!")
    elif an_thit == "có":
        print("Con vật bạn nghĩ có thể là: 🐯 Hổ!")
    else:
        print("Con vật bạn nghĩ có thể là: 🐘 Voi!")
elif co_long == "không" and song_o_nuoc == "có":
    if an_thit == "có":
        print("Con vật bạn nghĩ có thể là: 🦈 Cá mập!")
    else:
        print("Con vật bạn nghĩ có thể là: 🐠 Cá!")
else:
    print("Con vật bạn nghĩ có thể là: 🦎 Bò sát!")

print()
print("Mình đoán đúng không? 😄")

# ============================================
# BONUS: Máy tính bỏ túi thông minh
# ============================================

print("\n" + "=" * 50)
print("       🧮 MÁY TÍNH BỎ TÚI")
print("=" * 50)

a = float(input("Số thứ nhất: "))
phep_tinh = input("Phép tính (+, -, *, /): ")
b = float(input("Số thứ hai: "))

if phep_tinh == "+":
    ket_qua = a + b
    print(f"Kết quả: {a} + {b} = {ket_qua}")
elif phep_tinh == "-":
    ket_qua = a - b
    print(f"Kết quả: {a} - {b} = {ket_qua}")
elif phep_tinh == "*":
    ket_qua = a * b
    print(f"Kết quả: {a} × {b} = {ket_qua}")
elif phep_tinh == "/":
    if b == 0:
        print("❌ Lỗi: Không thể chia cho 0!")
    else:
        ket_qua = a / b
        print(f"Kết quả: {a} ÷ {b} = {ket_qua:.2f}")
else:
    print("❌ Phép tính không hợp lệ!")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Trò chơi quyết định"**
- Giáo viên hỏi: "Nếu trời mưa, bạn làm gì? Nếu không mưa?"
- Vẽ sơ đồ flowchart đơn giản lên bảng
- Giải thích: máy tính cũng đưa ra quyết định như vậy!

### Review — 5 phút
- Hỏi nhanh: `int()`, `float()`, `input()` khác nhau thế nào?
- Một học sinh đọc code bài tập về nhà của mình

### Learn & Demo — 10 phút
1. Demo if/else với tuổi xem phim
2. Thêm elif để phân loại điểm số
3. Demo lỗi thiếu indent → giải thích quan trọng
4. Demo `==` vs `=` — lỗi kinh điển!

### Code Along — 15 phút
```python
# Học sinh tự nhập và chạy
gio = int(input("Bây giờ là mấy giờ? (0-23): "))

if gio >= 5 and gio < 12:
    print("Chào buổi sáng! ☀️")
elif gio >= 12 and gio < 18:
    print("Chào buổi chiều! 🌤️")
elif gio >= 18 and gio < 22:
    print("Chào buổi tối! 🌙")
else:
    print("Đêm rồi, đi ngủ thôi! 😴")
```

### Challenge — 10 phút
**Máy bán vé rạp phim:** Nhập tuổi, loại vé (thường/VIP), tính giá vé (trẻ em <12 giảm 50%).

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Nhập một số, kiểm tra chẵn hay lẻ và in kết quả.

**Bài 2 — Dễ:** Nhập điểm ba môn Toán, Văn, Anh. Tính trung bình và xếp loại (Giỏi/Khá/TB/Yếu).

**Bài 3 — Trung bình:** Nhập năm sinh, tính tuổi, kiểm tra đủ tuổi bầu cử (18) hay chưa và còn bao nhiêu năm.

**Bài 4 — Trung bình:** Nhập tháng (1-12), in ra mùa (Xuân: 1-3, Hạ: 4-6, Thu: 7-9, Đông: 10-12).

**Bài 5 — Khó:** Tạo chương trình tính tiền taxi (2km đầu: 15.000đ, từ km thứ 3: 12.000đ/km, khuya 22h-6h thêm 20%).

---

## 🤖 AI Coach gợi ý

- *"Tôi muốn kiểm tra xem năm có phải năm nhuận không bằng Python. Điều kiện năm nhuận là gì?"*
- *"Giải thích == và = khác nhau thế nào trong Python cho học sinh lớp 6?"*
- *"Vẽ flowchart cho if/else đơn giản để tôi hiểu"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Dùng = thay vì == khi so sánh
if tuoi = 18:  # SyntaxError!

# ✅ ĐÚNG
if tuoi == 18:

# ❌ SAI: Thiếu dấu hai chấm (:) sau if
if tuoi > 18
    print("OK")  # SyntaxError!

# ✅ ĐÚNG
if tuoi > 18:
    print("OK")

# ❌ SAI: Không indent sau if
if tuoi > 18:
print("OK")  # IndentationError!

# ✅ ĐÚNG (4 dấu cách)
if tuoi > 18:
    print("OK")

# ❌ SAI: So sánh chuỗi không đúng
ten = input("Tên: ")
if ten == "An " :  # Dư dấu cách → không bao giờ bằng!
    print("Chào An!")

# ✅ ĐÚNG
if ten.strip() == "An":  # .strip() loại bỏ dấu cách thừa
    print("Chào An!")
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người quyết định:** Viết được if/else kiểm tra chẵn lẻ

**🥈 Nhà phân tích:** Xây dựng hệ thống xếp loại học lực 5 mức

**🥇 Logic Master:** Hoàn thành quiz game động vật đoán đúng 5+ loài

**💎 Siêu sao:** Tạo máy tính bỏ túi đầy đủ 4 phép tính với kiểm tra lỗi
