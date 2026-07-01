# Chuyên đề 12: Dự Án Cuối Khóa 🏆

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Tổng hợp tất cả kiến thức đã học qua một dự án thực tế
- Lên kế hoạch, phát triển và trình bày sản phẩm
- Chọn một trong 4 loại dự án: Game / Chatbot / AI Tool / Mini Website
- Tự tin thuyết trình sản phẩm trước lớp

---

## 🗺️ Bản Đồ Hành Trình 12 Tuần

```
Bài 1: print()     → Bài 2: Variables  → Bài 3: if/else
Bài 4: for/while   → Bài 5: Functions  → Bài 6: List/Dict
Bài 7: Random/Game → Bài 8: Turtle     → Bài 9: Files/JSON
Bài 10: AI/Chatbot → Bài 11: CV/QR     → Bài 12: ★ DỰ ÁN ★
```

**Bạn đã học được:**
- ✅ In ra màn hình, tính toán
- ✅ Biến, kiểu dữ liệu, nhận input
- ✅ Điều kiện và rẽ nhánh
- ✅ Vòng lặp for/while
- ✅ Hàm và tái sử dụng code
- ✅ List, Dict, Tuple
- ✅ Random và game logic
- ✅ Vẽ hình với Turtle
- ✅ Đọc/ghi file, JSON, CSV
- ✅ AI API và chatbot
- ✅ Xử lý ảnh và QR code

---

## 🎮 DỰ ÁN LOẠI 1: GAME PYTHON

### Ý tưởng game đề xuất:

**1A. Game Đố Vui Kiến Thức (Quiz Game)**

