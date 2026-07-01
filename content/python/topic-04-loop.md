# Chuyên đề 4: Loop — Vòng Lặp 🔄

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Dùng vòng lặp `for` để lặp qua dãy số hoặc danh sách
- Dùng vòng lặp `while` để lặp khi điều kiện còn đúng
- Sử dụng `range()` để tạo dãy số
- Dùng `break` và `continue` để điều khiển vòng lặp

---

## 🐍 Python Syntax chính

```python
# ============================================
# FOR LOOP — lặp qua từng phần tử
# ============================================

# Lặp qua dãy số với range()
for i in range(5):          # 0, 1, 2, 3, 4
    print(f"Lần {i}")

# range(start, stop)
for i in range(1, 6):       # 1, 2, 3, 4, 5
    print(f"Số: {i}")

# range(start, stop, step)
for i in range(0, 11, 2):   # 0, 2, 4, 6, 8, 10
    print(f"Số chẵn: {i}")

# Đếm ngược
for i in range(10, 0, -1):  # 10, 9, 8, ..., 1
    print(i)
print("🚀 Phóng!")

# Lặp qua chuỗi
ten = "Python"
for chu in ten:
    print(chu)              # P, y, t, h, o, n

# Lặp qua danh sách
trai_cay = ["táo", "cam", "xoài", "dưa"]
for trai in trai_cay:
    print(f"Tôi thích {trai}!")

# ============================================
# WHILE LOOP — lặp khi điều kiện đúng
# ============================================

dem = 0
while dem < 5:
    print(f"Đếm: {dem}")
    dem += 1    # dem = dem + 1

# While với input người dùng
mat_khau_dung = "python123"
nhap = ""
lan_thu = 0

while nhap != mat_khau_dung:
    nhap = input("Nhập mật khẩu: ")
    lan_thu += 1
    if nhap != mat_khau_dung:
        print("Sai rồi! Thử lại.")

print(f"Đúng! Đăng nhập thành công sau {lan_thu} lần!")

# ============================================
# BREAK — thoát vòng lặp ngay lập tức
# ============================================

for i in range(10):
    if i == 5:
        break           # Dừng khi i = 5
    print(f"i = {i}")  # In 0, 1, 2, 3, 4

# ============================================
# CONTINUE — bỏ qua lần lặp này
# ============================================

for i in range(10):
    if i % 2 == 0:
        continue        # Bỏ qua số chẵn
    print(f"Số lẻ: {i}")   # In 1, 3, 5, 7, 9

# ============================================
# VÒNG LẶP LỒNG NHAU (Nested loops)
# ============================================

# Bảng nhân
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} × {j} = {i*j}", end="   ")
    print()  # Xuống dòng sau mỗi hàng

# Vẽ hình bằng *
for hang in range(5):
    for cot in range(hang + 1):
        print("*", end=" ")
    print()
# Kết quả:
# *
# * *
# * * *
# * * * *
# * * * * *
```

---

## 💡 Từ khóa & Khái niệm

| Từ khóa | Ý nghĩa |
|---------|---------|
| `for` | Lặp qua từng phần tử |
| `while` | Lặp khi điều kiện còn đúng |
| `range(n)` | Tạo dãy 0, 1, ..., n-1 |
| `range(a, b)` | Tạo dãy a, a+1, ..., b-1 |
| `range(a, b, c)` | Dãy với bước nhảy c |
| `break` | Thoát vòng lặp ngay |
| `continue` | Bỏ qua lần này, sang lần sau |
| `+=` | Cộng vào biến: `x += 1` = `x = x + 1` |

**Khi nào dùng for, khi nào dùng while?**
- `for`: Khi biết trước số lần lặp (ví dụ: in bảng nhân đến 10)
- `while`: Khi không biết trước, lặp đến khi có điều kiện dừng (ví dụ: chờ nhập đúng mật khẩu)

---

## 🔨 Project thực hành: In Bảng Nhân & Hình Nghệ Thuật

