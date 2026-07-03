# AvaB Homework Standard v1.0

> **Tài liệu:** Tiêu Chuẩn Bài Tập Về Nhà — AvaB Learning System  
> **Phiên bản:** 1.0  
> **Ngày ban hành:** 2026-07-04  
> **Áp dụng:** Toán Tư Duy · Anh Văn · Tin Học — Lớp 1–9 (Độ tuổi 5–15)  
> **Mục tiêu chuẩn đầu ra:** IMC · IMAS · MIMO · AMC 8  
> **Trạng thái:** OFFICIAL — Bắt buộc áp dụng từ kỳ học Q3/2026  

---

## Mục Lục

1. [Homework Philosophy & Principles](#1-homework-philosophy--principles)
2. [Homework Structure Standard](#2-homework-structure-standard)
3. [Quantitative Standards](#3-quantitative-standards)
4. [Review vs New Knowledge Ratio](#4-review-vs-new-knowledge-ratio)
5. [Exercise Type Distribution](#5-exercise-type-distribution-in-homework)
6. [Answer & Solution Standard](#6-answer--solution-standard)
7. [Parent Support Guide Standard](#7-parent-support-guide-standard)
8. [AI Tutor Integration](#8-ai-tutor-integration-cho-homework)
9. [Homework Timing & Deadline](#9-homework-timing--deadline)
10. [Assessment & Analytics](#10-assessment--analytics)
11. [JSON Schema](#11-json-schema)
12. [Database Design](#12-database-design)
13. [Admin UI Design](#13-admin-ui-design-wireframe-text)
14. [Workflow](#14-workflow)
15. [QA Checklist](#15-qa-checklist--homework)

---

## 1. Homework Philosophy & Principles

### 1.1 Mục Đích Bài Tập Về Nhà Trong AvaB

Bài tập về nhà trong AvaB **KHÔNG phải** hình thức trừng phạt, kiểm tra hay áp lực thành tích. Bài tập về nhà là **cầu nối có chủ đích** giữa lớp học và cuộc sống thực, giữa giáo viên và phụ huynh, giữa kiến thức mới và bộ nhớ dài hạn.

| Mục đích | Mô tả | KPI đo lường |
|---|---|---|
| **Consolidation** | Củng cố kiến thức vừa học trong ngày | Accuracy ≥ 75% sau 24h |
| **Spaced Retrieval** | Kéo dài retention qua nhắc lại có khoảng cách | Retention rate ≥ 80% sau 7 ngày |
| **Generalization** | Áp dụng kiến thức vào ngữ cảnh mới | Transfer task score ≥ 60% |
| **Family Engagement** | Phụ huynh hiểu con đang học gì | Parent open rate ≥ 70% |
| **Diagnostic** | Phát hiện sớm HS gặp khó khăn | Alert trigger ≤ 48h sau submission |

> **Nguyên tắc cốt lõi:** Một bài tập tốt là bài tập mà học sinh muốn làm, có thể làm được phần lớn một mình, và cảm thấy thành công sau khi hoàn thành.

---

### 1.2 Năm Nguyên Tắc Thiết Kế Homework AvaB

#### Nguyên tắc 1: **Achievable First, Challenging Later** (Dễ Trước, Khó Sau)
- Luôn bắt đầu với bài HS đã nắm vững (Warm-up)
- Xây dưng confidence trước khi đưa ra thử thách
- Không bao giờ để câu đầu tiên là câu khó nhất
- **Công thức:** Warm-up (đã biết) → Core (biết một phần) → Stretch (chưa biết)

#### Nguyên tắc 2: **Minimum Viable Homework** (Đủ, Không Thừa)
- Bài tập đủ để tạo learning effect, không vì "nhiều = tốt"
- Thời gian tối đa nghiêm ngặt theo từng khối lớp (xem §3)
- Mỗi câu hỏi phải có lý do tồn tại — nếu xóa đi mà không mất gì, xóa đi
- **Test:** Hỏi "HS học thêm được gì từ câu này?" — nếu không trả lời được, bỏ câu đó

#### Nguyên tắc 3: **Transparency by Design** (Minh Bạch Từ Đầu)
- HS biết mục tiêu của từng section
- Phụ huynh biết con đang học gì và cần hỗ trợ gì
- Đáp án và hướng dẫn luôn đi kèm bài tập
- Không có "bài bí ẩn" — mọi câu hỏi đều rõ ràng về yêu cầu

#### Nguyên tắc 4: **Spaced, Not Massed** (Phân Tán, Không Dồn)
- Tuân thủ lịch Spaced Repetition Ebbinghaus (xem §4)
- Không ôn cùng 1 topic quá 3 ngày liên tiếp
- Interleaving: xen kẽ chủ đề để tăng retrieval strength
- Gap: khoảng cách tối thiểu 48h giữa 2 lần ôn cùng 1 concept

#### Nguyên tắc 5: **Autonomy-Preserving** (Tôn Trọng Tự Chủ)
- Section C (Challenge) luôn là TÙY CHỌN
- HS có thể chọn thứ tự làm (trừ A → B là bắt buộc)
- AI Tutor hỗ trợ theo mức độ HS yêu cầu, không áp đặt
- Không dùng điểm để trừng phạt; dùng điểm để ghi nhận tiến bộ

---

### 1.3 Spaced Repetition Integration

AvaB tích hợp mô hình **Ebbinghaus Forgetting Curve** và **BKT (Bayesian Knowledge Tracing)** của hệ thống A2PLM:

```
Retention(t) = e^(-t/S)

Trong đó:
  t = thời gian kể từ lần học cuối (tính bằng ngày)
  S = stability — tăng sau mỗi lần successful recall
```

**Lịch ôn tập mặc định cho 1 concept mới:**

| Review #  | Timing       | Loại bài tập        | Chiều sâu |
|-----------|--------------|---------------------|-----------|
| Học lần đầu | Ngày 0     | Exploration + Guided | Full explanation |
| Review 1  | Ngày 1       | Homework Section A  | Recall + Reproduce |
| Review 2  | Ngày 3       | Homework Section A  | Recall + Apply |
| Review 3  | Ngày 7       | Homework Section A  | Apply + Transfer |
| Review 4  | Ngày 14      | Periodic Review Set | Transfer + Generalize |
| Review 5  | Ngày 30      | Monthly Review Set  | Mastery check |

**BKT Integration:** Sau mỗi lần submission, BKT cập nhật P(mastery). Nếu P(mastery) ≥ 0.85, concept đó được loại khỏi Warm-up pool và chuyển sang Monthly Review.

---

### 1.4 Cognitive Load Consideration

AvaB áp dụng **Cognitive Load Theory (Sweller)** trong thiết kế bài tập:

| Loại Load | Định nghĩa | Chiến lược AvaB |
|---|---|---|
| **Intrinsic** | Độ khó nội tại của nội dung | Chunk nhỏ; 1 concept per question |
| **Extraneous** | Do thiết kế kém gây ra | Format nhất quán; ngôn ngữ đơn giản |
| **Germane** | Load có ích — xây schema | Kết nối với prior knowledge; analogies |

**Quy tắc giảm Extraneous Load:**
- Mỗi câu hỏi chỉ có **1 yêu cầu chính**
- Hình ảnh hỗ trợ nội dung, không làm nhiễu
- Không dùng từ ngữ phức tạp khi từ đơn giản đủ nghĩa
- Font size ≥ 14pt cho lớp 1-3; ≥ 12pt cho lớp 4+
- Spacing: Khoảng cách dòng ≥ 1.5x

---

## 2. Homework Structure Standard

### 2.1 Cấu Trúc Bắt Buộc Một Homework Set

Mỗi Homework Set PHẢI có đủ các thành phần sau. Các thành phần đánh dấu **[MUST]** là bắt buộc; **[SHOULD]** là nên có; **[MAY]** là tùy chọn.

```
HOMEWORK SET
├── [MUST] Metadata Block
├── [MUST] Section A: Warm-up Review
├── [MUST] Section B: New Knowledge Practice
├── [MAY]  Section C: Challenge Extension
├── [MUST] Answer Key
├── [MUST] Solution Guide (với câu Medium/Hard)
├── [MUST] Parent Support Note
└── [SHOULD] Teacher Notes (nội bộ, không hiển thị HS)
```

---

### 2.2 Metadata Block

**[MUST]** Mỗi Homework Set bắt đầu bằng Metadata Block chuẩn:

```yaml
---
homework_id: "HW-MATH-G3-U04-L12-20260704"
title: "Phân số và phần bằng nhau"
subject: math | english | cs
grade: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
lesson_id: "MATH-G3-U04-L12"
lesson_title: "Giới thiệu phân số đơn giản"
academic_week: 2026-W27
assigned_date: "2026-07-04"
due_date: "2026-07-05T23:59:00+07:00"
estimated_time_minutes: 20
difficulty_profile:
  easy_pct: 50
  medium_pct: 35
  hard_pct: 15
  challenge_pct: 0
total_questions: 20
sections:
  - A: 8 questions (Warm-up)
  - B: 12 questions (New Practice)
  - C: 0 questions (optional)
curriculum_tags:
  - "fraction.basic"
  - "equal.parts"
  - "number.sense"
competition_alignment:
  - "IMC-Level-1"
  - "IMAS-Junior"
version: "1.0"
author: "teacher_id:T001"
reviewed_by: "qa_id:QA003"
status: draft | reviewed | published | archived
---
```

**Quy tắc đặt ID:**
```
HW-{SUBJECT}-G{GRADE}-U{UNIT:02d}-L{LESSON:02d}-{YYYYMMDD}

Ví dụ:
  HW-MATH-G3-U04-L12-20260704
  HW-ENG-G5-U02-L08-20260704
  HW-CS-G7-U01-L03-20260704
```

---

### 2.3 Section A: Warm-up Review

**Mục đích:** Kích hoạt prior knowledge, tạo confidence, warm-up cognitive engine trước khi học mới.

**[MUST]** Section A PHẢI:
- Chứa 100% câu từ các lesson đã học (không có concept mới)
- Difficulty: chỉ EASY hoặc MEDIUM (không có HARD)
- Tỷ lệ câu: 30-40% tổng số câu trong Homework Set
- Thời gian ước tính: ≤ 30% tổng thời gian

**[SHOULD]** Section A NÊN:
- Bao gồm ít nhất 2 concept khác nhau (interleaving)
- Có ít nhất 1 câu về concept được dạy 7 ngày trước (spaced)
- Sắp xếp theo thứ tự từ dễ đến khó trong section

**Format Header chuẩn:**
```markdown
## Section A: Warm-up — Ôn tập kiến thức đã học
⏱ Thời gian gợi ý: ___ phút
📌 Mục tiêu: Ôn lại [topic 1] và [topic 2]
```

---

### 2.4 Section B: New Knowledge Practice

**Mục đích:** Luyện tập có hướng dẫn (guided practice) với kiến thức từ bài học hôm nay.

**[MUST]** Section B PHẢI:
- Chứa các câu liên quan trực tiếp đến lesson hôm nay
- Difficulty mix: tuân thủ bảng §3 theo grade
- Tỷ lệ câu: 60-70% tổng số câu
- Sắp xếp từ dễ → khó (scaffolded progression)
- Ít nhất 1 câu open-ended hoặc explanation required

**[SHOULD]** Section B NÊN:
- Bao gồm ≥ 3 dạng bài khác nhau (xem §5)
- Có ít nhất 1 câu áp dụng vào tình huống thực tế
- Kết nối với at least 1 concept đã học trước đó

**Format Header chuẩn:**
```markdown
## Section B: Luyện tập — Kiến thức hôm nay
⏱ Thời gian gợi ý: ___ phút
📌 Mục tiêu: Thực hành [main concept từ lesson]
```

---

### 2.5 Section C: Challenge Extension (Tùy Chọn)

**Mục đích:** Bồi dưỡng HS giỏi, kết nối với chuẩn thi học sinh giỏi (IMC/IMAS/MIMO).

**[MAY]** Section C là HOÀN TOÀN TÙY CHỌN:
- Không tính vào score chính (bonus points only)
- Difficulty: HARD và CHALLENGE
- Không có penalty nếu không làm
- Giáo viên và phụ huynh không được tạo áp lực Section C

**[MUST]** Nếu có Section C, PHẢI:
- Gắn nhãn rõ ràng "🌟 THỬ THÁCH — Tùy chọn"
- Có hint gợi ý (không phải đáp án)
- Liên kết với bài thi olympiad/cạnh tranh tương ứng
- Có Solution Guide đầy đủ

**Format Header chuẩn:**
```markdown
## 🌟 Section C: Thử thách — Dành cho bạn muốn đi xa hơn!
⏱ Thời gian gợi ý: ___ phút
💡 Gợi ý: Không bắt buộc! Làm nếu bạn muốn thử thách bản thân.
🏆 Bonus: +___ điểm nếu hoàn thành
```

---

### 2.6 Answer Key

**[MUST]** Mọi Homework Set PHẢI có Answer Key:

| Yêu cầu | Chi tiết |
|---|---|
| Phạm vi | 100% câu hỏi (A + B + C) |
| Format | Số câu → Đáp án ngắn gọn |
| Vị trí | Sau tất cả sections; có thể fold/hide trên app |
| Truy cập | HS xem được SAU khi submit; Phụ huynh xem được ngay |
| Dạng multiple choice | Ghi chữ cái + nội dung đáp án |
| Dạng điền số | Ghi số (kèm đơn vị nếu có) |
| Dạng open-ended | Ghi sample answer + rubric chấm |

```markdown
## 📋 Answer Key

**Section A**
- A1: B (24)
- A2: C (Số 15 lớn hơn)
- A3: 7 cm
...

**Section B**
- B1: 1/4
- B2: D (Ba phần tư)
...
```

---

### 2.7 Solution Guide

**[MUST]** Câu MEDIUM và HARD bắt buộc có Solution Guide đầy đủ.  
**[SHOULD]** Câu EASY nên có solution nếu concept mới được giới thiệu.  
**[MAY]** Solution Guide cho Challenge có thể ngắn gọn hơn (HS giỏi tự suy luận).

**Format Solution chuẩn (4 bước):**
```markdown
### Giải B5 — [Tên bài]

**🔍 Phân tích:** [Bài hỏi gì? Dữ liệu đã cho là gì?]
Bài cho biết: ...
Bài hỏi: ...

**📐 Kế hoạch:** [Sẽ dùng phương pháp/công thức gì?]
Dùng: ...
Vì: ...

**✏️ Thực hiện:**
Bước 1: ...
Bước 2: ...
...
Kết quả: ___

**✅ Kiểm tra:** [Kiểm tra lại đáp án có hợp lý không]
Thử lại: ...
Vậy đáp án ___ là đúng/sai?
```

---

### 2.8 Parent Support Note

**[MUST]** Mỗi Homework Set có đúng 1 Parent Support Note (xem §7 để biết chi tiết đầy đủ).

**Vị trí:** Đầu trang Homework hoặc tab riêng trên app.  
**Ngôn ngữ:** Tiếng Việt thuần, không dùng thuật ngữ chuyên môn.

---

## 3. Quantitative Standards

### 3.1 Bảng Tiêu Chuẩn Số Lượng Theo Khối Lớp

| Lớp | Tổng câu | Easy% | Medium% | Hard% | Challenge% | Thời gian (phút) | Section A | Section B | Section C |
|-----|----------|-------|---------|-------|------------|------------------|-----------|-----------|-----------|
| **Lớp 1** | 15 | 60% | 30% | 10% | — | 15–20 | 5 câu | 10 câu | — |
| **Lớp 2** | 15 | 55% | 35% | 10% | — | 15–20 | 5 câu | 10 câu | — |
| **Lớp 3** | 20 | 50% | 35% | 15% | optional | 20–25 | 7 câu | 13 câu | 0–2 câu |
| **Lớp 4** | 20 | 45% | 40% | 15% | optional | 20–25 | 7 câu | 13 câu | 0–2 câu |
| **Lớp 5** | 25 | 40% | 40% | 20% | optional | 25–30 | 8 câu | 15 câu | 0–3 câu |
| **Lớp 6** | 25 | 35% | 40% | 20% | 5% | 30–35 | 8 câu | 15 câu | 2–3 câu |
| **Lớp 7** | 28 | 30% | 40% | 25% | 5% | 35–40 | 9 câu | 17 câu | 2–3 câu |
| **Lớp 8** | 28 | 30% | 40% | 25% | 5% | 35–45 | 9 câu | 17 câu | 2–3 câu |
| **Lớp 9** | 30 | 30% | 40% | 25% | 5% | 40–50 | 10 câu | 18 câu | 2–4 câu |

> **Ghi chú:**
> - "—" = không có Section C cho khối đó
> - "optional" = giáo viên có thể thêm 0–2 câu challenge tùy HS
> - Challenge% tính trên tổng câu Section C (bonus, không tính vào base score)
> - Thời gian ước tính dành cho HS AVERAGE; HS giỏi có thể nhanh hơn 30–40%

---

### 3.2 Định Nghĩa Mức Độ Câu Hỏi

| Mức | Tên | Mô tả | Bloom's Level | Ví dụ (Toán Lớp 3) |
|-----|-----|-------|---------------|---------------------|
| **EASY** | Nhớ / Hiểu | HS đã thấy dạng này, áp dụng trực tiếp | Recall, Understand | "1/2 + 1/2 = ?" |
| **MEDIUM** | Áp dụng | Áp dụng kiến thức vào tình huống quen thuộc | Apply, Analyze | "Chia 12 bánh thành 3 phần bằng nhau, mỗi phần mấy cái?" |
| **HARD** | Phân tích | Kết hợp nhiều bước, suy luận | Analyze, Evaluate | "Tô màu 3/8 hình, còn lại bao nhiêu phần chưa tô?" |
| **CHALLENGE** | Sáng tạo | Bài toán tư duy, open-ended, thi olympiad | Evaluate, Create | "Có bao nhiêu cách chia 1 hình vuông thành 4 phần bằng nhau?" |

---

### 3.3 Quy Tắc Phân Bổ Câu Hỏi Bắt Buộc

**[MUST]**
1. Section A: chỉ EASY và MEDIUM (không có HARD, không có CHALLENGE)
2. Câu EASY phải là câu thứ nhất hoặc thứ hai của từng section
3. Không có 3 câu HARD liên tiếp
4. Section C: chỉ HARD và CHALLENGE

**[SHOULD]**
5. Câu MEDIUM không quá 3 câu liên tiếp
6. Mỗi section kết thúc bằng câu có difficulty cao nhất section đó
7. Có khoảng nghỉ nhận thức (transition question — câu dễ hơn sau chuỗi khó)

---

## 4. Review vs New Knowledge Ratio

### 4.1 Lý Thuyết Ebbinghaus Forgetting Curve

Áp dụng nghiên cứu của Hermann Ebbinghaus (1885) và các nghiên cứu hiện đại về spaced repetition:

```
Forgetting rate (sau học 1 lần):
  Sau 20 phút: nhớ ~58%
  Sau 1 ngày:  nhớ ~44%
  Sau 3 ngày:  nhớ ~36%
  Sau 7 ngày:  nhớ ~25%
  Sau 30 ngày: nhớ ~21%

→ Review đúng thời điểm tăng retention lên 90%+
```

### 4.2 Bảng Phân Bổ Review vs New Knowledge

| Ngày sau khi học | Mới (New) | Ôn tập (Review) | Loại câu ôn tập | Ghi chú |
|---|---|---|---|---|
| **Ngày 0** (In class) | 100% | 0% | — | Lesson chính |
| **Ngày 1** (HW#1) | 70% | 30% | Recall đơn giản | First review — most critical |
| **Ngày 2** (HW#2) | 60% | 40% | Recall + Apply | |
| **Ngày 3** (HW#3) | 50% | 50% | Apply có biến thể | |
| **Ngày 7** (HW#7) | 30% | 70% | Apply + Transfer | Second review |
| **Ngày 14** | 20% | 80% | Transfer + Generalize | Third review |
| **Ngày 30** | 10% | 90% | Mastery check | Monthly review |

> Tỷ lệ trên là cho **nội dung Section A (Review part)**. Section B luôn là 100% New.

---

### 4.3 Phân Bổ Topic Trong Section A (Spaced Interleaving)

**[MUST]** Section A PHẢI bao gồm câu từ ít nhất 2 topic khác nhau.

**Lịch interleaving gợi ý cho 1 tuần học:**

| Ngày | Topic ôn (Section A) | Topic mới (Section B) |
|---|---|---|
| Thứ 2 | Topic từ tuần trước | Topic mới #1 |
| Thứ 3 | Topic mới #1 (từ T2) + Topic cũ | Topic mới #2 |
| Thứ 4 | Topic #1 + Topic #2 | Topic mới #3 |
| Thứ 5 | Topic #2 + Topic #3 | Topic mới #4 |
| Thứ 6 | Mixed review (các topic trong tuần) | — |
| Thứ 7 | — | — |
| CN | Optional: tự ôn bằng app | — |

---

### 4.4 BKT-Guided Review Selection

Hệ thống A2PLM BKT model xác định topic nào cần đưa vào Section A:

```
Priority(topic) = f(P_forget, time_since_last, previous_errors)

Trong đó:
  P_forget  = xác suất HS đã quên (từ BKT)
  time_since_last = thời gian kể từ lần ôn cuối
  previous_errors = số lần sai gần nhất

→ Top 3 topics có Priority cao nhất → Section A
```

**[MUST]** Nếu AI auto-generate Section A, phải dùng BKT priority. Nếu tự soạn, giáo viên phải check dashboard để xem topic nào HS yếu nhất.

---

## 5. Exercise Type Distribution in Homework

### 5.1 Danh Mục Dạng Bài

| Code | Dạng bài | Mô tả | Phù hợp |
|------|----------|-------|---------|
| **MCQ** | Multiple Choice (4 đáp án) | Chọn 1 đáp án đúng | Review, factual |
| **FIB** | Fill in the Blank | Điền số/từ vào chỗ trống | Computation |
| **TF** | True/False với giải thích | Đúng/Sai + lý do | Conceptual |
| **OE** | Open-Ended | Viết/giải thích câu trả lời | Deep understanding |
| **MATCH** | Matching | Nối cột | Vocabulary, concepts |
| **ORDER** | Ordering/Sequencing | Sắp xếp thứ tự | Algorithm, process |
| **DRAW** | Drawing/Diagram | Vẽ hình, sơ đồ | Geometry, visual |
| **WORD** | Word Problem | Bài toán có lời văn | Application |
| **GAME** | Game-based | Mini game/puzzle | Engagement |
| **CODE** | Coding task | Viết/sửa code | CS subject |

---

### 5.2 Quy Tắc Phân Bổ Dạng Bài

**[MUST]**
- Không quá **60%** cùng 1 dạng bài trong 1 Homework Set
- Bắt buộc có ít nhất **1 câu OE (open-ended)** trong Section B
- Mỗi Homework Set tối thiểu **3 dạng bài khác nhau**

**[SHOULD]**
- Có ít nhất 1 WORD problem (bài toán có lời văn) trong Section B (Toán)
- Xen kẽ dạng bài để tránh fatigue
- Không kết thúc bằng MCQ — kết thúc bằng OE hoặc WORD

---

### 5.3 Phân Bổ Theo Môn

#### Toán Tư Duy

| Dạng bài | Min% | Max% | Ghi chú |
|---|---|---|---|
| MCQ | 10% | 30% | Không làm chủ đạo |
| FIB | 20% | 40% | Computation practice |
| WORD | 20% | 40% | **Bắt buộc có** |
| OE | 10% | 25% | **Bắt buộc có** |
| DRAW | 0% | 20% | Geometry units |
| MATCH | 0% | 15% | Vocabulary units |

#### Anh Văn

| Dạng bài | Min% | Max% | Ghi chú |
|---|---|---|---|
| MCQ | 10% | 25% | |
| FIB | 15% | 30% | Grammar fill |
| MATCH | 10% | 25% | Vocabulary |
| OE | 15% | 30% | **Bắt buộc có** — writing |
| ORDER | 5% | 20% | Sentence ordering |
| WORD | 5% | 15% | Reading comprehension |

#### Tin Học

| Dạng bài | Min% | Max% | Ghi chú |
|---|---|---|---|
| MCQ | 10% | 25% | Concept check |
| OE | 10% | 25% | Explain algorithm |
| ORDER | 10% | 30% | Sequencing algorithms |
| CODE | 15% | 40% | **Trọng tâm** |
| DRAW | 5% | 20% | Flowchart, diagram |
| TF | 5% | 15% | Bug finding |

---

## 6. Answer & Solution Standard

### 6.1 Yêu Cầu Answer Key

**[MUST]** 100% câu hỏi có đáp án trong Answer Key.

| Loại câu | Format đáp án | Thông tin thêm |
|---|---|---|
| MCQ | "B — Đáp án B: [nội dung]" | Ghi rõ nội dung, không chỉ chữ cái |
| FIB | Số/từ đầy đủ với đơn vị | "15 con / 1/3 / True" |
| TF | "Đúng" hoặc "Sai" + lý do 1 câu | |
| OE | Sample answer + từ khóa chấm điểm | Rubric ngắn |
| MATCH | Danh sách cặp nối | "1-C, 2-A, 3-B" |
| ORDER | Thứ tự đúng | "3, 1, 4, 2" |
| DRAW | Mô tả + ảnh mẫu | Ít nhất 1 ảnh mẫu |
| WORD | Đáp án cuối + unit | Phải có đơn vị |
| CODE | Code mẫu đúng | Chú thích đầy đủ |

---

### 6.2 Solution Guide: Khi Nào MUST Có Lời Giải Chi Tiết

| Điều kiện | MUST | SHOULD | MAY |
|---|---|---|---|
| Câu HARD | ✅ | | |
| Câu CHALLENGE | ✅ | | |
| Câu MEDIUM có nhiều bước | ✅ | | |
| Câu MEDIUM 1 bước đơn giản | | ✅ | |
| Câu EASY — concept đã quen | | | ✅ |
| Câu EASY — concept mới xuất hiện lần đầu | ✅ | | |
| Câu WORD problem (bất kể độ khó) | ✅ | | |
| Câu OE | ✅ | | |
| Câu CODE | ✅ | | |

---

### 6.3 Format Solution: Phân tích → Kế hoạch → Thực hiện → Kiểm tra

```markdown
### 📖 Giải chi tiết — [Số câu] [Tên bài]
*Mức độ: MEDIUM | Dạng: WORD*

**🔍 Phân tích**
- Dữ liệu đã cho:
  - [datum 1]
  - [datum 2]
- Câu hỏi yêu cầu: [rephrase rõ ràng]
- Khái niệm áp dụng: [tên concept]

**📐 Kế hoạch**
Hướng tiếp cận: [1-2 câu mô tả strategy]
Công thức/quy tắc dùng: [nếu có]

**✏️ Thực hiện**
```
Bước 1: [tên bước] → [kết quả]
Bước 2: [tên bước] → [kết quả]
Bước 3: [tên bước] → [kết quả]
...
Kết quả: ___
```

**✅ Kiểm tra**
- Đơn vị có đúng không? [✓/✗]
- Kết quả có hợp lý không? [giải thích]
- Cách thử lại: [reverse check nếu có]

**💡 Lỗi thường gặp**
HS hay nhầm: [mô tả lỗi phổ biến và cách tránh]
```

---

### 6.4 Partial Credit Rules

**[MUST]** Mọi câu WORD và OE phải có rubric partial credit rõ ràng.

| Phần đúng | Điểm tối đa câu đó |
|---|---|
| Đúng setup/phân tích nhưng tính sai | 50% |
| Đúng 1/2 bước nhưng kết quả sai | 25% |
| Hiểu đúng hướng nhưng lỗi trình bày | 75% |
| Đáp án đúng nhưng không có lời giải | 50% (với WORD/OE) |
| Đúng hoàn toàn | 100% |

---

### 6.5 Common Mistake Hints

**[SHOULD]** Mỗi câu HARD và CHALLENGE nên có 1 "Lỗi thường gặp":

```markdown
⚠️ **Lỗi hay gặp:** 
Nhiều bạn nhầm [A] với [B] vì [lý do]. 
Nhớ kiểm tra: [checkpoint cụ thể].
```

---

## 7. Parent Support Guide Standard

### 7.1 Cấu Trúc Bắt Buộc Của Parent Support Note

**[MUST]** Mỗi Homework Set có đúng **1 Parent Support Note** với 5 thành phần:

```markdown
---
👨‍👩‍👧 **Gửi Ba/Mẹ — [Tên bài học]**

📚 **Hôm nay con học gì?**
[2-3 câu, ngôn ngữ đời thường, không thuật ngữ]

🤝 **Ba/mẹ có thể hỗ trợ con thế nào?**
[2-3 gợi ý hành động cụ thể]

⏱ **Thời gian làm bài:** Khoảng ___ phút

🆘 **Nếu con gặp khó khăn:**
[1 gợi ý cụ thể, actionable]

🌟 **Điều tuyệt vời hôm nay:**
[1 câu khuyến khích liên quan đến nội dung]
---
```

---

### 7.2 Ngôn Ngữ Và Giới Hạn

| Tiêu chí | Yêu cầu |
|---|---|
| Ngôn ngữ | Tiếng Việt thuần; không dùng từ Latin/Anh không cần thiết |
| Độ dài | Tối đa 150 words (toàn bộ Parent Note) |
| Thuật ngữ toán học | Thay bằng ví dụ cụ thể trong cuộc sống |
| Tone | Friendly, khuyến khích, đồng hành — không phán xét |
| Yêu cầu với phụ huynh | Gợi ý, không bắt buộc |

**[MUST NOT]** Parent Note KHÔNG được:
- Dùng từ như "đúng sai", "kiểm tra", "phạt", "phải"
- Đặt áp lực phụ huynh phải dạy lại
- Dài hơn 150 words
- Dùng thuật ngữ mà không giải thích bằng ví dụ

---

### 7.3 Template Ví Dụ — Toán Lớp 3: Phân Số

```markdown
---
👨‍👩‍👧 **Gửi Ba/Mẹ — Phân số và phần bằng nhau**

📚 **Hôm nay con học gì?**
Con đang học về cách chia đều một thứ gì đó thành các phần bằng nhau — 
ví dụ như cắt bánh pizza thành 4 miếng bằng nhau, mỗi miếng là 
"một phần tư" cái bánh!

🤝 **Ba/mẹ có thể hỗ trợ con thế nào?**
• Khi ăn, hỏi con: "Mình chia quả cam này thành mấy múi? Mỗi người ăn 
  mấy múi là bằng mấy phần của quả cam?"
• Để con tự dùng thước chia hình ra — con thích làm bằng tay lắm!
• Không cần giải thích thêm — để con tự nghĩ trước nhé.

⏱ **Thời gian làm bài:** Khoảng 20–25 phút

🆘 **Nếu con gặp khó khăn:**
Thử lấy 1 tờ giấy và gấp đôi, gấp tư — nhìn thực tế sẽ dễ hiểu hơn 
nhìn trên giấy nhiều đó ạ!

🌟 **Điều tuyệt vời hôm nay:**
Con đang học cách nhìn thế giới theo "từng phần" — đây là bước đầu tiên 
của tư duy toán học nâng cao đấy! 🎉
---
```

---

## 8. AI Tutor Integration Cho Homework

### 8.1 Khi Nào AI Được Phép Hint

**[MUST]** AI Tutor chỉ can thiệp khi:

| Trigger | Điều kiện cụ thể | AI Action |
|---|---|---|
| **Idle timeout** | HS không tương tác ≥ 3 phút trên 1 câu | Offer help (không tự động hint) |
| **Wrong answer** | Sai ≥ 2 lần cùng 1 câu | Auto-hint Level 1 |
| **Wrong answer repeated** | Sai ≥ 3 lần cùng 1 câu | Auto-hint Level 2 |
| **HS gọi AI** | HS nhấn nút "Cần gợi ý" | Hint theo level hiện tại |
| **Error pattern** | Cùng lỗi ≥ 3 câu liên tiếp | Micro-lesson (không hint câu) |

**[MUST NOT]** AI KHÔNG được:
- Cho đáp án trực tiếp (kể cả khi HS yêu cầu)
- Skip levels (phải tuần tự từ Level 1)
- Hint khi HS chưa thử ít nhất 1 lần
- Hint khác nhau cho cùng câu của 2 HS khác nhau (hint phải deterministic)

---

### 8.2 Scaffolding Levels (1–5)

| Level | Tên | Mô tả | Ví dụ (câu: 1/4 + 2/4 = ?) |
|-------|-----|-------|---------------------------|
| **L1** | **Orientation** | Nhắc lại mục tiêu câu | "Câu này hỏi về phép cộng phân số cùng mẫu. Bạn đã học điều này trong bài hôm nay!" |
| **L2** | **Concept Link** | Kết nối với kiến thức đã biết | "Nhớ lại: khi 2 phân số có cùng mẫu số, ta chỉ cộng tử số thôi nhé. Mẫu số giữ nguyên." |
| **L3** | **Process Hint** | Hướng dẫn bước đầu tiên | "Bước 1: Nhìn vào mẫu số — 4 và 4. Chúng có bằng nhau không? Nếu có, bạn làm gì tiếp?" |
| **L4** | **Worked Example** | Ví dụ tương tự (khác số) | "Hãy xem: 1/3 + 1/3 = 2/3. Ta chỉ cộng 1+1=2, giữ mẫu là 3. Bây giờ thử áp dụng với bài của bạn!" |
| **L5** | **Step-by-step** | Hướng dẫn từng bước (gần đáp án) | "Tử số: 1 + 2 = ___. Mẫu số: vẫn là ___. Vậy đáp án là ___/___." |

**[MUST]** Maximum hints per question:
- EASY: L1 → L2 → [show answer if still wrong]
- MEDIUM: L1 → L2 → L3 → L4 → [show answer]
- HARD: L1 → L2 → L3 → L4 → L5 → [show answer]
- CHALLENGE: L1 → L2 → L3 → L4 → [show answer only if HS yêu cầu]

---

### 8.3 Hint Template Format

```json
{
  "hint_id": "HINT-{question_id}-L{level}",
  "question_id": "HW-MATH-G3-U04-L12-20260704-B5",
  "level": 3,
  "trigger": "wrong_answer_2",
  "message": "Bước 1: Nhìn vào mẫu số — 4 và 4...",
  "message_type": "text | text+image | text+animation",
  "concept_tag": "fraction.addition.same_denominator",
  "follow_up_prompt": "Bây giờ thử lại nhé! 💪",
  "analytics": {
    "hint_shown_at": "ISO8601",
    "student_id": "...",
    "attempt_number": 2
  }
}
```

---

### 8.4 AI Không Đưa Đáp Án Trực Tiếp

**[MUST]** Khi HS yêu cầu đáp án, AI PHẢI:

```
HS: "Cho tôi đáp án đi"

AI: "Mình không thể cho đáp án ngay được, 
     vì bạn sẽ học được nhiều hơn khi tự tìm ra! 😊
     
     Mình có thể giúp bạn thêm gợi ý không?
     
     [Gợi ý nhỏ hơn] [Thử lại] [Bỏ qua câu này]"
```

**[MUST]** Đáp án chỉ hiện sau khi:
1. HS đã dùng hết hints cho level đó, VÀ
2. HS sai thêm 1 lần nữa sau hint cuối, HOẶC
3. HS nhấn "Xem đáp án" (sau khi hỏi xác nhận)

---

## 9. Homework Timing & Deadline

### 9.1 Submission Window

| Cấu hình | Giá trị | Ghi chú |
|---|---|---|
| **Assign time** | Ngay sau buổi học | Auto-assign sau khi giáo viên kết thúc lesson |
| **Default window** | 24 giờ | Từ lúc assign đến 23:59 ngày hôm sau |
| **Weekend extension** | +24 giờ tự động | Bài giao thứ 6 → deadline Chủ nhật 23:59 |
| **Holiday extension** | +1 ngày per holiday | Tự động theo calendar |
| **Maximum window** | 72 giờ | Không extend quá 3 ngày |

---

### 9.2 Late Submission Policy

| Thời điểm nộp | Phân loại | Điểm nhận được | Ghi chú |
|---|---|---|---|
| Trong deadline | On time | 100% điểm | |
| 0–24h sau deadline | Late Tier 1 | 85% điểm | |
| 24–48h sau deadline | Late Tier 2 | 70% điểm | |
| 48–72h sau deadline | Late Tier 3 | 50% điểm | |
| >72h sau deadline | Very late | 0% điểm (ghi nhận hoàn thành) | Vẫn cho làm để học |

**[MUST]** Các trường hợp exception (force on-time):
- HS có lý do y tế (cần phụ huynh report qua app)
- Sự cố kỹ thuật hệ thống (auto-detect và extend)
- Thiên tai, nghỉ học đột xuất (admin manual override)

---

### 9.3 Retry Policy

| Điều kiện | Số lần retry | Điểm retry | Thời gian mở |
|---|---|---|---|
| Nộp đúng hạn, điểm < 60% | 1 lần | Max 80% | Trong 24h |
| Nộp trễ | 0 lần | — | Không có retry |
| HS giỏi muốn làm lại | Không áp dụng | — | |
| Lỗi kỹ thuật được xác nhận | 1 lần | 100% | 48h |

**Retry Rules:**
- **[MUST]** Retry chỉ cho phần câu hỏi làm sai lần đầu (không phải toàn bộ)
- **[MUST]** Câu hỏi trong retry PHẢI là bộ câu khác (isomorphic questions, không cùng số)
- **[SHOULD]** HS nhận 1 hint miễn phí cho retry

---

### 9.4 Điểm Tổng Kết

```
Final Homework Score = Base Score × Timing Multiplier × Completion Bonus

Trong đó:
  Base Score = (correct answers) / (total questions) × 100
  Timing Multiplier = 1.0 (on-time) | 0.85 | 0.70 | 0.50 (late tiers)
  Completion Bonus = +5 points nếu hoàn thành ≥ 90% câu đúng hạn

Challenge Section: điểm bonus, không tính vào base.
  Challenge Bonus = challenge_score × 0.1 (tối đa +5 điểm)
```

---

## 10. Assessment & Analytics

### 10.1 Scoring Rubric Cho Homework

| Loại câu | Chấm điểm | Partial credit |
|---|---|---|
| MCQ | 0 hoặc 1 | Không |
| FIB (số đơn) | 0 hoặc 1 | Không |
| FIB (có đơn vị) | 0, 0.5 (số đúng, đơn vị sai), 1 | Có |
| TF + lý do | 0, 0.5 (TF đúng), 1 | Có |
| OE | 0–1 theo rubric 4 tiêu chí | Có |
| WORD (1 bước) | 0 hoặc 1 | Không |
| WORD (nhiều bước) | Theo rubric partial credit §6.4 | Có |
| CODE | 0, 0.25, 0.5, 0.75, 1 theo test cases | Có |
| DRAW | 0–1 theo rubric hình học | Có |

**OE Rubric (4 tiêu chí):**
```
Accuracy     (50%): Đáp án đúng về mặt nội dung
Reasoning    (25%): Lập luận/giải thích rõ ràng
Completeness (15%): Đầy đủ các ý yêu cầu
Presentation (10%): Trình bày rõ ràng, đúng ngữ pháp (Anh văn) hoặc ký hiệu toán (Toán)
```

---

### 10.2 Metrics Thu Thập

**[MUST]** Hệ thống PHẢI ghi lại các metrics sau cho mỗi submission:

```yaml
Per Question Metrics:
  - question_id
  - attempt_count          # số lần thử
  - first_attempt_correct  # boolean
  - final_correct          # boolean
  - time_spent_seconds     # thời gian trên câu
  - hints_used             # số hint đã dùng
  - hint_levels_used       # [1, 2, 3] — levels nào đã dùng
  - error_types            # categorical: computation, conceptual, careless

Per Session Metrics:
  - total_time_minutes
  - completion_rate        # % câu đã làm
  - accuracy_rate          # % câu đúng (first attempt)
  - section_a_accuracy
  - section_b_accuracy
  - challenge_attempted    # boolean
  - device_type            # mobile/tablet/desktop
  - submission_timestamp
  - latency_tier           # on_time/late1/late2/late3
```

---

### 10.3 Alert Triggers

**[MUST]** Hệ thống phải tự động alert khi phát hiện các pattern sau:

| Alert | Điều kiện trigger | Người nhận | Độ ưu tiên |
|---|---|---|---|
| **Struggling Student** | Sai ≥ 5 câu liên tiếp hoặc accuracy < 40% | Giáo viên | HIGH |
| **Topic Weakness** | Accuracy < 50% trên cùng topic trong 2 HW liên tiếp | Giáo viên | HIGH |
| **Not Submitted** | Quá 12h sau deadline, chưa bắt đầu | Giáo viên + Phụ huynh | MEDIUM |
| **Excessive Hints** | Dùng L4+ hints ≥ 60% câu | Giáo viên | MEDIUM |
| **Too Fast** | Hoàn thành < 30% thời gian ước tính | Giáo viên | LOW |
| **Challenge Mastery** | Challenge accuracy ≥ 90% liên tiếp 3 HW | Giáo viên | INFO |
| **Improvement** | Accuracy tăng ≥ 20% so với HW cùng topic | — | Celebrate! |

---

### 10.4 Integration Với A2PLM BKT Model

```
After each homework submission:

1. For each question q in submission:
   a. Get current P(mastery_k) for skill_k related to q
   b. Update:
      P(mastery_k | correct) = P(T) * P(mastery_k) / P(correct)
      P(mastery_k | wrong)   = P(T) * P(mastery_k) / P(wrong)
   c. Store updated P(mastery_k) in BKT state

2. Recalculate recommendation_queue:
   - Skills with P(mastery_k) < 0.4  → Priority review
   - Skills with P(mastery_k) 0.4-0.7 → Normal review
   - Skills with P(mastery_k) > 0.85  → Monthly review only

3. Update next_homework_section_a:
   - Pull top 3-5 skills from review queue
   - Generate/select questions from question bank
```

---

## 11. JSON Schema

### 11.1 HomeworkSet

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://avab.edu.vn/schemas/homework/HomeworkSet.json",
  "title": "HomeworkSet",
  "type": "object",
  "required": [
    "homework_id", "title", "subject", "grade", "lesson_id",
    "assigned_date", "due_date", "estimated_time_minutes",
    "sections", "status"
  ],
  "properties": {
    "homework_id": {
      "type": "string",
      "pattern": "^HW-(MATH|ENG|CS)-G[1-9]-U[0-9]{2}-L[0-9]{2}-[0-9]{8}$",
      "example": "HW-MATH-G3-U04-L12-20260704"
    },
    "title": {
      "type": "string",
      "minLength": 5,
      "maxLength": 120,
      "example": "Phân số và phần bằng nhau"
    },
    "subject": {
      "type": "string",
      "enum": ["math", "english", "cs"]
    },
    "grade": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9
    },
    "lesson_id": {
      "type": "string",
      "example": "MATH-G3-U04-L12"
    },
    "lesson_title": {
      "type": "string"
    },
    "academic_week": {
      "type": "string",
      "pattern": "^[0-9]{4}-W[0-9]{2}$",
      "example": "2026-W27"
    },
    "assigned_date": {
      "type": "string",
      "format": "date",
      "example": "2026-07-04"
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "example": "2026-07-05T23:59:00+07:00"
    },
    "estimated_time_minutes": {
      "type": "integer",
      "minimum": 10,
      "maximum": 60
    },
    "difficulty_profile": {
      "type": "object",
      "required": ["easy_pct", "medium_pct", "hard_pct"],
      "properties": {
        "easy_pct":      { "type": "integer", "minimum": 0, "maximum": 100 },
        "medium_pct":    { "type": "integer", "minimum": 0, "maximum": 100 },
        "hard_pct":      { "type": "integer", "minimum": 0, "maximum": 100 },
        "challenge_pct": { "type": "integer", "minimum": 0, "maximum": 100 }
      }
    },
    "total_questions": {
      "type": "integer",
      "minimum": 10,
      "maximum": 35
    },
    "sections": {
      "type": "object",
      "required": ["A", "B"],
      "properties": {
        "A": {
          "type": "object",
          "properties": {
            "question_count": { "type": "integer" },
            "question_ids":   { "type": "array", "items": { "type": "string" } }
          }
        },
        "B": {
          "type": "object",
          "properties": {
            "question_count": { "type": "integer" },
            "question_ids":   { "type": "array", "items": { "type": "string" } }
          }
        },
        "C": {
          "type": "object",
          "properties": {
            "question_count": { "type": "integer" },
            "question_ids":   { "type": "array", "items": { "type": "string" } },
            "is_optional":    { "type": "boolean", "const": true },
            "bonus_points":   { "type": "number" }
          }
        }
      }
    },
    "curriculum_tags": {
      "type": "array",
      "items": { "type": "string" },
      "example": ["fraction.basic", "equal.parts"]
    },
    "competition_alignment": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["IMC-Level-1", "IMC-Level-2", "IMAS-Junior", "IMAS-Senior", "MIMO", "AMC8", "AMC10"]
      }
    },
    "author_id":    { "type": "string" },
    "reviewed_by":  { "type": "string" },
    "version":      { "type": "string", "example": "1.0" },
    "status": {
      "type": "string",
      "enum": ["draft", "reviewed", "published", "archived"]
    },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
  }
}
```

---

### 11.2 HomeworkQuestion

```json
{
  "$id": "https://avab.edu.vn/schemas/homework/HomeworkQuestion.json",
  "title": "HomeworkQuestion",
  "type": "object",
  "required": ["question_id", "homework_id", "section", "type", "difficulty", "content", "answer"],
  "properties": {
    "question_id": {
      "type": "string",
      "pattern": "^HW-[A-Z]+-G[1-9]-U[0-9]{2}-L[0-9]{2}-[0-9]{8}-[AB][0-9]+$",
      "example": "HW-MATH-G3-U04-L12-20260704-B5"
    },
    "homework_id":    { "type": "string" },
    "section":        { "type": "string", "enum": ["A", "B", "C"] },
    "order_in_section": { "type": "integer", "minimum": 1 },
    "type": {
      "type": "string",
      "enum": ["MCQ", "FIB", "TF", "OE", "MATCH", "ORDER", "DRAW", "WORD", "GAME", "CODE"]
    },
    "difficulty": {
      "type": "string",
      "enum": ["easy", "medium", "hard", "challenge"]
    },
    "content": {
      "type": "object",
      "required": ["text"],
      "properties": {
        "text":   { "type": "string" },
        "images": { "type": "array", "items": { "type": "string", "format": "uri" } },
        "audio":  { "type": "string", "format": "uri" },
        "options": {
          "type": "array",
          "description": "For MCQ/MATCH",
          "items": {
            "type": "object",
            "properties": {
              "label":   { "type": "string" },
              "content": { "type": "string" },
              "image":   { "type": "string", "format": "uri" }
            }
          }
        }
      }
    },
    "answer": {
      "type": "object",
      "required": ["correct"],
      "properties": {
        "correct":       { },
        "correct_label": { "type": "string" },
        "tolerance":     { "type": "number", "description": "For numeric answers" },
        "rubric":        { "type": "object" }
      }
    },
    "skills_assessed": {
      "type": "array",
      "items": { "type": "string" },
      "example": ["fraction.addition", "fraction.same_denominator"]
    },
    "bloom_level": {
      "type": "string",
      "enum": ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    },
    "estimated_time_seconds": { "type": "integer" },
    "max_score":  { "type": "number" },
    "hint_ids":   { "type": "array", "items": { "type": "string" } },
    "isomorphic_question_ids": {
      "type": "array",
      "description": "IDs of similar questions for retry",
      "items": { "type": "string" }
    },
    "competition_source": { "type": "string", "example": "IMAS-2024-Q3" }
  }
}
```

---

### 11.3 Solution

```json
{
  "$id": "https://avab.edu.vn/schemas/homework/Solution.json",
  "title": "Solution",
  "type": "object",
  "required": ["solution_id", "question_id", "steps"],
  "properties": {
    "solution_id":  { "type": "string" },
    "question_id":  { "type": "string" },
    "analysis": {
      "type": "object",
      "properties": {
        "given":    { "type": "array", "items": { "type": "string" } },
        "find":     { "type": "string" },
        "concept":  { "type": "string" }
      }
    },
    "plan": {
      "type": "object",
      "properties": {
        "approach": { "type": "string" },
        "formula":  { "type": "string" }
      }
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_number":  { "type": "integer" },
          "description":  { "type": "string" },
          "expression":   { "type": "string" },
          "result":       { "type": "string" },
          "image":        { "type": "string", "format": "uri" }
        }
      }
    },
    "verification": {
      "type": "object",
      "properties": {
        "method":  { "type": "string" },
        "check":   { "type": "string" },
        "result":  { "type": "string" }
      }
    },
    "common_mistakes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "mistake":     { "type": "string" },
          "why_wrong":   { "type": "string" },
          "how_to_avoid": { "type": "string" }
        }
      }
    },
    "partial_credit_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "condition":       { "type": "string" },
          "credit_fraction": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      }
    }
  }
}
```

---

### 11.4 ParentNote

```json
{
  "$id": "https://avab.edu.vn/schemas/homework/ParentNote.json",
  "title": "ParentNote",
  "type": "object",
  "required": ["note_id", "homework_id", "lesson_summary", "support_tips", "estimated_time", "if_struggling"],
  "properties": {
    "note_id":      { "type": "string" },
    "homework_id":  { "type": "string" },
    "lesson_summary": {
      "type": "string",
      "minLength": 20,
      "maxLength": 300,
      "description": "2-3 câu, ngôn ngữ phụ huynh"
    },
    "support_tips": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "items": { "type": "string", "maxLength": 150 }
    },
    "estimated_time": {
      "type": "string",
      "example": "Khoảng 20–25 phút"
    },
    "if_struggling": {
      "type": "string",
      "maxLength": 200,
      "description": "1 gợi ý cụ thể, actionable"
    },
    "encouragement": {
      "type": "string",
      "maxLength": 150
    },
    "total_word_count": {
      "type": "integer",
      "maximum": 150,
      "description": "Auto-computed; must be ≤ 150"
    }
  }
}
```

---

### 11.5 StudentSubmission

```json
{
  "$id": "https://avab.edu.vn/schemas/homework/StudentSubmission.json",
  "title": "StudentSubmission",
  "type": "object",
  "required": ["submission_id", "homework_id", "student_id", "submitted_at", "answers"],
  "properties": {
    "submission_id":  { "type": "string" },
    "homework_id":    { "type": "string" },
    "student_id":     { "type": "string" },
    "attempt_number": { "type": "integer", "minimum": 1, "maximum": 2 },
    "submitted_at":   { "type": "string", "format": "date-time" },
    "latency_tier":   { "type": "string", "enum": ["on_time", "late1", "late2", "late3", "very_late"] },
    "total_time_minutes": { "type": "number" },
    "device_type":    { "type": "string", "enum": ["mobile", "tablet", "desktop"] },
    "answers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question_id":       { "type": "string" },
          "answer_given":      { },
          "is_correct":        { "type": "boolean" },
          "score_earned":      { "type": "number" },
          "attempt_count":     { "type": "integer" },
          "time_spent_sec":    { "type": "integer" },
          "hints_used":        { "type": "array", "items": { "type": "string" } },
          "error_type":        { "type": "string", "enum": ["computation", "conceptual", "careless", "timeout", "none"] }
        }
      }
    },
    "scores": {
      "type": "object",
      "properties": {
        "base_score":      { "type": "number" },
        "timing_multiplier": { "type": "number" },
        "completion_bonus":  { "type": "number" },
        "challenge_bonus":   { "type": "number" },
        "final_score":       { "type": "number" }
      }
    },
    "bkt_updates": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "skill_id":            { "type": "string" },
          "p_mastery_before":    { "type": "number" },
          "p_mastery_after":     { "type": "number" }
        }
      }
    }
  }
}
```

---

### 11.6 AIHint

```json
{
  "$id": "https://avab.edu.vn/schemas/homework/AIHint.json",
  "title": "AIHint",
  "type": "object",
  "required": ["hint_id", "question_id", "level", "message"],
  "properties": {
    "hint_id":     { "type": "string", "pattern": "^HINT-.*-L[1-5]$" },
    "question_id": { "type": "string" },
    "level": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "description": "1=Orientation, 2=Concept Link, 3=Process Hint, 4=Worked Example, 5=Step-by-step"
    },
    "trigger": {
      "type": "string",
      "enum": ["student_request", "wrong_answer_2", "wrong_answer_3", "idle_3min", "error_pattern"]
    },
    "message": { "type": "string" },
    "message_type": {
      "type": "string",
      "enum": ["text", "text+image", "text+animation", "text+audio"]
    },
    "follow_up_prompt": { "type": "string" },
    "concept_tag":      { "type": "string" },
    "is_answer_reveal": { "type": "boolean", "default": false },
    "shown_to_student_id": { "type": "string" },
    "shown_at":            { "type": "string", "format": "date-time" },
    "resulted_in_correct": { "type": "boolean" }
  }
}
```

---

## 12. Database Design

### 12.1 Entity Relationship Overview

```
homework_sets ─────────┬── homework_questions ──┬── solutions
      │                │                        └── ai_hints
      │                └── parent_notes
      │
      └── student_submissions ──── homework_analytics
                │
                └── submission_answers ──── bkt_updates
