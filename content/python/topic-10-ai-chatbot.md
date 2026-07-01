# Chuyên đề 10: AI & Chatbot — Trí Tuệ Nhân Tạo 🤖

## 🎯 Mục tiêu

Sau bài này, học sinh có thể:
- Hiểu AI là gì và hoạt động như thế nào
- Dùng OpenAI API hoặc Gemini API để tạo chatbot
- Xây dựng chatbot hỏi đáp cơ bản
- Tạo trợ lý học tập thông minh với AI

---

## 🐍 Python Syntax chính

```python
# ============================================
# AI LÀ GÌ? — Giải thích cơ bản
# ============================================

# AI (Artificial Intelligence) = Trí tuệ nhân tạo
# Machine Learning = Máy tính học từ dữ liệu
# ChatGPT / Gemini = Mô hình ngôn ngữ lớn (LLM)
# API = Cửa để giao tiếp với AI

# Chatbot ĐƠN GIẢN NHẤT — không cần API
def chatbot_don_gian():
    """Chatbot dùng if/else — không AI"""
    print("🤖 Xin chào! Tôi là Bot học tập!")
    
    cau_hoi_dict = {
        "python là gì": "Python là ngôn ngữ lập trình dễ học, được dùng trong AI, web, game!",
        "ai là gì": "AI là Trí Tuệ Nhân Tạo — máy tính mô phỏng trí thông minh con người.",
        "bao nhiêu tuổi": "Tôi không có tuổi! Tôi là chatbot 🤖",
        "tên bạn là gì": "Tôi là StudyBot — trợ lý học tập của bạn!",
        "xin chào": "Xin chào bạn! Tôi có thể giúp gì cho bạn?",
    }
    
    while True:
        cau_hoi = input("\nBạn: ").lower().strip()
        
        if cau_hoi in ["thoát", "bye", "tạm biệt"]:
            print("Bot: Tạm biệt! Chúc học tốt! 👋")
            break
        
        # Tìm câu trả lời phù hợp
        tra_loi = None
        for key in cau_hoi_dict:
            if key in cau_hoi:
                tra_loi = cau_hoi_dict[key]
                break
        
        if tra_loi:
            print(f"Bot: {tra_loi}")
        else:
            print("Bot: Xin lỗi, tôi chưa biết câu trả lời đó. Thử hỏi về Python hoặc AI nhé!")

# ============================================
# CHATBOT DÙNG OPENAI API
# ============================================

# Bước 1: Cài đặt thư viện
# pip install openai

# Bước 2: Lấy API key từ platform.openai.com
# Bước 3: Gọi API

import os

def chatbot_openai():
    """Chatbot dùng OpenAI GPT"""
    try:
        from openai import OpenAI
    except ImportError:
        print("❌ Chưa cài openai! Chạy: pip install openai")
        return
    
    # Lấy API key từ biến môi trường (an toàn hơn hard-code)
    api_key = os.environ.get("OPENAI_API_KEY", "sk-your-key-here")
    client = OpenAI(api_key=api_key)
    
    # Lịch sử trò chuyện (context)
    lich_su = [
        {
            "role": "system",
            "content": (
                "Bạn là StudyBot, trợ lý học tập thông minh cho học sinh 9-13 tuổi Việt Nam. "
                "Hãy giải thích đơn giản, vui vẻ, dùng ví dụ thực tế. "
                "Trả lời bằng tiếng Việt. Khuyến khích học sinh tò mò và đặt câu hỏi."
            )
        }
    ]
    
    print("=" * 50)
    print("  🤖 StudyBot — Trợ Lý Học Tập AI")
    print("  Gõ 'thoát' để kết thúc")
    print("=" * 50)
    
    while True:
        cau_hoi = input("\n👤 Bạn: ").strip()
        
        if not cau_hoi:
            continue
        
        if cau_hoi.lower() in ["thoát", "bye", "quit", "exit"]:
            print("🤖 Bot: Chúc bạn học tốt! 🌟")
            break
        
        # Thêm câu hỏi vào lịch sử
        lich_su.append({"role": "user", "content": cau_hoi})
        
        try:
            # Gọi API
            response = client.chat.completions.create(
                model="gpt-4o-mini",   # Model nhỏ, rẻ, nhanh
                messages=lich_su,
                max_tokens=500,
                temperature=0.7        # 0=chính xác, 1=sáng tạo
            )
            
            tra_loi = response.choices[0].message.content
            
            # Thêm trả lời vào lịch sử
            lich_su.append({"role": "assistant", "content": tra_loi})
            
            print(f"\n🤖 Bot: {tra_loi}")
            
            # Giới hạn lịch sử (tránh tốn token)
            if len(lich_su) > 20:
                lich_su = [lich_su[0]] + lich_su[-10:]
                
        except Exception as e:
            print(f"❌ Lỗi API: {e}")

# ============================================
# CHATBOT DÙNG GOOGLE GEMINI API (Miễn phí!)
# ============================================

# Bước 1: pip install google-generativeai
# Bước 2: Lấy API key từ aistudio.google.com (MIỄN PHÍ)

def chatbot_gemini():
    """Chatbot dùng Google Gemini"""
    try:
        import google.generativeai as genai
    except ImportError:
        print("❌ Chạy: pip install google-generativeai")
        return
    
    api_key = os.environ.get("GEMINI_API_KEY", "your-gemini-key")
    genai.configure(api_key=api_key)
    
    # Tạo model
    model = genai.GenerativeModel(
        "gemini-1.5-flash",  # Model nhanh và miễn phí
        system_instruction=(
            "Bạn là StudyBot, trợ lý học tập cho học sinh Việt Nam 9-13 tuổi. "
            "Giải thích đơn giản, dùng ví dụ vui. Trả lời tiếng Việt."
        )
    )
    
    # Bắt đầu chat session
    chat = model.start_chat(history=[])
    
    print("=" * 50)
    print("  🤖 StudyBot Gemini — Trợ Lý AI")
    print("=" * 50)
    
    while True:
        cau_hoi = input("\n👤 Bạn: ").strip()
        
        if not cau_hoi:
            continue
        if cau_hoi.lower() in ["thoát", "bye"]:
            print("🤖 Gemini: Chúc học tốt! 🌟")
            break
        
        try:
            response = chat.send_message(cau_hoi)
            print(f"\n🤖 Gemini: {response.text}")
        except Exception as e:
            print(f"❌ Lỗi: {e}")
```