```python
# ============================================
# Project 1: Bảng Nhân Tự Chọn
# ============================================

print("=" * 40)
print("     📊 BẢNG NHÂN TỰ CHỌN")
print("=" * 40)

so = int(input("Nhập số cần xem bảng nhân: "))
den = int(input("Nhân đến số mấy? (thường là 10): "))

print()
print(f"BẢNG NHÂN {so}:")
print("-" * 25)

for i in range(1, den + 1):
    ket_qua = so * i
    print(f"  {so} × {i:2d} = {ket_qua:4d}")

print("-" * 25)
print(f"Tổng: {so} × 1 + ... + {so} × {den} = {so * sum(range(1, den+1))}")

# ============================================
# Project 2: Vẽ Hình Sao (Pyramid)
# ============================================

print()
print("=" * 40)
print("     🌟 VẼ THÁP SAO")
print("=" * 40)

chieu_cao = int(input("Nhập chiều cao tháp (3-10): "))

# Kim tự tháp giữa
for i in range(1, chieu_cao + 1):
    khoang_trang = " " * (chieu_cao - i)
    sao = "*" * (2 * i - 1)
    print(khoang_trang + sao)

# Mặt hồ (phần phản chiếu)
print()
print("Tháp phản chiếu:")
for i in range(chieu_cao, 0, -1):
    khoang_trang = " " * (chieu_cao - i)
    sao = "*" * (2 * i - 1)
    print(khoang_trang + sao)

# ============================================
# Project 3: FizzBuzz (trò chơi nổi tiếng)
# ============================================

print()
print("=" * 40)
print("     🎲 TRÒ CHƠI FIZZBUZZ")
print("=" * 40)
print("Chia hết 3 → Fizz")
print("Chia hết 5 → Buzz")
print("Chia hết cả 3 và 5 → FizzBuzz")
print()

for i in range(1, 31):
    if i % 15 == 0:
        print(f"{i}: FizzBuzz 🎉")
    elif i % 3 == 0:
        print(f"{i}: Fizz 🔥")
    elif i % 5 == 0:
        print(f"{i}: Buzz 💨")
    else:
        print(f"{i}: {i}")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Trò chơi robot"**
- Chọn một học sinh làm "robot"
- Giáo viên nói: "Nhảy 5 lần" → Robot nhảy 5 lần
- Giải thích: `for i in range(5): nhay()`
- Hỏi: "Làm sao bảo robot làm đến khi mệt?" → while!

### Review — 5 phút
- Hỏi nhanh điều kiện if/elif/else
- Học sinh đọc code bài tập về nhà

### Learn & Demo — 10 phút
1. Demo `for` với range — đếm 1 đến 10
2. Demo in bảng nhân 2
3. Demo `while` — đếm ngược từ 10
4. Demo `break` — tìm số đầu tiên chia hết 7

### Code Along — 15 phút
```python
# Bước 1: In dãy số 1-10
for i in range(1, 11):
    print(i, end=" ")
print()

# Bước 2: Tính tổng 1+2+...+100
tong = 0
for i in range(1, 101):
    tong += i
print(f"Tổng 1 đến 100 = {tong}")

# Bước 3: Đếm số lần nhập
dem = 0
while dem < 3:
    nhap = input(f"Lần {dem+1}: Nhập gì đó: ")
    print(f"Bạn nhập: {nhap}")
    dem += 1
print("Xong 3 lần!")
```

### Challenge — 10 phút
**Vẽ kim tự tháp ngược hoặc hình thoi bằng `*`**

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** In các số từ 1 đến 50, mỗi dòng 10 số.

**Bài 2 — Dễ:** Tính tổng và tích của các số từ 1 đến n (nhập n từ bàn phím).

**Bài 3 — Trung bình:** In bảng nhân từ 1 đến 9 (dạng bảng đẹp).

**Bài 4 — Trung bình:** Nhập mật khẩu, chỉ cho thử tối đa 3 lần, sau đó khóa tài khoản.

**Bài 5 — Khó:** In hình kim cương (diamond) bằng `*` với chiều cao nhập từ bàn phím.

---

## 🤖 AI Coach gợi ý

- *"for loop và while loop khác nhau thế nào? Khi nào dùng cái nào?"*
- *"Làm thế nào để thoát khỏi vòng lặp vô hạn (infinite loop) trong Python?"*
- *"Giải thích range(2, 20, 3) sẽ tạo ra dãy số nào?"*
- *"Hãy tạo trò chơi đoán số bí mật bằng vòng lặp while"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Vòng lặp vô hạn — quên tăng biến đếm!
dem = 0
while dem < 5:
    print(dem)
    # Quên dem += 1 → chạy mãi mãi!

# ✅ ĐÚNG
dem = 0
while dem < 5:
    print(dem)
    dem += 1  # Nhớ tăng!

# ❌ SAI: range không bao gồm số cuối
for i in range(1, 10):
    print(i)  # In 1-9, không có 10!

# ✅ ĐÚNG nếu muốn đến 10
for i in range(1, 11):
    print(i)

# ❌ SAI: Thay đổi biến đang lặp trong for
for i in range(5):
    i = i * 2  # Vô ích! Python sẽ đặt lại i mỗi vòng
    print(i)

# ✅ ĐÚNG: Dùng biến riêng
for i in range(5):
    j = i * 2
    print(j)

# ❌ SAI: So sánh chuỗi viết hoa/thường
mat_khau = "Python"
nhap = input("Mật khẩu: ")
if nhap == "python":  # Nhập "Python" sẽ không khớp!
    print("Đúng!")

# ✅ ĐÚNG: Chuẩn hóa về lowercase
if nhap.lower() == "python":
    print("Đúng!")
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người lặp:** In được số 1-100 dùng for loop

**🥈 Tính toán gia:** Tính tổng và tích dãy số, in bảng nhân đẹp

**🥇 Nghệ sĩ sao:** Vẽ kim tự tháp và hình thoi bằng *

**💎 Siêu sao FizzBuzz:** Hoàn thành FizzBuzz + hệ thống đăng nhập 3 lần thử
