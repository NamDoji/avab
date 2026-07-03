# AvaB Education Standard v1.0 — Part 3
## Phần 6–8: Solution · Assessment · Illustration

**Tổ chức:** AvaB Learning Platform
**Phiên bản:** 1.0
**Ngày ban hành:** 2026-07-04
**Người soạn thảo:** Chief Education Architect
**Áp dụng cho:** Nội dung Toán Tư Duy · Anh văn · Tin học · Lứa tuổi 5–8
**Liên kết:** Part 1 (Scope, Curriculum, Content) · Part 2 (Problem Standard) · **Part 3 (Solution · Assessment · Illustration)**

---

> **Quy ước ký hiệu trong tài liệu này:**
> - 🔴 **MUST** — Bắt buộc tuyệt đối. Vi phạm → từ chối xuất bản.
> - 🟡 **SHOULD** — Khuyến nghị mạnh. Không tuân thủ cần ghi rõ lý do.
> - 🟢 **MAY** — Tùy chọn, được khuyến khích khi phù hợp.
> - ✅ **QA Pass** / ❌ **QA Fail** — Trạng thái kiểm tra chất lượng.

---

# PHẦN 6: SOLUTION STANDARD
## Tiêu chuẩn Trình bày Lời giải

---

## 6.1 Solution Philosophy — Triết lý Lời giải

### 6.1.1 Tuyên ngôn cốt lõi

> *"Một lời giải tốt không chỉ cho thấy đáp án đúng — nó dạy não bộ học sinh cách tiếp cận một vấn đề chưa từng gặp."*

AvaB không dạy trẻ thuộc lòng công thức. AvaB dạy trẻ **tư duy có hệ thống**. Mỗi lời giải là một mô hình tư duy mà học sinh có thể nội hoá và áp dụng vào bài mới.

### 6.1.2 Ba nguyên tắc nền tảng

| # | Nguyên tắc | Diễn giải | Ví dụ sai | Ví dụ đúng |
|---|---|---|---|---|
| P1 | **Show Thinking, Not Just Calculation** | Mỗi bước phải có lý do | `12 ÷ 4 = 3` | `Chia 12 kẹo đều cho 4 bạn, mỗi bạn được 12 ÷ 4 = 3 kẹo` |
| P2 | **Metacognitive Modeling** | Lời giải mô hình hoá cách một người thông minh suy nghĩ | Trình bày cơ học | Nêu rõ "Tại sao chọn chiến thuật này?" |
| P3 | **Multiple Paths Welcome** | Khi có ≥ 2 cách giải, trình bày cả hai và so sánh | Chỉ một cách | Cách 1 (vẽ hình) + Cách 2 (tính trực tiếp) + Nhận xét |

### 6.1.3 Mục tiêu lâu dài của Solution Standard

- Học sinh lớp 1–2 thi IMC: xây dựng thói quen phân tích đề trước khi tính.
- Học sinh lớp 2–3 thi IMAS/MIMO: biết chọn chiến thuật phù hợp, không dùng cách dài nhất.
- Phụ huynh đọc lời giải: hiểu được con học gì, không chỉ thấy số.

---

## 6.2 Solution Structure Standard — Cấu trúc bắt buộc

### 6.2.1 5 Bước bắt buộc (MUST)

🔴 **MUST:** Mọi lời giải từ Level 4 trở lên PHẢI tuân thủ đủ 5 bước. Level 1–3 tối thiểu bước 3 + 5.

```
┌─────────────────────────────────────────────────────┐
│  BÀI GIẢI CHUẨN AVAB                               │
│                                                     │
│  Bước 1 ▸ PHÂN TÍCH ĐỀ                             │
│  Bước 2 ▸ LÊN KẾ HOẠCH                             │
│  Bước 3 ▸ THỰC HIỆN                                │
│  Bước 4 ▸ KIỂM TRA                                 │
│  Bước 5 ▸ KẾT LUẬN                                 │
└─────────────────────────────────────────────────────┘
```

---

### Bước 1: PHÂN TÍCH ĐỀ (Problem Analysis)

**Mục đích:** Buộc học sinh đọc kỹ, tách "đã biết" và "cần tìm" — tránh giải nhầm đề.

**Format bắt buộc:**

```
📌 ĐÃ BIẾT:
  • [Dữ kiện 1]
  • [Dữ kiện 2]

❓ CẦN TÌM:
  • [Yêu cầu bài toán]

⚠️ LƯU Ý ĐẶC BIỆT (nếu có):
  • [Điều kiện ẩn / từ khoá quan trọng]
```

**Ví dụ (Toán, Level 5, lớp 2):**

> *Đề: Trong hộp có 24 viên bi xanh và bi đỏ. Số bi xanh nhiều hơn bi đỏ 6 viên. Hỏi có bao nhiêu viên bi đỏ?*

```
📌 ĐÃ BIẾT:
  • Tổng số bi: 24 viên
  • Bi xanh nhiều hơn bi đỏ: 6 viên

❓ CẦN TÌM:
  • Số viên bi đỏ

⚠️ LƯU Ý:
  • Đề hỏi bi ĐỎ, không phải bi xanh → đọc kỹ để không trả lời nhầm
```

---

### Bước 2: LÊN KẾ HOẠCH (Strategy Selection)

**Mục đích:** Học sinh (và giáo viên/AI) nêu rõ chiến thuật giải trước khi tính — hình thành thói quen metacognition.

**Danh sách chiến thuật chuẩn AvaB:**

| Mã | Chiến thuật | Dùng khi | Biểu tượng |
|---|---|---|---|
| S01 | Vẽ sơ đồ đoạn thẳng | Bài toán hơn kém, tổng hiệu | 📏 |
| S02 | Vẽ bảng / liệt kê | Tìm qui luật, tổ hợp đơn giản | 📊 |
| S03 | Thử & kiểm tra (Guess & Check) | Bài toán số nhỏ, tìm số chưa biết | 🎯 |
| S04 | Làm ngược (Work Backward) | Bài toán cho kết quả, tìm đầu vào | ⬅️ |
| S05 | Tính trực tiếp | Bài toán 1 bước rõ ràng | ➡️ |
| S06 | Chia nhỏ bài toán | Bài phức tạp nhiều điều kiện | 🔀 |
| S07 | Tìm qui luật (Pattern) | Dãy số, hình học tuần hoàn | 🔁 |
| S08 | Loại trừ (Elimination) | Trắc nghiệm, logic | ✂️ |
| S09 | Vẽ hình minh hoạ | Bài hình học, không gian | 📐 |
| S10 | Dùng công thức đã học | Bài áp dụng trực tiếp | 📖 |

**Format khai báo chiến thuật:**

```
🧠 CHIẾN THUẬT: [Tên chiến thuật] [Biểu tượng]
💡 LÝ DO CHỌN: [1–2 câu giải thích ngắn gọn tại sao chiến thuật này phù hợp]
```

**Ví dụ (tiếp theo bài bi trên):**

```
🧠 CHIẾN THUẬT: Vẽ sơ đồ đoạn thẳng 📏
💡 LÝ DO CHỌN: Bài có "nhiều hơn" → sơ đồ đoạn thẳng giúp nhìn thấy
   mối quan hệ giữa hai số, tránh tính sai.
```

