# Chuyên đề 5: Function — Hàm 🧩

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Định nghĩa và gọi hàm với `def`
- Dùng tham số (parameters) và giá trị mặc định
- Dùng `return` để trả về kết quả
- Hiểu khái niệm scope (phạm vi biến)
- Viết code sạch, không lặp lại (DRY principle)

---

## 🐍 Python Syntax chính

```python
# ============================================
# HÀM CƠ BẢN — def
# ============================================

# Định nghĩa hàm (hàm không có tham số)
def chao_ban():
    print("Xin chào! 👋")
    print("Chào mừng đến với Python!")

# Gọi hàm
chao_ban()   # Xin chào! 👋
chao_ban()   # Gọi lại được nhiều lần!

# ============================================
# HÀM CÓ THAM SỐ (Parameters)
# ============================================

def chao_ten(ten):
    print(f"Xin chào, {ten}! 👋")

chao_ten("An")      # Xin chào, An! 👋
chao_ten("Bình")    # Xin chào, Bình! 👋
chao_ten("Python")  # Xin chào, Python! 👋

# Nhiều tham số
def gioi_thieu(ten, tuoi, lop):
    print(f"Tôi là {ten}, {tuoi} tuổi, học lớp {lop}.")

gioi_thieu("An", 11, "6A")
gioi_thieu("Bình", 12, "7B")

# ============================================
# HÀM CÓ RETURN — trả về giá trị
# ============================================

def tinh_tong(a, b):
    ket_qua = a + b
    return ket_qua

tong = tinh_tong(5, 3)
print(tong)                     # 8
print(tinh_tong(100, 200))     # 300

# Hàm tính BMI
def tinh_bmi(can_nang, chieu_cao_m):
    bmi = can_nang / (chieu_cao_m ** 2)
    return round(bmi, 2)

def xep_loai_bmi(bmi):
    if bmi < 18.5:
        return "Thiếu cân"
    elif bmi < 25:
        return "Bình thường ✅"
    elif bmi < 30:
        return "Thừa cân"
    else:
        return "Béo phì"

# Dùng hàm
bmi = tinh_bmi(45, 1.55)
loai = xep_loai_bmi(bmi)
print(f"BMI: {bmi} — {loai}")

# ============================================
# GIÁ TRỊ MẶC ĐỊNH (Default Parameters)
# ============================================

def chao_mung(ten, ngon_ngu="Tiếng Việt"):
    if ngon_ngu == "Tiếng Việt":
        print(f"Xin chào, {ten}!")
    elif ngon_ngu == "Tiếng Anh":
        print(f"Hello, {ten}!")
    elif ngon_ngu == "Tiếng Nhật":
        print(f"Konnichiwa, {ten}!")

chao_mung("An")                          # Tiếng Việt (mặc định)
chao_mung("Bob", "Tiếng Anh")            # Hello, Bob!
chao_mung("Tanaka", "Tiếng Nhật")        # Konnichiwa, Tanaka!

# ============================================
# RETURN NHIỀU GIÁ TRỊ
# ============================================

def tinh_toan(a, b):
    tong = a + b
    hieu = a - b
    tich = a * b
    return tong, hieu, tich

t, h, ti = tinh_toan(10, 3)
print(f"Tổng: {t}, Hiệu: {h}, Tích: {ti}")

# ============================================
# SCOPE — phạm vi biến
# ============================================

x = 100  # Biến global (toàn cục)

def ham_demo():
    x = 200  # Biến local (trong hàm) — khác với x ngoài!
    print(f"Trong hàm: x = {x}")

ham_demo()          # Trong hàm: x = 200
print(f"Ngoài hàm: x = {x}")  # Ngoài hàm: x = 100
```

---

## 💡 Từ khóa & Khái niệm