---

## 💡 Từ khóa & Khái niệm

| Khái niệm | Ý nghĩa |
|-----------|---------|
| AI | Trí tuệ nhân tạo — máy học từ dữ liệu |
| LLM | Large Language Model — mô hình ngôn ngữ lớn |
| API | Cổng giao tiếp với dịch vụ bên ngoài |
| API Key | "Chìa khóa" để xác nhận bạn được dùng API |
| Token | Đơn vị tính phí của AI (≈ 4 ký tự tiếng Anh) |
| Prompt | Câu lệnh/yêu cầu gửi cho AI |
| System prompt | Hướng dẫn tính cách cho AI |
| Context/History | Lịch sử trò chuyện để AI nhớ ngữ cảnh |
| Temperature | Độ sáng tạo: 0=chính xác, 1=sáng tạo |

**Các API AI phổ biến:**
| Dịch vụ | Model | Giá | Link |
|---------|-------|-----|------|
| OpenAI | GPT-4o-mini | Có phí (rẻ) | platform.openai.com |
| Google | Gemini Flash | **Miễn phí!** | aistudio.google.com |
| Anthropic | Claude Haiku | Có phí | anthropic.com |
| Groq | Llama 3 | **Miễn phí!** | groq.com |

---

## 🔨 Project thực hành: Trợ Lý Học Tập Thông Minh

