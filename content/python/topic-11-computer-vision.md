# Chuyên đề 11: Computer Vision — Thị Giác Máy Tính 👁️

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Hiểu Computer Vision là gì và ứng dụng thực tế
- Tạo và đọc QR code bằng Python
- Xử lý ảnh cơ bản với thư viện PIL/Pillow
- Nhận diện màu sắc và tìm vật thể trong ảnh
- Tạo project thú vị kết hợp camera và AI

---

## 🐍 Python Syntax chính

```python
# ============================================
# CÀI ĐẶT THƯ VIỆN
# ============================================
# pip install pillow          — Xử lý ảnh
# pip install qrcode          — Tạo QR code
# pip install pyzbar          — Đọc QR code
# pip install opencv-python   — Computer Vision (OpenCV)

# ============================================
# PIL/PILLOW — Xử lý ảnh cơ bản
# ============================================

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def tao_anh_co_ban():
    """Tạo ảnh mới và vẽ hình"""
    # Tạo ảnh RGB 400x300, nền trắng
    anh = Image.new("RGB", (400, 300), color="white")
    draw = ImageDraw.Draw(anh)
    
    # Vẽ hình chữ nhật
    draw.rectangle([10, 10, 150, 100], fill="lightblue", outline="navy", width=3)
    
    # Vẽ hình tròn (ellipse)
    draw.ellipse([160, 10, 310, 110], fill="salmon", outline="red", width=2)
    
    # Vẽ tam giác (polygon)
    draw.polygon([(200, 150), (100, 250), (300, 250)], fill="lightgreen", outline="darkgreen")
    
    # Viết chữ
    draw.text((20, 200), "Python Image!", fill="black")
    draw.text((20, 220), "🐍 Computer Vision", fill="purple")
    
    # Vẽ đường thẳng
    draw.line([(0, 300), (400, 0)], fill="orange", width=5)
    
    # Lưu ảnh
    anh.save("anh_tu_python.png")
    print("✅ Đã tạo anh_tu_python.png!")
    return anh

def xu_ly_anh(duong_dan_anh):
    """Xử lý và biến đổi ảnh"""
    anh = Image.open(duong_dan_anh)
    
    print(f"Kích thước: {anh.size}")      # (width, height)
    print(f"Chế độ màu: {anh.mode}")      # RGB, RGBA, L...
    print(f"Định dạng: {anh.format}")     # JPEG, PNG...
    
    # Thay đổi kích thước
    anh_nho = anh.resize((200, 150))
    
    # Xoay ảnh
    anh_xoay = anh.rotate(45)               # Xoay 45 độ
    
    # Lật ảnh
    anh_lat = anh.transpose(Image.FLIP_LEFT_RIGHT)  # Lật ngang
    
    # Chuyển sang đen trắng
    anh_xam = anh.convert("L")             # "L" = Grayscale
    
    # Áp dụng filter
    anh_mo = anh.filter(ImageFilter.BLUR)
    anh_sac = anh.filter(ImageFilter.SHARPEN)
    anh_vien = anh.filter(ImageFilter.FIND_EDGES)
    
    # Crop (cắt) ảnh
    anh_cat = anh.crop((50, 50, 250, 200)) # (left, top, right, bottom)
    
    # Lưu kết quả
    anh_xam.save("anh_xam.jpg")
    anh_vien.save("anh_vien.jpg")
    print("✅ Đã xử lý và lưu ảnh!")
    
    return anh_xam

def thao_tac_pixel(duong_dan_anh):
    """Đọc và thay đổi từng pixel"""
    anh = Image.open(duong_dan_anh).convert("RGB")
    
    # Đọc màu pixel tại (x=100, y=50)
    r, g, b = anh.getpixel((100, 50))
    print(f"Pixel (100, 50): R={r}, G={g}, B={b}")
    
    # Thay đổi pixel
    width, height = anh.size
    
    for x in range(width):
        for y in range(height):
            r, g, b = anh.getpixel((x, y))
            # Đảo màu (negative)
            anh.putpixel((x, y), (255 - r, 255 - g, 255 - b))
    
    anh.save("anh_negative.jpg")
    print("✅ Ảnh negative đã lưu!")

# ============================================
# TẠO QR CODE
# ============================================

import qrcode

def tao_qr_code(noi_dung, ten_file="qrcode.png"):
    """Tạo QR code từ nội dung bất kỳ"""
    # Cài đặt QR code
    qr = qrcode.QRCode(
        version=1,           # Kích thước (1-40)
        error_correction=qrcode.constants.ERROR_CORRECT_L,  # Độ sửa lỗi
        box_size=10,         # Kích thước mỗi ô
        border=4,            # Đường viền
    )
    
    qr.add_data(noi_dung)
    qr.make(fit=True)
    
    # Tạo ảnh QR với màu tùy chỉnh
    anh_qr = qr.make_image(fill_color="darkblue", back_color="white")
    anh_qr.save(ten_file)
    print(f"✅ QR code đã tạo: {ten_file}")
    print(f"   Nội dung: {noi_dung}")

def tao_qr_dep(noi_dung, logo_path=None):
    """Tạo QR code đẹp có logo ở giữa (nếu có)"""
    from PIL import Image
    
    qr = qrcode.QRCode(
        version=5,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Cao nhất
        box_size=10,
        border=4,
    )
    
    qr.add_data(noi_dung)
    qr.make(fit=True)
    
    anh_qr = qr.make_image(fill_color="navy", back_color="lightyellow").convert("RGB")
    
    # Thêm logo vào giữa (nếu có)
    if logo_path and os.path.exists(logo_path):
        logo = Image.open(logo_path)
        qr_w, qr_h = anh_qr.size
        logo_size = qr_w // 4  # Logo chiếm 1/4 QR
        logo = logo.resize((logo_size, logo_size))
        
        vi_tri = ((qr_w - logo_size) // 2, (qr_h - logo_size) // 2)
        anh_qr.paste(logo, vi_tri)
    
    anh_qr.save("qr_dep.png")
    print("✅ QR code đẹp đã tạo!")

# Ví dụ sử dụng
tao_qr_code("https://python.org", "python_qr.png")
tao_qr_code("Xin chào! Tôi là học sinh Python!", "chao_qr.png")
tao_qr_code("Liên hệ: an@school.edu.vn | 0901234567", "lien_he_qr.png")

# ============================================
# ĐỌC QR CODE
# ============================================

def doc_qr_code(duong_dan_anh):
    """Đọc nội dung QR code từ ảnh"""
    try:
        from pyzbar.pyzbar import decode
        
        anh = Image.open(duong_dan_anh)
        ket_qua = decode(anh)
        
        if ket_qua:
            for qr in ket_qua:
                noi_dung = qr.data.decode("utf-8")
                loai = qr.type
                print(f"✅ Đọc thành công!")
                print(f"   Loại: {loai}")
                print(f"   Nội dung: {noi_dung}")
            return noi_dung
        else:
            print("❌ Không tìm thấy QR code trong ảnh!")
            return None
    except ImportError:
        print("❌ Cần cài: pip install pyzbar")
        return None

# ============================================
# XỬ LÝ MÀU SẮC — Phân tích ảnh
# ============================================

from PIL import Image
from collections import Counter

def phan_tich_mau(duong_dan_anh, so_mau_top=5):
    """Tìm các màu phổ biến nhất trong ảnh"""
    anh = Image.open(duong_dan_anh).convert("RGB")
    anh_nho = anh.resize((100, 100))   # Thu nhỏ để xử lý nhanh
    
    pixels = list(anh_nho.getdata())   # List các tuple (R, G, B)
    
    # Đếm màu
    bo_dem = Counter(pixels)
    mau_pho_bien = bo_dem.most_common(so_mau_top)
    
    print(f"🎨 {so_mau_top} màu phổ biến nhất:")
    for i, ((r, g, b), so_luong) in enumerate(mau_pho_bien, 1):
        # Đoán tên màu đơn giản
        if r > 200 and g < 50 and b < 50:
            ten_mau = "Đỏ 🔴"
        elif r < 50 and g > 150 and b < 50:
            ten_mau = "Xanh lá 🟢"
        elif r < 50 and g < 50 and b > 200:
            ten_mau = "Xanh dương 🔵"
        elif r > 200 and g > 200 and b < 50:
            ten_mau = "Vàng 🟡"
        elif r > 200 and g > 200 and b > 200:
            ten_mau = "Trắng ⬜"
        elif r < 50 and g < 50 and b < 50:
            ten_mau = "Đen ⬛"
        else:
            ten_mau = "Hỗn hợp"
        
        print(f"  {i}. RGB({r:3d},{g:3d},{b:3d}) — {ten_mau} ({so_luong} pixels)")
```