---

### Bước 3: THỰC HIỆN (Step-by-step Execution)

**Quy tắc viết từng bước:**

🔴 **MUST:** Mỗi bước gồm:
1. **Câu dẫn** — giải thích sẽ làm gì
2. **Phép tính** — viết rõ ràng theo format chuẩn (xem 6.3)
3. **Câu kết bước** — nêu ý nghĩa của kết quả (Level 4+)

**Ví dụ (tiếp theo):**

```
📐 SƠ ĐỒ:
  Bi xanh: |————————————|——————|
  Bi đỏ:   |————————————|
                               └── 6 viên

Bước 1: Tìm 2 lần số bi đỏ
  Nếu bớt 6 viên bi xanh, bi xanh = bi đỏ, và tổng sẽ bớt đi 6 viên:
  24 − 6 = 18 (viên)
  → Lúc này, bi xanh = bi đỏ, tổng 2 phần bằng nhau = 18 viên.

Bước 2: Tính số bi đỏ
  18 : 2 = 9 (viên)
  → Số bi đỏ là 9 viên.

Bước 3: Kiểm tra số bi xanh
  Số bi xanh = 9 + 6 = 15 (viên)
```

---

### Bước 4: KIỂM TRA (Verification)

🔴 **MUST cho Level 5+:** Bắt buộc có bước kiểm tra.
🟡 **SHOULD cho Level 3–4:** Khuyến nghị có.

**Phương pháp kiểm tra (chọn ≥ 1):**

| Phương pháp | Khi dùng | Ví dụ |
|---|---|---|
| **Thay ngược** | Toán số học | Thay 9 và 15 vào: 9 + 15 = 24 ✓; 15 − 9 = 6 ✓ |
| **Ước tính** | Kết quả hợp lý? | Bi đỏ < bi xanh < tổng → 9 < 15 < 24 ✓ |
| **Cách khác** | Bài quan trọng | Giải bằng chiến thuật S03 để so sánh |
| **Đọc lại đề** | Mọi bài | Đề hỏi bi đỏ → đáp án 9 viên bi đỏ ✓ |

**Format:**

```
✅ KIỂM TRA:
  • 9 + 15 = 24 ✓ (đúng tổng)
  • 15 − 9 = 6 ✓ (đúng chênh lệch)
  • Đề hỏi bi đỏ → trả lời 9 viên bi đỏ ✓
```

---

### Bước 5: KẾT LUẬN (Complete Sentence Answer)

🔴 **MUST:** Mọi bài PHẢI có câu kết luận hoàn chỉnh. Không được kết bài bằng phép tính.

**Quy tắc viết kết luận:**

| Quy tắc | Ví dụ sai | Ví dụ đúng |
|---|---|---|
| Câu hoàn chỉnh | `Đáp số: 9 viên.` | `Vậy trong hộp có 9 viên bi đỏ.` |
| Có đơn vị | `Đáp số: 9` | `Vậy trong hộp có 9 viên bi đỏ.` |
| Trả lời đúng câu hỏi | Kể lại toàn bài | Chỉ trả lời điều đề hỏi |
| Dùng từ "Vậy" | Bắt đầu bằng số | Bắt đầu bằng "Vậy" hoặc "Do đó" |

**Format:**

```
📝 KẾT LUẬN:
  Vậy trong hộp có 9 viên bi đỏ.
```

---

## 6.3 Language in Solutions — Ngôn ngữ trong Lời giải

### 6.3.1 Từ chuyển tiếp chuẩn AvaB

| Loại | Từ/cụm từ được dùng |
|---|---|
| **Mở đầu bước** | Ta có, Ta thấy, Nhận xét rằng, Vì |
| **Kết bước** | Do đó, Vậy ta được, Suy ra |
| **Giải thích** | Vì..., nên...; Do..., ta có... |
| **Chuyển bước** | Tiếp theo, Từ bước trên, Sử dụng kết quả này |
| **Kiểm tra** | Thử lại, Kiểm tra, Ta thấy đúng vì |
| **Kết luận** | Vậy, Do đó, Kết luận: |

🔴 **MUST:** Không dùng các từ sau trong lời giải chính thức: "thì", "là" (thay bằng "bằng"), "OK", "oke", "done", "xong".

### 6.3.2 Quy tắc viết phép tính

| Loại | Format chuẩn | Sai | Đúng |
|---|---|---|---|
| Cộng | `a + b = c` | `a+b=c` | `12 + 8 = 20` |
| Trừ | `a − b = c` | `a-b=c` (dấu gạch ngang) | `20 − 8 = 12` |
| Nhân | `a × b = c` | `a*b=c` hoặc `axb` | `4 × 3 = 12` |
| Chia | `a ÷ b = c` | `a/b=c` | `12 ÷ 4 = 3` |
| Bằng | `=` (một dấu) | `==` | `5 + 3 = 8` |

🔴 **MUST:** Dùng ký tự toán học đúng: `−` (U+2212), `×` (U+00D7), `÷` (U+00F7). Không dùng `-`, `*`, `/` trong lời giải dành cho học sinh.

### 6.3.3 Quy tắc viết đơn vị

| Loại | Quy tắc | Ví dụ đúng |
|---|---|---|
| Đơn vị số học | Viết trong ngoặc đơn sau kết quả | `12 ÷ 4 = 3 (viên kẹo)` |
| Đơn vị đo lường | Viết liền sau số, không ngoặc | `5 cm`, `3 kg`, `2 giờ` |
| Đơn vị tiền | Viết liền sau số | `5.000 đồng`, `50.000 đồng` |
| Bài hỏi "bao nhiêu" | Luôn có đơn vị trong kết luận | `Vậy có 9 viên bi đỏ.` |
| Đơn vị phức hợp | Viết đầy đủ | `3 giờ 30 phút` (không phải `3h30`) |

### 6.3.4 Từ viết tắt bị cấm

🔴 **MUST NOT:** Các từ viết tắt sau bị cấm tuyệt đối trong lời giải dành cho học sinh:

| Bị cấm | Thay bằng |
|---|---|
| ĐS | Đáp số → BỎ HOÀN TOÀN, dùng "Kết luận" |
| GT | Giả thiết → "Đã biết" |
| KL | Kết luận → Viết đầy đủ |
| cm2 | cm² (dùng ký tự superscript) |
| h (giờ) | giờ |
| tr (trang) | trang |

---

## 6.4 Visual Solutions — Lời giải Trực quan

### 6.4.1 Khi nào MUST có sơ đồ/hình vẽ

🔴 **MUST có minh hoạ trực quan khi:**

| Loại bài | Loại minh hoạ |
|---|---|
| Bài toán hơn kém, tổng hiệu | Sơ đồ đoạn thẳng |
| Bài toán có hình học (chu vi, diện tích) | Hình vẽ có ghi số liệu |
| Bài toán chuyển động / thời gian | Sơ đồ thời gian (timeline) |
| Bài logic nhiều điều kiện (Level 7+) | Bảng suy luận / Bảng loại trừ |
| Bài tìm qui luật dãy số | Dãy số có mũi tên + ghi phép tính |
| Bài toán cân bằng | Hình ảnh cân / cột so sánh |