```python
# ============================================
# Project: StudyBot — Trợ Lý Học Tập Toàn Diện
# Dùng Gemini API (miễn phí) + lưu lịch sử JSON
# ============================================

import json
import os
from datetime import datetime

# ---- Cấu hình ----
LICH_SU_FILE = "chat_history.json"

def tai_lich_su():
    if os.path.exists(LICH_SU_FILE):
        with open(LICH_SU_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def luu_lich_su(lich_su):
    with open(LICH_SU_FILE, "w", encoding="utf-8") as f:
        json.dump(lich_su, f, ensure_ascii=False, indent=2)

# ---- Chatbot không cần API (demo offline) ----

class StudyBot:
    """Chatbot học tập dùng rule-based (không cần API)"""
    
    def __init__(self, ten_nguoi_dung):
        self.ten = ten_nguoi_dung
        self.lich_su = tai_lich_su()
        self.dem_cau_hoi = 0
        
        self.kien_thuc = {
            # Toán
            "số nguyên tố": "Số nguyên tố là số > 1, chỉ chia hết cho 1 và chính nó. Ví dụ: 2, 3, 5, 7, 11...",
            "phương trình": "Phương trình là đẳng thức có ẩn số (x, y...). Giải phương trình = tìm giá trị ẩn số.",
            "diện tích hình tròn": "Diện tích hình tròn = π × r² (r là bán kính). π ≈ 3.14159",
            
            # Python
            "vòng lặp for": "for i in range(n): — lặp n lần. i chạy từ 0 đến n-1.",
            "hàm là gì": "Hàm (function) là khối code tái sử dụng được. Dùng 'def tên_hàm():' để tạo.",
            "list là gì": "List là danh sách có thứ tự, có thể thay đổi. Ví dụ: [1, 2, 3] hoặc ['a', 'b'].",
            
            # Khoa học
            "tốc độ ánh sáng": "Tốc độ ánh sáng ≈ 300.000 km/s. Ánh sáng mặt trời mất 8 phút đến Trái Đất!",
            "trọng lực": "Trọng lực là lực hút của Trái Đất. g ≈ 9.8 m/s². Trên mặt trăng nhẹ hơn 6 lần!",
            
            # Tiếng Anh
            "present simple": "Hiện tại đơn: S + V(s/es). Ví dụ: She plays piano every day.",
            "past simple": "Quá khứ đơn: S + V-ed hoặc V2. Ví dụ: He played football yesterday.",
        }
    
    def tra_loi(self, cau_hoi):
        cau_hoi_lower = cau_hoi.lower()
        self.dem_cau_hoi += 1
        
        # Tìm câu trả lời trong kho kiến thức
        for key, value in self.kien_thuc.items():
            if key in cau_hoi_lower:
                return f"📚 {value}"
        
        # Câu hỏi toán học đơn giản
        if any(op in cau_hoi for op in ['+', '-', '*', '/', 'x', '×', '÷']):
            return self._tinh_toan(cau_hoi)
        
        # Chào hỏi
        if any(word in cau_hoi_lower for word in ["xin chào", "hello", "hi", "chào"]):
            return f"Xin chào {self.ten}! 😊 Hôm nay bạn muốn học gì? Toán, Python, hay Khoa học?"
        
        # Cảm ơn
        if any(word in cau_hoi_lower for word in ["cảm ơn", "thank"]):
            return "Không có gì! Học tập vui vẻ nhé! 🌟 Còn câu hỏi nào nữa không?"
        
        # Không biết
        return (f"🤔 Hmm, câu hỏi thú vị! Mình chưa có câu trả lời này trong kho kiến thức. "
                f"Bạn thử hỏi giáo viên hoặc tìm trên Google nhé! "
                f"Hoặc hỏi mình về: số nguyên tố, vòng lặp for, hàm là gì, tốc độ ánh sáng...")
    
    def _tinh_toan(self, bieu_thuc):
        """Thử tính toán biểu thức đơn giản"""
        try:
            # Thay ký tự toán học
            bieu_thuc_clean = bieu_thuc.replace("×", "*").replace("÷", "/").replace("x", "*")
            # Chỉ giữ lại số và phép toán
            import re
            bieu_thuc_so = re.findall(r'[\d\+\-\*\/\.\(\)\s]+', bieu_thuc_clean)
            if bieu_thuc_so:
                ket_qua = eval(bieu_thuc_so[0].strip())
                return f"🧮 Kết quả: {bieu_thuc_so[0].strip()} = {ket_qua}"
        except:
            pass
        return "🤔 Mình chưa hiểu biểu thức này. Thử viết rõ hơn nhé!"
    
    def ghi_lich_su(self, cau_hoi, tra_loi):
        self.lich_su.append({
            "thoi_gian": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "nguoi_dung": self.ten,
            "cau_hoi": cau_hoi,
            "tra_loi": tra_loi
        })
        luu_lich_su(self.lich_su)
    
    def xem_thong_ke(self):
        print(f"\n📊 Thống kê phiên học:")
        print(f"   Tên: {self.ten}")
        print(f"   Số câu hỏi: {self.dem_cau_hoi}")
        print(f"   Tổng lịch sử: {len(self.lich_su)} cuộc trò chuyện")


# ---- Chương trình chính ----

print("=" * 55)
print("  🤖 STUDYBOT — Trợ Lý Học Tập Thông Minh")
print("  Được tạo bằng Python & AI")
print("=" * 55)

ten = input("\nTên bạn là gì? ")
bot = StudyBot(ten)

print(f"\n🤖 Bot: Xin chào {ten}! Tôi là StudyBot 🤖")
print("🤖 Bot: Gõ 'thống kê' để xem số câu hỏi, 'thoát' để kết thúc.")

while True:
    cau_hoi = input(f"\n👤 {ten}: ").strip()
    
    if not cau_hoi:
        continue
    
    if cau_hoi.lower() in ["thoát", "bye", "quit"]:
        bot.xem_thong_ke()
        print(f"\n🤖 Bot: Cảm ơn {ten} đã học cùng tôi! Hẹn gặp lại! 🌟")
        break
    
    if cau_hoi.lower() == "thống kê":
        bot.xem_thong_ke()
        continue
    
    tra_loi = bot.tra_loi(cau_hoi)
    bot.ghi_lich_su(cau_hoi, tra_loi)
    print(f"\n🤖 Bot: {tra_loi}")
```