---

## 💡 Từ khóa & Khái niệm

| Khái niệm | Ý nghĩa |
|-----------|---------|
| Computer Vision | Máy tính "nhìn" và hiểu ảnh |
| Pixel | Điểm ảnh nhỏ nhất (chứa màu RGB) |
| RGB | Red, Green, Blue — 3 màu cơ bản tạo nên màu sắc |
| Resolution | Độ phân giải = số pixel (VD: 1920×1080) |
| QR Code | Mã vạch 2D lưu được nhiều thông tin |
| PIL/Pillow | Thư viện xử lý ảnh Python phổ biến |
| OpenCV | Thư viện computer vision mạnh nhất |
| Filter | Bộ lọc áp dụng lên ảnh (blur, sharpen...) |
| Grayscale | Ảnh đen trắng (chỉ có độ sáng) |

**Computer Vision được dùng ở đâu?**
- 📸 Face ID trên iPhone/Android
- 🚗 Xe tự lái nhận diện đường, người
- 🏥 Chẩn đoán bệnh từ X-quang, MRI
- 🛒 Amazon Go — siêu thị không cần thu ngân
- 🎮 Game AR (Pokemon GO, Snapchat filters)
- 📦 Scan QR code trong Zalo, Momo, VietQR

---

## 🔨 Project thực hành: Tạo Thẻ Học Sinh Có QR Code

