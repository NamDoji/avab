# Chuyên đề 9: Files & Data — Tệp & Dữ Liệu 💾

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Đọc và ghi file văn bản với `open()`, `read()`, `write()`
- Đọc và ghi file CSV (bảng tính)
- Làm việc với JSON (định dạng dữ liệu phổ biến)
- Xây dựng ứng dụng lưu dữ liệu lâu dài

---

## 🐍 Python Syntax chính

```python
# ============================================
# GHI FILE VĂN BẢN (.txt)
# ============================================

# Ghi file mới (mode 'w' — write, ghi đè nếu đã tồn tại)
with open("nhat_ky.txt", "w", encoding="utf-8") as f:
    f.write("Ngày 1: Hôm nay học Python!\n")
    f.write("Ngày 2: Học xong bài for loop.\n")
    f.write("Ngày 3: Vẽ hình bằng turtle!\n")

print("✅ Đã ghi file thành công!")

# Thêm vào cuối file (mode 'a' — append)
with open("nhat_ky.txt", "a", encoding="utf-8") as f:
    f.write("Ngày 4: Học Files & Data!\n")

# ============================================
# ĐỌC FILE VĂN BẢN
# ============================================

# Đọc toàn bộ file
with open("nhat_ky.txt", "r", encoding="utf-8") as f:
    noi_dung = f.read()
    print(noi_dung)

# Đọc từng dòng
with open("nhat_ky.txt", "r", encoding="utf-8") as f:
    for dong in f:
        print(dong.strip())  # .strip() bỏ \n cuối dòng

# Đọc tất cả dòng vào list
with open("nhat_ky.txt", "r", encoding="utf-8") as f:
    danh_sach_dong = f.readlines()
    
print(f"File có {len(danh_sach_dong)} dòng")

# ============================================
# FILE CSV — Bảng tính
# ============================================

import csv

# Ghi file CSV
hoc_sinh_data = [
    ["Tên", "Toán", "Văn", "Anh", "Trung bình"],
    ["Nguyễn Văn An", 9, 8, 8.5, 8.5],
    ["Trần Thị Bình", 7, 9, 8, 8.0],
    ["Lê Văn Cúc", 10, 7.5, 9, 8.83],
    ["Phạm Thu Dung", 8, 8.5, 7, 7.83],
]

with open("bang_diem.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerows(hoc_sinh_data)

print("✅ Đã tạo file bang_diem.csv")

# Đọc file CSV
with open("bang_diem.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)   # Đọc dòng tiêu đề
    print("Tiêu đề:", header)
    
    for row in reader:
        print(f"  {row[0]}: TB = {row[4]}")

# ============================================
# FILE JSON — Lưu dữ liệu phức tạp
# ============================================

import json

# Dữ liệu Python (dict/list)
hoc_sinh = {
    "ten": "Nguyễn Văn An",
    "tuoi": 11,
    "lop": "6A",
    "diem": {
        "Toan": 9.5,
        "Van": 8.0,
        "Anh": 8.5
    },
    "ccl_ngoai_khoa": ["lập trình", "bóng đá", "nhạc"]
}

# Ghi JSON
with open("hoc_sinh.json", "w", encoding="utf-8") as f:
    json.dump(hoc_sinh, f, ensure_ascii=False, indent=2)

print("✅ Đã ghi file hoc_sinh.json")

# Đọc JSON
with open("hoc_sinh.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Tên: {data['ten']}")
print(f"Điểm Toán: {data['diem']['Toan']}")
print(f"Hoạt động: {', '.join(data['ccl_ngoai_khoa'])}")

# ============================================
# KIỂM TRA FILE TỒN TẠI
# ============================================

import os

if os.path.exists("nhat_ky.txt"):
    kich_thuoc = os.path.getsize("nhat_ky.txt")
    print(f"File tồn tại! Kích thước: {kich_thuoc} bytes")
else:
    print("File chưa tồn tại!")
```

---

## 💡 Từ khóa & Khái niệm

| Khái niệm | Ý nghĩa |
|-----------|---------|
| `open(file, mode)` | Mở file |
| `"r"` | Read — đọc |
| `"w"` | Write — ghi (xóa nội dung cũ) |
| `"a"` | Append — thêm vào cuối |
| `with ... as f` | Tự động đóng file sau khi xong |
| `f.read()` | Đọc toàn bộ nội dung |
| `f.write(text)` | Ghi text vào file |
| `f.readlines()` | Đọc tất cả dòng vào list |
| CSV | Comma-Separated Values — bảng tính đơn giản |
| JSON | JavaScript Object Notation — dữ liệu có cấu trúc |
| `json.dump()` | Ghi Python dict/list thành JSON |
| `json.load()` | Đọc JSON thành Python dict/list |

**Tại sao dùng `with`?**
```python
# ❌ CÁCH CŨ: Phải nhớ đóng file
f = open("file.txt", "r")
noi_dung = f.read()
f.close()   # Dễ quên!

# ✅ CÁCH MỚI: with tự đóng
with open("file.txt", "r") as f:
    noi_dung = f.read()
# File tự đóng sau khi ra khỏi with block
```