```

---

### 12.2 Table: homework_sets

```sql
CREATE TABLE homework_sets (
  homework_id          VARCHAR(60)   PRIMARY KEY,
  title                VARCHAR(120)  NOT NULL,
  subject              ENUM('math','english','cs') NOT NULL,
  grade                TINYINT(1)    NOT NULL CHECK (grade BETWEEN 1 AND 9),
  lesson_id            VARCHAR(30)   NOT NULL,
  lesson_title         VARCHAR(120),
  academic_week        CHAR(8),                  -- 2026-W27
  assigned_date        DATE          NOT NULL,
  due_date             DATETIME      NOT NULL,
  estimated_time_min   SMALLINT      NOT NULL,
  easy_pct             TINYINT       NOT NULL,
  medium_pct           TINYINT       NOT NULL,
  hard_pct             TINYINT       NOT NULL,
  challenge_pct        TINYINT       DEFAULT 0,
  total_questions      SMALLINT      NOT NULL,
  section_a_count      SMALLINT      NOT NULL,
  section_b_count      SMALLINT      NOT NULL,
  section_c_count      SMALLINT      DEFAULT 0,
  challenge_bonus_pts  DECIMAL(5,2)  DEFAULT 0,
  curriculum_tags      JSON,         -- ["fraction.basic", ...]
  competition_tags     JSON,         -- ["IMC-Level-1", ...]
  author_id            VARCHAR(20)   NOT NULL,
  reviewed_by          VARCHAR(20),
  version              VARCHAR(10)   DEFAULT '1.0',
  status               ENUM('draft','reviewed','published','archived') DEFAULT 'draft',
  qa_passed_at         DATETIME,
  published_at         DATETIME,
  created_at           DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_lesson     (lesson_id),
  INDEX idx_subject_grade (subject, grade),
  INDEX idx_status     (status),
  INDEX idx_assigned   (assigned_date)
);
```

---

### 12.3 Table: homework_questions

```sql
CREATE TABLE homework_questions (
  question_id           VARCHAR(80)   PRIMARY KEY,
  homework_id           VARCHAR(60)   NOT NULL,
  section               ENUM('A','B','C') NOT NULL,
  order_in_section      TINYINT       NOT NULL,
  type                  ENUM('MCQ','FIB','TF','OE','MATCH','ORDER','DRAW','WORD','GAME','CODE') NOT NULL,
  difficulty            ENUM('easy','medium','hard','challenge') NOT NULL,
  content_text          TEXT          NOT NULL,
  content_images        JSON,         -- array of URIs
  content_audio         VARCHAR(500),
  options               JSON,         -- for MCQ, MATCH
  correct_answer        JSON          NOT NULL,
  answer_tolerance      DECIMAL(10,4),
  rubric                JSON,
  skills_assessed       JSON          NOT NULL,  -- ["fraction.basic"]
  bloom_level           ENUM('remember','understand','apply','analyze','evaluate','create') NOT NULL,
  estimated_time_sec    SMALLINT,
  max_score             DECIMAL(5,2)  DEFAULT 1.0,
  hint_ids              JSON,         -- ordered array of hint_ids
  isomorphic_ids        JSON,         -- for retry
  competition_source    VARCHAR(100),
  question_bank_id      VARCHAR(80),  -- link to global question bank

  FOREIGN KEY (homework_id) REFERENCES homework_sets(homework_id),
  INDEX idx_hw_section  (homework_id, section),
  INDEX idx_difficulty  (difficulty),
  INDEX idx_skills      ((CAST(skills_assessed AS CHAR(500))))
);
```

---

### 12.4 Table: solutions

```sql
CREATE TABLE solutions (
  solution_id     VARCHAR(80)   PRIMARY KEY,
  question_id     VARCHAR(80)   NOT NULL UNIQUE,
  given_data      JSON,         -- array of strings
  find_statement  TEXT,
  concept_used    VARCHAR(200),
  plan_approach   TEXT,
  plan_formula    TEXT,
  steps           JSON          NOT NULL,
  -- [{"step_number":1, "description":"...", "expression":"...", "result":"..."}]
  verification    JSON,
  common_mistakes JSON,
  partial_credit_rules JSON,
  author_id       VARCHAR(20),
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (question_id) REFERENCES homework_questions(question_id),
  INDEX idx_question (question_id)
);
```

---

### 12.5 Table: parent_notes

```sql
CREATE TABLE parent_notes (
  note_id           VARCHAR(80)   PRIMARY KEY,
  homework_id       VARCHAR(60)   NOT NULL UNIQUE,
  lesson_summary    TEXT          NOT NULL,
  support_tips      JSON          NOT NULL,  -- array of strings
  estimated_time    VARCHAR(50)   NOT NULL,
  if_struggling     TEXT          NOT NULL,
  encouragement     TEXT,
  word_count        SMALLINT      NOT NULL,
  created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (homework_id) REFERENCES homework_sets(homework_id),
  CONSTRAINT chk_word_count CHECK (word_count <= 150)
);
```

---

### 12.6 Table: student_submissions

```sql
CREATE TABLE student_submissions (
  submission_id       VARCHAR(100)  PRIMARY KEY,
  homework_id         VARCHAR(60)   NOT NULL,
  student_id          VARCHAR(30)   NOT NULL,
  attempt_number      TINYINT       DEFAULT 1,
  submitted_at        DATETIME      NOT NULL,
  latency_tier        ENUM('on_time','late1','late2','late3','very_late') NOT NULL,
  total_time_min      DECIMAL(6,2),
  device_type         ENUM('mobile','tablet','desktop','unknown'),
  base_score          DECIMAL(6,2),
  timing_multiplier   DECIMAL(4,3),
  completion_bonus    DECIMAL(4,2)  DEFAULT 0,
  challenge_bonus     DECIMAL(4,2)  DEFAULT 0,
  final_score         DECIMAL(6,2),
  completion_rate     DECIMAL(5,2),  -- % câu đã làm
  accuracy_rate       DECIMAL(5,2),  -- % câu đúng first attempt
  section_a_accuracy  DECIMAL(5,2),
  section_b_accuracy  DECIMAL(5,2),
  challenge_attempted BOOLEAN       DEFAULT FALSE,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (homework_id) REFERENCES homework_sets(homework_id),
  UNIQUE KEY uk_student_hw_attempt (homework_id, student_id, attempt_number),
  INDEX idx_student    (student_id),
  INDEX idx_homework   (homework_id),
  INDEX idx_submitted  (submitted_at)
);
```

---

### 12.7 Table: submission_answers

```sql
CREATE TABLE submission_answers (
  answer_id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
  submission_id       VARCHAR(100)  NOT NULL,
  question_id         VARCHAR(80)   NOT NULL,
  answer_given        JSON,
  is_correct          BOOLEAN,
  score_earned        DECIMAL(5,2),
  attempt_count       TINYINT       DEFAULT 1,
  time_spent_sec      SMALLINT,
  hints_used          JSON,         -- array of hint_ids used
  hint_count          TINYINT       DEFAULT 0,
  error_type          ENUM('computation','conceptual','careless','timeout','none') DEFAULT 'none',
  first_attempt_correct BOOLEAN,
  final_correct       BOOLEAN,

  FOREIGN KEY (submission_id) REFERENCES student_submissions(submission_id),
  INDEX idx_submission (submission_id),
  INDEX idx_question   (question_id)
);
```

---

### 12.8 Table: ai_hints

```sql
CREATE TABLE ai_hints (
  hint_id             VARCHAR(100)  PRIMARY KEY,
  question_id         VARCHAR(80)   NOT NULL,
  level               TINYINT       NOT NULL CHECK (level BETWEEN 1 AND 5),
  trigger_type        ENUM('student_request','wrong_answer_2','wrong_answer_3','idle_3min','error_pattern') NOT NULL,
  message             TEXT          NOT NULL,
  message_type        ENUM('text','text+image','text+animation','text+audio') DEFAULT 'text',
  follow_up_prompt    TEXT,
  concept_tag         VARCHAR(100),
  is_answer_reveal    BOOLEAN       DEFAULT FALSE,
  created_at          DATETIME      DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_question_level (question_id, level)
);

