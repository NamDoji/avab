# Chuyên đề 6: List & Dictionary — Danh Sách & Từ Điển 📚

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Tạo và thao tác với `list` (danh sách)
- Tạo và dùng `dict` (từ điển/dictionary)
- Hiểu `tuple` và khi nào dùng
- Thêm, xóa, tìm kiếm phần tử trong list và dict
- Duyệt (loop) qua list và dict

---

## 🐍 Python Syntax chính

```python
# ============================================
# LIST — Danh sách (có thể thay đổi)
# ============================================

# Tạo list
trai_cay = ["táo", "cam", "xoài", "dưa hấu", "chuối"]
diem_so = [8, 9, 7, 10, 6.5]
hon_hop = ["Python", 12, True, 3.14]  # List chứa nhiều kiểu

# Truy cập theo chỉ số (index bắt đầu từ 0)
print(trai_cay[0])    # táo (đầu tiên)
print(trai_cay[2])    # xoài (thứ 3)
print(trai_cay[-1])   # chuối (cuối cùng)
print(trai_cay[-2])   # dưa hấu (áp chót)

# Cắt list (slicing)
print(trai_cay[1:3])  # ['cam', 'xoài'] — index 1 đến 2
print(trai_cay[:3])   # 3 phần tử đầu
print(trai_cay[2:])   # Từ index 2 đến hết

# Thêm phần tử
trai_cay.append("nho")           # Thêm vào cuối
trai_cay.insert(1, "bưởi")       # Thêm vào vị trí 1
print(trai_cay)

# Xóa phần tử
trai_cay.remove("táo")           # Xóa theo giá trị
trai_cay.pop()                    # Xóa phần tử cuối
trai_cay.pop(0)                   # Xóa theo index

# Thông tin về list
print(len(trai_cay))              # Độ dài
print("cam" in trai_cay)          # True/False — kiểm tra tồn tại
print(trai_cay.index("xoài"))     # Tìm vị trí

# Sắp xếp
diem_so.sort()                    # Tăng dần
diem_so.sort(reverse=True)        # Giảm dần
diem_so_sorted = sorted(diem_so)  # Trả về list mới, không sửa gốc

# Thống kê
print(max(diem_so))    # Lớn nhất
print(min(diem_so))    # Nhỏ nhất
print(sum(diem_so))    # Tổng
print(len(diem_so))    # Số lượng

# Lặp qua list
for trai in trai_cay:
    print(f"- {trai}")

# Lặp với index
for i, trai in enumerate(trai_cay):
    print(f"{i+1}. {trai}")

# ============================================
# DICTIONARY — Từ điển (key: value)
# ============================================

# Tạo dict — lưu thông tin theo tên (key)
hoc_sinh = {
    "ten": "Nguyễn Văn An",
    "tuoi": 11,
    "lop": "6A",
    "diem_toan": 9.5,
    "mon_yeu_thich": ["Toán", "Tin", "Văn"]
}

# Truy cập theo key
print(hoc_sinh["ten"])           # Nguyễn Văn An
print(hoc_sinh["diem_toan"])     # 9.5
print(hoc_sinh.get("lop"))       # 6A (an toàn hơn)
print(hoc_sinh.get("dia_chi", "Không rõ"))  # Không rõ (nếu không có)

# Thêm/sửa
hoc_sinh["email"] = "an@gmail.com"  # Thêm key mới
hoc_sinh["tuoi"] = 12               # Sửa giá trị

# Xóa
del hoc_sinh["email"]               # Xóa theo key
hoc_sinh.pop("tuoi", None)          # Xóa an toàn

# Kiểm tra key
print("ten" in hoc_sinh)            # True
print("email" in hoc_sinh)          # False

# Lặp qua dict
for key in hoc_sinh:
    print(f"{key}: {hoc_sinh[key]}")

# Lặp key và value cùng lúc
for key, value in hoc_sinh.items():
    print(f"  {key} → {value}")

# Lấy tất cả keys/values
print(list(hoc_sinh.keys()))
print(list(hoc_sinh.values()))

# ============================================
# TUPLE — Danh sách KHÔNG thay đổi được
# ============================================

# Dùng cho dữ liệu cố định
toa_do = (10.8, 106.7)           # Tọa độ GPS TP.HCM
mau_sac = (255, 128, 0)          # Màu cam RGB
print(toa_do[0])                 # 10.8

# Tuple trong vòng lặp
for x, y in [(1, 2), (3, 4), (5, 6)]:
    print(f"x={x}, y={y}")
```

