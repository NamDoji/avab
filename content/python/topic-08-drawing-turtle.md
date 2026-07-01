# Chuyên đề 8: Drawing & Turtle — Vẽ Hình 🐢🎨

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Dùng thư viện `turtle` để vẽ hình học
- Điều khiển con rùa: tiến, lùi, xoay, nhấc bút
- Vẽ các hình cơ bản: vuông, tam giác, ngôi sao, đa giác
- Kết hợp vòng lặp và hàm để vẽ hình phức tạp
- Tạo nghệ thuật fractal đơn giản

---

## 🐍 Python Syntax chính

```python
# ============================================
# TURTLE CƠ BẢN — làm quen với con rùa
# ============================================

import turtle

# Cài đặt cửa sổ
turtle.title("Học Vẽ với Python 🐢")
turtle.bgcolor("black")      # Nền đen
turtle.speed(5)              # Tốc độ: 1 (chậm) - 10 (nhanh) - 0 (nhanh nhất)

# Tạo con rùa
t = turtle.Turtle()
t.color("white")             # Màu bút
t.width(2)                   # Độ dày nét

# Di chuyển cơ bản
t.forward(100)               # Tiến 100 px
t.right(90)                  # Xoay phải 90 độ
t.forward(100)
t.left(90)                   # Xoay trái 90 độ
t.backward(50)               # Lùi 50 px

# Nhấc bút / đặt bút
t.penup()                    # Nhấc bút — di chuyển không vẽ
t.goto(0, 0)                 # Đến tọa độ (0, 0)
t.pendown()                  # Đặt bút — di chuyển sẽ vẽ

# Vị trí và hướng
t.home()                     # Về điểm gốc (0,0), hướng phải
t.setpos(100, 50)            # Đến tọa độ (100, 50)
t.setheading(0)              # Hướng mặt: 0=phải, 90=lên, 180=trái, 270=xuống
print(t.pos())               # In tọa độ hiện tại
print(t.heading())           # In hướng hiện tại

# Vẽ hình tròn
t.circle(80)                 # Vẽ hình tròn bán kính 80
t.circle(50, 180)            # Vẽ nửa hình tròn

# Điền màu
t.fillcolor("yellow")
t.begin_fill()
for _ in range(4):
    t.forward(100)
    t.right(90)
t.end_fill()                 # Tô màu hình vừa vẽ

turtle.done()                # Giữ cửa sổ mở

# ============================================
# VẼ HÌNH HỌC CƠ BẢN
# ============================================

import turtle

def ve_hinh_vuong(t, chieu_dai, mau="white"):
    t.color(mau)
    t.begin_fill()
    for _ in range(4):
        t.forward(chieu_dai)
        t.right(90)
    t.end_fill()

def ve_tam_giac(t, canh, mau="red"):
    t.color(mau)
    t.begin_fill()
    for _ in range(3):
        t.forward(canh)
        t.left(120)
    t.end_fill()

def ve_da_giac(t, n_canh, chieu_dai, mau="blue"):
    """Vẽ đa giác n cạnh"""
    goc = 360 / n_canh
    t.color(mau)
    t.begin_fill()
    for _ in range(n_canh):
        t.forward(chieu_dai)
        t.right(goc)
    t.end_fill()

def ve_ngoi_sao(t, chieu_dai, mau="gold"):
    """Vẽ ngôi sao 5 cánh"""
    t.color(mau)
    t.begin_fill()
    for _ in range(5):
        t.forward(chieu_dai)
        t.right(144)    # Góc bên ngoài của ngôi sao 5 cánh
    t.end_fill()
```

---

## 💡 Từ khóa & Khái niệm

| Lệnh | Ý nghĩa |
|------|---------|
| `t.forward(n)` | Tiến n bước |
| `t.backward(n)` | Lùi n bước |
| `t.right(d)` | Xoay phải d độ |
| `t.left(d)` | Xoay trái d độ |
| `t.penup()` | Nhấc bút (không vẽ) |
| `t.pendown()` | Đặt bút (vẽ) |
| `t.goto(x, y)` | Đi đến tọa độ x, y |
| `t.color("red")` | Đặt màu bút |
| `t.fillcolor("blue")` | Màu tô |
| `t.begin_fill()` | Bắt đầu tô màu |
| `t.end_fill()` | Kết thúc tô màu |
| `t.circle(r)` | Vẽ hình tròn bán kính r |
| `t.width(n)` | Độ dày nét vẽ |
| `t.speed(n)` | Tốc độ vẽ 0-10 |
| `turtle.done()` | Giữ cửa sổ |

**Hệ tọa độ Turtle:**
- Điểm giữa màn hình là (0, 0)
- Phải → x tăng; Trên → y tăng
- Hướng mặc định: 0° = phải