```python
# ============================================
# GAME ĐỐ VUI KIẾN THỨC — Phiên bản đầy đủ
# ============================================

import random
import json
import os
from datetime import datetime

# ---- Ngân hàng câu hỏi ----
NGAN_HANG_CAU_HOI = {
    "Python": [
        {
            "cau_hoi": "Hàm nào dùng để in ra màn hình trong Python?",
            "dap_an": ["A. input()", "B. print()", "C. show()", "D. display()"],
            "dung": "B",
            "giai_thich": "print() là hàm cơ bản nhất để in ra màn hình trong Python!"
        },
        {
            "cau_hoi": "Kiểu dữ liệu nào dùng để lưu chuỗi văn bản?",
            "dap_an": ["A. int", "B. float", "C. str", "D. bool"],
            "dung": "C",
            "giai_thich": "str (string) dùng để lưu chuỗi văn bản như 'Hello', 'Python'."
        },
        {
            "cau_hoi": "range(5) tạo ra dãy số nào?",
            "dap_an": ["A. 1,2,3,4,5", "B. 0,1,2,3,4", "C. 0,1,2,3,4,5", "D. 1,2,3,4"],
            "dung": "B",
            "giai_thich": "range(5) tạo ra 0,1,2,3,4 — bắt đầu từ 0, kết thúc trước 5!"
        },
    ],
    "Toán": [
        {
            "cau_hoi": "π (pi) xấp xỉ bằng bao nhiêu?",
            "dap_an": ["A. 3.14", "B. 3.41", "C. 2.71", "D. 1.41"],
            "dung": "A",
            "giai_thich": "π ≈ 3.14159... Dùng để tính diện tích và chu vi hình tròn!"
        },
        {
            "cau_hoi": "12 × 12 = ?",
            "dap_an": ["A. 124", "B. 144", "C. 134", "D. 142"],
            "dung": "B",
            "giai_thich": "12 × 12 = 144. Đây cũng là 12 bình phương (12²)!"
        },
    ],
    "Khoa học": [
        {
            "cau_hoi": "Tốc độ ánh sáng trong chân không là bao nhiêu?",
            "dap_an": ["A. 300,000 km/s", "B. 30,000 km/s", "C. 3,000 km/s", "D. 300 km/s"],
            "dung": "A",
            "giai_thich": "Ánh sáng di chuyển 300,000 km mỗi giây — nhanh nhất vũ trụ!"
        },
        {
            "cau_hoi": "Nguyên tố nào nhẹ nhất trong bảng tuần hoàn?",
            "dap_an": ["A. Helium", "B. Oxygen", "C. Hydrogen", "D. Carbon"],
            "dung": "C",
            "giai_thich": "Hydrogen (H) là nguyên tố nhẹ nhất, số nguyên tử = 1!"
        },
    ]
}

BANG_DIEM_FILE = "quiz_scores.json"

def tai_bang_diem():
    if os.path.exists(BANG_DIEM_FILE):
        with open(BANG_DIEM_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def luu_bang_diem(bang_diem):
    with open(BANG_DIEM_FILE, "w", encoding="utf-8") as f:
        json.dump(bang_diem, f, ensure_ascii=False, indent=2)

def choi_quiz(ten_nguoi_choi, chu_de, so_cau=5):
    """Chơi một ván quiz"""
    if chu_de not in NGAN_HANG_CAU_HOI:
        print(f"❌ Không có chủ đề: {chu_de}")
        return 0
    
    cau_hoi_list = NGAN_HANG_CAU_HOI[chu_de].copy()
    random.shuffle(cau_hoi_list)
    cau_hoi_chon = cau_hoi_list[:min(so_cau, len(cau_hoi_list))]
    
    diem = 0
    tong_cau = len(cau_hoi_chon)
    
    print(f"\n{'='*55}")
    print(f"  🎯 QUIZ: {chu_de.upper()} — {tong_cau} CÂU HỎI")
    print(f"  Người chơi: {ten_nguoi_choi}")
    print(f"{'='*55}")
    
    for i, cau in enumerate(cau_hoi_chon, 1):
        print(f"\n📝 Câu {i}/{tong_cau}:")
        print(f"   {cau['cau_hoi']}")
        print()
        for da in cau['dap_an']:
            print(f"   {da}")
        
        tra_loi = input("\n   👉 Đáp án của bạn (A/B/C/D): ").strip().upper()
        
        if tra_loi == cau['dung']:
            diem += 1
            print("   ✅ ĐÚNG! 🎉 +1 điểm")
        else:
            print(f"   ❌ SAI! Đáp án đúng là: {cau['dung']}")
        
        print(f"   💡 {cau['giai_thich']}")
    
    print(f"\n{'='*55}")
    print(f"  🏆 KẾT QUẢ: {diem}/{tong_cau} câu đúng")
    phan_tram = diem / tong_cau * 100
    print(f"  📊 Tỷ lệ: {phan_tram:.0f}%")
    
    if phan_tram >= 80:
        print(f"  🌟 XUẤT SẮC! {ten_nguoi_choi} là thiên tài!")
    elif phan_tram >= 60:
        print(f"  👍 TỐT! Cố gắng thêm chút nữa nhé!")
    else:
        print(f"  💪 CẦN CỐ GẮNG! Ôn lại nhé {ten_nguoi_choi}!")
    
    return diem

def main_quiz():
    bang_diem = tai_bang_diem()
    ten = input("Nhập tên của bạn: ")
    
    while True:
        print(f"\n{'='*55}")
        print("  🎮 QUIZ ĐỐ VUI KIẾN THỨC")
        print(f"{'='*55}")
        print("Chủ đề:")
        chu_de_list = list(NGAN_HANG_CAU_HOI.keys())
        for i, cd in enumerate(chu_de_list, 1):
            so_cau = len(NGAN_HANG_CAU_HOI[cd])
            print(f"  {i}. {cd} ({so_cau} câu)")
        print(f"  {len(chu_de_list)+1}. 🏆 Xem bảng điểm")
        print(f"  {len(chu_de_list)+2}. 👋 Thoát")
        
        chon = input("\nChọn: ").strip()
        
        if chon.isdigit():
            chon_num = int(chon)
            if 1 <= chon_num <= len(chu_de_list):
                chu_de = chu_de_list[chon_num - 1]
                diem = choi_quiz(ten, chu_de)
                bang_diem.append({
                    "nguoi_choi": ten,
                    "chu_de": chu_de,
                    "diem": diem,
                    "thoi_gian": datetime.now().strftime("%Y-%m-%d %H:%M")
                })
                luu_bang_diem(bang_diem)
            elif chon_num == len(chu_de_list) + 1:
                print(f"\n🏆 BẢNG ĐIỂM CAO:")
                top = sorted(bang_diem, key=lambda x: x["diem"], reverse=True)[:5]
                for i, entry in enumerate(top, 1):
                    print(f"  {i}. {entry['nguoi_choi']} — {entry['chu_de']}: {entry['diem']} điểm")
            elif chon_num == len(chu_de_list) + 2:
                print(f"👋 Cảm ơn {ten} đã chơi! Hẹn gặp lại!")
                break

if __name__ == "__main__":
    main_quiz()
```