---

## 💡 Từ khóa & Khái niệm

| Cấu trúc | Ký hiệu | Thay đổi được? | Dùng khi nào |
|----------|---------|----------------|-------------|
| `list` | `[...]` | ✅ Có | Danh sách thay đổi |
| `dict` | `{key: value}` | ✅ Có | Thông tin có tên |
| `tuple` | `(...)` | ❌ Không | Dữ liệu cố định |

**List methods quan trọng:**
- `append(x)` — thêm vào cuối
- `insert(i, x)` — thêm vào vị trí i
- `remove(x)` — xóa phần tử x
- `pop(i)` — xóa vị trí i (mặc định cuối)
- `sort()` — sắp xếp
- `len()` — độ dài
- `x in list` — kiểm tra có tồn tại không

---

## 🔨 Project thực hành: Sổ Liên Lạc & Bảng Điểm

```python
# ============================================
# Project: Sổ Liên Lạc Thông Minh
# ============================================

so_lien_lac = {}

def them_lien_lac(ten, dien_thoai, email=""):
    so_lien_lac[ten] = {
        "dien_thoai": dien_thoai,
        "email": email
    }
    print(f"✅ Đã thêm {ten}")

def tim_lien_lac(ten):
    if ten in so_lien_lac:
        thong_tin = so_lien_lac[ten]
        print(f"\n📋 {ten}")
        print(f"   📞 {thong_tin['dien_thoai']}")
        if thong_tin['email']:
            print(f"   📧 {thong_tin['email']}")
    else:
        print(f"❌ Không tìm thấy '{ten}'")

def xoa_lien_lac(ten):
    if ten in so_lien_lac:
        del so_lien_lac[ten]
        print(f"🗑️ Đã xóa {ten}")
    else:
        print(f"❌ Không tìm thấy '{ten}'")

def hien_thi_tat_ca():
    if not so_lien_lac:
        print("📭 Sổ liên lạc trống!")
        return
    print(f"\n📒 SỔ LIÊN LẠC ({len(so_lien_lac)} người):")
    print("-" * 40)
    for i, (ten, tt) in enumerate(so_lien_lac.items(), 1):
        print(f"{i}. {ten} — {tt['dien_thoai']}")

# Thêm dữ liệu mẫu
them_lien_lac("Mẹ", "0901234567", "me@gmail.com")
them_lien_lac("Ba", "0912345678")
them_lien_lac("Cô Lan", "0923456789", "lan.gv@school.edu.vn")
them_lien_lac("Bạn An", "0934567890", "an@gmail.com")

# Menu
print("\n" + "=" * 45)
print("    📱 SỔ LIÊN LẠC THÔNG MINH")
print("=" * 45)

while True:
    print("\n1. Xem tất cả")
    print("2. Tìm kiếm")
    print("3. Thêm mới")
    print("4. Xóa")
    print("5. Thoát")
    
    chon = input("\nChọn (1-5): ")
    
    if chon == "1":
        hien_thi_tat_ca()
    elif chon == "2":
        ten = input("Tìm tên: ")
        tim_lien_lac(ten)
    elif chon == "3":
        ten = input("Tên: ")
        dt = input("Điện thoại: ")
        email = input("Email (Enter để bỏ): ")
        them_lien_lac(ten, dt, email)
    elif chon == "4":
        ten = input("Xóa tên: ")
        xoa_lien_lac(ten)
    elif chon == "5":
        print("👋 Tạm biệt!")
        break
    else:
        print("❌ Chọn 1-5 thôi!")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Giỏ trái cây"**
- Giáo viên có một túi đựng vật (thước, bút, sách...)
- Đây là "list" — có thứ tự, có thể thêm/bớt
- Bây giờ mở sách danh bạ: có tên → số điện thoại → đây là "dict"!

### Review — 5 phút
- Hàm là gì? Tại sao dùng hàm?
- Ai có thể giải thích scope trong 1 câu?

### Learn & Demo — 10 phút
1. Tạo list tên bạn trong lớp → `append`, `remove`, `sort`
2. Tạo dict thông tin một học sinh
3. Demo lặp qua list và dict
4. Demo `in` để kiểm tra phần tử

### Code Along — 15 phút
```python
# Quản lý điểm số
mon_hoc = ["Toán", "Văn", "Anh", "Lý", "Hóa"]
diem = []