🟡 **SHOULD có minh hoạ khi:**
- Bài toán Level 4–6 mà ngôn ngữ mô tả ≥ 3 đối tượng
- Bài có quan hệ "nhiều hơn / ít hơn" giữa nhiều nhóm

### 6.4.2 Format sơ đồ đoạn thẳng chuẩn

```
Tên A: |═══════════════|═════|
Tên B: |═══════════════|
                        ↑
                    [x đơn vị]

Tổng: [Tên A] + [Tên B] = [con số]
```

**Quy tắc:**
- 🔴 MUST: Ghi tên đối tượng bên trái đoạn thẳng
- 🔴 MUST: Ghi số liệu / nhãn trên/dưới đoạn
- 🟡 SHOULD: Phần "hơn" tô màu khác hoặc dùng ký hiệu `|═══|`
- 🟢 MAY: Thêm mũi tên chú thích

### 6.4.3 Bảng giả thiết tạm (Assumption Table)

Dùng cho bài Level 7+ có ẩn số phức tạp:

```
┌──────────────┬──────────┬──────────┬──────────┐
│ Giả sử       │ Giá trị  │ Kết quả  │ So với đề│
├──────────────┼──────────┼──────────┼──────────┤
│ [Ẩn] = ___  │    ___   │    ___   │  Đúng/Sai│
│ [Ẩn] = ___  │    ___   │    ___   │  Đúng/Sai│
└──────────────┴──────────┴──────────┴──────────┘
```

---

## 6.5 Difficulty-based Solution Depth

### Bảng độ sâu yêu cầu theo Level

| Level | Tên cấp | Bước 1 | Bước 2 | Bước 3 | Bước 4 | Bước 5 | Multi-path | Insight |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1–2 | Starter | ❌ | ❌ | ✅ Min | ❌ | ✅ | ❌ | ❌ |
| 3 | Easy | ✅ Short | ❌ | ✅ Full | 🟡 | ✅ | ❌ | ❌ |
| 4–5 | Medium-Low | ✅ Full | ✅ | ✅ Full | ✅ | ✅ | ❌ | ❌ |
| 6–7 | Medium-High | ✅ Full | ✅ | ✅ Full | ✅ | ✅ | 🟡 | ❌ |
| 8–9 | Hard | ✅ Full | ✅ | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| 10 | Expert | ✅ Full | ✅ | ✅ Full | ✅ | ✅ | ✅ MUST | ✅ MUST |

**Giải thích cột:**
- **Multi-path:** Có ≥ 2 cách giải và so sánh
- **Insight:** Đoạn "Nhận xét thêm" — generalisation, extension, hoặc liên hệ với bài tương tự

### Ví dụ Insight (Level 9–10):

```
💡 NHẬN XÉT THÊM:
  Phương pháp này (Tổng − Hiệu) ÷ 2 = Số nhỏ hơn
  có thể áp dụng cho mọi bài toán dạng "tổng hiệu".
  Khi gặp bài tương tự ở IMAS, hãy nhớ công thức này!

🔗 LIÊN HỆ: Bài tập 7.3, 8.1, Series "Tổng Hiệu Cơ Bản"
```

---

## 6.6 Solution QA Checklist

### Checklist kiểm tra lời giải trước xuất bản

| # | Tiêu chí | MUST/SHOULD | Pass? |
|---|---|---|:---:|
| S01 | Bước 1 (Phân tích đề) có đủ "Đã biết" + "Cần tìm" (Level 3+) | MUST | ☐ |
| S02 | Bước 2 (Chiến thuật) được khai báo rõ tên + lý do (Level 4+) | MUST | ☐ |
| S03 | Mỗi bước tính có câu dẫn giải thích (không chỉ có số) | MUST | ☐ |
| S04 | Phép tính dùng ký tự đúng: `−`, `×`, `÷` | MUST | ☐ |
| S05 | Đơn vị viết đúng format theo loại | MUST | ☐ |
| S06 | Không dùng từ viết tắt bị cấm (ĐS, GT, KL...) | MUST | ☐ |
| S07 | Bước 4 (Kiểm tra) có mặt ở Level 5+ | MUST | ☐ |
| S08 | Bước 5 (Kết luận) là câu hoàn chỉnh, có đơn vị, bắt đầu "Vậy" | MUST | ☐ |
| S09 | Bài Level 4+ có minh hoạ trực quan khi bắt buộc (xem 6.4.1) | MUST | ☐ |
| S10 | Sơ đồ đoạn thẳng ghi tên đối tượng + số liệu đầy đủ | MUST | ☐ |
| S11 | Bài Level 8+ có ≥ 2 cách giải | MUST | ☐ |
| S12 | Bài Level 9–10 có đoạn Insight | MUST | ☐ |
| S13 | Từ chuyển tiếp dùng đúng danh sách chuẩn | SHOULD | ☐ |
| S14 | Ngôn ngữ phù hợp lứa tuổi 5–8 (không quá phức tạp) | MUST | ☐ |
| S15 | Lời giải được peer-review bởi ≥ 1 giáo viên khác | SHOULD | ☐ |

> 🔴 **QA Rule:** Nếu bất kỳ mục MUST nào ☐ → Từ chối xuất bản. Ghi rõ mục bị vi phạm trong ticket.

---
---

# PHẦN 7: ASSESSMENT STANDARD
## Tiêu chuẩn Đánh giá

---

## 7.1 Assessment Philosophy — Triết lý Đánh giá

### 7.1.1 Continuous Assessment Model

AvaB không đánh giá bằng bài kiểm tra định kỳ đơn độc. Đánh giá là **quá trình liên tục**, tích hợp vào từng bài học.

```
┌──────────────────────────────────────────────────────────────┐
│              AvaB Continuous Assessment Loop                 │
│                                                              │
│  [Học] ──▶ [Luyện] ──▶ [Đánh giá tức thời] ──▶ [Thích nghi]│
│    ▲                                                    │    │
│    └────────────────────────────────────────────────────┘    │
│                                                              │
│  Formative (70%)          ─────▶  Điều chỉnh ngay           │
│  Summative (30%)          ─────▶  Báo cáo định kỳ           │
└──────────────────────────────────────────────────────────────┘
```

### 7.1.2 Formative vs Summative

| Loại | Tần suất | Mục đích | Công cụ | Tác động |
|---|---|---|---|---|
| **Formative** | Mỗi bài / mỗi phiên | Phát hiện lỗ hổng, điều chỉnh ngay | Micro-quiz, hỏi đáp, bài tập thực hành | Thích nghi nội dung ngay lập tức |
| **Summative** | Tuần 2 / Tháng 1 | Đánh giá toàn diện, báo cáo | Unit Test, Progress Review | Báo cáo cho PH + GV + Hệ thống |

### 7.1.3 Nguyên tắc đánh giá AvaB

| # | Nguyên tắc | Mô tả |
|---|---|---|
| A1 | **Growth Over Grade** | Tiến bộ cá nhân quan trọng hơn thứ hạng tuyệt đối |
| A2 | **Process Matters** | Đánh giá cả cách làm, không chỉ đáp án cuối |
| A3 | **No Fear Assessment** | Thiết kế để học sinh thấy đánh giá là cơ hội, không phải hình phạt |
| A4 | **Data-Driven** | Mọi quyết định dạy học dựa trên data, không phải cảm tính |
| A5 | **Transparent** | Học sinh + PH biết rõ mình đang được đánh giá gì và tại sao |