| Từ khóa | Ý nghĩa |
|---------|---------|
| `def` | Định nghĩa hàm |
| `return` | Trả về giá trị và kết thúc hàm |
| Parameter | Biến nhận dữ liệu trong hàm |
| Argument | Giá trị truyền vào khi gọi hàm |
| Default | Giá trị mặc định nếu không truyền |
| Scope | Phạm vi sống của biến (trong/ngoài hàm) |
| DRY | Don't Repeat Yourself — viết 1 lần, dùng nhiều lần |

**Tại sao dùng hàm?**
- 🔄 Tái sử dụng: viết một lần, gọi nhiều lần
- 🧹 Code sạch: tách logic thành từng phần nhỏ
- 🐛 Dễ sửa lỗi: sửa một chỗ, áp dụng mọi nơi
- 📖 Dễ đọc: tên hàm giải thích hàm làm gì

---

## 🔨 Project thực hành: Bộ Công Cụ Học Tập

```python
# ============================================
# Project: Bộ Công Cụ Học Tập
# ============================================

# ----- Hàm tiện ích -----

def in_tieu_de(tieu_de):
    """In tiêu đề đẹp có khung"""
    do_dai = len(tieu_de) + 4
    print("=" * do_dai)
    print(f"  {tieu_de}")
    print("=" * do_dai)

def tinh_trung_binh(danh_sach_diem):
    """Tính trung bình của danh sách điểm"""
    if len(danh_sach_diem) == 0:
        return 0
    return sum(danh_sach_diem) / len(danh_sach_diem)

def xep_loai(diem_tb):
    """Xếp loại học lực từ điểm trung bình"""
    if diem_tb >= 9:
        return "Xuất sắc 🏆"
    elif diem_tb >= 8:
        return "Giỏi 🥇"
    elif diem_tb >= 6.5:
        return "Khá 🥈"
    elif diem_tb >= 5:
        return "Trung bình 🥉"
    else:
        return "Yếu ❌"

def dem_chu(cau):
    """Đếm số từ trong câu"""
    tu = cau.split()
    return len(tu)

def doi_nhiet_do(nhiet_do, tu_don_vi, sang_don_vi):
    """Chuyển đổi nhiệt độ"""
    if tu_don_vi == "C" and sang_don_vi == "F":
        return nhiet_do * 9/5 + 32
    elif tu_don_vi == "F" and sang_don_vi == "C":
        return (nhiet_do - 32) * 5/9
    elif tu_don_vi == "C" and sang_don_vi == "K":
        return nhiet_do + 273.15
    else:
        return nhiet_do

# ----- Sử dụng bộ công cụ -----

in_tieu_de("BÁO CÁO HỌC TẬP")

# Nhập điểm
ten = input("Tên học sinh: ")
print("Nhập điểm (nhấn Enter để kết thúc):")

diem_list = []
mon_hoc = ["Toán", "Văn", "Anh", "Lý", "Hóa"]

for mon in mon_hoc:
    diem = float(input(f"  Điểm {mon}: "))
    diem_list.append(diem)

# Tính toán
diem_tb = tinh_trung_binh(diem_list)
loai = xep_loai(diem_tb)

print()
print(f"Học sinh  : {ten}")
print(f"Điểm TB   : {diem_tb:.2f}")
print(f"Xếp loại  : {loai}")
print(f"Điểm cao  : {max(diem_list)}")
print(f"Điểm thấp : {min(diem_list)}")

# Demo đổi nhiệt độ
print()
in_tieu_de("ĐỔI ĐƠN VỊ NHIỆT ĐỘ")
c = 37
print(f"{c}°C = {doi_nhiet_do(c, 'C', 'F'):.1f}°F")
print(f"{c}°C = {doi_nhiet_do(c, 'C', 'K'):.2f}K")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Hàm trong cuộc sống"**
- Hỏi: "Khi bạn muốn làm bánh mì kẹp thịt, bạn có công thức không?"
- Công thức = hàm! Làm 1 lần, dùng nhiều lần, cho nhiều người
- Tham số = nguyên liệu (loại bánh, nhân gì...)
- Return = chiếc bánh mì thành phẩm

### Review — 5 phút
- Ai có thể giải thích `break` và `continue` khác nhau thế nào?
- Xem qua bài tập FizzBuzz của học sinh

### Learn & Demo — 10 phút
1. Viết hàm `chao()` không tham số → gọi 5 lần
2. Thêm tham số tên → `chao("An")`
3. Thêm `return` → lưu vào biến và in
4. So sánh code có/không có hàm — hàm ngắn gọn hơn nhiều

### Code Along — 15 phút
```python
def tinh_dien_tich_chu_nhat(dai, rong):
    dien_tich = dai * rong
    chu_vi = 2 * (dai + rong)
    return dien_tich, chu_vi