---

## 🔨 Project thực hành: Vẽ Tranh Nghệ Thuật

```python
# ============================================
# Project 1: Vẽ Mặt Trời Và Ngôi Nhà
# ============================================

import turtle
import random

# Cài đặt
screen = turtle.Screen()
screen.title("🏠 Ngôi Nhà Của Tôi")
screen.bgcolor("lightblue")
screen.setup(800, 600)

t = turtle.Turtle()
t.speed(0)  # Nhanh nhất

def ve_mat_troi(t, x, y, ban_kinh=50):
    """Vẽ mặt trời vàng"""
    t.penup()
    t.goto(x, y)
    t.pendown()
    t.color("yellow", "yellow")
    t.begin_fill()
    t.circle(ban_kinh)
    t.end_fill()
    
    # Tia sáng
    t.color("orange")
    t.width(2)
    for goc in range(0, 360, 45):
        t.penup()
        t.goto(x, y + ban_kinh)
        t.setheading(goc)
        t.pendown()
        t.forward(30)
    
    t.width(1)

def ve_co_cay(t, x, y):
    """Vẽ cây xanh"""
    t.penup()
    t.goto(x, y)
    t.pendown()
    
    # Thân cây
    t.color("saddlebrown", "saddlebrown")
    t.begin_fill()
    t.forward(15)
    t.left(90)
    t.forward(60)
    t.left(90)
    t.forward(15)
    t.left(90)
    t.forward(60)
    t.end_fill()
    
    # Tán lá — 3 tam giác
    for tang in range(3):
        t.penup()
        t.goto(x - 30 + tang*5, y + 50 + tang * 25)
        t.pendown()
        t.color("green", "darkgreen")
        t.begin_fill()
        t.setheading(0)
        for _ in range(3):
            t.forward(60 - tang*10)
            t.left(120)
        t.end_fill()

def ve_ngoi_nha(t, x, y):
    """Vẽ ngôi nhà"""
    # Tường nhà
    t.penup()
    t.goto(x, y)
    t.pendown()
    t.color("peru", "wheat")
    t.begin_fill()
    for canh, goc in [(150, 90), (100, 90), (150, 90), (100, 90)]:
        t.forward(canh)
        t.left(goc)
    t.end_fill()
    
    # Mái nhà (tam giác)
    t.penup()
    t.goto(x - 20, y + 100)
    t.pendown()
    t.color("firebrick", "red")
    t.begin_fill()
    t.setheading(0)
    t.forward(190)
    t.left(120)
    t.forward(190)
    t.left(120)
    t.forward(190)
    t.end_fill()
    
    # Cửa
    t.penup()
    t.goto(x + 55, y)
    t.pendown()
    t.color("saddlebrown", "sienna")
    t.begin_fill()
    for canh, goc in [(40, 90), (60, 90), (40, 90), (60, 90)]:
        t.forward(canh)
        t.left(goc)
    t.end_fill()
    
    # Cửa sổ
    for wx in [x + 15, x + 95]:
        t.penup()
        t.goto(wx, y + 35)
        t.pendown()
        t.color("lightblue", "skyblue")
        t.begin_fill()
        for _ in range(4):
            t.forward(30)
            t.left(90)
        t.end_fill()

def ve_dat(t):
    """Vẽ mảnh đất xanh"""
    t.penup()
    t.goto(-400, -150)
    t.pendown()
    t.color("green", "lawngreen")
    t.begin_fill()
    t.forward(800)
    t.left(90)
    t.forward(200)
    t.left(90)
    t.forward(800)
    t.left(90)
    t.forward(200)
    t.end_fill()

def ve_may(t, x, y):
    """Vẽ đám mây"""
    t.penup()
    t.goto(x, y)
    t.pendown()
    t.color("white", "white")
    for r in [30, 40, 35, 25]:
        t.begin_fill()
        t.circle(r)
        t.end_fill()
        t.penup()
        t.forward(r + 15)
        t.pendown()

# Vẽ toàn cảnh
ve_dat(t)
ve_mat_troi(t, 250, 200)
ve_may(t, -300, 150)
ve_may(t, -100, 200)
ve_ngoi_nha(t, -100, -145)
ve_co_cay(t, 180, -145)
ve_co_cay(t, -200, -145)

# Viết tên
t.penup()
t.goto(-60, -200)
t.color("darkgreen")
t.write("Ngôi Nhà Của Tôi 🏠", font=("Arial", 14, "bold"))

t.hideturtle()
turtle.done()

# ============================================
# Project 2: Hoa Xoắn Ốc Nghệ Thuật
# ============================================

import turtle
import random

screen = turtle.Screen()
screen.bgcolor("black")
screen.title("🌸 Hoa Nghệ Thuật")

t = turtle.Turtle()
t.speed(0)
t.width(2)

mau_sac = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "white", "cyan", "magenta"]

# Vẽ hoa xoắn ốc
for i in range(200):
    t.color(mau_sac[i % len(mau_sac)])
    t.forward(i * 0.5)
    t.right(91)   # Thay 91 bằng các số khác để có hình khác nhau!

t.hideturtle()
turtle.done()
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"Robot Vẽ"**
- Chọn một học sinh làm "robot"
- Giáo viên ra lệnh: "Tiến 3 bước, xoay phải 90 độ, tiến 3 bước..."
- Robot đi theo → Giải thích: đó chính xác là cách turtle hoạt động!

### Review — 5 phút
- Hỏi: `random.choice()` khác `random.randint()` thế nào?
- Xem qua game đoán số của học sinh

### Learn & Demo — 10 phút
1. Mở IDLE/thematic editor → import turtle, t.forward(100), t.right(90)
2. Vẽ hình vuông từng lệnh → rút gọn bằng for loop
3. Đổi màu → `t.color("red")`
4. Demo tốc độ: speed(1) vs speed(0)

### Code Along — 15 phút
```python
import turtle