---

## 🤖 DỰ ÁN LOẠI 2: CHATBOT THÔNG MINH

```python
# ============================================
# CHATBOT TRỢ LÝ HỌC TẬP — Phiên bản hoàn chỉnh
# Kết hợp: Gemini API + lưu JSON + thống kê
# ============================================

import json
import os
from datetime import datetime

# Chạy xem topic-10 để có class StudyBot đầy đủ
# Phiên bản cuối khóa thêm:
# - Nhận diện môn học từ câu hỏi
# - Gợi ý bài tập theo môn
# - Lưu tiến độ học tập
# - Xuất báo cáo tuần

class StudyBotPro:
    def __init__(self, ten):
        self.ten = ten
        self.phien_hoc = []
        self.tien_do = self._tai_tien_do()
        
    def _tai_tien_do(self):
        if os.path.exists("tien_do.json"):
            with open("tien_do.json", "r", encoding="utf-8") as f:
                return json.load(f)
        return {"tong_cau_hoi": 0, "mon_hoc": {}}
    
    def _luu_tien_do(self):
        with open("tien_do.json", "w", encoding="utf-8") as f:
            json.dump(self.tien_do, f, ensure_ascii=False, indent=2)
    
    def nhan_dien_mon(self, cau_hoi):
        """Nhận diện môn học từ từ khóa"""
        tu_khoa = {
            "Toán": ["toán", "số", "tính", "phương trình", "diện tích", "xác suất", "hình học"],
            "Lý": ["vật lý", "lực", "điện", "từ trường", "ánh sáng", "nhiệt", "sóng"],
            "Hóa": ["hóa học", "nguyên tố", "phân tử", "phản ứng", "axit", "bazơ"],
            "Anh": ["english", "grammar", "vocabulary", "tiếng anh", "verb", "noun"],
            "Văn": ["tiếng việt", "văn học", "tác phẩm", "tác giả", "nghĩa của từ"],
            "Python": ["python", "code", "lập trình", "hàm", "vòng lặp", "biến"],
        }
        
        cq = cau_hoi.lower()
        for mon, tu in tu_khoa.items():
            if any(k in cq for k in tu):
                return mon
        return "Tổng hợp"
    
    def xu_ly_cau_hoi(self, cau_hoi):
        mon = self.nhan_dien_mon(cau_hoi)
        
        # Cập nhật tiến độ
        self.tien_do["tong_cau_hoi"] += 1
        self.tien_do["mon_hoc"][mon] = self.tien_do["mon_hoc"].get(mon, 0) + 1
        self._luu_tien_do()
        
        # Lưu phiên học
        self.phien_hoc.append({
            "cau_hoi": cau_hoi,
            "mon": mon,
            "thoi_gian": datetime.now().strftime("%H:%M")
        })
        
        return mon
    
    def bao_cao_tien_do(self):
        print(f"\n📊 TIẾN ĐỘ HỌC TẬP CỦA {self.ten.upper()}")
        print("=" * 45)
        print(f"Tổng câu hỏi đã hỏi: {self.tien_do['tong_cau_hoi']}")
        print(f"\nTheo môn học:")
        for mon, so_cau in sorted(self.tien_do["mon_hoc"].items(),
                                   key=lambda x: x[1], reverse=True):
            thanh = "█" * min(so_cau, 20)
            print(f"  {mon:12} : {thanh} ({so_cau})")
        
        if self.tien_do["mon_hoc"]:
            mon_yeu_thich = max(self.tien_do["mon_hoc"], 
                               key=self.tien_do["mon_hoc"].get)
            print(f"\n⭐ Môn bạn hay hỏi nhất: {mon_yeu_thich}")
```

---

## 🌐 DỰ ÁN LOẠI 3: AI TOOL