---

## 7.2 Assessment Dimensions — 7 Chiều Đánh giá

### 7.2.1 Ma trận 7 Chiều

| # | Chiều | Mô tả chi tiết | Trọng số | Cách đo chính | Công cụ |
|---|---|---|:---:|---|---|
| D1 | **Knowledge** | Kiến thức nền tảng, khái niệm, định nghĩa | 20% | Quiz câu hỏi ngắn, điền vào chỗ trống | Micro-quiz sau mỗi concept |
| D2 | **Skill** | Kỹ năng thực hành, thực thi bước giải | 20% | Bài toán có cấu trúc rõ, đo tốc độ + độ chính xác | Timed drill |
| D3 | **Thinking** | Tư duy logic, suy luận, phân tích | 25% | Bài toán phức tạp, bài open-ended | Complex problem set |
| D4 | **Creativity** | Đề xuất cách giải mới, đặt câu hỏi | 10% | Bài mở, "Tạo bài toán mới", brainstorm | Open challenge |
| D5 | **Communication** | Diễn đạt lời giải, giải thích rõ ràng | 10% | Chấm chất lượng lời giải (theo Solution Standard) | Rubric lời giải |
| D6 | **Problem Solving** | Áp dụng vào bài mới chưa gặp | 10% | Novel problems, đề thi mẫu IMC/IMAS | Transfer tasks |
| D7 | **Confidence** | Thái độ tự tin, chủ động thử, không bỏ cuộc | 5% | Behavioral metrics (số lần thử lại, thời gian stuck) | Platform analytics |

**Tổng cộng:** 100%

### 7.2.2 Đánh giá theo môn

| Chiều | Toán Tư Duy | Anh văn | Tin học |
|---|---|---|---|
| D1 Knowledge | Công thức, khái niệm | Từ vựng, ngữ pháp | Khái niệm CT, câu lệnh |
| D2 Skill | Tính toán, vẽ sơ đồ | Đọc hiểu, nghe | Gõ code, kéo thả |
| D3 Thinking | Suy luận logic | Suy luận ngữ cảnh | Thuật toán, debug |
| D4 Creativity | Tạo bài toán | Sáng tác câu chuyện | Tạo project riêng |
| D5 Communication | Lời giải bằng chữ | Nói, viết | Giải thích code |
| D6 Problem Solving | Đề thi mẫu | Tình huống giao tiếp | Bug fixing |
| D7 Confidence | Tự nguyện thử bài khó | Dám nói dù sai | Tự debug trước khi hỏi |

---

## 7.3 Scoring System — Hệ thống Điểm số

### 7.3.1 Thang điểm AvaB

🔴 **MUST:** AvaB dùng **thang 100 điểm** cho mọi bài đánh giá chính thức.

```
┌─────────────────────────────────────────────────┐
│             AvaB Score Scale                    │
│                                                 │
│  90–100 ⭐⭐⭐  Xuất sắc (Outstanding)           │
│  75–89  ⭐⭐    Giỏi (Proficient)                │
│  60–74  ⭐      Đạt (Developing)                │
│  40–59  📈      Cần cải thiện (Emerging)        │
│  0–39   🌱      Bắt đầu (Beginning)             │
└─────────────────────────────────────────────────┘
```

### 7.3.2 Partial Credit Rules — Tính điểm thành phần

🔴 **MUST:** AvaB KHÔNG chỉ tính đúng/sai. Partial credit là bắt buộc cho bài Level 4+.

| Thành phần | Điểm tối đa | Điều kiện nhận điểm |
|---|---|---|
| Phân tích đề đúng | 10% | Xác định đúng "Đã biết" và "Cần tìm" |
| Chọn chiến thuật phù hợp | 15% | Nêu được chiến thuật hợp lý |
| Các bước trung gian đúng | 45% | Chia đều cho số bước; mỗi bước đúng = điểm tương ứng |
| Đáp án cuối đúng | 20% | Kết quả chính xác + đơn vị |
| Kiểm tra + Kết luận | 10% | Có kiểm tra + câu kết hoàn chỉnh |

**Ví dụ áp dụng Partial Credit:**

> Bài 5 bước, điểm tối đa = 100:
> - HS phân tích đúng: +10 điểm
> - HS chọn chiến thuật đúng: +15 điểm
> - HS làm đúng bước 1, 2 (sai bước 3): +18 điểm (45% × 2/3 bước đúng)
> - HS ghi đáp án sai (vì sai bước 3): 0 điểm
> - HS kiểm tra (nhưng sai vì đáp án sai): 5 điểm (nỗ lực)
> - **Tổng: 48/100** thay vì 0/100 nếu chỉ tính đúng/sai

### 7.3.3 Bonus Points

🟢 **MAY:** Thêm điểm thưởng (không vượt +20% điểm tổng bài):

| Điều kiện | Điểm thưởng |
|---|---|
| Tìm ra ≥ 2 cách giải (khi đề không yêu cầu) | +5% |
| Lời giải đặc biệt sáng tạo / ngắn gọn | +5% |
| Giải đúng trong thời gian ≤ 50% thời gian quy định | +10% |
| Tự phát hiện và sửa lỗi trong lời giải | +3% |

### 7.3.4 Penalty — Phạt điểm

🟡 **SHOULD NOT** dùng phạt điểm cho học sinh 5–8 tuổi.

> **Lý do:** Hình phạt điểm tạo tâm lý sợ thất bại, giảm creativity và willingness to try. AvaB ưu tiên motivation qua positive reinforcement.

**Ngoại lệ duy nhất** (MUST ghi rõ trong đề):
- Đề thi mô phỏng IMC/IMAS có cấu trúc trừ điểm → Ghi rõ "BÀI THI MÔ PHỎNG — CÓ TRỪ ĐIỂM" và chỉ áp dụng cho học sinh ≥ 7 tuổi, Level 7+.

---

## 7.4 BKT Integration — Tích hợp mô hình Bayesian Knowledge Tracing

### 7.4.1 Liên kết với A2PLM

AvaB sử dụng **Adaptive 2-Parameter Learning Model (A2PLM)** kết hợp BKT để theo dõi mức độ thành thạo của từng học sinh theo từng skill.

**Tham số BKT cho mỗi Skill:**

| Tham số | Ký hiệu | Giá trị mặc định AvaB | Ý nghĩa |
|---|---|---|---|
| Prior Knowledge | P(L₀) | 0.15 | Xác suất biết skill trước khi học |
| Learn Rate | P(T) | 0.25 | Xác suất học được qua 1 cơ hội |
| Guess Rate | P(G) | 0.20 | Xác suất đoán đúng dù chưa biết |
| Slip Rate | P(S) | 0.10 | Xác suất làm sai dù đã biết |

### 7.4.2 P(Mastery) Thresholds

| Ngưỡng | Giá trị P(L) | Hành động hệ thống |
|---|---|---|
| **Mastered** | ≥ 0.95 | Mở skill tiếp theo; ẩn drill bài cơ bản |
| **Proficient** | 0.75–0.94 | Cho thêm 2–3 bài thực hành nâng cao |
| **Developing** | 0.50–0.74 | Giữ nguyên level; thêm bài luyện tập |
| **Emerging** | 0.25–0.49 | Quay lại bài review; giảm độ khó |
| **Beginning** | < 0.25 | Restart concept từ đầu với approach khác |