CREATE TABLE hint_usage_log (
  log_id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
  hint_id             VARCHAR(100)  NOT NULL,
  submission_id       VARCHAR(100)  NOT NULL,
  student_id          VARCHAR(30)   NOT NULL,
  shown_at            DATETIME      NOT NULL,
  resulted_in_correct BOOLEAN,

  INDEX idx_student_hint (student_id, hint_id),
  INDEX idx_submission   (submission_id)
);
```

---

### 12.9 Table: homework_analytics

```sql
CREATE TABLE homework_analytics (
  analytics_id        BIGINT        AUTO_INCREMENT PRIMARY KEY,
  homework_id         VARCHAR(60)   NOT NULL,
  class_id            VARCHAR(30),
  snapshot_date       DATE          NOT NULL,
  total_students      SMALLINT,
  submitted_count     SMALLINT,
  on_time_count       SMALLINT,
  late_count          SMALLINT,
  not_submitted_count SMALLINT,
  avg_score           DECIMAL(5,2),
  avg_time_min        DECIMAL(6,2),
  avg_accuracy        DECIMAL(5,2),
  section_a_avg       DECIMAL(5,2),
  section_b_avg       DECIMAL(5,2),
  challenge_attempt_rate DECIMAL(5,2),
  most_missed_question VARCHAR(80),
  most_used_hint_level TINYINT,
  alert_triggered     BOOLEAN       DEFAULT FALSE,
  alert_details       JSON,

  UNIQUE KEY uk_hw_class_date (homework_id, class_id, snapshot_date),
  INDEX idx_homework  (homework_id),
  INDEX idx_class     (class_id)
);
```

---

## 13. Admin UI Design (Wireframe Text)

### 13.1 Homework Generator (Lesson → Draft)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 AvaB Admin > Homework > New Homework                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP 1: Select Lesson                                      │
│  ┌──────────────────────────┐  ┌───────────┐               │
│  │ [Search lesson...]       │  │ [Browse]  │               │
│  └──────────────────────────┘  └───────────┘               │
│  ▶ MATH-G3-U04-L12: Phân số và phần bằng nhau             │
│                                                             │
│  STEP 2: Auto-Generate Options                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Grade: Lớp 3     Subject: Toán                      │   │
│  │ Total Qs: [20 ▾]  Time: [20-25 min ▾]               │   │
│  │ Difficulty: [Standard ▾]  (Easy 50/Med 35/Hard 15)  │   │
│  │ Include Section C: [ ] (Optional Challenge)          │   │
│  │ Assign date: [2026-07-04]  Due: [2026-07-05 23:59]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ 🤖 Auto-Generate Draft ]  [ 📋 Start Blank ]            │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  ⚡ AI sẽ kéo câu từ Question Bank theo BKT priority       │
│     và Spaced Repetition schedule                           │
└─────────────────────────────────────────────────────────────┘
```