---

## 🎮 Hoạt động lớp (45 phút)

### Warm-up — 5 phút
**"ChatGPT biết gì?"**
- Cùng nhau chat với ChatGPT trực tiếp trên lớp
- Hỏi nó một câu hỏi về toán, hỏi viết thơ, hỏi giải thích
- Hỏi học sinh: "ChatGPT làm điều này thế nào?"
- Giải thích đơn giản: AI học từ hàng tỷ văn bản, rồi dự đoán từ tiếp theo

### Review — 5 phút
- Files & Data: lưu JSON khác gì lưu txt?
- Ai đã làm bài tập sổ tay địa chỉ JSON?

### Learn & Demo — 10 phút
1. Demo chatbot đơn giản if/else — học sinh nhận ra giới hạn
2. Demo gọi Gemini API (nếu có internet + key)
3. Giải thích: system prompt, temperature, token
4. Cho học sinh thấy lịch sử chat được lưu JSON

### Code Along — 15 phút
```python
# Chatbot toán đơn giản
hoi_dap = {
    "2+2": "4",
    "thủ đô việt nam": "Hà Nội",
    "python là gì": "Ngôn ngữ lập trình tuyệt vời!",
}

print("Chatbot nhỏ — gõ 'thoát' để dừng")
while True:
    hoi = input("Bạn: ").lower().strip()
    if hoi == "thoát":
        break
    if hoi in hoi_dap:
        print(f"Bot: {hoi_dap[hoi]}")
    else:
        print("Bot: Tôi chưa biết câu đó!")
```

### Challenge — 10 phút
Thêm 5 câu hỏi/đáp mới vào chatbot và demo với bạn bên cạnh.

---

## 📝 Bài tập về nhà (5 bài)

**Bài 1 — Dễ:** Tạo chatbot có 10 cặp hỏi/đáp về một chủ đề bạn thích (game, anime, thể thao...).

**Bài 2 — Dễ:** Thêm tính năng đếm số câu hỏi và in ra khi thoát.

**Bài 3 — Trung bình:** Chatbot toán: nhập biểu thức, bot tính và giải thích từng bước.

**Bài 4 — Trung bình:** Chatbot học từ vựng: hỏi nghĩa tiếng Anh, bot trả lời + ví dụ câu.

**Bài 5 — Khó:** Dùng Gemini API (miễn phí) tạo chatbot kể chuyện: người dùng bắt đầu câu chuyện, AI tiếp tục.

---

## 🤖 AI Coach gợi ý

- *"API key là gì? Tại sao không nên public API key của mình?"*
- *"Temperature trong OpenAI API nghĩa là gì? Ảnh hưởng thế nào?"*
- *"Cách dùng Gemini API miễn phí từ Google AI Studio"*
- *"Tôi muốn tạo chatbot trả lời câu hỏi về sách giáo khoa lớp 6 — hướng dẫn tôi"*

---

## ❌ Lỗi thường gặp

```python
# ❌ SAI: Hard-code API key vào code
api_key = "sk-abcdefghijklmnop..."  # NGUY HIỂM! Đừng làm vậy!

# ✅ ĐÚNG: Dùng biến môi trường
import os
api_key = os.environ.get("OPENAI_API_KEY")

# ❌ SAI: Không xử lý lỗi API
response = client.chat.completions.create(...)
print(response.choices[0].message.content)  # Crash nếu lỗi mạng!

# ✅ ĐÚNG: Try/except
try:
    response = client.chat.completions.create(...)
    print(response.choices[0].message.content)
except Exception as e:
    print(f"Lỗi API: {e}")

# ❌ SAI: Lịch sử quá dài tốn token (tiền)
lich_su.append(...)   # Thêm mãi không giới hạn → hóa đơn tăng!

# ✅ ĐÚNG: Giới hạn lịch sử
if len(lich_su) > 20:
    lich_su = [lich_su[0]] + lich_su[-10:]  # Giữ system + 10 tin nhắn cuối
```

---

## 🏅 Huy hiệu hoàn thành

**🥉 Người giao tiếp:** Tạo chatbot if/else có 10+ câu hỏi/đáp

**🥈 AI Tinkerer:** Hiểu API, dùng được Gemini/OpenAI trả lời câu hỏi

**🥇 AI Developer:** Chatbot đầy đủ với lịch sử lưu JSON, thống kê

**💎 Siêu sao AI:** Chatbot kể chuyện tương tác dùng Gemini API có lưu lịch sử