### 7.4.3 Adaptive Difficulty Rules

🔴 **MUST:** Hệ thống PHẢI tự động điều chỉnh theo quy tắc:

```
IF P(L) ≥ 0.95 AND consecutive_correct ≥ 3:
    → Tăng Level + 1 (hoặc mở Skill mới)
    → Thông báo: "🎉 Bạn đã thành thạo! Khám phá thử thách mới nhé!"

IF P(L) < 0.50 AND consecutive_wrong ≥ 2:
    → Giảm Level − 1
    → Hiển thị hint tự động
    → Không thông báo "sai" — thông báo: "Hãy thử lại một chút nhé! 💪"

IF P(L) between 0.50–0.74 AND attempts ≥ 5:
    → Giữ nguyên Level
    → Thêm scaffolding (gợi ý từng bước)
    → Gợi ý: "Xem lại bài học Video nhé!"
```

### 7.4.4 Skill Dependency Map (Ví dụ Toán Tư Duy)

```
Cộng trừ trong 10
    └──▶ Cộng trừ trong 20
              └──▶ Cộng trừ trong 100
                        └──▶ Bài toán hơn kém
                                  └──▶ Bài toán tổng hiệu
                                            └──▶ IMAS Level 1
```

🔴 **MUST:** Học sinh phải đạt P(L) ≥ 0.75 tại một skill trước khi mở skill phụ thuộc.

---

## 7.5 Progress Reporting — Báo cáo Tiến độ

### 7.5.1 Report cho Học sinh (Student Dashboard)

**Tần suất:** Real-time sau mỗi phiên + Tổng kết tuần

| Thành phần | Mô tả | Format |
|---|---|---|
| **XP & Level** | Điểm kinh nghiệm tích lũy, cấp độ hiện tại | Progress bar + số |
| **Streak** | Số ngày học liên tiếp | Lịch streak |
| **Skill Map** | Bản đồ kỹ năng, phần đã mở/chưa mở | Visual map |
| **Stars Earned** | Số sao đạt được hôm nay / tuần | ⭐⭐⭐ |
| **Today's Achievement** | 1 thành tích nổi bật nhất hôm nay | Badge/Medal |
| **Next Goal** | Mục tiêu tiếp theo cần đạt | Call-to-action |

**Ngôn ngữ:** Vui, khích lệ, tránh "điểm số" thuần tuý. Dùng "sao", "huy hiệu", "siêu năng lực".

### 7.5.2 Report cho Phụ huynh (Parent Report)

**Tần suất:** Tuần 1 lần (Chủ nhật), Tháng 1 lần (chi tiết)

| Thành phần | Tuần | Tháng | Format |
|---|---|:---:|:---:|
| Tổng thời gian học | ✅ | ✅ | Số phút + phân bổ môn |
| Số bài hoàn thành | ✅ | ✅ | Số + % so tuần trước |
| Điểm trung bình 7 chiều | ❌ | ✅ | Biểu đồ radar |
| Kỹ năng thành thạo mới | ✅ | ✅ | Danh sách badge |
| Kỹ năng cần chú ý | ✅ | ✅ | Top 3 điểm yếu + gợi ý |
| So sánh với mục tiêu cá nhân | ❌ | ✅ | % hoàn thành mục tiêu tháng |
| Gợi ý cha mẹ hỗ trợ | ✅ | ✅ | 2–3 gợi ý cụ thể |
| Nhận xét AI / GV | 🟡 | ✅ | Đoạn nhận xét cá nhân hoá |

**Tone:** Tích cực, cụ thể, có thể hành động. Tránh so sánh với bạn khác.

### 7.5.3 Report cho Giáo viên (Teacher Dashboard)

**Tần suất:** Real-time + Tổng kết tuần/tháng

| Thành phần | Mô tả |
|---|---|
| **Class Overview** | P(Mastery) trung bình lớp theo từng skill |
| **At-Risk Students** | Học sinh có P(L) < 0.40 ở ≥ 2 skills |
| **Advanced Students** | Học sinh P(L) ≥ 0.95 cần thách thức mới |
| **Common Mistakes** | Top 5 lỗi phổ biến nhất trong tuần |
| **Engagement Metrics** | Thời gian học, streak, tỷ lệ hoàn thành |
| **Content Quality** | Bài nào có tỷ lệ sai cao bất thường (≥ 70%) → xem lại đề |
| **Individual Deep-dive** | Click vào từng HS để xem chi tiết |

**Cảnh báo tự động:**
- 🔴 Alert khi HS không học > 5 ngày
- 🟡 Alert khi HS stuck ở cùng 1 skill > 10 attempts không tiến bộ
- 🟢 Notification khi HS đạt milestone IMC/IMAS readiness

---

## 7.6 Assessment QA Checklist

| # | Tiêu chí | MUST/SHOULD | Pass? |
|---|---|---|:---:|
| A01 | Bài kiểm tra đánh giá đủ 7 chiều (trong Unit Test) | MUST | ☐ |
| A02 | Partial credit được thiết lập cho Level 4+ | MUST | ☐ |
| A03 | Rubric chấm lời giải dựa trên Solution Standard 6.2 | MUST | ☐ |
| A04 | BKT parameters được cấu hình cho mỗi Skill | MUST | ☐ |
| A05 | P(Mastery) thresholds đúng theo 7.4.2 | MUST | ☐ |
| A06 | Adaptive difficulty rules hoạt động đúng (test case ≥ 5) | MUST | ☐ |
| A07 | Student report dùng ngôn ngữ khích lệ, không dùng "điểm" thuần | MUST | ☐ |
| A08 | Parent report có "Gợi ý cha mẹ hỗ trợ" | MUST | ☐ |
| A09 | Teacher alert hoạt động khi HS không học > 5 ngày | MUST | ☐ |
| A10 | Không dùng hình phạt điểm (trừ bài thi mô phỏng có ghi rõ) | MUST | ☐ |
| A11 | Bonus points không vượt +20% điểm tổng | MUST | ☐ |
| A12 | Report tuần gửi đúng lịch Chủ nhật | SHOULD | ☐ |
| A13 | Biểu đồ radar 7 chiều hiển thị đúng trong báo cáo tháng | SHOULD | ☐ |
| A14 | Teacher dashboard hiển thị "At-Risk Students" đúng logic | MUST | ☐ |
| A15 | Bài có tỷ lệ sai ≥ 70% được flag để review nội dung | MUST | ☐ |

> 🔴 **QA Rule:** ≥ 3 mục MUST fail → Dừng deploy. Fix hết trước khi thử lại.

---
---

# PHẦN 8: ILLUSTRATION STANDARD
## Tiêu chuẩn Minh hoạ & Thiết kế

---

## 8.1 Design Principles — Nguyên tắc Thiết kế

### 8.1.1 Bốn Trụ cột Thiết kế AvaB