---

### 13.2 Question Editor

```
┌─────────────────────────────────────────────────────────────┐
│  Section A — Câu A3                         [EASY · FIB]    │
├─────────────────────────────────────────────────────────────┤
│  📝 Nội dung câu hỏi                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Số nào lớn hơn: 1/2 hay 1/4 ? Điền vào ô trống:   │   │
│  │ ___ > ___                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  [+ Thêm hình ảnh]  [+ Thêm audio]                         │
│                                                             │
│  🎯 Đáp án đúng                                             │
│  ┌─────────────────┐                                        │
│  │ 1/2 > 1/4       │                                        │
│  └─────────────────┘                                        │
│                                                             │
│  🏷 Tags                                                    │
│  [fraction.compare ×] [fraction.basic ×] [+ thêm tag]      │
│                                                             │
│  ⏱ Ước tính: [45] giây   📊 Bloom's: [Understand ▾]       │
│                                                             │
│  [ ← Câu trước ] [ Câu tiếp → ]  [🗑 Xóa] [💾 Lưu]       │
└─────────────────────────────────────────────────────────────┘
```

---

### 13.3 Solution Editor

```
┌─────────────────────────────────────────────────────────────┐
│  Solution Editor — Câu B5 [HARD · WORD]                     │
├──────────────┬──────────────────────────────────────────────┤
│  📋 OUTLINE  │  📖 EDITOR                                   │
│              │                                              │
│  ✅ Phân tích│  🔍 PHÂN TÍCH                               │
│  ✅ Kế hoạch │  Cho biết: [ Tô màu 3/8 hình... ]           │
│  ✅ Thực hiện│  Hỏi:     [ Còn lại bao nhiêu? ]            │
│  ✅ Kiểm tra │  Khái niệm: [ fraction.subtraction ]         │
│  ⚠ Lỗi thường│                                              │
│    gặp       │  📐 KẾ HOẠCH                                │
│              │  [ 1 - 3/8 = ... ]                           │
│              │                                              │
│              │  ✏ THỰC HIỆN                                │
│              │  Bước 1: [ 1 = 8/8 ]    → [ 8/8 ]          │
│              │  Bước 2: [ 8/8 - 3/8 ] → [ 5/8 ]           │
│              │  [+ Thêm bước]                               │
│              │                                              │
│              │  ✅ KIỂM TRA                                 │
│              │  [ 3/8 + 5/8 = 8/8 = 1 ✓ ]                 │
│              │                                              │
│              │  ⚠ LỖI THƯỜNG GẶP                           │
│              │  [ Nhầm 1 = 1/8 thay vì 1 = 8/8 ]          │
└──────────────┴──────────────────────────────────────────────┘
│  [👁 Preview]  [💾 Lưu]  [✅ Đánh dấu hoàn thành]          │
└─────────────────────────────────────────────────────────────┘
```

