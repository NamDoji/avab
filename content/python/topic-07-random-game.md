# Chuyên đề 7: Random & Game — Ngẫu Nhiên & Trò Chơi 🎲

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Dùng `import random` để tạo số ngẫu nhiên
- Xây dựng game đoán số hoàn chỉnh
- Kết hợp vòng lặp, điều kiện, hàm để tạo game
- Thêm điểm số, vòng lặp chơi lại, và mức độ khó

---

## 🐍 Python Syntax chính

```python
# ============================================
# IMPORT RANDOM — thư viện ngẫu nhiên
# ============================================

import random

# Số nguyên ngẫu nhiên trong khoảng [a, b]
so = random.randint(1, 10)
print(f"Số ngẫu nhiên 1-10: {so}")

# Số thực ngẫu nhiên trong [a, b)
so_thuc = random.uniform(0, 1)
print(f"Số thực 0-1: {so_thuc:.4f}")

# Chọn ngẫu nhiên từ list
trai_cay = ["táo", "cam", "xoài", "chuối", "dưa"]
chon = random.choice(trai_cay)
print(f"Chọn ngẫu nhiên: {chon}")

# Chọn nhiều phần tử (không trùng)
chon_nhieu = random.sample(trai_cay, 3)
print(f"Chọn 3 trái: {chon_nhieu}")

# Trộn ngẫu nhiên list
bai_thi = ["A", "B", "C", "D", "E"]
random.shuffle(bai_thi)
print(f"Thứ tự bài thi: {bai_thi}")

# Tạo mã số ngẫu nhiên
ma_so = random.randint(1000, 9999)
print(f"Mã số: {ma_so}")

# Seed — đặt điểm xuất phát (để tái tạo kết quả)
random.seed(42)         # Mọi lần chạy với seed 42 đều cho kết quả giống nhau
print(random.randint(1, 100))  # Luôn là số cố định

# ============================================
# ỨNG DỤNG RANDOM TRONG GAME
# ============================================

# Xúc xắc
def tung_xuc_xac(so_mat=6):
    return random.randint(1, so_mat)

ket_qua = tung_xuc_xac()
print(f"🎲 Xúc xắc: {ket_qua}")

# Bốc thăm
hoc_sinh = ["An", "Bình", "Cúc", "Dũng", "Em", "Phúc"]
duoc_chon = random.choice(hoc_sinh)
print(f"🎯 Học sinh được gọi: {duoc_chon}")

# Kじゃtên sp ngẫu nhiên
import string
mat_khau = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
print(f"🔑 Mật khẩu ngẫu nhiên: {mat_khau}")
```

---

## 💡 Từ khóa & Khái niệm

| Hàm | Ý nghĩa | Ví dụ |
|-----|---------|-------|
| `random.randint(a, b)` | Số nguyên từ a đến b (bao gồm) | `randint(1, 6)` → 1-6 |
| `random.uniform(a, b)` | Số thực từ a đến b | `uniform(0, 1)` |
| `random.choice(list)` | Chọn 1 phần tử | `choice(["A","B"])` |
| `random.sample(list, n)` | Chọn n phần tử khác nhau | `sample(list, 3)` |
| `random.shuffle(list)` | Trộn ngẫu nhiên list | `shuffle(bai)` |
| `import` | Nạp thư viện vào chương trình | `import random` |

**Module / Thư viện là gì?**
- Như hộp công cụ chứa sẵn các hàm hữu ích
- `random` — số ngẫu nhiên
- `math` — toán học (sin, cos, sqrt...)
- `time` — thời gian, đếm giờ
- `datetime` — ngày tháng

---

## 🔨 Project thực hành: Game Đoán Số Siêu Cấp