```python
# ============================================
# AI TOOL: Máy Dịch Thông Minh + Học Từ Vựng
# Kết hợp Gemini API + từ điển offline + lưu JSON
# ============================================

import json
import os
import random

TU_VUNG_FILE = "tu_vung_da_hoc.json"

def tai_tu_vung():
    if os.path.exists(TU_VUNG_FILE):
        with open(TU_VUNG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def them_tu_vung(tu_vung_data, tu_tieng_anh, nghia, vi_du=""):
    tu_vung_data[tu_tieng_anh.lower()] = {
        "nghia": nghia,
        "vi_du": vi_du,
        "da_hoc": 0,
        "dung": 0
    }
    with open(TU_VUNG_FILE, "w", encoding="utf-8") as f:
        json.dump(tu_vung_data, f, ensure_ascii=False, indent=2)

def quiz_tu_vung(tu_vung_data, so_cau=5):
    """Ôn tập từ vựng theo dạng quiz"""
    if len(tu_vung_data) < 4:
        print("❌ Cần ít nhất 4 từ để quiz!")
        return
    
    tu_list = list(tu_vung_data.keys())
    diem = 0
    
    for i in range(min(so_cau, len(tu_list))):
        tu_dung = random.choice(tu_list)
        nghia_dung = tu_vung_data[tu_dung]["nghia"]
        
        # Tạo 3 đáp án sai
        tu_sai = [t for t in tu_list if t != tu_dung]
        random.shuffle(tu_sai)
        dap_an_sai = [tu_vung_data[t]["nghia"] for t in tu_sai[:3]]
        
        # Trộn đáp án
        dap_an = [nghia_dung] + dap_an_sai
        random.shuffle(dap_an)
        dung_index = dap_an.index(nghia_dung)
        thu_tu = ["A", "B", "C", "D"]
        
        print(f"\n📝 Câu {i+1}: '{tu_dung}' có nghĩa là gì?")
        for j, da in enumerate(dap_an):
            print(f"   {thu_tu[j]}. {da}")
        
        tra_loi = input("   Đáp án: ").upper().strip()
        
        if tra_loi == thu_tu[dung_index]:
            diem += 1
            tu_vung_data[tu_dung]["dung"] += 1
            print("   ✅ Đúng!")
            if tu_vung_data[tu_dung].get("vi_du"):
                print(f"   💡 Ví dụ: {tu_vung_data[tu_dung]['vi_du']}")
        else:
            print(f"   ❌ Sai! Đáp án đúng: {thu_tu[dung_index]}. {nghia_dung}")
        
        tu_vung_data[tu_dung]["da_hoc"] += 1
    
    with open(TU_VUNG_FILE, "w", encoding="utf-8") as f:
        json.dump(tu_vung_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n🏆 Điểm: {diem}/{so_cau}")
    return diem

# Chương trình chính
def main_tu_vung():
    tu_vung = tai_tu_vung()
    
    # Thêm từ mẫu nếu trống
    if not tu_vung:
        mau = [
            ("python", "ngôn ngữ lập trình", "I love Python!"),
            ("algorithm", "thuật toán", "Sorting algorithm sorts data."),
            ("variable", "biến số", "x is a variable."),
            ("function", "hàm số / chức năng", "def my_function():"),
            ("loop", "vòng lặp", "for i in range(10):"),
        ]
        for tu, nghia, vi_du in mau:
            them_tu_vung(tu_vung, tu, nghia, vi_du)
    
    print("📚 MÁY HỌC TỪ VỰNG THÔNG MINH")
    
    while True:
        print("\n1. Thêm từ mới")
        print("2. Quiz từ vựng")
        print("3. Xem danh sách từ đã học")
        print("4. Thoát")
        
        chon = input("Chọn: ")
        
        if chon == "1":
            tu = input("Từ tiếng Anh: ")
            nghia = input("Nghĩa tiếng Việt: ")
            vi_du = input("Câu ví dụ (Enter để bỏ): ")
            them_tu_vung(tu_vung, tu, nghia, vi_du)
            print(f"✅ Đã thêm: {tu}")
        elif chon == "2":
            quiz_tu_vung(tu_vung)
        elif chon == "3":
            print(f"\n📖 Đã học {len(tu_vung)} từ:")
            for tu, info in tu_vung.items():
                print(f"  • {tu}: {info['nghia']} (đúng {info['dung']}/{info['da_hoc']})")
        elif chon == "4":
            print("👋 Chúc học tốt!")
            break

if __name__ == "__main__":
    main_tu_vung()
```