---

## 🔨 Project thực hành: Nhật Ký Học Tập & Quản Lý Điểm

```python
# ============================================
# Project: Hệ Thống Quản Lý Điểm Số
# Lưu dữ liệu vào JSON — không mất khi tắt máy!
# ============================================

import json
import os
from datetime import datetime

FILE_DU_LIEU = "du_lieu_hoc_tap.json"

def tai_du_lieu():
    """Đọc dữ liệu từ file JSON"""
    if os.path.exists(FILE_DU_LIEU):
        with open(FILE_DU_LIEU, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"hoc_sinh": {}, "lich_su": []}

def luu_du_lieu(data):
    """Ghi dữ liệu vào file JSON"""
    with open(FILE_DU_LIEU, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def them_hoc_sinh(data, ten):
    """Thêm học sinh mới"""
    if ten not in data["hoc_sinh"]:
        data["hoc_sinh"][ten] = {"diem": {}}
        print(f"✅ Đã thêm học sinh: {ten}")
    else:
        print(f"⚠️ {ten} đã tồn tại!")

def them_diem(data, ten, mon, diem):
    """Thêm điểm cho học sinh"""
    if ten not in data["hoc_sinh"]:
        print(f"❌ Không tìm thấy học sinh: {ten}")
        return
    
    if mon not in data["hoc_sinh"][ten]["diem"]:
        data["hoc_sinh"][ten]["diem"][mon] = []
    
    data["hoc_sinh"][ten]["diem"][mon].append(diem)
    
    # Ghi lịch sử
    data["lich_su"].append({
        "thoi_gian": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "hanh_dong": f"Thêm điểm {mon}={diem} cho {ten}"
    })
    
    print(f"✅ Đã thêm: {ten} - {mon}: {diem}")

def xem_bao_cao(data, ten):
    """Xem báo cáo học tập của một học sinh"""
    if ten not in data["hoc_sinh"]:
        print(f"❌ Không tìm thấy: {ten}")
        return
    
    print(f"\n{'='*45}")
    print(f"  📊 BÁO CÁO: {ten}")
    print(f"{'='*45}")
    
    diem_hs = data["hoc_sinh"][ten]["diem"]
    tat_ca_diem = []
    
    for mon, ds_diem in diem_hs.items():
        tb = sum(ds_diem) / len(ds_diem)
        tat_ca_diem.extend(ds_diem)
        sao = "⭐" * int(tb / 2)
        print(f"  {mon:12} : {[d for d in ds_diem]} → TB: {tb:.1f} {sao}")
    
    if tat_ca_diem:
        tb_chung = sum(tat_ca_diem) / len(tat_ca_diem)
        print(f"\n  Điểm TB tổng: {tb_chung:.2f}")
        
        if tb_chung >= 9:
            loai = "Xuất sắc 🏆"
        elif tb_chung >= 8:
            loai = "Giỏi 🥇"
        elif tb_chung >= 6.5:
            loai = "Khá 🥈"
        elif tb_chung >= 5:
            loai = "Trung bình 🥉"
        else:
            loai = "Yếu ❌"
        print(f"  Xếp loại   : {loai}")

def xuat_csv(data):
    """Xuất báo cáo ra file CSV"""
    import csv
    
    with open("bao_cao_diem.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Học sinh", "Môn", "Điểm các lần", "Trung bình"])
        
        for ten, info in data["hoc_sinh"].items():
            for mon, ds_diem in info["diem"].items():
                tb = sum(ds_diem) / len(ds_diem) if ds_diem else 0
                writer.writerow([ten, mon, str(ds_diem), f"{tb:.2f}"])
    
    print("✅ Đã xuất file bao_cao_diem.csv")

# ============================================
# VÒNG LẶP CHÍNH
# ============================================

data = tai_du_lieu()

# Thêm dữ liệu mẫu nếu trống
if not data["hoc_sinh"]:
    them_hoc_sinh(data, "Nguyễn Văn An")
    them_hoc_sinh(data, "Trần Thị Bình")
    them_diem(data, "Nguyễn Văn An", "Toán", 9)
    them_diem(data, "Nguyễn Văn An", "Toán", 8.5)
    them_diem(data, "Nguyễn Văn An", "Văn", 8)
    them_diem(data, "Trần Thị Bình", "Toán", 7.5)
    them_diem(data, "Trần Thị Bình", "Anh", 9)
    luu_du_lieu(data)

print("\n📚 HỆ THỐNG QUẢN LÝ ĐIỂM SỐ")
print("Dữ liệu được lưu vào file JSON!")

while True:
    print("\n1. Thêm học sinh")
    print("2. Thêm điểm")
    print("3. Xem báo cáo")
    print("4. Xem tất cả học sinh")
    print("5. Xuất CSV")
    print("6. Thoát")
    
    chon = input("\nChọn: ")
    
    if chon == "1":
        ten = input("Tên học sinh: ")
        them_hoc_sinh(data, ten)
        luu_du_lieu(data)
    
    elif chon == "2":
        ten = input("Tên học sinh: ")
        mon = input("Môn học: ")
        try:
            diem = float(input("Điểm: "))
            them_diem(data, ten, mon, diem)
            luu_du_lieu(data)
        except ValueError:
            print("❌ Điểm phải là số!")
    
    elif chon == "3":
        ten = input("Tên học sinh: ")
        xem_bao_cao(data, ten)
    
    elif chon == "4":
        print(f"\n📋 Danh sách ({len(data['hoc_sinh'])} học sinh):")
        for i, ten in enumerate(data["hoc_sinh"], 1):
            print(f"  {i}. {ten}")
    
    elif chon == "5":
        xuat_csv(data)
    
    elif chon == "6":
        luu_du_lieu(data)
        print("💾 Đã lưu! Tạm biệt!")
        break
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Dữ liệu ở đâu?"**
- Hỏi: "Khi bạn tắt máy, điểm số trong game biến mất không?"
- Giải thích: RAM (tạm thời) vs Ổ cứng (lâu dài)
- Biến Python = RAM; File = Ổ cứng

### Review — 5 phút
- Hỏi: turtle.forward() và turtle.right() làm gì?
- Ai vẽ được hình đẹp nhất trong bài homework?

### Learn & Demo — 10 phút
1. Tạo và ghi file txt → mở bằng Notepad xem
2. Đọc file → in từng dòng
3. Giải thích CSV — mở trong Excel/Google Sheets
4. Demo JSON — trực quan nhất để lưu dict

### Code Along — 15 phút
```python
# Tạo nhật ký học tập
ten = input("Tên bạn: ")
mon = input("Môn học hôm nay: ")
ghi_chu = input("Bạn học được gì? ")

