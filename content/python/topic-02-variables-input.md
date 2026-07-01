# Chuyên đề 2: Variables & Input 📦

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Tạo và sử dụng biến (variable) trong Python
- Phân biệt các kiểu dữ liệu: `int`, `float`, `str`, `bool`
- Dùng `input()` để nhận dữ liệu từ người dùng
- Chuyển đổi kiểu dữ liệu với `int()`, `float()`, `str()`

---

## 🐍 Python Syntax chính

```python
# ============================================
# BIẾN (VARIABLE) — hộp lưu trữ thông tin
# ============================================

# Tạo biến — gán giá trị bằng dấu =
ten = "An"                  # str (chuỗi)
tuoi = 11                   # int (số nguyên)
chieu_cao = 1.45            # float (số thực)
la_hoc_sinh = True          # bool (đúng/sai)

print(ten)          # An
print(tuoi)         # 11
print(chieu_cao)    # 1.45
print(la_hoc_sinh)  # True

# Thay đổi giá trị biến
tuoi = 12           # Giờ tuoi là 12
print(tuoi)         # 12

# Biến trong câu — f-string (rất hữu ích!)
print(f"Tên mình là {ten}, {tuoi} tuổi.")
# Kết quả: Tên mình là An, 12 tuổi.

# Tính toán với biến
a = 10
b = 3
print(a + b)   # 13
print(a - b)   # 7
print(a * b)   # 30
print(a / b)   # 3.333...
print(a // b)  # 3  (chia lấy phần nguyên)
print(a % b)   # 1  (chia lấy số dư)
print(a ** b)  # 1000 (10 mũ 3)

# ============================================
# INPUT() — nhận dữ liệu từ bàn phím
# ============================================

# input() luôn trả về str (chuỗi)!
ten = input("Bạn tên gì? ")
print(f"Xin chào, {ten}!")

# Chuyển sang số nguyên
tuoi = int(input("Bạn bao nhiêu tuổi? "))
print(f"Năm sau bạn {tuoi + 1} tuổi.")

# Chuyển sang số thực
can_nang = float(input("Cân nặng của bạn (kg)? "))
print(f"Bạn nặng {can_nang} kg.")

# ============================================
# CHUYỂN ĐỔI KIỂU DỮ LIỆU (Type Casting)
# ============================================

so_nguyen = int("42")       # "42" → 42
so_thuc = float("3.14")     # "3.14" → 3.14
chuoi = str(100)            # 100 → "100"

print(type(42))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("hello"))   # <class 'str'>
print(type(True))      # <class 'bool'>

# ============================================
# THAO TÁC VỚI CHUỖI (String Operations)
# ============================================

ten = "Nguyen Van An"
print(len(ten))             # 13 (độ dài chuỗi)
print(ten.upper())          # NGUYEN VAN AN
print(ten.lower())          # nguyen van an
print(ten.replace("An", "Bình"))  # Nguyen Van Bình

# Nối chuỗi
ho = "Nguyễn"
ten = "An"
ho_ten = ho + " Văn " + ten
print(ho_ten)  # Nguyễn Văn An
```

---

## 💡 Từ khóa & Khái niệm

| Khái niệm | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| `int` | Số nguyên | `10`, `-5`, `0` |
| `float` | Số có dấu phẩy | `3.14`, `-1.5` |
| `str` | Chuỗi văn bản | `"hello"`, `'hi'` |
| `bool` | Đúng hoặc Sai | `True`, `False` |
| `input()` | Nhận input từ bàn phím | `input("Tên? ")` |
| `int()` | Chuyển thành số nguyên | `int("5")` → `5` |
| `float()` | Chuyển thành số thực | `float("3.14")` |
| `f-string` | Nhúng biến vào chuỗi | `f"Tôi {tuoi} tuổi"` |
| `type()` | Xem kiểu dữ liệu | `type(42)` → `int` |

**Quy tắc đặt tên biến:**
- ✅ `ten_hoc_sinh`, `tuoi`, `diem_toan`
- ❌ `1ten` (không bắt đầu bằng số)
- ❌ `tên học sinh` (không có dấu cách)
- ❌ `for`, `if`, `print` (không dùng từ khóa Python)

---

## 🔨 Project thực hành: Máy Tính BMI

