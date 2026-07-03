# AvaB Education Standard v1.0 — Part 2
## Chuẩn Thiết Kế Nội Dung Giáo Dục AvaB

> **Phiên bản:** 1.0  
> **Ngày ban hành:** 2026-07-04  
> **Phạm vi áp dụng:** Toán Tư Duy · Anh Văn · Tin Học — Độ tuổi 5–8 (mở rộng đến 10)  
> **Cơ quan ban hành:** AvaB Education Architecture Team  
> **Tài liệu liên quan:** AvaB Education Standard v1.0 — Part 1 (Phần 1–2)

---

> **Quy ước ký hiệu:**
> - 🔴 **MUST** — Bắt buộc tuyệt đối. Vi phạm = từ chối publish.
> - 🟡 **SHOULD** — Khuyến nghị mạnh. Ngoại lệ phải được ghi rõ lý do.
> - 🟢 **MAY** — Tùy chọn theo ngữ cảnh.
> - ❌ **MUST NOT** — Cấm tuyệt đối.

---

## MỤC LỤC PART 2

- [Phần 3: Theory Writing Standard](#phần-3-theory-writing-standard)
- [Phần 4: Exercise Standard](#phần-4-exercise-standard)
- [Phần 5: Homework Standard](#phần-5-homework-standard)

---

# PHẦN 3: THEORY WRITING STANDARD

> **Mục tiêu phần này:** Quy định chuẩn mực cách viết phần lý thuyết (Theory Block) trong mọi bài học AvaB, đảm bảo tính sư phạm, khả năng tiếp thu theo độ tuổi, và nhất quán giữa các môn học.

---

## 3.1 Độ Dài & Cấu Trúc

### 3.1.1 Giới Hạn Độ Dài Theo Độ Tuổi

🔴 **MUST** tuân thủ bảng độ dài sau. Vượt quá giới hạn = bài học phải chia nhỏ.

| Độ tuổi | Lớp | Từ tối thiểu (words) | Từ tối đa (words) | Số đoạn văn (paragraphs) | Thời gian đọc ước tính |
|---------|-----|---------------------|------------------|--------------------------|------------------------|
| 5 tuổi  | Mầm non | 80 | 150 | 2–3 | 2–3 phút |
| 6 tuổi  | Lớp 1 | 100 | 200 | 2–4 | 3–4 phút |
| 7 tuổi  | Lớp 2 | 150 | 280 | 3–5 | 4–6 phút |
| 8 tuổi  | Lớp 3 | 200 | 350 | 4–6 | 5–7 phút |
| 9 tuổi  | Lớp 4 | 250 | 450 | 4–7 | 6–9 phút |
| 10 tuổi | Lớp 5 | 300 | 500 | 5–8 | 7–10 phút |

> **Ghi chú:** Độ dài tính cho **toàn bộ Theory Block**, bao gồm phần thân + ví dụ minh họa, KHÔNG tính phần tiêu đề và checklist.

### 3.1.2 Giới Hạn Độ Dài Đoạn Văn (Paragraph)

🔴 **MUST** không viết đoạn văn vượt quá giới hạn sau:

| Độ tuổi | Số câu tối đa / đoạn | Từ tối đa / đoạn |
|---------|---------------------|-----------------|
| 5–6 tuổi | 2 câu | 40 từ |
| 7–8 tuổi | 3 câu | 60 từ |
| 9–10 tuổi | 4 câu | 80 từ |

🟡 **SHOULD** có dòng trắng (blank line) giữa các đoạn để tăng khả năng đọc.

### 3.1.3 Cấu Trúc Bắt Buộc: Hook → Concept → Example → Counter-Example → Summary

🔴 **MUST** mọi Theory Block đều tuân theo cấu trúc 5 bước sau:

```
┌─────────────────────────────────────────────────────────────────┐
│  THEORY BLOCK STRUCTURE                                         │
├────────────────┬────────────────────────────────────────────────┤
│  HOOK          │  Câu mở bài kết nối với thực tế / tình huống   │
│  (1–2 câu)     │  quen thuộc của trẻ. Tạo sự tò mò.             │
├────────────────┼────────────────────────────────────────────────┤
│  CONCEPT       │  Trình bày khái niệm cốt lõi. Dùng ngôn ngữ    │
│  (1–3 đoạn)    │  phù hợp lứa tuổi. Định nghĩa từng thuật ngữ.  │
├────────────────┼────────────────────────────────────────────────┤
│  EXAMPLE       │  Ví dụ minh họa cụ thể. Theo CPA method.       │
│  (tối thiểu 2) │  Từ đơn giản → phức tạp dần.                   │
├────────────────┼────────────────────────────────────────────────┤
│  COUNTER-EX    │  Ví dụ phản (counterexample). Giúp phân biệt    │
│  (tối thiểu 1) │  đúng/sai, giới hạn của khái niệm.             │
├────────────────┼────────────────────────────────────────────────┤
│  SUMMARY       │  Tóm tắt 1–2 câu. Dạng bullet hoặc box nhớ.   │
│  (1–2 câu)     │  Học sinh đọc lại được khi cần ôn.             │
└────────────────┴────────────────────────────────────────────────┘
```

**Ví dụ áp dụng cấu trúc cho bài "Số chẵn và số lẻ" — Lớp 1:**

> **HOOK:** "Khi xếp hàng đôi, có bạn nào bị đứng lẻ không? Hôm nay mình sẽ tìm hiểu tại sao!"
>
> **CONCEPT:** Số chẵn là những số khi chia đôi thì không có phần dư. Số lẻ là những số khi chia đôi còn thừa 1.
>
> **EXAMPLE:**  
> ✅ 4 cái kẹo → chia đôi được → 2 và 2 → Số chẵn  
> ✅ 6 bông hoa → chia đôi được → 3 và 3 → Số chẵn  
>
> **COUNTER-EXAMPLE:**  
> ❌ 5 quyển sách → chia đôi còn dư 1 → Số lẻ  
>
> **SUMMARY:** 📦 **Nhớ nhé!** Số chẵn: 0, 2, 4, 6, 8 ở hàng đơn vị. Số lẻ: 1, 3, 5, 7, 9 ở hàng đơn vị.

### 3.1.4 Độ Phức Tạp Câu Theo Cấp Lớp

🔴 **MUST** viết câu theo đúng cấu trúc cú pháp phù hợp:

| Lớp | Cấu trúc câu cho phép | Ví dụ |
|-----|----------------------|-------|
| MN–Lớp 1 | Câu đơn, mệnh đề chính | "4 là số chẵn." |
| Lớp 2 | Câu đơn có bổ ngữ, câu ghép đơn | "4 là số chẵn vì chia đôi không dư." |
| Lớp 3 | Câu ghép, câu có mệnh đề phụ đơn giản | "Khi ta chia 4 cho 2, kết quả bằng 2 và không có phần dư." |
| Lớp 4+ | Câu phức, mệnh đề điều kiện đơn giản | "Nếu một số tận cùng bằng 0, 2, 4, 6, hoặc 8, thì số đó là số chẵn." |

❌ **MUST NOT** dùng câu passive phức tạp, câu dài hơn 20 từ cho lứa tuổi dưới 8.

---

## 3.2 Language Standard

### 3.2.1 Từ Vựng Cho Phép Theo Cấp Lớp

🔴 **MUST** tuân thủ danh sách từ vựng được kiểm soát (Controlled Vocabulary):

| Danh mục | Mầm non – Lớp 1 | Lớp 2–3 | Lớp 4–5 |
|----------|-----------------|---------|---------|
| Số học | đếm, thêm, bớt, bằng | cộng, trừ, nhân, chia | phép tính, biểu thức, kết quả |
| So sánh | nhiều hơn, ít hơn, bằng | lớn hơn (>), nhỏ hơn (<) | bất đẳng thức, so sánh tương đối |
| Hình học | hình tròn, hình vuông, hình chữ nhật | cạnh, góc, đường thẳng | chu vi, diện tích, đường chéo |
| Logic | và, hoặc, không | nếu…thì, khi nào | điều kiện, giả thuyết, suy luận |
| Toán tư duy | tìm, đoán, thử | quy luật, mẫu hình, chiến lược | thuật toán, phân tích, chứng minh |

🟡 **SHOULD** ưu tiên từ thuần Việt trước khi dùng thuật ngữ gốc nước ngoài.

### 3.2.2 Cấm Dùng Jargon Không Cần Thiết

❌ **MUST NOT** sử dụng các từ sau khi chưa giải thích:

**Danh sách từ bị kiểm soát (Restricted Terms):**

| Từ bị hạn chế | Thay thế cho Lớp 1–2 | Được phép từ Lớp |
|---------------|---------------------|-----------------|
| "nguyên tố" | "số đặc biệt chỉ chia hết cho 1 và chính nó" | Lớp 4 |
| "bội số" | "số đếm được lên bằng cách nhảy đều" | Lớp 3 |
| "phương trình" | "câu đố tìm số ẩn" | Lớp 4 |
| "hằng số" | "số không thay đổi" | Lớp 5 |
| "biến số" | "ô trống cần điền" | Lớp 4 |
| "thuật toán" | "các bước làm theo thứ tự" | Lớp 4 |
| "heuristic" | ❌ Không dùng | Không dùng ở cấp tiểu học |

### 3.2.3 Cách Giải Thích Thuật Ngữ Mới

🔴 **MUST** khi giới thiệu thuật ngữ mới lần đầu, áp dụng công thức **DEFINE-SHOW-USE**:

```
FORMAT GIỚI THIỆU THUẬT NGỮ:
┌─────────────────────────────────────────────────────────────┐
│  [Thuật ngữ] (in đậm + highlight)                           │
│  → DEFINE: "[Thuật ngữ] có nghĩa là [giải thích đơn giản]" │
│  → SHOW:   "[Ví dụ minh họa cụ thể bằng hình ảnh/số]"      │
│  → USE:    "Hãy thử dùng từ này: [câu hỏi áp dụng]"        │
└─────────────────────────────────────────────────────────────┘
```

**Ví dụ:**

> **Số chẵn** (số even)  
> 📖 *Số chẵn có nghĩa là* số chia đôi đều nhau, không còn thừa.  
> 👀 *Ví dụ:* 6 quả táo → 3 và 3 → Chia đều được → **Số chẵn!**  
> ✏️ *Thử xem:* 8 có phải số chẵn không? Tại sao?

🟡 **SHOULD** in đậm thuật ngữ mới lần đầu xuất hiện.  
🟡 **SHOULD** ghi kèm tiếng Anh trong ngoặc đơn nếu có từ tương đương chuẩn.

### 3.2.4 Tone & Voice: Thân Thiện Nhưng Chính Xác

🔴 **MUST** duy trì giọng văn theo tiêu chuẩn AvaB Voice:

| Chiều cạnh | Tiêu chuẩn AvaB | Ví dụ ĐẠT | Ví dụ KHÔNG ĐẠT |
|------------|-----------------|-----------|-----------------|
| Xưng hô | Dùng "mình/chúng mình" + "bạn" | "Hôm nay chúng mình học..." | "Học sinh cần biết..." |
| Cảm xúc | Khuyến khích, tích cực | "Tuyệt lắm! Hãy thử tiếp..." | "Nếu sai thì phải làm lại." |
| Chính xác | Không làm tròn quá mức | "6 chia 2 bằng 3" | "khoảng bằng 3" |
| Gần gũi | Liên hệ thực tế cuộc sống | "như khi chia bánh cho bạn bè" | "như trong định nghĩa toán học" |
| Khuyến khích | Dùng câu hỏi mở | "Em nghĩ tại sao?" | "Vì vậy, chúng ta thấy rằng..." |
| Tránh áp lực | Không dùng ngôn ngữ phán xét | "Thử lại nhé!" | "Sai rồi!" |

🟡 **SHOULD** kết thúc phần Concept bằng một câu hỏi nhẹ kích thích tư duy.

---

## 3.3 Illustration & Example Standard

### 3.3.1 Số Lượng Ví Dụ Tối Thiểu Theo Loại Bài

🔴 **MUST** đảm bảo số lượng ví dụ tối thiểu sau:

| Loại bài | Ví dụ minh họa (Examples) | Ví dụ phản (Counter-examples) | Tổng tối thiểu |
|----------|--------------------------|------------------------------|----------------|
| Khái niệm mới (New Concept) | 3 | 1 | 4 |
| Kỹ năng / Thủ thuật (Skill/Trick) | 2 | 1 | 3 |
| Ôn tập (Review) | 2 | 0 | 2 |
| Nâng cao / Thách thức (Advanced) | 2 | 2 | 4 |
| Bài dự thi IMC/IMAS | 3 | 2 | 5 |

🟡 **SHOULD** sắp xếp ví dụ từ dễ nhất đến khó nhất trong một bài.

### 3.3.2 Progression: CPA Method (Concrete → Pictorial → Abstract)

🔴 **MUST** áp dụng trình tự CPA cho mọi khái niệm toán học mới:

```
CPA PROGRESSION MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCRETE (Cụ thể - Thao tác vật lý)
  │  Mô tả bằng ngôn ngữ vật thể thực
  │  Ví dụ: "3 quả táo + 2 quả táo = 5 quả táo"
  │  Hình thức: câu chuyện, tình huống thực tế
  ▼
PICTORIAL (Hình ảnh - Biểu diễn hình học)
  │  Mô tả bằng hình ảnh, sơ đồ, biểu đồ
  │  Ví dụ: [🍎🍎🍎] + [🍎🍎] = [🍎🍎🍎🍎🍎]
  │  Hình thức: hình vẽ, số line, thanh bar, mô hình
  ▼
ABSTRACT (Trừu tượng - Ký hiệu toán học)
     Ký hiệu toán học thuần túy
     Ví dụ: 3 + 2 = 5
     Hình thức: phương trình, công thức, biểu thức
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Quy định áp dụng CPA theo độ tuổi:**

| Độ tuổi | C | P | A | Ghi chú |
|---------|---|---|---|---------|
| 5–6 tuổi | 🔴 MUST | 🔴 MUST | 🟡 SHOULD | Ưu tiên C+P |
| 7–8 tuổi | 🟡 SHOULD | 🔴 MUST | 🔴 MUST | Cân bằng P+A |
| 9–10 tuổi | 🟢 MAY | 🟡 SHOULD | 🔴 MUST | Ưu tiên A |

### 3.3.3 Format Ví Dụ Chuẩn: Context → Steps → Explanation → Check

🔴 **MUST** mọi ví dụ được trình bày (worked example) tuân theo cấu trúc 4 bước:

```
┌──────────────────────────────────────────────────────────────┐
│  WORKED EXAMPLE FORMAT                                       │
├──────────────────────────────────────────────────────────────┤
│  📌 CONTEXT                                                  │
│     Tình huống / đề bài cụ thể bằng ngôn ngữ đời thường     │
│     Ví dụ: "Lan có 12 cái kẹo, chia đều cho 3 bạn."         │
├──────────────────────────────────────────────────────────────┤
│  📝 SOLUTION STEPS (đánh số thứ tự)                         │
│     Bước 1: [Hành động cụ thể]                               │
│     Bước 2: [Hành động tiếp theo]                            │
│     Bước 3: [Kết quả]                                        │
├──────────────────────────────────────────────────────────────┤
│  💡 EXPLANATION                                              │
│     "Tại sao mình làm vậy?" → Giải thích ngắn gọn           │
│     Liên kết với khái niệm đã học                            │
├──────────────────────────────────────────────────────────────┤
│  ✅ CHECK                                                     │
│     Cách kiểm tra kết quả                                    │
│     "Thử lại: 4 × 3 = 12 ✓ Đúng rồi!"                      │
└──────────────────────────────────────────────────────────────┘
```

**Ví dụ thực tế áp dụng (Bài chia đều, Lớp 2):**

> 📌 **Context:** Lan có 12 cái kẹo, muốn chia đều cho 3 bạn. Mỗi bạn nhận được bao nhiêu cái?
>
> 📝 **Bước 1:** Mình cần chia 12 cho 3.  
> **Bước 2:** 12 ÷ 3 = ?  
> **Bước 3:** Đếm: 3, 6, 9, 12 → nhảy 4 lần → mỗi bạn được **4 cái kẹo**.
>
> 💡 **Giải thích:** Chia đều nghĩa là mỗi nhóm có số lượng bằng nhau. Mình dùng phép chia để tính.
>
> ✅ **Kiểm tra:** 4 × 3 = 12 ✓ → Đúng!

### 3.3.4 Counter-Example Requirements (Ví Dụ Phản)

🔴 **MUST** có ít nhất 1 counter-example trong mọi bài giới thiệu khái niệm mới.

**Mục đích của Counter-example:**
- Làm rõ ranh giới của khái niệm
- Giúp trẻ không over-generalize (khái quát hóa quá mức)
- Xây dựng tư duy phê phán

🔴 **MUST** counter-example có cấu trúc:

```
COUNTER-EXAMPLE FORMAT:
❌ [Tình huống trông giống nhưng KHÔNG thỏa mãn định nghĩa]
→ Lý do: [Giải thích tại sao không phải]
→ So sánh: [Điểm khác biệt với ví dụ đúng]
```

**Ví dụ:**

> ❌ 7 là số **không** chẵn  
> → Vì 7 ÷ 2 = 3 dư **1** (có phần dư!)  
> → Khác 6: 6 ÷ 2 = 3 dư **0** (không có phần dư)

---

## 3.4 Common Mistakes Section (Phần Sai Lầm Thường Gặp)

### 3.4.1 Quy Định Bắt Buộc

🔴 **MUST** có mục "Sai Lầm Thường Gặp" trong mọi Theory Block của bài giới thiệu khái niệm mới.  
🟡 **SHOULD** có mục này trong bài ôn tập nếu khái niệm có nhiều lỗi phổ biến.  
🟢 **MAY** bỏ qua trong bài review đơn giản hoặc bài thực hành thuần túy.

### 3.4.2 Số Lượng

| Loại bài | Số sai lầm tối thiểu | Số sai lầm tối đa |
|----------|---------------------|------------------|
| Khái niệm mới | 2 | 4 |
| Kỹ năng | 1 | 3 |
| Ôn tập | 1 | 2 |

### 3.4.3 Format Chuẩn: Mistake → Why → How to Avoid

🔴 **MUST** mỗi mục sai lầm theo đúng format 3 phần:

```
┌──────────────────────────────────────────────────────────────┐
│  COMMON MISTAKE FORMAT                                       │
├──────────────────────────────────────────────────────────────┤
│  ⚠️ SAI LẦM: [Mô tả lỗi cụ thể với ví dụ số/chữ]           │
│                                                              │
│  🤔 TẠI SAO MẮC LỖI:                                        │
│     [Giải thích tâm lý / nguyên nhân nhận thức]             │
│     [Không phê phán — không dùng "học sinh lười biếng"]      │
│                                                              │
│  ✅ CÁCH TRÁNH:                                               │
│     [Chiến lược cụ thể, có thể áp dụng ngay]                │
│     [Câu thần chú / mẹo nhớ nếu có]                         │
└──────────────────────────────────────────────────────────────┘
```

**Ví dụ thực tế (Bài nhân với 0, Lớp 2):**

> ⚠️ **SAI LẦM:** Nghĩ rằng 5 × 0 = 5
>
> 🤔 **TẠI SAO MẮC LỖI:** Trẻ thường nhớ "nhân thì số tăng lên", nên hay giữ nguyên số ban đầu khi nhân với 0. Ngoài ra, trẻ hay nhầm với cộng: 5 + 0 = 5.
>
> ✅ **CÁCH TRÁNH:** Hãy nghĩ: "0 có nghĩa là không có gì. 5 nhóm × 0 = không có gì cả!" Luôn dùng hình ảnh: 5 cái rổ, mỗi rổ 0 quả → tổng cộng 0 quả.

---

## 3.5 Thinking Tips (Mẹo Tư Duy)

### 3.5.1 Số Lượng

🔴 **MUST NOT** có quá 3 Thinking Tips trong một Theory Block.  
🔴 **MUST** mỗi tip phải liên quan trực tiếp đến khái niệm đang học.

### 3.5.2 Khi Nào MUST Có vs SHOULD Có

| Tình huống | Quy định |
|-----------|----------|
| Khái niệm mới có cách nhớ tắt (shortcut) | 🔴 MUST |
| Bài thi tư duy (IMC/IMAS level) | 🔴 MUST có ít nhất 1 tip chiến lược |
| Kỹ năng tính toán cơ bản | 🟡 SHOULD |
| Bài ôn tập | 🟢 MAY |
| Bài thực hành đơn giản | 🟢 MAY |

### 3.5.3 Format Chuẩn

🔴 **MUST** mỗi Thinking Tip theo format:

```
💡 MẸO [số]: [Tiêu đề mẹo ngắn gọn]
   [Nội dung mẹo: 1–2 câu, ngắn gọn, dễ nhớ]
   [Ví dụ áp dụng: 1 dòng]
```

**Ví dụ:**

> 💡 **MẸO 1:** Nhìn chữ số hàng đơn vị!  
>    Muốn biết số chẵn hay lẻ, chỉ cần nhìn chữ số cuối cùng.  
>    *Ví dụ: 2,847 → chữ số cuối là 7 → Số lẻ!*
>
> 💡 **MẸO 2:** Đếm theo cặp!  
>    Ghép thành từng đôi, nếu còn thừa 1 → số lẻ.  
>    *Ví dụ: 5 ngôi sao → ★★|★★|★ → còn 1 sao → Số lẻ!*

---

## 3.6 Theory QA Checklist

> **Cách dùng:** Author tự kiểm tra trước khi submit. Reviewer phải verify độc lập. ✅ = Đạt | ❌ = Cần sửa

### 📋 THEORY QA CHECKLIST v1.0

**NHÓM A — Cấu Trúc & Độ Dài**
- [ ] A1. Theory Block có đủ 5 phần: Hook → Concept → Example → Counter-Example → Summary
- [ ] A2. Độ dài nằm trong giới hạn cho phép theo độ tuổi (xem bảng 3.1.1)
- [ ] A3. Không có đoạn văn nào vượt quá giới hạn số câu/số từ (xem bảng 3.1.2)
- [ ] A4. Độ phức tạp câu phù hợp cấp lớp (xem bảng 3.1.4)
- [ ] A5. Hook kết nối với thực tế/tình huống quen thuộc của trẻ

**NHÓM B — Ngôn Ngữ & Tone**
- [ ] B1. Không có jargon không được phép theo cấp lớp
- [ ] B2. Mọi thuật ngữ mới được giải thích theo format DEFINE-SHOW-USE
- [ ] B3. Tone thân thiện, không phán xét, khuyến khích
- [ ] B4. Xưng hô đúng chuẩn AvaB Voice (mình/chúng mình + bạn)
- [ ] B5. Không có câu passive phức tạp cho lứa tuổi dưới 8

**NHÓM C — Ví Dụ & Minh Họa**
- [ ] C1. Đủ số lượng ví dụ tối thiểu theo loại bài (xem bảng 3.3.1)
- [ ] C2. Ví dụ tuân theo CPA progression phù hợp độ tuổi
- [ ] C3. Worked examples có đủ 4 phần: Context → Steps → Explanation → Check
- [ ] C4. Có ít nhất 1 counter-example cho bài khái niệm mới
- [ ] C5. Ví dụ được sắp xếp từ dễ đến khó

**NHÓM D — Common Mistakes**
- [ ] D1. Có mục "Sai Lầm Thường Gặp" (MUST cho bài khái niệm mới)
- [ ] D2. Mỗi sai lầm có đủ 3 phần: Mistake → Why → How to Avoid
- [ ] D3. Ngôn ngữ không phê phán học sinh
- [ ] D4. Số lượng sai lầm trong giới hạn (2–4 cho khái niệm mới)

**NHÓM E — Thinking Tips**
- [ ] E1. Không quá 3 Thinking Tips
- [ ] E2. Mỗi tip theo format chuẩn (💡 + tiêu đề + nội dung + ví dụ)
- [ ] E3. Tips liên quan trực tiếp đến bài học
- [ ] E4. MUST tips có mặt khi bắt buộc (xem bảng 3.5.2)

**NHÓM F — Tổng Thể**
- [ ] F1. Summary có thể đứng độc lập để ôn bài
- [ ] F2. Không có thông tin mâu thuẫn giữa các phần
- [ ] F3. Factual accuracy: tất cả ví dụ số đúng về mặt toán học
- [ ] F4. Ngữ pháp và chính tả tiếng Việt đúng chuẩn

> **Ngưỡng pass:** A1–A5, B1–B5, C1–C5 phải đạt 100%. D1 đạt cho bài khái niệm mới. Tổng tối thiểu 18/22 tiêu chí để pass.

---

# PHẦN 4: EXERCISE STANDARD

> **Mục tiêu phần này:** Định nghĩa đầy đủ, chuẩn hóa tất cả loại bài tập trong hệ thống AvaB, quy định cách sử dụng, format dữ liệu, và grading logic cho từng loại.

---

## 4.1 Exercise Type Taxonomy (Phân Loại Bài Tập)

### 4.1.1 Bảng Tổng Quan Tất Cả Loại Bài Tập

| Mã | Type (Tên kỹ thuật) | Tên tiếng Việt | Độ tuổi tối thiểu | Môn phù hợp | Input method | Scoring |
|----|---------------------|---------------|------------------|-------------|-------------|---------|
| MC | MULTIPLE_CHOICE | Trắc nghiệm 1 đáp án | 5+ | Tất cả | Tap/Click | Auto |
| MS | MULTI_SELECT | Trắc nghiệm nhiều đáp án | 7+ | Tất cả | Tap/Click | Auto (partial) |
| TF | TRUE_FALSE | Đúng/Sai | 5+ | Tất cả | Toggle | Auto |
| FB | FILL_BLANK | Điền từ | 6+ | Anh, Văn | Keyboard | Auto + Fuzzy |
| NI | NUMBER_INPUT | Điền số | 6+ | Toán, Khoa học | Numeric keyboard | Auto (exact/range) |
| SA | SHORT_ANSWER | Trả lời ngắn | 7+ | Tất cả | Keyboard | Semi-auto |
| OQ | OPEN | Tự luận | 8+ | Tất cả | Keyboard | Manual/AI-assist |
| MA | MATCHING | Nối | 5+ | Tất cả | Drag/Line | Auto |
| OR | ORDERING | Sắp xếp | 6+ | Tất cả | Drag | Auto |
| SW | SORT_WORDS | Sắp xếp từ thành câu | 7+ | Anh, Văn | Tap/Drag | Auto |
| GC | GROUP_CLASSIFY | Phân loại nhóm | 6+ | Toán, Sinh, Địa | Drag/Drop | Auto (partial) |
| MB | MULTI_BLANK | Nhiều chỗ trống | 8+ | Anh, Văn, Lý | Keyboard | Auto |
| CD | CODE | Viết code | 9+ | Tin học | Code editor | Auto (test cases) |
| OP | OUTPUT_PREDICT | Dự đoán output | 9+ | Tin học | Keyboard/Select | Auto |
| DD | DRAG_DROP | Kéo thả | 5+ | Tất cả | Touch/Mouse | Auto |
| TL | TIMELINE | Thứ tự thời gian | 7+ | Sử, Địa, Khoa học | Drag | Auto |
| DR | DRAWING | Vẽ/Phác thảo | 6+ | Toán, Nghệ thuật | Touch/Stylus | Manual/AI |

---

## 4.2 Quy Định Chi Tiết Cho Từng Loại Bài Tập

---

### 4.2.1 MC — MULTIPLE_CHOICE (Trắc Nghiệm 1 Đáp Án)

**Mục tiêu sư phạm:** Kiểm tra nhận diện, phân biệt, và áp dụng kiến thức một cách nhanh chóng.

**Khi nào PHẢI dùng (MUST):**
- Câu hỏi kiểm tra định nghĩa, khái niệm
- Câu hỏi có một đáp án đúng rõ ràng
- Câu hỏi warm-up đầu bài

**Khi nào KHÔNG nên dùng (MUST NOT):**
- Câu hỏi cần giải thích quá trình tư duy
- Câu hỏi có nhiều hơn 1 đáp án đúng → dùng MS
- Câu yêu cầu tính toán phức tạp → dùng NI

**Format dữ liệu chuẩn:**
```json
{
  "type": "MC",
  "question": "Số nào là số chẵn?",
  "options": ["3", "5", "6", "7"],
  "correctAnswer": "6",
  "explanation": "6 chia 2 bằng 3, không có phần dư → số chẵn",
  "difficulty": "easy",
  "timeLimit": 30
}
```

**Grading logic:** `score = correctAnswer === studentAnswer ? maxScore : 0`

**Quy định options:**
- 🔴 MUST: 4 options cho Lớp 2+; 3 options cho MN–Lớp 1
- 🔴 MUST: Distractors (đáp án bẫy) phải hợp lý, không quá lộ liễu
- ❌ MUST NOT: Options "Tất cả đều đúng" / "Không có đáp án nào" cho lứa tuổi dưới 9
- 🟡 SHOULD: Randomize thứ tự options khi hiển thị

**Câu hỏi mẫu (Lớp 1):**
> Số nào có thể chia đôi mà không còn thừa?  
> A) 3  B) 7  C) 8  D) 9

**Anti-pattern thường gặp:**
- ❌ Có 2 options đúng nhưng chỉ mark 1 → phải dùng MS
- ❌ Options quá ngắn "Đ" "S" → dùng TF thay thế
- ❌ Question stem quá dài (>30 từ) cho lứa tuổi dưới 7

---

### 4.2.2 MS — MULTI_SELECT (Trắc Nghiệm Nhiều Đáp Án)

**Mục tiêu sư phạm:** Kiểm tra khả năng phân tích và nhận diện nhiều trường hợp thỏa mãn điều kiện.

**Khi nào PHẢI dùng:**
- Câu hỏi có từ 2 đáp án đúng trở lên
- Câu "Chọn TẤT CẢ..." / "Đánh dấu những..."

**Khi nào KHÔNG nên dùng:**
- Cho độ tuổi dưới 7 (nhận thức chưa đủ cho multi-select)
- Khi chỉ có đúng 1 đáp án → dùng MC

**Format dữ liệu chuẩn:**
```json
{
  "type": "MS",
  "question": "Chọn TẤT CẢ các số chẵn trong danh sách:",
  "options": ["2", "5", "8", "11", "14"],
  "correctAnswers": ["2", "8", "14"],
  "partialCredit": true,
  "explanation": "Số chẵn tận cùng bằng 0, 2, 4, 6, hoặc 8"
}
```

**Grading logic:**
```
Partial credit (recommended):
  score = (correctly_selected - incorrectly_selected) / total_correct × maxScore
  min(score, 0) — không cho điểm âm
  
All-or-nothing (strict):
  score = arrays_match(correctAnswers, studentAnswers) ? maxScore : 0
```

🟡 **SHOULD** dùng partial credit cho MS để tránh discourage học sinh.

**Anti-pattern:**
- ❌ Không ghi rõ "Chọn tất cả" → học sinh chỉ chọn 1
- ❌ Số lượng đáp án đúng chiếm >70% tổng options → quá dễ đoán
- ❌ Dùng cho lứa tuổi 5–6

---

### 4.2.3 TF — TRUE_FALSE (Đúng/Sai)

**Mục tiêu sư phạm:** Kiểm tra nhanh hiểu biết về phát biểu đúng/sai.

**Khi nào PHẢI dùng:**
- Câu kiểm tra nhanh (quick check)
- Phát biểu có thể xác định rõ đúng/sai
- Bài warm-up hoặc exit ticket

**Khi nào KHÔNG nên dùng:**
- Phát biểu có điều kiện phức tạp
- Phát biểu mơ hồ có thể đúng hoặc sai tùy ngữ cảnh

**Format dữ liệu chuẩn:**
```json
{
  "type": "TF",
  "statement": "24 là số chẵn.",
  "correctAnswer": true,
  "explanation": "24 tận cùng bằng 4 → số chẵn"
}
```

🟡 **SHOULD** tỷ lệ True:False không quá lệch (không quá 70:30).

**Anti-pattern:**
- ❌ Dùng phủ định đôi "Không phải không phải số chẵn" → gây nhầm lẫn
- ❌ Toàn bộ set đều là True hoặc đều là False

---

### 4.2.4 FB — FILL_BLANK (Điền Từ)

**Mục tiêu sư phạm:** Kiểm tra nhớ và sản xuất ngôn ngữ (production), không chỉ nhận diện.

**Khi nào PHẢI dùng:**
- Bài Anh Văn: từ vựng, ngữ pháp cần điền vào câu
- Câu hoàn chỉnh cần 1 từ/cụm từ

**Format dữ liệu chuẩn:**
```json
{
  "type": "FB",
  "template": "I ___ to school every day.",
  "correctAnswers": ["go", "walk"],
  "fuzzyMatch": true,
  "caseSensitive": false,
  "hint": "Động từ đi đến"
}
```

**Grading logic:**
- Exact match hoặc fuzzy match (levenshtein distance ≤ 1 cho lỗi typo nhỏ)
- `caseSensitive: false` cho tiếng Anh cơ bản

**Anti-pattern:**
- ❌ Câu quá ngắn, có thể điền nhiều từ khác nhau mà không capture được
- ❌ Không có `fuzzyMatch` → penalize học sinh vì lỗi đánh máy nhỏ

---

### 4.2.5 NI — NUMBER_INPUT (Điền Số)

**Mục tiêu sư phạm:** Kiểm tra kết quả tính toán chính xác.

**Khi nào PHẢI dùng:**
- Câu yêu cầu kết quả số cụ thể
- Bài toán tính toán

**Format dữ liệu chuẩn:**
```json
{
  "type": "NI",
  "question": "5 × 6 = ?",
  "correctAnswer": 30,
  "tolerance": 0,
  "unit": "",
  "allowDecimal": false
}
```

**Grading:** Exact match hoặc range `[correctAnswer - tolerance, correctAnswer + tolerance]`

**Anti-pattern:**
- ❌ Không chỉ định `unit` khi cần (ví dụ: cm, kg)
- ❌ Dùng NI cho câu có nhiều bước trung gian → mất context tư duy

---

### 4.2.6 SA — SHORT_ANSWER (Trả Lời Ngắn)

**Mục tiêu sư phạm:** Kiểm tra khả năng giải thích và diễn đạt ngắn gọn.

**Giới hạn độ dài:**

| Độ tuổi | Số từ tối đa |
|---------|-------------|
| 7–8 tuổi | 30 từ |
| 9–10 tuổi | 60 từ |

**Format dữ liệu:**
```json
{
  "type": "SA",
  "question": "Tại sao 7 là số lẻ? Giải thích bằng lời của em.",
  "rubric": {
    "keywords": ["chia 2", "còn dư", "phần dư"],
    "minKeywords": 1,
    "maxWords": 30
  },
  "sampleAnswer": "7 là số lẻ vì khi chia 7 cho 2 còn dư 1."
}
```

**Anti-pattern:**
- ❌ Không có rubric rõ ràng → grading không nhất quán
- ❌ Dùng cho lứa tuổi dưới 7

---

### 4.2.7 OQ — OPEN (Tự Luận)

**Mục tiêu sư phạm:** Phát triển tư duy sâu, lập luận toán học, sáng tạo.

🔴 **MUST** có rubric chi tiết với ít nhất 3 tiêu chí đánh giá.

**Format dữ liệu:**
```json
{
  "type": "OQ",
  "question": "Em hãy nghĩ ra một bài toán về số chẵn và giải nó.",
  "rubric": {
    "criteria": [
      {"name": "Bài toán hợp lý", "maxScore": 3},
      {"name": "Lời giải đúng", "maxScore": 4},
      {"name": "Trình bày rõ ràng", "maxScore": 3}
    ],
    "totalScore": 10
  },
  "gradingMethod": "manual",
  "aiAssist": true
}
```

**Anti-pattern:**
- ❌ Dùng OQ mà không chuẩn bị rubric → không chấm được nhất quán
- ❌ Dùng cho lứa tuổi dưới 8

---

### 4.2.8 MA — MATCHING (Nối)

**Mục tiêu sư phạm:** Kiểm tra khả năng liên kết, phân loại theo cặp.

**Format dữ liệu:**
```json
{
  "type": "MA",
  "instruction": "Nối số với tên của nó:",
  "leftItems": ["2", "4", "6"],
  "rightItems": ["Số chẵn nhỏ nhất", "2 × 2", "2 × 3"],
  "correctPairs": [
    {"left": "2", "right": "Số chẵn nhỏ nhất"},
    {"left": "4", "right": "2 × 2"},
    {"left": "6", "right": "2 × 3"}
  ]
}
```

🟡 **SHOULD** số lượng items mỗi cột không quá 6 cho lứa tuổi dưới 8.

**Anti-pattern:**
- ❌ Left items = Right items (1:1 obvious) → quá dễ
- ❌ Quá 8 items mỗi cột → quá tải nhận thức

---

### 4.2.9 OR — ORDERING (Sắp Xếp)

**Mục tiêu sư phạm:** Kiểm tra hiểu biết về thứ tự, trình tự logic.

**Format dữ liệu:**
```json
{
  "type": "OR",
  "instruction": "Sắp xếp các số từ nhỏ đến lớn:",
  "items": ["15", "3", "27", "9"],
  "correctOrder": ["3", "9", "15", "27"],
  "direction": "ascending"
}
```

**Anti-pattern:**
- ❌ Quá 7 items → quá tải nhận thức cho lứa tuổi dưới 9
- ❌ Không chỉ định direction (ascending/descending/custom)

---

### 4.2.10 SW — SORT_WORDS (Sắp Xếp Từ Thành Câu)

**Mục tiêu sư phạm:** Kiểm tra hiểu biết cú pháp và ngữ nghĩa.

**Format dữ liệu:**
```json
{
  "type": "SW",
  "instruction": "Sắp xếp thành câu đúng:",
  "words": ["school", "I", "to", "go", "every", "day"],
  "correctSentence": "I go to school every day",
  "acceptVariants": ["I go to school everyday"]
}
```

**Anti-pattern:**
- ❌ Không có `acceptVariants` → penalize các cấu trúc đúng khác
- ❌ Quá 10 từ cho lứa tuổi dưới 8

---

### 4.2.11 GC — GROUP_CLASSIFY (Phân Loại Nhóm)

**Mục tiêu sư phạm:** Phân loại đối tượng vào các nhóm theo tiêu chí.

**Format dữ liệu:**
```json
{
  "type": "GC",
  "instruction": "Phân loại các số vào nhóm Chẵn hoặc Lẻ:",
  "items": ["2", "5", "8", "11", "14"],
  "groups": ["Số Chẵn", "Số Lẻ"],
  "correctClassification": {
    "Số Chẵn": ["2", "8", "14"],
    "Số Lẻ": ["5", "11"]
  },
  "partialCredit": true
}
```

**Anti-pattern:**
- ❌ Không có `partialCredit` → học sinh phân loại đúng 80% mà được 0 điểm
- ❌ Quá 4 nhóm cho lứa tuổi dưới 8

---

### 4.2.12 MB — MULTI_BLANK (Nhiều Chỗ Trống)

**Mục tiêu sư phạm:** Kiểm tra hiểu biết ngữ cảnh và khả năng điền thông tin vào nhiều vị trí liên quan.

**Format dữ liệu:**
```json
{
  "type": "MB",
  "template": "Nước Việt Nam có ___ miền. Miền Bắc có thành phố ___, miền Nam có thành phố ___.",
  "blanks": [
    {"id": 1, "correctAnswer": "3"},
    {"id": 2, "correctAnswers": ["Hà Nội"]},
    {"id": 3, "correctAnswers": ["Hồ Chí Minh", "TP.HCM"]}
  ],
  "scoringMode": "per-blank"
}
```

**Anti-pattern:**
- ❌ Quá 5 chỗ trống trong 1 câu → quá phức tạp
- ❌ Dùng cho lứa tuổi dưới 8

---

### 4.2.13 CD — CODE (Viết Code)

**Mục tiêu sư phạm:** Phát triển tư duy lập trình, kỹ năng giải quyết vấn đề qua code.

**Format dữ liệu:**
```json
{
  "type": "CD",
  "language": "python|scratch|javascript",
  "question": "Viết code in ra các số từ 1 đến 10.",
  "starterCode": "# Viết code của em ở đây\n",
  "testCases": [
    {"input": null, "expectedOutput": "1\n2\n3\n4\n5\n6\n7\n8\n9\n10"}
  ],
  "sandbox": true,
  "timeoutMs": 3000
}
```

**Anti-pattern:**
- ❌ Không có sandbox → security risk
- ❌ Không có test cases → không auto-grade được
- ❌ Dùng cho lứa tuổi dưới 9

---

### 4.2.14 OP — OUTPUT_PREDICT (Dự Đoán Output)

**Mục tiêu sư phạm:** Phát triển khả năng đọc hiểu code và trace execution.

**Format dữ liệu:**
```json
{
  "type": "OP",
  "code": "x = 5\ny = x * 2\nprint(y)",
  "language": "python",
  "correctOutput": "10",
  "question": "Đoạn code này sẽ in ra gì?"
}
```

---

### 4.2.15 DD — DRAG_DROP (Kéo Thả)

**Mục tiêu sư phạm:** Tương tác trực quan, phù hợp lứa tuổi nhỏ.

**Format dữ liệu:**
```json
{
  "type": "DD",
  "instruction": "Kéo số vào ô phép tính đúng:",
  "draggables": ["3", "5", "8"],
  "dropZones": [
    {"id": "z1", "label": "_ + 5 = 8", "correctItem": "3"},
    {"id": "z2", "label": "3 + _ = 8", "correctItem": "5"}
  ]
}
```

**Anti-pattern:**
- ❌ Quá 8 draggable items trên màn hình cùng lúc
- ❌ Drop zones quá nhỏ trên mobile → UX issue

---

### 4.2.16 TL — TIMELINE (Thứ Tự Thời Gian)

**Mục tiêu sư phạm:** Hiểu trình tự lịch sử, quan hệ nhân quả theo thời gian.

**Format dữ liệu:**
```json
{
  "type": "TL",
  "instruction": "Sắp xếp các sự kiện theo thứ tự thời gian:",
  "events": [
    {"id": "e1", "label": "Độc lập 1945", "year": 1945},
    {"id": "e2", "label": "Thống nhất 1975", "year": 1975},
    {"id": "e3", "label": "Đổi Mới 1986", "year": 1986}
  ],
  "correctOrder": ["e1", "e2", "e3"],
  "showYears": false
}
```

---

### 4.2.17 DR — DRAWING (Vẽ/Phác Thảo)

**Mục tiêu sư phạm:** Phát triển tư duy hình học, biểu đạt sáng tạo.

**Format dữ liệu:**
```json
{
  "type": "DR",
  "instruction": "Vẽ một hình chữ nhật có chiều dài gấp đôi chiều rộng.",
  "canvas": {
    "width": 400,
    "height": 300,
    "grid": true,
    "gridSize": 20
  },
  "gradingMethod": "manual",
  "rubric": {
    "criteria": ["Đúng hình chữ nhật", "Tỷ lệ chiều dài:rộng ≈ 2:1"],
    "maxScore": 5
  }
}
```

---

## 4.3 Exercise Composition Rules (Quy Tắc Phân Bổ Bài Tập)

### 4.3.1 Phân Bổ Loại Bài Trong Một Bài Học (In-Class Practice)

🔴 **MUST** tuân thủ phân bổ sau cho exercise set trong bài học:

| Giai đoạn bài học | Loại bài ưu tiên | Tỷ lệ |
|------------------|-----------------|-------|
| Warm-up (khởi động) | MC, TF | 20% |
| Guided Practice (thực hành có hướng dẫn) | NI, MA, DD, OR | 40% |
| Independent Practice (thực hành độc lập) | MC, NI, GC, SW | 30% |
| Exit Ticket (kiểm tra cuối) | MC, TF, NI | 10% |

### 4.3.2 Phân Bổ Loại Bài Theo Cấp Lớp

| Cấp | Loại được phép | Loại ưu tiên |
|-----|----------------|-------------|
| MN–Lớp 1 | MC, TF, MA, DD | DD, MA, TF |
| Lớp 2 | MC, TF, MA, DD, OR, NI, FB | MC, NI, MA |
| Lớp 3 | Tất cả trừ CD, OP, OQ | MC, NI, GC, OR |
| Lớp 4+ | Tất cả | MC, NI, SA, CD |

### 4.3.3 Progressive Difficulty Rules

🔴 **MUST** áp dụng quy tắc sau cho mọi exercise set:

```
DIFFICULTY PROGRESSION:
  Câu 1–30% đầu  → Easy    (Bloom's: Remember/Understand)
  Câu 31–70%     → Medium  (Bloom's: Apply/Analyze)
  Câu 71–100%    → Hard    (Bloom's: Evaluate/Create)

  Không được xáo trộn: Hard câu đầu, Easy câu cuối
```

**Tỷ lệ khó theo cấp:**

| Cấp | Easy | Medium | Hard |
|-----|------|--------|------|
| MN–Lớp 1 | 70% | 25% | 5% |
| Lớp 2 | 60% | 30% | 10% |
| Lớp 3 | 50% | 35% | 15% |
| Lớp 4–5 | 40% | 40% | 20% |
| IMC/IMAS Prep | 20% | 40% | 40% |

### 4.3.4 Variety Requirements (Yêu Cầu Đa Dạng)

🔴 **MUST NOT** lặp lại cùng 1 loại bài quá 3 câu liên tiếp.

🟡 **SHOULD** trong 1 exercise set (10 câu), có tối thiểu 3 loại bài khác nhau.

🟡 **SHOULD** xen kẽ visual-based (DD, MA, DR) với text-based (MC, NI, SA).

❌ **MUST NOT** toàn bộ bài học chỉ dùng MC.

---

## 4.4 Exercise QA Checklist

### 📋 EXERCISE QA CHECKLIST v1.0

**NHÓM A — Type Correctness**
- [ ] A1. Loại bài tập phù hợp với độ tuổi (xem bảng 4.1.1)
- [ ] A2. Loại bài tập phù hợp với môn học
- [ ] A3. Không dùng loại bị cấm cho độ tuổi đó
- [ ] A4. Format dữ liệu JSON đúng chuẩn theo spec từng loại

**NHÓM B — Content Quality**
- [ ] B1. Câu hỏi rõ ràng, không mơ hồ
- [ ] B2. Đáp án đúng về mặt học thuật (factual accuracy)
- [ ] B3. Distractors (MC) hợp lý, không quá lộ liễu
- [ ] B4. Có explanation cho mọi câu (ít nhất 1 câu giải thích)
- [ ] B5. Độ khó câu hỏi phù hợp với label (easy/medium/hard)

**NHÓM C — Composition**
- [ ] C1. Phân bổ loại bài theo đúng tỷ lệ bài học (xem 4.3.1)
- [ ] C2. Difficulty progression đúng thứ tự (easy trước, hard sau)
- [ ] C3. Không lặp quá 3 câu cùng loại liên tiếp
- [ ] C4. Có ít nhất 3 loại bài khác nhau trong set 10 câu
- [ ] C5. Tỷ lệ easy/medium/hard đúng theo cấp (xem bảng 4.3.3)

**NHÓM D — Grading Logic**
- [ ] D1. Grading method được chỉ định (auto/semi-auto/manual)
- [ ] D2. Partial credit được cấu hình đúng cho MS, GC
- [ ] D3. Rubric đầy đủ cho OQ và DR
- [ ] D4. Test cases đầy đủ cho CD

**NHÓM E — UX/Accessibility**
- [ ] E1. Câu hỏi đọc được không vượt quá complexity phù hợp
- [ ] E2. Instruction rõ ràng (đặc biệt cho DD, MA, GC)
- [ ] E3. Mobile-friendly (touch targets đủ lớn cho DD)
- [ ] E4. Time limit hợp lý nếu có

> **Ngưỡng pass:** A1–A4, B1–B4 phải đạt 100%. Tổng tối thiểu 16/20 để pass.

---

# PHẦN 5: HOMEWORK STANDARD

> **Mục tiêu phần này:** Định nghĩa triết lý, chuẩn mực định lượng, phân bổ nội dung, và quy định đáp án cho bài tập về nhà (Homework) trong hệ thống AvaB, đảm bảo hiệu quả học tập mà không gây áp lực.

---

## 5.1 Homework Design Principles (Nguyên Tắc Thiết Kế Bài Tập Về Nhà)

### 5.1.1 Triết Lý AvaB Về Homework

> **"Homework ở AvaB không phải là hình phạt hay gánh nặng. Đó là cầu nối giữa lớp học và cuộc sống."**

🔴 **MUST** mọi bài homework được thiết kế dựa trên 3 mục đích cốt lõi:

```
┌─────────────────────────────────────────────────────────────┐
│  3 MỤC ĐÍCH CỐT LÕI CỦA HOMEWORK TRONG AVAB               │
├──────────────────────────────────────────────────────────────┤
│  1. REINFORCEMENT (Củng cố)                                  │
│     Luyện tập lại kiến thức vừa học để chuyển từ            │
│     short-term → long-term memory.                          │
│     Tỷ lệ: 50–60% nội dung bài HW                          │
├──────────────────────────────────────────────────────────────┤
│  2. REVIEW (Ôn tập — Spaced Repetition)                      │
│     Ôn lại kiến thức đã học trước đó theo nguyên lý         │
│     spaced repetition để chống quên.                        │
│     Tỷ lệ: 25–35% nội dung bài HW                          │
├──────────────────────────────────────────────────────────────┤
│  3. DISCOVERY (Khám phá)                                     │
│     Câu hỏi mở, dự án nhỏ giúp trẻ tự khám phá             │
│     kiến thức mới trước bài học tiếp theo.                  │
│     Tỷ lệ: 10–15% nội dung bài HW                          │
└─────────────────────────────────────────────────────────────┘
```

### 5.1.2 Homework KHÔNG Phải Là

❌ **MUST NOT** thiết kế homework theo các mục đích sau:

| KHÔNG được dùng homework để | Lý do |
|-----------------------------|-------|
| Phạt học sinh làm nhiều bài hơn | Tạo cảm giác tiêu cực với học tập |
| Chứng minh "đã dạy nhiều" với phụ huynh | Quantity ≠ Quality |
| Luyện nhớ máy móc không có hiểu | Không phát triển tư duy |
| Kiểm tra kiến thức hoàn toàn chưa học | Frustration, không có base học |
| Buộc trẻ ngồi học quá thời gian cho phép | Stress, ảnh hưởng sức khỏe |

### 5.1.3 Homework = Learning Event, Not Compliance Event

🟡 **SHOULD** mọi bài homework có:
- Ít nhất 1 câu thú vị / game-like
- Ít nhất 1 câu liên hệ thực tế
- Không quá 20% câu thuần ghi nhớ máy móc (rote)

---

## 5.2 Quantitative Standards (Tiêu Chuẩn Định Lượng)

### 5.2.1 Số Câu Theo Cấp Lớp

🔴 **MUST** tuân thủ số câu sau (tổng mọi loại câu):

| Cấp | Số câu tối thiểu | Số câu tiêu chuẩn | Số câu tối đa | Ghi chú |
|-----|-----------------|------------------|---------------|---------|
| Mầm non | 3 | 5 | 7 | Chủ yếu DD, MA |
| Lớp 1 | 5 | 8 | 10 | Đa dạng MC, TF, MA |
| Lớp 2 | 7 | 10 | 13 | Thêm NI, OR |
| Lớp 3 | 8 | 12 | 15 | Thêm GC, SA |
| Lớp 4 | 10 | 15 | 18 | Thêm OQ optional |
| Lớp 5 | 12 | 15 | 20 | Đủ loại |

> **Ghi chú:** Câu bonus (optional challenge) KHÔNG tính vào giới hạn trên.

### 5.2.2 Phân Bổ Độ Khó: Easy/Medium/Hard Ratio

🔴 **MUST** tỷ lệ khó trong homework KHÁC với in-class exercise:

| Cấp | Easy | Medium | Hard | Ghi chú |
|-----|------|--------|------|---------|
| MN | 80% | 20% | 0% | Không có hard câu về nhà |
| Lớp 1 | 70% | 25% | 5% | Hard chỉ 1 câu max |
| Lớp 2 | 65% | 25% | 10% | |
| Lớp 3 | 55% | 30% | 15% | |
| Lớp 4 | 45% | 35% | 20% | |
| Lớp 5 | 40% | 40% | 20% | |
| IMC/IMAS Prep | 25% | 40% | 35% | Dành cho học sinh chọn lọc |

> **Lý do:** Homework làm ở nhà không có giáo viên hỗ trợ. Tỷ lệ Easy cao hơn để đảm bảo trẻ có trải nghiệm thành công (success experience).

### 5.2.3 Thời Lượng Làm Bài Tối Đa Theo Độ Tuổi

🔴 **MUST NOT** thiết kế homework vượt quá thời gian sau:

| Độ tuổi | Thời gian tối đa / ngày | Nguyên tắc tính |
|---------|------------------------|-----------------|
| 5 tuổi | 10 phút | Không quá 2 session × 5 phút |
| 6 tuổi | 15 phút | Có thể 1 session liên tục |
| 7 tuổi | 20 phút | Bao gồm đọc đề |
| 8 tuổi | 25 phút | |
| 9 tuổi | 30 phút | |
| 10 tuổi | 35 phút | |

🟡 **SHOULD** estimate thời gian khi thiết kế: mỗi câu Easy ≈ 1–2 phút, Medium ≈ 3–4 phút, Hard ≈ 5–8 phút.

**Cách tự kiểm tra:** Author làm bài trước, nhân 1.5× để ước tính thời gian trung bình của học sinh.

### 5.2.4 Tỷ Lệ Kiến Thức Mới vs Ôn Tập

🔴 **MUST** phân bổ theo bảng:

| Loại nội dung | Tỷ lệ (% số câu) | Mục đích |
|---------------|-----------------|----------|
| Kiến thức bài hôm nay (Reinforcement) | 50–60% | Củng cố |
| Kiến thức 1–2 tuần trước (Recent Review) | 20–25% | Spaced repetition |
| Kiến thức 1 tháng trước (Long-term Review) | 10–15% | Retention |
| Kiến thức mới (Discovery/Preview) | 5–10% | Kích thích tò mò |

---

## 5.3 Content Distribution (Phân Bổ Nội Dung)

### 5.3.1 Câu Ôn Tập — Spaced Repetition

🟡 **SHOULD** áp dụng hệ thống spaced repetition khi chọn câu ôn tập:

```
SPACED REPETITION SCHEDULE:
  Bài học ngày D:
  → HW ngày D:    60% câu về bài D, 25% bài D-7 đến D-14, 15% bài D-30+
  
  Ưu tiên ôn những khái niệm có success rate thấp (< 70% accuracy)
  Dùng performance data từ system nếu có
```

**Cách gắn tag spaced repetition:**
```json
{
  "reviewTag": {
    "concept": "số_chẵn_số_lẻ",
    "lastSeen": "2026-06-15",
    "daysSinceLearn": 19,
    "targetRetention": 0.85
  }
}
```

### 5.3.2 Câu Kiến Thức Mới (Reinforcement)

🔴 **MUST** câu reinforcement liên quan trực tiếp đến bài học hôm nay.

🟡 **SHOULD** câu reinforcement bao gồm:
- Ít nhất 1 câu dạng Application (áp dụng vào tình huống mới)
- Ít nhất 1 câu dạng word problem (bài toán có ngữ cảnh)

❌ **MUST NOT** toàn bộ reinforcement chỉ là drill thuần túy (ví dụ: 50 phép tính đơn thuần).

### 5.3.3 Câu Thách Thức — Optional Bonus

🔴 **MUST** đánh dấu rõ ràng là "optional" / "thử thách".

🔴 **MUST NOT** tính vào điểm bắt buộc.

🟡 **SHOULD** câu bonus:
- Có mức độ khó cao hơn ít nhất 1 bậc so với Hard thông thường
- Liên quan đến chuẩn IMC/IMAS nếu bài học thuộc track thi đấu
- Có gợi ý (hint) ẩn được reveal theo yêu cầu

**Format đánh dấu:**
```json
{
  "isBonus": true,
  "bonusLabel": "🌟 Thử Thách",
  "bonusPoints": 2,
  "hint": "Thử sắp xếp các số thành 2 nhóm trước..."
}
```

### 5.3.4 Câu Sáng Tạo — Project-Based

🟢 **MAY** có 1–2 câu project-based mỗi tuần (không phải mỗi bài).

**Các dạng project-based phù hợp:**

| Dạng | Ví dụ | Độ tuổi phù hợp |
|------|-------|-----------------|
| Math in Real Life | "Đếm số chẵn/lẻ trong nhà bếp của em" | 6–8 |
| Mini Investigation | "Hỏi 5 người thân tuổi của họ và phân loại chẵn/lẻ" | 7–9 |
| Create Your Own | "Em tự đặt 3 câu hỏi về số chẵn/lẻ" | 8–10 |
| Teach Someone | "Dạy một người trong gia đình bài học hôm nay" | 8+ |

🔴 **MUST** project-based có rubric đánh giá rõ ràng hoặc được giáo viên review.

---

## 5.4 Answer & Solution Standard (Chuẩn Đáp Án và Lời Giải)

### 5.4.1 Yêu Cầu Bắt Buộc Về Đáp Án

🔴 **MUST** mọi câu hỏi trong homework đều có đáp án (answer key).

🔴 **MUST** đáp án được verify bởi ít nhất 1 người khác với author (peer review).

🔴 **MUST** đáp án numeric được tính toán lại độc lập trước khi publish.

### 5.4.2 Lời Giải: Khi Nào Bắt Buộc, Khi Nào Optional

| Loại câu | Lời giải bắt buộc | Ghi chú |
|----------|------------------|---------|
| Hard (câu khó) | 🔴 MUST | Full solution steps |
| Medium (câu trung bình) | 🟡 SHOULD | Ít nhất key steps |
| Easy (câu dễ) | 🟢 MAY | Answer only có thể chấp nhận |
| Bonus/Challenge | 🔴 MUST | Full solution + explanation |
| OQ (Tự luận) | 🔴 MUST | Sample answer + rubric |
| CD (Code) | 🔴 MUST | Reference solution + comments |

### 5.4.3 Format Đáp Án Chuẩn

🔴 **MUST** cấu trúc answer key theo format:

```json
{
  "questionId": "hw_lesson_001_q03",
  "answer": {
    "value": 30,
    "unit": "quả cam",
    "acceptedForms": ["30", "ba mươi"]
  },
  "solution": {
    "steps": [
      "Bước 1: Xác định phép tính → 5 × 6",
      "Bước 2: 5 × 6 = 30",
      "Bước 3: Đơn vị: quả cam"
    ],
    "keyInsight": "Nhân số bằng cách cộng nhiều lần: 6+6+6+6+6 = 30",
    "commonMistake": "Quên ghi đơn vị"
  },
  "difficulty": "medium",
  "conceptTag": ["phép_nhân", "lớp_2"]
}
```

**Cho câu MC/TF (simplified format):**
```json
{
  "questionId": "hw_lesson_001_q01",
  "answer": "C",
  "explanation": "6 × 5 = 30, tận cùng bằng 0 → số chẵn"
}
```

### 5.4.4 Partial Credit (Chấm Điểm Từng Phần)

🟡 **SHOULD** áp dụng partial credit cho:

| Loại câu | Partial credit structure |
|----------|-------------------------|
| MS (Multi-select) | +1 điểm mỗi lựa chọn đúng, -0 cho sai |
| OQ (Tự luận) | Theo rubric tiêu chí (xem 4.2.7) |
| CD (Code) | Mỗi test case pass = phần điểm |
| MB (Multi-blank) | +điểm mỗi ô điền đúng |
| GC (Phân loại) | +điểm mỗi item phân loại đúng |

🔴 **MUST NOT** áp dụng negative scoring (điểm âm) cho homework của lứa tuổi dưới 10.

**Partial credit formula chuẩn:**
```
score = (correct_items / total_items) × max_score
score = max(0, score)  // Không cho điểm âm
score = round(score, 1)  // Làm tròn 1 chữ số thập phân
```

### 5.4.5 Cách Phát Đáp Án Cho Học Sinh

🔴 **MUST** tuân thủ timing phát đáp án:

| Thời điểm | Được phép |
|-----------|----------|
| Trong khi đang làm bài | ❌ MUST NOT |
| Sau khi nộp bài | 🔴 MUST (auto-release) |
| Trước deadline nộp bài | ❌ MUST NOT (trừ hint) |
| Hint (gợi ý) | 🟢 MAY sau N lần thử sai |

🟡 **SHOULD** hint system:
```
Câu dễ: Không có hint
Câu trung bình: 1 hint sau 2 lần sai
Câu khó: 2 hints (sau 2 lần + 4 lần sai)
Câu bonus: 3 hints progressive
```

---

## 5.5 Homework QA Checklist

### 📋 HOMEWORK QA CHECKLIST v1.0

**NHÓM A — Nguyên Tắc Thiết Kế**
- [ ] A1. Bài HW phục vụ ít nhất 1 trong 3 mục đích: Reinforcement / Review / Discovery
- [ ] A2. Không có câu thuần punishment hoặc rote-drill toàn bộ
- [ ] A3. Có ít nhất 1 câu liên hệ thực tế hoặc word problem
- [ ] A4. Có ít nhất 1 câu thú vị / engaging (không chỉ drill thuần túy)

**NHÓM B — Định Lượng**
- [ ] B1. Số câu trong giới hạn tối thiểu–tối đa theo cấp lớp (xem bảng 5.2.1)
- [ ] B2. Tỷ lệ Easy/Medium/Hard đúng theo cấp (xem bảng 5.2.2)
- [ ] B3. Ước tính thời gian không vượt giới hạn độ tuổi (xem bảng 5.2.3)
- [ ] B4. Author đã tự làm bài để verify timing

**NHÓM C — Phân Bổ Nội Dung**
- [ ] C1. Reinforcement (bài hôm nay): 50–60% số câu
- [ ] C2. Review (spaced repetition): 25–35% số câu
- [ ] C3. Discovery/bonus: 5–15% số câu
- [ ] C4. Câu bonus được đánh dấu rõ ràng là optional
- [ ] C5. Câu bonus KHÔNG ảnh hưởng điểm bắt buộc

**NHÓM D — Đáp Án & Lời Giải**
- [ ] D1. Mọi câu đều có answer key
- [ ] D2. Đáp án được peer-reviewed bởi ít nhất 1 người khác
- [ ] D3. Câu Hard và Bonus có lời giải đầy đủ (full solution steps)
- [ ] D4. OQ và DR có rubric đánh giá rõ ràng
- [ ] D5. Partial credit được cấu hình cho MS, GC, MB, OQ, CD
- [ ] D6. Không có negative scoring

**NHÓM E — Chất Lượng Câu Hỏi**
- [ ] E1. Mọi câu đúng về mặt học thuật (factual accuracy)
- [ ] E2. Ngôn ngữ phù hợp độ tuổi (xem 3.2.1)
- [ ] E3. Instruction rõ ràng, trẻ tự đọc được
- [ ] E4. Difficulty progression hợp lý (không hard → easy → hard)

**NHÓM F — Đặc Biệt cho Môn Cụ Thể**
- [ ] F1. (Toán) Đủ word problems (bài toán có ngữ cảnh)
- [ ] F2. (Anh) Có mix listening/reading/writing nếu đa kỹ năng
- [ ] F3. (Tin) Code câu có test cases đủ edge cases
- [ ] F4. (IMC/IMAS track) Có ít nhất 1 câu problem-solving chuẩn thi

> **Ngưỡng pass:** A1–A4, B1–B4, D1–D2 phải đạt 100%. Tổng tối thiểu 20/26 tiêu chí để pass.

---

## PHỤ LỤC PART 2

### Phụ Lục A: Bảng Tổng Hợp Loại Bài Theo Bloom's Taxonomy

| Cấp Bloom | Động từ | Loại bài phù hợp | Ví dụ |
|-----------|---------|-----------------|-------|
| 1. Remember | nhớ, nhận ra, liệt kê | TF, MC, MA | "6 là số chẵn?" |
| 2. Understand | giải thích, mô tả | TF, FB, SA | "Tại sao 6 là số chẵn?" |
| 3. Apply | tính, áp dụng, giải | NI, MC, OR | "Tính 7 × 8 = ?" |
| 4. Analyze | phân tích, so sánh | GC, MS, SA | "Phân loại 5 số thành chẵn/lẻ" |
| 5. Evaluate | đánh giá, phán xét | OQ, SA | "Giải pháp nào tốt hơn?" |
| 6. Create | thiết kế, tạo | OQ, CD, DR | "Tạo bài toán của em" |

### Phụ Lục B: Quick Reference — Giới Hạn Số Lượng

| Tiêu chí | Giới hạn |
|----------|---------|
| Theory Block: từ tối đa (Lớp 1) | 200 từ |
| Theory Block: từ tối đa (Lớp 3) | 350 từ |
| Ví dụ minh họa tối thiểu (khái niệm mới) | 3 examples |
| Counter-example tối thiểu | 1 |
| Thinking Tips tối đa | 3 |
| Common Mistakes tối đa | 4 |
| Exercise set: câu cùng loại liên tiếp tối đa | 3 câu |
| Homework: thời gian tối đa (7 tuổi) | 20 phút |
| Homework: số câu tối đa (Lớp 3) | 15 câu |

### Phụ Lục C: Checklist Master — Tóm Tắt Tất Cả QA

| Phần | Checklist | Tiêu chí | Pass threshold |
|------|-----------|----------|----------------|
| 3. Theory | Theory QA Checklist | 22 | 18/22 (82%) |
| 4. Exercise | Exercise QA Checklist | 20 | 16/20 (80%) |
| 5. Homework | Homework QA Checklist | 26 | 20/26 (77%) |

---

## LỊCH SỬ PHIÊN BẢN

| Phiên bản | Ngày | Thay đổi | Tác giả |
|-----------|------|----------|---------|
| 1.0 | 2026-07-04 | Phát hành lần đầu (Part 2: Phần 3–5) | AvaB Education Architecture Team |

---

*© 2026 AvaB Education Platform. Tài liệu nội bộ — Không phân phối ra ngoài.*  
*Tài liệu này là một phần của AvaB Education Standard v1.0. Xem Part 1 để biết Phần 1–2.*