```python
# ============================================
# Project: Tạo Thẻ Học Sinh Số Có QR Code
# ============================================

from PIL import Image, ImageDraw, ImageFont
import qrcode
import json
import os

def tao_the_hoc_sinh(thong_tin):
    """
    Tạo thẻ học sinh đẹp với QR code
    thong_tin: dict chứa ten, lop, truong, ma_hs, email
    """
    # ---- Tạo QR code ----
    qr_noi_dung = json.dumps(thong_tin, ensure_ascii=False)
    qr = qrcode.QRCode(version=3, box_size=5, border=2,
                       error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(qr_noi_dung)
    qr.make(fit=True)
    anh_qr = qr.make_image(fill_color="darkblue", back_color="white").convert("RGBA")
    anh_qr = anh_qr.resize((130, 130))
    
    # ---- Tạo canvas thẻ ----
    THE_W, THE_H = 400, 220
    the = Image.new("RGB", (THE_W, THE_H), color=(25, 55, 120))   # Nền xanh đậm
    draw = ImageDraw.Draw(the)
    
    # Gradient effect (giả) — dải màu nhạt ở trên
    for y in range(60):
        alpha = int(100 * (1 - y/60))
        draw.line([(0, y), (THE_W, y)], fill=(50, 80, 150))
    
    # ----- Header -----
    draw.rectangle([0, 0, THE_W, 50], fill=(10, 40, 100))
    draw.text((15, 8), "🏫 TRƯỜNG THCS", fill=(255, 215, 0))
    draw.text((15, 28), thong_tin.get("truong", "Trường THCS ABC").upper(),
              fill="white")
    
    # Badge "HỌC SINH"
    draw.rounded_rectangle([270, 8, 390, 42], radius=5, fill=(255, 215, 0))
    draw.text((290, 16), "HỌC SINH", fill=(10, 40, 100))
    
    # ----- Avatar placeholder -----
    draw.ellipse([15, 60, 85, 130], fill=(100, 130, 180), outline="white", width=2)
    draw.text((35, 85), "👤", fill="white")
    
    # ----- Thông tin -----
    y_start = 60
    draw.text((100, y_start), thong_tin["ten"].upper(),
              fill="white")
    draw.text((100, y_start + 22), f"Mã HS: {thong_tin['ma_hs']}",
              fill=(200, 220, 255))
    draw.text((100, y_start + 40), f"Lớp: {thong_tin['lop']}",
              fill=(200, 220, 255))
    if thong_tin.get("email"):
        draw.text((100, y_start + 58), f"📧 {thong_tin['email']}",
                  fill=(180, 200, 240))
    
    # ----- QR Code -----
    the.paste(anh_qr, (260, 60), anh_qr)
    draw.text((270, 195), "Quét để xem thông tin",
              fill=(180, 200, 240))
    
    # ----- Footer -----
    draw.rectangle([0, 195, THE_W, THE_H], fill=(10, 30, 80))
    draw.text((15, 200), "Năm học 2025-2026", fill=(150, 170, 210))
    draw.text((200, 200), "python.avab.edu.vn", fill=(150, 170, 210))
    
    # ----- Viền -----
    draw.rectangle([0, 0, THE_W-1, THE_H-1], outline=(255, 215, 0), width=2)
    
    # Lưu thẻ
    ten_file = f"the_hs_{thong_tin['ma_hs']}.png"
    the.save(ten_file, quality=95)
    print(f"✅ Đã tạo thẻ học sinh: {ten_file}")
    return ten_file

def tao_hang_loat(danh_sach_hoc_sinh):
    """Tạo thẻ cho nhiều học sinh"""
    print(f"🖨️ Đang tạo {len(danh_sach_hoc_sinh)} thẻ học sinh...")
    for hs in danh_sach_hoc_sinh:
        tao_the_hoc_sinh(hs)
    print("✅ Hoàn thành!")

# ---- Dữ liệu mẫu ----
hoc_sinh_list = [
    {
        "ten": "Nguyễn Văn An",
        "ma_hs": "HS2025001",
        "lop": "6A1",
        "truong": "THCS Lê Lợi",
        "email": "an.nv@school.edu.vn"
    },
    {
        "ten": "Trần Thị Bình",
        "ma_hs": "HS2025002",
        "lop": "6A1",
        "truong": "THCS Lê Lợi",
        "email": "binh.tt@school.edu.vn"
    },
]

# Tạo thẻ
for hs in hoc_sinh_list:
    tao_the_hoc_sinh(hs)

print("\n🎉 Tất cả thẻ học sinh đã được tạo!")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Mắt máy tính"**
- Cho học sinh xem ảnh → hỏi: "Đây là gì?"
- Cho AI (Google Lens / ChatGPT) nhận diện ảnh tương tự
- Thảo luận: máy tính biết cái này từ đâu? (học từ hàng triệu ảnh)

### Review — 5 phút
- Chatbot AI và chatbot if/else khác nhau thế nào?
- Ai đã tạo chatbot bài tập về nhà?

### Learn & Demo — 10 phút
1. Mở ảnh bằng PIL → xem thông tin kích thước
2. Áp dụng filter blur/sharpen → so sánh
3. Tạo QR code chứa tên bạn → quét bằng điện thoại!
4. Đọc QR code → in nội dung

### Code Along — 15 phút
```python
from PIL import Image, ImageDraw
import qrcode