for mon in mon_hoc:
    d = float(input(f"Điểm {mon}: "))
    diem.append(d)

print("\n📊 KẾT QUẢ:")
for i in range(len(mon_hoc)):
    print(f"  {mon_hoc[i]}: {diem[i]}")

print(f"\nĐiểm cao nhất: {max(diem)}")
print(f"Điểm thấp nhất: {min(diem)}")
print(f"Điểm trung bình: {sum(diem)/len(diem):.2f}")
```

### Challenge — 10 phút
Tạo list 10 số ngẫu nhiên, sắp xếp, in số chẵn/lẻ riêng.

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Tạo list 5 môn học yêu thích, sắp xếp theo alphabet, in theo thứ tự đánh số.

**Bài 2 — Dễ:** Tạo dict thông tin bản thân (10 trường), in ra đẹp dùng vòng lặp.

**Bài 3 — Trung bình:** Nhập 10 điểm, dùng list và hàm tính: max, min, trung bình, bao nhiêu điểm >= 8.

**Bài 4 — Trung bình:** Tạo dict "thực đơn" với 5 món ăn và giá. Nhập tên món, tính tổng tiền.

**Bài 5 — Khó:** Tạo chương trình quản lý danh sách mua sắm: thêm, xóa, đánh dấu đã mua, xem danh sách.

---

## 🤖 AI Coach gợi ý

- *"List comprehension trong Python là gì? Ví dụ đơn giản?"*
- *"Khi nào dùng dict thay vì list?"*
- *"Làm thế nào để sắp xếp dict theo value?"*
- *"Tôi muốn đếm số lần xuất hiện của mỗi chữ trong một câu dùng dict"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Index ngoài phạm vi
danh_sach = [1, 2, 3]
print(danh_sach[5])  # IndexError: list index out of range

# ✅ ĐÚNG: Kiểm tra trước
if 5 < len(danh_sach):
    print(danh_sach[5])

# ❌ SAI: Truy cập key không tồn tại trong dict
hoc_sinh = {"ten": "An"}
print(hoc_sinh["tuoi"])  # KeyError!

# ✅ ĐÚNG: Dùng .get()
print(hoc_sinh.get("tuoi", "Không rõ"))  # An toàn!

# ❌ SAI: Sửa list trong khi đang lặp
so = [1, 2, 3, 4, 5]
for s in so:
    if s == 3:
        so.remove(s)  # Có thể gây lỗi hoặc bỏ sót!

# ✅ ĐÚNG: Tạo list mới
so = [s for s in so if s != 3]

# ❌ SAI: Quên list là mutable — 2 biến cùng trỏ 1 list
a = [1, 2, 3]
b = a           # b và a cùng trỏ 1 list!
b.append(4)
print(a)  # [1, 2, 3, 4] — bất ngờ chưa!

# ✅ ĐÚNG: Copy list
b = a.copy()    # hoặc b = a[:]
b.append(4)
print(a)  # [1, 2, 3] — an toàn!
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người thu thập:** Tạo list và dict cơ bản, thêm/xóa/truy cập

**🥈 Quản lý dữ liệu:** Quản lý điểm số với list và dict kết hợp

**🥇 Lập trình viên thực tế:** Hoàn thành sổ liên lạc có menu đầy đủ

**💎 Siêu sao:** Tạo ứng dụng quản lý danh sách mua sắm thông minh