| Trụ cột | Mô tả | Biểu hiện cụ thể |
|---|---|---|
| **Child-Friendly** | Phù hợp nhận thức và thẩm mỹ trẻ 5–8 tuổi | Hình dạng bo tròn, màu tươi, ít chi tiết rối, nhân vật thân thiện |
| **Culturally Relevant** | Phản ánh bối cảnh Việt Nam | Nhân vật mặc đồng phục VN, thực phẩm VN, phong cảnh VN, lễ hội VN |
| **Inclusive** | Đại diện đa dạng | Hình ảnh trẻ em đa giới tính, đa vùng miền, bao gồm trẻ khuyết tật khi có thể |
| **Brand Consistent** | Nhận diện AvaB xuyên suốt | Logo, màu sắc, nhân vật mascot nhất quán 100% |

### 8.1.2 Mascot AvaB

**Ava** — Nhân vật chính:
- Bé gái 7 tuổi, tóc đen, mặc đồng phục học sinh Việt Nam
- Biểu cảm: Tò mò, vui vẻ, tự tin
- Dùng trong: Hướng dẫn, khích lệ, giải thích

**Bot** — Trợ lý robot nhỏ:
- Robot nhỏ màu xanh dương, màn hình mặt cảm xúc
- Dùng trong: Tin học, hướng dẫn kỹ thuật, hint

🔴 **MUST:** Mascot phải xuất hiện trong mỗi unit ít nhất 1 lần. Không được thay đổi thiết kế mascot mà không có phê duyệt từ Design Lead.

---

## 8.2 Color System — Hệ thống Màu sắc

### 8.2.1 Primary Palette (Bảng màu chủ đạo)

🔴 **MUST:** Mọi sản phẩm AvaB PHẢI dùng bảng màu này.

| Tên màu | Hex | RGB | Dùng cho | Ví dụ |
|---|---|---|---|---|
| **AvaB Blue** | `#1E6FD9` | 30, 111, 217 | Primary buttons, headers, links | Nút chính, tiêu đề |
| **AvaB Sky** | `#5BA8F5` | 91, 168, 245 | Secondary UI, highlights | Nền card, badges |
| **AvaB Yellow** | `#FFD700` | 255, 215, 0 | Accent, stars, rewards | Sao, phần thưởng |
| **AvaB Orange** | `#FF7F2A` | 255, 127, 42 | Warm accent, CTAs | Nút phụ, callout |
| **AvaB White** | `#FFFFFF` | 255, 255, 255 | Background chính | Nền trang |
| **AvaB Off-White** | `#F5F7FA` | 245, 247, 250 | Background phụ | Nền card, section |
| **AvaB Dark** | `#1A2233` | 26, 34, 51 | Text chính | Body text |
| **AvaB Gray** | `#6B7A99` | 107, 122, 153 | Text phụ, placeholder | Caption, hint |

### 8.2.2 Subject-Specific Colors (Màu theo môn học)

| Môn | Màu chính | Hex | Màu phụ | Hex | Dùng cho |
|---|---|---|---|---|---|
| **Toán Tư Duy** | Math Green | `#2ECC71` | Math Light | `#A8F0C6` | Nền bài Toán, icon, badge Toán |
| **Anh văn** | English Purple | `#9B59B6` | English Light | `#D7A8F0` | Nền bài Anh, icon, badge Anh |
| **Tin học** | Coding Cyan | `#00BCD4` | Coding Light | `#A0E8F0` | Nền bài Tin, icon, badge Tin |

### 8.2.3 Difficulty-Level Colors (Màu theo độ khó)

| Level | Tên | Màu | Hex | Áp dụng |
|---|---|---|---|---|
| 1–3 | Easy | Xanh lá nhạt | `#4CAF50` | Badge, border, nhãn |
| 4–6 | Medium | Vàng cam | `#FFC107` | Badge, border, nhãn |
| 7–8 | Hard | Cam đỏ | `#FF5722` | Badge, border, nhãn |
| 9–10 | Expert | Tím đậm | `#7C3AED` | Badge, border, nhãn |

### 8.2.4 Semantic Colors (Màu ngữ nghĩa)

| Tình huống | Màu | Hex | Icon kèm theo |
|---|---|---|---|
| Đúng / Thành công | Xanh lá | `#27AE60` | ✅ |
| Sai / Lỗi | Đỏ nhạt | `#E74C3C` | ❌ → Thay bằng 💡 trong ngữ cảnh trẻ em |
| Cảnh báo | Vàng | `#F39C12` | ⚠️ |
| Thông tin | Xanh dương | `#3498DB` | ℹ️ |
| Hint / Gợi ý | Tím nhạt | `#8E44AD` | 💡 |
| Hết giờ | Đỏ | `#C0392B` | ⏰ |

### 8.2.5 Forbidden Color Combinations (Tổ hợp màu bị cấm)

🔴 **MUST NOT:** Các tổ hợp sau bị cấm do khó đọc hoặc không phù hợp:

| Tổ hợp | Lý do cấm |
|---|---|
| Đỏ text trên xanh lá nền | Tương phản kém, nguy hiểm cho trẻ color-blind |
| Vàng `#FFD700` text trên trắng | Tương phản WCAG < 3:1, không đọc được |
| Nhiều hơn 4 màu khác nhau trong 1 màn hình | Gây loạn thị giác cho trẻ 5–8 tuổi |
| Neon thuần (`#FF00FF`, `#00FF00`) | Gây mỏi mắt |
| Đen thuần `#000000` text trên nền trắng thuần | Dùng `#1A2233` thay thế |
| Gradient phức tạp trên text | Text không thể đọc được |

---

## 8.3 Typography Standard — Tiêu chuẩn Chữ viết

### 8.3.1 Font System

| Loại | Font | Nguồn | Dùng cho |
|---|---|---|---|
| **Heading** | `Nunito` (700, 800) | Google Fonts | Tiêu đề bài, chương, unit |
| **Body** | `Nunito` (400, 600) | Google Fonts | Nội dung, hướng dẫn, bài đọc |
| **Math Display** | `STIX Two Math` | Google Fonts | Công thức Toán, ký hiệu |
| **Code** | `JetBrains Mono` (400) | Google Fonts | Code Tin học, syntax |
| **Tiếng Việt Fallback** | `Be Vietnam Pro` | Google Fonts | Khi Nunito thiếu dấu |

🔴 **MUST:** Chỉ dùng font trong danh sách trên. Không dùng font hệ thống mặc định như Arial, Times New Roman.

### 8.3.2 Size Matrix theo độ tuổi

| Thành phần | 5 tuổi | 6 tuổi | 7 tuổi | 8 tuổi | Đơn vị |
|---|---|---|---|---|---|
| **H1 — Tiêu đề bài** | 32 | 30 | 28 | 26 | px |
| **H2 — Tiêu đề mục** | 26 | 24 | 22 | 20 | px |
| **H3 — Tiêu đề nhỏ** | 22 | 20 | 18 | 16 | px |
| **Body text** | 20 | 18 | 16 | 16 | px |
| **Caption / chú thích** | 16 | 14 | 14 | 12 | px |
| **Button label** | 18 | 18 | 16 | 16 | px |
| **Math formula** | 24 | 22 | 20 | 18 | px |
| **Code** | 16 | 16 | 14 | 14 | px |

🔴 **MUST:** Không dùng font nhỏ hơn 12px bất kỳ ở đâu.