---

## 🎮 Hoạt động lớp (45 phút — Ngày trình bày)

### Warm-up — 5 phút
**"Nhớ lại hành trình"**
- Slideshow ảnh chụp màn hình các bài học 1-11
- Học sinh nêu điều ấn tượng nhất đã học
- Giáo viên tóm tắt: "Hôm nay là ngày đặc biệt — các em là lập trình viên thật sự!"

### Review — 5 phút
Học sinh nhắc nhanh:
- Bài 1: print() — Bài 5: def — Bài 7: random
- Bài 9: JSON — Bài 10: API — Bài 11: PIL

### Trình bày dự án — 25 phút
Mỗi học sinh/nhóm có **3-5 phút**:
1. **Demo sản phẩm** — chạy chương trình thật
2. **Giải thích** — "Dự án của em làm được gì?"
3. **Code highlight** — "Đoạn code em tự hào nhất"
4. **Học được gì** — "Khó khăn và cách giải quyết"

### Trao huy hiệu & Tổng kết — 10 phút
- Trao huy hiệu hoàn thành khóa học
- Hướng dẫn học tiếp: Web với Flask, Data với Pandas, AI với PyTorch
- Chụp ảnh kỷ niệm! 📸

---

## 📋 Hướng Dẫn Làm Dự Án Cuối Khóa

### Bước 1: Chọn ý tưởng (Ngày 1)
- Nghĩ: "Tôi muốn tạo ra gì? Ai sẽ dùng nó?"
- Viết ra mô tả 3 câu:
  - Dự án là gì?
  - Dùng kiến thức nào đã học?
  - Người dùng làm gì với nó?

### Bước 2: Thiết kế (Ngày 1-2)
- Vẽ flowchart đơn giản (có thể dùng giấy bút)
- Liệt kê các tính năng (Feature list)
- Bắt đầu từ tính năng đơn giản nhất

### Bước 3: Code (Ngày 2-4)
- Viết từng chức năng một
- Test thường xuyên
- Ghi chú code bằng comment
- Lưu thường xuyên!

### Bước 4: Hoàn thiện (Ngày 4-5)
- Thêm màu sắc, emoji, giao diện đẹp hơn
- Xử lý lỗi (try/except)
- Test với người khác dùng thử
- Viết README.txt giải thích cách dùng

### Bước 5: Trình bày (Ngày cuối)
- Chuẩn bị demo chạy được
- Chuẩn bị 3 điểm nói trong 5 phút

---

## 📝 Yêu Cầu Dự Án Tối Thiểu

**Mức cơ bản (hoàn thành):**
- [ ] Chạy không lỗi
- [ ] Dùng ít nhất 3 khái niệm đã học (biến, vòng lặp, hàm...)
- [ ] Có nhận input từ người dùng
- [ ] In ra kết quả có ý nghĩa

**Mức khá:**
- [ ] Thêm lưu dữ liệu (file/JSON)
- [ ] Xử lý lỗi người dùng nhập sai
- [ ] Code có comment giải thích
- [ ] Menu và giao diện rõ ràng

**Mức giỏi:**
- [ ] Kết hợp 5+ khái niệm
- [ ] Dùng API hoặc thư viện ngoài
- [ ] Code có cấu trúc hàm tốt
- [ ] Có tính năng bất ngờ/sáng tạo

**Mức xuất sắc:**
- [ ] Tính năng AI hoặc xử lý ảnh
- [ ] Giao diện đẹp (turtle hoặc tkinter)
- [ ] Dữ liệu được lưu và tải lại
- [ ] Trình bày tự tin và ấn tượng

---

## 🤖 AI Coach gợi ý

Khi làm dự án:
- *"Giúp tôi lên kế hoạch cho game quiz Python cho học sinh lớp 6. Cần những tính năng gì?"*
- *"Code này có lỗi gì? [dán code vào]. Tôi đang làm chatbot học tập."*
- *"Làm thế nào để thêm màu sắc vào output terminal Python?"*
- *"Tôi muốn thêm tính năng lưu điểm cao. Dùng JSON như thế nào?"*