---

### 13.4 Preview (Student View / Parent View)

```
┌─────────────────────────────────────────────────────────────┐
│  👁 Preview Mode   [Student View] [Parent View] [Print]     │
├──────────────────────────┬──────────────────────────────────┤
│   STUDENT VIEW           │   PARENT VIEW                    │
│                          │                                  │
│  📚 Bài tập về nhà       │  👨‍👩‍👧 Gửi Ba/Mẹ                │
│  Phân số (Lớp 3)         │                                  │
│  ⏱ ~20 phút              │  📚 Hôm nay con học gì?         │
│                          │  Con đang học chia đều...        │
│  ── Section A ──         │                                  │
│  📌 Ôn tập               │  🤝 Ba/mẹ có thể...             │
│                          │  • Khi ăn, hỏi con...           │
│  A1. Số nào lớn hơn?    │  • Để con tự dùng thước...      │
│  ○ 1/3                   │                                  │
│  ○ 1/4                   │  ⏱ Khoảng 20–25 phút            │
│  ● 1/2                   │                                  │
│                          │  🆘 Nếu con gặp khó:            │
│  [Gợi ý] [Bỏ qua]        │  Thử lấy tờ giấy gấp đôi...    │
└──────────────────────────┴──────────────────────────────────┘
```

---