### 8.3.3 Spacing Rules

| Thuộc tính | Giá trị | Ghi chú |
|---|---|---|
| **Line height — Body** | 1.6× font size | Ví dụ: 16px font → 25.6px line height |
| **Line height — Heading** | 1.3× font size | Tiêu đề ngắn hơn |
| **Letter spacing — Body** | 0.02em | Dễ đọc hơn cho trẻ |
| **Letter spacing — Heading** | 0.01em | Slightly tight |
| **Paragraph spacing** | 1× line height | Khoảng cách giữa đoạn |
| **Max line length** | 60–70 ký tự | Tránh dòng quá dài |

---

## 8.4 Icon & Symbol Standard — Tiêu chuẩn Biểu tượng

### 8.4.1 Approved Icon Set

🔴 **MUST:** Chỉ dùng icon từ bộ **Phosphor Icons** (phong cách `Regular` hoặc `Bold`) hoặc custom AvaB icon đã được phê duyệt.

**Danh sách icon chuẩn theo chức năng:**

| Nhóm | Icon | Ký hiệu Phosphor | Dùng cho |
|---|---|---|---|
| **Navigation** | Home | `house` | Trang chủ |
| | Back | `arrow-left` | Quay lại |
| | Next | `arrow-right` | Tiếp theo |
| | Menu | `list` | Menu |
| **Actions** | Play | `play-circle` | Bắt đầu bài học |
| | Pause | `pause-circle` | Tạm dừng |
| | Retry | `arrow-clockwise` | Làm lại |
| | Submit | `check-circle` | Nộp bài |
| **Feedback** | Correct | `check-circle` (xanh) | Đúng rồi |
| | Try Again | `lightbulb` (tím) | Thử lại |
| | Hint | `question` (cam) | Gợi ý |
| | Star | `star` (vàng) | Phần thưởng |
| **Subjects** | Math | `calculator` (xanh lá) | Toán |
| | English | `book-open` (tím) | Anh văn |
| | Coding | `code` (cyan) | Tin học |
| **Progress** | Trophy | `trophy` | Thành tích |
| | Badge | `medal` | Huy hiệu |
| | Streak | `fire` | Chuỗi ngày học |

### 8.4.2 Math Symbols Standard

🔴 **MUST:** Dùng ký tự Unicode chính xác, không dùng ASCII thay thế:

| Ký hiệu | Unicode | Cấm dùng |
|---|---|---|
| Cộng | `+` | — |
| Trừ | `−` U+2212 | `-` (hyphen) |
| Nhân | `×` U+00D7 | `*`, `x` |
| Chia | `÷` U+00F7 | `/` |
| Bằng | `=` | `==` |
| Không bằng | `≠` U+2260 | `!=` |
| Nhỏ hơn | `<` | — |
| Lớn hơn | `>` | — |
| Nhỏ hơn hoặc bằng | `≤` U+2264 | `<=` |
| Lớn hơn hoặc bằng | `≥` U+2265 | `>=` |
| Bình phương | `²` U+00B2 | `^2`, `2` |
| Phần trăm | `%` | — |

### 8.4.3 Icon Size Requirements

| Ngữ cảnh | Kích thước | Ghi chú |
|---|---|---|
| In-line với text body | 20×20 px | Ngang với chiều cao dòng chữ |
| Button icon | 24×24 px | Có padding tối thiểu 8px |
| Navigation bar | 28×28 px | — |
| Feature icon (card) | 48×48 px | Có thể có nền màu tròn |
| Hero illustration icon | 64–96 px | — |
| Empty state illustration | 120×120 px | — |

---

## 8.5 Layout Standard — Tiêu chuẩn Bố cục

### 8.5.1 Grid System

| Thiết bị | Số cột | Gutter | Margin ngoài |
|---|---|---|---|
| Mobile (< 480px) | 4 cột | 16px | 16px |
| Tablet (480–1024px) | 8 cột | 20px | 24px |
| Desktop (> 1024px) | 12 cột | 24px | 32px |

### 8.5.2 Whitespace Rules (Minimum Margins)

🔴 **MUST:** Tuân thủ khoảng cách tối thiểu sau:

| Vị trí | Khoảng cách tối thiểu |
|---|---|
| Margin ngoài trang (mobile) | 16px |
| Khoảng cách giữa các section | 32px |
| Khoảng cách giữa card | 16px |
| Padding trong card | 16px (mobile) / 24px (desktop) |
| Khoảng cách text đến border | 12px |
| Khoảng cách giữa hình và text | 16px |
| Khoảng cách giữa các button | 12px |

🔴 **MUST NOT:** Không được để text sát border bất kỳ phần tử nào với khoảng cách < 8px.

### 8.5.3 Content Density by Age

| Tuổi | Số items tối đa / màn hình | Số màu tối đa | Text / Hình ratio |
|---|---|---|---|
| 5 tuổi | 3 items | 3 màu chính | 30% text / 70% hình |
| 6 tuổi | 4 items | 3–4 màu | 40% text / 60% hình |
| 7 tuổi | 5 items | 4 màu | 50% text / 50% hình |
| 8 tuổi | 6 items | 4–5 màu | 60% text / 40% hình |

### 8.5.4 Mobile vs Desktop Layout

| Thành phần | Mobile | Desktop |
|---|---|---|
| Navigation | Bottom bar | Left sidebar |
| Card layout | Single column | 2–3 columns grid |
| Problem display | Full width, scroll | Fixed width 680px center |
| Button size | Min 48×48px (touch target) | Min 36px height |
| Font scaling | Dùng Size Matrix tuổi 5–6 | Dùng Size Matrix tuổi 7–8 |
| Image position | Above text | Left/Right of text |
| Answer input | Large tap area | Keyboard + mouse |

---

## 8.6 Image Standard — Tiêu chuẩn Hình ảnh

### 8.6.1 Kích thước hình

| Loại hình | Tối thiểu | Tối đa | Tỷ lệ khuyến nghị |
|---|---|---|---|
| **Hero banner** | 1200×400 px | 2400×800 px | 3:1 |
| **Unit cover image** | 800×450 px | 1600×900 px | 16:9 |
| **In-problem illustration** | 400×300 px | 800×600 px | 4:3 hoặc 1:1 |
| **Character/mascot** | 200×200 px | 600×600 px | 1:1 |
| **Icon (raster)** | 64×64 px | 256×256 px | 1:1 |
| **Thumbnail** | 240×160 px | 480×320 px | 3:2 |
| **Inline diagram** | 300×200 px | 700×500 px | Linh hoạt |

### 8.6.2 Số lượng hình mỗi trang / màn hình

| Loại trang | Số hình tối đa | Ghi chú |
|---|---|---|
| Trang bài học concept | 2–3 hình | 1 hero + 1–2 inline |
| Trang bài tập (1 bài) | 1 hình | Hình minh hoạ đề bài |
| Trang tổng hợp nhiều bài | 1 thumbnail / bài | Không hình rời |
| Trang dashboard | 1 hero + icons | Icons không tính là hình |
| Trang báo cáo | 2–3 biểu đồ | Chart ≠ illustration |

### 8.6.3 Style hình ảnh