```python
# ============================================
# Project: Máy Tính Chỉ Số BMI
# BMI = cân nặng (kg) / (chiều cao (m))²
# ============================================

print("=" * 45)
print("      🏥 MÁY TÍNH CHỈ SỐ BMI")
print("=" * 45)
print()

# Nhập thông tin
ten = input("Nhập tên của bạn: ")
can_nang = float(input("Cân nặng (kg): "))
chieu_cao_cm = float(input("Chiều cao (cm): "))

# Tính toán
chieu_cao_m = chieu_cao_cm / 100  # Đổi cm → m
bmi = can_nang / (chieu_cao_m ** 2)

# Làm tròn 2 chữ số thập phân
bmi = round(bmi, 2)

# In kết quả
print()
print(f"Xin chào, {ten}!")
print(f"Cân nặng   : {can_nang} kg")
print(f"Chiều cao  : {chieu_cao_cm} cm = {chieu_cao_m} m")
print(f"Chỉ số BMI : {bmi}")
print()

# Nhận xét (sẽ học if/else ở bài 3!)
print("📊 Bảng tham khảo:")
print("  Dưới 18.5 → Thiếu cân")
print("  18.5 - 24.9 → Bình thường ✅")
print("  25.0 - 29.9 → Thừa cân")
print("  Trên 30.0  → Béo phì")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Hộp bí ẩn"**
- Giáo viên vẽ 3 hộp lên bảng: `tuoi`, `ten`, `diem`
- Hỏi: "Bạn đoán trong hộp có gì?" → Giải thích biến như hộp đựng thông tin
- Thay đổi giá trị → hộp vẫn đó nhưng nội dung thay đổi

### Review — 5 phút
- Hỏi nhanh: `print()` dùng để làm gì?
- Học sinh giơ tay: ai đã làm bài tập về nhà bài 1?
- Xem qua 1-2 bài học sinh làm

### Learn & Demo — 10 phút
1. Demo tạo biến: `ten = "Python"` → `print(ten)`
2. Giải thích f-string: `print(f"Xin chào {ten}!")`
3. Demo input(): gọi một học sinh lên nhập tên
4. Giải thích tại sao phải `int(input(...))` cho số

### Code Along — 15 phút
```python
# Học sinh gõ theo từng bước
ten = input("Bạn tên gì? ")
lop = input("Bạn học lớp mấy? ")
mon_yeu_thich = input("Môn học yêu thích: ")

print()
print(f"Tên: {ten}")
print(f"Lớp: {lop}")
print(f"Môn yêu thích: {mon_yeu_thich}")
print(f"Chào mừng {ten} đến với Python!")
```

### Challenge — 10 phút
**Máy tính cá nhân:** Nhập 2 số, in ra tổng, hiệu, tích, thương.

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Tạo 5 biến (tên, tuổi, lớp, trường, màu yêu thích) và in ra bằng f-string.

**Bài 2 — Dễ:** Viết chương trình hỏi tên và tuổi, rồi in: "Bạn [tên] sẽ 20 tuổi vào năm [năm]".

**Bài 3 — Trung bình:** Nhập 3 số nguyên, tính và in ra: tổng, trung bình cộng, tích.

**Bài 4 — Trung bình:** Nhập giá sản phẩm và số lượng, tính tổng tiền và thuế VAT 10%.

**Bài 5 — Khó:** Nhập tên và năm sinh, tính tuổi, in ra thông tin đẹp kèm năm 18 tuổi và năm 60 tuổi.

---

## 🤖 AI Coach gợi ý

Hỏi AI khi cần:
- *"f-string trong Python là gì? Cho ví dụ đơn giản."*
- *"Tại sao phải dùng int(input()) chứ không phải chỉ input()?"*
- *"Sự khác nhau giữa int và float trong Python?"*

**Thách thức thêm:** Hỏi AI: *"Viết chương trình Python hỏi tên và tạo mật khẩu ngẫu nhiên cho người đó"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Dùng input() mà không chuyển sang số
tuoi = input("Tuổi: ")
nam_sau = tuoi + 1  # TypeError! Không cộng str với int được

# ✅ ĐÚNG
tuoi = int(input("Tuổi: "))
nam_sau = tuoi + 1

# ❌ SAI: Quên f trước chuỗi f-string
ten = "An"
print("Xin chào {ten}!")  # In ra: Xin chào {ten}! (không điền tên)

# ✅ ĐÚNG
print(f"Xin chào {ten}!")  # In ra: Xin chào An!

# ❌ SAI: Tên biến có dấu cách
ten hoc sinh = "An"  # SyntaxError

# ✅ ĐÚNG
ten_hoc_sinh = "An"  # Dùng dấu gạch dưới

# ❌ SAI: float() với số nguyên khi cần int
tuoi = float(input("Tuổi: "))  # 11.0 — lạ quá!

# ✅ ĐÚNG
tuoi = int(input("Tuổi: "))  # 11
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người lưu trữ:** Tạo được 5 biến các kiểu khác nhau và in ra

**🥈 Nhà phỏng vấn:** Dùng `input()` hỏi và in thông tin người dùng

**🥇 Kỹ sư tính toán:** Hoàn thành máy tính BMI có nhập/xuất

**💎 Siêu sao:** Tạo chương trình tính tuổi + năm nghỉ hưu + năm học đại học