# Tính cho nhiều hình
for i in range(3):
    print(f"\nHình {i+1}:")
    dai = float(input("  Chiều dài: "))
    rong = float(input("  Chiều rộng: "))
    dt, cv = tinh_dien_tich_chu_nhat(dai, rong)
    print(f"  Diện tích: {dt}, Chu vi: {cv}")
```

### Challenge — 10 phút
Viết hàm `is_nguyen_to(n)` trả về True nếu n là số nguyên tố.

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Viết hàm `chao_ngay(ten, thu)` in lời chào theo ngày trong tuần.

**Bài 2 — Dễ:** Viết hàm `tinh_chu_vi_dien_tich_hinh_tron(r)` trả về chu vi và diện tích.

**Bài 3 — Trung bình:** Viết hàm `dem_nguyen_am(cau)` đếm số nguyên âm (a, e, i, o, u) trong câu.

**Bài 4 — Trung bình:** Viết hàm `fibonacci(n)` in dãy Fibonacci đến n số.

**Bài 5 — Khó:** Viết bộ hàm tính toán hình học: hình tròn, hình chữ nhật, tam giác (diện tích + chu vi). Tạo menu cho người dùng chọn.

---

## 🤖 AI Coach gợi ý

- *"Docstring trong Python là gì và tại sao nên viết?"*
- *"Giải thích sự khác biệt giữa parameter và argument cho học sinh lớp 6"*
- *"Lambda function là gì? Có dùng được không hay phức tạp quá?"*
- *"Tại sao biến trong hàm không ảnh hưởng biến bên ngoài?"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Gọi hàm trước khi định nghĩa
chao()  # NameError!

def chao():
    print("Xin chào!")

# ✅ ĐÚNG: Định nghĩa trước, gọi sau
def chao():
    print("Xin chào!")

chao()

# ❌ SAI: Quên return — hàm trả về None
def tinh_tong(a, b):
    ket_qua = a + b
    # Quên return!

tong = tinh_tong(3, 4)
print(tong + 1)  # TypeError: None + 1

# ✅ ĐÚNG
def tinh_tong(a, b):
    return a + b

# ❌ SAI: Sai số lượng tham số
def chao(ten, tuoi):
    print(f"Xin chào {ten}, {tuoi} tuổi")

chao("An")  # TypeError: thiếu argument 'tuoi'

# ✅ ĐÚNG
chao("An", 11)

# ❌ SAI: Biến local ra ngoài hàm
def ham():
    bien_local = 42

ham()
print(bien_local)  # NameError: không tìm thấy!

# ✅ ĐÚNG: Return giá trị ra ngoài
def ham():
    bien_local = 42
    return bien_local

ket_qua = ham()
print(ket_qua)  # 42
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người tạo hàm:** Viết và gọi được hàm đơn giản có/không có tham số

**🥈 Kỹ sư tái sử dụng:** Viết hàm có return và dùng trong nhiều trường hợp

**🥇 Kiến trúc sư code:** Xây dựng bộ công cụ 5+ hàm tiện ích

**💎 Siêu sao:** Viết hàm `is_nguyen_to()` đúng + hàm tính diện tích đủ 3 hình học