🔴 **MUST:** AvaB dùng **Flat Illustration** làm phong cách chủ đạo.

| Thuộc tính | Quy định |
|---|---|
| **Style chính** | Flat illustration (không có shadow phức tạp, không gradient 3D) |
| **Outline** | Có outline đường viền 2–3px, màu tối hơn fill 20–30% |
| **Shadow** | Drop shadow đơn giản: blur 4–8px, opacity 15–20% |
| **Nhân vật** | Tỷ lệ đầu : thân = 1:2.5 (chibi-friendly, không quá chibi) |
| **Realistic photo** | CHỈ dùng cho nội dung tham khảo thực tế, có watermark "Ảnh thực tế" |
| **3D render** | Không dùng |
| **Stock photo của người thật** | Không dùng trong bài học (chỉ dùng trong marketing với phê duyệt) |

### 8.6.4 File Format & Resolution

| Mục đích | Format | Resolution | Max file size |
|---|---|---|---|
| Illustration tĩnh (web) | SVG | Vector | 200 KB |
| Illustration tĩnh (fallback) | PNG | 2× resolution | 500 KB |
| Photo / Bitmap | WebP | 72–144 dpi | 300 KB |
| Animation đơn giản | SVG/CSS | — | 100 KB |
| Animation phức tạp | Lottie (JSON) | — | 500 KB |
| Video ngắn (tutorial) | MP4 (H.264) | 720p min | 10 MB / phút |

🔴 **MUST:** Mọi ảnh bitmap phải được export ở 2× resolution (retina).
🔴 **MUST:** SVG phải được tối ưu (SVGO) trước khi upload.
🟡 **SHOULD:** Dùng WebP thay PNG/JPG khi platform hỗ trợ.

### 8.6.5 Alt Text Requirements (Accessibility)

🔴 **MUST:** Mọi hình ảnh PHẢI có `alt` text phù hợp.

| Loại hình | Quy tắc alt text | Ví dụ |
|---|---|---|
| Hình minh hoạ đề bài | Mô tả đầy đủ nội dung hình | `"Hình vẽ 3 con mèo đứng trong vòng tròn và 2 con mèo đứng ngoài"` |
| Mascot / Nhân vật | Mô tả hành động | `"Ava đang vẫy tay chào"` |
| Biểu tượng chức năng | Tên chức năng | `"Nút Bắt đầu bài học"` |
| Decorative | `alt=""` (rỗng) | Hình nền, họa tiết trang trí |
| Biểu đồ / Chart | Mô tả dữ liệu chính | `"Biểu đồ tiến độ tuần: Toán 80%, Anh 70%, Tin 60%"` |

🔴 **MUST NOT:** Dùng `alt="image"`, `alt="hình ảnh"`, hoặc bỏ trống alt cho hình có nội dung.

---

## 8.7 Illustration QA Checklist

### Checklist thiết kế trước khi bàn giao

| # | Tiêu chí | MUST/SHOULD | Pass? |
|---|---|---|:---:|
| I01 | Màu sắc nằm trong Primary Palette / Subject Colors / Difficulty Colors | MUST | ☐ |
| I02 | Không có tổ hợp màu bị cấm (xem 8.2.5) | MUST | ☐ |
| I03 | Tương phản text/nền đạt WCAG AA (ratio ≥ 4.5:1 cho body, ≥ 3:1 cho large text) | MUST | ☐ |
| I04 | Font đúng theo danh sách 8.3.1 | MUST | ☐ |
| I05 | Kích thước chữ đúng theo Size Matrix tuổi (8.3.2) | MUST | ☐ |
| I06 | Không có font nhỏ hơn 12px | MUST | ☐ |
| I07 | Icon từ Phosphor Icons hoặc custom AvaB approved | MUST | ☐ |
| I08 | Kích thước icon đúng theo ngữ cảnh (8.4.3) | MUST | ☐ |
| I09 | Whitespace tối thiểu tuân thủ (8.5.2) | MUST | ☐ |
| I10 | Content density đúng theo tuổi (8.5.3) | MUST | ☐ |
| I11 | Mobile layout: touch target ≥ 48×48px | MUST | ☐ |
| I12 | Hình ảnh dùng Flat Illustration style | MUST | ☐ |
| I13 | File format đúng theo 8.6.4; SVG đã qua SVGO | MUST | ☐ |
| I14 | Hình ảnh export ở 2× resolution | MUST | ☐ |
| I15 | Mọi hình có alt text đúng quy tắc (8.6.5) | MUST | ☐ |
| I16 | Mascot xuất hiện ≥ 1 lần trong unit | MUST | ☐ |
| I17 | Không có hình người thật (stock photo) trong bài học | MUST | ☐ |
| I18 | Số hình mỗi trang không vượt giới hạn (8.6.2) | MUST | ☐ |
| I19 | Hình minh hoạ văn hoá Việt Nam (không có biểu tượng nước ngoài không phù hợp) | SHOULD | ☐ |
| I20 | Peer review bởi Designer + 1 người dùng thử tuổi 5–8 | SHOULD | ☐ |

> 🔴 **QA Rule:** ≥ 2 mục MUST fail → Trả lại designer. Không xuất bản.
> 🟡 **Note:** Mục I20 (user test) bắt buộc với mọi UI mới; không bắt buộc với illustration update nhỏ.

---

# PHỤ LỤC PART 3

## A. Bảng tóm tắt MUST/SHOULD/MAY

| Phần | Tổng MUST | Tổng SHOULD | Tổng MAY |
|---|---|---|---|
| Phần 6: Solution | 12 | 4 | 1 |
| Phần 7: Assessment | 11 | 4 | 1 |
| Phần 8: Illustration | 17 | 3 | 2 |
| **TỔNG PART 3** | **40** | **11** | **4** |

## B. Danh sách QA Checklist tổng hợp

| Checklist | Số mục MUST | Số mục SHOULD | Threshold fail |
|---|---|---|---|
| Solution QA (6.6) | 13 | 2 | 1 MUST fail = reject |
| Assessment QA (7.6) | 12 | 3 | 3 MUST fail = stop deploy |
| Illustration QA (8.7) | 17 | 3 | 2 MUST fail = reject |

## C. Changelog

| Phiên bản | Ngày | Thay đổi |
|---|---|---|
| 1.0 | 2026-07-04 | Phát hành lần đầu — Part 3 (Phần 6, 7, 8) |

## D. Tài liệu liên quan

| Tài liệu | Mô tả |
|---|---|
| `AvaB-Education-Standard-v1.0-Part1.md` | Phần 1–2: Scope, Curriculum Framework, Content Standard |
| `AvaB-Education-Standard-v1.0-Part2.md` | Phần 3–5: Problem Standard, Difficulty Rubric, Question Types |
| `AvaB-Education-Standard-v1.0-Part3.md` | **Phần 6–8: Solution, Assessment, Illustration** ← Tài liệu này |
| `AvaB-BKT-Model-Spec.md` | Thông số kỹ thuật mô hình BKT / A2PLM |
| `AvaB-Brand-Guidelines.md` | Brand identity, logo, mascot usage full guide |

---

*© 2026 AvaB Learning Platform. Tài liệu nội bộ — không phân phối bên ngoài.*
*Chief Education Architect — AvaB Standards Committee*