```python
# ============================================
# Project: Game Đoán Số Siêu Cấp
# ============================================

import random

def hien_thi_menu():
    print("\n" + "=" * 50)
    print("      🎮 GAME ĐOÁN SỐ BÍ MẬT")
    print("=" * 50)
    print("1. Dễ   — Số từ 1 đến 50  (10 lần đoán)")
    print("2. TB   — Số từ 1 đến 100 (7 lần đoán)")
    print("3. Khó  — Số từ 1 đến 200 (5 lần đoán)")
    print("4. Xem bảng điểm cao")
    print("5. Thoát")
    return input("\nChọn mức (1-5): ")

def choi_mot_van(pham_vi, so_lan_toi_da):
    """Chơi một ván game đoán số"""
    so_bi_mat = random.randint(1, pham_vi)
    lan_doan = 0
    da_thang = False
    
    print(f"\n🎯 Tôi đang nghĩ số từ 1 đến {pham_vi}")
    print(f"   Bạn có {so_lan_toi_da} lần đoán!")
    
    while lan_doan < so_lan_toi_da:
        lan_doan += 1
        con_lai = so_lan_toi_da - lan_doan + 1
        
        print(f"\n[Lần {lan_doan}/{so_lan_toi_da}] Còn {con_lai} lần")
        
        try:
            du_doan = int(input("Đoán số: "))
        except ValueError:
            print("❌ Hãy nhập số nguyên!")
            lan_doan -= 1  # Không tính lần nhập sai
            continue
        
        if du_doan < 1 or du_doan > pham_vi:
            print(f"❌ Nhập số từ 1 đến {pham_vi} thôi!")
            lan_doan -= 1
            continue
        
        khoang_cach = abs(du_doan - so_bi_mat)
        
        if du_doan == so_bi_mat:
            print(f"\n🎉 CHÍNH XÁC! Số bí mật là {so_bi_mat}!")
            da_thang = True
            break
        elif du_doan < so_bi_mat:
            if khoang_cach <= 5:
                print(f"🔥 Nóng! Hơi thấp — thử cao hơn chút!")
            elif khoang_cach <= 20:
                print(f"😅 Ấm! Số bí mật CAO hơn {du_doan}")
            else:
                print(f"❄️  Lạnh! Số bí mật CAO hơn nhiều!")
        else:
            if khoang_cach <= 5:
                print(f"🔥 Nóng! Hơi cao — thử thấp hơn chút!")
            elif khoang_cach <= 20:
                print(f"😅 Ấm! Số bí mật THẤP hơn {du_doan}")
            else:
                print(f"❄️  Lạnh! Số bí mật THẤP hơn nhiều!")
    
    if not da_thang:
        print(f"\n💀 Hết lượt! Số bí mật là {so_bi_mat}. Cố gắng lần sau!")
    
    return da_thang, lan_doan

def tinh_diem(da_thang, lan_doan, muc_do):
    """Tính điểm theo kết quả"""
    if not da_thang:
        return 0
    
    diem_co_ban = {"1": 100, "2": 200, "3": 400}
    diem = diem_co_ban.get(muc_do, 100)
    
    # Thưởng đoán nhanh
    if lan_doan == 1:
        diem *= 5   # May mắn!
    elif lan_doan <= 3:
        diem *= 2
    
    return diem

# Bảng điểm cao
bang_diem = []

# Vòng chơi chính
tong_diem = 0
ten_nguoi_choi = input("Tên của bạn: ")

while True:
    lua_chon = hien_thi_menu()
    
    if lua_chon == "5":
        print(f"\n👋 Cảm ơn {ten_nguoi_choi} đã chơi!")
        print(f"🏆 Tổng điểm: {tong_diem}")
        break
    
    elif lua_chon == "4":
        if not bang_diem:
            print("\n📭 Chưa có dữ liệu!")
        else:
            print("\n🏆 BẢNG ĐIỂM CAO:")
            bang_diem_sap = sorted(bang_diem, key=lambda x: x[1], reverse=True)
            for i, (ten, diem, muc) in enumerate(bang_diem_sap[:5], 1):
                muc_text = {"1": "Dễ", "2": "TB", "3": "Khó"}.get(muc, muc)
                print(f"  {i}. {ten}: {diem} điểm ({muc_text})")
    
    elif lua_chon in ["1", "2", "3"]:
        cai_dat = {
            "1": (50, 10),
            "2": (100, 7),
            "3": (200, 5)
        }
        pham_vi, so_lan = cai_dat[lua_chon]
        
        thang, so_lan_doan = choi_mot_van(pham_vi, so_lan)
        diem_van_nay = tinh_diem(thang, so_lan_doan, lua_chon)
        tong_diem += diem_van_nay
        
        if diem_van_nay > 0:
            print(f"💰 Điểm ván này: +{diem_van_nay}")
        print(f"📊 Tổng điểm: {tong_diem}")
        
        bang_diem.append((ten_nguoi_choi, tong_diem, lua_chon))
        
        lai = input("\nChơi lại không? (có/không): ").lower()
        if lai != "có" and lai != "co":
            print(f"👋 Nghỉ thôi! Tổng điểm: {tong_diem}")
            break
    else:
        print("❌ Chọn 1-5 thôi!")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Xúc xắc thực"**
- Giáo viên tung xúc xắc thật 5 lần, ghi kết quả
- Hỏi: "Python có thể giả lập xúc xắc không?"
- Demo `random.randint(1, 6)` → giống hệt!

### Review — 5 phút
- Hỏi: list khác dict thế nào?
- Một học sinh giải thích `.append()` và `.remove()`

### Learn & Demo — 10 phút
1. Import random → các hàm cơ bản
2. Demo `randint`, `choice`, `shuffle`
3. Build game đoán số đơn giản từng bước
4. Giải thích tại sao cần `try/except` khi nhập số

### Code Along — 15 phút
```python
import random