### 13.5 QA Check Panel

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ QA Check — HW-MATH-G3-U04-L12-20260704                  │
├─────────────────────────────────────────────────────────────┤
│  STRUCTURE                    CONTENT                       │
│  ✅ Metadata đầy đủ           ✅ Tất cả câu có đáp án       │
│  ✅ Section A (7 câu)         ✅ HARD câu có solution        │
│  ✅ Section B (13 câu)        ✅ Parent Note ≤ 150 words     │
│  ⚠  Section C: không có      ✅ Ít nhất 1 OE câu           │
│     (OK nếu không cần)        ✅ Ít nhất 3 dạng bài         │
│                               ✅ Không quá 60% MCQ          │
│  DIFFICULTY                   ⚠  Câu B7: chưa có image      │
│  ✅ Easy 50% (10 câu)                                        │
│  ✅ Medium 35% (7 câu)        TIMING                        │
│  ✅ Hard 15% (3 câu)          ✅ Est. time: 22 phút (OK)    │
│  ✅ Section A: không có HARD  ✅ Due date hợp lệ            │
│                               ✅ Weekend extension áp dụng  │
│  ─────────────────────────────────────────────────────     │
│  Score: 28/30 checks passed ⚠ 2 warnings                   │
│                                                             │
│  [🔧 Sửa ngay]  [⚠ Bỏ qua warnings]  [✅ Approve & Publish]│
└─────────────────────────────────────────────────────────────┘
```

---

### 13.6 Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Homework Analytics — Lớp 3A · Tuần 27/2026             │
├──────────────────────────────────────────────────────────────┤
│  OVERVIEW                                                    │
│  Submitted: 22/25 (88%)  On-time: 18/22 (82%)              │
│  Avg Score: 76.3         Avg Time: 19.2 min                │
│                                                             │
│  QUESTION PERFORMANCE                                        │
│  ████████████ A1 — 95% correct                              │
│  ██████████░░ A2 — 82% correct                              │
│  ████████░░░░ B4 — 67% correct                              │
│  ███████░░░░░ B7 — 58% correct ⚠                           │
│  █████░░░░░░░ B9 — 43% correct 🚨 (ALERT TRIGGERED)        │
│                                                             │
│  STRUGGLING STUDENTS 🚨                                      │
│  • Nguyễn Văn A — B9 sai 4 lần; hints L4 used              │
│  • Trần Thị B — Accuracy 38% overall                        │
│                                                             │
│  HINT ANALYSIS                                               │
│  Most used: L2 (Concept Link) — 34 times                   │
│  L5 used: 8 times (B9, B7)                                 │
│                                                             │
│  [📥 Export CSV]  [📧 Alert Teachers]  [🔍 Drill Down]      │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. Workflow

### 14.1 Full Homework Lifecycle

```
                    AUTHORING PHASE
                    ─────────────
    Lesson Complete
         │
         ▼
    ┌─────────────────────────────┐
    │  1. AUTO-GENERATE DRAFT     │
    │  - BKT pulls review topics  │
    │  - Question bank selection  │
    │  - Section A/B distribution │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  2. TEACHER REVIEW          │
    │  - Edit questions           │
    │  - Adjust difficulty        │
    │  - Add/remove questions     │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  3. ADD SOLUTIONS           │
    │  - Write solution guide     │
    │  - Add common mistake hints │
    │  - Set partial credit rules │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  4. WRITE PARENT NOTE       │
    │  - Lesson summary (≤150w)   │
    │  - Support tips             │
    │  - If-struggling hint       │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  5. QA CHECK                │
    │  - Auto: 30+ checks         │
    │  - Human: spot review       │
    │  - Fix warnings             │
    │  - APPROVE                  │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  6. PUBLISH                 │
    │  - Status → published       │
    │  - Notify students (push)   │
    │  - Notify parents (push)    │
    │  - BKT snapshot taken       │
    └───────────┬─────────────────┘
                │
              DELIVERY PHASE
              ─────────────
                │
                ▼
    ┌─────────────────────────────┐
    │  7. STUDENT SUBMISSION      │
    │  - HS mở bài, làm Section A │
    │  - AI monitors timing       │
    │  - Hint triggered as needed │
    │  - HS làm Section B         │
    │  - Optional: Section C      │
    │  - Submit                   │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  8. AI TUTOR SUPPORT        │
    │  - Real-time hint delivery  │
    │  - Level escalation L1→L5   │
    │  - Error pattern detection  │
    │  - Micro-lesson if needed   │
    └───────────┬─────────────────┘
                │
              ANALYTICS PHASE
              ───────────────
                │
                ▼
    ┌─────────────────────────────┐
    │  9. AUTO-SCORING            │
    │  - Score per question       │
    │  - Partial credit applied   │
    │  - Timing multiplier        │
    │  - Final score computed     │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  10. BKT UPDATE             │
    │  - P(mastery) updated       │
    │  - Review queue recalculated│
    │  - Next HW Section A primed │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  11. ALERTS & ANALYTICS     │
    │  - Struggling student alert │
    │  - Class analytics snapshot │
    │  - Teacher dashboard update │
    │  - Parent progress update   │
    └───────────┬─────────────────┘
                │
                ▼
    ┌─────────────────────────────┐
    │  12. FEEDBACK LOOP          │
    │  - Teacher reviews alerts   │
    │  - Adjust next lesson if    │
    │    class struggles          │
    │  - Question bank quality    │
    │    rating updated           │
    │  - Section A for next HW    │
    │    auto-adjusted by BKT     │
    └─────────────────────────────┘