with open("nhat_ky.txt", "a", encoding="utf-8") as f:
    f.write(f"{ten} - {mon}: {ghi_chu}\n")

print("✅ Đã ghi vào nhật ký!")

# Đọc lại
print("\n📖 Nhật ký của bạn:")
with open("nhat_ky.txt", "r", encoding="utf-8") as f:
    print(f.read())
```

### Challenge — 10 phút
Lưu 5 bài thơ yêu thích vào 5 file .txt khác nhau, rồi đọc và in tên file và dòng đầu tiên.

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Viết chương trình ghi tên và tuổi của 5 người vào file txt, rồi đọc và in ra.

**Bài 2 — Dễ:** Tạo file CSV chứa thực đơn tuần (7 ngày × 3 bữa), đọc và in ra.

**Bài 3 — Trung bình:** Viết chương trình đếm số từ và số dòng trong một file txt.

**Bài 4 — Trung bình:** Tạo sổ tay địa chỉ bằng JSON: thêm, xóa, tìm kiếm, lưu tự động.

**Bài 5 — Khó:** Đọc file CSV chứa điểm số, tính trung bình từng học sinh, xuất báo cáo ra file txt mới.

---

## 🤖 AI Coach gợi ý

- *"Encoding UTF-8 là gì? Tại sao cần khi làm việc với tiếng Việt?"*
- *"JSON và CSV khác nhau thế nào? Khi nào dùng cái nào?"*
- *"Làm thế nào để đọc file Excel bằng Python (thư viện openpyxl)?"*
- *"Tôi muốn backup dữ liệu tự động — làm thế nào?"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Quên encoding khi dùng tiếng Việt
with open("file.txt", "w") as f:
    f.write("Xin chào!")  # UnicodeEncodeError trên Windows!

# ✅ ĐÚNG
with open("file.txt", "w", encoding="utf-8") as f:
    f.write("Xin chào!")

# ❌ SAI: Đọc file không tồn tại
with open("khong_co.txt", "r") as f:  # FileNotFoundError!
    pass

# ✅ ĐÚNG: Kiểm tra trước
import os
if os.path.exists("khong_co.txt"):
    with open("khong_co.txt", "r") as f:
        pass

# ❌ SAI: Ghi đè dữ liệu cũ khi muốn thêm
with open("nhat_ky.txt", "w") as f:  # "w" xóa toàn bộ!
    f.write("Dòng mới")

# ✅ ĐÚNG: Dùng "a" để thêm vào cuối
with open("nhat_ky.txt", "a") as f:
    f.write("Dòng mới\n")

# ❌ SAI: json.dump vs json.dumps nhầm lẫn
import json
data = {"ten": "An"}
with open("file.json", "w") as f:
    f.write(json.dumps(data))   # Hoạt động nhưng thiếu indent

# ✅ TỐT HƠN
with open("file.json", "w") as f:
    json.dump(data, f, indent=2)   # Đẹp hơn, dễ đọc hơn
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người ghi chép:** Ghi và đọc được file .txt cơ bản

**🥈 Quản lý dữ liệu:** Làm việc được với CSV và JSON

**🥇 Kỹ sư dữ liệu:** Xây dựng hệ thống quản lý điểm lưu JSON có đầy đủ CRUD

**💎 Siêu sao:** Hệ thống nhật ký học tập tự động xuất báo cáo CSV + thống kê