# Version đơn giản — cùng nhau xây dựng
so_bi_mat = random.randint(1, 20)
print("Đoán số từ 1 đến 20!")

while True:
    du_doan = int(input("Đoán: "))
    if du_doan < so_bi_mat:
        print("Thấp hơn!")
    elif du_doan > so_bi_mat:
        print("Cao hơn!")
    else:
        print("🎉 Đúng rồi!")
        break
```

### Challenge — 10 phút
**Kじゃo**: Thêm đếm số lần đoán và in ra "Bạn đoán đúng sau X lần!"

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Viết chương trình tung 2 xúc xắc 10 lần, in kết quả và tổng mỗi lần.

**Bài 2 — Dễ:** Bốc thăm ngẫu nhiên: nhập tên 5 bạn, chọn 1 người làm nhóm trưởng.

**Bài 3 — Trung bình:** Game kéo-búa-bao: người chơi vs máy (3 ván, ai thắng 2 thắng).

**Bài 4 — Trung bình:** Tạo đề kiểm tra toán ngẫu nhiên (10 câu cộng/trừ/nhân/chia) và chấm điểm.

**Bài 5 — Khó:** Game số học may mắn: máy ra 4 số ngẫu nhiên 1-9, người chơi dùng +/-/×/÷ để tạo thành số 24.

---

## 🤖 AI Coach gợi ý

- *"random.seed() dùng để làm gì? Khi nào cần dùng?"*
- *"Làm thế nào để tạo mật khẩu ngẫu nhiên an toàn bằng Python?"*
- *"Tôi muốn tạo game xổ số mini bằng Python, hướng dẫn tôi"*
- *"Giải thích try/except cho học sinh lớp 6"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Quên import random
so = random.randint(1, 10)  # NameError!

# ✅ ĐÚNG
import random
so = random.randint(1, 10)

# ❌ SAI: randint vs range — range không bao gồm số cuối
so = random.randint(1, 10)   # Cho số 1-10 (bao gồm 10)
# Khác với range(1, 10) — từ 1 đến 9!

# ❌ SAI: Không xử lý input sai
du_doan = int(input("Đoán: "))  # Crash nếu nhập chữ!

# ✅ ĐÚNG: Dùng try/except
try:
    du_doan = int(input("Đoán: "))
except ValueError:
    print("Hãy nhập số nguyên!")

# ❌ SAI: Shuffle trả về None
danh_sach = [1, 2, 3, 4, 5]
danh_sach = random.shuffle(danh_sach)  # danh_sach = None!
print(danh_sach)  # None

# ✅ ĐÚNG: shuffle sửa trực tiếp, không trả về gì
random.shuffle(danh_sach)   # Sửa tại chỗ
print(danh_sach)             # In list đã trộn
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người xúc xắc:** Dùng `random.randint()` tạo xúc xắc và trò chơi đơn giản

**🥈 Game Developer:** Xây dựng game đoán số có gợi ý nóng/lạnh

**🥇 Master Gamer:** Game đoán số đầy đủ với nhiều mức, điểm số, chơi lại

**💎 Siêu sao:** Game kéo-búa-bao 3 ván + bảng điểm cao + thống kê tỷ lệ thắng