t = turtle.Turtle()
t.speed(3)

# Vẽ hình vuông màu sắc
mau = ["red", "blue", "green", "yellow"]
for i in range(4):
    t.color(mau[i])
    t.forward(100)
    t.right(90)

# Thêm: vẽ ngôi sao
t.penup()
t.goto(0, -50)
t.pendown()
t.color("gold")
for _ in range(5):
    t.forward(80)
    t.right(144)

turtle.done()
```

### Challenge — 10 phút
Vẽ 5 hình tròn lồng nhau với 5 màu khác nhau (hình bia bắn).

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Vẽ đủ 5 hình: vuông, tam giác, ngôi sao, hình tròn, lục giác — mỗi hình một màu.

**Bài 2 — Dễ:** Vẽ tên mình bằng các hình đơn giản (mỗi chữ cái = vài đường thẳng).

**Bài 3 — Trung bình:** Vẽ đồng hồ analog (mặt tròn + 12 vạch giờ, không cần kim).

**Bài 4 — Trung bình:** Tạo vòng quay màu sắc: 36 đoạn thẳng, mỗi đoạn một màu khác nhau.

**Bài 5 — Khó:** Vẽ hình fractal cây (tree fractal): thân cây → 2 nhánh → mỗi nhánh lại có 2 nhánh nhỏ hơn (4 cấp).

---

## 🤖 AI Coach gợi ý

- *"Làm thế nào để vẽ chữ bằng turtle trong Python?"*
- *"Fractal Sierpinski triangle bằng turtle, hướng dẫn từng bước"*
- *"Tôi muốn vẽ cờ Việt Nam bằng turtle Python, hướng dẫn tôi"*
- *"Cách tạo animation (chuyển động) bằng turtle"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Quên turtle.done() — cửa sổ đóng ngay
import turtle
t = turtle.Turtle()
t.forward(100)
# Cửa sổ biến mất!

# ✅ ĐÚNG
import turtle
t = turtle.Turtle()
t.forward(100)
turtle.done()   # Giữ cửa sổ

# ❌ SAI: Vẽ chậm — không set speed
t = turtle.Turtle()
# Mặc định speed = 3, chậm với hình phức tạp

# ✅ ĐÚNG: Set speed sớm
t = turtle.Turtle()
t.speed(0)  # Nhanh nhất

# ❌ SAI: Quên penup khi di chuyển không vẽ
t.goto(200, 100)  # Vẽ đường thẳng đến (200, 100)!

# ✅ ĐÚNG
t.penup()
t.goto(200, 100)
t.pendown()

# ❌ SAI: Góc xoay sai → hình không đóng
for _ in range(4):
    t.forward(100)
    t.right(91)  # Nên là 90 độ → hình vuông không đóng!

# ✅ ĐÚNG: Tổng góc = 360
for _ in range(4):
    t.forward(100)
    t.right(90)  # 4 × 90 = 360 ✅
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người cầm bút:** Vẽ được hình vuông và hình tròn màu sắc

**🥈 Nghệ sĩ số:** Vẽ đủ 5 hình học với màu tô

**🥇 Kiến trúc sư số:** Vẽ cảnh ngôi nhà hoàn chỉnh (nhà + cây + mặt trời + mây)

**💎 Siêu sao:** Tạo hoa nghệ thuật xoắn ốc hoặc fractal cây đẹp