```

### 14.2 Timing Targets Per Phase

| Phase | Target Time | Owner |
|---|---|---|
| Auto-generate draft | < 30 giây | System |
| Teacher review | 10–15 phút | Giáo viên |
| Add solutions | 20–30 phút | Giáo viên |
| Write parent note | 5–10 phút | Giáo viên |
| QA check | 5 phút auto + 5 phút human | QA + Giáo viên |
| Publish | < 10 giây | System |
| Student submission | Theo thời gian làm bài | HS |
| Auto-scoring | < 5 giây sau submit | System |
| BKT update | < 10 giây | System |
| Alert delivery | < 60 giây sau trigger | System |
| **TOTAL (authoring)** | **~1 tiếng mỗi bộ homework** | |

---

## 15. QA Checklist — Homework

### 15.1 Cách Sử Dụng

QA Checklist gồm 30 items chia 6 nhóm. Mỗi item có 3 trạng thái:
- ✅ **PASS** — đạt yêu cầu
- ⚠ **WARNING** — có thể publish nhưng cần lưu ý
- ❌ **FAIL** — KHÔNG được publish, phải sửa

**[MUST]** Không publish khi có bất kỳ ❌ nào.  
**[SHOULD]** Không publish khi có > 3 ⚠ chưa được resolve.

---

### 15.2 Group 1: Metadata & Structure (6 items)

| # | Item | Tiêu chí PASS | Tiêu chí FAIL |
|---|------|--------------|---------------|
| 1 | Homework ID đúng format | Theo regex chuẩn | Sai format |
| 2 | Due date hợp lệ | > Assigned date; ≤ 72h | Đã qua hoặc > 72h |
| 3 | Section A tồn tại | ≥ 1 câu | Không có Section A |
| 4 | Section B tồn tại | ≥ 1 câu | Không có Section B |
| 5 | Total questions đúng | Bằng A+B+C | Sai số |
| 6 | Lesson link hợp lệ | lesson_id tồn tại trong DB | Orphan homework |

---

### 15.3 Group 2: Question Quality (8 items)

| # | Item | Tiêu chí PASS | Tiêu chí FAIL |
|---|------|--------------|---------------|
| 7 | 100% câu có đáp án | Mọi question có correct_answer | Bất kỳ câu nào thiếu |
| 8 | Section A không có HARD/CHALLENGE | 0 câu difficulty='hard' trong Section A | Có HARD trong A |
| 9 | Section C nếu có, là optional | is_optional=true | is_optional=false |
| 10 | Câu đầu tiên Section A là EASY | order_in_section=1, difficulty=easy | Câu 1 là MEDIUM+ |
| 11 | Không có 3 câu HARD liên tiếp | Không có run của 3+ HARD | Có run ≥ 3 |
| 12 | Số câu OE ≥ 1 trong Section B | ≥ 1 type=OE trong B | Không có OE |
| 13 | Dạng bài ≥ 3 loại | COUNT(DISTINCT type) ≥ 3 | < 3 loại |
| 14 | Không quá 60% cùng 1 dạng bài | Max one_type_pct ≤ 60% | > 60% |

---

### 15.4 Group 3: Solution Quality (6 items)

| # | Item | Tiêu chí PASS | Tiêu chí FAIL |
|---|------|--------------|---------------|
| 15 | HARD câu có solution | 100% HARD có solution_id | Bất kỳ HARD nào thiếu |
| 16 | CHALLENGE câu có solution | 100% CHALLENGE có solution | Bất kỳ CHALLENGE nào thiếu |
| 17 | WORD problem có solution | 100% WORD có solution | Bất kỳ WORD nào thiếu |
| 18 | OE câu có solution + rubric | solution + rubric JSON | Thiếu rubric |
| 19 | Solution có ít nhất 2 bước | steps.length ≥ 2 với HARD | Steps rỗng |
| 20 | Answer key khớp solution | Đáp án cuối solution = answer key | Mâu thuẫn |

---

### 15.5 Group 4: Parent Note Quality (5 items)

| # | Item | Tiêu chí PASS | Tiêu chí FAIL |
|---|------|--------------|---------------|
| 21 | Parent Note tồn tại | parent_note record exists | Không có |
| 22 | ≤ 150 words | word_count ≤ 150 | > 150 words |
| 23 | support_tips ≥ 1 | Array not empty | Empty array |
| 24 | if_struggling có nội dung | len > 20 chars | Rỗng hoặc quá ngắn |
| 25 | Không dùng từ cấm | Không có "phạt", "kiểm tra" (negative connotation) | Có từ cấm |

---

### 15.6 Group 5: Difficulty & Timing (3 items)

| # | Item | Tiêu chí PASS | Tiêu chí FAIL |
|---|------|--------------|---------------|
| 26 | Difficulty profile đúng grade | % match ±10% vs standard §3.1 | Lệch > 10% |
| 27 | Estimated time trong range | Trong range của grade §3.1 | Ngoài range |
| 28 | Tổng time Section A ≤ 30% | SUM(A.estimated_time) / total ≤ 30% | > 30% |

---

### 15.7 Group 6: AI Hints & Competition Tags (4 items)

| # | Item | Tiêu chí PASS | Tiêu chí FAIL |
|---|------|--------------|---------------|
| 29 | HARD câu có ≥ 2 hints | hint_count ≥ 2 với HARD | < 2 hints |
| 30 | Hint levels tuần tự | Levels liên tục từ 1 | Skip levels (e.g. L1, L3) |
| 31 | Không có hint is_answer_reveal=true trong L1-L3 | Chỉ L4-L5 có thể reveal | L1-L3 reveal |
| 32 | Competition tags nếu có Section C | Ít nhất 1 competition tag | Section C không có tag |

---

### 15.8 QA Score Summary

```
QA Score = (PASS items) / 32 × 100