**Cách dùng AI để học, không phải để chép:**
1. ✅ Hỏi AI giải thích khái niệm
2. ✅ Nhờ AI gợi ý hướng giải quyết
3. ✅ Nhờ AI giải thích lỗi
4. ❌ Đừng copy toàn bộ code rồi nộp — bạn sẽ không học được gì!

---

## ❌ Lỗi thường gặp trong dự án

```python
# ❌ SAI: Code quá dài, một hàm làm tất cả
def main():
    # 200 dòng code trong một hàm!
    pass

# ✅ ĐÚNG: Tách thành nhiều hàm nhỏ
def lay_input_nguoi_dung():
    pass

def xu_ly_du_lieu(data):
    pass

def hien_thi_ket_qua(ket_qua):
    pass

def main():
    data = lay_input_nguoi_dung()
    ket_qua = xu_ly_du_lieu(data)
    hien_thi_ket_qua(ket_qua)

# ❌ SAI: Không xử lý lỗi → crash khi người dùng nhập sai
tuoi = int(input("Tuổi: "))  # Nhập "hai mươi" → crash!

# ✅ ĐÚNG
while True:
    try:
        tuoi = int(input("Tuổi: "))
        break
    except ValueError:
        print("❌ Hãy nhập số nguyên!")

# ❌ SAI: Không có menu → người dùng không biết làm gì
print("Nhập gì đó:")
nhap = input()

# ✅ ĐÚNG: Luôn có hướng dẫn rõ ràng
print("=" * 40)
print("CHÀO MỪNG! Chọn tính năng:")
print("1. Thêm dữ liệu")
print("2. Xem kết quả")  
print("3. Thoát")
print("=" * 40)
```

---

## 🏅 Huy Hiệu Cuối Khóa

**🥉 Lập Trình Viên Nhí:** Hoàn thành dự án chạy được + trình bày cơ bản

**🥈 Kỹ Sư Python:** Dự án dùng 5+ khái niệm + có lưu dữ liệu + code sạch

**🥇 Python Developer:** Dự án có AI hoặc CV + giao diện đẹp + trình bày tự tin

**💎 Siêu Sao Công Nghệ:** Dự án hoàn chỉnh xuất sắc + trình bày ấn tượng + truyền cảm hứng cho bạn bè

---

## 🚀 Con Đường Tiếp Theo

Sau khóa học này, bạn có thể học:

| Hướng | Học gì | Làm được gì |
|-------|--------|-------------|
| 🌐 Web | Flask, Django, HTML/CSS | Website thật sự |
| 📊 Data | Pandas, Matplotlib, Numpy | Phân tích dữ liệu |
| 🤖 AI/ML | TensorFlow, PyTorch, scikit-learn | Train model AI |
| 🎮 Game | Pygame | Game 2D đẹp |
| 📱 App | Kivy, Flutter | App điện thoại |
| 🔧 DevOps | Linux, Docker, Git | Server và cloud |

**Tài nguyên học thêm (miễn phí):**
- 🌐 python.org/doc — Tài liệu chính thức
- 🎓 cs50.harvard.edu — Khóa học CS Harvard (miễn phí!)
- 📺 YouTube: "Python Tutorial for Beginners"
- 🎯 codewars.com / leetcode.com — Bài tập thực hành
- 🤖 ChatGPT / Gemini — Hỏi bất cứ điều gì!

---

## 💌 Lời Kết

> **"Mọi chuyên gia từng là người mới bắt đầu."**
>
> Bạn đã học được rất nhiều trong 12 buổi. Bạn biết cách làm máy tính làm theo ý mình. Đó là một siêu năng lực thật sự! 🦸
>
> Đừng dừng lại ở đây. Viết code mỗi ngày, dù chỉ 10 phút. Thử những điều mới. Đặt câu hỏi. Và quan trọng nhất — **vui vẻ với nó!**
>
> Chúc mừng bạn đã hoàn thành khóa học Python! 🐍🎉

---

*Được tạo bởi AVAB Python Lab — Khóa học Lập Trình cho Học Sinh Việt Nam*