# Tạo QR code cá nhân
ten = input("Nhập tên bạn: ")
noi_dung = f"Xin chào! Tôi là {ten}, học Python!"

qr = qrcode.make(noi_dung)
qr.save(f"{ten}_qr.png")
print(f"✅ Đã tạo QR code: {ten}_qr.png")
print("Mở file và quét bằng điện thoại!")
```

### Challenge — 10 phút
Thêm thông tin vào QR (trường, lớp, email) và tạo thẻ nhỏ xung quanh QR.

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Tạo QR code cho website yêu thích của bạn. Quét thử và chụp màn hình.

**Bài 2 — Dễ:** Mở ảnh bất kỳ, chuyển sang đen trắng, lưu file mới.

**Bài 3 — Trung bình:** Tạo ảnh nghệ thuật: vẽ 10 hình tròn ngẫu nhiên (vị trí, kích thước, màu random).

**Bài 4 — Trung bình:** Tạo bưu thiếp điện tử: nền màu đẹp, viết tên người tặng và người nhận, thêm icon.

**Bài 5 — Khó:** Tạo thẻ học sinh của chính bạn với đầy đủ thông tin và QR code chứa dữ liệu JSON.

---

## 🤖 AI Coach gợi ý

- *"PIL và OpenCV khác nhau thế nào? Khi nào dùng cái nào?"*
- *"Face detection bằng OpenCV Python làm thế nào?"*
- *"Làm thế nào để nhận diện chữ viết trong ảnh bằng Python (OCR)?"*
- *"Tôi muốn tạo Snapchat filter đơn giản bằng Python — hướng dẫn bước đầu"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Mở ảnh không tồn tại
anh = Image.open("khong_ton_tai.jpg")  # FileNotFoundError!

# ✅ ĐÚNG: Kiểm tra trước
import os
if os.path.exists("anh.jpg"):
    anh = Image.open("anh.jpg")

# ❌ SAI: Paste ảnh RGBA lên ảnh RGB không có mask
anh_nen = Image.new("RGB", (300, 300), "white")
anh_trong_suot = Image.open("logo.png").convert("RGBA")
anh_nen.paste(anh_trong_suot, (50, 50))  # Mất transparency!

# ✅ ĐÚNG: Dùng mask
anh_nen.paste(anh_trong_suot, (50, 50), anh_trong_suot)  # Tham số thứ 3 = mask

# ❌ SAI: Quên save ảnh sau khi xử lý
anh = Image.open("anh.jpg")
anh = anh.rotate(90)
# Quên anh.save()! Mất hết!

# ✅ ĐÚNG
anh.save("anh_xoay.jpg")  # Luôn save sau khi xử lý

# ❌ SAI: Loop qua mọi pixel → rất chậm với ảnh lớn
for x in range(1920):
    for y in range(1080):
        r, g, b = anh.getpixel((x, y))  # 2 triệu lần gọi → chậm!

# ✅ TỐT HƠN: Thu nhỏ ảnh trước hoặc dùng numpy
anh_nho = anh.resize((192, 108))  # Xử lý ảnh nhỏ rồi scale up
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người quét mã:** Tạo và quét QR code thành công

**🥈 Nghệ sĩ số:** Xử lý ảnh: crop, rotate, filter, đen trắng

**🥇 CV Developer:** Tạo thẻ học sinh đẹp với QR code và thông tin đầy đủ

**💎 Siêu sao:** Tạo ảnh nghệ thuật random + bưu thiếp điện tử có tên người nhận