Thang điểm:
  100%         = ✅ Perfect — Publish ngay
  94–99% (30-31 PASS, 0 FAIL) = ✅ Publish với warnings
  < 94% hoặc có bất kỳ FAIL  = ❌ KHÔNG publish — phải sửa

Thời gian QA mục tiêu:
  Auto check: < 5 giây
  Human review (spot check 10 câu): 5–10 phút
  Tổng: < 15 phút per homework set
```

---

## Appendix A: Danh Sách Từ Cấm Trong Parent Note

| Từ/Cụm từ | Lý do | Thay bằng |
|---|---|---|
| "kiểm tra" | Tạo áp lực | "cùng xem" |
| "phải làm xong" | Bắt buộc | "cố gắng hoàn thành" |
| "điểm kém" | Phán xét | "cần thêm luyện tập" |
| "sai" (đơn lẻ) | Tiêu cực | "thử lại" |
| "phạt" | Trừng phạt | (bỏ hoàn toàn) |
| "bắt buộc" | Áp lực | "nên thử" |
| "dễ thôi mà" | Giảm giá trị | (bỏ hoàn toàn) |
| "nếu không làm sẽ..." | Đe dọa | (bỏ hoàn toàn) |

---

## Appendix B: Competition Alignment Map

| Standard | Phạm vi lớp | Dạng câu phù hợp | Section |
|---|---|---|---|
| **IMC Level 1** | Lớp 1–3 | MCQ, FIB, WORD đơn giản | Section B |
| **IMC Level 2** | Lớp 4–6 | WORD multi-step, OE | Section B + C |
| **IMAS Junior** | Lớp 4–6 | WORD, pattern recognition | Section C |
| **IMAS Senior** | Lớp 7–9 | Proof-like, combinatorics | Section C |
| **MIMO** | Lớp 5–9 | Logic, creative problem | Section C |
| **AMC 8** | Lớp 6–8 | MCQ olympiad style | Section C |
| **AMC 10** | Lớp 8–9 | Advanced MCQ | Section C |

---

## Appendix C: Revision History

| Version | Ngày | Thay đổi | Người thực hiện |
|---|---|---|---|
| v1.0 | 2026-07-04 | Phát hành lần đầu | AvaB Academic Team |

---

> **Document Owner:** AvaB Academic Standards Team  
> **Next Review:** Q4/2026 (sau 1 kỳ học triển khai thực tế)  
> **Contact:** academic@avab.edu.vn  
> **License:** AvaB Internal — Confidential

---

*AvaB Homework Standard v1.0 © 2026 AvaB Learning System. All rights reserved.*
